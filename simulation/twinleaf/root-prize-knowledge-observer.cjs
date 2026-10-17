'use strict';

/**
 * Keep identities of physical Prize cards across one actual Store dispatch.
 * The snapshot is internal to an observer and must never be passed to a bot.
 * @param {{players:Array<{id:number,prizes:Array<{cards:object[]}>}>}} state
 * @returns {Map<number,Set<object>>}
 */
function snapshotPrizeCardIdentities(state){
  return new Map(state.players.map(player=>[
    player.id,new Set(player.prizes.flatMap(slot=>slot.cards))
  ]));
}

/**
 * Revoke exact deck-membership knowledge when a genuine root dispatch puts
 * a previously non-Prized physical card into a face-down Prize slot.
 * Removing/taking known Prizes and merely rearranging the same Prizes do
 * not reduce deck-membership information. The check discloses no card ID to
 * the policy. This observer is deliberately conservative for face-down
 * insertions, including card effects other than Redeemable Ticket.
 *
 * Never call it after a speculative Simulator dispatch.
 * @param {Map<number,Set<object>>} before
 * @param {{players:Array<{id:number,prizes:Array<{isSecret:boolean,cards:object[]}>}>}} after
 * @param {Map<number,{exactMembershipKnown:()=>boolean,invalidateAfterHiddenPrizeRedeal:()=>void}>} epochs
 * @returns {number[]} Player IDs whose certainty was invalidated
 */
function invalidateAfterRootHiddenPrizeIngress(before,after,epochs){
  const revoked=[];
  for(const player of after.players){
    const epoch=epochs.get(player.id);
    if(!epoch?.exactMembershipKnown())continue;
    const prior=before.get(player.id);
    if(!prior)continue;
    const unknownIngress=player.prizes.some(slot=>
      slot.isSecret && slot.cards.some(card=>!prior.has(card)));
    if(unknownIngress){
      epoch.invalidateAfterHiddenPrizeRedeal();
      revoked.push(player.id);
    }
  }
  return revoked;
}

module.exports={
  snapshotPrizeCardIdentities,
  invalidateAfterRootHiddenPrizeIngress
};
