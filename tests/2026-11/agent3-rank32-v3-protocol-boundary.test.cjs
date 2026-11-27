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
      actorSeat:seat,globalTurn:4,phase:2,
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
        publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0}},
      {token:'grass',kind:'play-card',actorPrinting:'Grass Energy MEE 9',
        targetPrinting:'Regidrago VSTAR SIT 136',
        publicMetadata:{targetSeat:'actor',targetZone:'active'}},
      {token:'dde',kind:'play-card',actorPrinting:'Double Dragon Energy ROS 97',
        targetPrinting:'Regidrago VSTAR SIT 136',
        publicMetadata:{targetSeat:'actor',targetZone:'active'}},
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
      publicMetadata:{targetSeat:'actor',targetZone:'active'}},
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
