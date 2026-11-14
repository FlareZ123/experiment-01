'use strict';

const STRATA = 128;
const FAILURE_RATE = 0.005;
const FIELD_MEAN_TARGET = 0.995;
const ALPHA = 0.05;
const CERTIFIED_GAMES_PER_CELL = 10;

function assertInteger(value, name, minimum = 1) {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new TypeError(name + ' must be a safe integer >= ' + minimum);
  }
}

function probabilityAtMostTwoNonwins(totalGames, failureRate = FAILURE_RATE) {
  assertInteger(totalGames, 'totalGames', 3);
  if (typeof failureRate !== 'number' || !Number.isFinite(failureRate) ||
      failureRate <= 0 || failureRate >= 1) {
    throw new TypeError('failureRate must be a finite number strictly between 0 and 1');
  }

  const logFailure = Math.log(failureRate);
  const logWin = Math.log1p(-failureRate);
  const terms = [
    totalGames * logWin,
    Math.log(totalGames) + logFailure + (totalGames - 1) * logWin,
    Math.log(totalGames) + Math.log(totalGames - 1) - Math.log(2) +
      2 * logFailure + (totalGames - 2) * logWin,
  ];
  const max = Math.max(...terms);
  return Math.exp(max) * terms.reduce((sum, term) => sum + Math.exp(term - max), 0);
}

function evaluateFixedTwoNonwinFieldMeanDesign() {
  const gamesPerCell = CERTIFIED_GAMES_PER_CELL;
  const totalGames = STRATA * gamesPerCell;
  const previousGamesPerCell = gamesPerCell - 1;
  const previousTotalGames = STRATA * previousGamesPerCell;
  const worstCasePValue = probabilityAtMostTwoNonwins(totalGames);
  const previousEqualNullPValue = probabilityAtMostTwoNonwins(previousTotalGames);

  return Object.freeze({
    estimand: 'equal-weight 128-stratum field-mean game win probability',
    strata: STRATA,
    nullFieldMeanWinRate: FIELD_MEAN_TARGET,
    nullMeanFailureRate: FAILURE_RATE,
    oneSidedAlpha: ALPHA,
    maximumNonwins: 2,
    gamesPerCell,
    totalGames,
    worstCaseNullPValue: worstCasePValue,
    passes: worstCasePValue <= ALPHA,
    previousGamesPerCell,
    previousTotalGames,
    previousEqualNullPValue,
    previousFails: previousEqualNullPValue > ALPHA,
    heterogeneityProof: 'pairwise-smoothing-v1-128x10-two-nonwins',
    fixedSampleOnly: true,
    requiresIndependentGames: true,
    perOpponentGuarantee: false,
  });
}

module.exports = {
  STRATA,
  FAILURE_RATE,
  FIELD_MEAN_TARGET,
  ALPHA,
  CERTIFIED_GAMES_PER_CELL,
  probabilityAtMostTwoNonwins,
  evaluateFixedTwoNonwinFieldMeanDesign,
};

if (require.main === module) {
  process.stdout.write(JSON.stringify(evaluateFixedTwoNonwinFieldMeanDesign(), null, 2) + '\n');
}
