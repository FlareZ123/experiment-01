'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const candidate = require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');

const POLICY_VERSION = candidate.POLICY_VERSION;
const POLICY_SOURCE = fs.readFileSync(path.resolve(__dirname,
  '../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs'), 'utf8');

function publicRestrictions() {
  return {
    gxUsed: false, vstarUsed: false, attackLockTurnsRemaining: 0,
    attackMaxEnergy: null, attackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [], ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false, pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false, evolutionPlayLocked: false,
    itemPlayLocked: false, supporterPlayLocked: false,
    stadiumPlayLocked: false, toolPlayLocked: false,
    energyPlayLocked: false, specialEnergyPlayLocked: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: 0
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
  printing, name, hp = 200, types = ['Psychic'], subtypes = ['Basic'],
  energies = [], attacks = [], abilities = [], suppression = null,
  damage = 0, tools = [], weakness = []
}) {
  return {
    printing, name, hp, damage, lastPlayedOrEvolvedTurn: 0,
    printed: {
      stage: subtypes.includes('VMAX') ? 'VMAX' : 'BASIC',
      subtypes, types, retreatCost: [], weakness, resistance: []
    },
    specialConditions: [], publicRestrictions: pokemonRestrictions(),
    evolutionPrintings: [], energies, tools, attacks, abilities,
    abilityDetails: abilities.map(name => ({ name, powerType: 'ABILITY', text: null })),
    abilitySuppressions: abilities.map(abilityName => ({
      abilityName,
      suppressed: suppression,
      reasonCode: suppression === true ? 'TEST_SUPPRESSION' : null,
      sourcePrinting: suppression === true ? 'Path to the Peak CES' : null
    }))
  };
}

function publicPlayer({
  active = null, bench = [], stadium = [], discard = [],
  handCount = 0, deckCount = 30, prizeCount = 6
} = {}) {
  return {
    active,
    bench: [...bench, ...Array(Math.max(0, 5 - bench.length)).fill(null)],
    stadium, discard, lostZone: [], resolvingSupporter: [],
    publicHand: null, prizeSlots: [],
    publicTurnRestrictions: publicRestrictions(),
    handCount, deckCount, prizeCount
  };
}

function observation(seat, {
  active = null, bench = [], opponentActive = null, opponentBench = [],
  ownHand = [], ownDiscard = [], globalTurn = 3, ownStadium = [],
  opponentStadium = [], decisionKind = 'owner-root', promptType = null
} = {}) {
  return {
    actorSeat: seat, globalTurn, phase: 2, decisionKind,
    pendingPromptType: promptType, pendingOwnerDeckSearch: false,
    ownHand,
    ownPublic: publicPlayer({
      active, bench, stadium: ownStadium, discard: ownDiscard,
      handCount: ownHand.length
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
  receipt = null, requestId = 'agent46-test-1'
} = {}) {
  return {
    schema: protocol.REQUEST_SCHEMA, type: 'decision',
    requestId, sequence: 1, role: 'candidate', seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: view, prompt, publicEventReceipt: receipt,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: actions }
  };
}

function init(seat, role = 'candidate') {
  return {
    schema: protocol.INIT_SCHEMA, type: 'init', role, seat,
    policyVersion: POLICY_VERSION, bundleSha256: 'a'.repeat(64), config: {}
  };
}

function evaluate(req) {
  const initialized = init(req.seat);
  const validated = protocol.validateRequest(req, initialized, 1, new Set());
  const policy = candidate.createPolicy({
    role: 'candidate', seat: req.seat, policyVersion: POLICY_VERSION, config: {}
  });
  const decision = policy.decide(req);
  protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  return decision;
}

function cardPrompt(seat, view, {
  sourcePrinting = 'Mysterious Treasure FLI', effectName = 'Mysterious Treasure',
  sourceZone = 'deck', printings = [], minimumCount = 1, maximumCount = 1
} = {}) {
  const choices = printings.map((printing, index) => ({
    token: 'card-' + index, kind: 'card', printing, label: printing,
    publicMetadata: {
      selectionIndex: index, selectedCount: 1, sourceZone,
      ownerSeat: 'actor', isOwnerVisible: true
    }
  }));
  const prompt = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: seat,
    promptType: 'ChooseCardsPrompt', description: null,
    source: {
      classification: 'actor-choice', sourceKind: 'card-effect',
      sourcePrinting, effectName
    },
    choices,
    publicMetadata: {
      sourceZone, ownerSeat: 'actor', isOwnerVisible: true,
      minimumCount, maximumCount, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  };
  const requestView = {
    ...view, decisionKind: 'owner-prompt',
    pendingPromptType: 'ChooseCardsPrompt'
  };
  return request(seat, requestView, { prompt, actions: [] });
}

function pokemonPrompt(seat, view, choices) {
  const prompt = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: seat,
    promptType: 'ChoosePokemonPrompt', description: null,
    source: {
      classification: 'actor-choice', sourceKind: 'card-effect',
      sourcePrinting: 'Guzma BUS', effectName: 'Guzma'
    },
    choices: choices.map((row, index) => ({
      token: row.token, kind: 'pokemon', printing: row.printing,
      label: 'Your bench ' + (row.index + 1) + ': ' + row.printing,
      publicMetadata: {
        selectionIndex: index, selectedCount: 1, selectionType: 'pokemon',
        ownerSeat: 'actor', targetZone: 'bench', isOwnerVisible: true
      }
    })),
    publicMetadata: {
      minimumCount: 1, maximumCount: 1, allowCancel: false,
      isSecret: false, selectionType: 'pokemon', targetZone: 'bench'
    }
  };
  const requestView = {
    ...view, decisionKind: 'owner-prompt',
    pendingPromptType: 'ChoosePokemonPrompt'
  };
  return request(seat, requestView, { prompt, actions: [] });
}

