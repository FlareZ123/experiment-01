'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseAtPassHorizon}=require('../simulation/twinleaf/attack-pass-horizon-policy.cjs');
test('rank10 same-turn score comparison',()=>{
  const rows=[[-99,-2331,-2305],[-97,-2327,-2296]];
  for(const [before,pass,attack] of rows){
    assert.equal(chooseAtPassHorizon(before,100,['Retribution Strike'],()=>attack),null);
    assert.equal(chooseAtPassHorizon(pass,100,['Retribution Strike'],()=>attack),'Retribution Strike');
  }
});
test('strict ties and choose maximum score',()=>{
  assert.equal(chooseAtPassHorizon(-100,20,['tie'],()=>-120),null);
  const scores={a:-90,b:-80,c:-80,d:-81};
  assert.equal(chooseAtPassHorizon(-100,20,Object.keys(scores),name=>scores[name]),'b');
});
test('undefined scores, unavailable pass and bad inputs',()=>{
  assert.equal(chooseAtPassHorizon(-100,0,['x','y'],name=>name==='x'?undefined:NaN),null);
  assert.equal(chooseAtPassHorizon(undefined,50,['x'],()=>0),null);
  assert.throws(()=>chooseAtPassHorizon(0,NaN,[],()=>0),/Invalid/);
});
