'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent2-native-owner-supporter-opportunity-v1';
const ROOT_ACTIONS=new Set([
  'PlayCardAction','PassTurnAction','UseAbilityAction','AttackAction',
  'RetreatAction','UseStadiumAction','AttachEnergyAction'
]);

/**
 * Read the acting player's owned hand and rule-state indicators at a real
 * Store root. A Card.canPlay(null, ...) positive is a bounded engine-side
 * affordance witness; a negative is NOT a proof of illegality for cards
 * requiring a target. Paper legality and tactical benefit need other checks.
 *
 * @param {object} state Genuine native State.
 * @param {0|1} seat Physical owner seat.
 * @param {number|string} supporterType Pinned TrainerType.SUPPORTER.
 * @returns {object} Post-game-only owner-hand diagnostic.
 */
function ownerSupporterOpportunity(state,seat,supporterType){
  assert.ok(seat===0||seat===1);
  const owner=state.players[seat];
  assert.ok(owner&&Array.isArray(owner.hand?.cards));
  const pending=state.prompts?.some(p=>p.result===undefined)===true;
  const quota=owner.supporterTurn;
  const ownerTurn=state.activePlayer===seat&&state.turn>=1&&!pending;
  const broadPlayLock=owner.cannotPlaySupporterCards===true;
  const ownerDeckCount=owner.deck?.cards?.length??null;
  const supporters=[];
  for(let index=0;index<owner.hand.cards.length;index++){
    const card=owner.hand.cards[index];
    if(card?.trainerType!==supporterType)continue;
    let nativeNullCanPlay='not-probed';
    if(ownerTurn&&!broadPlayLock&&quota===0){
      try{
        const response=card.canPlay(null,state,owner);
        nativeNullCanPlay=response===true?'true':
          (response===false?'false':'nonboolean');
      }catch(error){
        nativeNullCanPlay='threw';
      }
    }
    supporters.push({
      printing:card.fullName??card.name??null,
      nativeNullCanPlay
    });
  }
  return {
    ownerSeat:seat,turn:state.turn,
    ownerTurn,noPendingPrompt:!pending,
    ownerHandSize:owner.hand.cards.length,
    ownerDeckCount,supporterQuota:quota,
    ownerSupporterLock:broadPlayLock,
    firstGlobalTurn:state.turn===1,
    heldCount:supporters.length,
    nativeNullTrueCount:supporters.filter(s=>
      s.nativeNullCanPlay==='true').length,
    nativeNullTrueBeyondFirstGlobalTurn:state.turn>1?
      supporters.filter(s=>s.nativeNullCanPlay==='true').length:0,
    firstTurnPaperExceptionStillUnverified:state.turn===1,
    supporters,
    evidenceBoundary:'Only actor-owned hand. Native canPlay(null) is bounded engine-side evidence, not full target legality, paper legality, tactical value or settled Supporter use.'
  };
}

