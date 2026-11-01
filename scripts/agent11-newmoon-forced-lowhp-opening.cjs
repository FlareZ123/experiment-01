'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {combination,validOpening,EXPECTED_RANKS} =
  require('./agent11-field-simultaneous-mulligan-compensation.cjs');

const VERSION = 'agent11-newmoon-forced-lowhp-opening-v1';
const NEWMOON_HASH = 'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4';
const DIRECT_BASIC_ACCESS_ITEMS = new Map([
  ['swsh8-225',{name:'Battle VIP Pass',count:4}],
  ['swsh6-140',{name:'Fog Crystal',count:4}]
]);
const DISCARD_DEPENDENT_BASIC_ACCESS_ITEMS = new Map([
  ['sm6-113',{name:'Mysterious Treasure',count:2,discardCost:1}],
  ['sv6-163',{name:'Secret Box',count:1,discardCost:3}]
]);

const LOW_HP_PRINTINGS = new Map([
  ['xy7-30', {name:'Unown', count:3, hp:60}],
  ['swsh4-69', {name:'Duskull', count:2, hp:60}]
]);

/** @param {number} n @param {number} k @returns {number} */
const C = (n,k) => Number(combination(n,k));

/**
 * Verify exact fixed printed candidate inventory before making a risk claim.
 * The included sixty-card source manifest has only two non-Basic Pokémon
 * (Dusclops); card HP comes from the matching supplied English card database.
 * @param {object} manifest
 * @param {{decks:object[],fully_resolved:number}} sourceOpenings
 * @returns {object}
 */
function verifyPrintedInventories(manifest,sourceOpenings) {
  assert.equal(manifest.canonical_id_count_sha256, NEWMOON_HASH);
  assert.equal(manifest.counts.total,60);
  const pokemon=manifest.entries.filter(e=>e.type==='Pokémon');
  assert.equal(pokemon.reduce((s,e)=>s+e.count,0),19);
  const dusclops=pokemon.filter(e=>e.english_proxy_card_id==='sv6pt5-19');
  assert.equal(dusclops.length,1);
  assert.equal(dusclops[0].name_en,'Dusclops');
  assert.equal(dusclops[0].count,2);
  const low=pokemon.filter(e=>LOW_HP_PRINTINGS.has(e.english_proxy_card_id));
  assert.equal(low.length,2);
  for(const entry of low) {
    const exact=LOW_HP_PRINTINGS.get(entry.english_proxy_card_id);
    assert.equal(entry.name_en,exact.name);
    assert.equal(entry.count,exact.count);
  }
  for (const [id,expected] of [...DIRECT_BASIC_ACCESS_ITEMS,
    ...DISCARD_DEPENDENT_BASIC_ACCESS_ITEMS]) {
    const found=manifest.entries.filter(e=>e.english_proxy_card_id===id);
    assert.equal(found.length,1);
    assert.equal(found[0].type,'Trainer');
    assert.equal(found[0].name_en,expected.name);
    assert.equal(found[0].count,expected.count);
  }
  assert.equal(sourceOpenings.fully_resolved,29);
  assert.deepEqual(sourceOpenings.decks.map(d=>d.rank)
    .sort((a,b)=>a-b),EXPECTED_RANKS);
  assert.ok(sourceOpenings.decks.every(d=>
    d.unresolved_pokemon.length===0));
  const champion=sourceOpenings.decks.find(d=>d.rank===1);
  assert.equal(champion.basic_count_known,14);
  assert.equal(champion.basic_hp_at_most_60_known,0);
  return {newMoonBasics:17,newMoonLowHpBasics:5,
    championBasics:14,championLowHpBasics:0,
    directBasicAccessItems:8,conditionalDiscardSearchItems:3};
}

/**
 * P(valid seven has exactly one Basic and that Basic has HP <= threshold),
 * conditional on a legal opening seven that contains at least one Basic.
 * @param {number} basicCount
 * @param {number} lowHpBasics
 * @returns {number}
 */
