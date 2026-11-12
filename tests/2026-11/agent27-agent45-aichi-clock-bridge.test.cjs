'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  aichiClockProtocolSha256,inspectOfficialAichiClock
}=require('../../simulation/evaluation/agent45-aichi-clock-receipt.cjs');

function noCallTrial(stage,{winner=null,tie=false}={}){
  const paperReceiptId='paper-terminal-proof';
  return {
    eventStage:stage,
    clockDisposition:'no-official-call',
    paperReceiptId,
    clockReceiptId:null,
    adjudicationProtocolSha:aichiClockProtocolSha256(),
    noCallClockPacket:{
      stage,
      officialEndCallObserved:false,
      elapsedSecondsAtNaturalTerminal:300,
      officialClockCoverageEvidenceRef:'continuous-official-clock',
      stageEvidenceRef:'official-stage-and-pairing',
      paperTerminalEvidenceRef:paperReceiptId,
      independentReviewEvidenceRef:'independent-clock-and-paper-review',
      noCallCoverageIndependentlyReviewed:true,
      paperStateIndependentlyReviewed:true,
      paperGameWinner:winner,
      paperGameTie:tie
    }
  };
}

function officialCallTrial(stage,{winner=null,tie=false,prizes=[3,3]}={}){
  const paperReceiptId='paper-terminal-proof';
  const clockReceiptId='official-clock-call';
  const elapsedSecondsAtOfficialCall=stage==='open-final'?2100:1500;
  return {
    eventStage:stage,
    clockDisposition:'official-call',
    paperReceiptId,
    clockReceiptId,
    adjudicationProtocolSha:aichiClockProtocolSha256(),
    timeCallPacket:{
      stage,
      officialEndCallObserved:true,
      elapsedSecondsAtOfficialCall,
      officialClockEvidenceRef:clockReceiptId,
      stageEvidenceRef:'official-stage-and-pairing',
      firstPlayerSeat:0,
      firstPlayerEvidenceRef:'original-first-player',
      turnOwnerWhenCalled:0,
      turnOwnerWhenCalledEvidenceRef:'call-turn-owner',
      turnSequenceEvidenceRef:'ordered-paper-turn-sequence',
      independentPaperStateEvidenceRef:paperReceiptId,
      paperStateIndependentlyReviewed:true,
      prizesRemaining:prizes,
      paperGameWinner:winner,
      paperGameTie:tie
    }
  };
}

test('no-call natural paper win is accepted only with the continuous official-clock packet',()=>{
  const result=inspectOfficialAichiClock(noCallTrial('open-top32',{winner:0}));
  assert.equal(result.shapeComplete,true);
  assert.equal(result.status,'NORMAL_PAPER_GAME_WIN');
  assert.equal(result.winnerSeat,0);
  assert.equal(result.outcome,'paper-win');
  assert.equal(result.competitiveAdmission,false);
});

test('no-call natural knockout tie remains a six-Prize tiebreaker requirement, never a winner',()=>{
  for(const stage of ['open-top32','open-final']){
    const result=inspectOfficialAichiClock(noCallTrial(stage,{tie:true}));
    assert.equal(result.shapeComplete,false,stage);
    assert.equal(result.status,'TIEBREAKER_REQUIRED_SIX_PRIZE',stage);
    assert.equal(result.winnerSeat,null,stage);
    assert.equal(result.competitiveAdmission,false,stage);
  }
});

test('no-call natural Swiss tie remains explicitly unresolved, not Swiss post-call both-loss',()=>{
  const result=inspectOfficialAichiClock(noCallTrial('open-swiss',{tie:true}));
  assert.equal(result.shapeComplete,false);
  assert.equal(result.status,'PRE_CALL_NATURAL_TIE_UNSPECIFIED');
  assert.equal(result.winnerSeat,null);
  assert.equal(result.competitiveAdmission,false);
});

test('official-call Swiss tie follows the distinct Swiss both-loss rule',()=>{
  const result=inspectOfficialAichiClock(officialCallTrial('open-swiss',{tie:true}));
  assert.equal(result.shapeComplete,true);
  assert.equal(result.status,'SWISS_BOTH_LOSE');
  assert.equal(result.winnerSeat,null);
  assert.equal(result.outcome,'both-loss');
  assert.equal(result.competitiveAdmission,false);
});

test('official-call knockout tie remains a six-Prize tiebreaker requirement',()=>{
  const result=inspectOfficialAichiClock(officialCallTrial('open-top32',{tie:true}));
  assert.equal(result.shapeComplete,false);
  assert.equal(result.status,'TIEBREAKER_REQUIRED_SIX_PRIZE');
  assert.equal(result.winnerSeat,null);
  assert.equal(result.competitiveAdmission,false);
});
