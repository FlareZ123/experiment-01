'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');

const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');

test('default-off pending queue correction is versioned, temporary and inert without queued effects',()=>{
  const {Store}=require(path.join(root,'game/store/store'));
  const {Player}=require(path.join(root,'game/store/state/player'));
  const beforeDispatch=Store.prototype.dispatch;
  const beforeSwitch=Player.prototype.switchPokemon;
  const legalFiller=[
    ...Array(4).fill('Shadow Rider Calyrex V CRE'),
    ...Array(56).fill('Psychic Energy MEE')
  ];
  const common={
    deckA:legalFiller,deckB:legalFiller,seed:1881,maxActions:5,
    isolatePolicyRandomness:true,label:'PaleMoon-no-card-contamination-control'
  };
  const original=runMatch(common);
  assert.strictEqual(Store.prototype.dispatch,beforeDispatch);
  assert.strictEqual(Player.prototype.switchPokemon,beforeSwitch);
  assert.equal(Object.hasOwn(original,'pendingEndTurnSwitchCleanupCorrection'),false);

  const patched=runMatch({...common,pendingEndTurnSwitchCleanupCorrection:true});
  assert.strictEqual(Store.prototype.dispatch,beforeDispatch);
  assert.strictEqual(Player.prototype.switchPokemon,beforeSwitch);
  assert.equal(patched.pendingEndTurnSwitchCleanupCorrection,true);
  assert.deepEqual(patched.pendingEndTurnSwitchCleanupEvidence,{
    removedFromRoot:0,removedFromSimulatedStores:0,rootEvents:[]
  });
  assert.equal(patched.policy,original.policy+'+PendingEndTurnSwitchPaper-v1');

  const {pendingEndTurnSwitchCleanupCorrection,
    pendingEndTurnSwitchCleanupEvidence,policy,...actual}=patched;
  const {policy:baselinePolicy,...expected}=original;
  assert.deepEqual(actual,expected,
    'When no pending KO exists, the patched match body must be unchanged');

  const repeated=runMatch(common);
  assert.deepEqual(repeated,original,
    'The subsequent default-off match must repeat the same frozen game');
  assert.strictEqual(Store.prototype.dispatch,beforeDispatch);
  assert.strictEqual(Player.prototype.switchPokemon,beforeSwitch);
});


test('headless restores stacked Copycat and Pass dispatch hooks before pending cleanup',()=>{
  const {Store}=require(path.join(root,'game/store/store'));
  const {Player}=require(path.join(root,'game/store/state/player'));
  const beforeDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const beforeSwitch=Object.getOwnPropertyDescriptor(Player.prototype,'switchPokemon');
  const legalFiller=[
    ...Array(4).fill('Shadow Rider Calyrex V CRE'),
    ...Array(56).fill('Psychic Energy MEE')
  ];
  let observedDispatch;
  let observedSwitch;
  try {
    const result=runMatch({
      deckA:legalFiller,deckB:legalFiller,seed:1882,maxActions:5,
      isolatePolicyRandomness:true,
      label:'pending-cleanup-copycat-pass-dispatch-stack',
      mimikyuApexCopycatCompatibility:true,
      mimikyuDeclaredHistoryCorrection:true,
      regidragoDeclaredHistoryCorrection:true,
      passClearsLastAttackCorrection:true,
      pendingEndTurnSwitchCleanupCorrection:true
    });
    assert.equal(result.pendingEndTurnSwitchCleanupCorrection,true);
    observedDispatch=Store.prototype.dispatch;
    observedSwitch=Player.prototype.switchPokemon;
  } finally {
    // Keep a failing pre-fix run from contaminating other tests in this process.
    if(Store.prototype.dispatch!==beforeDispatch.value) {
      Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
    }
    if(Player.prototype.switchPokemon!==beforeSwitch.value) {
      Object.defineProperty(Player.prototype,'switchPokemon',beforeSwitch);
    }
  }
  assert.strictEqual(observedDispatch,beforeDispatch.value,
    'Store dispatch wrappers must unwind in reverse installation order');
  assert.strictEqual(observedSwitch,beforeSwitch.value,
    'pending cleanup must restore Player.switchPokemon');
});
