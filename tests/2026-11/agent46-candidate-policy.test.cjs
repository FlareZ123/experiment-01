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
  opponentStadium = [], opponentHandCount = 5,
  decisionKind = 'owner-root', promptType = null
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
      stadium: opponentStadium, handCount: opponentHandCount
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
  sourceZone = 'deck', printings = [], minimumCount = 1, maximumCount = 1,
  receipt = null
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
  return request(seat, requestView, { prompt, actions: [], receipt });
}

function pokemonPrompt(seat, view, choices, effectName = 'Guzma') {
  const prompt = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: seat,
    promptType: 'ChoosePokemonPrompt', description: null,
    source: {
      classification: 'actor-choice', sourceKind: 'card-effect',
      sourcePrinting: effectName === 'Acerola' ? 'Acerola PRC 112' : 'Guzma BUS',
      effectName
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

function priorKoReceipt(view) {
  const project = slot => slot === null ? null : ({
    printing: slot.printing,
    movedFromBenchToActiveThisTurn: null,
    knownAbilityUse: []
  });
  return {
    version: 'agent8-public-event-receipt-v3-turn-stamped',
    actorSeat: view.actorSeat,
    turn: view.globalTurn,
    ownerActive: project(view.ownPublic.active),
    ownerBench: view.ownPublic.bench.map(project),
    priorOpponentTurnKO: { any: true, byAttack: true },
    opponentLastTurnAttack: null,
    opponentLastTurnTurn: null,
    opponentLastTurnAttacks: null
  };
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

test('Quick Ball hand-cost prompt selects a candidate-present expendable card with bound source provenance', () => {
  const regidrago = pokemon({
    printing: 'Regidrago VSTAR SIT', name: 'Regidrago VSTAR',
    hp: 280, types: ['Dragon'], subtypes: ['VSTAR']
  });
  const candidateHand = [
    'Mysterious Treasure FLI 113',
    'Mysterious Treasure FLI 113',
    'Psychic Energy MEE 13',
    'Dialga-GX UPR 100',
    'Mimikyu GRI 58'
  ];
  const view = observation(0, {
    opponentActive: regidrago,
    ownHand: candidateHand,
    globalTurn: 3
  });
  const req = cardPrompt(0, view, {
    sourcePrinting: 'Quick Ball FST 237', effectName: 'Quick Ball',
    sourceZone: 'hand',
    printings: candidateHand,
    minimumCount: 1, maximumCount: 1
  });
  assert.equal(req.prompt.source.sourcePrinting, 'Quick Ball FST 237');
  assert.equal(req.prompt.source.effectName, 'Quick Ball');
  assert.equal(req.prompt.source.classification, 'actor-choice');
  assert.equal(req.prompt.source.sourceKind, 'card-effect');
  assert.equal(req.prompt.publicMetadata.sourceZone, 'hand');
  assert.equal(req.observation.opponentPublic.publicHand, null);
  assert.equal(Object.hasOwn(req.observation, 'opponentHand'), false);
  assert.deepEqual(req.prompt.choices.map(choice => choice.printing), candidateHand);
  assert.ok(req.prompt.choices.every(choice =>
    choice.publicMetadata.ownerSeat === 'actor' && choice.publicMetadata.isOwnerVisible === true));
  assert.deepEqual(evaluate(req), { kind: 'select-choices', tokens: ['card-0'] },
    'one duplicate Mysterious Treasure is preferred to Psychic Energy and the Regidrago core pieces');
});

test('Quick Ball deck-search prompt selects a needed candidate Basic from actor-visible deck choices', () => {
  const regidrago = pokemon({
    printing: 'Regidrago VSTAR SIT', name: 'Regidrago VSTAR',
    hp: 280, types: ['Dragon'], subtypes: ['VSTAR']
  });
  const candidateBasics = [
    'Dialga-GX UPR 100',
    'Mimikyu GRI 58',
    'Shadow Rider Calyrex V CRE 74'
  ];
  const view = observation(0, { opponentActive: regidrago, ownHand: [] });
  const req = cardPrompt(0, view, {
    sourcePrinting: 'Quick Ball FST 237', effectName: 'Quick Ball',
    sourceZone: 'deck',
    printings: candidateBasics,
    minimumCount: 1, maximumCount: 1
  });
  assert.equal(req.prompt.source.sourcePrinting, 'Quick Ball FST 237');
  assert.equal(req.prompt.source.effectName, 'Quick Ball');
  assert.equal(req.prompt.publicMetadata.sourceZone, 'deck');
  assert.equal(req.observation.opponentPublic.publicHand, null);
  assert.deepEqual(req.prompt.choices.map(choice => choice.printing), candidateBasics);
  assert.ok(req.prompt.choices.every(choice =>
    choice.publicMetadata.ownerSeat === 'actor' && choice.publicMetadata.isOwnerVisible === true));
  assert.deepEqual(evaluate(req), { kind: 'select-choices', tokens: ['card-2'] },
    'Shadow Rider V is preferred to the candidate Dialga-GX and Mimikyu basics for this public board');
});


test('candidate decideWithAudit preserves root decisions and covers every native frontier token', () => {
  const req = request(0, observation(0), {
    actions: [
      { token: 'pass', kind: 'pass' },
      { token: 'unscored-stadium', kind: 'use-stadium' }
    ]
  });
  const policy = candidate.createPolicy({
    role: 'candidate', seat: 0, policyVersion: POLICY_VERSION, config: {}
  });
  const plain = policy.decide(req);
  const audited = policy.decideWithAudit(req);
  assert.deepEqual(audited.decision, plain);
  assert.equal(audited.policyAudit.schema, 'agent6-policy-audit-v1');
  assert.equal(audited.policyAudit.selectionRuleCode, 'ROOT_PASS_FALLBACK');
  assert.deepEqual(audited.policyAudit.selectedTokens, ['pass']);
  assert.deepEqual(audited.policyAudit.evaluations.map(row => row.token), ['pass', 'unscored-stadium']);
  assert.equal(audited.policyAudit.evaluations[0].status, 'rule-selected');
  assert.equal(audited.policyAudit.evaluations[0].score, null);
  assert.equal(audited.policyAudit.evaluations[0].reasonCode, 'PASS_FALLBACK');
  assert.equal(audited.policyAudit.evaluations[1].status, 'not-evaluated');
  protocol.validatePolicyAudit(audited.policyAudit, req, plain, POLICY_VERSION);
});

test('candidate decideWithAudit records actual prompt scores from the decision pass', () => {
  const req = cardPrompt(0, observation(0), {
    printings: ['Shadow Rider Calyrex V CRE', 'Psychic Energy SVE']
  });
  const policy = candidate.createPolicy({
    role: 'candidate', seat: 0, policyVersion: POLICY_VERSION, config: {}
  });
  const plain = policy.decide(req);
  const audited = policy.decideWithAudit(req);
  assert.deepEqual(audited.decision, plain);
  assert.deepEqual(plain, { kind: 'select-choices', tokens: ['card-0'] });
  assert.equal(audited.policyAudit.selectionRuleCode, 'CARD_COMBINATION_SEARCH_SCORE');
  assert.equal(audited.policyAudit.evaluations.length, 2);
  assert.equal(audited.policyAudit.evaluations[0].status, 'scored');
  assert.equal(audited.policyAudit.evaluations[0].score, 100);
  assert.equal(audited.policyAudit.evaluations[1].status, 'scored');
  assert.equal(audited.policyAudit.evaluations[1].score, 45);
  protocol.validatePolicyAudit(audited.policyAudit, req, plain, POLICY_VERSION);
});

test('candidate rule-selected setup choices carry no fabricated numeric score', () => {
  const req = engineSetupRequest(0, {
    promptType: 'ConfirmPrompt',
    description: 'GO_FIRST',
    choices: [
      { token: 'yes', kind: 'confirm', label: 'Yes' },
      { token: 'no', kind: 'confirm', label: 'No' }
    ],
    publicMetadata: { selectionType: 'confirm' }
  });
  const policy = candidate.createPolicy({
    role: 'candidate', seat: 0, policyVersion: POLICY_VERSION, config: {}
  });
  const audited = policy.decideWithAudit(req);
  assert.deepEqual(audited.decision, { kind: 'select-choice', token: 'yes' });
  const selected = audited.policyAudit.evaluations.find(row => row.token === 'yes');
  assert.equal(selected.status, 'rule-selected');
  assert.equal(selected.score, null);
  assert.equal(selected.reasonCode, 'SELECTED_BY_POLICY_RULE');
  protocol.validatePolicyAudit(audited.policyAudit, req, audited.decision, POLICY_VERSION);
});


function underworldAttachmentRequest(seat, view, targets) {
  const prompt = {
    schema: protocol.PROMPT_SCHEMA,
    actingSeat: seat,
    promptType: 'AttachEnergyPrompt',
    description: 'ATTACH_ENERGY_TO_BENCH',
    source: {
      classification: 'actor-choice',
      sourceKind: 'card-effect',
      sourcePrinting: 'Shadow Rider Calyrex VMAX CRE 75',
      effectName: 'Underworld Door'
    },
    choices: targets.map((target, index) => ({
      token: target.token,
      kind: 'energy',
      printing: 'Psychic Energy SVE 13',
      label: 'Attach Psychic Energy to Bench ' + (target.benchIndex + 1) +
        ': ' + target.printing,
      publicMetadata: {
        sourceZone: 'hand',
        ownerSeat: 'actor',
        isOwnerVisible: true,
        energyType: 'BASIC',
        zone: 'bench',
        benchIndex: target.benchIndex,
        choiceIndex: index,
        selectedCount: 1
      }
    })),
    publicMetadata: {
      selectionType: 'energy-attachment',
      count: targets.length,
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      sourceZone: 'hand',
      ownerSeat: 'actor',
      isOwnerVisible: true,
      energyType: 'BASIC',
      zone: 'bench'
    }
  };
  return request(seat, {
    ...view,
    decisionKind: 'owner-prompt',
    pendingPromptType: 'AttachEnergyPrompt'
  }, { prompt, actions: [] });
}

test('VMAX-only board still searches and benches a second unevolved Shadow Rider V', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX']
  });
  const view = observation(0, { active: vmax });
  const search = cardPrompt(0, view, {
    printings: [
      'Shadow Rider Calyrex V CRE 74',
      'Latias ex SSP 76',
      'Psychic Energy SVE 13'
    ]
  });
  assert.deepEqual(evaluate(search), {
    kind: 'select-choices',
    tokens: ['card-0']
  });

  const play = request(0, {
    ...view,
    ownHand: ['Shadow Rider Calyrex V CRE 74']
  }, {
    actions: [
      {
        token: 'play-second-v',
        kind: 'play-card',
        actorPrinting: 'Shadow Rider Calyrex V CRE 74',
        publicMetadata: { targetSeat: 'actor', targetZone: 'bench', isOwnerVisible: true }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(play), {
    kind: 'select-action',
    token: 'play-second-v'
  });
});

test('candidate searches a VMAX for an unevolved Basic V even when another VMAX is already in play', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX']
  });
  const basic = pokemon({
    printing: 'Shadow Rider Calyrex V CRE 74',
    name: 'Shadow Rider Calyrex V',
    hp: 210
  });
  const view = observation(0, { active: vmax, bench: [basic] });
  const search = cardPrompt(0, view, {
    printings: [
      'Shadow Rider Calyrex VMAX CRE 75',
      'Latias ex SSP 76',
      'Psychic Energy SVE 13'
    ]
  });
  assert.deepEqual(evaluate(search), {
    kind: 'select-choices',
    tokens: ['card-0']
  });
});

