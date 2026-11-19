'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const {
  POLICY_VERSION,
  SOURCE_ENTRY_JSON_SHA256,
  CANDIDATE_FINGERPRINT_SHA256,
  createPolicy
} = require('../../simulation/evaluation/2026-11/agent50-rank4-raichu-electrode-opponent-policy.cjs');

const config = {
  rank: 4,
  sourceFingerprint: SOURCE_ENTRY_JSON_SHA256,
  candidateFingerprint: CANDIDATE_FINGERPRINT_SHA256
};

function makePolicy(seat = 0) {
  return createPolicy({ role: 'opponent', seat, policyVersion: POLICY_VERSION, config });
}

function restrictions() {
  return {
    cannotAttackNextTurn: false, cannotUseAttacksNextTurn: [],
    blockedAttackNameNextTurn: null, blockedAttackNameUntilLeavesActive: null,
    onlyAllowedAttackNameNextTurn: null, attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0, cannotRetreat: false,
    cannotRetreatNextTurn: false, cannotRetreatWhileActive: false,
    cannotEvolveNextTurn: false
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
    stadiumAndToolHaveNoEffectTurnsRemaining: null,
    ...options
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
      name, powerType: 'ABILITY', text: 'Once during your turn.'
    })),
    abilitySuppressions: null
  };
}

function player(options = {}) {
  const bench = (options.bench ?? []).slice(0, 8);
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
    publicTurnRestrictions: publicRestrictions(options.publicTurnRestrictions ?? {}),
    handCount: options.handCount ?? 0,
    deckCount: options.deckCount ?? 30,
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
    requestId: options.requestId ?? 'agent50-root-1',
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
    requestId: options.requestId ?? 'agent50-prompt-1',
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
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: [] }
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

function cardChoice(token, printing, zone = 'deck', owner = 'actor') {
  return {
    token, kind: 'card', printing, label: printing,
    publicMetadata: { sourceZone: zone, ownerSeat: owner }
  };
}

function prizeChoice(token, printing, visible = true, index = 0) {
  return {
    token, kind: 'prize', printing, label: printing,
    publicMetadata: {
      selectionIndex: index, ownerSeat: 'actor',
      isOwnerVisible: visible, zone: 'prize'
    }
  };
}

test('initialization is bound to rank 4 and exact source/candidate fingerprints', () => {
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION,
    config: { ...config, rank: 3 }
  }));
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION,
    config: { ...config, sourceFingerprint: '0'.repeat(64) }
  }));
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION,
    config: { ...config, candidateFingerprint: '0'.repeat(64) }
  }));
  assert.throws(() => createPolicy({
    role: 'candidate', seat: 0, policyVersion: POLICY_VERSION, config
  }));
});

