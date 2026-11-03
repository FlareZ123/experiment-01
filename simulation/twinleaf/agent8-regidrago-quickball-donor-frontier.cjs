'use strict';
const assert=require('node:assert/strict');

const VERSION='agent8-rank13-quickball-evolved-dragon-donor-v1';
const QUICK_BALLS=new Set(['Quick Ball FST','Quick Ball SSH']);
const REGIDRAGO_V='Regidrago V SIT';
// This is a source-13 hypothesis, not a general Dragon discard valuation.
const {ownerApexPublicGates}=
  require('../evaluation/agent8-rank13-apex-public-conjunction.cjs');
const {observeRank13PayloadOwnerOpportunity}=
  require('./agent8-rank13-payload-owner-opportunity.cjs');
const EVOLVED_DONORS=new Set([
  'Salamence ex JTG','Dragapult ex TWM','Noivern ex PAL'
]);

/**
 * Actor-only, default-off opening opportunity. Before a Regidrago V has
 * appeared, the source rank-13 hand may pay Quick Ball with a one-of
 * copyable evolved Dragon. Its disappearance from hand could eventually
 * help Apex Dragon, but the search target may be Prized or unavailable.
 * This function reads neither native deck contents nor Prize identities.
 *
 * @param {object} view Detached actor-owned owner-root observation
 * @returns {{kind:'play-quick-ball',handIndex:number,printing:string,
 *   donorPrinting:string,desiredTarget:string,source:'rank13-dragon-donor'}|null}
 */
function chooseRegidragoDonorQuickBall(view){
  assert.equal(view?.decisionKind,'owner-root');
  if(process.env.AGENT8_ESTABLISHED_QUICKBALL_DEV==='true'){
    const established=chooseEstablishedRegidragoQuickBall(view);
    if(established)return established;
  }
  const hand=view.ownHand,own=view.ownPublic,r=view.ownTurnResources;
  if(!Array.isArray(hand)||!Array.isArray(own?.bench)||
     own.bench.every(slot=>slot!==null)||!(own.deckCount>0)||
     r?.itemPlayLocked===true||r?.pokemonPlayLocked===true)return null;
  const regidragoEstablished=[own.active,...own.bench].some(slot=>
    slot?.printing===REGIDRAGO_V||
    slot?.printing==='Regidrago VSTAR SIT');
  if(regidragoEstablished||hand.includes(REGIDRAGO_V))return null;
  const index=hand.findIndex(name=>QUICK_BALLS.has(name));
  if(index<0)return null;
  // Leave the existing duplicate-first low-cost policy alone.
  const counts=new Map();
  for(let j=0;j<hand.length;j++){
    if(j===index||QUICK_BALLS.has(hand[j]))continue;
    counts.set(hand[j],(counts.get(hand[j])??0)+1);
  }
  if([...counts.values()].some(n=>n>=2))return null;
  const donor=hand.find(name=>EVOLVED_DONORS.has(name));
  if(!donor)return null;
  return {kind:'play-quick-ball',handIndex:index,printing:hand[index],
    donorPrinting:donor,desiredTarget:REGIDRAGO_V,
    source:'rank13-dragon-donor'};
}



/**
 * Owner-observable later-turn Quick Ball donor cost, usable only when an
 * already Active Regidrago VSTAR has necessary visible Apex Energy but no
 * Dragon donor in its physical discard. This does not infer hidden deck or
 * Prize contents and does not guarantee a playable search target.
 * @param {object} actor Detached acting owner's ordinary-turn observation.
 * @returns {object|null} Native-neutral play intent.
 */
