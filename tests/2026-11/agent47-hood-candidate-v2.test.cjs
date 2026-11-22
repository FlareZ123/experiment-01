'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const candidate = require('../../simulation/evaluation/2026-11/agent47-hood-candidate-v2.cjs');

const POLICY_VERSION = candidate.POLICY_VERSION;
const POLICY_CONFIG = Object.freeze({
  paperAstralBarrageTargets: 'agent4-cre74-hook-v1'
});
const POLICY_SOURCE = fs.readFileSync(path.resolve(__dirname,
  '../../simulation/evaluation/2026-11/agent47-hood-candidate-v2.cjs'), 'utf8');

function publicRestrictions(overrides = {}) {
  return {
    gxUsed: false, vstarUsed: false, attackLockTurnsRemaining: 0,
    attackMaxEnergy: null, attackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [], ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false, pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false, evolutionPlayLocked: false,
    itemPlayLocked: false, supporterPlayLocked: false,
    stadiumPlayLocked: false, toolPlayLocked: false,
    energyPlayLocked: false, specialEnergyPlayLocked: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: 0,
    ...overrides
  };
}

function pokemonRestrictions() {
  return {
    cannotAttackNextTurn: false, cannotUseAttacksNextTurn: [],
    blockedAttackNameNextTurn: null, blockedAttackNameUntilLeavesActive: null,
    onlyAllowedAttackNameNextTurn: null, attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0, cannotRetreat: false,
    cannotRetreatNextTurn: false, cannotRetreatWhileActive: false,
    cannotEvolveNextTurn: false
  };
}

function attack(name, cost, damage, extra = {}) {
  return {
    name, cost, damage, damageCalculation: null, text: null,
    gxAttack: false, barrage: false, ...extra
  };
}

function pokemon({
  printing, name = printing, hp = 200, types = ['Psychic'],
  subtypes = ['Basic'], energies = [], attacks = [], abilities = [],
  suppression = null, damage = 0, tools = [], weakness = []
}) {
  return {
    printing, name, hp, damage, lastPlayedOrEvolvedTurn: 0,
    printed: {
      stage: subtypes.includes('VMAX') ? 'VMAX' : 'BASIC',
      subtypes, types, retreatCost: [], weakness, resistance: []
    },
    specialConditions: [], publicRestrictions: pokemonRestrictions(),
    evolutionPrintings: [], energies, tools, attacks, abilities,
    abilityDetails: abilities.map(name => ({
      name, powerType: 'ABILITY', text: null
    })),
    abilitySuppressions: abilities.map(abilityName => ({
      abilityName, suppressed: suppression,
      reasonCode: suppression === true ? 'TEST_SUPPRESSION' : null,
      sourcePrinting: suppression === true ? 'Path to the Peak CES' : null
    }))
  };
}

function publicPlayer({
  active = null, bench = [], stadium = [], discard = [],
  handCount = 0, deckCount = 30, prizeCount = 6,
  restrictions = {}
} = {}) {
  return {
    active,
    bench: [...bench, ...Array(Math.max(0, 5 - bench.length)).fill(null)],
    stadium, discard, lostZone: [], resolvingSupporter: [],
    publicHand: null, prizeSlots: [],
    publicTurnRestrictions: publicRestrictions(restrictions),
    handCount, deckCount, prizeCount
  };
}

function observation(seat, {
  active = null, bench = [], opponentActive = null, opponentBench = [],
  ownHand = [], ownDiscard = [], ownStadium = [], ownRestrictions = {},
  opponentStadium = [], globalTurn = 3, decisionKind = 'owner-root'
} = {}) {
  return {
    actorSeat: seat, globalTurn, phase: 2, decisionKind,
    pendingPromptType: decisionKind === 'owner-prompt'
      ? 'ChoosePokemonPrompt' : null,
    pendingOwnerDeckSearch: false, ownHand,
    ownPublic: publicPlayer({
      active, bench, stadium: ownStadium, discard: ownDiscard,
      handCount: ownHand.length, restrictions: ownRestrictions
    }),
    opponentPublic: publicPlayer({
      active: opponentActive, bench: opponentBench,
      stadium: opponentStadium, handCount: 5
    }),
    ownTurnResources: {
      supporterPlayedTurn: 0, retreatedTurn: 0, extraTurnActive: false,
      energyPlayedTurn: false, stadiumPlayedTurn: false, stadiumUsedTurn: false,
      vstarUsed: false, pokemonPlayLocked: false, abilityPokemonPlayLocked: false,
      evolutionPlayLocked: false, itemPlayLocked: false, supporterPlayLocked: false,
      stadiumPlayLocked: false, toolPlayLocked: false, energyPlayLocked: false,
      specialEnergyPlayLocked: false
    },
    ownerK1: null
  };
}

