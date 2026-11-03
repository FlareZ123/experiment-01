'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {
  runFrozenCanary,writeAtomicLocked
}=require('./agent20-frozen-rank6-canary-v1.cjs');
const {
  withRegisteredCandidateLilliePanel
}=require('../twinleaf/agent7-prospective-candidate-lillie-after-pass.cjs');
const {
  VERSION,withCandidateStadiumAfterSelectedPass
}=require('../twinleaf/agent20-selected-candidate-stadium-after-pass.cjs');

const ROOT=path.resolve(__dirname,'../..');
const PROFILE=path.join(__dirname,'agent20-frozen-rank6-canary-v1.json');
const OUTPUT=path.join(ROOT,'agent20-ranked-six-stadium-selected-aba-v1-output.json');
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * One three-phase frozen-deal developmental mechanism comparison. Source
 * game has a genuine selected actor turn4 Stadium rather than detached-only
 * copy. Source/card policy/options and both original candidate 60s stay
 * unchanged. Do not use old selected seeds as independent held-out wins.
 */
function run(){
  const originalBytes=fs.readFileSync(PROFILE);
  const registered=JSON.parse(originalBytes).registeredTrials;
  assert.equal(registered.length,4);
  const before=runFrozenCanary();
  const wrapped=withRegisteredCandidateLilliePanel(
    runFrozenCanary,registered,{
      runTrial:withCandidateStadiumAfterSelectedPass
    });
  const after=runFrozenCanary();
  assert.equal(wrapped.audit.rootCompositions,4,
    'Candidate Stadium treatment did not bind all four real source games');
  assert.deepEqual(
    before.rawNativeResult,after.rawNativeResult,
    'Historical repeated control has changed in exact native actions');
  assert.deepEqual(
    before.releaseDisposition,after.releaseDisposition,
    'Historical repeated control changed qualification disposition');
  const treatment=wrapped.result;
  const baseRows=before.rawNativeResult.rows;
  const treatmentRows=treatment.rawNativeResult.rows;
  assert.equal(baseRows.length,registered.length);
  assert.equal(treatmentRows.length,registered.length);
  const rows=registered.map((trial,i)=>{
    const a=baseRows[i],b=treatmentRows[i],z=after.rawNativeResult.rows[i];
    assert.equal(a.trial.id,trial.id);
    assert.equal(b.trial.id,trial.id);
    assert.equal(z.trial.id,trial.id);
    const dealMatch=a.sourceDealFingerprint===b.sourceDealFingerprint;
    const physicalAll=typeof a.fullPhysicalDealFingerprint==='string'&&
      a.fullPhysicalDealFingerprint.length===64&&
      a.fullPhysicalDealFingerprint===b.fullPhysicalDealFingerprint;
    const audit=wrapped.audit.interventions[i];
    assert.equal(audit.trialId,trial.id);
    return {
      trialId:trial.id,sourceRank:trial.rank,seed:trial.seed,
      sourcePhysicalSeat:trial.candidateSlot==='A'?1:0,
      candidatePhysicalSeat:trial.candidateSlot==='A'?0:1,
      exactSourcePhysicalDealMatch:dealMatch,
      originalSourcePhysicalDealFingerprint:a.sourceDealFingerprint,
      sameFullPhysicalDealDigest:physicalAll,
      originalStatus:a.endReason??null,treatmentStatus:b.endReason??null,
      originalNativeWinnerSeat:a.winner??null,
      treatmentNativeWinnerSeat:b.winner??null,
      originalFinish:a.finished??null,
      treatmentFinish:b.finished??null,
      originalRootActionCount:a.rootActionLedger?.length??0,
      treatmentRootActionCount:b.rootActionLedger?.length??0,
      sourceAttackRootCountBefore:a.rootActionLedger?.filter(x=>
        x.action==='AttackAction'&&x.playerSlot===
        (trial.candidateSlot==='A'?1:0)).length??0,
      sourceAttackRootCountAfter:b.rootActionLedger?.filter(x=>
        x.action==='AttackAction'&&x.playerSlot===
        (trial.candidateSlot==='A'?1:0)).length??0,
      candidateStadiumTreatment:audit,
      unqualifiedPaperGame:true
    };
  });
  const selected=rows.reduce((sum,x)=>sum+
    x.candidateStadiumTreatment.nativeAccepted,0);
  const failed=rows.reduce((sum,x)=>sum+
    x.candidateStadiumTreatment.nativeRejected,0);
  const result={
    schema:VERSION,design:'historical-frozen-control-selected-stadium-control',
    originalFrozenProfile:before.releaseProfile,
    originalFrozenProfileSha256:
      createHash('sha256').update(originalBytes).digest('hex'),
    originalTrialCount:registered.length,
    realNativePhaseCount:3,
    totalHistoricalNativeGameExecutions:12,
    controlAExactControlB:true,
    matchedOriginalSourcePhysicalDeals:rows.every(x=>
      x.exactSourcePhysicalDealMatch),
    matchedOriginalFullPhysicalDeals:rows.every(x=>
      x.sameFullPhysicalDealDigest),
    beforeRawNativeSha256:hash(before.rawNativeResult),
    repeatedControlRawNativeSha256:hash(after.rawNativeResult),
    treatmentRawNativeSha256:hash(treatment.rawNativeResult),
    selectedCandidateStadiumRootsAccepted:selected,
    selectedCandidateStadiumRootsRejected:failed,
    rows,
    allFourOriginalRegisteredTrialsPreserved:true,
    originalCandidatePrintedSixtiesUnchanged:true,
    originalSourcePrintedSixtyUnchanged:true,
    historicalSeedReuseNotIndependent:true,
    ownerBotPaperCompetenceUnverified:true,
    officialPaperMatchClockUnverified:true,
    competitivelyQualifiedGames:0,
    winRateEstimatorAvailable:false,
    baseline:{
      rawNativeResult:before.rawNativeResult,
      releaseDisposition:before.releaseDisposition
    },
    treatment:{
      rawNativeResult:treatment.rawNativeResult,
      releaseDisposition:treatment.releaseDisposition
    }
  };
  writeAtomicLocked(OUTPUT,JSON.stringify(result,null,2)+'\n');
  return result;
}
if(require.main===module){
  try{
    const result=run();
    process.stdout.write(JSON.stringify({
      schema:result.schema,matchedSource:result.matchedOriginalSourcePhysicalDeals,
      matchedFull:result.matchedOriginalFullPhysicalDeals,
      selectedStadiums:result.selectedCandidateStadiumRootsAccepted,
      rejected:result.selectedCandidateStadiumRootsRejected,
      rows:result.rows.map(r=>({
        trial:r.trialId,
        control:r.originalStatus,treatment:r.treatmentStatus,
        controlledAttacks:r.sourceAttackRootCountBefore,
        treatedAttacks:r.sourceAttackRootCountAfter,
        selected:r.candidateStadiumTreatment.nativeAccepted,
        ownerActions:r.candidateStadiumTreatment.selectedAlternates
      })),
      qualified:0
    })+'\n');
  }catch(error){
    const failed={
      schema:VERSION,error:String(error?.stack??error),
      competitivelyQualifiedGames:0,winRateEstimatorAvailable:false
    };
    writeAtomicLocked(OUTPUT,JSON.stringify(failed,null,2)+'\n');
    process.exitCode=1;
    process.stdout.write(JSON.stringify({error:failed.error})+'\n');
  }
}
module.exports={VERSION,run};
