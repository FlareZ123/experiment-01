'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerCelestialRoarEnergy}=require('../../simulation/twinleaf/agent7/owner-celestial-roar-energy-choice.cjs');

const P={BOTTOM_PLAYER:2,ANY:0},S={ACTIVE:1,BENCH:2};
const types={PlayerType:P,SlotType:S};
function fixture(){
  const energy={fullName:'Fire Energy MEE',kind:'basic'};
  const other1={fullName:'Mysterious Treasure FLI',kind:'item'};
  const other2={fullName:'Regidrago VSTAR SIT',kind:'pokemon'};
  const source={cards:[other1,energy,other2],
    filter:()=>[energy]};
  const active={getPokemonCard:()=>({fullName:'Regidrago V SIT'})};
  const owner={id:42,active,bench:[],deck:{cards:[]},
    discard:{cards:[]},hand:{cards:[]}};
  const state={activePlayer:0,players:[owner,{id:43}]};
  const prompt={constructor:{name:'AttachEnergyPrompt'},
    playerId:42,message:'ATTACH_ENERGY_CARDS',
    cardList:source,filter:{superType:'ENERGY'},
    slots:[S.ACTIVE],playerType:P.BOTTOM_PLAYER,
    options:{allowCancel:false,min:1,max:1,blocked:[],blockedTo:[]},
    validate:answer=>answer.length===1&&answer[0].card===energy&&
      answer[0].to.player===P.BOTTOM_PLAYER&&
      answer[0].to.slot===S.ACTIVE&&answer[0].to.index===0};
  return {state,prompt,source,energy,owner};
}
test('mandatory one Basic revealed by Celestial Roar attaches to own Active',()=>{
  const {state,prompt,energy}=fixture();
  const choice=chooseOwnerCelestialRoarEnergy(state,prompt,0,types);
  assert.deepEqual(choice.assignments,[{
    card:energy,to:{player:P.BOTTOM_PLAYER,slot:S.ACTIVE,index:0}
  }]);
  assert.equal(choice.sourceCount,3);
  assert.equal(prompt.validate(choice.assignments),true);
});
test('rejects original unopened own deck and own discard as a source',()=>{
  const {state,prompt,owner}=fixture();
  prompt.cardList=owner.deck;
  assert.equal(chooseOwnerCelestialRoarEnergy(state,prompt,0,types),null);
  prompt.cardList=owner.discard;
  assert.equal(chooseOwnerCelestialRoarEnergy(state,prompt,0,types),null);
});
test('rejects wrong owner, active Pokémon, and requested recipient',()=>{
  const {state,prompt}=fixture();
  assert.equal(chooseOwnerCelestialRoarEnergy(state,prompt,1,types),null);
  state.players[0].active.getPokemonCard=()=>({fullName:'Squawkabilly ex PAL'});
  assert.equal(chooseOwnerCelestialRoarEnergy(state,prompt,0,types),null);
  state.players[0].active.getPokemonCard=()=>({fullName:'Regidrago V SIT'});
  prompt.slots=[S.BENCH];
  assert.equal(chooseOwnerCelestialRoarEnergy(state,prompt,0,types),null);
});
test('rejects mismatched energy count, blocked, invalid native payment',()=>{
  const {state,prompt}=fixture();
  prompt.options.min=2;prompt.options.max=2;
  assert.equal(chooseOwnerCelestialRoarEnergy(state,prompt,0,types),null);
  prompt.options.min=1;prompt.options.max=1;
  prompt.options.blocked=[1];
  assert.equal(chooseOwnerCelestialRoarEnergy(state,prompt,0,types),null);
  prompt.options.blocked=[];
  prompt.validate=()=>false;
  assert.equal(chooseOwnerCelestialRoarEnergy(state,prompt,0,types),null);
});
test('cannot infer unseen fourth card from beyond revealed top three',()=>{
  const {state,prompt}=fixture();
  prompt.cardList.cards.push({fullName:'Forest Seal Stone SIT'});
  assert.equal(chooseOwnerCelestialRoarEnergy(state,prompt,0,types),null);
});
