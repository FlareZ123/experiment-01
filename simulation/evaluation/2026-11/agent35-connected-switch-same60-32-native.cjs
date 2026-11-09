'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const reg=require('../../../results/aichi-2026/registrations/2026-11/agent35-connected-switch-same60-32-prospective-20261109.json');
const deck=require('../../../results/aichi-2026/candidate-hood-shadow-rider-switch-v2.json');
const roster=require('../../../results/aichi-2026/full-decklists.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {classifyNativeAttempt}=
  require('../agent41-native-attempt-disposition.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF,VERSION:PROFILE}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {compareTwo}=
  require('./agent35-three-architecture-eight-rank-native.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const VERSION='agent35-connected-switch-same60-32-prospective-v2';
const IDS=Object.freeze(['baseline-block-only','general-tactical-switch']);
const OUTPUT=process.env.AGENT35_CONNECTED_SWITCH32_OUTPUT??
  path.join(ROOT,'artifacts/agent35-connected-switch-same60-32-native.json');
const PAPER_PROFILE=Object.freeze({
  celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true
});
function gitBlob(relativePath){
  const buf=fs.readFileSync(path.join(ROOT,relativePath));
  return createHash('sha1').update('blob '+buf.length+'\0')
    .update(buf).digest('hex');
}
function preflight(){
  assert.equal(reg.schema,VERSION);
  assert.equal(reg.status,'FROZEN BEFORE FIRST NATIVE GAME');
  assert.equal(reg.nativeAttempts,32);
  assert.equal(reg.sourceGroupCount,16);
  assert.equal(reg.rootCap,260);
  assert.deepEqual(reg.comparisonArms,IDS);
  assert.deepEqual(reg.sourceRanks,[3,7,8,9,13,16,21,22]);
  assert.equal(reg.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(reg.paperSemanticsProfile,PROFILE);
  assert.equal(frozen.pinnedVendorRevision,PINNED_TWINLEAF);
  assert.equal(gitBlob(reg.unchangedCandidate60),reg.candidateDeckGitBlobSha);
  assert.equal(gitBlob(reg.registeredSourceDecks),reg.sourceRosterGitBlobSha);
  assert.equal(gitBlob(reg.sharedPolicyPath),reg.sharedPolicyGitBlobSha);
  const src={
    actor34:'simulation/twinleaf/agent34-actor-only-root-policy.cjs',
    agent41:'simulation/evaluation/agent41-bilateral-v2-development.cjs',
    genericSwitch:'simulation/twinleaf/2026-11/agent35-tactical-switch-funded-ko.cjs',
    blockSwitch:'simulation/twinleaf/agent35-block-switch-ko-frontier.cjs',
    activeLock:'simulation/twinleaf/agent47-active-position-retreat-veto.cjs'
  };
  for(const [key,file] of Object.entries(src))
    assert.equal(gitBlob(file),reg.policySourceBlobSha[key],
      'Preregistered policy drift: '+key);
  assert.equal(deck.cards.reduce((sum,c)=>sum+c.count,0),60);
  const switchCount=deck.cards.find(c=>c.name==='Switch')?.count;
  assert.equal(switchCount,1);
  assert.equal(reg.sharedPolicyFlags.actorGenericTacticalSwitchRoot,undefined);
  // The exact previously missing connection is a required condition of this
  // corrected prospective trial, not an incidental policy implementation.
  const rootCode=fs.readFileSync(path.join(ROOT,
    'simulation/twinleaf/agent34-actor-only-root-policy.cjs'),'utf8');
  assert.ok(rootCode.includes(
    'genericTacticalSwitchRoot:audit.genericTacticalSwitchRootOptIn===true'));
  assert.ok(rootCode.includes(
    'opponentBlockSwitchRoot:audit.opponentBlockSwitchRootOptIn===true'));
  assert.deepEqual(reg.treatmentOnlyFlags,{actorGenericTacticalSwitchRoot:true});
  const allowed=require('../agent25-authenticated-source-admission.cjs')
    .authenticatedSourceRanks(roster,true);
  for(const id of IDS){
    const trials=reg.registeredTrials.filter(t=>t.candidateId===id);
    assert.equal(trials.length,16);
    validateRegisteredTrialGroups(trials,allowed,false,true);
  }
  assert.equal(reg.sourceGroups.length,16);
  assert.equal(reg.registeredTrials.length,32);
  assert.equal(new Set(reg.sourceGroups.map(g=>g.seed)).size,16);
  assert.equal(new Set(reg.registeredTrials.map(t=>t.id)).size,32);
  for(const group of reg.sourceGroups){
    const pair=reg.registeredTrials.filter(t=>
      t.rank===group.rank&&t.repeat===group.repeat&&
      t.candidateSlot===group.candidateSlot);
    assert.deepEqual(pair.map(t=>t.candidateId),IDS);
    assert.ok(pair.every(t=>t.seed===group.seed));
  }
  return {sameExactSixty:true,registeredGroups:16,registeredGames:32,
    paperQualifiedGames:0};
}
function receipt(row){
  const trial=row.trial;
  const roots=row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
  const status=classifyNativeAttempt(row).kind;
  const candidateSeat=trial.candidateSlot==='A'?0:1;
  const finished=status==='ENGINE_TERMINAL'&&row.finished===true;
  const owner=roots.filter(x=>x.playerSlot===candidateSeat);
  const countPlay=prefix=>owner.filter(x=>
    x.action==='PlayCardAction'&&typeof x.card==='string'&&
    (x.card===prefix||x.card.startsWith(prefix+' '))).length;
  const countAttack=name=>owner.filter(x=>
    x.action==='AttackAction'&&x.attack===name).length;
  return {
    trialId:trial.id,rank:trial.rank,seed:trial.seed,
    candidateSlot:trial.candidateSlot,candidateId:trial.candidateId,
    candidateSeat,status,finished,
    nativeCandidateWin:finished&&row.winner===candidateSeat,
    nativeWinner:finished?row.winner:null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    physicalDeal:row.fullPhysicalDealFingerprint??null,
    roots:roots.length,
    switchPlayed:countPlay('Switch'),
    maxGeist:countAttack('Max Geist'),
    paperQualified:false,
    error:row.error?String(row.error).slice(0,1200):null
  };
}
function compare(records){
  assert.equal(records.length,32);
  const byId=new Map(records.map(r=>[r.trialId,r]));
  assert.equal(byId.size,32);
  const groups=reg.sourceGroups.map(source=>{
    const key=[source.rank,source.repeat,source.candidateSlot].join(':');
    const rows=Object.fromEntries(IDS.map(id=>{
      const row=byId.get(key+':'+id);
      assert.ok(row,'Missing registered trial '+key+':'+id);
      return [id,row];
    }));
    return {rank:source.rank,slot:source.candidateSlot,
      repeat:source.repeat,seed:source.seed,rows};
  });
  const perArm=Object.fromEntries(IDS.map(id=>{
    const rows=groups.map(g=>g.rows[id]);
    const sum=k=>rows.reduce((n,r)=>n+r[k],0);
    return [id,{
      attempted:rows.length,nativeTerminal:rows.filter(r=>r.finished).length,
      nativeWins:rows.filter(r=>r.nativeCandidateWin).length,
      actionCaps:rows.filter(r=>r.status==='ACTION_CAP').length,
      engineAborts:rows.filter(r=>r.status==='NATIVE_ABORT').length,
      acceptedSwitchPlays:sum('switchPlayed'),
      maxGeistDeclarations:sum('maxGeist'),
      independentlyPaperQualified:0
    }];
  }));
  return {summary:{
    registeredPhysicalSourceGroups:groups.length,attemptedNativeGames:32,
    perArm,matched:compareTwo(groups,IDS[0],IDS[1]),
    independentlyPaperQualifiedGames:0
  },groups};
}
function saveAtomic(filename,value){
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const lock=filename+'.lock',tmp=filename+'.'+process.pid+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try{
    fs.writeFileSync(tmp,JSON.stringify(value,null,2)+'\n');
    fs.renameSync(tmp,filename);
  }finally{
    fs.closeSync(fd);
    fs.rmSync(lock,{force:true});
    fs.rmSync(tmp,{force:true});
  }
}
function run({runner=runDevelopment,profile=withPaperSemanticsProfileV1}={}){
  const admission=preflight();
  const previous=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  let wrapped;
  try{
    wrapped=profile(()=>{
      const rows=[];
      for(const id of IDS){
        const r=runner({
          ...frozen.policyOptions,...reg.sharedPolicyFlags,
          ...(id===IDS[1]?reg.treatmentOnlyFlags:{}),
          registeredCandidateDecks:Object.fromEntries(IDS.map(name=>
            [name,{label:name,cards:deck.cards}])),
          registeredTrials:reg.registeredTrials.filter(t=>t.candidateId===id),
          registeredFrameName:VERSION+':'+id,
          allowSingleCandidatePerGroup:true,
          allowAdditionalOriginalSourceRanks:true,
          nativeRootActionLimit:reg.rootCap,
          isolatePolicyRandomness:true,
          isolatePhysicalShuffleRandomnessAfterSetup:true
        });
        assert.equal(r.attempted,16);
        assert.equal(r.rows.length,16);
        rows.push(...r.rows);
      }
      const byId=new Map(rows.map(row=>[row.trial.id,row]));
      assert.equal(byId.size,32);
      return {attempted:32,rows:reg.registeredTrials.map(t=>{
        const row=byId.get(t.id);
        assert.ok(row,'Missing executed source trial '+t.id);
        return row;
      })};
    },PAPER_PROFILE);
  }finally{
    if(previous===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=previous;
  }
  assert.equal(wrapped.result.attempted,32);
  const comparison=compare(wrapped.result.rows.map(receipt));
  return {schema:VERSION,admission,referenceCommit:process.env.GITHUB_SHA??null,
    pinnedTwinleaf:PINNED_TWINLEAF,paperProfile:PROFILE,
    policies:{control:reg.sharedPolicyFlags,
      treatment:{...reg.sharedPolicyFlags,...reg.treatmentOnlyFlags}},
    paperAudit:wrapped.audit,summary:comparison.summary,
    groups:comparison.groups,fullNativeRows:wrapped.result.rows,
    paperQualifiedGames:0,claim99Point5:false};
}
if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify(preflight())+'\n');
  else{
    const report=run();saveAtomic(OUTPUT,report);
    process.stdout.write('AGENT35_CONNECTED_SWITCH32 '+
      JSON.stringify({summary:report.summary,
        artifact:OUTPUT,qualified:0})+'\n');
  }
}
module.exports={VERSION,IDS,preflight,receipt,compare,saveAtomic,run};
