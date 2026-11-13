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
  for (const candidateSeat of [0, 1]) {
    for (const row of cases) {
      const label = 'candidate physical seat ' + candidateSeat + ': ' + row.name;
      const result = paidRetreatAgainstSnorlax({
        ...row.options, candidateSeat
      });
      assert.equal(result.options.candidateSeat, candidateSeat, label);
      assert.equal(result.action, 'RetreatAction', label);
      assert.equal(result.retreatCostEnergyCount, 2, label);
      assert.equal(result.physicalPsychicEnergyBefore, 2, label);
      assert.equal(result.blockListed, true,
        label + ': Snorlax PGO Block must remain active in every arm');
      assert.equal(result.underworldDoorListed, !row.pathToPeak,
        label + ': Path to the Peak should suppress only the VMAX Rule-Box Ability');
      assert.equal(result.hoodPhysicallyAttached, !!row.options.hood, label);
      assert.equal(result.retreatSucceeded, row.allowed, label);
      assert.equal(result.activeAfter,
        row.allowed ? 'Shadow Rider Calyrex V' : 'Shadow Rider Calyrex VMAX',
        label);
      assert.equal(result.discardedPsychicEnergy, row.allowed ? 2 : 0, label);
      assert.equal(result.vmaxEnergyAfter, row.allowed ? 0 : 2, label);
      if (row.allowed) {
        assert.equal(result.exception, null, label);
      } else {
        assert.match(result.exception ?? '', /BLOCKED_BY_EFFECT/, label);
      }
    }
  }
});
