'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {
  SELECTED_RANKS,fromRepository
}=require('../scripts/aichi-tagcall-five-source-firstdraw.cjs');

const census=()=>fromRepository(path.resolve(__dirname,'..'));
const approx=(a,b)=>assert.ok(Math.abs(a-b)<0.00000002,
  'Percent mismatch: '+a+' vs '+b);

test('all 29 authenticated sixties yield exactly five Tag+G&H users',()=>{
  const x=census();
  assert.equal(x.originalExactSources,29);
  assert.equal(x.qualifiedCompetitiveGames,0);
  assert.equal(x.opportunitiesAreNotWins,true);
  assert.deepEqual(x.rows.map(row=>row.rank),[...SELECTED_RANKS]);
});

test('printed-stage-aware Basic classification for all five sources',()=>{
  const x=census();
  assert.deepEqual(x.rows.map(row=>[
    row.rank,row.basicCount,row.tagCount,row.halaCount,
    row.requiredThunderMountainCount
  ]),[
    [2,14,4,4,0],
    [6,4,2,2,1],
    [15,14,4,3,0],
    [24,4,2,2,1],
    [29,4,2,2,1]
  ]);
});

test('rank2 and rank15 Tag+G&H accessibility distinguishes copy counts',()=>{
  const [a,b]=census().rows.filter(row=>row.rank===2||row.rank===15);
  approx(a.fractions.tagHeld.percent,43.0471635);
  approx(b.fractions.tagHeld.percent,43.0471635);
  approx(a.fractions.tagHeldNoHala.percent,26.02982948);
  approx(b.fractions.tagHeldNoHala.percent,29.63351003);
  approx(a.fractions.tagNoHalaTargetMountain.percent,26.02838725);
  approx(b.fractions.tagNoHalaTargetMountain.percent,29.60669237);
  approx(a.conditionalTargetAndStadiumAccessGivenHeldTagNoHalaPercent,
    99.99445932);
  approx(b.conditionalTargetAndStadiumAccessGivenHeldTagNoHalaPercent,
    99.90950226);
});

test('identical rank6/24/29 physical category counts yield identical priors',()=>{
  const x=census().rows.filter(row=>[6,24,29].includes(row.rank));
  assert.equal(x.length,3);
  for(const r of x){
    approx(r.fractions.tagHeld.percent,22.93036105);
    approx(r.fractions.tagHeldNoHala.percent,18.26681947);
    approx(r.fractions.tagNoHalaTargetMountain.percent,16.19989649);
    approx(r.conditionalTargetAndStadiumAccessGivenHeldTagNoHalaPercent,
      88.68482286);
  }
  assert.deepEqual(x.map(r=>r.physicalDealDenominator),
    [x[0].physicalDealDenominator,x[0].physicalDealDenominator,
      x[0].physicalDealDenominator]);
});

test('every source has a positive legal-card-location subset, with unknown search',()=>{
  const x=census();
  for(const row of x.rows){
    assert.ok(row.fractions.tagNoHalaTargetMountain.percent>0);
    assert.ok(row.fractions.tagNoHalaTargetMountain.percent<=
      row.fractions.tagHeldNoHala.percent);
    assert.ok(row.fractions.tagHeldNoHala.percent<=
      row.fractions.tagHeld.percent);
    assert.ok(row.conditionalTargetAndStadiumAccessGivenHeldTagNoHalaPercent<=100);
    assert.ok(row.conditionalTargetAndStadiumAccessGivenHeldTagNoHalaPercent>0);
  }
});
