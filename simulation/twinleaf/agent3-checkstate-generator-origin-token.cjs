'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent3-checkstate-generator-origin-token-v1';

/**
 * Observe KnockOutEffect, ChoosePrizePrompt and DrawPrizesEffect during a
 * specific real Store checkState call, including its deferred generator
 * continuations after prompt resolution. Existing action/prompt/effect
 * algorithms are invoked unchanged. Neither card faces nor owner hands
 * are inspected.
 *
 * The check-state token certifies execution-context ancestry under the pinned
 * native CommonJS engine. It does not prove printed paper game correctness.
 *
 * @template T
 * @param {()=>T} execute A synchronous headless native trial campaign.
 * @param {{rootBinding:{current:object|null,currentTrialId?:string},
 *   Store?:Function,checkModule?:object,maxRecords?:number}} deps
 * @returns {{result:T,audit:object}}
 */
function withCheckStateGeneratorOriginToken(execute,deps){
  assert.equal(typeof execute,'function');
  assert.ok(deps?.rootBinding&&typeof deps.rootBinding==='object');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(root,'game/store/store')).Store;
  const checkModule=deps.checkModule??
    require(path.join(root,'game/store/effect-reducers/check-effect'));
  const maxRecords=deps.maxRecords??256;
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=0);
  const owner=Store.prototype;
  const names=['waitPrompt','prompt','reduceEffect'];
  const original=Object.fromEntries(names.map(k=>
    [k,Object.getOwnPropertyDescriptor(owner,k)]));
  const originalCheck=Object.getOwnPropertyDescriptor(checkModule,'checkState');
  assert.equal(typeof originalCheck?.value,'function');
  assert.equal(originalCheck.configurable,true);
  for(const name of names){
    assert.equal(typeof original[name]?.value,'function');
    assert.equal(original[name].configurable,true);
  }
  const active=new WeakMap();
  let nextToken=0;
  const audit={
    version:VERSION,
    authoritativeChecks:0,
    foreignChecks:0,
    deferredContinuationsRegistered:0,
    deferredContinuationsResumed:0,
    promptCallbacksRegistered:0,
    promptCallbacksResumed:0,
    nativeKoEffects:0,
    nativeKoEffectsWithoutToken:0,
    sourcePrizePrompts:0,
    nativeDrawPrizesEffects:0,
    sameTokenKoPrizePrompts:0,
    sameTokenKoDrawPrizes:0,
    tokenGroups:[],
    truncatedTokenGroups:0,
    observedHiddenPrizeCardFaces:false,
    printedKoValidityCertified:false,
    paperCompetitiveGamesQualified:0
  };
  const groups=new Map();
  const isAuthoritative=store=>store===deps.rootBinding.current;
  function withToken(store,token,callback){
    const prev=active.get(store);
    active.set(store,token);
    try{return callback();}
    finally{
      if(prev===undefined)active.delete(store);
      else active.set(store,prev);
    }
  }
  function group(token){
    let found=groups.get(token.id);
    if(!found){
      found={
        token:token.id,trialId:token.trialId,turn:token.turn,
        phase:token.phase,ko:[],prompts:[],draws:[]
      };
      groups.set(token.id,found);
    }
    return found;
  }
  function checkState(store,state,...args){
    if(!isAuthoritative(store)){
      audit.foreignChecks++;
      return originalCheck.value.apply(this,[store,state,...args]);
    }
    const token={
      id:++nextToken,trialId:deps.rootBinding.currentTrialId??null,
      turn:state?.turn??null,phase:state?.phase??null
    };
    audit.authoritativeChecks++;
    return withToken(store,token,()=>
      originalCheck.value.apply(this,[store,state,...args]));
  }
  function waitPrompt(state,callback,...args){
    const token=isAuthoritative(this)?active.get(this):null;
    if(!token||typeof callback!=='function')
      return original.waitPrompt.value.apply(this,[state,callback,...args]);
    const store=this;
    audit.deferredContinuationsRegistered++;
    const wrapped=function(...callbackArgs){
      audit.deferredContinuationsResumed++;
      return withToken(store,token,()=>
        callback.apply(this,callbackArgs));
    };
    return original.waitPrompt.value.apply(this,[state,wrapped,...args]);
  }
  function prompt(state,prompts,callback,...args){
    const token=isAuthoritative(this)?active.get(this):null;
    const store=this;
    const source=token&&typeof callback==='function';
    let resolved=callback;
    if(source){
      audit.promptCallbacksRegistered++;
      resolved=function(...callbackArgs){
        audit.promptCallbacksResumed++;
        return withToken(store,token,()=>
          callback.apply(this,callbackArgs));
      };
    }
    const returned=original.prompt.value.apply(this,
      [state,prompts,resolved,...args]);
    if(!token)return returned;
    const listed=Array.isArray(prompts)?prompts:[prompts];
    for(const offered of listed) {
      if(offered?.constructor?.name!=='ChoosePrizePrompt')continue;
      const settled=state?.prompts?.includes(offered);
      if(!settled)continue;
      const seat=state.players.findIndex(p=>p.id===offered.playerId);
      group(token).prompts.push({
        seat,count:offered.options?.count??null,
        message:offered.message??null
      });
      audit.sourcePrizePrompts++;
    }
    return returned;
  }
  function reduceEffect(state,effect,...args){
    const token=isAuthoritative(this)?active.get(this):null;
    const returned=original.reduceEffect.value.apply(this,
      [state,effect,...args]);
    const name=effect?.constructor?.name;
    if(name!=='KnockOutEffect'&&name!=='DrawPrizesEffect')return returned;
    const live=isAuthoritative(this)&&this.calculatingPlayability!==true;
    if(!live)return returned;
    if(name==='KnockOutEffect'){
      if(!token){audit.nativeKoEffectsWithoutToken++;return returned;}
      audit.nativeKoEffects++;
      group(token).ko.push({
        ownerSeat:state.players.findIndex(p=>p.id===effect.player?.id),
        count:effect.prizeCount??null,
        preventDefault:effect.preventDefault===true
      });
    }else if(token){
      audit.nativeDrawPrizesEffects++;
      const takingSeat=state.players.findIndex(p=>p.id===effect.player?.id);
      const takingPlayer=state.players[takingSeat];
      let dest='other';
      if(effect.destination===takingPlayer?.hand)dest='hand';
      else if(effect.destination===takingPlayer?.lostzone)dest='lost-zone';
      else if(effect.destination===takingPlayer?.discard)dest='discard';
      group(token).draws.push({
        takingSeat,count:Array.isArray(effect.prizes)?
          effect.prizes.length:null,preventDefault:effect.preventDefault===true,
        destination:dest
      });
    }
    return returned;
  }
  Object.defineProperty(checkModule,'checkState',
    {...originalCheck,value:checkState});
  for(const [name,value] of Object.entries({waitPrompt,prompt,reduceEffect}))
    Object.defineProperty(owner,name,{...original[name],value});
  let result;
  try {
    result=execute();
  } catch(error){
    if(error&&typeof error==='object')
      error.agent3GeneratorOriginAudit={...audit,aborted:true};
    throw error;
  } finally {
    for(const name of names)
      Object.defineProperty(owner,name,original[name]);
    Object.defineProperty(checkModule,'checkState',originalCheck);
  }
  for(const event of groups.values()){
    if(event.ko.length&&event.prompts.length)audit.sameTokenKoPrizePrompts++;
    if(event.ko.length&&event.draws.length)audit.sameTokenKoDrawPrizes++;
    if(audit.tokenGroups.length<maxRecords)audit.tokenGroups.push(event);
    else audit.truncatedTokenGroups++;
  }
  return {result,audit};
}
module.exports={VERSION,withCheckStateGeneratorOriginToken};
