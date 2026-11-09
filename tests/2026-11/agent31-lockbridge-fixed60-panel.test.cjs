'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const candidate=require('../../results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json');
const hood=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
const registration=require('../../results/aichi-2026/registrations/2026-11/agent31-lockbridge-panel-frozen-20261109.json');
const {inspect,compare,CANDIDATES}=
  require('../../simulation/evaluation/agent31/lockbridge-champion-eight-rank-panel.cjs');

const count=(manifest,name)=>manifest.cards
  .filter(x=>x.name===name).reduce((n,x)=>n+x.count,0);

test('Fixed 60 keeps both anti-lock technologies and full original attack engine',()=>{
  const sum=candidate.cards.reduce((n,x)=>n+x.count,0);
  assert.equal(sum,60);
  assert.deepEqual(candidate.category_counts,
    {'Pokémon':18,Trainer:31,Energy:11});
  assert.equal(count(candidate,'Shadow Rider Calyrex V'),4);
  assert.equal(count(candidate,'Shadow Rider Calyrex VMAX'),4);
  assert.equal(count(candidate,'Stealthy Hood'),2);
  assert.equal(count(candidate,'Temple of Sinnoh'),1);
  assert.equal(count(candidate,'Wobbuffet'),1);
  assert.equal(count(candidate,'Pokémon Ranger'),0);
  assert.equal(count(candidate,"Lillie's Clefairy ex"),1);
  for(const name of hood.cards.map(x=>x.name)){
    if(name==="Lillie's Clefairy ex"||name==='Pokémon Ranger')continue;
    assert.equal(count(candidate,name),count(hood,name));
  }
  for(const x of candidate.cards){
    assert.ok(x.count>0);
    assert.ok(x.count<=4||x.category==='Energy'&&x.name.endsWith('Energy'));
    assert.ok(x.printing?.set&&x.printing?.number&&x.printing?.language);
  }
});

test('All 16 physical group registrations were frozen with two exact contenders',()=>{
  const groups=inspect();
  assert.equal(groups.length,16);
  assert.equal(new Set(groups.map(g=>g.seed)).size,16);
  assert.equal(registration.trials.length,32);
  assert.equal(new Set(registration.trials.map(t=>t.id)).size,32);
  for(const g of groups){
    assert.deepEqual(registration.trials.filter(x=>x.id.startsWith(g.id+':'))
      .map(x=>x.candidateId),CANDIDATES);
  }
});

test('Comparison retains errors, distinct opening fingerprints, and natural native winner changes',()=>{
  const rows=registration.trials.map(t=>{
    const seat=t.candidateSlot==='A'?0:1;
    return {id:t.id,rank:t.rank,seed:t.seed,
      candidateId:t.candidateId,candidateSlot:t.candidateSlot,
      candidateSeat:seat,sourceDealFingerprint:t.id.split(':').slice(0,3).join(':'),
      actualStarterSeat:0,finished:true,nativeDisposition:'ENGINE_TERMINAL',
      nativeWinner:seat,candidateNativeWon:true,candidateNativeLost:false,
      rootCount:4,competitivePaperQualified:false};
  });
  const rank6B=rows.find(x=>x.rank===6&&x.candidateSlot==='B'&&
    x.candidateId===CANDIDATES[1]);
  rank6B.nativeWinner=0;rank6B.candidateNativeWon=false;
  rank6B.candidateNativeLost=true;
  const rank13A=rows.find(x=>x.rank===13&&x.candidateSlot==='A'&&
    x.candidateId===CANDIDATES[1]);
  rank13A.finished=false;rank13A.nativeWinner=null;
  rank13A.candidateNativeWon=false;rank13A.candidateNativeLost=false;
  rank13A.nativeDisposition='NATIVE_ABORT';
  const result=compare(rows);
  assert.equal(result.summary.registeredPhysicalGroups,16);
  assert.equal(result.summary.executedNativeAttempts,32);
  assert.equal(result.summary.sourceOpeningsMatched,16);
  assert.equal(result.summary.bothNativeTerminalWhenMatched,15);
  assert.equal(result.summary.nativeWinnerReversals,1);
  assert.equal(result.summary.challengerNativeLosses,1);
  assert.equal(result.summary.challengerNativeGains,0);
  assert.equal(result.summary.byCandidate[CANDIDATES[1]].errors,1);
  assert.equal(result.summary.paperQualifiedGames,0);
  assert.equal(result.reliableFieldWinRate,null);
  assert.equal(result.selectedDeck,'NONE');
});

test('Mismatched source physical deal never produces a causal native reversal',()=>{
  const rows=registration.trials.map(t=>{
    const seat=t.candidateSlot==='A'?0:1;
    return {id:t.id,rank:t.rank,seed:t.seed,
      candidateId:t.candidateId,candidateSlot:t.candidateSlot,
      candidateSeat:seat,sourceDealFingerprint:t.id.split(':').slice(0,3).join(':'),
      actualStarterSeat:0,finished:true,nativeDisposition:'ENGINE_TERMINAL',
      nativeWinner:seat,candidateNativeWon:true,candidateNativeLost:false,
      rootCount:4};
  });
  const changed=rows.find(x=>x.rank===1&&x.candidateSlot==='B'&&
    x.candidateId===CANDIDATES[1]);
  changed.sourceDealFingerprint='physically-different-source-opening';
  changed.candidateNativeWon=false;changed.candidateNativeLost=true;
  const result=compare(rows);
  assert.equal(result.summary.sourceOpeningsMatched,15);
  assert.equal(result.summary.nativeWinnerReversals,0);
});
