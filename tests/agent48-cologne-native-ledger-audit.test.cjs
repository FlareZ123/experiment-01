'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditAcceptedCologneRoots:audit}=
  require('../simulation/evaluation/agent48-cologne-native-ledger-audit.cjs');

const card=(seat,turn,ordinal)=>({
  action:'PlayCardAction',card:'Canceling Cologne',
  playerSlot:seat,turnBefore:turn,actionOrdinal:ordinal
});

test('different actors and later turns may each play one Cologne',()=>{
  const r=audit([
    card(0,1,0),{action:'ResolvePromptAction',card:'Canceling Cologne',
      playerSlot:0,turnBefore:1},card(1,2,2),card(0,3,3)
  ]);
  assert.equal(r.accepted,3);
  assert.deepEqual(r.bySeat,{'0':2,'1':1});
  assert.deepEqual(r.duplicateAcceptedBySeatTurn,[]);
  assert.equal(r.acceptedOncePerSeatTurn,true);
});

test('same-turn duplicate accepted Store plays are distinguished by actor',()=>{
  const r=audit([card(1,5,0),card(1,5,1),card(0,5,2)]);
  assert.equal(r.acceptedOncePerSeatTurn,false);
  assert.deepEqual(r.duplicateAcceptedBySeatTurn,[{epoch:0,seat:1,turn:5,count:2}]);
});

test('zero accepted plays does not claim no attempted illegal proposals',()=>{
  const r=audit([]);
  assert.equal(r.accepted,0);
  assert.equal(r.acceptedOncePerSeatTurn,true);
  assert.match(r.scope,/Missing rejected proposals/);
});

test('malformed accepted Cologne root fails closed',()=>{
  assert.throws(()=>audit([card(-1,0,0)]),/lacks real seat or turn/);
  assert.throws(()=>audit(null),TypeError);
});


test('authenticated sudden-death replay starts a separate Cologne quota episode',()=>{
  const roots=[
    {...card(0,1,0),turnAfter:1},
    {action:'ResolvePromptAction',actionOrdinal:1,playerSlot:-1,
      turnBefore:4,turnAfter:0},
    {...card(0,1,2),turnAfter:1}
  ];
  const reset=[{actionOrdinal:1,action:'ResolvePromptAction',
    fromTurn:4,toTurn:0,afterSuddenDeath:true,enteredSetup:true}];
  const result=audit(roots,reset);
  assert.equal(result.accepted,2);
  assert.equal(result.episodes,2);
  assert.equal(result.authenticatedRestarts,1);
  assert.equal(result.acceptedOncePerSeatTurn,true);
  assert.deepEqual(result.duplicateAcceptedBySeatTurn,[]);
});

test('same-episode duplicate remains invalid after an authenticated reset',()=>{
  const roots=[
    {...card(1,1,0),turnAfter:1},
    {action:'ResolvePromptAction',actionOrdinal:1,playerSlot:-1,
      turnBefore:4,turnAfter:0},
    {...card(0,1,2),turnAfter:1},
    {...card(0,1,3),turnAfter:1}
  ];
  const reset=[{actionOrdinal:1,action:'ResolvePromptAction',
    fromTurn:4,toTurn:0,afterSuddenDeath:true,enteredSetup:true}];
  const result=audit(roots,reset);
  assert.equal(result.acceptedOncePerSeatTurn,false);
  assert.deepEqual(result.duplicateAcceptedBySeatTurn,
    [{epoch:1,seat:0,turn:1,count:2}]);
});

test('unsupported clock reversal or forged reset must fail closed',()=>{
  const roots=[
    {...card(1,1,0),turnAfter:1},
    {action:'ResolvePromptAction',actionOrdinal:1,playerSlot:-1,
      turnBefore:4,turnAfter:0},
    {...card(1,1,2),turnAfter:1}
  ];
  assert.throws(()=>audit(roots),/Unverified backwards turn transition/);
  assert.throws(()=>audit(roots,[{actionOrdinal:1,
    action:'ResolvePromptAction',fromTurn:4,toTurn:0,
    afterSuddenDeath:false,enteredSetup:true}]),/Unauthenticated/);
  assert.throws(()=>audit(roots,[{actionOrdinal:0,
    action:'PlayCardAction',fromTurn:1,toTurn:0,
    afterSuddenDeath:true,enteredSetup:true}]),/Unauthenticated/);
  assert.throws(()=>audit([card(0,3,0),card(0,1,1)]),
    /Clock reversal without authenticated/);
});
