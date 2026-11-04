'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=relative=>require(path.join(OUTPUT,relative));
const OLD='Path to the Peak CRE';
const NEW='Sky Field ROS';

/**
 * Genuine pinned Store fixture for the exact same Stadium replacement under
 * both physical seating arrangements. Staged game state, not an Aichi game.
 * @param {0|1} seat
 * @param {'actor'|'opponent'} originalOwner
 */
function fixture(seat,originalOwner){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=6;
  state.activePlayer=seat;
  state.gameSettings.format=Format.EXPANDED;
  const actor=new Player(),opponent=new Player();
  actor.id=371;opponent.id=372;
  actor.name='Stadium replacement actor';
  opponent.name='Stadium replacement opponent';
  state.players=seat===0?[actor,opponent]:[opponent,actor];
  let nextId=370001;
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Missing pinned card '+printing);
    c.id=nextId++;
    return c;
  };
  actor.active.cards.push(card('Mew V FST'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  actor.hand.cards.push(card(NEW));
  (originalOwner==='actor'?actor:opponent).stadium.cards.push(card(OLD));
  actor.stadiumPlayedTurn=4;
  // A staged zero-Prize state triggers native Sudden Death and clears zones.
  // Supply authentic six nonempty Prize slots and decks for both players.
  for(const player of state.players){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Dratini OBF'));
      player.prizes.push(prize);
    }
    for(let i=0;i<8;i++)
      player.deck.cards.push(card('Psychic Energy SVE'));
  }
  return {store,state,actor,opponent};
}

/** @param {object} f */
function sample(f){
  const {ActionEnumerator}=native('advanced-bot/action-enumerator');
  const {PlayCardAction}=native('game/store/actions/play-card-action');
  const {StateUtils}=native('game/store/state-utils');
  const {PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  assert.equal(StateUtils.getStadiumCard(f.state)?.fullName,OLD);
  const offered=new ActionEnumerator().enumerate(
    f.state,f.actor,f.actor.id)
    .filter(a=>a instanceof PlayCardAction&&a.handIndex===0);
  const before={offers:offered.length,physicalHeld:f.actor.hand.cards[0].fullName,
    oldStadiumOwner:f.actor.stadium.cards.length?'actor':'opponent'};
  const action=new PlayCardAction(f.actor.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  });
  const nativeReturn=f.store.dispatch(action);
  const after=StateUtils.getStadiumCard(f.store.state);
  console.log('AGENT37_STADIUM_DEBUG',JSON.stringify({
    originalSeat:f.state.activePlayer,phase:f.store.state.phase,
    turn:f.store.state.turn,actorHand:f.actor.hand.cards.map(c=>c.fullName),
    actorStadium:f.actor.stadium.cards.map(c=>c.fullName),
    opponentStadium:f.opponent.stadium.cards.map(c=>c.fullName),
    actorDiscard:f.actor.discard.cards.map(c=>c.fullName),
    opponentDiscard:f.opponent.discard.cards.map(c=>c.fullName),
    after:after?.fullName??null,
    nativeReturnPhase:nativeReturn?.phase??null,
    promptTypes:f.store.state.prompts.map(p=>p.constructor.name)
  }));
  assert.equal(after?.fullName,NEW);
  assert.equal(f.actor.hand.cards.some(c=>c.fullName===NEW),false);
  return {before,acceptedReplacement:true,newStadium:after.fullName,
    oldDiscarded:f.actor.discard.cards.some(c=>c.fullName===OLD)||
      f.opponent.discard.cards.some(c=>c.fullName===OLD)};
}

for(const seat of [0,1]){
  test('pinned enumerator omits valid own-Stadium replacement; Store accepts, seat '+seat,()=>{
    const got=sample(fixture(seat,'actor'));
    assert.equal(got.before.offers,0,
      'Pinned enumerator behavior changed; re-evaluate prior omission');
    assert.equal(got.oldDiscarded,true);
    console.log('AGENT37_OWN_STADIUM_ENUMERATOR_VETO',JSON.stringify({
      pinnedTwinleaf:PIN,seat,...got,staged:true,qualifiedGames:0
    }));
  });
  test('opponent-owned Stadium replacement remains enumerated, seat '+seat,()=>{
    const got=sample(fixture(seat,'opponent'));
    assert.ok(got.before.offers>0);
    assert.equal(got.oldDiscarded,true);
    console.log('AGENT37_OPPONENT_STADIUM_ENUMERATOR_CONTROL',JSON.stringify({
      pinnedTwinleaf:PIN,seat,...got,staged:true,qualifiedGames:0
    }));
  });
}
