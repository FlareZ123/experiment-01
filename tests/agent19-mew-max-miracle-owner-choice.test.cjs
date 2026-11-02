'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chooseMewMaxMiracleAgainstSafeguard} =
  require('../simulation/twinleaf/agent19-mew-max-miracle-owner-choice.cjs');

/** @param {string} relative Repository-relative path. */
function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', relative), 'utf8'));
}

/** @param {object} [options] Actor-only prompt fixture. */
function offer(options = {}) {
  return {
    actor: {
      decisionKind: 'owner-prompt',
      ownPublic: {active: {printing: options.ownActive ?? 'Mew VMAX FST'}},
      opponentPublic: {active: {printing: options.opponent ?? 'Mimikyu PAL'}}
    },
    prompt: {
      kind: 'ChooseAttackPrompt',
      allowCancel: false,
      offered: [
        {index: 0, printing: 'Genesect V FST', attacks: [
          {index: 0, name: 'Techno Blast', damage: 210, blocked: false}
        ]},
        {index: 1, printing: 'Mew VMAX FST', attacks: [
          {index: 0, name: 'Cross Fusion Strike', blocked: false},
          {index: 1, name: 'Max Miracle', damage: 130,
            blocked: options.blockMaxMiracle === true}
        ]}
      ]
    }
  };
}

test('original rank-5 deck and rank-3/7 PAL97 slots', () => {
  const rows = readJson('results/aichi-2026/full-decklists.json').decks;
  const mew = rows.find(row => row.rank === 5);
  const count = (deck, name) => deck.cards.find(card => card.name === name)?.count ?? 0;
  assert.equal(count(mew, 'Mew V'), 4);
  assert.equal(count(mew, 'Mew VMAX'), 3);
  assert.equal(count(mew, 'Genesect V'), 4);
  assert.equal(count(mew, 'Double Colorless Energy'), 4);
  for (const [rank, qty] of [[3, 1], [7, 3]]) {
    const mimikyu = rows.find(row => row.rank === rank).cards.find(row => row.name === 'Mimikyu');
    assert.equal(mimikyu.count, qty);
    assert.equal(mimikyu.printing.set, 'PAL');
    assert.equal(mimikyu.printing.number, '97');
  }
});

test('printings support [CC] copy of Benched Mew VMAX bypassing Safeguard', () => {
  const find = (file, id) => readJson(file).find(card => card.id === id);
  const mew = find('resources/cards/en/swsh8.json', 'swsh8-114');
  const mimikyu = find('resources/cards/en/sv2.json', 'sv2-97');
  const dce = find('resources/cards/en/sm1.json', 'sm1-136');
  assert.ok(mew.subtypes.includes('Fusion Strike'));
  assert.deepEqual(mew.attacks[0].cost, ['Colorless', 'Colorless']);
  assert.match(mew.attacks[0].text, /Benched Fusion Strike Pokémon/);
  assert.equal(mew.attacks[1].name, 'Max Miracle');
  assert.equal(mew.attacks[1].damage, '130');
  assert.match(mew.attacks[1].text, /isn't affected by any effects/);
  assert.equal(mimikyu.hp, '70');
  assert.match(mimikyu.abilities[0].text, /Pokémon ex and Pokémon V/);
  assert.ok(dce.rules.some(rule => /provides ColorlessColorless Energy/.test(rule)));
});

test('prioritizes Max Miracle from second Mew despite earlier Genesect', () => {
  assert.deepEqual(chooseMewMaxMiracleAgainstSafeguard(offer()),
    {sourceIndex: 1, attackIndex: 1});
});

test('respects native blocked choices and missing second Mew', () => {
  assert.equal(chooseMewMaxMiracleAgainstSafeguard(offer({blockMaxMiracle: true})), null);
  const input = offer();
  input.prompt.offered = input.prompt.offered.slice(0, 1);
  assert.equal(chooseMewMaxMiracleAgainstSafeguard(input), null);
});

test('does not override other public matchups or attacking cards', () => {
  for (const config of [{opponent: 'Iron Thorns ex TWM'},
    {ownActive: 'Genesect V FST'}]) {
    assert.equal(chooseMewMaxMiracleAgainstSafeguard(offer(config)), null);
  }
});

test('ignores hidden opponent hand, Prize identities and deck contents', () => {
  const input = offer();
  input.opponentHiddenHand = ['SECRET'];
  input.opponentPrivateDeck = ['SECRET'];
  input.opponentPrizeCards = ['SECRET'];
  assert.deepEqual(chooseMewMaxMiracleAgainstSafeguard(input),
    {sourceIndex: 1, attackIndex: 1});
});
