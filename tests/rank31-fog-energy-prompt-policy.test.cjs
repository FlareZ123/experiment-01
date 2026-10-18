'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {selectRank31FogEnergy} =
  require('../simulation/twinleaf/rank31-fog-energy-prompt-policy.cjs');

const types = {
  energySuperType: 3, pokemonSuperType: 1,
  basicEnergyType: 0, basicStage: 2, playerTurnPhase: 2
};

function scenario() {
  const psychic = {superType: 3, energyType: 0, name: 'Psychic Energy'};
  const special = {superType: 3, energyType: 1, name: 'Telepathic Psychic Energy'};
  const otherBasic = {superType: 1, stage: 2, name: 'Unown'};
  const deck = {cards: [otherBasic, special, psychic]};
  const player = {
    id: 101, energyPlayedTurn: 0, cannotPlayEnergyCards: false,
    active: {cards: [{superType: 1, fullName: 'Chimecho CIN'}],
      getPokemonCard: () => ({fullName: 'Chimecho CIN'})},
    bench: [{getPokemonCard: () => undefined}],
    hand: {cards: [{name: 'Roxie', superType: 2}]},
    supporter: {cards: [{name: 'Fog Crystal', fullName: 'Fog Crystal CRE'}]},
    deck
  };
  const state = {turn: 3, phase: 2, activePlayer: 0, players: [{id: 101}]};
  const prompt = {id: 42, playerId: 101, cards: deck, options: {max: 1},
    validate: cards => cards.length === 1 && deck.cards.includes(cards[0])};
  return {state, player, prompt, psychic, special, otherBasic};
}

test('owner-visible Fog search takes Basic Psychic Energy over higher generic Basic score', () => {
  const {state, player, prompt, psychic} = scenario();
  assert.deepEqual(selectRank31FogEnergy(state, player, prompt, types), [psychic]);
});

test('other prompt owners, turn states, and card availability always delegate', () => {
  for (const mutate of [
    s => { s.prompt.playerId = 202; },
    s => { s.prompt.cards = {cards: s.prompt.cards.cards}; },
    s => { s.player.supporter.cards = []; },
    s => { s.player.active.getPokemonCard = () => ({fullName: 'Latias ex SSP'}); },
    s => { s.player.active.cards.push(s.special); },
    s => { s.player.hand.cards.push(s.special); },
    s => { s.player.hand.cards.push(s.otherBasic); },
    s => { s.player.bench[0].getPokemonCard = () => ({name: 'Duskull'}); },
    s => { s.player.energyPlayedTurn = 3; },
    s => { s.player.cannotPlayEnergyCards = true; },
    s => { s.state.phase = 1; },
    s => { s.state.players[0].id = 202; },
    s => { s.prompt.options.max = 0; },
    s => { s.prompt.validate = () => false; },
    s => { s.prompt.cards.cards = [s.otherBasic, s.special]; }
  ]) {
    const s = scenario();
    mutate(s);
    assert.equal(selectRank31FogEnergy(s.state, s.player, s.prompt, types), null);
  }
});

test('selector never consults opponent hidden deck or own face-down Prize cards', () => {
  const s = scenario();
  Object.defineProperty(s.player, 'prizes', {get() {throw new Error('Prize leak');}});
  s.state.players.push({id: 202,
    get deck() {throw new Error('Opponent hidden deck leak');}});
  assert.deepEqual(selectRank31FogEnergy(s.state, s.player, s.prompt, types), [s.psychic]);
});
