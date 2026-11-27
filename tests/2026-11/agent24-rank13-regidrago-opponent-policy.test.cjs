'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const policyModule = require('../../simulation/evaluation/2026-11/agent24-rank13-regidrago-opponent-policy.cjs');

const {
  POLICY_VERSION, SOURCE_RANK, SOURCE_FINGERPRINT_SHA256,
  CANDIDATE_FINGERPRINT_SHA256, createPolicy, chooseRank13ApexAttack,
  hasDragonPayload
} = policyModule;

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
  return ['Basic'];
}

function pokemon(printing = 'Regidrago VSTAR SIT 136', options = {}) {
  const abilities = options.abilities ?? [];
  return {
    printing,
    name: options.name ?? printing.split(' ').slice(0, -2).join(' '),
    hp: options.hp ?? (/VMAX/i.test(printing) ? 320 : 280),
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
      active: pokemon('Regidrago VSTAR SIT 136', {
        subtypes: ['VSTAR'], abilities: ['Legacy Star']
      }),
      ...(options.ownPlayer ?? {})
    }),
    opponentPublic: options.opponentPublic ?? player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', {
        hp: 320, subtypes: ['VMAX'], types: ['Psychic']
      }),
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
    requestId: options.requestId ?? 'agent24-rank13-root-1',
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
    source: options.source ?? actorChoiceSource(
      'Mysterious Treasure FLI 113', 'Mysterious Treasure'
    ),
    choices: options.choices ?? [],
    ...(options.publicMetadata ? { publicMetadata: options.publicMetadata } : options.promptType === 'ChooseAttackPrompt' ? { publicMetadata: { selectionType: 'attack', allowCancel: false } } : {})
  };
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: options.requestId ?? 'agent24-rank13-prompt-1',
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

function cardChoice(token, printing, zone = 'deck', owner = 'actor') {
  return {
    token, kind: 'card', printing, label: printing,
    publicMetadata: { sourceZone: zone, ownerSeat: owner }
  };
}

function pokemonChoice(token, printing, owner = 'opponent', zone = 'bench', index = 0) {
  return {
    token, kind: 'pokemon', printing, label: printing,
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

function action(token, kind, actorPrinting, publicMetadata = {}, extra = {}) {
  return {
    token, kind,
    ...(actorPrinting ? { actorPrinting } : {}),
    ...(Object.keys(publicMetadata).length ? { publicMetadata } : {}),
    ...extra
  };
}

function makeInit(seat = 0, config = {}) {
  return {
    schema: protocol.INIT_SCHEMA,
    type: 'init',
    role: 'opponent',
    seat,
    policyVersion: POLICY_VERSION,
    bundleSha256: 'a'.repeat(64),
    config
  };
}

function checkedDecision(request) {
  const init = makeInit(request.seat);
  protocol.validateInit(init);
  const validated = protocol.validateRequest(request, init, request.sequence, new Set());
  const decision = createPolicy({
    role: 'opponent', seat: request.seat, policyVersion: POLICY_VERSION, config: {}
  }).decide(request);
  protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  return decision;
}

test('source and candidate bindings identify the fixed rank-13 original and current candidate', () => {
  assert.equal(SOURCE_RANK, 13);
  assert.equal(SOURCE_FINGERPRINT_SHA256,
    '54d584be865d842fd5ffaf288873c8ac127e0e9d7007f96e12a49e7a9469690b');
  assert.equal(CANDIDATE_FINGERPRINT_SHA256,
    '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4');
});

test('worker init accepts role-only empty config and rejects policy-specific configuration', () => {
  assert.doesNotThrow(() => protocol.validateInit(makeInit(0, {})));
  assert.throws(() => protocol.validateInit(makeInit(0, { rank: 13 })), /BAD_INIT_CONFIG|BAD_POLICY_CONFIG|UNKNOWN_FIELD/);
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION, config: { rank: 13 }
  }), /AGENT24_RANK13_POLICY_INIT_MISMATCH/);
});

