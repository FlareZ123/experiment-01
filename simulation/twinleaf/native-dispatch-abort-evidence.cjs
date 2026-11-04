'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const VERSION = 'headless-native-abort-public-v1';

/** @param {unknown} value @returns {any} */
function detached(value) {
  return value == null ? null : JSON.parse(JSON.stringify(value));
}

/**
 * Build a post-choice, pre-dispatch public failure witness. The caller supplies
 * detached snapshots taken BEFORE Store.dispatch, because the pinned reducer
 * can mutate state even when it throws. This observer is never given to the bot.
 *
 * The legacy root ledger omits physical targets. A matching ledger digest must
 * never be interpreted as matching Energy or retreat destinations.
 *
 * @param {{actionOrdinal:number, actionName:string, turnBefore:number,
 *   failureStage?:'store-dispatch'|'strict-prompt-validation'|'bot-decoder',
 *   phaseBefore:number, actingSeat:number, attackName?:string|null,
 *   attackingPokemon?:string|null, errorMessage:string,
 *   pendingPrompt?:string|null, redactedMessageDigest?:string|null,
 *   sourceDeal?:{seat:number,digestSha256:string}|null,
 *   fullDeal?:{schema:string,digestSha256:string}|null,
 *   initialTurnOrder?:{firstTurnSlot:0|1|null,firstTurnPlayerId:number|null,
 *     firstTurnPlayerName:string|null,firstDrawLogName:string|null,
 *     verifiedByDrawLog:boolean}|null,
 *   rootActionLedger?:object[]|null, preDispatchPublic:object,
 *   preDispatchBoard:object[]|null}} evidence
 * @returns {object} Serialized, owner-information-safe abort evidence.
 */
function nativeDispatchAbortEvidence(evidence) {
  assert.ok(Number.isSafeInteger(evidence.actionOrdinal) &&
    evidence.actionOrdinal >= 0);
  assert.equal(typeof evidence.actionName, 'string');
  assert.equal(typeof evidence.errorMessage, 'string');
  const failureStage=evidence.failureStage??'store-dispatch';
  assert.ok(['store-dispatch','strict-prompt-validation','bot-decoder'].includes(failureStage));
  assert.ok(evidence.actingSeat === 0 || evidence.actingSeat === 1);
  if(failureStage==='bot-decoder'||
     failureStage==='strict-prompt-validation'){
    assert.match(evidence.redactedMessageDigest??'',/^[0-9a-f]{64}$/);
  }else if(evidence.redactedMessageDigest!==undefined &&
     evidence.redactedMessageDigest!==null){
    assert.match(evidence.redactedMessageDigest,/^[0-9a-f]{64}$/);
  }
  const sourceDeal = evidence.sourceDeal ?? null;
  if (sourceDeal) {
    assert.ok(sourceDeal.seat === 0 || sourceDeal.seat === 1);
    assert.match(sourceDeal.digestSha256, /^[0-9a-f]{64}$/);
  }
  const fullDeal = evidence.fullDeal ?? null;
  if (fullDeal) {
    assert.equal(fullDeal.schema,'initial-full-physical-deal-sha256-v1');
    assert.match(fullDeal.digestSha256,/^[0-9a-f]{64}$/);
  }
  const turnOrder=evidence.initialTurnOrder??null;
  if(turnOrder){
    assert.equal(typeof turnOrder.verifiedByDrawLog,'boolean');
    assert.ok(turnOrder.firstTurnSlot===null||
      turnOrder.firstTurnSlot===0||turnOrder.firstTurnSlot===1);
    if(turnOrder.verifiedByDrawLog){
      assert.ok(turnOrder.firstTurnSlot===0||turnOrder.firstTurnSlot===1);
      assert.ok(Number.isSafeInteger(turnOrder.firstTurnPlayerId));
      assert.equal(typeof turnOrder.firstTurnPlayerName,'string');
      assert.ok(turnOrder.firstTurnPlayerName.length>0);
      assert.equal(turnOrder.firstDrawLogName,turnOrder.firstTurnPlayerName,
        'Native first-turn draw evidence disagrees with observed first player');
    }
  }
  const roots = evidence.rootActionLedger == null ? null :
    detached(evidence.rootActionLedger);
  assert.ok(roots === null || Array.isArray(roots));
  // Ordinary Store actions increment this counter only upon acceptance.
  if (roots) assert.equal(roots.length, evidence.actionOrdinal);
  return {
    schema: VERSION,
    failureStage,
    pendingPrompt:evidence.pendingPrompt??null,
    redactedMessageDigest:evidence.redactedMessageDigest??null,
    actionOrdinal: evidence.actionOrdinal,
    actionName: evidence.actionName,
    turnBefore: evidence.turnBefore,
    phaseBefore: evidence.phaseBefore,
    actingSeat: evidence.actingSeat,
    attackName: evidence.actionName === 'AttackAction' ?
      evidence.attackName ?? null : null,
    attackingPokemon: evidence.actionName === 'AttackAction' ?
      evidence.attackingPokemon ?? null : null,
    errorMessage: evidence.errorMessage,
    sourceDealFingerprint: sourceDeal ? {
      seat:sourceDeal.seat,digestSha256:sourceDeal.digestSha256
    } : null,
    ...(fullDeal ? {fullPhysicalDealFingerprint:{
      schema:fullDeal.schema,digestSha256:fullDeal.digestSha256
    }} : {}),
    initialTurnOrderEvidence:turnOrder?{
      firstTurnSlot:turnOrder.firstTurnSlot,
      verifiedByDrawLog:turnOrder.verifiedByDrawLog
    }:null,
    rootActionCount: roots?.length ?? null,
    rootActionLedgerSha256: roots ? createHash('sha256')
      .update(JSON.stringify(roots)).digest('hex') : null,
    rootActionLedger: roots,
    // Explicitly deny the invalid inference documented by Agent 8.
    legacyLedgerOmitsPhysicalTargets: true,
    physicalActionParityCertified: false,
    preDispatchPublic: detached(evidence.preDispatchPublic),
    preDispatchBoard: detached(evidence.preDispatchBoard),
    competitiveGameQualified: false
  };
}

