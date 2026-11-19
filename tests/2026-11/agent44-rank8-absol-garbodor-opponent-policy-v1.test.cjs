'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const policyModule = require('../../simulation/evaluation/2026-11/agent44-rank8-absol-garbodor-opponent-policy-v1.cjs');
const suite = require('../../results/aichi-2026/2026-11/agent44-rank8-absol-garbodor-opponent-policy-challenge-suite-v1.json');

const C = {
  mega: 'Mega Absol ex MEG 86',
  trubbish: 'Trubbish PAR 116',
  garbodor: 'Garbodor LTR 68',
  budew: 'Budew ASC 16',
  shadow: 'Shadow Rider Calyrex VMAX CRE 75',
  quickBall: 'Quick Ball FST 237',
  ultraBall: 'Ultra Ball MEG 131',
  battleVip: 'Battle VIP Pass FST 225',
  darkPatch: 'Dark Patch ASR 139',
  darkness: 'Darkness Energy MEE 15',
  vsSeeker: 'VS Seeker PHF 109',
  floatStone: 'Float Stone BKT 137',
  boostShake: 'Boost Shake EVS 142',
  secretBox: 'Secret Box TWM 163',
  iono: 'Iono PAL 185',
  wally: 'Wally ROS 94',
  dedenne: 'Dedenne-GX UNB 57',
  crobat: 'Crobat V DAA 104',
  squawk: 'Squawkabilly ex PAL 169',
  tapuLele: 'Tapu Lele-GX GRI 60',
  carmine: 'Carmine TWM 145',
  lillie: "Lillie's Determination MEG 119",
  roxanne: 'Roxanne ASR 150'
};

const policyPath = path.resolve(__dirname,
  '../../simulation/evaluation/2026-11/agent44-rank8-absol-garbodor-opponent-policy-v1.cjs');
const bundleSha256 = crypto.createHash('sha256').update(fs.readFileSync(policyPath)).digest('hex');
const config = {};

function restrictions(options = {}) {
  return {
    cannotAttackNextTurn: false, cannotUseAttacksNextTurn: [],
    blockedAttackNameNextTurn: null, blockedAttackNameUntilLeavesActive: null,
    onlyAllowedAttackNameNextTurn: null, attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0, cannotRetreat: false,
    cannotRetreatNextTurn: false, cannotRetreatWhileActive: false,
    cannotEvolveNextTurn: false, ...options
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
    stadiumAndToolHaveNoEffectTurnsRemaining: null, ...options
  };
}

function pokemon(printing, options = {}) {
  const abilities = options.abilities ?? [];
  return {
    printing, name: options.name ?? printing.split(' ').slice(0, -2).join(' '),
    hp: options.hp ?? 150, damage: options.damage ?? 0,
    lastPlayedOrEvolvedTurn: options.lastPlayedOrEvolvedTurn ?? 1,
    printed: {
      stage: options.stage ?? 'BASIC', subtypes: options.subtypes ?? ['Basic'],
      types: options.types ?? ['Colorless'], retreatCost: options.retreatCost ?? [],
      weakness: options.weakness ?? [], resistance: options.resistance ?? []
    },
    specialConditions: [], publicRestrictions: restrictions(),
    evolutionPrintings: options.evolutionPrintings ?? [],
    energies: options.energies ?? [], tools: options.tools ?? [],
    attacks: options.attacks ?? [], abilities,
    abilityDetails: options.abilityDetails ?? abilities.map(name => ({
      name, powerType: 'ABILITY', text: 'As long as this Pokémon is in play.'
    })),
    abilitySuppressions: null
  };
}

function player(options = {}) {
  const bench = (options.bench ?? []).slice(0, 8);
  while (bench.length < 5) bench.push(null);
  return {
    active: options.active ?? null, bench,
    stadium: options.stadium ?? [], discard: options.discard ?? [],
    lostZone: options.lostZone ?? [], resolvingSupporter: [],
    publicHand: options.publicHand ?? null, prizeSlots: options.prizeSlots ?? [],
    publicTurnRestrictions: publicRestrictions(options.publicTurnRestrictions ?? {}),
    handCount: options.handCount ?? 0, deckCount: options.deckCount ?? 30,
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
    actorSeat: options.actorSeat ?? 0, globalTurn: options.globalTurn ?? 3,
    phase: options.phase ?? 2,
    decisionKind: options.prompt ? 'owner-prompt' : 'owner-root',
    pendingPromptType: options.prompt?.promptType ?? null,
    pendingOwnerDeckSearch: options.pendingOwnerDeckSearch ?? false,
    ownHand: options.ownHand ?? [], ownPublic: options.ownPublic ?? player(),
    opponentPublic: options.opponentPublic ?? player(),
    ownTurnResources: options.ownTurnResources ?? turnResources(),
    ownerK1: null
  };
}

