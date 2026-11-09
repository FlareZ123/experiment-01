'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {COMMON,PROFILE}=
  require('./agent21-rank31-duskull-native-replay.cjs');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const hood=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
const {VERSION:RESCUE_VERSION}=
  require('../../twinleaf/2026-11/agent17-deckout-rescue-selector.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const PRE_ATTACK=process.env.AGENT17_RANK2_PRE_ATTACK_RESCUE==='true';
const RESCUE=PRE_ATTACK||process.env.AGENT17_RANK2_DECKOUT_RESCUE==='true';
const OUTPUT=path.join(ROOT,PRE_ATTACK?
  'agent17-rank2-pre-attack-rescue-native.json':RESCUE?
    'agent17-rank2-anti-deckout-native.json':
    'agent21-rank2-original-long-native.json');
const ROOT_LIMIT=Number(process.env.AGENT21_RANK2_ROOT_CAP??640);
assert.ok(Number.isSafeInteger(ROOT_LIMIT)&&ROOT_LIMIT>=260&&
  ROOT_LIMIT<=640,'Rank2 extended developmental root cap must be 260–640');

const groups=Object.freeze([
  Object.freeze({seat:'A',seed:50726483,
    sourceDigest:'ceda28c77ba31e331049f53a0522c776e4a8e5b6c20640795ba41c0458419922'}),
  Object.freeze({seat:'B',seed:1073445688,
    sourceDigest:'127a9c23736d8b89017df256b1b78bab05050f9d71076eacafc7abacd9c46632'})
]);
const rootShaByArm=Object.freeze({
  'A:champion-reference':'c0c93c015f657f601c6f2a00d742d60b49cdd4b3b5ab96240aaf502e43b1e364',
  'B:champion-reference':'474dda950c024064c49a9e095c71b2122228a54575e0ef4e9c5b02e4cb782e8e',
  'A:hood-shield-v1':'110f480c59280d2721c3e5b56434550ba951de44cba1d4ded44bdf59462b303e',
  'B:hood-shield-v1':'9e78512f956c0917aafd05f749603093e6ccef9fccb28038b48e31dc9990d2b0'
});

/** @param {'A'|'B'} seat @param {number} seed @param {string} candidateId */
function trial(seat,seed,candidateId){
  return {rank:2,repeat:7002,candidateSlot:seat,seed,candidateId,
    id:'2:7002:'+seat+':'+candidateId};
}
/** @param {object} target @param {'A'|'B'} seat @param {string} candidateId */
function replay(target,seat,candidateId){
  const t=trial(seat,target.seed,candidateId);
  const {result,audit}=withPaperSemanticsProfileV1(()=>runDevelopment({
    ...frozen.policyOptions,...COMMON,
    actorDeckoutRescueRoot:RESCUE,
    actorDeckoutRescueBeforeAttack:PRE_ATTACK,
    registeredTrials:[t],
    registeredFrameName:'agent21-rank2-original-cap'+ROOT_LIMIT,
    registeredCandidateDecks:{
      'hood-shield-v1':{label:'hood-shield-v1',cards:hood.cards}
    },
    allowSingleCandidateArm:true,
    allowAdditionalOriginalSourceRanks:true,
    nativeRootActionLimit:ROOT_LIMIT,
    allowExtendedRegisteredNativeRootCap:ROOT_LIMIT>260,
    isolatePolicyRandomness:true,
    isolatePhysicalShuffleRandomnessAfterSetup:true
  }),PROFILE);
  assert.equal(result.attempted,1);
  assert.equal(result.rows.length,1);
  const row=result.rows[0];
  const rescueAudit=row.actorOnlyDecisionCoverage?.detailedComponentAudits
    ?.ownerShuffleSupporter??null;
  if(RESCUE){
    assert.ok(rescueAudit,'Active actor must expose the actual rescue hook');
    assert.ok(rescueAudit.passRootsObserved>0,
      'Rescue policy wrapper was inactive on every genuine Store Pass root');
    if(PRE_ATTACK)assert.ok(rescueAudit.attackRootsObserved>0,
      'Pre-attack rescue was not exposed to any real native attack');
  }
  assert.equal(row.trial.id,t.id);
  assert.equal(row.sourceDealFingerprint,target.sourceDigest,
    'Original-source rank2 physical deal changed');
  const roots=row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
  const first260=roots.slice(0,260);
  const first260Sha=crypto.createHash('sha256')
    .update(JSON.stringify(first260)).digest('hex');
  const candidateSeat=seat==='A'?0:1;
  const status=row.error?'native-error':row.finished?'native-terminal':'root-cap';
  const nativeCandidateOutcome=row.finished?
    row.winner===candidateSeat?'candidate-win':'source-win':null;
  return {
    trial:t,sourceDealFingerprint:row.sourceDealFingerprint,
    sourceDealMatchesOriginal:true,
    rootCap:ROOT_LIMIT,
    sourceOriginalFirst260RootSha:rootShaByArm[seat+':'+candidateId],
    antiDeckoutRescueEnabled:RESCUE,
    antiDeckoutRescueBeforeAttack:PRE_ATTACK,
    antiDeckoutRescueVersion:RESCUE?RESCUE_VERSION:null,
    antiDeckoutRescueNativeAudit:rescueAudit,
    first260RootSha:first260Sha,originalFirst260RootsReplayed:
      RESCUE?null:
        roots.length>=260&&first260Sha===rootShaByArm[seat+':'+candidateId],
    roots:roots.length,
    status,finished:row.finished===true,
    candidateSeat,nativeWinnerSeat:row.winner??null,
    nativeCandidateOutcome,finalPrizes:row.finalPrizes??null,
    finalBoard:row.finalBoard??null,turns:row.turns??null,
    error:row.error??null,
    paperQualified:false,profileAudit:audit,rawRow:row
  };
}
function archive(output){
  const lock=OUTPUT+'.lock';
  const fd=fs.openSync(lock,'wx',0o600),temporary=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temporary,JSON.stringify(output,null,2)+'\n',{flag:'wx'});
    const content=fs.openSync(temporary,'r');
    try{fs.fsyncSync(content)}finally{fs.closeSync(content)}
    fs.renameSync(temporary,OUTPUT);
  }finally{
    if(fs.existsSync(temporary))fs.unlinkSync(temporary);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
function main(){
  const originalDev=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  let rows;
  try{
    rows=groups.flatMap(target=>
      ['champion-reference','hood-shield-v1'].map(candidateId=>
        replay(target,target.seat,candidateId)));
  }finally{
    if(originalDev===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=originalDev;
  }
  for(const group of groups){
    const pair=rows.filter(x=>x.trial.candidateSlot===group.seat);
    assert.equal(pair.length,2);
    assert.equal(pair[0].sourceDealFingerprint,pair[1].sourceDealFingerprint);
  }
  const output={schema:PRE_ATTACK?
    'agent17-rank2-control-pre-attack-shuffle-development-v1':RESCUE?
      'agent17-rank2-original-control-deckout-rescue-development-v1':
      'agent21-rank2-original-control-horizon-v1',
    antiDeckoutRescueEnabled:RESCUE,
    antiDeckoutRescueBeforeAttack:PRE_ATTACK,
    changedDevelopmentPolicy:RESCUE?RESCUE_VERSION:null,
    registeredOriginalSource:'Agent3 run42578010606 original rank2 two seeds, both candidate 60s',
    originalSeedsReused:true,
    prospectiveSelectionEligible:false,originalSourceDealPairsMatched:true,
    originalRank:2,nativeRootCap:ROOT_LIMIT,enginePin:PINNED_TWINLEAF,
    paperQualifiedCompetitiveGames:0,
    caveat:RESCUE?
      'Retrospective action-changing deckout treatment on archived original physical deals. No competitive or independent win evidence, and the original registered 116-game denominator is unchanged.':
      'Retrospective horizon sensitivity only. No change to original 116-game prospective trial. Does not certify opponents, clock, or Japanese paper semantics.',
    rows};
  archive(output);
  process.stdout.write((PRE_ATTACK?'AGENT17_RANK2_PRE_ATTACK_RESCUE ':
    RESCUE?'AGENT17_RANK2_DECKOUT_RESCUE ':
      'AGENT21_RANK2_ORIGINAL_HORIZON ')+JSON.stringify({
    antiDeckoutRescueEnabled:RESCUE,
    antiDeckoutRescueBeforeAttack:PRE_ATTACK,
    nativeRootCap:ROOT_LIMIT,sourceDealPairsMatched:true,
    rows:rows.map(({trial,roots,status,finished,nativeCandidateOutcome,
      finalPrizes,turns,originalFirst260RootsReplayed,error})=>({
      candidateId:trial.candidateId,seat:trial.candidateSlot,
      roots,status,finished,nativeCandidateOutcome,
      finalPrizes,turns,originalFirst260RootsReplayed,
      error:error?String(error).slice(0,140):null,
      rescueAcceptedRoots:rows.find(x=>
        x.trial.candidateId===trial.candidateId&&
        x.trial.candidateSlot===trial.candidateSlot)
          ?.antiDeckoutRescueNativeAudit?.acceptedRoots??null,
      seenAttackOpportunities:rows.find(x=>
        x.trial.candidateId===trial.candidateId&&
        x.trial.candidateSlot===trial.candidateSlot)
          ?.antiDeckoutRescueNativeAudit?.attackRootsObserved??null
    })),paperQualifiedCompetitiveGames:0})+'\n');
  return output;
}
if(require.main===module)main();
module.exports={ROOT_LIMIT,groups,trial,replay,main};
