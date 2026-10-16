'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {stageSourceBunnelbyBoard} =
  require('../simulation/twinleaf/bunnelby-tm-policy-replay.cjs');
const {publicAttackNames, probeAttackAnnouncements} =
  require('../simulation/twinleaf/attack-announcement-probe.cjs');

test('source Bunnelby with Jet and TM Evolution has accepted cloned announcement', () => {
  const {fixture: fixture} = stageSourceBunnelbyBoard();
  const state = fixture.store.state;
  const player = fixture.attacker;
  const before = {
    cards: [...player.active.cards],
    tool: player.active.tools[0],
    deck: [...player.deck.cards],
    prompts: [...state.prompts],
    turn: state.turn
  };
  const options = publicAttackNames(player);
  assert.ok(options.some(a => a.name === 'Burrow' && a.source === 'printed'));
  assert.ok(options.some(a => a.name === 'Evolution' && a.source === 'attached-tool'));

  const previousRandom = Math.random;
  let liveRandomCalls = 0;
  Math.random = () => {liveRandomCalls += 1; return 0.9;};
  let result;
  try {
    result = probeAttackAnnouncements(state, player.id);
    assert.equal(liveRandomCalls, 0);
  } finally {
    Math.random = previousRandom;
  }
  const evolution = result.attempts.find(a => a.name === 'Evolution');
  assert.equal(evolution.announcementAccepted, true);
  assert.ok(evolution.pendingPrompts.includes('ChoosePokemonPrompt'));
  assert.equal(result.activePokemon, 'Bunnelby');
  assert.ok(result.acceptedCount > 0);
  assert.deepEqual(player.active.cards, before.cards);
  assert.equal(player.active.tools[0], before.tool);
  assert.deepEqual(player.deck.cards, before.deck);
  assert.deepEqual(state.prompts, before.prompts);
  assert.equal(state.turn, before.turn);
  assert.equal(Object.hasOwn(result, 'winRate'), false);
});

test('removing all attack Energy turns announcement into an engine rejection', () => {
  const {fixture: fixture} = stageSourceBunnelbyBoard();
  const player = fixture.attacker;
  const attached = [...player.active.energies.cards];
  player.active.energies.cards.length = 0;
  for (const energy of attached) {
    const index = player.active.cards.indexOf(energy);
    if (index !== -1) player.active.cards.splice(index, 1);
  }
  const report = probeAttackAnnouncements(fixture.store.state, player.id);
  const evolution = report.attempts.find(a => a.name === 'Evolution');
  assert.equal(evolution.announcementAccepted, false);
  assert.ok(typeof evolution.rejection === 'string');
});

test('empty Active has no attack announcements', () => {
  const {fixture: fixture} = stageSourceBunnelbyBoard();
  fixture.attacker.active.cards.length = 0;
  const report = probeAttackAnnouncements(fixture.store.state, fixture.attacker.id);
  assert.equal(report.activePokemon, null);
  assert.deepEqual(report.attempts, []);
  assert.equal(report.acceptedCount, 0);
});

test('unknown player is rejected before probing', () => {
  const {fixture: fixture} = stageSourceBunnelbyBoard();
  assert.throws(() => probeAttackAnnouncements(fixture.store.state, 999999),
    /Unknown probe player/);
});
