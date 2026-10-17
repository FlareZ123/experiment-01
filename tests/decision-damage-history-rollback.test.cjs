'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {observeOrRestoreDecisionDamageHistory} =
  require('../simulation/twinleaf/decision-damage-history-rollback.cjs');

class Card {
  constructor(name) {
    this.name = name;
    this.damageTakenLastTurn = 0;
  }
}

function stateFor(card) {
  const zone = cards => ({cards});
  return {turn:3,activePlayer:1,players:[{
    active:zone([card]),bench:[zone([card])],hand:zone([]),
    deck:zone([]),discard:zone([]),lostzone:zone([]),prizes:[zone([])]
  }]};
}

test('observation reports attack-history mutation and preserves selected action', () => {
  class Bot {
    decodeNextAction(state) {
      state.players[0].active.cards[0].damageTakenLastTurn = 120;
      return {name:'Attack'};
    }
  }
  const base=Bot.prototype.decodeNextAction;
  const c=new Card('Koraidon');
  const watcher=observeOrRestoreDecisionDamageHistory(Bot,Card);
  try {
    assert.deepEqual(new Bot().decodeNextAction(stateFor(c)),{name:'Attack'});
    assert.equal(c.damageTakenLastTurn,120);
    assert.equal(watcher.report.firstWriteDecision,1);
    assert.equal(watcher.report.changedDecisionCount,1);
    assert.equal(watcher.report.changedCardFields,1);
    assert.equal(watcher.report.sampleWrites[0].before,0);
    assert.equal(watcher.report.sampleWrites[0].after,120);
    assert.equal(watcher.report.decisionActions[0].actorSeat,1);
  } finally {
    watcher.restore();
  }
  assert.strictEqual(Bot.prototype.decodeNextAction,base);
});

test('repair undoes only damage history while retaining other policy mutations', () => {
  class Bot {
    decodeNextAction(state) {
      const c=state.players[0].active.cards[0];
      c.damageTakenLastTurn=150;
      c.otherMarker=true;
      return {name:'Pass'};
    }
  }
  const card=new Card('Mimikyu');
  const monitor=observeOrRestoreDecisionDamageHistory(
    Bot,Card,{restoreDamageHistory:true});
  try {
    assert.deepEqual(new Bot().decodeNextAction(stateFor(card)),{name:'Pass'});
    assert.equal(card.damageTakenLastTurn,0);
    assert.equal(card.otherMarker,true);
    assert.equal(monitor.report.changedCardFields,1);
    assert.equal(monitor.report.decisions,1);
  } finally {
    monitor.restore();
  }
});

test('exception unwinds history and restores inherited method descriptor', () => {
  class Parent {
    decodeNextAction(state) {
      state.players[0].active.cards[0].damageTakenLastTurn=10;
      throw new Error('source failure');
    }
  }
  class Bot extends Parent {}
  const card=new Card('Dialga');
  const monitor=observeOrRestoreDecisionDamageHistory(
    Bot,Card,{restoreDamageHistory:true});
  try {
    assert.throws(()=>new Bot().decodeNextAction(stateFor(card)),/source failure/);
    assert.equal(card.damageTakenLastTurn,0);
    assert.equal(monitor.report.decisions,1);
  } finally {
    monitor.restore();
  }
  assert.equal(Object.hasOwn(Bot.prototype,'decodeNextAction'),false);
});

test('no source Card mutation is a no-op', () => {
  class Bot { decodeNextAction() { return {name:'NoChange'}; } }
  const card=new Card('Latias');
  const monitor=observeOrRestoreDecisionDamageHistory(
    Bot,Card,{restoreDamageHistory:true});
  try {
    new Bot().decodeNextAction(stateFor(card));
    assert.equal(monitor.report.changedDecisionCount,0);
    assert.equal(monitor.report.changedCardFields,0);
  } finally {
    monitor.restore();
  }
});
