'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const r=require('../../results/aichi-2026/registrations/agent7-mail-broad-two-source-20261108.json');
const source=require('../../results/aichi-2026/full-decklists.json');
test('prospective Mail source sample preserves four immutable both-seat trials',()=>{
  assert.equal(r.status,'FROZEN_BEFORE_EXECUTION');
  assert.equal(r.trials.length,4);
  assert.deepEqual(r.sourceRanks,[9,26]);
  assert.equal(r.nativeRootActionsPerArm,160);
  assert.equal(new Set(r.trials.map(x=>x.id)).size,4);
  for(const rank of r.sourceRanks){
    const rows=r.trials.filter(x=>x.rank===rank);
    assert.equal(rows.length,2);
    assert.deepEqual(rows.map(x=>x.candidateSlot),['A','B']);
    assert.equal(rows[0].seed,rows[1].seed);
    const original=source.decks.find(d=>d.rank===rank);
    assert.ok(original);
    assert.equal(original.cards.reduce((n,x)=>n+x.count,0),60);
    const mail=original.cards.filter(x=>x.name==="Trainers' Mail");
    assert.equal(mail.length,1);
    assert.ok(mail[0].count>=3);
    assert.equal(mail[0].printing.set,'ROS');
    assert.equal(mail[0].printing.number,'92');
  }
});
