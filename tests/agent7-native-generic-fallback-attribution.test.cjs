'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,withNativeGenericFallbackAttribution}=require(
  '../simulation/twinleaf/agent7-native-generic-fallback-attribution.cjs');

class AddPlayerAction{}
class PassTurnAction{}
class ResolvePromptAction{}
class ChooseCardsPrompt{
  constructor(playerId){this.playerId=playerId;this.result=undefined;}
}
class WaitPrompt{
  constructor(playerId){this.playerId=playerId;this.result=undefined;}
}
class Store{
  constructor(state){this.state=state;this.dispatchCalls=0;}
  dispatch(action){this.dispatchCalls++;return action;}
}
class Bot{
  constructor(id){this.client={id};this.decoded=0;}
  decodeNextAction(state){
    this.decoded++;
    return state.prompts.length?new ResolvePromptAction():new PassTurnAction();
  }
}
function state(){
  return {turn:2,phase:3,activePlayer:0,
    players:[{id:'A',hand:['private-A'],deck:['secret-A'],prizes:['pA']},
      {id:'B',hand:['private-B'],deck:['secret-B'],prizes:['pB']}],
    prompts:[]};
}
test('live Store fallback attribution separates seats, owner prompts and generic roots',()=>{
  const originalDecode=Bot.prototype.decodeNextAction;
  const originalDispatch=Store.prototype.dispatch;
  const game=state(),store=new Store(game),a=new Bot('A'),b=new Bot('B');
  const wrapped=withNativeGenericFallbackAttribution(()=>{
    store.dispatch(new AddPlayerAction());
    const outsider={...game};
    assert.ok(a.decodeNextAction(outsider) instanceof PassTurnAction);
    assert.ok(a.decodeNextAction(game) instanceof PassTurnAction);
    game.prompts=[new ChooseCardsPrompt('A')];
    assert.ok(a.decodeNextAction(game) instanceof ResolvePromptAction);
    assert.ok(b.decodeNextAction(game) instanceof ResolvePromptAction);
    game.prompts=[new WaitPrompt('B')];
    assert.ok(b.decodeNextAction(game) instanceof ResolvePromptAction);
    game.prompts=[];
    game.activePlayer=1;
    assert.ok(b.decodeNextAction(game) instanceof PassTurnAction);
    return 42;
  },{SimpleTacticsAi:Bot,Store,maxRecords:2});
  const x=wrapped.audit;
  assert.equal(wrapped.result,42);
  assert.equal(x.version,VERSION);
  assert.equal(x.gameStoresSeen,1);
  assert.equal(x.liveGenericDecodes,5);
  assert.equal(x.nonLiveDelegations,1);
  assert.equal(x.bySeat[0]['owner-root-or-setup'],1);
  assert.equal(x.bySeat[0]['owner-prompt'],1);
  assert.equal(x.bySeat[1]['foreign-prompt'],1);
  assert.equal(x.bySeat[1]['owner-prompt'],1);
  assert.equal(x.bySeat[1]['owner-root-or-setup'],1);
  assert.deepEqual(x.byOwnerPromptType[0],{ChooseCardsPrompt:1});
  assert.deepEqual(x.byOwnerPromptType[1],{WaitPrompt:1});
  assert.equal(x.boundedRecords.length,2);
  assert.equal(x.unrecordedLiveDecodes,3);
  assert.equal(x.actionTypes.ResolvePromptAction,3);
  assert.equal(x.actionTypes.PassTurnAction,2);
  assert.equal(x.distinctOwnerPromptObjects,2);
  assert.deepEqual(x.distinctOwnerPromptBySeat,{0:1,1:1});
  assert.deepEqual(x.distinctOwnerPromptType[0],{ChooseCardsPrompt:1});
  assert.deepEqual(x.distinctOwnerPromptType[1],{WaitPrompt:1});
  assert.deepEqual(x.boundedRecords.map(row=>row.firstDecoderCallForPrompt),
    [false,true]);
  assert.ok(!JSON.stringify(x).includes('private-'));
  assert.ok(!JSON.stringify(x).includes('secret-'));
  assert.strictEqual(Bot.prototype.decodeNextAction,originalDecode);
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
});
test('new native Store instances reset game index without merging per-seat counts',()=>{
  const v=withNativeGenericFallbackAttribution(()=>{
    const a=new Store(state()),b=new Store(state());
    a.dispatch(new AddPlayerAction());
    new Bot('A').decodeNextAction(a.state);
    b.dispatch(new AddPlayerAction());
    new Bot('B').decodeNextAction(b.state);
    return 'done';
  },{SimpleTacticsAi:Bot,Store});
  assert.equal(v.audit.gameStoresSeen,2);
  assert.deepEqual(v.audit.boundedRecords.map(x=>x.gameIndex),[1,2]);
  assert.deepEqual(v.audit.boundedRecords.map(x=>x.seat),[0,1]);
  assert.equal(v.audit.qualification.competitiveGames,0);
});
test('original decoder errors propagate and both reversible hooks restore',()=>{
  class ThrowBot{
    constructor(){this.client={id:'A'};}
    decodeNextAction(){throw new Error('native-decoder-failure');}
  }
  const before=ThrowBot.prototype.decodeNextAction;
  const beforeDispatch=Store.prototype.dispatch;
  assert.throws(()=>withNativeGenericFallbackAttribution(()=>{
    const s=new Store(state());
    s.dispatch(new AddPlayerAction());
    new ThrowBot().decodeNextAction(s.state);
  },{SimpleTacticsAi:ThrowBot,Store}),/native-decoder-failure/);
  assert.strictEqual(ThrowBot.prototype.decodeNextAction,before);
  assert.strictEqual(Store.prototype.dispatch,beforeDispatch);
});

