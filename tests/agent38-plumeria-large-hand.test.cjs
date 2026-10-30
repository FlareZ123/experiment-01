'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {selectPlumeriaHandDiscards}=
  require('../simulation/twinleaf/agent4-plumeria-after-pass.cjs');

class ChooseCardsPrompt{
  constructor(owner,cards){
    this.id=19;this.playerId=owner.id;this.result=undefined;
    this.message='CHOOSE_CARD_TO_DISCARD';
    this.cards={cards};
    this.options={min:2,max:2,allowCancel:false};
  }
  validate(chosen){
    return Array.isArray(chosen)&&chosen.length===2&&
      chosen[0]!==chosen[1]&&
      chosen.every(c=>this.cards.cards.includes(c));
  }
}
function fixture(){
  const owner={id:1,hand:{cards:[
    ...Array.from({length:24},(_,i)=>({fullName:'Singleton '+i})),
    ...Array.from({length:4},()=>({fullName:'Repeatable Item'}))
  ]}};
  const state={players:[owner,{id:2}],prompts:[
    new ChooseCardsPrompt(owner,[...owner.hand.cards])
  ]};
  const observe=()=>({decisionKind:'owner-prompt',
    ownHand:owner.hand.cards.map(c=>c.fullName)});
  return {owner,state,observe};
}

test('28-card Plumeria hand stays capped OFF and becomes actor-owned ON',()=>{
  const {owner,state,observe}=fixture();
  assert.equal(selectPlumeriaHandDiscards(state,0,{
    allowLargeHand:false,observe}),null);
  const physical=selectPlumeriaHandDiscards(state,0,{
    allowLargeHand:true,observe});
  assert.equal(physical.length,2);
  assert.ok(state.prompts[0].validate(physical));
  assert.deepEqual(physical.map(c=>c.fullName),
    ['Repeatable Item','Repeatable Item']);
  assert.notStrictEqual(physical[0],physical[1]);
  assert.ok(physical.every(c=>owner.hand.cards.includes(c)));
});

test('oversized native list cannot substitute foreign physical card identity',()=>{
  const {state,observe}=fixture();
  state.prompts[0].cards.cards[0]={fullName:'Singleton 0'};
  assert.equal(selectPlumeriaHandDiscards(state,0,{
    allowLargeHand:true,observe}),null);
});

test('oversized native list refuses optional or non-two-card prompts',()=>{
  for(const options of [
    {min:1,max:2,allowCancel:false},
    {min:2,max:2,allowCancel:true},
    {min:2,max:3,allowCancel:false}
  ]){
    const {state,observe}=fixture();
    state.prompts[0].options=options;
    assert.equal(selectPlumeriaHandDiscards(state,0,{
      allowLargeHand:true,observe}),null);
  }
});
