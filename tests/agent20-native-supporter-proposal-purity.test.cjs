'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {withPureNativeSupporterProposal}=
  require('../simulation/twinleaf/agent20-native-supporter-proposal-purity.cjs');

const GamePhase={PLAYER_TURN:2};
const TrainerType={SUPPORTER:'supporter',ITEM:'item'};

class TrainerCard {
  constructor(fullName,trainerType){
    this.fullName=fullName;this.trainerType=trainerType;
  }
}
class PlayCardAction {
  constructor(id,handIndex){
    this.id=id;this.handIndex=handIndex;
  }
}
class AddPlayerAction {
  constructor(player){this.player=player;}
}
class Store {
  constructor(){
    this.state={players:[],phase:GamePhase.PLAYER_TURN,activePlayer:0,
      turn:12,prompts:[]};
  }
  dispatch(action){
    if(action instanceof AddPlayerAction){
      this.state.players.push(action.player);
      return this.state;
    }
    if(action instanceof PlayCardAction){
      const player=this.state.players[0];
      assert.equal(player.supporterTurn,0,
        'Actual Store cannot play a card with already spent quota');
      player.supporterTurn++;
      player.supporter.cards.push(player.hand.cards[action.handIndex]);
      return this.state;
    }
    return this.state;
  }
}
class PlaySupporterTactic {
  useTactic(state,player){
    if(player.supporterTurn>0)return undefined;
    player.supporterTurn=state.turn;
    return new PlayCardAction(player.id,0);
  }
}
const deps={Store,PlaySupporterTactic,PlayCardAction,TrainerCard,
  TrainerType,GamePhase};
const player=()=>({
  id:101,supporterTurn:0,
  hand:{cards:[new TrainerCard('Guzma BUS',TrainerType.SUPPORTER)]},
  supporter:{cards:[]}
});

test('only genuine owner proposal is reset before Store validation',()=>{
  const original=PlaySupporterTactic.prototype.useTactic;
  const originalDispatch=Store.prototype.dispatch;
  const output=withPureNativeSupporterProposal(()=>{
    const store=new Store(),owner=player();
    store.dispatch(new AddPlayerAction(owner));
    const tactic=new PlaySupporterTactic();
    const action=tactic.useTactic(store.state,owner);
    assert.ok(action instanceof PlayCardAction);
    assert.equal(owner.supporterTurn,0);
    store.dispatch(action);
    assert.equal(owner.supporterTurn,1);
    assert.equal(owner.supporter.cards[0].fullName,'Guzma BUS');
    return 'native-store-accepted';
  },deps);
  assert.equal(output.result,'native-store-accepted');
  assert.equal(output.audit.exactOwnTurnSideEffectsReversed,1);
  assert.equal(output.audit.acceptedPreviouslyRestoredActions,1);
  assert.equal(output.audit.rejectedPreviouslyRestoredActions,0);
  assert.equal(PlaySupporterTactic.prototype.useTactic,original);
  assert.equal(Store.prototype.dispatch,originalDispatch);
});

test('no global rewrite of simulated state or already spent owner quota',()=>{
  const output=withPureNativeSupporterProposal(()=>{
    const store=new Store(),owner=player();
    store.dispatch(new AddPlayerAction(owner));
    const tactic=new PlaySupporterTactic();
    const copy={
      ...store.state,players:[player()],prompts:[]
    };
    tactic.useTactic(copy,copy.players[0]);
    assert.equal(copy.players[0].supporterTurn,12,
      'Non-live simulator clone is unmodified by the adapter');
    assert.equal(owner.supporterTurn,0);
    owner.supporterTurn=1;
    assert.equal(tactic.useTactic(store.state,owner),undefined);
    assert.equal(owner.supporterTurn,1);
    return true;
  },deps);
  assert.equal(output.result,true);
  assert.equal(output.audit.exactOwnTurnSideEffectsReversed,0);
});

test('failed user execution restores both prototype descriptors',()=>{
  const old=Object.getOwnPropertyDescriptor(
    PlaySupporterTactic.prototype,'useTactic');
  const oldDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.throws(()=>withPureNativeSupporterProposal(()=>{
    throw new Error('deliberate native Store abort');
  },deps),/deliberate native Store abort/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    PlaySupporterTactic.prototype,'useTactic'),old);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch'),oldDispatch);
});