test('policy init binds opponent role, physical seat, version and empty config', () => {
  assert.throws(() => createPolicy({
    role: 'candidate', seat: 0, policyVersion: POLICY_VERSION, config: {}
  }), /AGENT24_RANK13_POLICY_INIT_MISMATCH/);
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 2, policyVersion: POLICY_VERSION, config: {}
  }), /AGENT24_RANK13_POLICY_INIT_MISMATCH/);
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: 'other-policy', config: {}
  }), /AGENT24_RANK13_POLICY_INIT_MISMATCH/);
});

test('root chooses a missing Regidrago V from the exact source setup actions', () => {
  const request = rootRequest({
    items: [
      action('regi-v', 'play-card', 'Regidrago V SIT 135'),
      action('pass', 'pass', null)
    ],
    ownPlayer: { active: null, bench: [] }
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'regi-v' });
});

test('first-turn Battle VIP Pass is selected when legal and no higher-priority Regidrago V play exists', () => {
  const request = rootRequest({
    globalTurn: 1,
    items: [
      action('vip', 'play-card', 'Battle VIP Pass FST 225'),
      action('pass', 'pass', null)
    ],
    ownPlayer: { active: null, bench: [] }
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'vip' });
});

test('Battle Compressor is used when no Dragon payload is visible in the public discard', () => {
  const request = rootRequest({
    ownPlayer: { discard: [] },
    items: [
      action('compress', 'play-card', 'Battle Compressor Team Flare Gear PHF 92'),
      action('pass', 'pass', null)
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'compress' });
});

test('Apex Dragon is not selected without a visible Dragon payload; Budew lock is preferred', () => {
  const request = rootRequest({
    ownPlayer: { discard: [] },
    items: [
      action('apex', 'attack', null, {}, { attackName: 'Apex Dragon', label: 'Apex Dragon' }),
      action('budew', 'attack', null, {}, { attackName: 'Itchy Pollen', label: 'Itchy Pollen' }),
      action('pass', 'pass', null)
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'budew' });
});

test('Apex Dragon becomes eligible only when an exact rank-13 Dragon payload is in the actor discard', () => {
  const request = rootRequest({
    ownPlayer: { discard: ['Noivern ex PAL 153'] },
    items: [
      action('apex', 'attack', null, {}, { attackName: 'Apex Dragon', label: 'Apex Dragon' }),
      action('pass', 'pass', null)
    ]
  });
  assert.equal(hasDragonPayload(request.observation), true);
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'apex' });
});

test('Battle Compressor selects the supported Dragon payloads from the owner-visible deck choices', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Battle Compressor Team Flare Gear PHF 92', 'Battle Compressor'),
    publicMetadata: multiMetadata(0, 3),
    choices: [
      cardChoice('noivern', 'Noivern ex PAL 153'),
      cardChoice('dialga', 'Dialga-GX UPR 100'),
      cardChoice('salamence', 'Salamence ex JTG 114'),
      cardChoice('dragapult', 'Dragapult ex TWM 130'),
      { token: 'empty', kind: 'empty-selection', label: 'Select none' }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['noivern', 'dialga', 'salamence']
  });
});

test('Mysterious Treasure pays with a Dragon payload before discarding Double Dragon Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Mysterious Treasure FLI 113', 'Mysterious Treasure discard a card'),
    publicMetadata: multiMetadata(1, 1),
    choices: [
      cardChoice('noivern', 'Noivern ex PAL 153', 'hand'),
      cardChoice('dde', 'Double Dragon Energy ROS 97', 'hand'),
      cardChoice('supporter', 'Professor\'s Research JTG 155', 'hand')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['noivern']
  });
});

test('Quick Ball searches for the missing Basic Regidrago V', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Quick Ball FST 237', 'Quick Ball search for a Basic Pokémon'),
    publicMetadata: multiMetadata(1, 1),
    choices: [
      cardChoice('regi', 'Regidrago V SIT 135'),
      cardChoice('budew', 'Budew ASC 16'),
      cardChoice('latias', 'Latias ex SSP 76')
    ],
    observation: { ownPlayer: { active: null, bench: [] } }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['regi']
  });
});

