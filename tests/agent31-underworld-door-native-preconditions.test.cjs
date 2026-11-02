'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  structuralDoorPreconditions,
  withUnderworldDoorPreconditions
}=require('../simulation/twinleaf/agent31-underworld-door-native-preconditions.cjs');

const types={EnergyType:{BASIC:1},CardType:{PSYCHIC:5}};
const creature=(printing,name,kind,withAbility=false)=>({
  fullName:printing,name,cardType:[kind],
  powers:withAbility?[{name:'Underworld Door'}]:[]
});
const vmax=()=>creature('Shadow Rider Calyrex VMAX CRE',
  'Shadow Rider Calyrex VMAX',5,true);
const psychic=()=>creature('Mimikyu CEC','Mimikyu',5);
const nonPsychic=()=>creature('Dialga-GX UPR','Dialga-GX',8);
const slot=pokemon=>({
  getPokemonCard:()=>pokemon,
  cards:pokemon?[pokemon]:[],
  energies:{cards:[]},
  tools:[]
});
function state(){
  const vm=vmax();
  const owner={
    id:101,active:slot(null),
    bench:[slot(vm),slot(psychic()),slot(nonPsychic())],
    hand:{cards:[{
      name:'Psychic Energy',energyType:1,provides:[5]
    }]},
    marker:{hasMarker:(_name,card)=>false}
  };
  return {players:[owner,{id:202,
    active:slot(null),bench:[],hand:{cards:[]}}],activePlayer:0,
    turn:5,phase:3,prompts:[],vmax:vm};
}

test('one VMAX, one fresh Psychic energy and one Benched Psychic provides a structural option',()=>{
  const s=state();
  const a=structuralDoorPreconditions(s,0,types);
  assert.equal(a.sourceInPlay,1);
  assert.equal(a.unspentVmax,1);
  assert.equal(a.basicPsychicInHand,1);
  assert.equal(a.printedPsychicBench,2);
  assert.equal(a.structuralOpportunity,true);
  assert.equal(a.possibleRecipients.some(x=>x.printing==='Dialga-GX UPR'),false);
});

test('marker-used, absent psychic hand or absent psychic Bench each blocks conjunction',()=>{
  const s=state();
  s.players[0].marker.hasMarker=()=>true;
  assert.equal(structuralDoorPreconditions(s,0,types)
    .structuralOpportunity,false);
  s.players[0].marker.hasMarker=()=>false;
  s.players[0].hand.cards=[];
  assert.equal(structuralDoorPreconditions(s,0,types)
    .structuralOpportunity,false);
  s.players[0].hand.cards=[{
    name:'Psychic Energy',energyType:1,provides:[5]
  }];
  s.players[0].bench=[slot(nonPsychic())];
  assert.equal(structuralDoorPreconditions(s,0,types)
    .structuralOpportunity,false);
});

test('observer never accesses opponent concealed hand',()=>{
  const s=state();
  Object.defineProperty(s.players[1],'hand',{get(){
    throw Error('Opponent concealed hand access');
  }});
  assert.equal(structuralDoorPreconditions(s,0,types).sourceInPlay,1);
});

test('accepted native Store reader preserves game actions and original dispatch',()=>{
  class AddPlayerAction{}
  class AttackAction{constructor(clientId){this.clientId=clientId;}}
  class Store{
    constructor(){
      this.state=state();this.actions=[];
    }
    dispatch(action){
      this.actions.push(action.constructor.name);
      return this.actions.length;
    }
  }
  const previous=Store.prototype.dispatch;
  const result=withUnderworldDoorPreconditions(()=>{
    const live=new Store();
    const actions=[
      live.dispatch(new AddPlayerAction()),
      live.dispatch(new AttackAction(101)),
      live.dispatch(new AttackAction(101))
    ];
    live.state.turn=6;
    live.state.players[0].hand.cards=[];
    actions.push(live.dispatch(new AttackAction(101)));
    assert.deepEqual(live.actions,[
      'AddPlayerAction','AttackAction','AttackAction','AttackAction'
    ]);
    return actions;
  },{Store,types,playerTurnPhase:3});
  assert.deepEqual(result.result,[1,2,3,4]);
  assert.equal(result.audit.games,1);
  assert.equal(result.audit.acceptedOwnerRoots,3);
  assert.equal(result.audit.originalVmaxSourceRoots,3);
  assert.equal(result.audit.structurallyPossibleSourceRoots,2);
  assert.equal(result.audit.distinctOwnerTurns,2);
  assert.equal(result.audit.sourceTurnsWithFullStructuralOpportunity,1);
  assert.equal(result.audit.anyActionChanged,false);
  assert.strictEqual(Store.prototype.dispatch,previous);
});
