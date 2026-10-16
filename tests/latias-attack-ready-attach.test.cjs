'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {chooseLatiasAttackReadyAttachment,withLatiasAttackReadyAttachment} =
  require('../simulation/twinleaf/latias-attack-ready-attach.cjs');

/** @param {string} name @param {number} psychic */
function pokemon(name,psychic) {
  return {
    getPokemonCard() {return {name};},
    energies: {cards:Array.from({length:psychic},()=>({name:'Psychic Energy'}))}
  };
}
/** @param {{active?:string, opponent?:string,psychic?:number,hand?:string[],stadium?:string}} [o] */
function fixture(o={}) {
  const player = {
    active:pokemon(o.active??'Latias ex',o.psychic??2),
    hand:{cards:(o.hand??['Psychic Energy']).map(name=>({name}))},
    stadium:{cards:[{name:o.stadium??'Sky Field'}]}
  };
  const opponent={
    active:pokemon(o.opponent??'Koraidon ex',1),
    stadium:{cards:[]}
  };
  return {player,opponent};
}

test('source-state Latias selects Basic Psychic from hand',()=>{
  const f=fixture({hand:['Iono','Psychic Energy','Boss\'s Orders']});
  assert.deepEqual(chooseLatiasAttackReadyAttachment(f.player,f.opponent),
    {handIndex:1});
});

test('tactic skips other attackers, opponents and Energy states',()=>{
  for(const options of [
    {active:'Shadow Rider Calyrex V'},
    {opponent:'Regidrago VSTAR'},
    {psychic:1},
    {psychic:3},
    {hand:['Iono']},
    {stadium:'Temple of Sinnoh'}
  ]) {
    const f=fixture(options);
    assert.equal(chooseLatiasAttackReadyAttachment(f.player,f.opponent),null);
  }
  const f=fixture();
  f.player.active.cannotAttachEnergyFromHandNextTurn=true;
  assert.equal(chooseLatiasAttackReadyAttachment(f.player,f.opponent),null);
  const normal=fixture();
  normal.player.active.energies.cards[0].name='Fire Energy';
  assert.equal(chooseLatiasAttackReadyAttachment(normal.player,normal.opponent),null);
});

test('opt-in selector inserts a single tactic before generic attachment',()=>{
  const fakeTactics=[
    class UseAbilityTactic{},
    class AttachEnergyTactic{},
    class OtherTactic{}
  ];
  const original={tactics:fakeTactics,promptResolvers:[]};
  const wrapped=withLatiasAttackReadyAttachment(original);
  assert.deepEqual(wrapped.tactics.map(t=>t.name),[
    'UseAbilityTactic','LatiasAttackReadyAttachmentTactic',
    'AttachEnergyTactic','OtherTactic'
  ]);
  assert.deepEqual(original.tactics.map(t=>t.name),
    ['UseAbilityTactic','AttachEnergyTactic','OtherTactic']);
});
