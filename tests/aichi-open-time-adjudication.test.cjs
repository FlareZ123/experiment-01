'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,timeLimitMinutes,afterCallTurnWindow,
  adjudicateAfterTimeCall}=
  require('../simulation/evaluation/aichi-open-time-adjudication.cjs');

/** @param {object} [change] */
function row(change={}){
  return {stage:'swiss',verifiedRealClockCall:true,
    finalSecondPlayerTurnCompleted:true,
    finalPokemonCheckupExcluded:true,
    prizesNeededToWinBySeat:[2,3],...change};
}

test('official Open Swiss is 25 minutes with a real unresolved time double-loss',()=>{
  assert.equal(timeLimitMinutes('swiss'),25);
  const resolved=adjudicateAfterTimeCall(row());
  assert.equal(resolved.version,VERSION);
  assert.equal(resolved.status,'swiss-both-players-loss');
  assert.equal(resolved.winningSeat,null);
  assert.equal(resolved.paperClockCertified,false);
});

test('Open main bracket is 25 minutes except the 35-minute final',()=>{
  for(const round of ['round32','round16','quarterfinal','semifinal']){
    assert.equal(timeLimitMinutes('bracket',round),25);
  }
  assert.equal(timeLimitMinutes('bracket','final'),35);
  assert.throws(()=>timeLimitMinutes('bracket'),/assert/);
  assert.throws(()=>timeLimitMinutes('swiss','final'),/null/);
});

test('after-call turn belongs to the player starting second, never final Checkup',()=>{
  assert.deepEqual(afterCallTurnWindow(0,0),{
    firstStartedSeat:0,secondStartedSeat:1,callOnSeat:0,
    finishCurrentTurn:true,additionalSecondPlayerTurn:true,
    finalTurnOwnerSeat:1,finalPokemonCheckupPermitted:false
  });
  assert.deepEqual(afterCallTurnWindow(0,1),{
    firstStartedSeat:0,secondStartedSeat:1,callOnSeat:1,
    finishCurrentTurn:true,additionalSecondPlayerTurn:false,
    finalTurnOwnerSeat:1,finalPokemonCheckupPermitted:false
  });
  assert.equal(afterCallTurnWindow(1,0).finalTurnOwnerSeat,0);
});

test('an engine root cap or unverified time call never becomes a Swiss result',()=>{
  assert.equal(adjudicateAfterTimeCall(row({
    verifiedRealClockCall:false
  })).status,'no-real-time-call-witness');
  assert.equal(adjudicateAfterTimeCall(row({
    finalSecondPlayerTurnCompleted:false
  })).status,'after-call-final-turn-unverified');
  assert.equal(adjudicateAfterTimeCall(row({
    finalPokemonCheckupExcluded:false
  })).status,'after-call-final-turn-unverified');
});

test('bracket after-time Prize lead determines a winner only at or below two',()=>{
  const base={stage:'bracket',bracketRound:'round32'};
  assert.deepEqual(adjudicateAfterTimeCall(row({
    ...base,prizesNeededToWinBySeat:[2,3]
  })),{
    version:VERSION,stage:'bracket',bracketRound:'round32',
    timeLimitMinutes:25,paperClockCertified:false,
    status:'bracket-timeout-prize-lead-win',
    winningSeat:0,prizesNeededToWinBySeat:[2,3]
  });
  assert.equal(adjudicateAfterTimeCall(row({
    ...base,prizesNeededToWinBySeat:[4,1]
  })).winningSeat,1);
  assert.equal(adjudicateAfterTimeCall(row({
    ...base,prizesNeededToWinBySeat:[2,5]
  })).winningSeat,0);
});

test('bracket equal two-Prize need and both three-plus require extension',()=>{
  const base={stage:'bracket',bracketRound:'semifinal'};
  const tied=adjudicateAfterTimeCall(row({
    ...base,prizesNeededToWinBySeat:[2,2]
  }));
  assert.equal(tied.status,'bracket-extension-required');
  assert.equal(tied.extensionRule,'equal-prizes-needed-at-or-below-two');
  const many=adjudicateAfterTimeCall(row({
    ...base,prizesNeededToWinBySeat:[3,4]
  }));
  assert.equal(many.status,'bracket-extension-required');
  assert.equal(many.extensionRule,'both-need-at-least-three');
});

test('normal win after the actual extra turn supersedes time-over lead rules',()=>{
  const normal=adjudicateAfterTimeCall(row({
    stage:'bracket',bracketRound:'final',normalGameWinningSeat:1,
    prizesNeededToWinBySeat:[1,0]
  }));
  assert.equal(normal.timeLimitMinutes,35);
  assert.equal(normal.status,'normal-game-win-after-time-call');
  assert.equal(normal.winningSeat,1);
  assert.equal(adjudicateAfterTimeCall(row({
    normalGameWinningSeat:0,prizesNeededToWinBySeat:[0,4]
  })).status,'normal-game-win-after-time-call');
});

test('missing exact rule inputs and unsupported stages fail closed',()=>{
  assert.throws(()=>adjudicateAfterTimeCall(row({
    stage:'masters',bracketRound:null
  })),/assert/);
  assert.throws(()=>adjudicateAfterTimeCall(row({
    stage:'bracket',bracketRound:null
  })),/assert/);
  assert.throws(()=>adjudicateAfterTimeCall(row({
    prizesNeededToWinBySeat:[0,0]
  })),/No natural winner/);
  assert.throws(()=>adjudicateAfterTimeCall(row({
    prizesNeededToWinBySeat:[7,3]
  })),/assert/);
});

test('an actual drawn game invokes a fresh six-Prize bracket tiebreaker',()=>{
  const knockOutTie=adjudicateAfterTimeCall(row({
    stage:'bracket',bracketRound:'round32',
    prizesNeededToWinBySeat:[0,0],observedNativeDraw:true
  }));
  assert.equal(knockOutTie.status,'bracket-fresh-six-prize-tiebreak-required');
  assert.equal(knockOutTie.winningSeat,null);
  // This first-party event page gives the Swiss rule for unresolved timeout,
  // not a comprehensive independent ordinary-game simultaneous-draw ruling.
  const swissTie=adjudicateAfterTimeCall(row({
    prizesNeededToWinBySeat:[0,0],observedNativeDraw:true
  }));
  assert.equal(swissTie.status,'swiss-native-draw-rule-unverified');
});

test('authentic game-ending win or draw before unused final turn ends immediately',()=>{
  const early=adjudicateAfterTimeCall(row({
    stage:'bracket',bracketRound:'final',normalGameWinningSeat:0,
    prizesNeededToWinBySeat:[0,4],
    finalSecondPlayerTurnCompleted:false,
    finalPokemonCheckupExcluded:false
  }));
  assert.equal(early.status,'normal-game-win-after-time-call');
  assert.equal(early.winningSeat,0);
  const tied=adjudicateAfterTimeCall(row({
    stage:'bracket',bracketRound:'semifinal',observedNativeDraw:true,
    prizesNeededToWinBySeat:[0,0],
    finalSecondPlayerTurnCompleted:false,
    finalPokemonCheckupExcluded:false
  }));
  assert.equal(tied.status,'bracket-fresh-six-prize-tiebreak-required');
});
