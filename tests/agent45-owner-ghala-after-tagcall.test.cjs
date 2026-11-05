'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  TAG,HALA,selectTwoDiscardables,selectAuthorizedHalaSearch,
  withNativeHalaAfterActualTagCall
}=require('../simulation/twinleaf/agent45-owner-ghala-after-tagcall.cjs');

const THUNDER='Thunder Mountain Prism Star LOT';
const DCE='Double Colorless Energy SUM';
const FAN='Handheld Fan TWM';
const MAIL="Trainers' Mail ROS";
const card=fullName=>({fullName});
const signed=[TAG,HALA,THUNDER,DCE,FAN,MAIL];
const own60=Array.from({length:60},(_,i)=>signed[i%signed.length]);
class AddPlayerAction{}
class PlayCardAction{constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}}
class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
class ChooseCardsPrompt{
  constructor(id,playerId,message,cards,max=3,min=0){
    Object.assign(this,{id,playerId,message,cards,
      options:{min,max},result:undefined});
  }
  validate(selected){
    return Array.isArray(selected)&&
      selected.length>=this.options.min&&
      selected.length<=this.options.max&&
      new Set(selected).size===selected.length&&
      selected.every(card=>this.cards.cards.includes(card));
  }
}
class SelectOptionPrompt{
  constructor(id,playerId){
    Object.assign(this,{id,playerId,result:undefined});
  }
  validate(option){return option===0||option===1;}
}
class Ai{
  constructor(id){this.client={id};}
  decodeNextAction(){return 'original-native-decoder';}
}
class Store{
  constructor(state){
    this.state=state;
    this.nextPrompt=1;
    this.skipGHMode=false;
  }
  add(owner,message,cards,max=3,min=0){
    const p=new ChooseCardsPrompt(this.nextPrompt++,owner.id,message,
      cards,max,min);
    this.state.prompts.push(p);
    return p;
  }
  dispatch(action){
    const owner=this.state.players.find(x=>x.id===action.id);
    if(action instanceof PlayCardAction){
      const printed=owner.hand.cards.splice(action.handIndex,1)[0];
      assert.ok(printed);
      owner.discard.cards.push(printed);
      if(printed.fullName===TAG)this.add(owner,'CHOOSE_CARD_TO_HAND',owner.deck,2);
      if(printed.fullName===HALA&&!this.skipGHMode)
        this.state.prompts.push(new SelectOptionPrompt(
          this.nextPrompt++,owner.id));
    }else if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      assert.ok(prompt&&prompt.validate(action.result));
      prompt.result=action.result;
      const owner=this.state.players.find(x=>x.id===prompt.playerId);
      if(prompt instanceof SelectOptionPrompt){
        if(action.result===1){
          this.add(owner,'CHOOSE_CARD_TO_DISCARD',owner.hand,2,2);
        }else this.add(owner,'CHOOSE_CARD_TO_HAND',owner.deck,1);
      }else if(prompt.message==='CHOOSE_CARD_TO_DISCARD'){
        for(const selected of action.result){
          owner.hand.cards.splice(owner.hand.cards.indexOf(selected),1);
          owner.discard.cards.push(selected);
        }
        this.add(owner,'CHOOSE_CARD_TO_HAND',owner.deck,3);
      }else if(prompt.message==='CHOOSE_CARD_TO_HAND'){
        for(const selected of action.result){
          owner.deck.cards.splice(owner.deck.cards.indexOf(selected),1);
          owner.hand.cards.push(selected);
        }
      }
    }
    return this.state;
  }
}
const deps={SimpleTacticsAi:Ai,Store,
  GamePhase:{PLAYER_TURN:2},
  playActions:{PlayCardAction,PlayerType:{ANY:1},SlotType:{BOARD:2}},
  ResolvePromptAction};
