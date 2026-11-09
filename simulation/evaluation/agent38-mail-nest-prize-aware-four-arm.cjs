'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {randomUUID, createHash} = require('node:crypto');
const {run: runNative} =
  require('./agent43-v8-snaptrap-exact-prompt-blocker.cjs');
const {firstDivergence} =
  require('./agent38-v8-owner-mail-pass-four-arm.cjs');
const {likelyMultiPrizeBasic} =
  require('../twinleaf/agent38-mail-nest-prize-aware-basic-choice.cjs');
const REG = require('../../results/aichi-2026/registrations/agent38-mail-nest-prize-aware-four-arm-20261109.json');

const VERSION = 'agent38-mail-nest-prize-aware-four-arm-v1';
const OUTPUT = path.resolve(__dirname,
  '../../artifacts/agent43-v8-snaptrap-owner-root/agent38-prize-aware-mail-nest.json');
const MECHANICAL = new Set(['PassTurnAction', 'WaitForOpponentAction',
  'WaitPromptAction', 'ResolvePromptAction']);

/**
 * An exact owner action in the native root tape that followed a genuine
 * Mail-selected Nest Ball and was physically confirmed by its Bench receipt.
 * The trial-local tape is an observation only, never consulted by the bot.
 * @param {object} event A Bench movement receipt from native Store
 * @param {object[]} tape Accepted native root tape for one original trial
 * @returns {object}
 */
function nestContinuation(event, tape) {
  const start = tape.findIndex(root =>
    root.seat === event.seat &&
    root.turn === event.turnBefore &&
    root.action === 'PlayCardAction' &&
    root.previouslyMailSelectedTrainerPlayed === true &&
    root.ownerMailAfterPassAction !== true);
  if (start < 0) return {
    playedSelectedTrainerRoot:null, opponentRoot:null, nextOwnerRoot:null,
    fullContinuation:false
  };
  const later = tape.slice(start + 1);
  const opponent = later.find(root => root.seat !== event.seat &&
    root.turn > event.turnBefore && !MECHANICAL.has(root.action)) ?? null;
  const nextOwner = opponent ? later.find(root =>
    root.seat === event.seat && root.turn > opponent.turn &&
    !MECHANICAL.has(root.action)) ?? null : null;
  return {
    playedSelectedTrainerRoot:tape[start].ordinal,
    opponentRoot:opponent?.ordinal ?? null,
    nextOwnerRoot:nextOwner?.ordinal ?? null,
    fullContinuation:Boolean(opponent && nextOwner)
  };
}

/**
 * Compare two settled native Basic-to-Bench events from the same fixed trial.
 * @param {object[]} baselineEvents
 * @param {object[]} treatmentEvents
 * @returns {object[]}
 */
function changedSelections(baselineEvents, treatmentEvents) {
  const events = [];
  const count = Math.min(baselineEvents.length, treatmentEvents.length);
  for (let index = 0; index < count; index++) {
    const before = baselineEvents[index], after = treatmentEvents[index];
    if (before.seat !== after.seat || before.turnBefore !== after.turnBefore)
      continue;
    if (before.selectedPokemonPrinting === after.selectedPokemonPrinting)
      continue;
    events.push({
      seat:after.seat,turn:after.turnBefore,
      oldPrinting:before.selectedPokemonPrinting,
      newPrinting:after.selectedPokemonPrinting,
      oldLikelyMultiPrize:likelyMultiPrizeBasic(before.selectedPokemonPrinting),
      newLikelyMultiPrize:likelyMultiPrizeBasic(after.selectedPokemonPrinting)
    });
  }
  return events;
}

