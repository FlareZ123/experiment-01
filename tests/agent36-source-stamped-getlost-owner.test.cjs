'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {withSourceStampedGetLostOwner}=
  require('../simulation/twinleaf/agent36-source-stamped-getlost-owner.cjs');

function mock({destination='none'}={}){
  class AddPlayerAction{}
  class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
  class ChooseCardsPrompt{
    constructor(playerId,cards){
      this.playerId=playerId;this.cards=cards;this.id='getlost';
      this.result=undefined;this.message='CHOOSE_CARD_TO_DISCARD';
      this.options={min:2,max:2,allowCancel:true};this.filter={};
    }
    validate(cards){
      return cards.length===this.options.min&&
        cards.length===this.options.max&&
        cards.every(card=>this.cards.cards.includes(card));
    }
  }
  class Store{
    constructor(state){this.state=state;}
    prompt(state,prompt,cb){state.prompts.push(prompt);this.cb=cb;}
    dispatch(action){
      if(action instanceof AddPlayerAction)return true;
      if(action instanceof ResolvePromptAction){
        const p=this.state.prompts.find(x=>x.id===action.id);
        assert.ok(p);
        assert.equal(p.validate(action.result),true);
        const opponent=this.state.players.find(player=>
          player.discard===p.cards);
        assert.ok(opponent);
        for(const c of action.result){
          const i=p.cards.cards.indexOf(c);
          p.cards.cards.splice(i,1);
          if(destination==='lostzone')opponent.lostzone.cards.push(c);
          if(destination==='hand')opponent.hand.cards.push(c);
        }
        p.result=action.result;
        this.cb(action.result);
        return true;
      }
      throw Error('unsupported');
    }
  }
  class AttackEffect{constructor(player,attack){this.player=player;this.attack=attack;}}
  class Girafarig{
    constructor(){this.attacks=[{name:'Get Lost'}]}
    reduceEffect(store,state,effect){
      const other=state.players.find(x=>x.id!==effect.player.id);
      store.prompt(state,
        new ChooseCardsPrompt(effect.player.id,other.discard),()=>null);
    }
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id}}
    decodeNextAction(){throw Error('outer quarantine blocked');}
  }
  const objects={
    'sets/08-sun-and-moon/set-lost-thunder/girafarig':{Girafarig},
    'simple-bot/simple-tactics-ai':{SimpleTacticsAi},
    'game/store/store':{Store},
    'game/store/actions/add-player-action':{AddPlayerAction},
    'game/store/actions/resolve-prompt-action':{ResolvePromptAction},
    'game/store/prompts/choose-cards-prompt':{ChooseCardsPrompt},
    'game/game-message':{GameMessage:{
      CHOOSE_CARD_TO_DISCARD:'CHOOSE_CARD_TO_DISCARD'}}
  };
  return {engine:p=>objects[p],Store,Girafarig,SimpleTacticsAi,
    AddPlayerAction,ResolvePromptAction,AttackEffect,ChooseCardsPrompt};
}

for(const n of [0,1,2,4]){
  test('source-marked Get Lost chooses legal count from '+n+' public discards',()=>{
    const x=mock();
    const actor={id:'owner'};
    const opponent={id:'enemy',discard:{cards:Array.from(
      {length:n},(_,i)=>({visible:i}))}};
    const state={turn:3,players:[actor,opponent],prompts:[]};
    const r=withSourceStampedGetLostOwner(()=>{
      const store=new x.Store(state);
      store.dispatch(new x.AddPlayerAction());
      const source=new x.Girafarig();
      source.reduceEffect(store,state,
        new x.AttackEffect(actor,source.attacks[0]));
      const bot=new x.SimpleTacticsAi(actor.id);
      const action=bot.decodeNextAction(state);
      assert.ok(action instanceof x.ResolvePromptAction);
      assert.equal(action.result.length,Math.min(2,n));
      store.dispatch(action);
      return true;
    },{engine:x.engine});
    assert.equal(r.result,true);
    assert.equal(r.audit.printedSourcePromptMarks,1);
    assert.equal(r.audit.actualOwnerSelections,1);
    assert.equal(r.audit.acceptedStoreActions,1);
    assert.equal(r.audit.postDispatchPublicDiscardDepletions,n===0?0:1);
    assert.equal(opponent.discard.cards.length,n-Math.min(2,n));
    assert.equal(r.audit.inspectedConcealedCardIdentity,false);
    assert.equal(r.audit.competitiveGamesQualified,0);
  });
}
test('unmarked same-shaped public prompt stays fail-closed',()=>{
  const x=mock();
  const actor={id:'owner'};
  const enemy={id:'enemy',discard:{cards:[{}]}};
  const state={players:[actor,enemy],prompts:[
    new x.ChooseCardsPrompt(actor.id,enemy.discard)]};
  const out=withSourceStampedGetLostOwner(()=>{
    const store=new x.Store(state);
    store.dispatch(new x.AddPlayerAction());
    assert.throws(()=>new x.SimpleTacticsAi(actor.id)
      .decodeNextAction(state),/outer quarantine blocked/);
    return 'rejected';
  },{engine:x.engine});
  assert.equal(out.result,'rejected');
  assert.equal(out.audit.actualOwnerSelections,0);
});

