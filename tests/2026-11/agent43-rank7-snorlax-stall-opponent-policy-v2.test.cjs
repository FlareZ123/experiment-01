'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const pathModule = require('node:path');
const crypto = require('node:crypto');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const policyModule = require('../../simulation/evaluation/2026-11/agent43-rank7-snorlax-stall-opponent-policy-v2.cjs');

const {
  POLICY_VERSION, SOURCE_FINGERPRINT_SHA256, CANDIDATE_FINGERPRINT_SHA256,
  createPolicy, source7FabaJetNestReady, source7JetWobbuffetReady, source7NestReady
} = policyModule;

const config = {};
const bundleSha256 = crypto.createHash('sha256').update(fs.readFileSync(pathModule.resolve(
  __dirname, '../../simulation/evaluation/2026-11/agent43-rank7-snorlax-stall-opponent-policy-v2.cjs'
))).digest('hex');

const C = {
  snorlax: 'Snorlax PGO 55',
  wobb: 'Wobbuffet PHF 36',
  mimikyu: 'Mimikyu PAL 97',
  regirock: 'Regirock XYP 49',
  girafarig: 'Girafarig LOT 94',
  faba: 'Faba LOT 173',
  jet: 'Jet Energy PAL 190',
  nest: 'Nest Ball SVI 181',
  palace: 'Palace Book SMP NAN25',
  toolJammer: 'Tool Jammer BST 136',
  hood: 'Stealthy Hood UNB 186',
  radiant: 'Radiant Eternatus SIT 105',
  shadow: 'Shadow Rider Calyrex VMAX CRE 75',
  dialga: 'Dialga-GX UPR 100',
  tapu: 'Tapu Lele-GX GRI 60',
  trevenant: 'Trevenant & Dusknoir-GX SMP 217',
  muk: 'Alolan Muk SUM 58',
  temple: 'Temple of Sinnoh ASR 155',
  vs: 'VS Seeker PHF 109',
  lusamine: 'Lusamine CIN 96'
};

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
    requestId: options.requestId ?? 'agent43-v2-root-1',
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
  return { classification: 'actor-choice', sourceKind: 'card-effect', sourcePrinting, effectName };
}

function promptRequest(options = {}) {
  const seat = options.seat ?? 0;
  const prompt = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: seat,
    promptType: options.promptType, description: options.description ?? 'Choose a legal option',
    source: options.source ?? actorChoiceSource(options.sourcePrinting ?? C.faba,
      options.effectName ?? 'Faba'),
    choices: options.choices ?? [],
    ...(options.publicMetadata ? { publicMetadata: options.publicMetadata } : {})
  };
  return {
    schema: protocol.REQUEST_SCHEMA, type: 'decision',
    requestId: options.requestId ?? 'agent43-v2-prompt-1',
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
  return { token, kind: 'card', printing, publicMetadata: { ownerSeat, sourceZone } };
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

function rank7Board(options = {}) {
  const ownActive = options.ownActive ?? pokemon(C.snorlax, {
    types: ['Colorless'], abilities: ['Block']
  });
  const ownBench = options.ownBench ?? [
    pokemon(C.wobb, { types: ['Psychic'], abilities: ['Bide Barricade'] }),
    pokemon(C.mimikyu, { types: ['Psychic'] })
  ];
  const opponentActive = options.opponentActive ?? pokemon(C.shadow, {
    types: ['Psychic'], abilities: ['Underworld Door']
  });
  const opponentBench = options.opponentBench ?? [
    pokemon(C.radiant, {
      types: ['Dragon'], abilities: ['Climactic Gate'],
      tools: options.radiantHood === false ? [] : [C.hood]
    }),
    pokemon(C.dialga, {
      types: ['Dragon'], abilities: [],
      tools: options.dialgaHood ? [C.hood] : []
    }),
    pokemon(C.tapu, { types: ['Psychic'], abilities: ['Wonder Tag'] }),
    pokemon(C.trevenant, { types: ['Psychic'], abilities: [] })
  ];
  return {
    ownPublic: player({ active: ownActive, bench: ownBench, deckCount: 28 }),
    opponentPublic: player({
      active: opponentActive, bench: opponentBench, deckCount: 32
    })
  };
}

test('init is accepted by the actual Agent49 init validator and policy binds role-only empty config', () => {
  const init = protocol.validateInit(initMessage());
  assert.equal(Object.keys(init.config).length, 0);
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION,
    config: { rank: 7, sourceFingerprint: SOURCE_FINGERPRINT_SHA256,
      candidateFingerprint: CANDIDATE_FINGERPRINT_SHA256 }
  }), /AGENT43_RANK7_POLICY_INIT_MISMATCH/);
});

