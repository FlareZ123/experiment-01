'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {rank15SecondBarragePrompt}=
  require('../simulation/twinleaf/rank15-second-barrage-native-confirm-policy.cjs');

const slot=fullName=>({getPokemonCard:()=>fullName?{fullName}:null});
function fixture(){
  const actor={
    id:202,
    active:{
      getPokemonCard:()=>({fullName:'Bunnelby PRC'}),
      tools:[{fullName:'Technical Machine: Evolution PAR'}],
      energies:{cards:[{fullName:'Grass Energy MEE'}]}
    },
    bench:[slot('Budew ASC'),slot('Eldegoss V RCL'),
      slot('Gloom UNB'),slot('Gloom UNB'),slot('Budew ASC')]
  };
  const prompt={
    id:44,playerId:202,constructor:{name:'ConfirmPrompt'},
    message:'WANT_TO_USE_ABILITY',result:undefined,
    validate:(value)=>value===true
  };
  const state={turn:16,activePlayer:1,prompts:[prompt]};
  return {actor,prompt,state};
}
test('actual actor-owned post-Evolution two-Gloom prompt allows legal yes',()=>{
  const {actor,prompt,state}=fixture();
  Object.defineProperty(actor,'deck',{get(){
    throw Error('Hidden source deck illegally read outside prompt');
  }});
  Object.defineProperty(actor,'prizes',{get(){
    throw Error('Hidden Prize cards illegally read');
  }});
  assert.equal(rank15SecondBarragePrompt(state,actor,1),prompt);
});

test('rejects other players, earlier turns and wrong prompt message',()=>{
  const {actor,prompt,state}=fixture();
  state.activePlayer=0;
  assert.equal(rank15SecondBarragePrompt(state,actor,1),null);
  state.activePlayer=1;state.turn=15;
  assert.equal(rank15SecondBarragePrompt(state,actor,1),null);
  state.turn=16;prompt.playerId=101;
  assert.equal(rank15SecondBarragePrompt(state,actor,1),null);
  prompt.playerId=202;prompt.message='OTHER_CONFIRMATION';
  assert.equal(rank15SecondBarragePrompt(state,actor,1),null);
});

test('rejects absent attached Tool, absent Energy, no two Stage1',()=>{
  const {actor,state}=fixture();
  actor.active.tools=[];
  assert.equal(rank15SecondBarragePrompt(state,actor,1),null);
  actor.active.tools=[{fullName:'Technical Machine: Evolution PAR'}];
  actor.active.energies.cards=[];
  assert.equal(rank15SecondBarragePrompt(state,actor,1),null);
  actor.active.energies.cards=[{fullName:'Grass Energy MEE'}];
  actor.bench[3]=slot('Oddish UNB');
  assert.equal(rank15SecondBarragePrompt(state,actor,1),null);
});

test('native prompt validator must actually accept true',()=>{
  const {actor,prompt,state}=fixture();
  prompt.validate=()=>false;
  assert.equal(rank15SecondBarragePrompt(state,actor,1),null);
  prompt.validate=()=>true;
  state.prompts=[{...prompt,constructor:{name:'ChooseCardsPrompt'}}];
  assert.equal(rank15SecondBarragePrompt(state,actor,1),null);
});
