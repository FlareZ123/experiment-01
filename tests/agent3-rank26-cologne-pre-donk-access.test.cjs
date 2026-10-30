'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {exactCologneAccess}=
  require('../scripts/agent3-rank26-cologne-pre-donk-access.cjs');
const manifest=require('../results/aichi-2026/full-decklists.json');

test('original rank26 includes one Cologne, four Mail, three Order Pad',()=>{
  const d=manifest.decks.find(x=>x.rank===26);
  const n=name=>d.cards.filter(c=>c.name===name)
    .reduce((s,c)=>s+c.count,0);
  assert.equal(n('Canceling Cologne'),1);
  assert.equal(n("Trainers' Mail"),4);
  assert.equal(n('Order Pad'),3);
  assert.equal(n('Meloetta ex'),1);
  assert.equal(n('Counter Catcher'),1);
});

test('joint exact held and search access independently matches Python sum',()=>{
  const v=exactCologneAccess(4,3);
  for(const [key,target] of Object.entries({
    direct:0.12659262707380411,
    withMail:0.1607204015003114,
    withMailAndOrderPad:0.2962734244432057,
    validSourceSeven:0.8093533072892635
  })){
    assert.ok(Math.abs(v[key]-target)<1e-11,
      `${key}: ${v[key]} vs ${target}`);
  }
  assert.ok(v.numerators.withPad>v.numerators.withMail);
  assert.ok(v.numerators.withMail>v.numerators.direct);
});

test('probe ablations and invalid copies',()=>{
  const zero=exactCologneAccess(0,0);
  const mail=exactCologneAccess(4,0);
  const pad=exactCologneAccess(0,3);
  assert.ok(Math.abs(zero.withMailAndOrderPad-zero.direct)<1e-11);
  assert.ok(mail.withMailAndOrderPad>zero.withMailAndOrderPad);
  assert.ok(pad.withMailAndOrderPad>mail.withMailAndOrderPad);
  assert.throws(()=>exactCologneAccess(5,3),RangeError);
  assert.throws(()=>exactCologneAccess(-1,3),RangeError);
});
