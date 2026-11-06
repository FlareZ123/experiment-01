'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(OUTPUT,p));
const OLD='Wondrous Labyrinth Prism Star TEU';
const NEW='Thunder Mountain Prism Star LOT';

/**
 * A staged, real pinned Store whose only controlled intervention is a
 * different-name Stadium replacement. Uses real card instances. Not a game.
 * @param {0|1} seat
 * @param {'actor'|'opponent'} oldOwner
 * @returns {object}
 */
function fixture(seat,oldOwner){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format,CardTag}=native('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=6;
  state.activePlayer=seat;
  state.gameSettings.format=Format.EXPANDED;
  const actor=new Player(),opponent=new Player();
  actor.id=26001;opponent.id=26002;
  actor.name='Stadium actor';opponent.name='Stadium opponent';
  state.players=seat===0?[actor,opponent]:[opponent,actor];
  let nextId=260100;
  const card=printing=>{
    const value=manager.getCardByName(printing);
    assert.ok(value,'Missing pinned card '+printing);
    value.id=nextId++;
    return value;
  };
  actor.active.cards.push(card('Mew V FST'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  const replacement=card(NEW);
  actor.hand.cards.push(replacement);
  const old=card(OLD);
  assert.ok(old.tags.includes(CardTag.PRISM_STAR),
    'Wondrous Labyrinth must carry native Prism Star tag');
  const stadiumHolder=oldOwner==='actor'?actor:opponent;
  stadiumHolder.stadium.cards.push(old);
  actor.stadiumPlayedTurn=4;
  for(const player of state.players){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Dratini OBF'));
      player.prizes.push(prize);
    }
    for(let i=0;i<8;i++)
      player.deck.cards.push(card('Psychic Energy SVE'));
  }
  return {store,state,actor,opponent,old,replacement,stadiumHolder};
}

function stadiumAction(f){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  return new PlayCardAction(f.actor.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  });
}

for(const seat of [0,1]){
  for(const oldOwner of ['actor','opponent']){
    test('original paper Prism-to-Prism different-name replacement, actor seat '+
      seat+' old owner '+oldOwner,()=>{
      const f=fixture(seat,oldOwner);
      const {StateUtils}=native('game/store/state-utils');
      assert.strictEqual(StateUtils.getStadiumCard(f.state),f.old);
      assert.equal(f.actor.lostzone.cards.includes(f.old),false);
      f.store.dispatch(stadiumAction(f));
      assert.strictEqual(StateUtils.getStadiumCard(f.store.state),f.replacement);
      assert.equal(f.actor.stadium.cards.includes(f.replacement),true);
      assert.equal(f.actor.hand.cards.includes(f.replacement),false);
      assert.equal(f.stadiumHolder.stadium.cards.includes(f.old),false);
      assert.equal(f.stadiumHolder.lostzone.cards.includes(f.old),true);
      assert.equal(f.stadiumHolder.discard.cards.includes(f.old),false);
      assert.equal(f.actor.stadiumPlayedTurn,f.state.turn);
      console.log('AGENT26_PRISM_REPLACEMENT_STORE',JSON.stringify({
        seat,oldOwner,oldMovedToOwnerLostzone:true,
        newStadiumNativeAccepted:true,staged:true,competitiveGames:0
      }));
    });
  }
  test('same-name Prism cannot replace the displayed Stadium, seat '+seat,()=>{
    const f=fixture(seat,'actor');
    // Move replacement card away; hold a second physical copy of OLD.
    f.actor.hand.cards.length=0;
    const manager=initializeCards();
    const same=manager.getCardByName(OLD);
    same.id=260999;
    f.actor.hand.cards.push(same);
    assert.throws(()=>f.store.dispatch(stadiumAction(f)));
    assert.ok(f.actor.hand.cards.includes(same));
    assert.ok(f.actor.stadium.cards.includes(f.old));
    assert.equal(f.actor.stadiumPlayedTurn,4);
  });
  test('one-Stadium-per-turn quota forbids replacement, seat '+seat,()=>{
    const f=fixture(seat,'actor');
    f.actor.stadiumPlayedTurn=6;
    assert.throws(()=>f.store.dispatch(stadiumAction(f)));
    assert.ok(f.actor.hand.cards.includes(f.replacement));
    assert.ok(f.actor.stadium.cards.includes(f.old));
  });
}
