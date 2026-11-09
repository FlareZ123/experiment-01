'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const reg=require('../../../results/aichi-2026/registrations/agent12-jet-conservation-v1-prospective-20261109.json');
const prior=require('../../../results/aichi-2026/registrations/agent12-temple-owner-holdout-native-20261109.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const deck=require('../../../results/aichi-2026/candidate-iron-thorns-psychic-reserve-v3.json');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {gitBlob,compact,pairedContribution}=
  require('./agent12-thorns-fixed60-eight-rank-native.cjs');
const OUT=path.resolve(__dirname,'../../../agent12-jet-conservation-v1-native.json');

function verify(){
  assert.equal(reg.schema,
    'agent12-thorns-mimikyu-jet-reservation-fresh-policy-v1');
  assert.equal(reg.status,'FROZEN BEFORE ANY NATIVE MATCH');
  assert.equal(reg.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(reg.exactSameCardsBothArms,true);
  assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(deck.cards.find(c=>c.name==='Psychic Energy').count,2);
  assert.deepEqual(reg.sourceRanks,[6,24,29]);
  assert.equal(reg.rootCap,360);
  assert.equal(reg.groups.length,24);
  assert.equal(reg.expectedNativeAttempts,48);
  assert.equal(new Set(reg.groups.map(g=>g.seed)).size,24);
  assert.ok(!reg.groups.some(g=>g.seed===reg.retrospectiveObservedSeedExcludedFromProspective));
  for(const {path:blobPath,blob} of reg.policyCodeBlobs)
    assert.equal(gitBlob(blobPath),blob,'Frozen research policy changed: '+blobPath);
  for(const batch of reg.batches)
    validateRegisteredTrialGroups(batch.registeredTrials,reg.sourceRanks,false,true);
  return true;
}

/** Only accepted Store recipient changes are counted, never unexecuted plans. */
function candidateJetReceipts(row){
  const seat=row.candidateSeat;
  const events=row.nativeAcceptedTargetSidecar?.events??[];
  return events.filter(e=>e.playerSlot===seat&&
    e.action==='PlayCardAction'&&e.storeAccepted===true&&
    e.declared?.ownerHandPrinting?.startsWith('Jet Energy ')).map(e=>{
      const observed=(e.publicBoardChanges??[]).filter(x=>x.seat===seat&&
        (x.after?.energies??[]).some(p=>p.startsWith('Jet Energy ')));
      return {ordinal:e.rootActionOrdinal,turn:e.turnBefore,
        selectedTarget:e.declared?.target??null,
        acceptedPositions:observed.map(x=>({position:x.position,index:x.index,
          pokemon:x.after?.pokemon??null})),
        nativePublicChangeObserved:observed.length>0};
    });
}

function compare(control,treatment,plan=reg){
  assert.equal(control.rows.length,plan.groups.length);
  assert.equal(treatment.rows.length,plan.groups.length);
  const rows=plan.groups.map((g,i)=>{
    const a=compact(control.rows[i]),b=compact(treatment.rows[i]);
    const physicalMatch=Boolean(a.sourceDealFingerprint&&
      a.sourceDealFingerprint===b.sourceDealFingerprint&&
      a.actualStarterSeat!==null&&a.actualStarterSeat===b.actualStarterSeat);
    const bounds=physicalMatch?
      pairedContribution(a.candidateWins,b.candidateWins):null;
    const ghost=row=>(row.candidateAttackSettlement?.attacks??[])
      .filter(e=>e.attackName==='Ghost Eye'&&e.settledPromptChain===true)
      .length;
    return {rank:g.rank,repeat:g.repeat,candidateSlot:g.candidateSlot,
      seed:g.seed,physicalSourceMatched:physicalMatch,
      bothNativeTerminals:a.candidateWins!==null&&b.candidateWins!==null,
      nativeWinBounds:bounds,control:a,treatment:b,
      jetControl:candidateJetReceipts(control.rows[i]),
      jetTreatment:candidateJetReceipts(treatment.rows[i]),
      ghostControl:ghost(control.rows[i]),
      ghostTreatment:ghost(treatment.rows[i])
    };
  });
  const matched=rows.filter(r=>r.physicalSourceMatched);
  const summarize=(key,ghostKey,jetKey)=>({
    nativeWins:rows.filter(r=>r[key].candidateWins===1).length,
    nativeLosses:rows.filter(r=>r[key].candidateWins===0).length,
    nativeErrors:rows.filter(r=>r[key].nativeDisposition==='engine-error').length,
    nativeCaps:rows.filter(r=>r[key].nativeDisposition==='right-censored').length,
    ghostEyesSettled:rows.reduce((s,r)=>s+r[ghostKey],0),
    candidateAcceptedJetAttachments:rows.reduce((s,r)=>s+r[jetKey].length,0),
    candidateAcceptedJetActive:rows.reduce((s,r)=>s+r[jetKey]
      .filter(j=>j.acceptedPositions.some(p=>p.position==='active')).length,0),
    candidateAcceptedJetBenchMimikyu:rows.reduce((s,r)=>s+r[jetKey]
      .filter(j=>j.acceptedPositions.some(p=>p.position==='bench'&&
        p.pokemon==='Mimikyu PAL')).length,0)
  });
  const byRank=plan.sourceRanks.map(rank=>{
    const a=rows.filter(r=>r.rank===rank);
    return {rank,groups:a.length,physicallyMatched:a.filter(r=>r.physicalSourceMatched).length,
      controlNativeWins:a.filter(r=>r.control.candidateWins===1).length,
      treatmentNativeWins:a.filter(r=>r.treatment.candidateWins===1).length,
      controlGhostEyes:a.reduce((n,r)=>n+r.ghostControl,0),
      treatmentGhostEyes:a.reduce((n,r)=>n+r.ghostTreatment,0),
      controlJetActive:a.reduce((n,r)=>n+r.jetControl
        .filter(j=>j.acceptedPositions.some(p=>p.position==='active')).length,0),
      treatmentJetActive:a.reduce((n,r)=>n+r.jetTreatment
        .filter(j=>j.acceptedPositions.some(p=>p.position==='active')).length,0)
    };
  });
  return {summary:{registeredSourceGroups:rows.length,
    actualNativeAttempts:rows.length*2,
    physicallyMatched:matched.length,sourceUnmatched:rows.length-matched.length,
    matchedDoubleTerminals:matched.filter(r=>r.bothNativeTerminals).length,
    sharpTreatmentMinusControlNativeWins:{
      low:matched.reduce((s,r)=>s+r.nativeWinBounds.low,0),
      high:matched.reduce((s,r)=>s+r.nativeWinBounds.high,0)},
    competitivePaperQualifiedGames:0},
    field:{control:summarize('control','ghostControl','jetControl'),
      treatment:summarize('treatment','ghostTreatment','jetTreatment')},
    byRank,rows};
}
function archive(report){
  const lock=OUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUT+'.tmp.'+process.pid;
  try {
    fs.writeFileSync(temp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    const h=fs.openSync(temp,'r');try{fs.fsyncSync(h)}finally{fs.closeSync(h)}
    fs.renameSync(temp,OUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
function run(){
  verify();
  const old={
    jet:process.env.AGENT12_MIMIKYU_JET_RESERVE_DEV,
    mimic:process.env.AGENT12_TEMPLE_THORNS_OWNER_DEV,
    pay:process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV
  };
  process.env.AGENT12_TEMPLE_THORNS_OWNER_DEV='true';
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  const batches=[],audits=[];
  try{
    for(let i=0;i<reg.batches.length;i++){
      const batch=reg.batches[i];
      process.env.AGENT12_MIMIKYU_JET_RESERVE_DEV=i===0?'false':'true';
      const played=withPaperSemanticsProfileV1(()=>runDevelopment({
        ...frozen.policyOptions,...prior.commonActorOptions,
        registeredTrials:batch.registeredTrials,
        registeredCandidateDecks:Object.fromEntries(
          reg.candidateIds.map(id=>[id,{label:id,cards:deck.cards}])),
        registeredFrameName:reg.schema+':'+batch.candidateId,
        allowSingleCandidatePerGroup:true,
        allowAdditionalOriginalSourceRanks:true,
        allowExtendedRegisteredNativeRootCap:true,
        nativeRootActionLimit:reg.rootCap,
        isolatePolicyRandomness:true,
        isolatePhysicalShuffleRandomnessAfterSetup:true,
        nativeSetupCoinChoiceReceipt:true,
        nativeAcceptedTargets:true
      }),prior.profileEnabled);
      assert.equal(played.result.attempted,24);
      batches.push(played.result);
      audits.push(played.audit);
    }
  }finally{
    for(const [key,value] of [
      ['AGENT12_TEMPLE_THORNS_OWNER_DEV',old.mimic],
      ['AGENT4_NATIVE_PAYMENT_RECEIPT_DEV',old.pay],
      ['AGENT12_MIMIKYU_JET_RESERVE_DEV',old.jet]]){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
  const comparison=compare(batches[0],batches[1]);
  const result={schema:reg.schema,registration:reg,
    enginePin:PINNED_TWINLEAF,repositoryRevision:process.env.GITHUB_SHA??null,
    bothArmsExactSamePrintedSixty:true,bothSeatsIdenticalActorPolicyWithinArm:true,
    correctionAudits:audits,comparison,rawNativeBatches:batches,
    competitivePaperQualifiedGames:0,
    caveat:'Native policy contrast only. No official paper clock, complete owner choices, Japanese print admission or independent strategy review.'};
  archive(result);
  process.stdout.write('AGENT12_JET_RESERVE '+JSON.stringify({
    summary:comparison.summary,field:comparison.field,byRank:comparison.byRank,
    artifact:path.basename(OUT)})+'\n');
  return result;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify({verified:verify(),
      groups:reg.groups.length,rootCap:reg.rootCap})+'\n');
  else run();
}
module.exports={verify,candidateJetReceipts,compare,run};
