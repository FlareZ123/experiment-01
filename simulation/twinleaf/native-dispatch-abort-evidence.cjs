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

module.exports = {VERSION,nativeDispatchAbortEvidence,publicNativeAbortError};
