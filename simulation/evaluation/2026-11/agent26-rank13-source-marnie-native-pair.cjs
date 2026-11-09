'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const registration = require('../../../results/aichi-2026/registrations/agent19-dual-fixed60-four-source-papercore-prospective-20261109.json');
const frozen = require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment} = require('../agent41-bilateral-v2-development.cjs');
const {withPaperSemanticsProfileV1, PINNED_TWINLEAF} =
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {classifyNativeAttempt} =
  require('../agent41-native-attempt-disposition.cjs');

const VERSION='agent26-original-rank13-t3-source-owned-marnie-two60-native-v1';
const FIXTURE='13:1:A';
const EXPECTED_SOURCE_SHA=
  '9f7be638cc3c3bfc59f130092ca8ef55221ca506d6da9bce2cfdc9e80752547f';
const OUTPUT=path.resolve(__dirname,'../../../agent26-rank13-marnie-native-4arms.json');

/** @param {object} row @returns {object[]} Real source voluntary roots on global turn 3. */
function turn3SourceRoots(row){
  return (row.rootActionLedger??[]).filter(root=>
    root.playerSlot===row.sourceSeat && root.turnBefore===3 &&
    root.action!=='ResolvePromptAction');
}

/**
 * Compare a matched physical source opening and actual T3 owner choice.
 * No native outcome is promoted to paper match or certified card legality.
 * @param {object} control Original native runner row.
 * @param {object} treatment Opt-in source-only Marnie runner row.
 * @returns {object} Measured native, paper-unqualified pair.
 */
function compareSourceMarnie(control,treatment){
  assert.equal(control.trial.id,treatment.trial.id);
  assert.ok(control.trial.id.startsWith(FIXTURE+':'));
  const sourceSeat=control.sourceSeat;
  assert.equal(sourceSeat,1);
  assert.equal(sourceSeat,treatment.sourceSeat);
  const a=turn3SourceRoots(control),b=turn3SourceRoots(treatment);
  const sameSource=Boolean(control.sourceDealFingerprint&&
    control.sourceDealFingerprint===treatment.sourceDealFingerprint);
  const sameStarter=control.actualStarterSeat===1&&
    treatment.actualStarterSeat===1;
  const pass=a.some(x=>x.action==='PassTurnAction');
  const marnie=b.some(x=>x.action==='PlayCardAction'&&
    x.card==='Marnie');
  const ctrlPass=(control.nativeAllOwnerPassFrontier?.receipts??[])
    .find(r=>r.actorSeat===sourceSeat&&r.turn===3);
  const heldMarnie=ctrlPass?.ownerHandAtChosenPass?.includes('Marnie SSH')===true;
  const priorChanged=(control.rootActionLedger??[]).findIndex((root,i)=>{
    const other=treatment.rootActionLedger?.[i];
    return JSON.stringify(root)!==JSON.stringify(other);
  });
  const firstControl=control.rootActionLedger?.[priorChanged];
  const firstTreatment=treatment.rootActionLedger?.[priorChanged];
  const firstDifferenceIsOwnedMarnie=priorChanged>=0&&
    firstControl?.action==='PassTurnAction'&&
    firstControl?.playerSlot===sourceSeat&&firstControl?.turnBefore===3&&
    firstTreatment?.action==='PlayCardAction'&&
    firstTreatment?.card==='Marnie'&&
    firstTreatment?.playerSlot===sourceSeat&&firstTreatment?.turnBefore===3;
  return {trialId:control.trial.id,candidateId:control.trial.candidateId,
    originalSourceSeat:sourceSeat,
    exactSourcePhysicalOpeningMatched:sameSource,
    originalFrozenSourceOpeningMatched:control.sourceDealFingerprint===
      EXPECTED_SOURCE_SHA&&treatment.sourceDealFingerprint===EXPECTED_SOURCE_SHA,
    actualFirstPlayerMatched:sameStarter,
    heldOriginalMarnieAtPass:heldMarnie,
    originalControlPassedAtT3:pass,
    treatmentStoreAcceptedSourceMarnieAtT3:marnie,
    ownerRootOfferAndAcceptanceDemonstrated:
      sameSource&&sameStarter&&pass&&heldMarnie&&marnie&&
      firstDifferenceIsOwnedMarnie,
    firstDifferenceIsOwnedMarnie,
    sourceT3ControlRoots:a.map(x=>({ordinal:x.actionOrdinal,
      action:x.action,card:x.card??null,attack:x.attack??null})),
    sourceT3TreatmentRoots:b.map(x=>({ordinal:x.actionOrdinal,
      action:x.action,card:x.card??null,attack:x.attack??null})),
    firstRawDifferentRootIndex:priorChanged,
    controlNative:classifyNativeAttempt(control).kind,
    treatmentNative:classifyNativeAttempt(treatment).kind,
    controlFinalPrizes:control.finalPrizes,
    treatmentFinalPrizes:treatment.finalPrizes,
    nativeOnly:true,paperQualifiedGames:0};
}

