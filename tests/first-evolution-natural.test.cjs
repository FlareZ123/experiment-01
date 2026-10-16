'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {choose,naturalEvolutionChance,countsFromDeck} = require('../scripts/first-evolution-natural.cjs');

/** @param {number} bonus @returns {{valid:number,success:number}} */
function brute(bonus) {
  // Distinct physical cards: V, B, M, M, four fillers; two cards go to Prizes.
  const cards = ['V', 'B', 'M', 'M', 'X', 'X', 'X', 'X'];
  let valid = 0;
  let success = 0;
  /** @param {number} at */
  function permute(at) {
    if (at === cards.length) {
      const opening = cards.slice(0,3);
      if (!opening.includes('V') && !opening.includes('B')) return;
      valid++;
      // Indices 3 and 4 are Prizes, unseen by the player.
      const t1 = [...opening,...cards.slice(5,5+bonus+1)];
      const t2 = [...t1,cards[5+bonus+1]];
      if (t1.includes('V') && t2.includes('M')) success++;
      return;
    }
    for (let i=at;i<cards.length;i++) {
      [cards[i],cards[at]]=[cards[at],cards[i]];
      permute(at+1);
      [cards[i],cards[at]]=[cards[at],cards[i]];
    }
  }
  permute(0);
  return {valid,success};
}

test('formula matches exhaustive physical permutations with Prizes and bonus draws', () => {
  assert.equal(choose(8,3),56n);
  for (const bonusDraws of [0,1]) {
    const actual=naturalEvolutionChance({deckSize:8,openingSize:3,prizeCount:2,
      basicCount:2,targetBasicCount:1,stageOneCount:2,bonusDraws});
    const {valid,success}=brute(bonusDraws);
    assert.ok(Math.abs(actual.conditional-success/valid)<1e-12);
    assert.ok(Math.abs(actual.openingValid-valid/40320)<1e-12);
  }
});

test('no evolution copy guarantees zero natural readiness', () => {
  const x=naturalEvolutionChance({deckSize:60,openingSize:7,prizeCount:6,
    basicCount:14,targetBasicCount:3,stageOneCount:0});
  assert.ok(Math.abs(x.conditional)<1e-12);
});

test('source-derived count triples match independent Python calculations', () => {
  const triples=[[14,3,4,0.1825732235695301],
    [15,4,4,0.2255282823],[15,4,3,0.179920292]];
  for(const [basicCount,targetBasicCount,stageOneCount,expected] of triples) {
    const x=naturalEvolutionChance({deckSize:60,openingSize:7,prizeCount:6,
      basicCount,targetBasicCount,stageOneCount});
    assert.ok(Math.abs(x.conditional-expected)<1e-8,
      JSON.stringify({basicCount,targetBasicCount,stageOneCount,x,expected}));
  }
});

test('validates count consistency and manifest coverage', () => {
  assert.throws(()=>naturalEvolutionChance({deckSize:60,openingSize:7,prizeCount:6,
    basicCount:3,targetBasicCount:4,stageOneCount:4}),RangeError);
  assert.throws(()=>countsFromDeck({cards:[{name:'Shadow Rider Calyrex V',count:2,category:'Pokémon'}]},
    new Map([['Shadow Rider Calyrex V',true]])),/60-card/);
});
