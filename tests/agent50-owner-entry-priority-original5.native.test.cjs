'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {planAichi}=
  require('../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=
  require('../simulation/twinleaf/headless.cjs');
const {withOwnerSetupConfirm}=
  require('../simulation/twinleaf/agent4-owner-setup-confirm.cjs');
const {withOwnerEntryPriorityOpening:entryPriority}=
  require('../simulation/twinleaf/agent50-owner-entry-priority-single-basic.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const plan=planAichi(1,{
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
const source=plan.opponents.find(x=>x.rank===5);
assert.equal(plan.engineRevision,PIN);
assert.equal(source?.status,'ready');

const SCHEMA='agent50-original-rank5-owner-entry-priority-native-evidence-v1';

/**
 * Public-only native Store receipt. Each seat is an independent file and
 * carries a detached SHA256 checksum. Writes are locked and atomic.
 *
 * @param {object} row
 */
function writeReceipt(row){
  const directory=process.env.AGENT50_ENTRY_RECEIPT_DIR;
  if(!directory)return;
  fs.mkdirSync(directory,{recursive:true});
  const name='original5-source-seat'+row.sourceSeat+'.json';
  const filename=path.resolve(directory,name);
  const payload=JSON.stringify(row,null,2)+'\n';
  const digest=createHash('sha256').update(payload).digest('hex');
  writeAtomicLocked(filename,payload);
  writeAtomicLocked(filename+'.sha256',digest+'  '+name+'\n');
}

for(const sourceSeat of [0,1]){
  test('preregistered original5 source seat '+sourceSeat+
      ': entry-priority owner native setup/store before guard',()=>{
    const seed=20261118+sourceSeat;
    let blocked=null;
    try{
      quarantine(()=>withOwnerSetupConfirm(()=>entryPriority(()=>
        withCanonicalActorOnlyPolicy(()=>runMatch({
          deckA:sourceSeat===0?source.cards:plan.candidate.cards,
          deckB:sourceSeat===1?source.cards:plan.candidate.cards,
          seed,maxActions:80,captureNativeAbortEvidence:true
        })))));
    }catch(error){
      blocked=error;
    }
    let violation=null;
    try{
      assert.ok(blocked instanceof Error);
      assert.equal(blocked.code,CODE,
        'Unsupported native setup/root must still fail closed');
      const native=blocked.ownerEntryPriorityAudit;
      const starting=native?.nativeStoreAdapterAudit;
      const outer=blocked.nativeRawStateFallbackQuarantine;
      assert.ok(native,'Missing opt-in entry-priority actual native audit');
      assert.ok(starting,'Missing pinned Store setup placement receipt');
      assert.ok(starting.accepted>=1,
        'Both authentic physical players must settle a setup Active');
      assert.equal(starting.physicallyPlacedActiveConfirmed,
        starting.accepted,'Actual pinned native Store placement must settle');
      assert.equal(starting.physicallyPlacedActiveMissing,0);
      assert.equal(starting.rejected,0);
      assert.ok(native.ownerEntrySelectionEvents.length>=2);
      assert.ok(native.ownerEntrySelectionEvents.every(e=>
        e.validEligibleBasics>=1&&e.eligibleTurnEntrySupports>=0&&
        (!e.chosenEntrySupport||
          e.validEligibleBasics===e.eligibleTurnEntrySupports)));
      assert.equal(outer?.originalNativeDecoderExecuted,false);
      assert.ok(outer?.rawStateFallbackCalls>=1);
      assert.deepEqual([...new Set(starting.events.map(e=>e.seat))].sort(),
        [0,1]);
    }catch(error){
      violation=error;
    }
    const native=blocked?.ownerEntryPriorityAudit??null;
    const starting=native?.nativeStoreAdapterAudit??null;
    const outer=blocked?.nativeRawStateFallbackQuarantine??null;
    const receipt={
      schema:SCHEMA,
      sourceRank:5,sourceSeat,seed,
      printedSourceSlotCount:60,
      registeredPrintedSource:'results/aichi-2026/full-decklists.json rank 5',
      sourceProxy60Sha256:createHash('sha256')
        .update(JSON.stringify(source.cards)).digest('hex'),
      candidateProxy60Sha256:createHash('sha256')
        .update(JSON.stringify(plan.candidate.cards)).digest('hex'),
      pinnedTwinleafGitlink:PIN,
      observedEngineRevision:plan.engineRevision,
      policyEntryPoint:
        'simulation/twinleaf/agent50-owner-entry-priority-single-basic.cjs',
      testEntryPoint:'tests/agent50-owner-entry-priority-original5.native.test.cjs',
      ciHeadSha:process.env.GITHUB_SHA??null,
      ciRunId:process.env.GITHUB_RUN_ID??null,
      nativeReturnWithoutBlock:blocked===null,
      nativeFailureCode:blocked?.code??null,
      actualNativeStoreAccepted:starting?.accepted??null,
      physicallyPlacedActive:starting?.physicallyPlacedActiveConfirmed??null,
      nativeStoreRejected:starting?.rejected??null,
      nativeStoreAuditCardPrintings:starting?.events?.map(e=>({
        seat:e.seat,printing:e.printing,eligibleCount:e.eligibleCount
      }))??null,
      ownerOnlyPriorityDecisions:native?.ownerEntrySelectionEvents??null,
      fallbackAudit:outer?{
        originalNativeDecoderExecuted:outer.originalNativeDecoderExecuted,
        rawStateFallbackCalls:outer.rawStateFallbackCalls,
        firstPublicRecord:outer.records?.[0]??null
      }:null,
      proofAssertionsPassed:violation===null,
      proofFailure:violation?.message??null,
      printingsFromHiddenDeckOrPrizesIncluded:false,
      physicalDealFingerprint:null,
      gameOutcomeQualified:false,
      competitiveQualifiedGames:0
    };
    writeReceipt(receipt);
    if(violation)throw violation;
    console.log('AGENT50_REGISTERED_OWNER_ENTRY_PRIORITY_RANK5',JSON.stringify({
      schema:'agent50-owner-entry-priority-original5-native-v1',
      sourceSeat,seed,pinned:plan.engineRevision,sourceRank:5,
      selected:starting.selected,
      StoreAccepted:starting.accepted,
      physicallyPlacedActive:starting.physicallyPlacedActiveConfirmed,
      ownerEntrySelections:native.ownerEntrySelectionEvents,
      selectedCards:starting.events.map(e=>({
        seat:e.seat,printing:e.printing,
        eligible:e.eligibleCount})),
      nextNativeFallback:outer.records?.[0]??null,
      nativeOriginalDecoderExecuted:false,
      competitiveQualifiedGames:0,
      disposition:'developmental-Store-acceptance-only'
    }));
  });
}
