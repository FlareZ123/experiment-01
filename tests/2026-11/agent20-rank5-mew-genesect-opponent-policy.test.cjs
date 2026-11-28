'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const policyModule = require('../../simulation/evaluation/2026-11/agent20-rank5-mew-genesect-opponent-policy.cjs');

const {
  POLICY_VERSION,
  SOURCE_RANK,
  SOURCE_INVENTORY,
  SOURCE_FINGERPRINT_SHA256,
  CANDIDATE_FINGERPRINT_SHA256,
  createPolicy
} = policyModule;

const P = {
  mewV: 'Mew V FST 113',
  mewVMAX: 'Mew VMAX FST 114',
  genesect: 'Genesect V FST 185',
  dedenne: 'Dedenne-GX UNB 57',
  crobat: 'Crobat V DAA 104',
  wally: 'Wally ROS 94',
  guzma: 'Guzma BUS 115',
  dce: 'Double Colorless Energy SUM 136',
  quickBall: 'Quick Ball FST 237',
  ultraBall: 'Ultra Ball MEG 131',
  path: 'Path to the Peak CRE 148',
  specialCharge: 'Special Charge STS 105',
  specialRedCard: 'Special Red Card CRI 82',
  muscleBand: 'Muscle Band XY 121',
  forestSealStone: 'Forest Seal Stone SIT 156'
};

