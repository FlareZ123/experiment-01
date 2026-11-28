'use strict';

// Aichi opponent source worker: never hardcode the terminal Mega mobility
// opportunity to Shadow Rider V alone. This whitelist contains known ordinary
// V/ex target printings without defensive attacks/Abilities modifying current
// Gale damage; actual HP and prize values remain public-state requirements.
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootDecision,retreatPrompt,guzmaPrompt}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const MEGA='Mega Lopunny ex PFL 84', JET='Jet Energy PAL 190';
const LEGACY='Legacy Energy TWM 167', DEW='Life Dew PLF 107';
const plain=[
  'Shadow Rider Calyrex V CRE 74',
  'Iron Thorns ex TEF 77',
  'Regidrago V SIT 135',
  'Genesect V FST 185',
  'Mew V FST 113',
  'Lugia V SIT 138',
  'Crobat V DAA 104'
];
const c=(printing,tools=[],energies=[],extra={})=>({
  printing,tools,energies,hp:230,damage:0,printed:{stage:'BASIC'},...extra
});
function req(seat,target,{
  prizes=2,bench=false,legacy=false,dew=false,hp=230,damage=10
}={}){
  return {role:'opponent',seat,prompt:null,
    observation:{actorSeat:seat,globalTurn:9,
      ownPublic:{active:c('Vileplume BUS 6'),
        bench:[c(MEGA,[],['Grass Energy BLW 105'],{
          printed:{stage:'STAGE_1'},publicRestrictions:{}
        }),c('Pidgeotto TEU 123')],stadium:[],prizeCount:prizes
      },
      opponentPublic:{
        active:c(target,dew?[DEW]:[],legacy?[LEGACY]:[],{hp,damage}),
        bench:bench?[c('Pidgey FLF 75')]:[],prizeCount:3,stadium:[]
      }
    },
    publicEventReceipt:{actorSeat:seat,turn:9,ownerActive:{
      printing:'Vileplume BUS 6',movedFromBenchToActiveThisTurn:false
    }},
    actionFrontier:{items:[{
      kind:'play-card',token:'jet',actorPrinting:JET,targetPrinting:MEGA,
      publicMetadata:{
        targetSeat:'actor',targetZone:'bench',targetIndex:0,benchIndex:0
      }
    },{kind:'use-ability',token:'air-mail',actorPrinting:'Pidgeotto TEU 123',
      publicMetadata:{abilityName:'Air Mail'}}]}
  };
}
for(const seat of [0,1]){
  for(const target of plain){
    test('seat '+seat+': certified plain Gala target '+target+' 2 Prize mobility',()=>{
      assert.deepEqual(rootDecision(req(seat,target,{prizes:2,bench:true})),{
        kind:'select-action',token:'jet'
      });
    });
    test('seat '+seat+': no Bench backup wins through '+target+' with 3 Prizes',()=>{
      assert.deepEqual(rootDecision(req(seat,target,{prizes:3})),{
        kind:'select-action',token:'jet'
      });
    });
    test('seat '+seat+': target '+target+' with 3 Prizes plus Bench is nonterminal',()=>{
      assert.equal(rootDecision(req(seat,target,{
        prizes:3,bench:true
      })).token,'air-mail');
    });
  }
  for(const [name,options,selected] of [
    ['opponent lone Thorns ex with unspent Legacy and 4 own Prizes',{
      prizes:4,legacy:true},true],
    ['Thorns Legacy and opponent Bench, 2 own Prizes',{
      prizes:2,legacy:true,bench:true},false],
    ['Thorns Life Dew no Bench and 4 own Prizes',{
      prizes:4,dew:true},true],
    ['Thorns Life Dew opponent Bench and 2 own Prizes',{
      prizes:2,dew:true,bench:true},false],
    ['unsupported Arceus VSTAR with 170 HP left even alone',{
      prizes:2,hp:280,damage:110},false]
  ]){
    test('seat '+seat+': '+name,()=>{
      const target=name.startsWith('unsupported')?
        'Arceus VSTAR BRS 123':'Iron Thorns ex TEF 77';
      const r=rootDecision(req(seat,target,options));
      assert.equal(r.kind,'select-action');
      assert.equal(r.token,selected?'jet':'air-mail');
    });
  }
}


