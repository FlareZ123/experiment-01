'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const reg=require('../../../results/aichi-2026/registrations/agent3-regidrago-vs-shadow-all29-prospective-20261109.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {classifyNativeAttempt}=require('../agent41-native-attempt-disposition.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const OUTPUT=path.join(ROOT,'agent3-regidrago-vs-shadow-all29-native.json');
const VERSION=reg.schema;

/** Git blob of immutable source manifest or tested decision policy. */
function blob(file){
  const bytes=fs.readFileSync(path.join(ROOT,file));
  return createHash('sha1').update('blob '+bytes.length+'\0').update(bytes)
    .digest('hex');
}
function verify(){
  assert.equal(reg.schema,'agent3-full29-rank10-regidrago-vs-shadow-rider-native-prospective-v1');
  assert.equal(reg.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(reg.groups.length,58);
  assert.equal(reg.batches.length,2);
  assert.deepEqual(reg.candidateIds,
    ['champion-reference','aichi-rank10-regidrago-vstar']);
  assert.equal(new Set(reg.groups.map(g=>g.seed)).size,58);
  for(const x of reg.frozenSourceAndPolicyGitBlobs)
    assert.equal(blob(x.path),x.blob,'Registered source drift: '+x.path);
  const {authenticatedSourceRanks}=require('../agent25-authenticated-source-admission.cjs');
  const roster=require('../../../results/aichi-2026/full-decklists.json');
  const admitted=authenticatedSourceRanks(roster,true);
  assert.deepEqual(reg.sourceRanks,admitted.slice().sort((a,b)=>a-b));
  for(const batch of reg.batches){
    assert.equal(batch.registeredTrials.length,58);
    validateRegisteredTrialGroups(batch.registeredTrials,admitted,
      false,true);
  }
  const rank10=roster.decks.find(d=>d.rank===10);
  assert.equal(rank10.archetype,'Regidrago');
  assert.equal(rank10.cards.reduce((sum,c)=>sum+c.count,0),60);
  return {roster,rank10,groups:58,gameAttempts:116,
    pinnedEngine:PINNED_TWINLEAF,competitiveQualifiedGames:0};
}
/** Map actual native row to an immutable, post-game-only receipt. */
function compact(row){
  const trial=row.trial;
  const roots=row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
  const native=classifyNativeAttempt(row);
  const seat=trial.candidateSlot==='A'?0:1;
  return {
    trialId:trial.id,rank:trial.rank,candidateId:trial.candidateId,
    candidateSlot:trial.candidateSlot,seed:trial.seed,
    candidateSeat:seat,sourceSeat:1-seat,
    actualStarterSeat:row.actualStarterSeat??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    physicalStatus:row.physicalZoneQualification?.status??null,
    roots:roots.length,
    nativeDisposition:native.kind,
    finished:row.finished===true,
    winner:row.finished===true?row.winner??null:null,
    error:row.error?String(row.error).slice(0,1600):null,
    nativeCandidateWin:row.finished===true&&row.winner===seat,
    paperQualified:false
  };
}
/** Source-physical matched analysis across genuinely different fixed 60s. */
function compare(original,challenger){
  assert.equal(original.rows.length,58);
  assert.equal(challenger.rows.length,58);
  const rows=reg.groups.map((group,i)=>{
    const a=compact(original.rows[i]);
    const b=compact(challenger.rows[i]);
    const matched=Boolean(a.sourceDealFingerprint&&
      a.sourceDealFingerprint===b.sourceDealFingerprint&&
      a.actualStarterSeat!==null&&
      a.actualStarterSeat===b.actualStarterSeat);
    const terminal=a.finished&&!a.error&&b.finished&&!b.error;
    return {sourceGroup:[group.rank,group.repeat,group.candidateSlot].join(':'),
      rank:group.rank,candidateSlot:group.candidateSlot,
      seed:group.seed,matched,terminal,
      winnerContrasts:matched&&terminal&&
        a.nativeCandidateWin!==b.nativeCandidateWin,
      favored:matched&&terminal&&
        a.nativeCandidateWin!==b.nativeCandidateWin?
        (a.nativeCandidateWin?reg.candidateIds[0]:reg.candidateIds[1]):null,
      champion:a,regidrago:b};
  });
  const all=rows.flatMap(row=>[row.champion,row.regidrago]);
  const field=reg.candidateIds.map((id,index)=>{
    const selected=rows.map(row=>
      index===0?row.champion:row.regidrago);
    return {id,nativeWins:selected.filter(r=>r.nativeCandidateWin).length,
      nativeLosses:selected.filter(r=>r.finished&&
        r.winner!==null&&!r.nativeCandidateWin).length,
      nativeTerminals:selected.filter(r=>r.finished&&!r.error).length,
      nativeErrors:selected.filter(r=>r.error).length,
      rootCaps:selected.filter(r=>!r.finished&&!r.error).length};
  });
  const perRank=reg.sourceRanks.map(rank=>{
    const selected=rows.filter(r=>r.rank===rank);
    return {rank,matched:selected.filter(r=>r.matched).length,
      pairedTerminal:selected.filter(r=>r.matched&&r.terminal).length,
      championNativeWins:selected.filter(r=>r.champion.nativeCandidateWin).length,
      regidragoNativeWins:selected.filter(r=>r.regidrago.nativeCandidateWin).length,
      championNativeTerminals:selected.filter(r=>r.champion.finished&&!r.champion.error).length,
      regidragoNativeTerminals:selected.filter(r=>r.regidrago.finished&&!r.regidrago.error).length,
      nativeErrors:selected.flatMap(r=>[r.champion,r.regidrago])
        .filter(r=>r.error).length};
  });
  return {summary:{attempts:all.length,groups:rows.length,
    sourcePhysicallyMatched:rows.filter(r=>r.matched).length,
    bothTerminalAndMatched:rows.filter(r=>r.matched&&r.terminal).length,
    matchedWinnerContrasts:rows.filter(r=>r.winnerContrasts).length,
    winnerContrastsByCandidate:Object.fromEntries(reg.candidateIds.map(id=>[
      id,rows.filter(r=>r.favored===id).length])),
    paperQualifiedGames:0},
    field,perRank,comparisonRows:rows};
}
/** Atomically lock and archive all game roots, not only favorable terminals. */
function archive(report){
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    const f=fs.openSync(temp,'r');try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
function run(){
  const preflight=verify();
  const prior=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  const native=[],audits=[];
  try{
    for(const batch of reg.batches){
      const joined=withPaperSemanticsProfileV1(()=>runDevelopment({
        ...frozen.policyOptions,...reg.commonActorOptions,
        registeredTrials:batch.registeredTrials,
        registeredCandidateDecks:{
          'aichi-rank10-regidrago-vstar':
            {label:'aichi-rank10-regidrago-vstar',cards:preflight.rank10.cards}
        },
        registeredFrameName:VERSION+':'+batch.candidateId,
        allowSingleCandidatePerGroup:true,
        allowAdditionalOriginalSourceRanks:true,
        nativeRootActionLimit:reg.rootCap,
        isolatePolicyRandomness:true,
        isolatePhysicalShuffleRandomnessAfterSetup:true
      }),reg.profileEnabled);
      assert.equal(joined.result.attempted,58);
      native.push(joined.result);
      audits.push(joined.audit);
    }
  }finally{
    if(prior===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=prior;
  }
  const comparison=compare(...native);
  const result={schema:VERSION,preflight:{...preflight,roster:undefined,rank10:undefined},
    registration:reg,nativeExecution:{branch:process.env.GITHUB_REF??null,
      codeRevision:process.env.GITHUB_SHA??null,engine:PINNED_TWINLEAF,
      correctionProfiles:audits},comparison,actualNativeRuns:native,
    developmentOnly:true,competitivePaperQualifiedGames:0,
    selection:'undetermined by these noncompetitive native games'};
  archive(result);
  process.stdout.write('AGENT3_REGIDRAGO_SHADOW_ALL29 '+JSON.stringify({
    summary:comparison.summary,field:comparison.field,
    perRank:comparison.perRank,output:path.basename(OUTPUT)})+'\n');
  return result;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const x=verify();
    process.stdout.write(JSON.stringify({originalSourceRanks:reg.sourceRanks,
      originalGroups:x.groups,registeredNativeAttempts:x.gameAttempts,
      candidateIds:reg.candidateIds,engine:x.pinnedEngine,
      competitiveQualifiedGames:0})+'\n');
  }else run();
}
module.exports={VERSION,verify,compact,compare,run};
