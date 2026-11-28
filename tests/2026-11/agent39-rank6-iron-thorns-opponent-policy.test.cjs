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
} = require('../../simulation/evaluation/2026-11/agent39-rank6-iron-thorns-opponent-policy.cjs');

// The shared worker requires a zero-key init config. Identity is bound
// by immutable module constants and the versioned suite manifest.
const config = Object.freeze({});

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

function pokemon(printing = 'Iron Thorns ex TWM 77', options = {}) {
  const thorns = /^Iron Thorns ex/i.test(printing);
  const abilities = options.abilities ?? (thorns ? ['Initialization'] : []);
  return {
    printing,
    name: options.name ?? (thorns ? 'Iron Thorns ex' : printing.split(' ').slice(0, -2).join(' ')),
    hp: options.hp ?? (thorns ? 230 : 150),
    damage: options.damage ?? 0,
    lastPlayedOrEvolvedTurn: options.lastPlayedOrEvolvedTurn ?? 1,
    printed: {
      stage: options.stage ?? 'BASIC',
      subtypes: options.subtypes ?? (thorns ? ['Basic', 'ex', 'Future'] : ['Basic']),
      types: options.types ?? (thorns ? ['Lightning'] : ['Colorless']),
      retreatCost: options.retreatCost ?? (thorns ?
        ['Colorless', 'Colorless', 'Colorless', 'Colorless'] : []),
      weakness: options.weakness ?? (thorns ? [{ type: 'Fighting', value: '×2' }] : []),
      resistance: options.resistance ?? []
    },
    specialConditions: [],
    publicRestrictions: restrictions(),
    evolutionPrintings: options.evolutionPrintings ?? [],
    energies: options.energies ?? [],
    tools: options.tools ?? [],
    attacks: options.attacks ?? (thorns ? [{
      name: 'Volt Cyclone',
      cost: ['Lightning', 'Colorless', 'Colorless'],
      damage: '140',
      damageCalculation: null,
      text: 'Move an Energy from this Pokémon to 1 of your Benched Pokémon.',
      gxAttack: false,
      barrage: false
    }] : []),
    abilities,
    abilityDetails: abilities.map(name => ({
      name, powerType: 'ABILITY', text: 'As long as this Pokémon is in the Active Spot.'
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
      active: pokemon(),
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
    requestId: options.requestId ?? 'agent39-rank6-root-1',
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
    // Legacy tests supply the now-required native selection metadata here.
    publicMetadata: options.publicMetadata ?? (
      options.promptType==='ChooseEnergyPrompt'
        ? {selectionType:'energy-payment',energyCount:1,allowCancel:false,isSecret:false} :
      options.promptType==='ChoosePokemonPrompt'
        ? {selectionType:'pokemon',minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false} :
      options.promptType==='ChooseCardsPrompt'
        ? {selectionType:'card-combination',minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false} :
      options.promptType==='ConfirmPrompt'
        ? {selectionType:'confirm',allowCancel:false} :
      {selectionType:'option',allowCancel:false})
  };
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: options.requestId ?? 'agent39-rank6-prompt-1',
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

function checkedDecision(request, seat = 0) {
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
    token, kind, actorPrinting,
    publicMetadata,
    ...extra
  };
}

function cardChoice(token, printing, zone = 'deck', owner = 'actor', kind = 'card', targetZone) {
  return {
    token, kind, printing, label: printing,
    publicMetadata: {
      sourceZone: zone,
      ownerSeat: owner,
      ...(targetZone ? { targetZone } : {})
    }
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

function energyChoice(token, printing, zone = 'active', owner = 'opponent') {
  return {
    token,
    kind: 'energy',
    printing,
    label: printing,
    publicMetadata: {
      sourceZone: 'attached',
      targetZone: zone,
      ownerSeat: owner,
      energyType: /Double Colorless|Speed Lightning|Capture|Spiky/i.test(printing) ? 'Special' : 'Basic'
    }
  };
}

function multiMetadata(minimumCount, maximumCount, selectionType = 'card-combination') {
  if (selectionType === 'prize-slots') {
    return { selectionType, requiredCount: minimumCount, allowCancel: false, isSecret: false };
  }
  return { selectionType, minimumCount, maximumCount, allowCancel: false, isSecret: false };
}

test('initialization identity is immutable and rejects role, seat, version and config drift', () => {
  assert.equal(SOURCE_RANK, 6);
  assert.equal(SOURCE_FINGERPRINT_SHA256,
    '12d135e3b5a2e119670d6dd2a2d996c18bedc6be3c044ebe9d472f43283b0642');
  assert.equal(CANDIDATE_FINGERPRINT_SHA256,
    '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4');
  assert.throws(() => createPolicy({
    role: 'candidate', seat: 0, policyVersion: POLICY_VERSION, config
  }), /AGENT39_RANK6_POLICY_INIT_MISMATCH/);
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 2, policyVersion: POLICY_VERSION, config
  }), /AGENT39_RANK6_POLICY_INIT_MISMATCH/);
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: 'wrong-version', config
  }), /AGENT39_RANK6_POLICY_INIT_MISMATCH/);
  assert.throws(() => createPolicy({
    role: 'opponent', seat: 0, policyVersion: POLICY_VERSION,
    config: { rank: SOURCE_RANK }
  }), /AGENT39_RANK6_POLICY_INIT_MISMATCH/);
});

