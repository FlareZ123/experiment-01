'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {STAGES,timeCall,regulationDecision,overtimeDecision}=require(
  '../simulation/evaluation/aichi-open-official-clock.cjs');

test('official Open qualifier and Top32 clocks differ from final',()=>{
 assert.equal(STAGES['open-swiss'].minutes,25);
 assert.equal(STAGES['open-top32'].minutes,25);
 assert.equal(STAGES['open-final'].minutes,35);
});
test('first-player time-call requires a final second-player turn',()=>{
 const s=timeCall('open-top32',true);
 assert.equal(s.nextRequiredTurn,'SECOND_PLAYER_ADDITIONAL_TURN');
 assert.equal(s.pokemonCheckupAfterFinalTurn,false);
});
test('second-player time-call completes current turn without Checkup',()=>{
 const s=timeCall('open-swiss',false);
 assert.equal(s.nextRequiredTurn,'COMPLETE_CURRENT_SECOND_PLAYER_TURN');
 assert.equal(s.pokemonCheckupAfterFinalTurn,false);
});
test('official Swiss timeout without a winner is both losses',()=>{
 assert.deepEqual(regulationDecision('open-swiss',1,6),
  {status:'BOTH_LOSE',reason:'SWISS_TIME_WITHOUT_WINNER'});
});
test('ordinary knockout win takes priority even at end call',()=>{
 assert.deepEqual(regulationDecision('open-top32',4,5,'second'),
  {status:'WINNER',winner:'second',reason:'NORMAL_GAME_CONDITION'});
});
test('Top32 cutoff low-prize leader wins',()=>{
 assert.deepEqual(regulationDecision('open-top32',2,3),
  {status:'WINNER',winner:'first',reason:'TOP32_CUTOFF_FEWER_PRIZES_TO_WIN'});
 assert.equal(regulationDecision('open-top32',5,1).winner,'second');
});
test('Top32 cutoff equal low prizes needs overtime until a prize lead',()=>{
 const s=regulationDecision('open-top32',2,2);
 assert.equal(s.mode,'FIRST_PRIZE_LEAD');
 assert.equal(overtimeDecision(s.mode,2,2).status,'CONTINUE_OVERTIME');
 assert.equal(overtimeDecision(s.mode,2,1).winner,'second');
});
test('Top32 cutoff both >=3 needs overtime to two with a lead',()=>{
 const s=regulationDecision('open-top32',3,4);
 assert.equal(s.mode,'REACH_TWO_AND_LEAD');
 assert.equal(overtimeDecision(s.mode,3,4).status,'CONTINUE_OVERTIME');
 assert.equal(overtimeDecision(s.mode,2,2).status,'CONTINUE_OVERTIME');
 assert.equal(overtimeDecision(s.mode,2,3).winner,'first');
});
test('six-prize fresh tiebreak for ordinary tied knockout game',()=>{
 assert.equal(regulationDecision('open-final',3,3,'tie').status,
  'NEW_SIX_PRIZE_TIEBREAKER');
 assert.equal(overtimeDecision('FIRST_PRIZE_LEAD',2,2,'tie').status,
  'NEW_SIX_PRIZE_TIEBREAKER');
});
test('Swiss ordinary tie needs its separate ruling, never a fabricated victory',()=>{
 assert.equal(regulationDecision('open-swiss',5,6,'tie').status,
   'SWISS_TIE_NEEDS_SEPARATE_RULING');
});
test('fail-closed unobserved ordinary terminal with zero Prize count',()=>{
 assert.throws(()=>regulationDecision('open-top32',0,2));
 assert.throws(()=>overtimeDecision('FIRST_PRIZE_LEAD',2,0));
});
test('fail-closed invalid stage, role, normal result and overtime mode',()=>{
 assert.throws(()=>timeCall('standard-cut',true));
 assert.throws(()=>timeCall('open-final','first'));
 assert.throws(()=>regulationDecision('open-top32',4,4,'unknown'));
 assert.throws(()=>overtimeDecision('something',2,2));
});
