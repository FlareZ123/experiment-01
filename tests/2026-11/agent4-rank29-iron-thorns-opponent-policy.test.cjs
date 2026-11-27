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
} = require('../../simulation/evaluation/2026-11/agent4-rank29-iron-thorns-opponent-policy.cjs');

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
    phase: options.phase ?? 2,
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
    requestId: options.requestId ?? 'agent4-rank29-root-1',
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
    requestId: options.requestId ?? 'agent4-rank29-prompt-1',
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


const source = require('../../results/aichi-2026/full-decklists.json');

test('rank-29 original source is exact 60 with the known three-source delta', () => {
  assert.equal(SOURCE_RANK, 29);
  const deck = source.decks.find(row => row.rank === 29);
  assert.ok(deck);
  assert.equal(deck.cards.reduce((sum,row) => sum + row.count, 0), 60);
  assert.equal(deck.cards.find(row => row.name === 'Iron Thorns ex').count, 4);
  for (const name of ['Peonia','Target Whistle','Field Blower']) {
    assert.equal(deck.cards.find(row => row.name === name)?.count, 1);
  }
  for (const name of ['Gladion','Palace Book','Echoing Horn']) {
    assert.equal(deck.cards.some(row => row.name === name), false);
  }
});

test('rank-29 init and physical seat binding reject drift', () => {
  for (const seat of [0,1]) {
    assert.equal(typeof makePolicy(seat).decide, 'function');
    assert.throws(() => createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config}), /POLICY_INIT_MISMATCH/);
    assert.throws(() => createPolicy({role:'opponent',seat,policyVersion:'other',config}), /POLICY_INIT_MISMATCH/);
    assert.throws(() => createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config:{rank:29}}), /POLICY_INIT_MISMATCH/);
  }
});

test('opposing Stealthy Hood makes rank-29 Field Blower beat a legal Plumeria', () => {
  for(const seat of [0,1]) {
    const req = rootRequest({
      seat,
      ownHand:['Field Blower GRI 125','Plumeria BUS 120',"Trainers' Mail ROS 92",'Captivating Poké Puff STS 99'],
      opponentPublic:player({
        active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{
          energies:['Basic Psychic Energy CRE 232'],
          tools:['Stealthy Hood UNB 186']
        })
      }),
      items:[
        action('blower','play-card','Field Blower GRI 125',{cardType:'item',handIndex:0}),
        action('plumeria','play-card','Plumeria BUS 120',{cardType:'supporter',handIndex:1}),
        {token:'pass',kind:'pass'}
      ]
    });
    assert.deepEqual(checkedDecision(req,seat),{kind:'select-action',token:'blower'});
  }
});

test('Field Blower continuation targets opposing Hood, not own Pokémon Tool', () => {
  const req = promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Field Blower GRI 125','Field Blower'),
    publicMetadata:multiMetadata(0,2),
    choices:[
      cardChoice('own','Palace Belt BWP 153','attached','actor'),
      cardChoice('hood','Stealthy Hood UNB 186','attached','opponent'),
      cardChoice('fan','Handheld Fan TWM 150','attached','opponent'),
      {token:'empty',kind:'empty-selection'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:['hood','fan']});
});

test('spoofed description alone cannot activate Field Blower-specific prompt', () => {
  const req = promptRequest({
    promptType:'ChooseCardsPrompt',
    description:'Field Blower choose two target Tools',
    source:actorChoiceSource('Quick Ball FST 237','Quick Ball'),
    publicMetadata:multiMetadata(0,2),
    choices:[cardChoice('hood','Stealthy Hood UNB 186','attached','opponent'),{token:'empty',kind:'empty-selection'}]
  });
  const d=checkedDecision(req);
  assert.equal(d.kind,'abstain');
  assert.notEqual(d.reasonCode,'NO_FIELD_BLOWER_TARGET');
});