test('the actual worker init validator accepts config empty and instantiates rank 6', () => {
  const init = {
    schema: protocol.INIT_SCHEMA,
    type: 'init',
    role: 'opponent',
    seat: 0,
    policyVersion: POLICY_VERSION,
    bundleSha256: 'a'.repeat(64),
    config
  };
  const accepted = protocol.validateInit(init);
  assert.equal(accepted, init);
  const policy = createPolicy({
    role: accepted.role,
    seat: accepted.seat,
    policyVersion: accepted.policyVersion,
    config: accepted.config
  });
  assert.equal(typeof policy.decide, 'function');
  assert.throws(() => protocol.validateInit({
    ...init, config: { rank: SOURCE_RANK }
  }));
});

test('same actor view produces the same decision for either physical seat', () => {
  for (const seat of [0, 1]) {
    const request = rootRequest({
      seat,
      ownHand: ['Speed Lightning Energy RCL 173'],
      items: [
        action('attach', 'play-card', 'Speed Lightning Energy RCL 173',
          { cardType: 'energy', handIndex: 0 }, { targetPrinting: 'Iron Thorns ex TWM 77' }),
        { token: 'pass', kind: 'pass' }
      ]
    });
    const first = checkedDecision(request, seat);
    const second = checkedDecision(request, seat);
    assert.deepEqual(first, { kind: 'select-action', token: 'attach' });
    assert.deepEqual(second, first);
  }
});

test('Speed Lightning attachment is preferred for Active Iron Thorns when legal', () => {
  const request = rootRequest({
    ownHand: ['Speed Lightning Energy RCL 173'],
    items: [
      action('speed', 'play-card', 'Speed Lightning Energy RCL 173',
        { cardType: 'energy', handIndex: 0 }, { targetPrinting: 'Iron Thorns ex TWM 77' }),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'speed' });
});

test('rank6 Speed Lightning obeys numeric last-used global turn markers in both seats', () => {
  for(const seat of [0,1]){
    for(const [stamp,expected] of [[-1,'speed'],[0,'speed'],[3,'speed'],[4,'pass'],[false,'speed'],[true,'pass']]){
      const request=rootRequest({
        seat,globalTurn:4,ownHand:['Speed Lightning Energy RCL 173'],
        ownTurnResources:turnResources({energyPlayedTurn:stamp}),
        items:[action('speed','play-card','Speed Lightning Energy RCL 173',
          {cardType:'energy',handIndex:0},{targetPrinting:'Iron Thorns ex TWM 77'}),
          {token:'pass',kind:'pass'}]
      });
      assert.deepEqual(checkedDecision(request,seat),{kind:'select-action',token:expected});
      if(stamp===3){
        request.observation.ownTurnResources.energyPlayLocked=true;
        assert.deepEqual(checkedDecision(request,seat),{kind:'select-action',token:'pass'});
      }
    }
  }
});

test('Temple-of-Sinnoh one-Colorless Specials complete Volt Cyclone, even as duplicate cards', () => {
  const temple=player({stadium:['Temple of Sinnoh ASR 155']});
  const energyCase=(seat,attached,card)=>rootRequest({
    seat,globalTurn:4,ownHand:[card],
    ownTurnResources:turnResources({energyPlayedTurn:3}),
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77',{energies:attached})}),
    opponentPublic:temple,
    items:[action('attach','play-card',card,{cardType:'energy',handIndex:0},
      {targetPrinting:'Iron Thorns ex TWM 77'}),{token:'pass',kind:'pass'}]
  });
  for(const seat of [0,1]){
    const light='Lightning Energy MEE 12';
    const dce='Double Colorless Energy SUM 136';
    const speed='Speed Lightning Energy RCL 173';
    for(const [attached,card] of [
      [[light,dce],speed],[[light,dce],dce],[[light,speed],speed]
    ]){
      assert.deepEqual(checkedDecision(energyCase(seat,attached,card),seat),
        {kind:'select-action',token:'attach'});
    }
    // More Colorless without a Lightning source does not pay Volt Cyclone.
    assert.deepEqual(checkedDecision(energyCase(seat,[dce,speed],speed),seat),
      {kind:'select-action',token:'pass'});
  }
});

test('Plumeria denial outranks deckout when opponent Bench has Energy and payment is available', () => {
  const request = rootRequest({
    ownHand: ['Plumeria BUS 120', "Trainers' Mail ROS 92", 'Captivating Poké Puff STS 99',
      "Team Rocket's Handiwork FCO 112"],
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75'),
      bench: [pokemon('Dedenne-GX UNB 57', { energies: ['Psychic Energy', 'Psychic Energy'] })]
    }),
    items: [
      action('plumeria', 'play-card', 'Plumeria BUS 120', { cardType: 'supporter', handIndex: 0 }),
      action('handiwork', 'play-card', "Team Rocket's Handiwork FCO 112", { cardType: 'supporter', handIndex: 3 }),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'plumeria' });
});

