'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {evaluate,choose}=require('../../simulation/evaluation/2026-11/agent39-early-maxgeist-opening-exact.cjs');
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<0.00002,
  String(actual)+' != '+String(expected));

test('exact binomial arithmetic and profile-size rejection',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(51,6),18009460n);
  assert.equal(choose(6,7),0n);
  assert.throws(()=>evaluate({v:4,startingBasics:3}),/invalid/);
  assert.throws(()=>evaluate({forestSealStone:40}),/invalid/);
});

test('actual fixed Hood 60 first-seven, turn-two direct, searched-Dimension access',()=>{
  const r=evaluate();
  near(r.percentages.validOpeningSeven,86.140931912872);
  near(r.percentages.directDimension,0.929541661668);
  near(r.percentages.dimensionOrForestT2,1.679826751781);
  near(r.percentages.dimensionOrForestT1,1.587353707780);
  assert.ok(r.percentages.dimensionOrForestT2>
    r.percentages.dimensionOrForestT1);
  assert.ok(r.percentages.dimensionOrForestT1>
    r.percentages.directDimension);
  // Exact 14-Basic probability: 1 - C(46,7)/C(60,7).
  const analytic=100*(1-Number(choose(46,7))/Number(choose(60,7)));
  near(r.percentages.validOpeningSeven,analytic);
});

test('one-slot exact sensitivity: V count, Dimension, FSS, Energy',()=>{
  const baseline=evaluate();
  const v3=evaluate({v:3}),d2=evaluate({dimensionValley:2});
  const f2=evaluate({forestSealStone:2}),e12=evaluate({psychic:12});
  near(v3.percentages.directDimension,0.719681697122);
  near(d2.percentages.directDimension,1.779864763796);
  near(d2.percentages.dimensionOrForestT2,2.547030970328);
  near(f2.percentages.dimensionOrForestT2,2.364796579041);
  near(e12.percentages.directDimension,1.055361048139);
  assert.deepEqual(f2.directDimension,baseline.directDimension);
  assert.ok(d2.percentages.dimensionOrForestT2>
    baseline.percentages.dimensionOrForestT2);
});

test('no Dimension target or no VMAX gives zero success even with FSS',()=>{
  for(const input of [{dimensionValley:0},{vmax:0}]){
    const r=evaluate(input);
    assert.equal(r.directDimension.numerator,'0');
    assert.equal(r.dimensionOrForestT2.numerator,'0');
    assert.equal(r.dimensionOrForestT1.numerator,'0');
  }
});
