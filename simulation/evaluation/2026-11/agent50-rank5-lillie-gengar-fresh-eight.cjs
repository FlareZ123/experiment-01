'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {arm, firstDifference, firstPhysicalDivergence} =
  require('./agent20-rank5-gengar-tempo-aba.cjs');

const ROOT = path.resolve(__dirname, '../../..');
const REG_PATH =
  'results/aichi-2026/registrations/agent50-rank5-lillie-gengar-fresh-eight-20261109.json';
const OUTPUT = path.join(ROOT, 'artifacts/agent50-rank5-lillie-gengar-fresh-eight.json');
const PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Accept precisely the independently seeded, preregistered original rank-5
 * test groups, including both candidate physical seats.
 *
 * @param {object} reg Parsed frozen registration.
 * @returns {object[]} Eight immutable trial definitions.
 */
function registered(reg) {
  assert.equal(reg.schema,
    'agent50-rank5-gengar-lillie-prospective-eight-deal-pairs-v1');
  assert.equal(reg.status, 'FROZEN_BEFORE_EXPERIMENT_CODE_OR_NATIVE_EXECUTION');
  assert.equal(reg.enginePinnedCommit, PIN);
  assert.equal(reg.nativeRootCap, 320);
  assert.equal(reg.registeredTrials.length, 8);
  const seen = new Set();
  let seatsA = 0;
  let seatsB = 0;
  for (const [i, trial] of reg.registeredTrials.entries()) {
    assert.equal(trial.rank, 5);
    assert.equal(trial.repeat, 50601 + i);
    assert.equal(trial.candidateId, 'new-moon-lockbreaker-v1');
    assert.ok(['A', 'B'].includes(trial.candidateSlot));
    assert.ok(Number.isSafeInteger(trial.seed));
    assert.ok(trial.seed >= 0 && trial.seed <= 0xffffffff);
    assert.equal(trial.id,
      [5, trial.repeat, trial.candidateSlot, trial.candidateId].join(':'));
    assert.ok(!seen.has(trial.seed), 'All source draws must use fresh unique seeds');
    seen.add(trial.seed);
    seatsA += Number(trial.candidateSlot === 'A');
    seatsB += Number(trial.candidateSlot === 'B');
  }
  assert.equal(seatsA, 4);
  assert.equal(seatsB, 4);
  return reg.registeredTrials.map(trial => ({...trial}));
}

/** Candidate-origin winner and causal attack receipts from an actual native game. */
function summarize(record, trial) {
  if (record.executionError) {
    return {trialId: trial.id, phase: record.phase, status: 'execution-error',
      error: record.executionError, nativeWinner: null, candidateWon: null,
      sourceAttacks: [], candidateAttacks: [], rootCount: 0};
  }
  const candidateSeat = trial.candidateSlot === 'A' ? 0 : 1;
  const sourceSeat = 1 - candidateSeat;
  const roots = record.roots;
  const attacks = seat => roots.filter(r =>
    r.playerSlot === seat && r.action === 'AttackAction')
    .map(r => ({root: r.actionOrdinal, turn: r.turnBefore, attack: r.attack}));
  const ownerSupporters = roots.filter(r =>
    r.playerSlot === candidateSeat && r.action === 'PlayCardAction' &&
    r.card === "Lillie's Determination").map(r => ({
      root: r.actionOrdinal, turn: r.turnBefore
    }));
  const complete = record.nativeFinished === true && !record.nativeError;
  const status = record.nativeError ? 'engine-error' :
    complete ? 'native-terminal' : 'root-censored';
  return {
    trialId: trial.id, phase: record.phase, candidateSeat, sourceSeat,
    status, nativeWinner: complete ? record.nativeWinner : null,
    candidateWon: complete ? record.nativeWinner === candidateSeat : null,
    rootCount: roots.length,
    nativeError: record.nativeError ?? null,
    finalPrizes: record.remainingPrizes ?? null,
    physicalIntegrity: record.physicalIntegrity ?? null,
    firstAcceptedLillie: ownerSupporters[0] ?? null,
    candidateLillieSupporters: ownerSupporters,
    sourceAttacks: attacks(sourceSeat), candidateAttacks: attacks(candidateSeat),
    sourcePhysicalFingerprint: record.sourceFingerprint ?? null,
    fullPhysicalFingerprint: record.fullFingerprint ?? null,
    actualAcceptedRootLedgerSha256: record.rootLedgerSha256
  };
}

