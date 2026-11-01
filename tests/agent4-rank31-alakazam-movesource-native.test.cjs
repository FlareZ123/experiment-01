'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {probeTwoSourcePainfulSpoons}=
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
