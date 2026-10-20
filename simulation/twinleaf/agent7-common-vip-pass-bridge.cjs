'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const VIP = 'Battle VIP Pass FST';

/**
 * First-own-turn fallback opportunity, using only the owner hand, public
 * Bench, normal turn counter and pending-prompt status. The native engine
 * remains authoritative for lock conditions and actual action legality.
 * @param {object} state Pinned state, not inspected beyond public turn fields.
 * @param {object} own Acting player's state, owner hand and own public board.
 * @param {0|1} seat Physical acting-player seat.
 * @param {number} playerTurn Pinned GamePhase.PLAYER_TURN.
 * @returns {boolean}
 */
function eligibleFirstTurnVip(state, own, seat, playerTurn) {
  return state.turn >= 1 && state.turn <= 2 &&
    state.activePlayer === seat && state.phase === playerTurn &&
    !state.prompts.some(p => p.result === undefined) &&
    own.hand.cards.some(card => card.fullName === VIP) &&
    own.bench.some(slot => !slot.getPokemonCard());
}

/**
 * Resolve the owner-authorized search only after native ChooseCardsPrompt.
 * Search all distinct physical pairs first, then singles. Prefer distinct
 * printings absent from the public board. Every returned selection must pass
 * the prompt's actual native validator. This is deliberately a basic fallback
 * rather than a claim about optimal Pokémon search targets.
 * @param {object} own Acting owner's publicly occupied Pokémon slots.
 * @param {object} prompt Actual owner-deck ChooseCardsPrompt.
 * @param {object} state Native live state used only for prompt.validate.
 * @returns {object[]} Original eligible card object references, or [].
 */
function chooseCommonVipBasics(own, prompt, state) {
  const inPlay = new Set([own.active, ...own.bench]
    .map(slot => slot.getPokemonCard()?.fullName).filter(Boolean));
  const cards = prompt.cards.cards.slice().sort((a, b) =>
    Number(inPlay.has(a.fullName)) - Number(inPlay.has(b.fullName)) ||
    a.fullName.localeCompare(b.fullName));
  const spots = own.bench.filter(slot => !slot.getPokemonCard()).length;
  if (spots >= 2) {
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        if (cards[i].fullName === cards[j].fullName) continue;
        const pair = [cards[i], cards[j]];
        if (prompt.validate(pair, state)) return pair;
      }
    }
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const pair = [cards[i], cards[j]];
        if (prompt.validate(pair, state)) return pair;
      }
    }
  }
  if (spots >= 1) {
    for (const card of cards) {
      if (prompt.validate([card], state)) return [card];
    }
  }
  return [];
}

/**
 * Opt-in shared fallback: after the existing bot would Pass on the first own
 * turn, play a native-valid held Battle VIP Pass, and resolve its actual
 * owner-deck prompt. Applies identically to either candidate deck/seat.
 * This one tactic cannot certify the surrounding generic bot is
 * hidden-information-safe or competitively competent.
 * @template T
 * @param {0|1} seat Physical candidate seat.
 * @param {()=>T} execute Synchronous game runner.
 * @param {object} [deps] Optional pinned-engine dependency test seam.
 * @returns {{result:T,audit:object}}
 */
function withCommonVipPassBridge(seat, execute, deps = {}) {
  assert.ok(seat === 0 || seat === 1);
  assert.equal(typeof execute, 'function');
  const engine = name => require(path.join(OUTPUT, name));
  const {SimpleTacticsAi} = deps.SimpleTacticsAi ??
    engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction, PlayerType, SlotType} = deps.playActions ??
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} = deps.promptActions ??
    engine('game/store/actions/resolve-prompt-action');
  const {GamePhase} = deps.phase ?? engine('game/store/state/state');
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const target = {player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const events = [];
  let phase = 'available';
  const handler = function sharedVipAfterPass(state) {
    const own = state.players[seat];
    if (!own || this.client?.id !== own.id) return original.call(this, state);
    const pending = state.prompts.find(p => p.result === undefined);
    if (phase === 'search' && pending?.constructor?.name === 'ChooseCardsPrompt' &&
        pending.playerId === own.id && pending.cards === own.deck) {
      const chosen = chooseCommonVipBasics(own, pending, state);
      if (chosen.length) {
        phase = 'post';
        events.push({kind:'native-owner-vip-search',turn:state.turn,
          targets:chosen.map(card => card.fullName),validated:true});
        return new ResolvePromptAction(pending.id, chosen);
      }
      events.push({kind:'no-valid-owner-vip-search',turn:state.turn});
      phase = 'done';
    }
    if (phase === 'post' && !pending) phase = 'done';
    const action = original.call(this, state);
    if (phase === 'available' &&
        action?.constructor?.name === 'PassTurnAction' &&
        eligibleFirstTurnVip(state, own, seat, GamePhase.PLAYER_TURN)) {
      const index = own.hand.cards.findIndex(card => card.fullName === VIP);
      const replacement = new PlayCardAction(own.id, index, target);
      const legal = this.isValidAction(state, replacement);
      events.push({kind:'first-turn-pass-vip-offer',turn:state.turn,
        ownerSeat:seat,nativeValid:legal});
      phase = legal ? 'search' : 'done';
      if (legal) return replacement;
    }
    return action;
  };
  SimpleTacticsAi.prototype.decodeNextAction = handler;
  try {
    return {result:execute(),audit:{
      schema:'agent7-common-firstturn-vip-pass-v1',seat,events,
      finalPhase:phase,usesSameAlgorithmForAllCandidateInventories:true,
      requiresRealOwnerPrompt:true,wholePolicyInformationSetSafe:false,
      competitiveGameQualified:false
    }};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,handler,
      'Another policy replaced the VIP bridge during execution');
    SimpleTacticsAi.prototype.decodeNextAction = original;
  }
}

module.exports = {VIP,eligibleFirstTurnVip,chooseCommonVipBasics,
  withCommonVipPassBridge};
