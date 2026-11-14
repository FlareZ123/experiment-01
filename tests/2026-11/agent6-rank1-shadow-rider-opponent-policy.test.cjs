'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const { POLICY_VERSION, createPolicy } =
  require('../../simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs');

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

function pokemon(printing, options = {}) {
  const abilities = options.abilities ?? [];
  return {
    printing,
    name: options.name ?? printing.split(' ').slice(0, -2).join(' '),
    hp: options.hp ?? 200,
    damage: options.damage ?? 0,
    lastPlayedOrEvolvedTurn: options.lastPlayedOrEvolvedTurn ?? 1,
    printed: {
      stage: options.stage ?? 'BASIC',
      subtypes: options.subtypes ?? ['Basic'],
      types: options.types ?? ['Psychic'],
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
    ...(options.abilitySuppressions === undefined ? {} : { abilitySuppressions: options.abilitySuppressions })
  };
}

function publicRestrictions(options = {}) {
  const result = {
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
  if (!options.omitStadiumSuppression) {
    result.stadiumAndToolHaveNoEffectTurnsRemaining =
      options.stadiumAndToolHaveNoEffectTurnsRemaining ?? 0;
  }
  return result;
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
    publicHand: null,
    prizeSlots: [],
    publicTurnRestrictions: publicRestrictions(options),
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
  const obs = observation(options);
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: options.requestId ?? 'agent6-root-1',
    sequence: options.sequence ?? 1,
    role: 'opponent',
    seat: 0,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: obs,
    prompt: null,
    publicEventReceipt: options.receipt ?? null,
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
    choices: options.choices,
    ...(options.publicMetadata ? { publicMetadata: options.publicMetadata } : {})
  };
  const obs = observation({
    ...(options.observation ?? {}),
    prompt
  });
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: options.requestId ?? 'agent6-prompt-1',
    sequence: options.sequence ?? 1,
    role: 'opponent',
    seat: 0,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: obs,
    prompt,
    publicEventReceipt: options.receipt ?? null,
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

function eventPokemon(slot) {
  return slot ? {
    printing: slot.printing,
    movedFromBenchToActiveThisTurn: null,
    knownAbilityUse: []
  } : null;
}

function paleMoonReceipt(ownPublic, turn = 3) {
  return {
    version: protocol.EVENT_RECEIPT_VERSION,
    actorSeat: 0,
    turn,
    ownerActive: eventPokemon(ownPublic.active),
    ownerBench: ownPublic.bench.map(eventPokemon),
    priorOpponentTurnKO: { any: false, byAttack: false },
    opponentLastTurnAttack: null,
    opponentLastTurnTurn: turn - 1,
    opponentLastTurnAttacks: [{
      turn: turn - 1,
      sourcePrinting: 'Trevenant & Dusknoir-GX SMP 217',
      attackName: 'Pale Moon-GX',
      gxAttack: true,
      copycatAttack: false
    }]
  };
}

test('rank1 response recovers the three discarded Psychic Energy before evolving', () => {
  const latias = pokemon('Latias ex SSP 76', { hp: 210, damage: 40, abilities: ['Skyliner'] });
  const own = player({
    active: pokemon('Girafarig LOT 94', { hp: 90 }),
    bench: [
      latias,
      pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
      pokemon("Lillie's Clefairy ex JTG 56", { hp: 190 }),
      pokemon('Dialga-GX UPR 100', { hp: 180 }),
      pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })
    ],
    discard: [
      'Psychic Energy MEE 13',
      'Psychic Energy MEE 13',
      'Psychic Energy MEE 13'
    ]
  });
  const request = rootRequest({
    ownHand: [
      'Tulip PAR 181',
      'Shadow Rider Calyrex VMAX CRE 75',
      'Shadow Rider Calyrex VMAX CRE 75',
      'Acerola BUS 112',
      'Unfair Stamp TWM 165'
    ],
    ownPublic: own,
    opponentPublic: player({ handCount: 4 }),
    items: [
      { token: 'tulip', kind: 'play-card', actorPrinting: 'Tulip PAR 181',
        publicMetadata: { cardType: 'trainer', handIndex: 0 } },
      { token: 'acerola', kind: 'play-card', actorPrinting: 'Acerola BUS 112',
        publicMetadata: { cardType: 'trainer', handIndex: 3 } },
      { token: 'evolve', kind: 'play-card',
        actorPrinting: 'Shadow Rider Calyrex VMAX CRE 75',
        targetPrinting: 'Shadow Rider Calyrex V CRE 74',
        publicMetadata: { cardType: 'pokemon', handIndex: 1,
          targetSeat: 'actor', targetZone: 'bench', targetIndex: 1 } },
      { token: 'stamp', kind: 'play-card', actorPrinting: 'Unfair Stamp TWM 165',
        publicMetadata: { cardType: 'trainer', handIndex: 4 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'tulip' });
});

test('rank1 clears an observed Pale Moon-GX threat with Acerola when Latias is Active', () => {
  const active = pokemon('Latias ex SSP 76', { hp: 210, damage: 50, abilities: ['Skyliner'] });
  const own = player({
    active,
    bench: [pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })],
    discard: ['Psychic Energy MEE 13', 'Psychic Energy MEE 13', 'Psychic Energy MEE 13']
  });
  const request = rootRequest({
    ownHand: ['Acerola BUS 112', 'Tulip PAR 181'],
    ownPublic: own,
    opponentPublic: player({ handCount: 4 }),
    receipt: paleMoonReceipt(own),
    items: [
      { token: 'acerola', kind: 'play-card', actorPrinting: 'Acerola BUS 112',
        publicMetadata: { cardType: 'trainer', handIndex: 0 } },
      { token: 'tulip', kind: 'play-card', actorPrinting: 'Tulip PAR 181',
        publicMetadata: { cardType: 'trainer', handIndex: 1 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'acerola' });
});

test('Tulip prompt selects the available Basic Psychic Energy cards and not the empty token', () => {
  const choices = [
    { token: 'psychic-0', kind: 'card', printing: 'Psychic Energy MEE 13',
      label: 'Psychic Energy', publicMetadata: { sourceZone: 'discard' } },
    { token: 'psychic-1', kind: 'card', printing: 'Psychic Energy MEE 13',
      label: 'Psychic Energy', publicMetadata: { sourceZone: 'discard' } },
    { token: 'psychic-2', kind: 'card', printing: 'Psychic Energy MEE 13',
      label: 'Psychic Energy', publicMetadata: { sourceZone: 'discard' } },
    { token: 'empty', kind: 'empty-selection', label: 'Select none' }
  ];
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Tulip PAR 181', 'Tulip'),
    choices,
    publicMetadata: {
      sourceZone: 'discard',
      minimumCount: 0,
      maximumCount: 3,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownPublic: player({ discard: [
        'Psychic Energy MEE 13',
        'Psychic Energy MEE 13',
        'Psychic Energy MEE 13'
      ] })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['psychic-0', 'psychic-1', 'psychic-2']
  });
});

test('Underworld Door targets Latias until its two-Energy Eon Blade line is funded', () => {
  const latias = pokemon('Latias ex SSP 76', { hp: 210, abilities: ['Skyliner'] });
  const rider = pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' });
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Shadow Rider Calyrex VMAX CRE 75', 'Underworld Door'),
    choices: [
      { token: 'latias', kind: 'pokemon', printing: latias.printing, label: 'Latias ex',
        publicMetadata: { selectionIndex: 0, selectedCount: 1,
          selectionType: 'pokemon', ownerSeat: 'actor', targetZone: 'bench',
          isOwnerVisible: true } },
      { token: 'rider', kind: 'pokemon', printing: rider.printing, label: 'Shadow Rider Calyrex VMAX',
        publicMetadata: { selectionIndex: 1, selectedCount: 1,
          selectionType: 'pokemon', ownerSeat: 'actor', targetZone: 'bench',
          isOwnerVisible: true } }
    ],
    publicMetadata: {
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'pokemon'
    },
    observation: {
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [latias, rider]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['latias']
  });
});

test('active promotion avoids a 150-damage-exposed one-Prize Girafarig and prefers a durable two-Prize body', () => {
  const girafarig = pokemon('Girafarig LOT 94', { hp: 90 });
  const dialga = pokemon('Dialga-GX UPR 100', { hp: 180 });
  const clefairy = pokemon("Lillie's Clefairy ex JTG 56", { hp: 190 });
  const riderV = pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 });
  const riderVmax = pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' });
  const entries = [girafarig, dialga, clefairy, riderV, riderVmax];
  const choices = entries.map((slot, index) => ({
    token: 'bench-' + index,
    kind: 'pokemon',
    printing: slot.printing,
    label: slot.name,
    publicMetadata: {
      selectionIndex: index,
      selectedCount: 1,
      selectionType: 'pokemon',
      ownerSeat: 'actor',
      targetZone: 'bench',
      isOwnerVisible: true
    }
  }));
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource(null, 'Promote a Pokémon'),
    choices,
    publicMetadata: {
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'pokemon'
    },
    observation: {
      ownPublic: player({ active: null, bench: entries })
    }
  });
  const decision = checkedDecision(request);
  assert.equal(decision.kind, 'select-choices');
  assert.equal(decision.tokens.length, 1);
  assert.equal(decision.tokens[0], 'bench-3');
});

