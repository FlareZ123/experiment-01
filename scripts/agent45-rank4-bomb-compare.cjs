'use strict';

const assert = require('node:assert/strict');
const {isDeepStrictEqual} = require('node:util');

const VERSION = 'agent45-rank4-bomb-public-attack-pair-v1';
const TOGGLE = 'rank4RaichuBombRecipientSource';
const IDENTITY = [
  'trialId', 'planDigest', 'candidateId', 'candidateDigest',
  'opponentRank', 'opponentDigest', 'seed', 'candidateEngineSlot',
  'candidateActualTurn', 'turnEvidence', 'engineRevision', 'rules',
  'randomnessProtocol', 'engineDeckHashes'
];

/** @param {object} row @returns {0|1} */
function sourceSeat(row) {
  assert.ok(row.candidateEngineSlot === 'A' || row.candidateEngineSlot === 'B');
  return row.candidateEngineSlot === 'A' ? 1 : 0;
}

/** @param {object} row @returns {object[]} */
function sourceRaichuAttackBoards(row) {
  const seat = sourceSeat(row);
  return (row.traceSummary.publicAttackTransitions || [])
    .filter(event => event.triggerPlayerSlot === seat &&
      event.before?.[seat]?.active?.name === 'Alolan Raichu')
    .map(event => ({
      actionOrdinal: event.actionOrdinal,
      turn: event.turnBefore,
      name: event.declarations?.map(item => item.attackName) ?? [],
      activeEnergyCardsBefore: event.before[seat].active.energyCards,
      activeEnergyCardsAfter: event.after?.[seat]?.active?.energyCards ?? null
    }));
}

/** @param {object[]} before @param {object[]} after @returns {number|null} */
function firstDifferentIndex(before, after) {
  assert.ok(Array.isArray(before) && Array.isArray(after));
  const size = Math.min(before.length, after.length);
  for (let i = 0; i < size; i++) {
    if (!isDeepStrictEqual(before[i], after[i])) return i;
  }
  return before.length === after.length ? null : size;
}

/**
 * Retrospective, development-only whole-archive comparison. Neither physical
 * prompt recipients nor legal Energy activation are inferred from identical
 * compact root labels. Public attack boards are separately retained.
 * @param {object} control Parsed campaign JSON with the Bomb policy disabled.
 * @param {object} treatment Parsed campaign JSON with it enabled.
 * @returns {object}
 */
function compareRank4BombCampaigns(control, treatment) {
  assert.deepEqual(control.selectedPilotRanks, [4]);
  assert.deepEqual(treatment.selectedPilotRanks, [4]);
  assert.equal(control.planDigest, treatment.planDigest);
  assert.equal(control.seedProtocol, treatment.seedProtocol);
  assert.equal(control.maxActions, treatment.maxActions);
  assert.equal(control.totalScheduled, 8);
  assert.equal(treatment.totalScheduled, 8);
  assert.equal(control.records.length, 8);
  assert.equal(treatment.records.length, 8);
  const beforeFlags = {...control.policyFlags, [TOGGLE]: false};
  const afterFlags = {...treatment.policyFlags, [TOGGLE]: false};
  assert.deepEqual(beforeFlags, afterFlags,
    'Only the intended recipient policy flag may differ');
  assert.equal(Boolean(control.policyFlags[TOGGLE]), false);
  assert.equal(treatment.policyFlags[TOGGLE], true);
  const before = new Map(control.records.map(row => [row.trialId, row]));
  const after = new Map(treatment.records.map(row => [row.trialId, row]));
  assert.equal(before.size, 8);
  assert.equal(after.size, 8);
  assert.deepEqual([...before.keys()].sort(), [...after.keys()].sort());
  const rows = [];
  for (const [id, off] of before) {
    const on = after.get(id);
    for (const field of IDENTITY) {
      assert.deepEqual(off[field], on[field],
        'Identity drift ' + id + ': ' + field);
    }
    const left = off.traceSummary;
    const right = on.traceSummary;
    const oldRoots = left.rootActionLedger;
    const newRoots = right.rootActionLedger;
    const rootIndex = firstDifferentIndex(oldRoots, newRoots);
    const oldRaichu = sourceRaichuAttackBoards(off);
    const newRaichu = sourceRaichuAttackBoards(on);
    const physicalAttackIndex = firstDifferentIndex(oldRaichu, newRaichu);
    const changedPublicAttackBoards = !isDeepStrictEqual(
      left.publicAttackTransitions, right.publicAttackTransitions);
    rows.push({
      id, sourceSeat: sourceSeat(off), seed: off.seed,
      status: [off.status, on.status],
      actualStarter: off.turnEvidence?.firstTurnSlot ?? null,
      actions: [off.actions, on.actions],
      winner: [off.winnerIndex, on.winnerIndex],
      prizesRemaining: [left.prizesRemaining, right.prizesRemaining],
      sourceAttackDeclarations: [off.opponentAttackDeclarations,
        on.opponentAttackDeclarations],
      bombAbilityRoots: [oldRoots.filter(root => root.playerSlot === sourceSeat(off) &&
        root.ability === 'Extra Energy Bomb').map(root => root.actionOrdinal),
        newRoots.filter(root => root.playerSlot === sourceSeat(on) &&
          root.ability === 'Extra Energy Bomb').map(root => root.actionOrdinal)],
      rootLabelDigestEqual: left.rootActionLedgerSha256 === right.rootActionLedgerSha256,
      firstRootLabelDifference: rootIndex === null ? null : {
        index: rootIndex, oldRoot: oldRoots[rootIndex] ?? null,
        newRoot: newRoots[rootIndex] ?? null
      },
      changedPublicAttackBoards,
      firstPhysicalAttackBoardDifference: physicalAttackIndex,
      sourceRaichuAttackBoards: [oldRaichu, newRaichu],
      originalChronologyDigestEqual:
        left.chronologicalActionTraceSha256 === right.chronologicalActionTraceSha256,
      finalPublicStateEqual: isDeepStrictEqual(left.finalState, right.finalState),
      physicalTargetConclusion:
        (rootIndex === null && changedPublicAttackBoards) ?
          'root-label-equality-does-not-certify-physical-target-parity' :
          'public-attack-board-evidence-only'
    });
  }
  return {
    version: VERSION,
    developmentOnly: true,
    competitiveQualifiedGames: 0,
    planDigest: control.planDigest,
    seedProtocol: control.seedProtocol,
    controlsRevision: control.researchRevision,
    treatmentRevision: treatment.researchRevision,
    sourceRank: 4,
    totalPairs: rows.length,
    rows,
    totalChangedPublicAttackBoards:
      rows.filter(row => row.changedPublicAttackBoards).length,
    totalChangedRootLabelDigests:
      rows.filter(row => !row.rootLabelDigestEqual).length,
    totalChangedWinners:
      rows.filter(row => row.winner[0] !== row.winner[1]).length,
    caveat: 'Root-label ledgers omit prompt target geometry. Public attack boards ' +
      'authenticate Energy present at attack, not the exact native AttachEnergyPrompt selection. ' +
      'Retrospective selected engine outcomes and weak generic-bot play are not win rates.'
  };
}

module.exports = {VERSION, firstDifferentIndex, sourceRaichuAttackBoards,
  compareRank4BombCampaigns};
