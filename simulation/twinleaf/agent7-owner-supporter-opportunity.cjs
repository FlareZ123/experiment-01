'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent7-live-owner-supporter-opportunity-v2-native-pass-acceptance';
const MAX_SAMPLES=96;

/**
 * Count printed Supporters in the ACTOR'S hand at a genuine root. A structural
 * opening is not a legal action: target, card text, paper and tactical checks
 * remain outside this read-only observer.
 * @param {object} state Native state.
 * @param {0|1} seat Acting owner.
 * @param {object} view Detached owner observation.
 * @param {number|string} supporterType TrainerType.SUPPORTER.
 * @param {{nativeCanPlay?:boolean}} options
 * @returns {object}
 */
function ownerSupporterOpportunity(state,seat,view,supporterType,options={}){
  assert.ok(seat===0||seat===1);
  assert.equal(view.actorSeat,seat);
  assert.equal(view.decisionKind,'owner-root');
  assert.equal(state.activePlayer,seat);
  const owner=state.players[seat];
  const quotaOpen=view.ownTurnResources.supporterPlayedTurn===0;
  const playUnlocked=view.ownTurnResources.supporterPlayLocked!==true&&
    view.ownPublic.publicTurnRestrictions.supporterPlayLocked!==true;
  const firstPlayerFirstTurn=view.globalTurn===1;
  const held=[];
  for(let handIndex=0;handIndex<owner.hand.cards.length;handIndex++){
    const card=owner.hand.cards[handIndex];
    if(card?.trainerType!==supporterType)continue;
    assert.equal(card.fullName,view.ownHand[handIndex]);
    const firstTurnRestricted=firstPlayerFirstTurn&&card.name!=='Carmine';
    const structurallyOpen=quotaOpen&&playUnlocked&&!firstTurnRestricted;
    let nativeNullTargetCanPlay=null,nativeProbeError=null;
    if(options.nativeCanPlay===true&&structurallyOpen&&
       typeof card.canPlay==='function'){
      try{nativeNullTargetCanPlay=card.canPlay(null,state,owner)===true;}
      catch(error){nativeProbeError=String(error?.message??error);}
    }
    held.push({
      handIndex,printing:card.fullName,
      firstTurnScreen:firstTurnRestricted?'ordinary-supporter-restricted':
        (firstPlayerFirstTurn?'known-Carmine-exception':'later-turn'),
      structurallyOpen,nativeNullTargetCanPlay,nativeProbeError
    });
  }
  return {
    seat,globalTurn:view.globalTurn,held,quotaOpen,playUnlocked,
    firstPlayerFirstTurn,
    structurallyOpenCount:held.filter(c=>c.structurallyOpen).length,
    nativeNullTargetPositiveCount:held.filter(c=>c.nativeNullTargetCanPlay===true).length,
    caveat:'CanPlay(null) and quota/lock screening are diagnostics, not an actual printed-paper legality, native target or benefit certificate.'
  };
}

/**
 * Passive reversible decision+Store observer for BOTH actual seats. Install
 * inside every policy wrapper, so the last-installed decode hook witnesses
 * first root proposals before any decision code can consume the observation.
 * @template T
 * @param {()=>T} execute Native synchronous match.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,GamePhase?:object,
 * TrainerType?:object,observe?:Function,nativeCanPlay?:boolean}} deps
 * @returns {{result:T,audit:object}}
 */