test('energy-payment selection pays the visible cost count, not every attached Energy', () => {
  const choices = [0, 1, 2].map(index => ({
    token: 'energy-' + index,
    kind: 'energy',
    printing: 'Psychic Energy MEE 13',
    label: 'Psychic Energy',
    publicMetadata: { energyType: 'Psychic' }
  }));
  const request = promptRequest({
    promptType: 'ChooseEnergyPrompt',
    source: actorChoiceSource(null, 'Attack cost payment'),
    choices,
    publicMetadata: {
      count: 3,
      energyCount: 3,
      energyType: 'Psychic,Colorless',
      allowCancel: false,
      selectionType: 'energy-payment'
    }
  });
  const decision = checkedDecision(request);
  assert.equal(decision.kind, 'select-choices');
  assert.equal(decision.tokens.length, 2);
});

test('rank1 policy abstains rather than guessing on an unsupported prompt type', () => {
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

test('Unfair Stamp is not fired merely because the opponent took a Prize on an earlier turn', () => {
  const request = rootRequest({
    ownHand: ['Unfair Stamp TWM 165'],
    ownPublic: player({ handCount: 1, prizeCount: 5 }),
    opponentPublic: player({ handCount: 2, prizeCount: 6 }),
    items: [
      { token: 'stamp', kind: 'play-card', actorPrinting: 'Unfair Stamp TWM 165',
        publicMetadata: { cardType: 'trainer', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});


test('Tulip with fewer than the maximum recoverable cards never includes the empty token in an array', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Tulip PAR 181', 'Tulip'),
    choices: [
      { token: 'psychic-only', kind: 'card', printing: 'Psychic Energy MEE 13',
        label: 'Psychic Energy', publicMetadata: { sourceZone: 'discard' } },
      { token: 'empty', kind: 'empty-selection', label: 'Select none' }
    ],
    publicMetadata: {
      sourceZone: 'discard',
      minimumCount: 0,
      maximumCount: 3,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: { ownPublic: player({ discard: ['Psychic Energy MEE 13'] }) }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['psychic-only']
  });
});

test('zero-count prize prompt uses the special empty-selection token', () => {
  const request = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource(null, 'Prize selection'),
    choices: [{ token: 'empty', kind: 'empty-selection', label: 'Select none' }],
    publicMetadata: {
      count: 0,
      requiredCount: 0,
      allowCancel: false,
      isSecret: false,
      selectionType: 'prize-slots'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice',
    token: 'empty'
  });
});

test('zero-count card-order prompt uses the special empty-selection token', () => {
  const request = promptRequest({
    promptType: 'OrderCardsPrompt',
    source: actorChoiceSource(null, 'Order cards'),
    choices: [{ token: 'empty', kind: 'empty-selection', label: 'Select none' }],
    publicMetadata: {
      count: 0,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-order'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice',
    token: 'empty'
  });
});

test('card-order and prize multi-selects return only their exact item kinds', () => {
  const orderRequest = promptRequest({
    promptType: 'OrderCardsPrompt',
    source: actorChoiceSource(null, 'Order cards'),
    choices: [
      { token: 'order-energy', kind: 'card-order-item', printing: 'Psychic Energy MEE 13',
        label: 'Psychic Energy', publicMetadata: { selectionIndex: 0 } },
      { token: 'order-v', kind: 'card-order-item', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: { selectionIndex: 1 } },
      { token: 'cancel', kind: 'cancel', label: 'Cancel' }
    ],
    publicMetadata: {
      count: 2,
      allowCancel: true,
      isSecret: false,
      selectionType: 'card-order'
    }
  });
  assert.deepEqual(checkedDecision(orderRequest), {
    kind: 'select-choices',
    tokens: ['order-v', 'order-energy']
  });

  const prizeRequest = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource(null, 'Prize selection'),
    choices: [
      { token: 'prize-0', kind: 'prize', label: 'Prize 1',
        publicMetadata: { choiceIndex: 0 } },
      { token: 'prize-1', kind: 'prize', label: 'Prize 2',
        publicMetadata: { choiceIndex: 1 } },
      { token: 'cancel', kind: 'cancel', label: 'Cancel' }
    ],
    publicMetadata: {
      count: 2,
      requiredCount: 2,
      allowCancel: true,
      isSecret: false,
      selectionType: 'prize-slots'
    }
  });
  assert.deepEqual(checkedDecision(prizeRequest), {
    kind: 'select-choices',
    tokens: ['prize-0', 'prize-1']
  });
});


test('Raihan search chooses a setup card rather than a second Basic Psychic Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Raihan EVS 152', 'Raihan'),
    choices: [
      { token: 'energy', kind: 'card', printing: 'Psychic Energy MEE 13',
        label: 'Psychic Energy', publicMetadata: { sourceZone: 'deck' } },
      { token: 'vmax', kind: 'card', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: { sourceZone: 'deck' } },
      { token: 'v', kind: 'card', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Raihan EVS 152'],
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['vmax']
  });
});

test('Fog Crystal searches Shadow Rider V before Energy when no V is visible or in hand', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Fog Crystal CRE 140', 'Fog Crystal'),
    choices: [
      { token: 'energy', kind: 'card', printing: 'Psychic Energy MEE 13',
        label: 'Psychic Energy', publicMetadata: { sourceZone: 'deck' } },
      { token: 'v', kind: 'card', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Fog Crystal CRE 140'],
      ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['v']
  });
});

