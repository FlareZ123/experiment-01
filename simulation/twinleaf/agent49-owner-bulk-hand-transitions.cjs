'use strict';

const assert = require('node:assert/strict');

// Exact source printings checked against the bundled English card database.
// The Supporter is removed from the hand before its printed effect resolves.
// "Discard your hand" and "shuffle your hand into your deck" therefore
// transform the OTHER currently held cards, including protected singletons.
// These effects are not additional activation payments and do not prove that
// playing the Supporter would be legal, beneficial or native-settled.
const BULK_HAND_PRINTS = Object.freeze({
  'Carmine TWM': Object.freeze({
    sourceId:'sv6-145',moveTo:'discard',baseDraw:5
  }),
  "Professor's Research JTG": Object.freeze({
    sourceId:'sv9-155',moveTo:'discard',baseDraw:7
  }),
  'Professor Sycamore BKP': Object.freeze({
    sourceId:'xy9-107',moveTo:'discard',baseDraw:7
  }),
  "Lillie's Determination MEG": Object.freeze({
    sourceId:'me1-119',moveTo:'deck',baseDraw:6,
    sixRemainingPrizesDraw:8
  }),
  'N FCO': Object.freeze({
    sourceId:'xy10-105',moveTo:'deck',drawFromOwnPrizes:true,
    affectsOpponentHand:true
  }),
  'Marnie SSH': Object.freeze({
    sourceId:'swsh1-169',moveTo:'deck-bottom',baseDraw:5,
    drawOnlyIfEitherPlayerMoved:true,affectsOpponentHand:true
  }),
  'Iono PAL': Object.freeze({
    sourceId:'sv2-185',moveTo:'deck-bottom',drawFromOwnPrizes:true,
    drawOnlyIfEitherPlayerMoved:true,affectsOpponentHand:true
  })
});

const VERSION='agent49-owner-bulk-hand-transform-v2-sevenprint-dewguard-unknown';

/**
 * Describe the complete compulsory remaining-hand transition of one printed
 * Supporter, using only the real acting owner's hand, public Prize count and
 * optional explicitly protected owner-hand indices. No game action is taken.
 *
 * @param {object} view Authenticated detached owner-root observation.
 * @param {{handIndex:number,printing:string,type:string}} row Held Trainer row.
 * @param {Set<number>} [protectedIndices] Owner's tactical hold set.
 * @returns {object} Read-only opportunity-cost observation.
 */
