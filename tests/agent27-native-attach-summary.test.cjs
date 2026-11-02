'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {summarize, summarizeArm} = require('../scripts/agent27-native-attach-summary.cjs');

test('proposal-only hook counters never imply accepted physical energy transfers', () => {
  const arm = {failure:{code:'INVALID',message:'ATTACH_ENERGY_CARDS failed'},
    game:null,minRepair:{proposedCorrections:1,unsupported:0},
    nativeMinimumAttachActionReceipts:[],separateFullSourceDealSha256:'same'};
  const result=summarizeArm(arm);
  assert.equal(result.status,'error');
  assert.equal(result.minRepairProposals,1);
  assert.equal(result.acceptedTwoPhysicalEnergyTransfers,0);
  assert.equal(result.nativeReceipts,0);
});

test('physical receipt requires both original cards and native owner-active movement', () => {
  const arm={failure:null,game:{finished:false,actions:110,
    settledPhysicalZoneAnomalies:0},
    nativeMinimumAttachActionReceipts:[
      {nativeStoreActionAccepted:true,twoDistinctPhysicalCards:true,
       bothOriginalSourceCards:true,bothAttachedToOriginalActive:false},
      {nativeStoreActionAccepted:true,twoDistinctPhysicalCards:true,
       bothOriginalSourceCards:true,bothAttachedToOriginalActive:true}
    ],separateFullSourceDealSha256:'same'};
  const result=summarizeArm(arm);
  assert.equal(result.status,'capped');
  assert.equal(result.acceptedTwoPhysicalEnergyTransfers,1);
  assert.equal(result.nativeReceipts,2);
});

test('paired summary preserves every seed, printed deck/deal comparability and no qualification', () => {
  const arm={failure:null,game:{finished:true,winner:0},
    nativeMinimumAttachActionReceipts:[],separateFullSourceDealSha256:'a'};
  const data={schema:'agent27-paired-native-minimum-energy-prompt-source-replay-v1',
    pinnedEngine:'test-revision',
    cases:[1,2,3].map(seed=>({seed,seatRanks:[10,1],
      sameRegisteredOriginalSixties:true,sameInitialFullPhysicalDeal:true,
      original:arm,repaired:arm}))};
  const out=summarize(data);
  assert.deepEqual(out.cases.map(x=>x.seed),[1,2,3]);
  assert.equal(out.cases[2].sameInitialFullPhysicalDeal,true);
  assert.equal(out.cases[0].repaired.engineWinner,0);
  assert.equal(out.qualifiedCompetitiveGames,0);
});
