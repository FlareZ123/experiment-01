'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {choose} = require('./agent1-prize-failure-budget.cjs');

const ROOT = path.resolve(__dirname, '../..');

/**
 * Printed Pokémon that are absent from the bundled English promo snapshots.
 * Each is independently identified as a Basic Pokémon in published printed-card
 * references; see the companion results/statistics report for provenance.
 * Key uses the original Aichi roster's set code and unprefixed printed number.
 */
const VERIFIED_BASIC_PROMO_EXCEPTIONS = Object.freeze({
  'SMP:217': 'Trevenant & Dusknoir-GX',
  'XYP:67': 'Jirachi',
  'XYP:49': 'Regirock'
});

/**
 * Resolve source PTCGO-code printing against the historical English card corpus.
 * The same PTCGO code can also label a Trainer Gallery; prefer the ordinary set.
 * @param {string} [root]
 * @returns {{basicFromSource:Function, basicFromCardId:Function}}
 */
function createBasicClassifier(root = ROOT) {
  const sets = require(path.join(root, 'resources/sets/en.json'));
  /** @type {Map<string,string>} */
  const setIdByCode = new Map();
  for (const set of sets) {
    if (set.ptcgoCode && !setIdByCode.has(set.ptcgoCode) &&
        !/(?:tg|gg)$/.test(set.id)) {
      setIdByCode.set(set.ptcgoCode, set.id);
    }
  }

  /** @type {Map<string,Array<object>>} */
  const cache = new Map();

  /** @param {string} id */
  function cardsForSet(id) {
    if (!cache.has(id)) {
      const location = path.join(root, 'resources/cards/en', id + '.json');
      cache.set(id, JSON.parse(fs.readFileSync(location, 'utf8')));
    }
    return cache.get(id);
  }

  /**
   * @param {{set:string,number:string}} printing
   * @param {string} expectedName
   * @returns {boolean}
   */
  function basicFromSource(printing, expectedName) {
    const key = printing.set + ':' + printing.number;
    const setId = setIdByCode.get(printing.set);
    const record = setId
      ? cardsForSet(setId).find(c => String(c.number) === String(printing.number))
      : null;
    if (record) {
      const exactPrismStarGlyphVariant =
        record.subtypes.includes('Prism Star') &&
        expectedName.endsWith(' ♢') &&
        record.name === expectedName.slice(0, -1) + '◇';
      assert.ok(record.name === expectedName || exactPrismStarGlyphVariant,
        'Source printed name mismatch: ' + key + ' (' +
          expectedName + ' vs ' + record.name + ')');
      assert.equal(record.supertype, 'Pokémon');
      return record.subtypes.includes('Basic');
    }
    assert.equal(VERIFIED_BASIC_PROMO_EXCEPTIONS[key], expectedName,
      'Unresolved source printing must be independently audited: ' + key);
    return true;
  }

  /**
   * @param {string} id
   * @param {string} expectedName
   * @returns {boolean}
   */
  function basicFromCardId(id, expectedName) {
    const dash = id.lastIndexOf('-');
    assert.ok(dash > 0, 'Card ID must include source set and number');
    const setId = id.slice(0, dash);
    const card = cardsForSet(setId).find(c => c.id === id);
    assert.ok(card, 'No indexed candidate printing ' + id);
    assert.equal(card.name, expectedName);
    return card.supertype === 'Pokémon' && card.subtypes.includes('Basic');
  }

  return {basicFromSource, basicFromCardId};
}

/**
 * @param {object} deck Source opponent or candidate 60.
 * @param {{basicFromSource:Function,basicFromCardId:Function}} classifier
 * @returns {number} Count of physical eligible starting Basic Pokémon.
 */