test('Battle Compressor selects Basic Psychic Energy for a held Tulip recovery line', () => {
  const choices = [
    'Psychic Energy MEE 13',
    'Psychic Energy MEE 13',
    'Psychic Energy MEE 13',
    'Shadow Rider Calyrex VMAX CRE 75'
  ].map((printing, index) => ({
    token: 'deck-' + index,
    kind: 'card',
    printing,
    label: printing,
    publicMetadata: { sourceZone: 'deck' }
  }));
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Battle Compressor PHF 92', 'Battle Compressor'),
    choices,
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 3,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Battle Compressor PHF 92', 'Tulip PAR 181'],
      ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['deck-0', 'deck-1', 'deck-2']
  });
});

test('VS Seeker retrieves Tulip when the discard contains a recoverable Psychic package', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('VS Seeker PHF 109', 'VS Seeker'),
    choices: [
      { token: 'acerola', kind: 'card', printing: 'Acerola BUS 112',
        label: 'Acerola', publicMetadata: { sourceZone: 'discard' } },
      { token: 'tulip', kind: 'card', printing: 'Tulip PAR 181',
        label: 'Tulip', publicMetadata: { sourceZone: 'discard' } },
      { token: 'raihan', kind: 'card', printing: 'Raihan EVS 152',
        label: 'Raihan', publicMetadata: { sourceZone: 'discard' } }
    ],
    publicMetadata: {
      sourceZone: 'discard',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['VS Seeker PHF 109'],
      ownPublic: player({
        discard: ['Psychic Energy MEE 13', 'Psychic Energy MEE 13', 'Psychic Energy MEE 13']
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['tulip']
  });
});


