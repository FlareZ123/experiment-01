'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent7-late-candidate-owner-root-physical-audit-v1';
const LILLIE="Lillie's Determination M1L";
const ROOT_KINDS=new Set([
  'PassTurnAction','PlayCardAction','AttackAction','UseAbilityAction',
  'AttachEnergyAction','RetreatAction'
]);

/**
 * Observe real owner-originated late native actions without changing a move.
 * The observer reads only the candidate's own private hand/deck counts, its
 * own Supporter quota, and public turn/prompt context. Records from different
 * games are kept separate by their real AddPlayerAction Store instance.
 *
 * @template T
 * @param {()=>T} execute Synchronous historical native replay.
 * @param {object[]} trials Ordered, already-registered native trials.
 * @param {{Store?:Function,minTurn?:number,deckThreshold?:number,
 *   probe?:(state:object,seat:0|1)=>object,probeMaxDeck?:number}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withLateOwnerRootPhysicalAudit(execute,trials,deps={}){
  assert.equal(typeof execute,'function');
  assert.ok(Array.isArray(trials)&&trials.length>0);
  for(const trial of trials)
    assert.ok(trial?.candidateSlot==='A'||trial?.candidateSlot==='B');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  const minTurn=deps.minTurn??16;
  const deckThreshold=deps.deckThreshold??8;
  assert.ok(Number.isSafeInteger(minTurn)&&minTurn>=1);
  assert.ok(Number.isSafeInteger(deckThreshold)&&deckThreshold>=0);
  const instances=new WeakMap();
  const counts=new WeakMap();
  let realGameCount=0;
  const rows=trials.map(t=>({
    trialId:t.id,candidateSeat:t.candidateSlot==='A'?0:1,
    observedOwnerRoots:0,observedCandidateDispatches:0,
    lateRootEvents:[],nativeRejectedRootCount:0,
    candidateDeckZeroSeen:false,candidateDeckZeroFirstDispatch:null,
    rootSnapshotTruncated:false
  }));

  function dispatch(action,...args){
    const kind=action?.constructor?.name??null;
    if(kind==='AddPlayerAction'&&!instances.has(this)){
      instances.set(this,realGameCount++);
      counts.set(this,0);
    }
    const index=instances.get(this);
    const row=index===undefined?null:rows[index];
    const state=this.state;
    const owner=row?state?.players?.[row.candidateSeat]:null;
    const deck=owner?.deck?.cards?.length;
    const withinScope=!!owner&&Number.isSafeInteger(deck)&&
      (state.turn>=minTurn||deck<=deckThreshold);
    const ordinal=row?(counts.get(this)??0)+1:0;
    if(row)counts.set(this,ordinal);
    if(withinScope) {
      row.observedCandidateDispatches++;
      if(deck===0&&!row.candidateDeckZeroSeen){
        row.candidateDeckZeroSeen=true;
        row.candidateDeckZeroFirstDispatch={
          storeOrdinal:ordinal,globalTurn:state.turn,
          activePlayer:state.activePlayer,actionKind:kind,
          ownerHandSize:owner.hand?.cards?.length??null,
          heldLillie:owner.hand?.cards?.filter(x=>x?.fullName===LILLIE).length??null,
          supporterTurn:owner.supporterTurn??null
        };
      }
    }
    const actorId=action?.clientId??action?.playerId??action?.id;
    const root=withinScope&&state.activePlayer===row.candidateSeat&&
      ROOT_KINDS.has(kind)&&actorId===owner.id&&
      !state.prompts?.some(p=>p.result===undefined);
    let event=null;
    if(root){
      const ownHand=owner.hand.cards.map(card=>card?.fullName??null);
      event={
        storeOrdinal:ordinal,globalTurn:state.turn,actionKind:kind,
        ownerHandPrintings:ownHand,ownerHandCount:ownHand.length,
        ownerDeckCount:deck,
        ownerPrizeCount:owner.prizes?.filter(p=>p.cards?.length>0).length??null,
        supporterTurn:owner.supporterTurn??null,
        heldLillieCount:ownHand.filter(x=>x===LILLIE).length,
        pendingPromptCount:0,
        selectedCard:kind==='PlayCardAction'&&
          Number.isInteger(action.handIndex)?
          ownHand[action.handIndex]??null:null,
        nativeAccepted:false,nativeError:null
      };
      row.observedOwnerRoots++;
      if(typeof deps.probe==='function'&&kind==='AttackAction'&&
         deck<=(deps.probeMaxDeck??1)&&event.heldLillieCount>0){
        try{
          event.detachedLillieBeforeAttack=deps.probe(state,row.candidateSeat);
        }catch(error){
          event.detachedLillieBeforeAttack={
            outcome:'DETACHED_PROBE_ERROR',error:String(error?.message??error)
          };
        }
      }
      if(row.lateRootEvents.length<256)row.lateRootEvents.push(event);
      else row.rootSnapshotTruncated=true;
    }
    try{
      const output=previous.value.call(this,action,...args);
      if(event)event.nativeAccepted=true;
      return output;
    }catch(error){
      if(event){
        row.nativeRejectedRootCount++;
        event.nativeError=String(error?.message??error);
      }
      throw error;
    }
  }

  Object.defineProperty(Store.prototype,'dispatch',{
    ...previous,value:dispatch
  });
  try{
    const result=execute();
    assert.equal(realGameCount,trials.length,
      'Every registered trial must create one native Store game');
    return {result,audit:{
      version:VERSION,originalTrials:trials.map(t=>t.id),
      readOnly:true,originalMovesChanged:false,
      minTurn,deckThreshold,realGameCount,rows,
      competitiveQualifiedGames:0
    }};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}

module.exports={VERSION,LILLIE,withLateOwnerRootPhysicalAudit};
