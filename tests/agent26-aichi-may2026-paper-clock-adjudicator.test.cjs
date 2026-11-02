'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {adjudicateMay2026AichiTime:decide}=
  require('../simulation/evaluation/agent26-aichi-may2026-paper-clock-adjudicator.cjs');

function state(stage,prizeRemaining,overrides={}){
  return {stage,phase:'cutoff',firstPlayerSeat:0,
    afterSecondStartingPlayerTurn:true,prizeRemaining,...overrides};
}

test('Swiss timeout unresolved is simultaneous loss, even with large Prize lead',()=>{
  for(const prizes of [[2,6],[3,6],[1,1],[6,6]]){
    const r=decide(state('swiss',prizes));
    assert.equal(r.status,'SWISS_BOTH_LOSS');
    assert.equal(r.winner,null);
    assert.equal(r.officialClockMinutes,25);
    assert.equal(r.competitiveGameQualified,false);
  }
});

test('Swiss time-call before final second-player turn cannot score a timeout',()=>{
  const r=decide(state('swiss',[2,6],
    {afterSecondStartingPlayerTurn:false}));
  assert.equal(r.status,'AWAIT_SECOND_STARTING_PLAYER_FINAL_TURN');
  assert.equal(r.actorActionAllowed,true);
});

test('knockout on end-of-time call requires at most two Prizes plus strict lead',()=>{
  const cases=[
    [[2,6],0],[[6,2],1],[[1,2],0],[[2,1],1],
    [[3,6],null],[[6,3],null],[[3,3],null],
    [[2,2],null],[[1,1],null],[[6,6],null]
  ];
  for(const [prizes,winner] of cases){
    const r=decide(state('top32',prizes));
    assert.equal(r.winner,winner,prizes.join(':'));
    assert.equal(r.status,winner===null?
      'KNOCKOUT_EXTENSION_REQUIRED':'KNOCKOUT_PAPER_TIME_WIN');
    assert.equal(r.requiresExtension,winner===null);
    assert.equal(r.officialClockMinutes,25);
  }
});

test('knockout extension resolves on threshold midturn, not on raw Prize lead',()=>{
  let r=decide(state('top32',[3,6],
    {phase:'extension',afterSecondStartingPlayerTurn:false}));
  assert.equal(r.status,'KNOCKOUT_EXTENSION_REQUIRED');
  r=decide(state('top32',[2,6],
    {phase:'extension',afterSecondStartingPlayerTurn:false}));
  assert.equal(r.status,'KNOCKOUT_PAPER_TIME_WIN');
  assert.equal(r.winner,0);
  r=decide(state('top32',[2,2],{phase:'extension'}));
  assert.equal(r.status,'KNOCKOUT_EXTENSION_REQUIRED');
});

test('35-minute final has same extension predicate but distinct official clock',()=>{
  const r=decide(state('final',[3,5]));
  assert.equal(r.officialClockMinutes,35);
  assert.equal(r.status,'KNOCKOUT_EXTENSION_REQUIRED');
  const next=decide(state('final',[2,5],{phase:'extension'}));
  assert.equal(next.officialClockMinutes,35);
  assert.equal(next.winner,0);
});

test('natural paper victory or tie precedes any incomplete second-player turn',()=>{
  const one=decide(state('top32',[3,6],
    {naturalOutcome:0,afterSecondStartingPlayerTurn:false}));
  assert.equal(one.status,'NATURAL_PAPER_WIN');
  assert.equal(one.winner,0);
  const tie=decide(state('final',[3,3],
    {naturalOutcome:'tie',afterSecondStartingPlayerTurn:false}));
  assert.equal(tie.status,'PAPER_TIEBREAKER_NEW_SIX_PRIZE_GAME');
  assert.equal(tie.winner,null);
});

test('zero Prize without independently certified ordinary win is held unverified',()=>{
  const r=decide(state('top32',[0,5]));
  assert.equal(r.status,'NATURAL_PAPER_TERMINAL_UNVERIFIED');
  assert.equal(r.winner,null);
});

test('neither 25-minute call nor post-checkup snapshot can qualify a game',()=>{
  const r=decide(state('top32',[2,5]));
  assert.equal(r.paperClockMeasured,false);
  assert.equal(r.competitiveGameQualified,false);
});

test('unreachable round/phase, Prize or first-seat input fail closed',()=>{
  assert.throws(()=>decide(state('swiss',[2,3],{phase:'extension'})),
    assert.AssertionError);
  assert.throws(()=>decide(state('playoffs',[2,3])),assert.AssertionError);
  assert.throws(()=>decide(state('top32',[7,3])),assert.AssertionError);
  assert.throws(()=>decide(state('top32',[2,3],{firstPlayerSeat:2})),
    assert.AssertionError);
});
