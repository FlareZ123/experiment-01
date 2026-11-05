'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent39-paper-prompt-portfolio-v4-physical-settlement';
const PRINTING='Iron Thorns ex TWM';

/**
 * Independently check the printed Volt Cyclone transfer contract against the
 * pending physical Store state. Only prompts positively marked by the actual
 * Iron Thorns ex TWM attack reducer are eligible for this verdict.
 * @param {object} state Genuine Store state, inaccessible to bot policy.
 * @param {object} prompt Positively attributed native attack prompt.
 * @param {unknown} result Submitted physical CardAssign[] reply.
 * @param {object} types Pinned Store enums.
 * @returns {{valid:boolean,reason:string}}
 */
function verdictVoltCyclone(state,prompt,result,types){
  const {PlayerType,SlotType,SuperType}=types;
  const owner=state?.players?.find(p=>p.id===prompt?.playerId);
  if(!owner||!Array.isArray(owner.bench)||
     !Array.isArray(owner.active?.cards)||
     prompt.cardList!==owner.active||
     prompt.playerType!==PlayerType.BOTTOM_PLAYER||
     !Array.isArray(prompt.slots)||
     prompt.slots.length!==1||prompt.slots[0]!==SlotType.BENCH)
    return {valid:false,reason:'unmatched-original-source-contract'};
  if(!Array.isArray(result)||result.length!==1)
    return {valid:false,reason:'exactly-one-energy-required'};
  const {card,to}=result[0]??{};
  if(!card||card.superType!==SuperType.ENERGY||
     !owner.active.cards.includes(card))
    return {valid:false,reason:'energy-not-attached-to-attacker'};
  if(!to||to.player!==PlayerType.BOTTOM_PLAYER||
     to.slot!==SlotType.BENCH||!Number.isSafeInteger(to.index)||
     to.index<0||to.index>=owner.bench.length||
     !Array.isArray(owner.bench[to.index]?.cards)||
     owner.bench[to.index].cards.length===0)
    return {valid:false,reason:'recipient-not-occupied-own-bench'};
  // Native validator disagreement is separate from independent printed geometry.
  return {valid:true,reason:'printed-one-active-energy-to-own-bench'};
}

/**
 * One shared Store dispatch boundary, currently certifying only the TWM77
 * Volt Cyclone mandatory transfer. All other resolved prompts are explicitly
 * unverified. Card reducer marking is used because attack prompts are not
 * reliably source-stamped. The reducer is restored even when native throws.
 *
 * @template T
 * @param {()=>T} run Synchronous native Store game.
 * @param {{Store?:Function,IronThornsex?:Function,types?:object,
 *  liveStore?:object}} [deps] An explicit genuine Store for staged fixtures;
 *  ordinary native games discover it at the first AddPlayerAction.
 * @returns {{result:T,audit:object}}
 */
