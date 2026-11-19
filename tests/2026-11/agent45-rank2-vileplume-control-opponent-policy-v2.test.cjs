'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const {
  POLICY_VERSION,
  createPolicy,
  sourceCopyPossible,
  PRINT
} = require('../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs');

const policy = createPolicy({
  role: 'opponent',
  seat: 0,
  policyVersion: POLICY_VERSION,
  config: {}
});
const gladionPolicy = createPolicy({
  role: 'opponent',
  seat: 0,
  policyVersion: POLICY_VERSION,
  config: { gladionPrizeIdentityProjection: true }
});

const init = {
  schema: protocol.INIT_SCHEMA,
  type: 'init',
  role: 'opponent',
  seat: 0,
  policyVersion: POLICY_VERSION,
  bundleSha256: 'a'.repeat(64),
  config: {}
};

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
    specialEnergyPlayLocked: false
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
    }))
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
    lostZone: [],
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

function turnResources() {
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
    specialEnergyPlayLocked: false
  };
}

function observation(options = {}) {
  return {
    actorSeat: 0,
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
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: options.requestId ?? 'agent10-root-1',
    sequence: options.sequence ?? 1,
    role: 'opponent',
    seat: 0,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation(options),
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
  const prompt = {
    schema: protocol.PROMPT_SCHEMA,
    actingSeat: 0,
    promptType: options.promptType,
    description: options.description ?? 'Choose a legal option',
    source: options.source,
    choices: options.choices ?? [],
    ...(options.publicMetadata ? { publicMetadata: options.publicMetadata } : {})
  };
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: options.requestId ?? 'agent10-prompt-1',
    sequence: options.sequence ?? 1,
    role: 'opponent',
    seat: 0,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation({
      ...(options.observation ?? {}),
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

function checkedDecision(request, selectedPolicy = policy) {
  const validated = protocol.validateRequest(request, init, request.sequence, new Set());
  const decision = selectedPolicy.decide(request);
  protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  return decision;
}

function cardChoice(token, printing, zone = 'deck', owner = 'actor', index = null) {
  return {
    token,
    kind: 'card',
    printing,
    label: printing,
    publicMetadata: {
      sourceZone: zone, ownerSeat: owner,
      ...(Number.isSafeInteger(index) ? { selectionIndex: index } : {})
    }
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

test('Fan Call is used before passing on the first turn cycle', () => {
  const request = rootRequest({
    globalTurn: 2,
    ownPublic: player({ active: pokemon('Fan Rotom SCR 118') }),
    items: [
      { token: 'pass', kind: 'pass', label: 'Pass turn' },
      { token: 'fan-call', kind: 'use-ability', actorPrinting: 'Fan Rotom SCR 118',
        publicMetadata: { abilityName: 'Fan Call' } }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'fan-call'
  });
});

test('Pidgeot ex Quick Search is preferred over passing', () => {
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Pidgeot ex OBF 164', {
      stage: 'STAGE2', subtypes: ['Stage 2', 'ex'], abilities: ['Quick Search']
    }) }),
    items: [
      { token: 'pass', kind: 'pass' },
      { token: 'quick-search', kind: 'use-ability',
        actorPrinting: 'Pidgeot ex OBF 164',
        publicMetadata: { abilityName: 'Quick Search' } }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'quick-search'
  });
});

test('Tag Call is played before evolving into the self-imposed Vileplume Item lock', () => {
  const request = rootRequest({
    ownHand: ['Tag Call CEC 206', 'Tag Call CEC 206', 'Tag Call CEC 206', 'Vileplume AOR 3'],
    ownPublic: player({
      active: pokemon('Bunnelby PRC 121'),
      bench: [pokemon('Gloom UNB 7', { stage: 'STAGE1', subtypes: ['Stage 1'] })]
    }),
    items: [
      { token: 'vileplume', kind: 'play-card', actorPrinting: 'Vileplume AOR 3',
        targetPrinting: 'Gloom UNB 7',
        publicMetadata: { cardType: 'pokemon', handIndex: 3,
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 0 } },
      { token: 'tag-call', kind: 'play-card', actorPrinting: 'Tag Call CEC 206',
        publicMetadata: { cardType: 'trainer', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'tag-call'
  });
});

test('Vileplume is established promptly once no pre-lock Item or Supporter remains to use', () => {
  const request = rootRequest({
    ownHand: ['Vileplume AOR 3'],
    ownPublic: player({
      active: pokemon('Bunnelby PRC 121'),
      bench: [pokemon('Gloom UNB 7', { stage: 'STAGE1', subtypes: ['Stage 1'] })]
    }),
    items: [
      { token: 'vileplume', kind: 'play-card', actorPrinting: 'Vileplume AOR 3',
        targetPrinting: 'Gloom UNB 7',
        publicMetadata: { cardType: 'pokemon', handIndex: 0,
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'vileplume'
  });
});

test('Stoutland is promoted to Active when its Supporter lock is not yet live', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Bunnelby PRC 121'),
      bench: [pokemon('Stoutland BCR 122', {
        stage: 'STAGE2', subtypes: ['Stage 2'], abilities: ['Sentinel']
      })]
    }),
    opponentPublic: player({ publicTurnRestrictions: { supporterPlayLocked: false } }),
    items: [
      { token: 'retreat-stoutland', kind: 'retreat',
        actorPrinting: 'Bunnelby PRC 121', targetPrinting: 'Stoutland BCR 122',
        publicMetadata: { benchIndex: 0, targetSeat: 'actor',
          targetZone: 'bench', targetIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'retreat-stoutland'
  });
});

test('the optional Irresistible Aroma ability is not volunteered', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Gloom UNB 7', { stage: 'STAGE1', subtypes: ['Stage 1'],
        abilities: ['Irresistible Aroma'] })
    }),
    items: [
      { token: 'aroma', kind: 'use-ability', actorPrinting: 'Gloom UNB 7',
        publicMetadata: { abilityName: 'Irresistible Aroma' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});

test('Tag Call searches for Guzma & Hala rather than the weaker alternate TAG TEAM Supporter', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Tag Call CEC 206', 'Tag Call'),
    choices: [
      cardChoice('guzma-hala', 'Guzma & Hala CEC 193'),
      cardChoice('bellelba', 'Bellelba & Brycen-Man CEC 186'),
      { token: 'empty', kind: 'empty-selection', label: 'Select none' }
    ],
    publicMetadata: {
      minimumCount: 0, maximumCount: 2, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  const decision = checkedDecision(request);
  assert.equal(decision.kind, 'select-choices');
  assert.equal(decision.tokens[0], 'guzma-hala');
});

test('Guzma & Hala selects Grand Tree from a Stadium search', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Guzma & Hala CEC 193', 'Guzma & Hala'),
    choices: [
      cardChoice('artazon', 'Artazon PAL 171'),
      cardChoice('grand-tree', 'Grand Tree SCR 136')
    ],
    observation: {
      ownPublic: player({
        bench: [pokemon('Oddish UNB 5', { lastPlayedOrEvolvedTurn: 1 })]
      })
    },
    publicMetadata: {
      minimumCount: 1, maximumCount: 1, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['grand-tree']
  });
});

test('Guzma & Hala selects Technical Machine: Evolution from a Tool search', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Guzma & Hala CEC 193', 'Guzma & Hala'),
    choices: [
      cardChoice('hood', 'Stealthy Hood UNB 186'),
      cardChoice('tm-evolution', 'Technical Machine: Evolution PAR 178')
    ],
    publicMetadata: {
      minimumCount: 1, maximumCount: 1, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['tm-evolution']
  });
});

