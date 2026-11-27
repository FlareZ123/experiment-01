'use strict';

/* Protocol-enveloped decisions for original Aichi rank 32 (development only).
 * Genuine V3 schema and decision validator; no native Store or physical match.
 */

const test=require('node:test');
const assert=require('node:assert/strict');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {
  POLICY_VERSION,createPolicy
}=require('../../simulation/evaluation/2026-11/agent3-rank32-regidrago-worker-bundle.cjs');

function restrictions() {
  return {
    cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
    blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,
    onlyAllowedAttackNameNextTurn:null,attackCostIncreaseNextTurn:0,
    attackCostIncreaseWhileActive:0,cannotRetreat:false,
    cannotRetreatNextTurn:false,cannotRetreatWhileActive:false,cannotEvolveNextTurn:false
  };
}
function publicRestrictions() {
  return {
    gxUsed:false,vstarUsed:false,attackLockTurnsRemaining:0,
    attackMaxEnergy:null,attackMaxEnergyTurnsRemaining:0,
    ignoreAttackCostCardTypes:[],ignoreAttackCostTurnsRemaining:0,
    cannotUseGXAttacks:false,pokemonPlayLocked:false,
    abilityPokemonPlayLocked:false,evolutionPlayLocked:false,
    itemPlayLocked:false,supporterPlayLocked:false,stadiumPlayLocked:false,
    toolPlayLocked:false,energyPlayLocked:false,specialEnergyPlayLocked:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:null
  };
}
function pokemon(printing,options={}) {
  const abilityNames=options.abilities??[];
  return {
    printing,name:options.name??printing.replace(/ [A-Z0-9]+ [A-Z0-9]+$/,''),
    hp:options.hp??280,damage:options.damage??0,
    lastPlayedOrEvolvedTurn:options.lastPlayedOrEvolvedTurn??2,
    printed:{
      stage:options.stage??'BASIC',subtypes:options.subtypes??['VSTAR'],
      types:options.types??['Dragon'],retreatCost:[],
      weakness:[],resistance:[]
    },specialConditions:[],publicRestrictions:restrictions(),
    evolutionPrintings:[],energies:options.energies??[],
    tools:options.tools??[],attacks:[],abilities:abilityNames,
    abilityDetails:abilityNames.map(name=>({name,powerType:'ABILITY',text:'Public projected ability'})),
    abilitySuppressions:null
  };
}
function player({active=null,bench=[],stadium=[],discard=[],handCount=0,
  publicTurnRestrictions={}}={}) {
  const slots=bench.slice(0,5);while(slots.length<5)slots.push(null);
  return {
    active,bench:slots,stadium,discard,lostZone:[],resolvingSupporter:[],
    publicHand:null,prizeSlots:Array.from({length:6},(_,index)=>({index})),
    publicTurnRestrictions:{...publicRestrictions(),...publicTurnRestrictions},
    handCount,deckCount:30,prizeCount:6
  };
}
function resources() {
  return {
    supporterPlayedTurn:0,retreatedTurn:0,extraTurnActive:false,
    energyPlayedTurn:false,stadiumPlayedTurn:false,stadiumUsedTurn:false,
    vstarUsed:false,pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
    evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,
    stadiumPlayLocked:false,toolPlayLocked:false,energyPlayLocked:false,
    specialEnergyPlayLocked:false
  };
}
function init(seat) {
  return protocol.validateInit({
    schema:protocol.INIT_SCHEMA,type:'init',role:'opponent',seat,
    policyVersion:POLICY_VERSION,bundleSha256:'a'.repeat(64),config:{}
  });
}
function create(seat) {
  return createPolicy({...init(seat),rng:()=>{throw Error('UNEXPECTED_RNG_DRAW');}});
}
function root(seat=0,options={}) {
  const own=options.own??player({
    active:pokemon('Regidrago VSTAR SIT 136',
      {subtypes:['VSTAR'],energies:['Grass Energy MEE 9','Double Dragon Energy ROS 97']}),
    bench:[pokemon('Dedenne-GX UNB 57',{subtypes:['Basic','GX'],abilities:['Dedechange']})]
  });
  const opponent=options.opponent??player({
    active:pokemon('Wobbuffet PHF 36',{hp:110,subtypes:['Basic'],types:['Psychic'],
      abilities:['Bide Barricade']})
  });
  const prompt=options.prompt??null;
  return {
    schema:protocol.REQUEST_SCHEMA,type:'decision',requestId:options.requestId??'rank32-contract-1',
    sequence:1,role:'opponent',seat,
    observationSchema:protocol.OBSERVATION_SCHEMA,
    observation:{
      actorSeat:seat,globalTurn:4,phase:options.phase??2,
      decisionKind:prompt?'owner-prompt':'owner-root',
      pendingPromptType:prompt?.promptType??null,
      pendingOwnerDeckSearch:false,ownHand:options.hand??['Grass Energy MEE 9'],
      ownPublic:own,opponentPublic:opponent,ownTurnResources:resources(),
      ownerK1:null
    },
    prompt,publicEventReceipt:null,
    actionFrontier:{
      schema:protocol.FRONTIER_SCHEMA,items:options.items??[{token:'pass',kind:'pass',label:'Pass'}]
    }
  };
}
function checked(request) {
  const start=init(request.seat);
  const validated=protocol.validateRequest(request,start,1,new Set());
  const response=create(request.seat).decide(request);
  protocol.validateDecision(response,validated.prompt,validated.actionTokens);
  return response;
}
function hoodItem(token,target,zone,index) {
  return {
    token,kind:'play-card',actorPrinting:'Stealthy Hood UNB 186',
    targetPrinting:target,
    publicMetadata:{
      targetSeat:'actor',targetZone:zone,
      ...(Number.isSafeInteger(index)?{targetIndex:index}:{}),
      isOwnerVisible:true
    }
  };
}
function energyChoice(token,printing,index) {
  return {
    token,kind:'energy',printing,label:printing,
    publicMetadata:{
      selectionIndex:index,selectedCount:1,sourceZone:'active',
      ownerSeat:'actor',isOwnerVisible:true,
      energyType:printing.includes('Double Dragon')?'Dragon':'Grass'
    }
  };
}

