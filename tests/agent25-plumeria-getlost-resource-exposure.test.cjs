'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {auditPlumeriaGetLost,multisetPrintingIntersection}=
  require('../simulation/evaluation/agent25-plumeria-getlost-resource-exposure.cjs');

function fixture(){
  const trial={id:'6:2:B:champion-reference',rank:6};
  const row={trial,sourceSeat:0,
    actorOnlyDecisionCoverage:{ownerPlumeriaAfterPassAudit:{
      log:[
        {kind:'plumeria-native-root',seat:0,turn:3,accepted:true},
        {kind:'plumeria-energy-settlement',seat:0,turn:3,
          accepted:true,printing:'Psychic Energy MEE',sourceHandDiscardCount:2}
      ],acceptedPlumeria:1,settledEnergyDiscards:1
    }},
    rootActionLedger:[
      {actionOrdinal:29,playerSlot:0,turnBefore:3,pendingPrompt:null,
        action:'PlayCardAction',card:'Plumeria'},
      {actionOrdinal:30,playerSlot:0,turnBefore:3,
        pendingPrompt:'ChooseCardsPrompt',action:'ResolvePromptAction',
        initiatingRootActionOrdinal:29},
      {actionOrdinal:32,playerSlot:0,turnBefore:3,
        pendingPrompt:'ChooseCardsPrompt',action:'ResolvePromptAction',
        initiatingRootActionOrdinal:29},
      {actionOrdinal:37,playerSlot:1,turnBefore:4,pendingPrompt:null,
        action:'AttackAction',attack:'Get Lost'},
      {actionOrdinal:38,playerSlot:1,turnBefore:4,
        pendingPrompt:'ChooseCardsPrompt',action:'ResolvePromptAction',
        initiatingRootActionOrdinal:37},
      {actionOrdinal:40,playerSlot:0,turnBefore:5,pendingPrompt:null,
        action:'PassTurnAction'}
    ],
    nativePromptChoices:{events:[
      {ordinal:30,turn:3,actorSeat:0,kind:'ChooseCardsPrompt',
        nativePromptMin:2,nativePromptMax:2,
        nativePromptAllowCancel:false,sourceZone:'unclassified',
        selectedCards:['Crushing Hammer POR','Speed Lightning Energy RCL']},
      {ordinal:32,turn:3,actorSeat:0,kind:'ChooseCardsPrompt',
        nativePromptMin:1,nativePromptMax:1,
        nativePromptAllowCancel:false,sourceZone:'unclassified',
        selectedCards:['Psychic Energy MEE']},
      {ordinal:38,turn:4,actorSeat:1,kind:'ChooseCardsPrompt',
        nativePromptMin:2,nativePromptMax:2,
        nativePromptAllowCancel:true,sourceZone:'discard',
        sourceZoneCardCountBefore:3,
        selectedCards:['Speed Lightning Energy RCL','Crushing Hammer POR']}
    ]},
    nativeAcceptedTargetSidecar:{events:[]},
    candidateAttackSettlement:{attacks:[{
      actionOrdinal:37,turnBefore:4,attackName:'Get Lost',
      settledPromptChain:true,settlementCrossesClockReset:false,
      completionRootOrdinal:39,
      publicBoardBefore:[{active:{name:'Iron Thorns ex',energyCards:[]}},{active:{name:'Girafarig',energyCards:['Psychic Energy']}}]
    }]}
  };
  return {result:{rows:[row,...Array.from({length:31},(_,i)=>
    ({trial:{id:'11:'+i,rank:11}}))]}};
}

test('multiset overlap counts duplicate printings without reusing one copy',()=>{
  assert.equal(multisetPrintingIntersection(['Capture','Capture'],
    ['Capture','Plumeria']),1);
  assert.equal(multisetPrintingIntersection(['Capture','Capture'],
    ['Capture','Capture']),2);
  assert.equal(multisetPrintingIntersection(['A','B'],['C','D']),0);
});

test('native settled Get Lost selects exactly both preceding Plumeria costs',()=>{
  const x=auditPlumeriaGetLost(fixture());
  assert.equal(x.sourceSettledPlumeriaChains,1);
  assert.equal(x.nextOpponentFullySettledGetLost,1);
  assert.equal(x.chosenOpponentDiscardCardPrintings,2);
  assert.equal(x.printingInstancesMatchingImmediatePlumeriaPayment,2);
  assert.equal(x.fullTwoPaymentPrintingMatches,1);
  assert.equal(x.nativeGetLostPromptsAllowCancel,1);
  assert.equal(x.getLostActiveGirafarigWithPaidEnergy,1);
  assert.equal(x.getLostWithPhysicalNewPsychicBeforeAttack,0);
  assert.equal(x.fullTwoWithExactlyThreeDiscardCards,1);
  assert.equal(x.records[0].nativeDiscardPromptOrdinal,38);
  assert.equal(x.records[0].physicalLostZoneDestinationObjectNotIndependentlyObserved,true);
  assert.equal(x.competitiveQualifiedGames,0);
});

test('a larger discard pile cannot certify exact three-card provenance',()=>{
  const x=fixture();
  x.result.rows[0].nativePromptChoices.events[2].sourceZoneCardCountBefore=4;
  const r=auditPlumeriaGetLost(x);
  assert.equal(r.fullTwoPaymentPrintingMatches,1);
  assert.equal(r.fullTwoWithExactlyThreeDiscardCards,0);
});

test('wrong selection source zone or missing two-card prompt fails closed',()=>{
  const x=fixture();
  x.result.rows[0].nativePromptChoices.events[2].sourceZone='hand';
  assert.throws(()=>auditPlumeriaGetLost(x));
  const y=fixture();
  y.result.rows[0].nativePromptChoices.events[2].selectedCards=['Crushing Hammer POR'];
  assert.throws(()=>auditPlumeriaGetLost(y));
});

test('misattributed Get Lost root or impossible prompt chronology fails',()=>{
  const x=fixture();
  x.result.rows[0].rootActionLedger[4].initiatingRootActionOrdinal=99;
  assert.throws(()=>auditPlumeriaGetLost(x));
  const y=fixture();
  y.result.rows[0].candidateAttackSettlement.attacks[0].completionRootOrdinal=37;
  assert.throws(()=>auditPlumeriaGetLost(y));
});

test('unsettled attack cannot generate a Lost-Zone selection claim',()=>{
  const x=fixture();
  x.result.rows[0].candidateAttackSettlement.attacks[0].settledPromptChain=false;
  assert.throws(()=>auditPlumeriaGetLost(x));
});


test('same-root settled Get Lost without actual funded Active Girafarig fails',()=>{
  const x=fixture();
  x.result.rows[0].candidateAttackSettlement.attacks[0]
    .publicBoardBefore[1].active.energyCards=[];
  assert.throws(()=>auditPlumeriaGetLost(x));
});
