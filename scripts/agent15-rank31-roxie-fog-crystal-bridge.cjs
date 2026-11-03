'use strict';

/**
 * ORIGINAL Aichi 2026 rank31 first-own-turn going-second physical Item bridge.
 * Starting seven must contain a Basic; one normal draw arrives after six
 * unknown Prize cards. Retain Roxie in hand, preserve at least one Koffing
 * for its payment, put Radiant Alakazam in play, and optionally search
 * Koffing/Radiant using one distinct Fog Crystal per missing target.
 *
 * A search requires the named target actually remain outside six Prizes.
 * No other draw, Supporter search, Items, Ability use, targets, or opponent
 * actions are modeled. These are paper access events, NOT plays or wins.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {choose, classify} = require('./agent15-rank31-roxie-firstdraw.cjs');

const KEYS = ['koffing', 'radiantAlakazam', 'fogCrystal', 'roxie', 'otherBasic', 'other'];

/** @param {object} source Authenticated original rank31 manifest deck */
function inventory(source) {
  const base = classify(source);
  for (const [name, count, set, number] of [
    ['Koffing', 3, 'CEC', '76'], ['Radiant Alakazam', 1, 'SIT', '59'],
    ['Fog Crystal', 4, 'CRE', '140'], ['Roxie', 4, 'CEC', '205'],
  ]) {
    const copies = source.cards.filter(card => card.name === name);
    assert.equal(copies.length, 1, name + ' must have single printed identity');
    assert.equal(copies[0].count, count);
    assert.deepEqual([copies[0].printing.set, String(copies[0].printing.number)],
      [set, number]);
  }
  const counts = [3, 1, 4, 4, base.eligibleBasic + base.otherBasic - 1, 0];
  counts[5] = 60 - counts.slice(0, 5).reduce((a,b) => a+b, 0);
  assert.deepEqual(counts, [3,1,4,4,11,37]);
  return counts;
}

/**
 * @param {number[]} counts Disjoint physical-card inventory
 * @returns {{validSeven:string,denominator:string,events:Record<string,{numerator:string,denominator:string,percent:number}>}}
 */
function countFogBridge(counts) {
  assert.deepEqual(counts, [3,1,4,4,11,37]);
  const sel = new Array(KEYS.length).fill(0);
  let validSeven = 0n;
  const totals = {
    roxieHeld: 0n,
    directRoxieKoffingRadiant: 0n,
    fogSearchOnlyRadiant: 0n,
    fogSearchOnlyKoffing: 0n,
    twoFogSearchBoth: 0n,
    oneFogCannotGetBoth: 0n,
  };
  const prizePatterns = choose(52, 6);
  /**
   * @param {number} i
   * @param {number} left
   * @param {bigint} weight
   */
  function visit(i, left, weight) {
    if (i === KEYS.length) {
      if (left !== 0 || sel[0]+sel[1]+sel[4] === 0) return;
      validSeven += weight;
      // Active is chosen before the ordinary eighth draw. Prefer a Basic
      // other than Koffing, falling back to one Koffing if forced.
      const retainedK = sel[0] - Number(sel[1] + sel[4] === 0);
      for (let next = 0; next < KEYS.length; next++) {
        const available = counts[next] - sel[next];
        if (available === 0) continue;
        if (sel[3] + Number(next === 3) === 0) continue;
        const factor = weight * BigInt(available);
        totals.roxieHeld += factor * prizePatterns;
        const heldK = retainedK + Number(next === 0);
        const heldRad = sel[1] + Number(next === 1);
        const heldFog = sel[2] + Number(next === 2);
        const needK = heldK === 0;
        const needRad = heldRad === 0;
        if (!needK && !needRad) {
          totals.directRoxieKoffingRadiant += factor * prizePatterns;
          continue;
        }
        if (heldFog < Number(needK) + Number(needRad)) {
          if (needK && needRad && heldFog === 1)
            totals.oneFogCannotGetBoth += factor * prizePatterns;
          continue;
        }
        // After observing eight cards, select six Prizes from the other 52.
        // Koffing in Active/hand is unavailable as Roxie payment, and the
        // remaining copies are precisely the ones Fog may search from deck.
        const remainingK = counts[0]-sel[0]-Number(next === 0);
        if (needK && remainingK <= 0) continue;
        if (needK && needRad) {
          // Inclusion-exclusion: some K unprized AND Radiant unprized.
          const allKPrized = choose(52-remainingK,6-remainingK);
          const radPrized = choose(51,5);
          const radAndAllKPrized = choose(51-remainingK,5-remainingK);
          totals.twoFogSearchBoth += factor *
            (prizePatterns-allKPrized-radPrized+radAndAllKPrized);
        } else if (needK) {
          totals.fogSearchOnlyKoffing += factor *
            (prizePatterns-choose(52-remainingK,6-remainingK));
        } else {
          // Exactly one Radiant remains unseen; it must avoid six Prizes.
          totals.fogSearchOnlyRadiant += factor * choose(51,6);
        }
      }
      return;
    }
    for (let take=0; take<=Math.min(left,counts[i]);take++) {
      sel[i]=take;
      visit(i+1,left-take,weight*choose(counts[i],take));
    }
  }
  visit(0,7,1n);
  const denominator=validSeven*53n*prizePatterns;
  assert(denominator>0n);
  const eventMap=Object.fromEntries(Object.entries(totals).map(([name,num])=>
    [name,{numerator:num.toString(),denominator:denominator.toString(),
      percent:Number(num)/Number(denominator)*100}]));
  const union=[
    'directRoxieKoffingRadiant','fogSearchOnlyRadiant',
    'fogSearchOnlyKoffing','twoFogSearchBoth',
  ].reduce((sum,name)=>sum+BigInt(eventMap[name].numerator),0n);
  eventMap.anyAvailableTriad = {
    numerator:union.toString(),denominator:denominator.toString(),
    percent:Number(union)/Number(denominator)*100,
  };
  return { validSeven:validSeven.toString(),
    denominator:denominator.toString(), events:eventMap };
}

function main() {
  const manifest=JSON.parse(fs.readFileSync(
    path.join(__dirname,'..','results','aichi-2026','full-decklists.json'),'utf8'));
  const deck=manifest.decks.find(x=>x.rank===31);
  assert(deck,'Missing original rank31');
  console.log(JSON.stringify({
    rank:31,scenario:'No extra draw/search other than held Fog Crystal',
    result:countFogBridge(inventory(deck)),
  },null,2));
}
if(require.main===module) main();
module.exports={inventory,countFogBridge};
