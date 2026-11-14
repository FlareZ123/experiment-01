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
      text: '20 more damage for each Benched Pokémon (both yours and your opponent\\'s).'
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