function withPaperPromptPortfolio(run,deps={}){
  assert.equal(typeof run,'function');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const native=(name)=>require(path.join(root,name));
  const Store=deps.Store??native('game/store/store').Store;
  const IronThornsex=deps.IronThornsex??native(
    'sets/10-scarlet-and-violet/set-twilight-masquerade/iron-thorns-ex').IronThornsex;
  const types=deps.types??{
    ...native('game/store/actions/play-card-action'),
    ...native('game/store/card/card-types')
  };
  const d=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const r=Object.getOwnPropertyDescriptor(IronThornsex.prototype,'reduceEffect');
  assert.equal(typeof d?.value,'function');
  assert.equal(typeof r?.value,'function');
  const attributed=new WeakSet();
  const storeIds=new WeakMap();
  let nextStoreId=0;
  let liveStore=deps.liveStore??null;
  if(liveStore!==null)assert.ok(liveStore instanceof Store);
  const scopeOf=store=>liveStore===null?'unattributed':
    store===liveStore?'live':'auxiliary';
  const storeId=store=>{
    if(!storeIds.has(store))storeIds.set(store,nextStoreId++);
    return storeIds.get(store);
  };
  const audit={schema:VERSION,contractPrintings:[PRINTING],
    provenance:'all-Store dispatch attempts separated from genuine live Store',
    liveStoreObserved:liveStore!==null,allStoreDispatchAttempts:true,
    liveResolutionCount:0,livePaperVerifiedNativeAccepted:0,
    liveNativeReturnedWithoutThrow:0,liveNativePromptSettled:0,
    liveNativeSilentNoop:0,livePaperVerifiedPhysicalEffect:0,
    livePaperVerifiedWithoutPhysicalEffect:0,
    livePaperInvalidVetoed:0,livePaperUnverified:0,
    liveNativeRejectedAfterPreflight:0,
    auxiliaryResolutionCount:0,unattributedResolutionCount:0,
    sourceMarkedPromptCountByScope:{live:0,auxiliary:0,unattributed:0},
    resolutionCount:0,paperVerifiedNativeAccepted:0,
    paperInvalidVetoed:0,paperUnverified:0,nativeRejectedAfterPreflight:0,
    sourceMarkedPromptCount:0,events:[],
    allPromptFamiliesPaperVerified:false,competitiveGameQualified:false};
  function reduced(store,state,effect){
    const relevant=effect?.constructor?.name==='AfterAttackEffect'&&
      effect.attack===this.attacks?.[0];
    const prior=relevant?new Set(state.prompts):null;
    const outcome=r.value.call(this,store,state,effect);
    if(relevant&&scopeOf(store)==='live'){
      for(const prompt of state.prompts){
        if(!prior.has(prompt)&&prompt?.constructor?.name==='AttachEnergyPrompt'&&
           prompt.playerId===effect.player?.id){
          attributed.add(prompt);
          audit.sourceMarkedPromptCount++;
          audit.sourceMarkedPromptCountByScope[scopeOf(store)]++;
        }
      }
    }
    return outcome;
  }
  function dispatched(action,...args){
    const ordinal=storeId(this);
    if(liveStore===null&&action?.constructor?.name==='AddPlayerAction'){
      liveStore=this;
      audit.liveStoreObserved=true;
    }
    if(action?.constructor?.name!=='ResolvePromptAction')
      return d.value.call(this,action,...args);
    const storeScope=scopeOf(this);
    if(storeScope==='live')audit.liveResolutionCount++;
    else if(storeScope==='auxiliary')audit.auxiliaryResolutionCount++;
    else audit.unattributedResolutionCount++;
    audit.resolutionCount++;

    // Pin the exact unresolved prompt object before invoking native Store.
    // Store.reducePrompt may silently return unchanged for stale/missing items.
    const pending=this.state.prompts?.find(p=>p.id===action.id&&
      p.result===undefined);
    if(storeScope!=='live'){
      const entry={storeOrdinal:ordinal,storeScope,
        status:'AUXILIARY_NOT_SCREENED',nativeReturnedWithoutThrow:false,
        nativePromptSettled:false,nativeAccepted:false};
      audit.events.push(entry);
      const output=d.value.call(this,action,...args);
      entry.nativeReturnedWithoutThrow=true;
      entry.nativePromptSettled=!!pending&&pending.result===action.result;
      entry.nativeAccepted=entry.nativePromptSettled;
      return output;
    }

    const marked=!!pending&&attributed.has(pending);
    const paper=marked?
      verdictVoltCyclone(this.state,pending,action.result,types):null;
    const status=!marked?'PAPER_PROMPT_UNVERIFIED':paper.valid?
      'PAPER_PROMPT_VERIFIED':'PAPER_PROMPT_INVALID';
    const entry={turn:this.state.turn??null,promptId:pending?.id??null,
      storeOrdinal:ordinal,storeScope,
      sourceSeat:this.state.players?.findIndex(p=>
        p.id===pending?.playerId)??-1,
      family:pending?.constructor?.name??null,
      sourcePrinting:marked?PRINTING:null,status,
      count:Array.isArray(action.result)?action.result.length:null,
      reason:paper?.reason??'no-independent-printed-contract',
      nativeReturnedWithoutThrow:false,nativePromptSettled:false,
      physicalEffectVerified:false,nativeAccepted:false};
    if(status==='PAPER_PROMPT_UNVERIFIED'){
      audit.paperUnverified++;
      audit.livePaperUnverified++;
    }
    audit.events.push(entry);
    if(status==='PAPER_PROMPT_INVALID'){
      audit.paperInvalidVetoed++;
      audit.livePaperInvalidVetoed++;
      throw new Error('PAPER_PROMPT_INVALID:'+PRINTING+':'+paper.reason);
    }

    // The printed contract is the physical movement of this exact Energy.
    // Capture original destination occupancy so a preexisting duplicate
    // reference cannot masquerade as a successful transfer.
    const owner=marked?this.state.players.find(p=>p.id===pending.playerId):null;
    const movedCard=marked?action.result[0].card:null;
    const target=marked?owner.bench[action.result[0].to.index]:null;
    const targetPreviouslyHadCard=marked&&target.cards.includes(movedCard);
    try{
      const output=d.value.call(this,action,...args);
      entry.nativeReturnedWithoutThrow=true;
      audit.liveNativeReturnedWithoutThrow++;
      entry.nativePromptSettled=!!pending&&pending.result===action.result;
      if(entry.nativePromptSettled)audit.liveNativePromptSettled++;
      else audit.liveNativeSilentNoop++;
      entry.physicalEffectVerified=!!(marked&&entry.nativePromptSettled&&
        !targetPreviouslyHadCard&&
        !owner.active.cards.includes(movedCard)&&
        target.cards.includes(movedCard)&&
        (!Array.isArray(owner.active.energies?.cards)||
          !owner.active.energies.cards.includes(movedCard))&&
        (!Array.isArray(target.energies?.cards)||
          target.energies.cards.includes(movedCard)));
      entry.nativeAccepted=marked?
        entry.nativePromptSettled&&entry.physicalEffectVerified:
        entry.nativePromptSettled;
      if(status==='PAPER_PROMPT_VERIFIED'){
        if(entry.physicalEffectVerified){
          audit.paperVerifiedNativeAccepted++;
          audit.livePaperVerifiedNativeAccepted++;
          audit.livePaperVerifiedPhysicalEffect++;
        }else{
          audit.livePaperVerifiedWithoutPhysicalEffect++;
          entry.status=entry.nativePromptSettled?
            'PAPER_PROMPT_SETTLED_EFFECT_UNVERIFIED':
            'PAPER_PROMPT_NATIVE_UNSETTLED';
        }
      }
      return output;
    }catch(error){
      audit.nativeRejectedAfterPreflight++;
      audit.liveNativeRejectedAfterPreflight++;
      throw error;
    }
  }
  Object.defineProperty(IronThornsex.prototype,'reduceEffect',
    {...r,value:reduced});
  Object.defineProperty(Store.prototype,'dispatch',
    {...d,value:dispatched});
  try{return {result:run(),audit};}
  catch(error){
    if(error&&typeof error==='object')error.paperPromptPortfolioEvidence=audit;
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatched);
    assert.strictEqual(IronThornsex.prototype.reduceEffect,reduced);
    Object.defineProperty(Store.prototype,'dispatch',d);
    Object.defineProperty(IronThornsex.prototype,'reduceEffect',r);
  }
}

module.exports={VERSION,PRINTING,verdictVoltCyclone,withPaperPromptPortfolio};
