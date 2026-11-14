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
    }))
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
    publicTurnRestrictions: publicRestrictions(),
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
