'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withSoleShuffleDeckZeroCorrection,VERSION}=
  require('../simulation/twinleaf/agent2-sole-shuffle-deckzero-hook.cjs');

function cardClass(){
  return class {
    canPlay(){return false;}
    reduceEffect(){return 'unpatched';}
    shuffleCards(cards){cards.reverse();}
  };
}
class TrainerEffect {
  constructor(player,trainerCard){
    this.player=player;this.trainerCard=trainerCard;
  }
}
function fixture(Card,seat=0,ownerExtra=0,ownerDeck=0,oppHand=1){
  const card=new Card();
  const other=n=>Array.from({length:n},(_,i)=>({fullName:'Other '+i}));
  const owner={id:101+seat,supporterTurn:0,getPrizeLeft:()=>3,
    hand:{cards:[card,...other(ownerExtra)]},deck:{cards:other(ownerDeck)}};
  const opponent={id:202-seat,supporterTurn:0,getPrizeLeft:()=>2,
    hand:{cards:other(oppHand)},deck:{cards:[]}};
  const state={players:seat===0?[owner,opponent]:[opponent,owner]};
  return {card,owner,opponent,state};
}
function dependencies(Iono,Marnie,moves,draws,preventMove=false){
  return {Iono,Marnie,TrainerEffect,
    getOpponent:(state,owner)=>state.players.find(p=>p.id!==owner.id),
    drawCards:(store,state,owner,count)=>{
      draws.push({ownerId:owner.id,count});return state;
    },
    moveHandToDeckThenDraw:(store,state,opponent,options)=>{
      moves.push({opponentId:opponent.id,count:options.drawCount,
        movedCards:options.cards.length,sourceCard:options.sourceCard});
      if(!preventMove)options.afterDraw();
      return state;
    }};
}
test('narrow owner deck0 edge enables both print families and physical seats',()=>{
  assert.match(VERSION,/default-off/);
  const Iono=cardClass(),Marnie=cardClass();
  const originalIono=Iono.prototype.canPlay;
  const originalMarnie=Marnie.prototype.reduceEffect;
  const moves=[],draws=[];
  const result=withSoleShuffleDeckZeroCorrection(()=>{
    for(const [Card,isIono] of [[Iono,true],[Marnie,false]]){
      for(const seat of [0,1]){
        const x=fixture(Card,seat);
        assert.equal(x.card.canPlay(null,x.state,x.owner),true);
        const native=x.card.reduceEffect(null,x.state,
          new TrainerEffect(x.owner,x.card));
        assert.strictEqual(native,x.state);
        assert.equal(moves.at(-1).sourceCard,x.card);
        assert.equal(moves.at(-1).count,isIono?2:4);
        assert.equal(draws.at(-1).count,isIono?3:5);
        assert.equal(moves.at(-1).movedCards,1);
      }
    }
    return 42;
  },dependencies(Iono,Marnie,moves,draws));
  assert.equal(result,42);
  assert.equal(moves.length,4);
  assert.equal(draws.length,4);
  assert.strictEqual(Iono.prototype.canPlay,originalIono);
  assert.strictEqual(Marnie.prototype.reduceEffect,originalMarnie);
});
test('exact owner-only gate does not alter other hands and restores on throw',()=>{
  const Iono=cardClass(),Marnie=cardClass();
  const original=Iono.prototype.canPlay;
  const deps=dependencies(Iono,Marnie,[],[]);
  assert.throws(()=>withSoleShuffleDeckZeroCorrection(()=>{
    const noOpponent=fixture(Iono,0,0,0,0);
    assert.equal(noOpponent.card.canPlay(null,noOpponent.state,
      noOpponent.owner),false);
    const hasOwnDeck=fixture(Iono,0,0,1,1);
    assert.equal(hasOwnDeck.card.canPlay(null,hasOwnDeck.state,
      hasOwnDeck.owner),false);
    assert.equal(hasOwnDeck.card.reduceEffect(null,hasOwnDeck.state,
      new TrainerEffect(hasOwnDeck.owner,hasOwnDeck.card)),'unpatched');
    const extraHand=fixture(Iono,1,1,0,1);
    assert.equal(extraHand.card.canPlay(null,extraHand.state,
      extraHand.owner),false);
    throw Error('intentional');
  },deps),/intentional/);
  assert.strictEqual(Iono.prototype.canPlay,original);
});
test('prevented opponent movement cannot activate conditional draw',()=>{
  const Iono=cardClass(),Marnie=cardClass();
  const moves=[],draws=[];
  withSoleShuffleDeckZeroCorrection(()=>{
    const x=fixture(Iono);
    x.card.reduceEffect(null,x.state,new TrainerEffect(x.owner,x.card));
  },dependencies(Iono,Marnie,moves,draws,true));
  assert.equal(moves.length,1);
  assert.deepEqual(draws,[]);
});
