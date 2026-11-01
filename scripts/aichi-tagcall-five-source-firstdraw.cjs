'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {countBasics}=require('./aichi-field-mulligan-census.cjs');
const {exactFirstDrawDeals,rate}=
  require('./aichi-rank6-tagcall-firstdraw-access.cjs');

const VERSION='agent6-five-exact-source-tagcall-k0-prize-census-v1';
const SELECTED_RANKS=Object.freeze([2,6,15,24,29]);

/**
 * Source-locked exact first-ordinary-turn Tag Call and G&H event. The
 * probabilities condition on a Basic-valid opening seven, then draw six
 * Prizes and one ordinary card. No opponent-mulligan bonus draws, other
 * card effects, opponent pressure or native action execution are modeled.
 * "requiredStadium" is 0 when the printed owner 60 has no Thunder Mountain.
 *
 * @param {object} manifest Original field manifest with printed sixties.
 * @returns {object} Exact five-rank joint accessibility census.
 */
function censusFirstDrawTagCall(manifest){
  assert.equal(manifest?.decks?.length,29,'Expected 29 verified source lists');
  assert.equal(manifest.missing_full_lists?.length,3);
  const rows=[];
  for(const deck of manifest.decks){
    const count=name=>deck.cards.filter(x=>x.name===name)
      .reduce((sum,x)=>sum+x.count,0);
    const tagCount=count('Tag Call');
    const halaCount=count('Guzma & Hala');
    if(tagCount===0&&halaCount===0)continue;
    assert.ok(tagCount>0&&halaCount>0,
      'Unexpected targetless or connectorless deck: '+deck.rank);
    const basicCount=countBasics(deck);
    const stadiumCount=count('Thunder Mountain ♢');
    assert.ok(stadiumCount===0||stadiumCount===1,
      'Unsupported multi-Stadium objective: '+deck.rank);
    const remainder=60-basicCount-tagCount-halaCount-stadiumCount;
    assert.ok(remainder>=0);
    const exact=exactFirstDrawDeals({counts:[
      basicCount,tagCount,halaCount,stadiumCount,remainder
    ],openingHand:7,prizes:6});
    const fractions={};
    for(const key of [
      'tagHeld','tagHeldNoHala','tagNoHalaTargetMountain',
      'tagNoHalaMountainPrized','tagNoHalaBothHalaPrized',
      'tagNoHalaBothFailure'
    ]){
      fractions[key]={numerator:exact[key].toString(),
        denominator:exact.valid.toString(),
        percent:100*rate(exact[key],exact.valid)};
    }
    rows.push({rank:deck.rank,player:deck.player,
      archetype:deck.archetype,basicCount,tagCount,halaCount,
      requiredThunderMountainCount:stadiumCount,
      initialSevenBasicValidPhysicalDeals:
        (exact.valid/47n).toString(),
      physicalDealDenominator:exact.valid.toString(),
      fractions,
      conditionalTargetAndStadiumAccessGivenHeldTagNoHalaPercent:
        100*rate(exact.tagNoHalaTargetMountain,exact.tagHeldNoHala)
    });
  }
  rows.sort((a,b)=>a.rank-b.rank);
  assert.deepEqual(rows.map(x=>x.rank),SELECTED_RANKS,
    'Original field connector incidence changed, re-audit source lists');
  // The 3 Iron Thorns control decks have the same combinatorial
  // opening categories despite different unrelated printed 51 cards.
  const thorns=rows.filter(x=>[6,24,29].includes(x.rank));
  assert.equal(new Set(thorns.map(x=>[
    x.basicCount,x.tagCount,x.halaCount,
    x.requiredThunderMountainCount
  ].join('/'))).size,1);
  return {version:VERSION,originalExactSources:manifest.decks.length,
    listedRanks:SELECTED_RANKS,opportunitiesAreNotWins:true,
    qualifiedCompetitiveGames:0,
    model:'Basic-valid seven, six Prizes, one first ordinary draw, no bonus',
    rows};
}

/** @param {string} root Repository root containing source JSON. */
function fromRepository(root){
  const original=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  return censusFirstDrawTagCall(original);
}

if(require.main===module)
  process.stdout.write(JSON.stringify(
    fromRepository(path.resolve(__dirname,'..')),null,2)+'\n');

module.exports={VERSION,SELECTED_RANKS,censusFirstDrawTagCall,fromRepository};
