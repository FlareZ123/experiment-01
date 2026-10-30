'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {exactJammerFirstTurn}=
  require('../scripts/agent3-thorns-tool-jammer-window.cjs');

test('exact one-Jammer visibility under four-Basic valid opening',()=>{
  const x=exactJammerFirstTurn(0);
  assert.ok(Math.abs(x.conditionalValidBasic-0.12104358092500386)<1e-12);
});
test('specific ranks 6, 24 and 29 Mail counts',()=>{
  const x=exactJammerFirstTurn(3),y=exactJammerFirstTurn(4),
    z=exactJammerFirstTurn(2);
  for(const [observed,expected] of [
    [x.conditionalValidBasic,0.14579374512435478],
    [y.conditionalValidBasic,0.1538897515280655],
    [z.conditionalValidBasic,0.13762112434720977]]){
    assert.ok(Math.abs(observed-expected)<1e-12);
  }
  assert.throws(()=>exactJammerFirstTurn(5));
});
