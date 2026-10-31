'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  printCard,donorRows,effectiveDonors,prizeSurvival,
  originalSourceRanks,study
}=require('../scripts/agent25-dhelmise-hns-discard-lock.cjs');
const v0=require('../results/als/agent25-dhelmise-stage1-discard-v0.json');
const v1=require('../results/als/agent25-dhelmise-mixed-lock-donors-v1.json');

test('each exact donor ability and lock source has printed identity',()=>{
  assert.equal(printCard('me5-34').abilities[0].name,"Hide 'n' Sneak");
  assert.equal(printCard('me5-6').abilities[0].name,"Hide 'n' Sneak");
  assert.equal(printCard('me5-33').abilities[0].name,"Hide 'n' Sneak");
  assert.match(printCard('xy4-36').abilities[0].text,
    /discard pile.*no Abilities.*except for Psychic/);
  assert.match(printCard('xy5-140').rules[0],
    /Basic Pokémon.*discard pile.*no Abilities/);
  assert.match(printCard('xy9-57').abilities[0].text,
    /discard pile.*no Abilities.*except for Garbotoxin/);
  assert.equal(printCard('me5-33').types[0],'Psychic');
  assert.equal(printCard('me5-6').types[0],'Grass');
});

test('exact six-Prize obstruction probabilities by eligible donor count',()=>{
  assert.ok(Math.abs(prizeSurvival(4).unprizedAtLeastNeedProbability-
    0.6485404041957612)<1e-12);
  assert.ok(Math.abs(prizeSurvival(6).unprizedAtLeastNeedProbability-
    0.9896558115974278)<1e-12);
  assert.ok(Math.abs(prizeSurvival(8).unprizedAtLeastNeedProbability-
    0.9999412750035654)<1e-12);
  assert.equal(prizeSurvival(0).unprizedAtLeastNeedProbability,0);
  assert.equal(prizeSurvival(3).unprizedAtLeastNeedProbability,0);
});

test('Stage1-only versus mixed HNS donors respond oppositely to two locks',()=>{
  const a=donorRows(v0),b=donorRows(v1);
  assert.equal(effectiveDonors(a,'none'),8);
  assert.equal(effectiveDonors(b,'none'),8);
  assert.equal(effectiveDonors(a,'wobbuffet'),4);
  assert.equal(effectiveDonors(b,'wobbuffet'),6);
  assert.equal(effectiveDonors(a,'silentLab'),8);
  assert.equal(effectiveDonors(b,'silentLab'),6);
  assert.equal(effectiveDonors(a,'garbotoxin'),0);
  assert.equal(effectiveDonors(b,'garbotoxin'),0);
});

test('direct owner-opening physical event identical and valid-opening conditioning differs',()=>{
  const x=study();
  assert.equal(x.sourceDeckCount,29);
  assert.equal(x.competitiveQualifiedGames,0);
  assert.equal(x.variants[0].basicCount,12);
  assert.equal(x.variants[1].basicCount,14);
  assert.equal(x.variants[0].t1LocationUnconditional,
    x.variants[1].t1LocationUnconditional);
  assert.ok(x.variants[0].t1LocationConditionalBasicValid>
    x.variants[1].t1LocationConditionalBasicValid);
  assert.ok(Math.abs(x.variants[1].t1LocationConditionalBasicValid*100-
    8.408944118690072)<1e-10);
});

test('all exact published source-rank threat groups are separate',()=>{
  assert.deepEqual(originalSourceRanks('wobbuffet'),[7,10,21]);
  assert.deepEqual(originalSourceRanks('silentLab'),[9,13,15,32]);
  assert.deepEqual(originalSourceRanks('garbotoxin'),[8,11,16,22]);
  const z=study().originalSourceThreatRanks;
  assert.equal(z.activeWobbuffetPotential.length,3);
  assert.equal(z.silentLabPotential.length,4);
  assert.equal(z.toolGarbotoxinPotential.length,4);
});



test('Garbotoxin attachment condition survives Tool-effect negation',()=>{
  const garbo=printCard('xy9-57').abilities[0].text;
  assert.match(garbo,/If this Pokémon has a Pokémon Tool card attached/);
  const tower=printCard('sv6-153').rules[0];
  assert.match(tower,/Pokémon Tools attached.*have no effect/);
  assert.doesNotMatch(tower,/discard|detach|remove/i);
  const blower=printCard('sm2-125').rules[0];
  const faba=printCard('sm8-173').rules[0];
  assert.match(blower,/Pokémon Tool cards.*discard them/);
  assert.match(faba,/Pokémon Tool.*put it in the Lost Zone/);
  const patched=require('../results/als/agent25-dhelmise-mixed-lock-answers-v2.json');
  assert.equal(patched.cards.reduce((s,c)=>s+c.count,0),60);
  assert.equal(patched.cards.find(c=>c.name==='Field Blower').count,2);
  assert.equal(patched.cards.find(c=>c.name==='Faba').count,1);
  assert.ok(!patched.cards.some(c=>c.name==='Jamming Tower'));
  assert.equal(donorRows(patched).reduce((n,r)=>n+r.count,0),8);
  assert.equal(study().variants[1].basicCount,14);
});
