'use strict';

const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {createHash}=require('node:crypto');
const {auditRank11Exposure,verifyFrameDigest}=
  require('./rank11-prospective-exposure.cjs');
const registered=require('../results/aichi-2026/registrations/rank11-prospective-exposure-v1-20261018.json');

/** @param {string} filename @returns {object} */
function summarizeProspective(filename='rank11-prospective-exposure-observed.json'){
  const bytes=readFileSync(filename);
  const report=JSON.parse(bytes.toString('utf8'));
  assert.ok(verifyFrameDigest(registered));
  assert.equal(report.fixedRegistrationSha256,registered.frameSha256);
  assert.equal(report.phase,'diagnostic-only');
  assert.equal(report.independentlyQualifiedCompetitiveGames,0);
  assert.equal(report.observations.length,16);
  assert.equal(report.actionSamples.length,16);
  const regenerated=auditRank11Exposure(registered,report.observations);
  assert.deepEqual(report.audit,regenerated,
    'Archived exposure counts disagree with the immutable registered denominator');
  const trueFirst=report.observations.filter(row=>
    row.verifiedByDrawLog===true &&
    row.firstTurnSlot===(row.candidateEngineSlot==='A'?1:0));
  const knownFirst=report.observations.filter(row=>row.verifiedByDrawLog===true);
  const activeLock=report.observations.filter(row=>
    row.sourcePolicyAudit?.completeAtDecisionBoundary===true);
  const errors=report.observations.filter(row=>
    row.status==='engine-exception');
  return {
    schema:'aichi-rank11-prospective-source-artifact-audit-v1',
    archivedArtifactFile:filename,
    archivedArtifactSha256:createHash('sha256').update(bytes).digest('hex'),
    registeredScheduleSha256:registered.frameSha256,
    frozenCandidateDigests:registered.candidateRows,
    sourceRank11Digest:registered.rank11SourceDigest,
    sourceSimulatorRevision:registered.engineRevision,
    policyProfile:registered.policyProfile,
    partition:report.executedPartition,
    partitionRepeatRange:report.partitionRange,
    actionCap:report.actionCapPerTrial,
    registered:report.totalRegisteredTrialCount,
    archivedObserved:report.observedTrialCount,
    verifiedActualFirstTurn:knownFirst.length,
    rank11StartedFirst:trueFirst.length,
    rank11StartedSecond:knownFirst.length-trueFirst.length,
    sourcePolicyOpportunityDetected:report.observations.filter(row=>
      row.sourcePolicyAudit?.opportunityDetected===true).length,
    actualFirstTurnToolGarbodorCompleted:activeLock.length,
    simulatorExceptions:errors.map(row=>({
      trialId:row.trialId,
      firstErrorLine:String(row.error||'').split('\n')[0]
    })),
    cells:report.audit.cells,
    auditedAttempts:report.observations.map(row=>{
      const sourceSeat=row.candidateEngineSlot==='A'?1:0;
      const action=report.actionSamples.find(item=>item.trialId===row.trialId);
      return {
        trialId:row.trialId,seed:row.seed,engineSeat:row.candidateEngineSlot,
        firstTurnProof:row.verifiedByDrawLog===true,
        sourceStartedFirst:row.verifiedByDrawLog===true ?
          row.firstTurnSlot===sourceSeat:null,
        policyOpportunity:row.sourcePolicyAudit?.opportunityDetected===true,
        policyActions:row.sourcePolicyAudit?.attemptedActions??null,
        garbodorWitness:row.sourcePolicyAudit?.completeAtDecisionBoundary===true,
        archiveStatus:row.status,
        opponentFirstTurnActions:(action?.sourceOpeningDecisions||[])
          .slice(0,6).map(e=>({action:e.action,card:e.card,attack:e.attack})),
        candidateFirstResponseActions:(action?.candidateGlobalTurn2Decisions||[])
          .slice(0,6).map(e=>({action:e.action,card:e.card,attack:e.attack}))
      };
    }),
    fullEvidenceComplete:report.audit.fullyObserved,
    competitiveWinRateCertified:false,
    note:'This is a source-locked turn-order/policy-exposure diagnostic. No win/loss rate or globally optimized deck strength is inferred.'
  };
}
if(require.main===module) {
  process.stdout.write(JSON.stringify(summarizeProspective(),null,2)+'\n');
}
module.exports={summarizeProspective};
