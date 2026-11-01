'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {probeTwoSourcePainfulSpoons,probeTwoSourcePrizeInflation}=
  require('../simulation/twinleaf/agent4-rank31-alakazam-movesource-native.cjs');

test('authenticated exact source rank31 includes one Radiant Alakazam SIT59',()=>{
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const source=roster.decks.find(row=>row.rank===31);
  assert.ok(source);
  const family=source.cards.filter(row=>row.name==='Radiant Alakazam');
  assert.deepEqual(family.map(row=>({
    count:row.count,set:row.printing.set,number:row.printing.number
  })),[{count:1,set:'SIT',number:'59'}]);
});

test('paper-only scoped guard rejects a source-split before native damage moves',()=>{
  const v=probeTwoSourcePainfulSpoons({guarded:true});
  assert.equal(v.nativeOptions.singleSourceTarget,true);
  assert.equal(v.nativeValidatorAccepted,false);
  assert.match(v.nativeStoreError,
    /PAPER_PAINFUL_SPOONS_REJECTED:INVALID_PRINTED_MOVE_SOURCE/);
  assert.equal(v.nativePromptSettled,false);
  assert.deepEqual(v.after,{active:10,bench0:10,bench1:0},
    'Printed-illegal two-source transfer cannot mutate physical counters');
});

test('opt-in native guard permits two counters from one physically damaged opposing source',()=>{
  const v=probeTwoSourcePainfulSpoons({guarded:true,sameSource:true});
  assert.equal(v.nativeOptions.singleSourceTarget,true);
  assert.equal(v.nativeValidatorAccepted,true);
  assert.equal(v.nativeStoreError,null);
  assert.equal(v.nativePromptSettled,true);
  assert.deepEqual(v.before,{active:20,bench0:10,bench1:0});
  assert.deepEqual(v.after,{active:0,bench0:10,bench1:20});
});

test('scoped Radiant hook restores vendor and Store prototypes on synchronous exception',()=>{
  const output=path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output');
  const {RadiantAlakazam}=require(path.join(output,
    'sets/09-sword-and-shield/set-silver-tempest/radiant-alakazam'));
  const {Store}=require(path.join(output,'game/store/store'));
  const priorReduce=RadiantAlakazam.prototype.reduceEffect;
  const priorDispatch=Store.prototype.dispatch;
  const {withPaperPainfulSpoonsSingleSource}=require(
    '../simulation/twinleaf/agent4-painful-spoons-single-source-hook.cjs');
  assert.throws(()=>withPaperPainfulSpoonsSingleSource(()=>{
    assert.notStrictEqual(RadiantAlakazam.prototype.reduceEffect,priorReduce);
    assert.notStrictEqual(Store.prototype.dispatch,priorDispatch);
    throw new Error('intentional source research exit');
  }),/intentional source research exit/);
  assert.strictEqual(RadiantAlakazam.prototype.reduceEffect,priorReduce);
  assert.strictEqual(Store.prototype.dispatch,priorDispatch);
});

test('pinned real Painful Spoons MoveDamagePrompt accepts two distinct opposing sources into one destination',()=>{
  const v=probeTwoSourcePainfulSpoons();
  assert.equal(v.nativeOptions.singleDestinationTarget,true);
  assert.equal(v.nativeOptions.singleSourceTarget,false);
  assert.equal(v.nativeOptions.min,1);
  assert.equal(v.nativeOptions.max,2);
  assert.equal(v.nativeValidatorAccepted,true);
  assert.equal(v.nativeStoreError,null);
  assert.equal(v.nativePromptSettled,true);
  assert.deepEqual(v.before,{active:10,bench0:10,bench1:0});
  assert.deepEqual(v.after,{active:0,bench0:0,bench1:20});
});

test('native conditional Prize effect distinguishes two-source reply from paper guard',()=>{
  const a=probeTwoSourcePrizeInflation(false);
  const b=probeTwoSourcePrizeInflation(true);
  assert.equal(a.nativeValidatorAccepted,true);
  assert.equal(a.nativeDispatchRejection,null);
  assert.equal(a.victimInDiscard,true);
  assert.equal(a.prizesTaken,2);
  assert.equal(b.nativeValidatorAccepted,false);
  assert.match(b.nativeDispatchRejection,/PAPER_PAINFUL_SPOONS_REJECTED/);
  assert.equal(b.victimInDiscard,false);
  assert.equal(b.prizesTaken,0);
});
