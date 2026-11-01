'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {analyze,minimumBenches}=
  require('../scripts/agent16-rank30-clefairy-bench-breakpoint.cjs');
const card=(set,id)=>require('../resources/cards/en/'+set+'.json')
  .find(x=>x.id===id);

test('rank30 original inventory and New Moon 60 preserve distinct printing counts',()=>{
  const x=analyze();
  assert.equal(x.sourceRank,30);
  assert.equal(x.sourceClefairy,3);
  assert.equal(x.sourceWondrousPatch,4);
  assert.equal(x.sourceTelepathicPsychicEnergy,2);
  assert.equal(x.sourceSkyField,3);
  assert.equal(x.candidateNewMoonMewtwoMew,2);
  assert.equal(x.competitiveQualifiedGames,0);
});

test('full moon printed Psychic weakness creates a six-Bench two-prize-channel threat',()=>{
  const x=analyze();
  assert.deepEqual(x.targetBreakpoints.map(t=>t.totalBenchesForOHKO),
    [6,10,15,6,5]);
  assert.equal(x.publishedRegidragoSources,9);
  assert.equal(x.perfectionCannotCopyClefairyEx,true);
  assert.deepEqual(x.targetBreakpoints.map(t=>t.prizesPerKO),[3,2,3,2,2]);
  assert.equal(x.normalTwoBenchMaximum,10);
  assert.equal(x.skyFieldTwoBenchMaximum,16);
  assert.equal(x.targetBreakpoints[0].hp,270);
  assert.equal(2*x.targetBreakpoints[0].prizesPerKO,6);
  const attacker=card('sv9','sv9-56');
  const mew=card('sm11','sm11-71');
  const vmax=card('swsh6','swsh6-75');
  assert.equal(minimumBenches(attacker,mew,5),null);
  assert.equal(minimumBenches(attacker,mew,6),6);
  assert.equal(minimumBenches(attacker,vmax,10),null);
  assert.equal(minimumBenches(attacker,vmax,16),15);
  const drago=card('swsh12','swsh12-136');
  assert.equal(minimumBenches(attacker,drago,10),null);
  assert.equal(minimumBenches(attacker,drago,10,{fairyZoneActive:true}),6);
  assert.match(mew.abilities.find(x=>x.name==='Perfection').text,
    /Pokémon-GX or Pokémon-EX/);
});