test('candidate bundle is pure and rejects opponent-role or configurable initialization', () => {
  assert.throws(() => candidate.createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION, config: {}
  }), /AGENT46_POLICY_INIT_MISMATCH/);
  assert.throws(() => candidate.createPolicy({
    role: 'candidate', seat: 0, policyVersion: POLICY_VERSION, config: { seed: 1 }
  }), /AGENT46_POLICY_INIT_MISMATCH/);
  assert.doesNotMatch(POLICY_SOURCE, /\brequire\s*\(|\bprocess\.|\bMath\.random\b|\bfetch\s*\(/);
});

test('root attack evaluator chooses a proven Fairy Zone Max Geist KO over Filch', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE',
    name: 'Shadow Rider Calyrex VMAX', hp: 320,
    subtypes: ['VMAX'], energies: Array(5).fill('Psychic Energy SVE'),
    attacks: [
      attack('Max Geist', ['Colorless', 'Colorless', 'Colorless'], '10+', {
        text: 'This attack does 30 more damage for each Psychic Energy attached to all of your Pokémon.'
      }),
      attack('Filch', ['Psychic'], null, { text: 'Draw 2 cards.' })
    ],
    abilities: ['Underworld Door'], suppression: true
  });
  const clefairy = pokemon({
    printing: "Lillie's Clefairy ex JTG",
    name: "Lillie's Clefairy ex", hp: 190, subtypes: ['Basic', 'ex'],
    abilities: ['Fairy Zone'], suppression: false
  });
  const target = pokemon({
    printing: 'Regidrago VSTAR SIT', name: 'Regidrago VSTAR',
    hp: 280, types: ['Dragon'], subtypes: ['VSTAR']
  });
  const view = observation(0, {
    active: vmax, bench: [clefairy],
    opponentActive: target, ownHand: ['Psychic Energy SVE']
  });
  const req = request(0, view, {
    actions: [
      { token: 'max-geist', kind: 'attack', actorPrinting: vmax.printing,
        attackName: 'Max Geist', publicMetadata: { attackCostPayable: true } },
      { token: 'filch', kind: 'attack', actorPrinting: vmax.printing,
        attackName: 'Filch', publicMetadata: { attackCostPayable: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), { kind: 'select-action', token: 'max-geist' });
});

test('Guzma own-recipient prompt recomputes Rondo versus Max Geist and chooses lower Prize liability when both KO', () => {
  const clefairy = pokemon({
    printing: "Lillie's Clefairy ex JTG", name: "Lillie's Clefairy ex",
    hp: 190, subtypes: ['Basic', 'ex'],
    energies: ['Psychic Energy SVE', 'Psychic Energy SVE'],
    attacks: [attack('Full Moon Rondo', ['Psychic', 'Colorless'], '20+', {
      text: '20 more damage for each Benched Pokémon (both yours and your opponent\'s).'
    })],
    abilities: ['Fairy Zone'], suppression: false
  });
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE', name: 'Shadow Rider Calyrex VMAX',
    hp: 320, subtypes: ['VMAX'], energies: Array(5).fill('Psychic Energy SVE'),
    attacks: [attack('Max Geist', ['Colorless', 'Colorless', 'Colorless'], '10+')],
    abilities: ['Underworld Door'], suppression: true
  });
  const active = pokemon({
    printing: 'Mimikyu GRI', name: 'Mimikyu', hp: 70,
    attacks: [attack('Copycat', ['Psychic', 'Colorless'], null)]
  });
  const target = pokemon({
    printing: 'Raging Bolt ex TEF', name: 'Raging Bolt ex',
    hp: 240, types: ['Dragon'], subtypes: ['Basic', 'ex']
  });
  const filler = pokemon({
    printing: 'Shadow Rider Calyrex V CRE', name: 'Shadow Rider Calyrex V',
    hp: 210, energies: []
  });
  const view = observation(0, {
    active, bench: [clefairy, vmax, filler, filler],
    opponentActive: target,
    opponentBench: [filler, filler, filler, filler]
  });
  const req = pokemonPrompt(0, view, [
    { token: 'clefairy', index: 0, printing: clefairy.printing },
    { token: 'vmax', index: 1, printing: vmax.printing }
  ]);
  assert.deepEqual(evaluate(req), { kind: 'select-choices', tokens: ['clefairy'] });
});

