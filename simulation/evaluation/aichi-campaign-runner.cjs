'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { buildCampaign, loadDefaultCampaign, parseField } =
  require('../../scripts/aichi-comparison-campaign.cjs');

const SOURCE_DIR = path.resolve(__dirname, '../../results/aichi-2026');

/** @param {unknown} value @returns {string} */
function sha256(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Retrieve all fixed candidate inventories without altering printed rows.
 * @returns {{field:object[],source:object,candidates:object[],campaign:object}}
 */
function loadCampaignInputs() {
  const source = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, 'full-decklists.json'), 'utf8'));
  const field = parseField(fs.readFileSync(path.join(SOURCE_DIR, 'field.csv'), 'utf8'));
  const rankOne = source.decks.find(deck => deck.rank === 1);
  if (!rankOne) throw new Error('Rank-1 reference is absent.');
  const files = [
    ['hood-shield-v1', 'candidate-hood-shadow-rider.json'],
    ['temple-v1', 'candidate-temple-shadow-rider.json']
  ];
  const candidates = [{ id: 'champion-reference', cards: rankOne.cards, referenceOnly: true }];
  for (const [id, file] of files) {
    candidates.push({
      id, cards: JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, file), 'utf8')).cards
    });
  }
  return { field, source, candidates, campaign: loadDefaultCampaign() };
}

/**
 * Fail closed on any alteration to the previously declared opponent field,
 * candidate printings, schedule or seed assignment.
 * @param {object} inputs
 */
function verifyCampaign(inputs) {
  const { field, source, candidates, campaign } = inputs;
  const reconstructed = buildCampaign({
    field, source, candidates, pilotRanks: campaign.pilotRanks,
    repeats: campaign.repeats, seedBase: campaign.seedBase
  });
  if (reconstructed.planDigest !== campaign.planDigest) {
    throw new Error('Campaign planDigest/source inventory mismatch.');
  }
  return reconstructed;
}

/**
 * First-turn evidence must match both the actual engine slot and first draw log.
 * @param {object} game
 * @returns {object|null}
 */
function turnProof(game) {
  if (game.verifiedByDrawLog !== true ||
      ![0, 1].includes(game.firstTurnSlot) ||
      game.firstTurnPlayerId !== (game.firstTurnSlot === 0 ? 101 : 202) ||
      game.firstTurnPlayerName !==
        (game.firstTurnSlot === 0 ? 'research-A' : 'research-B') ||
      game.firstDrawLogName !== game.firstTurnPlayerName) return null;
  return {
    firstTurnSlot: game.firstTurnSlot,
    firstTurnPlayerId: game.firstTurnPlayerId,
    firstTurnPlayerName: game.firstTurnPlayerName,
    firstDrawLogName: game.firstDrawLogName,
    verifiedByDrawLog: true
  };
}

/**
 * Execute selected scheduled trials without resampling seeds or quietly
 * replacing unresolved card printings. Injectable components permit tests
 * without the compiled engine.
 *
 * @param {object} inputs Full source-locked campaign inputs.
 * @param {{phase?:string,trialIds?:string[],maxTrials?:number,
 *   maxActions?:number,prepareCandidate?:(candidate:object)=>object,
 *   runMatch?:(request:object)=>object,matchOptions?:object}} options
 * @returns {object} Feasibility archive, never a performance certificate.
 */
