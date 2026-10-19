'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {exclusiveSeedFrame,seedFrameDigest}=
  require('../simulation/twinleaf/rank11-exclusive-prospective-seeds.cjs');
const registration=
  require('../results/aichi-2026/registrations/rank11-exclusive-openers-v1-20261019.json');

const CLASSES=new Set(['no-route','direct-completed','direct-aborted',
  'direct-unresolved','held-seal-completed','held-seal-aborted',
  'held-seal-unresolved','engine-exception']);

/**
 * Independent full-denominator rank11 source audit. Does not load Twinleaf or
 * re-run any match. Failure-inclusive exceptions stay in the census.
 * @param {object} result The raw archived JSON from the registered CI run.
 * @returns {object} Bounded observer-level verification, no game rating.
 */
function auditExclusiveProspective(result) {
  assert.equal(result.schema,registration.schema);
  assert.equal(result.pinnedTwinleaf,registration.engine);
  assert.equal(result.sourceRank,11);
  assert.equal(result.preregisteredSeedFrameSha256,
    registration.randomness.seedFrameSha256);
  assert.equal(result.candidateIdCountSha256,
    registration.candidate.canonicalIdCountSha256);
  assert.ok(Array.isArray(result.rows));
  assert.equal(result.rows.length,registration.experiment.attempts);
  assert.equal(result.actualAttempted,registration.experiment.attempts);
  assert.equal(result.competitiveQualifiedGames,0);

  const frame=exclusiveSeedFrame();
  assert.equal(seedFrameDigest(frame),registration.randomness.seedFrameSha256);
  const unique=new Set();
  const counts=Object.fromEntries([...CLASSES].map(k=>[k,0]));
  let sourceFirst=0,sourceSecond=0,verified=0,exceptions=0;
  let completed=0,competing=0,capped=0;
  const bySeat={0:0,1:0};
  for(const row of result.rows) {
    const key=`${row.sourceSeat}:${row.repeat}`;
    assert.ok(!unique.has(key),`Duplicate seed-frame position ${key}`);
    unique.add(key);
    assert.equal(row.seed,frame.find(x=>
      x.sourceSeat===row.sourceSeat&&x.repeat===row.repeat)?.seed,
      `Unregistered seed at ${key}`);
    assert.ok(CLASSES.has(row.resultClass),`Invalid classification ${key}`);
    assert.equal(row.qualifiedCompetitiveGame,false);
    counts[row.resultClass]++;
    bySeat[row.sourceSeat]++;
    if(row.resultClass==='engine-exception') {
      exceptions++;
      assert.equal(typeof row.errorMessage,'string');
      assert.ok(row.errorMessage.length>0);
      continue;
    }
    assert.equal(row.sourceVerifiedByDrawLog,true);
    assert.ok(row.actualFirstSeat===0||row.actualFirstSeat===1);
    assert.equal(row.sourceActuallyFirst,row.actualFirstSeat===row.sourceSeat);
    assert.equal(row.sourceFirstTurnVerified,true);
    assert.ok(row.competingClaimAttempts>=0);
    if(row.sourceActuallyFirst)sourceFirst++;
    else sourceSecond++;
    verified++;
    competing+=row.competingClaimAttempts;
    capped+=Number(row.actionCapped);
    completed+=Number(row.completed);
    if(row.resultClass==='no-route') {
      assert.equal(row.selectedKind,null);
      assert.equal(row.completed,false);
      assert.equal(row.aborted,null);
    } else {
      assert.ok(row.selectedKind==='direct'||row.selectedKind==='held-seal');
      assert.ok(row.resultClass.startsWith(row.selectedKind+'-'));
      const suffix=row.resultClass.slice(row.selectedKind.length+1);
      if(suffix==='completed') {
        assert.equal(row.completed,true);
        assert.equal(row.aborted,null);
      } else if(suffix==='aborted') {
        assert.equal(row.completed,false);
        assert.ok(row.aborted);
      } else {
        assert.equal(suffix,'unresolved');
        assert.equal(row.completed,false);
        assert.equal(row.aborted,null);
      }
    }
  }
  assert.equal(unique.size,frame.length);
  assert.equal(bySeat[0],64);
  assert.equal(bySeat[1],64);
  assert.equal(sourceFirst,result.sourceFirst);
  assert.equal(sourceSecond,result.sourceSecond);
  assert.equal(verified,result.sourceStartVerified);
  assert.equal(exceptions,result.exceptions);
  assert.equal(completed,result.ownerLineCompleted);
  assert.equal(competing,result.competingClaimAttempts);
  assert.equal(capped,result.cappedWithoutTerminal);
  assert.deepEqual(counts,result.resultClassCounts);
  assert.deepEqual(bySeat,result.byPhysicalSeat);
  return {
    registered:frame.length,archived:result.rows.length,
    verifiedSourceStarts:verified,sourceFirst,sourceSecond,
    exceptions,completed,competingClaims:competing,
    resultClassCounts:counts,
    fullDenominatorReconciled:true,
    verifiedAllStarts:verified===frame.length,
    paperOrCompetitiveGameCertified:false,
    qualifiedCompetitiveGames:0
  };
}

if(require.main===module) {
  const filename=process.argv[2];
  assert.ok(filename,'Provide archived result JSON file');
  const result=JSON.parse(fs.readFileSync(filename,'utf8'));
  process.stdout.write(JSON.stringify(auditExclusiveProspective(result),null,2)+'\n');
}
module.exports={auditExclusiveProspective};