function countStartingBasics(deck, classifier) {
  assert.equal(deck.cards.reduce((sum, card) => sum + card.count, 0), 60,
    'Registered deck must have 60 physical cards');
  let count = 0;
  for (const card of deck.cards) {
    const category = card.category ||
      (card.printing || card.cardId || card.id ? null : undefined);
    // Existing source decks and three candidates have category. Agent 5's
    // machine manifest does not, so decide Pokémon from the resolved card text.
    if (category && category !== 'Pokémon') continue;
    let basic;
    if (card.cardId || card.id) {
      basic = classifier.basicFromCardId(card.cardId || card.id, card.name);
    } else {
      assert.ok(card.printing && category === 'Pokémon');
      basic = classifier.basicFromSource(card.printing, card.name);
    }
    if (basic) count += card.count;
  }
  assert.ok(count > 0 && count <= 60);
  return count;
}

/**
 * @param {number} basicCount
 * @returns {number} Probability one uniformly drawn seven-card hand mulligans.
 */
function firstSevenMulliganProbability(basicCount) {
  assert.ok(Number.isSafeInteger(basicCount) &&
    basicCount > 0 && basicCount <= 60);
  return Number(choose(60 - basicCount, 7)) / Number(choose(60, 7));
}

/**
 * Exact two-player joint opening process under the supplied rulebook I.G.
 * The two players first draw seven independently. If both mulligan, both reset
 * without establishing Prize cards or earning bonus draws. If one seven is
 * Basic-valid, that player holds its seven while the other repeats alone.
 * The recipient may choose fewer bonus draws; these are OFFERED maxima.
 *
 * @param {number} candidateBasics
 * @param {number} opponentBasics
 * @returns {object}
 */
function mulliganBonusExposure(candidateBasics, opponentBasics) {
  const p = firstSevenMulliganProbability(candidateBasics);
  const o = firstSevenMulliganProbability(opponentBasics);
  const bothRetryDenominator = 1 - p * o;

  const candidateOffersOpponent = p * (1-o) / bothRetryDenominator;
  const opponentOffersCandidate = o * (1-p) / bothRetryDenominator;

  return {
    candidateBasics,
    opponentBasics,
    candidateFirstSevenMulligan: p,
    opponentFirstSevenMulligan: o,
    candidateOffersOpponent: {
      atLeastOne: candidateOffersOpponent,
      atLeastTwo: candidateOffersOpponent * p,
      expectedMaximumCards: candidateOffersOpponent / (1-p)
    },
    opponentOffersCandidate: {
      atLeastOne: opponentOffersCandidate,
      atLeastTwo: opponentOffersCandidate * o,
      expectedMaximumCards: opponentOffersCandidate / (1-o)
    },
    bothValidAfterJointAttempts: (1-p) * (1-o) / bothRetryDenominator
  };
}

/**
 * Independently resolve all 29 authenticated originals and four fixed candidate
 * manifests against actual printed Basic stage metadata. Three unavailable
 * original sixties remain strictly absent.
 * @param {string} [root]
 * @returns {{originals:Array<object>,candidates:Array<object>,missingRanks:number[]}}
 */
function loadRegisteredStartingBasicCounts(root = ROOT) {
  const originals = require(path.join(root, 'results/aichi-2026/full-decklists.json'));
  const c = createBasicClassifier(root);
  const sourceRows = originals.decks.map(d => ({
    rank:d.rank, archetype:d.archetype, basics:countStartingBasics(d,c)
  }));
  sourceRows.sort((a,b) => a.rank-b.rank);
  assert.equal(sourceRows.length, 29);
  assert.deepEqual(originals.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b),
    [23,25,28]);

  const locations = [
    ['Apex Alchemy v0', 'results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json'],
    ['ADP Thorton Regidrago v2', 'results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json'],
    ['Sentinel Lopunny Vileplume v1', 'results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json'],
    ['Arven Shake Absol v1', 'results/aichi-2026/candidate-arven-shake-absol-v1.json']
  ];
  const candidates = locations.map(([name,location]) => ({
    name, location,
    basics:countStartingBasics(require(path.join(root,location)), c)
  }));
  return {originals:sourceRows,candidates,missingRanks:[23,25,28]};
}

