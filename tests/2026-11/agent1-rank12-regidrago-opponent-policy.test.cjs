'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const {
  POLICY_VERSION,
  SOURCE_RANK,
  SOURCE_FINGERPRINT_SHA256,
  CANDIDATE_FINGERPRINT_SHA256,
  createPolicy
} = require('../../simulation/evaluation/2026-11/agent1-rank12-regidrago-opponent-policy.cjs');

const config = {
  rank: SOURCE_RANK,
  sourceFingerprint: SOURCE_FINGERPRINT_SHA256,
  candidateFingerprint: CANDIDATE_FINGERPRINT_SHA256
};

function makePolicy(seat = 0) {
  return createPolicy({ role: 'opponent', seat, policyVersion: POLICY_VERSION, config });
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

function inferSubtypes(printing) {
  if (/VMAX/i.test(printing)) return ['VMAX'];
  if (/VSTAR/i.test(printing)) return ['VSTAR'];
  if (/-GX/i.test(printing)) return ['Basic', 'GX'];
  if (/\bex\b/i.test(printing)) return ['Basic', 'ex'];
  if (/\bV\b/i.test(printing)) return ['Basic', 'V'];
  if (/TAG TEAM/i.test(printing)) return ['Basic', 'TAG TEAM'];
  return ['Basic'];
}

function pokemon(printing = 'Regidrago VSTAR SIT 136', options = {}) {
  const abilities = options.abilities ?? [];
  return {
    printing,
    name: options.name ?? printing.split(' ').slice(0, -2).join(' '),
    hp: options.hp ?? (/VMAX/i.test(printing) ? 320 : 230),
    damage: options.damage ?? 0,
    lastPlayedOrEvolvedTurn: options.lastPlayedOrEvolvedTurn ?? 1,
    printed: {
      stage: options.stage ?? 'BASIC',
      subtypes: options.subtypes ?? inferSubtypes(printing),
      types: options.types ?? ['Dragon'],
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
      name, powerType: 'ABILITY', text: 'A public test ability.'
    })),
    abilitySuppressions: null
  };
}

function player(options = {}) {
  const bench = (options.bench ?? []).slice(0, 5);
  while (bench.length < 5) bench.push(null);
  return {
    active: options.active === undefined ? null : options.active,
    bench,
    stadium: options.stadium ?? [],
    discard: options.discard ?? [],
    lostZone: options.lostZone ?? [],
    resolvingSupporter: options.resolvingSupporter ?? [],
    publicHand: options.publicHand ?? null,
    prizeSlots: options.prizeSlots ?? Array.from({ length: 6 }, (_, index) => ({ index })),
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
  const prompt = options.prompt ?? null;
  return {
    actorSeat: options.actorSeat ?? 0,
    globalTurn: options.globalTurn ?? 3,
    phase: 2,
    decisionKind: prompt ? 'owner-prompt' : 'owner-root',
    pendingPromptType: prompt?.promptType ?? null,
    pendingOwnerDeckSearch: false,
    ownHand: options.ownHand ?? [],
    ownPublic: options.ownPublic ?? player({
      active: pokemon('Regidrago VSTAR SIT 136', { abilities: ['Legacy Star'], subtypes: ['VSTAR'] }),
      ...(options.ownPlayer ?? {})
    }),
    opponentPublic: options.opponentPublic ?? player({
      active: null,
      ...(options.opponentPlayer ?? {})
    }),
    ownTurnResources: options.ownTurnResources ?? turnResources(),
    ownerK1: null
  };
}

function rootRequest(options = {}) {
  const seat = options.seat ?? 0;
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: options.requestId ?? 'agent1-rank12-root-1',
    sequence: options.sequence ?? 1,
    role: 'opponent',
    seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation({ ...options, actorSeat: seat }),
    prompt: null,
    publicEventReceipt: options.publicEventReceipt ?? null,
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
    requestId: options.requestId ?? 'agent1-rank12-prompt-1',
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
    publicEventReceipt: options.publicEventReceipt ?? null,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: [] }
  };
}

function eventPokemon(slot) {
  if (!slot) return null;
  return {
    printing: slot.printing,
    movedFromBenchToActiveThisTurn: null,
    knownAbilityUse: (slot.abilities ?? []).map(name => ({ name, usedThisTurn: true }))
  };
}

