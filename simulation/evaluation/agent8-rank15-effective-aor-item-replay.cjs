'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {preflight,compareRows,writeJsonAtomically}=
  require('./agent8-rank15-movement-root-paired-development.cjs');

const VERSION='agent8-rank15-effective-aor-item-veto-retrospective-v1';
const OUTPUT='agent8-rank15-effective-aor-item-retrospective';

/** @param {object[]} rows @returns {object} */
function statuses(rows){
  return rows.reduce((result,row)=>{
    const key=row.status??(row.finished===true?'engine-terminal':
      row.finished===false?'native-unfinished':'unclassified');
    result[key]=(result[key]??0)+1;
    return result;
  },{});
}

/** @param {object} row @returns {object} */
function gateReceipt(row){
  const fog=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.fog;
  return {
    id:row.trial?.id,
    status:row.status??(row.finished===true?'engine-terminal':
      row.finished===false?'native-unfinished':'unclassified'),
    winner:row.finished===true?row.winner??null:null,
    nativeAorItemLockOptIn:fog?.nativeAorItemLockOptIn??null,
    skippedAorFogRoots:fog?.skippedAorFogRoots??null,
    skippedAorGenericItemTactics:fog?.skippedAorGenericItemTactics??null,
    aorGateChecks:fog?.aorGateChecks??null,
    aorGateNativeVetoes:fog?.aorGateNativeVetoes??null,
    aorGateEvents:fog?.aorGateEvents??null,
    attemptedRejectedItem:row.nativeRejectedPlayCard?.playedCardPrinting??null,
    nativeSetupReceiptStatus:row.nativeSetupCoinChoiceReceipt?.status??null,
    competitiveQualified:false
  };
}

/** Execute the preexisting original-seed source frame as a new policy diagnostic. */
function run(){
  const provenance=preflight();
  const registration=provenance.registration;
  const options={
    ...registration.fixedBothArmOptions,
    allowAdditionalOriginalSourceRanks:true,
    registeredTrials:registration.trials,
    registeredFrameName:registration.schema,
    sameRootPublicEventReceipt:true,
    nativeRejectedActionEvidence:true
  };
  assert.equal(options.actorOnlyComposition,true);
  assert.equal(options.actorNaturalEvolutionRoot,true);
  assert.equal(options.sameRootChoiceApply,true);
  // New comparison has an identical public movement policy in both arms.
  // Only this explicit native-effective AOR Item filter differs.
  const control=runDevelopment({...options,actorNativeAorItemLock:false});
  const filtered=runDevelopment({...options,actorNativeAorItemLock:true});
  assert.equal(control.rows.length,16);
  assert.equal(filtered.rows.length,16);
  const pairs=compareRows(control,filtered);
  const pairedDigest=createHash('sha256')
    .update(JSON.stringify(pairs.map(p=>({
      id:p.id,seed:p.seed,samePhysicalSourceDeal:p.samePhysicalSourceDeal,
      sameActualStarter:p.sameActualStarter,bothNativeSetupCertified:
        p.bothNativeSetupCertified,
      controlStatus:p.control.status,treatmentStatus:p.treatment.status
    })))).digest('hex');
  const summary={
    version:VERSION,registrationGitBlob:provenance.registrationBlob,
    originalRosterBlob:provenance.rosterBlob,
    sourceRank:15,sourceArchetype:provenance.source.archetype,
    enginePin:provenance.enginePin,
    researchHeadCommit:process.env.GITHUB_SHA??null,
    originalRegisteredSeedsReusedForRetrospectiveTreatment:true,
    independentProspectiveTrials:0,
    fixedOriginalSixties:true,
    totalAttempts:32,
    baselineStatuses:statuses(control.rows),
    nativeEffectiveGateStatuses:statuses(filtered.rows),
    matchingSourceDealPairs:pairs.filter(p=>
      p.samePhysicalSourceDeal===true).length,
    differentSourceDealPairs:pairs.filter(p=>
      p.samePhysicalSourceDeal===false).length,
    unknownSourceDealPairs:pairs.filter(p=>
      p.samePhysicalSourceDeal===null).length,
    nativeSetupCertifiedPairs:pairs.filter(p=>
      p.bothNativeSetupCertified===true&&p.sameActualStarter===true).length,
    baselineAbortedIds:control.rows.filter(row=>row.status==='engine-error')
      .map(row=>row.trial.id),
    gatedAbortedIds:filtered.rows.filter(row=>row.status==='engine-error')
      .map(row=>row.trial.id),
    baselineGateReceipts:control.rows.map(gateReceipt),
    treatmentGateReceipts:filtered.rows.map(gateReceipt),
    pairedStatusRows:pairs.map(p=>({
      id:p.id,sourceDealMatched:p.samePhysicalSourceDeal,
      setupCertified:p.bothNativeSetupCertified,
      control:p.control.status,treatment:p.treatment.status,
      controlWinner:p.control.winner,treatmentWinner:p.treatment.winner
    })),
    pairDigestSha256:pairedDigest,
    competitivelyQualifiedGames:0,
    verified99Point5:false,
    caveats:[
      'Post-observation new policy choice over historical registered source deals',
      'The native-effective ability predicate was tested in eight staged physical-seats scenarios',
      'Existing bot and source scripts remain unqualified for official paper game evaluation',
      'A stopped Store error alone does not make the replacement root tactically competent',
      'No prospective fresh seed, skilled 25-minute clock or full-field opponent coverage'
    ]
  };
  return {raw:{summary,control,filtered},summary};
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const x=preflight();
    process.stdout.write(JSON.stringify({
      version:VERSION,originalRegistrationBlob:x.registrationBlob,
      originalSeedGroups:x.registration.trials.length/2,
      initialSetupQualify:false,
      retrospectivePolicyComparison:true,
      competitiveQualifiedGames:0
    },null,2)+'\n');
  }else{
    const result=run();
    writeJsonAtomically(OUTPUT+'-raw.json',result.raw);
    writeJsonAtomically(OUTPUT+'-summary.json',result.summary);
    process.stdout.write(JSON.stringify({
      version:VERSION,initialPairs:result.summary.matchingSourceDealPairs,
      initialSetupMatches:result.summary.nativeSetupCertifiedPairs,
      baseline:result.summary.baselineStatuses,
      filtered:result.summary.nativeEffectiveGateStatuses,
      baselineAbortedIds:result.summary.baselineAbortedIds,
      gatedAbortedIds:result.summary.gatedAbortedIds,
      competitiveQualifiedGames:0
    },null,2)+'\n');
  }
}

module.exports={VERSION,run,gateReceipt,statuses};
