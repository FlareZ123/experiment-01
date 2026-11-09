'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {ownerBulkHandTransition}=require('./agent49-owner-bulk-hand-transitions.cjs');

const VERSION='agent49-original-source-early-carmine-native-v1';
const PRINTING='Carmine TWM';
const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(ROOT,name));

/**
 * Source player may test a legal held Carmine in its first own turn in place
 * of an otherwise chosen Pass. Every other hand card is sacrificed; this is
 * an experimental candidate, not a recommendation that the trade is good.
 * @param {object} view Genuine acting-owner observation
 * @returns {{handIndex:number,printing:string,expectedOtherHandCount:number}|null}
 */
function chooseEarlyCarmine(view){
  if(view?.decisionKind!=='owner-root'||
     ![1,2].includes(view.globalTurn)||
     !Array.isArray(view.ownHand)||
     view.ownPublic?.deckCount<=0||
     view.ownTurnResources?.supporterPlayedTurn!==0||
     view.ownTurnResources?.supporterPlayLocked!==false||
     view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true)
    return null;
  const handIndex=view.ownHand.indexOf(PRINTING);
  if(handIndex<0)return null;
  const cost=ownerBulkHandTransition(view,{
    handIndex,printing:PRINTING,type:'Supporter'
  });
  assert.equal(cost.knownBulkHandEffect,true);
  return {handIndex,printing:PRINTING,
    expectedOtherHandCount:cost.movedHandCount};
}

/**
 * Install the Carmine override at the innermost native-match boundary, after
 * the shared actor policy and other owner decoder wrappers. An outer decoder
 * is displaced by those wrappers and would silently have zero causal effect.
 * @template T
 * @param {()=>T} execute
 * @param {{trials:object[],headless?:{runMatch:Function},SimpleTacticsAi?:Function,
 *   Store?:Function,PlayCardAction?:Function,observe?:Function}} deps
 * @returns {{result:T,audit:object}}
 */
