'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withNativeGenericFallbackAttribution}=require(
  '../simulation/twinleaf/agent7-native-generic-fallback-attribution.cjs');

class AddPlayerAction {}
class FakeStore {
  constructor(state){this.state=state;}
  dispatch(action){return action;}
}
class FakeBot {
  constructor(id){this.client={id};}
  decodeNextAction(){return {kind:'generic-pass'};}
}
function state(){
  return {turn:2,phase:5,activePlayer:0,prompts:[],
    players:[
      {id:'A',hand:['private-A'],deck:['secret-A'],prizes:['prized-A']},
      {id:'B',hand:['private-B'],deck:['secret-B'],prizes:['prized-B']}
    ]};
}

test('aborted native game retains detached generic decision denominator and original error',()=>{
  const originalDispatch=FakeStore.prototype.dispatch;
  const originalDecode=FakeBot.prototype.decodeNextAction;
  const game=state(),store=new FakeStore(game),bot=new FakeBot('A');
  const failure=new Error('engine-abort');
  let caught=null;
  try{
    withNativeGenericFallbackAttribution(()=>{
      store.dispatch(new AddPlayerAction());
      bot.decodeNextAction(game);
      bot.decodeNextAction({...game});
      throw failure;
    },{Store:FakeStore,SimpleTacticsAi:FakeBot,maxRecords:4});
  }catch(error){caught=error;}
  assert.strictEqual(caught,failure,'original error identity must survive');
  const census=caught.nativeGenericFallbackEvidence;
  assert.ok(census,'interrupted native audit must be available');
  assert.equal(census.interrupted,true);
  assert.equal(census.gameStoresSeen,1);
  assert.equal(census.liveGenericDecodes,1);
  assert.equal(census.nonLiveDelegations,1);
  assert.equal(census.bySeat[0]['owner-root-or-setup'],1);
  assert.equal(census.boundedRecords.length,1);
  assert.equal(census.qualification.competitiveGames,0);
  const json=JSON.stringify(census);
  for(const secret of ['private-','secret-','prized-'])
    assert.equal(json.includes(secret),false,'hidden zone leaked in failure audit');
  assert.strictEqual(FakeStore.prototype.dispatch,originalDispatch);
  assert.strictEqual(FakeBot.prototype.decodeNextAction,originalDecode);
});

test('original decoder failure is retained with attempted native fallback count',()=>{
  class FailingBot {
    constructor(){this.client={id:'B'};}
    decodeNextAction(){throw Error('original-decode-failure');}
  }
  const original=FailingBot.prototype.decodeNextAction;
  const originalDispatch=FakeStore.prototype.dispatch;
  const game=state(),store=new FakeStore(game);
  let caught=null;
  try{
    withNativeGenericFallbackAttribution(()=>{
      store.dispatch(new AddPlayerAction());
      new FailingBot().decodeNextAction(game);
    },{Store:FakeStore,SimpleTacticsAi:FailingBot,maxRecords:3});
  }catch(error){caught=error;}
  assert.match(String(caught),/original-decode-failure/);
  assert.equal(caught.nativeGenericFallbackEvidence.interrupted,true);
  assert.equal(caught.nativeGenericFallbackEvidence.failedGenericDecodes,1);
  assert.equal(caught.nativeGenericFallbackEvidence.liveGenericDecodes,0);
  assert.strictEqual(FailingBot.prototype.decodeNextAction,original);
  assert.strictEqual(FakeStore.prototype.dispatch,originalDispatch);
});
