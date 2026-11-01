'use strict';

const assert=require('node:assert/strict');

const VERSION='agent12-nightwatch-native-nonce-source-root-bijection-v1';

/**
 * Bind opt-in sampled physical-position records back to the genuine accepted
 * initiating Night Watch roots after game completion. Fails closed on any
 * absent/ambiguous source root, speculative duplicate or reused nonce.
 * This deliberately does NOT infer native prompt-ID/root-ordinal equality.
 *
 * @param {object} group A full original Store paired native evidence group.
 * @returns {object} Bounded postgame source/nonce reconciliation evidence.
 */
function reconcileNightWatchNonceRoots(group){
  assert.ok(group&&Array.isArray(group.uniform));
  const events=group.randomHookAudit?.events;
  assert.ok(Array.isArray(events));
  assert.equal(group.randomHookAudit.structuralCandidates,events.length,
    'Bounded event log must be complete for exact one-to-one proof');
  const roots=[];
  for(const arm of group.uniform){
    assert.ok(typeof arm.trial?.id==='string');
    assert.ok(Array.isArray(arm.nightWatchPromptReceipts));
    for(const root of arm.nightWatchPromptReceipts){
      assert.ok(root.actorSeat===0||root.actorSeat===1);
      assert.ok(Number.isSafeInteger(root.ordinal));
      assert.ok(Number.isSafeInteger(root.turn));
      assert.ok(Number.isSafeInteger(root.opponentHandSizeBefore));
      assert.ok(Number.isSafeInteger(root.selectedCount));
      assert.equal(root.selectedCount,
        Math.min(2,root.opponentHandSizeBefore),
        'Printed Night Watch observed native count must match hand size');
      assert.equal(root.nativePromptMin,root.selectedCount);
      assert.equal(root.nativePromptMax,root.selectedCount);
      assert.equal(root.ownerSeat,1-root.actorSeat,
        'Real Night Watch prompt must source opposing player hand');
      roots.push({...root,trialId:arm.trial.id});
    }
  }
  assert.equal(events.length,roots.length,
    'Structural prompt interception does not equal genuine named roots');
  const used=new Set(),nonces=new Set(),matches=[];
  for(const event of events){
    assert.ok(Number.isSafeInteger(event.promptId));
    assert.ok(Number.isSafeInteger(event.turn));
    assert.ok(event.actorId===101||event.actorId===202,
      'Original research headless actor ID must be known');
    const nonce=JSON.stringify([
      event.turn,String(event.actorId),String(event.promptId)]);
    assert.equal(event.nonce,nonce,
      'Random sampler nonce must be derived from stable prompt signature');
    assert.ok(!nonces.has(nonce),
      'Distinct live printed Night Watch selections cannot reuse nonce');
    nonces.add(nonce);
    const seat=event.actorId===101?0:1;
    const eligible=roots.filter(root=>
      root.actorSeat===seat&&root.turn===event.turn&&
      root.opponentHandSizeBefore===event.opponentHandCount&&
      root.selectedCount===event.selectedCount);
    assert.equal(eligible.length,1,
      'No unique matching live root by turn, seat, hand size and count');
    const root=eligible[0];
    const key=root.trialId+':'+root.ordinal;
    assert.ok(!used.has(key),'One genuine root matched more than once');
    used.add(key);
    assert.equal(event.positions.length,event.selectedCount);
    assert.equal(new Set(event.positions).size,event.positions.length);
    assert.ok(event.positions.every(i=>Number.isSafeInteger(i)&&i>=0&&
      i<event.opponentHandCount));
    matches.push({trialId:root.trialId,rootOrdinal:root.ordinal,
      turn:root.turn,actorSeat:seat,randomPromptId:event.promptId,
      nonce:event.nonce,handSize:event.opponentHandCount,
      nativeSelectedCount:root.selectedCount});
  }
  return {schema:VERSION,genuineNightWatchRoots:roots.length,
    matchedSourceRoots:used.size,uniqueObservedRandomNonces:nonces.size,
    matchBasis:'turn+actor+physical-hand-count+selected-count',
    actualNativePromptIdToRootOrdinalVerified:false,
    liveStorePointerCertifiedByThisFunction:false,
    independentPrintedPaperRandomnessCertified:false,
    competitiveQualifiedGames:0,matches};
}

module.exports={VERSION,reconcileNightWatchNonceRoots};
