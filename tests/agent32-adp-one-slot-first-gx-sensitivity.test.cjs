'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const source=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const {
  VERSION,SCENARIOS,hashRows,substitute,main
}=require('../simulation/evaluation/agent32-adp-one-slot-first-gx-sensitivity.cjs');

test('registered frozen v2 identity algorithm really matches complete manifest',()=>{
  assert.equal(hashRows(source.cards),source.canonicalCardsSha256);
  const x=main();
  assert.equal(x.version,VERSION);
  assert.equal(x.baseline.actualScenarioHash,source.canonicalCardsSha256);
  assert.equal(x.baseline.basicCopies,7);
  assert.equal(x.baseline.sourceDeckCount,29);
  assert.equal(x.qualifiedGames,0);
  assert.ok(Math.abs(x.baseline.firstGXWithSwitchPathPct-
    36.45610099968788)<1e-10);
});

test('all hypothetical rows remain exactly 60 and no card reaches five',()=>{
  for(const s of SCENARIOS){
    const {cards,hash}=substitute(s);
    assert.equal(cards.reduce((n,c)=>n+c.count,0),60);
    assert.ok(cards.every(c=>c.count>=0&&c.count<=4));
    assert.equal(hash.length,64);
    if(s.add)assert.notEqual(hash,source.canonicalCardsSha256);
  }
  assert.equal(SCENARIOS.length,12);
});

test('third ADP increases the narrow physical first-GX event under each donor',()=>{
  const x=main();
  const base=x.baseline.firstGXWithSwitchPathPct;
  for(const s of x.variants.filter(v=>v.substitution.addedCardId==='sm12-156')){
    assert.ok(s.firstGXWithSwitchPathPct>base);
    assert.ok(s.deltaFirstGXAccessPercentagePoints>0);
  }
  const useNonbasic=x.variants.find(v=>v.scenario==='Third ADP in place of VS Seeker');
  const useCrobat=x.variants.find(v=>v.scenario==='Third ADP in place of Crobat V');
  assert.equal(useNonbasic.basicCopies,8);
  assert.equal(useCrobat.basicCopies,7);
  assert.ok(useNonbasic.netSourceBonusOffers<useCrobat.netSourceBonusOffers);
});

test('added Switch affects only switch-recovery routes in this first-eight model',()=>{
  const x=main();
  const plus=x.variants.find(v=>v.scenario==='Third Switch in place of VS Seeker');
  assert.ok(plus.firstGXWithSwitchPathPct>x.baseline.firstGXWithSwitchPathPct);
  assert.equal(plus.firstGXDirectOrGHPathPct,x.baseline.firstGXDirectOrGHPathPct);
  assert.equal(plus.basicCopies,7);
  assert.equal(plus.netSourceBonusOffers,x.baseline.netSourceBonusOffers);
});

test('added G&H or Quick Ball opens additional search routes',()=>{
  const x=main();
  const gh=x.variants.find(v=>v.scenario==='Fourth Guzma & Hala in place of VS Seeker');
  const quick=x.variants.find(v=>v.scenario==='Fourth Quick Ball in place of VS Seeker');
  assert.ok(gh.firstGXWithSwitchPathPct>x.baseline.firstGXWithSwitchPathPct);
  assert.ok(quick.firstGXWithSwitchPathPct>x.baseline.firstGXWithSwitchPathPct);
  assert.equal(quick.firstGXDirectOrGHPathPct,x.baseline.firstGXDirectOrGHPathPct);
  assert.equal(gh.basicCopies,7);
  assert.equal(quick.basicCopies,7);
});

test('more Basics improve the candidate mulligan offer channel in this physical setup',()=>{
  const x=main();
  const donors=x.variants.filter(v=>v.basicCopies===8);
  assert.ok(donors.length>=4);
  for(const v of donors)
    assert.ok(v.netSourceBonusOffers<x.baseline.netSourceBonusOffers);
  const less=x.variants.find(v=>v.scenario==='Cut one ADP for second VS Seeker');
  assert.equal(less.basicCopies,6);
  assert.ok(less.netSourceBonusOffers>x.baseline.netSourceBonusOffers);
});

test('every trial is a physical sensitivity, not a selected winning deck',()=>{
  const x=main();
  assert.equal(x.variants.length,SCENARIOS.length);
  assert.ok(x.variants.every(v=>v.sourceDeckCount===29));
  assert.match(x.limitations,/Hypothetical one-copy/);
});