function withSourceEarlyCarmine(execute,deps){
  assert.equal(typeof execute,'function');
  assert.ok(Array.isArray(deps?.trials)&&deps.trials.length>0);
  const headless=deps.headless??require('./headless.cjs');
  const Ai=deps.SimpleTacticsAi??native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const PlayCardAction=deps.PlayCardAction??
    native('game/store/actions/play-card-action').PlayCardAction;
  const observe=deps.observe??actorObservation;
  const oldRun=headless.runMatch;
  assert.equal(typeof oldRun,'function');
  const audit={schema:VERSION,registeredTrials:deps.trials.map(t=>t.id),
    nativeMatchesSeen:0,lateDecoderInstallations:0,firstOwnTurnPasses:0,
    heldCarminePasses:0,paperEligibleProposals:0,nativeCanPlayRejected:0,
    nativeCommitted:0,nativeRejected:0,nativeEffectsComplete:0,
    ownerDiscardUnavailableBefore:0,ownerDiscardUnavailableAfter:0,
    accepted:[],rejected:[],opponentHiddenHandRead:false,
    nativeStoresOnly:true,competitiveGamesQualified:0};

  /** The native runner is called once per frozen physical group in order. */
  function nativeMatch(request){
    const trial=deps.trials[audit.nativeMatchesSeen++];
    assert.ok(trial,'More native games than preregistered');
    const sourceSeat=trial.candidateSlot==='A'?1:0;
    const oldDecode=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
    const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
    assert.equal(typeof oldDecode?.value,'function');
    assert.equal(typeof oldDispatch?.value,'function');
    const proposals=new WeakMap();
    let liveStore=null;
    audit.lateDecoderInstallations++;

    function decode(state){
      const baseline=oldDecode.value.call(this,state);
      if(baseline?.constructor?.name!=='PassTurnAction'||
         liveStore?.state!==state)return baseline;
      const seat=state.players.findIndex(p=>p.id===this.client?.id);
      if(seat!==sourceSeat||state.activePlayer!==sourceSeat||
         state.prompts?.some(p=>p.result===undefined))return baseline;
      const view=observe(state,sourceSeat);
      if(view.decisionKind!=='owner-root'||![1,2].includes(view.globalTurn))
        return baseline;
      audit.firstOwnTurnPasses++;
      if(view.ownHand.includes(PRINTING))audit.heldCarminePasses++;
      const selection=chooseEarlyCarmine(view);
      if(!selection)return baseline;
      const owner=state.players[sourceSeat];
      const card=owner.hand.cards[selection.handIndex];
      if(card?.fullName!==PRINTING)return baseline;
      if(card.canPlay?.(liveStore,state,owner)!==true){
        audit.nativeCanPlayRejected++;
        return baseline;
      }
      const action=new PlayCardAction(owner.id,selection.handIndex);
      proposals.set(action,{
        trialId:trial.id,sourceSeat,
        globalTurn:view.globalTurn,oldHandSize:view.ownHand.length,
        beforeOwnerDeckCount:view.ownPublic.deckCount,
        expectedOtherHandCount:selection.expectedOtherHandCount
      });
      audit.paperEligibleProposals++;
      return action;
    }

    function dispatch(action,...args){
      if(action?.constructor?.name==='AddPlayerAction'&&liveStore===null)
        liveStore=this;
      const proposal=this===liveStore?proposals.get(action):null;
      const owner=proposal?this.state.players[sourceSeat]:null;
      const before=owner?{
        hand:[...owner.hand.cards],
        deckCount:owner.deck.cards.length,
        discardCount:Array.isArray(owner.discard?.cards)?
          owner.discard.cards.length:null,
        supporterCount:owner.supporterTurn
      }:null;
      if(before?.discardCount===null)audit.ownerDiscardUnavailableBefore++;
      try{
        const result=oldDispatch.value.call(this,action,...args);
        if(proposal){
          audit.nativeCommitted++;
          const after=this.state.players[sourceSeat];
          const beforeOther=before.hand.filter((_,i)=>i!==action.handIndex);
          const gone=beforeOther.filter(c=>!after.hand.cards.includes(c));
          const afterDiscard=after.discard?.cards;
          if(!Array.isArray(afterDiscard))audit.ownerDiscardUnavailableAfter++;
          const inDiscard=Array.isArray(afterDiscard)?
            beforeOther.filter(c=>afterDiscard.includes(c)):[];
          const settled=before.discardCount!==null&&
            Array.isArray(afterDiscard)&&
            gone.length===beforeOther.length&&
            inDiscard.length===beforeOther.length&&
            after.hand.cards.length===Math.min(5,before.deckCount)&&
            after.supporterTurn===before.supporterCount+1;
          if(settled)audit.nativeEffectsComplete++;
          audit.accepted.push({...proposal,storeAccepted:true,
            afterOwnerHandSize:after.hand.cards.length,
            otherCardsPhysicallyMoved:gone.length,
            otherCardsDiscarded:Array.isArray(afterDiscard)?
              inDiscard.length:null,
            ownerDiscardAvailableBefore:before.discardCount!==null,
            ownerDiscardAvailableAfter:Array.isArray(afterDiscard),
            lostZoneMovesNotMeasured:true,
            netDeckChange:after.deck.cards.length-before.deckCount,
            netDiscardChange:before.discardCount!==null&&
              Array.isArray(afterDiscard)?
              afterDiscard.length-before.discardCount:null,
            supporterTurnAfter:after.supporterTurn,
            pendingNativePromptCount:this.state.prompts.filter(p=>
              p.result===undefined).length,
            nativeCarmineEffectFullySettled:settled
          });
        }
        return result;
      }catch(error){
        if(proposal){
          audit.nativeRejected++;
          audit.rejected.push({...proposal,
            reason:String(error?.message??error).slice(0,260)});
        }
        throw error;
      }
    }
    Object.defineProperty(Ai.prototype,'decodeNextAction',
      {...oldDecode,value:decode});
    Object.defineProperty(Store.prototype,'dispatch',
      {...oldDispatch,value:dispatch});
    try{return oldRun(request);}
    finally{
      assert.strictEqual(Ai.prototype.decodeNextAction,decode);
      assert.strictEqual(Store.prototype.dispatch,dispatch);
      Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
      Object.defineProperty(Ai.prototype,'decodeNextAction',oldDecode);
    }
  }

  headless.runMatch=nativeMatch;
  try{
    const result=execute();
    assert.equal(audit.nativeMatchesSeen,deps.trials.length,
      'Every preregistered native game requires an installed late decoder');
    return {result,audit};
  }catch(error){
    if(error&&typeof error==='object')error.agent49EarlyCarmineAudit=audit;
    throw error;
  }finally{
    assert.strictEqual(headless.runMatch,nativeMatch);
    headless.runMatch=oldRun;
  }
}
module.exports={VERSION,PRINTING,chooseEarlyCarmine,withSourceEarlyCarmine};
