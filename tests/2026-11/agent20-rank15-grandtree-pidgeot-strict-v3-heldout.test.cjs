'use strict';

// Admission-level pure V3 request and decision tests for original rank15.
// Does not instantiate or dispatch a native Store and is not a game.
const test=require('node:test');
const assert=require('node:assert/strict');
const protocol=require(
  '../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {POLICY_VERSION,createPolicy}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');

const ODDISH='Oddish UNB 5',FAN='Fan Rotom SCR 118';
const TREE='Grand Tree SCR 136',PIGEOT='Pidgeot ex OBF 164';
const BELT='Choice Belt PAL 176',PCE='Powerful Colorless Energy DAA 176';
const JAM='Jamming Tower TWM 153',SHADOW='Shadow Rider Calyrex V CRE 74';

function pokemon(printing,name,{hp=70,stage='BASIC',damage=0,energy=[],tools=[],
  played=null}={}){
  return {printing,name,hp,damage,lastPlayedOrEvolvedTurn:played,
    printed:{stage,subtypes:[],types:[stage==='BASIC'?'Grass':'Colorless'],
      retreatCost:[],weakness:[],resistance:[]},
    specialConditions:[],
    publicRestrictions:Object.fromEntries(protocol.PUBLIC_RESTRICTION_KEYS.map(k=>[
      k,k==='cannotUseAttacksNextTurn'?[]:
        k.startsWith('blocked')||k==='onlyAllowedAttackNameNextTurn'?null:
        k.startsWith('attackCost')?0:false
    ])),
    evolutionPrintings:[],energies:energy,tools,attacks:[],abilities:[],
    abilityDetails:[],abilitySuppressions:null
  };
}
function player(active,bench,stadium,prizeCount){
  return {active,bench,stadium,discard:[],lostZone:[],resolvingSupporter:[],
    publicHand:null,prizeSlots:[],
    publicTurnRestrictions:Object.fromEntries(protocol.PLAYER_RESTRICTION_KEYS.map(k=>[
      k,k==='attackMaxEnergy'?null:k==='ignoreAttackCostCardTypes'?[]:
        k==='stadiumAndToolHaveNoEffectTurnsRemaining'?0:
        k.includes('TurnsRemaining')?0:false
    ])),
    handCount:2,deckCount:30,prizeCount
  };
}
const eventPokemon=(p,moved)=>p===null?null:{
  printing:p.printing,movedFromBenchToActiveThisTurn:moved,knownAbilityUse:[]
};
function envelope(seat,active,ownBench,opp,stadium=[],kind='owner-prompt'){
  return {schema:protocol.REQUEST_SCHEMA,type:'decision',
    requestId:'agent20-source-strict-'+seat+'-'+kind,
    sequence:1,role:'opponent',seat,
    observationSchema:protocol.OBSERVATION_SCHEMA,
    observation:{actorSeat:seat,globalTurn:6,phase:2,decisionKind:kind,
      pendingPromptType:kind==='owner-prompt'?'ChoosePokemonPrompt':null,
      pendingOwnerDeckSearch:false,
      ownHand:[],
      ownPublic:player(active,ownBench,stadium,2),
      opponentPublic:player(opp,[pokemon('Pidgey FLF 75','Pidgey')],[],3),
      ownTurnResources:Object.fromEntries(protocol.TURN_RESOURCE_KEYS.map(k=>[k,null])),
      ownerK1:null
    },prompt:null,
    publicEventReceipt:{
      version:protocol.EVENT_RECEIPT_VERSION,actorSeat:seat,turn:6,
      ownerActive:eventPokemon(active,false),
      ownerBench:ownBench.map(x=>eventPokemon(x,false)),
      priorOpponentTurnKO:{any:null,byAttack:null},
      opponentLastTurnAttack:null,opponentLastTurnTurn:null,
      opponentLastTurnAttacks:null
    },
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}
  };
}
function checkedDecision(r,seat){
  const admission=protocol.validateRequest(r,{role:'opponent',seat},1,new Set());
  const policy=createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config:{}});
  return protocol.validateDecision(policy.decide(r),admission.prompt,admission.actionTokens);
}
for(const seat of [0,1]){
  test('seat '+seat+': strict V3 Grand Tree selects older physical Oddish index 1',()=>{
    const old=pokemon(ODDISH,'Oddish',{played:5,hp:50});
    const young=pokemon(ODDISH,'Oddish',{played:6,hp:50});
    const fan=pokemon(FAN,'Fan Rotom',{played:5});
    const opp=pokemon(SHADOW,'Shadow Rider Calyrex V',{hp:210});
    const r=envelope(seat,fan,[young,old],opp);
    r.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'ChoosePokemonPrompt',description:null,
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:TREE,effectName:'Grand Tree'},
      choices:[0,1].map(i=>({kind:'pokemon',token:'oddish-'+i,
        printing:ODDISH,publicMetadata:{
          ownerSeat:'actor',targetZone:'bench',benchIndex:i
        }})),
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
        allowCancel:false,ownerSeat:'actor',targetZone:'bench'}
    };
    assert.deepEqual(checkedDecision(r,seat),{
      kind:'select-choices',tokens:['oddish-1']
    });
  });
  for(const [jammed,expected] of [[false,'blustery'],[true,'oddish']]){
    test('seat '+seat+': strict V3 Pidgeot live Tool terminal '+!jammed,()=>{
      const active=pokemon(PIGEOT,'Pidgeot ex',{stage:'STAGE_2',hp:280,
        energy:[PCE,'Grass Energy BLW 105'],tools:[BELT],played:5});
      const opp=pokemon(SHADOW,'Shadow Rider Calyrex V',{hp:210,damage:40});
      const r=envelope(seat,active,[],opp,jammed?[JAM]:[],'owner-root');
      r.observation.ownHand=[ODDISH];
      r.actionFrontier.items=[
        {kind:'attack',token:'blustery',actorPrinting:PIGEOT,
          attackName:'Blustery Wind'},
        {kind:'play-card',token:'oddish',actorPrinting:ODDISH}
      ];
      assert.deepEqual(checkedDecision(r,seat),{kind:'select-action',token:expected});
    });
  }
}


