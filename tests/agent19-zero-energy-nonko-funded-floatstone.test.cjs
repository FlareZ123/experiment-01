'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseZeroEnergyNonKoFloatStone:choose,
  withZeroEnergyNonKoFloatStone,VERSION}=
  require('../simulation/twinleaf/agent19-zero-energy-nonko-funded-floatstone.cjs');
const psychic='Psychic Energy MEE';
const catalog={
  stages:{BASIC:0,STAGE_1:1},
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  basicEnergies:new Set([psychic]),specialEnergies:new Set(),
  specialConditions:{ASLEEP:1,PARALYZED:2},
  dragonPokemonPrintings:new Set()
};
function pokemon(printing,energyCount,attack,cost=2){
  return {printing,printed:{stage:0,types:[5],
    retreatCost:Array(cost).fill(9)},
  energies:Array(energyCount).fill(psychic),tools:[],
  attacks:attack?[attack]:[],specialConditions:[],
  publicRestrictions:{}};
}
function fixture(){
  return {decisionKind:'owner-root',globalTurn:26,
    ownHand:['Psychic Energy MEE','Float Stone BKT','Arven OBF'],
    ownTurnResources:{retreatedTurn:24,toolPlayLocked:false},
    ownPublic:{
      active:pokemon('Latias ex SSP',0,{name:'Eon Blade',
        damage:300,cost:[5,5,9]},2),
      bench:[pokemon('Trevenant & Dusknoir-GX PR-SM',3,
        {name:'Night Watch',damage:150,cost:[5,5,9]})],
      stadium:[],publicTurnRestrictions:{}},
    opponentPublic:{active:{
      printing:'Iron Thorns ex TWM',hp:230,damage:0,
      tools:[],specialConditions:[]},bench:[],stadium:[]}};
}
test('source-rank6 archetype: save stranded zero-energy Latias into 150-damage bench before KO',()=>{
  const v=fixture(),plan=choose(v,catalog);
  assert.equal(plan?.kind,'attach-emergency-floatstone');
  assert.equal(plan?.targetAttackName,'Night Watch');
  assert.equal(plan?.projectedPrintedDamage,150);
  assert.equal(plan?.handIndex,1);
  assert.equal(plan?.source,VERSION);
  assert.equal(150<230,true,'non-KO must be newly eligible');
  v.ownPublic.active.tools=['Float Stone BKT'];
  assert.equal(choose(v,catalog)?.kind,'retreat-emergency-floatstone');
});
test('no owner hidden information queried and no state mutation',()=>{
  const v=fixture(),before=JSON.stringify(v);
  for(const key of ['hand','deck','prizes'])
    Object.defineProperty(v.opponentPublic,key,{get(){throw Error('hidden read');}});
  assert.equal(choose(v,catalog)?.benchIndex,0);
  for(const key of ['hand','deck','prizes'])delete v.opponentPublic[key];
  assert.equal(JSON.stringify(v),before);
});
test('tool lock, spent retreat, active paralysis and no held stone veto',()=>{
  for(const change of [
    v=>{v.ownHand=[];},
    v=>{v.ownTurnResources.retreatedTurn=v.globalTurn;},
    v=>{v.ownPublic.active.specialConditions=[2];},
    v=>{v.ownTurnResources.toolPlayLocked=true;},
    v=>{v.opponentPublic.stadium=['Jamming Tower TWM'];},
    v=>{v.opponentPublic.active.tools=['Tool Jammer BST'];},
    v=>{v.ownPublic.bench[0].energies=[];},
    v=>{v.ownPublic.active.tools=['Muscle Band XY'];}
  ]){const v=fixture();change(v);assert.equal(choose(v,catalog),null);}
});
test('zero-energy funded escape yields to a legal Active attack or printed zero retreat',()=>{
  const v=fixture();v.ownPublic.active.attacks=[{
    name:'Free Strike',damage:80,cost:[]}];
  assert.equal(choose(v,catalog),null);
  v.ownPublic.active.attacks=[];
  v.ownPublic.active.printed.retreatCost=[];
  assert.equal(choose(v,catalog),null);
  v.ownPublic.active.printed.retreatCost=[9];
  v.ownPublic.active.energies=[psychic];
  assert.equal(choose(v,catalog),null,
    'The preexisting funded selector owns nonzero-Energy states');
});
test('wrapper has no permanent exports and always restores after exception',()=>{
  const moduleRef=require('../simulation/twinleaf/agent14-generic-funded-floatstone-frontier.cjs');
  const before=moduleRef.chooseGenericFundedFloatStone;
  let selected=null;
  const output=withZeroEnergyNonKoFloatStone(()=>{
    selected=moduleRef.chooseGenericFundedFloatStone(fixture(),catalog);
    return 'native root scheduled';
  });
  assert.equal(selected?.source,VERSION);
  assert.equal(output.audit.proposalsSelected,1);
  assert.equal(output.result,'native root scheduled');
  assert.equal(moduleRef.chooseGenericFundedFloatStone,before);
  assert.throws(()=>withZeroEnergyNonKoFloatStone(()=>{
    throw Error('engine reject');
  }),/engine reject/);
  assert.equal(moduleRef.chooseGenericFundedFloatStone,before);
});
