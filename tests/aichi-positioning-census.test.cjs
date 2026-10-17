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
console.log('Aichi positioning census checks passed');