test('unknown card-combination source abstains instead of selecting a plausible-looking card', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource(null, 'Unknown search effect'),
    choices: [
      { token: 'v', kind: 'card', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain',
    reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE'
  });
});

test('unknown confirmation source abstains rather than selecting Yes', () => {
  const request = promptRequest({
    promptType: 'ConfirmPrompt',
    source: actorChoiceSource(null, 'Unknown confirmation'),
    choices: [
      { token: 'yes', kind: 'option', label: 'Yes' },
      { token: 'no', kind: 'option', label: 'No' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain',
    reasonCode: 'UNSUPPORTED_CONFIRMATION_SOURCE'
  });
});

test('known Star Alchemy confirmation selects Yes', () => {
  const request = promptRequest({
    promptType: 'ConfirmPrompt',
    source: actorChoiceSource('Forest Seal Stone SIT 156', 'Star Alchemy'),
    choices: [
      { token: 'yes', kind: 'option', label: 'Yes' },
      { token: 'no', kind: 'option', label: 'No' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice',
    token: 'yes'
  });
});

test('Copycat attack choice prefers Max Geist over Eon Blade and excludes Night Watch', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: {
      classification: 'actor-choice',
      sourceKind: 'card-effect',
      sourcePrinting: 'Mimikyu GRI 58',
      effectName: 'Copycat',
      copiedSourcePrinting: 'Shadow Rider Calyrex VMAX CRE 75',
      copiedAttackName: 'Max Geist'
    },
    choices: [
      { token: 'eon', kind: 'attack', label: 'Eon Blade',
        publicMetadata: { sourceAttack: 'Eon Blade' } },
      { token: 'max', kind: 'attack', label: 'Max Geist',
        publicMetadata: { sourceAttack: 'Max Geist' } }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choice',
    token: 'max'
  });
});

test('non-Copycat attack-choice source abstains', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: actorChoiceSource('Tapu Lele-GX GRI 60', 'Choose an attack'),
    choices: [
      { token: 'energy-drive', kind: 'attack', label: 'Energy Drive',
        publicMetadata: { sourceAttack: 'Energy Drive' } }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain',
    reasonCode: 'UNSUPPORTED_ATTACK_CHOICE_SOURCE'
  });
});


test('Mysterious Treasure discards a low-value card token, never a cancel or empty token', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'energy', kind: 'card', printing: 'Psychic Energy MEE 13',
        label: 'Psychic Energy', publicMetadata: { sourceZone: 'hand' } },
      { token: 'stamp', kind: 'card', printing: 'Unfair Stamp TWM 165',
        label: 'Unfair Stamp', publicMetadata: { sourceZone: 'hand' } },
      { token: 'carmine', kind: 'card', printing: 'Carmine TWM 145',
        label: 'Carmine', publicMetadata: { sourceZone: 'hand' } },
      { token: 'cancel', kind: 'cancel', label: 'Cancel' }
    ],
    publicMetadata: {
      sourceZone: 'hand',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: true,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: [
        'Mysterious Treasure FLI 113',
        'Psychic Energy MEE 13',
        'Unfair Stamp TWM 165',
        'Carmine TWM 145'
      ]
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['carmine']
  });
});

test('Mysterious Treasure search chooses a missing Shadow Rider V from the deck', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'vmax', kind: 'card', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: { sourceZone: 'deck' } },
      { token: 'v', kind: 'card', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Mysterious Treasure FLI 113'],
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['v']
  });
});

test('Guzma abstains rather than returning fewer targets than a multi-target prompt requires', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Guzma BUS 115', 'Guzma'),
    choices: [
      { token: 'bench-a', kind: 'pokemon', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: {
          selectionIndex: 0, selectedCount: 1, selectionType: 'pokemon',
          ownerSeat: 'opponent', targetZone: 'bench', isOwnerVisible: true
        } },
      { token: 'bench-b', kind: 'pokemon', printing: 'Dialga-GX UPR 100',
        label: 'Dialga-GX', publicMetadata: {
          selectionIndex: 1, selectedCount: 1, selectionType: 'pokemon',
          ownerSeat: 'opponent', targetZone: 'bench', isOwnerVisible: true
        } }
    ],
    publicMetadata: {
      minimumCount: 2,
      maximumCount: 2,
      allowCancel: false,
      isSecret: false,
      selectionType: 'pokemon'
    },
    observation: {
      ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) }),
      opponentPublic: player({
        active: pokemon('Mimikyu GRI 58', { hp: 70 }),
        bench: [
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
          pokemon('Dialga-GX UPR 100', { hp: 180 })
        ]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain',
    reasonCode: 'UNCLASSIFIED_POKEMON_PROMPT'
  });
});