test('live Underworld Door is selected before a payable Max Geist attack', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX'],
    energies: Array(3).fill('Psychic Energy SVE 13'),
    attacks: [attack('Max Geist', ['Colorless', 'Colorless', 'Colorless'], '10+')],
    abilities: ['Underworld Door'],
    suppression: false
  });
  const mimikyu = pokemon({
    printing: 'Mimikyu GRI 58',
    name: 'Mimikyu',
    hp: 70,
    attacks: [attack('Copycat', ['Psychic', 'Colorless'], null)]
  });
  const regidrago = pokemon({
    printing: 'Regidrago VSTAR SIT 136',
    name: 'Regidrago VSTAR',
    hp: 280,
    types: ['Dragon'],
    subtypes: ['VSTAR']
  });
  const view = observation(0, {
    active: vmax,
    bench: [mimikyu],
    opponentActive: regidrago,
    ownHand: ['Psychic Energy SVE 13']
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'underworld',
        kind: 'use-ability',
        actorPrinting: vmax.printing,
        publicMetadata: {
          abilityName: 'Underworld Door',
          sourceZone: 'active',
          sourceSeat: 'actor',
          sourceIndex: 0
        }
      },
      {
        token: 'max-geist',
        kind: 'attack',
        actorPrinting: vmax.printing,
        attackName: 'Max Geist',
        publicMetadata: { attackCostPayable: true }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'underworld'
  });
});

