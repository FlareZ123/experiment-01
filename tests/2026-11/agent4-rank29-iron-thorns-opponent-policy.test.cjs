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
    ownerK1: options.ownerK1 ?? null
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


test('VS Seeker is a live Item access edge only with a visible recoverable Supporter', () => {
  const hand=['VS Seeker PHF 109'];
  const actions=[
    action('seeker','play-card','VS Seeker PHF 109',{cardType:'item',handIndex:0}),
    {token:'pass',kind:'pass'}
  ];
  const found=rootRequest({
    ownHand:hand,ownPublic:player({active:pokemon(),discard:['Team Flare Grunt XY 129']}),
    items:actions
  });
  assert.deepEqual(checkedDecision(found),{kind:'select-action',token:'seeker'});
  const absent=rootRequest({
    ownHand:hand,ownPublic:player({active:pokemon(),discard:['Speed Lightning Energy RCL 173']}),
    items:actions
  });
  assert.deepEqual(checkedDecision(absent),{kind:'select-action',token:'pass'});
  const locked=rootRequest({
    ownHand:hand,ownPublic:player({active:pokemon(),discard:['Team Flare Grunt XY 129']}),
    ownTurnResources:turnResources({itemPlayLocked:true}),items:actions
  });
  assert.deepEqual(checkedDecision(locked),{kind:'select-action',token:'pass'});
});

test('VS Seeker continuation prefers accessible Active Energy denial over generic mill', () => {
  const req=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('VS Seeker PHF 109','VS Seeker'),
    publicMetadata:multiMetadata(1,1),
    observation:{
      opponentPublic:player({
        active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{energies:['Psychic Energy CRE 232']})
      })
    },
    choices:[
      cardChoice('mill',"Team Rocket's Handiwork FCO 112",'discard','actor'),
      cardChoice('flare','Team Flare Grunt XY 129','discard','actor')
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:['flare']});
});

test('VS Seeker multiselect continuation preserves discard source with hand destination', () => {
  const req=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('VS Seeker PHF 109','VS Seeker'),
    publicMetadata:multiMetadata(1,1),
    choices:[
      cardChoice('mill',"Team Rocket's Handiwork FCO 112",'discard','actor','card','hand'),
      cardChoice('energy','Speed Lightning Energy RCL 173','discard','actor','card','hand')
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:['mill']});
});

