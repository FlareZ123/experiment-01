'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

const SOURCE_RANK=5;
const SEED=20261104;
const plan=planAichi(1,{
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
const originalSource=plan.opponents.find(x=>x.rank===SOURCE_RANK);
assert.equal(originalSource?.status,'ready');
assert.equal(plan.candidate.cards?.length,60);
assert.equal(originalSource.cards.length,60);

/** @param {0|1} sourceSeat */
function request(sourceSeat){
  const candidate=plan.candidate.cards;
  const source=originalSource.cards;
  return {
    deckA:sourceSeat===0?source:candidate,
    deckB:sourceSeat===1?source:candidate,
    seed:SEED+sourceSeat,
    maxActions:48,
    label:'agent4-native-quarantine-rank5-source-seat'+sourceSeat,
    captureNativeAbortEvidence:true,
    captureDecisionTrace:true,
    isolatePolicyRandomness:true
  };
}

/** @param {Error} error @param {0|1} sourceSeat @param {string} mode */
function attestAbort(error,sourceSeat,mode){
  assert.equal(error.code,CODE);
  const audit=error.nativeRawStateFallbackQuarantine;
  assert.ok(audit);
  assert.equal(audit.rawStateFallbackCalls,1);
  assert.equal(audit.originalNativeDecoderExecuted,false);
  assert.equal(audit.ownerInformationSafeWholePolicyCertified,false);
  assert.equal(audit.records.length,1);
  assert.ok([0,1].includes(audit.records[0].seat));
  // An original engine crash is separate from intentional typed quarantine.
  assert.equal(error.nativeAbortEvidence?.failureStage??'bot-decoder',
    'bot-decoder');
  const record=audit.records[0];
  assert.ok(!JSON.stringify(record).includes('Guzma'));
  process.stdout.write(JSON.stringify({
    schema:'agent4-native-fallback-quarantine-pinned-store-smoke-v1',
    sourceRank:SOURCE_RANK,sourceSeat,mode,
    nativeVendor:plan.engineRevision,
    quarantinedDecoderBeforeRawScoring:true,
    firstFallback:{seat:record.seat,turn:record.turn,
      phase:record.phase,decisionKind:record.decisionKind,
      promptType:record.promptType},
    competitiveGamesQualified:0
  })+'\n');
}

for(const sourceSeat of [0,1]){
  test('pinned Store '+sourceSeat+' original rank5 native fallback quarantined',
    ()=>{
      let failure;
      try{
        quarantine(()=>runMatch(request(sourceSeat)));
      }catch(e){failure=e;}
      assert.ok(failure instanceof Error,'Guard must encounter native fallback');
      attestAbort(failure,sourceSeat,'original-bot');
    });

  test('pinned Store '+sourceSeat+' actor-composed native fallback quarantined',
    ()=>{
      let failure;
      try{
        quarantine(()=>withCanonicalActorOnlyPolicy(
          ()=>runMatch(request(sourceSeat))));
      }catch(e){failure=e;}
      assert.ok(failure instanceof Error,
        'Actor policy did not prove complete no-native-fallback closure');
      attestAbort(failure,sourceSeat,'canonical-actor-with-native-delegation');
    });
}
