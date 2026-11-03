'use strict';

const assert = require('node:assert/strict');
const {choose} = require('./agent25-dhelmise-t1-physical-opportunity.cjs');
const candidate = require('../results/als/agent25-dhelmise-mixed-lock-answers-v2.json');
const field = require('../results/aichi-2026/full-decklists.json');

const VERSION = 'agent25-vileplume-pokestop-postlock-screen-v1';
const discardItemIds = Object.freeze([
  'xy4-92', 'sv8-164', 'sm6-113', 'swsh1-179'
]);

/**
 * Exact finite-population reference for random nonreplacement positions
 * exposed to a Stadium across distinct turns. Mandatory draw positions
 * between uses remain random and do not count as Stadium discards.
 *
 * This deliberately assumes the Stadium remains continuously in play,
 * that all eligible donors are among the live deck cards, and that no
 * additional card movement or opponent effects intervene. It is a
 * conditional hypergeometric sample, not an early-game probability.
 *
 * @param {{liveDeck:number,eligibleDonors:number,uses:number,
 *   threshold?:number,cardsPerUse?:number}} options
 */
function stadiumThreshold({liveDeck,eligibleDonors,uses,
    threshold=4,cardsPerUse=3}) {
  for (const value of [liveDeck,eligibleDonors,uses,threshold,cardsPerUse])
    assert.ok(Number.isSafeInteger(value)&&value>=0);
  assert.ok(eligibleDonors<=liveDeck);
  assert.ok(uses>0&&cardsPerUse>0&&threshold>0);
  const seen=uses*cardsPerUse;
  assert.ok(seen+uses<=liveDeck,
    'allow one ordinary draw before each Stadium use');
  const denominator=choose(liveDeck,seen);
  let numerator=0n;
  for (let k=threshold;k<=Math.min(eligibleDonors,seen);k++) {
    numerator+=choose(eligibleDonors,k)*
      choose(liveDeck-eligibleDonors,seen-k);
  }
  return {
    liveDeck,eligibleDonors,uses,threshold,cardsPerUse,seen,
    favorableWorlds:numerator.toString(),
    totalWorlds:denominator.toString(),
    probability:Number(numerator)/Number(denominator),
    allEligibleDonorsInitiallyInDeckAssumed:true,
    uninterruptedStadiumUsesAssumed:true,
    ordinaryDrawsDoNotCountAsDonorDiscards:true,
    nativeGameAndMatchupUnverified:true
  };
}

/** Count current immutable candidate trainer channels by printed ID. */
function candidateChannels() {
  assert.equal(candidate.cards.reduce((s,c)=>s+c.count,0),60);
  const itemDonorOutlets=candidate.cards
    .filter(c=>discardItemIds.includes(c.id))
    .map(c=>({name:c.name,count:c.count,id:c.id}));
  const stadium=candidate.cards.find(c=>c.id==='pgo-68');
  assert.ok(stadium);
  const faba=candidate.cards.find(c=>c.id==='sm8-173');
  assert.ok(faba);
  return {
    itemDonorOutlets,
    itemOutletCopies:itemDonorOutlets.reduce((n,c)=>n+c.count,0),
    stadiumDiscardOutlet:{id:stadium.id,name:stadium.name,count:stadium.count},
    fabaSupporterCopies:faba.count
  };
}

/** Original authenticated source printing presence only, not built board. */
function sourceLockSources() {
  assert.equal(field.published_deck_count,29);
  const result=[];
  for (const deck of field.decks) {
    const count=(name,set,number)=>deck.cards
      .filter(c=>c.name===name&&c.printing?.set===set&&
        c.printing?.number===number)
      .reduce((n,c)=>n+c.count,0);
    const vileplume=count('Vileplume','AOR','3');
    if (!vileplume) continue;
    result.push({
      rank:deck.rank, archetype:deck.archetype,
      itemLockVileplumeCopies:vileplume,
      activeSupporterLockStoutlandCopies:count('Stoutland','BCR','122'),
      basicAbilityLockSilentLabCopies:count('Silent Lab','PRC','140'),
      printedPresenceOnly:true
    });
  }
  return result;
}

function study() {
  const source=sourceLockSources();
  const channels=candidateChannels();
  assert.deepEqual(source.map(s=>s.rank),[2,15]);
  assert.equal(channels.itemOutletCopies,12);
  return {
    version:VERSION,originalCandidateSixtyUnchanged:true,
    knownOriginalItemLockSources:source,
    candidateChannels:channels,
    onePokestopPrizedInSixProbability:6/60,
    directPokestopInOpeningEightUnconditional:8/60,
    referenceGivenAllEightDonorsInLive47:
      [1,2,3,4].map(uses=>stadiumThreshold({
        liveDeck:47,eligibleDonors:8,uses})),
    itemAndSupporterLockNeedDirectDiscardOutlet:true,
    pokestopReplacingSilentLabRemovesBasicAbilitySuppression:true,
    noCompleteOriginalSourceGameTested:true,
    competitivelyQualifiedGames:0
  };
}

module.exports={VERSION,discardItemIds,stadiumThreshold,candidateChannels,
  sourceLockSources,study};
if(require.main===module)
  process.stdout.write(JSON.stringify(study(),null,2)+'\n');
