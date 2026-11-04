'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {reconcileRegisteredAttempts} =
  require('../simulation/evaluation/agent3-registered-attempt-reconciliation.cjs');

const ids = [
  '6:0:A:champion-reference',
  '6:0:A:new-moon-lockbreaker-v1',
  '11:2:B:champion-reference',
  '11:2:B:new-moon-lockbreaker-v1'
];
const asRows = values => values.map(id => ({trial:{id}, status:'native-error'}));

test('all registered attempts exactly match, including failures and caps', () => {
  const rows = asRows([...ids].reverse());
  rows[1].status = 'native-action-cap';
  rows[2].status = 'native-terminal-unqualified';
  const out = reconcileRegisteredAttempts(ids, rows);
  assert.equal(out.exactlyReconciled, true);
  assert.equal(out.countMatches, true);
});

test('same count cannot conceal a duplicate replacing a missing trial', () => {
  const out = reconcileRegisteredAttempts(ids,
    asRows([ids[0], ids[0], ids[2], ids[3]]));
  assert.equal(out.countMatches, true);
  assert.equal(out.exactlyReconciled, false);
  assert.deepEqual(out.duplicateReturnedIds, [ids[0]]);
  assert.deepEqual(out.missingRegisteredIds, [ids[1]]);
});

test('same count cannot conceal an unknown trial replacing a registered trial', () => {
  const out = reconcileRegisteredAttempts(ids,
    asRows([ids[0], 'unregistered', ids[2], ids[3]]));
  assert.equal(out.countMatches, true);
  assert.equal(out.exactlyReconciled, false);
  assert.deepEqual(out.unexpectedReturnedIds, ['unregistered']);
  assert.deepEqual(out.missingRegisteredIds, [ids[1]]);
});

test('missing, corrupt and conflicting IDs are explicit failures', () => {
  const rows = [asRows(ids)[0], {trial:{id:ids[1]}, id:ids[2]},
    {status:'native-error'}, null];
  const out = reconcileRegisteredAttempts(ids, rows);
  assert.equal(out.exactlyReconciled, false);
  assert.deepEqual(out.conflictingRowIdentifiers, [1]);
  assert.deepEqual(out.missingRowIdentifiers, [2,3]);
});

test('duplicate registration refused despite apparent row matching', () => {
  const out = reconcileRegisteredAttempts([ids[0],ids[0]],
    asRows([ids[0],ids[0]]));
  assert.equal(out.exactlyReconciled, false);
  assert.deepEqual(out.duplicateRegisteredIds,[ids[0]]);
});

test('direct IDs work; invalid registration or array types are rejected', () => {
  assert.equal(reconcileRegisteredAttempts(ids,ids.map(id=>({id})))
    .exactlyReconciled, true);
  assert.throws(()=>reconcileRegisteredAttempts([''],[]),TypeError);
  assert.throws(()=>reconcileRegisteredAttempts(null,[]),TypeError);
});
