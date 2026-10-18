'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {reconcileAttackObservations} =
  require('../scripts/aichi-attack-observation-reconcile.cjs');

const protocol = 'real-store-attack-log-declarations-v1';

function fixture(events = [], candidateSlot = 0) {
  const candidate = events.filter(e => e.playerSlot === candidateSlot).length;
  return {
    attackObservationStatus: protocol,
    actions: 12,
    candidateAttacks: 0,
    opponentAttacks: 0,
    candidateAttackDeclarations: candidate,
    opponentAttackDeclarations: events.length - candidate,
    traceSummary: {
      attackDeclarationTraceProtocol: protocol,
      attackDeclarationsAreCompleteEffects: false,
      attackDeclarationTrace: events
    }
  };
}

function declaration(playerSlot = 0, logIndex = 3) {
  return {
    kind: 'engine-attack-declaration', playerSlot,
    playerName: playerSlot === 0 ? 'research-A' : 'research-B',
    attackName: 'Horror House-GX',
    logIndex, actionOrdinal: 4
  };
}

test('delegated candidate attack overturns raw root-zero interpretation', () => {
  const r = reconcileAttackObservations(fixture([declaration()]), 0);
  assert.equal(r.status, 'self-consistent-engine-attack-declarations');
  assert.equal(r.candidateDeclarations, 1);
  assert.equal(r.opponentDeclarations, 0);
  assert.equal(r.candidateRootUndercount, true);
  assert.equal(r.opponentRootUndercount, false);
});

test('zero real-Store declarations can be observed without inferring completion', () => {
  const r = reconcileAttackObservations(fixture(), 0);
  assert.equal(r.status, 'self-consistent-engine-attack-declarations');
  assert.equal(r.candidateDeclarations, 0);
  assert.equal(r.opponentDeclarations, 0);
});

test('seat orientation is tied to candidate, not the first engine player', () => {
  const r = reconcileAttackObservations(fixture([declaration(0)], 1), 1);
  assert.equal(r.candidateDeclarations, 0);
  assert.equal(r.opponentDeclarations, 1);
  assert.equal(r.opponentRootUndercount, true);
});

test('old raw-only archive is incomplete rather than a verified silent attack', () => {
  const r = reconcileAttackObservations({
    candidateAttacks: 0, opponentAttacks: 1,
    attackObservationStatus: 'attack-observation-incomplete'
  }, 0);
  assert.equal(r.status, 'attack-observation-incomplete');
  assert.equal(r.candidateDeclarations, null);
});

test('fake counts and malformed player / duplicate index fail closed', () => {
  const a = fixture([declaration()]);
  a.candidateAttackDeclarations = 0;
  assert.equal(reconcileAttackObservations(a, 0).status,
    'attack-observation-integrity-mismatch');
  const b = fixture([declaration(0, 3), declaration(0, 3)]);
  assert.equal(reconcileAttackObservations(b, 0).status,
    'attack-observation-integrity-mismatch');
  const c = fixture([declaration()]);
  c.traceSummary.attackDeclarationTrace[0].playerName = 'Other';
  assert.equal(reconcileAttackObservations(c, 0).status,
    'attack-observation-integrity-mismatch');
});

test('declared protocol with missing source log cannot pass', () => {
  const a = fixture();
  a.traceSummary.attackDeclarationTrace = null;
  assert.equal(reconcileAttackObservations(a, 0).status,
    'attack-observation-integrity-mismatch');
});