function request(seat, view, {
  prompt = null, actions = [{ token: 'pass', kind: 'pass' }],
  receipt = null, requestId = 'agent47-v2-test-' + seat
} = {}) {
  return {
    schema: protocol.REQUEST_SCHEMA, type: 'decision',
    requestId, sequence: 1, role: 'candidate', seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: view, prompt, publicEventReceipt: receipt,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: actions }
  };
}

function init(seat, config = POLICY_CONFIG) {
  return {
    schema: protocol.INIT_SCHEMA, type: 'init', role: 'candidate', seat,
    policyVersion: POLICY_VERSION, bundleSha256: 'a'.repeat(64), config
  };
}

function evaluate(req) {
  const initialized = init(req.seat);
  const validated = protocol.validateRequest(req, initialized, 1, new Set());
  const policy = candidate.createPolicy({
    role: 'candidate', seat: req.seat, policyVersion: POLICY_VERSION,
    config: POLICY_CONFIG
  });
  const decision = policy.decide(req);
  protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  return decision;
}

function decideRaw(req) {
  return candidate.createPolicy({
    role: 'candidate', seat: req.seat, policyVersion: POLICY_VERSION,
    config: POLICY_CONFIG
  }).decide(req);
}

function pokemonChoice(token, printing, zone, selectionIndex, benchIndex = 0,
  ownerSeat = 'opponent', isOwnerVisible = true) {
  return {
    token, kind: 'pokemon', printing,
    label: zone === 'active'
      ? 'Opponent active: ' + printing
      : 'Opponent bench ' + (benchIndex + 1) + ': ' + printing,
    publicMetadata: {
      selectionIndex, selectedCount: 1, selectionType: 'pokemon',
      ownerSeat, targetZone: zone, isOwnerVisible
    }
  };
}

function astralPromptRequest(seat, view, choices, {
  minimumCount = 2, maximumCount = 2,
  sourcePrinting = 'Shadow Rider Calyrex V CRE'
} = {}) {
  view.decisionKind = 'owner-prompt';
  view.pendingPromptType = 'ChoosePokemonPrompt';
  const prompt = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: seat,
    promptType: 'ChoosePokemonPrompt', description: null,
    source: {
      classification: 'actor-choice', sourceKind: 'card-effect',
      sourcePrinting, effectName: 'Astral Barrage'
    },
    choices,
    publicMetadata: {
      minimumCount, maximumCount, allowCancel: false, isSecret: false,
      selectionType: 'pokemon', targetZone: 'bench,active'
    }
  };
  return request(seat, view, { prompt, actions: [] });
}

function barrageAttacker(energyCount = 2) {
  return pokemon({
    printing: 'Shadow Rider Calyrex V CRE', hp: 210,
    energies: Array(energyCount).fill('Psychic Energy SVE'),
    attacks: [attack('Astral Barrage',
      ['Colorless', 'Colorless', 'Colorless'], null)]
  });
}

