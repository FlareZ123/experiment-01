'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const {
  POLICY_VERSION,
  SOURCE_RANK,
  SOURCE_FINGERPRINT_SHA256,
  CANDIDATE_FINGERPRINT_SHA256,
  createPolicy,
  scoreAction,
  scoreAttack,
  scoreSearchCard
} = require('../../simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs');

function workerInitMessage(seat = 0) {
  return {
    schema: protocol.INIT_SCHEMA,
    type: 'init',
    role: 'opponent',
    seat,
    policyVersion: POLICY_VERSION,
    bundleSha256: '0'.repeat(64),
    config: {}
  };
}

function makePolicy(seat = 0) {
  const init = protocol.validateInit(workerInitMessage(seat));
  return createPolicy({ ...init, rng: () => 0.5 });
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
    // Native actor prompt types are mandatory in the current host contract.
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
        {selectionType:'prize-slots',requiredCount:1,allowCancel:false,isSecret:false} :
      options.promptType==='ConfirmPrompt' ?
        {selectionType:'confirm',allowCancel:false} :
      {selectionType:'option',allowCancel:false})
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
  const init = protocol.validateInit(workerInitMessage(seat));
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

test('worker initialization accepts the zero-key config and binds rank identity in module constants', () => {
  const init = workerInitMessage(0);
  assert.deepEqual(protocol.validateInit(init), init);
  const policy = createPolicy({ ...init, rng: () => 0.5 });
  assert.deepEqual(typeof policy.decide, 'function');
  assert.deepEqual([
    SOURCE_RANK,
    SOURCE_FINGERPRINT_SHA256,
    CANDIDATE_FINGERPRINT_SHA256
  ], [
    3,
    '0a2cf5a36c4a8b813cf8e1b8889893356427ac33cd5fa73a576a35590c3da368',
    '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4'
  ]);
  assert.throws(() => protocol.validateInit({ ...init, config: { rank: 3 } }), /UNKNOWN_FIELD/);
  assert.throws(() => createPolicy({ ...init, config: { rank: 3 } }), /AGENT17_RANK3_POLICY_INIT_MISMATCH/);
  assert.throws(() => createPolicy({ ...init, role: 'candidate' }), /AGENT17_RANK3_POLICY_INIT_MISMATCH/);
  assert.throws(() => createPolicy({ ...init, seat: 2 }), /AGENT17_RANK3_POLICY_INIT_MISMATCH/);
  assert.throws(() => createPolicy({ ...init, policyVersion: 'wrong-version' }), /AGENT17_RANK3_POLICY_INIT_MISMATCH/);
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

test('Faba is played for a visible opponent Tool without a Stadium and removes the highest-value target', () => {
  const positiveRoot = rootRequest({
    requestId: 'agent17-faba-root-positive',
    ownHand: ['Faba LOT 173'],
    ownPublic: player({ active: pokemon('Snorlax PGO 55') }),
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 075', {
        hp: 320,
        stage: 'VMAX',
        subtypes: ['Pokémon VMAX'],
        tools: ['Stealthy Hood UNB 186']
      })
    }),
    items: [
      {
        token: 'faba',
        kind: 'play-card',
        actorPrinting: 'Faba LOT 173',
        publicMetadata: { cardType: 'supporter', handIndex: 0 }
      },
      { token: 'pass', kind: 'pass', label: 'Pass turn' }
    ]
  });
  assert.deepEqual(checkedDecision(positiveRoot), {
    kind: 'select-action', token: 'faba'
  });

  const noTargetRoot = rootRequest({
    requestId: 'agent17-faba-root-no-target',
    ownHand: ['Faba LOT 173'],
    ownPublic: player({ active: pokemon('Snorlax PGO 55') }),
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 075', {
        hp: 320,
        stage: 'VMAX',
        subtypes: ['Pokémon VMAX']
      })
    }),
    items: [
      {
        token: 'faba',
        kind: 'play-card',
        actorPrinting: 'Faba LOT 173',
        publicMetadata: { cardType: 'supporter', handIndex: 0 }
      },
      { token: 'pass', kind: 'pass', label: 'Pass turn' }
    ]
  });
  assert.deepEqual(checkedDecision(noTargetRoot), {
    kind: 'select-action', token: 'pass'
  });

  const request = promptRequest({
    requestId: 'agent17-faba-prompt-target',
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Faba LOT 173', 'Faba'),
    choices: [
      cardChoice('float', 'Float Stone BKT 137', 'attached', 'opponent'),
      cardChoice('hood', 'Stealthy Hood UNB 186', 'attached', 'opponent'),
      cardChoice('seal', 'Forest Seal Stone SIT 156', 'attached', 'opponent')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['hood']
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
  const arvenAction = {
    kind: 'play-card',
    actorPrinting: 'Arven OBF 186',
    publicMetadata: { cardType: 'supporter', handIndex: 0 }
  };
  const allToolsVisible = observation({
    ownPublic: player({
      discard: [
        'Tool Jammer BST 136',
        'Float Stone BKT 137',
        'Stealthy Hood UNB 186',
        'Forest Seal Stone SIT 156'
      ]
    })
  });
  assert.deepEqual(scoreAction(arvenAction, {
    observation: allToolsVisible, publicEventReceipt: null
  }), 0);
  assert.deepEqual(scoreAction(arvenAction, {
    observation: observation(), publicEventReceipt: null
  }), 175);
  assert.deepEqual(scoreSearchCard('Arven OBF 186', allToolsVisible, 'vs-seeker'), 0);
  assert.deepEqual(scoreSearchCard('Arven OBF 186', allToolsVisible, 'trainers-mail'), 0);
  assert.deepEqual(scoreSearchCard('Arven OBF 186', observation(), 'vs-seeker'), 155);
  assert.deepEqual(scoreSearchCard('Arven OBF 186', observation(), 'trainers-mail'), 190);

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

test('rank-3 Get Lost prioritizes recoverable candidate Supporters over spent Items', () => {
  const recoverableSupporterDiscard = observation({
    opponentPublic: player({ discard: ['Arven SVI 166'] })
  });
  assert.deepEqual(scoreAttack({ attackName: 'Get Lost' }, recoverableSupporterDiscard), 150);

  const spentRecoveryItemsDiscard = observation({
    opponentPublic: player({
      discard: ['VS Seeker PHF 109', 'Night Stretcher ASC 196']
    })
  });
  assert.deepEqual(scoreAttack({ attackName: 'Get Lost' }, spentRecoveryItemsDiscard), 65);

  const request = promptRequest({
    requestId: 'agent17-get-lost-priority',
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Girafarig LOT 94', 'Get Lost'),
    observation: {
      opponentPublic: player({
        discard: [
          'Arven SVI 166',
          'Acerola BUS 112',
          'VS Seeker PHF 109',
          'Night Stretcher ASC 196',
          'Switch SVI 194'
        ]
      })
    },
    choices: [
      cardChoice('switch', 'Switch SVI 194', 'discard', 'opponent'),
      cardChoice('seeker', 'VS Seeker PHF 109', 'discard', 'opponent'),
      cardChoice('stretcher', 'Night Stretcher ASC 196', 'discard', 'opponent'),
      cardChoice('arven', 'Arven SVI 166', 'discard', 'opponent'),
      cardChoice('acerola', 'Acerola BUS 112', 'discard', 'opponent'),
      { token: 'empty', kind: 'empty-selection', label: 'Select no cards' }
    ],
    publicMetadata: multiMetadata(0, 2)
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['arven', 'acerola']
  });

  const noRecoverableSupporter = promptRequest({
    requestId: 'agent17-get-lost-no-recoverable-supporter',
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Girafarig LOT 94', 'Get Lost'),
    observation: {
      opponentPublic: player({
        discard: ['VS Seeker PHF 109', 'Night Stretcher ASC 196', 'Switch SVI 194']
      })
    },
    choices: [
      cardChoice('switch', 'Switch SVI 194', 'discard', 'opponent'),
      cardChoice('seeker', 'VS Seeker PHF 109', 'discard', 'opponent'),
      cardChoice('stretcher', 'Night Stretcher ASC 196', 'discard', 'opponent'),
      { token: 'empty', kind: 'empty-selection', label: 'Select no cards' }
    ],
    publicMetadata: multiMetadata(0, 2)
  });
  assert.deepEqual(checkedDecision(noRecoverableSupporter), {
    kind: 'select-choice', token: 'empty'
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
    kind: 'select-choices', tokens: ['rider']
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
    kind: 'select-choices', tokens: ['snorlax']
  });
  const guzmaAction = {
    kind: 'play-card',
    actorPrinting: 'Guzma BUS 115',
    publicMetadata: { cardType: 'supporter', handIndex: 0 }
  };
  const ownLock = player({
    active: pokemon('Bunnelby PRC 121'),
    bench: [pokemon('Snorlax PGO 55', { tools: ['Tool Jammer BST 136'] })]
  });
  const noOpponentBench = observation({
    ownPublic: ownLock,
    opponentPublic: player()
  });
  const withOpponentBench = observation({
    ownPublic: ownLock,
    opponentPublic: player({ bench: [pokemon('Crobat V DAA 104')] })
  });
  assert.deepEqual(scoreAction(guzmaAction, {
    observation: noOpponentBench, publicEventReceipt: null
  }), 0);
  assert.deepEqual(scoreAction(guzmaAction, {
    observation: withOpponentBench, publicEventReceipt: null
  }), 185);

});

test("Player's Ceremony is a conservative shared draw-two and is played only into an empty Stadium slot", () => {
  const useRequest = rootRequest({
    ownHand: ['Quick Ball FST 237'],
    ownPublic: player({ deckCount: 20, stadium: ["Player's Ceremony SP 127"] }),
    opponentPublic: player({ handCount: 5, deckCount: 20 }),
    items: [
      { token: 'ceremony-use', kind: 'use-stadium', actorPrinting: "Player's Ceremony SP 127",
        publicMetadata: { stadiumPrinting: "Player's Ceremony SP 127", stadiumEffectLive: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(useRequest), { kind: 'select-action', token: 'ceremony-use' });
  const lowDeckRequest = rootRequest({
    ownHand: ['Quick Ball FST 237'],
    ownPublic: player({ deckCount: 2, stadium: ["Player's Ceremony SP 127"] }),
    opponentPublic: player({ handCount: 5, deckCount: 20 }),
    items: [
      { token: 'ceremony-use', kind: 'use-stadium', actorPrinting: "Player's Ceremony SP 127",
        publicMetadata: { stadiumPrinting: "Player's Ceremony SP 127", stadiumEffectLive: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(lowDeckRequest), { kind: 'select-action', token: 'pass' });
  const playRequest = rootRequest({
    ownHand: ["Player's Ceremony SP 127"],
    ownPublic: player({ deckCount: 20 }),
    opponentPublic: player({ handCount: 5, deckCount: 20 }),
    items: [
      { token: 'ceremony-play', kind: 'play-card', actorPrinting: "Player's Ceremony SP 127",
        publicMetadata: { cardType: 'stadium', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(playRequest), { kind: 'select-action', token: 'ceremony-play' });
  const occupiedStadiumRequest = rootRequest({
    ownHand: ["Player's Ceremony SP 127"],
    ownPublic: player({ deckCount: 20, stadium: ['Tropical Beach BWP 50'] }),
    opponentPublic: player({ handCount: 5, deckCount: 20 }),
    items: [
      { token: 'ceremony-play', kind: 'play-card', actorPrinting: "Player's Ceremony SP 127",
        publicMetadata: { cardType: 'stadium', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(occupiedStadiumRequest), { kind: 'select-action', token: 'pass' });
  const ceremonyCompetingAction = rootRequest({
    ownHand: ['Quick Ball FST 237'],
    ownPublic: player({
      active: pokemon('Snorlax TEU 158', { damage: 100 }),
      bench: [pokemon('Bunnelby SVI 164')],
      deckCount: 20,
      stadium: ["Player's Ceremony SP 127"]
    }),
    opponentPublic: player({ handCount: 5, deckCount: 20 }),
    items: [
      { token: 'ceremony-use', kind: 'use-stadium', actorPrinting: "Player's Ceremony SP 127",
        publicMetadata: { stadiumPrinting: "Player's Ceremony SP 127", stadiumEffectLive: true } },
      { token: 'retreat', kind: 'retreat', targetPrinting: 'Bunnelby SVI 164' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(ceremonyCompetingAction), { kind: 'select-action', token: 'retreat' });
  const beachCompetingAction = rootRequest({
    ownHand: ['Quick Ball FST 237'],
    ownPublic: player({
      active: pokemon('Snorlax TEU 158', { damage: 100 }),
      bench: [pokemon('Bunnelby SVI 164')],
      deckCount: 20,
      stadium: ['Tropical Beach BWP 50']
    }),
    opponentPublic: player({ handCount: 5, deckCount: 20 }),
    items: [
      { token: 'beach-use', kind: 'use-stadium', actorPrinting: 'Tropical Beach BWP 50',
        publicMetadata: { stadiumPrinting: 'Tropical Beach BWP 50', stadiumEffectLive: true } },
      { token: 'retreat', kind: 'retreat', targetPrinting: 'Bunnelby SVI 164' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(beachCompetingAction), { kind: 'select-action', token: 'retreat' });
  const unexpectedPrompt = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource("Player's Ceremony SP 127", "Player's Ceremony"),
    choices: [cardChoice('choice', 'Tropical Beach BWP 50')]
  });
  assert.deepEqual(checkedDecision(unexpectedPrompt), {
    kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE'
  });
});

test('unsupported native prompt families fail closed rather than selecting a fallback', () => {
  const request = promptRequest({
    promptType: 'UnknownNativePrompt',
    source: actorChoiceSource('Unknown source', 'Unknown effect'),
    choices: [cardChoice('choice', 'Tool Jammer BST 136')]
  });
  // Unregistered host prompts fail the schema before worker invocation.
  // Directly assert the worker's fail-closed response.
  assert.deepEqual(makePolicy(0).decide(request), {
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
  const init = protocol.validateInit({
    schema: protocol.INIT_SCHEMA,
    type: 'init',
    role: 'opponent',
    seat: 0,
    policyVersion: POLICY_VERSION,
    bundleSha256: 'a'.repeat(64),
    config: {}
  });
  assert.throws(() => protocol.validateRequest(
    request, init, request.sequence, new Set()
  ));
});

test('the real worker decision validator rejects an unknown action token', () => {
  const request = rootRequest({
    items: [{ token: 'pass', kind: 'pass' }]
  });
  const init = protocol.validateInit({
    schema: protocol.INIT_SCHEMA,
    type: 'init',
    role: 'opponent',
    seat: 0,
    policyVersion: POLICY_VERSION,
    bundleSha256: 'a'.repeat(64),
    config: {}
  });
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
    kind: 'select-choices', tokens: ['active']
  });
});

test('Regirock Land Maker prioritizes Tropical Beach and Temple while retaining Player’s Ceremony as a fallback', () => {
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
  const ceremonyOnly = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Regirock XYP 49', 'Land Maker'),
    choices: [
      cardChoice('ceremony', "Player's Ceremony SP 127", 'discard'),
      { token: 'empty', kind: 'empty-selection', label: 'Select no cards' }
    ],
    publicMetadata: multiMetadata(0, 2)
  });
  assert.deepEqual(checkedDecision(ceremonyOnly), {
    kind: 'select-choices', tokens: ['ceremony']
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
  const nestAction = {
    kind: 'play-card', actorPrinting: 'Nest Ball SVI 181',
    publicMetadata: { cardType: 'item', handIndex: 0 }
  };
  const quickAction = {
    kind: 'play-card', actorPrinting: 'Quick Ball FST 237',
    publicMetadata: { cardType: 'item', handIndex: 0 }
  };
  const allBasicsVisible = observation({
    ownPublic: player({
      discard: [
        'Snorlax PGO 55', 'Snorlax PGO 55', 'Snorlax PGO 55',
        'Galarian Stunfisk SSH 132', 'Galarian Stunfisk SSH 132',
        'Regirock XYP 49', 'Mimikyu PAL 97', 'Girafarig LOT 94',
        'Bunnelby PRC 121', 'Articuno-GX CES 31', 'Rotom V LOR 58'
      ]
    })
  });
  assert.deepEqual(scoreAction(nestAction, {
    observation: allBasicsVisible, publicEventReceipt: null
  }), 0);
  assert.deepEqual(scoreAction(quickAction, {
    observation: allBasicsVisible, publicEventReceipt: null
  }), 0);
  assert.deepEqual(scoreAction(nestAction, {
    observation: observation(), publicEventReceipt: null
  }), 100);
  assert.deepEqual(scoreAction(quickAction, {
    observation: observation({ ownHand: ['Quick Ball FST 237'] }),
    publicEventReceipt: null
  }), 0);
  assert.deepEqual(scoreAction(quickAction, {
    observation: observation({ ownHand: ['Quick Ball FST 237', 'Water Energy MEE 11'] }),
    publicEventReceipt: null
  }), 100);

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
      cardChoice('ceremony', "Player's Ceremony SP 127", 'discard'),
      cardChoice('nest', 'Nest Ball SVI 181', 'discard')
    ],
    publicMetadata: multiMetadata(2, 2)
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['faba', 'handiwork']
  });
  const ceremonyOnly = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Lusamine CIN 96', 'Lusamine'),
    choices: [
      cardChoice('ceremony', "Player's Ceremony SP 127", 'discard'),
      { token: 'empty', kind: 'empty-selection', label: 'Select no cards' }
    ],
    publicMetadata: multiMetadata(0, 2)
  });
  assert.deepEqual(checkedDecision(ceremonyOnly), {
    kind: 'select-choices', tokens: ['ceremony']
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
    kind: 'select-choices', tokens: ['rider']
  });
  const catchAction = {
    kind: 'play-card', actorPrinting: 'Counter Catcher PAR 160',
    publicMetadata: { cardType: 'item', handIndex: 0 }
  };
  const behindNoBench = observation({
    ownPublic: player({ prizeCount: 6 }),
    opponentPublic: player({ prizeCount: 5 })
  });
  const behindWithBench = observation({
    ownPublic: player({ prizeCount: 6 }),
    opponentPublic: player({ prizeCount: 5, bench: [pokemon('Crobat V DAA 104')] })
  });
  assert.deepEqual(scoreAction(catchAction, {
    observation: behindNoBench, publicEventReceipt: null
  }), 0);
  assert.deepEqual(scoreSearchCard('Counter Catcher PAR 160', behindNoBench, 'trainers-mail'), 0);
  assert.deepEqual(scoreAction(catchAction, {
    observation: behindWithBench, publicEventReceipt: null
  }), 135);
  assert.deepEqual(scoreSearchCard('Counter Catcher PAR 160', behindWithBench, 'trainers-mail'), 135);

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
    kind: 'select-choices', tokens: ['bunnelby']
  });
  const stretcherAction = {
    kind: 'play-card', actorPrinting: 'Night Stretcher ASC 196',
    publicMetadata: { cardType: 'item', handIndex: 0 }
  };
  const onlyMimikyu = observation({
    ownPublic: player({ discard: ['Mimikyu PAL 97'] })
  });
  const noRecoveryTarget = observation({ ownPublic: player() });
  assert.deepEqual(scoreAction(stretcherAction, {
    observation: onlyMimikyu, publicEventReceipt: null
  }), 90);
  assert.deepEqual(scoreAction(stretcherAction, {
    observation: noRecoveryTarget, publicEventReceipt: null
  }), 0);
  assert.deepEqual(scoreSearchCard('Night Stretcher ASC 196', onlyMimikyu, 'trainers-mail'), 125);
  assert.deepEqual(scoreSearchCard('Night Stretcher ASC 196', noRecoveryTarget, 'trainers-mail'), 0);

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
    kind: 'select-choices', tokens: ['special']
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
    kind: 'select-choices', tokens: ['jammer']
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
  const sealAction = {
    kind: 'play-card',
    actorPrinting: 'Forest Seal Stone SIT 156',
    targetPrinting: 'Rotom V LOR 58',
    publicMetadata: { cardType: 'trainer', handIndex: 0 }
  };
  const rotomBoard = player({
    active: pokemon('Snorlax PGO 55'),
    bench: [pokemon('Rotom V LOR 58')]
  });
  assert.deepEqual(scoreAction(sealAction, {
    observation: observation({ ownPublic: rotomBoard }),
    publicEventReceipt: null
  }), 180);
  assert.deepEqual(scoreAction(sealAction, {
    observation: observation({
      ownPublic: rotomBoard,
      ownTurnResources: { vstarUsed: true }
    }),
    publicEventReceipt: null
  }), 0);

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
  const init = protocol.validateInit({
    schema: protocol.INIT_SCHEMA,
    type: 'init',
    role: 'opponent',
    seat: 0,
    policyVersion: POLICY_VERSION,
    bundleSha256: 'a'.repeat(64),
    config: {}
  });
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


test('Teammates search scoring and play gating use validated prior-turn KO evidence', () => {
  const noLusamineTargets = observation({ ownPublic: player() });
  const oneLusamineTarget = observation({
    ownPublic: player({ discard: ['Faba LOT 173'] })
  });
  const twoLusamineTargets = observation({
    ownPublic: player({ discard: ['Faba LOT 173', 'Plumeria BUS 120'] })
  });
  assert.deepEqual(scoreSearchCard('Lusamine CIN 96', noLusamineTargets, 'teammates'), 35);
  assert.deepEqual(scoreSearchCard('Lusamine CIN 96', oneLusamineTarget, 'teammates'), 100);
  assert.deepEqual(scoreSearchCard('Lusamine CIN 96', twoLusamineTargets, 'teammates'), 155);

  const lusamineAction = {
    kind: 'play-card',
    actorPrinting: 'Lusamine CIN 96',
    publicMetadata: { cardType: 'supporter', handIndex: 0 }
  };
  const noTargetRoot = rootRequest({
    ownHand: ['Lusamine CIN 96'],
    ownPublic: player({ active: pokemon('Snorlax PGO 55') })
  });
  const twoTargetRoot = rootRequest({
    ownHand: ['Lusamine CIN 96'],
    ownPublic: player({
      active: pokemon('Snorlax PGO 55'),
      discard: ['Faba LOT 173', 'Plumeria BUS 120']
    })
  });
  assert.deepEqual(scoreAction(lusamineAction, noTargetRoot), 0);
  assert.deepEqual(scoreAction(lusamineAction, twoTargetRoot), 120);

  const positive = promptRequest({
    requestId: 'agent17-teammates-visible-tool',
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Teammates PRC 141', 'Teammates'),
    observation: {
      ownPublic: player({ active: pokemon('Snorlax PGO 55') }),
      opponentPublic: player({
        active: pokemon('Shadow Rider Calyrex VMAX CRE 075', {
          hp: 320,
          stage: 'VMAX',
          subtypes: ['Pokémon VMAX'],
          tools: ['Stealthy Hood UNB 186']
        })
      })
    },
    choices: [
      cardChoice('jammer', 'Tool Jammer BST 136'),
      cardChoice('faba', 'Faba LOT 173'),
      cardChoice('nest', 'Nest Ball SVI 181'),
      cardChoice('snorlax', 'Snorlax PGO 55')
    ],
    publicMetadata: multiMetadata(2, 2)
  });
  assert.deepEqual(checkedDecision(positive), {
    kind: 'select-choices', tokens: ['jammer', 'faba']
  });

  const noTarget = promptRequest({
    requestId: 'agent17-teammates-no-faba-target',
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Teammates PRC 141', 'Teammates'),
    observation: {
      ownHand: ['Plumeria BUS 120', 'Capture Energy RCL 171', 'Faba LOT 173'],
      ownPublic: player({
        active: pokemon('Snorlax PGO 55'),
        bench: [
          pokemon('Bunnelby PRC 121'),
          pokemon('Girafarig LOT 94'),
          pokemon('Mimikyu PAL 97'),
          pokemon('Rotom V LOR 58', {
            tools: ['Forest Seal Stone SIT 156']
          })
        ]
      }),
      opponentPublic: player({
        active: pokemon('Shadow Rider Calyrex VMAX CRE 075', {
          hp: 320,
          stage: 'VMAX',
          subtypes: ['Pokémon VMAX']
        })
      })
    },
    choices: [
      cardChoice('jammer', 'Tool Jammer BST 136'),
      cardChoice('faba', 'Faba LOT 173'),
      cardChoice('plumeria', 'Plumeria BUS 120'),
      cardChoice('team-flare', 'Team Flare Grunt XY 129'),
      cardChoice('handiwork', "Team Rocket's Handiwork FCO 112"),
      cardChoice('guzma', 'Guzma BUS 115'),
      cardChoice('eri', 'Eri TEF 146'),
      cardChoice('lusamine', 'Lusamine CIN 96')
    ],
    publicMetadata: multiMetadata(2, 2)
  });
  assert.deepEqual(checkedDecision(noTarget), {
    kind: 'select-choices', tokens: ['jammer', 'handiwork']
  });
  const teammatesAction = {
    kind: 'play-card',
    actorPrinting: 'Teammates PRC 141',
    publicMetadata: { cardType: 'supporter', handIndex: 0 }
  };
  const teammatesView = observation({
    ownHand: ['Teammates PRC 141'],
    ownPublic: player({ active: pokemon('Snorlax PGO 55') })
  });
  const eventPokemon = slot => slot === null ? null : ({
    printing: slot.printing,
    movedFromBenchToActiveThisTurn: null,
    knownAbilityUse: []
  });
  const makeEventReceipt = priorKO => ({
    version: protocol.EVENT_RECEIPT_VERSION,
    actorSeat: teammatesView.actorSeat,
    turn: teammatesView.globalTurn,
    ownerActive: eventPokemon(teammatesView.ownPublic.active),
    ownerBench: teammatesView.ownPublic.bench.map(eventPokemon),
    priorOpponentTurnKO: { any: priorKO, byAttack: priorKO },
    opponentLastTurnAttack: null,
    opponentLastTurnTurn: null,
    opponentLastTurnAttacks: null
  });
  const noKOReceipt = makeEventReceipt(false);
  const koReceipt = makeEventReceipt(true);
  protocol.validatePublicEventReceipt(noKOReceipt, teammatesView);
  protocol.validatePublicEventReceipt(koReceipt, teammatesView);
  assert.deepEqual(scoreAction(teammatesAction, {
    observation: teammatesView, publicEventReceipt: null
  }), 0);
  assert.deepEqual(scoreAction(teammatesAction, {
    observation: teammatesView, publicEventReceipt: noKOReceipt
  }), 0);
  assert.deepEqual(scoreAction(teammatesAction, {
    observation: teammatesView, publicEventReceipt: koReceipt
  }), 140);

});

test('VS Seeker recovery gates Faba and values Lusamine by recoverable targets', () => {
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
    kind: 'select-choices', tokens: ['lillie']
  });
  const visibleTool = observation({
    opponentPublic: player({
      bench: [pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        tools: ['Stealthy Hood UNB 186']
      })]
    })
  });
  assert.deepEqual(scoreSearchCard('Faba LOT 173', observation(), 'vs-seeker'), 0);
  assert.deepEqual(scoreSearchCard('Faba LOT 173', visibleTool, 'vs-seeker'), 220);
  const noLusamineTargets = observation({ ownPublic: player() });
  const oneLusamineTarget = observation({
    ownPublic: player({ discard: ['Lusamine CIN 96'] })
  });
  const twoLusamineTargets = observation({
    ownPublic: player({ discard: ['Lusamine CIN 96', 'Faba LOT 173'] })
  });
  assert.deepEqual(scoreSearchCard('Lusamine CIN 96', noLusamineTargets, 'vs-seeker'), 0);
  assert.deepEqual(scoreSearchCard('Lusamine CIN 96', oneLusamineTarget, 'vs-seeker'), 100);
  assert.deepEqual(scoreSearchCard('Lusamine CIN 96', twoLusamineTargets, 'vs-seeker'), 180);
  const vsSeekerAction = {
    kind: 'play-card',
    actorPrinting: 'VS Seeker PHF 109',
    publicMetadata: { cardType: 'item', handIndex: 0 }
  };
  const deadFabaThenLiveLillie = observation({
    ownPublic: player({
      discard: ['Faba LOT 173', "Lillie's Determination MEG 119"]
    })
  });
  assert.deepEqual(scoreAction(vsSeekerAction, {
    observation: deadFabaThenLiveLillie, publicEventReceipt: null
  }), 130);
  const lusamineRecovery = observation({
    ownPublic: player({ discard: ['Lusamine CIN 96', 'Faba LOT 173'] })
  });
  assert.deepEqual(scoreAction(vsSeekerAction, {
    observation: lusamineRecovery, publicEventReceipt: null
  }), 180);

});
test('Trainers’ Mail target-gates Faba and Lusamine against live Item and Tool options', () => {
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
    kind: 'select-choices', tokens: ['nest']
  });
  const visibleTool = observation({
    opponentPublic: player({
      bench: [pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        tools: ['Stealthy Hood UNB 186']
      })]
    })
  });
  assert.deepEqual(scoreSearchCard('Faba LOT 173', observation(), 'trainers-mail'), 0);
  assert.deepEqual(scoreSearchCard('Faba LOT 173', visibleTool, 'trainers-mail'), 190);
  const noLusamineTargets = observation({ ownPublic: player() });
  const oneLusamineTarget = observation({
    ownPublic: player({ discard: ['Faba LOT 173'] })
  });
  const twoLusamineTargets = observation({
    ownPublic: player({ discard: ['Faba LOT 173', 'Plumeria BUS 120'] })
  });
  assert.deepEqual(scoreSearchCard('Lusamine CIN 96', noLusamineTargets, 'trainers-mail'), 0);
  assert.deepEqual(scoreSearchCard('Lusamine CIN 96', oneLusamineTarget, 'trainers-mail'), 100);
  assert.deepEqual(scoreSearchCard('Lusamine CIN 96', twoLusamineTargets, 'trainers-mail'), 155);
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
    kind: 'select-choices', tokens: ['bunnelby']
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
    kind: 'select-choices', tokens: ['rotom']
  });
});


test('Legendary Ascent selects every actor-owned Water Energy up to the prompt payment count', () => {
  const request = promptRequest({
    promptType: 'ChooseEnergyPrompt',
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
    kind: 'select-choices', tokens: ['snorlax']
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
    kind: 'abstain', reasonCode: 'HIDDEN_PRIZE_IDENTITY'
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


test('the policy abstains rather than inventing a pass token when no supported action exists', () => {
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Snorlax PGO 55') }),
    ownHand: ['Unknown Item XYZ 1'],
    items: [
      {
        token: 'unknown-item', kind: 'play-card',
        actorPrinting: 'Unknown Item XYZ 1',
        publicMetadata: { cardType: 'item', handIndex: 0 }
      }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'NO_SUPPORTED_ACTION'
  });
});
