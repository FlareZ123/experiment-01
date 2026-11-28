'use strict';

// Native setup-only hook uses the owner hand and pinned prompt validator.
// Synthetic injected native API, NOT an actual Twinleaf Store or match.
const test=require('node:test');
const assert=require('node:assert/strict');
const {planRank15StartingBasics,withRank15OwnerSetupPriority}=require(
  '../../simulation/twinleaf/2026-11/agent20-rank15-owner-setup-priority.cjs');

const basic=name=>({name,stage:'BASIC',superType:'POKEMON',tags:[]});
const trainer=name=>({name,superType:'TRAINER',stage:null,tags:[]});
const energy=name=>({name,superType:'ENERGY',stage:null,tags:[]});
const legal=hand=>hand.filter(c=>c.superType==='POKEMON');

for(const [name,hand,expectedActive,expectedBench] of [
  ['Bunnelby + TM + attach chooses double-TM lead',
    [basic('Budew'),basic('Bunnelby'),trainer('Technical Machine: Evolution'),
      energy('Grass Energy'),basic('Oddish')],'Bunnelby',['Oddish','Budew']],
  ['Tag Call Supporter access chooses free-retreat Budew',
    [basic('Tatsugiri'),basic('Budew'),trainer('Tag Call')],'Budew',['Tatsugiri']],
  ['No Supporter access chooses Active Tatsugiri',
    [basic('Budew'),basic('Tatsugiri'),basic('Fan Rotom')],'Tatsugiri',['Fan Rotom','Budew']],
  ['Buneary is Active instead of precious Oddish',
    [basic('Oddish'),basic('Buneary')],'Buneary',['Oddish']],
  ['Eldegoss retained when another Bench Basic exists',
    [basic('Budew'),basic('Oddish'),basic('Eldegoss V')],'Budew',['Oddish']],
  ['Eldegoss benched as only survival backup',
    [basic('Budew'),basic('Eldegoss V')],'Budew',['Eldegoss V']],
  ['Eldegoss forced Active when sole Basic',
    [basic('Eldegoss V'),trainer('Tag Call')],'Eldegoss V',[]],
  ['Reserve a fifth Bench slot even with many eligible Basics',
    [basic('Bunnelby'),basic('Oddish'),basic('Oddish'),basic('Buneary'),
      basic('Buneary'),basic('Fan Rotom'),basic('Pidgey'),
      basic('Tatsugiri'),trainer('Technical Machine: Evolution'),
      energy('Jet Energy')],'Bunnelby',['Oddish','Oddish','Buneary','Buneary']]
]){
  test('pure rank15 setup: '+name,()=>{
    const plan=planRank15StartingBasics(hand,legal(hand));
    assert.equal(plan?.[0]?.name,expectedActive);
    assert.deepEqual(plan?.slice(1).map(c=>c.name),expectedBench);
  });
}
test('pure setup refuses to claim a foreign Basic',()=>{
  const hand=[basic('Budew'),basic('Mew V')];
  assert.equal(planRank15StartingBasics(hand,legal(hand)),null);
});
test('pure setup respects owner prompt max selections',()=>{
  const hand=[basic('Bunnelby'),basic('Oddish'),basic('Buneary'),basic('Pidgey'),
    trainer('Technical Machine: Evolution'),energy('Grass Energy')];
  const plan=planRank15StartingBasics(hand,legal(hand),{maxSelections:2});
  assert.deepEqual(plan.map(c=>c.name),['Bunnelby','Oddish']);
});
class FakeAi {
  constructor(id){this.client={id};}
  decodeNextAction(){return {kind:'original-decoder'};}
}
class ResolvePromptAction {
  constructor(promptId,cards){this.promptId=promptId;this.cards=cards;this.kind='resolved';}
}
const deps={sourceRank:15,SimpleTacticsAi:FakeAi,actions:{ResolvePromptAction},
 GamePhase:{SETUP:1},GameMessage:{CHOOSE_STARTING_POKEMONS:'CHOOSE_STARTING_POKEMONS'},
 cardTypes:{
   SuperType:{POKEMON:'POKEMON'},Stage:{BASIC:'BASIC'},
   CardTag:{PLAY_DURING_SETUP:'PLAY_DURING_SETUP'}
 },maxRecords:4};
