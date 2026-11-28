'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const {
  POLICY_VERSION,
  createPolicy
} = require('../../simulation/evaluation/2026-11/agent10-rank2-vileplume-control-opponent-policy.cjs');

const policy = createPolicy({
  role: 'opponent',
  seat: 0,
  policyVersion: POLICY_VERSION,
  config: {}
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
    abilitySuppressions: abilities.map(name => ({ abilityName: name, suppressed: false, reasonCode: null, sourcePrinting: null }))
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
    prizeSlots: [],
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
    phase: options.phase ?? 2,
    decisionKind: options.prompt ? 'owner-prompt' : 'owner-root',
    pendingPromptType: options.prompt?.promptType ?? null,
    pendingOwnerDeckSearch: false,
    ownHand: options.ownHand ?? [],
    ownPublic: options.ownPublic ?? player(),
    opponentPublic: options.opponentPublic ?? player(),
    ownTurnResources: options.ownTurnResources ?? turnResources(),
    ownerK1: options.ownerK1 ?? null
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
    // Fill native actor selection metadata missing in older test fixtures.
    publicMetadata: options.publicMetadata ?? (
      options.promptType==='ChooseCardsPrompt' ?
        {selectionType:'card-combination',minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false} :
      options.promptType==='ChoosePokemonPrompt' ?
        {selectionType:'pokemon',minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false} :
      options.promptType==='ChooseEnergyPrompt' ?
        {selectionType:'energy-payment',energyCount:1,allowCancel:false,isSecret:false} :
      options.promptType==='ChooseAttackPrompt' ?
        {selectionType:'attack',allowCancel:false} :
      options.promptType==='ChoosePrizePrompt' ?
        {selectionType:'prize-slots',minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false} :
      options.promptType==='ConfirmPrompt' ?
        {selectionType:'confirm',allowCancel:false} :
      {selectionType:'option',allowCancel:false})
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

function checkedDecision(request) {
  const validated = protocol.validateRequest(request, init, request.sequence, new Set());
  const decision = policy.decide(request);
  protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  return decision;
}

function cardChoice(token, printing, zone = 'deck', owner = 'actor') {
  return {
    token,
    kind: 'card',
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
      ...(zone === 'bench' ? { benchIndex: index } : { slotIndex: index }),
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
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 0, isOwnerVisible: true } },
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
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 0, isOwnerVisible: true } },
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
          targetZone: 'bench', targetIndex: 0, isOwnerVisible: true } },
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
    reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE'
  });
});

test('unknown attack-choice sources fail closed', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: actorChoiceSource(null, 'Unrecognized attack selector'),
    choices: [{ token: 'unknown', kind: 'attack', label: 'Unknown attack' }]
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
  // Unregistered prompt classes are rejected by the host schema before the
  // worker receives them. Exercise its fail-closed branch directly.
  assert.deepEqual(policy.decide(request), {
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
      active: pokemon('Garbodor DRX 54', {
        stage: 'STAGE1', subtypes: ['Stage 1'], abilities: ['Garbotoxin'],
        tools: ['Float Stone BKT 137']
      })
    }),
    items: [
      { token: 'retreat-stoutland', kind: 'retreat',
        actorPrinting: 'Bunnelby PRC 121', targetPrinting: 'Stoutland BCR 122',
        publicMetadata: { benchIndex: 0, targetSeat: 'actor',
          targetZone: 'bench', targetIndex: 0, isOwnerVisible: true } },
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
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 0, isOwnerVisible: true } },
      { token: 'counter-gain', kind: 'play-card', actorPrinting: 'Counter Gain SSP 169',
        targetPrinting: 'Bunnelby PRC 121',
        publicMetadata: { cardType: 'trainer', handIndex: 0,
          targetSeat: 'actor', targetZone: 'active', targetIndex: 0, isOwnerVisible: true } },
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
          targetSeat: 'actor', targetZone: 'active', targetIndex: 0, isOwnerVisible: true } },
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



test('Grand Tree root to target to both Stage searches can complete rank2 lock line',()=>{
  const basic=pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1});
  const root=grandTreeRoot({globalTurn:3,ownPublic:player({
    active:pokemon('Bunnelby PRC 121'),bench:[basic]})});
  assert.deepEqual(checkedDecision(root),{kind:'select-action',token:'grand-tree'});
  const target=promptRequest({promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Grand Tree SCR 136','Grand Tree'),
    choices:[pokemonChoice('odd','Oddish UNB 5','actor','bench',0)],
    observation:{ownPublic:player({active:pokemon('Bunnelby PRC 121'),bench:[basic]})},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(target),{kind:'select-choices',tokens:['odd']});
  const stage1=promptRequest({promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Grand Tree SCR 136','Grand Tree'),
    choices:[cardChoice('gloom','Gloom UNB 7'),
      cardChoice('herdier','Herdier SUM 104')],
    observation:{ownPublic:player({active:pokemon('Bunnelby PRC 121'),bench:[basic]})},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(stage1),{kind:'select-choices',tokens:['gloom']});
  const stage2=promptRequest({promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Grand Tree SCR 136','Grand Tree'),
    choices:[cardChoice('gx','Vileplume-GX CEC 4'),
      cardChoice('lock','Vileplume AOR 3')],
    observation:{ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Gloom UNB 7',{stage:'STAGE1',lastPlayedOrEvolvedTurn:3,
        evolutionPrintings:['Oddish UNB 5']})]})},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(stage2),{kind:'select-choices',tokens:['lock']});
});
test('Grand Tree legally cancels missing Stage2 deck-search continuation',()=>{
  const req=promptRequest({promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Grand Tree SCR 136','Grand Tree'),
    choices:[cardChoice('junk','Herdier SUM 104'),
      {token:'cancel',kind:'cancel',label:'Cancel selection'}],
    observation:{ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Gloom UNB 7',{stage:'STAGE1',
        evolutionPrintings:['Oddish UNB 5']})]})},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,
      maximumCount:1,allowCancel:true,isSecret:false}});
  assert.deepEqual(checkedDecision(req),{kind:'select-choice',token:'cancel'});
});
test('Grand Tree cannot invent cancellation for a mandatory unsupported Stage2 search',()=>{
  const req=promptRequest({promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Grand Tree SCR 136','Grand Tree'),
    choices:[cardChoice('junk','Herdier SUM 104')],
    observation:{ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Gloom UNB 7',{stage:'STAGE1',
        evolutionPrintings:['Oddish UNB 5']})]})},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,
      maximumCount:1,allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(req),{
    kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'});
});

test('Grand Tree stage search abstains on a source-mismatched card instead of choosing it',()=>{
  const request=promptRequest({promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Grand Tree SCR 136','Grand Tree'),
    choices:[cardChoice('bad','Stoutland BCR 122')],
    observation:{ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})]})},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(request),{
    kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'});
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




test('Guzma chooses damaged physical duplicate instead of first matching printing', () => {
  const printed = 'Pidgeot ex OBF 164';
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Guzma BUS 115', 'Guzma'),
    choices: [
      pokemonChoice('healthy-first', printed, 'opponent', 'bench', 0),
      pokemonChoice('damaged-second', printed, 'opponent', 'bench', 1)
    ],
    observation: { opponentPublic: player({ bench: [
      pokemon(printed, { hp: 280, damage: 0 }),
      pokemon(printed, { hp: 280, damage: 270 })
    ] }) }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['damaged-second']
  });
});

test('Cassius targets damaged physical duplicate, not matching healthy bench slot', () => {
  const printed = 'Bunnelby PRC 121';
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Cassius XY 115', 'Cassius'),
    choices: [
      pokemonChoice('healthy', printed, 'actor', 'bench', 0),
      pokemonChoice('injured', printed, 'actor', 'bench', 1)
    ],
    observation: { ownPublic: player({ bench: [
      pokemon(printed, { hp: 70, damage: 0 }),
      pokemon(printed, { hp: 70, damage: 60 })
    ] }) }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['injured']
  });
});

test('Grand Tree chooses eligible older physical duplicate, not new Basic', () => {
  const printed = 'Oddish UNB 5';
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Grand Tree SCR 136', 'Grand Tree'),
    choices: [
      pokemonChoice('new', printed, 'actor', 'bench', 0),
      pokemonChoice('old', printed, 'actor', 'bench', 1)
    ],
    observation: { globalTurn: 3, ownPublic: player({ bench: [
      pokemon(printed, { lastPlayedOrEvolvedTurn: 3 }),
      pokemon(printed, { lastPlayedOrEvolvedTurn: 1 })
    ] }) }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['old']
  });
});

test('mismatched or absent physical slot is not guessed by printing', () => {
  const printed = 'Pidgeot ex OBF 164';
  const invalid = pokemonChoice('nonexistent', printed, 'opponent', 'bench', 4);
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Guzma BUS 115', 'Guzma'),
    choices: [invalid],
    observation: { opponentPublic: player({ bench: [
      pokemon(printed, { hp: 280, damage: 270 })
    ] }) }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'NO_SUPPORTED_CARD_SELECTION'
  });
});


test('Guzma completes the mandatory own-Bench switch into Stoutland lock', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Guzma BUS 115', 'Guzma'),
    choices: [
      pokemonChoice('bunnelby', 'Bunnelby PRC 121', 'actor', 'bench', 0),
      pokemonChoice('stoutland', 'Stoutland BCR 122', 'actor', 'bench', 1)
    ],
    observation: { ownPublic: player({
      active: pokemon('Fan Rotom SCR 118'),
      bench: [pokemon('Bunnelby PRC 121'), pokemon('Stoutland BCR 122')]
    }) }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['stoutland']
  });
});

test('Guzma own-Bench switch selects Bunnelby under visible Garbotoxin', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Guzma BUS 115', 'Guzma'),
    choices: [
      pokemonChoice('stoutland', 'Stoutland BCR 122', 'actor', 'bench', 0),
      pokemonChoice('bunnelby', 'Bunnelby PRC 121', 'actor', 'bench', 1)
    ],
    observation: {
      ownPublic: player({ active: pokemon('Fan Rotom SCR 118'), bench: [
        pokemon('Stoutland BCR 122'), pokemon('Bunnelby PRC 121')
      ] }),
      opponentPublic: player({ active: pokemon('Garbodor DRX 54', {
        abilities: ['Garbotoxin'], tools: ['Stealthy Hood UNB 186']
      }), deckCount: 6 })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['bunnelby']
  });
});