function withOwnerSupporterOpportunity(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??
    require(path.join(base,'game/store/store')).Store;
  const GamePhase=deps.GamePhase??
    require(path.join(base,'game/store/state/state')).GamePhase;
  const TrainerType=deps.TrainerType??
    require(path.join(base,'game/store/card/card-types')).TrainerType;
  const observe=deps.observe??
    require('./actor-observation-contract.cjs').actorObservation;
  const beforeDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof beforeDecode?.value,'function');
  assert.equal(typeof beforeDispatch?.value,'function');
  let liveStore=null,generation=0;
  const firstTurns=new Set(),proposals=new WeakMap(),
    passProposals=new WeakMap();
  const newCounts=()=>({
    roots:0,firstTurnRoots:0,firstTurnHeld:0,firstTurnStructurallyOpen:0,
    proposedSupporters:0,acceptedSupporters:0,rejectedSupporters:0,
    passWithHeld:0,passWithStructurallyOpen:0,
    acceptedPassRoots:0,acceptedPassWithHeld:0,
    acceptedPassWithStructurallyOpen:0,rejectedPassRoots:0,
    passTurnAdvanced:0
  });
  const audit={
    version:VERSION,actualStoreSeen:false,decisionsSeen:0,
    nativeNullTargetProbeOptIn:deps.nativeCanPlay===true,
    bySeat:{0:newCounts(),1:newCounts()},
    firstOwnerTurnSamples:[],passSamples:[],
    proposedSupporterSamples:[],acceptedSupporterSamples:[],
    competitiveQualified:false,
    scope:'Real owner-root held cards, structural opportunities, policy proposals and Store returns. Not legal/effect/tactical qualification.'
  };
  function decode(state){
    const seat=state?.players?.findIndex(p=>p.id===this.client?.id)??-1;
    if(state!==liveStore?.state||state.phase!==GamePhase.PLAYER_TURN||
       (seat!==0&&seat!==1)||state.activePlayer!==seat||
       state.prompts?.some(p=>p.result===undefined))
      return beforeDecode.value.call(this,state);
    const own=ownerSupporterOpportunity(state,seat,observe(state,seat),
      TrainerType.SUPPORTER,{nativeCanPlay:deps.nativeCanPlay===true});
    const counts=audit.bySeat[seat];
    counts.roots++;
    audit.decisionsSeen++;
    const key=generation+':'+state.turn+':'+seat;
    if(!firstTurns.has(key)){
      firstTurns.add(key);
      counts.firstTurnRoots++;
      if(own.held.length)counts.firstTurnHeld++;
      if(own.structurallyOpenCount)counts.firstTurnStructurallyOpen++;
      if(audit.firstOwnerTurnSamples.length<MAX_SAMPLES)
        audit.firstOwnerTurnSamples.push(own);
    }
    const action=beforeDecode.value.call(this,state);
    const card=action?.constructor?.name==='PlayCardAction'?
      state.players[seat].hand.cards[action.handIndex]:null;
    if(card?.trainerType===TrainerType.SUPPORTER){
      counts.proposedSupporters++;
      const receipt={
        seat,globalTurn:state.turn,printing:card.fullName,
        handIndex:action.handIndex,proposedType:'PlayCardAction',accepted:false
      };
      proposals.set(action,receipt);
      if(audit.proposedSupporterSamples.length<MAX_SAMPLES)
        audit.proposedSupporterSamples.push(receipt);
    }
    if(action?.constructor?.name==='PassTurnAction'){
      if(own.held.length)counts.passWithHeld++;
      if(own.structurallyOpenCount)counts.passWithStructurallyOpen++;
      const passReceipt={
        seat,globalTurn:state.turn,proposed:true,accepted:false,
        held:own.held.length>0,structurallyOpen:own.structurallyOpenCount>0,
        turnAdvanced:false
      };
      passProposals.set(action,passReceipt);
      if(audit.passSamples.length<MAX_SAMPLES)
        audit.passSamples.push({...own,nativePassReceipt:passReceipt});
    }
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;generation++;audit.actualStoreSeen=true;
    }
    const receipt=this===liveStore?proposals.get(action):null;
    const passReceipt=this===liveStore?passProposals.get(action):null;
    const passTurnBefore=passReceipt?this.state.turn:null;
    const passActiveBefore=passReceipt?this.state.activePlayer:null;
    const beforeOwner=receipt?this.state.players[receipt.seat]:null;
    const card=receipt?beforeOwner.hand.cards[action.handIndex]:null;
    const beforeQuota=receipt?beforeOwner.supporterTurn:null;
    try{
      const result=beforeDispatch.value.apply(this,[action,...args]);
      if(passReceipt){
        const counts=audit.bySeat[passReceipt.seat];
        passReceipt.accepted=true;
        passReceipt.turnAdvanced=this.state.turn!==passTurnBefore||
          this.state.activePlayer!==passActiveBefore;
        counts.acceptedPassRoots++;
        if(passReceipt.held)counts.acceptedPassWithHeld++;
        if(passReceipt.structurallyOpen)
          counts.acceptedPassWithStructurallyOpen++;
        if(passReceipt.turnAdvanced)counts.passTurnAdvanced++;
      }
      if(receipt){
        receipt.accepted=true;
        const after=this.state.players[receipt.seat];
        receipt.cardLeftHand=!after.hand.cards.includes(card);
        receipt.quotaAdvanced=Number.isInteger(beforeQuota)&&
          after.supporterTurn>beforeQuota;
        receipt.settled=receipt.cardLeftHand&&receipt.quotaAdvanced;
        audit.bySeat[receipt.seat].acceptedSupporters++;
        if(audit.acceptedSupporterSamples.length<MAX_SAMPLES)
          audit.acceptedSupporterSamples.push({...receipt});
      }
      return result;
    }catch(error){
      if(passReceipt){
        audit.bySeat[passReceipt.seat].rejectedPassRoots++;
        passReceipt.error=String(error?.message??error);
      }
      if(receipt){
        audit.bySeat[receipt.seat].rejectedSupporters++;
        receipt.error=String(error?.message??error);
      }
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...beforeDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',{...beforeDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error){error.agent7OwnerSupporterOpportunityAudit=audit;throw error;}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',beforeDecode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
  }
}
module.exports={VERSION,ownerSupporterOpportunity,withOwnerSupporterOpportunity};