test('unknown Fairy Zone suppression is not treated as a live Weakness modifier', () => {
  const clefairy = pokemon({
    printing: "Lillie's Clefairy ex JTG", name: "Lillie's Clefairy ex",
    hp: 190, subtypes: ['Basic', 'ex'],
    energies: ['Psychic Energy SVE', 'Psychic Energy SVE'],
    attacks: [attack('Full Moon Rondo', ['Psychic', 'Colorless'], '20+')],
    abilities: ['Fairy Zone'], suppression: null
  });
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE', name: 'Shadow Rider Calyrex VMAX',
    hp: 320, subtypes: ['VMAX'], energies: Array(5).fill('Psychic Energy SVE'),
    attacks: [attack('Max Geist', ['Colorless', 'Colorless', 'Colorless'], '10+')],
    abilities: ['Underworld Door'], suppression: true
  });
  const active = pokemon({
    printing: 'Mimikyu GRI', name: 'Mimikyu', hp: 70,
    attacks: [attack('Copycat', ['Psychic', 'Colorless'], null)]
  });
  const target = pokemon({
    printing: 'Raging Bolt ex TEF', name: 'Raging Bolt ex',
    hp: 220, types: ['Dragon'], subtypes: ['Basic', 'ex']
  });
  const filler = pokemon({
    printing: 'Shadow Rider Calyrex V CRE', name: 'Shadow Rider Calyrex V',
    hp: 210
  });
  const view = observation(1, {
    active, bench: [clefairy, vmax, filler, filler],
    opponentActive: target, opponentBench: [filler, filler, filler, filler]
  });
  const req = pokemonPrompt(1, view, [
    { token: 'clefairy', index: 0, printing: clefairy.printing },
    { token: 'vmax', index: 1, printing: vmax.printing }
  ]);
  assert.deepEqual(evaluate(req), { kind: 'select-choices', tokens: ['vmax'] });
});

