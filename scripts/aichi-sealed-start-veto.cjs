'use strict';

const {createHash} = require('node:crypto');
const {accrueActualStarts} = require('./aichi-outcome-blind-start-accrual.cjs');
const {vetoDesign, assessHardMatchupVeto} = require('./aichi-hard-matchup-veto.cjs');

const SHA256 = /^[a-f0-9]{64}$/;

/**
 * Link a frozen, chronological, setup-only actual-start stream to a
 * confirmatory hard-matchup veto. The seal must be committed after setup and
 * before *any* game outcomes are observed. This module cannot certify timing,
 * engine honesty, representativeness or independence.
 *
 * @param {object} registration Frozen attempt/rank/physical-seat/deck/policy identity.
 * @param {object[]} setupObservations Setup-only first-turn records.
 * @returns {object} Result for a separately committed pre-outcome seal.
 */
function createAccrualSeal(registration, setupObservations) {
  if (!registration || !['A', 'B'].includes(registration.candidateEngineSlot) ||
      !Array.isArray(setupObservations)) {
    throw new Error('Frozen candidate physical slot and setup-only observations required.');
  }
  const design = vetoDesign(registration.attemptIndex, registration.kind);
  const quotas = registration.kind === 'rank'
    ? {first: design.firstGames, second: design.secondGames}
    : registration.startingSeat === 'first'
      ? {first: design.games, second: 0}
      : registration.startingSeat === 'second'
        ? {first: 0, second: design.games}
        : null;
  if (!quotas) {
    throw new Error('Seat-specific veto needs a frozen actual-start target.');
  }
  const accrued = accrueActualStarts({
    candidateEngineSlot: registration.candidateEngineSlot,
    quotas,
    attempts: registration.attempts
  }, setupObservations);
  if (!accrued.complete || accrued.blocked) {
    throw new Error('Setup-only actual-start accrual is incomplete or blocked.');
  }
  const setupById = new Map();
  for (const row of setupObservations) {
    if (!row || !SHA256.test(row.initialDealSha256 || '')) {
      throw new Error('Every setup attempt needs an authenticated initial-deal fingerprint.');
    }
    setupById.set(row.gameId, row.initialDealSha256);
  }
  const plannedTrials = accrued.selectedPlannedTrials.map(row => ({
    gameId: row.gameId,
    seed: row.seed,
    startingSeat: row.startingSeat,
    initialDealSha256: setupById.get(row.gameId)
  }));
  const sealData = {
    schema: 'aichi-start-accrual-seal-v1',
    attemptIndex: registration.attemptIndex,
    rank: registration.rank,
    kind: registration.kind,
    targetStartingSeat: registration.kind === 'seat' ? registration.startingSeat : null,
    candidateEngineSlot: registration.candidateEngineSlot,
    frozen: registration.frozen,
    attempts: registration.attempts,
    quotas,
    setup: setupObservations.map(row => ({
      gameId: row.gameId,
      seed: row.seed,
      firstTurnSlot: row.firstTurnSlot,
      verifiedByDrawLog: row.verifiedByDrawLog,
      firstTurnPlayerId: row.firstTurnPlayerId,
      firstTurnPlayerName: row.firstTurnPlayerName,
      firstDrawLogName: row.firstDrawLogName,
      initialDealSha256: row.initialDealSha256
    })),
    plannedTrials
  };
  return {
    schema: sealData.schema,
    sealSha256: createHash('sha256').update(JSON.stringify(sealData)).digest('hex'),
    plannedTrials,
    retainedAttempts: accrued.retainedAttempts,
    qualifiedForCompetitiveInference: false
  };
}

/**
 * @param {object} registration Unchanged pre-setup registration.
 * @param {object[]} setupObservations Complete observed setup-only prefix.
 * @param {object} sealed Saved, externally timestamped pre-outcome seal.
 * @param {object[]} games Subsequently played independent full-game records.
 * @returns {object} Conditional statistical screen and sampling audit.
 */
function assessSealedAccrualVeto(registration, setupObservations, sealed, games) {
  const expected = createAccrualSeal(registration, setupObservations);
  if (!sealed || !SHA256.test(sealed.sealSha256 || '') ||
      sealed.sealSha256 !== expected.sealSha256 ||
      JSON.stringify(sealed.plannedTrials) !== JSON.stringify(expected.plannedTrials) ||
      !Array.isArray(games)) {
    throw new Error('Pre-outcome accrual seal or exact chosen trial plan changed.');
  }
  const dealById = new Map(expected.plannedTrials.map(row => [
    row.gameId, row.initialDealSha256
  ]));
  for (const game of games) {
    if (!game || game.candidateEngineSlot !== registration.candidateEngineSlot ||
        !dealById.has(game.gameId) ||
        game.initialDealSha256 !== dealById.get(game.gameId)) {
      throw new Error('Full game disagrees with the frozen physical seat or setup deal.');
    }
  }
  const result = assessHardMatchupVeto({
    attemptIndex: registration.attemptIndex,
    rank: registration.rank,
    kind: registration.kind,
    startingSeat: registration.startingSeat,
    frozen: registration.frozen,
    plannedTrials: expected.plannedTrials.map(({gameId, seed, startingSeat}) => ({
      gameId, seed, startingSeat
    }))
  }, games);
  return {
    ...result,
    schema: 'aichi-sealed-accrual-veto-v1',
    setupAttemptCount: expected.retainedAttempts.length,
    overflowSetupAttempts: expected.retainedAttempts.filter(row => !row.selected).length,
    accruedPlanSha256: expected.sealSha256,
    physicallyFixedCandidateSlot: registration.candidateEngineSlot,
    qualifiedForCompetitiveInference: false,
    caveat: result.caveat + ' A matching checksum is only an integrity check; independent verification must establish that the entire setup-only manifest and seal were committed before any full-game outcomes and that each initial-deal fingerprint came from the correct pinned engine.'
  };
}

module.exports = {createAccrualSeal, assessSealedAccrualVeto};