test('Target Whistle does not spend itself on a discard containing only Trainers', () => {
  const req=rootRequest({
    ownHand:['Target Whistle Team Flare Gear PHF 106'],
    opponentPublic:player({
      active:pokemon('Shadow Rider Calyrex VMAX CRE 75'),
      discard:['Guzma BUS 115','Fog Crystal CRE 140','Psychic Energy CRE 232']
    }),
    items:[
      action('whistle','play-card','Target Whistle Team Flare Gear PHF 106',{cardType:'item'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'pass'});
});

test('Player Ceremony use sacrifices weak attack for two-card recovery in a short hand', () => {
  const req=rootRequest({
    ownHand:['Speed Lightning Energy RCL 173'],
    items:[
      action('ceremony','use-stadium',"Player's Ceremony SP 127"),
      action('attack','attack','Iron Thorns ex TWM 77',{}, {attackName:'Volt Cyclone'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'ceremony'});
});

test('Player Ceremony never replaces an immediate 140-damage knockout', () => {
  const req=rootRequest({
    ownHand:[],
    opponentPublic:player({
      active:pokemon('Shadow Rider Calyrex V CRE 74',{hp:140,damage:0})
    }),
    items:[
      action('ceremony','use-stadium',"Player's Ceremony SP 127"),
      action('attack','attack','Iron Thorns ex TWM 77',{}, {attackName:'Volt Cyclone'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'attack'});
});

test('typed Player Ceremony confirmation chooses draw only if hand and deck justify it', () => {
  const base={
    promptType:'ConfirmPrompt',
    source:actorChoiceSource("Player's Ceremony SP 127","Player's Ceremony"),
    publicMetadata:{selectionType:'confirm'},
    choices:[
      {token:'yes',kind:'confirm',label:'Yes'},
      {token:'no',kind:'confirm',label:'No'}
    ]
  };
  const scarce=promptRequest({...base,observation:{ownHand:['Crushing Hammer POR 71']}});
  assert.deepEqual(checkedDecision(scarce),{kind:'select-choice',token:'yes'});
  const rich=promptRequest({...base,observation:{ownHand:Array(5).fill('Crushing Hammer POR 71')}});
  assert.deepEqual(checkedDecision(rich),{kind:'select-choice',token:'no'});
});

test('Handheld Fan root is withheld until native AttachEnergyPrompt owner projection is supported', () => {
  const items=[
    action('fan','play-card','Handheld Fan TWM 150',{cardType:'tool'},
      {targetPrinting:'Iron Thorns ex TWM 77'}),
    {token:'pass',kind:'pass'}
  ];
  const opponent=player({
    active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{energies:['Psychic Energy CRE 232']}),
    bench:[pokemon('Tapu Lele-GX GRI 60')]
  });
  assert.deepEqual(checkedDecision(rootRequest({
    ownHand:['Handheld Fan TWM 150'],opponentPublic:opponent,items
  })),{kind:'select-action',token:'pass'});
  assert.deepEqual(checkedDecision(rootRequest({
    ownHand:['Handheld Fan TWM 150'],opponentPublic:opponent,items,
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77',{tools:['Palace Belt BWP 153']})})
  })),{kind:'select-action',token:'pass'});
});

test('Guzma & Hala rank29 search chooses Thunder Mountain, Palace Belt, DCE', () => {
  const req=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Guzma & Hala CEC 193','Guzma & Hala'),
    publicMetadata:multiMetadata(3,3),
    ownHand:['Guzma & Hala CEC 193'],
    observation:{
      ownPublic:player({active:pokemon('Iron Thorns ex TWM 77'),deckCount:30}),
      opponentPublic:player({
        active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{energies:['Psychic Energy CRE 232']}),
        bench:[pokemon('Tapu Lele-GX GRI 60')]
      })
    },
    choices:[
      cardChoice('mountain','Thunder Mountain ♢ LOT 191'),
      cardChoice('fan','Handheld Fan TWM 150'),
      cardChoice('belt','Palace Belt BWP 153'),
      cardChoice('dce','Double Colorless Energy SUM 136')
    ]
  });
  assert.deepEqual(checkedDecision(req),
    {kind:'select-choices',tokens:['dce','mountain','belt']});
});

test('Guzma & Hala Tool search prefers Jammer against exposed opposing Hood', () => {
  const req=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Guzma & Hala CEC 193','Guzma & Hala'),
    publicMetadata:multiMetadata(1,1),
    observation:{
      ownPublic:player({active:pokemon('Iron Thorns ex TWM 77'),deckCount:30}),
      opponentPublic:player({
        active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{tools:['Stealthy Hood UNB 186']})
      })
    },
    choices:[
      cardChoice('belt','Palace Belt BWP 153'),
      cardChoice('jammer','Tool Jammer BST 136')
    ]
  });
  assert.deepEqual(checkedDecision(req),
    {kind:'select-choices',tokens:['jammer']});
});

const positiveK1={
  epoch:1,exactMembershipKnown:true,knownPrintings:[],
  invalidationReason:null
};

test('Peonia becomes a last-resort live Supporter only with K1 and three low-cost replacements', () => {
  const base={
    ownHand:['Peonia CRE 149',"Trainers' Mail ROS 92",'Camping Gear BST 122',
      'Captivating Poké Puff STS 99'],
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77'),prizeCount:6}),
    items:[
      action('peonia','play-card','Peonia CRE 149',{cardType:'supporter'}),
      {token:'pass',kind:'pass'}
    ]
  };
  assert.deepEqual(checkedDecision(rootRequest({...base,ownerK1:positiveK1})),
    {kind:'select-action',token:'peonia'});
  assert.deepEqual(checkedDecision(rootRequest(base)),{kind:'select-action',token:'pass'});
  const scarce={...base,ownHand:['Peonia CRE 149','Lusamine CIN 96',
    'Double Colorless Energy SUM 136','Camping Gear BST 122']};
  assert.deepEqual(checkedDecision(rootRequest({...scarce,ownerK1:positiveK1})),
    {kind:'select-action',token:'pass'});
});

test('Peonia exact-three Prize slots choose owned physical indices, not hidden card identities', () => {
  const req=promptRequest({
    promptType:'ChoosePrizePrompt',
    source:actorChoiceSource('Peonia CRE 149','Peonia'),
    publicMetadata:multiMetadata(3,3,'prize-slots'),
    choices:[5,2,0,1,4,3].map(i=>({
      token:'slot'+i,kind:'prize',label:'Prize slot '+i,
      publicMetadata:{ownerSeat:'actor',sourceZone:'prize',slotIndex:i}
    }))
  });
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['slot0','slot1','slot2']
  });
});