test('Guzma & Hala selects Jet Energy from a Special Energy search', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Guzma & Hala CEC 193', 'Guzma & Hala'),
    choices: [
      cardChoice('capture', 'Capture Energy RCL 171'),
      cardChoice('jet', 'Jet Energy PAL 190')
    ],
    publicMetadata: {
      minimumCount: 1, maximumCount: 1, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['jet']
  });
});

test('Guzma & Hala discard preserves unique setup pieces and discards redundant Tag Calls', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Guzma & Hala CEC 193', 'Guzma & Hala'),
    choices: [
      cardChoice('tag-1', 'Tag Call CEC 206', 'hand'),
      cardChoice('tag-2', 'Tag Call CEC 206', 'hand'),
      cardChoice('unique-guzma-hala', 'Guzma & Hala CEC 193', 'hand'),
      cardChoice('unique-jet', 'Jet Energy PAL 190', 'hand')
    ],
    observation: {
      ownHand: ['Tag Call CEC 206', 'Tag Call CEC 206',
        'Guzma & Hala CEC 193', 'Jet Energy PAL 190']
    },
    publicMetadata: {
      minimumCount: 2, maximumCount: 2, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  const decision = checkedDecision(request);
  assert.equal(decision.kind, 'select-choices');
  assert.deepEqual(decision.tokens, ['tag-1', 'tag-2']);
});

test('TM Evolution prioritizes Gloom and Herdier over a fresh Basic', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Bunnelby PRC 121', 'Evolution'),
    choices: [
      pokemonChoice('pidgey', 'Pidgey MEW 16', 'actor', 'bench', 0),
      pokemonChoice('gloom', 'Gloom UNB 7', 'actor', 'bench', 1),
      pokemonChoice('herdier', 'Herdier SUM 104', 'actor', 'bench', 2),
      { token: 'empty', kind: 'empty-selection', label: 'Select none' }
    ],
    publicMetadata: {
      minimumCount: 0, maximumCount: 2, allowCancel: false,
      isSecret: false, selectionType: 'pokemon'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['gloom', 'herdier']
  });
});

