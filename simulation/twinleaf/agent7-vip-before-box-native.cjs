'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {flexibleFirstTurnBoxOffer} =
  require('./agent44-flexible-box-k0-plan.cjs');

const VERSION = 'agent7-rank8-symmetric-vip-before-flexbox-v1';
const BASE = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * An owner-root opportunity to spend exactly one held VIP before the
 * existing Box/Shake line. The real owner deck is intentionally unavailable:
 * this function never claims that a searchable Basic survives Prizes.
 *
 * @param {{turn:number,handNames:string[],benchNames:(string|null)[],
 *   activeName:string|null,itemLocked:boolean,toolLocked:boolean}} view
 * @returns {{eligible:boolean,reason:string,anticipatedBox:object|null}}
 */
function offerVipBeforeBox(view) {
  const reject = reason => ({
    eligible: false, reason, anticipatedBox: null
  });
  const original = flexibleFirstTurnBoxOffer(view);
  if (!original.eligible) return reject('ORIGINAL_BOX_K0_ABSENT');
  if (view.itemLocked) return reject('OWNER_ITEM_LOCK');
  const vipIndex = view.handNames.indexOf('Battle VIP Pass');
  if (vipIndex < 0) return reject('NO_HELD_BATTLE_VIP_PASS');
  const open = view.benchNames.indexOf(null);
  if (open < 0) return reject('NO_OPEN_BENCH_FOR_VIP');
  const afterHand = [...view.handNames];
  afterHand.splice(vipIndex, 1);
  const afterBench = [...view.benchNames];
  afterBench[open] = view.activeName === 'Trubbish' ||
    view.benchNames.includes('Trubbish') ? 'Mega Absol ex' : 'Trubbish';
  const anticipatedBox = flexibleFirstTurnBoxOffer({
    ...view, handNames: afterHand, benchNames: afterBench
  });
  if (!anticipatedBox.eligible)
    return reject('VIP_FIRST_LOSES_BOX_K0_PAYMENT');
  return {
    eligible: true,
    reason: 'VIP_FIRST_RETAINS_THREE_CARD_BOX_K0',
    anticipatedBox
  };
}

/**
 * Choose ONE authorized owner-deck Basic, preferring an original rank8
 * Trubbish if not in play. A single Bench entry preserves other Bench slots
 * and leaves the Box/Shake implementation responsible for its own K1.
 * No owner deck or opponent hidden zone is inspected outside this prompt.
 *
 * @param {object} prompt Native ChooseCardsPrompt owning the actual deck.
 * @param {object} owner Live acting owner's public in-play Pokémon only.
 * @param {{basic:number,pokemon:number}} types Pinned card enum values.
 * @param {object} state Genuine native Store state for validation.
 * @returns {object|null} One physically present validated Basic or null.
 */
function selectOwnedVipBasic(prompt, owner, types, state) {
  const live = [owner.active, ...owner.bench].some(slot =>
    slot.getPokemonCard()?.name === 'Trubbish');
  const eligible = prompt.cards.cards.filter(card =>
    card.superType === types.pokemon &&
    card.stage === types.basic &&
    prompt.validate([card], state) === true);
  const trubbish = live ? null : eligible.find(card =>
    card.name === 'Trubbish');
  return trubbish ??
    eligible.find(card => card.name === 'Mega Absol ex') ??
    eligible[0] ?? null;
}

