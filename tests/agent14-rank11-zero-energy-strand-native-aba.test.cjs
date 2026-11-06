'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {digest,firstDifference,rowReceipt,SOURCE_TRIAL,
  SOURCE_SEED,TARGET_TURN,TARGET_SEAT}=
  require('../simulation/evaluation/agent14-rank11-zero-energy-strand-native-aba.cjs');
test('retrospective target is precisely one archived source physical seed',()=>{
  assert.equal(SOURCE_TRIAL,'11:3:B:champion-reference');
  assert.equal(SOURCE_SEED,1101197735);
  assert.equal(TARGET_TURN,34);
  assert.equal(TARGET_SEAT,1);
});
test('native ledger identity requires all action roots, not action count only',()=>{
  const a={rootActionLedger:[
    {action:'PlayCardAction',turnBefore:32,detail:'A'},
    {action:'PassTurnAction',turnBefore:34,detail:'B'}
  ]};
  const b={rootActionLedger:[
    {action:'PlayCardAction',turnBefore:32,detail:'A'},
    {action:'PlayCardAction',turnBefore:34,detail:'Float Stone BKT'}
  ]};
  assert.equal(firstDifference(a,a).firstAcceptedRootDifference,null);
  const delta=firstDifference(a,b);
  assert.equal(delta.firstAcceptedRootDifference,1);
  assert.equal(delta.beforeRoot.action,'PassTurnAction');
  assert.equal(delta.afterRoot.action,'PlayCardAction');
  assert.notEqual(delta.beforeSha,delta.afterSha);
  assert.equal(delta.beforeSha,digest(a.rootActionLedger));
});
test('abort ledgers remain observable but never count as full games',()=>{
  const a={nativeAbortEvidence:{rootActionLedger:[
    {action:'PassTurnAction',turnBefore:34}]}};
  const b={nativeAbortEvidence:{rootActionLedger:[
    {action:'PlayCardAction',turnBefore:34}]}};
  assert.equal(firstDifference(a,b).firstAcceptedRootDifference,0);
  const receipt=rowReceipt({
    trial:{id:SOURCE_TRIAL},sourceSeat:0,candidateSeat:1,
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      root:{zeroEnergyStrandFloatStoneRootSelected:1}}},
    nativeAbortEvidence:{rootActionLedger:[]},
    rootActionLedger:[],finished:false,
    error:{message:'engine abort'}
  });
  assert.equal(receipt.strandSelected,1);
  assert.equal(receipt.nativeError.message,'engine abort');
  assert.equal(receipt.finished,false);
  assert.deepEqual(receipt.nativeAttackRoots,[]);
});
