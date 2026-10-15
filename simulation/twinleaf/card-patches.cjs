'use strict';

const path = require('node:path');

const serverOutput = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const PRINT = "Player's Ceremony SP 127";

/**
 * Register the unimplemented 127/S-P Japanese promo as a research-side hook.
 * This is not an official legality ruling. The effect is sourced from the
 * Japanese S-P printing: draw two cards and end the current player's turn.
 * See https://bulbapedia.bulbagarden.net/wiki/Player%27s_Ceremony_(SM-P_Promo_248)
 *
 * @returns {string} The fully qualified research printing.
 */
function registerPlayersCeremony() {
  const { CardManager } = require(path.join(serverOutput, 'game/cards/card-manager'));
  const manager = CardManager.getInstance();
  if (manager.isCardDefined(PRINT)) return PRINT;

  const { TrainerCard } = require(path.join(serverOutput, 'game/store/card/trainer-card'));
  const { TrainerType } = require(path.join(serverOutput, 'game/store/card/card-types'));
  const { UseStadiumEffect } = require(path.join(serverOutput, 'game/store/effects/game-effects'));
  const { EndTurnEffect } = require(path.join(serverOutput, 'game/store/effects/game-phase-effects'));
  const { StateUtils } = require(path.join(serverOutput, 'game/store/state-utils'));
  const { GameError } = require(path.join(serverOutput, 'game/game-error'));
  const { GameMessage, GameLog } = require(path.join(serverOutput, 'game/game-message'));
  const { MOVE_CARDS } = require(path.join(serverOutput, 'game/store/prefabs/prefabs'));

  class PlayersCeremony extends TrainerCard {
    constructor() {
      super();
      this.trainerType = TrainerType.STADIUM;
      this.set = 'SP';
      this.setNumber = '127';
      this.name = "Player's Ceremony";
      this.fullName = PRINT;
      this.text = "Once during each player's turn, that player may draw 2 cards. If they do, that player's turn ends.";
      this.cardImage = 'assets/cardback.png';
    }

    /** @param {any} store @param {any} state @param {any} effect @returns {any} */
    reduceEffect(store, state, effect) {
      if (!(effect instanceof UseStadiumEffect) || StateUtils.getStadiumCard(state) !== this) {
        return state;
      }
      const player = effect.player;
      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_STADIUM);
      }
      MOVE_CARDS(store, state, player.deck, player.hand, { count: 2, sourceCard: this });

      effect.preventDefault = true;
      store.log(state, GameLog.LOG_PLAYER_USES_STADIUM, {
        name: player.name,
        stadium: effect.stadium.name
      });
      player.stadiumUsedTurn = state.turn;
      return store.reduceEffect(state, new EndTurnEffect(player));
    }
  }

  manager.defineCard(new PlayersCeremony());
  return PRINT;
}

module.exports = { registerPlayersCeremony, PLAYERS_CEREMONY_PRINT: PRINT };
