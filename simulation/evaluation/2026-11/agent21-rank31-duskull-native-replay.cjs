'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {withPaperDuskullComeAndGetYou,VERSION:PATCH}=
  require('../../twinleaf/2026-11/agent21-duskull-come-and-get-you-paper-hook.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const hood=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');

const ROOT=path.resolve(__dirname,'../../..');
const OUTPUT=path.join(ROOT,'agent21-rank31-duskull-native-replay.json');
const ORIGINAL_ARCHIVE_RUN=42578010606;
const TRIAL=Object.freeze({
  rank:31,repeat:7002,candidateSlot:'A',seed:323239100,
  candidateId:'hood-shield-v1',id:'31:7002:A:hood-shield-v1'
});
const COMMON=Object.freeze({
  actorOnlyComposition:true,
  actorMewMaxMiracleOverSelfCopy:true,
  actorMewGenesectTechnoBlast:true,
  actorDceMewMobilityRoot:true,
  actorGenesectFusionDrawRoot:true,
  actorNaturalEvolutionRoot:true,
  bilateralBasicEnergyRecipientFrontier:true,
  actorUnderworldDoorPromptOwner:true,
  actorUnderworldDoorRoot:true,
  nativeAllOwnerPassFrontier:true,
  actorGuzmaPromptContinuation:true,
  actorZeroEnergyStrandFloatStoneRoot:true,
  actorSeekerGuzmaNominalKo:true
});
const PROFILE=Object.freeze({
  celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true
});
const EXPECTED_ORIGINAL_SOURCE_DEAL=
  'a99aa93194c3aa17b3dfb3347ac7f677933f6714bdc96785893a3324e88be2c2';

/**
 * Post-hoc exact-seed, same-source-deal, default-off adapter correction pilot.
 * This cannot register a new unbiased tournament trial, certify paper games,
 * or overwrite the frozen original 116-game archive.
 */
function replay(corrected){
  const execute=()=>withPaperSemanticsProfileV1(()=>runDevelopment({
    ...frozen.policyOptions,...COMMON,
    registeredTrials:[TRIAL],
    registeredFrameName:'agent21-rank31-duskull-paper-replay-'+
      (corrected?'corrected':'original'),
    registeredCandidateDecks:{
      'hood-shield-v1':{label:'hood-shield-v1',cards:hood.cards}
    },
    allowSingleCandidateArm:true,
    allowAdditionalOriginalSourceRanks:true,
    nativeRootActionLimit:260,
    isolatePolicyRandomness:true,
    isolatePhysicalShuffleRandomnessAfterSetup:true
  }),PROFILE);
  const wrapped=corrected?withPaperDuskullComeAndGetYou(execute):
    {result:execute(),audit:null};
  const {result,audit:profileAudit}=wrapped.result;
  assert.equal(result.attempted,1);
  assert.equal(result.rows.length,1);
  const row=result.rows[0];
  assert.equal(row.trial.id,TRIAL.id);
  return {
    corrected,patchedDuskull:corrected?PATCH:null,
    patchAudit:wrapped.audit,paperSemanticsProfile:profileAudit,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    sourceDealOriginalArchiveMatch:
      row.sourceDealFingerprint===EXPECTED_ORIGINAL_SOURCE_DEAL,
    actualStarterSeat:row.actualStarterSeat??null,
    actionCount:row.actionCount??null,
    roots:row.rootActionLedger?.length??
      row.nativeAbortEvidence?.rootActionLedger?.length??0,
    nativeError:row.error??null,
    abortEvidence:row.nativeAbortEvidence??null,
    finished:row.finished===true,
    nativeWinner:row.finished===true?row.winner??null:null,
    nativeCensorDisposition:row.error?'engine-error':row.finished?'terminal':'root-cap',
    originalNativeTrialId:TRIAL.id,
    originalNativeRunId:ORIGINAL_ARCHIVE_RUN,
    originalArchivedSourceDeal:EXPECTED_ORIGINAL_SOURCE_DEAL,
    rawRow:row
  };
}
function archive(report){
  const lock=OUTPUT+'.lock';
  const fd=fs.openSync(lock,'wx',0o600),temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    const f=fs.openSync(temp,'r');
    try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
function main(){
  const prior=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  let rows;
  try{rows=[replay(false),replay(true)];}
  finally{
    if(prior===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=prior;
  }
  const result={schema:'agent21-rank31-duskull-original-vs-paper-hook-replay-v1',
    engine:PINNED_TWINLEAF,trial:TRIAL,
    originalArchiveRunId:ORIGINAL_ARCHIVE_RUN,originalSeedReused:true,
    sourceDealsPaired:rows.every(row=>row.sourceDealFingerprint)&&
      rows[0].sourceDealFingerprint===rows[1].sourceDealFingerprint,
    exactOriginalSourceDealReproduced:
      rows.every(row=>row.sourceDealOriginalArchiveMatch),
    developmentOnly:true,competitivelyPaperQualifiedGames:0,arms:rows,
    caveat:'Retrospective original seed with 260-root policy and a modified engine hook; neither arm is an independent win-rate trial.'};
  archive(result);
  process.stdout.write('AGENT21_RANK31_DUSKULL_NATIVE '+JSON.stringify({
    sourceDealsPaired:result.sourceDealsPaired,
    exactOriginalSourceDealReproduced:result.exactOriginalSourceDealReproduced,
    arms:rows.map(({corrected,patchAudit,sourceDealFingerprint,roots,
      nativeError,finished,nativeWinner,nativeCensorDisposition})=>({
      corrected,patchAudit,sourceDealFingerprint,roots,
      nativeError:nativeError?String(nativeError).slice(0,150):null,
      finished,nativeWinner,nativeCensorDisposition
    })),competitiveQualifiedGames:0,output:path.basename(OUTPUT)})+'\n');
  return result;
}
if(require.main===module)main();
module.exports={TRIAL,COMMON,PROFILE,replay,main};