test('targetless Guzma root executes opponent gust and mandatory own switch', () => {
  const own = player({
    active: pokemon('Fan Rotom SCR 118'),
    bench: [pokemon('Stoutland BCR 122', {
      stage: 'STAGE2', subtypes: ['Stage 2']
    })]
  });
  const opposing = player({
    active: pokemon('Basic Water Pokémon SVE 1'),
    bench: [pokemon('Pidgeot ex OBF 164', { hp: 280, damage: 220 })]
  });
  const root = rootRequest({
    ownPublic: own, opponentPublic: opposing,
    items: [
      { token: 'guzma-root', kind: 'play-card', actorPrinting: 'Guzma BUS 115',
        label: 'Play Guzma', publicMetadata: { cardType: 'trainer', handIndex: 0 } },
      { token: 'pass', kind: 'pass', label: 'Pass turn' }
    ]
  });
  assert.deepEqual(checkedDecision(root), {
    kind: 'select-action', token: 'guzma-root'
  });
  const opposingPrompt = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Guzma BUS 115', 'Guzma'),
    choices: [pokemonChoice('opponent-target', 'Pidgeot ex OBF 164',
      'opponent', 'bench', 0)],
    observation: { ownPublic: own, opponentPublic: opposing }
  });
  assert.deepEqual(checkedDecision(opposingPrompt), {
    kind: 'select-choices', tokens: ['opponent-target']
  });
  const ownPrompt = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Guzma BUS 115', 'Guzma'),
    choices: [pokemonChoice('self-pivot', 'Stoutland BCR 122',
      'actor', 'bench', 0)],
    observation: { ownPublic: own, opponentPublic: opposing }
  });
  assert.deepEqual(checkedDecision(ownPrompt), {
    kind: 'select-choices', tokens: ['self-pivot']
  });
});

test('Guzma root abstains to Pass without an opponent Bench', () => {
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Fan Rotom SCR 118'),
      bench: [pokemon('Bunnelby PRC 121')] }),
    opponentPublic: player({ active: pokemon('Pidgeot ex OBF 164') }),
    items: [
      { token: 'guzma-root', kind: 'play-card', actorPrinting: 'Guzma BUS 115',
        label: 'Play Guzma', publicMetadata: { cardType: 'trainer', handIndex: 0 } },
      { token: 'pass', kind: 'pass', label: 'Pass turn' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'pass'
  });
});


function engineRequest(promptType,description,choices,publicMetadata,overrides={}){
  return promptRequest({promptType,description,source:actorChoiceSource(null,description),
    choices,publicMetadata,observation:{phase:1,...overrides}});
}
function setupCard(token,printing,index){
  return {token,kind:'card',printing,label:printing,publicMetadata:{
    selectionIndex:index,selectedCount:1,sourceZone:'hand',ownerSeat:'actor',
    isOwnerVisible:true}};
}
test('rank2 can select a native ordered starting board',()=>{
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',
    [setupCard('a','Bunnelby PRC 121',0),setupCard('b','Oddish UNB 5',3)],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:1,maximumCount:6});
  assert.deepEqual(checkedDecision(request),{kind:'select-choices',tokens:['a','b']});
});
test('rank2 opponent mulligan bonus uses min0 Bench-only placement, no new Active',()=>{
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('newB','Bunnelby PRC 121',0),
    setupCard('newOdd','Oddish UNB 5',1),
    {token:'empty',kind:'empty-selection',label:'Choose no items'}],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:0,maximumCount:2},{
      ownPublic:player({active:pokemon('Bunnelby PRC 121'),bench:[]})});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choices',tokens:['newOdd']});
});
test('rank2 mulligan extra setup puts only one new line in last Bench slot',()=>{
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('b','Bunnelby PRC 121',0),
    setupCard('odd','Oddish UNB 5',1),
    setupCard('pidgey','Pidgey MEW 16',2),
    {token:'empty',kind:'empty-selection',label:'Choose no items'}],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:0,maximumCount:3},{
      ownPublic:player({active:pokemon('Budew ASC 16'),bench:[
        pokemon('Fan Rotom SCR 118'),pokemon('Lillipup CEC 174'),
        pokemon('Girafarig LOT 94'),pokemon('Relicanth TEF 84')]})});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choices',tokens:['odd']});
});
test('rank2 mulligan extra setup declines when all five Bench slots occupied',()=>{
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('pidgey','Pidgey MEW 16',0),
    {token:'empty',kind:'empty-selection',label:'Choose no items'}],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:0,maximumCount:1},{
      ownPublic:player({active:pokemon('Bunnelby PRC 121'),bench:[
        pokemon('Oddish UNB 5'),pokemon('Lillipup CEC 174'),
        pokemon('Fan Rotom SCR 118'),pokemon('Budew ASC 16'),
        pokemon('Girafarig LOT 94')]})});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choice',token:'empty'});
});

test('rank2 reorders starting Basic to lead Bunnelby and reserves a Bench slot',()=>{
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('fan','Fan Rotom SCR 118',0),
    setupCard('odd','Oddish UNB 5',1),
    setupCard('odd2','Oddish UNB 5',2),
    setupCard('pidgey','Pidgey MEW 16',3),
    setupCard('lillipup','Lillipup CEC 174',4),
    setupCard('relicanth','Relicanth TEF 84',5),
    setupCard('bunnelby','Bunnelby PRC 121',6)
  ],{selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
    isOwnerVisible:true,isSecret:false,allowCancel:false,
    minimumCount:1,maximumCount:6});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choices',tokens:['bunnelby','odd','lillipup','pidgey','fan']});
});
test('rank2 leads Budew without Bunnelby while benching one each of three lines',()=>{
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('odd','Oddish UNB 5',0),
    setupCard('fan','Fan Rotom SCR 118',1),
    setupCard('budew','Budew ASC 16',2),
    setupCard('lillipup','Lillipup CEC 174',3),
    setupCard('pidgey','Pidgey MEW 16',4)
  ],{selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
    isOwnerVisible:true,isSecret:false,allowCancel:false,
    minimumCount:1,maximumCount:6});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choices',tokens:['budew','odd','lillipup','pidgey','fan']});
});
test('rank2 does not place duplicate setup lines into all starting Bench slots',()=>{
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('b1','Bunnelby PRC 121',0),
    setupCard('b2','Bunnelby PRC 121',1),
    setupCard('o1','Oddish UNB 5',2),
    setupCard('o2','Oddish UNB 5',3)
  ],{selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
    isOwnerVisible:true,isSecret:false,allowCancel:false,
    minimumCount:1,maximumCount:6});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choices',tokens:['b1','o1']});
});
test('rank2 leads zero-Energy Budew Item lock if Bunnelby TM is unfunded',()=>{
  const hand=['Budew ASC 16','Bunnelby PRC 121','Oddish UNB 5','Pidgey MEW 16',
    'Stealthy Hood UNB 186','Guzma BUS 115','Grand Tree SCR 136'];
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('bunnelby','Bunnelby PRC 121',0),
    setupCard('budew','Budew ASC 16',1),
    setupCard('oddish','Oddish UNB 5',2),
    setupCard('pidgey','Pidgey MEW 16',3)],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:1,maximumCount:6},{ownHand:hand});
  assert.deepEqual(checkedDecision(request),{kind:'select-choices',
    tokens:['budew','oddish','bunnelby','pidgey']});
});
test('rank2 leads Bunnelby for fully funded T1 TM Evolution attack',()=>{
  const hand=['Budew ASC 16','Bunnelby PRC 121','Oddish UNB 5',
    'Technical Machine: Evolution PAR 178','Capture Energy RCL 171',
    'Stealthy Hood UNB 186','Guzma BUS 115'];
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('budew','Budew ASC 16',0),
    setupCard('bunnelby','Bunnelby PRC 121',1),
    setupCard('oddish','Oddish UNB 5',2)],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:1,maximumCount:6},{ownHand:hand});
  assert.deepEqual(checkedDecision(request),{kind:'select-choices',
    tokens:['bunnelby','oddish']});
});
test('rank2 chooses Bunnelby when Hala can pay 2 and fetch TM plus Jet',()=>{
  const hand=['Budew ASC 16','Bunnelby PRC 121','Oddish UNB 5',
    'Guzma & Hala CEC 193','Tag Call CEC 206','Artazon PAL 171',
    'Pidgeotto TEU 123'];
  const req=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('budew','Budew ASC 16',0),setupCard('b','Bunnelby PRC 121',1),
    setupCard('odd','Oddish UNB 5',2)],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:1,maximumCount:6},{ownHand:hand});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['b','odd']});
});
test('rank2 chooses Bunnelby for Tag Call to Hala with two discards',()=>{
  const hand=['Budew ASC 16','Bunnelby PRC 121','Lillipup CEC 174',
    'Tag Call CEC 206','Artazon PAL 171','Counter Gain SSP 169',
    'Plumeria BUS 120'];
  const req=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('budew','Budew ASC 16',0),setupCard('b','Bunnelby PRC 121',1),
    setupCard('l','Lillipup CEC 174',2)],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:1,maximumCount:6},{ownHand:hand});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['b','l']});
});
test('rank2 keeps Budew if Hala payment would burn protected lock',()=>{
  const hand=['Budew ASC 16','Bunnelby PRC 121','Oddish UNB 5',
    'Guzma & Hala CEC 193','Vileplume AOR 3','Stoutland BCR 122',
    'Guzma BUS 115'];
  const req=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('b','Bunnelby PRC 121',0),setupCard('budew','Budew ASC 16',1),
    setupCard('odd','Oddish UNB 5',2)],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:1,maximumCount:6},{ownHand:hand});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['budew','odd','b']});
});

test('rank2 chooses Budew when TM Tool is held but Energy is missing',()=>{
  const hand=['Bunnelby PRC 121','Budew ASC 16','Oddish UNB 5',
    'Technical Machine: Evolution PAR 178','Grand Tree SCR 136',
    'Faba LOT 173','Guzma & Hala CEC 193'];
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('b','Bunnelby PRC 121',0),
    setupCard('budew','Budew ASC 16',1),
    setupCard('oddish','Oddish UNB 5',2)],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:1,maximumCount:6},{ownHand:hand});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choices',tokens:['budew','oddish','b']});
});

