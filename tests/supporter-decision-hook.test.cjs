'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { installSupporterDecisionHook } = require('../simulation/twinleaf/supporter-decision-hook.cjs');

/** @param {string} relativePath */
function engine(relativePath) {
  return require(path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output', relativePath));
}

const { PlaySupporterTactic } = engine('simple-bot/simple-tactics/play-supporter-tactic');
const { GuzmaAndHala } = engine('sets/08-sun-and-moon/set-cosmic-eclipse/guzma-and-hala');
const { PlayCardAction } = engine('game/store/actions/play-card-action');

function proposal() {
  const supporter = new GuzmaAndHala();
  const player = {
    id: 101,
    supporterTurn: 0,
    supporter: { cards: [] },
    hand: { cards: [supporter] }
  };
  const state = { turn: 2 };
  const tactic = {
    options: { scores: { tactics: { supporterBonus: 25 } } },
    getStateScore: () => 0,
    evaluateAction: () => 10
  };
  return { supporter, player, state, tactic };
}

test('pinned upstream speculative Supporter decision makes its own action illegal', () => {
  const { supporter, player, state, tactic } = proposal();
  const action = PlaySupporterTactic.prototype.useTactic.call(tactic, state, player);
  assert.ok(action instanceof PlayCardAction);
  assert.equal(action.handIndex, 0);
  assert.equal(player.supporterTurn, 2);
  assert.equal(supporter.canPlay(null, state, player), false);
});

test('opt-in decision hook returns an action without consuming Supporter permission', () => {
  const { supporter, player, state, tactic } = proposal();
  const original = PlaySupporterTactic.prototype.useTactic;
  const restore = installSupporterDecisionHook();
  try {
    const action = PlaySupporterTactic.prototype.useTactic.call(tactic, state, player);
    assert.ok(action instanceof PlayCardAction);
    assert.equal(player.supporterTurn, 0);
    assert.equal(supporter.canPlay(null, state, player), true);
  } finally {
    restore();
  }
  assert.equal(PlaySupporterTactic.prototype.useTactic, original);
});

test('hook preserves previously consumed Supporter and restores after an exception', () => {
  const { player, state, tactic } = proposal();
  player.supporterTurn = 2;
  const original = PlaySupporterTactic.prototype.useTactic;
  const restore = installSupporterDecisionHook();
  try {
    assert.equal(PlaySupporterTactic.prototype.useTactic.call(tactic, state, player), undefined);
    assert.equal(player.supporterTurn, 2);
    player.supporterTurn = 0;
    tactic.evaluateAction = () => { throw new Error('deliberate speculative failure'); };
    assert.throws(() => PlaySupporterTactic.prototype.useTactic.call(tactic, state, player),
      /deliberate speculative failure/);
    assert.equal(player.supporterTurn, 0);
  } finally {
    restore();
  }
  assert.equal(PlaySupporterTactic.prototype.useTactic, original);
});


test('SimpleTacticsAi rejects its own legal Supporter proposal without the guard', () => {
  const { SimpleTacticsAi } = engine('simple-bot/simple-tactics-ai');
  const { defaultStateScores } = engine('simple-bot/simple-bot-definitions');
  const { GamePhase } = engine('game/store/state/state');
  const { PassTurnAction } = engine('game/store/actions/game-actions');
  const { supporter, player, state } = proposal();
  state.players = [player];
  state.prompts = [];
  state.activePlayer = 0;
  state.phase = GamePhase.PLAYER_TURN;
  const options = { tactics: [PlaySupporterTactic], promptResolvers: [],
    scores: defaultStateScores, arbiter: {} };
  function decide() {
    const bot = new SimpleTacticsAi({id: player.id}, options, null);
    bot.tactics[0].getStateScore = () => 0;
    bot.tactics[0].evaluateAction = () => 10;
    // Legal gate uses the pinned concrete Guzma & Hala canPlay predicate.
    bot.isValidAction = () => supporter.canPlay(null, state, player);
    return bot.decodeNextAction(state);
  }
  assert.ok(decide() instanceof PassTurnAction);
  assert.equal(player.supporterTurn, state.turn);
  player.supporterTurn = 0;
  const restore = installSupporterDecisionHook();
  try {
    assert.ok(decide() instanceof PlayCardAction);
    assert.equal(player.supporterTurn, 0);
  } finally {
    restore();
  }
});
