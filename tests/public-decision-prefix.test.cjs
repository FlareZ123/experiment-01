'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {publicDecision,publicDecisionDifference}=require('../simulation/twinleaf/public-decision-prefix.cjs');
const r=(t,a,c,n=1)=>({turnBefore:t,action:a,card:c,actionOrdinal:n,
  playerSlot:0,decisionHandBefore:['Hidden Secret'],cardSelection:['secret']});
test('public projection excludes private hand and prompt choices',()=>{
  const p=publicDecision(r(1,'PlayCardAction','Fog Crystal'));
  assert.equal(p.card,'Fog Crystal');
  assert.doesNotMatch(JSON.stringify(p),/Hidden|secret/);
});
test('first filtered public divergence has an exact, bounded witness',()=>{
  const o=[r(1,'PassTurnAction',null),r(3,'PlayCardAction','Fog Crystal',10)];
  const m=[r(1,'PassTurnAction',null),r(3,'PlayCardAction','Darkness Energy',12)];
  const x=publicDecisionDifference(o,m);
  assert.equal(x.sharedPublicDecisions,1);
  assert.equal(x.source.card,'Fog Crystal');
  assert.equal(x.alternate.card,'Darkness Energy');
  assert.equal(x.sourceActionOrdinal,10);
});
test('unchanged visible actions do not assert hidden-state equality',()=>{
  const a=[r(1,'PassTurnAction',null,2)];
  const b=[r(1,'PassTurnAction',null,9)];
  b[0].decisionHandBefore=['Different Secret'];
  const x=publicDecisionDifference(a,b);
  assert.equal(x.firstDifferentIndex,null);
  assert.match(x.scope,/not an authenticated/);
});
test('different lengths retain one-sided absence',()=>{
  const x=publicDecisionDifference([], [r(2,'PassTurnAction',null,3)]);
  assert.equal(x.firstDifferentIndex,0);
  assert.equal(x.source,null);
  assert.equal(x.alternate.action,'PassTurnAction');
});