test('real V3 root+decision contract chooses correct Hood target under Wobbuffet',()=>{
  for(const seat of [0,1]) {
    const req=root(seat,{
      items:[
        hoodItem('wrong','Dedenne-GX UNB 57','bench',0),
        hoodItem('hood','Regidrago VSTAR SIT 136','active'),
        {token:'lillie',kind:'play-card',actorPrinting:"Lillie's Determination MEG 119"},
        {token:'pass',kind:'pass'}
      ],requestId:'rank32-hood-seat-'+seat
    });
    assert.deepEqual(checked(req),{kind:'select-action',token:'hood'});
    req.observation.opponentPublic.active=pokemon('Shadow Rider Calyrex VMAX CRE 75',
      {subtypes:['VMAX']});
    assert.deepEqual(checked(req),{kind:'select-action',token:'lillie'});
  }
});

test('real V3 prompt+decision contract permits exactly actor-offered Ryuno payment',()=>{
  for(const seat of [0,1]) {
    const p={
      schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ChooseEnergyPrompt',
      description:'Choose Energy to discard for Ryuno Glide',
      source:{
        classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:'Mega Dragonite ex ASC 152',effectName:'Ryuno Glide'
      },
      choices:[
        energyChoice('dde','Double Dragon Energy ROS 97',0),
        energyChoice('grass','Grass Energy MEE 9',1),
        energyChoice('fire','Fire Energy MEE 10',2)
      ],publicMetadata:{
        selectionType:'energy-payment',energyCount:3,count:3,
        allowCancel:false,isSecret:false
      }
    };
    const req=root(seat,{prompt:p,items:[],requestId:'rank32-ryuno-seat-'+seat});
    assert.deepEqual(checked(req),{kind:'select-choices',tokens:['grass','fire']});
    // Hard negative: no fabricated choice when a payer is absent. DDE is
    // selected as one card providing two Energy, never an unoffered Basic.
    p.choices=[energyChoice('dde','Double Dragon Energy ROS 97',0)];
    p.publicMetadata.energyCount=1;
    p.publicMetadata.count=1;
    assert.deepEqual(checked(req),{kind:'select-choices',tokens:['dde']});
  }
});

