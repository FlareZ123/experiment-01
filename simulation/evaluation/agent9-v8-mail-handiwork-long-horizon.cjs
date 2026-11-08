'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const headless = require('../twinleaf/headless.cjs');
const {run: runNative} =
  require('./agent43-v8-snaptrap-exact-prompt-blocker.cjs');

const VERSION = 'agent9-rank3-mail-handiwork-long-horizon-native-v1';
const TARGET = '3:213:A:champion-reference';
const REGISTRATION = require('../../results/aichi-2026/registrations/agent9-rank3-mail-handiwork-long-horizon-20261108.json');
const OUTPUT = path.resolve(__dirname,
  '../../artifacts/agent43-v8-snaptrap-owner-root/agent9-rank3-handiwork-600-root.json');

/**
 * Retrospectively extend only one registered original source/seat/deck frame
 * at the native headless boundary. Do not modify the original source
 * registration, all other arms, card implementations, or the opponent bot.
 * @template T
 * @param {()=>T} fn
 * @param {{runMatch:Function}} core
 * @param {object[]} audit
 * @returns {T}
 */
function withSingleArmHorizon(fn,core,audit) {
  assert.equal(typeof fn,'function');
  assert.equal(typeof core?.runMatch,'function');
  assert.ok(Array.isArray(audit));
  assert.equal(REGISTRATION.originalFrozenArm,TARGET);
  const old=core.runMatch;
  function extended(request) {
    if(typeof request?.label!=='string'||!request.label.endsWith(TARGET))
      return old(request);
    assert.equal(request.maxActions,REGISTRATION.frozenCap,
      'Only an original frozen 260-root request may be extended');
    const next={...request,maxActions:REGISTRATION.extendedNativeCap};
    const row={label:request.label,
      declaredOriginalCap:request.maxActions,
      physicalNativeCap:next.maxActions};
    audit.push(row);
    const result=old(next);
    row.actualActions=result.actionCount??null;
    row.nativeEndReason=result.endReason??null;
    row.nativeFinished=result.finished??null;
    row.nativeWinner=result.finished===true?result.winner??null:null;
    return result;
  }
  core.runMatch=extended;
  try {return fn();}
  finally {
    assert.strictEqual(core.runMatch,extended);
    core.runMatch=old;
  }
}

/** @param {object} data @returns {string} Persist one locked, atomic receipt. */
function save(data) {
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const buf=Buffer.from(JSON.stringify(data,null,2)+'\n');
  const sha=crypto.createHash('sha256').update(buf).digest('hex');
  const lock=fs.openSync(OUTPUT+'.lock','wx');
  const temp=OUTPUT+'.'+process.pid+'.'+crypto.randomUUID()+'.tmp';
  const sum=OUTPUT+'.sha256';
  const sumTemp=sum+'.'+process.pid+'.'+crypto.randomUUID()+'.tmp';
  try{
    fs.writeFileSync(temp,buf,{flag:'wx'});
    fs.renameSync(temp,OUTPUT);
    fs.writeFileSync(sumTemp,sha+'  '+path.basename(OUTPUT)+'\n',{flag:'wx'});
    fs.renameSync(sumTemp,sum);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    if(fs.existsSync(sumTemp))fs.unlinkSync(sumTemp);
    fs.closeSync(lock);
    fs.unlinkSync(OUTPUT+'.lock');
  }
  return OUTPUT;
}

/** @param {object} attempt @param {object[]} tape @returns {object} */
function summarize(attempt,tape) {
  return {
    id:attempt.id,
    nativeStatus:attempt.nativeStatus,
    finished:attempt.nativeFinished,
    endReason:attempt.nativeEndReason,
    winner:attempt.nativeWinner,
    finalPrizes:attempt.nativeFinalPrizes,
    turns:attempt.nativeTurnCount,
    rootCount:attempt.nativeActionCount,
    failure:attempt.nativeFailureStage,
    actorRootMix:attempt.nativeRootActionMix,
    finalPublicBoard:attempt.nativeFinalPublicBoard,
    lastRoots:tape.slice(-18).map(r=>({
      ordinal:r.ordinal,seat:r.seat,turn:r.turn,
      action:r.action,promptId:r.promptId??null
    }))
  };
}