function makePolicy(seat = 0, config = {}) {
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
    hp: options.hp ?? 180,
    damage: options.damage ?? 0,
    lastPlayedOrEvolvedTurn: options.lastPlayedOrEvolvedTurn ?? 1,
    printed: {
      stage: options.stage ?? 'BASIC',
      subtypes: options.subtypes ?? ['Basic', 'V', 'Fusion Strike'],
      types: options.types ?? ['Psychic'],
      retreatCost: options.retreatCost ?? ['Colorless'],
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
    requestId: options.requestId ?? 'agent20-root-1',
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

function actorChoiceSource(sourcePrinting, effectName, copiedSourcePrinting, copiedAttackName) {
  return {
    classification: 'actor-choice',
    sourceKind: sourcePrinting === null ? 'engine' : 'card-effect',
    sourcePrinting,
    effectName,
    ...(copiedSourcePrinting ? { copiedSourcePrinting, copiedAttackName } : {})
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
    // Current actor protocol requires an explicit native selection category.
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
      {selectionType:'option',allowCancel:false})
  };
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: options.requestId ?? 'agent20-prompt-1',
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
    config: {}
  };
  protocol.validateInit(init);
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

test('rank-5 module is fixed to the exact 60-card Mew Genesect source', () => {
  assert.equal(SOURCE_RANK, 5);
  assert.equal(SOURCE_INVENTORY.reduce((sum, row) => sum + row[1], 0), 60);
  assert.equal(SOURCE_INVENTORY.find(row => row[0].test(P.dce))?.[1], 4);
  assert.equal(SOURCE_INVENTORY.find(row => row[0].test('Basic Psychic Energy'))?.[1], undefined);
});

test('policy rejects a different rank, source, or candidate fingerprint', () => {
  assert.throws(() => makePolicy(0, { rank: 3 }), /INIT_MISMATCH/);
  assert.throws(() => makePolicy(0, { sourceFingerprint: '0'.repeat(64) }), /INIT_MISMATCH/);
  assert.throws(() => makePolicy(0, { candidateFingerprint: '1'.repeat(64) }), /INIT_MISMATCH/);
});

test('rank-5 policy initializes through the real V3 worker zero-key contract', () => {
  const init = {
    schema: protocol.INIT_SCHEMA,
    type: 'init',
    role: 'opponent',
    seat: 1,
    policyVersion: POLICY_VERSION,
    bundleSha256: 'a'.repeat(64),
    config: {}
  };
  const accepted = protocol.validateInit(init);
  const policy = createPolicy({
    ...accepted,
    rng: () => 0.5
  });
  assert.equal(typeof policy.decide, 'function');

  const nonEmptyInit = { ...init, config: { rank: SOURCE_RANK } };
  assert.throws(() => protocol.validateInit(nonEmptyInit));
  assert.throws(() => createPolicy({
    ...accepted,
    config: nonEmptyInit.config,
    rng: () => 0.5
  }), /INIT_MISMATCH/);
});

test('Fusion Strike System draws only while hand is below the Fusion Strike board count', () => {
  const own = player({
    active: pokemon(P.mewV),
    bench: [pokemon(P.genesect, { abilities: ['Fusion Strike System'] })]
  });
  const request = rootRequest({
    ownPublic: own,
    ownHand: [P.mewVMAX],
    items: [
      { token: 'draw', kind: 'use-ability', actorPrinting: P.genesect,
        publicMetadata: { abilityName: 'Fusion Strike System' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'draw' });

  const fullHand = rootRequest({
    ownPublic: own,
    ownHand: [P.mewVMAX, P.dce],
    items: [
      { token: 'draw', kind: 'use-ability', actorPrinting: P.genesect,
        publicMetadata: { abilityName: 'Fusion Strike System' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(fullHand), { kind: 'select-action', token: 'pass' });
});

test('Mew VMAX natural evolution is prioritized over generic Pokémon deployment', () => {
  const own = player({
    active: pokemon(P.mewV, { lastPlayedOrEvolvedTurn: 2 })
  });
  const request = rootRequest({
    globalTurn: 3,
    ownPublic: own,
    items: [
      { token: 'evolve', kind: 'play-card', actorPrinting: P.mewVMAX,
        publicMetadata: { cardType: 'pokemon' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'evolve' });
});

test('Wally is used only for a same-turn Mew V evolution opportunity', () => {
  const own = player({
    active: pokemon(P.mewV, { lastPlayedOrEvolvedTurn: 3 })
  });
  const request = rootRequest({
    globalTurn: 3,
    ownPublic: own,
    items: [
      { token: 'wally', kind: 'play-card', actorPrinting: P.wally,
        publicMetadata: { cardType: 'supporter' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'wally' });
});

test('Double Colorless Energy is attached to Mew VMAX before Genesect', () => {
  const own = player({
    active: pokemon(P.mewVMAX, { stage: 'VMAX', subtypes: ['VMAX', 'Fusion Strike'] }),
    bench: [pokemon(P.genesect)]
  });
  const request = rootRequest({
    ownPublic: own,
    items: [
      { token: 'attach', kind: 'play-card', actorPrinting: P.dce,
        targetPrinting: P.mewVMAX, publicMetadata: { cardType: 'energy' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'attach' });
});

test('DCE attachment uses public benchIndex when two Mew VMAX share a printing', () => {
  const own = player({
    active: pokemon(P.mewVMAX, {
      stage: 'VMAX', subtypes: ['VMAX', 'Fusion Strike'], energies: [P.dce]
    }),
    bench: [pokemon(P.mewVMAX, { stage: 'VMAX', subtypes: ['VMAX', 'Fusion Strike'] })]
  });
  const request = rootRequest({
    ownPublic: own,
    items: [
      { token: 'active-dce', kind: 'play-card', actorPrinting: P.dce,
        targetPrinting: P.mewVMAX, publicMetadata: { targetZone: 'active', isOwnerVisible: true } },
      { token: 'bench-dce', kind: 'play-card', actorPrinting: P.dce,
        targetPrinting: P.mewVMAX, publicMetadata: { targetZone: 'bench', benchIndex: 0, isOwnerVisible: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'select-action', token: 'bench-dce' });
});

test('Star Alchemy is used when it can fetch the missing Mew VMAX', () => {
  const own = player({
    active: pokemon(P.mewV, { tools: [P.forestSealStone] }),
    bench: [pokemon(P.genesect)]
  });
  const request = rootRequest({
    ownPublic: own,
    items: [
      { token: 'star', kind: 'use-ability', actorPrinting: P.mewV,
        publicMetadata: { abilityName: 'Star Alchemy' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'star' });
});

test('Star Alchemy searches Mew VMAX before generic Trainer cards', () => {
  const own = player({
    active: pokemon(P.mewV),
    bench: [pokemon(P.genesect)]
  });
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource(P.forestSealStone, 'Star Alchemy'),
    observation: { ownPublic: own },
    publicMetadata: {
      selectionType: 'card-combination',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false
    },
    choices: [
      cardChoice('ultra', P.ultraBall, 'deck'),
      cardChoice('mew-vmax', P.mewVMAX, 'deck')
    ]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'select-choices', tokens: ['mew-vmax'] });
});

test('Star Alchemy searches DCE when Mew VMAX is already in play without Energy', () => {
  const own = player({
    active: pokemon(P.mewV),
    bench: [
      pokemon(P.mewVMAX, { stage: 'VMAX', subtypes: ['VMAX', 'Fusion Strike'] }),
      pokemon(P.genesect)
    ]
  });
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource(P.forestSealStone, 'Star Alchemy'),
    observation: { ownPublic: own },
    publicMetadata: {
      selectionType: 'card-combination',
      minimumCount: 1,
      maximumCount: 1,
      allowCancel: false
    },
    choices: [
      cardChoice('ultra', P.ultraBall, 'deck'),
      cardChoice('dce', P.dce, 'deck')
    ]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'select-choices', tokens: ['dce'] });
});

test('Star Alchemy is not used after the VSTAR Power has been spent', () => {
  const own = player({
    active: pokemon(P.mewV),
    bench: [pokemon(P.genesect)],
    publicTurnRestrictions: { vstarUsed: true }
  });
  const request = rootRequest({
    ownPublic: own,
    ownTurnResources: turnResources({ vstarUsed: true }),
    items: [
      { token: 'star', kind: 'use-ability', actorPrinting: P.genesect,
        publicMetadata: { abilityName: 'Star Alchemy' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Genesect V is deployed as a second Fusion Strike System engine', () => {
  const own = player({ active: pokemon(P.mewV) });
  const request = rootRequest({
    ownPublic: own,
    items: [
      { token: 'genesect', kind: 'play-card', actorPrinting: P.genesect,
        publicMetadata: { cardType: 'pokemon' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'genesect' });
});

test('Mew VMAX uses Cross Fusion Strike when DCE is attached', () => {
  const own = player({
    active: pokemon(P.mewVMAX, {
      stage: 'VMAX',
      subtypes: ['VMAX', 'Fusion Strike'],
      energies: [P.dce]
    }),
    bench: [pokemon(P.genesect)]
  });
  const request = rootRequest({
    ownPublic: own,
    items: [
      { token: 'attack', kind: 'attack', actorPrinting: P.mewVMAX,
        attackName: 'Cross Fusion Strike', publicMetadata: { attackCostPayable: true } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'attack' });
});

test('Cross Fusion Strike selects the 210-damage Genesect Techno Blast donor', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: actorChoiceSource(P.mewVMAX, 'Cross Fusion Strike'),
    choices: [
      { token: 'energy-mix', kind: 'attack', label: 'Energy Mix' },
      { token: 'techno', kind: 'attack', label: 'Techno Blast' },
      { token: 'leap', kind: 'attack', label: 'Psychic Leap' }
    ]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'select-choice', token: 'techno' });
});

test('copied Energy Mix searches DCE and attaches it to an unpowered Mew VMAX', () => {
  const source = actorChoiceSource(P.mewVMAX, 'Cross Fusion Strike', P.mewV, 'Energy Mix');
  const energyRequest = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source,
    choices: [
      cardChoice('psychic', 'Basic Psychic Energy SVE 5', 'deck'),
      cardChoice('dce', P.dce, 'deck')
    ]
  });
  assert.deepEqual(checkedDecision(energyRequest),
    { kind: 'select-choices', tokens: ['dce'] });

  const own = player({
    active: pokemon(P.mewVMAX, { stage: 'VMAX', subtypes: ['VMAX', 'Fusion Strike'] }),
    bench: [pokemon(P.mewV), pokemon(P.genesect)]
  });
  const targetRequest = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source,
    observation: { ownPublic: own },
    choices: [
      pokemonChoice('genesect', P.genesect),
      pokemonChoice('mew-vmax', P.mewVMAX, 'actor', 'active')
    ]
  });
  assert.deepEqual(checkedDecision(targetRequest),
    { kind: 'select-choices', tokens: ['mew-vmax'] });
});

test('Energy Mix target selection uses public benchIndex for duplicate Mew VMAX and abstains if ambiguous', () => {
  const source = actorChoiceSource(P.mewVMAX, 'Cross Fusion Strike', P.mewV, 'Energy Mix');
  const own = player({
    active: pokemon(P.mewVMAX, { stage: 'VMAX', subtypes: ['VMAX', 'Fusion Strike'], energies: [P.dce] }),
    bench: [pokemon(P.mewVMAX, { stage: 'VMAX', subtypes: ['VMAX', 'Fusion Strike'] })]
  });
  const activeChoice = pokemonChoice('active-vmax', P.mewVMAX, 'actor', 'active');
  const benchChoice = pokemonChoice('bench-vmax', P.mewVMAX, 'actor', 'bench', 0);
  benchChoice.publicMetadata.benchIndex = 0;
  const targetRequest = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source,
    observation: { ownPublic: own },
    choices: [activeChoice, benchChoice]
  });
  assert.deepEqual(checkedDecision(targetRequest),
    { kind: 'select-choices', tokens: ['bench-vmax'] });

  const ambiguousChoices = ['active-unknown', 'bench-unknown'].map((token, index) => ({
    token,
    kind: 'pokemon',
    printing: P.mewVMAX,
    label: P.mewVMAX,
    publicMetadata: {
      selectionIndex: index, selectedCount: 0, selectionType: 'pokemon',
      ownerSeat: 'actor', isOwnerVisible: true
    }
  }));
  const ambiguousRequest = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source,
    observation: { ownPublic: own },
    choices: ambiguousChoices
  });
  assert.deepEqual(checkedDecision(ambiguousRequest),
    { kind: 'abstain', reasonCode: 'NO_FUSION_STRIKE_ENERGY_TARGET' });
});

test('Guzma targets a vulnerable two-Prize Shadow Rider V before an undamaged VMAX', () => {
  const opponent = player({
    active: pokemon('Mimikyu GRI 58', { hp: 70, subtypes: ['Basic'] }),
    bench: [
      pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210, subtypes: ['Basic', 'V'] }),
      pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, stage: 'VMAX', subtypes: ['VMAX'] })
    ]
  });
  const own = player({
    active: pokemon(P.mewVMAX, {
      stage: 'VMAX', subtypes: ['VMAX', 'Fusion Strike'], energies: [P.dce]
    }),
    bench: [pokemon(P.genesect)]
  });
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource(P.guzma, 'Guzma'),
    observation: { ownPublic: own, opponentPublic: opponent },
    choices: [
      pokemonChoice('vmax', 'Shadow Rider Calyrex VMAX CRE 75', 'opponent', 'bench', 0),
      pokemonChoice('v', 'Shadow Rider Calyrex V CRE 74', 'opponent', 'bench', 1)
    ]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'select-choices', tokens: ['v'] });
});

test('Battle VIP Pass chooses one Mew V and one Genesect V for the opening board', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Battle VIP Pass FST 225', 'Battle VIP Pass'),
    publicMetadata: {
      selectionType: 'card-combination',
      minimumCount: 1,
      maximumCount: 2,
      allowCancel: false
    },
    choices: [
      cardChoice('mew', P.mewV, 'deck'),
      cardChoice('genesect', P.genesect, 'deck'),
      cardChoice('crobat', P.crobat, 'deck')
    ]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'select-choices', tokens: ['genesect', 'mew'] });
});

test('Quick Ball discards a non-core Trainer rather than the only DCE', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource(P.quickBall, 'Quick Ball'),
    observation: { ownHand: [P.dce, P.ultraBall] },
    choices: [
      cardChoice('dce', P.dce, 'hand'),
      cardChoice('ultra', P.ultraBall, 'hand')
    ]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'select-choices', tokens: ['ultra'] });
});

test('Guzma damage estimate adds 20 only for a visibly attached Muscle Band', () => {
  const opponent = player({
    active: pokemon('Mimikyu GRI 58', { hp: 70, subtypes: ['Basic'] }),
    bench: [
      pokemon('Shadow Rider Calyrex V CRE 74', { hp: 210, subtypes: ['Basic', 'V'] }),
      pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        hp: 320, damage: 110, stage: 'VMAX', subtypes: ['VMAX']
      })
    ]
  });
  const own = player({
    active: pokemon(P.mewVMAX, {
      stage: 'VMAX', subtypes: ['VMAX', 'Fusion Strike'],
      energies: [P.dce], tools: [P.muscleBand]
    }),
    bench: [pokemon(P.genesect)]
  });
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource(P.guzma, 'Guzma'),
    observation: { ownPublic: own, opponentPublic: opponent },
    choices: [
      pokemonChoice('v', 'Shadow Rider Calyrex V CRE 74', 'opponent', 'bench', 0),
      pokemonChoice('vmax', 'Shadow Rider Calyrex VMAX CRE 75', 'opponent', 'bench', 1)
    ]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'select-choices', tokens: ['vmax'] });
});

test('Special Charge recovers two DCE rather than Pokémon from the discard pile', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Special Charge STS 105', 'Special Charge'),
    publicMetadata: {
      selectionType: 'card-combination',
      minimumCount: 2,
      maximumCount: 2,
      allowCancel: false
    },
    choices: [
      cardChoice('dce-a', P.dce, 'discard'),
      cardChoice('mew', P.mewV, 'discard'),
      cardChoice('dce-b', P.dce, 'discard')
    ]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'select-choices', tokens: ['dce-a', 'dce-b'] });
});

