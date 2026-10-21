'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  SAMPLES,sourceCynthiaChoices
}=require('../simulation/twinleaf/agent24-cynthia-source-exposure.cjs');

test('four predeclared source-first and other-seat rank6/24 exposures are fixed',()=>{
  assert.deepEqual(SAMPLES.map(x=>[x.sourceRank,x.rankA,x.rankB,x.seed]),[
    [6,6,1,20624001],[6,1,6,20624002],
    [24,24,1,20624003],[24,1,24,20624004]
  ]);
});

test('attributes only immediate genuine owner modal to played C&C',()=>{
  const trace=[
    {action:'PlayCardAction',playerSlot:0,card:'Cynthia & Caitlin',
      actionOrdinal:10,turnBefore:4},
    {action:'ResolvePromptAction',playerSlot:0,actionOrdinal:11,
      turnBefore:4,optionSelection:{promptKind:'SelectOptionPrompt',
        selectedOption:null,selectedText:null}},
    {action:'PlayCardAction',playerSlot:1,card:'Cynthia & Caitlin',
      actionOrdinal:15,turnBefore:5},
    {action:'PlayCardAction',playerSlot:1,card:'Field Blower',
      actionOrdinal:16,turnBefore:5},
    {action:'ResolvePromptAction',playerSlot:1,actionOrdinal:17,
      turnBefore:5,optionSelection:{promptKind:'SelectOptionPrompt',
        selectedOption:1}}
  ];
  const owner=sourceCynthiaChoices(trace,0);
  assert.equal(owner.length,1);
  assert.equal(owner[0].playRoot,10);
  assert.equal(owner[0].nextRoot,11);
  assert.equal(owner[0].nativeModeObserved,true);
  assert.equal(owner[0].wasNull,true);
  const opponent=sourceCynthiaChoices(trace,1);
  assert.equal(opponent.length,1);
  assert.equal(opponent[0].nativeModeObserved,false,
    'Later option after another card must not be misattributed');
});
