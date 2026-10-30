'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {observeFirstTurn, summarizeTurnOrder} = require('./turn-order-evidence.cjs');
const {playerPlayLockVeto,visiblePlayLockGuardSeat}=
  require('./player-play-lock-veto.cjs');
const {createInitialSourceDealObserver}=
  require('../evaluation/source-physical-deal-fingerprint.cjs');
const {captureNativeResetPrestate}=
  require('../evaluation/agent3-native-reset-prestate.cjs');
const {installToolJammerHook} = require('./tool-jammer-hook.cjs');
const {installGrandTreeFirstTurnHook} = require('./grand-tree-first-turn-hook.cjs');
const {installPrototypeSafeSimulatorHook} = require('./prototype-safe-simulator-hook.cjs');
const {installPostSuperAliasRepairHook} = require('./post-super-alias-repair-hook.cjs');
const {installMegatonBlowerHook} = require('./megaton-blower-hook.cjs');
const {assertValidPromptAction} = require('./prompt-integrity.cjs');
const {installForestSealSearchHook} = require('./forest-seal-search-hook.cjs');
const {installBattleCompressorMinimumHook} = require('./battle-compressor-minimum-hook.cjs');
const {installSupporterDecisionHook} = require('./supporter-decision-hook.cjs');
const {installGuzmaSelfSwitchGuard} = require('./guzma-self-switch-guard.cjs');
const {installDialgaBenchExposureGuard} = require('./dialga-bench-exposure-guard.cjs');
const {installLeleEntryAbilityLockHook} = require('./lele-entry-ability-lock-hook.cjs');
const {installRadiantGateLockHook} = require('./radiant-gate-lock-hook.cjs');
const {installEntryDrawLockHook} = require('./entry-draw-lock-hook.cjs');
const {installEldegossEntryLockHook} = require('./eldegoss-entry-lock-hook.cjs');
const {installArticunoEntryLockHook} = require('./articuno-entry-lock-hook.cjs');
const {installDistinctAttachTargetsHook} = require('./distinct-attach-targets-hook.cjs');
const {installHerdierTreasureHuntHook} = require('./herdier-treasure-hunt-hook.cjs');
const {installMimikyuNonGxCopycatHook} = require('./copycat-compat.cjs');
const {installDeclaredCopyHistoryHook} = require('./copycat-declared-history-hook.cjs');
const {installPassClearsLastAttackHook} = require('./last-attack-pass-hook.cjs');
const {selectedCardsEvidence, selectedOptionEvidence} = require('./selected-cards-evidence.cjs');
const {captureChooseAttackReference} = require('./choose-attack-reference.cjs');
const {decisionHandEvidence} = require('./decision-hand-evidence.cjs');
const {installSnorlaxRetreatStartHook} = require('./snorlax-retreat-start-hook.cjs');
const {installElectroRainDamageHook} = require('./electro-rain-damage-hook.cjs');
const {installElectrodeGXEnergyHook} = require('./electrode-gx-energy-hook.cjs');
const {withElectrodePrizeTradePolicy} = require('./electrode-gx-ability-tactic.cjs');
const {withAttachedToolPowerPolicy} = require('./attached-tool-power-tactic.cjs');
const {installRedeemableTicketPaperOrderHook} = require('./redeemable-ticket-paper-hook.cjs');
const {snapshotPrizeCardIdentities,invalidateAfterRootHiddenPrizeIngress,
  observeAfterRootFullPrizeReview} =
  require('./root-prize-knowledge-observer.cjs');
const {beforeGladionRootPrizeChoice,afterGladionRootPrizeChoice} =
  require('./gladion-root-prize-choice-evidence.cjs');
const {installHisuianHeavyBallPrizeShuffleHook} = require('./hisuian-heavy-ball-prize-hook.cjs');
const {installPendingEndTurnSwitchCleanup} = require('./pending-end-turn-switch-cleanup.cjs');
const {installTerminalAttackKoBeforeEndTurnHook} =
  require('./terminal-attack-ko-before-endturn-hook.cjs');
const {installApexPrizeWindowPolicy} = require('./apex-prize-headless-policy.cjs');
const {publicSnapshot, observeTerminalTransition, advanceActionLineage} = require('./terminal-transition.cjs');
const {publicBoardSnapshot} = require('./public-board-telemetry.cjs');
const {printedBasicEnergyAudit} = require('./printed-basic-energy-audit.cjs');
const {inspectTmEvolutionPass} = require('./tm-evolution-pass-evidence.cjs');
const {probeEvolutionAnnouncement} = require('./tm-evolution-announcement-probe.cjs');
const {probePassedAttackOptions, nextPassProbeBucket, probeHeldTelepathPass} = require('./pass-attack-announcement-probe.cjs');
const {probePostPassPerfection}=require('./perfection-post-pass-probe.cjs');
const {probeKlefkiRetreatAfterPass} = require('./klefki-retreat-pass-probe.cjs');
const {withActiveOpeningPivot} = require('./active-opening-pivot.cjs');
const {withAttackBeforeRetreat} = require('./attack-retreat-order.cjs');
const {withCopycatApexTimelessPolicy} = require('./mimikyu-counter-policy.cjs');
const {copycatTurnStartSnapshot} = require('./copycat-turn-start-evidence.cjs');
const {retreatTransitionEvidence} = require('./retreat-transition-evidence.cjs');
const {inspectPhysicalCardZones, fixedDeckCountAnomalies,
  locatedOrPromptCountAnomalies} = require('./physical-card-ledger.cjs');
const {newlyLoggedAttackDeclarations} =
  require('../evaluation/twinleaf-attack-log-declarations.cjs');