test('Legacy Star recovers Double Dragon Energy and Battle Compressor before low-value cards', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Regidrago VSTAR SIT 136', 'Legacy Star'),
    publicMetadata: multiMetadata(2, 2),
    choices: [
      cardChoice('dde', 'Double Dragon Energy ROS 97'),
      cardChoice('compress', 'Battle Compressor Team Flare Gear PHF 92'),
      cardChoice('treasure', 'Mysterious Treasure FLI 113'),
      cardChoice('marnie', 'Marnie SSH 169')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['dde', 'compress']
  });
});

test('Apex attack choice prefers Dominating Echo when a public Stadium or Special Energy is present', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: actorChoiceSource('Regidrago VSTAR SIT 136', 'Apex Dragon'),
    choices: [
      { token: 'covert', kind: 'attack', label: 'Covert Flight', publicMetadata: { sourceAttack: 'Covert Flight' } },
      { token: 'echo', kind: 'attack', label: 'Dominating Echo', publicMetadata: { sourceAttack: 'Dominating Echo' } },
      { token: 'phantom', kind: 'attack', label: 'Phantom Dive', publicMetadata: { sourceAttack: 'Phantom Dive' } }
    ],
    observation: {
      opponentPlayer: { stadium: ['Dimension Valley XY 80'] }
    }
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'echo' });
});

test('Apex attack choice prioritizes a Shred knockout over a non-lethal denial attack', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: actorChoiceSource('Regidrago VSTAR SIT 136', 'Apex Dragon'),
    choices: [
      { token: 'echo', kind: 'attack', label: 'Dominating Echo', publicMetadata: { sourceAttack: 'Dominating Echo' } },
      { token: 'shred', kind: 'attack', label: 'Shred', publicMetadata: { sourceAttack: 'Shred' } }
    ],
    observation: {
      opponentPlayer: {
        active: pokemon('Unown AOR 30', {
          hp: 120, types: ['Psychic'], weakness: [{ type: 'Dragon', value: '×2' }]
        })
      }
    }
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'shred' });
});

test('Apex attack choice abstains rather than selecting Phantom Dive with unsupported PutDamagePrompt projection', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: actorChoiceSource('Regidrago VSTAR SIT 136', 'Apex Dragon'),
    choices: [
      { token: 'phantom', kind: 'attack', label: 'Phantom Dive', publicMetadata: { sourceAttack: 'Phantom Dive' } }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'NO_SUPPORTED_ATTACK_CHOICE'
  });
});

test('Apex attack choice abstains rather than selecting Dragon Impact before its discard prompt is validated', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: actorChoiceSource('Regidrago VSTAR SIT 136', 'Apex Dragon'),
    choices: [
      { token: 'impact', kind: 'attack', label: 'Dragon Impact', publicMetadata: { sourceAttack: 'Dragon Impact' } }
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'NO_SUPPORTED_ATTACK_CHOICE'
  });
});

test('direct Dialga Shred uses its printed Metal type for a weakness-based knockout', () => {
  const request = promptRequest({
    promptType: 'ChooseAttackPrompt',
    source: actorChoiceSource('Dialga-GX UPR 100', 'Dialga-GX attack selection'),
    choices: [
      { token: 'overclock', kind: 'attack', label: 'Overclock', publicMetadata: { sourceAttack: 'Overclock' } },
      { token: 'shred', kind: 'attack', label: 'Shred', publicMetadata: { sourceAttack: 'Shred' } }
    ],
    observation: {
      ownPlayer: {
        active: pokemon('Dialga-GX UPR 100', { types: ['Metal'] })
      },
      opponentPlayer: {
        active: pokemon('Unown AOR 30', {
          hp: 120, types: ['Psychic'], weakness: [{ type: 'Metal', value: '×2' }]
        })
      },
      ownHand: ['Grass Energy MEE 9', 'Fire Energy MEE 10']
    }
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'shred' });
});

