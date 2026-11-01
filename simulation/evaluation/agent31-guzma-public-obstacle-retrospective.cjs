'use strict';
const assert=require('node:assert/strict');
const {preflight}=require('./agent43-guzma-nominal-fresh-rank11-pair.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {replayFingerprint}=require('./agent43-guzma-held-root-retrospective.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');
const {withGuzmaPublicObstacleAudit,VERSION}=
  require('../twinleaf/agent31-guzma-public-obstacle-audit.cjs');

const BASELINE='4c2981a904eb939ba32301038514ef269d7c8a07d883b5c90bae903dfbc82216';

function run(){
  const p=preflight();
  const options={...p.registration.setupAndPolicyFixed,
    registeredTrials:p.registration.trials,
    registeredFrameName:p.registration.schema,
    nativeOwnerSupporterOpportunity:true,actorGuzmaNominalGust:false};
  const old=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  let observed;
  try{observed=withGuzmaPublicObstacleAudit(()=>runDevelopment(options));}
  finally{
    if(old===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=old;
  }
  assert.equal(observed.result.rows.length,16);
  const digest=replayFingerprint(observed.result.rows);
  assert.equal(digest,BASELINE,
    'Observer changed original native root action ledger');
  return {schema:VERSION,baselineDigest:BASELINE,observedDigest:digest,
    nativePolicyReplayUnchanged:true,
    sourceRank:11,originalNativeEnginePin:p.native,
    originalMatchedNativeGames:16,
    ...observed.audit,competitiveQualifiedGames:0};
}
if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const p=preflight();
    assert.equal(p.registration.trials.length,16);
    console.log(JSON.stringify({schema:VERSION,baselineDigest:BASELINE,
      nativeEnginePin:p.native,originalGames:16}));
  }else{
    const x=run();
    if(process.env.AGENT31_GUZMA_OBSTACLE_OUTPUT)
      save(process.env.AGENT31_GUZMA_OBSTACLE_OUTPUT,x);
    console.log('AGENT31_PUBLIC_GUZMA_OBSTACLES '+JSON.stringify({
      unchanged:x.nativePolicyReplayUnchanged,
      acceptedRoots:x.acceptedOwnerRoots,
      holdingGuzma:x.acceptedOwnerRootsHoldingGuzma,
      turnsHoldingGuzma:x.uniqueOwnerTurnsWithGuzma,
      fundedBenchTurns:x.ownerTurnsWithAnyFundedBenchAttack,
      nominalKoTurns:x.ownerTurnsWithAnyNominalBenchKo,
      nominalOpenTurns:x.ownerTurnsWithAnyNominalAndOpenSupporter,
      finalPrizeTurns:x.ownerTurnsWithFinalPrizeOpportunity,
      nonfinalPrizeTurns:x.ownerTurnsWithNonfinalOpportunity,
      competitiveQualifiedGames:0}));
  }
}
module.exports={run,BASELINE};
