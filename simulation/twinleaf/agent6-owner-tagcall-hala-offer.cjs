'use strict';

const assert=require('node:assert/strict');

const VERSION='agent6-owner-tagcall-hala-k0-k1-offer-v2-optional-second-tagteam';
const TAG_CALL='Tag Call CEC';
const GUZMA_HALA='Guzma & Hala CEC';

/** @param {number} population @param {number} selected @returns {bigint} */
function binomial(population,selected){
  assert.ok(Number.isSafeInteger(population)&&population>=0);
  assert.ok(Number.isSafeInteger(selected));
  if(selected<0||selected>population)return 0n;
  let result=1n;
  for(let index=1;index<=Math.min(selected,population-selected);index++)
    result=result*BigInt(population-index+1)/BigInt(index);
  return result;
}

/**
 * Only public zones and the owner's private hand are admissible here.
 * The own deck and face-down Prize identities remain excluded at K0.
 * @param {object} view Detached actor observation.
 * @returns {string[]} All visible owner physical printings.
 */
function visibleOwnerPrintings(view){
  const own=view.ownPublic;
  const slots=[own.active,...(own.bench??[])].filter(Boolean);
  return [
    ...view.ownHand,
    ...(own.discard??[]),...(own.lostZone??[]),
    ...(own.stadium??[]),...(own.resolvingSupporter??[]),
    ...slots.flatMap(p=>[
      ...(p.evolutionPrintings??[]),...(p.energies??[]),...(p.tools??[])
    ])
  ];
}

/**
 * K0 uniform hidden-pool fraction. The exact-count computation is valid
 * for an initial uniformly randomized unseen deck-plus-Prizes population,
 * before choice-dependent unseen-card selection distorts its posterior.
 *
 * @param {number} unknownCopies The owner's unknown registered target copies.
 * @param {number} hiddenDeckCount Number of actual remaining deck cards.
 * @param {number} hiddenPrizeCount Number of face-down Prizes.
 * @returns {object|null} Conditional probability, or null without a valid
 *  uniform-pool physical population.
 */
function k0AtLeastOneInDeck(unknownCopies,hiddenDeckCount,hiddenPrizeCount){
  const values=[unknownCopies,hiddenDeckCount,hiddenPrizeCount];
  if(!values.every(n=>Number.isSafeInteger(n)&&n>=0)||
    unknownCopies>hiddenDeckCount+hiddenPrizeCount)return null;
  const unseen=hiddenDeckCount+hiddenPrizeCount;
  if(unseen===0)return {
    numerator:'0',denominator:'1',value:0,
    assumption:'uniform-initial-unseen-physical-pool'};
  const total=binomial(unseen,unknownCopies);
  const allPrized=binomial(hiddenPrizeCount,unknownCopies);
  return {
    numerator:String(total-allPrized),
    denominator:String(total),
    value:Number(total-allPrized)/Number(total),
    assumption:'uniform-initial-unseen-physical-pool'
  };
}

/**
 * Independent, source-agnostic owner-first-turn Tag Call -> G&H *offer*.
 * The owner may reason from its registered 60, own physical hand and public
 * zones. The returned estimate is never a claim that the deck contains the
 * target, that the Item is natively legal, or that the route is optimal.
 * Native Store must still accept root play and authenticated deck prompt.
 *
 * @param {object} view Detached, immutable actor observation.
 * @param {string[]|null} ownRegisteredSixty Actor's own known printed list.
 * @returns {object} A complete typed offer / blocked audit.
 */