test('sequential native Store scope makes original rank11 late Get Lost reachable',()=>{
  const x=mock();
  const out=withSourceStampedGetLostOwner(()=>{
    for(let i=0;i<3;i++){
      const actor={id:'owner'};
      const n=i===2?0:3;
      const enemy={id:'enemy',discard:{cards:Array.from(
        {length:n},(_,j)=>({publicCard:i+':'+j}))}};
      const state={turn:3,players:[actor,enemy],prompts:[]};
      const store=new x.Store(state);
      store.dispatch(new x.AddPlayerAction());
      const source=new x.Girafarig();
      source.reduceEffect(store,state,
        new x.AttackEffect(actor,source.attacks[0]));
      const action=new x.SimpleTacticsAi(actor.id).decodeNextAction(state);
      assert.ok(action instanceof x.ResolvePromptAction);
      assert.equal(action.result.length,Math.min(2,n));
      store.dispatch(action);
    }
    return true;
  },{engine:x.engine,followSequentialNativeStores:true});
  assert.equal(out.result,true);
  assert.equal(out.audit.followSequentialNativeStores,true);
  assert.equal(out.audit.registeredNativeStores,3);
  assert.equal(out.audit.printedSourcePromptMarks,3);
  assert.equal(out.audit.emptyOpponentDiscardPrompts,1);
  assert.equal(out.audit.actualOwnerSelections,3);
  assert.equal(out.audit.acceptedStoreActions,3);
  assert.equal(out.audit.postDispatchPublicDiscardDepletions,2);
  assert.equal(out.audit.competitiveGamesQualified,0);
});

test('Get Lost one-Store v1 default remains unchanged for historical receipts',()=>{
  const x=mock();
  const out=withSourceStampedGetLostOwner(()=>{
    for(let i=0;i<2;i++){
      const actor={id:'owner'};
      const enemy={id:'enemy',discard:{cards:[{},{}]}};
      const state={turn:3,players:[actor,enemy],prompts:[]};
      const store=new x.Store(state);
      store.dispatch(new x.AddPlayerAction());
      const source=new x.Girafarig();
      source.reduceEffect(store,state,new x.AttackEffect(actor,source.attacks[0]));
      const bot=new x.SimpleTacticsAi(actor.id);
      if(i===0)store.dispatch(bot.decodeNextAction(state));
      else assert.throws(()=>bot.decodeNextAction(state),
        /outer quarantine blocked/);
    }
    return 'baseline';
  },{engine:x.engine});
  assert.equal(out.result,'baseline');
  assert.equal(out.audit.followSequentialNativeStores,false);
  assert.equal(out.audit.actualOwnerSelections,1);
});

test('Get Lost destination audit distinguishes real Lost Zone from disappearance',()=>{
  for(const destination of ['lostzone','hand','none']){
    const x=mock({destination});
    const actor={id:'owner'};
    const first={visible:'a'},second={visible:'b'};
    const opponent={id:'enemy',
      discard:{cards:[first,second]},lostzone:{cards:[]},hand:{cards:[]}};
    const state={turn:3,players:[actor,opponent],prompts:[]};
    const out=withSourceStampedGetLostOwner(()=>{
      const store=new x.Store(state);
      store.dispatch(new x.AddPlayerAction());
      const source=new x.Girafarig();
      source.reduceEffect(store,state,
        new x.AttackEffect(actor,source.attacks[0]));
      const action=new x.SimpleTacticsAi(actor.id).decodeNextAction(state);
      assert.ok(action instanceof x.ResolvePromptAction);
      assert.deepEqual(action.result,[first,second]);
      store.dispatch(action);
      return true;
    },{engine:x.engine});
    assert.equal(out.result,true);
    assert.equal(opponent.discard.cards.length,0);
    assert.equal(out.audit.acceptedStoreActions,1);
    assert.equal(out.audit.postDispatchPublicDiscardDepletions,1,
      'Public discard depletion alone is insufficient destination proof');
    const trueMovement=destination==='lostzone';
    assert.equal(out.audit.postDispatchExactLostZoneTransfers,
      trueMovement?1:0);
    assert.equal(out.audit.postDispatchLostZoneTransferUnverified,
      trueMovement?0:1);
    assert.equal(out.audit.selectedEvents[0].lostZoneBefore,0);
    assert.equal(out.audit.selectedEvents[0].lostZoneAfter,
      trueMovement?2:0);
    assert.equal(out.audit.selectedEvents[0].exactLostZoneTransferConfirmed,
      trueMovement);
    assert.deepEqual(opponent.lostzone.cards,
      trueMovement?[first,second]:[]);
    assert.equal(out.audit.competitiveGamesQualified,0);
  }
});

