'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const proxy=require('../../results/aichi-2026/2026-11/agent1-apex-lockdown-setup-proxy.cjs');
const source=require('../../results/aichi-2026/2026-11/agent1-apex-lockdown-v1.json');

/*
 * Forest Seal Stone SIT 156 grants Star Alchemy, an Ability used by the
 * attached Pokémon V. The model's 'rulebox' condition suppresses a V's
 * Abilities (Iron Thorns-style), and own active Wobbuffet PHF 36
 * Bide Barricade suppresses non-Psychic Pokémon V's Abilities.
 *
 * These are fixed-deck, fixed-deal, simulated two-turn policy tests.
 * Not full games, engine traces, or competitive win-rate evidence.
 */
const run=(seed,scenario,second=false)=>proxy.one(source.cards,seed,{
  goal:'wipe-lock',scenario,second,trace:true
});
const star=r=>r.trace.filter(row=>row[1]==='star');

test('rulebox: already attached Stone on Regidrago VSTAR cannot search for DDE',()=>{
  const r=run(1188942899,'rulebox');
  assert.ok(r.trace.some(row=>row[1]==='tool'&&row[2]?.[1]==='Forest Seal Stone'));
  assert.ok(r.trace.some(row=>row[1]==='evolve'&&row[2]==='Regidrago VSTAR'));
  assert.equal(star(r).length,0);
  assert.equal(r.vstarSpent,false);
  assert.equal(r.ready,false);
  assert.equal(r.apex,false);
});

test('rulebox going second: attached Stone cannot fetch Regidrago VSTAR from deck',()=>{
  const r=run(322965286,'rulebox',true);
  assert.ok(r.trace.some(row=>row[1]==='tool'&&row[2]?.[1]==='Forest Seal Stone'));
  assert.equal(star(r).length,0);
  assert.equal(r.vstarSpent,false);
  assert.equal(r.ready,false);
});

test('turn-2-only rulebox and Item locks preserve earlier legal actions but prohibit new Star',()=>{
  const r=run(4082728996,'t2-both');
  assert.ok(r.trace.some(row=>row[1]==='tool'&&row[2]?.[1]==='Forest Seal Stone'));
  assert.equal(star(r).length,0);
  assert.equal(r.vstarSpent,false);
  assert.equal(r.ready,false);
});

test('clean: unsuppressed Regidrago V with Stone retains genuine turn-1 Star access',()=>{
  const r=run(801665942,'clean');
  assert.deepEqual(star(r),[[1,'star','Double Dragon Energy']]);
  assert.equal(r.vstarSpent,true);
});

test('clean with own active Wobbuffet: its Bide Barricade suppresses Benched Regidrago Stone',()=>{
  // This physical seed opens Wobbuffet Active and places the Stone on a
  // Benched Regidrago V; no switch/promote is made prior to the Stone line.
  const r=run(1861883004,'clean');
  assert.ok(r.trace.some(row=>row[1]==='tool'&&row[2]?.[1]==='Forest Seal Stone'));
  assert.equal(r.trace.some(row=>row[1]==='switch'),false);
  assert.equal(star(r).length,0);
  assert.equal(r.vstarSpent,false);
  assert.equal(r.apex,false);
});