test('Faba-Jet-Wobbuffet precondition identifies the Hooded non-Psychic ability target', () => {
  const board = rank7Board();
  const view = observation({
    ownHand: [C.faba, C.jet, C.nest],
    ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources()
  });
  const target = source7FabaJetNestReady(view);
  assert.ok(target);
  assert.equal(target.pokemon.printing, C.radiant);
});

test('Faba root selects the unlock line ahead of pass when Radiant Eternatus is Hooded', () => {
  const board = rank7Board();
  const request = rootRequest({
    ownHand: [C.faba, C.jet, C.nest],
    ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources(),
    items: [
      { token: 'faba', kind: 'play-card', actorPrinting: C.faba,
        publicMetadata: { cardType: 'trainer', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'faba' });
});

test('Faba SelectPrompt chooses Tool rather than Stadium or Special Energy', () => {
  const request = promptRequest({
    promptType: 'SelectPrompt',
    source: actorChoiceSource(C.faba, 'Faba'),
    choices: [
      { token: 'stadium', kind: 'option', label: 'Stadium' },
      { token: 'tool', kind: 'option', label: 'Pokémon Tool' },
      { token: 'energy', kind: 'option', label: 'Special Energy' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'tool' });
});

test('Faba ChoosePokemonPrompt selects Hooded Radiant Eternatus, not Psychic Shadow Rider or abilityless Dialga', () => {
  const board = rank7Board({ dialgaHood: true });
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource(C.faba, 'Faba'),
    ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    choices: [
      pokemonChoice('shadow', C.shadow, 'opponent', 'active'),
      pokemonChoice('radiant', C.radiant, 'opponent', 'bench'),
      pokemonChoice('dialga', C.dialga, 'opponent', 'bench')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'radiant' });
});

test('Faba ignores Stealthy Hood on Psychic Shadow Rider because Wobbuffet does not suppress Psychic Abilities', () => {
  const board = rank7Board({
    opponentActive: pokemon(C.shadow, { types: ['Psychic'], abilities: ['Underworld Door'], tools: [C.hood] }),
    opponentBench: []
  });
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource(C.faba, 'Faba'),
    opponentPublic: board.opponentPublic,
    choices: [pokemonChoice('shadow', C.shadow, 'opponent', 'active')]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'abstain', reasonCode: 'FABA_HOODED_NON_PSYCHIC_ABILITY_TARGET_UNAVAILABLE' });
});

test('Faba ignores Hood on non-Psychic Pokémon with no Ability', () => {
  const board = rank7Board({
    opponentBench: [pokemon(C.dialga, { types: ['Dragon'], abilities: [], tools: [C.hood] })]
  });
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource(C.faba, 'Faba'),
    opponentPublic: board.opponentPublic,
    choices: [pokemonChoice('dialga', C.dialga, 'opponent', 'bench')]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'abstain', reasonCode: 'FABA_HOODED_NON_PSYCHIC_ABILITY_TARGET_UNAVAILABLE' });
});

