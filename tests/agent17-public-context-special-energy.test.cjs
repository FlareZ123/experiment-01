'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {choosePublicContextSpecialEnergy,publicCostSymbols,
  futureOneUnitDeficit,publicEnergyContext}=
  require('../simulation/twinleaf/agent17-public-context-special-energy.cjs');

const catalog={
  basicEnergyTypes:{Grass:1,Fire:2,Water:3,Lightning:4,
    Psychic:5,Fighting:6,Darkness:7,Metal:8,Fairy:9},
  colorlessEnergyType:10,stages:{BASIC:1,STAGE_1:2},
  specialEnergies:new Set(['Unit Energy LPM UPR','Counter Energy CIN',
    'Reversal Energy PAL','Double Dragon Energy ROS',
    'Jet Energy PAL','Telepathic Psychic Energy POR',
    'Speed Lightning Energy RCL']),
  dragonPokemonPrintings:new Set(['Regidrago V SIT'])
};
function slot(name,printing,cost,stage=1){
  return {name,printing,printed:{stage},energies:[],
    attacks:[{name:'Payable eventually',cost,gxAttack:false}]};
}
function view(pokemon,hand,bench=[]){
  return {decisionKind:'owner-root',ownHand:hand,
    ownPublic:{active:pokemon,bench,stadium:[],prizeCount:6},
    opponentPublic:{stadium:[],prizeCount:6}};
}

test('exact flexible matching preserves one physical unit for two colors',()=>{
  assert.deepEqual(publicCostSymbols([4,5,10],catalog),['L','P','C']);
  assert.equal(publicCostSymbols([99],catalog),null);
  assert.equal(futureOneUnitDeficit(['P','L'],[['L','P','M']]),1);
  assert.equal(futureOneUnitDeficit(['P','L'],[['L','P','M'],['P']]),0);
});
test('original rank4 abbreviated Unit Energy advances Lightning without double paying',()=>{
  const x=view(slot('Pikachu','Pikachu UPR',[4,10]),
    ['Unit Energy LPM UPR']);
  assert.deepEqual(choosePublicContextSpecialEnergy(x,catalog),{
    kind:'attach-special-energy',printing:'Unit Energy LPM UPR',
    handIndex:0,slot:'active',index:0
  });
});
test('Double Dragon is selected only for public Dragon recipient',()=>{
  const dragon=slot('Regidrago V','Regidrago V SIT',[1,2,10]);
  const x=view(dragon,['Double Dragon Energy ROS']);
  assert.equal(choosePublicContextSpecialEnergy(x,catalog).printing,
    'Double Dragon Energy ROS');
  const notDragon=view(slot('Pikachu','Pikachu UPR',[4,10]),
    ['Double Dragon Energy ROS']);
  assert.equal(choosePublicContextSpecialEnergy(notDragon,catalog),null);
});
test('Counter behind-on-Prizes respects verified GX-EX exclusion',()=>{
  const profiled={...catalog,publicPokemonProfileIndex:new Map([
    ['Pikachu UPR',{isEvolution:false,hasRuleBox:false,
      isPokemonGX:false,isPokemonEX:false}],
    ['Dedenne-GX UNB',{isEvolution:false,hasRuleBox:true,
      isPokemonGX:true,isPokemonEX:false}]
  ])};
  const normal=view(slot('Pikachu','Pikachu UPR',[4]),
    ['Counter Energy CIN']);
  normal.ownPublic.prizeCount=5;
  normal.opponentPublic.prizeCount=3;
  assert.equal(choosePublicContextSpecialEnergy(normal,catalog),null);
  assert.equal(choosePublicContextSpecialEnergy(normal,profiled)?.printing,
    'Counter Energy CIN');
  const gx=view(slot('Dedenne-GX','Dedenne-GX UNB',[4]),
    ['Counter Energy CIN']);
  gx.ownPublic.prizeCount=5;
  gx.opponentPublic.prizeCount=3;
  assert.equal(choosePublicContextSpecialEnergy(gx,profiled),null);
});
test('unknown Rule Box classification cannot invent three Reversal units',()=>{
  const evolution=view(slot('Alolan Raichu','Alolan Raichu UPR',[5],2),
    ['Reversal Energy PAL']);
  evolution.ownPublic.prizeCount=5;
  evolution.opponentPublic.prizeCount=3;
  assert.equal(publicEnergyContext(evolution,evolution.ownPublic.active,
    catalog).hasRuleBox,true);
  assert.equal(choosePublicContextSpecialEnergy(evolution,catalog),null);
});
test('Temple converts numeric printed Specials to one Colorless',()=>{
  const x=view(slot('Pikachu','Pikachu UPR',[4]),
    ['Unit Energy LPM UPR']);
  x.ownPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(choosePublicContextSpecialEnergy(x,catalog),null);
});
test('no fabricated Bench Jet switch or opponent concealed dependency',()=>{
  const active=slot('Pikachu','Pikachu UPR',[4]);
  const bench=slot('Snorlax','Snorlax PGO',[10]);
  const a=view(active,['Jet Energy PAL'],[bench]);
  const b=structuredClone(a);
  b.opponentSecret={hand:['Forged Unknown'],prizes:['Forged']};
  assert.equal(choosePublicContextSpecialEnergy(a,catalog),null);
  assert.deepEqual(choosePublicContextSpecialEnergy(a,catalog),
    choosePublicContextSpecialEnergy(b,catalog));
});