test('Peonia replacement selects high-DCI actor hand cards not recovered Lusamine', () => {
  const req=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Peonia CRE 149','Peonia'),
    publicMetadata:multiMetadata(3,3),
    observation:{
      ownHand:['Lusamine CIN 96',"Trainers' Mail ROS 92",'Camping Gear BST 122',
        'Captivating Poké Puff STS 99']
    },
    choices:[
      cardChoice('lusamine','Lusamine CIN 96','hand','actor','card','prize'),
      cardChoice('mail',"Trainers' Mail ROS 92",'hand','actor','card','prize'),
      cardChoice('camp','Camping Gear BST 122','hand','actor','card','prize'),
      cardChoice('puff','Captivating Poké Puff STS 99','hand','actor','card','prize')
    ]
  });
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['mail','camp','puff']
  });
});

test('Peonia final Prize-order prompt resolves exactly three actor-visible ordered tokens', () => {
  const req=promptRequest({
    promptType:'OrderCardsPrompt',
    source:actorChoiceSource('Peonia CRE 149','Peonia'),
    publicMetadata:{selectionType:'card-order',count:3,allowCancel:false,isSecret:false},
    choices:[2,0,1].map(i=>({
      token:'order'+i,kind:'card-order-item',label:'Original hand replacement '+i,
      publicMetadata:{ownerSeat:'actor',sourceZone:'hand',selectionIndex:i}
    }))
  });
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['order0','order1','order2']
  });
});

test('Guzma & Hala root retains free Stadium path with protected hand and skips if unnecessary', () => {
  const items=[
    action('gh','play-card','Guzma & Hala CEC 193',{cardType:'supporter'}),
    {token:'pass',kind:'pass'}
  ];
  const protectedHand=['Guzma & Hala CEC 193','Lusamine CIN 96',
    "Team Rocket's Handiwork FCO 112",'Double Colorless Energy SUM 136',
    'Megaton Blower SSP 182'];
  assert.deepEqual(checkedDecision(rootRequest({ownHand:protectedHand,items})),
    {kind:'select-action',token:'gh'});
  const noStadiumNeed=rootRequest({
    ownHand:protectedHand,items,
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77'),
      stadium:['Thunder Mountain ♢ LOT 191']})
  });
  assert.deepEqual(checkedDecision(noStadiumNeed),
    {kind:'select-action',token:'pass'});
  const disposableHand=['Guzma & Hala CEC 193',"Trainers' Mail ROS 92",
    'Camping Gear BST 122','Double Colorless Energy SUM 136'];
  assert.deepEqual(checkedDecision(rootRequest({ownHand:disposableHand,items})),
    {kind:'select-action',token:'gh'});
});

test('actual Fan AttachEnergyPrompt is explicitly unsupported, not fabricated as ChooseEnergyPrompt', () => {
  const req=promptRequest({
    promptType:'AttachEnergyPrompt',
    source:actorChoiceSource('Handheld Fan TWM 150','Handheld Fan'),
    publicMetadata:{selectionType:'energy-attachment',count:1,
      minimumCount:1,maximumCount:1,allowCancel:false,
      sourceZone:'active',ownerSeat:'opponent',isOwnerVisible:true,
      zone:'bench'},
    choices:[{token:'unsafe-synthetic-assignment',kind:'energy',
      printing:'Psychic Energy CRE 232',
      publicMetadata:{ownerSeat:'opponent',sourceZone:'active',
        targetZone:'bench',benchIndex:0}}]
  });
  assert.deepEqual(checkedDecision(req),{
    kind:'abstain',reasonCode:'UNSUPPORTED_PROMPT_TYPE'
  });
});

