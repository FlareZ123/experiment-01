'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const registration=require('../../results/aichi-2026/registrations/agent25-nine-omitted-archetypes-source-readiness-20261101.json');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {scheduledArms,preflight}=require(
  './agent25-nine-omitted-archetypes-source-readiness.cjs');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {assertPinnedNativeStore}=
  require('./agent41-frozen-bilateral-development-v1.cjs');
const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent25-original-rank19-native-physical-label-retrospective-v1';

function replayPlan(){
  const trials=scheduledArms().filter(row=>row.rank===19);
  assert.equal(trials.length,4);
  assert.equal(new Set(trials.map(row=>row.seed)).size,2);
  assert.deepEqual(trials.map(row=>row.candidateSlot),['A','A','B','B']);
  const legacy=require('../twinleaf/native-accepted-target-store-observer.cjs');
  assert.equal(legacy.rootLabelMatchesNativePrinting('Ho-Oh-EX',
    'Ho-Oh EX DRX'),true);
  assert.equal(legacy.rootLabelMatchesNativePrinting(
    'Arceus & Dialga & Palkia-GX',
    'Arceus & Dialga & Palkia GX CEC'),true);
  return {trials,policyOptions:profile.policyOptions,
    commonSourcePinned:registration.sourceRosterBlob,
    originalPrefixedRegistration:registration.schema,
    fullRegistrationPreflight:preflight(),
    strictLabelAliasCodeBlob:gitBlobHash(fs.readFileSync(path.join(ROOT,
      'simulation/twinleaf/native-accepted-target-store-observer.cjs')))};
}

function runReplay(){
  const plan=replayPlan();
  assertPinnedNativeStore(ROOT,profile);
  const old=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  let experiment;
  try {
    experiment=require('./agent41-bilateral-v2-development.cjs')
      .runDevelopment({...profile.policyOptions,
        allowAdditionalOriginalSourceRanks:true,
        registeredTrials:plan.trials,
        registeredFrameName:VERSION+'-already-examined-source-seeds'});
  }finally{
    if(old===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=old;
  }
  assert.equal(experiment.attempted,4);
  assert.equal(experiment.rows.length,4);
  const counts={};
  for(const row of experiment.rows){
    const status=row.status??(row.finished===true?
      'untimed-engine-terminal':'native-action-cap-or-incomplete');
    counts[status]=(counts[status]??0)+1;
  }
  return {version:VERSION,plan,originalSourceRank:19,
    analysisIsRetrospective:true,
    originalSourceArmsPreviouslyAbortedOnTwoLegacyLabelMismatches:4,
    originalSourceRank19AliasEvidenceCI:41341992444,
    nativeStoreAttempts:4,preservedRows:experiment.rows.length,
    summary:counts,rows:experiment.rows,
    qualifiedCompetitiveGames:0,candidateWinRateCertified:false,
    limitation:'Selected exact rank19 physical seeds after observing the native target-name discrepancy. This is a strict receipt/linkage repair test, not an independent candidate strength sample.'};
}

if(require.main===module){
  const report=process.argv.includes('--inspect-only')?replayPlan():runReplay();
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
module.exports={VERSION,replayPlan,runReplay};
