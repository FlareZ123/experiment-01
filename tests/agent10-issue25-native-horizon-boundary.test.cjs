'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {nativeHorizonBoundary,auditSelectedNativeHorizon}=
  require('../simulation/evaluation/agent10-issue25-native-horizon-boundary.cjs');
function root(n,action,origin=n){
  return {actionOrdinal:n,turnBefore:7,turnAfter:7,
    playerSlot:0,action,initiatingRootActionOrdinal:origin,
    pendingPrompt:action==='ResolvePromptAction'?'ChooseCardsPrompt':null};
}
function trial(actions,opts={}){
  return {id:opts.id??'native',
    status:opts.status??'returned-unqualified',
    nativeRootActionCount:actions.length,publicRootActions:actions,
    publicRootActionsTruncated:opts.truncated??false,
    finished:opts.finished??false};
}
test('capped attack choice does not establish completed attack prompt sequence',()=>{
  const actions=[root(0,'ResolvePromptAction',null),root(1,'AttackAction'),
    root(2,'ResolvePromptAction',1)];
  const v=nativeHorizonBoundary(trial(actions),3);
  assert.equal(v.boundary,'CAPPED_INSIDE_ATTACK_PROMPT_CHAIN');
  assert.equal(v.afterAcceptedRoot.pendingPrompt,'ChooseCardsPrompt');
  assert.equal(v.initiatingRoot.action,'AttackAction');
  assert.equal(v.turnTransitionObserved,false);
});
test('cap after Pass with no observed turn transition is distinguished',()=>{
  const v=nativeHorizonBoundary(trial([root(0,'AttackAction'),
    root(1,'PassTurnAction')]),2);
  assert.equal(v.boundary,'CAPPED_AFTER_PASS_BEFORE_OBSERVED_TURN_TRANSITION');
});
test('post-Pass Wait that advances the global turn has own classification',()=>{
  const actions=[root(0,'PassTurnAction'),{...root(1,'ResolvePromptAction',0),
    pendingPrompt:'WaitPrompt',turnBefore:9,turnAfter:10}];
  const v=nativeHorizonBoundary(trial(actions),2);
  assert.equal(v.boundary,'CAPPED_AT_POST_PASS_TURN_TRANSITION');
});
test('native abort after accepted attack remains error',()=>{
  const v=nativeHorizonBoundary(trial([root(0,'AttackAction')],
    {status:'engine-error'}),48);
  assert.equal(v.boundary,'NATIVE_ENGINE_ABORT');
});
test('engine terminal at cap remains native terminal not a paper certificate',()=>{
  const v=nativeHorizonBoundary(trial([root(0,'AttackAction')],
    {finished:true}),1);
  assert.equal(v.boundary,'NATIVE_TERMINAL_UNQUALIFIED');
});
test('early return and missing or truncated root history are separate',()=>{
  const row=trial([root(0,'AttackAction')]);
  assert.equal(nativeHorizonBoundary(row,48).boundary,
    'NONTERMINAL_EARLY_RETURN');
  assert.equal(nativeHorizonBoundary({...row,publicRootActions:null},1)
    .boundary,'UNRESOLVED_MISSING_ROOT_HISTORY');
  assert.equal(nativeHorizonBoundary({...row,publicRootActionsTruncated:true},1)
    .boundary,'UNRESOLVED_MISSING_ROOT_HISTORY');
});
test('prompt overhead is separate from substantive decisions and Pass',()=>{
  const actions=[root(0,'AttackAction'),
    {...root(1,'ResolvePromptAction',0),pendingPrompt:'ChooseCardsPrompt'},
    {...root(2,'ResolvePromptAction',0),pendingPrompt:'WaitPrompt'},
    root(3,'PassTurnAction')];
  const out=auditSelectedNativeHorizon({
    selectedExecutingManifest:{nativeRootActionLimit:4},
    attempts:[trial(actions)]});
  assert.equal(out.rows[0].practicalActions,1);
  assert.equal(out.rows[0].promptActions,2);
  assert.equal(out.rows[0].waitPromptActions,1);
  assert.equal(out.rows[0].passActions,1);
  assert.equal(out.rows[0].promptBudgetFraction,'2/4');
  assert.equal(out.competitiveGamesQualified,0);
});
test('invalid and over-limit action count fail closed',()=>{
  assert.throws(()=>nativeHorizonBoundary(trial([root(0,'AttackAction')]),0));
  assert.throws(()=>nativeHorizonBoundary(trial([root(0,'AttackAction'),
    root(1,'AttackAction')]),1));
});
