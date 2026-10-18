'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {SEEDS,ACTION_LIMIT,extractGladionRootEvents}=
  require('../simulation/twinleaf/rank2-gladion-source-exposure.cjs');

test('frozen source cohort spans all registered physical seats',()=>{
  assert.deepEqual(SEEDS,[20261023,20261024,20261025,20261026]);
  assert.equal(ACTION_LIMIT,300);
});

test('actual root Gladion play followed by own Prize resolution is counted',()=>{
  const ledger=[
    {actionOrdinal:0,turnBefore:4,playerSlot:1,action:'PlayCardAction',card:'Gladion'},
    {actionOrdinal:1,turnBefore:4,playerSlot:1,
      action:'ResolvePromptAction',pendingPrompt:'ChoosePrizePrompt'},
    {actionOrdinal:2,turnBefore:4,playerSlot:1,action:'PlayCardAction',card:'Switch'}
  ];
  assert.deepEqual(extractGladionRootEvents(ledger,1),[{
    actionOrdinal:0,turn:4,prizePromptOrdinal:1,
    prizePromptResolved:true,nextOwnPlayOrdinal:2,followUpObserved:true
  }]);
  assert.deepEqual(extractGladionRootEvents(ledger,0),[]);
});

test('future nonadjacent Prize prompt cannot be credited to Gladion',()=>{
  const ledger=[
    {actionOrdinal:6,turnBefore:8,playerSlot:0,action:'PlayCardAction',card:'Gladion'},
    {actionOrdinal:7,turnBefore:8,playerSlot:0,action:'PassTurnAction'},
    {actionOrdinal:8,turnBefore:9,playerSlot:0,
      action:'ResolvePromptAction',pendingPrompt:'ChoosePrizePrompt'}
  ];
  const events=extractGladionRootEvents(ledger,0);
  assert.equal(events.length,1);
  assert.equal(events[0].prizePromptOrdinal,null);
  assert.equal(events[0].prizePromptResolved,false);
  assert.equal(events[0].followUpObserved,false);
});
