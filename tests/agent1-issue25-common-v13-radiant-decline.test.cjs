'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerRadiantDecline}=
  require('../simulation/twinleaf/agent1-owner-radiant-decline.cjs');
const {withPerMatchRadiantDecline,VERSION}=
  require('../simulation/evaluation/agent1-issue25-common-v13-radiant-decline.cjs');
const {PREFIX}=
  require('../simulation/twinleaf/agent1-wondertag-registered-actor-witness.cjs');
const {registeredTrials}=
  require('../simulation/evaluation/agent36-issue25-common-v6.cjs');

function fixture(){
  class Play{constructor(player,pokemonCard){
    this.player=player;this.pokemonCard=pokemonCard;
  }}
  class Confirm{constructor(playerId,message){
    this.playerId=playerId;this.message=message;this.id=42;
    this.result=undefined;
  }}
  class Radiant{
    constructor(){this.fullName='Radiant Eternatus CRZ';}
    reduceEffect(store,state,effect){
      if(effect instanceof Play)
        store.prompt(state,new Confirm(effect.player.id,'WANT_TO_USE_ABILITY'),
          ()=>state);
      return state;
    }
  }
  class Resolve{constructor(promptId,result){
    this.promptId=promptId;this.result=result;
  }}
  class Store{
    constructor(state){this.state=state;}
    prompt(state,prompt){
      state.prompts.push(prompt);
      return state;
    }
    dispatch(action){
      const prompt=this.state.prompts.find(p=>p.id===action.promptId);
      prompt.result=action.result;
      return this.state;
    }
  }
  class Ai{
    constructor(id){this.client={id};}
    decodeNextAction(){
      return {kind:'fallback'};
    }
  }
  const state={
    players:[{id:101},{id:202}],prompts:[]
  };
  const store=new Store(state);
  const deps={
    SimpleTacticsAi:Ai,Store,
    RadiantEternatus:Radiant,PlayPokemonEffect:Play,
    ConfirmPrompt:Confirm,ResolvePromptAction:Resolve,
    GameMessage:{WANT_TO_USE_ABILITY:'WANT_TO_USE_ABILITY'},
    assertValidPromptAction:(_state,action)=>{
      assert.ok(action instanceof Resolve);
    }
  };
  return {Play,Confirm,Radiant,Resolve,Store,Ai,state,store,deps};
}

test('actual printed Radiant owner Confirm is natively declined in both seats',()=>{
  for(const seat of [0,1]){
    const f=fixture();
    const before={
      reduce:f.Radiant.prototype.reduceEffect,
      decode:f.Ai.prototype.decodeNextAction,
      dispatch:f.Store.prototype.dispatch
    };
    const outcome=withOwnerRadiantDecline(()=>{
      const card=new f.Radiant(),owner=f.state.players[seat];
      card.reduceEffect(f.store,f.state,new f.Play(owner,card));
      assert.equal(f.state.prompts.length,1);
      const action=new f.Ai(owner.id).decodeNextAction(f.state);
      assert.ok(action instanceof f.Resolve);
      assert.equal(action.result,false);
      f.store.dispatch(action);
      return f.state.prompts[0].result;
    },f.deps);
    assert.equal(outcome.result,false);
    assert.equal(outcome.audit.printedOfferCount,1);
    assert.equal(outcome.audit.ownerDeclineProposals,1);
    assert.equal(outcome.audit.nativeDeclinesAccepted,1);
    assert.equal(outcome.audit.bySeat[seat],1);
    assert.equal(outcome.audit.nativeDeclinesRejected,0);
    assert.strictEqual(f.Radiant.prototype.reduceEffect,before.reduce);
    assert.strictEqual(f.Ai.prototype.decodeNextAction,before.decode);
    assert.strictEqual(f.Store.prototype.dispatch,before.dispatch);
  }
});

test('unrelated and other-owner confirmations delegate without native mutation',()=>{
  const f=fixture();
  const other=f.state.players[1],card=new f.Radiant();
  const report=withOwnerRadiantDecline(()=>{
    card.reduceEffect(f.store,f.state,
      new f.Play(f.state.players[0],card));
    const otherAction=new f.Ai(other.id).decodeNextAction(f.state);
    assert.deepEqual(otherAction,{kind:'fallback'});
    f.state.prompts.length=0;
    f.store.prompt(f.state,new f.Confirm(other.id,'WANT_TO_USE_ABILITY'),
      ()=>f.state);
    const unrelated=new f.Ai(other.id).decodeNextAction(f.state);
    assert.deepEqual(unrelated,{kind:'fallback'});
    return 'delegated';
  },f.deps);
  assert.equal(report.result,'delegated');
  assert.equal(report.audit.printedOfferCount,1);
  assert.equal(report.audit.ownerDeclineProposals,0);
  assert.equal(report.audit.nativeDeclinesAccepted,0);
});

test('per-live-match radiant wrapper records actual trial and restores runner',()=>{
  const id=registeredTrials()[4].id;
  const calls=[];
  const original=request=>{
    calls.push('Store:'+request.label);
    return 'native-result';
  };
  const headless={runMatch:original};
  const nativeRadiant=(next)=>{
    calls.push('radiant-installed');
    return {result:next(),audit:{printedOfferCount:1,
      nativeDeclinesAccepted:1,bySeat:{0:1,1:0}}};
  };
  const run=withPerMatchRadiantDecline(()=>{
    calls.push('canonical-root-installed');
    return headless.runMatch({label:PREFIX+id});
  },{headless,radiant:nativeRadiant});
  assert.equal(run.result,'native-result');
  assert.strictEqual(headless.runMatch,original);
  assert.deepEqual(calls,[
    'canonical-root-installed','radiant-installed',
    'Store:'+PREFIX+id
  ]);
  assert.equal(run.audit.version,VERSION);
  assert.equal(run.audit.perNativeMatch.length,1);
  assert.equal(run.audit.perNativeMatch[0].id,id);
  assert.equal(run.audit.perNativeMatch[0].ownerRadiant.nativeDeclinesAccepted,1);
});

test('unregistered physical match is rejected before any native side effects',()=>{
  let calls=0;
  const headless={runMatch:()=>{calls++;return 'native';}};
  assert.throws(()=>withPerMatchRadiantDecline(()=>
    headless.runMatch({label:PREFIX+'not-registered'}),{
      headless,radiant:next=>({result:next(),audit:{}})
    }),/frozen v7 original trial/);
  assert.equal(calls,0);
});
