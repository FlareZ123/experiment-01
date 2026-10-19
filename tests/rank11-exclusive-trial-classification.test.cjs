'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyTrial}=
  require('../simulation/twinleaf/rank11-exclusive-trial-classification.cjs');

const game={verifiedByDrawLog:true,firstTurnSlot:0,actions:48,
  turns:2,finished:false};
const idle=()=>({selected:null,blockedOtherRoute:0,direct:{},held:{}});

test('no-route results preserve genuine starts and cap exposure',()=>{
  const x=classifyTrial(idle(),game,0,48);
  assert.equal(x.resultClass,'no-route');
  assert.equal(x.sourceActuallyFirst,true);
  assert.equal(x.actionCapped,true);
  assert.equal(x.sourceFirstOwnTurnReached,true);
  assert.equal(classifyTrial(idle(),game,1,48).sourceActuallyFirst,false);
});

test('selected direct and held route emit distinct completed, aborted and censored classes',()=>{
  for(const [kind,key] of [['direct','direct'],['held-seal','held']]) {
    const audit=idle();
    audit.selected={kind,turn:1};
    assert.equal(classifyTrial(audit,game,0,48).resultClass,`${kind}-unresolved`);
    audit[key].aborted={step:'trubbish-search'};
    assert.equal(classifyTrial(audit,game,0,48).resultClass,`${kind}-aborted`);
    assert.equal(classifyTrial(audit,game,0,48).aborted.step,'trubbish-search');
    audit[key].aborted=null;
    audit[key].completed=true;
    assert.equal(classifyTrial(audit,game,0,48).resultClass,`${kind}-completed`);
    audit[key].aborted={step:'garbodor-search'};
    assert.throws(()=>classifyTrial(audit,game,0,48),/Cannot both/);
  }
});

test('unverified start aborts qualification rather than generating false no-route',()=>{
  assert.throws(()=>classifyTrial(idle(),{...game,verifiedByDrawLog:false},0,48),
    /starting turn/);
  assert.throws(()=>classifyTrial(idle(),{...game,firstTurnSlot:null},0,48),
    /starting turn/);
});
