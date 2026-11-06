'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {summarize} =
  require('../simulation/evaluation/agent31-prospective-allpass-r5-r11.cjs');

const reg = JSON.parse(fs.readFileSync(path.join(__dirname,
  '../results/aichi-2026/registrations/agent31-prospective-allpass-r5-r11-20261106.json'),'utf8'));

/** @returns {object[]} */
function rows() {
  return reg.trials.map(trial => ({
    trial,
    sourceSeat:trial.candidateSlot === 'A' ? 1 : 0,
    finished:true, error:null,
    sourceDealFingerprint:[trial.rank,trial.candidateSlot,trial.repeat]
      .join(':'),
    fullPhysicalDealFingerprint:trial.id,
    rootActionLedgerSha256:trial.id,
    nativeAllOwnerPassFrontier:{
      completeNativePassCoverage:true,
      actualNativePassRoots:2,observedOwnerPassRoots:2,
      counts:{candidate:{passes:1,heldFloatStone:0,visibleFundedVmaxPasses:0},
        source:{passes:1,heldFloatStone:0,visibleFundedVmaxPasses:0}},
      receipts:[{role:'source',actionOrdinal:1},
        {role:'candidate',actionOrdinal:2,visibleFundedVmax:null}]
    }
  }));
}

test('retains all sixteen independent physical seed groups and both candidates',()=>{
 const result=summarize(rows());
 assert.equal(result.registeredPhysicalSeedGroups,16);
 assert.equal(result.registeredOriginalNativeArms,32);
 assert.equal(result.returnedOriginalNativeArms,32);
 assert.equal(result.rowsWithCompletePassEvidence,32);
 assert.equal(result.nativePassRootsInCompleteRows,64);
 assert.equal(result.ownerPassReceiptsInCompleteRows,64);
 assert.equal(result.sourceDealMatchedWithinBothContenders,16);
 assert.equal(result.physicalSeedGroupsWithAnyVisiblePositive,0);
 assert.equal(result.competitivePaperQualifiedGames,0);
 assert.equal(result.byTrial.length,32);
});

test('native abort remains in denominator with explicit absent observation',()=>{
 const sample=rows();
 sample[0].error='native original Store error';
 sample[0].finished=false;
 sample[0].nativeAllOwnerPassFrontier=null;
 sample[0].sourceDealFingerprint=null;
 sample[0].nativeAbortEvidence={rootActionLedger:[
   {action:'PassTurnAction',playerSlot:0,actionOrdinal:5},
   {action:'PlayCardAction',playerSlot:1,actionOrdinal:6},
   {action:'PassTurnAction',playerSlot:1,actionOrdinal:7}
 ]};
 const result=summarize(sample);
 assert.equal(result.registeredOriginalNativeArms,32);
 assert.equal(result.returnedOriginalNativeArms,32);
 assert.equal(result.nativeErrors,1);
 assert.equal(result.rowsWithCompletePassEvidence,31);
 assert.equal(result.nativePassRootsInCompleteRows,62);
 assert.equal(result.knownAcceptedPassRootsOnIncompleteNativeRows,2);
 assert.equal(result.knownAcceptedPassRootsAcrossAllRows,64);
 assert.equal(result.byTrial[0].knownAcceptedPassesOnAbort,2);
 assert.equal(result.byTrial[0].ownerPassReceipts,null);
 assert.equal(result.byTrial[0].status,'native-error');
 assert.equal(result.byTrial[0].actualNativePasses,null);
 assert.equal(result.sourceDealMatchedWithinBothContenders,15);
});

test('correlated eligible Passes within one seed group count once as a group',()=>{
 const sample=rows();
 for(const index of [0,1]){
   sample[index].nativeAllOwnerPassFrontier.counts.candidate
     .visibleFundedVmaxPasses=1;
   sample[index].nativeAllOwnerPassFrontier.receipts[1]
     .visibleFundedVmax={passRoot:2};
 }
 const result=summarize(sample);
 assert.equal(result.candidateNarrowFundedVmaxPassRootObservations,2);
 assert.equal(result.physicalSeedGroupsWithAnyVisiblePositive,1);
 assert.equal(result.competitivePaperQualifiedGames,0);
});

test('inconsistent native Pass custody rejects incomplete numerator',()=>{
 const sample=rows();
 sample[2].nativeAllOwnerPassFrontier.observedOwnerPassRoots=1;
 assert.throws(()=>summarize(sample));
});

test('all thirty-two registered attempts must be reported',()=>{
 assert.throws(()=>summarize(rows().slice(1)),/32/);
});
