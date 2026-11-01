'use strict';

const VERSION='agent6-authenticated-cross-turn-owner-k1-speed-alternative-v1';

/**
 * Preserve the narrow information established by a real owner-deck search:
 * a source player knows its singleton Thunder Mountain was missing and
 * Speed Lightning was seen in the remaining deck on the previous turn.
 *
 * Only reconstruct a feasible alternative G&H mode from these known facts.
 * The next genuine G&H native owner-deck prompt still validates the precise
 * Speed target. This function has no access to a game state or hidden zones.
 *
 * @param {object|null} plan Owner's current legal hand/public opening plan.
 * @param {object|null} record Genuine past owner-search observation.
 * @param {object} current Owner ID, seat, public counts and legal resources.
 * @returns {object|null} Narrow alternative plan or null.
 */
function priorK1SpeedAlternative(plan,record,current){
  if(plan?.channel!=='held-guzma-hala'||plan.needThunder!==true||
     plan.needDce!==false)return null;
  if(record?.source!=='accepted-original-store-owner-deck-prompt'||
     !Number.isInteger(record.ownerPromptId)||
     record.ownerId!==current?.ownerId||
     record.actorSeat!==current.seat||
     record.globalTurn!==1||
     current.turn!==3||
     record.prizeCount!==current.prizeCount||
     record.thunderMountainDeckCopies!==0||
     !Number.isInteger(record.speedLightningDeckCopies)||
     record.speedLightningDeckCopies<1)return null;
  if(current.activeDceAttached!==true||
     current.activeSpeedAttached===true||
     current.speedAlreadyHeld===true||
     current.energyAttachAvailable!==true||
     current.supporterAvailable!==true||
     current.twoDiscardPaymentAvailable!==true)return null;
  return {...plan,needThunder:false,needLiveLightningViaSpeed:true,
    discardCount:2,ownerK1KnowledgeSource:VERSION};
}

module.exports={VERSION,priorK1SpeedAlternative};
