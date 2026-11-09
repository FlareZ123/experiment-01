'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {run: runNative} =
  require('./agent43-v8-snaptrap-exact-prompt-blocker.cjs');
const {REGISTRATION, firstDivergence} =
  require('./agent38-v8-owner-mail-pass-four-arm.cjs');
const {physicalDealsMatch} =
  require('./agent1-v8-held-handiwork-four-arm.cjs');

const VERSION = 'agent1-native-owner-arven-nest-bench-four-pair-v1';
const OUTPUT = path.resolve(__dirname,
  '../../artifacts/agent43-v8-snaptrap-owner-root/agent1-arven-nest-native-four-arm.json');
const MECHANICAL = new Set(['PassTurnAction','WaitForOpponentAction',
  'WaitPromptAction','ResolvePromptAction']);

/**
 * Strict next-own-turn continuation after a paid native owner Item effect.
 * @param {object} sourceAction A Store root from the original acting owner.
 * @param {object[]} roots All native Store roots of the exact registered game.
 * @returns {{opponent:object|null,source:object|null,passed:boolean}}
 */
function continuation(sourceAction, roots) {
  const at = roots.findIndex(x => x.ordinal === sourceAction.ordinal &&
    x.seat === sourceAction.seat && x.turn === sourceAction.turn);
  assert.ok(at >= 0);
  const following = roots.slice(at + 1);
  const opponent = following.find(x => x.seat !== sourceAction.seat &&
    !MECHANICAL.has(x.action)) ?? null;
  const source = opponent ? following.find(x =>
    x.seat === sourceAction.seat && x.turn > opponent.turn &&
    !MECHANICAL.has(x.action)) ?? null : null;
  const compact = x => x ? {ordinal:x.ordinal,turn:x.turn,
    action:x.action} : null;
  return {opponent:compact(opponent), source:compact(source),
    passed:Boolean(opponent && source)};
}

/** @param {object} result Full original trial ledger. */
function save(result) {
  fs.mkdirSync(path.dirname(OUTPUT), {recursive:true});
  const bytes = Buffer.from(JSON.stringify(result, null, 2) + '\n');
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  const fd = fs.openSync(OUTPUT + '.lock', 'wx');
  const tmp = OUTPUT + '.' + process.pid + '.' + crypto.randomUUID() + '.tmp';
  const sha = OUTPUT + '.sha256';
  const shaTmp = sha + '.' + process.pid + '.' + crypto.randomUUID() + '.tmp';
  try {
    fs.writeFileSync(tmp, bytes, {flag:'wx'});
    fs.renameSync(tmp, OUTPUT);
    fs.writeFileSync(shaTmp, digest + '  ' + path.basename(OUTPUT) + '\n',
      {flag:'wx'});
    fs.renameSync(shaTmp, sha);
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    if (fs.existsSync(shaTmp)) fs.unlinkSync(shaTmp);
    fs.closeSync(fd);
    fs.unlinkSync(OUTPUT + '.lock');
  }
  return OUTPUT;
}

