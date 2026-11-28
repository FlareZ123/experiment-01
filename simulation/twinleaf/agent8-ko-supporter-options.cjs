'use strict';
const assert=require('node:assert/strict');

/**
 * Produce printed conditional Supporter alternatives from detached
 * actor-visible data. This does not dispatch Store actions.
 * @param {object} view
 * @param {object} receipt
 * @param {(name:string)=>boolean} isBasicEnergy
 */
function previousTurnResponseOptions(view,receipt,isBasicEnergy){
  assert.equal(view.actorSeat,receipt.actorSeat);
  assert.equal(view.globalTurn,receipt.turn);
  const ko=receipt.priorOpponentTurnKO;
  // Freshness is relative to the *latest completed opponent-owned turn*.
  // The actor may have taken an extra turn since that event.
  const certified=receipt.opponentLastTurnOwnerCertified===true &&
    Number.isSafeInteger(receipt.opponentLastTurnTurn)&&
    receipt.opponentLastTurnTurn>=0&&
    receipt.opponentLastTurnTurn<view.globalTurn;
  const hasFreshPriorOpponentTurnKO=certified&&ko?.any===true&&
    ko.turn===receipt.opponentLastTurnTurn;
  if(view.decisionKind!=='owner-root'||
     !hasFreshPriorOpponentTurnKO||
     view.ownTurnResources.supporterPlayedTurn>0||
     view.ownTurnResources.supporterPlayLocked||
     view.ownPublic.deckCount===0)return [];
  const result=[];
  const hand=view.ownHand;
  const printed=value=>typeof value==='string'?value:
    value?.printing??value?.fullName??'';
  const p=hand.findIndex(value=>/^Teammates PRC(?: 141)?\b/i.test(printed(value)));
  if(p>=0)result.push({printing:'Teammates PRC',
    handIndex:p,searchMaximum:Math.min(2,view.ownPublic.deckCount)});
  const r=hand.findIndex(value=>/^Raihan EVS(?: 152)?\b/i.test(printed(value)));
  if(r>=0&&Array.isArray(view.ownPublic.discard)&&
     view.ownPublic.discard.some(isBasicEnergy))
    result.push({printing:'Raihan EVS',handIndex:r,
      attachBasicFromDiscard:true,searchMaximum:1});
  return result;
}
module.exports={previousTurnResponseOptions};
