'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/agent41-rank3-owner-colored-opening-v1-20261109.json');
const {VERSION,HISTORICAL_CANARY,makeTrials,physicalStartingActive}=
  require('../../simulation/evaluation/2026-11/agent41-rank3-owner-colored-opening-native.cjs');

test('fresh physical registration retains three unique seeds and both fixed contenders',()=>{
  const trials=makeTrials(registration.groups);
  assert.deepEqual(trials,registration.registeredTrials);
  assert.equal(trials.length,6);
  assert.equal(new Set(trials.map(t=>t.id)).size,6);
  assert.equal(new Set(registration.groups.map(t=>t.seed)).size,3);
  assert.ok(registration.groups.every(t=>t.rank===3));
  assert.equal(registration.rootLimit,160);
  assert.equal(VERSION,'agent41-rank3-one-energy-setup-alternative-native-v1');
});

test('retrospective seed is excluded from the preregistered prospectives',()=>{
  const canary=makeTrials([HISTORICAL_CANARY]);
  assert.equal(HISTORICAL_CANARY.seed,948758444);
  assert.ok(canary.every(c=>c.repeat===213));
  assert.ok(registration.registeredTrials.every(t=>t.repeat!==213));
});

test('physical accepted first selected Basic must physically occupy same acting Active',()=>{
  const originals=[{id:'0:1',originalSeat:0,printing:'Shadow Rider Calyrex V CRE'},
    {id:'0:2',originalSeat:0,printing:'Radiant Eternatus CRZ'}];
  const valid={
    action:'ResolvePromptAction',actionOrdinal:4,seat:0,turnBefore:0,
    beforePrompts:[{type:'ChooseCardsPrompt',
      message:'CHOOSE_STARTING_POKEMONS'}],
    selected:[{physicalId:'0:1'},{physicalId:'0:2'}],
    afterPositions:{'0:1':'s0.active:0','0:2':'s0.bench0:0'}
  };
  const store={originalPhysicalCards:originals,receipts:[valid]};
  assert.deepEqual(physicalStartingActive(store,0),{
    printing:'Shadow Rider Calyrex V CRE',physicalId:'0:1',
    selectedPrintings:['Shadow Rider Calyrex V CRE','Radiant Eternatus CRZ'],
    selectedCount:2,rootOrdinal:4,turnBefore:0,
    confirmedNativeActiveZone:true
  });
  assert.equal(physicalStartingActive(store,1),null);
  assert.equal(physicalStartingActive({...store,receipts:[{
    ...valid,afterPositions:{'0:1':'s0.bench1:0','0:2':'s0.active:0'}
  }]},0),null);
});

test('ambiguous/missing actual Store first-selected card cannot be manufactured',()=>{
  const originals=[{id:'0:1',originalSeat:0,printing:'Shadow Rider Calyrex V CRE'}];
  const base={action:'ResolvePromptAction',actionOrdinal:4,seat:0,
    turnBefore:0,beforePrompts:[{type:'ChooseCardsPrompt',
      message:'CHOOSE_STARTING_POKEMONS'}],
    selected:[{physicalId:'0:1'}],
    afterPositions:{'0:1':'s0.active:0'}};
  assert.equal(physicalStartingActive({
    originalPhysicalCards:originals,receipts:[base,base]
  },0),null);
  assert.equal(physicalStartingActive({
    originalPhysicalCards:originals,receipts:[{...base,selected:[]}]
  },0),null);
  assert.equal(physicalStartingActive(null,0),null);
});
