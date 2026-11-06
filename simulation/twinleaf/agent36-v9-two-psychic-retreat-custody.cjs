'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent36-v9-rank1-two-psychic-any-target-retreat-custody-v1';
const VMAX='Shadow Rider Calyrex VMAX CRE';
const PSY='Psychic Energy ';

/**
 * Capture the exact physical two-Basic-Psychic payment before a genuine
 * RetreatAction. The promoted target may be any already-funded Pokémon.
 * @param {object} state Real or speculative native Store state.
 * @param {object} action Native action.
 * @returns {object|null} Private in-memory references for post-dispatch audit.
 */
function capture(state,action){
  if(action?.constructor?.name!=='RetreatAction'||
     !Number.isSafeInteger(state?.turn)||state.turn<=1||
     !Number.isSafeInteger(action.benchIndex)||action.benchIndex<0)
    return null;
  const seat=state.players?.findIndex(p=>p.id===action.clientId);
  if((seat!==0&&seat!==1)||state.activePlayer!==seat)return null;
  const owner=state.players[seat];
  const source=owner.active,target=owner.bench?.[action.benchIndex];
  const sourcePokemon=source?.getPokemonCard?.();
  const targetPokemon=target?.getPokemonCard?.();
  const payment=source?.energies?.cards;
  const targetEnergies=target?.energies?.cards;
  if(sourcePokemon?.fullName!==VMAX||!targetPokemon||source===target||
     !Array.isArray(payment)||payment.length!==2||
     payment.some(card=>!card.fullName?.startsWith(PSY))||
     !Array.isArray(targetEnergies)||targetEnergies.length===0||
     (source.tools?.cards?.length??0)>0||
     owner.retreatedTurn===state.turn||
     !Array.isArray(owner.discard?.cards)||
     state.prompts?.some(p=>p.result===undefined))return null;
  return {
    source,sourcePokemon,target,targetPokemon,ownerId:owner.id,seat,
    turn:state.turn,benchIndex:action.benchIndex,
    payment:[...payment],targetEnergies:[...targetEnergies],
    discard:[...owner.discard.cards],
    sourceRetreatCost:[...(sourcePokemon.retreat??[])]
  };
}

/**
 * Prove exact physical Energy custody, promotion, and retreat quota after
 * all mandatory prompts have settled.
 * @param {object} before Pre-dispatch physical references.
 * @param {object} state Post-dispatch native state.
 * @returns {object} Detached receipt.
 */
function settle(before,state){
  const owner=state?.players?.[before.seat];
  if(!owner||state.prompts?.some(p=>p.result===undefined))
    return {status:'UNSETTLED_OR_MISSING_OWNER',turn:before.turn,
      seat:before.seat,benchIndex:before.benchIndex};
  const newlyDiscarded=owner.discard.cards.filter(card=>
    !before.discard.includes(card));
  const exactPayment=before.payment.every(card=>
    owner.discard.cards.includes(card))&&newlyDiscarded.length===2&&
    newlyDiscarded.every(card=>before.payment.includes(card));
  const slots=[owner.active,...(owner.bench??[])];
  const absentFromBoard=before.payment.every(card=>
    slots.every(slot=>!slot?.energies?.cards?.includes(card)&&
      !slot?.cards?.includes(card)));
  const exactPromotion=owner.active===before.target&&
    owner.bench?.[before.benchIndex]===before.source&&
    owner.active.getPokemonCard()===before.targetPokemon&&
    before.source.getPokemonCard()===before.sourcePokemon;
  const targetEnergyPreserved=before.targetEnergies.every(card=>
    owner.active.energies.cards.includes(card));
  const quotaUsed=owner.retreatedTurn===before.turn;
  const paidFee=exactPayment&&absentFromBoard&&exactPromotion&&
    targetEnergyPreserved&&quotaUsed&&before.source.energies.cards.length===0;
  return {
    status:paidFee?'EXACT_TWO_PHYSICAL_PSYCHIC_PAID_RETREAT_ANY_TARGET':
      'PAYMENT_OR_PROMOTION_UNVERIFIED',
    turn:before.turn,seat:before.seat,benchIndex:before.benchIndex,
    sourcePrinting:before.sourcePokemon.fullName,
    promotedPrinting:before.targetPokemon.fullName,
    printedRetreatCost:before.sourceRetreatCost,
    physicalPaymentPrintings:before.payment.map(card=>card.fullName),
    exactPhysicalPayment:exactPayment,
    paidCardsAbsentFromBoard:absentFromBoard,
    exactPhysicalPromotion:exactPromotion,
    targetEnergyObjectsPreserved:targetEnergyPreserved,
    retreatQuotaUsed:quotaUsed,
    paperQualifiedGame:false
  };
}

/**
 * Reversible observer for exact two-Psychic Shadow Rider retreats. Store
 * prototype observations may include speculative stores; join receipts to
 * real root ordinals and accepted-target sidecars before treating them as
 * actual match events.
 * @template T
 * @param {()=>T} execute Genuine native run.
 * @param {{Store?:Function}} [deps] Store injection for pure tests.
 * @returns {{result:T,audit:object}}
 */
function withTwoPsychicAnyTargetCustody(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(
    path.resolve(__dirname,
      '../../vendor/twinleaf/ptcg-server/output/game/store/store')
  ).Store;
  const desc=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof desc?.value,'function');
  const pending=new WeakMap(),receipts=[],errors=[];
  let attempts=0;
  function check(store){
    const before=pending.get(store);
    if(!before||store.state?.prompts?.some(p=>p.result===undefined))return;
    receipts.push(settle(before,store.state));
    pending.delete(store);
  }
  function witness(action,...args){
    const before=capture(this.state,action);
    if(before){pending.set(this,before);attempts++;}
    try{
      const result=desc.value.apply(this,[action,...args]);
      check(this);
      return result;
    }catch(error){
      if(before||pending.has(this)){
        errors.push({turn:this.state?.turn??null,
          seat:before?.seat??null,
          benchIndex:before?.benchIndex??null,
          action:action?.constructor?.name??null,
          reason:String(error?.message??error)});
        pending.delete(this);
      }
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...desc,value:witness});
  try{
    const result=execute();
    const exactPhysicalPaidRetreats=receipts.filter(x=>
      x.status==='EXACT_TWO_PHYSICAL_PSYCHIC_PAID_RETREAT_ANY_TARGET').length;
    return {result,audit:{
      schema:VERSION,observerOnly:true,attempts,receipts,errors,
      exactPhysicalPaidRetreats,
      pendingAtEnd:attempts-receipts.length-errors.length,
      speculativeStoreProvenanceRequiresRealRootJoin:true,
      competitiveQualifiedGames:0
    }};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,witness);
    Object.defineProperty(Store.prototype,'dispatch',desc);
  }
}

module.exports={VERSION,capture,settle,withTwoPsychicAnyTargetCustody};
