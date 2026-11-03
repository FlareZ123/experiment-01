'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent11-owner-resource-tutor-planner-v1';
const TARGETS = Object.freeze({
  'Battle VIP Pass FST': Object.freeze({family:'Basic',capacity:2,window:'first-owner-turn'}),
  "Professors Letter BKT": Object.freeze({family:'Basic Energy',capacity:2,window:'any-turn'}),
  'Energy Search SVI': Object.freeze({family:'Basic Energy',capacity:1,window:'any-turn'}),
  'Energy Search SSH': Object.freeze({family:'Basic Energy',capacity:1,window:'any-turn'})
});

/**
 * K0 lower bound from the registered 60 and only owner-visible zones.
 * The unknown Prize identities are adversarially assigned before assuming a
 * search target survives. Own deck order or opponent concealed data are never read.
 * @param {object} view Detached owner root observation.
 * @param {string[]} registeredSixty Original exact-printing 60.
 * @param {Set<string>} targetPrintings Public target print catalog.
 * @returns {{registered:number,visibleOutsideDeck:number,unknownPrizes:number,minimumInDeck:number,reconciled:boolean}}
 */
function guaranteedK0DeckTargets(view,registeredSixty,targetPrintings) {
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(Array.isArray(registeredSixty) && registeredSixty.length === 60);
  assert.ok(targetPrintings instanceof Set);
  const own=view.ownPublic;
  const outside=[...view.ownHand,...(own.discard??[]),...(own.lostZone??[]),
    ...(own.resolvingSupporter??[]),
    ...[own.active,...(own.bench??[])].filter(Boolean).flatMap(slot=>[
      ...(slot.evolutionPrintings??[]),...(slot.energies??[]),...(slot.tools??[])
    ])];
  const roster=new Map(),visible=new Map();
  for(const printing of registeredSixty){
    if(targetPrintings.has(printing))roster.set(printing,(roster.get(printing)??0)+1);
  }
  for(const printing of outside){
    if(targetPrintings.has(printing))visible.set(printing,(visible.get(printing)??0)+1);
  }
  const registered=[...roster.values()].reduce((sum,n)=>sum+n,0);
  const visibleOutsideDeck=[...visible.values()].reduce((sum,n)=>sum+n,0);
  const unknownPrizes=own.prizeCount;
  const reconciled=Number.isSafeInteger(unknownPrizes)&&unknownPrizes>=0&&
    [...visible].every(([printing,n])=>n<=(roster.get(printing)??0));
  return {
    registered,visibleOutsideDeck,unknownPrizes,
    minimumInDeck:reconciled?Math.max(0,registered-visibleOutsideDeck-unknownPrizes):0,
    reconciled
  };
}

/**
 * Pure, owner-information-only Item planner. Runs only after the common actor
 * has proposed Pass; already selected attacks and paid actions win by default.
 * This is a deliberately small reusable two-family candidate arbitration,
 * not a complete strategic Trainer solver or proof of native prompt fidelity.
 * @param {object} view Frozen actor observation.
 * @param {object} catalog Public actor printing catalog with two target Sets.
 * @param {string[]} registeredSixty Exact registered own 60; never physical deck contents.
 * @param {object} incumbent Existing actor intent.
 * @returns {object} Full opportunity ledger and selected native-neutral intent.
 */
function planOwnerResourceTutors(view,catalog,registeredSixty,incumbent) {
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(catalog?.basics instanceof Set && catalog.basicEnergies instanceof Set);
  assert.equal(registeredSixty?.length,60);
  assert.ok(incumbent && typeof incumbent.kind==='string');
  const own=view.ownPublic,r=view.ownTurnResources;
  const allowedToChallenge=incumbent.kind==='pass';
  const blocked=r.itemPlayLocked===true||own.publicTurnRestrictions?.itemPlayLocked===true;
  const benchOpen=(own.bench??[]).some(slot=>slot===null);
  const hasPokemon=Boolean(own.active)||(own.bench??[]).some(Boolean);
  const basicTarget=guaranteedK0DeckTargets(view,registeredSixty,catalog.basics);
  const energyTarget=guaranteedK0DeckTargets(view,registeredSixty,catalog.basicEnergies);
  const ownHeldEnergy=view.ownHand.some(printing=>catalog.basicEnergies.has(printing));
  const canAttachEnergy=r.energyPlayLocked!==true&&
    own.publicTurnRestrictions?.energyPlayLocked!==true&&
    r.energyPlayedTurn!==view.globalTurn;
  const opportunities=[];
  for(let handIndex=0;handIndex<view.ownHand.length;handIndex++){
    const printing=view.ownHand[handIndex];
    const spec=TARGETS[printing];
    if(!spec)continue;
    let exclusion=null;
    if(!allowedToChallenge)exclusion='incumbent-nonpass-priority';
    else if(blocked)exclusion='item-play-locked';
    else if(own.deckCount===0)exclusion='no-searchable-deck';
    else if(spec.family==='Basic'){
      if(![1,2].includes(view.globalTurn))exclusion='vip-window-closed';
      else if(!benchOpen)exclusion='no-bench-slot';
      else if(basicTarget.minimumInDeck===0)exclusion='no-k0-guaranteed-basic';
    }else{
      if(!hasPokemon||!canAttachEnergy)exclusion='no-immediate-attachment-window';
      else if(ownHeldEnergy)exclusion='already-holds-basic-energy';
      else if(energyTarget.minimumInDeck===0)exclusion='no-k0-guaranteed-energy';
    }
    opportunities.push({handIndex,printing,family:spec.family,
      capacity:spec.capacity,window:spec.window,
      targetLowerBound:spec.family==='Basic'?basicTarget.minimumInDeck:
        energyTarget.minimumInDeck,
      paperEligibility:exclusion===null?'conditional-k0-resource-certified':'unselected',
      exclusion,requiresDiscard:false,promptSettlementProven:false});
  }
  const viable=opportunities.filter(op=>op.exclusion===null);
  viable.sort((a,b)=>{
    const aVip=a.family==='Basic'?1:0,bVip=b.family==='Basic'?1:0;
    return bVip-aVip||b.capacity-a.capacity||a.handIndex-b.handIndex;
  });
  const chosen=viable[0]??null;
  return {
    version:VERSION,
    selected:chosen?{
      kind:'play-owner-resource-tutor',handIndex:chosen.handIndex,
      printing:chosen.printing,family:chosen.family
    }:null,
    opportunities,guaranteedTargets:{Basic:basicTarget,BasicEnergy:energyTarget},
    arbiterPolicy:'preserve-all-nonpass-common-actor-intents; VIP-window; capacity; hand-order',
    ownerOnly:true,discardCostClaim:'zero-for-the-whitelisted-printings',
    nativePlayNotYetProven:true,searchPromptNotYetProven:true,
    opponentContinuationNotYetProven:true,competitiveGameQualified:false
  };
}

module.exports={VERSION,TARGETS,guaranteedK0DeckTargets,planOwnerResourceTutors};
