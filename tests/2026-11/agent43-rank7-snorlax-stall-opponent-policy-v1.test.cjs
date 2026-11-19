'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const policyModule = require('../../simulation/evaluation/2026-11/agent43-rank7-snorlax-stall-opponent-policy-v1.cjs');

const {
  POLICY_VERSION, SOURCE_FINGERPRINT_SHA256, CANDIDATE_FINGERPRINT_SHA256,
  createPolicy, source7FabaJetNestReady, source7JetWobbuffetReady, source7NestReady
} = policyModule;

const config = {};
const bundleSha256 = crypto.createHash('sha256').update(fs.readFileSync(path.resolve(
  __dirname, '../../simulation/evaluation/2026-11/agent43-rank7-snorlax-stall-opponent-policy-v1.cjs'
))).digest('hex');

function restrictions(options = {}) {
  return {
    cannotAttackNextTurn: false, cannotUseAttacksNextTurn: [],
    blockedAttackNameNextTurn: null, blockedAttackNameUntilLeavesActive: null,
    onlyAllowedAttackNameNextTurn: null, attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0, cannotRetreat: false,
    cannotRetreatNextTurn: false, cannotRetreatWhileActive: false,
    cannotEvolveNextTurn: false, ...options
  };
}

function publicRestrictions(options = {}) {
  return {
    gxUsed: false, vstarUsed: false, attackLockTurnsRemaining: 0,
    attackMaxEnergy: null, attackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [], ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false, pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false, evolutionPlayLocked: false,
    itemPlayLocked: false, supporterPlayLocked: false,
    stadiumPlayLocked: false, toolPlayLocked: false,
    energyPlayLocked: false, specialEnergyPlayLocked: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: null, ...options
  };
}

function pokemon(printing, options = {}) {
  const abilities = options.abilities ?? [];
  return {
    printing, name: options.name ?? printing.split(' ').slice(0, -2).join(' '),
    hp: options.hp ?? 150, damage: options.damage ?? 0,
    lastPlayedOrEvolvedTurn: options.lastPlayedOrEvolvedTurn ?? 1,
    printed: {
      stage: options.stage ?? 'BASIC', subtypes: options.subtypes ?? ['Basic'],
      types: options.types ?? ['Colorless'], retreatCost: options.retreatCost ?? [],
      weakness: options.weakness ?? [], resistance: options.resistance ?? []
    },
    specialConditions: [], publicRestrictions: restrictions(),
    evolutionPrintings: options.evolutionPrintings ?? [],
    energies: options.energies ?? [], tools: options.tools ?? [],
    attacks: options.attacks ?? [], abilities,
    abilityDetails: options.abilityDetails ?? abilities.map(name => ({
      name, powerType: 'ABILITY', text: 'As long as this Pokémon is in play.'
    })),
    abilitySuppressions: null
  };
}

function player(options = {}) {
  const bench = (options.bench ?? []).slice(0, 8);
  while (bench.length < 5) bench.push(null);
  return {
    active: options.active ?? null, bench,
    stadium: options.stadium ?? [], discard: options.discard ?? [],
    lostZone: options.lostZone ?? [], resolvingSupporter: [],
    publicHand: options.publicHand ?? null, prizeSlots: options.prizeSlots ?? [],
    publicTurnRestrictions: publicRestrictions(options.publicTurnRestrictions ?? {}),
    handCount: options.handCount ?? 0, deckCount: options.deckCount ?? 30,
    prizeCount: options.prizeCount ?? 6
  };
}

function turnResources(options = {}) {
  return {
    supporterPlayedTurn: 0, retreatedTurn: 0, extraTurnActive: false,
    energyPlayedTurn: false, stadiumPlayedTurn: false, stadiumUsedTurn: false,
    vstarUsed: false, pokemonPlayLocked: false, abilityPokemonPlayLocked: false,
    evolutionPlayLocked: false, itemPlayLocked: false, supporterPlayLocked: false,
    stadiumPlayLocked: false, toolPlayLocked: false, energyPlayLocked: false,
    specialEnergyPlayLocked: false, ...options
  };
}

