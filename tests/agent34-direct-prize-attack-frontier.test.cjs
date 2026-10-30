'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {discoverDirectPrizeAttacks,gholdengoCelebrationHandReset}=
  require('../simulation/evaluation/agent34-direct-prize-attack-frontier.cjs');

test('all original supplied sets yield only five unique direct non-KO Prize attack effects',()=>{
  const x=discoverDirectPrizeAttacks();
  assert.equal(x.matchingPrintings,13);
  assert.equal(x.uniqueEffects,5);
  assert.deepEqual(x.identities.map(row=>row.printing).sort(),[
    'Gholdengo','Kartana-GX','Naganadel & Guzzlord-GX',
    'Slowbro','Umbreon ex'
  ].sort());
  assert.equal(x.printings.filter(row=>
    row.printing==='Gholdengo').length,2);
  assert.equal(x.printings.filter(row=>
    row.printing==='Gholdengo').every(row=>
    row.releaseDate==='2026/09/16'),true);
});

test('Prize transfer happens before Gholdengo hand shuffle, resetting to zero',()=>{
  assert.deepEqual(gholdengoCelebrationHandReset(30,6),{
    attackConditionSatisfied:true,
    prizesTaken:2,handJustBeforeShuffle:32,
    handAfter:0,gameResolved:false,
    oneTurnLaterNaturalDraw:1,
    otherNetHandGainForImmediateRepeat:29
  });
  assert.deepEqual(gholdengoCelebrationHandReset(30,2),{
    attackConditionSatisfied:true,prizesTaken:2,
    handJustBeforeShuffle:32,handAfter:0,
    gameResolved:true,oneTurnLaterNaturalDraw:null,
    otherNetHandGainForImmediateRepeat:null
  });
});

test('no reward when hand count not exactly thirty',()=>{
  for(const hand of [0,1,29,31,60]){
    const x=gholdengoCelebrationHandReset(hand,6);
    assert.equal(x.attackConditionSatisfied,false);
    assert.equal(x.prizesTaken,0);
    assert.equal(x.handAfter,hand);
  }
});

test('one remaining Prize is taken, shuffled, and ends game',()=>{
  assert.deepEqual(gholdengoCelebrationHandReset(30,1),{
    attackConditionSatisfied:true,prizesTaken:1,
    handJustBeforeShuffle:31,handAfter:0,
    gameResolved:true,oneTurnLaterNaturalDraw:null,
    otherNetHandGainForImmediateRepeat:null
  });
});

test('source index distinguishes ordinary direct awards from KO-only extras',()=>{
  const x=discoverDirectPrizeAttacks();
  assert.ok(x.identities.some(row=>
    row.printing==='Kartana-GX'&&row.attack==='Blade-GX'));
  assert.ok(x.identities.some(row=>
    row.printing==='Umbreon ex'&&row.attack==='Onyx'));
  assert.ok(x.identities.some(row=>
    row.printing==='Gholdengo'&&row.attack==='Celebration'));
  for(const bannedName of [
    'Pheromosa & Buzzwole-GX','Mega Sableye & Tyranitar-GX',
    'Greedent VMAX','Guzzlord-GX']){
    assert.ok(!x.identities.some(row=>row.printing===bannedName));
  }
});
