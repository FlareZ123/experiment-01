'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {sourceCouldEvolveBench,chooseBunnelbyTmJetRoot,TM}=
  require('../simulation/twinleaf/agent40-owner-bunnelby-tm-jet-line.cjs');
const source=[
  ...Array(54).fill('Grass Energy MEE'),'Bunnelby PRC','Oddish UNB',
  'Gloom UNB',TM,'Jet Energy PAL','Pidgey MEW'
];
const catalog={
  evolutions:new Map([['Gloom UNB',{stage:1,evolvesFrom:'Oddish'}]]),
  stages:{BASIC:0,STAGE_1:1},
  specialEnergies:new Set(['Jet Energy PAL']),
  basicEnergyTypes:{Grass:1,Fairy:8},
  colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:3}
};
const poke=(printing,name,options={})=>({
  name,printing,printed:{stage:0,types:[1]},
  tools:options.tools??[],energies:options.energies??[],
  attacks:options.attacks??[],
  abilityDetails:options.abilityDetails??[],
  evolutionPrintings:[printing],specialConditions:[],
  publicRestrictions:{}
});
const bunnelby=(options={})=>poke('Bunnelby PRC','Bunnelby',options);
function view(){
  return {decisionKind:'owner-root',globalTurn:2,
    ownHand:['Jet Energy PAL',TM],
    ownPublic:{
      active:poke('Dratini OBF','Dratini'),
      bench:[bunnelby(),poke('Oddish UNB','Oddish'),null,null,null],
      stadium:[],discard:[],lostZone:[],
      publicTurnRestrictions:{}
    },
    ownTurnResources:{energyPlayedTurn:0,toolPlayLocked:false,
      energyPlayLocked:false,specialEnergyPlayLocked:false},
    opponentPublic:{stadium:[],active:null,prizeCount:6}
  };
}
test('registered 60 and public Oddish make a K0-possible Stage1',()=>{
  const v=view();
  assert.equal(source.length,60);
  assert.equal(sourceCouldEvolveBench(v,catalog,source),true);
  v.ownPublic.discard.push('Gloom UNB');
  assert.equal(sourceCouldEvolveBench(v,catalog,source),false);
  v.ownPublic.discard.length=0;
  v.ownHand.push('Gloom UNB');
  assert.equal(sourceCouldEvolveBench(v,catalog,source),false);
});
test('promotes from equipped Bench Bunnelby via genuine held Jet hand index',()=>{
  const v=view();
  v.ownPublic.bench[0].tools.push(TM);
  v.ownHand.pop();
  assert.deepEqual(chooseBunnelbyTmJetRoot(v,catalog,source),{
    kind:'attach-special-energy',printing:'Jet Energy PAL',
    handIndex:0,slot:'bench',index:0,
    reason:'jet-promote-bunnelby-registered-stage-tm'});
});
test('equips TM on Bench before using the only attached Jet',()=>{
  const v=view();
  assert.deepEqual(chooseBunnelbyTmJetRoot(v,catalog,source),{
    kind:'equip-bunnelby-tm',handIndex:1,printing:TM,slot:'bench',index:0});
});
test('after native switch to Active paid Bunnelby, returns Evolution Tool attack',()=>{
  const v=view();
  v.ownPublic.active=bunnelby({tools:[TM],energies:['Jet Energy PAL']});
  v.ownPublic.bench[0]=poke('Dratini OBF','Dratini');
  v.ownHand.length=0;
  const selected=chooseBunnelbyTmJetRoot(v,catalog,source);
  assert.deepEqual(selected,{
    kind:'attack',attackName:'Evolution',
    reason:'bunnelby-active-registered-stage-tm'});
});
test('active Bunnelby with TM can attach a held Jet without switching',()=>{
  const v=view();
  v.ownPublic.active=bunnelby({tools:[TM]});
  v.ownPublic.bench[0]=poke('Dratini OBF','Dratini');
  v.ownHand.pop();
  assert.deepEqual(chooseBunnelbyTmJetRoot(v,catalog,source),{
    kind:'attach-special-energy',printing:'Jet Energy PAL',
    handIndex:0,slot:'active',index:0,
    reason:'fund-bunnelby-tm-evolution'});
});
test('no registered owner list and known inaccessible Stage fail closed',()=>{
  const v=view();
  assert.equal(chooseBunnelbyTmJetRoot(v,catalog,null),null);
  assert.equal(chooseBunnelbyTmJetRoot(v,catalog,source.slice(1)),null);
  v.ownPublic.discard.push('Gloom UNB');
  assert.equal(chooseBunnelbyTmJetRoot(v,catalog,source),null);
});
test('does not use hidden deck or Prize identities',()=>{
  const a=view(),b=view();
  a.hiddenDeck=['Gloom UNB'];b.hiddenDeck=[];
  a.hiddenPrizes=[];b.hiddenPrizes=['Gloom UNB'];
  assert.deepEqual(chooseBunnelbyTmJetRoot(a,catalog,source),
    chooseBunnelbyTmJetRoot(b,catalog,source));
});
test('preserves active-bound lock and payable damage against Jet switching',()=>{
  const v=view();
  v.ownPublic.bench[0].tools.push(TM);
  v.ownHand.pop();
  v.ownPublic.active.abilityDetails=[{
    name:'Sentinel',text:'As long as this Pokémon is your Active Pokémon, your opponent cannot play Supporter cards.'
  }];
  assert.equal(chooseBunnelbyTmJetRoot(v,catalog,source),null);
  v.ownPublic.active.abilityDetails=[];
  v.ownPublic.active.attacks=[{
    name:'Attack',cost:[],damage:20
  }];
  assert.equal(chooseBunnelbyTmJetRoot(v,catalog,source),null);
});
test('Temple of Sinnoh blocks forced Bench switch, and Energy quota blocks attachment',()=>{
  const v=view();v.ownPublic.bench[0].tools.push(TM);v.ownHand.pop();
  v.opponentPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(chooseBunnelbyTmJetRoot(v,catalog,source),null);
  v.opponentPublic.stadium=[];
  v.ownTurnResources.energyPlayedTurn=2;
  assert.equal(chooseBunnelbyTmJetRoot(v,catalog,source),null);
});
test('Tool quota, existing Tool and active first turn do not create illegal TM roots',()=>{
  const v=view();
  v.ownPublic.publicTurnRestrictions.toolPlayLocked=true;
  assert.equal(chooseBunnelbyTmJetRoot(v,catalog,source),null);
  v.ownPublic.publicTurnRestrictions.toolPlayLocked=false;
  v.ownPublic.bench[0].tools=['Stealthy Hood UNB'];
  assert.equal(chooseBunnelbyTmJetRoot(v,catalog,source),null);
  v.ownPublic.bench[0].tools=[TM];
  v.ownPublic.active=bunnelby({tools:[TM],energies:['Jet Energy PAL']});
  v.ownPublic.bench[0]=poke('Dratini OBF','Dratini');
  v.globalTurn=1;
  assert.equal(chooseBunnelbyTmJetRoot(v,catalog,source),null);
});

