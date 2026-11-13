'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { paidRetreatAgainstSnorlax, completeHoodedSnorlaxSequence } =
  require('../../simulation/twinleaf/2026-11/agent3-hood-snorlax-paid-retreat-action.cjs');

const cases = [
  { name: 'unprotected Active VMAX is blocked', options: {}, allowed: false,
    pathToPeak: false },
  { name: 'Active VMAX Hood permits the same paid retreat', options: { hood: true },
    allowed: true, pathToPeak: false },
  { name: 'Hood on a Benched VMAX does not protect the different Active VMAX',
    options: { benchHood: true }, allowed: false, pathToPeak: false },
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
      assert.equal(result.benchHoodPhysicallyAttached, !!row.options.benchHood, label);
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


test('complete owner-visible Field Blower -> Hood -> paid retreat -> Clefairy Rondo sequence succeeds in both physical seats', () => {
  const scenarios = [
    { name: 'remove opponent Active Tool Jammer before attaching Hood',
      toolJammer: true },
    { name: 'Path to the Peak leaves Snorlax Block live but Hood protects the Active',
      stadium: 'Path to the Peak CRE' }
  ];
  for (const candidateSeat of [0, 1]) {
    for (const scenario of scenarios) {
      const result = completeHoodedSnorlaxSequence({
        candidateSeat,
        toolJammer: scenario.toolJammer === true,
        stadium: scenario.stadium
      });
      const label = 'candidate physical seat ' + candidateSeat + ': ' +
        scenario.name;
      assert.equal(result.candidateSeat, candidateSeat, label);
      assert.equal(result.blockListed, true,
        label + ': Snorlax Block must remain listed');
      assert.equal(result.underworldDoorListed,
        scenario.stadium !== 'Path to the Peak CRE',
        label + ': Path to the Peak only suppresses the Rule-Box VMAX Ability');
      assert.equal(result.toolJammerInitiallyPresent,
        scenario.toolJammer === true, label);
      assert.equal(result.fieldBlowerPlayed,
        scenario.toolJammer === true, label);
      assert.equal(result.toolJammerRemoved,
        scenario.toolJammer === true, label);
      assert.equal(result.hoodOnCurrentActiveBeforeRetreat, true, label);
      assert.equal(result.retreatCostEnergyCount, 2, label);
      assert.equal(result.retreatSucceeded, true, label);
      assert.equal(result.candidateActiveAfterRetreat,
        "Lillie's Clefairy ex JTG", label);
      assert.equal(result.clefairyPsychicEnergyAtAttack, 7, label);
      assert.equal(result.candidateBenchAtAttack, 5, label);
      assert.equal(result.opponentBenchAtAttack, 5, label);
      assert.equal(result.expectedRondoDamage, 220, label);
      if (result.snorlaxDamageAfterAttackAction !== null) {
        assert.equal(result.snorlaxDamageAfterAttackAction, 230, label);
      }
      assert.equal(result.attackName, 'Full Moon Rondo', label);
      assert.equal(result.snorlaxDiscarded, true, label);
      assert.equal(result.prizesTaken, 1, label);
    }
  }
});
