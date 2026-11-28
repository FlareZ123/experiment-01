'use strict';
/**
 * Actor-only, research-side adapter joining the real turn-stamped Store
 * observer to Agent8's detached v3 event receipt and Agent49's strict
 * optional Copycat fields. No opponent concealed zone is inspected.
 *
 * The bridge is opt-in and is NOT installed in the qualified V3 runner.
 * Native KO booleans are deliberately redacted to unknown because they
 * can outlive the relevant opponent-owned turn after Timeless-GX.
 */
const assert=require('node:assert/strict');
const {publicEventReceipt}=
  require('./agent8-public-event-receipt.cjs');
const {sourceCopycatEligible,eventAttackSignature}=
  require('../evaluation/2026-11/agent49-policy-protocol.cjs');

const VERSION='agent47-copycat-v3-receipt-bridge-v1';

/**
 * @param {object} state Actual authenticated native State.
 * @param {0|1} seat Real physical acting seat.
 * @param {object} tracker Installed copycat-multiattack-history observer.
 * @returns {Readonly<object>} detached v3 receipt with optional source choices
 */
function copycatPublicEventReceipt(state,seat,tracker){
  assert.ok(state?.players?.length===2&&[0,1].includes(seat));
  assert.equal(state.activePlayer,seat);
  assert.ok(tracker&&
    typeof tracker.getPreviousTurnSnapshot==='function'&&
    typeof tracker.getCopycatChoices==='function');
  const opponent=state.players[1-seat];
  const owner=state.players[seat];
  const snapshot=tracker.getPreviousTurnSnapshot(opponent.id);
  const history=snapshot?.attacks??null;
  const turn=snapshot?.turn??null;

  // Base receipt clones only public face-up and visible owner markers.
  const base=publicEventReceipt(state,seat,history,turn);

  // Its native KO Boolean cannot be a trusted previous-opponent-turn receipt.
  // Until a separately certified owner-turn KO observer is installed, mark
  // both KO facts unknown rather than accidentally enabling a Supporter.
  const redactedKO=Object.freeze({any:null,byAttack:null});

  if(history===null){
    return Object.freeze({...base,priorOpponentTurnKO:redactedKO,
      opponentCopycatChoices:null,mimikyuCopycatCompatible:null});
  }
  assert.ok(Array.isArray(history)&&
    Array.isArray(base.opponentLastTurnAttacks)&&
    history.length===base.opponentLastTurnAttacks.length);

  const choices=tracker.getCopycatChoices(opponent.id);
  assert.ok(Array.isArray(choices));
  const selected=[];
  const seen=new Set();
  for(const nativeRow of choices){
    // The choices must reference actual previous-turn native attack objects.
    // Never reconstruct them by name, as two attacks could share a name.
    const index=history.indexOf(nativeRow);
    assert.ok(index>=0,'Copycat choice not present in authenticated Store history');
    const publicRow=base.opponentLastTurnAttacks[index];
    assert.ok(sourceCopycatEligible(publicRow),
      'Copycat eligibility must match printed attack source, not metadata');
    const key=eventAttackSignature(publicRow);
    assert.ok(!seen.has(key),'Repeated Copycat choice is not source-legal');
    seen.add(key);
    selected.push(publicRow);
  }

  const active=owner.active?.getPokemonCard?.();
  const activeHasCopycat=active?.name==='Mimikyu'&&
    Array.isArray(active.attacks)&&
    active.attacks.some(attack=>attack?.name==='Copycat');

  const result={...base,priorOpponentTurnKO:redactedKO,
    opponentCopycatChoices:Object.freeze(selected),
    mimikyuCopycatCompatible:!!activeHasCopycat&&selected.length>0};
  return Object.freeze(result);
}

module.exports={VERSION,copycatPublicEventReceipt};
