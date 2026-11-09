'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withPaperSemanticsProfileV1:compose,COMPONENTS,PINNED_TWINLEAF}=
  require('../../simulation/twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');

/** @returns {{dependencies:object,events:string[]}} */
function fixture(){
  const events=[];
  const dependencies={
    installCelestialRoar(){events.push('install-celestial');
      return ()=>events.push('restore-celestial');},
    withMewEnergyMix(run){events.push('install-mew');
      try{return {result:run(),audit:{shufflePromptsSettled:1}};}
      finally{events.push('restore-mew');}},
    withAttachEnergyTarget(run){events.push('install-target');
      try{return {result:run(),audit:{rejected:0,inspected:1}};}
      finally{events.push('restore-target');}}
  };
  return {dependencies,events};
}

test('default-off executes once and does not activate a hook',()=>{
  const f=fixture(),q=compose(()=>42,{},f.dependencies);
  assert.equal(q.result,42);
  assert.deepEqual(f.events,[]);
  assert.equal(q.audit.enabled.celestialRoar,false);
  assert.equal(q.audit.energyMixShuffle,null);
  assert.equal(q.audit.fullPaperGameQualified,false);
  assert.equal(q.audit.pinnedTwinleaf,PINNED_TWINLEAF);
  assert.equal(Object.keys(COMPONENTS).length,3);
});

test('three native corrections compose in stable order and restore',()=>{
  const f=fixture();
  const q=compose(()=>{f.events.push('run');return 'native-result';},
    {celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true},
    f.dependencies);
  assert.equal(q.result,'native-result');
  assert.deepEqual(f.events,['install-celestial','install-target','install-mew',
    'run','restore-mew','restore-target','restore-celestial']);
  assert.equal(q.audit.attachEnergyTarget.inspected,1);
  assert.equal(q.audit.energyMixShuffle.shufflePromptsSettled,1);
  assert.equal(q.audit.celestialRoar.exercised,'not-observed-by-this-wrapper');
});

test('native failure restores all installed hooks and admits a next run',()=>{
  const f=fixture();
  assert.throws(()=>compose(()=>{throw Error('native fail');},
    {celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true},
    f.dependencies),/native fail/);
  assert.deepEqual(f.events,['install-celestial','install-target','install-mew',
    'restore-mew','restore-target','restore-celestial']);
  assert.equal(compose(()=>7,{},f.dependencies).result,7);
});

test('unknown hooks and untyped flags fail closed before installation',()=>{
  const f=fixture();
  assert.throws(()=>compose(()=>1,{celestialRoar:1},f.dependencies),
    /must be boolean/);
  assert.throws(()=>compose(()=>1,{hypothetical:true},f.dependencies),
    /Unknown paper-semantics option/);
  assert.deepEqual(f.events,[]);
});

test('simultaneous nested prototype installation is rejected',()=>{
  const f=fixture();
  assert.throws(()=>compose(()=>compose(()=>1,{},f.dependencies),{},
    f.dependencies),/not reentrant/);
  assert.equal(compose(()=>2,{},f.dependencies).result,2);
});
