'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {withSourceStampedNightWatchOwner}=
  require('../simulation/twinleaf/agent36-source-stamped-nightwatch-owner.cjs');

function fakeEngine(){
  class AddPlayerAction{}
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class ChooseCardsPrompt{
    constructor(playerId,cards){
      this.playerId=playerId;this.cards=cards;
      this.message='CHOOSE_CARD_TO_DISCARD';
      this.id='source-nightwatch-1';
      this.result=undefined;
      this.options={
        isSecret:true,allowCancel:false,
        min:Math.min(2,cards.cards.length),
        max:Math.min(2,cards.cards.length)
      };
      this.filter={};
    }
    validate(cards){
      return cards.length===this.options.min&&
        cards.every(card=>this.cards.cards.includes(card));
    }
  }
  class Store{
    constructor(state){this.state=state;this.callbacks=new Map();}
    prompt(state,prompt,cb){
      state.prompts.push(prompt);this.callbacks.set(prompt.id,cb);
    }
    dispatch(action){
      if(action instanceof AddPlayerAction)return true;
      if(action instanceof ResolvePromptAction){
        const p=this.state.prompts.find(x=>x.id===action.id);
        assert.ok(p);
        const opponent=this.state.players.find(x=>x.id!==p.playerId);
        assert.equal(p.validate(action.result),true);
        for(const card of action.result){
          const idx=opponent.hand.cards.indexOf(card);
          assert.ok(idx>=0);
          opponent.hand.cards.splice(idx,1);
          opponent.deck.cards.push(card);
        }
        p.result=action.result;
        this.callbacks.get(action.id)(action.result);
        return true;
      }
      throw Error('bad action');
    }
  }
  class AttackEffect{
    constructor(player,attack){this.player=player;this.attack=attack;}
  }
  class TrevenantDusknoirGX{
    constructor(){this.attacks=[{name:'Night Watch'}];}
    reduceEffect(store,state,effect){
      const other=state.players.find(x=>x.id!==effect.player.id);
      store.prompt(state,new ChooseCardsPrompt(effect.player.id,other.hand),
        ()=>null);
    }
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw Error('unsafe inherited decoder blocked');}
  }
  const modules={
    'sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx':
      {TrevenantDusknoirGX},
    'simple-bot/simple-tactics-ai':{SimpleTacticsAi},
    'game/store/store':{Store},
    'game/store/actions/add-player-action':{AddPlayerAction},
    'game/store/actions/resolve-prompt-action':{ResolvePromptAction},
    'game/game-message':{GameMessage:{CHOOSE_CARD_TO_DISCARD:
      'CHOOSE_CARD_TO_DISCARD'}}
  };
  return {engine:name=>modules[name],
    Store,AddPlayerAction,ResolvePromptAction,
    TrevenantDusknoirGX,SimpleTacticsAi,AttackEffect,
    ChooseCardsPrompt};
}

test('source-reducer-stamped Night Watch chooses opaque random positions and validates real Store movement',()=>{
  const x=fakeEngine();
  let reads=0;
  const hidden=Array.from({length:5},(_,i)=>new Proxy({i},{
    get(target,key){
      if(key==='name'||key==='fullName'){
        reads++;throw Error('hidden printing inspection');
      }
      return Reflect.get(target,key);
    }
  }));
  const actor={id:'actor',hand:{cards:[]},deck:{cards:[]}};
  const opponent={id:'opponent',hand:{cards:hidden},deck:{cards:[]}};
  const state={players:[actor,opponent],turn:5,prompts:[]};
  const res=withSourceStampedNightWatchOwner(()=>{
    const store=new x.Store(state);
    store.dispatch(new x.AddPlayerAction());
    const source=new x.TrevenantDusknoirGX();
    source.reduceEffect(store,state,new x.AttackEffect(actor,source.attacks[0]));
    const bot=new x.SimpleTacticsAi(actor.id);
    const action=bot.decodeNextAction(state);
    assert.ok(action instanceof x.ResolvePromptAction);
    assert.equal(action.result.length,2);
    store.dispatch(action);
    return {done:true};
  },{committedSeed:'test-fixed-before-game',engine:x.engine});
  assert.equal(res.result.done,true);
  assert.equal(res.audit.sourceReducerInvocations,1);
  assert.equal(res.audit.sourcePromptMarks,1);
  assert.equal(res.audit.realStoreSelectedActions,1);
  assert.equal(res.audit.acceptedDispatches,1);
  assert.equal(res.audit.verifiedPhysicalHandDeckMovements,1);
  assert.equal(res.audit.notYetVerifiedMovements,0);
  assert.equal(res.audit.policyCardIdentityReads,0);
  assert.equal(reads,0);
  assert.deepEqual([opponent.hand.cards.length,opponent.deck.cards.length],[3,2]);
  assert.equal(res.audit.competitiveGamesQualified,0);
});

test('same-shaped unmarked native prompt cannot bypass the inherited decoder quarantine',()=>{
  const x=fakeEngine();
  const actor={id:'actor'};
  const opponent={id:'opponent',
    hand:{cards:[{},{},{}]},deck:{cards:[]}};
  const state={players:[actor,opponent],turn:5,prompts:[
    new x.ChooseCardsPrompt(actor.id,opponent.hand)
  ]};
  const res=withSourceStampedNightWatchOwner(()=>{
    const store=new x.Store(state);
    store.dispatch(new x.AddPlayerAction());
    assert.throws(()=>new x.SimpleTacticsAi(actor.id)
      .decodeNextAction(state),/unsafe inherited decoder blocked/);
    return 'no-owner-action';
  },{committedSeed:'test-fixed-before-game',engine:x.engine});
  assert.equal(res.result,'no-owner-action');
  assert.equal(res.audit.realStoreSelectedActions,0);
  assert.equal(res.audit.delegatedUnmarkedPrompts,1);
});
