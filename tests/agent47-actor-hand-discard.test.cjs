'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,actorHandDiscardInput,chooseActorHandDiscard,
  resolvePhysicalHandCards}=require('../simulation/twinleaf/agent47-actor-hand-discard.cjs');

class ChooseCardsPrompt {
  constructor(player,cards,options={min:1,max:1}) {
    this.id=7;this.playerId=player.id;this.cards=cards;
    this.message='CHOOSE_CARD_TO_DISCARD';this.options={allowCancel:false,...options};
  }
  validate(result){
    return Array.isArray(result)&&
      result.length>=this.options.min&&
      result.length<=this.options.max&&
      new Set(result).size===result.length&&
      result.every(card=>this.cards.cards.includes(card));
  }
}
const make=(...names)=>({cards:names.map((fullName,index)=>({fullName,index}))});
const setup=()=>{
  const owner={id:5,hand:make('A','A','B')};
  const state={players:[owner,{id:6,hand:make('Y')}],prompts:[]};
  state.prompts.push(new ChooseCardsPrompt(owner,owner.hand));
  return state;
};
const observed=state=>actorHandDiscardInput(state,0,(_s,seat)=>({
  ownerSeat:seat,decisionKind:'owner-prompt',globalTurn:3,
  ownHand:state.players[0].hand.cards.map(c=>c.fullName)
}));

test('detached actor-only hand-discard menu and deterministic choice',()=>{
  const state=setup();
  const first=observed(state);
  state.players[1].hand=make('Z','W');
  assert.deepEqual(observed(state),first);
  assert.equal(VERSION,'agent47-actor-hand-discard-v1-bounded');
  assert.deepEqual(first.prompt.menu,[['A'],['B']]);
  assert.deepEqual(chooseActorHandDiscard(first),{printings:['A']});
});

test('native physical multiplicity and restricted prompt scope',()=>{
  const state=setup(),prompt=state.prompts[0];
  prompt.options={min:2,max:2};
  const choice=resolvePhysicalHandCards(prompt,['A','A']);
  assert.equal(choice.length,2);
  assert.notStrictEqual(choice[0],choice[1]);
  assert.deepEqual(observed(state).prompt.menu,[['A','A'],['A','B']]);
  prompt.message='CHOOSE_CARD_TO_HAND';
  assert.equal(observed(state),null);
  prompt.message='CHOOSE_CARD_TO_DISCARD';
  prompt.options={min:0,max:2};
  assert.equal(observed(state),null);
});

test('real injected Store accepts an actor choice and restores both hooks',()=>{
  class AddPlayerAction{}
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class Store{
    constructor(state){this.state=state;}
    dispatch(action){
      if(action instanceof ResolvePromptAction){
        const pending=this.state.prompts.find(p=>p.id===action.id);
        assert.equal(pending.validate(action.result),true);
        pending.result=action.result;
      }
      return this.state;
    }
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return 'generic';}
  }
  const before=SimpleTacticsAi.prototype.decodeNextAction;
  const beforeDispatch=Store.prototype.dispatch;
  const state=setup(),store=new Store(state),bot=new SimpleTacticsAi(5);
  const {withActorHandDiscard}=require('../simulation/twinleaf/agent47-actor-hand-discard.cjs');
  const data=withActorHandDiscard(()=>{
    store.dispatch(new AddPlayerAction());
    const action=bot.decodeNextAction(store.state);
    assert.ok(action instanceof ResolvePromptAction);
    store.dispatch(action);
    return 99;
  },{Store,SimpleTacticsAi,ResolvePromptAction,validate:()=>{},
    observe:(s,seat)=>actorHandDiscardInput(s,seat,(_s,_seat)=>({
      ownHand:s.players[seat].hand.cards.map(c=>c.fullName),
      globalTurn:1,decisionKind:'owner-prompt'
    }))});
  assert.equal(data.result,99);
  assert.equal(data.audit.accepted,1);
  assert.equal(data.audit.nativePromptPostconditionsConfirmed,1);
  assert.equal(data.audit.bySeat[0],1);
  assert.deepEqual(state.prompts[0].result.map(c=>c.fullName),['A']);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,before);
  assert.strictEqual(Store.prototype.dispatch,beforeDispatch);
});