test('Secret Box selects distinct supporter, item, tool, and stadium categories', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Secret Box TWM 163', 'Secret Box'),
    publicMetadata: {
      selectionType: 'card-combination',
      minimumCount: 4,
      maximumCount: 4,
      allowCancel: false
    },
    choices: [
      { ...cardChoice('wally', P.wally), publicMetadata: { sourceZone: 'deck', ownerSeat: 'actor', cardType: 'supporter' } },
      { ...cardChoice('marnie', 'Marnie SSH 169'), publicMetadata: { sourceZone: 'deck', ownerSeat: 'actor', cardType: 'supporter' } },
      { ...cardChoice('ultra', P.ultraBall), publicMetadata: { sourceZone: 'deck', ownerSeat: 'actor', cardType: 'item' } },
      { ...cardChoice('quick', P.quickBall), publicMetadata: { sourceZone: 'deck', ownerSeat: 'actor', cardType: 'item' } },
      { ...cardChoice('forest', 'Forest Seal Stone SIT 156'), publicMetadata: { sourceZone: 'deck', ownerSeat: 'actor', cardType: 'tool' } },
      { ...cardChoice('muscle', 'Muscle Band XY 121'), publicMetadata: { sourceZone: 'deck', ownerSeat: 'actor', cardType: 'tool' } },
      { ...cardChoice('path', P.path), publicMetadata: { sourceZone: 'deck', ownerSeat: 'actor', cardType: 'stadium' } }
    ]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'select-choices', tokens: ['wally', 'ultra', 'forest', 'path'] });
});

