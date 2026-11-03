'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {sourceLine,firstDifferent}=
  require('../simulation/evaluation/agent10-rank11-funding-mobility-disaggregation.cjs');

test('first mismatch counts actual native root content, not matching length',()=>{
  assert.equal(firstDifferent([{a:1},{b:2}],[{a:1},{b:2}]),null);
  assert.equal(firstDifferent([{a:1},{b:2}],[{a:1},{b:3}]),1);
  assert.equal(firstDifferent([{a:1}],[{a:1},{b:2}]),1);
});
test('owner source action and exact physical attachment target retained',()=>{
  const a={playerSlot:0,turnBefore:15,action:'AttackAction',attack:'Motivate'};
  const b={playerSlot:1,turnBefore:15,action:'PassTurnAction'};
  const row={
    rootActionLedger:[a,b],
    nativeAcceptedTargetSidecar:{events:[{
      playerSlot:0,turnBefore:15,storeAccepted:true,
      declared:{ownerHandPrinting:'Darkness Energy MEE',
        target:{player:2,slot:1,index:0}},
      publicBoardChanges:[{seat:0,position:'active',
        after:{pokemon:'Squawkabilly ex PAL',energies:['Darkness Energy MEE']}}]
    }]},
    sourceAttackSettlement:{attacks:[]}
  };
  const source=sourceLine(row,0);
  assert.equal(source.nativeMotivates,1);
  assert.equal(source.nativeClaws,0);
  assert.equal(source.turn15Energy.declared.target.slot,1);
  assert.equal(source.nativePaidRetreats,0);
});
test('Claw Prize transitions belong to true source seat',()=>{
  const row={
    rootActionLedger:[
      {playerSlot:0,turnBefore:33,action:'AttackAction',attack:'Claw of Darkness'},
      {playerSlot:1,turnBefore:34,action:'RetreatAction'}
    ],
    sourceAttackSettlement:{attacks:[{
      attackName:'Claw of Darkness',turnBefore:33,settledPromptChain:true,
      prizesBefore:[6,4],prizesAfter:[5,4],
      nextSourceRoot:{action:'PlayCardAction',turn:34}
    }]},
    nativeAcceptedTargetSidecar:{events:[]}
  };
  const x=sourceLine(row,0);
  assert.equal(x.nativeClaws,1);
  assert.equal(x.nativePaidRetreats,0);
  assert.deepEqual(x.sourceClawSettlements[0].prizesAfter,[5,4]);
  assert.equal(x.sourceClawSettlements[0].settled,true);
});
