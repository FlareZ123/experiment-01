'use strict';

const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {createHash}=require('node:crypto');
const path=require('node:path');
const {auditRank11Exposure,verifyFrameDigest}=
  require('./rank11-prospective-exposure.cjs');
const registered=
  require('../results/aichi-2026/registrations/rank11-prospective-exposure-v1-20261018.json');

// These hashes were fixed after each independently audited original-branch CI.
// They bind this completion audit to the exact archived bytes, not to an
// arbitrary future replay from revised research code.
const ARCHIVES=Object.freeze([
  {partition:0,runId:39095223455,
    sha256:'768f934ea724fbfa98575287c00ffa5d641ca6ade4b75156340eaac9ab615d80'},
  {partition:1,runId:39188853881,
    sha256:'d292000517148de149d74b90c8ff954a1d69eb9f9b2aab805d4c5ccfeea38b03'},
  {partition:2,runId:39189483558,
    sha256:'b7ba204f57e962db0062e24651ac981d27a85a4e70177c084e5dfd3d82101e16'},
  {partition:3,runId:39189495377,
    sha256:'1872cc50a21944b23d42ad698bb2906302e003ac0a4f816cf41da9fd10b78316'}
]);

/**
 * Audit the immutable four-partition cohort as one 64-attempt experiment.
 * Individual 16-arm summaries are insufficient to reject duplicate trials
 * across archives, mismatched policy identity, or loss of a seed/seat pair.
 *
 * @param {object[]} reports Exactly four original execution report objects.
 * @param {object} [frame] Registered, digest-addressed prospective frame.
 * @returns {object} Complete noncompetitive evidence census.
 */
