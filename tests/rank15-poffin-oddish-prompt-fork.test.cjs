'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {oddishAtNativePoffinPrompt} =
  require('../simulation/twinleaf/rank15-poffin-oddish-prompt-fork.cjs');

const slot = name => ({getPokemonCard:()=>name?{fullName:name}:null});
function fixture() {
  const copies = names => names.map(fullName=>({fullName}));
  const owner={
    id:202,
    active:{
      getPokemonCard:()=>({fullName:'Bunnelby PRC'}),
      tools:copies(['Technical Machine: Evolution PAR']),
      energies:{cards:copies(['Grass Energy MEE'])}
    },
    bench:[slot('Budew ASC'),slot('Eldegoss V RCL'),
      slot(null),slot(null),slot(null)],
    deck:{cards:copies(['Oddish UNB','Oddish UNB','Gloom UNB','Gloom UNB',
      'Vileplume AOR','Vileplume AOR','Vileplume BUS'])}
  };
  const prompt={
    id:47,constructor:{name:'ChooseCardsPrompt'},
    playerId:202,cards:owner.deck,result:undefined,
    validate:cards=>cards.length===2&&
      cards.every(c=>c.fullName==='Oddish UNB')
  };
  return {owner,prompt,state:{turn:16,activePlayer:1,prompts:[prompt]}};
}

test('native actor-owned K1 prompt offers two separately owned Oddish',()=>{
  const {owner,state}=fixture();
  const choice=oddishAtNativePoffinPrompt(state,owner,1);
  assert.ok(choice);
  assert.equal(choice.cards.length,2);
  assert.notEqual(choice.cards[0],choice.cards[1],
    'Both copies must be separate physical cards');
});

test('ordinary K0 decision or foreign player cannot read hidden deck',()=>{
  const {owner,state}=fixture();
  state.prompts=[];
  Object.defineProperty(owner.deck,'cards',{get(){
    throw Error('Illegal hidden deck inspection');
  }});
  assert.equal(oddishAtNativePoffinPrompt(state,owner,1),null);
  state.prompts=[{constructor:{name:'ChooseCardsPrompt'},
    playerId:101,cards:owner.deck,result:undefined}];
  assert.equal(oddishAtNativePoffinPrompt(state,owner,1),null);
});

test('rejects off-turn, unpaid TM and occupied Bench',()=>{
  const {owner,state}=fixture();
  state.activePlayer=0;
  assert.equal(oddishAtNativePoffinPrompt(state,owner,1),null);
  state.activePlayer=1;state.turn=15;
  assert.equal(oddishAtNativePoffinPrompt(state,owner,1),null);
  state.turn=16;owner.active.energies.cards=[];
  assert.equal(oddishAtNativePoffinPrompt(state,owner,1),null);
  owner.active.energies.cards=[{fullName:'Grass Energy MEE'}];
  owner.bench[2]=slot('Oddish UNB');
  assert.equal(oddishAtNativePoffinPrompt(state,owner,1),null);
  owner.bench[2]=slot('Buneary M2');
  owner.bench[3]=slot('Budew ASC');
  assert.equal(oddishAtNativePoffinPrompt(state,owner,1),null);
});

test('rejects unoffered, incompatible or unvalidated printed choices',()=>{
  const {owner,state,prompt}=fixture();
  owner.deck.cards.splice(1,1);
  assert.equal(oddishAtNativePoffinPrompt(state,owner,1),null);
  owner.deck.cards.push({fullName:'Oddish UNB'});
  prompt.validate=()=>false;
  assert.equal(oddishAtNativePoffinPrompt(state,owner,1),null);
  prompt.validate=()=>true;
  prompt.cards={cards:[{fullName:'Oddish UNB'},{fullName:'Oddish UNB'}]};
  assert.equal(oddishAtNativePoffinPrompt(state,owner,1),null);
});
