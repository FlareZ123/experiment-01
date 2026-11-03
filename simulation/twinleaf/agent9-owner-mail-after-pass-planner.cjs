'use strict';

const assert=require('node:assert/strict');
const {ownerTrainerOpportunity}=
  require('./agent5-generic-owner-trainer-opportunity.cjs');

const VERSION='agent9-owner-mail-after-pass-planner-v1';
const PRINTING="Trainers' Mail ROS";

/**
 * A rigorous minimum number of source-owned eligible Trainer cards that must
 * remain in the owner's deck, based only on the complete registered 60, public
 * CardManager printing metadata, and the owner's visible deck size.
 *
 * It assumes the registered 60 has not changed ownership or been augmented.
 * It makes NO assertion that any qualifying Trainer appears among the top
 * four cards and does not look at deck order, Prize identities or hidden hands.
 *
 * @param {string[]} registeredSixty Immutable physical source 60.
 * @param {number} ownDeckCount Public deck size from actor observation.
 * @param {Map<string,{name:string,type:string}>} trainerCatalog Public metadata.
 * @returns {{registeredEligible:number,minimumInDeck:number,maximumInDeck:number,deckSize:number,topFourHitProven:boolean}}
 */
function sourceMailTargetBounds(registeredSixty,ownDeckCount,trainerCatalog){
  assert.ok(Array.isArray(registeredSixty)&&registeredSixty.length===60);
  assert.ok(registeredSixty.every(p=>typeof p==='string'&&p.length>0));
  assert.ok(Number.isSafeInteger(ownDeckCount)&&
    ownDeckCount>=0&&ownDeckCount<=60);
  assert.ok(trainerCatalog instanceof Map);
  const eligible=registeredSixty.filter(printing=>{
    const metadata=trainerCatalog.get(printing);
    return metadata&&metadata.name!=="Trainers' Mail";
  }).length;
  const outsideDeck=60-ownDeckCount;
  const minimum=Math.max(0,eligible-outsideDeck);
  const maximum=Math.min(eligible,ownDeckCount);
  // If more than deckSize-4 cards are known to be eligible, the top four
  // must contain one, regardless of hidden deck order.
  const window=Math.min(4,ownDeckCount);
  const guaranteedHit=window>0&&ownDeckCount-minimum<window;
  return {
    registeredEligible:eligible,
    minimumInDeck:minimum,maximumInDeck:maximum,deckSize:ownDeckCount,
    topFourHitProven:guaranteedHit
  };
}

/**
 * A deliberately small owner-information-only alternative to native
 * speculative Trainer preference. It challenges an unsupported Pass only.
 * A positive result is an owner's physical, generically unblocked Item
 * *candidate*, and never a proven best line, paid prompt or legal resolved
 * game state.
 *
 * @param {object} view Detached acting-owner observation.
 * @param {Map<string,{name:string,type:string}>} trainerCatalog Public metadata.
 * @param {string[]} registeredSixty Immutable exact original own 60.
 * @param {object} incumbent Selected common actor intent.
 * @returns {object} Full diagnostic with one optional candidate.
 */
function planOwnerMailAfterPass(view,trainerCatalog,registeredSixty,incumbent){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(trainerCatalog instanceof Map);
  assert.ok(Array.isArray(view.ownHand));
  assert.ok(incumbent&&typeof incumbent.kind==='string');
  const bounds=sourceMailTargetBounds(
    registeredSixty,view.ownPublic.deckCount,trainerCatalog);
  const frontier=ownerTrainerOpportunity(view,trainerCatalog);
  const opportunities=[];
  for(const row of frontier.rows){
    if(row.printing!==PRINTING)continue;
    assert.equal(row.type,'Item');
    let exclusion=null;
    if(incumbent.kind!=='pass')exclusion='preserve-selected-nonpass';
    else if(row.publicBlocker)exclusion=row.publicBlocker;
    else if(bounds.deckSize===0)exclusion='empty-deck';
    else if(bounds.minimumInDeck===0)
      exclusion='source-count-does-not-guarantee-a-deck-target';
    opportunities.push({
      handIndex:row.handIndex,printing:row.printing,
      exclusion,minimumEligibleTargets:bounds.minimumInDeck,
      guaranteedTopFourHit:bounds.topFourHitProven
    });
  }
  const chosen=opportunities.find(row=>row.exclusion===null);
  return {
    version:VERSION,ownerOnly:true,
    selected:chosen?{
      kind:'play-owner-mail',handIndex:chosen.handIndex,
      printing:chosen.printing
    }:null,
    opportunities,targetBounds:bounds,
    preservesExistingNonpass:true,
    choiceRule:'first held Mail after unsupported Pass with source-count-confirmed deck target',
    topFourSelectionUnresolved:true,paperItemEffectUnverified:true,
    promiseOfStrategicBenefit:false,nativeStoreOutcomeUnverified:true,
    competitiveGamesQualified:0
  };
}

module.exports={
  VERSION,PRINTING,sourceMailTargetBounds,planOwnerMailAfterPass
};