test('real V3 request rejects hidden opponent hand and seed under rank-32 worker',()=>{
  const req=root();
  const start=init(0);
  assert.throws(()=>protocol.validateRequest({
    ...req,observation:{...req.observation,opponentHand:['secret']}
  },start,1,new Set()),/FIELD|FORBIDDEN|OBSERVATION/);
  assert.throws(()=>protocol.validateRequest({
    ...req,observation:{...req.observation,rngSeed:12}
  },start,1,new Set()),/FIELD|FORBIDDEN|RANDOM/);
});


test('V3 native frontier attachment is targeted and DDE beats Basic on an unfunded VSTAR',()=>{
  for(const seat of [0,1]) {
    const own=player({
      active:pokemon('Regidrago VSTAR SIT 136',{energies:[],subtypes:['VSTAR']}),
      bench:[pokemon('Dedenne-GX UNB 57',{subtypes:['Basic','GX']})]
    });
    const items=[
      {token:'dde-wrong',kind:'play-card',actorPrinting:'Double Dragon Energy ROS 97',
        targetPrinting:'Dedenne-GX UNB 57',
        publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0,isOwnerVisible:true}},
      {token:'grass',kind:'play-card',actorPrinting:'Grass Energy MEE 9',
        targetPrinting:'Regidrago VSTAR SIT 136',
        publicMetadata:{targetSeat:'actor',targetZone:'active',isOwnerVisible:true}},
      {token:'dde',kind:'play-card',actorPrinting:'Double Dragon Energy ROS 97',
        targetPrinting:'Regidrago VSTAR SIT 136',
        publicMetadata:{targetSeat:'actor',targetZone:'active',isOwnerVisible:true}},
      {token:'pass',kind:'pass'}
    ];
    const req=root(seat,{own,items,hand:['Grass Energy MEE 9','Double Dragon Energy ROS 97'],
      requestId:'rank32-native-energy-seat-'+seat});
    assert.deepEqual(checked(req),{kind:'select-action',token:'dde'});
  }
});

test('V3 contract clears hostile Temple before attaching suppressed Double Dragon',()=>{
  const opponent=player({
    active:pokemon('Shadow Rider Calyrex VMAX CRE 75',{subtypes:['VMAX']}),
    stadium:['Temple of Sinnoh ASR 155']
  });
  const items=[
    {token:'dde',kind:'play-card',actorPrinting:'Double Dragon Energy ROS 97',
      targetPrinting:'Regidrago VSTAR SIT 136',
      publicMetadata:{targetSeat:'actor',targetZone:'active',isOwnerVisible:true}},
    {token:'parallel',kind:'play-card',actorPrinting:'Parallel City BKT 145'},
    {token:'pass',kind:'pass'}
  ];
  const own=player({
    active:pokemon('Regidrago VSTAR SIT 136',{energies:['Grass Energy MEE 9']})
  });
  const req=root(0,{own,opponent,hand:['Double Dragon Energy ROS 97'],items,
    requestId:'rank32-native-temple'});
  assert.deepEqual(checked(req),{kind:'select-action',token:'parallel'});
  opponent.stadium=[];
  assert.deepEqual(checked(req),{kind:'select-action',token:'dde'});
});


function enginePrompt(seat,effectName,promptType,choices,metadata) {
  return {
    schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType,
    description:effectName,source:{
      classification:'actor-choice',sourceKind:'engine',
      sourcePrinting:null,effectName
    },choices,publicMetadata:metadata
  };
}
function startChoice(token,printing,index) {
  return {
    token,kind:'card',printing,label:printing,
    publicMetadata:{selectionIndex:index,selectedCount:1,
      sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true}
  };
}

