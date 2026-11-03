'use strict';

const assert = require('node:assert/strict');
const {combinations} =
  require('../agent27-owner-trainer-discard-contention.cjs');

const VERSION = 'owner-hand-discard-payment-pareto-v1';

/** @param {Set<number>} indexes @param {number} length */
function checkIndices(indexes, length) {
  assert.ok(indexes instanceof Set);
  for (const i of indexes)
    assert.ok(Number.isSafeInteger(i) && i >= 0 && i < length);
}

/**
 * A pure, owner-hand-only first-payment frontier. Each result groups exactly
 * equivalent objective vectors and retains one physical-index witness.
 * This is a vector-valued *payment feasibility* calculation, not a gameplay
 * value model or a card-target legality oracle. An external planner supplies
 * strategic protected/dead/desired labels and physical future source holds.
 *
 * @param {{
 *  hand:string[],sourceIndex:number,cost:number,
 *  reservedIndices?:Set<number>,protectedIndices?:Set<number>,
 *  deadIndices?:Set<number>,desiredDiscardPrintings?:Set<string>,
 *  nextHandDiscardCost?:number
 * }} input Fully known acting owner's current hand and proposed fixed cost.
 */
function ownerHandDiscardPareto(input) {
  const {hand,sourceIndex,cost,nextHandDiscardCost=0} = input;
  assert.ok(Array.isArray(hand) &&
    hand.every(name => typeof name === 'string' && name.length > 0));
  assert.ok(Number.isSafeInteger(sourceIndex) && sourceIndex >= 0 &&
    sourceIndex < hand.length);
  assert.ok(Number.isSafeInteger(cost) && cost >= 0 && cost <= 3);
  assert.ok(Number.isSafeInteger(nextHandDiscardCost) &&
    nextHandDiscardCost >= 0 && nextHandDiscardCost <= 3);
  const reserved = new Set(input.reservedIndices ?? []);
  const protectedIndices = new Set(input.protectedIndices ?? []);
  const deadIndices = new Set(input.deadIndices ?? []);
  const desired = new Set(input.desiredDiscardPrintings ?? []);
  for (const indexes of [reserved,protectedIndices,deadIndices])
    checkIndices(indexes,hand.length);
  assert.ok([...desired].every(s => typeof s === 'string' && s.length > 0));
  assert.ok(!reserved.has(sourceIndex),
    'The played Trainer is already implicitly reserved');
  const sources = new Set([sourceIndex,...reserved]);
  const eligible = hand.map((_,i)=>i).filter(i=>!sources.has(i));
  const possibleFirstPayments = combinations(eligible.length,cost);
  const counts = new Map();
  let visited=0n;
  const selected=[];
  function visit(start,need) {
    if(need!==0){
      for(let i=start;i<=eligible.length-need;i++){
        selected.push(eligible[i]);
        visit(i+1,need-1);
        selected.pop();
      }
      return;
    }
    visited++;
    const selectedSet = new Set(selected);
    const preserved = eligible.filter(i=>!selectedSet.has(i));
    const unprotected = preserved.filter(i=>!protectedIndices.has(i));
    const futureWays = combinations(unprotected.length,nextHandDiscardCost);
    const distinctTargets = new Set(selected.map(i=>hand[i])
      .filter(p=>desired.has(p)));
    const vector={
      protectedSacrificed:selected.filter(i=>protectedIndices.has(i)).length,
      distinctDesiredDiscardPrintings:distinctTargets.size,
      deadCardsSpent:selected.filter(i=>deadIndices.has(i)).length,
      nextUnprotectedPaymentWays:futureWays.toString()
    };
    const key=JSON.stringify(vector);
    const group=counts.get(key);
    if(group){
      group.equivalentPhysicalPayments++;
      return;
    }
    counts.set(key,{
      vector,
      representativePaymentIndices:[...selected],
      representativePaymentPrintings:selected.map(i=>hand[i]),
      distinctDesiredTargets:[...distinctTargets],
      equivalentPhysicalPayments:1
    });
  }
  if(cost<=eligible.length)visit(0,cost);
  assert.equal(visited,possibleFirstPayments);
  const groups=[...counts.values()];
  /** True when group A structurally weakly improves B in all dimensions. */
  function dominates(a,b) {
    const x=a.vector,y=b.vector;
    const notWorse =
      x.protectedSacrificed<=y.protectedSacrificed &&
      x.distinctDesiredDiscardPrintings>=y.distinctDesiredDiscardPrintings &&
      x.deadCardsSpent>=y.deadCardsSpent &&
      BigInt(x.nextUnprotectedPaymentWays)>=
        BigInt(y.nextUnprotectedPaymentWays);
    const strictlyBetter =
      x.protectedSacrificed<y.protectedSacrificed ||
      x.distinctDesiredDiscardPrintings>y.distinctDesiredDiscardPrintings ||
      x.deadCardsSpent>y.deadCardsSpent ||
      BigInt(x.nextUnprotectedPaymentWays)>
        BigInt(y.nextUnprotectedPaymentWays);
    return notWorse&&strictlyBetter;
  }
  const frontier=groups.filter(g=>
    !groups.some(other=>other!==g&&dominates(other,g)));
  const sort=(a,b)=>
    a.vector.protectedSacrificed-b.vector.protectedSacrificed ||
    b.vector.distinctDesiredDiscardPrintings-
      a.vector.distinctDesiredDiscardPrintings ||
    b.vector.deadCardsSpent-a.vector.deadCardsSpent ||
    Number(BigInt(b.vector.nextUnprotectedPaymentWays)-
      BigInt(a.vector.nextUnprotectedPaymentWays));
  frontier.sort(sort);
  return {
    version:VERSION,
    handLength:hand.length,sourceIndex,cost,
    reservedSourceOrConnectorIndices:[...sources].sort((a,b)=>a-b),
    availableOtherPhysicalCards:eligible.length,
    possibleFirstPaymentCount:possibleFirstPayments.toString(),
    futurePaymentMinimum:nextHandDiscardCost,
    paymentScoreGroups:groups.length,
    structurallyUndominatedPaymentGroups:frontier,
    noFirstPaymentAvailable:possibleFirstPayments===0n,
    paperCardPlayabilityCertified:false,
    downstreamTargetAccessCertified:false,
    strategicOptimalityCertified:false
  };
}
module.exports={VERSION,ownerHandDiscardPareto};
