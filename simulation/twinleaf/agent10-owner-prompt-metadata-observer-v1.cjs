'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent10-owner-prompt-metadata-observer-v1';

/** @param {object|null|undefined} enumeration @param {unknown} value */
function enumName(enumeration,value){
  if(typeof value==='string')return value;
  if(!enumeration||typeof enumeration!=='object')return null;
  for(const [name,candidate] of Object.entries(enumeration)){
    if(!/^\\d+$/.test(name)&&candidate===value)return name;
  }
  return null;
}

/** @param {unknown} cards */
function selectableCount(cards){
  if(Array.isArray(cards))return cards.length;
  if(Array.isArray(cards?.cards))return cards.cards.length;
  if(Array.isArray(cards?.cards?.cards))return cards.cards.cards.length;
  return Number.isSafeInteger(cards?.length)?cards.length:null;
}

/** @param {unknown} value */
function safeFinite(value){
  return Number.isFinite(value)?value:null;
}

/**
 * Observe Store prompt creation and the dispatch that created each prompt.
 * Records only prompt metadata and option counts. Never serializes card
 * identities, prompt card contents, hands, decks or Prize identities.
 *
 * @template T
 * @param {()=>T} run Synchronous native experiment callback.
 * @param {{Store?:Function,GameMessage?:object,maxEvents?:number}} [options]
 * @returns {{result:T,audit:object}}
 */
function withOwnerPromptMetadataObserver(run,options={}){
  assert.equal(typeof run,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} name @returns {any} */
  const native=name=>require(path.join(output,name));
  const Store=options.Store??native('game/store/store').Store;
  const GameMessage=options.GameMessage??native('game/game-message').GameMessage;
  const maxEvents=options.maxEvents??256;
  assert.ok(Store?.prototype,'Twinleaf Store prototype is required');
  assert.ok(Number.isInteger(maxEvents)&&maxEvents>0&&maxEvents<=4096);

  const oldPrompt=Object.getOwnPropertyDescriptor(Store.prototype,'prompt');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldPrompt?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');

  const storeOrdinals=new WeakMap();
  const promptOrdinals=new WeakMap();
  const dispatchOrdinals=new WeakMap();
  const dispatchDepths=new WeakMap();
  const currentActions=new WeakMap();
  let nextStoreOrdinal=0;
  const audit={
    version:VERSION,
    storeCount:0,
    dispatchCount:0,
    promptCount:0,
    events:[],
    eventsTruncated:false
  };

  /** @param {object} store */
  function storeOrdinal(store){
    let value=storeOrdinals.get(store);
    if(value===undefined){
      value=++nextStoreOrdinal;
      storeOrdinals.set(store,value);
      audit.storeCount++;
    }
    return value;
  }

  /** @param {object} action */
  function actionName(action){
    return action?.constructor?.name??(
      typeof action?.type==='string'?action.type:null
    );
  }

  function observedDispatch(action,...args){
    const depth=dispatchDepths.get(this)??0;
    let ordinal=dispatchOrdinals.get(this)??0;
    if(depth===0){
      ordinal++;
      dispatchOrdinals.set(this,ordinal);
      audit.dispatchCount++;
    }
    const previous=currentActions.get(this)??null;
    const current={
      actionName:actionName(action),
      dispatchOrdinal:ordinal,
      dispatchDepth:depth,
      turnBefore:safeFinite(this.state?.turn),
      phaseBefore:this.state?.phase??null
    };
    dispatchDepths.set(this,depth+1);
    currentActions.set(this,current);
    try{
      return oldDispatch.value.apply(this,[action,...args]);
    }finally{
      dispatchDepths.set(this,depth);
      if(previous)currentActions.set(this,previous);
      else currentActions.delete(this);
    }
  }

  function observedPrompt(...args){
    const state=args[0];
    const prompt=args[1];
    const promptIdBeforeStore=prompt?.id??null;
    const result=oldPrompt.value.apply(this,args);
    if(audit.events.length>=maxEvents){
      audit.eventsTruncated=true;
      return result;
    }

    const players=Array.isArray(state?.players)?state.players:[];
    const ownerSeat=players.findIndex(player=>
      player===prompt?.player||
      (prompt?.playerId!=null&&player?.id===prompt.playerId)
    );
    const optionsObject=prompt?.options&&typeof prompt.options==='object'
      ?prompt.options:{};
    const promptOrdinal=(promptOrdinals.get(this)??0)+1;
    promptOrdinals.set(this,promptOrdinal);
    const current=currentActions.get(this)??null;
    const pendingPrompts=Array.isArray(state?.prompts)
      ?state.prompts.filter(item=>item?.result===undefined).length:null;

    audit.events.push({
      index:audit.events.length,
      storeOrdinal:storeOrdinal(this),
      promptOrdinal,
      promptId:prompt?.id==null?null:String(prompt.id),
      promptIdBeforeStore:promptIdBeforeStore==null?null:String(promptIdBeforeStore),
      turn:safeFinite(state?.turn),
      phase:state?.phase??null,
      activePlayerSeat:Number.isInteger(state?.activePlayer)?state.activePlayer:null,
      ownerSeat:ownerSeat>=0?ownerSeat:null,
      promptType:prompt?.constructor?.name??null,
      message:enumName(GameMessage,prompt?.message),
      min:safeFinite(optionsObject.min??prompt?.min),
      max:safeFinite(optionsObject.max??prompt?.max),
      allowCancel:typeof (optionsObject.allowCancel??prompt?.allowCancel)==='boolean'
        ?(optionsObject.allowCancel??prompt?.allowCancel):null,
      isSecret:typeof (optionsObject.isSecret??prompt?.isSecret)==='boolean'
        ?(optionsObject.isSecret??prompt?.isSecret):null,
      selectableCount:selectableCount(prompt?.cards),
      cardsClass:prompt?.cards?.constructor?.name??null,
      pendingPromptCount:pendingPrompts,
      promptPlayerIdPresent:prompt?.playerId!=null,
      sourceCardPresent:prompt?.sourceCard!=null,
      stateMatchesLiveStore:Boolean(state&&state===this.state),
      triggeringAction:current?.actionName??null,
      triggeringDispatchOrdinal:current?.dispatchOrdinal??null,
      triggeringDispatchDepth:current?.dispatchDepth??null,
      triggeringTurnBefore:current?.turnBefore??null,
      triggeringPhaseBefore:current?.phaseBefore??null
    });
    audit.promptCount++;
    return result;
  }

  Object.defineProperty(Store.prototype,'dispatch',{...oldDispatch,value:observedDispatch});
  Object.defineProperty(Store.prototype,'prompt',{...oldPrompt,value:observedPrompt});
  try{
    const result=run();
    assert.ok(!result||typeof result.then!=='function',
      'Owner prompt metadata observer requires a synchronous callback');
    return {result,audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.agent10OwnerPromptMetadataAudit=audit;
    throw error;
  }finally{
    assert.equal(Store.prototype.prompt,observedPrompt);
    assert.equal(Store.prototype.dispatch,observedDispatch);
    Object.defineProperty(Store.prototype,'prompt',oldPrompt);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
  }
}

module.exports={VERSION,withOwnerPromptMetadataObserver};
