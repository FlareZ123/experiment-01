'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerModal,withOwnerModalAcknowledgements:wrap}=
  require('../simulation/twinleaf/agent4-owner-modal-acknowledgements.cjs');

class AddPlayerAction{}
class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
class Store{
  constructor(state){this.state=state;}
  dispatch(action){if(action instanceof ResolvePromptAction)this.state.prompts[0].result=action.result;}
}
class Bot{
  constructor(id){this.client={id};}
  decodeNextAction(){throw new Error('native decoder must remain untouched');}
}
function fake(seat,kind){
  const id=seat===0?'a':'b';
  const cls={ [kind]:class {
    constructor(){this.playerId=id;this.id=12;this.message='OPTION';this.result=undefined;}
    validate(answer){return typeof answer==='boolean';}
  }}[kind];
  Object.defineProperty(cls,'name',{value:kind});
  const store=new Store({turn:4,phase:2,players:[{id:'a'},{id:'b'}],prompts:[new cls()]});
  return {bot:new Bot(id),store};
}
const deps={SimpleTacticsAi:Bot,Store,ResolvePromptAction,
  observe:(state,seat)=>Object.freeze({actorSeat:seat,globalTurn:state.turn,
    phase:state.phase,decisionKind:'owner-prompt'}),
  validate:(state,action)=>assert.equal(state.prompts[0].validate(action.result),true)
};
test('modal owner decisions match native conservative values',()=>{
  const actor={decisionKind:'owner-prompt',phase:2,globalTurn:1};
  assert.equal(chooseOwnerModal(actor,{kind:'ConfirmPrompt'}).answer,false);
  assert.equal(chooseOwnerModal(actor,{kind:'ShowCardsPrompt'}).answer,true);
  assert.throws(()=>chooseOwnerModal({...actor,phase:1},{kind:'ConfirmPrompt'}));
});
test('both seats settle modal prompts through Store without native decoder',()=>{
  for(const seat of [0,1])for(const kind of ['ConfirmPrompt','ShowCardsPrompt']){
    const {bot,store}=fake(seat,kind);
    const value=wrap(()=>{
      store.dispatch(new AddPlayerAction());
      const action=bot.decodeNextAction(store.state);
      store.dispatch(action);
      return action.result;
    },deps);
    assert.equal(value.result,kind==='ShowCardsPrompt');
    assert.equal(value.audit.accepted,1);
    assert.equal(value.audit.settled,1);
    assert.equal(value.audit.bySeat[seat],1);
  }
});

class SilentModalStore extends Store {
  dispatch(action) {
    if (action instanceof ResolvePromptAction) return this.state;
    return super.dispatch(action);
  }
}
class DisappearingModalStore extends Store {
  dispatch(action) {
    if (action instanceof ResolvePromptAction) {
      this.state.prompts.length = 0;
      return this.state;
    }
    return super.dispatch(action);
  }
}
class ResolvedAndRemovedModalStore extends Store {
  dispatch(action) {
    if (action instanceof ResolvePromptAction) {
      this.state.prompts[0].result = action.result;
      this.state.prompts.length = 0;
      return this.state;
    }
    return super.dispatch(action);
  }
}

for (const seat of [0, 1]) {
  for (const kind of ['ConfirmPrompt', 'ShowCardsPrompt']) {
    test('silent native modal prompt cannot count as an accepted answer: ' + seat + ' ' + kind, () => {
      for (const Fake of [SilentModalStore, DisappearingModalStore]) {
        const {bot, store: seed}=fake(seat,kind);
        const store=new Fake(seed.state);
        const result=wrap(() => {
          store.dispatch(new AddPlayerAction());
          const action=bot.decodeNextAction(store.state);
          assert.throws(() => store.dispatch(action),
            /returned without resolving its prompt/);
          return action;
        },{...deps,Store:Fake});
        assert.equal(result.audit.selected,1);
        assert.equal(result.audit.accepted,0);
        assert.equal(result.audit.settled,0);
        assert.equal(result.audit.unsettled,1);
        assert.equal(result.audit.rejected,0);
      }
    });
    test('resolved native modal prompt removed by Store remains accepted: ' +
      seat + ' ' + kind, () => {
      const {bot,store:seed}=fake(seat,kind);
      const store=new ResolvedAndRemovedModalStore(seed.state);
      const value=wrap(() => {
        store.dispatch(new AddPlayerAction());
        const action=bot.decodeNextAction(store.state);
        store.dispatch(action);
        return action.result;
      },{...deps,Store:ResolvedAndRemovedModalStore});
      assert.equal(value.result,kind==='ShowCardsPrompt');
      assert.equal(value.audit.accepted,1);
      assert.equal(value.audit.settled,1);
      assert.equal(value.audit.unsettled,0);
    });
  }
}
