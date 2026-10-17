'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {observeFirstTurn, summarizeTurnOrder} = require('./turn-order-evidence.cjs');
const {installToolJammerHook} = require('./tool-jammer-hook.cjs');
const {installGrandTreeFirstTurnHook} = require('./grand-tree-first-turn-hook.cjs');
const {installPrototypeSafeSimulatorHook} = require('./prototype-safe-simulator-hook.cjs');
const {installPostSuperAliasRepairHook} = require('./post-super-alias-repair-hook.cjs');
const {installMegatonBlowerHook} = require('./megaton-blower-hook.cjs');
const {assertValidPromptAction} = require('./prompt-integrity.cjs');
const {installForestSealSearchHook} = require('./forest-seal-search-hook.cjs');
const {installSupporterDecisionHook} = require('./supporter-decision-hook.cjs');
const {installGuzmaSelfSwitchGuard} = require('./guzma-self-switch-guard.cjs');
const {installDialgaBenchExposureGuard} = require('./dialga-bench-exposure-guard.cjs');
const {installLeleEntryAbilityLockHook} = require('./lele-entry-ability-lock-hook.cjs');
const {installRadiantGateLockHook} = require('./radiant-gate-lock-hook.cjs');
const {installEntryDrawLockHook} = require('./entry-draw-lock-hook.cjs');
const {installEldegossEntryLockHook} = require('./eldegoss-entry-lock-hook.cjs');
const {installMimikyuNonGxCopycatHook} = require('./copycat-compat.cjs');
const {installDeclaredCopyHistoryHook} = require('./copycat-declared-history-hook.cjs');
const {installPassClearsLastAttackHook} = require('./last-attack-pass-hook.cjs');
const {selectedCardsEvidence, selectedOptionEvidence} = require('./selected-cards-evidence.cjs');
const {decisionHandEvidence} = require('./decision-hand-evidence.cjs');
const {installSnorlaxRetreatStartHook} = require('./snorlax-retreat-start-hook.cjs');
const {installElectroRainDamageHook} = require('./electro-rain-damage-hook.cjs');
const {installRedeemableTicketPaperOrderHook} = require('./redeemable-ticket-paper-hook.cjs');
const {installHisuianHeavyBallPrizeShuffleHook} = require('./hisuian-heavy-ball-prize-hook.cjs');
const {installPendingEndTurnSwitchCleanup} = require('./pending-end-turn-switch-cleanup.cjs');
const {installApexPrizeWindowPolicy} = require('./apex-prize-headless-policy.cjs');
const {publicSnapshot, observeTerminalTransition, advanceActionLineage} = require('./terminal-transition.cjs');
const {publicBoardSnapshot} = require('./public-board-telemetry.cjs');
const {printedBasicEnergyAudit} = require('./printed-basic-energy-audit.cjs');
const {inspectTmEvolutionPass} = require('./tm-evolution-pass-evidence.cjs');
const {probeEvolutionAnnouncement} = require('./tm-evolution-announcement-probe.cjs');
const {probePassedAttackOptions, nextPassProbeBucket} = require('./pass-attack-announcement-probe.cjs');
const {withActiveOpeningPivot} = require('./active-opening-pivot.cjs');
const {withAttackBeforeRetreat} = require('./attack-retreat-order.cjs');
const {withCopycatApexTimelessPolicy} = require('./mimikyu-counter-policy.cjs');
const {copycatTurnStartSnapshot} = require('./copycat-turn-start-evidence.cjs');
const {retreatTransitionEvidence} = require('./retreat-transition-evidence.cjs');

/**
 * Reproducible, in-process Twinleaf experimentation.
 * This is research-owned glue, not a replacement for card/rules validation.
 *
 * IMPORTANT: This module runs one game at a time because it temporarily
 * controls process-global Math.random to seed upstream random effects.
 */
const serverRoot = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server');

/**
 * @param {string} relativePath Relative path beneath the compiled server output.
 * @returns {any} The compiled Twinleaf module.
 */
function engine(relativePath) {
  return require(path.join(serverRoot, 'output', relativePath));
}

/** Populate the exact sets used by the pinned server's normal startup. */
function initializeCards() {
  const { CardManager } = engine('game/cards/card-manager');
  const cardManager = CardManager.getInstance();
  if (cardManager.getAllCards().length > 0) {
    return cardManager;
  }
  const sets = engine('sets');
  const startup = fs.readFileSync(path.join(serverRoot, 'start.js'), 'utf8');
  const setNames = [...startup.matchAll(/^\s*cardManager\.defineSet\(sets\.(\w+)\)\s*;?/gm)]
    .map(match => match[1]);
  if (setNames.length === 0) {
    throw new Error('No sets identified in the pinned Twinleaf startup.');
  }
  for (const name of setNames) {
    if (!Array.isArray(sets[name])) {
      throw new Error('Startup refers to an unavailable set: ' + name);
    }
    cardManager.defineSet(sets[name]);
  }
  return cardManager;
}

/**
 * @param {number} seed Unsigned 32-bit match seed.
 * @returns {() => number} Pseudorandom sample in [0, 1).
 */
function seededRandom(seed) {
  let state = seed >>> 0;
  if (state === 0) state = 0x9e3779b9;
  return function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

/**
 * @param {number} length Size of the deck.
 * @param {() => number} random Seeded random source.
 * @returns {number[]} A uniform Fisher-Yates permutation.
 */
function deckPermutation(length, random) {
  const order = Array.from({ length }, (_, index) => index);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }
  return order;
}

/**
 * Hook the pinned Twinleaf bot's speculative Simulator to use fair seeded
 * random arbitration. This changes only the research process at runtime.
 * It does not edit the vendor submodule. Restore after each match.
 *
 * @returns {() => void} Restore upstream module and prototype references.
 */