/** @param {object} output Store every runner row, including errors/caps. */
function atomicArchive(output){
  const lock=OUTPUT+'.lock';
  const fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(output,null,2)+'\n',{flag:'wx'});
    const file=fs.openSync(temp,'r');
    try{fs.fsyncSync(file);}finally{fs.closeSync(file);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

function run(){
  assert.equal(frozen.pinnedVendorRevision,PINNED_TWINLEAF);
  const trials=registration.registeredTrials.filter(x=>
    x.id.startsWith(FIXTURE+':'));
  assert.equal(trials.length,2);
  const options={
    ...frozen.policyOptions,...registration.commonActorOptions,
    registeredTrials:trials,registeredFrameName:VERSION,
    allowAdditionalOriginalSourceRanks:true,
    nativeRootActionLimit:registration.rootCap,
    isolatePolicyRandomness:true,
    isolatePhysicalShuffleRandomnessAfterSetup:true
  };
  const previous=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  assert.equal(previous,undefined,'Native physical receipt opt-in already set');
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  const batches={};
  try{
    for(const id of ['control','source-marnie']){
      const config={...options,
        sourceScopedStrandedMarnieRoot:id==='source-marnie'};
      batches[id]=withPaperSemanticsProfileV1(()=>
        runDevelopment(config),registration.profileEnabled);
    }
  }finally{
    delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  }
  const control=batches.control.result.rows;
  const treated=batches['source-marnie'].result.rows;
  assert.equal(control.length,2);
  assert.equal(treated.length,2);
  const pairs=control.map((row,i)=>compareSourceMarnie(row,treated[i]));
  const summary={
    bothSourceOpeningsMatched:pairs.filter(x=>
      x.exactSourcePhysicalOpeningMatched).length,
    strictSourceT3MarnieAccepted:pairs.filter(x=>
      x.ownerRootOfferAndAcceptanceDemonstrated).length,
    matchedOriginalFrozenSourceOpenings:pairs.filter(x=>
      x.originalFrozenSourceOpeningMatched).length,
    paperQualifiedGames:0,competitiveWinRate:null
  };
  const result={schema:VERSION,registration:{fixture:FIXTURE,
    seed:trials[0].seed,expectedSourceSha256:EXPECTED_SOURCE_SHA,
    twoUnchangedCandidateIds:trials.map(x=>x.candidateId),
    nativeRootCap:registration.rootCap,pinnedTwinleaf:PINNED_TWINLEAF,
    developmentRetrospective:true},
    pairs,summary,raw:{control,treated},
    sourceProfiles:{control:batches.control.audit,
      treatment:batches['source-marnie'].audit},
    codeRevision:process.env.GITHUB_SHA??null,
    competitivePaperQualifiedGames:0};
  atomicArchive(result);
  process.stdout.write('AGENT26_RANK13_ORIGINAL_MARNIE '+
    JSON.stringify({pairs,summary,output:path.basename(OUTPUT)})+'\n');
  return result;
}

if(require.main===module)run();
module.exports={VERSION,FIXTURE,EXPECTED_SOURCE_SHA,
  turn3SourceRoots,compareSourceMarnie,run};
