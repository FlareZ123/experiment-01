'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent49-owner-quick-ball-source-bound-continuation-v1';
const PRINTINGS = new Set(['Quick Ball FST', 'Quick Ball SSH']);
const COST_MESSAGE = 'CHOOSE_CARD_TO_DISCARD';
const SEARCH_MESSAGE = 'CHOOSE_CARD_TO_HAND';
const DEFAULT_BASIC_PRIORITY = Object.freeze([
  'Shadow Rider Calyrex V CRE',
  "Lillie's Clefairy ex JTG",
  'Tapu Lele-GX GRI',
  'Trevenant & Dusknoir-GX SMP',
  'Latias ex SSP',
  'Dialga-GX UPR',
  'Mimikyu GRI',
  'Girafarig LOT',
  'Marshadow UNB',
  'Radiant Eternatus CRZ'
]);

function isQuickBall(card) {
  return PRINTINGS.has(card?.fullName);
}

/**
 * Choose one exact physical owner-hand card from a duplicated printing.
 * The candidate fixture has three Psychic Energy, so one exact Energy object
 * is a safe, reproducible donor. Prefer a duplicated non-Energy when one is
 * available; never choose the Quick Ball itself.
 */
function chooseQuickBallPaymentCard(owner, itemRef) {
  const hand = owner?.hand?.cards;
  if (!Array.isArray(hand) || !hand.includes(itemRef)) return null;
  const groups = new Map();
  for (const card of hand) {
    if (card === itemRef || typeof card.fullName !== 'string') continue;
    if (!groups.has(card.fullName)) groups.set(card.fullName, []);
    groups.get(card.fullName).push(card);
  }
  const duplicates = [...groups.values()].filter(group => group.length >= 2);
  if (duplicates.length === 0) return null;
  const nonEnergy = duplicates.find(group => group[0].name !== 'Psychic Energy');
  if (nonEnergy) return nonEnergy[0];
  const psychicEnergy = duplicates.find(group => group[0].name === 'Psychic Energy');
  return psychicEnergy?.[0] ?? duplicates[0][0];
}

/**
 * Select only from the exact live owner-deck ChooseCardsPrompt. The native
 * validator is authoritative; the preferred list is merely a deterministic
 * ordering over cards actually offered by that prompt.
 */
function chooseQuickBallSearchTarget(prompt, state, preferredFullNames = DEFAULT_BASIC_PRIORITY) {
  const offered = prompt?.cards?.cards;
  if (!Array.isArray(offered) || typeof prompt.validate !== 'function') {
    return { valid: false, cards: [], selectedCard: null };
  }
  const allowed = offered.filter(card => {
    try {
      return prompt.validate([card], state) === true;
    } catch {
      return false;
    }
  });
  for (const preferred of preferredFullNames) {
    const selectedCard = allowed.find(card => card.fullName === preferred);
    if (selectedCard) return { valid: true, cards: [selectedCard], selectedCard };
  }
  if (allowed.length > 0) {
    return { valid: true, cards: [allowed[0]], selectedCard: allowed[0] };
  }
  try {
    if (prompt.validate([], state) === true) {
      return { valid: true, cards: [], selectedCard: null };
    }
  } catch {
    // Fail closed below.
  }
  return { valid: false, cards: [], selectedCard: null };
}

/**
 * Continue an already accepted Quick Ball only for explicitly eligible seats.
 *
 * Apply this wrapper INSIDE the run callback passed to
 * withCandidateOpponentPolicyRoles. That ordering makes it the outermost
 * decodeNextAction wrapper, so it handles these exact owner prompts before the
 * actor-only policy can delegate them to the generic bot.
 *
 * The cost and search prompts are bound to the exact physical Quick Ball via
 * Store.stampTrainerPrompt's sourceCard, not merely a matching printing.
 * Payment and target are also exact Card objects and are checked after native
 * Store dispatch. Deck identities are read only inside the owner's actual
 * live CHOOSE_CARD_TO_HAND prompt. No opponent hand, deck, or Prize identity is
 * inspected or included in the public audit.
 *
 * @template T
 * @param {()=>T} execute Synchronous pinned-native fixture workload.
 * @param {object} [deps] Native injection and test seams.
 * @returns {{result:T,audit:object}}
 */
