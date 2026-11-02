'use strict';

const VERSION = 'agent5-bilateral-pass-only-census-v1';

/**
 * Check whether the actual Store transcript contains only a single Pass root
 * and housekeeping Wait prompts during one complete global turn.
 * @param {object[]} actions Genuine accepted-root transcript for one turn.
 * @returns {number|null} Passing physical seat, or null if not proved.
 */
function passOnlySeat(actions) {
  const material = actions.filter(action =>
    action.action !== 'ResolvePromptAction');
  if (material.length !== 1 || material[0].action !== 'PassTurnAction' ||
      !actions.every(action => action.action !== 'ResolvePromptAction' ||
        action.pendingPrompt === 'WaitPrompt')) return null;
  const seat = material[0].playerSlot;
  return seat === 0 || seat === 1 ? seat : null;
}

/**
 * Read-only census of serial two-player inactivity from one original Store
 * bilateral game. A full root ledger and absence of clock resets are needed
 * before it flags a long alternating pass-only episode for policy review.
 * Does not infer legality, availability of an alternative, opponent pressure,
 * match duration, tactical desirability, or competitive win probability.
 * @param {object} row Archived developmental game result.
 * @param {number} [reviewThreshold=10] Minimum consecutive turns for review.
 * @returns {object} Original-source-attributed episode evidence.
 */
function passiveEpisodeCensus(row, reviewThreshold = 10) {
  if (!Number.isSafeInteger(reviewThreshold) || reviewThreshold < 2)
    throw new RangeError('reviewThreshold must be an integer >= 2');
  const roots = Array.isArray(row?.rootActionLedger)
    ? row.rootActionLedger : [];
  const ledgerComplete = Number.isSafeInteger(row?.rootActionCount) &&
    roots.length === row.rootActionCount &&
    roots.every((action, index) => action.actionOrdinal === index);
  const resets = Array.isArray(row?.suddenDeathClockResets)
    ? row.suddenDeathClockResets.length : null;
  const singleEpoch = resets === 0 && !roots.some(action =>
    Number.isSafeInteger(action.turnBefore) &&
    Number.isSafeInteger(action.turnAfter) &&
    action.turnAfter < action.turnBefore);
  const turns = new Map();
  for (const root of roots) {
    const t = root?.turnBefore;
    if (!Number.isSafeInteger(t) || t <= 0) continue;
    if (!turns.has(t)) turns.set(t, []);
    turns.get(t).push(root);
  }
  const passes = [...turns.entries()]
    .map(([turn, actions]) => ({turn, seat: passOnlySeat(actions)}))
    .filter(x => x.seat !== null).sort((a, b) => a.turn - b.turn);
  const episodes = [];
  for (const point of passes) {
    const previous = episodes.at(-1);
    if (previous && point.turn === previous.at(-1).turn + 1 &&
        point.seat !== previous.at(-1).seat) previous.push(point);
    else episodes.push([point]);
  }
  const resultEpisodes = episodes.map(group => ({
    firstTurn: group[0].turn,
    lastTurn: group.at(-1).turn,
    consecutiveAlternatingPassOnlyTurns: group.length,
    sourcePassOnlyTurns: group.filter(x => x.seat === row?.sourceSeat).length,
    candidatePassOnlyTurns: group.filter(x =>
      x.seat === row?.candidateSeat).length
  })).sort((a, b) =>
    b.consecutiveAlternatingPassOnlyTurns -
      a.consecutiveAlternatingPassOnlyTurns || a.firstTurn - b.firstTurn);
  const maxConsecutive = resultEpisodes[0]
    ?.consecutiveAlternatingPassOnlyTurns ?? 0;
  return {
    schema: VERSION,
    trial: row?.trial?.id ?? null,
    sourceRank: row?.trial?.rank ?? null,
    candidateId: row?.trial?.candidateId ?? null,
    sourceSeat: row?.sourceSeat ?? null,
    candidateSeat: row?.candidateSeat ?? null,
    nativeStatus: row?.endReason ?? null,
    nativeFinished: row?.finished === true,
    ledgerComplete,
    singleEpoch,
    passOnlyTurns: passes.length,
    maxConsecutive,
    episodes: resultEpisodes,
    requiresPolicyReview: ledgerComplete && singleEpoch &&
      maxConsecutive >= reviewThreshold,
    competitiveQualified: false
  };
}

/**
 * Aggregate a fixed, failure-inclusive archived comparison population.
 * @param {object[]} rows Archived original Store bilateral game rows.
 * @param {number} [reviewThreshold=10]
 * @returns {object} Population totals without statistical independence claims.
 */
function censusArchivedRows(rows, reviewThreshold = 10) {
  if (!Array.isArray(rows)) throw new TypeError('rows must be an array');
  const games = rows.map(row => passiveEpisodeCensus(row, reviewThreshold));
  return {
    schema: VERSION,
    games: games.length,
    totalPassOnlyTurns: games.reduce((s, g) => s + g.passOnlyTurns, 0),
    gamesWithFiveOrMore: games.filter(g => g.ledgerComplete &&
      g.singleEpoch && g.maxConsecutive >= 5).length,
    gamesRequiringPolicyReview: games.filter(g => g.requiresPolicyReview).length,
    ledgersComplete: games.filter(g => g.ledgerComplete).length,
    singleEpochGames: games.filter(g => g.singleEpoch).length,
    competitiveQualifiedGames: 0,
    gameEvidence: games
  };
}

module.exports = { VERSION, passOnlySeat, passiveEpisodeCensus,
  censusArchivedRows };
