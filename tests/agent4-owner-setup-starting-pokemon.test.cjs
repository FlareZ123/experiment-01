'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerStartingPokemon,chooseOwnerBonusBench,
  withOwnerStartingPokemon:starting}=
  require('../simulation/twinleaf/agent4-owner-setup-starting-pokemon.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

class AddPlayerAction{}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  constructor(player,allowed=[0,2],message='CHOOSE_STARTING_POKEMONS',min=1){
    this.id=21;this.playerId=player.id;this.result=undefined;
    this.message=message;this.cards=player.hand;
    this.options={min,max:6,allowCancel:false,
      blocked:player.hand.cards.map((_,i)=>i).filter(i=>!allowed.includes(i))};
  }
  validate(cards){
    return Array.isArray(cards)&&cards.length>=this.options.min&&cards.length<=6&&
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
      if(p.options.min===1){
        owner.active.cards=[action.result[0]];
        owner.hand.cards=owner.hand.cards.filter(c=>c!==action.result[0]);
      }
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
function fixture(seat,blocked=[1],message='CHOOSE_STARTING_POKEMONS',
  min=1,benchCount=0){
  const id=seat===0?'A':'B';
  const owner={id,hand:{cards:[
    {fullName:'Mew V FST'},
    {fullName:'Double Turbo Energy BRS'},
    {fullName:'Genesect V FST'}
  ]},active:{cards:min===0?[{fullName:'already-active'}]:[]},
    bench:Array.from({length:5},(_,i)=>({
      cards:i<benchCount?[{fullName:'occupied-'+i}]:[]
    }))};
  const other={id:seat===0?'B':'A',hand:{cards:[]},active:{cards:[]}};
  const players=seat===0?[owner,other]:[other,owner];
  const state={phase:1,turn:0,players,unseenOpponentHand:['secret'],
    prompts:[new ChooseCardsPrompt(owner,
      [0,1,2].filter(i=>!blocked.includes(i)),message,min)]};
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

test('bonus Bench selector is an explicit optional decline and keeps no native Card',()=>{
  const answer=chooseOwnerBonusBench({
    actor:{decisionKind:'owner-prompt',phase:1,globalTurn:0},
    prompt:{kind:'ChooseCardsPrompt',message:'CHOOSE_STARTING_POKEMONS',
      min:0}
  });
  assert.deepEqual(answer,{kind:'owner-bonus-bench-decline',handIndices:[]});
  assert.ok(Object.isFrozen(answer));
  assert.throws(()=>chooseOwnerBonusBench({
    actor:{decisionKind:'owner-prompt',phase:1,globalTurn:0},
    prompt:{kind:'ChooseCardsPrompt',message:'CHOOSE_STARTING_POKEMONS',
      min:1}
  }),{name:'AssertionError'});
});

test('bonus Bench min0 preserves all owner physical zones for both seats and full Bench',()=>{
  for(const seat of [0,1])for(const benchCount of [0,3,5]){
    for(const secret of [['first','second'],['second','first']]){
      const {bot,store,owner}=fixture(seat,[1],
        'CHOOSE_STARTING_POKEMONS',0,benchCount);
      store.state.unseenOpponentHand=secret;
      const beforeHand=[...owner.hand.cards];
      const beforeActive=[...owner.active.cards];
      const beforeBench=owner.bench.map(slot=>[...slot.cards]);
      const r=quarantine(()=>starting(()=>{
        store.dispatch(new AddPlayerAction());
        const action=bot.decodeNextAction(store.state);
        assert.ok(action instanceof ResolvePromptAction);
        assert.deepEqual(action.result,[]);
        store.dispatch(action);
        return action.result;
      },deps),{SimpleTacticsAi:Bot});
      assert.deepEqual(r.result.result,[]);
      assert.equal(r.audit.rawStateFallbackCalls,0);
      assert.equal(r.result.audit.selectedInitial,0);
      assert.equal(r.result.audit.selectedBonusDecline,1);
      assert.equal(r.result.audit.acceptedBonusDecline,1);
      assert.equal(r.result.audit.bonusDeclinePhysicalZonesPreserved,1);
      assert.deepEqual(owner.hand.cards,beforeHand);
      assert.deepEqual(owner.active.cards,beforeActive);
      assert.deepEqual(owner.bench.map(slot=>slot.cards),beforeBench);
      assert.equal(bot.nativeReads,0);
    }
  }
});

test('unmodeled setup prompt cardinality min2 delegates to quarantine',()=>{
  const {bot,store}=fixture(0,[],'CHOOSE_STARTING_POKEMONS',2);
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

test('bonus Bench decline tolerates a genuine start-of-turn card draw',()=>{
  const {bot,store,owner}=fixture(1,[1],
    'CHOOSE_STARTING_POKEMONS',0,1);
  const existing=[...owner.hand.cards];
  const old=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  Object.defineProperty(Store.prototype,'dispatch',{
    ...old,value:function(action){
      const result=old.value.call(this,action);
      if(action instanceof ResolvePromptAction)
        owner.hand.cards.push({fullName:'first-turn topdeck'});
      return result;
    }
  });
  try{
    const output=quarantine(()=>starting(()=>{
      store.dispatch(new AddPlayerAction());
      store.dispatch(bot.decodeNextAction(store.state));
      return true;
    },deps),{SimpleTacticsAi:Bot});
    assert.equal(output.result.audit.acceptedBonusDecline,1);
    assert.equal(output.result.audit.bonusDeclinePermitsSubsequentTurnDraw,true);
    assert.deepEqual(owner.hand.cards.slice(0,existing.length),existing);
    assert.equal(owner.hand.cards.at(-1).fullName,'first-turn topdeck');
  }finally{
    Object.defineProperty(Store.prototype,'dispatch',old);
  }
});
