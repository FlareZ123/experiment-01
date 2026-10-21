'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {census, publishedCensus} =
  require('../scripts/agent7-source-mobility-roster.cjs');

test('all 29 published source 60s contain a named conditional mobility route', () => {
  const data = publishedCensus();
  assert.equal(data.published, 29);
  assert.equal(data.withRoute, 29);
  assert.deepEqual(data.missingRanks, [23, 25, 28]);
  assert.deepEqual(data.copyTotals, {
    'Guzma':48, 'Float Stone':24, 'Escape Rope':11,
    'Prime Catcher':3, 'Jet Energy':5
  });
  const r6 = data.rows.find(row => row.rank === 6);
  const r11 = data.rows.find(row => row.rank === 11);
  assert.equal(r6.copies, 3);
  assert.equal(r6.counts.Guzma, 3);
  assert.equal(r11.copies, 6);
  assert.equal(r11.counts['Float Stone'], 3);
  assert.equal(r11.counts.Guzma, 2);
  assert.equal(r11.counts['Escape Rope'], 1);
});

test('counts exact printed names, excluding other card names and search proxies', () => {
  const row = {
    rank:1,archetype:'toy',cards:[
      {name:'Guzma & Hala',count:4},
      {name:'Guzma',count:1},
      {name:'VS Seeker',count:3},
      {name:'Other',count:52}
    ]
  };
  const x = census([row]);
  assert.equal(x.published, 1);
  assert.equal(x.withRoute, 1);
  assert.equal(x.rows[0].copies, 1);
  assert.equal(x.copyTotals.Guzma, 1);
  assert.equal(x.copyTotals['Float Stone'], 0);
});

test('missing mobility is represented as an unqualified row, not an assumed out', () => {
  const x = census([{
    rank:1,archetype:'toy',
    cards:[{name:'Other',count:60}]
  }]);
  assert.equal(x.published, 1);
  assert.equal(x.withRoute, 0);
  assert.equal(x.rows[0].copies, 0);
});

test('rejects duplicate ranks and incomplete source inventories', () => {
  const one = {rank:1,archetype:'toy',cards:[{name:'Guzma',count:60}]};
  assert.throws(() => census([one, {...one}]), /Duplicate rank/);
  assert.throws(() => census([{...one,cards:[{name:'Guzma',count:59}]}]),
    /not 60 cards/);
});
