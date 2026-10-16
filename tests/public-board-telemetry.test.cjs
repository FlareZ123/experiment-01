'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {describeInPlayPokemon, publicBoardSnapshot} =
  require('../simulation/twinleaf/public-board-telemetry.cjs');

function slot(name, energy=[], tools=[], attacks=[]) {
  const pokemon = name ? {name, attacks} : undefined;
  return {
    getPokemonCard: () => pokemon, damage: 20,
    energies: {cards: energy.map(value => ({name:value}))},
    tools: tools.map(value => ({name:value}))
  };
}

test('a visible Active and Benched Pokémon retain Energy identities and printed attack cost',()=>{
  const state = {players: [
    {
      active: slot('Shadow Rider Calyrex VMAX',['Psychic Energy'],['Stealthy Hood'],
        [{name:'Max Geist',cost:['P','C','C']}]),
      bench: [slot('Latias ex',[],[],[{name:'Eon Blade',cost:['P','P','C']}])],
      stadium: {cards:[{name:'Sky Field'}]},
      deck: {cards:[{name:'Secret Deck Card'}]}, hand:{cards:[{name:'Secret Hand Card'}]}
    },
    {active:slot('Iron Thorns ex'),bench:[],stadium:{cards:[]}}
  ]};
  const publicBoard = publicBoardSnapshot(state);
  assert.deepEqual(publicBoard[0].active.energyCards,['Psychic Energy']);
  assert.deepEqual(publicBoard[0].active.toolCards,['Stealthy Hood']);
  assert.deepEqual(publicBoard[0].active.printedAttacks,
    [{name:'Max Geist',cost:['P','C','C']}]);
  assert.equal(publicBoard[0].bench[0].name,'Latias ex');
  assert.deepEqual(publicBoard[0].stadium,['Sky Field']);
  assert.doesNotMatch(JSON.stringify(publicBoard),/Secret Deck Card|Secret Hand Card/);
  state.players[0].active.energies.cards.push({name:'Another Energy'});
  assert.equal(publicBoard[0].active.energyCards.length,1);
});

test('vacant Active or Bench slots return null and are excluded',()=>{
  const empty=slot();
  assert.equal(describeInPlayPokemon(empty),null);
  assert.deepEqual(publicBoardSnapshot({players:[{
    active:empty, bench:[empty,slot('Mimikyu')],stadium:{cards:[]}
  }]}),[{
    active:null,
    bench:[{name:'Mimikyu',damage:20,energyCards:[],toolCards:[],printedAttacks:[]}],
    stadium:[]
  }]);
});