test('Secret Box abstains when a required category is absent from the prompt', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Secret Box TWM 163', 'Secret Box'),
    publicMetadata: {
      selectionType: 'card-combination',
      minimumCount: 4,
      maximumCount: 4,
      allowCancel: false
    },
    choices: [
      { ...cardChoice('wally', P.wally), publicMetadata: { sourceZone: 'deck', ownerSeat: 'actor', cardType: 'supporter' } },
      { ...cardChoice('marnie', 'Marnie SSH 169'), publicMetadata: { sourceZone: 'deck', ownerSeat: 'actor', cardType: 'supporter' } },
      { ...cardChoice('ultra', P.ultraBall), publicMetadata: { sourceZone: 'deck', ownerSeat: 'actor', cardType: 'item' } },
      { ...cardChoice('path', P.path), publicMetadata: { sourceZone: 'deck', ownerSeat: 'actor', cardType: 'stadium' } }
    ]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'abstain', reasonCode: 'NO_SUPPORTED_CARD_SELECTION' });
});

test('the last Mew VMAX is not an Ultra Ball or Secret Box discard target', () => {
  const view = observation({
    ownHand: [P.mewVMAX],
    ownPublic: player({ active: pokemon(P.mewV) })
  });
  assert.equal(policyModule.scoreDiscardCard({ printing: P.mewVMAX }, view), 0);
});

