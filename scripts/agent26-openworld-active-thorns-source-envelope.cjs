'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./aichi-opening-basics.cjs');
const {publicFailedHandHistoryPosterior}=
  require('./agent26-public-mulligan-fullhistory.cjs');
const {unknownHistoryUpper}=
  require('./agent26-openworld-mulligan-source-envelope.cjs');

const VERSION='agent26-openworld-active-thorns-source-envelope-v1';
const ACTIVE='Iron Thorns ex';
const VERIFIED_SOURCE_RANKS=[6,24,29];
const DENOM=Number(choose(60,7));

/**
 * Exact source-specific identity gate, confirmed from all 29 original 60s.
 * Only three known lists have any Iron Thorns ex. Each consists of precisely
 * four identical Basic Iron Thorns ex Pokémon and no other Pokémon.
 * An ordinary valid seven therefore forces Active Iron Thorns ex, regardless
 * of owner setup preferences. Nonmatching known lists cannot show it Active.
 *
 * @param {object} manifest Exact 29 original decklists.
 * @returns {number[]} Source ranks whose Active is necessarily Iron Thorns ex.
 */
function forcedThornsSourceRanks(manifest){
  assert.equal(manifest.decks.length,29);
  const carriers=manifest.decks.filter(deck=>
    deck.cards.some(c=>c.category==='Pokémon'&&c.name===ACTIVE));
  const ranks=carriers.map(x=>x.rank).sort((a,b)=>a-b);
  assert.deepEqual(ranks,VERIFIED_SOURCE_RANKS,
    'Original-source active inventory changed: recheck assumptions');
  for(const deck of carriers){
    const pokemon=deck.cards.filter(x=>x.category==='Pokémon');
    assert.equal(pokemon.length,1,'Other Pokémon invalidate forced Active');
    assert.equal(pokemon[0].name,ACTIVE);
    assert.equal(pokemon[0].count,4,
      'Original-source forced Active count changed');
  }
  return ranks;
}

/**
 * Upper probability that a fresh valid seven contains the observed
 * Basic Pokémon for a missing legal sixty, given the ordinary 4-copy limit.
 * Unknown human Active selection is bounded above by choosing this Pokémon
 * whenever it is present. This is independent of any prior failed-seven
 * history because failed hands are reshuffled.
 */
function maximumUnknownThornsActiveChance(){
  return 1-Number(choose(56,7))/DENOM;
}

/**
 * A narrower open-world interval using a publicly observed Active
 * Iron Thorns ex, without assuming a human Active-selection policy.
 *
 * Known exact original lists: only ranks 6,24,29 can produce this Active,
 * and all three must when they have a legal opening. Unknown missing lists
 * can each hypothetically include up to four Iron Thorns, so bound their
 * final-seven Active chance by P(at least one of four appears).
 *
 * @param {object} manifest Exact source list manifest.
 * @param {string[][]} failedSevens Publicly revealed invalid hands.
 * @param {string} activeName Opponent face-up Active name.
 * @returns {object}
 */
function activeThornsOpenWorldEnvelope(manifest,failedSevens,activeName){
  assert.equal(activeName,ACTIVE,
    'Only the source-verified forced-Thorns-Active case is supported');
  const forcedRanks=forcedThornsSourceRanks(manifest);
  const posterior=publicFailedHandHistoryPosterior(manifest,failedSevens);
  const allKnownMass=29*posterior.eventProbabilityUnderKnownField;
  const knownRows=posterior.models.filter(x=>forcedRanks.includes(x.rank))
    .map(x=>({rank:x.rank,knownEventProbability:
      allKnownMass*x.posterior}));
  const knownMass=knownRows.reduce((sum,x)=>sum+x.knownEventProbability,0);
  const singleMissingUpper=unknownHistoryUpper(failedSevens)*
    maximumUnknownThornsActiveChance();
  const missingMassUpper=3*singleMissingUpper;
  const denominator=knownMass+missingMassUpper;
  assert.ok(denominator>0);
  const knownTotalLower=knownMass/denominator;
  const ranges=knownRows.map(x=>({
    rank:x.rank,
    givenKnownOriginalsAndVisibleActive:x.knownEventProbability/knownMass,
    minimumAcross32:x.knownEventProbability/denominator,
    maximumAcross32:x.knownEventProbability/knownMass
  }));
  return {
    version:VERSION,activeName,
    evidence:'public Active plus public failed Basic-free sevens',
    forcedKnownRanks:forcedRanks,
    knownOriginals:29,unknownOriginals:3,
    unknownOriginalRanks:[23,25,28],
    knownForcedThornsTotalLikelihood:knownMass,
    missingUnknownThornsActiveChanceUpper:
      maximumUnknownThornsActiveChance(),
    missingTotalEventLikelihoodUpper:missingMassUpper,
    knownSourcePosteriorMassLower:knownTotalLower,
    missingSourcePosteriorMassUpper:1-knownTotalLower,
    ranges,
    ownerActiveChoiceModel:'known-original forced; unknown missing arbitrarily adversarial',
    noOpponentConcealedZonesUsed:true,
    fullGames:0,competitiveQualifiedGames:0
  };
}

if(require.main===module){
  const manifest=require('../results/aichi-2026/full-decklists.json');
  const receipts=require('../results/statistics/agent26-real-native-source6-public-mulligan-six.json');
  const rows=receipts.rows.map(row=>{
    const r=activeThornsOpenWorldEnvelope(manifest,
      row.firstPublicHand?[row.firstPublicHand]:[],ACTIVE);
    const rank6=r.ranges.find(x=>x.rank===6);
    return {seed:row.seed,candidateSeat:row.candidateSeat,
      publicMulligans:row.sourceMulligans,
      rank6Lower:rank6.minimumAcross32,
      rank6Upper:rank6.maximumAcross32,
      knownSourceMassLower:r.knownSourcePosteriorMassLower,
      omittedSourceMassUpper:r.missingSourcePosteriorMassUpper};
  });
  process.stdout.write(JSON.stringify({version:VERSION,
    source:'six genuine rank6 native public opening receipts',
    engineRunId:receipts.ci.runId,rows,competitiveQualifiedGames:0},null,2)+'\n');
}

module.exports={VERSION,ACTIVE,forcedThornsSourceRanks,
  maximumUnknownThornsActiveChance,activeThornsOpenWorldEnvelope};
