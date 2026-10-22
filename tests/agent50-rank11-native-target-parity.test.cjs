'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  equalRootPrefix,auditPair,HISTORIC_SOURCE_DEAL
}=require('../simulation/evaluation/agent50-rank11-native-target-parity.cjs');

const SCHEMA='actual-store-declared-target-sidecar-v1';

/** @param {number} root @param {number} benchIndex */
function targetReceipt(root,benchIndex){
  return {
    actionOrdinal:root+3,rootActionOrdinal:root,turnBefore:7,
    playerSlot:0,action:'PlayCardAction',
    declared:{
      kind:'play-card',status:'captured',handIndex:0,
      ownerHandPrinting:'Darkness Energy MEE 7',
      target:{player:2,slot:benchIndex===0?1:2,index:benchIndex}
    },
    storeAccepted:true,publicBoardChanges:[],
    visibility:'public-after-dispatch'
  };
}
function sidecar(benchIndex){
  return {schema:SCHEMA,rootOrdinalLinked:true,
    events:[targetReceipt(49,benchIndex)]};
}
function roots(){
  return Array.from({length:150},(_,i)=>({
    actionOrdinal:i+1,turnBefore:i<80?7:9,playerSlot:i%2,
    action:'PlayCardAction',card:'Darkness Energy'
  }));
}
function row(rootList,receipt,deal=HISTORIC_SOURCE_DEAL){
  return {
    fullOriginalNativeRootActionLedger:rootList,
    sourceDealFingerprint:deal,nativeAcceptedTargetSidecar:receipt
  };
}

test('actual target at root49 precedes the first unequal label at root145',()=>{
  const a=roots(),b=roots();
  b[144]={...b[144],card:'Guzma'};
  assert.equal(equalRootPrefix(a,b),144);
  const report=auditPair(row(a,sidecar(0)),row(b,sidecar(1)));
  assert.equal(report.sourceDealEqual,true);
  assert.equal(report.historicSourceDealReproduced,true);
  assert.equal(report.sameLabelPrefixCount,144);
  assert.equal(report.firstDifferentLabelRoot.actionOrdinal,145);
  assert.equal(report.firstPhysicalOrdinal,49);
  assert.equal(report.firstPhysicalPrecedesLabelDifference,true);
  assert.equal(report.physicalParityCertified,false);
  assert.equal(report.competitiveQualifiedGames,0);
});

test('unlinked sidecar cannot establish physical action parity',()=>{
  const a=roots(),w=sidecar(0);
  w.rootOrdinalLinked=false;
  const report=auditPair(row(a,w),row(a,sidecar(0)));
  assert.equal(report.firstPhysicalTargetDifference.status,
    'target-unobserved');
  assert.equal(report.physicalParityCertified,false);
  assert.equal(report.firstPhysicalPrecedesLabelDifference,false);
});

test('source-deal mismatch vetoes pre-label same-physical conclusion',()=>{
  const a=roots();
  const report=auditPair(row(a,sidecar(0)),
    row(a,sidecar(1),'different-source-deal'));
  assert.equal(report.sourceDealEqual,false);
  assert.equal(report.firstPhysicalOrdinal,49);
  assert.equal(report.firstPhysicalPrecedesLabelDifference,false);
  assert.equal(report.physicalParityCertified,false);
});

test('observed target equality stays explicitly scope-limited',()=>{
  const a=roots();
  const report=auditPair(row(a,sidecar(0)),row(a,sidecar(0)));
  assert.equal(report.firstPhysicalTargetDifference.status,
    'same-observed-targets');
  assert.equal(report.physicalParityCertified,true);
  assert.equal(report.limitedToAcceptedPlayCardAndRetreat,true);
  assert.equal(report.firstPhysicalPrecedesLabelDifference,false);
});
