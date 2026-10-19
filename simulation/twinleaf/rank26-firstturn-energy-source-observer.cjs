'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Detached snapshot of energy publicly attached to rank26's board.
 * Active/Bench indices are preserved to audit native card targets.
 * @param {object} player Native Store player.
 * @returns {object}
 */
function sourceEnergyBoard(player) {
  /** @param {object} slot */
  const describe = slot => ({
    pokemon: slot.getPokemonCard()?.fullName ?? null,
    energy: slot.energies.cards.map(c => c.fullName),
    tools: slot.tools.map(c => c.fullName)
  });
  return {
    active: describe(player.active),
    bench: player.bench.map(describe),
    energyPlayedTurn: player.energyPlayedTurn
  };
}

/**
 * Observe the actual accepted Store dispatch of firstturn ordinary Energy
 * attachments. The observer is read-only and does not control the bot.
 *
 * @template T
 * @param {0|1} seat Source rank26 physical seat.
 * @param {()=>T} execute Synchronous native headless game.
 * @returns {{result:T,events:object[]}}
 */
function withRank26SourceEnergyObserver(seat, execute) {
  if (![0, 1].includes(seat) || typeof execute !== 'function') {
    throw new TypeError('Require physical source seat and synchronous runner');
  }
  const {Store} = require(path.join(OUTPUT, 'game/store/store'));
  const {PlayCardAction} =
    require(path.join(OUTPUT, 'game/store/actions/play-card-action'));
  const {GamePhase} = require(path.join(OUTPUT, 'game/store/state/state'));
  const previous = Store.prototype.dispatch;
  const sourceId = seat === 0 ? 101 : 202;
  const events = [];
  let rootStore = null;
  let ignoredOtherStoreActions = 0;
  const override = function rank26ObserveAcceptedEnergy(action, ...args) {
    // The pinned bot can dispatch the same proposed Energy action inside
    // detached legality-evaluation Stores. Only the live headless Store runs
    // the original AddPlayerAction sequence for player 101.
    if (!rootStore && action?.constructor?.name === 'AddPlayerAction' &&
        action.id === 101) rootStore = this;
    if (this !== rootStore) {
      ignoredOtherStoreActions++;
      return previous.call(this, action, ...args);
    }
    const before = this.state;
    const own = before.players[seat];
    const selected = own && action instanceof PlayCardAction &&
      action.id === sourceId && before.turn === 1 &&
      before.activePlayer === seat && before.phase === GamePhase.PLAYER_TURN
      ? own.hand.cards[action.handIndex] : null;
    const relevant = ['Double Colorless Energy', 'Lightning Energy']
      .includes(selected?.name);
    const prior = relevant ? sourceEnergyBoard(own) : null;
    const result = previous.call(this, action, ...args);
    if (relevant) {
      events.push({
        phase:'after-accepted-native-Store-dispatch',
        sourceSeat:seat,turn:before.turn,
        selectedCard:selected.fullName, selectedTarget:{
          player:action.target?.player??null,
          slot:action.target?.slot??null,
          index:action.target?.index??null
        },before:prior,
        after:sourceEnergyBoard(this.state.players[seat])
      });
    }
    return result;
  };
  Store.prototype.dispatch = override;
  try {
    return {result:execute(),events,ignoredOtherStoreActions,
      liveStoreIdentified:rootStore!==null};
  } finally {
    assert.equal(Store.prototype.dispatch,override,
      'Rank26 source observer lost Store dispatch ownership');
    Store.prototype.dispatch = previous;
  }
}

module.exports = {sourceEnergyBoard, withRank26SourceEnergyObserver};
