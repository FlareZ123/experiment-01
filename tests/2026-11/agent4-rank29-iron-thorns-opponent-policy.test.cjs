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
      // The choice ordinal is intentionally independent of its physical
      // Bench position; native projection reports both distinct fields.
      selectionIndex: index,
      selectedCount: 1,
      selectionType: 'pokemon',
      ownerSeat: owner,
      targetZone: zone,
      ...(zone==='bench'?{benchIndex:index}:{slotIndex:0}),
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

test('Peonia native exact-three Prize slots choose owned face-down filtered indices, not identities, both seats', () => {
  for(const seat of [0,1]){
    const req=promptRequest({
      seat,promptType:'ChoosePrizePrompt',
      source:actorChoiceSource('Peonia CRE 149','Peonia'),
      publicMetadata:{
        selectionType:'prize-slots',count:6,requiredCount:3,
        allowCancel:false,isSecret:false,sourceZone:'prizes',
        ownerSeat:'actor',isOwnerVisible:false
      },
      choices:[5,2,0,1,4,3].map(i=>({
        token:'slot'+i,kind:'prize',label:'Your Prize slot '+(i+1),
        publicMetadata:{ownerSeat:'actor',sourceZone:'prizes',
          isOwnerVisible:false,selectionIndex:i,selectedCount:1,requiredCount:3}
      }))
    });
    assert.deepEqual(checkedDecision(req,seat),{
      kind:'select-choices',tokens:['slot0','slot1','slot2']
    });
    const incorrect=promptRequest({
      seat,promptType:'ChoosePrizePrompt',
      source:actorChoiceSource('Peonia CRE 149','Peonia'),
      publicMetadata:{...req.prompt.publicMetadata,ownerSeat:'opponent'},
      choices:req.prompt.choices
    });
    assert.deepEqual(checkedDecision(incorrect,seat),{
      kind:'abstain',reasonCode:'UNSUPPORTED_PRIZE_SELECTION'
    });
  }
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
      publicMetadata:{selectionType:'energy-attachment',count:2,
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
            zone:'bench',benchIndex:0,isOwnerVisible:true,selectedCount:1}}
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
    publicMetadata:{selectionType:'card-combination',count:3,minimumCount:0,
      maximumCount:1,allowCancel:false,sourceZone:'deck',
      ownerSeat:'actor',isOwnerVisible:true},
    observation:{ownHand:['Guzma & Hala CEC 193','Thunder Mountain ♢ LOT 191']},
    choices:[
      ...[
        cardChoice('plumeria','Plumeria BUS 120'),
        cardChoice('dce','Double Colorless Energy SUM 136'),
        cardChoice('jammer','Tool Jammer BST 136')
      ].map((choice,index)=>({...choice,publicMetadata:{
        ...choice.publicMetadata,isOwnerVisible:true,
        selectionIndex:index,selectedCount:1}})),
      {token:'empty',kind:'empty-selection',label:'Choose no cards'}
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
      active:pokemon('Regidrago VSTAR SIT 136'),
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
    publicMetadata:{selectionType:'energy-attachment',count:1,
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
          zone:'bench',benchIndex:0,selectedCount:1}}
    ]
  };
  const withMove=checkedAudited(promptRequest(fields),0,policy);
  assert.deepEqual(withMove.decision,{kind:'select-choice',token:'move'});
  assert.equal(withMove.policyAudit.evaluations[0].status,'scored');
  assert.equal(withMove.policyAudit.evaluations.length,1);
  const withoutMove=checkedAudited(promptRequest({
    ...fields,choices:[{token:'empty',kind:'empty-selection',label:'Move no Energy'}],
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


test('VS Seeker winning gust root chain beats premature active KO but only with prepared Bench',()=>{
  const base={
    ownHand:['VS Seeker PHF 109'],
    opponentPublic:player({
      active:pokemon('Dedenne-GX UNB 57',{hp:160,damage:30}),
      bench:[pokemon('Trevenant & Dusknoir-GX SMP 180',{
        hp:270,damage:160,subtypes:['TAG_TEAM','GX']})]
    }),
    items:[
      action('attack','attack','Iron Thorns ex TWM 77',{},
        {attackName:'Volt Cyclone'}),
      action('seeker','play-card','VS Seeker PHF 109',{cardType:'item'}),
      {token:'pass',kind:'pass'}
    ]
  };
  const ready=rootRequest({...base,
    ownPublic:player({
      prizeCount:3,
      active:pokemon('Iron Thorns ex TWM 77',{
        energies:['Double Colorless Energy SUM 136']}),
      bench:[pokemon('Iron Thorns ex TWM 77',{
        energies:['Double Colorless Energy SUM 136']})],
      discard:['Guzma BUS 115'],
      stadium:['Thunder Mountain ♢ LOT 191']
    })
  });
  assert.deepEqual(checkedDecision(ready),
    {kind:'select-action',token:'seeker'});
  const unready=rootRequest({...base,
    ownPublic:player({
      prizeCount:3,
      active:pokemon('Iron Thorns ex TWM 77',{
        energies:['Double Colorless Energy SUM 136']}),
      bench:[pokemon('Iron Thorns ex TWM 77')],
      discard:['Guzma BUS 115'],
      stadium:['Thunder Mountain ♢ LOT 191']
    })
  });
  assert.deepEqual(checkedDecision(unready),
    {kind:'select-action',token:'attack'});
  const alreadySupported=rootRequest({...base,
    ownHand:['VS Seeker PHF 109','Guzma BUS 115'],
    ownPublic:player({
      prizeCount:3,
      active:pokemon('Iron Thorns ex TWM 77',{
        energies:['Double Colorless Energy SUM 136']}),
      bench:[pokemon('Iron Thorns ex TWM 77',{
        energies:['Double Colorless Energy SUM 136']})],
      discard:['Guzma BUS 115'],
      stadium:['Thunder Mountain ♢ LOT 191']
    })
  });
  assert.deepEqual(checkedDecision(alreadySupported),
    {kind:'select-action',token:'attack'});
});


test('Volt Cyclone direct attack calculation respects weakness and resistance before ending the turn',()=>{
  const own=player({
    active:pokemon('Iron Thorns ex TWM 77',{
      energies:['Double Colorless Energy SUM 136']}),
    stadium:['Thunder Mountain ♢ LOT 191']
  });
  const actions=[
    action('ceremony','use-stadium',"Player's Ceremony SP 127",{
      stadiumPrinting:"Player's Ceremony SP 127"
    }),
    action('attack','attack','Iron Thorns ex TWM 77',{},
      {attackName:'Volt Cyclone'}),
    {token:'pass',kind:'pass'}
  ];
  const makeRequest=target=>rootRequest({
    ownHand:["Player's Ceremony SP 127"],ownPublic:own,
    opponentPublic:player({active:target}),items:actions
  });
  // 140 × 2 = 280, not a harmless 140 into a 230-HP Water weak target.
  const weak=pokemon('Water Basic EVS 10',{hp:230,damage:0,
    weakness:[{type:'Lightning',value:'×2'}]});
  assert.deepEqual(checkedDecision(makeRequest(weak)),
    {kind:'select-action',token:'attack'});
  // 140 - 40 = 100 into 110 remaining HP; drawing is preferable.
  const resistant=pokemon('Resistant Basic PAR 9',{hp:110,damage:0,
    resistance:[{type:'Lightning',value:'-40'}]});
  assert.deepEqual(checkedDecision(makeRequest(resistant)),
    {kind:'select-action',token:'ceremony'});
});

test('Volt Cyclone direct terminal KO beats VS Seeker winning gust and is not a false Cape KO',()=>{
  const own=player({
    prizeCount:2,
    active:pokemon('Iron Thorns ex TWM 77',{
      energies:['Double Colorless Energy SUM 136']}),
    bench:[pokemon('Iron Thorns ex TWM 77',{
      energies:['Double Colorless Energy SUM 136']})],
    discard:['Guzma BUS 115'],
    stadium:['Thunder Mountain ♢ LOT 191']
  });
  const actions=[
    action('seeker','play-card','VS Seeker PHF 109',{cardType:'item'}),
    action('attack','attack','Iron Thorns ex TWM 77',{},
      {attackName:'Volt Cyclone'}),
    {token:'pass',kind:'pass'}
  ];
  const direct=rootRequest({
    ownHand:['VS Seeker PHF 109'],ownPublic:own,items:actions,
    opponentPublic:player({
      active:pokemon('Dedenne-GX UNB 57',{hp:160,damage:30,
        subtypes:['GX','Basic']}),
      bench:[pokemon('Trevenant & Dusknoir-GX SMP 180',{
        hp:270,damage:160,subtypes:['TAG_TEAM','GX']})]
    })
  });
  assert.deepEqual(checkedDecision(direct),
    {kind:'select-action',token:'attack'});
  const cape=rootRequest({
    ownHand:['VS Seeker PHF 109'],ownPublic:own,items:actions,
    opponentPublic:player({
      active:pokemon('Dedenne-GX UNB 57',{hp:160,damage:30,
        tools:["Hero's Cape TEF 152"],subtypes:['GX','Basic']}),
      bench:[pokemon('Trevenant & Dusknoir-GX SMP 180',{
        hp:270,damage:160,subtypes:['TAG_TEAM','GX']})]
    })
  });
  assert.deepEqual(checkedDecision(cape),
    {kind:'select-action',token:'seeker'});
});


test('rank29 hidden-hand disruption is active against visible Thorns mirrors from ranks6/29',()=>{
  for(const name of ['Eri TEF 146','Team Skull Grunt SUM 133','Sidney FST 241']){
    const base={
      ownHand:[name],
      items:[
        action('disrupt','play-card',name,{cardType:'supporter'}),
        {token:'pass',kind:'pass'}
      ]
    };
    const high=rootRequest({...base,opponentPublic:player({
      active:pokemon('Iron Thorns ex TWM 77'),
      handCount:8,publicHand:null
    })});
    assert.deepEqual(checkedDecision(high),
      {kind:'select-action',token:'disrupt'});
    const low=rootRequest({...base,opponentPublic:player({
      active:pokemon('Iron Thorns ex TWM 77'),
      handCount:1,publicHand:null
    })});
    assert.deepEqual(checkedDecision(low),{kind:'select-action',token:'pass'});
  }
});

test('publicly revealed zero-target Thorns mirror hand overrides source-category prior',()=>{
  for(const name of ['Eri TEF 146','Team Skull Grunt SUM 133','Sidney FST 241']){
    const req=rootRequest({
      ownHand:[name],
      opponentPublic:player({
        active:pokemon('Iron Thorns ex TWM 77'),handCount:8,
        publicHand:[
          'Guzma BUS 115','Plumeria BUS 120','Team Flare Grunt XY 129',
          'Lusamine CIN 96','Cynthia & Caitlin CEC 189',
          'Faba LOT 173','Peonia CRE 149','Lillie s Determination MEG 119'
        ]
      }),
      items:[
        action('disrupt','play-card',name,{cardType:'supporter'}),
        {token:'pass',kind:'pass'}
      ]
    });
    assert.deepEqual(checkedDecision(req),
      {kind:'select-action',token:'pass'});
  }
});


test('Duplicate Gust prompt uses physical benchIndex, never reversed selectionIndex',()=>{
  for(const seat of [0,1]){
    const healthy=pokemon('Tapu Lele-GX GRI 60',{hp:170,damage:0,
      retreatCost:['Colorless','Colorless']});
    const vulnerable=pokemon('Tapu Lele-GX GRI 60',{hp:170,damage:100});
    const choiceFor=(token,slot,ordinal)=>({
      ...pokemonChoice(token,'Tapu Lele-GX GRI 60','opponent','bench',slot),
      publicMetadata:{
        ...pokemonChoice(token,'Tapu Lele-GX GRI 60','opponent','bench',slot).publicMetadata,
        selectionIndex:ordinal,benchIndex:slot
      }
    });
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
          bench:[healthy,vulnerable]
        })
      },
      choices:[
        choiceFor('injured-slot-one',1,0),
        choiceFor('healthy-slot-zero',0,1)
      ]
    });
    assert.deepEqual(checkedDecision(req,seat),
      {kind:'select-choices',tokens:['injured-slot-one']});
    const forged=promptRequest({
      seat,promptType:'ChoosePokemonPrompt',
      source:actorChoiceSource('Guzma BUS 115','Guzma'),
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
        allowCancel:false,isSecret:false},
      observation:{
        ownPublic:req.observation.ownPublic,
        opponentPublic:req.observation.opponentPublic
      },
      choices:[{
        ...req.prompt.choices[0],
        publicMetadata:{...req.prompt.choices[0].publicMetadata,benchIndex:8}
      },req.prompt.choices[1]]
    });
    assert.deepEqual(checkedDecision(forged,seat),
      {kind:'select-choices',tokens:['healthy-slot-zero']});
  }
});

