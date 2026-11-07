'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');
const { assertValidPromptAction } =
  require('../simulation/twinleaf/prompt-integrity.cjs');
const { installArticunoEntryLockHook } =
  require('../simulation/twinleaf/articuno-entry-lock-hook.cjs');
const { installArticunoZeroMovementPromptHook, VERSION } =
  require('../simulation/twinleaf/articuno-zero-movement-prompt-hook.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const native = modulePath => require(path.join(output, modulePath));

/**
 * Build a real pinned Store board. The source Active owns one Basic Water;
 * playing Articuno creates the native Legendary Ascent switch and movement
 * prompts. The optional Path fixture verifies composition with the entry lock.
 *
 * @param {0|1} seat
 * @param {'none'|'path'} lock
 * @returns {object}
 */
function fixture(seat, lock = 'none') {
  const { Store } = native('game/store/store');
  const { State, GamePhase } = native('game/store/state/state');
  const { Player } = native('game/store/state/player');
  const { PokemonCardList } = native('game/store/state/pokemon-card-list');
  const { CardList } = native('game/store/state/card-list');
  const { Format } = native('game/store/card/card-types');
  const { PlayCardAction, PlayerType, SlotType } =
    native('game/store/actions/play-card-action');
  const { ResolvePromptAction } =
    native('game/store/actions/resolve-prompt-action');
  const manager = initializeCards();
  let nextId = 1000;
  /** @param {string} name */
  function card(name) {
    const found = manager.getCardByName(name);
    assert.ok(found, 'Missing pinned card ' + name);
    found.id = nextId++;
    return found;
  }

  const actor = new Player();
  const opponent = new Player();
  actor.id = 801;
  opponent.id = 802;
  actor.bench = Array.from({ length: 5 }, () => new PokemonCardList());
  opponent.bench = Array.from({ length: 5 }, () => new PokemonCardList());
  const previousActive = card('Snorlax PGO');
  actor.active.cards.push(previousActive);
  const water = card('Water Energy SVE');
  actor.active.cards.push(water);
  actor.active.energies.cards.push(water);
  opponent.active.cards.push(card('Dialga-GX UPR'));
  if (lock === 'path') opponent.stadium.cards.push(card('Path to the Peak CRE'));
  const articuno = card('Articuno-GX CES');
  actor.hand.cards.push(articuno);

  const state = new State();
  state.players = seat === 0 ? [actor, opponent] : [opponent, actor];
  state.activePlayer = seat;
  state.turn = 4;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  for (const player of state.players) {
    for (let i = 0; i < 12; i++) player.deck.cards.push(card('Psychic Energy SVE'));
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
  }

  const store = new Store({ onStateChange() {} });
  store.state = state;
  return {
    store, actor, opponent, water, articuno, previousActive,
    PlayerType, SlotType, PlayCardAction, ResolvePromptAction
  };
}

/** @param {object} scene */
function playArticuno(scene) {
  scene.store.dispatch(new scene.PlayCardAction(scene.actor.id,
    scene.actor.hand.cards.indexOf(scene.articuno), {
      player: scene.PlayerType.BOTTOM_PLAYER,
      slot: scene.SlotType.BENCH,
      index: 0
    }));
  return scene.store.state.prompts.find(prompt => prompt.result === undefined);
}

/** @param {object} scene @param {object} confirm */
function acceptAscent(scene, confirm) {
  assert.equal(confirm?.constructor.name, 'ConfirmPrompt');
  assert.equal(confirm.message, 'WANT_TO_USE_ABILITY');
  const action = new scene.ResolvePromptAction(confirm.id, true);
  assertValidPromptAction(scene.store.state, action);
  scene.store.dispatch(action);
  return scene.store.state.prompts.find(prompt => prompt.result === undefined);
}

/** @param {object} scene @param {boolean} moved */
function assertPhysicalSwitch(scene, moved) {
  assert.equal(scene.actor.active.getPokemonCard(), scene.articuno);
  assert.equal(scene.actor.bench[0].getPokemonCard(), scene.previousActive);
  assert.equal(scene.actor.active.energies.cards.includes(scene.water), moved);
  assert.equal(scene.actor.bench[0].energies.cards.includes(scene.water), !moved);
  assert.deepEqual(scene.store.state.prompts.filter(prompt =>
    prompt.result === undefined), []);
}

test('pinned Store accepts zero transfers, but raw min=1 blocks the strict paper gate', () => {
  for (const seat of [0, 1]) {
    const scene = fixture(seat);
    const confirm = playArticuno(scene);
    const prompt = acceptAscent(scene, confirm);
    assert.equal(prompt?.constructor.name, 'MoveEnergyPrompt');
    assert.equal(prompt.options.min, 1);
    assert.equal(prompt.options.allowCancel, false);
    assert.equal(prompt.validate([], scene.store.state), true);
    const empty = new scene.ResolvePromptAction(prompt.id, []);
    assert.throws(() => assertValidPromptAction(scene.store.state, empty),
      /invalid result/);

    // Store.reducePrompt does not call MoveEnergyPrompt.validate or enforce min.
    // This direct dispatch is the native acceptance witness, not the adapter path.
    scene.store.dispatch(empty);
    assertPhysicalSwitch(scene, false);
    console.log('ARTICUNO_ZERO_RAW_NATIVE', JSON.stringify({
      seat, min: prompt.options.min, emptyAcceptedByPromptValidator: true,
      emptyAcceptedByStore: true, active: scene.actor.active.getPokemonCard().fullName,
      waterRemainsOnBenchedSnorlax: true, competitiveQualification: false
    }));
  }
});

test('scoped min-zero correction composes with the separate Bench-entry lock hook', () => {
  for (const seat of [0, 1]) {
    for (const reverseInstallOrder of [false, true]) {
      const scene = fixture(seat);
      const restores = reverseInstallOrder
        ? [installArticunoZeroMovementPromptHook(), installArticunoEntryLockHook()]
        : [installArticunoEntryLockHook(), installArticunoZeroMovementPromptHook()];
      try {
        const confirm = playArticuno(scene);
        const prompt = acceptAscent(scene, confirm);
        assert.equal(prompt?.constructor.name, 'MoveEnergyPrompt');
        assert.equal(prompt.options.min, 0);
        assert.equal(prompt.options.allowCancel, false);
        const empty = new scene.ResolvePromptAction(prompt.id, []);
        assert.doesNotThrow(() => assertValidPromptAction(scene.store.state, empty));
        scene.store.dispatch(empty);
        assertPhysicalSwitch(scene, false);
        console.log('ARTICUNO_ZERO_GUARDED_NATIVE', JSON.stringify({
          seat, reverseInstallOrder, hookVersion: VERSION, min: 0,
          acceptedTransfers: 0, active: scene.actor.active.getPokemonCard().fullName,
          waterRemainsOnBenchedSnorlax: true, competitiveQualification: false
        }));
      } finally {
        for (let i = restores.length - 1; i >= 0; i--) restores[i]();
      }
    }
  }
});

test('min-zero correction preserves a positive physical Basic Water transfer', () => {
  for (const seat of [0, 1]) {
    const scene = fixture(seat);
    const restoreEntryLock = installArticunoEntryLockHook();
    const restoreZeroMovement = installArticunoZeroMovementPromptHook();
    try {
      const confirm = playArticuno(scene);
      const prompt = acceptAscent(scene, confirm);
      assert.equal(prompt.options.min, 0);
      const from = {
        player: scene.PlayerType.BOTTOM_PLAYER,
        slot: scene.SlotType.BENCH,
        index: 0
      };
      const to = {
        player: scene.PlayerType.BOTTOM_PLAYER,
        slot: scene.SlotType.ACTIVE,
        index: 0
      };
      const transfer = new scene.ResolvePromptAction(prompt.id,
        [{ from, to, card: scene.water }]);
      assert.doesNotThrow(() => assertValidPromptAction(scene.store.state, transfer));
      scene.store.dispatch(transfer);
      assertPhysicalSwitch(scene, true);
      console.log('ARTICUNO_POSITIVE_TRANSFER_NATIVE', JSON.stringify({
        seat, hookVersion: VERSION, min: 0, acceptedTransfers: 1,
        waterOnArticuno: true, competitiveQualification: false
      }));
    } finally {
      restoreZeroMovement();
      restoreEntryLock();
    }
  }
});

test('entry-lock correction suppresses the prompt before the zero-movement hook can act', () => {
  for (const seat of [0, 1]) {
    const scene = fixture(seat, 'path');
    const restoreEntryLock = installArticunoEntryLockHook();
    const restoreZeroMovement = installArticunoZeroMovementPromptHook();
    try {
      playArticuno(scene);
      assert.equal(scene.actor.active.getPokemonCard(), scene.previousActive);
      assert.equal(scene.actor.bench[0].getPokemonCard(), scene.articuno);
      assert.equal(scene.actor.active.energies.cards.includes(scene.water), true);
      assert.deepEqual(scene.store.state.prompts.filter(prompt =>
        prompt.result === undefined), []);
    } finally {
      restoreZeroMovement();
      restoreEntryLock();
    }
  }
});
