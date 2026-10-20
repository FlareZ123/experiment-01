'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {digest,replayPolicyRandomTape}=
  require('./native-policy-random-tape.cjs');

const VERSION='native-same-world-tape-parity-v1';

/**
 * Replay exactly one authentic decision on a *detached, physically identical*
 * owner State using the ordered native decision RNG tape. The caller must
 * capture root, tape, policy constructors/options and actual action from the
 * same real Store decision. Any mismatched clone, RNG count or action vetoes
 * counterfactual interpretation. This function does not create another game.
 *
 * The callback constructs the replay policy under its actual adapters; merely
 * rebuilding a default SimpleTacticsAi does not reproduce historical policy.
 *
 * @param {{
 *   root:object,
 *   actualAction:unknown,
 *   tape:number[],
 *   cloneState:(state:object)=>object,
 *   replayDecision:(detachedState:object)=>unknown,
 *   actionSignature:(action:unknown)=>unknown,
 *   fingerprint:(state:object)=>unknown
 * }} args
 * @returns {object} A fail-closed diagnostic, never competitive game evidence.
 */
function verifyNativeSameWorldTapeParity(args) {
  assert.ok(args&&typeof args==='object');
  const {root,actualAction,tape,cloneState,replayDecision,
    actionSignature,fingerprint}=args;
  assert.ok(root&&typeof root==='object');
  assert.ok(Array.isArray(tape));
  for(const callback of [cloneState,replayDecision,actionSignature,fingerprint])
    assert.equal(typeof callback,'function');
  const before=fingerprint(root);
  const actual=actionSignature(actualAction);
  const report={
    schema:VERSION,tapeDraws:tape.length,tapeSha256:digest(tape),
    rootAtEntry:before,actualAction:actual,
    replayAction:null,consumed:null,
    physicalCloneMatched:false,
    sourceRootUnchanged:false,
    selectedActionMatched:false,
    sameWorldDecisionParityQualified:false,
    competitiveGameQualified:false,
    replayError:null
  };
  let world=null;
  try {
    world=cloneState(root);
    assert.ok(world&&typeof world==='object');
    assert.notStrictEqual(world,root,'Replay State must be detached');
    const cloneBefore=fingerprint(world);
    report.clonedRootAtEntry=cloneBefore;
    report.physicalCloneMatched=isDeepStrictEqual(before,cloneBefore);
    if(!report.physicalCloneMatched)
      throw new Error('Replay root differs from genuine physical State');

    const replay=replayPolicyRandomTape(tape,
      ()=>replayDecision(world));
    report.consumed=replay.consumed;
    report.replayAction=actionSignature(replay.result);
    report.selectedActionMatched=isDeepStrictEqual(actual,
      report.replayAction);
    report.cloneAfter=fingerprint(world);
    report.replayModifiedClonedState=
      !isDeepStrictEqual(cloneBefore,report.cloneAfter);
  } catch(error) {
    report.replayError=String(error?.message??error);
  } finally {
    report.rootAtExit=fingerprint(root);
    report.sourceRootUnchanged=isDeepStrictEqual(before,
      report.rootAtExit);
  }
  report.sameWorldDecisionParityQualified=Boolean(
    report.physicalCloneMatched&&report.sourceRootUnchanged&&
    report.replayError===null&&report.consumed===tape.length&&
    report.selectedActionMatched
  );
  report.counterfactualHiddenStateComparisonPermitted=
    report.sameWorldDecisionParityQualified;
  return report;
}

module.exports={VERSION,verifyNativeSameWorldTapeParity};
