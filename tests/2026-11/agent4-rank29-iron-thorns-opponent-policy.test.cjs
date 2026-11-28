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
  const policy = makePolicy(seat);
  const decision = policy.decide(request);
  protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  const audited = policy.decideWithAudit(request);
  assert.deepEqual(audited.decision,decision,'audited path must not change play');
  protocol.validatePolicyAudit(audited.policyAudit,request,decision,POLICY_VERSION);
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

test('Handheld Fan root plays with visible energized attacker plus Bench, but not with occupied Tool slot', () => {
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
  })),{kind:'select-action',token:'fan'});
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

test('Handheld Fan native owner prompt moves opposing DCE to exposed draw support rather than attacker', () => {
  for (const seat of [0,1]) {
    const req=promptRequest({
      seat,promptType:'AttachEnergyPrompt',
      source:actorChoiceSource('Handheld Fan TWM','Handheld Fan'),
      publicMetadata:{selectionType:'energy-attachment',count:3,
        minimumCount:0,maximumCount:1,allowCancel:false,
        sourceZone:'active',ownerSeat:'opponent',isOwnerVisible:true,zone:'bench'},
      observation:{opponentPublic:player({
        active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{energies:[
          'Double Colorless Energy SUM 136','Psychic Energy CRE 232']}),
        bench:[pokemon('Tapu Lele-GX GRI 60'),
          pokemon('Shadow Rider Calyrex V CRE 74',{energies:['Psychic Energy CRE 232']})]
      })},
      choices:[
        {token:'psychic-shadow',kind:'energy',printing:'Psychic Energy CRE 232',
          publicMetadata:{ownerSeat:'opponent',sourceZone:'active',
            zone:'bench',benchIndex:1,isOwnerVisible:true,selectedCount:1}},
        {token:'dce-lele',kind:'energy',printing:'Double Colorless Energy SUM 136',
          publicMetadata:{ownerSeat:'opponent',sourceZone:'active',
            zone:'bench',benchIndex:0,isOwnerVisible:true,selectedCount:1}},
        {token:'none',kind:'empty-selection',label:'Move no Energy'}
      ]
    });
    assert.deepEqual(checkedDecision(req,seat),{kind:'select-choice',token:'dce-lele'});
  }
});

test('Handheld Fan native min-zero is a typed no-transfer decision, not a fake Energy card', () => {
  const base={
    promptType:'AttachEnergyPrompt',
    source:actorChoiceSource('Handheld Fan TWM','Handheld Fan'),
    publicMetadata:{selectionType:'energy-attachment',count:1,
      minimumCount:0,maximumCount:1,allowCancel:false,
      sourceZone:'active',ownerSeat:'opponent',isOwnerVisible:true,zone:'bench'},
    choices:[{token:'none',kind:'empty-selection',label:'Move no Energy'}]
  };
  assert.deepEqual(checkedDecision(promptRequest(base)),
    {kind:'select-choice',token:'none'});
  const malicious=promptRequest({...base,source:actorChoiceSource('Handheld Fan TWM','Max Geist')});
  assert.throws(()=>checkedDecision(malicious),/BAD_SINGLE_SELECT_EMPTY_CHOICE/);
  const falsePositive=promptRequest({...base,
    source:actorChoiceSource('Handheld Fan TWM 150','Handheld Fan')});
  assert.throws(()=>checkedDecision(falsePositive),/BAD_SINGLE_SELECT_EMPTY_CHOICE/);
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
  assert.deepEqual(checkedDecision(malformed),
    {kind:'abstain',reasonCode:'UNSUPPORTED_CONFIRMATION_SOURCE'});
});

test('Trainers Mail live top-four prompt picks G&H first-turn connector over Plumeria', () => {
  const req=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource("Trainers' Mail ROS 92","Trainers' Mail"),
    publicMetadata:multiMetadata(0,1),
    observation:{
      ownHand:["Trainers' Mail ROS 92",'Camping Gear BST 122',
        'Double Colorless Energy SUM 136']
    },
    choices:[
      cardChoice('plumeria','Plumeria BUS 120'),
      cardChoice('gh','Guzma & Hala CEC 193'),
      cardChoice('hammer','Crushing Hammer POR 71'),
      {token:'empty',kind:'empty-selection'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['gh']
  });
});

test('Camping Gear owner-deck single search preserves DCE after G&H and Thunder held', () => {
  const req=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Camping Gear BST 122','Camping Gear'),
    publicMetadata:multiMetadata(1,1),
    observation:{ownHand:['Guzma & Hala CEC 193','Thunder Mountain ♢ LOT 191']},
    choices:[
      cardChoice('plumeria','Plumeria BUS 120'),
      cardChoice('dce','Double Colorless Energy SUM 136'),
      cardChoice('jammer','Tool Jammer BST 136')
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:['dce']});
});

