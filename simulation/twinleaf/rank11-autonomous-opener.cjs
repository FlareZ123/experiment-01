'use strict';

const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} name @returns {any} */
function engine(name) {
  return require(path.join(OUTPUT, name));
}

/**
 * The observable opportunity is intentionally narrow. It uses only the
 * acting player's hand and public board, never the hidden deck or Prizes.
 * Missing search targets are discovered only by actual owner-search prompts.
 * @param {object} state
 * @param {object} player
 * @param {number} seat
 * @param {number} playerTurnPhase
 * @returns {boolean}
 */
function openingOpportunity(state, player, seat, playerTurnPhase) {
  if (state.turn !== 1 || state.activePlayer !== seat ||
      state.phase !== playerTurnPhase || player.usedVSTAR ||
      player.active.getPokemonCard()?.name !== 'Oranguru V' ||
      player.active.tools.length !== 0 ||
      player.bench.some(slot => slot.getPokemonCard()?.name === 'Trubbish') ||
      (player.bench.length >= 5 &&
        !player.bench.some(slot => !slot.getPokemonCard()))) return false;
  const hand = player.hand.cards.map(card => card.name);
  return hand.includes('Battle VIP Pass') && hand.includes('Float Stone') &&
    !hand.includes('Forest Seal Stone') && !hand.includes('Boost Shake');
}

/**
 * A live automatic rank-11 opponent policy, evaluated on the acting player's
 * information at each ordinary bot decision. The archive's forced eleven-
 * action line is used solely as a regression target, not as an injected trace.
 * The policy aborts to the pinned bot on any missing printed search target.
 *
 * @template T
 * @param {0|1} sourceSeat Known from the source-locked campaign's opponent rank.
 * @param {()=>T} execute A synchronous headless game.
 * @returns {{result:T,policyAudit:object}}
 */
