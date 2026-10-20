'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,sparseObservedOwnerSearch,withSparseActorOwnerSearch}=
  require('../simulation/twinleaf/agent22-sparse-owner-search-adapter.cjs');

function fakeActor(seat){
  return Object.freeze({decisionKind:'owner-prompt',
    actorSeat:seat,globalTurn:3,ownPublic:{}});
}
function physicalPrompt(order,seat){
  class ChooseCardsPrompt{}
  const cards=order.map(fullName=>({fullName}));
  const deck={cards},id=seat===0?101:202;
  const owner={id,deck,hand:{cards:[]},discard:{cards:[]}};
  const prompt=new ChooseCardsPrompt();
  Object.assign(prompt,{
    id:8,playerId:id,result:undefined,
    cards:deck,message:'CHOOSE_CARD_TO_HAND',
    options:{min:0,max:3},
    validate:selection=>Array.isArray(selection)&&selection.length===3&&
      selection.every(card=>cards.includes(card))
  });
  const enemy={id:seat===0?202:101,
    deck:{cards:[{fullName:'CONCEALED_OPPONENT_CARD'}]},
    hand:{cards:[{fullName:'SECRET_OPPONENT_HAND'}]},
    discard:{cards:[]}};
  return {state:{players:seat===0?[owner,enemy]:[enemy,owner],
    prompts:[prompt],phase:5,activePlayer:seat,turn:3},prompt,owner};
}
test('same 50-card owner inventory yields unchanged sparse prompt under permutations',()=>{
  const names=Array.from({length:50},(_,i)=>
    'Native-Card-'+String(i).padStart(2,'0'));
  for(const seat of [0,1]){
    const first=physicalPrompt(names,seat);
    const last=physicalPrompt([...names].reverse(),seat);
    const view=s=>sparseObservedOwnerSearch(s,seat,()=>fakeActor(seat));
    const a=view(first.state),b=view(last.state);
    assert.deepEqual(a,b);
    assert.deepEqual(a.prompt.bundles[0].printings,names.slice(0,3));
    assert.equal(JSON.stringify(a).includes('SECRET_OPPONENT_HAND'),false);
    assert.equal(JSON.stringify(a).includes('CONCEALED_OPPONENT_CARD'),false);
  }
});

test('opponent-owned search and unsupported payment search remain native fallback',()=>{
  const p=physicalPrompt(['A','B','C'],0);
  p.prompt.cards=p.state.players[1].deck;
  assert.equal(sparseObservedOwnerSearch(p.state,0,()=>fakeActor(0)),null);
  p.prompt.cards=p.owner.deck;
  p.prompt.options.min=2;
  assert.equal(sparseObservedOwnerSearch(p.state,0,()=>fakeActor(0)),null);
});

test('both real seats resolve native typed sparse prompt and restore prototypes',()=>{
  class AddPlayerAction{}
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class Store{
    dispatch(action){
      if(action instanceof ResolvePromptAction){
        const pending=this.state.prompts[0];
        assert.ok(pending.validate(action.result));
        pending.result=action.result;
      }
      return 'ACCEPTED';
    }
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return 'NATIVE_FALLBACK';}
  }
  const originalBot=SimpleTacticsAi.prototype.decodeNextAction;
  const originalDispatch=Store.prototype.dispatch;
  const outcomes=withSparseActorOwnerSearch(()=>{
    const accepted=[];
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    for(const seat of [0,1]){
      const names=Array.from({length:50},(_,i)=>
        'Source-Card-'+String(i).padStart(2,'0'));
      const {state,owner,prompt}=physicalPrompt(names,seat);
      store.state=state;
      const bot=new SimpleTacticsAi(owner.id);
      assert.equal(bot.decodeNextAction({...state}),'NATIVE_FALLBACK');
      const action=bot.decodeNextAction(state);
      assert.ok(action instanceof ResolvePromptAction);
      assert.deepEqual(action.result.map(card=>card.fullName),
        names.slice(0,3));
      assert.equal(store.dispatch(action),'ACCEPTED');
      assert.strictEqual(prompt.result,action.result);
      accepted.push(seat);
    }
    return accepted;
  },{
    SimpleTacticsAi,Store,ResolvePromptAction,
    GamePhase:{PLAYER_TURN:5},
    observe:(state,seat)=>sparseObservedOwnerSearch(
      state,seat,()=>fakeActor(seat))
  });
  assert.deepEqual(outcomes.result,[0,1]);
  assert.equal(outcomes.audit.version,VERSION);
  assert.equal(outcomes.audit.accepted,2);
  assert.equal(outcomes.audit.nativePromptPostconditionsConfirmed,2);
  assert.equal(outcomes.audit.nonLiveSpeculativeFallbacks,2);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,originalBot);
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
});