function observation(options = {}) {
  return {
    actorSeat: options.actorSeat ?? 0, globalTurn: options.globalTurn ?? 3,
    phase: options.phase ?? 2,
    decisionKind: options.prompt ? 'owner-prompt' : 'owner-root',
    pendingPromptType: options.prompt?.promptType ?? null,
    pendingOwnerDeckSearch: options.pendingOwnerDeckSearch ?? false,
    ownHand: options.ownHand ?? [], ownPublic: options.ownPublic ?? player(),
    opponentPublic: options.opponentPublic ?? player(),
    ownTurnResources: options.ownTurnResources ?? turnResources(),
    ownerK1: null
  };
}

function initMessage(seat = 0) {
  return {
    schema: protocol.INIT_SCHEMA, type: 'init', role: 'opponent', seat,
    policyVersion: POLICY_VERSION, bundleSha256, config
  };
}

function rootRequest(options = {}) {
  const seat = options.seat ?? 0;
  return {
    schema: protocol.REQUEST_SCHEMA, type: 'decision',
    requestId: options.requestId ?? 'agent43-root-1',
    sequence: options.sequence ?? 1, role: 'opponent', seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation({ ...options, actorSeat: seat }),
    prompt: null, publicEventReceipt: null,
    actionFrontier: {
      schema: protocol.FRONTIER_SCHEMA,
      items: options.items ?? [{ token: 'pass', kind: 'pass', label: 'Pass turn' }]
    }
  };
}

function actorChoiceSource(sourcePrinting, effectName) {
  return { classification: 'actor-choice', sourceKind: 'card-effect',
    sourcePrinting, effectName };
}

function promptRequest(options = {}) {
  const seat = options.seat ?? 0;
  const prompt = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: seat,
    promptType: options.promptType, description: options.description ?? 'Choose a legal option',
    source: options.source ?? actorChoiceSource(options.sourcePrinting ?? 'Faba LOT 173',
      options.effectName ?? 'Faba'),
    choices: options.choices ?? [],
    ...(options.publicMetadata ? { publicMetadata: options.publicMetadata } : {})
  };
  return {
    schema: protocol.REQUEST_SCHEMA, type: 'decision',
    requestId: options.requestId ?? 'agent43-prompt-1',
    sequence: options.sequence ?? 1, role: 'opponent', seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation({
      ...options, actorSeat: seat, prompt,
      pendingOwnerDeckSearch: options.pendingOwnerDeckSearch ?? false
    }),
    prompt, publicEventReceipt: null,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: [] }
  };
}

function cardChoice(token, printing, ownerSeat, sourceZone) {
  return {
    token, kind: 'card', printing,
    publicMetadata: { ownerSeat, sourceZone }
  };
}

function pokemonChoice(token, printing, ownerSeat, targetZone) {
  return {
    token, kind: 'pokemon', printing,
    publicMetadata: {
      selectionIndex: 0, selectedCount: 1, selectionType: 'pokemon',
      ownerSeat, targetZone, isOwnerVisible: true
    }
  };
}

function energyChoice(token, printing, ownerSeat, sourceZone) {
  return { token, kind: 'energy', printing, publicMetadata: { ownerSeat, sourceZone } };
}

function multiMeta(minimumCount, maximumCount, selectionType = 'card-combination') {
  return { selectionType, minimumCount, maximumCount, allowCancel: false, isSecret: false };
}

function makePolicy(seat = 0) {
  return createPolicy({ role: 'opponent', seat, policyVersion: POLICY_VERSION, config });
}

function checkedDecision(request) {
  const init = protocol.validateInit(initMessage(request.seat));
  const validated = protocol.validateRequest(request, init, request.sequence, new Set());
  const raw = makePolicy(request.seat).decide(request);
  return protocol.validateDecision(raw, validated.prompt, validated.actionTokens);
}

function fabaBoard(options = {}) {
  const ownBench = options.ownBench ?? [
    pokemon('Wobbuffet PHF 36'), null
  ];
  const opponentBench = options.opponentBench ?? [];
  const ownActive = options.ownActive ?? pokemon('Mimikyu PAL 97');
  const opponentActive = options.opponentActive ?? pokemon('Vileplume AOR 6', {
    abilities: ['Irritating Pollen'], tools: options.hood === false ? [] : ['Stealthy Hood UNB 186']
  });
  return {
    ownPublic: player({
      active: ownActive, bench: ownBench, deckCount: 28,
      publicTurnRestrictions: options.ownRestrictions ?? {}
    }),
    opponentPublic: player({ active: opponentActive, bench: opponentBench, deckCount: 32 })
  };
}