test('Duplicate own-switch prompt chooses genuinely powered slot regardless of choice ordinal',()=>{
  for(const seat of [0,1]){
    const bench=[
      pokemon('Iron Thorns ex TWM 77',{energies:['Capture Energy RCL 171']}),
      pokemon('Iron Thorns ex TWM 77',{energies:['Double Colorless Energy SUM 136']})
    ];
    const a=pokemonChoice('powered','Iron Thorns ex TWM 77','actor','bench',1);
    const b=pokemonChoice('stranded','Iron Thorns ex TWM 77','actor','bench',0);
    a.publicMetadata.selectionIndex=0;
    b.publicMetadata.selectionIndex=1;
    const req=promptRequest({
      seat,promptType:'ChoosePokemonPrompt',
      source:actorChoiceSource('Guzma BUS 115','Guzma'),
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
        allowCancel:false,isSecret:false},
      observation:{ownPublic:player({
        active:pokemon('Iron Thorns ex TWM 77'),
        bench,stadium:['Thunder Mountain ♢ LOT 191']
      })},
      choices:[a,b]
    });
    assert.deepEqual(checkedDecision(req,seat),
      {kind:'select-choices',tokens:['powered']});
  }
});


test('Same-print Bench Speed root attachment obeys physical targetIndex and penalizes already-loaded slot',()=>{
  for(const seat of [0,1]){
    const bench=[
      pokemon('Iron Thorns ex TWM 77',{
        energies:['Speed Lightning Energy RCL 173',
          'Double Colorless Energy SUM 136']}),
      pokemon('Iron Thorns ex TWM 77',{energies:[]})
    ];
    const meta=index=>({
      cardType:'energy',targetZone:'bench',targetSeat:'actor',
      targetIndex:index,isOwnerVisible:true
    });
    const actions=[
      action('wrong-loaded','play-card','Speed Lightning Energy RCL 173',
        meta(0),{targetPrinting:'Iron Thorns ex TWM 77'}),
      action('fresh-slot','play-card','Speed Lightning Energy RCL 173',
        meta(1),{targetPrinting:'Iron Thorns ex TWM 77'}),
      {token:'pass',kind:'pass'}
    ];
    const base={
      seat,ownHand:['Speed Lightning Energy RCL 173'],
      ownPublic:player({active:pokemon('Iron Thorns ex TWM 77',{
        energies:['Capture Energy RCL 171']}),bench}),
      items:actions
    };
    assert.deepEqual(checkedDecision(rootRequest(base),seat),
      {kind:'select-action',token:'fresh-slot'});
    const physicallyUnbound=actions.map(a=>
      a.token==='fresh-slot'?
        {...a,publicMetadata:{...a.publicMetadata,targetIndex:8}}:a);
    assert.deepEqual(checkedDecision(rootRequest({...base,items:physicallyUnbound}),seat),
      {kind:'select-action',token:'pass'});
    const identitySpoof=actions.map(a=>
      a.token==='fresh-slot'?
        {...a,targetPrinting:'Dedenne-GX UNB 57'}:a);
    assert.deepEqual(checkedDecision(rootRequest({...base,items:identitySpoof}),seat),
      {kind:'select-action',token:'pass'});
  }
});

