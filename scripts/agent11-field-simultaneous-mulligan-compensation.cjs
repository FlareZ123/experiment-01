'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent11-field-simultaneous-mulligan-compensation-v1';
const EXPECTED_RANKS = Object.freeze([
  1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,
  24,26,27,29,30,31,32
]);

/** @param {number} n @param {number} k @returns {bigint} */
function combination(n,k) {
  if (!Number.isSafeInteger(n)||!Number.isSafeInteger(k)||k<0||k>n)
    return 0n;
  let r=1n;
  for (let i=1;i<=Math.min(k,n-k);i++)
    r=r*BigInt(n-Math.min(k,n-k)+i)/BigInt(i);
  return r;
}

/** @param {number} basicCount @returns {number} */
function validOpening(basicCount) {
  assert.ok(Number.isInteger(basicCount)&&basicCount>=1&&basicCount<=60);
  return 1-Number(combination(60-basicCount,7))/
    Number(combination(60,7));
}

/**
 * Exact independent-shuffle simultaneous-mulligan expected optional bonus
 * draws offered. If both players fail their initial seven, both restart and
 * neither receives a bonus. Opponent bonus draws are a deck-list consequence,
 * and should not be excluded from a fair intention-to-test comparison.
 * @param {number} candidateBasics
 * @param {number} sourceBasics
 * @returns {object}
 */
function matchup(candidateBasics,sourceBasics) {
  const pC=validOpening(candidateBasics);
  const pS=validOpening(sourceBasics);
  const qC=1-pC, qS=1-pS;
  const denominator=1-qC*qS;
  return {
    candidateBasics,sourceBasics,
    candidateOpeningValid:pC,
    sourceOpeningValid:pS,
    candidateAtLeastOneBonus:pC*qS/denominator,
    sourceAtLeastOneBonus:pS*qC/denominator,
    candidateExpectedMaximumBonus:pC*qS/(denominator*pS),
    sourceExpectedMaximumBonus:pS*qC/(denominator*pC),
    candidateAtLeastThreeBonus:pC*qS**3/denominator,
    bothInvalidFirstPair:qC*qS,
    gameWinInference:false
  };
}

/**
 * @param {{decks:object[],fully_resolved:number}} sourceOpeningAudit
 * @param {object} newMoon
 * @returns {{ranks:object[],average:object}}
 */
function field(sourceOpeningAudit,newMoon) {
  assert.equal(sourceOpeningAudit.fully_resolved,29);
  const rows=sourceOpeningAudit.decks;
  assert.deepEqual(rows.map(d=>d.rank).sort((a,b)=>a-b),EXPECTED_RANKS);
  assert.ok(rows.every(d=>d.unresolved_pokemon.length===0&&
    Number.isInteger(d.basic_count_known)&&
    d.basic_count_known>=1&&d.basic_count_known<=60));
  const rank1=rows.find(d=>d.rank===1);
  assert.equal(rank1.basic_count_known,14);
  assert.equal(newMoon.canonical_id_count_sha256,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.equal(newMoon.counts.total,60);
  assert.equal(newMoon.counts['Pokémon'],19);
  assert.equal(newMoon.entries.filter(e=>e.type==='Pokémon')
    .reduce((s,e)=>s+e.count,0),19);
  assert.deepEqual(newMoon.entries.filter(e=>e.type==='Pokémon'&&
    e.name_en==='Dusclops').map(e=>e.count),[2]);
  const candidateBasics=17;
  const result=rows.map(row=>{
    const reference=matchup(14,row.basic_count_known);
    const lockbreaker=matchup(candidateBasics,row.basic_count_known);
    return {
      rank:row.rank,archetype:row.archetype,sourceBasics:row.basic_count_known,
      reference,lockbreaker,
      extraCandidateBonus:lockbreaker.candidateExpectedMaximumBonus-
        reference.candidateExpectedMaximumBonus,
      changeInOpponentBonus:lockbreaker.sourceExpectedMaximumBonus-
        reference.sourceExpectedMaximumBonus
    };
  });
  const mean=key=>result.reduce((s,r)=>s+r[key],0)/result.length;
  const meanRef=key=>result.reduce((s,r)=>s+r.reference[key],0)/result.length;
  const meanNew=key=>result.reduce((s,r)=>s+r.lockbreaker[key],0)/result.length;
  const unknownSourceBasicPossibilities=Array.from({length:60},(_,i)=>i+1)
    .map(b=>({sourceBasics:b,
      candidateBonusDifference:matchup(17,b).candidateExpectedMaximumBonus-
        matchup(14,b).candidateExpectedMaximumBonus,
      opponentBonusDifference:matchup(17,b).sourceExpectedMaximumBonus-
        matchup(14,b).sourceExpectedMaximumBonus}));
  const intervalFor=(key,knownDifference)=>{
    const values=unknownSourceBasicPossibilities.map(x=>x[key]);
    const base=knownDifference*result.length;
    return {
      lower:(base+3*Math.min(...values))/32,
      upper:(base+3*Math.max(...values))/32
    };
  };
  return {
    version:VERSION,
    missingSourceFull32Envelope:{
      unknownRanks:[23,25,28],
      permittedBasicCounts:'1 through 60 for each of three unpublished source 60s',
      candidateBonusIncrease:intervalFor('candidateBonusDifference',
        mean('extraCandidateBonus')),
      opponentBonusReduction:intervalFor('opponentBonusDifference',
        mean('changeInOpponentBonus')),
      interpretation:'Worst-case per-source Basic count envelope, no missing original lists supplied or substitute matches played'
    },
    exactOriginalSourceSixties:29,
    missingRanks:[23,25,28],
    candidateBasicCounts:{reference:14,lockbreaker:17},
    ranks:result,
    average:{
      referenceCandidateBonus:meanRef('candidateExpectedMaximumBonus'),
      lockbreakerCandidateBonus:meanNew('candidateExpectedMaximumBonus'),
      referenceOpponentBonus:meanRef('sourceExpectedMaximumBonus'),
      lockbreakerOpponentBonus:meanNew('sourceExpectedMaximumBonus'),
      extraCandidateBonus:mean('extraCandidateBonus'),
      changeInOpponentBonus:mean('changeInOpponentBonus')
    },
    zeroCompetitivelyQualifiedGames:true
  };
}

/** @returns {object} */
function fromRepo() {
  const root=path.resolve(__dirname,'..');
  const audit=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/opening-hand-audit.json'),'utf8'));
  const candidate=JSON.parse(fs.readFileSync(path.join(root,
    'results/als/new-moon-lockbreak-english-proxy-60.json'),'utf8'));
  return field(audit,candidate);
}

module.exports={VERSION,EXPECTED_RANKS,combination,validOpening,matchup,field,fromRepo};
