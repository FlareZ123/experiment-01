'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {eggDonorRecoveryChoice} =
  require('../simulation/twinleaf/agent47-rank26-egg-donor-recovery-optin.cjs');

/** @param {string|null} name @param {number} damage */
function slot(name, damage=0) {
  return {damage,getPokemonCard:() => name ? {name} : undefined};
}

/**
 * Public board and owner-zone synthetic state. Paper visibility only:
 * the source may read its own hand/discard and both public Prize counts.
 */
function fixture() {
  const owner = {
    hand:{cards:[{name:'Damage Pump'}]},
    discard:{cards:[{name:'Exeggcute'},{name:'Exeggcute'}]},
    stadium:{cards:[{name:'Risky Ruins'}]},
    bench:[slot('Meloetta ex'),slot('Tapu Koko Prism Star'),
      slot(null),slot(null),slot(null)]
  };
  const opponent = {prizes:Array.from({length:2},()=>
    ({cards:[{name:'Prize face down'}]})),bench:[]};
  return {players:[owner,opponent],activePlayer:0,
    turn:1,phase:3,prompts:[]};
}

test('exact fifth-KO owner response recovers from own discard', () => {
  assert.deepEqual(eggDonorRecoveryChoice(fixture(),0),
    {kind:'propagate',index:0,benchIndex:2});
});
test('held Egg goes to first vacant Bench ahead of discard', () => {
  const s=fixture();
  s.players[0].hand.cards.push({name:'Exeggcute'});
  s.players[0].discard.cards.pop();
  assert.deepEqual(eggDonorRecoveryChoice(s,0),
    {kind:'bench',index:1,benchIndex:2});
});
test('after first Egg is Benched, choose second own discard Egg', () => {
  const s=fixture();
  s.players[0].bench[2]=slot('Exeggcute',20);
  s.players[0].discard.cards.pop();
  assert.deepEqual(eggDonorRecoveryChoice(s,0),
    {kind:'propagate',index:0,benchIndex:3});
});
test('fail closed for insufficient copies, slots or already staged Eggs', () => {
  const s=fixture();
  s.players[0].discard.cards.pop();
  assert.equal(eggDonorRecoveryChoice(s,0),null);
  s.players[0].discard.cards.push({name:'Exeggcute'});
  s.players[0].bench=[slot('Meloetta ex'),slot('Tapu Koko Prism Star'),
    slot('Exeggcute',20),slot('Exeggcute',20),slot('Squawkabilly ex')];
  assert.equal(eggDonorRecoveryChoice(s,0),null);
  s.players[0].bench[3]=slot('Squawkabilly ex');
  assert.equal(eggDonorRecoveryChoice(s,0),null);
});
test('fail closed when any damaged non-Egg can donate', () => {
  const s=fixture();
  s.players[0].bench[0].damage=10;
  assert.equal(eggDonorRecoveryChoice(s,0),null);
});
test('fail closed if defender has any other live Bench Pokemon', () => {
  const s=fixture();
  s.players[1].bench.push(slot('Iron Thorns ex'));
  assert.equal(eggDonorRecoveryChoice(s,0),null);
});
test('fail closed outside exact fifth-KO first source turn', () => {
  const s=fixture();
  s.turn=2; assert.equal(eggDonorRecoveryChoice(s,0),null);
  s.turn=1;s.phase=4;assert.equal(eggDonorRecoveryChoice(s,0),null);
  s.phase=3;s.activePlayer=1;assert.equal(eggDonorRecoveryChoice(s,0),null);
  s.activePlayer=0;
  s.players[1].prizes.push({cards:[{name:'Prize face down'}]});
  assert.equal(eggDonorRecoveryChoice(s,0),null);
});
test('fail closed for missing Pump, Ruins, or unresolved prompt', () => {
  const s=fixture();
  s.players[0].hand.cards=[];assert.equal(eggDonorRecoveryChoice(s,0),null);
  s.players[0].hand.cards=[{name:'Damage Pump'}];
  s.players[0].stadium.cards=[];assert.equal(eggDonorRecoveryChoice(s,0),null);
  s.players[0].stadium.cards=[{name:'Risky Ruins'}];
  s.prompts=[{result:undefined}];
  assert.equal(eggDonorRecoveryChoice(s,0),null);
});
test('read only source seat, no accidental cross-player or missing seat action',()=>{
  const s=fixture();
  assert.equal(eggDonorRecoveryChoice(s,1),null);
  assert.equal(eggDonorRecoveryChoice(s,2),null);
});