test('Get Lost targets recursion and Special Energy in the opponent discard', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Girafarig LOT 94', 'Get Lost'),
    choices: [
      cardChoice('random', 'Basic Water Energy SVE 3', 'discard', 'opponent'),
      cardChoice('vs-seeker', 'VS Seeker PHF 109', 'discard', 'opponent'),
      cardChoice('lusamine', 'Lusamine CIN 96', 'discard', 'opponent')
    ],
    publicMetadata: {
      sourceZone: 'discard',
      minimumCount: 2, maximumCount: 2, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['vs-seeker', 'lusamine']
  });
});

test('Rototiller recycles Guzma & Hala from the owner discard', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Bunnelby PRC 121', 'Rototiller'),
    choices: [
      cardChoice('grass', 'Grass Energy MEE 9', 'discard'),
      cardChoice('guzma-hala', 'Guzma & Hala CEC 193', 'discard')
    ],
    publicMetadata: {
      sourceZone: 'discard',
      minimumCount: 1, maximumCount: 1, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['guzma-hala']
  });
});

test('Relicanth Memory Dive selects Baby-Doll Eyes as the lock attack', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: actorChoiceSource('Relicanth TEF 84', 'Memory Dive'),
    choices: [
      { token: 'wild-tackle', kind: 'attack', label: 'Wild Tackle',
        publicMetadata: { sourceAttack: 'Wild Tackle' } },
      { token: 'baby-doll-eyes', kind: 'attack', label: 'Baby-Doll Eyes',
        publicMetadata: { sourceAttack: 'Baby-Doll Eyes' } },
      { token: 'burrow', kind: 'attack', label: 'Burrow',
        publicMetadata: { sourceAttack: 'Burrow' } }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice',
    token: 'baby-doll-eyes'
  });
});

test('zero-count prize selection uses the special empty-selection token', () => {
  const request = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource(null, 'Prize selection'),
    choices: [{ token: 'empty', kind: 'empty-selection', label: 'Select none' }],
    publicMetadata: {
      count: 0, requiredCount: 0, allowCancel: false,
      isSecret: false, selectionType: 'prize-slots'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice',
    token: 'empty'
  });
});

test('unknown card-combination sources fail closed', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Unrecognized Card ABC 1', 'Unknown search'),
    choices: [cardChoice('unknown', 'Mystery Card ABC 1')],
    publicMetadata: {
      minimumCount: 1, maximumCount: 1, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain',
    reasonCode: 'UNSUPPORTED_CARD_SELECTION_SOURCE'
  });
});

test('unknown attack-choice sources fail closed', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: actorChoiceSource(null, 'Unrecognized attack selector'),
    choices: [{ token: 'unknown', kind: 'option', label: 'Unknown attack' }]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain',
    reasonCode: 'UNSUPPORTED_ATTACK_CHOICE_SOURCE'
  });
});

test('unknown prompt types fail closed', () => {
  const request = promptRequest({
    promptType: 'UnmodeledPrompt',
    source: actorChoiceSource(null, 'Unknown engine choice'),
    choices: [{ token: 'x', kind: 'option', label: 'Unknown' }]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain',
    reasonCode: 'UNSUPPORTED_PROMPT_TYPE'
  });
});



test('energy payment honors the typed Energy requirement rather than selecting every offered Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseEnergyPrompt',
    source: actorChoiceSource(null, 'Attack cost payment'),
    choices: [0, 1, 2].map(index => ({
      token: 'energy-' + index,
      kind: 'energy',
      printing: 'Grass Energy MEE 9',
      label: 'Grass Energy',
      publicMetadata: { energyType: 'Grass' }
    })),
    publicMetadata: {
      count: 3,
      energyCount: 3,
      energyType: 'Grass,Colorless',
      allowCancel: false,
      isSecret: false,
      selectionType: 'energy-payment'
    }
  });
  const decision = checkedDecision(request);
  assert.equal(decision.kind, 'select-choices');
  assert.equal(decision.tokens.length, 2);
});

test('Guzma selects a visible low-HP multi-Prize opponent Bench target', () => {
  const target = pokemon('Pidgeot ex OBF 164', {
    hp: 280, damage: 220, stage: 'STAGE2', subtypes: ['Stage 2', 'ex']
  });
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Guzma BUS 115', 'Guzma'),
    choices: [
      pokemonChoice('safe', 'Basic Water Pokémon SVE 1', 'opponent', 'bench', 0),
      pokemonChoice('weak-pidgeot', 'Pidgeot ex OBF 164', 'opponent', 'bench', 1)
    ],
    observation: {
      opponentPublic: player({ bench: [
        pokemon('Basic Water Pokémon SVE 1', { hp: 100 }),
        target
      ] })
    },
    publicMetadata: {
      minimumCount: 1, maximumCount: 1, allowCancel: false,
      isSecret: false, selectionType: 'pokemon'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['weak-pidgeot']
  });
});

