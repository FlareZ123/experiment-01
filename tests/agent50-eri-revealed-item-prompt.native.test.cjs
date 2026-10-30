'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {observeEriRevealedItems,resolveEriRevealedItemPrompt,ERI}=
  require('../simulation/twinleaf/agent50-eri-revealed-item-prompt.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(output,name));

/**
 * Staged genuine Store turn, once per physical seat. No tournament-deck,
 * full-game, or competitive qualification is implied.
 * @param {0|1} seat
 * @param {boolean} withItems
 * @returns {object}
 */
function scene(seat,withItems,funded=false){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {GameSettings}=native('game/core/game-settings');
  const {Format}=native('game/store/card/card-types');
  const {SuperType,TrainerType}=
    native('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player(),opponent=new Player();
  owner.id=981;opponent.id=982;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.turn=4;state.activePlayer=seat;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings=new GameSettings();
  state.gameSettings.format=Format.EXPANDED;
  state.rules=state.gameSettings.rules;
  let nextId=95000;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Pinned CardManager missing original '+name);
    c.id=nextId++;
    return c;
  };
  owner.active.cards.push(card(funded?'Iron Thorns ex TWM':'Bunnelby PRC'));
  if(funded){
    owner.active.energies.cards.push(card('Speed Lightning Energy RCL'),
      card('Double Colorless Energy SUM'));
    owner.stadium.cards.push(card('Thunder Mountain Prism Star LOT'));
  }
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  owner.hand.cards.push(card(ERI));
  if(withItems){
    opponent.hand.cards.push(card('VS Seeker PHF'),
      card('Psychic Energy SVE'),card('Ultra Ball SUM'),
      card('Double Colorless Energy SUM'));
    if(funded)opponent.hand.cards.push(card('Psychic Energy SVE'));
  }else{
    opponent.hand.cards.push(card('Psychic Energy SVE'),
      card('Double Colorless Energy SUM'));
  }
  for(const player of [owner,opponent]){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<12;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,opponent,seat,SuperType,TrainerType,manager};
}

/**
 * Native acceptance and prompt provenance test, both player orientations.
 * @param {0|1} seat
 * @param {boolean} withItems
 */
function settle(seat,withItems){
  const {store,state,owner,opponent,SuperType,TrainerType}=scene(seat,withItems);
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const pre=actorObservation(state,seat);
  assert.equal(pre.decisionKind,'owner-root');
  assert.equal(pre.ownHand[0],ERI);
  assert.equal(pre.opponentPublic.handCount,withItems?4:2);
  // Before Eri has been played, this actor sees only opponent hand COUNT,
  // never actual opposing hand identities.
  assert.equal(Object.hasOwn(pre.opponentPublic,'hand'),false);
  store.dispatch(new PlayCardAction(owner.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const prompt=state.prompts.find(x=>x.result===undefined);
  assert.ok(prompt);
  assert.equal(prompt.constructor.name,'ChooseCardsPrompt');
  assert.strictEqual(prompt.cards,opponent.hand);
  assert.ok(owner.supporter.cards.some(c=>c.fullName===ERI),
    'Accepted Supporter must be in own temporary Supporter zone');
  const observed=observeEriRevealedItems(state,seat,prompt,
    SuperType,TrainerType);
  assert.ok(observed,'Native prompt must authorize exact Eri reveal');
  const expected=withItems?['VS Seeker PHF','Ultra Ball SUM']:[];
  assert.deepEqual(observed.items.map(item=>item.printing),expected);
  const original=opponent.hand.cards.slice();
  const selected=resolveEriRevealedItemPrompt(state,seat,prompt,
    SuperType,TrainerType,ResolvePromptAction);
  assert.ok(selected);
  assert.deepEqual(selected.selectedPrintings,expected);
  store.dispatch(selected.action);
  for(const name of expected){
    assert.equal(opponent.hand.cards.some(card=>card.fullName===name),false);
    assert.ok(opponent.discard.cards.some(card=>card.fullName===name));
  }
  for(const card of original.filter(c=>!expected.includes(c.fullName)))
    assert.ok(opponent.hand.cards.includes(card),
      'Non-Item must remain as the exact same native physical card');
  assert.ok(owner.discard.cards.some(c=>c.fullName===ERI),
    'Native Eri must move out of own Supporter zone to discard');
  assert.equal(state.prompts.some(p=>p.result===undefined),false);
  return {seat,withItems,discarded:selected.selectedPrintings,
    retained:opponent.hand.cards.map(c=>c.fullName),
    ownerSupporterTurn:owner.supporterTurn,accepted:true};
}

for(const seat of [0,1]){
  test('native Eri reveals then discards two opponent Items, seat '+seat,()=>{
    const outcome=settle(seat,true);
    assert.equal(outcome.discarded.length,2);
    console.log('ERI_REVEALED_NATIVE',JSON.stringify(outcome));
  });
  test('native Eri with no Item uses an empty legal response, seat '+seat,()=>{
    const outcome=settle(seat,false);
    assert.deepEqual(outcome.discarded,[]);
    console.log('ERI_REVEALED_NATIVE_EMPTY',JSON.stringify(outcome));
  });
}

for(const seat of [0,1]){
  test('native owner Eri option can finish an already payable attack, seat '+seat,()=>{
    const {offerEriBeforeAttack,observeEriRevealedItems,
      resolveEriRevealedItemPrompt}=
      require('../simulation/twinleaf/agent50-eri-revealed-item-prompt.cjs');
    const {store,state,owner,opponent,manager,SuperType,TrainerType}=
      scene(seat,true,true);
    const {buildActorCardCatalog,chooseActorRootIntent}=
      require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
    const {PokemonCard}=native('game/store/card/pokemon-card');
    const {EnergyCard}=native('game/store/card/energy-card');
    const {Stage,EnergyType,CardType,SpecialCondition}=
      native('game/store/card/card-types');
    const {PowerType}=native('game/store/card/pokemon-types');
    const catalog=buildActorCardCatalog(manager.getAllCards(),{
      PokemonCard,EnergyCard,Stage,EnergyType,CardType,PowerType,
      SpecialCondition
    });
    const before=actorObservation(state,seat);
    assert.equal(before.opponentPublic.handCount,5);
    const attack={kind:'attack',attackName:'Volt Cyclone'};
    const {publicSpecialAttackPayable}=
      require('../simulation/twinleaf/agent17-public-context-special-energy.cjs');
    const printed=before.ownPublic.active.attacks.find(a=>
      a.name===attack.attackName);
    assert.ok(printed);
    assert.equal(publicSpecialAttackPayable(before,catalog,
      before.ownPublic.active,printed),true);
    const proposal=offerEriBeforeAttack(before,attack);
    assert.deepEqual(proposal,{kind:'play-eri-reveal',handIndex:0,
      printing:ERI,evidence:'possible-item-denial-before-payable-attack',
      opponentPublicHandCount:5});
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const {ResolvePromptAction}=
      native('game/store/actions/resolve-prompt-action');
    const {AttackAction}=native('game/store/actions/game-actions');
    store.dispatch(new PlayCardAction(owner.id,proposal.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const prompt=state.prompts.find(p=>p.result===undefined);
    assert.ok(prompt);
    assert.equal(observeEriRevealedItems(state,seat,prompt,
      SuperType,TrainerType).items.length,2);
    const selected=resolveEriRevealedItemPrompt(state,seat,prompt,
      SuperType,TrainerType,ResolvePromptAction);
    assert.deepEqual(selected.selectedPrintings,
      ['VS Seeker PHF','Ultra Ball SUM']);
    store.dispatch(selected.action);
    const after=actorObservation(state,seat);
    const next=chooseActorRootIntent(after,catalog,{
      publicContextSpecialEnergy:true});
    assert.deepEqual(next,attack,'Eri denial should leave attack payable');
    const damageBefore=opponent.active.damage;
    store.dispatch(new AttackAction(owner.id,attack.attackName));
    for(let step=0;step<25&&state.turn===4;step++){
      const pending=state.prompts.find(p=>p.result===undefined);
      assert.ok(pending,'Native Volt Cyclone stopped without a prompt');
      assert.equal(pending.constructor.name,'WaitPrompt');
      store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    assert.equal(state.turn,5);
    assert.equal(opponent.active.damage-damageBefore,140);
    assert.equal(owner.supporterTurn,1);
    console.log('ERI_PREDAMAGE_NATIVE',JSON.stringify({seat,
      opponentItemsDiscarded:selected.selectedPrintings,
      damage:140,supporterSpent:1,competitiveQualifiedGames:0}));
  });
}
