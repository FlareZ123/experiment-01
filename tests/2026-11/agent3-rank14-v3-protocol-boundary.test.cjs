'use strict';

/* Protocol-enveloped, actor-only source rank14 Regidrago root/setup tests.
 * These run the real V3 validators, not a simulated game or Store.
 */

const test=require('node:test');
const assert=require('node:assert/strict');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const rank14=require('../../simulation/evaluation/2026-11/agent3-rank14-regidrago-worker-bundle.cjs');

function pokemon(printing,more={}){
  return {
    printing,name:printing.replace(/ [A-Z0-9]+ [A-Z0-9]+$/,''),
    hp:280,damage:0,lastPlayedOrEvolvedTurn:1,
    printed:{stage:'BASIC',subtypes:['Basic'],types:['Dragon'],
      retreatCost:[],weakness:[],resistance:[]},
    specialConditions:[],
    publicRestrictions:{
      cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
      blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,
      onlyAllowedAttackNameNextTurn:null,attackCostIncreaseNextTurn:0,
      attackCostIncreaseWhileActive:0,cannotRetreat:false,
      cannotRetreatNextTurn:false,cannotRetreatWhileActive:false,
      cannotEvolveNextTurn:false
    },evolutionPrintings:[],energies:[],tools:[],attacks:[],
    abilities:[],abilityDetails:[],abilitySuppressions:null,...more
  };
}
function player({active=null,bench=[],stadium=[],discard=[]}={}){
  const spaces=bench.slice();while(spaces.length<5)spaces.push(null);
  return {
    active,bench:spaces,stadium,discard,lostZone:[],resolvingSupporter:[],
    publicHand:null,prizeSlots:Array.from({length:6},(_,index)=>({index})),
    publicTurnRestrictions:{
      gxUsed:false,vstarUsed:false,attackLockTurnsRemaining:0,
      attackMaxEnergy:null,attackMaxEnergyTurnsRemaining:0,
      ignoreAttackCostCardTypes:[],ignoreAttackCostTurnsRemaining:0,
      cannotUseGXAttacks:false,pokemonPlayLocked:false,
      abilityPokemonPlayLocked:false,evolutionPlayLocked:false,
      itemPlayLocked:false,supporterPlayLocked:false,
      stadiumPlayLocked:false,toolPlayLocked:false,
      energyPlayLocked:false,specialEnergyPlayLocked:false,
      stadiumAndToolHaveNoEffectTurnsRemaining:null
    },handCount:0,deckCount:30,prizeCount:6
  };
}
function turnResources(){
  return {
    supporterPlayedTurn:0,retreatedTurn:0,extraTurnActive:false,
    energyPlayedTurn:false,stadiumPlayedTurn:false,stadiumUsedTurn:false,
    vstarUsed:false,pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
    evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,
    stadiumPlayLocked:false,toolPlayLocked:false,
    energyPlayLocked:false,specialEnergyPlayLocked:false
  };
}
function init(seat){
  return protocol.validateInit({
    schema:protocol.INIT_SCHEMA,type:'init',role:'opponent',seat,
    policyVersion:rank14.POLICY_VERSION,bundleSha256:'a'.repeat(64),config:{}
  });
}
function request({seat=0,own=player({active:pokemon('Regidrago VSTAR SIT 136')}),
  opponent=player({active:pokemon('Shadow Rider Calyrex VMAX CRE 75')}),
  hand=[],items=[],prompt=null,phase=2,turn=4,id='rank14-v3'}={}){
  return {
    schema:protocol.REQUEST_SCHEMA,type:'decision',requestId:id,sequence:1,
    role:'opponent',seat,observationSchema:protocol.OBSERVATION_SCHEMA,
    observation:{actorSeat:seat,globalTurn:turn,phase,
      decisionKind:prompt?'owner-prompt':'owner-root',
      pendingPromptType:prompt?.promptType??null,
      pendingOwnerDeckSearch:false,ownHand:hand,ownPublic:own,
      opponentPublic:opponent,ownTurnResources:turnResources(),ownerK1:null},
    prompt,publicEventReceipt:null,
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items}
  };
}
function checked(req){
  const known=protocol.validateRequest(req,init(req.seat),1,new Set());
  const p=rank14.createPolicy({role:'opponent',seat:req.seat,
    policyVersion:rank14.POLICY_VERSION,config:{},
    rng:()=>{throw Error('RNG_DRAW');}});
  const d=p.decide(req);
  protocol.validateDecision(d,known.prompt,known.actionTokens);
  return d;
}
function rootItem(token,printing){
  return {token,kind:'play-card',actorPrinting:printing};
}
function chooseCard(token,printing,index){
  return {token,kind:'card',printing,label:printing,
    publicMetadata:{selectionIndex:index,selectedCount:1,sourceZone:'hand',
      ownerSeat:'actor',isOwnerVisible:true}};
}

test('rank14 V3 root permits Sky Field only at meaningful Bench pressure',()=>{
  const own=player({
    active:pokemon('Regidrago VSTAR SIT 136'),
    bench:Array.from({length:5},(_,i)=>pokemon(i===0?'Regidrago V SIT 135':'Budew ASC 16'))
  });
  const hand=['Sky Field ROS 89','Squawkabilly ex PAL 169','Tapu Lele-GX GRI 60'];
  const items=[rootItem('sky','Sky Field ROS 89'),{token:'pass',kind:'pass'}];
  const req=request({seat:0,own,hand,items,id:'rank14-sky-congested'});
  assert.deepEqual(checked(req),{kind:'select-action',token:'sky'});
  req.observation.ownHand=['Sky Field ROS 89'];
  assert.deepEqual(checked(req),{kind:'select-action',token:'pass'});
});

test('rank14 V3 first-turn source Squawk root avoids burning Double Dragon Energy',()=>{
  for(const seat of [0,1]) {
    const items=[rootItem('sq','Squawkabilly ex PAL 169'),{token:'pass',kind:'pass'}];
    const req=request({seat,turn:2,items,hand:['Grass Energy MEE 9'],
      id:'rank14-squawk-seat-'+seat});
    assert.deepEqual(checked(req),{kind:'select-action',token:'sq'});
    req.observation.ownHand=['Double Dragon Energy ROS 97','Quick Ball FST 237'];
    assert.deepEqual(checked(req),{kind:'select-action',token:'pass'});
  }
});

test('rank14 V3 setup keeps when-played-from-hand Squawk and Tapu Lele dormant',()=>{
  const choices=[
    chooseCard('sq','Squawkabilly ex PAL 169',0),
    chooseCard('v','Regidrago V SIT 135',1),
    chooseCard('tap','Tapu Lele-GX GRI 60',2),
    chooseCard('lat','Latias ex SSP 76',3)
  ];
  const p={
    schema:protocol.PROMPT_SCHEMA,actingSeat:1,
    promptType:'ChooseCardsPrompt',description:'CHOOSE_STARTING_POKEMONS',
    source:{classification:'actor-choice',sourceKind:'engine',
      sourcePrinting:null,effectName:'CHOOSE_STARTING_POKEMONS'},
    choices,publicMetadata:{selectionType:'card-combination',sourceZone:'hand',
      ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,maximumCount:4,
      allowCancel:false,isSecret:false}
  };
  const own=player({active:null});
  const req=request({seat:1,own,phase:1,turn:1,
    hand:choices.map(c=>c.printing),prompt:p,id:'rank14-start-actor1'});
  assert.deepEqual(checked(req),{kind:'select-choices',tokens:['v','lat']});
});
