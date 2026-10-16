'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { loadDefaultCampaign, canonicalCards } = require('../../scripts/aichi-comparison-campaign.cjs');

/** @param {unknown} value @returns {string} */
function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Only two independent observations establish a claimed first turn: the
 * Store's first-turn player and the first draw log.
 * @param {object} game Pinned engine result.
 * @returns {null|object}
 */
function observedFirstTurn(game) {
  const slot = game.firstTurnSlot;
  if (game.verifiedByDrawLog !== true || (slot !== 0 && slot !== 1) ||
      game.firstTurnPlayerId !== (slot === 0 ? 101 : 202) ||
      game.firstTurnPlayerName !== (slot === 0 ? 'research-A' : 'research-B') ||
      game.firstDrawLogName !== game.firstTurnPlayerName) return null;
  return {
    firstTurnSlot: slot, firstTurnPlayerId: game.firstTurnPlayerId,
    firstTurnPlayerName: game.firstTurnPlayerName,
    firstDrawLogName: game.firstDrawLogName, verifiedByDrawLog: true
  };
}

/**
 * A small fixed-candidate execution probe with exact plan identities.
 * No count produced here is evidence of competitive win probability.
 *
 * @param {{campaign:object,ranks:number[],resolvePair:(trial:object)=>object,
 *   runMatch:(request:object)=>object,maxActions?:number,policyFlags?:object,
 *   researchRevision?:string}} options
 * @returns {object}
 */