test('rank2 respects narrow native maximum starting-selection count',()=>{
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('p','Pidgey MEW 16',0),
    setupCard('o','Oddish UNB 5',1),
    setupCard('b','Bunnelby PRC 121',2),
    setupCard('l','Lillipup CEC 174',3)
  ],{selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
    isOwnerVisible:true,isSecret:false,allowCancel:false,
    minimumCount:1,maximumCount:2});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choices',tokens:['b','o']});
});

test('rank2 can mulligan without Basic when native setup offers empty',()=>{
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',
    [{token:'empty',kind:'empty-selection',label:'Choose no items'}],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:0,maximumCount:0});
  assert.deepEqual(checkedDecision(request),{kind:'select-choice',token:'empty'});
});
test('rank2 chooses to go second for Barrage Evolution opportunity',()=>{
  const request=engineRequest('ConfirmPrompt','GO_FIRST',
    [{token:'yes',kind:'confirm',label:'Yes'},{token:'no',kind:'confirm',label:'No'}],
    {selectionType:'confirm'});
  assert.deepEqual(checkedDecision(request),{kind:'select-choice',token:'no'});
});
test('rank2 takes largest native optional opponent mulligan draw',()=>{
  const request=engineRequest('SelectPrompt','WANT_TO_DRAW_CARDS',[
    {token:'one',kind:'option',label:'Draw 1 card(s)',publicMetadata:{choiceIndex:1}},
    {token:'two',kind:'option',label:'Draw 2 card(s)',publicMetadata:{choiceIndex:0}},
    {token:'zero',kind:'option',label:'Draw 0 card(s)',publicMetadata:{choiceIndex:2}}],
    {selectionType:'option',count:3,allowCancel:false});
  assert.deepEqual(checkedDecision(request),{kind:'select-choice',token:'two'});
});
test('setup prompt refuses forged card source even with matching description',()=>{
  const request=engineRequest('ConfirmPrompt','GO_FIRST',
    [{token:'yes',kind:'confirm',label:'Yes'},{token:'no',kind:'confirm',label:'No'}],
    {selectionType:'confirm'});
  request.prompt.source=actorChoiceSource('Guzma BUS 115','GO_FIRST');
  assert.deepEqual(checkedDecision(request),{
    kind:'abstain',reasonCode:'UNTRUSTED_ENGINE_SETUP_PROMPT'});
});
test('setup prompt outside game setup is rejected',()=>{
  const request=engineRequest('ConfirmPrompt','GO_FIRST',
    [{token:'yes',kind:'confirm',label:'Yes'},{token:'no',kind:'confirm',label:'No'}],
    {selectionType:'confirm'},{phase:2});
  assert.deepEqual(checkedDecision(request),{
    kind:'abstain',reasonCode:'UNSUPPORTED_ENGINE_SETUP_PHASE'});
});


