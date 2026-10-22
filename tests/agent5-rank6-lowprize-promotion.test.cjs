'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseRegisteredPromotion,TARGET}=
  require('../simulation/twinleaf/agent5-rank6-lowprize-promotion.cjs');

/** @param {object} [extra] @returns {object} */
function input(extra={}){
  const data={
    actor:{decisionKind:'owner-prompt',
      opponentPublic:{active:{printing:'Iron Thorns ex TWM'}}},
    prompt:{kind:'ChoosePokemonPrompt',
      perspectiveIsAnsweringOwner:true,
      offered:[
        {side:'own',zone:'bench',printing:'Mewtwo & Mew-GX UNM'},
        {side:'own',zone:'bench',printing:TARGET},
        {side:'own',zone:'bench',printing:'Unown AOR'}
      ]}
  };
  return {...data,...extra};
}

test('registered exact T15 public threat picks offered Duskull',()=>{
  assert.deepEqual(chooseRegisteredPromotion(input(),15),{index:1});
});
test('never acts outside T15 or on non-owner prompts',()=>{
  assert.equal(chooseRegisteredPromotion(input(),14),null);
  assert.equal(chooseRegisteredPromotion(input(),16),null);
  assert.equal(chooseRegisteredPromotion(input({
    prompt:{...input().prompt,perspectiveIsAnsweringOwner:false}}),15),null);
});
test('requires public Thorns, vulnerable Mewtwo, and eligible Duskull',()=>{
  assert.equal(chooseRegisteredPromotion(input({
    actor:{...input().actor,
      opponentPublic:{active:{printing:'Garbodor BKP'}}}}),15),null);
  assert.equal(chooseRegisteredPromotion(input({
    prompt:{...input().prompt,offered:[
      {side:'own',zone:'bench',printing:TARGET}]}
  }),15),null);
  assert.equal(chooseRegisteredPromotion(input({
    prompt:{...input().prompt,offered:[
      {side:'own',zone:'bench',printing:'Mewtwo & Mew-GX UNM'}]}
  }),15),null);
});
test('decision is pure on a detached frozen offered menu',()=>{
  const state=input();
  Object.freeze(state.prompt.offered);
  Object.freeze(state.prompt);
  Object.freeze(state.actor);
  assert.deepEqual(chooseRegisteredPromotion(state,15),{index:1});
  assert.equal(state.prompt.offered[1].printing,TARGET);
});

test('separately registered T17 second Duskull is opt-in only',()=>{
  assert.equal(chooseRegisteredPromotion(input(),17),null);
  assert.deepEqual(chooseRegisteredPromotion(input(),17,true),{index:1});
  assert.equal(chooseRegisteredPromotion(input(),18,true),null);
  assert.equal(chooseRegisteredPromotion(input({
    prompt:{...input().prompt,offered:[
      {side:'own',zone:'bench',printing:'Mewtwo & Mew-GX UNM'},
      {side:'own',zone:'bench',printing:'Unown AOR'}]}
  }),17,true),null);
});
