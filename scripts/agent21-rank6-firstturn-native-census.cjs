'use strict';

const assert = require('node:assert/strict');

/**
 * Read-only, failure-inclusive rank-6 native accepted-action census.
 * Every original candidate arm remains visible; physical source deal equality
 * is checked rather than assumed for paired candidate treatments.
 * @param {object} archive Complete agent41-prospective-canonical-32.json.
 * @returns {object}
 */
function rank6FirstTurnCensus(archive) {
  assert.equal(archive.schema, 'agent41-preregistered-32-arm-canonical-scout-v1');
  assert.equal(archive.registrationBlob, '8c54d8497f9927b04d501237462f64a42173d33d');
  assert.equal(archive.developmentResult.rows.length, 32);
  const arms = archive.developmentResult.rows.filter(row => row.trial.rank === 6);
  assert.equal(arms.length, 16);
  const cells = new Map();
  for (const arm of arms) {
    assert.equal(arm.verifiedFirstTurn, true);
    const key = [arm.trial.repeat, arm.trial.candidateSlot, arm.trial.seed].join(':');
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(arm);
  }
  assert.equal(cells.size, 8);
  const records = [];
  for (const [cell, pair] of cells) {
    assert.equal(pair.length, 2);
    assert.deepEqual(pair.map(arm => arm.trial.candidateId).sort(),
      ['champion-reference', 'new-moon-lockbreaker-v1']);
    const sourceFirst = pair[0].sourceActuallyFirst;
    const sourceTurn = sourceFirst ? 1 : 2;
    const sourceFirstEligibleAttackTurn = sourceFirst ? 3 : 2;
    assert.equal(pair[1].sourceActuallyFirst, sourceFirst);
    const rows = pair.map(arm => {
      const roots = arm.rootActionLedger.filter(root =>
        root.turnBefore === sourceTurn && root.playerSlot === arm.sourceSeat &&
        root.pendingPrompt === null);
      return {
        candidate: arm.trial.candidateId,
        sourcePhysicalDeal: arm.sourceDealFingerprint,
        sourceFirstTurnActions: roots.map(root =>
          ({action: root.action, card: root.card ?? null,
            attack: root.attack ?? null})),
        sourceFirstEligibleAttackDeclarations: arm.rootActionLedger.filter(root =>
          root.playerSlot === arm.sourceSeat && root.turnBefore ===
          sourceFirstEligibleAttackTurn && root.action === 'AttackAction')
          .map(root => root.attack),
        sourceAutoCompleted: sourceFirst ?
          arm.sourceAudit.turn3.completed === true :
          arm.sourceAudit.turn2.completed === true,
        finished: arm.finished === true,
        rootCount: arm.rootActionCount
      };
    });
    records.push({
      cell,
      sourceActuallyFirst: sourceFirst,
      firstSourceTurn: sourceTurn,
      firstSourceAttackEligibleTurn: sourceFirstEligibleAttackTurn,
      sameOriginalSourcePhysicalDeal:
        rows[0].sourcePhysicalDeal === rows[1].sourcePhysicalDeal,
      identicalFirstSourceTurnRootLabels:
        JSON.stringify(rows[0].sourceFirstTurnActions) ===
        JSON.stringify(rows[1].sourceFirstTurnActions),
      rows
    });
  }
  records.sort((a, b) => a.cell.localeCompare(b.cell));
  const allRows = records.flatMap(record => record.rows);
  return {
    schema: 'agent21-rank6-native-original-firstturn-census-v1',
    originalArms: arms.length,
    registeredSourceSeedSeatCells: records.length,
    sourceActuallyFirstCells: records.filter(record =>
      record.sourceActuallyFirst).length,
    originalSourcePhysicalDealMatches: records.filter(record =>
      record.sameOriginalSourcePhysicalDeal).length,
    originalSourcePhysicalDealMismatches: records.filter(record =>
      !record.sameOriginalSourcePhysicalDeal).map(record => record.cell),
    firstSourceTurnPassOnlyArms: allRows.filter(row =>
      row.sourceFirstTurnActions.length === 1 &&
      row.sourceFirstTurnActions[0].action === 'PassTurnAction').length,
    firstSourceTurnSameRootLabelsCells: records.filter(record =>
      record.identicalFirstSourceTurnRootLabels).length,
    firstEligibleSourceAttackCompletedArms: allRows.filter(row =>
      row.sourceAutoCompleted).length,
    matchedDealCellsWithBothEligibleAttacks: records.filter(record =>
      record.sameOriginalSourcePhysicalDeal &&
      record.rows.every(row => row.sourceAutoCompleted)).length,
    mismatchedDealCellsWithOneEligibleAttack: records.filter(record =>
      !record.sameOriginalSourcePhysicalDeal &&
      record.rows.filter(row => row.sourceAutoCompleted).length === 1).length,
    records,
    caveat: 'Root actions show what the original native Store accepted. Hidden owner hands and alternative legality are not in this archive. Distinct candidates may influence later turns, and mismatched source physical deals are not matched trials.'
  };
}

if (require.main === module) {
  const fs = require('node:fs');
  const archive = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  process.stdout.write(JSON.stringify(rank6FirstTurnCensus(archive), null, 2) + '\n');
}

module.exports = {rank6FirstTurnCensus};