function executeDiagnostic(options) {
  const { campaign, ranks, resolvePair, runMatch, maxActions = 600,
    policyFlags = {}, researchRevision = 'not-recorded' } = options;
  if (!campaign || ![1, 2].includes(campaign.schemaVersion) ||
      campaign.purpose !== 'exploratory-diagnostic-only' ||
      typeof campaign.planDigest !== 'string' ||
      !Array.isArray(campaign.trials) ||
      typeof resolvePair !== 'function' || typeof runMatch !== 'function') {
    throw new Error('Invalid comparison campaign or execution callbacks.');
  }
  if ((campaign.schemaVersion === 1 && Object.hasOwn(campaign, 'seedProtocol')) ||
      (campaign.schemaVersion === 2 &&
        campaign.seedProtocol !== 'independent-slots-v2')) {
    throw new Error('Unsupported campaign seed protocol.');
  }
  const { planDigest, trials: scheduledTrials, ...metadata } = campaign;
  if (digest({ metadata, trials: scheduledTrials }) !== planDigest) {
    throw new Error('Campaign planDigest integrity mismatch.');
  }
  if (!Array.isArray(ranks) || !ranks.length ||
      ranks.some(r => !Number.isInteger(r) || !campaign.pilotRanks.includes(r)) ||
      new Set(ranks).size !== ranks.length ||
      !Number.isInteger(maxActions) || maxActions < 1) {
    throw new Error('Ranks must be unique published pilot ranks; maxActions must be positive.');
  }
  const allowedFlags = new Set([
    'strictPromptValidation', 'forestSealSearchCorrection',
    'doubleDragonRecovery', 'templeUnlockRecovery',
    'supporterDecisionCorrection', 'isolatePolicyRandomness',
    'captureDecisionTrace', 'snorlaxRetreatStartCorrection',
    'shadowRiderEnergyPriority', 'leleEntryAbilityLockCorrection'
  ]);
  if (policyFlags === null || typeof policyFlags !== 'object' ||
      Array.isArray(policyFlags) ||
      Object.entries(policyFlags).some(([key, value]) =>
        !allowedFlags.has(key) || typeof value !== 'boolean')) {
    throw new Error('policyFlags may contain only recognized boolean policy options.');
  }
  const wanted = new Set(ranks);
  const trials = campaign.trials.filter(t => t.phase === 'pilot' && wanted.has(t.rank));
  const expected = ranks.length * campaign.repeats * campaign.candidateRows.length * 2;
  if (trials.length !== expected || new Set(trials.map(t => t.trialId)).size !== expected) {
    throw new Error('Incomplete or repeated plan trials.');
  }
  const candidateDigests = new Map(campaign.candidateRows.map(
    row => [row.id, row.deckDigest]));
  if (candidateDigests.size !== campaign.candidateRows.length ||
      !Number.isInteger(campaign.repeats) || campaign.repeats < 1 ||
      !Number.isInteger(campaign.seedBase)) {
    throw new Error('Invalid fixed-plan candidate or repeat metadata.');
  }
  for (const trial of trials) {
    const slotOffset = trial.candidateEngineSlot === 'B' ? 1 : 0;
    const expectedSeed = campaign.seedBase + 100000 + trial.rank * 1024 +
      (campaign.schemaVersion === 2 ? 2 * trial.repeat + slotOffset : trial.repeat);
    const expectedId = ['pilot', trial.rank, trial.repeat, trial.candidateId,
      trial.candidateEngineSlot].join(':');
    if (!candidateDigests.has(trial.candidateId) ||
        trial.candidateDigest !== candidateDigests.get(trial.candidateId) ||
        !['A', 'B'].includes(trial.candidateEngineSlot) ||
        !Number.isInteger(trial.repeat) || trial.repeat < 0 ||
        trial.repeat >= campaign.repeats ||
        !Number.isInteger(trial.seed) || trial.seed !== expectedSeed ||
        trial.trialId !== expectedId ||
        trial.actualStartingTurn !== 'requires-runtime-verification') {
      throw new Error('Malformed fixed-plan trial or seed assignment.');
    }
  }
  const records = [];
  for (const trial of trials) {
    const base = {
      trialId: trial.trialId, planDigest: campaign.planDigest, phase: trial.phase,
      candidateId: trial.candidateId, candidateDigest: trial.candidateDigest,
      opponentRank: trial.rank, opponentDigest: trial.opponentDigest,
      seed: trial.seed, candidateEngineSlot: trial.candidateEngineSlot
    };
    try {
      const pair = resolvePair(trial);
      if (pair.candidateDigest !== trial.candidateDigest ||
          pair.opponentDigest !== trial.opponentDigest) {
        throw new Error('Source deck identity differs from fixed plan.');
      }
      if (!Array.isArray(pair.candidateCards) || pair.candidateCards.length !== 60 ||
          !Array.isArray(pair.opponentCards) || pair.opponentCards.length !== 60) {
        records.push({ ...base, status: 'blocked-deck-resolution',
          blockers: pair.blockers || ['One or both decks lack a 60-card engine mapping.'] });
        continue;
      }
      const candidateA = trial.candidateEngineSlot === 'A';
      const deckA = candidateA ? pair.candidateCards : pair.opponentCards;
      const deckB = candidateA ? pair.opponentCards : pair.candidateCards;
      const game = runMatch({
        deckA, deckB, seed: trial.seed, maxActions,
        label: 'Aichi comparative diagnostic ' + trial.trialId,
        ...policyFlags
      });
      const expectedDeckHashes = [digest(deckA), digest(deckB)];
      if (game.seed !== trial.seed ||
          !Array.isArray(game.deckHashes) ||
          game.deckHashes.length !== 2 ||
          game.deckHashes.some((hash, index) => hash !== expectedDeckHashes[index])) {
        records.push({
          ...base, status: 'unverified-game-identity',
          observedSeed: game.seed ?? null,
          observedDeckHashes: game.deckHashes ?? null,
          expectedDeckHashes,
          error: 'Engine-reported seed or ordered deck hashes differ from the fixed trial.'
        });
        continue;
      }
      if (game.rules?.format !== 'EXPANDED') {
        records.push({
          ...base, status: 'unverified-game-environment',
          observedRules: game.rules ?? null,
          error: 'Engine did not confirm the Expanded rules format.'
        });
        continue;
      }
      const turn = observedFirstTurn(game);
      const completed = game.finished === true && [0, 1, 3].includes(game.winner);
      const rawTrace = policyFlags.captureDecisionTrace === true ? game.decisionTrace : null;
      const traceRequested = policyFlags.captureDecisionTrace === true;
      const traceValid = !traceRequested || (
        Array.isArray(rawTrace) && rawTrace.length > 0 &&
        rawTrace.every((entry, index) =>
          Number.isInteger(entry.actionOrdinal) &&
          entry.actionOrdinal >= 0 && entry.actionOrdinal < game.actions &&
          (index === 0 || entry.actionOrdinal > rawTrace[index - 1].actionOrdinal) &&
          Number.isInteger(entry.turnBefore) &&
          Number.isInteger(entry.turnAfter) &&
          Array.isArray(entry.prizesAfter) && entry.prizesAfter.length === 2 &&
          Array.isArray(entry.decksAfter) && entry.decksAfter.length === 2)
      );
      const status = !turn ? 'unverified-first-turn' :
        completed && !traceValid ? 'unverified-decision-trace' :
        completed ? 'completed-engine-game' : 'unfinished-engine-game';
      const candidateSlot = candidateA ? 0 : 1;
      const opponentSlot = candidateA ? 1 : 0;
      const attackTrace = Array.isArray(game.attackTrace) ? game.attackTrace : [];
      const candidateAttacks = attackTrace.filter(a => a.seat === candidateSlot).length;
      const opponentAttacks = attackTrace.filter(a => a.seat === opponentSlot).length;
      records.push({
        ...base, status, candidateActualTurn: turn ?
          (turn.firstTurnSlot === candidateSlot ? 'first' : 'second') : 'unverified',
        turnEvidence: turn, winnerIndex: game.winner ?? null,
        engineRevision: game.engine || null, policy: game.policy || null,
        rules: game.rules || null, randomnessProtocol: game.randomnessProtocol || null,
        engineDeckHashes: game.deckHashes || null,
        actions: game.actions ?? null, turns: game.turns ?? null,
        endReason: game.endReason || null,
        candidateAttacks, opponentAttacks,
        qualityFlags: [
          ...(candidateAttacks === 0 ? ['zero-candidate-attacks'] : []),
          ...(opponentAttacks === 0 ? ['zero-opponent-attacks'] : []),
          ...(traceRequested && !traceValid ? ['missing-or-invalid-decision-trace'] : [])
        ],
        // Engine traces are action summaries, not complete replayable transcripts.
        traceSummary: {
          attackTrace, actionCounts: game.actionCounts || {},
          actionsBySeat: game.actionsBySeat || [],
          cardsPlayedBySeat: game.cardsPlayedBySeat || [],
          prizesRemaining: game.prizesRemaining || [],
          finalState: game.finalState || [],
          terminalTransition: game.terminalTransition || null,
          chronologicalActionTrace: traceRequested && traceValid ? rawTrace : null,
          chronologicalActionTraceSha256: traceRequested && traceValid ?
            digest(rawTrace) : null,
          capturedMeaningfulActions: traceRequested && traceValid ? rawTrace.length : null,
          coversAllActionsAndPromptResolutions: false
        }
      });
    } catch (error) {
      records.push({ ...base, status: 'engine-exception',
        error: String(error?.message || error) });
    }
  }
  const counts = {};
  for (const record of records) counts[record.status] = (counts[record.status] || 0) + 1;
  return {
    schemaVersion: 1, purpose: 'engine-and-policy-diagnostic-only',
    planDigest: campaign.planDigest, fieldDigest: campaign.fieldDigest,
    campaignSchemaVersion: campaign.schemaVersion,
    seedProtocol: campaign.seedProtocol || 'paired-slots-v1',
    candidateRows: campaign.candidateRows, fieldCoverage: campaign.coverage,
    selectedPilotRanks: ranks, maxActions, policyFlags, researchRevision,
    engineAndPolicyQualified: false, strengthClaimPermitted: false,
    totalScheduled: expected, counts, records,
    caution: 'Terminal games, attack counts and slot swaps cannot establish competitive performance. Game effects, policies, and actual starting-turn balance need independent validation.'
  };
}

