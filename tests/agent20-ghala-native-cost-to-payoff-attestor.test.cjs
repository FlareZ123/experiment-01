'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  samePrintings,attestGuzmaHalaNativeChain,attestHistoricalFourArmReplay
}=require('../simulation/evaluation/agent20-ghala-native-cost-to-payoff-attestor.cjs');

function sample(){
  const row={
    trial:{rank:6,id:'6:0:A:champion-reference',candidateSlot:'A'},
    sourceDealFingerprint:'source-fixture-hash',
    rootActionLedger:[
      {actionOrdinal:10,turnBefore:3,playerSlot:1,
        action:'PlayCardAction',card:'Guzma & Hala'},
      {actionOrdinal:11,turnBefore:3,playerSlot:1,
        action:'ResolvePromptAction',pendingPrompt:'SelectOptionPrompt',
        initiatingRootActionOrdinal:10},
      {actionOrdinal:12,turnBefore:3,playerSlot:1,
        action:'ResolvePromptAction',pendingPrompt:'ChooseCardsPrompt',
        initiatingRootActionOrdinal:10},
      {actionOrdinal:13,turnBefore:3,playerSlot:1,
        action:'ResolvePromptAction',pendingPrompt:'ChooseCardsPrompt',
        initiatingRootActionOrdinal:10},
      {actionOrdinal:14,turnBefore:3,playerSlot:1,
        action:'ResolvePromptAction',pendingPrompt:'ShuffleDeckPrompt',
        initiatingRootActionOrdinal:10},
      {actionOrdinal:15,turnBefore:3,playerSlot:1,
        action:'PlayCardAction',card:'Thunder Mountain Prism Star'},
      {actionOrdinal:16,turnBefore:3,playerSlot:1,
        action:'PlayCardAction',card:'Double Colorless Energy'},
      {actionOrdinal:17,turnBefore:3,playerSlot:1,
        action:'AttackAction',attack:'Volt Cyclone'},
      {actionOrdinal:18,turnBefore:4,playerSlot:0,
        action:'PassTurnAction'}
    ],
    nativePromptChoices:{events:[
      {ordinal:11,kind:'SelectOptionPrompt',selectedOption:1},
      {ordinal:12,kind:'ChooseCardsPrompt',sourceZone:'hand',
        sourcePlayerSlot:1,actorSeat:1,turn:3,nativePromptMin:2,
        nativePromptMax:2,selectedCards:[
          'Crushing Hammer POR','Team Flare Grunt XY']},
      {ordinal:13,kind:'ChooseCardsPrompt',sourceZone:'deck',
        sourcePlayerSlot:1,actorSeat:1,turn:3,selectedCards:[
          'Thunder Mountain Prism Star LOT','Double Colorless Energy SUM']}
    ]},
    sourceLinePacket:{
      executedSourceRoot:{ordinal:17,attack:'Volt Cyclone'},
      matchingSourceAttackDeclared:true,
      sourceImmediatePublicAttackTransition:{
        actionOrdinal:17,triggerPlayerSlot:1,
        beforePrizesRemaining:[6,6],
        settled:{prizesRemaining:[6,5]}
      },
      firstCandidateNextTurnRoot:{
        ordinal:18,turn:4,playerSlot:0,action:'PassTurnAction'
      }
    }
  };
  const event={
    sourcePhysicalSeat:1,ownerSeat:1,sourceRank:6,gameOrdinal:0,
    linkedTrialId:'6:0:A:champion-reference',
    ownerIsOriginalSource:true,
    sourceDealFingerprint:'source-fixture-hash',
    globalTurnBefore:3,paperSourcePaymentZoneWitness:true,
    paperTwoCardZoneWitness:true,validPhysicalSelectionBefore:true,
    nativeDispatchCompleted:true,
    actualSelectedCardMovementToDiscard:true,
    selectedStillInHand:false,requestedCount:2,distinctSelected:2,
    nativePromptMin:2,nativePromptMax:2,
    selectedPrintings:['Team Flare Grunt XY','Crushing Hammer POR']
  };
  return {row,event};
}

test('strict print multiset ignores ordering and protects duplicate counts',()=>{
  assert.equal(samePrintings(['A','B'],['B','A']),true);
  assert.equal(samePrintings(['A','A'],['A','B']),false);
  assert.equal(samePrintings(['A'],null),false);
});