function game(seat=0,extra=[card(TAG),card(MAIL),card('Other Item TEST')]){
  const actor={
    id:10+seat,hand:{cards:[card(TAG),...extra]},
    deck:{cards:[card(HALA),card(THUNDER),card(DCE),card(FAN)]},
    discard:{cards:[]},lostzone:{cards:[]},supporterTurn:0
  };
  const other={
    id:99,hand:{cards:[]},deck:{cards:[]},
    discard:{cards:[]},lostzone:{cards:[]},supporterTurn:0
  };
  const state={turn:2,phase:2,activePlayer:seat,prompts:[],
    players:seat===0?[actor,other]:[other,actor]};
  return {actor,store:new Store(state),bot:new Ai(actor.id),state};
}
function nativeTagChain(sc){
  sc.store.dispatch(new AddPlayerAction());
  sc.store.dispatch(new PlayCardAction(sc.actor.id,0));
  const search=sc.state.prompts.find(p=>p.result===undefined);
  assert.ok(search);
  const gh=sc.actor.deck.cards.find(c=>c.fullName===HALA);
  sc.store.dispatch(new ResolvePromptAction(search.id,[gh]));
}
test('pure owner discard-capable heuristic protects unique and restricted resources',()=>{
  const hand=[card(THUNDER),card(DCE),card(TAG),card(MAIL)];
  assert.deepEqual(selectTwoDiscardables(hand,own60,2)
    .map(c=>c.fullName),[TAG,MAIL]);
  assert.equal(selectTwoDiscardables([card(THUNDER)],own60,2).length,0);
});
test('owner K1 G&H selection derives from actual current prompt cards',()=>{
  const deck={cards:[card(THUNDER),card(DCE),card(FAN)]};
  const prompt=new ChooseCardsPrompt(1,10,'CHOOSE_CARD_TO_HAND',deck);
  assert.deepEqual(selectAuthorizedHalaSearch(prompt,{},1)
    .map(c=>c.fullName),[THUNDER,DCE,FAN]);
  assert.deepEqual(selectAuthorizedHalaSearch(prompt,{},0)
    .map(c=>c.fullName),[THUNDER]);
});
test('genuine held TagCall to G&H to native paid three-category search, both physical seats',()=>{
  for(const seat of [0,1]){
    const sc=game(seat);
    const botBefore=Ai.prototype.decodeNextAction;
    const storeBefore=Store.prototype.dispatch;
    const observed=withNativeHalaAfterActualTagCall([own60,own60],()=>{
      nativeTagChain(sc);
      const root=sc.bot.decodeNextAction(sc.state);
      assert.ok(root instanceof PlayCardAction);
      assert.equal(sc.actor.hand.cards[root.handIndex].fullName,HALA);
      sc.store.dispatch(root);
      const mode=sc.bot.decodeNextAction(sc.state);
      assert.ok(mode instanceof ResolvePromptAction);
      assert.equal(mode.result,1);
      sc.store.dispatch(mode);
      const payment=sc.bot.decodeNextAction(sc.state);
      assert.ok(payment instanceof ResolvePromptAction);
      assert.deepEqual(payment.result.map(c=>c.fullName),[TAG,MAIL]);
      sc.store.dispatch(payment);
      const search=sc.bot.decodeNextAction(sc.state);
      assert.ok(search instanceof ResolvePromptAction);
      assert.deepEqual(search.result.map(c=>c.fullName),[THUNDER,DCE,FAN]);
      sc.store.dispatch(search);
      return {seat,hand:sc.actor.hand.cards.map(c=>c.fullName),
        discard:sc.actor.discard.cards.map(c=>c.fullName)};
    },deps);
    assert.equal(observed.audit.printedTagCallRootsAccepted,1);
    assert.equal(observed.audit.tagCallGuzmaHalaSearchAccepted,1);
    assert.equal(observed.audit.actualGHPhysicalHandGains,1);
    assert.equal(observed.audit.nativeGHSupporterRootsAccepted,1);
    assert.equal(observed.audit.modeChoiceAccepted.paid,1);
    assert.equal(observed.audit.physicalTwoCardPayments,1);
    assert.equal(observed.audit.physicalRetrievedCards,3);
    assert.deepEqual(observed.result.hand,[THUNDER,DCE,FAN,'Other Item TEST']);
    assert.ok(observed.result.discard.includes(HALA));
    assert.strictEqual(Ai.prototype.decodeNextAction,botBefore);
    assert.strictEqual(Store.prototype.dispatch,storeBefore);
  }
});
test('lack of two disposable cards chooses native free Stadium route',()=>{
  const sc=game(0,[card(THUNDER)]);
  const r=withNativeHalaAfterActualTagCall([own60,own60],()=>{
    nativeTagChain(sc);
    sc.store.dispatch(sc.bot.decodeNextAction(sc.state));
    const mode=sc.bot.decodeNextAction(sc.state);
    assert.equal(mode.result,0);
    sc.store.dispatch(mode);
    const search=sc.bot.decodeNextAction(sc.state);
    assert.deepEqual(search.result.map(c=>c.fullName),[THUNDER]);
    sc.store.dispatch(search);
  },deps);
  assert.equal(r.audit.modeChoiceAccepted.free,1);
  assert.equal(r.audit.modeChoiceAccepted.paid,0);
  assert.equal(r.audit.physicalTwoCardPayments,0);
  assert.equal(r.audit.physicalRetrievedCards,1);
});
test('unrelated matched-shape own-deck search does not authorize G&H root',()=>{
  const sc=game(0);
  const r=withNativeHalaAfterActualTagCall([own60,own60],()=>{
    sc.store.dispatch(new AddPlayerAction());
    sc.store.add(sc.actor,'CHOOSE_CARD_TO_HAND',sc.actor.deck,2);
    assert.equal(sc.bot.decodeNextAction(sc.state),'original-native-decoder');
  },deps);
  assert.equal(r.audit.printedTagCallRootsAccepted,0);
  assert.equal(r.audit.proposedGHSupporterRoots,0);
});
test('silent native G&H mode absence is not misreported as accepted Supporter',()=>{
  const sc=game(0);
  sc.store.skipGHMode=true;
  const r=withNativeHalaAfterActualTagCall([own60,own60],()=>{
    nativeTagChain(sc);
    sc.store.dispatch(sc.bot.decodeNextAction(sc.state));
    assert.equal(sc.bot.decodeNextAction(sc.state),'original-native-decoder');
  },deps);
  assert.equal(r.audit.proposedGHSupporterRoots,1);
  assert.equal(r.audit.nativeGHSupporterRootsAccepted,0);
  assert.equal(r.audit.ownerDeckSearchAccepted,0);
});
