'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const {
  POLICY_VERSION,
  createPolicy
} = require('../../simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs');

const config = {
  rank: 3,
  sourceFingerprint: '0a2cf5a36c4a8b813cf8e1b8889893356427ac33cd5fa73a576a35590c3da368',
  candidateFingerprint: '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4'
};

function makePolicy(seat = 0) {
  return createPolicy({
    role: 'opponent',
    seat,
    policyVersion: POLICY_VERSION,
    config
  });
}

function restrictions() {
  return {
    cannotAttackNextTurn: false,
    cannotUseAttacksNextTurn: [],
    blockedAttackNameNextTurn: null,
    blockedAttackNameUntilLeavesActive: null,
    onlyAllowedAttackNameNextTurn: null,
    attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0,
    cannotRetreat: false,
    cannotRetreatNextTurn: false,
    cannotRetreatWhileActive: false,
    cannotEvolveNextTurn: false
  };
}

function publicRestrictions() {
  return {
    gxUsed: false,
    vstarUsed: false,
    attackLockTurnsRemaining: 0,
    attackMaxEnergy: null,
    attackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [],
    ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false,
    pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false,
    evolutionPlayLocked: false,
    itemPlayLocked: false,
    supporterPlayLocked: false,
    stadiumPlayLocked: false,
    toolPlayLocked: false,
    energyPlayLocked: false,
    specialEnergyPlayLocked: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: null
  };
}

function pokemon(printing, options = {}) {
  const abilities = options.abilities ?? [];
  return {
    printing,
    name: options.name ?? printing.split(' ').slice(0, -2).join(' '),
    hp: options.hp ?? 150,
    damage: options.damage ?? 0,
    lastPlayedOrEvolvedTurn: options.lastPlayedOrEvolvedTurn ?? 1,
    printed: {
      stage: options.stage ?? 'BASIC',
      subtypes: options.subtypes ?? ['Basic'],
      types: options.types ?? ['Colorless'],
      retreatCost: options.retreatCost ?? [],
      weakness: options.weakness ?? [],
      resistance: options.resistance ?? []
    },
    specialConditions: [],
    publicRestrictions: restrictions(),
    evolutionPrintings: options.evolutionPrintings ?? [],
    energies: options.energies ?? [],
    tools: options.tools ?? [],
    attacks: options.attacks ?? [],
    abilities,
    abilityDetails: abilities.map(name => ({
      name,
      powerType: 'ABILITY',
      text: 'Once during your turn.'
    })),
    abilitySuppressions: null
  };
}

function player(options = {}) {
  const bench = (options.bench ?? []).slice(0, 5);
  while (bench.length < 5) bench.push(null);
  return {
    active: options.active ?? null,
    bench,
    stadium: options.stadium ?? [],
    discard: options.discard ?? [],
    lostZone: options.lostZone ?? [],
    resolvingSupporter: [],
    publicHand: options.publicHand ?? null,
    prizeSlots: options.prizeSlots ?? [],
    publicTurnRestrictions: {
      ...publicRestrictions(),
      ...(options.publicTurnRestrictions ?? {})
    },
    handCount: options.handCount ?? 0,
    deckCount: options.deckCount ?? 30,
    prizeCount: options.prizeCount ?? 6
  };
}

function turnResources(options = {}) {
  return {
    supporterPlayedTurn: 0,
    retreatedTurn: 0,
    extraTurnActive: false,
    energyPlayedTurn: false,
    stadiumPlayedTurn: false,
    stadiumUsedTurn: false,
    vstarUsed: false,
    pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false,
    evolutionPlayLocked: false,
    itemPlayLocked: false,
    supporterPlayLocked: false,
    stadiumPlayLocked: false,
    toolPlayLocked: false,
    energyPlayLocked: false,
    specialEnergyPlayLocked: false,
    ...options
  };
}

function observation(options = {}) {
  return {
    actorSeat: options.actorSeat ?? 0,
    globalTurn: options.globalTurn ?? 3,
    phase: 2,
    decisionKind: options.prompt ? 'owner-prompt' : 'owner-root',
    pendingPromptType: options.prompt?.promptType ?? null,
    pendingOwnerDeckSearch: false,
    ownHand: options.ownHand ?? [],
    ownPublic: options.ownPublic ?? player(),
    opponentPublic: options.opponentPublic ?? player(),
    ownTurnResources: options.ownTurnResources ?? turnResources(),
    ownerK1: null
  };
}