test('Mysterious Treasure search chooses missing Mimikyu after Dialga is already in discard', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE',
    name: 'Shadow Rider Calyrex VMAX', hp: 320,
    subtypes: ['VMAX'], energies: Array(3).fill('Psychic Energy SVE'),
    attacks: [attack('Max Geist', ['Colorless', 'Colorless', 'Colorless'], '10+')]
  });
  const target = pokemon({
    printing: 'Regidrago VSTAR SIT', name: 'Regidrago VSTAR',
    hp: 280, types: ['Dragon'], subtypes: ['VSTAR']
  });
  const view = observation(0, {
    active: vmax, opponentActive: target,
    ownDiscard: ['Dialga-GX UPR'],
    ownHand: ['Shadow Rider Calyrex VMAX CRE']
  });
  const req = cardPrompt(0, view, {
    printings: ['Dialga-GX UPR', 'Mimikyu GRI', 'Psychic Energy SVE'],
    minimumCount: 1, maximumCount: 1
  });
  assert.deepEqual(evaluate(req), { kind: 'select-choices', tokens: ['card-1'] });
});

test('mandatory discard uses dead or excess resources before Regidrago core pieces', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE',
    name: 'Shadow Rider Calyrex VMAX', hp: 320,
    subtypes: ['VMAX'], energies: Array(5).fill('Psychic Energy SVE'),
    attacks: [attack('Max Geist', ['Colorless', 'Colorless', 'Colorless'], '10+')]
  });
  const mimikyu = pokemon({
    printing: 'Mimikyu GRI', name: 'Mimikyu', hp: 70,
    attacks: [attack('Copycat', ['Psychic', 'Colorless'], null)]
  });
  const target = pokemon({
    printing: 'Regidrago VSTAR SIT', name: 'Regidrago VSTAR',
    hp: 280, types: ['Dragon'], subtypes: ['VSTAR']
  });
  const view = observation(0, {
    active: vmax, bench: [mimikyu], opponentActive: target,
    ownHand: ['Battle VIP Pass FST', 'Psychic Energy SVE', 'Dialga-GX UPR', 'Mimikyu GRI'],
    globalTurn: 3
  });
  const req = cardPrompt(0, view, {
    sourcePrinting: 'Ultra Ball BRS', effectName: 'Ultra Ball',
    sourceZone: 'hand',
    printings: ['Battle VIP Pass FST', 'Psychic Energy SVE', 'Dialga-GX UPR', 'Mimikyu GRI'],
    minimumCount: 2, maximumCount: 2
  });
  assert.deepEqual(evaluate(req), { kind: 'select-choices', tokens: ['card-0', 'card-1'] });
});

test('energy-payment prompt relies on per-choice visibility, not absent prompt-level owner fields', () => {
  const active = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE', name: 'Shadow Rider Calyrex VMAX',
    hp: 320, subtypes: ['VMAX'], energies: ['Psychic Energy SVE'],
    attacks: [attack('Max Geist', ['Colorless', 'Colorless', 'Colorless'], '10+')]
  });
  const view = observation(0, { active });
  const prompt = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: 0,
    promptType: 'ChooseEnergyPrompt', description: null,
    source: {
      classification: 'actor-choice', sourceKind: 'card-effect',
      sourcePrinting: 'Energy Discarder XYZ', effectName: 'Energy Discarder'
    },
    choices: ['Psychic Energy SVE', 'Psychic Energy SVE'].map((printing, index) => ({
      token: 'energy-' + index, kind: 'energy', printing,
      publicMetadata: {
        selectionIndex: index, selectedCount: 1, sourceZone: 'active',
        ownerSeat: 'actor', isOwnerVisible: true, energyType: 'Psychic'
      }
    })),
    publicMetadata: {
      count: 2, energyCount: 2, energyType: 'Psychic',
      allowCancel: false, selectionType: 'energy-payment'
    }
  };
  const req = request(0, {
    ...view, decisionKind: 'owner-prompt', pendingPromptType: 'ChooseEnergyPrompt'
  }, { prompt, actions: [] });
  assert.deepEqual(evaluate(req), { kind: 'select-choices', tokens: ['energy-0'] });
});

