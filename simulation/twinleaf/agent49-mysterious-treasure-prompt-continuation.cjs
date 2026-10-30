'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseTreasureRootIntent,ITEM}=
  require('./agent49-mysterious-treasure-frontier.cjs');

const VERSION='agent49-owner-treasure-two-prompt-native-bridge-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Continue only an already accepted, owner-visible Mysterious Treasure root.
 * Its hand discard is a known owner card. The later deck identities are read
 * only from the native pending owner-deck search prompt, which is precisely
 * the point a player is entitled to inspect their deck (K1).
 * @template T
 * @param {()=>T} execute Real pinned native Store synchronous workload.
 * @param {object} [deps] Native mock seams for direct regression.
 * @returns {{result:T,audit:object}}
 */
function withOwnerTreasurePromptContinuation(execute,deps={}){
  assert.equal(typeof execute,'function');
  const native=name=>require(path.join(OUTPUT,name));
  const Bot=deps.SimpleTacticsAi??native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    native('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const observe=deps.observe??actorObservation;
  const choose=deps.choose??chooseTreasureRootIntent;
  const trace=deps.trace??(()=>{});
  const getCatalog=deps.getCatalog??(()=>{
    return require('./agent43-guzma-prompt-continuation.cjs')
      .publicCatalog();
  });
  const originalDecode=Object.getOwnPropertyDescriptor(
    Bot.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof originalDecode?.value,'function');
  assert.equal(typeof originalDispatch?.value,'function');
  let liveStore=deps.initialLiveStore??null,catalog=null;
  const plans=new Map(),plannedReplies=new WeakMap();
  const awaitingItemFinality=new Map();
  const audit={version:VERSION,ownerOnly:true,
    observedAcceptedItemRoots:0,plannedSourceSafeRoots:0,
    costPromptAccepted:0,searchPromptAccepted:0,
    physicalCostDiscards:0,physicalTargetRetrievals:0,
    missingPhysicalTargets:0,unplannedPrompts:0,
    failedOrRejectedReplies:0,completedPhysicalChains:0,
    nativeItemFinalized:0,postSearchDisplayPending:0,
    bySeat:{0:0,1:0},receipts:[],competitiveQualifiedGames:0};

  function log(data){
    if(audit.receipts.length<40)audit.receipts.push(data);
  }
  function decode(state,...rest){
    if(state!==liveStore?.state)return originalDecode.value.apply(this,[state,...rest]);
    const ownerId=this.client?.id,plan=plans.get(ownerId);
    if(!plan)return originalDecode.value.apply(this,[state,...rest]);
    if(state.turn!==plan.turn||state.activePlayer!==plan.seat){
      plans.delete(ownerId);
      return originalDecode.value.apply(this,[state,...rest]);
    }
    const prompt=state.prompts?.find(p=>p.result===undefined);
    if(!prompt||prompt.playerId!==ownerId||
       prompt.constructor.name!=='ChooseCardsPrompt'){
      return originalDecode.value.apply(this,[state,...rest]);
    }
    const player=state.players[plan.seat];
    let selection=null,kind=null;
    // The native prompt's physical owner zone and validator are authoritative.
    // Printed message labels can differ between card implementations.
    if(plan.step==='cost' && prompt.cards===player.hand){
      selection=prompt.cards.cards.find(card=>
        card.fullName===plan.discardPrinting);
      kind='cost';
    }else if(plan.step==='search' && prompt.cards===player.deck){
      // The owner can inspect the actual deck only inside this live prompt.
      // A Regidrago V in play prioritizes VSTAR; otherwise choose the first
      // genuinely eligible Dragon or Psychic Pokémon under native validation.
      const inPlay=[player.active,...player.bench]
        .map(slot=>slot.getPokemonCard?.()?.name??null);
      if(inPlay.includes('Regidrago V')&&!inPlay.includes('Regidrago VSTAR')){
        selection=prompt.cards.cards.find(card=>card.name==='Regidrago VSTAR'&&
          prompt.validate([card],state)===true);
      }
      if(!selection){
        selection=prompt.cards.cards.find(card=>
          (catalog?.dragonPokemonPrintings?.has(card.fullName)||
            card.cardType?.includes(catalog?.basicEnergyTypes?.Psychic))&&
          prompt.validate([card],state)===true);
      }
      kind='search';
    }
    if(!selection||prompt.validate([selection],state)!==true){
      audit.missingPhysicalTargets++;
      return originalDecode.value.apply(this,[state,...rest]);
    }
    const reply=new ResolvePromptAction(prompt.id,[selection]);
    plannedReplies.set(reply,{...plan,kind,
      choice:selection,promptId:prompt.id});
    return reply;
  }
  function dispatch(action,...rest){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;plans.clear();awaitingItemFinality.clear();
    }
    const real=this===liveStore;
    const state=this.state;
    let opportunity=null;
    if(real&&action?.constructor?.name==='PlayCardAction'){
      const seat=state.activePlayer,owner=state.players?.[seat];
      trace({phase:'live-play-action',seat,actionKeys:Object.keys(action),
        actionId:action.id,actionPlayerId:action.playerId,
        handIndex:action.handIndex,ownerId:owner?.id,
        sourcePrinting:Number.isInteger(action.handIndex)?
          owner?.hand.cards[action.handIndex]?.fullName:null,
        openPrompts:state.prompts?.filter(p=>p.result===undefined).length});
    }
    if(real&&action?.constructor?.name==='PlayCardAction'&&
      Number.isInteger(action.handIndex)&&
      !state.prompts?.some(p=>p.result===undefined)){
      const seat=state.activePlayer,owner=state.players?.[seat];
      if((owner?.id===action.playerId||owner?.id===action.id)&&
         owner.hand.cards[action.handIndex]?.fullName===ITEM){
        const view=observe(state,seat);
        catalog??=getCatalog();
        const planned=choose(view,catalog);
        opportunity={seat,ownerId:owner.id,turn:state.turn,
          itemRef:owner.hand.cards[action.handIndex],
          handCountBefore:owner.hand.cards.length,
          planned:planned?.handIndex===action.handIndex?planned:null};
      }
    }
    const reply=real?plannedReplies.get(action):null;
    let result;
    try{result=originalDispatch.value.apply(this,[action,...rest]);}
    catch(error){
      if(reply){
        audit.failedOrRejectedReplies++;
        log({kind:'native-rejected',seat:reply.seat,step:reply.kind,
          reason:String(error?.message??error)});
      }
      throw error;
    }
    if(opportunity){
      audit.observedAcceptedItemRoots++;
      const owner=this.state.players[opportunity.seat];
      const consumed=owner.hand.cards.length===opportunity.handCountBefore-1;
      const hasOwnerPrompt=this.state.prompts?.some(p=>p.result===undefined&&
        p.playerId===opportunity.ownerId);
      trace({phase:'live-item-acceptance',seat:opportunity.seat,
        consumed,hasOwnerPrompt,plannedKind:opportunity.planned?.kind??null,
        plannedDiscard:opportunity.planned?.discardPrinting??null});
      if(consumed&&hasOwnerPrompt&&opportunity.planned){
        plans.set(opportunity.ownerId,{
          seat:opportunity.seat,turn:opportunity.turn,
          itemRef:opportunity.itemRef,
          discardPrinting:opportunity.planned.discardPrinting,
          reason:opportunity.planned.reason,step:'cost'});
        audit.plannedSourceSafeRoots++;
      }
    }
    if(reply){
      const owner=this.state.players[reply.seat];
      const plan=plans.get(reply.ownerId);
      if(!plan)return result;
      if(reply.kind==='cost'){
        audit.costPromptAccepted++;
        const settled=owner.discard.cards.includes(reply.choice);
        if(settled)audit.physicalCostDiscards++;
        plan.step='search';plan.costSettled=settled;
        log({kind:'native-owner-cost',seat:reply.seat,turn:reply.turn,
          originalDecisionReason:reply.reason,
          physicalDiscard:reply.choice.fullName,settled});
      }else if(reply.kind==='search'){
        audit.searchPromptAccepted++;
        const settled=owner.hand.cards.includes(reply.choice);
        if(settled)audit.physicalTargetRetrievals++;
        if(settled&&plan.costSettled){
          audit.completedPhysicalChains++;
          audit.bySeat[reply.seat]++;
        }
        const open=this.state.prompts?.find(p=>p.result===undefined);
        if(open?.constructor?.name==='ShowCardsPrompt')
          audit.postSearchDisplayPending++;
        if(!open&&owner.discard.cards.includes(plan.itemRef))
          audit.nativeItemFinalized++;
        else if(open&&settled&&plan.costSettled)
          awaitingItemFinality.set(reply.ownerId,{...plan});
        log({kind:'native-owner-deck-hit',seat:reply.seat,
          printing:reply.choice.fullName,settled,
          costAlreadyPhysicallyDiscarded:plan.costSettled===true,
          pendingAfterRetrieval:open?.constructor?.name??null,
          nativeItemFinalized:!open&&owner.discard.cards.includes(
            plan.itemRef)});
        plans.delete(reply.ownerId);
      }
    }
    // Final owner Item discard may occur after a reveal and a mandatory deck
    // reorder. Certify physical finality only after those prompts are clear.
    for(const [id,pending] of awaitingItemFinality){
      const owner=this.state.players[pending.seat];
      const stillPrompted=this.state.prompts?.some(p=>p.result===undefined);
      if(!stillPrompted&&owner?.discard.cards.includes(pending.itemRef)){
        audit.nativeItemFinalized++;
        log({kind:'native-item-finalized',seat:pending.seat,
          originalTurn:pending.turn,physicalItem:pending.itemRef.fullName});
        awaitingItemFinality.delete(id);
      }
    }
    return result;
  }
  Object.defineProperty(Bot.prototype,'decodeNextAction',
    {...originalDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...originalDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Bot.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
    Object.defineProperty(Bot.prototype,'decodeNextAction',originalDecode);
  }
}
module.exports={VERSION,withOwnerTreasurePromptContinuation};
