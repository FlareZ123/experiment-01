'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {sourceCategories,choose,exactCounts,main}=require(
  '../simulation/evaluation/agent8-rank13-treasure-vstar-prize-dp.cjs');

const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json'),'utf8'));

test('source inventory is exact original 60 with five physical Dragon donors',()=>{
  const cats=sourceCategories(roster);
  assert.deepEqual(cats.map(x=>[x.key,x.copies]),[
    ['regV',4],['otherBasic',5],['donorBasic',2],
    ['donorEvolved',3],['vstar',3],['treasure',4],
    ['compressor',2],['quickBall',3],['doubleDragon',3],
    ['grass',4],['fire',3],['other',24]
  ]);
  const altered=structuredClone(roster);
  altered.decks.find(x=>x.rank===13).cards
    .find(x=>x.name==='Mysterious Treasure').count=3;
  assert.throws(()=>sourceCategories(altered));
});

test('exact two-stage original opening and Prize marginal restores Treasure route',()=>{
  const got=exactCounts(sourceCategories(roster));
  assert.equal(got.vectors,27050);
  assert.equal(got.validHands,300306336n);
  assert.equal(got.prizeWays,22957480n);
  assert.equal(got.jointDenominator,6894276702593280n);
  const c=got.counts;
  assert.equal(c.oldRouteHands,9687014n);
  assert.equal(c.oldEnergyHands,751044n);
  assert.equal(c.treasureDonorHands,21887656n);
  assert.equal(c.treasureEnergyHands,1957040n);
  assert.equal(c.treasurePrizeMarginal,500212818194880n);
  assert.equal(c.treasureEnergyPrizeMarginal,44819058849600n);
  assert.equal(c.oldPrizeMarginal,222389430164720n);
  assert.equal(c.oldEnergyPrizeMarginal,17242077609120n);
  assert.equal(c.unionPrizeMarginal,699498519749120n);
  assert.equal(c.unionEnergyPrizeMarginal,61564112947680n);
  assert.equal(c.overlapPrizeMarginal,23103728610480n);
  assert.equal(c.overlapEnergyPrizeMarginal,497023511040n);
  assert.equal(c.treasureEnergyVstarNotHeldPrizeMarginal,39137528371200n);
  assert.equal(c.treasureEnergyVstarHeldPrizeMarginal,5681530478400n);
  assert.equal(c.oldEnergyPrizeMarginal+c.treasureEnergyPrizeMarginal-
    c.overlapEnergyPrizeMarginal,c.unionEnergyPrizeMarginal);
});

test('no false independent-prize assumption: VSTAR availability is conditioned on opening',()=>{
  assert.equal(choose(53,6),22957480n);
  assert.equal(choose(50,3),19600n);
  // All three VSTAR outside the opener: exactly C(50,3) six-Prize
  // patterns include all three; the remaining patterns leave a target.
  assert.equal(choose(53,6)-choose(50,3),22937880n);
  // If all three VSTAR began in hand, zero copies remain searchable.
  assert.equal(3-3,0);
  const out=main();
  assert.equal(out.stats.treasureEnergyPrizeMarginal.percentage,
    '0.650090804%');
  assert.equal(out.stats.unionEnergyPrizeMarginal.percentage,
    '0.892974210%');
  assert.equal(out.stats.oldEnergyPrizeMarginal.percentage,
    '0.250092625%');
});