test('Root retreat scoring resolves exact same-print Bench recipient not first matching card',()=>{
  const bench=[
    pokemon('Iron Thorns ex TWM 77',{damage:190}),
    pokemon('Iron Thorns ex TWM 77',{
      energies:['Double Colorless Energy SUM 136','Speed Lightning Energy RCL 173']
    })
  ];
  const actionFor=(token,index)=>action(token,'retreat','Tapu Lele-GX GRI 60',{
    benchIndex:index,targetSeat:'actor',targetZone:'bench',
    targetIndex:index,isOwnerVisible:true
  },{targetPrinting:'Iron Thorns ex TWM 77'});
  const root=rootRequest({
    ownPublic:player({active:pokemon('Tapu Lele-GX GRI 60'),bench}),
    items:[actionFor('injured',0),actionFor('ready',1),
      {token:'pass',kind:'pass'}]
  });
  assert.deepEqual(checkedDecision(root),
    {kind:'select-action',token:'ready'});
  const wrong=rootRequest({
    ownPublic:root.observation.ownPublic,
    items:[actionFor('injured',0),
      {...actionFor('ready',1),publicMetadata:{
        benchIndex:0,targetSeat:'actor',targetZone:'bench',
        targetIndex:1,isOwnerVisible:true}},
      {token:'pass',kind:'pass'}]
  });
  // Injured-slot retreat score is negative; do not retreat merely because
  // a different physical slot would have been profitable.
  assert.deepEqual(checkedDecision(wrong),
    {kind:'select-action',token:'pass'});
});


test('Thorns mirror Team Skull does not play into seven publicly depleted Energy',()=>{
  const name='Team Skull Grunt SUM 133';
  const root=discard=>rootRequest({
    ownHand:[name],
    opponentPublic:player({
      active:pokemon('Iron Thorns ex TWM 77'),
      handCount:8,publicHand:null,discard
    }),
    items:[
      action('skull','play-card',name,{cardType:'supporter'}),
      {token:'pass',kind:'pass'}
    ]
  });
  const exposed=[
    'Speed Lightning Energy RCL 173','Speed Lightning Energy RCL 173',
    'Speed Lightning Energy RCL 173','Speed Lightning Energy RCL 173',
    'Capture Energy RCL 171','Capture Energy RCL 171',
    'Double Colorless Energy SUM 136'
  ];
  assert.deepEqual(checkedDecision(root(exposed)),
    {kind:'select-action',token:'pass'});
  assert.deepEqual(checkedDecision(root(exposed.slice(0,2))),
    {kind:'select-action',token:'skull'});
  assert.deepEqual(checkedDecision(root([
    ...exposed,'Spiky Energy JTG 159'
  ])),{kind:'select-action',token:'pass'});
});

