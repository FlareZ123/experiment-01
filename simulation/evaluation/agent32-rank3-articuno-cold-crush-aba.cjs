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
const AICHI_CORPUS = require('../../results/aichi-2026/full-decklists.json');

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

/**
 * Read exact source-printing counts from the authenticated paper manifest.
 * planAichi returns engine card IDs, not card metadata objects.
 * @param {object} [corpus]
 * @returns {{articunoCES31:number,basicWater:number,captureEnergy:number}}
 */
function sourceCountsFromManifest(corpus = AICHI_CORPUS) {
  const source = corpus.decks.find(deck => deck.rank === 3);
  assert.ok(source, 'authenticated Aichi rank-3 source deck must exist');
  assert.equal(source.archetype, 'Snorlax Stall');
  assert.equal(source.cards.reduce((sum, card) => sum + card.count, 0), 60);
  const count = (name, set, number) => source.cards
    .filter(card => card.name === name &&
      card.printing?.set === set && card.printing?.number === number)
    .reduce((sum, card) => sum + card.count, 0);
  return {
    articunoCES31: count('Articuno-GX', 'CES', '31'),
    basicWater: count('Water Energy', 'MEE', '11'),
    captureEnergy: count('Capture Energy', 'RCL', '171')
  };
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
 * @param {{source:string[],candidate:string[]}} decks
 * @param {{articunoCES31:number,basicWater:number,captureEnergy:number}} sourceCounts
 * @returns {object}
 */
function runOne(trial, decks, sourceCounts) {
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
      attackDeclarationSha256: game.attackDeclarationTrace ? sha(game.attackDeclarationTrace) : null,
      publicAttackTransitionCount: game.publicAttackTransitions?.length ?? null,
      publicAttackTransitionsSha256: game.publicAttackTransitions ? sha(game.publicAttackTransitions) : null,
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
  const expectedVariants = VARIANTS.map(variant => variant.name);
  const matched = [...groups.entries()].map(([key, group]) => {
    const variants = group.map(row => row.trial.variant);
    const fullFingerprints = group.map(row => row.fullInitialDealSha256 ?? null);
    const sourceFingerprints = group.map(row => row.sourceInitialDealSha256 ?? null);
    const firstControl = group.find(row => row.trial.variant === 'A-observe');
    const repeatControl = group.find(row => row.trial.variant === 'A-repeat-observe');
    const sameObserveControl = Boolean(firstControl && repeatControl &&
      firstControl.status === repeatControl.status &&
      firstControl.nativeWinner === repeatControl.nativeWinner &&
      firstControl.nativeActions === repeatControl.nativeActions &&
      firstControl.nativeTurn === repeatControl.nativeTurn &&
      firstControl.actualStarterSeat === repeatControl.actualStarterSeat &&
      firstControl.sourceActuallyFirst === repeatControl.sourceActuallyFirst &&
      typeof firstControl.rootActionLedgerSha256 === 'string' &&
      firstControl.rootActionLedgerSha256 === repeatControl.rootActionLedgerSha256 &&
      firstControl.attackDeclarationSha256 === repeatControl.attackDeclarationSha256 &&
      firstControl.publicAttackTransitionsSha256 === repeatControl.publicAttackTransitionsSha256);
    return {
      key,
      variants,
      completeAba: group.length === expectedVariants.length &&
        variants.every((variant, index) => variant === expectedVariants[index]),
      fullFingerprints,
      sourceFingerprints,
      sameInitialDeal: group.length === expectedVariants.length &&
        fullFingerprints.every(value =>
          typeof value === 'string' && value.length > 0 && value === fullFingerprints[0]),
      sameSourceDeal: group.length === expectedVariants.length &&
        sourceFingerprints.every(value =>
          typeof value === 'string' && value.length > 0 && value === sourceFingerprints[0]),
      sameObserveControl
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
    firstStartUnverifiedRows: rows.filter(row => row.firstStartVerified !== true).length,
    articunoConfirmOffers: events.length,
    proposalAccepts: events.filter(event => event.proposalDecision === true).length,
    actualAccepts: events.filter(event => event.actualDecision === true).length,
    coldCrushGames: coldCrushRows.length,
    coldCrushAttacks: coldCrushRows.reduce((n, row) =>
      n + (row.articunoAudit?.coldCrushAttackEvents?.length ?? 0), 0),
    matchedDealGroups: matched.length,
    matchedInitialDeals: matched.filter(group => group.sameInitialDeal).length,
    matchedSourceDeals: matched.filter(group => group.sameSourceDeal).length,
    completeAbaGroups: matched.filter(group => group.completeAba).length,
    reproducibleObserveGroups: matched.filter(group => group.sameObserveControl).length,
    matchedDealChecks: matched,
    competitiveQualifiedGames: 0
  };
}

/**
 * Fail closed unless all pre-registered A/B/A deal and control checks hold.
 * @param {object} summary
 * @param {number} [expectedGroups]
 * @param {number} [expectedAttempts]
 * @returns {{passed:boolean,checks:object}}
 */
function panelAcceptance(summary, expectedGroups = SEEDS.length * 2,
  expectedAttempts = expectedGroups * VARIANTS.length) {
  const checks = {
    expectedAttemptCount: summary.attempted === expectedAttempts,
    noNativeErrors: summary.nativeErrors === 0,
    completeMatchedGroups: summary.matchedDealGroups === expectedGroups,
    fullPhysicalDealsMatch: summary.matchedInitialDeals === expectedGroups,
    sourceDealsMatch: summary.matchedSourceDeals === expectedGroups,
    completeAbaGroups: summary.completeAbaGroups === expectedGroups,
    observeControlsReproduce: summary.reproducibleObserveGroups === expectedGroups,
    firstPlayerVerifiedForEveryRow: summary.firstStartUnverifiedRows === 0
  };
  return {passed: Object.values(checks).every(Boolean), checks};
}

function run() {
  initializeCards();
  const decks = originals();
  assert.equal(decks.source.length, 60);
  assert.equal(decks.candidate.length, 60);
  const sourceCounts = sourceCountsFromManifest();
  assert.deepEqual(sourceCounts, {
    articunoCES31: 1, basicWater: 2, captureEnergy: 3
  });

  const envNames = [
    'AGENT8_ACTOR_QUICK_BALL_DEV',
    'AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
    'AGENT22_SPARSE_OWNER_BUNDLE_DEV'
  ];
  const previous = new Map(envNames.map(name => [name, process.env[name]]));
  try {
    for (const name of envNames) process.env[name] = 'false';
    const attempts = schedule();
    const rows = attempts.map(trial => runOne(trial, decks, sourceCounts));
    const summary = summarize(rows);
    const acceptance = panelAcceptance(summary);
    return {
      version: VERSION,
      nativePin: PIN,
      sourceRank: 3,
      sourceArchetype: 'Snorlax Stall',
      candidateReferenceRank: 1,
      candidateArchetype: 'Shadow Rider Calyrex',
      sourceDeckSha256: sha(decks.source),
      candidateDeckSha256: sha(decks.candidate),
      sourceDeckCounts: sourceCounts,
      seeds: [...SEEDS],
      candidateSeats: [0, 1],
      variants: VARIANTS,
      maxActionsPerMatch: ACTION_LIMIT,
      schedule: attempts,
      rows,
      summary,
      acceptance,
      limitations: [
        'The source rank3 and rank1 reference decks are unchanged authenticated original 60s.',
        'The A/B/A policy comparison uses the same seed, physical seats, engine, and general policy stack.',
        'Observe mode records the one-Water proposal while delegating the actual Confirm to the shared owner policy.',
        'Intervene mode accepts only exact Articuno-GX CES 31 hand-play prompts with one transferable Basic Water, unused GX, and at least the configured public Active Energy threshold.',
        'Capture Energy putting Articuno directly onto the Bench does not trigger Legendary Ascent and is not treated as a hand-play prompt.',
        'The default pinned bot and canonical actor policy remain limited; match outcomes are not competitive-strength evidence.',
        'All A1/B/A2 groups must share both physical-deal fingerprints; the two observe controls must reproduce their native traces.',
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
  if (!result.acceptance.passed) process.exitCode = 1;
}

module.exports = {
  VERSION, PIN, SEEDS, ACTION_LIMIT, VARIANTS,
  schedule, sourceCountsFromManifest, runWithPolicies, nextOpponentResponse,
  runOne, summarize, panelAcceptance, run
};
