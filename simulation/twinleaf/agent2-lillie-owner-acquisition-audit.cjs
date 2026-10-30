'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent2-native-lillie-owner-postdraw-acquisition-v1';
const PRINTING="Lillie's Determination M1L";

/**
 * Record only the acting owner's own-hand pre/post card *membership booleans*
 * for the first subsequently played Pokémon in that same turn.
 * This native Store observer never supplies a decision, reads opposing hidden
 * zones, changes a reducer, or emits the complete private hand.
 *
 * @template T
 * @param {()=>T} execute Native Store experiment(s)
 * @param {{Store?:Function}} [deps] Injectable Store for pure tests
 * @returns {{result:T,audit:object}}
 */
function withNativeLillieOwnerAcquisitionAudit(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof prior?.value,'function');
  let liveStore=null,current=null;
  const records=[];
  const kind=action=>action?.constructor?.name;
  const findOwner=(store,id)=>store.state?.players?.find(x=>x.id===id);
  function checkSettled(store){
    if(!current||current.store!==store||current.settled)return;
    const state=store.state;
    if(state.prompts.some(p=>p.result===undefined))return;
    const p=findOwner(store,current.id);
    if(!p)return;
    const names=new Set(p.hand.cards.map(c=>c.fullName));
    current.postNames=names;
    current.settled=state.turn===current.turn;
    current.record.nativePromptResolvedSameTurn=current.settled;
    current.record.afterHandCount=p.hand.cards.length;
    if(!current.settled)current=null;
  }
  function observed(action,...args){
    const type=kind(action);
    if(type==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;
      current=null;
    }
    const live=this===liveStore;
    let newEvent=null;
    if(live&&type==='PlayCardAction'){
      const p=findOwner(this,action.id);
      const chosen=p?.hand?.cards?.[action.handIndex];
      if(chosen?.fullName===PRINTING){
        const before=new Set(p.hand.cards.map(c=>c.fullName));
        const record={schema:VERSION,seat:this.state.players.indexOf(p),
          turn:this.state.turn,printing:PRINTING,
          beforeHandCount:p.hand.cards.length,
          afterHandCount:null,nativePromptResolvedSameTurn:false,
          firstNextPokemonPlay:null};
        newEvent={store:this,id:p.id,turn:this.state.turn,
          beforeNames:before,postNames:null,record,settled:false};
        records.push(record);
      }else if(current?.store===this&&current.settled&&
          current.id===p?.id&&current.turn===this.state.turn&&
          current.record.firstNextPokemonPlay===null&&
          Array.isArray(chosen?.attacks)){
        const printing=chosen.fullName;
        current.record.firstNextPokemonPlay={
          printing,
          existedBeforeShuffle:current.beforeNames.has(printing),
          existedImmediatelyAfterDraw:current.postNames.has(printing),
          nativeHandPlayAttempt:true
        };
      }
    }
    let result;
    try{
      result=prior.value.apply(this,[action,...args]);
    }catch(error){
      if(newEvent)newEvent.record.rootDispatchError=String(error?.message??error);
      throw error;
    }
    if(newEvent)current=newEvent;
    if(live)checkSettled(this);
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...prior,value:observed});
  try{
    const result=execute();
    return {result,audit:{
      schema:VERSION,readOnly:true,ownerOnly:true,
      sourceExactPrinting:PRINTING,
      rootAttempts:records.length,
      settledSameTurn:records.filter(r=>r.nativePromptResolvedSameTurn).length,
      firstSubsequentPokemonPlays:records.filter(r=>r.firstNextPokemonPlay).length,
      newlyAccessiblePokemonFromPostdrawHand:records.filter(r=>
        r.firstNextPokemonPlay?.existedImmediatelyAfterDraw===true&&
        r.firstNextPokemonPlay?.existedBeforeShuffle===false).length,
      records:records.slice(0,16),
      interpretedOnlyAsCardAvailability:true,
      competitiveQualified:false
    }};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,observed);
    Object.defineProperty(Store.prototype,'dispatch',prior);
  }
}
module.exports={VERSION,PRINTING,withNativeLillieOwnerAcquisitionAudit};
