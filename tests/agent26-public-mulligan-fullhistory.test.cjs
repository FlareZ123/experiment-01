'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const manifest=require('../results/aichi-2026/full-decklists.json');
const {publicMulliganPosterior}=
  require('../scripts/aichi-public-mulligan-posterior.cjs');
const {nonBasicInventory,logFailedHandMass,
  publicFailedHandHistoryPosterior:posterior}=
  require('../scripts/agent26-public-mulligan-fullhistory.cjs');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,
  String(a)+' != '+String(b));
const rank=number=>manifest.decks.find(x=>x.rank===number);
const first=[
  'Plumeria','Plumeria','Plumeria','Plumeria',
  'Speed Lightning Energy','Speed Lightning Energy','Speed Lightning Energy'
];
const second=[
  'Speed Lightning Energy','Speed Lightning Energy',
  'Speed Lightning Energy','Speed Lightning Energy',
  'Plumeria','Plumeria','Plumeria'
];

test('full seven-card multinomial hypergeometric mass is exact',()=>{
  const inv=nonBasicInventory(rank(6));
  assert.equal(inv.basics,4);
  near(Math.exp(logFailedHandMass(inv,first)),4/386206920);
  assert.equal(logFailedHandMass(inv,[
    'Iron Thorns ex',...first.slice(0,6)]),-Infinity);
  near(logFailedHandMass(inv,first),logFailedHandMass(inv,
    [...first].reverse()));
});

test('single complete failed hand plus valid terminal is source-probabilistic',()=>{
  const r=posterior(manifest,[first]);
  assert.equal(r.knownRecoveredRanks,29);
  assert.deepEqual(r.omittedSourceRanks,[23,25,28]);
  assert.deepEqual(r.sourceIdentitiesCompatible,[6,24,29]);
  near(r.models.reduce((s,x)=>s+x.posterior,0),1);
  assert.ok(r.models.every(x=>x.posterior>=0&&x.posterior<=1));
  assert.ok(r.eventProbabilityUnderKnownField>0);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('repeated invalid seven is allowed after complete reshuffle',()=>{
  const inv=nonBasicInventory(rank(6));
  const p=1-0.6005003742553344;
  const likelihood=Math.exp(logFailedHandMass(inv,first)*2)*p;
  near(likelihood,(4/386206920)**2*p);
  const doubled=posterior(manifest,[first,first]);
  assert.deepEqual(doubled.sourceIdentitiesCompatible,[6,24,29]);
  const switched=posterior(manifest,[second,first]);
  const reversed=posterior(manifest,[first,second]);
  for(let i=0;i<29;i++)near(switched.models[i].posterior,
    reversed.models[i].posterior);
});

test('exclusive full public Evolution reveal identifies the eligible known original',()=>{
  const publicHand=[
    'Shadow Rider Calyrex VMAX',"Lillie's Determination",
    "Lillie's Determination",'Carmine','Iono','Teammates','Raihan'
  ];
  const r=posterior(manifest,[publicHand]);
  assert.deepEqual(r.sourceIdentitiesCompatible,[1]);
  near(r.models[0].posterior,1);
  near(r.posteriorEntropyBits,0);
});

test('zero invalid sevens matches existing exactly-zero posterior',()=>{
  const exact=publicMulliganPosterior(manifest,
    {kind:'exactlyFailedHands',count:0});
  const full=posterior(manifest,[]);
  near(full.models.filter(x=>[6,24,29].includes(x.rank))
    .reduce((s,x)=>s+x.posterior,0),exact.groupPosterior);
  near(full.eventProbabilityUnderKnownField,exact.eventProbabilityKnownField);
});

test('incompatible and malformed public histories fail closed',()=>{
  assert.throws(()=>posterior(manifest,[
    ['unknown-claim','unknown-claim','unknown-claim','unknown-claim',
    'unknown-claim','unknown-claim','unknown-claim']
  ]),/Impossible public history/);
  assert.throws(()=>posterior(manifest,[['Plumeria']]));
  const tampered=structuredClone(manifest);
  tampered.missing_full_lists=[];
  assert.throws(()=>posterior(tampered,[]));
});