test('Team Flare Grunt removes an Active Energy before the Handiwork loop', () => {
  const request = rootRequest({
    ownHand: ['Team Flare Grunt XY 129', "Team Rocket's Handiwork FCO 112"],
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', { energies: ['Psychic Energy'] })
    }),
    items: [
      action('flare', 'play-card', 'Team Flare Grunt XY 129', { cardType: 'supporter', handIndex: 0 }),
      action('handiwork', 'play-card', "Team Rocket's Handiwork FCO 112", { cardType: 'supporter', handIndex: 1 }),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'flare' });
});

test('Enhanced Hammer takes a Special Energy denial window', () => {
  const request = rootRequest({
    ownHand: ['Enhanced Hammer TWM 148', "Team Rocket's Handiwork FCO 112"],
    opponentPublic: player({
      active: pokemon('Regidrago VSTAR SIT 136'),
      bench: [pokemon('Dedenne-GX UNB 57', { energies: ['Double Colorless Energy SUM 136'] })]
    }),
    items: [
      action('enhanced', 'play-card', 'Enhanced Hammer TWM 148', { cardType: 'item', handIndex: 0 }),
      action('handiwork', 'play-card', "Team Rocket's Handiwork FCO 112", { cardType: 'supporter', handIndex: 1 }),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'enhanced' });
});

test('Crushing Hammer is used when the opponent has attached Energy', () => {
  const request = rootRequest({
    ownHand: ['Crushing Hammer POR 71', "Team Rocket's Handiwork FCO 112"],
    opponentPublic: player({
      active: pokemon('Regidrago VSTAR SIT 136', { energies: ['Grass Energy'] })
    }),
    items: [
      action('crushing', 'play-card', 'Crushing Hammer POR 71', { cardType: 'item', handIndex: 0 }),
      action('handiwork', 'play-card', "Team Rocket's Handiwork FCO 112", { cardType: 'supporter', handIndex: 1 }),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'crushing' });
});

test('Handiwork is selected as the deckout channel when no Energy denial is visible', () => {
  const request = rootRequest({
    ownHand: ["Team Rocket's Handiwork FCO 112"],
    ownPublic: player({ active: pokemon(), deckCount: 20 }),
    opponentPublic: player({ active: pokemon('Shadow Rider Calyrex VMAX CRE 75'), deckCount: 30 }),
    items: [
      action('handiwork', 'play-card', "Team Rocket's Handiwork FCO 112", { cardType: 'supporter', handIndex: 0 }),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'handiwork' });
});

test('Lusamine is selected when the public discard contains Handiwork and a recovery partner', () => {
  const request = rootRequest({
    ownHand: ['Lusamine CIN 96'],
    ownPublic: player({
      active: pokemon(),
      discard: ["Team Rocket's Handiwork FCO 112", 'Lusamine CIN 96']
    }),
    opponentPublic: player({ active: pokemon('Regidrago VSTAR SIT 136') }),
    items: [
      action('lusamine', 'play-card', 'Lusamine CIN 96', { cardType: 'supporter', handIndex: 0 }),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'lusamine' });
});

test('Wondrous Labyrinth is considered only against an energized non-Fairy Active when Volt Cyclone is not offered', () => {
  const request = rootRequest({
    ownHand: ['Wondrous Labyrinth ♢ TEU 158'],
    opponentPublic: player({
      active: pokemon('Regidrago VSTAR SIT 136', {
        energies: ['Grass Energy', 'Fire Energy'],
        types: ['Dragon']
      })
    }),
    items: [
      action('labyrinth', 'play-card', 'Wondrous Labyrinth ♢ TEU 158', { cardType: 'stadium', handIndex: 0 }),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'labyrinth' });
});

test('the solo Active Initialization lock is preserved over an unnecessary retreat', () => {
  const request = rootRequest({
    ownPublic: player({
      active: pokemon(),
      bench: [pokemon('Iron Thorns ex TWM 77', { energies: ['Lightning Energy'] })]
    }),
    items: [
      { token: 'retreat', kind: 'retreat', targetPrinting: 'Iron Thorns ex TWM 77' },
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'pass' });
});

test('Volt Cyclone removes an active Budew lock when an attack is offered', () => {
  const request = rootRequest({
    opponentPublic: player({
      active: pokemon('Budew PRE 4', { hp: 30, types: ['Grass'], retreatCost: [] })
    }),
    items: [
      action('attack', 'attack', 'Iron Thorns ex TWM 77', {}, { attackName: 'Volt Cyclone' }),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'attack' });
});

test('Volt Cyclone takes an immediate KO rather than preserving a stalled attack line', () => {
  const request = rootRequest({
    opponentPublic: player({
      active: pokemon('Mew VMAX FST 114', { hp: 140, types: ['Psychic'] })
    }),
    items: [
      action('attack', 'attack', 'Iron Thorns ex TWM 77', {}, { attackName: 'Volt Cyclone' }),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'attack' });
});

test('Guzma is offered to trap a low-Energy, high-retreat opponent Bench target', () => {
  const request = rootRequest({
    ownHand: ['Guzma BUS 115'],
    ownPublic: player({
      active: pokemon(),
      bench: [pokemon('Iron Thorns ex TWM 77', { energies: ['Lightning Energy'] })]
    }),
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75'),
      bench: [
        pokemon('Snorlax PGO 55', { retreatCost: ['Colorless', 'Colorless', 'Colorless'] }),
        pokemon('Dedenne-GX UNB 57', { energies: ['Psychic Energy'], retreatCost: [] })
      ]
    }),
    items: [
      action('guzma', 'play-card', 'Guzma BUS 115', { cardType: 'supporter', handIndex: 0 }),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'guzma' });
});

test('Tool Jammer is attached when the opponent has a visible Tool', () => {
  const request = rootRequest({
    ownHand: ['Tool Jammer BST 136'],
    opponentPublic: player({
      active: pokemon('Shadow Rider Calyrex VMAX CRE 75', { tools: ['Float Stone BKT 137'] })
    }),
    items: [
      action('jam', 'play-card', 'Tool Jammer BST 136',
        { cardType: 'tool', handIndex: 0 }, { targetPrinting: 'Iron Thorns ex TWM 77' }),
      { token: 'pass', kind: 'pass' }
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-action', token: 'jam' });
});

test('Plumeria payment discards low-value cards and preserves Lusamine plus Handiwork', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Plumeria BUS 120', 'Plumeria'),
    publicMetadata: multiMetadata(2, 2),
    observation: {
      ownHand: ['Lusamine CIN 96', "Team Rocket's Handiwork FCO 112",
        "Trainers' Mail ROS 92", 'Captivating Poké Puff STS 99']
    },
    choices: [
      cardChoice('lusamine', 'Lusamine CIN 96', 'hand', 'actor'),
      cardChoice('handiwork', "Team Rocket's Handiwork FCO 112", 'hand', 'actor'),
      cardChoice('mail', "Trainers' Mail ROS 92", 'hand', 'actor'),
      cardChoice('puff', 'Captivating Poké Puff STS 99', 'hand', 'actor')
    ]
  });
  const decision = checkedDecision(request);
  assert.equal(decision.kind, 'select-choices');
  assert.deepEqual(new Set(decision.tokens), new Set(['mail', 'puff']));
});

test('Plumeria energy selection removes the highest-value visible Special Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseEnergyPrompt',
    source: actorChoiceSource('Plumeria BUS 120', 'Plumeria'),
    choices: [
      energyChoice('basic-active', 'Lightning Energy', 'active'),
      energyChoice('special-bench', 'Double Colorless Energy SUM 136', 'bench'),
      energyChoice('own-energy', 'Speed Lightning Energy RCL 173', 'active', 'actor')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['special-bench'] });
});

test('Team Flare Grunt energy selection is restricted to the opponent Active', () => {
  const request = promptRequest({
    promptType: 'ChooseEnergyPrompt',
    source: actorChoiceSource('Team Flare Grunt XY 129', 'Team Flare Grunt'),
    choices: [
      energyChoice('bench', 'Double Colorless Energy SUM 136', 'bench'),
      energyChoice('active', 'Lightning Energy', 'active')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['active'] });
});

test('Guzma chooses the lowest-Energy, highest-retreat opposing Bench Pokémon', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Guzma BUS 115', 'Guzma'),
    observation: {
      opponentPublic: player({
        active: pokemon('Shadow Rider Calyrex VMAX CRE 75'),
        bench: [
          pokemon('Snorlax PGO 55', { retreatCost: ['Colorless', 'Colorless', 'Colorless'] }),
          pokemon('Dedenne-GX UNB 57', { energies: ['Psychic Energy'], retreatCost: [] })
        ]
      })
    },
    choices: [
      pokemonChoice('snorlax', 'Snorlax PGO 55', 'opponent', 'bench', 0),
      pokemonChoice('dedene', 'Dedenne-GX UNB 57', 'opponent', 'bench', 1)
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['snorlax'] });
});

test('Guzma returns to the healthiest funded Iron Thorns on the owner Bench', () => {
  const request = promptRequest({
    promptType: 'ChoosePokemonPrompt',
    source: actorChoiceSource('Guzma BUS 115', 'Guzma'),
    observation: {
      ownPublic: player({
        active: pokemon(),
        bench: [
          pokemon('Iron Thorns ex TWM 77'),
          pokemon('Iron Thorns ex TWM 77', {
            energies: ['Lightning Energy', 'Double Colorless Energy SUM 136'], damage: 30
          })
        ]
      })
    },
    choices: [
      pokemonChoice('empty-thorns', 'Iron Thorns ex TWM 77', 'actor', 'bench', 0),
      pokemonChoice('funded-thorns', 'Iron Thorns ex TWM 77', 'actor', 'bench', 1)
    ]
  });
  // Printing is identical; the actor-visible selection index preserves the physical slot.
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['funded-thorns'] });
});

test('Faba removes Stealthy Hood before Float Stone', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Faba LOT 173', 'Faba'),
    choices: [
      cardChoice('float', 'Float Stone BKT 137', 'attached', 'opponent'),
      cardChoice('hood', 'Stealthy Hood UNB 186', 'attached', 'opponent')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['hood'] });
});