test('Underworld Door is not selected when its source Ability is suppressed', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX'],
    energies: Array(3).fill('Psychic Energy SVE 13'),
    attacks: [attack('Max Geist', ['Colorless', 'Colorless', 'Colorless'], '10+')],
    abilities: ['Underworld Door'],
    suppression: true
  });
  const mimikyu = pokemon({
    printing: 'Mimikyu GRI 58',
    name: 'Mimikyu',
    hp: 70
  });
  const regidrago = pokemon({
    printing: 'Regidrago VSTAR SIT 136',
    name: 'Regidrago VSTAR',
    hp: 280,
    types: ['Dragon'],
    subtypes: ['VSTAR']
  });
  const view = observation(0, {
    active: vmax,
    bench: [mimikyu],
    opponentActive: regidrago,
    ownHand: ['Psychic Energy SVE 13']
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'underworld',
        kind: 'use-ability',
        actorPrinting: vmax.printing,
        publicMetadata: {
          abilityName: 'Underworld Door',
          sourceZone: 'active',
          sourceSeat: 'actor',
          sourceIndex: 0
        }
      },
      {
        token: 'max-geist',
        kind: 'attack',
        actorPrinting: vmax.printing,
        attackName: 'Max Geist',
        publicMetadata: { attackCostPayable: true }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'max-geist'
  });
});

test('Underworld Door prompt funds Mimikyu before Max Geist against Regidrago', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX'],
    energies: Array(3).fill('Psychic Energy SVE 13')
  });
  const mimikyu = pokemon({
    printing: 'Mimikyu GRI 58',
    name: 'Mimikyu',
    hp: 70
  });
  const benchVmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX']
  });
  const regidrago = pokemon({
    printing: 'Regidrago VSTAR SIT 136',
    name: 'Regidrago VSTAR',
    hp: 280,
    types: ['Dragon'],
    subtypes: ['VSTAR']
  });
  const view = observation(0, {
    active: vmax,
    bench: [mimikyu, benchVmax],
    opponentActive: regidrago,
    ownHand: ['Psychic Energy SVE 13']
  });
  const req = underworldAttachmentRequest(0, view, [
    { token: 'mimikyu-energy', benchIndex: 0, printing: mimikyu.printing },
    { token: 'vmax-energy', benchIndex: 1, printing: benchVmax.printing }
  ]);
  assert.deepEqual(evaluate(req), {
    kind: 'select-choice',
    token: 'mimikyu-energy'
  });
});


test('Climactic Gate selects up to two Shadow Rider VMAX from its owner-visible deck prompt', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX']
  });
  const view = observation(0, { active: vmax });
  const req = cardPrompt(0, view, {
    sourcePrinting: 'Radiant Eternatus PR-SW 134',
    effectName: 'Climactic Gate',
    printings: [
      'Shadow Rider Calyrex VMAX CRE 75',
      'Shadow Rider Calyrex VMAX CRE 75',
      'Psychic Energy SVE 13'
    ],
    minimumCount: 0,
    maximumCount: 2
  });
  req.prompt.choices.push({
    token: 'empty-selection',
    kind: 'empty-selection',
    label: 'Choose no cards'
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-choices',
    tokens: ['card-0', 'card-1']
  });
});

test('Radiant Eternatus Climactic Gate is a terminal play after non-ending setup and abilities', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX'],
    energies: ['Psychic Energy SVE 13'],
    abilities: ['Underworld Door'],
    suppression: false
  });
  const mimikyu = pokemon({
    printing: 'Mimikyu GRI 58',
    name: 'Mimikyu',
    hp: 70
  });
  const view = observation(0, {
    active: vmax,
    bench: [mimikyu],
    ownHand: ['Radiant Eternatus PR-SW 134', 'Psychic Energy SVE 13']
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'radiant',
        kind: 'play-card',
        actorPrinting: 'Radiant Eternatus PR-SW 134',
        publicMetadata: {
          targetSeat: 'actor',
          targetZone: 'bench',
          isOwnerVisible: true
        }
      },
      {
        token: 'underworld',
        kind: 'use-ability',
        actorPrinting: vmax.printing,
        publicMetadata: {
          abilityName: 'Underworld Door',
          sourceZone: 'active',
          sourceSeat: 'actor',
          sourceIndex: 0
        }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'underworld'
  });
});