test('Guzma native ChoosePokemonPrompt returns select-choices for one trapped Bench target', () => {
  for (const seat of [0,1]) {
    const req=promptRequest({
      seat,promptType:'ChoosePokemonPrompt',
      source:actorChoiceSource('Guzma BUS 115','Guzma'),
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
        allowCancel:false,isSecret:false},
      observation:{opponentPublic:player({
        active:pokemon('Shadow Rider Calyrex VMAX CRE 75'),
        bench:[
          pokemon('Tapu Lele-GX GRI 60',{energies:[]}),
          pokemon('Regidrago V SIT 135',{energies:['Basic Grass Energy SVI 278']})
        ]})},
      choices:[
        pokemonChoice('lelex','Tapu Lele-GX GRI 60','opponent','bench',0),
        pokemonChoice('regix','Regidrago V SIT 135','opponent','bench',1)
      ]
    });
    const choice=checkedDecision(req,seat);
    assert.equal(choice.kind,'select-choices');
    assert.equal(choice.tokens.length,1);
    assert.ok(['lelex','regix'].includes(choice.tokens[0]));
  }
});

test('Team Flare Grunt native ChooseEnergyPrompt uses required energy-payment multiselect', () => {
  const req=promptRequest({
    promptType:'ChooseEnergyPrompt',
    source:actorChoiceSource('Team Flare Grunt XY 129','Team Flare Grunt'),
    publicMetadata:{selectionType:'energy-payment',count:1,energyCount:1,
      allowCancel:false,isSecret:false},
    choices:[
      energyChoice('basic','Basic Psychic Energy CRE 232','active','opponent'),
      energyChoice('special','Double Colorless Energy SUM 136','active','opponent')
    ]
  });
  assert.deepEqual(checkedDecision(req),
    {kind:'select-choices',tokens:['special']});
});

test('Guzma and Energy denial reject malformed native selection contracts before fake single choice', () => {
  const wrongGuzma=promptRequest({
    promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Guzma BUS 115','Guzma'),
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:2,
      allowCancel:false,isSecret:false},
    choices:[pokemonChoice('x','Tapu Lele-GX GRI 60','opponent','bench',0)]
  });
  assert.deepEqual(checkedDecision(wrongGuzma),
    {kind:'abstain',reasonCode:'UNSUPPORTED_POKEMON_PROMPT'});
});

test('first additional Iron Thorns is a real Bench-development root action', () => {
  const items=[
    action('bench','play-card','Iron Thorns ex TWM 77',{cardType:'pokemon'}),
    action('hammer','play-card','Crushing Hammer POR 71',{cardType:'item'}),
    {token:'pass',kind:'pass'}
  ];
  const opponent=player({
    active:pokemon('Shadow Rider Calyrex VMAX CRE 75',
      {energies:['Basic Psychic Energy CRE 232']})
  });
  const req=rootRequest({
    ownHand:['Iron Thorns ex TWM 77','Crushing Hammer POR 71'],
    opponentPublic:opponent,
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77')}),
    items
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'bench'});
});

test('once a healthy Thorns is Benched do not add unnecessary two-Prize board liability', () => {
  const items=[
    action('bench','play-card','Iron Thorns ex TWM 77',{cardType:'pokemon'}),
    {token:'pass',kind:'pass'}
  ];
  const req=rootRequest({
    ownHand:['Iron Thorns ex TWM 77'],
    ownPublic:player({
      active:pokemon('Iron Thorns ex TWM 77'),
      bench:[pokemon('Iron Thorns ex TWM 77')]
    }),
    items
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'pass'});
});

test('locked Pokemon play and full Bench never select Thorns Bench', () => {
  const items=[
    action('bench','play-card','Iron Thorns ex TWM 77',{cardType:'pokemon'}),
    {token:'pass',kind:'pass'}
  ];
  const locked=rootRequest({items,
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77')}),
    ownTurnResources:turnResources({pokemonPlayLocked:true})
  });
  assert.deepEqual(checkedDecision(locked),{kind:'select-action',token:'pass'});
  const full=rootRequest({items,
    ownPublic:player({
      active:pokemon('Iron Thorns ex TWM 77'),
      bench:Array.from({length:5},()=>pokemon('Iron Thorns ex TWM 77'))
    })
  });
  assert.deepEqual(checkedDecision(full),{kind:'select-action',token:'pass'});
});