test('Enhanced Hammer selects Special Energy and ignores Basic Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Enhanced Hammer TWM 148', 'Enhanced Hammer'),
    choices: [
      cardChoice('basic', 'Lightning Energy', 'attached', 'opponent'),
      cardChoice('special', 'Double Colorless Energy SUM 136', 'attached', 'opponent')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['special'] });
});

test('Eri selects revealed opponent Items but not Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Eri TEF 146', 'Eri'),
    publicMetadata: multiMetadata(1, 2),
    choices: [
      cardChoice('vs-seeker', 'VS Seeker PHF 109', 'hand', 'opponent'),
      cardChoice('energy', 'Psychic Energy', 'hand', 'opponent'),
      cardChoice('quick-ball', 'Quick Ball SSH 179', 'hand', 'opponent')
    ]
  });
  const decision = checkedDecision(request);
  assert.equal(decision.kind, 'select-choices');
  assert.deepEqual(new Set(decision.tokens), new Set(['vs-seeker', 'quick-ball']));
});

test('Team Skull Grunt selects revealed opponent Energy and no non-Energy card', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Team Skull Grunt SUM 133', 'Team Skull Grunt'),
    publicMetadata: multiMetadata(1, 2),
    choices: [
      cardChoice('energy', 'Psychic Energy', 'hand', 'opponent'),
      cardChoice('item', 'Quick Ball SSH 179', 'hand', 'opponent')
    ]
  });
  assert.deepEqual(checkedDecision(request), { kind: 'select-choices', tokens: ['energy'] });
});

