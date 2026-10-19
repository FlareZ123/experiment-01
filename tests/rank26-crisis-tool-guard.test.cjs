'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {blockedRank26Tool}=require('../simulation/twinleaf/rank26-crisis-tool-guard.cjs');

const slots={ACTIVE:'ACTIVE',BENCH:'BENCH'};
/** @returns {{state:object,own:object}} */
function fixture(){
  const own={
    hand:{cards:[
      {name:'Technical Machine: Crisis Punch',fullName:'Technical Machine: Crisis Punch PAF'},
      {name:'Float Stone',fullName:'Float Stone BKT'}
    ]},
    active:{getPokemonCard:()=>({name:'Exeggcute'})},
    bench:[{getPokemonCard:()=>({name:'Meloetta ex'})}]
  };
  const state={
    turn:1,activePlayer:1,phase:12,players:[
      {active:{getPokemonCard:()=>({name:'Iron Thorns ex'})}},own
    ],prompts:[]
  };
  return {own,state};
}
/** @param {number} handIndex @param {string} slot @param {number} index */
function selected(handIndex,slot,index=0){
  return {type:'PLAY_CARD_ACTION',handIndex,target:{slot,index}};
}
test('Crisis Punch is preserved unless recipient is Meloetta',()=>{
  const {own,state}=fixture();
  assert.equal(blockedRank26Tool(state,own,1,
    selected(0,slots.ACTIVE),slots,12)?.recipient,'Exeggcute');
  assert.equal(blockedRank26Tool(state,own,1,
    selected(0,slots.BENCH),slots,12),null);
});
test('Float Stone on Meloetta is vetoed without blocking starter switching Tool',()=>{
  const {own,state}=fixture();
  assert.equal(blockedRank26Tool(state,own,1,
    selected(1,slots.ACTIVE),slots,12),null);
  assert.equal(blockedRank26Tool(state,own,1,
    selected(1,slots.BENCH),slots,12)?.recipient,'Meloetta ex');
});
test('no cross-seat, prompt, later-turn or other action interception',()=>{
  const {own,state}=fixture();
  const tm=selected(0,slots.ACTIVE);
  assert.equal(blockedRank26Tool(state,own,0,tm,slots,12),null);
  assert.equal(blockedRank26Tool(state,{...own},1,tm,slots,12),null);
  state.prompts.push({result:undefined});
  assert.equal(blockedRank26Tool(state,own,1,tm,slots,12),null);
  state.prompts=[];
  state.turn=2;
  assert.equal(blockedRank26Tool(state,own,1,tm,slots,12),null);
  state.turn=1;
  assert.equal(blockedRank26Tool(state,own,1,
    {type:'PASS_TURN_ACTION'},slots,12),null);
  state.phase=100;
  assert.equal(blockedRank26Tool(state,own,1,tm,slots,12),null);
});
test('unknown intended Tool target suppresses only Crisis Punch',()=>{
  const {own,state}=fixture();
  assert.equal(blockedRank26Tool(state,own,1,
    {type:'PLAY_CARD_ACTION',handIndex:0},slots,12)?.recipient,null);
  assert.equal(blockedRank26Tool(state,own,1,
    {type:'PLAY_CARD_ACTION',handIndex:1},slots,12),null);
});