function forcedLowHpInSeven(basicCount,lowHpBasics) {
  assert.ok(Number.isInteger(basicCount)&&basicCount>=1&&basicCount<=60);
  assert.ok(Number.isInteger(lowHpBasics)&&lowHpBasics>=0&&
    lowHpBasics<=basicCount);
  return lowHpBasics*C(60-basicCount,6)/
    (C(60,7)-C(60-basicCount,7));
}

/**
 * Probability the sole available Basic among the valid starting seven,
 * all maximum optional opponent-mulligan compensation cards and up to
 * four ordinary draws is a <=60-HP Basic. The observed bonus sample is
 * marginally random after setting six unknown Prize cards.
 *
 * @param {number} candidateBasics
 * @param {number} lowHpBasics
 * @param {number} sourceBasics
 * @param {number} ordinaryDraws
 * @returns {number}
 */
function sourceConditionalExposure(candidateBasics,lowHpBasics,
  sourceBasics,ordinaryDraws=0) {
  assert.ok(Number.isInteger(ordinaryDraws)&&ordinaryDraws>=0&&
    ordinaryDraws<=4);
  const pC=validOpening(candidateBasics), pS=validOpening(sourceBasics);
  const qS=1-pS, d=1-(1-pC)*qS;
  const initial=forcedLowHpInSeven(candidateBasics,lowHpBasics);
  if(initial===0)return 0;
  const otherNonbasic=60-candidateBasics-6;
  let probability=0;
  // More than otherNonbasic extra cards necessarily reveals a second Basic.
  // Thus truncation here is exact for this event, even if the opponent
  // hypothetically mulligans an enormous number of times.
  for(let bonus=0;bonus+ordinaryDraws<=otherNonbasic;bonus++) {
    const weight=bonus===0?pS/d:pC*pS*qS**bonus/d;
    const extra=bonus+ordinaryDraws;
    probability+=weight*initial*C(otherNonbasic,extra)/C(53,extra);
  }
  return probability;
}

/**
 * A strictly narrower physical-card event: the only seen Basic has <=60 HP
 * and the seen hand also lacks all eight directly Basic-searching Items
 * (4 Battle VIP Pass and 4 Fog Crystal).
 *
 * This is a hand-location screen only. Other Items/Supporters, unknown source
 * lock effects and decision priorities are intentionally left unmodeled.
 * @param {number} sourceBasics Original opponent Basic count.
 * @param {number} ordinaryDraws 0..4 hypothetical natural additional draws.
 * @returns {number}
 */
function withoutNamedSearcherCopies(sourceBasics,searcherCopies,
  ordinaryDraws=0){
  assert.ok(Number.isInteger(searcherCopies)&&searcherCopies>=8&&
    searcherCopies<=21);
  assert.ok(Number.isInteger(ordinaryDraws)&&ordinaryDraws>=0&&
    ordinaryDraws<=4);
  const candidateBasics=17, lowHpBasics=5;
  const directSearchCopies=searcherCopies;
  const pC=validOpening(candidateBasics), pS=validOpening(sourceBasics);
  const qS=1-pS, d=1-(1-pC)*qS;
  const initial=lowHpBasics*C(60-candidateBasics-directSearchCopies,6)/
    (C(60,7)-C(60-candidateBasics,7));
  const remainingNonbasicNonsearch=60-candidateBasics-directSearchCopies-6;
  let result=0;
  for(let bonus=0;bonus+ordinaryDraws<=remainingNonbasicNonsearch;bonus++){
    const w=bonus===0?pS/d:pC*pS*qS**bonus/d;
    const extra=bonus+ordinaryDraws;
    result+=w*initial*C(remainingNonbasicNonsearch,extra)/C(53,extra);
  }
  return result;
}

/** @param {number} sourceBasics @param {number} ordinaryDraws @returns {number} */
function withoutDirectBasicSearcher(sourceBasics,ordinaryDraws=0){
  return withoutNamedSearcherCopies(sourceBasics,8,ordinaryDraws);
}

