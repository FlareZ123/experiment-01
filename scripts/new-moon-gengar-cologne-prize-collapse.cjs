'use strict';

const assert = require('node:assert/strict');
const {choose, mulliganProbability} = require('./aichi_opening_audit.cjs');
const baseline = require('../results/als/new-moon-lockbreak-english-proxy-60.json');
const proposal = require('../results/als/new-moon-two-gengar-one-cologne-english-proxy-60.json');

/**
 * Probability that every designated card copy is among the six face-down
 * Prizes, conditional on a legal seven-card hand with at least one Basic.
 *
 * The designated group consists of "targetBasics" Basic copies and the
 * remaining Trainer/non-Basic copies. Assign all targets to Prize positions;
 * then draw seven from the other 60-targetCopies cards. This conditions
 * on the real opening mulligan rule instead of treating prizes as an
 * unconditional, independent draw.
 *
 * @param {number} basics Total Basic Pokémon in the 60.
 * @param {number} targetCopies Total designated copies.
 * @param {number} targetBasics Basic Pokémon among designated copies.
 * @returns {number} Conditional probability.
 */
function allPrizedAfterLegalSeven(basics, targetCopies, targetBasics) {
  assert.ok(Number.isInteger(basics) && basics >= 1 && basics <= 60);
  assert.ok(Number.isInteger(targetCopies) && targetCopies >= 1 &&
    targetCopies <= 60);
  assert.ok(Number.isInteger(targetBasics) && targetBasics >= 0 &&
    targetBasics <= Math.min(basics, targetCopies));
  assert.ok(targetCopies-targetBasics <= 60-basics);
  if (targetCopies > 6) return 0;
  const openingLegal = 1-mulliganProbability(basics);
  const allTargetsInPrizes = choose(6,targetCopies)/choose(60,targetCopies);
  const legalGivenTargetsPrized = 1-
    choose(60-targetCopies-(basics-targetBasics),7)/
    choose(60-targetCopies,7);
  return allTargetsInPrizes*legalGivenTargetsPrized/openingLegal;
}

/** @param {object} manifest @param {string} id @returns {number} */
function copies(manifest,id) {
  const rows=manifest.entries.filter(entry=>entry.english_proxy_card_id===id);
  assert.equal(rows.length,1,'One immutable card-print ID required: '+id);
  return rows[0].count;
}

/** @param {object} manifest @returns {object} */
function caseFor(manifest) {
  const gengar=copies(manifest,'sm9-53');
  const mewtwo=copies(manifest,'sm11-71');
  const cologne=copies(manifest,'swsh10-136');
  const basics=manifest.counts['Pokémon']-
    manifest.entries.filter(entry=>entry.name_en==='Dusclops')
      .reduce((sum,entry)=>sum+entry.count,0);
  assert.ok([gengar,mewtwo,cologne,basics].every(Number.isInteger));
  return {
    basics,gengar,mewtwo,cologne,
    openingValid:1-mulliganProbability(basics),
    allGengarPrized:allPrizedAfterLegalSeven(basics,gengar,gengar),
    allColognePrized:allPrizedAfterLegalSeven(basics,cologne,0),
    allGengarAndMewtwoPrized:
      allPrizedAfterLegalSeven(basics,gengar+mewtwo,gengar+mewtwo),
    allGengarAndColognePrized:
      allPrizedAfterLegalSeven(basics,gengar+cologne,gengar),
    // Inclusion-exclusion across all physical copies of both channels.
    // 'Both accessible' means only at least one copy of each is unprized;
    // it says nothing about usable hand, deck search, lock or chosen attack.
    get bothChannelsUnprized() {
      return 1-this.allGengarPrized-this.allColognePrized+
        this.allGengarAndColognePrized;
    }
  };
}

/** @returns {object} */
function main() {
  assert.equal(baseline.canonical_id_count_sha256,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.equal(proposal.canonical_id_count_sha256,
    '3c1cf2b5fa73a966c23260f3ceb85a5ebd70073cdd805f44b269969bfea2bd33');
  assert.equal(baseline.entries.length,proposal.entries.length);
  for(let i=0;i<baseline.entries.length;i++) {
    assert.equal(baseline.entries[i].english_proxy_card_id,
      proposal.entries[i].english_proxy_card_id);
  }
  const original=caseFor(baseline),alternative=caseFor(proposal);
  assert.deepEqual([original.basics,original.gengar,original.mewtwo,original.cologne],
    [17,1,2,2]);
  assert.deepEqual([alternative.basics,alternative.gengar,
    alternative.mewtwo,alternative.cologne],[18,2,2,1]);
  return {
    schema:'new-moon-gengar-cologne-legal-opening-prize-collapse-v1',
    frozenHash:baseline.canonical_id_count_sha256,
    proposalHash:proposal.canonical_id_count_sha256,
    model:'Uniform shuffled 60; initial seven contains a Basic; random six Prizes assigned; all copies in Prizes is inaccessible via ordinary deck search. No mulligan bonus cards, prize retrieval, card-use policy or opponent strategy.',
    original,alternative,
    deltaAllGengarPrized:alternative.allGengarPrized-original.allGengarPrized,
    deltaAllColognePrized:alternative.allColognePrized-original.allColognePrized,
    qualifier:'Exact physical-Prize combinatorics only; does not estimate attacker availability or wins.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={allPrizedAfterLegalSeven,caseFor,main};