test('v2 is a pure worker and requires the matching paper-target hook capability', () => {
  assert.equal(POLICY_VERSION, 'agent47-hood-candidate-v2');
  assert.throws(() => candidate.createPolicy({
    role: 'candidate', seat: 0, policyVersion: POLICY_VERSION, config: {}
  }), /AGENT47_POLICY_INIT_MISMATCH/);
  assert.throws(() => candidate.createPolicy({
    role: 'candidate', seat: 0, policyVersion: POLICY_VERSION,
    config: { paperAstralBarrageTargets: 'wrong-hook' }
  }), /AGENT47_POLICY_INIT_MISMATCH/);
  assert.doesNotMatch(POLICY_SOURCE,
    /\brequire\s*\(|\bprocess\.|\bMath\.random\b|\bfetch\s*\(/);
});

test('root chooses the three-Colorless Astral Barrage with two Energy under Dimension Valley when two Prizes are available', () => {
  const attacker = barrageAttacker(2);
  const active = pokemon({
    printing: 'Raging Bolt ex TEF', hp: 60, types: ['Dragon'],
    subtypes: ['Basic', 'ex'],
    weakness: [{ type: 'Psychic', value: '×2' }]
  });
  const budew = pokemon({ printing: 'Budew ASC', hp: 50, types: ['Grass'] });
  const exeggcute = pokemon({ printing: 'Exeggcute PLF', hp: 30, types: ['Grass'] });
  const view = observation(0, {
    active: attacker, opponentActive: active,
    opponentBench: [budew, exeggcute],
    ownStadium: ['Dimension Valley XY4']
  });
  const req = request(0, view, {
    actions: [
      { token: 'barrage', kind: 'attack', actorPrinting: attacker.printing,
        attackName: 'Astral Barrage', publicMetadata: { attackCostPayable: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), { kind: 'select-action', token: 'barrage' });
});

test('root does not select the two-Energy Barrage without a live Dimension Valley cost reduction', () => {
  const attacker = barrageAttacker(2);
  const target = pokemon({ printing: 'Budew ASC', hp: 30, types: ['Grass'] });
  const bench = pokemon({ printing: 'Exeggcute PLF', hp: 30, types: ['Grass'] });
  const actions = [
    { token: 'barrage', kind: 'attack', actorPrinting: attacker.printing,
      attackName: 'Astral Barrage', publicMetadata: { attackCostPayable: true } },
    { token: 'pass', kind: 'pass' }
  ];
  const noStadium = observation(0, {
    active: attacker, opponentActive: target, opponentBench: [bench]
  });
  assert.deepEqual(evaluate(request(0, noStadium, { actions })),
    { kind: 'select-action', token: 'pass' });

  const suppressed = observation(0, {
    active: attacker, opponentActive: target, opponentBench: [bench],
    ownStadium: ['Dimension Valley XY4'],
    ownRestrictions: { stadiumAndToolHaveNoEffectTurnsRemaining: 1 }
  });
  assert.deepEqual(evaluate(request(0, suppressed, { actions })),
    { kind: 'select-action', token: 'pass' });
});

test('root fails closed when the opponent has no selectable Pokémon', () => {
  const attacker = barrageAttacker(3);
  const view = observation(0, { active: attacker });
  const req = request(0, view, {
    actions: [
      { token: 'barrage', kind: 'attack', actorPrinting: attacker.printing,
        attackName: 'Astral Barrage', publicMetadata: { attackCostPayable: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), { kind: 'select-action', token: 'pass' });
});

test('counter-placement target selection chooses two actual KOs and does not apply Psychic Weakness', () => {
  const attacker = barrageAttacker(3);
  const active = pokemon({
    printing: 'Raging Bolt ex TEF', hp: 60, types: ['Dragon'],
    subtypes: ['Basic', 'ex'],
    weakness: [{ type: 'Psychic', value: '×2' }]
  });
  const budew = pokemon({ printing: 'Budew ASC', hp: 50, types: ['Grass'] });
  const exeggcute = pokemon({ printing: 'Exeggcute PLF', hp: 30, types: ['Grass'] });
  const view = observation(0, {
    active: attacker, opponentActive: active, opponentBench: [budew, exeggcute]
  });
  const choices = [
    pokemonChoice('active', active.printing, 'active', 0),
    pokemonChoice('bench1', budew.printing, 'bench', 1, 0),
    pokemonChoice('bench2', exeggcute.printing, 'bench', 2, 1)
  ];
  assert.deepEqual(evaluate(astralPromptRequest(0, view, choices)),
    { kind: 'select-choices', tokens: ['bench1', 'bench2'] });
});

test('Astral Barrage target selection works for both physical seats', () => {
  const attacker = barrageAttacker(3);
  const active = pokemon({ printing: 'Budew ASC', hp: 30, types: ['Grass'] });
  const bench = pokemon({ printing: 'Exeggcute PLF', hp: 30, types: ['Grass'] });
  for (const seat of [0, 1]) {
    const view = observation(seat, {
      active: attacker, opponentActive: active, opponentBench: [bench]
    });
    const choices = [
      pokemonChoice('active', active.printing, 'active', 0),
      pokemonChoice('bench1', bench.printing, 'bench', 1, 0)
    ];
    assert.deepEqual(evaluate(astralPromptRequest(seat, view, choices)),
      { kind: 'select-choices', tokens: ['active', 'bench1'] });
  }
});

test('one available opponent Pokémon is selected under the D-04 fewer-target rule', () => {
  const attacker = barrageAttacker(3);
  const active = pokemon({ printing: 'Budew ASC', hp: 30, types: ['Grass'] });
  const view = observation(0, {
    active: attacker, opponentActive: active
  });
  const choices = [pokemonChoice('active', active.printing, 'active', 0)];
  assert.deepEqual(evaluate(astralPromptRequest(0, view, choices, {
    minimumCount: 1, maximumCount: 1
  })), { kind: 'select-choices', tokens: ['active'] });
});

test('Barrage prompt bounds, source, visibility, printing, and target identity fail closed', () => {
  const attacker = barrageAttacker(3);
  const active = pokemon({ printing: 'Budew ASC', hp: 30, types: ['Grass'] });
  const bench = pokemon({ printing: 'Exeggcute PLF', hp: 30, types: ['Grass'] });
  const view = observation(0, {
    active: attacker, opponentActive: active, opponentBench: [bench]
  });
  const choices = [
    pokemonChoice('active', active.printing, 'active', 0),
    pokemonChoice('bench1', bench.printing, 'bench', 1, 0)
  ];
  const base = astralPromptRequest(0, view, choices);

  const badBounds = {
    ...base, prompt: {
      ...base.prompt,
      publicMetadata: { ...base.prompt.publicMetadata, minimumCount: 1, maximumCount: 2 }
    }
  };
  assert.equal(decideRaw(badBounds).reasonCode,
    'ASTRAL_BARRAGE_PROMPT_BOUNDS_MISMATCH');

  const hidden = {
    ...base, prompt: {
      ...base.prompt,
      choices: choices.map((choice, index) => index === 1 ? {
        ...choice, publicMetadata: { ...choice.publicMetadata, isOwnerVisible: false }
      } : choice)
    }
  };
  assert.equal(decideRaw(hidden).reasonCode,
    'ASTRAL_BARRAGE_INCOMPLETE_TARGET_VISIBILITY');

  const wrongSource = {
    ...base, prompt: {
      ...base.prompt,
      source: { ...base.prompt.source, sourcePrinting: 'Guzma BUS' }
    }
  };
  assert.equal(decideRaw(wrongSource).reasonCode, 'ASTRAL_BARRAGE_SOURCE_MISMATCH');

  const wrongPrinting = {
    ...base, prompt: {
      ...base.prompt,
      choices: choices.map((choice, index) => index === 0 ? {
        ...choice, printing: 'Mismatched card identity'
      } : choice)
    }
  };
  assert.equal(decideRaw(wrongPrinting).reasonCode,
    'ASTRAL_BARRAGE_INCOMPLETE_TARGET_VISIBILITY');

  const duplicateIdentity = {
    ...base, prompt: {
      ...base.prompt,
      choices: [
        choices[0],
        { ...choices[0], token: 'active-duplicate',
          publicMetadata: { ...choices[0].publicMetadata, selectionIndex: 1 } }
      ]
    }
  };
  assert.equal(decideRaw(duplicateIdentity).reasonCode,
    'ASTRAL_BARRAGE_DUPLICATE_TARGET_IDENTITY');
});
