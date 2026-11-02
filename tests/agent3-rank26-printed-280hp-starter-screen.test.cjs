'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {audit,printIndex}=require('../scripts/agent3-rank26-printed-280hp-starter-screen.cjs');

test('fail closed on an explicitly absent source printing, preserving all original rows',()=>{
  const result=audit();
  assert.equal(result.originalOpponentLists,29);
  assert.equal(result.printedPsychicDamage,280);
  assert.equal(result.rows.length,29);
  assert.ok(['complete','incomplete'].includes(result.printCoverage));
  const actualPrinting=printIndex();
  const absentSmp217=entry=>entry.name==='Trevenant & Dusknoir-GX'&&
    entry.printing.set==='SMP'&&entry.printing.number==='217'?
    null:actualPrinting(entry);
  const missing=audit(absentSmp217);
  assert.equal(missing.printCoverage,'incomplete');
  const rank1=missing.incompleteRows.find(r=>r.rank===1);
  assert.ok(rank1);
  assert.ok(rank1.unresolvedPrintings.some(x=>x.name==='Trevenant & Dusknoir-GX'&&
    x.printing.set==='SMP'&&x.printing.number==='217'));
  const source=missing.rows.find(r=>r.rank===1);
  assert.equal(source.basicCount,null);
  assert.equal(source.directRootAndForcedLone,null);
  assert.equal(source.directRootForcedLoneAndDamageSurvivor,null);
  assert.ok(source.basicCountMin<source.basicCountMax);
  assert.equal(result.rows.find(r=>r.rank===18).basicCount,16);
});

test('rank18 printed Mega Kangaskhan 300 survives ordinary 280 Crisis Punch',()=>{
  const result=audit();
  assert.deepEqual(result.exceptions.map(r=>r.rank),[18]);
  const survivor=result.exceptions[0];
  assert.equal(survivor.exceptions.length,1);
  assert.equal(survivor.exceptions[0].name,'Mega Kangaskhan ex');
  assert.equal(survivor.exceptions[0].printing.set,'MEG');
  assert.equal(survivor.exceptions[0].printing.number,'104');
  assert.equal(survivor.exceptions[0].hp,300);
  assert.equal(survivor.exceptions[0].unmodifiedPsychicDamage,280);
  assert.equal(survivor.conditionalSoleBasicSurvivesDamage,1/16);
});

test('exact 280 HP Basic still Knocked Out at full HP by 280',()=>{
  const result=audit();
  assert.deepEqual(result.exact280Boundary.map(x=>x.rank),
    [8,9,11,16,19,22]);
  assert.ok(result.exact280Boundary.some(x=>x.rank===19&&
    x.boundary[0].name==='Arceus & Dialga & Palkia-GX'));
  assert.equal(result.exceptions[0].directRootForcedLoneAndDamageSurvivor,
    result.exceptions[0].directRootAndForcedLone/16);
});

test('rank26 printed structural exception is not a measured game',()=>{
  const result=audit();
  assert.equal(result.modeledGameWins,0);
  assert.ok(result.rows.every(x=>x.directRootAndForcedLone===null||
    x.directRootAndForcedLone<0.03));
});
