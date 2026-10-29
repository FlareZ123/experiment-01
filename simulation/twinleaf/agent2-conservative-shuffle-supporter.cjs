'use strict';

const assert=require('node:assert/strict');

const VERSION='agent2-actor-only-conservative-shuffle-supporter-v1';
const FAMILY=Object.freeze([
  {prefix:"Lillie's Determination ",kind:'lillie',
    maxOwnHand:3,minDrawAdvantage:3},
  {prefix:'Marnie ',kind:'marnie',
    maxOwnHand:3,minDrawAdvantage:3},
  {prefix:'Iono ',kind:'iono',
    maxOwnHand:3,minDrawAdvantage:3}
]);

/**
 * Independent public card effect estimates for shuffle-based Supporters.
 * Deliberately excludes Research, Juniper, Carmine and other discard-hand
 * Supporters: their DCI and lost singleton value demand separate reasoning.
 *
 * @param {object} view Frozen owner-only actorObservation.
 * @param {string} kind Supported printed Supporter effect family.
 * @returns {{ownDraw:number,opponentDraw:number}|null}
 */
function printedShuffleDrawCounts(view,kind){
  const own=view.ownPublic,opponent=view.opponentPublic;
  if(kind==='lillie')return {
    ownDraw:own.prizeCount===6?8:6,opponentDraw:0};
  if(kind==='marnie')return {ownDraw:5,opponentDraw:4};
  if(kind==='iono')return {
    ownDraw:own.prizeCount,opponentDraw:opponent.prizeCount};
  return null;
}

/**
 * Conservative actor-visible after-Pass Supporter candidate. The caller
 * independently verifies that all prior policy actions have been exhausted.
 * A hidden-deck optimal policy is outside this local printed access rule.
 *
 * @param {object} view Frozen actor-only observation.
 * @returns {{kind:'play-shuffle-supporter',handIndex:number,
 *   printing:string,family:string,drawEstimate:object,score:number}|null}
 */
function chooseConservativeShuffleSupporter(view){
  if(view?.decisionKind!=='owner-root')return null;
  if(view.globalTurn<=1)return null;
  const own=view.ownPublic,r=view.ownTurnResources;
  if(r?.supporterPlayLocked||own?.publicTurnRestrictions?.supporterPlayLocked)
    return null;
  if(r?.supporterPlayedTurn!==0)return null;
  if(own?.resolvingSupporter?.length>0)return null;
  const hand=view.ownHand;
  if(!Array.isArray(hand)||hand.length<1||hand.length>3)return null;
  if(!own?.active||!(own.deckCount>=5))return null;
  const opponent=view.opponentPublic;
  if(!opponent||!Number.isSafeInteger(opponent.handCount))return null;
  const candidates=[];
  for(let handIndex=0;handIndex<hand.length;handIndex++){
    const printing=hand[handIndex];
    for(const family of FAMILY){
      if(!printing.startsWith(family.prefix))continue;
      if(hand.length>family.maxOwnHand)continue;
      const counts=printedShuffleDrawCounts(view,family.kind);
      if(!counts||counts.ownDraw<=0||counts.ownDraw>own.deckCount)
        continue;
      if(family.kind!=='lillie'&&
        (counts.opponentDraw>opponent.deckCount||
         opponent.prizeCount<=0))continue;
      if(family.kind==='iono'&&counts.ownDraw<4)continue;
      // Marnie and Iono can increase the opponent's hand. Penalize that
      // public opportunity; do not reward purely speculative disruption.
      const opponentGain=family.kind==='lillie'?0:
        Math.max(0,counts.opponentDraw-opponent.handCount);
      const ownGain=counts.ownDraw-hand.length;
      const score=ownGain-opponentGain;
      if(score<family.minDrawAdvantage)continue;
      candidates.push({
        kind:'play-shuffle-supporter',handIndex,printing,
        family:family.kind,drawEstimate:{
          ownDraw:counts.ownDraw,opponentDraw:counts.opponentDraw,
          ownHandBefore:hand.length,opponentHandBefore:opponent.handCount
        },score
      });
    }
  }
  // Deterministic highest estimated net access. Prefer an owner-only draw
  // when the estimates tie to avoid an unnecessary opponent hand reset.
  candidates.sort((a,b)=>b.score-a.score||
    (a.family==='lillie'?-1:0)-(b.family==='lillie'?-1:0)||
    a.handIndex-b.handIndex);
  return candidates[0]??null;
}

module.exports={VERSION,FAMILY,printedShuffleDrawCounts,
  chooseConservativeShuffleSupporter};
