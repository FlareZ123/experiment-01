'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {run,choose,validSeven,directPrintingAccess}=
  require('../scripts/agent6-rank30-mulligan-fieldblower.cjs');

/** @param {number} got @param {number} want */
function near(got,want){
  assert.ok(Math.abs(got-want)<1e-12,
    'Expected '+want+', received '+got);
}

test('exact integer binomial counts and impossible selections',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(60,8),2558620845n);
  assert.equal(choose(58,6),40475358n);
  assert.equal(choose(55,6),28989675n);
  assert.equal(choose(52,6),20358520n);
  assert.equal(choose(6,7),0n);
  assert.equal(choose(6,-1),0n);
});

test('all three authenticated Iron Thorns sources have 4 Basics and 1 Jammer',()=>{
  const result=run();
  assert.equal(result.rank30.basicCount,16);
  assert.equal(result.rank30.fieldBlowerCount,3);
  assert.equal(result.rank30.floatStoneCount,1);
  assert.equal(result.rank30.latiasCount,1);
  assert.equal(result.rank30.clefairyCount,3);
  assert.deepEqual(result.thorns,[
    {rank:6,basics:4,jammer:1},
    {rank:24,basics:4,jammer:1},
    {rank:29,basics:4,jammer:1}
  ]);
});

test('both-decks mulligan recurrence handles simultaneous Basic failures',()=>{
  const p=run().probabilities;
  near(validSeven(16),0.9007771067385328);
  near(validSeven(4),0.3994996257446656);
  near(p.rank30LegalInitialSeven,0.9007771067385328);
  near(p.thornsLegalInitialSeven,0.3994996257446656);
  near(p.firstNonDoubleMulliganRank30ValidThornsInvalid,
    0.5751886778941149);
  near(p.firstNonDoubleMulliganThornsValidRank30Invalid,
    0.042151008469575);
  near(p.firstNonDoubleMulliganBothValid,0.38266031363631015);
  near(p.expectedRank30BonusCards,1.4397727577891108);
});

test('exact direct Field Blower first action and optional full compensation',()=>{
  const r=run(),p=r.probabilities;
  near(directPrintingAccess(16,3,0),0.34400639366988034);
  near(p.rank30FieldBlowerFirstActionNoBonus,0.34400639366988034);
  near(p.rank30FieldBlowerFirstActionAllBonusLowerBound,
    0.3953803376636941);
  near(p.bonusTailProbabilityBound,3.7275314769655056e-11);
  assert.ok(p.rank30FieldBlowerFirstActionAllBonusUpperBound>
    p.rank30FieldBlowerFirstActionAllBonusLowerBound);
  assert.ok(p.rank30FieldBlowerFirstActionAllBonusLowerBound>
    p.rank30FieldBlowerFirstActionNoBonus);
  near(r.bonusDistributionPrefix[0].probability,
    0.4248113221058851);
  near(r.bonusDistributionPrefix[1].probability,
    0.2297876615512679);
});

test('narrow joint direct-eight coholding is separate from playable game rate',()=>{
  const p=run().probabilities;
  near(p.rank30LatiasFloatStoneClefairyFieldBlowerDirectEight,
    0.001238542841552451);
  near(p.thornsToolJammerDirectEight,0.12104358092500385);
  near(p.independentDirectEightCoincidence,
    0.00014991766067053833);
  assert.equal(run().competitivenessQualified,false);
});

test('additional draws never make direct Field Blower accessibility decrease',()=>{
  let previous=0;
  for(let bonus=0;bonus<=46;bonus++){
    const chance=directPrintingAccess(16,3,bonus);
    assert.ok(chance>=previous&&chance<=1);
    previous=chance;
  }
  assert.throws(()=>directPrintingAccess(16,3,47));
});