function auditCompleteRank11(reports,frame=registered){
  assert.ok(verifyFrameDigest(frame),'Frozen 64-trial frame digest mismatch');
  assert.equal(frame.trials.length,64);
  assert.equal(reports.length,4,'Exactly four archived partitions required');

  const byPartition=new Map();
  for(const report of reports){
    assert.ok(report && Number.isInteger(report.executedPartition));
    assert.ok(!byPartition.has(report.executedPartition),'Repeated archive partition');
    byPartition.set(report.executedPartition,report);
  }

  const all=[],sourceArms=[];
  const byStatus=new Map();
  const partitions=[];
  for(const {partition,runId} of ARCHIVES){
    const report=byPartition.get(partition);
    assert.ok(report,'Missing frozen partition '+partition);
    assert.equal(report.fixedRegistrationSha256,frame.frameSha256);
    assert.equal(report.engineRevision,frame.engineRevision);
    assert.equal(report.phase,'diagnostic-only');
    assert.equal(report.independentlyQualifiedCompetitiveGames,0);
    assert.equal(report.totalRegisteredTrialCount,64);
    assert.equal(report.observedTrialCount,16);
    assert.equal(report.actionCapPerTrial,90);
    assert.deepEqual(report.partitionRange,[4*partition,4*partition+3]);
    assert.equal(report.observations.length,16);
    assert.equal(report.actionSamples.length,16);
    const expected=frame.trials.filter(t=>Math.floor(t.repeat/4)===partition);
    const actualIds=report.observations.map(o=>o.trialId);
    assert.deepEqual(actualIds.slice().sort(),expected.map(t=>t.trialId).sort(),
      'Partition has missing, repeated or cross-partition trial IDs');
    const audited=auditRank11Exposure(frame,report.observations);
    assert.deepEqual(report.audit,audited,'Archived partition audit drift');
    assert.deepEqual(
      report.actionSamples.map(e=>e.trialId).sort(),actualIds.slice().sort(),
      'Decision samples are not aligned to all registered trials');
    for(const observation of report.observations){
      assert.equal(observation.candidateResponse?.legalStateTransitionWitness,false,
        'Frozen runner never independently certified legal reply');
      all.push(observation);
      byStatus.set(observation.status,(byStatus.get(observation.status)||0)+1);
    }
    const verified=report.observations.filter(x=>x.verifiedByDrawLog===true);
    const sourceFirst=verified.filter(x=>x.firstTurnSlot===
      (x.candidateEngineSlot==='A'?1:0)).length;
    const opportunities=report.observations.filter(x=>
      x.sourcePolicyAudit?.opportunityDetected===true).length;
    const locks=report.observations.filter(x=>
      x.sourcePolicyAudit?.completeAtDecisionBoundary===true).length;
    partitions.push({partition,runId,attempts:16,
      verifiedActualStarts:verified.length,sourceFirst,
      sourceSecond:verified.length-sourceFirst,opportunities,locks,
      exceptions:report.observations.filter(x=>x.status==='engine-exception').length,
      terminal:report.observations.filter(x=>x.status==='engine-terminal').length,
      capped:report.observations.filter(x=>x.status==='action-capped').length});
  }
  assert.equal(all.length,64);
  const audit=auditRank11Exposure(frame,all);
  assert.equal(audit.fullyObserved,true);
  assert.equal(audit.qualifiedCompetitiveGames,0);
  assert.equal(audit.allCellsExposed,false,
    'A complete action trace is not a certified response');
  for(const candidate of frame.candidateRows){
    for(const seat of ['A','B']){
      const cell=audit.cells.find(x=>x.candidateId===candidate.id &&
        x.candidateEngineSlot===seat);
      assert.equal(cell?.observed,16);
      assert.equal(cell?.missing,0);
      assert.equal(cell?.candidateResponseObservedAfterLock,0);
    }
  }

  // Paired equal-seed source openings must not be counted as 64 independent
  // hand samples. Validate physical-seat/seed conservation across candidates.
  const unique=new Map();
  for(const trial of frame.trials){
    const observation=all.find(row=>row.trialId===trial.trialId);
    const key=trial.repeat+':'+trial.candidateEngineSlot;
    const row={seed:trial.seed,firstTurnSlot:observation.firstTurnSlot,
      verified:observation.verifiedByDrawLog===true};
    if(unique.has(key))assert.deepEqual(unique.get(key),row,
      'Candidate-paired seed has inconsistent actual starting order');
    else unique.set(key,row);
  }
  assert.equal(unique.size,32);
  const uniqueVerified=[...unique.values()].filter(x=>x.verified).length;

  return {
    schema:'aichi-rank11-complete-64-prospective-integrity-v1',
    registrationSha256:frame.frameSha256,
    sourceRank11Digest:frame.rank11SourceDigest,
    engineRevision:frame.engineRevision,
    policyProfile:frame.policyProfile,
    archivedPartitions:partitions,
    registered:64,observed:all.length,
    uniquePhysicalSeatSeedDeals:unique.size,
    verifiedUniqueActualStart:uniqueVerified,
    verifiedActualStarts:partitions.reduce((sum,x)=>sum+x.verifiedActualStarts,0),
    sourceFirstArms:partitions.reduce((sum,x)=>sum+x.sourceFirst,0),
    sourceSecondArms:partitions.reduce((sum,x)=>sum+x.sourceSecond,0),
    policyOpportunities:partitions.reduce((sum,x)=>sum+x.opportunities,0),
    completedGarbodor:partitions.reduce((sum,x)=>sum+x.locks,0),
    byStatus:Object.fromEntries([...byStatus].sort((a,b)=>a[0].localeCompare(b[0]))),
    candidateSeatCells:audit.cells.map(x=>({candidateId:x.candidateId,
      seat:x.candidateEngineSlot,rank11First:x.rank11First,
      rank11Second:x.rank11Second,missing:x.missing,
      opportunity:x.firstTurnPolicyOpportunity,
      completedLock:x.completedFirstTurnGarbodor,
      independentlyAuditedResponses:x.candidateResponseObservedAfterLock})),
    allCellsExposed:false,qualifiedCompetitiveGames:0,
    note:'Complete registered mechanical opening frame only. No tactical candidate-response or official timed win-rate certification.'
  };
}

/** @param {string} [directory] Folder of four independently archived JSONs. */
function auditDownloadedArchives(directory=path.join(process.cwd(),'rank11-evidence')){
  const reports=[];
  for(const entry of ARCHIVES){
    const file=path.join(directory,'partition-'+entry.partition,
      'rank11-prospective-exposure-observed.json');
    const bytes=readFileSync(file);
    const actual=createHash('sha256').update(bytes).digest('hex');
    assert.equal(actual,entry.sha256,
      'Archived source bytes changed in rank11 partition '+entry.partition);
    reports.push(JSON.parse(bytes.toString('utf8')));
  }
  return auditCompleteRank11(reports);
}

if(require.main===module){
  process.stdout.write(JSON.stringify(auditDownloadedArchives(),null,2)+'\n');
}

module.exports={ARCHIVES,auditCompleteRank11,auditDownloadedArchives};
