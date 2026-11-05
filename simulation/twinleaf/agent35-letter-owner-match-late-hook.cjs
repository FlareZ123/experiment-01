'use strict';

const assert=require('node:assert/strict');
const {chooseLetterDarkness}=
  require('./agent35-owner-letter-search.cjs');

const VERSION='agent35-original-letter-late-native-owner-deck-prompt-v3';

/**
 * A narrow, original source-only Professor's Letter continuation.
 *
 * Install the native match wrapper outside the frozen source fork so that
 * its owner-root patch and every canonical AI policy are already active
 * when this wrapper temporarily intercepts decodeNextAction. This is the
 * hook-order contract proven by Agent4 for source-owned Trainers' Mail.
 * The Store creates a real source-owned prompt before any deck is examined.
 *
 * @template T
 * @param {()=>T} next Existing original-eight source runner.
 * @param {object} deps Pinned compiled Store, AI and research headless driver.
 * @returns {{result:T,audit:object}}
 */
function withLateOwnedLetterPrompt(next,deps){
  assert.equal(typeof next,'function');
  const {headless,Store,SimpleTacticsAi,ResolvePromptAction,
    types,registration:reg}=deps;
  assert.equal(typeof headless?.runMatch,'function');
  const ai=SimpleTacticsAi.prototype,store=Store.prototype;
  const originalRun=headless.runMatch;
  const originalStore=Object.getOwnPropertyDescriptor(store,'dispatch');
  const originalAi=Object.getOwnPropertyDescriptor(ai,'decodeNextAction');
  assert.equal(typeof originalStore?.value,'function');
  assert.equal(typeof originalAi?.value,'function');

  const answers=new WeakMap();
  let active=false,liveStore=null,awaiting=null,installedAi=null;
  const audit={schema:VERSION,sourceId:reg.selectedOriginalId,
    sourceMatches:0,realStores:0,sourceItemsAccepted:0,
    legitimateOwnerDeckPrompts:0,lateInstalls:0,
    lateDecoderInvocations:0,searchChoicesSubmitted:0,
    searchPromptsSettled:0,physicalDarknessToHand:0,
    nativeRejects:0,physicalFailures:0,
    ignoredOtherPromptTypes:[],opponentHiddenZonesRead:false,
    qualifiedGames:0};

  function match(request){
    if(typeof request?.label!=='string'||
      !request.label.endsWith(reg.selectedOriginalId))
      return originalRun(request);
    assert.equal(active,false);
    active=true;liveStore=null;awaiting=null;audit.sourceMatches++;
    const desc=Object.getOwnPropertyDescriptor(ai,'decodeNextAction');
    assert.equal(typeof desc?.value,'function');
    installedAi=desc;
    Object.defineProperty(ai,'decodeNextAction',{
      ...desc,value:decode});
    audit.lateInstalls++;
    try{return originalRun(request);}
    finally{
      assert.strictEqual(ai.decodeNextAction,decode);
      Object.defineProperty(ai,'decodeNextAction',desc);
      installedAi=null;active=false;liveStore=null;awaiting=null;
    }
  }

  function decode(state,...args){
    audit.lateDecoderInvocations++;
    const owner=state?.players?.[reg.originalSourceSeat];
    const prompt=state?.prompts?.find(p=>p.result===undefined);
    const valid=active&&liveStore?.state===state&&
      owner?.id===this.client?.id&&
      state.activePlayer===reg.originalSourceSeat&&
      awaiting?.id===prompt?.id;
    if(valid){
      const two=chooseLetterDarkness(prompt,owner,{
        ...types,GameMessage:{CHOOSE_CARD_TO_HAND:'CHOOSE_CARD_TO_HAND'}
      });
      if(two!==null){
        const answer=new ResolvePromptAction(prompt.id,two);
        answers.set(answer,{
          prompt,seat:reg.originalSourceSeat,
          sourceDeck:owner.deck,
          beforeHand:new Set(owner.hand.cards),
          beforeDeck:new Set(owner.deck.cards),
          selected:two
        });
        audit.searchChoicesSubmitted++;
        return answer;
      }
    }
    return installedAi.value.call(this,state,...args);
  }

  function dispatch(action,...args){
    if(active&&action?.constructor?.name==='AddPlayerAction'&&
      liveStore===null){liveStore=this;audit.realStores++;}
    if(!active||this!==liveStore)
      return originalStore.value.call(this,action,...args);
    const state=this.state;
    const owner=state.players?.[reg.originalSourceSeat];
    const candidate=answers.get(action);
    const letter=owner&&
      action?.constructor?.name==='PlayCardAction'&&
      action.id===owner.id&&
      state.activePlayer===reg.originalSourceSeat&&
      state.turn===reg.sourceTurn&&
      owner.hand.cards[action.handIndex]?.fullName===
        reg.sourceCardToPlay;
    let returnValue;
    try{returnValue=originalStore.value.call(this,action,...args);}
    catch(error){if(candidate)audit.nativeRejects++;throw error;}
    if(letter){
      audit.sourceItemsAccepted++;
      const after=this.state.players[reg.originalSourceSeat];
      const prompt=this.state.prompts?.find(p=>
        p.result===undefined&&
        p.playerId===after.id&&
        p.constructor?.name==='ChooseCardsPrompt'&&
        p.message==='CHOOSE_CARD_TO_HAND'&&
        p.cards===after.deck);
      if(prompt){
        awaiting={id:prompt.id};
        audit.legitimateOwnerDeckPrompts++;
      }else{
        awaiting=null;
        const other=this.state.prompts?.find(p=>p.result===undefined);
        if(other)audit.ignoredOtherPromptTypes.push(
          other.constructor?.name??null);
      }
    }
    if(candidate){
      const after=this.state.players[candidate.seat];
      const settled=candidate.prompt.result===action.result;
      const physical=candidate.selected.every(card=>
        candidate.beforeDeck.has(card)&&
        !candidate.beforeHand.has(card)&&
        after.hand.cards.includes(card)&&
        !after.deck.cards.includes(card));
      if(settled&&physical){
        audit.searchPromptsSettled++;
        audit.physicalDarknessToHand+=candidate.selected.length;
      }else audit.physicalFailures++;
      awaiting=null;
    }
    return returnValue;
  }

  headless.runMatch=match;
  Object.defineProperty(store,'dispatch',{
    ...originalStore,value:dispatch});
  try{return {result:next(),audit};}
  finally{
    assert.strictEqual(ai.decodeNextAction,originalAi.value);
    assert.strictEqual(store.dispatch,dispatch);
    Object.defineProperty(store,'dispatch',originalStore);
    headless.runMatch=originalRun;
  }
}

module.exports={VERSION,withLateOwnedLetterPrompt};
