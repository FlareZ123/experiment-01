'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {run:runControl,VERSION:CONTROL_VERSION}=
  require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
const {withRank9Turn42PaidRetreat,VERSION:FORK_VERSION}=
  require('../twinleaf/agent10-rank9-turn42-paid-retreat-native.cjs');
const VERSION='agent10-rank9-original-t42-paid-retreat-same-deal-v1';
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Read the original frozen native Store in two complete 4-arm sequences.
 * Only the target source second own turn42 receives a different bot root.
 */
function run(){
  const control=runControl();
  const experimental=withRank9Turn42PaidRetreat(runControl);
  const treatment=experimental.result,audit=experimental.audit;
  assert.equal(control.version,CONTROL_VERSION);
  assert.equal(treatment.version,CONTROL_VERSION);
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
