'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {runDevelopment} = require('../agent41-bilateral-v2-development.cjs');
const {registration: originalRegistration, gameCapture} =
  require('./agent44-first-original-rank5-newmoon-case.cjs');
const sourceFunding = require('./agent8-source-mew-funding-v6.cjs');

const ROOT = path.resolve(__dirname, '../../..');
const REG = 'results/aichi-2026/registrations/' +
  'agent42-rank5-independent-gengar-lillie-8context-20261109.json';
const OUTPUT = path.join(ROOT,
  'artifacts/agent42-rank5-fresh-gengar-lillie-aba.json');
const VERSION = 'agent42-rank5-fresh4seeds-bothseats-lillie-gengar-ABA-v1';
const hash = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

function preflight() {
  const reg = JSON.parse(fs.readFileSync(path.join(ROOT, REG), 'utf8'));
  assert.equal(reg.status, 'FROZEN_BEFORE_FIRST_NATIVE_ATTEMPT');
  assert.equal(reg.observedTrialsBeforeRegistration, 0);
  assert.deepEqual(reg.seeds,
    [344561911,1120451664,1794711690,2841596889]);
  assert.equal(reg.registeredTrials.length, 8);
  assert.equal(reg.expectedNativeAttempts, 24);
  assert.equal(new Set(reg.registeredTrials.map(t => t.id)).size, 8);
  assert.deepEqual(reg.modes.map(m => m.id), [
    'A-lillie-control','B-lillie-gengar-public6','A-lillie-repeat'
  ]);
  assert.deepEqual(reg.modes.map(m => m.actorBilateralLillieAfterPass),
    [true,true,true]);
  assert.deepEqual(reg.modes.map(m => m.bilateralGengarHorrorHouseTempo),
    [false,true,false]);
  assert.equal(reg.modes[1].bilateralGengarHorrorHouseMinOpponentHandCount, 6);
  for (const t of reg.registeredTrials) {
    assert.equal(t.rank, 5);
    assert.equal(t.candidateId, 'new-moon-lockbreaker-v1');
    assert.ok(['A','B'].includes(t.candidateSlot));
    assert.ok(reg.seeds.includes(t.seed));
    assert.equal(t.id,
      [t.rank,t.repeat,t.candidateSlot,t.candidateId].join(':'));
  }
  const old = originalRegistration().reg;
  assert.equal(reg.sourceOriginalPrintedSixtySha256,
    old.sourceOriginalPrinted60Sha256);
  const engine = execFileSync('git', ['rev-parse','HEAD'], {
    cwd: path.join(ROOT, 'vendor/twinleaf'), encoding: 'utf8'
  }).trim();
  assert.equal(engine, reg.pinnedTwinleaf);
  return {reg, engine};
}

/**
 * Same exact physical trial arrays under all treatment arms. No seed
 * selection based on outcome, no candidate/source-specific action code.
 * Owner-only native policy applies symmetrically to actual physical seats.
 *
 * @param {object} reg Precommitted trial and mode schedule.
 * @param {object} mode Precommitted actor policy.
 * @returns {object} Native result, physical tapes and concise trial rows.
 */
