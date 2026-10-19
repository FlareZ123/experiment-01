'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {rank2InitialPrizeLockTopology,fromSourceManifest}=
  require('../scripts/aichi-rank2-vileplume-stoutland-prize-ceiling.cjs');
const {
  ceilingForBasicCount,lockTopologyPartition,
}=require('../scripts/aichi-rank15-dual-lock-prize-ceiling.cjs');

test('authentic Aichi rank2 60 has distinct locked Stage2 families and 14 Basics',()=>{
  const source=fromSourceManifest();
  assert.equal(source.rank,2);
  assert.equal(source.printedBasicCount,14);
  assert.equal(source.categories.length,4);
  assert.equal(source.qualifiesCompetitiveResults,false);
});

test('rank2 Prize topology four disjoint exact legal-opening fractions',()=>{
  const r=rank2InitialPrizeLockTopology(14);
  assert.deepEqual(r.categories.map(c=>c.givenLegalOpening.numerator),[
    '1836529589813','36344338511823','91683105197','68469698109287',
  ]);
  assert.deepEqual(r.categories.map(c=>c.givenLegalOpening.denominator),[
    '954693233894400','318231077964800','3945013363200',
    '79557769491200',
  ]);
  assert.ok(Math.abs(r.categories.reduce((s,c)=>
    s+c.givenLegalOpening.probability,0)-1)<1e-12);
});

test('same one-stage AOR access as rank15, but distinct Stoutland chain raises joint ceiling',()=>{
  const rank2=rank2InitialPrizeLockTopology(14);
  const rank15=ceilingForBasicCount(14);
  const rank15Topology=lockTopologyPartition(14);
  const p2=rank2.jointItemAndSupporterLockChainsAvailableGivenLegalOpening.probability;
  const p15=rank15.availabilityGivenLegalFirstSeven.probability;
  assert.ok(Math.abs(p2-0.8606286796019404)<1e-12);
  assert.ok(Math.abs(p15-0.5747208081617351)<1e-12);
  assert.ok(Math.abs(p2-p15-0.28590787144020535)<1e-12);
  assert.equal(rank2.itemLockStage2AvailableGivenLegalOpening.probability,
    rank15Topology[1].givenLegalOpening.probability+
    rank15Topology[3].givenLegalOpening.probability+
    rank15Topology[4].givenLegalOpening.probability);
  assert.ok(Math.abs(
    rank2.supporterLockStage2AvailableGivenLegalOpening.probability-
    0.8838689317268741)<1e-12);
});