const {snapshot:poltergeistSnapshot,assess:assessPoltergeist} =
  require('./poltergeist-effect-observer.cjs');

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
 * @property {boolean} [attachedToolPowerPolicy] Opt-in Tool-granted Ability candidate tactic for both seats.
 * @property {boolean} [battleCompressorPositiveSelectionCorrection] Opt-in paper minimum-one-card selection for Battle Compressor.
 * @property {boolean} [grandTreeFirstTurnCorrection] Opt-in printed first-turn Grand Tree evolution prohibition.
 * @property {boolean} [doubleDragonRecovery] Opt-in experimental legal dynamic-Energy attachment tactic.
 * @property {boolean} [doubleDragonArchiveV3] Restore the source-locked historical DDE v3 tactic ONLY for archival replay.
 * @property {boolean} [templeUnlockRecovery] Opt-in attack-unlocking Marshadow response to Temple.
 * @property {boolean} [isolatePolicyRandomness] Use independent RNG streams for speculative bot decisions (experimental).
 * @property {boolean} [prototypeSafeSimulatorIsolation] Opt-in experimental detached speculative Cards/prototypes, not certified for competitive inference.
 * @property {boolean} [postSuperAliasRepairIsolation] Opt-in experimental source-graph reconciliation after the pinned Simulator constructor.
 * @property {boolean} [supporterDecisionCorrection] Opt-in, reversible correction for premature Supporter turn consumption.
 * @property {boolean} [mandatoryOptionFallback] Opt-in, both-seat noncancelable SelectOptionPrompt legality fallback; enabled default, not strategic mode selection.
 * @property {boolean} [enforceSelectOptionLegality] Opt-in fail-closed native option-index/cancel validation, requires strictPromptValidation.
 * @property {boolean} [printedCynthiaCaitlinRecovery] Opt-in exact-source legal mode-zero fallback for printed mandatory C&C recovery.
 * @property {boolean} [enforcePrintedCynthiaRecovery] Opt-in fail-closed mandatory C&C recovery validation, requires strictPromptValidation.
 * @property {boolean} [guzmaSelfSwitchGuard] Opt-in rank-6 off-type self-switch counterfactual.
 * @property {boolean} [dialgaBenchExposureGuard] Opt-in rank-6 gust-target exposure counterfactual.
 * @property {boolean} [leleEntryAbilityLockCorrection] Opt-in correction for Tapu Lele-GX Bench-entry Ability locks.
 * @property {boolean} [radiantGateLockCorrection] Opt-in correction for Radiant Eternatus Bench-entry Ability locks.
 * @property {boolean} [entryDrawLockCorrection] Opt-in correction for Dedenne-GX and Crobat V Bench-entry draw Abilities under in-play-only locks.
 * @property {boolean} [eldegossEntryLockCorrection] Opt-in correction for Eldegoss V RCL Happy Match Bench-entry recovery under in-play-only locks.
 * @property {boolean} [articunoEntryLockCorrection] Opt-in correction for Articuno-GX CES Legendary Ascent Bench-entry switch under in-play-only locks.
 * @property {boolean} [distinctAttachTargetsCorrection] Opt-in bot prompt choice fix for Energy effects requiring distinct attachment destinations.
 * @property {boolean} [herdierTreasureHuntCorrection] Opt-in printed one-Item Herdier SUM 104 Treasure Hunt under applicable Ability locks.
 * @property {boolean} [mimikyuApexCopycatCompatibility] Opt-in non-GX Apex Dragon/Copycat copy-tag correction.
 * @property {boolean} [mimikyuApexTimelessPolicy] Opt-in exact public-state Copycat/Apex/Timeless decision policy.
 * @property {0|1} [mimikyuApexTimelessPolicySeat] Restrict Copycat counterpolicy to one physical seat.
 * @property {0|1} [mimikyuTurn27SetupSeat] Source-ranked, single-turn test of discard, Energy attachment and promotion into the Copycat response.
 * @property {0|1} [mimikyuExtraTurnShredSeat] Opt-in exact source turn28 Copycat/Apex/Shred counterfactual for one physical seat.
 * @property {0|1} [mimikyuAutonomousShredSeat] Opt-in turn-independent public-state spent-GX Shred tactic on one seat.
 * @property {boolean} [mimikyuDeclaredHistoryCorrection] Opt-in printed Copycat attack history after nested prompts.
 * @property {boolean} [regidragoDeclaredHistoryCorrection] Opt-in printed Apex Dragon attack history after nested prompts.
 * @property {boolean} [passClearsLastAttackCorrection] Opt-in clear stale preceding attack when a player passes.
 * @property {boolean} [snorlaxRetreatStartCorrection] Opt-in, reversible Block check on interactive retreat.
 * @property {boolean} [electroRainDamageCorrection] Opt-in printed Electro Rain attack damage and repeated-target correction.
 * @property {boolean} [electrodeGXPrizeTradePolicy] Opt-in source Raichu immediate two-Prize forecast tactic.
 * @property {boolean} [raichuSightToolPolicy] Opt-in rank-4/17 singleton Sight reservation for Alolan Raichu.
 * @property {boolean} [raichuPrizeAllocationPolicy] Opt-in source Raichu multi-target Prize-aware Electro Rain allocation.
 * @property {boolean} [electrodeGXEnergyCorrection] Opt-in printed Extra Energy Bomb mandatory attachment and recipient legality.
 * @property {boolean} [redeemableTicketPaperOrderCorrection] Opt-in paper-rule Ticket top/new-Prize and bottom/old-Prize correction.
 * @property {boolean} [hisuianHeavyBallPrizeShuffleCorrection] Opt-in paper Prize-position shuffle for Hisuian Heavy Ball.
 * @property {boolean} [pendingEndTurnSwitchCleanupCorrection] Opt-in paper delayed-effect cleanup upon Player.switchPokemon Active-to-Bench movement.
 * @property {boolean} [apexSpreadPrizeWindowPolicy] Opt-in Regidrago Phantom Dive selection and six-counter nominal Prize planning.
 * @property {boolean} [spentGxCopyPolicy] Opt-in known legal non-GX fallback when the GX allowance was already consumed.
 * @property {boolean} [shadowRiderEnergyPriority] Opt-in basic Psychic Energy priority against Active Iron Thorns.
 * @property {boolean} [shadowRiderEnergyAcrossField] Opt-in speculative Psychic priority regardless of opposing Active.
 * @property {boolean} [shadowRiderOpeningPivot] Opt-in counterfactual for setup Active choice with selected Shadow Rider V.
 * @property {0|1} [newMoonNativeOpeningPivotSeat] Candidate-only selected Gengar & Mimikyu-GX setup Active ordering probe.
 * @property {0|1} [snorlaxSoloOpeningSeat] Rank3/7 source-locked, own-starting-hand solo Snorlax Active policy.
 * @property {boolean} [snorlaxSoloDeclineOptionalBench] With solo policy, decline a later legal optional Bench prompt after Snorlax is already alone Active.
 * @property {boolean} [snorlaxSoloPreserveBench] With source solo opening, suppress own ordinary Basic Benching while PGO Snorlax is alone Active.
 * @property {boolean} [snorlaxSoloThreatAwareBench] With preservation active, allow ordinary source Basic Benching when an opponent in-play Pokémon visibly has attached Energy.
 * @property {0|1} [newMoonAttackPayloadCompressorSeat] Candidate-only own-hand Compressor and owner-search Gengar payload policy.
 * @property {0|1} [rank4RaichuCompressorSeat] Source-only held Compressor, printed Energy discard; requires min1 rule correction.
 * @property {0|1} [rank4RaichuRopePivotSeat] Source-only held Rope pivot to real Benched Raichu, after printed Energy discard.
 * @property {0|1} [rank4RaichuBombRecipientSeat] Source-only native Electrode discard-Energy attachments prioritized to Active Raichu.
 * @property {0|1} [newMoonAttackPayloadCompressorBenchedSeat] Independent opt-in: also prepare owner-deck donors when Mewtwo is Benched.
 * @property {0|1} [newMoonAttackPayloadCompressorSecondDonorSeat] Independent opt-in: seek still-missing Trevenant after Gengar is established.
 * @property {0|1} [newMoonAttackPayloadCompressorLateSeat] Historical diagnostic only: allow Mewtwo-Active owner donor setup through global turn 14.
 * @property {0|1} [newMoonAttackPayloadCompressorAnyTurnSeat] Historical diagnostic only: allow an owner-visible late donor setup beyond turn 14.
 * @property {0|1} [rank31FogEnergySeat] Opponent source Chimecho Active: opt-in strict Fog-for-Basic-Psychic-Energy search.
 * @property {0|1} [rank31FogEnergyBroaderSeat] Comparison: allow other Basics in hand or Bench when finding Bell's Energy.
 * @property {0|1} [newMoonOpeningHorrorHouseSeat] Candidate-only first-going-second native or copied Horror House-GX policy.
 * @property {boolean} [latiasAttackReadyAttachment] Opt-in rank10 source-state Latias Energy completion probe.
 * @property {boolean} [toolAttackAwareness] Opt-in Tool-granted attack enumeration in the ordinary attack tactic.
 * @property {0|1} [toolAttackAwarenessSeat] Restrict Tool attack policy to one physical seat; requires toolAttackAwareness.
 * @property {boolean} [bunnelbyK0SafeEvolution] Opt-in printed-source-only TM Evolution choice without hidden-deck/Prize inspection.
 * @property {boolean} [bunnelbyObservedK1] Separate opt-in: switch that policy from K0 to K1 only on live owner-deck search prompts.
 * @property {0|1} [gladionVisiblePrizeTargetSeat] Root-only, source-visible Gladion Prize alternative seat.
 * @property {string} [gladionVisiblePrizeTargetPrint] Exact printing to prioritize after real Gladion reveal.
 * @property {boolean} [bunnelbyTargetAwareEvolution] Separate opt-in: choose TM Evolution targets with possible Stage cards.
 * @property {boolean} [bunnelbyGuzmaHalaMode1] Separate opt-in: source-aware G&H optional Tool/Special Energy mode preference.
 * @property {boolean} [bunnelbyGuzmaHalaSearch] Separate root-observed G&H Tool/Jet search preference when Stage remains physically available.
 * @property {boolean} [attackBeforeRetreat] Opt-in policy-order sensitivity probe for AttackTactic and RetreatTactic.
 * @property {0|1} [attackBeforeRetreatSeat] Restrict that opt-in probe to one physical seat.
 * @property {boolean} [passHorizonAttack] Compare printed AttackAction against a simulated PassTurnAction at the same turn-end horizon (experimental).
 * @property {0|1} [passHorizonAttackSeat] Apply same-horizon attack scoring only to this physical seat.
 * @property {number} [passHorizonAttackTurn] Restrict the correction to one frozen global turn; other turns retain the original tactic.
 * @property {boolean} [captureHorrorHouseRootResolution] Observe only real-root Store Horror House declarations and adjacent zones.
 * @property {boolean} [capturePoltergeistEffectTrace] Opt-in retrospective hand Trainer counts and real-root Poltergeist reducer windows.
 * @property {boolean} [captureDecisionTrace] Record ordered meaningful actions with post-action public counts.
 * @property {boolean} [captureNativeAbortEvidence] On failed live root, retain the original source-position SHA, accepted public root labels, and pre-dispatch public board; never expose the snapshot to bot decisions.
 * @property {boolean} [captureGladionRootPrizeChoices] Observe actual owner-revealed Prize identities only after a live Gladion choice; never supplied to policy.
 * @property {boolean} [captureGladionRootChoiceContext] With Prize-choice capture, include own-hand/public-board context at the genuine selected response.
 * @property {boolean} [captureStartingBoard] Read-only physical Active/Bench at the first nonprompt player-turn opportunity.
 * @property {boolean} [capturePublicMulliganReveals] Read-only exact public invalid opening hands from the opponent-facing native ShowMulliganPrompt.
 * @property {boolean} [captureRootConfirmationTrace] Observe only actual Store-dispatched confirmation choices and public damage.
 * @property {boolean} [capturePublicAttackTransitions] Record public board before and immediately after real Store logged attack dispatches, without hidden cards.
 * @property {boolean} [captureFinalPublicBoard] Capture last face-up board and unresolved prompt types for capped-game forensics.
 * @property {boolean} [captureElectrodeOpportunity] Observe source Raichu/Bomb public necessary conditions only at live non-prompt decisions.
 * @property {boolean} [capturePhysicalZoneIntegrity] Opt-in read-only physical reference/attached Energy checks after each live root action.
 * @property {0|1} [captureCopycatTurnStartSeat] Opt-in candidate perspective resource snapshot once per own turn, taken before selecting the first action.
 * @property {0|1} [visiblePlayLockSupporterSeat] With enforceVisiblePlayLockSeat, substitute held legal Lillie's Determination once before falling back to Pass; historical source-policy regression only.
 * @property {boolean} [enforceVisiblePlayLockBothSeats] Opt-in generic final-action owner-visible Trainer and Energy play-lock guard for both actual actors; mutually exclusive with a single guarded seat.
 * @property {boolean} [visiblePlayLockBasicBenchFallback] Opt-in both-actor fallback for legal owner-hand Basic Bench play when a live root action is locked. Experimental, unqualified.
 * @property {boolean} [captureAttackPassProbes] Opt-in first eight post-choice Pass attack-announcement probes; only archived when capturing decision trace.
 * @property {0|1} [capturePerfectionPassProbeSeat] On up to four real Pass decisions with active Mewtwo & Mew-GX, inspect detached Perfection attack menu; observation only.
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
  if(request.enforceSelectOptionLegality===true &&
      request.strictPromptValidation!==true){
    throw new Error('Option legality gate requires strictPromptValidation:true');
  }
  if (request.enforcePrintedCynthiaRecovery === true &&
      request.strictPromptValidation !== true) {
    throw new Error('Printed C&C recovery gate requires strictPromptValidation:true');
  }
  if(request.captureGladionRootChoiceContext===true &&
      request.captureGladionRootPrizeChoices!==true){
    throw new Error('Gladion context requires genuine root Prize-choice capture');
  }
  if(request.capturePerfectionPassProbeSeat!==undefined &&
      (![0,1].includes(request.capturePerfectionPassProbeSeat) ||
       request.captureDecisionTrace!==true)) {
    throw new Error('Perfection Pass observation requires valid actor seat and decision trace');
  }
  if (request.enforceVisiblePlayLockSeat !== undefined &&
      ![0,1].includes(request.enforceVisiblePlayLockSeat)) {
    throw new Error('Live Store play-lock guard needs a physical seat 0 or 1');
  }
  if (request.enforceVisiblePlayLockBothSeats === true &&
      request.enforceVisiblePlayLockSeat !== undefined) {
    throw new Error('Select the both-player lock guard or one physical seat');
  }
  if (request.visiblePlayLockBasicBenchFallback === true &&
      request.enforceVisiblePlayLockBothSeats !== true) {
    throw new Error('Basic Bench reply requires the both-seat final play-lock guard');
  }
  if (request.visiblePlayLockSupporterSeat !== undefined &&
      (request.visiblePlayLockSupporterSeat !== request.enforceVisiblePlayLockSeat ||
       ![0,1].includes(request.visiblePlayLockSupporterSeat))) {
    throw new Error('Lock-response Supporter requires a matching guarded physical seat');
  }
  if (!Array.isArray(request.deckA) || request.deckA.length !== 60 ||
      !Array.isArray(request.deckB) || request.deckB.length !== 60) {
    throw new Error('Both decks must contain 60 concrete Twinleaf card fullNames.');
  }
  if (!Number.isInteger(request.seed) || request.seed < 0 || request.seed > 0xffffffff) {
    throw new Error('seed must be an unsigned 32-bit integer.');
  }
  if (request.snorlaxSoloOpeningSeat !== undefined &&
      ![0,1].includes(request.snorlaxSoloOpeningSeat)) {
    throw new Error('Solo Snorlax opening policy requires source physical seat 0 or 1');
  }
  if (request.snorlaxSoloPreserveBench === true &&
      request.snorlaxSoloOpeningSeat === undefined) {
    throw new Error('Solo Snorlax Bench restraint requires a source opening seat');
  }
  if (request.newMoonNativeOpeningPivotSeat !== undefined &&
      (![0, 1].includes(request.newMoonNativeOpeningPivotSeat) ||
        request.shadowRiderOpeningPivot === true)) {
    throw new Error('New Moon setup pivot needs one physical seat and no other setup pivot');
  }
  if(request.rank4RaichuCompressorSeat!==undefined &&
     (![0,1].includes(request.rank4RaichuCompressorSeat) ||
      request.battleCompressorPositiveSelectionCorrection!==true)) {
    throw new Error('Rank4 source Compressor needs a valid physical seat and paper min1 correction');
  }
  if(request.rank4RaichuRopePivotSeat!==undefined &&
     (![0,1].includes(request.rank4RaichuRopePivotSeat) ||
      request.rank4RaichuRopePivotSeat!==request.rank4RaichuCompressorSeat ||
      request.electrodeGXPrizeTradePolicy!==true ||
      request.electrodeGXEnergyCorrection!==true ||
      request.electroRainDamageCorrection!==true)) {
    throw new Error('Rank4 Rope pivot needs the same source Compressor seat and corrected Bomb and Electro Rain');
  }
  if (request.rank4RaichuBombRecipientSeat !== undefined &&
      (![0, 1].includes(request.rank4RaichuBombRecipientSeat) ||
       request.rank4RaichuBombRecipientSeat !== request.rank4RaichuRopePivotSeat ||
       request.electrodeGXEnergyCorrection !== true)) {
    throw new Error('Rank4 Bomb recipient priority requires the same corrected Rope source seat');
  }
  for (const seat of [request.newMoonAttackPayloadCompressorSeat,
    request.newMoonAttackPayloadCompressorBenchedSeat,
    request.newMoonAttackPayloadCompressorLateSeat,
    request.newMoonAttackPayloadCompressorAnyTurnSeat,
    request.newMoonAttackPayloadCompressorSecondDonorSeat,
    request.newMoonOpeningHorrorHouseSeat]) {
    if (seat !== undefined && ![0,1].includes(seat)) {
      throw new Error('New Moon payload and attack policies need a physical seat');
    }
  }
  if (request.toolAttackAwarenessSeat !== undefined &&
      (request.toolAttackAwareness !== true ||
       ![0, 1].includes(request.toolAttackAwarenessSeat))) {
    throw new Error('Seat-specific Tool attack policy requires enabled toolAttackAwareness and seat 0 or 1');
  }
  if (request.gladionVisiblePrizeTargetSeat !== undefined ||
      request.gladionVisiblePrizeTargetPrint !== undefined) {
    if (![0, 1].includes(request.gladionVisiblePrizeTargetSeat) ||
        typeof request.gladionVisiblePrizeTargetPrint !== 'string' ||
        request.gladionVisiblePrizeTargetPrint.length === 0) {
      throw new Error('Gladion priority requires a valid physical seat and exact target print');
    }
  }
  if (request.bunnelbyObservedK1 === true && request.bunnelbyK0SafeEvolution !== true) {
    throw new Error('Observed K1 requires the source-60 Bunnelby K0 option');
  }
  if (request.bunnelbyTargetAwareEvolution === true &&
      request.bunnelbyK0SafeEvolution !== true) {
    throw new Error('Target-aware Evolution requires the source-60 Bunnelby K0 option');
  }
  if (request.bunnelbyGuzmaHalaMode1 === true &&
      request.bunnelbyK0SafeEvolution !== true) {
    throw new Error('Guzma Hala mode1 requires the source-60 Bunnelby K0 option');
  }
  if (request.bunnelbyGuzmaHalaSearch === true &&
      request.bunnelbyGuzmaHalaMode1 !== true) {
    throw new Error('Bunnelby GH live search requires the source-aware mode1 option');
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
  let restoreBattleCompressorMinimumHook;
  let restoreGrandTreeFirstTurnHook;
  let restoreSupporterDecisionHook;
  let restoreGuzmaSelfSwitchGuard;
  let restoreDialgaBenchExposureGuard;
  let restoreLeleEntryAbilityLockHook;
  let restoreRadiantGateLockHook;
  let restoreEntryDrawLockHook;
  let restoreEldegossEntryLockHook;
  let restoreArticunoEntryLockHook;
  let restoreDistinctAttachTargetsHook;
  let restoreHerdierTreasureHuntHook;
  let restoreSnorlaxRetreatStartHook;
  let restoreElectroRainDamageHook;
  let restoreElectrodeGXEnergyHook;
  let restoreRedeemableTicketPaperOrderHook;
  let restoreHisuianHeavyBallPrizeShuffleHook;
  let pendingEndTurnSwitchCleanupHook;
  let terminalAttackKoBeforeEndTurnHook;
  let restoreApexPrizeWindowPolicy;
  let restoreSpentGxCopyPolicy;
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
    if (request.mimikyuAutonomousShredSeat !== undefined &&
        (![0, 1].includes(request.mimikyuAutonomousShredSeat) ||
          request.mimikyuApexTimelessPolicy !== true ||
          request.mimikyuApexTimelessPolicySeat !== request.mimikyuAutonomousShredSeat ||
          request.mimikyuExtraTurnShredSeat !== undefined)) {
      throw new Error('Autonomous Shred requires its own Apex counterpolicy seat and excludes archived Shred');
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
    if (request.electrodeGXPrizeTradePolicy === true &&
        (request.electrodeGXEnergyCorrection !== true || request.electroRainDamageCorrection !== true)) {
      throw Error('Electrode Prize-trade requires both rule corrections');
    }
    if (request.raichuPrizeAllocationPolicy === true &&
        request.electroRainDamageCorrection !== true) {
      throw Error('Raichu Prize allocation requires corrected Electro Rain attack damage');
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
    if (request.electrodeGXEnergyCorrection === true) {
      restoreElectrodeGXEnergyHook = installElectrodeGXEnergyHook();
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
    if (request.articunoEntryLockCorrection === true) {
      restoreArticunoEntryLockHook = installArticunoEntryLockHook();
    }
    if (request.distinctAttachTargetsCorrection === true) {
      restoreDistinctAttachTargetsHook = installDistinctAttachTargetsHook();
    }
    if (request.herdierTreasureHuntCorrection === true) {
      restoreHerdierTreasureHuntHook = installHerdierTreasureHuntHook();
    }
    const { Store } = engine('game/store/store');
    if (request.battleCompressorPositiveSelectionCorrection === true) {
      restoreBattleCompressorMinimumHook = installBattleCompressorMinimumHook();
    }
    if (request.pendingEndTurnSwitchCleanupCorrection === true) {
      const {Player}=engine('game/store/state/player');
      pendingEndTurnSwitchCleanupHook=installPendingEndTurnSwitchCleanup({Store,Player});
    }
    const { AddPlayerAction } = engine('game/store/actions/add-player-action');
    const { ResolvePromptAction } = engine('game/store/actions/resolve-prompt-action');
    const { CoinFlipPrompt } = engine('game/store/prompts/coin-flip-prompt');
    const { ShuffleDeckPrompt } = engine('game/store/prompts/shuffle-prompt');
    const { GamePhase } = engine('game/store/state/state');
    const { GameMessage } = engine('game/game-message');
    const { Format, CardType, SuperType } = engine('game/store/card/card-types');
    const { GameSettings } = engine('game/core/game-settings');
    const { SimpleTacticsAi } = engine('simple-bot/simple-tactics-ai');
    if (request.apexSpreadPrizeWindowPolicy === true) {
      restoreApexPrizeWindowPolicy = installApexPrizeWindowPolicy();
    }
    if (request.spentGxCopyPolicy === true) {
      restoreSpentGxCopyPolicy = require('./spent-gx-headless-resolver.cjs')
        .installHeadlessSpentGxCopyPolicy();
    }
    const definitions = engine('simple-bot/simple-bot-definitions');
    const { BotFlipMode, BotShuffleMode } = engine('game/bots/bot-arbiter');

    const baseOptions = {
      tactics: definitions.allSimpleTactics,
      promptResolvers: definitions.allPromptResolvers,
      scores: definitions.defaultStateScores,
      arbiter: { flipMode: BotFlipMode.RANDOM, shuffleMode: BotShuffleMode.RANDOM }
    };
    if (request.doubleDragonArchiveV3 === true && request.doubleDragonRecovery !== true) {
      throw new Error('Historical DDE v3 replay requires doubleDragonRecovery:true');
    }
    const ddeAdapter = request.doubleDragonArchiveV3 === true ?
      require('./dde-attach-tactic-v3-archive.cjs') : require('./dde-attach-tactic.cjs');
    let options = request.doubleDragonRecovery === true ?
      ddeAdapter.withDoubleDragonRecovery(baseOptions) : baseOptions;
    if (request.templeUnlockRecovery === true) options = require('./temple-unlock-tactic.cjs').withTempleUnlockRecovery(options);
    if (request.mandatoryOptionFallback === true) {
      options = require('./mandatory-option-policy.cjs').withMandatoryOptionFallback(options);
    }
    if (request.printedCynthiaCaitlinRecovery === true) {
      options = require('./cynthia-caitlin-required-recovery.cjs')
        .withPrintedCynthiaCaitlinRecovery(options);
    }
    if (request.electrodeGXPrizeTradePolicy === true) options = withElectrodePrizeTradePolicy(options);
    if (request.attachedToolPowerPolicy === true) options = withAttachedToolPowerPolicy(options);
    if (request.raichuSightToolPolicy === true) {
      options = require('./raichu-sight-tool-tactic.cjs').withRaichuSightToolPolicy(options);
    }
    if (request.raichuPrizeAllocationPolicy === true) {
      options = require('./raichu-prize-allocation-resolver.cjs')
        .withRaichuPrizeAllocationPolicy(options);
    }
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
    if (request.paperTerminalAttackKoCorrection === true) {
      const {EndTurnEffect}=engine('game/store/effects/game-phase-effects');
      const {CheckHpEffect}=engine('game/store/effects/check-effects');
      const {checkState}=engine('game/store/effect-reducers/check-effect');
      terminalAttackKoBeforeEndTurnHook=installTerminalAttackKoBeforeEndTurnHook({
        Store,rootStore:store,EndTurnEffect,CheckHpEffect,GamePhase,checkState
      });
    }
    const attackPreferenceOptions = request.attackBeforeRetreat === true ?
      withAttackBeforeRetreat(options, {
        AttackTactic: engine('simple-bot/simple-tactics/attack-tactic').AttackTactic,
        RetreatTactic: engine('simple-bot/simple-tactics/retreat-tactic').RetreatTactic
      }) : null;
    const snorlaxSoloOpeningEvents = request.snorlaxSoloOpeningSeat === undefined ?
      null : [];
    const rootSoloSetupSelections = snorlaxSoloOpeningEvents ? [] : null;
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
      if (request.toolAttackAwareness === true &&
          (request.toolAttackAwarenessSeat === undefined ||
            request.toolAttackAwarenessSeat === seat)) {
        configured = require('./tool-attack-policy.cjs').withToolAttackAwareness(configured);
      }
      if (request.bunnelbyK0SafeEvolution === true) {
        const knownPrints = seat === 0 ? request.deckA : request.deckB;
        const manager = initializeCards();
        const sourceCards = knownPrints.map(name => manager.getCardByName(name));
        configured = require('./bunnelby-evolution-policy.cjs')
          .withBunnelbyEvolutionLine(configured, {
            sourceCards,
            observeFirstOwnDeckSearch: request.bunnelbyObservedK1 === true,
            targetAwareEvolution: request.bunnelbyTargetAwareEvolution === true,
            ...(request.bunnelbyObservedK1 === true ? {
              isLivePrompt: (state, player, prompt) =>
                state === store.state && state.players.includes(player) &&
                state.prompts.includes(prompt) && prompt.result === undefined
            } : {})
          });
        if (request.bunnelbyGuzmaHalaMode1 === true) {
          configured = require('./bunnelby-guzma-hala-policy.cjs')
            .withBunnelbyGuzmaHalaMode1(configured,sourceCards);
        }
        if (request.bunnelbyGuzmaHalaSearch === true) {
          configured = require('./bunnelby-gh-search-policy.cjs')
            .withGhBunnelbyResourceSelection(configured,
              (state,player,prompt) =>
                state === store.state && state.players.includes(player) &&
                state.prompts.includes(prompt) && prompt.result === undefined);
        }
      }
      if (request.gladionVisiblePrizeTargetSeat === seat) {
        configured = require('./gladion-visible-prize-resolver.cjs')
          .withGladionVisiblePrizeChoice(configured, {
            targetFullName: request.gladionVisiblePrizeTargetPrint,
            isLivePrompt: (state, player, prompt) =>
              state === store.state && state.players.includes(player) &&
              state.prompts.includes(prompt) && prompt.result === undefined
          });
      }
      if (request.mimikyuApexTimelessPolicy === true &&
          (request.mimikyuApexTimelessPolicySeat === undefined ||
            request.mimikyuApexTimelessPolicySeat === seat)) {
        configured = withCopycatApexTimelessPolicy(configured);
      }
      if (request.snorlaxSoloOpeningSeat === seat) {
        configured = require('./snorlax-solo-opening-policy.cjs')
          .withSoloSnorlaxOpening(configured, {
            ChooseCardsPromptResolver: engine('simple-bot/prompt-resolver/choose-cards-prompt-resolver').ChooseCardsPromptResolver,
            ChooseCardsPrompt: engine('game/store/prompts/choose-cards-prompt').ChooseCardsPrompt,
            ResolvePromptAction: engine('game/store/actions/resolve-prompt-action').ResolvePromptAction,
            GameMessage: engine('game/game-message').GameMessage
          }, snorlaxSoloOpeningEvents, {
            declineOptionalBench:request.snorlaxSoloDeclineOptionalBench===true
          });
      }
      if (request.snorlaxSoloOpeningSeat === seat &&
          request.snorlaxSoloPreserveBench === true) {
        configured = require('./snorlax-solo-opening-policy.cjs')
          .withSoloSnorlaxBenchPreservation(configured, {
            PlayBasicTactic:engine('simple-bot/simple-tactics/play-basic-tactic').PlayBasicTactic
          }, {
            allowBackupOnVisibleOppEnergy:request.snorlaxSoloThreatAwareBench===true
          });
      }
      if (request.newMoonNativeOpeningPivotSeat === seat) {
        configured = require('./new-moon-native-opening-pivot.cjs')
          .withNewMoonNativeOpeningPivot(configured, {
            ChooseCardsPromptResolver: engine('simple-bot/prompt-resolver/choose-cards-prompt-resolver').ChooseCardsPromptResolver,
            ChooseCardsPrompt: engine('game/store/prompts/choose-cards-prompt').ChooseCardsPrompt,
            ResolvePromptAction: engine('game/store/actions/resolve-prompt-action').ResolvePromptAction,
            GameMessage: engine('game/game-message').GameMessage
          });
      }
      if (request.newMoonAttackPayloadCompressorSeat === seat ||
          request.newMoonAttackPayloadCompressorBenchedSeat === seat ||
          request.newMoonAttackPayloadCompressorLateSeat === seat ||
          request.newMoonAttackPayloadCompressorAnyTurnSeat === seat ||
          request.newMoonAttackPayloadCompressorSecondDonorSeat === seat) {
        configured = require('./new-moon-compressor-payload-policy.cjs')
          .withNewMoonCompressorPayload(configured, {
            allowBenchedMewtwo:
              request.newMoonAttackPayloadCompressorBenchedSeat === seat,
            allowTrevenantOnly:
              request.newMoonAttackPayloadCompressorSecondDonorSeat === seat,
            maxGlobalTurn:
              request.newMoonAttackPayloadCompressorAnyTurnSeat === seat ?
                Number.POSITIVE_INFINITY :
                (request.newMoonAttackPayloadCompressorLateSeat === seat ? 14 : 6)
          });
      }
      if (request.rank4RaichuCompressorSeat === seat) {
        configured = require('./rank4-raichu-compressor-policy.cjs')
          .withRank4RaichuCompressor(configured);
      }
      if (request.rank4RaichuRopePivotSeat === seat) {
        configured = require('./rank4-raichu-rope-pivot-policy.cjs')
          .withRank4RopePivot(configured);
      }
      if (request.rank4RaichuBombRecipientSeat === seat) {
        configured = require('./rank4-raichu-bomb-recipient-policy.cjs')
          .withRank4BombRecipientPriority(configured);
      }
      if (request.rank31FogEnergySeat === seat ||
          request.rank31FogEnergyBroaderSeat === seat) {
        configured = require('./rank31-fog-energy-prompt-policy.cjs')
          .withRank31FogEnergyPrompt(configured, {
            allowOtherBasics:request.rank31FogEnergyBroaderSeat === seat
          });
      }
      if (request.newMoonOpeningHorrorHouseSeat === seat) {
        configured = require('./new-moon-opening-horror-house-policy.cjs')
          .withNewMoonOpeningHorrorHouse(configured);
      }
      if (request.mimikyuTurn27SetupSeat === seat) {
        configured = require('./mimikyu-source-turn27-setup.cjs')
          .withCopycatTurn27Setup(configured);
      }
      if (request.mimikyuAutonomousShredSeat === seat) {
        configured = require('./mimikyu-autonomous-shred-policy.cjs')
          .withAutonomousCopycatShredPolicy(configured);
      }
      if (request.mimikyuExtraTurnShredSeat === seat) {
        configured = require('./mimikyu-extra-turn-shred-policy.cjs')
          .withCopycatExtraTurnShredPolicy(configured);
      }
      return configured;
    });
    const deckEpochsByPlayerId = new Map([
      [101,optionsBySeat[0].bunnelbyDeckKnowledgeEpoch],
      [202,optionsBySeat[1].bunnelbyDeckKnowledgeEpoch]
    ].filter(([,epoch])=>epoch));
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
    const playLockDispatchGuardEvents=[];
    let initialBoardAtFirstTurn = null;
    const sourceDealObserver = request.captureInitialSourceDealFingerprintSeat ===
      undefined ? null : createInitialSourceDealObserver(
        request.captureInitialSourceDealFingerprintSeat);
    const fullDealObserver = request.captureInitialFullPhysicalDeal === true ?
      require('../evaluation/full-physical-deal-fingerprint.cjs')
        .createFullPhysicalDealObserver() : null;
    const setupCompensationObserver = request.captureSetupCompensation === true ?
      require('../evaluation/setup-compensation-observer.cjs')
        .createSetupCompensationObserver({
          GamePhase,ShuffleDeckPrompt,
          SelectPrompt:engine('game/store/prompts/select-prompt').SelectPrompt,
          GameMessage
        }) : null;
    const publicMulliganRevealObserver = request.capturePublicMulliganReveals===true ?
      require('../evaluation/public-mulligan-reveal-observer.cjs')
        .createPublicMulliganRevealObserver({
          GamePhase,GameMessage,
          ShowMulliganPrompt:engine('game/store/prompts/show-mulligan-prompt')
            .ShowMulliganPrompt
        }) : null;
    const actionCounts = {};
    const actionsBySeat = [{}, {}];
    const cardsPlayedBySeat = [{}, {}];
    const attackTrace = [];
    const attackDeclarationTrace = [];
    const publicAttackTransitions = request.capturePublicAttackTransitions === true ? [] : null;
    const poltergeistEffectTrace = request.capturePoltergeistEffectTrace === true ? [] : null;
    let poltergeistWindow = null;
    const horrorHouseAudit = request.captureHorrorHouseRootResolution === true ?
      require('./horror-house-root-audit.cjs') : null;
    const horrorHouseRootTrace = horrorHouseAudit ? [] : null;
    const abilityTrace = [];
    const decisionTrace = request.captureDecisionTrace === true ? [] : null;
    const rootActionLedger = request.captureDecisionTrace === true ? [] : null;
    // Preserve the public restart boundary separately from the stable root
    // ledger protocol and SHA. A paper sudden-death replay resets turn to 0.
    const suddenDeathClockResets = rootActionLedger ? [] : null;
    // Bounded, public-count-only context for an actual native restart.
    // Excludes face-down setup and is retained only with a reset marker.
    const recentNativePublicRoots = suddenDeathClockResets ? [] : null;
    // Read-only fresh Deal identity for each native replay episode. Existing
    // initial source digest and live decisions remain unchanged.
    const sourceDealEpochObserver = sourceDealObserver ?
      require('../evaluation/source-deal-epoch-observer.cjs')
        .createSourceDealEpochObserver(
          request.captureInitialSourceDealFingerprintSeat) : null;
    const gladionRootPrizeChoices = request.captureGladionRootPrizeChoices === true ? [] : null;
    const rootConfirmationTrace = request.captureRootConfirmationTrace === true ? [] : null;
    const electrodeOpportunityObserver = request.captureElectrodeOpportunity === true ?
      require('./electrode-opportunity-observer.cjs').createElectrodeOpportunityObserver() : null;
    const physicalZoneIntegrity = request.capturePhysicalZoneIntegrity === true
      ? {
        schema: 'live-headless-physical-zone-integrity-v1',
        rootActionsChecked: 0,
        actionsWithAnomaly: 0,
        firstAnomaly: null,
        settledRootsChecked: 0,
        settledRootsWithAnomaly: 0,
        firstSettledRootAnomaly: null
      }
      : null;
    const copycatTurnStartEvidence = request.captureCopycatTurnStartSeat === undefined ?
      null : [];
    let lastCopycatTurnCaptured = null;
    let attackPassProbeCount = 0;
    let perfectionPassProbeCount=0;
    const attackPassProbeBuckets = {printed: 0, tool: 0};
    let terminalTransition = null;
    let actionLineage = null;
    const knowledgeEvents = request.bunnelbyObservedK1 === true ? [] : null;
    while (store.state.phase !== GamePhase.FINISHED && actions < maxActions) {
      const state = store.state;
      const epochBeforeAction = knowledgeEvents ? optionsBySeat.map(options =>
        options.bunnelbyDeckKnowledgeEpoch.snapshot()) : null;
      const pending = state.prompts.find(prompt => prompt.result === undefined);
      if (publicMulliganRevealObserver)
        publicMulliganRevealObserver.observe(state,pending);
      // Opt-in post-setup digest, captured before any first-turn bot decision.
      // Its private card inventory is never provided to a policy.
      if (sourceDealObserver) sourceDealObserver.observe(state);
      if (sourceDealEpochObserver)
        sourceDealEpochObserver.observe(state,actions,suddenDeathClockResets?.length ?? 0);
      if (fullDealObserver) fullDealObserver.observe(state);
      const rootedSoloSetup = rootSoloSetupSelections && pending &&
          pending.message === GameMessage.CHOOSE_STARTING_POKEMONS &&
          pending.playerId === state.players[request.snorlaxSoloOpeningSeat].id ? {
            promptId:pending.id,phase:state.phase,turn:state.turn,
            sourceSeat:request.snorlaxSoloOpeningSeat,
            activeBefore:state.players[request.snorlaxSoloOpeningSeat]
              .active.getPokemonCard()?.fullName??null,
            benchBefore:state.players[request.snorlaxSoloOpeningSeat]
              .bench.map(slot=>slot.getPokemonCard()?.fullName).filter(Boolean),
            emptySelectionValid:pending.validate([],state)
          } : null;
      if (request.captureStartingBoard === true &&
          initialBoardAtFirstTurn === null && !pending &&
          state.phase === GamePhase.PLAYER_TURN) {
        initialBoardAtFirstTurn = {
          turn:state.turn,activePlayerSeat:state.activePlayer,
          players:state.players.map((player,seat)=>({
            seat,
            active:player.active.getPokemonCard()?.fullName??null,
            bench:player.bench.map(slot=>slot.getPokemonCard()?.fullName)
              .filter(Boolean)
          }))
        };
      }
      if (electrodeOpportunityObserver && !pending &&
          state.phase === GamePhase.PLAYER_TURN) {
        electrodeOpportunityObserver.observe(state);
      }
      if (copycatTurnStartEvidence && !pending &&
          state.phase === GamePhase.PLAYER_TURN &&
          state.activePlayer === request.captureCopycatTurnStartSeat &&
          lastCopycatTurnCaptured !== state.turn) {
        copycatTurnStartEvidence.push(copycatTurnStartSnapshot(
          state, request.captureCopycatTurnStartSeat));
        lastCopycatTurnCaptured = state.turn;
      }
      let action;
      try {
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
      } catch (error) {
        // The bot may throw before returning a typed action. Archive the
        // native prompt type, public state, accepted history, and a digest of
        // the detailed exception without copying potentially concealed cards.
        if (request.captureNativeAbortEvidence===true &&
            error && typeof error==='object') {
          const failedSeat=pending?
            state.players.findIndex(p=>p.id===pending.playerId):
            state.activePlayer;
          if(failedSeat===0||failedSeat===1){
            error.nativeAbortEvidence=
              require('./native-dispatch-abort-evidence.cjs')
                .nativeDispatchAbortEvidence({
                  failureStage:'bot-decoder',actionOrdinal:actions,
                  actionName:'BotDecodeFailure',turnBefore:state.turn,
                  phaseBefore:state.phase,actingSeat:failedSeat,
                  pendingPrompt:pending?.constructor.name??null,
                  errorMessage:'Actor action decoding failed; details redacted',
                  redactedMessageDigest:crypto.createHash('sha256')
                    .update(String(error.message??error)).digest('hex'),
                  sourceDeal:sourceDealObserver?.result()??null,
                  rootActionLedger,
                  preDispatchPublic:publicSnapshot(state),
                  preDispatchBoard:publicBoardSnapshot(state)
                });
          }
        }
        throw error;
      }
      const guardedPlayLockSeat=visiblePlayLockGuardSeat(
        request,state.activePlayer);
      if (guardedPlayLockSeat !== undefined &&
          state.phase === GamePhase.PLAYER_TURN && !pending) {
        const owner=state.players[guardedPlayLockSeat];
        const {SuperType,TrainerType,EnergyType,Stage} =
          engine('game/store/card/card-types');
        const {PowerType}=engine('game/store/card/pokemon-types');
        const playLockEnums={
          superPokemon:SuperType.POKEMON,
          superTrainer:SuperType.TRAINER,
          superEnergy:SuperType.ENERGY,
          item:TrainerType.ITEM,
          supporter:TrainerType.SUPPORTER,
          stadium:TrainerType.STADIUM,
          tool:TrainerType.TOOL,
          specialEnergy:EnergyType.SPECIAL,
          abilityPowerType:PowerType.ABILITY,
          evolvedStages:[Stage.STAGE_1,Stage.STAGE_2,
            Stage.VMAX,Stage.VSTAR,Stage.MEGA,Stage.BREAK,Stage.LV_X]
        };
        const reason=playerPlayLockVeto(owner,action,playLockEnums);
        if (reason) {
          const heldLillieIndex =
            request.visiblePlayLockSupporterSeat === guardedPlayLockSeat ?
            require('./visible-lock-supporter-response.cjs')
              .heldLillieResponseIndex(owner,state.turn) : -1;
          const {PassTurnAction}=engine('game/store/actions/game-actions');
          const {PlayCardAction,PlayerType,SlotType}=
            engine('game/store/actions/play-card-action');
          const basicResponse=request.visiblePlayLockBasicBenchFallback === true ?
            require('./visible-lock-basic-bench-response.cjs')
              .visibleBasicBenchResponse(state,owner,action,{
                ...playLockEnums,
                basicStage:Stage.BASIC,
                bottomPlayerType:PlayerType.BOTTOM_PLAYER,
                benchSlotType:SlotType.BENCH
              },(id,handIndex,target)=>
                new PlayCardAction(id,handIndex,target)) : null;
          const alternative=basicResponse ?
            'BasicBench:' + basicResponse.card :
            heldLillieIndex >= 0 ? "Lillie's Determination" : 'PassTurnAction';
          playLockDispatchGuardEvents.push({
            turn:state.turn,seat:guardedPlayLockSeat,
            reason,originalCard:owner.hand.cards[action.handIndex].fullName,
            originalAction:action.constructor.name,
            alternative,
            playerFlags:{stadium:owner.cannotPlayStadiumCards,
              specialEnergy:owner.cannotPlaySpecialEnergyCards,
              remainingTurns:owner.playLocksTurnsRemaining}
          });
          action=basicResponse?.action ?? (heldLillieIndex >= 0 ?
            new PlayCardAction(owner.id,heldLillieIndex,{
              player:PlayerType.ANY,slot:SlotType.BOARD,index:0
            }) : new PassTurnAction(owner.id));
        }
      }
      if (request.strictPromptValidation === true) {
        try {
          assertValidPromptAction(state, action,{
            enforceSelectOptionLegality:request.enforceSelectOptionLegality===true,
            enforcePrintedCynthiaRecovery:request.enforcePrintedCynthiaRecovery===true,
            enforceAttachEnergyGeometry:request.enforceAttachEnergyGeometry===true
          });
        } catch (error) {
          // This failed before Store.dispatch, so the earlier accepted root
          // history and original source-deal digest must survive separately.
          if (request.captureNativeAbortEvidence===true) {
            const actingId=pending?pending.playerId:(action.clientId??action.id);
            const actingSeat=state.players.findIndex(p=>p.id===actingId);
            error.nativeAbortEvidence=
              require('./native-dispatch-abort-evidence.cjs')
                .nativeDispatchAbortEvidence({
                  failureStage:'strict-prompt-validation',
                  actionOrdinal:actions,actionName:action.constructor.name,
                  turnBefore:state.turn,phaseBefore:state.phase,actingSeat,
                  attackName:action.constructor.name==='AttackAction'?
                    action.name:null,
                  attackingPokemon:action.constructor.name==='AttackAction'?
                    state.players[actingSeat].active.getPokemonCard()?.fullName??null:null,
                  pendingPrompt:pending?.constructor.name??null,
                  errorMessage:'Strict prompt validation failed; details redacted',
                  redactedMessageDigest:crypto.createHash('sha256')
                    .update(String(error.message??error)).digest('hex'),
                  sourceDeal:sourceDealObserver?.result()??null,
                  rootActionLedger,
                  preDispatchPublic:publicSnapshot(state),
                  preDispatchBoard:publicBoardSnapshot(state)
                });
          }
          throw error;
        }
      }
      const actionName = action.constructor.name;
      const rootedSoloSetupChoice = rootedSoloSetup &&
        actionName === 'ResolvePromptAction' &&
        Array.isArray(action.result) ? action.result.map(card=>card.fullName) : null;
      const turnBefore = state.turn;
      const phaseBefore = state.phase;
      const suddenDeathBefore = state.isSuddenDeath === true;
      if (knowledgeEvents) {
        optionsBySeat.forEach((options,seat) => {
          const current=options.bunnelbyDeckKnowledgeEpoch.snapshot();
          const prior=epochBeforeAction[seat];
          if (current.liveSearches>prior.liveSearches) {
            knowledgeEvents.push({actionOrdinal:actions,turn:turnBefore,seat,
              kind:'live-own-deck-search',
              observations:current.liveSearches-prior.liveSearches});
          }
        });
      }
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
      const attackChoice = decisionTrace ? captureChooseAttackReference(pending, action) : null;
      const decisionHandBefore = decisionTrace && seat >= 0 ?
        decisionHandEvidence(state, seat) : null;
      const attackInfo = actionName === 'AttackAction' && seat >= 0 ? {
        turn: state.turn, seat,
        activePokemon: state.players[seat].active.getPokemonCard()?.name || '',
        attack: action.name,
        prizeCountBefore: state.players.map(player => player.prizes.filter(prize => prize.cards.length > 0).length)
      } : undefined;
      const publicBeforeDispatch = publicSnapshot(state);
      const preDispatchAttackerPrinting=actionName==='AttackAction'&&seat>=0?
        state.players[seat].active.getPokemonCard()?.fullName??null:null;
      // Snapshot before Store dispatch: a rejected reducer can mutate the live
      // state, so post-error board inspection is not a reliable precondition.
      const preDispatchAbortBoard=request.captureNativeAbortEvidence===true ?
        publicBoardSnapshot(state) : null;
      const publicAttackBefore = publicAttackTransitions ? publicBoardSnapshot(state) : null;
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
      // After the candidate has already chosen Pass, test one physically
      // held Telepath Energy on its public Active in a detached native Store.
      // The returned fact is never supplied to the decision policy.
      let heldTelepathPassProbe=null;
      if(decisionTrace && actionName==='PassTurnAction' &&
          seat>=0 && seat===request.captureHeldTelepathPassProbeSeat){
        try{
          heldTelepathPassProbe=probeHeldTelepathPass(
            state,state.players[seat].id);
        }catch(error){
          heldTelepathPassProbe={
            schema:'agent4-native-cloned-owner-telepath-active-attachment-v1',
            auditError:String(error?.message??error)
          };
        }
      }
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
      let perfectionPassProbe=null;
      if(decisionTrace && seat===request.capturePerfectionPassProbeSeat &&
          actionName==='PassTurnAction' && perfectionPassProbeCount<4){
        try{
          const observed=probePostPassPerfection(state,state.players[seat].id);
          if(observed){
            perfectionPassProbeCount++;
            perfectionPassProbe=observed;
          }
        }catch(error){
          perfectionPassProbeCount++;
          perfectionPassProbe={evidenceType:'post-choice-cloned-perfection-attack-menu-v1',
            auditError:String(error?.message??error),
            scope:'Detached post-Pass observation failed without changing the policy action.'};
        }
      }
      let klefkiRetreatPassProbe = null;
      if (decisionTrace && request.captureKlefkiRetreatPassProbe === true &&
          actionName === 'PassTurnAction' && seat >= 0) {
        try {
          klefkiRetreatPassProbe = probeKlefkiRetreatAfterPass(
            state, state.players[seat].id);
        } catch (error) {
          klefkiRetreatPassProbe = {
            evidenceType: 'post-pass-dedenne-klefki-retreat-joust-source-probe-v1',
            auditError: String(error?.message || error),
            qualifiedForCompetitiveInference: false
          };
        }
      }
      const horrorHouseBefore = horrorHouseAudit ? horrorHouseAudit.beforeAction(state) : null;
      const poltergeistBefore = poltergeistEffectTrace ?
        poltergeistSnapshot(state,SuperType.TRAINER) : null;
      const poltergeistPublicBefore = poltergeistEffectTrace ?
        publicBoardSnapshot(state) : null;
      const attackLogStartIndex = state.logs.length;
      const prizeBeforeRoot = request.bunnelbyObservedK1 === true ?
        snapshotPrizeCardIdentities(store.state) : null;
      const gladionChoiceBefore = gladionRootPrizeChoices && seat >= 0 ?
        beforeGladionRootPrizeChoice(state,pending,action,seat,actions,
          request.captureGladionRootChoiceContext===true) : null;
      const rootConfirm = rootConfirmationTrace &&
          pending?.constructor.name === 'ConfirmPrompt' &&
          actionName === 'ResolvePromptAction' && seat >= 0 ? {
        actionOrdinal:actions, turn:turnBefore, seat,
        promptId:pending.id, message:pending.message, response:action.result,
        opponentDamageBefore:[
          state.players[1-seat].active.damage,
          ...state.players[1-seat].bench.filter(b => b.getPokemonCard()).map(b => b.damage)
        ]
      } : null;
      // Opt-in evidence is captured before dispatch, since a rejected Store
      // action may mutate transient state before throwing. No opposing hand,
      // hidden deck order or Prize identities enter this snapshot.
      const rejectionBefore = request.captureRejectedActionEvidence === true ? {
        schema: 'rejected-root-owner-public-action-v1',
        actionOrdinal: actions, turn: turnBefore,
        actingSeat: seat, activePlayerSeat: state.activePlayer,
        actionName, pendingPrompt: pending?.constructor.name ?? null,
        playedCardName: playedCard ?? null,
        playedCardPrinting: actionName === 'PlayCardAction' && seat >= 0 ?
          state.players[seat].hand.cards[action.handIndex]?.fullName ?? null : null,
        ownerHandPrintings: seat >= 0 ?
          state.players[seat].hand.cards.map(card => card.fullName) : null,
        ownerSupporterTurn: seat >= 0 ? state.players[seat].supporterTurn : null,
        ownerPlayLockFlags: seat >= 0 ? {
          stadium:state.players[seat].cannotPlayStadiumCards,
          specialEnergy:state.players[seat].cannotPlaySpecialEnergyCards,
          remainingTurns:state.players[seat].playLocksTurnsRemaining
        } : null,
        chosenTarget: actionName === 'PlayCardAction' ? {
          player: action.target?.player ?? null,
          slot: action.target?.slot ?? null,
          index: action.target?.index ?? null
        } : null,
        priorPublicAttackDeclarations: newlyLoggedAttackDeclarations(
          state.logs, 0, {
            actionOrdinal: actions, turnBefore,
            triggerAction: 'historical-pre-rejection-log'
          }).map(row => ({
            logIndex: row.logIndex,playerName: row.playerName,
            attackName: row.attackName
          })),
        publicBoard: publicBoardSnapshot(state)
      } : null;
      if (setupCompensationObserver) {
        setupCompensationObserver.before(state,pending,action);
      }
      // Read-only source of native winner predicates immediately before root
      // dispatch. This is offline evidence and never enters a bot decision.
      const nativeResetPrestate = suddenDeathClockResets ?
        captureNativeResetPrestate(state) : null;
      if (recentNativePublicRoots && state.turn>=1 &&
          [GamePhase.PLAYER_TURN,GamePhase.ATTACK,GamePhase.BETWEEN_TURNS].includes(state.phase)) {
        recentNativePublicRoots.push({
          actionOrdinal:actions,turnBefore,playerSlot:seat,
          action:actionName,pendingPrompt:pending?.constructor.name??null,
          before:publicSnapshot(state),
          publicActiveHp:state.players.map(player=>{
            const card=player.active.getPokemonCard();
            return card?{
              name:card.name,printedHp:card.hp,
              publicDamage:player.active.damage,
              effectiveSlotHp:player.active.hp
            }:null;
          })
        });
        if (recentNativePublicRoots.length>16) recentNativePublicRoots.shift();
      }
      try {
        store.dispatch(action);
        if (setupCompensationObserver) {
          setupCompensationObserver.after(store.state);
        }
      } catch (error) {
        const rejected = new Error('Twinleaf dispatch failed after ' +
          actions + ' actions (' + action.constructor.name + '): ' +
          error.message, { cause: error });
        if (rejectionBefore) rejected.rejectedActionEvidence = {
          ...rejectionBefore, rejectionMessage: error.message
        };
        if (request.captureNativeAbortEvidence===true) {
          rejected.nativeAbortEvidence =
            require('./native-dispatch-abort-evidence.cjs')
              .nativeDispatchAbortEvidence({
                actionOrdinal:actions,actionName,turnBefore,phaseBefore,
                actingSeat:seat,attackName:attackInfo?.attack??null,
                attackingPokemon:preDispatchAttackerPrinting,
                errorMessage:error.message,
                sourceDeal:sourceDealObserver?.result()??null,
                rootActionLedger,
                preDispatchPublic:publicBeforeDispatch,
                preDispatchBoard:preDispatchAbortBoard
              });
        }
        throw rejected;
      }
      if (rootedSoloSetup && rootedSoloSetupChoice) {
        const source = store.state.players[request.snorlaxSoloOpeningSeat];
        rootSoloSetupSelections.push({
          ...rootedSoloSetup, actionOrdinal:actions,
          selectedNames:rootedSoloSetupChoice,
          activeAfter:source.active.getPokemonCard()?.fullName??null,
          benchAfter:source.bench.map(slot=>slot.getPokemonCard()?.fullName)
            .filter(Boolean)
        });
      }
      if (gladionChoiceBefore) {
        gladionRootPrizeChoices.push(
          afterGladionRootPrizeChoice(gladionChoiceBefore,store.state));
      }
      if (rootConfirm) {
        const defending = store.state.players[1-seat];
        rootConfirmationTrace.push({
          ...rootConfirm,
          opponentDamageAfter:[
            defending.active.damage,
            ...defending.bench.filter(b => b.getPokemonCard()).map(b => b.damage)
          ]
        });
      }
      const loggedAttacks = newlyLoggedAttackDeclarations(
        store.state.logs, attackLogStartIndex,
        { actionOrdinal: actions, turnBefore, triggerAction: actionName });
      for (const declaration of loggedAttacks) {
        attackDeclarationTrace.push({
          ...declaration,
          playerSlot: store.state.players.findIndex(
            player => player.name === declaration.playerName),
          triggerPlayerSlot: seat,
          turnAfter: store.state.turn,
          promptPendingAfter: store.state.prompts.some(prompt => prompt.result === undefined),
          resolutionStatus: 'not-independently-verified'
        });
      }
      if (publicAttackTransitions) {
        const promptStillOpen=store.state.prompts.some(prompt=>
          prompt.result===undefined);
        const settledSnapshot=()=>({
          completionRootActionOrdinal:actions,
          after:publicBoardSnapshot(store.state),
          prizesRemaining:store.state.players.map(player=>
            player.prizes.filter(prize=>prize.cards.length>0).length),
          deckRemaining:store.state.players.map(player=>player.deck.cards.length)
        });
        if (loggedAttacks.length) {
          publicAttackTransitions.push({
            actionOrdinal:actions,turnBefore,turnAfter:store.state.turn,
            triggerAction:actionName,triggerPlayerSlot:seat,
            initiatingRootActionOrdinal:
              actionLineage?.initiatingAction?.actionOrdinal??null,
            declarations:loggedAttacks.map(attack=>({
              playerName:attack.playerName,attackName:attack.attackName
            })),
            before:publicAttackBefore,
            beforePrizesRemaining:publicBeforeDispatch.players.map(player=>
              player.prizesRemaining),
            after:publicBoardSnapshot(store.state),
            promptPendingAfter:promptStillOpen,
            settled:promptStillOpen?null:settledSnapshot()
          });
        }
        // Follow the same Store attack's genuine prompted effect until its
        // last ResolvePromptAction. An immediate root snapshot frequently
        // precedes all printed attack damage and must not be treated as final.
        if (actionName==='ResolvePromptAction' && !promptStillOpen) {
          const origin=actionLineage?.initiatingAction?.actionOrdinal;
          for (const event of publicAttackTransitions) {
            if (event.initiatingRootActionOrdinal===origin &&
                event.settled===null) event.settled=settledSnapshot();
          }
        }
      }
      if (poltergeistEffectTrace) {
        const after = poltergeistSnapshot(store.state,SuperType.TRAINER);
        const copiedOrNative = loggedAttacks.find(row=>row.attackName==='Poltergeist');
        if (copiedOrNative) {
          const attackerSeat = store.state.players.findIndex(player=>
            player.name===copiedOrNative.playerName);
          if (![0,1].includes(attackerSeat)) {
            throw new Error('Poltergeist Store attacker could not be identified');
          }
          poltergeistWindow = {
            schema:'real-Store-Poltergeist-root-window-v1',
            attackerSeat, actionOrdinal:actions, turnBefore,
            triggerAction:actionName,
            pendingPrompt:pending?.constructor.name??null,
            before:poltergeistBefore, after,
            publicBefore:poltergeistPublicBefore,
            publicAfter:publicBoardSnapshot(store.state),
            steps:[]
          };
          poltergeistEffectTrace.push(poltergeistWindow);
        } else if (poltergeistWindow) {
          poltergeistWindow.steps.push({
            actionOrdinal:actions,actionName,
            pendingPrompt:pending?.constructor.name??null,
            before:poltergeistBefore,after,
            publicAfter:publicBoardSnapshot(store.state)
          });
        }
        if (poltergeistWindow &&
            (store.state.phase===GamePhase.FINISHED ||
             !store.state.prompts.some(prompt=>prompt.result===undefined))) {
          poltergeistWindow.assessment=assessPoltergeist(poltergeistWindow);
          poltergeistWindow=null;
        }
      }
      if (horrorHouseAudit) {
        const rootDeclarations = attackDeclarationTrace.filter(row=>row.actionOrdinal===actions);
        horrorHouseRootTrace.push(...horrorHouseAudit.rootHorrorHouseEvents(
          horrorHouseBefore,horrorHouseAudit.beforeAction(store.state),rootDeclarations));
      }
      if (physicalZoneIntegrity) {
        const ownership = inspectPhysicalCardZones(store.state);
        const countAnomalies = fixedDeckCountAnomalies(ownership);
        physicalZoneIntegrity.rootActionsChecked++;
        if (ownership.referenceDuplications.length ||
            ownership.energyWithoutPhysicalCard.length ||
            ownership.repeatedEnergyIndexes.length || countAnomalies.length) {
          physicalZoneIntegrity.actionsWithAnomaly++;
          if (physicalZoneIntegrity.firstAnomaly === null) {
            physicalZoneIntegrity.firstAnomaly = {
              actionOrdinal: actions + 1,
              turn: store.state.turn,
              actingSeat: state.activePlayer,
              actionType: actionName,
              ownership,
              countAnomalies
            };
          }
        }
        // A source 60 may occupy an unresolved prompt's temporary CardList.
        // Audit completed roots separately and do not count a resolved prompt
        // as custody for a physically stranded card.
        if (!store.state.prompts.some(prompt => prompt.result===undefined)) {
          physicalZoneIntegrity.settledRootsChecked++;
          const settledCountAnomalies=locatedOrPromptCountAnomalies(ownership);
          if (ownership.referenceDuplications.length ||
              ownership.energyWithoutPhysicalCard.length ||
              ownership.repeatedEnergyIndexes.length ||
              settledCountAnomalies.length) {
            physicalZoneIntegrity.settledRootsWithAnomaly++;
            if (physicalZoneIntegrity.firstSettledRootAnomaly===null) {
              physicalZoneIntegrity.firstSettledRootAnomaly={
                actionOrdinal:actions+1,turn:store.state.turn,
                actingSeat:state.activePlayer,actionType:actionName,
                ownership,settledCountAnomalies
              };
            }
          }
        }
      }
      if (prizeBeforeRoot) {
        const revoked=invalidateAfterRootHiddenPrizeIngress(
          prizeBeforeRoot,store.state,deckEpochsByPlayerId);
        const exposed=observeAfterRootFullPrizeReview(
          prizeBeforeRoot,store.state,deckEpochsByPlayerId);
        for(const [kind,ids] of [
          ['hidden-prize-ingress',revoked],['full-own-prize-review',exposed]
        ]) {
          for(const playerId of ids) {
            knowledgeEvents.push({actionOrdinal:actions,turn:turnBefore,
              seat:store.state.players.findIndex(player=>player.id===playerId),
              kind,action:actionName});
          }
        }
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
      if (decisionTrace && (playedCard || abilityInfo || attackInfo || selectionInfo || optionInfo || attackChoice ||
          ['PassTurnAction', 'RetreatAction', 'UseStadiumAction'].includes(actionName))) {
        decisionTrace.push({
          actionOrdinal: actions, turnBefore, turnAfter: store.state.turn,
          playerSlot: seat, action: actionName,
          ...(playedCard ? { card: playedCard } : {}),
          ...(abilityInfo ? { ability: abilityInfo.name } : {}),
          ...(selectionInfo ? { cardSelection: selectionInfo } : {}),
          ...(optionInfo ? { optionSelection: optionInfo } : {}),
          ...(attackChoice ? { attackChoice } : {}),
          ...(decisionHandBefore ? { decisionHandBefore } : {}),
          ...(publicBoardBeforePass ? { publicBoardBeforePass } : {}),
          ...(retreatTransition ? { retreatTransition } : {}),
          ...(printedBasicEnergyBeforePass ? { printedBasicEnergyBeforePass } : {}),
          ...(tmEvolutionBeforePass ? { tmEvolutionBeforePass } : {}),
          ...(tmEvolutionAnnouncementProbe ? { tmEvolutionAnnouncementProbe } : {}),
          ...(attackPassProbe ? { attackPassProbe } : {}),
          ...(heldTelepathPassProbe ? { heldTelepathPassProbe } : {}),
          ...(perfectionPassProbe ? {perfectionPassProbe} : {}),
          ...(klefkiRetreatPassProbe ? {klefkiRetreatPassProbe} : {}),
          ...(attackInfo ? { attack: attackInfo.attack,
            attacker: attackInfo.activePokemon } : {}),
          prizesAfter: store.state.players.map(player =>
            player.prizes.filter(prize => prize.cards.length > 0).length),
          decksAfter: store.state.players.map(player => player.deck.cards.length)
        });
      }
      // Capture every successful root Store dispatch, including prompt actions
      // absent from the selective decision trace. This is post-choice evidence.
      if (suddenDeathClockResets && store.state.turn < turnBefore) {
        suddenDeathClockResets.push({
          actionOrdinal:actions,actingSeat:seat,action:actionName,
          pendingPrompt:pending?.constructor.name??null,
          fromTurn:turnBefore,toTurn:store.state.turn,
          fromPhase:phaseBefore,toPhase:store.state.phase,
          beforeSuddenDeath:suddenDeathBefore,
          afterSuddenDeath:store.state.isSuddenDeath===true,
          enteredSetup:store.state.phase===GamePhase.SETUP,
          preDispatchWinPredicates:nativeResetPrestate,
          recentNativePublicRootWindow:recentNativePublicRoots.slice()
        });
      }
      if (rootActionLedger) {
        rootActionLedger.push({
          actionOrdinal: actions,
          turnBefore, turnAfter: store.state.turn,
          playerSlot: seat, action: actionName,
          pendingPrompt: pending?.constructor.name ?? null,
          initiatingRootActionOrdinal:
            actionLineage?.initiatingAction?.actionOrdinal ?? null,
          ...(playedCard ? {card: playedCard} : {}),
          ...(abilityInfo ? {ability: abilityInfo.name} : {}),
          ...(attackInfo ? {attack: attackInfo.attack} : {}),
          ...(attackChoice?.selection ? {attackChoice: {
            printing: attackChoice.selection.printing,
            attackName: attackChoice.selection.attackName,
            attackIndex: attackChoice.selection.attackIndex,
            sourceIndex: attackChoice.selection.index
          }} : {})
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
      attackDeclarationTrace,
      attackDeclarationTraceProtocol: 'real-store-attack-log-declarations-v1',
      ...(request.enforceVisiblePlayLockSeat !== undefined ||
          request.enforceVisiblePlayLockBothSeats === true ?
        {playLockDispatchGuardEvents} : {}),
      ...(publicAttackTransitions ? {
        publicAttackTransitions,
        publicAttackTransitionsProtocol:'actual-store-public-attack-transitions-v1'
      } : {}),
      ...(poltergeistEffectTrace ? {poltergeistEffectTrace} : {}),
      ...(horrorHouseRootTrace ? {horrorHouseRootTrace} : {}),
      abilityTrace,
      decisionTrace,
      rootActionLedger,
      ...(terminalAttackKoBeforeEndTurnHook ? {
        terminalAttackKoBeforeEndTurnAudit:terminalAttackKoBeforeEndTurnHook.evidence()
      } : {}),
      ...(suddenDeathClockResets ? {
        suddenDeathClockResets,
        suddenDeathClockResetProtocol:'actual-native-sudden-death-clock-transition-v1'
      } : {}),
      ...(gladionRootPrizeChoices ? {gladionRootPrizeChoices} : {}),
      rootActionLedgerProtocol: rootActionLedger ?
        'actual-store-root-action-ledger-v1' : null,
      ...(rootConfirmationTrace ? {rootConfirmationTrace} : {}),
      ...(electrodeOpportunityObserver ?
        {electrodeOpportunitySummary: electrodeOpportunityObserver.snapshot()} : {}),
      ...(physicalZoneIntegrity ? {physicalZoneIntegrity} : {}),
      ...(copycatTurnStartEvidence ? {copycatTurnStartEvidence} : {}),
      ...(request.captureStartingBoard === true ? {initialBoardAtFirstTurn} : {}),
      ...(sourceDealObserver ? {
        initialSourceDealFingerprint:sourceDealObserver.result()
      } : {}),
      ...(sourceDealEpochObserver ? {
        sourceDealEpochs:sourceDealEpochObserver.result(suddenDeathClockResets?.length ?? 0)
      } : {}),
      ...(fullDealObserver ? {
        initialFullPhysicalDealFingerprint:fullDealObserver.result()
      } : {}),
      ...(setupCompensationObserver ? {
        initialSetupCompensation:setupCompensationObserver.result()
      } : {}),
      ...(publicMulliganRevealObserver ? {
        initialPublicMulliganReveals:publicMulliganRevealObserver.result()
      } : {}),
      ...(snorlaxSoloOpeningEvents ? {
        snorlaxSoloOpeningEvents,
        rootSoloSetupSelections,
        rootSoloSetupSelectionProtocol:'actual-Store-dispatched-starting-prompt-v1',
        snorlaxSoloOpeningPolicy:'SoloSnorlaxOwnHandSetup-v1'
      } : {}),
      attackPassProbeCount,
      attackPassProbeBuckets,
      terminalTransition,
      ...(request.captureFinalPublicBoard === true ? {
        finalPublicBoard:publicBoardSnapshot(state),
        finalPendingPromptTypes:state.prompts.filter(prompt=>
          prompt.result===undefined).map(prompt=>({
            type:prompt.constructor.name,
            actorSeat:state.players.findIndex(player=>player.id===prompt.playerId)
          }))
      } : {}),
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
      attachedToolPowerPolicy: request.attachedToolPowerPolicy === true,
      battleCompressorPositiveSelectionCorrection:
        request.battleCompressorPositiveSelectionCorrection === true,
      grandTreeFirstTurnCorrection: request.grandTreeFirstTurnCorrection === true,
      doubleDragonRecovery: request.doubleDragonRecovery === true,
      ...(request.doubleDragonArchiveV3 === true ? {doubleDragonArchiveV3:true} : {}),
      templeUnlockRecovery: request.templeUnlockRecovery === true,
      supporterDecisionCorrection: request.supporterDecisionCorrection === true,
      mandatoryOptionFallback: request.mandatoryOptionFallback === true,
      enforceSelectOptionLegality: request.enforceSelectOptionLegality === true,
      printedCynthiaCaitlinRecovery: request.printedCynthiaCaitlinRecovery === true,
      enforcePrintedCynthiaRecovery: request.enforcePrintedCynthiaRecovery === true,
      guzmaSelfSwitchGuard: request.guzmaSelfSwitchGuard === true,
      dialgaBenchExposureGuard: request.dialgaBenchExposureGuard === true,
      leleEntryAbilityLockCorrection: request.leleEntryAbilityLockCorrection === true,
      radiantGateLockCorrection: request.radiantGateLockCorrection === true,
      entryDrawLockCorrection: request.entryDrawLockCorrection === true,
      eldegossEntryLockCorrection: request.eldegossEntryLockCorrection === true,
      articunoEntryLockCorrection: request.articunoEntryLockCorrection === true,
      distinctAttachTargetsCorrection: request.distinctAttachTargetsCorrection === true,
      herdierTreasureHuntCorrection: request.herdierTreasureHuntCorrection === true,
      mimikyuApexCopycatCompatibility: request.mimikyuApexCopycatCompatibility === true,
      mimikyuApexTimelessPolicy: request.mimikyuApexTimelessPolicy === true,
      mimikyuApexTimelessPolicySeat: request.mimikyuApexTimelessPolicySeat ?? null,
      mimikyuTurn27SetupSeat: request.mimikyuTurn27SetupSeat ?? null,
      mimikyuExtraTurnShredSeat: request.mimikyuExtraTurnShredSeat ?? null,
      mimikyuAutonomousShredSeat: request.mimikyuAutonomousShredSeat ?? null,
      mimikyuDeclaredHistoryCorrection: request.mimikyuDeclaredHistoryCorrection === true,
      regidragoDeclaredHistoryCorrection: request.regidragoDeclaredHistoryCorrection === true,
      passClearsLastAttackCorrection: request.passClearsLastAttackCorrection === true,
      snorlaxRetreatStartCorrection: request.snorlaxRetreatStartCorrection === true,
      electroRainDamageCorrection: request.electroRainDamageCorrection === true,
      electrodeGXEnergyCorrection: request.electrodeGXEnergyCorrection === true,
      electrodeGXPrizeTradePolicy: request.electrodeGXPrizeTradePolicy === true,
      raichuSightToolPolicy: request.raichuSightToolPolicy === true,
      raichuPrizeAllocationPolicy: request.raichuPrizeAllocationPolicy === true,
      redeemableTicketPaperOrderCorrection: request.redeemableTicketPaperOrderCorrection === true,
      ...(request.pendingEndTurnSwitchCleanupCorrection === true ? {
        pendingEndTurnSwitchCleanupCorrection:true,
        pendingEndTurnSwitchCleanupEvidence:pendingEndTurnSwitchCleanupHook.evidence()
      } : {}),
      ...(request.apexSpreadPrizeWindowPolicy === true ? {
        apexSpreadPrizeWindowPolicy:true
      } : {}),
      ...(request.spentGxCopyPolicy === true ? {spentGxCopyPolicy:true} : {}),
      shadowRiderEnergyPriority: request.shadowRiderEnergyPriority === true,
      shadowRiderEnergyAcrossField: request.shadowRiderEnergyAcrossField === true,
      shadowRiderOpeningPivot: request.shadowRiderOpeningPivot === true,
      newMoonNativeOpeningPivotSeat: request.newMoonNativeOpeningPivotSeat ?? null,
      snorlaxSoloOpeningSeat: request.snorlaxSoloOpeningSeat ?? null,
      newMoonAttackPayloadCompressorSeat: request.newMoonAttackPayloadCompressorSeat ?? null,
      rank4RaichuCompressorSeat: request.rank4RaichuCompressorSeat ?? null,
      rank4RaichuRopePivotSeat: request.rank4RaichuRopePivotSeat ?? null,
      rank4RaichuBombRecipientSeat: request.rank4RaichuBombRecipientSeat ?? null,
      newMoonAttackPayloadCompressorBenchedSeat:
        request.newMoonAttackPayloadCompressorBenchedSeat ?? null,
      newMoonAttackPayloadCompressorSecondDonorSeat:
        request.newMoonAttackPayloadCompressorSecondDonorSeat ?? null,
      newMoonOpeningHorrorHouseSeat: request.newMoonOpeningHorrorHouseSeat ?? null,
      latiasAttackReadyAttachment: request.latiasAttackReadyAttachment === true,
      toolAttackAwareness: request.toolAttackAwareness === true,
      toolAttackAwarenessSeat: request.toolAttackAwarenessSeat ?? null,
      bunnelbyK0SafeEvolution: request.bunnelbyK0SafeEvolution === true,
      bunnelbyObservedK1: request.bunnelbyObservedK1 === true,
      gladionVisiblePrizeTargetSeat: request.gladionVisiblePrizeTargetSeat ?? null,
      gladionVisiblePrizeTargetPrint: request.gladionVisiblePrizeTargetPrint ?? null,
      ...(request.bunnelbyObservedK1 === true ? {
        bunnelbyKnowledgeEpochs: optionsBySeat.map(options =>
          options.bunnelbyDeckKnowledgeEpoch.snapshot()),
        bunnelbyKnowledgeEvents: knowledgeEvents
      } : {}),
      bunnelbyTargetAwareEvolution: request.bunnelbyTargetAwareEvolution === true,
      bunnelbyGuzmaHalaMode1: request.bunnelbyGuzmaHalaMode1 === true,
      bunnelbyGuzmaHalaSearch: request.bunnelbyGuzmaHalaSearch === true,
      attackBeforeRetreat: request.attackBeforeRetreat === true,
      attackBeforeRetreatSeat: request.attackBeforeRetreatSeat ?? null,
      policy: (request.doubleDragonRecovery === true ?
        'Twinleaf SimpleTacticsAi/defaultStateScores+' +
        (request.doubleDragonArchiveV3 === true ?
          'DoubleDragonAttachTactic-v3-archive' :
          require('./dde-attach-tactic.cjs').DDE_POLICY_VERSION) :
        'Twinleaf SimpleTacticsAi/defaultStateScores') +
        (request.battleCompressorPositiveSelectionCorrection === true ?
          '+BattleCompressorMin1-paper-v1' : '') +
        (request.supporterDecisionCorrection === true ? '+SupporterDecisionGuard-v1' : '') +
        (request.mandatoryOptionFallback === true ? '+MandatoryOptionDefaultFallback-v1' : '') +
        (request.enforceSelectOptionLegality === true ? '+SelectOptionLegalityGate-v1' : '') +
        (request.printedCynthiaCaitlinRecovery === true ? '+CynthiaCaitlinPrintedMandatoryRecovery-v1' : '') +
        (request.enforcePrintedCynthiaRecovery === true ? '+CynthiaCaitlinPrintedRecoveryGate-v1' : '') +
        (request.guzmaSelfSwitchGuard === true ? '+GuzmaSelfSwitchGuard-v1' : '') +
        (request.dialgaBenchExposureGuard === true ? '+DialgaBenchExposureGuard-v1' : '') +
        (request.templeUnlockRecovery === true ? '+TempleUnlockTactic-v1' : '') +
        (request.snorlaxRetreatStartCorrection === true ? '+SnorlaxBlockStartGate-v1' : '') +
        (request.electroRainDamageCorrection === true ? '+ElectroRainDamage-v1' : '') +
        (request.electrodeGXEnergyCorrection === true ? '+ElectrodeGXMandatoryEnergyAndBotCount-v2' : '') +
        (request.electrodeGXPrizeTradePolicy === true ? '+ElectrodeSourcePrizeTrade-v1' : '') +
        (request.attachedToolPowerPolicy === true ? '+AttachedToolPowerCandidate-v1' : '') +
        (request.raichuSightToolPolicy === true ? '+RaichuSightReservation-v1' : '') +
        (request.raichuPrizeAllocationPolicy === true ? '+RaichuPrizeAllocation-v1' : '') +
        (request.redeemableTicketPaperOrderCorrection === true ? '+TicketPaperPrizeOrder-v1' : '') +
        (request.pendingEndTurnSwitchCleanupCorrection === true ? '+PendingEndTurnSwitchPaper-v1' : '') +
        (request.apexSpreadPrizeWindowPolicy === true ? '+ApexSpreadPrizeWindow-v1' : '') +
        (request.spentGxCopyPolicy === true ? '+SpentGxLegalCopy-v1' : '') +
        (request.shadowRiderEnergyPriority === true ? '+ShadowRiderPsychicAttachPriority-v1' : '') +
        (request.shadowRiderEnergyAcrossField === true ? '+ShadowRiderPsychicAttachAcrossField-v1' : '') +
        (request.shadowRiderOpeningPivot === true ? '+SelectedShadowRiderSetupActive-v1' : '') +
        (request.snorlaxSoloOpeningSeat !== undefined ?
          '+SoloSnorlaxOwnHandSetup-v1@seat' + request.snorlaxSoloOpeningSeat : '') +
        (request.newMoonNativeOpeningPivotSeat !== undefined ?
          '+NewMoonNativeOpeningPivot-v1@seat' + request.newMoonNativeOpeningPivotSeat : '') +
        (request.newMoonAttackPayloadCompressorSeat !== undefined ?
          '+NewMoonCompressorPayload-v1@seat' + request.newMoonAttackPayloadCompressorSeat : '') +
        (request.rank4RaichuCompressorSeat !== undefined ?
          '+Rank4SourceCompressorSpecialEnergy-v1@seat' + request.rank4RaichuCompressorSeat : '') +
        (request.rank4RaichuRopePivotSeat !== undefined ?
          '+Rank4SourceRopeRaichuPivot-v1@seat' + request.rank4RaichuRopePivotSeat : '') +
        (request.rank4RaichuBombRecipientSeat !== undefined ?
          '+Rank4SourceBombRaichuRecipient-v1@seat' + request.rank4RaichuBombRecipientSeat : '') +
        (request.newMoonAttackPayloadCompressorBenchedSeat !== undefined ?
          '+NewMoonCompressorPayload-BenchedMewtwo-v2@seat' +
            request.newMoonAttackPayloadCompressorBenchedSeat : '') +
        (request.newMoonAttackPayloadCompressorSecondDonorSeat !== undefined ?
          '+NewMoonCompressorPayload-SecondDonor-v3@seat' +
            request.newMoonAttackPayloadCompressorSecondDonorSeat : '') +
        (request.newMoonOpeningHorrorHouseSeat !== undefined ?
          '+NewMoonOpeningHorrorHouse-v1@seat' + request.newMoonOpeningHorrorHouseSeat : '') +
        (request.latiasAttackReadyAttachment === true ? '+LatiasAttackReadyAttachment-v1' : '') +
        (request.mimikyuExtraTurnShredSeat !== undefined ? '+MimikyuExtraTurnShred-v1' : '') +
        (request.mimikyuAutonomousShredSeat !== undefined ?
          '+AutonomousApexShred-v1@seat' + request.mimikyuAutonomousShredSeat : '') +
        (request.toolAttackAwareness === true ?
          '+ToolAttackEnumerate-v1@' + (request.toolAttackAwarenessSeat === undefined ?
            'both' : 'seat' + request.toolAttackAwarenessSeat) : '') +
        (request.bunnelbyK0SafeEvolution === true ? '+BunnelbySourceK0PossibleEvolution-v1' : '') +
        (request.bunnelbyObservedK1 === true ? '+BunnelbyRootObservedK1-v1+HiddenPrizeEpoch-v2+FullPrizeReview-v1+KnowledgeEvents-v1' : '') +
        (request.gladionVisiblePrizeTargetSeat !== undefined ?
          '+GladionVisiblePrizePriority-v1@seat' + request.gladionVisiblePrizeTargetSeat +
          ':' + request.gladionVisiblePrizeTargetPrint : '') +
        (request.bunnelbyTargetAwareEvolution === true ? '+BunnelbyStageTargetResolver-v1' : '') +
        (request.bunnelbyGuzmaHalaMode1 === true ? '+BunnelbyGuzmaHalaMode1-v1' : '') +
        (request.bunnelbyGuzmaHalaSearch === true ? '+BunnelbyGHRootSearch-v1' : '') +
        (request.attackBeforeRetreat === true ?
          '+AttackBeforeRetreatTactic-v1@' +
            (request.attackBeforeRetreatSeat === undefined ?
              'both' : 'seat' + request.attackBeforeRetreatSeat) : '') +
        (request.leleEntryAbilityLockCorrection === true ? '+LeleEntryAbilityLockGuard-v1' : '') +
        (request.radiantGateLockCorrection === true ? '+RadiantGateLockGuard-v1' : '') +
        (request.entryDrawLockCorrection === true ? '+EntryDrawLockGuard-v1' : '') +
        (request.eldegossEntryLockCorrection === true ? '+EldegossEntryLockGuard-v1' : '') +
        (request.articunoEntryLockCorrection === true ? '+ArticunoEntryLockGuard-v1' : '') +
        (request.distinctAttachTargetsCorrection === true ? '+DistinctAttachTargetsGuard-v1' : '') +
        (request.herdierTreasureHuntCorrection === true ? '+HerdierTreasureHuntPaper-v1' : '') +
        (request.mimikyuApexCopycatCompatibility === true ? '+MimikyuNonGXCopyApex-v1' : '') +
        (request.mimikyuDeclaredHistoryCorrection === true ? '+MimikyuDeclaredHistory-v1' : '') +
        (request.regidragoDeclaredHistoryCorrection === true ? '+RegidragoDeclaredHistory-v1' : '') +
        (request.mimikyuApexTimelessPolicy === true ? '+MimikyuApexTimelessCounterPolicy-v1' : '') +
        (request.mimikyuTurn27SetupSeat !== undefined ?
          '+SourceMimikyuTurn27Setup-v1@seat' + request.mimikyuTurn27SetupSeat : '') +
        (request.passClearsLastAttackCorrection === true ? '+PassClearsLastAttack-v1' : '') +
        (request.enforceVisiblePlayLockSeat !== undefined ?
          '+LivePlayLockDispatchVeto-v2@seat' + request.enforceVisiblePlayLockSeat : '') +
        (request.enforceVisiblePlayLockBothSeats === true ?
          '+LivePlayLockDispatchVeto-v2@both' : '') +
        (request.visiblePlayLockSupporterSeat !== undefined ?
          '+HeldLillieIfLegalElsePass-v1@seat' + request.visiblePlayLockSupporterSeat : '') +
        (request.visiblePlayLockBasicBenchFallback === true ?
          '+LiveLockBasicBenchAlternative-experimental-v1@both' : '') +
        (request.prototypeSafeSimulatorIsolation === true ?
          '+PrototypeSafeSimulatorIsolation-experimental-v1' : '') +
        (request.postSuperAliasRepairIsolation === true ?
          '+PostSuperAliasRepairIsolation-experimental-v2' : ''),
      prototypeSafeSimulatorIsolation: request.prototypeSafeSimulatorIsolation === true,
      postSuperAliasRepairIsolation: request.postSuperAliasRepairIsolation === true,
      livePlayLockGuardSeat: request.enforceVisiblePlayLockSeat ?? null,
      livePlayLockGuardBothSeats: request.enforceVisiblePlayLockBothSeats === true,
      visiblePlayLockSupporterSeat: request.visiblePlayLockSupporterSeat ?? null,
      visiblePlayLockBasicBenchFallback: request.visiblePlayLockBasicBenchFallback === true,
      policyRandomIsolation: request.isolatePolicyRandomness === true,
      randomnessProtocol: request.isolatePolicyRandomness === true ?
        'separate-game-and-per-seat-policy-prng-v1' : 'legacy-shared-prng',
      engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05'
    };
  } finally {
    if (restoreBattleCompressorMinimumHook) restoreBattleCompressorMinimumHook();
    if (restorePassClearsLastAttackHook) restorePassClearsLastAttackHook();
    if (restoreCopyDeclaredHistoryHook) restoreCopyDeclaredHistoryHook();
    if (restoreMimikyuNonGxCopycatHook) restoreMimikyuNonGxCopycatHook();
    if (restoreHerdierTreasureHuntHook) restoreHerdierTreasureHuntHook();
    if (restoreDistinctAttachTargetsHook) restoreDistinctAttachTargetsHook();
    if (restoreArticunoEntryLockHook) restoreArticunoEntryLockHook();
    if (restoreEldegossEntryLockHook) restoreEldegossEntryLockHook();
    if (restoreEntryDrawLockHook) restoreEntryDrawLockHook();
    if (restoreRadiantGateLockHook) restoreRadiantGateLockHook();
    if (restoreLeleEntryAbilityLockHook) restoreLeleEntryAbilityLockHook();
    if (restoreSnorlaxRetreatStartHook) restoreSnorlaxRetreatStartHook();
    if (restoreElectroRainDamageHook) restoreElectroRainDamageHook();
    if (restoreElectrodeGXEnergyHook) restoreElectrodeGXEnergyHook();
    if (restoreHisuianHeavyBallPrizeShuffleHook) restoreHisuianHeavyBallPrizeShuffleHook();
    if (terminalAttackKoBeforeEndTurnHook) terminalAttackKoBeforeEndTurnHook.restore();
    if (pendingEndTurnSwitchCleanupHook) pendingEndTurnSwitchCleanupHook.restore();
    if (restoreSpentGxCopyPolicy) restoreSpentGxCopyPolicy();
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
