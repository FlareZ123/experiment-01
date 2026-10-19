'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {inventory, swaps, centers, analyze, pilotCoverage} =
  require('../scripts/aichi-field-list-coverage.cjs');

const source = JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json'), 'utf8'));
const result = analyze(source);
const rank = n => source.decks.find(deck => deck.rank === n);

assert.equal(result.publishedRanks.length, 29);
assert.deepEqual(result.missingRanks, [23,25,28]);
assert.equal(Object.keys(result.archetypes).length, 5);

// A repeated same-name row must be added, never overwritten.
for (const deck of source.decks) {
  const byName = inventory(deck, 'name');
  const byPrint = inventory(deck, 'print');
  assert.equal([...byName.values()].reduce((a,b)=>a+b,0),60);
  assert.equal([...byPrint.values()].reduce((a,b)=>a+b,0),60);
  assert.equal(swaps(byName,byName),0);
  assert.equal(swaps(byPrint,byPrint),0);
}
assert.equal(inventory(rank(16), 'name').get('Garbodor'), 3);
assert.equal(inventory(rank(22), 'name').get('Trubbish'), 2);

// Prints can be different even when names and counts are close.
assert.equal(swaps(inventory(rank(8),'name'),inventory(rank(22),'name')),7);
assert.equal(swaps(inventory(rank(8),'print'),inventory(rank(22),'print')),11);
assert.equal(swaps(inventory(rank(4),'print'),inventory(rank(17),'print')),21);
assert.equal(swaps(inventory(rank(18),'print'),inventory(rank(32),'print')),21);
assert.equal(swaps(inventory(rank(3),'print'),inventory(rank(7),'print')),34);

// Exact k-center, using all 9 published Regidrago sources.
const drago = result.archetypes.Regidrago.printCenters;
assert.deepEqual(drago[0], {k:1,radius:15,ranks:[10],optimalSets:1});
assert.deepEqual(drago[1], {k:2,radius:12,ranks:[18,21],optimalSets:1});
assert.equal(drago[2].radius,11);
assert.equal(drago[2].optimalSets,9);
assert.equal(drago[3].radius,10);

// Two rank-11/8 Garbodor sources are essential for the smallest
// two-source worst-case print radius among four published lists.
assert.deepEqual(result.archetypes['Absol Garbodor'].printCenters[1],
  {k:2,radius:16,ranks:[8,11],optimalSets:1});
assert.deepEqual(result.archetypes['Iron Thorns'].printCenters[1],
  {k:2,radius:5,ranks:[6,24],optimalSets:2});

// The distance calculation must be invariant under row order/splitting.
const example = {cards:[
  {name:'Psychic Energy',count:56,printing:{set:'B',number:'1'}},
  {name:'Garbodor',count:2,printing:{set:'A',number:'1'}},
  {name:'Garbodor',count:2,printing:{set:'C',number:'7'}}
]};
const reordered = {cards:[
  {name:'Garbodor',count:1,printing:{set:'C',number:'7'}},
  {name:'Garbodor',count:2,printing:{set:'A',number:'1'}},
  {name:'Psychic Energy',count:56,printing:{set:'B',number:'1'}},
  {name:'Garbodor',count:1,printing:{set:'C',number:'7'}}
]};
assert.equal(swaps(inventory(example,'name'),inventory(reordered,'name')),0);
assert.equal(swaps(inventory(example,'print'),inventory(reordered,'print')),0);
const variant = {cards:[
  {name:'Psychic Energy',count:56,printing:{set:'B',number:'1'}},
  {name:'Garbodor',count:4,printing:{set:'A',number:'1'}}
]};
assert.equal(swaps(inventory(example,'name'),inventory(variant,'name')),0);
assert.equal(swaps(inventory(example,'print'),inventory(variant,'print')),2);

const one = [{rank:3,inv:inventory(example,'print')}];
assert.deepEqual(centers(one,1),{radius:0,ranks:[3],optimalSets:1});
assert.throws(()=>centers(one,2));
assert.throws(()=>inventory({cards:[]},'name'));
assert.throws(()=>analyze({decks:[rank(1),rank(1)]}));


// Fixed existing pilot ranks constrain the best next distinct printed list.
const ranked = ranks => ranks.map(n => ({rank:n,inv:inventory(rank(n),'print')}));
assert.deepEqual(centers(ranked([6,24,29]),2,[6]),
  {radius:5,ranks:[6,24],optimalSets:1});
assert.equal(centers(ranked([10,12,13,14,18,20,21,27,32]),2,[10]).radius,14);
assert.deepEqual(centers(ranked([8,11,16,22]),3,[8,11]),
  {radius:11,ranks:[8,11,16],optimalSets:1});
assert.throws(()=>centers(ranked([6,24,29]),2,[10]));


// A ten-rank pilot leaves five entirely distinct published archetypes unseen.
const covered = pilotCoverage(source,[1,2,3,4,5,6,8,10,11,26]);
assert.equal(covered.publishedTotal,29);
assert.equal(covered.publishedMissingFromPilot.length,19);
assert.equal(covered.archetypeTotal,14);
assert.equal(covered.representedArchetypeCount,9);
assert.deepEqual(covered.unrepresentedArchetypes,[
  {archetype:'Absol Electrode',ranks:[9]},
  {archetype:'Lopunny Vileplume',ranks:[15]},
  {archetype:'Raging Bolt',ranks:[19]},
  {archetype:"Lillie's Clefairy",ranks:[30]},
  {archetype:'Dusknoir Chimecho',ranks:[31]}
]);
assert.throws(()=>pilotCoverage(source,[1,23]));

console.log('Aichi field-list diversity tests passed on 29 printed source decks');
