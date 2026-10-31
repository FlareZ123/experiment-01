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
  if(view.decisionKind!=='owner-root'||
     receipt.priorOpponentTurnKO?.any!==true||
     view.ownTurnResources.supporterPlayedTurn>0||
     view.ownTurnResources.supporterPlayLocked||
     view.ownPublic.deckCount===0)return [];
  const result=[];
  const hand=view.ownHand;
  const p=hand.indexOf('Teammates PRC');
  if(p>=0)result.push({printing:'Teammates PRC',
    handIndex:p,searchMaximum:Math.min(2,view.ownPublic.deckCount)});
  const r=hand.indexOf('Raihan EVS');
  if(r>=0&&view.ownPublic.discard.some(isBasicEnergy))
    result.push({printing:'Raihan EVS',handIndex:r,
      attachBasicFromDiscard:true,searchMaximum:1});
  return result;
}
module.exports={previousTurnResponseOptions};
