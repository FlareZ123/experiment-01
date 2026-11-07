'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let installed = null;

/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * Opt-in, source-bound correction for Articuno-GX CES 31 Legendary Ascent.
 * After its actual owner accepts the switch, the Ability has changed the game
 * state; D-02 therefore permits zero Water Energy transfers. Twinleaf's
 * printed prompt minimum of one otherwise blocks that paper-legal choice in
 * the UI and in the research-owned strict prompt gate.
 *
 * This wraps Store.dispatch rather than ArticunoGX.reduceEffect so it composes
 * independently with the existing Articuno Bench-entry ability-lock hook.
 * It changes only the minimum on the exact MoveEnergyPrompt created by an
 * accepted ConfirmPrompt attributable to the physical Articuno-GX CES card.
 *
 * @returns {() => void}
 */
function installArticunoZeroMovementPromptHook() {
  if (installed) return () => {};

  const { Store } = load('game/store/store');
  const { PlayCardAction, PlayerType, SlotType } =
    load('game/store/actions/play-card-action');
  const { ResolvePromptAction } =
    load('game/store/actions/resolve-prompt-action');
  const { ConfirmPrompt } = load('game/store/prompts/confirm-prompt');
  const { MoveEnergyPrompt } = load('game/store/prompts/move-energy-prompt');
  const { SuperType } = load('game/store/card/card-types');
  const { GameMessage } = load('game/game-message');
  const originalDispatch = Store.prototype.dispatch;
  const sourceByConfirm = new WeakMap();

  function dispatchWithArticunoZeroMovement(action, ...args) {
    const stateBefore = this.state;
    const priorPrompts = new Set(stateBefore.prompts ?? []);
    let played = null;
    let accepted = null;
    let declined = null;

    if (action instanceof PlayCardAction &&
        action.target?.player === PlayerType.BOTTOM_PLAYER &&
        action.target?.slot === SlotType.BENCH) {
      const owner = stateBefore.players.find(player => player.id === action.id);
      const card = owner?.hand?.cards[action.handIndex];
      if (card?.fullName === 'Articuno-GX CES' &&
          card.powers?.some(power => power.name === 'Legendary Ascent')) {
        played = { ownerId: owner.id, card, turn: stateBefore.turn };
      }
    }

    if (action instanceof ResolvePromptAction) {
      const prompt = stateBefore.prompts.find(item => item.id === action.id);
      const source = prompt && sourceByConfirm.get(prompt);
      if (source) {
        if (action.result === true) accepted = { prompt, source };
        else if (action.result === false) declined = prompt;
      }
    }

    const result = originalDispatch.call(this, action, ...args);

    if (played) {
      const confirms = this.state.prompts.filter(prompt =>
        !priorPrompts.has(prompt) &&
        prompt instanceof ConfirmPrompt &&
        prompt.message === GameMessage.WANT_TO_USE_ABILITY &&
        prompt.playerId === played.ownerId &&
        this.state.turn === played.turn);
      if (confirms.length === 1) sourceByConfirm.set(confirms[0], played);
    }

    if (declined) sourceByConfirm.delete(declined);

    if (accepted) {
      sourceByConfirm.delete(accepted.prompt);
      const owner = this.state.players.find(player =>
        player.id === accepted.source.ownerId);
      const matches = this.state.prompts.filter(prompt =>
        !priorPrompts.has(prompt) &&
        prompt instanceof MoveEnergyPrompt &&
        prompt.playerId === accepted.source.ownerId &&
        prompt.message === GameMessage.MOVE_ENERGY_TO_ACTIVE &&
        prompt.playerType === PlayerType.BOTTOM_PLAYER &&
        prompt.slots.includes(SlotType.ACTIVE) &&
        prompt.slots.includes(SlotType.BENCH) &&
        prompt.filter?.superType === SuperType.ENERGY &&
        prompt.filter?.name === 'Water Energy');

      if (owner?.active?.getPokemonCard() === accepted.source.card &&
          this.state.turn === accepted.source.turn &&
          matches.length === 1 &&
          matches[0].options.min === 1 &&
          matches[0].options.allowCancel === false) {
        matches[0].options.min = 0;
      }
    }

    return result;
  }

  Store.prototype.dispatch = dispatchWithArticunoZeroMovement;
  installed = { originalDispatch, dispatchWithArticunoZeroMovement };

  return function restoreArticunoZeroMovementPromptHook() {
    if (!installed ||
        installed.dispatchWithArticunoZeroMovement !== dispatchWithArticunoZeroMovement) {
      return;
    }
    if (Store.prototype.dispatch === dispatchWithArticunoZeroMovement) {
      Store.prototype.dispatch = originalDispatch;
    }
    installed = null;
  };
}

module.exports = {
  VERSION: 'articuno-ces-legendary-ascent-zero-movement-v1',
  installArticunoZeroMovementPromptHook
};
