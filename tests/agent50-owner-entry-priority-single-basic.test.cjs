'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  chooseOwnerNonEntryActive,withOwnerEntryPriorityOpening,VERSION
}=require('../simulation/twinleaf/agent50-owner-entry-priority-single-basic.cjs');

const entryText=
  'When you play this Pokémon from your hand onto your Bench during your turn, you may draw 2 cards.';
const c=(fullName,isEntry=false)=>({
  fullName,powers:isEntry?[{text:entryText}]:[]
});

function input(ownHandTurnEntrySupport){
  return {
    actor:{
      decisionKind:'owner-prompt',phase:1,globalTurn:0,
      ownHand:['Tapu Lele-GX GRI','Regidrago V SIT','Crobat V DAA'],
      ownHandTurnEntrySupport
    },
    prompt:{
      kind:'ChooseCardsPrompt',message:'CHOOSE_STARTING_POKEMONS',
      eligible:[{index:0,printing:'Tapu Lele-GX GRI'},
        {index:1,printing:'Regidrago V SIT'},
        {index:2,printing:'Crobat V DAA'}]
    }
  };
}

test('pure policy prefers a non-entry owner Basic with all inputs from owner hand',()=>{
  const x=chooseOwnerNonEntryActive(input([true,false,true]));
  assert.deepEqual(x,{kind:'owner-opening-single-basic',handIndices:[1]});
  assert.ok(Object.isFrozen(x));
  assert.ok(Object.isFrozen(x.handIndices));
  assert.deepEqual(chooseOwnerNonEntryActive(input([true,true,true])),
    {kind:'owner-opening-single-basic',handIndices:[0]});
  assert.throws(()=>chooseOwnerNonEntryActive({
    ...input([true]),actor:{...input([true]).actor,ownHandTurnEntrySupport:[true]}
  }),{name:'AssertionError'});
});

class AddPlayerAction{}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  constructor(owner){
    this.id=57;this.playerId=owner.id;this.cards=owner.hand;
    this.result=undefined;this.message='CHOOSE_STARTING_POKEMONS';
    this.options={min:1,max:6,allowCancel:false,blocked:[]};
  }
  validate(result){
    return Array.isArray(result)&&
      result.length>=1&&result.length<=this.options.max&&
      result.every(card=>this.cards.cards.includes(card));
  }
}
class Store{
  constructor(state){this.state=state;this.actions=[];}
  dispatch(action){
    this.actions.push(action.constructor.name);
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts[0];
      assert.equal(prompt.validate(action.result),true);
      const owner=this.state.players.find(x=>x.id===prompt.playerId);
      owner.active.cards.push(action.result[0]);
      owner.hand.cards=owner.hand.cards.filter(x=>x!==action.result[0]);
      prompt.result=action.result;
    }
    return this.state;
  }
}
class Bot{
  constructor(id){this.client={id};this.nativeInvocations=0;}
  decodeNextAction(state){
    this.nativeInvocations++;
    return state.hiddenOpponentHand;
  }
}

function realMock(seat,hidden){
  const ownId=seat===0?101:202;
  const otherId=seat===0?202:101;
  const owner={
    id:ownId,hand:{cards:[
      c('Tapu Lele-GX GRI',true),c('Regidrago V SIT'),
      c('Crobat V DAA',true)]},
    active:{cards:[]},bench:[{cards:[]},{cards:[]},{cards:[]},
      {cards:[]},{cards:[]}]
  };
  const other={id:otherId,hand:{cards:[c('SECRET1'),c('SECRET2')]}};
  const state={phase:1,turn:0,hiddenOpponentHand:hidden,
    players:seat===0?[owner,other]:[other,owner],
    prompts:[new ChooseCardsPrompt(owner)]};
  return {owner,state,store:new Store(state),bot:new Bot(ownId)};
}

const deps={
  SimpleTacticsAi:Bot,Store,ResolvePromptAction,
  observe(state,seat){
    return Object.freeze({
      decisionKind:'owner-prompt',phase:state.phase,
      globalTurn:state.turn,seat,
      ownHand:state.players[seat].hand.cards.map(x=>x.fullName)
    });
  },
  validate(state,action){
    assert.equal(state.prompts[0].validate(action.result),true);
  }
};

test('two-seat native Store adapter uses only owner powers; accepted physical Active',()=>{
  for(const seat of [0,1]){
    for(const hidden of [['TOP','BOTTOM'],['BOTTOM','TOP']]){
      const f=realMock(seat,hidden);
      const baseline=[...f.owner.hand.cards];
      const botDescriptor=Object.getOwnPropertyDescriptor(
        Bot.prototype,'decodeNextAction');
      const storeDescriptor=Object.getOwnPropertyDescriptor(
        Store.prototype,'dispatch');
      const result=withOwnerEntryPriorityOpening(()=>{
        f.store.dispatch(new AddPlayerAction());
        const proposed=f.bot.decodeNextAction(f.state);
        assert.ok(proposed instanceof ResolvePromptAction);
        assert.deepEqual(proposed.result,[baseline[1]]);
        f.store.dispatch(proposed);
        return 'settled';
      },deps);
      assert.equal(result.result,'settled');
      assert.equal(result.audit.variant,VERSION);
      assert.equal(result.audit.selected,1);
      assert.equal(result.audit.accepted,1);
      assert.equal(result.audit.physicallyPlacedActiveConfirmed,1);
      assert.equal(result.audit.ownerEntrySelectionEvents.length,1);
      const selected=result.audit.ownerEntrySelectionEvents[0];
      assert.equal(selected.eligibleTurnEntrySupports,2);
      assert.equal(selected.chosenEntrySupport,false);
      assert.equal(selected.chosenOwnerHandIndex,1);
      assert.equal(f.bot.nativeInvocations,0);
      assert.deepEqual(f.owner.active.cards,[baseline[1]]);
      assert.deepEqual(f.owner.hand.cards,[baseline[0],baseline[2]]);
      assert.deepEqual(Object.getOwnPropertyDescriptor(
        Bot.prototype,'decodeNextAction'),botDescriptor);
      assert.deepEqual(Object.getOwnPropertyDescriptor(
        Store.prototype,'dispatch'),storeDescriptor);
      console.log('AGENT50_OWNER_ENTRY_NATIVE_STORE',JSON.stringify({
        seat,hiddenOrder:hidden,selected:baseline[1].fullName,
        remainingOwnerHand:f.owner.hand.cards.map(x=>x.fullName),
        physicalActiveConfirmed:true,qualifiedGames:0
      }));
    }
  }
});
