'use strict';

// Public target printed Prize rule must not collapse every Rule Box to two.
// Actor-only Guzma choice priorities; not a guarantee of a same-turn KO.
const test = require('node:test');
const assert = require('node:assert/strict');
const { POLICY_VERSION, createPolicy } =
  require('../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs');

function choose(seat, first, second, opts = {}) {
  const p = value => ({
    printing: value.printing, hp: 320, damage: 0,
    energies: [], tools: [], printed: { ...value.printed }
  });
  const board = [p(first), p(second), null, null, null];
  const observation = {
    actorSeat: seat, globalTurn: 3, ownHand: ['Guzma BUS 115'],
    ownPublic: { active: { printing: 'Bunnelby PRC 121' },
      bench: [null, null, null, null, null] },
    opponentPublic: {
      active: { printing: 'Shadow Rider Calyrex VMAX CRE 75' }, bench: board,
      publicTurnRestrictions: { itemPlayLocked: false }
    },
    ownTurnResources: { supporterPlayedTurn: 0, supporterPlayLocked: false }
  };
  const choices = [0, 1].map(index => ({
    token: 'target-' + index, kind: 'pokemon', printing: board[index].printing,
    label: board[index].printing,
    publicMetadata: {
      ownerSeat: 'opponent', targetZone: 'bench', benchIndex: index,
      selectionIndex: index, selectionType: 'pokemon', isOwnerVisible: true
    }
  }));
  if (opts.reverse) choices.reverse();
  return createPolicy({ role: 'opponent', seat, policyVersion: POLICY_VERSION,
    config: {} }).decide({
    role: 'opponent', seat, observation,
    prompt: {
      promptType: 'ChoosePokemonPrompt',
      source: { sourcePrinting: 'Guzma BUS 115', effectName: 'Guzma' },
      publicMetadata: { selectionType: 'pokemon',
        minimumCount: 1, maximumCount: 1 },
      choices
    },
    actionFrontier: { items: [] }
  });
}
const c = printing => ({ printing });
const pick = i => ({ kind: 'select-choices', tokens: ['target-' + i] });

for (const seat of [0, 1]) {
  test('seat ' + seat + ': VMAX awards three Prizes versus V two', () => {
    assert.deepEqual(choose(seat,
      c('Shadow Rider Calyrex V CRE 74'),
      c('Shadow Rider Calyrex VMAX CRE 75')), pick(1));
  });

  test('seat ' + seat + ': TAG TEAM-GX awards three Prizes versus ordinary GX two', () => {
    assert.deepEqual(choose(seat,
      c('Tapu Lele-GX GRI 60'),
      c('Gengar & Mimikyu-GX TEU 53')), pick(1));
  });

  test('seat ' + seat + ': old uppercase EX is a two-Prize Pokémon', () => {
    assert.deepEqual(choose(seat,
      c('Wobbuffet PHF 36'),
      c('M Gengar-EX PHF 35')), pick(1));
  });

  test('seat ' + seat + ': Mega Evolution ex awards three rather than lower-case ex two', () => {
    assert.deepEqual(choose(seat,
      c('Lucario ex MEG 20'),
      c('Mega Lucario ex MEG 80')), pick(1));
  });

  test('seat ' + seat + ': V-UNION gives three versus VSTAR two', () => {
    assert.deepEqual(choose(seat,
      c('Regidrago VSTAR SIT 136'),
      c('Greninja V-UNION SWSH 155')), pick(1));
  });

  test('seat ' + seat + ': printed TAG TEAM subtype can override opaque printing', () => {
    const mysterious = { printing: 'Opaque Pokémon ABC 7',
      printed: { subtypes: ['TAG TEAM'], rules: [] } };
    assert.deepEqual(choose(seat,
      c('Tapu Lele-GX GRI 60'), mysterious), pick(1));
  });

  test('seat ' + seat + ': reverse choice presentation retains higher Prize physical target', () => {
    assert.deepEqual(choose(seat,
      c('Shadow Rider Calyrex V CRE 74'),
      c('Shadow Rider Calyrex VMAX CRE 75'), { reverse: true }), pick(1));
  });

  test('seat ' + seat + ': ordinary single-Prize defeats no Rule Box at equal HP tie by stable choice order', () => {
    assert.deepEqual(choose(seat,
      c('Wobbuffet PHF 36'), c('Oddish UNB 5')), pick(0));
  });
}