test('Radiant Eternatus is deferred while a payable attack remains', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX'],
    energies: Array(3).fill('Psychic Energy SVE 13'),
    attacks: [attack('Max Geist', ['Colorless', 'Colorless', 'Colorless'], '10+')]
  });
  const regidrago = pokemon({
    printing: 'Regidrago VSTAR SIT 136',
    name: 'Regidrago VSTAR',
    hp: 280,
    types: ['Dragon'],
    subtypes: ['VSTAR']
  });
  const view = observation(0, {
    active: vmax,
    opponentActive: regidrago,
    ownHand: ['Radiant Eternatus PR-SW 134']
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'radiant',
        kind: 'play-card',
        actorPrinting: 'Radiant Eternatus PR-SW 134',
        publicMetadata: {
          targetSeat: 'actor',
          targetZone: 'bench',
          isOwnerVisible: true
        }
      },
      {
        token: 'max-geist',
        kind: 'attack',
        actorPrinting: vmax.printing,
        attackName: 'Max Geist',
        publicMetadata: { attackCostPayable: true }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'max-geist'
  });
});

test('Radiant Eternatus is selected only when the terminal Gate has Bench and deck capacity', () => {
  const view = observation(0, {
    ownHand: ['Radiant Eternatus PR-SW 134']
  });
  const available = request(0, view, {
    actions: [
      {
        token: 'radiant',
        kind: 'play-card',
        actorPrinting: 'Radiant Eternatus PR-SW 134',
        publicMetadata: {
          targetSeat: 'actor',
          targetZone: 'bench',
          isOwnerVisible: true
        }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(available), {
    kind: 'select-action',
    token: 'radiant'
  });

  const occupied = pokemon({
    printing: 'Mimikyu GRI 58',
    name: 'Mimikyu',
    hp: 70
  });
  const fullBench = observation(0, {
    bench: [occupied, occupied, occupied, occupied, occupied],
    ownHand: ['Radiant Eternatus PR-SW 134']
  });
  const blocked = request(0, fullBench, {
    actions: [
      {
        token: 'radiant',
        kind: 'play-card',
        actorPrinting: 'Radiant Eternatus PR-SW 134',
        publicMetadata: {
          targetSeat: 'actor',
          targetZone: 'bench',
          isOwnerVisible: true
        }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(blocked), {
    kind: 'select-action',
    token: 'pass'
  });
});


test('Tapu Lele-GX is benched for Wonder Tag when the Ability is live', () => {
  const active = pokemon({
    printing: 'Shadow Rider Calyrex V CRE 74',
    name: 'Shadow Rider Calyrex V',
    hp: 210
  });
  const view = observation(0, {
    active,
    ownHand: ['Tapu Lele-GX GRI 60']
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'tapu-lele',
        kind: 'play-card',
        actorPrinting: 'Tapu Lele-GX GRI 60',
        publicMetadata: {
          targetSeat: 'actor',
          targetZone: 'bench',
          isOwnerVisible: true
        }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'tapu-lele'
  });
});

test('Tapu Lele-GX is not played into Path to the Peak or Silent Lab Ability lock', () => {
  for (const stadium of ['Path to the Peak CES 148', 'Silent Lab FCO 95']) {
    const view = observation(0, {
      ownHand: ['Tapu Lele-GX GRI 60'],
      opponentStadium: [stadium]
    });
    const req = request(0, view, {
      actions: [
        {
          token: 'tapu-lele',
          kind: 'play-card',
          actorPrinting: 'Tapu Lele-GX GRI 60',
          publicMetadata: {
            targetSeat: 'actor',
            targetZone: 'bench',
            isOwnerVisible: true
          }
        },
        { token: 'pass', kind: 'pass' }
      ]
    });
    assert.deepEqual(evaluate(req), {
      kind: 'select-action',
      token: 'pass'
    });
  }
});

test('Wonder Tag selects Teammates after a validated opponent-turn Knock Out', () => {
  const view = observation(0, { active: null, bench: [] });
  const receipt = {
    version: 'agent8-public-event-receipt-v3-turn-stamped',
    actorSeat: 0,
    turn: view.globalTurn,
    ownerActive: null,
    ownerBench: Array(5).fill(null),
    priorOpponentTurnKO: { any: true, byAttack: true },
    opponentLastTurnAttack: null,
    opponentLastTurnTurn: null,
    opponentLastTurnAttacks: null
  };
  const req = cardPrompt(0, view, {
    sourcePrinting: 'Tapu Lele-GX GRI 60',
    effectName: 'Wonder Tag',
    printings: [
      'Teammates PRC 141',
      "Lillie's Determination MEG 119",
      'Guzma BUS 115'
    ],
    receipt
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-choices',
    tokens: ['card-0']
  });
});

test('Wonder Tag selects Guzma when the active attacker can Knock Out a benched target', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX'],
    energies: Array(3).fill('Psychic Energy CRE 232'),
    attacks: [attack('Max Geist', ['Colorless', 'Colorless', 'Colorless'], '300')]
  });
  const regidrago = pokemon({
    printing: 'Regidrago VSTAR SIT 136',
    name: 'Regidrago VSTAR',
    hp: 280,
    types: ['Dragon'],
    subtypes: ['VSTAR']
  });
  const target = pokemon({
    printing: 'Mimikyu GRI 58',
    name: 'Mimikyu',
    hp: 70
  });
  const view = observation(0, {
    active: vmax,
    opponentActive: regidrago,
    opponentBench: [target]
  });
  const req = cardPrompt(0, view, {
    sourcePrinting: 'Tapu Lele-GX GRI 60',
    effectName: 'Wonder Tag',
    printings: [
      'Guzma BUS 115',
      "Lillie's Determination MEG 119",
      'Teammates PRC 141'
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-choices',
    tokens: ['card-0']
  });
});

test('Wonder Tag selects Arven when the Shadow Rider Basic line is missing', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX']
  });
  const view = observation(0, { active: vmax });
  const req = cardPrompt(0, view, {
    sourcePrinting: 'Tapu Lele-GX GRI 60',
    effectName: 'Wonder Tag',
    printings: [
      'Arven SVI 166',
      "Lillie's Determination MEG 119",
      'Iono PAL 185'
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-choices',
    tokens: ['card-0']
  });
});


test('Star Alchemy searches the missing Basic Shadow Rider line before generic resources', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX']
  });
  const view = observation(0, { active: vmax });
  const req = cardPrompt(0, view, {
    sourcePrinting: 'Forest Seal Stone SIT 156',
    effectName: 'Star Alchemy',
    printings: [
      'Shadow Rider Calyrex V CRE 74',
      'Psychic Energy SVE 13',
      'Teammates PRC 141'
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-choices',
    tokens: ['card-0']
  });
});

