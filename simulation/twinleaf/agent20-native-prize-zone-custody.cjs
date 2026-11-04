'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent20-native-prize-zone-count-custody-v1';

/**
 * Observe only public Prize-slot occupancy and own hand-card count on
 * genuine native Store acceptance of the normal owner KO Prize prompt.
 * This does NOT read, serialize or inspect concealed card faces.
 *
 * @template T
 * @param {()=>T} execute Synchronous pinned native Store match.
 * @param {{Store?:Function,maxRecords?:number}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withNativePrizeZoneCustody(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.join(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const maxRecords=deps.maxRecords??16;
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=0);
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  assert.equal(original.configurable,true);
  let liveStore=null;
  const audit={
    version:VERSION,realStoreInstances:0,acceptedPrizePromptActions:0,
    failedPrizePromptActions:0,selectedOwnerPrizePromptCount:0,
    postDispatchZoneTransfersObserved:0,postDispatchZoneTransfersUnconfirmed:0,
    events:[],omitted:0,
    concealedCardFacesRead:false,
    decisionsChanged:false,
    paperLegalityCertified:false,
    qualifiedGames:0
  };
  function dispatch(action,...args){
    if(!liveStore&&action?.constructor?.name==='AddPlayerAction'){
      liveStore=this;
      audit.realStoreInstances++;
    }
    const state=this.state;
    const pending=this===liveStore&&
      action?.constructor?.name==='ResolvePromptAction'?
      state?.prompts?.find(p=>p?.id===action.id&&
        p.result===undefined&&p.constructor?.name==='ChoosePrizePrompt'&&
        p.message==='CHOOSE_PRIZE_CARD'&&
        p.options?.useOpponentPrizes===false&&
        p.options?.allowCancel===false&&
        p.getPerspectivePlayerId?.()===p.playerId):null;
    const owner=pending?state.players?.find(p=>p.id===pending.playerId):null;
    const before=owner?{
      hand:owner.hand?.cards?.length??null,
      prizes:owner.prizes?.reduce((sum,p)=>sum+(p.cards?.length??0),0)??null,
      occupied:owner.prizes?.filter(p=>(p.cards?.length??0)>0).length??null
    }:null;
    let result;
    try{
      result=original.value.apply(this,[action,...args]);
    }catch(error){
      if(pending)audit.failedPrizePromptActions++;
      throw error;
    }
    if(pending&&owner&&before){
      audit.selectedOwnerPrizePromptCount++;
      audit.acceptedPrizePromptActions++;
      const afterOwner=this.state?.players?.find(p=>p.id===pending.playerId);
      const after={
        hand:afterOwner?.hand?.cards?.length??null,
        prizes:afterOwner?.prizes?.reduce((sum,p)=>sum+(p.cards?.length??0),0)??null,
        occupied:afterOwner?.prizes?.filter(p=>(p.cards?.length??0)>0).length??null
      };
      const transferred=Number.isSafeInteger(before.prizes)&&
        Number.isSafeInteger(after.prizes)&&
        Number.isSafeInteger(before.hand)&&Number.isSafeInteger(after.hand)&&
        before.prizes-after.prizes===pending.options.count&&
        after.hand-before.hand===pending.options.count;
      if(transferred)audit.postDispatchZoneTransfersObserved++;
      else audit.postDispatchZoneTransfersUnconfirmed++;
      const seat=state.players.findIndex(p=>p.id===pending.playerId);
      const event={
        seat,globalTurn:state.turn,promptMessage:pending.message,
        count:pending.options.count,
        submittedChoiceCount:Array.isArray(action.result)?action.result.length:null,
        before,after,confirmedDirectTransfer:transferred,
        readOnly:true,postActualStore:true
      };
      if(audit.events.length<maxRecords)audit.events.push(event);
      else audit.omitted++;
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:dispatch});
  try{
    return {result:execute(),audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.agent20PrizeZoneCustodyAudit={...audit,events:[...audit.events]};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

module.exports={VERSION,withNativePrizeZoneCustody};
