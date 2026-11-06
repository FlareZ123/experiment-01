'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent5-v7-targeted-source-teamflare-physical-custody-v1';
const FLARE='Team Flare Grunt XY';

/**
 * Read-only physical Store observer around a singled-out original-source
 * Supporter play. Records exact owner-hand card and one physical opposing
 * Active Energy object leaving for public discard after successful dispatch.
 * Does not choose, modify or submit any action.
 *
 * @template T
 * @param {()=>T} execute Native match.
 * @param {{Store?:Function,seat:0|1,turn:number,trialId:string}} deps
 * @returns {{result:T,audit:object}}
 */
function withOriginalFlarePhysicalWitness(execute,deps){
  assert.equal(typeof execute,'function');
  assert.ok(deps?.seat===0||deps?.seat===1);
  assert.ok(Number.isSafeInteger(deps.turn)&&deps.turn>=2);
  assert.equal(typeof deps.trialId,'string');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  let live=null,tracked=null;
  const audit={
    schema:VERSION,trialId:deps.trialId,sourceSeat:deps.seat,
    targetGlobalTurn:deps.turn,realNativeStores:0,
    trueActorFlareAttempts:0,acceptedStoreFlareRoots:0,
    nativeRejectedFlareRoots:0,physicalOriginalFlareLeftHand:false,
    physicalFlareReachedOwnerDiscard:false,
    sourceSupporterTurnBefore:null,sourceSupporterTurnAfter:null,
    opponentActiveBefore:null,opponentActiveEnergyBefore:[],
    exactOpponentEnergyMovedToDiscard:[],
    exactOriginalOpponentEnergyCountAfter:null,
    rootActionKindsThroughSettlement:[],nativeError:null,
    observerReadOnly:true,paperCompetitiveGameQualified:false
  };
  function captureAfter(state){
    if(!tracked)return;
    const owner=state.players[deps.seat];
    const opponent=state.players[1-deps.seat];
    audit.physicalOriginalFlareLeftHand=
      !owner.hand.cards.includes(tracked.physical);
    audit.physicalFlareReachedOwnerDiscard=
      owner.discard.cards.includes(tracked.physical);
    audit.sourceSupporterTurnAfter=owner.supporterTurn;
    audit.exactOpponentEnergyMovedToDiscard=
      tracked.originalEnergy.filter(card=>
        !tracked.active.energies.cards.includes(card)&&
        opponent.discard.cards.includes(card)).map(card=>card.fullName);
    audit.exactOriginalOpponentEnergyCountAfter=
      tracked.active.energies.cards.length;
  }
  function dispatch(action,...args){
    const kind=action?.constructor?.name??null;
    if(kind==='AddPlayerAction'&&!live){
      live=this;audit.realNativeStores++;
    }
    const state=this.state;
    const genuine=this===live&&state?.turn===deps.turn&&
      state.activePlayer===deps.seat&&
      state.players?.[deps.seat];
    const owner=genuine?state.players[deps.seat]:null;
    const actor=action?.id??action?.clientId;
    const physical=owner&&kind==='PlayCardAction'&&
      actor===owner.id?owner.hand.cards[action.handIndex]:null;
    const target=physical?.fullName===FLARE;
    if(target){
      audit.trueActorFlareAttempts++;
      const opponent=state.players[1-deps.seat];
      tracked={physical,active:opponent.active,
        originalEnergy:[...opponent.active.energies.cards]};
      audit.sourceSupporterTurnBefore=owner.supporterTurn;
      audit.opponentActiveBefore=opponent.active.getPokemonCard()?.fullName??null;
      audit.opponentActiveEnergyBefore=tracked.originalEnergy.map(c=>c.fullName);
    }
    let result;
    try{
      result=previous.value.call(this,action,...args);
    }catch(error){
      if(target) audit.nativeRejectedFlareRoots++;
      audit.nativeError=String(error?.message??error).slice(0,320);
      throw error;
    }
    if(target)audit.acceptedStoreFlareRoots++;
    if(tracked&&this===live&&
       audit.rootActionKindsThroughSettlement.length<24){
      audit.rootActionKindsThroughSettlement.push({
        globalTurn:state.turn,kind,sourceAction:actor===owner?.id,
        isTargetRoot:Boolean(target)
      });
      captureAfter(this.state);
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...previous,value:dispatch});
  try{
    return {result:execute(),audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.agent5V7FlarePhysicalAudit={...audit};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}
module.exports={VERSION,FLARE,withOriginalFlarePhysicalWitness};