/** @returns {object} Registered four original physical deals, same paid Arven. */
function run() {
  assert.equal(REGISTRATION.trials.length, 4);
  assert.deepEqual(new Set(REGISTRATION.trials.map(t=>t.seed)),
    new Set([2404595552,948758444]));
  assert.deepEqual(new Set(REGISTRATION.trials.map(t=>t.sourceSeat)),
    new Set([0,1]));
  const common = {ownerAbilityConfirm:true, ownerMailAfterPass:true,
    captureRootTape:true, followHeldArven:true};
  const control = runNative(common);
  const treatment = runNative({...common, followArvenNestBall:true});
  const ids = REGISTRATION.trials.map(t=>t.id);
  for (const run of [control,treatment]) {
    assert.deepEqual(run.exactOriginalTrialIds,ids);
    assert.equal(run.preservedNativeRootCap,260);
    assert.equal(run.ownerMailAudit?.opponentPrivateZonesRead,false);
    assert.equal(run.ownerMailAudit?.arvenFromHandRejected,0);
  }
  assert.equal(control.experimentalFollowArvenNestBall,false);
  assert.equal(treatment.experimentalFollowArvenNestBall,true);
  const audit = treatment.ownerMailAudit;
  assert.equal(audit.nestFromArvenRejected,0);
  assert.equal(audit.nestFromArvenAccepted,
    audit.nestFromArvenBenchSettled,
    'Every accepted Nest Ball must physically move a Basic to Bench');
  assert.equal(audit.nestFromArvenBenchSettled,
    audit.nestFromArvenBenchEvents.length);
  const panel = REGISTRATION.trials.map(trial => {
    const before = control.attempts.find(t=>t.id===trial.id);
    const after = treatment.attempts.find(t=>t.id===trial.id);
    assert.ok(before && after);
    assert.equal(before.seed,trial.seed);
    assert.equal(after.seed,trial.seed);
    const initial = control.publicRootTape.filter(t=>t.trialId===trial.id);
    const changed = treatment.publicRootTape.filter(t=>t.trialId===trial.id);
    const physicalArvenSearches = audit.arvenFromHandSearchEvents.filter(e=>
      e.trialId===trial.id && e.physicalOwnerDeckToHand===true);
    const basicBenchMoves = audit.nestFromArvenBenchEvents.filter(e=>
      e.trialId===trial.id && e.physicalBasicMovedDeckToBench===true);
    const itemPlays = audit.nestFromArvenBenchEvents.filter(e=>
      e.trialId===trial.id);
    assert.equal(basicBenchMoves.length,itemPlays.length);
    return {
      id:trial.id,seed:trial.seed,sourceSeat:trial.sourceSeat,
      candidateSeat:trial.candidateSeat,
      physicalDealMatched:physicalDealsMatch(before,after),
      sourceDealSha256:{control:before.sourceDealFingerprint,
        treatment:after.sourceDealFingerprint},
      fullPhysicalDealSha256:{control:before.fullPhysicalDealFingerprint,
        treatment:after.fullPhysicalDealFingerprint},
      firstNativeDivergence:firstDivergence(initial,changed),
      control:{status:before.nativeStatus,finished:before.nativeFinished,
        endReason:before.nativeEndReason,prizes:before.nativeFinalPrizes,
        roots:before.nativeActionCount,error:before.nativeFailureDiagnostic??null},
      treatment:{status:after.nativeStatus,finished:after.nativeFinished,
        endReason:after.nativeEndReason,prizes:after.nativeFinalPrizes,
        roots:after.nativeActionCount,error:after.nativeFailureDiagnostic??null},
      physicalArvenItemToolSearches:physicalArvenSearches,
      nativeArvenNestBasicBenchMoves:basicBenchMoves,
      nextOwnTurnActions:basicBenchMoves.map(event=>{
        const actual=changed.find(row=>row.seat===event.seat &&
          row.turn===event.turnBefore &&
          row.action==='PlayCardAction' &&
          row.card==='Nest Ball SVI');
        return actual?continuation(actual,changed):null;
      })
    };
  });
  const physicallyMatched = panel.filter(x=>x.physicalDealMatched).length;
  const benches = panel.reduce((n,x)=>
    n+x.nativeArvenNestBasicBenchMoves.length,0);
  return {
    schema:VERSION,registration:
      'results/methodology/registrations/agent1-v8-arven-nest-from-physical-search-20261109.md',
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    head:process.env.GITHUB_SHA??null,
    registeredTrialIds:ids,unchangedOriginalSixties:REGISTRATION.cardsUnchanged,
    controlOptions:common,
    treatmentOptions:{...common,followArvenNestBall:true},
    physicalDealPairsMatched:physicallyMatched,
    fullPhysicalPanelValid:physicallyMatched===ids.length,
    nativeArvenSearchesToPhysicalHand:audit.arvenFromHandSearchEvents
      .filter(x=>x.physicalOwnerDeckToHand===true).length,
    nativeArvenNestAccepted:audit.nestFromArvenAccepted,
    nativeArvenNestBenchSettled:benches,
    nativeArvenNestRejected:audit.nestFromArvenRejected,
    nonmechanicalContinuations:panel.reduce((n,x)=>
      n+x.nextOwnTurnActions.filter(y=>y?.passed===true).length,0),
    panel,
    status:physicallyMatched!==ids.length?
      'INVALID_OR_MISSING_PHYSICAL_DEAL_PARITY':
      benches>0?'NATIVE_ARVEN_NEST_BENCH_CHAIN_COMPLETE_DEVELOPMENTAL':
      'NO_ARVEN_NEST_BASIC_CHAIN_ENCOUNTERED',
    qualifiedPaperGames:0,winRate:null,selectedFixedSixty:null
  };
}

if (require.main===module) {
  let result;
  try {result=run();}
  catch (error) {
    result={schema:VERSION,status:'NATIVE_OR_CONTRACT_ERROR',
      failure:{name:error.name,message:error.message,
        stack:String(error.stack).slice(0,1200)},
      qualifiedPaperGames:0,winRate:null};
    process.exitCode=1;
  }
  const file=save(result);
  process.stdout.write(JSON.stringify({
    file,status:result.status,
    physicalDealPairsMatched:result.physicalDealPairsMatched??0,
    arvenSearches:result.nativeArvenSearchesToPhysicalHand??0,
    nestAccepted:result.nativeArvenNestAccepted??0,
    nestBenchMoved:result.nativeArvenNestBenchSettled??0,
    continuations:result.nonmechanicalContinuations??0,
    arms:result.panel?.map(t=>({id:t.id,
      firstNativeDivergence:t.firstNativeDivergence,
      matched:t.physicalDealMatched,
      nestBenchMoves:t.nativeArvenNestBasicBenchMoves,
      before:t.control.endReason,after:t.treatment.endReason,
      beforePrizes:t.control.prizes,afterPrizes:t.treatment.prizes}))??null,
    failure:result.failure??null
  },null,2)+'\n');
  if(result.fullPhysicalPanelValid===false)process.exitCode=1;
}

module.exports={VERSION,REGISTRATION,continuation,run,save};
