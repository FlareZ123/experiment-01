'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createPolicy, POLICY_VERSION } =
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');

// The frozen candidate has Latias ex SSP76 and only Basic Psychic Energy.
// If its Active Eon Blade would become playable after one manual attachment,
// the worker must not pass despite an offered legal energy-attachment action.
const nrg = n => Array(n).fill('Psychic Energy MEE 13');
const poke = (name, hp, type, n, attacks) => ({
  printing: name, hp, damage: 0, tools: [], abilities: [],
  abilitySuppressions: [], energies: nrg(n), attacks,
  printed: { stage: 'BASIC', subtypes: ['Basic'], types: [type],
    weakness: [], resistance: [], retreatCost: ['Colorless'] }
});
const latias = n => poke('Latias ex SSP 76', 210, 'Psychic', n, [
  { name: 'Eon Blade', cost: ['Psychic', 'Psychic', 'Colorless'], damage: '200' }
]);
const opponent = () => poke('Iron Thorns ex TWM 77', 230, 'Lightning', 0, []);
const side = (active, stadium = []) => ({
  active, bench: [], stadium, discard: [], lostZone: [], resolvingSupporter: [],
  deckCount: 30, handCount: 1, publicTurnRestrictions: { gxUsed: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: 0 }
});
function request(seat, attached, labyrinth) {
  const active = latias(attached);
  const currentAttackPayable = attached >= 3 + (labyrinth ? 1 : 0);
  return { role: 'candidate', seat, prompt: null, publicEventReceipt: null,
    observation: { actorSeat: seat, decisionKind: 'owner-root',
      ownHand: ['Psychic Energy MEE 13'], ownTurnResources: {
        supporterPlayedTurn: 0
      }, ownPublic: side(active), opponentPublic: side(opponent(),
        labyrinth ? ['Wondrous Labyrinth ◇ TEU 158'] : []) },
    actionFrontier: { items: [
      { token: 'attach-latias', kind: 'play-card',
        actorPrinting: 'Psychic Energy MEE 13',
        targetPrinting: active.printing,
        publicMetadata: { targetSeat: 'actor', targetZone: 'active' } },
      ...(currentAttackPayable ? [
        { token: 'eonblade', kind: 'attack', attackName: 'Eon Blade' }
      ] : []),
      { token: 'pass', kind: 'pass' }
    ] }
  };
}
for (const seat of [0, 1]) for (const [label, n, labyrinth, want] of [
  ['third Psychic unlocks Eon Blade', 2, false, 'attach-latias'],
  ['already playable: attack, do not burn manual attachment', 3, false, 'eonblade'],
  ['Wondrous at two Psychic: one card still insufficient', 2, true, 'pass'],
  ['Wondrous at three Psychic: fourth card unlocks', 3, true, 'attach-latias']
]) test(label + ' seat ' + seat, () => {
  const input = request(seat, n, labyrinth);
  const result = createPolicy({
    role: 'candidate', seat, policyVersion: POLICY_VERSION, config: {}
  }).decideWithAudit(input);
  assert.deepEqual(result.decision, { kind: 'select-action', token: want });
  assert.deepEqual(result.policyAudit.selectedTokens, [want]);
  assert.deepEqual(result.policyAudit.evaluations.map(x => x.token),
    input.actionFrontier.items.map(x => x.token));
});


for (const seat of [0, 1]) for (const lastApex of [false, true]) {
  test('Wondrous Mimikyu Copycat funding with last-attack receipt=' +
    lastApex + ' seat ' + seat, () => {
    const active = poke('Mimikyu GRI 58', 70, 'Psychic', 2, [
      { name: 'Copycat', cost: ['Psychic', 'Colorless'], damage: '' }
    ]);
    const own = side(active);
    own.discard = ['Dialga-GX UPR 100'];
    const other = side(poke('Regidrago VSTAR SIT 136', 280,
      'Dragon', 0, []), ['Wondrous Labyrinth ◇ TEU 158']);
    const input = {
      role: 'candidate', seat, prompt: null,
      publicEventReceipt: lastApex ? { opponentCopycatChoices: [
        { attackName: 'Apex Dragon', sourcePrinting: 'Regidrago VSTAR SIT 136' }
      ] } : null,
      observation: {
        actorSeat: seat, decisionKind: 'owner-root',
        ownHand: ['Psychic Energy MEE 13'], ownPublic: own,
        opponentPublic: other,
        ownTurnResources: { supporterPlayedTurn: 0 }
      },
      actionFrontier: { items: [
        { token: 'attach-mimikyu', kind: 'play-card',
          actorPrinting: 'Psychic Energy MEE 13', targetPrinting: active.printing,
          publicMetadata: { targetSeat: 'actor', targetZone: 'active' } },
        { token: 'pass', kind: 'pass' }
      ] }
    };
    const expected = lastApex ? 'attach-mimikyu' : 'pass';
    const got = createPolicy({
      role: 'candidate', seat, policyVersion: POLICY_VERSION, config: {}
    }).decideWithAudit(input);
    assert.deepEqual(got.decision, { kind: 'select-action', token: expected });
    assert.deepEqual(got.policyAudit.selectedTokens, [expected]);
  });
}
