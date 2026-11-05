'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {actorObservation}=
  require('../twinleaf/actor-observation-contract.cjs');

const VERSION='agent3-rank11-letter-owner-search-source-aba-v1';
const ROOT=path.resolve(__dirname,'../..');
const OUTPUT=path.join(ROOT,'vendor/twinleaf/ptcg-server/output');
const REGISTRATION=path.join(ROOT,'results/aichi-2026/registrations',
  'agent35-rank11-letter-source-pass37-fork-20261105.json');
const ENERGY='Darkness Energy MEE';

/**
 * Only the actual prompted owner may inspect this card selection.
 * Native options and validator are the final action-permission boundary.
 * @param {object} prompt Live pending ChooseCardsPrompt.
 * @param {object} owner Owner of the real deck/hand.
 * @param {object} types Pinned native enum values.
 * @param {object} state Live native State.
 * @returns {object[]|null} Two physical source Energy objects or null.
 */
function chooseTwoDarknessFromOwnerPrompt(prompt,owner,types,state){
  if(prompt?.constructor?.name!=='ChooseCardsPrompt'||
     prompt.playerId!==owner?.id||
     prompt.message!=='CHOOSE_CARD_TO_HAND'||
     prompt.cards!==owner.deck||
     prompt.options?.min!==0||
     prompt.options?.max!==2||
     prompt.options?.allowCancel!==false||
     !Array.isArray(prompt.cards.cards))
    return null;
  const matches=prompt.cards.cards.filter(card=>
    card.fullName===ENERGY&&
    card.superType===types.SuperType.ENERGY&&
    card.energyType===types.EnergyType.BASIC);
  if(matches.length<2)return null;
  const selected=matches.slice(0,2);
  return prompt.validate(selected,state)===true?selected:null;
}

/**
 * Compose outside the already frozen Agent35 single-Item fork; intercept
 * *only* the live source-owner search that the added Item actually created.
 * Preserve every other decision and all native Store card rules.
 *
 * @template T
 * @param {()=>T} next Executes Agent35's full original-eight fork.
 * @param {object} deps Pinned runtime, exact registration, and native classes.
 * @returns {{result:T,audit:object}}
 */
