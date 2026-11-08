'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseQuickBallAfterPass,chooseQuickBallPrompt,QUICK_BALL,
  VERSION:POLICY_VERSION}=require('./agent7-quick-ball-after-pass.cjs');

const VERSION='agent7-quick-ball-native-owner-after-pass-v1';

/**
 * Root policy runs first, then owner-only Quick Ball only on its genuine
 * Pass. All accepted selections belong to the player whose real native
 * hand or explicit own-deck search prompt was offered. A rejected Store
 * action is an experiment failure; never silently call a legal search
 * completed because the prompt was merely offered.
 *
 * @template T
 * @param {()=>T} execute Synchronous actual headless native workload.
 * @param {object} deps Native classes and registered exact trial IDs.
 * @returns {{result:T,audit:object}}
 */
function withOwnerQuickBallAfterPass(execute,deps){
  assert.equal(typeof execute,'function');
  const {headless,SimpleTacticsAi,Store,PlayCardAction,
    ResolvePromptAction,trialIds}=deps;
  assert.ok(trialIds?.length>0);
  const ids=new Set(trialIds);
  assert.equal(ids.size,trialIds.length);
  const ai=SimpleTacticsAi.prototype,proto=Store.prototype;
  const oldRun=headless.runMatch;
  const oldDispatch=Object.getOwnPropertyDescriptor(proto,'dispatch');
  assert.equal(typeof oldDispatch?.value,'function');
  let active=false,gameStore=null,priorAi=null,trialId=null;
  const proposals=new WeakMap();
  const events=[];
  const audit={
    schema:VERSION,policy:POLICY_VERSION,
    trialIds:[...ids],genuineMatches:0,
    ownerPassObservations:0,rootAttempts:0,rootAccepted:0,
    rootRejected:0,promptPaymentAccepted:0,
    promptSearchAccepted:0,physicalDiscardConfirmed:0,
    physicalBasicToHandConfirmed:0,ownerPromptRejected:0,
    unhandledOwnQuickBallPrompt:0,unknownNativeActionFallbacks:0,
    actualEvents:events,privateOpponentCardsRead:false,
    competitiveGamesQualified:0
  };

  function runMatch(request){
    const match=typeof request?.label==='string'?
      [...ids].find(id=>request.label.endsWith(id)):null;
    if(!match)return oldRun(request);
    assert.equal(active,false);
    trialId=match;active=true;gameStore=null;
    audit.genuineMatches++;
    priorAi=Object.getOwnPropertyDescriptor(ai,'decodeNextAction');
    assert.equal(typeof priorAi?.value,'function');
    Object.defineProperty(ai,'decodeNextAction',{
      ...priorAi,value:decode});
    try{return oldRun(request);}
    finally{
      assert.strictEqual(ai.decodeNextAction,decode);
      Object.defineProperty(ai,'decodeNextAction',priorAi);
      priorAi=null;gameStore=null;active=false;trialId=null;
    }
  }

  function decode(state,...args){
    const seat=state?.activePlayer;
    const owner=state?.players?.[seat];
    if(active&&state===gameStore?.state&&owner?.id===this.client?.id){
      const pending=state.prompts?.find(p=>
        p.result===undefined&&p.playerId===owner.id);
      if(pending&&QUICK_BALL.has(pending.sourceCard?.fullName)){
        const intent=chooseQuickBallPrompt(state,pending,owner);
        if(intent){
          const action=new ResolvePromptAction(pending.id,intent.cards);
          proposals.set(action,{
            trialId,seat,turn:state.turn,kind:intent.step,
            physicalSelection:intent.cards.slice(),
            prompt:pending,
            sourcePrinting:pending.sourceCard.fullName
          });
          return action;
        }
        audit.unhandledOwnQuickBallPrompt++;
      }
    }
    const incumbent=priorAi.value.call(this,state,...args);
    if(!active||state!==gameStore?.state||
       incumbent?.constructor?.name!=='PassTurnAction'||
       owner?.id!==this.client?.id)return incumbent;
    audit.ownerPassObservations++;
    const intent=chooseQuickBallAfterPass(actorObservation(state,seat));
    if(!intent)return incumbent;
    const card=owner.hand.cards[intent.handIndex];
    if(card?.fullName!==intent.printing||
       typeof card.canPlay!=='function'||
       card.canPlay(gameStore,state,owner)!==true)
      return incumbent;
    const action=new PlayCardAction(owner.id,intent.handIndex);
    proposals.set(action,{
      trialId,seat,turn:state.turn,
      kind:'play-quick-ball-after-pass',
      sourcePrinting:intent.printing,
      paymentPrinting:intent.paymentPrinting
    });
    audit.rootAttempts++;
    return action;
  }

  function dispatch(action,...args){
    if(active&&action?.constructor?.name==='AddPlayerAction'&&
       gameStore===null)gameStore=this;
    if(!active||this!==gameStore)
      return oldDispatch.value.call(this,action,...args);
    const receipt=proposals.get(action);
    if(!receipt)return oldDispatch.value.call(this,action,...args);
    const ownerBefore=this.state.players[receipt.seat];
    const selected=receipt.physicalSelection??[];
    const originalHand=ownerBefore.hand.cards.slice();
    const originalDeckCount=ownerBefore.deck.cards.length;
    const originalDiscard=ownerBefore.discard.cards.slice();
    let result;
    try{result=oldDispatch.value.call(this,action,...args);}
    catch(error){
      if(receipt.kind==='play-quick-ball-after-pass')audit.rootRejected++;
      else audit.ownerPromptRejected++;
      if(events.length<128)events.push({...receipt,nativeStoreAccepted:false,
        error:String(error?.message??error)});
      throw error;
    }
    const after=this.state.players[receipt.seat];
    const resolved=receipt.prompt?.result===action.result;
    const paymentMoved=receipt.kind==='mandatory-discard-dead-vip'&&
      selected.length===1&&originalHand.includes(selected[0])&&
      after.discard.cards.includes(selected[0])&&
      !after.hand.cards.includes(selected[0]);
    const searched=receipt.kind==='own-deck-basic-search'&&
      selected.length===1&&!originalHand.includes(selected[0])&&
      after.hand.cards.includes(selected[0])&&
      after.deck.cards.length<originalDeckCount;
    if(receipt.kind==='play-quick-ball-after-pass')
      audit.rootAccepted++;
    if(receipt.kind==='mandatory-discard-dead-vip'){
      if(resolved)audit.promptPaymentAccepted++;
      if(resolved&&paymentMoved)audit.physicalDiscardConfirmed++;
    }
    if(receipt.kind==='own-deck-basic-search'){
      if(resolved)audit.promptSearchAccepted++;
      if(resolved&&searched)audit.physicalBasicToHandConfirmed++;
    }
    if(events.length<128)events.push({
      trialId:receipt.trialId,seat:receipt.seat,turn:receipt.turn,
      kind:receipt.kind,sourcePrinting:receipt.sourcePrinting,
      selectedPrintings:selected.map(x=>x.fullName),
      nativeStoreAccepted:true,ownerPromptResolved:receipt.prompt?
        resolved:null,physicalPaymentMoved:paymentMoved,
      physicalBasicTransferred:searched,
      handBefore:originalHand.length,handAfter:after.hand.cards.length,
      deckBefore:originalDeckCount,deckAfter:after.deck.cards.length,
      discardBefore:originalDiscard.length,discardAfter:after.discard.cards.length
    });
    return result;
  }

  headless.runMatch=runMatch;
  Object.defineProperty(proto,'dispatch',{...oldDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(proto.dispatch,dispatch);
    Object.defineProperty(proto,'dispatch',oldDispatch);
    headless.runMatch=oldRun;
  }
}
module.exports={VERSION,withOwnerQuickBallAfterPass};
