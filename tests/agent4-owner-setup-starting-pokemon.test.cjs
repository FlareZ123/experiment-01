'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerStartingPokemon,withOwnerStartingPokemon:starting}=
  require('../simulation/twinleaf/agent4-owner-setup-starting-pokemon.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

class AddPlayerAction{}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  constructor(player,allowed=[0,2],message='CHOOSE_STARTING_POKEMONS'){
    this.id=21;this.playerId=player.id;this.result=undefined;
    this.message=message;this.cards=player.hand;
    this.options={min:1,max:6,allowCancel:false,
      blocked:player.hand.cards.map((_,i)=>i).filter(i=>!allowed.includes(i))};
  }
  validate(cards){
    return Array.isArray(cards)&&cards.length>=1&&cards.length<=6&&
      cards.every(card=>this.cards.cards.includes(card)&&
        !this.options.blocked.includes(this.cards.cards.indexOf(card)));
  }
}
class Store{
  constructor(state){this.state=state;this.actions=[];}
  dispatch(action){
    this.actions.push(action);
    if(action instanceof ResolvePromptAction){
      const p=this.state.prompts[0];
      assert.equal(p.validate(action.result),true);
      p.result=action.result;
      const owner=this.state.players.find(x=>x.id===p.playerId);
      owner.active.cards=[action.result[0]];
      owner.hand.cards=owner.hand.cards.filter(c=>c!==action.result[0]);
    }
    return this.state;
  }
}
class Bot{
  constructor(id){this.client={id};this.nativeReads=0;}
  decodeNextAction(state){
    this.nativeReads++;
    return state.unseenOpponentHand;
  }
}
function fixture(seat,blocked=[1],message='CHOOSE_STARTING_POKEMONS'){
  const id=seat===0?'A':'B';
  const owner={id,hand:{cards:[
    {fullName:'Mew V FST'},
    {fullName:'Double Turbo Energy BRS'},
    {fullName:'Genesect V FST'}
  ]},active:{cards:[]}};
  const other={id:seat===0?'B':'A',hand:{cards:[]},active:{cards:[]}};
  const players=seat===0?[owner,other]:[other,owner];
  const state={phase:1,turn:0,players,unseenOpponentHand:['secret'],
    prompts:[new ChooseCardsPrompt(owner,
      [0,1,2].filter(i=>!blocked.includes(i)),message)]};
  return {bot:new Bot(id),store:new Store(state),owner};
}
const deps={
  SimpleTacticsAi:Bot,Store,ResolvePromptAction,
  observe(state,seat){
    return Object.freeze({
      decisionKind:'owner-prompt',phase:state.phase,globalTurn:state.turn,
      ownHand:state.players[seat].hand.cards.map(card=>card.fullName)
    });
  },
  validate(state,action){
    assert.equal(state.prompts[0].validate(action.result),true);
  }
};

test('pure selector accepts detached eligible menu only',()=>{
  const input={
    actor:{decisionKind:'owner-prompt',phase:1,globalTurn:0},
    prompt:{kind:'ChooseCardsPrompt',message:'CHOOSE_STARTING_POKEMONS',
      eligible:[{index:2,printing:'Genesect V FST'}]}
  };
  assert.deepEqual(chooseOwnerStartingPokemon(input),
    {kind:'owner-opening-single-basic',handIndices:[2]});
  assert.throws(()=>chooseOwnerStartingPokemon({
    ...input,prompt:{...input.prompt,eligible:[]}
  }),{name:'AssertionError'});
});

test('both native seats and concealed-order variations select only legal own Basic',()=>{
  const beforeBot=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  const beforeStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  for(const seat of [0,1])for(const secret of [
    ['Top','Bottom'],['Bottom','Top']
  ]){
    const {bot,store,owner}=fixture(seat,[0,1]);
    store.state.unseenOpponentHand=[...secret];
    const r=starting(()=>{
      store.dispatch(new AddPlayerAction());
      const action=bot.decodeNextAction(store.state);
      store.dispatch(action);
      return action.result.map(c=>c.fullName);
    },deps);
    assert.deepEqual(r.result,['Genesect V FST']);
    assert.equal(r.audit.physicallyPlacedActiveConfirmed,1);
    assert.equal(r.audit.selected,1);
    assert.equal(r.audit.accepted,1);
    assert.equal(r.audit.bySeat[seat],1);
    assert.deepEqual(owner.active.cards.map(c=>c.fullName),
      ['Genesect V FST']);
    assert.equal(bot.nativeReads,0);
  }
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Bot.prototype,'decodeNextAction'),beforeBot);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch'),beforeStore);
});

test('unexpected setup Choice message delegates to outer quarantine',()=>{
  const {bot,store}=fixture(0,[],'CHOOSE_PRIZES_SETUP');
  assert.throws(()=>quarantine(()=>starting(()=>{
    store.dispatch(new AddPlayerAction());
    bot.decodeNextAction(store.state);
  },deps),{SimpleTacticsAi:Bot}),error=>{
    assert.equal(error.code,CODE);
    assert.equal(error.ownerStartingPokemonAudit.selected,0);
    assert.equal(bot.nativeReads,0);
    return true;
  });
});
