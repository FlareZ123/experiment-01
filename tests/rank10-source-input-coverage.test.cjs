'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {inputCoverageReport}=require('../simulation/twinleaf/rank10-source-branch-transcript.cjs');

test('coverage counts only actions with portable input envelopes',()=>{
  const events=[
    {step:0,action:'AddPlayerAction',before:{turn:0},typedAction:{}},
    {step:1,action:'ResolvePromptAction',before:{turn:2},
      promptReplayAction:{schema:'source-prompt-action-v1'}},
    {step:2,action:'ResolvePromptAction',before:{turn:3},
      pendingPrompt:{kind:'ChooseOptionPrompt'},typedActionError:'Class instance'},
    {step:3,action:'ResolvePromptAction',before:{turn:3},
      pendingPrompt:{kind:'ChooseOptionPrompt'},
      typedActionError:'Class instance',promptReplayUnsupported:'ChooseOptionPrompt'},
    {step:4,action:'PlayCardAction',before:{turn:4},typedAction:{}}
  ];
  const r=inputCoverageReport(events);
  assert.equal(r.represented,3);
  assert.equal(r.unrepresented,2);
  assert.equal(r.firstGaps[0].step,2);
  assert.equal(r.firstGaps[1].unsupportedKind,'ChooseOptionPrompt');
  assert.deepEqual(r.byAction.map(x=>x.count),[1,1]);
  assert.equal(r.byAction.reduce((sum,x)=>sum+x.count,0),2);
});

test('zero valid inputs are reported explicitly',()=>{
  const r=inputCoverageReport([
    {step:0,action:'PassTurnAction',before:{turn:1},typedActionError:'Unsupported'}
  ]);
  assert.equal(r.represented,0);
  assert.equal(r.unrepresented,1);
});