test('Thorns mirror Eri posterior subtracts all 18 publicly exhausted minimum Items',()=>{
  const items=[
    ...Array(4).fill('Crushing Hammer POR 71'),
    ...Array(3).fill('VS Seeker PHF 109'),
    ...Array(2).fill("Trainers' Mail ROS 92"),
    ...Array(2).fill('Camping Gear BST 122'),
    ...Array(2).fill('Tag Call CEC 206'),
    'Enhanced Hammer TWM 148',
    'Captivating Poké Puff STS 99','Target Whistle PHF 106',
    'Field Blower GRI 125','Megaton Blower SSP 182'
  ];
  assert.equal(items.length,18);
  const root=discard=>rootRequest({
    ownHand:['Eri TEF 146'],
    opponentPublic:player({
      active:pokemon('Iron Thorns ex TWM 77'),
      handCount:8,publicHand:null,discard
    }),
    items:[
      action('eri','play-card','Eri TEF 146',{cardType:'supporter'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(root(items)),
    {kind:'select-action',token:'pass'});
  assert.deepEqual(checkedDecision(root(items.slice(0,2))),
    {kind:'select-action',token:'eri'});
});

test('Thorns mirror Sidney counts public Special Energy, attached Tools and Stadiums as exhausted targets',()=>{
  const targetPublic=[
    ...Array(4).fill('Speed Lightning Energy RCL 173'),
    ...Array(2).fill('Capture Energy RCL 171'),
    'Spiky Energy JTG 159','Double Colorless Energy SUM 136',
    ...Array(2).fill('Palace Belt BWP 153'),'Handheld Fan TWM 150',
    'Tool Jammer BST 136',...Array(2).fill('Tropical Beach BWP 50'),
    "Player's Ceremony SP 127"
  ];
  assert.equal(targetPublic.length,15);
  const root=discard=>rootRequest({
    ownHand:['Sidney FST 241'],
    opponentPublic:player({
      active:pokemon('Iron Thorns ex TWM 77'),
      handCount:8,publicHand:null,discard
    }),
    items:[
      action('sidney','play-card','Sidney FST 241',{cardType:'supporter'}),
      {token:'pass',kind:'pass'}
    ]
  });
  assert.deepEqual(checkedDecision(root(targetPublic)),
    {kind:'select-action',token:'pass'});
  assert.deepEqual(checkedDecision(root(targetPublic.slice(0,2))),
    {kind:'select-action',token:'sidney'});
});


test('Volt Cyclone chooses DCE over Speed when DCE completes Bench Lightning attacker, both seats',()=>{
  for(const seat of [0,1]){
    const req=promptRequest({
      seat,promptType:'AttachEnergyPrompt',
      source:actorChoiceSource('Iron Thorns ex TWM','Volt Cyclone'),
      publicMetadata:{
        selectionType:'energy-attachment',count:2,
        minimumCount:1,maximumCount:1,allowCancel:false,
        sourceZone:'active',ownerSeat:'actor',isOwnerVisible:true,zone:'bench'
      },
      observation:{ownPublic:player({
        active:pokemon('Iron Thorns ex TWM 77',{energies:[
          'Speed Lightning Energy RCL 173','Double Colorless Energy SUM 136'
        ]}),
        bench:[pokemon('Iron Thorns ex TWM 77',{energies:[
          'Speed Lightning Energy RCL 173'
        ]})]
      })},
      choices:[
        voltChoice('speed','Speed Lightning Energy RCL 173',0),
        voltChoice('dce','Double Colorless Energy SUM 136',0)
      ]
    });
    assert.deepEqual(checkedDecision(req,seat),
      {kind:'select-choice',token:'dce'});
  }
});

test('Volt Cyclone still chooses Speed over DCE when Speed completes DCE-bearing Bench attacker',()=>{
  const req=promptRequest({
    promptType:'AttachEnergyPrompt',
    source:actorChoiceSource('Iron Thorns ex TWM','Volt Cyclone'),
    publicMetadata:{
      selectionType:'energy-attachment',count:2,
      minimumCount:1,maximumCount:1,allowCancel:false,
      sourceZone:'active',ownerSeat:'actor',isOwnerVisible:true,zone:'bench'
    },
    observation:{ownPublic:player({
      active:pokemon('Iron Thorns ex TWM 77',{energies:[
        'Speed Lightning Energy RCL 173','Double Colorless Energy SUM 136'
      ]}),
      bench:[pokemon('Iron Thorns ex TWM 77',{energies:[
        'Double Colorless Energy SUM 136'
      ]})]
    })},
    choices:[
      voltChoice('dce','Double Colorless Energy SUM 136',0),
      voltChoice('speed','Speed Lightning Energy RCL 173',0)
    ]
  });
  assert.deepEqual(checkedDecision(req),
    {kind:'select-choice',token:'speed'});
});


test('Native-validated Tool prompts never require literal word Tool in card name',()=>{
  for(const seat of [0,1]){
    const unknownOpponentTool=cardChoice('unknown','Technical Machine: Devolution PAR 177',
      'bench','opponent');
    const friendlyTool=cardChoice('friendly','Palace Belt BWP 153',
      'active','actor');
    const field=promptRequest({
      seat,promptType:'ChooseCardsPrompt',
      source:actorChoiceSource('Field Blower GRI 125','Field Blower'),
      publicMetadata:multiMetadata(1,2),
      choices:[unknownOpponentTool,friendlyTool]
    });
    assert.deepEqual(checkedDecision(field,seat),
      {kind:'select-choices',tokens:['unknown']});
    const faba=promptRequest({
      seat,promptType:'ChooseCardsPrompt',
      source:actorChoiceSource('Faba LOT 173','Faba'),
      publicMetadata:multiMetadata(1,1),
      choices:[unknownOpponentTool,friendlyTool]
    });
    assert.deepEqual(checkedDecision(faba,seat),
      {kind:'select-choices',tokens:['unknown']});
    const megaton=promptRequest({
      seat,promptType:'ChooseCardsPrompt',
      source:actorChoiceSource('Megaton Blower SSP 182','Megaton Blower'),
      publicMetadata:multiMetadata(1,3),
      choices:[unknownOpponentTool,friendlyTool]
    });
    assert.deepEqual(checkedDecision(megaton,seat),
      {kind:'select-choices',tokens:['unknown']});
  }
});


test('Pinned Field Blower stadium-vs-two-tools option uses native SelectOptionPrompt',()=>{
  for(const seat of [0,1]){
    const opponent=player({
      active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{
        tools:['Forest Seal Stone SIT 156']}),
      bench:[pokemon('Tapu Lele-GX GRI 60',{
        tools:['Stealthy Hood UNB 186']})]
    });
    const source=actorChoiceSource('Field Blower GRI 125','Field Blower');
    const choices=[
      {token:'stadium',kind:'option',label:'Discard the Stadium and up to 1 Tool',
        publicMetadata:{choiceIndex:0}},
      {token:'tools',kind:'option',label:'Discard up to 2 Tools',
        publicMetadata:{choiceIndex:1}}
    ];
    const base={
      seat,promptType:'SelectOptionPrompt',source,
      publicMetadata:{selectionType:'option',count:2,allowCancel:false},
      choices
    };
    const protectedStadium=promptRequest({...base,observation:{
      ownPublic:player({stadium:['Thunder Mountain ♢ LOT 191']}),
      opponentPublic:opponent
    }});
    assert.deepEqual(checkedDecision(protectedStadium,seat),
      {kind:'select-choice',token:'tools'});
    const harmful=promptRequest({...base,observation:{
      ownPublic:player({stadium:['Temple of Sinnoh ASR 155']}),
      opponentPublic:opponent
    }});
    assert.deepEqual(checkedDecision(harmful,seat),
      {kind:'select-choice',token:'stadium'});
  }
});

test('Pinned Field Blower physical ChoosePokemonPrompt chooses actual opponent Tool-bearing slots',()=>{
  for(const seat of [0,1]){
    const choices=[
      pokemonChoice('empty','Tapu Lele-GX GRI 60','opponent','bench',0),
      pokemonChoice('equipped','Tapu Lele-GX GRI 60','opponent','bench',1),
      pokemonChoice('actor-tool','Iron Thorns ex TWM 77','actor','active',0),
      {token:'no-selection',kind:'empty-selection',
        label:'Choose no Pokémon'}
    ];
    choices[0].publicMetadata.selectionIndex=1;
    choices[1].publicMetadata.selectionIndex=0;
    const req=promptRequest({
      seat,promptType:'ChoosePokemonPrompt',
      source:actorChoiceSource('Field Blower GRI 125','Field Blower'),
      publicMetadata:{selectionType:'pokemon',minimumCount:0,
        maximumCount:2,allowCancel:false,isSecret:false},
      choices,
      observation:{
        ownPublic:player({active:pokemon('Iron Thorns ex TWM 77',{
          tools:['Palace Belt BWP 153']})}),
        opponentPublic:player({bench:[
          pokemon('Tapu Lele-GX GRI 60',{tools:[]}),
          pokemon('Tapu Lele-GX GRI 60',{
            tools:['Technical Machine: Devolution PAR 177']})
        ]})
      }
    });
    assert.deepEqual(checkedDecision(req,seat),
      {kind:'select-choices',tokens:['equipped']});
  }
});

test('Pinned Faba SelectPrompt picks public opponent Special Energy, then exact physical holder',()=>{
  for(const seat of [0,1]){
    const owner=player({active:pokemon('Iron Thorns ex TWM 77')});
    const opponent=player({bench:[
      pokemon('Tapu Lele-GX GRI 60',{tools:['Stealthy Hood UNB 186']}),
      pokemon('Tapu Lele-GX GRI 60',{
        energies:['Double Colorless Energy SUM 136']})
    ]});
    const source=actorChoiceSource('Faba LOT 173','Faba');
    const select=promptRequest({
      seat,promptType:'SelectPrompt',source,
      publicMetadata:{selectionType:'option',count:2,allowCancel:false},
      observation:{ownPublic:owner,opponentPublic:opponent},
      choices:[
        {token:'tool',kind:'option',label:'CHOICE_TOOL',
          publicMetadata:{choiceIndex:0}},
        {token:'energy',kind:'option',label:'CHOICE_SPECIAL_ENERGY',
          publicMetadata:{choiceIndex:1}}
      ]
    });
    assert.deepEqual(checkedDecision(select,seat),
      {kind:'select-choice',token:'energy'});
    const choices=[
      pokemonChoice('with-tool','Tapu Lele-GX GRI 60','opponent','bench',0),
      pokemonChoice('with-special','Tapu Lele-GX GRI 60','opponent','bench',1)
    ];
    choices[0].publicMetadata.selectionIndex=1;
    choices[1].publicMetadata.selectionIndex=0;
    const holder=promptRequest({
      seat,promptType:'ChoosePokemonPrompt',source,
      publicMetadata:{selectionType:'pokemon',minimumCount:0,
        maximumCount:1,allowCancel:false,isSecret:false},
      observation:{ownPublic:owner,opponentPublic:opponent},
      choices:[choices[1],{
        token:'no-selection',kind:'empty-selection',
        label:'Choose no Pokémon'
      }]
    });
    assert.deepEqual(checkedDecision(holder,seat),
      {kind:'select-choices',tokens:['with-special']});
  }
});


test('Palace Book pinned draw-three may end stalled turn but never preempt attack',()=>{
  const palace=action('palace','play-card','Palace Book SMP NAN25',
    {cardType:'item'});
  const base={
    ownHand:['Palace Book SMP NAN25',"Trainers' Mail ROS 92"],
    items:[palace,{token:'pass',kind:'pass'}],
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77'),
      deckCount:25})
  };
  assert.deepEqual(checkedDecision(rootRequest(base)),
    {kind:'select-action',token:'palace'});
  const attacker=rootRequest({...base,
    items:[
      palace,
      action('attack','attack','Iron Thorns ex TWM 77',{},{
        attackName:'Volt Cyclone'
      }),
      {token:'pass',kind:'pass'}
    ],
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77',{
      energies:['Double Colorless Energy SUM 136',
        'Speed Lightning Energy RCL 173']
    }),deckCount:25}),
    opponentPublic:player({active:pokemon('Dedenne-GX UNB 57',
      {hp:160,damage:30})})
  });
  assert.deepEqual(checkedDecision(attacker),
    {kind:'select-action',token:'attack'});
  assert.deepEqual(checkedDecision(rootRequest({...base,
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77'),
      deckCount:2})
  })),{kind:'select-action',token:'pass'});
});

