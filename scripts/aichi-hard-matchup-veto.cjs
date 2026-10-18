'use strict';

/**
 * Early negative-evidence gate for one frozen 60-card candidate against the
 * symmetric equal-rank/equal-actual-start Aichi Top 32 benchmark.
 *
 * A passing structural check cannot independently authenticate a game.
 * Source printings, replay, paper rules/clock, policy competence, independence,
 * and prospective Git registration remain external prerequisites.
 */
const RANKS = 32;
const SEATS = 2;
const TARGET = 0.995;
const FAMILY_ALPHA = 0.05;
const RANK_FLOOR = RANKS * TARGET - (RANKS - 1);
const CELL_FLOOR = RANKS * SEATS * TARGET - (RANKS * SEATS - 1);
const SHA256 = /^[a-f0-9]{64}$/;

/**
 * Null upper bound on zero wins with prospectively fixed independent games.
 * The target entails p(first)+p(second)>=2*RANK_FLOOR. If nFirst and nSecond
 * games are sampled in their respective actual-start strata, maximize the
 * all-loss likelihood a^nFirst*b^nSecond over nonnegative loss probabilities
 * a+b<=2*(1-RANK_FLOOR). Weighted AM-GM places the worst case at
 * a = totalLoss*nFirst/n and b = totalLoss*nSecond/n.
 *
 * @param {number} nFirst Nonnegative number of candidate-first games.
 * @param {number} nSecond Nonnegative number of candidate-second games.
 * @returns {number} One-sided worst-case probability of all nonwins.
 */
function rankAllNonwinBound(nFirst, nSecond) {
  if (![nFirst,nSecond].every(n => Number.isSafeInteger(n) && n >= 0) ||
      nFirst+nSecond === 0) {
    throw new Error('Nonnegative integer first/second counts with a positive total required.');
  }
  const n = nFirst+nSecond;
  const totalLoss = 2*(1-RANK_FLOOR);
  return Math.pow(totalLoss,n) *
    Math.pow(nFirst/n,nFirst) * Math.pow(nSecond/n,nSecond);
}

/**
 * Spend 5% familywise alpha over indefinitely many candidate attempts.
 * Each attempt allocates half its alpha to 32 rank tests and half to
 * 64 rank-by-actual-start tests. Each specific test is evaluated once,
 * at its prospectively registered, fixed sample size. Rank tests optimize
 * for total games by permitting a prespecified nearly balanced odd horizon.
 *
 * @param {number} attemptIndex Positive global candidate attempt index.
 * @param {'rank'|'seat'} kind
 * @returns {{attemptAlpha:number,perTestAlpha:number,floor:number,games:number,
 *   firstGames:number,secondGames:number,allNonwinNullProbabilityUpperBound:number}}
 */
function vetoDesign(attemptIndex, kind) {
  if (!Number.isSafeInteger(attemptIndex) || attemptIndex < 1 ||
      !['rank', 'seat'].includes(kind)) {
    throw new Error('A positive candidate attempt index and rank/seat kind are required.');
  }
  const attemptAlpha = FAMILY_ALPHA / (attemptIndex * (attemptIndex + 1));
  const perTestAlpha = attemptAlpha / (2 * (kind === 'rank' ? RANKS : RANKS * SEATS));
  const floor = kind === 'rank' ? RANK_FLOOR : CELL_FLOOR;
  let games = kind === 'rank' ? 2 : 1;
  let firstGames = kind === 'rank' ? 1 : 0;
  let secondGames = kind === 'rank' ? 1 : 0;
  let allNonwinNullProbabilityUpperBound = kind === 'rank' ?
    rankAllNonwinBound(firstGames,secondGames) : Math.pow(1-floor,games);
  while (allNonwinNullProbabilityUpperBound > perTestAlpha) {
    games++;
    if (kind === 'rank') {
      firstGames = Math.floor(games/2);
      secondGames = games-firstGames;
    }
    allNonwinNullProbabilityUpperBound = kind === 'rank' ?
      rankAllNonwinBound(firstGames,secondGames) : Math.pow(1-floor,games);
  }
  return {attemptAlpha, perTestAlpha, floor, games,
    firstGames, secondGames, allNonwinNullProbabilityUpperBound};
}

/**
 * @param {object} registration Immutable, prospectively committed trial plan.
 * @param {object[]} observations Independently qualified source-game records.
 * @returns {object} Conditional statistical screen, never a certified match result.
 */
