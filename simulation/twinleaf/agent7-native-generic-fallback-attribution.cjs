'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent7-native-generic-fallback-attribution-v2-distinct-prompts';

/**
 * Read-only accounting of real Store decoder calls which reached the original
 * unqualified bot after actor-only adapters delegated. Install as the
 * outermost wrapper before canonical policy adapters. No card identities,
 * prompt values, hand, deck or Prize contents are retained.
 * @template T
 * @param {()=>T} run Synchronous native Store workload.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,maxRecords?:number}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withNativeGenericFallbackAttribution(run,deps={}){
  assert.equal(typeof run,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const maxRecords=deps.maxRecords??96;
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=0);
  const decode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const dispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof decode?.value,'function');
  assert.equal(typeof dispatch?.value,'function');
  let liveStore=null,gameIndex=0,seenNativePrompts=new WeakSet();
  const byKind=()=>({'owner-prompt':0,'owner-root-or-setup':0,
    'foreign-prompt':0,'out-of-turn':0});
  const audit={version:VERSION,readOnly:true,gameStoresSeen:0,
    liveGenericDecodes:0,nonLiveDelegations:0,unknownActorDelegations:0,
    failedGenericDecodes:0,bySeat:{0:byKind(),1:byKind()},
    byOwnerPromptType:{0:{},1:{}},
    distinctOwnerPromptObjects:0,
    distinctOwnerPromptBySeat:{0:0,1:0},
    distinctOwnerPromptType:{0:{},1:{}},actionTypes:{},
    boundedRecords:[],unrecordedLiveDecodes:0,
    qualification:{fullyActorOnly:false,competitiveGames:0},
    limitation:'Decoder calls represent fallback exposure, not accepted actions, playing strength or hidden-information safety.'};
  function observedDispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;
      seenNativePrompts=new WeakSet();
      gameIndex++;
      audit.gameStoresSeen=gameIndex;
    }
    return dispatch.value.apply(this,[action,...args]);
  }
  function observedDecode(state,...args){
    const live=state===liveStore?.state;
    let action;
    try{action=decode.value.apply(this,[state,...args]);}
    catch(error){if(live)audit.failedGenericDecodes++;throw error;}
    if(!live){audit.nonLiveDelegations++;return action;}
    if(!Array.isArray(state.players)){
      audit.unknownActorDelegations++;return action;
    }
    const seat=state.players.findIndex(p=>p.id===this.client?.id);
    if(seat!==0&&seat!==1){
      audit.unknownActorDelegations++;return action;
    }
    const pending=state.prompts?.find(p=>p.result===undefined)??null;
    const owned=Boolean(pending&&pending.playerId===this.client.id);
    const kind=owned?'owner-prompt':pending?'foreign-prompt':
      state.activePlayer===seat?'owner-root-or-setup':'out-of-turn';
    const promptType=owned?(pending.constructor?.name??'UnknownPrompt'):null;
    const actionType=action?.constructor?.name??'NoAction';
    const newPrompt=owned&&!seenNativePrompts.has(pending);
    if(newPrompt){
      seenNativePrompts.add(pending);
      audit.distinctOwnerPromptObjects++;
      audit.distinctOwnerPromptBySeat[seat]++;
      const distinct=audit.distinctOwnerPromptType[seat];
      distinct[promptType]=(distinct[promptType]??0)+1;
    }
    audit.liveGenericDecodes++;
    audit.bySeat[seat][kind]++;
    audit.actionTypes[actionType]=(audit.actionTypes[actionType]??0)+1;
    if(promptType!==null){
      const counts=audit.byOwnerPromptType[seat];
      counts[promptType]=(counts[promptType]??0)+1;
    }
    if(audit.boundedRecords.length<maxRecords)
      audit.boundedRecords.push({gameIndex,seat,turn:state.turn,
        phase:state.phase,decisionKind:kind,promptType,actionType,
        firstDecoderCallForPrompt:newPrompt});
    else audit.unrecordedLiveDecodes++;
    return action;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...dispatch,value:observedDispatch});
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...decode,value:observedDecode});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,observedDispatch);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,observedDecode);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',decode);
    Object.defineProperty(Store.prototype,'dispatch',dispatch);
  }
}
module.exports={VERSION,withNativeGenericFallbackAttribution};
