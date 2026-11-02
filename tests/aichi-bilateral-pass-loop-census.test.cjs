'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { passOnlySeat, passiveEpisodeCensus, censusArchivedRows } =
  require('../scripts/aichi-bilateral-pass-loop-census.cjs');

/** @param {number} count @param {object} [changes] */
function makeGame(count, changes = {}) {
  const roots = [];
  for (let turn = 1; turn <= count; turn++) {
    const seat = (turn - 1) % 2;
    roots.push({ actionOrdinal: roots.length, turnBefore: turn,
      turnAfter: turn, action: 'ResolvePromptAction',
      pendingPrompt: changes.choiceAt === turn ?
        'ChooseCardsPrompt' : 'WaitPrompt', playerSlot: seat });
    roots.push({ actionOrdinal: roots.length, turnBefore: turn,
      turnAfter: turn, action: changes.attackAt === turn ?
        'AttackAction' : 'PassTurnAction', playerSlot: seat });
    roots.push({ actionOrdinal: roots.length, turnBefore: turn,
      turnAfter: turn + 1, action: 'ResolvePromptAction',
      pendingPrompt: 'WaitPrompt', playerSlot: seat });
  }
  return { trial: { id: '6:2:B:new-moon-lockbreaker-v1', rank: 6,
    candidateId: 'new-moon-lockbreaker-v1' }, sourceSeat: 0,
    candidateSeat: 1, rootActionLedger: roots,
    rootActionCount: roots.length, suddenDeathClockResets: [],
    endReason: 'engine-game-end', finished: true };
}

test('complete alternating passes create one genuine reviewed episode', () => {
  const row = makeGame(18);
  const out = passiveEpisodeCensus(row);
  assert.equal(out.maxConsecutive, 18);
  assert.equal(out.passOnlyTurns, 18);
  assert.equal(out.episodes[0].sourcePassOnlyTurns, 9);
  assert.equal(out.episodes[0].candidatePassOnlyTurns, 9);
  assert.equal(out.requiresPolicyReview, true);
  assert.equal(out.competitiveQualified, false);
});

test('hidden choice prompt or an attack splits the episode', () => {
  assert.equal(passiveEpisodeCensus(makeGame(18, {choiceAt: 9}))
    .maxConsecutive, 9);
  assert.equal(passiveEpisodeCensus(makeGame(18, {attackAt: 9}))
    .maxConsecutive, 9);
  assert.equal(passOnlySeat([{action: 'ResolvePromptAction',
    pendingPrompt: 'ChooseCardsPrompt'}, {action: 'PassTurnAction',
    playerSlot: 0}]), null);
});

test('restarted or incomplete transcripts never pass policy evidence gate', () => {
  const resets = makeGame(18);
  resets.suddenDeathClockResets = [4];
  assert.equal(passiveEpisodeCensus(resets).requiresPolicyReview, false);
  const gaps = makeGame(18);
  gaps.rootActionCount += 1;
  assert.equal(passiveEpisodeCensus(gaps).requiresPolicyReview, false);
  const rewound = makeGame(18);
  rewound.rootActionLedger[14].turnAfter = 1;
  assert.equal(passiveEpisodeCensus(rewound).singleEpoch, false);
});

test('failure-inclusive denominator preserves all trial outcomes', () => {
  const game = makeGame(18);
  const censored = makeGame(3);
  censored.finished = false;
  censored.endReason = 'action-limit';
  const out = censusArchivedRows([game, censored]);
  assert.equal(out.games, 2);
  assert.equal(out.gamesWithFiveOrMore, 1);
  assert.equal(out.gamesRequiringPolicyReview, 1);
  assert.equal(out.totalPassOnlyTurns, 21);
  assert.equal(out.competitiveQualifiedGames, 0);
  assert.throws(() => passiveEpisodeCensus(game, 1), RangeError);
});