function rootRequest(options = {}) {
  const seat = options.seat ?? 0;
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: options.requestId ?? 'agent17-root-1',
    sequence: options.sequence ?? 1,
    role: 'opponent',
    seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation({ ...options, actorSeat: seat }),
    prompt: null,
    publicEventReceipt: null,
    actionFrontier: {
      schema: protocol.FRONTIER_SCHEMA,
      items: options.items ?? [{ token: 'pass', kind: 'pass', label: 'Pass turn' }]
    }
  };
}

function actorChoiceSource(sourcePrinting, effectName) {
  return {
    classification: 'actor-choice',
    sourceKind: sourcePrinting === null ? 'engine' : 'card-effect',
    sourcePrinting,
    effectName
  };
}

function promptRequest(options = {}) {
  const seat = options.seat ?? 0;
  const prompt = {
    schema: protocol.PROMPT_SCHEMA,
    actingSeat: seat,
    promptType: options.promptType,
    description: options.description ?? 'Choose a legal option',
    source: options.source,
    choices: options.choices ?? [],
    ...(options.publicMetadata ? { publicMetadata: options.publicMetadata } : {})
  };
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: options.requestId ?? 'agent17-prompt-1',
    sequence: options.sequence ?? 1,
    role: 'opponent',
    seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation({
      ...(options.observation ?? {}),
      actorSeat: seat,
      prompt
    }),
    prompt,
    publicEventReceipt: null,
    actionFrontier: {
      schema: protocol.FRONTIER_SCHEMA,
      items: []
    }
  };
}

function checkedDecision(request, seat = 0) {
  const init = {
    schema: protocol.INIT_SCHEMA,
    type: 'init',
    role: 'opponent',
    seat,
    policyVersion: POLICY_VERSION,
    bundleSha256: 'a'.repeat(64),
    config
  };
  const validated = protocol.validateRequest(request, init, request.sequence, new Set());
  const decision = makePolicy(seat).decide(request);
  protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  return decision;
}

function cardChoice(token, printing, zone = 'deck', owner = 'actor', kind = 'card') {
  return {
    token,
    kind,
    printing,
    label: printing,
    publicMetadata: { sourceZone: zone, ownerSeat: owner }
  };
}

function pokemonChoice(token, printing, owner = 'actor', zone = 'bench', index = 0) {
  return {
    token,
    kind: 'pokemon',
    printing,
    label: printing,
    publicMetadata: {
      selectionIndex: index,
      selectedCount: 0,
      selectionType: 'pokemon',
      ownerSeat: owner,
      targetZone: zone,
      isOwnerVisible: true
    }
  };
}

function multiMetadata(minimumCount, maximumCount) {
  return {
    selectionType: 'card-combination',
    minimumCount,
    maximumCount,
    allowCancel: false,
    isSecret: false
  };
}

test('policy initialization is bound to the opponent role, rank 3 and exact source/candidate fingerprints', () => {
  assert.throws(() => createPolicy({
    role: 'candidate', seat: 0, policyVersion: POLICY_VERSION, config
  }), /AGENT17_RANK3_POLICY_INIT_MISMATCH/);
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION,
    config: { ...config, rank: 2 }
  }), /AGENT17_RANK3_POLICY_INIT_MISMATCH/);
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION,
    config: { ...config, candidateFingerprint: '0'.repeat(64) }
  }), /AGENT17_RANK3_POLICY_INIT_MISMATCH/);
});

test('Tool Jammer is attached to Snorlax rather than spent on an unrelated target', () => {
  const request = rootRequest({
    ownHand: ['Tool Jammer BST 136'],
    ownPublic: player({ active: pokemon('Snorlax PGO 55') }),
    items: [
      {
        token: 'jam-snorlax', kind: 'play-card',
        actorPrinting: 'Tool Jammer BST 136', targetPrinting: 'Snorlax PGO 55',
        publicMetadata: { cardType: 'trainer', handIndex: 0 }
      },
      {
        token: 'jam-bunnelby', kind: 'play-card',
        actorPrinting: 'Tool Jammer BST 136', targetPrinting: 'Bunnelby PRC 121',
        publicMetadata: { cardType: 'trainer', handIndex: 0 }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'jam-snorlax'
  });
});

test('Bunnelby Burrow is preferred when the opponent deck is near exhaustion', () => {
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Bunnelby PRC 121') }),
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320 }),
      deckCount: 7
    }),
    items: [
      { token: 'burrow', kind: 'attack', actorPrinting: 'Bunnelby PRC 121', attackName: 'Burrow' },
      { token: 'collapse', kind: 'attack', actorPrinting: 'Snorlax PGO 55', attackName: 'Collapse' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'burrow'
  });
});