for(const seat of [0,1]){
  test('seat '+seat+': strict V3 Grand Tree mixed-chain Gloom must not hide Pidgeot',()=>{
    const gloom=pokemon('Gloom UNB 7','Gloom',{hp:90,stage:'STAGE_1',played:4});
    const pidgeotto=pokemon('Pidgeotto TEU 123','Pidgeotto',{
      hp:80,stage:'STAGE_1',played:6
    });
    const fan=pokemon(FAN,'Fan Rotom',{played:5});
    const opp=pokemon(SHADOW,'Shadow Rider Calyrex V',{hp:210});
    const r=envelope(seat,fan,[gloom,pidgeotto],opp);
    r.observation.pendingPromptType='ChooseCardsPrompt';
    r.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'ChooseCardsPrompt',description:null,
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:TREE,effectName:'Grand Tree'},
      choices:[{kind:'card',token:'pidgeot-stage2',printing:PIGEOT,
        publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}}],
      publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
        ownerSeat:'actor',minimumCount:1,maximumCount:1,allowCancel:false}
    };
    assert.deepEqual(checkedDecision(r,seat),{
      kind:'select-choices',tokens:['pidgeot-stage2']
    });
  });
}


for(const seat of [0,1]){
  test('seat '+seat+': strict V3 TM Evolution selects two physical Oddish targets',()=>{
    const a=pokemon(ODDISH,'Oddish',{played:6,hp:50});
    const b=pokemon(ODDISH,'Oddish',{played:6,hp:50});
    const active=pokemon('Bunnelby PRC 121','Bunnelby',{played:5,hp:60});
    const opp=pokemon(SHADOW,'Shadow Rider Calyrex V',{hp:210});
    const r=envelope(seat,active,[a,b],opp);
    r.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'ChoosePokemonPrompt',description:null,
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:'Technical Machine: Evolution PAR 178',
        effectName:'Evolution'},
      choices:[0,1].map(i=>({kind:'pokemon',token:'oddish-'+i,
        printing:ODDISH,publicMetadata:{
          ownerSeat:'actor',targetZone:'bench',benchIndex:i
        }})),
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:2,
        allowCancel:false,ownerSeat:'actor',targetZone:'bench'}
    };
    assert.deepEqual(checkedDecision(r,seat),{
      kind:'select-choices',tokens:['oddish-0','oddish-1']
    });
  });
}
