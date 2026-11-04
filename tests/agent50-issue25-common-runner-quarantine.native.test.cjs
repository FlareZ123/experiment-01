'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  developmentTrials,runDevelopment
}=require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

/**
 * Actual pinned-Store, four-arm shared-runner integration boundary.
 * The source-rank historical overrides and four retrospective seeds are
 * intentionally retained; this is a release blocker diagnostic only.
 * Owner records exclude physical hidden-zone contents.
 */
test('Issue25: quarantine inherited native decoder in genuine two-seat common-runner attempts',()=>{
  const planned=developmentTrials();
  assert.equal(planned.length,4);
  assert.deepEqual(new Set(planned.map(row=>row.candidateSlot)),
    new Set(['A','B']));
  assert.deepEqual(new Set(planned.map(row=>row.rank)),new Set([6,11]));
  assert.deepEqual(new Set(planned.map(row=>row.candidateId)),
    new Set(['champion-reference','new-moon-lockbreaker-v1']));

  /** @type {ReturnType<typeof runDevelopment>|null} */
  let developed=null;
  /** @type {object|null} */
  let quarantineAudit=null;
  /** @type {Error|null} */
  let quarantineError=null;
  try{
    const guarded=quarantine(()=>{
      developed=runDevelopment({
        actorOnlyComposition:true,
        nativeRootActionLimit:16
      });
      return developed;
    },{maxRecords:16});
    quarantineAudit=guarded.audit;
  }catch(error){
    quarantineError=error;
    quarantineAudit=error.nativeRawStateFallbackQuarantine??null;
  }

  const rows=developed?.rows??[];
  const summary={
    schema:'agent50-issue25-common-native-quarantine-v1',
    retrospectiveSourceRanks:[6,11],
    actorsBothPhysicalSeats:true,
    plannedArms:planned.map(row=>row.id),
    executedRows:rows.map(row=>({
      id:row.trial?.id??row.id??null,
      status:row.status??null,
      abortCode:row.error?.code??null,
      abortMessage:row.error?.message??null,
      nativeStartVerified:row.game?.verifiedByDrawLog??null,
      sourceDealDigest:row.game?.initialSourceDealFingerprint?.digestSha256??null
    })),
    quarantineCode:quarantineError?.code??null,
    quarantineCalls:quarantineAudit?.rawStateFallbackCalls??null,
    records:quarantineAudit?.records??null,
    omitted:quarantineAudit?.recordsOmitted??null,
    originalNativeDecoderExecuted:
      quarantineAudit?.originalNativeDecoderExecuted??null,
    qualifyingCompetitiveGames:0
  };
  console.log('AGENT50_ISSUE25_INTEGRATED_QUARANTINE',JSON.stringify(summary));

  assert.equal(rows.length,planned.length,
    'predeclared attempted opponent/candidate rows must all remain visible');
  assert.ok(quarantineAudit,
    'the outer Store-level quarantine must return an auditable disposition');
  assert.equal(quarantineAudit.originalNativeDecoderExecuted,false,
    'the inherited scorer must not run behind actor-only adapters');
  assert.equal(quarantineAudit.ownerInformationSafeWholePolicyCertified,false);
  assert.equal(quarantineAudit.gameCompetitiveQualified,false);
  if(quarantineAudit.rawStateFallbackCalls>0){
    assert.equal(quarantineError?.code,CODE,
      'even swallowed native delegations must fail the outer release gate');
    assert.ok(quarantineAudit.records.every(record=>
      record.seat===null||record.seat===0||record.seat===1));
  }else{
    assert.equal(quarantineError,null,
      'a zero-delegation execution must restore normally');
  }
});
