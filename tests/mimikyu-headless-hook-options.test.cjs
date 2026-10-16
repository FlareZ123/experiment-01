'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {runMatch, upstreamSmokeDeck} =
  require('../simulation/twinleaf/headless.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');

test('headless Mimikyu hooks opt in, report policy and restore prototypes', () => {
  const {Store} = require(path.join(output, 'game/store/store'));
  const {Mimikyu} = require(path.join(output,
    'sets/08-sun-and-moon/set-guardians-rising/mimikyu'));
  const originalDispatch = Store.prototype.dispatch;
  const originalReduce = Mimikyu.prototype.reduceEffect;
  const deck = upstreamSmokeDeck();
  assert.equal(deck.length, 60);

  const common = {deckA: deck, deckB: deck, seed: 73421, maxActions: 35};
  const hooked = runMatch({
    ...common,
    mimikyuApexCopycatCompatibility: true,
    mimikyuDeclaredHistoryCorrection: true,
    regidragoDeclaredHistoryCorrection: true,
    passClearsLastAttackCorrection: true
  });
  assert.equal(hooked.mimikyuApexCopycatCompatibility, true);
  assert.equal(hooked.mimikyuDeclaredHistoryCorrection, true);
  assert.equal(hooked.regidragoDeclaredHistoryCorrection, true);
  assert.equal(hooked.passClearsLastAttackCorrection, true);
  assert.match(hooked.policy, /MimikyuNonGXCopyApex-v1/);
  assert.match(hooked.policy, /MimikyuDeclaredHistory-v1/);
  assert.match(hooked.policy, /RegidragoDeclaredHistory-v1/);
  assert.match(hooked.policy, /PassClearsLastAttack-v1/);
  assert.equal(Store.prototype.dispatch, originalDispatch);
  assert.equal(Mimikyu.prototype.reduceEffect, originalReduce);

  const baseline = runMatch(common);
  assert.equal(baseline.mimikyuApexCopycatCompatibility, false);
  assert.equal(baseline.mimikyuDeclaredHistoryCorrection, false);
  assert.equal(baseline.regidragoDeclaredHistoryCorrection, false);
  assert.equal(baseline.passClearsLastAttackCorrection, false);
  assert.equal(Store.prototype.dispatch, originalDispatch);
  assert.equal(Mimikyu.prototype.reduceEffect, originalReduce);
});
