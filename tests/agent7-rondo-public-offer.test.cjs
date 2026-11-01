'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {offerPublicRondo}=require('../simulation/twinleaf/agent7-public-rondo-attack-offer.cjs');

test('exports a public attack offer',()=>assert.equal(typeof offerPublicRondo,'function'));

const catalog={basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialEnergies:new Set(),stages:{BASIC:0},specialConditions:{}};
const attack={name:'Full Moon Rondo',damage:20,cost:[5,9],
  text:"This attack does 20 more damage for each Benched Pokémon (both yours and your opponent's)."};
function view(){
 return {decisionKind:'owner-root',globalTurn:6,
  ownPublic:{stadium:[],active:{printing:"Lillie's Clefairy ex JTG",
    printed:{stage:0},energies:['Psychic Energy SVE','Psychic Energy SVE'],
    attacks:[attack]},bench:[{}, {}, {}]},
  opponentPublic:{stadium:[],bench:[{}, {}]}};
}
test('count only public occupied Bench slots',()=>{
 assert.equal(offerPublicRondo(view(),catalog).estimatedDamage,120);
 const x=view();x.ownPublic.active.energies=['Psychic Energy SVE'];
 assert.equal(offerPublicRondo(x,catalog),null);
});
