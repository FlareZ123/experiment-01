'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent3-coupled-opening-input-order-v1';

/**
 * Return a source-row-ordered Basic mask for a specific, externally verified
 * historical card roster. Evolution identities are explicit inputs so that
 * a card-name heuristic cannot silently classify an unknown Pokémon.
 *
 * @param {object[]} rows Full original 60 as count-bearing source rows.
 * @param {{categoryKey:'category'|'type',nameKey:'name'|'name_en',
 *   evolvedNames:readonly string[],expectedBasics:number}} options
 * @returns {boolean[]} Exactly 60 source-row-ordered positions.
 */
function basicPositionMask(rows, options) {
  assert.ok(Array.isArray(rows));
  const {categoryKey, nameKey, evolvedNames, expectedBasics} = options;
  const evolved = new Set(evolvedNames);
  const pokemon = new Set();
  const positions = [];
  for (const row of rows) {
    assert.ok(Number.isSafeInteger(row.count) && row.count>0);
    const category = row[categoryKey];
    const name = row[nameKey];
    assert.ok(typeof name==='string' && name);
    assert.ok(['Pokémon','Trainer','Energy'].includes(category));
    if (category==='Pokémon') pokemon.add(name);
    for (let i=0;i<row.count;i++) {
      positions.push(category==='Pokémon' && !evolved.has(name));
    }
  }
  assert.equal(positions.length,60,'The source inventory must be exactly 60');
  for(const name of evolved) assert.ok(pokemon.has(name),
    'Declared evolution name absent from exact source roster');
  assert.equal(positions.filter(Boolean).length,expectedBasics,
    'Basic count must agree with independently verified exact card stages');
  return positions;
}

/** @param {number} n @param {number} k @returns {number} */
function choose(n,k) {
  assert.ok(Number.isSafeInteger(n) && n>=0 &&
    Number.isSafeInteger(k) && k>=0);
  if(k>n)return 0;
  const small=Math.min(k,n-k);
  let value=1;
  for(let i=1;i<=small;i++) value=value*(n-small+i)/i;
  return Math.round(value);
}

/**
 * For a true uniformly random shared seven-position subset, the first
 * candidate's Basic-free and second candidate's Basic-free events depend
 * on how their fixed input-list Basic positions overlap. This describes a
 * common-index permutation coupling ONLY, not a paper win rate or evidence
 * that finite xorshift shuffles are exactly uniform.
 *
 * @param {boolean[]} reference Exactly 60 input-position Basic flags.
 * @param {boolean[]} challenger Exactly 60 input-position Basic flags.
 * @param {number} [handSize=7]
 * @returns {object}
 */
function mulliganDisagreement(reference,challenger,handSize=7) {
  if(!Array.isArray(reference)||!Array.isArray(challenger) ||
      reference.length!==60||challenger.length!==60 ||
      ![...reference,...challenger].every(x=>typeof x==='boolean') ||
      !Number.isSafeInteger(handSize)||handSize<1||handSize>60) {
    throw new TypeError('Two sixty-position Basic flags and valid hand size required');
  }
  const referenceBasics=reference.filter(Boolean).length;
  const challengerBasics=challenger.filter(Boolean).length;
  let sharedBasics=0;
  for(let i=0;i<60;i++) if(reference[i]&&challenger[i])sharedBasics++;
  const unionBasics=referenceBasics+challengerBasics-sharedBasics;
  const total=choose(60,handSize);
  const referenceMulligan=choose(60-referenceBasics,handSize)/total;
  const challengerMulligan=choose(60-challengerBasics,handSize)/total;
  const jointMulligan=choose(60-unionBasics,handSize)/total;
  const disagreement=referenceMulligan+challengerMulligan-
    2*jointMulligan;
  return {
    version:VERSION,handSize,referenceBasics,challengerBasics,
    sharedBasics,unionBasics,referenceMulligan,challengerMulligan,
    jointMulligan,disagreement,
    minimumPossibleOverlap:Math.max(0,referenceBasics+challengerBasics-60),
    maximumPossibleOverlap:Math.min(referenceBasics,challengerBasics),
    modelsUniformCommonIndexPermutation:true,
    certifiesActualXorshiftMarginals:false,competitiveQualified:false
  };
}

/**
 * The exact two historical fixed 60s from the 48 native opening pilot.
 * The only evolved Pokémon copies in these two 60s are independently
 * card-database-verified Shadow Rider Calyrex VMAX and Dusclops.
 *
 * @returns {object}
 */
function frozenRankOneNewMoonCase(){
  const rankOne = require('../../results/aichi-2026/full-decklists.json')
    .decks.find(deck=>deck.rank===1);
  const newMoon = require('../../results/als/new-moon-lockbreak-english-proxy-60.json');
  assert.ok(rankOne && newMoon?.entries);
  const reference=basicPositionMask(rankOne.cards,{
    categoryKey:'category',nameKey:'name',
    evolvedNames:['Shadow Rider Calyrex VMAX'],expectedBasics:14
  });
  const challenger=basicPositionMask(newMoon.entries,{
    categoryKey:'type',nameKey:'name_en',
    evolvedNames:['Dusclops'],expectedBasics:17
  });
  const actual=mulliganDisagreement(reference,challenger);
  const referenceBasicPositions=reference.map((x,i)=>x?i:null)
    .filter(x=>x!==null);
  const challengerBasicPositions=challenger.map((x,i)=>x?i:null)
    .filter(x=>x!==null);
  // The reordered scenarios are valid input-order permutations of the
  // SAME sixty printed cards and Basic flag counts. No card replacement.
  const maximalOverlap=[...referenceBasicPositions,
    ...Array.from({length:60},(_,i)=>i)
      .filter(i=>!reference[i]).slice(0,3)];
  const minimalOverlap=Array.from({length:60},(_,i)=>i)
    .filter(i=>!reference[i]).slice(0,17);
  const mask=indices=>Array.from({length:60},(_,i)=>indices.includes(i));
  return {
    schema:VERSION,
    historicalSourceRoster:'Aichi rank1 champion source vs New Moon v1 proxy',
    historicalReferenceBasicPositions:referenceBasicPositions,
    historicalChallengerBasicPositions:challengerBasicPositions,
    actual,
    reorderingRange:{
      maximalBasicOverlap:mulliganDisagreement(reference,mask(maximalOverlap)),
      minimalBasicOverlap:mulliganDisagreement(reference,mask(minimalOverlap))
    },
    caveat:'Analytic first-attempt coupling only. Real Store physical openings, mulligan bonuses, playing decisions, paper match clocks and win rates are not estimated.'
  };
}
module.exports={VERSION,basicPositionMask,choose,mulliganDisagreement,
  frozenRankOneNewMoonCase};
