'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {runBranch,TRIAL_IDS}=
  require('../agent7-v8-rank3-mail-beach-composition.cjs');
const {withOwnPlayCardBoundary}=
  require('../../twinleaf/agent7-owner-playcard-boundary-audit.cjs');
const registration=require('../../../results/aichi-2026/registrations/agent7-fresh-rank3-13-bilateral-vstar-paired-20261110.json');

const VERSION='agent7-rank3-v-rank13-natural-vstar-fresh-bilateral-native-v1';
const OUTPUT=path.resolve(__dirname,
  '../../../artifacts/agent7-rank13-vstar/fresh-bilateral.json');

/** @param {string} trialId @returns {0|1} */
function rank13Seat(trialId){
  assert.ok(TRIAL_IDS.includes(trialId));
  return trialId.includes(':A:')?0:1;
}

/** @param {string|null|undefined} a @param {string|null|undefined} b */
function identicalDigest(a,b){
  return typeof a==='string'&&/^[0-9a-f]{64}$/.test(a)&&a===b;
}

/** This recorder sees public native PlayCardAction events, never hidden cards. */
function observe(seed,bilateralNaturalEvolutionRoot){
  const base=path.resolve(__dirname,
    '../../../vendor/twinleaf/ptcg-server/output');
  const headless=require('../../twinleaf/headless.cjs');
  const Store=require(path.join(base,'game/store/store')).Store;
  const common={
    mysteriousTreasureRoot:true,ownerConfirm:true,
    arvenNest:true,dedenneTrue:true,
    sharedPaperCelestial:true,
    candidateNaturalEvolutionRoot:false,
    paperCelestial:false,
    registeredSeed:seed,
    bilateralNaturalEvolutionRoot
  };
  const observed=withOwnPlayCardBoundary(
    ()=>runBranch(true,true,common),
    {headless,Store,trialIds:TRIAL_IDS});
  assert.deepEqual(observed.result.output.rows.map(row=>row.trialId),TRIAL_IDS);
  for(const row of observed.result.output.rows)
    assert.equal(row.seed,seed);
  const native=observed.result.output.rows;
  const vstar=observed.events.filter(event=>
    event.publiclyPlayedPrinting==='Regidrago VSTAR SIT'&&
    event.seat===rank13Seat(event.trialId));
  return {
    registeredSeed:seed,bilateralNaturalEvolutionRoot,
    rows:native,
    ownerVstarEvents:vstar,
    acceptedVstar:vstar.filter(event=>event.nativeAccepted===true),
    rejectedVstar:vstar.filter(event=>event.nativeAccepted!==true),
    sourceArvenAccepted:observed.result.mailAudit.arvenFromMailAccepted,
    opponentDedenneSettled:
      observed.result.mailAudit.nativeDedenneTrueEffectSettled
  };
}

/** @param {object} a @param {object} b */
function matchedTrialRows(a,b){
  assert.equal(a.trialId,b.trialId);
  const matchedSource=identicalDigest(a.sourceDealFingerprint,b.sourceDealFingerprint);
  const matchedWhole=identicalDigest(
    a.fullPhysicalDealFingerprint,b.fullPhysicalDealFingerprint);
  return {matchedSource,matchedWhole,matched:matchedSource&&matchedWhole,
    sourceFingerprint:{control:a.sourceDealFingerprint,
      treatment:b.sourceDealFingerprint},
    wholeFingerprint:{control:a.fullPhysicalDealFingerprint,
      treatment:b.fullPhysicalDealFingerprint}};
}

