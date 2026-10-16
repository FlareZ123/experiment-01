'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const {runMatch, initializeCards} = require('./headless.cjs');
const {withStoreDispatchTranscript} = require('./store-dispatch-transcript.cjs');
const {withSourceZoneCheckpoint} = require('./source-zone-checkpoint.cjs');
const {auditAuthenticFork} = require('./source-fork-gate.cjs');
const {loadDefaultCampaign} = require('../../scripts/aichi-comparison-campaign.cjs');

/** @param {unknown} value @returns {string} */
function hash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * The root headless loop dispatches exactly one action per iteration, after
 * the two AddPlayerAction calls. A separate speculative Store must not enter
 * this ledger. This proves capture scope only, not input replay fidelity.
 * @param {object} report Live-only recorder output.
 * @param {object} game Completed source game.
 * @returns {object} Detached diagnostic.
 */
function checkLiveLineage(report, game) {
  assert.equal(report.captureScope, 'first-AddPlayerAction-Store-instance');
  assert.equal(report.actionTrace.length, game.actions + 2);
  assert.deepEqual(report.actionTrace.slice(0, 2).map(e => e.action),
    ['AddPlayerAction', 'AddPlayerAction']);
  const counts = {};
  for (const event of report.actionTrace.slice(2)) {
    counts[event.action] = (counts[event.action] || 0) + 1;
  }
  assert.deepEqual(counts, game.actionCounts,
    'Live Store actions must match the independent game-loop histogram');
  assert.deepEqual(report.actionTrace.map(e => e.step),
    Array.from({length: report.dispatched}, (_, i) => i));
  return {
    liveDispatches:report.dispatched,
    excludedOtherStores:report.ignoredOtherStoreDispatches,
    captureScope:report.captureScope,
    parametersCaptured:report.parametersCaptured,
    replayEligibleDigest:report.traceSha256,
    diagnosticDigest:report.diagnosticTraceSha256,
    captureFailures:report.captureErrors,
    firstFourActions:report.actionTrace.slice(0, 4).map(e => e.action)
  };
}

/** @param {object[]} control @param {object[]} branch */
function firstDifference(control, branch) {
  for (let i = 0; i < Math.max(control.length, branch.length); i += 1) {
    if (JSON.stringify(control[i]) !== JSON.stringify(branch[i])) {
      return {index:i, original:control[i] ?? null, alternate:branch[i] ?? null};
    }
  }
  return null;
}

/**
 * Group actual recorder failures by their replay-blocking input shape.
 * Counts represent distinct Store dispatches, not games. This is a
 * diagnostic priority queue and never upgrades the replay-qualification flag.
 *
 * @param {string[]} failures Source-Store recorder capture errors.
 * @returns {Array<{category:string,path:string,count:number,firstSteps:number[],examples:string[]}>}
 */
function summarizeCaptureGaps(failures) {
  const groups = new Map();
  for (const failure of failures) {
    const stepMatch = /^step (\d+): (.*)$/.exec(failure);
    const step = stepMatch ? Number(stepMatch[1]) : null;
    const cause = stepMatch ? stepMatch[2] : failure;
    const missing = /^Nonportable undefined at (\S+)$/.exec(cause);
    const prototype = /^Nested parameter at (\S+) has non-JSON prototype (.+)$/.exec(cause);
    const category = missing ? 'undefined-value' :
      prototype ? 'non-json-prototype' : 'other';
    const path = missing ? missing[1] :
      prototype ? prototype[1] : cause;
    const normalizedPath = path.replace(/\[\d+\]/g, '[*]');
    const key = category + ':' + normalizedPath;
    const group = groups.get(key) || {
      category, path:normalizedPath, count:0, firstSteps:[], examples:[]
    };
    group.count += 1;
    if (step !== null && group.firstSteps.length < 5) group.firstSteps.push(step);
    if (!group.examples.includes(cause) && group.examples.length < 3) {
      group.examples.push(cause);
    }
    groups.set(key, group);
  }
  return [...groups.values()].sort((a,b) =>
    b.count - a.count || (a.category+a.path).localeCompare(b.category+b.path));
}

