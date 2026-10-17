'use strict';

/**
 * A per-seat tracker for the current certainty of owner deck membership.
 *
 * Callers must authenticate the live Store prompt before recording a search.
 * Invalidations must follow a successful root action that replaces unknown
 * Prize cards. Never invoke these methods from speculative Simulator states.
 * This tracks availability of exact deck membership, not remembered order.
 */
function createOwnerDeckKnowledgeEpoch(){
  let exactMembership=false;
  let epoch=0;
  let liveSearches=0;
  let fullPrizeReviews=0;
  let hiddenPrizeRedeals=0;
  return Object.freeze({
    exactMembershipKnown:()=>exactMembership,
    observeOwnerDeckSearch(){
      liveSearches++;
      if(!exactMembership){exactMembership=true;epoch++;}
    },
    observeFullOwnPrizes(){
      fullPrizeReviews++;
      if(!exactMembership){exactMembership=true;epoch++;}
    },
    invalidateAfterHiddenPrizeRedeal(){
      hiddenPrizeRedeals++;
      if(exactMembership){exactMembership=false;epoch++;}
    },
    snapshot:()=>Object.freeze({
      exactMembership,epoch,liveSearches,fullPrizeReviews,hiddenPrizeRedeals
    })
  });
}

module.exports={createOwnerDeckKnowledgeEpoch};
