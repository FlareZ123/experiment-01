'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { choose, directGarbotoxinWindow, audit } = require('../scripts/aichi-absol-garbotoxin-window.cjs');

test('exact source rank and core window regression', () => {
  assert.equal(choose(60, 7), 386206920n);
  for (const [basics, garbodor, floatStone, n, d] of [
    [10, 2, 4, '846612889', '24659527035'],
    [11, 2, 3, '1797032483', '68970355168'],
    [11, 3, 4, '1612086217', '34485177584'],
    [12, 2, 4, '95123676', '2991196351']
  ]) {
    const x = directGarbotoxinWindow({ basics, trubbish: 2, garbodor, floatStone });
    assert.equal(x.numerator, n);
    assert.equal(x.denominator, d);
  }
  const source = JSON.parse(fs.readFileSync(path.join(__dirname, '../results/aichi-2026/full-decklists.json'), 'utf8'));
  const rows = audit(source).ranks;
  assert.deepEqual(rows.map(x => x.rank), [8,11,16,22]);
  assert.deepEqual(rows.map(x => x.basics), [10,11,11,12]);
  assert.deepEqual(rows.map(x => x.megaAbsol), [2,3,2,2]);
  assert.deepEqual(rows.map(x => x.budew), [1,0,2,1]);
  assert.deepEqual(rows.map(x => x.vikavoltV), [0,0,0,2]);
});
test('direct window requires every named ingredient', () => {
  const base = { basics: 10, trubbish: 2, garbodor: 2, floatStone: 4 };
  for (const key of ['trubbish', 'garbodor', 'floatStone']) {
    assert.equal(directGarbotoxinWindow({ ...base, [key]: 0 }).probability, 0);
  }
});
