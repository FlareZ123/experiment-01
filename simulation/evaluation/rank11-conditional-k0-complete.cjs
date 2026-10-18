'use strict';
const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/rank11-conditional-firstturn-k0-v1-20261018.json');
const {executePartition,seedFor,sha256}=require('./rank11-conditional-k0-screen-run.cjs');

/**
 * Execute all 512 *previously committed* first-turn-only source attempts.
 * Results are conditional-opportunity telemetry, with zero games or wins.
 * Every index is run, regardless of prior observed successes or failures.
 * @param {{runPartition?:(index:number)=>object}} [options]
 * @returns {object}
 */
function executeAll(options={}) {
  const runPartition=options.runPartition || (p=>executePartition({partition:p}));
  const partitions=[];
  for(let p=0;p<registration.attemptCount/registration.partitionSize;p++) {
    const result=runPartition(p);
    assert.equal(result.registrationSha256,registration.frameSha256);
    assert.equal(result.partition,p);
    assert.equal(result.attempted,registration.partitionSize);
    assert.equal(result.records.length,registration.partitionSize);
    partitions.push(result);
  }
  const records=partitions.flatMap(r=>r.records);
  assert.equal(records.length,registration.attemptCount);
  for(let i=0;i<records.length;i++) {
    assert.equal(records[i].index,i);
    assert.equal(records[i].seed,seedFor(i));
    assert.equal(records[i].trialId,'rank11-conditional-K0-v1:'+i);
  }
  const count=status=>records.filter(r=>r.status===status).length;
  const selected=records.filter(r=>r.status==='selected-K0');
  const sourceFirst=records.filter(r=>r.sourceFirst===true).length;
  return {
    schema:'aichi-rank11-all-precommitted-K0-opportunity-attempts-v1',
    registrationSha256:registration.frameSha256,
    engineRevision:registration.engineRevision,
    sourceRank:11,sourceSeat:0,candidateRank:1,candidateSeat:1,
    attempts:registration.attemptCount,
    actualSourceFirst:sourceFirst,
    selectedK0:count('selected-K0'),
    verifiedNonK0:count('verified-non-K0'),
    unverifiedDraw:count('unverified-first-draw'),
    screenExceptions:count('screen-exception'),
    selectedTrialIds:selected.map(r=>r.trialId),
    selectedSeeds:selected.map(r=>r.seed),
    recordsSha256:sha256(records),
    partitionSummaries:partitions.map(p=>({
      partition:p.partition,attempted:p.attempted,
      selectedK0:p.selectedK0,verifiedNonK0:p.verifiedNonK0,
      unverifiedDraw:p.unverifiedDraw,screenExceptions:p.screenExceptions
    })),
    records,qualifiedCompetitiveGames:0,
    warning:'All precommitted genuine first-decision source attempts; conditional K0 exposures only. No K1, lock, response or win estimate.'
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(executeAll(),null,2)+'\n');
module.exports={executeAll};
