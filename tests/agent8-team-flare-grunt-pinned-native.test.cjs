'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(base,name));

/**
 * Two-seat direct native Store fixture with the original rank-6 XY printing and Iron Thorns ex Active,
 * the original rank-1 Shadow Rider V and Basic Psychic Energy and an unspent Supporter quota. This
 * tests one genuine printed card in isolation. It is not a game outcome.
 * @param {0|1} seat Real active seat.
 * @returns {object}
 */
function root(seat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  let id=85000;
  const card=printing=>{
    const instance=manager.getCardByName(printing);
    assert.ok(instance,'Missing pinned native printing: '+printing);
    instance.id=id++;
    return instance;
  };
  const store=new Store({onStateChange(){}});
  const owner=new Player(),opponent=new Player();
  owner.id=611;opponent.id=733;
  const state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  owner.active.cards.push(card('Iron Thorns ex TWM'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const energy=card('Psychic Energy MEE');
  opponent.active.cards.push(energy);
  opponent.active.energies.cards.push(energy);
  const supporter=card('Team Flare Grunt XY');
  owner.hand.cards.push(supporter);
  for(const player of state.players){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,opponent,energy,supporter,seat,card,manager};
}

test('pinned original Team Flare Grunt discards an opponent Active Energy in both seats',()=>{
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  for(const seat of [0,1]){
    const x=root(seat);
    assert.equal(x.supporter.canPlay(x.store,x.state,x.owner),true);
    const before=x.opponent.active.energies.cards.length;
    assert.equal(before,1);
    x.store.dispatch(new PlayCardAction(x.owner.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const pending=x.state.prompts.find(p=>p.result===undefined);
    if(pending){
      assert.equal(pending.constructor?.name,'ChooseCardsPrompt');
      assert.equal(pending.validate([x.energy]),true);
      x.store.dispatch(new ResolvePromptAction(pending.id,[x.energy]));
    }
    assert.equal(x.opponent.active.energies.cards.includes(x.energy),false);
    assert.ok(x.opponent.discard.cards.includes(x.energy));
    assert.equal(x.owner.hand.cards.includes(x.supporter),false);
    assert.equal(x.state.prompts.some(p=>p.result===undefined),false);
  }
});

test('pinned Team Flare Grunt target and Supporter quota are genuine native gates',()=>{
  for(const seat of [0,1]){
    const x=root(seat);
    x.owner.supporterTurn=1;
    assert.equal(x.supporter.canPlay(x.store,x.state,x.owner),false);
    x.owner.supporterTurn=0;
    assert.equal(x.supporter.canPlay(x.store,x.state,x.owner),true);
    x.opponent.active.energies.cards=[];
    x.opponent.active.cards=x.opponent.active.cards.filter(c=>c!==x.energy);
    assert.equal(x.supporter.canPlay(x.store,x.state,x.owner),false);
  }
});

test('record native printed Grunt first-player first-turn canPlay separately from paper screen',()=>{
  for(const seat of [0,1]){
    const x=root(seat);
    x.state.turn=1;
    const nativeCanPlay=x.supporter.canPlay(x.store,x.state,x.owner);
    assert.equal(typeof nativeCanPlay,'boolean');
    // This result alone is not a paper-legal PlayCardAction acceptance.
    // The source actor's first-player ordinary Supporter timing rule is
    // separately covered by the pure root-policy test.
    process.stdout.write('# TEAM_FLARE_FIRST_TURN_NATIVE_CANPLAY '+
      JSON.stringify({seat,turn:1,nativeCanPlay})+'\n');
  }
});

test('record actual first-turn Store acceptance independently of printed canPlay',()=>{
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  for(const seat of [0,1]){
    const x=root(seat);
    x.state.turn=1;
    let error=null;
    try{
      x.store.dispatch(new PlayCardAction(x.owner.id,0,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
      const pending=x.state.prompts.find(p=>p.result===undefined);
      if(pending){
        assert.equal(pending.constructor?.name,'ChooseCardsPrompt');
        assert.equal(pending.validate([x.energy]),true);
        x.store.dispatch(new ResolvePromptAction(pending.id,[x.energy]));
      }
    }catch(e){error=String(e?.message??e);}
    const supporterConsumed=!x.owner.hand.cards.includes(x.supporter);
    const energyDiscarded=x.opponent.discard.cards.includes(x.energy);
    // This is a deliberately contrived T1 public board. Log the real
    // reducer outcome without treating it as actual tournament exposure.
    process.stdout.write('# TEAM_FLARE_FIRST_TURN_STORE '+
      JSON.stringify({seat,turn:1,storeRejected:error!==null,
        error,supporterConsumed,energyDiscarded})+'\n');
    assert.equal(typeof supporterConsumed,'boolean');
    assert.equal(typeof energyDiscarded,'boolean');
    if(error===null){
      assert.equal(supporterConsumed,true);
      assert.equal(energyDiscarded,true);
    }
  }
});

test('native both-seat attack-versus-denial arbiter settles Supporter and retains subsequent root',()=>{
  const {actorObservation}=
    require('../simulation/twinleaf/actor-observation-contract.cjs');
  const {buildActorCardCatalog,chooseActorRootIntent}=
    require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const {arbitrateOwnerRootIntent}=
    require('../simulation/twinleaf/agent41-owner-root-arbitration.cjs');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {EnergyCard}=native('game/store/card/energy-card');
  const {PowerType}=native('game/store/card/pokemon-types');
  const {Stage,EnergyType,CardType,SpecialCondition}=
    native('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  for(const seat of [0,1]){
    const x=root(seat);
    const catalog=buildActorCardCatalog(x.manager.getAllCards(),{
      PokemonCard,EnergyCard,Stage,EnergyType,CardType,
      PowerType,SpecialCondition
    });
    // Engine-native original printings, staged on a real Store. This is
    // explicitly outside the probability distribution of legal openers.
    for(const printing of ['Lightning Energy SVE',
      'Psychic Energy SVE','Psychic Energy SVE']){
      const energy=x.card(printing);
      x.owner.active.cards.push(energy);
      x.owner.active.energies.cards.push(energy);
    }
    const second=x.card('Psychic Energy SVE');
    x.opponent.active.cards.push(second);
    x.opponent.active.energies.cards.push(second);
    assert.equal(x.opponent.active.energies.cards.length,2);
    const original=actorObservation(x.state,seat);
    const first=chooseActorRootIntent(original,catalog);
    assert.equal(first.kind,'attack');
    assert.equal(first.attackName,'Volt Cyclone');
    const picked=arbitrateOwnerRootIntent(original,catalog,first,{
      beforeAttackDenialRoot:true,teamFlareGruntDenialRoot:true
    });
    assert.equal(picked.receipt.candidateCount,1);
    assert.deepEqual(picked.intent,{
      kind:'play-team-flare-grunt-denial',handIndex:0,
      printing:'Team Flare Grunt XY'
    });
    assert.equal(x.supporter.canPlay(x.store,x.state,x.owner),true);
    const ownTurn=x.state.turn;
    x.store.dispatch(new PlayCardAction(x.owner.id,picked.intent.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const pending=x.state.prompts.find(prompt=>prompt.result===undefined);
    assert.ok(pending,'Denied Energy must create the original native target prompt');
    assert.equal(pending.constructor.name,'ChooseCardsPrompt');
    assert.equal(pending.validate([x.energy]),true);
    x.store.dispatch(new ResolvePromptAction(pending.id,[x.energy]));
    assert.equal(x.opponent.active.energies.cards.length,1);
    assert.equal(x.opponent.discard.cards.includes(x.energy),true);
    assert.equal(x.owner.hand.cards.includes(x.supporter),false);
    assert.equal(x.state.prompts.some(prompt=>prompt.result===undefined),false);
    assert.equal(x.state.turn,ownTurn);
    const later=actorObservation(x.state,seat);
    const next=chooseActorRootIntent(later,catalog);
    assert.equal(next.kind,'attack');
    assert.equal(next.attackName,'Volt Cyclone');
    process.stdout.write('# TEAM_FLARE_ARBITER_NATIVE '+
      JSON.stringify({seat,selected:picked.intent.kind,
        opponentEnergyBefore:2,opponentEnergyAfter:1,
        laterOwnerIntent:next.kind,ownerTurn:x.state.turn})+'\n');
  }
});
