'use strict';

// Admission-level pure V3 request and decision tests for original rank15.
// Does not instantiate or dispatch a native Store and is not a game.
const test=require('node:test');
const assert=require('node:assert/strict');
const protocol=require(
  '../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {projectNativeAction}=require(
  '../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
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


for(const seat of [0,1]){
  test('seat '+seat+': strict V3 TM Evolution retrieves both offered Gloom cards',()=>{
    const a=pokemon(ODDISH,'Oddish',{played:6,hp:50});
    const b=pokemon(ODDISH,'Oddish',{played:6,hp:50});
    const active=pokemon('Bunnelby PRC 121','Bunnelby',{played:5,hp:60});
    const opp=pokemon(SHADOW,'Shadow Rider Calyrex V',{hp:210});
    const r=envelope(seat,active,[a,b],opp);
    r.observation.pendingPromptType='ChooseCardsPrompt';
    r.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'ChooseCardsPrompt',description:null,
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:'Technical Machine: Evolution PAR 178',
        effectName:'Evolution'},
      choices:[0,1].map(i=>({kind:'card',token:'gloom-'+i,
        printing:'Gloom UNB 7',
        publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}})),
      publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
        ownerSeat:'actor',minimumCount:1,maximumCount:2,allowCancel:false}
    };
    assert.deepEqual(checkedDecision(r,seat),{
      kind:'select-choices',tokens:['gloom-0','gloom-1']
    });
  });
}


 // Strict V3 actor root and conditional engine Retreat continuation must
 // target the same paid physical Mega even if a BUS Bench is also offered.
