'use strict';

const assert=require('node:assert/strict');
const nodePath=require('node:path');
const {
  beforeAcceptedTarget,afterAcceptedTarget,targetSidecar
}=require('./native-accepted-target-sidecar.cjs');

const VERSION='actual-store-physical-target-witness-v1';

/**
 * One exact alias observed between a Store full printing and the established
 * accepted-root public card label. Keep this narrowly scoped: a loose
 * normalization could wrongly link distinct physical cards.
 */
const EXACT_ROOT_PRINTING_ALIASES=Object.freeze({
  'Telepathic Psychic Energy':'Telepath [P] Energy M3',
  // Four authenticated rank5 Store abort receipts matched the same seat,
  // turn and action, differing only in this legacy printed name's hyphen.
  'Dedenne-GX':'Dedenne GX UNB',
  // Original rank19 36-arm source-readiness CI 41341992444 has four
  // fail-closed mismatches; action, seat and turn agreed in each case.
  // Keep only these two native physical source printings.
  'Ho-Oh-EX':'Ho-Oh EX DRX',
  'Arceus & Dialga & Palkia-GX':'Arceus & Dialga & Palkia GX CEC'
});

/** @param {string} rootName @param {string} printing @returns {boolean} */
function rootLabelMatchesNativePrinting(rootName,printing){
  if(typeof rootName!=='string'||typeof printing!=='string')return false;
  if(printing===rootName||printing.startsWith(rootName+' '))return true;
  return Object.hasOwn(EXACT_ROOT_PRINTING_ALIASES,rootName)&&
    EXACT_ROOT_PRINTING_ALIASES[rootName]===printing;
}

/**
 * Read-only comparison of native Store accepted physical target actions with
 * the independently archived root ledger. Never changes the game outcome.
 * @param {object[]|null} roots Actual postgame root ledger target actions.
 * @param {object[]} records Actual Store-dispatched target records.
 * @returns {{linked:boolean,rootCount:number|null,nativeCount:number,
 *   mismatchCount:number,firstMismatches:object[]}}
 */
function auditNativeTargetRootLinkage(roots,records){
  const firstMismatches=[];
  let mismatchCount=0;
  const note=(entry)=>{
    mismatchCount++;
    if(firstMismatches.length<12)firstMismatches.push(entry);
  };
  if(roots===null){
    note({reason:'missing-postgame-root-ledger'});
  }else{
    if(roots.length!==records.length)note({
      reason:'root-native-cardinality-mismatch',
      archivedRootCount:roots.length,acceptedStoreCount:records.length
    });
    const width=Math.max(roots.length,records.length);
    for(let i=0;i<width;i++){
      const row=roots[i],rec=records[i];
      if(!row||!rec){
        note({index:i,reason:row?'missing-store-record':'missing-archived-root'});
        continue;
      }
      const printing=rec.declared.ownerHandPrinting;
      const cardMatch=row.action!=='PlayCardAction'||
        rootLabelMatchesNativePrinting(row.card,printing);
      const comparisons={
        action:row.action===rec.action,
        seat:row.playerSlot===rec.playerSlot,
        turn:row.turnBefore===rec.turnBefore,
        physicalCardLabel:cardMatch
      };
      if(Object.values(comparisons).some(x=>x===false))note({
        index:i,reason:'root-native-target-mismatch',comparisons,
        archivedRootAction:row.action,nativeAction:rec.action,
        archivedSeat:row.playerSlot,nativeSeat:rec.playerSlot,
        archivedTurn:row.turnBefore,nativeTurn:rec.turnBefore,
        archivedCardLabel:row.card??null,nativePhysicalPrinting:printing??null
      });
    }
  }
  return {
    linked:roots!==null&&mismatchCount===0,
    rootCount:roots?.length??null,nativeCount:records.length,
    mismatchCount,firstMismatches
  };
}

/**
 * Post-decision, read-only native Store dispatch observer. It never feeds
 * identities or snapshots to the bot, and does not alter any action.
 * @template T
 * @param {()=>T} execute Synchronous real Store game.
 * @param {{Store?:Function}} [deps] Injection seam for pure tests.
 * @returns {{result:T,audit:object}}
 */
function withAcceptedTargetWitness(execute,deps={}){
  assert.equal(typeof execute,'function');
  const output=nodePath.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(nodePath.join(output,'game/store/store')).Store;
  const proto=Store.prototype;
  const previous=Object.getOwnPropertyDescriptor(proto,'dispatch');
  assert.equal(typeof previous?.value,'function');
  let live=null,dispatchOrdinal=0;
  const records=[];
  function audit(result=null){
    const roots=result?.rootActionLedger?.filter(row=>
      row.action==='PlayCardAction'||row.action==='RetreatAction')??null;
    const linkage=auditNativeTargetRootLinkage(roots,records);
    const linked=linkage.linked;
    const events=records.map((record,i)=>({
      ...record,rootActionOrdinal:linked?roots[i].actionOrdinal:null
    }));
    return {...targetSidecar(events),version:VERSION,
      rootOrdinalLinked:linked,
      ...(linked?{}:{rootOrdinalLinkageFailure:linkage}),
      acceptedTargetDispatches:records.length,
      observedLiveStore:live!==null,
      legacyRootProtocolUnaffected:true,competitiveGameQualified:false};
  }
  function capture(action,...args){
    if(!live&&action?.constructor?.name==='AddPlayerAction')live=this;
    if(this!==live)return previous.value.call(this,action,...args);
    dispatchOrdinal++;
    const state=this.state;
    const type=action?.constructor?.name;
    const pending=state.prompts?.find(p=>p.result===undefined)??null;
    const actorId=pending?.playerId??action?.clientId??action?.id;
    const seat=state.players.findIndex(player=>player.id===actorId);
    const before=(type==='PlayCardAction'||type==='RetreatAction')?
      beforeAcceptedTarget(state,action,seat,dispatchOrdinal,state.turn):null;
    try{
      const result=previous.value.call(this,action,...args);
      if(before)records.push(afterAcceptedTarget(before,this.state));
      return result;
    }catch(error){
      if(error&&typeof error==='object')
        error.nativeAcceptedTargetEvidence=audit();
      throw error;
    }
  }
  Object.defineProperty(proto,'dispatch',{...previous,value:capture});
  try{
    const result=execute();
    return {result,audit:audit(result)};
  }catch(error){
    if(error&&typeof error==='object'&&
       !error.nativeAcceptedTargetEvidence)
      error.nativeAcceptedTargetEvidence=audit();
    throw error;
  }finally{
    assert.strictEqual(proto.dispatch,capture);
    Object.defineProperty(proto,'dispatch',previous);
  }
}
/**
 * The headless runner wraps a rejected Store action in an Error with a cause;
 * policy adapters may add another cause. Recover the nearest authentic
 * receipt without fabricating a successful result.
 * @param {unknown} error
 * @returns {object|null}
 */
function acceptedTargetAbortEvidence(error){
  const seen=new Set();
  for(let current=error,depth=0;current&&typeof current==='object'&&
      depth<12&&!seen.has(current);current=current.cause,depth++){
    seen.add(current);
    if(current.nativeAcceptedTargetEvidence?.schema===
        'actual-store-declared-target-sidecar-v1')
      return current.nativeAcceptedTargetEvidence;
  }
  return null;
}

module.exports={VERSION,withAcceptedTargetWitness,acceptedTargetAbortEvidence,
  rootLabelMatchesNativePrinting,auditNativeTargetRootLinkage};
