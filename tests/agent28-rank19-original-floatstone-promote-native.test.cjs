'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseOwnerFloatStoneMobility}=require(
  '../simulation/twinleaf/agent1-owner-float-stone-mobility.cjs');
const OUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const load=moduleName=>require(path.join(OUT,moduleName));

const {Store}=load('game/store/store');
const {Player}=load('game/store/state/player');
const {CardList}=load('game/store/state/card-list');
const {PokemonCardList}=load('game/store/state/pokemon-card-list');
const {GamePhase}=load('game/store/state/state');
const {PlayCardAction,PlayerType,SlotType}=
  load('game/store/actions/play-card-action');
const {RetreatAction}=load('game/store/actions/game-actions');
const {CheckRetreatCostEffect}=load('game/store/effects/check-effects');
const {Format}=load('game/store/card/card-types');
let id=64000;

/** @param {0|1} seat */
function stage(seat){
  const manager=initializeCards();
  /** @param {string} name */
  const make=name=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Pinned original printing absent: '+name);
    card.id=id++;return card;
  };
  const source=new Player();source.id=101;source.name='source-rank19';
  const opponent=new Player();opponent.id=202;opponent.name='opponent';
  const hooh=make('Ho-Oh EX DRX');
  const raging=make('Raging Bolt ex TEF');
  const dde=make('Double Dragon Energy ROS');
  const stone=make('Float Stone BKT');
  source.active.cards.push(hooh);
  source.hand.cards.push(stone);
  source.bench=Array.from({length:5},()=>new PokemonCardList());
  source.bench[0].cards.push(raging,dde);
  source.bench[0].energies.cards.push(dde);
  opponent.active.cards.push(make('Shadow Rider Calyrex V CRE'));
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  opponent.bench[0].cards.push(make('Duskull PRE'));
  for(const player of [source,opponent]){
    for(let j=0;j<6;j++){
      const p=new CardList();p.cards.push(make('Psychic Energy SVE'));
      player.prizes.push(p);
    }
    for(let j=0;j<8;j++)player.deck.cards.push(make('Psychic Energy SVE'));
  }
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.players=seat===0?[source,opponent]:[opponent,source];
  state.activePlayer=seat;state.turn=4;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,source,opponent,hooh,raging,dde,stone,seat};
}

for(const seat of [0,1]){
  test('pinned native original rank19 seat '+seat+
    ' owner-held Float Stone equips unpowered Ho-Oh and physically promotes DDE Raging Bolt',()=>{
    const x=stage(seat);
    const catalog={specialConditions:{ASLEEP:8,PARALYZED:7}};
    const view=actorObservation(x.state,seat);
    const first=chooseOwnerFloatStoneMobility(view,catalog);
    assert.ok(first,'Source-only actor planner must recognize held Float Stone');
    assert.equal(first.kind,'attach-emergency-floatstone');
    assert.equal(first.printing,'Raging Bolt ex TEF');
    assert.equal(view.ownPublic.active.printing,'Ho-Oh EX DRX');
    assert.deepEqual(view.ownPublic.active.energies,[]);
    assert.deepEqual(view.ownPublic.bench[0].energies,['Double Dragon Energy ROS']);
    const target={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
    x.store.dispatch(new PlayCardAction(x.source.id,first.handIndex,target));
    assert.ok(x.source.active.tools.cards.includes(x.stone));
    assert.equal(x.source.hand.cards.length,0);
    const retreatCost=new CheckRetreatCostEffect(x.source);
    x.store.reduceEffect(x.store.state,retreatCost);
    assert.equal(retreatCost.cost.length,0);
    const second=chooseOwnerFloatStoneMobility(
      actorObservation(x.store.state,seat),catalog);
    assert.ok(second);
    assert.equal(second.kind,'retreat-emergency-floatstone');
    assert.equal(second.benchIndex,0);
    x.store.dispatch(new RetreatAction(x.source.id,second.benchIndex));
    assert.strictEqual(x.source.active.getPokemonCard(),x.raging);
    assert.strictEqual(x.source.active.energies.cards[0],x.dde);
    assert.strictEqual(x.source.bench[0].getPokemonCard(),x.hooh);
    assert.ok(x.source.bench[0].tools.cards.includes(x.stone));
    assert.equal(x.source.retreatedTurn,x.store.state.turn);
    assert.equal(x.source.getPrizeLeft(),6);
  });
}