function initMessage(seat = 0) {
  return {
    schema: protocol.INIT_SCHEMA, type: 'init', role: 'opponent', seat,
    policyVersion: policyModule.POLICY_VERSION, bundleSha256, config
  };
}

function rootRequest(options = {}) {
  const seat = options.seat ?? 0;
  return {
    schema: protocol.REQUEST_SCHEMA, type: 'decision',
    requestId: options.requestId ?? 'agent44-rank8-root-1',
    sequence: options.sequence ?? 1, role: 'opponent', seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation({ ...options, actorSeat: seat }),
    prompt: null, publicEventReceipt: null,
    actionFrontier: {
      schema: protocol.FRONTIER_SCHEMA,
      items: options.items ?? [{ token: 'pass', kind: 'pass', label: 'Pass turn' }]
    }
  };
}

function actorChoiceSource(sourcePrinting, effectName) {
  return { classification: 'actor-choice', sourceKind: 'card-effect', sourcePrinting, effectName };
}

function promptRequest(options = {}) {
  const seat = options.seat ?? 0;
  const prompt = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: seat,
    promptType: options.promptType, description: options.description ?? 'Choose a legal option',
    source: options.source ?? actorChoiceSource(options.sourcePrinting ?? C.quickBall,
      options.effectName ?? 'Quick Ball'),
    choices: options.choices ?? [],
    ...(options.publicMetadata ? { publicMetadata: options.publicMetadata } : {})
  };
  return {
    schema: protocol.REQUEST_SCHEMA, type: 'decision',
    requestId: options.requestId ?? 'agent44-rank8-prompt-1',
    sequence: options.sequence ?? 1, role: 'opponent', seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation({
      ...options, actorSeat: seat, prompt,
      pendingOwnerDeckSearch: options.pendingOwnerDeckSearch ?? false
    }),
    prompt, publicEventReceipt: null,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: [] }
  };
}

function cardChoice(token, printing, ownerSeat, sourceZone) {
  return { token, kind: 'card', printing, publicMetadata: { ownerSeat, sourceZone } };
}

function pokemonChoice(token, printing, ownerSeat, targetZone) {
  return {
    token, kind: 'pokemon', printing,
    publicMetadata: {
      selectionIndex: 0, selectedCount: 1, selectionType: 'pokemon',
      ownerSeat, targetZone, isOwnerVisible: true
    }
  };
}

function multiMeta(minimumCount, maximumCount) {
  return { selectionType: 'card-combination', minimumCount, maximumCount,
    allowCancel: false, isSecret: false };
}

function makePolicy(seat = 0) {
  return policyModule.createPolicy({
    role: 'opponent', seat, policyVersion: policyModule.POLICY_VERSION, config
  });
}

function checkedDecision(request) {
  const init = protocol.validateInit(initMessage(request.seat));
  const validated = protocol.validateRequest(request, init, request.sequence, new Set());
  const raw = makePolicy(request.seat).decide(request);
  return protocol.validateDecision(raw, validated.prompt, validated.actionTokens);
}

function board(options = {}) {
  return {
    ownPublic: player({
      active: options.ownActive ?? pokemon(C.budew, { types: ['Grass'], hp: 30 }),
      bench: options.ownBench ?? [], discard: options.discard ?? [],
      deckCount: options.deckCount ?? 28, prizeCount: options.ownPrizeCount ?? 6
    }),
    opponentPublic: player({
      active: options.opponentActive ?? pokemon(C.shadow, {
        types: ['Psychic'], hp: 320, abilities: ['Underworld Door']
      }),
      bench: options.opponentBench ?? [], handCount: options.opponentHandCount ?? 5,
      deckCount: 30, prizeCount: options.opponentPrizeCount ?? 6
    })
  };
}

