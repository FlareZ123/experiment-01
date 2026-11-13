'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  coinFlipResultForFirstPlayer,
  summarizeGame
}=require('../../simulation/evaluation/2026-11/agent36-flittle-mcts-native-pilot.cjs');

class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class MockSimulator {
  constructor() {
    const state={activePlayer:null};
    this.store={
      state,
      dispatch(action) {
        this.state.activePlayer=action.result===true?0:1;
      }
    };
  }
}
const bindings={
  Simulator:MockSimulator,
  ResolvePromptAction,
  BotFlipMode:{RANDOM:'random'},
  BotShuffleMode:{RANDOM:'random'}
};

test('coin-flip fixture control chooses the native result that makes the requested seat first',()=>{
  const previous=Math.random;
  const forSeatOne=coinFlipResultForFirstPlayer({},7,1,{},bindings);
  assert.equal(forSeatOne.result,false);
  assert.equal(forSeatOne.seatIfTrue,0);
  assert.equal(forSeatOne.seatIfFalse,1);
  const forSeatZero=coinFlipResultForFirstPlayer({},7,0,{},bindings);
  assert.equal(forSeatZero.result,true);
  assert.equal(Math.random,previous);
});

test('pilot summary joins the selected MCTS key to the accepted candidate Store root',()=>{
  const game={
    schema:'aichi-native-fixture-game-v1',
    fixtureOnly:true,admissionEligible:false,competitiveGameQualified:false,
    seed:20261114,seed32:20261114,candidateSeat:1,originalSourceSeat:0,
    actualFirstPlayerSeat:0,actions:8,turns:2,finished:false,
    endReason:'fixture-action-cap',winnerSeat:null,
    actionCountsBySeat:[4,4],
    decisionTraceSha256:'a'.repeat(64),rootActionLedgerSha256:'b'.repeat(64),
    decisionTrace:[{
      actionOrdinal:7,actingSeat:1,isRootDecision:true,
      actionName:'AttackAction',dispatchStatus:'succeeded',
      actionPayloadSha256:'c'.repeat(64)
    }],
    rootActionLedger:[{
      actionOrdinal:7,playerSlot:1,isRootDecision:true,
      action:'AttackAction',dispatchStatus:'succeeded',
      actionPayloadSha256:'c'.repeat(64)
    }]
  };
  const summary=summarizeGame(game,1,'ATTACK_ACTION:Ram');
  assert.equal(summary.acceptedMctsRootAction.actionName,'AttackAction');
  assert.equal(summary.acceptedMctsRootLedger.playerSlot,1);
  assert.equal(summary.competitiveGameQualified,false);
  assert.equal(summary.finished,false);
});

test('pilot summary refuses to attribute an opponent or failed dispatch to MCTS',()=>{
  const game={
    candidateSeat:0,originalSourceSeat:1,actualFirstPlayerSeat:1,
    decisionTrace:[{
      actingSeat:1,isRootDecision:true,actionName:'AttackAction',
      dispatchStatus:'succeeded'
    }]
  };
  const summary=summarizeGame(game,0,'ATTACK_ACTION:Ram');
  assert.equal(summary.acceptedMctsRootAction,null);
});
