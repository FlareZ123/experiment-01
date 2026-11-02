'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  chooseUnderworldDoorRoot,ownerUnderworldMarkerReceipt
}=require('../simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs');

const VMAX='Shadow Rider Calyrex VMAX CRE';
const PSYCHIC=5;
const catalog={basicEnergies:new Set(['Psychic Energy SVE',
  'Darkness Energy SVE']),basicEnergyTypes:{Psychic:PSYCHIC}};
function pokemon(printing,psychic=true,ability=false){
  return {
    printing,printed:{types:[psychic?PSYCHIC:3]},
    abilities:ability?['Underworld Door']:[]
  };
}
function observation(){
  return {
    decisionKind:'owner-root',
    ownHand:['Psychic Energy SVE'],
    ownPublic:{
      active:pokemon(VMAX,true,true),
      bench:[
        pokemon('Dialga-GX UPR',false),
        pokemon(VMAX,true,true),
        pokemon('Tapu Lele-GX GRI',true),
        null,null
      ]
    }
  };
}

test('two independent source VMAX: choose a verified unspent Bench source',()=>{
  const view=observation();
  const option=chooseUnderworldDoorRoot(view,catalog,{
    activeUnspent:true,benchUnspent:[false,true,false,false,false]
  });
  assert.equal(option.kind,'use-underworld-door');
  assert.equal(option.position,'bench');
  assert.equal(option.benchIndex,1);
  assert.deepEqual(option.printedPsychicTargetIndices,[1,2]);
  assert.equal(option.nativeEffectAndLocksVerified,false);
});

test('used marker, absent marker receipt, no Psychic hand, no Psychic Bench all abstain',()=>{
  const view=observation();
  assert.equal(chooseUnderworldDoorRoot(view,catalog),null);
  assert.equal(chooseUnderworldDoorRoot(view,catalog,{
    activeUnspent:false,benchUnspent:[false,false,false,false,false]
  }),null);
  view.ownHand=['Darkness Energy SVE'];
  assert.equal(chooseUnderworldDoorRoot(view,catalog,{
    activeUnspent:true
  }),null);
  view.ownHand=['Psychic Energy SVE'];
  view.ownPublic.bench=[
    pokemon('Dialga-GX UPR',false),null,null,null,null
  ];
  assert.equal(chooseUnderworldDoorRoot(view,catalog,{
    activeUnspent:true
  }),null);
});

test('exact native marker reads only own face-up slots and distinguishes source identity',()=>{
  const v0={
    fullName:VMAX,powers:[{name:'Underworld Door'}]
  };
  const v1={
    fullName:VMAX,powers:[{name:'Underworld Door'}]
  };
  const own={
    active:{getPokemonCard:()=>v0},
    bench:[{getPokemonCard:()=>v1},{getPokemonCard:()=>null}],
    marker:{hasMarker:(_,pokemon)=>pokemon===v0}
  };
  const r=ownerUnderworldMarkerReceipt(own);
  assert.equal(r.activeUnspent,false);
  assert.deepEqual(r.benchUnspent,[true,false]);
});

test('opponent concealed zones are not accessed by pure chooser',()=>{
  const view=observation();
  Object.defineProperty(view,'opponentPublic',{get(){
    throw Error('Forbidden opponent state access');
  }});
  assert.equal(chooseUnderworldDoorRoot(view,catalog,{
    activeUnspent:true
  }).position,'active');
});
