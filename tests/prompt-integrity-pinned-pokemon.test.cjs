'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { assertValidPromptAction } =
  require('../simulation/twinleaf/prompt-integrity.cjs');

const out = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const { State } = require(path.join(out, 'game/store/state/state'));
const { Player } = require(path.join(out, 'game/store/state/player'));
const { PokemonCard } = require(path.join(out, 'game/store/card/pokemon-card'));
const { PokemonCardList } =
  require(path.join(out, 'game/store/state/pokemon-card-list'));
const { ChoosePokemonPrompt } =
  require(path.join(out, 'game/store/prompts/choose-pokemon-prompt'));
const { PlayerType, SlotType } =
  require(path.join(out, 'game/store/actions/play-card-action'));
const { ResolvePromptAction } =
  require(path.join(out, 'game/store/actions/resolve-prompt-action'));
const { GameMessage } = require(path.join(out, 'game/game-message'));

/** @param {number} id */
function readyPlayer(id) {
  const player = new Player();
  player.id = id;
  player.active.cards.push(new PokemonCard());
  for (let i = 0; i < 2; i++) {
    const spot = new PokemonCardList();
    spot.cards.push(new PokemonCard());
    player.bench.push(spot);
  }
  return player;
}

/** @param {number} side @param {number[]} slots @param {object} options */
function fixture(side, slots, options = {}) {
  const state = new State();
  const actor = readyPlayer(101), opponent = readyPlayer(202);
  state.players.push(actor, opponent);
  const prompt = new ChoosePokemonPrompt(
    101, GameMessage.CHOOSE_POKEMON_TO_SWITCH, side, slots,
    { min: 1, max: 1, allowCancel: false, ...options });
  prompt.id = 7;
  state.prompts.push(prompt);
  return { state, actor, opponent, prompt };
}

function examine(scene, result) {
  return () => assertValidPromptAction(scene.state,
    new ResolvePromptAction(7, result));
}

test('normal own-Bench selection succeeds', () => {
  const scene = fixture(PlayerType.BOTTOM_PLAYER, [SlotType.BENCH]);
  const chosen = [scene.actor.bench[1]];
  assert.equal(scene.prompt.validate(chosen, scene.state), true);
  assert.doesNotThrow(examine(scene, chosen));
});

test('pinned selector permits Active under Bench-only prompt; guard rejects', () => {
  const scene = fixture(PlayerType.BOTTOM_PLAYER, [SlotType.BENCH]);
  const invalid = [scene.actor.active];
  assert.equal(scene.prompt.validate(invalid, scene.state), true);
  assert.throws(examine(scene, invalid), /invalid result/);
});

test('pinned selector permits opponent under own-only prompt; guard rejects', () => {
  const scene = fixture(PlayerType.BOTTOM_PLAYER, [SlotType.BENCH]);
  const invalid = [scene.opponent.bench[0]];
  assert.equal(scene.prompt.validate(invalid, scene.state), true);
  assert.throws(examine(scene, invalid), /invalid result/);
});

test('opponent-only and both-sided requests honor their declared side', () => {
  const top = fixture(PlayerType.TOP_PLAYER, [SlotType.ACTIVE, SlotType.BENCH]);
  assert.doesNotThrow(examine(top, [top.opponent.active]));
  assert.throws(examine(top, [top.actor.active]), /invalid result/);
  const any = fixture(PlayerType.ANY, [SlotType.BENCH]);
  assert.doesNotThrow(examine(any, [any.opponent.bench[0]]));
  assert.doesNotThrow(examine(any, [any.actor.bench[0]]));
});

test('same physical Pokémon spot cannot satisfy two selections', () => {
  const scene = fixture(PlayerType.ANY, [SlotType.BENCH], {min: 2, max: 2});
  const repeated = [scene.actor.bench[0], scene.actor.bench[0]];
  assert.equal(scene.prompt.validate(repeated, scene.state), true);
  assert.throws(examine(scene, repeated), /invalid result/);
  assert.doesNotThrow(examine(scene,
    [scene.actor.bench[0], scene.opponent.bench[0]]));
});

test('detached nonempty Pokémon spot is not a valid player target', () => {
  const scene = fixture(PlayerType.ANY, [SlotType.BENCH]);
  const detached = new PokemonCardList();
  detached.cards.push(new PokemonCard());
  assert.equal(scene.prompt.validate([detached], scene.state), true);
  assert.throws(examine(scene, [detached]), /invalid result/);
});
