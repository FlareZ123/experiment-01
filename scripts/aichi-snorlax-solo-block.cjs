'use strict';

const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.resolve(__dirname, '../results/aichi-2026');
const source = JSON.parse(fs.readFileSync(path.join(sourcePath, 'full-decklists.json'), 'utf8'));

const BASIC_NAMES = Object.freeze({
  3: ['Snorlax', 'Galarian Stunfisk', 'Regirock', 'Mimikyu',
    'Girafarig', 'Bunnelby', 'Articuno-GX', 'Rotom V'],
  7: ['Wobbuffet', 'Mimikyu', 'Snorlax', 'Regirock', 'Electrike', 'Girafarig']
});
const CANDIDATES = Object.freeze([
  {id:'champion-reference', rank:1},
  {id:'hood-shield-v1', filename:'candidate-hood-shadow-rider.json'},
  {id:'temple-v1', filename:'candidate-temple-shadow-rider.json'}
]);
const ESCAPE_RELEVANT_NAMES = Object.freeze([
  'Stealthy Hood', 'Tool Jammer', 'Field Blower', 'Guzma',
  'Acerola', 'Pokémon Ranger', 'Float Stone', 'Switch',
  'Escape Rope', 'Switch Cart', 'Jet Energy'
]);

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0) {
    throw new Error('Invalid combination parameters.');
  }
  if (k < 0 || k > n) return 0;
  const m = Math.min(k, n-k);
  let result = 1;
  for (let i=1; i<=m; i++) result *= (n - m + i)/i;
  return Math.round(result);
}

/** @param {number} n Number of Basic Pokémon in a deck. */
function validOpeningProbability(n) {
  return 1 - choose(60-n,7)/choose(60,7);
}

/**
 * The opponent can select Snorlax as its opening Active and voluntarily leave
 * its Bench empty, provided at least one Snorlax was drawn.
 * Conditional on a legal seven-card opening, this is a resource opportunity,
 * not a successful lock or win probability.
 * @param {number} snorlax
 * @param {number} basics
 */
function snorlaxLeadGivenValidOpening(snorlax, basics) {
  if (!Number.isInteger(snorlax) || !Number.isInteger(basics) ||
      snorlax < 1 || basics < snorlax || basics > 60) {
    throw new Error('Invalid Snorlax/Basic inventory.');
  }
  return (1 - choose(60-snorlax,7)/choose(60,7)) / validOpeningProbability(basics);
}

/**
 * Exact forced Snorlax Active among valid initial seven-card hands:
 * at least one Snorlax and no other Basic species. Multiple Snorlax possible.
 * Opponent mulligan bonus draws cannot change the Active already selected.
 * @param {number} snorlax
 * @param {number} basics
 */
function forcedSnorlaxActiveGivenValidOpening(snorlax, basics) {
  if (!Number.isInteger(snorlax) || !Number.isInteger(basics) ||
      snorlax < 1 || basics < snorlax || basics > 60) {
    throw new Error('Invalid Snorlax/Basic inventory.');
  }
  return (choose(60-basics+snorlax,7)-choose(60-basics,7)) /
    (choose(60,7)-choose(60-basics,7));
}

/**
 * Exact joint probability of a valid seven and at least one drawn Hood, then
 * conditioned on the valid opening. Hood and Basic labels are disjoint.
 * @param {number} hood
 * @param {number} basics
 */
function hoodOpeningGivenValidOpening(hood, basics) {
  if (!Number.isInteger(hood) || !Number.isInteger(basics) ||
      hood < 0 || basics < 1 || basics + hood > 60) {
    throw new Error('Invalid Hood/Basic inventory.');
  }
  const total = choose(60,7);
  const joint = (total - choose(60-hood,7) -
    choose(60-basics,7) + choose(60-basics-hood,7))/total;
  return joint/validOpeningProbability(basics);
}

/**
 * Exact probability all Hood copies are in six unknown Prizes conditional
 * on having drawn a valid starting seven. Zero Hood has no escape relevance.
 * @param {number} hood
 * @param {number} basics
 */
function allHoodsPrizedGivenValidOpening(hood, basics) {
  if (!Number.isInteger(hood) || hood < 1 || hood > 6 ||
      !Number.isInteger(basics) || basics < 1 || hood+basics > 60) {
    throw new Error('Invalid Hood/Basic inventory.');
  }
  const prize = choose(6,hood)/choose(60,hood);
  const validUnderPrize = 1 -
    choose(60-hood-basics,7)/choose(60-hood,7);
  return prize * validUnderPrize / validOpeningProbability(basics);
}

/** @param {object} deck */
function count(deck, name) {
  return deck.cards.filter(row=>row.name === name)
    .reduce((sum,row)=>sum+row.count,0);
}

/** @param {object} deck */
function auditSixty(deck) {
  if (deck.cards.reduce((sum,row)=>sum+row.count,0)!==60) {
    throw new Error('Source deck is not 60 cards: '+String(deck.rank??deck.label));
  }
  return deck;
}

/** @returns {object} Source-backed structural audit, not a game simulation. */
function auditSoloSnorlax() {
  const byRank=new Map(source.decks.map(d=>[d.rank,d]));
  const opponents=[3,7].map(rank=>{
    const deck=auditSixty(byRank.get(rank));
    const basics=BASIC_NAMES[rank].reduce((n,name)=>n+count(deck,name),0);
    const snorlax=count(deck,'Snorlax');
    return {
      rank, archetype:deck.archetype, snorlax, basics,
      pSnorlaxLeadGivenValidOpening:snorlaxLeadGivenValidOpening(snorlax,basics),
      pForcedSnorlaxActiveGivenValidOpening:forcedSnorlaxActiveGivenValidOpening(snorlax,basics),
      namedCounters:Object.fromEntries(['Tool Jammer','Faba','Megaton Blower','Field Blower',
        'Guzma','Counter Catcher'].map(name=>[name,count(deck,name)]))
    };
  });
  const candidates=CANDIDATES.map(({id,rank,filename})=>{
    const deck=auditSixty(filename ?
      JSON.parse(fs.readFileSync(path.join(sourcePath,filename),'utf8')):byRank.get(rank));
    const cards=Object.fromEntries(ESCAPE_RELEVANT_NAMES.map(name=>[name,count(deck,name)]));
    return {
      id, cards,
      // Fixed-basics count established from the source's exact Pokémon lineup.
      // All three lists have 14 starting Basics; Temple additionally has Wobbuffet.
      basics:id==='temple-v1'?15:14,
      directHoodGivenValidOpening:cards['Stealthy Hood'] ?
        hoodOpeningGivenValidOpening(cards['Stealthy Hood'],id==='temple-v1'?15:14):0,
      allHoodsPrizedGivenValidOpening:cards['Stealthy Hood'] ?
        allHoodsPrizedGivenValidOpening(cards['Stealthy Hood'],id==='temple-v1'?15:14):null
    };
  });
  return {sourceDeckCount:source.decks.length,opponents,candidates,
    meaning:'restricted source inventory and opening access only; no established lock rate or win rate'};
}

module.exports={choose,validOpeningProbability,snorlaxLeadGivenValidOpening,
  forcedSnorlaxActiveGivenValidOpening,
  hoodOpeningGivenValidOpening,allHoodsPrizedGivenValidOpening,auditSoloSnorlax};