test('Megaton Blower is used only when opponent tools, Special Energy or Stadium are publicly present', () => {
  const request = rootRequest({
    opponentPlayer: {
      active: pokemon('Shadow Rider Calyrex V CRE 74', {
        tools: ['Stealthy Hood UNB 186']
      }),
      stadium: ['Dimension Valley XY 80']
    },
    items: [
      action('blower', 'play-card', 'Megaton Blower SSP 182'),
      action('pass', 'pass', null)
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'blower' });
});

test('Silent Lab is not played while the policy does not model its own Basic Ability lock', () => {
  const request = rootRequest({
    items: [
      action('lab', 'play-card', 'Silent Lab PRC 140'),
      action('pass', 'pass', null)
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Parallel City selects the Stadium action only against a publicly overfilled opponent Bench', () => {
  const request = rootRequest({
    opponentPlayer: {
      bench: [
        pokemon('Shadow Rider Calyrex V CRE 74', { subtypes: ['Basic', 'V'] }),
        pokemon('Shadow Rider Calyrex V CRE 74', { subtypes: ['Basic', 'V'] }),
        pokemon('Lillie\'s Clefairy ex JTG 56', { subtypes: ['Basic', 'ex'] }),
        pokemon('Tapu Lele-GX GRI 60', { subtypes: ['Basic', 'GX'] })
      ]
    },
    items: [
      action('parallel', 'use-stadium', 'Parallel City BKT 145'),
      action('pass', 'pass', null)
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'parallel' });
});

test('Marnie is used as a low-hand reset against a larger publicly counted opponent hand', () => {
  const request = rootRequest({
    ownHand: ['Grass Energy MEE 9', 'Marnie SSH 169', 'Guzma BUS 115'],
    opponentPlayer: { handCount: 5 },
    items: [
      action('marnie', 'play-card', 'Marnie SSH 169'),
      action('pass', 'pass', null)
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'marnie' });
});

test('Guzma selects the highest-prize visible opponent Bench target', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Guzma BUS 115', 'Guzma switch opponent Pokémon'),
    publicMetadata: multiMetadata(1, 1, 'pokemon'),
    choices: [
      pokemonChoice('one-prize', 'Mimikyu GRI 58', 'opponent', 'bench', 0),
      pokemonChoice('three-prize', 'Shadow Rider Calyrex VMAX CRE 75', 'opponent', 'bench', 1)
    ],
    observation: {
      opponentPlayer: {
        bench: [
          pokemon('Mimikyu GRI 58', { hp: 70 }),
          pokemon('Shadow Rider Calyrex VMAX CRE 75', { hp: 320, subtypes: ['VMAX'] })
        ]
      }
    }
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['three-prize']
  });
});

test('Crispin selects different Basic Energy types for the original source', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Crispin SCR 133', 'Crispin search Basic Energy'),
    publicMetadata: multiMetadata(2, 2),
    choices: [
      cardChoice('grass', 'Grass Energy MEE 9'),
      cardChoice('fire', 'Fire Energy MEE 10'),
      cardChoice('dde', 'Double Dragon Energy ROS 97')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['grass', 'fire']
  });
});

test('Raihan chooses a Basic Energy from discard for the attached-energy effect', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Raihan EVS 152', 'Raihan attach a Basic Energy from discard'),
    publicMetadata: multiMetadata(1, 1),
    choices: [
      cardChoice('grass', 'Grass Energy MEE 9', 'discard'),
      cardChoice('fire', 'Fire Energy MEE 10', 'discard')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'select-choices', tokens: ['grass']
  });
});

test('unsupported PutDamagePrompt fails closed rather than inventing counter allocation', () => {
  const request = promptRequest({
    promptType: 'PutDamagePrompt',
    source: actorChoiceSource('Dragapult ex TWM 130', 'Phantom Dive'),
    choices: [
      { token: 'active', kind: 'damage-target', label: 'Opponent Active' },
      { token: 'bench', kind: 'damage-target', label: 'Opponent Bench' }
    ]
  });
  assert.throws(() => checkedDecision(request), /MISSING_FIELD|BAD_PROMPT_SELECTION_TYPE|PROMPT_SELECTION_TYPE_MISMATCH/);
  const policy=createPolicy({role:'opponent',seat:request.seat,policyVersion:POLICY_VERSION,config:{}});
  assert.deepEqual(policy.decide(request), {kind:'abstain',reasonCode:'NO_SUPPORTED_ATTACK_CHOICE'});
});

