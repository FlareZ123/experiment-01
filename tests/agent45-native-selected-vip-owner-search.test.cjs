'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  withNativeSelectedVipOwnerSearch
}=require('../simulation/twinleaf/agent45-native-selected-vip-owner-search.cjs');

const STAGE={BASIC:0,STAGE_1:1};
const SUPER={POKEMON:1,TRAINER:2};
const VIP='Battle VIP Pass FST';
const BASIC=name=>({
  name,fullName:name+' TEST',stage:STAGE.BASIC,
  superType:SUPER.POKEMON
});
const STAGE1=(name,from)=>({
  name,fullName:name+' TEST',stage:STAGE.STAGE_1,
  superType:SUPER.POKEMON,evolvesFrom:from
});
class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class PassTurnAction{}
class Bot{
  constructor(id){this.client={id};}
  decodeNextAction(state){
    const owner=state.players.find(p=>p.id===this.client.id);
    if(state.prompts.some(p=>p.result===undefined&&p.playerId===owner.id))
      return new PassTurnAction();
    if(owner.hand.cards.some(c=>c.fullName===VIP))
      return new PlayCardAction(owner.id,
        owner.hand.cards.findIndex(c=>c.fullName===VIP));
    return new PassTurnAction();
  }
}
class ChooseCardsPrompt{
  constructor(owner,id,max=2,min=0){
    this.id=id;
    this.playerId=owner.id;
    this.message='CHOOSE_CARD_TO_PUT_ONTO_BENCH';
    this.cards=owner.deck;
    this.options={min,max};
    this.result=undefined;
  }
  validate(cards){
    return Array.isArray(cards)&&
      cards.length>=this.options.min&&
      cards.length<=this.options.max&&
      cards.every(c=>this.cards.cards.includes(c)&&
        c.stage===STAGE.BASIC&&c.superType===SUPER.POKEMON);
  }
}
class Store{
  constructor(state){this.state=state;this.silent=false;this.otherPrompt=false;}
  dispatch(action){
    if(action instanceof PlayCardAction){
      const owner=this.state.players.find(p=>p.id===action.id);
      const played=owner.hand.cards.splice(action.handIndex,1)[0];
      owner.discard.cards.push(played);
      this.state.prompts.push(new ChooseCardsPrompt(owner,8));
    }
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      assert.ok(prompt&&prompt.validate(action.result));
      if(!this.silent){
        const owner=this.state.players.find(p=>p.id===prompt.playerId);
        for(const card of action.result){
          owner.deck.cards.splice(owner.deck.cards.indexOf(card),1);
          owner.bench.find(slot=>slot.cards.length===0).cards.push(card);
        }
        prompt.result=action.result;
      }
    }
    return this.state;
  }
}
function player(id,hand=[{fullName:VIP}],deck=[
  BASIC('Trubbish'),BASIC('Zubat'),
  STAGE1('Garbodor','Trubbish')
]){
  return {
    id,hand:{cards:hand},deck:{cards:deck},
    discard:{cards:[]},active:{cards:[BASIC('Active')]},
    bench:Array.from({length:5},()=>({cards:[]}))
  };
}
function scenario(seat=0,hand,deck){
  const own=player(100+seat,hand,deck);
  const rival=player(999,[],[]);
  const state={turn:1,phase:2,activePlayer:seat,
    players:seat===0?[own,rival]:[rival,own],prompts:[]};
  return {own,state,store:new Store(state),bot:new Bot(own.id)};
}
const deps={
  SimpleTacticsAi:Bot,Store,ResolvePromptAction,
  Stage:STAGE,SuperType:SUPER,
  observe(state,seat){
    const owner=state.players[seat];
    assert.equal(state.prompts[0]?.playerId,owner.id);
    return {
      actorSeat:seat,decisionKind:'owner-prompt',
      pendingOwnerDeckSearch:true,
      ownHand:owner.hand.cards.map(c=>c.fullName),
      ownPublic:{
        active:{name:'Active'},
        bench:owner.bench.map(slot=>slot.cards.length?
          {name:slot.cards[0].name}:null),
        deckCount:owner.deck.cards.length
      }
    };
  }
};