test('init is accepted by the actual Agent49 init validator and policy binds the role-only empty config', () => {
  const init = protocol.validateInit(initMessage());
  assert.equal(init.config && Object.keys(init.config).length, 0);
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION,
    config: { rank: 7, sourceFingerprint: SOURCE_FINGERPRINT_SHA256,
      candidateFingerprint: CANDIDATE_FINGERPRINT_SHA256 }
  }), /AGENT43_RANK7_POLICY_INIT_MISMATCH/);
});

test('exact rank-7 Faba -> Jet -> Wobbuffet -> Nest public precondition is recognized', () => {
  const board = fabaBoard();
  const view = observation({
    ownHand: ['Faba LOT 173', 'Jet Energy PAL 190', 'Nest Ball SVI 181'],
    ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources({ itemPlayLocked: true })
  });
  assert.ok(source7FabaJetNestReady(view));
});

test('Faba root selects the unlock line ahead of pass while Item lock is present', () => {
  const board = fabaBoard();
  const request = rootRequest({
    ownHand: ['Faba LOT 173', 'Jet Energy PAL 190', 'Nest Ball SVI 181'],
    ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources({ itemPlayLocked: true }),
    items: [
      { token: 'faba', kind: 'play-card', actorPrinting: 'Faba LOT 173',
        publicMetadata: { cardType: 'trainer', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'faba' });
});

test('Faba does not pretend one removal clears two independently Hood-protected Vileplumes', () => {
  const board = fabaBoard({
    opponentBench: [pokemon('Vileplume AOR 6', {
      abilities: ['Irritating Pollen'], tools: ['Stealthy Hood UNB 186']
    })]
  });
  const request = rootRequest({
    ownHand: ['Faba LOT 173', 'Jet Energy PAL 190', 'Nest Ball SVI 181'],
    ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources({ itemPlayLocked: true }),
    items: [
      { token: 'faba', kind: 'play-card', actorPrinting: 'Faba LOT 173' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Faba/Jet line is blocked by public Power of Alchemy', () => {
  const board = fabaBoard({ opponentBench: [pokemon('Alolan Muk SUM 58', {
    abilities: ['Power of Alchemy']
  })] });
  const request = rootRequest({
    ownHand: ['Faba LOT 173', 'Jet Energy PAL 190', 'Nest Ball SVI 181'],
    ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources({ itemPlayLocked: true }),
    items: [
      { token: 'faba', kind: 'play-card', actorPrinting: 'Faba LOT 173' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Faba declines the Hood unlock line when Jet Energy is absent', () => {
  const board = fabaBoard();
  const request = rootRequest({
    ownHand: ['Faba LOT 173', 'Nest Ball SVI 181'],
    ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources({ itemPlayLocked: true }),
    items: [
      { token: 'faba', kind: 'play-card', actorPrinting: 'Faba LOT 173' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Faba SelectPrompt chooses the Tool branch and no other option', () => {
  const request = promptRequest({
    promptType: 'SelectPrompt', source: actorChoiceSource('Faba LOT 173', 'Faba'),
    choices: [
      { token: 'stadium', kind: 'option', label: 'Stadium' },
      { token: 'tool', kind: 'option', label: 'Pokémon Tool' },
      { token: 'energy', kind: 'option', label: 'Special Energy' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'tool' });
});

test('Faba ChoosePokemonPrompt selects the exact public Hooded Vileplume', () => {
  const board = fabaBoard();
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt', source: actorChoiceSource('Faba LOT 173', 'Faba'),
    ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    choices: [
      pokemonChoice('vileplume', 'Vileplume AOR 6', 'opponent', 'active'),
      pokemonChoice('wrong', 'Snorlax PGO 55', 'opponent', 'bench')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'vileplume' });
});

test('Jet Energy promotes Wobbuffet only after all public Vileplume Hoods are gone', () => {
  const board = fabaBoard({ hood: false });
  const request = rootRequest({
    ownHand: ['Jet Energy PAL 190', 'Nest Ball SVI 181'],
    ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    items: [
      { token: 'jet', kind: 'play-card', actorPrinting: 'Jet Energy PAL 190',
        targetPrinting: 'Wobbuffet PHF 36',
        publicMetadata: { cardType: 'energy', handIndex: 0, ownerSeat: 'actor', targetZone: 'bench' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.ok(source7JetWobbuffetReady(request.observation));
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'jet' });
});

test('Jet Energy refuses Wobbuffet promotion while a Hood remains', () => {
  const board = fabaBoard();
  const request = rootRequest({
    ownHand: ['Jet Energy PAL 190', 'Nest Ball SVI 181'],
    ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    items: [
      { token: 'jet', kind: 'play-card', actorPrinting: 'Jet Energy PAL 190',
        targetPrinting: 'Wobbuffet PHF 36' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.equal(source7JetWobbuffetReady(request.observation), false);
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Nest Ball is not selected before Wobbuffet clears the public Vileplume lock', () => {
  const board = fabaBoard({ hood: false });
  const request = rootRequest({
    ownHand: ['Nest Ball SVI 181'],
    ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    items: [
      { token: 'nest', kind: 'play-card', actorPrinting: 'Nest Ball SVI 181' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.equal(source7NestReady(request.observation), false);
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Nest Ball is prioritized after Wobbuffet is Active and all Vileplumes are unhooded', () => {
  const board = fabaBoard({ hood: false, ownActive: pokemon('Wobbuffet PHF 36'),
    ownBench: [pokemon('Snorlax PGO 55'), null] });
  const request = rootRequest({
    ownHand: ['Nest Ball SVI 181'], ownPublic: board.ownPublic,
    opponentPublic: board.opponentPublic, ownTurnResources: turnResources(),
    items: [
      { token: 'nest', kind: 'play-card', actorPrinting: 'Nest Ball SVI 181' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.ok(source7NestReady(request.observation));
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'nest' });
});

test('Nest Ball deck search prefers a missing source Basic and uses multi-select protocol', () => {
  const board = fabaBoard({ hood: false, ownActive: pokemon('Wobbuffet PHF 36'),
    ownBench: [pokemon('Snorlax PGO 55'), null] });
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt', source: actorChoiceSource('Nest Ball SVI 181', 'Nest Ball'),
    ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownHand: ['Nest Ball SVI 181'],
    publicMetadata: multiMeta(1, 1),
    choices: [
      cardChoice('snorlax', 'Snorlax PGO 55', 'actor', 'deck'),
      cardChoice('regirock', 'Regirock XYP 49', 'actor', 'deck'),
      cardChoice('mimikyu', 'Mimikyu PAL 97', 'actor', 'deck')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['regirock'] });
});

test('Tool Jammer is attached to Active Snorlax rather than an unrelated Pokémon', () => {
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Snorlax PGO 55') }),
    opponentPublic: player({ active: pokemon('Shadow Rider Calyrex VMAX CRE 75',
      { tools: ['Stealthy Hood UNB 186'] }) }),
    items: [
      { token: 'jammer', kind: 'play-card', actorPrinting: 'Tool Jammer BST 136',
        targetPrinting: 'Snorlax PGO 55' },
      { token: 'other', kind: 'play-card', actorPrinting: 'Tool Jammer BST 136',
        targetPrinting: 'Mimikyu PAL 97' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'jammer' });
});

test('Field Blower multi-select removes opponent Tools and never own Tool Jammer', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt', source: actorChoiceSource('Field Blower GRI 125', 'Field Blower'),
    publicMetadata: multiMeta(0, 2),
    choices: [
      cardChoice('hood', 'Stealthy Hood UNB 186', 'opponent', 'attached'),
      cardChoice('float', 'Float Stone BKT 137', 'opponent', 'attached'),
      cardChoice('own-jammer', 'Tool Jammer BST 136', 'actor', 'attached'),
      { token: 'empty', kind: 'empty-selection' }
    ],
    ownPublic: player({ active: pokemon('Snorlax PGO 55', { tools: ['Tool Jammer BST 136'] }) }),
    opponentPublic: player({ active: pokemon('Shadow Rider Calyrex VMAX CRE 75',
      { tools: ['Stealthy Hood UNB 186', 'Float Stone BKT 137'] }) })
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['hood', 'float'] });
});

test('Field Blower returns the explicit empty-selection token when no legal target is visible', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt', source: actorChoiceSource('Field Blower GRI 125', 'Field Blower'),
    publicMetadata: multiMeta(0, 2),
    choices: [{ token: 'empty', kind: 'empty-selection' }],
    ownPublic: player(), opponentPublic: player()
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'empty' });
});

test('Steven Resolve searches the Faba/Jet/Nest bundle before lower-value cards', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt', source: actorChoiceSource("Steven's Resolve CES 145", "Steven's Resolve"),
    publicMetadata: multiMeta(0, 3),
    choices: [
      cardChoice('faba', 'Faba LOT 173', 'actor', 'deck'),
      cardChoice('jet', 'Jet Energy PAL 190', 'actor', 'deck'),
      cardChoice('nest', 'Nest Ball SVI 181', 'actor', 'deck'),
      cardChoice('n', 'N FCO 105', 'actor', 'deck'),
      { token: 'empty', kind: 'empty-selection' }
    ]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'select-choices', tokens: ['faba', 'jet', 'nest'] });
});

test('Lusamine recovers Faba and a Stadium rather than a dead Item', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt', source: actorChoiceSource('Lusamine CIN 96', 'Lusamine'),
    publicMetadata: multiMeta(0, 2),
    choices: [
      cardChoice('faba', 'Faba LOT 173', 'actor', 'discard'),
      cardChoice('swell', 'Chaotic Swell CEC 187', 'actor', 'discard'),
      cardChoice('nest', 'Nest Ball SVI 181', 'actor', 'discard'),
      { token: 'empty', kind: 'empty-selection' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['faba', 'swell'] });
});

test('Plumeria cost selection preserves Faba, Jet and Nest', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt', source: actorChoiceSource('Plumeria BUS 120', 'Plumeria'),
    publicMetadata: multiMeta(2, 2),
    ownHand: ['Faba LOT 173', 'Jet Energy PAL 190', 'Nest Ball SVI 181',
      'Electrike PRC 60', 'Robo Substitute PHF 102'],
    choices: [
      cardChoice('faba', 'Faba LOT 173', 'actor', 'hand'),
      cardChoice('jet', 'Jet Energy PAL 190', 'actor', 'hand'),
      cardChoice('nest', 'Nest Ball SVI 181', 'actor', 'hand'),
      cardChoice('electrike', 'Electrike PRC 60', 'actor', 'hand'),
      cardChoice('robo', 'Robo Substitute PHF 102', 'actor', 'hand')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['electrike', 'robo'] });
});

test('Guzma own-switch prompt promotes Tool-Jammer Snorlax', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt', source: actorChoiceSource('Guzma BUS 115', 'Guzma'),
    ownPublic: player({
      active: pokemon('Mimikyu PAL 97'),
      bench: [pokemon('Snorlax PGO 55', { tools: ['Tool Jammer BST 136'] })]
    }),
    choices: [
      pokemonChoice('snorlax', 'Snorlax PGO 55', 'actor', 'bench'),
      pokemonChoice('mimikyu', 'Mimikyu PAL 97', 'actor', 'bench')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'snorlax' });
});

test('Counter Catcher chooses the opponent Bench Pokémon with the larger energy/retreat burden', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Counter Catcher PAR 160', 'Counter Catcher'),
    opponentPublic: player({
      active: pokemon('Pikachu VMAX', { energies: ['Lightning Energy'] }),
      bench: [
        pokemon('Shadow Rider Calyrex VMAX CRE 75', {
          energies: ['Psychic Energy', 'Psychic Energy'],
          retreatCost: ['Colorless', 'Colorless', 'Colorless']
        }),
        pokemon('Mimikyu PAL 97')
      ]
    }),
    choices: [
      pokemonChoice('shadow', 'Shadow Rider Calyrex VMAX CRE 75', 'opponent', 'bench'),
      pokemonChoice('mimikyu', 'Mimikyu PAL 97', 'opponent', 'bench')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'shadow' });
});

test('Enhanced Hammer selects opponent Special Energy and ignores basic Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseEnergyPrompt',
    source: actorChoiceSource('Enhanced Hammer TWM 148', 'Enhanced Hammer'),
    choices: [
      energyChoice('basic', 'Water Energy MEE 11', 'opponent', 'attached'),
      energyChoice('special', 'Jet Energy PAL 190', 'opponent', 'attached')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'special' });
});

test('Get Lost is preferred when opponent discard contains recovery', () => {
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Girafarig LOT 94') }),
    opponentPublic: player({ active: pokemon('Shadow Rider Calyrex VMAX CRE 75'),
      discard: ['VS Seeker PHF 109', 'Lusamine CIN 96'] }),
    items: [
      { token: 'get-lost', kind: 'attack', actorPrinting: 'Girafarig LOT 94',
        attackName: 'Get Lost' },
      { token: 'mind-shock', kind: 'attack', actorPrinting: 'Girafarig LOT 94',
        attackName: 'Mind Shock' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'get-lost' });
});

test('Megaton Blower is selected only when a public removal target exists and Items are available', () => {
  const request = rootRequest({
    ownHand: ['Megaton Blower SSP 182'],
    ownPublic: player(),
    opponentPublic: player({ active: pokemon('Shadow Rider Calyrex VMAX CRE 75',
      { tools: ['Stealthy Hood UNB 186'], energies: ['Jet Energy PAL 190'] }) }),
    items: [
      { token: 'megaton', kind: 'play-card', actorPrinting: 'Megaton Blower SSP 182' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'megaton' });
});

test('Gladion abstains when Prize identities are not owner-visible', () => {
  const request = promptRequest({
    promptType: 'ChoosePrizePrompt', source: actorChoiceSource('Gladion CIN 95', 'Gladion'),
    choices: [
      { token: 'prize-1', kind: 'prize', label: 'Prize 1' },
      { token: 'prize-2', kind: 'prize', label: 'Prize 2' }
    ]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'abstain', reasonCode: 'GLADION_PRIZE_IDENTITIES_UNVERIFIED' });
});

test('Palace Book remains explicitly blocked rather than guessed from a missing English text', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Palace Book SMP NAN25', 'Palace Book'),
    choices: [cardChoice('x', 'Nest Ball SVI 181', 'actor', 'deck')]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'abstain', reasonCode: 'PALACE_BOOK_ENGINE_TEXT_UNVERIFIED' });
});

test('unknown native prompt family fails closed', () => {
  const request = promptRequest({
    promptType: 'NightWatchPhysicalPrompt',
    source: actorChoiceSource('Palace Book SMP NAN25', 'Unmapped effect'),
    choices: [{ token: 'x', kind: 'option', label: 'Unknown' }]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'abstain', reasonCode: 'PALACE_BOOK_ENGINE_TEXT_UNVERIFIED' });
});

test('seat 1 uses the same actor-only policy without seat leakage', () => {
  const request = rootRequest({
    seat: 1,
    ownPublic: player({ active: pokemon('Snorlax PGO 55') }),
    opponentPublic: player({ active: pokemon('Shadow Rider Calyrex VMAX CRE 75',
      { tools: ['Stealthy Hood UNB 186'] }) }),
    items: [
      { token: 'jammer', kind: 'play-card', actorPrinting: 'Tool Jammer BST 136',
        targetPrinting: 'Snorlax PGO 55' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'jammer' });
});

test('identical actor observation and frontier produce identical decisions', () => {
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Girafarig LOT 94') }),
    opponentPublic: player({ discard: ['VS Seeker PHF 109'] }),
    items: [
      { token: 'get-lost', kind: 'attack', actorPrinting: 'Girafarig LOT 94',
        attackName: 'Get Lost' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  const policy = makePolicy();
  assert.deepEqual(policy.decide(request), policy.decide(request));
});

test('worker request validator rejects an injected opponent-private field', () => {
  const request = rootRequest();
  request.observation.opponentPrivate = { hand: ['Faba LOT 173'] };
  assert.throws(() => checkedDecision(request));
});

test('no executable action returns a protocol-valid abstention', () => {
  const request = rootRequest({ items: [] });
  assert.deepEqual(checkedDecision(request),
    { kind: 'abstain', reasonCode: 'NO_EXECUTABLE_ACTION' });
});

test('unrecognized root card without a pass action abstains rather than inventing a token', () => {
  const request = rootRequest({
    items: [{ token: 'unknown', kind: 'play-card', actorPrinting: 'Palace Book SMP NAN25' }]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ACTION' });
});
