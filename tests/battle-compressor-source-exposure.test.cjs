'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withBattleCompressorSourceSelections}=
  require('../simulation/twinleaf/battle-compressor-source-exposure.cjs');

class AddPlayerAction {}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt {
  constructor(id,player){this.id=id;this.player=player;
    this.cards=player.deck;this.options={min:1,max:3};}
}
class FakeStore {
  constructor(){this.state={turn:3,players:[],prompts:[]};}
  dispatch(action){
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      if(prompt)prompt.result=action.result;
    }
    return action;
  }
}

test('captures only actual root Battle Compressor discard decisions',()=>{
  const original=FakeStore.prototype.dispatch;
  const root=new FakeStore(),speculative=new FakeStore();
  const chosen={fullName:'Psychic Energy MEE'};
  const player={
    deck:{cards:[chosen]},
    supporter:{cards:[{name:'Battle Compressor'}]}
  };
  root.state.players=[player];
  speculative.state.players=[player];
  root.state.prompts=[new ChooseCardsPrompt(7,player)];
  speculative.state.prompts=[new ChooseCardsPrompt(9,player)];
  const capture=withBattleCompressorSourceSelections(FakeStore,()=>{
    root.dispatch(new AddPlayerAction());
    speculative.dispatch(new ResolvePromptAction(9,[]));
    root.dispatch(new ResolvePromptAction(7,[chosen]));
    return 'completed';
  });
  assert.equal(capture.result,'completed');
  assert.equal(capture.rootDispatches,2);
  assert.deepEqual(capture.selections,[{
    step:1,turn:3,playerSeat:0,promptMin:1,promptMax:3,
    selectionCount:1,pendingCardNames:['Psychic Energy MEE'],
    dispatch:'accepted'
  }]);
  assert.equal(FakeStore.prototype.dispatch,original);
});

test('ignores other deck prompts and restores dispatch after a failure',()=>{
  const original=FakeStore.prototype.dispatch;
  const store=new FakeStore();
  const player={deck:{cards:[]},supporter:{cards:[]}};
  store.state.players=[player];
  store.state.prompts=[new ChooseCardsPrompt(4,player)];
  assert.throws(()=>withBattleCompressorSourceSelections(FakeStore,()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ResolvePromptAction(4,[]));
    throw new Error('deliberate fixture error');
  }),/deliberate fixture error/);
  assert.equal(FakeStore.prototype.dispatch,original);
});