test('Stoutland is not promoted through a visible Garbotoxin ability suppression', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Bunnelby PRC 121'),
      bench: [pokemon('Stoutland BCR 122', {
        stage: 'STAGE2', subtypes: ['Stage 2'], abilities: ['Sentinel']
      })]
    }),
    opponentPublic: player({
      active: pokemon('Garbodor GRI 51', {
        stage: 'STAGE1', subtypes: ['Stage 1'], abilities: ['Garbotoxin']
      })
    }),
    items: [
      { token: 'retreat-stoutland', kind: 'retreat',
        actorPrinting: 'Bunnelby PRC 121', targetPrinting: 'Stoutland BCR 122',
        publicMetadata: { benchIndex: 0, targetSeat: 'actor',
          targetZone: 'bench', targetIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});

test('Faba is not spent when the public opponent board has only Basic Energy and no Tool or Stadium', () => {
  const request = rootRequest({
    ownHand: ['Faba LOT 173'],
    opponentPublic: player({
      active: pokemon('Basic Water Pokémon SVE 1', {
        energies: ['Grass Energy MEE 9']
      })
    }),
    items: [
      { token: 'faba', kind: 'play-card', actorPrinting: 'Faba LOT 173',
        publicMetadata: { cardType: 'trainer', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});



test('Counter Gain is attached to the Active attacker when behind on Prizes and before Vileplume locks Items', () => {
  const request = rootRequest({
    ownHand: ['Counter Gain SSP 169', 'Vileplume AOR 3'],
    ownPublic: player({
      active: pokemon('Bunnelby PRC 121'),
      bench: [pokemon('Gloom UNB 7', { stage: 'STAGE1', subtypes: ['Stage 1'] })],
      prizeCount: 6
    }),
    opponentPublic: player({ prizeCount: 5 }),
    items: [
      { token: 'vileplume', kind: 'play-card', actorPrinting: 'Vileplume AOR 3',
        targetPrinting: 'Gloom UNB 7',
        publicMetadata: { cardType: 'pokemon', handIndex: 1,
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 0 } },
      { token: 'counter-gain', kind: 'play-card', actorPrinting: 'Counter Gain SSP 169',
        targetPrinting: 'Bunnelby PRC 121',
        publicMetadata: { cardType: 'trainer', handIndex: 0,
          targetSeat: 'actor', targetZone: 'active', targetIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'counter-gain'
  });
});

test('Counter Gain is not spent when the source player is not behind on Prizes', () => {
  const request = rootRequest({
    ownHand: ['Counter Gain SSP 169'],
    ownPublic: player({
      active: pokemon('Bunnelby PRC 121'),
      prizeCount: 5
    }),
    opponentPublic: player({ prizeCount: 5 }),
    items: [
      { token: 'counter-gain', kind: 'play-card', actorPrinting: 'Counter Gain SSP 169',
        targetPrinting: 'Bunnelby PRC 121',
        publicMetadata: { cardType: 'trainer', handIndex: 0,
          targetSeat: 'actor', targetZone: 'active', targetIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});



test('Guzma & Hala searches Counter Gain when behind and Technical Machine: Evolution is already held', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Guzma & Hala CEC 193', 'Guzma & Hala'),
    choices: [
      cardChoice('tm-evolution', 'Technical Machine: Evolution PAR 178'),
      cardChoice('counter-gain', 'Counter Gain SSP 169')
    ],
    observation: {
      ownHand: ['Technical Machine: Evolution PAR 178'],
      ownPublic: player({ prizeCount: 6 }),
      opponentPublic: player({ prizeCount: 5 })
    },
    publicMetadata: {
      minimumCount: 1, maximumCount: 1, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['counter-gain']
  });
});



test('Guzma & Hala selects its discard-two mode only with a K0 evolution line and two discardable cards', () => {
  const request = promptRequest({
    promptType: 'SelectOptionPrompt',
    source: actorChoiceSource('Guzma & Hala CEC', 'Guzma & Hala'),
    choices: [
      { token: 'mode-zero', kind: 'option', label: 'Do not discard 2 cards',
        publicMetadata: { choiceIndex: 0, selectionType: 'option' } },
      { token: 'mode-one', kind: 'option',
        label: 'Discard 2 cards from your hand to search for a Stadium, Pokémon Tool, and Special Energy',
        publicMetadata: { choiceIndex: 1, selectionType: 'option' } }
    ],
    observation: {
      ownHand: ['Tag Call CEC', 'Tag Call CEC'],
      ownPublic: player({
        active: pokemon('Bunnelby PRC 121'),
        bench: [pokemon('Oddish UNB 5', { lastPlayedOrEvolvedTurn: 1 })]
      })
    },
    publicMetadata: {
      count: 2, minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false, selectionType: 'option'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice',
    token: 'mode-one'
  });
});

test('Guzma & Hala declines its discard-two mode when two safe discards are unavailable', () => {
  const request = promptRequest({
    promptType: 'SelectOptionPrompt',
    source: actorChoiceSource('Guzma & Hala CEC', 'Guzma & Hala'),
    choices: [
      { token: 'mode-zero', kind: 'option', label: 'Do not discard 2 cards',
        publicMetadata: { choiceIndex: 0, selectionType: 'option' } },
      { token: 'mode-one', kind: 'option',
        label: 'Discard 2 cards from your hand to search for a Stadium, Pokémon Tool, and Special Energy',
        publicMetadata: { choiceIndex: 1, selectionType: 'option' } }
    ],
    observation: {
      ownHand: ['Tag Call CEC'],
      ownPublic: player({
        active: pokemon('Bunnelby PRC 121'),
        bench: [pokemon('Oddish UNB 5', { lastPlayedOrEvolvedTurn: 1 })]
      })
    },
    publicMetadata: {
      count: 2, minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false, selectionType: 'option'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice',
    token: 'mode-zero'
  });
});

test('Guzma & Hala declines its discard-two mode when no K0 Stage card remains for the Bench Basic', () => {
  const request = promptRequest({
    promptType: 'SelectOptionPrompt',
    source: actorChoiceSource('Guzma & Hala CEC', 'Guzma & Hala'),
    choices: [
      { token: 'mode-zero', kind: 'option', label: 'Do not discard 2 cards',
        publicMetadata: { choiceIndex: 0, selectionType: 'option' } },
      { token: 'mode-one', kind: 'option',
        label: 'Discard 2 cards from your hand to search for a Stadium, Pokémon Tool, and Special Energy',
        publicMetadata: { choiceIndex: 1, selectionType: 'option' } }
    ],
    observation: {
      ownHand: ['Tag Call CEC', 'Tag Call CEC'],
      ownPublic: player({
        active: pokemon('Bunnelby PRC 121'),
        bench: [pokemon('Oddish UNB 5', { lastPlayedOrEvolvedTurn: 1 })],
        discard: ['Gloom UNB', 'Gloom UNB']
      })
    },
    publicMetadata: {
      count: 2, minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false, selectionType: 'option'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice',
    token: 'mode-zero'
  });
});

test('Bunnelby uses the Technical Machine: Evolution attack when a K0 Bench evolution target is available', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Bunnelby PRC 121', {
        tools: ['Technical Machine: Evolution PAR']
      }),
      bench: [pokemon('Oddish UNB 5', { lastPlayedOrEvolvedTurn: 1 })]
    }),
    opponentPublic: player({ deckCount: 20 }),
    items: [
      { token: 'burrow', kind: 'attack', attackName: 'Burrow' },
      { token: 'evolution', kind: 'attack', attackName: 'Evolution' },
      { token: 'rototiller', kind: 'attack', attackName: 'Rototiller' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'evolution'
  });
});

test('Bunnelby prefers Burrow over Technical Machine: Evolution when it can deck out the opponent immediately', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Bunnelby PRC 121', {
        tools: ['Technical Machine: Evolution PAR']
      }),
      bench: [pokemon('Oddish UNB 5', { lastPlayedOrEvolvedTurn: 1 })]
    }),
    opponentPublic: player({ deckCount: 1 }),
    items: [
      { token: 'evolution', kind: 'attack', attackName: 'Evolution' },
      { token: 'burrow', kind: 'attack', attackName: 'Burrow' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'burrow'
  });
});

test('Bunnelby Barrage attack-choice prompt selects Evolution when the K0 line is live', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: actorChoiceSource('Bunnelby PRC', 'Barrage'),
    choices: [
      { token: 'burrow', kind: 'attack', label: 'Burrow',
        publicMetadata: { sourceAttack: 'Burrow' } },
      { token: 'evolution', kind: 'attack', label: 'Evolution',
        publicMetadata: { sourceAttack: 'Evolution' } }
    ],
    observation: {
      ownPublic: player({
        active: pokemon('Bunnelby PRC 121', {
          tools: ['Technical Machine: Evolution PAR']
        }),
        bench: [pokemon('Oddish UNB 5', { lastPlayedOrEvolvedTurn: 1 })]
      }),
      opponentPublic: player({ deckCount: 20 })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice',
    token: 'evolution'
  });
});



test('Guzma & Hala prefers Artazon when no prior-turn Basic can use Grand Tree', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Guzma & Hala CEC', 'Guzma & Hala'),
    choices: [
      cardChoice('grand-tree', 'Grand Tree SCR 136'),
      cardChoice('artazon', 'Artazon PAL 171')
    ],
    observation: {
      ownPublic: player({
        active: pokemon('Bunnelby PRC 121')
      })
    },
    publicMetadata: {
      minimumCount: 1, maximumCount: 1, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['artazon']
  });
});

test('Grand Tree is not activated without a prior-turn Basic and K0 Stage 1 plus Stage 2 copies', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Bunnelby PRC 121'),
      bench: [pokemon('Oddish UNB 5', { lastPlayedOrEvolvedTurn: 3 })]
    }),
    items: [
      { token: 'grand-tree', kind: 'use-stadium',
        actorPrinting: 'Grand Tree SCR 136' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});



