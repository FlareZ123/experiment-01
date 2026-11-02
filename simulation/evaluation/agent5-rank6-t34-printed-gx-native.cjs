'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const originalRegistration =
  'results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const expectedRegistrationBlob = '8c54d8497f9927b04d501237462f64a42173d33d';
const knownOriginal = {
  fullPhysicalDealFingerprint:
    '4dd4f4b5a5c55fb5c242f66095c0376654825eb56eab7c0b7e5eabc5b3710052',
  sourceDealFingerprint:
    '8af86c9623f3dfcf77ae1187f5d4e0308241a088bd32d25561324597c27f4b8c',
  rootActionLedgerSha256:
    '1a46552af8c7727e0d9380831b5b905519f910fa1df6fce18d7ba51ad044ebe9'
};

/**
 * Original source-deal matched historical replay for the owner-only, native
 * printed-GX policy. Both modes preserve identical fixed original candidate
 * decks; neither is a prospective win-rate experiment.
 * @returns {object} Physical deal, accepted action and settlement evidence.
 */
function run() {
  const mode = process.env.AGENT5_RANK6_T34_GX_ARM;
  assert.ok(['control', 'treatment'].includes(mode),
    'Explicit control or treatment mode required');
  const printedGxEnabled = mode === 'treatment';
  assert.equal(process.env.AGENT25_PRINTED_GX_ROOT_DEV,
    printedGxEnabled ? 'true' : 'false',
    'The native actor-only printed GX hook must match the labeled arm');
  const raw = fs.readFileSync(path.join(root,originalRegistration));
  const blob = createHash('sha1').update('blob ' + raw.length + '\0')
    .update(raw).digest('hex');
  assert.equal(blob,expectedRegistrationBlob,
    'Original published experiment registration was changed');
  const original = JSON.parse(raw.toString('utf8'));
  const planned = require('./agent41-prospective-canonical-scout.cjs')
    .plannedTrials(original);
  const selected = planned.filter(t => t.rank === 6 && t.repeat === 2 &&
    t.candidateSlot === 'B');
  assert.deepEqual(selected.map(x => x.candidateId).sort(),
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.ok(selected.every(x => x.seed === 3622671892));
  const {runDevelopment} = require('./agent41-bilateral-v2-development.cjs');
  const result = runDevelopment({
    ...original.frozenRunOptions,
    registeredTrials:selected,
    registeredFrameName:originalRegistration
  });
  assert.equal(result.attempted,2);
  assert.equal(result.rows.length,2);
  const games = result.rows.map(row => {
    const root = row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    const printedCandidate = row.trial?.candidateId ===
      'new-moon-lockbreaker-v1';
    const firstPrintedGx = row.rootActionLedger?.find(a =>
      a.playerSlot === row.candidateSeat && a.action === 'AttackAction' &&
      typeof a.attack === 'string' && a.attack.endsWith('-GX'));
    const firstPrintedGxSettlement = row.candidateAttackSettlement?.attacks
      ?.find(a => a.attackName === 'Pale Moon-GX') ?? null;
    const visible34 = root?.nativeRootAcceptances?.filter(x =>
      x.globalTurn >= 32 && x.globalTurn <= 40) ?? [];
    return {
      trial:row.trial,
      sourceSeat:row.sourceSeat,
      candidateSeat:row.candidateSeat,
      actualStarterSeat:row.actualStarterSeat,
      sourceDealFingerprint:row.sourceDealFingerprint,
      fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
      rootActionLedgerSha256:row.rootActionLedgerSha256,
      expectedOriginalSourceMatch:
        !printedCandidate || row.sourceDealFingerprint ===
          knownOriginal.sourceDealFingerprint,
      expectedOriginalFullDealMatch:
        !printedCandidate || row.fullPhysicalDealFingerprint ===
          knownOriginal.fullPhysicalDealFingerprint,
      expectedOriginalRootMatch:
        mode !== 'control' || !printedCandidate ||
          row.rootActionLedgerSha256 === knownOriginal.rootActionLedgerSha256,
      firstPrintedGx: firstPrintedGx ? {
        turn: firstPrintedGx.turnBefore,
        seat: firstPrintedGx.playerSlot,
        name:firstPrintedGx.attack,
        ordinal:firstPrintedGx.actionOrdinal
      } : null,
      firstPaleMoonSettlement: firstPrintedGxSettlement ? {
        turn:firstPrintedGxSettlement.turnBefore,
        settledPromptChain:firstPrintedGxSettlement.settledPromptChain,
        settlementCrossesClockReset:
          firstPrintedGxSettlement.settlementCrossesClockReset,
        publicBoardBefore:firstPrintedGxSettlement.publicBoardBefore,
        publicBoardAfter:firstPrintedGxSettlement.publicBoardAfter,
        prizesBefore:firstPrintedGxSettlement.prizesBefore,
        prizesAfter:firstPrintedGxSettlement.prizesAfter,
        nextSourceRoot:firstPrintedGxSettlement.nextSourceRoot,
        sourceTurnActions:firstPrintedGxSettlement.sourceTurnActions
      } : null,
      nativeOwnerT32ToT40:visible34,
      actorDecisionKinds:root?.typedIntentCounts ?? null,
      rootActionCount:row.rootActionCount,
      rootActionLedger:row.rootActionLedger,
      nativeFinished:row.finished === true,
      nativeEndReason:row.endReason,
      nativeWinner:row.winner,
      nativeFinalPrizes:row.finalPrizes,
      recordedClockResets:row.suddenDeathClockResets,
      originalSourceDeckUnchanged: true,
      competitiveQualified: false,
      status:row.status ?? 'observed',
      error:row.error ?? null
    };
  });
  return {
    schema:'agent5-original-rank6-t34-printed-gx-native-v1',
    provenance:'retrospective selected same-deal mechanism contrast',
    mode,printedGxEnabled,
    originalRegistration,
    originalRegistrationBlob:blob,
    enginePin:result.enginePin,
    sourcePairSameDeal:result.sourcePairs?.[0]?.sameSourcePhysicalDeal ?? null,
    nativeExceptions:result.errors?.length ?? 0,
    expectedOriginal:knownOriginal,
    games,competitiveQualifiedGames:0
  };
}

module.exports={run,knownOriginal,originalRegistration};
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
