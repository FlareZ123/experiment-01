'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const proxy = require('../../results/aichi-2026/2026-11/agent1-apex-lockdown-setup-proxy.cjs');
const candidate = require('../../results/aichi-2026/2026-11/agent1-apex-lockdown-v1.json');

/*
 * Exact frozen 60 and a paired physical deal. Printed retreat costs from
 * supplied English card ZIP: Regidrago V SIT135 = 3, VSTAR SIT136 = 3,
 * Latias ex SSP76 = 2. An active Latias with one Fire Energy cannot retreat
 * for 1 when its Skyliner Ability is suppressed (rulebox scenario).
 *
 * This is a causal two-turn setup proxy, NOT a Twinleaf game or win result.
 */
const seed = 3806511341;
const run = scenario => proxy.one(candidate.cards, seed, {
  goal:'wipe-lock',scenario,second:false,trace:true
});
const switched = r => r.trace.some(row=>
  row[1]==='switch' && row[2]==='Regidrago VSTAR');

test('exact Apex candidate remains a 60-card physical sampling input',()=>{
  assert.equal(proxy.expand(candidate.cards).length,60);
  assert.equal(candidate.cards.find(c=>c.name==='Latias ex').cardId,'sv8-76');
  assert.equal(candidate.cards.find(c=>c.name==='Regidrago VSTAR').cardId,'swsh12-136');
  assert.equal(candidate.cards.find(c=>c.name==='Regidrago V').cardId,'swsh12-135');
});

test('ability-suppressed Skyliner cannot finance a 2-cost Latias retreat with one Fire',()=>{
  const outcome=run('rulebox');
  assert.equal(switched(outcome),false);
  assert.equal(outcome.ready,false);
  assert.equal(outcome.apex,false);
  assert.ok(outcome.trace.some(row=>row[1]==='crispin'));
  assert.ok(!outcome.trace.some(row=>row[1]==='switch'));
});

test('same physical deal with live Skyliner can retreat Latias for free',()=>{
  const outcome=run('clean');
  assert.equal(outcome.first.active?true:outcome.ready,true);
  assert.ok(outcome.trace.some(row=>row[1]==='switch' && row[2]==='Regidrago V'));
  assert.equal(outcome.ready,true);
  assert.equal(outcome.apex,true);
});

test('turn-2-only Ability-lock does not retroactively revoke turn-1 Skyliner',()=>{
  const outcome=run('t2-both');
  assert.ok(outcome.trace.some(row=>row[1]==='switch' && row[2]==='Regidrago V'));
  assert.equal(outcome.ready,true);
});