test('Trainers Mail no eligible remaining card can explicitly skip selection', () => {
  const req=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource("Trainers' Mail ROS 92","Trainers' Mail"),
    publicMetadata:multiMetadata(0,1),
    choices:[
      cardChoice('blank','Iron Thorns ex TWM 77'),
      {token:'empty',kind:'empty-selection'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-choice',token:'empty'});
});

test('Faba and Enhanced Hammer typed ChooseCardsPrompt paths choose actual opponent cards', () => {
  const base={
    promptType:'ChooseCardsPrompt',publicMetadata:multiMetadata(1,1)
  };
  const faba=promptRequest({...base,
    source:actorChoiceSource('Faba LOT 173','Faba'),
    choices:[
      cardChoice('hood','Stealthy Hood UNB 186','attached','opponent'),
      cardChoice('dce','Double Colorless Energy SUM 136','attached','opponent')
    ]
  });
  assert.deepEqual(checkedDecision(faba),{kind:'select-choices',tokens:['hood']});
  const hammer=promptRequest({...base,
    source:actorChoiceSource('Enhanced Hammer GRI 124','Enhanced Hammer'),
    choices:[
      cardChoice('dce','Double Colorless Energy SUM 136','attached','opponent')
    ]
  });
  assert.deepEqual(checkedDecision(hammer),{kind:'select-choices',tokens:['dce']});
});

test('context DCI burns one Speed Lightning for immediate G&H DCE turbo instead of attaching it', () => {
  const req=rootRequest({
    ownHand:['Guzma & Hala CEC 193','Speed Lightning Energy RCL 173',
      'Camping Gear BST 122'],
    items:[
      action('gh','play-card','Guzma & Hala CEC 193',{cardType:'supporter'}),
      action('speed','play-card','Speed Lightning Energy RCL 173',{cardType:'energy'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'gh'});
  const payment=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Guzma & Hala CEC 193','Guzma & Hala'),
    publicMetadata:multiMetadata(2,2),
    observation:{ownHand:['Speed Lightning Energy RCL 173','Camping Gear BST 122']},
    choices:[
      cardChoice('speed','Speed Lightning Energy RCL 173','hand','actor'),
      cardChoice('gear','Camping Gear BST 122','hand','actor')
    ]
  });
  assert.deepEqual(checkedDecision(payment),
    {kind:'select-choices',tokens:['gear','speed']});
});

test('one Speed outside turbo window remains protected, opposing Hood protects Tool Jammer', () => {
  const unavailableDce={
    epoch:3,exactMembershipKnown:true,
    knownPrintings:[{printing:'Tropical Beach BWP 28',copies:1}],
    invalidationReason:null
  };
  const req=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Guzma & Hala CEC 193','Guzma & Hala'),
    publicMetadata:multiMetadata(2,2),
    observation:{
      ownerK1:unavailableDce,
      ownHand:['Speed Lightning Energy RCL 173','Tool Jammer BST 136','Camping Gear BST 122'],
      opponentPublic:player({active:pokemon('Shadow Rider Calyrex VMAX CRE 75',
        {tools:['Stealthy Hood UNB 186']})})
    },
    choices:[
      cardChoice('speed','Speed Lightning Energy RCL 173','hand','actor'),
      cardChoice('jammer','Tool Jammer BST 136','hand','actor'),
      cardChoice('gear','Camping Gear BST 122','hand','actor')
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'abstain',reasonCode:'NO_LEGAL_CARD_SET'});
});

test('identical DCE printing targets choose Active not Bench under Thunder Mountain', () => {
  const meta=(targetZone,index)=>({
    cardType:'energy',targetSeat:'actor',targetZone,targetIndex:index,
    isOwnerVisible:true
  });
  const req=rootRequest({
    ownHand:['Double Colorless Energy SUM 136'],
    ownPublic:player({
      active:pokemon('Iron Thorns ex TWM 77'),
      bench:[pokemon('Iron Thorns ex TWM 77')],
      stadium:['Thunder Mountain ♢ LOT 191']
    }),
    items:[
      action('bench-energy','play-card','Double Colorless Energy SUM 136',
        meta('bench',0),{targetPrinting:'Iron Thorns ex TWM 77'}),
      action('active-energy','play-card','Double Colorless Energy SUM 136',
        meta('active',0),{targetPrinting:'Iron Thorns ex TWM 77'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),
    {kind:'select-action',token:'active-energy'});
});

test('identical Speed Energy printing targets prioritize Active attachment', () => {
  const req=rootRequest({
    ownHand:['Speed Lightning Energy RCL 173'],
    ownPublic:player({
      active:pokemon('Iron Thorns ex TWM 77'),
      bench:[pokemon('Iron Thorns ex TWM 77')]
    }),
    items:[
      action('bench-energy','play-card','Speed Lightning Energy RCL 173',
        {cardType:'energy',targetSeat:'actor',targetZone:'bench',targetIndex:0,isOwnerVisible:true},
        {targetPrinting:'Iron Thorns ex TWM 77'}),
      action('active-energy','play-card','Speed Lightning Energy RCL 173',
        {cardType:'energy',targetSeat:'actor',targetZone:'active',targetIndex:0,isOwnerVisible:true},
        {targetPrinting:'Iron Thorns ex TWM 77'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),
    {kind:'select-action',token:'active-energy'});
});

test('Tool Jammer and Palace Belt are not prematurely attached to Bench when Active needed', () => {
  const playerWithBench=player({
    active:pokemon('Iron Thorns ex TWM 77'),
    bench:[pokemon('Iron Thorns ex TWM 77')]
  });
  for(const [tool,opponent] of [
    ['Tool Jammer BST 136',player({
      active:pokemon('Shadow Rider Calyrex VMAX CRE 75',
        {tools:['Stealthy Hood UNB 186']})})],
    ['Palace Belt BWP 153',player({active:pokemon('Shadow Rider Calyrex VMAX CRE 75')})]
  ]) {
    const req=rootRequest({
      ownPublic:playerWithBench,opponentPublic:opponent,ownHand:[tool],
      items:[
        action('bench-tool','play-card',tool,
          {cardType:'tool',targetZone:'bench',targetSeat:'actor',targetIndex:0,isOwnerVisible:true},
          {targetPrinting:'Iron Thorns ex TWM 77'}),
        action('active-tool','play-card',tool,
          {cardType:'tool',targetZone:'active',targetSeat:'actor',targetIndex:0,isOwnerVisible:true},
          {targetPrinting:'Iron Thorns ex TWM 77'}),
        {token:'pass',kind:'pass'}
      ]
    });
    assert.deepEqual(checkedDecision(req),
      {kind:'select-action',token:'active-tool'});
  }
});

test('rank29 complete actor-choice transcript: Tag Call → enhanced G&H → Thunder+DCE → Volt Cyclone', () => {
  // This drives the real policy and protocol at every choice, but the
  // transitions are intentionally scripted, not a claimed native replay.
  const start=rootRequest({
    ownHand:['Tag Call CEC 206',"Trainers' Mail ROS 92",
      'Camping Gear BST 122','Speed Lightning Energy RCL 173'],
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77')}),
    items:[
      action('tag','play-card','Tag Call CEC 206',{cardType:'item'}),
      action('speed','play-card','Speed Lightning Energy RCL 173',{cardType:'energy'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(start),{kind:'select-action',token:'tag'});

  const tagSearch=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Tag Call CEC 206','Tag Call'),
    publicMetadata:multiMetadata(0,2),
    choices:[
      cardChoice('gh','Guzma & Hala CEC 193'),
      cardChoice('cc','Cynthia & Caitlin CEC 189'),
      {token:'empty',kind:'empty-selection'}
    ]
  });
  assert.deepEqual(checkedDecision(tagSearch),
    {kind:'select-choices',tokens:['gh','cc']});

  const ghRoot=rootRequest({
    ownHand:['Guzma & Hala CEC 193','Cynthia & Caitlin CEC 189',
      "Trainers' Mail ROS 92",'Camping Gear BST 122',
      'Speed Lightning Energy RCL 173'],
    items:[
      action('gh','play-card','Guzma & Hala CEC 193',{cardType:'supporter'}),
      action('speed','play-card','Speed Lightning Energy RCL 173',{cardType:'energy'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(ghRoot),{kind:'select-action',token:'gh'});

  const mode=promptRequest({
    promptType:'SelectOptionPrompt',
    source:actorChoiceSource('Guzma & Hala CEC 193','Guzma & Hala'),
    publicMetadata:{selectionType:'option',count:2,allowCancel:false},
    observation:{
      ownHand:['Cynthia & Caitlin CEC 189',"Trainers' Mail ROS 92",
        'Camping Gear BST 122','Speed Lightning Energy RCL 173']
    },
    choices:[
      {token:'free',kind:'option',label:'Stadium only',publicMetadata:{choiceIndex:0}},
      {token:'enhanced',kind:'option',label:'Pay two',publicMetadata:{choiceIndex:1}}
    ]
  });
  assert.deepEqual(checkedDecision(mode),{kind:'select-choice',token:'enhanced'});

  const pay=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Guzma & Hala CEC 193','Guzma & Hala'),
    publicMetadata:multiMetadata(2,2),
    observation:{
      ownHand:['Cynthia & Caitlin CEC 189',"Trainers' Mail ROS 92",
        'Camping Gear BST 122','Speed Lightning Energy RCL 173']
    },
    choices:[
      cardChoice('speed','Speed Lightning Energy RCL 173','hand','actor'),
      cardChoice('mail',"Trainers' Mail ROS 92",'hand','actor'),
      cardChoice('camp','Camping Gear BST 122','hand','actor'),
      cardChoice('cc','Cynthia & Caitlin CEC 189','hand','actor')
    ]
  });
  assert.deepEqual(checkedDecision(pay),
    {kind:'select-choices',tokens:['mail','camp']});

  const search=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Guzma & Hala CEC 193','Guzma & Hala'),
    publicMetadata:multiMetadata(0,3),
    observation:{ownPublic:player({active:pokemon('Iron Thorns ex TWM 77')})},
    choices:[
      cardChoice('mountain','Thunder Mountain ♢ LOT 191'),
      cardChoice('dce','Double Colorless Energy SUM 136'),
      cardChoice('jammer','Tool Jammer BST 136'),
      {token:'empty',kind:'empty-selection'}
    ]
  });
  assert.deepEqual(checkedDecision(search),
    {kind:'select-choices',tokens:['dce','mountain']});

  const held=["Cynthia & Caitlin CEC 189",'Speed Lightning Energy RCL 173',
    'Thunder Mountain ♢ LOT 191','Double Colorless Energy SUM 136'];
  const thunderRoot=rootRequest({
    ownHand:held,
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77')}),
    items:[
      action('speed','play-card','Speed Lightning Energy RCL 173',{cardType:'energy'}),
      action('thunder','play-card','Thunder Mountain ♢ LOT 191',{cardType:'stadium'}),
      action('dce','play-card','Double Colorless Energy SUM 136',{cardType:'energy'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(thunderRoot),{kind:'select-action',token:'thunder'});

  const attachRoot=rootRequest({
    ownHand:held.filter(x=>!x.includes('Thunder Mountain')),
    ownPublic:player({
      active:pokemon('Iron Thorns ex TWM 77'),
      stadium:['Thunder Mountain ♢ LOT 191']
    }),
    items:[
      action('speed','play-card','Speed Lightning Energy RCL 173',{cardType:'energy'}),
      action('dce','play-card','Double Colorless Energy SUM 136',{cardType:'energy'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(attachRoot),{kind:'select-action',token:'dce'});

  const attackRoot=rootRequest({
    ownHand:held.filter(x=>!x.includes('Thunder Mountain')&&!x.includes('Double Colorless')),
    ownPublic:player({
      active:pokemon('Iron Thorns ex TWM 77',
        {energies:['Double Colorless Energy SUM 136']}),
      stadium:['Thunder Mountain ♢ LOT 191']
    }),
    opponentPublic:player({active:pokemon('Shadow Rider Calyrex VMAX CRE 75',
      {hp:320})}),
    ownTurnResources:turnResources({energyPlayedTurn:true,supporterPlayedTurn:1}),
    items:[
      action('attack','attack','Iron Thorns ex TWM 77',{},
        {attackName:'Volt Cyclone'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(attackRoot),{kind:'select-action',token:'attack'});
});

test('rank29 hidden-hand Eri and Team Skull use public hand count and visible archetype, not private cards', () => {
  for(const name of ['Eri TEF 146','Team Skull Grunt SUM 133','Sidney FST 241']) {
    const req=rootRequest({
      ownHand:[name],
      opponentPublic:player({
        active:pokemon('Shadow Rider Calyrex VMAX CRE 75'),
        handCount:8,publicHand:null
      }),
      items:[
        action('disrupt','play-card',name,{cardType:'supporter'}),
        {token:'pass',kind:'pass'}
      ]
    });
    assert.deepEqual(checkedDecision(req),
      {kind:'select-action',token:'disrupt'});
  }
});

test('revealed zero-target hand overrides Eri and Team Skull public-size prior', () => {
  for(const name of ['Eri TEF 146','Team Skull Grunt SUM 133']) {
    const req=rootRequest({
      ownHand:[name],
      opponentPublic:player({
        active:pokemon('Shadow Rider Calyrex VMAX CRE 75'),
        handCount:6,
        publicHand:[
          'Guzma BUS 115','Lillie s Determination MEG 119',
          'Iono PAL 185','Raihan EVS 152','Teammates PRC 141','Acerola BUS 112'
        ]
      }),
      items:[
        action('disrupt','play-card',name,{cardType:'supporter'}),
        {token:'pass',kind:'pass'}
      ]
    });
    assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'pass'});
  }
});

test('unrecognized opposing archetype with hidden hand is never granted invented card-type knowledge', () => {
  const req=rootRequest({
    ownHand:['Eri TEF 146'],
    opponentPublic:player({
      active:pokemon('Iron Thorns ex TWM 77'),
      handCount:8,publicHand:null
    }),
    items:[
      action('eri','play-card','Eri TEF 146',{cardType:'supporter'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'pass'});
});

function nativeRevealedOpponentChoice(token,printing){
  return {
    ...cardChoice(token,printing,'hand','opponent'),
    publicMetadata:{sourceZone:'hand',ownerSeat:'opponent',isOwnerVisible:true,
      selectionIndex:Number(token.replace(/\D/g,''))||0,selectedCount:1}
  };
}
function revealedHandMetadata(){
  return {...multiMetadata(0,2),sourceZone:'hand',ownerSeat:'opponent',
    isOwnerVisible:true};
}

test('Eri native revealed opponent Items prioritize Unfair Stamp, VS Seeker and preserve zero-count option',()=>{
  for(const seat of [0,1]){
    const req=promptRequest({
      seat,promptType:'ChooseCardsPrompt',
      source:actorChoiceSource('Eri TEF 146','Eri'),
      publicMetadata:revealedHandMetadata(),
      choices:[
        nativeRevealedOpponentChoice('card0',"Trainer's Mail ROS 92"),
        nativeRevealedOpponentChoice('card1','Unfair Stamp TWM 165'),
        nativeRevealedOpponentChoice('card2','VS Seeker PHF 109'),
        {token:'empty',kind:'empty-selection'}
      ]
    });
    assert.deepEqual(checkedDecision(req,seat),{
      kind:'select-choices',tokens:['card1','card2']});
  }
});
test('Sidney native opponent-hand effect includes actual Stadium among Special and Tool',()=>{
  const req=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Sidney FST 241','Sidney'),
    publicMetadata:revealedHandMetadata(),
    choices:[
      nativeRevealedOpponentChoice('card0','Sky Field ROS 89'),
      nativeRevealedOpponentChoice('card1','Float Stone BKT 137'),
      nativeRevealedOpponentChoice('card2','Double Colorless Energy SUM 136'),
      {token:'empty',kind:'empty-selection'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['card2','card1']});
});
test('Team Skull Grunt selects revealed opponent Basic and Special Energy only',()=>{
  const req=promptRequest({
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Team Skull Grunt SUM 133','Team Skull Grunt'),
    publicMetadata:revealedHandMetadata(),
    choices:[
      nativeRevealedOpponentChoice('card0','Psychic Energy SVE 5'),
      nativeRevealedOpponentChoice('card1','Double Colorless Energy SUM 136'),
      {token:'empty',kind:'empty-selection'}
    ]
  });
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['card0','card1']});
});
test('unrevealed Eri opponent hand or forged owner-seat and source cannot pass',()=>{
  const choice=nativeRevealedOpponentChoice('card0','Unfair Stamp TWM 165');
  const base={
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Eri TEF 146','Eri'),
    choices:[choice,{token:'empty',kind:'empty-selection'}]
  };
  for(const badMeta of [
    {...revealedHandMetadata(),isOwnerVisible:false},
    {...revealedHandMetadata(),ownerSeat:'actor'},
    {...revealedHandMetadata(),isSecret:true},
    {...revealedHandMetadata(),sourceZone:'deck'}
  ]){
    const req=promptRequest({...base,publicMetadata:badMeta});
    assert.deepEqual(checkedDecision(req),
      {kind:'abstain',reasonCode:'UNTRUSTED_CARD_SELECTION'});
  }
  const forged=promptRequest({
    ...base,
    publicMetadata:revealedHandMetadata(),
    source:actorChoiceSource('Iono PAL 185','Eri')
  });
  assert.notEqual(checkedDecision(forged).kind,'select-choices');
});


function voltChoice(token, printing, benchIndex, owner='actor', sourceZone='active') {
  return {
    token, kind:'energy',printing,label:'Move '+printing+' to Bench '+(benchIndex+1),
    publicMetadata:{
      ownerSeat:owner,sourceZone,isOwnerVisible:true,
      energyType:'SPECIAL',zone:'bench',benchIndex,selectedCount:1
    }
  };
}

test('Volt Cyclone energy-attachment chooses Speed over DCE while preserving active accelerator, both seats', () => {
  for(const seat of [0,1]) {
    const req=promptRequest({
      seat,
      promptType:'AttachEnergyPrompt',
      source:actorChoiceSource('Iron Thorns ex TWM','Volt Cyclone'),
      publicMetadata:{
        selectionType:'energy-attachment',sourceZone:'active',ownerSeat:'actor',
        zone:'bench',isOwnerVisible:true,minimumCount:1,maximumCount:1,
        allowCancel:false,count:2
      },
      observation:{ownPublic:player({
        active:pokemon('Iron Thorns ex TWM 77',{energies:[
          'Speed Lightning Energy RCL 173','Double Colorless Energy SUM 136'
        ]}),
        bench:[pokemon('Iron Thorns ex TWM 77')]
      })},
      choices:[
        voltChoice('dce','Double Colorless Energy SUM 136',0),
        voltChoice('speed','Speed Lightning Energy RCL 173',0)
      ]
    });
    assert.deepEqual(checkedDecision(req,seat),{kind:'select-choice',token:'speed'});
  }
});

test('Volt Cyclone energy-attachment rejects spoofed source, false owner and nonexistent target', () => {
  const base={
    promptType:'AttachEnergyPrompt',
    source:actorChoiceSource('Iron Thorns ex TWM','Volt Cyclone'),
    publicMetadata:{
      selectionType:'energy-attachment',sourceZone:'active',ownerSeat:'actor',
      zone:'bench',isOwnerVisible:true,minimumCount:1,maximumCount:1,
      allowCancel:false,count:1
    },
    observation:{ownPublic:player({
      active:pokemon('Iron Thorns ex TWM 77'),
      bench:[pokemon('Iron Thorns ex TWM 77')]
    })},
    choices:[voltChoice('dce','Double Colorless Energy SUM 136',0)]
  };
  assert.deepEqual(checkedDecision(promptRequest(base)),
    {kind:'select-choice',token:'dce'});
  for(const changes of [
    {source:actorChoiceSource('Handheld Fan TWM','Volt Cyclone')},
    {source:actorChoiceSource('Iron Thorns ex TWM','Other Move')},
    {publicMetadata:{...base.publicMetadata,sourceZone:'hand'}},
    {choices:[voltChoice('dce','Double Colorless Energy SUM 136',0,'opponent')]},
    {choices:[voltChoice('dce','Double Colorless Energy SUM 136',3)]},
    {choices:[voltChoice('dce','Double Colorless Energy SUM 136',0,'actor','discard')]}
  ]){
    assert.equal(checkedDecision(promptRequest({...base,...changes})).kind,'abstain');
  }
});


test('Peonia requires a certifiably Prized singleton, not merely a certified K1 deck', () => {
  const hand=['Peonia CRE 149',"Trainers' Mail ROS 92",
    'Camping Gear BST 122','Captivating Poké Puff STS 99'];
  const items=[
    action('peonia','play-card','Peonia CRE 149',{cardType:'supporter'}),
    {token:'pass',kind:'pass'}
  ];
  const dce='Double Colorless Energy SUM 136';
  const thunder='Thunder Mountain ♢ LOT 191';
  const megaton='Megaton Blower SSP 182';
  const k1=(entries)=>({epoch:2,exactMembershipKnown:true,
    knownPrintings:entries.map(printing=>({printing,copies:1})),
    invalidationReason:null});
  const base={ownHand:hand,items};
  assert.deepEqual(checkedDecision(rootRequest({...base,
    ownerK1:k1([dce,thunder,megaton])
  })),{kind:'select-action',token:'pass'});
  assert.deepEqual(checkedDecision(rootRequest({...base,
    ownerK1:k1([thunder,megaton]),
    ownPublic:player({active:pokemon(),discard:[dce]})
  })),{kind:'select-action',token:'pass'});
  assert.deepEqual(checkedDecision(rootRequest({...base,
    ownerK1:k1([thunder,megaton]),
    ownPublic:player({active:pokemon(),lostZone:[dce]})
  })),{kind:'select-action',token:'pass'});
  assert.deepEqual(checkedDecision(rootRequest({...base,
    ownerK1:k1([thunder,megaton]),
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77',{energies:[dce]})})
  })),{kind:'select-action',token:'pass'});
  assert.deepEqual(checkedDecision(rootRequest({...base,
    ownerK1:k1([thunder,megaton])
  })),{kind:'select-action',token:'peonia'});
  assert.deepEqual(checkedDecision(rootRequest({...base,
    ownerK1:{...k1([thunder,megaton]),exactMembershipKnown:false}
  })),{kind:'select-action',token:'pass'});
});

test('Peonia rescues confirmed Prized Thunder when DCE remains in deck, but ignores unused Megaton', () => {
  const base={
    ownHand:['Peonia CRE 149',"Trainers' Mail ROS 92",
      'Camping Gear BST 122','Captivating Poké Puff STS 99'],
    items:[
      action('peonia','play-card','Peonia CRE 149',{cardType:'supporter'}),
      {token:'pass',kind:'pass'}
    ]
  };
  const k1=(entries)=>({epoch:2,exactMembershipKnown:true,
    knownPrintings:entries.map(printing=>({printing,copies:1})),invalidationReason:null});
  assert.deepEqual(checkedDecision(rootRequest({...base,
    ownerK1:k1(['Double Colorless Energy SUM 136','Megaton Blower SSP 182'])
  })),{kind:'select-action',token:'peonia'});
  assert.deepEqual(checkedDecision(rootRequest({...base,
    ownerK1:k1(['Double Colorless Energy SUM 136','Thunder Mountain ♢ LOT 191'])
  })),{kind:'select-action',token:'pass'});
});


test('Guzma prizes a vulnerable Bench when a powered Iron Thorns can switch in',()=>{
  const items=[
    action('guzma','play-card','Guzma BUS 115',{cardType:'supporter'}),
    action('plumeria','play-card','Plumeria BUS 120',{cardType:'supporter'}),
    {token:'pass',kind:'pass'}
  ];
  const active=pokemon('Iron Thorns ex TWM 77');
  const opponent=player({
    active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{energies:['Psychic Energy CRE 232']}),
    bench:[pokemon('Tapu Lele-GX GRI 60',{hp:170,damage:40,retreatCost:[]})]
  });
  const ready=player({
    active,
    bench:[pokemon('Iron Thorns ex TWM 77',{energies:['Double Colorless Energy SUM 136']})],
    stadium:['Thunder Mountain ♢ LOT 191']
  });
  const req=rootRequest({
    ownHand:['Guzma BUS 115','Plumeria BUS 120',
      "Trainers' Mail ROS 92",'Captivating Poké Puff STS 99'],
    ownPublic:ready,opponentPublic:opponent,items
  });
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'guzma'});
  const unready=player({
    active,bench:[pokemon('Iron Thorns ex TWM 77',{energies:['Double Colorless Energy SUM 136']})]
  });
  assert.notEqual(checkedDecision(rootRequest({
    ownHand:['Guzma BUS 115','Plumeria BUS 120',
      "Trainers' Mail ROS 92",'Captivating Poké Puff STS 99'],
    ownPublic:unready,opponentPublic:opponent,items
  })).token,'guzma');
});

test('Guzma target selection ranks a visible KO above high-retreat trap, both seats',()=>{
  for(const seat of [0,1]) {
    const req=promptRequest({
      seat,promptType:'ChoosePokemonPrompt',
      source:actorChoiceSource('Guzma BUS 115','Guzma'),
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
        allowCancel:false,isSecret:false},
      observation:{
        ownPublic:player({
          active:pokemon('Iron Thorns ex TWM 77'),
          bench:[pokemon('Iron Thorns ex TWM 77',{
            energies:['Double Colorless Energy SUM 136']})],
          stadium:['Thunder Mountain ♢ LOT 191']
        }),
        opponentPublic:player({
          active:pokemon('Shadow Rider Calyrex VMAX CRE 75'),
          bench:[
            pokemon('Tapu Lele-GX GRI 60',{hp:170,damage:40,retreatCost:[]}),
            pokemon('Snorlax UNB 158',{hp:230,retreatCost:
              ['Colorless','Colorless','Colorless'],energies:[]})
          ]
        })
      },
      choices:[
        pokemonChoice('trap','Snorlax UNB 158','opponent','bench',1),
        pokemonChoice('ko','Tapu Lele-GX GRI 60','opponent','bench',0)
      ]
    });
    assert.deepEqual(checkedDecision(req,seat),
      {kind:'select-choices',tokens:['ko']});
  }
});

test('Guzma own switch selects electrically ready Benched Thorns over colorless-only stash',()=>{
  const req=promptRequest({
    promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Guzma BUS 115','Guzma'),
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false},
    observation:{ownPublic:player({
      active:pokemon('Iron Thorns ex TWM 77'),
      bench:[
        pokemon('Iron Thorns ex TWM 77',{energies:[
          'Double Colorless Energy SUM 136','Capture Energy RCL 171'
        ]}),
        pokemon('Iron Thorns ex TWM 77',{energies:[
          'Speed Lightning Energy RCL 173','Capture Energy RCL 171',
          'Spiky Energy JTG 159'
        ]})
      ]
    })},
    choices:[
      pokemonChoice('stash','Iron Thorns ex TWM 77','actor','bench',0),
      pokemonChoice('ready','Iron Thorns ex TWM 77','actor','bench',1)
    ]
  });
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['ready']});
});


function checkedAudited(request, seat=0, policy=makePolicy(seat)) {
  const init = {
    schema:protocol.INIT_SCHEMA,type:'init',role:'opponent',seat,
    policyVersion:POLICY_VERSION,bundleSha256:'b'.repeat(64),config
  };
  const validated=protocol.validateRequest(request,init,request.sequence,new Set());
  const result=policy.decideWithAudit(request);
  protocol.validateDecision(result.decision,validated.prompt,validated.actionTokens);
  protocol.validatePolicyAudit(result.policyAudit,request,result.decision,POLICY_VERSION);
  return result;
}

test('rank29 V3 policyAudit records actual root scores, input order, and selected root token',()=>{
  for(const seat of [0,1]) {
    const policy=makePolicy(seat);
    const req=rootRequest({
      seat,items:[
        action('low','play-card','Spiky Energy JTG 159',{cardType:'energy'},
          {targetPrinting:'Iron Thorns ex TWM 77'}),
        action('high','play-card','Speed Lightning Energy RCL 173',
          {cardType:'energy'},{targetPrinting:'Iron Thorns ex TWM 77'}),
        {token:'pass',kind:'pass'}
      ],
      ownHand:['Speed Lightning Energy RCL 173','Spiky Energy JTG 159']
    });
    const {decision,policyAudit:audit}=checkedAudited(req,seat,policy);
    assert.deepEqual(decision,{kind:'select-action',token:'high'});
    assert.equal(audit.schema,protocol.POLICY_AUDIT_SCHEMA);
    assert.equal(audit.selectionRuleCode,'RANK29_SCORED_SELECTION');
    assert.equal(audit.tieBreakCode,'FRONTIER_ORDER');
    assert.deepEqual(audit.selectedTokens,['high']);
    assert.deepEqual(audit.evaluations.map(row=>row.token),['low','high','pass']);
    assert.ok(audit.evaluations.every(row=>row.status==='scored'&&
      typeof row.score==='number'&&Number.isFinite(row.score)));
    assert.ok(audit.evaluations[1].score>audit.evaluations[0].score);
  }
});

test('rank29 V3 policyAudit covers opposing Fan prompt and legal empty selection',()=>{
  const policy=makePolicy();
  const fields={
    promptType:'AttachEnergyPrompt',
    source:actorChoiceSource('Handheld Fan TWM','Handheld Fan'),
    publicMetadata:{selectionType:'energy-attachment',count:2,
      minimumCount:0,maximumCount:1,allowCancel:false,
      sourceZone:'active',ownerSeat:'opponent',isOwnerVisible:true,zone:'bench'},
    observation:{opponentPublic:player({
      active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{energies:[
        'Double Colorless Energy SUM 136'
      ]}),
      bench:[pokemon('Tapu Lele-GX GRI 60')]
    })},
    choices:[
      {token:'move',kind:'energy',printing:'Double Colorless Energy SUM 136',
        publicMetadata:{sourceZone:'active',ownerSeat:'opponent',isOwnerVisible:true,
          zone:'bench',benchIndex:0,selectedCount:1}},
      {token:'empty',kind:'empty-selection',label:'Move no Energy'}
    ]
  };
  const withMove=checkedAudited(promptRequest(fields),0,policy);
  assert.deepEqual(withMove.decision,{kind:'select-choice',token:'move'});
  assert.equal(withMove.policyAudit.evaluations[0].status,'scored');
  assert.equal(withMove.policyAudit.evaluations[1].status,'scored');
  assert.equal(withMove.policyAudit.evaluations[1].score,0);
  const withoutMove=checkedAudited(promptRequest({
    ...fields,choices:[fields.choices[1]],
    publicMetadata:{...fields.publicMetadata,count:1},
    observation:{opponentPublic:player({bench:[pokemon('Tapu Lele-GX GRI 60')]})}
  }),0,policy);
  assert.deepEqual(withoutMove.decision,{kind:'select-choice',token:'empty'});
  assert.equal(withoutMove.policyAudit.selectionRuleCode,'RANK29_DIRECT_SELECTION');
  assert.equal(withoutMove.policyAudit.evaluations[0].status,'rule-selected');
  assert.equal(withoutMove.policyAudit.evaluations[0].reasonCode,
    'SELECTED_BY_ZERO_SCORE_FALLBACK');
});

test('rank29 V3 policyAudit resolves engine setup and abstention without replayed score state',()=>{
  const policy=makePolicy();
  const setup=promptRequest({
    promptType:'ConfirmPrompt',
    source:actorChoiceSource(null,'GO_FIRST'),
    description:'GO_FIRST',
    observation:{phase:1,globalTurn:0},
    publicMetadata:{selectionType:'confirm',minimumCount:1,
      maximumCount:1,allowCancel:false},
    choices:[
      {token:'yes',kind:'confirm',label:'Yes',
        publicMetadata:{choiceIndex:0}},
      {token:'no',kind:'confirm',label:'No',
        publicMetadata:{choiceIndex:1}}
    ]
  });
  // Deciding on a valid engine setup prompt is direct rather than scored.
  const state=checkedAudited(setup,0,policy);
  assert.equal(state.policyAudit.evaluations.length,2);
  assert.equal(state.policyAudit.evaluations.filter(row=>
    row.status==='rule-selected').length,1);
  const nothing=rootRequest({items:[]});
  const abstain=checkedAudited(nothing,0,policy);
  assert.equal(abstain.decision.kind,'abstain');
  assert.deepEqual(abstain.policyAudit.evaluations,[]);
  assert.equal(abstain.policyAudit.selectionRuleCode,'RANK29_ABSTAIN');
});


test('Guzma sees TAG TEAM GX as three Prizes and chooses a final-three knockout',()=>{
  const req=promptRequest({
    promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Guzma BUS 115','Guzma'),
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false},
    observation:{
      ownPublic:player({
        prizeCount:3,
        active:pokemon('Iron Thorns ex TWM 77'),
        bench:[pokemon('Iron Thorns ex TWM 77',{
          energies:['Double Colorless Energy SUM 136']})],
        stadium:['Thunder Mountain ♢ LOT 191']
      }),
      opponentPublic:player({
        active:pokemon('Shadow Rider Calyrex VMAX CRE 75'),
        bench:[
          pokemon('Tapu Lele-GX GRI 60',{hp:170,damage:40}),
          pokemon('Trevenant & Dusknoir-GX SMP 180',{
            hp:270,damage:160,subtypes:['TAG_TEAM','GX']})
        ]
      })
    },
    choices:[
      pokemonChoice('two-prize','Tapu Lele-GX GRI 60','opponent','bench',0),
      pokemonChoice('winning-three','Trevenant & Dusknoir-GX SMP 180',
        'opponent','bench',1)
    ]
  });
  assert.deepEqual(checkedDecision(req),
    {kind:'select-choices',tokens:['winning-three']});
});


test('Guzma refrains from false public wall knockout: HP Tools, printed shields, -40 Resistance',()=>{
  const ready=player({
    active:pokemon('Iron Thorns ex TWM 77'),
    bench:[pokemon('Iron Thorns ex TWM 77',{
      energies:['Double Colorless Energy SUM 136']})],
    stadium:['Thunder Mountain ♢ LOT 191']
  });
  const baseAction=[
    action('guzma','play-card','Guzma BUS 115',{cardType:'supporter'}),
    {token:'pass',kind:'pass'}
  ];
  const potential=pokemon('Tapu Lele-GX GRI 60',{hp:170,damage:40,retreatCost:[]});
  const protectedCape=pokemon('Tapu Lele-GX GRI 60',{
    hp:170,damage:40,tools:["Hero's Cape TEF 152"],retreatCost:[]
  });
  const protectedAbility=pokemon('Mimikyu GRI 58',{
    hp:70,damage:0,abilities:['Safeguard'],retreatCost:[]
  });
  protectedAbility.abilityDetails[0].text =
    "Prevent all damage done to this Pokémon by attacks from your opponent's Pokémon ex.";
  const resistance=pokemon('Resistant Basic PAR 9',{hp:110,damage:0,
    resistance:[{type:'Lightning',value:'-40'}],retreatCost:[]});
  const reqFor=target=>rootRequest({
    ownHand:['Guzma BUS 115',"Trainers' Mail ROS 92"],
    ownPublic:ready,
    opponentPublic:player({
      active:pokemon('Shadow Rider Calyrex VMAX CRE 75'),
      bench:[target]
    }),
    items:baseAction
  });
  assert.deepEqual(checkedDecision(reqFor(potential)),
    {kind:'select-action',token:'guzma'});
  for(const target of [protectedCape,protectedAbility,resistance]){
    assert.deepEqual(checkedDecision(reqFor(target)),
      {kind:'select-action',token:'pass'});
  }
});

test('Guzma target ranks unprotected 2-Prize KO over public HP Cape or prevention Ability',()=>{
  const cape=pokemon('Tapu Lele-GX GRI 60',{
    hp:170,damage:40,tools:["Hero's Cape TEF 152"]
  });
  const shield=pokemon('Mimikyu GRI 58',{
    hp:70,abilities:['Safeguard']
  });
  shield.abilityDetails[0].text='Prevent all damage done to this Pokémon by attacks.';
  const req=promptRequest({
    promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Guzma BUS 115','Guzma'),
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false},
    observation:{
      ownPublic:player({
        active:pokemon('Iron Thorns ex TWM 77'),
        bench:[pokemon('Iron Thorns ex TWM 77',{
          energies:['Double Colorless Energy SUM 136']})],
        stadium:['Thunder Mountain ♢ LOT 191']
      }),
      opponentPublic:player({
        active:pokemon('Shadow Rider Calyrex VMAX CRE 75'),
        bench:[cape,shield,pokemon('Dedenne-GX UNB 57',{hp:160,damage:30})]
      })
    },
    choices:[
      pokemonChoice('cape','Tapu Lele-GX GRI 60','opponent','bench',0),
      pokemonChoice('shield','Mimikyu GRI 58','opponent','bench',1),
      pokemonChoice('dedenne','Dedenne-GX UNB 57','opponent','bench',2)
    ]
  });
  assert.deepEqual(checkedDecision(req),
    {kind:'select-choices',tokens:['dedenne']});
});


test('VS Seeker connector prioritizes actual currently winning Guzma over Flare and Lusamine',()=>{
  for(const seat of [0,1]){
    const base={
      seat,promptType:'ChooseCardsPrompt',
      source:actorChoiceSource('VS Seeker PHF 109','VS Seeker'),
      publicMetadata:multiMetadata(1,1),
      choices:[
        cardChoice('flare','Team Flare Grunt XY 129','discard','actor'),
        cardChoice('guzma','Guzma BUS 115','discard','actor'),
        cardChoice('lusamine','Lusamine CIN 96','discard','actor')
      ]
    };
    const req=promptRequest({...base,observation:{
      ownPublic:player({
        active:pokemon('Iron Thorns ex TWM 77'),
        bench:[pokemon('Iron Thorns ex TWM 77',{energies:[
          'Double Colorless Energy SUM 136'
        ]})],
        stadium:['Thunder Mountain ♢ LOT 191'],
        discard:['Guzma BUS 115','Team Flare Grunt XY 129','Lusamine CIN 96']
      }),
      opponentPublic:player({
        active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{
          energies:['Psychic Energy CRE 232']}),
        bench:[pokemon('Trevenant & Dusknoir-GX SMP 180',{
          hp:270,damage:160,subtypes:['TAG_TEAM','GX']})]
      })
    }});
    assert.deepEqual(checkedDecision(req,seat),
      {kind:'select-choices',tokens:['guzma']});
    const noReady=promptRequest({...base,observation:{
      ownPublic:player({
        active:pokemon('Iron Thorns ex TWM 77'),
        bench:[pokemon('Iron Thorns ex TWM 77')],
        discard:['Guzma BUS 115','Team Flare Grunt XY 129']
      }),
      opponentPublic:player({
        active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{
          energies:['Psychic Energy CRE 232']}),
        bench:[pokemon('Trevenant & Dusknoir-GX SMP 180',{
          hp:270,damage:160,subtypes:['TAG_TEAM','GX']})]
      })
    }});
    assert.deepEqual(checkedDecision(noReady,seat),
      {kind:'select-choices',tokens:['flare']});
  }
});
