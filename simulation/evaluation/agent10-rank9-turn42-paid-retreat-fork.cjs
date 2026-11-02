'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {run:runControl,VERSION:CONTROL_VERSION,treatmentOptions}=
  require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
const {withRank9Turn42PaidRetreat,VERSION:FORK_VERSION}=
  require('../twinleaf/agent10-rank9-turn42-paid-retreat-native.cjs');
const VERSION='agent10-rank9-original-t42-paid-retreat-same-deal-v1';
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

const profile=require('./agent41-frozen-bilateral-development-v2.json');
const ROOT=require('node:path').resolve(__dirname,'../..');

/**
 * Canonical actor-root composition itself creates a bot decoder. A wrapper
 * installed around runControl() is superseded and becomes a no-op. Wrap
 * exactly the target canonical arm's deepest *actual Store execute* instead,
 * after all ordinary actor wrappers have been installed. Restrict the
 * intervention to native source owner B on the unchanged New Moon rank9 deal.
 *
 * Temporarily reload the shared development module to bind a scoped
 * replacement of canonical composition, without modifying its source,
 * ambient policy or any installed global module after this function returns.
 */
function runInternallyScopedT42Treatment(){
  const canonicalPath=require.resolve('./agent7-canonical-actor-composition.cjs');
  const developmentPath=require.resolve('./agent41-bilateral-v2-development.cjs');
  const canonical=require(canonicalPath);
  const originalCanonical=canonical.withCanonicalActorOnlyPolicy;
  const previousDevelopmentCache=require.cache[developmentPath];
  assert.equal(typeof originalCanonical,'function');
  let canonicalArms=0;
  let rank9T42Audit=null;
  const scopedCanonical=function(runMatch,adapters,options){
    const armIndex=canonicalArms++;
    if(armIndex!==1)return originalCanonical(runMatch,adapters,options);
    return originalCanonical(()=>{
      const selected=withRank9Turn42PaidRetreat(runMatch,{targetTrialIndex:0});
      rank9T42Audit=selected.audit;
      return selected.result;
    },adapters,options);
  };
  const {assertNoUnreviewedAmbientAgentEnvironment,assertPinnedNativeStore}=
    require('./agent41-frozen-bilateral-development-v1.cjs');
  assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  assertPinnedNativeStore(ROOT,profile);
  const previousEnv={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    previousEnv[key]=process.env[key];
    process.env[key]=value;
  }
  canonical.withCanonicalActorOnlyPolicy=scopedCanonical;
  delete require.cache[developmentPath];
  try{
    const {runDevelopment}=require(developmentPath);
    const observed=runDevelopment(treatmentOptions());
    assert.equal(canonicalArms,4,'Canonical four-arm scheduling drift');
    assert.ok(rank9T42Audit,'Target original source arm did not execute');
    return {observed,audit:rank9T42Audit,canonicalArms};
  }finally{
    canonical.withCanonicalActorOnlyPolicy=originalCanonical;
    delete require.cache[developmentPath];
    if(previousDevelopmentCache)
      require.cache[developmentPath]=previousDevelopmentCache;
    for(const [key,value] of Object.entries(previousEnv)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}


/**
 * Read the original frozen native Store in two complete 4-arm sequences.
 * Only the target source second own turn42 receives a different bot root.
 */
function run(){
  const control=runControl();
  const experimental=runInternallyScopedT42Treatment();
  const {observed:treatment,audit}=experimental;
  assert.equal(control.version,CONTROL_VERSION);
  assert.equal(treatment.attempted,4);
  assert.equal(control.complete,true);
  assert.equal(treatment.attempted,4);
  assert.equal(control.rows.length,4);
  assert.equal(treatment.rows.length,4);
  const perTrial=control.rows.map((prior,i)=>{
    const later=treatment.rows[i];
    assert.equal(prior.trial.id,later.trial.id);
    const sameSource=prior.sourceDealFingerprint===later.sourceDealFingerprint;
    const sameFullDeal=prior.fullPhysicalDealFingerprint===
      later.fullPhysicalDealFingerprint;
    const before=prior.rootActionLedger.filter(x=>x.turnBefore<42);
    const after=later.rootActionLedger.filter(x=>x.turnBefore<42);
    const prefixIdentical=sha(before)===sha(after);
    const wholeRootIdentical=prior.rootActionLedgerSha256===
      later.rootActionLedgerSha256;
    const firstDivergentRoot=later.rootActionLedger.find((row,index)=>
      JSON.stringify(row)!==JSON.stringify(prior.rootActionLedger[index]))??null;
    return {
      id:prior.trial.id,sourceSeat:prior.sourceSeat,
      candidateSeat:prior.candidateSeat,
      seed:prior.trial.seed,
      originalSourcePrintingHash:prior.sourceDeckFingerprint,
      originalCandidatePrintingHash:prior.candidateDeckFingerprint,
      baselineFullPhysicalDealFingerprint:prior.fullPhysicalDealFingerprint,
      treatmentFullPhysicalDealFingerprint:later.fullPhysicalDealFingerprint,
      sameFullDeal,sameSource,
      baselineRootDigest:prior.rootActionLedgerSha256,
      treatmentRootDigest:later.rootActionLedgerSha256,
      prefixThroughGlobalTurn41Identical:prefixIdentical,
      completeRootIdentical:wholeRootIdentical,
      firstTreatmentDivergence:firstDivergentRoot,
      baseline:{actionCount:prior.actionCount,turns:prior.turns,
        finished:prior.finished,winner:prior.winner,
        endReason:prior.endReason,finalPrizes:prior.finalPrizes},
      treatment:{actionCount:later.actionCount,turns:later.turns,
        finished:later.finished,winner:later.winner,
        endReason:later.endReason,finalPrizes:later.finalPrizes},
      t42BaselineSourceRoots:prior.rootActionLedger.filter(x=>
        x.playerSlot===prior.sourceSeat&&x.turnBefore===42),
      t42TreatmentSourceRoots:later.rootActionLedger.filter(x=>
        x.playerSlot===later.sourceSeat&&x.turnBefore===42),
      sourcePost42Attacks:(later.sourceAttackSettlement?.events??[]).filter(x=>
        x.turnBefore>=42),
      sourcePost42RootAttacks:later.rootActionLedger.filter(x=>
        x.playerSlot===later.sourceSeat&&x.turnBefore>=42&&
        x.action==='AttackAction').slice(0,12),
      opponentPost42Roots:later.rootActionLedger.filter(x=>
        x.playerSlot===later.candidateSeat&&x.turnBefore>42).slice(0,18)
    };
  });
  const special=perTrial[1];
  const negativeControlPass=perTrial.filter((x,i)=>i!==1).every(x=>
    x.completeRootIdentical);
  const physicalProof=perTrial.every(x=>x.sameSource&&x.sameFullDeal);
  const ownerPrefixProof=special.prefixThroughGlobalTurn41Identical;
  return {
    version:VERSION,controlVersion:CONTROL_VERSION,
    forkVersion:FORK_VERSION,
    canonicalFourArmOrder:experimental.canonicalArms,
    controlGitHead:process.env.GITHUB_SHA??null,
    enginePin:treatment.enginePin,
    baselineSourceClosureSha256:control.sourceClosureSha256,
    treatmentSourceClosureSha256:treatment.sourceClosureSha256,
    sameFullPhysicalDeals:physicalProof,
    nativePrefixThroughT41Identical:ownerPrefixProof,
    otherThreeArmsNoEffect:negativeControlPass,
    treatmentHook:audit,
    perTrial,attempted:perTrial.length,
    nonQualifiedCompetitiveWins:0,
    paperRetreatAndAttackQualified:false,
    caveat:'Two retrospective original same-deal four-arm native runs with one source actor t42 Retreat proposal. Native root/energy/attack/prompt/KO must be inspected; completed engine outcomes are not paper matches, no independent sample, no official clock.'
  };
}
if(require.main===module){
  const output=run();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(!output.sameFullPhysicalDeals||
     !output.nativePrefixThroughT41Identical||
     !output.otherThreeArmsNoEffect)process.exitCode=1;
}
module.exports={VERSION,run};
