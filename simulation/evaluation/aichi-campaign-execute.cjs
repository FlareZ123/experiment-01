'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { loadDefaultCampaign, canonicalCards } = require('../../scripts/aichi-comparison-campaign.cjs');
const { deriveSlotSeeds } = require('../../scripts/aichi-decorrelated-seeds.cjs');

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
 *   researchRevision?:string,expectedEngineRevision:string}} options
 * @returns {object}
 */
function executeDiagnostic(options) {
  const { campaign, ranks, resolvePair, runMatch, maxActions = 600,
    policyFlags = {}, researchRevision = 'not-recorded',
    researchPolicyProfile = 'fixed-core-v1', expectedEngineRevision } = options;
  if (!campaign || ![1, 2, 3].includes(campaign.schemaVersion) ||
      campaign.purpose !== 'exploratory-diagnostic-only' ||
      typeof campaign.planDigest !== 'string' ||
      !Array.isArray(campaign.trials) ||
      typeof resolvePair !== 'function' || typeof runMatch !== 'function') {
    throw new Error('Invalid comparison campaign or execution callbacks.');
  }
  if ((campaign.schemaVersion === 1 && Object.hasOwn(campaign, 'seedProtocol')) ||
      (campaign.schemaVersion === 2 &&
        campaign.seedProtocol !== 'independent-slots-v2') ||
      (campaign.schemaVersion === 3 &&
        campaign.seedProtocol !== 'decorrelated-slots-v3')) {
    throw new Error('Unsupported campaign seed protocol.');
  }
  if (!['fixed-core-v1', 'expanded-action-fidelity-probe-v1'].includes(researchPolicyProfile)) {
    throw new Error('Unrecognized research policy profile.');
  }
  if (typeof expectedEngineRevision !== 'string' ||
      !/^twinleafgg\/[0-9a-f]{40}$/.test(expectedEngineRevision)) {
    throw new Error('A full pinned Twinleaf engine revision is required for diagnostics.');
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
    'grandTreeFirstTurnCorrection',
    'electrodeGXEnergyCorrection',
    'electrodeGXPrizeTradePolicy', 'electroRainDamageCorrection',
    'raichuSightToolPolicy', 'raichuPrizeAllocationPolicy',
    'doubleDragonRecovery',  'templeUnlockRecovery',
    'supporterDecisionCorrection', 'isolatePolicyRandomness',
    'prototypeSafeSimulatorIsolation', 'postSuperAliasRepairIsolation',
    'captureDecisionTrace', 'captureAttackPassProbes',
    'snorlaxRetreatStartCorrection',
    'shadowRiderEnergyPriority', 'shadowRiderEnergyAcrossField',
    'shadowRiderOpeningPivot', 'latiasAttackReadyAttachment',
    'bunnelbyK0SafeEvolution', 'attackBeforeRetreat',
    'attackBeforeRetreatCandidateOnly',
    'leleEntryAbilityLockCorrection',
    'radiantGateLockCorrection', 'entryDrawLockCorrection',
    'eldegossEntryLockCorrection'
  ]);
  if (policyFlags === null || typeof policyFlags !== 'object' ||
      Array.isArray(policyFlags) ||
      Object.entries(policyFlags).some(([key, value]) =>
        !allowedFlags.has(key) || typeof value !== 'boolean')) {
    throw new Error('policyFlags may contain only recognized boolean policy options.');
  }
  if (policyFlags.prototypeSafeSimulatorIsolation === true &&
      policyFlags.postSuperAliasRepairIsolation === true) {
    throw new Error('Choose only one experimental speculative Simulator profile.');
  }
  if (policyFlags.attackBeforeRetreatCandidateOnly === true &&
      policyFlags.attackBeforeRetreat !== true) {
    throw new Error('Candidate-only preference requires Attack-before-Retreat policy.');
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
    const expectedSeed = campaign.schemaVersion === 3 ?
      deriveSlotSeeds(campaign.seedBase, 'pilot', trial.rank, trial.repeat)
        [trial.candidateEngineSlot] :
      campaign.seedBase + 100000 + trial.rank * 1024 +
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
      researchPolicyProfile,
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
      const {attackBeforeRetreatCandidateOnly, ...enginePolicyFlags} = policyFlags;
      const expectedLabel = 'Aichi comparative diagnostic ' + trial.trialId;
      const game = runMatch({
        deckA, deckB, seed: trial.seed, maxActions,
        label: expectedLabel,
        ...enginePolicyFlags,
        ...(attackBeforeRetreatCandidateOnly === true ?
          {attackBeforeRetreatSeat: candidateA ? 0 : 1} : {})
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
      // Runtime fields are self-reported; this is a consistency check.
      const echoedPolicyKeys = [
        'forestSealSearchCorrection', 'doubleDragonRecovery',
        'grandTreeFirstTurnCorrection', 'templeUnlockRecovery', 'supporterDecisionCorrection',
        'electrodeGXEnergyCorrection',
        'electrodeGXPrizeTradePolicy', 'electroRainDamageCorrection',
        'raichuSightToolPolicy', 'raichuPrizeAllocationPolicy',
        'snorlaxRetreatStartCorrection', 'shadowRiderEnergyPriority',
        'shadowRiderEnergyAcrossField', 'shadowRiderOpeningPivot',
        'latiasAttackReadyAttachment', 'bunnelbyK0SafeEvolution',
        'attackBeforeRetreat', 'prototypeSafeSimulatorIsolation',
        'postSuperAliasRepairIsolation', 'leleEntryAbilityLockCorrection',
        'radiantGateLockCorrection', 'entryDrawLockCorrection',
        'eldegossEntryLockCorrection'
      ];
      const policyMismatch = echoedPolicyKeys.some(key =>
        Object.hasOwn(enginePolicyFlags, key) &&
        game[key] !== enginePolicyFlags[key]);
      const expectedAttackSeat = attackBeforeRetreatCandidateOnly === true ?
        (candidateA ? 0 : 1) : null;
      const environmentValid =
        game.engine === expectedEngineRevision &&
        game.label === expectedLabel &&
        game.rules?.format === 'EXPANDED' &&
        game.rules.firstTurnDrawCard === true &&
        game.rules.firstTurnUseSupporter === false &&
        game.rules.attackFirstTurn === false &&
        (policyFlags.strictPromptValidation !== true ||
          game.promptValidationMode === 'predispatch-prompt-validate') &&
        (policyFlags.isolatePolicyRandomness !== true ||
          (game.policyRandomIsolation === true &&
           game.randomnessProtocol === 'separate-game-and-per-seat-policy-prng-v1')) &&
        (expectedAttackSeat === null ||
          game.attackBeforeRetreatSeat === expectedAttackSeat) &&
        !policyMismatch;
      if (!environmentValid) {
        records.push({
          ...base, status: 'unverified-game-environment',
          expectedEngineRevision, observedEngineRevision: game.engine ?? null,
          expectedLabel, observedLabel: game.label ?? null,
          observedRules: game.rules ?? null,
          expectedPolicyFlags: enginePolicyFlags,
          observedPolicyFlags: Object.fromEntries(echoedPolicyKeys.map(
            key => [key, game[key] ?? null])),
          observedPromptValidationMode: game.promptValidationMode ?? null,
          observedPolicyRandomIsolation: game.policyRandomIsolation ?? null,
          observedRandomnessProtocol: game.randomnessProtocol ?? null,
          observedAttackBeforeRetreatSeat: game.attackBeforeRetreatSeat ?? null,
          error: 'Engine revision, trial label, rules, or requested policy evidence did not match.'
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
        observedPolicyFlags: Object.fromEntries(echoedPolicyKeys
          .filter(key => Object.hasOwn(enginePolicyFlags, key))
          .map(key => [key, game[key]])),
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
    seedBase: campaign.seedBase,
    campaignSchemaVersion: campaign.schemaVersion,
    seedProtocol: campaign.seedProtocol || 'paired-slots-v1',
    candidateRows: campaign.candidateRows, fieldCoverage: campaign.coverage,
    selectedPilotRanks: ranks, maxActions, policyFlags, researchRevision,
    expectedEngineRevision,
    researchPolicyProfile,
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
  const { withExpandedActionOptions, EXPANDED_PROFILE } =
    require('../twinleaf/policy-profiles.cjs');
  const { planAichi } = require('./aichi-pilot.cjs');
  const dir = path.resolve(__dirname, '../../results/aichi-2026');
  const seedProtocol = process.env.AICHI_DIAGNOSTIC_SEED_PROTOCOL ||
    'paired-slots-v1';
  const researchPolicyProfile = process.env.AICHI_POLICY_PROFILE || 'fixed-core-v1';
  if (!['fixed-core-v1', EXPANDED_PROFILE].includes(researchPolicyProfile)) {
    throw new Error('Unsupported Aichi diagnostic policy profile.');
  }
  /** @param {object} request */
  const runWithProfile = request => {
    if (researchPolicyProfile === 'fixed-core-v1') return runMatch(request);
    return withExpandedActionOptions(() => {
      const game = runMatch(request);
      return {
        ...game,
        policy: String(game.policy || 'unspecified') +
          '+TempleUnlockTactic-v1+ToolAwareAttackTactic-v1' +
          (request.bunnelbyK0SafeEvolution === true ? '' :
            '+BunnelbyEvolutionTactic-v1+BarrageEvolutionResolver-v1') +
          '+MandatoryOptionResolver-v1'
      };
    }, {sourceK0Bunnelby: request.bunnelbyK0SafeEvolution === true});
  };
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
  const engineRevisions = new Set([...mappings.values()].map(mapping =>
    mapping.engineRevision));
  assert.equal(engineRevisions.size, 1, 'Candidate mappings disagree on engine revision.');
  const expectedEngineRevision = 'twinleafgg/' + [...engineRevisions][0];
  const ranks = (process.env.AICHI_DIAGNOSTIC_RANKS || '1,6').split(',').map(Number);
  const output = executeDiagnostic({
    campaign, ranks, maxActions: 600, expectedEngineRevision,
    researchRevision: process.env.GITHUB_SHA || 'local-revision-not-recorded',
    researchPolicyProfile,
    policyFlags: {
      strictPromptValidation: true, forestSealSearchCorrection: true,
      grandTreeFirstTurnCorrection: process.env.AICHI_GRAND_TREE_TURN_GUARD === '1',
      electrodeGXEnergyCorrection: process.env.AICHI_ELECTRODE_GX_ENERGY === '1',
      electroRainDamageCorrection: process.env.AICHI_ELECTRO_RAIN_DAMAGE === '1',
      electrodeGXPrizeTradePolicy: process.env.AICHI_ELECTRODE_PRIZE_TRADE === '1',
      raichuSightToolPolicy: process.env.AICHI_RAICHU_SIGHT === '1',
      raichuPrizeAllocationPolicy: process.env.AICHI_RAICHU_PRIZE_ALLOCATION === '1',
      doubleDragonRecovery: true, supporterDecisionCorrection: true,
      isolatePolicyRandomness: true, captureDecisionTrace: true,
      prototypeSafeSimulatorIsolation: process.env.AICHI_PROTOTYPE_SAFE_SIM === '1',
      postSuperAliasRepairIsolation: process.env.AICHI_POST_SUPER_ALIAS_REPAIR_SIM === '1',
      captureAttackPassProbes: process.env.AICHI_ATTACK_PASS_PROBE === '1',
      shadowRiderEnergyPriority: process.env.AICHI_SHADOW_ENERGY === '1',
      shadowRiderEnergyAcrossField: process.env.AICHI_SHADOW_ENERGY_GLOBAL === '1',
      shadowRiderOpeningPivot: process.env.AICHI_OPENING_PIVOT === '1',
      latiasAttackReadyAttachment: process.env.AICHI_LATIAS_ATTACK_READY === '1',
      bunnelbyK0SafeEvolution: process.env.AICHI_BUNNELBY_SOURCE_K0 === '1',
      attackBeforeRetreat: process.env.AICHI_ATTACK_BEFORE_RETREAT === '1',
      attackBeforeRetreatCandidateOnly: process.env.AICHI_ATTACK_CANDIDATE_ONLY === '1',
      leleEntryAbilityLockCorrection: true,
      radiantGateLockCorrection: true,
      entryDrawLockCorrection: true
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
    runMatch: runWithProfile
  });
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
}

if (require.main === module) main();
module.exports = { digest, observedFirstTurn, executeDiagnostic, main };
