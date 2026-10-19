'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ARCHIVED, runAudit
} = require('../simulation/twinleaf/rank9-terminal-period-public-root-audit.cjs');

test('rank9 Terminal Period historical root anchors describe three distinct original deals', () => {
  assert.equal(ARCHIVED.length, 3);
  assert.equal(new Set(ARCHIVED.map(row => row.seed)).size, 3);
  assert.deepEqual(ARCHIVED.map(row => row.sourceSeat), [0,0,1]);
  assert.equal(ARCHIVED.reduce((sum, row) =>
    sum + row.originalRootOrdinals.length, 0), 22);
});

test('the same pinned source deals reveal whether Terminal Period could Knock Out at each original root', () => {
  const data = runAudit();
  assert.equal(data.historicalRegisteredDeals, 16);
  assert.equal(data.retrospectivelySelectedReplayDeals, 3);
  assert.equal(data.results.length, 3);
  assert.equal(data.historicalParity, true,
    'Original policy/root sequence changed; stop before interpreting targeted historical attacks');
  assert.equal(data.terminalPeriodReplayCount, 22);
  assert.equal(data.rootConditionAtSixDamageCounters +
    data.rootConditionNotAtSixDamageCounters, 22);
  for (const row of data.results) {
    assert.deepEqual(row.newRootOrdinals, row.originalRootOrdinals);
    for (const attack of row.replayTerminalPeriodAttacks) {
      assert.equal(attack.attacker, 'Mega Absol ex');
      assert.equal(Number.isInteger(attack.defenderDamageBefore), true);
      assert.equal(attack.defenderDamageBefore >= 0, true);
    }
  }
  assert.equal(data.competitiveQualifiedGames, 0);
  process.stdout.write(JSON.stringify({
    historicalParity: data.historicalParity,
    totalTerminalPeriodRoots: data.terminalPeriodReplayCount,
    exactSixDamageCounterRoots: data.rootConditionAtSixDamageCounters,
    otherDamageCounterRoots: data.rootConditionNotAtSixDamageCounters,
    closedAttackPromptRoots: data.promptClosedCount,
    registeredSourceDeals: data.historicalRegisteredDeals,
    selectedReplayDeals: data.retrospectivelySelectedReplayDeals,
    status: 'post-hoc original-deal mechanism diagnosis, unqualified for strength'
  }) + '\n');
});
