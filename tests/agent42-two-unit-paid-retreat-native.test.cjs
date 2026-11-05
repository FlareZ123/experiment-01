'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {proposeTwoUnitPaidRetreat}=
  require('../simulation/twinleaf/agent42-public-two-unit-paid-retreat-proposal.cjs');

const OUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(OUT,name));
const PSY='Psychic Energy MEE';
const VMAX='Shadow Rider Calyrex VMAX CRE';

/**
 * Stage exactly the public Energy and evolution configuration of the
 * historical source position using actual pinned native card printings.
 * All Energy is attached with real Store PlayCardAction dispatches.
 *
 * @param {0|1} seat Physical owner seat.
 * @returns {{store:object,state:object,owner:object,opponent:object,
 *   catalog:object,activeBefore:object,oldEnergy:object[],sourceSeat:0|1}}
 */
function stage(seat){
  const manager=initializeCards();
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {CardList}=engine('game/store/state/card-list');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {GameSettings}=engine('game/core/game-settings');
  const {PokemonCard}=engine('game/store/card/pokemon-card');
  const {EnergyCard}=engine('game/store/card/energy-card');
  const {Stage,EnergyType,CardType,SpecialCondition,Format}=
    engine('game/store/card/card-types');
  const {PowerType}=engine('game/store/card/pokemon-types');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,PowerType,
    SpecialCondition
  });
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const settings=new GameSettings();
  settings.format=Format.EXPANDED;
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  owner.name='rank1-hypothetical-payment-owner';
  opponent.name='test-faceup-opponent';
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  let nextId=81000;
  const card=name=>{
    const instance=manager.getCardByName(name);
    assert.ok(instance,'Pinned native printing missing: '+name);
    instance.id=nextId++;
    return instance;
  };
  const putVmax=where=>{
    where.cards.push(card('Shadow Rider Calyrex V CRE'),card(VMAX));
  };
  putVmax(owner.active);
  const funded=new PokemonCardList(),girafarig=new PokemonCardList();
  putVmax(funded);
  girafarig.cards.push(card('Girafarig LOT'));
  owner.bench=[funded,girafarig];
  opponent.active.cards.push(card('Lunatone OBF'));
  for(const player of state.players){
    for(let i=0;i<15;i++)player.deck.cards.push(card(PSY));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card(PSY));
      player.prizes.push(prize);
    }
  }

  /** Attach a card in the native Store, with a distinct owner turn. */
  function attach(turn,slot,index=0){
    state.turn=turn;
    owner.hand.cards.push(card(PSY));
    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot,index
    }));
  }
  attach(20,SlotType.ACTIVE);
  attach(22,SlotType.ACTIVE);
  attach(24,SlotType.BENCH,0);
  attach(26,SlotType.BENCH,0);
  attach(28,SlotType.BENCH,0);
  attach(30,SlotType.BENCH,1);
  attach(32,SlotType.BENCH,1);
  state.turn=34;
  assert.deepEqual([
    owner.active.energies.cards.length,
    funded.energies.cards.length,
    girafarig.energies.cards.length
  ],[2,3,2]);
  return {store,state,owner,opponent,catalog,
    activeBefore:owner.active,oldEnergy:[...owner.active.energies.cards],
    sourceSeat:seat};
}

/**
 * Resolve only real native owner-payment and global wait prompts. The
 * two Basic Psychic cards that existed on the original Active are selected
 * by physical reference, never by assuming a prompt index is an Energy card.
 *
 * @param {object} game Staged native game.
 * @returns {object[]} Recorded actual prompt/payment receipts.
 */
function resolveNativeRetreat(game){
  const {store,state,owner,oldEnergy}=game;
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const prompts=[];
  for(let i=0;i<25;i++){
    const prompt=state.prompts.find(x=>x.result===undefined);
    if(!prompt)break;
    const type=prompt.constructor.name;
    assert.equal(prompt.playerId,owner.id,'Owner must pay Retreat');
    if(type==='WaitPrompt'){
      store.dispatch(new ResolvePromptAction(prompt.id,null));
      prompts.push({type});
      continue;
    }
    assert.equal(type,'ChooseCardsPrompt',
      'Unknown real native two-unit retreat-payment prompt');
    assert.strictEqual(prompt.cards,game.activeBefore.energies);
    assert.equal(prompt.validate(oldEnergy),true);
    store.dispatch(new ResolvePromptAction(prompt.id,oldEnergy));
    prompts.push({type,selected:oldEnergy.map(c=>c.fullName)});
  }
  assert.equal(state.prompts.some(x=>x.result===undefined),false,
    'No payment prompt may remain unresolved');
  return prompts;
}

for(const seat of [0,1]){
  test('pinned real Store pays two Basic Psychic on VMAX Retreat seat '+seat,()=>{
    const game=stage(seat);
    const {store,state,owner,oldEnergy,catalog,activeBefore}=game;
    const {RetreatAction}=engine('game/store/actions/game-actions');
    const view=actorObservation(state,seat);
    const intent=proposeTwoUnitPaidRetreat(view,catalog);
    assert.equal(intent?.kind,'two-unit-paid-retreat-proposal');
    assert.equal(intent?.benchIndex,0);
    assert.equal(intent?.projectedPrintedDamage,160);
    assert.deepEqual(intent?.discardEnergyIndices,[0,1]);
    const ownerDiscardBefore=[...owner.discard.cards];
    store.dispatch(new RetreatAction(owner.id,intent.benchIndex));
    const prompts=resolveNativeRetreat(game);
    assert.equal(owner.retreatedTurn,34);
    assert.equal(owner.active.getPokemonCard()?.fullName,VMAX);
    assert.equal(owner.bench[0],activeBefore);
    assert.equal(activeBefore.energies.cards.length,0);
    assert.equal(owner.active.energies.cards.length,3);
    assert.equal(owner.bench[1].energies.cards.length,2);
    for(const energy of oldEnergy){
      assert.equal(owner.discard.cards.includes(energy),true);
      assert.equal(activeBefore.energies.cards.includes(energy),false);
    }
    const newlyDiscarded=owner.discard.cards.filter(c=>
      !ownerDiscardBefore.includes(c));
    assert.equal(newlyDiscarded.length,oldEnergy.length);
    assert.equal(new Set(newlyDiscarded).size,2);
    assert.equal(newlyDiscarded.every(card=>oldEnergy.includes(card)),true);
    assert.equal(prompts.some(x=>x.type==='ChooseCardsPrompt'),true,
      'Native physical two-Card fee must be chosen at real prompt');
    assert.equal(state.players[seat],owner);
  });
}

module.exports={stage,resolveNativeRetreat};