test('both native physical owners continue the source-stamped Item and physically Bench two Basics',()=>{
  for(const seat of [0,1]){
    const {own,state,store,bot}=scenario(seat);
    const originalBot=Bot.prototype.decodeNextAction;
    const originalStore=Store.prototype.dispatch;
    const selected=withNativeSelectedVipOwnerSearch(()=>{
      store.dispatch(new AddPlayerAction());
      const vip=bot.decodeNextAction(state);
      assert.ok(vip instanceof PlayCardAction);
      store.dispatch(vip);
      const choice=bot.decodeNextAction(state);
      assert.ok(choice instanceof ResolvePromptAction);
      assert.equal(choice.result.length,2);
      store.dispatch(choice);
      return {bench:own.bench.filter(s=>s.cards.length).length,
        deck:own.deck.cards.length,discard:own.discard.cards.length};
    },deps);
    assert.deepEqual(selected.result,{bench:2,deck:1,discard:1});
    assert.equal(selected.audit.sourceStampedOwnerPrompts,1);
    assert.equal(selected.audit.nativeSettledOwnerPrompts,1);
    assert.equal(selected.audit.physicalDeckToBenchSettlements,1);
    assert.equal(selected.audit.bySeat[seat].settled,1);
    assert.equal(selected.audit.hiddenCardsPublished,false);
    assert.ok(!JSON.stringify(selected.audit).includes('Trubbish'));
    assert.strictEqual(Bot.prototype.decodeNextAction,originalBot);
    assert.strictEqual(Store.prototype.dispatch,originalStore);
  }
});

test('unrelated physically identical owner prompt is never hijacked',()=>{
  const sc=scenario(0,[{fullName:'Other Search FST'}]);
  const selected=withNativeSelectedVipOwnerSearch(()=>{
    sc.store.dispatch(new AddPlayerAction());
    sc.store.dispatch(new PlayCardAction(sc.own.id,0));
    const answer=sc.bot.decodeNextAction(sc.state);
    assert.ok(answer instanceof PassTurnAction);
    return answer;
  },deps);
  assert.ok(selected.result instanceof PassTurnAction);
  assert.equal(selected.audit.observedPrintedVipRoots,0);
  assert.equal(selected.audit.ownerSearchProposals,0);
});

test('native prompt geometry mismatch delegates to the original decoder',()=>{
  const sc=scenario();
  const result=withNativeSelectedVipOwnerSearch(()=>{
    sc.store.dispatch(new AddPlayerAction());
    sc.store.dispatch(sc.bot.decodeNextAction(sc.state));
    sc.state.prompts[0].options.min=1;
    assert.ok(sc.bot.decodeNextAction(sc.state) instanceof PassTurnAction);
  },deps);
  assert.equal(result.audit.observedPrintedVipRoots,1);
  assert.equal(result.audit.ownerSearchProposals,0);
});

test('genuine zero-Basic search settles without false physical Bench positive',()=>{
  const sc=scenario(0,[{fullName:VIP}],
    [STAGE1('Garbodor','Trubbish')]);
  const result=withNativeSelectedVipOwnerSearch(()=>{
    sc.store.dispatch(new AddPlayerAction());
    sc.store.dispatch(sc.bot.decodeNextAction(sc.state));
    const answer=sc.bot.decodeNextAction(sc.state);
    assert.ok(answer instanceof ResolvePromptAction);
    assert.deepEqual(answer.result,[]);
    sc.store.dispatch(answer);
  },deps);
  assert.equal(result.audit.acceptedEmptySelections,1);
  assert.equal(result.audit.physicalDeckToBenchSettlements,0);
  assert.equal(result.audit.nativeSettledOwnerPrompts,1);
});

test('silent Store return cannot be misreported as a native settled prompt',()=>{
  const sc=scenario();
  const botBefore=Bot.prototype.decodeNextAction;
  const storeBefore=Store.prototype.dispatch;
  assert.throws(()=>withNativeSelectedVipOwnerSearch(()=>{
    sc.store.dispatch(new AddPlayerAction());
    sc.store.dispatch(sc.bot.decodeNextAction(sc.state));
    sc.store.silent=true;
    sc.store.dispatch(sc.bot.decodeNextAction(sc.state));
  },deps),/without settling/);
  assert.strictEqual(Bot.prototype.decodeNextAction,botBefore);
  assert.strictEqual(Store.prototype.dispatch,storeBefore);
});
