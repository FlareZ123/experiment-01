'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {exactSourcePrelockDark}=
  require('../scripts/agent3-absol-source-prelock-dark-energy.cjs');
const original=require('../results/aichi-2026/full-decklists.json');

test('source rank11 contains printed three Mega, four Letter and eight basic Dark',()=>{
  const d=original.decks.find(x=>x.rank===11);
  assert.equal(d.archetype,'Absol Garbodor');
  const count=name=>d.cards.filter(x=>x.name===name)
    .reduce((n,x)=>n+x.count,0);
  assert.equal(count('Mega Absol ex'),3);
  assert.equal(count('Professor\'s Letter'),4);
  assert.equal(count('Darkness Energy'),8);
  assert.equal(count('Garbodor'),2);
  assert.equal(count('Guzma'),2);
  assert.equal(count('Temple of Sinnoh'),2);
  assert.equal(count('Shopping Center'),2);
});

test('valid opening seven conditioning and prelock Letter Energy path',()=>{
  const r=exactSourcePrelockDark();
  const e=r.probabilities;
  assert.ok(r.denominator>r.numerators.threeDarkAccessible);
  for(const [key,expected] of Object.entries({
    letterSeen:0.42572155060647116,
    threeDarkAccessible:0.34258047222967797,
    twoDarkAccessible:0.5950394876180262,
    threeDarkNaturallyHeld:0.053883933258197174,
    megaInStartingSeven:0.4056560564875994,
    megaInStartingSevenAndThreeDarkAccessible:0.12929354360455944,
    multipleLetters:0.07319935957561052
  })){
    assert.ok(Math.abs(e[key]-expected)<1e-11,`${key} ${e[key]}`);
  }
  assert.ok(e.threeDarkAccessible>e.threeDarkNaturallyHeld);
  assert.ok(e.megaInStartingSevenAndThreeDarkAccessible<
    e.threeDarkAccessible);
});
