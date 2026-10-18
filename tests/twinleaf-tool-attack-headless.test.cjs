'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {runMatch} = require('../simulation/twinleaf/headless.cjs');
const {resolveManifestFile} = require('../simulation/twinleaf/resolve-field.cjs');

/** @returns {Map<number, string[]>} Published paper-source card IDs. */
function sourceDecks() {
  const field = resolveManifestFile(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),
    {allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  return new Map([1,2,26].map(rank => {
    const row = field.decks.find(deck => deck.rank === rank);
    assert.ok(row?.playableUnderEngine, 'Source missing for rank '+rank);
    assert.equal(row.cardIds.length,60);
    return [rank,row.cardIds];
  }));
}

test('a seat-specific Tool policy needs the explicit valid opt-in',()=>{
  const req={deckA:Array(60).fill('A'),deckB:Array(60).fill('B'),
    seed:1,maxActions:1};
  assert.throws(()=>runMatch({...req,toolAttackAwarenessSeat:1}),
    /Seat-specific Tool attack policy requires enabled/);
  assert.throws(()=>runMatch({...req,toolAttackAwareness:true,
    toolAttackAwarenessSeat:2}),/seat 0 or 1/);
});

test('headless Tool attack enumeration is opt-in and seat scoped',()=>{
  const source=sourceDecks();
  const req={deckA:source.get(1),deckB:source.get(26),
    seed:20261018,maxActions:2};
  const baseline=runMatch(req);
  const one=runMatch({...req,toolAttackAwareness:true,
    toolAttackAwarenessSeat:1});
  const both=runMatch({...req,toolAttackAwareness:true});
  assert.equal(baseline.toolAttackAwareness,false);
  assert.equal(baseline.toolAttackAwarenessSeat,null);
  assert.doesNotMatch(baseline.policy,/ToolAttackEnumerate-v1/);
  assert.equal(one.toolAttackAwareness,true);
  assert.equal(one.toolAttackAwarenessSeat,1);
  assert.match(one.policy,/ToolAttackEnumerate-v1@seat1/);
  assert.equal(both.toolAttackAwareness,true);
  assert.equal(both.toolAttackAwarenessSeat,null);
  assert.match(both.policy,/ToolAttackEnumerate-v1@both/);
  assert.deepEqual(one.deckHashes,baseline.deckHashes);
  assert.deepEqual(both.deckHashes,baseline.deckHashes);
});

test('Tool attack awareness composes with source-safe Bunnelby evolution',()=>{
  const source=sourceDecks();
  const outcome=runMatch({deckA:source.get(2),deckB:source.get(1),
    seed:20261018,maxActions:3,toolAttackAwareness:true,
    toolAttackAwarenessSeat:0,bunnelbyK0SafeEvolution:true,
    bunnelbyTargetAwareEvolution:true});
  assert.equal(outcome.toolAttackAwarenessSeat,0);
  assert.equal(outcome.bunnelbyK0SafeEvolution,true);
  assert.equal(outcome.bunnelbyTargetAwareEvolution,true);
  assert.match(outcome.policy,/ToolAttackEnumerate-v1@seat0/);
  assert.match(outcome.policy,/BunnelbySourceK0PossibleEvolution-v1/);
  assert.match(outcome.policy,/BunnelbyStageTargetResolver-v1/);
});