test('V3 setup selects Regidrago V active, preserves one-play Basic draw supports',()=>{
  for(const seat of [0,1]) {
    const list=[
      ['ded','Dedenne-GX UNB 57'],['bud','Budew ASC 16'],
      ['v','Regidrago V SIT 135'],['tap','Tapu Lele-GX GRI 60'],
      ['lat','Latias ex SSP 76'],['cr','Crobat V DAA 104']
    ];
    const p=enginePrompt(seat,'CHOOSE_STARTING_POKEMONS','ChooseCardsPrompt',
      list.map(([token,printing],i)=>startChoice(token,printing,i)),{
        selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
        isOwnerVisible:true,minimumCount:1,maximumCount:6,
        allowCancel:false,isSecret:false
      });
    const own=player({active:null,bench:[]});
    const req=root(seat,{phase:1,own,prompt:p,items:[],
      hand:list.map(x=>x[1]),requestId:'rank32-start-seat-'+seat});
    assert.deepEqual(checked(req),{kind:'select-choices',tokens:['v','lat','bud']});
    // Two Stage-1-trigger and draw-on-bench Basics remain in hand at setup.
    assert.equal(p.choices.some(c=>c.token==='ded'),true);
    assert.equal(p.choices.some(c=>c.token==='tap'),true);
  }
});

test('V3 setup after Active placement declines dead on-play Basic helpers on Bench',()=>{
  const p=enginePrompt(0,'CHOOSE_STARTING_POKEMONS','ChooseCardsPrompt',[
    startChoice('tap','Tapu Lele-GX GRI 60',0),
    startChoice('ded','Dedenne-GX UNB 57',1),
    {token:'none',kind:'empty-selection',label:'Select none'}
  ],{selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
    isOwnerVisible:true,minimumCount:0,maximumCount:2,
    allowCancel:false,isSecret:false});
  const own=player({active:pokemon('Regidrago V SIT 135',{subtypes:['Basic','V']})});
  const req=root(0,{phase:1,own,prompt:p,items:[],
    hand:['Tapu Lele-GX GRI 60','Dedenne-GX UNB 57'],
    requestId:'rank32-extra-bench-none'});
  assert.deepEqual(checked(req),{kind:'select-choice',token:'none'});
});

test('V3 setup chooses second for turbo lines and max strictly indexed mulligan draw',()=>{
  const p=enginePrompt(0,'GO_FIRST','ConfirmPrompt',[
    {token:'yes',kind:'confirm',label:'Yes'},
    {token:'no',kind:'confirm',label:'No'}
  ],{selectionType:'confirm'});
  const own=player({active:null});
  const req=root(0,{phase:1,own,prompt:p,items:[],requestId:'rank32-go-second'});
  assert.deepEqual(checked(req),{kind:'select-choice',token:'no'});
  p.promptType='SelectPrompt';
  p.description='WANT_TO_DRAW_CARDS';
  p.source.effectName='WANT_TO_DRAW_CARDS';
  p.publicMetadata={selectionType:'option',count:3,allowCancel:false};
  p.choices=[
    {token:'two',kind:'option',label:'Draw 2 card(s)',publicMetadata:{choiceIndex:0}},
    {token:'one',kind:'option',label:'Draw 1 card(s)',publicMetadata:{choiceIndex:1}},
    {token:'zero',kind:'option',label:'Draw 0 card(s)',publicMetadata:{choiceIndex:2}}
  ];
  req.observation.pendingPromptType='SelectPrompt';
  assert.deepEqual(checked(req),{kind:'select-choice',token:'two'});
});


test('V3 Cynthia & Caitlin recovery follows funded Regidrago need, not first discard option',()=>{
  const own=player({
    active:pokemon('Regidrago VSTAR SIT 136',{
      energies:['Double Dragon Energy ROS 97']}),
    discard:['Crispin SCR 133','Guzma BUS 115']
  });
  const p={
    schema:protocol.PROMPT_SCHEMA,actingSeat:0,promptType:'ChooseCardsPrompt',
    description:'Select a Supporter from discard pile',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:'Cynthia & Caitlin CEC 189',effectName:'Cynthia & Caitlin'},
    choices:[
      {token:'guzma',kind:'card',printing:'Guzma BUS 115',label:'Guzma',
        publicMetadata:{selectionIndex:0,selectedCount:1,
          sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true}},
      {token:'crispin',kind:'card',printing:'Crispin SCR 133',label:'Crispin',
        publicMetadata:{selectionIndex:1,selectedCount:1,
          sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true}}
    ],
    publicMetadata:{selectionType:'card-combination',
      sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true,
      minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false}
  };
  const req=root(0,{own,phase:2,prompt:p,items:[],requestId:'rank32-cynthia-recovery'});
  assert.deepEqual(checked(req),{kind:'select-choices',tokens:['crispin']});
});

