'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const {exactOpening,study} = require('../scripts/agent25-dhelmise-ball-discard-opening.cjs');

test('fixed v2 unrestricted: exact historical strict kernel is preserved',()=>{
  const row=exactOpening(8);
  assert.equal(row.denominator,'416717869162795200');
  assert.equal(row.strictWorlds,'57968036494606112');
  assert.equal(row.expandedWorlds,'67013277866565072');
  assert.equal(row.additionallyReachableWorlds,'9045241371958960');
  assert.ok(row.addedProbability>0.0217 && row.addedProbability<0.0218);
  assert.equal(row.initialStates,1335);
});

test('partial lock excludes two donor Ability printings without shrinking 60',()=>{
  const row=exactOpening(6);
  assert.deepEqual(row.counts,[4,6,10,4,1,4,7,24]);
  assert.equal(row.strictWorlds,'52975951633859892');
  assert.equal(row.expandedWorlds,'61947808868633892');
  assert.equal(row.additionallyReachableWorlds,'8971857234774000');
  assert.ok(row.expandedProbability<exactOpening(8).expandedProbability);
});

test('physical probabilities and new-only witnesses stay coherent',()=>{
  const both=study();
  for(const row of [both.unrestricted,both.partialLock]){
    assert.equal(BigInt(row.expandedWorlds)-BigInt(row.strictWorlds),
      BigInt(row.additionallyReachableWorlds));
    assert.ok(BigInt(row.newCompressorBallWorlds)>0n);
    assert.ok(BigInt(row.newCompressorBallWorlds)<=
      BigInt(row.additionallyReachableWorlds));
    assert.ok(row.expandedProbability>row.strictProbability);
    assert.ok(row.conditionalBasicValid>row.expandedProbability);
    assert.equal(row.competitiveQualifiedGames,0);
  }
});

test('unsupported donor counts fail loudly',()=>{
  assert.throws(()=>exactOpening(0),assert.AssertionError);
  assert.throws(()=>exactOpening(10),assert.AssertionError);
});

test('committed Supporter prevents Arven tutor route but retains immutable 60',()=>{
  const a=exactOpening(8,{allowArven:false});
  const b=exactOpening(6,{allowArven:false});
  assert.deepEqual(a.counts,[4,8,10,4,1,4,7,22]);
  assert.deepEqual(b.counts,[4,6,10,4,1,4,7,24]);
  assert.equal(a.strictWorlds,'20880447088729536');
  assert.equal(a.expandedWorlds,'32763579418029936');
  assert.equal(b.strictWorlds,'19245064130982096');
  assert.equal(b.expandedWorlds,'29182502882114016');
  assert.ok(a.expandedProbability<exactOpening(8).expandedProbability);
  assert.ok(b.expandedProbability<exactOpening(6).expandedProbability);
  assert.equal(a.expandedProbability,study().unrestrictedNoArven.expandedProbability);
  assert.equal(b.expandedProbability,study().partialLockNoArven.expandedProbability);
});

test('Supporter availability flag validates type',()=>{
  assert.throws(()=>exactOpening(8,{allowArven:1}),assert.AssertionError);
});

test('exact printed fixed 60 manifest remains the subject of both calculations',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/als/agent25-dhelmise-mixed-lock-answers-v2.json'),'utf8'));
  const rows=manifest.cards;
  assert.ok(Array.isArray(rows));
  assert.equal(rows.reduce((n,row)=>n+row.count,0),60);
  assert.equal(new Set(rows.map(row=>row.id)).size,rows.length);
  const counts=new Map(rows.map(row=>[row.id,row.count]));
  const required={
    'me5-39':4,'me5-34':4,'me5-33':2,'me5-6':2,
    'me3-88':4,'sve-5':6,'sv1-166':4,'sv8-164':1,
    'xy4-92':4,'sm6-113':4,'swsh1-179':3
  };
  for(const [id,n] of Object.entries(required))
    assert.equal(counts.get(id),n,`Unexpected printed count for ${id}`);
  const groups=[
    4,8,10,4,1,4,7
  ];
  assert.equal(60-groups.reduce((a,b)=>a+b,0),22);
  const basicIds=['me5-39','me5-33','sv9-56','xy7-30',
    'sv6pt5-38','sv4pt5-37'];
  assert.equal(basicIds.reduce((n,id)=>n+(counts.get(id)??0),0),14);
  for(const e of [8,6]){
    const model=exactOpening(e);
    assert.equal(model.counts[0],counts.get('me5-39'));
    assert.equal(model.counts[2],counts.get('me3-88')+counts.get('sve-5'));
    assert.equal(model.counts[3],counts.get('sv1-166'));
    assert.equal(model.counts[4],counts.get('sv8-164'));
    assert.equal(model.counts[5],counts.get('xy4-92'));
    assert.equal(model.counts[6],
      counts.get('sm6-113')+counts.get('swsh1-179'));
  }
});

test('specified two-for-two swap preserves 60 and lowers early Energy-constrained opportunities',()=>{
  const base=exactOpening(8);
  const scenario={totalDonors:10,energyCount:8,basicCount:16};
  const swap=exactOpening(10,scenario);
  assert.equal(swap.counterfactualTwoEnergyForTwoShuppet,true);
  assert.equal(swap.originalFixedSixty,false);
  assert.deepEqual(swap.counts,[4,10,8,4,1,4,7,22]);
  assert.equal(swap.expandedWorlds,'59945386702448352');
  assert.equal(swap.strictWorlds,'51014292085154816');
  assert.ok(swap.expandedProbability<base.expandedProbability);
  assert.ok(swap.conditionalBasicValid<base.conditionalBasicValid);
  assert.deepEqual(study().hypotheticalTwoBasicEnergyToTwoShuppet.alteredCopies,
    [{id:'sve-5',delta:-2},{id:'me5-33',delta:2}]);
});

test('two extra Psychic Shuppet split Wobbuffet versus Silent Lab lock donor counts',()=>{
  const cfg={totalDonors:10,energyCount:8,basicCount:16};
  const wobb=exactOpening(8,cfg);
  const lab=exactOpening(6,cfg);
  assert.equal(wobb.expandedWorlds,'58538665727465952');
  assert.equal(lab.expandedWorlds,'54140161030934880');
  assert.ok(wobb.expandedProbability>lab.expandedProbability);
  assert.equal(exactOpening(8,{...cfg,allowArven:false}).expandedWorlds,
    '28373604694693216');
  assert.equal(exactOpening(6,{...cfg,allowArven:false}).expandedWorlds,
    '25284336329529024');
  assert.equal(exactOpening(10,{...cfg,allowArven:false}).expandedWorlds,
    '30110631935408864');
});

test('counterfactual hard boundary rejects silent changes to other cards',()=>{
  assert.throws(()=>exactOpening(10),assert.AssertionError);
  assert.throws(()=>exactOpening(8,{energyCount:8}),assert.AssertionError);
  assert.throws(()=>exactOpening(10,{totalDonors:10,energyCount:8,basicCount:14}),
    assert.AssertionError);
});
