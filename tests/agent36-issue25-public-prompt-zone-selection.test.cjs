'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  VERSION,
  resolveBlockedPromptZoneEvent
} = require('../simulation/evaluation/agent36-issue25-public-prompt-zone-selection.cjs');

function record(overrides = {}) {
  return {seat: 0, turn: 54, phase: 3, promptType: 'ChooseCardsPrompt', ...overrides};
}

function event(overrides = {}) {
  return {
    ownerSeat: 0,
    turn: 54,
    phase: 3,
    promptType: 'ChooseCardsPrompt',
    message: 'CHOOSE_CARD_TO_DISCARD',
    stateIsLiveStore: true,
    sourceCardPublic: true,
    sourcePrinting: 'Galarian Stunfisk SSH',
    zoneMatches: [{
      zone: 'opponent-active-energies',
      match: 'exact',
      visibility: 'public'
    }],
    ...overrides
  };
}

test('one exact public source and zone event is uniquely selected', () => {
  const observed = event();
  const result = resolveBlockedPromptZoneEvent([record()], [observed]);
  assert.equal(result.version, VERSION);
  assert.equal(result.status, 'FALLBACK_CAPTURED_SOURCE_AND_PUBLIC_ZONE_MATCHED');
  assert.equal(result.candidateCount, 1);
  assert.deepEqual(result.blockedPromptZoneCandidates, [
    {quarantineRecordIndex: 0, eventIndex: 0}
  ]);
  assert.equal(result.blockedPromptZoneEventIndex, 0);
  assert.strictEqual(result.blockedPromptZoneEvent, observed);
});

test('missing prompt event remains explicit', () => {
  const result = resolveBlockedPromptZoneEvent([record()], []);
  assert.equal(result.status, 'FALLBACK_CAPTURED_PROMPT_EVENT_MISSING');
  assert.equal(result.blockedPromptZoneEvent, null);
  assert.deepEqual(result.blockedPromptZoneCandidates, []);
});

test('multiple matching prompt events remain candidates and are never first-selected', () => {
  const first = event();
  const second = event({sourcePrinting: 'Another public source'});
  const result = resolveBlockedPromptZoneEvent([record()], [first, second]);
  assert.equal(result.status, 'FALLBACK_CAPTURED_PROMPT_EVENT_AMBIGUOUS');
  assert.equal(result.candidateCount, 2);
  assert.deepEqual(result.blockedPromptZoneCandidates, [
    {quarantineRecordIndex: 0, eventIndex: 0},
    {quarantineRecordIndex: 0, eventIndex: 1}
  ]);
  assert.equal(result.blockedPromptZoneEvent, null);
});

test('multiple quarantine records are ambiguous even when only one event matches', () => {
  const result = resolveBlockedPromptZoneEvent(
    [record(), record({turn: 55})],
    [event()]
  );
  assert.equal(result.status, 'FALLBACK_CAPTURED_MULTIPLE_QUARANTINE_RECORDS');
  assert.equal(result.candidateCount, 1);
  assert.equal(result.blockedPromptZoneEvent, null);
  assert.deepEqual(result.candidateGroups, [
    {quarantineRecordIndex: 0, matchingEventIndices: [0]},
    {quarantineRecordIndex: 1, matchingEventIndices: []}
  ]);
});

test('multiple zone matches remain explicit and do not pass', () => {
  const observed = event({
    zoneMatches: [
      {zone: 'opponent-active-energies', match: 'exact', visibility: 'public'},
      {zone: 'owner-discard', match: 'subset', visibility: 'public'}
    ]
  });
  const result = resolveBlockedPromptZoneEvent([record()], [observed]);
  assert.equal(result.status, 'FALLBACK_CAPTURED_ZONE_AMBIGUOUS');
  assert.strictEqual(result.blockedPromptZoneEvent, observed);
});

test('a unique hidden-zone match does not pass as a public zone', () => {
  const observed = event({
    zoneMatches: [{zone: 'owner-hand', match: 'exact', visibility: 'hidden'}],
    offeredPrintings: null
  });
  const result = resolveBlockedPromptZoneEvent([record()], [observed]);
  assert.equal(result.status, 'FALLBACK_CAPTURED_ZONE_NOT_PUBLIC');
});

test('source identity must be public and named before the diagnostic passes', () => {
  const observed = event({sourceCardPublic: false, sourcePrinting: null});
  const result = resolveBlockedPromptZoneEvent([record()], [observed]);
  assert.equal(result.status, 'FALLBACK_CAPTURED_SOURCE_UNRESOLVED');
});

test('only a live Store prompt event can pass', () => {
  const observed = event({stateIsLiveStore: false});
  const result = resolveBlockedPromptZoneEvent([record()], [observed]);
  assert.equal(result.status, 'FALLBACK_CAPTURED_PROMPT_NOT_LIVE_STORE');
});

test('unknown quarantine seat preserves all same-turn, phase and type candidates', () => {
  const result = resolveBlockedPromptZoneEvent(
    [record({seat: null})],
    [event(), event({ownerSeat: 1})]
  );
  assert.equal(result.status, 'FALLBACK_CAPTURED_PROMPT_EVENT_AMBIGUOUS');
  assert.equal(result.candidateCount, 2);
});

test('prompt type mismatches are not joined by turn and seat alone', () => {
  const result = resolveBlockedPromptZoneEvent(
    [record()],
    [event({promptType: 'ShowCardsPrompt'})]
  );
  assert.equal(result.status, 'FALLBACK_CAPTURED_PROMPT_EVENT_MISSING');
});
