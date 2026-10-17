'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {runSeat} = require('./telepath-nonhand-solburst-source.cjs');
const {probe} = require('./new-moon-klefki-telepath-action.cjs');
const {installTelepathSourceOriginHook} = require('./telepath-source-origin-hook.cjs');

const compiled = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** Compare the exact staged Store action before, during and after a reversible hook. */
function run() {
  const {Store} = require(path.join(compiled, 'game/store/store'));
  const original = Object.getOwnPropertyDescriptor(Store.prototype, 'reduceEffect');
  assert.ok(original && typeof original.value === 'function');

  const raw = [runSeat(0), runSeat(1)];
  let repaired;
  let positiveFromHand;
  const restore = installTelepathSourceOriginHook();
  try {
    repaired = [runSeat(0, {expectCorrected: true}),
      runSeat(1, {expectCorrected: true})];
    positiveFromHand = [probe(0), probe(1)];
  } finally {
    restore();
  }
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype, 'reduceEffect'),
    original, 'Reversible research hook did not restore pinned Store prototype');

  const rawAfter = [runSeat(0), runSeat(1)];
  for (const [i, row] of repaired.entries()) {
    assert.equal(row.seat, i);
    assert.equal(row.unexpectedTelepathSearch, false);
    assert.equal(row.telepathStillInDeck, false);
    assert.equal(row.telepathOnTargetPhysicalCards, true);
    assert.equal(row.telepathAttached, true);
    assert.equal(raw[i].unexpectedTelepathSearch, true);
    assert.equal(rawAfter[i].unexpectedTelepathSearch, true);
    assert.equal(positiveFromHand[i].after.discardedTelepath, true);
    assert.equal(positiveFromHand[i].after.active, 'Mewtwo & Mew-GX UNM');
  }
  return {
    schema: 'telepath-hand-origin-and-zone-correction-a-b-v1',
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    source: 'Two-seat deliberately staged actual Store actions, opt-in and subsequently restored reducer hook',
    raw, repaired, positiveFromHand, rawAfter,
    mechanicGate: 'bounded-constructed-board-only',
    qualifiedForCompetitiveInference: false
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
module.exports = {run};