test('Cold Crush-GX is reserved unless the opponent Active has substantial Energy and own Active has little', () => {
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Snorlax PGO 55') }),
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        energies: ['Psychic Energy', 'Psychic Energy']
      })
    }),
    items: [
      { token: 'cold-crush', kind: 'attack', actorPrinting: 'Articuno-GX CES 31', attackName: 'Cold Crush-GX' },
      { token: 'burrow', kind: 'attack', actorPrinting: 'Bunnelby PRC 121', attackName: 'Burrow' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'cold-crush'
  });
});

test('Faba removes a visible opponent Stealthy Hood before lower-value tool targets', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Faba LOT 173', 'Faba'),
    choices: [
      cardChoice('float', 'Float Stone BKT 137', 'attached', 'opponent'),
      cardChoice('hood', 'Stealthy Hood UNB 186', 'attached', 'opponent'),
      cardChoice('seal', 'Forest Seal Stone SIT 156', 'attached', 'opponent')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'hood'
  });
});

test('Arven selects one Item and one Tool from the exact rank-3 deck-search choices', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Arven OBF 186', 'Arven'),
    choices: [
      cardChoice('nest', 'Nest Ball SVI 181'),
      cardChoice('seeker', 'VS Seeker PHF 109'),
      cardChoice('jammer', 'Tool Jammer BST 136'),
      cardChoice('float', 'Float Stone BKT 137')
    ],
    publicMetadata: multiMetadata(2, 2)
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['nest', 'jammer']
  });
});

test('Plumeria pays its two-card cost with low-value cards while preserving the unique lock and recovery pieces', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Plumeria BUS 120', 'Plumeria'),
    choices: [
      cardChoice('jammer', 'Tool Jammer BST 136', 'hand'),
      cardChoice('faba', 'Faba LOT 173', 'hand'),
      cardChoice('nest', 'Nest Ball SVI 181', 'hand'),
      cardChoice('water', 'Water Energy MEE 11', 'hand')
    ],
    publicMetadata: multiMetadata(2, 2)
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['nest', 'water']
  });
});

test('Eri can discard Field Blower and dual-subtype Forest Seal Stone, but not tool-only Hood', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Eri TEF 146', 'Eri'),
    choices: [
      cardChoice('field-blower', 'Field Blower GRI 125', 'hand', 'opponent'),
      cardChoice('seal', 'Forest Seal Stone SIT 156', 'hand', 'opponent'),
      cardChoice('hood', 'Stealthy Hood UNB 186', 'hand', 'opponent'),
      { token: 'empty', kind: 'empty-selection', label: 'Select no cards' }
    ],
    publicMetadata: multiMetadata(0, 2)
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['field-blower', 'seal']
  });
});

test('rank-3 Get Lost prompt prioritizes opponent recovery cards in the discard pile', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Girafarig LOT 94', 'Get Lost'),
    choices: [
      cardChoice('switch', 'Switch SVI 194', 'discard', 'opponent'),
      cardChoice('seeker', 'VS Seeker PHF 109', 'discard', 'opponent'),
      cardChoice('stretcher', 'Night Stretcher ASC 196', 'discard', 'opponent'),
      { token: 'empty', kind: 'empty-selection', label: 'Select no cards' }
    ],
    publicMetadata: multiMetadata(0, 2)
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['seeker', 'stretcher']
  });
});

test('Guzma first chooses an opponent Bench target and then promotes the Snorlax lock', () => {
  const opponentTarget = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Guzma BUS 115', 'Guzma'),
    observation: {
      opponentPublic: player({
        bench: [
          pokemon('Crobat V DAA 104', { energies: ['Psychic Energy'], retreatCost: ['Colorless'] }),
          pokemon('Shadow Rider Calyrex VMAX CRE 75', {
            energies: ['Psychic Energy', 'Psychic Energy'],
            retreatCost: ['Colorless', 'Colorless']
          })
        ]
      })
    },
    choices: [
      pokemonChoice('crobat', 'Crobat V DAA 104', 'opponent', 'bench', 0),
      pokemonChoice('rider', 'Shadow Rider Calyrex VMAX CRE 75', 'opponent', 'bench', 1)
    ]
  });
  assert.deepEqual(checkedDecision(opponentTarget), {
    kind: 'select-choice', token: 'rider'
  });

  const ownSwitch = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Guzma BUS 115', 'Guzma'),
    observation: {
      ownPublic: player({
        active: pokemon('Bunnelby PRC 121'),
        bench: [
          pokemon('Snorlax PGO 55', { tools: ['Tool Jammer BST 136'] }),
          pokemon('Rotom V LOR 58')
        ]
      })
    },
    choices: [
      pokemonChoice('rotom', 'Rotom V LOR 58', 'actor', 'bench', 0),
      pokemonChoice('snorlax', 'Snorlax PGO 55', 'actor', 'bench', 1)
    ]
  });
  assert.deepEqual(checkedDecision(ownSwitch), {
    kind: 'select-choice', token: 'snorlax'
  });
});

