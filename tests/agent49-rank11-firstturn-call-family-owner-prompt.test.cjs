'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseCallFamilyBasic,withLateOwnedCallFamilyPrompt}=
  require('../simulation/twinleaf/agent49-rank11-firstturn-call-family-owner-prompt.cjs');
const types={SuperType:{POKEMON:2},Stage:{BASIC:1}};
const basic=(id,name='Trubbish FST')=>({
  id,fullName:name,superType:2,stage:1});
class ChooseCardsPrompt{
  constructor(owner,max=1){
    this.id=33;this.playerId=owner.id;this.cards=owner.deck;
    this.message='CHOOSE_CARD_TO_PUT_ONTO_BENCH';
    this.options={min:0,max,allowCancel:false};this.result=undefined;
  }
  validate(cards){
    return Array.isArray(cards)&&cards.length<=this.options.max&&
      cards.length>=this.options.min&&cards.every(card=>
        this.cards.cards.includes(card)&&card.superType===2&&card.stage===1);
  }
}
class AddPlayerAction{}
class AttackAction{
  constructor(id,name){this.id=id;this.name=name;}
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class Store{
  constructor(owner){
    this.state={turn:2,activePlayer:1,prompts:[],
      players:[{id:44,deck:{cards:[]},hand:{cards:[]}},
        owner]};
  }
  dispatch(action){
    const source=this.state.players[1];
    if(action instanceof AddPlayerAction)return this.state;
    if(action instanceof AttackAction){
      assert.equal(action.id,source.id);
      this.state.prompts.push(new ChooseCardsPrompt(source));
      return this.state;
    }
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      assert.equal(prompt.validate(action.result),true);
      prompt.result=action.result;
      for(const card of action.result){
        source.deck.cards.splice(source.deck.cards.indexOf(card),1);
        source.bench.find(slot=>slot.cards.length===0).cards.push(card);
      }
      return this.state;
    }
    throw Error('bad fixture root');
  }
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return {defaultAction:'pass'};}
}
function fixture(){
  const owner={id:99,deck:{cards:[basic(1,'Latias ex SSP'),
    basic(2),basic(3,'Mega Absol ex MEG')]},hand:{cards:[]},
    active:{getPokemonCard:()=>basic(0)},
    bench:[{cards:[basic(10,'Mega Absol ex MEG')]},
      {cards:[basic(11,'Oranguru V ASR')]},
      {cards:[]},{cards:[]},{cards:[]}]};
  const store=new Store(owner),bot=new SimpleTacticsAi(owner.id);
  const headless={runMatch:()=>{store.dispatch(new AddPlayerAction());
    store.dispatch(new AttackAction(owner.id,'Call for Family'));
    const answer=bot.decodeNextAction(store.state);
    assert.ok(answer instanceof ResolvePromptAction);
    store.dispatch(answer);
    return {answer,owner};}};
  return {owner,store,bot,headless};
}
const reg={selectedOriginalId:'11:102:A:champion-reference',
  originalSourceSeat:1,sourceTurn:2};
test('native attack-owned owner-deck Basic prompt settles selected physical card',()=>{
  const p=fixture();
  const originalRun=p.headless.runMatch;
  const originalStore=Store.prototype.dispatch;
  const originalAi=SimpleTacticsAi.prototype.decodeNextAction;
  const done=withLateOwnedCallFamilyPrompt(()=>
    p.headless.runMatch({label:'x-'+reg.selectedOriginalId}),{
    headless:p.headless,Store,SimpleTacticsAi,ResolvePromptAction,
    types,registration:reg});
  assert.equal(done.audit.sourceAttackAttempts,1);
  assert.equal(done.audit.nativeSourceAttackAccepted,1);
  assert.equal(done.audit.genuineOwnerBasicDeckPrompts,1);
  assert.equal(done.audit.ownerBasicPromptChoicesSubmitted,1);
  assert.equal(done.audit.ownerBasicPromptAnswersNativeAccepted,1);
  assert.equal(done.audit.oneOriginalBasicMovedToBench,1);
  assert.equal(done.audit.physicalBenchTransferFailures,0);
  assert.deepEqual(done.result.answer.result.map(x=>x.fullName),
    ['Trubbish FST']);
  assert.equal(done.result.owner.bench[2].cards[0].fullName,'Trubbish FST');
  assert.equal(done.result.owner.deck.cards.some(x=>x.id===2),false);
  assert.equal(done.audit.opponentHiddenZoneInspected,false);
  assert.strictEqual(p.headless.runMatch,originalRun);
  assert.strictEqual(Store.prototype.dispatch,originalStore);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,originalAi);
});
test('only actual source owner deck prompt at attack max1 may be chosen',()=>{
  const owner=fixture().owner;
  const prompt=new ChooseCardsPrompt(owner);
  assert.deepEqual(chooseCallFamilyBasic(prompt,owner,types,{}).map(x=>x.id),[2]);
  for(const change of [
    p=>{p.message='CHOOSE_CARD_TO_HAND';},
    p=>{p.options.max=2;},
    p=>{p.playerId=41;},
    p=>{p.cards={cards:[basic(2)]};},
    p=>{p.options.min=2;}
  ]){
    const p=new ChooseCardsPrompt(owner);change(p);
    assert.equal(chooseCallFamilyBasic(p,owner,types,{}),null);
  }
});
test('nonmatching native source never installs owner attack proposal',()=>{
  const p=fixture();let selected;
  p.headless.runMatch=()=>selected=p.bot.decodeNextAction(p.store.state);
  const {audit}=withLateOwnedCallFamilyPrompt(()=>
    p.headless.runMatch({label:'other-game'}),{
    headless:p.headless,Store,SimpleTacticsAi,ResolvePromptAction,
    types,registration:reg});
  assert.deepEqual(selected,{defaultAction:'pass'});
  assert.equal(audit.sourceAttackAttempts,0);
});