function eventReceipt(request, priorKO = true) {
  const view = request.observation;
  return {
    version: protocol.EVENT_RECEIPT_VERSION,
    actorSeat: view.actorSeat,
    turn: view.globalTurn,
    ownerActive: eventPokemon(view.ownPublic.active),
    ownerBench: view.ownPublic.bench.map(eventPokemon),
    priorOpponentTurnKO: { any: priorKO, byAttack: priorKO },
    opponentLastTurnAttack: null,
    opponentLastTurnTurn: null,
    opponentLastTurnAttacks: null
  };
}

function checkedDecision(request, seat = request.seat) {
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

function action(token, kind, actorPrinting, publicMetadata = {}, extra = {}) {
  return {
    token,
    kind,
    ...(actorPrinting ? { actorPrinting } : {}),
    ...(Object.keys(publicMetadata).length ? { publicMetadata } : {}),
    ...extra
  };
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

function pokemonChoice(token, printing, owner = 'opponent', zone = 'bench', index = 0) {
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

function multiMetadata(minimumCount, maximumCount, selectionType = 'card-combination') {
  return { selectionType, minimumCount, maximumCount, allowCancel: false, isSecret: false };
}

test('initialization binds opponent role, seat, exact rank-12 source and fixed candidate', () => {
  assert.throws(() => createPolicy({
    role: 'candidate', seat: 0, policyVersion: POLICY_VERSION, config
  }), /AGENT1_RANK12_POLICY_INIT_MISMATCH/);
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION,
    config: { ...config, rank: 10 }
  }), /AGENT1_RANK12_POLICY_INIT_MISMATCH/);
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION,
    config: { ...config, sourceFingerprint: '0'.repeat(64) }
  }), /AGENT1_RANK12_POLICY_INIT_MISMATCH/);
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION,
    config: { ...config, candidateFingerprint: '0'.repeat(64) }
  }), /AGENT1_RANK12_POLICY_INIT_MISMATCH/);
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION,
    config: { ...config, extra: true }
  }), /AGENT1_RANK12_POLICY_INIT_MISMATCH/);
});

test('same actor-visible request is deterministic for either physical seat', () => {
  for (const seat of [0, 1]) {
    const request = rootRequest({
      seat,
      ownPublic: player({
        active: pokemon('Regidrago VSTAR SIT 136', { subtypes: ['VSTAR'] }),
        discard: ['Noivern ex PAL 153']
      }),
      items: [
        action('apex', 'attack', 'Regidrago VSTAR SIT 136', {}, { attackName: 'Apex Dragon' }),
        { token: 'pass', kind: 'pass' }
      ]
    });
    const first = checkedDecision(request, seat);
    const second = checkedDecision(request, seat);
    assert.deepEqual(first, second);
    assert.deepEqual(first, { kind: 'select-action', token: 'apex' });
  }
});

test('Megaton Blower is selected only when a visible opponent Tool, Special Energy or Stadium exists', () => {
  const withTool = rootRequest({
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', { subtypes: ['VMAX'], tools: ['Stealthy Hood UNB 186'] })
    }),
    items: [
      action('blower', 'play-card', 'Megaton Blower SSP 182'),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(withTool), { kind: 'select-action', token: 'blower' });

  const noTarget = rootRequest({
    opponentPublic: player({ active: pokemon('Shadow Rider Calyrex VMAX CRE 75', { subtypes: ['VMAX'] }) }),
    items: [
      action('blower', 'play-card', 'Megaton Blower SSP 182'),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(noTarget), { kind: 'select-action', token: 'pass' });
});

test('Path to the Peak is withheld until the own VSTAR power is spent', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Regidrago VSTAR SIT 136', { subtypes: ['VSTAR'], abilities: ['Legacy Star'] }),
      publicTurnRestrictions: { vstarUsed: false }
    }),
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', { subtypes: ['VMAX'] }),
      bench: [pokemon("Lillie's Clefairy ex JTG 56")]
    }),
    items: [
      action('peak', 'play-card', 'Path to the Peak CRE 148'),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Path to the Peak can be selected after own VSTAR ability use when the opponent has Rule Box threats', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon('Regidrago VSTAR SIT 136', { subtypes: ['VSTAR'], abilities: ['Legacy Star'] }),
      publicTurnRestrictions: { vstarUsed: true }
    }),
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', { subtypes: ['VMAX'] }),
      bench: [pokemon("Lillie's Clefairy ex JTG 56")]
    }),
    items: [
      action('peak', 'play-card', 'Path to the Peak CRE 148'),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'peak' });
});

