'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditRank26HeldItems} =
  require('../scripts/aichi-rank26-held-item-census.cjs');

/** @param {string} seat @param {string[]} hand @param {string[]} played */
function sample(seat, hand, played) {
  return {
    repeat: 60, seatLetter: seat, sourceActuallyFirst: true,
    opening: {sourceHand: hand},
    control: {actions: [
      ...played.map(card => ({kind: 'PlayCardAction', card})),
      {kind: 'PassTurnAction'}
    ]}
  };
}

test('preserves overlapping held-Item denominators', () => {
  const archive = {cases: [
    sample('A', ['Battle Compressor PHF','Battle VIP Pass FST'], []),
    sample('B', ['Battle Compressor PHF','Quick Ball FST'], ['Quick Ball']),
    {repeat: 61, seatLetter: 'A', sourceActuallyFirst: false}
  ]};
  const result = auditRank26HeldItems(archive);
  assert.equal(result.archivedCases, 3);
  assert.equal(result.actualSourceFirst, 2);
  assert.equal(result.sourceFirstPasses, 2);
  assert.equal(result.compressorOrVip, 2);
  assert.equal(result.compressorAndVip, 1);
  assert.deepEqual(result.items['Battle Compressor'], {
    held: 2, played: 0, passedWithoutPlaying: 2,
    heldCaseIds: ['60:A','60:B']
  });
  assert.equal(result.items['Battle VIP Pass'].held, 1);
  assert.equal(result.items['Quick Ball'].played, 1);
  assert.equal(result.items['Quick Ball'].passedWithoutPlaying, 0);
  assert.deepEqual(result.allSourceFirstCaseIds, ['60:A','60:B']);
});
