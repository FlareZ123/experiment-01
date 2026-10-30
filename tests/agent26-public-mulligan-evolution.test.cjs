'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const manifest=require('../results/aichi-2026/full-decklists.json');
const {publicMulliganPosterior}=
  require('../scripts/aichi-public-mulligan-posterior.cjs');
const {nextValidHandMarkerChance,updateDeckHypotheses}=
  require('../scripts/agent26-public-mulligan-inference-boundary.cjs');

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,`${a} versus ${b}`);

test('public failed-hand disclosure includes a non-Basic Evolution Pokemon',()=>{
  const r=publicMulliganPosterior(manifest,
    {kind:'namedRevealed',name:'Shadow Rider Calyrex VMAX'},[1]);
  near(r.groupPosterior,1);
  near(r.eventProbabilityKnownField,0.0738982157634045/29);
  assert.deepEqual(r.byRank.filter(x=>x.likelihood>0).map(x=>x.rank),[1]);
});

test('Regidrago VSTAR disclosure is possible and limited to its actual sources',()=>{
  const r=publicMulliganPosterior(manifest,
    {kind:'namedRevealed',name:'Regidrago VSTAR'},[10]);
  assert.ok(r.eventProbabilityKnownField>0);
  assert.ok(r.byRank.filter(x=>x.likelihood>0).length>=5);
  assert.ok(r.byRank.filter(x=>x.likelihood>0)
    .every(x=>manifest.decks.find(d=>d.rank===x.rank)
      .cards.some(c=>c.name==='Regidrago VSTAR')));
});

test('Basic Pokemon cannot appear in a failed Basic-free seven',()=>{
  assert.throws(()=>publicMulliganPosterior(manifest,
    {kind:'namedRevealed',name:'Iron Thorns ex'}),/Impossible public/);
});

test('reveals never remove a fixed known-deck marker from next valid hand',()=>{
  near(nextValidHandMarkerChance({basics:4,markers:4}),
    0.36396950356706015);
  near(nextValidHandMarkerChance({basics:14,markers:4}),
    0.38397952352370834);
  const m=updateDeckHypotheses([
    {id:'low-basic',prior:0.5,basics:4,markers:4},
    {id:'high-basic',prior:0.5,basics:14,markers:4}
  ],'marker-ever');
  near(m.models[0].posterior,0.8402762504906349);
  near(m.models[0].nextValidHandMarkerChance,0.36396950356706015);
  near(m.models[1].nextValidHandMarkerChance,0.38397952352370834);
  const none=updateDeckHypotheses([
    {id:'low-basic',prior:0.5,basics:4,markers:4},
    {id:'high-basic',prior:0.5,basics:14,markers:4}
  ],'no-mulligan');
  near(none.models[0].posterior,0.31683463533901846);
  assert.ok(none.posteriorPredictiveMarkerChance>
    m.posteriorPredictiveMarkerChance);
});
