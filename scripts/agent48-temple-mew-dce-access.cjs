'use strict';

/**
 * Exact, Basic-valid, Prize-marginalized opening-card location probabilities
 * for original Aichi rank5's Double Colorless Energy under Temple of Sinnoh.
 * This is a card-location screen, not a probability of attack or victory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const EXPECTED_POKEMON = new Map([
  ['Mew V|FST|113', 4],
  ['Mew VMAX|FST|114', 3],
  ['Genesect V|FST|185', 4],
  ['Dedenne-GX|UNB|57', 1],
  ['Crobat V|DAA|104', 1],
  ["Lillie's Clefairy ex|JTG|56", 1]
]);
const BASIC_POKEMON = new Set([
  'Mew V|FST|113', 'Genesect V|FST|185',
  'Dedenne-GX|UNB|57', 'Crobat V|DAA|104',
  "Lillie's Clefairy ex|JTG|56"
]);

/** @param {number} n @param {number} r @returns {bigint} */
function choose(n, r) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(r) || n < 0)
    throw new TypeError('Expected nonnegative integer population and integer selection');
  if (r < 0 || r > n) return 0n;
  const k = Math.min(r, n - r);
  let value = 1n;
  for (let i = 1; i <= k; i++)
    value = value * BigInt(n - k + i) / BigInt(i);
  return value;
}

/**
 * @param {object} spec
 * @param {number} spec.basicCount
 * @param {number} spec.targetCount
 * @param {number} spec.minimumTargets
 * @param {number} spec.ordinaryDraws
 * @param {number} [spec.deckSize]
 * @param {number} [spec.openingSize]
 * @returns {{favorable:bigint,possible:bigint}}
 */
function conditionalSeenTargets({ basicCount, targetCount, minimumTargets,
  ordinaryDraws, deckSize = 60, openingSize = 7 }) {
  for (const n of [basicCount,targetCount,minimumTargets,ordinaryDraws,
    deckSize,openingSize])
    assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.ok(openingSize <= deckSize && basicCount + targetCount <= deckSize);
  assert.ok(ordinaryDraws <= deckSize - openingSize);
  const other = deckSize - basicCount - targetCount;
  const accepted = choose(deckSize,openingSize) -
    choose(deckSize-basicCount,openingSize);
  assert.ok(accepted > 0n, 'No Basic-valid opening hands');
  let favorable = 0n;
  for (let b = 1; b <= Math.min(basicCount,openingSize); b++) {
    for (let s = 0; s <= Math.min(targetCount,openingSize-b); s++) {
      const o = openingSize-b-s;
      if (o > other) continue;
      const handCount = choose(basicCount,b)*choose(targetCount,s)*
        choose(other,o);
      for (let additional = Math.max(0,minimumTargets-s);
        additional <= Math.min(ordinaryDraws,targetCount-s);
        additional++) {
        favorable += handCount*choose(targetCount-s,additional)*
          choose(deckSize-openingSize-targetCount+s,
            ordinaryDraws-additional);
      }
    }
  }
  return {favorable, possible:accepted*
    choose(deckSize-openingSize,ordinaryDraws)};
}

/** @param {object} corpus Original Aichi source roster. */
function auditOriginalRank5(corpus) {
  const deck = corpus.decks?.find(x => x.rank === 5);
  assert.ok(deck, 'Missing original rank5 source');
  const count = deck.cards.reduce((sum,card) => sum + card.count,0);
  assert.equal(count,60,'Original rank5 must remain 60');
  const pokemon = deck.cards.filter(x=>x.category==='Pokémon');
  assert.equal(pokemon.length,EXPECTED_POKEMON.size);
  const basicCount = pokemon.reduce((n,card)=>{
    const id = [card.name,card.printing.set,card.printing.number].join('|');
    assert.equal(card.count,EXPECTED_POKEMON.get(id),
      'Unexpected exact source Pokémon printing or count: '+id);
    return n+(BASIC_POKEMON.has(id)?card.count:0);
  },0);
  const energies = deck.cards.filter(x=>x.category==='Energy');
  assert.equal(energies.length,1,'Original rank5 has only DCE Energy');
  const energy=energies[0];
  assert.equal([energy.name,energy.printing.set,energy.printing.number].join('|'),
    'Double Colorless Energy|SUM|136');
  assert.equal(energy.count,4,'Original rank5 DCE count changed');
  assert.equal(basicCount,11);
  const rows=[];
  for (const ordinaryDraws of [0,1,2]) {
    const single=conditionalSeenTargets({basicCount,targetCount:4,
      minimumTargets:1,ordinaryDraws});
    const double=conditionalSeenTargets({basicCount,targetCount:4,
      minimumTargets:2,ordinaryDraws});
    rows.push({ordinaryDraws,atLeastOne:single,atLeastTwo:double});
  }
  return {rank:5,basicCount,doubleColorlessCopies:4,
    ordinaryDraws:rows,competitiveQualifiedGames:0};
}

if (require.main === module) {
  const corpus = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const evidence = auditOriginalRank5(corpus);
  process.stdout.write(JSON.stringify(evidence,(_,value)=>
    typeof value==='bigint'?value.toString():value,2)+'\n');
}

module.exports = {choose,conditionalSeenTargets,auditOriginalRank5};
