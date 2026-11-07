'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const {
  binomial,probabilityAtLeastOne,auditRoot93,auditMatchedLillieMiss
}=require('../simulation/evaluation/agent43-v9-root93-energy-screen.cjs');

test('binomial supports exact small combinations and out-of-range k',()=>{
  assert.equal(binomial(44,8),177232627n);
  assert.equal(binomial(10,0),1n);
  assert.equal(binomial(10,11),0n);
});
test('eight-card probabilities and prize-stratification are exact',()=>{
  const expected=[0.5660805445263755,0.4608879492600423,
    0.33403805496828753,2/11,0];
  for(let p=0;p<=4;p++)
    assert.ok(Math.abs(probabilityAtLeastOne(44,4-p,8)-expected[p])<1e-12);
  assert.equal(probabilityAtLeastOne(44,0,8),0);
  assert.equal(probabilityAtLeastOne(44,44,8),1);
});
test('probability calculation fails closed on impossible input',()=>{
  assert.throws(()=>binomial(-1,1));
  assert.throws(()=>probabilityAtLeastOne(44,45,8));
  assert.throws(()=>probabilityAtLeastOne(44,3,45));
});
test('independent small urn exhaustive enumeration',()=>{
  const n=7,draw=3,targets=2;
  let total=0,hit=0;
  for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)for(let c=b+1;c<n;c++){
    total++;
    if([a,b,c].some(i=>i<targets))hit++;
  }
  assert.equal(total,Number(binomial(n,draw)));
  assert.ok(Math.abs(hit/total-probabilityAtLeastOne(n,targets,draw))<1e-12);
});
test('full original archived native audit, when supplied',{
  skip:!process.env.AGENT43_ROOT93_ARCHIVE
},()=>{
  const result=auditRoot93(JSON.parse(fs.readFileSync(
    process.env.AGENT43_ROOT93_ARCHIVE,'utf8')));
  assert.equal(result.competitiveGamesQualified,0);
  assert.equal(result.afterHypotheticalLillieShuffle,44);
  assert.ok(Math.abs(result.hypotheticalExchangeableMarginal-
    0.5020994316846803)<1e-12);
});

test('actual same-deal Lillie treatment: zero Energy in eight-card refresh',{
  skip:!(process.env.AGENT43_ROOT93_ARCHIVE&&
    process.env.AGENT43_ROOT93_TREATMENT_ARCHIVE)
},()=>{
  const base=JSON.parse(fs.readFileSync(process.env.AGENT43_ROOT93_ARCHIVE,'utf8'));
  const treated=JSON.parse(fs.readFileSync(
    process.env.AGENT43_ROOT93_TREATMENT_ARCHIVE,'utf8'));
  const result=auditMatchedLillieMiss(base,treated);
  assert.equal(result.preInterventionRootsIdentical,93);
  assert.equal(result.inferredEnergyHitInEightCardDraw,0);
  assert.equal(result.competitivelyQualifiedGames,0);
});