/**
 * Reversible, post-decision native Store observer. Each owner turn records its
 * first genuinely accepted root and its accepted Pass, if present. Native
 * Store rejects are retained separately. No data are fed to either bot.
 *
 * @template T
 * @param {()=>T} execute Synchronous pinned headless match.
 * @param {{Store?:Function,supporterType?:number|string}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withNativeOwnerSupporterOpportunity(execute,deps={}){
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(output,'game/store/store')).Store;
  const supporterType=deps.supporterType??require(path.join(output,
    'game/store/card/card-types')).TrainerType.SUPPORTER;
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  const firstByTurn=new Map(),passes=[],supporterRoots=[],rejected=[];
  let liveStore=null,rootDispatchCount=0,scannedRootCount=0;
  function report(){
    const first=[...firstByTurn.values()];
    const counts={firstRoots:first.length,acceptedPasses:passes.length,
      firstWithHeld:first.filter(e=>e.heldCount>0).length,
      passesWithHeld:passes.filter(e=>e.heldCount>0).length,
      passesWithNativeNullTrue:passes.filter(e=>e.nativeNullTrueCount>0).length,
      passesBeyondOpeningWithNativeNullTrue:passes.filter(e=>
        e.nativeNullTrueBeyondFirstGlobalTurn>0).length,
      acceptedSupporterRoots:supporterRoots.length,
      rejectedRootActions:rejected.length};
    return {version:VERSION,observedLiveStore:liveStore!==null,
      rootDispatchCount,scannedRootCount,counts,
      firstRoots:first.slice(0,96),firstRootsTruncated:Math.max(0,first.length-96),
      passes:passes.slice(0,96),passesTruncated:Math.max(0,passes.length-96),
      supporterRoots:supporterRoots.slice(0,96),
      supporterRootsTruncated:Math.max(0,supporterRoots.length-96),
      rejected:rejected.slice(0,32),
      rejectedTruncated:Math.max(0,rejected.length-32),
      ownerOnly:true,decisionsChanged:false,
      nativeCanPlayNullIsOnlyBoundedEngineEvidence:true,
      targetSelectionValidated:false,paperLegalQualified:false,
      tacticalBenefitQualified:false,competitiveGameQualified:false};
  }
  function observed(action,...args){
    const actionName=action?.constructor?.name;
    if(liveStore===null&&actionName==='AddPlayerAction')liveStore=this;
    if(this!==liveStore)return previous.value.call(this,action,...args);
    rootDispatchCount++;
    const state=this.state;
    const seat=state.players?.findIndex(p=>p.id===
      (action?.id??action?.clientId));
    const ownerSeat=(seat<0&&actionName==='PassTurnAction')?
      state.activePlayer:seat;
    const active=ownerSeat===0||ownerSeat===1;
    const pending=state.prompts?.some(p=>p.result===undefined)===true;
    const eligible=ROOT_ACTIONS.has(actionName)&&active&&
      state.activePlayer===ownerSeat&&!pending&&
      Number.isSafeInteger(state.turn)&&state.turn>=1;
    const before=eligible?ownerSupporterOpportunity(
      state,ownerSeat,supporterType):null;
    const ownCard=eligible&&actionName==='PlayCardAction'?
      state.players[ownerSeat].hand.cards[action.handIndex]:null;
    const playedSupporter=ownCard?.trainerType===supporterType;
    try{
      const result=previous.value.call(this,action,...args);
      if(before){
        scannedRootCount++;
        const event={...before,action:actionName,
          rootDispatchOrdinal:rootDispatchCount};
        const key=ownerSeat+':'+before.turn;
        if(!firstByTurn.has(key))firstByTurn.set(key,event);
        if(actionName==='PassTurnAction')passes.push(event);
        if(playedSupporter)supporterRoots.push({
          seat:ownerSeat,turn:before.turn,rootDispatchOrdinal:rootDispatchCount,
          printing:ownCard.fullName??ownCard.name??null,
          nativeQuotaBefore:before.supporterQuota,
          nativeQuotaAfter:this.state.players[ownerSeat]?.supporterTurn??null,
          note:'Accepted Store dispatch; effect settlement separately audited'
        });
      }
      return result;
    }catch(error){
      if(before)rejected.push({seat:ownerSeat,turn:before.turn,
        action:actionName,ordinal:rootDispatchCount,
        message:String(error?.message??error)});
      if(error&&typeof error==='object')
        error.agent2OwnerSupporterOpportunityEvidence=report();
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...previous,value:observed});
  try{
    const result=execute();
    return {result,audit:report()};
  }catch(error){
    if(error&&typeof error==='object'&&
       !error.agent2OwnerSupporterOpportunityEvidence)
      error.agent2OwnerSupporterOpportunityEvidence=report();
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,observed);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}

module.exports={VERSION,ROOT_ACTIONS,ownerSupporterOpportunity,
  withNativeOwnerSupporterOpportunity};