function stateFor(seat,hand,validate){
  const pid=100+seat;
  const own={id:pid,hand:{cards:hand}};
  const other={id:100+(1-seat),hand:{cards:[basic('Mew V')]}};
  class ChooseCardsPrompt{
    constructor(){
      this.id='p'+seat;this.playerId=pid;
      this.message='CHOOSE_STARTING_POKEMONS';
      this.cards=own.hand;
      this.options={allowCancel:false,min:1,max:6,blocked:[]};
    }
    validate(cards){return (validate??(()=>true))(cards);}
  }
  const prompt=new ChooseCardsPrompt();
  return {state:{phase:1,turn:0,players:seat===0?[own,other]:[other,own],
    prompts:[prompt]},prompt};
}
for(const seat of [0,1]){
  test('seat '+seat+': reversible native setup chooses Bunnelby and protects Eldegoss',()=>{
    const hand=[basic('Fan Rotom'),basic('Eldegoss V'),basic('Oddish'),
      basic('Bunnelby'),trainer('Technical Machine: Evolution'),
      energy('Grass Energy')];
    const {state}=stateFor(seat,hand);
    const previous=FakeAi.prototype.decodeNextAction;
    const {result,audit}=withRank15OwnerSetupPriority(
      ()=>new FakeAi(100+seat).decodeNextAction(state),deps);
    assert.equal(FakeAi.prototype.decodeNextAction,previous);
    assert.equal(result.kind,'resolved');
    assert.deepEqual(result.cards.map(c=>c.name),['Bunnelby','Oddish','Fan Rotom']);
    assert.equal(audit.bySeat[seat],1);
    assert.equal(audit.setupDecisions,1);
    assert.equal(audit.records[0].onlyOwnHand,true);
  });
  test('seat '+seat+': native validator rejection shrinks to legal subset',()=>{
    const hand=[basic('Bunnelby'),basic('Oddish'),basic('Buneary'),
      basic('Pidgey'),trainer('Technical Machine: Evolution'),
      energy('Grass Energy')];
    const {state}=stateFor(seat,hand,cards=>cards.length<=2);
    const {result}=withRank15OwnerSetupPriority(
      ()=>new FakeAi(100+seat).decodeNextAction(state),deps);
    assert.deepEqual(result.cards.map(c=>c.name),['Bunnelby','Oddish']);
  });
  test('seat '+seat+': non-rank15 Basic fails closed to previous decoder',()=>{
    const {state}=stateFor(seat,[basic('Mew V'),basic('Budew')]);
    const {result,audit}=withRank15OwnerSetupPriority(
      ()=>new FakeAi(100+seat).decodeNextAction(state),deps);
    assert.deepEqual(result,{kind:'original-decoder'});
    assert.equal(audit.delegations,1);
  });
  test('seat '+seat+': setup hook never intercepts a live-turn prompt',()=>{
    const {state}=stateFor(seat,[basic('Bunnelby')]);
    state.phase=2;
    const {result}=withRank15OwnerSetupPriority(
      ()=>new FakeAi(100+seat).decodeNextAction(state),deps);
    assert.deepEqual(result,{kind:'original-decoder'});
  });
}
test('wrong source-rank caller cannot activate hook',()=>{
  assert.throws(()=>withRank15OwnerSetupPriority(()=>null,{...deps,sourceRank:5}));
});


test('pure setup obeys maxSelections=1 with exactly Active',()=>{
  const hand=[basic('Bunnelby'),basic('Oddish'),
    trainer('Technical Machine: Evolution'),energy('Grass Energy')];
  assert.deepEqual(planRank15StartingBasics(
    hand,legal(hand),{maxSelections:1}).map(c=>c.name),['Bunnelby']);
});
test('native completely rejecting subset delegates instead of bypassing validator',()=>{
  const {state}=stateFor(0,[basic('Bunnelby'),basic('Oddish')],()=>false);
  const {result,audit}=withRank15OwnerSetupPriority(
    ()=>new FakeAi(100).decodeNextAction(state),deps);
  assert.deepEqual(result,{kind:'original-decoder'});
  assert.equal(audit.setupDecisions,0);
  assert.equal(audit.delegations,1);
});
test('native opponent-owned setup prompt is never intercepted',()=>{
  const {state,prompt}=stateFor(0,[basic('Bunnelby'),basic('Oddish')]);
  prompt.playerId=101;
  const {result,audit}=withRank15OwnerSetupPriority(
    ()=>new FakeAi(100).decodeNextAction(state),deps);
  assert.deepEqual(result,{kind:'original-decoder'});
  assert.equal(audit.delegations,1);
});
