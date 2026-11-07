'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOriginalRank9DeadVipUltraBall}=require(
  '../simulation/twinleaf/agent29-rank9-owner-ultra-ball-dead-vip.cjs');

class AddPlayerAction{}
class PassTurnAction{constructor(id){this.id=id;}}
class PlayCardAction{
  constructor(id,handIndex,target){Object.assign(this,{id,handIndex,target});}
}
class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
class ChooseCardsPrompt{
  constructor(id,playerId,message,cards,max){Object.assign(this,{
    id,playerId,message,cards,max,result:undefined});}
  validate(cards){
    return Array.isArray(cards)&&cards.length===this.max&&
      cards.every(c=>this.cards.cards.includes(c));
  }
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return new PassTurnAction(this.client.id);}
}
class Store{
  constructor(state){this.state=state;}
  dispatch(action){
    const source=this.state.players[this.state.activePlayer];
    if(action instanceof PlayCardAction){
      const card=source.hand.cards.splice(action.handIndex,1)[0];
      assert.equal(card.fullName,'Ultra Ball MEG');
      source.discard.cards.push(card);
      const opts={cards:source.hand.cards.slice()};
      this.state.prompts=[new ChooseCardsPrompt(50,source.id,
        'CHOOSE_CARD_TO_DISCARD',opts,2)];
    }else if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      assert.ok(prompt?.validate(action.result));
      if(prompt.message==='CHOOSE_CARD_TO_DISCARD'){
        for(const card of action.result){
          const index=source.hand.cards.indexOf(card);
          assert.ok(index>=0);
          source.hand.cards.splice(index,1);
          source.discard.cards.push(card);
        }
        this.state.prompts=[new ChooseCardsPrompt(51,source.id,
          'CHOOSE_CARD_TO_HAND',source.deck,1)];
      }else{
        for(const card of action.result){
          const index=source.deck.cards.indexOf(card);
          assert.ok(index>=0);
          source.deck.cards.splice(index,1);
          source.hand.cards.push(card);
        }
        this.state.prompts=[];
      }
    }
    return this.state;
  }
}
const printing=fullName=>({fullName});
const slot=fullName=>({getPokemonCard(){return printing(fullName);}});
function fixture(seat){
  const source={id:90,hand:{cards:[
    printing('Ultra Ball MEG'),printing('Battle VIP Pass FST'),
    printing('Battle VIP Pass FST')]},
    deck:{cards:[printing('Electrode-GX CES')]},
    discard:{cards:[]},
    active:slot('Gengar & Mimikyu-GX TEU'),
    bench:[slot('Voltorb ROS'),slot('Mega Absol ex M1L')]};
  return {source,store:new Store({
    activePlayer:seat,phase:'PLAYER_TURN',turn:26,
    prompts:[],players:seat===0?[source,{id:91}]:[{id:91},source]})};
}

test('both owner seats make a real Ultra Ball, pay two expired VIP and retrieve physical Electrode',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat),bot=new SimpleTacticsAi(f.source.id);
    const original=Store.prototype.dispatch;
    const result=withOriginalRank9DeadVipUltraBall(()=>{
      f.store.dispatch(new AddPlayerAction());
      const ultra=bot.decodeNextAction(f.store.state);
      assert.ok(ultra instanceof PlayCardAction);
      f.store.dispatch(ultra);
      const discard=bot.decodeNextAction(f.store.state);
      assert.ok(discard instanceof ResolvePromptAction);
      assert.equal(discard.result.length,2);
      f.store.dispatch(discard);
      const search=bot.decodeNextAction(f.store.state);
      assert.ok(search instanceof ResolvePromptAction);
      assert.equal(search.result.length,1);
      assert.equal(search.result[0].fullName,'Electrode-GX CES');
      f.store.dispatch(search);
      assert.ok(f.source.hand.cards.some(c=>c.fullName==='Electrode-GX CES'));
      assert.equal(f.source.discard.cards.filter(c=>
        c.fullName==='Battle VIP Pass FST').length,2);
      return true;
    },seat,{Store,SimpleTacticsAi,
      GamePhase:{PLAYER_TURN:'PLAYER_TURN'},
      playActions:{PlayCardAction,PlayerType:{ANY:0},SlotType:{BOARD:0}},
      ResolvePromptAction});
    assert.equal(result.result,true);
    assert.equal(result.audit.nativeAcceptedItems,1);
    assert.equal(result.audit.physicalDeadVipDiscarded,2);
    assert.equal(result.audit.electrodeInHandConfirmed,1);
    assert.equal(Store.prototype.dispatch,original);
  }
});

test('no source action if only one dead VIP payment card and restoration on thrown native error',()=>{
  const f=fixture(1),bot=new SimpleTacticsAi(f.source.id);
  f.source.hand.cards.splice(-1,1);
  const original=Store.prototype.dispatch;
  assert.throws(()=>withOriginalRank9DeadVipUltraBall(()=>{
    f.store.dispatch(new AddPlayerAction());
    assert.ok(bot.decodeNextAction(f.store.state) instanceof PassTurnAction);
    throw Error('native interrupt');
  },1,{Store,SimpleTacticsAi,GamePhase:{PLAYER_TURN:'PLAYER_TURN'},
    playActions:{PlayCardAction,PlayerType:{ANY:0},SlotType:{BOARD:0}},
    ResolvePromptAction}),/native interrupt/);
  assert.equal(Store.prototype.dispatch,original);
});
