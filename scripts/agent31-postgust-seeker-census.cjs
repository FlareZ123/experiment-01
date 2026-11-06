'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent31-postgust-seeker-census-v1';
const SEEKER = 'VS Seeker PHF';
const GUZMA = 'Guzma';

/**
 * Audit genuine owner Pass receipts in unmodified, registered native game rows.
 * All positive flags are necessary evidence only: public Pass snapshots omit
 * the exact live owner discard and cannot certify a legal VS Seeker line.
 * @param {object[]} rows Native registered game rows, retaining errors/caps.
 * @returns {object} Correlated Pass counts and independent physical group count.
 */
function auditOwnerSeekerPasses(rows) {
  assert.ok(Array.isArray(rows));
  const groups = new Set();
  const findings = [];
  const missing = [];
  let totalPasses = 0;
  let candidatePasses = 0;
  let completeRows = 0;
  for (const row of rows) {
    assert.ok(typeof row?.trial?.id === 'string');
    const trialId = row.trial.id;
    const groupId = trialId.slice(0, trialId.lastIndexOf(':'));
    groups.add(groupId);
    const ledger = row.rootActionLedger ?? [];
    const frontier = row.nativeAllOwnerPassFrontier;
    if (!frontier?.completeNativePassCoverage) {
      missing.push({trialId, reason: String(row.error?.message ?? 'Pass coverage unavailable')});
      continue;
    }
    completeRows++;
    const seat = row.candidateSeat;
    assert.ok(seat === 0 || seat === 1);
    const byOrdinal = new Map(ledger.map(root => [root.actionOrdinal, root]));
    for (const receipt of frontier.receipts) {
      const root = byOrdinal.get(receipt.actionOrdinal);
      assert.ok(root, 'Missing native Pass root ' + trialId + ':' + receipt.actionOrdinal);
      assert.equal(root.action, 'PassTurnAction');
      assert.equal(root.playerSlot, receipt.actorSeat);
      assert.equal(root.turnBefore, receipt.turn);
      totalPasses++;
      if (receipt.actorSeat !== seat) continue;
      candidatePasses++;
      if (!receipt.ownerHandAtChosenPass.includes(SEEKER)) continue;
      const earlierGuzma = ledger.filter(other =>
        other.playerSlot === seat && other.action === 'PlayCardAction' &&
        other.card === GUZMA && other.actionOrdinal < root.actionOrdinal &&
        other.turnBefore < receipt.turn);
      const board = receipt.publicBoardBeforePass[seat];
      const energized = board.bench.flatMap((mon, index) =>
        mon.name === 'Shadow Rider Calyrex VMAX' &&
        mon.energyCards.length >= 3 &&
        mon.energyCards.every(name => name === 'Psychic Energy') ?
          [{index, energyCards:mon.energyCards.length}] : []);
      findings.push({trialId, groupId, root:root.actionOrdinal, turn:root.turnBefore,
        candidateSeat:seat, earlierCandidateGuzmaRoots:earlierGuzma.map(x => x.actionOrdinal),
        fundedBenchedShadowRider:energized,
        activeName:board.active?.name ?? null,
        activeEnergyCards:board.active?.energyCards?.length ?? null,
        handSha256:receipt.ownerHandSha256,
        publicBoardSha256:receipt.publicBoardSha256});
    }
  }
  const prior = findings.filter(x => x.earlierCandidateGuzmaRoots.length > 0);
  const withFundedBench = prior.filter(x => x.fundedBenchedShadowRider.length > 0);
  return {version:VERSION,sourceSeedGroups:groups.size,registeredGameRows:rows.length,
    rowsWithCompletePassCoverage:completeRows,rowsWithoutCompletePassCoverage:missing,
    allAcceptedOwnerPassRoots:totalPasses,acceptedCandidatePassRoots:candidatePasses,
    candidateHeldSeekerPassRoots:findings.length,
    candidateHeldSeekerPhysicalGames:new Set(findings.map(x => x.trialId)).size,
    earlierGuzmaHeldSeekerPassRoots:prior.length,
    earlierGuzmaHeldSeekerPhysicalGames:new Set(prior.map(x => x.trialId)).size,
    earlierGuzmaAndFundedBenchPassRoots:withFundedBench.length,
    earlierGuzmaAndFundedBenchPhysicalGames:new Set(withFundedBench.map(x => x.trialId)).size,
    findings:prior,competitivePaperQualifiedGames:0};
}

module.exports = {VERSION, auditOwnerSeekerPasses};
