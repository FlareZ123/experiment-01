'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {exclusiveSeedFrame,seedFrameDigest}=
  require('../simulation/twinleaf/rank11-exclusive-prospective-seeds.cjs');
const registration=
  require('../results/aichi-2026/registrations/rank11-exclusive-openers-v1-20261019.json');
const {auditExclusiveProspective}=
  require('../scripts/rank11-exclusive-prospective-audit.cjs');

/** A synthetic census for audit verification only. Not a game observation. */
function fixture(){
  const frame=exclusiveSeedFrame();
  const rows=frame.map(r=>({...r,
    sourceVerifiedByDrawLog:true,actualFirstSeat:0,
    sourceActuallyFirst:r.sourceSeat===0,sourceFirstTurnVerified:true,
    resultClass:'no-route',selectedKind:null,selectedTurn:null,
    completed:false,aborted:null,actionCapped:true,
    competingClaimAttempts:0,qualifiedCompetitiveGame:false
  }));
  const resultClassCounts={};
  for(const key of ['no-route','direct-completed','direct-aborted',
    'direct-unresolved','held-seal-completed','held-seal-aborted',
    'held-seal-unresolved','engine-exception'])resultClassCounts[key]=
      key==='no-route'?128:0;
  return {
    schema:registration.schema,
    pinnedTwinleaf:registration.engine,sourceRank:11,
    preregisteredSeedFrameSha256:seedFrameDigest(frame),
    candidateIdCountSha256:registration.candidate.canonicalIdCountSha256,
    rows,actualAttempted:128,competitiveQualifiedGames:0,
    sourceFirst:64,sourceSecond:64,sourceStartVerified:128,
    exceptions:0,ownerLineCompleted:0,competingClaimAttempts:0,
    cappedWithoutTerminal:128,resultClassCounts,byPhysicalSeat:{0:64,1:64}
  };
}

test('a full synthetic audit frame reconciles all physical seats and identities',()=>{
  const audited=auditExclusiveProspective(fixture());
  assert.equal(audited.registered,128);
  assert.equal(audited.archived,128);
  assert.equal(audited.verifiedAllStarts,true);
  assert.equal(audited.qualifiedCompetitiveGames,0);
});

test('rejects missing, duplicated and shifted seed positions',()=>{
  const missing=fixture();
  missing.rows.pop();
  assert.throws(()=>auditExclusiveProspective(missing),/128/);
  const duplicate=fixture();
  duplicate.rows[1]=duplicate.rows[0];
  assert.throws(()=>auditExclusiveProspective(duplicate),/Duplicate/);
  const changed=fixture();
  changed.rows[1].seed+=1;
  assert.throws(()=>auditExclusiveProspective(changed),/Unregistered seed/);
});

test('rejects fabricated claim, classification and start-order evidence',()=>{
  const gameClaim=fixture();
  gameClaim.rows[0].qualifiedCompetitiveGame=true;
  assert.throws(()=>auditExclusiveProspective(gameClaim));
  const finish=fixture();
  finish.rows[0].resultClass='direct-completed';
  assert.throws(()=>auditExclusiveProspective(finish));
  const start=fixture();
  start.rows[0].sourceActuallyFirst=false;
  assert.throws(()=>auditExclusiveProspective(start));
  const count=fixture();
  count.resultClassCounts['no-route']=127;
  assert.throws(()=>auditExclusiveProspective(count));
});
