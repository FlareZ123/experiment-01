'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {registerPlayersCeremony}=
  require('../simulation/twinleaf/card-patches.cjs');

const BASE=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(BASE,name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {Card}=native('game/store/card/card');
const {CardList}=native('game/store/state/card-list');
const {GamePhase}=native('game/store/state/state');
const {UseStadiumEffect}=native('game/store/effects/game-effects');

/**
 * Stage a complete, nonterminal native Store with the research-owned Japanese
 * S-P 127 Stadium card. Both players have valid Active Pokémon, prizes, and
 * available decks, preventing unrelated empty-field end-game conclusions.
 * @param {0|1} seat
 * @returns {object}
 */
function stage(seat){
  const manager=initializeCards(),patchedId=registerPlayersCeremony();
  const getCard=id=>{
    const card=manager.getCardByName(id);
    assert.ok(card,'Cannot stage actual pinned source card '+id);
    return card;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const players=[new Player(),new Player()];
  players[0].id=101;players[1].id=202;
  players[0].name='Seat 0';players[1].name='Seat 1';
  for(const player of players){
    player.active.cards.push(getCard('Dratini OBF'));
    player.deck.cards.push(...Array.from({length:6},()=>new Card()));
    player.prizes=Array.from({length:6},()=>{
      const slot=new CardList();
      slot.cards.push(new Card());
      return slot;
    });
  }
  const owner=players[seat],opponent=players[1-seat];
  const ceremony=getCard(patchedId);
  assert.equal(ceremony.set,'SP');
  assert.equal(String(ceremony.setNumber),'127');
  owner.stadium.cards.push(ceremony);
  state.players=players;
  state.activePlayer=seat;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=5;
  store.state=state;
  return {seat,store,state,owner,opponent,ceremony};
}

for(const seat of [0,1]){
  test('native Store Player Ceremony SP127 real end-turn effect in seat '+seat,()=>{
    const x=stage(seat);
    const effect=new UseStadiumEffect(x.owner,x.ceremony);
    const originalOpponentHand=x.opponent.hand.cards.length;
    assert.equal(x.owner.deck.cards.length,6);
    assert.equal(x.owner.hand.cards.length,0);
    assert.equal(x.owner.stadiumUsedTurn,0);
    x.store.reduceEffect(x.state,effect);
    assert.equal(effect.preventDefault,true);
    assert.equal(x.owner.hand.cards.length,2,
      'Native Store draws exactly the two printed cards');
    assert.equal(x.owner.deck.cards.length,4,
      'Native Store consumed exactly two deck cards');
    assert.equal(x.owner.stadiumUsedTurn,5,
      'Native turn-use field must be updated to this turn');
    assert.equal(x.opponent.hand.cards.length,originalOpponentHand,
      'Opponent hand must remain untouched by a self-use Stadium');
    assert.equal(x.owner.stadium.cards.includes(x.ceremony),true,
      'Using a Stadium should not discard it');
    assert.ok(x.state.activePlayer===1-seat||
      x.state.phase!==GamePhase.PLAYER_TURN,
      'EndTurnEffect must end owner\'s active player-turn state');
  });
}

test('native Store declines an absent Player Ceremony rather than ending turn',()=>{
  const x=stage(0);
  x.owner.stadium.cards.length=0;
  const effect=new UseStadiumEffect(x.owner,x.ceremony);
  x.store.reduceEffect(x.state,effect);
  assert.equal(effect.preventDefault,false);
  assert.equal(x.owner.hand.cards.length,0);
  assert.equal(x.owner.stadiumUsedTurn,0);
  assert.equal(x.state.activePlayer,0);
  assert.equal(x.state.phase,GamePhase.PLAYER_TURN);
});
