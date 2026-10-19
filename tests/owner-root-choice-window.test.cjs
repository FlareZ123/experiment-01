'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choiceName,withOwnerRootChoiceWindow}=
  require('../simulation/twinleaf/owner-root-choice-window.cjs');

class AddPlayerAction {}
class ResolvePromptAction {
  constructor(result,nextState){this.result=result;this.nextState=nextState;}
}
class PlayCardAction {}
class ChooseCardsPrompt {
  constructor(cards){this.cards=cards;this.result=undefined;this.playerId=202;}
}
class MockStore{
  constructor(state){this.state=state;}
  dispatch(action){
    if(action.nextState)this.state=action.nextState;
    return this.state;
  }
}
const slot=name=>({getPokemonCard:()=>name?{fullName:name}:null});
function player(active,bench,id){
  return {
    id,active:slot(active),bench:bench.map(slot),
    deck:{cards:[]},hand:{cards:[]}
  };
}
function board(oddish=false){
  return {
    turn:16,activePlayer:1,
    players:[
      player('Mewtwo & Mew-GX UNM',[null,null,null,null,null],101),
      player('Bunnelby PRC',
        ['Budew ASC','Eldegoss V RCL',oddish?'Oddish UNB':null,null,null],202)
    ],
    prompts:[]
  };
}

test('names only physically chosen native prompt objects',()=>{
  assert.equal(choiceName({fullName:'Oddish UNB'}),'Oddish UNB');
  assert.equal(choiceName({name:'Gloom'}),'Gloom');
  assert.equal(choiceName(5),null);
  assert.equal(choiceName(null),null);
});

test('records root own-deck prompt result and immediate public Bench change',()=>{
  const start=board();
  const end=board(true);
  start.players[1].deck.cards=[
    {fullName:'Oddish UNB'},{fullName:'Oddish UNB'},
    {fullName:'Gloom UNB'},{fullName:'Vileplume AOR'}];
  const p=new ChooseCardsPrompt(start.players[1].deck);
  start.prompts=[p];
  const root=new MockStore(start);
  const speculative=new MockStore(start);
  const original=MockStore.prototype.dispatch;
  const audit=withOwnerRootChoiceWindow(MockStore,1,()=>{
    root.dispatch(new AddPlayerAction());
    speculative.dispatch(new PlayCardAction());
    root.dispatch(new ResolvePromptAction(
      [{fullName:'Oddish UNB'}],end));
    return 'actual';
  },{turnStart:16,turnEnd:16});
  assert.equal(audit.result,'actual');
  assert.equal(audit.rootActionCount,2);
  assert.equal(audit.trace.length,2);
  assert.deepEqual(audit.trace[1].selectedPrintedCards,['Oddish UNB']);
  assert.equal(audit.trace[1].previousPrompt,'ChooseCardsPrompt');
  assert.equal(audit.trace[1].promptWasOwnDeck,true);
  assert.deepEqual(audit.trace[1].ownerSearchStageCounts,{
    oddish:2,gloom:1,aor:1,bus:0});
  assert.equal(audit.trace[1].before.bench[2],null);
  assert.equal(audit.trace[1].after.bench[2],'Oddish UNB');
  assert.equal(MockStore.prototype.dispatch,original);
});

test('restores exact Store dispatch on a thrown experiment',()=>{
  const original=MockStore.prototype.dispatch;
  assert.throws(()=>withOwnerRootChoiceWindow(MockStore,1,()=>{
    const root=new MockStore(board());
    root.dispatch(new AddPlayerAction());
    throw Error('fixture failure');
  },{turnStart:16,turnEnd:16}),/fixture failure/);
  assert.equal(MockStore.prototype.dispatch,original);
});

test('a foreign player prompt cannot expose observed owner deck or selected cards',()=>{
  const s=board();
  const deck=s.players[1].deck;
  Object.defineProperty(deck,'cards',{get(){throw Error('hidden owner deck read');}});
  const foreign=new ChooseCardsPrompt(deck);
  foreign.playerId=101;
  s.prompts=[foreign];
  const root=new MockStore(s);
  const observed=withOwnerRootChoiceWindow(MockStore,1,()=>{
    root.dispatch(new AddPlayerAction());
    root.dispatch(new ResolvePromptAction([{fullName:'Oddish UNB'}],board()));
    return 'done';
  },{turnStart:16,turnEnd:16});
  assert.equal(observed.result,'done');
  assert.equal(observed.trace[1].promptWasOwnDeck,false);
  assert.equal(observed.trace[1].ownerSearchStageCounts,null);
  assert.deepEqual(observed.trace[1].selectedPrintedCards,[]);
});
