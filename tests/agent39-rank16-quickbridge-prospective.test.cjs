'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {scheduledArms,classify,VERSION}=
  require('../simulation/evaluation/agent39-rank16-quickbridge-prospective.cjs');

test('fresh frozen source frame has 64 independently seeded physical groups and 128 arms',()=>{
  const a=scheduledArms();
  assert.equal(VERSION,'agent39-original-rank16-quick-to-direct-native-source-v1');
  assert.equal(a.length,128);
  assert.equal(new Set(a.map(r=>r.seed)).size,64);
  assert.equal(new Set(a.map(r=>r.id)).size,128);
  for(let i=0;i<a.length;i+=2){
    assert.equal(a[i].group,a[i+1].group);
    assert.equal(a[i].seed,a[i+1].seed);
    assert.equal(a[i].sourceSeat,a[i+1].sourceSeat);
    assert.equal(a[i].sourceSeat,(i/2)%2);
    assert.deepEqual([a[i].candidateId,a[i+1].candidateId],
      ['champion-reference','new-moon-lockbreaker-v1']);
  }
});

const before={error:null,game:{sourceDeal:{id:'shared'},decisionTraceSha256:'a'}};
const after={error:null,game:{sourceDeal:{id:'shared'},decisionTraceSha256:'b'}};

test('native error cannot be silently presented as Quick bridge completion',()=>{
  const e={error:{message:'Store failure'},game:null};
  assert.equal(classify(e,after,{completed:true},{attempted:{turn:2},
    completed:true}),'NATIVE_ERROR');
});

test('no original physical source identity blocks all tactical classification',()=>{
  assert.equal(classify({error:null,game:{sourceDeal:null}},after,null,null),
    'SOURCE_PHYSICAL_UNVERIFIED');
  assert.equal(classify(before,{error:null,game:{sourceDeal:{id:'other'}}},
    null,{attempted:{turn:2},completed:true}),'SOURCE_PHYSICAL_MISMATCH');
});

test('if not offered, treatment must exactly reproduce direct-policy baseline',()=>{
  assert.equal(classify(before,before,null,{attempted:null}),
    'NO_QUICK_OFFER_TRACE_IDENTICAL');
  assert.equal(classify(before,after,null,{attempted:null}),
    'NO_QUICK_OFFER_TRACE_DIVERGED');
});

test('Quick Ball owner K1 miss remains negative',()=>{
  assert.equal(classify(before,after,null,{
    attempted:{turn:2},aborted:{reason:'REAL_OWNER_K1_TRUBBISH_UNAVAILABLE'}
  }),'QUICK_BRIDGE_ABORTED:REAL_OWNER_K1_TRUBBISH_UNAVAILABLE');
});

test('Bench acquisition alone is not an actual Garbodor result',()=>{
  assert.equal(classify(before,after,{completed:false,aborted:null},{
    attempted:{turn:2},completed:true
  }),'TRUBBISH_BENCHED_GARBODOR_NOT_COMPLETED');
  assert.equal(classify(before,after,{completed:false,
    aborted:{step:'garbodor-search'}},{
    attempted:{turn:2},completed:true
  }),'TRUBBISH_BENCHED_GARBODOR_ABORTED');
});

test('both complete real native owner action paths are required',()=>{
  assert.equal(classify(before,after,{completed:true,aborted:null},{
    attempted:{turn:2},completed:true
  }),'QUICK_BRIDGE_AND_GARBODOR_NATIVE_COMPLETE');
});

test('Quick root selected but unconfirmed native continuation is incomplete',()=>{
  assert.equal(classify(before,after,{completed:false},{
    attempted:{turn:1},completed:false,aborted:null
  }),'QUICK_BRIDGE_STARTED_INCOMPLETE');
});