test('Palace Book never truncates a free Energy attachment nor reusable Ceremony draw',()=>{
  const palace=action('palace','play-card','Palace Book SMP NAN25',{
    cardType:'item'
  });
  const energy=action('energy','play-card','Speed Lightning Energy RCL 173',{
    cardType:'energy'
  },{targetPrinting:'Iron Thorns ex TWM 77'});
  assert.deepEqual(checkedDecision(rootRequest({
    ownHand:['Palace Book SMP NAN25','Speed Lightning Energy RCL 173'],
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77'),deckCount:20}),
    items:[palace,energy,{token:'pass',kind:'pass'}]
  })),{kind:'select-action',token:'energy'});
  const ceremony=action('ceremony','use-stadium',"Player's Ceremony SP 127",{
    stadiumPrinting:"Player's Ceremony SP 127"
  });
  assert.deepEqual(checkedDecision(rootRequest({
    ownHand:['Palace Book SMP NAN25'],
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77'),
      stadium:["Player's Ceremony SP 127"],deckCount:20}),
    items:[palace,ceremony,{token:'pass',kind:'pass'}]
  })),{kind:'select-action',token:'ceremony'});
});


test('Camping Gear printed unrestricted exact-one search never chooses native empty',()=>{
  for(const seat of [0,1]){
    const cards=[
      'Double Colorless Energy SUM 136','Guzma & Hala CEC 193',
      'Thundershock Basic LOR 38'
    ];
    const req=promptRequest({
      seat,promptType:'ChooseCardsPrompt',
      source:actorChoiceSource('Camping Gear BST','Camping Gear'),
      publicMetadata:{selectionType:'card-combination',count:3,
        minimumCount:0,maximumCount:1,allowCancel:false,
        sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true},
      choices:[
        ...cards.map((name,index)=>({
          ...cardChoice('deck'+index,name,'deck','actor'),
          publicMetadata:{sourceZone:'deck',ownerSeat:'actor',
            isOwnerVisible:true,selectionIndex:index,selectedCount:1}
        })),
        {token:'native-zero',kind:'empty-selection',label:'Choose no cards'}
      ],
      observation:{ownPublic:player({
        active:pokemon('Iron Thorns ex TWM 77'),
        deckCount:23
      })}
    });
    const selected=checkedDecision(req,seat);
    assert.equal(selected.kind,'select-choices');
    assert.equal(selected.tokens.length,1);
    assert.notEqual(selected.tokens[0],'native-zero');
    // Even when no custom heuristic recognizes any offered card, the
    // printed unrestricted search cannot resolve native [] on a full deck.
    const onlyUnknown=promptRequest({
      ...req,seat,promptType:'ChooseCardsPrompt',
      source:actorChoiceSource('Camping Gear BST','Camping Gear'),
      publicMetadata:{...req.prompt.publicMetadata,count:1},
      choices:[
        {token:'unlisted',kind:'card',printing:'Unknown Card XYZ 123',
          label:'Unknown Card XYZ 123',
          publicMetadata:{sourceZone:'deck',ownerSeat:'actor',
            isOwnerVisible:true,selectionIndex:0,selectedCount:1}},
        {token:'zero',kind:'empty-selection',label:'Choose no cards'}
      ]
    });
    assert.deepEqual(checkedDecision(onlyUnknown,seat),
      {kind:'select-choices',tokens:['unlisted']});
  }
});

