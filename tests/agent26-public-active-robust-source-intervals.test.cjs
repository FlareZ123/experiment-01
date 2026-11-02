'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const manifest=require('../results/aichi-2026/full-decklists.json');
const receipts=require('../results/statistics/agent26-real-native-source6-public-mulligan-six.json');
const {activeThornsOpenWorldEnvelope}=
  require('../scripts/agent26-openworld-active-thorns-source-envelope.cjs');
const {sourceBasicActiveCounts,activeChoiceProbabilityBounds,
  publicActiveRobustIntervals}=
  require('../scripts/agent26-public-active-robust-source-intervals.cjs');
const close=(actual,expected,tolerance=1e-12)=>
  assert.ok(Math.abs(actual-expected)<=tolerance,
    `Expected ${actual} to match ${expected}`);

test('printed Stage-aware Basic counts yield forced/possible Active hand probabilities',()=>{
  const rank10=manifest.decks.find(x=>x.rank===10);
  assert.deepEqual(sourceBasicActiveCounts(rank10,'Regidrago V'),
    {named:4,basics:15});
  const r=activeChoiceProbabilityBounds(4,15);
  close(r.forced,0.1049203468441218);
  close(r.present,0.3994996257446656);
  const thorns=activeChoiceProbabilityBounds(4,4);
  close(thorns.forced,thorns.present);
  const zero=activeChoiceProbabilityBounds(0,15);
  assert.deepEqual(zero,{forced:0,present:0});
});

test('general model matches proven Active-only Iron Thorns source envelopes on all six native setups',()=>{
  for(const row of receipts.rows){
    const hist=row.firstPublicHand?[row.firstPublicHand]:[];
    const direct=activeThornsOpenWorldEnvelope(manifest,hist,'Iron Thorns ex');
    const generic=publicActiveRobustIntervals(manifest,hist,'Iron Thorns ex');
    assert.equal(generic.status,'BOUNDED');
    const r6=generic.ranges.find(x=>x.rank===6);
    const fixed=direct.ranges.find(x=>x.rank===6);
    close(r6.posteriorLower,fixed.minimumAcross32);
    close(r6.posteriorUpper,fixed.maximumAcross32);
    close(generic.knownPosteriorMassLower,
      direct.knownSourcePosteriorMassLower);
    const compatible=generic.ranges.filter(x=>x.upperEvent>0).map(x=>x.rank);
    assert.ok(compatible.length>=1&&compatible.length<=3);
    assert.ok(compatible.every(rank=>[6,24,29].includes(rank)));
  }
});

test('mixed-Basic Regidrago V Active is bounded without guessing which legal Active human chooses',()=>{
  const r=publicActiveRobustIntervals(manifest,[],'Regidrago V');
  assert.equal(r.status,'BOUNDED');
  const source=r.ranges.find(x=>x.rank===10);
  close(source.posteriorLower,0.02422388778970133);
  close(source.posteriorUpper,0.30484540324539555);
  close(r.unknownPosteriorMassUpper,0.5412250536182445);
  assert.equal(r.ranges.filter(x=>x.activeCopies>0).length,9);
});

test('unknown-only or impossible disclosed sevens fail closed without inventing a known source',()=>{
  const novel=['Potion','Potion','Potion','Potion',
    'Great Ball','Great Ball','Great Ball'];
  const possible=publicActiveRobustIntervals(manifest,[novel],'Regidrago V');
  assert.equal(possible.status,'KNOWN_29_IMPOSSIBLE');
  assert.equal(possible.ranges.every(x=>x.posteriorUpper===0),true);
  assert.equal(possible.unknownPosteriorMassUpper,1);
  const impossible=publicActiveRobustIntervals(manifest,
    [Array(7).fill('Potion')],'Regidrago V');
  assert.equal(impossible.status,'OUTSIDE_SUPPORTED_32_SOURCE_EVENT');
  assert.equal(impossible.competitiveQualifiedGames,0);
});
