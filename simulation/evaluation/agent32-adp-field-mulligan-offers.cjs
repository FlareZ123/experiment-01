'use strict';

const assert = require('node:assert/strict');
const field = require('../../results/aichi-2026/full-decklists.json');
const sets = require('../../resources/sets/en.json');
const candidate = require('../../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const { choose } = require('./agent5-adp-thorton-prize-availability.cjs');
const { ratio } = require('./agent32-adp-first-gx-physical-window.cjs');

const VERSION = 'agent32-adp-seven-basic-29original-mulligan-opponent-offers-v1';
const BASIC = new Set(['sm12-156','swsh12-135','sm2-60','swsh3-104']);

/** @param {string} text @returns {string} */
function normalize(text) {
  return String(text).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
}

/** @param {string} text @returns {string} */
function numberKey(text) {
  const s = String(text).toUpperCase().replace(/^(SWSH|SM|XY|BW)(?=\d+$)/,'');
  return s.replace(/^0+(?=\d)/,'');
}

/**
 * Print-specific card subtype lookup; fail closed on every unmatched original
 * Pokémon. Matched card identity is a database match, not event legality.
 * @param {object[]} [originals] Authenticated original 60s.
 * @returns {object[]} Sorted Basic-count records.
 */
function originalBasicCounts(originals=field.decks) {
  const codeSets=new Map();
  for(const set of sets){
    for(const code of [set.id,set.ptcgoCode]){
      if(!code)continue;
      const key=String(code).toUpperCase();
      if(!codeSets.has(key))codeSets.set(key,new Set());
      codeSets.get(key).add(set.id);
    }
  }
  const cache=new Map();
  /** @param {string} setId @returns {object[]} */
  function cards(setId){
    if(!cache.has(setId))
      cache.set(setId,require('../../resources/cards/en/'+setId+'.json'));
    return cache.get(setId);
  }
  const out=[];
  for(const deck of originals){
    assert.equal(deck.cards.reduce((s,r)=>s+r.count,0),60);
    let basics=0;
    const basicPrintings=[];
    for(const row of deck.cards.filter(r=>r.category==='Pokémon')){
      const aliases=codeSets.get(String(row.printing.set).toUpperCase())||new Set();
      const matches=[];
      for(const setId of aliases){
        for(const card of cards(setId)){
          if(numberKey(card.number)!==numberKey(row.printing.number))continue;
          if(normalize(card.name)!==normalize(row.name))continue;
          matches.push(card);
        }
      }
      assert.equal(matches.length,1,
        'Unresolved original Pokémon printing rank '+deck.rank+': '+row.name);
      if(matches[0].subtypes?.includes('Basic')){
        basics+=row.count;
        basicPrintings.push({
          name:row.name,printing:row.printing.set+' '+row.printing.number,
          count:row.count
        });
      }
    }
    assert.ok(basics>0&&basics<=60,
      'Original deck must have a Basic start');
    out.push({
      rank:deck.rank,player:deck.player,archetype:deck.archetype,
      basicCopies:basics,basicPrintings
    });
  }
  out.sort((a,b)=>a.rank-b.rank);
  return out;
}

/**
 * Exact simultaneous setup under the supplied rulebook:
 * both mulligan => redraw both, neither gets compensation;
 * one player valid => that player may take up to one bonus for every
 * subsequent failed seven of the other player.
 * Thus P(opponent offered >=1) = qA(1-qB)/(1-qA*qB).
 * E[offers] = this probability/(1-qA), since failed A hands after
 * opponent settles are geometric. No actual card drawn is asserted.
 *
 * @param {number} candidateBasics
 * @param {number} opponentBasics
 * @returns {object}
 */
function bonusOffers(candidateBasics,opponentBasics) {
  assert.ok(Number.isSafeInteger(candidateBasics)&&candidateBasics>0&&candidateBasics<=60);
  assert.ok(Number.isSafeInteger(opponentBasics)&&opponentBasics>0&&opponentBasics<=60);
  const N=choose(60,7);
  const A=choose(60-candidateBasics,7);
  const B=choose(60-opponentBasics,7);
  const D=N*N-A*B;
  assert.ok(D>0n);
  const first=A*(N-B);
  return {
    candidateMulliganProbability:ratio(A,N),
    opponentMulliganProbability:ratio(B,N),
    opponentOfferedAtLeastOne:ratio(first,D),
    opponentOfferedAtLeastTwo:ratio(first*A,D*N),
    opponentOfferedAtLeastThree:ratio(first*A*A,D*N*N),
    opponentExpectedOfferCount:ratio(first*N,D*(N-A)),
    explanatoryScope:'Upper availability of extra cards from candidate mulligans; opponent may choose fewer; no inference about winner or policy'
  };
}

/** @returns {object} */
function main() {
  const basics=candidate.cards.reduce((s,c)=>s+(BASIC.has(c.id)?c.count:0),0);
  assert.equal(basics,7,'Fixed ADP v2 Basic count changed');
  assert.equal(candidate.canonicalCardsSha256,
    'bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b');
  assert.equal(field.decks.length,29);
  const roster=originalBasicCounts();
  const rows=roster.map(r=>({
    ...r,offers:bonusOffers(basics,r.basicCopies)
  }));
  const avg=key=>rows.reduce((s,row)=>s+row.offers[key].fraction,0)/rows.length;
  return {
    version:VERSION,
    fixedCandidate60:candidate.canonicalCardsSha256,
    originalRoster:'results/aichi-2026/full-decklists.json',
    inputOriginalCount:rows.length,
    missingOriginalRanks:[23,25,28],
    candidateBasicCount:basics,
    candidateMulliganProbability:bonusOffers(basics,basics).candidateMulliganProbability,
    candidateUnconditionalExpectedFailedSeven:
      ratio(choose(53,7),choose(60,7)-choose(53,7)),
    equalRankMeanOpponentChanceAtLeastOneOffer:avg('opponentOfferedAtLeastOne'),
    equalRankMeanOpponentExpectedOffers:avg('opponentExpectedOfferCount'),
    rows,
    qualifiedGames:0,
    limits:'Exact joint setup counts only. No opponents for missing three original 60s; opponent may decline bonus draws; extra cards do not imply game advantage or any won games.'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,BASIC,normalize,numberKey,originalBasicCounts,bonusOffers,main};
