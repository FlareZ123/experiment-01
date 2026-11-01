'use strict';

const assert=require('node:assert/strict');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {VERSION:BASELINE_VERSION,scheduledArms,preflight}=
  require('./agent10-original-rank9-absol-electrode-development.cjs');
const {summarizeEight}=require('./agent16-original-rank1-shadow-rider-development.cjs');
const ROOT=require('node:path').resolve(__dirname,'../..');

const VERSION='agent10-rank9-evolution-plus-firstattack-vip-native-development-v1';

/** Single pre-declared native policy difference. */
function treatmentOptions(){
  assert.equal(profile.policyOptions.actorOnlyComposition,true);
  assert.equal(profile.policyOptions.actorNaturalEvolutionRoot,undefined,
    'Frozen original policy unexpectedly already includes ordinary evolution');
  return {...profile.policyOptions,
    actorNaturalEvolutionRoot:true,
    actorVipBeforeAttack:true,
    allowAdditionalOriginalSourceRanks:true,
    registeredTrials:scheduledArms(),
    registeredFrameName:VERSION};
}

/** Four physical native arms preserving the baseline registered seeds and prints. */
function run(){
  const base=preflight();
  assert.equal(base.version,BASELINE_VERSION);
  const {assertNoUnreviewedAmbientAgentEnvironment,assertPinnedNativeStore}=
    require('./agent41-frozen-bilateral-development-v1.cjs');
  assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  assertPinnedNativeStore(ROOT,profile);
  const prior={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    prior[key]=process.env[key];
    process.env[key]=value;
  }
  try {
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    const observed=runDevelopment(treatmentOptions());
    const rows=observed.rows??[];
    const {auditSourceClosure}=require('./agent36-source-closure-audit.cjs');
    const closure=auditSourceClosure(ROOT,[
      'simulation/evaluation/agent41-bilateral-v2-development.cjs'
    ]);
    return {
      version:VERSION,baselineVersion:BASELINE_VERSION,
      baselineNativeRunId:41339009194,baselineNativeArtifactId:13096871120,
      originalSourceInspection:base,
      frozenPolicyProfileGitBlob:base.policyBlobSha,
      onlyPolicyChange:'actorVipBeforeAttack false -> true (both native seats; evolution option remains true)',
      originalSourceRank:9,sourceArchetype:'Absol Electrode',
      enginePin:profile.pinnedVendorRevision,
      researchHeadCommit:process.env.GITHUB_SHA??null,
      sourceClosureSha256:closure.digest,
      sourceClosureLimitations:closure.limitations,
      attempted:observed.attempted,expectedAttempts:4,
      complete:observed.attempted===4&&rows.length===4,
      ...summarizeEight(rows),rows,paired:observed.paired??null,
      competitiveQualifiedGames:0,winRateCertified:false,
      caveat:'Retrospective original rank9 same-deal native mechanism fork: early first-turn VIP Item before a source/candidate Attack, with ordinary evolution retained from the previous treatment. Candidate/source 60s and seed groups unchanged; no game win-rate claim, paper prompt certification, official clock or complete source strategy.'
    };
  } finally{
    for(const [key,value] of Object.entries(prior)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module){
  const inspect=process.argv.includes('--inspect-only');
  const output=inspect?
    {version:VERSION,originalSourceInspection:preflight(),
      treatmentOptions:{
        actorNaturalEvolutionRoot:treatmentOptions().actorNaturalEvolutionRoot,
        actorVipBeforeAttack:treatmentOptions().actorVipBeforeAttack,
        trials:treatmentOptions().registeredTrials.map(x=>x.id)
      },competitiveQualifiedGames:0}
    :run();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(!inspect&&!output.complete)process.exitCode=1;
}
module.exports={VERSION,treatmentOptions,run};
