'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runAstralBarrageNative}=
  require('../simulation/twinleaf/agent4-astral-barrage-native-probe.cjs');
const {withPaperAstralBarrageTargets}=
  require('../simulation/twinleaf/agent4-astral-barrage-active-target-hook.cjs');

test('authenticated original champion rank1 contains three CRE74 Astral Barrage V',()=>{
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const d=roster.decks.find(row=>row.rank===1);
  assert.equal(d?.archetype,'Shadow Rider Calyrex');
  assert.deepEqual(d.cards.filter(row=>
    row.name==='Shadow Rider Calyrex V').map(row=>({
      count:row.count,set:row.printing.set,number:row.printing.number
    })),[{count:3,set:'CRE',number:'74'}]);
});

test('actual pinned Store wrongly omits a sole opposing Active, corrected native hook puts five counters',()=>{
  const original=runAstralBarrageNative({benchCount:0,corrected:false});
  const corrected=runAstralBarrageNative({benchCount:0,corrected:true});
  assert.equal(original.availableOpponentPokemon,1);
  assert.equal(original.nativePrompt,null);
  assert.deepEqual(original.targetDamage,[0]);
  assert.deepEqual(corrected.nativePrompt,
    {type:'ChoosePokemonPrompt',min:1,max:1,allowedActive:true});
  assert.deepEqual(corrected.targetDamage,[50]);
  assert.deepEqual(corrected.pendingPrompts,[]);
});

test('actual pinned Store chooses one of two opposing Pokémon instead of both; corrected hook chooses two',()=>{
  const original=runAstralBarrageNative({benchCount:1,corrected:false});
  const corrected=runAstralBarrageNative({benchCount:1,corrected:true});
  assert.equal(original.nativePrompt?.min,1);
  assert.equal(original.nativePrompt?.max,1);
  assert.deepEqual(original.targetDamage,[50,0]);
  assert.equal(corrected.nativePrompt?.min,2);
  assert.equal(corrected.nativePrompt?.max,2);
  assert.deepEqual(corrected.targetDamage,[50,50]);
  assert.deepEqual(corrected.pendingPrompts,[]);
});

test('with two Benched opponents, the patched reducer preserves existing two distinct genuine native targets',()=>{
  const original=runAstralBarrageNative({benchCount:2,corrected:false});
  const corrected=runAstralBarrageNative({benchCount:2,corrected:true});
  assert.equal(original.nativePrompt?.min,2);
  assert.deepEqual(original.targetDamage,[50,50,0]);
  assert.deepEqual(corrected.nativePrompt,original.nativePrompt);
  assert.deepEqual(corrected.targetDamage,original.targetDamage);
});

test('the reversible research hook restores the pinned card reducer even on an exception',()=>{
  const output=path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output');
  const {ShadowRiderCalyrexV}=require(path.join(output,
    'sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-v'));
  const original=ShadowRiderCalyrexV.prototype.reduceEffect;
  assert.throws(()=>withPaperAstralBarrageTargets(()=>{
    assert.notStrictEqual(ShadowRiderCalyrexV.prototype.reduceEffect,original);
    throw new Error('intentional research-scope exception');
  }),/intentional research-scope exception/);
  assert.strictEqual(ShadowRiderCalyrexV.prototype.reduceEffect,original);
});