test('fully linked source-native chain is a narrow yes, never paper win',()=>{
  const {row,event}=sample();
  const result=attestGuzmaHalaNativeChain(row,event);
  assert.deepEqual(result.failed,[]);
  assert.equal(result.paymentPromptRootOrdinal,10);
  assert.equal(result.nativeCostPromptOrdinal,12);
  assert.equal(result.nativeSearchPromptOrdinal,13);
  assert.equal(result.firstSourceAttackOrdinal,17);
  assert.equal(result.nativeSourcePaymentAttackPrizeOpponentRootChainVerified,true);
  assert.equal(result.competitivelyQualifiedGame,false);
});

test('missing two-card physical custody vetoes entire native chain',()=>{
  const {row,event}=sample();
  event.selectedStillInHand=true;
  assert.equal(attestGuzmaHalaNativeChain(row,event)
    .nativeSourcePaymentAttackPrizeOpponentRootChainVerified,false);
});

test('wrong or borrowed source actor and trial identity both veto',()=>{
  const {row,event}=sample();
  event.ownerSeat=0;
  assert.match(attestGuzmaHalaNativeChain(row,event).failed.join(','),
    /not-original-source-physical-owner/);
  event.ownerSeat=1;
  event.linkedTrialId='wrong';
  assert.match(attestGuzmaHalaNativeChain(row,event).failed.join(','),
    /event-trial-id-mismatch/);
});

test('tampered native source deal fingerprint vetoes pair join',()=>{
  const {row,event}=sample();
  row.sourceDealFingerprint='changed';
  assert.match(attestGuzmaHalaNativeChain(row,event).failed.join(','),
    /physical-source-deal-does-not-match/);
});

test('native prompt must independently evidence the same two physical cost prints',()=>{
  const {row,event}=sample();
  row.nativePromptChoices.events[1].selectedCards=['Other','Cost'];
  assert.match(attestGuzmaHalaNativeChain(row,event).failed.join(','),
    /ghala-native-root-prompt-linkage-missing/);
});

test('zero/one cost and missing native ShuffleDeckPrompt cannot qualify',()=>{
  const {row,event}=sample();
  event.requestedCount=1;
  row.rootActionLedger=row.rootActionLedger.filter(x=>
    x.pendingPrompt!=='ShuffleDeckPrompt');
  const result=attestGuzmaHalaNativeChain(row,event);
  assert.equal(result.nativeSourcePaymentAttackPrizeOpponentRootChainVerified,false);
  assert.match(result.failed.join(','),/missing-native-physical-two-card-custody/);
  assert.match(result.failed.join(','),/ghala-native-root-prompt-linkage/);
});

test('paid root with no later DCE play is incomplete resource chain',()=>{
  const {row,event}=sample();
  row.rootActionLedger=row.rootActionLedger.filter(x=>
    x.card!=='Double Colorless Energy');
  assert.match(attestGuzmaHalaNativeChain(row,event).failed.join(','),
    /searched-double-colorless-not-played/);
});

test('native attack without a settled Prize change is not a completed payoff',()=>{
  const {row,event}=sample();
  row.sourceLinePacket.sourceImmediatePublicAttackTransition.settled
    .prizesRemaining=[6,6];
  assert.match(attestGuzmaHalaNativeChain(row,event).failed.join(','),
    /source-prize-settlement-unverified/);
});

test('opponent Pass must actually exist in native root ledger',()=>{
  const {row,event}=sample();
  row.rootActionLedger=row.rootActionLedger.filter(x=>
    x.action!=='PassTurnAction');
  assert.match(attestGuzmaHalaNativeChain(row,event).failed.join(','),
    /consequential-opponent-followup-unverified/);
});

test('full audit retains a missing external ordinal as failure rather than dropping',()=>{
  const {row,event}=sample();
  const aggregate=attestHistoricalFourArmReplay(
    {rawNativeResult:{rows:[row]}},
    {events:[event,{...event,gameOrdinal:999}]});
  assert.equal(aggregate.registeredNativeArms,1);
  assert.equal(aggregate.totalObserverEvents,2);
  assert.equal(aggregate.sourceCostToNativePayoffChains,1);
  assert.equal(aggregate.allObservedSourceCostChainsVerified,false);
  assert.equal(aggregate.competitivelyQualifiedGames,0);
});
