'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent9-actual-physical-crobat-retreat-fee-custody-v1';
const CROBAT='Crobat V DAA';
const MEW='Mew VMAX FST';
const DCE='Double Colorless Energy SUM';

/**
 * Capture exactly one physical DCE attached to an original Crobat V before
 * a native RetreatAction promotes an already charged Mew VMAX. The captured
 * object is retained inside this read-only auditor, never sent to an actor.
 *
 * @param {object} state Genuine pinned Store state, before native dispatch.
 * @param {object} action Genuine RetreatAction.
 * @returns {object|null} Private object-reference witness or nonmatch.
 */
function captureCrobatRetreatFee(state,action){
  if(action?.constructor?.name!=='RetreatAction')return null;
  const seat=state?.players?.findIndex(p=>p.id===action.clientId);
  if(seat!==0&&seat!==1)return null;
  const owner=state.players[seat],active=owner.active;
  const from=active?.getPokemonCard?.();
  const target=owner.bench?.[action.benchIndex]?.getPokemonCard?.();
  if(from?.fullName!==CROBAT||target?.fullName!==MEW)return null;
  const energies=active.energies?.cards;
  if(!Array.isArray(energies)||energies.length!==1||
      energies[0].fullName!==DCE||!active.cards?.includes(energies[0]))
    return null;
  const targetSlot=owner.bench[action.benchIndex];
  if(!targetSlot.energies?.cards?.some(c=>c.fullName===DCE))return null;
  const paidCard=energies[0];
  if(owner.discard?.cards?.includes(paidCard))return null;
  return {seat,turn:state.turn,benchIndex:action.benchIndex,
    from,target,paidCard,ownerId:owner.id};
}

/**
 * Prove that the exact pre-root DCE physical object moved to the acting
 * owner's discard, and that the original Pokémon objects swapped positions.
 * Do not infer success if the native Store is mid-prompt or rebuilt refs.
 *
 * @param {object} before Private physical-card reference witness.
 * @param {object} state Native Store state after dispatch/settlement.
 * @returns {object} Detached postgame evidence without owner-hidden cards.
 */
function settleCrobatRetreatFee(before,state){
  const owner=state?.players?.[before.seat];
  const pending=state?.prompts?.some(p=>p.result===undefined)===true;
  if(!owner||pending)return {status:'UNSETTLED_OR_MISSING_OWNER',
    turn:before.turn,seat:before.seat};
  const exactDiscard=owner.discard?.cards?.includes(before.paidCard)===true;
  const activeTarget=owner.active?.getPokemonCard?.()===before.target;
  const formerBench=owner.bench?.some(slot=>
    slot.getPokemonCard?.()===before.from)===true;
  const paidStillOnBoard=[owner.active,...(owner.bench??[])].some(slot=>
    slot?.cards?.includes(before.paidCard))===true;
  const paidIndexed=[owner.active,...(owner.bench??[])].some(slot=>
    slot?.energies?.cards?.includes(before.paidCard))===true;
  const retreatUsed=owner.retreatedTurn===before.turn;
  const confirmed=exactDiscard&&activeTarget&&formerBench&&
    !paidStillOnBoard&&!paidIndexed&&retreatUsed;
  return {status:confirmed?'EXACT_PHYSICAL_FEE_AND_PROMOTION':
      'PHYSICAL_FEE_OR_POSITION_UNVERIFIED',
    turn:before.turn,seat:before.seat,
    physicalDceObjectInOwnDiscard:exactDiscard,
    originalMewCardObjectPromoted:activeTarget,
    originalCrobatCardObjectOnBench:formerBench,
    paidCardAbsentFromBoard:!paidStillOnBoard,
    paidCardAbsentFromEnergyIndexes:!paidIndexed,
    ownerRetreatQuotaUsed:retreatUsed,
    paperFullChainQualified:false};
}

/**
 * Default-off, reversible, read-only native Store action observer. It never
 * selects, replaces, validates, or modifies the actor's action. Post-root
 * audit is kept separate from owner-private policy observation.
 *
 * @template T
 * @param {()=>T} execute Synchronous actual-game research workload.
 * @param {{Store?:Function}} [deps] Pure-test Store injection.
 * @returns {{result:T,audit:object}} Actual native workload and receipts.
 */
function withCrobatRetreatFeeCustody(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??
    require(path.join(base,'game/store/store')).Store;
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const pending=new WeakMap();
  const observed=new WeakSet();
  let nextGame=0;
  const audit={version:VERSION,readOnly:true,attemptedPhysicalRoots:0,
    settledExactPhysicalFees:0,unverifiedOrPending:0,
    nativeDispatchRejects:0,gameCount:0,records:[],
    qualifiedCompetitiveGames:0};
  const add=record=>{if(audit.records.length<96)audit.records.push(record);};
  function after(store){
    const item=pending.get(store);
    if(!item)return;
    if(store.state?.prompts?.some(p=>p.result===undefined))return;
    const result=settleCrobatRetreatFee(item.before,store.state);
    add({...result,gameOrdinal:item.gameOrdinal});
    if(result.status==='EXACT_PHYSICAL_FEE_AND_PROMOTION')
      audit.settledExactPhysicalFees++;
    else audit.unverifiedOrPending++;
    pending.delete(store);
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!observed.has(this)){
      observed.add(this);nextGame++;audit.gameCount++;
    }
    const before=captureCrobatRetreatFee(this.state,action);
    if(before){
      audit.attemptedPhysicalRoots++;
      pending.set(this,{before,gameOrdinal:nextGame});
    }
    let result;
    try {
      result=descriptor.value.apply(this,[action,...args]);
    }catch(error){
      if(before){audit.nativeDispatchRejects++;
        add({status:'NATIVE_DISPATCH_REJECTED',seat:before.seat,
          turn:before.turn,gameOrdinal:nextGame,
          reason:String(error?.message??error)});pending.delete(this);}
      throw error;
    }
    after(this);
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:dispatch});
  try {
    const result=execute();
    // Any uncompleted payment prompt is explicitly not a valid receipt.
    return {result,audit};
  } finally {
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}
module.exports={VERSION,CROBAT,MEW,DCE,
  captureCrobatRetreatFee,settleCrobatRetreatFee,
  withCrobatRetreatFeeCustody};
