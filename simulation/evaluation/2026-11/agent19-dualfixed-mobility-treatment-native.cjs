'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../../results/aichi-2026/registrations/agent19-dual-fixed60-four-source-papercore-prospective-20261109.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {inspect,compare,diagnosis,nativeCohortAdmission}=
  require('./agent19-dual-fixed60-fourrank-paperprofile-native.cjs');
const ROOT=path.resolve(__dirname,'../../..');
const OUTPUT=path.join(ROOT,'agent19-fourrank-mobile-root-treatment-native.json');
const VERSION='agent19-fourrank-two-contender-mobile-retreat-development-v1';
/** @param {Buffer} bytes */
function blob(bytes){return createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');}
/** Atomic exclusive persistence for all attempts, including aborted and capped. @param {object} data */
function save(data){
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600),temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const read=fs.openSync(temp,'r');
    try{fs.fsyncSync(read);}finally{fs.closeSync(read);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
function run(){
  const source=inspect();
  assert.equal(source.nativeAttempts,32);
  assert.equal(registration.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(blob(fs.readFileSync(path.join(ROOT,
    'simulation/evaluation/agent41-bilateral-v2-development.cjs'))),
    registration.frozenSourceAndPolicyGitBlobs[0].blob);
  const prev=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  assert.equal(prev,undefined);
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  let tested;
  try{
    tested=withPaperSemanticsProfileV1(()=>runDevelopment({
      ...frozen.policyOptions,...registration.commonActorOptions,
      // All owners, all turns, all registered ranks and both fixed 60s.
      actorGenericFundedFloatStoneRoot:true,
      actorGenericFundedFloatStoneSourceOnly:false,
      actorFlexiblePaidRetreatRoot:true,
      registeredTrials:registration.registeredTrials,
      registeredFrameName:VERSION,
      allowAdditionalOriginalSourceRanks:true,
      nativeRootActionLimit:registration.rootCap,
      isolatePolicyRandomness:true,
      isolatePhysicalShuffleRandomnessAfterSetup:true
    }),registration.profileEnabled);
  }finally{
    if(prev===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=prev;
  }
  assert.equal(tested.result.attempted,32);
  assert.equal(tested.result.rows.length,32);
  const rows=tested.result.rows.map(diagnosis);
  assert.deepEqual(rows.map(x=>x.id),registration.registeredTrials.map(x=>x.id));
  const comparison=compare(rows),admission=nativeCohortAdmission(comparison);
  const treatment={schema:VERSION,branch:'agent19/frozen-dual60-20261109',
    trialMode:'retrospective-fixed-deal-policy-development',
    nativeRunnerBlobSha:registration.frozenSourceAndPolicyGitBlobs[0].blob,
    profileAudit:tested.audit,registration,
    commonMobilityTreatment:{
      actorGenericFundedFloatStoneRoot:true,
      actorGenericFundedFloatStoneSourceOnly:false,
      actorFlexiblePaidRetreatRoot:true
    },
    admission,comparison,allNativeRows:tested.result.rows,
    qualifyCompetitiveGames:0,
    limitations:'All 32 seeds previously observed under default mobility. Historical deterministic paired policy test, no prospective performance claim.'};
  save(treatment);
  process.stdout.write('AGENT19_GENERIC_MOBILITY_NATIVE '+JSON.stringify({
    admission,summary:comparison.summary,perRank:comparison.perRank,
    output:path.basename(OUTPUT)})+'\n');
  if(admission.status!=='ADMIT_DEVELOPMENT_ONLY')process.exitCode=1;
  return treatment;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only'))process.stdout.write(JSON.stringify(inspect())+'\n');
  else run();
}
module.exports={VERSION,run};
