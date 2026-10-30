'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {inspectPhysicalCardZones, fixedDeckCountAnomalies,
  locatedOrPromptCountAnomalies} = require('../simulation/twinleaf/physical-card-ledger.cjs');

const card = id => ({id});
const list = (...cards) => ({cards});
const slot = (cards = [], energies = []) => ({cards, energies: list(...energies)});
const player = () => ({
  deck: list(), hand: list(), discard: list(), lostzone: list(),
  stadium: list(), supporter: list(), active: slot(),
  bench: [slot(), slot()], prizes: [list(), list()]
});

test('valid physical ownership ignores energy secondary index', () => {
  const a = player(), b = player();
  const energy = card(1), pokemon = card(2);
  a.active = slot([pokemon, energy], [energy]);
  b.deck = list(card(3), card(4));
  const ledger = inspectPhysicalCardZones({players: [a, b]});
  assert.deepEqual(ledger.canonicalCounts, [2, 2]);
  assert.deepEqual(ledger.referenceDuplications, []);
  assert.deepEqual(ledger.energyWithoutPhysicalCard, []);
  assert.deepEqual(ledger.repeatedEnergyIndexes, []);
});

test('one physical card in two canonical zones is reported without leaking its face', () => {
  const a = player(), b = player(), telepath = card(77);
  a.deck.cards.push(telepath);
  b.active.cards.push(telepath);
  const ledger = inspectPhysicalCardZones({players: [a, b]});
  assert.deepEqual(ledger.referenceDuplications,
    [{locations: ['seat0.deck', 'seat1.active']}]);
  assert.equal(JSON.stringify(ledger).includes('77'), false);
});

test('ghost attached Energy is detected even if canonical zones are unique', () => {
  const a = player(), b = player(), telepath = card(99);
  a.deck.cards.push(telepath);
  a.bench[0].energies.cards.push(telepath);
  const ledger = inspectPhysicalCardZones({players: [a, b]});
  assert.deepEqual(ledger.referenceDuplications, []);
  assert.deepEqual(ledger.energyWithoutPhysicalCard,
    [{location: 'seat0.bench[0]', count: 1}]);
});

test('repeated energy index and duplicate reference within one zone are separate', () => {
  const a = player(), b = player(), energy = card(3);
  a.active.cards.push(energy);
  a.active.energies.cards.push(energy, energy);
  a.prizes[0].cards.push(energy);
  const ledger = inspectPhysicalCardZones({players: [a, b]});
  assert.deepEqual(ledger.referenceDuplications,
    [{locations: ['seat0.active', 'seat0.prizes[0]']}]);
  assert.deepEqual(ledger.repeatedEnergyIndexes,
    [{location: 'seat0.active', count: 1}]);
});

test('distinct physical instances sharing an id are not conflated', () => {
  const a = player(), b = player();
  a.hand.cards.push(card(123));
  b.hand.cards.push(card(123));
  const ledger = inspectPhysicalCardZones({players: [a, b]});
  assert.deepEqual(ledger.referenceDuplications, []);
});

test('fixed deck count detects missing and duplicated cards', () => {
  assert.deepEqual(fixedDeckCountAnomalies({canonicalCounts: [60, 59]}), [{seat: 1, observed: 59, expected: 60}]);
  assert.deepEqual(fixedDeckCountAnomalies({canonicalCounts: [61, 60]}), [{seat: 0, observed: 61, expected: 60}]);
  assert.deepEqual(fixedDeckCountAnomalies({canonicalCounts: [60, 60]}), []);
});

test('unresolved native AttachEnergyPrompt cardList custody is counted once', () => {
  const a=player(),b=player();
  a.id=101;b.id=202;
  const active=card(1),held=card(2),temporary=card(3);
  a.active.cards.push(active);
  a.deck.cards.push(held);
  const state={players:[a,b],prompts:[{
    playerId:101,cardList:list(temporary),result:undefined
  }]};
  const ledger=inspectPhysicalCardZones(state);
  assert.deepEqual(ledger.canonicalCounts,[2,0]);
  assert.deepEqual(ledger.transientPromptCustody,[1,0]);
  assert.deepEqual(locatedOrPromptCountAnomalies(ledger,3),[
    {seat:1,observed:0,expected:3}
  ]);
});

test('resolved AttachEnergyPrompt leftover is a leaked physical card, not live custody', () => {
  const a=player(),b=player();
  a.id=101;b.id=202;
  a.active.cards.push(card(1));
  a.deck.cards.push(card(2));
  const stranded=card(3);
  const state={players:[a,b],prompts:[{
    playerId:101,cardList:list(stranded),result:[]
  }]};
  const ledger=inspectPhysicalCardZones(state);
  assert.deepEqual(ledger.transientPromptCustody,[0,0]);
  assert.deepEqual(locatedOrPromptCountAnomalies(ledger,3),[
    {seat:0,observed:2,expected:3},
    {seat:1,observed:0,expected:3}
  ]);
});