test('Guzma & Hala mode-one search selects one Stadium, one Tool, and one Special Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Guzma & Hala CEC', 'Guzma & Hala'),
    choices: [
      cardChoice('grand-tree', 'Grand Tree SCR 136'),
      cardChoice('artazon', 'Artazon PAL 171'),
      cardChoice('tm-evolution', 'Technical Machine: Evolution PAR 178'),
      cardChoice('hood', 'Stealthy Hood UNB 186'),
      cardChoice('counter-gain', 'Counter Gain SSP 169'),
      cardChoice('jet-energy', 'Jet Energy PAL 190'),
      cardChoice('capture-energy', 'Capture Energy RCL 171'),
      cardChoice('memory-energy', 'Memory Energy LOT 194')
    ],
    observation: {
      ownPublic: player({
        active: pokemon('Bunnelby PRC 121'),
        bench: [pokemon('Oddish UNB 5', { lastPlayedOrEvolvedTurn: 1 })]
      })
    },
    publicMetadata: {
      minimumCount: 3, maximumCount: 3, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['grand-tree', 'tm-evolution', 'jet-energy']
  });
});



test('Grand Tree can target an eligible Active Basic as well as a Bench Basic', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Grand Tree SCR 136', 'Grand Tree'),
    choices: [
      pokemonChoice('active-oddish', 'Oddish UNB 5', 'actor', 'active', 0),
      pokemonChoice('bench-pidgey', 'Pidgey MEW 16', 'actor', 'bench', 1)
    ],
    observation: {
      ownPublic: player({
        active: pokemon('Oddish UNB 5', { lastPlayedOrEvolvedTurn: 1 }),
        bench: [pokemon('Pidgey MEW 16', { lastPlayedOrEvolvedTurn: 1 })]
      })
    },
    publicMetadata: {
      minimumCount: 1, maximumCount: 1, allowCancel: false,
      isSecret: false, selectionType: 'pokemon'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['active-oddish']
  });
});



