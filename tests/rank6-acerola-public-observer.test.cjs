'use strict';
const assert=require('node:assert/strict');
const {publicPokemon,publicSide}=require('../simulation/twinleaf/rank6-acerola-public-observer.cjs');
const slot={getPokemonCard:()=>({name:'Shadow Rider Calyrex V'}),damage:140,energies:{cards:[1,2]}};
assert.deepEqual(publicPokemon(slot),{name:'Shadow Rider Calyrex V',damage:140,attachedEnergyCards:2});
const state={players:[{active:slot,bench:[],prizes:[{cards:[1]}]}]};
assert.equal(publicSide(state,0).active.damage,140);
assert.equal(publicSide(state,0).prizesRemaining,1);
console.log('rank6 public Acerola projection assertions passed');
