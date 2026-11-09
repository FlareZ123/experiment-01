'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {withOwnerMailAfterPass}=
  require('../simulation/twinleaf/agent9-native-owner-mail-after-pass.cjs');

test('owner Mail bridge restores native hooks and retains public evidence on abort',()=>{
  const manager=require('../simulation/twinleaf/headless.cjs').initializeCards();
  const base=path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output');
  if(!manager.isCardDefined("Trainers' Mail ROS")){
    const {TrainersMail}=require(path.join(base,
      'sets/07-x-and-y/set-roaring-skies/trainers-mail'));
    manager.defineCard(new TrainersMail());
  }
  const {SimpleTacticsAi}=
    require(path.join(base,'simple-bot/simple-tactics-ai'));
  const {Store}=require(path.join(base,'game/store/store'));
  const originalAi=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const originalStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const exactSixty=Array(60).fill('Mew V FST');
  const abort=new Error('injected-native-downstream-abort');

  assert.throws(()=>withOwnerMailAfterPass(
    ()=>{throw abort;},[exactSixty,exactSixty],
    {allowRoot:()=>true}),error=>{
    assert.strictEqual(error,abort);
    const audit=error.ownerMailAfterPassAbortAudit;
    assert.ok(audit);
    assert.equal(audit.version,'agent9-native-owner-mail-after-pass-v1');
    assert.equal(audit.unresolvedOwnerPrompts,0);
    assert.equal(audit.mailStoreAccepted,0);
    assert.deepEqual(audit.selectedReceipts,[]);
    assert.equal(audit.nativeSourceHiddenOrderReadByThisBridge,false);
    return true;
  });

  assert.deepEqual(Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction'),originalAi);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch'),originalStore);
});
