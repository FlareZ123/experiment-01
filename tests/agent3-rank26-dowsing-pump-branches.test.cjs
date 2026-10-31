'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {witness,openingUnion}=
  require('../scripts/agent3-rank26-dowsing-pump-branches.cjs');

test('two physical Pumps plus Dowsing supply 2+2+1 self-knockouts',()=>{
  const w=witness('two-eggs-two-pumps');
  assert.equal(w.sourcePrintedCopies,60);
  assert.equal(w.physicalDamagePumps,2);
  assert.equal(w.physicalExeggcute,2);
  assert.equal(w.damagePumpUses,3);
  assert.deepEqual(w.timeline.filter(x=>x.action==='Damage Pump')
    .map(x=>x.remainingCandidatePrizes),[4,2,1]);
  assert.equal(w.candidateSelfKnockouts,5);
  assert.equal(w.maximumBench,5);
  assert.equal(w.dowsingHandDiscardCost,2);
});

test('one egg, four Pumps plus Dowsing supply five single-KOs',()=>{
  const w=witness('one-egg-four-pumps');
  assert.equal(w.physicalExeggcute,1);
  assert.equal(w.physicalDamagePumps,4);
  assert.equal(w.damagePumpUses,5);
  assert.equal(w.exeggcutePropagations,5);
  assert.deepEqual(w.timeline.filter(x=>x.action==='Damage Pump')
    .map(x=>x.remainingCandidatePrizes),[5,4,3,2,1]);
  assert.equal(w.maximumBench,4);
  assert.equal(w.nativeStoreAccepted,false);
});

test('disjoint Prize groups and opening exactly reproduce integer counts',()=>{
  const x=openingUnion();
  assert.equal(x.favorableBaselineSixPrizeSets,'16664352');
  assert.equal(x.favorableExclusiveTwoPumpDowsingSets,'973416');
  assert.equal(x.favorableExclusiveOneEggDowsingSets,'2714768');
  assert.equal(x.favorableUnionSixPrizeSets,'20352536');
  assert.equal(x.sixPrizeSetsAfterBunnelbyInHand,'45057474');
  assert.ok(Math.abs(x.baselineBunnelbyAndPrizeEvent-
    0.05331264549495522)<1e-12);
  assert.ok(Math.abs(x.extendedBunnelbyAndPrizeEvent-
    0.0651118949414483)<1e-12);
});

test('invalid branches are never treated as wins',()=>{
  assert.throws(()=>witness('unsupported'),assert.AssertionError);
});
