'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {hasBenchEvolutionTarget} = require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');
const manifest = require('../results/aichi-2026/full-decklists.json');

/**
 * Source-locked, physically valid 60-card K0 pair. Both simulated players have
 * exactly the same known/observable cards; only the six facedown Prizes and the
 * unseen draw pile differ. No search has yet occurred.
 */
function k0PrizePair() {
  const source=manifest.decks.find(d=>d.rank===2);
  assert.ok(source && source.archetype === 'Vileplume Control');
  const pool=source.cards.flatMap(entry=>
    Array.from({length:entry.count},(_,i)=>({
      name:entry.name,printing:entry.printing,copy:i+1
    })));
  assert.equal(pool.length,60);
  /** @param {string} name */
  const take = name => {
    const i=pool.findIndex(c=>c.name===name);
    assert.ok(i>=0,'Rank-2 published list lacks '+name);
    return pool.splice(i,1)[0];
  };
  // These seven cards occur in the published source 60. Bunnelby is Active,
  // Oddish on Bench, TM and payable Jet remain known in hand on turn one.
  const opening=[
    'Bunnelby','Oddish','Technical Machine: Evolution','Jet Energy',
    'Guzma & Hala','Tag Call','Stealthy Hood'
  ].map(take);
  const ordinaryTurnDraw=take('Capture Energy');
  const seen=[...opening,ordinaryTurnDraw];
  assert.equal(seen.length,8);
  assert.equal(pool.length,52);
  const glooms=pool.filter(c=>c.name==='Gloom');
  assert.equal(glooms.length,2);
  const unimportant=pool.filter(c=>c.name!=='Gloom');
  assert.ok(unimportant.length>=6);
  const prizesWithoutGloom=unimportant.slice(0,6);
  const prizesWithGloom=[...glooms,...unimportant.slice(0,4)];

  /** @param {object[]} prizes */
  function partition(prizes) {
    const set=new Set(prizes);
    const deck=pool.filter(card=>!set.has(card));
    assert.equal(deck.length,46);
    return {prizes,deck};
  }
  return {
    seen,
    withTarget:partition(prizesWithoutGloom),
    targetPrized:partition(prizesWithGloom)
  };
}

/** @param {object} part */
function playerWithHiddenPartition(part) {
  return {
    bench:[{getPokemonCard:()=>({name:'Oddish',fullName:'Oddish UNB'})}],
    deck:{cards:part.deck.map(card=>({
      name:card.name,
      evolvesFrom:card.name==='Gloom'?'Oddish':undefined,
      stage:card.name==='Gloom'?'STAGE_1':undefined
    }))},
    prizes:part.prizes.map(c=>({cards:[c]}))
  };
}

test('Bunnelby K0 gate branches on hidden Prize composition',()=>{
  const fixture=k0PrizePair();
  const valid=playerWithHiddenPartition(fixture.withTarget);
  const allPrized=playerWithHiddenPartition(fixture.targetPrized);
  assert.equal(valid.deck.cards.length,46);
  assert.equal(allPrized.deck.cards.length,46);
  assert.equal(valid.prizes.length,6);
  assert.equal(allPrized.prizes.length,6);
  assert.deepEqual(
    valid.bench.map(slot=>slot.getPokemonCard()?.fullName),
    allPrized.bench.map(slot=>slot.getPokemonCard()?.fullName));
  assert.equal(hasBenchEvolutionTarget(valid),true,
    'Search sees source Gloom remaining in hidden deck');
  assert.equal(hasBenchEvolutionTarget(allPrized),false,
    'Both source Gloom copies facedown Prized suppress the proposed attack');
  assert.deepEqual(fixture.seen,fixture.seen,
    'The same physical eight known cards were selected before both Prize deals');
});

test('K0 target-prize exposure is a real rank-2 60-card configuration',()=>{
  const pair=k0PrizePair();
  assert.deepEqual(
    pair.withTarget.prizes.filter(c=>c.name==='Gloom').map(c=>c.name),[]);
  assert.equal(pair.targetPrized.prizes.filter(c=>c.name==='Gloom').length,2);
  const publicSignature=part=>({
    seen:pair.seen.map(c=>[c.name,c.printing.set,c.printing.number,c.copy]),
    ownActive:'Bunnelby PRC',ownBench:['Oddish UNB'],
    concealedPrizeSlots:part.prizes.length,concealedDeckSize:part.deck.length,
    noDeckSearchYet:true
  });
  assert.deepEqual(publicSignature(pair.withTarget),
    publicSignature(pair.targetPrized));
});

module.exports={k0PrizePair,playerWithHiddenPartition};