function withRank11AutonomousOpener(sourceSeat, execute) {
  if (![0, 1].includes(sourceSeat) || typeof execute !== 'function') {
    throw new TypeError('Require the known rank-11 source physical seat.');
  }
  const { SimpleTacticsAi } = engine('simple-bot/simple-tactics-ai');
  const { PlayCardAction, PlayerType, SlotType } =
    engine('game/store/actions/play-card-action');
  const { UseAbilityAction } = engine('game/store/actions/game-actions');
  const { ResolvePromptAction } =
    engine('game/store/actions/resolve-prompt-action');
  const { GamePhase } = engine('game/store/state/state');
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId = sourceSeat === 0 ? 101 : 202;
  const board = { player: PlayerType.ANY, slot: SlotType.BOARD, index: 0 };
  const active = { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 };
  const events = [];
  let stage = null;
  let aborted = null;
  let witness = null;

  /** @param {object} state @param {string} reason @param {object} action */
  function select(state, reason, action) {
    events.push({ turn: state.turn, stage, reason, action: action.constructor.name });
    stage += 1;
    return action;
  }
  /** @param {object} state @param {string} reason */
  function abort(state, reason, player, pending) {
    aborted = { turn: state.turn, stage, reason,
      pendingType: pending?.constructor?.name || null,
      pendingPlayerId: pending?.playerId ?? null,
      ownsPendingDeck: pending?.cards === player?.deck,
      pendingNames: pending?.playerId === player?.id ?
        [...new Set((pending?.cards?.cards || []).map(c => c.name))]
          .filter(name => ['Trubbish', 'Forest Seal Stone',
            'Boost Shake', 'Garbodor'].includes(name)) : []
    };
    stage = -1;
  }
  /** @param {object} player @param {string} name @param {object} target */
  function play(player, name, target) {
    const index = player.hand.cards.findIndex(card => card.name === name);
    return index >= 0 ? new PlayCardAction(player.id, index, target) : null;
  }
  /**
   * A deck-search prompt is legitimately visible to its owner. Search
   * selections are checked against the actual prompt's own validation.
   * @param {object} state
   * @param {object} player
   * @param {object} prompt
   * @param {string} fullName
   */
  function chooseDeckCard(state, player, prompt, name) {
    if (prompt.constructor.name !== 'ChooseCardsPrompt' ||
        prompt.playerId !== player.id || prompt.cards !== player.deck) return null;
    const card = prompt.cards.cards.find(item => item.name === name);
    if (!card || !prompt.validate([card], state)) return null;
    return new ResolvePromptAction(prompt.id, [card]);
  }
  /** @param {object} player @returns {number} */
  function trubbishIndex(player) {
    return player.bench.findIndex(slot =>
      slot.getPokemonCard()?.name === 'Trubbish');
  }

  SimpleTacticsAi.prototype.decodeNextAction = function rank11Policy(state) {
    const player = state.players.find(side => side.id === this.client?.id);
    const source = state.players.find(side => side.id === sourceId);
    if (stage === 11 && !witness && state.turn >= 2 &&
        state.activePlayer !== sourceSeat && source) {
      witness = {
        turn: state.turn,
        sourceUsedVSTAR: source.usedVSTAR === true,
        equippedGarbodor: source.bench.some(slot =>
          slot.getPokemonCard()?.name === 'Garbodor' &&
          slot.tools.some(tool => tool.name === 'Float Stone'))
      };
    }
    if (!player || player.id !== sourceId) return original.call(this, state);
    const pending = state.prompts.find(prompt => prompt.result === undefined);
    if (stage === null) {
      if (pending || !openingOpportunity(state, player, sourceSeat,
        GamePhase.PLAYER_TURN)) return original.call(this, state);
      stage = 0;
    }
    if (stage < 0 || stage >= 11) return original.call(this, state);
    // Owner-search effects may issue mandatory shuffle/wait prompts between
    // our deliberate actions. Preserve the stage while the pinned resolver
    // handles those prompts, as in the source Store fork.
    if (pending) {
      const expected = stage === 10 ? 'ChoosePokemonPrompt' :
        [1, 3, 6, 9].includes(stage) ? 'ChooseCardsPrompt' : null;
      if (pending.constructor.name !== expected) {
        return original.call(this, state);
      }
    }

    let action = null;
    if (pending) {
      switch (stage) {
        case 1:
          action = chooseDeckCard(state, player, pending, 'Trubbish');
          break;
        case 3:
          action = chooseDeckCard(state, player, pending, 'Forest Seal Stone');
          break;
        case 6:
          action = chooseDeckCard(state, player, pending, 'Boost Shake');
          break;
        case 9:
          action = chooseDeckCard(state, player, pending, 'Garbodor');
          break;
        case 10: {
          const index = trubbishIndex(player);
          if (pending.constructor.name === 'ChoosePokemonPrompt' && index >= 0 &&
              pending.validate([player.bench[index]], state)) {
            action = new ResolvePromptAction(pending.id, [player.bench[index]]);
          }
          break;
        }
        default:
          break;
      }
    } else {
      switch (stage) {
        case 0:
          action = play(player, 'Battle VIP Pass', board);
          break;
        case 2:
          if (player.active.getPokemonCard()?.name === 'Oranguru V' &&
              trubbishIndex(player) >= 0) {
            action = new UseAbilityAction(player.id, 'Back Order', active);
          }
          break;
        case 4:
          if (player.active.tools.length === 0) {
            action = play(player, 'Forest Seal Stone', active);
          }
          break;
        case 5:
          if (!player.usedVSTAR && player.active.tools.some(tool =>
              tool.name === 'Forest Seal Stone')) {
            action = new UseAbilityAction(player.id, 'Star Alchemy', active);
          }
          break;
        case 7: {
          const index = trubbishIndex(player);
          if (index >= 0 && player.bench[index].tools.length === 0) {
            action = play(player, 'Float Stone', {
            player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index
            });
          }
          break;
        }
        case 8:
          if (player.bench.some(slot =>
              slot.getPokemonCard()?.name === 'Trubbish' &&
              slot.tools.some(tool => tool.name === 'Float Stone'))) {
            action = play(player, 'Boost Shake', board);
          }
          break;
        default:
          break;
      }
    }
    if (!action) {
      abort(state, pending ? 'expected-owner-prompt-or-source-card-unavailable' :
        'expected-public-board-or-own-hand-line-unavailable',player,pending);
      return original.call(this, state);
    }
    return select(state, 'autonomously-chosen-source-lock-step', action);
  };
  try {
    const result = execute();
    return {
      result,
      policyAudit: {
        version: 'rank11-autonomous-boostshake-v1',
        sourceSeat, opportunityDetected: stage !== null,
        attemptedActions: events.length, selectedLine: events,
        aborted, nextTurnLockWitness: witness,
        completeAtDecisionBoundary: stage === 11 &&
          witness?.sourceUsedVSTAR === true &&
          witness?.equippedGarbodor === true,
        qualifiedForCompetitiveInference: false
      }
    };
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = original;
  }
}

module.exports = { openingOpportunity, withRank11AutonomousOpener };