test('shared actor root follows registered TM equip, Jet Bench attach, Tool attack',()=>{
  const {chooseActorRootIntent}=require(
    '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const v=view(),c={...catalog,basics:new Set(),abilityBasics:new Set(),
    basicEnergies:new Set()};
  const options={bunnelbyTmJetRoot:true,ownRegisteredSixty:source};
  assert.equal(chooseActorRootIntent(v,c,{}).kind,'pass');
  assert.equal(chooseActorRootIntent(v,c,options).kind,'equip-bunnelby-tm');
  v.ownPublic.bench[0].tools.push(TM);
  v.ownHand.pop();
  const jet=chooseActorRootIntent(v,c,options);
  assert.equal(jet.kind,'attach-special-energy');
  assert.equal(jet.slot,'bench');
  assert.equal(jet.index,0);
  v.ownPublic.active=bunnelby({tools:[TM],energies:['Jet Energy PAL']});
  v.ownPublic.bench[0]=poke('Dratini OBF','Dratini');
  v.ownHand.length=0;
  const attack=chooseActorRootIntent(v,c,options);
  assert.equal(attack.kind,'attack');
  assert.equal(attack.attackName,'Evolution');
});

test('Omega Barrage consent persists when source Stage2 remains K0-possible',()=>{
  const {shouldConsentBunnelbyBarrage}=require(
    '../simulation/twinleaf/agent40-bunnelby-barrage-consent.cjs');
  const stage={fullName:'Vileplume AOR',stage:2,evolvesFrom:'Gloom'};
  const sourceCards=[stage,...Array.from({length:59},()=>({
    fullName:'Grass Energy MEE'
  }))];
  const dummy=(name,fullName)=>({
    getPokemonCard(){return {name,fullName};},
    cards:[{name,fullName}]
  });
  const owner={
    active:{...dummy('Bunnelby','Bunnelby PRC'),
      tools:[{fullName:TM}]},
    bench:[dummy('Gloom','Gloom UNB')],
    hand:{cards:[]},discard:{cards:[]},lostzone:{cards:[]}
  };
  assert.equal(shouldConsentBunnelbyBarrage(owner,sourceCards),true);
  owner.discard.cards.push(stage);
  assert.equal(shouldConsentBunnelbyBarrage(owner,sourceCards),false);
  owner.discard.cards.length=0;
  owner.active.tools=[];
  assert.equal(shouldConsentBunnelbyBarrage(owner,sourceCards),false);
});

