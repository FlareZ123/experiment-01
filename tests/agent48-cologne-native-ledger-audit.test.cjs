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
  assert.deepEqual(r.duplicateAcceptedBySeatTurn,[{seat:1,turn:5,count:2}]);
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