test('Tool-less Garbotoxin does not veto a Stoutland Guzma pivot',()=>{
  const request=promptRequest({
    promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Guzma BUS 115','Guzma'),
    choices:[pokemonChoice('stoutland','Stoutland BCR 122','actor','bench',0),
      pokemonChoice('bunnelby','Bunnelby PRC 121','actor','bench',1)],
    observation:{
      ownPublic:player({active:pokemon('Fan Rotom SCR 118'),bench:[
        pokemon('Stoutland BCR 122'),pokemon('Bunnelby PRC 121')]}),
      opponentPublic:player({active:pokemon('Garbodor DRX 54',{
        abilities:['Garbotoxin'],tools:[]}),deckCount:6})
    }
  });
  assert.deepEqual(checkedDecision(request),{kind:'select-choices',tokens:['stoutland']});
});
test('Tool-less Garbotoxin does not stop a Stoutland root retreat',()=>{
  const request=rootRequest({
    ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Stoutland BCR 122')]}),
    opponentPublic:player({active:pokemon('Garbodor DRX 54',{
      abilities:['Garbotoxin'],tools:[]})}),
    items:[{token:'retreat-stoutland',kind:'retreat',
      actorPrinting:'Bunnelby PRC 121',targetPrinting:'Stoutland BCR 122',
      publicMetadata:{benchIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]
  });
  assert.deepEqual(checkedDecision(request),{
    kind:'select-action',token:'retreat-stoutland'});
});
test('Certified suppressed Tool-bearing Garbotoxin permits Stoutland pivot',()=>{
  const garbodor=pokemon('Garbodor DRX 54',{
    abilities:['Garbotoxin'],tools:['Stealthy Hood UNB 186']});
  garbodor.abilitySuppressions=[{
    abilityName:'Garbotoxin',suppressed:true,
    reasonCode:'ABILITY_LOCKED',sourcePrinting:'Galarian Weezing RCL 113'}];
  const request=promptRequest({
    promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Guzma BUS 115','Guzma'),
    choices:[pokemonChoice('stoutland','Stoutland BCR 122','actor','bench',0),
      pokemonChoice('bunnelby','Bunnelby PRC 121','actor','bench',1)],
    observation:{
      ownPublic:player({active:pokemon('Fan Rotom SCR 118'),bench:[
        pokemon('Stoutland BCR 122'),pokemon('Bunnelby PRC 121')]}),
      opponentPublic:player({active:garbodor,deckCount:6})
    }
  });
  assert.deepEqual(checkedDecision(request),{kind:'select-choices',tokens:['stoutland']});
});


test('targetless Guzma still gusts with no own Bench under partial-resolution rule',()=>{
  const request=rootRequest({
    ownPublic:player({active:pokemon('Vileplume-GX CEC 4'),bench:[]}),
    opponentPublic:player({active:pokemon('Snorlax PGO 55'),bench:[
      pokemon('Pidgeot ex OBF 164',{hp:280,damage:270})
    ]}),
    items:[
      {token:'guzma',kind:'play-card',actorPrinting:'Guzma BUS 115',
        publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}
    ]
  });
  assert.deepEqual(checkedDecision(request),{
    kind:'select-action',token:'guzma'});
});


function tmRootAction(token,targetPrinting,zone,index){
  return {token,kind:'play-card',actorPrinting:'Technical Machine: Evolution PAR 178',
    targetPrinting,publicMetadata:{cardType:'trainer',handIndex:0,
    targetSeat:'actor',targetZone:zone,targetIndex:index,isOwnerVisible:true}};
}
test('TM Evolution chooses physical Bunnelby over offered unrelated Bench Pokémon',()=>{
  const request=rootRequest({ownHand:['Technical Machine: Evolution PAR 178'],
    ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Oddish UNB 5')]}),
    items:[tmRootAction('on-oddish','Oddish UNB 5','bench',0),
      tmRootAction('on-bunnelby','Bunnelby PRC 121','active',0),
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-action',token:'on-bunnelby'});
});
test('TM Evolution without a Bunnelby target is not burned onto a Bench Basic',()=>{
  const request=rootRequest({ownHand:['Technical Machine: Evolution PAR 178'],
    ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Oddish UNB 5')]}),
    items:[tmRootAction('on-oddish','Oddish UNB 5','bench',0),
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(request),{kind:'select-action',token:'pass'});
});
test('TM Evolution still supports a Benched Bunnelby when Jet Energy can activate it',()=>{
  const request=rootRequest({
    ownHand:['Technical Machine: Evolution PAR 178','Jet Energy PAL 190'],
    ownPublic:player({active:pokemon('Fan Rotom SCR 118'),
      bench:[pokemon('Bunnelby PRC 121'),pokemon('Oddish UNB 5')]}),
    items:[tmRootAction('on-bunnelby','Bunnelby PRC 121','bench',0),
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-action',token:'on-bunnelby'});
});


test('Plumeria completes root, discard-two, opponent target and Energy prompts',()=>{
 const own=player({active:pokemon('Bunnelby PRC 121')});
 const opp=player({active:pokemon('Shadow Rider Calyrex V CRE 74',{
    energies:['Psychic Energy MEE 5']}),
   bench:[pokemon('Regidrago V SIT 135',{
    energies:['Double Dragon Energy ROS 97']})]});
 const ownHand=['Plumeria BUS 120','Tag Call CEC 206','Tag Call CEC 206'];
 const root=rootRequest({ownHand,ownPublic:own,opponentPublic:opp,
   items:[{token:'plumeria',kind:'play-card',
     actorPrinting:'Plumeria BUS 120',
     publicMetadata:{cardType:'trainer',handIndex:0}},
    {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(root),{kind:'select-action',token:'plumeria'});
 const discard=promptRequest({promptType:'ChooseCardsPrompt',
   source:actorChoiceSource('Plumeria BUS 120','Plumeria'),
   choices:[cardChoice('first','Tag Call CEC 206','hand'),
     cardChoice('second','Tag Call CEC 206','hand')],
   publicMetadata:{selectionType:'card-combination',minimumCount:2,
     maximumCount:2,isSecret:false,allowCancel:false},
   observation:{ownHand,ownPublic:own,opponentPublic:opp}});
 assert.deepEqual(checkedDecision(discard),{
   kind:'select-choices',tokens:['first','second']});
 const target=promptRequest({promptType:'ChoosePokemonPrompt',
   source:actorChoiceSource('Plumeria BUS 120','Plumeria'),
   choices:[pokemonChoice('basic','Shadow Rider Calyrex V CRE 74',
     'opponent','active',0),pokemonChoice('special','Regidrago V SIT 135',
     'opponent','bench',0)],
   observation:{ownPublic:own,opponentPublic:opp}});
 assert.deepEqual(checkedDecision(target),{
   kind:'select-choices',tokens:['special']});
 const energy=promptRequest({promptType:'ChooseEnergyPrompt',
   source:actorChoiceSource('Plumeria BUS 120','Plumeria'),
   choices:[{token:'energy',kind:'energy',
      printing:'Double Dragon Energy ROS 97',label:'Double Dragon Energy ROS 97',
      publicMetadata:{selectionIndex:0,selectedCount:1,sourceZone:'active',
        ownerSeat:'opponent',isOwnerVisible:true,energyType:'Dragon'}}],
   publicMetadata:{selectionType:'energy-payment',count:1,energyCount:1,
     energyType:'',allowCancel:false},
   observation:{ownPublic:own,opponentPublic:opp}});
 assert.deepEqual(checkedDecision(energy),{
   kind:'select-choices',tokens:['energy']});
});
test('Plumeria waits for two cost-capable cards after paying the Supporter',()=>{
 const request=rootRequest({
   ownHand:['Plumeria BUS 120','Vileplume AOR 3'],
   ownPublic:player({active:pokemon('Bunnelby PRC 121')}),
   opponentPublic:player({active:pokemon('Regidrago V SIT 135',{
     energies:['Double Dragon Energy ROS 97']})}),
   items:[{token:'plumeria',kind:'play-card',
     actorPrinting:'Plumeria BUS 120',
     publicMetadata:{cardType:'trainer',handIndex:0}},
    {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(request),{kind:'select-action',token:'pass'});
});
test('Plumeria prompt refuses visible target with no attached Energy',()=>{
 const request=promptRequest({promptType:'ChoosePokemonPrompt',
   source:actorChoiceSource('Plumeria BUS 120','Plumeria'),
   choices:[pokemonChoice('empty','Regidrago V SIT 135',
     'opponent','bench',0)],
   observation:{opponentPublic:player({bench:[
     pokemon('Regidrago V SIT 135',{energies:[]})]})}});
 assert.deepEqual(checkedDecision(request),{
   kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'});
});


test('Faba follows printed opponent Tool target into an exact discard-or-Lost-Zone choice',()=>{
 const own=player({active:pokemon('Bunnelby PRC 121')});
 const opp=player({active:pokemon('Regidrago V SIT 135',{tools:[]}),
   bench:[pokemon('Regidrago V SIT 135',{tools:['Stealthy Hood UNB 186']})]});
 const root=rootRequest({ownHand:['Faba LOT 173'],ownPublic:own,opponentPublic:opp,
   items:[{token:'faba',kind:'play-card',actorPrinting:'Faba LOT 173',
     publicMetadata:{cardType:'trainer',handIndex:0}},
     {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(root),{kind:'select-action',token:'faba'});
 const target=promptRequest({promptType:'ChoosePokemonPrompt',
   source:actorChoiceSource('Faba LOT 173','Faba'),
   choices:[pokemonChoice('empty-active','Regidrago V SIT 135',
     'opponent','active',0),
     pokemonChoice('tool-bench','Regidrago V SIT 135',
       'opponent','bench',0)],
   observation:{ownPublic:own,opponentPublic:opp}});
 assert.deepEqual(checkedDecision(target),{
   kind:'select-choices',tokens:['tool-bench']});
 const removal=promptRequest({promptType:'ChooseCardsPrompt',
   source:actorChoiceSource('Faba LOT 173','Faba'),
   choices:[cardChoice('hood','Stealthy Hood UNB 186','tool','opponent')],
   observation:{ownPublic:own,opponentPublic:opp},
   publicMetadata:{selectionType:'card-combination',minimumCount:1,
     maximumCount:1,isSecret:false,allowCancel:false}});
 assert.deepEqual(checkedDecision(removal),{
   kind:'select-choices',tokens:['hood']});
});
test('Faba prefers Special Energy holder over Tool-only opponent',()=>{
 const request=promptRequest({promptType:'ChoosePokemonPrompt',
   source:actorChoiceSource('Faba LOT 173','Faba'),
   choices:[pokemonChoice('tool','Bunnelby PRC 121','opponent','bench',0),
     pokemonChoice('special','Regidrago V SIT 135','opponent','bench',1)],
   observation:{opponentPublic:player({bench:[
     pokemon('Bunnelby PRC 121',{tools:['Stealthy Hood UNB 186']}),
     pokemon('Regidrago V SIT 135',{energies:['Double Dragon Energy ROS 97']})
   ]})}});
 assert.deepEqual(checkedDecision(request),{
   kind:'select-choices',tokens:['special']});
});
test('Faba card selection rejects Basic Energy misclassified as Special',()=>{
 const request=promptRequest({promptType:'ChooseCardsPrompt',
   source:actorChoiceSource('Faba LOT 173','Faba'),
   choices:[cardChoice('grass','Grass Energy MEE 9','energy','opponent')],
   observation:{opponentPublic:player({active:pokemon('Bunnelby PRC 121',{
     energies:['Grass Energy MEE 9']})})},
   publicMetadata:{selectionType:'card-combination',minimumCount:1,
     maximumCount:1,allowCancel:false,isSecret:false}});
 assert.deepEqual(checkedDecision(request),{
   kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'});
});


test('Faba does not misclassify Basic Fairy Energy as removable Special Energy',()=>{
  const request=rootRequest({
    ownHand:['Faba LOT 173'],
    ownPublic:player({active:pokemon('Bunnelby PRC 121')}),
    opponentPublic:player({active:pokemon('Bunnelby PRC 121',{
      energies:['Fairy Energy SUM 172']})}),
    items:[{token:'faba',kind:'play-card',actorPrinting:'Faba LOT 173',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]
  });
  assert.deepEqual(checkedDecision(request),{kind:'select-action',token:'pass'});
});


test('Plumeria spends Special Energy rather than Basic Fairy Energy from same Pokemon',()=>{
  const request=promptRequest({
    promptType:'ChooseEnergyPrompt',
    source:actorChoiceSource('Plumeria BUS 120','Plumeria'),
    choices:[
      {token:'fairy',kind:'energy',printing:'Fairy Energy SUM 172',
        label:'Fairy Energy SUM 172',publicMetadata:{energyType:'Fairy'}},
      {token:'double-dragon',kind:'energy',
        printing:'Double Dragon Energy ROS 97',label:'Double Dragon Energy ROS 97',
        publicMetadata:{energyType:'Dragon'}}
    ],
    publicMetadata:{selectionType:'energy-payment',count:2,
      energyCount:1,energyType:'',allowCancel:false},
    observation:{opponentPublic:player({active:pokemon('Regidrago V SIT 135',{
      energies:['Fairy Energy SUM 172','Double Dragon Energy ROS 97']})})}
  });
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choices',tokens:['double-dragon']});
});


function hoodRootAction(token,targetPrinting,zone,index){
 return {token,kind:'play-card',actorPrinting:'Stealthy Hood UNB 186',
   targetPrinting,publicMetadata:{cardType:'trainer',handIndex:0,
     targetSeat:'actor',targetZone:zone,targetIndex:index,isOwnerVisible:true}};
}
test('Stealthy Hood protects the Gloom/Vileplume lock line, not first offered Bunnelby',()=>{
 const request=rootRequest({
   ownHand:['Stealthy Hood UNB 186'],
   ownPublic:player({active:pokemon('Bunnelby PRC 121'),bench:[
     pokemon('Gloom UNB 7',{stage:'STAGE1',subtypes:['Stage 1']})]}),
   opponentPublic:player({active:pokemon('Garbodor DRX 54',{
     abilities:['Garbotoxin'],tools:['Float Stone BKT 137']})}),
   items:[hoodRootAction('bunnelby','Bunnelby PRC 121','active',0),
     hoodRootAction('gloom','Gloom UNB 7','bench',0),
     {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{kind:'select-action',token:'gloom'});
});
test('Stealthy Hood is preserved if its only offered target is irrelevant to item lock',()=>{
 const request=rootRequest({
   ownHand:['Stealthy Hood UNB 186'],
   ownPublic:player({active:pokemon('Bunnelby PRC 121')}),
   opponentPublic:player({active:pokemon('Garbodor DRX 54',{
     abilities:['Garbotoxin'],tools:['Float Stone BKT 137']})}),
   items:[hoodRootAction('bunnelby','Bunnelby PRC 121','active',0),
     {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{kind:'select-action',token:'pass'});
});
test('Stealthy Hood can preserve a visible Pidgeot engine under opposing Garbotoxin',()=>{
 const request=rootRequest({
   ownHand:['Stealthy Hood UNB 186'],
   ownPublic:player({active:pokemon('Bunnelby PRC 121'),bench:[
     pokemon('Pidgeot ex OBF 164',{stage:'STAGE2',subtypes:['Stage 2','ex']})]}),
   opponentPublic:player({active:pokemon('Garbodor DRX 54',{
     abilities:['Garbotoxin'],tools:['Float Stone BKT 137']})}),
   items:[hoodRootAction('pidgeot','Pidgeot ex OBF 164','bench',0),
     {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{kind:'select-action',token:'pidgeot'});
});


function grandTreeRoot(observationOptions={}){
 return rootRequest({
   ownHand:['Grand Tree SCR 136'],
   ownPublic:observationOptions.ownPublic??player({
     active:pokemon('Bunnelby PRC 121'),
     bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:3})]}),
   opponentPublic:observationOptions.opponentPublic??player(),
   globalTurn:observationOptions.globalTurn??3,
   items:[{token:'grand-tree',kind:'play-card',
     actorPrinting:'Grand Tree SCR 136',
     publicMetadata:{cardType:'trainer',handIndex:0}},
     {token:'pass',kind:'pass',label:'Pass turn'}]
 });
}
test('Grand Tree ACE SPEC is saved if only current-turn Basic evolution target exists',()=>{
 const request=grandTreeRoot({globalTurn:3,
   ownPublic:player({active:pokemon('Bunnelby PRC 121'),
     bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:3})]})});
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'pass'});
});
test('Grand Tree ACE SPEC is used when prior-turn Basic and K0 line are eligible',()=>{
 const request=grandTreeRoot({globalTurn:3,
   ownPublic:player({active:pokemon('Bunnelby PRC 121'),
     bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})]})});
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'grand-tree'});
});
test('rank2 refuses Guzma & Hala Stadium-only search when K1 confirms Grand Tree Prized',()=>{
  const own=player({active:pokemon('Bunnelby PRC 121'),
    bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})]});
  const req=rootRequest({ownHand:['Guzma & Hala CEC 193'],ownPublic:own,
    ownerK1:{epoch:1,exactMembershipKnown:true,invalidationReason:null,
      knownPrintings:[
        {printing:'Gloom UNB 7',copies:2},
        {printing:'Vileplume AOR 3',copies:2},
        {printing:'Grand Tree SCR 136',copies:0},
        {printing:'Artazon PAL 171',copies:0}]},
    items:[{token:'hala',kind:'play-card',actorPrinting:'Guzma & Hala CEC 193',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'pass'});
});
test('rank2 still uses Guzma & Hala when same K1 knowledge confirms Grand Tree in deck',()=>{
  const req=rootRequest({ownHand:['Guzma & Hala CEC 193'],
    ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})]}),
    ownerK1:{epoch:1,exactMembershipKnown:true,invalidationReason:null,
      knownPrintings:[{printing:'Gloom UNB 7',copies:1},
        {printing:'Vileplume AOR 3',copies:1},
        {printing:'Grand Tree SCR 136',copies:1}]},
    items:[{token:'hala',kind:'play-card',actorPrinting:'Guzma & Hala CEC 193',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'hala'});
});
test('rank2 treats invalidated K1 as uncertain K0, not a false zero deck',()=>{
  const req=rootRequest({ownHand:['Guzma & Hala CEC 193'],
    ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})]}),
    ownerK1:{epoch:2,exactMembershipKnown:false,
      invalidationReason:'owner deck was shuffled since first search',
      knownPrintings:null},
    items:[{token:'hala',kind:'play-card',actorPrinting:'Guzma & Hala CEC 193',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'hala'});
});

test('Grand Tree can still counter an opposing Path to the Peak Stadium',()=>{
 const request=grandTreeRoot({globalTurn:3,
   ownPublic:player({active:pokemon('Bunnelby PRC 121'),
     bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:3})]}),
   opponentPublic:player({stadium:['Path to the Peak CRE 148']})});
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'grand-tree'});
});


test('publicly revealed own hand is not double-counted as exhausted K0 Stage copies',()=>{
 const hand=['Grand Tree SCR 136','Gloom UNB 7'];
 const request=rootRequest({
   ownHand:hand,globalTurn:3,
   ownPublic:player({
     active:pokemon('Bunnelby PRC 121'),
     bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})],
     publicHand:hand
   }),
   items:[{token:'grand-tree',kind:'play-card',actorPrinting:'Grand Tree SCR 136',
     publicMetadata:{cardType:'trainer',handIndex:0}},
     {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'grand-tree'});
});
test('two physically held Gloom copies still exhaust Grand Tree Stage1 search',()=>{
 const hand=['Grand Tree SCR 136','Gloom UNB 7','Gloom UNB 7'];
 const request=rootRequest({
   ownHand:hand,globalTurn:3,
   ownPublic:player({
     active:pokemon('Bunnelby PRC 121'),
     bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})],
     publicHand:hand
   }),
   items:[{token:'grand-tree',kind:'play-card',actorPrinting:'Grand Tree SCR 136',
     publicMetadata:{cardType:'trainer',handIndex:0}},
     {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'pass'});
});


function artazonRoot(ownPublic,opponentPublic=player()){
 return rootRequest({ownHand:['Artazon PAL 171'],ownPublic,opponentPublic,
   items:[{token:'artazon',kind:'play-card',
     actorPrinting:'Artazon PAL 171',
     publicMetadata:{cardType:'trainer',handIndex:0}},
    {token:'pass',kind:'pass',label:'Pass turn'}]});
}
test('Artazon is not played with full Bench and no Stadium suppressor',()=>{
 const full=[pokemon('Bunnelby PRC 121'),pokemon('Oddish UNB 5'),
   pokemon('Lillipup CEC 175'),pokemon('Pidgey MEW 16'),
   pokemon('Girafarig LOT 94')];
 const request=artazonRoot(player({active:pokemon('Fan Rotom SCR 118'),
   bench:full,stadium:['Grand Tree SCR 136']}));
 assert.deepEqual(checkedDecision(request),{kind:'select-action',token:'pass'});
});
test('Artazon is available to search a Basic into an actual vacant Bench slot',()=>{
 const request=artazonRoot(player({active:pokemon('Bunnelby PRC 121'),
   bench:[pokemon('Oddish UNB 5')]}));
 assert.deepEqual(checkedDecision(request),{kind:'select-action',token:'artazon'});
});
test('Artazon can replace Path to the Peak even if actor Bench is full',()=>{
 const full=[pokemon('Bunnelby PRC 121'),pokemon('Oddish UNB 5'),
   pokemon('Lillipup CEC 175'),pokemon('Pidgey MEW 16'),
   pokemon('Girafarig LOT 94')];
 const request=artazonRoot(player({active:pokemon('Fan Rotom SCR 118'),
   bench:full}),player({stadium:['Path to the Peak CRE 148']}));
 assert.deepEqual(checkedDecision(request),{kind:'select-action',token:'artazon'});
});


test('Get Lost eliminates Regidrago Timeless-GX and Phantom Dive before VS Seeker',()=>{
 const opponent=player({
   active:pokemon('Regidrago VSTAR SIT 136'),
   discard:['Dialga-GX UPR 100','Dragapult ex TWM 130','VS Seeker PHF 109']
 });
 const request=promptRequest({promptType:'ChooseCardsPrompt',
   source:actorChoiceSource('Girafarig LOT 94','Get Lost'),
   choices:[cardChoice('vs','VS Seeker PHF 109','discard','opponent'),
     cardChoice('dialga','Dialga-GX UPR 100','discard','opponent'),
     cardChoice('dragapult','Dragapult ex TWM 130','discard','opponent')],
   observation:{opponentPublic:opponent},
   publicMetadata:{selectionType:'card-combination',minimumCount:2,
     maximumCount:2,allowCancel:false,isSecret:false}});
 assert.deepEqual(checkedDecision(request),{
   kind:'select-choices',tokens:['dialga','dragapult']});
});
test('Get Lost preserves generic resource-priority ordering off Regidrago matchup',()=>{
 const opponent=player({
   active:pokemon('Iron Thorns ex TWM 77'),
   discard:['Dialga-GX UPR 100','Dragapult ex TWM 130','VS Seeker PHF 109']
 });
 const request=promptRequest({promptType:'ChooseCardsPrompt',
   source:actorChoiceSource('Girafarig LOT 94','Get Lost'),
   choices:[cardChoice('vs','VS Seeker PHF 109','discard','opponent'),
     cardChoice('dialga','Dialga-GX UPR 100','discard','opponent'),
     cardChoice('dragapult','Dragapult ex TWM 130','discard','opponent')],
   observation:{opponentPublic:opponent},
   publicMetadata:{selectionType:'card-combination',minimumCount:2,
     maximumCount:2,allowCancel:false,isSecret:false}});
 assert.deepEqual(checkedDecision(request),{
   kind:'select-choices',tokens:['vs','dialga']});
});
test('Get Lost can remove one Regidrago Dragon payload and one other legal target',()=>{
 const request=promptRequest({promptType:'ChooseCardsPrompt',
   source:actorChoiceSource('Girafarig LOT 94','Get Lost'),
   choices:[cardChoice('vs','VS Seeker PHF 109','discard','opponent'),
     cardChoice('dialga','Dialga-GX UPR 100','discard','opponent')],
   observation:{opponentPublic:player({active:pokemon('Regidrago VSTAR SIT 136')})},
   publicMetadata:{selectionType:'card-combination',minimumCount:2,
     maximumCount:2,allowCancel:false,isSecret:false}});
 assert.deepEqual(checkedDecision(request),{
   kind:'select-choices',tokens:['dialga','vs']});
});


test('Get Lost demotes spent Timeless-GX after opponent publicly used GX attack',()=>{
 const request=promptRequest({
   promptType:'ChooseCardsPrompt',
   source:actorChoiceSource('Girafarig LOT 94','Get Lost'),
   choices:[cardChoice('dialga','Dialga-GX UPR 100','discard','opponent'),
     cardChoice('dragapult','Dragapult ex TWM 130','discard','opponent'),
     cardChoice('vs','VS Seeker PHF 109','discard','opponent')],
   observation:{opponentPublic:player({active:pokemon('Regidrago VSTAR SIT 136'),
     publicTurnRestrictions:{gxUsed:true}})},
   publicMetadata:{selectionType:'card-combination',minimumCount:2,
     maximumCount:2,allowCancel:false,isSecret:false}});
 assert.deepEqual(checkedDecision(request),{
   kind:'select-choices',tokens:['dragapult','vs']});
});


function energyRootAction(token, printing, targetPrinting, zone, index) {
  return {token, kind: 'play-card', actorPrinting: printing,
    targetPrinting, publicMetadata: {
      cardType: 'energy', handIndex: 0, targetSeat: 'actor',
      targetZone: zone, targetIndex: index, isOwnerVisible: true
    }};
}
test('Memory Energy targets Stoutland with Lillipup beneath it over unrelated Bunnelby',()=>{
 const own=player({active:pokemon('Stoutland BCR 122', {
   stage:'STAGE2',subtypes:['Stage 2'],abilities:['Sentinel'],
   evolutionPrintings:['Lillipup CEC 174','Herdier SUM 104','Stoutland BCR 122']
 }),bench:[pokemon('Bunnelby PRC 121')]});
 const request=rootRequest({ownHand:['Memory Energy LOT 194'],ownPublic:own,
   items:[energyRootAction('wrong','Memory Energy LOT 194',
      'Bunnelby PRC 121','bench',0),
     energyRootAction('correct','Memory Energy LOT 194',
      'Stoutland BCR 122','active',0),
     {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'correct'});
});
test('Memory Energy is saved when active Bunnelby already has attack Energy',()=>{
 const request=rootRequest({ownHand:['Memory Energy LOT 194'],
   ownPublic:player({active:pokemon('Bunnelby PRC 121',{
     energies:['Capture Energy RCL 171']})}),
   items:[energyRootAction('extra','Memory Energy LOT 194',
      'Bunnelby PRC 121','active',0),
     {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'pass'});
});
test('Memory Energy requires known prior Lillipup evolution on recipient',()=>{
 const request=rootRequest({ownHand:['Memory Energy LOT 194'],
   ownPublic:player({active:pokemon('Stoutland BCR 122',{
     evolutionPrintings:['Stoutland BCR 122']})}),
   items:[energyRootAction('stoutland','Memory Energy LOT 194',
      'Stoutland BCR 122','active',0),
     {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'pass'});
});
test('Jet Energy targets Benched Bunnelby carrying TM, not Active duplicate Bunnelby',()=>{
 const request=rootRequest({ownHand:['Jet Energy PAL 190'],
   ownPublic:player({active:pokemon('Bunnelby PRC 121',{
     tools:['Technical Machine: Evolution PAR 178']
   }),bench:[pokemon('Bunnelby PRC 121',{
     tools:['Technical Machine: Evolution PAR 178']
   }),pokemon('Oddish UNB 5')]}),
   items:[energyRootAction('active','Jet Energy PAL 190',
      'Bunnelby PRC 121','active',0),
     energyRootAction('bench','Jet Energy PAL 190',
      'Bunnelby PRC 121','bench',0),
     {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'bench'});
});
test('Jet Energy no longer gets high TM score when attached to Bench Bunnelby without Tool',()=>{
 const request=rootRequest({ownHand:['Jet Energy PAL 190'],
   ownPublic:player({active:pokemon('Bunnelby PRC 121',{
     tools:['Technical Machine: Evolution PAR 178']
   }),bench:[pokemon('Bunnelby PRC 121'),pokemon('Oddish UNB 5')]}),
   items:[energyRootAction('bench','Jet Energy PAL 190',
      'Bunnelby PRC 121','bench',0),
     {token:'pass',kind:'pass',label:'Pass turn'}]});
 // A routine Energy attachment still has value, but no double Evolution turbo bonus.
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'bench'});
});


test('Memory Energy is a live Colorless attachment for immediate Bunnelby Burrow',()=>{
 const request=rootRequest({
   ownHand:['Memory Energy LOT 194'],
   ownPublic:player({active:pokemon('Bunnelby PRC 121',{energies:[]})}),
   opponentPublic:player({deckCount:1}),
   items:[energyRootAction('mill-energy','Memory Energy LOT 194',
     'Bunnelby PRC 121','active',0),
    {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'mill-energy'});
});
test('Memory Energy can fuel Bunnelby Rototiller before self deck-out',()=>{
 const request=rootRequest({
   ownHand:['Memory Energy LOT 194'],
   ownPublic:player({active:pokemon('Bunnelby PRC 121',{energies:[]}),
     deckCount:1,discard:['Guzma & Hala CEC 193']}),
   opponentPublic:player({deckCount:25}),
   items:[energyRootAction('recover-energy','Memory Energy LOT 194',
      'Bunnelby PRC 121','active',0),
     {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'recover-energy'});
});


test('Get Lost root chooses Dragon denial over legal retreat to Stoutland',()=>{
  const opponent=player({active:pokemon('Regidrago VSTAR SIT 136'),
    discard:['Dialga-GX UPR 100','Dragapult ex TWM 130'],deckCount:28});
  const request=rootRequest({
    ownPublic:player({active:pokemon('Girafarig LOT 94',{
      energies:['Memory Energy LOT 194']}),
      bench:[pokemon('Stoutland BCR 122')]}),
    opponentPublic:opponent,items:[
      {token:'get-lost',kind:'attack',actorPrinting:'Girafarig LOT 94',
       attackName:'Get Lost',label:'Get Lost'},
      {token:'retreat-stoutland',kind:'retreat',
       actorPrinting:'Girafarig LOT 94',targetPrinting:'Stoutland BCR 122',
       publicMetadata:{benchIndex:0,targetSeat:'actor',
         targetZone:'bench',targetIndex:0,isOwnerVisible:true}},
      {token:'pass',kind:'pass',label:'Pass turn'}
    ]});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-action',token:'get-lost'});
});
test('Get Lost never overrides terminal Burrow that removes last opponent deck card',()=>{
 const request=rootRequest({
   ownPublic:player({active:pokemon('Bunnelby PRC 121'),deckCount:1,
     discard:['Guzma & Hala CEC 193']}),
   opponentPublic:player({active:pokemon('Regidrago VSTAR SIT 136'),
     deckCount:1,discard:['Dialga-GX UPR 100','Dragapult ex TWM 130']}),
   items:[
     {token:'rototiller',kind:'attack',actorPrinting:'Bunnelby PRC 121',
       attackName:'Rototiller',label:'Rototiller'},
     {token:'burrow',kind:'attack',actorPrinting:'Bunnelby PRC 121',
       attackName:'Burrow',label:'Burrow'}]
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'burrow'});
});
test('Get Lost root retains ordinary Trainer removal against non-Regidrago',()=>{
 const request=rootRequest({
   ownPublic:player({active:pokemon('Girafarig LOT 94')}),
   opponentPublic:player({active:pokemon('Iron Thorns ex TWM 77'),
     deckCount:27,discard:['VS Seeker PHF 109','Guzma BUS 115']}),
   items:[{token:'get-lost',kind:'attack',actorPrinting:'Girafarig LOT 94',
     attackName:'Get Lost',label:'Get Lost'},
     {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'get-lost'});
});


test('Jet Energy does not promote Bench Stoutland into live Tool-bearing Garbotoxin',()=>{
 const request=rootRequest({
  ownHand:['Jet Energy PAL 190'],
  ownPublic:player({active:pokemon('Bunnelby PRC 121'),bench:[
    pokemon('Stoutland BCR 122',{abilities:['Sentinel']})]}),
  opponentPublic:player({active:pokemon('Garbodor DRX 54',{
    abilities:['Garbotoxin'],tools:['Float Stone BKT 137']})}),
  items:[energyRootAction('jet-stoutland','Jet Energy PAL 190',
    'Stoutland BCR 122','bench',0),
    {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{kind:'select-action',token:'pass'});
});
test('Jet Energy still establishes Stoutland when opposing Garbotoxin has no Tool',()=>{
 const request=rootRequest({
  ownHand:['Jet Energy PAL 190'],
  ownPublic:player({active:pokemon('Bunnelby PRC 121'),bench:[
    pokemon('Stoutland BCR 122',{abilities:['Sentinel']})]}),
  opponentPublic:player({active:pokemon('Garbodor DRX 54',{
    abilities:['Garbotoxin'],tools:[]})}),
  items:[energyRootAction('jet-stoutland','Jet Energy PAL 190',
    'Stoutland BCR 122','bench',0),
    {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'jet-stoutland'});
});


test('Live Bide Barricade prioritizes Gloom Hood over routine Jet attachment',()=>{
 const request=rootRequest({
  ownHand:['Stealthy Hood UNB 186','Jet Energy PAL 190'],
  ownPublic:player({active:pokemon('Fan Rotom SCR 118'),bench:[
    pokemon('Gloom UNB 7',{stage:'STAGE1',subtypes:['Stage 1']}),
    pokemon('Bunnelby PRC 121')]}),
  opponentPublic:player({active:pokemon('Wobbuffet PHF 36',{
    abilities:['Bide Barricade']})}),
  items:[energyRootAction('jet','Jet Energy PAL 190',
      'Bunnelby PRC 121','bench',1),
    hoodRootAction('hood-gloom','Gloom UNB 7','bench',0),
    {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'hood-gloom'});
});
test('Live Bide Barricade reverses Guzma self pivot away from suppressed Stoutland',()=>{
 const request=promptRequest({
   promptType:'ChoosePokemonPrompt',
   source:actorChoiceSource('Guzma BUS 115','Guzma'),
   choices:[pokemonChoice('stoutland','Stoutland BCR 122','actor','bench',0),
     pokemonChoice('bunnelby','Bunnelby PRC 121','actor','bench',1)],
   observation:{
     ownPublic:player({active:pokemon('Fan Rotom SCR 118'),bench:[
       pokemon('Stoutland BCR 122'),pokemon('Bunnelby PRC 121')]}),
     opponentPublic:player({active:pokemon('Wobbuffet PHF 36',{
       abilities:['Bide Barricade']})})
   }
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-choices',tokens:['bunnelby']});
});
test('Hood protects Active Stoutland Sentinel from Neutralizing Gas',()=>{
 const request=rootRequest({
  ownHand:['Stealthy Hood UNB 186'],
  ownPublic:player({active:pokemon('Stoutland BCR 122',{
    abilities:['Sentinel']})}),
  opponentPublic:player({active:pokemon('Galarian Weezing RCL 113',{
    abilities:['Neutralizing Gas']})}),
  items:[hoodRootAction('hood-stoutland','Stoutland BCR 122','active',0),
    {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'hood-stoutland'});
});
test('Hood stays playable under own Vileplume Item lock (Tools distinct)',()=>{
 const request=rootRequest({
  ownHand:['Stealthy Hood UNB 186'],
  ownPublic:player({active:pokemon('Stoutland BCR 122',{
    abilities:['Sentinel']}),
   bench:[pokemon('Vileplume AOR 3',{
     stage:'STAGE2',subtypes:['Stage 2'],abilities:['Irritating Pollen']})],
   publicTurnRestrictions:{itemPlayLocked:true}}),
  opponentPublic:player({active:pokemon('Wobbuffet PHF 36',{
    abilities:['Bide Barricade']})}),
  ownTurnResources:{...turnResources(),itemPlayLocked:true},
  items:[hoodRootAction('hood-stoutland','Stoutland BCR 122','active',0),
    {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'hood-stoutland'});
});
test('Explicitly suppressed Bide Barricade cannot inflate Hood target value',()=>{
 const wobbuffet=pokemon('Wobbuffet PHF 36',{abilities:['Bide Barricade']});
 wobbuffet.abilitySuppressions=[{
   abilityName:'Bide Barricade',suppressed:true,
   reasonCode:'ABILITY_LOCKED',sourcePrinting:'Garbodor DRX 54'}];
 const request=rootRequest({
  ownHand:['Stealthy Hood UNB 186'],
  ownPublic:player({active:pokemon('Stoutland BCR 122',{
    abilities:['Sentinel']})}),
  opponentPublic:player({active:wobbuffet}),
  items:[hoodRootAction('hood-stoutland','Stoutland BCR 122','active',0),
    {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'pass'});
});


test('Existing Hood restores Stoutland retreat pivot through Bide Barricade',()=>{
 const request=rootRequest({
   ownPublic:player({active:pokemon('Girafarig LOT 94',{
     energies:['Jet Energy PAL 190']}),
     bench:[pokemon('Stoutland BCR 122',{
       tools:['Stealthy Hood UNB 186'],abilities:['Sentinel']})]}),
   opponentPublic:player({active:pokemon('Wobbuffet PHF 36',{
     abilities:['Bide Barricade']})}),
   items:[{token:'retreat-stoutland',kind:'retreat',
     actorPrinting:'Girafarig LOT 94',targetPrinting:'Stoutland BCR 122',
     publicMetadata:{benchIndex:0,targetIndex:0,targetZone:'bench',
       targetSeat:'actor',isOwnerVisible:true}},
     {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'retreat-stoutland'});
});
test('Jamming Tower disables Hood and prevents Stoutland pivot versus Wobbuffet',()=>{
 const request=rootRequest({
   ownPublic:player({active:pokemon('Girafarig LOT 94',{
     energies:['Jet Energy PAL 190']}),
     bench:[pokemon('Stoutland BCR 122',{
       tools:['Stealthy Hood UNB 186'],abilities:['Sentinel']})]}),
   opponentPublic:player({active:pokemon('Wobbuffet PHF 36',{
     abilities:['Bide Barricade']}),stadium:['Jamming Tower TWM 153']}),
   items:[{token:'retreat-stoutland',kind:'retreat',
     actorPrinting:'Girafarig LOT 94',targetPrinting:'Stoutland BCR 122',
     publicMetadata:{benchIndex:0,targetIndex:0,targetZone:'bench',
       targetSeat:'actor',isOwnerVisible:true}},
     {token:'pass',kind:'pass',label:'Pass turn'}]
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'pass'});
});
test('Guzma own pivot restores Hood-protected Stoutland under Bide Barricade',()=>{
 const request=promptRequest({
  promptType:'ChoosePokemonPrompt',
  source:actorChoiceSource('Guzma BUS 115','Guzma'),
  choices:[pokemonChoice('stoutland','Stoutland BCR 122','actor','bench',0),
    pokemonChoice('bunnelby','Bunnelby PRC 121','actor','bench',1)],
  observation:{
    ownPublic:player({active:pokemon('Girafarig LOT 94'),bench:[
      pokemon('Stoutland BCR 122',{tools:['Stealthy Hood UNB 186'],
        abilities:['Sentinel']}),pokemon('Bunnelby PRC 121')]}),
    opponentPublic:player({active:pokemon('Wobbuffet PHF 36',{
      abilities:['Bide Barricade']})})}
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-choices',tokens:['stoutland']});
});
test('Guzma does not trust Hood-protected Stoutland through Jamming Tower',()=>{
 const request=promptRequest({
  promptType:'ChoosePokemonPrompt',
  source:actorChoiceSource('Guzma BUS 115','Guzma'),
  choices:[pokemonChoice('stoutland','Stoutland BCR 122','actor','bench',0),
    pokemonChoice('bunnelby','Bunnelby PRC 121','actor','bench',1)],
  observation:{
    ownPublic:player({active:pokemon('Girafarig LOT 94'),bench:[
      pokemon('Stoutland BCR 122',{tools:['Stealthy Hood UNB 186'],
        abilities:['Sentinel']}),pokemon('Bunnelby PRC 121')]}),
    opponentPublic:player({active:pokemon('Wobbuffet PHF 36',{
      abilities:['Bide Barricade']}),stadium:['Jamming Tower TWM 153']})}
 });
 assert.deepEqual(checkedDecision(request),{
   kind:'select-choices',tokens:['bunnelby']});
});


test('rank2 behind-on-Prizes Counter Gain root settles actual Active Bunnelby',()=>{
  const own=player({active:pokemon('Bunnelby PRC 121',{energies:[]}),
    bench:[pokemon('Bunnelby PRC 121',{energies:[]})],prizeCount:6});
  const opponent=player({prizeCount:4});
  const root=rootRequest({ownHand:['Counter Gain SSP 169'],
    ownPublic:own,opponentPublic:opponent,
    items:[{token:'countergain',kind:'play-card',
      actorPrinting:'Counter Gain SSP 169',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(root),{
    kind:'select-action',token:'countergain'});
  const prompt=promptRequest({promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Counter Gain SSP 169','Counter Gain'),
    choices:[pokemonChoice('bench','Bunnelby PRC 121','actor','bench',0),
      pokemonChoice('active','Bunnelby PRC 121','actor','active',0)],
    observation:{ownPublic:own,opponentPublic:opponent}});
  assert.deepEqual(checkedDecision(prompt),{
    kind:'select-choices',tokens:['active']});
});
test('rank2 Counter Gain declines root when ahead on Prizes',()=>{
  const req=rootRequest({ownHand:['Counter Gain SSP 169'],
    ownPublic:player({active:pokemon('Bunnelby PRC 121'),prizeCount:2}),
    opponentPublic:player({prizeCount:5}),
    items:[{token:'countergain',kind:'play-card',actorPrinting:'Counter Gain SSP 169',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'pass'});
});
test('rank2 Counter Gain selects only physically Tool-free duplicate',()=>{
  const own=player({active:pokemon('Bunnelby PRC 121',{
    tools:['Technical Machine: Evolution PAR 178']}),
    bench:[pokemon('Bunnelby PRC 121')] ,prizeCount:6});
  const req=promptRequest({promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Counter Gain SSP 169','Counter Gain'),
    choices:[pokemonChoice('bad','Bunnelby PRC 121','actor','active',0),
      pokemonChoice('ok','Bunnelby PRC 121','actor','bench',0)],
    observation:{ownPublic:own,opponentPublic:player({prizeCount:4})}});
  assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:['ok']});
});
test('rank2 Counter Gain can zero-fund Girafarig Get Lost against exposed discard',()=>{
  const req=rootRequest({ownHand:['Counter Gain SSP 169'],
    ownPublic:player({active:pokemon('Girafarig LOT 94'),prizeCount:6}),
    opponentPublic:player({prizeCount:5,discard:['Dialga-GX UPR 100',
      'Dragapult ex TWM 130']}),
    items:[{token:'counter',kind:'play-card',
      actorPrinting:'Counter Gain SSP 169',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'counter'});
});
test('rank2 Counter Gain does not waste single-use Tool on free Budew attack',()=>{
  const req=rootRequest({ownHand:['Counter Gain SSP 169'],
    ownPublic:player({active:pokemon('Budew ASC 16'),prizeCount:6}),
    opponentPublic:player({prizeCount:5}),
    items:[{token:'counter',kind:'play-card',
      actorPrinting:'Counter Gain SSP 169',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'pass'});
});

test('rank2 Counter Gain root does not consume Tool slot when all recipients equipped',()=>{
  const req=rootRequest({ownHand:['Counter Gain SSP 169'],
    ownPublic:player({active:pokemon('Bunnelby PRC 121',{
      tools:['Technical Machine: Evolution PAR 178']}),
      bench:[pokemon('Oddish UNB 5',{tools:['Stealthy Hood UNB 186']})],
      prizeCount:6}),
    opponentPublic:player({prizeCount:4}),
    items:[{token:'countergain',kind:'play-card',
      actorPrinting:'Counter Gain SSP 169',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'pass'});
});

function attachmentRoot(token,printing){
 return {token,kind:'play-card',actorPrinting:printing,
  publicMetadata:{cardType:/Energy/i.test(printing)?'energy':'trainer',handIndex:0}};
}
function attachmentPrompt(printing,effect,choices,own,opp=player()){
 return promptRequest({promptType:'ChoosePokemonPrompt',
  source:actorChoiceSource(printing,effect),choices,
  observation:{ownPublic:own,opponentPublic:opp}});
}
test('Targetless TM root completes active Bunnelby Tool attach',()=>{
 const own=player({active:pokemon('Bunnelby PRC 121'),bench:[pokemon('Oddish UNB 5')]});
 const root=rootRequest({ownHand:['Technical Machine: Evolution PAR 178'],
  ownPublic:own,items:[attachmentRoot('tm','Technical Machine: Evolution PAR 178'),
  {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(root),{kind:'select-action',token:'tm'});
 const next=attachmentPrompt('Technical Machine: Evolution PAR 178','Attach Tool',[
  pokemonChoice('oddish','Oddish UNB 5','actor','bench',0),
  pokemonChoice('bunnelby','Bunnelby PRC 121','actor','active',0)],own);
 assert.deepEqual(checkedDecision(next),{kind:'select-choices',tokens:['bunnelby']});
});
test('TM Evolution attack recipient prompt remains separate from Tool attachment',()=>{
 const next=promptRequest({promptType:'ChoosePokemonPrompt',
  source:actorChoiceSource('Technical Machine: Evolution PAR 178','Evolution'),
  choices:[pokemonChoice('oddish','Oddish UNB 5','actor','bench',0)],
  observation:{ownPublic:player({active:pokemon('Bunnelby PRC 121'),
    bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})]})}});
 assert.deepEqual(checkedDecision(next),{kind:'select-choices',tokens:['oddish']});
});
test('Targetless Jet Energy selects same physical Benched Bunnelby carrying TM',()=>{
 const own=player({active:pokemon('Fan Rotom SCR 118'),bench:[
  pokemon('Bunnelby PRC 121',{tools:['Technical Machine: Evolution PAR 178']}),
  pokemon('Bunnelby PRC 121'),pokemon('Oddish UNB 5')]});
 const root=rootRequest({ownHand:['Jet Energy PAL 190'],ownPublic:own,
  items:[attachmentRoot('jet','Jet Energy PAL 190'),
  {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(root),{kind:'select-action',token:'jet'});
 const next=attachmentPrompt('Jet Energy PAL 190','Attach Energy',[
  pokemonChoice('plain','Bunnelby PRC 121','actor','bench',1),
  pokemonChoice('equipped','Bunnelby PRC 121','actor','bench',0)],own);
 assert.deepEqual(checkedDecision(next),{kind:'select-choices',tokens:['equipped']});
});
test('Targetless Memory Energy prepares Stoutland with Lillipup past Stage',()=>{
 const own=player({active:pokemon('Bunnelby PRC 121'),bench:[
  pokemon('Stoutland BCR 122',{evolutionPrintings:[
   'Lillipup CEC 174','Herdier SUM 104','Stoutland BCR 122']})]});
 const root=rootRequest({ownHand:['Memory Energy LOT 194'],ownPublic:own,
  items:[attachmentRoot('memory','Memory Energy LOT 194'),
  {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(root),{kind:'select-action',token:'memory'});
 const next=attachmentPrompt('Memory Energy LOT 194','Attach Energy',[
  pokemonChoice('bunnelby','Bunnelby PRC 121','actor','active',0),
  pokemonChoice('stoutland','Stoutland BCR 122','actor','bench',0)],own);
 assert.deepEqual(checkedDecision(next),{kind:'select-choices',tokens:['stoutland']});
});
test('Targetless Stealthy Hood protects Gloom from Bide Barricade',()=>{
 const own=player({active:pokemon('Bunnelby PRC 121'),bench:[
  pokemon('Gloom UNB 7',{stage:'STAGE1',subtypes:['Stage 1']})]});
 const opp=player({active:pokemon('Wobbuffet PHF 36',{abilities:['Bide Barricade']})});
 const root=rootRequest({ownHand:['Stealthy Hood UNB 186'],
  ownPublic:own,opponentPublic:opp,items:[
  attachmentRoot('hood','Stealthy Hood UNB 186'),
  {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(root),{kind:'select-action',token:'hood'});
 const next=attachmentPrompt('Stealthy Hood UNB 186','Attach Tool',[
  pokemonChoice('bunnelby','Bunnelby PRC 121','actor','active',0),
  pokemonChoice('gloom','Gloom UNB 7','actor','bench',0)],own,opp);
 assert.deepEqual(checkedDecision(next),{kind:'select-choices',tokens:['gloom']});
});


test('TM Evolution attack selects actual Stage1 Gloom and Herdier from actor deck',()=>{
 const own=player({active:pokemon('Bunnelby PRC 121',{
   tools:['Technical Machine: Evolution PAR 178']}),
   bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1}),
     pokemon('Lillipup CEC 174',{lastPlayedOrEvolvedTurn:1})]});
 const request=promptRequest({promptType:'ChooseCardsPrompt',
   source:actorChoiceSource('Technical Machine: Evolution PAR 178','Evolution'),
   choices:[cardChoice('vileplume','Vileplume AOR 3','deck'),
     cardChoice('herdier','Herdier SUM 104','deck'),
     cardChoice('gloom','Gloom UNB 7','deck')],
   publicMetadata:{selectionType:'card-combination',minimumCount:1,
     maximumCount:2,allowCancel:false,isSecret:false},
   observation:{ownPublic:own}});
 assert.deepEqual(checkedDecision(request),{
   kind:'select-choices',tokens:['gloom','herdier']});
});
test('TM Evolution attack refuses Stage2 skip from Basic-only Bench',()=>{
 const own=player({active:pokemon('Bunnelby PRC 121',{
   tools:['Technical Machine: Evolution PAR 178']}),
   bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})]});
 const request=promptRequest({promptType:'ChooseCardsPrompt',
   source:actorChoiceSource('Technical Machine: Evolution PAR 178','Evolution'),
   choices:[cardChoice('vileplume','Vileplume AOR 3','deck')],
   publicMetadata:{selectionType:'card-combination',minimumCount:1,
     maximumCount:1,allowCancel:false,isSecret:false},
   observation:{ownPublic:own}});
 assert.deepEqual(checkedDecision(request),{
   kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'});
});


test('Capture Energy completes targetless root, physical Energy attachment and Basic search',()=>{
 const own=player({active:pokemon('Bunnelby PRC 121',{energies:[]}),
   bench:[pokemon('Fan Rotom SCR 118')]});
 const root=rootRequest({ownHand:['Capture Energy RCL 171'],ownPublic:own,
   items:[attachmentRoot('capture','Capture Energy RCL 171'),
     {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(root),{kind:'select-action',token:'capture'});
 const attach=attachmentPrompt('Capture Energy RCL 171','Attach Energy',[
   pokemonChoice('rotom','Fan Rotom SCR 118','actor','bench',0),
   pokemonChoice('bunnelby','Bunnelby PRC 121','actor','active',0)],own);
 assert.deepEqual(checkedDecision(attach),{
   kind:'select-choices',tokens:['bunnelby']});
 const search=promptRequest({promptType:'ChooseCardsPrompt',
   source:actorChoiceSource('Capture Energy RCL 171','Capture Energy'),
   choices:[cardChoice('bunnelby','Bunnelby PRC 121','deck'),
     cardChoice('oddish','Oddish UNB 5','deck'),
     cardChoice('lillipup','Lillipup CEC 174','deck')],
   publicMetadata:{selectionType:'card-combination',minimumCount:1,
     maximumCount:1,allowCancel:false,isSecret:false},
   observation:{ownPublic:own}});
 assert.deepEqual(checkedDecision(search),{
   kind:'select-choices',tokens:['oddish']});
});
test('Capture Energy Basic search chooses absent Lillipup over established Oddish',()=>{
 const own=player({active:pokemon('Bunnelby PRC 121'),
   bench:[pokemon('Oddish UNB 5'),pokemon('Fan Rotom SCR 118')]});
 const search=promptRequest({promptType:'ChooseCardsPrompt',
   source:actorChoiceSource('Capture Energy RCL 171','Capture Energy'),
   choices:[cardChoice('oddish','Oddish UNB 5','deck'),
     cardChoice('lillipup','Lillipup CEC 174','deck')],
   publicMetadata:{selectionType:'card-combination',minimumCount:1,
     maximumCount:1,allowCancel:false,isSecret:false},
   observation:{ownPublic:own}});
 assert.deepEqual(checkedDecision(search),{
   kind:'select-choices',tokens:['lillipup']});
});
test('Artazon recognizes missing initial Basic even without partial evolution line',()=>{
 const request=artazonRoot(player({active:pokemon('Fan Rotom SCR 118')}));
 assert.deepEqual(checkedDecision(request),{
   kind:'select-action',token:'artazon'});
});


test('Guzma & Hala plays Stadium-only mode with zero discard cards for Grand Tree',()=>{
  const own=player({active:pokemon('Bunnelby PRC 121'),
    bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})]});
  const root=rootRequest({ownHand:['Guzma & Hala CEC 193'],
    ownPublic:own,globalTurn:3,
    items:[{token:'hala',kind:'play-card',actorPrinting:'Guzma & Hala CEC 193',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(root),{kind:'select-action',token:'hala'});
  const mode=promptRequest({promptType:'SelectOptionPrompt',
    source:actorChoiceSource('Guzma & Hala CEC 193','Guzma & Hala'),
    choices:[{token:'stadium-only',kind:'option',label:'Do not discard 2 cards',
      publicMetadata:{choiceIndex:0,selectionType:'option'}},
      {token:'full',kind:'option',label:'Discard 2 cards from your hand',
      publicMetadata:{choiceIndex:1,selectionType:'option'}}],
    publicMetadata:{count:2,minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false,selectionType:'option'},
    observation:{ownHand:[],ownPublic:own}});
  assert.deepEqual(checkedDecision(mode),{
    kind:'select-choice',token:'stadium-only'});
});
test('Guzma & Hala Stadium-only mode establishes Artazon without development Basics',()=>{
  const request=rootRequest({ownHand:['Guzma & Hala CEC 193'],
    ownPublic:player({active:pokemon('Fan Rotom SCR 118')}),
    items:[{token:'hala',kind:'play-card',actorPrinting:'Guzma & Hala CEC 193',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-action',token:'hala'});
});
test('Guzma & Hala is held if all remaining Stadiums are already visible in hand/discard',()=>{
  const request=rootRequest({ownHand:[
      'Guzma & Hala CEC 193','Grand Tree SCR 136'],
    ownPublic:player({active:pokemon('Fan Rotom SCR 118'),discard:[
      'Artazon PAL 171','Artazon PAL 171']}),
    items:[{token:'hala',kind:'play-card',actorPrinting:'Guzma & Hala CEC 193',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-action',token:'pass'});
});


test('Plumeria declines when its only prospective costs are unique lock/recovery cards',()=>{
 const request=rootRequest({
  ownHand:['Plumeria BUS 120','Guzma & Hala CEC 193','Stoutland BCR 122'],
  ownPublic:player({active:pokemon('Bunnelby PRC 121')}),
  opponentPublic:player({active:pokemon('Regidrago VSTAR SIT 136',{
    energies:['Double Dragon Energy ROS 97']})}),
  items:[{token:'plumeria',kind:'play-card',actorPrinting:'Plumeria BUS 120',
    publicMetadata:{cardType:'trainer',handIndex:0}},
    {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(request),{kind:'select-action',token:'pass'});
});
test('Guzma Hala discard prompt refuses to discard singleton Stage2 or Supporter',()=>{
 const request=promptRequest({promptType:'ChooseCardsPrompt',
  source:actorChoiceSource('Guzma & Hala CEC 193','Guzma & Hala'),
  choices:[cardChoice('tag','Tag Call CEC 206','hand'),
    cardChoice('stoutland','Stoutland BCR 122','hand'),
    cardChoice('guzma','Guzma BUS 115','hand')],
  observation:{ownHand:['Tag Call CEC 206','Stoutland BCR 122','Guzma BUS 115']},
  publicMetadata:{selectionType:'card-combination',minimumCount:2,
    maximumCount:2,allowCancel:false,isSecret:false}});
 assert.deepEqual(checkedDecision(request),{
   kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'});
});
test('Guzma Hala still discards two redundant Tag Calls and protects singleton Stoutland',()=>{
 const request=promptRequest({promptType:'ChooseCardsPrompt',
  source:actorChoiceSource('Guzma & Hala CEC 193','Guzma & Hala'),
  choices:[cardChoice('tag-one','Tag Call CEC 206','hand'),
    cardChoice('stoutland','Stoutland BCR 122','hand'),
    cardChoice('tag-two','Tag Call CEC 206','hand')],
  observation:{ownHand:['Tag Call CEC 206','Stoutland BCR 122','Tag Call CEC 206']},
  publicMetadata:{selectionType:'card-combination',minimumCount:2,
    maximumCount:2,allowCancel:false,isSecret:false}});
 assert.deepEqual(checkedDecision(request),{
   kind:'select-choices',tokens:['tag-one','tag-two']});
});
test('First Oddish in hand is protected until it reaches the Bench',()=>{
 const request=promptRequest({promptType:'ChooseCardsPrompt',
  source:actorChoiceSource('Plumeria BUS 120','Plumeria'),
  choices:[cardChoice('oddish','Oddish UNB 5','hand'),
    cardChoice('tag','Tag Call CEC 206','hand')],
  observation:{ownHand:['Oddish UNB 5','Tag Call CEC 206'],
    ownPublic:player({active:pokemon('Fan Rotom SCR 118')})},
  publicMetadata:{selectionType:'card-combination',minimumCount:2,
    maximumCount:2,allowCancel:false,isSecret:false}});
 assert.deepEqual(checkedDecision(request),{
   kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'});
});

test('role and seat binding mismatch abstains', () => {
  const request = rootRequest();
  request.seat = 1;
  assert.deepEqual(policy.decide(request), {
    kind: 'abstain',
    reasonCode: 'ROLE_SEAT_BINDING_MISMATCH'
  });
});