for(const seat of [0,1]){
  test('seat '+seat+': strict physical terminal Retreat root and engine prompt agree',()=>{
    // Printed PRC121 Retreat Cost is two Colorless. The source contains
    // exactly one DCE, so the native-shaped offered Retreat must be funded.
    const active=pokemon('Bunnelby PRC 121','Bunnelby',{
      hp:60,energy:['Double Colorless Energy SUM 136']
    });
    const mega=pokemon('Mega Lopunny ex PFL 84','Mega Lopunny ex',{
      hp:290,stage:'STAGE_1',energy:['Grass Energy BLW 105']});
    const bus=pokemon('Vileplume BUS 6','Vileplume',{hp:140,stage:'STAGE_2'});
    const opp=pokemon('Iron Thorns ex TEF 77','Iron Thorns ex',{hp:230});
    const pidgeotto=pokemon('Pidgeotto TEU 123','Pidgeotto',{
      hp:80,stage:'STAGE_1'});
    const owned=[mega,bus,pidgeotto];
    const r=envelope(seat,active,owned,opp,[],'owner-root');
    // Reuse the exact host production RETREAT_ACTION projector with physical
    // benchIndex. Bunnelby's one source DCE satisfies its printed [C][C]
    // Retreat Cost while the Bench Mega retains its Basic Grass Energy.
    const nativeSlot=x=>({getPokemonCard:()=>({fullName:x.printing})});
    const state={players:[null,null],phase:2};
    state.players[seat]={active:nativeSlot(active),bench:owned.map(nativeSlot)};
    state.players[1-seat]={active:nativeSlot(opp),bench:[]};
    const hostChoices=owned.map((_,i)=>projectNativeAction({
      type:'RETREAT_ACTION',benchIndex:i
    },state,seat,{},'retreat-'+i));
    r.actionFrontier.items=[...hostChoices,
      {kind:'use-ability',token:'air-mail',actorPrinting:'Pidgeotto TEU 123',
        publicMetadata:{abilityName:'Air Mail'}}
    ];
    assert.deepEqual(checkedDecision(r,seat),{
      kind:'select-action',token:'retreat-0'
    });
    const continuation=envelope(seat,active,owned,opp,[],'owner-prompt');
    continuation.prompt={
      schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'ChoosePokemonPrompt',description:null,
      source:{classification:'actor-choice',sourceKind:'engine',
        sourcePrinting:null,effectName:'Retreat'},
      choices:[
        {kind:'pokemon',token:'mega-0',printing:mega.printing,
          publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}},
        {kind:'pokemon',token:'bus-1',printing:bus.printing,
          publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}},
        {kind:'pokemon',token:'pidgeotto-2',printing:pidgeotto.printing,
          publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:2}}
      ],
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
        allowCancel:false,ownerSeat:'actor',targetZone:'bench'}
    };
    assert.deepEqual(checkedDecision(continuation,seat),{
      kind:'select-choices',tokens:['mega-0']
    });
    // Actual host PLAY_CARD_ACTION projection for hand Jet onto an unpowered
    // *second* identically printed Mega; not a manually authored action item.
    const emptyMega=pokemon('Mega Lopunny ex PFL 84','Mega Lopunny ex',{
      hp:330,stage:'STAGE_1',energy:[]});
    const jetBench=[emptyMega,bus,pidgeotto,
      pokemon('Mega Lopunny ex PFL 84','Mega Lopunny ex',{
        hp:330,stage:'STAGE_1',energy:[]})];
    const jetRoot=envelope(seat,active,jetBench,opp,[],'owner-root');
    jetRoot.observation.ownHand=['Jet Energy PAL 190','Grass Energy BLW 105'];
    class EnergyCard { constructor(){
      this.fullName='Jet Energy PAL 190';this.name='Jet Energy';
    }}
    const jetState={players:[null,null],phase:2};
    jetState.players[seat]={active:nativeSlot(active),
      bench:jetBench.map(nativeSlot),
      hand:{cards:[new EnergyCard()]}};
    jetState.players[1-seat]={active:nativeSlot(opp),bench:[]};
    const native={EnergyCard,PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},
      SlotType:{BENCH:0}};
    const projectedJet=projectNativeAction({
      type:'PLAY_CARD_ACTION',handIndex:0,
      target:{player:0,slot:0,index:3}
    },jetState,seat,native,'jet-to-second-mega');
    assert.equal(projectedJet.kind,'play-card');
    assert.equal(projectedJet.publicMetadata.cardType,'energy');
    assert.equal(projectedJet.publicMetadata.targetIndex,3);
    assert.equal(projectedJet.targetPrinting,emptyMega.printing);
    jetRoot.actionFrontier.items=[projectedJet,{
      kind:'use-ability',token:'air-mail',actorPrinting:'Pidgeotto TEU 123',
      publicMetadata:{abilityName:'Air Mail'}
    }];
    assert.deepEqual(checkedDecision(jetRoot,seat),{
      kind:'select-action',token:'jet-to-second-mega'
    });
    // Complete owner sequence: Guzma gust, own unpowered Bench Mega,
    // manual Grass from hand, and a moved 230-Gale last-Prize knockout.
    const busG=pokemon('Vileplume BUS 6','Vileplume',{hp:140,stage:'STAGE_2'});
    const megaG=pokemon('Mega Lopunny ex PFL 84','Mega Lopunny ex',{hp:330,
      stage:'STAGE_1',energy:[]});
    const ironG=pokemon('Iron Thorns ex TEF 77','Iron Thorns ex',{
      hp:230,damage:10});
    const oldG=pokemon('Pidgey FLF 75','Pidgey',{hp:60});
    const gustRoot=envelope(seat,busG,[megaG,pidgeotto],oldG,[],'owner-root');
    gustRoot.observation.ownHand=['Guzma BUS 115','Grass Energy BLW 105'];
    gustRoot.observation.ownTurnResources.supporterPlayedTurn=5;
    gustRoot.observation.ownTurnResources.energyPlayedTurn=5;
    gustRoot.observation.opponentPublic.bench=[ironG];
    gustRoot.actionFrontier.items=[
      {kind:'play-card',token:'guzma',actorPrinting:'Guzma BUS 115'},
      {kind:'use-ability',token:'air-mail',actorPrinting:'Pidgeotto TEU 123',
        publicMetadata:{abilityName:'Air Mail'}}];
    assert.deepEqual(checkedDecision(gustRoot,seat),{
      kind:'select-action',token:'guzma'});
    const themPrompt=envelope(seat,busG,[megaG,pidgeotto],oldG,[],
      'owner-prompt');
    themPrompt.observation.ownHand=['Grass Energy BLW 105'];
    themPrompt.observation.opponentPublic.bench=[ironG];
    themPrompt.observation.ownTurnResources.supporterPlayedTurn=6;
    themPrompt.observation.ownTurnResources.energyPlayedTurn=5;
    themPrompt.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'ChoosePokemonPrompt',description:null,
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
      choices:[{kind:'pokemon',token:'enemy-iron',printing:ironG.printing,
        publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}}],
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
        allowCancel:false,ownerSeat:'opponent',targetZone:'bench'}};
    assert.deepEqual(checkedDecision(themPrompt,seat),{
      kind:'select-choices',tokens:['enemy-iron']});
    const ownPrompt=envelope(seat,busG,[megaG,pidgeotto],ironG,[],
      'owner-prompt');
    ownPrompt.observation.ownHand=['Grass Energy BLW 105'];
    ownPrompt.observation.opponentPublic.bench=[oldG];
    ownPrompt.observation.ownTurnResources.supporterPlayedTurn=6;
    ownPrompt.observation.ownTurnResources.energyPlayedTurn=5;
    ownPrompt.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'ChoosePokemonPrompt',description:null,
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
      choices:[
        {kind:'pokemon',token:'own-mega',printing:megaG.printing,
          publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}},
        {kind:'pokemon',token:'own-pidgeotto',printing:pidgeotto.printing,
          publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1}}],
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
        allowCancel:false,ownerSeat:'actor',targetZone:'bench'}};
    assert.deepEqual(checkedDecision(ownPrompt,seat),{
      kind:'select-choices',tokens:['own-mega']});
    const payment=envelope(seat,megaG,[busG,pidgeotto],ironG,[],'owner-root');
    payment.observation.ownHand=['Grass Energy BLW 105'];
    payment.observation.ownTurnResources.energyPlayedTurn=5;
    payment.observation.ownTurnResources.supporterPlayedTurn=6;
    payment.publicEventReceipt.ownerActive=eventPokemon(megaG,true);
    class GrassCard{constructor(){
      this.fullName='Grass Energy BLW 105';this.name='Grass Energy';}}
    const gs={players:[null,null],phase:2};
    gs.players[seat]={active:nativeSlot(megaG),bench:[busG,pidgeotto].map(nativeSlot),
      hand:{cards:[new GrassCard()]}};
    gs.players[1-seat]={active:nativeSlot(ironG),bench:[]};
    const projectedGrass=projectNativeAction({
      type:'PLAY_CARD_ACTION',handIndex:0,
      target:{player:0,slot:1,index:0}
    },gs,seat,{EnergyCard:GrassCard,
      PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},
      SlotType:{BENCH:0,ACTIVE:1}},'grass-to-mega');
    assert.equal(projectedGrass.publicMetadata.targetZone,'active');
    assert.equal(projectedGrass.targetPrinting,megaG.printing);
    payment.actionFrontier.items=[projectedGrass,{
      kind:'use-ability',token:'air-mail',actorPrinting:'Pidgeotto TEU 123',
      publicMetadata:{abilityName:'Air Mail'}}];
    assert.deepEqual(checkedDecision(payment,seat),{
      kind:'select-action',token:'grass-to-mega'});
    const paidG=pokemon(megaG.printing,'Mega Lopunny ex',{hp:330,
      stage:'STAGE_1',energy:['Grass Energy BLW 105']});
    const strike=envelope(seat,paidG,[busG,pidgeotto],ironG,[],'owner-root');
    strike.publicEventReceipt.ownerActive=eventPokemon(paidG,true);
    strike.actionFrontier.items=[{
      kind:'attack',token:'moved-gale',actorPrinting:megaG.printing,
      attackName:'Gale Thrust'}];
    assert.deepEqual(checkedDecision(strike,seat),{
      kind:'select-action',token:'moved-gale'});
  });
}
