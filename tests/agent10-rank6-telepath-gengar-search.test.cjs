'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  GENGAR,MEWTWO,chooseGengarFirst,withRank6GengarK1Search
}=require('../simulation/twinleaf/agent10-rank6-telepath-gengar-search.cjs');

class AddPlayerAction {}
class ChooseCardsPrompt {
  constructor(owner){this.playerId=owner.id;this.cards=owner.deck;this.id=17;}
  validate(cards){return cards.length>0&&cards.length<=2&&
    cards.every(c=>c.name.includes('GX')&&c.fullName!==undefined);}
}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
class Store {
  constructor(state){this.state=state;}
  dispatch(action){return action;}
}
class Bot {
  constructor(){this.client={id:101};}
  decodeNextAction(){return {kind:'fallback'};}
}
const dependencies={
  Store,SimpleTacticsAi:Bot,ResolvePromptAction,
  GamePhase:{PLAYER_TURN:3}
};
function fixture({ready=true,withMewtwo=true}={}){
  const pool=[{name:'Gengar & Mimikyu-GX',fullName:GENGAR}];
  if(withMewtwo)pool.push({name:'Mewtwo & Mew-GX',fullName:MEWTWO});
  const own={id:101,deck:{cards:pool},
    active:{getPokemonCard:()=>({name:ready?'Latias ex':'Unown'}),
      energies:{cards:[{name:'Telepathic Psychic Energy'}]}}};
  const prompt=new ChooseCardsPrompt(own);
  const state={turn:3,phase:3,activePlayer:0,
    players:[own,{id:202,hand:{get cards(){throw Error('hidden opponent read');}}}],
    prompts:[prompt]};
  return {state,own,prompt};
}

test('legitimate own K1 search prioritizes Gengar plus Mewtwo native instances',()=>{
  const {state,prompt}=fixture();
  const choices=chooseGengarFirst(prompt,state);
  assert.deepEqual(choices.map(c=>c.fullName),[GENGAR,MEWTWO]);
  assert.equal(choices[0],prompt.cards.cards[0]);
});

test('single Gengar target when Mewtwo is unavailable',()=>{
  const {state,prompt}=fixture({withMewtwo:false});
  assert.deepEqual(chooseGengarFirst(prompt,state).map(c=>c.fullName),[GENGAR]);
});

test('genuine exact-turn bot prompts are intercepted; Store and bot restored',()=>{
  const oldStore=Store.prototype.dispatch;
  const oldBot=Bot.prototype.decodeNextAction;
  const {state}=fixture();
  const store=new Store(state);
  const output=withRank6GengarK1Search(dependencies,()=>{
    store.dispatch(new AddPlayerAction());
    const action=new Bot().decodeNextAction(state);
    assert.equal(action.constructor.name,'ResolvePromptAction');
    assert.deepEqual(action.result.map(c=>c.fullName),[GENGAR,MEWTWO]);
    assert.equal(new Bot().decodeNextAction(state).kind,'fallback');
    return 'continued';
  },{seat:0,turn:3});
  assert.equal(output.result,'continued');
  assert.equal(output.audit.seenActualOwnerPrompt,1);
  assert.equal(output.audit.events[0].liveStoreIdentical,true);
  assert.strictEqual(Store.prototype.dispatch,oldStore);
  assert.strictEqual(Bot.prototype.decodeNextAction,oldBot);
});

test('speculative state clones, wrong actual turn and wrong Active are untouched',()=>{
  for(const option of ['copy','turn','active']){
    const {state}=fixture({ready:option!=='active'});
    const store=new Store(state);
    const output=withRank6GengarK1Search(dependencies,()=>{
      store.dispatch(new AddPlayerAction());
      const seen=option==='copy'?{...state}:option==='turn'?
        {...state,turn:4}:state;
      return new Bot().decodeNextAction(seen);
    },{seat:0,turn:3});
    assert.equal(output.result.kind,'fallback');
    assert.equal(output.audit.seenActualOwnerPrompt,0);
  }
});

test('unopened owner deck is never inspected at K0',()=>{
  const {state,own}=fixture();
  Object.defineProperty(own.deck,'cards',{get(){throw Error('K0 deck read');}});
  state.prompts=[];
  const store=new Store(state);
  const output=withRank6GengarK1Search(dependencies,()=>{
    store.dispatch(new AddPlayerAction());
    return new Bot().decodeNextAction(state);
  },{seat:0,turn:3});
  assert.equal(output.result.kind,'fallback');
  assert.equal(output.audit.seenActualOwnerPrompt,0);
});
