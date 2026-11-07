'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,joinNativePrizeExitsToSettledAttacks:join}=
  require('../simulation/evaluation/agent3-accepted-prize-attack-join.cjs');

function printedTrial({id='rank6-source',seat=0,role='source'}={}){
  const source=seat,contender=1-seat;
  const actor=role==='source'?source:contender;
  const accepted=[
    {actionOrdinal:9,turnBefore:5,turnAfter:5,playerSlot:actor,
      action:'AttackAction'},
    {actionOrdinal:12,turnBefore:5,turnAfter:5,playerSlot:actor,
      action:'ResolvePromptAction'}
  ];
  const attack={
    actionOrdinal:9,completionRootOrdinal:12,turnBefore:5,
    attackName:'Volt Cyclone',triggerAction:'AttackAction',
    settledPromptChain:true,settlementCrossesClockReset:false,
    prizesBefore:[6,6],
    prizesAfter:actor===0?[5,6]:[6,5]
  };
  const none={attacks:[]};
  return {
    trial:{id},sourceSeat:source,candidateSeat:contender,
    rootActionLedger:accepted,
    sourceAttackSettlement:role==='source'?{attacks:[attack]}:none,
    candidateAttackSettlement:role==='candidate'?{attacks:[attack]}:none
  };
}
function exit(id='rank6-source',actor=0){
  return {
    registeredTrialId:id,acceptedRootActionOrdinal:12,
    acceptedRootActorSeat:actor,acceptedRootTurnBefore:5,
    ownerSeat:actor,turn:5,actionType:'ResolvePromptAction',
    exactExitedCards:1,byDestination:{hand:1}
  };
}
function run(row=printedTrial(),event=exit()){
  return join([row],[event]);
}

test('actual source attack to exact accepted physical Prize transfer',()=>{
  const result=run();
  assert.equal(VERSION,'agent3-accepted-prize-attack-join-v1');
  assert.equal(result.length,1);
  assert.equal(result[0].attackRole,'original-source');
  assert.equal(result[0].actualPrizeExitRootOrdinal,12);
  assert.equal(result[0].attackDeclarationRootOrdinal,9);
  assert.equal(result[0].takerPrizesRemainingBefore,6);
  assert.equal(result[0].takerPrizesRemainingAfter,5);
  assert.equal(result[0].paperValidityCertified,false);
});
test('contender with inverted seats can be the Prize taking attacker',()=>{
  const row=printedTrial({id:'rank1-control',seat:0,role:'candidate'});
  const event=exit('rank1-control',1);
  const result=run(row,event);
  assert.equal(result[0].attackRole,'fixed-contender');
  assert.equal(result[0].attackSeat,1);
});
test('source with opposite seat can be the Prize taking attacker',()=>{
  const row=printedTrial({id:'rank11-a',seat:1,role:'source'});
  const event=exit('rank11-a',1);
  assert.equal(run(row,event)[0].attackSeat,1);
});
test('two events cannot reuse the same attack as independent Prize episodes',()=>{
  const row=printedTrial(),event=exit();
  assert.throws(()=>join([row],[event,event]),/Cannot charge one attack twice/);
});
test('wrong Prize count cannot join to a settled attack',()=>{
  const event=exit();event.exactExitedCards=2;event.byDestination.hand=2;
  assert.throws(()=>run(printedTrial(),event),/one settled attacker/);
});
test('wrong owner seat cannot borrow opposing player attack',()=>{
  const event=exit();event.ownerSeat=1;
  assert.throws(()=>run(printedTrial(),event),/one settled attacker/);
});
test('unsettled attack cannot be rewarded with completed Prizes',()=>{
  const row=printedTrial();row.sourceAttackSettlement.attacks[0].settledPromptChain=false;
  assert.throws(()=>run(row),/one settled attacker/);
});
test('attack crossing native sudden-death epoch cannot be joined',()=>{
  const row=printedTrial();
  row.sourceAttackSettlement.attacks[0].settlementCrossesClockReset=true;
  assert.throws(()=>run(row),/one settled attacker/);
});
test('Prize exit before attacker declaration does not join',()=>{
  const event=exit();event.acceptedRootActionOrdinal=8;
  const row=printedTrial();
  row.rootActionLedger.push({actionOrdinal:8,turnBefore:5,turnAfter:5,
    playerSlot:0,action:'ResolvePromptAction'});
  assert.throws(()=>run(row,event),/one settled attacker/);
});
test('Prize exit cannot follow settled attack completion root',()=>{
  const event=exit();event.acceptedRootActionOrdinal=14;
  const row=printedTrial();
  row.rootActionLedger.push({actionOrdinal:14,turnBefore:5,turnAfter:5,
    playerSlot:0,action:'ResolvePromptAction'});
  assert.throws(()=>run(row,event),/one settled attacker/);
});
test('wrong accepted-root actor seat is a provenance failure',()=>{
  const event=exit();event.acceptedRootActorSeat=1;
  assert.throws(()=>run(printedTrial(),event),
    /Expected values to be strictly equal/);
});
test('wrong accepted-root action object class cannot match ledger',()=>{
  const event=exit();event.actionType='AttackAction';
  assert.throws(()=>run(printedTrial(),event),
    /Expected values to be strictly equal/);
});
test('wrong global turn cannot borrow a different-turn Prize',()=>{
  const event=exit();event.acceptedRootTurnBefore=6;
  assert.throws(()=>run(printedTrial(),event),
    /Expected values to be strictly equal/);
});
test('missing original source attack packet is treated as unknown failure',()=>{
  const row=printedTrial();delete row.sourceAttackSettlement;
  assert.throws(()=>run(row),/must be complete and authenticated/);
});
test('duplicate trial IDs and unrelated match identity both fail',()=>{
  const row=printedTrial(),event=exit('another-match');
  assert.throws(()=>join([row,row],[event]),/Duplicate registered native trial/);
  assert.throws(()=>run(row,event),/must belong to a registered returned trial/);
});
test('prize card transfer to another destination is not a hand-award join',()=>{
  const event=exit();event.byDestination={discard:1};
  assert.throws(()=>run(printedTrial(),event),
    /physical Prize cards reaching taking hand/);
});
