'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../twinleaf/headless.cjs');
const { originals } =
  require('./agent41-rank3-arbitration-original-store.cjs');
const { runArm } =
  require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');
const { TRIAL, EXPECTED } =
  require('./agent17-skyliner-reply-owner-pass-native.cjs');
const { withPendingEndTurnSwitchCleanup } =
  require('../twinleaf/pending-end-turn-switch-cleanup.cjs');

const VERSION = 'agent34-frozen-skyliner-guzma-GX-switch-four-native-arms-v1';
const PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const OUTPUT = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * One exact selected physical deal, original unchanged sixties, and four
 * retrospective native arms. Opponent Guzma is offered only at its genuine
 * owner root, after the original accepted Team Flare + Pale Moon branch.
 * The existing switch cleanup remains opt-in and reversible.
 *
 * @returns {object} Failure-inclusive native attempts and parity checks.
 */
function run() {
  initializeCards();
  const cards = originals();
  const { Store } = require(path.join(OUTPUT, 'game/store/store'));
  const { Player } = require(path.join(OUTPUT,
    'game/store/state/player'));
  const variants = [
    { name: 'GX-original-control', guzma: false, corrected: false },
    { name: 'GX-source-Guzma-uncorrected', guzma: true, corrected: false },
    { name: 'GX-source-Guzma-switch-corrected', guzma: true, corrected: true },
    { name: 'GX-original-control-repeat', guzma: false, corrected: false }
  ];
  const armResults = [];
  for (const variant of variants) {
    const spec = {
      ...TRIAL,
      id: TRIAL.id + ':' + variant.name,
      targetedTeamFlareNative: true,
      targetedPaleMoonNative: true,
      targetedGuzmaAfterPaleMoonNative: variant.guzma,
      captureOwnerPassSnapshots: true,
      captureOwnerPassSeat: TRIAL.rank3Seat,
      captureOwnerPassTurns: [61]
    };
    const patched = variant.corrected ?
      withPendingEndTurnSwitchCleanup({ Store, Player },
        () => runArm(spec, cards)) :
      { result: runArm(spec, cards),
        removedFromRoot: 0, removedFromSimulatedStores: 0,
        rootEvents: [] };
    armResults.push({
      ...variant,
      native: patched.result,
      cleanup: {
        removedFromRoot: patched.removedFromRoot,
        removedFromSimulatedStores: patched.removedFromSimulatedStores,
        rootEvents: patched.rootEvents
      }
    });
  }
  const [a, b, c, repeat] = armResults;
  const nativeArms = armResults.map(x => x.native);
  const physicalParity = nativeArms.every(arm =>
    arm.fullDealSha256 === EXPECTED.fullDeal &&
    arm.rank3DealSha256 === EXPECTED.sourceDeal);
  const sameOriginalControl = a.native.status === 'native-terminal' &&
    repeat.native.status === 'native-terminal' &&
    a.native.rootLedgerSha256 === repeat.native.rootLedgerSha256;
  const originalRoots = a.native.rootActionLedger ?? [];
  const originalPassIndex = originalRoots.findIndex(row =>
    row.playerSlot === TRIAL.rank3Seat &&
    row.turnBefore === 61 && row.action === 'PassTurnAction');
  const differences = [b, c].map(intervened => {
    const roots = intervened.native.rootActionLedger ?? [];
    const prefix = originalPassIndex >= 0 &&
      JSON.stringify(roots.slice(0, originalPassIndex)) ===
      JSON.stringify(originalRoots.slice(0, originalPassIndex));
    const attempted = roots[originalPassIndex] ?? null;
    const genuineGuzma = prefix && attempted?.action === 'PlayCardAction' &&
      attempted?.card === 'Guzma' &&
      attempted?.playerSlot === TRIAL.rank3Seat &&
      attempted?.turnBefore === 61;
    return {
      variant: intervened.name, frozenPrefix: prefix,
      originalPassIndex, replacementRoot: attempted,
      typedGuzmaRoot: Boolean(genuineGuzma),
      ownerAudit: intervened.native.targetedGuzmaReplyAudit ?? null,
      correction: intervened.cleanup,
      status: intervened.native.status
    };
  });
  return {
    version: VERSION, pinnedEngine: PIN,
    originalRank3Seat: TRIAL.rank3Seat,
    originalRank1Seat: 1 - TRIAL.rank3Seat,
    historicalSeed: TRIAL.seed,
    fullPhysicalDeal: EXPECTED.fullDeal,
    sourcePhysicalDeal: EXPECTED.sourceDeal,
    originalDeckHashes: {
      originalRank3: a.native.originalSource60Hash ?? null,
      originalRank1: a.native.originalReference60Hash ?? null
    },
    matchedActualPhysicalDeal: physicalParity,
    originalControlRepeatedExactly: sameOriginalControl,
    initialGuzmaRootDifference: differences,
    outcomes: armResults.map(row => ({
      variant: row.name, guzma: row.guzma, corrected: row.corrected,
      status: row.native.status, error: row.native.error ?? null,
      winner: row.native.winner ?? null,
      endReason: row.native.endReason ?? null,
      actions: row.native.actions ?? null,
      globalTurns: row.native.globalTurns ?? null,
      nativeTerminal: row.native.nativeTerminal ?? null,
      rootSha256: row.native.rootLedgerSha256 ?? null,
      ownerPassBeforeTarget: row.native.ownerPassFrontierAudit ?? null,
      targetedGuzmaAudit: row.native.targetedGuzmaReplyAudit ?? null,
      targetedPaleMoonAudit: row.native.targetedPaleMoonAudit ?? null,
      targetedTeamFlareAudit: row.native.targetedTeamFlareAudit ?? null,
      correction: row.cleanup,
      sourceDeal: row.native.rank3DealSha256 ?? null,
      fullDeal: row.native.fullDealSha256 ?? null,
      rootActionLedger: row.native.rootActionLedger ?? null
    })),
    nativeOwnerCounterreplyValidated: physicalParity && sameOriginalControl &&
      differences.every(x => x.frozenPrefix && x.typedGuzmaRoot &&
        x.status === 'native-terminal'),
    paperCorrectedOriginalFollowthroughValidated: false,
    competitiveGamesQualified: 0,
    scope: 'originally dealt retrospective fixed seed; forced one Supporter at a frozen owner root; no competent bilateral policy, 25-minute clock or paper-random Night Watch'
  };
}

if (require.main === module) {
  try {
    const result = run();
    process.stdout.write(JSON.stringify(result) + '\n');
    if (!result.nativeOwnerCounterreplyValidated) process.exitCode = 1;
  } catch (error) {
    process.stdout.write(JSON.stringify({
      version: VERSION, status: 'native-source-counterreply-abort',
      error: String(error?.stack ?? error).slice(0, 5000),
      competitiveGamesQualified: 0
    }) + '\n');
    process.exitCode = 1;
  }
}
module.exports = { VERSION, run };
