'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../results/aichi-2026/registrations/agent19-dual-fixed60-four-source-papercore-prospective-20261109.json');
const frozen=require('./agent41-frozen-bilateral-development-v2.json');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('./agent41-bilateral-v2-development.cjs');
const {classifyNativeAttempt}=require('./agent41-native-attempt-disposition.cjs');
const {withIndependentSeatRng}=
  require('../twinleaf/agent19-independent-seat-rng.cjs');
const {withPaperSemanticsProfileV1,VERSION:PROFILE_VERSION,PINNED_TWINLEAF}=
  require('../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');

const ROOT=path.resolve(__dirname,'../..');
const OUTPUT=path.join(ROOT,'agent19-fourrank-fixed60-fresh-native.json');
const VERSION='agent19-dual-fixed60-four-source-paperprofile-prospective-v1';

/** @param {Buffer} bytes @returns {string} */
function gitBlob(bytes){
  return createHash('sha1').update('blob '+bytes.length+'\0').update(bytes)
    .digest('hex');
}
/** @param {unknown} x @returns {string} */
function digest(x){
  return createHash('sha256').update(JSON.stringify(x)).digest('hex');
}
/** Preregistration integrity, independently of any chosen outcome. */
function inspect(){
  assert.equal(registration.schema,VERSION);
  assert.deepEqual(registration.sourceRanks,[5,6,11,13]);
  assert.deepEqual(registration.fixedContenderIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(registration.sourceGroups.length,16);
  assert.equal(registration.registeredTrials.length,32);
  assert.equal(new Set(registration.sourceGroups.map(x=>x.seed)).size,16);
  assert.equal(registration.rootCap,260);
  assert.equal(registration.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(frozen.pinnedVendorRevision,PINNED_TWINLEAF);
  assert.equal(PROFILE_VERSION,'agent19-composed-paper-semantics-profile-v1');
  for(const {path:filepath,blob} of registration.frozenSourceAndPolicyGitBlobs)
    assert.equal(gitBlob(fs.readFileSync(path.join(ROOT,filepath))),blob,
      'Registered code/printed card manifest drift: '+filepath);
  const {authenticatedSourceRanks}=require('./agent25-authenticated-source-admission.cjs');
  const roster=require('../../results/aichi-2026/full-decklists.json');
  const admitted=authenticatedSourceRanks(roster,true);
  validateRegisteredTrialGroups(registration.registeredTrials,admitted);
  const groups=new Map();
  for(const trial of registration.registeredTrials){
    const key=trial.id.slice(0,trial.id.lastIndexOf(':'));
    const prev=groups.get(key)??[];
    prev.push(trial);
    groups.set(key,prev);
  }
  assert.equal(groups.size,16);
  for(const [key,pair] of groups){
    assert.deepEqual(pair.map(x=>x.candidateId),
      registration.fixedContenderIds,'Each physical group pairs different 60s: '+key);
    assert.equal(pair[0].seed,pair[1].seed);
    assert.equal(pair[0].rank,pair[1].rank);
    assert.equal(pair[0].candidateSlot,pair[1].candidateSlot);
  }
  return {schema:VERSION,pinnedTwinleaf:PINNED_TWINLEAF,
    fixed60s:registration.fixedContenderIds,
    originalRanks:registration.sourceRanks,groupCount:groups.size,
    nativeAttempts:registration.registeredTrials.length,
    profile:PROFILE_VERSION,registrationSha256:digest(registration),
    competitiveQualifiedGames:0};
}
/** @param {object} row @returns {object} Lossless row-level disposition. */
function diagnosis(row){
  const trial=row.trial;
  const roots=row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
  const native=classifyNativeAttempt(row);
  return {id:trial.id,rank:trial.rank,repeat:trial.repeat,
    candidateSlot:trial.candidateSlot,candidateId:trial.candidateId,
    candidateSeat:trial.candidateSlot==='A'?0:1,
    originalSeat:trial.candidateSlot==='A'?1:0,
    actualStarterSeat:row.actualStarterSeat??null,
    sourceActuallyFirst:row.sourceActuallyFirst??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    physicalStatus:row.physicalZoneQualification?.status??null,
    rootCount:roots.length,rootDigest:row.rootActionLedgerSha256??
      digest(roots),rootActionLedger:roots,
    nativeDisposition:native.kind,nativeEndReason:row.endReason??null,
    nativeFinished:row.finished===true,
    nativeWinner:row.finished===true?row.winner??null:null,
    error:row.error?String(row.error).slice(0,1000):null,
    actualSourceCelestialRoar:roots.some(x=>x.playerSlot===
      (trial.candidateSlot==='A'?1:0)&&
      x.action==='AttackAction'&&x.attack==='Celestial Roar'),
    competitivePaperQualified:false
  };
}
/**
 * A cross-contender seed is not a matching physical deal by itself.
 * Compare terminal outcomes conditionally only when source opening and starter
 * are actually equal; otherwise retain individual rows without causal claims.
 * @param {object[]} rows Exactly 32 per-attempt native diagnostics.
 */
function compare(rows){
  const lookup=new Map(rows.map(row=>[row.id,row]));
  assert.equal(lookup.size,32);
  const groups=registration.sourceGroups.map(g=>{
    const key=[g.rank,g.repeat,g.candidateSlot].join(':');
    const [a,b]=registration.fixedContenderIds
      .map(id=>lookup.get(key+':'+id));
    assert.ok(a&&b,'Missing candidate or source row: '+key);
    const sameSourceDeal=Boolean(a.sourceDealFingerprint&&
      a.sourceDealFingerprint===b.sourceDealFingerprint);
    const sameActualStarter=a.actualStarterSeat!==null&&
      a.actualStarterSeat===b.actualStarterSeat;
    const bothNativeTerminal=a.nativeFinished===true&&
      b.nativeFinished===true&&
      !a.error&&!b.error;
    const candidateWinner=(x)=>x.nativeWinner===x.candidateSeat;
    return {key,rank:g.rank,repeat:g.repeat,
      candidateSlot:g.candidateSlot,seed:g.seed,
      sourceDeckOpeningPhysicallyMatched:sameSourceDeal,
      actualStarterMatched:sameActualStarter,
      comparableAtObservedOpening:sameSourceDeal&&sameActualStarter,
      bothNativeTerminal,
      terminalNativeWinnerDiffers:bothNativeTerminal&&
        candidateWinner(a)!==candidateWinner(b),
      contenders:{
        'champion-reference':a,
        'new-moon-lockbreaker-v1':b
      },paperQualified:false};
  });
  const perRank=registration.sourceRanks.map(rank=>{
    const selected=groups.filter(g=>g.rank===rank);
    const arms=selected.flatMap(g=>Object.values(g.contenders));
    return {rank,groups:selected.length,
      physicalSourcePairsMatched:selected.filter(g=>
        g.sourceDeckOpeningPhysicallyMatched).length,
      starterPairsMatched:selected.filter(g=>g.actualStarterMatched).length,
      matchedBothTerminal:selected.filter(g=>
        g.comparableAtObservedOpening&&g.bothNativeTerminal).length,
      fullNativeTerminalsByContender:Object.fromEntries(
        registration.fixedContenderIds.map(id=>[id,selected.filter(g=>
          g.contenders[id].nativeFinished&&
          !g.contenders[id].error).length])),
      engineErrors:arms.filter(x=>x.error).length,
      censoredOrUnverified:arms.filter(x=>!x.nativeFinished).length};
  });
  const all=groups.flatMap(g=>Object.values(g.contenders));
  return {groups,perRank,summary:{
    registeredGroups:groups.length,retainedNativeAttempts:all.length,
    sourcePhysicalPairsMatched:groups.filter(g=>
      g.sourceDeckOpeningPhysicallyMatched).length,
    bothStarterAndSourceMatched:groups.filter(g=>
      g.comparableAtObservedOpening).length,
    comparableBothNativeTerminal:groups.filter(g=>
      g.comparableAtObservedOpening&&g.bothNativeTerminal).length,
    observedMatchedTerminalWinnerContrasts:groups.filter(g=>
      g.comparableAtObservedOpening&&g.terminalNativeWinnerDiffers).length,
    nativeTerminalsByContender:Object.fromEntries(
      registration.fixedContenderIds.map(id=>[id,all.filter(x=>
        x.candidateId===id&&x.nativeFinished&&!x.error).length])),
    errors:all.filter(x=>x.error).length,
    nativeCappedOrIncomplete:all.filter(x=>!x.nativeFinished&&!x.error).length,
    sourceRank13CelestialEncounter:all.filter(x=>
      x.rank===13&&x.actualSourceCelestialRoar).length,
    sourceRank5EnergyMixProfileGlobalCount:'see-profile-audit',
    paperQualifiedGames:0,competitiveWinRateClaim:null}};
}
/** Exclusive lock plus rename; persist even incomplete or capped attempts. */
function archive(obj){
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(obj,null,2)+'\n',{flag:'wx'});
    const file=fs.openSync(temp,'r');
    try{fs.fsyncSync(file);}finally{fs.closeSync(file);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
function run(){
  const preflight=inspect();
  const key='AGENT4_NATIVE_PAYMENT_RECEIPT_DEV';
  assert.equal(process.env[key],undefined);
  const previous=process.env[key];
  process.env[key]='true';
  let batch;
  try{
    batch=withIndependentSeatRng(()=>withPaperSemanticsProfileV1(()=>
      runDevelopment({
        ...frozen.policyOptions,...registration.commonActorOptions,
        registeredTrials:registration.registeredTrials,
        registeredFrameName:VERSION,
        allowAdditionalOriginalSourceRanks:true,
        nativeRootActionLimit:registration.rootCap
      }),registration.profileEnabled));
  }finally{
    if(previous===undefined)delete process.env[key];
    else process.env[key]=previous;
  }
  const native=batch.result.result;
  assert.equal(native.attempted,32);
  assert.equal(native.rows.length,32);
  assert.equal(batch.audit.matches,32);
  const rows=native.rows.map(diagnosis);
  assert.deepEqual(rows.map(x=>x.id),
    registration.registeredTrials.map(x=>x.id));
  const comparison=compare(rows);
  comparison.summary.sourceRank5EnergyMixProfileGlobalCount=
    batch.result.audit.energyMixShuffle?.energyMixEffects??0;
  const result={schema:VERSION,preflight,registration,
    nativeExecution:{runner:'agent41-bilateral-v2-development.cjs',
      engine:PINNED_TWINLEAF,profileAudit:batch.result.audit,
      independentSeatRngAudit:batch.audit,codeRevision:process.env.GITHUB_SHA??null},
    comparison,
    allNativeRows:native.rows,
    nativeActorPolicyQualification:'developmental-unverified',
    partialObservedSourcePhysicalPairing:
      comparison.summary.bothStarterAndSourceMatched<16,
    competitivePaperQualifiedGames:0,
    claim:'Native candidate comparison with exact physical opening controls when matched; not an Aichi field win rate'};
  archive(result);
  process.stdout.write('AGENT19_DUAL_FIXED60_PROSPECTIVE '+
    JSON.stringify({preflight,summary:comparison.summary,
      perRank:comparison.perRank,profileAudit:batch.result.audit,
      output:path.basename(OUTPUT)})+'\n');
  return result;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify(inspect())+'\n');
  else run();
}
module.exports={VERSION,inspect,diagnosis,compare,run};
