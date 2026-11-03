'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const source=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const {choose}=require('../simulation/evaluation/agent5-adp-thorton-prize-availability.cjs');
const {gcd,evaluate:base}=
  require('../simulation/evaluation/agent32-adp-first-gx-physical-window.cjs');
const {VERSION,evaluate}=
  require('../simulation/evaluation/agent32-adp-switch-first-gx-physical-window.cjs');

test('authentic printed sixty partitions all eight new physical categories',()=>{
  const x=evaluate();
  assert.equal(x.version,VERSION);
  assert.deepEqual(Object.values(x.categories),[2,5,2,4,3,3,4,37]);
  assert.equal(x.denominator,'250397245379590400');
  assert.equal(x.canonicalCardsSha256,source.canonicalCardsSha256);
  assert.equal(x.qualifiedGames,0);
});

test('four disjoint additional branches and original-starter union are exact',()=>{
  const x=evaluate();
  assert.equal(x.adpInEighthAndDDEHeld.numerator,'10081793');
  assert.equal(x.adpInEighthAndDDEHeld.denominator,'6149691760');
  assert.equal(x.adpInEighthGuzmaHalaSearch.numerator,'86045810973');
  assert.equal(x.adpInEighthGuzmaHalaSearch.denominator,'47567865763600');
  assert.equal(x.adpDeckSearchableDDEHeld.numerator,'159852997521');
  assert.equal(x.adpDeckSearchableDDEHeld.denominator,'5436327515840');
  assert.equal(x.adpDeckSearchableGuzmaHalaSearch.numerator,'5229744607046073');
  assert.equal(x.adpDeckSearchableGuzmaHalaSearch.denominator,'125198622689795200');
  assert.equal(x.eitherADPStarterOrSwitch.numerator,'45642536338009879');
  assert.equal(x.eitherADPStarterOrSwitch.denominator,'125198622689795200');
  assert.ok(Math.abs(x.switchAdditional.percent-7.462447987156273)<1e-11);
  assert.ok(Math.abs(x.eitherADPStarterOrSwitch.percent-36.45610099968788)<1e-11);
  assert.ok(x.eitherADPStarterOrSwitch.fraction>x.originalADPStarter.fraction);
});

test('independent inclusion-exclusion for ADP exactly eighth, held Switch and DDE',()=>{
  // Without ADP in seven, the eighth has two ADP physical possibilities.
  // The seven have >=1 other Basic, >=1 Switch and >=1 DDE.
  const ways=choose(58,7)-choose(53,7)-choose(56,7)-choose(54,7)+
    choose(51,7)+choose(49,7)+choose(52,7)-choose(47,7);
  const numerator=2n*ways;
  const denominator=53n*(choose(60,7)-choose(53,7));
  const g=gcd(numerator,denominator);
  const x=evaluate().adpInEighthAndDDEHeld;
  assert.equal((numerator/g).toString(),x.numerator);
  assert.equal((denominator/g).toString(),x.denominator);
});

test('no Switch removes all additional paths without affecting ADP-starter',()=>{
  const rows=source.cards.map(c=>({...c}));
  rows.find(c=>c.id==='sv1-194').count=0;
  rows.find(c=>c.id==='sm2-125').count++;
  rows.find(c=>c.id==='sv1-186').count++;
  const x=evaluate(rows);
  assert.equal(x.switchAdditional.numerator,'0');
  assert.equal(x.eitherADPStarterOrSwitch.fraction,base(rows).combined.fraction);
});

test('removing Quick Ball reduces the Switch extension while retaining Tag',()=>{
  const rows=source.cards.map(c=>({...c}));
  rows.find(c=>c.id==='swsh1-179').count=0;
  rows.find(c=>c.id==='sm2-125').count++;
  rows.find(c=>c.id==='sv1-186').count++;
  rows.find(c=>c.id==='xy4-109').count++;
  const x=evaluate(rows), original=evaluate();
  assert.ok(x.switchAdditional.fraction<original.switchAdditional.fraction);
  assert.ok(x.switchAdditional.fraction>0);
  assert.equal(x.originalADPStarter.fraction,original.originalADPStarter.fraction);
});

test('removing DDE makes the direct and searched physical attachment event impossible',()=>{
  const rows=source.cards.map(c=>({...c}));
  rows.find(c=>c.id==='xy6-97').count=0;
  for(const id of ['sm2-125','sv1-186','xy4-109','sv1-194'])
    rows.find(c=>c.id===id).count++;
  const x=evaluate(rows);
  assert.equal(x.switchAdditional.numerator,'0');
  assert.equal(x.eitherADPStarterOrSwitch.numerator,'0');
});
