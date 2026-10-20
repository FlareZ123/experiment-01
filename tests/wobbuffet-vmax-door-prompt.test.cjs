'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {selectWobbuffetVmaxDoorPrompt,withWobbuffetVmaxDoorPrompt}=
  require('../simulation/twinleaf/wobbuffet-vmax-door-prompt.cjs');
class AttachEnergyPrompt {
  constructor(id,hand){
    this.id=99;this.playerId=id;this.cardList=hand;
    this.message='ATTACH_ENERGY_TO_BENCH';
    this.playerType='BOTTOM_PLAYER';
    this.slots=['BENCH'];
    this.options={min:1,max:1,blocked:[]};
    this.filter={name:'Psychic Energy',energyType:'BASIC'};
  }
  validate(answer){return answer.length===1&&this.cardList.cards.includes(answer[0].card)}
}
class ResolvePromptAction {constructor(id,result){this.id=id;this.result=result}}
class SimpleTacticsAi {
  constructor(id,valid=true){this.client={id};this.valid=valid;}
  decodeNextAction(){return {generic:true}}
  isValidAction(){return this.valid}
}
const types={AttachEnergyPrompt,ResolvePromptAction,SimpleTacticsAi,
  GameMessage:{ATTACH_ENERGY_TO_BENCH:'ATTACH_ENERGY_TO_BENCH'},
  GamePhase:{PLAYER_TURN:'PLAYER_TURN'},EnergyType:{BASIC:'BASIC'},
  PlayerType:{BOTTOM_PLAYER:'BOTTOM_PLAYER'},SlotType:{BENCH:'BENCH'}};
const spot=(name,n=0)=>({getPokemonCard:()=>({name}),
  energies:{cards:Array.from({length:n},()=>({name:'Psychic Energy'}))}});
function setup(seat=0){
  const own={id:seat===0?101:202,active:spot('Wobbuffet'),
    bench:[spot('Latias ex',2),spot('Shadow Rider Calyrex VMAX',0),
      spot('Shadow Rider Calyrex VMAX',2)],
    hand:{cards:[{name:'Psychic Energy',fullName:'Psychic Energy SVE',energyType:'BASIC'}]},
    deck:{cards:[]},prizes:[]};
  const other={id:seat===0?202:101,hand:{cards:[]},deck:{cards:[]},prizes:[]};
  const prompt=new AttachEnergyPrompt(own.id,own.hand);
  const state={activePlayer:seat,phase:'PLAYER_TURN',turn:12,
    players:seat===0?[own,other]:[other,own],prompts:[prompt]};
  return {own,other,prompt,state,bot:new SimpleTacticsAi(own.id)};
}
const run=(x,seat=0)=>withWobbuffetVmaxDoorPrompt(seat,
  ()=>x.bot.decodeNextAction(x.state),types);
test('actual prompt shape chooses near-ready Benched VMAX and physical energy',()=>{
  const x=setup();const answer=selectWobbuffetVmaxDoorPrompt(
    x.state,x.own,0,x.prompt,types);
  assert.equal(answer[0].card,x.own.hand.cards[0]);
  assert.deepEqual(answer[0].to,{player:'BOTTOM_PLAYER',slot:'BENCH',index:2});
  assert.equal(run(x).result.id,99);
  assert.equal(run(x).result.result[0].card,x.own.hand.cards[0]);
  assert.deepEqual(x.bot.decodeNextAction(x.state),{generic:true});
});
test('both physical seats share the same board-derived prompt choice',()=>{
  const left=run(setup(0),0),right=run(setup(1),1);
  assert.equal(left.result.result[0].to.index,2);
  assert.equal(right.result.result[0].to.index,2);
});
test('reject native invalid intervention and defer existing resolution',()=>{
  const x=setup();x.bot.valid=false;
  assert.deepEqual(run(x).result,{generic:true});
});
test('do not alter ineligible source/card/target semantics',()=>{
  for(const mutate of [
    x=>x.own.active=spot('Latias ex'),
    x=>x.prompt.cardList={cards:x.own.hand.cards},
    x=>x.prompt.message='OTHER',
    x=>x.prompt.options.max=2,
    x=>x.prompt.filter.energyType='SPECIAL',
    x=>x.prompt.options.blocked=[0],
    x=>x.state.phase='OTHER'
  ]){const x=setup();mutate(x);assert.deepEqual(run(x).result,{generic:true});}
});
test('helper is invariant to opponent concealed hand, deck and Prize contents',()=>{
  const a=setup(),b=setup();
  b.other.hand.cards=[{name:'Guzma'}];
  b.other.deck.cards=[{name:'N'}];
  b.other.prizes=[{cards:[{name:'Ultra Ball'}]}];
  const x=selectWobbuffetVmaxDoorPrompt(a.state,a.own,0,a.prompt,types);
  const y=selectWobbuffetVmaxDoorPrompt(b.state,b.own,0,b.prompt,types);
  assert.deepEqual(x[0].to,y[0].to);
});
