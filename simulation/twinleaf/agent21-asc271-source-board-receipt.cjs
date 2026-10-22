'use strict';

const assert = require('node:assert/strict');
const { inspectRyunoGlideDiscard } =
  require('./apex-mega-dragonite-energy-discard.cjs');

/**
 * Validate actual pinned Store copying the Japanese M2a-232 card's exact
 * corresponding English ASC-271 physical print. This is a staged source board,
 * not an original shuffled source game or evidence about match win rates.
 * @returns {object} Comparable native Store receipts.
 */
function run() {
  const regular = inspectRyunoGlideDiscard({ setNumber: '152' });
  const photo = inspectRyunoGlideDiscard({ setNumber: '271' });
  assert.equal(regular.printedSetNumber, '152');
  assert.equal(photo.printedSetNumber, '271');
  assert.equal(regular.exactManagerKeyResolved, true);
  assert.equal(photo.exactManagerKeyResolved, true);
  assert.equal(photo.printedPayload, 'Mega Dragonite ex2 ASC');
  assert.equal(photo.printedAttack.name, 'Ryuno Glide');
  assert.equal(photo.printedAttack.damage, 330);
  assert.equal(photo.oneDdeEffectCompleted, true,
    'Pinned Store must accept one Double Dragon to pay two Energy');
  assert.equal(photo.discardContainsDoubleDragon, true,
    'Pinned Store must move the chosen Double Dragon card to discard');
  return {
    schema: 'agent21-m2a232-asc271-native-apex-ryuno-receipt-v1',
    pinnedSet: 'ASC',
    sourceJapanesePrint: 'M2a 232/193',
    sourceEnglishPrint: 'ASC 271',
    sourceNativeKey: photo.printedPayload,
    regularPrint: regular,
    exactPhotoPrint: photo,
    qualifiedCompetitiveGames: 0,
    limitation: 'Synthetic prepared attack board; no seeded source game, randomized prizes, legal full-turn policy, or end-to-end matchup validation'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}

module.exports = { run };
