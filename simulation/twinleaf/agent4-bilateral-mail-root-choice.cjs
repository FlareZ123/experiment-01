'use strict';
const {actorObservation}=
  require('./actor-observation-contract.cjs');
const VERSION='agent4-bilateral-owner-mail-pass-root-v1';
const MAIL="Trainers' Mail ROS";
/**
 * Consider Mail only for the actor's own genuine native root Pass.
 * A real Item card must be in the owner's hand and native canPlay true.
 * @param {object} state Native State
 * @param {number} seat Actual active physical seat
 * @param {object} store Current native Store
 * @param {Function} [observe] Read-only actor observation contract
 * @returns {number|null} Physical hand index, or no intervention
 */
function eligibleMailHandIndex(state,seat,store,observe=actorObservation){
  if(state?.activePlayer!==seat||state.prompts?.some(p=>p.result===undefined))
    return null;
  const owner=state.players?.[seat];
  if(!owner?.hand?.cards||owner.deck?.cards?.length===0)return null;
  const view=observe(state,seat);
  if(view.decisionKind!=='owner-root'||
    view.actorSeat!==seat||
    view.ownTurnResources?.itemPlayLocked!==false||
    view.ownPublic?.publicTurnRestrictions?.itemPlayLocked===true)return null;
  const index=view.ownHand?.indexOf(MAIL)??-1;
  if(index<0)return null;
  const card=owner.hand.cards[index];
  if(card?.fullName!==MAIL||typeof card.canPlay!=='function'||
    card.canPlay(store,state,owner)!==true)return null;
  return index;
}
module.exports={VERSION,MAIL,eligibleMailHandIndex};