test('Forest Seal Stone is attached only for a live bottleneck and defers to Fog Crystal', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX']
  });
  const stoneOnly = observation(0, {
    active: vmax,
    ownHand: ['Forest Seal Stone SIT 156']
  });
  const attach = request(0, stoneOnly, {
    actions: [
      {
        token: 'attach-stone',
        kind: 'play-card',
        actorPrinting: 'Forest Seal Stone SIT 156',
        publicMetadata: {
          targetSeat: 'actor',
          targetZone: 'active',
          targetIndex: 0,
          isOwnerVisible: true
        }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(attach), {
    kind: 'select-action',
    token: 'attach-stone'
  });

  const withFogCrystal = observation(0, {
    active: vmax,
    ownHand: ['Forest Seal Stone SIT 156', 'Fog Crystal CRE 140']
  });
  const defer = request(0, withFogCrystal, {
    actions: [
      {
        token: 'attach-stone',
        kind: 'play-card',
        actorPrinting: 'Forest Seal Stone SIT 156',
        publicMetadata: {
          targetSeat: 'actor',
          targetZone: 'active',
          targetIndex: 0,
          isOwnerVisible: true
        }
      },
      {
        token: 'fog-crystal',
        kind: 'play-card',
        actorPrinting: 'Fog Crystal CRE 140'
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(defer), {
    kind: 'select-action',
    token: 'fog-crystal'
  });
});

test('Star Alchemy is sequenced after Underworld Door when both are available', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX'],
    energies: ['Psychic Energy SVE 13'],
    abilities: ['Underworld Door'],
    suppression: false,
    tools: ['Forest Seal Stone SIT 156']
  });
  const mimikyu = pokemon({
    printing: 'Mimikyu GRI 58',
    name: 'Mimikyu',
    hp: 70
  });
  const view = observation(0, {
    active: vmax,
    bench: [mimikyu],
    ownHand: ['Psychic Energy SVE 13']
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'star-alchemy',
        kind: 'use-ability',
        actorPrinting: vmax.printing,
        publicMetadata: {
          abilityName: 'Star Alchemy',
          sourceZone: 'active',
          sourceSeat: 'actor',
          sourceIndex: 0
        }
      },
      {
        token: 'underworld',
        kind: 'use-ability',
        actorPrinting: vmax.printing,
        publicMetadata: {
          abilityName: 'Underworld Door',
          sourceZone: 'active',
          sourceSeat: 'actor',
          sourceIndex: 0
        }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'underworld'
  });
});

test('Star Alchemy is used before attacking only when its VSTAR Power is attached and needed', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX'],
    energies: Array(3).fill('Psychic Energy SVE 13'),
    tools: ['Forest Seal Stone SIT 156'],
    attacks: [attack('Max Geist', ['Colorless', 'Colorless', 'Colorless'], '10+')]
  });
  const regidrago = pokemon({
    printing: 'Regidrago VSTAR SIT 136',
    name: 'Regidrago VSTAR',
    hp: 280,
    types: ['Dragon'],
    subtypes: ['VSTAR']
  });
  const view = observation(0, {
    active: vmax,
    opponentActive: regidrago,
    ownHand: []
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'star-alchemy',
        kind: 'use-ability',
        actorPrinting: vmax.printing,
        publicMetadata: {
          abilityName: 'Star Alchemy',
          sourceZone: 'active',
          sourceSeat: 'actor',
          sourceIndex: 0
        }
      },
      {
        token: 'max-geist',
        kind: 'attack',
        actorPrinting: vmax.printing,
        attackName: 'Max Geist',
        publicMetadata: { attackCostPayable: true }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'star-alchemy'
  });
});

test('Star Alchemy is not spent when no material bottleneck remains', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX'],
    tools: ['Forest Seal Stone SIT 156']
  });
  const basic = pokemon({
    printing: 'Shadow Rider Calyrex V CRE 74',
    name: 'Shadow Rider Calyrex V',
    hp: 210
  });
  const view = observation(0, {
    active: vmax,
    bench: [basic],
    ownHand: [
      'Shadow Rider Calyrex VMAX CRE 75',
      'N FCO 105',
      'Professor\'s Research SVI 189',
      'Guzma BUS 115'
    ]
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'star-alchemy',
        kind: 'use-ability',
        actorPrinting: vmax.printing,
        publicMetadata: {
          abilityName: 'Star Alchemy',
          sourceZone: 'active',
          sourceSeat: 'actor',
          sourceIndex: 0
        }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'pass'
  });
});


