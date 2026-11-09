'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {run: runNative} =
  require('./agent43-v8-snaptrap-exact-prompt-blocker.cjs');
const {REGISTRATION, firstDivergence} =
  require('./agent38-v8-owner-mail-pass-four-arm.cjs');

const VERSION = 'agent1-held-handiwork-v8-native-registered-four-arm-v1';
const OUTPUT = path.resolve(__dirname,
  '../../artifacts/agent43-v8-snaptrap-owner-root/agent1-held-handiwork-four-arm.json');
const MECHANICAL = new Set(['PassTurnAction','WaitForOpponentAction',
  'WaitPromptAction','ResolvePromptAction']);

/**
 * Require a real strategic opponent response and a later source-own-turn
 * decision, excluding same-turn defensive prompt acknowledgements.
 * @param {object} ownerRoot Accepted owner action from native Store trace.
 * @param {object[]} tape Native Store roots of the same registered game.
 * @returns {{opponent:object|null,source:object|null,passed:boolean}}
 */
function continuation(ownerRoot,tape) {
  const at=tape.findIndex(row =>
    row.ordinal===ownerRoot.ordinal&&row.ownerHeldHandiworkAction===true);
  assert.ok(at>=0,'the tagged held-Handiwork root must exist');
  const after=tape.slice(at+1);
  const opponent=after.find(row =>
    row.seat!==ownerRoot.seat&&!MECHANICAL.has(row.action))??null;
  const source=opponent?after.find(row =>
    row.seat===ownerRoot.seat&&row.turn>opponent.turn&&
    !MECHANICAL.has(row.action))??null:null;
  return {
    opponent:opponent?{ordinal:opponent.ordinal,turn:opponent.turn,
      action:opponent.action}:null,
    source:source?{ordinal:source.ordinal,turn:source.turn,
      action:source.action}:null,
    passed:Boolean(opponent&&source)
  };
}

/**
 * Atomic locked output; includes a SHA256 sidecar.
 * @param {object} result Complete registered trial ledger.
 */
function save(result) {
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const data=Buffer.from(JSON.stringify(result,null,2)+'\n');
  const digest=crypto.createHash('sha256').update(data).digest('hex');
  const fd=fs.openSync(OUTPUT+'.lock','wx');
  const tmp=OUTPUT+'.'+process.pid+'.'+crypto.randomUUID()+'.tmp';
  const sha=OUTPUT+'.sha256';
  const shaTmp=sha+'.'+process.pid+'.'+crypto.randomUUID()+'.tmp';
  try {
    fs.writeFileSync(tmp,data,{flag:'wx'});
    fs.renameSync(tmp,OUTPUT);
    fs.writeFileSync(shaTmp,digest+'  '+path.basename(OUTPUT)+'\n',
      {flag:'wx'});
    fs.renameSync(shaTmp,sha);
  } finally {
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(shaTmp))fs.unlinkSync(shaTmp);
    fs.closeSync(fd);
    fs.unlinkSync(OUTPUT+'.lock');
  }
  return OUTPUT;
}