test('Lusamine recovers Handiwork and a distinct Lusamine from the public discard', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Lusamine CIN 96', 'Lusamine'),
    publicMetadata: multiMetadata(2, 2),
    choices: [
      cardChoice('handiwork', "Team Rocket's Handiwork FCO 112", 'discard', 'actor'),
      cardChoice('lusamine', 'Lusamine CIN 96', 'discard', 'actor'),
      cardChoice('plumeria', 'Plumeria BUS 120', 'discard', 'actor')
    ]
  });
  const decision = checkedDecision(request);
  assert.equal(decision.kind, 'select-choices');
  assert.deepEqual(new Set(decision.tokens), new Set(['handiwork', 'lusamine']));
});

test('Guzma and Hala searches one Stadium, Tool Jammer and Double Colorless Energy', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Guzma & Hala CEC 193', 'Guzma & Hala'),
    publicMetadata: multiMetadata(3, 3),
    choices: [
      cardChoice('thunder', 'Thunder Mountain ♢ LOT 191', 'deck', 'actor'),
      cardChoice('labyrinth', 'Wondrous Labyrinth ♢ TEU 158', 'deck', 'actor'),
      cardChoice('jammer', 'Tool Jammer BST 136', 'deck', 'actor'),
      cardChoice('dce', 'Double Colorless Energy SUM 136', 'deck', 'actor'),
      cardChoice('speed', 'Speed Lightning Energy RCL 173', 'deck', 'actor')
    ]
  });
  const decision = checkedDecision(request);
  assert.equal(decision.kind, 'select-choices');
  assert.deepEqual(new Set(decision.tokens), new Set(['thunder', 'jammer', 'dce']));
});

