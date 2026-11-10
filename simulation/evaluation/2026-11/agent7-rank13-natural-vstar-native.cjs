'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {runBranch,TRIAL_IDS}=
  require('../agent7-v8-rank3-mail-beach-composition.cjs');
const {withOwnPlayCardBoundary}=
  require('../../twinleaf/agent7-owner-playcard-boundary-audit.cjs');

const VERSION='agent7-rank13-canonical-owner-natural-vstar-native-ab-v1';
const OUTPUT=path.resolve(__dirname,
  '../../../artifacts/agent7-rank13-vstar/native-original-a-b.json');
const REGISTRATION=
  'results/aichi-2026/registrations/agent7-original-rank13-natural-vstar-owner-20261110.json';

/** @param {string} trialId @returns {0|1} Physical rank-13 original seat. */
function candidateSeat(trialId){
  assert.ok(TRIAL_IDS.includes(trialId));
  return trialId.includes(':A:')?0:1;
}

/**
 * Extract actual pinned Store PlayCardAction effects only.
 * Candidate VSTAR card can only be played as a Pokémon evolution.
 * @param {{result:object,events:object[]}} observed
 * @returns {object}
 */
function extract(observed){
  const arm=observed.result;
  const acceptedVstar=observed.events.filter(event=>
    event.publiclyPlayedPrinting==='Regidrago VSTAR SIT'&&
    event.nativeAccepted===true&&
    event.seat===candidateSeat(event.trialId));
  return {
    candidateNaturalEvolutionRoot:arm.candidateNaturalEvolutionRoot,
    sharedPaperCelestial:arm.sharedPaperCelestial,
    actualVstarStoreActions:acceptedVstar,
    authenticVstarActionCount:acceptedVstar.length,
    nonCandidateVstarActions:observed.events.filter(event=>
      event.publiclyPlayedPrinting==='Regidrago VSTAR SIT'&&
      event.nativeAccepted===true&&
      event.seat!==candidateSeat(event.trialId)),
    nativeDedenneTrueEffectSettled:arm.mailAudit.nativeDedenneTrueEffectSettled,
    sourceMailArvenPlayAccepted:arm.mailAudit.arvenFromMailAccepted,
    sourceArvenSearchEvents:arm.mailAudit.arvenSearchEvents,
    sourceNestPhysicalBenchEvents:arm.mailAudit.nestFromArvenBenchEvents,
    nativeStoreVstarRejected:observed.events.filter(event=>
      event.publiclyPlayedPrinting==='Regidrago VSTAR SIT'&&
      event.nativeAccepted===false),
    nativeStatuses:arm.output.rows.map(row=>({
      trialId:row.trialId,candidateSeat:row.candidateSeat,
      sourceSeat:row.sourceSeat,status:row.status,
      error:row.nativeErrorText??row.nativeDirectErrorMessage??null,
      rootCount:row.nativeAbortEvidence?.rootActionCount??null,
      firstAccepted:row.nativeAbortEvidence?.initialAcceptedRootPrefix??[],
      lastAccepted:row.nativeAbortEvidence?.acceptedRootPrefix??[]
    }))
  };
}

/** Actual unmodified source/candidate sixties, same original physical seed. */
function run(){
  const base=path.resolve(__dirname,
    '../../../vendor/twinleaf/ptcg-server/output');
  const headless=require('../../twinleaf/headless.cjs');
  const Store=require(path.join(base,'game/store/store')).Store;
  const deps={headless,Store,trialIds:TRIAL_IDS};
  const common={
    mysteriousTreasureRoot:true,
    ownerConfirm:true,
    arvenNest:true,
    dedenneTrue:true,
    sharedPaperCelestial:true,
    celestialRoar:false,
    paperCelestial:false
  };
  const before=withOwnPlayCardBoundary(
    ()=>runBranch(true,true,{...common,candidateNaturalEvolutionRoot:false}),
    deps);
  const after=withOwnPlayCardBoundary(
    ()=>runBranch(true,true,{...common,candidateNaturalEvolutionRoot:true}),
    deps);
  assert.deepEqual(before.result.output.rows.map(row=>row.trialId),TRIAL_IDS);
  assert.deepEqual(after.result.output.rows.map(row=>row.trialId),TRIAL_IDS);
  assert.equal(before.result.candidateNaturalEvolutionRoot,false);
  assert.equal(after.result.candidateNaturalEvolutionRoot,true);
  assert.equal(before.result.sharedPaperCelestial,true);
  assert.equal(after.result.sharedPaperCelestial,true);
  const control=extract(before),treatment=extract(after);
  return {
    schema:VERSION,registration:REGISTRATION,
    fixedPrintedOriginalSixties:true,sourceRank:3,candidateRank:13,
    seed:290134,physicalTrialIds:TRIAL_IDS,
    enginePin:before.result.output.enginePin,rootCap:128,
    sharedPaperCustodyHook:
      'simulation/twinleaf/regidrago-celestial-roar-paper-custody-hook.cjs',
    naturalEvolutionActor:
      'simulation/twinleaf/agent1-actor-evolution-frontier.cjs',
    physicalDealComparison:'same historical seed and printed sixties; no independent initial-deal fingerprint in this diagnostic',
    control,treatment,
    status:treatment.authenticVstarActionCount>control.authenticVstarActionCount?
      'TREATMENT_MORE_NATIVE_REGIDRAGO_VSTAR_EVOLUTIONS':
      treatment.authenticVstarActionCount===control.authenticVstarActionCount?
        'NO_DIFFERENCE_IN_ACCEPTED_VSTAR_EVOLUTIONS':
        'TREATMENT_FEWER_NATIVE_VSTAR_EVOLUTIONS',
    competitivePaperGamesQualified:0,estimatedWinRate:null
  };
}

/** Atomic report with exclusive path lock. @param {object} report */
function save(report){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx');
  const temp=OUTPUT+'.'+process.pid+'.'+randomUUID()+'.tmp';
  try{
    fs.writeFileSync(temp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
if(require.main===module){
  let report;
  try{report=run();}
  catch(error){
    report={schema:VERSION,status:'NATIVE_ERROR',
      error:{name:error.name,message:error.message,
        stack:String(error.stack).slice(0,2400)},
      competitivePaperGamesQualified:0};
  }
  save(report);
  process.stdout.write(JSON.stringify({
    schema:report.schema,status:report.status,
    acceptedOriginalVstar:{
      baseline:report.control?.authenticVstarActionCount??null,
      treatment:report.treatment?.authenticVstarActionCount??null
    },
    opponentDedenneCount:report.treatment?.nativeDedenneTrueEffectSettled??null,
    treatments:report.treatment?.actualVstarStoreActions??[],
    experimentalAbortStatuses:report.treatment?.nativeStatuses??[],
    competitivePaperGamesQualified:0,
    error:report.error??null
  },null,2)+'\n');
  if(report.status==='NATIVE_ERROR')process.exitCode=1;
}
module.exports={VERSION,REGISTRATION,candidateSeat,extract,run,save};
