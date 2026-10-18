'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {vetoDesign, assessHardMatchupVeto, RANK_FLOOR, CELL_FLOOR} =
  require('../scripts/aichi-hard-matchup-veto.cjs');

const FROZEN = Object.freeze({
  candidateDeckSha256: 'a'.repeat(64),
  opponentDeckSha256: 'b'.repeat(64),
  candidatePolicyRevision: 'candidate-v1',
  opponentPolicyRevision: 'opponent-v1',
  engineRevision: 'pinned-synthetic',
  rulesetRevision: 'paper-expanded-fixture'
});

/**
 * Synthetic registration and game rows. NEVER evidence of played matches.
 * @param {'rank'|'seat'} kind
 * @param {number} attemptIndex
 * @returns {{registration:object, games:object[]}}
 */
function fixture(kind = 'rank', attemptIndex = 1) {
  const n = vetoDesign(attemptIndex, kind).games;
  const registration = {
    rank: 11, kind, attemptIndex, startingSeat: 'second',
    frozen: {...FROZEN},
    plannedTrials: Array.from({length:n}, (_, i) => ({
      gameId: 'synthetic-' + i,
      seed: 100000 + i,
      startingSeat: kind === 'rank' ? i % 2 ? 'second' : 'first' : 'second'
    }))
  };
  const games = registration.plannedTrials.map(row => {
    const candidateSlot = row.startingSeat === 'first' ? 'A' : 'B';
    return {
      ...row,
      ...FROZEN,
      rank: registration.rank,
      status: 'qualified-completed-game',
      finished: true,
      candidateEngineSlot: candidateSlot,
      winnerIndex: candidateSlot === 'A' ? 1 : 0,
      outcome: 'loss',
      turnEvidence: {
        verifiedByDrawLog: true,
        firstTurnSlot: 0,
        firstTurnPlayerId: 101,
        firstTurnPlayerName: 'research-A',
        firstDrawLogName: 'research-A'
      }
    };
  });
  return {registration, games};
}

test('necessary target floors account for all 32 ranks and two actual starting seats', () => {
  assert.ok(Math.abs(RANK_FLOOR - 0.84) < 1e-12);
  assert.ok(Math.abs(CELL_FLOOR - 0.68) < 1e-12);
  assert.equal(vetoDesign(1, 'rank').games, 6);
  assert.equal(vetoDesign(1, 'seat').games, 8);
  assert.equal(vetoDesign(2, 'rank').games, 6);
  assert.equal(vetoDesign(2, 'seat').games, 9);
  assert.equal(vetoDesign(10, 'rank').games, 8);
  assert.equal(vetoDesign(10, 'seat').games, 12);
});

test('balanced all-nonwin rank batch crosses its pre-budgeted threshold', () => {
  const {registration, games} = fixture();
  const out = assessHardMatchupVeto(registration, games);
  assert.equal(out.games, 6);
  assert.equal(out.wins, 0);
  assert.equal(out.conditionalStatisticalVeto, true);
  assert.ok(Math.abs(out.allNonWinNullProbabilityUpperBound - .16 ** 6) < 1e-12);
  assert.equal(out.evidenceClass, 'structurally-checked-self-reported-qualified-games');
});

test('all-nonwin actual-seat batch crosses its distinct 64-cell threshold', () => {
  const {registration, games} = fixture('seat');
  const out = assessHardMatchupVeto(registration, games);
  assert.equal(out.games, 8);
  assert.equal(out.startingSeat, 'second');
  assert.equal(out.conditionalStatisticalVeto, true);
  assert.ok(Math.abs(out.allNonWinNullProbabilityUpperBound - .32 ** 8) < 1e-12);
});

test('one observed win prevents the all-nonwin veto', () => {
  const {registration, games} = fixture();
  games[0].winnerIndex = 0;
  games[0].outcome = 'win';
  assert.equal(assessHardMatchupVeto(registration, games).conditionalStatisticalVeto, false);
});

test('a draw is a nonwin, without silently becoming an engine loss', () => {
  const {registration, games} = fixture();
  games[0].winnerIndex = 3;
  games[0].outcome = 'draw';
  assert.equal(assessHardMatchupVeto(registration, games).conditionalStatisticalVeto, true);
});

test('incomplete horizon and duplicate game identifiers fail closed', () => {
  const {registration, games} = fixture();
  assert.throws(() => assessHardMatchupVeto(registration, games.slice(1)), /horizon/);
  games[1].gameId = games[0].gameId;
  assert.throws(() => assessHardMatchupVeto(registration, games), /repeated actual game/);
});

test('failed actual-seat draw-log attribution cannot be counted', () => {
  const {registration, games} = fixture();
  games[1].turnEvidence.verifiedByDrawLog = false;
  assert.throws(() => assessHardMatchupVeto(registration, games), /actual starting seat/);
});

test('rank screen refuses 3:3 synthetic slots mistakenly registered as 4:2', () => {
  const {registration, games} = fixture();
  registration.plannedTrials[1].startingSeat = 'first';
  games[1].startingSeat = 'first';
  assert.throws(() => assessHardMatchupVeto(registration, games), /equal actual-first/);
});

test('unregistered score, altered source identity and policy drift fail closed', () => {
  const a = fixture();
  a.games[0].outcome = 'win';
  assert.throws(() => assessHardMatchupVeto(a.registration, a.games), /contradicts/);
  const b = fixture();
  b.games[0].opponentDeckSha256 = 'c'.repeat(64);
  assert.throws(() => assessHardMatchupVeto(b.registration, b.games), /Unqualified/);
  const c = fixture();
  c.games[0].candidatePolicyRevision = 'unfrozen';
  assert.throws(() => assessHardMatchupVeto(c.registration, c.games), /Unqualified/);
});

test('rejects invalid candidate-attempt budget and unauthenticated status', () => {
  assert.throws(() => vetoDesign(0, 'rank'), /positive/);
  assert.throws(() => vetoDesign(1, 'other'), /positive/);
  const {registration, games} = fixture();
  games[0].status = 'completed-engine-game';
  assert.throws(() => assessHardMatchupVeto(registration, games), /Unqualified/);
});