test('Player’s Ceremony remains explicitly blocked until its research-owned engine hook exists', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource("Player's Ceremony SP 127", "Player's Ceremony"),
    choices: [cardChoice('choice', 'Tropical Beach BWP 50')]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'PLAYERS_CEREMONY_ENGINE_HOOK_BLOCKED'
  });
});

test('unsupported native prompt families fail closed rather than selecting a fallback', () => {
  const request = promptRequest({
    promptType: 'UnknownNativePrompt',
    source: actorChoiceSource('Unknown source', 'Unknown effect'),
    choices: [cardChoice('choice', 'Tool Jammer BST 136')]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE'
  });
});

test('the same source-bound policy behaves identically at physical seat 1', () => {
  const request = rootRequest({
    seat: 1,
    ownPublic: player({ active: pokemon('Snorlax PGO 55') }),
    ownHand: ['Tool Jammer BST 136'],
    items: [
      {
        token: 'jammer', kind: 'play-card',
        actorPrinting: 'Tool Jammer BST 136', targetPrinting: 'Snorlax PGO 55',
        publicMetadata: { cardType: 'trainer', handIndex: 0 }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request, 1), {
    kind: 'select-action', token: 'jammer'
  });
});

test('a repeated identical actor request produces the same deterministic decision', () => {
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Bunnelby PRC 121') }),
    opponentPublic: player({ deckCount: 9 }),
    items: [
      { token: 'burrow', kind: 'attack', actorPrinting: 'Bunnelby PRC 121', attackName: 'Burrow' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), checkedDecision(request));
});

test('no supported positive action falls back only to a real pass token', () => {
  const request = rootRequest({
    items: [{ token: 'pass', kind: 'pass', label: 'Pass turn' }]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'pass'
  });
});

test('the real worker request validator rejects a forbidden seed field', () => {
  const request = rootRequest();
  request.observation.seed = 12345;
  const init = {
    schema: protocol.INIT_SCHEMA,
    type: 'init',
    role: 'opponent',
    seat: 0,
    policyVersion: POLICY_VERSION,
    bundleSha256: 'a'.repeat(64),
    config
  };
  assert.throws(() => protocol.validateRequest(
    request, init, request.sequence, new Set()
  ));
});

test('the real worker decision validator rejects an unknown action token', () => {
  const request = rootRequest({
    items: [{ token: 'pass', kind: 'pass' }]
  });
  const init = {
    schema: protocol.INIT_SCHEMA,
    type: 'init',
    role: 'opponent',
    seat: 0,
    policyVersion: POLICY_VERSION,
    bundleSha256: 'a'.repeat(64),
    config
  };
  const validated = protocol.validateRequest(request, init, request.sequence, new Set());
  assert.throws(() => protocol.validateDecision(
    { kind: 'select-action', token: 'not-in-frontier' },
    validated.prompt,
    validated.actionTokens
  ), /POLICY_SELECTED_UNKNOWN_ACTION/);
});


test('Team Flare Grunt chooses only the opponent Active for its Active-only Energy discard', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Team Flare Grunt XY 129', 'Team Flare Grunt'),
    observation: {
      opponentPublic: player({
        active: pokemon('Shadow Rider Calyrex V CRE 74', {
          energies: ['Psychic Energy']
        }),
        bench: [
          pokemon('Shadow Rider Calyrex VMAX CRE 75', {
            energies: ['Psychic Energy', 'Psychic Energy', 'Psychic Energy']
          })
        ]
      })
    },
    choices: [
      pokemonChoice('active', 'Shadow Rider Calyrex V CRE 74', 'opponent', 'active', 0),
      pokemonChoice('bench', 'Shadow Rider Calyrex VMAX CRE 75', 'opponent', 'bench', 1)
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'active'
  });
});

test('Regirock Land Maker recovers the two useful Stadiums and excludes unsupported Player’s Ceremony', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Regirock XYP 49', 'Land Maker'),
    choices: [
      cardChoice('beach', 'Tropical Beach BWP 50', 'discard'),
      cardChoice('temple', 'Temple of Sinnoh ASR 155', 'discard'),
      cardChoice('ceremony', "Player's Ceremony SP 127", 'discard'),
      { token: 'empty', kind: 'empty-selection', label: 'Select no cards' }
    ],
    publicMetadata: multiMetadata(0, 2)
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['beach', 'temple']
  });
});

