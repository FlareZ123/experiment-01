'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {captureChooseAttackReference, restoreChooseAttackReference} =
  require('../simulation/twinleaf/choose-attack-reference.cjs');

class ChooseAttackPrompt {
  constructor(cards) { this.message='CHOOSE_ATTACK'; this.cards=cards; }
}
class ResolvePromptAction {
  constructor(result) { this.result=result; }
}
const setup = () => {
  const a={name:'Timeless-GX'}, b={name:'Timeless-GX'};
  const c={name:'Dragon Laser'};
  const cards=[
    {fullName:'Dialga-GX UPR',attacks:[a]},
    {fullName:'Dialga-GX UPR',attacks:[b]},
    {fullName:'Regidrago V SIT',attacks:[c]}
  ];
  return {prompt:new ChooseAttackPrompt(cards),chosen:b};
};

test('a duplicated printing and attack name preserve exact source object',()=> {
  const {prompt,chosen}=setup();
  const capture=captureChooseAttackReference(prompt,new ResolvePromptAction(chosen));
  assert.deepEqual(capture.selection,{
    index:1,printing:'Dialga-GX UPR',attackIndex:0,attackName:'Timeless-GX'
  });
  const replay=setup().prompt;
  assert.equal(restoreChooseAttackReference(replay,capture),replay.cards[1].attacks[0]);
  assert.notEqual(restoreChooseAttackReference(replay,capture),replay.cards[0].attacks[0]);
});

test('null cancelled attacks remain distinct',()=> {
  const {prompt}=setup();
  const capture=captureChooseAttackReference(prompt,new ResolvePromptAction(null));
  assert.equal(capture.selection,null);
  assert.equal(restoreChooseAttackReference(prompt,capture),null);
});

test('refuses an attack absent from the prompt and different replay source',()=> {
  const {prompt,chosen}=setup();
  assert.throws(()=>captureChooseAttackReference(prompt,
    new ResolvePromptAction({name:'Timeless-GX'})),/not a member/);
  const capture=captureChooseAttackReference(prompt,new ResolvePromptAction(chosen));
  const wrong=setup().prompt;
  wrong.cards[1].attacks[0].name='Different';
  assert.throws(()=>restoreChooseAttackReference(wrong,capture),/candidate list differs/);
});

test('not an attack-choice prompt gives null',()=>{
  assert.equal(captureChooseAttackReference(null,new ResolvePromptAction(null)),null);
});
