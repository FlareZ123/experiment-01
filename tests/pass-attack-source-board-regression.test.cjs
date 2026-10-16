'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {stageSourceBunnelbyBoard} = require('../simulation/twinleaf/bunnelby-tm-policy-replay.cjs');
const {probePassedAttackOptions} = require('../simulation/twinleaf/pass-attack-announcement-probe.cjs');

test('source Bunnelby TM Evolution is accepted without changing the live game', () => {
  const {fixture:f} = stageSourceBunnelbyBoard();
  const before = [...f.attacker.deck.cards];
  const random = Math.random;
  let calls = 0;
  Math.random = () => {calls++; return 0.7;};
  let report;
  try {
    report = probePassedAttackOptions(f.store.state, f.attacker.id);
    assert.equal(calls, 0);
  } finally {
    Math.random = random;
  }
  assert.ok(report.tested.some(a => a.name === 'Evolution' && a.source === 'attached-tool' && a.engineAcceptedAnnouncement));
  assert.deepEqual(f.attacker.deck.cards, before);
});

test('source TM Evolution becomes unpayable with Energy removed', () => {
  const {fixture:f} = stageSourceBunnelbyBoard();
  const attached = [...f.attacker.active.energies.cards];
  f.attacker.active.energies.cards.length = 0;
  for (const card of attached) {
    const i = f.attacker.active.cards.indexOf(card);
    if (i !== -1) f.attacker.active.cards.splice(i, 1);
  }
  const report = probePassedAttackOptions(f.store.state, f.attacker.id);
  assert.ok(report.tested.some(a => a.name === 'Evolution' && !a.engineAcceptedAnnouncement));
});
