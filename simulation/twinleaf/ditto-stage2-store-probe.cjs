'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} relativePath @returns {any} */
const load = relativePath => require(path.join(output, relativePath));

/**
 * Staged genuine Store AttackAction for Ditto 30C, a searchable Stage 2,
 * attached Energy/Tool conservation and optional Glimwood Tangle reflip.
 * The scripted Math.random values apply solely inside this synchronous probe.
 *
 * @param {boolean} useGlimwood
 * @param {boolean} [verifyItemLock]
 * @param {'none'|'wobbuffet-bare'|'wobbuffet-jammer-native'|'wobbuffet-jammer-hooked'} [counterMode]
 * @param {0|1|null} [nativeSwitchSeat] Native full-card play probe seat; null skips it.
 * @returns {object}
 */
function probeDittoStage2(useGlimwood, verifyItemLock = false, counterMode = 'none', nativeSwitchSeat = null) {
  const cards = initializeCards();
  let nextId = 1;
  /** @param {string} name @returns {any} */
  const card = name => {
    const result = cards.getCardByName(name);
    assert.ok(result, 'Missing pinned printing ' + name);
    result.id = nextId++;
    return result;
  };
  const { Store } = load('game/store/store');
  const { Player } = load('game/store/state/player');
  const { CardList } = load('game/store/state/card-list');
  const { GamePhase } = load('game/store/state/state');
  const { Format, Stage } = load('game/store/card/card-types');
  const { AttackAction } = load('game/store/actions/game-actions');
  const { ResolvePromptAction } = load('game/store/actions/resolve-prompt-action');
  const store = new Store({ onStateChange() {} });
  const state = store.state;
  const mine = new Player();
  mine.id = 101;
  mine.name = 'Ditto probe';
  const enemy = new Player();
  enemy.id = 202;
  enemy.name = 'Defender';
  state.players = [mine, enemy];
  state.phase = GamePhase.PLAYER_TURN;
  state.activePlayer = 0;
  state.turn = 2;
  state.gameSettings.format = Format.EXPANDED;

  const ditto = card('Ditto 30C');
  const stage2 = card('Vileplume AOR');
  const hood = card('Stealthy Hood UNB');
  const energy = [card('Psychic Energy SVE'), card('Psychic Energy SVE')];
  mine.active.cards.push(ditto, ...energy);
  mine.active.energies.cards.push(...energy);
  mine.active.tools.push(hood);
  mine.active.damage = 10;
  mine.deck.cards.push(stage2);
  enemy.active.cards.push(card('Trubbish FST'));
  if (useGlimwood) mine.stadium.cards.push(card('Glimwood Tangle DAA'));
  for (const player of [mine, enemy]) {
    for (let i = 0; i < 8; i++) player.deck.cards.push(card('Psychic Energy SVE'));
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }

  // In the reflip arm, force tails then heads; without Glimwood force heads.
  const chosenFlips = useGlimwood ? [0.9, 0.1] : [0.1];
  const random = Math.random;
  let coinWaits = 0;
  let reflipPrompts = 0;
  let choicePrompts = 0;
  try {
    Math.random = () => chosenFlips.length ? chosenFlips.shift() : 0.1;
    store.dispatch(new AttackAction(mine.id, 'Surprisingly Transform'));
    for (let i = 0; i < 16; i++) {
      const pending = store.state.prompts.find(prompt => prompt.result === undefined);
      if (!pending) break;
      const kind = pending.constructor.name;
      if (kind === 'WaitPrompt') {
        // Other source animations also issue waits; count only coin flips.
        if (pending.message === 'Coin flip animation') coinWaits++;
        store.dispatch(new ResolvePromptAction(pending.id, null));
      } else if (kind === 'ConfirmPrompt') {
        reflipPrompts++;
        store.dispatch(new ResolvePromptAction(pending.id, true));
      } else if (kind === 'ShuffleDeckPrompt') {
        // The pinned shuffle callback expects a complete card-index permutation.
        const length = mine.deck.cards.length;
        const permutation = Array.from({ length }, (_, i) => length - i - 1);
        store.dispatch(new ResolvePromptAction(pending.id, permutation));
      } else if (kind === 'ChooseCardsPrompt') {
        choicePrompts++;
        assert.ok(mine.deck.cards.includes(stage2), 'Stage 2 must be a deck choice');
        store.dispatch(new ResolvePromptAction(pending.id, [stage2]));
      } else {
        assert.fail('Unexpected live prompt ' + kind);
      }
    }
  } finally {
    Math.random = random;
  }

  assert.equal(store.state.prompts.some(prompt => prompt.result === undefined), false);
  const liveMine = store.state.players.find(player => player.id === mine.id);
  const resultingPokemon = liveMine.active.getPokemonCard();
  assert.equal(resultingPokemon, stage2, 'The Stage 2 must occupy the Active Spot');
  assert.equal(stage2.stage, Stage.STAGE_2);
  assert.ok(liveMine.deck.cards.includes(ditto), 'Ditto returns to deck');
  assert.equal(liveMine.active.damage, 10, 'Damage should remain on replacement');
  assert.ok(liveMine.active.tools.includes(hood), 'Tool remains on replacement');
  assert.ok(energy.every(e => liveMine.active.energies.cards.includes(e)), 'Both Energy remain');
  assert.equal(choicePrompts, 1, 'A single Stage-2 target choice is expected');
  assert.equal(coinWaits, useGlimwood ? 2 : 1);
  assert.equal(reflipPrompts, useGlimwood ? 1 : 0);

  // The transformed Vileplume has Irritating Pollen, which should prevent
  // either player from announcing an Item from hand. Exercise the genuine
  // engine's PlayItemEffect without constructing an artificial card action.
  let itemLock;
  let nativeItemPlay;
  if (verifyItemLock) {
    if (counterMode !== 'none') {
      const liveEnemy = store.state.players.find(player => player.id === enemy.id);
      // Staged rank-7-style counter, not an asserted 60-card game line.
      liveEnemy.active.cards.length = 0;
      liveEnemy.active.cards.push(card('Wobbuffet PHF'));
      if (counterMode !== 'wobbuffet-bare') {
        liveEnemy.active.tools.push(card('Tool Jammer BST'));
      }
    }
    const restore = counterMode === 'wobbuffet-jammer-hooked'
      ? require('./tool-jammer-hook.cjs').installToolJammerHook()
      : null;
    try {

    const { PlayItemEffect } = load('game/store/effects/play-card-effects');
    const { GameMessage } = load('game/game-message');
    const switchItem = card('Switch SVI');
    /** @param {any} player */
    const blocked = player => {
      try {
        store.reduceEffect(state, new PlayItemEffect(player, switchItem));
        return false;
      } catch (error) {
        if (error.message !== GameMessage.CANNOT_PLAY_THIS_CARD) throw error;
        return true;
      }
    };
    const { IS_TOOL_BLOCKED, IS_ABILITY_BLOCKED } = load('game/store/prefabs/prefabs');
    itemLock = {
      ownerBlocked: blocked(liveMine),
      opponentBlocked: blocked(store.state.players.find(player => player.id === enemy.id)),
      ...(counterMode !== 'none' ? {
        hoodSuppressed: IS_TOOL_BLOCKED(store, state, liveMine, hood),
        vileplumeSuppressed: IS_ABILITY_BLOCKED(store, state, liveMine, stage2)
      } : {})
    };
    if (nativeSwitchSeat !== null) {
      assert.ok(nativeSwitchSeat === 0 || nativeSwitchSeat === 1);
      const { PokemonCardList } = load('game/store/state/pokemon-card-list');
      const { PlayCardAction, PlayerType, SlotType } =
        load('game/store/actions/play-card-action');
      const actor = store.state.players[nativeSwitchSeat];
      const initialActive = actor.active.getPokemonCard();
      const benchSlot = new PokemonCardList();
      benchSlot.cards.push(card('Pidgey MEW'));
      actor.bench.push(benchSlot);
      const item = card('Switch SVI');
      const itemIndex = actor.hand.cards.length;
      actor.hand.cards.push(item);
      state.phase = GamePhase.PLAYER_TURN;
      state.activePlayer = nativeSwitchSeat;
      state.turn = 3;
      let error = null;
      try {
        store.dispatch(new PlayCardAction(actor.id, itemIndex, {
          player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
        }));
      } catch (caught) {
        error = caught.message;
      }
      const pendingKinds = state.prompts
        .filter(prompt => prompt.result === undefined)
        .map(prompt => prompt.constructor.name);
      const switchPrompt = state.prompts.find(prompt =>
        prompt.result === undefined &&
        prompt.constructor.name === 'ChoosePokemonPrompt' &&
        prompt.playerId === actor.id);
      let switchPromptResolved = false;
      if (error === null && switchPrompt) {
        assert.equal(switchPrompt.validate([benchSlot], state), true,
          'Fresh legal Bench target must validate');
        const { ResolvePromptAction } =
          load('game/store/actions/resolve-prompt-action');
        store.dispatch(new ResolvePromptAction(switchPrompt.id, [benchSlot]));
        switchPromptResolved = true;
      }
      nativeItemPlay = {
        seat: nativeSwitchSeat,
        accepted: error === null,
        error,
        itemStillInHand: actor.hand.cards.includes(item),
        unresolvedPromptKinds: pendingKinds,
        switchPromptResolved,
        activeAfterSwitch: actor.active.getPokemonCard()?.fullName ?? null,
        originalActiveOnBench: actor.bench.some(slot =>
          slot.getPokemonCard() === initialActive),
        vileplumeAbilitySuppressedAfter: IS_ABILITY_BLOCKED(
          store, state, liveMine, stage2)
      };
    }
    } finally {
      if (restore) restore();
    }
  }

  return {
    targetStage: stage2.stage, coinWaits, reflipPrompts, choicePrompts,
    toolConserved: true, energyConserved: true, damageConserved: true,
    dittoReturned: true, targetRetained: true,
    ...(verifyItemLock ? { itemLock } : {}),
    ...(nativeSwitchSeat !== null ? { nativeItemPlay } : {})
  };
}

module.exports = { probeDittoStage2 };
