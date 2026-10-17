'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stageRank2SourceK0}=require('./rank2-full-source-k0-sampler.cjs');
const {hasBenchEvolutionTarget}=require('./bunnelby-evolution-policy.cjs');
const {evaluateDetachedDeckSamples}=require('./detached-deck-sampling.cjs');
const {deckPermutation,seededRandom}=require('./headless.cjs');
const {choose}=require('./redeal-posterior.cjs');
const {normalizeDeepClonePrototypes,assertVendorCloneCompatibleSource}=
  require('./normalize-deep-clone.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine=name=>require(path.join(output,name));

/** @param {object} player */
function fingerprint(player){
  const full=card=>[card.fullName,card.id];
  return {
    deck:player.deck.cards.map(full),
    prizes:player.prizes.map(slot=>slot.cards.map(full)),
    active:player.active.cards.map(full),
    bench:player.bench.map(slot=>slot.cards.map(full)),
    hand:player.hand.cards.map(full)
  };
}

/**
 * Construct two distinct physical 60-card rank-2 distributions with exactly
 * one common revealed Prize at the same position. That positional memory does
 * not expose whether both Gloom cards are among the other face-down Prizes.
 * This is a hypothetical observation conditioning of the prepared real Store,
 * not a demonstrated naturally dealt and legally observed game history.
 */
function auditRank2PartiallyObservedPrize(){
  const available=stageRank2SourceK0(false);
  const fullyPrized=stageRank2SourceK0(true);
  const pairs=[available,fullyPrized];
  const knownIndex=2;
  assert.deepEqual(available.observed,fullyPrized.observed);
  const known=available.player.prizes[knownIndex].cards[0];
  assert.ok(known);
  assert.equal(fullyPrized.player.prizes[knownIndex].cards[0].fullName,
    known.fullName,'Common revealed Prize must have same identity');
  assert.equal(hasBenchEvolutionTarget(available.player),true);
  assert.equal(hasBenchEvolutionTarget(fullyPrized.player),false);

  const {deepClone}=engine('utils');
  const {Card}=engine('game/store/card/card');
  const options={
    seed:20261017,samples:24,random:seededRandom,
    permutation:deckPermutation,isCard:card=>card instanceof Card,
    sampleUnknownPrizes:true,prizeObservationLedgerComplete:true,
    deckPrizePartitionUnknownVerified:true,
    observedPrizeSlots:[{
      prizeIndex:knownIndex,cardIndex:0,fullName:known.fullName
    }]
  };
  const results=[];
  for(const source of pairs){
    const snapshot=fingerprint(source.player);
    assertVendorCloneCompatibleSource(source.state);
    let samples=0;
    const probability=evaluateDetachedDeckSamples(
      source.state,source.player.id,{},0,cloned=>{
        const player=cloned.players.find(p=>p.id===source.player.id);
        assert.equal(player.prizes[knownIndex].cards[0].fullName,
          known.fullName,'Revealed Prize must be preserved in every sample');
        samples++;
        return Number(hasBenchEvolutionTarget(player));
      },null,current=>normalizeDeepClonePrototypes(current,deepClone(current)),
      options
    );
    assert.equal(samples,options.samples);
    assert.deepEqual(fingerprint(source.player),snapshot,
      'Detached evaluation cannot change live source deck or Prizes');
    results.push(probability);
  }
  assert.equal(results[0],results[1],
    'Revealed-Prize-equivalent source 60s must receive equal posterior scores');
  // After excluding one known Prize, the remaining 51 unseen cards have five
  // Prize positions. Both Gloom cards are in the other 51-card pool.
  const bothGloomInHiddenPrizesNumerator=choose(49,3);
  const denominator=choose(51,5);
  const expectedBothPrized=Number(bothGloomInHiddenPrizesNumerator)/
    Number(denominator);
  return {
    sourceRank:2,physicalPrintCards:60,remainingDeck:46,
    observedPrizeName:known.fullName,observedPrizeIndex:knownIndex,
    remainingUnknownPrizeSlots:5,unknownPoolCount:51,
    physicallyPrizedGloom:[0,2],pairedSampleScores:results,
    exactBothGloomPrizedConditional:expectedBothPrized,
    exactNumerator:bothGloomInHiddenPrizesNumerator.toString(),
    exactDenominator:denominator.toString(),
    sourceStatePreserved:true,
    scope:'Source-printed hypothetical observed-Prize Store fixture; no live search chronology or game strength'
  };
}

if(require.main===module) console.log(JSON.stringify(
  auditRank2PartiallyObservedPrize(),null,2));
module.exports={auditRank2PartiallyObservedPrize};
