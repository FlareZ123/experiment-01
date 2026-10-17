'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { assertValidPromptAction } =
  require('../simulation/twinleaf/prompt-integrity.cjs');

const out = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const { State } = require(path.join(out, 'game/store/state/state'));
const { Player } = require(path.join(out, 'game/store/state/player'));
const { PokemonCardList } =
  require(path.join(out, 'game/store/state/pokemon-card-list'));
const { PokemonCard } = require(path.join(out, 'game/store/card/pokemon-card'));
const { EnergyCard } = require(path.join(out, 'game/store/card/energy-card'));
const { SuperType, EnergyType } =
  require(path.join(out, 'game/store/card/card-types'));
const { PlayerType, SlotType } =
  require(path.join(out, 'game/store/actions/play-card-action'));
const { MoveEnergyPrompt } =
  require(path.join(out, 'game/store/prompts/move-energy-prompt'));
const { ResolvePromptAction } =
  require(path.join(out, 'game/store/actions/resolve-prompt-action'));
const { GameMessage } = require(path.join(out, 'game/game-message'));

const ownBench = {player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0};
const ownActive = {player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0};
const opponentActive = {player: PlayerType.TOP_PLAYER, slot: SlotType.ACTIVE, index: 0};

function fixture(options = {}, filter = {superType: SuperType.ENERGY}) {
  const state = new State();
  const actor = new Player(), opponent = new Player();
  actor.id = 101; opponent.id = 202;
  actor.active.cards.push(new PokemonCard());
  opponent.active.cards.push(new PokemonCard());
  const bench = new PokemonCardList();
  bench.cards.push(new PokemonCard());
  const energy = new EnergyCard();
  bench.cards.push(energy);
  actor.bench.push(bench);
  state.players.push(actor, opponent);
  const prompt = new MoveEnergyPrompt(
    actor.id, GameMessage.MOVE_ENERGY_CARDS, PlayerType.BOTTOM_PLAYER,
    [SlotType.BENCH, SlotType.ACTIVE], filter,
    { min: 1, max: 1, allowCancel: false, ...options });
  prompt.id = 7;
  state.prompts.push(prompt);
  return {state, actor, opponent, prompt, energy};
}

function validMovement(scene, card = scene.energy) {
  return [{from: ownBench, to: ownActive, card}];
}

function verify(scene, transfers) {
  return () => assertValidPromptAction(scene.state,
    new ResolvePromptAction(scene.prompt.id, transfers));
}

test('pinned legal physical Basic Energy transfer remains playable', () => {
  const scene = fixture();
  const legal = validMovement(scene);
  assert.equal(scene.prompt.validate(legal, scene.state), true);
  assert.doesNotThrow(verify(scene, legal));
});

test('cannot move a detached physical Energy or an opponent-targeted transfer', () => {
  const scene = fixture();
  const detached = validMovement(scene, new EnergyCard());
  assert.equal(scene.prompt.validate(detached, scene.state), true);
  assert.throws(verify(scene, detached), /invalid result/);
  const wrongSide = [{from: ownBench, to: opponentActive, card: scene.energy}];
  assert.equal(scene.prompt.validate(wrongSide, scene.state), true);
  assert.throws(verify(scene, wrongSide), /invalid result/);
});

test('target and source blocks prevent otherwise valid transfers', () => {
  const fromScene = fixture({blockedFrom: [ownBench]});
  assert.throws(verify(fromScene, validMovement(fromScene)), /invalid result/);
  const toScene = fixture({blockedTo: [ownActive]});
  assert.throws(verify(toScene, validMovement(toScene)), /invalid result/);
  const mapScene = fixture({blockedMap: [{source: ownBench, blocked: [1]}]});
  assert.throws(verify(mapScene, validMovement(mapScene)), /invalid result/);
});

test('pinned count-agnostic validator accepts zero and repeated cards', () => {
  const scene = fixture();
  assert.equal(scene.prompt.validate([], scene.state), true);
  assert.throws(verify(scene, []), /invalid result/);
  const repeated = [...validMovement(scene), ...validMovement(scene)];
  assert.equal(scene.prompt.validate(repeated, scene.state), true);
  assert.throws(verify(scene, repeated), /invalid result/);
});

test('source and destination must be distinct physical Pokémon spots', () => {
  const scene = fixture();
  const sameSpot = [{from: ownBench, to: ownBench, card: scene.energy}];
  assert.equal(scene.prompt.validate(sameSpot, scene.state), true);
  assert.throws(verify(scene, sameSpot), /invalid result/);
});

test('filtered Energy must match allowed source card characteristics', () => {
  const scene = fixture({}, {superType: SuperType.ENERGY,
    energyType: EnergyType.SPECIAL});
  const basic = validMovement(scene);
  assert.equal(scene.prompt.validate(basic, scene.state), true);
  assert.throws(verify(scene, basic), /invalid result/);
});

test('sparse source transfer arrays do not satisfy the minimum', () => {
  const scene = fixture();
  const sparse = Array(1);
  assert.equal(scene.prompt.validate(sparse, scene.state), true);
  assert.throws(verify(scene, sparse), /invalid result/);
});
