'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent49-firstturn-source-call-for-family-owner-bench-prompt-v1';
const TARGET_ATTACK='Call for Family';
const SOURCE_BASIC='Trubbish FST';
const OWNER_BENCH_PROMPT='CHOOSE_CARD_TO_PUT_ONTO_BENCH';

/**
 * Rank an owner-authorized single-Basic search. Prefer the second Trubbish
 * for a future Garbodor line; alternatives are merely deterministic baseline
 * tie-breaks and have no established best-response value.
 *
 * Never use this until the actual source-owned AttackAction created an actual
 * source-deck prompt. Prize/deck secrecy applies before that point.
 * @param {object} prompt Genuine native ChooseCardsPrompt.
 * @param {object} owner Original acting owner with physical deck.
 * @param {object} types Pinned public card enum constants.
 * @param {object} state Original live native Store state for validator.
 * @returns {object[]|null} One physical Basic Pokémon or unsupported prompt.
 */
function chooseCallFamilyBasic(prompt,owner,types,state){
  if(prompt?.constructor?.name!=='ChooseCardsPrompt'||
      prompt.playerId!==owner?.id||
      prompt.cards!==owner.deck||
      prompt.message!==OWNER_BENCH_PROMPT||
      prompt.options?.max!==1||
      ![0,1].includes(prompt.options?.min)||
      !Array.isArray(owner.deck.cards))return null;
  const actual=owner.deck.cards.filter(card=>
    card.superType===types.SuperType.POKEMON&&
    card.stage===types.Stage.BASIC&&
    prompt.validate([card],state)===true)
    .sort((a,b)=>
      Number(b.fullName===SOURCE_BASIC)-
      Number(a.fullName===SOURCE_BASIC)||
      a.fullName.localeCompare(b.fullName));
  if(actual.length===0)return null;
  const selected=[actual[0]];
  assert.equal(prompt.validate(selected,state),true);
  return selected;
}

/**
 * Reversible late-at-genuine-live-match source-only attack search extension.
 * Install inside Agent35's late Letter search wrapper, so the Letter decoder
 * handles its own Item and delegates only subsequent owner attack prompts.
 *
 * @template T
 * @param {()=>T} next Actual original fixed eight-game batch.
 * @param {{headless:object,Store:Function,SimpleTacticsAi:Function,
 * ResolvePromptAction:Function,types:object,registration:object}} deps
 * @returns {{result:T,audit:object}}
 */