/** Fresh registered seeds; same printed original decks and both seats. */
function run(){
  assert.deepEqual(registration.seeds,[834560947,1231417888]);
  assert.equal(registration.totalPhysicalOrientations,4);
  const pairs=[];
  for(const seed of registration.seeds){
    const control=observe(seed,false),treatment=observe(seed,true);
    for(const trialId of TRIAL_IDS){
      const a=control.rows.find(row=>row.trialId===trialId);
      const b=treatment.rows.find(row=>row.trialId===trialId);
      assert.ok(a&&b);
      const sourceOpening=matchedTrialRows(a,b);
      const actual=arm=>arm.acceptedVstar
        .filter(event=>event.trialId===trialId)
        .map(event=>({actorSeat:event.seat,turn:event.turnBefore,
          printing:event.publiclyPlayedPrinting,
          storeAccepted:event.nativeAccepted,
          immediatePrompt:event.subsequentPrompt?.type??null}));
      pairs.push({
        seed,trialId,sourceSeat:a.sourceSeat,
        originalRegidragoSeat:rank13Seat(trialId),
        sourceOpening,
        matchedInitialPhysicalDeal:sourceOpening.matched,
        control:{status:a.status,nativeFinished:a.nativeFinished,
          nativeWinner:a.nativeWinner,nativeActionCount:a.nativeActionCount,
          acceptedVstar:actual(control),publicActionRoots:a.nativePublicAttackAndAbilityRoots,
          sourceMailArvenAccepted:control.sourceArvenAccepted,
          opponentDedenneSettled:control.opponentDedenneSettled},
        treatment:{status:b.status,nativeFinished:b.nativeFinished,
          nativeWinner:b.nativeWinner,nativeActionCount:b.nativeActionCount,
          acceptedVstar:actual(treatment),publicActionRoots:b.nativePublicAttackAndAbilityRoots,
          sourceMailArvenAccepted:treatment.sourceArvenAccepted,
          opponentDedenneSettled:treatment.opponentDedenneSettled}
      });
    }
  }
  assert.equal(pairs.length,4);
  const paired=pairs.filter(p=>p.matchedInitialPhysicalDeal);
  const result={
    schema:VERSION,
    originalRegistration:registration.schema,
    originalRegistrationTimestamp:registration.registeredAtUtc,
    fixedSixties:true,sourceRank:3,candidateRank:13,
    seeds:registration.seeds,rootCap:128,
    pinnedTwinleaf:registration.enginePin,
    policyControl:'default-common-v8 + same shared paper Celestial correction',
    policyTreatment:'canonical symmetric owner-natural-evolution + identical common and paper correction',
    pairs,matchedPhysicalPairs:paired.length,
    unmatchedPhysicalPairs:pairs.length-paired.length,
    matchedControlVstarAccepted:paired.reduce((n,p)=>
      n+p.control.acceptedVstar.length,0),
    matchedTreatmentVstarAccepted:paired.reduce((n,p)=>
      n+p.treatment.acceptedVstar.length,0),
    status:paired.length===4?
      'FOUR_REGISTERED_NATIVE_PHYSICAL_PAIRINGS_MATCHED':
      'PHYSICAL_OPENING_PARITY_INCOMPLETE_CAUSAL_ATTRIBUTION_CENSORED',
    competitivePaperGamesQualified:0,estimatedWinRate:null
  };
  return result;
}

/** Atomic JSON output under exclusive lock. @param {object} report */
function save(report){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx');
  const tmp=OUTPUT+'.'+process.pid+'.'+randomUUID()+'.tmp';
  try{
    fs.writeFileSync(tmp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    fs.renameSync(tmp,OUTPUT);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
if(require.main===module){
  let report;
  try{report=run();}
  catch(error){report={schema:VERSION,status:'NATIVE_EXCEPTION',
    error:{message:error.message,stack:String(error.stack).slice(0,2500)},
    competitivePaperGamesQualified:0};}
  save(report);
  process.stdout.write(JSON.stringify({
    schema:report.schema,status:report.status,
    matchedPairs:report.matchedPhysicalPairs??null,
    unmatchedPairs:report.unmatchedPhysicalPairs??null,
    matchedControlVstarAccepted:report.matchedControlVstarAccepted??null,
    matchedTreatmentVstarAccepted:report.matchedTreatmentVstarAccepted??null,
    nativePairResults:report.pairs?.map(p=>({
      seed:p.seed,trialId:p.trialId,matched:p.matchedInitialPhysicalDeal,
      controlVstar:p.control.acceptedVstar,
      treatmentVstar:p.treatment.acceptedVstar,
      controlNativeFinished:p.control.nativeFinished,
      treatmentNativeFinished:p.treatment.nativeFinished
    }))??null,
    competitivePaperGamesQualified:0,error:report.error??null
  },null,2)+'\n');
  if(report.status==='NATIVE_EXCEPTION')process.exitCode=1;
}
module.exports={VERSION,rank13Seat,identicalDigest,matchedTrialRows,observe,run,save};
