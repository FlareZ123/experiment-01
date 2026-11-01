'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {verdictVoltCyclone}=require('./agent39-paper-prompt-portfolio.cjs');
const {campingGearPaperVerdict}=
  require('./agent12-campinggear-prompt-paper-hook.cjs');
/**
 * Check only independently observable native PutDamage zero-target and
 * whole-packet negative restrictions. Do not first call prompt.validate:
 * the vendor validator can reject otherwise valid paper replies, and an
 * unrelated validation false must not become a paper-invalid verdict.
 *
 * @param {object} prompt Pending native PutDamagePrompt.
 * @param {unknown} answer Native physical answer.
 * @returns {string|null} Independently covered negative predicate or null.
 */
function independentPutDamageNegative(prompt,answer){
  if(!Array.isArray(answer))return null;
  const multiple=prompt.options?.damageMultiple;
  for(const row of answer){
    if(!Number.isSafeInteger(row?.damage)||row.damage<0)
      return 'INVALID_DAMAGE_AMOUNT';
    if(row.damage===0)continue;
    if(Number.isSafeInteger(multiple)&&multiple>0&&
      row.damage%multiple!==0)
      return 'INVALID_PRINTED_DAMAGE_PACKET';
    const target=row.target;
    const allowed=Array.isArray(prompt.maxAllowedDamage)?
      prompt.maxAllowedDamage:[];
    const cap=allowed.find(entry=>
      entry.target.player===target?.player&&
      entry.target.slot===target?.slot&&
      entry.target.index===target?.index);
    if(cap?.damage===0)return 'PRINTED_TARGET_ZERO_CAP';
  }
  return null;
}

const {nightWatchLikeShape}=
  require('./agent12-nightwatch-paper-random-chooser.cjs');

const VERSION='agent41-unified-paper-prompt-contract-portfolio-v2-live-store-only';
const STATUSES=['PAPER_PROMPT_VERIFIED','PAPER_PROMPT_INVALID',
  'PAPER_PROMPT_UNVERIFIED'];

