'use strict';

const {
  PROTOCOL: BASE_PROTOCOL,
  anytimeAdaptiveFieldEnvelope,
  cellAnytimeLowerBound
} = require('./agent46-anytime-adaptive-field-envelope.cjs');

const VERSION = 'agent46-anytime-adaptive-field-two-sided-v1';
const PROTOCOL = 'PROSPECTIVE_ADAPTIVE_FIELD_JOINT_TWO_SIDED_V1';
const DIGEST = /^[0-9a-f]{64}$/;

/**
 * Joint 1-alpha anytime confidence interval for the equal-cell paper win rate
 * of one fixed candidate. Opponent cells may be selected adaptively, so long
 * as conditional game outcomes follow fixed cell laws and all attempts are
 * registered before their outcomes become observable.
 *
 * A precommitted ordinal k allocates alpha/[k(k+1)] to the candidate;
 * half of that is spent on the win lower sequence and half on the win upper
 * sequence, then divided across C distinct cells. Across all k, cells and
 * both directions, the familywise error probability is at most alpha.
 *
 * Unknown original source, invalid physical-source fingerprint and censored
 * rows count as nonwins for the lower bound AND as wins for the upper bound.
 * This is conservative even with outcome-dependent censoring, provided the
 * underlying full paper-game outcome is defined and its conditional law is
 * fixed by the prospective experiment. Both bounds remain conditional on
 * external paper rules, opponent competence, information safety and clock.
 *
 * @param {object} config Schema of anytimeAdaptiveFieldEnvelope, with
 *   selectionProtocol set to PROTOCOL, alpha the total joint family budget.
 * @returns {object} Provisional two-sided statistical interval, not a game audit.
 */
function anytimeAdaptiveFieldTwoSided(config) {
  if (config?.selectionProtocol !== PROTOCOL) {
    throw new TypeError('Prospective joint two-sided field protocol required');
  }
  const familyAlpha = config.alpha ?? 0.05;
  if (!Number.isFinite(familyAlpha) || !(familyAlpha > 0 && familyAlpha < 1)) {
    throw new TypeError('Invalid joint family alpha');
  }
  const lowerAnalysis = anytimeAdaptiveFieldEnvelope({
    ...config,
    selectionProtocol: BASE_PROTOCOL,
    alpha: familyAlpha / 2
  });
  const source = new Map(config.authenticatedOriginalPrints.map(row => [
    row.rank, row.printed60Sha256
  ]));
  const cells = lowerAnalysis.perCell.map(row => ({
    cell: row.cell,
    rank: row.rank,
    registeredGames: 0,
    qualifiedWins: 0,
    qualifiedNonwins: 0,
    protectedCensored: 0,
    winRateLowerBound: row.lowerBound,
    winRateUpperBound: 1
  }));
  for (const g of config.games) {
    const cell = cells[g.cell];
    cell.registeredGames++;
    const authentic = source.get(g.rank) === g.sourcePrinted60Digest &&
      DIGEST.test(g.sourcePrinted60Digest ?? '') &&
      DIGEST.test(g.sourceDealFingerprint ?? '');
    if (authentic && g.status === 'QUALIFIED_NONWIN') {
      cell.qualifiedNonwins++;
    } else if (authentic && g.status === 'QUALIFIED_WIN') {
      cell.qualifiedWins++;
    } else {
      cell.protectedCensored++;
    }
  }
  let lowerSum = 0, upperSum = 0;
  for (const cell of cells) {
    const failureLower = cellAnytimeLowerBound(
      cell.qualifiedNonwins,
      cell.qualifiedWins + cell.protectedCensored,
      lowerAnalysis.logCellThreshold
    );
    cell.winRateUpperBound = 1 - failureLower;
    lowerSum += cell.winRateLowerBound;
    upperSum += cell.winRateUpperBound;
  }
  const fieldWinRateLowerBound = lowerSum / lowerAnalysis.cellCount;
  const fieldWinRateUpperBound = upperSum / lowerAnalysis.cellCount;
  const targetRate = lowerAnalysis.targetRate;
  return {
    version: VERSION,
    selectionProtocol: PROTOCOL,
    externalRegistrationId: lowerAnalysis.externalRegistrationId,
    candidateId: lowerAnalysis.candidateId,
    candidateOrdinal: lowerAnalysis.candidateOrdinal,
    candidatePrinted60Digest: lowerAnalysis.candidatePrinted60Digest,
    layout: lowerAnalysis.layout,
    cellCount: lowerAnalysis.cellCount,
    registeredGames: lowerAnalysis.registeredGames,
    authenticatedSourceRanks: lowerAnalysis.authenticatedSourceRanks,
    qualifiedWins: cells.reduce((sum, c) => sum + c.qualifiedWins, 0),
    qualifiedNonwins: cells.reduce((sum, c) => sum + c.qualifiedNonwins, 0),
    protectedCensored: cells.reduce((sum, c) => sum + c.protectedCensored, 0),
    familyAlpha,
    directionalAlpha: familyAlpha / 2,
    cellLogThreshold: lowerAnalysis.logCellThreshold,
    targetRate,
    fieldWinRateLowerBound,
    fieldWinRateUpperBound,
    perCell: cells,
    decision: fieldWinRateLowerBound > targetRate ?
      'CONDITIONAL_EVIDENCE_EXCEEDS_TARGET' :
      fieldWinRateUpperBound < targetRate ?
        'CONDITIONAL_EVIDENCE_BELOW_TARGET' :
        'INSUFFICIENT_INFORMATION',
    statisticalAssumptionsExternallyVerified: false,
    competitiveQualified: false,
    qualification: 'Joint anytime interval only. Verify preregistration, paper rules, original printings, fresh conditional game laws, full owner-safe opponent play and event clock externally. No native games qualify.'
  };
}

module.exports = { VERSION, PROTOCOL, anytimeAdaptiveFieldTwoSided };
