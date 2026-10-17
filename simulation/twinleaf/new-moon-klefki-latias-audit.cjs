'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const engine = part => require(path.join(output, part));
/** @param {0|1} seat @param {boolean} includeLatias */
function probe(seat,includeLatias) {
  const manager=initializeCards();
  let id=1;
  const card=name=>{
    const result=manager.getCardByName(name);
    assert.ok(result, 'Missing pinned card '+name);
    result.id=id++;
    return result;
  };
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {Format}=engine('game/store/card/card-types');
  const {CheckRetreatCostEffect}=engine('game/store/effects/check-effects');
  const {IS_ABILITY_BLOCKED}=engine('game/store/prefabs/prefabs');
  const store=new Store({onStateChange(){}});
  const state=store.state,mine=new Player(),them=new Player();
  mine.id=101;them.id=202;
  state.players=seat===0?[mine,them]:[them,mine];
  state.activePlayer=seat;state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const klefki=card('Klefki SVI');
  const mew=card('Mewtwo & Mew-GX UNM');
  const latias=includeLatias?card('Latias ex SSP'):null;
  mine.active.cards.push(klefki);
  for(const pokemon of [mew,latias]){
    const list=new PokemonCardList();
    if(pokemon) list.cards.push(pokemon);
    mine.bench.push(list);
  }
  them.active.cards.push(card('Pidgey MEW'));
  const retreatCost=()=>{
    const effect=new CheckRetreatCostEffect(mine);
    store.reduceEffect(state,effect);
    return effect.cost.length;
  };
  const before={active:mine.active.getPokemonCard().fullName,
    retreatCost:retreatCost(),
    latiasBlocked:latias?IS_ABILITY_BLOCKED(store,state,mine,latias):null};
  mine.switchPokemon(mine.bench[0],store,state);
  const after={active:mine.active.getPokemonCard().fullName,
    retreatCost:retreatCost(),
    latiasBlocked:latias?IS_ABILITY_BLOCKED(store,state,mine,latias):null};
  return {seat,includeLatias,before,after,mewPrintedRetreat:mew.retreat.length,
    klefkiNowBenched:mine.bench[0].getPokemonCard()===klefki};
}
function audit(){
  const rows=[probe(0,true),probe(1,true),probe(0,false),probe(1,false)];
  for(const row of rows){
    assert.equal(row.before.retreatCost,1,'Active Klefki must pay one Energy');
    assert.equal(row.before.latiasBlocked,row.includeLatias?true:null);
    assert.equal(row.after.latiasBlocked,row.includeLatias?false:null);
    assert.equal(row.after.retreatCost,row.includeLatias?0:row.mewPrintedRetreat);
    assert.equal(row.klefkiNowBenched,true);
  }
  return {engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    evidence:'Staged real Store Cost effect and Active-to-Bench transition, not full game',
    rows};
}
if(require.main===module) console.log(JSON.stringify(audit(),null,2));
module.exports={probe,audit};
