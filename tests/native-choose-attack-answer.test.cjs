'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {decodeNativeChooseAttack}=
  require('../simulation/twinleaf/native-choose-attack-answer.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(OUTPUT,p));

/**
 * The pinned Store consumes raw ResolvePromptAction.result. This SFT requires
 * a genuine Attack object, detecting accidentally submitted serialized UI
 * choices that make copied attacks appear to do nothing.
 */
test('native ChooseAttackPrompt selection is decoded and reference-validated',()=>{
  const card=initializeCards().getCardByName('Dialga-GX UPR');
  assert.ok(card);
  const {ChooseAttackPrompt}=native('game/store/prompts/choose-attack-prompt');
  const {State}=native('game/store/state/state');
  const prompt=new ChooseAttackPrompt(111,1,[card],{allowCancel:false});
  const state=new State();
  const serialized={index:0,attack:'Timeless-GX'};
  assert.equal(prompt.validate(serialized,state),false,
    'Wire-format object is not a native Attack instance');
  const attack=decodeNativeChooseAttack(prompt,state,0,'Timeless-GX');
  assert.strictEqual(attack,
    card.attacks.find(a=>a.name==='Timeless-GX'));
  assert.equal(attack.gxAttack,true);
  assert.equal(prompt.validate(attack,state),true);
  assert.notStrictEqual(attack,serialized);
  assert.throws(
    ()=>decodeNativeChooseAttack(prompt,state,0,'Nonexistent Attack'));
  assert.throws(
    ()=>decodeNativeChooseAttack(prompt,state,1,'Timeless-GX'));
});

test('native validator must reject a wrong card attack reference',()=>{
  const manager=initializeCards();
  const dialga=manager.getCardByName('Dialga-GX UPR');
  const mimi=manager.getCardByName('Mimikyu GRI');
  assert.ok(dialga&&mimi);
  const {ChooseAttackPrompt}=native('game/store/prompts/choose-attack-prompt');
  const {State}=native('game/store/state/state');
  const prompt=new ChooseAttackPrompt(111,1,[dialga],{
    allowCancel:false,blocked:[]});
  const state=new State();
  assert.equal(prompt.validate(mimi.attacks[1],state),false);
  assert.strictEqual(decodeNativeChooseAttack(prompt,state,0,'Overclock'),
    dialga.attacks[0]);
});
