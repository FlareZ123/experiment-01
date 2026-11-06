'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');
const {withOwnerSetupConfirm}=
  require('../simulation/twinleaf/agent4-owner-setup-confirm.cjs');
const {withGoFirstChoice}=
  require('../simulation/twinleaf/agent6-go-first-choice.cjs');
const {withOwnerPublicAcknowledgements}=
  require('../simulation/twinleaf/agent50-owner-public-acknowledgements.cjs');
const {withOwnerEntryPriorityOpening}=
  require('../simulation/twinleaf/agent50-owner-entry-priority-single-basic.cjs');
const {withOwnerOpeningStoreReceipt}=
  require('../simulation/twinleaf/agent50-owner-opening-store-receipt.cjs');
const SYMMETRY_VERSION='agent50-identical-rank4-mulligan-seat-symmetry-v1';
const {withActorOnlySelectPrompt,chooseActorSelectPrompt}=
  require('../simulation/twinleaf/agent8-actor-only-select-prompt.cjs');
const {withNativeRawStateFallbackQuarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {withPerSeatSetupShuffleStreams}=
  require('../simulation/evaluation/agent26-per-seat-setup-shuffle-streams.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const REGISTRATION=
  'results/methodology/registrations/agent50-identical-rank4-mulligan-seat-symmetry-legacy-vs-perseat-20261106.md';
const plan=planAichi(1,{
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
assert.equal(plan.engineRevision,PIN);
const source=plan.opponents.find(x=>x.rank===4);
const reference=source;
assert.equal(source?.status,'ready');
assert.equal(reference?.status,'ready');

const frozenTrials=[
  {seat:0,seed:10568873,sourceFirst:true},
  {seat:1,seed:311814060,sourceFirst:true},
  {seat:0,seed:3883014030,sourceFirst:true},
  {seat:1,seed:992294796,sourceFirst:true},
  {seat:0,seed:2839806748,sourceFirst:true},
  {seat:1,seed:2793523139,sourceFirst:true},
  {seat:0,seed:3875805004,sourceFirst:true},
  {seat:1,seed:2195533019,sourceFirst:true},
  {seat:0,seed:1619097818,sourceFirst:true},
  {seat:1,seed:2488703897,sourceFirst:true},
  {seat:0,seed:3019620503,sourceFirst:true},
  {seat:1,seed:272828160,sourceFirst:true},
  {seat:0,seed:4048326432,sourceFirst:true},
  {seat:1,seed:1627583495,sourceFirst:true},
  {seat:0,seed:1491347570,sourceFirst:true},
  {seat:1,seed:3465278394,sourceFirst:true},
  {seat:0,seed:627532861,sourceFirst:true},
  {seat:1,seed:3572311945,sourceFirst:true},
  {seat:0,seed:1036880526,sourceFirst:true},
  {seat:1,seed:10694126,sourceFirst:true},
  {seat:0,seed:3285964837,sourceFirst:true},
  {seat:1,seed:1870022336,sourceFirst:true},
  {seat:0,seed:2876260826,sourceFirst:true},
  {seat:1,seed:2515780647,sourceFirst:true},
  {seat:0,seed:1805704226,sourceFirst:true},
  {seat:1,seed:1399047795,sourceFirst:true},
  {seat:0,seed:2974100535,sourceFirst:true},
  {seat:1,seed:4232148167,sourceFirst:true},
  {seat:0,seed:835035900,sourceFirst:true},
  {seat:1,seed:266542697,sourceFirst:true},
  {seat:0,seed:4044292275,sourceFirst:true},
  {seat:1,seed:2933424690,sourceFirst:true}
];

assert.equal(frozenTrials.length,32);
assert.equal(new Set(frozenTrials.map(x=>x.seed)).size,32);
assert.equal(frozenTrials.filter(x=>x.seat===0).length,16);
assert.equal(frozenTrials.filter(x=>x.seat===1).length,16);

/**
 * Observe only the actual prompt owner's own physical deck/hand movement.
 * This wrapper changes no action and preserves every original native dispatch.
 * @template T
 * @param {()=>T} run
 * @param {object} shared
 * @param {object[]} selectReceipts
 * @param {object[]} goFirstReceipts
 * @returns {T}
 */
function withSetupPromptPhysicalReceipt(run,shared,selectReceipts,goFirstReceipts,mulliganReceipts,sourceSeat){
  const {Store}=require('../vendor/twinleaf/ptcg-server/output/game/store/store');
  const {CardList}=require('../vendor/twinleaf/ptcg-server/output/game/store/state/card-list');
  const originalDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const originalMoveTo=Object.getOwnPropertyDescriptor(CardList.prototype,'moveTo');
  assert.equal(typeof originalDispatch?.value,'function');
  assert.equal(originalDispatch.configurable,true);
  assert.equal(typeof originalMoveTo?.value,'function');
  assert.equal(originalMoveTo.configurable,true);
  let activeCompensationMove=null;
  function moveTo(destination,count){
    const active=activeCompensationMove;
    if(active&&this===active.owner.deck&&destination===active.owner.hand){
      const beforeDeck=this.cards.slice();
      const beforeHand=destination.cards.slice();
      const result=originalMoveTo.value.apply(this,[destination,count]);
      const moved=destination.cards.filter(card=>!beforeHand.includes(card));
      const removed=beforeDeck.filter(card=>!this.cards.includes(card));
      const identityMatch=moved.length===removed.length&&
        moved.every(card=>removed.includes(card))&&
        removed.every(card=>moved.includes(card));
      active.moves.push({
        requestedCount:count??beforeDeck.length,
        movedCount:moved.length,
        deckBefore:beforeDeck.length,deckAfter:this.cards.length,
        handBefore:beforeHand.length,handAfter:destination.cards.length,
        identityMatch,
        movedPrintings:moved.map(card=>card.fullName)
      });
      return result;
    }
    return originalMoveTo.value.apply(this,[destination,count]);
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!shared.store)
      shared.store=this;
    const state=this.state;
    const pending=state?.prompts?.find(p=>p.result===undefined)??null;
    const isResolve=action?.constructor?.name==='ResolvePromptAction'&&
      pending&&action.id===pending.id;
    const seat=isResolve?
      state.players.findIndex(player=>player.id===pending.playerId):-1;
    const owner=seat===0||seat===1?state.players[seat]:null;
    const isSelect=isResolve&&pending.constructor?.name==='SelectPrompt'&&owner;
    const isGoFirst=isResolve&&pending.constructor?.name==='ConfirmPrompt'&&
      pending.message==='GO_FIRST'&&owner;
    const isMulligan=isResolve&&
      pending.constructor?.name==='ShowMulliganPrompt'&&owner;
    const isCompensation=isSelect&&pending.message==='WANT_TO_DRAW_CARDS';
    const values=isSelect?[...pending.values]:null;
    const defaultValue=isSelect?(pending.options?.defaultValue??0):null;
    const selectedOptionIndex=isSelect?action.result:null;
    const selectedLabel=isSelect&&Number.isInteger(action.result)?
      values[action.result]??null:null;
    const handBefore=isSelect?[...owner.hand.cards]:null;
    const deckBefore=isSelect?[...owner.deck.cards]:null;
    const moveAudit=isCompensation?{owner,moves:[]}:null;
    const goFirstRecord=isGoFirst?{
      seat,sourceSeat,chooseFirst:action.result,turn:state.turn,phase:state.phase
    }:null;
    const mulliganRecord=isMulligan?{
      actorSeat:seat,message:pending.message,
      mulliganSeat:pending.message==='SETUP_PLAYER_NO_BASIC'?seat:
        pending.message==='SETUP_OPPONENT_NO_BASIC'?1-seat:null,
      mulliganHandsCount:Array.isArray(pending.hands)?pending.hands.length:null,
      turn:state.turn,phase:state.phase
    }:null;
    let result;
    if(moveAudit)activeCompensationMove=moveAudit;
    try{
      result=originalDispatch.value.apply(this,[action,...args]);
    }catch(error){
      if(isSelect)selectReceipts.push({
        seat,message:pending.message,values,defaultValue,
        selectedOptionIndex,selectedLabel,
        moveCalls:moveAudit?.moves??[],
        nativeAccepted:false,
        errorCode:error?.code??null,errorMessage:String(error?.message??error)
      });
      if(goFirstRecord)goFirstReceipts.push({
        ...goFirstRecord,nativeAccepted:false
      });
      if(mulliganRecord)mulliganReceipts.push({
        ...mulliganRecord,nativeAccepted:false
      });
      throw error;
    }finally{
      if(moveAudit)activeCompensationMove=null;
    }
    if(isSelect){
      const after=this.state.players[seat];
      const added=after.hand.cards.filter(card=>!handBefore.includes(card));
      const removed=deckBefore.filter(card=>!after.deck.cards.includes(card));
      const match=typeof selectedLabel==='string'?
        /^Draw (\d+) card/.exec(selectedLabel):null;
      const expectedDrawCount=match?Number(match[1]):null;
      const identityMatch=added.length===removed.length&&
        added.every(card=>removed.includes(card))&&
        removed.every(card=>added.includes(card));
      const firstMove=moveAudit?.moves?.[0]??null;
      const physicalTransferVerified=expectedDrawCount!==null&&
        firstMove?.requestedCount===expectedDrawCount&&
        firstMove?.movedCount===expectedDrawCount&&
        firstMove?.identityMatch===true;
      const stillPending=after.prompts?.some(p=>
        p.id===pending.id&&p.result===undefined)??false;
      selectReceipts.push({
        seat,message:pending.message,values,defaultValue,
        selectedOptionIndex,selectedLabel,expectedDrawCount,
        handBefore:handBefore.length,handAfter:after.hand.cards.length,
        deckBefore:deckBefore.length,deckAfter:after.deck.cards.length,
        totalHandDelta:after.hand.cards.length-handBefore.length,
        totalDeckDelta:deckBefore.length-after.deck.cards.length,
        addedPrintings:added.map(card=>card.fullName),
        removedPrintings:removed.map(card=>card.fullName),
        nativePromptResolved:!stillPending,
        physicalIdentityMatch:identityMatch,
        physicalTransferVerified,
        compensationMove:firstMove,
        postPromptDeckToHandMoves:moveAudit?.moves?.slice(1)??[]
      });
    }
    if(goFirstRecord){
      const afterPrompt=this.state.prompts?.find(p=>p.id===pending.id);
      goFirstReceipts.push({
        ...goFirstRecord,
        nativeAccepted:pending.result===action.result||
          afterPrompt===undefined||afterPrompt.result===action.result
      });
    }
    if(mulliganRecord){
      const afterPrompt=this.state.prompts?.find(p=>p.id===pending.id);
      mulliganReceipts.push({
        ...mulliganRecord,
        nativeAccepted:pending.result===action.result||
          afterPrompt===undefined||afterPrompt.result===action.result
      });
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...originalDispatch,value:dispatch
  });
  Object.defineProperty(CardList.prototype,'moveTo',{
    ...originalMoveTo,value:moveTo
  });
  try{return run();}
  catch(error){
    if(error&&typeof error==='object'){
      error.agent50SetupPromptPhysicalReceipt={
        selectReceipts:[...selectReceipts],
        goFirstReceipts:[...goFirstReceipts],
        mulliganReceipts:[...mulliganReceipts],
        liveStoreObserved:Boolean(shared.store),
        aborted:true
      };
    }
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    assert.strictEqual(CardList.prototype.moveTo,moveTo);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
    Object.defineProperty(CardList.prototype,'moveTo',originalMoveTo);
  }
}

/**
 * Capture the acting source's own hand/board at its first live turn root.
 * This is an observer only; the original Dedechange hook makes the decision.
 * @template T
 * @param {()=>T} run
 * @param {{sourceSeat:0|1,shared:object,events:object[]}} config
 * @returns {T}
 */
function withOwnerFirstTurnHandReceipt(run,config){
  const {SimpleTacticsAi}=require('../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai');
  const {GamePhase}=require('../vendor/twinleaf/ptcg-server/output/game/store/state/state');
  const original=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof original?.value,'function');
  let captured=false;
  function decode(state){
    if(!captured&&state===config.shared.store?.state&&
        state.phase===GamePhase.PLAYER_TURN&&state.turn>=1){
      const seat=state.players.findIndex(player=>
        player.id===this.client?.id);
      if(seat===config.sourceSeat&&state.activePlayer===seat&&
          !state.prompts.some(prompt=>prompt.result===undefined)){
        const owner=state.players[seat];
        const hand=owner.hand.cards.map(card=>card.fullName);
        config.events.push({
          seat,turn:state.turn,phase:state.phase,
          hand,handCount:hand.length,
          active:owner.active.cards.map(card=>card.fullName),
          bench:owner.bench.map(slot=>slot.cards.map(card=>card.fullName)),
          emptyBenchSlots:owner.bench.filter(slot=>slot.cards.length===0).length,
          heldDedenneCount:owner.hand.cards.filter(card=>
            card.fullName==='Dedenne GX UNB').length
        });
        captured=true;
      }
    }
    return original.value.call(this,state);
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...original,value:decode
  });
  try{return run();}
  catch(error){
    if(error&&typeof error==='object')
      error.agent50FirstTurnHandReceipt={
        events:config.events.map(x=>({...x,hand:[...x.hand],
          active:[...x.active],bench:x.bench.map(slot=>[...slot])})),
        aborted:true
      };
    throw error;
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);
  }
}

