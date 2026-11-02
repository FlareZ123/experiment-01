'use strict';

const assert=require('node:assert/strict');
const {chooseActorHandDiscard}=
  require('./agent47-actor-hand-discard.cjs');

const VERSION='agent38-plumeria-last-printing-payment-gate-v1';
const MAX_NATIVE_HAND=18;

/**
 * Predict the existing actor47 mandatory two-card Plumeria payment from the
 * identical detached owner-hand printing multiset. This is a root-stage
 * screening rule, not a native prompt or a proof of future card value.
 *
 * @param {object} view Detached owner-root hand and public state
 * @param {object} offer Grouped Plumeria payment proposal
 * @returns {object} Audit-safe predicted payment and conservative hold verdict
 */
function screenPlumeriaPayment(view,offer){
  assert.equal(view.decisionKind,'owner-root');
  assert.equal(offer.kind,'play-plumeria-payment-menu');
  const hand=view.ownHand;
  assert.ok(Array.isArray(hand));
  assert.ok(Number.isSafeInteger(offer.handIndex)&&
    hand[offer.handIndex]===offer.printing);
  const remaining=hand.filter((_,index)=>index!==offer.handIndex);
  const unavailable=reason=>({
    version:VERSION,allow:false,reason,
    predictedPrintings:[],erasedPrintings:[],
    handAfterPlayingSupporter:remaining.length,
    nativePromptAndStrategicValueVerified:false
  });
  // Actor47's native adapter supports mandatory two-card payment menus only
  // up to 18 physical remaining cards. Larger menus may use a different
  // generic resolver, so prediction would be unsound.
  if(remaining.length<2||remaining.length>MAX_NATIVE_HAND)
    return unavailable('payment-prompt-outside-actor47-bounded-menu');
  if(!Array.isArray(offer.paymentPairs)||!offer.paymentPairs.length)
    return unavailable('no-physical-payment-pairs');
  const menu=new Map();
  for(const pair of offer.paymentPairs){
    if(!Array.isArray(pair?.handIndices)||pair.handIndices.length!==2||
       !Array.isArray(pair.printings)||pair.printings.length!==2)
      return unavailable('invalid-payment-pair');
    const [a,b]=pair.handIndices;
    if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||
       a===b||a===offer.handIndex||b===offer.handIndex||
       hand[a]!==pair.printings[0]||hand[b]!==pair.printings[1])
      return unavailable('invalid-physical-payment-pair');
    const names=[...pair.printings].sort();
    menu.set(JSON.stringify(names),names);
  }
  if(!menu.size)return unavailable('no-validated-payment-multisets');
  const choices=[...menu.values()].sort((a,b)=>{
    const left=JSON.stringify(a),right=JSON.stringify(b);
    return left<right?-1:left>right?1:0;
  });
  const predicted=chooseActorHandDiscard({
    actor:{decisionKind:'owner-prompt',ownHand:remaining},
    prompt:{menu:choices}
  }).printings;
  const counts=new Map();
  for(const name of remaining)
    counts.set(name,(counts.get(name)??0)+1);
  const erased=[];
  for(const name of new Set(predicted)){
    if(predicted.filter(x=>x===name).length===counts.get(name))
      erased.push(name);
  }
  return {
    version:VERSION,allow:erased.length===0,
    reason:erased.length?'predicted-payment-erases-last-printing':
      'predicted-payment-preserves-all-printings',
    predictedPrintings:[...predicted],erasedPrintings:erased,
    handAfterPlayingSupporter:remaining.length,
    nativePromptAndStrategicValueVerified:false
  };
}

module.exports={VERSION,screenPlumeriaPayment};
