'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent22-source-genesect-dce-physical-retreat-custody-v1';
const GENESECT='Genesect V FST';
const MEW='Mew VMAX FST';
const DCE='Double Colorless Energy SUM';

/**
 * Read-only capture of original rank-5 Genesect V's exact physical DCE
 * and the Benched Mew VMAX to promote. The Store must accept and pay
 * any native RetreatAction independently of this observer.
 * @param {object} state Genuine current Store state
 * @param {object} action Proposed native action
 * @returns {object|null} Private physical references, never supplied to AI
 */
function captureGenesectDceRetreat(state,action){
  if(action?.constructor?.name!=='RetreatAction')return null;
  const seat=state?.players?.findIndex(p=>p.id===action.clientId);
  if(seat!==0&&seat!==1)return null;
  const owner=state.players[seat];
  const active=owner.active,from=active?.getPokemonCard?.();
  const benched=owner.bench?.[action.benchIndex];
  const target=benched?.getPokemonCard?.();
  if(from?.fullName!==GENESECT||target?.fullName!==MEW)return null;
  const physicalEnergy=active.energies?.cards;
  if(!Array.isArray(physicalEnergy)||physicalEnergy.length!==1||
     physicalEnergy[0].fullName!==DCE||
     !active.cards?.includes(physicalEnergy[0]))return null;
  if(!benched.energies?.cards?.some(card=>card.fullName===DCE&&
     card!==physicalEnergy[0]&&benched.cards.includes(card)))return null;
  if(!owner.bench.some(slot=>slot!==benched&&
     slot.getPokemonCard?.()?.fullName===GENESECT))return null;
  const paidCard=physicalEnergy[0];
  if(owner.discard?.cards?.includes(paidCard))return null;
  return {seat,turn:state.turn,benchIndex:action.benchIndex,
    from,target,paidCard};
}

/**
 * Reconcile exact captured physical objects only after Store settlement.
 * @param {object} before Private pre-dispatch references
 * @param {object} state Post-dispatch native Store state
 * @returns {object} Source-only public/physical payment receipt
 */
function settleGenesectDceRetreat(before,state){
  const owner=state?.players?.[before.seat];
  if(!owner||state?.prompts?.some(p=>p.result===undefined))
    return {status:'PENDING_OR_MISSING_OWNER',seat:before.seat,
      turn:before.turn};
  const feeDiscarded=owner.discard?.cards?.includes(before.paidCard)===true;
  const mewActive=owner.active?.getPokemonCard?.()===before.target;
  const genesectBenched=owner.bench?.some(p=>
    p.getPokemonCard?.()===before.from)===true;
  const zones=[owner.active,...(owner.bench??[])];
  const feeAbsentFromSlots=!zones.some(slot=>
    slot?.cards?.includes(before.paidCard));
  const feeAbsentFromEnergyIndexes=!zones.some(slot=>
    slot?.energies?.cards?.includes(before.paidCard));
  const retreatUsed=owner.retreatedTurn===before.turn;
  const accepted=feeDiscarded&&mewActive&&genesectBenched&&
    feeAbsentFromSlots&&feeAbsentFromEnergyIndexes&&retreatUsed;
  return {status:accepted?'EXACT_PHYSICAL_DCE_FEE_AND_MEW_PROMOTION':
      'PHYSICAL_PAYMENT_OR_PROMOTION_UNVERIFIED',
    seat:before.seat,turn:before.turn,
    exactPreRetreatDceObjectInSourceDiscard:feeDiscarded,
    originalMewPokemonObjectActive:mewActive,
    originalGenesectPokemonObjectBenched:genesectBenched,
    physicalDceCardAbsentFromBoard:feeAbsentFromSlots,
    physicalDceCardAbsentFromEnergyIndexes:feeAbsentFromEnergyIndexes,
    nativeRetreatQuotaConsumed:retreatUsed,
    nativeStoreAccepted:accepted,
    competitiveQualified:false};
}

/**
 * Observe an actual original Store game, excluding speculative cloned
 * proposal Stores. Restores the original dispatch descriptor on all exits.
 *
 * @template T
 * @param {()=>T} execute Synchronous genuine Store experiment
 * @param {{Store?:Function}} [deps] Native Store or unit-test substitution
 * @returns {{result:T,audit:object}}
 */
function withGenesectDceRetreatCustody(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const genuine=new WeakSet(),pending=new WeakMap();
  const records=[];
  let genuineGameCount=0,attempted=0,rejected=0,settled=0,unverified=0;
  function settlePending(store){
    const p=pending.get(store);
    if(!p)return;
    if(store.state?.prompts?.some(prompt=>prompt.result===undefined))
      return;
    const receipt=settleGenesectDceRetreat(p.before,store.state);
    records.push({...receipt,gameOrdinal:p.gameOrdinal});
    if(receipt.status==='EXACT_PHYSICAL_DCE_FEE_AND_MEW_PROMOTION')
      settled++;
    else unverified++;
    pending.delete(store);
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!genuine.has(this)){
      const result=descriptor.value.apply(this,[action,...args]);
      if(this.state?.players?.length===1&&
        this.state.players[0]?.id===101){
        genuine.add(this);
        genuineGameCount++;
      }
      return result;
    }
    if(!genuine.has(this))return descriptor.value.apply(this,[action,...args]);
    const before=captureGenesectDceRetreat(this.state,action);
    if(before){attempted++;pending.set(this,{before,gameOrdinal:genuineGameCount});}
    let result;
    try{result=descriptor.value.apply(this,[action,...args]);}
    catch(error){
      if(before){rejected++;records.push({
        status:'NATIVE_DISPATCH_REJECTED',seat:before.seat,
        turn:before.turn,gameOrdinal:genuineGameCount,
        reason:String(error?.message??error)});pending.delete(this);}
      throw error;
    }
    settlePending(this);
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:dispatch});
  try{
    const result=execute();
    const pendingAtEnd=attempted-rejected-settled-unverified;
    assert.ok(pendingAtEnd>=0);
    return {result,audit:{version:VERSION,readOnly:true,
      sourceOwnerPrivateStateNeverExposedToPolicy:true,
      genuineGameCount,attemptedPhysicalRoots:attempted,
      settledExactPhysicalFees:settled,
      unverifiedPhysicalPayments:unverified,
      nativeDispatchRejected:rejected,pendingAtEnd,
      records,competitiveQualifiedGames:0}};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

module.exports={VERSION,GENESECT,MEW,DCE,captureGenesectDceRetreat,
  settleGenesectDceRetreat,withGenesectDceRetreatCustody};