/**
 * Compute an exact censor-aware difference in native candidate wins.
 * Unknown outcomes contribute [0,1]; only truly physically matched pairs
 * enter the interval. They remain unqualified developmental observations.
 *
 * @param {object[]} pairs Pair records.
 * @returns {object} Native win difference envelope and population counts.
 */
function analyzePairs(pairs) {
  let lower = 0;
  let upper = 0;
  let matched = 0;
  let knownBoth = 0;
  let controlWins = 0;
  let treatmentWins = 0;
  let reversalsControlToTreatment = 0;
  let reversalsTreatmentToControl = 0;
  for (const p of pairs) {
    if (!p.sameInitialPhysicalDeal) continue;
    matched++;
    const c = p.control.candidateWon, t = p.treatment.candidateWon;
    lower += (t === true ? 1 : 0) - (c === false ? 0 : 1);
    upper += (t === false ? 0 : 1) - (c === true ? 1 : 0);
    if (c !== null && t !== null) {
      knownBoth++;
      controlWins += Number(c);
      treatmentWins += Number(t);
      reversalsControlToTreatment += Number(!c && t);
      reversalsTreatmentToControl += Number(c && !t);
    }
  }
  return {
    preregisteredPairs: pairs.length, matchedInitialPhysicalPairs: matched,
    unmatchedInitialPhysicalPairs: pairs.length - matched,
    fullyTerminalMatchedPairs: knownBoth,
    jointlyNativeTerminalControlCandidateWins: controlWins,
    jointlyNativeTerminalTreatmentCandidateWins: treatmentWins,
    completedWinnerReversalsControlToTreatment: reversalsControlToTreatment,
    completedWinnerReversalsTreatmentToControl: reversalsTreatmentToControl,
    sharpCandidateWinDifferenceEnvelopeOnMatchedPairs: [lower, upper],
    allPairsPhysicallyMatched: matched === pairs.length,
    zeroPaperQualifiedGames: true
  };
}