function fixtureObservation(id) {
  const base = board();
  if (id === 'setup-lock') return observation({
    globalTurn: 3, ownHand: [C.mega, C.trubbish],
    ownPublic: base.ownPublic, opponentPublic: base.opponentPublic
  });
  if (id === 'attach-tool') return observation({
    globalTurn: 3, ownHand: [C.floatStone, C.wally, C.boostShake],
    ownPublic: player({ active: pokemon(C.mega), bench: [
      pokemon(C.trubbish, { lastPlayedOrEvolvedTurn: 3 })
    ]}), opponentPublic: base.opponentPublic
  });
  if (id === 'terminal-period') return observation({
    ownPublic: player({ active: pokemon(C.mega, {
      types: ['Darkness'], energies: [C.darkness, C.darkness]
    })}),
    opponentPublic: player({ active: pokemon(C.shadow, { hp: 320, damage: 60 }) })
  });
  if (id === 'claw-prompt') return observation({
    prompt: { promptType: 'ChooseCardsPrompt' },
    ownPublic: player({ active: pokemon(C.mega) }),
    opponentPublic: base.opponentPublic
  });
  if (id === 'quick-ball-search') return observation({
    prompt: { promptType: 'ChooseCardsPrompt' }, pendingOwnerDeckSearch: true,
    ownHand: [C.quickBall, C.battleVip],
    ownPublic: player({ active: pokemon(C.budew) }),
    opponentPublic: base.opponentPublic
  });
  if (id === 'dark-patch') return observation({
    prompt: { promptType: 'ChoosePokemonPrompt' }, ownHand: [C.darkPatch],
    ownPublic: player({ active: pokemon(C.budew), bench: [pokemon(C.mega)],
      discard: [C.darkness] }), opponentPublic: base.opponentPublic
  });
  if (id === 'secret-box-negative') return observation({
    ownHand: [C.secretBox, C.boostShake, C.floatStone, C.darkPatch, C.vsSeeker, C.iono],
    ownPublic: player({ active: pokemon(C.budew) }), opponentPublic: base.opponentPublic
  });
  if (id === 'unknown-prompt') return observation({
    prompt: { promptType: 'ChooseEnergyPrompt' },
    ownPublic: base.ownPublic, opponentPublic: base.opponentPublic
  });
  throw new Error('UNKNOWN_FIXTURE_ID:' + id);
}

function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(key =>
      JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
  }
  return JSON.stringify(value);
}

function gitBlobSha1(filePath) {
  const bytes = fs.readFileSync(filePath);
  const header = Buffer.from('blob ' + bytes.length + '\0');
  return crypto.createHash('sha1').update(Buffer.concat([header, bytes])).digest('hex');
}

test('init is accepted by the actual Agent49 validator and binds the empty config', () => {
  const init = protocol.validateInit(initMessage());
  assert.deepEqual(init.config, {});
  assert.throws(() => policyModule.createPolicy({
    role: 'opponent', seat: 0, policyVersion: policyModule.POLICY_VERSION,
    config: { sourceRank: 8 }
  }), /AGENT44_RANK8_POLICY_INIT_MISMATCH/);
});