test('Camping Gear source-bound exact physical search rejects fake deck and zero source',()=>{
  const base={
    promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Camping Gear BST','Camping Gear'),
    publicMetadata:{selectionType:'card-combination',count:1,
      minimumCount:0,maximumCount:1,allowCancel:false,
      sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true},
    choices:[
      {token:'card',kind:'card',printing:'Double Colorless Energy SUM 136',
        label:'DCE',publicMetadata:{sourceZone:'deck',
          ownerSeat:'actor',isOwnerVisible:true,selectionIndex:0,
          selectedCount:1}},
      {token:'empty',kind:'empty-selection',label:'Choose none'}
    ]
  };
  assert.deepEqual(checkedDecision(promptRequest(base)),
    {kind:'select-choices',tokens:['card']});
  for(const changes of [
    {publicMetadata:{...base.publicMetadata,sourceZone:'discard'}},
    {publicMetadata:{...base.publicMetadata,ownerSeat:'opponent'}},
    {choices:[{...base.choices[0],publicMetadata:{
      ...base.choices[0].publicMetadata,sourceZone:'discard'}},base.choices[1]]}
  ]){
    const req=promptRequest({...base,...changes});
    assert.equal(checkedDecision(req).kind,'abstain');
  }
});

test('Camping Gear root preserves exact next-turn DCE and does not preempt immediate actions',()=>{
  const camping=action('camp','play-card','Camping Gear BST 122',{
    cardType:'item'
  });
  const base={
    ownHand:['Camping Gear BST 122'],
    ownPublic:player({
      active:pokemon('Iron Thorns ex TWM 77'),deckCount:30
    }),
    items:[camping,{token:'pass',kind:'pass'}]
  };
  assert.deepEqual(checkedDecision(rootRequest(base)),
    {kind:'select-action',token:'camp'});
  // An exact K1 singleton must match the physically remaining deck:
  // searching its last card with turn-ending Camping Gear causes our
  // next-turn mandatory draw to fail before the card can be used.
  const lastCard=rootRequest({...base,
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77'),deckCount:1}),
    opponentPublic:player({active:pokemon('Shadow Rider Calyrex V CRE 74')}),
    ownerK1:{epoch:4,exactMembershipKnown:true,invalidationReason:null,
      knownPrintings:[{printing:'Guzma BUS 115',copies:1}]}
  });
  assert.deepEqual(checkedDecision(lastCard),
    {kind:'select-action',token:'pass'});
  assert.deepEqual(checkedDecision(rootRequest({...base,
    ownPublic:player({active:pokemon('Iron Thorns ex TWM 77'),deckCount:1})
  })),{kind:'select-action',token:'pass'});
  assert.deepEqual(checkedDecision(rootRequest({...base,
    items:[camping,
      action('attack','attack','Iron Thorns ex TWM 77',{},
        {attackName:'Volt Cyclone'}),
      {token:'pass',kind:'pass'}]
  })),{kind:'select-action',token:'attack'});
  assert.deepEqual(checkedDecision(rootRequest({...base,
    ownHand:['Camping Gear BST 122','Speed Lightning Energy RCL 173'],
    items:[camping,
      action('energy','play-card','Speed Lightning Energy RCL 173',{
        cardType:'energy'
      },{targetPrinting:'Iron Thorns ex TWM 77'}),
      {token:'pass',kind:'pass'}]
  })),{kind:'select-action',token:'energy'});
});

test('Wondrous Labyrinth requires four paid units, not an absolute Bench-Guzma attack veto',()=>{
  const items=[
    action('guzma','play-card','Guzma BUS 115',{cardType:'supporter'}),
    action('plumeria','play-card','Plumeria BUS 120',{cardType:'supporter'}),
    {token:'pass',kind:'pass'}
  ];
  for(const seat of [0,1]){
    const opponent=player({
      active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{
        hp:320,subtypes:['VMAX'],
        energies:['Psychic Energy CRE 232']
      }),
      bench:[pokemon('Tapu Lele-GX GRI 60',{
        hp:170,damage:60,subtypes:['GX'],retreatCost:[]
      })],
      prizeCount:4
    });
    const base={
      seat,items,opponentPublic:opponent,
      ownHand:['Guzma BUS 115','Plumeria BUS 120',
        'Target Whistle Team Flare Gear PHF 106','Field Blower GRI 125']
    };
    const withBenchEnergy=energies=>rootRequest({
      ...base,
      ownPublic:player({
        active:pokemon('Iron Thorns ex TWM 77'),
        bench:[pokemon('Iron Thorns ex TWM 77',{energies})],
        stadium:['Wondrous Labyrinth ◇ TEU 158'],
        prizeCount:2
      })
    });
    // Wondrous taxes Volt Cyclone [L,C,C] to [L,C,C,C].
    // Speed supplies [L], DCE two [C], Capture the fourth [C].
    const fourAndLightning=withBenchEnergy([
      'Speed Lightning Energy RCL 173',
      'Double Colorless Energy SUM 136',
      'Capture Energy RCL 171'
    ]);
    assert.deepEqual(checkedDecision(fourAndLightning,seat),
      {kind:'select-action',token:'guzma'});
    const audit=makePolicy(seat).decideWithAudit(fourAndLightning);
    assert.equal(audit.policyAudit.evaluations.find(row=>
      row.token==='guzma').score>190,true);

    // Three units cannot pay Wondrous's extra [C].
    assert.deepEqual(checkedDecision(withBenchEnergy([
      'Speed Lightning Energy RCL 173',
      'Double Colorless Energy SUM 136'
    ]),seat),{kind:'select-action',token:'plumeria'});

    // Four Colorless units without any Lightning still cannot pay [L].
    assert.deepEqual(checkedDecision(withBenchEnergy([
      'Double Colorless Energy SUM 136',
      'Capture Energy RCL 171',
      'Spiky Energy JTG 159'
    ]),seat),{kind:'select-action',token:'plumeria'});
  }
});

