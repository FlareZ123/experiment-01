'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {sourcePrizeProgress}=require(
  '../simulation/evaluation/agent18-source-prize-progress.cjs');

test('a settled copied attack with zero damage/Prizes is not a payoff',()=>{
  const p=sourcePrizeProgress({attacks:[{
    actionOrdinal:71,attackName:'Cross Fusion Strike',
    settledPromptChain:true,prizesBefore:[4,6],prizesAfter:[4,6],
    nextSourceSameEpochProven:true
  }]},1);
  assert.equal(p.settledSourceAttacks,1);
  assert.equal(p.sourceAttacksWithNativePrizeProgress,0);
  assert.equal(p.actualSameEpochOpponentReturnsAfterPrizeProgress,0);
  assert.equal(p.fullPaperRuleAuditPassed,false);
});
test('actual source seat and native post-prompt Prize decreases control evidence',()=>{
  const attacks=[
    {actionOrdinal:190,attackName:'Cross Fusion Strike',
      settledPromptChain:true,prizesBefore:[4,6],prizesAfter:[4,5],
      nextSourceSameEpochProven:true},
    {actionOrdinal:209,attackName:'Cross Fusion Strike',
      settledPromptChain:true,prizesBefore:[4,5],prizesAfter:[4,3],
      nextSourceSameEpochProven:true},
    {actionOrdinal:245,attackName:'Cross Fusion Strike',
      settledPromptChain:true,prizesBefore:[4,1],prizesAfter:[4,0],
      nextSourceSameEpochProven:false}
  ];
  const source=sourcePrizeProgress({attacks},1);
  const opponent=sourcePrizeProgress({attacks},0);
  assert.equal(source.sourceAttacksWithNativePrizeProgress,3);
  assert.equal(source.sourcePrizesTakenAcrossObservedAttacks,4);
  assert.equal(source.actualSameEpochOpponentReturnsAfterPrizeProgress,2);
  assert.equal(opponent.sourceAttacksWithNativePrizeProgress,0);
  assert.equal(opponent.sourcePrizesTakenAcrossObservedAttacks,0);
});
test('native prompt chain crossing/reset absence cannot establish Prize payoff',()=>{
  const p=sourcePrizeProgress({attacks:[
    {settledPromptChain:false,prizesBefore:[6,6],
      prizesAfter:[4,6],nextSourceSameEpochProven:true},
    {settledPromptChain:true,prizesBefore:[6,6],
      prizesAfter:[6,6],nextSourceSameEpochProven:true}
  ]},0);
  assert.equal(p.sourceAttacksWithNativePrizeProgress,0);
  assert.equal(p.evaluableSourceAttacks,1);
  assert.throws(()=>sourcePrizeProgress({attacks:[]},2));
});
