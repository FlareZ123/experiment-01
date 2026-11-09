'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/agent3-hood-consistency-v2-targeted-20261109.json');
const original=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
const improved=require('../../results/aichi-2026/candidate-hood-consistency-v2.json');
const {
  SOURCE_POLICY,PAPER_PROFILE,preflight,compare
}=require('../../simulation/evaluation/agent3/hood-consistency-v2-targeted-native.cjs');

test('printed full 60, precise four-count donor swap, no third candidate',()=>{
  assert.equal(original.cards.reduce((n,x)=>n+x.count,0),60);
  assert.equal(improved.cards.reduce((n,x)=>n+x.count,0),60);
  const counts=manifest=>new Map(manifest.cards.map(x=>[x.name,x.count]));
  const a=counts(original),b=counts(improved);
  const names=[...new Set([...a.keys(),...b.keys()])];
  const diff=Object.fromEntries(names
    .map(k=>[k,(b.get(k)??0)-(a.get(k)??0)])
    .filter(([,n])=>n!==0));
  assert.deepEqual(diff,{
    'Tapu Lele-GX':1,
    'VS Seeker':1,
    'Pokémon Ranger':-1,
    'Stealthy Hood':-1
  });
  assert.equal(a.get('Shadow Rider Calyrex V'),4);
  assert.equal(b.get('Shadow Rider Calyrex V'),4);
  assert.equal(a.get('Shadow Rider Calyrex VMAX'),4);
  assert.equal(b.get('Shadow Rider Calyrex VMAX'),4);
  assert.equal(a.get('Arven'),1);
  assert.equal(b.get('Arven'),1);
  assert.equal(a.get('Psychic Energy'),11);
  assert.equal(b.get('Psychic Energy'),11);
});

test('precommitted eleven exact original ranks and both seats per two repeats',()=>{
  const p=preflight();
  assert.equal(p.registeredGroups,44);
  assert.equal(p.nativeAttempts,88);
  assert.equal(registration.sourceGroups.length,44);
  assert.equal(new Set(registration.sourceGroups.map(g=>g.seed)).size,44);
  for(const rank of registration.originalSourceRanks){
    for(const slot of ['A','B']){
      assert.deepEqual(registration.sourceGroups
        .filter(g=>g.rank===rank&&g.candidateSlot===slot)
        .map(g=>g.repeat),[8101,8102]);
    }
  }
  assert.deepEqual(registration.registeredTrials.map(x=>x.candidateId)
    .slice(0,6),['hood-shield-v1','hood-consistency-v2',
    'hood-shield-v1','hood-consistency-v2',
    'hood-shield-v1','hood-consistency-v2']);
});

test('both opponents receive existing common evolution while source Mew policy is treated identically against both contenders',()=>{
  assert.equal(SOURCE_POLICY.actorNaturalEvolutionRoot,true);
  assert.equal(SOURCE_POLICY.actorNaturalEvolutionSourceOnly??false,false);
  assert.equal(SOURCE_POLICY.actorMewDceRecipientRoot,true);
  assert.equal(SOURCE_POLICY.actorMewDceRecipientSourceOnly,true);
  assert.equal(SOURCE_POLICY.actorMewGenesectTechnoBlast,true);
  assert.equal(SOURCE_POLICY.actorMewGenesectTechnoBlastSourceOnly??false,false);
  assert.equal(SOURCE_POLICY.actorSeekerGuzmaNominalKo,true);
  assert.equal(SOURCE_POLICY.actorZeroEnergyStrandFloatStoneRoot,true);
  assert.deepEqual(PAPER_PROFILE,
    {celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true});
});

test('sharp censor bounds retain both-unknown, single-known and source-unmatched cases',()=>{
  const rows=[];
  for(const g of registration.sourceGroups){
    const key=[g.rank,g.repeat,g.candidateSlot].join(':');
    const both=[
      ['hood-shield-v1',true,false],
      ['hood-consistency-v2',true,true]
    ];
    for(const [id,finished,won] of both){
      rows.push({
        id:key+':'+id,rank:g.rank,seed:g.seed,
        seat:g.candidateSlot==='A'?0:1,candidateId:id,
        originalSourceOpening:'source:'+g.seed,
        actualStarterSeat:0,rootActionLedger:[],finished,
        candidateWin:finished&&won,status:'ENGINE_TERMINAL'
      });
    }
  }
  let result=compare(rows);
  assert.equal(result.summary.sourceAndStarterMatched,44);
  assert.deepEqual(result.summary.sharpPairedV2MinusV1WinCount,
    {lower:44,upper:44});
  assert.equal(result.summary.matchedTerminalV2Gains,44);
  rows[1].finished=false;
  rows[1].candidateWin=false;
  rows[1].status='ACTION_CAP';
  result=compare(rows);
  assert.deepEqual(result.groups[0].possibleV2MinusV1,
    {lower:0,upper:1});
  assert.deepEqual(result.summary.sharpPairedV2MinusV1WinCount,
    {lower:43,upper:44});
  rows[0].finished=false;rows[0].status='ACTION_CAP';
  result=compare(rows);
  assert.deepEqual(result.groups[0].possibleV2MinusV1,
    {lower:-1,upper:1});
  rows[1].originalSourceOpening='different-source';
  result=compare(rows);
  assert.equal(result.summary.sourceAndStarterMatched,43);
  assert.deepEqual(result.groups[0].possibleV2MinusV1,
    {lower:null,upper:null});
  assert.deepEqual(result.summary.sharpPairedV2MinusV1WinCount,
    {lower:43,upper:43});
});