function ownerBulkHandTransition(view,row,protectedIndices=new Set()){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(view.actorSeat===0||view.actorSeat===1);
  assert.ok(Array.isArray(view.ownHand));
  assert.ok(Number.isSafeInteger(row?.handIndex)&&row.handIndex>=0&&
    row.handIndex<view.ownHand.length);
  assert.equal(row.printing,view.ownHand[row.handIndex]);
  assert.ok(protectedIndices instanceof Set);
  assert.ok([...protectedIndices].every(i=>Number.isSafeInteger(i)&&
    i>=0&&i<view.ownHand.length));
  const rule=Object.hasOwn(BULK_HAND_PRINTS,row.printing)?
    BULK_HAND_PRINTS[row.printing]:null;
  const common={
    version:VERSION,printing:row.printing,handIndex:row.handIndex,
    knownBulkHandEffect:rule!==null,
    sourceCardId:rule?.sourceId??null,
    readOnly:true,ownerHandOnly:true,opponentConcealedUsed:false,
    effectIsNotActivationPayment:true,
    paperPlayabilityCertified:false,nativeSettlementCertified:false,
    strategicBenefitCertified:false,
    unmarkedHandCardStrategicValue:'unassessed',
    protectedMarkersAreSelectiveRatherThanComplete:true,
    sourceSupporterIndexWasMarkedProtected:protectedIndices.has(row.handIndex)
  };
  if(!rule)return {...common,status:'unmodeled-printing'};
  assert.equal(row.type,'Supporter','Bulk source printing must be a Supporter');
  const moved=view.ownHand.flatMap((printing,i)=>i===row.handIndex?[]:
    [{handIndex:i,printing,protected:protectedIndices.has(i)}]);
  const prizeCount=view.ownPublic?.prizeCount;
  assert.ok(prizeCount===undefined||prizeCount===null||
    (Number.isSafeInteger(prizeCount)&&prizeCount>=0&&prizeCount<=6));
  const hasPublicPrizeCount=Number.isSafeInteger(prizeCount);
  const opponentHandCount=rule.drawOnlyIfEitherPlayerMoved?
    view.opponentPublic?.handCount:undefined;
  const opponentPublicCountKnown=rule.drawOnlyIfEitherPlayerMoved===true&&
    Number.isSafeInteger(opponentHandCount)&&opponentHandCount>=0;
  const drawTriggered=!rule.drawOnlyIfEitherPlayerMoved?true:
    moved.length>0?true:
      opponentPublicCountKnown&&opponentHandCount===0?false:null;
  const baseDraw=rule.drawFromOwnPrizes?
    hasPublicPrizeCount?prizeCount:null:
    rule.sixRemainingPrizesDraw===undefined?rule.baseDraw:
      hasPublicPrizeCount?
        prizeCount===6?rule.sixRemainingPrizesDraw:rule.baseDraw:null;
  const draw=drawTriggered===false?0:
    drawTriggered===true?baseDraw:null;
  return {
    ...common,status:'printed-bulk-transition-observed',
    destination:rule.moveTo,
    movedHandCopies:moved,
    movedHandCount:moved.length,
    protectedMovedIndices:moved.filter(c=>c.protected).map(c=>c.handIndex),
    protectedMovedCount:moved.filter(c=>c.protected).length,
    drawnCardCountRequested:draw,
    conditionalDrawTriggered:drawTriggered,
    affectsOpponentHand:Boolean(rule.affectsOpponentHand),
    opponentPublicHandCountKnown:opponentPublicCountKnown,
    conditionalPrizeDrawCount:
      rule.sixRemainingPrizesDraw===undefined?null:{
        remainingPrizeCountForBonus:6,
        bonusDraw:rule.sixRemainingPrizesDraw,
        publicPrizeCountKnown:hasPublicPrizeCount
      },
    actualDrawnCardsUnknown:true,
    physicalZoneTransitionUnverified:true,
    returnedToDeckRatherThanDiscard:rule.moveTo!=='discard',
    specificDeckDestination:rule.moveTo
  };
}

/**
 * Summarize print-verified entire-hand loss on one genuine owner action root.
 * This is independent of fixed-cardinality payment opportunities.
 * @param {object} view
 * @param {object[]} rows
 * @param {Set<number>} [protectedIndices]
 * @returns {object}
 */
function summarizeOwnerBulkHandTransitions(view,rows,
  protectedIndices=new Set()){
  assert.ok(Array.isArray(rows));
  const seen=new Set();
  const transitions=rows.map(row=>{
    assert.ok(!seen.has(row.handIndex));
    seen.add(row.handIndex);
    return ownerBulkHandTransition(view,row,protectedIndices);
  }).filter(row=>row.knownBulkHandEffect);
  return {
    version:VERSION,actorSeat:view.actorSeat,globalTurn:view.globalTurn,
    knownBulkHandTrainerCopies:transitions.length,
    discardEntireHandCandidates:transitions.filter(x=>
      x.destination==='discard').length,
    shuffleEntireHandCandidates:transitions.filter(x=>
      x.destination!=='discard').length,
    bottomOfDeckHandCandidates:transitions.filter(x=>
      x.destination==='deck-bottom').length,
    summedOtherHandCopiesExposedAcrossAlternatives:transitions.reduce(
      (n,x)=>n+x.movedHandCount,0),
    summedProtectedCopiesExposedAcrossAlternatives:transitions.reduce(
      (n,x)=>n+x.protectedMovedCount,0),
    countsAreCompetingHypotheticalAlternatives:true,
    settledZoneTransitionsCertified:false,
    competitiveGameQualified:false,
    rows:transitions
  };
}

module.exports={VERSION,BULK_HAND_PRINTS,ownerBulkHandTransition,
  summarizeOwnerBulkHandTransitions};