test('wrong physical seat is rejected by the policy binding', () => {
  const policy = createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION, config: {}
  });
  const request = rootRequest({ seat: 1 });
  assert.deepEqual(policy.decide(request), {
    kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH'
  });
});

test('actual v2 worker selects completion-critical manual Energy in either seat', () => {
 for (const seat of [0,1]) {
  const D='Double Dragon Energy ROS 97', G='Grass Energy MEE 9', S='Regidrago VSTAR SIT 136';
  const r=rootRequest({seat,ownHand:[G],ownPlayer:{active:pokemon(S,{subtypes:['VSTAR'],energies:[D]}),discard:['Noivern ex PAL 153']},items:[
   action('attach','play-card',G,{cardType:'energy',handIndex:0,targetSeat:'actor',targetZone:'active',targetIndex:0,isOwnerVisible:true},{targetPrinting:S,label:'Attach Grass Energy'}),
   action('pass','pass',null)
  ]});
  assert.deepEqual(checkedDecision(r),{kind:'select-action',token:'attach'});
  r.observation.ownPublic.active.energies.push(G);
  r.observation.ownHand=[];
  r.observation.ownTurnResources.energyPlayedTurn=true;
  r.actionFrontier.items=[{kind:'attack',token:'apex',label:'Apex Dragon',attackName:'Apex Dragon'},action('pass','pass',null)];
  assert.deepEqual(checkedDecision(r),{kind:'select-action',token:'apex'});
 }
});
test('actual v2 worker uses Silent Lab to break Temple before an otherwise unavailable Apex', () => {
 for(const seat of [0,1]){
  const LAB='Silent Lab PRC 140',S='Regidrago VSTAR SIT 136';
  const r=rootRequest({seat,ownHand:[LAB],ownPlayer:{active:pokemon(S,{subtypes:['VSTAR'],energies:['Double Dragon Energy ROS 97','Grass Energy MEE 9']}),discard:['Noivern ex PAL 153']},opponentPlayer:{stadium:['Temple of Sinnoh ASR 155']},items:[action('lab','play-card',LAB,{cardType:'trainer',handIndex:0}),action('pass','pass',null)]});
  assert.deepEqual(checkedDecision(r),{kind:'select-action',token:'lab'});
  r.observation.opponentPublic.stadium=[];r.observation.ownPublic.stadium=[LAB];r.observation.ownHand=[];
  r.actionFrontier.items=[{kind:'attack',token:'apex',label:'Apex Dragon',attackName:'Apex Dragon'},action('pass','pass',null)];
  assert.deepEqual(checkedDecision(r),{kind:'select-action',token:'apex'});
 }
});

test('Crispin duplicate Grass offers do not crowd out Fire or choose Special Energy', () => {
  const request=promptRequest({promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Crispin SCR 133','Crispin search Basic Energy'),
    publicMetadata:multiMetadata(2,2),
    choices:[cardChoice('g1','Grass Energy MEE 9'),cardChoice('g2','Grass Energy MEE 9'),
      cardChoice('f1','Fire Energy MEE 10'),cardChoice('dde','Double Dragon Energy ROS 97')]});
  assert.deepEqual(checkedDecision(request),{kind:'select-choices',tokens:['g1','f1']});
});
test('Crispin recipient choice reaches the actor Regidrago VSTAR branch', () => {
  const request=promptRequest({promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Crispin SCR 133','Crispin attach Basic Energy'),
    publicMetadata:multiMetadata(1,1,'pokemon'),
    choices:[pokemonChoice('regiv','Regidrago V SIT 135','actor'),
      pokemonChoice('registar','Regidrago VSTAR SIT 136','actor','bench',1)]});
  assert.deepEqual(checkedDecision(request),{kind:'select-choices',tokens:['registar']});
});

