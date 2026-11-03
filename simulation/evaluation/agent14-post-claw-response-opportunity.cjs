'use strict';

const VERSION='agent14-owner-public-behind-countercatcher-response-audit-v1';
const CATCHER='Counter Catcher PAR';
const LILLIE="Lillie's Determination M1L";

/**
 * A read-only owner/public-board response diagnostic. This cannot certify an
 * Item's actual native canPlay, a target's retreat inability or game benefit.
 * @param {object} view Detached actorObservation from the acting player's root.
 * @param {object|null} [selectedIntent] The already-selected actor root, if known.
 * @returns {object|null} Read-only opportunity receipt, or null when irrelevant.
 */
function auditBehindResponse(view,selectedIntent=null){
  if(view?.decisionKind!=='owner-root'||!Array.isArray(view.ownHand))return null;
  const own=view.ownPublic,op=view.opponentPublic,r=view.ownTurnResources;
  if(!own?.active||!op?.active||!r||!Array.isArray(op.bench))return null;
  const behind=Number.isSafeInteger(own.prizeCount)&&
    Number.isSafeInteger(op.prizeCount)&&own.prizeCount>op.prizeCount;
  const catcherIndex=view.ownHand.indexOf(CATCHER);
  const heldCatcher=catcherIndex>=0;
  const itemNotLocked=r.itemPlayLocked===false&&
    own.publicTurnRestrictions?.itemPlayLocked===false;
  const targets=op.bench.flatMap((pokemon,index)=>{
    if(!pokemon)return [];
    const energyCount=Array.isArray(pokemon.energies)?pokemon.energies.length:null;
    const printedRetreat=Array.isArray(pokemon.printed?.retreatCost)?
      pokemon.printed.retreatCost.length:null;
    return [{index,printing:pokemon.printing??null,
      energyCardCount:energyCount,printedRetreatSymbols:printedRetreat,
      potentialEnergyStrand:energyCount===0&&printedRetreat>0}];
  });
  const catcherOpportunity=behind&&heldCatcher&&itemNotLocked&&targets.length>0;
  const lillieIndex=view.ownHand.indexOf(LILLIE);
  const lillieOpportunity=lillieIndex>=0&&view.globalTurn>1&&
    r.supporterPlayedTurn===0&&r.supporterPlayLocked===false&&
    own.publicTurnRestrictions?.supporterPlayLocked===false&&
    (own.resolvingSupporter?.length??0)===0&&own.deckCount>0;
  const selectedLateSquawk=selectedIntent?.kind==='bench-basic'&&
    /^Squawkabilly ex (?:PAL|PAF)\b/.test(selectedIntent.printing??'')&&
    view.globalTurn>2;
  if(!catcherOpportunity&&!lillieOpportunity&&!selectedLateSquawk)return null;
  return {
    version:VERSION,actorSeat:view.actorSeat,globalTurn:view.globalTurn,
    ownerPrizeCount:own.prizeCount,opponentPrizeCount:op.prizeCount,
    ownerBehindOnPrizes:behind,
    ownerActiveEnergyCardCount:own.active.energies?.length??null,
    opponentActiveEnergyCardCount:op.active.energies?.length??null,
    catcher:{held:heldCatcher,handIndex:catcherIndex,
      paperPreconditionsVisible:catcherOpportunity,
      targetHypotheses:catcherOpportunity?targets:[],
      nativeCanPlayUnverified:true,promptTargetUnverified:true,
      tempoGainUnverified:true},
    lillie:{held:lillieIndex>=0,handIndex:lillieIndex,
      paperPreconditionsVisible:lillieOpportunity,
      nativeCanPlayUnverified:true,drawEffectUnverified:true},
    selectedLateSquawk:{present:selectedLateSquawk,
      printing:selectedLateSquawk?selectedIntent.printing:null,
      firstTurnOnlyAbilityExpired:selectedLateSquawk,
      printedTwoPrizeLiability:selectedLateSquawk,
      alternativeGameValueUnverified:true},
    causalOutcome:'unverified',competitiveGameQualified:false
  };
}

module.exports={VERSION,CATCHER,LILLIE,auditBehindResponse};