function withLateOwnedCallFamilyPrompt(next,deps){
  assert.equal(typeof next,'function');
  const {headless,Store,SimpleTacticsAi,ResolvePromptAction,
    types,registration:reg}=deps;
  const beforeRun=headless.runMatch;
  const originalStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const originalAi=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof originalStore?.value,'function');
  assert.equal(typeof originalAi?.value,'function');
  assert.equal(reg.sourceTurn,2);
  assert.equal(reg.originalSourceSeat,1);
  // Opt-in continuation for a registered later source turn. The default
  // remains the original first-turn-only native experiment.
  const sourceEndTurn=deps.sourceEndTurn??reg.sourceTurn;
  assert.ok(Number.isInteger(sourceEndTurn)&&
    sourceEndTurn>=reg.sourceTurn&&
    (sourceEndTurn-reg.sourceTurn)%2===0);

  const selected=new WeakMap();
  let target=false,liveStore=null,awaiting=null,innerAi=null;
  const audit={version:VERSION,selectedSourceId:reg.selectedOriginalId,
    sourceTurnWindow:{start:reg.sourceTurn,end:sourceEndTurn},
    sourceAttackTurns:[],physicalBasicMovesByTurn:[],
    realOwnerStores:0,sourceAttackAttempts:0,nativeSourceAttackAccepted:0,
    genuineOwnerBasicDeckPrompts:0,unmatchedAttackPrompts:0,
    promptShape:null,ownerBasicPromptChoicesSubmitted:0,
    ownerBasicPromptAnswersNativeAccepted:0,
    oneOriginalBasicMovedToBench:0,physicalBenchTransferFailures:0,
    ownerDeckReadBeforeAuthorizedPrompt:false,
    opponentHiddenZoneInspected:false,engineAbortBeforeSearch:false,
    competitiveGamesQualified:0};

  function game(request){
    if(typeof request?.label!=='string'||
        !request.label.endsWith(reg.selectedOriginalId))
      return beforeRun(request);
    assert.equal(target,false);
    target=true;liveStore=null;awaiting=null;
    const actual=Object.getOwnPropertyDescriptor(
      SimpleTacticsAi.prototype,'decodeNextAction');
    innerAi=actual;
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
      ...actual,value:decode});
    try{return beforeRun(request);}
    finally{
      assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
      Object.defineProperty(SimpleTacticsAi.prototype,
        'decodeNextAction',actual);
      target=false;liveStore=null;awaiting=null;innerAi=null;
    }
  }

  function decode(state,...args){
    const owner=state?.players?.[reg.originalSourceSeat];
    const prompt=state?.prompts?.find(p=>p.id===awaiting?.promptId&&
      p.result===undefined);
    if(target&&state===liveStore?.state&&
        owner?.id===this.client?.id&&
        state.activePlayer===reg.originalSourceSeat&&
        awaiting?.turn===state.turn&&prompt&&
        prompt.playerId===owner.id&&prompt.cards===owner.deck){
      const cards=chooseCallFamilyBasic(prompt,owner,types,state);
      if(cards!==null){
        const answer=new ResolvePromptAction(prompt.id,cards);
        selected.set(answer,{prompt,seat:reg.originalSourceSeat,
          turn:state.turn,cards,ownerHandBefore:new Set(owner.hand.cards),
          ownerDeckBefore:new Set(owner.deck.cards),
          sourceBenchBefore:owner.bench
            .filter(slot=>slot.cards.length>0).length});
        audit.ownerBasicPromptChoicesSubmitted++;
        return answer;
      }
    }
    return innerAi.value.call(this,state,...args);
  }

  function dispatch(action,...args){
    if(target&&action?.constructor?.name==='AddPlayerAction'&&
        liveStore===null){
      liveStore=this;audit.realOwnerStores++;
    }
    if(!target||this!==liveStore)
      return originalStore.value.apply(this,[action,...args]);
    const state=this.state;
    const owner=state.players[reg.originalSourceSeat];
    const attack=action?.constructor?.name==='AttackAction'&&
      action.clientId===owner?.id&&
      state.turn>=reg.sourceTurn&&state.turn<=sourceEndTurn&&
      (state.turn-reg.sourceTurn)%2===0&&
      state.activePlayer===reg.originalSourceSeat&&
      action.name===TARGET_ATTACK&&
      owner.active.getPokemonCard()?.fullName===SOURCE_BASIC;
    const priorPromptIds=attack?
      new Set(state.prompts.map(p=>p.id)):null;
    if(attack){audit.sourceAttackAttempts++;
      audit.sourceAttackTurns.push(state.turn);}
    const proposal=selected.get(action);
    let result;
    try{result=originalStore.value.apply(this,[action,...args]);}
    catch(error){
      if(attack)audit.engineAbortBeforeSearch=true;
      throw error;
    }
    if(attack){
      audit.nativeSourceAttackAccepted++;
      const after=this.state.players[reg.originalSourceSeat];
      const created=this.state.prompts.find(p=>
        p.result===undefined&&!priorPromptIds.has(p.id)&&
        p.playerId===after.id&&
        p.constructor?.name==='ChooseCardsPrompt'&&
        p.cards===after.deck);
      if(created){
        awaiting={promptId:created.id,turn:this.state.turn};
        audit.genuineOwnerBasicDeckPrompts++;
        audit.promptShape={message:created.message,
          min:created.options?.min??null,
          max:created.options?.max??null,
          allowCancel:created.options?.allowCancel??null};
      }else audit.unmatchedAttackPrompts++;
    }
    if(proposal){
      const after=this.state.players[proposal.seat];
      const changed=proposal.prompt.result===action.result;
      const moved=proposal.cards.every(card=>
        proposal.ownerDeckBefore.has(card)&&
        !proposal.ownerHandBefore.has(card)&&
        !after.deck.cards.includes(card)&&
        after.bench.some(slot=>slot.cards.includes(card)))&&
        after.bench.filter(slot=>slot.cards.length>0).length===
          proposal.sourceBenchBefore+proposal.cards.length;
      if(changed)audit.ownerBasicPromptAnswersNativeAccepted++;
      if(changed&&moved){
        audit.oneOriginalBasicMovedToBench++;
        audit.physicalBasicMovesByTurn.push({
          turn:proposal.turn,card:proposal.cards[0].fullName
        });
      }else audit.physicalBenchTransferFailures++;
      awaiting=null;
    }
    return result;
  }

  headless.runMatch=game;
  Object.defineProperty(Store.prototype,'dispatch',{
    ...originalStore,value:dispatch});
  try{return {result:next(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent49FamilyOwnerPromptAudit={...audit};
    throw error;
  }finally{
    assert.strictEqual(headless.runMatch,game);
    headless.runMatch=beforeRun;
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',originalStore);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,
      originalAi.value);
  }
}
module.exports={VERSION,TARGET_ATTACK,SOURCE_BASIC,
  OWNER_BENCH_PROMPT,chooseCallFamilyBasic,
  withLateOwnedCallFamilyPrompt};
