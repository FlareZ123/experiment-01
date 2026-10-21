'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {
  choose, openingProbabilities, isPrintedBasic, census, canonicalNumber
} = require('../scripts/aichi-opening-basics.cjs');

test('exact fractions for four Basic in 60, with no Prize-conditioning', () => {
  assert.equal(choose(60, 7), 386206920n);
  assert.equal(choose(56, 7), 231917400n);
  const p = openingProbabilities(4);
  assert.equal(p.allHands, '386206920');
  assert.equal(p.initialMulliganHands, '231917400');
  assert.ok(Math.abs(p.initialMulliganProbability - 0.6005003743) < 1e-9);
  assert.ok(Math.abs(p.solitaryBasicGivenValidProbability - 0.841753503) < 1e-9);
});

test('exact denominator on a small deck matches exhaustive combinations', () => {
  const p = openingProbabilities(2, 10, 3);
  assert.equal(p.allHands, '120');
  assert.equal(p.initialMulliganHands, '56');
  assert.equal(p.exactlyOneBasicHands, '56');
  assert.equal(p.validHands, '64');
  assert.equal(p.solitaryBasicGivenValidProbability, 0.875);
});

test('print identity, including promo IDs, distinguishes Stage 1 from Basic', () => {
  assert.equal(canonicalNumber('SM217'), '217');
  assert.equal(canonicalNumber('XY49'), '49');
  const sources = {
    xyp: [{id:'xyp-XY49',number:'XY49',name:'Regirock',supertype:'Pokémon',subtypes:['Basic']}],
    me2: [{id:'me2-84',number:'84',name:'Mega Lopunny ex',supertype:'Pokémon',subtypes:['Stage 1','MEGA','ex']}]
  };
  const get = id => sources[id];
  const sets = new Map([['PFL', ['me2']]]);
  assert.equal(isPrintedBasic({name:'Regirock',printing:{set:'XYP',number:'49'}}, sets, get), true);
  assert.equal(isPrintedBasic({name:'Mega Lopunny ex',printing:{set:'PFL',number:'84'}}, sets, get), false);
  assert.throws(() => isPrintedBasic({name:'Regirock',printing:{set:'XYP',number:'48'}}, sets, get), /unavailable/);
});

test('census fails closed on incorrect source size or missing print', () => {
  const deck = {rank:6,player:'p',archetype:'Iron Thorns',cards:[
    {category:'Pokémon',count:4,name:'Iron Thorns ex',printing:{set:'TWM',number:'77'}},
    {category:'Trainer',count:56,name:'Dummy'}
  ]};
  const sets = [{id:'sv6',ptcgoCode:'TWM'}];
  const source = {sv6: [{id:'sv6-77',number:'77',name:'Iron Thorns ex',supertype:'Pokémon',subtypes:['Basic','ex']}]};
  const result = census({decks:[deck],missing_full_lists:[]},sets,id=>source[id]);
  assert.equal(result.rows[0].basicCount, 4);
  assert.equal(result.rows[0].evolutionCount, 0);
  assert.ok(result.rows[0].initialMulliganProbability > 0.6);
  const broken = {...deck,cards:[...deck.cards.slice(0,1),{...deck.cards[1],count:55}]};
  assert.throws(()=>census({decks:[broken]},sets,id=>source[id]),/Bad exact source size/);
});
