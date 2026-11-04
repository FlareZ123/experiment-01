'use strict';

const assert=require('node:assert/strict');

const VERSION='agent2-actor-only-conservative-shuffle-supporter-v4-partial-both-draws';
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
 * @returns {{ownDraw:number|null,opponentDraw:number|null,conditionalDrawTriggered?:null,unresolvedReason?:string}|null}
 */
function printedShuffleDrawCounts(view,kind){
  const own=view.ownPublic,opponent=view.opponentPublic;
  if(kind==='lillie')return {
    ownDraw:own.prizeCount===6?8:6,opponentDraw:0};
  if(kind!=='marnie'&&kind!=='iono')return null;
  // The played Supporter has left the owner's hand. Opponent public hand
  // count alone cannot prove movement because Dew Guard may protect it.
  const ownerMoved=view.ownHand.length>1;
  if(!ownerMoved&&opponent.handCount>0)return {
    ownDraw:null,opponentDraw:null,conditionalDrawTriggered:null,
    unresolvedReason:'opponent-hand-movement-not-certified'};
  const anyCardMoved=ownerMoved;
  if(kind==='marnie')return anyCardMoved?
    {ownDraw:5,opponentDraw:4}:{ownDraw:0,opponentDraw:0};
  if(kind==='iono')return anyCardMoved?
    {ownDraw:own.prizeCount,opponentDraw:opponent.prizeCount}:
    {ownDraw:0,opponentDraw:0};
  return null;
}

/**
 * Enumerate conservative actor-visible low-hand Supporter offers to permit
 * explicit contention with attack, setup and resource-hold alternatives.
 * Offers are heuristic and NOT native/paper legality certifications.
 * A hidden-deck optimal policy is outside this local printed access rule.
 *
 * @param {object} view Frozen actor-only observation.
 * @returns {Array<{kind:'play-shuffle-supporter',handIndex:number,
 *   printing:string,family:string,drawEstimate:object,score:number}>}
 */
function enumerateConservativeShuffleSupporterOffers(view){
  if(view?.decisionKind!=='owner-root')return [];
  if(view.globalTurn<=1)return [];
  const own=view.ownPublic,r=view.ownTurnResources;
  if(r?.supporterPlayLocked||own?.publicTurnRestrictions?.supporterPlayLocked)
    return [];
  if(r?.supporterPlayedTurn!==0)return [];
  if(own?.resolvingSupporter?.length>0)return [];
  const hand=view.ownHand;
  if(!Array.isArray(hand)||hand.length<1||hand.length>3)return [];
  if(!own?.active||!Number.isSafeInteger(own.deckCount)||
      own.deckCount<0)return [];
  const opponent=view.opponentPublic;
  if(!opponent||!Number.isSafeInteger(opponent.handCount)||
      !Number.isSafeInteger(opponent.deckCount)||
      opponent.handCount<0||opponent.deckCount<0)return [];
  const candidates=[];
  // These Supporters return remaining hand cards before drawing. Count
  // physical cards after the Supporter itself leaves the owner's hand;
  // opponent-hand identities remain concealed and are never needed.
  const ownDeckAfterReturn=own.deckCount+hand.length-1;
  const opponentDeckAfterReturn=opponent.deckCount+opponent.handCount;
  for(let handIndex=0;handIndex<hand.length;handIndex++){
    const printing=hand[handIndex];
    for(const family of FAMILY){
      if(!printing.startsWith(family.prefix))continue;
      if(hand.length>family.maxOwnHand)continue;
      const counts=printedShuffleDrawCounts(view,family.kind);
      if(!counts||counts.ownDraw===null||counts.ownDraw<=0)continue;
      // A requested draw larger than the owner's available deck resolves
      // using the cards that exist; the printed request is not a payment.
      const ownMaxActualDraw=Math.min(counts.ownDraw,ownDeckAfterReturn);
      if(ownMaxActualDraw===0)continue;
      if(family.kind!=='lillie'&&opponent.prizeCount<=0)continue;
      if(family.kind==='iono'&&ownMaxActualDraw<4)continue;
      // Printed opponent draw is a request, not an eligibility minimum:
      // when fewer cards are available, that player draws what remains.
      // An opponent with no deck and no hand may draw zero. Hand protection
      // can reduce actual returned cards, so this upper bound is deliberately
      // conservative without consulting hidden card identities.
      const opponentMaxActualDraw=family.kind==='lillie'?0:
        Math.min(counts.opponentDraw,opponentDeckAfterReturn);
      const opponentGain=Math.max(0,
        opponentMaxActualDraw-opponent.handCount);
      const ownGain=ownMaxActualDraw-hand.length;
      const score=ownGain-opponentGain;
      if(score<family.minDrawAdvantage)continue;
      candidates.push({
        kind:'play-shuffle-supporter',handIndex,printing,
        family:family.kind,drawEstimate:{
          ownDraw:counts.ownDraw,opponentDraw:counts.opponentDraw,
          ...(ownMaxActualDraw<counts.ownDraw?
            {ownDrawCapacityBound:ownMaxActualDraw}:{}),
          ...(opponentMaxActualDraw<counts.opponentDraw?
            {opponentDrawCapacityBound:opponentMaxActualDraw}:{}),
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
  return candidates;
}


/**
 * Preserve the existing deterministic selector for all callers and controls.
 * The complete offer set is now available for shared owner-root arbitration.
 * @param {object} view Owner-only detached game observation.
 * @returns {object|null} Existing conservative preferred intent.
 */
function chooseConservativeShuffleSupporter(view){
  return enumerateConservativeShuffleSupporterOffers(view)[0]??null;
}
module.exports={VERSION,FAMILY,printedShuffleDrawCounts,
  enumerateConservativeShuffleSupporterOffers,
  chooseConservativeShuffleSupporter};
