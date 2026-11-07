'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {stageRules,requiredTurnsAfterCall,adjudicateAtPrescribedEnd,
  adjudicateExtension,classifyTiebreaker} =
  require('../simulation/evaluation/agent27-aichi-open-time-adjudication.cjs');

test('Open Swiss and Top32 preliminary elimination are 25 minutes, final 35',()=>{
  assert.equal(stageRules('open-swiss').minutes,25);
  assert.equal(stageRules('open-top32').minutes,25);
  assert.equal(stageRules('open-final').minutes,35);
  assert.equal(stageRules('open-swiss').elimination,false);
  assert.equal(stageRules('open-top32').elimination,true);
  assert.throws(()=>stageRules('master-preliminary'),/Unknown/);
});

test('Time called during first starter turn: finish it then second turn',()=>{
  for(const firstPlayerSeat of [0,1]){
    const result=requiredTurnsAfterCall({stage:'open-swiss',firstPlayerSeat,
      turnOwnerWhenCalled:firstPlayerSeat});
    assert.equal(result.additionalSecondPlayerTurns,1);
    assert.equal(result.lastTurnSeat,1-firstPlayerSeat);
    assert.equal(result.applyPokemonCheckupAfterLastTurn,false);
  }
});

test('Time called during second starter turn: finish it, no extra turn',()=>{
  const result=requiredTurnsAfterCall({stage:'open-top32',
    firstPlayerSeat:1,turnOwnerWhenCalled:0});
  assert.equal(result.additionalSecondPlayerTurns,0);
  assert.equal(result.lastTurnSeat,0);
  assert.equal(result.clockLimitMinutes,25);
});

test('Native root cap before final prescribed turn does not adjudicate',()=>{
  const result=adjudicateAtPrescribedEnd({stage:'open-swiss',
    prizesRemaining:[1,5],secondPlayerTurnFinished:false});
  assert.equal(result.status,'AWAITING_PRESCRIBED_SECOND_TURN');
  assert.equal(result.conditionalWinnerSeat,null);
  assert.equal(result.competitiveAdmission,false);
});

test('Swiss timeout unresolved: BOTH lose, even with five-Prize advantage',()=>{
  const result=adjudicateAtPrescribedEnd({stage:'open-swiss',
    prizesRemaining:[1,6],secondPlayerTurnFinished:true});
  assert.equal(result.status,'SWISS_BOTH_LOSE');
  assert.equal(result.conditionalWinnerSeat,null);
});

test('Ordinary validated paper win is preserved during final permitted turn',()=>{
  const result=adjudicateAtPrescribedEnd({stage:'open-swiss',
    prizesRemaining:[0,6],secondPlayerTurnFinished:true,paperGameWinner:0});
  assert.equal(result.status,'NORMAL_PAPER_GAME_WIN');
  assert.equal(result.conditionalWinnerSeat,0);
  assert.equal(result.competitiveAdmission,false);
});

test('Top32 time branch: if one side has <=2 Prizes, lower side wins',()=>{
  for(const [prizes,expected] of [[[2,3],0],[[4,1],1],[[1,6],0]]){
    const r=adjudicateAtPrescribedEnd({stage:'open-top32',
      prizesRemaining:prizes,secondPlayerTurnFinished:true});
    assert.equal(r.status,'ELIMINATION_PRIZE_LEAD');
    assert.equal(r.conditionalWinnerSeat,expected);
  }
});

test('Top32 time branch: both tied at <=2 requires extension',()=>{
  for(const prizes of [[2,2],[1,1],[0,0]]){
    const r=adjudicateAtPrescribedEnd({stage:'open-top32',
      prizesRemaining:prizes,secondPlayerTurnFinished:true});
    assert.equal(r.status,'EXTENSION_REQUIRED_TIED_LOW');
    assert.equal(r.extensionRule,'tied-low');
  }
});

test('Top32 time branch: both >=3 requires extension regardless initial lead',()=>{
  for(const prizes of [[3,3],[3,4],[6,5]]){
    const r=adjudicateAtPrescribedEnd({stage:'open-top32',
      prizesRemaining:prizes,secondPlayerTurnFinished:true});
    assert.equal(r.status,'EXTENSION_REQUIRED_BOTH_HIGH');
    assert.equal(r.extensionRule,'both-high');
  }
});

test('Elimination final uses same prize logic with 35-minute clock',()=>{
  const r=adjudicateAtPrescribedEnd({stage:'open-final',
    prizesRemaining:[2,4],secondPlayerTurnFinished:true});
  assert.equal(r.clockLimitMinutes,35);
  assert.equal(r.status,'ELIMINATION_PRIZE_LEAD');
  assert.equal(r.conditionalWinnerSeat,0);
});

test('Low tied extension ends at first divergent Prize count',()=>{
  assert.equal(adjudicateExtension({extensionRule:'tied-low',
    prizesRemaining:[2,2]}).status,'EXTENSION_CONTINUES');
  assert.equal(adjudicateExtension({extensionRule:'tied-low',
    prizesRemaining:[1,2]}).conditionalWinnerSeat,0);
  assert.equal(adjudicateExtension({extensionRule:'tied-low',
    prizesRemaining:[2,1]}).conditionalWinnerSeat,1);
});

test('Both-high extension requires lead AND <=2 remaining Prizes',()=>{
  for(const prizes of [[3,4],[3,3],[2,2],[5,5]])
    assert.equal(adjudicateExtension({extensionRule:'both-high',
      prizesRemaining:prizes}).status,'EXTENSION_CONTINUES');
  const a=adjudicateExtension({extensionRule:'both-high',
    prizesRemaining:[2,3]});
  assert.equal(a.status,'EXTENSION_WIN');
  assert.equal(a.conditionalWinnerSeat,0);
  const b=adjudicateExtension({extensionRule:'both-high',
    prizesRemaining:[3,1]});
  assert.equal(b.conditionalWinnerSeat,1);
});

test('Normal paper victory during an extension terminates it regardless Prizes',()=>{
  const x=adjudicateExtension({extensionRule:'both-high',
    prizesRemaining:[3,6],paperGameWinner:0});
  assert.equal(x.status,'NORMAL_PAPER_GAME_WIN');
  assert.equal(x.conditionalWinnerSeat,0);
});

test('Tied knockout game tiebreaker starts with six and first Prize lead wins',()=>{
  assert.equal(classifyTiebreaker([6,6]).conditionalWinnerSeat,null);
  assert.equal(classifyTiebreaker([5,6]).conditionalWinnerSeat,0);
  assert.equal(classifyTiebreaker([6,5]).conditionalWinnerSeat,1);
  assert.equal(classifyTiebreaker([5,5]).status,'TIEBREAKER_CONTINUES');
});

test('Reject missing or invalid physical Prize state and unknown result',()=>{
  assert.throws(()=>classifyTiebreaker([1,-1]),/Expected/);
  assert.throws(()=>classifyTiebreaker([7,1]),/Expected/);
  assert.throws(()=>classifyTiebreaker([2]),/Both physical/);
  assert.throws(()=>adjudicateAtPrescribedEnd({stage:'open-swiss',
    prizesRemaining:[2,2],secondPlayerTurnFinished:true,
    paperGameWinner:2}));
  assert.throws(()=>requiredTurnsAfterCall({stage:'open-top32',
    firstPlayerSeat:3,turnOwnerWhenCalled:0}));
});
