'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent49-original-rank5-source-skyfield-after-pass-v1';
const PRINTING='Sky Field ROS';
const NATIVE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(NATIVE,name));

/**
 * A narrow, falsifiable answer to one archived opponent response decision:
 * source-own-turn 17 with a physical held Stadium while the bot passes.
 * Read only the acting player's own hand and public Stadium/turn/seat.
 * @param {object} state Genuine native owner-visible Store state.
 * @param {number} sourceSeat Source owner seat.
 * @returns {number|null} Physical hand index if a counterplay exists.
 */
function chooseSourceSkyField(state,sourceSeat){
  if(state?.turn!==17||state.activePlayer!==sourceSeat||
     state.prompts?.some(p=>p.result===undefined))return null;
  const owner=state.players[sourceSeat];
  if(owner.stadiumPlayedTurn===state.turn)return null;
  const ownStadiums=state.players.flatMap(p=>p.stadium?.cards??[]);
  if(ownStadiums.some(c=>c.fullName===PRINTING))return null;
  const index=owner.hand.cards.findIndex(c=>c.fullName===PRINTING);
  return index<0?null:index;
}

/**
 * Source-only research hook installed inside the actual native match after
 * other common actor decoders. It never changes the pinned vendor code.
 * @template T
 * @param {()=>T} execute Existing fixed-60 match executor.
 * @param {object} deps Injectable genuine native dependencies.
 * @returns {{result:T,audit:object}} Real Store receipts.
 */
function withSourceSkyField(execute,deps={}){
  assert.equal(typeof execute,'function');
  const headless=deps.headless??require('./headless.cjs');
  const Ai=deps.SimpleTacticsAi??native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const PlayCardAction=deps.PlayCardAction??
    native('game/store/actions/play-card-action').PlayCardAction;
  const sourceSeat=deps.sourceSeat??0;
  assert.ok(sourceSeat===0||sourceSeat===1);
  const oldRun=headless.runMatch;
  assert.equal(typeof oldRun,'function');
  const audit={schema:VERSION,sourceSeat,lateDecoderInstallations:0,
    firstTurn17PassCount:0,heldSkyFieldPasses:0,nativeCanPlayDenied:0,
    legalProposals:0,nativeCommitted:0,nativeRejected:0,
    physicalStadiumSettlements:0,accepted:[],rejected:[],
    opponentPrivateCardsExamined:false,qualifiedPaperGames:0};

  function nativeMatch(request){
    const oldDecode=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
    const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
    assert.equal(typeof oldDecode?.value,'function');
    assert.equal(typeof oldDispatch?.value,'function');
    const proposals=new WeakMap();
    let activeStore=null;
    audit.lateDecoderInstallations++;

    function decode(state){
      const baseline=oldDecode.value.call(this,state);
      if(baseline?.constructor?.name!=='PassTurnAction'||
         activeStore?.state!==state)return baseline;
      const seat=state.players.findIndex(p=>p.id===this.client?.id);
      if(seat!==sourceSeat||state.activePlayer!==sourceSeat||
         state.turn!==17)return baseline;
      audit.firstTurn17PassCount++;
      const index=chooseSourceSkyField(state,sourceSeat);
      if(index===null)return baseline;
      audit.heldSkyFieldPasses++;
      const owner=state.players[sourceSeat],card=owner.hand.cards[index];
      // Card.canPlay is optional in the pinned native engine; undefined\n      // defers to the authoritative Store rather than denying a Stadium.\n      if(card?.canPlay?.(activeStore,state,owner)===false){
        audit.nativeCanPlayDenied++;
        return baseline;
      }
      const action=new PlayCardAction(owner.id,index);
      proposals.set(action,{sourceSeat,globalTurn:state.turn,
        handIndex:index,beforeOwnerHand:owner.hand.cards.map(c=>c.fullName),
        beforeOwnerHandCount:owner.hand.cards.length,
        printing:card.fullName});
      audit.legalProposals++;
      return action;
    }

    function dispatch(action,...args){
      if(action?.constructor?.name==='AddPlayerAction'&&activeStore===null)
        activeStore=this;
      const proposal=this===activeStore?proposals.get(action):null;
      const owner=proposal?this.state.players[sourceSeat]:null;
      const played=owner?.hand.cards[proposal?.handIndex];
      const preStadiums=proposal?
        this.state.players.flatMap(p=>p.stadium?.cards??[]):null;
      try{
        const result=oldDispatch.value.call(this,action,...args);
        if(proposal){
          audit.nativeCommitted++;
          const after=this.state.players[sourceSeat];
          const postStadiums=this.state.players.flatMap(p=>p.stadium?.cards??[]);
          const settled=played?.fullName===PRINTING&&
            !after.hand.cards.includes(played)&&
            postStadiums.some(c=>c===played)&&
            !preStadiums.some(c=>c===played)&&
            after.hand.cards.length===proposal.beforeOwnerHandCount-1;
          if(settled)audit.physicalStadiumSettlements++;
          audit.accepted.push({...proposal,nativeStoreAccepted:true,
            sourceHandAfter:after.hand.cards.map(c=>c.fullName),
            beforeStadiumNames:preStadiums.map(c=>c.fullName),
            afterStadiumNames:postStadiums.map(c=>c.fullName),
            ownCardMovedToStadium:settled,
            afterSourceHandCount:after.hand.cards.length,
            pendingNativePrompts:this.state.prompts.filter(p=>
              p.result===undefined).length});
        }
        return result;
      }catch(error){
        if(proposal){
          audit.nativeRejected++;
          audit.rejected.push({...proposal,
            reason:String(error?.message??error).slice(0,200)});
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
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')error.agent49SkyFieldAudit=audit;
    throw error;
  }
  finally{
    assert.strictEqual(headless.runMatch,nativeMatch);
    headless.runMatch=oldRun;
  }
}
module.exports={VERSION,PRINTING,chooseSourceSkyField,withSourceSkyField};
