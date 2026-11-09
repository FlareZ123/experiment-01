'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const reg=require('../../../results/aichi-2026/registrations/2026-11/agent35-hood-switch-vs-teammates-32-prospective-20261109.json');
const base=require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
const novel=require('../../../results/aichi-2026/candidate-hood-shadow-rider-switch-v2.json');
const roster=require('../../../results/aichi-2026/full-decklists.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment,validateRegisteredTrialGroups}=
  require('../agent41-bilateral-v2-development.cjs');
const {classifyNativeAttempt}=
  require('../agent41-native-attempt-disposition.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF,VERSION:PROFILE}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');
const {compareTwo}=
  require('./agent35-three-architecture-eight-rank-native.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const VERSION='agent35-switch-vs-teammates-lock-escape-32-prospective-v1';
const IDS=Object.freeze(['hood-shield-v1','hood-switch-v2']);
const OUTPUT=process.env.AGENT35_SWITCH32_OUTPUT??
  path.join(ROOT,'artifacts/agent35-hood-switch-vs-teammates-32-native.json');
const ROOT_POLICY=Object.freeze({
  actorOnlyComposition:true,
  actorMewMaxMiracleOverSelfCopy:true,
  actorMewGenesectTechnoBlast:true,
  actorMewDceRecipientRoot:true,
  actorMewDceRecipientSourceOnly:true,
  actorDceMewMobilityRoot:true,
  actorGenesectFusionDrawRoot:true,
  actorNaturalEvolutionRoot:true,
  bilateralBasicEnergyRecipientFrontier:true,
  actorUnderworldDoorPromptOwner:true,
  actorUnderworldDoorRoot:true,
  nativeAllOwnerPassFrontier:true,
  actorGuzmaPromptContinuation:true,
  actorGuzmaNominalGust:true,
  actorSeekerGuzmaNominalKo:true,
  actorZeroEnergyStrandFloatStoneRoot:true,
  actorOpponentBlockSwitchRoot:true,
  actorChoosePokemon:true,
  actorChargedPromotion:true
});
const PAPER_PROFILE=Object.freeze({
  celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true
});
function gitBlob(relativePath){
  const bytes=fs.readFileSync(path.join(ROOT,relativePath));
  return createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
}
function preflight(){
  assert.equal(reg.schema,VERSION);
  assert.equal(reg.status,'FROZEN BEFORE FIRST NATIVE GAME');
  assert.equal(reg.nativeAttempts,32);
  assert.equal(reg.sourceGroupCount,16);
  assert.equal(reg.rootCap,260);
  assert.equal(reg.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(reg.paperSemanticsProfile,PROFILE);
  assert.equal(frozen.pinnedVendorRevision,PINNED_TWINLEAF);
  assert.deepEqual(reg.sourceRanks,[3,7,8,9,13,16,21,22]);
  assert.deepEqual(reg.candidateDecks.map(x=>x.id),IDS);
  for(const c of reg.candidateDecks){
    assert.equal(gitBlob(c.path),c.gitBlobSha,
      'Frozen physical sixty drift: '+c.id);
  }
  assert.equal(gitBlob(reg.registeredSourceDecks),reg.sourceRosterGitBlobSha);
  assert.equal(gitBlob(reg.sharedPolicyPath),reg.sharedPolicyGitBlobSha);
  for(const [key,file] of [
    ['actor34','simulation/twinleaf/agent34-actor-only-root-policy.cjs'],
    ['agent41','simulation/evaluation/agent41-bilateral-v2-development.cjs'],
    ['switchFrontier','simulation/twinleaf/agent35-block-switch-ko-frontier.cjs'],
    ['blockObserver','simulation/twinleaf/agent35-opponent-active-retreat-lock.cjs']
  ]) assert.equal(gitBlob(file),reg.policySourceBlobSha[key],
    'Registered policy drift: '+key);
  const decks=[base,novel];
  assert.ok(decks.every(d=>d.cards.reduce((sum,c)=>sum+c.count,0)===60));
  const printings=d=>new Map(d.cards.map(c=>[
    c.name+' '+c.printing.set+' '+c.printing.number,c.count]));
  const a=printings(base),b=printings(novel);
  const changes=[...new Set([...a.keys(),...b.keys()])].filter(k=>a.get(k)!==b.get(k));
  assert.deepEqual(changes.sort(),['Switch SVI 194','Teammates PRC 141']);
  assert.equal(a.get('Teammates PRC 141'),1);
  assert.equal(b.get('Switch SVI 194'),1);
  const allowed=require('../agent25-authenticated-source-admission.cjs')
    .authenticatedSourceRanks(roster,true);
  for(const id of IDS){
    const trials=reg.registeredTrials.filter(x=>x.candidateId===id);
    assert.equal(trials.length,16);
    validateRegisteredTrialGroups(trials,allowed,false,true);
  }
  assert.equal(reg.sourceGroups.length,16);
  assert.equal(reg.registeredTrials.length,32);
  assert.equal(new Set(reg.sourceGroups.map(x=>x.seed)).size,16);
  assert.equal(new Set(reg.registeredTrials.map(x=>x.id)).size,32);
  for(const group of reg.sourceGroups){
    const both=reg.registeredTrials.filter(x=>
      x.rank===group.rank&&x.repeat===group.repeat&&
      x.candidateSlot===group.candidateSlot);
    assert.deepEqual(both.map(x=>x.candidateId),IDS);
    assert.ok(both.every(x=>x.seed===group.seed));
  }
  return {sourceRanks:reg.sourceRanks,sourceGroups:16,nativeGames:32,
    unchanged60s:true,pinnedTwinleaf:PINNED_TWINLEAF};
}
function receipt(row){
  const trial=row.trial,roots=row.rootActionLedger??
    row.nativeAbortEvidence?.rootActionLedger??[];
  const status=classifyNativeAttempt(row).kind;
  const candidateSeat=trial.candidateSlot==='A'?0:1;
  const finished=status==='ENGINE_TERMINAL'&&row.finished===true;
  const ownerRoots=roots.filter(r=>r.playerSlot===candidateSeat);
  const play=name=>ownerRoots.filter(r=>r.action==='PlayCardAction'&&
    (r.card===name||r.card?.startsWith(name+' '))).length;
  const attack=name=>ownerRoots.filter(r=>r.action==='AttackAction'&&
    r.attack===name).length;
  return {
    trialId:trial.id,rank:trial.rank,seed:trial.seed,
    candidateSlot:trial.candidateSlot,candidateId:trial.candidateId,
    candidateSeat,status,finished,
    nativeWinner:finished?row.winner:null,
    nativeCandidateWin:finished&&row.winner===candidateSeat,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    physicalDeal:row.fullPhysicalDealFingerprint??null,
    roots:roots.length,
    switchPlayed:play('Switch'),
    teammatesPlayed:play('Teammates'),
    arvenPlayed:play('Arven'),
    hoodPlayed:play('Stealthy Hood'),
    maxGeist:attack('Max Geist'),
    error:row.error?String(row.error).slice(0,1200):null,
    paperQualified:false
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
      assert.ok(row,'Missing frozen trial '+key+':'+id);
      return [id,row];
    }));
    return {rank:source.rank,slot:source.candidateSlot,
      repeat:source.repeat,seed:source.seed,rows};
  });
  const perCandidate=Object.fromEntries(IDS.map(id=>{
    const rows=groups.map(group=>group.rows[id]);
    const sum=key=>rows.reduce((total,row)=>total+row[key],0);
    return [id,{
      attempts:rows.length,terminal:rows.filter(r=>r.finished).length,
      candidateWins:rows.filter(r=>r.nativeCandidateWin).length,
      caps:rows.filter(r=>r.status==='ACTION_CAP').length,
      nativeErrors:rows.filter(r=>r.status==='NATIVE_ABORT').length,
      switchPlayed:sum('switchPlayed'),teammatesPlayed:sum('teammatesPlayed'),
      hoodPlayed:sum('hoodPlayed'),arvenPlayed:sum('arvenPlayed'),
      maxGeist:sum('maxGeist')
    }];
  }));
  return {summary:{sourceGroups:16,nativeGames:32,perCandidate,
    sourceMatched:compareTwo(groups,IDS[0],IDS[1]),
    competitivelyPaperQualifiedGames:0},groups};
}
function run({runner=runDevelopment,profile=withPaperSemanticsProfileV1}={}){
  const admission=preflight();
  const beforePayment=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  const beforeMimikyu=process.env.AGENT12_TEMPLE_THORNS_OWNER_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  process.env.AGENT12_TEMPLE_THORNS_OWNER_DEV='true';
  let wrapped;
  try{
    wrapped=profile(()=>{
      const rows=[];
      for(const id of IDS){
        const actual=runner({
          ...frozen.policyOptions,...ROOT_POLICY,
          registeredCandidateDecks:{
            'hood-shield-v1':{label:'hood-shield-v1',cards:base.cards},
            'hood-switch-v2':{label:'hood-switch-v2',cards:novel.cards}
          },
          registeredTrials:reg.registeredTrials.filter(t=>t.candidateId===id),
          registeredFrameName:VERSION+':'+id,
          allowSingleCandidatePerGroup:true,
          allowAdditionalOriginalSourceRanks:true,
          nativeRootActionLimit:reg.rootCap,
          isolatePolicyRandomness:true,
          isolatePhysicalShuffleRandomnessAfterSetup:true
        });
        assert.equal(actual.attempted,16);
        assert.equal(actual.rows.length,16);
        rows.push(...actual.rows);
      }
      const byId=new Map(rows.map(row=>[row.trial.id,row]));
      assert.equal(byId.size,32);
      return {attempted:32,rows:reg.registeredTrials.map(trial=>{
        const row=byId.get(trial.id);
        assert.ok(row,'Missing exact registered row '+trial.id);
        return row;
      })};
    },PAPER_PROFILE);
  }finally{
    for(const [key,old] of [
      ['AGENT4_NATIVE_PAYMENT_RECEIPT_DEV',beforePayment],
      ['AGENT12_TEMPLE_THORNS_OWNER_DEV',beforeMimikyu]
    ]){
      if(old===undefined)delete process.env[key];
      else process.env[key]=old;
    }
  }
  assert.equal(wrapped.result.attempted,32);
  const comparison=compare(wrapped.result.rows.map(receipt));
  return {
    schema:VERSION,admission,referenceCommit:process.env.GITHUB_SHA??null,
    pinnedTwinleaf:PINNED_TWINLEAF,
    actorPolicy:ROOT_POLICY,paperProfile:PROFILE,paperAudit:wrapped.audit,
    summary:comparison.summary,groups:comparison.groups,
    fullNativeRows:wrapped.result.rows,
    developmentOnly:true,paperQualifiedGames:0,claim99Point5:false
  };
}
if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify(preflight())+'\n');
  else{
    const report=run();save(OUTPUT,report);
    const result=report.summary;
    process.stdout.write('AGENT35_SWITCH_32 '+
      JSON.stringify({
        registration:report.schema,
        perCandidate:result.perCandidate,
        sourceMatched:{
          groups:result.sourceMatched.matchedGroups,
          doubleTerminal:result.sourceMatched.doubleTerminal,
          sharpWinDifference:result.sourceMatched.sharpNativeWinDifferenceRightMinusLeft
        },
        artifact:OUTPUT,paperQualifiedGames:0
      })+'\n');
  }
}
module.exports={VERSION,IDS,ROOT_POLICY,preflight,receipt,compare,run};