function assessHardMatchupVeto(registration, observations) {
  if (!registration || !Number.isInteger(registration.rank) ||
      registration.rank < 1 || registration.rank > RANKS) {
    throw new Error('Invalid published-field rank.');
  }
  const design = vetoDesign(registration.attemptIndex, registration.kind);
  if (registration.kind === 'seat' &&
      !['first', 'second'].includes(registration.startingSeat)) {
    throw new Error('Seat test must pre-register an actual starting seat.');
  }
  const plan = registration.plannedTrials;
  const frozen = registration.frozen;
  if (!Array.isArray(plan) || plan.length !== design.games ||
      !Array.isArray(observations) || observations.length !== design.games ||
      !frozen || !SHA256.test(frozen.candidateDeckSha256) ||
      !SHA256.test(frozen.opponentDeckSha256) ||
      !['candidatePolicyRevision', 'opponentPolicyRevision',
        'engineRevision', 'rulesetRevision'].every(k =>
        typeof frozen[k] === 'string' && frozen[k].length > 0)) {
    throw new Error('Incomplete frozen candidate/source identity or fixed trial horizon.');
  }

  const planned = new Map();
  const plannedSeeds = new Set();
  const plannedSeats = {first: 0, second: 0};
  for (const row of plan) {
    if (!row || typeof row.gameId !== 'string' || !row.gameId ||
        !Number.isInteger(row.seed) || row.seed < 0 || row.seed > 0xffffffff ||
        !['first', 'second'].includes(row.startingSeat) ||
        planned.has(row.gameId) || plannedSeeds.has(row.seed)) {
      throw new Error('Invalid, repeated, or unbalanced registered trial identity.');
    }
    planned.set(row.gameId, row);
    plannedSeeds.add(row.seed);
    plannedSeats[row.startingSeat] += 1;
  }
  if (registration.kind === 'rank' &&
      (plannedSeats.first !== design.firstGames ||
       plannedSeats.second !== design.secondGames)) {
    throw new Error('Rank veto requires the exact predeclared near-balanced actual starting-seat counts.');
  }
  if (registration.kind === 'seat' &&
      plannedSeats[registration.startingSeat] !== design.games) {
    throw new Error('Seat veto requires every trial in its pre-registered actual-start cell.');
  }

  const seen = new Set();
  let wins = 0;
  for (const game of observations) {
    const expected = planned.get(game?.gameId);
    if (!expected || seen.has(game.gameId) || game.seed !== expected.seed ||
        game.startingSeat !== expected.startingSeat ||
        game.rank !== registration.rank ||
        game.status !== 'qualified-completed-game' ||
        game.finished !== true || !['win','loss','draw'].includes(game.outcome) ||
        !['A','B'].includes(game.candidateEngineSlot) ||
        ![0,1,3].includes(game.winnerIndex) ||
        !SHA256.test(game.candidateDeckSha256 || '') ||
        !SHA256.test(game.opponentDeckSha256 || '') ||
        !Object.keys(frozen).every(k => game[k] === frozen[k])) {
      throw new Error('Unqualified, mismatched, missing, or repeated actual game.');
    }
    const firstSlot = game.turnEvidence?.firstTurnSlot;
    const firstName = firstSlot === 0 ? 'research-A' : 'research-B';
    const candidateSlot = game.candidateEngineSlot === 'A' ? 0 : 1;
    if (![0, 1].includes(firstSlot) ||
        game.turnEvidence.verifiedByDrawLog !== true ||
        game.turnEvidence.firstTurnPlayerId !== (firstSlot === 0 ? 101 : 202) ||
        game.turnEvidence.firstTurnPlayerName !== firstName ||
        game.turnEvidence.firstDrawLogName !== firstName ||
        game.startingSeat !== (candidateSlot === firstSlot ? 'first' : 'second')) {
      throw new Error('Actual starting seat lacks consistent independent draw-log evidence.');
    }
    const expectedOutcome = game.winnerIndex === 3 ? 'draw' :
      game.winnerIndex === candidateSlot ? 'win' : 'loss';
    if (game.outcome !== expectedOutcome) {
      throw new Error('Reported outcome contradicts recorded winning engine slot.');
    }
    seen.add(game.gameId);
    if (game.outcome === 'win') wins += 1;
  }

  const allNonWins = wins === 0;
  const nullEventUpperBound = design.allNonwinNullProbabilityUpperBound;
  return {
    schema: 'aichi-hard-matchup-veto-v1',
    attemptIndex: registration.attemptIndex,
    rank: registration.rank,
    kind: registration.kind,
    startingSeat: registration.kind === 'seat' ? registration.startingSeat : 'nearly-balanced',
    actualFirstGames: registration.kind === 'rank' ? plannedSeats.first : null,
    actualSecondGames: registration.kind === 'rank' ? plannedSeats.second : null,
    games: design.games,
    wins,
    nonWins: design.games - wins,
    necessaryWinRateFloor: design.floor,
    perTestAlpha: design.perTestAlpha,
    allNonWinNullProbabilityUpperBound: nullEventUpperBound,
    conditionalStatisticalVeto: allNonWins && nullEventUpperBound <= design.perTestAlpha,
    evidenceClass: 'structurally-checked-self-reported-qualified-games',
    caveat: 'Statistical veto only if independent actual games, printings, policy, replay, tournament timing, candidate registration and global attempt index were independently verified before data collection.'
  };
}

module.exports = {
  RANKS, SEATS, TARGET, FAMILY_ALPHA, RANK_FLOOR, CELL_FLOOR,
  rankAllNonwinBound, vetoDesign, assessHardMatchupVeto
};