function withOwnerQuickBallPromptContinuation(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const Bot = deps.SimpleTacticsAi ??
    require('../../../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store = deps.Store ??
    require('../../../vendor/twinleaf/ptcg-server/output/game/store/store').Store;
  const ResolvePromptAction = deps.ResolvePromptAction ??
    require('../../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const choosePayment = deps.choosePayment ?? chooseQuickBallPaymentCard;
  const preferredFullNames = deps.preferredBasicFullNames ?? DEFAULT_BASIC_PRIORITY;
  const eligibleSeats = new Set(deps.eligibleSeats ?? [0]);
  const trace = deps.trace ?? (() => {});

  const originalDecode = Object.getOwnPropertyDescriptor(Bot.prototype, 'decodeNextAction');
  const originalDispatch = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof originalDecode?.value, 'function');
  assert.equal(typeof originalDispatch?.value, 'function');

  let liveStore = deps.initialLiveStore ?? null;
  const plans = new Map();
  const plannedReplies = new WeakMap();
  const awaitingFinality = new Map();
  const awaitingBenchPlacement = new Map();
  const audit = {
    version: VERSION,
    ownerOnly: true,
    eligibleSeats: [...eligibleSeats],
    quickBallRootsSeen: 0,
    quickBallRootsAccepted: 0,
    rootsWithoutPhysicalDonor: 0,
    rootSourceBindingFailures: 0,
    paymentPromptProposals: 0,
    paymentPhysicalAcceptances: 0,
    paymentPhysicalFailures: 0,
    searchPromptProposals: 0,
    targetPhysicalRetrievals: 0,
    targetPhysicalBenchPlacements: 0,
    targetPhysicalBenchPlacementFailures: 0,
    completedSetupChains: 0,
    emptySearchAcceptances: 0,
    searchPhysicalFailures: 0,
    completedPhysicalChains: 0,
    nativeItemFinalizations: 0,
    sourceCardBindingFailures: 0,
    promptShapeMismatches: 0,
    rejectedNativeReplies: 0,
    nonLiveStateFallbacks: 0,
    excludedAuxiliaryDispatches: 0,
    pendingPlansAtEnd: 0,
    pendingFinalityAtEnd: 0,
    pendingBenchPlacementsAtEnd: 0,
    actorDecisionPolicyChanged: false,
    competitiveQualifiedGames: 0
  };

  function log(phase, plan, extra = {}) {
    trace({
      phase,
      seat: plan?.seat ?? null,
      turn: plan?.turn ?? null,
      step: plan?.step ?? null,
      ...extra
    });
  }

  function maybeCompleteSetup(plan) {
    if (plan?.costSettled === true &&
        plan?.targetRetrieved === true &&
        plan?.targetBenched === true &&
        plan?.itemFinalized === true &&
        plan.setupCompleted !== true) {
      plan.setupCompleted = true;
      audit.completedSetupChains++;
      log('quick-ball-setup-chain-completed', plan);
    }
  }

  function settleFinality(state) {
    for (const [ownerId, plan] of awaitingFinality) {
      const owner = state.players?.[plan.seat];
      if (!owner) continue;
      const sourcePromptsPending = state.prompts?.some(prompt =>
        prompt.result === undefined && prompt.sourceCard === plan.itemRef
      ) === true;
      if (!sourcePromptsPending && owner.discard?.cards?.includes(plan.itemRef)) {
        audit.nativeItemFinalizations++;
        plan.itemFinalized = true;
        awaitingFinality.delete(ownerId);
        maybeCompleteSetup(plan);
        log('quick-ball-native-item-finalized', plan);
      }
    }
  }

  function settleBenchPlacement(state) {
    for (const [ownerId, plan] of awaitingBenchPlacement) {
      const owner = state.players?.[plan.seat];
      if (!owner) continue;
      const inBench = Array.isArray(owner.bench) && owner.bench.some(slot => {
        try {
          return typeof slot?.getPokemonCard === 'function'
            ? slot.getPokemonCard() === plan.selectedCard
            : slot === plan.selectedCard;
        } catch {
          return false;
        }
      });
      const inHand = owner.hand?.cards?.includes(plan.selectedCard) === true;
      const inDeck = owner.deck?.cards?.includes(plan.selectedCard) === true;
      if (inBench && !inHand && !inDeck) {
        plan.targetBenched = true;
        audit.targetPhysicalBenchPlacements++;
        awaitingBenchPlacement.delete(ownerId);
        maybeCompleteSetup(plan);
        log('quick-ball-target-physically-benched', plan);
        continue;
      }
      const ownerTurnEnded = state.activePlayer !== plan.seat;
      const targetLeftExpectedZones = !inHand && !inDeck && !inBench;
      if (ownerTurnEnded || targetLeftExpectedZones) {
        audit.targetPhysicalBenchPlacementFailures++;
        awaitingBenchPlacement.delete(ownerId);
        log('quick-ball-target-bench-placement-failed', plan, {
          ownerTurnEnded,
          targetStillInHand: inHand,
          targetStillInDeck: inDeck
        });
      }
    }
  }

  function decode(state, ...rest) {
    if (state !== liveStore?.state) {
      audit.nonLiveStateFallbacks++;
      return originalDecode.value.apply(this, [state, ...rest]);
    }
    const ownerId = this.client?.id;
    const plan = plans.get(ownerId);
    if (!plan) return originalDecode.value.apply(this, [state, ...rest]);
    if (state.turn !== plan.turn || state.activePlayer !== plan.seat) {
      plans.delete(ownerId);
      audit.promptShapeMismatches++;
      log('quick-ball-stale-plan', plan);
      return originalDecode.value.apply(this, [state, ...rest]);
    }

    const prompt = state.prompts?.find(item =>
      item.result === undefined && item.playerId === ownerId
    );
    if (!prompt) return originalDecode.value.apply(this, [state, ...rest]);
    const owner = state.players?.[plan.seat];
    if (!owner || owner.id !== ownerId) {
      return originalDecode.value.apply(this, [state, ...rest]);
    }
    if (prompt.sourceCard !== plan.itemRef || !owner.supporter?.cards?.includes(plan.itemRef)) {
      audit.sourceCardBindingFailures++;
      plans.delete(ownerId);
      log('quick-ball-prompt-source-binding-failed', plan, {
        promptKind: prompt.constructor?.name ?? null
      });
      return originalDecode.value.apply(this, [state, ...rest]);
    }
    if (prompt.constructor?.name !== 'ChooseCardsPrompt') {
      return originalDecode.value.apply(this, [state, ...rest]);
    }

    if (plan.step === 'cost') {
      const offered = prompt.cards?.cards;
      const authentic = prompt.message === COST_MESSAGE &&
        Array.isArray(offered) &&
        offered.includes(plan.paymentRef) &&
        owner.hand.cards.includes(plan.paymentRef) &&
        prompt.options?.min === 1 &&
        prompt.options?.max === 1;
      if (!authentic || prompt.validate([plan.paymentRef], state) !== true) {
        audit.promptShapeMismatches++;
        log('quick-ball-cost-prompt-mismatch', plan);
        return originalDecode.value.apply(this, [state, ...rest]);
      }
      const reply = new ResolvePromptAction(prompt.id, [plan.paymentRef]);
      plannedReplies.set(reply, {
        ownerId, seat: plan.seat, turn: plan.turn, step: 'cost',
        itemRef: plan.itemRef, paymentRef: plan.paymentRef
      });
      audit.paymentPromptProposals++;
      log('quick-ball-cost-prompt-proposed', plan);
      return reply;
    }

    if (plan.step === 'search') {
      const authentic = prompt.message === SEARCH_MESSAGE &&
        prompt.cards === owner.deck &&
        prompt.options?.min === 0 &&
        prompt.options?.max === 1 &&
        plan.costSettled === true;
      if (!authentic) {
        audit.promptShapeMismatches++;
        log('quick-ball-search-prompt-mismatch', plan);
        return originalDecode.value.apply(this, [state, ...rest]);
      }
      const choice = chooseQuickBallSearchTarget(prompt, state, preferredFullNames);
      if (!choice.valid) {
        audit.searchPhysicalFailures++;
        log('quick-ball-search-no-valid-choice', plan);
        return originalDecode.value.apply(this, [state, ...rest]);
      }
      const reply = new ResolvePromptAction(prompt.id, choice.cards);
      plannedReplies.set(reply, {
        ownerId, seat: plan.seat, turn: plan.turn, step: 'search',
        itemRef: plan.itemRef, selectedCard: choice.selectedCard
      });
      audit.searchPromptProposals++;
      log('quick-ball-search-prompt-proposed', plan, {
        selected: choice.selectedCard !== null
      });
      return reply;
    }

    audit.promptShapeMismatches++;
    return originalDecode.value.apply(this, [state, ...rest]);
  }

  function dispatch(action, ...rest) {
    if (action?.constructor?.name === 'AddPlayerAction' && this !== liveStore) {
      liveStore = this;
      plans.clear();
      awaitingFinality.clear();
      awaitingBenchPlacement.clear();
    }
    const real = this === liveStore;
    if (!real) {
      audit.excludedAuxiliaryDispatches++;
      return originalDispatch.value.apply(this, [action, ...rest]);
    }

    const state = this.state;
    let opportunity = null;
    if (action?.constructor?.name === 'PlayCardAction' &&
        Number.isInteger(action.handIndex) &&
        !state.prompts?.some(prompt => prompt.result === undefined)) {
      const seat = state.activePlayer;
      const owner = state.players?.[seat];
      if (eligibleSeats.has(seat) &&
          (owner?.id === action.id || owner?.id === action.playerId)) {
        const itemRef = owner.hand.cards[action.handIndex];
        if (isQuickBall(itemRef)) {
          audit.quickBallRootsSeen++;
          const paymentRef = choosePayment(owner, itemRef);
          if (paymentRef && paymentRef !== itemRef) {
            opportunity = {
              ownerId: owner.id,
              seat,
              turn: state.turn,
              itemRef,
              paymentRef
            };
          } else {
            audit.rootsWithoutPhysicalDonor++;
          }
        }
      }
    }

    const reply = plannedReplies.get(action);
    let result;
    try {
      result = originalDispatch.value.apply(this, [action, ...rest]);
    } catch (error) {
      if (opportunity) audit.rootSourceBindingFailures++;
      if (reply) audit.rejectedNativeReplies++;
      throw error;
    }

    if (opportunity) {
      const after = this.state;
      const owner = after.players?.[opportunity.seat];
      const prompt = after.prompts?.find(item =>
        item.result === undefined && item.playerId === opportunity.ownerId
      );
      const sourceBound = owner?.supporter?.cards?.includes(opportunity.itemRef) === true &&
        prompt?.constructor?.name === 'ChooseCardsPrompt' &&
        prompt.sourceCard === opportunity.itemRef;
      if (sourceBound) {
        const plan = {
          ...opportunity,
          step: 'cost',
          costSettled: false
        };
        if (prompt.message === SEARCH_MESSAGE &&
            prompt.cards === owner.deck &&
            owner.discard.cards.includes(opportunity.paymentRef) &&
            !owner.hand.cards.includes(opportunity.paymentRef)) {
          plan.step = 'search';
          plan.costSettled = true;
          audit.quickBallRootsAccepted++;
          audit.paymentPhysicalAcceptances++;
        } else if (prompt.message === COST_MESSAGE &&
                   prompt.cards?.cards?.includes(opportunity.paymentRef) &&
                   owner.hand.cards.includes(opportunity.paymentRef)) {
          audit.quickBallRootsAccepted++;
        } else {
          audit.rootSourceBindingFailures++;
          log('quick-ball-root-prompt-shape-failed', plan, {
            promptMessage: prompt.message ?? null
          });
          return result;
        }
        plans.set(opportunity.ownerId, plan);
        log('quick-ball-root-source-bound', plan);
      } else {
        audit.rootSourceBindingFailures++;
        log('quick-ball-root-source-binding-failed', opportunity);
      }
    }

    if (reply) {
      const owner = this.state.players?.[reply.seat];
      const plan = plans.get(reply.ownerId);
      if (reply.step === 'cost') {
        const settled = owner?.discard?.cards?.includes(reply.paymentRef) === true &&
          owner?.hand?.cards?.includes(reply.paymentRef) === false;
        if (settled && plan) {
          audit.paymentPhysicalAcceptances++;
          plan.costSettled = true;
          plan.step = 'search';
          const nextPrompt = this.state.prompts?.find(item =>
            item.result === undefined && item.playerId === reply.ownerId
          );
          if (nextPrompt?.constructor?.name !== 'ChooseCardsPrompt' ||
              nextPrompt.message !== SEARCH_MESSAGE ||
              nextPrompt.cards !== owner.deck ||
              nextPrompt.sourceCard !== reply.itemRef) {
            audit.sourceCardBindingFailures++;
            plans.delete(reply.ownerId);
          } else {
            log('quick-ball-cost-physically-settled', plan);
          }
        } else {
          audit.paymentPhysicalFailures++;
          plans.delete(reply.ownerId);
          log('quick-ball-cost-physical-settlement-failed', reply);
        }
      } else if (reply.step === 'search') {
        const settled = reply.selectedCard === null ||
          (owner?.hand?.cards?.includes(reply.selectedCard) === true &&
           owner?.deck?.cards?.includes(reply.selectedCard) === false);
        if (settled && reply.selectedCard) {
          audit.targetPhysicalRetrievals++;
        } else if (settled) {
          audit.emptySearchAcceptances++;
        } else {
          audit.searchPhysicalFailures++;
        }
        if (settled && plan?.costSettled === true && reply.selectedCard) {
          audit.completedPhysicalChains++;
          plan.selectedCard = reply.selectedCard;
          plan.targetRetrieved = true;
          awaitingBenchPlacement.set(reply.ownerId, plan);
        }
        plans.delete(reply.ownerId);
        if (plan) awaitingFinality.set(reply.ownerId, plan);
        log('quick-ball-search-physically-settled', plan, {
          targetRetrieved: Boolean(reply.selectedCard && settled)
        });
      }
    }

    settleFinality(this.state);
    settleBenchPlacement(this.state);
    return result;
  }

  Object.defineProperty(Bot.prototype, 'decodeNextAction',
    { ...originalDecode, value: decode });
  Object.defineProperty(Store.prototype, 'dispatch',
    { ...originalDispatch, value: dispatch });
  try {
    const result = execute();
    audit.pendingPlansAtEnd = plans.size;
    audit.pendingFinalityAtEnd = awaitingFinality.size;
    audit.pendingBenchPlacementsAtEnd = awaitingBenchPlacement.size;
    return { result, audit };
  } finally {
    assert.strictEqual(Bot.prototype.decodeNextAction, decode);
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    Object.defineProperty(Store.prototype, 'dispatch', originalDispatch);
    Object.defineProperty(Bot.prototype, 'decodeNextAction', originalDecode);
  }
}

module.exports = {
  VERSION,
  isQuickBall,
  chooseQuickBallPaymentCard,
  chooseQuickBallSearchTarget,
  withOwnerQuickBallPromptContinuation
};