test('zero-card Get Lost acceptance never counts as a positive Lost Zone transfer',()=>{
  const x=mock({destination:'lostzone'});
  const actor={id:'owner'};
  const opponent={id:'enemy',discard:{cards:[]},
    lostzone:{cards:[]},hand:{cards:[]}};
  const state={turn:3,players:[actor,opponent],prompts:[]};
  const out=withSourceStampedGetLostOwner(()=>{
    const store=new x.Store(state);
    store.dispatch(new x.AddPlayerAction());
    const source=new x.Girafarig();
    source.reduceEffect(store,state,
      new x.AttackEffect(actor,source.attacks[0]));
    const action=new x.SimpleTacticsAi(actor.id).decodeNextAction(state);
    assert.deepEqual(action.result,[]);
    store.dispatch(action);
    return true;
  },{engine:x.engine});
  assert.equal(out.audit.acceptedStoreActions,1);
  assert.equal(out.audit.postDispatchPublicDiscardDepletions,0);
  assert.equal(out.audit.postDispatchExactLostZoneTransfers,0);
  assert.equal(out.audit.postDispatchLostZoneTransferUnverified,0);
  assert.equal(out.audit.selectedEvents[0].exactLostZoneTransferConfirmed,
    false);
});

for(const seat of [0,1]){
  test('Get Lost silent Store no-op never counts accepted seat '+seat,()=>{
    const x=mock();
    const original=x.Store.prototype.dispatch;
    x.Store.prototype.dispatch=function(a){return a instanceof x.ResolvePromptAction?this.state:original.call(this,a);};
    const actor={id:'owner'},other={id:'enemy',discard:{cards:[{},{}]}};
    const state={turn:3,players:seat?[other,actor]:[actor,other],prompts:[]};
    let error;
    try{withSourceStampedGetLostOwner(()=>{
      const store=new x.Store(state);store.dispatch(new x.AddPlayerAction());
      const pokemon=new x.Girafarig();
      pokemon.reduceEffect(store,state,new x.AttackEffect(actor,pokemon.attacks[0]));
      store.dispatch(new x.SimpleTacticsAi(actor.id).decodeNextAction(state));
    },{engine:x.engine});}catch(e){error=e;}
    finally{x.Store.prototype.dispatch=original;}
    assert.match(error?.message??'',/without resolving source prompt/);
    assert.equal(error.agent36GetLostAudit.acceptedStoreActions,0);
    assert.equal(error.agent36GetLostAudit.nativeUnsettledSourcePrompts,1);
    assert.equal(other.discard.cards.length,2);
  });
  test('Get Lost stale pending prompt veto seat '+seat,()=>{
    const x=mock();
    const actor={id:'owner'},other={id:'enemy',discard:{cards:[{},{}]}};
    const state={turn:3,players:seat?[other,actor]:[actor,other],prompts:[]};
    let error;
    try{withSourceStampedGetLostOwner(()=>{
      const store=new x.Store(state);store.dispatch(new x.AddPlayerAction());
      const pokemon=new x.Girafarig();
      pokemon.reduceEffect(store,state,new x.AttackEffect(actor,pokemon.attacks[0]));
      const choice=new x.SimpleTacticsAi(actor.id).decodeNextAction(state);
      state.prompts.length=0;store.dispatch(choice);
    },{engine:x.engine});}catch(e){error=e;}
    assert.match(error?.message??'',/source prompt must still be pending/);
    assert.equal(error.agent36GetLostAudit.acceptedStoreActions,0);
    assert.equal(other.discard.cards.length,2);
  });
}
