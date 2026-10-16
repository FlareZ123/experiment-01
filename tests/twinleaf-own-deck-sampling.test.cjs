'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditOwnDeckSampling} =
  require('../simulation/twinleaf/own-deck-determinization-audit.cjs');

test('opt-in speculative own-deck samples are insensitive to unknown physical order', () => {
  const result = auditOwnDeckSampling();
  assert.deepEqual(result.originalActions,['PassTurnAction','PlayCardAction']);
  assert.equal(result.sampledScores[0],result.sampledScores[1]);
  assert.equal(result.sampledActions[0],result.sampledActions[1]);
  assert.equal(result.originalRealDeckOrdersRestored,true);
});

test('sampler restores the actual deck and upstream prototype after speculative error', () => {
  const path = require('node:path');
  const {SimpleTactic} = require(path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics/simple-tactics'));
  const {installOwnDeckDeterminizationHook} =
    require('../simulation/twinleaf/own-deck-determinization-hook.cjs');
  const original = SimpleTactic.prototype.evaluateAction;
  const cards = [{fullName:'Alpha',id:1},{fullName:'Beta',id:2}];
  const state = {turn:4,players:[{id:101,deck:{cards:[...cards]}}]};
  SimpleTactic.prototype.evaluateAction = () => {
    throw new Error('synthetic speculative failure');
  };
  const restore = installOwnDeckDeterminizationHook({
    samples:4,seed:101,assumeNoKnownDeckOrder:true,
    assumeDeckContentsKnown:true
  });
  try {
    assert.throws(() =>
      SimpleTactic.prototype.evaluateAction.call({},state,101,{}),
    /synthetic speculative failure/);
    assert.deepEqual(state.players[0].deck.cards,cards);
  } finally {
    restore();
    SimpleTactic.prototype.evaluateAction=original;
  }
});