test('unsupported multi-option prompt abstains rather than guessing', () => {
  const view = observation(0, {
    active: pokemon({
      printing: 'Mimikyu GRI', name: 'Mimikyu', hp: 70,
      attacks: [attack('Copycat', ['Psychic', 'Colorless'], null)]
    })
  });
  const prompt = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: 0,
    promptType: 'SelectOptionPrompt', description: null,
    source: {
      classification: 'actor-choice', sourceKind: 'card-effect',
      sourcePrinting: 'Unknown Trainer XYZ', effectName: 'Unknown Trainer'
    },
    choices: [
      { token: 'yes', kind: 'option', label: 'Yes' },
      { token: 'no', kind: 'option', label: 'No' }
    ],
    publicMetadata: { selectionType: 'option' }
  };
  const req = request(0, {
    ...view, decisionKind: 'owner-prompt', pendingPromptType: 'SelectOptionPrompt'
  }, { prompt, actions: [] });
  assert.deepEqual(evaluate(req), { kind: 'abstain', reasonCode: 'AMBIGUOUS_SIMPLE_PROMPT' });
});

test('the same actor-relative policy is deterministic for physical seat 1', () => {
  const active = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE', name: 'Shadow Rider Calyrex VMAX',
    hp: 320, subtypes: ['VMAX'], energies: Array(5).fill('Psychic Energy SVE'),
    attacks: [attack('Max Geist', ['Colorless', 'Colorless', 'Colorless'], '10+')]
  });
  const target = pokemon({
    printing: 'Regidrago VSTAR SIT', name: 'Regidrago VSTAR',
    hp: 280, types: ['Dragon'], subtypes: ['VSTAR']
  });
  const view = observation(1, { active, opponentActive: target });
  const req = request(1, view, {
    actions: [
      { token: 'attack-max', kind: 'attack', actorPrinting: active.printing,
        attackName: 'Max Geist', publicMetadata: { attackCostPayable: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  const first = evaluate(req);
  const second = evaluate(req);
  assert.deepEqual(first, second);
  assert.deepEqual(first, { kind: 'select-action', token: 'attack-max' });
});


function engineSetupRequest(seat, {
  promptType, description, choices, publicMetadata, phase = 1,
  sourceKind = 'engine', sourcePrinting = null, effectName = description,
  active = null, bench = []
}) {
  const view = {
    ...observation(seat, { active, bench }),
    phase,
    decisionKind: 'owner-prompt',
    pendingPromptType: promptType
  };
  const prompt = {
    schema: protocol.PROMPT_SCHEMA,
    actingSeat: seat,
    promptType,
    description,
    source: {
      classification: 'actor-choice',
      sourceKind,
      sourcePrinting,
      effectName
    },
    choices,
    publicMetadata
  };
  return request(seat, view, { prompt, actions: [] });
}

function setupBasicChoice(token, selectionIndex, printing) {
  return {
    token,
    kind: 'card',
    printing,
    label: printing,
    publicMetadata: {
      selectionIndex,
      selectedCount: 1,
      sourceZone: 'hand',
      ownerSeat: 'actor',
      isOwnerVisible: true
    }
  };
}

function startingPokemonMetadata(minimumCount, maximumCount) {
  return {
    sourceZone: 'hand',
    ownerSeat: 'actor',
    isOwnerVisible: true,
    minimumCount,
    maximumCount,
    allowCancel: false,
    isSecret: false,
    selectionType: 'card-combination'
  };
}

function drawOption(token, choiceIndex, drawCount) {
  return {
    token,
    kind: 'option',
    label: `Draw ${drawCount} card(s)`,
    publicMetadata: { choiceIndex }
  };
}

test('phase-one starting-Pokémon prompts select all legal Basics in native order for both seats', () => {
  for (const seat of [0, 1]) {
    const initial = engineSetupRequest(seat, {
      promptType: 'ChooseCardsPrompt',
      description: 'CHOOSE_STARTING_POKEMONS',
      choices: [
        setupBasicChoice('basic-0', 0, 'Shadow Rider Calyrex V CRE'),
        setupBasicChoice('basic-2', 2, 'Mimikyu GRI'),
        setupBasicChoice('basic-4', 4, 'Latias ex SSP')
      ],
      publicMetadata: startingPokemonMetadata(1, 6)
    });
    assert.deepEqual(evaluate(initial), {
      kind: 'select-choices',
      tokens: ['basic-0', 'basic-2', 'basic-4']
    });

    const optionalBench = engineSetupRequest(seat, {
      promptType: 'ChooseCardsPrompt',
      description: 'CHOOSE_STARTING_POKEMONS',
      choices: [
        setupBasicChoice('new-basic-1', 1, 'Lillie\'s Clefairy ex JTG'),
        setupBasicChoice('new-basic-3', 3, 'Mimikyu GRI'),
        setupBasicChoice('new-basic-5', 5, 'Latias ex SSP'),
        { token: 'empty', kind: 'empty-selection', label: 'Choose no items' }
      ],
      publicMetadata: startingPokemonMetadata(0, 2),
      active: pokemon({ printing: 'Active Basic', name: 'Active Basic' })
    });
    assert.deepEqual(evaluate(optionalBench), {
      kind: 'select-choices',
      tokens: ['new-basic-1', 'new-basic-3']
    });

    // The engine sets the repeated prompt's maximum to newBasics.length, not
    // to the five empty Bench slots. Its callback places only those that fit.
    const wideOptionalBench = engineSetupRequest(seat, {
      promptType: 'ChooseCardsPrompt',
      description: 'CHOOSE_STARTING_POKEMONS',
      choices: [
        setupBasicChoice('wide-0', 0, 'Basic 0'),
        setupBasicChoice('wide-1', 1, 'Basic 1'),
        setupBasicChoice('wide-2', 2, 'Basic 2'),
        setupBasicChoice('wide-3', 3, 'Basic 3'),
        setupBasicChoice('wide-4', 4, 'Basic 4'),
        setupBasicChoice('wide-5', 5, 'Basic 5'),
        setupBasicChoice('wide-6', 6, 'Basic 6'),
        { token: 'wide-empty', kind: 'empty-selection', label: 'Choose no items' }
      ],
      publicMetadata: startingPokemonMetadata(0, 12),
      active: pokemon({ printing: 'Active Basic', name: 'Active Basic' }),
      bench: [
        pokemon({ printing: 'Bench 1', name: 'Bench 1' }),
        pokemon({ printing: 'Bench 2', name: 'Bench 2' }),
        pokemon({ printing: 'Bench 3', name: 'Bench 3' })
      ]
    });
    assert.deepEqual(evaluate(wideOptionalBench), {
      kind: 'select-choices',
      tokens: ['wide-0', 'wide-1', 'wide-2', 'wide-3', 'wide-4', 'wide-5', 'wide-6']
    });

    const noOptionalBasics = engineSetupRequest(seat, {
      promptType: 'ChooseCardsPrompt',
      description: 'CHOOSE_STARTING_POKEMONS',
      choices: [
        { token: 'empty-only', kind: 'empty-selection', label: 'Choose no items' }
      ],
      publicMetadata: startingPokemonMetadata(0, 0),
      active: pokemon({ printing: 'Active Basic', name: 'Active Basic' })
    });
    assert.deepEqual(evaluate(noOptionalBasics), {
      kind: 'select-choice',
      token: 'empty-only'
    });

    const fullBench = engineSetupRequest(seat, {
      promptType: 'ChooseCardsPrompt',
      description: 'CHOOSE_STARTING_POKEMONS',
      choices: [
        setupBasicChoice('unplaceable-0', 0, 'New Basic A'),
        setupBasicChoice('unplaceable-1', 1, 'New Basic B'),
        { token: 'full-bench-empty', kind: 'empty-selection', label: 'Choose no items' }
      ],
      publicMetadata: startingPokemonMetadata(0, 2),
      active: pokemon({ printing: 'Active Basic', name: 'Active Basic' }),
      bench: [
        pokemon({ printing: 'Bench 1', name: 'Bench 1' }),
        pokemon({ printing: 'Bench 2', name: 'Bench 2' }),
        pokemon({ printing: 'Bench 3', name: 'Bench 3' }),
        pokemon({ printing: 'Bench 4', name: 'Bench 4' }),
        pokemon({ printing: 'Bench 5', name: 'Bench 5' })
      ]
    });
    assert.deepEqual(evaluate(fullBench), {
      kind: 'select-choices',
      tokens: ['unplaceable-0', 'unplaceable-1']
    });
  }
});

test('phase-one GO_FIRST prompt deterministically selects Yes for either physical seat', () => {
  for (const seat of [0, 1]) {
    const req = engineSetupRequest(seat, {
      promptType: 'ConfirmPrompt',
      description: 'GO_FIRST',
      choices: [
        { token: 'yes', kind: 'confirm', label: 'Yes' },
        { token: 'no', kind: 'confirm', label: 'No' }
      ],
      publicMetadata: { selectionType: 'confirm' }
    });
    assert.deepEqual(evaluate(req), { kind: 'select-choice', token: 'yes' });
  }
});

test('phase-one mulligan draw prompt maps descending labels through original choiceIndex for both seats', () => {
  const allDraws = Array.from({ length: 7 }, (_, choiceIndex) =>
    drawOption('draw-' + (6 - choiceIndex), choiceIndex, 6 - choiceIndex));

  for (const seat of [0, 1]) {
    const req = engineSetupRequest(seat, {
      promptType: 'SelectPrompt',
      description: 'WANT_TO_DRAW_CARDS',
      choices: [...allDraws],
      publicMetadata: {
        count: 7,
        allowCancel: false,
        selectionType: 'option'
      }
    });
    assert.deepEqual(evaluate(req), {
      kind: 'select-choice',
      token: 'draw-6'
    });

    // Disabled native values are omitted from the projected frontier, but
    // count and the surviving choiceIndex values remain tied to the original
    // descending native values array.
    const sparse = engineSetupRequest(seat, {
      promptType: 'SelectPrompt',
      description: 'WANT_TO_DRAW_CARDS',
      choices: [
        drawOption('draw-5', 1, 5),
        drawOption('draw-3', 3, 3),
        drawOption('draw-0', 6, 0)
      ],
      publicMetadata: {
        count: 7,
        allowCancel: false,
        selectionType: 'option'
      }
    });
    assert.deepEqual(evaluate(sparse), {
      kind: 'select-choice',
      token: 'draw-5'
    });

    // The native value list is not guaranteed to be a descending index map.
    // Labels are the actual draw counts; choiceIndex is only the opaque
    // original-result mapping and must never be used to infer the value.
    const nonMonotonic = engineSetupRequest(seat, {
      promptType: 'SelectPrompt',
      description: 'WANT_TO_DRAW_CARDS',
      choices: [
        drawOption('draw-1', 0, 1),
        drawOption('draw-6', 5, 6),
        drawOption('draw-3', 2, 3)
      ],
      publicMetadata: {
        count: 7,
        allowCancel: false,
        selectionType: 'option'
      }
    });
    assert.deepEqual(evaluate(nonMonotonic), {
      kind: 'select-choice',
      token: 'draw-6'
    });
  }
});

test('phase-one setup policy rejects wrong phases, source identities, labels, and cancel rows', () => {
  const startingChoices = [setupBasicChoice('basic', 0, 'Mimikyu GRI')];
  const startingMeta = startingPokemonMetadata(1, 1);
  const goFirstChoices = [
    { token: 'yes', kind: 'confirm', label: 'Yes' },
    { token: 'no', kind: 'confirm', label: 'No' }
  ];
  const drawChoices = [
    drawOption('draw-1', 0, 1),
    drawOption('draw-0', 1, 0)
  ];

  for (const seat of [0, 1]) {
    const phaseZero = [
      engineSetupRequest(seat, {
        promptType: 'ChooseCardsPrompt', description: 'CHOOSE_STARTING_POKEMONS',
        choices: startingChoices, publicMetadata: startingMeta, phase: 0
      }),
      engineSetupRequest(seat, {
        promptType: 'ConfirmPrompt', description: 'GO_FIRST',
        choices: goFirstChoices, publicMetadata: { selectionType: 'confirm' }, phase: 0
      }),
      engineSetupRequest(seat, {
        promptType: 'SelectPrompt', description: 'WANT_TO_DRAW_CARDS',
        choices: drawChoices,
        publicMetadata: { count: 2, allowCancel: false, selectionType: 'option' },
        phase: 0
      })
    ];
    for (const req of phaseZero) {
      assert.equal(evaluate(req).kind, 'abstain');
    }

    const wrongSource = engineSetupRequest(seat, {
      promptType: 'ConfirmPrompt', description: 'GO_FIRST',
      choices: goFirstChoices, publicMetadata: { selectionType: 'confirm' },
      sourceKind: 'card-effect',
      sourcePrinting: 'Unknown Trainer XYZ'
    });
    assert.equal(evaluate(wrongSource).kind, 'abstain');

    const wrongMessage = engineSetupRequest(seat, {
      promptType: 'ConfirmPrompt', description: 'GO_FIRST',
      choices: goFirstChoices, publicMetadata: { selectionType: 'confirm' },
      effectName: 'NOT_GO_FIRST'
    });
    assert.equal(evaluate(wrongMessage).kind, 'abstain');

    const badDrawLabel = engineSetupRequest(seat, {
      promptType: 'SelectPrompt', description: 'WANT_TO_DRAW_CARDS',
      choices: [
        drawOption('draw-1', 0, 0),
        drawOption('draw-0', 1, 0)
      ],
      publicMetadata: { count: 2, allowCancel: false, selectionType: 'option' }
    });
    assert.equal(evaluate(badDrawLabel).kind, 'abstain');

    const unexpectedCancel = engineSetupRequest(seat, {
      promptType: 'SelectPrompt', description: 'WANT_TO_DRAW_CARDS',
      choices: [
        ...drawChoices,
        { token: 'cancel', kind: 'cancel', label: 'Cancel selection' }
      ],
      publicMetadata: { count: 2, allowCancel: true, selectionType: 'option' }
    });
    assert.equal(evaluate(unexpectedCancel).kind, 'abstain');

    const badStartingCancel = engineSetupRequest(seat, {
      promptType: 'ChooseCardsPrompt', description: 'CHOOSE_STARTING_POKEMONS',
      choices: [
        ...startingChoices,
        { token: 'cancel', kind: 'cancel', label: 'Cancel selection' }
      ],
      publicMetadata: { ...startingMeta, allowCancel: true }
    });
    assert.equal(evaluate(badStartingCancel).kind, 'abstain');
  }
});

test('starting-Pokémon setup rejects non-native bounds and malformed choices', () => {
  for (const seat of [0, 1]) {
    const unsupportedMinimum = engineSetupRequest(seat, {
      promptType: 'ChooseCardsPrompt',
      description: 'CHOOSE_STARTING_POKEMONS',
      choices: [
        setupBasicChoice('basic-a', 0, 'Mimikyu GRI'),
        setupBasicChoice('basic-b', 1, 'Latias ex SSP')
      ],
      publicMetadata: startingPokemonMetadata(2, 2)
    });
    assert.equal(evaluate(unsupportedMinimum).kind, 'abstain');

    const unsupportedInitialMaximum = engineSetupRequest(seat, {
      promptType: 'ChooseCardsPrompt',
      description: 'CHOOSE_STARTING_POKEMONS',
      choices: [setupBasicChoice('basic', 0, 'Mimikyu GRI')],
      publicMetadata: startingPokemonMetadata(1, 7)
    });
    assert.equal(evaluate(unsupportedInitialMaximum).kind, 'abstain');

    const reordered = engineSetupRequest(seat, {
      promptType: 'ChooseCardsPrompt',
      description: 'CHOOSE_STARTING_POKEMONS',
      choices: [
        setupBasicChoice('later', 2, 'Latias ex SSP'),
        setupBasicChoice('earlier', 0, 'Mimikyu GRI')
      ],
      publicMetadata: startingPokemonMetadata(1, 2)
    });
    assert.equal(evaluate(reordered).kind, 'abstain');

    const wrongOwnerChoice = setupBasicChoice('opponent-card', 0, 'Mimikyu GRI');
    wrongOwnerChoice.publicMetadata.ownerSeat = 'opponent';
    const wrongOwner = engineSetupRequest(seat, {
      promptType: 'ChooseCardsPrompt',
      description: 'CHOOSE_STARTING_POKEMONS',
      choices: [wrongOwnerChoice],
      publicMetadata: startingPokemonMetadata(1, 1)
    });
    assert.equal(evaluate(wrongOwner).kind, 'abstain');
  }
});
