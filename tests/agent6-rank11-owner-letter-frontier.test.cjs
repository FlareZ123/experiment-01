'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {LETTER,DARK,chooseRank11Letter}=
  require('../simulation/twinleaf/agent6-rank11-owner-letter-frontier.cjs');
const original={darknessCopies:8,letterCopies:4};
function view(seat=0){return {actorSeat:seat,decisionKind:'owner-root',
  globalTurn:1,ownHand:['Mega Absol ex MEG',LETTER],ownerK1:null,
  ownPublic:{active:{printing:'Mega Absol ex MEG',energies:[]},
    bench:[{printing:'Trubbish FST',energies:[]}],
    deckCount:45,prizeCount:6,discard:[],lostZone:[],
    publicTurnRestrictions:{itemPlayLocked:false}},
  ownTurnResources:{itemPlayLocked:false}};}

test('pure both-seat, source hand-paid Letter selection',()=>{
  const expected={kind:'play-professors-letter',
    printing:LETTER,handIndex:1};
  assert.deepEqual(chooseRank11Letter(view(0),original),expected);
  assert.deepEqual(chooseRank11Letter(view(1),original),expected);
});
test('first-turn, public zone, search inventory and Item lock vetoes',()=>{
  const variants=[
    v=>v.ownHand.push(DARK),
    v=>{v.ownTurnResources.itemPlayLocked=true;},
    v=>{v.ownPublic.publicTurnRestrictions.itemPlayLocked=true;},
    v=>v.ownPublic.discard.push(DARK),
    v=>v.ownPublic.lostZone.push(DARK),
    v=>v.ownPublic.bench[0].energies.push(DARK),
    v=>v.ownPublic.active.energies.push(DARK),
    v=>{v.globalTurn=3;},
    v=>{v.ownPublic.deckCount=0;},
    v=>v.ownHand.pop()
  ];
  for(const mutate of variants){
    const state=view();mutate(state);
    assert.equal(chooseRank11Letter(state,original),null);
  }
  assert.equal(chooseRank11Letter(view(),
    {darknessCopies:7,letterCopies:4}),null);
});
test('frozen K0 owner view retains privacy and input identity',()=>{
  const v=view();
  const freeze=x=>{if(x&&typeof x==='object'){
    Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
  freeze(v);
  assert.equal(chooseRank11Letter(v,original)?.handIndex,1);
  assert.equal(v.ownPublic.discard.length,0);
});
