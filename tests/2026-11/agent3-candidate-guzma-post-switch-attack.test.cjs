'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createPolicy, POLICY_VERSION } =
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');

// Guzma's mandatory own-Active switch means the pre-Guzma Active cannot be
// counted as the post-switch attacker. A funded Bench successor is required.
const energy = n => Array(n).fill('Psychic Energy MEE 13');
const poke = (name, hp, type, n, attacks) => ({
  printing: name, hp, damage: 0, tools: [], abilities: [],
  abilitySuppressions: [], energies: energy(n), attacks,
  printed: { stage: 'BASIC', subtypes: ['Basic'], types: [type],
    weakness: [], resistance: [], retreatCost: ['Colorless'] }
});
const vmax = n => poke('Shadow Rider Calyrex VMAX CRE 75', 320,
  'Psychic', n, [{ name: 'Max Geist',
    cost: ['Colorless', 'Colorless', 'Colorless'], damage: '10+' }]);
const v = () => poke('Shadow Rider Calyrex V CRE 74', 210, 'Psychic',
  0, [{ name: 'Shadow Mist', cost: ['Psychic'], damage: '10' }]);
const opponent = () => poke('Iron Thorns ex TWM 77', 230, 'Lightning', 0, []);
const weakBench = () => poke('Mimikyu GRI 58', 70, 'Psychic', 0, []);
const side = (active, bench, stadium = []) => ({
  active, bench, stadium, discard: [], lostZone: [], resolvingSupporter: [],
  deckCount: 30, handCount: 1,
  publicTurnRestrictions: { gxUsed: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: 0 }
});
function root(seat, benchEnergy, labyrinth) {
  const target = benchEnergy === null ? v() : vmax(benchEnergy);
  return {
    role: 'candidate', seat, prompt: null, publicEventReceipt: null,
    observation: {
      actorSeat: seat, decisionKind: 'owner-root',
      ownHand: ['Guzma BUS 115'], ownTurnResources: { supporterPlayedTurn: 0 },
      ownPublic: side(vmax(4), [target]),
      opponentPublic: side(opponent(), [weakBench()],
        labyrinth ? ['Wondrous Labyrinth ◇ TEU 158'] : [])
    },
    actionFrontier: { items: [
      { token: 'guzma', kind: 'play-card',
        actorPrinting: 'Guzma BUS 115',
        publicMetadata: { cardType: 'supporter' } },
      { token: 'max-geist', kind: 'attack', attackName: 'Max Geist' },
      { token: 'pass', kind: 'pass' }
    ] }
  };
}
const cases = [
  ['unfunded post-Guzma Bench: protect viable Active attack',
    null, false, 'max-geist'],
  ['funded post-Guzma Bench: keep viable gust',
    3, false, 'guzma'],
  ['Wondrous taxes three-Energy post-Guzma Bench',
    3, true, 'max-geist'],
  ['Wondrous with fourth Energy: keep viable gust',
    4, true, 'guzma']
];
for (const seat of [0, 1]) for (const [label, funded, labyrinth, token] of cases) {
  test(label + ' seat ' + seat, () => {
    const request = root(seat, funded, labyrinth);
    const got = createPolicy({
      role: 'candidate', seat, policyVersion: POLICY_VERSION, config: {}
    }).decideWithAudit(request);
    assert.deepEqual(got.decision, { kind: 'select-action', token });
    assert.deepEqual(got.policyAudit.selectedTokens, [token]);
    assert.deepEqual(got.policyAudit.evaluations.map(item => item.token),
      request.actionFrontier.items.map(item => item.token));
  });
}