test('V3 optional Cynthia hand discard keeps Double Dragon and chooses empty selection',()=>{
  const p={
    schema:protocol.PROMPT_SCHEMA,actingSeat:1,promptType:'ChooseCardsPrompt',
    description:'You may discard a card from hand',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:'Cynthia & Caitlin CEC 189',effectName:'Cynthia & Caitlin'},
    choices:[
      {token:'dde',kind:'card',printing:'Double Dragon Energy ROS 97',
        label:'Double Dragon Energy',
        publicMetadata:{selectionIndex:0,selectedCount:1,
          sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true}},
      {token:'none',kind:'empty-selection',label:'Select none'}
    ],
    publicMetadata:{selectionType:'card-combination',
      sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
      minimumCount:0,maximumCount:1,allowCancel:false,isSecret:false}
  };
  const req=root(1,{phase:2,prompt:p,items:[],
    hand:['Double Dragon Energy ROS 97'],requestId:'rank32-cynthia-preserve-dde'});
  assert.deepEqual(checked(req),{kind:'select-choice',token:'none'});
});


test('V3 Legacy Star root checks deck safety before consuming one-use VSTAR Power',()=>{
  const own=player({
    active:pokemon('Regidrago VSTAR SIT 136',{
      subtypes:['VSTAR'],stage:'STAGE_1'
    }),
    discard:['Double Dragon Energy ROS 97']
  });
  const items=[
    {token:'star',kind:'use-ability',actorPrinting:'Regidrago VSTAR SIT 136',
      publicMetadata:{abilityName:'Legacy Star',isOwnerVisible:true}},
    {token:'pass',kind:'pass'}
  ];
  const req=root(0,{own,items,hand:['Grass Energy MEE 9'],requestId:'rank32-vstar-deck'});
  assert.deepEqual(checked(req),{kind:'select-action',token:'star'});
  own.deckCount=6;
  assert.deepEqual(checked(req),{kind:'select-action',token:'pass'});
});

test('V3 Legacy Star recovery preserves copied Goodra and Dragonite donors',()=>{
  const p={
    schema:protocol.PROMPT_SCHEMA,actingSeat:0,promptType:'ChooseCardsPrompt',
    description:'Choose up to two cards from discard pile',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:'Regidrago VSTAR SIT 136',effectName:'Legacy Star'},
    choices:[
      {token:'goodra',kind:'card',printing:'Hisuian Goodra VSTAR LOR 136',
        label:'Hisuian Goodra VSTAR',publicMetadata:{
          selectionIndex:0,selectedCount:1,sourceZone:'discard',
          ownerSeat:'actor',isOwnerVisible:true}},
      {token:'dde',kind:'card',printing:'Double Dragon Energy ROS 97',
        label:'Double Dragon Energy',publicMetadata:{
          selectionIndex:1,selectedCount:1,sourceZone:'discard',
          ownerSeat:'actor',isOwnerVisible:true}},
      {token:'dragonite',kind:'card',printing:'Mega Dragonite ex ASC 152',
        label:'Mega Dragonite ex',publicMetadata:{
          selectionIndex:2,selectedCount:1,sourceZone:'discard',
          ownerSeat:'actor',isOwnerVisible:true}},
      {token:'none',kind:'empty-selection',label:'Select none'}
    ],publicMetadata:{
      selectionType:'card-combination',sourceZone:'discard',ownerSeat:'actor',
      isOwnerVisible:true,minimumCount:0,maximumCount:2,
      allowCancel:false,isSecret:false
    }
  };
  const own=player({
    active:pokemon('Regidrago VSTAR SIT 136',{energies:['Grass Energy MEE 9']}),
    discard:['Double Dragon Energy ROS 97',
      'Hisuian Goodra VSTAR LOR 136','Mega Dragonite ex ASC 152']
  });
  const req=root(0,{own,prompt:p,items:[],requestId:'rank32-vstar-recovery'});
  assert.deepEqual(checked(req),{kind:'select-choices',tokens:['dde']});
  p.choices=p.choices.filter(c=>c.token!=='dde');
  assert.deepEqual(checked(req),{kind:'select-choice',token:'none'});
});