test('Jet Energy promotes Wobbuffet after Faba removes Radiant Eternatus Hood', () => {
  const board = rank7Board({ radiantHood: false });
  const view = observation({
    ownHand: [C.jet], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources()
  });
  assert.equal(source7JetWobbuffetReady(view), true);
  const request = rootRequest({
    ownHand: [C.jet], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources(),
    items: [
      { token: 'jet', kind: 'play-card', actorPrinting: C.jet, targetPrinting: C.wobb,
        publicMetadata: { cardType: 'energy', handIndex: 0, ownerSeat: 'actor', targetZone: 'bench' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'jet' });
});

test('Jet Energy is blocked by Temple of Sinnoh', () => {
  const board = rank7Board({ radiantHood: false });
  board.ownPublic.stadium = [C.temple];
  const view = observation({
    ownHand: [C.jet], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources()
  });
  assert.equal(source7JetWobbuffetReady(view), false);
  const request = rootRequest({
    ownHand: [C.jet], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    items: [
      { token: 'jet', kind: 'play-card', actorPrinting: C.jet, targetPrinting: C.wobb },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Alolan Muk Power of Alchemy suppresses Basic Wobbuffet and blocks the Jet line', () => {
  const board = rank7Board({
    radiantHood: false,
    opponentBench: [
      pokemon(C.radiant, { types: ['Dragon'], abilities: ['Climactic Gate'] }),
      pokemon(C.muk, { types: ['Psychic'], abilities: ['Power of Alchemy'] })
    ]
  });
  const view = observation({
    ownHand: [C.jet], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources()
  });
  assert.equal(source7JetWobbuffetReady(view), false);
});

test('Wobbuffet is not prioritized when all opponent Ability targets are Psychic', () => {
  const board = rank7Board({
    opponentBench: [
      pokemon(C.tapu, { types: ['Psychic'], abilities: ['Wonder Tag'] }),
      pokemon(C.shadow, { types: ['Psychic'], abilities: ['Underworld Door'] })
    ]
  });
  const view = observation({
    ownHand: [C.jet], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources()
  });
  assert.equal(source7JetWobbuffetReady(view), false);
});

test('Snorlax Block opportunity cost prevents Wobbuffet promotion for a low-value non-Psychic Ability', () => {
  const board = rank7Board({
    opponentBench: [
      pokemon('Generic Ability Pokémon XY 1', { types: ['Colorless'], abilities: ['Minor Ability'] })
    ]
  });
  const view = observation({
    ownHand: [C.jet], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources()
  });
  assert.equal(source7JetWobbuffetReady(view), false);
});

test('Wobbuffet can outweigh Snorlax Block when an unprotected Radiant Eternatus is in play', () => {
  const board = rank7Board({ radiantHood: false });
  const view = observation({
    ownHand: [C.jet], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources()
  });
  assert.equal(source7JetWobbuffetReady(view), true);
});

test('Nest Ball is a normal legal Item in the rank-7 list; no Vileplume lock is fabricated', () => {
  const board = rank7Board();
  const view = observation({
    ownHand: [C.nest], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources()
  });
  assert.equal(source7NestReady(view), true);
  const request = rootRequest({
    ownHand: [C.nest], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources(),
    items: [
      { token: 'nest', kind: 'play-card', actorPrinting: C.nest },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'nest' });
});

test('Nest Ball respects an actual Item-play restriction from the validated actor projection', () => {
  const board = rank7Board();
  const request = rootRequest({
    ownHand: [C.nest], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources({ itemPlayLocked: true }),
    items: [
      { token: 'nest', kind: 'play-card', actorPrinting: C.nest },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Tool Jammer is prioritized only when the opponent Active Pokémon has a Tool', () => {
  const board = rank7Board({
    opponentActive: pokemon(C.shadow, {
      types: ['Psychic'], abilities: ['Underworld Door'], tools: [C.hood]
    })
  });
  const request = rootRequest({
    ownHand: [C.toolJammer], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    items: [
      { token: 'jammer', kind: 'play-card', actorPrinting: C.toolJammer, targetPrinting: C.snorlax },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'jammer' });
  const noActiveTool = rank7Board({ radiantHood: true });
  const blocked = rootRequest({
    ownHand: [C.toolJammer], ownPublic: noActiveTool.ownPublic,
    opponentPublic: noActiveTool.opponentPublic,
    items: [
      { token: 'jammer', kind: 'play-card', actorPrinting: C.toolJammer, targetPrinting: C.snorlax },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(blocked), { kind: 'select-action', token: 'pass' });
});

test('Palace Book draw-three/end-turn is a low-priority action with a small hand', () => {
  const board = rank7Board();
  const request = rootRequest({
    ownHand: [C.palace], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    ownTurnResources: turnResources(),
    items: [
      { token: 'palace', kind: 'play-card', actorPrinting: C.palace },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'palace' });
});

test('Palace Book yields to a scored Get Lost attack because it ends the turn', () => {
  const board = rank7Board({
    ownActive: pokemon(C.girafarig, { types: ['Psychic'] })
  });
  board.opponentPublic.discard = [C.vs];
  const request = rootRequest({
    ownHand: [C.palace], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    items: [
      { token: 'palace', kind: 'play-card', actorPrinting: C.palace },
      { token: 'get-lost', kind: 'attack', actorPrinting: C.girafarig, attackName: 'Get Lost' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'get-lost' });
});

test('Get Lost attack is preferred when opponent discard contains VS Seeker and Lusamine', () => {
  const board = rank7Board({
    ownActive: pokemon(C.girafarig, { types: ['Psychic'] })
  });
  board.opponentPublic.discard = [C.vs, C.lusamine];
  const request = rootRequest({
    ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    items: [
      { token: 'get-lost', kind: 'attack', actorPrinting: C.girafarig, attackName: 'Get Lost' },
      { token: 'mind-shock', kind: 'attack', actorPrinting: C.girafarig, attackName: 'Mind Shock' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'get-lost' });
});

test('Get Lost target prompt selects VS Seeker ahead of lower-value discard cards', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource(C.girafarig, 'Get Lost'),
    publicMetadata: multiMeta(1, 1),
    choices: [
      cardChoice('vs', C.vs, 'opponent', 'discard'),
      cardChoice('lusamine', C.lusamine, 'opponent', 'discard'),
      cardChoice('basic', 'Basic Water Energy MEE 11', 'opponent', 'discard')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['vs'] });
});

test('unknown prompt family fails closed', () => {
  const request = promptRequest({
    promptType: 'NightWatchPhysicalPrompt',
    source: actorChoiceSource('Unknown Source XY 999', 'Unmapped effect'),
    choices: [{ token: 'x', kind: 'option', label: 'Unknown' }]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' });
});

test('worker request validator rejects injected opponent-private information', () => {
  const request = rootRequest();
  request.observation.opponentPrivate = { hand: [C.faba] };
  assert.throws(() => checkedDecision(request), /UNKNOWN_FIELD/);
});

test('same actor request is deterministic across repeated decisions', () => {
  const board = rank7Board({ radiantHood: false });
  const request = rootRequest({
    ownHand: [C.jet], ownPublic: board.ownPublic, opponentPublic: board.opponentPublic,
    items: [
      { token: 'jet', kind: 'play-card', actorPrinting: C.jet, targetPrinting: C.wobb },
      { token: 'pass', kind: 'pass' }
    ]
  });
  const first = checkedDecision(request);
  const second = checkedDecision(request);
  assert.deepEqual(first, second);
});

test('policy is seat-symmetric and accepts seat 1 requests', () => {
  const board = rank7Board({ radiantHood: false });
  const request = rootRequest({
    seat: 1, ownHand: [C.jet], ownPublic: board.ownPublic,
    opponentPublic: board.opponentPublic,
    items: [
      { token: 'jet', kind: 'play-card', actorPrinting: C.jet, targetPrinting: C.wobb },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'jet' });
});