test('Quick Ball discards expendable cards before the unique Tool Jammer or Faba', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Quick Ball FST 237', 'Quick Ball'),
    choices: [
      cardChoice('jammer', 'Tool Jammer BST 136', 'hand'),
      cardChoice('faba', 'Faba LOT 173', 'hand'),
      cardChoice('nest', 'Nest Ball SVI 181', 'hand'),
      cardChoice('water', 'Water Energy MEE 11', 'hand')
    ],
    publicMetadata: multiMetadata(1, 1)
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['nest']
  });
});

test('Tropical Beach is used as a turn-ending draw only with a meaningful hand refill', () => {
  const request = rootRequest({
    ownHand: ['Arven OBF 186', 'Nest Ball SVI 181', 'Water Energy MEE 11', 'Faba LOT 173'],
    ownPublic: player({ active: pokemon('Snorlax PGO 55'), deckCount: 18 }),
    items: [
      {
        token: 'beach-use', kind: 'use-stadium',
        publicMetadata: { stadiumPrinting: 'Tropical Beach BWP 50' }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'beach-use'
  });
});

test('Lusamine retrieves Faba and Team Rocket’s Handiwork before a low-value Stadium', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Lusamine CIN 96', 'Lusamine'),
    choices: [
      cardChoice('beach', 'Tropical Beach BWP 50', 'discard'),
      cardChoice('faba', 'Faba LOT 173', 'discard'),
      cardChoice('handiwork', "Team Rocket's Handiwork FCO 112", 'discard'),
      cardChoice('nest', 'Nest Ball SVI 181', 'discard')
    ],
    publicMetadata: multiMetadata(2, 2)
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['faba', 'handiwork']
  });
});

test('Counter Catcher targets the opponent Bench Pokémon with the greatest public Energy and retreat burden', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Counter Catcher PAR 160', 'Counter Catcher'),
    observation: {
      opponentPublic: player({
        bench: [
          pokemon('Crobat V DAA 104', { energies: ['Psychic Energy'], retreatCost: ['Colorless'] }),
          pokemon('Shadow Rider Calyrex VMAX CRE 75', {
            energies: ['Psychic Energy', 'Psychic Energy'],
            retreatCost: ['Colorless', 'Colorless']
          })
        ]
      })
    },
    choices: [
      pokemonChoice('crobat', 'Crobat V DAA 104', 'opponent', 'bench', 0),
      pokemonChoice('rider', 'Shadow Rider Calyrex VMAX CRE 75', 'opponent', 'bench', 1)
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'rider'
  });
});

test('Night Stretcher recovers a missing core Pokémon over a basic Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Night Stretcher ASC 196', 'Night Stretcher'),
    choices: [
      cardChoice('water', 'Water Energy MEE 11', 'discard'),
      cardChoice('bunnelby', 'Bunnelby PRC 121', 'discard')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'bunnelby'
  });
});

test('Enhanced Hammer selects a Special Energy rather than a Basic Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseEnergyPrompt',
    source: actorChoiceSource('Enhanced Hammer TWM 148', 'Enhanced Hammer'),
    choices: [
      cardChoice('basic', 'Psychic Energy', 'attached', 'opponent', 'energy'),
      cardChoice('special', 'Double Dragon Energy ROS 97', 'attached', 'opponent', 'energy')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'special'
  });
});


test('Eri is considered from public hand count without reading the hidden opponent hand', () => {
  const request = rootRequest({
    ownHand: ['Eri TEF 146'],
    ownPublic: player({ active: pokemon('Snorlax PGO 55') }),
    opponentPublic: player({ handCount: 5, publicHand: null }),
    items: [
      {
        token: 'eri', kind: 'play-card', actorPrinting: 'Eri TEF 146',
        publicMetadata: { cardType: 'trainer', handIndex: 0 }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'eri'
  });
});

test('Eri prioritizes Field Blower and Unfair Stamp among the exact candidate Item pool', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Eri TEF 146', 'Eri'),
    choices: [
      cardChoice('hood', 'Stealthy Hood UNB 186', 'hand', 'opponent'),
      cardChoice('float', 'Float Stone BKT 137', 'hand', 'opponent'),
      cardChoice('fog', 'Fog Crystal CRE 140', 'hand', 'opponent'),
      cardChoice('treasure', 'Mysterious Treasure FLI 113', 'hand', 'opponent'),
      cardChoice('stamp', 'Unfair Stamp TWM 165', 'hand', 'opponent'),
      cardChoice('field', 'Field Blower GRI 125', 'hand', 'opponent'),
      { token: 'empty', kind: 'empty-selection', label: 'Select no cards' }
    ],
    publicMetadata: multiMetadata(0, 2)
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['field', 'stamp']
  });
});


