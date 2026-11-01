'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runAstralBarrageNative,stagedAstralBarrage}=
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

test('pinned Store illegitimately accepts two damage placements on the same target; opt-in CRE74 guard rejects and preserves pending state',()=>{
  const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
  const {AttackAction}=require(path.join(output,
    'game/store/actions/game-actions'));
  const {ResolvePromptAction}=require(path.join(output,
    'game/store/actions/resolve-prompt-action'));

  const original=stagedAstralBarrage(2);
  original.store.dispatch(new AttackAction(original.a.id,'Astral Barrage'));
  const oldPrompt=original.state.prompts.find(p=>p.result===undefined);
  assert.equal(oldPrompt.options.min,2);
  assert.equal(oldPrompt.validate([original.b.active,original.b.active],
    original.state),true,
  'Pinned ChoosePokemonPrompt validates duplicates even though print says 2 Pokémon');
  original.store.dispatch(new ResolvePromptAction(oldPrompt.id,
    [original.b.active,original.b.active]));
  assert.deepEqual([
    original.b.active.damage,original.b.bench[0].damage
  ],[100,0],'Ungarded real Store places five counters twice on same Pokémon');

  const guarded=stagedAstralBarrage(2);
  withPaperAstralBarrageTargets(()=>{
    guarded.store.dispatch(new AttackAction(guarded.a.id,'Astral Barrage'));
    const prompt=guarded.state.prompts.find(p=>p.result===undefined);
    assert.ok(prompt,'Corrected printed CRE74 prompt must remain pending');
    assert.equal(prompt.validate([guarded.b.active,guarded.b.active],
      guarded.state),true,'Original validator misses duplicate identity');
    assert.throws(()=>guarded.store.dispatch(new ResolvePromptAction(prompt.id,
      [guarded.b.active,guarded.b.active])),
    /PAPER_ASTRAL_BARRAGE_REJECTED:INVALID_PRINTED_TARGETS/);
    assert.strictEqual(prompt.result,undefined,
      'Forbidden reply must be rejected before native prompt resolution');
    assert.deepEqual([
      guarded.b.active.damage,guarded.b.bench[0].damage
    ],[0,0],'Rejected target choice must leave game board unchanged');
    guarded.store.dispatch(new ResolvePromptAction(prompt.id,
      [guarded.b.active,guarded.b.bench[0]]));
    assert.deepEqual([
      guarded.b.active.damage,guarded.b.bench[0].damage
    ],[50,50],'Legal distinct selection still resolves normally');
  });
});

test('the reversible research hook restores the pinned card reducer even on an exception',()=>{
  const output=path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output');
  const {ShadowRiderCalyrexV}=require(path.join(output,
    'sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-v'));
  const original=ShadowRiderCalyrexV.prototype.reduceEffect;
  const {Store}=require(path.join(output,'game/store/store'));
  const dispatch=Store.prototype.dispatch;
  assert.throws(()=>withPaperAstralBarrageTargets(()=>{
    assert.notStrictEqual(ShadowRiderCalyrexV.prototype.reduceEffect,original);
    throw new Error('intentional research-scope exception');
  }),/intentional research-scope exception/);
  assert.strictEqual(ShadowRiderCalyrexV.prototype.reduceEffect,original);
  assert.strictEqual(Store.prototype.dispatch,dispatch);
});
