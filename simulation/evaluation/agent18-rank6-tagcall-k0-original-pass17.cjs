'use strict';

const assert=require('node:assert/strict');

/**
 * K0 conditional hypergeometric chance that at least one eligible copy is
 * still in an unsearched deck, conditioned on a known owner hand/public zones.
 * All unknown copies are assumed uniformly distributed between remaining
 * own deck and face-down Prize cards. This is a probability about hidden
 * zones, never a statement of actual physical K1 target availability.
 *
 * @param {{deckCount:number,prizeCount:number,eligibleUnseenCopies:number}} state
 * @returns {{probability:number,prizedOutProbability:number,guaranteedInDeck:number}}
 */
function conditionalK0DeckTargetProbability(state){
  const {deckCount,prizeCount,eligibleUnseenCopies}=state;
  for(const [name,value] of Object.entries(state)){
    assert.ok(Number.isSafeInteger(value)&&value>=0,name);
  }
  const unknown=deckCount+prizeCount;
  assert.ok(unknown>0);
  assert.ok(eligibleUnseenCopies<=unknown);
  let allPrized=1;
  for(let i=0;i<eligibleUnseenCopies;i++){
    if(i>=prizeCount){allPrized=0;break;}
    allPrized*=(prizeCount-i)/(unknown-i);
  }
  const guaranteedInDeck=Math.max(0,eligibleUnseenCopies-prizeCount);
  return {probability:1-allPrized,prizedOutProbability:allPrized,
    guaranteedInDeck};
}

/**
 * Freeze the observed genuine original source root17 hand / 46 deck / 6 Prize
 * facts separately from a hypothesis that two printed unexposed TAG TEAM
 * Supporter copies have their original random unseen positions.
 *
 * @returns {object} Developmental K0 conditional result; no native decisions.
 */
function rank6OriginalRoot17TagCallK0(){
  const state={deckCount:46,prizeCount:6,eligibleUnseenCopies:2};
  return {schema:'agent18-original-rank6-pass17-tagcall-k0-v1',
    sourceTrial:'6:101:B:champion-reference',
    sourceSeat:0,globalTurn:2,originalPassOrdinal:17,
    printedSourceTagCallCopies:2,observedHeldTagCallCopies:1,
    searchedPrinting:'Guzma & Hala CEC',
    observedOutsideUnknownZoneGuzmaHala:0,
    ...state,
    ...conditionalK0DeckTargetProbability(state),
    originalSourceNativeStoreSearchExecuted:false,
    actualPrizeIdentityKnownToSource:false,
    playedTagCallVerified:false,
    paperLegalSearchGuaranteed:false,
    supporterChoiceDominatesPassProven:false,
    competitivelyQualifiedGames:0};
}
module.exports={conditionalK0DeckTargetProbability,
  rank6OriginalRoot17TagCallK0};
