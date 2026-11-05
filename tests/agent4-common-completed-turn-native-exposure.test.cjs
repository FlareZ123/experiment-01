'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
 observedCompleteTurns,compareCommonCompletedTurns,analyzeOriginal96
}=require('../simulation/evaluation/agent4-common-completed-turn-native-exposure.cjs');
const r=(ordinal,turn,seat,action,card=null,attack=null)=>({
 ordinal,turn,seat,action,card,attack,pendingPrompt:null
});
test('completed native turn requires accepted later-turn root',()=>{
 const tape=[
  r(1,0,0,'ResolvePromptAction'),
  r(2,1,1,'PlayCardAction',"Trainers' Mail"),
  r(3,1,1,'PassTurnAction'),
  r(4,2,0,'AttackAction',null,'Shadow Mist'),
  r(5,3,1,'PassTurnAction')
 ];
 const v=observedCompleteTurns(tape);
 assert.deepEqual(v.completedTurnKeys,['0:0','0:1','0:2']);
 assert.equal(v.lastObservedTurn,3);
 assert.equal(v.resetCount,0);
});
test('equal root caps but unequal game turn horizons produce equal common-turn attacks',()=>{
 const a=[
  r(1,0,0,'ResolvePromptAction'),r(2,1,1,'PassTurnAction'),
  r(3,2,0,'AttackAction',null,'Shadow Mist'),
  r(4,3,1,'PassTurnAction'),
  r(5,4,0,'AttackAction',null,'Shadow Mist'),
  r(6,5,1,'PassTurnAction'),
  r(7,6,0,'AttackAction',null,'Shadow Mist'),
  r(8,7,1,'PassTurnAction')
 ];
 const b=[
  r(1,0,0,'ResolvePromptAction'),
  r(2,1,1,'PlayCardAction',"Trainers' Mail"),
  r(3,1,1,'ResolvePromptAction'),
  r(4,1,1,'PassTurnAction'),
  r(5,2,0,'AttackAction',null,'Shadow Mist'),
  r(6,3,1,'PassTurnAction'),
  r(7,4,0,'AttackAction',null,'Shadow Mist'),
  r(8,5,1,'PlayCardAction','Capture Energy')
 ];
 const v=compareCommonCompletedTurns(a,b,1);
 assert.deepEqual(v.sharedCompleteTurns,['0:1','0:2','0:3','0:4']);
 assert.equal(v.candidate.control.attackDeclarations.length,2);
 assert.equal(v.candidate.MailTreatment.attackDeclarations.length,2);
 assert.equal(v.source.MailTreatment.playCardActions[0].card,"Trainers' Mail");
 assert.equal(v.competitiveGamesQualified,0);
});
test('late Volt Cyclone on final observed turn is excluded until next turn completes',()=>{
 const a=[
  r(1,0,0,'ResolvePromptAction'),r(2,1,1,'PassTurnAction'),
  r(3,2,0,'PassTurnAction'),r(4,3,1,'PassTurnAction'),
  r(5,4,0,'PlayCardAction','Klefki'),
  r(6,4,0,'PassTurnAction'),r(7,5,1,'PassTurnAction'),
  r(8,6,0,'PassTurnAction')
 ];
 const b=[
  r(1,0,0,'ResolvePromptAction'),
  r(2,1,1,'PlayCardAction',"Trainers' Mail"),
  r(3,1,1,'PassTurnAction'),r(4,2,0,'PassTurnAction'),
  r(5,3,1,'PassTurnAction'),r(6,4,0,'PlayCardAction','Klefki'),
  r(7,4,0,'PassTurnAction'),r(8,5,1,'PassTurnAction'),
  r(9,6,0,'PassTurnAction'),
  r(10,7,1,'AttackAction',null,'Volt Cyclone')
 ];
 const v=compareCommonCompletedTurns(a,b,1);
 assert.equal(v.candidateKlefkiOnSharedCompletedTurn4.eligible,true);
 assert.equal(v.candidateKlefkiOnSharedCompletedTurn4.control,true);
 assert.equal(v.candidateKlefkiOnSharedCompletedTurn4.MailTreatment,true);
 assert.deepEqual(v.source.MailTreatment.attackDeclarations,[]);
 assert.ok(!v.sharedCompleteTurns.includes('0:7'));
});
test('turn reset without epoch alignment invalidates comparison',()=>{
 const a=[r(1,0,0,'ResolvePromptAction'),r(2,1,1,'PassTurnAction'),
  r(3,0,0,'ResolvePromptAction'),r(4,1,1,'PassTurnAction')];
 const b=[r(1,0,0,'ResolvePromptAction'),r(2,1,1,'PassTurnAction')];
 const v=compareCommonCompletedTurns(a,b,1);
 assert.equal(v.resetGuardPass,false);
 assert.equal(v.interpretation,'INCOMPARABLE_NATIVE_EPOCH_RESET');
});
test('eight original rows preserved; qualified game count remains zero',()=>{
 const panel=Array.from({length:8},(_,i)=>({
  id:'source'+i,sourceSeat:i%2,changeAudit:{
   baselinePublicRootTape:[r(1,0,0,'ResolvePromptAction'),
    r(2,1,1,'PassTurnAction'),r(3,2,0,'PassTurnAction')],
   treatedPublicRootTape:[r(1,0,0,'ResolvePromptAction'),
    r(2,1,1,'PassTurnAction'),r(3,2,0,'PassTurnAction')]
  }
 }));
 const result=analyzeOriginal96({
  schema:'agent4-mail-postsetup-original-eight-96root-source-payoff-v3',
  gates:{native:true},registry:'registered',commonProtocol:'original-protocol',
  nativeRootCap:96,fullAfterSetupNativeComparison:{mailAba:{panel}},
  sourceAndCandidateOpportunitySummary:{
    sourceMailAcceptedCountByPhysicalSeat:[0,4]
  }
 });
 assert.equal(result.originalEight.length,8);
 assert.equal(result.allEightRetained,true);
 assert.equal(result.competitiveGamesQualified,0);
 assert.equal(result.winRate,null);
 assert.ok(result.originalEight.every(x=>x.completeTurnCount===1));
});