function executeArm(reg, mode, extraPolicy={}) {
  const captures = new Map();
  let activeTrial = null;
  const frozen = require('../agent41-frozen-bilateral-development-v2.json');
  assert.equal(frozen.policyOptions.actorOnlyComposition, true);
  const rows = [];
  let attempts = 0;
  // Engine single-candidate mode admits one original natural game per call.
  // Keep the preregistered eight contexts unchanged, executing sequentially.
  for (const trial of reg.registeredTrials) {
    const development = runDevelopment({
    ...frozen.policyOptions, ...sourceFunding.options(true),
    sourceIndependentCommonPolicy: true,
    bilateralPerfectionRoot: true,
    actorVipAfterPass: true,
    actorMewMaxMiracleOverSelfCopy: true,
    sourceScopedQuickBallRoot: true,
    actorMewQuickBallPaymentGuard: true,
    actorMewUltraBallPaymentGuard: true,
    actorMewUltraBallRoot: true,
    actorMewUltraBallSearch: true,
    actorOnlySingleSearch: true,
    actorMewGenesectQuickBallSearch: true,
    nativeAcceptedTargets: true,
    nativeSetupCoinChoiceReceipt: true,
    nativeSetupCompensationAudit: true,
    nativePublicMulliganRevealsAudit: true,
    physicalZoneGate: true,
    losslessNativeRootJoin: true,
    paperSupporterQuota: true,
    paperSameTargetAttachEnergy: true,
    isolatePolicyRandomness: true,
    isolatePhysicalShuffleRandomnessAfterSetup: true,
    specialRedCardPaperPreselection: true,
    specialRedCardPaperCorrection: true,
    specialRedCardPaperSpeculativeShuffle: true,
    allowExtendedRegisteredNativeRootCap: true,
    allowSingleCandidateArm: true,
    allowAdditionalOriginalSourceRanks: true,
    actorBilateralLillieAfterPass: true,
    bilateralGengarHorrorHouseTempo:
      mode.bilateralGengarHorrorHouseTempo,
    bilateralGengarHorrorHouseMinOpponentHandCount:
      mode.bilateralGengarHorrorHouseMinOpponentHandCount ?? 0,
    ...extraPolicy,
    registeredTrials: [trial],
    registeredFrameName: VERSION + ':' + mode.id,
    nativeRootActionLimit: reg.nativeRootCap,
    onRootStoreCreated(_store, trialId) {
      assert.ok(!captures.has(trialId));
      activeTrial = trialId;
      captures.set(trialId, gameCapture());
    },
    onRootActionDispatched(...args) {
      assert.ok(captures.has(activeTrial));
      captures.get(activeTrial).onRootActionDispatched(...args);
    }
    });
    assert.equal(development.attempted, 1);
    assert.equal(development.rows.length, 1);
    assert.equal(development.rows[0].trial.id, trial.id);
    attempts += development.attempted;
    rows.push(...development.rows);
  }
  assert.equal(attempts, reg.registeredTrials.length);
  assert.deepEqual(rows.map(r => r.trial.id),
    reg.registeredTrials.map(t => t.id));

  const records = rows.map(row => {
    const trial = row.trial;
    const candidateSeat = trial.candidateSlot === 'A' ? 0 : 1;
    const sourceSeat = 1 - candidateSeat;
    const roots = row.rootActionLedger ??
      row.nativeAbortEvidence?.rootActionLedger ?? [];
    const own = roots.filter(x => x.playerSlot === candidateSeat);
    const source = roots.filter(x => x.playerSlot === sourceSeat);
    const attacks = arr => arr.filter(x => x.action === 'AttackAction')
      .map(x => ({root:x.actionOrdinal,turn:x.turnBefore,attack:x.attack}));
    const capture = captures.get(trial.id)?.evidence() ?? null;
    return {
      id: trial.id,seed:trial.seed,candidateSeat,sourceSeat,
      sourceFingerprint: row.sourceDealFingerprint ?? null,
      fullFingerprint: row.fullPhysicalDealFingerprint ?? null,
      actualFirstSeat: row.actualStarterSeat ?? null,
      status: row.status ?? null,finished: row.finished === true,
      winner: row.finished === true ? row.winner ?? null : null,
      error: row.error ?? null,
      remainingPrizes: row.finalPrizes ?? null,
      integrity: row.physicalZoneQualification?.physicalIntegrityQualified ?? null,
      sourceAttacks: attacks(source), candidateAttacks: attacks(own),
      candidateRetreats: own.filter(x => x.action === 'RetreatAction')
        .map(x => ({root:x.actionOrdinal,turn:x.turnBefore})),
      candidateLillie: own.filter(x => x.action === 'PlayCardAction' &&
        x.card === "Lillie's Determination")
        .map(x => ({root:x.actionOrdinal,turn:x.turnBefore})),
      candidateEnergyAttachments: own.filter(x =>
        x.action === 'PlayCardAction' &&
        (x.card === 'Psychic Energy' ||
         x.card === 'Telepathic Psychic Energy'))
        .map(x => ({root:x.actionOrdinal,turn:x.turnBefore,card:x.card})),
      nativeLillieAudit: row.ownerBilateralLillieAfterPassAudit ?? null,
      vipAfterPassAudit: row.actorOnlyDecisionCoverage?.
        detailedComponentAudits?.ownerVipAfterPass ?? null,
      fogAudit: row.actorOnlyDecisionCoverage?.
        detailedComponentAudits?.fog ?? null,
      handDiscardAudit: row.actorOnlyDecisionCoverage?.
        detailedComponentAudits?.handDiscard ?? null,
      acceptedRoots: roots.length,
      rootLedgerSha256: hash(roots),
      physicalTapeSha256: capture?.allRootPhysicalZonesSha256 ?? null,
      physicalReceiptCount: capture?.postAcceptedRootCount ?? null,
      rootActions: roots,
      postStorePhysicalZoneTape: capture
    };
  });
  return {id:mode.id,mode,records,
    summary: {
      attempts,
      terminals: records.filter(x => x.finished).length,
      engineErrors: records.filter(x => x.error !== null).length,
      candidateAttacks: records.reduce((n,r) => n+r.candidateAttacks.length,0),
      candidateHorrorHouse: records.reduce((n,r) => n+
        r.candidateAttacks.filter(a => a.attack === 'Horror House-GX').length,0),
      candidatePoltergeist: records.reduce((n,r) => n+
        r.candidateAttacks.filter(a => a.attack === 'Poltergeist').length,0),
      candidateWins: records.filter(x =>
        x.finished && x.winner === x.candidateSeat).length
    }
  };
}