test('Water Energy is allocated to Articuno when it enables the Cold Crush-GX response', () => {
  const request = rootRequest({
    ownHand: ['Water Energy MEE 11'],
    ownPublic: player({
      active: pokemon('Snorlax PGO 55'),
      bench: [
        pokemon('Articuno-GX CES 31'),
        pokemon('Bunnelby PRC 121')
      ]
    }),
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        energies: ['Psychic Energy', 'Psychic Energy']
      })
    }),
    items: [
      {
        token: 'water-articuno', kind: 'play-card',
        actorPrinting: 'Water Energy MEE 11', targetPrinting: 'Articuno-GX CES 31',
        publicMetadata: { cardType: 'energy', handIndex: 0 }
      },
      {
        token: 'water-bunnelby', kind: 'play-card',
        actorPrinting: 'Water Energy MEE 11', targetPrinting: 'Bunnelby PRC 121',
        publicMetadata: { cardType: 'energy', handIndex: 0 }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'water-articuno'
  });
});

test('Capture Energy is attached to Bunnelby to enable Burrow and its Basic search', () => {
  const request = rootRequest({
    ownHand: ['Capture Energy RCL 171'],
    ownPublic: player({
      active: pokemon('Snorlax PGO 55'),
      bench: [pokemon('Bunnelby PRC 121')]
    }),
    items: [
      {
        token: 'capture-bunnelby', kind: 'play-card',
        actorPrinting: 'Capture Energy RCL 171', targetPrinting: 'Bunnelby PRC 121',
        publicMetadata: { cardType: 'energy', handIndex: 0 }
      },
      {
        token: 'capture-snorlax', kind: 'play-card',
        actorPrinting: 'Capture Energy RCL 171', targetPrinting: 'Snorlax PGO 55',
        publicMetadata: { cardType: 'energy', handIndex: 0 }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'capture-bunnelby'
  });
});

test('Arven uses dual-subtype Forest Seal Stone as its Item and a distinct Tool Jammer as its Tool', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Arven OBF 186', 'Arven'),
    observation: {
      ownPublic: player({
        active: pokemon('Snorlax PGO 55'),
        bench: [pokemon('Rotom V LOR 58')]
      })
    },
    choices: [
      cardChoice('seal', 'Forest Seal Stone SIT 156'),
      cardChoice('nest', 'Nest Ball SVI 181'),
      cardChoice('jammer', 'Tool Jammer BST 136')
    ],
    publicMetadata: multiMetadata(2, 2)
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['seal', 'jammer']
  });
});

test('Forest Seal Stone Star Alchemy searches for Tool Jammer when the Snorlax lock is not established', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Forest Seal Stone SIT 156', 'Star Alchemy'),
    choices: [
      cardChoice('beach', 'Tropical Beach BWP 50'),
      cardChoice('faba', 'Faba LOT 173'),
      cardChoice('jammer', 'Tool Jammer BST 136')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'jammer'
  });
});

test('Guzma does not abandon an established Snorlax Active lock without a replacement Snorlax', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Snorlax PGO 55'),
      bench: [pokemon('Bunnelby PRC 121')]
    }),
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        energies: ['Psychic Energy', 'Psychic Energy']
      })
    }),
    ownHand: ['Guzma BUS 115'],
    items: [
      {
        token: 'guzma', kind: 'play-card', actorPrinting: 'Guzma BUS 115',
        publicMetadata: { cardType: 'trainer', handIndex: 0 }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'pass'
  });
});


test('Forest Seal Stone is attached to Rotom V to enable Star Alchemy', () => {
  const request = rootRequest({
    ownHand: ['Forest Seal Stone SIT 156'],
    ownPublic: player({
      active: pokemon('Snorlax PGO 55'),
      bench: [pokemon('Rotom V LOR 58')]
    }),
    items: [
      {
        token: 'seal-rotom', kind: 'play-card',
        actorPrinting: 'Forest Seal Stone SIT 156', targetPrinting: 'Rotom V LOR 58',
        publicMetadata: { cardType: 'trainer', handIndex: 0 }
      },
      {
        token: 'seal-snorlax', kind: 'play-card',
        actorPrinting: 'Forest Seal Stone SIT 156', targetPrinting: 'Snorlax PGO 55',
        publicMetadata: { cardType: 'trainer', handIndex: 0 }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'seal-rotom'
  });
});


test('Star Alchemy cannot be invoked from an unrelated Pokémon source', () => {
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Snorlax PGO 55') }),
    items: [
      {
        token: 'wrong-source', kind: 'use-ability',
        actorPrinting: 'Snorlax PGO 55',
        publicMetadata: { abilityName: 'Star Alchemy' }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'pass'
  });
});

test('an Energy attachment to a Pokémon absent from the actor-visible board is not selected', () => {
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Snorlax PGO 55') }),
    ownHand: ['Water Energy MEE 11'],
    items: [
      {
        token: 'unpayable-target', kind: 'play-card',
        actorPrinting: 'Water Energy MEE 11', targetPrinting: 'Bunnelby PRC 121',
        publicMetadata: { cardType: 'energy', handIndex: 0 }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'pass'
  });
});

test('the real worker decision validator rejects an unknown prompt-choice token', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Faba LOT 173', 'Faba'),
    choices: [cardChoice('hood', 'Stealthy Hood UNB 186', 'attached', 'opponent')]
  });
  const init = {
    schema: protocol.INIT_SCHEMA,
    type: 'init',
    role: 'opponent',
    seat: 0,
    policyVersion: POLICY_VERSION,
    bundleSha256: 'a'.repeat(64),
    config
  };
  const validated = protocol.validateRequest(request, init, request.sequence, new Set());
  assert.throws(() => protocol.validateDecision(
    { kind: 'select-choice', token: 'not-in-prompt' },
    validated.prompt,
    validated.actionTokens
  ), /POLICY_SELECTED_UNKNOWN_CHOICE/);
});


