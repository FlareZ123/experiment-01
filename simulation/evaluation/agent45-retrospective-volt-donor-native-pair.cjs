'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {withPrintedVoltDonorPreference,VERSION}=
  require('../twinleaf/agent45-volt-donor-printed-cost-hook.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');

const root=path.resolve(__dirname,'../..');
const regPath=path.join(root,
  'results/aichi-2026/registrations/agent45-retrospective-rank6-volt-donor-both-seats-v1.json');
const profilePath=path.join(__dirname,'agent41-frozen-bilateral-development-v2.json');
const outputPath=path.join(root,'agent45-retrospective-volt-donor-native-pair.json');

/** @param {object} value @returns {string} */
function sha(value){
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/** @param {object} row @returns {object} */
function sourceNativeSummary(row){
  const id=row?.trial?.id??null;
  const settled=(row?.sourceAttackSettlement?.attacks??[])
    .filter(x=>x.attackName==='Volt Cyclone');
  const seat=row?.sourceSeat;
  const sourceRoots=(row.rootActionLedger??[]).filter(x=>x.playerSlot===seat);
  return {
    id,status:row.status??null,sourceSeat:seat??null,
    firstSeat:row.actualStarterSeat??null,
    verifiedFirstTurn:row.verifiedFirstTurn===true,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    originalDeckSha:row.sourcePrintedSixtyHash??null,
    roots:row.rootActionLedger?.length??null,
    nativeVoltDeclarations:settled.length,
    sourceVoltAttackPublicSnapshots:settled.map(x=>({
      turn:x.turnBefore,attackRoot:x.actionOrdinal,
      activeEnergyBefore:x.publicBoardBefore?.[seat]?.active?.energyCards??null,
      activeEnergyAfter:x.publicBoardAfter?.[seat]?.active?.energyCards??null,
      ownBenchCount:x.publicBoardBefore?.[seat]?.bench?.length??null
    })),
    ownerAttackRoots:sourceRoots.filter(x=>x.action==='AttackAction').length,
    ownerPassRoots:sourceRoots.filter(x=>x.action==='PassTurnAction').length,
    nativeError:String(row.error??'').slice(0,700),
    finished:row.gameFinished??null,competitivelyQualified:false
  };
}

/**
 * Compare unchanged source-deal and starter identities. No source
 * fingerprint is inferred when an arm errored or omitted its witness.
 * @param {object} expected Previously archived source physical-deal contract.
 * @param {object} control
 * @param {object} treatment
 * @returns {object}
 */
function compareArm(expected,control,treatment){
  const id=expected.id;
  const cell=[expected.repeat,expected.candidateSlot].join(':');
  const c=sourceNativeSummary(control);
  const t=sourceNativeSummary(treatment);
  const frozen=expected.originalFingerprint;
  const rootA=control.rootActionLedger??[];
  const rootB=treatment.rootActionLedger??[];
  let commonPrefix=0;
  while(commonPrefix<rootA.length&&commonPrefix<rootB.length&&
        JSON.stringify(rootA[commonPrefix])===JSON.stringify(rootB[commonPrefix]))
    commonPrefix++;
  return {
    trialId:id,cell,sourceSeat:expected.candidateSlot==='A'?1:0,
    expectedInitialSourceDeal:frozen,
    expectedActualStarterSeat:expected.firstSeat,
    baselineAgainstOriginalDeal:c.sourceDealFingerprint===frozen,
    treatmentAgainstOriginalDeal:t.sourceDealFingerprint===frozen,
    matchedBaselineAndTreatmentSourceDeal:
      !!c.sourceDealFingerprint&&c.sourceDealFingerprint===t.sourceDealFingerprint,
    matchedFirstSeat:c.verifiedFirstTurn&&t.verifiedFirstTurn&&
      c.firstSeat===t.firstSeat&&c.firstSeat===expected.firstSeat,
    rawRootCommonPrefix:commonPrefix,
    rawRootIdentical:rootA.length===rootB.length&&
      commonPrefix===rootA.length,
    control:c,treatment:t,
    gamePerformanceQualified:false
  };
}

/**
 * Frozen v2 same original deck, same PRNG seed, identical actor policy
 * except for a post-attack owner-only donor choice. The original printed
 * paper-prompt transfer guard runs in BOTH arms.
 *
 * Entire trial set was committed before this runner's first native call,
 * but selected retrospectively from prior native observations.
 * @returns {object}
 */
function run(){
  const reg=JSON.parse(fs.readFileSync(regPath,'utf8'));
  const profile=JSON.parse(fs.readFileSync(profilePath,'utf8'));
  assert.equal(reg.schema,'agent45-retrospective-rank6-volt-donor-both-seats-v1');
  assert.equal(reg.enginePin,profile.pinnedVendorRevision);
  assert.equal(reg.registeredTrials.length,8);
  assert.equal(profile.policyOptions.bilateralPublicContextSpecialEnergy,true);
  assert.equal(profile.policyOptions.actorOnlyComposition,true);
  const registration=reg.registeredTrials.map(trial=>{
    const cell=trial.repeat+':'+trial.candidateSlot;
    assert.equal(trial.seed,reg.registeredTrials.find(other=>
      other.repeat===trial.repeat&&
      other.candidateSlot===trial.candidateSlot).seed);
    return {...trial,
      originalFingerprint:reg.archivedActualInitialSourceDealFingerprintByCell[cell],
      firstSeat:reg.expectedOriginalVerifiedFirstTurnSeatByCell[cell]};
  });
  const options={...profile.policyOptions,
    registeredTrials:reg.registeredTrials,
    registeredFrameName:'agent45-retrospective-rank6-volt-donor-both-seats-v1',
    paperPromptPortfolio:true};
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';

  const baseline=runDevelopment(options);
  const augmented=withPrintedVoltDonorPreference(()=>
    withPrintedVoltDonorPreference(()=>runDevelopment(options),{seat:1}),
    {seat:0});
  const treatment=augmented.result.result;
  const audits=[augmented.audit,augmented.result.audit];
  assert.equal(baseline.rows.length,reg.registeredTrials.length);
  assert.equal(treatment.rows.length,reg.registeredTrials.length);
  const c=new Map(baseline.rows.map(row=>[row.trial.id,row]));
  const t=new Map(treatment.rows.map(row=>[row.trial.id,row]));
  const pairs=registration.map(expected=>{
    const control=c.get(expected.id),variant=t.get(expected.id);
    assert.ok(control&&variant,'Every registered source physical arm required');
    return compareArm(expected,control,variant);
  });
  const summary={
    matchedOriginalSourceDeals:pairs.filter(x=>
      x.baselineAgainstOriginalDeal&&x.treatmentAgainstOriginalDeal).length,
    matchedControlTreatmentSourceDeals:pairs.filter(x=>
      x.matchedBaselineAndTreatmentSourceDeal).length,
    matchedActualStarterSeats:pairs.filter(x=>x.matchedFirstSeat).length,
    identicalNativeRootLedgers:pairs.filter(x=>x.rawRootIdentical).length,
    originalSourceVoltAttacks:baseline.rows.reduce((n,row)=>
      n+(row.sourceAttackSettlement?.attacks??[])
        .filter(a=>a.attackName==='Volt Cyclone').length,0),
    treatmentSourceVoltAttacks:treatment.rows.reduce((n,row)=>
      n+(row.sourceAttackSettlement?.attacks??[])
        .filter(a=>a.attackName==='Volt Cyclone').length,0),
    selectedAlternativeIntents:audits.reduce((n,a)=>
      n+a.nativeValidAlternativesSelected,0),
    nativeAcceptedAlternativeTransfers:audits.reduce((n,a)=>
      n+a.nativeAcceptedSelectedMoves,0),
    nativeAcceptedPhysicallyVerified:audits.reduce((n,a)=>
      n+a.acceptedPhysicalTransferReceipts.filter(x=>
        x.movedFromActive&&x.receivedOnBench&&
        x.printedCostStillPayable===true).length,0),
    baselineErrors:baseline.rows.filter(x=>/error|invalid/i.test(x.status??'')).length,
    treatmentErrors:treatment.rows.filter(x=>/error|invalid/i.test(x.status??'')).length,
    competitivelyQualifiedGames:0
  };
  return {
    schema:'agent45-rank6-retrospective-donor-pair-full-original-store-v1',
    registration:regPath.substring(root.length+1),
    registrationSha256:sha(reg),frozenPolicySha256:sha(profile),
    frozenProfile:profilePath.substring(root.length+1),
    compiledVendorPin:reg.enginePin,
    donorVariant:VERSION,
    sourceGameCountPerArm:reg.registeredTrials.length,
    actualSource60Rank:6,
    originalSourceRostersAuthenticated:true,
    sourceSeedSelection:'RETROSPECTIVE_PAST_OBSERVED_DONOR_ERRORS',
    independentHeldoutResults:false,
    paperPromptPortfolioEnabledInBothArms:true,
    baselinePolicyOptions:options,
    treatmentPolicyOptions:{...options,
      extraPostAttackOwnerEnergyDonorOnly:true},
    summary,pairs,donorHookAudits:audits,
    originalNativeResults:baseline,variantNativeResults:treatment,
    competitiveQualifiedGames:0,
    noGameWinInference:true
  };
}
if(require.main===module){
  try{
    const result=run();
    writeAtomicLocked(outputPath,JSON.stringify(result,null,2)+'\n');
    process.stdout.write(JSON.stringify({
      schema:result.schema,summary:result.summary,
      pairCount:result.pairs.length,
      output:outputPath,competitiveQualifiedGames:0},null,2)+'\n');
  }catch(error){
    const failed={
      schema:'agent45-rank6-retrospective-donor-pair-full-original-store-v1',
      status:'NATIVE_RUN_ABORT',
      error:String(error?.stack??error),
      competitiveQualifiedGames:0
    };
    writeAtomicLocked(outputPath,JSON.stringify(failed,null,2)+'\n');
    process.stderr.write(JSON.stringify(failed)+'\n');
    process.exitCode=1;
  }
}
module.exports={sha,sourceNativeSummary,compareArm,run};