test('a Shadow Rider VMAX in hand does not satisfy the missing Basic V search need', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX']
  });
  const view = observation(0, {
    active: vmax,
    ownHand: ['Shadow Rider Calyrex VMAX CRE 75']
  });
  const req = cardPrompt(0, view, {
    printings: [
      'Shadow Rider Calyrex V CRE 74',
      'Latias ex SSP 76',
      'Psychic Energy SVE 13'
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-choices',
    tokens: ['card-0']
  });
});

test('Arven search ranks Fog Crystal without conflating VMAX with a Basic V', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX']
  });
  const ironThorns = pokemon({
    printing: 'Iron Thorns ex TWM 77',
    name: 'Iron Thorns ex',
    hp: 230
  });
  const view = observation(0, {
    active: vmax,
    ownHand: ['Shadow Rider Calyrex VMAX CRE 75'],
    opponentActive: ironThorns
  });
  const req = cardPrompt(0, view, {
    sourcePrinting: 'Arven SVI 166',
    effectName: 'Arven',
    printings: [
      'Fog Crystal CRE 140',
      'Stealthy Hood UNB 186'
    ],
    minimumCount: 2,
    maximumCount: 2
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-choices',
    tokens: ['card-0', 'card-1']
  });
});

test('Forest Seal Stone is not attached under Path to the Peak Ability suppression', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX']
  });
  const view = observation(0, {
    active: vmax,
    ownHand: ['Forest Seal Stone SIT 156'],
    opponentStadium: ['Path to the Peak CRE 148']
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'attach-stone',
        kind: 'play-card',
        actorPrinting: 'Forest Seal Stone SIT 156',
        publicMetadata: {
          targetSeat: 'actor',
          targetZone: 'active',
          targetIndex: 0,
          isOwnerVisible: true
        }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'pass'
  });
});


test('Trevenant & Dusknoir-GX is benched as a Night Watch disruption attacker against a large hand', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX'],
    abilities: ['Underworld Door'],
    suppression: false
  });
  const view = observation(0, {
    active: vmax,
    ownHand: ['Trevenant & Dusknoir-GX SMP 10', 'Psychic Energy SVE 13'],
    opponentHandCount: 6
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'trevenant',
        kind: 'play-card',
        actorPrinting: 'Trevenant & Dusknoir-GX SMP 10',
        publicMetadata: {
          targetSeat: 'actor',
          targetZone: 'bench',
          isOwnerVisible: true
        }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'trevenant'
  });
});

test('search finds Trevenant & Dusknoir-GX when Night Watch can punish a large opponent hand', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX'],
    abilities: ['Underworld Door'],
    suppression: false
  });
  const view = observation(0, {
    active: vmax,
    ownHand: ['Psychic Energy SVE 13'],
    opponentHandCount: 6
  });
  const req = cardPrompt(0, view, {
    printings: [
      'Trevenant & Dusknoir-GX SMP 10',
      'Latias ex SSP 76',
      'Psychic Energy SVE 13'
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-choices',
    tokens: ['card-0']
  });
});

test('Underworld Door funds Trevenant & Dusknoir-GX for Night Watch against a large hand', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX'],
    abilities: ['Underworld Door'],
    suppression: false
  });
  const trevenant = pokemon({
    printing: 'Trevenant & Dusknoir-GX SMP 10',
    name: 'Trevenant & Dusknoir-GX',
    hp: 270,
    types: ['Psychic'],
    subtypes: ['GX'],
    attacks: [attack('Night Watch', ['Psychic', 'Psychic', 'Psychic'], '150')]
  });
  const benchVmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX']
  });
  const view = observation(0, {
    active: vmax,
    bench: [trevenant, benchVmax],
    ownHand: ['Psychic Energy SVE 13'],
    opponentHandCount: 6
  });
  const req = underworldAttachmentRequest(0, view, [
    { token: 'trevenant-energy', benchIndex: 0, printing: trevenant.printing },
    { token: 'vmax-energy', benchIndex: 1, printing: benchVmax.printing }
  ]);
  assert.deepEqual(evaluate(req), {
    kind: 'select-choice',
    token: 'trevenant-energy'
  });
});


test('Pale Moon-GX is prioritized for a high-prize Active with no Bench escape', () => {
  const trevenant = pokemon({
    printing: 'Trevenant & Dusknoir-GX SMP 217',
    name: 'Trevenant & Dusknoir-GX',
    hp: 270,
    types: ['Psychic'],
    subtypes: ['Basic', 'TAG TEAM', 'GX'],
    energies: Array(3).fill('Psychic Energy SVE 13'),
    attacks: [
      attack('Night Watch', ['Psychic', 'Psychic', 'Psychic'], '150'),
      attack('Pale Moon-GX', ['Psychic', 'Colorless'], '')
    ]
  });
  const regidrago = pokemon({
    printing: 'Regidrago VSTAR SIT 136',
    name: 'Regidrago VSTAR',
    hp: 280,
    types: ['Dragon'],
    subtypes: ['VSTAR'],
    energies: ['Fire Energy', 'Grass Energy']
  });
  const view = observation(0, {
    active: trevenant,
    opponentActive: regidrago,
    opponentBench: [],
    opponentHandCount: 1
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'night-watch',
        kind: 'attack',
        actorPrinting: trevenant.printing,
        attackName: 'Night Watch',
        publicMetadata: { attackCostPayable: true }
      },
      {
        token: 'pale-moon',
        kind: 'attack',
        actorPrinting: trevenant.printing,
        attackName: 'Pale Moon-GX',
        publicMetadata: { attackCostPayable: true }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'pale-moon'
  });
});

