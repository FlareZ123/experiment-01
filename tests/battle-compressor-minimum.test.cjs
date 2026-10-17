'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {probe}=require('../simulation/twinleaf/battle-compressor-zero-prompt.cjs');

test('pinned Battle Compressor erroneously permits choosing zero',()=>{
  const p=probe();
  assert.equal(p.min,0);
  assert.equal(p.acceptsZero,true);
  assert.equal(p.acceptsOne,true);
  assert.equal(p.inPlay,true);
});

test('opt-in correction requires one while preserving legal one-card selection',()=>{
  const p=probe(true);
  assert.equal(p.min,1);
  assert.equal(p.acceptsZero,false);
  assert.equal(p.acceptsOne,true);
});

test('the research correction is fully reversible',()=>{
  assert.equal(probe().acceptsZero,true);
  assert.equal(probe(true).acceptsZero,false);
  assert.equal(probe().acceptsZero,true);
});

test('pinned empty selection defers Item cleanup through the shuffle prompt',()=>{
  const baseline=probe(false,true),completed=probe(false,true,false,true);
  assert.equal(baseline.selectionResolution,'accepted');
  assert.equal(baseline.deckSizeAfter,baseline.deckSize);
  assert.equal(baseline.discardedItem,false);
  assert.equal(baseline.itemStillInSupporterZone,true);
  assert.deepEqual(baseline.pendingPromptsAfterSelection,['ShuffleDeckPrompt']);
  assert.equal(completed.discardedItemAfterCompletion,true);
  assert.equal(completed.itemStillInSupporterZoneAfterCompletion,false);
  assert.equal(completed.deckSizeAfterCompletion,completed.deckSize);
  assert.deepEqual(completed.pendingPromptsAfterCompletion,[]);
});

test('corrected zero selection is rejected and one-card selection completes cleanup',()=>{
  const corrected=probe(true,true);
  assert.equal(corrected.selectionResolution,'rejected');
  assert.equal(corrected.deckSizeAfter,corrected.deckSize);
  const legal=probe(true,false,true,true);
  assert.equal(legal.selectionResolution,'accepted');
  assert.equal(legal.deckSizeAfterCompletion,legal.deckSize-1);
  assert.equal(legal.discardedItemAfterCompletion,true);
  assert.equal(legal.itemStillInSupporterZoneAfterCompletion,false);
  assert.deepEqual(legal.pendingPromptsAfterCompletion,[]);
});