test('V3 Super Rod only selects attacker/Energy recovery, never Apex donor payloads',()=>{
  const p={
    schema:protocol.PROMPT_SCHEMA,actingSeat:1,
    promptType:'ChooseCardsPrompt',description:'Shuffle up to 3 Pokemon or Basic Energy into deck',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:'Super Rod PAL 188',effectName:'Super Rod'},
    choices:[
      {token:'goodra',kind:'card',printing:'Hisuian Goodra VSTAR LOR 136',
        label:'Goodra',publicMetadata:{selectionIndex:0,selectedCount:1,
          sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true}},
      {token:'basic',kind:'card',printing:'Regidrago V SIT 135',
        label:'Regidrago V',publicMetadata:{selectionIndex:1,selectedCount:1,
          sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true}},
      {token:'fire',kind:'card',printing:'Fire Energy MEE 10',
        label:'Basic Fire',publicMetadata:{selectionIndex:2,selectedCount:1,
          sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true}},
      {token:'dragonite',kind:'card',printing:'Mega Dragonite ex ASC 152',
        label:'Mega Dragonite',publicMetadata:{selectionIndex:3,selectedCount:1,
          sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true}},
      {token:'none',kind:'empty-selection',label:'Select none'}
    ],
    publicMetadata:{
      selectionType:'card-combination',sourceZone:'discard',ownerSeat:'actor',
      isOwnerVisible:true,minimumCount:0,maximumCount:3,
      allowCancel:false,isSecret:false
    }
  };
  const own=player({
    active:pokemon('Regidrago VSTAR SIT 136'),
    discard:['Hisuian Goodra VSTAR LOR 136','Regidrago V SIT 135',
      'Fire Energy MEE 10','Mega Dragonite ex ASC 152']
  });
  const req=root(1,{own,prompt:p,items:[],requestId:'rank32-v3-superrod'});
  const decision=checked(req);
  assert.equal(decision.kind,'select-choices');
  assert.deepEqual(decision.tokens.slice().sort(),['basic','fire']);
  p.choices=p.choices.filter(c=>!['basic','fire'].includes(c.token));
  assert.deepEqual(checked(req),{kind:'select-choice',token:'none'});
});


test('V3 Apex chooses no-discard Rolling Iron KO but Ryuno for otherwise unkillable VMAX',()=>{
  const p={
    schema:protocol.PROMPT_SCHEMA,actingSeat:1,promptType:'ChooseAttackPrompt',
    description:'Choose attack for Apex Dragon',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:'Regidrago VSTAR SIT 136',effectName:'Apex Dragon'},
    choices:[
      {token:'ryuno',kind:'attack',printing:'Mega Dragonite ex ASC 152',
        label:'Ryuno Glide',publicMetadata:{
          choiceIndex:0,sourceAttack:'Ryuno Glide',sourceZone:'discard',
          ownerSeat:'actor',isOwnerVisible:true}},
      {token:'rolling',kind:'attack',printing:'Hisuian Goodra VSTAR LOR 136',
        label:'Rolling Iron',publicMetadata:{
          choiceIndex:1,sourceAttack:'Rolling Iron',sourceZone:'discard',
          ownerSeat:'actor',isOwnerVisible:true}}
    ],publicMetadata:{selectionType:'attack',count:2,allowCancel:false}
  };
  const own=player({
    active:pokemon('Regidrago VSTAR SIT 136',{
      energies:['Double Dragon Energy ROS 97','Grass Energy MEE 9'],
      subtypes:['VSTAR'],stage:'STAGE_1'})
  });
  const opponent=player({active:pokemon('Wobbuffet PHF 36',{
    hp:110,damage:0,subtypes:['Basic'],stage:'BASIC'})});
  const req=root(1,{own,opponent,prompt:p,items:[],
    requestId:'rank32-apex-rolling-ko'});
  assert.deepEqual(checked(req),{kind:'select-choice',token:'rolling'});
  opponent.active=pokemon('Shadow Rider Calyrex VMAX CRE 75',{
    hp:320,damage:0,subtypes:['VMAX'],stage:'STAGE_1'});
  assert.deepEqual(checked(req),{kind:'select-choice',token:'ryuno'});
});
