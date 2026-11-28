'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const proxy=require('../../results/aichi-2026/2026-11/agent1-apex-lockdown-setup-proxy.cjs');
const source=require('../../results/aichi-2026/2026-11/agent1-apex-lockdown-v1.json');

/*
 * Official Star Alchemy ruling: Forest Seal Stone SIT156 itself owns the
 * Ability. The attached Pokemon V has access to it but does not acquire it.
 * Therefore Path-to-the-Peak-style Rule Box Ability denial, Wobbuffet
 * Bide Barricade and Garbotoxin do not prevent this Tool-granted VSTAR Power.
 * A distinct Tool-effect suppression would (not simulated by this proxy).
 *
 * All cases are fixed-deck deterministic TWO-turn proxy lines, not games.
 */
const run=(seed,scenario,second=false)=>proxy.one(source.cards,seed,{
  goal:'wipe-lock',scenario,second,trace:true
});
const star=r=>r.trace.filter(row=>row[1]==='star');

test('rulebox: Tool-granted Star Alchemy can fetch DDE under Pokemon Ability denial',()=>{
  const r=run(1188942899,'rulebox');
  assert.ok(r.trace.some(row=>row[1]==='tool'&&row[2]?.[1]==='Forest Seal Stone'));
  assert.deepEqual(star(r),[[2,'star','Double Dragon Energy']]);
  assert.equal(r.vstarSpent,true);
  assert.equal(r.ready,true);
  assert.equal(r.apex,true);
});

test('rulebox going second: Stone remains available to find Regidrago VSTAR',()=>{
  const r=run(322965286,'rulebox',true);
  assert.deepEqual(star(r),[[2,'star','Regidrago VSTAR']]);
  assert.equal(r.vstarSpent,true);
});

test('turn-2 Rule Box and Item locks do not themselves suppress Stone Ability',()=>{
  const r=run(4082728996,'t2-both');
  assert.deepEqual(star(r),[[2,'star','Regidrago VSTAR']]);
  assert.equal(r.vstarSpent,true);
});

test('clean: Regidrago V with Forest Seal Stone uses real turn-1 Star',()=>{
  const r=run(801665942,'clean');
  assert.deepEqual(star(r),[[1,'star','Double Dragon Energy']]);
  assert.equal(r.vstarSpent,true);
});

test('clean with own Active Wobbuffet: its lock does not suppress the Tool Ability',()=>{
  // The fixed deal opens Wobbuffet Active, puts Forest Seal Stone on
  // Benched Regidrago V, and uses Star on turn 1 before switching.
  const r=run(1861883004,'clean');
  assert.deepEqual(star(r),[[1,'star','Double Dragon Energy']]);
  assert.equal(r.vstarSpent,true);
  assert.equal(r.ready,true);
});

test('turn-2 Garbotoxin suppresses Pokemon Abilities, not the Tool ability',()=>{
  const r=run(4082728996,'garbotoxin');
  assert.deepEqual(star(r),[[2,'star','Regidrago VSTAR']]);
  assert.equal(r.vstarSpent,true);
});
