'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {replayPolicyRandomTape,digest}=
  require('./native-policy-random-tape.cjs');

const VERSION='native-owner-deck-order-contrast-v1';

/**
 * Compare one *exploratory* physical owner-deck permutation after separately
 * verifying an authentic native same-world root/action/RNG replay. Does not
 * certify that this permutation belongs to the acting player's actual
 * information set: known deck-top, seen Prize and K0/K1 history require
 * a separately authenticated owner-knowledge ledger.
 *
 * @param {{
 *   parity:object,
 *   root:object,
 *   seat:0|1,
 *   tape:number[],
 *   knownTopCount?:number,
 *   knownTopVerified?:boolean,
 *   cloneState:(source:object)=>object,
 *   replayDecision:(world:object)=>unknown,
 *   actionSignature:(action:unknown)=>unknown,
 *   fingerprint:(state:object)=>unknown,
 *   actorView:(state:object,seat:0|1)=>unknown
 * }} args
 * @returns {object} Unqualified hypothetical contrast with explicit vetoes.
 */
function compareNativeHiddenDeckOrder(args) {
  assert.ok(args&&typeof args==='object');
  const {parity,root,seat,tape,cloneState,replayDecision,
    actionSignature,fingerprint,actorView}=args;
  assert.ok(parity?.sameWorldDecisionParityQualified===true,
    'Native same-world parity is mandatory before hidden-order contrasts');
  assert.ok(root&&typeof root==='object');
  assert.ok(seat===0||seat===1);
  assert.ok(Array.isArray(tape));
  const knownTopCount=args.knownTopCount??0;
  assert.ok(Number.isSafeInteger(knownTopCount)&&knownTopCount>=0,
    'Known-top count must be a nonnegative safe integer');
  assert.ok(knownTopCount===0||args.knownTopVerified===true,
    'Protecting a known deck-top prefix requires authenticated observation');
  for(const fn of [cloneState,replayDecision,
    actionSignature,fingerprint,actorView])assert.equal(typeof fn,'function');
  // A successful parity result only certifies the exact root and RNG tape
  // from which it was computed. Reject stale or unrelated successes before
  // allowing any speculative hidden-world action comparison.
  // Retain a detached provenance snapshot if fingerprint() returns an object.
  const before=structuredClone(fingerprint(root)),tapeSha256=digest(tape);
  assert.equal(parity.schema,'native-same-world-tape-parity-v1',
    'Native parity provenance schema mismatch');
  assert.deepStrictEqual(parity.rootAtEntry,before,
    'Native parity root does not match hidden-contrast root');
  assert.deepStrictEqual(parity.rootAtExit,before,
    'Native parity source root was not unchanged');
  assert.equal(parity.tapeSha256,tapeSha256,
    'Native parity RNG tape does not match hidden-contrast tape');
  assert.equal(parity.tapeDraws,tape.length,
    'Native parity RNG draw count mismatch');
  assert.equal(parity.consumed,tape.length,
    'Native parity RNG consumption mismatch');
  assert.equal(parity.sourceRootUnchanged,true,
    'Native parity mutated the physical source State');
  assert.equal(parity.physicalCloneMatched,true,
    'Native parity used a mismatched physical clone');
  assert.equal(parity.selectedActionMatched,true,
    'Native parity failed same-world action matching');
  assert.equal(parity.replayError,null,
    'Native parity contains a replay failure');
  assert.strictEqual(parity.replayDecisionRef,replayDecision,
    'Native parity replay-policy callback identity mismatch');
  const report={
    schema:VERSION,actorSeat:seat,tapeDraws:tape.length,
    tapeSha256:digest(tape),sourceRootAtEntry:before,
    sourceRootUnchanged:false,actorObservationMatched:false,
    permutationChangedPhysicalOrder:false,deckCount:null,
    preservedKnownTopCount:knownTopCount,
    callerAssertsKnownTopVerified:knownTopCount>0&&
      args.knownTopVerified===true,
    // A boolean caller assertion cannot replace an authenticated native
    // owner-observation ledger. Keep the stronger qualification veto closed.
    ownerDeckKnownTopAuthenticated:false,
    ownerK0K1HistoryAuthenticated:false,
    replayedAction:null,
    selectedActionChanged:false,
    consumed:null,contrastExecutable:false,
    informationSetLeakQualified:false,
    competitiveGameQualified:false,
    error:null
  };
  try {
    const world=cloneState(root);
    assert.ok(world&&typeof world==='object'&&world!==root);
    assert.ok(isDeepStrictEqual(structuredClone(fingerprint(world)),before),
      'Detached hidden world does not match source root');
    const own=world.players[seat];
    const original=own?.deck?.cards;
    assert.ok(Array.isArray(original),'Owner deck is missing');
    report.deckCount=original.length;
    if(original.length-knownTopCount<2)throw new Error(
      'Not enough unknown deck suffix cards for a hidden-order permutation');
    const originalOrder=original.slice();
    const reorderedSuffix=original.slice(knownTopCount).reverse();
    original.splice(knownTopCount,reorderedSuffix.length,...reorderedSuffix);
    report.permutationChangedPhysicalOrder=original.some(
      (card,i)=>card!==originalOrder[i]);
    if(!report.permutationChangedPhysicalOrder)throw new Error(
      'Counterfactual physical deck order did not change');
    const realObservation=actorView(root,seat);
    const changedObservation=actorView(world,seat);
    report.actorObservationMatched=isDeepStrictEqual(
      realObservation,changedObservation);
    if(!report.actorObservationMatched)throw new Error(
      'Permutation changed actor-visible observation');
    const result=replayPolicyRandomTape(tape,
      ()=>replayDecision(world));
    report.consumed=result.consumed;
    report.replayedAction=actionSignature(result.result);
    report.selectedActionChanged=!isDeepStrictEqual(
      parity.actualAction,report.replayedAction);
    report.contrastExecutable=true;
  } catch(error) {
    report.error=String(error?.message??error);
  } finally {
    report.sourceRootAtExit=structuredClone(fingerprint(root));
    report.sourceRootUnchanged=isDeepStrictEqual(
      before,report.sourceRootAtExit);
  }
  if(!report.sourceRootUnchanged) {
    report.error='Hidden-world contrast mutated original source State';
    report.contrastExecutable=false;
  }
  // Even a completed action reversal is a hypothesis until independent
  // owner-observation/K0-K1 and known-top provenance are established.
  report.informationSetLeakQualified=false;
  return report;
}

module.exports={VERSION,compareNativeHiddenDeckOrder};