/** @returns {object} Same original physical four deals, one opt-in action. */
function run() {
  assert.equal(REGISTRATION.trials.length,4);
  assert.deepEqual(new Set(REGISTRATION.trials.map(r=>r.seed)),
    new Set([2404595552,948758444]));
  assert.deepEqual(new Set(REGISTRATION.trials.map(r=>r.sourceSeat)),
    new Set([0,1]));
  const common={ownerAbilityConfirm:true,ownerMailAfterPass:true,
    captureRootTape:true};
  const baseline=runNative(common);
  const treatment=runNative({...common,followHeldHandiwork:true});
  const trialIds=REGISTRATION.trials.map(row=>row.id);
  assert.deepEqual(baseline.exactOriginalTrialIds,trialIds);
  assert.deepEqual(treatment.exactOriginalTrialIds,trialIds);
  assert.equal(baseline.preservedNativeRootCap,260);
  assert.equal(treatment.preservedNativeRootCap,260);
  const audit=treatment.ownerMailAudit;
  assert.ok(audit);
  assert.deepEqual(audit.registeredTrialIds,trialIds);
  assert.equal(audit.opponentPrivateZonesRead,false);
  assert.equal(audit.handiworkFromHandAccepted,
    audit.handiworkFromHandNativeDeckChanges.length);
  assert.equal(audit.handiworkFromHandRejected,0,
    'native Store must not reject an eligible held-Handiwork choice');
  const arms=REGISTRATION.trials.map(trial=>{
    const before=baseline.attempts.find(row=>row.id===trial.id);
    const after=treatment.attempts.find(row=>row.id===trial.id);
    assert.ok(before&&after);
    assert.equal(before.seed,trial.seed);
    assert.equal(after.seed,trial.seed);
    const firstTape=baseline.publicRootTape.filter(row=>
      row.trialId===trial.id);
    const secondTape=treatment.publicRootTape.filter(row=>
      row.trialId===trial.id);
    const accepted=secondTape.filter(row=>
      row.ownerHeldHandiworkAction===true);
    const receipts=audit.handiworkFromHandNativeDeckChanges.filter(row=>
      row.trialId===trial.id);
    const settled=audit.handiworkFromHandDeferredSettlements.filter(row=>
      row.trialId===trial.id);
    assert.equal(accepted.length,receipts.length,
      'one paid Store action per tagged held-Handiwork root');
    for(const root of accepted){
      assert.ok(receipts.some(row=>
        row.ownerSeat===root.seat&&row.turnBefore===root.turn),
        'owner-hand selection and Store ledger must join at same turn');
    }
    return {
      id:trial.id,seed:trial.seed,sourceSeat:trial.sourceSeat,
      candidateSeat:trial.candidateSeat,
      firstNativeDivergence:firstDivergence(firstTape,secondTape),
      control:{status:before.nativeStatus,finished:before.nativeFinished,
        winner:before.nativeWinner,endReason:before.nativeEndReason,
        finalPrizes:before.nativeFinalPrizes,roots:before.nativeActionCount,
        error:before.nativeFailureDiagnostic??null},
      treatment:{status:after.nativeStatus,finished:after.nativeFinished,
        winner:after.nativeWinner,endReason:after.nativeEndReason,
        finalPrizes:after.nativeFinalPrizes,roots:after.nativeActionCount,
        error:after.nativeFailureDiagnostic??null},
      acceptedHeldSupporterRoots:accepted.map(row=>({
        ordinal:row.ordinal,seat:row.seat,turn:row.turn,
        continuation:continuation(row,secondTape)
      })),
      nativePaymentAndPublicEffect:receipts,
      deferredCoinEffectsSettled:settled,
      fullNativeReturn:accepted.length===settled.length
    };
  });
  const accepted=arms.reduce((n,row)=>n+row.acceptedHeldSupporterRoots.length,0);
  const resolved=arms.reduce((n,row)=>n+row.deferredCoinEffectsSettled.length,0);
  const mill=arms.reduce((n,row)=>n+row.deferredCoinEffectsSettled
    .reduce((m,item)=>m+item.deckCardsMoved,0),0);
  return {
    schema:VERSION,gitHead:process.env.GITHUB_SHA??null,
    fixedOriginal60:REGISTRATION.cardsUnchanged,
    registeredTrialIds:trialIds,rootCap:260,
    baselineOptions:common,
    treatmentOptions:{...common,followHeldHandiwork:true},
    acceptedSupporterRoots:accepted,deferredEffectsSettled:resolved,
    opponentDeckCardsMilledAfterCoins:mill,
    selectedOwnerActionContinuations:arms.reduce((n,row)=>
      n+row.acceptedHeldSupporterRoots
        .filter(x=>x.continuation.passed).length,0),
    nativeOffers:audit.handiworkFromHandOffers,
    nativeRejections:audit.handiworkFromHandRejected,
    arms,
    status:accepted>0?'NATIVE_HELD_SUPPORTER_SETTLED_DEVELOPMENTAL':
      'NO_HELD_SUPPORTER_ACTION_ENCOUNTERED',
    qualifiedCompetitiveGames:0,selectedFinalFixedSixty:false,
    winRate:null
  };
}

if(require.main===module){
  let result;
  try {result=run();}
  catch(error){
    result={schema:VERSION,status:'NATIVE_OR_CONTRACT_ERROR',
      failure:{name:error.name,message:error.message,
        stack:String(error.stack).slice(0,1200)},
      qualifiedCompetitiveGames:0,winRate:null};
    process.exitCode=1;
  }
  const file=save(result);
  process.stdout.write(JSON.stringify({file,status:result.status,
    accepted:result.acceptedSupporterRoots??0,
    settled:result.deferredEffectsSettled??0,
    publicDeckCardsMilled:result.opponentDeckCardsMilledAfterCoins??null,
    sourceContinuations:result.selectedOwnerActionContinuations??0,
    arms:result.arms?.map(row=>({id:row.id,
      n:row.acceptedHeldSupporterRoots.length,
      control:row.control.endReason,treatment:row.treatment.endReason,
      controlPrizes:row.control.finalPrizes,
      treatmentPrizes:row.treatment.finalPrizes}))??null,
    failure:result.failure??null},null,2)+'\n');
}

module.exports={VERSION,REGISTRATION,continuation,run,save};