function installFairBotHooks() {
  const simModule = engine('game/bots/simulator');
  const originalSimulator = simModule.Simulator;
  const { BotArbiter, BotFlipMode, BotShuffleMode } = engine('game/bots/bot-arbiter');
  const originalShuffle = BotArbiter.prototype.shuffle;

  BotArbiter.prototype.shuffle = function fairShuffle(cards) {
    return deckPermutation(cards.cards.length, Math.random);
  };

  simModule.Simulator = class FairSimulator extends originalSimulator {
    constructor(state, options = {}) {
      super(state, {
        flipMode: BotFlipMode.RANDOM,
        shuffleMode: BotShuffleMode.RANDOM,
        ...options
      });
    }
  };

  return function restore() {
    simModule.Simulator = originalSimulator;
    BotArbiter.prototype.shuffle = originalShuffle;
  };
}

/**
 * Run a synchronous bot decision with its own random stream. Upstream tactics
 * simulate candidate actions, including random prompts, before dispatching the
 * real action. Those speculative samples must not consume game-event samples.
 *
 * @param {{decodeNextAction: (state: any) => any}} bot
 * @param {any} state
 * @param {() => number} randomSource
 * @returns {any}
 */
function decodeWithPolicyRandom(bot, state, randomSource) {
  const previous = Math.random;
  Math.random = randomSource;
  try {
    return bot.decodeNextAction(state);
  } finally {
    Math.random = previous;
  }
}

/**
 * Separate repeatable decision streams for both seats. This does not promise
 * identical actual random outcomes after different card actions change the
 * sequence of real game events.
 *
 * @param {number} seed
 * @returns {[() => number, () => number]}
 */
function policyRandomStreams(seed) {
  return [
    seededRandom((seed ^ 0x6a09e667) >>> 0),
    seededRandom((seed ^ 0xbb67ae85) >>> 0)
  ];
}

/**
 * @typedef {object} MatchRequest
 * @property {string[]} deckA Fully resolved Twinleaf fullName strings, exactly 60.
 * @property {string[]} deckB Fully resolved Twinleaf fullName strings, exactly 60.
 * @property {number} seed Unsigned 32-bit random seed.
 * @property {number} [maxActions] Fail-safe bound on all user/bot actions.
 * @property {string} [label] Experimental label for machine-readable output.
 * @property {boolean} [strictPromptValidation] Opt-in pre-dispatch Prompt.validate gate.
 * @property {boolean} [forestSealSearchCorrection] Opt-in mandatory one-card Star Alchemy hook.
 * @property {boolean} [grandTreeFirstTurnCorrection] Opt-in printed first-turn Grand Tree evolution prohibition.
 * @property {boolean} [doubleDragonRecovery] Opt-in experimental legal dynamic-Energy attachment tactic.
 * @property {boolean} [templeUnlockRecovery] Opt-in attack-unlocking Marshadow response to Temple.
 * @property {boolean} [isolatePolicyRandomness] Use independent RNG streams for speculative bot decisions (experimental).
 * @property {boolean} [prototypeSafeSimulatorIsolation] Opt-in experimental detached speculative Cards/prototypes, not certified for competitive inference.
 * @property {boolean} [postSuperAliasRepairIsolation] Opt-in experimental source-graph reconciliation after the pinned Simulator constructor.
 * @property {boolean} [supporterDecisionCorrection] Opt-in, reversible correction for premature Supporter turn consumption.
 * @property {boolean} [guzmaSelfSwitchGuard] Opt-in rank-6 off-type self-switch counterfactual.
 * @property {boolean} [dialgaBenchExposureGuard] Opt-in rank-6 gust-target exposure counterfactual.
 * @property {boolean} [leleEntryAbilityLockCorrection] Opt-in correction for Tapu Lele-GX Bench-entry Ability locks.
 * @property {boolean} [radiantGateLockCorrection] Opt-in correction for Radiant Eternatus Bench-entry Ability locks.
 * @property {boolean} [entryDrawLockCorrection] Opt-in correction for Dedenne-GX and Crobat V Bench-entry draw Abilities under in-play-only locks.
 * @property {boolean} [eldegossEntryLockCorrection] Opt-in correction for Eldegoss V RCL Happy Match Bench-entry recovery under in-play-only locks.
 * @property {boolean} [mimikyuApexCopycatCompatibility] Opt-in non-GX Apex Dragon/Copycat copy-tag correction.
 * @property {boolean} [mimikyuApexTimelessPolicy] Opt-in exact public-state Copycat/Apex/Timeless decision policy.
 * @property {0|1} [mimikyuApexTimelessPolicySeat] Restrict Copycat counterpolicy to one physical seat.
 * @property {0|1} [mimikyuTurn27SetupSeat] Source-ranked, single-turn test of discard, Energy attachment and promotion into the Copycat response.
 * @property {0|1} [mimikyuExtraTurnShredSeat] Opt-in exact source turn28 Copycat/Apex/Shred counterfactual for one physical seat.
 * @property {boolean} [mimikyuDeclaredHistoryCorrection] Opt-in printed Copycat attack history after nested prompts.
 * @property {boolean} [regidragoDeclaredHistoryCorrection] Opt-in printed Apex Dragon attack history after nested prompts.
 * @property {boolean} [passClearsLastAttackCorrection] Opt-in clear stale preceding attack when a player passes.
 * @property {boolean} [snorlaxRetreatStartCorrection] Opt-in, reversible Block check on interactive retreat.
 * @property {boolean} [electroRainDamageCorrection] Opt-in printed Electro Rain attack damage and repeated-target correction.
 * @property {boolean} [redeemableTicketPaperOrderCorrection] Opt-in paper-rule Ticket top/new-Prize and bottom/old-Prize correction.
 * @property {boolean} [hisuianHeavyBallPrizeShuffleCorrection] Opt-in paper Prize-position shuffle for Hisuian Heavy Ball.
 * @property {boolean} [pendingEndTurnSwitchCleanupCorrection] Opt-in paper delayed-effect cleanup upon Player.switchPokemon Active-to-Bench movement.
 * @property {boolean} [apexSpreadPrizeWindowPolicy] Opt-in Regidrago Phantom Dive selection and six-counter nominal Prize planning.
 * @property {boolean} [shadowRiderEnergyPriority] Opt-in basic Psychic Energy priority against Active Iron Thorns.
 * @property {boolean} [shadowRiderEnergyAcrossField] Opt-in speculative Psychic priority regardless of opposing Active.
 * @property {boolean} [shadowRiderOpeningPivot] Opt-in counterfactual for setup Active choice with selected Shadow Rider V.
 * @property {boolean} [latiasAttackReadyAttachment] Opt-in rank10 source-state Latias Energy completion probe.
 * @property {boolean} [bunnelbyK0SafeEvolution] Opt-in printed-source-only TM Evolution choice without hidden-deck/Prize inspection.
 * @property {boolean} [attackBeforeRetreat] Opt-in policy-order sensitivity probe for AttackTactic and RetreatTactic.
 * @property {0|1} [attackBeforeRetreatSeat] Restrict that opt-in probe to one physical seat.
 * @property {boolean} [passHorizonAttack] Compare printed AttackAction against a simulated PassTurnAction at the same turn-end horizon (experimental).
 * @property {0|1} [passHorizonAttackSeat] Apply same-horizon attack scoring only to this physical seat.
 * @property {number} [passHorizonAttackTurn] Restrict the correction to one frozen global turn; other turns retain the original tactic.
 * @property {boolean} [captureDecisionTrace] Record ordered meaningful actions with post-action public counts.
 * @property {0|1} [captureCopycatTurnStartSeat] Opt-in candidate perspective resource snapshot once per own turn, taken before selecting the first action.
 * @property {boolean} [captureAttackPassProbes] Opt-in first eight post-choice Pass attack-announcement probes; only archived when capturing decision trace.
 */

