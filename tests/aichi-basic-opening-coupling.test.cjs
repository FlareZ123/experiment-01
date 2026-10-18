'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {basicOpeningDiscordance} = require('../scripts/aichi-basic-opening-coupling.cjs');
const {expandPrintings, alignToReference} = require('../scripts/aichi-position-coupling.cjs');

/** Exhaustive distinct-index subset oracle, independent of binomial formula. */
function brute(a, b, basics, k) {
  let total = 0, mismatches = 0;
  function visit(i, chosen) {
    if (chosen.length === k) {
      const invalidA = !chosen.some(j => basics.has(a[j]));
      const invalidB = !chosen.some(j => basics.has(b[j]));
      total += 1;
      mismatches += Number(invalidA !== invalidB);
      return;
    }
    for (let j = i; j <= a.length - (k - chosen.length); j += 1) {
      visit(j + 1, [...chosen, j]);
    }
  }
  visit(0, []);
  return {total, mismatches};
}

test('exact Basic-eligibility discordance equals exhaustive tiny-deck census', () => {
  for (const {a,b,k} of [
    {a:['B','x','y','z','B','x'], b:['x','B','y','z','B','x'], k:2},
    {a:['B','x','x','x'], b:['B','B','x','x'], k:2},
    {a:['B','x','x'], b:['x','x','x'], k:2},
    {a:['B','x'], b:['x','B'], k:0}
  ]) {
    const got=basicOpeningDiscordance(a,b,new Set(['B']),k);
    const expected=brute(a,b,new Set(['B']),k);
    assert.equal(got.discordantWays,String(expected.mismatches));
    assert.equal(got.denominator,String(expected.total));
    assert.equal(got.probability,expected.mismatches/expected.total);
  }
});

test('frozen Aichi 60-card printing inputs reproduce both-order discordance', () => {
  const dir=path.resolve(__dirname,'../results/aichi-2026');
  const source=JSON.parse(fs.readFileSync(path.join(dir,'full-decklists.json'),'utf8'));
  const list=[
    source.decks.find(x=>x.rank===1).cards,
    JSON.parse(fs.readFileSync(path.join(dir,'candidate-hood-shadow-rider.json'),'utf8')).cards,
    JSON.parse(fs.readFileSync(path.join(dir,'candidate-temple-shadow-rider.json'),'utf8')).cards
  ].map(expandPrintings);
  const basicNames=new Set([
    'Shadow Rider Calyrex V', "Lillie's Clefairy ex", 'Tapu Lele-GX',
    'Trevenant & Dusknoir-GX', 'Latias ex', 'Dialga-GX',
    'Mimikyu', 'Girafarig', 'Marshadow', 'Radiant Eternatus', 'Wobbuffet'
  ]);
  const basicIds=new Set(list.flat().filter(id=>basicNames.has(JSON.parse(id)[0])));
  const aligned=[list[0],alignToReference(list[0],list[1]),alignToReference(list[0],list[2])];
  for (const [i,j,before,after] of [
    [0,1,'16290120','0'],
    [0,2,'22263164','8145060'],
    [1,2,'22263164','8145060']
  ]) {
    const raw=basicOpeningDiscordance(list[i],list[j],basicIds);
    const matched=basicOpeningDiscordance(aligned[i],aligned[j],basicIds);
    assert.equal(raw.discordantWays,before,'source '+i+'/'+j);
    assert.equal(matched.discordantWays,after,'aligned '+i+'/'+j);
    assert.equal(raw.denominator,'386206920');
    assert.equal(matched.denominator,'386206920');
    assert.deepEqual(raw.basicCounts,i===0&&j===1?[14,14]:[14,15]);
  }
});

test('invalid paired inputs are rejected',()=>{
  assert.throws(()=>basicOpeningDiscordance(['a'],[],new Set(['a'])),/Expected/);
  assert.throws(()=>basicOpeningDiscordance(['a'],['a'],[],1),/Expected/);
  assert.throws(()=>basicOpeningDiscordance(['a'],['a'],new Set(['a']),2),/Expected/);
});
