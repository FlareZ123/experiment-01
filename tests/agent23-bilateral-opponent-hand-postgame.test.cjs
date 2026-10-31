'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyConditionalProbe,auditHistoricalTrial}=
  require('../simulation/evaluation/agent23-bilateral-opponent-hand-postgame.cjs');

const trial={id:'11:2:B:new-moon-lockbreaker-v1',rank:11,
  candidateSlot:'B',candidateId:'new-moon-lockbreaker-v1',seed:623585882};

function row(){
  return {
    trial,rootActionLedgerSha256:'a'.repeat(64),
    sourceDealFingerprint:'b'.repeat(64),
    sourceFirstOwnHandSha256:'c'.repeat(64),
    verifiedFirstTurn:true,sourceActuallyFirst:false,
    actualStarterSeat:0,actionCount:260,turns:25,
    finished:false,winner:null,endReason:'action-cap',
    finalPrizes:[6,6],attackDeclarations:{source:22,candidate:0}
  };
}

function event(overrides={}){
  return {
    originalSourceAction:{type:'PassTurnAction'},
    physicalOrder:{type:'PassTurnAction'},
    counterfactualOrder:{type:'UseAbilityAction',name:'Perfection'},
    baselineActionMatchedActual:true,liveStatePreserved:true,
    comparedAfterRealGameFinished:true,opportunity:true,
    sourceHiddenPoolConserved:true,chosenExchangeKinds:'energy-vs-trainer',
    actionSensitiveToOpponentHiddenHand:true,
    tacticScoreComparison:{equalScoreTraces:false},
    ...overrides
  };
}

test('one original and one preserved replay qualify only as a conditional root diagnostic',()=>{
  const out=classifyConditionalProbe(row(),row(),[event()]);
  assert.equal(out.noninterfering,true);
  assert.equal(out.conditionalActionReversal,true);
  assert.equal(out.classification,'conditional-opponent-hand-action-reversal');
  assert.equal(out.completeOwnerInformationSetCertified,false);
  assert.equal(out.qualifiedCompetitiveGames,0);
});

test('public outcome or true source deal drift vetoes apparent reversal',()=>{
  const changed={...row(),rootActionLedgerSha256:'z'.repeat(64)};
  const out=classifyConditionalProbe(row(),changed,[event()]);
  assert.equal(out.conditionalActionReversal,false);
  assert.equal(out.classification,'unverified-or-changed-live-playback');
});

test('matched action with no meaningful opponent swap remains negative',()=>{
  const out=classifyConditionalProbe(row(),row(),[
    event({opportunity:false,actionSensitiveToOpponentHiddenHand:false})
  ]);
  assert.equal(out.classification,'no-distinct-hidden-hand-deck-pair');
  assert.equal(out.conditionalActionReversal,false);
});

test('unmatched actual owner decision fails closed even with a changed hypothetical',()=>{
  const out=classifyConditionalProbe(row(),row(),[
    event({baselineActionMatchedActual:false})
  ]);
  assert.equal(out.classification,'fresh-bot-baseline-or-detachment-mismatch');
  assert.equal(out.conditionalActionReversal,false);
});

test('bounded multiworld scanner preserves score-only contrasts and coverage',()=>{
  const out=classifyConditionalProbe(row(),row(),[event({
    schema:'agent23-detached-bounded-hidden-world-single-exchange-v1',
    actionSensitiveToOpponentHiddenHand:false,
    scoreOnlyChanges:2,
    totalEligibleSingleExchanges:7,testedSingleExchanges:4,
    exhaustiveSingleExchangeCoverage:false,
    tacticScoreComparison:null,
    counterfactualOrder:null,
    chosenExchangeKinds:null,
    firstActionReversal:null,
    firstScoreOnlyChange:{
      exchangeKind:'trainer-vs-energy',
      scoreComparison:{equalScoreTraces:false}
    }
  })]);
  assert.equal(out.classification,'conditional-opponent-hand-score-change-only');
  assert.equal(out.conditionalActionReversal,false);
  assert.equal(out.diagnostic.testedSingleExchanges,4);
  assert.equal(out.diagnostic.eligibleSingleExchanges,7);
  assert.equal(out.diagnostic.exhaustiveSingleExchangeCoverage,false);
  assert.equal(out.diagnostic.hiddenSwapKinds,'trainer-vs-energy');
  assert.equal(out.qualifiedCompetitiveGames,0);
});

test('source errors and observer errors remain census rows',()=>{
  const fails=auditHistoricalTrial(trial,new Map(),function Stub(){},
    structuredClone,()=>{throw Error('source failed')},()=>{},()=>()=>0);
  assert.equal(fails.classification,'control-engine-error');
  const detached=auditHistoricalTrial(trial,new Map(),function Stub(){},
    structuredClone,()=>row(),()=>{throw Error('postgame failed')},()=>()=>0);
  assert.equal(detached.classification,'detached-observer-or-replay-error');
  assert.equal(detached.qualifiedCompetitiveGames,0);
});
