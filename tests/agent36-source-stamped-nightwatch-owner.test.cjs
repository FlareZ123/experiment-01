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
  class ShowCardsPrompt{
    constructor(playerId){
      this.id='source-nightwatch-show-1';
      this.playerId=playerId;this.result=undefined;
      this.message='CARDS_SHOWED_BY_THE_OPPONENT';
      this.options={allowCancel:false};
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
        if(p instanceof ShowCardsPrompt){
          assert.equal(action.result,true);
          p.result=true;
          return true;
        }
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
        this.state.prompts.push(new ShowCardsPrompt(p.playerId));
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
    'game/store/prompts/show-cards-prompt':{ShowCardsPrompt},
    'game/game-message':{GameMessage:{
      CHOOSE_CARD_TO_DISCARD:'CHOOSE_CARD_TO_DISCARD',
      CARDS_SHOWED_BY_THE_OPPONENT:'CARDS_SHOWED_BY_THE_OPPONENT'
    }}
  };
  return {engine:name=>modules[name],
    Store,AddPlayerAction,ResolvePromptAction,
    TrevenantDusknoirGX,SimpleTacticsAi,AttackEffect,
    ChooseCardsPrompt,ShowCardsPrompt};
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
    const ack=bot.decodeNextAction(state);
    assert.ok(ack instanceof x.ResolvePromptAction);
    assert.equal(ack.result,true);
    store.dispatch(ack);
    return {done:true};
  },{committedSeed:'test-fixed-before-game',engine:x.engine});
  assert.equal(res.result.done,true);
  assert.equal(res.audit.sourceReducerInvocations,1);
  assert.equal(res.audit.sourcePromptMarks,1);
  assert.equal(res.audit.realStoreSelectedActions,1);
  assert.equal(res.audit.acceptedDispatches,1);
  assert.equal(res.audit.verifiedPhysicalHandDeckMovements,1);
  assert.equal(res.audit.notYetVerifiedMovements,0);
  assert.equal(res.audit.markedSourceFollowupShowCards,1);
  assert.equal(res.audit.ownerSourceShowCardsActions,1);
  assert.equal(res.audit.nativeAcceptedSourceShowCardsAcks,1);
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

test('opt-in sequential native Stores receive independent keyed Night Watch streams and physical custody',()=>{
  const x=fakeEngine();
  const res=withSourceStampedNightWatchOwner(()=>{
    for(let game=0;game<2;game++){
      const actor={id:'actor',hand:{cards:[]},deck:{cards:[]}};
      const opponent={id:'opponent',hand:{
        cards:Array.from({length:5},(_,i)=>({game,i}))},deck:{cards:[]}};
      const state={players:[actor,opponent],turn:5,prompts:[]};
      const store=new x.Store(state);
      store.dispatch(new x.AddPlayerAction());
      const source=new x.TrevenantDusknoirGX();
      source.reduceEffect(store,state,new x.AttackEffect(actor,source.attacks[0]));
      const bot=new x.SimpleTacticsAi(actor.id);
      const selected=bot.decodeNextAction(state);
      assert.ok(selected instanceof x.ResolvePromptAction);
      store.dispatch(selected);
      const shown=bot.decodeNextAction(state);
      assert.equal(shown.result,true);
      store.dispatch(shown);
      assert.equal(opponent.hand.cards.length,3);
      assert.equal(opponent.deck.cards.length,2);
    }
    return 'two-native-games';
  },{
    committedSeed:'a-private-precommitted-run-seed',
    followSequentialNativeStores:true,
    perNativeStoreEntropy:true,
    engine:x.engine
  });
  assert.equal(res.result,'two-native-games');
  assert.equal(res.audit.followSequentialNativeStores,true);
  assert.equal(res.audit.perNativeStoreEntropy,true);
  assert.equal(res.audit.registeredNativeStoreCount,2);
  assert.equal(res.audit.sourcePromptMarks,2);
  assert.equal(res.audit.realStoreSelectedActions,2);
  assert.equal(res.audit.acceptedDispatches,2);
  assert.equal(res.audit.verifiedPhysicalHandDeckMovements,2);
  assert.equal(res.audit.nativeAcceptedSourceShowCardsAcks,2);
  assert.deepEqual(res.audit.receipts.map(x=>x.nativeStoreOrdinal),[1,2]);
  assert.deepEqual(res.audit.perStoreSeedCommitments.map(x=>x.ordinal),[1,2]);
  assert.match(res.audit.perStoreSeedCommitments[0].sha256,/^[a-f0-9]{64}$/);
  assert.notEqual(res.audit.perStoreSeedCommitments[0].sha256,
    res.audit.perStoreSeedCommitments[1].sha256);
  assert.equal(res.audit.policyCardIdentityReads,0);
  assert.equal(res.audit.competitiveGamesQualified,0);
});

