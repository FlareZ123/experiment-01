'use strict';
const assert=require('node:assert/strict');
const {snapshotOwnedGraph,compareOwnedGraphSnapshot}=
  require('./owned-source-graph-mutation.cjs');

/**
 * Classify changed original-State objects by whether they were reachable
 * through either live player's owned graph at decision ENTRY. Inspect saved
 * own-data descriptors only; do not invoke getters or expose concealed cards.
 * This is an alias diagnostic, not evidence of legal or illegal effects.
 * @param {object} state Native Store State before policy.
 * @param {()=>any} choose The original synchronous bot decision.
 * @param {{maxExamples?:number,maxObjects?:number}} [options]
 * @returns {{selected:any,audit:object}}
 */
function inspectNativeOwnerAliases(state,choose,{
  maxExamples=12,maxObjects=12000
}={}) {
  assert.equal(typeof choose,'function');
  const snap=snapshotOwnedGraph(state);
  const owns=snap.entries;
  const ownPlayerGraph=new Map();
  const queue=[[state.players,'state.players']],visited=new Set();
  for(let i=0;i<queue.length;i++) {
    if(i>=maxObjects)throw Error('Live player alias graph traversal limit reached');
    const [obj,path]=queue[i];
    if(!obj||typeof obj!=='object'||visited.has(obj))continue;
    visited.add(obj);ownPlayerGraph.set(obj,path);
    const desc=owns.get(obj)?.descriptors;
    if(!desc)continue;
    for(const key of Reflect.ownKeys(desc)) {
      const entry=desc[key];
      if(!Object.hasOwn(entry,'value'))continue;
      const child=entry.value;
      if(child&&typeof child==='object'&&!visited.has(child)) {
        queue.push([child,path+'.'+String(key)]);
      }
    }
  }
  const toolSlots=()=>state.players.map(p=>[p.active,...p.bench].map(slot=>slot.tools.map(c=>c.fullName)));
  const toolsBefore=toolSlots();
  let selected,error;
  try{selected=choose();}catch(failure){error=failure;}
  const toolsAfter=toolSlots();
  const delta=compareOwnedGraphSnapshot(snap,{maxExamples});
  let liveAliasMutatedObjects=0,liveAliasAtExit=0,changedObjects=0;
  const postPaths=delta.changedFields>0?
    snapshotOwnedGraph({players:state.players}).paths:null;
  const aliases=[];
  if(delta.changedFields>0){
    for(const [obj,entry] of owns){
      const single={entries:new Map([[obj,entry]]),
        paths:new Map([[obj,snap.paths.get(obj)]])};
      const changed=compareOwnedGraphSnapshot(single,{maxExamples:1});
      if(changed.changedFields===0)continue;
      changedObjects++;
      const path=ownPlayerGraph.get(obj);
      const exitPath=postPaths.get(obj)??null;
      if(exitPath!==null)liveAliasAtExit++;
      if(path!==undefined){
        liveAliasMutatedObjects++;
        if(aliases.length<maxExamples)aliases.push({
          entryPath:snap.paths.get(obj),
          livePlayerPath:path,livePlayerExitPath:exitPath,
          changedFields:changed.changedFields,
          firstMutationKind:changed.examples[0]?.kind??null
        });
      }
    }
  }
  const audit={changedFields:delta.changedFields,
    changedObjects,liveAliasMutatedObjects,liveAliasAtExit,
    examples:aliases,originalPathExamples:delta.examples,
    graphObjectsAtEntry:owns.size,liveObjectsAtEntry:visited.size,
    aliasClassificationComplete:queue.length<maxObjects,
    publicToolsBefore:delta.changedFields>0?toolsBefore:null,
    publicToolsAfter:delta.changedFields>0?toolsAfter:null,
    publicToolsChanged:JSON.stringify(toolsBefore)!==JSON.stringify(toolsAfter)};
  if(error)throw error;
  return {selected,audit};
}

/**
 * Read-only wrapper around pinned SimpleTacticsAi policy decisions.
 * @param {Function} BotClass
 * @param {{maxExamples?:number,maxDecisions?:number}} [options]
 */
function installNativeOwnerAliasObserver(BotClass,{
  maxExamples=8,maxDecisions=128
}={}) {
  const proto=BotClass.prototype;
  const original=Object.getOwnPropertyDescriptor(proto,'decodeNextAction');
  assert.equal(typeof original?.value,'function');
  let decisions=0,mutationDecisions=0,ownerAliasDecisions=0;
  const examples=[];
  function wrapped(state) {
    const r=inspectNativeOwnerAliases(state,
      ()=>original.value.apply(this,arguments),{maxExamples});
    decisions++;
    if(r.audit.changedFields>0) {
      mutationDecisions++;
      if(r.audit.liveAliasMutatedObjects>0)ownerAliasDecisions++;
      if(examples.length<maxDecisions)examples.push({
        ordinal:decisions,turn:state.turn,
        activeSeat:state.activePlayer,audit:r.audit
      });
    }
    return r.selected;
  }
  Object.defineProperty(proto,'decodeNextAction',{...original,value:wrapped});
  return {
    get report(){return {
      schema:'agent38-native-owner-alias-decision-v1',
      decisions,mutationDecisions,ownerAliasDecisions,examples:examples.slice()
    };},
    restore(){
      assert.strictEqual(proto.decodeNextAction,wrapped);
      Object.defineProperty(proto,'decodeNextAction',original);
    }
  };
}

module.exports={inspectNativeOwnerAliases,installNativeOwnerAliasObserver};