test('shared default root unchanged, opt-in physically typed attach and next attack',()=>{
  const {chooseActorRootIntent}=
    require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const c={...catalog,basics:new Set(),abilityBasics:new Set(),
    basicEnergies:new Set(),specialConditions:{ASLEEP:-1,PARALYZED:-2}};
  const active=slot('Pikachu','Pikachu UPR',[4]);
  const v=view(active,['Unit Energy LPM UPR'],[null,null,null,null,null]);
  v.globalTurn=2;
  v.ownTurnResources={pokemonPlayLocked:false,energyPlayLocked:false,
    specialEnergyPlayLocked:false,energyPlayedTurn:0};
  assert.equal(chooseActorRootIntent(v,c).kind,'pass');
  assert.deepEqual(chooseActorRootIntent(v,c,{
    publicContextSpecialEnergy:true}),{
    kind:'attach-special-energy',printing:'Unit Energy LPM UPR',
    handIndex:0,slot:'active',index:0
  });
  v.ownHand=[];
  v.ownPublic.active.energies.push('Unit Energy LPM UPR');
  v.ownTurnResources.energyPlayedTurn=2;
  assert.deepEqual(chooseActorRootIntent(v,c,{
    publicContextSpecialEnergy:true}),{
    kind:'attack',attackName:'Payable eventually'
  });
  assert.equal(chooseActorRootIntent(v,c).kind,'pass');
});


test('verified public Alolan Raichu profile unlocks real Reversal potential',()=>{
  const candidate=slot('Alolan Raichu','Alolan Raichu UNM',[5,5,5],2);
  const x=view(candidate,['Reversal Energy PAL']);
  x.ownPublic.prizeCount=6;
  x.opponentPublic.prizeCount=4;
  const profiled={...catalog,publicPokemonProfileIndex:new Map([
    ['Alolan Raichu UNM',{isEvolution:true,hasRuleBox:false,
      isPokemonGX:false,isPokemonEX:false}]
  ])};
  assert.deepEqual(publicEnergyContext(x,candidate,profiled),{
    isBasic:false,isEvolution:true,isDragon:false,hasRuleBox:false,
    behindOnPrizes:true,isPokemonGXorEX:false
  });
  assert.equal(choosePublicContextSpecialEnergy(x,catalog),null);
  assert.equal(choosePublicContextSpecialEnergy(x,profiled)?.printing,
    'Reversal Energy PAL');
  x.opponentPublic.prizeCount=6;
  assert.equal(choosePublicContextSpecialEnergy(x,profiled),null);
});
