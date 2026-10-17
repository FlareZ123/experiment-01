'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { assertValidPromptAction } =
  require('../simulation/twinleaf/prompt-integrity.cjs');

const out = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const { State } = require(path.join(out, 'game/store/state/state'));
const { Player } = require(path.join(out, 'game/store/state/player'));
const { CardList } = require(path.join(out, 'game/store/state/card-list'));
const { ChoosePrizePrompt } =
  require(path.join(out, 'game/store/prompts/choose-prize-prompt'));
const { ResolvePromptAction } =
  require(path.join(out, 'game/store/actions/resolve-prompt-action'));
const { GameMessage } = require(path.join(out, 'game/game-message'));

/** @param {number} id @returns {object} */
function player(id) {
  const current = new Player();
  current.id = id;
  for (let i = 0; i < 6; i++) {
    const prize = new CardList();
    prize.cards.push({ name: 'physical Prize ' + i });
    current.prizes.push(prize);
  }
  return current;
}

function fixture(options = {}) {
  const state = new State();
  const actor = player(101);
  const opponent = player(202);
  state.players.push(actor, opponent);
  const prompt = new ChoosePrizePrompt(
    actor.id, GameMessage.CHOOSE_PRIZE_CARD,
    { count: 1, allowCancel: false, ...options });
  prompt.id = 7;
  state.prompts.push(prompt);
  return { state, actor, opponent, prompt };
}

/** @param {object} fixture @param {unknown} result */
function evaluate(fixture, result) {
  return () => assertValidPromptAction(fixture.state,
    new ResolvePromptAction(fixture.prompt.id, result));
}

test('KO Prize selection accepts the own physical Prize list', () => {
  const scene = fixture();
  const chosen = [scene.actor.prizes[2]];
  assert.equal(scene.prompt.validate(chosen, scene.state), true);
  assert.doesNotThrow(evaluate(scene, chosen));
});

test('pinned validator accepts opponent Prize but strict mode rejects', () => {
  const scene = fixture();
  const foreign = [scene.opponent.prizes[1]];
  assert.equal(scene.prompt.validate(foreign, scene.state), true);
  assert.throws(evaluate(scene, foreign), /invalid result/);
});

test('pinned validator accepts non-Prize CardList but strict mode rejects', () => {
  const scene = fixture();
  const foreign = new CardList();
  foreign.cards.push({ name: 'card outside Prize zone' });
  assert.equal(scene.prompt.validate([foreign], scene.state), true);
  assert.throws(evaluate(scene, [foreign]), /invalid result/);
});

test('Prize selection respects blocked absolute physical Prize indices', () => {
  const scene = fixture({ blocked: [0, 3] });
  assert.equal(scene.prompt.validate([scene.actor.prizes[0]], scene.state), true);
  assert.throws(evaluate(scene, [scene.actor.prizes[0]]), /invalid result/);
  assert.throws(evaluate(scene, [scene.actor.prizes[3]]), /invalid result/);
  assert.doesNotThrow(evaluate(scene, [scene.actor.prizes[4]]));
});

test('opponent-Prize prompt selects opponent zone and disallows own zone', () => {
  const scene = fixture({useOpponentPrizes: true, blocked: [1]});
  assert.doesNotThrow(evaluate(scene, [scene.opponent.prizes[2]]));
  assert.throws(evaluate(scene, [scene.opponent.prizes[1]]), /invalid result/);
  assert.throws(evaluate(scene, [scene.actor.prizes[2]]), /invalid result/);
});

test('a sparse one-Prize array cannot consume an undefined Prize slot', () => {
  const scene = fixture();
  const sparse = Array(1);
  assert.equal(scene.prompt.validate(sparse, scene.state), true);
  assert.throws(evaluate(scene, sparse), /invalid result/);
});

test('same Prize list cannot fill a two-Prize KO response twice', () => {
  const scene = fixture({count: 2});
  const repeated = [scene.actor.prizes[0], scene.actor.prizes[0]];
  assert.equal(scene.prompt.validate(repeated, scene.state), false);
  assert.throws(evaluate(scene, repeated), /invalid result/);
  assert.doesNotThrow(evaluate(scene,
    [scene.actor.prizes[0], scene.actor.prizes[1]]));
});
