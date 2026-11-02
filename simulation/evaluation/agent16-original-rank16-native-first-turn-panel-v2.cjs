'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {preflight:originalPrintedPreflight,originalOpeningReceipt}=
  require('./agent16-original-rank16-natural-lock-fork.cjs');
const registration=require('../../results/aichi-2026/registrations/agent16-rank16-native-first-turn-public-panel-v2-20261102.json');
const profile=require('./agent41-frozen-bilateral-development-v2.json');

const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent16-original-rank16-natural-64group-first-board-v2';

/** Validate every fresh seed group and unchanged exact printed-source inputs. */
function preflight(){
  const old=originalPrintedPreflight(ROOT);
  assert.equal(registration.schema,
    'agent16-original-rank16-native-first-turn-public-panel-v2');
  assert.equal(registration.independentSeedGroups,64);
  assert.equal(registration.plannedNativeAttempts,128);
  assert.equal(registration.maxNativeRootActions,80);
  assert.equal(registration.seedBase,2343341927);
  assert.equal(registration.phase,'published-field');
  assert.equal(registration.enginePin,profile.pinnedVendorRevision);
  assert.equal(registration.sourceRosterGitBlobSha,
    old.sourcePrinted60Blob);
  assert.equal(registration.policyProfileGitBlobSha,
    old.profileBlob);
  assert.deepEqual(registration.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(registration.seeds.length,64);
  for(const [i,row] of registration.seeds.entries()){
    assert.equal(row.rank,16);
    assert.equal(row.repeat,i);
    assert.equal(row.candidateSlot,i%2===0?'A':'B');
    const projected=deriveSlotSeeds(registration.seedBase,
      registration.phase,16,i);
    assert.equal(row.seed,projected[row.candidateSlot],
      'Fresh preregistered SHA seed changed');
  }
  return {
    version:VERSION,
    originalRank:16,sourcePrinted60Blob:old.sourcePrinted60Blob,
    policyProfileBlob:old.profileBlob,seedGroups:64,attempts:128,
    sourceFirstOwnerBoardObserver:'read-only-post-decision',
    enginePin:registration.enginePin,competitivelyQualifiedGames:0
  };
}

/** @returns {object[]} Distinct 64 physical seeds each paired to both sixties. */
function scheduledArms(){
  preflight();
  return registration.seeds.flatMap(row=>
    registration.candidateIds.map(candidateId=>({...row,candidateId,
      id:[16,row.repeat,row.candidateSlot,candidateId].join(':')})));
}

/** @param {object} row */
function ownerOpening(row){
  const opening=originalOpeningReceipt(row);
  const board=row.sourceInitialPublicActiveBench??null;
  const ownBoard=board?.players?.find(p=>p.seat===row.sourceSeat)??null;
  const ownHand=row.sourceFirstOwnerRelevantHandCounts??null;
  const startBudew=typeof ownBoard?.active==='string'&&
    ownBoard.active.startsWith('Budew ');
  const heldShake=ownHand?.['Boost Shake']??null;
  const initialTrubbishBoard=Array.isArray(ownBoard?.bench)&&
    ownBoard.bench.some(name=>name.startsWith('Trubbish '));
  const visibleTrubbish=initialTrubbishBoard||
    ((ownHand?.Trubbish??0)>0);
  const visibleStone=(ownHand?.['Float Stone']??0)>0;
  const sourceGoingSecond=row.sourceActuallyFirst===false;
  const known=Boolean(ownBoard&&ownHand);
  return {
    ...opening,
    initialSourceBoard:ownBoard,
    initialSourceActiveBudew:known?startBudew:null,
    sourceFirstOwnedRelevantHand:ownHand,
    sourceGoingSecond,
    visibleShakeWithBudewStart:known&&sourceGoingSecond&&
      startBudew&&heldShake>0,
    visibleCompleteCoreMinusGarbodor:known&&sourceGoingSecond&&
      startBudew&&heldShake>0&&visibleTrubbish&&visibleStone,
    initialSourceTrubbishOnBench:known?initialTrubbishBoard:null,
    caveat:'Post-choice own-hand and public starting board witness. Source deck Garbodor access not verified, so core is not evidence of a fully playable Boost Shake action.'
  };
}

/** Retain each source event, missing opportunity and error in fixed denominator. */
function summarise(rows){
  assert.equal(rows.length,128);
  const statuses={},starts={first:0,second:0,unknown:0};
  const firstTurnChoices={budewAttack:0,boostShake:0,otherAttack:0,
    noAttack:0,unobserved:0};
  const pairs=new Map();
  let visibleBudewAndShake=0,directCoreWithoutGarbodor=0;
  const receipts=[];
  for(const row of rows){
    const status=row.status??(row.finished===true?'engine-terminal':
      row.endReason==='action-limit'?'action-cap':
      row.finished===false?'native-incomplete':'native-unknown');
    statuses[status]=(statuses[status]??0)+1;
    const starter=row.sourceActuallyFirst===true?'first':
      row.sourceActuallyFirst===false?'second':'unknown';
    starts[starter]++;
    const key=[row.trial.rank,row.trial.repeat,row.trial.candidateSlot].join(':');
    if(!pairs.has(key))pairs.set(key,[]);
    pairs.get(key).push(row);
    const own=ownerOpening(row);
    if(own.visibleShakeWithBudewStart)visibleBudewAndShake++;
    if(own.visibleCompleteCoreMinusGarbodor)directCoreWithoutGarbodor++;
    const firstAttack=own.attacks?.find(x=>x.name==='Itchy Pollen');
    const otherAttack=own.attacks?.find(x=>x.name!== 'Itchy Pollen');
    const kind=firstAttack?'budewAttack':own.shakeRootChosen?'boostShake':
      otherAttack?'otherAttack':own.kind===
      'original-source-opening-unverified'?'unobserved':'noAttack';
    firstTurnChoices[kind]++;
    receipts.push({
      trial:row.trial.id,candidateId:row.trial.candidateId,
      sourceActuallyFirst:row.sourceActuallyFirst??null,
      originalSourceDeal:row.sourceDealFingerprint??null,
      physicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
      status,finished:row.finished??null,endReason:row.endReason??null,
      rootActionCount:row.rootActionCount??null,
      nativeSetupCoinStatus:row.nativeSetupCoinChoiceReceipt?.status??null,
      physicalZoneStatus:row.physicalZoneQualification?.status??null,
      ownerOpening:own
    });
  }
  assert.equal(pairs.size,64);
  const mismatched=[];
  for(const [key,group] of pairs){
    assert.equal(group.length,2);
    if(group[0].sourceDealFingerprint!==group[1].sourceDealFingerprint)
      mismatched.push(key);
  }
  return {
    statuses,starts,firstTurnChoices,
    sourceSecondBudewWithHeldShakeCount:visibleBudewAndShake,
    sourceSecondVisibleCoreCount:directCoreWithoutGarbodor,
    mismatchedSourceDealPairIds:mismatched,
    sameSourcePhysicalDealGroups:64-mismatched.length,
    receipts,competitivelyQualifiedGames:0
  };
}

/** Execute fixed seeds with same canonical policy, observer only. */
function run(){
  const inspected=preflight();
  const {assertNoUnreviewedAmbientAgentEnvironment,assertPinnedNativeStore}=
    require('./agent41-frozen-bilateral-development-v1.cjs');
  assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  assertPinnedNativeStore(ROOT,profile);
  const prior={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    prior[key]=process.env[key];
    process.env[key]=value;
  }
  try{
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    const result=runDevelopment({
      ...profile.policyOptions,
      nativeRootActionLimit:80,
      nativeFirstTurnPublicBoard:true,
      allowAdditionalOriginalSourceRanks:true,
      registeredTrials:scheduledArms(),
      registeredFrameName:VERSION
    });
    const rows=result.rows??[];
    return {
      version:VERSION,inspected,registration,
      researchHeadCommit:process.env.GITHUB_SHA??null,
      enginePin:profile.pinnedVendorRevision,
      nativeAttempted:result.attempted,
      expectedNativeAttempts:128,
      complete:rows.length===128,
      ...summarise(rows),allNativeDevelopmentRows:rows,
      noSourceRank16SpecialActionInjected:true,
      competitiveGameQualified:false,winRateCertified:false,
      caveat:'64 new preregistered source deal identities, each played against two distinct unchanged candidate printed sixties, with 80-root truncation and no source-rank-specific action overlay. Owner first-turn board/hand observations are post-decision and cannot establish alternative action legality or tactical competency. No paper-match or Aichi-clock qualification.'
    };
  }finally{
    for(const [key,value] of Object.entries(prior)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module){
  const inspect=process.argv.includes('--inspect-only');
  const out=inspect?preflight():run();
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
  if(!inspect&&!out.complete)process.exitCode=1;
}
module.exports={VERSION,preflight,scheduledArms,ownerOpening,summarise,run};
