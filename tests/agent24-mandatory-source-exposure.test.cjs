'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  SOURCE_PAIRS,sourceGuzmaChoices
}=require('../simulation/twinleaf/agent24-mandatory-source-exposure.cjs');

/** @param {number} ordinal @param {0|1} seat @param {string} action */
function root(ordinal,seat,action,extras={}) {
  return {actionOrdinal:ordinal,playerSlot:seat,turnBefore:5,action,...extras};
}
test('native G&H mode 0, mode 1, and null distinguish printed modal decisions',()=>{
  const sample=choice=>[
    root(68,1,'PlayCardAction',{card:'Guzma & Hala'}),
    root(69,1,'ResolvePromptAction',{optionSelection:{
      promptKind:'SelectOptionPrompt',selectedOption:choice,
      selectedText:choice===null?null:'mode '+choice
    }})
  ];
  for(const value of [null,0,1]){
    const result=sourceGuzmaChoices(sample(value),1);
    assert.equal(result.length,1);
    assert.equal(result[0].nativeOptionObserved,true);
    assert.equal(result[0].selectedOption,value);
    assert.equal(result[0].modeResultIsNull,value===null);
  }
  assert.equal(sourceGuzmaChoices(sample(0),0).length,0);
});

test('an unrelated action or turn boundary cannot impersonate the G&H modal',()=>{
  const cases=[
    [
      root(5,0,'PlayCardAction',{card:'Guzma & Hala'}),
      root(6,0,'PlayCardAction',{card:'Quick Ball'}),
      root(7,0,'ResolvePromptAction',{optionSelection:{
        promptKind:'SelectOptionPrompt',selectedOption:0
      }})
    ],[
      root(5,0,'PlayCardAction',{card:'Guzma & Hala'}),
      {...root(6,1,'ResolvePromptAction',{optionSelection:{
        promptKind:'SelectOptionPrompt',selectedOption:0
      }}),turnBefore:6}
    ],[
      root(5,0,'PlayCardAction',{card:'Guzma & Hala'}),
      root(6,0,'ResolvePromptAction',{cardSelection:{
        promptKind:'ChooseCardsPrompt',selectedCards:['Artazon PAL']
      }})
    ]
  ];
  for(const trace of cases){
    const [line]=sourceGuzmaChoices(trace,0);
    assert.equal(line.nativeOptionObserved,false);
    assert.equal(line.modeResultIsNull,null);
  }
  assert.deepEqual(sourceGuzmaChoices([
    root(1,0,'PlayCardAction',{card:'Marnie'})
  ],0),[]);
  assert.throws(()=>sourceGuzmaChoices([],2));
});

test('source-locked physical benchmark frames include both seats',()=>{
  assert.equal(SOURCE_PAIRS.length,2);
  assert.ok(SOURCE_PAIRS.every(s=>s.sourceRank===2));
  assert.deepEqual(SOURCE_PAIRS.map(s=>
    s.rankA===s.sourceRank?0:1),[0,1]);
  assert.deepEqual(SOURCE_PAIRS.map(s=>s.seed),[20261021,20261023]);
});
