'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {REGISTRATION_BLOB,plannedTrials}=
  require('./agent41-prospective-canonical-scout.cjs');

const ROOT=path.resolve(__dirname,'../..');
const FRAME='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';

/**
 * Reuse an earlier recorded randomized 32-arm frame verbatim. The Plumeria
 * intervention is subsequent to frame publication. A source and candidate
 * with different printed 60s still have distinct full physical deals.
 * @param {'control'|'plumeria'} mode
 * @returns {object} All outcomes/errors/caps, never competitive wins.
 */
function runPreregisteredPlumeria(mode){
  assert.ok(mode==='control'||mode==='plumeria');
  const bytes=fs.readFileSync(path.join(ROOT,FRAME));
  const gitBlob=createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
  assert.equal(gitBlob,REGISTRATION_BLOB,'Frozen third-party frame modified');
  const plan=JSON.parse(bytes.toString('utf8'));
  const trials=plannedTrials(plan);
  const withPlumeria=mode==='plumeria';
  const {runDevelopment}=
    require('./agent41-bilateral-v2-development.cjs');
  const result=runDevelopment({...plan.frozenRunOptions,
    registeredTrials:trials,registeredFrameName:FRAME,
    actorPlumeriaAfterPass:withPlumeria});
  assert.equal(result.attempted,32);
  assert.equal(result.rows.length,32);
  assert.equal(result.enginePin,plan.enginePin);
  assert.equal(result.registeredTrialFrame,FRAME);
  assert.equal(result.actorPlumeriaAfterPassOptIn,withPlumeria);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.ok(result.rows.every(r=>r.qualifiesForCompetitiveInference===false));
  return {
    schema:'agent38-postframe-plumeria-32-precommitted-contrast-v1',
    intervention:withPlumeria?'plumeria-actor-after-pass':'unchanged-canonical-control',
    registrationPath:FRAME,registrationBlob:gitBlob,
    precommittedBeforeIntervention:true,
    registeredAttempts:32,originalSourceRanks:plan.ranks,
    eachCandidateSlot:plan.candidateSlots,
    eachCandidateId:plan.candidateIds,
    result,competitiveQualifiedGames:0,
    caveat:'Thirty-two authentic original rank6/rank11 development games on a prior frozen frame, not complete Aichi field, not time-calibrated or strong shared policy.'
  };
}

if(require.main===module){
  assert.equal(process.argv.length,3);
  process.stdout.write(JSON.stringify(
    runPreregisteredPlumeria(process.argv[2]),null,2)+'\n');
}
module.exports={FRAME,runPreregisteredPlumeria};
