'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const ROOT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(ROOT,name));

/** @param {0|1} seat @param {string} attackerPrinting @param {string} energyPrinting */
function stage(seat,attackerPrinting,energyPrinting){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {GameSettings}=native('game/core/game-settings');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {EnergyCard}=native('game/store/card/energy-card');
  const {Stage,EnergyType,CardType,SpecialCondition,Format}=
    native('game/store/card/card-types');
  const {PowerType}=native('game/store/card/pokemon-types');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,PowerType,SpecialCondition
  });
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const settings=new GameSettings();
  settings.format=Format.EXPANDED;
  state.gameSettings=settings;
  state.rules=settings.rules;
  assert.equal(state.rules.attackFirstTurn,false,
    'The genuine pinned Store must enforce first-player attack restrictions');
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=1;
  state.activePlayer=seat;
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  owner.name='first-turn-owner';opponent.name='defender';
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  let id=67000;
  const card=printing=>{
    const found=manager.getCardByName(printing);
    assert.ok(found,'Missing pinned print '+printing);
    found.id=id++;
    return found;
  };
  owner.active.cards.push(card(attackerPrinting));
  owner.hand.cards.push(card(energyPrinting));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for(const player of state.players){
    for(let i=0;i<14;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,opponent,catalog,seat};
}

