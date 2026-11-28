'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const { POLICY_VERSION, createPolicy } =
  require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');

const MEGA = 'Mega Lopunny ex PFL 84';
const SHADOW = 'Shadow Rider Calyrex V CRE 74';
const PCE = 'Powerful Colorless Energy DAA 176';
const TEMPLE = 'Temple of Sinnoh ASR 155';

function pokemon(print,name,energy=[],damage=0,hp=320,stage='STAGE_1') {
  return {
    printing:print,name,hp,damage,lastPlayedOrEvolvedTurn:null,
    printed:{stage,subtypes:[],types:[stage==='BASIC'?'Psychic':'Colorless'],
      retreatCost:[],weakness:[],resistance:[]},
    specialConditions:[],
    publicRestrictions:Object.fromEntries(protocol.PUBLIC_RESTRICTION_KEYS.map(k=>[
      k,k==='cannotUseAttacksNextTurn'?[]:
        k.startsWith('blocked')||k==='onlyAllowedAttackNameNextTurn'?null:
        k.startsWith('attackCost')?0:false])),
    evolutionPrintings:[],energies:energy,tools:[],attacks:[],
    abilities:[],abilityDetails:[],abilitySuppressions:null
  };
}
function player(active,bench,stadium,prizeCount) {
  const restrictions=Object.fromEntries(protocol.PLAYER_RESTRICTION_KEYS.map(k=>[
    k,k==='attackMaxEnergy'?null:k==='ignoreAttackCostCardTypes'?[]:
      k==='stadiumAndToolHaveNoEffectTurnsRemaining'?0:
      k.includes('TurnsRemaining')?0:false
  ]));
  return {active,bench,stadium,discard:[],lostZone:[],resolvingSupporter:[],
    publicHand:null,prizeSlots:[],publicTurnRestrictions:restrictions,
    handCount:2,deckCount:30,prizeCount};
}
const eventPokemon=(p,moved)=>p===null?null:
  {printing:p.printing,movedFromBenchToActiveThisTurn:moved,knownAbilityUse:[]};

function fullRequest(seat,templeActive) {
  const mega=pokemon(MEGA,'Mega Lopunny ex',
    [PCE,'Grass Energy BLW 105','Grass Energy BLW 105','Jet Energy PAL 190'],120);
  const opp=pokemon(SHADOW,'Shadow Rider Calyrex V',
    ['Basic Psychic Energy CRE 232'],40,210,'BASIC');
  opp.printed.weakness=[{type:'Darkness',value:'×2'}];
  const backup=pokemon(MEGA,'Mega Lopunny ex');
  const oppBackup=pokemon('Shadow Rider Calyrex VMAX CRE 75','Shadow Rider Calyrex VMAX');
  return {
    schema:protocol.REQUEST_SCHEMA,type:'decision',
    requestId:'agent41-rank15-'+seat+'-'+Number(templeActive),
    sequence:1,role:'opponent',seat,
    observationSchema:protocol.OBSERVATION_SCHEMA,
    observation:{
      actorSeat:seat,globalTurn:6,phase:2,decisionKind:'owner-root',
      pendingPromptType:null,pendingOwnerDeckSearch:false,
      ownHand:['Double Colorless Energy SUM 136'],
      ownPublic:player(mega,[backup],[],2),
      opponentPublic:player(opp,[oppBackup],templeActive?[TEMPLE]:[],3),
      ownTurnResources:Object.fromEntries(protocol.TURN_RESOURCE_KEYS.map(k=>[k,null])),
      ownerK1:null
    },
    prompt:null,
    publicEventReceipt:{
      version:protocol.EVENT_RECEIPT_VERSION,actorSeat:seat,turn:6,
      ownerActive:eventPokemon(mega,true),ownerBench:[eventPokemon(backup,false)],
      priorOpponentTurnKO:{any:null,byAttack:null},
      opponentLastTurnAttack:null,opponentLastTurnTurn:null,opponentLastTurnAttacks:null
    },
    actionFrontier:{
      schema:protocol.FRONTIER_SCHEMA,
      items:[
        {kind:'attack',token:'spiky',actorPrinting:MEGA,attackName:'Spiky Hopper'},
        {kind:'attack',token:'gale',actorPrinting:MEGA,attackName:'Gale Thrust'}
      ]
    }
  };
}
for(const seat of [0,1]) {
  for(const templeActive of [true,false]) {
    test('seat '+seat+' Temple '+String(templeActive)+': full strict V3 root request and decision are admitted',()=>{
      const request=fullRequest(seat,templeActive);
      const admission=protocol.validateRequest(request,{role:'opponent',seat},1,new Set());
      const policy=createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config:{}});
      const decision=policy.decide(request);
      assert.deepEqual(protocol.validateDecision(decision,admission.prompt,admission.actionTokens),{
        kind:'select-action',token:templeActive?'gale':'spiky'
      });
    });
  }
}
