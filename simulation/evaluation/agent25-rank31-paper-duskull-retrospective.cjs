'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {scheduledArms,preflight}=require(
  './agent25-nine-omitted-archetypes-source-readiness.cjs');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {assertPinnedNativeStore}=
  require('./agent41-frozen-bilateral-development-v1.cjs');
const {withPaperDuskullDiscardOption,VERSION:HOOK_VERSION}=
  require('../twinleaf/agent25-rank31-paper-duskull-discard-hook.cjs');
const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent25-original-rank31-paper-duskull-retrospective-v1';

/**
 * Both previously native-aborted original rank31 cases, no seed resampling.
 * @returns {object}
 */
function replayPlan(){
  const trials=scheduledArms().filter(row=>
    row.rank===31&&row.candidateSlot==='B');
  assert.equal(trials.length,2);
  assert.equal(trials[0].seed,trials[1].seed);
  assert.deepEqual(trials.map(row=>row.candidateId),
    ['champion-reference','new-moon-lockbreaker-v1']);
  return {trials,printedOriginalRank31:31,sourcePhysicalSeat:0,
    pinnedTwinleaf:profile.pinnedVendorRevision,
    sourceRegistration:preflight(),
    paperHookVersion:HOOK_VERSION,
    hookGitBlobSha:gitBlobHash(fs.readFileSync(path.join(ROOT,
      'simulation/twinleaf/agent25-rank31-paper-duskull-discard-hook.cjs'))),
    retrospective:true,competitiveQualified:false};
}

/**
 * Opt-in correction of one exact printed attack; the original two aborted
 * attempts remain preserved independently in CI 41341992444.
 * @returns {object}
 */
function runReplay(){
  const plan=replayPlan();
  assertPinnedNativeStore(ROOT,profile);
  const old=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  let experiment,hookAudit=null;
  try{
    const hooked=withPaperDuskullDiscardOption(()=>
      require('./agent41-bilateral-v2-development.cjs').runDevelopment({
        ...profile.policyOptions,
        allowAdditionalOriginalSourceRanks:true,
        registeredTrials:plan.trials,
        registeredFrameName:VERSION+'-previously-observed-source-aborts'
      }));
    experiment=hooked.result;
    hookAudit=hooked.audit;
  }finally{
    if(old===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=old;
  }
  assert.equal(experiment.attempted,2);
  assert.equal(experiment.rows.length,2);
  assert.deepEqual(experiment.rows.map(x=>x.trial.id),
    plan.trials.map(x=>x.id));
  const statuses={};
  for(const row of experiment.rows){
    const key=row.status??(row.finished===true?
      'untimed-engine-terminal':'native-incomplete');
    statuses[key]=(statuses[key]??0)+1;
  }
  return {version:VERSION,plan,originalRank:31,
    previouslyFailedNativeRows:2,replayNativeRows:2,
    fullFailureInclusiveOriginalArchiveRun:41341992444,
    analysisIsRetrospective:true,
    isolatedPaperHook:true,hookAudit,
    statuses,rows:experiment.rows,
    actualSourceAttackCount:experiment.rows.reduce((n,row)=>
      n+(row.originalSourceAttackDeclarations??0),0),
    competitivelyQualifiedGames:0,winRateCertified:false,
    caveat:'Both original-source rank31 seed arms were chosen after the native Store failure; native-only paper reducer correction with unchanged source/candidate 60. No fixed-deck strength inference or 25-minute clock.'};
}

if(require.main===module){
  const report=process.argv.includes('--inspect-only')?replayPlan():runReplay();
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
module.exports={VERSION,replayPlan,runReplay};
