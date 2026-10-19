'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {POLICY_VERSION,withBilateralCommonCandidatePolicy:apply}=
  require('../simulation/evaluation/agent41-bilateral-common-policy.cjs');

/** @returns {{adapters:object,events:string[]}} */
function fakeAdapters() {
  const events=[];
  const wrap=(kind,auditKey)=>(seat,execute,options)=>{
    events.push(kind+':enter:'+seat);
    try {
      const result=execute();
      return {result,[auditKey]:{kind,seat,options:options??null}};
    } finally {
      events.push(kind+':exit:'+seat);
    }
  };
  return {events,adapters:{
    toolRemoval:wrap('tool','policyAudit'),
    stoneRecipient:wrap('stone','audit'),
    starAlchemy:wrap('star','audit')
  }};
}

test('same wrapper chain for both physical candidate seats',()=>{
  for(const seat of [0,1]){
    const f=fakeAdapters();
    const output=apply(seat,()=>({actualStore:true}),f.adapters);
    assert.deepEqual(output.result,{actualStore:true});
    assert.equal(output.policyAudit.version,POLICY_VERSION);
    assert.equal(output.policyAudit.frozenCommonProfile,true);
    assert.equal(output.policyAudit.qualification.hiddenInformationSafe,false);
    assert.deepEqual(f.events,[
      'tool:enter:'+seat,'stone:enter:'+seat,'star:enter:'+seat,
      'star:exit:'+seat,'stone:exit:'+seat,'tool:exit:'+seat
    ]);
    assert.deepEqual(output.policyAudit.components.fieldBlower.options,{
      automaticFieldBlower:true,allowAnyActiveBlower:true,
      lowHandLillieAfterBlower:false,proactiveLowHandLillie:false
    });
    assert.equal(output.policyAudit.components.forestStoneRecipient.kind,'stone');
    assert.equal(output.policyAudit.components.starAlchemy.kind,'star');
  }
});

test('propagates an actual Store exception through every cleanup boundary',()=>{
  const f=fakeAdapters();
  const failure=new Error('live dispatch rejected');
  assert.throws(()=>apply(1,()=>{throw failure;},f.adapters),x=>x===failure);
  assert.deepEqual(f.events,[
    'tool:enter:1','stone:enter:1','star:enter:1',
    'star:exit:1','stone:exit:1','tool:exit:1'
  ]);
});

test('rejects invalid physical seats and nonfunctions before engine load',()=>{
  const f=fakeAdapters();
  assert.throws(()=>apply(2,()=>{},f.adapters));
  assert.throws(()=>apply(0,null,f.adapters));
  assert.throws(()=>apply(0,()=>0,{...f.adapters,starAlchemy:42}),
    {name:'AssertionError'});
});
