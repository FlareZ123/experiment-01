'use strict';

const assert = require('node:assert/strict');
const {ceiling,sourceFrontier,mayBeSightEligible,nominalPrizes} =
  require('../scripts/aichi-raichu-bench-frontier.cjs');

const trio=[
  {name:'Active V',hp:210,prizes:2},
  {name:'Benched VMAX',hp:320,prizes:3},
  {name:'Benched V',hp:210,prizes:2}
];
assert.equal(ceiling(trio,16,true).prizes,5);
assert.equal(ceiling(trio,14,true).prizes,4);
assert.equal(ceiling(trio,16,false).prizes,4);
assert.ok(!mayBeSightEligible('Iron Thorns ex'));
assert.ok(mayBeSightEligible('Shadow Rider Calyrex VMAX'));
assert.equal(nominalPrizes(['VMAX']),3);
assert.equal(nominalPrizes(['Basic','TAG TEAM','GX']),3);
assert.equal(nominalPrizes(['VSTAR']),2);

const report=sourceFrontier();
assert.equal(report.sourceCoverage,29);
assert.deepEqual(report.missingFullLists.sort((a,b)=>a-b),[23,25,28]);
assert.deepEqual(report.sight16Distribution,{'0':4,'2':2,'4':2,'5':2,'6':19});
for(const key of ['base14','sight14','base16']) {
  assert.equal(report.ranks.filter(row=>row[key].prizes>=6).length,0,
    key+' should have no source-inventory six-Prize ceiling');
}
assert.equal(report.ranks.filter(row=>row.sight16.prizes>=6).length,19);
const rank4=report.ranks.find(row=>row.rank===4);
const rank17=report.ranks.find(row=>row.rank===17);
assert.equal(rank4.eligiblePhysicalCards,10);
assert.equal(rank17.eligiblePhysicalCards,4);
assert.equal(rank17.sight16.prizes,5);
assert.ok(rank4.sight16.prizes<=6);
for(const row of report.ranks) {
  assert.ok(row.base14.prizes<=row.base16.prizes);
  assert.ok(row.sight14.prizes<=row.sight16.prizes);
  assert.ok(row.base14.prizes<=row.sight14.prizes);
  assert.ok(row.base16.prizes<=row.sight16.prizes);
  assert.ok(row.sight16.benchTargets.length<=5);
  assert.ok(row.sight16.unitsUsed<=16);
}
console.log(JSON.stringify({
  passed:true,
  printedDecks:report.sourceCoverage,
  sightSixPrizeCeilingRanks:report.ranks.filter(row=>
    row.sight16.prizes>=6).map(row=>row.rank),
  caveat:'Source-print and hypothetical Bench-state upper bounds, not games'
},null,2));
