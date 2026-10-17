'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {runMatch} = require('../simulation/twinleaf/headless.cjs');
const {resolveManifestFile} = require('../simulation/twinleaf/resolve-field.cjs');

test('an observed K1 source-deck policy requires the separate K0 source flag',()=>{
  assert.throws(()=>runMatch({
    deckA:Array(60).fill('sentinel A'),
    deckB:Array(60).fill('sentinel B'),
    seed:1,bunnelbyObservedK1:true,maxActions:1
  }),/Observed K1 requires the source-60 Bunnelby K0 option/);
});

test('Bunnelby guarded K1 option is explicit and preserves both physical source seats',()=>{
  const source=resolveManifestFile(
    path.resolve(__dirname,'../results/aichi-2026/full-decklists.json'),
    {allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true}
  );
  const rank2=source.decks.find(deck=>deck.rank===2);
  const rank1=source.decks.find(deck=>deck.rank===1);
  assert.ok(rank2?.playableUnderEngine && rank1?.playableUnderEngine);
  const cases=[[rank2.cardIds,rank1.cardIds],[rank1.cardIds,rank2.cardIds]];
  for(let seat=0;seat<cases.length;seat++){
    const [deckA,deckB]=cases[seat];
    const result=runMatch({
      deckA,deckB,seed:20363065,maxActions:6,
      bunnelbyK0SafeEvolution:true,bunnelbyObservedK1:true,
      bunnelbyTargetAwareEvolution:true,
      bunnelbyGuzmaHalaMode1:true,
      label:'source-rank-2-guarded-k1-smoke-seat'+seat
    });
    assert.equal(result.bunnelbyK0SafeEvolution,true);
    assert.equal(result.bunnelbyObservedK1,true);
    assert.equal(result.bunnelbyTargetAwareEvolution,true);
    assert.equal(result.bunnelbyGuzmaHalaMode1,true);
    assert.match(result.policy,/BunnelbyGuzmaHalaMode1-v1/);
    assert.match(result.policy,/BunnelbyStageTargetResolver-v1/);
    assert.match(result.policy,/BunnelbyRootObservedK1-v1/);
    assert.equal(result.deckHashes.length,2);
    assert.equal(result.actions<=6,true);
    assert.equal(result.finished || result.endReason==='action-limit',true);
  }
});

test('target-aware policy also requires the source K0 gate',()=>{
  assert.throws(()=>runMatch({
    deckA:Array(60).fill('A'),deckB:Array(60).fill('B'),
    seed:1,bunnelbyTargetAwareEvolution:true,maxActions:1
  }),/Target-aware Evolution requires the source-60 Bunnelby K0 option/);
});

test('mode1 policy requires a source-conditioned Bunnelby gate',()=>{
  assert.throws(()=>runMatch({
    deckA:Array(60).fill('A'),deckB:Array(60).fill('B'),
    seed:1,bunnelbyGuzmaHalaMode1:true,maxActions:1
  }),/Guzma Hala mode1 requires the source-60 Bunnelby K0 option/);
});
