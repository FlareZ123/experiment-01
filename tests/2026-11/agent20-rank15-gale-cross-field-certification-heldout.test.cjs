'use strict';

// Aichi opponent source worker: never hardcode the terminal Mega mobility
// opportunity to Shadow Rider V alone. This whitelist contains known ordinary
// V/ex target printings without defensive attacks/Abilities modifying current
// Gale damage; actual HP and prize values remain public-state requirements.
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootDecision}=require(
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
  r.observation.ownPublic.active=c('Bunnelby PRC 121');
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
