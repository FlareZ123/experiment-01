'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const { EXPECTED_ENGINE_PIN } =
  require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');
const repositoryRoot = path.resolve(__dirname, '../..');
const twinleafRoot = path.join(repositoryRoot, 'vendor/twinleaf');
const compiledSimulator = path.join(
  twinleafRoot,
  'ptcg-server/output/game/bots/simulator.js'
);

test('pinned Store retains grouped prompt continuations while State-only Simulator reconstruction is rejected', {
  skip: !fs.existsSync(compiledSimulator),
  timeout: 30000
}, () => {
  const { Simulator } =
    require('../../vendor/twinleaf/ptcg-server/output/game/bots/simulator');
  const { State, GamePhase } =
    require('../../vendor/twinleaf/ptcg-server/output/game/store/state/state');
  const { Player } =
    require('../../vendor/twinleaf/ptcg-server/output/game/store/state/player');
  const { ConfirmPrompt } =
    require('../../vendor/twinleaf/ptcg-server/output/game/store/prompts/confirm-prompt');
  const { ResolvePromptAction } =
    require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
  const { GameError } =
    require('../../vendor/twinleaf/ptcg-server/output/game/game-error');

  const actualEnginePin = execFileSync(
    'git', ['-C', twinleafRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }
  ).trim();
  assert.equal(actualEnginePin, EXPECTED_ENGINE_PIN,
    'native prompt regression must run against the reviewed Twinleaf pin');

  const initial = new State();
  const firstPlayer = new Player();
  firstPlayer.id = 0;
  const secondPlayer = new Player();
  secondPlayer.id = 1;
  initial.players = [firstPlayer, secondPlayer];
  initial.activePlayer = 0;
  initial.phase = GamePhase.SETUP;
  initial.turn = 0;
  initial.prompts = [];

  const simulator = new Simulator(initial);
  const store = simulator.store;
  const state = store.state;

  const first = new ConfirmPrompt(firstPlayer.id, 'GO_FIRST');
  const second = new ConfirmPrompt(firstPlayer.id, 'GO_FIRST');
  const unrelated = new ConfirmPrompt(secondPlayer.id, 'GO_FIRST');
  let continuationCalls = 0;
  let continuationResults = null;

  store.prompt(state, [first, second], results => {
    continuationCalls += 1;
    continuationResults = results.slice();
  });
  store.prompt(state, unrelated, () => {});

  assert.deepEqual(store.promptItems.map(item => item.ids), [
    [first.id, second.id],
    [unrelated.id]
  ]);
  assert.throws(
    () => new Simulator(state),
    error => error instanceof GameError
  );

  store.dispatch(new ResolvePromptAction(first.id, true));
  assert.equal(continuationCalls, 0,
    'a grouped continuation must wait until every prompt in its group is resolved');
  assert.equal(first.result, true);
  assert.equal(second.result, undefined);

  store.dispatch(new ResolvePromptAction(second.id, false));
  assert.equal(continuationCalls, 1,
    'the original Store must invoke the registered continuation exactly once');
  assert.deepEqual(continuationResults, [true, false]);
  assert.deepEqual(store.promptItems.map(item => item.ids), [[unrelated.id]]);
  assert.equal(unrelated.result, undefined);
});