test('Raihan attaches to Latias when it is one Psychic Energy short of Eon Blade', () => {
  const latias = pokemon('Latias ex SSP 76', {
    hp: 210,
    energies: ['Psychic Energy MEE 13']
  });
  const rider = pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' });
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Raihan EVS 152', 'Raihan'),
    choices: [
      { token: 'active', kind: 'pokemon', printing: 'Girafarig LOT 94',
        label: 'Girafarig', publicMetadata: { selectionIndex: 0, selectedCount: 1,
          selectionType: 'pokemon', ownerSeat: 'actor', targetZone: 'active',
          isOwnerVisible: true } },
      { token: 'latias', kind: 'pokemon', printing: latias.printing,
        label: 'Latias ex', publicMetadata: { selectionIndex: 1, selectedCount: 1,
          selectionType: 'pokemon', ownerSeat: 'actor', targetZone: 'bench',
          isOwnerVisible: true } },
      { token: 'rider', kind: 'pokemon', printing: rider.printing,
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: { selectionIndex: 2,
          selectedCount: 1, selectionType: 'pokemon', ownerSeat: 'actor',
          targetZone: 'bench', isOwnerVisible: true } }
    ],
    publicMetadata: {
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'pokemon'
    },
    observation: {
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [latias, rider]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['latias']
  });
});

test('Field Blower removes the opponent stadium and tool, not the owner stadium', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Field Blower GRI 125', 'Field Blower'),
    choices: [
      { token: 'path', kind: 'card', printing: 'Path to the Peak CRE 148',
        label: 'Path to the Peak', publicMetadata: {
          sourceZone: 'play', targetZone: 'stadium', ownerSeat: 'opponent',
          isOwnerVisible: true
        } },
      { token: 'tool', kind: 'card', printing: 'Float Stone BKT 137',
        label: 'Float Stone', publicMetadata: {
          sourceZone: 'play', targetZone: 'tool', ownerSeat: 'opponent',
          isOwnerVisible: true
        } },
      { token: 'own-stadium', kind: 'card', printing: 'Dimension Valley PHF 93',
        label: 'Dimension Valley', publicMetadata: {
          sourceZone: 'play', targetZone: 'stadium', ownerSeat: 'actor',
          isOwnerVisible: true
        } },
      { token: 'empty', kind: 'empty-selection', label: 'Select none' }
    ],
    publicMetadata: {
      sourceZone: 'play',
      minimumCount: 0,
      maximumCount: 2,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['path', 'tool']
  });
});

test('Get Lost removes the opponent recovery cards before Basic Psychic Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Girafarig LOT 94', 'Get Lost'),
    choices: [
      { token: 'energy', kind: 'card', printing: 'Psychic Energy MEE 13',
        label: 'Psychic Energy', publicMetadata: {
          sourceZone: 'discard', ownerSeat: 'opponent', isOwnerVisible: true
        } },
      { token: 'seeker', kind: 'card', printing: 'VS Seeker PHF 109',
        label: 'VS Seeker', publicMetadata: {
          sourceZone: 'discard', ownerSeat: 'opponent', isOwnerVisible: true
        } },
      { token: 'charge', kind: 'card', printing: 'Special Charge STS 105',
        label: 'Special Charge', publicMetadata: {
          sourceZone: 'discard', ownerSeat: 'opponent', isOwnerVisible: true
        } },
      { token: 'empty', kind: 'empty-selection', label: 'Select none' }
    ],
    publicMetadata: {
      sourceZone: 'discard',
      minimumCount: 0,
      maximumCount: 2,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      opponentPublic: player({
        discard: ['Psychic Energy MEE 13', 'VS Seeker PHF 109', 'Special Charge STS 105']
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['seeker', 'charge']
  });
});


