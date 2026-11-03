'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { auditStadiumEnumeratorCustody } = require('../scripts/agent7-stadium-enumerator-custody-audit.cjs');

function root(overrides = {}) {
  return {
    ordinal: 0, seat: 0, turn: 5, trainers: [],
    chosen: { action: 'PassTurnAction', handIndex: null, trainer: null },
    dispatch: 'native-accepted', ...overrides
  };
}
const path = { handIndex: 7, printing: 'Path to the Peak CRE',
  name: 'Path to the Peak', type: 'Stadium',
  publicBlocker: null, nativeEnumeratorOffered: true };
const sky = { handIndex: 7, printing: 'Sky Field ROS', name: 'Sky Field',
  type: 'Stadium', publicBlocker: null, nativeEnumeratorOffered: false };
const fixture = roots => ({ rows: [{ physicalSlot: 'A', source5Seat: 0,
  seed: 123, initialFullPhysicalDealDigest: 'hash', frontiers: { roots } }] });

test('prior own Stadium remains historical context, not a legal certificate', () => {
  const observed = auditStadiumEnumeratorCustody(fixture([
    root({ trainers: [path], chosen: { action: 'PlayCardAction',
      handIndex: 7, trainer: { printing: path.printing, type: 'Stadium' } } }),
    root({ ordinal: 1, turn: 7, trainers: [sky] })
  ]));
  assert.equal(observed.omittedUnblockedStadiumCopies, 1);
  assert.equal(observed.events[0].lastAcceptedOwnStadium.printing,
    'Path to the Peak CRE');
  assert.equal(observed.events[0].paperEligibleAtOmission, 'UNKNOWN');
  assert.equal(observed.independentPaperLegalPlaysCertified, 0);
});

test('public blocker excludes non-offered Stadium from unresolved omissions', () => {
  const observed = auditStadiumEnumeratorCustody(fixture([
    root({ trainers: [{ ...sky, publicBlocker: 'stadium-already-played' }] })
  ]));
  assert.equal(observed.omittedUnblockedStadiumCopies, 0);
});

test('seat histories and multiple correlated observations stay distinct', () => {
  const observed = auditStadiumEnumeratorCustody(fixture([
    root({ trainers: [path], chosen: { action: 'PlayCardAction', handIndex: 7,
      trainer: { printing: path.printing, type: 'Stadium' } } }),
    root({ ordinal: 1, seat: 1, turn: 6, trainers: [sky] }),
    root({ ordinal: 2, seat: 0, turn: 7, trainers: [sky] }),
    root({ ordinal: 3, seat: 0, turn: 9, trainers: [sky] })
  ]));
  assert.equal(observed.omittedUnblockedStadiumCopies, 3);
  assert.equal(observed.events[0].lastAcceptedOwnStadium, null);
  assert.equal(observed.events[1].lastAcceptedOwnStadium.printing,
    'Path to the Peak CRE');
  assert.equal(observed.events[2].lastAcceptedOwnStadium.printing,
    'Path to the Peak CRE');
});