/**
 * Execute a small budgeted default probe in the compiled Twinleaf environment.
 * The JSON is printed for a manually dispatched CI artifact; no files are mutated.
 */
function main() {
  const { runMatch } = require('../twinleaf/headless.cjs');
  const { planAichi } = require('./aichi-pilot.cjs');
  const dir = path.resolve(__dirname, '../../results/aichi-2026');
  const seedProtocol = process.env.AICHI_DIAGNOSTIC_SEED_PROTOCOL ||
    'paired-slots-v1';
  const campaign = loadDefaultCampaign(seedProtocol);
  const source = JSON.parse(fs.readFileSync(path.join(dir, 'full-decklists.json'), 'utf8'));
  const byRank = new Map(source.decks.map(d => [d.rank, d]));
  const sourceCandidates = new Map([
    ['champion-reference', byRank.get(1)],
    ['hood-shield-v1', JSON.parse(fs.readFileSync(path.join(dir, 'candidate-hood-shadow-rider.json'), 'utf8'))],
    ['temple-v1', JSON.parse(fs.readFileSync(path.join(dir, 'candidate-temple-shadow-rider.json'), 'utf8'))]
  ]);
  const plannedCandidates = new Map(campaign.candidateRows.map(c => [c.id, c]));
  const mappings = new Map();
  for (const [id, candidate] of sourceCandidates) {
    assert.equal(digest(canonicalCards(candidate.cards)), plannedCandidates.get(id).deckDigest,
      'Candidate drift since comparison schedule: ' + id);
    mappings.set(id, planAichi(id === 'champion-reference' ? 1 : candidate, {
      allowEquivalentBasicEnergies: true,
      allowJapanesePromoHooks: true
    }));
  }
  const ranks = (process.env.AICHI_DIAGNOSTIC_RANKS || '1,6').split(',').map(Number);
  const output = executeDiagnostic({
    campaign, ranks, maxActions: 600,
    researchRevision: process.env.GITHUB_SHA || 'local-revision-not-recorded',
    policyFlags: {
      strictPromptValidation: true, forestSealSearchCorrection: true,
      doubleDragonRecovery: true, supporterDecisionCorrection: true,
      isolatePolicyRandomness: true, captureDecisionTrace: true,
      shadowRiderEnergyPriority: process.env.AICHI_SHADOW_ENERGY === '1'
    },
    resolvePair(trial) {
      const mapping = mappings.get(trial.candidateId);
      const opponent = mapping.opponents.find(o => o.rank === trial.rank);
      assert.equal(digest(canonicalCards(byRank.get(trial.rank).cards)), trial.opponentDigest);
      return {
        candidateDigest: trial.candidateDigest, opponentDigest: trial.opponentDigest,
        candidateCards: mapping.candidate.cards, opponentCards: opponent.cards,
        blockers: [...mapping.candidate.unresolved, ...(opponent.unresolved || [])]
      };
    },
    runMatch
  });
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
}

if (require.main === module) main();
module.exports = { digest, observedFirstTurn, executeDiagnostic, main };
