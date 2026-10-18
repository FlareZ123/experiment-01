'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {newMoonBenchNeeds,reservedBasicPlay} = require(
  '../simulation/twinleaf/newmoon-bench-reservation-policy.cjs');
const phase=4;

/** @param {string|null} name */
const slot=name=>({getPokemonCard:()=>name?{fullName:name}:undefined});
/** @param {string[]} bench @param {string[]} hand @param {string} [active] */
function owner(bench,hand,active='Unown AOR') {
  return {active:slot(active),bench:bench.map(slot),hand:{
    cards:hand.map(fullName=>({fullName,stage:0}))
  }};
}
const core=['Galarian Articuno V CRE','Mewtwo & Mew-GX UNM',
  'Gengar & Mimikyu-GX TEU',null,null];

/** @param {number} index */
function play(index) {
  return {constructor:{name:'PlayCardAction'},handIndex:index};
}

test('two New Moon partners are absent in the verified post-VIP board',()=>{
  const player=owner(core,['Mewtwo & Mew-GX UNM','Psychic Energy MEE']);
  const need=newMoonBenchNeeds(player);
  assert.deepEqual(need,{
    missing:['Solrock CES','Lunatone OBF'],free:2,hasAttackCore:true
  });
  assert.deepEqual(reservedBasicPlay(play(0),player,1,phase,phase),{
    name:'Mewtwo & Mew-GX UNM',free:2,
    missing:['Solrock CES','Lunatone OBF']
  });
});

test('does not veto a printed Solrock or Lunatone in owner hand',()=>{
  const player=owner(core,['Solrock CES','Lunatone OBF']);
  assert.equal(reservedBasicPlay(play(0),player,1,phase,phase),null);
  assert.equal(reservedBasicPlay(play(1),player,1,phase,phase),null);
});

test('allows nonpartner Pokémon if sufficient Bench room remains',()=>{
  const player=owner(['Galarian Articuno V CRE',
    'Mewtwo & Mew-GX UNM','Gengar & Mimikyu-GX TEU',null,null,null],
    ['Unown AOR']);
  assert.equal(reservedBasicPlay(play(0),player,1,phase,phase),null);
});

test('one missing partner reserves one vacancy and both established require none',()=>{
  const player=owner(['Mewtwo & Mew-GX UNM',
    'Gengar & Mimikyu-GX TEU','Solrock CES',null],
    ['Unown AOR']);
  assert.equal(newMoonBenchNeeds(player).missing.length,1);
  assert.equal(reservedBasicPlay(play(0),player,1,phase,phase),null);
  player.bench[3]=slot('Galarian Articuno V CRE');
  assert.equal(reservedBasicPlay(play(0),player,1,phase,phase)?.name,'Unown AOR');
  player.bench[3]=slot('Lunatone OBF');
  assert.equal(reservedBasicPlay(play(0),player,1,phase,phase),null);
});

test('source-only K0 zone constraint and turn/phase gate',()=>{
  const player=owner(core,['Unown AOR']);
  Object.defineProperty(player,'deck',{get(){throw Error('K0-deck read');}});
  Object.defineProperty(player,'prizes',{get(){throw Error('Prize read');}});
  assert.equal(reservedBasicPlay(play(0),player,5,phase,phase),null);
  assert.equal(reservedBasicPlay(play(0),player,1,phase,3),null);
  assert.equal(reservedBasicPlay({constructor:{name:'PassTurnAction'}},
    player,1,phase,phase),null);
  assert.equal(reservedBasicPlay(play(0),player,1,phase,phase)?.name,'Unown AOR');
  assert.deepEqual(newMoonBenchNeeds(player).missing,
    ['Solrock CES','Lunatone OBF']);
});

test('trainers and Energy attachments are outside the basic-play veto',()=>{
  const player=owner(core,['Psychic Energy MEE','Battle VIP Pass FST']);
  player.hand.cards[0].stage=undefined;
  assert.equal(reservedBasicPlay(play(0),player,1,phase,phase),null);
  assert.equal(reservedBasicPlay(play(1),player,1,phase,phase)?.name,
    'Battle VIP Pass FST');
});
