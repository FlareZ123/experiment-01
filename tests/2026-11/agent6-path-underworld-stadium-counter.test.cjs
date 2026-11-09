'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {planPathUnderworldStadiumCounter}=require(
  '../../simulation/twinleaf/2026-11/agent6-path-underworld-stadium-counter.cjs'
);

const PSYCHIC=5;
const pokemonCatalog={
  basicEnergyTypes:{Psychic:PSYCHIC},
  basicEnergies:new Set(['Psychic Energy SVE'])
};
const trainerCatalog=new Map([
  ['Sky Field ROS',{name:'Sky Field',type:'Stadium'}],
  ['Dimension Valley PHF',{name:'Dimension Valley',type:'Stadium'}],
  ['Tropical Beach PR-BLW',{name:'Tropical Beach',type:'Stadium'}],
  ['Field Blower GRI',{name:'Field Blower',type:'Item'}]
]);
const markers={activeUnspent:true,benchUnspent:[false]};
function view(seat=0){
  return {
    decisionKind:'owner-root',actorSeat:seat,globalTurn:5,
    ownHand:['Psychic Energy SVE','Sky Field ROS',
      'Dimension Valley PHF','Tropical Beach PR-BLW'],
    ownTurnResources:{stadiumPlayLocked:false,stadiumPlayedTurn:0},
    ownPublic:{
      active:{printing:'Shadow Rider Calyrex VMAX CRE',
        name:'Shadow Rider Calyrex VMAX',abilities:['Underworld Door'],
        printed:{types:[PSYCHIC]}},
      bench:[{printing:'Mew UNB',name:'Mew',abilities:[],
        printed:{types:[PSYCHIC]}}],
      stadium:[],discard:[]
    },
    opponentPublic:{
      active:{printing:'Snorlax PGO',name:'Snorlax',
        abilities:['Block'],printed:{types:[PSYCHIC]}},
      bench:[],stadium:['Path to the Peak CRE'],discard:[]
    }
  };
}

for(const seat of [0,1]){
  test('true owner Stadium counter is proposed in both physical seats '+seat,()=>{
    const source=view(seat);
    const before=JSON.stringify(source);
    const actual=planPathUnderworldStadiumCounter(source,
      pokemonCatalog,trainerCatalog,markers);
    assert.equal(actual.kind,'replace-path-then-underworld');
    assert.equal(actual.actorSeat,seat);
    assert.deepEqual(actual.options.map(o=>[o.handIndex,o.printing]),[
      [1,'Sky Field ROS'],[2,'Dimension Valley PHF']
    ]);
    assert.ok(actual.options.every(x=>x.immediatePowerName==='Underworld Door'));
    assert.equal(actual.requiresFreshNativeStadiumAndAbilityAcceptance,true);
    assert.equal(JSON.stringify(source),before,'pure planner leaves actor view unchanged');
  });
}
test('only a live Path unlock is offered; held or discarded Path is inert',()=>{
  const source=view();
  source.opponentPublic.discard.push(...source.opponentPublic.stadium);
  source.opponentPublic.stadium=[];
  assert.equal(planPathUnderworldStadiumCounter(
    source,pokemonCatalog,trainerCatalog,markers),null);
  source.ownPublic.stadium=['Dimension Valley PHF'];
  assert.equal(planPathUnderworldStadiumCounter(
    source,pokemonCatalog,trainerCatalog,markers),null);
});
test('Stadium quota, lock and unknown turn refuse speculative lines',()=>{
  for(const resources of [
    {stadiumPlayLocked:true,stadiumPlayedTurn:0},
    {stadiumPlayLocked:false,stadiumPlayedTurn:5},
    {stadiumPlayLocked:false,stadiumPlayedTurn:null}
  ]){
    const source=view();source.ownTurnResources=resources;
    assert.equal(planPathUnderworldStadiumCounter(
      source,pokemonCatalog,trainerCatalog,markers),null);
  }
});
test('no paid underlying Underworld or another Active lock abstains',()=>{
  const source=view();
  assert.equal(planPathUnderworldStadiumCounter(
    source,pokemonCatalog,trainerCatalog,{}),null);
  source.ownHand=['Sky Field ROS'];
  assert.equal(planPathUnderworldStadiumCounter(
    source,pokemonCatalog,trainerCatalog,markers),null);
  source.ownHand.push('Psychic Energy SVE');
  source.opponentPublic.active={
    printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',
    abilities:['Initialization'],printed:{types:[4]}
  };
  assert.equal(planPathUnderworldStadiumCounter(
    source,pokemonCatalog,trainerCatalog,markers),null);
});
test('unknown Trainer classifications and unsupported Stadiums abstain',()=>{
  const source=view();
  source.ownHand=['Psychic Energy SVE','Tropical Beach PR-BLW',
    'Field Blower GRI'];
  assert.equal(planPathUnderworldStadiumCounter(
    source,pokemonCatalog,trainerCatalog,markers),null);
});
