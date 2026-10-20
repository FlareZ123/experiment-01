'use strict';

const assert=require('node:assert/strict');
const {stateGraphFingerprint}=
  require('./rank10-live-decision-noninterference.cjs');

const VERSION='agent41-native-owner-hidden-read-observer-v1';

/**
 * Observe reads of the opponent's private CardList.cards *at a real native
 * decision*, without constructing any detached State or revealing card names.
 * Reads inside isValidAction's Simulator have their own "validation" class:
 * copying hidden State for rules validation alone does not prove an
 * information-set leak in a chosen action.
 *
 * This alters descriptors temporarily, so it must remain opt-in, compared
 * against an uninstrumented physical-game root ledger, and never be counted
 * as a competitive qualification. The original data descriptors, including
 * writes made by the real bot, are restored in finally.
 *
 * @template T
 * @param {Function} BotClass Native SimpleTacticsAi constructor.
 * @param {()=>T} execute Synchronous authentic Store game.
 * @param {{seat:0|1,turn:number,maxEvents?:number}} target
 * @returns {{result:T,audit:object}}
 */
function withNativeOpponentHiddenReadObserver(BotClass,execute,target) {
  assert.equal(typeof execute,'function');
  assert.ok(target&&[0,1].includes(target.seat));
  assert.ok(Number.isSafeInteger(target.turn)&&target.turn>=1);
  const maxEvents=target.maxEvents??32;
  assert.ok(Number.isSafeInteger(maxEvents)&&maxEvents>=0);
  const prototype=BotClass.prototype;
  const decode=Object.getOwnPropertyDescriptor(prototype,'decodeNextAction');
  const validate=Object.getOwnPropertyDescriptor(prototype,'isValidAction');
  assert.equal(typeof decode?.value,'function');
  assert.equal(typeof validate?.value,'function');
  let phase='proposal';
  let activeBot=null;
  let targetSeen=false;
  const observations=[];
  const totals={proposal:0,validation:0};
  const categories={};
  let mutatedNativeRoot=false;

  function interceptedValidation(...args) {
    if(this!==activeBot)return validate.value.apply(this,args);
    const previous=phase;
    phase='validation';
    try{return validate.value.apply(this,args);}
    finally{phase=previous;}
  }

  function interceptedDecode(state) {
    const actor=state?.players?.[target.seat];
    const eligible=!targetSeen && state?.turn===target.turn &&
      state?.activePlayer===target.seat &&
      actor?.id===this.client?.id &&
      Array.isArray(state.prompts) &&
      state.prompts.every(p=>p.result!==undefined);
    if(!eligible)return decode.value.call(this,state);
    targetSeen=true;
    const before=stateGraphFingerprint(state);
    const other=state.players[1-target.seat];
    const watched=[
      ['opponent-hand',other.hand],
      ['opponent-deck',other.deck],
      ...other.prizes.map((zone,i)=>['opponent-prize-'+i,zone])
    ];
    const held=[];
    const seen=new Set();
    let activeError=null;
    activeBot=this;
    phase='proposal';
    try{
      for(const [label,holder] of watched){
        if(!holder||seen.has(holder))continue;
        seen.add(holder);
        const original=Object.getOwnPropertyDescriptor(holder,'cards');
        assert.ok(original&&Object.hasOwn(original,'value')&&
          original.configurable===true,
        'Native private CardList.cards descriptor is not a writable data seam');
        let value=original.value;
        assert.ok(Array.isArray(value));
        const getter=function() {
          const stage=phase;
          totals[stage]++;
          categories[label]??={proposal:0,validation:0};
          categories[label][stage]++;
          if(observations.length<maxEvents)
            observations.push({zone:label,stage});
          return value;
        };
        const setter=function(next) {value=next;};
        Object.defineProperty(holder,'cards',{
          configurable:true,enumerable:original.enumerable,get:getter,set:setter
        });
        held.push(()=>Object.defineProperty(holder,'cards',{
          ...original,value
        }));
      }
      return decode.value.call(this,state);
    }catch(error){
      activeError=error;
      throw error;
    }finally{
      for(let i=held.length-1;i>=0;i--)held[i]();
      activeBot=null;
      const after=stateGraphFingerprint(state);
      mutatedNativeRoot=before.digest!==after.digest;
      if(activeError&&typeof activeError==='object')
        activeError.nativeHiddenReadEvidence={
          version:VERSION,observedNativeRoot:true,target,
          proposalReads:totals.proposal,validationReads:totals.validation,
          nativeRootChangedDuringDecision:mutatedNativeRoot,
          actorInformationSetCertified:false
        };
    }
  }

  Object.defineProperty(prototype,'isValidAction',{
    ...validate,value:interceptedValidation
  });
  Object.defineProperty(prototype,'decodeNextAction',{
    ...decode,value:interceptedDecode
  });
  try{
    const result=execute();
    return {result,audit:{
      version:VERSION,target:{seat:target.seat,turn:target.turn},
      observedNativeRoot:targetSeen,
      proposalReads:totals.proposal,validationReads:totals.validation,
      countsByPrivateZone:categories,
      boundedReadEvents:observations,
      eventsTruncated:totals.proposal+totals.validation>observations.length,
      nativeRootChangedDuringDecision:targetSeen?mutatedNativeRoot:null,
      privateContentsExposed:false,
      opponentPublicZoneCountsMayExplainReads:true,
      hiddenCardIdentityAccessProved:false,
      actorInformationSetCertified:false,
      competitiveGameQualified:false,
      interpretation:'Access to a private-zone CardList.cards array, not necessarily any card identity. The native OpponentScore legitimately reads publicly countable hand/deck lengths. A positive access count never proves hidden-card knowledge or action sensitivity.'
    }};
  }finally{
    Object.defineProperty(prototype,'decodeNextAction',decode);
    Object.defineProperty(prototype,'isValidAction',validate);
  }
}
module.exports={VERSION,withNativeOpponentHiddenReadObserver};
