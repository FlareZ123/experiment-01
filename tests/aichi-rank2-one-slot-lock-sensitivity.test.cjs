'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {ROLES,SOURCE_COUNTS,lockChainsGivenLegalSeven,
  oneSlotRank2Sensitivity,fromSourceManifest} =
  require('../scripts/aichi-rank2-one-slot-lock-sensitivity.cjs');
const {rank2InitialPrizeLockTopology} =
  require('../scripts/aichi-rank2-vileplume-stoutland-prize-ceiling.cjs');

test('source probability independently agrees with the existing rank2 census',()=>{
  const a=lockChainsGivenLegalSeven(SOURCE_COUNTS.slice())
    .bothLockChainsPhysicallyAvailable;
  const b=rank2InitialPrizeLockTopology(14)
    .jointItemAndSupporterLockChainsAvailableGivenLegalOpening;
  assert.deepEqual(a,b);
  assert.equal(a.numerator,'68469698109287');
  assert.equal(a.denominator,'79557769491200');
});

test('each one-slot alternative retains exactly 60 cards and other Basics',()=>{
  const audit=oneSlotRank2Sensitivity();
  assert.equal(audit.variants.length,6);
  assert.equal(audit.source.printedBasicCount,14);
  assert.equal(audit.source.otherNonBasicCount,39);
  for(const row of audit.variants){
    const i=ROLES.indexOf(row.hypotheticalAddition);
    assert.ok(i>=0);
    assert.equal(row.roleCounts[i],SOURCE_COUNTS[i]+1);
    assert.equal(row.roleCounts.reduce((s,n)=>s+n,0)+
      10+row.otherNonBasicCount,60);
    assert.equal(row.otherNonBasicCount,38);
    assert.equal(row.printedBasicCount,i===0||i===3?15:14);
  }
  assert.equal(audit.competitiveGameClaims,0);
});

test('second Stoutland gives the largest physical Prize benefit',()=>{
  const audit=oneSlotRank2Sensitivity();
  const s=audit.variants.find(row=>row.hypotheticalAddition==='Stoutland BCR');
  assert.equal(s.bothLockChainsPhysicallyAvailable.numerator,'226726444592383');
  assert.equal(s.bothLockChainsPhysicallyAvailable.denominator,'238673308473600');
  assert.ok(s.jointAvailabilityGainPercentagePoints>8.9);
  assert.ok(audit.variants.filter(row=>row!==s)
    .every(row=>row.jointAvailabilityGainPercentagePoints<0.8));
  assert.ok(s.allStoutlandPrized.probability<0.009);
  assert.ok(audit.source.allStoutlandPrized.probability>0.1);
});

test('symmetric roles of the two Stage2 chains agree',()=>{
  const r=oneSlotRank2Sensitivity();
  const at=label=>r.variants.find(x=>x.hypotheticalAddition===label)
    .bothLockChainsPhysicallyAvailable.probability;
  assert.equal(at('Oddish UNB'),at('Lillipup CEC'));
  assert.equal(at('Gloom UNB'),at('Herdier SUM'));
  assert.equal(at('Vileplume AOR'),at('Gloom UNB'));
});

test('model is source-bound and explicitly excludes match outcomes',()=>{
  const r=fromSourceManifest();
  assert.equal(r.sourceRank,2);
  assert.equal(r.sourceRoleCounts['Stoutland BCR'],1);
  assert.equal(r.otherBasicCount,10);
  assert.equal(r.variants.length,6);
  assert.equal(r.countsRecoveryAndRealPolicy,false);
});