test('rank-8 source is the exact 60-card source row and fingerprints reproduce', () => {
  const sourcePath = path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json');
  const candidatePath = path.resolve(__dirname, '../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const deck = source.decks.find(row => row.rank === 8);
  const count = deck.cards.reduce((sum, row) => sum + row.count, 0);
  const sourceHash = crypto.createHash('sha256').update(canonical(deck), 'utf8').digest('hex');
  const candidate = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
  const candidateHash = crypto.createHash('sha256').update(canonical(candidate), 'utf8').digest('hex');
  assert.equal(count, 60);
  assert.equal(sourceHash, policyModule.SOURCE_FINGERPRINT_SHA256);
  assert.equal(candidateHash, policyModule.CANDIDATE_FINGERPRINT_SHA256);
  assert.equal(gitBlobSha1(sourcePath), policyModule.SOURCE_LIST_BLOB_SHA1);
});

test('worker protocol binding is exact and the policy bundle has no ambient dependencies', () => {
  const workerPath = path.resolve(__dirname, '../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
  const policySource = fs.readFileSync(policyPath, 'utf8');
  const workerSource = fs.readFileSync(workerPath);
  assert.equal(gitBlobSha1(workerPath), policyModule.WORKER_PROTOCOL_BLOB_SHA1);
  assert.equal(crypto.createHash('sha256').update(workerSource).digest('hex'),
    policyModule.WORKER_PROTOCOL_SHA256);
  assert.doesNotMatch(policySource,
    /\brequire\s*\(|\bprocess\b|\bglobalThis\b|\bsetTimeout\b|\bsetInterval\b|\bfetch\s*\(|\bMath\.random\b|\bimport\s/);
});

test('Trubbish lock line outranks the attacker when the opposing board has live Abilities', () => {
  const b = board();
  const decision = checkedDecision(rootRequest({
    ownHand: [C.mega, C.trubbish],
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    items: [
      { token: 'mega', kind: 'play-card', actorPrinting: C.mega },
      { token: 'trubbish', kind: 'play-card', actorPrinting: C.trubbish },
      { token: 'pass', kind: 'pass' }
    ]
  }));
  assert.deepEqual(decision, { kind: 'select-action', token: 'trubbish' });
});

test('Mega Absol is played when the opposing board has no live Ability target', () => {
  const b = board({ opponentActive: pokemon(C.shadow, { types: ['Psychic'], abilities: [] }) });
  const decision = checkedDecision(rootRequest({
    ownHand: [C.mega], ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    items: [
      { token: 'mega', kind: 'play-card', actorPrinting: C.mega },
      { token: 'pass', kind: 'pass' }
    ]
  }));
  assert.deepEqual(decision, { kind: 'select-action', token: 'mega' });
});

test('Float Stone is attached to Trubbish before the turn-ending Boost Shake', () => {
  const b = board({ ownBench: [pokemon(C.trubbish, { lastPlayedOrEvolvedTurn: 3 })] });
  const decision = checkedDecision(rootRequest({
    globalTurn: 3, ownHand: [C.floatStone, C.boostShake],
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    items: [
      { token: 'shake', kind: 'play-card', actorPrinting: C.boostShake },
      { token: 'tool', kind: 'play-card', actorPrinting: C.floatStone, targetPrinting: C.trubbish },
      { token: 'pass', kind: 'pass' }
    ]
  }));
  assert.deepEqual(decision, { kind: 'select-action', token: 'tool' });
});

test('Wally is preferred over Boost Shake when the Trubbish timing permits it', () => {
  const b = board({ ownBench: [pokemon(C.trubbish, { lastPlayedOrEvolvedTurn: 3 })] });
  const decision = checkedDecision(rootRequest({
    globalTurn: 3, ownHand: [C.wally, C.boostShake],
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    items: [
      { token: 'wally', kind: 'play-card', actorPrinting: C.wally },
      { token: 'shake', kind: 'play-card', actorPrinting: C.boostShake },
      { token: 'pass', kind: 'pass' }
    ]
  }));
  assert.deepEqual(decision, { kind: 'select-action', token: 'wally' });
});

test('Dark Patch targets a Benched Mega Absol when Basic Darkness is in discard', () => {
  const b = board({
    ownBench: [pokemon(C.mega, { types: ['Darkness'] })],
    discard: [C.darkness]
  });
  const decision = checkedDecision(rootRequest({
    ownHand: [C.darkPatch], ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    items: [
      { token: 'patch', kind: 'play-card', actorPrinting: C.darkPatch, targetPrinting: C.mega },
      { token: 'pass', kind: 'pass' }
    ]
  }));
  assert.deepEqual(decision, { kind: 'select-action', token: 'patch' });
});

test('Terminal Period is selected only at exactly six damage counters', () => {
  const b = board({
    ownActive: pokemon(C.mega, { types: ['Darkness'], energies: [C.darkness, C.darkness] }),
    opponentActive: pokemon(C.shadow, { hp: 320, damage: 60 })
  });
  const decision = checkedDecision(rootRequest({
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    items: [
      { token: 'terminal', kind: 'attack', attackName: 'Terminal Period' },
      { token: 'claw', kind: 'attack', attackName: 'Claw of Darkness' },
      { token: 'pass', kind: 'pass' }
    ]
  }));
  assert.deepEqual(decision, { kind: 'select-action', token: 'terminal' });
});

test('Claw of Darkness is preferred when Terminal Period threshold is not met', () => {
  const b = board({
    ownActive: pokemon(C.mega, { types: ['Darkness'], energies: [C.darkness, C.darkness] }),
    opponentActive: pokemon(C.shadow, { hp: 320, damage: 50 })
  });
  const decision = checkedDecision(rootRequest({
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    items: [
      { token: 'terminal', kind: 'attack', attackName: 'Terminal Period' },
      { token: 'claw', kind: 'attack', attackName: 'Claw of Darkness' },
      { token: 'pass', kind: 'pass' }
    ]
  }));
  assert.deepEqual(decision, { kind: 'select-action', token: 'claw' });
});

test('Claw of Darkness discards a revealed high-value opponent card', () => {
  const b = board({ ownActive: pokemon(C.mega, { types: ['Darkness'] }) });
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt', source: actorChoiceSource(C.mega, 'Claw of Darkness'),
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    choices: [
      cardChoice('secret-box', C.secretBox, 'opponent', 'hand'),
      cardChoice('dark-energy', C.darkness, 'opponent', 'hand')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'secret-box' });
});

test('Quick Ball cost selection uses a dead Battle VIP Pass rather than a singleton', () => {
  const b = board();
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt', source: actorChoiceSource(C.quickBall, 'Quick Ball'),
    globalTurn: 3, ownHand: [C.quickBall, C.battleVip, C.darkPatch],
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    publicMetadata: multiMeta(1, 1),
    choices: [
      cardChoice('vip', C.battleVip, 'actor', 'hand'),
      cardChoice('patch', C.darkPatch, 'actor', 'hand')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['vip'] });
});

test('Quick Ball search chooses Trubbish before Mega Absol against a live Ability board', () => {
  const b = board();
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt', source: actorChoiceSource(C.quickBall, 'Quick Ball'),
    pendingOwnerDeckSearch: true, ownHand: [C.quickBall, C.battleVip],
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    choices: [
      cardChoice('mega', C.mega, 'actor', 'deck'),
      cardChoice('trubbish', C.trubbish, 'actor', 'deck')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'trubbish' });
});

test('Ultra Ball cost fails closed when two safe physical discards are unavailable', () => {
  const b = board();
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt', source: actorChoiceSource(C.ultraBall, 'Ultra Ball'),
    globalTurn: 3, ownHand: [C.ultraBall, C.darkPatch, C.vsSeeker, C.iono],
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    publicMetadata: multiMeta(2, 2),
    choices: [
      cardChoice('patch', C.darkPatch, 'actor', 'hand'),
      cardChoice('vs', C.vsSeeker, 'actor', 'hand'),
      cardChoice('iono', C.iono, 'actor', 'hand')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'BALL_COST_HAS_NO_SAFE_DISCARD'
  });
});

