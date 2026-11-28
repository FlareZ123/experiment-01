'use strict';
const assert=require('node:assert/strict');

/**
 * Produce printed conditional Supporter alternatives from detached
 * actor-visible data. This does not dispatch Store actions.
 * @param {object} view
 * @param {object} receipt
 * @param {(name:string)=>boolean} isBasicEnergy
 */
// Only the HOST may add this PRIVATE field after V3 validation. V3 rejects
// it on incoming wire requests. The Store tracker has attested every
// intervening turn's actor, so consecutive turns are handled correctly.
function hostLastOpponentTurnKO(view,receipt){
  const cert=receipt?.hostAuthenticatedPriorOpponentTurnKO;
  if(!cert)return null;
  if(cert.version!=='agent8-host-only-last-opponent-turn-ko-v1'||
     cert.lastOpponentTurnVerified!==true||
     cert.actorSeat!==view?.actorSeat||
     cert.observationTurn!==view?.globalTurn||
     !Number.isSafeInteger(cert.lastOpponentTurn)||
     cert.lastOpponentTurn<1||cert.lastOpponentTurn>=view.globalTurn||
     typeof cert.any!=='boolean'||typeof cert.byAttack!=='boolean')
    return null;
  return cert;
}
function previousTurnResponseOptions(view,receipt,isBasicEnergy){
  assert.equal(view.actorSeat,receipt.actorSeat);
  assert.equal(view.globalTurn,receipt.turn);
  const ko=receipt.priorOpponentTurnKO;
  const hostCert=hostLastOpponentTurnKO(view,receipt);
  const hasFreshPriorOpponentTurnKO=hostCert?
    hostCert.any===true:
    Number.isSafeInteger(view.globalTurn)&&
      view.globalTurn>1&&ko?.any===true&&ko.turn===view.globalTurn-1;
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
module.exports={previousTurnResponseOptions,hostLastOpponentTurnKO};
