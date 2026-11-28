'use strict';

// A payoff-oriented root decision rather than another abstract accessibility
// count. Competing Handiwork is deliberately offered at 12-deck-card urgency.
const test = require('node:test');
const assert = require('node:assert/strict');
const worker = require('../../simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

function state(seat, changes = {}) {
  const active = changes.active ?? 'Bunnelby PRC 121';
  const opponentActive = changes.opponentActive ?? 'Regidrago V SIT 135';
  const energy = changes.water === false ? [] : ['Water Energy SVE'];
  return {
    role: 'opponent', seat,
    observation: {
      actorSeat: seat, globalTurn: 4, decisionKind: 'owner-root',
      ownHand: ['Articuno-GX CES', "Team Rocket's Handiwork FCO 112"],
      ownTurnResources: { supporterPlayedTurn: 0, gxUsed: changes.gxUsed ?? false },
      ownPublic: {
        active: { printing: active, energies: energy },
        bench: [],
        stadium: changes.stadium ? [{ printing: changes.stadium }] : [],
        discard: [],
        publicTurnRestrictions: { gxUsed: changes.gxUsed ?? false }
      },
      opponentPublic: {
        active: {
          printing: opponentActive,
          energies: Array(changes.opponentEnergy ?? 3).fill('Grass Energy SVE')
        },
        bench: [], stadium: [], deckCount: 12, prizeCount: 6
      }
    },
    prompt: null,
    actionFrontier: { items: [
      { token: 'articuno', kind: 'play-card', actorPrinting: 'Articuno-GX CES',
        publicMetadata: { cardType: 'pokemon' } },
      { token: 'mill', kind: 'play-card', actorPrinting: "Team Rocket's Handiwork FCO 112",
        publicMetadata: { cardType: 'supporter' } },
      { token: 'pass', kind: 'pass' }
    ] }
  };
}
function decide(request) {
  return worker.createPolicy({
    role: 'opponent', seat: request.seat,
    policyVersion: worker.POLICY_VERSION, config: {}
  }).decide(request);
}

for (const seat of [0, 1]) {
  test('rank3 root prefers immediately payable Articuno against three-Energy attacker, seat ' + seat, () => {
    const req = state(seat);
    const decision = decide(req);
    assert.deepEqual(decision, { kind: 'select-action', token: 'articuno' });
    const tokens = new Set(req.actionFrontier.items.map(item => item.token));
    protocol.validateDecision(decision, null, tokens);
  });

  test('rank3 declines speculative Articuno when lock/payability is absent, seat ' + seat, () => {
    const failures = [
      { active: 'Snorlax PGO 55' },
      { active: 'Wobbuffet PHF 36' },
      { water: false },
      { opponentEnergy: 1 },
      { gxUsed: true },
      { opponentActive: 'Iron Thorns ex TEF 77' },
      { opponentActive: 'Wobbuffet PHF 36' },
      { stadium: 'Path to the Peak CRE 148' }
    ];
    for (const change of failures) {
      const req = state(seat, change);
      const decision = decide(req);
      assert.deepEqual(decision, { kind: 'select-action', token: 'mill' },
        'overriding candidate trigger: ' + JSON.stringify(change));
      const tokens = new Set(req.actionFrontier.items.map(item => item.token));
      protocol.validateDecision(decision, null, tokens);
    }
  });
}
