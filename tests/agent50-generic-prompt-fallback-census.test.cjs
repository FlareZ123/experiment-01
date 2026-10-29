'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {census,SCHEMA}=
  require('../simulation/evaluation/agent50-generic-prompt-fallback-census.cjs');

/** @param {string} id @param {number} unrecorded @returns {object} */
function row(id,unrecorded=0){
  return {trial:{id,rank:6,candidateId:'champion-reference'},
    sourceSeat:1,candidateSeat:0,
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      genericFallback:{readOnly:true,unrecordedLiveDecodes:unrecorded,
        byOwnerPromptType:{
          '0':{ChooseCardsPrompt:3,WaitPrompt:5,OrderCardsPrompt:2},
          '1':{ChooseCardsPrompt:1,WaitPrompt:7}},
        boundedRecords:[
          {seat:0,promptType:'ChooseCardsPrompt',turn:0,
            phase:1,firstDecoderCallForPrompt:true},
          {seat:1,promptType:'ChooseCardsPrompt',turn:0,
            phase:1,firstDecoderCallForPrompt:true},
          {seat:0,promptType:'ChooseCardsPrompt',turn:2,
            phase:8,firstDecoderCallForPrompt:true}
        ]}}}};
}

test('subtract only genuinely observed setup card choices from full counters',()=>{
  assert.equal(SCHEMA,
    'agent50-native-actor-generic-fallback-setup-excluded-census-v1');
  const x=census([row('A'),row('B',4)]);
  assert.equal(x.arms,2);
  assert.equal(x.totalGenericDecodes,36);
  assert.equal(x.totalSetupChooseCards,4);
  assert.equal(x.totalGameChooseCards,4);
  assert.equal(x.truncatedLiveDecodes,4);
  assert.equal(x.overall.source.gameChooseCards,0);
  assert.equal(x.overall.candidate.gameChooseCards,4);
  assert.equal(x.overall.candidate.promptTypes.OrderCardsPrompt,4);
  assert.equal(x.competitiveQualifiedGames,0);
});

test('fail closed on setup record truncation',()=>{
  const a=row('A',1);
  a.actorOnlyDecisionCoverage.detailedComponentAudits.genericFallback
    .boundedRecords=[{seat:0,turn:0,promptType:'ChooseCardsPrompt',
      phase:1,firstDecoderCallForPrompt:true}];
  assert.throws(()=>census([a]),/Setup classification truncated/);
});

test('fail closed on invisible or repeated opening selection',()=>{
  const a=row('A');
  a.actorOnlyDecisionCoverage.detailedComponentAudits.genericFallback
    .boundedRecords[1].firstDecoderCallForPrompt=false;
  assert.throws(()=>census([a]),/Expected values to be strictly equal/);
  delete a.actorOnlyDecisionCoverage.detailedComponentAudits.genericFallback
    .boundedRecords[1];
  assert.throws(()=>census([a]),/Missing native starting Basic/);
});
