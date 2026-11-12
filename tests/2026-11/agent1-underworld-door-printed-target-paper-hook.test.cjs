'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const output = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');
const engine = name => require(path.join(output, name));
const {State} = engine('game/store/state/state');
const {Player} = engine('game/store/state/player');
const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
const {PokemonCard} = engine('game/store/card/pokemon-card');
const {EnergyCard} = engine('game/store/card/energy-card');
const {CardType, EnergyType} = engine('game/store/card/card-types');
const {PlayerType, SlotType} =
  engine('game/store/actions/play-card-action');
const {PowerEffect} = engine('game/store/effects/game-effects');
const {GameCardMessage, GameStoreMessage} = engine('game/game-message');
const {ShadowRiderCalyrexVMAX} = engine(
  'sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax'
);
const {
  withUnderworldDoorPrintedTargetHook
} = require('../../simulation/twinleaf/2026-11/agent1-underworld-door-printed-target-paper-hook.cjs');

function makePokemon(type, name) {
  const pokemon = new PokemonCard();
  pokemon.name = name;
  pokemon.fullName = name + ' TEST';
  pokemon.cardType = [type];
  return pokemon;
}

function makeSlot(type, index) {
  const slot = new PokemonCardList();
  if (type !== null) {
    slot.cards.push(makePokemon(type, 'Bench ' + index));
  }
  return slot;
}

function makeEnergy(type = CardType.PSYCHIC, name = 'Psychic Energy') {
  const energy = new EnergyCard();
  energy.name = name;
  energy.fullName = name + ' TEST';
  energy.energyType = EnergyType.BASIC;
  energy.provides = [type];
  return energy;
}

function makeScene({ownerSeat = 0, benchTypes = [CardType.PSYCHIC],
  energies = [makeEnergy()]} = {}) {
  const state = new State();
  const owner = new Player();
  const opponent = new Player();
  owner.id = 101;
  opponent.id = 202;
  state.players = ownerSeat === 0 ?
    [owner, opponent] : [opponent, owner];
  owner.bench = benchTypes.map((type, index) =>
    makeSlot(type, index));
  owner.hand.cards = [...energies];
  const card = new ShadowRiderCalyrexVMAX();
  const effect = new PowerEffect(owner, card.powers[0], card);
  const captured = {};
  const store = {
    prompt(nextState, prompt, callback) {
      captured.prompt = prompt;
      captured.callback = callback;
      return nextState;
    }
  };
  return {state, owner, opponent, card, effect, store, captured};
}

function target(index) {
  return {
    player: PlayerType.BOTTOM_PLAYER,
    slot: SlotType.BENCH,
    index
  };
}

function useDoor(scene) {
  return scene.card.reduceEffect(scene.store, scene.state, scene.effect);
}

test('pinned Underworld Door prompt accepts a non-Psychic Bench target', () => {
  const scene = makeScene({
    benchTypes: [CardType.COLORLESS, CardType.PSYCHIC]
  });
  useDoor(scene);
  const prompt = scene.captured.prompt;
  assert.ok(prompt);
  assert.equal(prompt.message, GameCardMessage.ATTACH_ENERGY_TO_BENCH);
  assert.deepEqual(prompt.options.blockedTo, []);
  // The card implementation checks each PokemonCardList as if it were a
  // PokemonCard, so its intended Psychic-target block is never populated.
  assert.deepEqual(prompt.options.blocked, []);
  const decoded = prompt.decode([{to: target(0), index: 0}], scene.state);
  assert.equal(decoded.length, 1);
  assert.equal(decoded[0].to.index, 0);
  assert.equal(prompt.validate(decoded, scene.state), true);
});

test('pinned Underworld Door still opens a prompt when no Psychic Bench target exists', () => {
  const scene = makeScene({benchTypes: [CardType.COLORLESS]});
  useDoor(scene);
  assert.ok(scene.captured.prompt);
  const decoded = scene.captured.prompt.decode(
    [{to: target(0), index: 0}], scene.state);
  assert.equal(decoded.length, 1);
});

for (const ownerSeat of [0, 1]) {
  test('paper hook restricts target type and validates source Energy for owner seat ' +
    ownerSeat, () => {
    const scene = makeScene({
      ownerSeat,
      benchTypes: [CardType.COLORLESS, CardType.PSYCHIC, null],
      energies: [makeEnergy(), makeEnergy(CardType.DARKNESS, 'Darkness Energy')]
    });
    const wrapped = withUnderworldDoorPrintedTargetHook(() => useDoor(scene));
    assert.strictEqual(wrapped.result, scene.state);
    const prompt = scene.captured.prompt;
    assert.ok(prompt);
    assert.deepEqual(prompt.options.blocked, []);
    assert.deepEqual(prompt.options.blockedTo, [
      target(0), target(2)
    ]);
    assert.deepEqual(prompt.options.validCardTypes, [CardType.PSYCHIC]);
    assert.equal(wrapped.audit.underworldDoorEffectCalls, 1);
    assert.equal(wrapped.audit.promptsMatched, 1);
    assert.equal(wrapped.audit.promptsCorrected, 1);
    assert.equal(wrapped.audit.ownerZonesOnly, true);
    assert.equal(wrapped.audit.vendorModified, false);

    assert.throws(() => prompt.decode(
      [{to: target(0), index: 0}], scene.state),
    error => error.message === GameStoreMessage.CAN_ONLY_ATTACH_TO_PSYCHIC);

    assert.throws(() => prompt.decode(
      [{to: target(1), index: 1}], scene.state),
    error => error.message === GameStoreMessage.INVALID_PROMPT_RESULT);

    const decoded = prompt.decode(
      [{to: target(1), index: 0}], scene.state);
    assert.equal(decoded.length, 1);
    assert.equal(decoded[0].to.index, 1);
    assert.equal(prompt.validate(decoded, scene.state), true);
    assert.equal(wrapped.audit.invalidAssignmentsRejected, 2);
    assert.equal(wrapped.audit.validAssignmentsAccepted, 1);
  });
}

test('paper hook refuses Underworld Door when the owner has no Psychic Bench target', () => {
  const scene = makeScene({benchTypes: [CardType.COLORLESS]});
  assert.throws(() => withUnderworldDoorPrintedTargetHook(() => useDoor(scene)),
    error => error.message === GameStoreMessage.CANNOT_USE_POWER &&
      error.agent1UnderworldDoorPaperAudit?.underworldDoorEffectCalls === 1 &&
      error.agent1UnderworldDoorPaperAudit?.promptsMatched === 1 &&
      error.agent1UnderworldDoorPaperAudit?.noPsychicBenchRejections === 1);
  assert.equal(scene.captured.prompt, undefined);
});

test('paper hook restores the card prototype after a rejected ability prompt', () => {
  const before = Object.getOwnPropertyDescriptor(
    ShadowRiderCalyrexVMAX.prototype, 'reduceEffect');
  const scene = makeScene({benchTypes: [CardType.COLORLESS]});
  assert.throws(() => withUnderworldDoorPrintedTargetHook(() => useDoor(scene)));
  const after = Object.getOwnPropertyDescriptor(
    ShadowRiderCalyrexVMAX.prototype, 'reduceEffect');
  assert.strictEqual(after.value, before.value);
  assert.equal(after.enumerable, before.enumerable);
  assert.equal(after.configurable, before.configurable);
});