test('role and seat binding mismatch abstains', () => {
  const request = rootRequest();
  request.seat = 1;
  assert.deepEqual(policy.decide(request), {
    kind: 'abstain',
    reasonCode: 'ROLE_SEAT_BINDING_MISMATCH'
  });
});


test('Guzma & Hala mode zero receives root value when a useful Stadium remains', () => {
  const request = rootRequest({
    ownHand: ['Guzma & Hala CEC 193'],
    ownPublic: player({
      active: pokemon('Bunnelby PRC 121'),
      bench: [pokemon('Oddish UNB 5', { lastPlayedOrEvolvedTurn: 1 })]
    }),
    items: [
      { token: 'guzma-hala', kind: 'play-card', actorPrinting: 'Guzma & Hala CEC 193',
        publicMetadata: { cardType: 'supporter', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.equal(checkedDecision(request).token, 'guzma-hala');
});

test('Guzma & Hala mode-zero search chooses a useful Stadium, not Tool or Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Guzma & Hala CEC 193', 'Guzma & Hala'),
    choices: [
      cardChoice('grand-tree', 'Grand Tree SCR 136'),
      cardChoice('artazon', 'Artazon PAL 171'),
      cardChoice('tm', 'Technical Machine: Evolution PAR 178'),
      cardChoice('jet', 'Jet Energy PAL 190')
    ],
    observation: {
      ownPublic: player({
        active: pokemon('Bunnelby PRC 121'),
        bench: [pokemon('Oddish UNB 5', { lastPlayedOrEvolvedTurn: 1 })]
      })
    },
    publicMetadata: {
      minimumCount: 1, maximumCount: 1, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['grand-tree']
  });
});

test('Stoutland with Stealthy Hood remains a valid Sentinel retreat target under Garbotoxin', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Bunnelby PRC 121'),
      bench: [pokemon('Stoutland BCR 122', {
        stage: 'STAGE2', subtypes: ['Stage 2'], abilities: ['Sentinel'],
        tools: ['Stealthy Hood UNB 186']
      })]
    }),
    opponentPublic: player({
      active: pokemon('Garbodor GRI 51', {
        stage: 'STAGE1', subtypes: ['Stage 1'], abilities: ['Garbotoxin']
      })
    }),
    items: [
      { token: 'retreat-stoutland', kind: 'retreat',
        actorPrinting: 'Bunnelby PRC 121', targetPrinting: 'Stoutland BCR 122',
        publicMetadata: { benchIndex: 0, targetSeat: 'actor',
          targetZone: 'bench', targetIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.equal(checkedDecision(request).token, 'retreat-stoutland');
});

test('Guzma & Hala discard keeps one Jet Energy when the Bunnelby pivot is live', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Guzma & Hala CEC 193', 'Guzma & Hala'),
    choices: [
      cardChoice('jet-0', 'Jet Energy PAL 190', 'hand', 'actor', 0),
      cardChoice('jet-1', 'Jet Energy PAL 190', 'hand', 'actor', 1),
      cardChoice('grass', 'Grass Energy MEE 9', 'hand', 'actor', 2)
    ],
    observation: {
      ownHand: ['Jet Energy PAL 190', 'Jet Energy PAL 190', 'Grass Energy MEE 9'],
      ownPublic: player({
        active: pokemon('Fan Rotom SCR 118'),
        bench: [
          pokemon('Bunnelby PRC 121'),
          pokemon('Oddish UNB 5', { lastPlayedOrEvolvedTurn: 1 })
        ]
      })
    },
    publicMetadata: {
      minimumCount: 2, maximumCount: 2, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['jet-1', 'grass']
  });
});

