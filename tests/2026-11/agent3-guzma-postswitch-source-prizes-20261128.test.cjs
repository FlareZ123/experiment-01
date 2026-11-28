'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const policy = require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

// Source-printed opponent identities from Aichi and the old-vs-modern
// Mega distinction.  These test actual candidate worker and protocol choices,
// not native Store settlement or a competitive game.
const PSI = 'Psychic Energy MEE 13';
function mon(printing, hp, damage, subtypes = ['Basic'], attacks = [],
    energyCount = 0) {
  return {
    printing, hp, damage, energies: Array(energyCount).fill(PSI),
    tools: [], abilities: [], abilitySuppressions: [], attacks,
    printed: {
      stage: 'BASIC', subtypes, types: ['Psychic'],
      weakness: [], resistance: [], retreatCost: ['Colorless']
    }
  };
}
function side(active, bench = [], prizeCount = 3) {
  return {
    active, bench, prizeCount, stadium: [], discard: [], lostZone: [],
    resolvingSupporter: [], deckCount: 30, handCount: 1,
    publicTurnRestrictions: {
      gxUsed: false, vstarUsed: false,
      stadiumAndToolHaveNoEffectTurnsRemaining: 0
    }
  };
}
function request(seat, targets, prizeCount = 3) {
  // Guzma BUS 115 first gusts the opponent, THEN forces the active to switch.
  // This departing active can deal just 10, but Latias on our Bench can
  // deliver 200 after the switch.  Before the repair the scorer incorrectly
  // uses Shadow Mist as the predicted follow-up attack.
  const active = mon('Shadow Rider Calyrex V CRE 74', 210, 0,
    ['Basic', 'V'],
    [{ name: 'Shadow Mist', cost: ['Psychic'], damage: '10' }], 1);
  const benchAttacker = mon('Latias ex SSP 76', 210, 0,
    ['Basic', 'ex'],
    [{ name: 'Eon Blade',
       cost: ['Psychic', 'Psychic', 'Colorless'], damage: '200' }], 3);
  const choices = targets.map((slot, i) => ({
    token: 'target-' + i, kind: 'pokemon', printing: slot.printing,
    label: 'Opponent bench ' + (i + 1) + ': ' + slot.printing,
    publicMetadata: {
      ownerSeat: 'opponent', isOwnerVisible: true,
      targetZone: 'bench', selectionIndex: i + 1
    }
  }));
  return {
    role: 'candidate', seat, publicEventReceipt: null,
    observation: {
      actorSeat: seat, decisionKind: 'owner-prompt',
      ownHand: [], ownTurnResources: { supporterPlayedTurn: 1 },
      ownPublic: side(active, [benchAttacker], prizeCount),
      opponentPublic: side(
        mon('Mimikyu GRI 58', 70, 0), targets, 4)
    },
    prompt: {
      schema: protocol.PROMPT_SCHEMA, actingSeat: seat,
      promptType: 'ChoosePokemonPrompt', description: 'CHOOSE_POKEMON',
      source: {
        classification: 'actor-choice', sourceKind: 'card-effect',
        sourcePrinting: 'Guzma BUS 115', effectName: 'Guzma'
      },
      choices,
      publicMetadata: {
        selectionType: 'pokemon', minimumCount: 1, maximumCount: 1,
        allowCancel: false, isSecret: false
      }
    },
    actionFrontier: {
      schema: protocol.FRONTIER_SCHEMA, items: []
    }
  };
}
const iron = (remain) => mon('Iron Thorns ex TWM 77', 230, 230 - remain,
  ['Basic', 'ex']);
const mega = (remain) => mon('Mega Absol ex MEG 86', 280, 280 - remain,
  ['Basic', 'MEGA', 'ex']);
const latias = (remain) => mon('Latias ex SSP 76', 210, 210 - remain,
  ['Basic', 'ex']);
const drago = (remain) => mon('Regidrago VSTAR SIT 136', 280, 280 - remain,
  ['VSTAR']);
const mimikyu = (remain) => mon('Mimikyu GRI 58', 70, 70 - remain);
const oldMega = (remain) => mon('M Rayquaza-EX ROS 76', 220, 220 - remain,
  ['MEGA', 'EX']);
const cases = [
  ['Guzma uses post-switch Bench Latias rather than departing active',
   [iron(10), mega(150)], 'target-1', 3],
  ['modern Mega Evolution ex three Prizes beats other ex two',
   [latias(50), mega(50)], 'target-1', 4],
  ['VSTAR two Prizes beats a single-Prize target',
   [mimikyu(50), drago(50)], 'target-1', 4],
  ['old M Pokémon-EX is only two Prizes: tie goes to earlier VSTAR',
   [drago(50), oldMega(50)], 'target-0', 4]
];
for (const seat of [0, 1]) for (const [label, targets, expected, prizeCount] of cases) {
  test(label + ' seat ' + seat, () => {
    const input = request(seat, targets, prizeCount);
    protocol.validatePrompt(input.prompt, seat);
    const got = policy.createPolicy({
      role: 'candidate', seat, policyVersion: policy.POLICY_VERSION,
      config: {}
    }).decideWithAudit(input);
    assert.deepEqual(got.decision,
      { kind: 'select-choices', tokens: [expected] });
    protocol.validateDecision(got.decision, input.prompt,
      new Set(input.actionFrontier.items.map(row => row.token)));
    protocol.validatePolicyAudit(
      got.policyAudit, input, got.decision, policy.POLICY_VERSION);
    assert.deepEqual(got.policyAudit.selectedTokens, [expected]);
  });
}
