'use strict';

const assert=require('node:assert/strict');

const BASIC_ENERGY_NAMES=Object.freeze(new Set([
  'Grass Energy','Fire Energy','Water Energy','Lightning Energy',
  'Psychic Energy','Fighting Energy','Darkness Energy','Metal Energy',
  'Fairy Energy'
]));

/** @param {object} deck @param {string} name @returns {number} */
const copies=(deck,name)=>deck.cards
  .filter(card=>card.name===name)
  .reduce((sum,card)=>sum+card.count,0);

/**
 * Name/count source roster audit only, not a probability or behavior model.
 * @param {{decks:object[]}} manifest Exact original Aichi Top32 inventory
 * @returns {object}
 */
function sourcePrintedRecoveryCoverage(manifest){
  assert.ok(Array.isArray(manifest.decks));
  const ranks=new Set();
  const rows=manifest.decks.map(deck=>{
    assert.ok(Number.isSafeInteger(deck.rank)&&deck.rank>=1&&deck.rank<=32);
    assert.ok(!ranks.has(deck.rank),'duplicate Aichi Top32 rank');
    ranks.add(deck.rank);
    assert.equal(deck.cards.reduce((sum,c)=>sum+c.count,0),60,
      'original source roster is not 60 rank '+deck.rank);
    const basicEnergy=deck.cards.filter(c=>c.category==='Energy'&&
      BASIC_ENERGY_NAMES.has(c.name))
      .reduce((n,c)=>n+c.count,0);
    return Object.freeze({
      rank:deck.rank,archetype:deck.archetype,
      secretBox:copies(deck,'Secret Box'),
      nightStretcher:copies(deck,'Night Stretcher'),
      energyRetrieval:copies(deck,'Energy Retrieval'),
      fogCrystal:copies(deck,'Fog Crystal'),
      rescueCarrier:copies(deck,'Rescue Carrier'),
      vipPass:copies(deck,'Battle VIP Pass'),
      basicEnergy,
      boxNightInventory:copies(deck,'Secret Box')>0&&
        copies(deck,'Night Stretcher')>0,
      boxFogInventory:copies(deck,'Secret Box')>0&&
        copies(deck,'Fog Crystal')>0
    });
  }).sort((a,b)=>a.rank-b.rank);

  const filtered=(predicate)=>rows.filter(predicate);
  return Object.freeze({
    sourceRosterCount:rows.length,
    unauthenticatedRanks:Array.from({length:32},(_,i)=>i+1)
      .filter(n=>!ranks.has(n)),
    withSecretBox:filtered(x=>x.secretBox>0).map(x=>x.rank),
    withNightStretcher:filtered(x=>x.nightStretcher>0).map(x=>x.rank),
    withEnergyRetrieval:filtered(x=>x.energyRetrieval>0).map(x=>x.rank),
    boxNight:filtered(x=>x.boxNightInventory),
    boxFog:filtered(x=>x.boxFogInventory),
    empiricalMatchGames:0,
    qualification:'EXACT ORIGINAL PRINTED 60 NAME/COUNT COVERAGE ONLY'
  });
}
module.exports={BASIC_ENERGY_NAMES,copies,sourcePrintedRecoveryCoverage};
