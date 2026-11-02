'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

/** @param {object} arm */
function summarizeArm(arm) {
  const receipts = arm.nativeMinimumAttachActionReceipts;
  return {
    status: arm.failure ? 'error' : arm.game.finished ? 'native-terminal' : 'capped',
    errorCode: arm.failure?.code ?? null,
    errorMessage: arm.failure?.message?.slice(0, 400) ?? null,
    sourceDealSha256: arm.separateFullSourceDealSha256,
    minRepairProposals: arm.minRepair?.proposedCorrections ?? null,
    minRepairUnsupported: arm.minRepair?.unsupported ?? null,
    celestialPrompts: arm.celestial?.nativePromptsCreated ?? null,
    celestialTransfers: arm.celestial?.nativeSelectedTransfers ?? null,
    nativeReceipts: receipts.length,
    acceptedTwoPhysicalEnergyTransfers: receipts.filter(x => x.nativeStoreActionAccepted && x.twoDistinctPhysicalCards && x.bothOriginalSourceCards && x.bothAttachedToOriginalActive).length,
    rejectedNativeSelections: receipts.filter(x => !x.nativeStoreActionAccepted).length,
    engineWinner: arm.game?.winner ?? null,
    actions: arm.game?.actions ?? null,
    settledZoneAnomalies: arm.game?.settledPhysicalZoneAnomalies ?? null,
    nativeReceiptsDetails: receipts
  };
}

/** @param {object} data */
function summarize(data) {
  assert.equal(data.schema, 'agent27-paired-native-minimum-energy-prompt-source-replay-v1');
  assert.equal(data.cases.length, 3);
  return {
    schema: 'agent27-source-minimum-attach-condensed-audit-v1',
    pinnedEngine: data.pinnedEngine,
    qualifiedCompetitiveGames: 0,
    cases: data.cases.map(row => ({
      seed: row.seed,
      seatRanks: row.seatRanks,
      sameRegisteredOriginalSixties: row.sameRegisteredOriginalSixties,
      sameInitialFullPhysicalDeal: row.sameInitialFullPhysicalDeal,
      control: summarizeArm(row.original),
      repaired: summarizeArm(row.repaired)
    }))
  };
}

if (require.main === module) {
  const filePath = process.argv[2];
  assert.ok(filePath, 'Expected paired experiment JSON path');
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  process.stdout.write(JSON.stringify(summarize(json), null, 2) + '\n');
}

module.exports = { summarize, summarizeArm };
