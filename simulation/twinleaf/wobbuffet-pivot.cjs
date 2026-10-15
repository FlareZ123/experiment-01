'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(output,name));

function probePivot() {
  const manager=initializeCards();
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {GamePhase}=load('game/store/state/state');
  const {CheckRetreatCostEffect,CheckPokemonPowersEffect}=
    load('game/store/effects/check-effects');
  const store=new Store({onStateChange(){}});
  const state=store.state,a=new Player(),b=new Player();
  a.id=101;b.id=202;state.players=[a,b];
  state.turn=2;state.activePlayer=0;state.phase=GamePhase.PLAYER_TURN;
  const card=name=>{
    const item=manager.getCardByName(name);
    assert.ok(item,name);
    return item;
  };
  const wob=card('Wobbuffet PHF'),latias=card('Latias ex SSP');
  const thorns=card('Iron Thorns ex TWM');
  a.active.cards.push(wob);
  const bench=new PokemonCardList();
  bench.cards.push(latias);
  a.bench.push(bench);
  b.active.cards.push(thorns);
  const effect=new CheckRetreatCostEffect(a);
  store.reduceEffect(state,effect);
  assert.deepEqual(effect.cost,[]);
  return {passed:true};
}
if(require.main===module)console.log(JSON.stringify(probePivot(),null,2));
module.exports={probePivot};