test('first-turn DCE plus held Thunder Mountain line precedes Speed Lightning draw', () => {
  const opening=[
    action('speed','play-card','Speed Lightning Energy RCL 173',{cardType:'energy'}),
    action('dce','play-card','Double Colorless Energy SUM 136',{cardType:'energy'}),
    action('mountain','play-card','Thunder Mountain ♢ LOT 191',{cardType:'stadium'}),
    {token:'pass',kind:'pass'}
  ];
  const req=rootRequest({
    ownHand:['Speed Lightning Energy RCL 173','Double Colorless Energy SUM 136',
      'Thunder Mountain ♢ LOT 191'],
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77')}),
    items:opening
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'mountain'});
  const after=rootRequest({
    ownHand:['Speed Lightning Energy RCL 173','Double Colorless Energy SUM 136'],
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77'),
      stadium:['Thunder Mountain ♢ LOT 191']}),
    items:opening.filter(item=>item.token!=='mountain')
  });
  assert.deepEqual(checkedDecision(after),{kind:'select-action',token:'dce'});
});

test('payable Guzma Hala beats Speed attachment when it can find Thunder and DCE', () => {
  const req=rootRequest({
    ownHand:['Guzma & Hala CEC 193','Speed Lightning Energy RCL 173',
      "Trainers' Mail ROS 92",'Camping Gear BST 122'],
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77')}),
    items:[
      action('gh','play-card','Guzma & Hala CEC 193',{cardType:'supporter'}),
      action('speed','play-card','Speed Lightning Energy RCL 173',{cardType:'energy'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'gh'});
});

test('already legal immediate Volt Cyclone still outranks setting up another Thunder', () => {
  const req=rootRequest({
    ownHand:['Guzma & Hala CEC 193','Double Colorless Energy SUM 136',
      'Thunder Mountain ♢ LOT 191'],
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77',{
      energies:['Speed Lightning Energy RCL 173','Double Colorless Energy SUM 136']})}),
    opponentPublic:player({active:pokemon('Shadow Rider Calyrex V CRE 74',{hp:140})}),
    items:[
      action('attack','attack','Iron Thorns ex TWM 77',
        {damage:140,targetHp:140},{attackName:'Volt Cyclone'}),
      action('gh','play-card','Guzma & Hala CEC 193',{cardType:'supporter'}),
      action('mountain','play-card','Thunder Mountain ♢ LOT 191',{cardType:'stadium'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'attack'});
});

test('certified owner-K1 absent targets suppress dead Tag Call and G&H search', () => {
  const none={epoch:1,exactMembershipKnown:true,knownPrintings:[],
    invalidationReason:null};
  const hand=["Guzma & Hala CEC 193","Trainers' Mail ROS 92",
    'Camping Gear BST 122','Tag Call CEC 206'];
  const items=[
    action('gh','play-card',"Guzma & Hala CEC 193",{cardType:'supporter'}),
    action('tag','play-card','Tag Call CEC 206',{cardType:'item'}),
    {token:'pass',kind:'pass'}
  ];
  const req=rootRequest({ownHand:hand,ownerK1:none,items});
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'pass'});
  const unknown=rootRequest({ownHand:hand,items});
  assert.deepEqual(checkedDecision(unknown),{kind:'select-action',token:'gh'});
});

