'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createPublicMulliganRevealObserver}=
  require('../simulation/evaluation/public-mulligan-reveal-observer.cjs');
const GamePhase={SETUP:0,DRAW:1,PLAYER_TURN:2};
const GameMessage={
  SETUP_OPPONENT_NO_BASIC:'opponent-no-basic',
  SETUP_PLAYER_NO_BASIC:'own-no-basic'
};
class ShowMulliganPrompt {
  constructor(playerId,message,hands) {
    this.playerId=playerId;this.message=message;this.hands=hands;
  }
}
const make=()=>createPublicMulliganRevealObserver({
  GamePhase,GameMessage,ShowMulliganPrompt
});
const hand=name=>Array.from({length:7},(_,i)=>({fullName:name+'-'+i}));
const state=()=>({phase:GamePhase.SETUP,players:[{id:101},{id:202}]});
const opponent=(viewer,hands)=>new ShowMulliganPrompt(
  viewer,GameMessage.SETUP_OPPONENT_NO_BASIC,hands);

test('exact seven source printings belong only to opposing viewer prompt',()=>{
  const o=make(),s=state();
  o.observe(s,opponent(202,[hand('Plumeria')]));
  s.phase=GamePhase.PLAYER_TURN;o.observe(s,null);
  assert.deepEqual(o.result().revealedHandCounts,[1,0]);
  assert.deepEqual(o.result().handsByOwner[0][0],
    hand('Plumeria').map(c=>c.fullName));
  assert.equal(o.result().excludesPrivateCurrentHandDeckPrize,true);
});

test('both players can reveal several physical invalid opening hands',()=>{
  const o=make(),s=state();
  o.observe(s,opponent(202,[hand('sourceA'),hand('sourceB')]));
  o.observe(s,opponent(101,[hand('candidate')]));
  s.phase=GamePhase.PLAYER_TURN;o.observe(s,null);
  assert.deepEqual(o.result().revealedHandCounts,[2,1]);
  assert.equal(o.result().handsByOwner[0][1][2],'sourceB-2');
  assert.equal(o.result().handsByOwner[1][0][2],'candidate-2');
  assert.ok(Object.isFrozen(o.result().handsByOwner[0][1]));
});

test('owner-facing duplicate ShowMulliganPrompt is excluded',()=>{
  const o=make(),s=state();
  o.observe(s,new ShowMulliganPrompt(
    101,GameMessage.SETUP_PLAYER_NO_BASIC,[hand('source')]));
  o.observe(s,opponent(202,[hand('source')]));
  s.phase=GamePhase.PLAYER_TURN;o.observe(s,null);
  assert.deepEqual(o.result().revealedHandCounts,[1,0]);
});

test('read-only public observer never accesses current hidden zones',()=>{
  const o=make(),poison=id=>({
    id,
    get hand(){throw Error('private-hand-read')},
    get deck(){throw Error('private-deck-read')},
    get prizes(){throw Error('private-prizes-read')}
  });
  const s={phase:GamePhase.SETUP,players:[poison(101),poison(202)]};
  o.observe(s,opponent(202,[hand('public')]));
  s.phase=GamePhase.PLAYER_TURN;o.observe(s,null);
  assert.equal(o.result().handsByOwner[0][0][0],'public-0');
});

test('no mulligans gives empty per-owner immutable history',()=>{
  const o=make(),s=state();o.observe(s,null);
  assert.equal(o.result(),null);
  s.phase=GamePhase.PLAYER_TURN;o.observe(s,null);
  assert.deepEqual(o.result().revealedHandCounts,[0,0]);
  assert.ok(Object.isFrozen(o.result()));
});

test('duplicate opponent display is rejected',()=>{
  const o=make(),s=state(),p=opponent(202,[hand('a')]);
  o.observe(s,p);
  assert.throws(()=>o.observe(s,p),/Duplicate opponent-facing/);
});

test('illegal phase, viewer, hand size, and missing card printing reject',()=>{
  const s=state();s.phase=GamePhase.DRAW;
  assert.throws(()=>make().observe(s,opponent(202,[hand('x')])),
    /outside setup/);
  s.phase=GamePhase.SETUP;
  assert.throws(()=>make().observe(s,opponent(999,[hand('x')])),
    /not a physical player/);
  assert.throws(()=>make().observe(s,opponent(202,[])));
  assert.throws(()=>make().observe(s,opponent(202,[[{fullName:'one'}]])),
    /seven physically/);
  assert.throws(()=>make().observe(s,opponent(202,[
    Array.from({length:7},()=>({name:'secret'}))
  ])),/Missing publicly/);
});

test('the first-turn result cannot be modified by later gameplay',()=>{
  const o=make(),s=state();
  o.observe(s,opponent(101,[hand('original')]));
  s.phase=GamePhase.PLAYER_TURN;o.observe(s,null);
  const first=o.result();
  s.phase=GamePhase.SETUP;o.observe(s,opponent(202,[hand('changed')]));
  assert.equal(o.result(),first);
  assert.deepEqual(o.result().revealedHandCounts,[0,1]);
});
