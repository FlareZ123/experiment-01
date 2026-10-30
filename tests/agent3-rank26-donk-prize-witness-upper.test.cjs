'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {WITNESS_GROUPS,exactPrizeSurvival,rank26WitnessUpper}=
  require('../scripts/agent3-rank26-donk-prize-witness-upper.cjs');
const manifest=require('../results/aichi-2026/full-decklists.json');

test('each staged witness group comes from original physical print 60',()=>{
  const d=manifest.decks.find(x=>x.rank===26);
  const n=name=>d.cards.filter(x=>x.name===name)
    .reduce((sum,c)=>sum+c.count,0);
  for(const g of WITNESS_GROUPS){
    const name=g.name==='Tapu Koko Prism Star'?'Tapu Koko ♢':g.name;
    assert.equal(n(name),g.copies,`Mismatch source ${name}`);
  }
});

test('joint 12-resource-group Prize feasibility exact integer DP',()=>{
  const r=rank26WitnessUpper();
  for(const [key,expected] of Object.entries({
    unprizedAllWitnessGroups:0.3328619087701188,
    unprizedWitnessAndCologne:0.2927865330400013,
    bunnelbyInValidOpeningSeven:0.14414800757090118,
    groupSurvivalGivenBunnelbyInSeven:0.369846565300132,
    firstSevenBunnelbyAndAllOtherRequiredUnprized:0.05331264549495522,
    firstSevenBunnelbyAndCologneUnprized:0.04689399486812002
  })){
    assert.ok(Math.abs(r[key]-expected)<1e-12,`${key}: ${r[key]}`);
  }
  assert.equal(exactPrizeSurvival(60,WITNESS_GROUPS).validPrizes,16664352n);
  assert.equal(exactPrizeSurvival(60,WITNESS_GROUPS).totalPrizes,50063860n);
});

test('strict group requirements and impossible count edge cases',()=>{
  assert.equal(exactPrizeSurvival(60,[]).probability,1);
  assert.equal(exactPrizeSurvival(6,[
    {name:'singleton',copies:1,needed:1}
  ]).probability,0);
  assert.throws(()=>exactPrizeSurvival(5,[]),RangeError);
  assert.throws(()=>exactPrizeSurvival(60,[
    {name:'bad',copies:1,needed:2}
  ]),RangeError);
});