function offerOwnerTagCallHala(view,ownRegisteredSixty){
  assert.equal(view?.decisionKind,'owner-root');
  const base={version:VERSION,eligible:false,blocker:null,
    action:null,sourceVisibility:'owner-K0',
    nativeLegality:'not-probed',nativeDispatchImplemented:false,
    competitivelyQualified:false};
  const blocked=blocker=>({...base,blocker});
  if(!Array.isArray(ownRegisteredSixty)||ownRegisteredSixty.length!==60||
    !ownRegisteredSixty.every(p=>typeof p==='string'))
    return blocked('missing-verified-own-registered-60');
  if(!view.ownPublic?.active||!Array.isArray(view.ownHand))
    return blocked('no-active-owner-view');
  if(view.globalTurn!==1&&view.globalTurn!==2)
    return blocked('outside-first-ordinary-turn');
  const handIndex=view.ownHand.indexOf(TAG_CALL);
  if(handIndex<0)return blocked('tag-call-not-held');
  if(view.ownHand.includes(GUZMA_HALA))
    return blocked('guzma-hala-already-held');
  const r=view.ownTurnResources??{};
  if(r.itemPlayLocked===true||
     view.ownPublic.publicTurnRestrictions?.itemPlayLocked===true)
    return blocked('owner-item-lock');
  const registeredTarget=ownRegisteredSixty.filter(x=>x===GUZMA_HALA).length;
  const registeredTag=ownRegisteredSixty.filter(x=>x===TAG_CALL).length;
  if(registeredTag<1||registeredTarget<1)
    return blocked('tag-or-target-not-in-owner-registered-60');
  const visible=visibleOwnerPrintings(view);
  const targetVisible=visible.filter(x=>x===GUZMA_HALA).length;
  if(targetVisible>registeredTarget)
    return blocked('inconsistent-owner-target-custody');
  const unknownCopies=registeredTarget-targetVisible;
  if(unknownCopies===0)
    return blocked('no-unaccounted-target-copy');
  let k0Probability=k0AtLeastOneInDeck(unknownCopies,
    view.ownPublic.deckCount,view.ownPublic.prizeCount);
  let knowledge='K0-unverified-search-target';
  if(view.ownerK1?.exactMembershipKnown===true){
    const known=view.ownerK1.knownPrintings;
    if(!Array.isArray(known))return blocked('K1-no-validated-membership');
    const searchable=known.filter(row=>row.printing===GUZMA_HALA)
      .reduce((sum,row)=>sum+row.copies,0);
    if(searchable<1)return blocked('K1-target-known-absent');
    k0Probability=null;
    knowledge='K1-target-known-in-owner-deck';
  }
  // A first-turn Tag Call is allowed as an Item, including going first.
  // G&H normally cannot be used by the first player in that same turn.
  return {...base,eligible:true,blocker:null,
    action:{kind:'play-tag-call-hala-search',handIndex,
      printing:TAG_CALL,targetPrinting:GUZMA_HALA,
      nativeDispatchImplemented:false},
    ownerKnownRemainingTargetCopies:unknownCopies,
    targetDeckPresence:k0Probability,
    sourceVisibility:knowledge,
    intendedLine:'bank-or-obtain-guzma-hala-supporter',
    resourceOpportunityCost:'one Tag Call, one possible TAG TEAM search, future Supporter and discard costs',
    consequence:'target and second card choice require accepted native owner-deck prompt',
    reason:'owner-registered-target-and-held-tag-first-ordinary-turn'};
}

/**
 * Pure K1 selection at a genuine, already Store-authenticated Tag Call
 * owner-deck ChooseCardsPrompt. The provenance object must be created by
 * the native adapter from a real accepted owner Tag Call root, never by
 * an opponent- or speculative-policy scorer.
 *
 * @param {object} input actorSingleSearchInput detached prompt menu.
 * @param {object} provenance Trusted native root-to-prompt receipt.
 * @param {{secondaryTagTeamPriority?:string[]}} [options] Optional K1
 *  native-menu-validated second TAG TEAM target priority; default single G&H.
 * @returns {{indices:number[]}|{printings:string[]}|null}
 */
function chooseAuthenticatedTagCallHala(input,provenance,options={}){
  if(input?.actor?.decisionKind!=='owner-prompt'||
    input.prompt?.source!=='own-deck'||
    input.prompt?.message!=='CHOOSE_CARD_TO_HAND'||
    provenance?.acceptedNativeTagCall!==true||
    provenance?.actorSeat!==input.actor.actorSeat||
    provenance?.originPrinting!==TAG_CALL||
    provenance?.ownerPromptId!==input.prompt.id)
    return null;
  if(Array.isArray(input.prompt.bundles)){
    // Additional TAG TEAM cards can supply one extra physical discard to
    // G&H's optional two-card search payment, but can also be strategically
    // protected resources. Never select a second card by default: the owner
    // policy must explicitly request and justify its opportunity cost.
    for(const printing of options.secondaryTagTeamPriority??[]){
      if(typeof printing!=='string'||printing===GUZMA_HALA)continue;
      const pair=input.prompt.bundles.find(bundle=>
        bundle.printings.length===2&&
        bundle.printings.includes(GUZMA_HALA)&&
        bundle.printings.includes(printing));
      if(pair)return {printings:[...pair.printings]};
    }
    const singles=input.prompt.bundles.find(bundle=>
      bundle.printings.length===1&&bundle.printings[0]===GUZMA_HALA);
    if(singles)return {printings:[GUZMA_HALA]};
    const other=input.prompt.bundles.find(bundle=>
      bundle.printings.includes(GUZMA_HALA));
    return other?{printings:[...other.printings]}:null;
  }
  const entry=input.prompt.offered?.find(row=>
    row.printing===GUZMA_HALA&&row.selectableAlone===true);
  return entry?{indices:[entry.index]}:null;
}

module.exports={VERSION,TAG_CALL,GUZMA_HALA,
  binomial,visibleOwnerPrintings,k0AtLeastOneInDeck,
  offerOwnerTagCallHala,chooseAuthenticatedTagCallHala};
