'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const reg=require('../../results/aichi-2026/registrations/2026-11/agent33-rank7-hood-active-funding-fresh16-20261109.json');
const hood=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');

test('independent 16 registered source groups remain frozen before outcomes',()=>{
  assert.equal(reg.registeredBeforeNativeResultsForTheseSeeds,true);
  assert.equal(reg.totalNativeAttempts,32);
  assert.equal(reg.trials.length,16);
  assert.equal(hood.cards.reduce((sum,card)=>sum+card.count,0),60);
  const all=[...reg.seeds.A,...reg.seeds.B];
  assert.equal(all.length,16);
  assert.equal(new Set(all).size,16);
  assert.ok(all.every(seed=>Number.isSafeInteger(seed)&&seed>=0&&
    seed<2**32));
  assert.ok(!all.includes(1693388692),
    'Previously inspected rank7 B seed must be excluded');
  assert.ok(!all.includes(3617807808),
    'Previously inspected rank7 A seed must be excluded');
  for(const trial of reg.trials){
    assert.equal(trial.rank,7);
    assert.equal(trial.candidateId,'hood-shield-v1');
    assert.equal(trial.id,
      [trial.rank,trial.repeat,trial.candidateSlot,trial.candidateId].join(':'));
    assert.equal(trial.seed,reg.seeds[trial.candidateSlot][trial.repeat]);
  }
});
