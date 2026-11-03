'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {detachedLillieAtPass,LILLIE}=
  require('./agent7-frozen-candidate-lillie-pass-clone.cjs');
const VERSION='agent12-rank6-deckzero-pass-retrospective-v1';

/**
 * Read-only owner-private probe on unchanged real Store Pass decisions.
 * Detached clones cannot modify selected actions or either player's state.
 * @param {()=>unknown} execute Native fixed-policy replay.
 * @param {object[]} trials Previously registered, ordered source trials.
 * @param {{Store?:Function,probe?:Function}} [deps] Test seams.
 * @returns {{result:unknown,audit:object}}
 */
function withDeckoutPassObservation(execute,trials,deps={}){
  assert.equal(typeof execute,'function');
  assert.equal(trials.length,2);
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const probe=deps.probe??detachedLillieAtPass;
  const old=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof old?.value,'function');
  const instances=new WeakMap();
  let ordinal=0;
  const events=[];
  function observed(action,...args){
    const kind=action?.constructor?.name;
    if(kind==='AddPlayerAction'&&!instances.has(this))
      instances.set(this,ordinal++);
    const trial=trials[instances.get(this)];
    const seat=trial?.candidateSlot==='A'?0:trial?.candidateSlot==='B'?1:-1;
    const state=this.state;
    const player=state?.players?.[seat];
    const actor=action?.clientId??action?.id;
    let event=null;
    if(kind==='PassTurnAction'&&player&&actor===player.id&&
      state.activePlayer===seat&&state.turn>=22&&
      player.deck.cards.length<=3&&events.length<32){
      const held=player.hand.cards.filter(c=>c?.fullName===LILLIE);
      event={trialId:trial.id,seat,turn:state.turn,
        selectedAction:'PassTurnAction',deck:player.deck.cards.length,
        hand:player.hand.cards.length,
        supporterUsed:player.supporterTurn,
        prizeCount:player.prizes.filter(p=>p.cards.length).length,
        heldLillie:held.length,
        nativeCanPlay:held.length?held[0].canPlay(null,state,player):null,
        oldActorPolicyDeckZeroVeto:player.deck.cards.length===0&&held.length>0,
        clone:null,actualPassAccepted:false,error:null};
      if(held.length&&!state.prompts.some(p=>p.result===undefined))
        event.clone=probe(state,seat);
    }
    try{
      const result=old.value.call(this,action,...args);
      if(event){event.actualPassAccepted=true;events.push(event);}
      return result;
    }catch(error){
      if(event){event.error=String(error?.message??error);events.push(event);}
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...old,value:observed});
  try{
    const result=execute();
    return {result,audit:{version:VERSION,realGames:ordinal,
      unchangedRegisteredTrialIds:trials.map(t=>t.id),events,
      realActionsModified:false,retrospective:true,
      competitiveQualifiedGames:0}};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,observed);
    Object.defineProperty(Store.prototype,'dispatch',old);
  }
}
module.exports={VERSION,withDeckoutPassObservation};
