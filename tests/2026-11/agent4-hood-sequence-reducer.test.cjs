'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {hoodSequence,isAcceptedHood,isAcceptedDoor} =
  require('../../simulation/evaluation/2026-11/agent4-hood-sequence-reducer.cjs');

const candidate=0;
const root=(action,playerSlot,other={})=>({
  action,playerSlot,turnBefore:4,...other
});
test('separates genuine accepted Hood, Door, following attacks, and native status',()=>{
  const native={
    rootActionLedger:[
      root('PlayCardAction',0,{card:'Stealthy Hood UNB',actionOrdinal:7}),
      root('UseAbilityAction',0,{ability:'Underworld Door',actionOrdinal:8}),
      root('AttackAction',0,{attack:'Max Geist',actionOrdinal:9}),
      root('AttackAction',1,{attack:'Volt Cyclone',actionOrdinal:10})
    ],
    finished:true,winner:0,finalPrizes:[4,5],
    suddenDeathClockResets:[]
  };
  const audit=hoodSequence(native,candidate);
  assert.equal(audit.acceptedHoodCount,1);
  assert.equal(audit.acceptedDoorCount,1);
  assert.equal(audit.candidateAttackCount,1);
  assert.equal(audit.originalSourceAttackCount,1);
  assert.equal(audit.observedTemporalHoodDoor,true);
  assert.equal(audit.observedTemporalHoodDoorCandidateAttack,true);
  assert.equal(audit.observedTemporalHoodDoorSourceAttack,true);
  assert.equal(audit.firstAcceptedDoorAfterHood.actionOrdinal,8);
  assert.equal(audit.nativeWinner,0);
  assert.equal(audit.hoodAndDoorSamePhysicalSourceVerified,false);
  assert.equal(audit.competitiveQualified,false);
});
test('rejects proposed or wrong-seat Hood and chronologically earlier Door',()=>{
  const native={rootActionLedger:[
    root('UseAbilityAction',0,{power:'Underworld Door'}),
    root('PlayCardAction',1,{card:'Stealthy Hood UNB'}),
    root('PlayCardAction',0,{card:'Stealthy Hood UNB'}),
    root('PassTurnAction',0),
    root('AttackAction',1,{attack:'Volt Cyclone'})
  ],finished:false,finalPrizes:[6,5]};
  const audit=hoodSequence(native,candidate);
  assert.equal(audit.acceptedHoodCount,1);
  assert.equal(audit.acceptedDoorCount,1);
  assert.equal(audit.observedTemporalHoodDoor,false);
  assert.equal(audit.firstCandidateAttackAfterHoodDoor,null);
  assert.equal(audit.nativeWinner,null);
});
test('does not count a Hood name in prompts or fake move text',()=>{
  assert.equal(isAcceptedHood({action:'ResolvePromptAction',card:'Stealthy Hood UNB'}),false);
  assert.equal(isAcceptedDoor({action:'PlayCardAction',card:'Underworld Door'}),false);
  assert.equal(hoodSequence({rootActionLedger:[],finished:false},1)
    .observedTemporalHoodDoor,false);
});