/**
 * One research-owned native Store.dispatch boundary. Printed checks are
 * intentionally narrow: positive status certifies only the named contract.
 * All other families, including selection randomness, remain unverified.
 *
 * @template T
 * @param {()=>T} run Synchronous complete game, cohort, or native fixture.
 * @param {{Store?:Function,IronThornsex?:Function,types?:object,
 *  currentTrialId?:()=>string|null,exampleLimit?:number,
 *  requireLiveStore?:boolean}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPaperPromptContractPortfolio(run,deps={}){
  assert.equal(typeof run,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const native=p=>require(path.join(output,p));
  const Store=deps.Store??native('game/store/store').Store;
  const IronThornsex=deps.IronThornsex??native(
    'sets/10-scarlet-and-violet/set-twilight-masquerade/iron-thorns-ex').IronThornsex;
  const types=deps.types??{
    ...native('game/store/actions/play-card-action'),
    ...native('game/store/card/card-types')
  };
  const dispatchBefore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const reducerBefore=Object.getOwnPropertyDescriptor(
    IronThornsex.prototype,'reduceEffect');
  assert.equal(typeof dispatchBefore?.value,'function');
  assert.equal(typeof reducerBefore?.value,'function');
  const limit=deps.exampleLimit??24;
  assert.ok(Number.isSafeInteger(limit)&&limit>=0&&limit<=100);
  const marked=new WeakSet();
  const liveByTrial=new Map();
  const liveOnly=deps.requireLiveStore===true;
  const trialKey=()=>deps.currentTrialId?.()??'__single__';
  const isLive=store=>!liveOnly||liveByTrial.get(trialKey())===store;
  const storeIndices=new WeakMap();
  const byTrial=Object.create(null);
  const audit={
    schema:VERSION,contractScope:[
      'Camping Gear BST mandatory own-deck exactly-one search',
      'Iron Thorns ex TWM printed Volt Cyclone transfer, positively reducer-marked',
      'PutDamagePrompt declared zero-target and whole-packet rejection only'
    ],
    resolvedNativeReplies:0,nativeAccepted:0,nativeRejected:0,
    vetoedBeforeDispatch:0,markedVoltCyclonePrompts:0,
    liveStoreRequired:liveOnly,liveSourceTrialCount:0,
    auxiliaryPromptAttempts:0,preLivePromptAttempts:0,
    statusCounts:Object.fromEntries(STATUSES.map(s=>[s,0])),
    byFamily:{},byTrial,storeCount:0,stores:[],firstByStatus:{},
    examples:[],examplesTruncated:false,
    entireGamePaperQualified:false,competitiveQualifiedGames:0
  };
  function storeRow(store){
    let index=storeIndices.get(store);
    if(index===undefined){
      index=audit.stores.length;
      storeIndices.set(store,index);
      audit.stores.push({storeOrdinal:index,trialIds:[],
        acceptedPromptReplies:0,attemptedPromptReplies:0});
      audit.storeCount++;
    }
    return audit.stores[index];
  }
  function reduced(store,state,effect){
    const eligible=isLive(store)&&
      effect?.constructor?.name==='AfterAttackEffect'&&
      effect.attack===this.attacks?.[0];
    const before=eligible?new Set(state.prompts):null;
    const result=reducerBefore.value.call(this,store,state,effect);
    if(before){
      for(const prompt of state.prompts){
        if(!before.has(prompt)&&
          prompt?.constructor?.name==='AttachEnergyPrompt'&&
          prompt.playerId===effect.player?.id){
          marked.add(prompt);
          audit.markedVoltCyclonePrompts++;
        }
      }
    }
    return result;
  }
  function dispatched(action,...args){
    const type=action?.constructor?.name;
    if(liveOnly&&type==='AddPlayerAction'&&
      !liveByTrial.has(trialKey())){
      liveByTrial.set(trialKey(),this);
      audit.liveSourceTrialCount++;
    }
    if(liveOnly&&!isLive(this)){
      if(type==='ResolvePromptAction'){
        if(liveByTrial.has(trialKey()))audit.auxiliaryPromptAttempts++;
        else audit.preLivePromptAttempts++;
      }
      return dispatchBefore.value.call(this,action,...args);
    }
    const store=storeRow(this);
    if(type!=='ResolvePromptAction')
      return dispatchBefore.value.call(this,action,...args);
    const prompt=this.state.prompts?.find(p=>p.id===action.id&&
      p.result===undefined);
    const family=prompt?.constructor?.name??'missing-pending-prompt';
    const trial=deps.currentTrialId?.()??null;
    const camping=campingGearPaperVerdict(this.state,action);
    const volt=Boolean(prompt&&marked.has(prompt));
    let status='PAPER_PROMPT_UNVERIFIED';
    let sourcePrinting=prompt?.sourceCard?.fullName??null;
    let contract=null;
    let reason='no-independent-printed-contract';
    if(volt){
      sourcePrinting='Iron Thorns ex TWM';
      contract='printed-volt-cyclone-energy-transfer';
      const result=verdictVoltCyclone(this.state,prompt,action.result,types);
      status=result.valid?'PAPER_PROMPT_VERIFIED':'PAPER_PROMPT_INVALID';
      reason=result.reason;
    }else if(camping.applicable){
      sourcePrinting='Camping Gear BST';
      contract='mandatory-one-own-deck-card';
      status=camping.paperValid?'PAPER_PROMPT_VERIFIED':'PAPER_PROMPT_INVALID';
      reason=camping.paperValid?'printed-search-count-and-zone-matched':
        'printed-own-deck-exactly-one-or-native-validator-failed';
    }else if(family==='PutDamagePrompt'){
      contract='declared-zero-target-and-whole-packet-negative-only';
      const rejected=independentPutDamageNegative(prompt,action.result);
      if(['PRINTED_TARGET_ZERO_CAP','INVALID_PRINTED_DAMAGE_PACKET',
        'INVALID_DAMAGE_AMOUNT'].includes(rejected)){
        status='PAPER_PROMPT_INVALID';
      }
      reason=rejected??'only-negative-predicates-audited';
    }else if(prompt){
      const owner=this.state.players?.find(p=>p.id===prompt.playerId);
      if(owner&&nightWatchLikeShape(this.state,owner,prompt)){
        contract='night-watch-like-opponent-hand-shape-only';
        reason='paper-randomness-not-independently-sampled-or-attributed';
      }
    }
    const event={storeOrdinal:store.storeOrdinal,trialId:trial,
      turn:this.state.turn??null,family,sourcePrinting,
      contract,status,reason,submittedCount:Array.isArray(action.result)?
        action.result.length:null,nativeAccepted:false,
      vetoedBeforeDispatch:false};
    audit.resolvedNativeReplies++;
    store.attemptedPromptReplies++;
    if(trial){
      const record=byTrial[trial]??={attempted:0,nativeAccepted:0,
        statusCounts:Object.fromEntries(STATUSES.map(s=>[s,0])),events:[]};
      record.attempted++;
      record.statusCounts[status]++;
      record.events.push(event);
      if(!store.trialIds.includes(trial))store.trialIds.push(trial);
    }
    audit.statusCounts[status]++;
    audit.byFamily[family]??={count:0,
      statusCounts:Object.fromEntries(STATUSES.map(s=>[s,0]))};
    audit.byFamily[family].count++;
    audit.byFamily[family].statusCounts[status]++;
    if(!audit.firstByStatus[status])audit.firstByStatus[status]=event;
    if(audit.examples.length<limit)audit.examples.push(event);
    else audit.examplesTruncated=true;
    if(status==='PAPER_PROMPT_INVALID'){
      event.vetoedBeforeDispatch=true;
      audit.vetoedBeforeDispatch++;
      throw new Error('PAPER_PROMPT_INVALID:'+String(contract)+':'+reason);
    }
    try{
      const result=dispatchBefore.value.call(this,action,...args);
      event.nativeAccepted=true;
      store.acceptedPromptReplies++;
      audit.nativeAccepted++;
      if(trial)byTrial[trial].nativeAccepted++;
      return result;
    }catch(error){
      audit.nativeRejected++;
      throw error;
    }
  }
  Object.defineProperty(IronThornsex.prototype,'reduceEffect',
    {...reducerBefore,value:reduced});
  Object.defineProperty(Store.prototype,'dispatch',
    {...dispatchBefore,value:dispatched});
  try{return {result:run(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent41UnifiedPaperPromptPortfolio=audit;
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatched);
    assert.strictEqual(IronThornsex.prototype.reduceEffect,reduced);
    Object.defineProperty(Store.prototype,'dispatch',dispatchBefore);
    Object.defineProperty(IronThornsex.prototype,'reduceEffect',reducerBefore);
  }
}
module.exports={VERSION,independentPutDamageNegative,
  withPaperPromptContractPortfolio};
