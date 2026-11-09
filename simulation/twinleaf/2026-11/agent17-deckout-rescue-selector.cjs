'use strict';

const VERSION='agent17-owner-only-anti-deckout-shuffle-v1';
const SHUFFLE=Object.freeze([
  {prefix:'Iono ',family:'iono'},
  {prefix:'Marnie ',family:'marnie'},
  {prefix:"Lillie's Determination ",family:'lillie'}
]);

/**
 * A strictly owner-visible, post-Pass emergency use of a shuffle Supporter.
 * This preserves physical deck cards for a later mandatory turn draw.
 * It is an opportunity estimate, not a Store or paper legality verdict.
 *
 * @param {object} view Frozen actorObservation from the acting player's seat.
 * @returns {object|null} Existing Agent2 native adapter-compatible intent.
 */
function chooseDeckoutRescue(view){
  if(view?.decisionKind!=='owner-root'||view.globalTurn<=1)return null;
  const own=view.ownPublic;
  const resource=view.ownTurnResources;
  const hand=view.ownHand;
  if(!Array.isArray(hand)||hand.length<2||
     !Number.isSafeInteger(own?.deckCount)||
     own.deckCount<0||own.deckCount>2||
     !Number.isSafeInteger(own.prizeCount)||
     own.prizeCount<1||own.prizeCount>6||
     !own.active||
     resource?.supporterPlayedTurn!==0||
     resource?.supporterPlayLocked||
     own.publicTurnRestrictions?.supporterPlayLocked||
     own.resolvingSupporter?.length>0)return null;

  // The Supporter has left the hand before any other hand cards return.
  // The owner knows both quantities without inspecting deck identities.
  const afterReturn=own.deckCount+hand.length-1;
  const offers=[];
  for(let index=0;index<hand.length;index++){
    const printing=hand[index];
    if(typeof printing!=='string')continue;
    for(const candidate of SHUFFLE){
      if(!printing.startsWith(candidate.prefix))continue;
      const requestedDraw=candidate.family==='iono'?own.prizeCount:
        candidate.family==='marnie'?5:
          own.prizeCount===6?8:6;
      const actualDraw=Math.min(requestedDraw,afterReturn);
      const survivingDeck=afterReturn-actualDraw;
      // A shuffle which leaves no additional physical draw is not a
      // deckout rescue, even if it refreshes the hand this turn.
      if(actualDraw===0||survivingDeck<=own.deckCount)continue;
      offers.push({
        kind:'play-shuffle-supporter',handIndex:index,
        printing,family:candidate.family,
        score:survivingDeck-own.deckCount,
        drawEstimate:{
          ownDraw:requestedDraw,ownDrawCapacityBound:actualDraw,
          ownHandBefore:hand.length,
          ownDeckBefore:own.deckCount,
          ownDeckAfterReturn:afterReturn,
          ownDeckAfterDraw:survivingDeck,
          preservedFutureTurnDraws:survivingDeck
        }
      });
    }
  }
  offers.sort((a,b)=>
    b.drawEstimate.ownDeckAfterDraw-a.drawEstimate.ownDeckAfterDraw||
    b.drawEstimate.ownDrawCapacityBound-a.drawEstimate.ownDrawCapacityBound||
    a.handIndex-b.handIndex);
  return offers[0]??null;
}

module.exports={VERSION,SHUFFLE,chooseDeckoutRescue};