/** Deterministic pairwise joins, with censored/error games retained. */
function analyze(arms) {
  const [control,treatment,repeat] = arms;
  const pairs = control.records.map((a,i) => {
    const b = treatment.records[i],c = repeat.records[i];
    assert.equal(a.id,b.id);assert.equal(a.id,c.id);
    const sameFull = a.fullFingerprint !== null &&
      a.fullFingerprint === b.fullFingerprint &&
      a.fullFingerprint === c.fullFingerprint;
    const sameSource = a.sourceFingerprint !== null &&
      a.sourceFingerprint === b.sourceFingerprint &&
      a.sourceFingerprint === c.sourceFingerprint;
    const repeatRootIdentical =
      a.rootLedgerSha256 === c.rootLedgerSha256;
    const repeatPhysicalIdentical =
      a.physicalTapeSha256 !== null &&
      a.physicalTapeSha256 === c.physicalTapeSha256;
    const completedPair = a.finished && b.finished &&
      a.error === null && b.error === null && sameFull && sameSource;
    return {id:a.id,seed:a.seed,candidateSeat:a.candidateSeat,
      sameFull,sameSource,repeatRootIdentical,
      repeatPhysicalIdentical,completedPair,
      control:{finished:a.finished,winner:a.winner,
        candidateAttacks:a.candidateAttacks,sourceAttacks:a.sourceAttacks,
        error:a.error,prizes:a.remainingPrizes},
      treatment:{finished:b.finished,winner:b.winner,
        candidateAttacks:b.candidateAttacks,sourceAttacks:b.sourceAttacks,
        error:b.error,prizes:b.remainingPrizes},
      treatmentChangedWinner:completedPair&&
        a.winner !== b.winner,
      firstActionDifference: a.rootActions.findIndex((root,k) =>
        JSON.stringify(root)!==JSON.stringify(b.rootActions[k])),
      firstPhysicalDifference: (() => {
        const left = a.postStorePhysicalZoneTape?.postAcceptedRoots ?? [];
        const right = b.postStorePhysicalZoneTape?.postAcceptedRoots ?? [];
        for(let k=0;k<Math.min(left.length,right.length);k++){
          if(left[k].zoneSha256!==right[k].zoneSha256)return k;
        }
        return left.length===right.length?null:Math.min(left.length,right.length);
      })()
    };
  });
  return {matchedFull:pairs.filter(p => p.sameFull).length,
    matchedSource:pairs.filter(p => p.sameSource).length,
    identicalRepeatRoots:pairs.filter(p => p.repeatRootIdentical).length,
    identicalRepeatPhysical:pairs.filter(p => p.repeatPhysicalIdentical).length,
    completedPairs:pairs.filter(p => p.completedPair).length,
    newCandidateNativeWinnerReversals:pairs.filter(p =>
      p.treatmentChangedWinner &&
      p.treatment.winner === p.candidateSeat).length,
    candidateAttackCountImprovements:pairs.filter(p =>
      p.treatment.candidateAttacks.length > p.control.candidateAttacks.length).length,
    pairs};
}

function save(value) {
  fs.mkdirSync(path.dirname(OUTPUT), {recursive: true});
  const lock = OUTPUT + '.lock';
  const fd = fs.openSync(lock, 'wx', 0o600);
  const tmp = OUTPUT + '.tmp.' + process.pid;
  try {
    fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n',{flag:'wx'});
    const sync = fs.openSync(tmp, 'r');
    try {fs.fsyncSync(sync);} finally {fs.closeSync(sync);}
    fs.renameSync(tmp, OUTPUT);
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

function main() {
  const {reg,engine} = preflight();
  const arms = reg.modes.map(mode => executeArm(reg,mode));
  const comparison = analyze(arms);
  const result = {schema: VERSION,registration: reg,
    pinnedTwinleaf: engine,remainingSourceListsMissing: [23,25,28],
    originalSourceAndCandidate60Unchanged: true,
    policyDecisionSymmetricBothSeats: true,
    qualifiedPaperGames: 0,comparison,
    arms};
  save(result);
  console.log('AGENT42_RANK5_FRESH_GENGAR_LILLIE',JSON.stringify({
    comparison:{...comparison,pairs:comparison.pairs.map(p => ({
      id:p.id,seed:p.seed,candidateSeat:p.candidateSeat,
      sameFull:p.sameFull,sameSource:p.sameSource,
      repeatRootIdentical:p.repeatRootIdentical,
      repeatPhysicalIdentical:p.repeatPhysicalIdentical,
      completedPair:p.completedPair,
      controlWinner:p.control.winner,treatmentWinner:p.treatment.winner,
      controlCandidateAttacks:p.control.candidateAttacks.length,
      treatmentCandidateAttacks:p.treatment.candidateAttacks.length,
      firstActionDifference:p.firstActionDifference,
      firstPhysicalDifference:p.firstPhysicalDifference
    }))},
    arms:arms.map(x => ({id:x.id,...x.summary})),
    paperQualifiedGames:0
  }));
  return result;
}

if (require.main === module) {
  if (process.argv.includes('--preflight')) {
    const {reg,engine} = preflight();
    console.log('AGENT42_FRESH_PREFLIGHT',JSON.stringify({
      caseId:reg.caseId,engine,seeds:reg.seeds,
      trials:reg.registeredTrials.length
    }));
  } else main();
}

module.exports = {REG,OUTPUT,VERSION,preflight,executeArm,analyze,main};