test('K1 known Tropical Beach preserves Stadium-only G&H alternative without Thunder', () => {
  const beach={
    epoch:2,exactMembershipKnown:true,
    knownPrintings:[{printing:'Tropical Beach BWP 28',copies:2}],
    invalidationReason:null
  };
  const req=rootRequest({
    ownerK1:beach,
    ownHand:['Guzma & Hala CEC 193','Lusamine CIN 96',
      'Double Colorless Energy SUM 136'],
    items:[
      action('gh','play-card','Guzma & Hala CEC 193',{cardType:'supporter'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'gh'});
});

test('Tag Call connector precedes Speed Lightning when it can assemble G&H DCE turbo', () => {
  const req=rootRequest({
    ownHand:['Tag Call CEC 206','Speed Lightning Energy RCL 173',
      "Trainers' Mail ROS 92",'Camping Gear BST 122'],
    items:[
      action('tag','play-card','Tag Call CEC 206',{cardType:'item'}),
      action('speed','play-card','Speed Lightning Energy RCL 173',{cardType:'energy'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'tag'});
  const directDce=rootRequest({
    ownHand:['Tag Call CEC 206','Double Colorless Energy SUM 136',
      'Thunder Mountain ♢ LOT 191'],
    items:[
      action('tag','play-card','Tag Call CEC 206',{cardType:'item'}),
      action('mountain','play-card','Thunder Mountain ♢ LOT 191',{cardType:'stadium'}),
      action('dce','play-card','Double Colorless Energy SUM 136',{cardType:'energy'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(directDce),{kind:'select-action',token:'mountain'});
});

test('Guzma Hala actual two-option native mode takes paid Special Energy search only when hand can pay', () => {
  const options={
    promptType:'SelectOptionPrompt',
    source:actorChoiceSource('Guzma & Hala CEC 193','Guzma & Hala'),
    publicMetadata:{selectionType:'option',count:2,allowCancel:false},
    choices:[
      {token:'stadium',kind:'option',label:'Stadium only',
        publicMetadata:{choiceIndex:0}},
      {token:'paid',kind:'option',label:'Discard two, also Tool and Special Energy',
        publicMetadata:{choiceIndex:1}}
    ]
  };
  const cheap=promptRequest({...options,observation:{
    ownHand:["Trainers' Mail ROS 92",'Camping Gear BST 122']
  }});
  assert.deepEqual(checkedDecision(cheap),{kind:'select-choice',token:'paid'});
  const protectedHand=promptRequest({...options,observation:{
    ownHand:['Lusamine CIN 96','Megaton Blower SSP 182']
  }});
  assert.deepEqual(checkedDecision(protectedHand),{kind:'select-choice',token:'stadium'});
  const dceHeld=promptRequest({...options,observation:{
    ownHand:['Double Colorless Energy SUM 136',"Trainers' Mail ROS 92",
      'Camping Gear BST 122']
  }});
  assert.deepEqual(checkedDecision(dceHeld),{kind:'select-choice',token:'stadium'});
});

test('Guzma Hala mode1 can fetch needed Jammer despite held DCE, but no malformed mode switch', () => {
  const source=actorChoiceSource('Guzma & Hala CEC 193','Guzma & Hala');
  const options=[
    {token:'mode0',kind:'option',label:'Stadium only',publicMetadata:{choiceIndex:0}},
    {token:'mode1',kind:'option',label:'Discard 2',publicMetadata:{choiceIndex:1}}
  ];
  const req=promptRequest({
    promptType:'SelectOptionPrompt',source,
    publicMetadata:{selectionType:'option',count:2,allowCancel:false},
    observation:{
      ownHand:['Double Colorless Energy SUM 136',"Trainers' Mail ROS 92",
        'Camping Gear BST 122'],
      opponentPublic:player({
        active:pokemon('Shadow Rider Calyrex VMAX CRE 75',
          {tools:['Stealthy Hood UNB 186']})
      })
    },choices:options
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-choice',token:'mode1'});
  const spoof=promptRequest({
    promptType:'SelectOptionPrompt',
    source:actorChoiceSource('Camping Gear BST 122','Guzma & Hala'),
    publicMetadata:{selectionType:'option',count:2,allowCancel:false},
    choices:options
  });
  const response=checkedDecision(spoof);
  assert.notEqual(response.token,'mode1');
  const malformed=promptRequest({
    promptType:'SelectOptionPrompt',source,
    publicMetadata:{selectionType:'option',count:2,allowCancel:false},
    choices:[options[0],{...options[1],publicMetadata:{choiceIndex:0}}]
  });
  assert.throws(()=>checkedDecision(malformed),/BAD_(MULTI|OPTION)|choiceIndex|DUPLICATE/);
});
