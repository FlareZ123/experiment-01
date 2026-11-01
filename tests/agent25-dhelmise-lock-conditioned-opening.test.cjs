'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {study,exactLockedOpening}=
  require('../scripts/agent25-dhelmise-lock-conditioned-opening.cjs');
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-12,
  'Exact normalized combinatorics: '+x+' != '+y);

test('all eight eligible exactly reproduces independent earlier labelled combinatorics',()=>{
  const r=study(),first=r.scenarios[0];
  near(first.unrestricted.unconditional,0.07243542827872268);
  near(first.unrestricted.conditionalBasicValid,0.08408944118690071);
  near(first.wobbuffetActive.unconditional,0.06648246339148948);
  near(first.wobbuffetActive.conditionalBasicValid,0.07717871389960554);
  assert.equal(first.wobbuffetActive.eligibleDonors,6);
  assert.equal(first.silentLabActive.eligibleDonors,6);
  assert.equal(first.garbotoxinActive.favorableWorlds,'0');
});

test('two more Psychic/Grass donors improve locked line sharply while direct line hardly changes',()=>{
  const rows=study().scenarios;
  assert.deepEqual(rows.map(x=>x.unrestricted.totalDonors),[8,10,12]);
  assert.deepEqual(rows.map(x=>x.wobbuffetActive.eligibleDonors),[6,7,8]);
  assert.deepEqual(rows.map(x=>x.hypotheticalOtherCardCuts),[0,2,4]);
  near(rows[1].wobbuffetActive.unconditional,0.07108923911211565);
  near(rows[2].wobbuffetActive.unconditional,0.07243542827872268);
  near(rows[1].unrestricted.unconditional,0.0728199405374246);
  near(rows[2].unrestricted.unconditional,0.0728312274076978);
  assert.ok(rows[1].wobbuffetActive.unconditional>
    rows[0].wobbuffetActive.unconditional);
  assert.ok(rows[2].wobbuffetActive.unconditional>
    rows[1].wobbuffetActive.unconditional);
  assert.equal(study().competitiveQualifiedGames,0);
});

test('blocked Hide n Sneak Ability worlds can never qualify the direct four-donor route',()=>{
  const s=exactLockedOpening({totalDonors:8,eligibleDonors:0,basicCount:14});
  near(s.unconditional,0);
  assert.equal(s.favorableWorlds,'0');
  assert.throws(()=>exactLockedOpening({totalDonors:8,eligibleDonors:9,
    basicCount:14}));
});
