'use strict';
const assert=require('node:assert/strict');
const {chooseOwnedTop4Mail}=
  require('./agent4-mail-owner-prompt-choice.cjs');
const VERSION='agent4-mail-real-owner-prompt-store-v1';
/**
 * Source-owning, one-prompt native followthrough. Every other prompt delegates.
 * The selected original physical opening and treatment are checked by runner.
 * @template T
 * @param {()=>T} next
 * @param {object} deps
 * @returns {{result:T,audit:object}}
 */
function withOwnedMailPrompt(next,deps){
  assert.equal(typeof next,'function');
  const {headless,Store,SimpleTacticsAi,ResolvePromptAction,
    types,reg}=deps;
  const ai=SimpleTacticsAi.prototype,store=Store.prototype;
  const priorAi=Object.getOwnPropertyDescriptor(ai,'decodeNextAction');
  const priorStore=Object.getOwnPropertyDescriptor(store,'dispatch');
  assert.equal(typeof headless?.runMatch,'function');
  assert.equal(typeof priorAi?.value,'function');
  assert.equal(typeof priorStore?.value,'function');
  const oldRun=headless.runMatch,proposals=new WeakMap();
  let target=false,liveStore=null,awaiting=null,activeAi=null;
  const audit={schema:VERSION,sourceId:reg.selectedOriginalId,
    targetMatches:0,realStores:0,realMailRoots:0,
    lateHookInstallations:0,lateHookInvocations:0,
    gateMismatches:[],ownerPromptsSeen:0,answersSelected:0,StoreResolved:0,
    physicalTrainersToHand:0,nonchosenTopCardsToDeck:0,
    nativeRejects:0,unsettledAnswers:0,noMailPrompt:0,
    otherPromptTypes:[],opponentConcealedZonesRead:false,
    qualifiedGames:0};

  function observedRun(request){
    if(typeof request?.label!=='string'||
      !request.label.endsWith(reg.selectedOriginalId))
      return oldRun(request);
    assert.equal(target,false);
    target=true;liveStore=null;awaiting=null;audit.targetMatches++;
    // All selected common-policy decoders are already installed by the
    // current runMatch caller. Wrap them HERE, then restore before their
    // own finally blocks check the expected decoder identity.
    const installed=Object.getOwnPropertyDescriptor(ai,'decodeNextAction');
    assert.equal(typeof installed?.value,'function');
    activeAi=installed;
    Object.defineProperty(ai,'decodeNextAction',{
      ...installed,value:observedDecode});
    audit.lateHookInstallations++;
    try{return oldRun(request);}
    finally{
      assert.strictEqual(ai.decodeNextAction,observedDecode);
      Object.defineProperty(ai,'decodeNextAction',installed);
      activeAi=null;target=false;liveStore=null;awaiting=null;
    }
  }
  function observedDecode(state,...args){
    audit.lateHookInvocations++;
    const owner=state?.players?.[reg.originalSourceSeat];
    const p=state?.prompts?.find(x=>x.result===undefined);
    const eligible=target&&state===liveStore?.state&&
      owner?.id===this.client?.id&&
      state.activePlayer===reg.originalSourceSeat&&
      awaiting!==null&&p?.id===awaiting.id;
    if(!eligible){
      if(target&&awaiting&&audit.gateMismatches.length<8)
        audit.gateMismatches.push({
          currentStoreState:state===liveStore?.state,
          currentOwnerClient:owner?.id===this.client?.id,
          currentOwnerActive:state?.activePlayer===reg.originalSourceSeat,
          nativePromptType:p?.constructor?.name??null,
          matchingPendingPrompt:p?.id===awaiting.id
        });
      return activeAi.value.call(this,state,...args);
    }
    audit.ownerPromptsSeen++;
    const cards=chooseOwnedTop4Mail(p,owner,types);
    if(cards===null)return activeAi.value.call(this,state,...args);
    const answer=new ResolvePromptAction(p.id,cards);
    proposals.set(answer,{prompt:p,selected:cards,
      originalTop:p.cards.cards.slice(),
      originalHand:owner.hand.cards.slice()});
    audit.answersSelected++;
    return answer;
  }
  function observedDispatch(action,...args){
    if(target&&action?.constructor?.name==='AddPlayerAction'&&
      liveStore===null){liveStore=this;audit.realStores++;}
    if(!target||this!==liveStore)
      return priorStore.value.call(this,action,...args);
    const state=this.state;
    const owner=state?.players?.[reg.originalSourceSeat];
    const proposal=proposals.get(action);
    const isMail=owner&&action?.constructor?.name==='PlayCardAction'&&
      action.id===owner.id&&
      state.activePlayer===reg.originalSourceSeat&&
      state.turn===reg.sourceTurn&&
      owner.hand.cards[action.handIndex]?.fullName===reg.sourceCardToPlay;
    let returnValue;
    try{returnValue=priorStore.value.call(this,action,...args);}
    catch(e){if(proposal)audit.nativeRejects++;throw e;}
    if(isMail){
      audit.realMailRoots++;
      const p=this.state.prompts?.find(x=>x.result===undefined);
      if(p?.playerId===owner.id&&
        p.constructor?.name==='ChooseCardsPrompt'&&
        p.message==='CHOOSE_CARD_TO_HAND'&&
        p.cards!==owner.deck)awaiting={id:p.id};
      else {
        audit.noMailPrompt++;
        if(p)audit.otherPromptTypes.push(p.constructor?.name??null);
      }
    }
    if(proposal){
      const after=this.state.players[reg.originalSourceSeat];
      const selected=proposal.selected;
      const settled=proposal.prompt.result===action.result;
      const physical=selected.every(c=>
        proposal.originalTop.includes(c)&&
        !proposal.originalHand.includes(c)&&
        after.hand.cards.includes(c)&&
        !proposal.prompt.cards.cards.includes(c));
      const remaining=proposal.originalTop.filter(c=>!selected.includes(c));
      const returned=remaining.every(c=>after.deck.cards.includes(c));
      if(settled&&physical&&returned){
        audit.StoreResolved++;
        audit.physicalTrainersToHand+=selected.length;
        audit.nonchosenTopCardsToDeck+=remaining.length;
      }else audit.unsettledAnswers++;
      awaiting=null;
    }
    return returnValue;
  }
  headless.runMatch=observedRun;
  Object.defineProperty(store,'dispatch',{...priorStore,value:observedDispatch});
  try{return {result:next(),audit};}
  finally{
    assert.strictEqual(ai.decodeNextAction,priorAi.value);
    assert.strictEqual(store.dispatch,observedDispatch);
    Object.defineProperty(store,'dispatch',priorStore);
    headless.runMatch=oldRun;
  }
}
module.exports={VERSION,withOwnedMailPrompt};
