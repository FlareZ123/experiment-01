'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,handIndex,trubbishIndex,withOwnerOranguruStarVipPlan}=
  require('../simulation/twinleaf/agent1-owner-oranguru-starvip-native.cjs');

function fakes(){
  class Bot {
    constructor(){this.client={id:0};}
    decodeNextAction(){return {kind:'unchanged-fallback'};}
  }
  class Store {
    dispatch(action){return {action};}
  }
  class PlayCardAction {}
  class UseAbilityAction {}
  class ResolvePromptAction {}
  const liveStore={state:{turn:1}};
  return {Bot,Store,liveStore,deps:{
    SimpleTacticsAi:Bot,Store,
    GamePhase:{PLAYER_TURN:3},
    play:{PlayCardAction,PlayerType:{ANY:2,BOTTOM_PLAYER:0},
      SlotType:{BOARD:1,ACTIVE:2,BENCH:3}},
    ability:{UseAbilityAction},prompt:{ResolvePromptAction},
    liveStore}};
}

test('exact source print selectors read only owner hand and public Bench',()=>{
  const owner={
    hand:{cards:[{fullName:'Forest Seal Stone SIT'},
      {fullName:'Boost Shake EVS'}]},
    bench:[{getPokemonCard:()=>({fullName:'Trubbish FST'}),tools:[]},
      {getPokemonCard:()=>({fullName:'Trubbish FST'}),
        tools:[{fullName:'Float Stone BKT'}]},
      {getPokemonCard:()=>null,tools:[]}]
  };
  assert.equal(handIndex(owner,'Forest Seal Stone SIT'),0);
  assert.equal(handIndex(owner,'Float Stone BKT'),-1);
  assert.equal(trubbishIndex(owner),0);
  assert.equal(VERSION,'agent1-owner-observable-starvip-native-continuation-v1');
});

test('default adapter preserves generic decision and restores both native prototypes',()=>{
  const {Bot,Store,liveStore,deps}=fakes();
  const ai=new Bot(),original=Bot.prototype.decodeNextAction;
  const dispatch=Store.prototype.dispatch;
  const response=withOwnerOranguruStarVipPlan(()=>{
    const delegated=ai.decodeNextAction({turn:1});
    assert.deepEqual(delegated,{kind:'unchanged-fallback'});
    assert.deepEqual(new Store().dispatch('pass'),{action:'pass'});
    return 19;
  },{},deps);
  assert.equal(response.result,19);
  assert.equal(response.audit.plansChosen,0);
  assert.equal(response.audit.nonLiveDelegations,1);
  assert.equal(Bot.prototype.decodeNextAction,original);
  assert.equal(Store.prototype.dispatch,dispatch);
  assert.equal(liveStore.state.turn,1);
});

test('adapter restores both patched prototypes on an executor exception',()=>{
  const {Bot,Store,deps}=fakes();
  const original=Bot.prototype.decodeNextAction;
  const dispatch=Store.prototype.dispatch;
  assert.throws(()=>withOwnerOranguruStarVipPlan(()=>{
    throw new Error('synthetic-native-run-failed');
  },{chooseOffer:()=>true},deps),/synthetic-native-run-failed/);
  assert.equal(Bot.prototype.decodeNextAction,original);
  assert.equal(Store.prototype.dispatch,dispatch);
});
