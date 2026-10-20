'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  SEED, SOURCE_SEAT, OWNER_SEAT, ORIGINAL_HAND, TARGET,
  ORIGINAL_LEDGER_SHA256, ownerView
} = require('../simulation/twinleaf/agent40-natural-sentinel-owner-carmine.cjs');

test('frozen natural one-source one-owner direct-native test provenance', () => {
  assert.equal(SEED, 20261102);
  assert.equal(SOURCE_SEAT, 0);
  assert.equal(OWNER_SEAT, 1);
  assert.equal(TARGET, 'Carmine TWM');
  assert.equal(ORIGINAL_HAND.length, 5);
  assert.match(ORIGINAL_LEDGER_SHA256, /^[a-f0-9]{64}$/);
});

test('owner view never reads source private zones or opponent prizes', () => {
  const supportType = require('../simulation/twinleaf/agent40-natural-sentinel-owner-carmine.cjs');
  assert.equal(typeof supportType.ownerView, 'function');
  const nativeTypes = require('../vendor/twinleaf/ptcg-server/output/game/store/card/card-types');
  const pokemon = fullName => ({getPokemonCard: () => ({fullName})});
  const source = {active: pokemon('Stoutland BCR')};
  Object.defineProperty(source, 'hand', {get() {
    throw Error('Reading source private hand is prohibited');
  }});
  Object.defineProperty(source, 'deck', {get() {
    throw Error('Reading source private deck is prohibited');
  }});
  const owner = {
    hand: {cards: [
      {fullName:'Carmine TWM',trainerType:nativeTypes.TrainerType.SUPPORTER},
      {fullName:'Mysterious Treasure FLI',trainerType:nativeTypes.TrainerType.ITEM}
    ]},
    discard: {cards: [
      {fullName:'Tulip PAR',trainerType:nativeTypes.TrainerType.SUPPORTER},
      {fullName:'Psychic Energy MEE'}
    ]},
    supporterTurn:0,
    active:pokemon('Latias ex SSP'),
    bench:[pokemon('Shadow Rider Calyrex VMAX CRE')]
  };
  const view = ownerView({turn:7,activePlayer:1,players:[source,owner]});
  assert.equal(view.ownerSupporterTurn,0);
  assert.deepEqual(view.ownerHand,['Carmine TWM','Mysterious Treasure FLI']);
  assert.deepEqual(view.ownerDiscardSupporters,['Tulip PAR']);
  assert.deepEqual(view.ownerBench,['Shadow Rider Calyrex VMAX CRE']);
  assert.equal(view.sourcePublicActive,'Stoutland BCR');
});