for(const seat of [0,1]){
  for(const target of plain){
    test('seat '+seat+': Guzma terminal Bench-target certification '+target,()=>{
      const request=req(seat,target,{prizes:2,bench:false});
      const o=request.observation;
      const desired=o.opponentPublic.active;
      o.opponentPublic.active=c('Pidgey FLF 75');
      o.opponentPublic.bench=[desired];
      o.ownHand=['Guzma BUS 115'];
      o.ownTurnResources={supporterPlayedTurn:8};
      request.actionFrontier.items=[{
        kind:'play-card',token:'guzma',actorPrinting:'Guzma BUS 115'
      }];
      assert.deepEqual(rootDecision(request),{
        kind:'select-action',token:'guzma'
      });
    });
  }
}

 // Agent17 independently identified a missed terminal Retreat on a
 // non-Shadow-Rider plain target when Air Mail is offered. Exercise the
 // same physical actor slot, both seats, with paid and prevented controls.
function terminalRetreatRequest(seat,target,{dew=false,resist=false}={}) {
  const r=req(seat,target,{prizes:2,bench:true,dew});
  // Native PRC121 Bunnelby has two-Colorless Retreat Cost. The exact
  // original rank-15 sixty includes one DCE; make the offered Retreat
  // physically payable without consuming the Bench Mega's Grass Energy.
  r.observation.ownPublic.active=c('Bunnelby PRC 121',[],[
    'Double Colorless Energy SUM 136'
  ]);
  r.publicEventReceipt.ownerActive={
    printing:'Bunnelby PRC 121',movedFromBenchToActiveThisTurn:false
  };
  r.actionFrontier.items=[
    {kind:'retreat',token:'retreat-mega',targetPrinting:MEGA,
      publicMetadata:{targetSeat:'actor',targetZone:'bench',
        targetIndex:0,benchIndex:0}},
    {kind:'use-ability',token:'air-mail',actorPrinting:'Pidgeotto TEU 123',
      publicMetadata:{abilityName:'Air Mail'}}
  ];
  if(resist)r.observation.opponentPublic.active.printed.resistance=[
    {type:'Colorless',value:'-30'}
  ];
  return r;
}
for(const seat of [0,1]) {
  test('seat '+seat+': certified physical terminal Retreat outranks Air Mail',()=>{
    for(const target of [
      'Shadow Rider Calyrex V CRE 74',
      'Iron Thorns ex TEF 77',
      'Regidrago V SIT 135'
    ])assert.equal(rootDecision(terminalRetreatRequest(seat,target)).token,
      'retreat-mega');
    for(const options of [{dew:true},{resist:true}])
      assert.equal(rootDecision(terminalRetreatRequest(seat,
        'Iron Thorns ex TEF 77',options)).token,'air-mail');
  });
}

 // The same decision must remain physically aligned *if* the native
 // Retreat action is continued with an engine ChoosePokemonPrompt.
for(const seat of [0,1]) {
  test('seat '+seat+': terminal physical Retreat prompt keeps funded Mega over BUS',()=>{
    const r=terminalRetreatRequest(seat,'Iron Thorns ex TEF 77');
    r.observation.ownPublic.bench.push(c('Vileplume BUS 6',[],[],{
      printed:{stage:'STAGE_2'}
    }));
    assert.equal(rootDecision(r).token,'retreat-mega');
    r.prompt={
      promptType:'ChoosePokemonPrompt',
      source:{classification:'actor-choice',sourceKind:'engine',
        sourcePrinting:null,effectName:'Retreat'},
      publicMetadata:{selectionType:'pokemon',
        minimumCount:1,maximumCount:1,ownerSeat:'actor',targetZone:'bench'},
      choices:[
        {kind:'pokemon',token:'mega-slot0',printing:MEGA,
          publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0}},
        {kind:'pokemon',token:'bus-slot2',printing:'Vileplume BUS 6',
          publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:2}}
      ]
    };
    assert.deepEqual(retreatPrompt(r),{
      kind:'select-choices',tokens:['mega-slot0']
    });
  });
}

 // Printed PAL190 Jet Energy provides 1 Colorless AND switches its Bench
 // target Active. An otherwise unpowered Stage1 Mega's Gale [C] is payable
 // after the Jet attachment; neither old readiness nor generic Energy
 // development may override the exact terminal physical action.
