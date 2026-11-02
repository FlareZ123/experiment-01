'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./aichi-opening-basics.cjs');
const {countBasics,EVOLUTIONS}=
  require('./aichi-field-mulligan-census.cjs');
const {nonBasicInventory,logFailedHandMass}=
  require('./agent26-public-mulligan-fullhistory.cjs');
const {unknownHistoryUpper}=
  require('./agent26-openworld-mulligan-source-envelope.cjs');

const VERSION='agent26-public-active-robust-source-intervals-v1';
const DEN=Number(choose(60,7));
const UNKNOWN_MAX_ACTIVE=1-Number(choose(56,7))/DEN;

/**
 * Count the physical copies of a named ordinary Basic Pokémon in an
 * original published sixty. This uses the audited printed-card evolution
 * registry rather than name-only inference.
 * @param {object} deck Published original source 60.
 * @param {string} activeName Face-up Active Pokémon name.
 */
function sourceBasicActiveCounts(deck,activeName){
  assert.ok(typeof activeName==='string'&&activeName.length>0);
  const basics=countBasics(deck);
  let named=0;
  for(const card of deck.cards){
    const id=card.printing?.set+'-'+card.printing?.number;
    if(card.category==='Pokémon'&&!EVOLUTIONS.has(id)&&
      card.name===activeName)named+=card.count;
  }
  assert.ok(named<=basics);
  return {named,basics};
}

/**
 * For any legal choice of one Active Basic from an independent final seven:
 * LOWER: hand has at least one named Basic and no *other* Basic, so choosing
 * the named Active is forced.
 * UPPER: hand has at least one named Basic, so choosing it is possible.
 *
 * Hands having no Basic are excluded automatically by both events.
 * These are joint event masses over all C(60,7) possible final sevens,
 * rather than conditional probabilities within only valid sevens.
 */
function activeChoiceProbabilityBounds(named,basics){
  assert.ok(Number.isSafeInteger(named)&&named>=0&&named<=basics);
  assert.ok(Number.isSafeInteger(basics)&&basics>=1&&basics<=60);
  const forced=(Number(choose(60-basics+named,7))-
    Number(choose(60-basics,7)))/DEN;
  const present=1-Number(choose(60-named,7))/DEN;
  assert.ok(forced>=0&&present+1e-12>=forced);
  return {forced,present};
}

/**
 * Partial identification from a publicly observed Active and complete
 * publicly revealed invalid sevens. No model of how a human chooses an
 * Active when several Basics coexist. Each known source's event likelihood
 * is independently interval-bounded; for missing source 60s, max four
 * printed copies of the named ordinary Basic are allowed.
 *
 * For known rank i, lower posterior = lowerEvent_i /
 *   (lowerEvent_i + sum(other upperEvents) + 3 missingUpper);
 * upper posterior = upperEvent_i / (upperEvent_i + sum(other lowerEvents)).
 * Missing ranks are unlabeled unknown hypotheses, not invented 60s.
 *
 * Only conventional Basic-setup Actives are supported; any tournament
 * print with an alternate special setup rule needs a separate proof.
 *
 * @param {object} manifest Exactly 29 original published sixties.
 * @param {string[][]} failedSevens Genuine publicly exposed Basic-free hands.
 * @param {string} activeName Face-up opponent Active name.
 */
function publicActiveRobustIntervals(manifest,failedSevens,activeName){
  assert.equal(manifest.decks.length,29);
  assert.deepEqual(manifest.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b),
    [23,25,28]);
  assert.ok(typeof activeName==='string'&&activeName.length>0);
  assert.ok(Array.isArray(failedSevens));
  const sources=manifest.decks.map(deck=>{
    const {named,basics}=sourceBasicActiveCounts(deck,activeName);
    const choice=activeChoiceProbabilityBounds(named,basics);
    const inventory=nonBasicInventory(deck);
    let logFailed=0;
    for(const hand of failedSevens){
      const piece=logFailedHandMass(inventory,hand);
      logFailed+=piece;
    }
    const failedMass=Number.isFinite(logFailed)?Math.exp(logFailed):0;
    return {rank:deck.rank,basics,activeCopies:named,
      lowerEvent:failedMass*choice.forced,
      upperEvent:failedMass*choice.present};
  }).sort((a,b)=>a.rank-b.rank);
  const knownLower=sources.reduce((n,x)=>n+x.lowerEvent,0);
  const knownUpper=sources.reduce((n,x)=>n+x.upperEvent,0);
  const oneMissingUpper=unknownHistoryUpper(failedSevens)*
    UNKNOWN_MAX_ACTIVE;
  const missingUpper=3*oneMissingUpper;
  if(knownUpper===0&&missingUpper===0){
    return {version:VERSION,status:'OUTSIDE_SUPPORTED_32_SOURCE_EVENT',
      activeName,knownSourceRanks:29,missingSourceRanks:[23,25,28],
      explanation:'No recovered or unrestricted missing source could produce this publicly reported setup under ordinary Basic rules',
      sources:[],competitiveQualifiedGames:0};
  }
  const safeRatio=(numerator,denominator)=>
    denominator===0?0:numerator/denominator;
  const ranges=sources.map(row=>{
    const otherUpper=Math.max(0,knownUpper-row.upperEvent);
    const otherLower=Math.max(0,knownLower-row.lowerEvent);
    const posteriorLower=safeRatio(row.lowerEvent,
      row.lowerEvent+otherUpper+missingUpper);
    const posteriorUpper=safeRatio(row.upperEvent,
      row.upperEvent+otherLower);
    return {...row,posteriorLower,posteriorUpper};
  });
  return {
    version:VERSION,
    status:knownUpper===0?'KNOWN_29_IMPOSSIBLE':'BOUNDED',
    activeName,knownSourceRanks:29,missingSourceRanks:[23,25,28],
    evidence:'visible initial Active and fully public invalid seven hands',
    unknownActiveUpper:UNKNOWN_MAX_ACTIVE,
    totalKnownLikelihoodLower:knownLower,
    totalKnownLikelihoodUpper:knownUpper,
    omittedTotalLikelihoodUpper:missingUpper,
    knownPosteriorMassLower:
      safeRatio(knownLower,knownLower+missingUpper),
    unknownPosteriorMassUpper:
      safeRatio(missingUpper,knownLower+missingUpper),
    ranges,
    realOwnerActiveSelectionUnspecified:true,
    originalSourceCardPrintingsRequired:true,
    usedConcealedOpponentState:false,
    competitiveQualifiedGames:0
  };
}

if(require.main===module){
  const original=require('../results/aichi-2026/full-decklists.json');
  const receipts=require('../results/statistics/agent26-real-native-source6-public-mulligan-six.json');
  const rows=receipts.rows.map(x=>{
    const r=publicActiveRobustIntervals(original,
      x.firstPublicHand?[x.firstPublicHand]:[],'Iron Thorns ex');
    const six=r.ranges.find(y=>y.rank===6);
    return {seed:x.seed,candidateSeat:x.candidateSeat,rank6PosteriorLower:
      six.posteriorLower,rank6PosteriorUpper:six.posteriorUpper,
      missingTotalUpper:r.unknownPosteriorMassUpper};
  });
  process.stdout.write(JSON.stringify({version:VERSION,rows,
    nativeOriginalSetupReceiptRun:receipts.ci.runId,
    qualification:'pure public-source mathematical bounds only'},null,2)+'\n');
}
module.exports={VERSION,sourceBasicActiveCounts,
  activeChoiceProbabilityBounds,publicActiveRobustIntervals};
