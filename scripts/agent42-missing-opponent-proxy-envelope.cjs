'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @typedef {{name:string,count:number}} CardEntry */
/** @typedef {{rank:number,archetype:string,cards:CardEntry[]}} Deck */

/** @param {Deck} deck @returns {Map<string,number>} */
function namedCounts(deck) {
  const counts = new Map();
  for (const card of deck.cards) {
    assert.equal(typeof card.name, 'string');
    assert.ok(Number.isInteger(card.count) && card.count > 0);
    counts.set(card.name, (counts.get(card.name) || 0) + card.count);
  }
  assert.equal([...counts.values()].reduce((a,b) => a+b, 0), 60);
  return counts;
}

/**
 * Minimum whole-card substitutions needed to turn one 60-card name multiset
 * into another. Ignores printing identity deliberately, so this is a lower
 * bound on an exact-printing replacement distance.
 * @param {Deck} left @param {Deck} right @returns {number}
 */
function replacementDistance(left, right) {
  const a = namedCounts(left);
  const b = namedCounts(right);
  let overlap = 0;
  for (const [name, count] of a) overlap += Math.min(count, b.get(name) || 0);
  return 60 - overlap;
}

/** @param {Deck[]} decks */
function summarizeArchetype(decks) {
  assert.ok(decks.length >= 2);
  const rows = decks.slice().sort((a,b) => a.rank-b.rank);
  const pairs = [];
  for (let i=0; i<rows.length; i++) {
    for (let j=i+1; j<rows.length; j++) {
      pairs.push({ranks:[rows[i].rank,rows[j].rank],
        substitutions:replacementDistance(rows[i],rows[j])});
    }
  }
  const maps = rows.map(namedCounts);
  const union = new Set(maps.flatMap(m => [...m.keys()]));
  const invariantCore = [...union].sort().flatMap(name => {
    const values = maps.map(m => m.get(name) || 0);
    const minimum = Math.min(...values);
    return minimum === 0 ? [] : [{name,minimumCopies:minimum,
      maximumCopies:Math.max(...values)}];
  });
  const medoids = rows.map(deck => ({
    rank:deck.rank,
    sumSubstitutions:rows.reduce((sum,other) =>
      sum+replacementDistance(deck,other),0),
    maximumSubstitutions:Math.max(...rows.map(other =>
      replacementDistance(deck,other)))
  })).sort((a,b) => a.sumSubstitutions-b.sumSubstitutions ||
    a.rank-b.rank);
  const distances = pairs.map(p => p.substitutions);
  return {
    ranks:rows.map(d => d.rank),
    listCount:rows.length,
    pairCount:pairs.length,
    range:[Math.min(...distances),Math.max(...distances)],
    totalDistance:distances.reduce((a,b) => a+b,0),
    meanDistance:distances.reduce((a,b) => a+b,0)/pairs.length,
    invariantCopyCount:invariantCore.reduce((a,c) => a+c.minimumCopies,0),
    invariantCore, medoids, pairs
  };
}

/** @param {{decks:Deck[],missing_full_lists:{rank:number}[]}} field */
function analyze(field) {
  assert.equal(field.decks.length,29,'Source registration changed; re-audit');
  assert.deepEqual(field.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b),
    [23,25,28]);
  const regidrago = summarizeArchetype(field.decks.filter(
    x=>x.archetype==='Regidrago'));
  const raichu = summarizeArchetype(field.decks.filter(
    x=>x.archetype==='Raichu Electrode Combo'));
  assert.equal(regidrago.listCount,9);
  assert.equal(raichu.listCount,2);
  const r4 = field.decks.find(x=>x.rank===4);
  const r17 = field.decks.find(x=>x.rank===17);
  const m4 = namedCounts(r4);
  const m17 = namedCounts(r17);
  const divergentRaichuNames = [...new Set([...m4.keys(),...m17.keys()])]
    .sort().flatMap(name=>{
      const count4=m4.get(name)||0, count17=m17.get(name)||0;
      return count4===count17 ? [] : [{name,rank4:count4,rank17:count17}];
    });
  return {
    schema:'agent42-missing-opponent-proxy-envelope-v1',
    status:'source-inventory-only; no authenticated substitute 60s or game wins',
    exactOriginalLists:29,
    remainingOriginalGaps:[23,25,28],
    regidrago,raichu,divergentRaichuNames,
    // Two unknown Regidrago slots and one unknown Raichu slot.
    // This is an explicit hypothetical sensitivity grid, with replacement.
    // It is neither a posterior on missing 60s nor a tournament field.
    hypotheticalProxyAssignments:
      regidrago.listCount*regidrago.listCount*raichu.listCount,
    competitiveQualifiedGames:0
  };
}

function run() {
  const file = path.resolve(__dirname,'../results/aichi-2026/full-decklists.json');
  return analyze(JSON.parse(fs.readFileSync(file,'utf8')));
}

if (require.main === module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={namedCounts,replacementDistance,summarizeArchetype,analyze,run};