test('Rotom V Instant Charge is used for its three-card refill when Beach is not active', () => {
  const request = rootRequest({
    ownHand: ['Arven OBF 186', 'Nest Ball SVI 181', 'Water Energy MEE 11', 'Faba LOT 173'],
    ownPublic: player({ active: pokemon('Snorlax PGO 55'), bench: [pokemon('Rotom V LOR 58')], deckCount: 18 }),
    items: [
      {
        token: 'instant-charge', kind: 'use-ability',
        actorPrinting: 'Rotom V LOR 58',
        publicMetadata: { abilityName: 'Instant Charge' }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'instant-charge'
  });
});

test('Forest Seal Stone Star Alchemy is activated only from its own attached Tool source', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Snorlax PGO 55'),
      bench: [pokemon('Rotom V LOR 58', { tools: ['Forest Seal Stone SIT 156'] })]
    }),
    items: [
      {
        token: 'star-alchemy', kind: 'use-ability',
        actorPrinting: 'Forest Seal Stone SIT 156',
        publicMetadata: { abilityName: 'Star Alchemy' }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'star-alchemy'
  });
});

test('Mimikyu is prioritized as a defensive Basic against the candidate Pokémon V board', () => {
  const request = rootRequest({
    ownHand: ['Mimikyu PAL 97'],
    ownPublic: player({ active: pokemon('Snorlax PGO 55') }),
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75')
    }),
    items: [
      {
        token: 'mimikyu', kind: 'play-card',
        actorPrinting: 'Mimikyu PAL 97',
        publicMetadata: { cardType: 'pokemon', handIndex: 0 }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'mimikyu'
  });
});


test('Teammates searches for Tool Jammer and Faba when Snorlax is already active', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Teammates PRC 141', 'Teammates'),
    observation: {
      ownPublic: player({ active: pokemon('Snorlax PGO 55') })
    },
    choices: [
      cardChoice('jammer', 'Tool Jammer BST 136'),
      cardChoice('faba', 'Faba LOT 173'),
      cardChoice('nest', 'Nest Ball SVI 181'),
      cardChoice('snorlax', 'Snorlax PGO 55')
    ],
    publicMetadata: multiMetadata(2, 2)
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['jammer', 'faba']
  });
});

test('VS Seeker recovers Faba ahead of lower-impact Supporters', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('VS Seeker PHF 109', 'VS Seeker'),
    choices: [
      cardChoice('lillie', "Lillie's Determination MEG 119", 'discard'),
      cardChoice('plumeria', 'Plumeria BUS 120', 'discard'),
      cardChoice('faba', 'Faba LOT 173', 'discard')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'faba'
  });
});

test('Trainers’ Mail searches for Faba ahead of lower-priority Item and Tool options', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource("Trainers' Mail ROS 92", "Trainers' Mail"),
    choices: [
      cardChoice('nest', 'Nest Ball SVI 181'),
      cardChoice('jammer', 'Tool Jammer BST 136'),
      cardChoice('faba', 'Faba LOT 173')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'faba'
  });
});

test('Penny picks up the most damaged legal Basic Pokémon without lifting Active Snorlax', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Penny SVI 183', 'Penny'),
    observation: {
      ownPublic: player({
        active: pokemon('Snorlax PGO 55', { damage: 80 }),
        bench: [
          pokemon('Bunnelby PRC 121', { damage: 70 }),
          pokemon('Rotom V LOR 58', { damage: 20 })
        ]
      })
    },
    choices: [
      pokemonChoice('snorlax', 'Snorlax PGO 55', 'actor', 'active', 0),
      pokemonChoice('bunnelby', 'Bunnelby PRC 121', 'actor', 'bench', 1),
      pokemonChoice('rotom', 'Rotom V LOR 58', 'actor', 'bench', 2)
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'bunnelby'
  });
});

