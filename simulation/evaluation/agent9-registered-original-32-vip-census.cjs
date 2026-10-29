'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const SCHEMA='agent9-retrospective-original-32-bilateral-vip-census-v1';

/**
 * Compare the same preselected 32 physical games under a default-off and
 * owner-visible first-turn VIP policy. Zero game-strength qualification is
 * imposed regardless of terminal wins, losses, caps or errors.
 *
 * @param {object} baseline Original scout run with VIP policy disabled.
 * @param {object} treatment Same checkout and trials with VIP enabled.
 * @param {object} registration Immutable study design saved before the trial.
 * @returns {object} Explicit all-attempt native effect and parity census.
 */
function analyze(baseline,treatment,registration){
  assert.equal(registration.schema,
    'agent9-registered-existing-32-arm-vip-coverage-probe-v1');
  assert.equal(registration.attempts,32);
  for(const run of [baseline,treatment]){
    assert.equal(run.registrationBlob,
      registration.parentRegistrationExpectedBlob);
    assert.equal(run.developmentResult.enginePin,registration.enginePin);
    assert.equal(run.developmentResult.attempted,32);
    assert.equal(run.developmentResult.rows.length,32);
    assert.equal(run.summary.attempts,32);
    assert.equal(run.developmentResult.competitiveQualifiedGames,0);
  }
  assert.equal(baseline.registrationBlob,treatment.registrationBlob);
  const controls=new Map(baseline.developmentResult.rows.map(row=>[
    row.trial?.id,row]));
  const trials=treatment.developmentResult.rows;
  assert.equal(controls.size,32);
  assert.equal(new Set(trials.map(row=>row.trial?.id)).size,32);

  const attempts=[];
  for(const treated of trials){
    const trial=treated.trial;
    const original=controls.get(trial.id);
    assert.ok(original,'Missing control arm '+trial.id);
    assert.equal(original.trial.seed,trial.seed);
    assert.equal(original.trial.candidateId,trial.candidateId);
    assert.equal(original.trial.candidateSlot,trial.candidateSlot);
    assert.equal(original.trial.rank,trial.rank);
    const sourceSeat=trial.candidateSlot==='A'?1:0;
    const candidateSeat=1-sourceSeat;
    const baseCoverage=original.actorOnlyDecisionCoverage;
    const coverage=treated.actorOnlyDecisionCoverage;
    const audit=coverage?.detailedComponentAudits?.ownerVipAfterPass??null;
    const controlOptIn=baseCoverage?.ownerVipAfterPassOptIn??null;
    const treatmentOptIn=coverage?.ownerVipAfterPassOptIn??null;
    const fingerprintParity=
      original.sourceDealFingerprint===treated.sourceDealFingerprint &&
      original.fullPhysicalDealFingerprint===
        treated.fullPhysicalDealFingerprint &&
      original.actualStarterSeat===treated.actualStarterSeat;
    const fullFingerprintPresent=Boolean(
      original.sourceDealFingerprint&&treated.sourceDealFingerprint&&
      original.fullPhysicalDealFingerprint&&
      treated.fullPhysicalDealFingerprint);
    const source=audit?.bySeat?.[sourceSeat]??null;
    const candidate=audit?.bySeat?.[candidateSeat]??null;
    const firstPasses=audit?.passOpportunities??[];
    const structuralContentions=audit?.firstTurnRootContentions??[];
    const sourceContentions=structuralContentions.filter(row=>
      row.seat===sourceSeat);
    const candidateContentions=structuralContentions.filter(row=>
      row.seat===candidateSeat);
    const actualSourceFirst=treated.actualStarterSeat===sourceSeat;
    attempts.push({
      id:trial.id,seed:trial.seed,rank:trial.rank,
      candidateId:trial.candidateId,candidateSlot:trial.candidateSlot,
      sourceSeat,candidateSeat,
      actualSourceFirst,actualStarter:treated.actualStarterSeat??null,
      controlStatus:original.status??(original.finished?'terminal':'capped'),
      treatedStatus:treated.status??(treated.finished?'terminal':'capped'),
      controlSourceFingerprint:original.sourceDealFingerprint??null,
      treatmentSourceFingerprint:treated.sourceDealFingerprint??null,
      fullFingerprintPresent,fingerprintParity:fullFingerprintPresent&&fingerprintParity,
      baselineVipEnabled:controlOptIn,
      treatmentVipEnabled:treatmentOptIn,
      sourceVipItems:source?.items??null,
      sourceVipSearches:source?.searches??null,
      sourceVipBenchConfirmed:source?.benchConfirmed??null,
      candidateVipItems:candidate?.items??null,
      candidateVipSearches:candidate?.searches??null,
      candidateVipBenchConfirmed:candidate?.benchConfirmed??null,
      originalPassRoots:audit?.originalPassRoots??null,
      actualSourceHeldVipFirstPass:firstPasses.some(item=>
        item.seat===sourceSeat&&item.heldVip&&item.turn<=2),
      attemptedSourceVipFirstPass:firstPasses.some(item=>
        item.seat===sourceSeat&&item.selected&&item.turn<=2),
      sourceVipStructurallyOpenNonPassRoots:sourceContentions.length,
      sourceVipStructurallyOpenAcceptedAttackRoots:
        sourceContentions.filter(row=>row.otherAction==='AttackAction'&&
          row.alternativeAccepted===true).length,
      candidateVipStructurallyOpenNonPassRoots:candidateContentions.length,
      candidateVipStructurallyOpenAcceptedAttackRoots:
        candidateContentions.filter(row=>row.otherAction==='AttackAction'&&
          row.alternativeAccepted===true).length,
      sourceContendedNativeRoots:sourceContentions.map(row=>({
        turn:row.turn,otherAction:row.otherAction,
        otherCard:row.otherCard??null,otherAttack:row.otherAttack??null,
        originalAccepted:row.alternativeAccepted,
        structuralVipOnly:true
      })),
      candidateContendedNativeRoots:candidateContentions.map(row=>({
        turn:row.turn,otherAction:row.otherAction,
        otherCard:row.otherCard??null,otherAttack:row.otherAttack??null,
        originalAccepted:row.alternativeAccepted,
        structuralVipOnly:true
      })),
      unresolvedOwnerSearches:audit?.unresolvedOwnerSearches??null,
      unconfirmedNativeBench:audit?.nativeBenchUnconfirmed??null,
      nativeRejectedItems:audit?.rejectedItems??null,
      nativeRejectedSearches:audit?.rejectedSearches??null,
      selectedCards:audit?.examples?.filter(row=>
        row.kind==='vip-search'&&row.seat===sourceSeat).flatMap(row=>
          row.printings??[])??[],
      nativeError:treated.nativeAbortEvidence?.errorMessage??
        treated.errorMessage??null,
      competitiveQualified:false
    });
  }
  assert.equal(attempts.length,32);
  const sum=(field)=>attempts.reduce((total,row)=>
    total+(typeof row[field]==='number'?row[field]:0),0);
  const complete=attempts.filter(row=>
    row.fingerprintParity&&row.baselineVipEnabled===false&&
    row.treatmentVipEnabled===true&&row.sourceVipItems!==null&&
    row.candidateVipItems!==null);
  const incomplete=attempts.filter(row=>!complete.includes(row));
  const nativePositive=complete.filter(row=>row.sourceVipItems>0&&
    row.sourceVipSearches===row.sourceVipItems&&
    row.sourceVipBenchConfirmed===row.sourceVipItems);
  const sourceMissingPrompt=attempts.filter(row=>
    row.sourceVipItems!==null&&(
      row.sourceVipSearches!==row.sourceVipItems||
      row.sourceVipBenchConfirmed!==row.sourceVipSearches));
  const candidateMissingPrompt=attempts.filter(row=>
    row.candidateVipItems!==null&&(
      row.candidateVipSearches!==row.candidateVipItems||
      row.candidateVipBenchConfirmed!==row.candidateVipSearches));
  const gatePassed=incomplete.length===0&&
    baseline.developmentResult.errors===0&&
    treatment.developmentResult.errors===0&&
    sourceMissingPrompt.length===0&&candidateMissingPrompt.length===0&&
    attempts.every(row=>row.nativeRejectedItems===0&&
      row.nativeRejectedSearches===0&&row.unconfirmedNativeBench===0&&
      row.unresolvedOwnerSearches===0);
  return {
    schema:SCHEMA,registration:registration.schema,
    parentRegistrationBlob:baseline.registrationBlob,
    baselinePolicy:'AGENT9_BATTLE_VIP_AFTER_PASS_DEV=false',
    treatmentPolicy:'AGENT9_BATTLE_VIP_AFTER_PASS_DEV=true',
    enginePin:registration.enginePin,
    attempts:32,matchedCompleteAttempts:complete.length,
    incompleteAttempts:incomplete.map(row=>row.id),
    sourceVipPhysicalPositiveArms:nativePositive.length,
    sourceVipAcceptedItems:sum('sourceVipItems'),
    sourceVipAcceptedOwnerSearches:sum('sourceVipSearches'),
    sourceVipPhysicalBenchConfirmed:sum('sourceVipBenchConfirmed'),
    candidateVipAcceptedItems:sum('candidateVipItems'),
    candidateVipPhysicalBenchConfirmed:sum('candidateVipBenchConfirmed'),
    sourceFirstObservedHeldVipPassArms:attempts.filter(row=>
      row.actualSourceFirst&&row.actualSourceHeldVipFirstPass).length,
    sourceFirstAttemptedVipPassArms:attempts.filter(row=>
      row.actualSourceFirst&&row.attemptedSourceVipFirstPass).length,
    sourcePotentialVipPriorityContentions:sum('sourceVipStructurallyOpenNonPassRoots'),
    sourcePotentialVipPriorityAcceptedAttacks:
      sum('sourceVipStructurallyOpenAcceptedAttackRoots'),
    candidatePotentialVipPriorityContentions:
      sum('candidateVipStructurallyOpenNonPassRoots'),
    candidatePotentialVipPriorityAcceptedAttacks:
      sum('candidateVipStructurallyOpenAcceptedAttackRoots'),
    sourceItemWithoutNativeOwnerPrompt:sourceMissingPrompt.map(row=>row.id),
    candidateItemWithoutNativeOwnerPrompt:candidateMissingPrompt.map(row=>row.id),
    nativeRejectedItemAttempts:sum('nativeRejectedItems'),
    nativeRejectedPromptAttempts:sum('nativeRejectedSearches'),
    nativeBenchUnconfirmed:sum('unconfirmedNativeBench'),
    unresolvedOwnerSearches:sum('unresolvedOwnerSearches'),
    baselineNativeErrors:baseline.developmentResult.errors,
    treatmentNativeErrors:treatment.developmentResult.errors,
    baselineCapped:baseline.summary.censored,
    treatmentCapped:treatment.summary.censored,
    gatePassed,attemptRows:attempts,
    competitiveQualifiedGames:0,
    candidateRankingQualified:false,
    caveat:'32 previously selected two-rank source deals, not independent prospective Top32 coverage. Counts measure original native Item and prompt mechanics under an incomplete human-playing policy, with every attempted arm preserved. No result estimates win probability.'
  };
}
if(require.main===module){
  assert.equal(process.argv.length,5,
    'Expected control JSON, treatment JSON, frozen registration');
  const [baseline,treatment,registration]=process.argv.slice(2)
    .map(file=>JSON.parse(fs.readFileSync(file,'utf8')));
  const result=analyze(baseline,treatment,registration);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  process.stderr.write('AGENT9_REGISTERED_32_VIP '+JSON.stringify({
    attempted:result.attempts,complete:result.matchedCompleteAttempts,
    sourceItems:result.sourceVipAcceptedItems,
    physicalBenches:result.sourceVipPhysicalBenchConfirmed,
    candidateItems:result.candidateVipAcceptedItems,
    structuralContentions:{
      source:result.sourcePotentialVipPriorityContentions,
      sourceNativeAttacks:result.sourcePotentialVipPriorityAcceptedAttacks,
      candidate:result.candidatePotentialVipPriorityContentions,
      candidateNativeAttacks:result.candidatePotentialVipPriorityAcceptedAttacks
    },
    errors:[result.baselineNativeErrors,result.treatmentNativeErrors],
    censored:[result.baselineCapped,result.treatmentCapped],
    gatePassed:result.gatePassed,
    competitive:result.competitiveQualifiedGames
  })+'\n');
  if(!result.gatePassed)process.exitCode=1;
}
module.exports={SCHEMA,analyze};
