'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./aichi-opening-basics.cjs');
const {publicFailedHandHistoryPosterior}=
  require('./agent26-public-mulligan-fullhistory.cjs');

const VERSION='agent26-openworld-mulligan-source-envelope-v1';
const DRAW_SEVEN_DENOMINATOR=Number(choose(60,7));
const UNRESTRICTED_BASIC_ENERGY=new Set([
  'Grass Energy','Fire Energy','Water Energy','Lightning Energy',
  'Psychic Energy','Fighting Energy','Darkness Energy',
  'Metal Energy','Fairy Energy'
]);

/**
 * Safe upper probability of a specific unordered, publicly revealed
 * Basic-free seven in any otherwise unknown legal sixty.
 *
 * Non-Basic cards can have at most four copies under the printed-name rule.
 * Basic Energy has no four-copy limit, so use the conservative 60-card cap.
 * This deliberately ignores ACE SPEC, Prism Star, stage, archetype and the
 * deck's Basic-validity constraint: ignoring them can only loosen the cap.
 *
 * @param {string[]} seven Publicly observed failed seven names.
 * @returns {number} Upper likelihood, inclusive.
 */
function unknownInvalidSevenUpper(seven){
  assert.ok(Array.isArray(seven)&&seven.length===7);
  const counts=new Map();
  for(const name of seven){
    assert.ok(typeof name==='string'&&name.length>0);
    counts.set(name,(counts.get(name)??0)+1);
  }
  let numerator=1n;
  for(const [name,multiplicity] of counts){
    const maximum=UNRESTRICTED_BASIC_ENERGY.has(name)?60:4;
    numerator*=choose(maximum,multiplicity);
  }
  return Math.min(1,Number(numerator)/DRAW_SEVEN_DENOMINATOR);
}

/**
 * Missing-source worst-case event likelihood for a complete revealed
 * mulligan sequence, followed by a Basic-valid unobserved starting seven.
 * Failed sevens are returned and reshuffled independently. Multiplying
 * hand bounds is valid; the final valid-hand factor is bounded above by one.
 * A zero-mulligan event has the conservative upper bound one.
 *
 * @param {string[][]} failedSevens
 * @returns {number}
 */
function unknownHistoryUpper(failedSevens){
  assert.ok(Array.isArray(failedSevens));
  return failedSevens.reduce((mass,seven)=>
    mass*unknownInvalidSevenUpper(seven),1);
}

/**
 * Open-world posterior ENVELOPE, not an estimated posterior for the three
 * missing originals. Assign one equal prior mass to each of the 32 ranked
 * Aichi competitors. All 29 known source likelihoods are exact under the
 * public-mulligan model. Each missing source's specific event likelihood is
 * unknown, ranging conservatively from zero to unknownHistoryUpper().
 *
 * Lower = all missing sources maximizing this event's likelihood;
 * upper = all missing sources assigning zero likelihood to the event.
 * Extremes are calculated for the observed event separately and are not a
 * joint model of all events or actual missing source decks.
 *
 * @param {object} manifest The original 29 source sixty-card inventories.
 * @param {string[][]} failedSevens Opponent-facing invalid sevens.
 * @returns {object} Transparent broad bounds; no deck-win claims.
 */
function openWorldSourceEnvelope(manifest,failedSevens){
  const known=publicFailedHandHistoryPosterior(manifest,failedSevens);
  const knownCount=manifest.decks.length;
  const missingCount=manifest.missing_full_lists.length;
  const total=knownCount+missingCount;
  assert.equal(knownCount,29);
  assert.equal(missingCount,3);
  assert.equal(total,32);
  const knownEventMean=known.eventProbabilityUnderKnownField;
  const unknownEventUpper=unknownHistoryUpper(failedSevens);
  const weightedKnown=knownCount/total*knownEventMean;
  const weightedUnknownMax=missingCount/total*unknownEventUpper;
  const knownMassLower=weightedKnown/(weightedKnown+weightedUnknownMax);
  assert.ok(Number.isFinite(knownMassLower));
  const sourceBounds=known.models.map(({rank,posterior})=>({
    rank,
    posteriorConditionalOn29Known:posterior,
    posteriorLowerAcross32:posterior*knownMassLower,
    posteriorUpperAcross32:posterior
  }));
  return {
    version:VERSION,
    knownCount,missingCount,
    missingRanks:manifest.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b),
    prior:'uniform 32 original placements, exactly 29 inventories recovered',
    event:'all publicly disclosed failed seven-card names and then an unobserved valid seven',
    knownEventMean,
    missingEventLikelihoodUpper:unknownEventUpper,
    posteriorKnownSourceMassLower:knownMassLower,
    posteriorKnownSourceMassUpper:1,
    posteriorUnknownSourceMassLower:0,
    posteriorUnknownSourceMassUpper:1-knownMassLower,
    sourceBounds,
    usesNoUnseenSourceLists:true,
    sourceRankKnownToActor:false,
    fullGames:0,competitiveQualifiedGames:0,
    limitations:'Unknown-source bounds are deliberately adversarial and can be very wide; no Active-selection policy, opponent Hidden cards or missing-card substitutions are assumed.'
  };
}

if(require.main===module){
  const manifest=require('../results/aichi-2026/full-decklists.json');
  const receipts=require('../results/statistics/agent26-real-native-source6-public-mulligan-six.json');
  const rows=receipts.rows.map(row=>{
    const report=openWorldSourceEnvelope(manifest,
      row.firstPublicHand?[row.firstPublicHand]:[]);
    const rank6=report.sourceBounds.find(x=>x.rank===6);
    return {seed:row.seed,candidateSeat:row.candidateSeat,
      sourceMulligans:row.sourceMulligans,
      closed29Rank6Posterior:rank6.posteriorConditionalOn29Known,
      rank6PosteriorAcross32Lower:rank6.posteriorLowerAcross32,
      rank6PosteriorAcross32Upper:rank6.posteriorUpperAcross32,
      known29PosteriorMassLower:report.posteriorKnownSourceMassLower,
      unknown3PosteriorMassUpper:report.posteriorUnknownSourceMassUpper,
      eventKnownMean:report.knownEventMean,
      eventMissingMax:report.missingEventLikelihoodUpper};
  });
  process.stdout.write(JSON.stringify({version:VERSION,
    source:'genuine six public native source-rank6 opening receipts',
    input:receipts.ci,rows,competitiveQualifiedGames:0},null,2)+'\n');
}

module.exports={VERSION,unknownInvalidSevenUpper,unknownHistoryUpper,
  openWorldSourceEnvelope};
