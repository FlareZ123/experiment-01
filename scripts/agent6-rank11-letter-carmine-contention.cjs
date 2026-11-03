'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./agent6-rank11-letter-opportunity.cjs');

/** @param {number} removed Optional excluded non-Basic physical copies. */
function noEnergyCount(removed, requireMegaOpening=false) {
  // 60-card rank11: 8 Energy, 11 Basics including 3 Mega Absol,
  // 4 Letter and 3 Carmine. Excluded card types are disjoint from Basics.
  const remaining=52-removed;
  const nonTarget=remaining-(requireMegaOpening?3:11);
  return (choose(remaining,7)-choose(nonTarget,7))*
    BigInt(remaining-7);
}

/**
 * Exact legal-seven plus ordinary eighth-draw event. Carmine and Letter are
 * among the first eight, no Darkness Energy is among them. Optionally require
 * Mega Absol ex among the first seven (available as starting Active).
 * @param {boolean} requireMegaOpening
 * @returns {object}
 */
function analyzeCoheldLetterCarmine(requireMegaOpening=false) {
  const denominator=(choose(60,7)-choose(49,7))*53n;
  const starvedLetter=noEnergyCount(0,requireMegaOpening)-
    noEnergyCount(4,requireMegaOpening);
  const starvedLetterAndCarmine=starvedLetter-
    noEnergyCount(3,requireMegaOpening)+
    noEnergyCount(7,requireMegaOpening);
  assert.ok(starvedLetterAndCarmine>=0n&&
    starvedLetterAndCarmine<=starvedLetter);
  return {
    requireMegaOpening,starvedLetterNumerator:String(starvedLetter),
    coheldNumerator:String(starvedLetterAndCarmine),
    denominator:String(denominator),
    coheldProbability:Number(starvedLetterAndCarmine)/Number(denominator),
    coheldConditionalOnStarvedLetter:
      Number(starvedLetterAndCarmine)/Number(starvedLetter),
    paperActionsObserved:0,competitiveQualifiedGames:0
  };
}

/** Assert authenticated rank11 printed-source composition before report. */
function rank11CoheldReport(){
  const d=require('../results/aichi-2026/full-decklists.json')
    .decks.find(x=>x.rank===11);
  assert.equal(d?.player,'Wataru Yano');
  assert.equal(d.cards.reduce((s,c)=>s+c.count,0),60);
  for(const [name,count] of [
    ['Mega Absol ex',3],["Professor's Letter",4],
    ['Carmine',3],['Darkness Energy',8]
  ])assert.equal(d.cards.filter(c=>c.name===name)
    .reduce((s,c)=>s+c.count,0),count);
  const audit=require('../results/aichi-2026/opening-hand-audit.json')
    .decks.find(x=>x.rank===11);
  assert.equal(audit.basic_count_known,11);
  return {sourceRank:11,allLegalOpenings:analyzeCoheldLetterCarmine(),
    openingMegaAbsol:analyzeCoheldLetterCarmine(true)};
}
module.exports={noEnergyCount,analyzeCoheldLetterCarmine,rank11CoheldReport};