test('Wonder Tag searches Tulip for the visible recoverable Psychic package', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Tapu Lele-GX GRI 60', 'Wonder Tag'),
    choices: [
      { token: 'carmine', kind: 'card', printing: 'Carmine TWM 145',
        label: 'Carmine', publicMetadata: { sourceZone: 'deck' } },
      { token: 'tulip', kind: 'card', printing: 'Tulip PAR 181',
        label: 'Tulip', publicMetadata: { sourceZone: 'deck' } },
      { token: 'raihan', kind: 'card', printing: 'Raihan EVS 152',
        label: 'Raihan', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Tapu Lele-GX GRI 60'],
      ownPublic: player({
        discard: ['Psychic Energy MEE 13', 'Psychic Energy MEE 13', 'Psychic Energy MEE 13']
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['tulip']
  });
});

test('Star Alchemy searches Field Blower to remove the opponent Path to the Peak', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Forest Seal Stone SIT 156', 'Star Alchemy'),
    choices: [
      { token: 'field-blower', kind: 'card', printing: 'Field Blower GRI 125',
        label: 'Field Blower', publicMetadata: { sourceZone: 'deck' } },
      { token: 'stamp', kind: 'card', printing: 'Unfair Stamp TWM 165',
        label: 'Unfair Stamp', publicMetadata: { sourceZone: 'deck' } },
      { token: 'vmax', kind: 'card', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Forest Seal Stone SIT 156'],
      ownPublic: player({ discard: ['Psychic Energy MEE 13'] }),
      opponentPublic: player({
        stadium: ['Path to the Peak CRE 148'],
        handCount: 2
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['field-blower']
  });
});

test('Mysterious Treasure searches Mimikyu when the opponent Active exposes a non-GX attack to Copycat', () => {
  const opponentActive = pokemon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320,
    stage: 'VMAX',
    attacks: [{
      name: 'Max Geist',
      cost: ['Psychic'],
      damage: '10+30',
      damageCalculation: '10+30 per Psychic Energy attached to your Pokémon',
      text: '10+30 damage.',
      gxAttack: false,
      barrage: false
    }]
  });
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'vmax', kind: 'card', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: { sourceZone: 'deck' } },
      { token: 'mimikyu', kind: 'card', printing: 'Mimikyu GRI 58',
        label: 'Mimikyu', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Mysterious Treasure FLI 113'],
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })
        ]
      }),
      opponentPublic: player({ active: opponentActive })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['mimikyu']
  });
});


test('Marshadow is played to trigger Resetting Hole against Path to the Peak', () => {
  const request = rootRequest({
    ownHand: ['Marshadow UNB 81'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) }),
    opponentPublic: player({ stadium: ['Path to the Peak CRE 148'] }),
    items: [
      { token: 'marshadow', kind: 'play-card', actorPrinting: 'Marshadow UNB 81',
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'marshadow'
  });
});

test('Resetting Hole ability is prioritized only while a disabling stadium is active', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Girafarig LOT 94', { hp: 90 }),
      bench: [pokemon('Marshadow UNB 81', { hp: 70 })]
    }),
    opponentPublic: player({ stadium: ['Path to the Peak CRE 148'] }),
    items: [
      { token: 'resetting-hole', kind: 'use-ability',
        publicMetadata: { abilityName: 'Resetting Hole', sourceZone: 'bench',
          sourceSeat: 'actor', sourceIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'resetting-hole'
  });
});

test('Mysterious Treasure searches Marshadow to remove Path to the Peak when the board lacks it', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'vmax', kind: 'card', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: { sourceZone: 'deck' } },
      { token: 'marshadow', kind: 'card', printing: 'Marshadow UNB 81',
        label: 'Marshadow', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Mysterious Treasure FLI 113'],
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })
        ]
      }),
      opponentPublic: player({ stadium: ['Path to the Peak CRE 148'] })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['marshadow']
  });
});


test('Mimikyu is played when the opponent Active exposes a non-GX Copycat target', () => {
  const opponentActive = pokemon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320,
    stage: 'VMAX',
    attacks: [{
      name: 'Max Geist',
      cost: ['Psychic'],
      damage: '10+30',
      damageCalculation: '10+30 per Psychic Energy attached to your Pokémon',
      text: '10+30 damage.',
      gxAttack: false,
      barrage: false
    }]
  });
  const request = rootRequest({
    ownHand: ['Mimikyu GRI 58'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) }),
    opponentPublic: player({ active: opponentActive }),
    items: [
      { token: 'mimikyu', kind: 'play-card', actorPrinting: 'Mimikyu GRI 58',
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'mimikyu'
  });
});

test('Mimikyu Copycat attack is selected when a legal non-GX target is visible', () => {
  const opponentActive = pokemon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320,
    stage: 'VMAX',
    attacks: [{
      name: 'Max Geist',
      cost: ['Psychic'],
      damage: '10+30',
      damageCalculation: '10+30 per Psychic Energy attached to your Pokémon',
      text: '10+30 damage.',
      gxAttack: false,
      barrage: false
    }]
  });
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Mimikyu GRI 58', { hp: 70 }) }),
    opponentPublic: player({ active: opponentActive }),
    items: [
      { token: 'copycat', kind: 'attack', attackName: 'Copycat' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'copycat'
  });
});

test('Mimikyu is not played for Copycat when the opponent Active has no known non-GX attack', () => {
  const opponentActive = pokemon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320,
    stage: 'VMAX',
    attacks: [{
      name: 'Night Watch',
      cost: ['Psychic', 'Psychic', 'Colorless'],
      damage: '150',
      damageCalculation: '150',
      text: '150 damage.',
      gxAttack: false,
      barrage: false
    }]
  });
  const request = rootRequest({
    ownHand: ['Mimikyu GRI 58'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) }),
    opponentPublic: player({ active: opponentActive }),
    items: [
      { token: 'mimikyu', kind: 'play-card', actorPrinting: 'Mimikyu GRI 58',
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});


test('Mysterious Treasure completes the second Shadow Rider V before optional Copycat setup', () => {
  const opponentActive = pokemon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320,
    stage: 'VMAX',
    attacks: [{
      name: 'Max Geist',
      cost: ['Psychic'],
      damage: '10+30',
      damageCalculation: '10+30 per Psychic Energy attached to your Pokémon',
      text: '10+30 damage.',
      gxAttack: false,
      barrage: false
    }]
  });
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'mimikyu', kind: 'card', printing: 'Mimikyu GRI 58',
        label: 'Mimikyu', publicMetadata: { sourceZone: 'deck' } },
      { token: 'v', kind: 'card', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Mysterious Treasure FLI 113'],
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })]
      }),
      opponentPublic: player({ active: opponentActive })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['v']
  });
});


