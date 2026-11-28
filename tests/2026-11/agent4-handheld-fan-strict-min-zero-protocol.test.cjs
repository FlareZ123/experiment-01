'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
function prompt(seat,alter={}){
  const source={classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting:'Handheld Fan TWM',effectName:'Handheld Fan'};
  const base={
    schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'AttachEnergyPrompt',
    description:'Move an Energy',source,
    choices:[{token:'none',kind:'empty-selection',label:'Move no Energy'}],
    publicMetadata:{selectionType:'energy-attachment',count:1,
      minimumCount:0,maximumCount:1,sourceZone:'active',
      ownerSeat:'opponent',zone:'bench',isOwnerVisible:true,allowCancel:false}
  };
  return {...base,...alter};
}
test('exact Handheld Fan single-select accepts typed empty and Energy choices on both seats',()=>{
  for(const seat of [0,1]){
    const p=prompt(seat);
    assert.doesNotThrow(()=>protocol.validatePrompt(p,seat));
    assert.deepEqual(protocol.validateDecision(
      {kind:'select-choice',token:'none'},p,new Set()),
      {kind:'select-choice',token:'none'});
    const withEnergy=prompt(seat,{choices:[
      {token:'move',kind:'energy',printing:'Double Colorless Energy SUM 136',
        label:'Move DCE',publicMetadata:{sourceZone:'active',
          ownerSeat:'opponent',zone:'bench',benchIndex:0,
          isOwnerVisible:true,selectedCount:1}},
      p.choices[0]
    ]});
    assert.doesNotThrow(()=>protocol.validatePrompt(withEnergy,seat));
    assert.deepEqual(protocol.validateDecision(
      {kind:'select-choice',token:'move'},withEnergy,new Set()),
      {kind:'select-choice',token:'move'});
  }
});
test('spoofed Handheld Fan and other single-select empties fail closed',()=>{
  for(const seat of [0,1]){
    const p=prompt(seat);
    const bad=[
      {source:{...p.source,sourcePrinting:'Handheld Fan TWM 150'}},
      {source:{...p.source,sourcePrinting:'Spiky Energy JTG 159'}},
      {source:{...p.source,effectName:'Max Geist'}},
      {source:{...p.source,sourceKind:'engine',sourcePrinting:null}},
      {promptType:'ChooseEnergyPrompt'},
      {publicMetadata:{...p.publicMetadata,minimumCount:1}},
      {publicMetadata:{...p.publicMetadata,maximumCount:2}},
      {choices:[...p.choices,{...p.choices[0],token:'duplicate'}]}
    ];
    for(const diff of bad)
      assert.throws(()=>protocol.validatePrompt(prompt(seat,diff)));
  }
});
