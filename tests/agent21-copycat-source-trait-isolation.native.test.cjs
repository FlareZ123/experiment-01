'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {probeAttackOrder}=
  require('../simulation/twinleaf/agent8-mimikyu-burrow-native.cjs');
const {installMimikyuCopycatSourceTraitIsolationHook}=
  require('../simulation/twinleaf/agent21-copycat-source-trait-isolation.cjs');

test('diagnose Mimikyu reducer and previous source during Ω Barrage Copycat',()=>{
  const observed=[];
  const isolated=[];
  const restore=installMimikyuCopycatSourceTraitIsolationHook({
    onObserve:event=>observed.push(event),
    onIsolation:event=>isolated.push(event)
  });
  try{
    let result,error;
    try{
      result=probeAttackOrder(0,'Rototiller','Burrow','engine');
    }catch(caught){
      error=caught;
    }
    console.log('AGENT21_COPYCAT_REDUCER_OBSERVATIONS',JSON.stringify(observed));
    console.log('AGENT21_COPYCAT_SOURCE_ISOLATIONS',JSON.stringify(isolated));
    assert.ok(observed.length>0,
      'Mimikyu.reduceEffect was not reached during Copycat: '+JSON.stringify(observed));
    if(error)throw error;
    assert.equal(result.copycatExecutedAttack,'Rototiller');
  }finally{
    restore();
  }
});
