'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {initializeCards, runMatch} = require('../twinleaf/headless.cjs');
const {originals} =
  require('./agent41-rank3-arbitration-original-store.cjs');
const {observedFirstTurn} = require('./aichi-campaign-execute.cjs');
const {withCanonicalActorOnlyPolicy} =
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy} =
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline} =
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection} =
  require('../twinleaf/same-target-attach-energy-hook.cjs');
const {withOwnerAbilityConfirmPolicy} =
  require('../twinleaf/agent36-owner-ability-confirm-policy.cjs');
const {withArticunoColdCrushPolicy} =
  require('../twinleaf/agent32-articuno-cold-crush-policy.cjs');

const VERSION = 'agent32-rank3-articuno-cold-crush-matched-aba-v1';
const PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEEDS = Object.freeze([290146, 290147, 290148, 290149, 290150, 290151, 290152, 290153]);
const ACTION_LIMIT = 260;
const VARIANTS = Object.freeze([
  {name: 'A-observe', mode: 'observe'},
  {name: 'B-intervene', mode: 'intervene'},
  {name: 'A-repeat-observe', mode: 'observe'}
]);

/** @param {object} value */
function sha(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/** @returns {object[]} Pre-registered matched A/B/A deal schedule. */
function schedule() {
  const rows = [];
  for (const candidateSeat of [0, 1]) {
    for (const seed of SEEDS) {
      for (const variant of VARIANTS) {
        rows.push({
          id: ['rank3', candidateSeat, seed, variant.name].join(':'),
          candidateSeat,
          sourceSeat: 1 - candidateSeat,
          seed,
          variant: variant.name,
          mode: variant.mode
        });
      }
    }
  }
  assert.equal(rows.length, SEEDS.length * 2 * 3);
  return rows;
}

/**
 * Execute the exact same bilateral policy stack for baseline and treatment.
 * The only treatment difference is the final Articuno Confirm/MoveEnergy
 * resolver, which is either observe-only or one-Water intervention.
 *
 * @param {object} request
 * @param {'observe'|'intervene'} mode
 * @returns {{game:object,audits:object}}
 */
function runWithPolicies(request, mode) {
  let ownerAudit = null;
  let articunoAudit = null;
  let sameTargetAudit = null;
  let canonicalAudit = null;
  let disciplineAudit = null;

  const executeOwner = () => {
    const owner = withOwnerAbilityConfirmPolicy(() => {
      const articuno = withArticunoColdCrushPolicy(() => {
        const sameTarget = withSameTargetAttachEnergySelection(() =>
          runMatch(request));
        sameTargetAudit = sameTarget.audit;
        return sameTarget.result;
      }, {mode});
      articunoAudit = articuno.audit;
      return articuno.result;
    });
    ownerAudit = owner.audit;
    return owner.result;
  };

  const discipline = withNativePaperSupporterDiscipline(() => {
    const canonical = withCanonicalActorOnlyPolicy(executeOwner, {
      root: work => withActorOnlyRootPolicy(work, {
        terminalArbitration: false,
        publicContextSpecialEnergy: true,
        specialEnergyRoot: true
      })
    }, {
      ownerSingleSearch: true,
      genericFallbackAttribution: true
    });
    canonicalAudit = canonical.audit;
    return canonical.result;
  });
  disciplineAudit = discipline.audit;

  return {
    game: discipline.result,
    audits: {
      discipline: disciplineAudit,
      canonical: canonicalAudit,
      ownerAbility: ownerAudit,
      articunoColdCrush: articunoAudit,
      sameTargetEnergy: sameTargetAudit
    }
  };
}

/**
 * First actual opponent root action and attack declaration after Cold Crush.
 * This is raw continuation evidence, not a claim about opponent competence.
 *
 * @param {object} game
 * @param {number} opponentSeat
 * @param {object|null} attack
 */
function nextOpponentResponse(game, opponentSeat, attack) {
  if (!attack) return {rootActions: [], attacks: []};
  const rootActions = (game.rootActionLedger ?? []).filter(event =>
    event.playerSlot === opponentSeat && event.turnBefore > attack.turn).slice(0, 8);
  const attacks = (game.attackDeclarationTrace ?? []).filter(event =>
    event.playerSlot === opponentSeat && event.turnBefore > attack.turn).slice(0, 4);
  return {rootActions, attacks};
}

/**
 * @param {object} trial
 * @param {{source:object[],candidate:object[]}} decks
 * @returns {object}
 */
function runOne(trial, decks) {
  const request = {
    deckA: (trial.candidateSeat === 0 ? decks.candidate : decks.source).slice(),
    deckB: (trial.candidateSeat === 1 ? decks.candidate : decks.source).slice(),
    seed: trial.seed,
    maxActions: ACTION_LIMIT,
    label: 'agent32-articuno-cold-crush-' + trial.id,
    strictPromptValidation: true,
    mandatoryOptionFallback: true,
    enforceSelectOptionLegality: true,
    enforceVisiblePlayLockBothSeats: true,
    captureDecisionTrace: true,
    captureInitialFullPhysicalDeal: true,
    captureInitialSourceDealFingerprintSeat: trial.sourceSeat,
    captureNativeAbortEvidence: true,
    captureFinalPublicBoard: true,
    capturePublicAttackTransitions: true
  };

  try {
    const observed = runWithPolicies(request, trial.mode);
    const game = observed.game;
    const art = observed.audits.articunoColdCrush ?? {};
    const coldCrush = art.coldCrushAttackEvents?.[0] ?? null;
    const verifiedStart = observedFirstTurn(game);
    return {
      trial,
      status: game.finished ? 'native-terminal' : 'action-cap',
      nativePin: PIN,
      sourceDeckSha256: sha(decks.source),
      candidateDeckSha256: sha(decks.candidate),
      sourceDeckCounts: sourceCounts,
      fullInitialDealSha256:
        game.initialFullPhysicalDealFingerprint?.digestSha256 ?? null,
      sourceInitialDealSha256:
        game.initialSourceDealFingerprint?.digestSha256 ?? null,
      nativeWinner: game.winner ?? null,
      nativeActions: game.actions ?? null,
      nativeTurn: game.turn ?? null,
      actualStarterSeat: verifiedStart?.firstTurnSlot ?? null,
      sourceActuallyFirst: verifiedStart ? verifiedStart.firstTurnSlot === trial.sourceSeat : null,
      firstStartVerified: verifiedStart !== null,
      rootActionCount: game.rootActionLedger?.length ?? null,
      rootActionLedgerSha256: game.rootActionLedger ? sha(game.rootActionLedger) : null,
      attackDeclarationCount: game.attackDeclarationTrace?.length ?? null,
      publicAttackTransitionCount: game.publicAttackTransitions?.length ?? null,
      articunoAudit: art,
      ownerAbilityAudit: observed.audits.ownerAbility,
      sameTargetAudit: observed.audits.sameTargetEnergy,
      coldCrushFollowup: nextOpponentResponse(
        game, trial.candidateSeat, coldCrush),
      competitiveQualified: false
    };
  } catch (error) {
    return {
      trial,
      status: 'native-error',
      error: String(error?.stack ?? error).slice(0, 3000),
      articunoAudit: error?.articunoColdCrushAudit ?? null,
      ownerAbilityAudit: error?.ownerAbilityConfirmAudit ?? null,
      competitiveQualified: false
    };
  }
}

/** @param {object[]} rows */
function summarize(rows) {
  const groups = new Map();
  for (const row of rows) {
    const key = row.trial.candidateSeat + ':' + row.trial.seed;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  const matched = [...groups.entries()].map(([key, group]) => {
    const fingerprints = group.map(row => row.fullInitialDealSha256);
    return {
      key,
      variants: group.map(row => row.trial.variant),
      fingerprints,
      sameInitialDeal: fingerprints.every(value =>
        value !== null && value === fingerprints[0])
    };
  });
  const events = rows.flatMap(row =>
    row.articunoAudit?.confirmEvents ?? []);
  const coldCrushRows = rows.filter(row =>
    (row.articunoAudit?.coldCrushAttackEvents ?? []).length > 0);
  return {
    attempted: rows.length,
    nativeErrors: rows.filter(row => row.status === 'native-error').length,
    nativeTerminals: rows.filter(row => row.status === 'native-terminal').length,
    actionCaps: rows.filter(row => row.status === 'action-cap').length,
    articunoConfirmOffers: events.length,
    proposalAccepts: events.filter(event => event.proposalDecision === true).length,
    actualAccepts: events.filter(event => event.actualDecision === true).length,
    coldCrushGames: coldCrushRows.length,
    coldCrushAttacks: coldCrushRows.reduce((n, row) =>
      n + (row.articunoAudit?.coldCrushAttackEvents?.length ?? 0), 0),
    matchedDealGroups: matched.length,
    matchedInitialDeals: matched.filter(group => group.sameInitialDeal).length,
    matchedDealChecks: matched,
    competitiveQualifiedGames: 0
  };
}

function run() {
  initializeCards();
  const decks = originals();
  assert.equal(decks.source.length, 60);
  assert.equal(decks.candidate.length, 60);
  const sourceCounts = {
    articunoCES31: decks.source.filter(card => card.fullName === 'Articuno-GX CES').length,
    basicWater: decks.source.filter(card => card.name === 'Water Energy').length,
    captureEnergy: decks.source.filter(card => card.name === 'Capture Energy').length
  };
  assert.deepEqual(sourceCounts, {articunoCES31: 1, basicWater: 2, captureEnergy: 3});

  const envNames = [
    'AGENT8_ACTOR_QUICK_BALL_DEV',
    'AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
    'AGENT22_SPARSE_OWNER_BUNDLE_DEV'
  ];
  const previous = new Map(envNames.map(name => [name, process.env[name]]));
  try {
    for (const name of envNames) process.env[name] = 'false';
    const attempts = schedule();
    const rows = attempts.map(trial => runOne(trial, decks));
    return {
      version: VERSION,
      nativePin: PIN,
      sourceRank: 3,
      sourceArchetype: 'Snorlax Stall',
      candidateReferenceRank: 1,
      candidateArchetype: 'Shadow Rider Calyrex',
      sourceDeckSha256: sha(decks.source),
      candidateDeckSha256: sha(decks.candidate),
      seeds: [...SEEDS],
      candidateSeats: [0, 1],
      variants: VARIANTS,
      maxActionsPerMatch: ACTION_LIMIT,
      schedule: attempts,
      rows,
      summary: summarize(rows),
      limitations: [
        'The source rank3 and rank1 reference decks are unchanged authenticated original 60s.',
        'The A/B/A policy comparison uses the same seed, physical seats, engine, and general policy stack.',
        'Observe mode records the one-Water proposal while delegating the actual Confirm to the shared owner policy.',
        'Intervene mode accepts only exact Articuno-GX CES 31 hand-play prompts with one transferable Basic Water, unused GX, and at least the configured public Active Energy threshold.',
        'Capture Energy putting Articuno directly onto the Bench does not trigger Legendary Ascent and is not treated as a hand-play prompt.',
        'The default pinned bot and canonical actor policy remain limited; match outcomes are not competitive-strength evidence.',
        'No result qualifies toward the 99.5% Top 32 target.'
      ]
    };
  } finally {
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

if (require.main === module) {
  const result = run();
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (result.summary.nativeErrors > 0) process.exitCode = 1;
}

module.exports = {
  VERSION, PIN, SEEDS, ACTION_LIMIT, VARIANTS,
  schedule, runWithPolicies, nextOpponentResponse, runOne, summarize, run
};
