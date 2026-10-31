'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {registeredCrossrankGroups}=
  require('../scripts/agent4-prospective-crossrank-flare-source.cjs');

test('frozen four exact original source 60s and both native candidate decks',()=>{
  const {frame,prior,groups}=registeredCrossrankGroups();
  assert.deepEqual(frame.sourceRanks,[3,7,24,29]);
  assert.equal(frame.registeredSourceSeedGroups,16);
  assert.equal(frame.totalNativeStoreAttempts,64);
  assert.equal(groups.length,16);
  const names=['champion-reference','new-moon-lockbreaker-v1'];
  for(const group of groups){
    assert.equal(group.length,2);
    assert.equal(group[0].seed,group[1].seed);
    assert.equal(group[0].candidateSlot,group[1].candidateSlot);
    assert.deepEqual(group.map(r=>r.candidateId),names);
    assert.deepEqual(group.map(r=>r.rank),[group[0].rank,group[0].rank]);
    for(const row of group)
      assert.equal(row.id,[row.rank,row.repeat,row.candidateSlot,
        row.candidateId].join(':'));
  }
  assert.equal(new Set(groups.map(rows=>rows[0].seed)).size,16);
  for(const rank of frame.sourceRanks){
    assert.equal(groups.filter(g=>g[0].rank===rank).length,4);
    assert.deepEqual(new Set(groups.filter(g=>g[0].rank===rank)
      .map(g=>g[0].candidateSlot)),new Set(['A','B']));
  }
  assert.equal(frame.firstEligibleMinOpponentActiveEnergy,1);
  assert.equal(frame.enginePin,prior.enginePin);
  assert.equal(frame.qualification.competitiveQualifiedGames,0);
});


test('public source root observes Active and Bench energy separately',()=>{
  const {publicOpponentEnergySupply}=
    require('../simulation/twinleaf/agent4-live-source-flare-vs-plumeria-fork.cjs');
  const input={decisionKind:'owner-root',opponentPublic:{
    active:{printing:'Shadow Rider Calyrex V CRE',
      energies:['Psychic Energy MEE']},
    bench:[{printing:'Mewtwo & Mew-GX UNM',
      energies:['Psychic Energy MEE','Psychic Energy MEE']},
      {printing:'Marshadow UNB',energies:[]},null]}};
  const v=publicOpponentEnergySupply(input);
  assert.equal(v.activeCount,1);
  assert.equal(v.benchEnergyCount,2);
  assert.equal(v.total,3);
  assert.equal(v.bench[0].energies.length,2);
  assert.equal(v.bench[2].printing,null);
});