function withSourceLetterOwnerSearch(next,deps){
  assert.equal(typeof next,'function');
  const {headless,Store,SimpleTacticsAi,ResolvePromptAction,
    types,registration}=deps;
  assert.equal(typeof headless?.runMatch,'function');
  const ai=SimpleTacticsAi.prototype,store=Store.prototype;
  const priorAi=Object.getOwnPropertyDescriptor(ai,'decodeNextAction');
  const priorStore=Object.getOwnPropertyDescriptor(store,'dispatch');
  assert.equal(typeof priorAi?.value,'function');
  assert.equal(typeof priorStore?.value,'function');
  const priorRunMatch=headless.runMatch;
  const observe=deps.observe??actorObservation;
  const proposals=new WeakMap();
  let target=false,liveStore=null,awaiting=null;
  const audit={
    schema:VERSION,sourceId:registration.selectedOriginalId,
    activeRegisteredMatches:0,realTargetStores:0,
    printedLetterNativeDispatches:0,matchedLiveOwnerSearchPrompts:0,
    proposedOwnerSearchAnswers:0,nativeResolvedAnswers:0,
    nativeRejectedAnswers:0,exactOriginalEnergyObjectsToOwnerHand:0,
    ownerSearchAnswersUnsettled:0,noPromptAfterLetter:0,
    nonMatchingPromptShapes:0,postAnswerPendingMessages:[],
    sourceOpportunityCensored:false,
    opponentHiddenZoneInspected:false,zeroQualifiedGames:true
  };

  function observedRunMatch(request){
    const matching=typeof request?.label==='string'&&
      request.label.endsWith(registration.selectedOriginalId);
    if(!matching)return priorRunMatch(request);
    assert.equal(target,false,'Nested target game is unsupported');
    target=true;
    liveStore=null;
    awaiting=null;
    audit.activeRegisteredMatches++;
    try{return priorRunMatch(request);}
    finally{target=false;liveStore=null;awaiting=null;}
  }

  function observedDecode(state,...args){
    const owner=state?.players?.[registration.originalSourceSeat];
    const pending=state?.prompts?.find(p=>p.result===undefined);
    if(!target||state!==liveStore?.state||
       owner?.id!==this.client?.id||
       !awaiting||pending?.id!==awaiting.promptId)
      return priorAi.value.call(this,state,...args);
    const view=observe(state,registration.originalSourceSeat);
    assert.equal(view.decisionKind,'owner-prompt');
    assert.equal(view.pendingOwnerDeckSearch,true);
    const selected=chooseTwoDarknessFromOwnerPrompt(
      pending,owner,types,state);
    if(!selected)return priorAi.value.call(this,state,...args);
    const answer=new ResolvePromptAction(pending.id,selected);
    proposals.set(answer,{
      promptId:pending.id,physicalCards:selected,
      ownerId:owner.id,pendingPrompt:pending
    });
    audit.proposedOwnerSearchAnswers++;
    return answer;
  }

  function observedDispatch(action,...args){
    if(target&&action?.constructor?.name==='AddPlayerAction'&&
       liveStore===null){
      liveStore=this;
      audit.realTargetStores++;
    }
    if(!target||this!==liveStore)
      return priorStore.value.call(this,action,...args);
    const state=this.state;
    const owner=state.players?.[registration.originalSourceSeat];
    const proposal=proposals.get(action);
    const sourceLetter=owner&&
      action?.constructor?.name==='PlayCardAction'&&
      action.id===owner.id&&
      state.activePlayer===registration.originalSourceSeat&&
      state.turn===registration.sourceTurn&&
      owner.hand.cards[action.handIndex]?.fullName===
        registration.sourceCardToPlay;
    let before=null;
    if(proposal){
      before={ownerDeckCards:owner.deck.cards.slice(),
        ownerHandCards:owner.hand.cards.slice()};
    }
    let returned;
    try{returned=priorStore.value.call(this,action,...args);}
    catch(error){
      if(proposal)audit.nativeRejectedAnswers++;
      throw error;
    }
    if(sourceLetter){
      audit.printedLetterNativeDispatches++;
      const next=this.state.prompts?.find(p=>p.result===undefined);
      if(next?.playerId===owner.id&&
         next?.constructor?.name==='ChooseCardsPrompt'&&
         next?.cards===owner.deck){
        awaiting={promptId:next.id,ownerId:owner.id};
        audit.matchedLiveOwnerSearchPrompts++;
      }else{
        audit.noPromptAfterLetter++;
        if(next)audit.nonMatchingPromptShapes++;
      }
    }
    if(proposal){
      const after=this.state.players[registration.originalSourceSeat];
      const settled=this.state.prompts?.some(p=>
        p.id===proposal.promptId&&p.result===action.result);
      const physical=proposal.physicalCards.every(card=>
        before.ownerDeckCards.includes(card)&&
        !before.ownerHandCards.includes(card)&&
        after.hand.cards.includes(card)&&
        !after.deck.cards.includes(card));
      if(settled&&physical){
        audit.nativeResolvedAnswers++;
        audit.exactOriginalEnergyObjectsToOwnerHand+=
          proposal.physicalCards.length;
      }else audit.ownerSearchAnswersUnsettled++;
      awaiting=null;
      const next=this.state.prompts?.filter(p=>p.result===undefined)??[];
      audit.postAnswerPendingMessages.push(
        next.map(p=>p.message??'unknown').slice(0,4));
    }
    return returned;
  }

  headless.runMatch=observedRunMatch;
  Object.defineProperty(ai,'decodeNextAction',{
    ...priorAi,value:observedDecode});
  Object.defineProperty(store,'dispatch',{
    ...priorStore,value:observedDispatch});
  try{
    return {result:next(),audit};
  }finally{
    assert.strictEqual(ai.decodeNextAction,observedDecode);
    assert.strictEqual(store.dispatch,observedDispatch);
    Object.defineProperty(store,'dispatch',priorStore);
    Object.defineProperty(ai,'decodeNextAction',priorAi);
    headless.runMatch=priorRunMatch;
  }
}

/**
 * Same frozen one-Item intervention with the native owner-energy prompt
 * answer enabled. Full original eight and pre-Item root prefix remain fixed.
 * @param {object} [deps] Synthetic test dependency overrides.
 * @returns {object} Entire source failure-inclusive diagnostic panel.
 */
