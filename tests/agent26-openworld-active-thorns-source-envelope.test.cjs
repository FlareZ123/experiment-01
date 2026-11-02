'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const manifest=require('../results/aichi-2026/full-decklists.json');
const receipts=require('../results/statistics/agent26-real-native-source6-public-mulligan-six.json');
const {openWorldSourceEnvelope}=
  require('../scripts/agent26-openworld-mulligan-source-envelope.cjs');
const {ACTIVE,forcedThornsSourceRanks,
  maximumUnknownThornsActiveChance,activeThornsOpenWorldEnvelope}=
  require('../scripts/agent26-openworld-active-thorns-source-envelope.cjs');
const close=(a,b,eps=1e-12)=>
  assert.ok(Math.abs(a-b)<=eps,`Expected ${a} to match ${b}`);

test('authenticated published sources force one Iron Thorns active on a valid seven',()=>{
  assert.deepEqual(forcedThornsSourceRanks(manifest),[6,24,29]);
  close(maximumUnknownThornsActiveChance(),0.3994996257446656);
  const modified=structuredClone(manifest);
  modified.decks.find(x=>x.rank===6).cards.push({
    category:'Pokémon',name:'Different Basic',count:1
  });
  assert.throws(()=>forcedThornsSourceRanks(modified),
    /Other Pokémon invalidate forced Active/);
});

test('source identity robust bound incorporates public Active without a chooser model',()=>{
  const row=receipts.rows.find(x=>x.seed===4136149016&&x.candidateSeat===0);
  const history=[row.firstPublicHand];
  const standard=openWorldSourceEnvelope(manifest,history);
  const x=activeThornsOpenWorldEnvelope(manifest,history,ACTIVE);
  const six=x.ranges.find(x=>x.rank===6);
  close(six.minimumAcross32,0.0038910505836575876);
  close(six.maximumAcross32,1);
  assert.ok(six.minimumAcross32>
    standard.sourceBounds.find(x=>x.rank===6).posteriorLowerAcross32);
  assert.deepEqual(x.forcedKnownRanks,[6,24,29]);
  assert.equal(x.competitiveQualifiedGames,0);
});

test('no failed seven plus observed Thorns Active leaves three known feasible sources',()=>{
  const row=receipts.rows.find(x=>x.seed===1514735430&&x.candidateSeat===0);
  assert.equal(row.sourceMulligans,0);
  const x=activeThornsOpenWorldEnvelope(manifest,[],ACTIVE);
  const six=x.ranges.find(x=>x.rank===6);
  close(six.minimumAcross32,1/6);
  close(six.maximumAcross32,1/3);
  close(x.knownSourcePosteriorMassLower,1/2);
  assert.equal(x.ranges.length,3);
  assert.throws(()=>activeThornsOpenWorldEnvelope(manifest,[],'Regidrago V'),
    /Only the source-verified/);
});

test('all six original Store public receipts match independent active-conditioned envelopes',()=>{
  const expected=[
    [4136149016,0,0.0038910505836575876,1],
    [4136149016,1,0.0021849963583394027,0.391304347826087],
    [1514735430,0,1/6,1/3],
    [1514735430,1,0.002911208151382824,0.4615384615384615],
    [3730833191,0,0.0006506180871828237,1],
    [3730833191,1,0.0012970168612191958,1/3]
  ];
  for(const [seed,seat,lower,upper] of expected){
    const row=receipts.rows.find(x=>x.seed===seed&&x.candidateSeat===seat);
    assert.ok(row);
    const x=activeThornsOpenWorldEnvelope(manifest,
      row.firstPublicHand?[row.firstPublicHand]:[],ACTIVE);
    const six=x.ranges.find(x=>x.rank===6);
    close(six.minimumAcross32,lower);
    close(six.maximumAcross32,upper);
    close(x.knownSourcePosteriorMassLower+
      x.missingSourcePosteriorMassUpper,1);
  }
});
