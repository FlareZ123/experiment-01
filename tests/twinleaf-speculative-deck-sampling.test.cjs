'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { seededRandom } = require('../simulation/twinleaf/headless.cjs');
const { fixture } = require('../simulation/twinleaf/hidden-deck-order-audit.cjs');
const { sampleDeckOrder, installSpeculativeDeckSampling } =
  require('../simulation/twinleaf/speculative-deck-sampling.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output, name));

test('seeded canonical multiset sampling is permutation invariant', () => {
  const cards = ['B', 'A', 'B', 'C', 'A'].map((fullName, id) =>
    ({fullName, id}));
  const reversed = [...cards].reverse();
  const left = sampleDeckOrder([...cards], seededRandom(2026));
  const right = sampleDeckOrder([...reversed], seededRandom(2026));
  assert.deepEqual(left.map(c => c.fullName), right.map(c => c.fullName));
  assert.deepEqual(left.map(c => c.fullName).sort(), ['A', 'A', 'B', 'B', 'C']);
  assert.throws(() => sampleDeckOrder([{ name: 'unresolved' }], Math.random),
    /fullName/);
});

test('speculative Item scoring no longer predicts real unrevealed deck order', () => {
  const { PlayTrainerTactic } =
    engine('simple-bot/simple-tactics/play-trainer-tactic');
  const { PlayCardAction, PlayerType, SlotType } =
    engine('game/store/actions/play-card-action');
  const defs = engine('simple-bot/simple-bot-definitions');
  const options = {
    scores: defs.defaultStateScores,
    promptResolvers: defs.allPromptResolvers,
    arbiter: defs.defaultArbiterOptions
  };
  const left = fixture(true);
  const right = fixture(false);
  const signature = state => state.players[0].deck.cards
    .map(c => c.fullName + ':' + c.id);
  const firstOriginal = signature(left);
  const lastOriginal = signature(right);

  /** @param {object} state */
  function evaluate(state) {
    const tactic = new PlayTrainerTactic(options);
    const action = new PlayCardAction(state.players[0].id, 0,
      {player: PlayerType.ANY, slot: SlotType.BOARD, index: 0});
    return {
      score: tactic.evaluateAction(state, state.players[0].id, action),
      choice: tactic.useTactic(state, state.players[0])?.constructor.name || 'no-action'
    };
  }

  const baselineFirst = evaluate(left);
  const baselineLast = evaluate(right);
  assert.notEqual(baselineFirst.choice, baselineLast.choice,
    'Pinned unpatched bot must show the original hidden-order choice leak');

  let policyRng = seededRandom(7833);
  const restore = installSpeculativeDeckSampling({
    random: () => policyRng()
  });
  try {
    const leftSampled = evaluate(left);
    policyRng = seededRandom(7833);
    const rightSampled = evaluate(right);
    assert.equal(leftSampled.score, rightSampled.score,
      'Equal hidden multisets must give equal speculative score under common RNG');
    assert.equal(leftSampled.choice, rightSampled.choice,
      'The decision must not reveal the physical unseen order');
    assert.deepEqual(signature(left), firstOriginal,
      'Real engine state deck must not be reordered by speculation');
    assert.deepEqual(signature(right), lastOriginal);

    assert.throws(() => installSpeculativeDeckSampling({random: Math.random}),
      /already installed/);
  } finally {
    restore();
  }
  const revertedFirst = evaluate(left);
  const revertedLast = evaluate(right);
  assert.notEqual(revertedFirst.choice, revertedLast.choice,
    'Restoring the hook must return original engine behavior');
});