test('replacing Wondrous with Thunder Mountain unlocks DCE-only final-prize Volt Cyclone',()=>{
  const items=[
    action('thunder','play-card','Thunder Mountain ◇ LOT 191',{cardType:'stadium'}),
    action('flare','play-card','Team Flare Grunt XY 129',{cardType:'supporter'}),
    {token:'pass',kind:'pass'}
  ];
  for(const seat of [0,1]){
    const opponent=player({
      active:pokemon('Tapu Lele-GX GRI 60',{
        hp:170,damage:60,subtypes:['GX'],
        energies:['Psychic Energy CRE 232']
      }),
      bench:[pokemon('Shadow Rider Calyrex V CRE 74')],
      prizeCount:3
    });
    const base={
      seat,items,opponentPublic:opponent,
      ownHand:['Thunder Mountain ◇ LOT 191','Team Flare Grunt XY 129']
    };
    const ready=energies=>rootRequest({
      ...base,
      ownPublic:player({
        active:pokemon('Iron Thorns ex TWM 77',{energies}),
        bench:[pokemon('Iron Thorns ex TWM 77')],
        stadium:['Wondrous Labyrinth ◇ TEU 158'],
        prizeCount:2
      })
    });
    const funded=ready(['Double Colorless Energy SUM 136']);
    assert.deepEqual(checkedDecision(funded,seat),
      {kind:'select-action',token:'thunder'});
    const audit=makePolicy(seat).decideWithAudit(funded);
    assert.equal(audit.policyAudit.evaluations.find(row=>row.token==='thunder').score,925);
    assert.equal(audit.policyAudit.evaluations.find(row=>row.token==='flare').score,185);

    // One Colorless unit still cannot pay Volt Cyclone after the [L]
    // reduction, so the offered opponent Energy denial remains preferable.
    assert.deepEqual(checkedDecision(ready(['Capture Energy RCL 171']),seat),
      {kind:'select-action',token:'flare'});
  }
});

test('Temple removal reactivates Spiky recoil: deny false terminal premium on simultaneous Prize finish',()=>{
  const items=[
    action('thunder','play-card','Thunder Mountain ◇ LOT 191',{cardType:'stadium'}),
    action('flare','play-card','Team Flare Grunt XY 129',{cardType:'supporter'}),
    {token:'pass',kind:'pass'}
  ];
  for(const seat of [0,1])for(const opponentPrizes of [2,3])
    for(const ownDamage of [220,0]){
      const request=rootRequest({
        seat,items,
        ownHand:['Thunder Mountain ◇ LOT 191','Team Flare Grunt XY 129'],
        ownPublic:player({
          active:pokemon('Iron Thorns ex TWM 77',{
            energies:['Speed Lightning Energy RCL 173','Double Colorless Energy SUM 136'],
            damage:ownDamage
          }),
          bench:[pokemon('Iron Thorns ex TWM 77')],
          stadium:['Temple of Sinnoh ASR 155'],
          prizeCount:2
        }),
        opponentPublic:player({
          active:pokemon('Iron Thorns ex TWM 77',{
            energies:['Spiky Energy JTG 159'],damage:120
          }),
          bench:[pokemon('Shadow Rider Calyrex V CRE 74')],
          prizeCount:opponentPrizes
        })
      });
      // After Thunder replaces Temple, Spiky's 20-counter reflection is
      // live. Lethal own-active reflection while opponent has <=2 Prizes
      // yields simultaneous final Prizes, not our game win.
      const unsafe=opponentPrizes===2&&ownDamage===220;
      assert.deepEqual(checkedDecision(request,seat),
        {kind:'select-action',token:unsafe?'flare':'thunder'});
      const audit=makePolicy(seat).decideWithAudit(request);
      assert.equal(audit.policyAudit.evaluations.find(x=>x.token==='thunder').score,
        unsafe?115:925);
    }
});

test('bounded terminal Stadium root oracle: neutral, Temple, Wondrous and Chaotic Swell',()=>{
  const e={
    DCE:'Double Colorless Energy SUM 136',
    Speed:'Speed Lightning Energy RCL 173',
    Capture:'Capture Energy RCL 171',
    Spiky:'Spiky Energy JTG 159'
  };
  const stadiums={
    Temple:'Temple of Sinnoh ASR 155',
    Wondrous:'Wondrous Labyrinth ◇ TEU 158',
    Thunder:'Thunder Mountain ◇ LOT 191',
    Beach:'Tropical Beach BCR 147',
    Swell:'Chaotic Swell CEC 187'
  };
  const funding=(keys,stadium)=>{
    let total=0,lightning=0;
    for(const key of keys){
      if(key==='DCE')total+=stadium==='Temple'?1:2;
      else{
        total++;
        if(key==='Speed'&&stadium!=='Temple')lightning++;
      }
    }
    return stadium==='Thunder'?total>=2:
      total>=(stadium==='Wondrous'?4:3)&&lightning>0;
  };
  const energyNames=Object.keys(e);
  let oracleCases=0;
  for(const seat of [0,1])
    for(let mask=0;mask<16;mask++)
      for(const stadium of ['Temple','Wondrous','Thunder','Beach','Swell','None'])
        for(const targetSpiky of [false,true])
          for(const opponentPrizes of [2,3])
            for(const ownerDamage of [0,220]){
              const keys=energyNames.filter((_,i)=>Boolean(mask&(1<<i)));
              const cards=keys.map(key=>e[key]);
              const stadiumCards=stadium==='None'?[]:[stadiums[stadium]];
              const owner=player({
                active:pokemon('Iron Thorns ex TWM 77',{
                  energies:cards,damage:ownerDamage
                }),
                bench:[pokemon('Iron Thorns ex TWM 77')],
                stadium:stadiumCards,deckCount:25,prizeCount:2
              });
              const opponent=player({
                active:pokemon('Iron Thorns ex TWM 77',{
                  energies:[targetSpiky?e.Spiky:e.Capture],damage:120
                }),
                bench:[pokemon('Shadow Rider Calyrex V CRE 74')],
                prizeCount:opponentPrizes
              });
              const items=[action('flare','play-card','Team Flare Grunt XY 129',
                {cardType:'supporter'})];
              const already=funding(keys,stadium);
              if(already)items.push(action('attack','attack',
                'Iron Thorns ex TWM 77',{attackCostPayable:true},
                {attackName:'Volt Cyclone'}));
              if(stadium!=='Thunder')items.push(action('thunder','play-card',
                stadiums.Thunder,{cardType:'stadium'}));
              if(stadium!=='Beach')items.push(action('beach','play-card',
                stadiums.Beach,{cardType:'stadium'}));
              items.push({token:'pass',kind:'pass'});
              const unsafe=targetSpiky&&ownerDamage===220&&opponentPrizes===2;
              let expected=null;
              if(!unsafe&&already)expected='attack';
              else if(!unsafe&&stadium!=='Swell'&&
                stadium!=='Thunder'&&funding(keys,'Thunder'))
                expected='thunder';
              else if(!unsafe&&stadium!=='Swell'&&
                stadium!=='Beach'&&funding(keys,'Beach'))
                expected='beach';
              if(expected===null)continue;
              const request=rootRequest({
                seat,items,ownPublic:owner,opponentPublic:opponent,
                ownHand:['Team Flare Grunt XY 129',
                  stadiums.Thunder,stadiums.Beach]
              });
              assert.deepEqual(checkedDecision(request,seat),
                {kind:'select-action',token:expected});
              oracleCases++;
            }
  assert.equal(oracleCases,910);
});