test('Boost Shake search chooses Garbodor from the actor deck', () => {
  const b = board({ ownBench: [pokemon(C.trubbish, { lastPlayedOrEvolvedTurn: 3 })] });
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt', source: actorChoiceSource(C.boostShake, 'Boost Shake'),
    pendingOwnerDeckSearch: true, ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    choices: [
      cardChoice('trubbish', C.trubbish, 'actor', 'deck'),
      cardChoice('garbodor', C.garbodor, 'actor', 'deck')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'garbodor' });
});

test('Dark Patch target prompt selects the actor Benched Mega Absol', () => {
  const b = board({ ownBench: [pokemon(C.mega, { types: ['Darkness'] })],
    discard: [C.darkness] });
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt', source: actorChoiceSource(C.darkPatch, 'Dark Patch'),
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    choices: [
      pokemonChoice('active-budew', C.budew, 'actor', 'active'),
      pokemonChoice('bench-mega', C.mega, 'actor', 'bench')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choice', token: 'bench-mega' });
});

test('Secret Box is withheld at root until its four-category prompt contract is implemented', () => {
  const b = board();
  const decision = checkedDecision(rootRequest({
    ownHand: [C.secretBox, C.boostShake, C.floatStone, C.darkPatch, C.vsSeeker, C.iono],
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    items: [
      { token: 'secret-box', kind: 'play-card', actorPrinting: C.secretBox },
      { token: 'pass', kind: 'pass' }
    ]
  }));
  assert.deepEqual(decision, { kind: 'select-action', token: 'pass' });
});

test('Secret Box multi-category prompt abstains rather than choosing an incomplete package', () => {
  const b = board();
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt', source: actorChoiceSource(C.secretBox, 'Secret Box'),
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    publicMetadata: multiMeta(1, 4),
    choices: [
      cardChoice('quick', C.quickBall, 'actor', 'deck'),
      cardChoice('tool', C.floatStone, 'actor', 'deck'),
      cardChoice('supporter', C.wally, 'actor', 'deck'),
      cardChoice('stadium', 'Temple of Sinnoh ASR 155', 'actor', 'deck')
    ]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'SECRET_BOX_MULTI_CATEGORY_PROMPT_UNSUPPORTED'
  });
});

