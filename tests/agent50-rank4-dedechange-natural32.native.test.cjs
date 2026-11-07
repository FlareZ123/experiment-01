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
const {VERSION:DEDECHANGE_VERSION,withOwnerFirstTurnDedechange}=
  require('../simulation/twinleaf/agent50-owner-firstturn-dedechange.cjs');
const {withActorOnlySelectPrompt,chooseActorSelectPrompt}=
  require('../simulation/twinleaf/agent8-actor-only-select-prompt.cjs');
const {withNativeRawStateFallbackQuarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const REGISTRATION=
  'results/methodology/registrations/agent50-rank4-dedechange-natural32-sourcefirst-20261106.md';
const plan=planAichi(1,{
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
assert.equal(plan.engineRevision,PIN);
const source=plan.opponents.find(x=>x.rank===4);
const reference=plan.opponents.find(x=>x.rank===1);
assert.equal(source?.status,'ready');
assert.equal(reference?.status,'ready');

const frozenTrials=[
  {seat:0,seed:659596847},{seat:1,seed:3374395305},
  {seat:0,seed:3767656280},{seat:1,seed:1334448369},
  {seat:0,seed:1015114065},{seat:1,seed:2721212630},
  {seat:0,seed:3093975646},{seat:1,seed:3866265543},
  {seat:0,seed:3156942071},{seat:1,seed:2011905764},
  {seat:0,seed:1103482661},{seat:1,seed:795422078},
  {seat:0,seed:1285175489},{seat:1,seed:3644145136},
  {seat:0,seed:166706843},{seat:1,seed:3879134323},
  {seat:0,seed:633372073},{seat:1,seed:86623464},
  {seat:0,seed:3741635901},{seat:1,seed:3937313210},
  {seat:0,seed:3935354425},{seat:1,seed:469693129},
  {seat:0,seed:3112483819},{seat:1,seed:4036501400},
  {seat:0,seed:1618181490},{seat:1,seed:3127876404},
  {seat:0,seed:358071138},{seat:1,seed:246568075},
  {seat:0,seed:614184015},{seat:1,seed:3658443122},
  {seat:0,seed:988546863},{seat:1,seed:3425622581}
].map(x=>({...x,sourceFirst:true}));

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
      // Query the actual Store State: a Player has no prompts collection.
      const stillPending=this.state.prompts.some(p=>
        p.id===pending.id&&p.result===undefined);
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
function attempt(trial){
  const shared={store:null};
  const actorSelectIntents=[];
  const selectReceipts=[];
  const goFirstReceipts=[];
  const mulliganReceipts=[];
  const firstTurnHandEvents=[];
  let thrown=null,returned=false,inner=null;
  try{
    inner=withNativeRawStateFallbackQuarantine(()=>withOwnerSetupConfirm(()=>
      withSetupPromptPhysicalReceipt(()=>withActorSelectReceipt(()=>
        withGoFirstChoice(
          trial.seat===0?[true,false]:[false,true],
          ()=>withOwnerPublicAcknowledgements(()=>
            withOwnerEntryPriorityOpening(()=>
              withOwnerOpeningStoreReceipt(()=>
                withOwnerFirstTurnDedechange(()=>
                  withOwnerFirstTurnHandReceipt(()=>runMatch({
                    deckA:trial.seat===0?source.cards:reference.cards,
                    deckB:trial.seat===1?source.cards:reference.cards,
                    seed:trial.seed,maxActions:80,
                    captureNativeAbortEvidence:true
                  }),{sourceSeat:trial.seat,shared,events:firstTurnHandEvents}),
                {sourceSeat:trial.seat}),
              {sourceSeat:trial.seat})
            )
          )
        ),actorSelectIntents),shared,selectReceipts,goFirstReceipts,
        mulliganReceipts,trial.seat)
    ,{maxRecords:8}));
    returned=true;
  }catch(error){
    thrown=error;
  }

  const setupConfirmLayer=returned?inner?.result:null;
  const actorSelectLayer=setupConfirmLayer?.result??null;
  const goFirstLayer=actorSelectLayer?.result??null;
  const publicAckLayer=goFirstLayer?.result??null;
  const entryLayer=publicAckLayer?.result??null;
  const openingLayer=entryLayer?.result??null;
  const dedechangeLayer=openingLayer?.result??null;
  const matchResult=dedechangeLayer?.result??null;
  const hook=thrown?.agent50FirstTurnDedechangeAudit??
    dedechangeLayer?.audit??null;
  const root=hook?.rootEvents?.[0]??null;
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
  const handReceipt=thrown?.agent50FirstTurnHandReceipt??{
    events:firstTurnHandEvents
  };
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
    compensation[0].physicalTransferVerified===true&&
      compensation[0].nativePromptResolved===true;
  const sourceTurnReached=(hook?.sourceTurnRootsSeen??0)>0;
  return {
    schema:DEDECHANGE_VERSION,
    variant:'prospective-natural32-sourcefirst-owner-entry-priority',
    registration:REGISTRATION,
    sourceRank:4,referenceRank:1,sourceSeat:trial.seat,seed:trial.seed,
    sourceFirst:trial.sourceFirst,
    sourceCoinChoice:trial.seat===0?[true,false]:[false,true],
    pinnedEngine:PIN,
    shuffleProtocol:'twinleaf-default-legacy-shared-seeded-stream',
    source60Sha256:createHash('sha256')
      .update(JSON.stringify(source.cards)).digest('hex'),
    reference60Sha256:createHash('sha256')
      .update(JSON.stringify(reference.cards)).digest('hex'),
    finishedWithoutError:returned,
    error:thrown?{
      code:thrown.code??null,name:thrown.name??null,
      message:String(thrown.message??thrown).slice(0,400)
    }:null,
    sourceTurnReached,
    matchResult:matchResult?{
      actions:matchResult.actions??null,
      turns:matchResult.turns??null,
      finished:matchResult.finished??null,
      endReason:matchResult.endReason??null,
      winner:matchResult.winner??null
    }:null,
    firstTurnHandReceipt:handReceipt.events??[],
    ownerFirstTurnHook:hook,
    dedechangeOpportunity:Boolean(root?.availableDedenne===true&&
      (Number.isSafeInteger(root?.benchIndex)&&root.benchIndex>=0||
       root?.emptyBenchSlot===true)),
    dedechangeNativePlayed:hook?.nativePlayedDedenne??0,
    dedechangeConfirmed:hook?.confirmedDedechange??0,
    settledPhysicalDedechangeDraws:hook?.settledPhysicalDedechangeDraws??0,
    setupNativeStore:setup?.events??null,
    ownerEntryPriorityAudit:entry,
    ownerSetupConfirmAudit:setupConfirm,
    actorSelectAudit:actorSelectLayer?.audit??null,
    goFirstAudit:goFirstLayer?.audit??null,
    publicAcknowledgementsAudit:publicAckLayer?.audit??null,
    actorSelectIntents,
    mulliganReceipts:promptReceipt.mulliganReceipts??mulliganReceipts,
    mulliganCountsBySeat,
    mulliganCountsByDeck:{
      source:mulliganCountsBySeat[trial.seat],
      reference:mulliganCountsBySeat[1-trial.seat]
    },
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
  const dir=process.env.AGENT50_RANK4_DEDECHANGE_OUTPUT;
  if(!dir)return;
  fs.mkdirSync(dir,{recursive:true});
  const name='rank4-dedechange-natural32-seat'+row.sourceSeat+
    '-seed'+row.seed+'.json';
  const file=path.resolve(dir,name);
  const body=JSON.stringify(row,null,2)+'\n';
  writeAtomicLocked(file,body);
  const sha=createHash('sha256').update(body).digest('hex');
  writeAtomicLocked(file+'.sha256',sha+'  '+name+'\n');
}

test('32 preregistered source-first physical rank4 opening opportunities with mulligan receipts',()=>{
  const rows=frozenTrials.map(trial=>{
    const row=attempt(trial);
    save(row);
    return row;
  });
  const sourceTurns=rows.filter(row=>row.sourceTurnReached).length;
  const opportunities=rows.filter(row=>row.dedechangeOpportunity).length;
  const played=rows.filter(row=>row.dedechangeNativePlayed>0).length;
  const confirmed=rows.filter(row=>row.dedechangeConfirmed>0).length;
  const settled=rows.filter(row=>row.settledPhysicalDedechangeDraws>0).length;
  const compensation=rows.flatMap(row=>row.selectReceipts??[])
    .filter(row=>row.message==='WANT_TO_DRAW_CARDS');
  const recipientBySeat={
    0:rows.filter(row=>row.actualCompensationRecipientSeat===0).length,
    1:rows.filter(row=>row.actualCompensationRecipientSeat===1).length
  };
  const summary={
    schema:'agent50-rank4-dedechange-natural32-sourcefirst',
    registration:REGISTRATION,registeredTrials:rows.length,
    uniqueSeeds:new Set(rows.map(row=>row.seed)).size,
    sourceSeatCounts:{0:rows.filter(row=>row.sourceSeat===0).length,
      1:rows.filter(row=>row.sourceSeat===1).length},
    sourceFirst:true,sourceTurnsReached:sourceTurns,
    dedechangeOpportunities:opportunities,
    physicalDedennePlays:played,
    confirmedDedechanges:confirmed,
    settledSixCardDedechangeDraws:settled,
    compensationPromptCount:compensation.length,
    compensationCards:compensation.reduce((n,x)=>n+(x.expectedDrawCount??0),0),
    recipientBySeat,
    compensationVerified:rows.filter(row=>row.compensationVerified).length,
    compensationVerificationFailures:rows.filter(row=>!row.compensationVerified)
      .map(row=>({seat:row.sourceSeat,seed:row.seed,
        counts:row.mulliganCountsBySeat,
        expected:row.expectedCompensationRecipientSeat,
        actual:row.actualCompensationRecipientSeat,
        expectedDraw:row.expectedCompensationDrawCount,
        actualDraw:row.actualCompensationDrawCount})),
    attemptOutcomes:rows.map(row=>({
      seat:row.sourceSeat,seed:row.seed,
      sourceTurnReached:row.sourceTurnReached,
      mulligans:row.mulliganCountsBySeat,
      compensationRecipient:row.actualCompensationRecipientSeat,
      compensationDraw:row.actualCompensationDrawCount,
      compensationVerified:row.compensationVerified,
      dedechangeOpportunity:row.dedechangeOpportunity,
      played:row.dedechangeNativePlayed,
      confirmed:row.dedechangeConfirmed,
      draws:row.settledPhysicalDedechangeDraws,
      error:row.error?.code??null
    })),
    qualifiedCompetitiveGames:0
  };
  console.log('AGENT50_RANK4_DEDECHANGE_NATURAL32',JSON.stringify(summary));
  assert.equal(rows.length,32);
  assert.equal(new Set(rows.map(row=>row.seed)).size,32);
  assert.equal(rows.filter(row=>row.sourceSeat===0).length,16);
  assert.equal(rows.filter(row=>row.sourceSeat===1).length,16);
  assert.equal(sourceTurns,32,'Every registered source first turn must be reached');
  assert.ok(rows.every(row=>row.competitiveGamesQualified===0));
  assert.ok(rows.every(row=>row.ownerFirstTurnHook),
    'Every attempt must retain the first-turn Dedechange hook audit');
  assert.ok(rows.every(row=>row.ownerFallback?.originalNativeDecoderExecuted===false),
    'Original raw-State native decoder must remain quarantined');
  assert.ok(rows.every(row=>row.mulliganReceipts.every(x=>x.nativeAccepted===true)),
    'Every public mulligan acknowledgement must be natively accepted');
  assert.ok(rows.every(row=>row.compensationVerified),
    'The compensation recipient and draw count must match the observed mulligan difference');
  assert.ok(compensation.every(row=>row.physicalTransferVerified===true),
    'Every compensation SelectPrompt must have an exact physical movement receipt');
  assert.ok(rows.flatMap(row=>row.goFirstReceipts??[])
    .every(row=>row.chooseFirst===(row.seat===row.sourceSeat)),
    'The source seat must be the selected first player');
});
