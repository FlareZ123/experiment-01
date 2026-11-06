'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {gitBlobHash} = require('./agent42-strict-profile-preflight.cjs');
const {preflight:preflightPinnedSource} =
  require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {prereg:historicalRegistration} =
  require('./agent31-crossrank5-11-floatstone-transfer.cjs');
const {runDevelopment} = require('./agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook} =
  require('../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {save} = require('./agent43-guzma-original-source-pair.cjs');

const VERSION = 'agent31-prospective-all-owner-pass-rank5-rank11-v1';
const REG = 'results/aichi-2026/registrations/agent31-prospective-allpass-r5-r11-20261106.json';
const REGISTERED_BLOB = 'a7188776c879b555fb9fccfdc3c916b972324b7e';

/** @returns {object} Prior-result-free exact original-registration preflight. */
function preflight() {
  const root = path.resolve(__dirname, '../..');
  const bytes = fs.readFileSync(path.join(root, REG));
  assert.equal(gitBlobHash(bytes), REGISTERED_BLOB,
    'The 16 independent source seed groups changed after registration');
  const reg = JSON.parse(bytes.toString('utf8'));
  assert.equal(reg.registeredBeforeAnyNativeExecutionForTheseSeeds, true);
  assert.deepEqual(reg.sourceRanks, [5, 11]);
  assert.deepEqual(reg.candidateIds,
    ['champion-reference', 'new-moon-lockbreaker-v1']);
  assert.equal(reg.physicalSeedGroups, 16);
  assert.equal(reg.trials.length, 32);
  assert.equal(reg.attempts, 32);
  assert.equal(reg.noPaperOutcomePromotion, true);
  const currentIds = new Set(), groups = new Map(), freshSeeds = new Set();
  for (const trial of reg.trials) {
    assert.ok([5, 11].includes(trial.rank));
    assert.ok(['A','B'].includes(trial.candidateSlot));
    assert.ok(Number.isSafeInteger(trial.repeat) &&
      trial.repeat >= 0 && trial.repeat <= 3);
    assert.ok(reg.candidateIds.includes(trial.candidateId));
    assert.equal(trial.id, [
      trial.rank, trial.repeat, trial.candidateSlot, trial.candidateId
    ].join(':'));
    assert.ok(!currentIds.has(trial.id));
    currentIds.add(trial.id);
    assert.equal(trial.seed,
      reg.seeds[String(trial.rank)][trial.candidateSlot][trial.repeat]);
    const key = [trial.rank,trial.candidateSlot,trial.repeat].join(':');
    const candidates = groups.get(key) ?? [];
    candidates.push(trial.candidateId);
    groups.set(key,candidates);
    freshSeeds.add(trial.seed);
  }
  assert.equal(groups.size,16);
  assert.equal(freshSeeds.size,16);
  for(const candidates of groups.values())
    assert.deepEqual(candidates.sort(),[...reg.candidateIds].sort());
  const old = historicalRegistration();
  const previousSeeds = new Set(
    Object.values(old.seeds).flatMap(bySlot => Object.values(bySlot).flat()));
  assert.equal([...freshSeeds].filter(seed => previousSeeds.has(seed)).length,0,
    'A historical original physical seed was reused');
  const source = preflightPinnedSource();
  assert.equal(source.registration.nativeEnginePin,source.pin);
  return {registration:reg,pin:source.pin,registeredBlob:REGISTERED_BLOB};
}

/**
 * Summarize all native outcomes with the frozen physical-seed-group as the
 * independence unit. Failed native attempts remain in the denominator.
 *
 * @param {object[]} rows Genuine native original-ranked result rows.
 * @returns {object} Inclusive development-only sample/Pass audit.
 */
function summarize(rows) {
  assert.equal(rows.length,32);
  const byTrial = [], groups = new Map();
  let passes = 0, covered = 0, positiveRoots = 0, errors = 0;
  let abortedKnownPasses = 0;
  for (const row of rows) {
    const trial = row.trial;
    const key = [trial.rank,trial.candidateSlot,trial.repeat].join(':');
    const group = groups.get(key) ?? [];
    group.push(row); groups.set(key,group);
    const witness = row.nativeAllOwnerPassFrontier ?? null;
    const status = row.error ? 'native-error' :
      row.finished ? 'native-engine-terminal' : 'native-action-limit';
    if (row.error) errors++;
    const abortLedger = row.nativeAbortEvidence?.rootActionLedger;
    const abortPasses = Array.isArray(abortLedger) ?
      abortLedger.filter(root => root.action === 'PassTurnAction').length :
      null;
    if (!witness && abortPasses !== null) abortedKnownPasses += abortPasses;
    if (witness) {
      assert.equal(witness.completeNativePassCoverage,true);
      assert.equal(witness.actualNativePassRoots,witness.observedOwnerPassRoots);
      covered += witness.observedOwnerPassRoots;
      passes += witness.actualNativePassRoots;
      positiveRoots += witness.counts.candidate.visibleFundedVmaxPasses;
    }
    byTrial.push({
      id:trial.id,rank:trial.rank,seat:trial.candidateSlot,
      repeat:trial.repeat,seed:trial.seed,candidate:trial.candidateId,
      status,sourceSeat:row.sourceSeat??null,
      fullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
      sourceDeal:row.sourceDealFingerprint??null,
      rootDigest:row.rootActionLedgerSha256??null,
      actualNativePasses:witness?.actualNativePassRoots??null,
      ownerPassReceipts:witness?.observedOwnerPassRoots??null,
      knownAcceptedPassesOnAbort: witness ? null : abortPasses,
      abortPassOwnerHandsAvailable:false,
      candidateHeldStonePasses:witness?.counts?.candidate.heldFloatStone??null,
      candidateNarrowFundedVmaxPasses:
        witness?.counts?.candidate.visibleFundedVmaxPasses??null,
      candidatePositiveRootOrdinals: witness?.receipts
        ?.filter(receipt => receipt.role === 'candidate' &&
          receipt.visibleFundedVmax)
        ?.map(receipt => receipt.actionOrdinal)??null,
      error:row.error??null
    });
  }
  const groupsWithAnyCandidatePositive = new Set(byTrial
    .filter(row=>row.candidateNarrowFundedVmaxPasses>0)
    .map(row=>[row.rank,row.seat,row.repeat].join(':'))).size;
  const matchedSourceDeals = [...groups.values()].filter(group =>
    group.length === 2 && group[0].sourceDealFingerprint &&
    group[0].sourceDealFingerprint ===
      group[1].sourceDealFingerprint).length;
  return {
    registeredPhysicalSeedGroups:16,
    registeredOriginalNativeArms:32,
    returnedOriginalNativeArms:rows.length,
    nativeErrors:errors,
    rowsWithCompletePassEvidence:byTrial.filter(row =>
      row.actualNativePasses!==null).length,
    nativePassRootsInCompleteRows:passes,
    ownerPassReceiptsInCompleteRows:covered,
    knownAcceptedPassRootsOnIncompleteNativeRows:abortedKnownPasses,
    knownAcceptedPassRootsAcrossAllRows:passes+abortedKnownPasses,
    candidateNarrowFundedVmaxPassRootObservations:positiveRoots,
    physicalSeedGroupsWithAnyVisiblePositive:groupsWithAnyCandidatePositive,
    sourceDealMatchedWithinBothContenders:matchedSourceDeals,
    unit:'16 freshly registered physical seed groups, repeated contender arms and Pass roots correlated',
    paperLegalAttackChains:0,competitivePaperQualifiedGames:0,
    byTrial
  };
}

/** @returns {object} Complete prospectively frozen original-store sample. */
function run() {
  const p = preflight();
  const options = {
    ...preflightPinnedSource().registration.frozenCommonPolicy,
    registeredTrials:p.registration.trials,
    registeredFrameName:p.registration.schema,
    bilateralBasicEnergyRecipientFrontier:true,
    actorUnderworldDoorPromptOwner:true,
    actorUnderworldDoorRoot:true,
    actorFundedShadowRiderFloatStoneRoot:false,
    nativeAllOwnerPassFrontier:true
  };
  const old = process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV = 'true';
  const undo = installUnderworldDoorPsychicRecipientHook();
  let native;
  try {
    native = runDevelopment(options);
  } finally {
    undo();
    if (old === undefined) delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV = old;
  }
  const summary = summarize(native.rows);
  return {
    schema:VERSION,
    originalRegistrationPath:REG,
    registeredGitBlob:REGISTERED_BLOB,
    registeredAtUtc:p.registration.registeredUtc,
    enginePin:p.pin,
    frozenOriginalRanks:p.registration.sourceRanks,
    readOnlyAllOwnerPasses:true,
    policyDeltaVersusHistoricalControl:'none; nativeAllOwnerPassFrontier observer-only',
    sampleUnit:'physical original seed group, arms are correlated',
    selectedIssue25PolicyChanged:false,
    competitivelyQualifiedGames:0,
    summary,native
  };
}
if (require.main === module) {
  const result = run();
  if (process.env.AGENT31_FRESH_ALLPASS_OUTPUT)
    save(process.env.AGENT31_FRESH_ALLPASS_OUTPUT,result);
  process.stdout.write('AGENT31_FRESH_ALLPASS_NATIVE ' +
    JSON.stringify({summary:result.summary}) + '\n');
}

module.exports = {VERSION,REG,REGISTERED_BLOB,preflight,summarize,run};