test('Ultra Ball discards expendable Trainers while preserving DCE and the evolution piece', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource(P.ultraBall, 'Ultra Ball'),
    observation: {
      ownHand: [P.mewVMAX, P.dce, P.quickBall, 'Marnie SSH 169'],
      ownPublic: player({ active: pokemon(P.mewV) })
    },
    publicMetadata: {
      selectionType: 'card-combination',
      minimumCount: 2,
      maximumCount: 2,
      allowCancel: false
    },
    choices: [
      cardChoice('mew-vmax', P.mewVMAX, 'hand'),
      cardChoice('dce', P.dce, 'hand'),
      cardChoice('quick', P.quickBall, 'hand'),
      cardChoice('marnie', 'Marnie SSH 169', 'hand')
    ]
  });
  assert.deepEqual(checkedDecision(request),
    { kind: 'select-choices', tokens: ['marnie', 'quick'] });
});

test('Path to the Peak is sequenced only after available draw abilities are absent', () => {
  const own = player({
    active: pokemon(P.mewVMAX, {
      stage: 'VMAX', subtypes: ['VMAX', 'Fusion Strike'], energies: [P.dce]
    }),
    bench: [pokemon(P.genesect)]
  });
  const opponent = player({
    active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
      hp: 320, stage: 'VMAX', subtypes: ['VMAX'], abilities: ['Underworld Door']
    })
  });
  const request = rootRequest({
    ownPublic: own,
    opponentPublic: opponent,
    ownHand: ['Marnie SSH 169', 'Ultra Ball MEG 131', P.path, P.dce],
    items: [
      { token: 'path', kind: 'use-stadium', actorPrinting: P.path },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'path' });

  const beforeDraw = rootRequest({
    ownPublic: own,
    opponentPublic: opponent,
    ownHand: [P.dce],
    items: [
      { token: 'draw', kind: 'use-ability', actorPrinting: P.genesect,
        publicMetadata: { abilityName: 'Fusion Strike System' } },
      { token: 'path', kind: 'use-stadium', actorPrinting: P.path },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(beforeDraw), { kind: 'select-action', token: 'draw' });
});

test('Special Red Card is held until the opponent has three or fewer Prizes', () => {
  const ready = rootRequest({
    opponentPublic: player({ prizeCount: 3, handCount: 4 }),
    items: [
      { token: 'red', kind: 'play-card', actorPrinting: P.specialRedCard,
        publicMetadata: { cardType: 'item' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(ready), { kind: 'select-action', token: 'red' });

  const early = rootRequest({
    opponentPublic: player({ prizeCount: 4, handCount: 6 }),
    items: [
      { token: 'red', kind: 'play-card', actorPrinting: P.specialRedCard,
        publicMetadata: { cardType: 'item' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(early), { kind: 'select-action', token: 'pass' });
});

test('typed-cost attacks are not inferred payable from DCE alone', () => {
  const own = player({
    active: pokemon(P.genesect, { energies: [P.dce] })
  });
  const request = rootRequest({
    ownPublic: own,
    items: [
      { token: 'techno', kind: 'attack', actorPrinting: P.genesect,
        attackName: 'Techno Blast' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('unknown prompt families fail closed', () => {
  const request = promptRequest({
    promptType: 'UnknownPrompt',
    source: actorChoiceSource(P.mewVMAX, 'Unknown effect'),
    choices: [{ token: 'choice', kind: 'choice', label: 'Unknown' }]
  });
  // The shared host rejects unregistered prompt classes before invocation;
  // test only the worker's direct fail-closed behavior here.
  const worker=makePolicy(0);
  assert.deepEqual(worker.decide(request),
    { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' });
});

test('the same frozen policy behaves identically at physical seat one', () => {
  const request = rootRequest({
    seat: 1,
    ownPublic: player({ active: pokemon(P.mewV) }),
    items: [
      { token: 'genesect', kind: 'play-card', actorPrinting: P.genesect,
        publicMetadata: { cardType: 'pokemon' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request, 1),
    { kind: 'select-action', token: 'genesect' });
});

test('role/seat mismatch abstains rather than delegating', () => {
  const policy = makePolicy(0);
  assert.deepEqual(policy.decide({
    role: 'candidate',
    seat: 0,
    observation: { actorSeat: 0 },
    prompt: null
  }), { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' });
  assert.deepEqual(policy.decide({
    role: 'opponent',
    seat: 1,
    observation: { actorSeat: 1 },
    prompt: null
  }), { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' });
});
