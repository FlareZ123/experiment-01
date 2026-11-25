'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {hasProbeFailure} = require('../simulation/twinleaf/japanese-promos-source-probe.cjs');

const seat = (sourceSeat, status) => ({sourceSeat, status});

test('accepts both expected seat cases when each is completed or action-limited', () => {
  assert.equal(hasProbeFailure([
    seat(0, 'completed-engine-game'),
    seat(1, 'action-limited')
  ]), false);
  assert.equal(hasProbeFailure([
    seat(0, 'action-limited'),
    seat(1, 'action-limited')
  ]), false);
});

test('fails when either seat throws even if the other completes', () => {
  assert.equal(hasProbeFailure([
    seat(0, 'engine-exception'),
    seat(1, 'completed-engine-game')
  ]), true);
  assert.equal(hasProbeFailure([
    seat(0, 'completed-engine-game'),
    seat(1, 'engine-exception')
  ]), true);
});

test('fails when either seat throws even if the other is action-limited', () => {
  assert.equal(hasProbeFailure([
    seat(0, 'engine-exception'),
    seat(1, 'action-limited')
  ]), true);
  assert.equal(hasProbeFailure([
    seat(0, 'action-limited'),
    seat(1, 'engine-exception')
  ]), true);
});

test('fails on missing, duplicate, or unrecognized seat-case output', () => {
  assert.equal(hasProbeFailure([]), true);
  assert.equal(hasProbeFailure([seat(0, 'completed-engine-game')]), true);
  assert.equal(hasProbeFailure([
    seat(0, 'completed-engine-game'),
    seat(0, 'action-limited')
  ]), true);
  assert.equal(hasProbeFailure([
    seat(0, 'completed-engine-game'),
    seat(1, 'unknown-status')
  ]), true);
});
