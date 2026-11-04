'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {runSelectedIssue25V0}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');
const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {reconcileRegisteredAttempts}=
  require('../simulation/evaluation/agent3-registered-attempt-reconciliation.cjs');

const project=row=>({
  id:row.trial?.id??row.id??null,
  nativeStatus:row.status??(row.finished===false?
    'action-cap':'returned-unqualified'),
  rootCount:row.nativeRootActionCount??row.rootActionCount??null,
  sourceFingerprint:row.sourceDealFingerprint??null,
  fullPhysicalFingerprint:row.fullPhysicalDealFingerprint??null,
  firstTurn:row.actualStarterSeat??null,
  verifiedFirstTurn:row.verifiedFirstTurn??null,
  actorHandDiscardAudit:row.actorOnlyDecisionCoverage?.
    detailedComponentAudits?.handDiscard??null
});

/** Retrospective four-trial native A/B with one added owner-prompt adapter. */
test('Issue25 owner-hand discard selected A/B preserves four physical openings',()=>{
  const baseline=runSelectedIssue25V0();
  const treatment=runSelectedIssue25V0({
    runner:options=>runDevelopment({...options,actorHandDiscard:true})
  });
  const expected=baseline.diagnostic.registered;
  assert.deepEqual(treatment.diagnostic.registered,expected);
  const original=baseline.rawDevelopment?.rows??[];
  const changed=treatment.rawDevelopment?.rows??[];
  const controlAdmission=reconcileRegisteredAttempts(expected,original);
  const treatmentAdmission=reconcileRegisteredAttempts(expected,changed);
  assert.equal(controlAdmission.exactlyReconciled,true);
  assert.equal(treatmentAdmission.exactlyReconciled,true);
  assert.equal(original.length,4);
  assert.equal(changed.length,4);
  assert.equal(baseline.rawDevelopment?.actorHandDiscardOptIn,false);
  assert.equal(treatment.rawDevelopment?.actorHandDiscardOptIn,true);
  const baselineById=new Map(original.map(x=>[x.trial?.id??x.id,project(x)]));
  const treatmentById=new Map(changed.map(x=>[x.trial?.id??x.id,project(x)]));
  const cases=expected.map(id=>{
    const a=baselineById.get(id),b=treatmentById.get(id);
    assert.ok(a&&b);
    assert.ok(a.sourceFingerprint&&b.sourceFingerprint,
      'Both real source physical deals must be archived');
    const sameSource=a.sourceFingerprint===b.sourceFingerprint;
    const sameFirstTurn=a.firstTurn===b.firstTurn;
    const validFirstTurn=a.verifiedFirstTurn===true&&
      b.verifiedFirstTurn===true;
    return {id,baseline:a,treatment:b,sameSource,sameFirstTurn,
      validFirstTurn};
  });
  const summary={
    schema:'agent3-issue25-owner-hand-discard-retrospective-v1',
    sourcePairMatches:cases.filter(x=>x.sameSource).length,
    firstTurnMatches:cases.filter(x=>x.sameFirstTurn).length,
    firstTurnVerified:cases.filter(x=>x.validFirstTurn).length,
    baselineStatusCounts:count(original.map(x=>project(x).nativeStatus)),
    treatmentStatusCounts:count(changed.map(x=>project(x).nativeStatus)),
    baselineQuarantine:baseline.diagnostic.fallbackCalls,
    treatmentQuarantine:treatment.diagnostic.fallbackCalls,
    baselineRejected:baseline.diagnostic.thrownCode,
    treatmentRejected:treatment.diagnostic.thrownCode,
    completePaperGames:0,competitiveQualified:false
  };
  console.log('AGENT3_ISSUE25_HAND_DISCARD_BRIDGE',
    JSON.stringify({summary,cases}));
  assert.equal(summary.sourcePairMatches,4);
  assert.equal(summary.firstTurnMatches,4);
  assert.equal(summary.firstTurnVerified,4);
  assert.equal(baseline.manifest.releaseQualified,false);
  assert.equal(treatment.manifest.releaseQualified,false);
});
/** @param {string[]} values */
function count(values){
  const result={};
  for(const value of values)result[value]=(result[value]??0)+1;
  return result;
}