/** @param {object} manifest @param {object} sourceOpenings @returns {object} */
function analyze(manifest,sourceOpenings){
  const verified=verifyPrintedInventories(manifest,sourceOpenings);
  const rows=sourceOpenings.decks.map(d=>({
    rank:d.rank,archetype:d.archetype,sourceBasics:d.basic_count_known,
    referenceForcedLowHp:sourceConditionalExposure(14,0,d.basic_count_known),
    newMoonForcedLowHp:sourceConditionalExposure(17,5,d.basic_count_known)
  }));
  const unknownSourceBasics=Array.from({length:60},(_,i)=>i+1);
  const full32Interval=(fn,knownMean)=>{
    const vals=unknownSourceBasics.map(fn);
    const knownTotal=knownMean*29;
    return {
      lower:(knownTotal+3*Math.min(...vals))/32,
      upper:(knownTotal+3*Math.max(...vals))/32
    };
  };
  const knownForced=rows.reduce((s,r)=>s+r.newMoonForcedLowHp,0)/29;
  const knownNoNamed11=sourceOpenings.decks.reduce((s,d)=>s+
    withoutNamedSearcherCopies(d.basic_count_known,11),0)/29;
  return {
    version:VERSION,
    full32MissingSourceEnvelope:{
      unknownRanks:[23,25,28],
      permittedSourceBasicCounts:[1,60],
      forcedLowHp:full32Interval(b=>sourceConditionalExposure(17,5,b),
        knownForced),
      noElevenNamedSearchers:full32Interval(b=>
        withoutNamedSearcherCopies(b,11),knownNoNamed11),
      actualMissingSourceDecksAuthenticated:false,
      competitiveGameInference:false
    },
    verified,
    openingSevenOnly:{
      reference:forcedLowHpInSeven(14,0),
      newMoon:forcedLowHpInSeven(17,5)
    },
    optionalDiscardAccessSensitivity:{
      tiers:[8,10,11,15].map(searcherCopies=>({
        searcherCopies,
        type:searcherCopies===8?'Eight direct items':
          searcherCopies===10?'Plus two one-discard Treasures':
          searcherCopies===11?'Plus singleton three-discard Secret Box':
          'Hypothetical addition of four discard-requiring searchers',
        meanNoNamedSearcherExposure:sourceOpenings.decks.reduce((s,d)=>s+
          withoutNamedSearcherCopies(d.basic_count_known,searcherCopies),0)/29
      })),
      interpretation:'Physical card-location only; search costs, counterplay and required four card substitutions make this non-performance evidence'
    },
    directBasicSearcherAbsent:{
      preciseScope:'No physical Battle VIP Pass or Fog Crystal; other access routes and Item locks excluded',
      firstSeven:5*C(35,6)/(C(60,7)-C(43,7)),
      meanOver29Sources:sourceOpenings.decks.reduce((sum,d)=>sum+
        withoutDirectBasicSearcher(d.basic_count_known),0)/29,
      sourceRank6:withoutDirectBasicSearcher(4)
    },
    allMaximumBonusDraws:{
      reference:0,
      newMoonAverage:rows.reduce((s,r)=>s+r.newMoonForcedLowHp,0)/rows.length,
      newMoonVsOriginalIronThorns:rows.filter(r=>[6,24,29]
        .includes(r.rank)).map(r=>({rank:r.rank,probability:r.newMoonForcedLowHp}))
    },
    rows,
    interpretation:'Necessary forced 60HP Basic among pre-search physically seen cards, not an attack/donk or competitive win probability',
    sourceCoverage:29,
    competitiveQualifiedGames:0
  };
}

/** @returns {object} */
function fromRepo(){
  const root=path.resolve(__dirname,'..');
  const sourceOpenings=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/opening-hand-audit.json'),'utf8'));
  const manifest=JSON.parse(fs.readFileSync(path.join(root,
    'results/als/new-moon-lockbreak-english-proxy-60.json'),'utf8'));
  return analyze(manifest,sourceOpenings);
}
module.exports={VERSION,LOW_HP_PRINTINGS,DIRECT_BASIC_ACCESS_ITEMS,
  DISCARD_DEPENDENT_BASIC_ACCESS_ITEMS,verifyPrintedInventories,
  forcedLowHpInSeven,sourceConditionalExposure,withoutNamedSearcherCopies,
  withoutDirectBasicSearcher,analyze,fromRepo};