test('rank13 Trifrost selects actual lethal targets before nonlethal priority, both seats', () => {
  const tag=pokemon('Trevenant & Dusknoir-GX SMP 217',{hp:270,damage:150,subtypes:['Basic','TAG TEAM','GX'],types:['Psychic']});
  const low=[pokemon('Mimikyu GRI 58',{hp:70,types:['Psychic']}),pokemon('Girafarig LOT 94',{hp:90,types:['Psychic']}),pokemon('Marshadow UNB 81',{hp:80,types:['Psychic']})];
  const full=pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,subtypes:['VMAX'],types:['Psychic']});
  const wounded=pokemon('Shadow Rider Calyrex VMAX CRE 75',{hp:320,damage:220,subtypes:['VMAX'],types:['Psychic']});
  const lele=pokemon('Tapu Lele-GX GRI 60',{hp:170,damage:70,subtypes:['Basic','GX'],types:['Psychic']});
  for (const seat of [0,1]) {
    const cases=[
      {name:'banded Active TAG',active:tag,bench:[...low,full],band:true,expected:['p0','p1','p3'],prizes:5},
      {name:'unbanded Active TAG',active:tag,bench:[...low,full],band:false,expected:['p1','p3','p2'],prizes:3},
      {name:'three Prize and two Prize Bench',active:full,bench:[...low,wounded,lele],band:true,expected:['p4','p5','p1'],prizes:6},
      {name:'Band does not apply to Bench',active:full,bench:[...low,tag],band:true,expected:['p1','p3','p2'],prizes:3},
      {name:'two available targets',active:tag,bench:[low[0]],band:true,expected:['p0','p1'],prizes:4},
      {name:'suppressed Band',active:tag,bench:[...low,full],band:true,noTool:true,expected:['p1','p3','p2'],prizes:3},
    ];
    for (const c of cases) {
      const targets=[c.active,...c.bench];
      const choices=targets.map((p,i)=>({
        token:'p'+i,kind:'pokemon',printing:p.printing,label:p.printing,
        publicMetadata:{selectionIndex:i,selectedCount:1,selectionType:'pokemon',ownerSeat:'opponent',targetZone:i?'bench':'active',...(i?{benchIndex:i-1}:{slotIndex:0}),isOwnerVisible:true}
      }));
      const count=Math.min(3,targets.length);
      const req=promptRequest({seat,promptType:'ChoosePokemonPrompt',
        source:{...actorChoiceSource('Regidrago VSTAR SIT 136','Trifrost'),copiedSourcePrinting:'Kyurem SFA 47',copiedAttackName:'Trifrost'},
        publicMetadata:multiMetadata(count,count,'pokemon'),choices,
        observation:{ownPlayer:{active:pokemon('Regidrago VSTAR SIT 136',{subtypes:['VSTAR'],tools:c.band?['Muscle Band XY 121']:[]}),prizeCount:c.prizes,publicTurnRestrictions:c.noTool?{stadiumAndToolHaveNoEffectTurnsRemaining:1}:{}},
          opponentPlayer:{active:c.active,bench:c.bench}}});
      assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:c.expected},c.name+' seat '+seat);
      // Malformed physical identity must not be converted into another target.
      const policy=createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config:{}});
      const malformed=JSON.parse(JSON.stringify(req));
      malformed.prompt.choices[1].publicMetadata.ownerSeat='actor';
      assert.deepEqual(policy.decide(malformed),{kind:'abstain',reasonCode:'NO_SUPPORTED_POKEMON_CHOICE'});
      const mismatch=JSON.parse(JSON.stringify(req));
      mismatch.prompt.choices[1].printing='Latias ex SSP 76';
      assert.deepEqual(policy.decide(mismatch),{kind:'abstain',reasonCode:'NO_SUPPORTED_POKEMON_CHOICE'});
      const duplicate=JSON.parse(JSON.stringify(req));
      duplicate.prompt.choices.push({...duplicate.prompt.choices[1],token:'duplicate'});
      assert.deepEqual(policy.decide(duplicate),{kind:'abstain',reasonCode:'NO_SUPPORTED_POKEMON_CHOICE'});
    }
  }
});
