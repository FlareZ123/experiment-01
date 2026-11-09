'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const reg=require('../../../results/aichi-2026/registrations/agent12-thorns-safeguard-contrast-20261109.json');
const variant=require('../../../results/aichi-2026/candidate-iron-thorns-safeguard-pivot-v1.json');
const original=require('../../../results/aichi-2026/full-decklists.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {compact,pairedContribution,gitBlob}=
  require('./agent12-thorns-fixed60-eight-rank-native.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const OUTPUT=path.join(ROOT,'agent12-thorns-safeguard-native.json');
const source=original.decks.find(x=>x.rank===6);

/** Assert all candidate cards, source hashes, policies and registered trials. */
function verify(){
  assert.equal(reg.schema,
    'agent12-thorns-mimikyu-safeguard-vs-original-three-mirrors-prospective-v1');
  assert.equal(reg.status,'FROZEN PRIOR TO NATIVE GAME');
  assert.equal(reg.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(reg.expectedNativeAttempts,48);
  assert.equal(reg.groups.length,24);
  assert.equal(new Set(reg.groups.map(x=>x.seed)).size,24);
  assert.ok(source);
  assert.equal(source.cards.reduce((n,x)=>n+x.count,0),60);
  assert.equal(variant.cards.reduce((n,x)=>n+x.count,0),60);
  assert.equal(variant.cards.find(x=>x.name==='Mimikyu')?.count,1);
  assert.equal(variant.cards.find(x=>x.name==='Jet Energy')?.count,1);
  assert.equal(variant.cards.find(x=>x.name==='Psychic Energy')?.count,1);
  assert.equal(source.cards.filter(x=>x.name==='Iron Thorns ex')
    .reduce((n,x)=>n+x.count,0),4);
  assert.equal(variant.cards.filter(x=>x.name==='Iron Thorns ex')
    .reduce((n,x)=>n+x.count,0),4);
  assert.notDeepEqual(source.cards,variant.cards);
  const originalNameCounts=cards=>JSON.stringify(cards
    .map(x=>[x.name,x.count]).sort((a,b)=>a[0].localeCompare(b[0])));
  for(const opponent of original.decks)
    assert.notEqual(originalNameCounts(variant.cards),
      originalNameCounts(opponent.cards),
      'Variant must not duplicate any of the 29 existing published 60s');
  for(const file of reg.frozenSourceAndPolicyGitBlobs)
    assert.equal(gitBlob(file.path),file.blob,'Frozen upstream drift: '+file.path);
  for(const batch of reg.batches){
    assert.equal(batch.registeredTrials.length,24);
    validateRegisteredTrialGroups(batch.registeredTrials,reg.sourceRanks,false,true);
  }
  return true;
}

/** @param {object} nativeRow Actual native Store result. */
function summarize(nativeRow){
  const base=compact(nativeRow);
  const attacks=nativeRow.candidateAttackSettlement?.attacks??[];
  const sourceAttacks=nativeRow.sourceAttackSettlement?.attacks??[];
  return {...base,
    candidateAcceptedGhostEye:attacks.filter(x=>
      x.attackName==='Ghost Eye'&&x.settledPromptChain).length,
    candidateDeclaredGhostEye:attacks.filter(x=>x.attackName==='Ghost Eye').length,
    candidateDeclaredVoltCyclone:attacks.filter(x=>x.attackName==='Volt Cyclone').length,
    sourceDeclaredVoltCyclone:sourceAttacks
      .filter(x=>x.attackName==='Volt Cyclone').length,
    candidateDeclaredAll:attacks.length,
    sourceDeclaredAll:sourceAttacks.length,
    firstCandidateHandSha:nativeRow.candidateFirstOwnHandMultisetSha256??null,
    firstSourceHandSha:nativeRow.sourceFirstOwnHandMultisetSha256??null,
    nativeSetupMulliganAudit:nativeRow.nativePublicMulliganRevealsAudit??null
  };
}

/** Retain binary native outcomes, physical coupling, and every unknown. */
function compare(originalBatch,variantBatch){
  assert.equal(originalBatch.rows.length,24);
  assert.equal(variantBatch.rows.length,24);
  const rows=reg.groups.map((group,index)=>{
    const a=summarize(originalBatch.rows[index]);
    const b=summarize(variantBatch.rows[index]);
    const sourceMatched=Boolean(a.sourceDealFingerprint&&
      a.sourceDealFingerprint===b.sourceDealFingerprint&&
      a.actualStarterSeat!==null&&
      a.actualStarterSeat===b.actualStarterSeat);
    const bounds=sourceMatched?
      pairedContribution(a.candidateWins,b.candidateWins):null;
    return {
      groupId:[group.rank,group.repeat,group.candidateSlot].join(':'),
      rank:group.rank,candidateSlot:group.candidateSlot,seed:group.seed,
      sourceMatched,
      sameSourceFirstOwnerHand:Boolean(a.firstSourceHandSha&&
        a.firstSourceHandSha===b.firstSourceHandSha),
      sameSourceStartingSeat:a.actualStarterSeat!==null&&
        a.actualStarterSeat===b.actualStarterSeat,
      bothNativeTerminal:a.candidateWins!==null&&b.candidateWins!==null,
      bounds,unmodifiedThorns:a,safeguardPivot:b
    };
  });
  const matched=rows.filter(x=>x.sourceMatched);
  const bases=rows.map(x=>x.unmodifiedThorns);
  const pivots=rows.map(x=>x.safeguardPivot);
  const stat=arr=>({
    attempts:arr.length,
    nativeWins:arr.filter(x=>x.candidateWins===1).length,
    nativeLosses:arr.filter(x=>x.candidateWins===0).length,
    censored:arr.filter(x=>x.nativeDisposition==='right-censored').length,
    nativeErrors:arr.filter(x=>x.nativeDisposition==='engine-error').length,
    otherUnresolved:arr.filter(x=>
      x.candidateWins===null &&
      !['right-censored','engine-error'].includes(x.nativeDisposition)).length,
    declaredGhostEye:arr.reduce((n,x)=>n+x.candidateDeclaredGhostEye,0),
    acceptedSettledGhostEye:arr.reduce((n,x)=>n+x.candidateAcceptedGhostEye,0),
    declaredVoltCyclone:arr.reduce((n,x)=>n+x.candidateDeclaredVoltCyclone,0),
    ownerAttacks:arr.reduce((n,x)=>n+x.actorAttacks,0),
    ownerPasses:arr.reduce((n,x)=>n+x.actorPasses,0)
  });
  const a=stat(bases),b=stat(pivots);
  const unknown=x=>x.attempts-x.nativeWins-x.nativeLosses;
  return {
    summary:{
      registeredGroups:rows.length,
      nativeAttempts:rows.length*2,
      physicallyMatchedSourceDeals:matched.length,
      sameSourceFirstLiveOwnerHands:rows.filter(x=>x.sameSourceFirstOwnerHand).length,
      sameStartingSeat:rows.filter(x=>x.sameSourceStartingSeat).length,
      bothTerminalAndMatched:matched.filter(x=>x.bothNativeTerminal).length,
      sharpMatchedPivotMinusBase:{
        low:matched.reduce((n,x)=>n+x.bounds.low,0),
        high:matched.reduce((n,x)=>n+x.bounds.high,0)
      },
      allTrialObservedNativeWinCountRange:{
        unmodifiedThorns:[a.nativeWins,a.nativeWins+unknown(a)],
        safeguardPivot:[b.nativeWins,b.nativeWins+unknown(b)]
      },
      allTrialWorstCasePivotMinusBase:{
        low:b.nativeWins-(a.nativeWins+unknown(a)),
        high:(b.nativeWins+unknown(b))-a.nativeWins
      },
      paperQualifiedGames:0
    },
    field:[{candidateId:reg.candidateIds[0],...a},
      {candidateId:reg.candidateIds[1],...b}],
    bySourceRank:reg.sourceRanks.map(rank=>{
      const selected=rows.filter(x=>x.rank===rank);
      return {
        rank,attemptsPerArm:selected.length,
        matched:selected.filter(x=>x.sourceMatched).length,
        baseNativeWins:selected.filter(x=>x.unmodifiedThorns.candidateWins===1).length,
        pivotNativeWins:selected.filter(x=>x.safeguardPivot.candidateWins===1).length,
        baseNativeTerminals:selected.filter(x=>
          x.unmodifiedThorns.candidateWins!==null).length,
        pivotNativeTerminals:selected.filter(x=>
          x.safeguardPivot.candidateWins!==null).length,
        pivotGhostEye:selected.reduce((n,x)=>
          n+x.safeguardPivot.candidateDeclaredGhostEye,0),
        pivotVoltCyclone:selected.reduce((n,x)=>
          n+x.safeguardPivot.candidateDeclaredVoltCyclone,0),
        pivotPasses:selected.reduce((n,x)=>n+x.safeguardPivot.actorPasses,0)
      };
    }),
    rows
  };
}

/** Atomic exclusive artifact write, preserving every aborted native row. */
function archive(report){
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const tmp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(tmp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    const handle=fs.openSync(tmp,'r');
    try{fs.fsyncSync(handle)}finally{fs.closeSync(handle)}
    fs.renameSync(tmp,OUTPUT);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
function run(){
  verify();
  const prev=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  const batches=[],audits=[];
  try{
    for(const batch of reg.batches){
      const native=withPaperSemanticsProfileV1(()=>runDevelopment({
        ...frozen.policyOptions,...reg.commonActorOptions,
        registeredTrials:batch.registeredTrials,
        registeredCandidateDecks:{
          'rank6-iron-thorns-fixed60':{
            label:'rank6-iron-thorns-fixed60',cards:source.cards},
          'iron-thorns-mimikyu-safeguard-v1':{
            label:'iron-thorns-mimikyu-safeguard-v1',cards:variant.cards}
        },
        registeredFrameName:reg.schema+':'+batch.candidateId,
        allowSingleCandidatePerGroup:true,
        allowAdditionalOriginalSourceRanks:true,
        nativeRootActionLimit:reg.rootCap,
        isolatePolicyRandomness:true,
        isolatePhysicalShuffleRandomnessAfterSetup:true
      }),reg.profileEnabled);
      assert.equal(native.result.attempted,24);
      batches.push(native.result);
      audits.push(native.audit);
    }
  }finally{
    if(prev===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=prev;
  }
  const comparison=compare(...batches);
  const result={
    schema:reg.schema,
    registration:reg,
    originalPrinted60:source,
    safeguardPrinted60:variant,
    enginePin:PINNED_TWINLEAF,
    revision:process.env.GITHUB_SHA??null,
    paperSemanticsAudits:audits,
    comparison,actualNativeRuns:batches,
    paperQualifiedGames:0,
    decision:'Exploratory fixed-60 candidate; original and pivot differ in initial Basic count, full physical source pairing conditional and unproven 99.5.'
  };
  archive(result);
  process.stdout.write('AGENT12_SAFEGUARD_PIVOT '+JSON.stringify({
    summary:comparison.summary,field:comparison.field,
    bySourceRank:comparison.bySourceRank,
    output:path.basename(OUTPUT)
  })+'\n');
  return result;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    verify();
    process.stdout.write(JSON.stringify({
      schema:reg.schema,registeredGroups:reg.groups.length,
      nativeAttempts:reg.expectedNativeAttempts,
      sourceRanks:reg.sourceRanks,paperQualifiedGames:0
    })+'\n');
  } else run();
}
module.exports={verify,summarize,compare,run};
