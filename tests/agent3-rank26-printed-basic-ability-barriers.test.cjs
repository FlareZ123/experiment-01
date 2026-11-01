'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {audit}=require('../scripts/agent3-rank26-printed-basic-ability-barriers.cjs');

test('printed Basic opponent barriers classify from actual Ability text',()=>{
  const r=audit();
  assert.equal(r.exactOriginalSourceCount,29);
  assert.equal(r.originalRank26CancelingCologneCount,1);
  assert.equal(r.originalRank26RedeemableTicketCount,1);
  const all=r.rows.flatMap(x=>x.barriers.map(y=>({...y,rank:x.rank,
    basicCount:x.basicCount})));
  assert.deepEqual(all.filter(x=>x.kind==='EX_ATTACK_DAMAGE_PREVENTION')
    .map(x=>[x.rank,x.name,x.count,x.printing.set,x.printing.number]),
    [[3,'Mimikyu',1,'PAL','97'],[7,'Mimikyu',3,'PAL','97']]);
  assert.deepEqual(all.filter(x=>x.kind==='FIRST_TURN_BASIC_ABILITY_LOCK')
    .map(x=>[x.rank,x.name,x.count]),
    [[4,'Klefki',1],[17,'Klefki',1]]);
  assert.deepEqual(all.filter(x=>x.kind==='FIRST_TURN_RULEBOX_ABILITY_LOCK')
    .map(x=>[x.rank,x.name,x.count]),
    [[6,'Iron Thorns ex',4],[24,'Iron Thorns ex',4],
      [29,'Iron Thorns ex',4]]);
});

test('conditional sole Basic fractions use original exact physical counts',()=>{
  const r=audit(),get=n=>r.rows.find(x=>x.rank===n);
  assert.equal(get(3).basicCount,11);
  assert.equal(get(3).barriers[0].soleBasicShare,1/11);
  assert.equal(get(7).basicCount,12);
  assert.equal(get(7).barriers[0].soleBasicShare,3/12);
  assert.equal(get(4).basicCount,13);
  assert.equal(get(17).basicCount,13);
  assert.ok([6,24,29].every(n=>get(n).barriers[0].soleBasicShare===1));
  for(const x of r.rows)for(const y of x.barriers)
    assert.ok(y.jointDirectRootAndSolePrintedBarrier>0 &&
      y.jointDirectRootAndSolePrintedBarrier<.03);
});

test('GRI58 copycat Mimikyu is a distinct non-Safeguard print',()=>{
  const r=audit();
  assert.equal(r.rows.some(x=>x.rank===1),false);
  assert.equal(r.rows.some(x=>x.rank===30),false);
});
