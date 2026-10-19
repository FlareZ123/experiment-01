'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Prefer the missing rank-26 attacker only during a real owner-deck
 * Quick Ball search. The deck may be inspected once its search prompt is
 * visible to the owner; the policy never looks at it beforehand.
 *
 * @param {object} state Live Store state.
 * @param {object} own Source player's live object.
 * @param {0|1} seat Physical source seat.
 * @param {object} prompt Unresolved owner prompt.
 * @param {number} playerTurn Pinned GamePhase.PLAYER_TURN.
 * @returns {object|null} Actual Meloetta card reference or null.
 */
function preferredMeloetta(state, own, seat, prompt, playerTurn) {
  if (state.turn !== 1 || state.activePlayer !== seat ||
      state.phase !== playerTurn || state.players[seat] !== own ||
      prompt?.constructor?.name !== 'ChooseCardsPrompt' ||
      prompt.playerId !== own.id || prompt.cards !== own.deck ||
      !own.active?.getPokemonCard() ||
      own.active.getPokemonCard().name === 'Meloetta ex' ||
      own.bench.some(slot => slot.getPokemonCard()?.name === 'Meloetta ex') ||
      own.hand.cards.some(card => card.name === 'Meloetta ex')) return null;
  const card = prompt.cards.cards.find(item => item.name === 'Meloetta ex');
  return card && prompt.validate([card], state) === true ? card : null;
}

/**
 * Intercept only the deck-selection prompt following a Quick Ball actually
 * played by the source bot. The cost-discard prompt remains unchanged.
 * All other actions and fallback choices use the original bot policy.
 *
 * @template T
 * @param {0|1} seat
 * @param {()=>T} execute Synchronous source-dealt match.
 * @returns {{result:T,audit:object}}
 */
function withRank26QuickBallTarget(seat, execute) {
  if (![0, 1].includes(seat) || typeof execute !== 'function')
    throw new TypeError('Require source seat and synchronous experiment.');
  const load = name => require(path.join(OUTPUT, name));
  const {SimpleTacticsAi} = load('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {GamePhase} = load('game/store/state/state');
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId = seat === 0 ? 101 : 202;
  let armed = false;
  const events = [];
  const override = function rank26QuickBallTarget(state) {
    const own = state.players[seat];
    if (this.client?.id !== sourceId || !own) return original.call(this, state);
    const prompt = state.prompts.find(item => item.result === undefined);
    if (armed && prompt && prompt.cards === own.deck &&
        prompt.playerId === sourceId) {
      armed = false;
      const choice = preferredMeloetta(state, own, seat, prompt,
        GamePhase.PLAYER_TURN);
      events.push({kind: choice ? 'chosen' : 'unavailable-or-ineligible',
        turn: state.turn, promptId: prompt.id, sourceSeat: seat,
        card: choice?.fullName ?? null});
      if (choice) return new ResolvePromptAction(prompt.id, [choice]);
    }
    const action = original.call(this, state);
    if (!prompt) {
      armed = state.turn === 1 && state.activePlayer === seat &&
        state.phase === GamePhase.PLAYER_TURN &&
        action?.type === 'PLAY_CARD_ACTION' &&
        own.hand.cards[action.handIndex]?.name === 'Quick Ball';
      if (armed) events.push({kind: 'played-quick-ball', turn: state.turn,
        sourceSeat: seat, card: own.hand.cards[action.handIndex].fullName});
    }
    return action;
  };
  SimpleTacticsAi.prototype.decodeNextAction = override;
  try {
    return {result: execute(), audit: {
      version: 'rank26-owner-quick-ball-meloetta-v1', sourceSeat: seat,
      events, competitiveGameQualified: false
    }};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction, override,
      'Rank26 Quick Ball hook lost prototype ownership');
    SimpleTacticsAi.prototype.decodeNextAction = original;
  }
}
module.exports = {preferredMeloetta, withRank26QuickBallTarget};
