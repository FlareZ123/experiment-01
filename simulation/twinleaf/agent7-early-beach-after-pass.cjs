'use strict';

const VERSION='agent7-first-cycle-otherwise-pass-tropical-beach-v1';

/**
 * Offer a print-identified Tropical Beach line after the existing actor-root
 * policy has exhausted its supported actions. The native Store retains the
 * legality and physical movement authority; this is a resource proposal.
 *
 * First-cycle scope permits the actual rank-3 turn-one seven-card opening:
 * playing Beach brings the hand from seven to six, then using it can draw one.
 * Existing >=2-card last-chance policy is intentionally left untouched.
 *
 * @param {object} view Detached owner-root actor observation.
 * @param {{deferForMail?:boolean}} [options] Only when native owner Mail is installed.
 * @returns {{kind:string,handIndex?:number,printing?:string,cardsToDraw?:number,reason:string}|null}
 */
function chooseEarlyBeachAfterPass(view,{deferForMail=false}={}){
  if(view?.decisionKind!=='owner-root'||
     !Number.isSafeInteger(view.globalTurn)||
     view.globalTurn<1||view.globalTurn>2||
     !Array.isArray(view.ownHand))return null;
  const own=view.ownPublic, opponent=view.opponentPublic;
  const resources=view.ownTurnResources;
  if(!own?.active||!resources||
     !Number.isSafeInteger(own.deckCount)||own.deckCount<=7||
     !Number.isSafeInteger(resources.stadiumUsedTurn)||
     resources.stadiumUsedTurn>=view.globalTurn)return null;
  // A separate native Mail prompt owner can resolve its own Item choice
  // before a fallback Beach line. This deliberate composition remains off
  // unless an external policy actually installs that Mail adapter.
  if(deferForMail===true&&resources.itemPlayLocked===false&&
     own.publicTurnRestrictions?.itemPlayLocked!==true&&
     view.ownHand.some(p=>p.startsWith("Trainers' Mail ROS")))return null;
  const stadium=[...(own.stadium??[]),...(opponent?.stadium??[])];
  const beachAlreadyInPlay=stadium.some(card=>card.startsWith('Tropical Beach '));
  if(beachAlreadyInPlay){
    const draw=Math.min(7-view.ownHand.length,own.deckCount);
    if(draw<1||own.deckCount-draw<7)return null;
    return {kind:'use-tropical-beach',cardsToDraw:draw,
      reason:'first-cycle-otherwise-pass-draw'};
  }
  const handIndex=view.ownHand.findIndex(card=>card.startsWith('Tropical Beach '));
  if(handIndex<0||stadium.length>0||resources.stadiumPlayLocked!==false||
     !Number.isSafeInteger(resources.stadiumPlayedTurn)||
     resources.stadiumPlayedTurn>=view.globalTurn)return null;
  const draw=Math.min(7-(view.ownHand.length-1),own.deckCount);
  if(draw<1||own.deckCount-draw<7)return null;
  return {kind:'play-tropical-beach',handIndex,printing:view.ownHand[handIndex],
    reason:'first-cycle-otherwise-pass-place-for-draw'};
}

module.exports={VERSION,chooseEarlyBeachAfterPass};
