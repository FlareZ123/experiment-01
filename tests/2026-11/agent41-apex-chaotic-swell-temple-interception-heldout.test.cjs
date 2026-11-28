'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../results/aichi-2026/2026-11/agent1-apex-lockdown-setup-proxy.cjs');
const fixed60=require('../../results/aichi-2026/2026-11/agent1-apex-lockdown-v1.json');

/*
 * Chaotic Swell CEC187: when the opponent attempts to play Temple of Sinnoh
 * from hand, discard the new Stadium AFTER discarding Chaotic Swell; the new
 * Stadium has no effect. Model exactly one opposing Stadium attempt in this
 * stylized event, not arbitrary removal effects, chains or real game play.
 */
const one=(seed,preempt)=>policy.one(fixed60.cards,seed,{
  goal:'wipe-lock',scenario:'temple',second:false,policy:'joint',
  templeOutFirst:true,templePreemptSwell:preempt,trace:true
});
const events=(r,k)=>r.trace.filter(x=>x[1]===k);

test('first-turn Swell intercepts the opponent Temple instead of turning it on',()=>{
  const r=one(1815570184,true);
  assert.deepEqual(events(r,'swell preempt'),[[1,'swell preempt','Chaotic Swell']]);
  assert.deepEqual(events(r,'temple blocked by swell'),
    [[2,'temple blocked by swell','Temple of Sinnoh']]);
  assert.equal(events(r,'opponent stadium').length,0);
  assert.equal(r.apex,true);
});

test('same exact source deal without proactive Swell does not pay Apex',()=>{
  const r=one(1815570184,false);
  assert.equal(events(r,'temple blocked by swell').length,0);
  assert.deepEqual(events(r,'opponent stadium'),[[2,'opponent stadium','Temple of Sinnoh']]);
  assert.equal(r.apex,false);
});

test('an already played preemptive Swell consumes our one Stadium for turn1',()=>{
  const r=one(414388985,true);
  const ourTurn1Stadiums=r.trace.filter(x=>x[0]===1&&x[1]==='stadium');
  assert.deepEqual(ourTurn1Stadiums,[[1,'stadium','Chaotic Swell']]);
  assert.deepEqual(events(r,'temple blocked by swell'),
    [[2,'temple blocked by swell','Temple of Sinnoh']]);
});

test('first-turn Swell preemption is opt-in and does not change clean scenario',()=>{
  const args={goal:'wipe-lock',scenario:'clean',second:false,
    policy:'joint',templeOutFirst:true,trace:true};
  const a=policy.one(fixed60.cards,1815570184,{...args,templePreemptSwell:false});
  const b=policy.one(fixed60.cards,1815570184,{...args,templePreemptSwell:true});
  assert.deepEqual(a,b);
});
