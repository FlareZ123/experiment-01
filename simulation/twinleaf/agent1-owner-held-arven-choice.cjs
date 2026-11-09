'use strict';

const VERSION='agent1-original-held-arven-pass-root-v1';
const ARVEN='Arven OBF';

/**
 * Select a printed Arven already in the acting owner's real hand.
 * No deck or Prize identities are read, even when owner could infer them.
 * The Store must separately confirm native canPlay and exact prompt payment.
 * @param {object} view Detached, frozen actorObservation.
 * @returns {{kind:string,handIndex:number,printing:string}|null}
 */
function chooseOwnerHeldArven(view){
  if(view?.decisionKind!=='owner-root'||
    !Array.isArray(view.ownHand)||
    !Number.isSafeInteger(view.globalTurn)||view.globalTurn<=1||
    view.ownPublic?.deckCount===0||
    view.ownTurnResources?.supporterPlayedTurn>0||
    view.ownTurnResources?.supporterPlayLocked===true||
    view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true)
    return null;
  const handIndex=view.ownHand.indexOf(ARVEN);
  return handIndex<0?null:{
    kind:'play-original-held-arven',handIndex,printing:ARVEN
  };
}

module.exports={VERSION,ARVEN,chooseOwnerHeldArven};