test('Target Whistle root offered with Bench room and public discard', () => {
  const req=rootRequest({
    ownHand:['Target Whistle Team Flare Gear PHF 106'],
    opponentPublic:player({
      active:pokemon('Shadow Rider Calyrex VMAX CRE 75'),
      discard:['Latias ex SSP 76']
    }),
    items:[
      action('whistle','play-card','Target Whistle Team Flare Gear PHF 106',{cardType:'item',handIndex:0}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'whistle'});
});

test('Target Whistle chooses opposing Basic from discard even with Bench destination metadata', () => {
  const req=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Target Whistle Team Flare Gear PHF 106','Target Whistle'),
    publicMetadata:multiMetadata(1,1),
    choices:[
      cardChoice('latias','Latias ex SSP 76','discard','opponent','card','bench'),
      cardChoice('shadow','Shadow Rider Calyrex V CRE 74','discard','opponent','card','bench')
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:['latias']});
});

test('Target Whistle without opponent bench room is not played', () => {
  const full=Array.from({length:5},(_,i)=>pokemon('Shadow Rider Calyrex V CRE 74'));
  const req=rootRequest({
    ownHand:['Target Whistle Team Flare Gear PHF 106'],
    opponentPublic:player({
      active:pokemon('Shadow Rider Calyrex VMAX CRE 75'),
      bench:full,discard:['Latias ex SSP 76']
    }),
    items:[
      action('whistle','play-card','Target Whistle Team Flare Gear PHF 106',{cardType:'item'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'pass'});
});

test('Palace Belt takes a recurring draw opportunity; no illegal second Tool attachment', () => {
  const items=[
    action('belt','play-card','Palace Belt BWP 153',{cardType:'tool'}, {targetPrinting:'Iron Thorns ex TWM 77'}),
    {token:'pass',kind:'pass'}
  ];
  assert.deepEqual(checkedDecision(rootRequest({items})),{kind:'select-action',token:'belt'});
  const blocked=rootRequest({
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77',{tools:['Tool Jammer BST 136']})}),
    items
  });
  assert.deepEqual(checkedDecision(blocked),{kind:'select-action',token:'pass'});
});

test('Peonia is not selected without a supported owner-K1 Prize-exchange continuation', () => {
  const req=rootRequest({
    ownHand:['Peonia CRE 149'],
    items:[
      action('peonia','play-card','Peonia CRE 149',{cardType:'supporter'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'pass'});
  const prompt=promptRequest({
    promptType:'ChoosePrizePrompt',
    source:actorChoiceSource('Peonia CRE 149','Peonia'),
    publicMetadata:multiMetadata(1,1,'prize-slots'),
    choices:[cardChoice('prize-1','Prize slot 1','prize','actor','prize')]
  });
  assert.deepEqual(checkedDecision(prompt),{kind:'abstain',reasonCode:'UNSUPPORTED_PRIZE_SELECTION'});
});

test('common rank-6 denial engine still chooses Crushing Hammer in rank 29', () => {
  const req=rootRequest({
    ownHand:['Crushing Hammer POR 71'],
    opponentPublic:player({
      active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{energies:['Basic Psychic Energy CRE 232']})
    }),
    items:[
      action('hammer','play-card','Crushing Hammer POR 71',{cardType:'item'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'hammer'});
});


function engineSetupPrompt(seat, {promptType, description, choices, publicMetadata, effectName, phase = 1}) {
  return promptRequest({
    seat, promptType, description, choices, publicMetadata,
    source: {
      classification:'actor-choice',
      sourceKind:'engine',
      sourcePrinting:null,
      effectName:effectName ?? description
    },
    observation:{phase}
  });
}

function thornsBasicChoice(token, selectionIndex) {
  return {
    token,kind:'card',printing:'Iron Thorns ex TWM 77',
    label:'Iron Thorns ex TWM 77',
    publicMetadata:{
      sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
      selectionIndex,selectedCount:1
    }
  };
}

function nativeStartingMeta(minimumCount,maximumCount) {
  return {
    selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
    isOwnerVisible:true,isSecret:false,allowCancel:false,minimumCount,maximumCount
  };
}

test('initial native starting choice benches exact-source Iron Thorns in legal order on either seat', () => {
  for(const seat of [0,1]) {
    const req=engineSetupPrompt(seat,{
      promptType:'ChooseCardsPrompt',
      description:'CHOOSE_STARTING_POKEMONS',
      choices:[thornsBasicChoice('thorn0',0),thornsBasicChoice('thorn2',2)],
      publicMetadata:nativeStartingMeta(1,6)
    });
    assert.deepEqual(checkedDecision(req,seat),
      {kind:'select-choices',tokens:['thorn0','thorn2']});
  }
});

test('post-bonus setup chooses remaining legal Basics or explicit empty-selection', () => {
  const req=engineSetupPrompt(0,{
    promptType:'ChooseCardsPrompt',description:'CHOOSE_STARTING_POKEMONS',
    choices:[thornsBasicChoice('thorn1',1),{token:'empty',kind:'empty-selection',label:'Choose no items'}],
    publicMetadata:nativeStartingMeta(0,1)
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:['thorn1']});
  const empty=engineSetupPrompt(0,{
    promptType:'ChooseCardsPrompt',description:'CHOOSE_STARTING_POKEMONS',
    choices:[{token:'empty',kind:'empty-selection',label:'Choose no items'}],
    publicMetadata:nativeStartingMeta(0,0)
  });
  assert.deepEqual(checkedDecision(empty),{kind:'select-choice',token:'empty'});
});

test('rank-29 GO_FIRST policy elects second for early Guzma & Hala on both seats', () => {
  for(const seat of [0,1]) {
    const req=engineSetupPrompt(seat,{
      promptType:'ConfirmPrompt',description:'GO_FIRST',
      choices:[
        {token:'yes',kind:'confirm',label:'Yes'},
        {token:'no',kind:'confirm',label:'No'}
      ],
      publicMetadata:{selectionType:'confirm'}
    });
    assert.deepEqual(checkedDecision(req,seat),{kind:'select-choice',token:'no'});
  }
});

test('native mulligan bonus selection takes maximum offered bonus draw', () => {
  for(const seat of [0,1]) {
    const req=engineSetupPrompt(seat,{
      promptType:'SelectPrompt',description:'WANT_TO_DRAW_CARDS',
      choices:[
        {token:'draw-3',kind:'option',label:'Draw 3 card(s)',publicMetadata:{choiceIndex:0}},
        {token:'draw-1',kind:'option',label:'Draw 1 card(s)',publicMetadata:{choiceIndex:2}},
        {token:'draw-0',kind:'option',label:'Draw 0 card(s)',publicMetadata:{choiceIndex:3}}
      ],
      publicMetadata:{selectionType:'option',count:4,allowCancel:false}
    });
    assert.deepEqual(checkedDecision(req,seat),{kind:'select-choice',token:'draw-3'});
  }
});

test('setup rejects phase-two, mismatched effect name and non-Thorns spoofed Basic', () => {
  const args={
    promptType:'ConfirmPrompt',description:'GO_FIRST',
    choices:[{token:'yes',kind:'confirm',label:'Yes'},{token:'no',kind:'confirm',label:'No'}],
    publicMetadata:{selectionType:'confirm'}
  };
  const wrongPhase=engineSetupPrompt(0,{...args,phase:2});
  assert.deepEqual(checkedDecision(wrongPhase),
    {kind:'abstain',reasonCode:'UNSUPPORTED_ENGINE_SETUP_PHASE'});
  const spoof=engineSetupPrompt(0,{...args,effectName:'SPOOFED'});
  assert.deepEqual(checkedDecision(spoof),
    {kind:'abstain',reasonCode:'UNTRUSTED_ENGINE_SETUP_PROMPT'});
  const badBasic=engineSetupPrompt(0,{
    promptType:'ChooseCardsPrompt',description:'CHOOSE_STARTING_POKEMONS',
    choices:[{...thornsBasicChoice('fake',0),printing:'Mew V FST 113',label:'Mew V FST 113'}],
    publicMetadata:nativeStartingMeta(1,6)
  });
  assert.deepEqual(checkedDecision(badBasic),
    {kind:'abstain',reasonCode:'UNTRUSTED_STARTING_POKEMON_CHOICE'});
});

