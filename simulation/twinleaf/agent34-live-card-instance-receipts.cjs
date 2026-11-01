'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent34-original-store-playcard-instance-v1';

/** Capture genuine native PlayCardAction hand-card instances before dispatch.
 * This is optional, reversible, postgame-only evidence. It does not alter
 * play, decide card legality, or certify any printed card effect.
 * @template T
 * @param {()=>T} execute Synchronous game.
 * @param {{Store?:Function}} [deps] Injection seam.
 * @returns {{result:T,audit:object}}
 */
function withLiveCardInstanceReceipts(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof prior?.value,'function');
  let realStore=null,ordinal=0,prototypeCount=0;
  const prototypes=new WeakMap();
  const audit={
    version:VERSION,originalStoreCaptured:false,originalDispatchCount:0,
    auxiliaryDispatchCount:0,attemptedPlayCardRoots:0,
    acceptedPlayCardRoots:0,rejectedPlayCardRoots:0,
    accepted:[],rejected:[],
    headlessOrdinalJoinVerified:false,printedRuleValidity:'unverified',
    effectValidity:'unverified',competitiveGameQualified:false
  };
  function describe(action){
    if(action?.constructor?.name!=='PlayCardAction')return null;
    const state=realStore.state;
    const seat=state?.players?.findIndex(p=>
      p.id===(action.clientId??action.id))??-1;
    const index=action.handIndex;
    const player=seat>=0?state.players[seat]:null;
    const card=Number.isSafeInteger(index)&&index>=0&&
      index<(player?.hand?.cards?.length??0)?
      player.hand.cards[index]:null;
    if(!card)return {card:null,seat,receipt:{
      ordinal,seat,handIndex:index,printing:null,
      failure:'native-actor-hand-card-unresolved'}};
    const proto=Object.getPrototypeOf(card);
    let prototypeToken=prototypes.get(proto);
    if(prototypeToken===undefined){
      prototypeToken=++prototypeCount;
      prototypes.set(proto,prototypeToken);
    }
    return {card,seat,receipt:{
      ordinal,seat,handIndex:index,
      printing:card.fullName??null,cardName:card.name??null,
      executableConstructor:card.constructor?.name??null,
      executablePrototypeToken:prototypeToken,
      ownPrototypeReducer:Object.prototype.hasOwnProperty.call(
        proto,'reduceEffect'),
      handCountBefore:player.hand.cards.length,
      witness:'actual-owner-hand-card-instance-pre-dispatch'
    }};
  }
  function dispatch(action,...args){
    if(realStore===null&&action?.constructor?.name==='AddPlayerAction'){
      realStore=this;
      audit.originalStoreCaptured=true;
    }
    if(this!==realStore){
      audit.auxiliaryDispatchCount++;
      return prior.value.apply(this,[action,...args]);
    }
    ordinal++;
    audit.originalDispatchCount=ordinal;
    const before=describe(action);
    if(before)audit.attemptedPlayCardRoots++;
    try{
      const result=prior.value.apply(this,[action,...args]);
      if(before){
        audit.acceptedPlayCardRoots++;
        const hand=before.seat>=0?
          this.state.players[before.seat]?.hand?.cards:null;
        audit.accepted.push({...before.receipt,
          accepted:true,cardLeftHand:before.card!==null&&
            Array.isArray(hand)?!hand.includes(before.card):null,
          paperEffectVerified:false});
      }
      return result;
    }catch(error){
      if(before){
        audit.rejectedPlayCardRoots++;
        audit.rejected.push({...before.receipt,
          accepted:false,error:String(error?.message??error)});
      }
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...prior,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent34CardInstanceAudit=audit;
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',prior);
  }
}
module.exports={VERSION,withLiveCardInstanceReceipts};
