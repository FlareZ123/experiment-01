'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {
  paperReplayFirstLeadWitness
}=require('../simulation/evaluation/agent24-native-replay-first-lead-witness.cjs');

const PLAYER_TURN=3;

/**
 * @param {[number,number]} remaining
 * @param {boolean} replay
 * @returns {object}
 */
function state(remaining,replay=true){
  return {
    isSuddenDeath:replay,phase:PLAYER_TURN,turn:2,prompts:[],
    players:remaining.map(n=>({
      active:{cards:[{}]},
      prizes:Array.from({length:6},(_,i)=>({
        cards:i<n?[{}]:[]
      }))
    }))
  };
}
/** @param {object} stateArg @param {object} [extra] */
function judge(stateArg,extra={}){
  return paperReplayFirstLeadWitness({
    state:stateArg,playerTurnPhase:PLAYER_TURN,
    authenticatedReplayEpoch:true,
    originalActionSettled:true,...extra
  });
}

test('both native physical seats win at their first strict replay Prize lead',()=>{
  for(const [remaining,expected] of [[[5,6],0],[[6,5],1],
    [[2,3],0],[[3,2],1]]){
    const receipt=judge(state(remaining));
    assert.equal(receipt.status,'PAPER_REPLAY_FIRST_PRIZE_LEAD');
    assert.equal(receipt.paperWinnerSeat,expected);
    assert.equal(receipt.paperGameOutcomeQualified,false);
    assert.deepEqual(receipt.remainingPrizesBySeat,remaining);
  }
});

test('equal Prize totals, including a new six-Prize setup, have no winner',()=>{
  for(const remaining of [[6,6],[5,5],[0,0]]){
    const receipt=judge(state(remaining));
    assert.equal(receipt.status,'NO_STRICT_PRIZE_LEAD');
    assert.equal(receipt.paperWinnerSeat,null);
  }
});

test('absence of genuine replay epoch vetoes an otherwise exact lead',()=>{
  const receipt=judge(state([5,6]),{
    authenticatedReplayEpoch:false
  });
  assert.equal(receipt.status,'REPLAY_EPOCH_UNVERIFIED');
  assert.equal(receipt.paperWinnerSeat,null);
});

test('ordinary first Prize never ends a non-tiebreak game',()=>{
  const receipt=judge(state([5,6],false));
  assert.equal(receipt.status,'NATIVE_REPLAY_STATE_UNVERIFIED');
  assert.equal(receipt.paperWinnerSeat,null);
});

test('unsettled prompt, wrong phase or missing accepted root does not stop',()=>{
  const open=state([5,6]);
  open.prompts=[{result:undefined}];
  assert.equal(judge(open).status,'REPLAY_ROOT_NOT_SETTLED');
  assert.equal(judge(state([5,6]),{originalActionSettled:false})
    .status,'REPLAY_ROOT_NOT_SETTLED');
  const wrong=state([5,6]);wrong.phase=2;
  assert.equal(judge(wrong).status,'REPLAY_ROOT_NOT_SETTLED');
});

test('invalid six-Prize replay board never becomes a positive witness',()=>{
  const noPrize=state([5,6]);noPrize.players[0].prizes=[];
  assert.equal(judge(noPrize).status,'SIX_PRIZE_REPLAY_BOARD_UNVERIFIED');
  const noActive=state([5,6]);noActive.players[0].active.cards=[];
  assert.equal(judge(noActive).status,'SIX_PRIZE_REPLAY_BOARD_UNVERIFIED');
  const double=state([5,6]);double.players[0].prizes[0].cards=[{},{}];
  assert.equal(judge(double).status,'SIX_PRIZE_REPLAY_BOARD_UNVERIFIED');
});

test('witness is observational and never modifies native state',()=>{
  const before=state([5,6]),copy=JSON.stringify(before);
  const receipt=judge(before);
  assert.equal(receipt.status,'PAPER_REPLAY_FIRST_PRIZE_LEAD');
  assert.equal(JSON.stringify(before),copy);
});
