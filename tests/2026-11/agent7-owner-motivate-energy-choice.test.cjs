'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerMotivateEnergy}=require('../../simulation/twinleaf/agent7/owner-motivate-energy-choice.cjs');

const P={BOTTOM_PLAYER:2,ANY:3},S={BENCH:1};
const types={PlayerType:P,SlotType:S};
function fixture(){
  const fire={fullName:'Fire Energy MEE',kind:'basic'};
  const grass={fullName:'Grass Energy MEE',kind:'basic'};
  const extra={fullName:'Professor\'s Research JTG',kind:'trainer'};
  const discard={cards:[fire,grass,extra],filter:()=>[fire,grass]};
  const make=name=>({getPokemonCard:()=>({fullName:name})});
  const owner={id:42,active:make('Squawkabilly ex PAL'),
    bench:[make('Dedenne GX UNB'),make('Regidrago V SIT')],discard};
  const state={activePlayer:0,players:[owner,{id:43}]};
  const prompt={
    constructor:{name:'AttachEnergyPrompt'},playerId:42,
    message:'ATTACH_ENERGY_TO_BENCH',cardList:discard,
    playerType:P.BOTTOM_PLAYER,slots:[S.BENCH],
    filter:{energyType:'basic'},
    options:{min:0,max:2,sameTarget:true,blocked:[],blockedTo:[]},
    validate:assignments=>assignments.length<=2&&
      assignments.every(row=>discard.cards.includes(row.card)&&
        row.to.slot===S.BENCH&&row.to.player===P.BOTTOM_PLAYER&&
        row.to.index===assignments[0].to.index)
  };
  return {state,prompt,fire,grass,owner};
}
test('real own-discard Motivate funds Regidrago with both Basic Energy',()=>{
  const {state,prompt,fire,grass}=fixture();
  const r=chooseOwnerMotivateEnergy(state,prompt,0,types);
  assert.equal(r.recipientPrinting,'Regidrago V SIT');
  assert.deepEqual(r.assignments.map(x=>x.card),[fire,grass]);
  assert.ok(r.assignments.every(x=>x.to.index===1));
  assert.equal(prompt.validate(r.assignments),true);
});
test('blocked energy and destination select legal alternative',()=>{
  const {state,prompt,grass}=fixture();
  prompt.options.blocked=[0];
  prompt.options.blockedTo=[{player:P.BOTTOM_PLAYER,slot:S.BENCH,index:1}];
  const r=chooseOwnerMotivateEnergy(state,prompt,0,types);
  assert.equal(r.recipientPrinting,'Dedenne GX UNB');
  assert.deepEqual(r.assignments.map(x=>x.card),[grass]);
});
test('requires owner prompt and actual Squawkabilly attacking',()=>{
  const {state,prompt}=fixture();
  assert.equal(chooseOwnerMotivateEnergy(state,prompt,1,types),null);
  prompt.playerId=43;
  assert.equal(chooseOwnerMotivateEnergy(state,prompt,0,types),null);
  prompt.playerId=42;
  state.players[0].active.getPokemonCard=()=>({fullName:'Budew ASC'});
  assert.equal(chooseOwnerMotivateEnergy(state,prompt,0,types),null);
});
test('refuses foreign/private card list, other prompt and wrong restrictions',()=>{
  const {state,prompt}=fixture();
  prompt.cardList={cards:[]};
  assert.equal(chooseOwnerMotivateEnergy(state,prompt,0,types),null);
  prompt.cardList=state.players[0].discard;
  prompt.options.sameTarget=false;
  assert.equal(chooseOwnerMotivateEnergy(state,prompt,0,types),null);
  prompt.options.sameTarget=true;
  prompt.message='OTHER';
  assert.equal(chooseOwnerMotivateEnergy(state,prompt,0,types),null);
});
test('fails closed rather than returning invalid payment',()=>{
  const {state,prompt}=fixture();
  prompt.validate=()=>false;
  assert.equal(chooseOwnerMotivateEnergy(state,prompt,0,types),null);
});
