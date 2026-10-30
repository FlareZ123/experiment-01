'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const manifest=require('../results/aichi-2026/full-decklists.json');
const {publicMulliganPosterior}=
  require('../scripts/aichi-public-mulligan-posterior.cjs');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,
  String(a)+' != '+String(b));
const evidence=(event)=>publicMulliganPosterior(manifest,event);

test('known 29-source prior is exactly 3/29 original Iron Thorns sources',()=>{
  const r=evidence({kind:'atLeastFailedHands',count:0});
  close(r.groupPrior,3/29);
  close(r.groupPosterior,3/29);
  assert.equal(r.knownRanks,29);
  assert.deepEqual(r.missingRanks,[23,25,28]);
  assert.deepEqual(r.groupRanks,[6,24,29]);
});

test('publicly revealed Speed Lightning Energy uniquely identifies recovered original Iron Thorns group',()=>{
  const r=evidence({kind:'namedRevealed',name:'Speed Lightning Energy'});
  close(r.groupPosterior,1);
  close(r.eventProbabilityKnownField,0.04021701208818536);
  assert.deepEqual(r.byRank.filter(x=>x.likelihood>0).map(x=>x.rank),
    [6,24,29]);
  for(const x of r.byRank.filter(x=>x.group))
    close(x.likelihood,0.38876445018579175);
});

test('one public Plumeria is suggestive, not exclusive to the Iron Thorns group',()=>{
  const r=evidence({kind:'namedRevealed',name:'Plumeria'});
  close(r.groupPosterior,0.8208649760868474);
  close(r.eventProbabilityKnownField,0.048993456000406096);
  assert.deepEqual(r.byRank.filter(x=>x.likelihood>0).map(x=>x.rank),
    [2,3,6,7,9,16,24,29]);
});

test('absence of exposed Speed Lightning reduces but does not eliminate source hypothesis',()=>{
  const r=evidence({kind:'namedNotRevealed',name:'Speed Lightning Energy'});
  close(r.groupPosterior,0.06588079239813878);
  assert.ok(r.groupPosterior>0);
});

test('mulligan depth alone sharpens known original source recognition',()=>{
  for(const [k,posterior,eventProb] of [
    [1,0.297555063401821,0.20877053027107492],
    [2,0.5898218276635039,0.06324540545357084],
    [3,0.8201508800771918,0.02731299648281535],
    [4,0.9319199292845595,0.01443436845990068]
  ]){
    const r=evidence({kind:'atLeastFailedHands',count:k});
    close(r.groupPosterior,posterior);
    close(r.eventProbabilityKnownField,eventProb);
  }
});

test('exactly K failed hands is a distinct conditioning event',()=>{
  const ge1=evidence({kind:'atLeastFailedHands',count:1});
  const exact1=evidence({kind:'exactlyFailedHands',count:1});
  assert.ok(exact1.groupPosterior<ge1.groupPosterior);
  assert.ok(exact1.eventProbabilityKnownField<
    ge1.eventProbabilityKnownField);
});

test('unknown printings and unrecovered source ranks are never silently imputed',()=>{
  assert.throws(()=>publicMulliganPosterior(manifest,
    {kind:'atLeastFailedHands',count:1},[23]));
  assert.throws(()=>evidence({kind:'namedRevealed',
    name:'invented-never-seen-source-card'}),/Impossible public/);
  const modified=structuredClone(manifest);
  modified.decks=modified.decks.slice(1);
  assert.throws(()=>publicMulliganPosterior(modified,
    {kind:'atLeastFailedHands',count:1}));
});

test('an unrecognized observation or malformed group is fail-closed',()=>{
  assert.throws(()=>evidence({kind:'wrong-event'}),/Unsupported public/);
  assert.throws(()=>evidence({kind:'atLeastFailedHands',count:-1}));
  assert.throws(()=>publicMulliganPosterior(manifest,
    {kind:'atLeastFailedHands',count:1},[6,6]),/Duplicate/);
});