function chooseEstablishedRegidragoQuickBall(actor){
  assert.equal(actor?.decisionKind,'owner-root');
  const own=actor.ownPublic,r=actor.ownTurnResources;
  if(own?.active?.printing!=='Regidrago VSTAR SIT'||r?.itemPlayLocked===true||
      r?.pokemonPlayLocked===true||!(own.deckCount>0)||
      own.bench.every(slot=>slot!==null))return null;
  const quick=actor.ownHand.findIndex(p=>QUICK_BALLS.has(p));
  const donor=actor.ownHand.find(p=>EVOLVED_DONORS.has(p));
  if(quick<0||!donor)return null;
  const publicApex=ownerApexPublicGates(
    observeRank13PayloadOwnerOpportunity(actor));
  if(!publicApex.printedColoredApexCostPossiblySatisfied||
      publicApex.publicDragonDiscardPayload)return null;
  return {
    kind:'play-quick-ball',handIndex:quick,printing:actor.ownHand[quick],
    donorPrinting:donor,desiredTarget:null,
    source:'rank13-established-donor',ownerVisible:true,
    actualNativePaymentAndSearchUnverified:true
  };
}

/**
 * The pinned Quick Ball reducer leaves its publicly played Item in the
 * actor's resolvingSupporter zone throughout the owner payment/search prompts.
 * The pure prompt decisions use this owner-visible provenance. Other Items'
 * discard prompts must not inherit the Regidrago-specific donor preference.
 * @param {object} input Detached actor-owned prompt input.
 * @returns {boolean}
 */
function activeQuickBallPrompt(input){
  return input?.actor?.decisionKind==='owner-prompt'&&
    input.actor.ownPublic?.resolvingSupporter?.some(printing=>
      QUICK_BALLS.has(printing))===true;
}

/**
 * Pure owner-hand mandatory Quick Ball payment selector. Native validation
 * remains the authoritative choice menu, and the adapter handles mapping
 * selected printings to physical card instances.
 * @param {object} input Detached owner-hand discard prompt.
 * @returns {{printings:string[]}|null}
 */
function chooseRegidragoQuickBallDiscard(input){
  if(!activeQuickBallPrompt(input)||
     input.prompt?.message!=='CHOOSE_CARD_TO_DISCARD'||
     input.prompt?.requiredCount!==1)return null;
  const own=input.actor.ownPublic;
  const alreadyEstablished=input.actor.ownHand.includes(REGIDRAGO_V)||
    [own.active,...own.bench].some(slot=>
      slot?.printing===REGIDRAGO_V||
      slot?.printing==='Regidrago VSTAR SIT');
  if(alreadyEstablished&&
     !(process.env.AGENT8_ESTABLISHED_QUICKBALL_DEV==='true'&&
       own.active?.printing==='Regidrago VSTAR SIT'&&
       !ownerApexPublicGates(observeRank13PayloadOwnerOpportunity(
         input.actor)).publicDragonDiscardPayload))return null;
  const donor=input.actor.ownHand.find(name=>
    EVOLVED_DONORS.has(name)&&
    input.prompt.menu.some(bundle=>bundle.length===1&&bundle[0]===name));
  return donor?{printings:[donor]}:null;
}

/**
 * Prefer the first Regidrago V after the legally paid Quick Ball search.
 * The owner is permitted to see all search offered printing identities,
 * while opponent-hidden and Prize identities remain inaccessible.
 * @param {object} input Detached authenticated owner-deck search prompt.
 * @returns {{indices:number[]}|null}
 */
function chooseRegidragoQuickBallSearch(input){
  if(!activeQuickBallPrompt(input)||
     input.prompt?.source!=='own-deck'||
     !['CHOOSE_CARD_TO_HAND','CHOOSE_CARD_FROM_DECK',
       'SEARCH_DECK_FOR_CARD'].includes(input.prompt?.message))return null;
  if(process.env.AGENT8_ESTABLISHED_QUICKBALL_DEV==='true'&&
     input.actor.ownPublic.active?.printing==='Regidrago VSTAR SIT')return null;
  const found=input.prompt.offered?.find(row=>
    row.printing===REGIDRAGO_V&&row.selectableAlone);
  return found?{indices:[found.index]}:null;
}

module.exports={VERSION,QUICK_BALLS,REGIDRAGO_V,EVOLVED_DONORS,
  chooseEstablishedRegidragoQuickBall,
  chooseRegidragoDonorQuickBall,activeQuickBallPrompt,
  chooseRegidragoQuickBallDiscard,chooseRegidragoQuickBallSearch};