test('Dedechange is used when the actor hand is small and the deck is healthy', () => {
  const request = rootRequest({
    ownHand: ['Quick Ball FST 237', 'Unit Energy LPM UPR 138'],
    ownPublic: player({ deckCount: 28 }),
    items: [
      { token: 'dedechange', kind: 'use-ability', actorPrinting: 'Dedenne-GX UNB 57',
        publicMetadata: { abilityName: 'Dedechange' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'dedechange' });
});

test('Dedechange is preserved when the actor hand is already large', () => {
  const request = rootRequest({
    ownHand: ['Quick Ball FST 237', 'Unit Energy LPM UPR 138',
      "Lillie's Determination MEG 119", 'Rescue Stretcher GRI 130', 'Voltorb ROS 21'],
    ownPublic: player({ deckCount: 28 }),
    items: [
      { token: 'dedechange', kind: 'use-ability', actorPrinting: 'Dedenne-GX UNB 57',
        publicMetadata: { abilityName: 'Dedechange' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Extra Energy Bomb is not selected while AttachEnergyPrompt is unsupported', () => {
  const request = rootRequest({
    items: [
      { token: 'bomb', kind: 'use-ability', actorPrinting: 'Electrode-GX CES 48',
        publicMetadata: { abilityName: 'Extra Energy Bomb' } },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('unsupported Electro Rain and Crash and Burn lose to supported Horror House', () => {
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Gengar & Mimikyu-GX TEU 53', {
      stage: 'BASIC', subtypes: ['Basic', 'TAG TEAM', 'GX'],
      energies: ['Unit Energy LPM UPR 138']
    }) }),
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75'), handCount: 4
    }),
    items: [
      { token: 'rain', kind: 'attack', actorPrinting: 'Alolan Raichu UNM 57',
        attackName: 'Electro Rain' },
      { token: 'crash', kind: 'attack', actorPrinting: 'Electrode-GX CES 48',
        attackName: 'Crush and Burn-GX' },
      { token: 'horror', kind: 'attack', actorPrinting: 'Gengar & Mimikyu-GX TEU 53',
        attackName: 'Horror House-GX' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'horror' });
});

test('Battle VIP Pass searches Voltorb and Pikachu as the two opening pieces', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Battle VIP Pass FST 225', 'Battle VIP Pass'),
    observation: { globalTurn: 1, ownHand: ['Carmine TWM 145'] },
    publicMetadata: {
      selectionType: 'card-combination', minimumCount: 2, maximumCount: 2,
      allowCancel: false, isSecret: false
    },
    choices: [
      cardChoice('voltorb', 'Voltorb ROS 21'),
      cardChoice('pikachu', 'Pikachu LOR 52'),
      cardChoice('dedenne', 'Dedenne-GX UNB 57')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['voltorb', 'pikachu']
  });
});

test('Quick Ball pays its discard cost with a redundant Supporter, not a combo Basic', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Quick Ball FST 237', 'Quick Ball'),
    observation: {
      ownHand: ['Voltorb ROS 21', 'Carmine TWM 145', 'Carmine TWM 145']
    },
    choices: [
      cardChoice('voltorb', 'Voltorb ROS 21', 'hand'),
      cardChoice('carmine', 'Carmine TWM 145', 'hand')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'carmine' });
});

test('Tapu Lele Wonder Tag selects a draw Supporter when the hand is short', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Tapu Lele-GX GRI 60', 'Wonder Tag'),
    observation: { globalTurn: 3, ownHand: ['Quick Ball FST 237', 'Voltorb ROS 21'] },
    choices: [
      cardChoice('carmine', 'Carmine TWM 145'),
      cardChoice('lillie', "Lillie's Determination MEG 119"),
      cardChoice('ranger', 'Pokémon Ranger STS 104')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'lillie' });
});

test('Rescue Stretcher retrieves Alolan Raichu before lower-priority Pokémon', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Rescue Stretcher GRI 130', 'Rescue Stretcher'),
    publicMetadata: {
      selectionType: 'card-combination', minimumCount: 1, maximumCount: 3,
      allowCancel: false, isSecret: false
    },
    choices: [
      cardChoice('voltorb', 'Voltorb ROS 21', 'discard'),
      cardChoice('raichu', 'Alolan Raichu UNM 57', 'discard'),
      cardChoice('gengar', 'Gengar & Mimikyu-GX TEU 53', 'discard')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['raichu']
  });
});

test('Gladion takes a visible Alolan Raichu prize when the evolution line is incomplete', () => {
  const request = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource('Gladion CIN 95', 'Gladion'),
    observation: { ownPublic: player({ bench: [pokemon('Pikachu LOR 52')] }) },
    choices: [
      prizeChoice('unit', 'Unit Energy LPM UPR 138'),
      prizeChoice('raichu', 'Alolan Raichu UNM 57'),
      prizeChoice('voltorb', 'Voltorb ROS 21')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'raichu' });
});

test('Hisuian Heavy Ball chooses a visible Basic Pokémon, not a Stage 1 Raichu', () => {
  const request = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource('Hisuian Heavy Ball ASR 146', 'Hisuian Heavy Ball'),
    choices: [
      prizeChoice('raichu', 'Alolan Raichu UNM 57'),
      prizeChoice('voltorb', 'Voltorb ROS 21')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'voltorb' });
});

test('hidden Prize identities remain unknown and produce an abstention', () => {
  const request = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource('Gladion CIN 95', 'Gladion'),
    choices: [
      prizeChoice('hidden-1', 'Voltorb ROS 21', false),
      prizeChoice('hidden-2', 'Alolan Raichu UNM 57', false)
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'PRIZE_IDENTITY_UNAVAILABLE'
  });
});

