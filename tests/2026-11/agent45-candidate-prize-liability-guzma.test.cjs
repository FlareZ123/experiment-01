'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { POLICY_VERSION, createPolicy } =
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');

const psychic = 'Psychic Energy SVI 5';
const vmax = {
  hp: 320, damage: 0, printing: 'Shadow Rider Calyrex VMAX CRE 75',
  printed: { types: ['Psychic'], subtypes: ['VMAX'], weakness: [], resistance: [] },
  energies: Array(5).fill(psychic),
  attacks: [{ name: 'Max Geist', damage: '10', cost: ['Psychic', 'Psychic', 'Colorless'] }],
  abilities: []
};

function pokemon(printing, hp, damage, subtypes, rules = []) {
  return {
    hp, damage, printing, printed: { types: ['Darkness'], subtypes, rules, weakness: [], resistance: [] },
    energies: [], attacks: [], abilities: []
  };
}

function request(seat, targets, prizes = 3) {
  return {
    role: 'candidate', seat,
    observation: {
      actorSeat: seat, decisionKind: 'owner-prompt',
      ownPublic: {
        active: vmax,
        bench: [{ ...vmax, energies: Array(4).fill(psychic) }],
        stadium: [], prizeCount: prizes,
        publicTurnRestrictions: { gxUsed: false, stadiumAndToolHaveNoEffectTurnsRemaining: 0 }
      },
      opponentPublic: {
        active: pokemon('Snorlax PGO 55', 150, 0, ['Basic']),
        bench: targets, stadium: [],
        publicTurnRestrictions: { stadiumAndToolHaveNoEffectTurnsRemaining: 0 }
      },
      ownHand: []
    },
    prompt: {
      actingSeat: seat, promptType: 'ChoosePokemonPrompt',
      source: { classification: 'actor-choice', sourceKind: 'card-effect', effectName: 'Guzma' },
      publicMetadata: { selectionType: 'pokemon', minimumCount: 1, maximumCount: 1 },
      choices: targets.map((target, index) => ({
        token: 'target-' + index,
        label: 'Opponent bench ' + (index + 1) + ': ' + target.printing,
        printing: target.printing,
        publicMetadata: { isOwnerVisible: true, ownerSeat: 'opponent', targetZone: 'bench' }
      }))
    }
  };
}

function decision(seat, targets, prizes) {
  const policy = createPolicy({ role: 'candidate', seat, policyVersion: POLICY_VERSION, config: {} });
  return policy.decideWithAudit(request(seat, targets, prizes));
}

test('Guzma selects the final-three-Prize Mega Absol ex over weaker Dedenne-GX, both seats', () => {
  const targets = [
    pokemon('Mega Absol ex MEG 86', 280, 0, ['Basic', 'MEGA', 'ex']),
    pokemon('Dedenne-GX UNB 57', 160, 100, ['Basic', 'GX'])
  ];
  for (const seat of [0, 1]) {
    const out = decision(seat, targets, 3);
    assert.deepEqual(out.decision, { kind: 'select-choices', tokens: ['target-0'] });
    const [mega, dedenne] = out.policyAudit.evaluations;
    assert.equal(out.policyAudit.selectionRuleCode, 'POKEMON_TARGET_SCORE');
    assert.equal(mega.status, 'scored');
    assert.equal(dedenne.status, 'scored');
    assert.ok(mega.score > dedenne.score);
  }
});

test('Guzma takes an actual final Prize from Girafarig instead of no-Prize Doll, both seats', () => {
  const targets = [
    pokemon("Lillie's Poké Doll CEC 197", 30, 0, ['Item']),
    pokemon('Girafarig LOT 94', 90, 0, ['Basic'])
  ];
  for (const seat of [0, 1]) {
    const out = decision(seat, targets, 1);
    assert.deepEqual(out.decision, { kind: 'select-choices', tokens: ['target-1'] });
    assert.ok(out.policyAudit.evaluations[1].score > out.policyAudit.evaluations[0].score);
  }
});

test('same rank7 root decision also rejects no-Prize Robo Substitute', () => {
  const targets = [
    pokemon('Robo Substitute PHF 102', 30, 0, ['Item']),
    pokemon('Girafarig LOT 94', 90, 0, ['Basic'])
  ];
  for (const seat of [0, 1]) {
    assert.deepEqual(decision(seat, targets, 1).decision,
      { kind: 'select-choices', tokens: ['target-1'] });
  }
});

test('legacy XY MEGA + uppercase EX still awards two Prizes, not three', () => {
  const targets = [
    pokemon('M Charizard-EX FLF 13', 230, 0, ['MEGA', 'EX'],
      ['Pokémon-EX rule: When a Pokémon-EX is Knocked Out, your opponent takes 2 Prize cards.']),
    pokemon('Dedenne-GX UNB 57', 160, 100, ['Basic', 'GX'])
  ];
  for (const seat of [0, 1]) {
    assert.deepEqual(decision(seat, targets, 3).decision,
      { kind: 'select-choices', tokens: ['target-1'] });
  }
});

test('explicit printed Mega rule wins if subtype projection is incomplete', () => {
  const targets = [
    pokemon('Mega Absol ex MEG 86', 280, 0, ['Basic'],
      ['Mega Evolution ex Rule: When your Mega Evolution Pokémon ex is Knocked Out, your opponent takes 3 Prize cards.']),
    pokemon('Dedenne-GX UNB 57', 160, 100, ['Basic', 'GX'])
  ];
  for (const seat of [0, 1]) {
    assert.deepEqual(decision(seat, targets, 3).decision,
      { kind: 'select-choices', tokens: ['target-0'] });
  }
});

test('unverified no-Prize lookalike remains ordinary one-Prize in absence of a printed rule', () => {
  const targets = [
    pokemon("Lillie's Poké Doll UNKNOWN 999", 30, 0, ['Item']),
    pokemon('Girafarig LOT 94', 90, 0, ['Basic'])
  ];
  assert.deepEqual(decision(0, targets, 1).decision,
    { kind: 'select-choices', tokens: ['target-0'] });
});