/** @returns {object} All registered native A/B results and explicit censoring. */
function run() {
  assert.equal(REG.schema, VERSION);
  assert.equal(REG.status, 'FROZEN_BEFORE_EXECUTION');
  assert.equal(REG.nativeRootCap, 260);
  assert.equal(REG.originalTrials.length, 4);
  const before = runNative(REG.control);
  const after = runNative(REG.treatment);
  for (const result of [before,after]) {
    assert.deepEqual(result.exactOriginalTrialIds,REG.originalTrials);
    assert.equal(result.preservedNativeRootCap,REG.nativeRootCap);
    assert.ok(result.ownerMailAudit);
    assert.equal(result.ownerMailAudit.unsettledPromptActions,0);
    assert.equal(result.ownerMailAudit.rejectedPromptActions,0);
  }
  const panel = REG.originalTrials.map(id => {
    const b = before.attempts.find(row => row.id === id);
    const a = after.attempts.find(row => row.id === id);
    assert.ok(b && a, 'all four registered attempts are retained');
    assert.equal(b.seed,a.seed);
    assert.equal(b.sourceSeat,a.sourceSeat);
    const baseTape = before.publicRootTape.filter(row => row.trialId===id);
    const treatedTape = after.publicRootTape.filter(row => row.trialId===id);
    const bBench = before.ownerMailAudit.nestFromMailBenchEvents
      .filter(row=>row.trialId===id);
    const aBench = after.ownerMailAudit.nestFromMailBenchEvents
      .filter(row=>row.trialId===id);
    const changes=changedSelections(bBench,aBench);
    return {
      id,seed:a.seed,sourceSeat:a.sourceSeat,
      actionFirstDivergence:firstDivergence(baseTape,treatedTape),
      oldNativeBenches:bBench,newNativeBenches:aBench,
      changes,
      afterNestContinuations:aBench.map(event=>
        nestContinuation(event,treatedTape)),
      control:{status:b.nativeStatus,finished:b.nativeFinished,
        winner:b.nativeWinner,endReason:b.nativeEndReason,
        finalPrizes:b.nativeFinalPrizes,actionCount:b.nativeActionCount,
        failureStage:b.nativeFailureStage},
      treatment:{status:a.nativeStatus,finished:a.nativeFinished,
        winner:a.nativeWinner,endReason:a.nativeEndReason,
        finalPrizes:a.nativeFinalPrizes,actionCount:a.nativeActionCount,
        failureStage:a.nativeFailureStage}
    };
  });
  const changed=panel.flatMap(row=>row.changes.map(change=>({
    id:row.id,...change})));
  const reduced=changed.filter(row=>
    row.oldLikelyMultiPrize && !row.newLikelyMultiPrize);
  return {
    schema:VERSION,registration:REG,gitSha:process.env.GITHUB_SHA??null,
    pinnedOriginalDecksUnchanged:true,control:before,treatment:after,panel,
    summary:{nativeChangedSelections:changed.length,
      changedMultiToSinglePrizeHint:reduced.length,
      baselineNativeNestBenches:panel.reduce((sum,row)=>
        sum+row.oldNativeBenches.length,0),
      treatmentNativeNestBenches:panel.reduce((sum,row)=>
        sum+row.newNativeBenches.length,0),
      postNestContinuationCount:panel.reduce((sum,row)=>
        sum+row.afterNestContinuations.filter(x=>x.fullContinuation).length,0),
      status:changed.length>0?'NATIVE_BASIC_SELECTION_DIFFERENCE':
        'NO_SELECTION_DIFFERENCE_IN_REGISTERED_TRIALS',
      changed},
    competitiveGamesQualified:0,estimatedWinRate:null
  };
}

/** Atomic locked archival receipt, including meaningful negative findings. */
function save(value) {
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const bytes=Buffer.from(JSON.stringify(value,null,2)+'\n');
  const digest=createHash('sha256').update(bytes).digest('hex');
  const fd=fs.openSync(OUTPUT+'.lock','wx');
  const tmp=OUTPUT+'.'+process.pid+'.'+randomUUID()+'.tmp';
  const shaPath=OUTPUT+'.sha256';
  const shaTmp=shaPath+'.'+process.pid+'.'+randomUUID()+'.tmp';
  try{
    fs.writeFileSync(tmp,bytes,{flag:'wx'});
    fs.renameSync(tmp,OUTPUT);
    fs.writeFileSync(shaTmp,digest+'  '+path.basename(OUTPUT)+'\n',
      {flag:'wx'});
    fs.renameSync(shaTmp,shaPath);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(shaTmp))fs.unlinkSync(shaTmp);
    fs.closeSync(fd);
    fs.unlinkSync(OUTPUT+'.lock');
  }
  return OUTPUT;
}

if(require.main===module){
  let report;
  try{report=run();}
  catch(error){
    report={schema:VERSION,status:'NATIVE_RUN_ERROR',
      error:{name:error.name,message:error.message},
      competitiveGamesQualified:0,estimatedWinRate:null};
    process.exitCode=1;
  }
  const output=save(report);
  process.stdout.write(JSON.stringify({
    output,status:report.summary?.status??report.status,
    summary:report.summary??null,
    allArms:report.panel?.map(row=>({
      id:row.id,sourceSeat:row.sourceSeat,
      oldBench:row.oldNativeBenches.map(x=>x.selectedPokemonPrinting),
      newBench:row.newNativeBenches.map(x=>x.selectedPokemonPrinting),
      firstActionDivergence:row.actionFirstDivergence?.index??null,
      changes:row.changes,postNest:row.afterNestContinuations,
      controlEnd:row.control.endReason,treatmentEnd:row.treatment.endReason,
      oldPrizes:row.control.finalPrizes,newPrizes:row.treatment.finalPrizes
    }))??null,
    error:report.error??null
  },null,2)+'\n');
}
module.exports={VERSION,REG,nestContinuation,changedSelections,run,save};