test('Sky Field is used when the rank-4 bench is crowded and the opponent is not wide', () => {
  const request = rootRequest({
    ownPublic: player({
      bench: [
        pokemon('Voltorb ROS 21'), pokemon('Pikachu LOR 52'),
        pokemon('Dedenne-GX UNB 57'), pokemon('Crobat V DAA 104')
      ]
    }),
    opponentPublic: player({ bench: [] }),
    items: [
      { token: 'sky-field', kind: 'use-stadium', actorPrinting: 'Sky Field ROS 89' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'sky-field' });
});

test('Sky Field is withheld when the opponent already has the wider board', () => {
  const request = rootRequest({
    ownPublic: player({ bench: [pokemon('Voltorb ROS 21')] }),
    opponentPublic: player({
      bench: [
        pokemon('Shadow Rider Calyrex V CRE 74'),
        pokemon('Shadow Rider Calyrex VMAX CRE 75'),
        pokemon('Trevenant & Dusknoir-GX SMP 217'),
        pokemon('Mimikyu GRI 58'),
        pokemon('Tapu Lele-GX GRI 60'),
        pokemon('Marshadow UNB 81')
      ]
    }),
    items: [
      { token: 'sky-field', kind: 'use-stadium', actorPrinting: 'Sky Field ROS 89' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Unit Energy is attached to Alolan Raichu rather than a support Pokémon', () => {
  const request = rootRequest({
    ownPublic: player({ bench: [pokemon('Alolan Raichu UNM 57', {
      stage: 'STAGE1', subtypes: ['Stage 1']
    })] }),
    items: [
      { token: 'unit-raichu', kind: 'play-card',
        actorPrinting: 'Unit Energy LPM UPR 138',
        targetPrinting: 'Alolan Raichu UNM 57' },
      { token: 'unit-crobat', kind: 'play-card',
        actorPrinting: 'Unit Energy LPM UPR 138',
        targetPrinting: 'Crobat V DAA 104' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-action', token: 'unit-raichu'
  });
});

test('Battle Compressor is not used to fund a line the current worker cannot complete', () => {
  const request = rootRequest({
    items: [
      { token: 'compressor', kind: 'play-card',
        actorPrinting: 'Battle Compressor PHF 92' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Klefki is not benched when it would add self-lock without an opposing Tool target', () => {
  const request = rootRequest({
    opponentPublic: player({ active: pokemon('Shadow Rider Calyrex VMAX CRE 75') }),
    items: [
      { token: 'klefki', kind: 'play-card', actorPrinting: 'Klefki SVI 96' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Klefki is considered when Joust can remove a Tool from the opposing Active', () => {
  const request = rootRequest({
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        tools: ['Stealthy Hood UNB 186']
      })
    }),
    items: [
      { token: 'klefki', kind: 'play-card', actorPrinting: 'Klefki SVI 96' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'klefki' });
});

test('Klefki Joust is used only when an opposing Active Tool is present', () => {
  const request = rootRequest({
    ownPublic: player({ active: pokemon('Klefki SVI 96') }),
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        tools: ['Stealthy Hood UNB 186']
      })
    }),
    items: [
      { token: 'joust', kind: 'attack', actorPrinting: 'Klefki SVI 96',
        attackName: 'Joust' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'joust' });
});

test('Extra Energy Bomb prompt is declined rather than delegated', () => {
  const request = promptRequest({
    promptType: 'AttachEnergyPrompt',
    source: actorChoiceSource('Electrode-GX CES 48', 'Extra Energy Bomb'),
    choices: []
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'UNSUPPORTED_EXTRA_ENERGY_BOMB_PROMPT'
  });
});

test('the engine-defective Crush and Burn-GX allocation is declined', () => {
  const request = promptRequest({
    promptType: 'DiscardEnergyPrompt',
    source: actorChoiceSource('Electrode-GX CES 48', 'Crush and Burn-GX'),
    choices: []
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'UNSUPPORTED_CRUSH_AND_BURN_PROMPT'
  });
});

test('Electro Rain damage allocation is declined until PutDamagePrompt is supported', () => {
  const request = promptRequest({
    promptType: 'PutDamagePrompt',
    source: actorChoiceSource('Alolan Raichu UNM 57', 'Electro Rain'),
    choices: []
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'UNSUPPORTED_ELECTRO_RAIN_PROMPT'
  });
});

test('an unknown prompt family fails closed', () => {
  const request = promptRequest({
    promptType: 'FutureUnknownPrompt',
    source: actorChoiceSource('Electrode-GX CES 48', 'Unknown effect'),
    choices: []
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE'
  });
});

test('the actual worker request validator rejects injected hidden opponent-hand fields', () => {
  const request = rootRequest();
  request.observation.opponentHand = ['hidden card'];
  const init = {
    schema: protocol.INIT_SCHEMA, type: 'init', role: 'opponent', seat: 0,
    policyVersion: POLICY_VERSION, bundleSha256: 'a'.repeat(64), config
  };
  assert.throws(() => protocol.validateRequest(
    request, init, request.sequence, new Set()
  ));
});

test('a policy instance refuses a request whose role or seat differs from its binding', () => {
  const instance = makePolicy(0);
  const request = rootRequest({ seat: 1 });
  assert.deepEqual(instance.decide(request), {
    kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH'
  });
});
