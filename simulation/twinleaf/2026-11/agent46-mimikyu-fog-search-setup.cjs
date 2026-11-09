'use strict';

const path = require('node:path');

const output = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
const REGIDRAGO = new Set(['Regidrago V SIT', 'Regidrago VSTAR SIT']);
const DRAGON_PAYLOADS = new Set(['Dialga-GX UPR', 'Radiant Eternatus CRZ']);
const MIMIKYU = 'Mimikyu GRI';
const FOG = 'Fog Crystal CRE';
let installed = null;

/** @param {object} state @param {object} player @returns {boolean} */
function facingVisibleRegidrago(state, player) {
  return state.players.some(opponent => opponent.id !== player.id &&
    [opponent.active, ...opponent.bench].some(slot =>
      REGIDRAGO.has(slot.getPokemonCard()?.fullName)));
}

/**
 * Scope to actual owner and public board; never inspect unrevealed own deck.
 * @param {object} state Native Store State.
 * @param {object} player Owner-visible acting Player.
 * @param {0|1} seat Candidate physical owner seat.
 * @returns {boolean}
 */
function ownerSetupWindow(state, player, seat) {
  return state.players[seat]?.id === player.id &&
    facingVisibleRegidrago(state, player) &&
    player.bench.some(slot => slot.cards.length === 0);
}

/**
 * The pending Fog Crystal search itself exposes the owner's deck. Only
 * select the physical card AFTER the actual native prompt exists, and
 * only if the printed native filter and validator permit it.
 *
 * @param {object} state Native Store state.
 * @param {object} player Acting player in this prompt.
 * @param {object} prompt Native ChooseCardsPrompt.
 * @param {0|1} seat Actual owner physical seat.
 * @returns {object|null} The physical owner-deck Mimikyu or null.
 */
function eligibleFogMimikyu(state, player, prompt, seat) {
  if (!ownerSetupWindow(state, player, seat) ||
      prompt?.playerId !== player.id ||
      prompt?.cards !== player.deck ||
      prompt?.constructor?.name !== 'ChooseCardsPrompt' ||
      prompt?.message !== 'CHOOSE_CARD_TO_HAND' ||
      !player.supporter.cards.some(card => card.fullName === FOG) ||
      [player.active, ...player.bench].some(slot =>
        slot.getPokemonCard()?.fullName === MIMIKYU) ||
      player.hand.cards.some(card => card.fullName === MIMIKYU)) return null;
  const i = prompt.cards.cards.findIndex(card => card.fullName === MIMIKYU);
  if (i < 0 || prompt.options?.blocked?.includes(i)) return null;
  const card = prompt.cards.cards[i];
  return prompt.validate([card]) ? card : null;
}

/**
 * Reversible, owner-scoped research policy on pinned native prototypes.
 * Moves no cards directly. Every proposal and prompt result is submitted
 * through the usual native legal-action pipeline.
 *
 * @param {{seat:0|1,onEvent?:(event:object)=>void}} options
 * @returns {() => void}
 */