/**
 * One genuine source deal with a reproducible turn-27 fork. This records the
 * full *live-only* dispatch stream while explicitly retaining the recorder's
 * incomplete-argument limitations. No staged cards are injected.
 */
function main() {
  const {resolveManifestFile} = require('./resolve-field.cjs');
  const field = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const byRank = new Map(field.decks.map(deck => [deck.rank, deck]));
  const candidate = byRank.get(1);
  const opponent = byRank.get(10);
  assert.ok(candidate?.playableUnderEngine && opponent?.playableUnderEngine);
  const schedule = loadDefaultCampaign('decorrelated-slots-v3');
  const trials = schedule.trials.filter(t => t.phase === 'pilot' &&
    t.rank === 10 && t.candidateId === 'champion-reference' && t.repeat === 0 &&
    t.candidateEngineSlot === 'B');
  assert.equal(trials.length, 1, 'Expected one immutable physical-B pilot trial');
  const trial = trials[0];
  assert.equal(trial.seed, 4246551499, 'Source schedule has changed');
  const seat = 1;
  const common = {
    deckA:opponent.cardIds, deckB:candidate.cardIds,
    seed:trial.seed, maxActions:350, label:trial.trialId,
    strictPromptValidation:true, forestSealSearchCorrection:true,
    supporterDecisionCorrection:true, doubleDragonRecovery:true,
    isolatePolicyRandomness:true, captureDecisionTrace:true,
    captureCopycatTurnStartSeat:seat,
    postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const branchRequest = {...common, mimikyuApexTimelessPolicy:true,
    mimikyuApexTimelessPolicySeat:seat, mimikyuTurn27SetupSeat:seat};
  initializeCards();
  const {Store} = require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));

  const tracedSource = request => {
    const captured = withStoreDispatchTranscript(Store,
      () => withSourceZoneCheckpoint(Store, () => runMatch(request),
        {turn:27,candidateSeat:seat}),{liveStoreOnly:true});
    return {
      ...captured,
      sourceZoneCheckpoint:captured.result.checkpoint,
      sourceZoneDigest:captured.result.digest,
      result:captured.result.result
    };
  };
  const uninstrumented = runMatch(common);
  const control = tracedSource(common);
  assert.deepEqual(control.result, uninstrumented,
    'Recording altered the unchanged source-game observable return');
  const branch = tracedSource(branchRequest);
  const repeat = tracedSource(common);
  assert.deepEqual(control.sourceZoneCheckpoint, branch.sourceZoneCheckpoint,
    'Hidden hands/decks/Prizes or turn flags diverged before the declared source turn-27 fork');
  assert.deepEqual(control.sourceZoneCheckpoint, repeat.sourceZoneCheckpoint,
    'Original control hidden-zone checkpoint changed after alternate policy');
  assert.equal(control.sourceZoneDigest, branch.sourceZoneDigest);
  assert.equal(control.sourceZoneDigest, repeat.sourceZoneDigest);
  assert.deepEqual(repeat.result, control.result,
    'Original control changed after alternate-policy invocation');
  assert.deepEqual(repeat.actionTrace, control.actionTrace,
    'Original live dispatch trace changed after alternate-policy invocation');
  assert.equal(control.result.firstTurnSlot, seat,
    'Candidate B was expected to start in the frozen source game');
  assert.equal(branch.result.firstTurnSlot, seat);
  const expectedDeckHashes = [hash(common.deckA), hash(common.deckB)];
  assert.deepEqual(control.result.deckHashes, expectedDeckHashes);
  assert.deepEqual(branch.result.deckHashes, expectedDeckHashes);
  const forkAudit = auditAuthenticFork(control.actionTrace, branch.actionTrace,
    {forkTurn:27,opponentSlot:0});
  const controlLineage = checkLiveLineage(control, control.result);
  const branchLineage = checkLiveLineage(branch, branch.result);
  const controlCaptureGapSummary = summarizeCaptureGaps(controlLineage.captureFailures);
  const alternateCaptureGapSummary = summarizeCaptureGaps(branchLineage.captureFailures);
  checkLiveLineage(repeat, repeat.result);
  const turn27 = game => game.copycatTurnStartEvidence
    .find(snapshot => snapshot.turn === 27);
  const originalState = turn27(control.result);
  const alternateState = turn27(branch.result);
  assert.ok(originalState && alternateState,
    'Authentic post-Apex source decision must be observed in both arms');
  assert.deepEqual(originalState, alternateState,
    'Alternate policy changed the state before the declared turn-27 fork');

  const selectedTimeless = branch.actionTrace.find(event =>
    event.before.turn === 27 && event.attackChoice?.selection?.attackName === 'Timeless-GX');
  assert.ok(selectedTimeless,
    'Copycat must resolve the actual, source-identified Timeless-GX choice');
  assert.equal(selectedTimeless.attackChoice.selection.printing, 'Dialga-GX UPR');
  const copycat = branch.actionTrace.find(event =>
    event.before.turn === 27 && event.action === 'AttackAction' &&
    event.parameters?.name === 'Copycat');
  assert.ok(copycat, 'Actual Copycat attack must be announced in the source branch');
  const extraTurn = branch.actionTrace.find(event =>
    event.before.turn === 28 && event.before.phase === 2);
  assert.ok(extraTurn && extraTurn.before.activePlayer === seat,
    'Copycat/Timeless-GX must give this player the next actual full turn');
  const opponentResponse = branch.actionTrace.find(event =>
    event.before.turn >= 29 && event.action === 'AttackAction' &&
    event.parameters?.name === 'Apex Dragon');
  assert.ok(opponentResponse,
    'Counterline must preserve a consequential actual Regidrago response');
  const divergence = firstDifference(control.actionTrace, branch.actionTrace);
  assert.ok(divergence && divergence.original.before.turn === 27 &&
    divergence.alternate.before.turn === 27,
    'The source-ranked policy difference must first occur at the declared turn 27');
  const counterline = {
    declaredSourceDecisionTurn:27,
    firstLiveDivergenceStep:divergence.index,
    copiedAttack:copycat.parameters.name,
    attackChoice:selectedTimeless.attackChoice,
    extraTurn:{turn:extraTurn.before.turn,actingSeat:extraTurn.before.activePlayer},
    opponentResponse:{
      turn:opponentResponse.before.turn,
      attackerAction:opponentResponse.action,
      attackName:opponentResponse.parameters.name
    },
    controlWinner:control.result.winner,
    alternateWinner:branch.result.winner,
    controlFinalPrizes:control.result.prizesRemaining,
    alternateFinalPrizes:branch.result.prizesRemaining
  };
  return {
    schema:'rank10-source-branch-live-dispatch-v1',
    label:'diagnostic-only, not a competitive win-rate sample',
    qualifiedForCompetitiveInference:false,
    sourceReplayMechanicsVerified:false,
    decisiveLimitations:[
      'Action parameters and prompt selections may remain nonportable',
      'Single pre-fork source-zone checkpoint captured; full Store/reducer replay absent',
      'No causal opponent-response competence or paper-rule qualification',
      'Both physical seats and independently sampled seeds not covered'
    ],
    engine:control.result.engine,
    trial:{id:trial.trialId,seed:trial.seed,candidatePhysicalSeat:seat,
      candidateActuallyFirst:true,planDigest:schedule.planDigest,
      printHashes:expectedDeckHashes},
    identicalUninstrumentedControl:true,
    identicalControlAfterBranch:true,
    forkAudit,
    captureGapSummary:{control:controlCaptureGapSummary,
      alternate:alternateCaptureGapSummary},
    sharedAuthenticTurn27Start:originalState,
    sharedHiddenZoneTurn27Checkpoint:control.sourceZoneCheckpoint,
    sharedHiddenZoneTurn27Digest:control.sourceZoneDigest,
    recordedCounterline:counterline,
    firstMeaningfulDifference:firstDifference(
      control.result.decisionTrace || [], branch.result.decisionTrace || []),
    firstLiveDispatchDifference:firstDifference(
      control.actionTrace, branch.actionTrace),
    control:{result:control.result,recording:controlLineage,
      fullLiveDispatchTrace:control.actionTrace},
    alternate:{result:branch.result,recording:branchLineage,
      fullLiveDispatchTrace:branch.actionTrace}
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(main(), null, 2) + '\n');
module.exports = {hash, checkLiveLineage, firstDifference, summarizeCaptureGaps, main};
