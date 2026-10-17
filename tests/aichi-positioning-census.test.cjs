'use strict';
const assert = require('node:assert/strict');
const { census } = require('../scripts/aichi-positioning-census.cjs');
const mk = (rank, name, count) => ({rank, cards:[{name,count},
  {name:'Psychic Energy',count:60-count}]});
const result=census({decks:[mk(1,'Guzma',2),mk(2,'Escape Rope',3)]});
assert.deepEqual(result.ranks,[1,2]);
assert.deepEqual(result.withGuzmaOrRope,[1,2]);
assert.deepEqual(result.withoutGuzma,[2]);
assert.deepEqual(result.guzmaWithoutRopeOrPrime,[1]);
assert.equal(result.cards.Guzma.copies,2);
assert.equal(result.cards['Escape Rope'].copies,3);
assert.throws(()=>census({decks:[mk(1,'Guzma',2),mk(1,'Guzma',2)]}));
assert.throws(()=>census({decks:[{rank:1,cards:[{name:'Guzma',count:2}]}]}));
const fs = require('node:fs');
const path = require('node:path');
const source = JSON.parse(fs.readFileSync(path.join(__dirname,
  '../results/aichi-2026/full-decklists.json'), 'utf8'));
const actual = census(source);
assert.equal(actual.ranks.length,29);
assert.deepEqual(actual.missingRanks,[23,25,28]);
assert.equal(actual.cards.Guzma.ranks.length,25);
assert.equal(actual.cards.Guzma.copies,48);
assert.equal(actual.cards['VS Seeker'].ranks.length,23);
assert.equal(actual.cards['Escape Rope'].ranks.length,7);
assert.equal(actual.withGuzmaOrRope.length,29);
assert.deepEqual(actual.withoutGuzma,[4,17,26,31]);
assert.equal(actual.guzmaWithoutRopeOrPrime.length,19);
assert.deepEqual(actual.withNamedNonGustPositioning,
  [2,3,4,5,7,9,11,15,17,26,31]);
console.log('Aichi positioning census checks passed');
