'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {lightningUnits} = require('../scripts/aichi-raichu-energy-capacity.cjs');
const {manualPlusBombFrontier, publishedRaichuFrontiers} =
  require('../scripts/aichi-raichu-manual-attachment.cjs');

const energies = ['Reversal Energy', 'Counter Energy', 'Unit Energy LPM']
  .map(name => ({name, count: 4}));
const behind = {ownPrizes: 6, opponentPrizes: 4, temple: false};
const tied = {ownPrizes: 6, opponentPrizes: 6, temple: false};
const temple = {ownPrizes: 6, opponentPrizes: 4, temple: true};

/**
 * Independent physical-card oracle: select one manual card and any five
 * different cards for the bomb, from all twelve printed source copies.
 * @param {{name:string,count:number}[]} inventory
 * @param {{ownPrizes:number,opponentPrizes:number,temple:boolean}} state
 * @returns {number}
 */
function exhaustiveManualAndBomb(inventory, state) {
  const copies = inventory.flatMap(c => Array.from({length:c.count}, () => c.name));
  let maximum = 0;
  for (let manual = 0; manual < copies.length; manual++) {
    const others = copies.filter((_, index) => index !== manual);
    function visit(start, remaining, total) {
      if (remaining === 0) {
        maximum = Math.max(maximum, total + lightningUnits(copies[manual], state));
        return;
      }
      for (let index = start; index <= others.length - remaining; index++) {
        visit(index + 1, remaining - 1,
          total + lightningUnits(others[index], state));
      }
    }
    visit(0, Math.min(5, others.length), 0);
  }
  return maximum;
}

test('single Bomb 14 differs from six-card hand-plus-Bomb 16', () => {
  const result = manualPlusBombFrontier(energies, behind);
  assert.equal(result.bombOnly, 14);
  assert.equal(result.manualPlusBomb, 16);
  assert.equal(result.bomb.length, 5);
  const counts = [result.manual, ...result.bomb].reduce((totals, name) => {
    totals[name] = (totals[name] || 0) + 1;
    return totals;
  }, {});
  assert.equal(counts['Reversal Energy'], 4);
  assert.equal(counts['Counter Energy'], 2);
  assert.equal(exhaustiveManualAndBomb(energies, behind), 16);
});

test('Prize deficit and Temple are essential for these source energies', () => {
  for (const [state, expected] of [[tied, 4], [temple, 0]]) {
    assert.equal(manualPlusBombFrontier(energies, state).manualPlusBomb, expected);
    assert.equal(exhaustiveManualAndBomb(energies, state), expected);
  }
  assert.deepEqual(manualPlusBombFrontier([], behind), {
    bombOnly: 0, manualPlusBomb: 0, manual: null, bomb: []
  });
});

test('source ranks 4 and 17 retain the 12-energy printed inventory', () => {
  const rows = publishedRaichuFrontiers();
  assert.deepEqual(rows.map(r => r.rank), [4, 17]);
  for (const row of rows) {
    assert.equal(row.bombOnly, 14);
    assert.equal(row.manualPlusBomb, 16);
    assert.deepEqual(row.mixedBenchBombOnly,
      {prizes: 3, packetsUsed: 10, targetIds: ['Shadow Rider VMAX']});
    assert.deepEqual(row.mixedBenchManualPlusBomb,
      {prizes: 5, packetsUsed: 16,
        targetIds: ['Shadow Rider VMAX', 'Shadow Rider V']});
  }
});