test('Tapu Lele-GX is played to access a Supporter when none is held', () => {
  const request = rootRequest({
    ownHand: ['Tapu Lele-GX GRI 60'],
    ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) }),
    items: [
      { token: 'lele', kind: 'play-card', actorPrinting: 'Tapu Lele-GX GRI 60',
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'lele'
  });
});

test('Mysterious Treasure searches Tapu Lele-GX when setup is complete and no Supporter is held', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'clefairy', kind: 'card', printing: "Lillie's Clefairy ex JTG 56",
        label: "Lillie's Clefairy ex", publicMetadata: { sourceZone: 'deck' } },
      { token: 'lele', kind: 'card', printing: 'Tapu Lele-GX GRI 60',
        label: 'Tapu Lele-GX', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Mysterious Treasure FLI 113'],
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
          pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' }),
          pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' })
        ]
      })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['lele']
  });
});


test('Climactic Gate is used when a Shadow Rider V is in play even if VMAX is not in hand', () => {
  const request = rootRequest({
    ownHand: ['Psychic Energy MEE 13'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94', { hp: 90 }),
      bench: [pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 })]
    }),
    items: [
      { token: 'gate', kind: 'use-ability',
        publicMetadata: { abilityName: 'Climactic Gate', sourceZone: 'bench',
          sourceSeat: 'actor', sourceIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'gate'
  });
});

test('Climactic Gate selects two VMAX Pokémon and excludes Basic Pokémon choices', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Radiant Eternatus CRZ 105', 'Climactic Gate'),
    choices: [
      { token: 'vmax-a', kind: 'pokemon', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: {
          selectionIndex: 0, selectedCount: 2, selectionType: 'pokemon',
          ownerSeat: 'actor', targetZone: 'deck', isOwnerVisible: true
        } },
      { token: 'basic-v', kind: 'pokemon', printing: 'Shadow Rider Calyrex V CRE 74',
        label: 'Shadow Rider Calyrex V', publicMetadata: {
          selectionIndex: 1, selectedCount: 2, selectionType: 'pokemon',
          ownerSeat: 'actor', targetZone: 'deck', isOwnerVisible: true
        } },
      { token: 'vmax-b', kind: 'pokemon', printing: 'Shadow Rider Calyrex VMAX CRE 75',
        label: 'Shadow Rider Calyrex VMAX', publicMetadata: {
          selectionIndex: 2, selectedCount: 2, selectionType: 'pokemon',
          ownerSeat: 'actor', targetZone: 'deck', isOwnerVisible: true
        } }
    ],
    publicMetadata: {
      minimumCount: 2,
      maximumCount: 2,
      allowCancel: false,
      isSecret: false,
      selectionType: 'pokemon'
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['vmax-a', 'vmax-b']
  });
});


test('Fairy Zone doubles Max Geist damage against Dragon and changes attack choice', () => {
  const clefairy = pokemon("Lillie's Clefairy ex JTG 56", {
    hp: 190,
    abilities: ['Fairy Zone'],
    abilitySuppressions: [{
      abilityName: 'Fairy Zone',
      suppressed: false,
      reasonCode: null,
      sourcePrinting: null
    }]
  });
  const opponentDragon = pokemon('Regidrago VSTAR SIT 136', {
    hp: 240,
    stage: 'VSTAR',
    types: ['Dragon']
  });
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        hp: 320,
        stage: 'VMAX',
        energies: [
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13'
        ]
      }),
      bench: [clefairy]
    }),
    opponentPublic: player({ active: opponentDragon, handCount: 4 }),
    items: [
      { token: 'max-geist', kind: 'attack', attackName: 'Max Geist' },
      { token: 'night-watch', kind: 'attack', attackName: 'Night Watch' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'max-geist'
  });
});

test('Fairy Zone is not applied when publicly suppressed by Path to the Peak', () => {
  const clefairy = pokemon("Lillie's Clefairy ex JTG 56", {
    hp: 190,
    abilities: ['Fairy Zone'],
    abilitySuppressions: [{
      abilityName: 'Fairy Zone',
      suppressed: true,
      reasonCode: 'PATH_TO_THE_PEAK',
      sourcePrinting: 'Path to the Peak CRE 148'
    }]
  });
  const opponentDragon = pokemon('Regidrago VSTAR SIT 136', {
    hp: 240,
    stage: 'VSTAR',
    types: ['Dragon']
  });
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        hp: 320,
        stage: 'VMAX',
        energies: [
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13',
          'Psychic Energy MEE 13'
        ]
      }),
      bench: [clefairy],
      stadium: ['Path to the Peak CRE 148']
    }),
    opponentPublic: player({ active: opponentDragon, handCount: 5 }),
    items: [
      { token: 'max-geist', kind: 'attack', attackName: 'Max Geist' },
      { token: 'night-watch', kind: 'attack', attackName: 'Night Watch' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'night-watch'
  });
});

