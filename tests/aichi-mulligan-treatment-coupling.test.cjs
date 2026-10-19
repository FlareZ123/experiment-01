'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {analyzeCandidateMulliganTreatment}=
  require('../scripts/aichi-mulligan-treatment-coupling.cjs');

/** @param {number} observed @param {number} expected */
const close=(observed,expected)=>
  assert.ok(Math.abs(observed-expected)<1e-12,
    `Expected ${observed} to equal ${expected} within 1e-12`);

test('fixed candidate and published source Basic counts remain traceable',()=>{
  const field=require('../results/aichi-2026/full-decklists.json');
  const champion=field.decks.find(deck=>deck.rank===1);
  const rank6=field.decks.find(deck=>deck.rank===6);
  const rank11=field.decks.find(deck=>deck.rank===11);
  const moon=require('../results/als/new-moon-lockbreak-english-proxy-60.json');
  const totalPokemon=rows=>rows.filter(row=>
    row.category==='Pokémon').reduce((sum,row)=>sum+row.count,0);
  assert.equal(totalPokemon(champion.cards),18);
  assert.equal(champion.cards.find(row=>
    row.name==='Shadow Rider Calyrex VMAX').count,4);
  assert.equal(totalPokemon(rank6.cards),4);
  assert.equal(rank6.cards.find(row=>
    row.name==='Iron Thorns ex').count,4);
  assert.equal(totalPokemon(rank11.cards),13);
  assert.equal(rank11.cards.find(row=>
    row.name==='Garbodor').count,2);
  assert.equal(moon.entries.filter(row=>
    row.type==='Pokémon').reduce((sum,row)=>sum+row.count,0),19);
  assert.equal(moon.entries.find(row=>row.name_en==='Dusclops').count,2);
});

test('14/17 Basic first-hand probability difference is an exact numerator',()=>{
  const result=analyzeCandidateMulliganTreatment({
    referenceBasics:14,alternateBasics:17,sourceBasics:11
  });
  assert.equal(result.denominator,'386206920');
  assert.deepEqual(result.firstMulliganNumerators,{
    reference:'53524680',alternate:'32224114',
    source:'85904450',excessReference:'21300566'
  });
  close(result.absoluteFirstAttemptDiscordanceLowerBound,
    21300566/386206920);
  close(result.absoluteTotalMulliganCountDiscordanceLowerBound,
    21300566/386206920);
  assert.equal(result.competitiveWinRateMeasured,false);
  assert.equal(result.engineGamesMeasured,0);
});

test('sequential nested redraw and source bonus-offer results match a separate infinite-sum truncation',()=>{
  for(const sourceBasics of [4,11,60]){
    const observed=analyzeCandidateMulliganTreatment({
      referenceBasics:14,alternateBasics:17,sourceBasics
    });
    const {reference:pRef,alternate:pAlt,source:pSrc}=
      observed.firstMulliganProbabilities;
    const d=pRef-pAlt;
    let manualCount=0, manualOffer=0;
    // More than 40 redraws has negligible mass at all tested values.
    for(let k=0;k<40;k++) {
      for(let h=0;h<40;h++) {
        const mass=pAlt**k*d*(1-pRef)*pRef**h;
        manualCount+=mass;
        manualOffer+=mass*(1-pSrc**(k+1+h));
      }
    }
    close(observed.nestedSequentialTotalMulliganCountMismatch,
      manualCount);
    close(observed.nestedSourceBonusOfferMismatch,manualOffer);
  }
});

test('paper rank6 and rank11 setup effect probability is separated from first-hand lower bound',()=>{
  const r6=analyzeCandidateMulliganTreatment({
    referenceBasics:14,alternateBasics:17,sourceBasics:4
  });
  const r11=analyzeCandidateMulliganTreatment({
    referenceBasics:14,alternateBasics:17,sourceBasics:11
  });
  close(r6.nestedSequentialTotalMulliganCountMismatch,
    0.06017401308469204);
  close(r6.nestedSourceBonusOfferMismatch,
    0.027413203416407857);
  close(r11.nestedSourceBonusOfferMismatch,
    0.0490646230479492);
  assert.ok(r6.nestedSourceBonusOfferMismatch<
    r11.nestedSourceBonusOfferMismatch);
});

test('identical Basic counts cannot induce a candidate mulligan discrepancy',()=>{
  for(const sourceBasics of [1,4,11,60]){
    const row=analyzeCandidateMulliganTreatment({
      referenceBasics:14,alternateBasics:14,sourceBasics
    });
    assert.equal(row.absoluteFirstAttemptDiscordanceLowerBound,0);
    assert.equal(row.nestedSequentialTotalMulliganCountMismatch,0);
    assert.equal(row.nestedSourceBonusOfferMismatch,0);
  }
});

test('invalid nesting and unplayable Basic-free decks reject inputs',()=>{
  for(const params of [
    {referenceBasics:17,alternateBasics:14,sourceBasics:11},
    {referenceBasics:0,alternateBasics:17,sourceBasics:11},
    {referenceBasics:14,alternateBasics:17,sourceBasics:0},
    {referenceBasics:14,alternateBasics:61,sourceBasics:11},
    {referenceBasics:14,alternateBasics:17,sourceBasics:11,
      openingSize:61}
  ]) assert.throws(()=>analyzeCandidateMulliganTreatment(params));
});