/** Write cumulative results under exclusive lock, fsync and atomic rename. */
function save(record) {
  fs.mkdirSync(path.dirname(OUTPUT), {recursive: true});
  const lock = OUTPUT + '.lock';
  const fd = fs.openSync(lock, 'wx', 0o600);
  const temp = OUTPUT + '.tmp.' + process.pid;
  try {
    fs.writeFileSync(temp, JSON.stringify(record, null, 2) + '\n', {flag: 'wx'});
    const writeFd = fs.openSync(temp, 'r');
    try { fs.fsyncSync(writeFd); } finally { fs.closeSync(writeFd); }
    fs.renameSync(temp, OUTPUT);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

/**
 * Execute both frozen policies on every originally registered physical deal.
 * No trial is deleted because of a bad outcome, cap, or error.
 */
function run() {
  const raw = fs.readFileSync(path.join(ROOT, REG_PATH), 'utf8');
  const reg = JSON.parse(raw);
  const trials = registered(reg);
  const output = {
    schema: 'agent50-eight-fresh-physical-deal-lillie-gengar-holdout-v1',
    registrationPath: REG_PATH,
    registrationSha256: createHash('sha256').update(raw).digest('hex'),
    originalSourcePrintedSixtyUnchanged: true,
    newMoonPrintedSixtyUnchanged: true,
    commonPrintedSourceFundingPolicy: true,
    pairedPolicyDifference: 'Gengar/Skyliner/public-hand-six added to both-seat owner Lillie',
    pinnedTwinleafRevision: PIN,
    executingResearchGitCommit: process.env.GITHUB_SHA ?? null,
    posthocKnownReleaseSeedExcluded: true,
    paperQualifiedGames: 0,
    attempts: [],
    pairs: [],
    comparison: null
  };
  for (const trial of trials) {
    const cases = [
      {phase: 'Lillie-only', gengar: false, handCount: 0},
      {phase: 'Lillie-plus-Gengar', gengar: true, handCount: 6}
    ];
    const attempts = [];
    for (const choice of cases) {
      const single = {
        caseId: reg.caseId + ':' + trial.id,
        rootCap: reg.nativeRootCap,
        registeredTrials: [trial]
      };
      let result;
      try {
        result = arm(choice.phase, choice.gengar, single, {
          ownerLillieAfterPass: true,
          minOpponentHandCount: choice.handCount
        });
      } catch (error) {
        result = {phase: choice.phase, executionError: String(error.stack ?? error)};
      }
      const summary = summarize(result, trial);
      attempts.push({trial, phase: choice.phase, summary, native: result});
      output.attempts.push({trialId: trial.id, phase: choice.phase, summary});
      save(output);
      console.log('AGENT50_FRESH_NATIVE_ATTEMPT', JSON.stringify(summary));
    }
    const [control, treatment] = attempts;
    const c = control.summary, t = treatment.summary;
    const physicalMatch =
      c.fullPhysicalFingerprint !== null &&
      c.sourcePhysicalFingerprint !== null &&
      c.fullPhysicalFingerprint === t.fullPhysicalFingerprint &&
      c.sourcePhysicalFingerprint === t.sourcePhysicalFingerprint;
    const pair = {
      trial, control: c, treatment: t,
      sameInitialPhysicalDeal: physicalMatch,
      firstAcceptedActionDivergence: physicalMatch &&
        !control.native.executionError && !treatment.native.executionError ?
          firstDifference(control.native, treatment.native) : null,
      firstPostStorePhysicalDivergence: physicalMatch &&
        !control.native.executionError && !treatment.native.executionError ?
          firstPhysicalDivergence(control.native, treatment.native) : null,
      native: attempts.map(a => ({phase: a.phase, raw: a.native}))
    };
    output.pairs.push(pair);
    output.comparison = analyzePairs(output.pairs);
    save(output);
    console.log('AGENT50_FRESH_NATIVE_PAIR', JSON.stringify({
      trialId: trial.id, sameInitialPhysicalDeal: physicalMatch,
      control: c.status, treatment: t.status,
      controlCandidateWon: c.candidateWon, treatmentCandidateWon: t.candidateWon,
      envelope: output.comparison.sharpCandidateWinDifferenceEnvelopeOnMatchedPairs
    }));
  }
  assert.equal(output.pairs.length, 8);
  output.comparison = analyzePairs(output.pairs);
  output.completeRegisteredExecution = output.attempts.length === 16;
  output.fullResultSha256 = hash(output.pairs.map(p => ({
    id: p.trial.id, source: p.control.sourcePhysicalFingerprint,
    control: p.control.actualAcceptedRootLedgerSha256,
    treatment: p.treatment.actualAcceptedRootLedgerSha256
  })));
  save(output);
  console.log('AGENT50_FRESH_EIGHT_HOLDOUT', JSON.stringify({
    registeredTrials: output.attempts.length,
    comparison: output.comparison,
    fullResultSha256: output.fullResultSha256
  }));
  assert.ok(output.comparison.allPairsPhysicallyMatched,
    'Only matching physical opening deals permit paired causal inference');
  assert.ok(output.attempts.every(a => !a.summary.nativeError &&
    a.summary.status !== 'execution-error'), 'Native errors require a separate report');
  return output;
}
if (require.main === module) run();
module.exports = {REG_PATH, registered, summarize, analyzePairs, run};