test('owner-known Stage2 can be TM evolved from an already established Stage1',()=>{
  const v=view();
  v.ownPublic.bench[1]=poke('Gloom UNB','Gloom');
  const withStage2=source.slice();
  withStage2[0]='Vileplume AOR';
  const c={...catalog,stages:{...catalog.stages,STAGE_2:2},
    evolutions:new Map([...catalog.evolutions,
      ['Vileplume AOR',{stage:2,evolvesFrom:'Gloom'}]])};
  assert.equal(sourceCouldEvolveBench(v,c,withStage2),true);
  v.ownHand.push('Vileplume AOR');
  assert.equal(sourceCouldEvolveBench(v,c,withStage2),false);
});

test('never expends an end-turn TM before a blocked Bench Jet switch',()=>{
  const v=view();
  v.ownPublic.active.abilityDetails=[{
    name:'Sentinel',
    text:'As long as this Pokémon is your Active Pokémon, your opponent cannot play Supporter cards.'
  }];
  assert.equal(chooseBunnelbyTmJetRoot(v,catalog,source),null,
    'Do not equip TM on Bunnelby when replacing Sentinel is prohibited');
  v.ownPublic.active.abilityDetails=[];
  v.ownTurnResources.energyPlayedTurn=2;
  assert.equal(chooseBunnelbyTmJetRoot(v,catalog,source),null,
    'TM expires this turn if Jet cannot attach due quota');
  v.ownTurnResources.energyPlayedTurn=0;
  v.ownHand=['Technical Machine: Evolution PAR'];
  assert.equal(chooseBunnelbyTmJetRoot(v,catalog,source),null,
    'No held Jet means no Bench promotion this turn');
  v.ownHand=['Jet Energy PAL',TM];
  v.globalTurn=1;
  assert.equal(chooseBunnelbyTmJetRoot(v,catalog,source),null,
    'First player cannot attack and TM is discarded at end of turn');
});
test('already paid Bench Bunnelby may still need Jet for promotion',()=>{
  const v=view();
  v.ownPublic.bench[0].tools=[TM];
  v.ownPublic.bench[0].energies=['Grass Energy MEE'];
  v.ownHand=['Jet Energy PAL'];
  const intent=chooseBunnelbyTmJetRoot(v,catalog,source);
  assert.equal(intent.kind,'attach-special-energy');
  assert.equal(intent.slot,'bench');
  assert.equal(intent.index,0);
});
