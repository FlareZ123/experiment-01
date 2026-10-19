'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { probeDittoStage2 } = require('../simulation/twinleaf/ditto-stage2-store-probe.cjs');

test('authentic pinned Store head swaps active Ditto into directly selected Stage 2', () => {
  assert.deepEqual(probeDittoStage2(false), {
    targetStage: 4, coinWaits: 1, reflipPrompts: 0, choicePrompts: 1,
    toolConserved: true, energyConserved: true, damageConserved: true,
    dittoReturned: true, targetRetained: true
  });
});

test('authentic pinned Store Glimwood allows exactly one tails-to-heads redo', () => {
  assert.deepEqual(probeDittoStage2(true), {
    targetStage: 4, coinWaits: 2, reflipPrompts: 1, choicePrompts: 1,
    toolConserved: true, energyConserved: true, damageConserved: true,
    dittoReturned: true, targetRetained: true
  });
});

test('native Ditto Stage-2 Vileplume stops both players from playing Items', () => {
  assert.deepEqual(probeDittoStage2(false, true).itemLock, {
    ownerBlocked: true,
    opponentBlocked: true
  });
});

test('rank-7 Wobbuffet alone does not pierce Vileplume Stealthy Hood', () => {
  assert.deepEqual(probeDittoStage2(false, true, 'wobbuffet-bare').itemLock, {
    ownerBlocked: true, opponentBlocked: true,
    hoodSuppressed: false, vileplumeSuppressed: false
  });
});

test('unpatched pinned Tool Jammer fails its printed Tool suppression', () => {
  assert.deepEqual(probeDittoStage2(false, true, 'wobbuffet-jammer-native').itemLock, {
    ownerBlocked: true, opponentBlocked: true,
    hoodSuppressed: false, vileplumeSuppressed: false
  });
});

test('shared research Tool Jammer hook permits Wobbuffet to suppress active Vileplume', () => {
  assert.deepEqual(probeDittoStage2(false, true, 'wobbuffet-jammer-hooked').itemLock, {
    ownerBlocked: false, opponentBlocked: false,
    hoodSuppressed: true, vileplumeSuppressed: true
  });
});

test('native owner/defender Switch hand plays are blocked while transformed Hood lock holds', () => {
  for (const seat of [0, 1]) {
    const result = probeDittoStage2(false, true, 'none', seat).nativeItemPlay;
    assert.equal(result.seat, seat);
    assert.equal(result.accepted, false);
    assert.equal(result.itemStillInHand, true);
    assert.deepEqual(result.unresolvedPromptKinds, []);
  }
});

test('native Wobbuffet + Tool Jammer Switch attempts distinguish raw engine and correction', () => {
  for (const seat of [0, 1]) {
    const raw = probeDittoStage2(false, true, 'wobbuffet-jammer-native', seat).nativeItemPlay;
    const corrected = probeDittoStage2(false, true, 'wobbuffet-jammer-hooked', seat).nativeItemPlay;
    assert.equal(raw.accepted, false);
    assert.equal(raw.itemStillInHand, true);
    assert.equal(corrected.accepted, true);
    assert.ok(corrected.unresolvedPromptKinds.includes('ChoosePokemonPrompt'),
      'Accepted Switch should offer an actual Bench-target prompt');
    assert.equal(corrected.switchPromptResolved, true);
    assert.equal(corrected.activeAfterSwitch, 'Pidgey MEW');
    assert.equal(corrected.originalActiveOnBench, true);
    assert.equal(corrected.vileplumeAbilitySuppressedAfter, false);
    assert.equal(corrected.itemLockRestoredAfterSwitch, true);
  }
});
