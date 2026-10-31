'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {CLOCK_MINUTES,endCallPlan,classifyAfterTime,
  overtimePrizeWinner}=require(
  '../simulation/evaluation/agent5-aichi-open-time-adjudication.cjs');

const ended=(round,prizesRemaining,more={})=>({
  round,prizesRemaining,reliableClockWitness:true,
  terminalSecondTurnSettled:true,nativeWinnerSeat:null,...more
});

test('official Open Swiss is 25 minutes and unfinished games are two losses',()=>{
  assert.equal(CLOCK_MINUTES.swiss,25);
  for(const prizesRemaining of [[6,6],[1,5],[5,1],[2,2]]){
    const r=classifyAfterTime(ended('swiss',prizesRemaining));
    assert.equal(r.status,'both-players-lose-on-time');
    assert.equal(r.winnerSeat,null);
    assert.equal(r.nominalMinutes,25);
  }
});

test('end-of-time turn closure always ends on the second starter',()=>{
  for(const firstSeat of [0,1]){
    const second=1-firstSeat;
    const duringFirst=endCallPlan(firstSeat,firstSeat);
    assert.deepEqual(duringFirst.extraFullTurnSeats,[second]);
    assert.equal(duringFirst.terminalTurnSeat,second);
    assert.equal(duringFirst.includeCheckupAfterTerminalTurn,false);
    const duringSecond=endCallPlan(firstSeat,second);
    assert.deepEqual(duringSecond.extraFullTurnSeats,[]);
    assert.equal(duringSecond.terminalTurnSeat,second);
    assert.equal(duringSecond.includeCheckupAfterTerminalTurn,false);
  }
});

test('Top32 elimination cutoff is separate from 25-minute Swiss',()=>{
  assert.equal(CLOCK_MINUTES.top32,25);
  assert.equal(CLOCK_MINUTES.final,35);
  for(const round of ['top32','final']){
    const winnerA=classifyAfterTime(ended(round,[2,4]));
    assert.equal(winnerA.status,'elimination-prize-lead-win');
    assert.equal(winnerA.winnerSeat,0);
    const winnerB=classifyAfterTime(ended(round,[5,1]));
    assert.equal(winnerB.status,'elimination-prize-lead-win');
    assert.equal(winnerB.winnerSeat,1);
  }
});

test('tied two-Prize or both at least three require overtime',()=>{
  const tie=classifyAfterTime(ended('top32',[2,2]));
  assert.equal(tie.status,'elimination-continue-overtime');
  assert.equal(tie.overtimeRule,'first-strict-prize-lead-or-natural-win');
  assert.equal(overtimePrizeWinner([2,2],tie.overtimeRule),null);
  assert.equal(overtimePrizeWinner([1,2],tie.overtimeRule),0);
  assert.equal(overtimePrizeWinner([2,1],tie.overtimeRule),1);

  const high=classifyAfterTime(ended('top32',[3,4]));
  assert.equal(high.status,'elimination-continue-overtime');
  assert.equal(high.overtimeRule,
    'reach-two-or-fewer-with-strict-lead-or-natural-win');
  assert.equal(overtimePrizeWinner([3,4],high.overtimeRule),null);
  assert.equal(overtimePrizeWinner([2,4],high.overtimeRule),0);
  assert.equal(overtimePrizeWinner([4,2],high.overtimeRule),1);
  assert.equal(overtimePrizeWinner([2,2],high.overtimeRule),null);
});

test('the clock and mandatory final turn must be witnessed before qualifying',()=>{
  const noClock=classifyAfterTime(ended('top32',[2,4],{
    reliableClockWitness:false,nativeWinnerSeat:0}));
  assert.equal(noClock.status,'unqualified-clock-not-measured');
  assert.equal(noClock.winnerSeat,null);
  const moreTurn=classifyAfterTime(ended('top32',[2,4],{
    terminalSecondTurnSettled:false}));
  assert.equal(moreTurn.status,'await-end-of-second-player-turn');
  assert.equal(moreTurn.winnerSeat,null);
  const natural=classifyAfterTime(ended('swiss',[0,6],{
    nativeWinnerSeat:0}));
  assert.equal(natural.status,'native-natural-win');
  assert.equal(natural.winnerSeat,0);
});

test('invalid stage and fabricated Prize counts are rejected',()=>{
  assert.throws(()=>classifyAfterTime(ended('retrospective',[2,4])));
  assert.throws(()=>classifyAfterTime(ended('top32',[2,-1])));
  assert.throws(()=>endCallPlan(3,0));
});
