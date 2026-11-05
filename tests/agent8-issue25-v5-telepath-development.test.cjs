'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {withTelepathInsideNativeMatches} =
  require('../simulation/evaluation/agent8-issue25-v5-telepath-development.cjs');
const {withStewardInnermostOwnerPrompts} =
  require('../simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs');

const mockTelepath = calls => next => {
  calls.push('telepath-enter');
  const result = next();
  calls.push('telepath-exit');
  return {result, audit: {actualAttachments: 1, matchingOwnerSearches: 1,
    settled: 1, physicallyBenched: 2}};
};

test('actual nested v5 Prize/Promotion precedes Telepath root decoder on one native match', () => {
  const order = [];
  const headless = {runMatch: request => {
    order.push('native:' + request.label);
    return {native: 'returned'};
  }};
  const first = headless.runMatch;
  const received = withTelepathInsideNativeMatches(() =>
    withStewardInnermostOwnerPrompts(
      () => headless.runMatch({label: 'registered:one'}), {
        headless,
        prize: next => {
          order.push('prize-enter');
          const result = next();
          order.push('prize-exit');
          return {result, audit: {selected: 1}};
        },
        pokemon: next => {
          order.push('pokemon-enter');
          const result = next();
          order.push('pokemon-exit');
          return {result, audit: {accepted: 1}};
        }
      }
    ), {headless, telepath: mockTelepath(order)});
  assert.deepEqual(order, [
    'pokemon-enter','prize-enter','telepath-enter',
    'native:registered:one','telepath-exit','prize-exit','pokemon-exit'
  ]);
  assert.equal(received.audit.nativeMatchCalls, 1);
  assert.equal(received.audit.nativeMatchAttempts[0].telepath.settled, 1);
  assert.strictEqual(headless.runMatch, first);
  assert.equal(received.audit.competitiveGamesQualified, 0);
});

test('native decoder throw preserves failed-match Telepath audit and both wrappers restore', () => {
  const headless = {runMatch: () => {throw new Error('native root14 abort');}};
  const first = headless.runMatch;
  const received = withTelepathInsideNativeMatches(() => {
    assert.notStrictEqual(headless.runMatch, first);
    assert.throws(() => headless.runMatch({label: 'registered:error'}),
      /native root14 abort/);
    return 'continued-after-preserved-failure';
  }, {headless, telepath: next => {
    try {return next();}
    catch (error) {
      error.ownerTelepathicAudit = {settled: 0, nativeRejected: 1};
      throw error;
    }
  }});
  assert.strictEqual(headless.runMatch, first);
  assert.equal(received.result, 'continued-after-preserved-failure');
  assert.equal(received.audit.nativeMatchAttempts.length, 1);
  assert.equal(received.audit.nativeMatchAttempts[0].disposition,
    'engine-aborted-unqualified');
  assert.equal(received.audit.nativeMatchAttempts[0].telepath.nativeRejected, 1);
});