/**
 * Simulate both seats with upstream SimpleTacticsAi, resolving setup shuffles
 * and coin flips from a seeded source. Returning a finished game says nothing
 * about policy competence or whether all card interactions are implemented.
 *
 * @param {MatchRequest} request Input deck IDs and seed.
 * @returns {object} Deterministic bounded match summary with trace counts and deck hashes.
 */
function runMatch(request) {
  if (!Array.isArray(request.deckA) || request.deckA.length !== 60 ||
      !Array.isArray(request.deckB) || request.deckB.length !== 60) {
    throw new Error('Both decks must contain 60 concrete Twinleaf card fullNames.');
  }
  if (!Number.isInteger(request.seed) || request.seed < 0 || request.seed > 0xffffffff) {
    throw new Error('seed must be an unsigned 32-bit integer.');
  }
  const random = seededRandom(request.seed);
  const policyRandomBySeat = request.isolatePolicyRandomness === true ?
    policyRandomStreams(request.seed) : null;
  const originalRandom = Math.random;
  Math.random = random;
  let restoreBotHooks;
  let restorePrototypeSafeSimulatorHook;
  let restorePostSuperAliasRepairHook;
  let restoreToolJammerHook;
  let restoreMegatonBlowerHook;
  let restoreForestSealSearchHook;
  let restoreGrandTreeFirstTurnHook;
  let restoreSupporterDecisionHook;
  let restoreGuzmaSelfSwitchGuard;
  let restoreDialgaBenchExposureGuard;
  let restoreLeleEntryAbilityLockHook;
  let restoreRadiantGateLockHook;
  let restoreEntryDrawLockHook;
  let restoreEldegossEntryLockHook;
  let restoreSnorlaxRetreatStartHook;
  let restoreElectroRainDamageHook;
  let restoreRedeemableTicketPaperOrderHook;
  let restoreHisuianHeavyBallPrizeShuffleHook;
  let pendingEndTurnSwitchCleanupHook;
  let restoreApexPrizeWindowPolicy;
  let restoreMimikyuNonGxCopycatHook;
  let restoreCopyDeclaredHistoryHook;
  let restorePassClearsLastAttackHook;
  try {
    if (request.prototypeSafeSimulatorIsolation === true &&
        request.postSuperAliasRepairIsolation === true) {
      throw new Error('Choose only one experimental speculative Simulator profile');
    }
    if (request.mimikyuApexTimelessPolicySeat !== undefined &&
        (request.mimikyuApexTimelessPolicy !== true ||
          ![0, 1].includes(request.mimikyuApexTimelessPolicySeat))) {
      throw new Error('Counterpolicy seat requires enabled Copycat counterpolicy');
    }
    if (request.mimikyuTurn27SetupSeat !== undefined &&
        (request.mimikyuApexTimelessPolicy !== true ||
          request.mimikyuApexTimelessPolicySeat !== request.mimikyuTurn27SetupSeat ||
          ![0, 1].includes(request.mimikyuTurn27SetupSeat))) {
      throw new Error('Source-window Copycat setup requires matching candidate-only counterpolicy seat');
    }
    if (request.mimikyuExtraTurnShredSeat !== undefined &&
        (![0, 1].includes(request.mimikyuExtraTurnShredSeat) ||
          request.mimikyuTurn27SetupSeat !== request.mimikyuExtraTurnShredSeat ||
          request.mimikyuApexTimelessPolicySeat !== request.mimikyuExtraTurnShredSeat)) {
      throw new Error('Turn28 Shred fork requires the exact turn27 Copycat setup on the same physical seat');
    }
    if (request.captureCopycatTurnStartSeat !== undefined &&
        ![0, 1].includes(request.captureCopycatTurnStartSeat)) {
      throw new Error('Copycat turn-start evidence seat must be physical seat 0 or 1');
    }
    if (request.mimikyuApexTimelessPolicy === true &&
        !(request.mimikyuApexCopycatCompatibility === true &&
          request.mimikyuDeclaredHistoryCorrection === true &&
          request.regidragoDeclaredHistoryCorrection === true &&
          request.passClearsLastAttackCorrection === true)) {
      throw new Error('Copycat counterpolicy requires all four rule-history corrections');
    }
    initializeCards();
    if (request.redeemableTicketPaperOrderCorrection === true) {
      restoreRedeemableTicketPaperOrderHook = installRedeemableTicketPaperOrderHook();
    }
    if (request.hisuianHeavyBallPrizeShuffleCorrection === true) {
      restoreHisuianHeavyBallPrizeShuffleHook = installHisuianHeavyBallPrizeShuffleHook();
    }
    if (request.mimikyuApexCopycatCompatibility === true) {
      restoreMimikyuNonGxCopycatHook = installMimikyuNonGxCopycatHook();
    }
    if (request.mimikyuDeclaredHistoryCorrection === true ||
        request.regidragoDeclaredHistoryCorrection === true) {
      restoreCopyDeclaredHistoryHook = installDeclaredCopyHistoryHook({
        mimikyu: request.mimikyuDeclaredHistoryCorrection === true,
        regidrago: request.regidragoDeclaredHistoryCorrection === true
      });
    }
    if (request.passClearsLastAttackCorrection === true) {
      restorePassClearsLastAttackHook = installPassClearsLastAttackHook();
    }
    if (request.forestSealSearchCorrection === true) {
      restoreForestSealSearchHook = installForestSealSearchHook();
    }
    if (request.grandTreeFirstTurnCorrection === true) {
      restoreGrandTreeFirstTurnHook = installGrandTreeFirstTurnHook();
    }
    restoreToolJammerHook = installToolJammerHook();
    if (request.snorlaxRetreatStartCorrection === true) {
      restoreSnorlaxRetreatStartHook = installSnorlaxRetreatStartHook();
    }
    if (request.electroRainDamageCorrection === true) {
      restoreElectroRainDamageHook = installElectroRainDamageHook();
    }
    restoreMegatonBlowerHook = installMegatonBlowerHook();
    const { registerPlayersCeremony, PLAYERS_CEREMONY_PRINT } = require('./card-patches.cjs');
    if (request.deckA.includes(PLAYERS_CEREMONY_PRINT) || request.deckB.includes(PLAYERS_CEREMONY_PRINT)) {
      registerPlayersCeremony();
    }
    restoreBotHooks = installFairBotHooks();
    if (request.prototypeSafeSimulatorIsolation === true) {
      restorePrototypeSafeSimulatorHook = installPrototypeSafeSimulatorHook();
    }
    if (request.postSuperAliasRepairIsolation === true) {
      restorePostSuperAliasRepairHook = installPostSuperAliasRepairHook();
    }
    if (request.supporterDecisionCorrection === true) {
      restoreSupporterDecisionHook = installSupporterDecisionHook();
    }
    if (request.guzmaSelfSwitchGuard === true) {
      restoreGuzmaSelfSwitchGuard = installGuzmaSelfSwitchGuard();
    }
    if (request.dialgaBenchExposureGuard === true) {
      restoreDialgaBenchExposureGuard = installDialgaBenchExposureGuard();
    }
    if (request.leleEntryAbilityLockCorrection === true) {
      restoreLeleEntryAbilityLockHook = installLeleEntryAbilityLockHook();
    }
    if (request.radiantGateLockCorrection === true) {
      restoreRadiantGateLockHook = installRadiantGateLockHook();
    }
    if (request.entryDrawLockCorrection === true) {
      restoreEntryDrawLockHook = installEntryDrawLockHook();
    }
    if (request.eldegossEntryLockCorrection === true) {
      restoreEldegossEntryLockHook = installEldegossEntryLockHook();
    }
    const { Store } = engine('game/store/store');
    if (request.pendingEndTurnSwitchCleanupCorrection === true) {
      const {Player}=engine('game/store/state/player');
      pendingEndTurnSwitchCleanupHook=installPendingEndTurnSwitchCleanup({Store,Player});
    }
    const { AddPlayerAction } = engine('game/store/actions/add-player-action');
    const { ResolvePromptAction } = engine('game/store/actions/resolve-prompt-action');
    const { CoinFlipPrompt } = engine('game/store/prompts/coin-flip-prompt');
    const { ShuffleDeckPrompt } = engine('game/store/prompts/shuffle-prompt');
    const { GamePhase } = engine('game/store/state/state');
    const { Format, CardType } = engine('game/store/card/card-types');
    const { GameSettings } = engine('game/core/game-settings');
    const { SimpleTacticsAi } = engine('simple-bot/simple-tactics-ai');
    if (request.apexSpreadPrizeWindowPolicy === true) {
      restoreApexPrizeWindowPolicy = installApexPrizeWindowPolicy();
    }
    const definitions = engine('simple-bot/simple-bot-definitions');
    const { BotFlipMode, BotShuffleMode } = engine('game/bots/bot-arbiter');

    const baseOptions = {
      tactics: definitions.allSimpleTactics,
      promptResolvers: definitions.allPromptResolvers,
      scores: definitions.defaultStateScores,
      arbiter: { flipMode: BotFlipMode.RANDOM, shuffleMode: BotShuffleMode.RANDOM }
    };
    let options = request.doubleDragonRecovery === true ?
      require('./dde-attach-tactic.cjs').withDoubleDragonRecovery(baseOptions) : baseOptions;
    if (request.templeUnlockRecovery === true) options = require('./temple-unlock-tactic.cjs').withTempleUnlockRecovery(options);
    if (request.shadowRiderOpeningPivot === true) {
      options = withActiveOpeningPivot(options, {
        ChooseCardsPromptResolver: engine('simple-bot/prompt-resolver/choose-cards-prompt-resolver').ChooseCardsPromptResolver,
        ChooseCardsPrompt: engine('game/store/prompts/choose-cards-prompt').ChooseCardsPrompt,
        ResolvePromptAction: engine('game/store/actions/resolve-prompt-action').ResolvePromptAction,
        GameMessage: engine('game/game-message').GameMessage
      });
    }
    if (request.attackBeforeRetreatSeat !== undefined &&
        (!request.attackBeforeRetreat || ![0, 1].includes(request.attackBeforeRetreatSeat))) {
      throw new Error('Seat-specific attack preference requires an active valid policy flag.');
    }
    if (request.passHorizonAttackSeat !== undefined &&
        (request.passHorizonAttack !== true ||
          ![0, 1].includes(request.passHorizonAttackSeat))) {
      throw new Error('Same-horizon attack seat requires an enabled policy flag.');
    }
    if (request.passHorizonAttackTurn !== undefined &&
        (request.passHorizonAttack !== true ||
          !Number.isSafeInteger(request.passHorizonAttackTurn) ||
          request.passHorizonAttackTurn < 1)) {
      throw new Error('Same-horizon target turn needs enabled policy and positive integer.');
    }
    if (request.shadowRiderEnergyPriority === true &&
        request.shadowRiderEnergyAcrossField === true) {
      throw new Error('Choose either the lock-specific or across-field Psychic priority.');
    }
    if (request.shadowRiderEnergyPriority === true ||
        request.shadowRiderEnergyAcrossField === true) {
      options = require('./shadow-rider-psychic-attach.cjs').withShadowRiderPsychicPriority(
        options, {allOpponents: request.shadowRiderEnergyAcrossField === true});
    }
    if (request.latiasAttackReadyAttachment === true) {
      options = require('./latias-attack-ready-attach.cjs')
        .withLatiasAttackReadyAttachment(options);
    }
    const settings = new GameSettings();
    settings.format = Format.EXPANDED;
    settings.recordingEnabled = false;
    settings.rules.firstTurnDrawCard = true;
    settings.rules.firstTurnUseSupporter = false;
    settings.rules.attackFirstTurn = false;
    let actualFirstTurn = null;
    const store = new Store({
      onStateChange(state) {
        if (actualFirstTurn === null) {
          actualFirstTurn = observeFirstTurn(state);
        }
      }
    });
    store.state.gameSettings = settings;
    store.state.rules = settings.rules;
    const attackPreferenceOptions = request.attackBeforeRetreat === true ?
      withAttackBeforeRetreat(options, {
        AttackTactic: engine('simple-bot/simple-tactics/attack-tactic').AttackTactic,
        RetreatTactic: engine('simple-bot/simple-tactics/retreat-tactic').RetreatTactic
      }) : null;
    const optionsBySeat = [0, 1].map(seat => {
      let configured = attackPreferenceOptions &&
        (request.attackBeforeRetreatSeat === undefined ||
          request.attackBeforeRetreatSeat === seat) ? attackPreferenceOptions : options;
      if (request.passHorizonAttack === true &&
          (request.passHorizonAttackSeat === undefined ||
            request.passHorizonAttackSeat === seat)) {
        configured = require('./attack-pass-horizon-policy.cjs')
          .withPassHorizonAttack(configured,
            {targetTurn:request.passHorizonAttackTurn??null});
      }
      if (request.bunnelbyK0SafeEvolution === true) {
        const knownPrints = seat === 0 ? request.deckA : request.deckB;
        const manager = initializeCards();
        configured = require('./bunnelby-evolution-policy.cjs')
          .withBunnelbyEvolutionLine(configured, {
            sourceCards: knownPrints.map(name => manager.getCardByName(name))
          });
      }
      if (request.mimikyuApexTimelessPolicy === true &&
          (request.mimikyuApexTimelessPolicySeat === undefined ||
            request.mimikyuApexTimelessPolicySeat === seat)) {
        configured = withCopycatApexTimelessPolicy(configured);
      }
      if (request.mimikyuTurn27SetupSeat === seat) {
        configured = require('./mimikyu-source-turn27-setup.cjs')
          .withCopycatTurn27Setup(configured);
      }
      if (request.mimikyuExtraTurnShredSeat === seat) {
        configured = require('./mimikyu-extra-turn-shred-policy.cjs')
          .withCopycatExtraTurnShredPolicy(configured);
      }
      return configured;
    });
    const seats = [
      new SimpleTacticsAi({ id: 101 }, optionsBySeat[0], request.deckA),
      new SimpleTacticsAi({ id: 202 }, optionsBySeat[1], request.deckB)
    ];
    store.dispatch(new AddPlayerAction(101, 'research-A', request.deckA));
    if (store.state.phase === GamePhase.FINISHED) {
      throw new Error('Player A failed Twinleaf deck validation.');
    }
    store.dispatch(new AddPlayerAction(202, 'research-B', request.deckB));
    if (store.state.phase === GamePhase.FINISHED) {
      throw new Error('Player B failed Twinleaf deck validation.');
    }

    const maxActions = request.maxActions === undefined ? 3000 : request.maxActions;
    if (!Number.isInteger(maxActions) || maxActions < 1) {
      throw new Error('maxActions must be a positive integer.');
    }
    let actions = 0;
    const actionCounts = {};
    const actionsBySeat = [{}, {}];
    const cardsPlayedBySeat = [{}, {}];
    const attackTrace = [];
    const abilityTrace = [];
    const decisionTrace = request.captureDecisionTrace === true ? [] : null;
    const copycatTurnStartEvidence = request.captureCopycatTurnStartSeat === undefined ?
      null : [];
    let lastCopycatTurnCaptured = null;
    let attackPassProbeCount = 0;
    const attackPassProbeBuckets = {printed: 0, tool: 0};
    let terminalTransition = null;
    let actionLineage = null;
    while (store.state.phase !== GamePhase.FINISHED && actions < maxActions) {
      const state = store.state;
      const pending = state.prompts.find(prompt => prompt.result === undefined);
      if (copycatTurnStartEvidence && !pending &&
          state.phase === GamePhase.PLAYER_TURN &&
          state.activePlayer === request.captureCopycatTurnStartSeat &&
          lastCopycatTurnCaptured !== state.turn) {
        copycatTurnStartEvidence.push(copycatTurnStartSnapshot(
          state, request.captureCopycatTurnStartSeat));
        lastCopycatTurnCaptured = state.turn;
      }
      let action;
      if (pending instanceof ShuffleDeckPrompt) {
        const ownerId = pending.getPerspectivePlayerId();
        const owner = state.players.find(player => player.id === ownerId);
        if (!owner) throw new Error('Shuffle has no deck owner.');
        action = new ResolvePromptAction(pending.id, deckPermutation(owner.deck.cards.length, random));
      } else if (pending instanceof CoinFlipPrompt) {
        action = new ResolvePromptAction(pending.id, random() < 0.5);
      } else if (pending) {
        const seat = state.players.findIndex(player => player.id === pending.playerId);
        if (seat === -1) throw new Error('Unknown prompt player: ' + pending.playerId);
        action = policyRandomBySeat ?
          decodeWithPolicyRandom(seats[seat], state, policyRandomBySeat[seat]) :
          seats[seat].decodeNextAction(state);
        if (!action) {
          throw new Error('Policy cannot resolve prompt: ' + pending.constructor.name);
        }
      } else {
        if (state.phase !== GamePhase.PLAYER_TURN) {
          throw new Error('Unhandled game phase ' + state.phase);
        }
        action = policyRandomBySeat ?
          decodeWithPolicyRandom(seats[state.activePlayer], state,
            policyRandomBySeat[state.activePlayer]) :
          seats[state.activePlayer].decodeNextAction(state);
        if (!action) {
          throw new Error('Policy failed to generate a turn action.');
        }
      }
      if (request.strictPromptValidation === true) {
        assertValidPromptAction(state, action);
      }
      const actionName = action.constructor.name;
      const turnBefore = state.turn;
      const actingId = pending ? pending.playerId : (action.clientId ?? action.id);
      const seat = state.players.findIndex(player => player.id === actingId);
      actionLineage = advanceActionLineage(actionLineage, {
        actionOrdinal: actions, name: actionName, playerSlot: seat,
        pendingPrompt: pending ? pending.constructor.name : null
      });
      const playedCard = actionName === 'PlayCardAction' && seat >= 0 ?
        state.players[seat].hand.cards[action.handIndex]?.name : undefined;
      const abilityInfo = actionName === 'UseAbilityAction' && seat >= 0 ? {
        turn: state.turn, seat, name: action.name
      } : null;
      const selectionInfo = decisionTrace ? selectedCardsEvidence(pending, action, state) : null;
      const optionInfo = decisionTrace ? selectedOptionEvidence(pending, action) : null;
      const decisionHandBefore = decisionTrace && seat >= 0 ?
        decisionHandEvidence(state, seat) : null;
      const attackInfo = actionName === 'AttackAction' && seat >= 0 ? {
        turn: state.turn, seat,
        activePokemon: state.players[seat].active.getPokemonCard()?.name || '',
        attack: action.name,
        prizeCountBefore: state.players.map(player => player.prizes.filter(prize => prize.cards.length > 0).length)
      } : undefined;
      const publicBeforeDispatch = publicSnapshot(state);
      const publicBoardBeforePass = decisionTrace && actionName === 'PassTurnAction' ?
        publicBoardSnapshot(state) : null;
      const publicBoardBeforeRetreat = decisionTrace && actionName === 'RetreatAction' ?
        publicBoardSnapshot(state) : null;
      const printedBasicEnergyBeforePass = publicBoardBeforePass && seat >= 0 ?
        printedBasicEnergyAudit(state.players[seat].active, CardType) : null;
      // Observational K1-sensitive data collected only AFTER the bot chose Pass.
      // Never insert remaining-deck target details into the bot's state or action.
      const tmEvolutionBeforePass = publicBoardBeforePass && seat >= 0 ?
        inspectTmEvolutionPass(state.players[seat]) : null;
      const tmEvolutionAnnouncementProbe = tmEvolutionBeforePass ?
        probeEvolutionAnnouncement(state, state.players[seat].id) : null;
      let attackPassProbe = null;
      if (decisionTrace && request.captureAttackPassProbes === true &&
          actionName === 'PassTurnAction' && seat >= 0 && attackPassProbeCount < 8) {
        const bucket = nextPassProbeBucket(state.players[seat], attackPassProbeBuckets);
        if (bucket) {
          attackPassProbeBuckets[bucket]++;
          attackPassProbeCount++;
          try {
            attackPassProbe = probePassedAttackOptions(state, state.players[seat].id);
          } catch (error) {
            attackPassProbe = {
              evidenceType: 'post-choice-cloned-attack-announcements-v1',
              auditError: String(error?.message || error),
              scope: 'Observation failed without changing the selected policy action.'
            };
          }
        }
      }
      try {
        store.dispatch(action);
      } catch (error) {
        throw new Error('Twinleaf dispatch failed after ' + actions + ' actions (' +
          action.constructor.name + '): ' + error.message, { cause: error });
      }
      const retreatTransition = publicBoardBeforeRetreat ?
        retreatTransitionEvidence(publicBoardBeforeRetreat,
          publicBoardSnapshot(store.state), seat, action.benchIndex) : null;
      const observedTerminal = observeTerminalTransition(
        publicBeforeDispatch, publicSnapshot(store.state),
        {name: actionName, playerSlot: seat,
          pendingPrompt: pending ? pending.constructor.name : null},
        GamePhase.FINISHED
      );
      if (observedTerminal) terminalTransition = {
        ...observedTerminal, actionLineage
      };
      actionCounts[actionName] = (actionCounts[actionName] || 0) + 1;
      if (seat >= 0) {
        actionsBySeat[seat][actionName] = (actionsBySeat[seat][actionName] || 0) + 1;
        if (playedCard) {
          cardsPlayedBySeat[seat][playedCard] = (cardsPlayedBySeat[seat][playedCard] || 0) + 1;
        }
      }
      if (decisionTrace && (playedCard || abilityInfo || attackInfo || selectionInfo || optionInfo ||
          ['PassTurnAction', 'RetreatAction', 'UseStadiumAction'].includes(actionName))) {
        decisionTrace.push({
          actionOrdinal: actions, turnBefore, turnAfter: store.state.turn,
          playerSlot: seat, action: actionName,
          ...(playedCard ? { card: playedCard } : {}),
          ...(abilityInfo ? { ability: abilityInfo.name } : {}),
          ...(selectionInfo ? { cardSelection: selectionInfo } : {}),
          ...(optionInfo ? { optionSelection: optionInfo } : {}),
          ...(decisionHandBefore ? { decisionHandBefore } : {}),
          ...(publicBoardBeforePass ? { publicBoardBeforePass } : {}),
          ...(retreatTransition ? { retreatTransition } : {}),
          ...(printedBasicEnergyBeforePass ? { printedBasicEnergyBeforePass } : {}),
          ...(tmEvolutionBeforePass ? { tmEvolutionBeforePass } : {}),
          ...(tmEvolutionAnnouncementProbe ? { tmEvolutionAnnouncementProbe } : {}),
          ...(attackPassProbe ? { attackPassProbe } : {}),
          ...(attackInfo ? { attack: attackInfo.attack,
            attacker: attackInfo.activePokemon } : {}),
          prizesAfter: store.state.players.map(player =>
            player.prizes.filter(prize => prize.cards.length > 0).length),
          decksAfter: store.state.players.map(player => player.deck.cards.length)
        });
      }
      if (abilityInfo) abilityTrace.push(abilityInfo);
      if (attackInfo) {
        attackInfo.prizeCountAfter = store.state.players.map(player =>
          player.prizes.filter(prize => prize.cards.length > 0).length);
        attackTrace.push(attackInfo);
      }
      actions += 1;
    }
    const state = store.state;
    return {
      label: request.label || '',
      seed: request.seed,
      actions,
      turns: state.turn,
      ...summarizeTurnOrder(actualFirstTurn, state.logs),
      finished: state.phase === GamePhase.FINISHED,
      endReason: state.phase === GamePhase.FINISHED ? 'engine-game-end' : 'action-limit',
      winner: state.winner,
      actionCounts,
      actionsBySeat,
      cardsPlayedBySeat,
      attackTrace,
      abilityTrace,
      decisionTrace,
      ...(copycatTurnStartEvidence ? {copycatTurnStartEvidence} : {}),
      attackPassProbeCount,
      attackPassProbeBuckets,
      terminalTransition,
      finalState: state.players.map(player => ({
        deckRemaining: player.deck.cards.length,
        handSize: player.hand.cards.length,
        activePokemon: player.active.getPokemonCard()?.name || '',
        benchedPokemon: player.bench.map(bench => bench.getPokemonCard()?.name).filter(Boolean)
      })),
      deckHashes: [request.deckA, request.deckB].map(deck =>
        crypto.createHash('sha256').update(JSON.stringify(deck)).digest('hex')),
      rules: {
        format: 'EXPANDED',
        firstTurnDrawCard: settings.rules.firstTurnDrawCard,
        firstTurnUseSupporter: settings.rules.firstTurnUseSupporter,
        attackFirstTurn: settings.rules.attackFirstTurn
      },
      prizesRemaining: state.players.map(player => player.prizes.filter(prize => prize.cards.length > 0).length),
      phase: state.phase,
      promptValidationMode: request.strictPromptValidation === true ?
        'predispatch-prompt-validate' : 'upstream-unchecked',
      forestSealSearchCorrection: request.forestSealSearchCorrection === true,
      grandTreeFirstTurnCorrection: request.grandTreeFirstTurnCorrection === true,
      doubleDragonRecovery: request.doubleDragonRecovery === true,
      templeUnlockRecovery: request.templeUnlockRecovery === true,
      supporterDecisionCorrection: request.supporterDecisionCorrection === true,
      guzmaSelfSwitchGuard: request.guzmaSelfSwitchGuard === true,
      dialgaBenchExposureGuard: request.dialgaBenchExposureGuard === true,
      leleEntryAbilityLockCorrection: request.leleEntryAbilityLockCorrection === true,
      radiantGateLockCorrection: request.radiantGateLockCorrection === true,
      entryDrawLockCorrection: request.entryDrawLockCorrection === true,
      eldegossEntryLockCorrection: request.eldegossEntryLockCorrection === true,
      mimikyuApexCopycatCompatibility: request.mimikyuApexCopycatCompatibility === true,
      mimikyuApexTimelessPolicy: request.mimikyuApexTimelessPolicy === true,
      mimikyuApexTimelessPolicySeat: request.mimikyuApexTimelessPolicySeat ?? null,
      mimikyuTurn27SetupSeat: request.mimikyuTurn27SetupSeat ?? null,
      mimikyuExtraTurnShredSeat: request.mimikyuExtraTurnShredSeat ?? null,
      mimikyuDeclaredHistoryCorrection: request.mimikyuDeclaredHistoryCorrection === true,
      regidragoDeclaredHistoryCorrection: request.regidragoDeclaredHistoryCorrection === true,
      passClearsLastAttackCorrection: request.passClearsLastAttackCorrection === true,
      snorlaxRetreatStartCorrection: request.snorlaxRetreatStartCorrection === true,
      electroRainDamageCorrection: request.electroRainDamageCorrection === true,
      redeemableTicketPaperOrderCorrection: request.redeemableTicketPaperOrderCorrection === true,
      ...(request.pendingEndTurnSwitchCleanupCorrection === true ? {
        pendingEndTurnSwitchCleanupCorrection:true,
        pendingEndTurnSwitchCleanupEvidence:pendingEndTurnSwitchCleanupHook.evidence()
      } : {}),
      ...(request.apexSpreadPrizeWindowPolicy === true ? {
        apexSpreadPrizeWindowPolicy:true
      } : {}),
      shadowRiderEnergyPriority: request.shadowRiderEnergyPriority === true,
      shadowRiderEnergyAcrossField: request.shadowRiderEnergyAcrossField === true,
      shadowRiderOpeningPivot: request.shadowRiderOpeningPivot === true,
      latiasAttackReadyAttachment: request.latiasAttackReadyAttachment === true,
      bunnelbyK0SafeEvolution: request.bunnelbyK0SafeEvolution === true,
      attackBeforeRetreat: request.attackBeforeRetreat === true,
      attackBeforeRetreatSeat: request.attackBeforeRetreatSeat ?? null,
      policy: (request.doubleDragonRecovery === true ?
        'Twinleaf SimpleTacticsAi/defaultStateScores+DoubleDragonAttachTactic-v3' :
        'Twinleaf SimpleTacticsAi/defaultStateScores') +
        (request.supporterDecisionCorrection === true ? '+SupporterDecisionGuard-v1' : '') +
        (request.guzmaSelfSwitchGuard === true ? '+GuzmaSelfSwitchGuard-v1' : '') +
        (request.dialgaBenchExposureGuard === true ? '+DialgaBenchExposureGuard-v1' : '') +
        (request.templeUnlockRecovery === true ? '+TempleUnlockTactic-v1' : '') +
        (request.snorlaxRetreatStartCorrection === true ? '+SnorlaxBlockStartGate-v1' : '') +
        (request.electroRainDamageCorrection === true ? '+ElectroRainDamage-v1' : '') +
        (request.redeemableTicketPaperOrderCorrection === true ? '+TicketPaperPrizeOrder-v1' : '') +
        (request.pendingEndTurnSwitchCleanupCorrection === true ? '+PendingEndTurnSwitchPaper-v1' : '') +
        (request.apexSpreadPrizeWindowPolicy === true ? '+ApexSpreadPrizeWindow-v1' : '') +
        (request.shadowRiderEnergyPriority === true ? '+ShadowRiderPsychicAttachPriority-v1' : '') +
        (request.shadowRiderEnergyAcrossField === true ? '+ShadowRiderPsychicAttachAcrossField-v1' : '') +
        (request.shadowRiderOpeningPivot === true ? '+SelectedShadowRiderSetupActive-v1' : '') +
        (request.latiasAttackReadyAttachment === true ? '+LatiasAttackReadyAttachment-v1' : '') +
        (request.mimikyuExtraTurnShredSeat !== undefined ? '+MimikyuExtraTurnShred-v1' : '') +
        (request.bunnelbyK0SafeEvolution === true ? '+BunnelbySourceK0PossibleEvolution-v1' : '') +
        (request.attackBeforeRetreat === true ?
          '+AttackBeforeRetreatTactic-v1@' +
            (request.attackBeforeRetreatSeat === undefined ?
              'both' : 'seat' + request.attackBeforeRetreatSeat) : '') +
        (request.leleEntryAbilityLockCorrection === true ? '+LeleEntryAbilityLockGuard-v1' : '') +
        (request.radiantGateLockCorrection === true ? '+RadiantGateLockGuard-v1' : '') +
        (request.entryDrawLockCorrection === true ? '+EntryDrawLockGuard-v1' : '') +
        (request.eldegossEntryLockCorrection === true ? '+EldegossEntryLockGuard-v1' : '') +
        (request.mimikyuApexCopycatCompatibility === true ? '+MimikyuNonGXCopyApex-v1' : '') +
        (request.mimikyuDeclaredHistoryCorrection === true ? '+MimikyuDeclaredHistory-v1' : '') +
        (request.regidragoDeclaredHistoryCorrection === true ? '+RegidragoDeclaredHistory-v1' : '') +
        (request.mimikyuApexTimelessPolicy === true ? '+MimikyuApexTimelessCounterPolicy-v1' : '') +
        (request.mimikyuTurn27SetupSeat !== undefined ?
          '+SourceMimikyuTurn27Setup-v1@seat' + request.mimikyuTurn27SetupSeat : '') +
        (request.passClearsLastAttackCorrection === true ? '+PassClearsLastAttack-v1' : '') +
        (request.prototypeSafeSimulatorIsolation === true ?
          '+PrototypeSafeSimulatorIsolation-experimental-v1' : '') +
        (request.postSuperAliasRepairIsolation === true ?
          '+PostSuperAliasRepairIsolation-experimental-v2' : ''),
      prototypeSafeSimulatorIsolation: request.prototypeSafeSimulatorIsolation === true,
      postSuperAliasRepairIsolation: request.postSuperAliasRepairIsolation === true,
      policyRandomIsolation: request.isolatePolicyRandomness === true,
      randomnessProtocol: request.isolatePolicyRandomness === true ?
        'separate-game-and-per-seat-policy-prng-v1' : 'legacy-shared-prng',
      engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05'
    };
  } finally {
    if (restorePassClearsLastAttackHook) restorePassClearsLastAttackHook();
    if (restoreCopyDeclaredHistoryHook) restoreCopyDeclaredHistoryHook();
    if (restoreMimikyuNonGxCopycatHook) restoreMimikyuNonGxCopycatHook();
    if (restoreEldegossEntryLockHook) restoreEldegossEntryLockHook();
    if (restoreEntryDrawLockHook) restoreEntryDrawLockHook();
    if (restoreRadiantGateLockHook) restoreRadiantGateLockHook();
    if (restoreLeleEntryAbilityLockHook) restoreLeleEntryAbilityLockHook();
    if (restoreSnorlaxRetreatStartHook) restoreSnorlaxRetreatStartHook();
    if (restoreElectroRainDamageHook) restoreElectroRainDamageHook();
    if (restoreHisuianHeavyBallPrizeShuffleHook) restoreHisuianHeavyBallPrizeShuffleHook();
    if (pendingEndTurnSwitchCleanupHook) pendingEndTurnSwitchCleanupHook.restore();
    if (restoreApexPrizeWindowPolicy) restoreApexPrizeWindowPolicy();
    if (restoreRedeemableTicketPaperOrderHook) restoreRedeemableTicketPaperOrderHook();
    if (restoreDialgaBenchExposureGuard) restoreDialgaBenchExposureGuard();
    if (restoreGuzmaSelfSwitchGuard) restoreGuzmaSelfSwitchGuard();
    if (restoreSupporterDecisionHook) restoreSupporterDecisionHook();
    if (restorePostSuperAliasRepairHook) restorePostSuperAliasRepairHook();
    if (restorePrototypeSafeSimulatorHook) restorePrototypeSafeSimulatorHook();
    if (restoreBotHooks) restoreBotHooks();
    if (restoreForestSealSearchHook) restoreForestSealSearchHook();
    if (restoreGrandTreeFirstTurnHook) restoreGrandTreeFirstTurnHook();
    if (restoreMegatonBlowerHook) restoreMegatonBlowerHook();
    if (restoreToolJammerHook) restoreToolJammerHook();
    Math.random = originalRandom;
  }
}

/** @returns {string[]} Curated upstream smoke-test deck, not an Aichi list. */
function upstreamSmokeDeck() {
  const { HEDRICK_DRAGAPULT_WORLDS_2026 } =
    engine('advanced-bot/knowledge/decks/hedrick-dragapult-worlds-2026');
  return HEDRICK_DRAGAPULT_WORLDS_2026.slice();
}

module.exports = { runMatch, initializeCards, seededRandom, deckPermutation,
  upstreamSmokeDeck, installFairBotHooks, decodeWithPolicyRandom, policyRandomStreams };
