'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {describePass, auditDdeFirstSeat} =
  require('../simulation/twinleaf/dde-v4-first-seat-policy-audit.cjs');

test('Pass description uses only declared perspective and public board', () => {
  const row = {
    actionOrdinal: 7,
    turnBefore: 3,
    decisionHandBefore: {ownHandPrintings: ['Double Dragon Energy ROS']},
    publicBoardBeforePass: [{active: {name: 'Other'}}, {
      active: {name: 'Regidrago V SIT', energyCards: ['Double Dragon Energy']},
      bench: [], stadium: []
    }],
    attackPassProbe: {
      tested: [{name: 'Other Attack', engineAcceptedAnnouncement: false}]
    }
  };
  const result = describePass(row, 1);
  assert.equal(result.active.name, 'Regidrago V SIT');
  assert.equal(result.hand[0], 'Double Dragon Energy ROS');
  assert.equal(result.probedPrintedAttacks[0].engineAcceptedAnnouncement, false);
});

test('Frozen rank-10 source first v4 DDE exposures and post-choice probes', () => {
  const result = auditDdeFirstSeat();
  console.log('SOURCE_DDE_V4_FIRST_SEAT_AUDIT ' + JSON.stringify(result));
  assert.deepEqual(result.provenance.sourceRanksBySlot, [1, 10]);
  assert.equal(result.control.verifiedByDrawLog, true);
  assert.equal(result.control.firstTurnSlot, 1);
  assert.equal(result.control.doubleDragonPlayed, 2);
  assert.equal(result.control.apexAttacks, 0);
  assert.equal(result.observationalProbe.sameObservableTrajectory, true,
    'Cloned post-choice attack probes changed a source-visible game trajectory');
  assert.ok(result.observationalProbe.probedPassCount > 0,
    'No candidate Pass was actually subjected to an attack-announcement probe');
});
