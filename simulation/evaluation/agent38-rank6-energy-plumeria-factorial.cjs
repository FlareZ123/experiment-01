'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {REGISTRATION_BLOB,plannedTrials}=
  require('./agent41-prospective-canonical-scout.cjs');

const BASE=path.resolve(__dirname,'../..');
const PARENT='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const FRAME='results/aichi-2026/registrations/agent38-rank6-special-energy-plumeria-factorial-20261030.json';
const FACTORIAL_BLOB='dfa109b1051c0ec34ab2a514d7345c4c2008713c';

/**
 * Original pre-existing 16 rank6 trial cells; never select a case by success
 * or by the previously observed Plumeria action. Both actual seat orders and
 * both distinct printed candidate 60s occur at fixed preregistered seeds.
 * @returns {{frame:object,parent:object,trials:object[]}}
 */
function frozenFactorialFrame(){
  const bytes=fs.readFileSync(path.join(BASE,FRAME));
  const parentBytes=fs.readFileSync(path.join(BASE,PARENT));
  const gitHash=b=>createHash('sha1').update('blob '+b.length+'\0')
    .update(b).digest('hex');
  assert.equal(gitHash(bytes),FACTORIAL_BLOB);
  assert.equal(gitHash(parentBytes),REGISTRATION_BLOB);
  const frame=JSON.parse(bytes.toString('utf8'));
  const parent=JSON.parse(parentBytes.toString('utf8'));
  assert.equal(frame.enginePin,parent.enginePin);
  assert.equal(frame.parentFrameGitBlobSha1,REGISTRATION_BLOB);
  assert.equal(frame.exactAttemptsPerArm,16);
  assert.deepEqual(frame.arms.map(a=>a.id),
    ['base','plumeria','energy','energy+plumeria']);
  const trials=plannedTrials(parent).filter(t=>t.rank===6);
  assert.equal(trials.length,16);
  assert.equal(new Set(trials.map(t=>t.id)).size,16);
  assert.deepEqual([...new Set(trials.map(t=>t.candidateSlot))],
    ['A','B']);
  assert.deepEqual([...new Set(trials.map(t=>t.candidateId))],
    ['champion-reference','new-moon-lockbreaker-v1']);
  return {frame,parent,trials};
}

/**
 * @param {'base'|'plumeria'|'energy'|'energy+plumeria'} armName
 * @returns {object} Complete original Native Store trace.
 */
function runFactorialArm(armName){
  const {frame,parent,trials}=frozenFactorialFrame();
  const arm=frame.arms.find(a=>a.id===armName);
  assert.ok(arm,'Unregistered factorial arm');
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const result=runDevelopment({...parent.frozenRunOptions,
    registeredTrials:trials,registeredFrameName:FRAME,
    sourceScopedSpecialEnergyRoot:arm.sourceScopedSpecialEnergyRoot,
    actorPlumeriaAfterPass:arm.actorPlumeriaAfterPass});
  assert.equal(result.attempted,16);
  assert.equal(result.rows.length,16);
  assert.equal(result.enginePin,frame.enginePin);
  assert.equal(result.registeredTrialFrame,FRAME);
  assert.equal(result.sourceScopedSpecialEnergyRootOptIn,
    arm.sourceScopedSpecialEnergyRoot);
  assert.equal(result.actorPlumeriaAfterPassOptIn,
    arm.actorPlumeriaAfterPass);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.ok(result.rows.every(row=>row.qualifiesForCompetitiveInference===false));
  return {
    schema:frame.schema,
    registrationPath:FRAME,registrationBlob:FACTORIAL_BLOB,
    priorRandomParentFrame:PARENT,priorRandomParentBlob:REGISTRATION_BLOB,
    frozenArm:arm,registeredAttempts:16,
    result,competitiveQualifiedGames:0,
    caveat:'Original rank6-only prior-random frame, four development policy variants, paper clock uncalibrated, weak both-player policy, no competitive strength or wins inferred.'
  };
}

if(require.main===module){
  assert.equal(process.argv.length,3);
  process.stdout.write(JSON.stringify(runFactorialArm(process.argv[2]),null,2)+'\n');
}
module.exports={FRAME,FACTORIAL_BLOB,frozenFactorialFrame,runFactorialArm};