/** @returns {object} Development-only, already-observed exact seed experiment. */
function run() {
  assert.equal(REGISTRATION.extendedNativeCap,600);
  assert.equal(REGISTRATION.originalSeed,948758444);
  const overrides=[];
  const common={ownerAbilityConfirm:true,ownerMailAfterPass:true,
    captureRootTape:true};
  const {baseline,treatment}=withSingleArmHorizon(()=>({
    baseline:runNative(common),
    treatment:runNative({...common,followMailHandiwork:true})
  }),headless,overrides);
  assert.equal(overrides.length,2,'Must extend exactly control and treatment');
  assert.ok(overrides.every(r=>r.physicalNativeCap===600));
  const b=baseline.attempts.find(x=>x.id===TARGET);
  const t=treatment.attempts.find(x=>x.id===TARGET);
  assert.ok(b&&t);
  assert.equal(b.seed,REGISTRATION.originalSeed);
  assert.equal(t.seed,REGISTRATION.originalSeed);
  assert.equal(b.sourceSeat,REGISTRATION.originalSourceSeat);
  assert.equal(t.sourceSeat,REGISTRATION.originalSourceSeat);
  const bTape=baseline.publicRootTape.filter(x=>x.trialId===TARGET);
  const tTape=treatment.publicRootTape.filter(x=>x.trialId===TARGET);
  const actualHandiwork=treatment.ownerMailAudit.handiworkFromMailNativeDeckChanges
    .filter(x=>x.trialId===TARGET);
  const deferred=treatment.ownerMailAudit.handiworkDeferredSettlements
    .filter(x=>x.trialId===TARGET);
  assert.equal(actualHandiwork.length,1,
    'The original physical Handiwork action must remain accepted');
  assert.equal(deferred.length,1,
    'The original physical two-coin sequence must settle');
  assert.equal(deferred[0].deckCardsMoved,2,
    'The same source-seed original Handiwork mill must remain two cards');
  const status=(b.nativeStatus==='engine-error'||t.nativeStatus==='engine-error')?
    'NATIVE_ERROR':'DEVELOPMENTAL_LONG_HORIZON_COMPLETED';
  return {
    schema:VERSION,
    exactOriginalTrialId:TARGET,
    originalSeed:REGISTRATION.originalSeed,
    registeredFixedOriginalCap:260,
    separatelyRegisteredPhysicalCap:600,
    capOverrideAudit:overrides,
    control:summarize(b,bTape),
    treatment:summarize(t,tTape),
    acceptedHandiwork:actualHandiwork,
    settledHandiwork:deferred,
    matchOutcomeChanged:
      b.nativeFinished!==t.nativeFinished||
      b.nativeWinner!==t.nativeWinner||
      b.nativeEndReason!==t.nativeEndReason,
    qualification:{status,completeCompetentGames:0,
      winRate:null,prospective:false,sourceHistoricalField:29,
      reason:'Single retrospectively selected authentic physical source seed; native default policy not competitively certified; cap changed explicitly'}
  };
}

if(require.main===module){
  let r;
  try{r=run();}
  catch(error){
    process.exitCode=1;
    r={schema:VERSION,qualification:{status:'NATIVE_ERROR',
      completeCompetentGames:0,winRate:null},
      error:{name:error.name,message:error.message,
        stack:String(error.stack).slice(0,900)}};
  }
  const artifact=save(r);
  if(r.qualification.status==='NATIVE_ERROR')process.exitCode=1;
  process.stdout.write(JSON.stringify({schema:r.schema,artifact,
    status:r.qualification.status,
    original:r.control&&{finished:r.control.finished,
      endReason:r.control.endReason,turns:r.control.turns,
      actionCount:r.control.rootCount,
      finalPrizes:r.control.finalPrizes,winner:r.control.winner},
    treated:r.treatment&&{finished:r.treatment.finished,
      endReason:r.treatment.endReason,turns:r.treatment.turns,
      actionCount:r.treatment.rootCount,
      finalPrizes:r.treatment.finalPrizes,winner:r.treatment.winner},
    nativeMill:r.settledHandiwork,
    error:r.error??null},null,2)+'\n');
}
module.exports={VERSION,TARGET,withSingleArmHorizon,run,save};
