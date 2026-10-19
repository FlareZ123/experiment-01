'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {createAccrualSeal, assessSealedAccrualVeto} =
  require('../scripts/aichi-sealed-start-veto.cjs');

const sha = digit => digit.repeat(64);
const frozen = {
  candidateDeckSha256: sha('a'),
  opponentDeckSha256: sha('b'),
  candidatePolicyRevision: 'candidate-common-v2',
  opponentPolicyRevision: 'rank11-source-v1',
  engineRevision: 'pinned-twinleaf',
  rulesetRevision: 'paper-expanded-v1'
};
const slots = [0, 0, 0, 0, 1, 1];
const attempts = slots.map((_, i) => ({gameId: 'fixed-' + i, seed: 8000 + i}));
const registration = {
  attemptIndex: 1, rank: 11, kind: 'rank', candidateEngineSlot: 'B',
  frozen, attempts
};
function setup(i) {
  const firstTurnSlot = slots[i];
  const name = firstTurnSlot === 0 ? 'research-A' : 'research-B';
  return {
    ...attempts[i], firstTurnSlot, verifiedByDrawLog: true,
    firstTurnPlayerId: firstTurnSlot === 0 ? 101 : 202,
    firstTurnPlayerName: name, firstDrawLogName: name,
    initialDealSha256: (i + 1).toString(16).repeat(64)
  };
}
const setupPrefix = slots.map((_, i) => setup(i));
function gamesFromSeal(sealed) {
  return sealed.plannedTrials.map(row => {
    const observation = setupPrefix.find(o => o.gameId === row.gameId);
    return {
      ...row, rank: 11, status: 'qualified-completed-game', finished: true,
      outcome: 'loss', winnerIndex: 0, candidateEngineSlot: 'B',
      ...frozen,
      turnEvidence: {
        firstTurnSlot: observation.firstTurnSlot, verifiedByDrawLog: true,
        firstTurnPlayerId: observation.firstTurnPlayerId,
        firstTurnPlayerName: observation.firstTurnPlayerName,
        firstDrawLogName: observation.firstDrawLogName
      }
    };
  });
}

test('all six chronological setup attempts yield sealed balanced five-game rank veto', () => {
  const seal = createAccrualSeal(registration, setupPrefix);
  assert.equal(seal.plannedTrials.length, 5);
  assert.deepEqual(seal.plannedTrials.map(row => row.startingSeat),
    ['second', 'second', 'second', 'first', 'first']);
  const result = assessSealedAccrualVeto(
    registration, setupPrefix, seal, gamesFromSeal(seal)
  );
  assert.equal(result.conditionalStatisticalVeto, true);
  assert.equal(result.qualifiedForCompetitiveInference, false);
  assert.equal(result.setupAttemptCount, 6);
  assert.equal(result.overflowSetupAttempts, 1);
  assert.equal(result.physicallyFixedCandidateSlot, 'B');
});

test('requires successful full chronological start accrual, including the exact stopping point', () => {
  assert.throws(() => createAccrualSeal(registration, setupPrefix.slice(0, 4)), /incomplete/);
  const extended = {...registration, attempts: [...attempts, {gameId: 'extra', seed: 9000}]};
  const extra = {...setup(0), gameId: 'extra', seed: 9000};
  assert.throws(() => createAccrualSeal(extended, [...setupPrefix, extra]),
    /after the fixed quota/);
});

test('pre-outcome seal forbids reordered results or modified frozen policy', () => {
  const prefix = setupPrefix;
  const seal = createAccrualSeal(registration, prefix);
  const games = gamesFromSeal(seal);
  const altered = {...registration, frozen: {...frozen, opponentPolicyRevision: 'changed'}};
  assert.throws(() => assessSealedAccrualVeto(
    altered, prefix, seal, games), /seal/);
  assert.throws(() => assessSealedAccrualVeto(
    registration, prefix, {...seal, plannedTrials: seal.plannedTrials.slice().reverse()}, games
  ), /seal/);
});

test('fixes the candidate physical slot through setup and all completed games', () => {
  const prefix = setupPrefix;
  const seal = createAccrualSeal(registration, prefix);
  const games = gamesFromSeal(seal);
  games[0] = {...games[0], candidateEngineSlot: 'A'};
  assert.throws(() => assessSealedAccrualVeto(
    registration, prefix, seal, games), /physical seat/);
});

test('matches initial physical deals, beyond numerical seed and first-player seat', () => {
  const prefix = setupPrefix;
  const seal = createAccrualSeal(registration, prefix);
  const games = gamesFromSeal(seal);
  games[1] = {...games[1], initialDealSha256: sha('f')};
  assert.throws(() => assessSealedAccrualVeto(
    registration, prefix, seal, games), /setup deal/);
});

test('every attempted setup must carry its own initial-deal fingerprint', () => {
  const prefix = setupPrefix.map(row => ({...row}));
  delete prefix[4].initialDealSha256;
  assert.throws(() => createAccrualSeal(registration, prefix), /initial-deal/);
});

test('rank and seat tests derive different design quotas', () => {
  const seatReg = {...registration, kind: 'seat', startingSeat: 'second'};
  const seatSlots = Array.from({length: 8}, (_, i) => ({
    ...attempts[0], gameId: 'seat-' + i, seed: 10000 + i,
    firstTurnSlot: 0, verifiedByDrawLog: true,
    firstTurnPlayerId: 101, firstTurnPlayerName: 'research-A',
    firstDrawLogName: 'research-A', initialDealSha256: sha('c')
  }));
  const seatSeal = createAccrualSeal(
    {...seatReg, attempts: seatSlots.map(({gameId, seed})=>({gameId, seed}))},
    seatSlots
  );
  assert.equal(seatSeal.plannedTrials.length, 8);
  assert.ok(seatSeal.plannedTrials.every(row => row.startingSeat === 'second'));
});

test('extra outcome-bearing setup getters are never accessed by selection or sealing', () => {
  const prefix = setupPrefix.map(row => ({...row}));
  Object.defineProperty(prefix[0], 'outcome', {
    get() { throw new Error('Looked at hidden outcome'); }
  });
  assert.equal(createAccrualSeal(registration, prefix).plannedTrials.length, 5);
});