function installFogMimikyuSetup({seat, onEvent}) {
  if (![0, 1].includes(seat)) throw new RangeError('Expected physical seat 0 or 1');
  if (installed) {
    if (installed.seat !== seat) throw new Error('Conflicting Fog setup owner seat');
    return installed.restore;
  }
  const {Stage} = require(path.join(output,
    'game/store/card/card-types'));
  const {PlayerType, SlotType, PlayCardAction} = require(path.join(output,
    'game/store/actions/play-card-action'));
  const {ResolvePromptAction} = require(path.join(output,
    'game/store/actions/resolve-prompt-action'));
  const {PlayBasicTactic} = require(path.join(output,
    'simple-bot/simple-tactics/play-basic-tactic'));
  const {PlayTrainerTactic} = require(path.join(output,
    'simple-bot/simple-tactics/play-trainer-tactic'));
  const {ChooseCardsPromptResolver} = require(path.join(output,
    'simple-bot/prompt-resolver/choose-cards-prompt-resolver'));
  const formerBasic = PlayBasicTactic.prototype.useTactic;
  const formerTrainer = PlayTrainerTactic.prototype.useTactic;
  const formerResolver = ChooseCardsPromptResolver.prototype.resolvePrompt;

  /** @param {string} kind @param {object} state @param {object} player @param {object} data */
  function note(kind, state, player, data) {
    if (onEvent) onEvent({kind,turn:state.turn,seat,
      ownerHandNames:player.hand.cards.map(card => card.fullName),...data});
  }

  function ownerBasic(state, player) {
    if (!ownerSetupWindow(state, player, seat)) {
      return formerBasic.call(this, state, player);
    }
    const empty = player.bench.find(slot => slot.cards.length === 0);
    const ownSlots = [player.active, ...player.bench];
    const hasMimikyu = ownSlots.some(slot =>
      slot.getPokemonCard()?.fullName === MIMIKYU);
    const preferred = !hasMimikyu ?
      player.hand.cards.findIndex(card => card.fullName === MIMIKYU) : -1;
    if (preferred >= 0) {
      note('proposed-mimikyu-bench', state, player, {handIndex:preferred});
      return new PlayCardAction(player.id, preferred,
        this.getCardTarget(player, state, empty));
    }
    const otherIndex = player.hand.cards.findIndex(card =>
      card.stage === Stage.BASIC && !DRAGON_PAYLOADS.has(card.fullName));
    if (otherIndex >= 0) return new PlayCardAction(player.id, otherIndex,
      this.getCardTarget(player, state, empty));
    const skipped = player.hand.cards.filter(card =>
      DRAGON_PAYLOADS.has(card.fullName)).map(card => card.fullName);
    if (skipped.length) note('preserved-dragon-payloads',state,player,{skipped});
    return undefined;
  }

  function ownerFog(state, player) {
    if (!ownerSetupWindow(state, player, seat) ||
        [player.active, ...player.bench].some(slot =>
          slot.getPokemonCard()?.fullName === MIMIKYU) ||
        player.hand.cards.some(card => card.fullName === MIMIKYU) ||
        player.discard.cards.some(card => card.fullName === MIMIKYU)) {
      return formerTrainer.call(this, state, player);
    }
    const i = player.hand.cards.findIndex(card => card.fullName === FOG);
    if (i < 0) return formerTrainer.call(this, state, player);
    note('proposed-fog-crystal',state,player,{handIndex:i});
    return new PlayCardAction(player.id, i,
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
  }

  function ownerFogResolver(state, player, prompt) {
    const card = eligibleFogMimikyu(state, player, prompt, seat);
    if (card) {
      note('selected-physical-fog-mimikyu',state,player,
        {printing:card.fullName,promptId:prompt.id});
      return new ResolvePromptAction(prompt.id,[card]);
    }
    return formerResolver.call(this, state, player, prompt);
  }

  PlayBasicTactic.prototype.useTactic = ownerBasic;
  PlayTrainerTactic.prototype.useTactic = ownerFog;
  ChooseCardsPromptResolver.prototype.resolvePrompt = ownerFogResolver;

  function restore() {
    if (PlayBasicTactic.prototype.useTactic === ownerBasic) {
      PlayBasicTactic.prototype.useTactic = formerBasic;
    }
    if (PlayTrainerTactic.prototype.useTactic === ownerFog) {
      PlayTrainerTactic.prototype.useTactic = formerTrainer;
    }
    if (ChooseCardsPromptResolver.prototype.resolvePrompt === ownerFogResolver) {
      ChooseCardsPromptResolver.prototype.resolvePrompt = formerResolver;
    }
    if (installed?.restore === restore) installed = null;
  }
  installed = {seat, restore};
  return restore;
}

module.exports = {REGIDRAGO,DRAGON_PAYLOADS,
  facingVisibleRegidrago,ownerSetupWindow,eligibleFogMimikyu,installFogMimikyuSetup};
