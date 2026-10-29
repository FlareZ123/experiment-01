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
test('Counter behind-on-Prizes respects GX-EX exclusion',()=>{
  const normal=view(slot('Pikachu','Pikachu UPR',[4]),
    ['Counter Energy CIN']);
  normal.ownPublic.prizeCount=5;
  normal.opponentPublic.prizeCount=3;
  assert.equal(choosePublicContextSpecialEnergy(normal,catalog)?.printing,
    'Counter Energy CIN');
  const gx=view(slot('Dedenne-GX','Dedenne-GX UNB',[4]),
    ['Counter Energy CIN']);
  gx.ownPublic.prizeCount=5;
  gx.opponentPublic.prizeCount=3;
  assert.equal(choosePublicContextSpecialEnergy(gx,catalog),null);
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