test('Apex Dragon chooses Dominating Echo when the opponent has a Stadium in play', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: actorChoiceSource('Regidrago VSTAR SIT 136', 'Apex Dragon'),
    observation: {
      ownPublic: player({
        active: pokemon('Regidrago VSTAR SIT 136', { subtypes: ['VSTAR'] })
      }),
      opponentPublic: player({
        active: pokemon('Shadow Rider Calyrex VMAX CRE 75', { subtypes: ['VMAX'] }),
        stadium: ['Sky Field ROS 89']
      })
    },
    choices: [
      { token: 'timeless', kind: 'attack', label: 'Timeless-GX', publicMetadata: { sourceAttack: 'Timeless-GX' } },
      { token: 'dominating', kind: 'attack', label: 'Dominating Echo', publicMetadata: { sourceAttack: 'Dominating Echo' } },
      { token: 'phantom', kind: 'attack', label: 'Phantom Dive', publicMetadata: { sourceAttack: 'Phantom Dive' } }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'dominating' });
});

test('Mysterious Treasure discard cost sends Noivern ex to the discard as an Apex payload', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure discard cost'),
    description: 'Choose a card from your hand to discard.',
    publicMetadata: multiMetadata(1, 1),
    choices: [
      cardChoice('noivern', 'Noivern ex PAL 153', 'hand'),
      cardChoice('dte', 'Double Dragon Energy ROS 97', 'hand'),
      cardChoice('vstar', 'Regidrago VSTAR SIT 136', 'hand')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['noivern'] });
});

test('Mysterious Treasure search prioritizes the missing Regidrago VSTAR after a Regidrago V is established', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure'),
    description: 'Search your deck for a Pokémon and put it into your hand.',
    publicMetadata: multiMetadata(1, 1),
    observation: {
      ownPublic: player({ active: pokemon('Regidrago V SIT 135', { subtypes: ['Basic', 'V'] }) })
    },
    choices: [
      cardChoice('budew', 'Budew ASC 16'),
      cardChoice('vstar', 'Regidrago VSTAR SIT 136'),
      cardChoice('dialga', 'Dialga-GX UPR 100')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['vstar'] });
});

test('Counter Catcher selects the high-Prize Shadow Rider VMAX rather than a low-value support target', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Counter Catcher PAR 160', 'Counter Catcher'),
    description: "Choose 1 of your opponent's Benched Pokémon.",
    publicMetadata: multiMetadata(1, 1, 'pokemon'),
    observation: {
      opponentPublic: player({
        active: pokemon('Shadow Rider Calyrex V CRE 74', { subtypes: ['Basic', 'V'] }),
        bench: [
          pokemon('Shadow Rider Calyrex VMAX CRE 75', { subtypes: ['VMAX'] }),
          pokemon('Tapu Lele-GX GRI 60', { subtypes: ['Basic', 'GX'] }),
          pokemon('Mimikyu GRI 58')
        ]
      })
    },
    choices: [
      pokemonChoice('vmax', 'Shadow Rider Calyrex VMAX CRE 75', 'opponent', 'bench', 0),
      pokemonChoice('lele', 'Tapu Lele-GX GRI 60', 'opponent', 'bench', 1),
      pokemonChoice('mimikyu', 'Mimikyu GRI 58', 'opponent', 'bench', 2)
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['vmax'] });
});

test('Echoing Horn selects a high-Prize Basic Pokémon from the opponent discard', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Echoing Horn CRE 136', 'Echoing Horn'),
    description: "Choose a Basic Pokémon in your opponent's discard pile.",
    publicMetadata: multiMetadata(1, 1, 'pokemon'),
    choices: [
      pokemonChoice('tag', 'Trevenant & Dusknoir-GX SMP SM217', 'opponent', 'discard', 0),
      pokemonChoice('mimikyu', 'Mimikyu GRI 58', 'opponent', 'discard', 1)
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['tag'] });
});

test('Flip the Script is used only when the public event receipt records a prior-turn Knock Out', () => {
  const ownPublic = player({
    active: pokemon('Regidrago VSTAR SIT 136', { subtypes: ['VSTAR'], abilities: ['Legacy Star'] }),
    bench: [pokemon('Fezandipiti ex ASC 142', { abilities: ['Flip the Script'] })]
  });
  const items = [
    action('flip', 'use-ability', 'Fezandipiti ex ASC 142', { abilityName: 'Flip the Script' }),
    { token: 'pass', kind: 'pass' }
  ];
  const withoutReceipt = rootRequest({ ownPublic, ownHand: ['Grass Energy MEE 9'], items });
  assert.deepEqual(checkedDecision(withoutReceipt), { kind: 'select-action', token: 'pass' });

  const withReceipt = rootRequest({ ownPublic, ownHand: ['Grass Energy MEE 9'], items });
  withReceipt.publicEventReceipt = eventReceipt(withReceipt, true);
  assert.deepEqual(checkedDecision(withReceipt), { kind: 'select-action', token: 'flip' });
});