test('Scoop Up Cyclone chooses a damaged benched Pokémon and preserves Active Snorlax', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Scoop Up Cyclone TWM 162', 'Scoop Up Cyclone'),
    observation: {
      ownPublic: player({
        active: pokemon('Snorlax PGO 55', { damage: 80 }),
        bench: [
          pokemon('Bunnelby PRC 121', { damage: 30 }),
          pokemon('Rotom V LOR 58', { damage: 80, energies: ['Psychic Energy'] })
        ]
      })
    },
    choices: [
      pokemonChoice('snorlax', 'Snorlax PGO 55', 'actor', 'active', 0),
      pokemonChoice('bunnelby', 'Bunnelby PRC 121', 'actor', 'bench', 1),
      pokemonChoice('rotom', 'Rotom V LOR 58', 'actor', 'bench', 2)
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'rotom'
  });
});


test('Legendary Ascent selects every actor-owned Water Energy up to the prompt payment count', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Articuno-GX CES 31', 'Legendary Ascent'),
    publicMetadata: {
      selectionType: 'energy-payment',
      energyCount: 2,
      allowCancel: false,
      isSecret: false
    },
    choices: [
      {
        token: 'water-bunnelby', kind: 'energy',
        printing: 'Water Energy MEE 11', label: 'Water Energy MEE 11',
        publicMetadata: { sourceZone: 'attached-energy', ownerSeat: 'actor', isOwnerVisible: true }
      },
      {
        token: 'capture-bunnelby', kind: 'energy',
        printing: 'Capture Energy RCL 171', label: 'Capture Energy RCL 171',
        publicMetadata: { sourceZone: 'attached-energy', ownerSeat: 'actor', isOwnerVisible: true }
      },
      {
        token: 'water-girafarig', kind: 'energy',
        printing: 'Water Energy MEE 11', label: 'Water Energy MEE 11',
        publicMetadata: { sourceZone: 'attached-energy', ownerSeat: 'actor', isOwnerVisible: true }
      },
      {
        token: 'opponent-water', kind: 'energy',
        printing: 'Water Energy MEE 11', label: 'Water Energy MEE 11',
        publicMetadata: { sourceZone: 'attached-energy', ownerSeat: 'opponent', isOwnerVisible: true }
      }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['water-bunnelby', 'water-girafarig']
  });
});

test('Gladion selects a high-value Pokémon only when its Prize identity is actor-visible', () => {
  const request = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource('Gladion BUS 127', 'Gladion'),
    choices: [
      {
        token: 'nest', kind: 'prize', printing: 'Nest Ball SVI 181', label: 'Nest Ball',
        publicMetadata: { sourceZone: 'prizes', ownerSeat: 'actor', isOwnerVisible: true }
      },
      {
        token: 'snorlax', kind: 'prize', printing: 'Snorlax PGO 55', label: 'Snorlax',
        publicMetadata: { sourceZone: 'prizes', ownerSeat: 'actor', isOwnerVisible: true }
      }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice', token: 'snorlax'
  });
});

test('Hisuian Heavy Ball abstains when Prize identities are concealed', () => {
  const request = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource('Hisuian Heavy Ball ASR 146', 'Hisuian Heavy Ball'),
    choices: [
      {
        token: 'prize-1', kind: 'prize', label: 'Face-down Prize 1',
        publicMetadata: { sourceZone: 'prizes', ownerSeat: 'actor', isOwnerVisible: false }
      },
      {
        token: 'prize-2', kind: 'prize', label: 'Face-down Prize 2',
        publicMetadata: { sourceZone: 'prizes', ownerSeat: 'actor', isOwnerVisible: false }
      }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'PRIZE_IDENTITY_UNAVAILABLE'
  });
});


test('Mimikyu is not prioritized against Pokémon ex because Safeguard protects only from Pokémon V', () => {
  const request = rootRequest({
    ownHand: ['Mimikyu PAL 97'],
    ownPublic: player({ active: pokemon('Snorlax PGO 55') }),
    opponentPublic: player({ active: pokemon('Charizard ex OBF 125') }),
    items: [
      {
        token: 'mimikyu', kind: 'play-card',
        actorPrinting: 'Mimikyu PAL 97',
        publicMetadata: { cardType: 'pokemon', handIndex: 0 }
      },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'pass'
  });
});