test('Guzma & Hala discard keeps one Technical Machine: Evolution when the Bunnelby line is live', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Guzma & Hala CEC 193', 'Guzma & Hala'),
    choices: [
      cardChoice('tm-0', 'Technical Machine: Evolution PAR 178', 'hand', 'actor', 0),
      cardChoice('tm-1', 'Technical Machine: Evolution PAR 178', 'hand', 'actor', 1),
      cardChoice('grass', 'Grass Energy MEE 9', 'hand', 'actor', 2)
    ],
    observation: {
      ownHand: [
        'Technical Machine: Evolution PAR 178',
        'Technical Machine: Evolution PAR 178',
        'Grass Energy MEE 9'
      ],
      ownPublic: player({
        active: pokemon('Fan Rotom SCR 118'),
        bench: [
          pokemon('Bunnelby PRC 121'),
          pokemon('Oddish UNB 5', { lastPlayedOrEvolvedTurn: 1 })
        ]
      })
    },
    publicMetadata: {
      minimumCount: 2, maximumCount: 2, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['tm-1', 'grass']
  });
});

test('public own-hand mirror is not counted twice in source-copy availability', () => {
  const observationView = observation({
    ownHand: ['Jet Energy PAL 190'],
    ownPublic: player({
      publicHand: ['Jet Energy PAL 190']
    })
  });
  assert.equal(sourceCopyPossible(observationView, PRINT.jetEnergy), true);
});

