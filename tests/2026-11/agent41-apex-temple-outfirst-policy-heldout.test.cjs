'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../results/aichi-2026/2026-11/agent1-apex-lockdown-setup-proxy.cjs');
const source=require('../../results/aichi-2026/2026-11/agent1-apex-lockdown-v1.json');

const run=(seed,templeOutFirst,second=false)=>policy.one(source.cards,seed,{
  scenario:'temple',second,policy:'joint',goal:'wipe-lock',
  templeOutFirst,trace:true
});
const event=(r,name)=>r.trace.filter(row=>row[1]===name);

test('exact printed 60 remains fixed in both policy variants',()=>{
  assert.equal(policy.expand(source.cards).length,60);
  assert.equal(source.deck_identity_sha256,
    'f04a8793b11b8a76e414e0f4d21ff77be38820a63801b142edb048b85dddf8d6');
});

test('Temple reasserts on own T2 going first; Swell replaces it before attack',()=>{
  const passive=run(414388985,false),pivot=run(414388985,true);
  assert.equal(passive.apex,false);
  assert.equal(pivot.apex,true);
  assert.deepEqual(event(pivot,'opponent stadium'),[[2,'opponent stadium','Temple of Sinnoh']]);
  assert.deepEqual(event(pivot,'temple removed'),[[2,'temple removed','Chaotic Swell']]);
});

test('Guzma & Hala multi-axis line: Stadium before DDE attachment produces paid Apex',()=>{
  const passive=run(801665942,false),pivot=run(801665942,true);
  assert.equal(passive.apex,false);
  assert.equal(pivot.apex,true);
  assert.ok(pivot.trace.some(row=>row[1]==='play'&&row[2]==='Guzma & Hala'));
  const stad=pivot.trace.findIndex(row=>row[1]==='stadium'&&row[2]==='Giant Hearth');
  const attach=pivot.trace.findIndex(row=>row[1]==='attach'&&row[2][1]==='Double Dragon Energy');
  assert.ok(stad>=0&&attach>stad);
  assert.ok(pivot.trace.some(row=>row[1]==='temple removed'&&row[2]==='Giant Hearth'));
});

test('Guzma & Hala + Stone line recovers VSTAR after clearing Temple',()=>{
  const passive=run(1188942899,false),pivot=run(1188942899,true);
  assert.equal(passive.apex,false);
  assert.equal(pivot.apex,true);
  assert.ok(pivot.trace.some(row=>row[1]==='temple removed'&&row[2]==='Giant Hearth'));
  assert.ok(pivot.trace.some(row=>row[1]==='star'&&row[2]==='Regidrago VSTAR'));
});

test('Double Dragon alone cannot finance GGF if Temple remains active',()=>{
  const passive=run(2681547797,false),pivot=run(2681547797,true);
  assert.equal(passive.apex,false);
  assert.equal(pivot.apex,false);
});

test('Temple may arrive before own first turn when going second',()=>{
  const r=run(414388985,true,true);
  assert.deepEqual(event(r,'opponent stadium')[0],[1,'opponent stadium','Temple of Sinnoh']);
});

test('conditional Temple out-first materially improves an identical 150-deal sample',()=>{
  const args={trials:150,seed:27112028,scenario:'temple',second:false,
    policy:'joint',goal:'wipe-lock'};
  const base=policy.batch(source.cards,{...args,templeOutFirst:false});
  const pivot=policy.batch(source.cards,{...args,templeOutFirst:true});
  assert.ok(pivot.counts.apex>base.counts.apex);
  assert.ok(pivot.counts.wipeLock>base.counts.wipeLock);
});

test('new Temple policy is opt-in; clean scenario is unchanged by option',()=>{
  const a=policy.one(source.cards,801665942,{
    scenario:'clean',second:false,policy:'joint',goal:'wipe-lock',
    templeOutFirst:false,trace:true
  });
  const b=policy.one(source.cards,801665942,{
    scenario:'clean',second:false,policy:'joint',goal:'wipe-lock',
    templeOutFirst:true,trace:true
  });
  assert.deepEqual(a,b);
});
