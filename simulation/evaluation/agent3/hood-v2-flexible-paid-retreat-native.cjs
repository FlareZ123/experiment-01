'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../../results/aichi-2026/registrations/2026-11/agent3-hood-v2-flexible-paid-retreat-20261109.json');
const deck=require('../../../results/aichi-2026/candidate-hood-consistency-v2.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {SOURCE_POLICY}=require('./hood-consistency-v2-targeted-native.cjs');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF,VERSION:PROFILE}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {classifyNativeAttempt}=
  require('../agent41-native-attempt-disposition.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const VERSION='agent3-hood-v2-flexible-retreat-native-v1';
const OUT=process.env.AGENT3_FLEXIBLE_RETREAT_OUTPUT??
  path.join(ROOT,'artifacts/agent3-hood-v2-flexible-retreat.json');
const PROFILE_FLAGS=Object.freeze({
  celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true
});

function gitBlob(filename){
  const buffer=fs.readFileSync(path.join(ROOT,filename));
  return createHash('sha1').update('blob '+buffer.length+'\\0')
    .update(buffer).digest('hex');
}

function preflight(){
  assert.equal(registration.schema,VERSION);
  assert.equal(registration.status,'FROZEN BEFORE FIRST NATIVE RUN');
  assert.equal(registration.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(registration.paperSemanticsProfile,PROFILE);
  assert.equal(frozen.pinnedVendorRevision,PINNED_TWINLEAF);
  assert.equal(gitBlob(registration.fixedCandidate60),
    registration.fixedCandidateGitBlobSha);
  assert.equal(gitBlob(registration.originalRosterPath),
    registration.originalRosterGitBlobSha);
  assert.equal(gitBlob(registration.commonPolicyPath),
    registration.commonPolicyGitBlobSha);
  assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(registration.rootCap,260);
  assert.deepEqual(registration.arms,['baseline-v2','flexible-retreat-v2']);
  assert.deepEqual(registration.sourceRanks,[5,6]);
  assert.equal(registration.registeredGroups,9);
  assert.equal(registration.registeredNativeAttempts,18);
  assert.equal(registration.registeredSourceGroups.length,9);
  assert.equal(registration.registeredTrials.length,18);
  assert.deepEqual(registration.treatmentAdditionalFlags,
    {actorFlexiblePaidRetreatRoot:true});
  const admitted=require('../agent25-authenticated-source-admission.cjs')
    .authenticatedSourceRanks(
      require('../../../results/aichi-2026/full-decklists.json'),true);
  for(const id of registration.arms){
    const trials=registration.registeredTrials.filter(x=>x.candidateId===id);
    validateRegisteredTrialGroups(trials,admitted,false,true);
  }
  for(const group of registration.registeredSourceGroups){
    const pair=registration.registeredTrials.filter(x=>
      x.rank===group.rank&&x.repeat===group.repeat&&
      x.candidateSlot===group.candidateSlot);
    assert.deepEqual(pair.map(x=>x.candidateId),registration.arms);
    assert.ok(pair.every(x=>x.seed===group.seed&&x.sample===group.sample));
  }
  assert.equal(registration.registeredSourceGroups.filter(x=>
    x.sample==='PROSPECTIVE').length,8);
  assert.equal(registration.registeredSourceGroups.filter(x=>
    x.sample==='ARCHIVED_POSTHOC_ANCHOR').length,1);
  return {samePrinted60:true,originalRanks:[5,6],groups:9,nativeAttempts:18};
}

function receipt(row){
  const trial=row.trial;
  const seat=trial.candidateSlot==='A'?0:1;
  const roots=row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
  const disposition=classifyNativeAttempt(row).kind;
  const terminal=disposition==='ENGINE_TERMINAL'&&row.finished===true;
  const owned=roots.filter(x=>x.playerSlot===seat);
  const attacked=name=>owned.filter(x=>
    x.action==='AttackAction'&&x.attack===name).length;
  return {id:trial.id,candidateId:trial.candidateId,sample:trial.sample,
    rank:trial.rank,seed:trial.seed,seat,repeat:trial.repeat,
    status:disposition,terminal,nativeWinner:terminal?row.winner:null,
    candidateNativeWin:terminal&&row.winner===seat,
    actualStarterSeat:row.actualStarterSeat??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    finalPrizes:row.finalPrizes??null,
    rootCount:roots.length,
    candidatePaidRetreats:owned.filter(x=>x.action==='RetreatAction').length,
    candidateFilch:attacked('Filch'),
    candidateMaxGeist:attacked('Max Geist'),
    candidateNightWatch:attacked('Night Watch'),
    candidateOtherAttacks:owned.filter(x=>x.action==='AttackAction'&&
      !['Filch','Max Geist','Night Watch'].includes(x.attack)).map(x=>x.attack),
    error:row.error?String(row.error).slice(0,1000):null,
    roots,paperQualified:false};
}

function compare(records){
  const byId=new Map(records.map(row=>[row.id,row]));
  assert.equal(byId.size,18);
  const groups=registration.registeredSourceGroups.map(source=>{
    const key=[source.rank,source.repeat,source.candidateSlot].join(':');
    const a=byId.get(key+':baseline-v2');
    const b=byId.get(key+':flexible-retreat-v2');
    assert.ok(a&&b,'Missing native source pair '+key);
    const physicalMatched=Boolean(a.fullPhysicalDealFingerprint&&
      b.fullPhysicalDealFingerprint&&a.sourceDealFingerprint&&
      b.sourceDealFingerprint&&
      a.fullPhysicalDealFingerprint===b.fullPhysicalDealFingerprint&&
      a.sourceDealFingerprint===b.sourceDealFingerprint&&
      a.actualStarterSeat!==null&&
      a.actualStarterSeat===b.actualStarterSeat);
    const al=a.terminal?(a.candidateNativeWin?1:0):null;
    const bl=b.terminal?(b.candidateNativeWin?1:0):null;
    return {key,rank:source.rank,seat:source.candidateSlot,
      seed:source.seed,sample:source.sample,physicalMatched,
      bothTerminal:a.terminal&&b.terminal,
      signedObservedWinDifference:a.terminal&&b.terminal&&physicalMatched?
        bl-al:null,
      possibleWinDifference:physicalMatched?
        {lower:(bl??0)-(al??1),upper:(bl??1)-(al??0)}:
        {lower:null,upper:null},
      control:a,treatment:b};
  });
  const matched=groups.filter(g=>g.physicalMatched);
  const aggregate=(arr,k)=>arr.reduce((n,r)=>n+r[k],0);
  const arm=id=>{
    const rows=records.filter(r=>r.candidateId===id);
    return {attempted:rows.length,terminals:rows.filter(r=>r.terminal).length,
      nativeWins:rows.filter(r=>r.candidateNativeWin).length,
      nativeAborts:rows.filter(r=>r.status==='NATIVE_ABORT').length,
      actionCaps:rows.filter(r=>r.status==='ACTION_CAP').length,
      paidRetreats:aggregate(rows,'candidatePaidRetreats'),
      filch:aggregate(rows,'candidateFilch'),
      maxGeist:aggregate(rows,'candidateMaxGeist'),
      nightWatch:aggregate(rows,'candidateNightWatch')};
  };
  const subset=sample=>matched.filter(g=>g.sample===sample);
  const bounds=rows=>({
    lower:rows.reduce((n,g)=>n+g.possibleWinDifference.lower,0),
    upper:rows.reduce((n,g)=>n+g.possibleWinDifference.upper,0)
  });
  const summary={registeredSourceGroups:groups.length,
    prospectiveRegistered:8,retrospectiveAnchorRegistered:1,
    nativeAttempts:records.length,
    physicallyComparableGroups:matched.length,
    prospectivePhysicallyComparable:subset('PROSPECTIVE').length,
    bothTerminalComparable:matched.filter(g=>g.bothTerminal).length,
    matchedObservedTreatmentGains:matched.filter(g=>
      g.signedObservedWinDifference===1).length,
    matchedObservedTreatmentLosses:matched.filter(g=>
      g.signedObservedWinDifference===-1).length,
    allMatchedSharpCensorBounds:bounds(matched),
    prospectiveOnlySharpCensorBounds:bounds(subset('PROSPECTIVE')),
    control:arm('baseline-v2'),treatment:arm('flexible-retreat-v2'),
    independentlyPaperQualifiedGames:0};
  return {groups,summary};
}

function saveAtomic(filename,value){
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const lock=filename+'.lock';
  const tmp=filename+'.'+process.pid+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try{
    fs.writeFileSync(tmp,JSON.stringify(value,null,2)+'\\n');
    fs.renameSync(tmp,filename);
  }finally{
    fs.closeSync(fd);
    fs.rmSync(tmp,{force:true});
    fs.rmSync(lock,{force:true});
  }
}

function run({runner=runDevelopment,profile=withPaperSemanticsProfileV1}={}){
  const checked=preflight();
  const old=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  let wrapped;
  try{
    wrapped=profile(()=>{
      const all=[];
      for(const id of registration.arms){
        const r=runner({...frozen.policyOptions,...SOURCE_POLICY,
          ...(id==='flexible-retreat-v2'?
            registration.treatmentAdditionalFlags:{}),
          registeredCandidateDecks:Object.fromEntries(
            registration.arms.map(name=>[name,{label:name,cards:deck.cards}])),
          registeredTrials:registration.registeredTrials.filter(t=>
            t.candidateId===id),
          registeredFrameName:VERSION+':'+id,
          allowSingleCandidatePerGroup:true,
          allowAdditionalOriginalSourceRanks:true,
          nativeRootActionLimit:registration.rootCap,
          isolatePolicyRandomness:true,
          isolatePhysicalShuffleRandomnessAfterSetup:true
        });
        assert.equal(r.attempted,9);
        assert.equal(r.rows.length,9);
        all.push(...r.rows);
      }
      const byId=new Map(all.map(row=>[row.trial.id,row]));
      assert.equal(byId.size,18);
      return registration.registeredTrials.map(t=>{
        const row=byId.get(t.id);
        assert.ok(row,'Missing native attempt '+t.id);
        return row;
      });
    },PROFILE_FLAGS);
  }finally{
    if(old===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=old;
  }
  const rows=wrapped.result;
  const evaluated=compare(rows.map(receipt));
  return {schema:VERSION,checked,registration,
    nativeEngine:PINNED_TWINLEAF,codeCommit:process.env.GITHUB_SHA??null,
    identicalPrintedCandidate60:true,
    commonPolicy:SOURCE_POLICY,
    onlyTreatmentFlag:registration.treatmentAdditionalFlags,
    paperProfileAudit:wrapped.audit,
    summary:evaluated.summary,comparison:evaluated.groups,
    fullNativeRows:rows,competitiveAdmission:false};
}

if(require.main===module){
  const report=run();
  saveAtomic(OUT,report);
  process.stdout.write('AGENT3_FLEXIBLE_RETREAT_NATIVE '+
    JSON.stringify({summary:report.summary,artifact:OUT})+'\\n');
  if(report.summary.physicallyComparableGroups!==9)process.exitCode=1;
}
module.exports={VERSION,PROFILE_FLAGS,preflight,receipt,compare,run,saveAtomic};
