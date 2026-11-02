'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registered=require('./agent37-rank5-fusion-mobility-prospective.cjs');
const {sourceQuickBallAudit}=
  require('./agent9-rank5-quickball-activation-prospective.cjs');

const VERSION='agent9-rank5-quickball-same-revision-pair-v1';
const FILE='results/aichi-2026/registrations/agent9-rank5-quickball-same-revision-pair-20261102.json';
const ROOT=path.resolve(__dirname,'../..');

/** Frozen, within-run A/B original-source native Quick Ball toggle. */
function run(){
  const bytes=fs.readFileSync(path.join(ROOT,FILE));
  const registration=JSON.parse(bytes);
  assert.equal(registration.registeredGameCount,16);
  assert.equal(registration.noPostHocExclusion,true);
  const originalEnv=process.env.AGENT8_ACTOR_QUICK_BALL_DEV;
  let baseline,treatment;
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    baseline=registered.run();
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='true';
    treatment=registered.run();
  }finally{
    if(originalEnv===undefined)delete process.env.AGENT8_ACTOR_QUICK_BALL_DEV;
    else process.env.AGENT8_ACTOR_QUICK_BALL_DEV=originalEnv;
  }
  const pairs=[];
  for(const mode of registration.gamePolicyModes){
    const off=baseline.modes[mode]?.attempts;
    const on=treatment.modes[mode]?.attempts;
    assert.ok(Array.isArray(off)&&off.length===4&&
      Array.isArray(on)&&on.length===4);
    for(let i=0;i<4;i++){
      const a=off[i],b=on[i];
      assert.equal(a.trial.id,b.trial.id);
      const pa=sourceQuickBallAudit(a.rawNativeRow);
      const pb=sourceQuickBallAudit(b.rawNativeRow);
      pairs.push({mode,trialId:a.trial.id,
        fullPhysicalDealIdentical:
          a.summary.fullPhysicalDealFingerprint!=null&&
          a.summary.fullPhysicalDealFingerprint===
            b.summary.fullPhysicalDealFingerprint,
        sourceDealIdentical:
          a.summary.sourceDealFingerprint!=null&&
          a.summary.sourceDealFingerprint===b.summary.sourceDealFingerprint,
        off:{quickBall:pa.acceptedSourceQuickBall,
          rootFlag:pa.rootFlagEnabled,
          sourceAttacks:a.summary.sourceAttackDeclarations,
          nativeDisposition:a.summary.nativeDisposition,
          nativeWinner:a.rawNativeRow?.winner??null,
          finalPrizes:a.rawNativeRow?.finalPrizes??null,
          sourceSeat:a.summary.sourceSeat},
        on:{quickBall:pb.acceptedSourceQuickBall,
          rootFlag:pb.rootFlagEnabled,
          sourceAttacks:b.summary.sourceAttackDeclarations,
          nativeDisposition:b.summary.nativeDisposition,
          nativeWinner:b.rawNativeRow?.winner??null,
          finalPrizes:b.rawNativeRow?.finalPrizes??null,
          sourceSeat:b.summary.sourceSeat},
        competitiveQualified:false});
    }
  }
  assert.equal(pairs.length,8);
  return {schema:VERSION,registeredBeforeOutcome:true,
    registrationSha256:createHash('sha256').update(bytes).digest('hex'),
    originalSourcePrinted60Sha256:baseline.originalSourcePrinted60Sha256,
    sameProcessSameCode:true,nativeAttemptCount:16,allArmsPreserved:true,
    pairs,baseline,treatment,
    competitiveQualifiedGames:0,certifiedWinRate:null};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,FILE,run};