/**
 * Install inside Agent44's existing firstturn Box hook so a physically
 * affordable VIP-before-Box candidate receives root priority. Strictly
 * default-off at all call sites. Original Box hook handles its own payment,
 * owner-K1 search and native Shake evolution after the VIP search resolves.
 *
 * @template T
 * @param {()=>T} execute Actual pinned headless Store workload.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,
 *   cardActions?:object,ResolvePromptAction?:Function,
 *   types?:object,GamePhase?:object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerVipBeforeBox(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const engine = name => require(path.join(BASE, name));
  const SimpleTacticsAi = deps.SimpleTacticsAi ??
    engine('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store = deps.Store ?? engine('game/store/store').Store;
  const {PlayCardAction, PlayerType, SlotType} = deps.cardActions ??
    engine('game/store/actions/play-card-action');
  const ResolvePromptAction = deps.ResolvePromptAction ??
    engine('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const {Stage, SuperType} = deps.types ??
    engine('game/store/card/card-types');
  const GamePhase = deps.GamePhase ??
    engine('game/store/state/state').GamePhase;
  const priorBot = Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype, 'decodeNextAction');
  const priorDispatch = Object.getOwnPropertyDescriptor(
    Store.prototype, 'dispatch');
  assert.equal(typeof priorBot?.value, 'function');
  assert.equal(typeof priorDispatch?.value, 'function');

  const proposals = new WeakMap();
  const waiting = new Map();
  const spent = new Set();
  let liveStore = null;
  const audit = {
    version: VERSION, symmetricBothSeats: true,
    priority: 'VIP-before-Box if both Box payment predicates remain true',
    ownerDeckReadOnlyDuringAuthorizedPrompt: true,
    originalSourcePrintingRequired: false,
    k0Contenders: 0, proposedVipRoots: 0,
    acceptedVipRoots: 0, rejectedVipRoots: 0,
    proposedVipSearches: 0, acceptedVipSearches: 0,
    rejectedVipSearches: 0, physicalBenchConfirmed: 0,
    physicalBenchUnconfirmed: 0, emptyNativeBasicSearch: 0,
    unresolvedOwnerSearches: 0,
    witnessedNativeStore: false,
    bySeat: {0: {vip: 0, search: 0, physical: 0},
      1: {vip: 0, search: 0, physical: 0}},
    offers: [], outcomes: [],
    competitiveQualifiedGames: 0
  };
  const record = (array, value, cap = 96) => {
    if (array.length < cap) array.push(value);
  };
  const promptMessage = 'CHOOSE_CARD_TO_PUT_ONTO_BENCH';

  function decode(state) {
    if (state !== liveStore?.state ||
        state.phase !== GamePhase.PLAYER_TURN)
      return priorBot.value.call(this, state);
    const seat = state.players.findIndex(p => p.id === this.client?.id);
    if (seat !== 0 && seat !== 1)
      return priorBot.value.call(this, state);
    const owner = state.players[seat];
    const pending = state.prompts.find(p => p.result === undefined);
    const awaiting = waiting.get(owner.id);
    if (pending && pending.playerId === owner.id &&
        awaiting?.turn === state.turn &&
        pending.constructor.name === 'ChooseCardsPrompt' &&
        pending.message === promptMessage &&
        pending.cards === owner.deck) {
      const selected = selectOwnedVipBasic(pending, owner,
        {basic: Stage.BASIC, pokemon: SuperType.POKEMON}, state);
      if (!selected) {
        audit.emptyNativeBasicSearch++;
        waiting.delete(owner.id);
        return priorBot.value.call(this, state);
      }
      const action = new ResolvePromptAction(pending.id, [selected]);
      proposals.set(action, {
        kind: 'vip-search', seat, turn: state.turn,
        promptId: pending.id, selectedCard: selected,
        selectedPrinting: selected.fullName
      });
      audit.proposedVipSearches++;
      return action;
    }
    if (pending || state.activePlayer !== seat ||
        (state.turn !== 1 && state.turn !== 2) ||
        spent.has(seat + ':' + state.turn))
      return priorBot.value.call(this, state);

    const view = {
      turn: state.turn,
      handNames: owner.hand.cards.map(c => c.name),
      activeName: owner.active.getPokemonCard()?.name ?? null,
      benchNames: owner.bench.map(slot =>
        slot.getPokemonCard()?.name ?? null),
      itemLocked: owner.cannotPlayItemCards === true,
      toolLocked: owner.cannotPlayToolCards === true
    };
    const offer = offerVipBeforeBox(view);
    if (!offer.eligible) return priorBot.value.call(this, state);
    const handIndex = owner.hand.cards.findIndex(c =>
      c.name === 'Battle VIP Pass');
    assert.ok(handIndex >= 0);
    audit.k0Contenders++;
    record(audit.offers, {
      seat, turn: state.turn, reason: offer.reason,
      originalHandCount: view.handNames.length,
      openingBenchOccupancy: view.benchNames.filter(Boolean).length,
      alternativePaymentNames: offer.anticipatedBox.discardNames
    });
    const action = new PlayCardAction(owner.id, handIndex, {
      player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
    });
    proposals.set(action, {
      kind: 'vip-root', seat, turn: state.turn,
      originalHandIndex: handIndex
    });
    audit.proposedVipRoots++;
    return action;
  }

  function dispatch(action, ...rest) {
    if (action?.constructor?.name === 'AddPlayerAction') {
      liveStore = this;
      waiting.clear();
      spent.clear();
      audit.witnessedNativeStore = true;
    }
    const event = this === liveStore ? proposals.get(action) : null;
    if (!event) return priorDispatch.value.apply(this, [action, ...rest]);
    const owner = this.state.players[event.seat];
    const beforeDeck = owner.deck.cards.length;
    const beforeBench = owner.bench.filter(slot =>
      slot.getPokemonCard()).length;
    try {
      const result = priorDispatch.value.apply(this, [action, ...rest]);
      if (event.kind === 'vip-root') {
        audit.acceptedVipRoots++;
        audit.bySeat[event.seat].vip++;
        waiting.set(owner.id, {turn: event.turn, seat: event.seat});
        spent.add(event.seat + ':' + event.turn);
      } else {
        audit.acceptedVipSearches++;
        audit.bySeat[event.seat].search++;
        waiting.delete(owner.id);
        const after = this.state.players[event.seat];
        const benchPhysical = after.bench.some(slot =>
          slot.cards.includes(event.selectedCard));
        const physical = benchPhysical &&
          after.deck.cards.length === beforeDeck - 1 &&
          after.bench.filter(slot =>
            slot.getPokemonCard()).length === beforeBench + 1;
        if (physical) {
          audit.physicalBenchConfirmed++;
          audit.bySeat[event.seat].physical++;
        } else audit.physicalBenchUnconfirmed++;
        record(audit.outcomes, {
          kind: 'vip-search', seat: event.seat, turn: event.turn,
          selectedPrinting: event.selectedPrinting,
          physicallyConfirmed: physical,
          deckBefore: beforeDeck, deckAfter: after.deck.cards.length,
          benchBefore: beforeBench,
          benchAfter: after.bench.filter(slot =>
            slot.getPokemonCard()).length
        });
      }
      return result;
    } catch (error) {
      if (event.kind === 'vip-root') audit.rejectedVipRoots++;
      else audit.rejectedVipSearches++;
      record(audit.outcomes, {
        kind: event.kind, seat: event.seat, turn: event.turn,
        error: String(error?.message ?? error)
      });
      throw error;
    }
  }

  Object.defineProperty(SimpleTacticsAi.prototype,
    'decodeNextAction', {...priorBot, value: decode});
  Object.defineProperty(Store.prototype,
    'dispatch', {...priorDispatch, value: dispatch});
  try {
    const result = execute();
    audit.unresolvedOwnerSearches = waiting.size;
    return {result, audit};
  } catch (error) {
    audit.unresolvedOwnerSearches = waiting.size;
    error.agent7VipBeforeBoxAudit = audit;
    throw error;
  } finally {
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction, decode);
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    Object.defineProperty(Store.prototype, 'dispatch', priorDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction', priorBot);
  }
}

module.exports = {
  VERSION, offerVipBeforeBox, selectOwnedVipBasic, withOwnerVipBeforeBox
};
