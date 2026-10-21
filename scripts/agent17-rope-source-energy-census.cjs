'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

/** @param {unknown} value @returns {string} */
const digest = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Read accepted source-owner basic-Energy actions from the genuine native Store
 * observer. The announced attack deficit is a policy heuristic, not a native
 * legal attack/payability certificate.
 * @param {object} row Native development game row.
 * @returns {object[]}
 */
function sourceEnergyActions(row) {
  const roots = row.actorOnlyDecisionCoverage
    .detailedComponentAudits.root.nativeRootAcceptances;
  assert.ok(Array.isArray(roots));
  return roots.filter(root => root.seat === row.sourceSeat &&
    root.kind === 'attach-basic-energy').map(root => {
    assert.equal(root.accepted, true);
    assert.equal(root.nativePhysicalEffect, 'confirmed-public-effect');
    assert.equal(root.publicZonesChanged, true);
    assert.ok(['active','bench'].includes(root.intent.slot));
    assert.ok(Number.isSafeInteger(root.intent.gapBefore));
    assert.ok(Number.isSafeInteger(root.intent.gapAfter));
    assert.equal(root.intent.gapBefore - root.intent.gapAfter, 1);
    const source = row.sourceSeat;
    assert.equal(root.after.attachedEnergyCounts[source] -
      root.before.attachedEnergyCounts[source], 1,
      'Accepted attachment must increase source physical Energy-card count');
    return {
      turn: root.globalTurn,
      card: root.intent.printing,
      targetSlot: root.intent.slot,
      activeBefore: root.before.activePrintings[source],
      activeAfter: root.after.activePrintings[source],
      plannedAttack: root.intent.attackName,
      heuristicCostGapBefore: root.intent.gapBefore,
      heuristicCostGapAfter: root.intent.gapAfter
    };
  });
}

/**
 * Compare the two original source-first rank-11 New Moon historical Store
 * branches. This is a same-deal, fixed-policy replay diagnostic, not a
 * competitive game or win-rate sample.
 * @param {object} control Original no-Rope development row.
 * @param {object} treatment Escape Rope development row.
 * @returns {object} Validated observer summary.
 */
function auditRopeSourceEnergy(control, treatment) {
  const id = '11:retrospective-sourcefirst:2:B:new-moon-lockbreaker-v1';
  for (const row of [control,treatment]) {
    assert.equal(row.trial.id, id);
    assert.equal(row.trial.seed, 482443328);
    assert.equal(row.sourceActuallyFirst, true);
    assert.equal(row.sourceSeat, 0);
    assert.equal(row.candidateSeat, 1);
    assert.equal(row.qualifiesForCompetitiveInference, false);
    assert.equal(row.rootActionLedger.length, row.rootActionCount);
    assert.equal(digest(row.rootActionLedger), row.rootActionLedgerSha256);
    assert.equal(row.sourceAttackSettlement.auditedActorRole, 'source');
  }
  assert.equal(control.sourceDealFingerprint, treatment.sourceDealFingerprint);
  assert.equal(control.verifiedFirstTurn, treatment.verifiedFirstTurn);
  assert.deepEqual(control.rootActionLedger.slice(0,38),
    treatment.rootActionLedger.slice(0,38),
    'Physical native Store action prefix must be identical');
  const untreated = control.rootActionLedger[38];
  const intervened = treatment.rootActionLedger[38];
  assert.equal(untreated.actionOrdinal,38);
  assert.equal(untreated.action,'PassTurnAction');
  assert.equal(intervened.actionOrdinal,38);
  assert.equal(intervened.action,'PlayCardAction');
  assert.equal(intervened.card,'Escape Rope');
  assert.equal(intervened.playerSlot,treatment.candidateSeat);
  assert.equal(intervened.turnBefore,6);

  const controlEnergy = sourceEnergyActions(control);
  const treatmentEnergy = sourceEnergyActions(treatment);
  assert.deepEqual(controlEnergy.map(a => a.turn),
    treatmentEnergy.map(a => a.turn),
    'Both source histories must contain the same four Energy turns');
  assert.deepEqual(controlEnergy.map(a => a.turn),[5,9,19,23]);
  for (const [i,event] of controlEnergy.entries()) {
    assert.equal(event.card,treatmentEnergy[i].card,
      'Observed Energy printings changed between histories');
  }
  assert.equal(controlEnergy[0].activeBefore,treatmentEnergy[0].activeBefore);

  return {
    schema:'agent17-source-energy-redirect-audit-v1',
    selectedHistoricalDeal:true,
    sourceDealFingerprint:control.sourceDealFingerprint,
    physicalRootPrefixLength:38,
    intervention:{ordinal:38,turn:6,card:'Escape Rope'},
    sourceEnergyControl:controlEnergy,
    sourceEnergyRope:treatmentEnergy,
    sourceAttackDeclarations:{
      control:control.sourceAttackSettlement.declarations,
      rope:treatment.sourceAttackSettlement.declarations
    },
    sourceSettledAttacks:{
      control:control.sourceAttackSettlement.settled,
      rope:treatment.sourceAttackSettlement.settled
    },
    terminal:{
      control:{finished:control.finished,prizes:control.finalPrizes,
        winner:control.winner,actions:control.actionCount},
      rope:{finished:treatment.finished,prizes:treatment.finalPrizes,
        winner:treatment.winner,actions:treatment.actionCount}
    },
    competitiveQualified:false,
    caveats:[
      'Opponent hand and legal switching or retreat options were not audited.',
      'Heuristic Energy gaps are not legal attack-availability certificates.',
      'Retrospective deal and weak common source policy cannot establish a win rate.'
    ]
  };
}

module.exports={sourceEnergyActions,auditRopeSourceEnergy};