test('legacy v3 default leaves later distinct Store roots unhandled, isolated from v4 opt-in',()=>{
  const x=fakeEngine();
  const res=withSourceStampedNightWatchOwner(()=>{
    for(let game=0;game<2;game++){
      const actor={id:'actor',hand:{cards:[]},deck:{cards:[]}};
      const opponent={id:'opponent',hand:{
        cards:Array.from({length:3},()=>({}))},deck:{cards:[]}};
      const state={players:[actor,opponent],turn:5,prompts:[]};
      const store=new x.Store(state);
      store.dispatch(new x.AddPlayerAction());
      const source=new x.TrevenantDusknoirGX();
      source.reduceEffect(store,state,new x.AttackEffect(actor,source.attacks[0]));
      const bot=new x.SimpleTacticsAi(actor.id);
      if(game===0){
        const selected=bot.decodeNextAction(state);
        store.dispatch(selected);
        const ack=bot.decodeNextAction(state);
        store.dispatch(ack);
      }else{
        assert.throws(()=>bot.decodeNextAction(state),
          /unsafe inherited decoder blocked/);
      }
    }
    return 'legacy-boundary';
  },{committedSeed:'historical-v3-seed',engine:x.engine});
  assert.equal(res.result,'legacy-boundary');
  assert.equal(res.audit.followSequentialNativeStores,false);
  assert.equal(res.audit.perNativeStoreEntropy,false);
  assert.equal(res.audit.realStoreSelectedActions,1);
  assert.ok(res.audit.delegatedDetachedStates>=1);
});

for(const seat of [0,1]){
  test('seat '+seat+' rejects silent source prompt no-op without counting accepted dispatch',()=>{
    const x=fakeEngine();
    const underlying=x.Store.prototype.dispatch;
    x.Store.prototype.dispatch=function(action,...args){
      if(action instanceof x.ResolvePromptAction)return this.state;
      return underlying.call(this,action,...args);
    };
    const actor={id:'actor',hand:{cards:[]},deck:{cards:[]}};
    const opponent={id:'opponent',hand:{cards:[{},{},{}]},deck:{cards:[]}};
    const players=seat===0?[actor,opponent]:[opponent,actor];
    const state={players,turn:5,prompts:[]};
    let caught;
    try{
      withSourceStampedNightWatchOwner(()=>{
        const store=new x.Store(state);
        store.dispatch(new x.AddPlayerAction());
        const source=new x.TrevenantDusknoirGX();
        source.reduceEffect(store,state,new x.AttackEffect(actor,source.attacks[0]));
        store.dispatch(new x.SimpleTacticsAi(actor.id).decodeNextAction(state));
      },{committedSeed:'silent-source-negative',engine:x.engine});
    }catch(error){caught=error;}
    finally{x.Store.prototype.dispatch=underlying;}
    assert.match(caught?.message??'',/without resolving its prompt/);
    assert.equal(caught.agent36NightWatchAudit.nativeUnsettledSourceChoices,1);
    assert.equal(caught.agent36NightWatchAudit.acceptedDispatches,0);
    assert.equal(caught.agent36NightWatchAudit.verifiedNativePromptSettlements,0);
    assert.equal(caught.agent36NightWatchAudit.verifiedPhysicalHandDeckMovements,0);
    assert.equal(opponent.hand.cards.length,3);
    assert.equal(opponent.deck.cards.length,0);
    assert.equal(state.prompts[0].result,undefined);
  });

  test('seat '+seat+' rejects silent ShowCards ack after genuine paid source prompt',()=>{
    const x=fakeEngine();
    const underlying=x.Store.prototype.dispatch;
    x.Store.prototype.dispatch=function(action,...args){
      if(action instanceof x.ResolvePromptAction&&action.result===true)
        return this.state;
      return underlying.call(this,action,...args);
    };
    const actor={id:'actor',hand:{cards:[]},deck:{cards:[]}};
    const opponent={id:'opponent',hand:{cards:[{},{},{}]},deck:{cards:[]}};
    const players=seat===0?[actor,opponent]:[opponent,actor];
    const state={players,turn:5,prompts:[]};
    let caught;
    try{
      withSourceStampedNightWatchOwner(()=>{
        const store=new x.Store(state);
        store.dispatch(new x.AddPlayerAction());
        const source=new x.TrevenantDusknoirGX();
        source.reduceEffect(store,state,new x.AttackEffect(actor,source.attacks[0]));
        const bot=new x.SimpleTacticsAi(actor.id);
        store.dispatch(bot.decodeNextAction(state));
        store.dispatch(bot.decodeNextAction(state));
      },{committedSeed:'silent-ack-negative',engine:x.engine});
    }catch(error){caught=error;}
    finally{x.Store.prototype.dispatch=underlying;}
    assert.match(caught?.message??'',/ShowCards dispatch returned without resolving/);
    assert.equal(caught.agent36NightWatchAudit.acceptedDispatches,1);
    assert.equal(caught.agent36NightWatchAudit.verifiedPhysicalHandDeckMovements,1);
    assert.equal(caught.agent36NightWatchAudit.nativeAcceptedSourceShowCardsAcks,0);
    assert.equal(caught.agent36NightWatchAudit.nativeUnsettledSourceShowCardsAcks,1);
    assert.equal(caught.agent36NightWatchAudit.verifiedNativePromptSettlements,1);
    assert.equal(opponent.hand.cards.length,1);
    assert.equal(opponent.deck.cards.length,2);
    const ack=state.prompts.find(p=>p instanceof x.ShowCardsPrompt);
    assert.equal(ack?.result,undefined);
  });
}
