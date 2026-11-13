'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { paidRetreatAgainstSnorlax } =
  require('../../simulation/twinleaf/2026-11/agent3-hood-snorlax-paid-retreat-action.cjs');

const cases = [
  { name: 'unprotected Active VMAX is blocked', options: {}, allowed: false,
    pathToPeak: false },
  { name: 'Active VMAX Hood permits the same paid retreat', options: { hood: true },
    allowed: true, pathToPeak: false },
  { name: 'Path to the Peak does not suppress non-Rule-Box Snorlax Block',
    options: { stadium: 'Path to the Peak CRE' }, allowed: false,
    pathToPeak: true },
  { name: 'Hood still protects the Active VMAX under Path to the Peak',
    options: { hood: true, stadium: 'Path to the Peak CRE' }, allowed: true,
    pathToPeak: true },
  { name: 'Jamming Tower disables Hood and leaves Block effective',
    options: { hood: true, stadium: 'Jamming Tower TWM' }, allowed: false,
    pathToPeak: false },
  { name: 'opponent Active Tool Jammer disables Hood and leaves Block effective',
    options: { hood: true, toolJammer: true }, allowed: false,
    pathToPeak: false }
];

test('pinned Store applies Active-only Snorlax Block to a real two-Psychic paid RetreatAction with Hood and Stadium controls', () => {
  for (const row of cases) {
    const result = paidRetreatAgainstSnorlax(row.options);
    assert.equal(result.action, 'RetreatAction', row.name);
    assert.equal(result.retreatCostEnergyCount, 2, row.name);
    assert.equal(result.physicalPsychicEnergyBefore, 2, row.name);
    assert.equal(result.blockListed, true,
      row.name + ': Snorlax PGO Block must remain active in every arm');
    assert.equal(result.underworldDoorListed, !row.pathToPeak,
      row.name + ': Path to the Peak should suppress only the VMAX Rule-Box Ability');
    assert.equal(result.hoodPhysicallyAttached, !!row.options.hood, row.name);
    assert.equal(result.retreatSucceeded, row.allowed, row.name);
    assert.equal(result.activeAfter,
      row.allowed ? 'Shadow Rider Calyrex V' : 'Shadow Rider Calyrex VMAX',
      row.name);
    assert.equal(result.discardedPsychicEnergy, row.allowed ? 2 : 0, row.name);
    assert.equal(result.vmaxEnergyAfter, row.allowed ? 0 : 2, row.name);
    if (row.allowed) {
      assert.equal(result.exception, null, row.name);
    } else {
      assert.match(result.exception ?? '', /BLOCKED_BY_EFFECT/, row.name);
    }
  }
});