for(const seat of [0,1]){
  test('seat '+seat+': unpowered physical Mega + Jet terminal, not Temple or wrong slot',()=>{
    const r=req(seat,'Iron Thorns ex TEF 77',{prizes:2,bench:true});
    r.observation.ownPublic.bench[0].energies=[];
    r.actionFrontier.items=[
      {kind:'play-card',token:'jet-to-mega',actorPrinting:JET,
        targetPrinting:MEGA,publicMetadata:{targetSeat:'actor',
          targetZone:'bench',targetIndex:0,benchIndex:0,isOwnerVisible:true}},
      {kind:'use-ability',token:'air-mail',
        actorPrinting:'Pidgeotto TEU 123',publicMetadata:{abilityName:'Air Mail'}}
    ];
    assert.equal(rootDecision(r).token,'jet-to-mega');
    r.observation.opponentPublic.stadium=['Temple of Sinnoh ASR 155'];
    assert.equal(rootDecision(r).token,'air-mail');
    r.observation.opponentPublic.stadium=[];
    r.observation.ownPublic.bench.push(c(MEGA));
    r.actionFrontier.items[0].publicMetadata.targetIndex=2;
    r.actionFrontier.items[0].publicMetadata.benchIndex=2;
    assert.equal(rootDecision(r).token,'jet-to-mega');
    r.actionFrontier.items[0].targetPrinting='Pidgeotto TEU 123';
    r.actionFrontier.items[0].publicMetadata.targetIndex=1;
    r.actionFrontier.items[0].publicMetadata.benchIndex=1;
    assert.equal(rootDecision(r).token,'air-mail');
  });
}

