'use strict';

const assert=require('node:assert/strict');

const VERSION='agent42-two-basic-psychic-vmax-native-retreat-payment-v1';
const VMAX='Shadow Rider Calyrex VMAX CRE';
const PSY='Psychic Energy ';

/**
 * Capture physically distinct native card objects before an actual
 * RetreatAction. All information is face-up or game-turn public; references
 * remain inside the postgame auditor and are never sent to an actor policy.
 *
 * @param {object} state Real pinned native Store state.
 * @param {object} action Native player-supplied action.
 * @returns {object|null}
 */
function captureTwoPsychicRetreat(state,action){
  if(action?.constructor?.name!=='RetreatAction'||
     !Number.isSafeInteger(state?.turn)||state.turn<=1)return null;
  const seat=state.players?.findIndex(p=>p.id===action.clientId);
  if(seat!==0&&seat!==1||state.activePlayer!==seat)return null;
  const owner=state.players[seat];
  const source=owner.active,target=owner.bench?.[action.benchIndex];
  const sourcePokemon=source?.getPokemonCard?.();
  const targetPokemon=target?.getPokemonCard?.();
  const payment=source?.energies?.cards;
  const targetEnergies=target?.energies?.cards;
  if(sourcePokemon?.fullName!==VMAX||
     targetPokemon?.fullName!==VMAX||
     source===target||sourcePokemon===targetPokemon||
     !Array.isArray(payment)||payment.length!==2||
     payment.some(card=>!card.fullName?.startsWith(PSY))||
     payment[0]===payment[1]||
     !Array.isArray(targetEnergies)||targetEnergies.length<3||
     (source.tools?.cards?.length??0)>0||
     owner.retreatedTurn===state.turn||
     !Array.isArray(owner.discard?.cards)||
     state.prompts?.some(p=>p.result===undefined))return null;
  return {
    source,sourcePokemon,target,targetPokemon,ownerId:owner.id,seat,
    turn:state.turn,benchIndex:action.benchIndex,
    payment:[...payment],targetEnergies:[...targetEnergies],
    discard:[...owner.discard.cards]
  };
}

/**
 * Prove exact native Store payment, promotion and quota after all pending
 * prompt effects. Native acceptance alone is insufficient for this proof.
 *
 * @param {object} before Internal physical pre-dispatch references.
 * @param {object} state Post-dispatch native state.
 * @returns {object} Detached postgame receipt, with no concealed information.
 */
function settleTwoPsychicRetreat(before,state){
  const owner=state?.players?.[before.seat];
  if(!owner||state.prompts?.some(p=>p.result===undefined))
    return {status:'UNSETTLED_OR_MISSING_OWNER',turn:before.turn,
      seat:before.seat};
  const discarded=before.payment.every(card=>
    owner.discard.cards.includes(card));
  const newlyDiscarded=owner.discard.cards.filter(card=>
    !before.discard.includes(card));
  const exactPayment=discarded&&newlyDiscarded.length===2&&
    newlyDiscarded.every(card=>before.payment.includes(card));
  const slots=[owner.active,...(owner.bench??[])];
  const absentFromPlay=before.payment.every(card=>
    slots.every(slot=>!slot?.energies?.cards?.includes(card)&&
                     !slot?.cards?.includes(card)));
  const actualPromotion=owner.active===before.target&&
    owner.bench?.[before.benchIndex]===before.source&&
    owner.active.getPokemonCard()===before.targetPokemon&&
    before.source.getPokemonCard()===before.sourcePokemon;
  const benchEnergyPreserved=before.targetEnergies.every(card=>
    owner.active.energies.cards.includes(card));
  const paidFee=exactPayment&&absentFromPlay&&actualPromotion&&
    benchEnergyPreserved&&owner.retreatedTurn===before.turn&&
    before.source.energies.cards.length===0;
  return {
    status:paidFee?'EXACT_TWO_PHYSICAL_PSYCHIC_PAID_RETREAT':
      'PAYMENT_OR_PROMOTION_UNVERIFIED',
    turn:before.turn,sourceSeat:before.seat,
    benchIndex:before.benchIndex,
    nativeTwoBasicPsychicPayment:exactPayment,
    exactPhysicalPromotion:actualPromotion,
    paidCardsAbsentFromBoard:absentFromPlay,
    paidCardsPreserveOriginalObjectIdentity:discarded,
    targetEnergyUnchanged:benchEnergyPreserved,
    ownerRetreatQuotaUsed:owner.retreatedTurn===before.turn,
    paperWholeGameQualified:false
  };
}

/**
 * Reversible, observer-only native Store witness. It does not mutate actor
 * decisions, prompt contents or source gameplay. Pending records survive
 * any number of deferred prompt-resolution dispatches.
 *
 * @template T
 * @param {()=>T} execute Native runner or staged genuine-Store callback.
 * @param {{Store?:Function}} [deps] Stub Store injection in pure tests.
 * @returns {{result:T,audit:object}}
 */
function withTwoPsychicRetreatCustody(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(
    require('node:path').resolve(__dirname,
      '../../vendor/twinleaf/ptcg-server/output/game/store/store')
  ).Store;
  const desc=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof desc?.value,'function');
  const pending=new WeakMap(),receipts=[],errors=[];
  let attempts=0;
  function check(store){
    const before=pending.get(store);
    if(!before||store.state?.prompts?.some(p=>p.result===undefined))
      return;
    receipts.push(settleTwoPsychicRetreat(before,store.state));
    pending.delete(store);
  }
  function witness(action,...args){
    const before=captureTwoPsychicRetreat(this.state,action);
    if(before){pending.set(this,before);attempts++;}
    try{
      const result=desc.value.apply(this,[action,...args]);
      check(this);
      return result;
    }catch(error){
      if(before||pending.has(this)){
        errors.push({turn:this.state?.turn??null,
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
      x.status==='EXACT_TWO_PHYSICAL_PSYCHIC_PAID_RETREAT').length;
    return {result,audit:{
      schema:VERSION,observerOnly:true,attempts,receipts,errors,
      exactPhysicalPaidRetreats,
      pendingAtEnd:attempts-receipts.length-errors.length,
      competitiveQualifiedGames:0
    }};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,witness);
    Object.defineProperty(Store.prototype,'dispatch',desc);
  }
}

module.exports={VERSION,captureTwoPsychicRetreat,
  settleTwoPsychicRetreat,withTwoPsychicRetreatCustody};
