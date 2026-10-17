'use strict';

/**
 * A root-only snapshot for information-set transitions. The identities are
 * kept internal and must never be passed to the deciding bot.
 * @param {object} state Pinned game Store State.
 * @returns {Map<number,{prizes:Set<object>,visible:Set<object>,allExposed:boolean}>}
 */
function snapshotPrizeCardIdentities(state){
  return new Map(state.players.map(player=>{
    const visible=new Set();
    for(const zone of [
      player.hand,player.discard,player.lostzone,player.supporter,
      player.active,...(player.bench||[])
    ]){
      for(const card of zone?.cards||[])visible.add(card);
      for(const card of zone?.tools||[])visible.add(card);
    }
    const occupied=player.prizes.filter(slot=>slot.cards.length>0);
    return [player.id,{
      prizes:new Set(occupied.flatMap(slot=>slot.cards)),
      visible,
      allExposed:occupied.length>0 &&
        occupied.every(slot=>slot.isSecret===false)
    }];
  }));
}

/**
 * Revoke exact deck membership after genuine unknown face-down Prize ingress.
 * Reprizing a previously visible card (for example, an owner's Heavy Ball
 * staged as a public Trainer) does not hide its identity or deck membership.
 * @param {ReturnType<typeof snapshotPrizeCardIdentities>} before
 * @param {object} after Actual post-dispatch Store State.
 * @param {Map<number,object>} epochs
 * @returns {number[]} IDs whose knowledge was invalidated.
 */
function invalidateAfterRootHiddenPrizeIngress(before,after,epochs){
  const revoked=[];
  for(const player of after.players){
    const epoch=epochs.get(player.id);
    if(!epoch?.exactMembershipKnown())continue;
    const prior=before.get(player.id);
    if(!prior)continue;
    const unknownIngress=player.prizes.some(slot=>
      slot.isSecret && slot.cards.some(card=>
        !prior.prizes.has(card) && !prior.visible.has(card)));
    if(unknownIngress){
      epoch.invalidateAfterHiddenPrizeRedeal();
      revoked.push(player.id);
    }
  }
  return revoked;
}

/**
 * A full real Prize reveal can establish exact remaining deck membership
 * from a known source 60, even before the first owner-deck search.
 * @param {ReturnType<typeof snapshotPrizeCardIdentities>} before
 * @param {object} after Actual post-dispatch Store State.
 * @param {Map<number,object>} epochs
 * @returns {number[]} IDs that gained full Prize information.
 */
function observeAfterRootFullPrizeReview(before,after,epochs){
  const informed=[];
  for(const player of after.players){
    const epoch=epochs.get(player.id);
    const prior=before.get(player.id);
    if(!epoch || !prior || prior.allExposed)continue;
    const occupied=player.prizes.filter(slot=>slot.cards.length>0);
    if(occupied.length===0 ||
        occupied.some(slot=>slot.isSecret!==false))continue;
    epoch.observeFullOwnPrizes();
    informed.push(player.id);
  }
  return informed;
}

module.exports={
  snapshotPrizeCardIdentities,
  invalidateAfterRootHiddenPrizeIngress,
  observeAfterRootFullPrizeReview
};
