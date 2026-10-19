'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createExclusiveClaim}=
  require('../simulation/twinleaf/rank11-exclusive-openers.cjs');

test('the first eligible source opening exclusively owns the turn',()=>{
  for(const firstKind of ['direct','held-seal']) {
    const secondKind=firstKind==='direct'?'held-seal':'direct';
    const {claim,audit}=createExclusiveClaim();
    const state={turn:1},owner={id:101};
    const first={route:'vip',tool:'Float Stone'};
    assert.equal(claim(firstKind,state,owner,first),true);
    assert.deepEqual(audit.selected,{kind:firstKind,turn:1,route:'vip',
      tool:'Float Stone',sourcePlayerId:101});
    assert.equal(claim(firstKind,{turn:2},owner,{route:'hand',tool:'Muscle Band'}),true);
    assert.equal(claim(secondKind,{turn:2},owner,{route:'hand',tool:'Muscle Band'}),false);
    assert.equal(audit.blockedOtherRoute,1);
    assert.deepEqual(audit.competing,[{kind:secondKind,turn:2,
      route:'hand',blockedBy:firstKind}]);
    assert.equal(audit.selected.kind,firstKind);
    assert.equal(audit.selected.turn,1);
  }
});

test('the bounded competing-claim log never overrides the original owner',()=>{
  const {claim,audit}=createExclusiveClaim();
  const state={turn:1},owner={id:202};
  assert.equal(claim('held-seal',state,owner,{route:'bench',tool:'Forest Seal Stone'}),true);
  for(let i=0;i<12;i++) {
    assert.equal(claim('direct',{turn:2+i},owner,{route:'vip',tool:'Muscle Band'}),false);
  }
  assert.equal(audit.blockedOtherRoute,12);
  assert.equal(audit.competing.length,8);
  assert.equal(audit.selected.kind,'held-seal');
  assert.equal(audit.competing[7].turn,9);
});
