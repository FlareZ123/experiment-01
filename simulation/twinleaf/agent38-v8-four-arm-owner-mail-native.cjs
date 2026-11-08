'use strict';
const assert=require('node:assert/strict');
const {eligibleMailHandIndex,MAIL}=
  require('./agent4-bilateral-mail-root-choice.cjs');
const {chooseOwnedTop4Mail}=
  require('./agent4-mail-owner-prompt-choice.cjs');
const VERSION='agent38-v8-owner-mail-four-arm-native-v1';

/**
 * Adapted from Agent4's tested eight-arm owner-Mail policy for any exact,
 * unique, nonempty registered trial frame. Frozen Agent4 code is preserved.
 * Both-seat owner-only Mail policy layered last at the native match boundary.
 * A root is replaced only if the incumbent canonical policy chooses Pass.
 * All real Store choices, physical identities, and prompt results are audited.
 * @template T
 * @param {()=>T} next
 * @param {object} deps
 * @returns {{result:T,audit:object}}
 */
function withBilateralOwnerMail(next,deps){
  assert.equal(typeof next,'function');
  const {headless,SimpleTacticsAi,Store,PlayCardAction,
    ResolvePromptAction,types,trialIds}=deps;
  const ids=new Set(trialIds);
  assert.equal(ids.size,trialIds.length, 'registered owner-Mail trial IDs must be unique');
  assert.ok(ids.size>0, 'at least one registered trial is required');
  const ai=SimpleTacticsAi.prototype,store=Store.prototype;
  const oldRun=headless.runMatch;
  const oldStore=Object.getOwnPropertyDescriptor(store,'dispatch');
  assert.equal(typeof oldRun,'function');
  assert.equal(typeof oldStore?.value,'function');
  let active=false,storeInstance=null,priorAi=null,pending=null,trialId=null;
  const proposals=new WeakMap();
  const ownerPassMailActions=new WeakSet();
  const physicallySelectedMailTrainers=new WeakSet();
  const audit={schema:VERSION,trialIds:[...ids],attempts:0,
    lateDecoderInstallations:0,ownerRootPassesSeen:0,
    proposalCountsBySeat:[0,0],actualMailItemRootsBySeat:[0,0],
    nativeOwnerTop4PromptsBySeat:[0,0],
    nativeStoreResolvedBySeat:[0,0],
    physicalTrainerToHandBySeat:[0,0],
    physicalOtherTopCardsToDeckBySeat:[0,0],
    otherActionsDelegateToExistingPolicy:true,
    rejectedPromptActions:0,unsettledPromptActions:0,
    noPromptAfterMailBySeat:[0,0],
    revealedTrainers:[],actualMailEvents:[],
    selectedTrainerLaterPlayed:[],nativeDecoderInvocations:0,
    opponentPrivateZonesRead:false,qualifiedGames:0};

  function observedMatch(request){
    const id=typeof request?.label==='string'?
      [...ids].find(x=>request.label.endsWith(x)):undefined;
    if(!id)return oldRun(request);
    assert.equal(active,false);
    trialId=id;active=true;storeInstance=null;pending=null;
    audit.attempts++;
    const descriptor=Object.getOwnPropertyDescriptor(ai,'decodeNextAction');
    assert.equal(typeof descriptor?.value,'function');
    priorAi=descriptor;
    Object.defineProperty(ai,'decodeNextAction',{
      ...descriptor,value:observedDecode});
    audit.lateDecoderInstallations++;
    try{return oldRun(request);}
    finally{
      assert.strictEqual(ai.decodeNextAction,observedDecode);
      Object.defineProperty(ai,'decodeNextAction',descriptor);
      priorAi=null;active=false;storeInstance=null;pending=null;trialId=null;
    }
  }

  function observedDecode(state,...args){
    audit.nativeDecoderInvocations++;
    const seat=state?.activePlayer;
    const owner=state?.players?.[seat];
    const prompt=state?.prompts?.find(p=>p.result===undefined);
    if(active&&state===storeInstance?.state&&
      pending?.seat===seat&&
      owner?.id===this.client?.id&&prompt?.id===pending.id){
      const selected=chooseOwnedTop4Mail(prompt,owner,types);
      if(selected!==null){
        const answer=new ResolvePromptAction(prompt.id,selected);
        proposals.set(answer,{
          prompt,seat,ownerId:owner.id,
          originalTop:prompt.cards.cards.slice(),
          originalHand:owner.hand.cards.slice(),
          chosen:selected
        });
        audit.nativeOwnerTop4PromptsBySeat[seat]++;
        return answer;
      }
    }
    const baseline=priorAi.value.call(this,state,...args);
    if(!active||state!==storeInstance?.state||
      baseline?.constructor?.name!=='PassTurnAction'||
      owner?.id!==this.client?.id)return baseline;
    audit.ownerRootPassesSeen++;
    const handIndex=eligibleMailHandIndex(state,seat,storeInstance);
    if(handIndex===null)return baseline;
    audit.proposalCountsBySeat[seat]++;
    const action=new PlayCardAction(owner.id,handIndex);
    ownerPassMailActions.add(action);
    return action;
  }

  function observedDispatch(action,...args){
    if(active&&action?.constructor?.name==='AddPlayerAction'&&
       storeInstance===null)storeInstance=this;
    if(!active||this!==storeInstance)
      return oldStore.value.call(this,action,...args);
    const state=this.state,seat=state.activePlayer;
    const owner=state.players?.[seat];
    const proposal=proposals.get(action);
    // Only cards selected by a genuinely settled owner's Mail prompt can
    // later qualify as search-to-play evidence. Identity persists in hand.
    const selectedMailCard=action?.constructor?.name==='PlayCardAction'?
      owner?.hand?.cards?.[action.handIndex]:null;
    const fromSettledMail=selectedMailCard&&
      physicallySelectedMailTrainers.has(selectedMailCard);
    const mailPlay=owner&&
      action?.constructor?.name==='PlayCardAction'&&
      action.id===owner.id&&
      owner.hand.cards[action.handIndex]?.fullName===MAIL;
    let value;
    try{value=oldStore.value.call(this,action,...args);}
    catch(e){if(proposal)audit.rejectedPromptActions++;throw e;}
    if(fromSettledMail){
      const played={trialId,seat,turnBefore:state.turn,
        printing:selectedMailCard.fullName};
      audit.selectedTrainerLaterPlayed.push(played);
      deps.onSelectedTrainerPlayed?.(action,played);
    }
    if(mailPlay){
      if(ownerPassMailActions.has(action))
        deps.onMailActionCommitted?.(action,{trialId,seat,turnBefore:state.turn});
      audit.actualMailItemRootsBySeat[seat]++;
      const p=this.state.prompts?.find(x=>x.result===undefined);
      if(audit.actualMailEvents.length<64) {
        audit.actualMailEvents.push({trialId,seat,turnBefore:state.turn,
          actionHandIndex:action.handIndex,printing:MAIL,
          pendingPromptId:p?.id==null?null:String(p.id)});
      }
      if(p?.playerId===owner.id&&
        p?.constructor?.name==='ChooseCardsPrompt'&&
        p.message==='CHOOSE_CARD_TO_HAND'&&
        p.cards!==owner.deck)
        pending={id:p.id,seat};
      else{
        pending=null;
        audit.noPromptAfterMailBySeat[seat]++;
      }
    }
    if(proposal){
      const after=this.state.players[proposal.seat];
      const chosen=proposal.chosen;
      const settled=proposal.prompt.result===action.result;
      const physical=chosen.every(card=>
        proposal.originalTop.includes(card)&&
        !proposal.originalHand.includes(card)&&
        after.hand.cards.includes(card)&&
        !proposal.prompt.cards.cards.includes(card));
      const others=proposal.originalTop.filter(card=>!chosen.includes(card));
      const replaced=others.every(card=>after.deck.cards.includes(card));
      if(settled&&physical&&replaced){
        for(const card of chosen)physicallySelectedMailTrainers.add(card);
        audit.nativeStoreResolvedBySeat[proposal.seat]++;
        audit.physicalTrainerToHandBySeat[proposal.seat]+=chosen.length;
        audit.physicalOtherTopCardsToDeckBySeat[proposal.seat]+=others.length;
        if(chosen.length)audit.revealedTrainers.push({
          trialId,seat:proposal.seat,
          printing:chosen[0].fullName
        });
      }else audit.unsettledPromptActions++;
      pending=null;
    }
    return value;
  }

  headless.runMatch=observedMatch;
  Object.defineProperty(store,'dispatch',{
    ...oldStore,value:observedDispatch});
  try{return {result:next(),audit};}
  finally{
    assert.strictEqual(store.dispatch,observedDispatch);
    Object.defineProperty(store,'dispatch',oldStore);
    headless.runMatch=oldRun;
  }
}
module.exports={VERSION,withBilateralOwnerMail};
