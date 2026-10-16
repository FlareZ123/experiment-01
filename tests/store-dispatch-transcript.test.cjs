'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {withStoreDispatchTranscript} = require('../simulation/twinleaf/store-dispatch-transcript.cjs');
const {actionTraceSha256} = require('../simulation/evaluation/canonical-action-trace.cjs');

class Action { constructor(id) { this.id = id; } }
class Store {
  constructor() { this.state = {turn: 0, phase: 3, players: [], prompts: []}; }
  dispatch(action) {
    if (action.error) throw new Error('rejected');
    this.state.turn += 1;
    return action.id;
  }
}

test('actual Store.dispatch calls are recorded without changing return value', () => {
  const previous = Store.prototype.dispatch;
  const store = new Store();
  const r = withStoreDispatchTranscript(Store, () =>
    [store.dispatch(new Action(101)), store.dispatch(new Action(202))]);
  assert.deepEqual(r.result, [101, 202]);
  assert.equal(Store.prototype.dispatch, previous);
  assert.deepEqual(r.actionTrace.map(e => e.step), [0, 1]);
  assert.equal(r.dispatched, 2);
  assert.equal(r.parametersCaptured, true);
  assert.equal(r.traceSha256, actionTraceSha256(r.actionTrace));
  assert.equal(r.diagnosticTraceSha256, r.traceSha256);
  assert.equal(r.actionTrace[0].before.turn, 0);
  assert.equal(r.actionTrace[1].after.turn, 2);
});

test('restoration is unconditional after an engine exception', () => {
  const previous = Store.prototype.dispatch;
  assert.throws(() => withStoreDispatchTranscript(Store, () => {
    const a = new Action(101);
    a.error = true;
    new Store().dispatch(a);
  }), /rejected/);
  assert.equal(Store.prototype.dispatch, previous);
});

test('unportable nested classes report a capture failure but dispatch proceeds', () => {
  class Card { constructor() { this.name = 'card'; } }
  const result = withStoreDispatchTranscript(Store, () => {
    const a = new Action(101);
    a.card = new Card();
    return new Store().dispatch(a);
  });
  assert.equal(result.result, 101);
  assert.equal(result.parametersCaptured, false);
  assert.equal(result.traceSha256, null);
  assert.equal(result.diagnosticTraceSha256, actionTraceSha256(result.actionTrace));
  assert.match(result.captureErrors[0], /non-JSON prototype/);
});

test('live-only mode excludes speculation on other Store instances', () => {
  class AddPlayerAction extends Action {}
  const real = new Store();
  const simulation = new Store();
  const report = withStoreDispatchTranscript(Store, () => {
    real.dispatch(new AddPlayerAction(101));
    simulation.dispatch(new Action(202));
    real.dispatch(new Action(303));
  }, {liveStoreOnly: true});
  assert.equal(report.dispatched, 2);
  assert.equal(report.ignoredOtherStoreDispatches, 1);
  assert.equal(report.captureScope, 'first-AddPlayerAction-Store-instance');
  assert.deepEqual(report.actionTrace.map(e => e.action), ['AddPlayerAction', 'Action']);
});

