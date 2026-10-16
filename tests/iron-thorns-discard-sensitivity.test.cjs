'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {analyze,otherHandProfiles}=require('../scripts/iron-thorns-discard-sensitivity.cjs');
const {directLineChance}=require('../scripts/iron_thorns_direct_line.cjs');
const {choose}=require('../scripts/aichi_opening_audit.cjs');
const file=path.join(__dirname,'../results/aichi-2026/full-decklists.json');
const decks=JSON.parse(fs.readFileSync(file,'utf8')).decks.filter(d=>[6,24,29].includes(d.rank));

test('exact sensitivity recovers legacy full-access probability',()=>{
  assert.equal(decks.length,3);
  for(const deck of decks){
    const count=name=>deck.cards.filter(c=>c.name===name).reduce((a,c)=>a+c.count,0);
    const old=directLineChance({
      thorns:count('Iron Thorns ex'),
      stadium:count('Thunder Mountain ♢'),
      dce:count('Double Colorless Energy'),
      guzmaHala:count('Guzma & Hala'),
      tagCall:count('Tag Call')
    });
    const next=analyze(deck);
    assert.ok(Math.abs(next.unrestricted-old.conditional)<1e-12);
    assert.ok(Math.abs(next.directInHand-old.directInHand)<1e-12);
    assert.ok(Math.abs(next.unrestricted-next.discardRequired-next.noDiscardRequired)<1e-12);
    assert.ok(next.noDiscardRequired<=next.duplicateOnly);
    assert.ok(next.duplicateOnly<=next.supporterSpent);
    assert.ok(next.supporterSpent<=next.unrestricted);
    assert.ok(Math.abs(next.duplicateBudgetDistribution.reduce((a,x)=>a+x,0)-next.discardRequired)<1e-12);
    assert.ok(Math.abs(next.supporterBudgetDistribution.reduce((a,x)=>a+x,0)-next.discardRequired)<1e-12);
  }
});

test('non-core card-name polynomial preserves physical multiplicities',()=>{
  const core=new Set(['Iron Thorns ex','Thunder Mountain ♢','Double Colorless Energy','Guzma & Hala','Tag Call']);
  for(const deck of decks){
    const other=deck.cards.filter(c=>!core.has(c.name)).reduce((a,c)=>a+c.count,0);
    const profiles=otherHandProfiles(deck);
    for(let n=0;n<=8;n++){
      const sum=profiles.filter(p=>p.n===n).reduce((a,p)=>a+p.ways,0);
      assert.ok(Math.abs(sum-choose(other,n))<0.001);
    }
  }
});