test('Hisuian Heavy Ball fails closed when face-down Prize identities are not visible', () => {
  const request = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource('Hisuian Heavy Ball ASR 146', 'Hisuian Heavy Ball'),
    description: 'Look at your face-down Prize cards and choose a Pokémon card.',
    publicMetadata: multiMetadata(1, 1, 'prize-slots'),
    choices: [{
      token: 'prize-0',
      kind: 'prize',
      label: 'Prize slot 0',
      publicMetadata: { selectionIndex: 0, ownerSeat: 'actor', sourceZone: 'prizes', isOwnerVisible: false }
    }]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'RANK12_PRIZE_IDENTITY_NOT_VISIBLE'
  });
});

test('Phantom Dive PutDamagePrompt remains fail-closed until the host exposes native allocation semantics', () => {
  const request = promptRequest({
    promptType: 'PutDamagePrompt',
    source: actorChoiceSource('Dragapult ex TWM 130', 'Phantom Dive'),
    choices: []
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'RANK12_PHANTOM_DIVE_HOST_PROJECTION_BLOCKED'
  });
});

test('Crispin search chooses one Grass and one Fire Energy when both are offered', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Crispin SCR 133', 'Crispin'),
    description: 'Search your deck for up to 2 Basic Energy cards of different types.',
    publicMetadata: multiMetadata(2, 2),
    choices: [
      cardChoice('grass', 'Grass Energy MEE 9'),
      cardChoice('fire', 'Fire Energy MEE 10'),
      cardChoice('dte', 'Double Dragon Energy ROS 97')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['grass', 'fire'] });
});

test('VS Seeker recovers a high-value Supporter rather than a Pokémon search target', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('VS Seeker PHF 109', 'VS Seeker'),
    description: 'Choose a Supporter card from your discard pile.',
    publicMetadata: multiMetadata(1, 1),
    choices: [
      cardChoice('guzma', 'Guzma BUS 115', 'discard'),
      cardChoice('sycamore', 'Professor Sycamore BKP 107', 'discard')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['guzma'] });
});

test('unknown prompt families fail closed', () => {
  const request = promptRequest({
    promptType: 'UnknownRank12Prompt',
    source: actorChoiceSource(null, 'Unknown engine prompt'),
    choices: [{ token: 'continue', kind: 'option', label: 'Continue' }]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'UNSUPPORTED_RANK12_PROMPT_TYPE'
  });
});

test('no executable action is invented when no supported action or pass token is offered', () => {
  const request = rootRequest({
    opponentPublic: player({ active: pokemon('Shadow Rider Calyrex VMAX CRE 75', { subtypes: ['VMAX'] }) }),
    items: [action('blower', 'play-card', 'Megaton Blower SSP 182')]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'NO_SUPPORTED_RANK12_ACTION'
  });
});

test('role/seat mismatch never emits an executable action', () => {
  const request = rootRequest({ seat: 1, items: [{ token: 'pass', kind: 'pass' }] });
  assert.deepEqual(makePolicy(0).decide(request), {
    kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH'
  });
});

test('the actual worker request validator rejects hidden opponent-hand and RNG fields', () => {
  const request = rootRequest({ items: [{ token: 'pass', kind: 'pass' }] });
  const init = {
    schema: protocol.INIT_SCHEMA,
    type: 'init',
    role: 'opponent',
    seat: 0,
    policyVersion: POLICY_VERSION,
    bundleSha256: 'a'.repeat(64),
    config
  };
  assert.throws(() => protocol.validateRequest({
    ...request,
    observation: { ...request.observation, opponentHand: ['secret'] }
  }, init, request.sequence, new Set()));
  assert.throws(() => protocol.validateRequest({
    ...request,
    observation: { ...request.observation, rngSeed: 123 }
  }, init, request.sequence, new Set()));
});

test('the actual worker decision validator rejects an invented action token', () => {
  const request = rootRequest({ items: [{ token: 'pass', kind: 'pass' }] });
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
    { kind: 'select-action', token: 'not-in-frontier' }, validated.prompt, validated.actionTokens
  ));
});
