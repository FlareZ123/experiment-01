'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stage} = require('./bunnelby-k0-action-contrast.cjs');
const {hasBenchEvolutionTarget} = require('./bunnelby-evolution-policy.cjs');
const {evaluateDetachedDeckSamples} = require('./detached-deck-sampling.cjs');
const {normalizeDeepClonePrototypes,assertVendorCloneCompatibleSource} =
  require('./normalize-deep-clone.cjs');
const {deckPermutation,seededRandom} = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output,name));

/** @param {object} player */
function hiddenPhysicalSnapshot(player) {
  const signature=card=>[card.fullName,card.id];
  return {
    deck:player.deck.cards.map(signature),
    prizes:player.prizes.map(slot=>slot.cards.map(signature)),
    active:player.active.cards.map(signature),
    bench:player.bench.map(slot=>slot.cards.map(signature)),
    hand:player.hand.cards.map(signature)
  };
}

/**
 * Test physical K0-indistinguishable Store partitions against an explicitly
 * conditional uniform deck/Prize sampler. The staged target deck is small,
 * so no competitive strength or actual rank-2 opening is inferred.
 */
function auditK0BunnelbyDetachedSampling() {
  const accessible=stage(false);
  const prized=stage(true);
  assert.deepEqual(accessible.view,prized.view);
  assert.equal(hasBenchEvolutionTarget(accessible.a),true);
  assert.equal(hasBenchEvolutionTarget(prized.a),false);

  const {deepClone}=engine('utils');
  const {Card}=engine('game/store/card/card');
  const options={
    samples:12,seed:20261016,permutation:deckPermutation,random:seededRandom,
    isCard:card=>card instanceof Card,
    sampleUnknownPrizes:true,prizesUnobservedVerified:true
  };
  const evidence=state=>{
    const player=state.players.find(side=>side.id===state.players[0].id);
    return hasBenchEvolutionTarget(player)?1:0;
  };
  const scores=[];
  for(const source of [accessible,prized]) {
    const before=hiddenPhysicalSnapshot(source.a);
    assertVendorCloneCompatibleSource(source.state);
    scores.push(evaluateDetachedDeckSamples(
      source.state,source.a.id,{},0,
      sample=>hasBenchEvolutionTarget(sample.players.find(
        side=>side.id===source.a.id))?1:0,
      null,current=>normalizeDeepClonePrototypes(current,deepClone(current)),
      options
    ));
    assert.deepEqual(hiddenPhysicalSnapshot(source.a),before,
      'Sampling must not change the live Store deck, prizes or board');
  }
  assert.equal(scores[0],scores[1],
    'K0-equivalent physical deck/Prize allocations must score equally');
  return {
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceBoard:'conditioned Bunnelby PRC / Oddish / TM Evolution',
    physicallyHiddenTarget:[true,false],
    pairedConditionalScores:scores,
    exactPublicStateMatch:true,
    sourceZonesPreserved:true,
    scope:'Pinned Store synthetic K0 contrast; no full-game replay or win-rate evidence'
  };
}

if(require.main===module)console.log(JSON.stringify(
  auditK0BunnelbyDetachedSampling(),null,2));
module.exports={auditK0BunnelbyDetachedSampling};