/**
 * Apply the existing actor-only default SelectPrompt choice and record only
 * owner-visible offered labels, option index and default.
 * @template T
 * @param {()=>T} run
 * @param {object[]} intents
 * @returns {T}
 */
function withActorSelectReceipt(run,intents){
  return withActorOnlySelectPrompt(run,{
    choose(input){
      const answer=chooseActorSelectPrompt(input);
      intents.push({
        actorSeat:input.actor.actorSeat,
        globalTurn:input.actor.globalTurn,
        phase:input.actor.phase,
        message:input.prompt.message,
        offeredValues:[...input.prompt.values],
        defaultValue:input.prompt.defaultValue,
        chosenOptionIndex:answer.optionIndex,
        chosenLabel:Number.isInteger(answer.optionIndex)?
          input.prompt.values[answer.optionIndex]??null:null
      });
      return answer;
    }
  });
}

/** @param {{seat:number,seed:number,sourceFirst:boolean}} trial */
function attempt(trial,protocol){
  const shared={store:null};
  const actorSelectIntents=[];
  const selectReceipts=[];
  const goFirstReceipts=[];
  const mulliganReceipts=[];
  const {Store}=require('../vendor/twinleaf/ptcg-server/output/game/store/store');
  let thrown=null,returned=false,inner=null,perSeat=null;
  const work=()=>{
    try{
      inner=withNativeRawStateFallbackQuarantine(()=>withOwnerSetupConfirm(()=>
        withSetupPromptPhysicalReceipt(()=>withActorSelectReceipt(()=>
          withGoFirstChoice(
            trial.seat===0?[true,false]:[false,true],
            ()=>withOwnerPublicAcknowledgements(()=>
              withOwnerEntryPriorityOpening(()=>
                withOwnerOpeningStoreReceipt(()=>runMatch({
                  deckA:source.cards.map(card=>({...card})),
                  deckB:source.cards.map(card=>({...card})),
                  seed:trial.seed,maxActions:80,
                  captureNativeAbortEvidence:true
                }),{sourceSeat:trial.seat})
              )
            )
          ),actorSelectIntents),shared,selectReceipts,goFirstReceipts,
          mulliganReceipts,trial.seat)
      ,{maxRecords:8}));
      returned=true;
      return {inner};
    }catch(error){
      thrown=error;
      return {stopped:true};
    }
  };
  if(protocol==='per-seat'){
    try{
      perSeat=withPerSeatSetupShuffleStreams(Store,trial.seed,work);
    }catch(error){
      thrown=error;
    }
  }else{
    work();
  }

  const setupConfirmLayer=returned?inner?.result:null;
  const actorSelectLayer=setupConfirmLayer?.result??null;
  const goFirstLayer=actorSelectLayer?.result??null;
  const publicAckLayer=goFirstLayer?.result??null;
  const entryLayer=publicAckLayer?.result??null;
  const openingLayer=entryLayer?.result??null;
  const matchResult=openingLayer?.result??null;
  const quarantine=thrown?.nativeRawStateFallbackQuarantine??
    inner?.audit??null;
  const promptReceipt=thrown?.agent50SetupPromptPhysicalReceipt??{
    selectReceipts,goFirstReceipts,mulliganReceipts,
    liveStoreObserved:Boolean(shared.store)
  };
  const setup=thrown?.ownerOpeningStoreReceiptAudit??
    openingLayer?.audit??null;
  const entry=thrown?.ownerEntryPriorityAudit??entryLayer?.audit??null;
  const setupConfirm=thrown?.ownerSetupConfirmAudit??
    setupConfirmLayer?.audit??null;
  const mulliganCountsBySeat={0:0,1:0};
  for(const receipt of promptReceipt.mulliganReceipts??mulliganReceipts){
    if(receipt.mulliganSeat===0||receipt.mulliganSeat===1)
      mulliganCountsBySeat[receipt.mulliganSeat]=Math.max(
        mulliganCountsBySeat[receipt.mulliganSeat],
        receipt.mulliganHandsCount??0);
  }
  const compensation=(promptReceipt.selectReceipts??selectReceipts)
    .filter(x=>x.message==='WANT_TO_DRAW_CARDS');
  const expectedRecipientSeat=mulliganCountsBySeat[0]===mulliganCountsBySeat[1]?
    null:(mulliganCountsBySeat[0]<mulliganCountsBySeat[1]?0:1);
  const expectedCompensationDrawCount=Math.abs(
    mulliganCountsBySeat[0]-mulliganCountsBySeat[1]);
  const actualRecipientSeat=compensation.length===1?compensation[0].seat:null;
  const compensationVerified=expectedRecipientSeat===null?
    compensation.length===0:
    compensation.length===1&&
    compensation[0].seat===expectedRecipientSeat&&
    compensation[0].expectedDrawCount===expectedCompensationDrawCount&&
    compensation[0].physicalTransferVerified===true;
  const shuffleTape=perSeat?.shuffleTape??[];
  const shuffleCountsBySeat={
    0:shuffleTape.filter(x=>x.seat===0).length,
    1:shuffleTape.filter(x=>x.seat===1).length
  };
  const root=quarantine?.records?.[0]??null;
  const sourceTurnReached=Boolean(root&&root.turn===1);
  return {
    schema:SYMMETRY_VERSION,
    registration:REGISTRATION,
    protocol,
    seed:trial.seed,
    sourceSeat:trial.seat,
    sourceFirst:true,
    sourceCoinChoice:trial.seat===0?[true,false]:[false,true],
    deckRank:4,
    identicalDecks:true,
    pinnedEngine:PIN,
    shuffleTape,shuffleCountsBySeat,
    deckSha256:createHash('sha256')
      .update(JSON.stringify(source.cards)).digest('hex'),
    finishedWithoutError:returned,
    error:thrown?{
      code:thrown.code??null,name:thrown.name??null,
      message:String(thrown.message??thrown).slice(0,400)
    }:null,
    sourceTurnReached,
    setupNativeStore:setup?.events??null,
    ownerEntryPriorityAudit:entry,
    ownerSetupConfirmAudit:setupConfirm,
    actorSelectAudit:actorSelectLayer?.audit??null,
    goFirstAudit:goFirstLayer?.audit??null,
    publicAcknowledgementsAudit:publicAckLayer?.audit??null,
    actorSelectIntents,
    mulliganReceipts:promptReceipt.mulliganReceipts??mulliganReceipts,
    mulliganCountsBySeat,
    expectedCompensationRecipientSeat:expectedRecipientSeat,
    actualCompensationRecipientSeat:actualRecipientSeat,
    expectedCompensationDrawCount,
    actualCompensationDrawCount:compensation.length===1?
      compensation[0].expectedDrawCount:null,
    compensationVerified,
    selectReceipts:promptReceipt.selectReceipts??selectReceipts,
    goFirstReceipts:promptReceipt.goFirstReceipts??goFirstReceipts,
    ownerFallback:quarantine?{
      rawStateCalls:quarantine.rawStateFallbackCalls,
      originalNativeDecoderExecuted:quarantine.originalNativeDecoderExecuted,
      records:quarantine.records
    }:null,
    competitiveGamesQualified:0,
    noCompleteGameClaim:true
  };
}

