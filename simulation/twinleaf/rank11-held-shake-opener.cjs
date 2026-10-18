'use strict';

const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const TOOLS = Object.freeze(['Float Stone', 'Muscle Band', 'Forest Seal Stone']);
const {nextOpponentLockWitness} = require('./rank11-held-shake-witness.cjs');

/** @param {string} name @returns {any} */
function engine(name) {
  return require(path.join(OUTPUT, name));
}

/**
 * Restricted held-Shake source opportunity, using only the acting player's
 * visible board, own hand, current turn and phase. The opponent's hand,
 * face-down Prizes and both decks are deliberately excluded.
 * The full published rank11 structural opening envelope also includes
 * held Trubbish without VIP, which is not implemented here.
 * @param {object} state
 * @param {object} player
 * @param {0|1} seat
 * @param {number} phase
 * @returns {boolean}
 */
function heldShakeOpportunity(state, player, seat, phase) {
  if (![1, 2].includes(state.turn) || state.activePlayer !== seat ||
      state.phase !== phase ||
      player.bench.some(s => s.getPokemonCard()?.name === 'Trubbish') ||
      player.bench.filter(s => s.getPokemonCard()).length >= 5) return false;
  const names = player.hand.cards.map(c => c.name);
  return names.includes('Battle VIP Pass') &&
    names.includes('Boost Shake') &&
    TOOLS.some(name => names.includes(name));
}

/**
 * A narrow automatic opponent policy that actually performs a source-legal
 * held-Boost-Shake route through the pinned Store. Any missing owner-search
 * card is observed only on the owner's legitimate search prompt. It aborts
 * to the original bot without making up deck or Prize information.
 *
 * @template T
 * @param {0|1} sourceSeat Known physical location of rank11 in this match
 * @param {()=>T} execute One synchronous source-dealt headless match
 * @returns {{result:T,policyAudit:object}}
 */
function withRank11HeldShake(sourceSeat, execute) {
  if (![0, 1].includes(sourceSeat) || typeof execute !== 'function') {
    throw new TypeError('Require known rank11 physical seat and synchronous match.');
  }
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction, PlayerType, SlotType} =
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const {GamePhase} = engine('game/store/state/state');
  const sourceId = sourceSeat === 0 ? 101 : 202;
  const previous = SimpleTacticsAi.prototype.decodeNextAction;
  const board = {player: PlayerType.ANY, slot: SlotType.BOARD, index: 0};
  const events = [];
  let stage = null;
  let toolName = null;
  let initialOwnHand = null;
  let aborted = null;
  let witness = null;
  let openingTurn = null;

  /** @param {object} player @param {string} name @param {object} target */
  function play(player, name, target) {
    const index = player.hand.cards.findIndex(card => card.name === name);
    return index < 0 ? null : new PlayCardAction(player.id, index, target);
  }

  /** @param {object} state @param {object} player @param {object} prompt @param {string} name */
  function deckChoice(state, player, prompt, name) {
    if (prompt.constructor.name !== 'ChooseCardsPrompt' ||
        prompt.playerId !== player.id || prompt.cards !== player.deck) return null;
    const card = prompt.cards.cards.find(c => c.name === name);
    return card && prompt.validate([card], state) === true ?
      new ResolvePromptAction(prompt.id, [card]) : null;
  }

  /** @param {object} player */
  function targetIndex(player) {
    return player.bench.findIndex(s => s.getPokemonCard()?.name === 'Trubbish');
  }

  /** @param {object} state @param {object} action */
  function select(state, action) {
    events.push({turn: state.turn, step: stage,
      action: action.constructor.name});
    stage += 1;
    return action;
  }

  SimpleTacticsAi.prototype.decodeNextAction = function heldShake(state) {
    // An actual opponent bot turn is the required witness boundary.
    if (!witness) witness = nextOpponentLockWitness(state, sourceSeat,
      sourceId, openingTurn, stage, toolName, GamePhase.PLAYER_TURN);
    const player = state.players.find(p => p.id === this.client?.id);
    if (!player || player.id !== sourceId) return previous.call(this, state);
    const pending = state.prompts.find(p => p.result === undefined);
    if (stage === null) {
      if (pending || !heldShakeOpportunity(state, player, sourceSeat,
        GamePhase.PLAYER_TURN)) return previous.call(this, state);
      stage = 0;
      openingTurn = state.turn;
      initialOwnHand = player.hand.cards.map(card => card.fullName);
      toolName = TOOLS.find(name => player.hand.cards.some(c => c.name === name));
    }
    if (stage < 0 || stage >= 6) return previous.call(this, state);
    // Shuffle/Wait and any ancillary owner prompts remain delegated to the
    // pinned resolver without resetting the multi-action plan.
    let action = null;
    if (pending) {
      if (stage === 1) action = deckChoice(state, player, pending, 'Trubbish');
      if (stage === 4) action = deckChoice(state, player, pending, 'Garbodor');
      if (stage === 5 && pending.constructor.name === 'ChoosePokemonPrompt') {
        const index = targetIndex(player);
        if (index >= 0 &&
            player.bench[index].tools.some(t => t.name === toolName) &&
            pending.validate([player.bench[index]], state) === true) {
          action = new ResolvePromptAction(pending.id, [player.bench[index]]);
        }
      }
      if (!action && ![1, 4, 5].includes(stage)) {
        return previous.call(this, state);
      }
      if (!action && [1, 4, 5].includes(stage) &&
          !['ChooseCardsPrompt', 'ChoosePokemonPrompt'].includes(
            pending.constructor.name)) return previous.call(this, state);
    } else {
      if (stage === 0) action = play(player, 'Battle VIP Pass', board);
      if (stage === 2) {
        const index = targetIndex(player);
        if (index >= 0 && player.bench[index].tools.length === 0) {
          action = play(player, toolName, {
            player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index
          });
        }
      }
      if (stage === 3 && player.bench.some(s =>
          s.getPokemonCard()?.name === 'Trubbish' &&
          s.tools.some(t => t.name === toolName))) {
        action = play(player, 'Boost Shake', board);
      }
    }
    if (!action) {
      aborted = {turn: state.turn, step: stage,
        reason: pending ? 'missing-or-invalid-owner-prompt-target' :
          'missing-own-hand-or-public-board-resource'};
      stage = -1;
      return previous.call(this, state);
    }
    return select(state, action);
  };

  try {
    const result = execute();
    return {result, policyAudit: {
      profile: 'rank11-held-shake-v1',
      sourceSeat, openingTurn, initialOwnHand, selectedTool: toolName,
      opportunityDetected: stage !== null, attemptedActions: events.length,
      actions: events, aborted, witness,
      completeAtDecisionBoundary: stage === 6 &&
        witness?.equippedGarbodor === true,
      qualifiedForCompetitiveInference: false
    }};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = previous;
  }
}

module.exports = {heldShakeOpportunity, withRank11HeldShake, TOOLS};