test('Tag Call searches Guzma and Hala plus Cynthia and Caitlin', () => {
  const request = promptRequest({
    promptType: 'ChooseCardsPrompt',
    source: actorChoiceSource('Tag Call CEC 206', 'Tag Call'),
    publicMetadata: multiMetadata(2, 2),
    choices: [
      cardChoice('gh', 'Guzma & Hala CEC 193', 'deck', 'actor'),
      cardChoice('cc', 'Cynthia & Caitlin CEC 189', 'deck', 'actor'),
      cardChoice('other', 'Lillie’s Determination MEG 119', 'deck', 'actor')
    ]
  });
  const decision = checkedDecision(request);
  assert.equal(decision.kind, 'select-choices');
  assert.deepEqual(new Set(decision.tokens), new Set(['gh', 'cc']));
});

test('Gladion Prize selection abstains because face-down Prize identities are unavailable', () => {
  const request = promptRequest({
    promptType: 'ChoosePrizePrompt',
    source: actorChoiceSource('Gladion CIN 95', 'Gladion'),
    publicMetadata: multiMetadata(1, 1, 'prize-slots'),
    choices: [{token:'prize-0',kind:'prize',label:'Prize slot 0',publicMetadata:{selectionIndex:0,ownerSeat:'actor',sourceZone:'prize',isOwnerVisible:false}}]
  });
  assert.deepEqual(checkedDecision(request), {
    kind: 'abstain', reasonCode: 'HIDDEN_PRIZE_IDENTITY'
  });
});

test('Player’s Ceremony and unknown prompts are explicitly blocked', () => {
  const ceremony = promptRequest({
    promptType: 'ConfirmPrompt',
    source: actorChoiceSource("Player's Ceremony SP 127", "Player's Ceremony"),
    choices: [
      { token: 'yes', kind: 'confirm', label: 'Yes' },
      { token: 'no', kind: 'confirm', label: 'No' }
    ]
  });
  assert.deepEqual(checkedDecision(ceremony), {
    kind: 'abstain', reasonCode: 'UNTRUSTED_PROMPT_SOURCE'
  });

  const unknown = promptRequest({
    promptType: 'UnmodeledRank6Prompt',
    source: actorChoiceSource('Unknown rank-6 effect', 'Unknown'),
    choices: [{ token: 'only', kind: 'option', label: 'Continue' }]
  });
  // An unregistered prompt class fails host schema validation before the worker;
  // verify the worker fails closed without claiming host acceptance.
  assert.deepEqual(makePolicy().decide(unknown), {
    kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE'
  });
});

test('a role/seat mismatch never emits an executable action', () => {
  const request = rootRequest({
    items: [{ token: 'pass', kind: 'pass' }]
  });
  const mismatched = { ...request, seat: 1 };
  assert.deepEqual(makePolicy(0).decide(mismatched), {
    kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH'
  });
});

test('the real worker request validator rejects hidden opponent-hand and RNG fields', () => {
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