test('multiple original decoder polls of one native prompt count once, new object counts again',()=>{
  const game=state(),store=new Store(game),bot=new Bot('A');
  const seen=withNativeGenericFallbackAttribution(()=>{
    store.dispatch(new AddPlayerAction());
    game.prompts=[new WaitPrompt('A')];
    for(let n=0;n<9;n++)bot.decodeNextAction(game);
    game.prompts=[new WaitPrompt('A')];
    for(let n=0;n<4;n++)bot.decodeNextAction(game);
  },{SimpleTacticsAi:Bot,Store,maxRecords:24});
  assert.equal(seen.audit.liveGenericDecodes,13);
  assert.equal(seen.audit.distinctOwnerPromptObjects,2);
  assert.equal(seen.audit.distinctOwnerPromptBySeat[0],2);
  assert.equal(seen.audit.distinctOwnerPromptBySeat[1],0);
  assert.deepEqual(seen.audit.distinctOwnerPromptType[0],{WaitPrompt:2});
  assert.deepEqual(seen.audit.boundedRecords.map(r=>r.firstDecoderCallForPrompt),
    [true,...Array(8).fill(false),true,...Array(3).fill(false)]);
  assert.equal(seen.audit.qualification.competitiveGames,0);
});

test('distinct prompt identity resets on real Store turnover, never across cloned speculative states',()=>{
  const first=state(),next=state();
  const a=new Store(first),b=new Store(next),bot=new Bot('A');
  const out=withNativeGenericFallbackAttribution(()=>{
    a.dispatch(new AddPlayerAction());
    first.prompts=[new ChooseCardsPrompt('A')];
    bot.decodeNextAction(first);
    bot.decodeNextAction({...first});
    b.dispatch(new AddPlayerAction());
    next.prompts=[new ChooseCardsPrompt('A')];
    bot.decodeNextAction(next);
  },{SimpleTacticsAi:Bot,Store});
  assert.equal(out.audit.gameStoresSeen,2);
  assert.equal(out.audit.distinctOwnerPromptObjects,2);
  assert.equal(out.audit.nonLiveDelegations,1);
  assert.deepEqual(out.audit.boundedRecords.map(r=>r.gameIndex),[1,2]);
});
