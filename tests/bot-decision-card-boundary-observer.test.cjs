'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {observeDecisionBoundaries, changedSourceCardFields} =
  require('../simulation/twinleaf/bot-decision-card-boundary-observer.cjs');

class Card {
  constructor() {
    this.name = 'Source Test Card';
    this.damageTakenLastTurn = 0;
    this.tags = ['baseline'];
  }
}

function stateFor(card) {
  const zone = cards => ({cards});
  return {
    turn: 4,
    players: [{
      active: zone([card]),
      bench: [zone([])],
      hand: zone([]),
      deck: zone([]),
      discard: zone([]),
      lostzone: zone([]),
      prizes: [zone([])]
    }]
  };
}

test('records only Card mutations surviving an entire decision', () => {
  class Bot {
    decodeNextAction(state) {
      const card = state.players[0].active.cards[0];
      card.damageTakenLastTurn = 20;
      card.tags.push('scored');
      const action = {kind: 'Pass'};
      return action;
    }
  }
  const unwrapped = Bot.prototype.decodeNextAction;
  const monitor = observeDecisionBoundaries(Bot, Card);
  const card = new Card();
  const state = stateFor(card);
  try {
    assert.deepEqual(new Bot().decodeNextAction(state), {kind: 'Pass'});
    assert.equal(monitor.report.decisions, 1);
    assert.equal(monitor.report.decisionsWithChanges, 1);
    assert.equal(monitor.report.changedFields, 2);
    assert.equal(monitor.report.changesByField.damageTakenLastTurn, 1);
    assert.equal(monitor.report.changesByField.tags, 1);
    assert.equal(monitor.report.samples[0].turn, 4);
    assert.equal(card.damageTakenLastTurn, 20, 'observer never repairs source state');
  } finally {
    monitor.restore();
  }
  assert.strictEqual(Bot.prototype.decodeNextAction, unwrapped);
});

test('does not change an unmutated decision and restores an inherited method', () => {
  class ParentBot {
    decodeNextAction() { return {kind:'EndTurn'}; }
  }
  class Bot extends ParentBot {}
  assert.equal(Object.hasOwn(Bot.prototype, 'decodeNextAction'), false);
  const monitor = observeDecisionBoundaries(Bot, Card);
  try {
    const card = new Card();
    assert.deepEqual(new Bot().decodeNextAction(stateFor(card)), {kind:'EndTurn'});
    assert.equal(monitor.report.decisions, 1);
    assert.equal(monitor.report.changedFields, 0);
  } finally {
    monitor.restore();
  }
  assert.equal(Object.hasOwn(Bot.prototype, 'decodeNextAction'), false);
});

test('exception path remains observable without swallowing the exception', () => {
  class Bot {
    decodeNextAction(state) {
      state.players[0].active.cards[0].damageTakenLastTurn = 10;
      throw new Error('original failure');
    }
  }
  const monitor = observeDecisionBoundaries(Bot, Card);
  try {
    assert.throws(() => new Bot().decodeNextAction(stateFor(new Card())),
      /original failure/);
    assert.equal(monitor.report.decisions, 1);
    assert.equal(monitor.report.samples[0].returnedAction, '<threw>');
  } finally {
    monitor.restore();
  }
});

test('primitive snapshot diff compares a physical card once', () => {
  const c = new Card();
  const before = new Map([[c, {
    name: '"Source Test Card"',
    damageTakenLastTurn: '0',
    tags: '["baseline"]'
  }]]);
  c.damageTakenLastTurn = 20;
  assert.deepEqual(changedSourceCardFields(before), [{
    card: 'Source Test Card', field: 'damageTakenLastTurn',
    before: '0', after: '20'
  }]);
});
