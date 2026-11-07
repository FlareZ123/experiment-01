'use strict';

const assert=require('node:assert/strict');

const VERSION='agent49-original-field-one-energy-box-fog-hard-coverage-v1';
const BOX='Secret Box';
const FOG='Fog Crystal';
const VIP='Battle VIP Pass';
const CARRIER='Rescue Carrier';
const BASIC='Psychic Energy';

/**
 * Count original physical copies of one card name across printing variants
 * while preserving each original source's fixed 60. This is a hard
 * card-inventory preflight, not an estimate of live draw accessibility.
 *
 * @param {object} deck Authenticated Aichi name/count inventory.
 * @param {string} name Name required by the exact recipe.
 * @returns {number}
 */
function countName(deck,name){
  assert.ok(Array.isArray(deck?.cards));
  return deck.cards.reduce((n,c)=>{
    assert.ok(Number.isSafeInteger(c.count)&&c.count>=0);
    return n+(c.name===name?c.count:0);
  },0);
}

/**
 * Check whether an original fixed 60 can, in principle, supply the exact
 * Agent43 Secret Box -> Fog Crystal -> Basic Psychic chain without introducing
 * cards absent from its own printed inventory. This checks necessary
 * quantities only: actual ability to use the chain is even more restrictive
 * due to draws, Prize cards, locks, target and turn state.
 *
 * The hook's root trigger requires Box + >=2 VIP + >=1 Carrier in hand;
 * its later real owner-deck prompt searches Fog and Basic Psychic.
 *
 * @param {object} roster Original Aichi full-decklists.json object.
 * @returns {object} Read-only coverage diagnostic.
 */
function auditFixedOneEnergyBoxFogCoverage(roster){
  assert.ok(Array.isArray(roster?.decks));
  const seen=new Set();
  const rows=roster.decks.map(deck=>{
    assert.ok(Number.isSafeInteger(deck.rank)&&deck.rank>=1&&deck.rank<=32);
    assert.ok(!seen.has(deck.rank),'Duplicate original source rank');
    seen.add(deck.rank);
    const total=deck.cards.reduce((n,c)=>n+c.count,0);
    assert.equal(total,60,'Only complete original printed 60s admitted');
    const counts={
      box:countName(deck,BOX),fog:countName(deck,FOG),
      vip:countName(deck,VIP),carrier:countName(deck,CARRIER),
      basicPsychic:countName(deck,BASIC)
    };
    const possibleBoxFog=counts.box>0&&counts.fog>0;
    const passesOwnerHeldPreconditions=
      counts.box>0&&counts.vip>=2&&counts.carrier>=1;
    const passesAllNecessaryInventories=
      possibleBoxFog&&passesOwnerHeldPreconditions&&
      counts.basicPsychic>0;
    return {
      rank:deck.rank,archetype:deck.archetype,
      source60Authenticated:true,counts,
      boxFogBothInPrinted60:possibleBoxFog,
      originalExactOwnerHookInventoryCompatible:
        passesAllNecessaryInventories,
      satisfiesTriggerMinimumsIn60:passesOwnerHeldPreconditions,
      paperPlayabilityCertified:false,nativeActionCertified:false
    };
  }).sort((a,b)=>a.rank-b.rank);
  const ranksWhere=predicate=>rows.filter(predicate).map(r=>r.rank);
  return {
    version:VERSION,readOnly:true,source60sChecked:rows.length,
    missingRanks:Array.from({length:32},(_,i)=>i+1).filter(i=>!seen.has(i)),
    boxRanks:ranksWhere(x=>x.counts.box>0),
    fogRanks:ranksWhere(x=>x.counts.fog>0),
    boxFogOverlapRanks:ranksWhere(x=>x.boxFogBothInPrinted60),
    hookHandPrerequisiteRanks:ranksWhere(x=>x.satisfiesTriggerMinimumsIn60),
    entireExactHookInventoryRanks:
      ranksWhere(x=>x.originalExactOwnerHookInventoryCompatible),
    thisHookCanImproveAnyAuthenticatedOriginalByExactRecipe:
      rows.some(x=>x.originalExactOwnerHookInventoryCompatible),
    necessaryOnly:true,
    sameBothSeatCodeDoesNotImplyBothDecksCanTrigger:true,
    paperCompetitiveGamesQualified:0,rows
  };
}

module.exports={VERSION,BOX,FOG,VIP,CARRIER,BASIC,countName,
  auditFixedOneEnergyBoxFogCoverage};