function executeCampaign(inputs, options = {}) {
  const campaign = verifyCampaign(inputs);
  const { candidates } = inputs;
  const phase = options.phase || 'pilot';
  if (!['pilot', 'published-field'].includes(phase)) {
    throw new Error('Unknown campaign phase.');
  }
  const maxTrials = options.maxTrials === undefined ? 2 : options.maxTrials;
  if (!Number.isInteger(maxTrials) || maxTrials < 1 || maxTrials > 1000) {
    throw new Error('maxTrials must be an integer from 1 through 1000.');
  }
  const known = campaign.trials.filter(t => t.phase === phase);
  const byId = new Map(known.map(t => [t.trialId, t]));
  let chosen;
  if (options.trialIds !== undefined) {
    if (!Array.isArray(options.trialIds) || !options.trialIds.length ||
        new Set(options.trialIds).size !== options.trialIds.length ||
        options.trialIds.some(id => !byId.has(id))) {
      throw new Error('Unknown, repeated or absent scheduled trial ID.');
    }
    chosen = options.trialIds.map(id => byId.get(id));
  } else {
    chosen = known.slice(0, maxTrials);
  }
  if (chosen.length > maxTrials) {
    throw new Error('Requested trial count exceeds the explicit budget.');
  }
  const prepareCandidate = options.prepareCandidate || (candidate => {
    const { planAichi } = require('./aichi-pilot.cjs');
    return planAichi({ label: candidate.id, cards: candidate.cards }, {
      allowEquivalentBasicEnergies: true,
      allowBasicEnergyMirrorPrintings: true,
      allowJapanesePromoHooks: true
    });
  });
  const play = options.runMatch || require('../twinleaf/headless.cjs').runMatch;
  const sourceRanks = new Map(inputs.source.decks.map(d => [d.rank, d]));
  const candidateMap = new Map(candidates.map(c => [c.id, c]));
  const prepared = new Map();
  const records = [];

  for (const trial of chosen) {
    const candidate = candidateMap.get(trial.candidateId);
    const opponentSource = sourceRanks.get(trial.rank);
    if (!candidate || !opponentSource ||
        sha256(require('../../scripts/aichi-comparison-campaign.cjs')
          .canonicalCards(candidate.cards)) !== trial.candidateDigest ||
        sha256(require('../../scripts/aichi-comparison-campaign.cjs')
          .canonicalCards(opponentSource.cards)) !== trial.opponentDigest) {
      throw new Error('Trial deck digest disagrees with declared source.');
    }
    if (!prepared.has(candidate.id)) prepared.set(candidate.id, prepareCandidate(candidate));
    const plan = prepared.get(candidate.id);
    const opponent = plan.opponents.find(d => d.rank === trial.rank);
    const base = {
      trialId: trial.trialId, phase: trial.phase, rank: trial.rank,
      candidateId: trial.candidateId, candidateDigest: trial.candidateDigest,
      opponentDigest: trial.opponentDigest, seed: trial.seed,
      repeat: trial.repeat, candidateEngineSlot: trial.candidateEngineSlot,
      sourcePrintSubstitutions: {
        candidate: plan.candidate.substitutions || [],
        opponent: opponent?.substitutions || []
      }
    };
    if (!plan.candidate.cards || opponent?.status !== 'ready' || !opponent.cards) {
      records.push({ ...base, status: 'blocked-resolution',
        candidateUnresolved: plan.candidate.unresolved || [],
        opponentUnresolved: opponent?.unresolved || [],
        firstTurn: null, winner: null });
      continue;
    }
    const candidateA = trial.candidateEngineSlot === 'A';
    const deckA = candidateA ? plan.candidate.cards : opponent.cards;
    const deckB = candidateA ? opponent.cards : plan.candidate.cards;
    const expectedEngineDeckHashes = [sha256(deckA), sha256(deckB)];
    const request = {
      deckA, deckB, seed: trial.seed,
      maxActions: options.maxActions === undefined ? 800 : options.maxActions,
      label: trial.trialId,
      strictPromptValidation: true,
      isolatePolicyRandomness: true,
      ...(options.matchOptions || {})
    };
    try {
      const game = play(request);
      const proof = turnProof(game);
      const validHashes = Array.isArray(game.deckHashes) &&
        game.deckHashes.length === 2 &&
        game.deckHashes.every((digest, i) => digest === expectedEngineDeckHashes[i]);
      const terminal = game.finished === true && [0, 1, 3].includes(game.winner);
      const status = !validHashes ? 'engine-deck-mismatch' :
        !proof ? 'unverified-first-turn' :
          !terminal ? 'unfinished' : 'completed';
      const candidateSlot = candidateA ? 0 : 1;
      records.push({
        ...base, status, firstTurn: proof,
        candidateTrueTurn: proof ?
          (proof.firstTurnSlot === candidateSlot ? 'first' : 'second') : 'unverified',
        winner: status === 'completed' ?
          (game.winner === 3 ? 'draw' :
            game.winner === candidateSlot ? 'candidate' : 'opponent') : null,
        endReason: game.endReason || null, actionCount: game.actions ?? null,
        turns: game.turns ?? null, expectedEngineDeckHashes,
        observedEngineDeckHashes: game.deckHashes || null,
        attackTrace: game.attackTrace || [],
        actionsBySeat: game.actionsBySeat || [],
        cardsPlayedBySeat: game.cardsPlayedBySeat || [],
        note: 'Aggregate engine trace; full replay/action log is not preserved here.'
      });
    } catch (error) {
      records.push({ ...base, status: 'engine-exception',
        firstTurn: null, winner: null, error: String(error?.message || error) });
    }
  }
  return {
    schemaVersion: 1, planDigest: campaign.planDigest, phase,
    purpose: 'exploratory-engine-feasibility',
    competitiveWinRateCertified: false,
    rulesAndBotCompetenceCertified: false,
    sourceDeckCount: inputs.source.decks.length,
    selectedTrialIds: chosen.map(t => t.trialId),
    recordedTrials: records.length, records
  };
}

if (require.main === module) {
  const phase = process.env.CAMPAIGN_PHASE || 'pilot';
  const maxTrials = Number(process.env.CAMPAIGN_MAX_TRIALS || 2);
  const maxActions = Number(process.env.CAMPAIGN_MAX_ACTIONS || 800);
  process.stdout.write(JSON.stringify(executeCampaign(loadCampaignInputs(), {
    phase, maxTrials, maxActions
  }), null, 2) + '\n');
}

module.exports = { loadCampaignInputs, verifyCampaign, turnProof, executeCampaign };
