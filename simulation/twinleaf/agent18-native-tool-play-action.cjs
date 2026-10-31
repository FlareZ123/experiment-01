'use strict';
const assert=require('node:assert/strict');
const {enumerateActorToolCandidates}=
  require('./agent18-actor-tool-candidate-frontier.cjs');

/**
 * Convert one genuine detached owner-only, structurally visible Tool offer
 * to an isolated *candidate* native PlayCardAction. Caller must separately
 * obtain native Store acceptance and the rest of its game-state semantics.
 * A returned action is never automatically dispatched by this module.
 *
 * @param {object} view Frozen owner-only observation from the actual root.
 * @param {{toolPrintings:Set<string>}} catalog Public exact-printed Tool names.
 * @param {object} candidate One enumerated source Tool candidate.
 * @param {string|number} ownerId Native ID of this physical actor.
 * @param {{PlayCardAction:Function,PlayerType:{BOTTOM_PLAYER:number},
 *   SlotType:{ACTIVE:number,BENCH:number}}} types Pinned native action types.
 * @returns {object} New un-dispatched native PlayCardAction.
 */
function buildNativeOwnerToolCandidateAction(
  view,catalog,candidate,ownerId,types
){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(catalog?.toolPrintings instanceof Set);
  assert.equal(candidate?.kind,'attach-tool-candidate');
  assert.ok(Number.isSafeInteger(candidate.handIndex));
  assert.ok(candidate.handIndex>=0&&
    candidate.handIndex<view.ownHand.length);
  assert.equal(view.ownHand[candidate.handIndex],candidate.printing);
  assert.ok(catalog.toolPrintings.has(candidate.printing));
  assert.ok(candidate.slot==='active'||candidate.slot==='bench');
  assert.ok(Number.isSafeInteger(candidate.index)&&candidate.index>=0);
  if(candidate.slot==='active')
    assert.equal(candidate.index,0,'Active Tool target index must be zero');
  const candidates=enumerateActorToolCandidates(view,catalog.toolPrintings);
  assert.ok(candidates.some(o=>o.kind===candidate.kind&&
    o.printing===candidate.printing&&
    o.handIndex===candidate.handIndex&&
    o.slot===candidate.slot&&o.index===candidate.index),
  'Detached owner Tool candidate must have a real free Tool recipient');
  assert.equal(typeof types?.PlayCardAction,'function');
  assert.ok(Number.isInteger(types?.PlayerType?.BOTTOM_PLAYER));
  assert.ok(Number.isInteger(types?.SlotType?.ACTIVE));
  assert.ok(Number.isInteger(types?.SlotType?.BENCH));
  return new types.PlayCardAction(ownerId,candidate.handIndex,{
    player:types.PlayerType.BOTTOM_PLAYER,
    slot:candidate.slot==='bench'?
      types.SlotType.BENCH:types.SlotType.ACTIVE,
    index:candidate.index
  });
}
module.exports={buildNativeOwnerToolCandidateAction};