/**
 * Audit only the source location of a native decoder exception. Stack messages
 * can contain private card identities: export no message or argument text.
 * Supports Windows and POSIX paths but emits only basename/line/column.
 * @param {Error} error Actual decoder exception, never visible to a bot.
 * @returns {{errorClass:string,frames:object[]}}
 */
function safeDecoderFrameAttribution(error){
  const classes=new Set(['Error','TypeError','RangeError','ReferenceError',
    'SyntaxError','AssertionError']);
  const errorClass=classes.has(error?.name)?error.name:'OtherError';
  const frames=String(error?.stack??'').split('\n').slice(1,16)
    .map(line=>{
      const m=line.match(/(?:^|[\\/])([A-Za-z0-9_.-]+\.(?:cjs|js|ts)):(\d+):(\d+)(?:[)]|$)/);
      return m?{file:m[1],line:Number(m[2]),column:Number(m[3])}:null;
    }).filter(Boolean).slice(0,8);
  return {errorClass,frames};
}

/**
 * Publish only redacted diagnostics when the bot or strict prompt gate may
 * have embedded concealed selected card printings in its exception. Store
 * dispatch failures retain the legacy stack for forensic compatibility.
 *
 * @param {Error&{cause?:Error,nativeAbortEvidence?:object}} error
 * @returns {{error:string,nativeStoreCauseStack:string|null,
 *   nativeAbortEvidence:object|null}}
 */
function publicNativeAbortError(error) {
  const receipt=error?.nativeAbortEvidence??
    error?.cause?.nativeAbortEvidence??null;
  const concealed=receipt &&
    ['bot-decoder','strict-prompt-validation'].includes(receipt.failureStage);
  return {
    error:concealed?
      'Redacted '+receipt.failureStage+
      ' failure; exception SHA256 '+receipt.redactedMessageDigest:
      String(error?.stack||error),
    nativeStoreCauseStack:concealed?null:(error?.cause?.stack??null),
    nativeAbortEvidence:receipt
  };
}

module.exports = {VERSION,nativeDispatchAbortEvidence,publicNativeAbortError,
  safeDecoderFrameAttribution};
