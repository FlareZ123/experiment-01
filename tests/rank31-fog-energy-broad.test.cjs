'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {selectRank31FogEnergy} =
  require('../simulation/twinleaf/rank31-fog-energy-prompt-policy.cjs');

const types = {
  energySuperType: 3, pokemonSuperType: 1,
  basicEnergyType: 0, basicStage: 2, playerTurnPhase: 2
};

/** @returns {object} One playable owner-visible Fog-for-Psychic prompt. */
function scenario() {
  const psychic = {superType: 3, energyType: 0, name: 'Psychic Energy'};
  const telepathic = {superType: 3, energyType: 1,
    name: 'Telepathic Psychic Energy'};
  const basic = {superType: 1, stage: 2, name: 'Duskull'};
  const deck = {cards: [basic, telepathic, psychic]};
  const active = {cards: [{superType: 1, fullName: 'Chimecho CIN'}],
    getPokemonCard: () => ({fullName: 'Chimecho CIN'})};
  const bench = [{getPokemonCard: () => basic}];
  const owner = {id: 101, energyPlayedTurn: 0,
    cannotPlayEnergyCards: false, active, bench,
    hand: {cards: [basic]},
    supporter: {cards: [{fullName: 'Fog Crystal CRE'}]}, deck};
  const state = {turn: 3, phase: 2, activePlayer: 0,
    players: [{id: 101}, {id: 202}]};
  const prompt = {id: 4, playerId: 101, cards: deck,
    options: {max: 1},
    validate: cards => cards.length === 1 && cards[0] === psychic};
  return {state, owner, prompt, psychic, basic, telepathic};
}

test('strict option retains original refusal for extra Basics', () => {
  const s = scenario();
  assert.equal(selectRank31FogEnergy(s.state,s.owner,s.prompt,types),null);
  assert.deepEqual(selectRank31FogEnergy(s.state,s.owner,s.prompt,types,
    {allowOtherBasics:true}),[s.psychic]);
});

test('broader option still requires an Energy deficit and an owned legal Fog search', () => {
  for(const change of [
    s => {s.owner.hand.cards.push(s.telepathic);},
    s => {s.owner.active.cards.push(s.psychic);},
    s => {s.owner.energyPlayedTurn=3;},
    s => {s.owner.cannotPlayEnergyCards=true;},
    s => {s.owner.active.getPokemonCard=()=>({fullName:'Latias ex SSP'});},
    s => {s.state.phase=1;},
    s => {s.state.players[0].id=202;},
    s => {s.prompt.playerId=202;},
    s => {s.prompt.cards={cards:s.prompt.cards.cards};},
    s => {s.owner.supporter.cards.length=0;},
    s => {s.prompt.options.max=0;},
    s => {s.prompt.validate=()=>false;},
    s => {s.prompt.cards.cards=[s.basic,s.telepathic];}
  ]){
    const s=scenario();
    change(s);
    assert.equal(selectRank31FogEnergy(s.state,s.owner,s.prompt,types,
      {allowOtherBasics:true}),null);
  }
});

test('broader strategy does not use private Prizes or opponent hand and deck', () => {
  const s=scenario();
  Object.defineProperty(s.owner,'prizes',{
    get(){throw new Error('Own hidden Prize leak');}
  });
  Object.defineProperty(s.state.players[1],'deck',{
    get(){throw new Error('Opponent hidden deck leak');}
  });
  Object.defineProperty(s.state.players[1],'hand',{
    get(){throw new Error('Opponent hidden hand leak');}
  });
  assert.deepEqual(selectRank31FogEnergy(s.state,s.owner,s.prompt,types,
    {allowOtherBasics:true}),[s.psychic]);
});
