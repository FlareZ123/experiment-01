'use strict';

const assert = require('node:assert/strict');
const {assessRequiredDeckPrinting} = require('./owner-k1-prize-knowledge.cjs');

/**
 * Conservative, actor-only branch preflight for a declared owner search plan.
 * A nonblocked branch is NOT declared legal, optimal or executable. The native
 * Store still verifies every action, payment, target and evolving condition.
 *
 * @param {object} view Genuine detached actorObservation at an owner root.
 * @param {object|null} knowledge Authenticated K1 snapshot or K0 null.
 * @param {{id:string,actionKind:'supporter'|'item'|'stadium'|'tool'|'energy'|'other',
 *   handPrintings?:string[],deckRequirements?:Array<{printing:string,copies:number}>,
 *   freeBenchNeeded?:number}} plan Strict declarative immediate plan.
 * @returns {{id:string,status:'blocked'|'not-disproven',reasons:object[],
 *   source:'actor-only-k0-k1',nativeLegalityCertified:false}}
 */
function preflightOwnerSearchPlan(view, knowledge, plan) {
  assert.equal(view?.decisionKind, 'owner-root');
  assert.ok(view.actorSeat===0 || view.actorSeat===1);
  assert.ok(typeof plan?.id==='string' && plan.id.length>0);
  assert.ok(['supporter','item','stadium','tool','energy','other']
    .includes(plan.actionKind));
  if (knowledge!==null) {
    assert.equal(knowledge.ownerSeat,view.actorSeat,
      'K1 must belong to this actual acting physical seat');
    assert.ok(knowledge.observedAt.turn<=view.globalTurn,
      'K1 observation cannot originate in the future');
  }
  const handPrintings=plan.handPrintings??[];
  const deckRequirements=plan.deckRequirements??[];
  const freeBenchNeeded=plan.freeBenchNeeded??0;
  assert.ok(Array.isArray(handPrintings) &&
    handPrintings.every(name=>typeof name==='string'&&name.length>0));
  assert.ok(Array.isArray(deckRequirements) &&
    deckRequirements.every(item=>typeof item.printing==='string'&&
      item.printing.length>0&&Number.isSafeInteger(item.copies)&&item.copies>0));
  assert.ok(Number.isSafeInteger(freeBenchNeeded)&&freeBenchNeeded>=0&&
    freeBenchNeeded<=5);
  const reasons=[];
  const ownHand=new Map();
  for(const name of view.ownHand)
    ownHand.set(name,(ownHand.get(name)??0)+1);
  const requiredHand=new Map();
  for(const name of handPrintings)
    requiredHand.set(name,(requiredHand.get(name)??0)+1);
  for(const [printing,copies] of requiredHand){
    if((ownHand.get(printing)??0)<copies)
      reasons.push({kind:'required-hand-printing-unavailable',printing,copies});
  }
  const available=view.ownPublic.bench.filter(slot=>slot===null).length;
  if(available<freeBenchNeeded)
    reasons.push({kind:'insufficient-public-bench-space',
      needed:freeBenchNeeded,available});
  const r=view.ownTurnResources;
  if(plan.actionKind==='supporter'){
    if(r.supporterPlayLocked===true)
      reasons.push({kind:'supporter-locked'});
    if(r.supporterPlayedTurn===view.globalTurn)
      reasons.push({kind:'supporter-quota-spent'});
  }
  if(plan.actionKind==='item'&&r.itemPlayLocked===true)
    reasons.push({kind:'item-locked'});
  if(plan.actionKind==='tool'&&r.toolPlayLocked===true)
    reasons.push({kind:'tool-locked'});
  if(plan.actionKind==='stadium'){
    if(r.stadiumPlayLocked===true)
      reasons.push({kind:'stadium-locked'});
    if(r.stadiumPlayedTurn===view.globalTurn)
      reasons.push({kind:'stadium-quota-spent'});
  }
  if(plan.actionKind==='energy'){
    if(r.energyPlayLocked===true)
      reasons.push({kind:'energy-locked'});
    if(r.energyPlayedTurn===view.globalTurn)
      reasons.push({kind:'energy-attachment-quota-spent'});
  }
  for(const requirement of deckRequirements){
    const {printing,copies}=requirement;
    if(knowledge?.exactMembershipKnown===true &&
      knowledge.deckMembershipStale===false){
      const availableCopies=knowledge.knownPrintings
        .find(row=>row.printing===printing)?.copies??0;
      if(availableCopies<copies)
        reasons.push({kind:'known-owner-deck-target-deficit',
          printing,needed:copies,available:availableCopies,
          prizeStatus:assessRequiredDeckPrinting(knowledge,printing)});
    }else if(assessRequiredDeckPrinting(knowledge,printing)==='known-prized'){
      reasons.push({kind:'all-registered-copies-known-prized',
        printing,needed:copies});
    }
  }
  return Object.freeze({
    id:plan.id,status:reasons.length>0?'blocked':'not-disproven',
    reasons:Object.freeze(reasons.map(row=>Object.freeze(row))),
    source:'actor-only-k0-k1',nativeLegalityCertified:false
  });
}

/**
 * Produce a complete status ledger, retaining blocked and untested plans.
 * Caller order records a declared choice preference, not a claim of optimality.
 * It cannot silently drop rare conditional or opponent-specific tactics.
 * @param {object} view Detached owner-root view.
 * @param {object|null} knowledge Authenticated K1 or K0 null.
 * @param {object[]} plans Declared plan alternatives.
 * @returns {{firstNotDisproven:string|null,ledger:object[],qualifiedGame:false}}
 */
function compareOwnerSearchPlans(view, knowledge, plans) {
  assert.ok(Array.isArray(plans)&&plans.length>0);
  const ids=plans.map(p=>p.id);
  assert.equal(new Set(ids).size,ids.length,'Plan IDs must be distinct');
  const ledger=plans.map(plan=>preflightOwnerSearchPlan(view,knowledge,plan));
  return {
    firstNotDisproven:ledger.find(row=>row.status==='not-disproven')?.id??null,
    ledger,qualifiedGame:false
  };
}

module.exports={preflightOwnerSearchPlan,compareOwnerSearchPlans};
