'use strict';

const VERSION='agent1-owner-held-refill-supporter-pass-root-v1';

/**
 * Printed shuffle-and-draw effects retain singleton resources in the deck.
 * Research scope is limited to the listed, actually known draw Supporters;
 * Professor's Research is allowed only as the sole held card to protect UDP.
 * This is an owner-only intent. Native Store canPlay remains mandatory.
 * @param {string} printing
 * @param {number} prizes
 * @param {number} handCount
 * @returns {{target:number,discardsHand:boolean}|null}
 */
function refillMode(printing,prizes,handCount){
  if(printing.startsWith("Lillie's Determination "))
    return {target:prizes===6?8:6,discardsHand:false};
  if(printing.startsWith('Cynthia '))
    return {target:6,discardsHand:false};
  if(printing.startsWith('N '))
    return {target:prizes,discardsHand:false};
  if(printing.startsWith("Professor's Research ")&&handCount===1)
    return {target:7,discardsHand:true};
  return null;
}

/**
 * Choose an immediate owner-visible draw Supporter only when the incumbent
 * policy would Pass despite low hand. Uses no concealed opponent information.
 * @param {object} view Frozen actorObservation at a native owner root.
 * @returns {{kind:string,handIndex:number,printing:string,drawTarget:number}|null}
 */
function chooseOwnerHeldRefillSupporter(view){
  if(view?.decisionKind!=='owner-root'||
    !Array.isArray(view.ownHand)||view.ownHand.length===0||
    view.ownHand.length>4||view.globalTurn===1||
    view.ownPublic?.deckCount===0||
    view.ownTurnResources?.supporterPlayedTurn>0||
    view.ownTurnResources?.supporterPlayLocked===true||
    view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true)
    return null;
  const prizes=view.ownPublic?.prizeCount;
  if(!Number.isSafeInteger(prizes)||prizes<0||prizes>6)return null;
  let best=null;
  for(let index=0;index<view.ownHand.length;index++){
    const printing=view.ownHand[index];
    const mode=refillMode(printing,prizes,view.ownHand.length);
    if(!mode)continue;
    const minimumNew=mode.target-(view.ownHand.length-1);
    if(minimumNew<3)continue;
    if(!best||minimumNew>best.score){
      best={kind:'play-owner-held-refill-supporter',
        handIndex:index,printing,drawTarget:mode.target,
        score:minimumNew};
    }
  }
  return best===null?null:{
    kind:best.kind,handIndex:best.handIndex,
    printing:best.printing,drawTarget:best.drawTarget
  };
}

module.exports={VERSION,refillMode,chooseOwnerHeldRefillSupporter};