/** @param {object} row */
function save(row){
  const dir=process.env.AGENT50_MULLIGAN_SYMMETRY_OUTPUT;
  if(!dir)return;
  fs.mkdirSync(dir,{recursive:true});
  const name='identical-rank4-seat-symmetry-'+row.protocol+
    '-seat'+row.sourceSeat+'-seed'+row.seed+'.json';
  const file=path.resolve(dir,name);
  const body=JSON.stringify(row,null,2)+'\n';
  writeAtomicLocked(file,body);
  const sha=createHash('sha256').update(body).digest('hex');
  writeAtomicLocked(file+'.sha256',sha+'  '+name+'\n');
}


test('32 identical-rank4 seed pairs under legacy and per-seat setup shuffle protocols',()=>{
  const rows=[];
  for(const trial of frozenTrials){
    for(const protocol of ['legacy-shared','per-seat']){
      const row=attempt(trial,protocol);
      save(row);
      rows.push(row);
    }
  }
  const summarize=protocol=>{
    const subset=rows.filter(row=>row.protocol===protocol);
    const pairs={};
    const totals={0:0,1:0};
    const recipientBySeat={0:0,1:0};
    let unequal=0,compensationPrompts=0,compensationCards=0;
    for(const row of subset){
      const key=row.mulliganCountsBySeat[0]+'/'+row.mulliganCountsBySeat[1];
      pairs[key]=(pairs[key]??0)+1;
      totals[0]+=row.mulliganCountsBySeat[0];
      totals[1]+=row.mulliganCountsBySeat[1];
      if(row.mulliganCountsBySeat[0]!==row.mulliganCountsBySeat[1])unequal++;
      if(row.actualCompensationRecipientSeat===0||
         row.actualCompensationRecipientSeat===1){
        recipientBySeat[row.actualCompensationRecipientSeat]++;
        compensationPrompts++;
        compensationCards+=row.actualCompensationDrawCount??0;
      }
    }
    return {
      attempts:subset.length,
      sourceSeatCounts:{0:subset.filter(x=>x.sourceSeat===0).length,
        1:subset.filter(x=>x.sourceSeat===1).length},
      mulliganPairs:pairs,totalMulligansBySeat:totals,
      unequalMulliganAttempts:unequal,
      compensationPrompts,compensationCards,recipientBySeat,
      compensationVerified:subset.filter(x=>x.compensationVerified).length,
      shuffleEventsBySeat:{
        0:subset.reduce((n,x)=>n+(x.shuffleCountsBySeat?.[0]??0),0),
        1:subset.reduce((n,x)=>n+(x.shuffleCountsBySeat?.[1]??0),0)
      }
    };
  };
  const summary={
    schema:SYMMETRY_VERSION,registration:REGISTRATION,
    totalAttempts:rows.length,uniqueSeeds:new Set(rows.map(x=>x.seed)).size,
    legacyShared:summarize('legacy-shared'),
    perSeat:summarize('per-seat'),
    allRows:rows.map(row=>({
      protocol:row.protocol,seat:row.sourceSeat,seed:row.seed,
      mulligans:row.mulliganCountsBySeat,
      recipient:row.actualCompensationRecipientSeat,
      draw:row.actualCompensationDrawCount,
      verified:row.compensationVerified,
      shuffleCounts:row.shuffleCountsBySeat,
      sourceTurnReached:row.sourceTurnReached,
      error:row.error?.code??null
    }))
  };
  console.log('AGENT50_IDENTICAL_RANK4_MULLIGAN_SEAT_SYMMETRY',JSON.stringify(summary));
  assert.equal(rows.length,64);
  assert.equal(new Set(rows.map(row=>row.seed)).size,32);
  for(const protocol of ['legacy-shared','per-seat']){
    const subset=rows.filter(row=>row.protocol===protocol);
    assert.equal(subset.length,32);
    assert.equal(subset.filter(row=>row.sourceSeat===0).length,16);
    assert.equal(subset.filter(row=>row.sourceSeat===1).length,16);
    assert.ok(subset.every(row=>row.sourceTurnReached),
      protocol+' must reach the source first root for all32 seeds');
    assert.ok(subset.every(row=>row.ownerFallback?.originalNativeDecoderExecuted===false),
      protocol+' must keep the raw-State native decoder quarantined');
    assert.ok(subset.every(row=>row.mulliganReceipts.every(x=>x.nativeAccepted===true)),
      protocol+' must accept all public mulligan acknowledgements');
    assert.ok(subset.every(row=>row.compensationVerified),
      protocol+' compensation recipient/draw must match observed mulligan counts');
    assert.ok(subset.flatMap(row=>row.selectReceipts??[])
      .filter(x=>x.message==='WANT_TO_DRAW_CARDS')
      .every(x=>x.physicalTransferVerified===true),
      protocol+' physical compensation moves must be verified');
    assert.ok(subset.flatMap(row=>row.goFirstReceipts??[])
      .every(x=>x.chooseFirst===(x.seat===x.sourceSeat)),
      protocol+' must select the designated first seat');
  }
  assert.ok(rows.filter(row=>row.protocol==='per-seat')
    .every(row=>row.shuffleCountsBySeat[0]>0&&row.shuffleCountsBySeat[1]>0),
    'Per-seat protocol must shuffle both seats independently');
});