test('Pale Moon-GX is excluded after the once-per-game GX attack has been used', () => {
  const trevenant = pokemon({
    printing: 'Trevenant & Dusknoir-GX SMP 217',
    name: 'Trevenant & Dusknoir-GX',
    hp: 270,
    types: ['Psychic'],
    subtypes: ['Basic', 'TAG TEAM', 'GX'],
    energies: Array(3).fill('Psychic Energy SVE 13'),
    attacks: [
      attack('Night Watch', ['Psychic', 'Psychic', 'Psychic'], '150'),
      attack('Pale Moon-GX', ['Psychic', 'Colorless'], '')
    ]
  });
  const regidrago = pokemon({
    printing: 'Regidrago VSTAR SIT 136',
    name: 'Regidrago VSTAR',
    hp: 280,
    types: ['Dragon'],
    subtypes: ['VSTAR'],
    energies: ['Fire Energy', 'Grass Energy']
  });
  const view = observation(0, {
    active: trevenant,
    opponentActive: regidrago,
    opponentBench: [],
    opponentHandCount: 1
  });
  view.ownPublic.publicTurnRestrictions.gxUsed = true;
  const req = request(0, view, {
    actions: [
      {
        token: 'night-watch',
        kind: 'attack',
        actorPrinting: trevenant.printing,
        attackName: 'Night Watch',
        publicMetadata: { attackCostPayable: true }
      },
      {
        token: 'pale-moon',
        kind: 'attack',
        actorPrinting: trevenant.printing,
        attackName: 'Pale Moon-GX',
        publicMetadata: { attackCostPayable: true }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'night-watch'
  });
});


test('Night Watch disruption value rises with opponent hand size and can change attack choice', () => {
  const trevenant = pokemon({
    printing: 'Trevenant & Dusknoir-GX SMP 217',
    name: 'Trevenant & Dusknoir-GX',
    hp: 270,
    types: ['Psychic'],
    subtypes: ['Basic', 'TAG TEAM', 'GX'],
    energies: Array(3).fill('Psychic Energy SVE 13'),
    attacks: [
      attack('Night Watch', ['Psychic', 'Psychic', 'Psychic'], '150'),
      attack('Heavy Strike', ['Psychic', 'Psychic', 'Psychic'], '160')
    ]
  });
  const regidrago = pokemon({
    printing: 'Regidrago VSTAR SIT 136',
    name: 'Regidrago VSTAR',
    hp: 280,
    types: ['Dragon'],
    subtypes: ['VSTAR']
  });
  const actions = [
    {
      token: 'night-watch',
      kind: 'attack',
      actorPrinting: trevenant.printing,
      attackName: 'Night Watch',
      publicMetadata: { attackCostPayable: true }
    },
    {
      token: 'heavy-strike',
      kind: 'attack',
      actorPrinting: trevenant.printing,
      attackName: 'Heavy Strike',
      publicMetadata: { attackCostPayable: true }
    },
    { token: 'pass', kind: 'pass' }
  ];
  const largeHand = request(0, observation(0, {
    active: trevenant,
    opponentActive: regidrago,
    opponentHandCount: 6
  }), { actions });
  const smallHand = request(0, observation(0, {
    active: trevenant,
    opponentActive: regidrago,
    opponentHandCount: 0
  }), { actions });
  assert.deepEqual(evaluate(largeHand), {
    kind: 'select-action',
    token: 'night-watch'
  });
  assert.deepEqual(evaluate(smallHand), {
    kind: 'select-action',
    token: 'heavy-strike'
  });
});


test('Teammates is played after a validated opponent-turn Knock Out', () => {
  const view = observation(0, {
    active: null,
    bench: [],
    ownHand: ['Teammates PRC 141']
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'teammates',
        kind: 'play-card',
        actorPrinting: 'Teammates PRC 141'
      },
      { token: 'pass', kind: 'pass' }
    ],
    receipt: priorKoReceipt(view)
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'teammates'
  });
});

test('Raihan is played after a Knock Out when Psychic Energy is available in discard', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX']
  });
  const mimikyu = pokemon({
    printing: 'Mimikyu GRI 58',
    name: 'Mimikyu',
    hp: 70
  });
  const view = observation(0, {
    active: vmax,
    bench: [mimikyu],
    ownHand: ['Raihan CRZ 140'],
    ownDiscard: ['Psychic Energy SVE 13']
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'raihan',
        kind: 'play-card',
        actorPrinting: 'Raihan CRZ 140'
      },
      { token: 'pass', kind: 'pass' }
    ],
    receipt: priorKoReceipt(view)
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'raihan'
  });
});

test('Iono is played to disrupt a large opponent hand when our hand can reload', () => {
  const view = observation(0, {
    ownHand: [
      'Iono PAL 185',
      'Psychic Energy SVE 13',
      'N FCO 105',
      "Professor's Research SVI 189"
    ],
    opponentHandCount: 6
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'iono',
        kind: 'play-card',
        actorPrinting: 'Iono PAL 185'
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'iono'
  });
});

test('Acerola selects the damaged, energy-loaded VMAX nearest to being Knocked Out', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX'],
    damage: 250,
    energies: Array(3).fill('Psychic Energy SVE 13')
  });
  const trevenant = pokemon({
    printing: 'Trevenant & Dusknoir-GX SMP 217',
    name: 'Trevenant & Dusknoir-GX',
    hp: 270,
    types: ['Psychic'],
    subtypes: ['Basic', 'TAG TEAM', 'GX'],
    damage: 100
  });
  const view = observation(0, {
    bench: [vmax, trevenant]
  });
  const req = pokemonPrompt(0, view, [
    { token: 'vmax', index: 0, printing: vmax.printing },
    { token: 'trevenant', index: 1, printing: trevenant.printing }
  ], 'Acerola');
  assert.deepEqual(evaluate(req), {
    kind: 'select-choices',
    tokens: ['vmax']
  });
});


