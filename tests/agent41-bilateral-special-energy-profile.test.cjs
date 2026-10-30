'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {specialEnergyRootProfile} =
  require('../simulation/evaluation/agent41-bilateral-special-energy-profile.cjs');

test('opt-in both-seat Special Energy selector is seat/identity symmetric', () => {
  for (const slot of ['A', 'B']) {
    const p = specialEnergyRootProfile({bilateral: true}, slot);
    assert.deepEqual({
      mode:p.mode, enabled:p.enabled,
      ownerSeat:p.ownerSeat, sharedPolicy:p.sharedPolicy
    }, {mode:'both',enabled:true,ownerSeat:null,sharedPolicy:true});
  }
});

test('default-OFF profile preserves the legacy root', () => {
  assert.deepEqual(specialEnergyRootProfile({}, 'A'),
    specialEnergyRootProfile({}, 'B'));
  assert.equal(specialEnergyRootProfile({}, 'A').enabled, false);
});

test('source/candidate single-seat diagnostics cannot masquerade as shared policy', () => {
  for (const [slot,sourceSeat,candidateSeat] of [['A',1,0],['B',0,1]]) {
    const source=specialEnergyRootProfile({source:true},slot);
    const candidate=specialEnergyRootProfile({candidate:true},slot);
    assert.equal(source.ownerSeat,sourceSeat);
    assert.equal(candidate.ownerSeat,candidateSeat);
    assert.equal(source.sharedPolicy,false);
    assert.equal(candidate.sharedPolicy,false);
  }
});

test('rejects incompatible profiles and unknown physical orientation', () => {
  assert.throws(() => specialEnergyRootProfile({source:true,bilateral:true},'A'),
    /Choose one Special Energy root mode/);
  assert.throws(() => specialEnergyRootProfile({source:true,candidate:true},'A'),
    /Choose one Special Energy root mode/);
  assert.throws(() => specialEnergyRootProfile({},'C'));
});
