'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  sourceRank9,
  runRank9MegaRecipient
} = require('../simulation/twinleaf/rank9-electrode-mega-recipient.cjs');

test('rank9 exact printed 60 contains the Electrode to Mega Absol energy path', () => {
  const source = sourceRank9();
  const rows = source.cards;
  assert.equal(rows.reduce((sum, row) => sum + row.count, 0), 60);
  assert.equal(source.rank, 9);
  assert.equal(source.player, 'Shun Ito');
});

test('pinned Store permits printed Bomb attachment to modern lowercase Mega ex and awards self-KO Prizes', () => {
  const result = runRank9MegaRecipient();
  assert.equal(result.stagedRecipient, 'Mega Absol ex M1L');
  assert.equal(result.publishedPrinting, 'Mega Absol ex MEG 86');
  assert.equal(result.attached.length, 5);
  assert.equal(result.opponentPrizesFromElectrodeSelfKO, 2);
  assert.equal(result.mandatoryPromptAccepted, true);
  assert.equal(result.naturalSourceLineEstablished, false);
  assert.equal(result.qualifiedCompetitiveGames, 0);
  process.stdout.write(JSON.stringify({
    testedPrintedSourceRank: result.sourceRank,
    recipient: result.stagedRecipient,
    attached: result.attached,
    firstProvidedEnergy: result.energyMap[0],
    opponentPrizeShift: result.opponentPrizesFromElectrodeSelfKO,
    qualification: 'Staged pinned Store only, no opponent policy or win claim'
  }) + '\n');
});
