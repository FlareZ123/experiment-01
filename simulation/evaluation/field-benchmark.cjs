'use strict';

const { normalizeNumber } = require('../twinleaf/card-coverage.cjs');
const { createHash } = require('node:crypto');
const { basicEnergyEquivalents } = require('./basic-energy-equivalents.cjs');

const ENGINE_REVISION = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * An exact lower Clopper-Pearson confidence bound for Bernoulli successes.
 * Ties are failures when testing an asserted game-win probability.
 * Uses a log-sum-exp binomial tail for numerical stability.
 *
 * @param {number} wins Integer successes.
 * @param {number} trials Integer observations.
 * @param {number} confidence One-sided confidence level.
 * @returns {number|null} Null when no trials were completed.
 */
function winProbabilityLowerBound(wins, trials, confidence = 0.95) {
  if (!Number.isInteger(wins) || !Number.isInteger(trials) ||
      wins < 0 || trials < wins || !(confidence > 0 && confidence < 1)) {
    throw new Error('Invalid binomial confidence-bound inputs.');
  }
  if (trials === 0) return null;
  if (wins === 0) return 0;
  const alpha = 1 - confidence;
  if (wins === trials) return Math.exp(Math.log(alpha) / trials);
  const maxLosses = trials - wins;

  /** @param {number} probability Proposed Bernoulli success probability. */
  function atLeastWins(probability) {
    if (probability <= 0) return 0;
    if (probability >= 1) return 1;
    const logP = Math.log(probability);
    const logQ = Math.log1p(-probability);
    let current = trials * logP;
    let maximum = current;
    let sum = 1;
    for (let losses = 1; losses <= maxLosses; losses += 1) {
      current += Math.log(trials - losses + 1) - Math.log(losses) + logQ - logP;
      if (current > maximum) {
        sum = sum * Math.exp(maximum - current) + 1;
        maximum = current;
      } else {
        sum += Math.exp(current - maximum);
      }
    }
    return Math.exp(maximum) * sum;
  }

  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2;
    if (atLeastWins(mid) >= alpha) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

/** @param {Array<object>} cardPool Actual initialized Twinleaf card objects. */
function exactPrintingIndex(cardPool) {
  const index = new Map();
  for (const card of cardPool) {
    const names = [card.name];
    if (card.tags?.includes('Prism Star') && card.name.endsWith(' Prism Star')) {
      names.push(card.name.replace(/ Prism Star$/u, ' ♢'));
      names.push(card.name.replace(/ Prism Star$/u, ' ◇'));
    }
    for (const name of names) {
      const key = [name, String(card.set).toUpperCase(),
        normalizeNumber(card.setNumber)].join('\u0000');
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(card.fullName);
    }
  }
  return index;
}

/**
 * Resolve every source printing exactly. No silent alternate printing or
 * same-name replacement is permitted.
 * @param {object} deck Manifest entry.
 * @param {Map<string,string[]>} index Exact printing index.
 * @param {Map<string,string>} equivalents Verified canonical Basic Energy alternatives.
 */
function resolveDeck(deck, index, equivalents = new Map()) {
  const cards = [];
  const unresolved = [];
  const substitutions = [];
  let total = 0;
  for (const row of deck.cards) {
    if (!Number.isInteger(row.count) || row.count <= 0 ||
        !row.name || !row.printing?.set || !row.printing?.number) {
      throw new Error('Malformed card row in rank ' + deck.rank);
    }
    total += row.count;
    const key = [row.name, String(row.printing.set).toUpperCase(),
      normalizeNumber(row.printing.number)].join('\u0000');
    const choices = index.get(key) || [];
    if (choices.length === 1) {
      for (let i = 0; i < row.count; i += 1) cards.push(choices[0]);
    } else if (choices.length === 0 && equivalents.has(row.name)) {
      const canonical = equivalents.get(row.name);
      for (let i = 0; i < row.count; i += 1) cards.push(canonical);
      substitutions.push({
        name: row.name, count: row.count, originalPrinting: row.printing,
        enginePrinting: canonical, equivalence: 'ordinary-basic-energy-identical-type'
      });
    } else {
      unresolved.push({
        name: row.name, count: row.count, printing: row.printing,
        reason: choices.length === 0 ? 'missing-exact-printing' : 'ambiguous-exact-printing',
        candidates: choices
      });
    }
  }
  if (total !== 60) throw new Error('Rank ' + deck.rank + ' has ' + total + ' cards, expected 60.');
  return { cards: unresolved.length === 0 ? cards : null, unresolved, substitutions };
}

/**
 * All 32 placements are retained, including three currently unpublished lists.
 * A candidate can be a published field rank or a supplied fixed 60-card list.
 * @param {object} manifest Published Aichi manifest.
 * @param {Array<object>} cardPool Twinleaf card objects.
 * @param {number|object} candidateRank Published rank or an external 60-card candidate object.
 * @param {{allowBasicEnergyEquivalent?:boolean}} options Opt-in print-equivalence policy.
 */
function buildPlan(manifest, cardPool, candidateRank = 1, options = {}) {
  if (!Array.isArray(manifest.decks)) throw new Error('Invalid field manifest.');
  const indexed = new Map(manifest.decks.map(deck => [deck.rank, deck]));
  if (indexed.size !== manifest.decks.length) throw new Error('Duplicate ranks in manifest.');
  const custom = typeof candidateRank === 'object' && candidateRank !== null;
  const candidate = custom ? { ...candidateRank, rank: 'custom' } : indexed.get(candidateRank);
  if (!candidate) throw new Error('Candidate rank has no published decklist.');
  const index = exactPrintingIndex(cardPool);
  const equivalents = options.allowBasicEnergyEquivalent ? basicEnergyEquivalents(cardPool) : new Map();
  const candidateResolved = resolveDeck(candidate, index, equivalents);
  const opponents = [];
  for (let rank = 1; rank <= 32; rank += 1) {
    const deck = indexed.get(rank);
    if (!deck) {
      opponents.push({ rank, status: 'missing-published-list', cards: null });
      continue;
    }
    const resolved = resolveDeck(deck, index, equivalents);
    opponents.push({
      rank, player: deck.player, archetype: deck.archetype,
      status: resolved.cards ? 'ready' : 'unresolved-printings',
      cards: resolved.cards, unresolved: resolved.unresolved,
      substitutions: resolved.substitutions
    });
  }
  const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  const fingerprintSource = candidateResolved.cards || candidate.cards.map(row =>
    [row.name, row.count, row.printing?.set, row.printing?.number].join(':'));
  return {
    source: manifest.source,
    engineRevision: ENGINE_REVISION, manifestDigest: digest(manifest),
    printEquivalencePolicy: options.allowBasicEnergyEquivalent ? 'ordinary-basic-energy-only' : 'exact-only',
    candidateRank: custom ? null : candidateRank,
    candidateLabel: custom ? candidateRank.label || 'custom fixed 60-card list' : candidate.player,
    candidateDigest: digest([...fingerprintSource].sort()),
    candidate: candidateResolved, opponents
  };
}

/**
 * A deliberately conservative, reproducible evaluation protocol. The caller
 * supplies a runner so the statistics and seat balance can be tested without
 * the simulator. Unfinished games and execution errors remain explicit.
 * @param {ReturnType<typeof buildPlan>} plan
 * @param {{runMatch:(request:object)=>object,gamesPerSeat?:number,seedBase?:number,
 *  maxActions?:number,selectedRanks?:number[],captureTrace?:boolean,
 *  strictPromptValidation?:boolean,forestSealSearchCorrection?:boolean,
 *  doubleDragonRecovery?:boolean,supporterDecisionCorrection?:boolean,
 *  isolatePolicyRandomness?:boolean}} options
 */
function evaluatePlan(plan, options) {
  const { runMatch, gamesPerSeat = 10, seedBase = 20261015,
    maxActions = 3000, selectedRanks, captureTrace = false,
    strictPromptValidation = false, forestSealSearchCorrection = false,
    doubleDragonRecovery = false, templeUnlockRecovery = false,
    supporterDecisionCorrection = false,
    isolatePolicyRandomness = false } = options;
  if (typeof runMatch !== 'function') throw new Error('runMatch is required.');
  if (!Number.isInteger(gamesPerSeat) || gamesPerSeat < 1 || gamesPerSeat > 10000) {
    throw new Error('gamesPerSeat must be between 1 and 10000.');
  }
  if (!Number.isInteger(seedBase) || seedBase < 0 || seedBase > 0xffffffff) {
    throw new Error('seedBase must be a 32-bit unsigned integer.');
  }
  if (selectedRanks !== undefined && (!Array.isArray(selectedRanks) ||
      selectedRanks.some(rank => !Number.isInteger(rank) || rank < 1 || rank > 32) ||
      new Set(selectedRanks).size !== selectedRanks.length)) {
    throw new Error('selectedRanks must be a unique list of ranks 1..32.');
  }
  const scheduled = selectedRanks ? new Set(selectedRanks) : null;
  const results = [];
  for (const opponent of plan.opponents) {
    const row = {
      rank: opponent.rank, player: opponent.player || null,
      archetype: opponent.archetype || null,
      status: opponent.status, readinessStatus: opponent.status,
      plannedGames: !scheduled || scheduled.has(opponent.rank) ? 2 * gamesPerSeat : 0,
      opponentSubstitutions: opponent.substitutions || [],
      attempted: 0, completed: 0, wins: 0, losses: 0, draws: 0,
      unfinished: 0, errors: [], games: [], trueStartingTurn: {first:0,second:0,unverified:0}, lower95: null
    };
    if (!plan.candidate.cards) {
      row.status = 'candidate-unresolved';
      row.unresolvedCandidate = plan.candidate.unresolved;
    } else if (opponent.status === 'ready' && scheduled && !scheduled.has(opponent.rank)) {
      row.status = 'not-scheduled';
    } else if (opponent.status === 'ready') {
      for (let i = 0; i < gamesPerSeat; i += 1) {
        for (let candidateSeat = 0; candidateSeat < 2; candidateSeat += 1) {
          const seed = (seedBase + opponent.rank * 20003 + i * 2 + candidateSeat) >>> 0;
          const request = {
            deckA: candidateSeat === 0 ? plan.candidate.cards : opponent.cards,
            deckB: candidateSeat === 1 ? plan.candidate.cards : opponent.cards,
            seed, maxActions, label: 'Aichi rank ' + opponent.rank,
            ...(strictPromptValidation ? {strictPromptValidation: true} : {}),
            ...(forestSealSearchCorrection ? {forestSealSearchCorrection: true} : {}),
            ...(doubleDragonRecovery ? {doubleDragonRecovery: true} : {}),
            ...(templeUnlockRecovery ? {templeUnlockRecovery: true} : {}),
            ...(supporterDecisionCorrection ? {supporterDecisionCorrection: true} : {}),
            ...(isolatePolicyRandomness ? {isolatePolicyRandomness: true} : {})
          };
          row.attempted += 1;
          try {
            const game = runMatch(request);
            const gameStatus = !game.finished ||
              (game.winner !== 0 && game.winner !== 1 && game.winner !== 3) ?
              'unfinished' : 'completed';
            const authenticFirstTurn = (game.verifiedByDrawLog === true &&
              (game.firstTurnSlot === 0 || game.firstTurnSlot === 1) &&
              game.firstTurnPlayerId === (game.firstTurnSlot === 0 ? 101 : 202) &&
              game.firstTurnPlayerName === (game.firstTurnSlot === 0 ? 'research-A' : 'research-B') &&
              game.firstDrawLogName === game.firstTurnPlayerName);
            const actualFirstPlayerSide = authenticFirstTurn ?
              (game.firstTurnSlot === 0 ? 'A' : 'B') : null;
            const candidateOrder = actualFirstPlayerSide === null ? 'unverified' :
              actualFirstPlayerSide === (candidateSeat === 0 ? 'A' : 'B') ? 'first' : 'second';
            row.trueStartingTurn[candidateOrder] += 1;
            row.games.push({ seed, candidateEngineSide: candidateSeat === 0 ? 'A' : 'B',
              actualFirstPlayerSide, candidateOrder,
              firstTurnEvidence: authenticFirstTurn ? {
                firstTurnSlot: game.firstTurnSlot,
                firstTurnPlayerId: game.firstTurnPlayerId,
                firstTurnPlayerName: game.firstTurnPlayerName,
                firstDrawLogName: game.firstDrawLogName,
                verifiedByDrawLog: game.verifiedByDrawLog
              } : null,
              winnerIndex: game.winner,
              status: gameStatus, endReason: game.endReason || null,
              actions: game.actions ?? null, turns: game.turns ?? null,
              engineDeckHashes: game.deckHashes || null,
              engineTrace: captureTrace ? {
                attackTrace: game.attackTrace || [],
                abilityTrace: game.abilityTrace || [],
                actionCounts: game.actionCounts || {},
                actionsBySeat: game.actionsBySeat || [],
                cardsPlayedBySeat: game.cardsPlayedBySeat || [],
                prizesRemaining: game.prizesRemaining || [],
                finalState: game.finalState || []
              } : null });
            if (gameStatus === 'unfinished') {
              row.unfinished += 1;
            } else {
              row.completed += 1;
              if (game.winner === 3) row.draws += 1;
              else if (game.winner === candidateSeat) row.wins += 1;
              else row.losses += 1;
            }
          } catch (error) {
            const message = String(error?.message || error);
            row.errors.push({ seed, message });
            row.trueStartingTurn.unverified += 1;
            row.games.push({ seed, candidateEngineSide: candidateSeat === 0 ? 'A' : 'B',
              actualFirstPlayerSide: null, candidateOrder: 'unverified', winnerIndex: null,
              status: 'engine-exception', message });
          }
        }
      }
      row.status = row.errors.length || row.unfinished ? 'incomplete' : 'simulated';
      if (row.status === 'simulated') {
        row.observedWinFraction = row.wins / row.completed;
        row.lower95 = winProbabilityLowerBound(row.wins, row.completed, 0.95);
      }
    }
    results.push(row);
  }
  return {
    candidateRank: plan.candidateRank, candidateLabel: plan.candidateLabel,
    candidateDigest: plan.candidateDigest, manifestDigest: plan.manifestDigest,
    engineRevision: plan.engineRevision, source: plan.source,
    printEquivalencePolicy: plan.printEquivalencePolicy,
    candidateSubstitutions: plan.candidate.substitutions,
    seedBase, gamesPerSeat, maxActions,
    selectedRanks: selectedRanks || null,
    captureTrace,
    strictPromptValidation,
    forestSealSearchCorrection,
    doubleDragonRecovery,
    templeUnlockRecovery,
    supporterDecisionCorrection,
    isolatePolicyRandomness,
    randomnessProtocol: isolatePolicyRandomness ?
      'separate-game-and-per-seat-policy-prng-v1' : 'legacy-shared-prng',
    policy: (doubleDragonRecovery ?
      'Twinleaf SimpleTacticsAi+' +
      require('../twinleaf/dde-attach-tactic.cjs').DDE_POLICY_VERSION :
      'Twinleaf SimpleTacticsAi') +
      (supporterDecisionCorrection ? '+SupporterDecisionGuard-v1' : '') +
      (templeUnlockRecovery ? '+TempleUnlockTactic-v1' : '') +
      '; competence unvalidated',
    engineSlotProtocol: 'candidate alternates engine A/B; true first-turn attributed only when engine turn and draw-log agree',
    startingTurnBalanceVerified: false,
    observedMatchupsHaveBothRealStartingTurns: results.some(r => r.status === 'simulated') &&
      results.filter(r => r.status === 'simulated').every(r =>
        r.trueStartingTurn.first > 0 && r.trueStartingTurn.second > 0 &&
        r.trueStartingTurn.unverified === 0),
    simultaneousFieldConfidenceCertified: false,
    confidenceLimitations: 'per-opponent lower95 pools engine slots without verified starting-turn strata or simultaneous field adjustment',
    scope: 'engine simulation only; no demonstrated competitive paper Expanded win rate',
    opponents: results
  };
}

module.exports = { ENGINE_REVISION, winProbabilityLowerBound, exactPrintingIndex,
  resolveDeck, buildPlan, evaluatePlan };