test('turn-ending draw/search refuses self-deckout: Palace Book and Tropical Beach',()=>{
  for(const seat of [0,1]){
    const palace=action('palace','play-card','Palace Book',{cardType:'item'});
    const root=(deckCount,items,hand)=>rootRequest({
      seat,ownHand:hand,items,
      ownPublic:player({
        active:pokemon('Iron Thorns ex TWM 77'),deckCount
      })
    });
    const palaceItems=[palace,{token:'pass',kind:'pass'}];
    assert.deepEqual(checkedDecision(root(3,palaceItems,['Palace Book']),seat),
      {kind:'select-action',token:'pass'});
    assert.deepEqual(checkedDecision(root(4,palaceItems,['Palace Book']),seat),
      {kind:'select-action',token:'palace'});

    const beachItems=[
      action('beach','play-card','Tropical Beach BCR 147',{cardType:'stadium'}),
      {token:'pass',kind:'pass'}
    ];
    // Playing Beach leaves 0 hand cards, so draw-to-seven uses seven.
    assert.deepEqual(checkedDecision(root(7,beachItems,['Tropical Beach BCR 147']),seat),
      {kind:'select-action',token:'pass'});
    assert.deepEqual(checkedDecision(root(8,beachItems,['Tropical Beach BCR 147']),seat),
      {kind:'select-action',token:'beach'});

    const stadiumUse=(deckCount)=>rootRequest({
      seat,
      ownHand:['Field Blower GRI 125','Guzma BUS 115',
        'Captivating Poké Puff STS 99','Lusamine CIN 96'],
      ownPublic:player({
        active:pokemon('Iron Thorns ex TWM 77'),
        stadium:['Tropical Beach BCR 147'],deckCount
      }),
      ownTurnResources:turnResources({supporterPlayedTurn:1}),
      items:[
        action('draw','use-stadium','Tropical Beach BCR 147'),
        {token:'pass',kind:'pass'}
      ]
    });
    // Four cards in hand => draw 3, so 3 would leave an empty deck.
    assert.deepEqual(checkedDecision(stadiumUse(3),seat),
      {kind:'select-action',token:'pass'});
    assert.deepEqual(checkedDecision(stadiumUse(4),seat),
      {kind:'select-action',token:'draw'});
  }
});

test('Faba clears Chaotic Swell before held Thunder: final-Prize line and three negatives',()=>{
  for(const seat of [0,1])for(const scenario of [
    'funded','underfunded','no-thunder','spiky-final-tie'
  ]){
    const hasDce=scenario!=='underfunded';
    const hasThunder=scenario!=='no-thunder';
    const recoilTie=scenario==='spiky-final-tie';
    const owner=player({
      active:pokemon('Iron Thorns ex TWM 77',{
        energies:[hasDce?'Double Colorless Energy SUM 136':
          'Capture Energy RCL 171'],
        damage:recoilTie?220:0
      }),
      bench:[pokemon('Iron Thorns ex TWM 77')],
      stadium:['Chaotic Swell CEC 187'],prizeCount:2
    });
    const opponent=player({
      active:pokemon('Tapu Lele-GX GRI 60',{
        hp:170,damage:60,subtypes:['GX'],
        energies:['Double Colorless Energy SUM 136',
          'Spiky Energy JTG 159']
      }),
      bench:[pokemon('Shadow Rider Calyrex V CRE 74')],
      prizeCount:recoilTie?2:3
    });
    const hand=['Faba LOT 173','Team Flare Grunt XY 129',
      ...(hasThunder?['Thunder Mountain ◇ LOT 191']:[])];
    const root=rootRequest({
      seat,ownPublic:owner,opponentPublic:opponent,ownHand:hand,
      items:[
        action('flare','play-card','Team Flare Grunt XY 129',{cardType:'supporter'}),
        action('faba','play-card','Faba LOT 173',{cardType:'supporter'}),
        {token:'pass',kind:'pass'}
      ]
    });
    const terminal=scenario==='funded';
    assert.deepEqual(checkedDecision(root,seat),
      {kind:'select-action',token:terminal?'faba':'flare'});
    assert.equal(makePolicy(seat).decideWithAudit(root).
      policyAudit.evaluations.find(row=>row.token==='faba').score,
      terminal?950:175);

    const resolve=promptRequest({
      seat,promptType:'ChooseCardsPrompt',
      source:actorChoiceSource('Faba LOT 173','Faba'),
      publicMetadata:multiMetadata(1,1),
      observation:{ownPublic:owner,opponentPublic:opponent,
        ownHand:hand.filter(card=>card!=='Faba LOT 173')},
      choices:[
        cardChoice('dce','Double Colorless Energy SUM 136','attached','opponent'),
        cardChoice('swell','Chaotic Swell CEC 187','stadium','opponent')
      ]
    });
    assert.deepEqual(checkedDecision(resolve,seat),
      {kind:'select-choices',tokens:[terminal?'swell':'dce']});
  }
});