// Original rank15 inventory has two Basic Grass and two Guzma. With an
// unused manual attachment, Guzma -> unpowered Bench Mega -> Grass -> Gale
// can be a same-turn last-Prize win; the native action frontier owns legality.
for(const seat of [0,1]){
  test('seat '+seat+': exact two-action Guzma/Grass moved-Gale win',()=>{
    const r=req(seat,'Pidgey FLF 75',{prizes:2,bench:true});
    const o=r.observation;
    o.opponentPublic.bench=[c('Iron Thorns ex TEF 77',[],[],{
      hp:230,damage:10,printed:{stage:'BASIC',weakness:[],resistance:[]}
    })];
    o.ownPublic.active=c('Vileplume BUS 6');
    o.ownPublic.bench[0].energies=[];
    o.ownHand=['Guzma BUS 115','Grass Energy BLW 105'];
    o.ownTurnResources={supporterPlayedTurn:8,energyPlayedTurn:8,
      energyPlayLocked:false};
    r.actionFrontier.items=[
      {kind:'play-card',token:'guzma',actorPrinting:'Guzma BUS 115'},
      {kind:'use-ability',token:'air-mail',
        actorPrinting:'Pidgeotto TEU 123',publicMetadata:{abilityName:'Air Mail'}}
    ];
    o.ownTurnResources.energyPlayedTurn=9;
    assert.equal(rootDecision(r).token,'air-mail');
    o.ownTurnResources.energyPlayedTurn=8;
    o.ownHand=['Guzma BUS 115'];
    assert.equal(rootDecision(r).token,'air-mail');
    o.ownHand=['Guzma BUS 115','Grass Energy BLW 105'];
    o.ownPublic.prizeCount=3;
    assert.equal(rootDecision(r).token,'air-mail');
    o.ownPublic.prizeCount=2;
    assert.equal(rootDecision(r).token,'guzma');
    r.prompt={promptType:'ChoosePokemonPrompt',
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
      choices:[{kind:'pokemon',token:'enemy-iron',
        printing:'Iron Thorns ex TEF 77',
        publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0}}]};
    o.ownTurnResources.supporterPlayedTurn=9;
    assert.deepEqual(guzmaPrompt(r),{kind:'select-choices',tokens:['enemy-iron']});
    o.opponentPublic.active=o.opponentPublic.bench[0];
    o.opponentPublic.bench=[c('Pidgey FLF 75')];
    r.prompt.choices=[{kind:'pokemon',token:'own-mega',
      printing:MEGA,publicMetadata:{ownerSeat:'actor',
        targetZone:'bench',benchIndex:0}}];
    assert.deepEqual(guzmaPrompt(r),{kind:'select-choices',tokens:['own-mega']});
    o.ownPublic.bench[0]=o.ownPublic.active;
    o.ownPublic.active=c(MEGA,[],[],{printed:{stage:'STAGE_1'},
      publicRestrictions:{cannotUseAttacksNextTurn:[]}});
    r.prompt=null;r.publicEventReceipt.ownerActive={
      printing:MEGA,movedFromBenchToActiveThisTurn:true
    };
    r.actionFrontier.items=[
      {kind:'play-card',token:'grass-to-active',
        actorPrinting:'Grass Energy BLW 105',targetPrinting:MEGA,
        publicMetadata:{targetSeat:'actor',targetZone:'active'}},
      {kind:'use-ability',token:'air-mail',
        actorPrinting:'Pidgeotto TEU 123',publicMetadata:{abilityName:'Air Mail'}}
    ];
    assert.equal(rootDecision(r).token,'grass-to-active');
    o.ownPublic.active.energies=['Grass Energy BLW 105'];
    o.ownTurnResources.energyPlayedTurn=9;
    r.actionFrontier.items=[{kind:'attack',token:'gale',
      actorPrinting:MEGA,attackName:'Gale Thrust'}];
    assert.equal(rootDecision(r).token,'gale');

    // Five source Special Energy copies also pay a Colorless attack when
    // attached to *Active* Mega after Guzma. Jet switches only if attached
    // to a BENCHED recipient; attaching it Active simply funds [C].
    for(const energy of [
      'Jet Energy PAL 190','Double Colorless Energy SUM 136',
      'Capture Energy RCL 171','Powerful Colorless Energy DAA 176'
    ]){
      const step=req(seat,'Pidgey FLF 75',{prizes:2,bench:true});
      const so=step.observation;
      so.opponentPublic.bench=[c('Iron Thorns ex TEF 77',[],[],{
        hp:230,damage:10,printed:{stage:'BASIC',
          weakness:[],resistance:[]}})];
      so.ownPublic.active=c('Vileplume BUS 6');
      so.ownPublic.bench[0].energies=[];
      so.ownHand=['Guzma BUS 115',energy];
      so.ownTurnResources={supporterPlayedTurn:8,energyPlayedTurn:8,
        energyPlayLocked:false,specialEnergyPlayLocked:true};
      step.actionFrontier.items=[
        {kind:'play-card',token:'guzma',actorPrinting:'Guzma BUS 115'},
        {kind:'use-ability',token:'air-mail',
          actorPrinting:'Pidgeotto TEU 123',
          publicMetadata:{abilityName:'Air Mail'}}
      ];
      assert.equal(rootDecision(step).token,'air-mail');
      so.ownTurnResources.specialEnergyPlayLocked=false;
      assert.equal(rootDecision(step).token,'guzma');
      so.ownPublic.active=c(MEGA,[],[],{
        printed:{stage:'STAGE_1'},publicRestrictions:{
          cannotUseAttacksNextTurn:[]}});
      so.ownPublic.bench=[c('Vileplume BUS 6')];
      so.opponentPublic.active=so.opponentPublic.bench[0];
      so.opponentPublic.bench=[c('Pidgey FLF 75')];
      so.ownTurnResources.supporterPlayedTurn=9;
      step.publicEventReceipt.ownerActive={printing:MEGA,
        movedFromBenchToActiveThisTurn:true};
      step.actionFrontier.items=[
        {kind:'play-card',token:'energy-to-active',
          actorPrinting:energy,targetPrinting:MEGA,
          publicMetadata:{targetSeat:'actor',targetZone:'active'}},
        {kind:'use-ability',token:'air-mail',
          actorPrinting:'Pidgeotto TEU 123',
          publicMetadata:{abilityName:'Air Mail'}}
      ];
      assert.equal(rootDecision(step).token,'energy-to-active');
      so.ownTurnResources.specialEnergyPlayLocked=true;
      assert.equal(rootDecision(step).token,'air-mail');
    }
  });
}