test('retreat pivots into Shadow Rider VMAX when active Fairy Zone makes Max Geist lethal', () => {
  const clefairy = pokemon("Lillie's Clefairy ex JTG 56", {
    hp: 190,
    abilities: ['Fairy Zone'],
    abilitySuppressions: [{
      abilityName: 'Fairy Zone',
      suppressed: false,
      reasonCode: null,
      sourcePrinting: null
    }]
  });
  const rider = pokemon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320,
    stage: 'VMAX',
    energies: [
      'Psychic Energy MEE 13',
      'Psychic Energy MEE 13',
      'Psychic Energy MEE 13',
      'Psychic Energy MEE 13'
    ]
  });
  const opponentDragon = pokemon('Regidrago VSTAR SIT 136', {
    hp: 240,
    stage: 'VSTAR',
    types: ['Dragon']
  });
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Girafarig LOT 94', { hp: 90 }),
      bench: [rider, pokemon('Latias ex SSP 76', { hp: 210 }), clefairy]
    }),
    opponentPublic: player({ active: opponentDragon }),
    items: [
      { token: 'retreat-rider', kind: 'retreat',
        publicMetadata: { benchIndex: 0, targetZone: 'bench' } },
      { token: 'retreat-latias', kind: 'retreat',
        publicMetadata: { benchIndex: 1, targetZone: 'bench' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'retreat-rider'
  });
});

test('Mysterious Treasure searches Lillie’s Clefairy ex against an opposing Dragon Active', () => {
  const opponentDragon = pokemon('Regidrago VSTAR SIT 136', {
    hp: 240,
    stage: 'VSTAR',
    types: ['Dragon']
  });
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    choices: [
      { token: 'clefairy', kind: 'card', printing: "Lillie's Clefairy ex JTG 56",
        label: "Lillie's Clefairy ex", publicMetadata: { sourceZone: 'deck' } },
      { token: 'dialga', kind: 'card', printing: 'Dialga-GX UPR 100',
        label: 'Dialga-GX', publicMetadata: { sourceZone: 'deck' } }
    ],
    publicMetadata: {
      sourceZone: 'deck',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false,
      isSecret: false,
      selectionType: 'card-combination'
    },
    observation: {
      ownHand: ['Mysterious Treasure FLI 113'],
      ownPublic: player({
        active: pokemon('Girafarig LOT 94', { hp: 90 }),
        bench: [
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
          pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210 }),
          pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' }),
          pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX' })
        ]
      }),
      opponentPublic: player({ active: opponentDragon })
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices',
    tokens: ['clefairy']
  });
});

test('Lillie’s Clefairy ex is played to activate Fairy Zone against a Dragon Active', () => {
  const opponentDragon = pokemon('Regidrago VSTAR SIT 136', {
    hp: 240,
    stage: 'VSTAR',
    types: ['Dragon']
  });
  const request = rootRequest({
    ownHand: ["Lillie's Clefairy ex JTG 56"],
    ownPublic: player({ active: pokemon('Girafarig LOT 94', { hp: 90 }) }),
    opponentPublic: player({ active: opponentDragon }),
    items: [
      { token: 'clefairy', kind: 'play-card',
        actorPrinting: "Lillie's Clefairy ex JTG 56",
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'clefairy'
  });
});


test('Path to the Peak is not treated as active when the stadium suppression epoch is unknown', () => {
  const request = rootRequest({
    ownHand: ['Marshadow UNB 81'],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94', { hp: 90 }),
      stadium: ['Path to the Peak CRE 148'],
      omitStadiumSuppression: true
    }),
    opponentPublic: player(),
    items: [
      { token: 'marshadow', kind: 'play-card', actorPrinting: 'Marshadow UNB 81',
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});

test('Path to the Peak is not treated as active while stadium effects are suppressed', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Girafarig LOT 94', { hp: 90 }),
      bench: [pokemon('Marshadow UNB 81', { hp: 70 })],
      stadium: ['Path to the Peak CRE 148'],
      stadiumAndToolHaveNoEffectTurnsRemaining: 1
    }),
    opponentPublic: player(),
    items: [
      { token: 'resetting-hole', kind: 'use-ability',
        publicMetadata: { abilityName: 'Resetting Hole', sourceZone: 'bench',
          sourceSeat: 'actor', sourceIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});

test('Lillie’s Clefairy ex is not played when Path to the Peak status is unknown', () => {
  const opponentDragon = pokemon('Regidrago VSTAR SIT 136', {
    hp: 240,
    stage: 'VSTAR',
    types: ['Dragon']
  });
  const request = rootRequest({
    ownHand: ["Lillie's Clefairy ex JTG 56"],
    ownPublic: player({
      active: pokemon('Girafarig LOT 94', { hp: 90 }),
      stadium: ['Path to the Peak CRE 148'],
      omitStadiumSuppression: true
    }),
    opponentPublic: player({ active: opponentDragon }),
    items: [
      { token: 'clefairy', kind: 'play-card',
        actorPrinting: "Lillie's Clefairy ex JTG 56",
        publicMetadata: { cardType: 'pokemon', handIndex: 0 } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action',
    token: 'pass'
  });
});