function run(deps={}){
  const registration=deps.registration??require(REGISTRATION);
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const native=relative=>require(path.join(OUTPUT,relative));
  const Store=deps.Store??native('game/store/store').Store;
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const ResolvePromptAction=deps.ResolvePromptAction??
    native('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const types=deps.types??native('game/store/card/card-types');
  const observed=(deps.wrap??withSourceLetterOwnerSearch)(
    ()=> (deps.letterRunner??
      require('./agent35-rank11-source-letter-pass37-fork.cjs').run)(),
    {headless,Store,SimpleTacticsAi,ResolvePromptAction,
      types,registration});
  const result=observed.result,audit=observed.audit;
  assert.equal(result.registrationId,registration.selectedOriginalId);
  assert.equal(result.attemptedNativeOriginalRows,8);
  assert.equal(result.sourceDealMatched,true);
  assert.equal(result.entirePhysicalDealMatched,true);
  assert.equal(result.originalPreForkSourceRootTapeMatched,true);
  assert.equal(result.sourceOwnerPass37Reached,true);
  assert.equal(result.sourceOwnerCardAcceptedByNativeStore,true);
  return {
    schema:VERSION,originalFrozenSourceId:registration.selectedOriginalId,
    sourceDealMatched:result.sourceDealMatched,
    entirePhysicalDealMatched:result.entirePhysicalDealMatched,
    originalPreForkRootTapeMatched:result.originalPreForkSourceRootTapeMatched,
    selectedSourceItemStoreAccepted:
      result.sourceOwnerCardAcceptedByNativeStore,
    actualNativeSourceStatus:result.originalSourceRowDisposition,
    nativeSourceStoreRootAtSelection:result.nativeRootAtSelectedOrdinal,
    postLetterNativeSourcePromptRoots:result.sourceFollowthroughPrompts,
    postLetterNativeOwnerEnergyPlayRoots:
      result.sameTurnRealOwnerDarknessEnergyPlayRoots,
    actualNativeOriginalAttemptStatuses:result.allNativeArmDispositions,
    sourceNativeError:result.originalSourceArchivedNativeError,
    ownerLetterSearchAudit:audit,
    pinnedVendor:result.observedPinnedTwinleaf,
    paperGameQualified:false,competitivelyQualifiedGames:0,
    demonstratedGameWinRate:null
  };
}

/**
 * Exclusive lock and atomic replacement for the actual full eight-arm result.
 * @param {string} filename Absolute receipt file.
 * @param {object} value Completed record.
 * @returns {{bytes:number,sha256:string}}
 */
function write(filename,value){
  assert.equal(value.schema,VERSION);
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const lock=filename+'.lock';
  const fd=fs.openSync(lock,'wx');
  const tmp=filename+'.'+process.pid+'.tmp';
  try{
    const buffer=Buffer.from(JSON.stringify(value,null,2)+'\n');
    fs.writeFileSync(tmp,buffer,{flag:'wx'});
    fs.renameSync(tmp,filename);
    return {bytes:buffer.length,sha256:createHash('sha256')
      .update(buffer).digest('hex')};
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

if(require.main===module){
  const output=process.env.AGENT3_RANK11_LETTER_SEARCH_RECEIPT;
  assert.ok(output,'A receipt path is required');
  const result=run();
  const archived=write(output,result);
  const audit=result.ownerLetterSearchAudit;
  process.stdout.write('AGENT3_RANK11_LETTER_SEARCH_NATIVE '+
    JSON.stringify({
      frozenDeal:true,sourceItemAccepted:result.selectedSourceItemStoreAccepted,
      targetStores:audit.realTargetStores,
      observedSearchPrompts:audit.matchedLiveOwnerSearchPrompts,
      proposed:audit.proposedOwnerSearchAnswers,
      nativeSettled:audit.nativeResolvedAnswers,
      physicallySettled:audit.exactOriginalEnergyObjectsToOwnerHand,
      unresolved:audit.ownerSearchAnswersUnsettled,
      otherPrompts:audit.postAnswerPendingMessages,
      sourceStatus:result.actualNativeSourceStatus,
      sourceFollowthroughRoots:result.postLetterNativeSourcePromptRoots.length,
      sourceEnergyRoots:result.postLetterNativeOwnerEnergyPlayRoots.length,
      nativeOriginalEightStatuses:result.actualNativeOriginalAttemptStatuses,
      archive:archived,qualifiedGames:0})+'\n');
}

module.exports={VERSION,ENERGY,chooseTwoDarknessFromOwnerPrompt,
  withSourceLetterOwnerSearch,run,write};
