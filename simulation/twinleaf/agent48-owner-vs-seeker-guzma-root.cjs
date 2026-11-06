'use strict';

const {ownerVsSeekerGuzmaOpportunity}=require('./agent2-vs-seeker-guzma-recovery-frontier.cjs');
const VERSION='agent48-owner-vs-seeker-guzma-root-v1';

/**
 * Adapt the public opportunity frontier to the actor-only root-intent contract.
 * @param {object} view Public actor observation for the genuine owner root.
 * @returns {object|null}
 */
function chooseOwnerVsSeekerGuzmaRoot(view){
  if((view?.ownPublic?.resolvingSupporter??[]).length>0)return null;
  const opportunity=ownerVsSeekerGuzmaOpportunity(view);
  if(!opportunity)return null;
  return Object.freeze({
    kind:'play-seeker-get-supporter',
    handIndex:opportunity.supportItemHandIndex,
    target:opportunity.desiredDiscardSupporterPrinting,
    supportItemPrinting:opportunity.supportItemPrinting,
    opportunity
  });
}

module.exports={VERSION,chooseOwnerVsSeekerGuzmaRoot};