test('Peonia is valued at root only when three safe duplicate replacements are available', () => {
  const request = rootRequest({
    ownHand: [
      'Tag Call CEC 206', 'Tag Call CEC 206',
      'Tag Call CEC 206', 'Tag Call CEC 206'
    ],
    ownPublic: player({ prizeCount: 6 }),
    items: [
      { token: 'peonia', kind: 'play-card', actorPrinting: 'Peonia CRE 149',
        publicMetadata: { cardType: 'supporter', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.equal(checkedDecision(request).token, 'peonia');
});

test('Peonia Prize selection stays identity-blind and chooses only the native three-slot payment', () => {
  const request = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource('Peonia CRE 149', 'Peonia'),
    choices: [1, 2, 3, 4, 5, 6].map((slot, index) => ({
      token: 'prize-' + slot,
      kind: 'prize',
      label: 'Your Prize slot ' + slot,
      publicMetadata: {
        selectionIndex: index, sourceZone: 'prizes',
        ownerSeat: 'actor', isOwnerVisible: false, requiredCount: 3
      }
    })),
    observation: {
      ownHand: [
        'Tag Call CEC 206', 'Tag Call CEC 206',
        'Tag Call CEC 206', 'Tag Call CEC 206'
      ],
      ownPublic: player({ prizeCount: 6 })
    },
    publicMetadata: {
      count: 3, requiredCount: 3, minimumCount: 0, maximumCount: 3,
      allowCancel: false, isSecret: true, selectionType: 'prize-slots',
      ownerSeat: 'actor', isOwnerVisible: false
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['prize-1', 'prize-2', 'prize-3']
  });
});

test('Peonia replacement chooses only surplus hand copies, not unique resources', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Peonia CRE 149', 'Peonia'),
    choices: [
      cardChoice('tag-1', 'Tag Call CEC 206', 'hand', 'actor', 1),
      cardChoice('tag-2', 'Tag Call CEC 206', 'hand', 'actor', 2),
      cardChoice('tag-3', 'Tag Call CEC 206', 'hand', 'actor', 3),
      cardChoice('guzma', 'Guzma BUS 115', 'hand', 'actor', 4)
    ],
    observation: {
      ownHand: [
        'Tag Call CEC 206', 'Tag Call CEC 206',
        'Tag Call CEC 206', 'Tag Call CEC 206',
        'Guzma BUS 115'
      ]
    },
    publicMetadata: {
      minimumCount: 3, maximumCount: 3, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['tag-1', 'tag-2', 'tag-3']
  });
});

test('Gladion root is gated on the owner-visible Prize identity projection', () => {
  const request = rootRequest({
    ownHand: ['Gladion CIN 95'],
    ownPublic: player({
      prizeCount: 6,
      bench: [pokemon('Pidgeotto TEU 123', { stage: 'STAGE1', subtypes: ['Stage 1'] })]
    }),
    items: [
      { token: 'gladion', kind: 'play-card', actorPrinting: 'Gladion CIN 95',
        publicMetadata: { cardType: 'supporter', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.equal(checkedDecision(request).token, 'pass');
  assert.equal(checkedDecision(request, gladionPolicy).token, 'gladion');
});

test('Gladion Prize choice abstains when the current projection hides Prize identities', () => {
  const request = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource('Gladion CIN 95', 'Gladion'),
    choices: [{
      token: 'prize-1', kind: 'prize', label: 'Your Prize slot 1',
      publicMetadata: {
        selectionIndex: 0, sourceZone: 'prizes',
        ownerSeat: 'actor', isOwnerVisible: false, requiredCount: 1
      }
    }],
    publicMetadata: {
      count: 1, requiredCount: 1, minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false, selectionType: 'prize-slots',
      ownerSeat: 'actor', isOwnerVisible: false
    }
  });
  assert.deepEqual(checkedDecision(request, gladionPolicy), {
    kind: 'abstain', reasonCode: 'GLADION_PRIZE_IDENTITIES_NOT_ACTOR_VISIBLE'
  });
});

test('Gladion chooses a missing evolution-line card only from owner-visible Prize identities', () => {
  const request = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource('Gladion CIN 95', 'Gladion'),
    choices: [
      {
        token: 'water', kind: 'prize', printing: 'Basic Water Energy SVE 3',
        label: 'Your Prize slot 1',
        publicMetadata: {
          selectionIndex: 0, sourceZone: 'prizes',
          ownerSeat: 'actor', isOwnerVisible: true, requiredCount: 1
        }
      },
      {
        token: 'pidgeot', kind: 'prize', printing: 'Pidgeot ex OBF 164',
        label: 'Your Prize slot 2',
        publicMetadata: {
          selectionIndex: 1, sourceZone: 'prizes',
          ownerSeat: 'actor', isOwnerVisible: true, requiredCount: 1
        }
      }
    ],
    observation: {
      ownPublic: player({
        bench: [pokemon('Pidgeotto TEU 123', { stage: 'STAGE1', subtypes: ['Stage 1'] })]
      })
    },
    publicMetadata: {
      count: 1, requiredCount: 1, minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false, selectionType: 'prize-slots',
      ownerSeat: 'actor', isOwnerVisible: true
    }
  });
  assert.deepEqual(checkedDecision(request, gladionPolicy), {
    kind: 'select-choices', tokens: ['pidgeot']
  });
});

test('Lusamine root and prompt recover Gladion only with the explicit projection contract', () => {
  const request = rootRequest({
    ownHand: ['Lusamine CIN 96'],
    ownPublic: player({
      prizeCount: 6,
      discard: ['Gladion CIN 95', 'Guzma & Hala CEC 193']
    }),
    items: [
      { token: 'lusamine', kind: 'play-card', actorPrinting: 'Lusamine CIN 96',
        publicMetadata: { cardType: 'supporter', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.equal(checkedDecision(request).token, 'pass');
  assert.equal(checkedDecision(request, gladionPolicy).token, 'lusamine');
  const prompt = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Lusamine CIN 96', 'Lusamine'),
    choices: [
      cardChoice('peonia', 'Peonia CRE 149', 'discard', 'actor', 0),
      cardChoice('gladion', 'Gladion CIN 95', 'discard', 'actor', 1),
      cardChoice('guzma-hala', 'Guzma & Hala CEC 193', 'discard', 'actor', 2)
    ],
    publicMetadata: {
      minimumCount: 2, maximumCount: 2, allowCancel: false,
      isSecret: false, selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(prompt, gladionPolicy), {
    kind: 'select-choices', tokens: ['gladion', 'guzma-hala']
  });
});