test('Acerola is still played to save a damaged high-prize Pokémon without attached Energy', () => {
  const vmax = pokemon({
    printing: 'Shadow Rider Calyrex VMAX CRE 75',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    subtypes: ['VMAX'],
    damage: 250
  });
  const view = observation(0, {
    bench: [vmax],
    ownHand: ['Acerola PRC 112']
  });
  const req = request(0, view, {
    actions: [
      {
        token: 'acerola',
        kind: 'play-card',
        actorPrinting: 'Acerola PRC 112'
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-action',
    token: 'acerola'
  });
});


function confirmPromptRequest(seat, view, sourcePrinting, effectName = sourcePrinting) {
  const prompt = {
    schema: protocol.PROMPT_SCHEMA,
    actingSeat: seat,
    promptType: 'ConfirmPrompt',
    description: 'WANT_TO_USE_ABILITY',
    source: {
      classification: 'actor-choice',
      sourceKind: 'card-effect',
      sourcePrinting,
      effectName
    },
    choices: [
      { token: 'yes', kind: 'confirm', label: 'Yes' },
      { token: 'no', kind: 'confirm', label: 'No' }
    ],
    publicMetadata: { selectionType: 'confirm' }
  };
  return request(seat, {
    ...view,
    decisionKind: 'owner-prompt',
    pendingPromptType: 'ConfirmPrompt'
  }, { prompt, actions: [] });
}

test('Radiant Climactic Gate confirmation uses actor-visible hypergeometric target EV for both seats', () => {
  for (const seat of [0, 1]) {
    const view = observation(seat);
    const req = confirmPromptRequest(
      seat, view, 'Radiant Eternatus CRZ 105', 'Climactic Gate'
    );
    assert.deepEqual(evaluate(req), { kind: 'select-choice', token: 'yes' });
  }
});

test('Radiant Climactic Gate declines when target EV is low or two Bench slots are unavailable', () => {
  const lowView = observation(0, {
    ownDiscard: [
      'Shadow Rider Calyrex VMAX CRE 75',
      'Shadow Rider Calyrex VMAX CRE 75',
      'Shadow Rider Calyrex VMAX CRE 75'
    ]
  });
  lowView.ownPublic.deckCount = 1;
  lowView.ownPublic.prizeCount = 6;
  assert.deepEqual(evaluate(confirmPromptRequest(
    0, lowView, 'Radiant Eternatus CRZ 105', 'Climactic Gate'
  )), { kind: 'select-choice', token: 'no' });

  const fullBench = observation(0, {
    bench: Array.from({ length: 5 }, (_, index) => pokemon({
      printing: 'Shadow Rider Calyrex V CRE 74 ' + index,
      name: 'Shadow Rider Calyrex V'
    }))
  });
  assert.deepEqual(evaluate(confirmPromptRequest(
    0, fullBench, 'Radiant Eternatus CRZ 105', 'Climactic Gate'
  )), { kind: 'select-choice', token: 'no' });
});

test('Radiant root play is not selected when the remaining VMAX are unlikely to be in deck', () => {
  const view = observation(0, {
    ownHand: ['Radiant Eternatus CRZ 105'],
    ownDiscard: [
      'Shadow Rider Calyrex VMAX CRE 75',
      'Shadow Rider Calyrex VMAX CRE 75',
      'Shadow Rider Calyrex VMAX CRE 75'
    ]
  });
  view.ownPublic.deckCount = 1;
  view.ownPublic.prizeCount = 6;
  const req = request(0, view, {
    actions: [
      {
        token: 'radiant',
        kind: 'play-card',
        actorPrinting: 'Radiant Eternatus CRZ 105',
        publicMetadata: {
          targetSeat: 'actor', targetZone: 'bench', isOwnerVisible: true
        }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(evaluate(req), { kind: 'select-action', token: 'pass' });
});

test('Tapu Lele Wonder Tag confirmation is source-bound and declines only with no deck cards', () => {
  for (const seat of [0, 1]) {
    const view = observation(seat);
    assert.deepEqual(evaluate(confirmPromptRequest(
      seat, view, 'Tapu Lele-GX GRI 60', 'Tapu Lele-GX'
    )), { kind: 'select-choice', token: 'yes' });
  }
  const empty = observation(0);
  empty.ownPublic.deckCount = 0;
  assert.deepEqual(evaluate(confirmPromptRequest(
    0, empty, 'Tapu Lele-GX GRI 60', 'Tapu Lele-GX'
  )), { kind: 'select-choice', token: 'no' });

  const unrelated = evaluate(confirmPromptRequest(
    0, observation(0), 'Mewtwo ex MEW 151', 'Mewtwo ex'
  ));
  assert.deepEqual(unrelated, { kind: 'abstain', reasonCode: 'UNSUPPORTED_CONFIRM_SOURCE' });
});

test('Tapu Lele source printing activates Wonder Tag Supporter scoring when effect name is card name', () => {
  const view = observation(0);
  const req = cardPrompt(0, view, {
    sourcePrinting: 'Tapu Lele-GX GRI 60',
    effectName: 'Tapu Lele-GX',
    printings: ['Fog Crystal FLI 99', 'Teammates TEU 141'],
    minimumCount: 0,
    maximumCount: 1,
    receipt: priorKoReceipt(view)
  });
  req.prompt.choices.push({
    token: 'empty-selection',
    kind: 'empty-selection',
    label: 'Choose no cards'
  });
  assert.deepEqual(evaluate(req), {
    kind: 'select-choices',
    tokens: ['card-1']
  });
});
