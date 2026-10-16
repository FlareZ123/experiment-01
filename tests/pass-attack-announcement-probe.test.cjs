'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {visibleActiveAttacks, probePassedAttackOptions, nextPassProbeBucket} =
  require('../simulation/twinleaf/pass-attack-announcement-probe.cjs');

/** @param {string[]} names */
function activeWithAttacks(names) {
  return {name: 'Fixture Basic', attacks: names.map(name => ({name}))};
}

function fixture() {
  const pokemon = activeWithAttacks(['Strike', 'Echo']);
  return {
    prompts: [],
    players: [{
      id: 101,
      active: {
        getPokemonCard: () => pokemon,
        tools: [{name: 'Tool', attacks: [
          {name: 'Crisis Punch'}, {name: 'Echo'}
        ]}]
      }
    }]
  };
}

test('catalogue preserves public attack order, Tool identity and unique names', () => {
  assert.deepEqual(visibleActiveAttacks(fixture().players[0]), [
    {name: 'Strike', source: 'printed'},
    {name: 'Echo', source: 'printed'},
    {name: 'Crisis Punch', source: 'attached-tool'}
  ]);
});

test('post-choice probe identifies engine-accepted announcements without leaking deck state', () => {
  const state = fixture();
  const visited = [];
  const before = state.prompts.length;
  const result = probePassedAttackOptions(state, 101, (_state, id, attack) => {
    assert.equal(id, 101);
    visited.push(attack);
    return attack === 'Crisis Punch';
  });
  assert.deepEqual(visited, ['Strike', 'Echo', 'Crisis Punch']);
  assert.deepEqual(result.tested.map(x => x.engineAcceptedAnnouncement),
    [false, false, true]);
  assert.equal(result.truncated, false);
  assert.equal(result.evidenceType, 'post-choice-cloned-attack-announcements-v1');
  assert.equal(state.prompts.length, before);
  assert.equal(JSON.stringify(result).includes('deckCards'), false);
});

test('unresolved prompts and unknown players do not produce post-pass evidence', () => {
  const state = fixture();
  assert.equal(probePassedAttackOptions(state, 202, () => true), null);
  state.prompts.push({result: undefined});
  assert.equal(probePassedAttackOptions(state, 101, () => true), null);
});

test('probe bounds speculative attack enumeration to eight visible names', () => {
  const state = fixture();
  const pokemon = activeWithAttacks(Array.from({length: 10}, (_, i) => 'A' + i));
  state.players[0].active.getPokemonCard = () => pokemon;
  state.players[0].active.tools = [];
  let attempts = 0;
  const result = probePassedAttackOptions(state, 101, () => {
    attempts++;
    return true;
  });
  assert.equal(attempts, 8);
  assert.equal(result.tested.length, 8);
  assert.equal(result.truncated, true);
});

test('compiled pinned Store accepts a Crisis Punch Tool attack in a detached clone', (t) => {
  const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
  if (!fs.existsSync(root)) return t.skip('Compile pinned Twinleaf first');
  const {preparedToolAttack} =
    require('../simulation/twinleaf/tm-attack-policy-characterization.cjs');
  const setup = preparedToolAttack();
  const before = {
    turn: setup.state.turn,
    activeDamage: setup.attacker.active.damage,
    defenderDamage: setup.defender.active.damage,
    phase: setup.state.phase,
    attackerDeck: setup.attacker.deck.cards.map(c => c.fullName),
    defenderDeck: setup.defender.deck.cards.map(c => c.fullName)
  };
  const originalRandom = Math.random;
  const result = probePassedAttackOptions(setup.state, setup.attacker.id);
  assert.equal(Math.random, originalRandom);
  assert.ok(result.tested.some(a =>
    a.name === 'Crisis Punch' && a.source === 'attached-tool' &&
    a.engineAcceptedAnnouncement === true));
  assert.deepEqual({
    turn: setup.state.turn,
    activeDamage: setup.attacker.active.damage,
    defenderDamage: setup.defender.active.damage,
    phase: setup.state.phase,
    attackerDeck: setup.attacker.deck.cards.map(c => c.fullName),
    defenderDeck: setup.defender.deck.cards.map(c => c.fullName)
  }, before, 'Detached probe must not change live board or deck membership');
});

test('reserve late Tool-specific pass probes even after generic pass quota is exhausted', () => {
  const state = fixture();
  const counts = {printed: 4, tool: 0};
  assert.equal(nextPassProbeBucket(state.players[0], counts), 'tool');
  state.players[0].active.tools = [];
  assert.equal(nextPassProbeBucket(state.players[0], counts), null);
  counts.printed = 0;
  assert.equal(nextPassProbeBucket(state.players[0], counts), 'printed');
  counts.tool = 4;
  state.players[0].active.tools = [{
    attacks: [{name: 'Evolution'}]
  }];
  assert.equal(nextPassProbeBucket(state.players[0], counts), null);
});