/**
 * Average offered extra cards across the 29 authenticated original opponents,
 * assigning each original exactly one equal-weight slot. These are exposure
 * diagnostics, and never a win rate or a completed game.
 * @param {number} candidateBasics
 * @param {Array<{rank:number,basics:number}>} originals
 * @returns {object}
 */
function fieldMeanBonusExposure(candidateBasics, originals) {
  assert.ok(originals.length > 0);
  const outcomes = originals.map(x=>({
    rank:x.rank, ...mulliganBonusExposure(candidateBasics,x.basics)
  }));
  const mean = name => outcomes.reduce((sum,row)=>sum+row[name],0)/outcomes.length;
  const expectedOpponentBonus = outcomes.reduce((sum,row)=>
    sum+row.candidateOffersOpponent.expectedMaximumCards,0)/outcomes.length;
  const expectedCandidateBonus = outcomes.reduce((sum,row)=>
    sum+row.opponentOffersCandidate.expectedMaximumCards,0)/outcomes.length;
  const opponentAnyOffer = outcomes.reduce((sum,row)=>
    sum+row.candidateOffersOpponent.atLeastOne,0)/outcomes.length;
  const candidateAnyOffer = outcomes.reduce((sum,row)=>
    sum+row.opponentOffersCandidate.atLeastOne,0)/outcomes.length;
  return {
    candidateBasics, authenticatedFieldSize:outcomes.length,
    opponentAnyOffer, candidateAnyOffer,
    expectedOpponentBonus, expectedCandidateBonus,
    expectedOpponentMinusCandidateBonus: expectedOpponentBonus-expectedCandidateBonus,
    candidateFirstSevenMulligan:mean('candidateFirstSevenMulligan'),
    byRank:outcomes
  };
}

/**
 * Exact discrete PUBLIC setup compensation multiplicity for two independent
 * fixed physical 60s, from their final valid setup round onward.
 * j>=1 offered cards to opponent requires j solo candidate mulligans; both
 * simultaneously mulliganing merely restarts the joint trial.
 *
 * P(no offers) = qA*qB/(1-pA*pB).
 * P(opponent offered exactly j) = qA*qB*pA^j/(1-pA*pB).
 * P(candidate offered exactly j) = qA*qB*pB^j/(1-pA*pB).
 * Tails are retained explicitly; draws may be declined.
 *
 * @param {number} candidateBasics
 * @param {number} opponentBasics
 * @param {number} [maxCount] Largest positive offer included separately.
 * @returns {object}
 */
function exactBonusMultiplicity(candidateBasics,opponentBasics,maxCount=6) {
  assert.ok(Number.isSafeInteger(maxCount)&&maxCount>=1);
  const pA=firstSevenMulliganProbability(candidateBasics);
  const pB=firstSevenMulliganProbability(opponentBasics);
  const qA=1-pA,qB=1-pB;
  const base=qA*qB/(1-pA*pB);
  const candidateOffered=[],opponentOffered=[];
  for(let j=1;j<=maxCount;j++) {
    candidateOffered.push({count:j,probability:base*Math.pow(pB,j)});
    opponentOffered.push({count:j,probability:base*Math.pow(pA,j)});
  }
  const candidateOfferTail=base*Math.pow(pB,maxCount+1)/qB;
  const opponentOfferTail=base*Math.pow(pA,maxCount+1)/qA;
  const sum=base+candidateOffered.reduce((s,x)=>s+x.probability,0)+
    opponentOffered.reduce((s,x)=>s+x.probability,0)+
    candidateOfferTail+opponentOfferTail;
  assert.ok(Math.abs(sum-1)<1e-12);
  return {
    candidateBasics,opponentBasics,maxCount,
    neitherOffered:base,
    candidateOffered,opponentOffered,
    candidateOfferTail,opponentOfferTail,
    totalProbability:sum
  };
}

module.exports = {
  VERIFIED_BASIC_PROMO_EXCEPTIONS,
  createBasicClassifier,
  countStartingBasics,
  firstSevenMulliganProbability,
  mulliganBonusExposure,
  loadRegisteredStartingBasicCounts,
  fieldMeanBonusExposure,
  exactBonusMultiplicity
};
