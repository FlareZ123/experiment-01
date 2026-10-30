'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {analyzeFollowthrough}=
  require('../simulation/twinleaf/agent22-steven-followthrough.cjs');

test('search access only credits later same-owner public played names',()=>{
  const selections=[{turn:3,printings:['A','B']}];
  const ledger=[
    {actionOrdinal:11,turnBefore:3,playerSlot:0,
      action:'PlayCardAction',card:'A',pendingPrompt:null},
    {actionOrdinal:12,turnBefore:4,playerSlot:1,
      action:'PlayCardAction',card:'B',pendingPrompt:null},
    {actionOrdinal:14,turnBefore:5,playerSlot:0,
      action:'PlayCardAction',card:'A',pendingPrompt:null},
    {actionOrdinal:15,turnBefore:5,playerSlot:0,
      action:'ResolvePromptAction',card:'B',
      pendingPrompt:'ChooseCardsPrompt'}
  ];
  const r=analyzeFollowthrough(selections,ledger,0);
  assert.deepEqual(r[0].subsequentPrintedPlays,[
    {printing:'A',playedLaterByName:true},
    {printing:'B',playedLaterByName:false}]);
  assert.deepEqual(r[0].laterSourcePlays,
    [{ordinal:14,turn:5,card:'A'}]);
  assert.equal(r[0].opponentRootAfterSearch,true);
  assert.equal(r[0].opponentFirstRootAfterSearch,12);
});

test('same printing chosen twice is not silently counted as two physical uses',()=>{
  const selections=[{turn:3,printings:['A','A']}];
  const ledger=[{actionOrdinal:8,turnBefore:5,playerSlot:1,
    action:'PlayCardAction',card:'A',pendingPrompt:null}];
  const r=analyzeFollowthrough(selections,ledger,0);
  assert.equal(r[0].laterSourcePlays.length,0);
  assert.equal(r[0].subsequentPrintedPlays.filter(
    x=>x.playedLaterByName).length,0);
  assert.equal(r[0].opponentRootAfterSearch,true);
});

test('without later opponent turn or printed card play, preserve negative evidence',()=>{
  const r=analyzeFollowthrough([{turn:7,printings:['A']}],[],1);
  assert.equal(r[0].opponentRootAfterSearch,false);
  assert.equal(r[0].opponentFirstRootAfterSearch,null);
  assert.equal(r[0].subsequentPrintedPlays[0].playedLaterByName,false);
});

test('native public root bare card name matches authenticated full printing ID',()=>{
  const selection=[{turn:3,printings:['Capture Energy RCL',
    'Counter Catcher PAR','VS Seeker PHF']}];
  const ledger=[
    {actionOrdinal:20,turnBefore:4,playerSlot:1,
      action:'PlayCardAction',card:'VS Seeker',pendingPrompt:null},
    {actionOrdinal:30,turnBefore:5,playerSlot:0,
      action:'PlayCardAction',card:'Capture Energy',pendingPrompt:null}
  ];
  const mapping={'Capture Energy RCL':'Capture Energy',
    'Counter Catcher PAR':'Counter Catcher',
    'VS Seeker PHF':'VS Seeker'};
  const out=analyzeFollowthrough(selection,ledger,0,mapping);
  assert.deepEqual(out[0].subsequentPrintedPlays,[
    {printing:'Capture Energy RCL',playedLaterByName:true},
    {printing:'Counter Catcher PAR',playedLaterByName:false},
    {printing:'VS Seeker PHF',playedLaterByName:false}
  ]);
});