test('Garbodor with a Tool suppresses the policy own-side Dedechange draw action', () => {
  const b = board({
    ownActive: pokemon(C.dedenne, { abilities: ['Dedechange'] }),
    ownBench: [pokemon(C.garbodor, { stage: 'STAGE_1', abilities: ['Garbotoxin'],
      tools: [C.floatStone] })]
  });
  const decision = checkedDecision(rootRequest({
    ownHand: [C.iono], ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    items: [
      { token: 'dedechange', kind: 'use-ability', label: 'Dedechange' },
      { token: 'pass', kind: 'pass' }
    ]
  }));
  assert.deepEqual(decision, { kind: 'select-action', token: 'pass' });
});

test('Dedechange is used with a small hand before Garbotoxin is established', () => {
  const b = board({ ownActive: pokemon(C.dedenne, { abilities: ['Dedechange'] }) });
  const decision = checkedDecision(rootRequest({
    ownHand: [C.darkPatch], ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    items: [
      { token: 'dedechange', kind: 'use-ability', label: 'Dedechange' },
      { token: 'pass', kind: 'pass' }
    ]
  }));
  assert.deepEqual(decision, { kind: 'select-action', token: 'dedechange' });
});

test('unsupported Tapu Koko two-recipient Ability is not activated', () => {
  const b = board();
  const decision = checkedDecision(rootRequest({
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    items: [
      { token: 'dance', kind: 'use-ability', label: 'Dance of the Ancients' },
      { token: 'pass', kind: 'pass' }
    ]
  }));
  assert.deepEqual(decision, { kind: 'select-action', token: 'pass' });
});

test('unknown energy-allocation prompt fails closed', () => {
  const b = board();
  const request = promptRequest({
    promptType: 'ChooseEnergyPrompt', source: actorChoiceSource('Crispin SCR 133', 'Crispin'),
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    choices: [cardChoice('dark', C.darkness, 'actor', 'deck')]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE'
  });
});

test('policy binds either physical seat through the actual worker init/request validators', () => {
  const b = board();
  const request = rootRequest({
    seat: 1, actorSeat: 1, ownHand: [C.mega],
    ownPublic: b.ownPublic, opponentPublic: b.opponentPublic,
    items: [
      { token: 'mega', kind: 'play-card', actorPrinting: C.mega },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'mega' });
});

test('wrong-seat request is explicitly abstained', () => {
  const request = rootRequest({ seat: 1, actorSeat: 1 });
  assert.deepEqual(makePolicy(0).decide(request), {
    kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH'
  });
});

test('worker validator rejects a fabricated action token', () => {
  const request = rootRequest({ items: [{ token: 'offered', kind: 'pass' }] });
  const init = protocol.validateInit(initMessage());
  const validated = protocol.validateRequest(request, init, request.sequence, new Set());
  assert.throws(() => protocol.validateDecision({
    kind: 'select-action', token: 'not-offered'
  }, validated.prompt, validated.actionTokens), /token|frontier|offered/i);
});

test('challenge-suite actor-view digests reproduce from the exact test observations', () => {
  for (const row of suite.developmentCases) {
    const observationValue = fixtureObservation(row.actorView.fixtureId);
    const digest = crypto.createHash('sha256').update(canonical(observationValue), 'utf8').digest('hex');
    assert.equal(digest, row.actorView.sha256, row.caseId);
  }
});