for(const caseInfo of [
  {printing:'Talonflame V VIV',energy:'Fire Energy SVE',
    attack:'Fast Flight',expectedHand:6,expectedDeck:8,expectedDamage:0},
  {printing:'Latios-EX ROS',energy:'Psychic Energy SVE',
    attack:'Fast Raid',expectedHand:0,expectedDeck:14,expectedDamage:40}
])for(const seat of [0,1]){
  test('native first-player exception '+caseInfo.attack+', physical seat '+seat,()=>{
    const {store,state,owner,opponent,catalog}=stage(
      seat,caseInfo.printing,caseInfo.energy);
    const attack=owner.active.getPokemonCard().attacks[0];
    assert.equal(attack.name,caseInfo.attack);
    assert.equal(attack.canUseOnFirstTurn,true);
    const view=actorObservation(state,seat);
    assert.equal(view.ownPublic.active.attacks[0].canUseOnFirstTurn,true);
    const initial=chooseActorRootIntent(view,catalog,{
      printedFirstTurnAttackRoot:true
    });
    assert.equal(initial.kind,'attach-basic-energy',
      'Unpowered first-player root must legally attach before attacking');
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    store.dispatch(new PlayCardAction(owner.id,initial.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    assert.equal(owner.active.energies.cards.length,1);
    assert.equal(owner.hand.cards.length,0);
    const postAttach=actorObservation(state,seat);
    assert.equal(chooseActorRootIntent(postAttach,catalog,{}).kind,'pass',
      'Default policy must preserve ordinary first-player attack prohibition');
    const chosen=chooseActorRootIntent(postAttach,catalog,{
      printedFirstTurnAttackRoot:true
    });
    assert.deepEqual(chosen,{kind:'attack',attackName:caseInfo.attack});
    const {AttackAction}=native('game/store/actions/game-actions');
    const {ResolvePromptAction}=
      native('game/store/actions/resolve-prompt-action');
    store.dispatch(new AttackAction(owner.id,chosen.attackName));
    for(let step=0;step<30&&state.turn===1;step++){
      const pending=state.prompts.find(p=>p.result===undefined);
      assert.ok(pending,'Pinned Store has stalled on first-player Fast Flight');
      assert.equal(pending.playerId,owner.id);
      assert.equal(pending.constructor.name,'WaitPrompt',
        'Unexpected owner prompt in native draw-six opening');
      store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    assert.equal(state.turn,2,'Native exception must complete the first turn');
    assert.equal(owner.deck.cards.length,caseInfo.expectedDeck);
    assert.equal(owner.hand.cards.length,caseInfo.expectedHand);
    assert.equal(opponent.active.damage,caseInfo.expectedDamage);
    assert.equal(state.players[seat],owner);
  });
}

for(const seat of [0,1]){
  test('genuine first-player Sableye Quick Hunt produces owner-only attack-phase deck search, seat '+seat,()=>{
    const {store,state,owner,catalog}=stage(
      seat,'Sableye LOT','Psychic Energy SVE');
    const view=actorObservation(state,seat);
    const first=chooseActorRootIntent(view,catalog,
      {printedFirstTurnAttackRoot:true});
    assert.equal(first.kind,'attach-basic-energy');
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    store.dispatch(new PlayCardAction(owner.id,first.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    const paid=chooseActorRootIntent(actorObservation(state,seat),catalog,{
      printedFirstTurnAttackRoot:true
    });
    assert.deepEqual(paid,{kind:'attack',attackName:'Quick Hunt'});
    const {AttackAction}=native('game/store/actions/game-actions');
    const {ResolvePromptAction}=
      native('game/store/actions/resolve-prompt-action');
    store.dispatch(new AttackAction(owner.id,paid.attackName));
    let prompt=null;
    for(let step=0;step<20;step++){
      prompt=state.prompts.find(p=>p.result===undefined);
      assert.ok(prompt,'Native Quick Hunt search must leave a live prompt');
      if(prompt.constructor.name==='ChooseCardsPrompt')break;
      assert.equal(prompt.constructor.name,'WaitPrompt');
      store.dispatch(new ResolvePromptAction(prompt.id,null));
    }
    assert.equal(prompt.constructor.name,'ChooseCardsPrompt');
    assert.equal(prompt.playerId,owner.id);
    assert.strictEqual(prompt.cards,owner.deck);
    assert.equal(prompt.message,'CHOOSE_CARD_TO_HAND');
    assert.equal(state.phase,native('game/store/state/state').GamePhase.ATTACK);
    const {actorSingleSearchInput}=require(
      '../simulation/twinleaf/agent41-actor-owner-single-search.cjs');
    const projected=actorSingleSearchInput(state,seat);
    assert.ok(projected,'Production deck-search projection is well-defined even in attack phase');
    assert.equal(projected.actor.decisionKind,'owner-prompt');
    assert.equal(projected.prompt.source,'own-deck');
    assert.equal(projected.prompt.offered.length,14);
    assert.equal(projected.prompt.canCancel,false);

    // Bridge only the AddPlayerAction authentication handshake; the pending
    // prompt, chosen cards and ResolvePromptAction still belong to the
    // original live native Store and are dispatched through it.
    class AddPlayerAction{}
    class BridgeStore{
      constructor(original){this.original=original;this.state=original.state;}
      dispatch(action){
        if(action instanceof AddPlayerAction)return this.state;
        return this.original.dispatch(action);
      }
    }
    class OwnerBot{
      constructor(id){this.client={id};}
      decodeNextAction(){return 'GENERIC_FALLBACK';}
    }
    const {withActorOwnerSingleSearch}=require(
      '../simulation/twinleaf/agent41-actor-owner-single-search.cjs');
    const {audit}=withActorOwnerSingleSearch(()=>{
      const bridge=new BridgeStore(store);
      bridge.dispatch(new AddPlayerAction());
      const next=new OwnerBot(owner.id).decodeNextAction(state);
      assert.ok(next instanceof ResolvePromptAction,
        'Owner-authenticated search intent must become native resolution');
      assert.equal(next.id,prompt.id);
      bridge.dispatch(next);
    },{
      Store:BridgeStore,SimpleTacticsAi:OwnerBot,ResolvePromptAction,
      GamePhase:native('game/store/state/state').GamePhase,
      attackPhaseSearch:true
    });
    assert.equal(audit.attackPhaseSearchOptIn,true);
    assert.equal(audit.selected,1);
    assert.equal(audit.accepted,1);
    assert.equal(audit.nativePromptPostconditionsConfirmed,1);
    assert.equal(audit.bySeat[seat],1);
    assert.equal(owner.hand.cards.length,1,
      'Genuine pinned search effect must move one card into owner hand');
    assert.equal(owner.deck.cards.length,13);
  });
}

for(const seat of [0,1]){
  test('first-player Exeggcute attacks to evolve directly into genuine Stage 1 on native Store, seat '+seat,()=>{
    const {store,state,owner,catalog}=stage(
      seat,'Exeggcute SSP','Psychic Energy SVE');
    const manager=initializeCards();
    const nextStage=manager.getCardByName('Alolan Exeggutor ex SSP');
    assert.ok(nextStage);
    assert.equal(nextStage.evolvesFrom,'Exeggcute');
    owner.deck.cards[0]=nextStage;
    const first=chooseActorRootIntent(actorObservation(state,seat),catalog,{
      printedFirstTurnAttackRoot:true
    });
    assert.equal(first.kind,'attach-basic-energy');
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    store.dispatch(new PlayCardAction(owner.id,first.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    const attack=chooseActorRootIntent(actorObservation(state,seat),catalog,{
      printedFirstTurnAttackRoot:true
    });
    assert.deepEqual(attack,{kind:'attack',attackName:'Precocious Evolution'});
    const {AttackAction}=native('game/store/actions/game-actions');
    const {ResolvePromptAction}=
      native('game/store/actions/resolve-prompt-action');
    store.dispatch(new AttackAction(owner.id,attack.attackName));
    let pending=null;
    for(let step=0;step<20;step++){
      pending=state.prompts.find(p=>p.result===undefined);
      assert.ok(pending);
      if(pending.constructor.name==='ChooseCardsPrompt')break;
      assert.equal(pending.constructor.name,'WaitPrompt');
      store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    assert.equal(pending.constructor.name,'ChooseCardsPrompt');
    assert.equal(pending.playerId,owner.id);
    assert.equal(pending.message,'CHOOSE_CARD_TO_EVOLVE');
    assert.equal(state.phase,native('game/store/state/state').GamePhase.ATTACK);
    assert.strictEqual(pending.cards,owner.deck);
    assert.equal(pending.validate([nextStage]),true);
    const {actorSingleSearchInput}=require(
      '../simulation/twinleaf/agent41-actor-owner-single-search.cjs');
    assert.equal(actorSingleSearchInput(state,seat),null,
      'Ordinary owner-deck-to-hand search cannot cover this in-play evolution target');
    store.dispatch(new ResolvePromptAction(pending.id,[nextStage]));
    assert.equal(owner.active.getPokemonCard()?.fullName,'Alolan Exeggutor ex SSP');
    assert.equal(owner.active.cards.some(c=>c.fullName==='Exeggcute SSP'),true);
    assert.equal(owner.active.energies.cards.length,1);
    assert.equal(owner.deck.cards.includes(nextStage),false);
  });
}
