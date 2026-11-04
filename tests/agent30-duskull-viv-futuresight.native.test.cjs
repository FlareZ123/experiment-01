'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(output,name));

/**
 * Stage a real pinned native Store and two physical decks. Start exactly the
 * printed Duskull VIV Future Sight effect, without claiming attack payment.
 * @param {number} actorSeat
 * @param {number} cardsInDeck
 */
function fixture(actorSeat,cardsInDeck){
  const manager=initializeCards();
  /** @param {string} name */
  const card=name=>{
    const result=manager.getCardByName(name);
    assert.ok(result,'Missing pinned printing '+name);
    return result;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {State,GamePhase}=load('game/store/state/state');
  const {CardList}=load('game/store/state/card-list');
  const {AttackEffect}=load('game/store/effects/game-effects');

  const players=[0,1].map(seat=>{
    const player=new Player();
    player.id=100+seat;
    player.name='Physical seat '+seat;
    player.active.cards.push(card(seat===actorSeat?'Duskull VIV':'Dratini OBF'));
    for(let k=0;k<6;k++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
    const names=['Psychic Energy SVE','Darkness Energy MEE',
      'Dratini OBF','Duskull VIV','Psychic Energy SVE',
      'Darkness Energy MEE'];
    player.deck.cards.push(...names.slice(0,cardsInDeck).map(card));
    return player;
  });
  const state=new State();
  state.players=players;
  state.activePlayer=actorSeat;
  state.turn=3;
  state.phase=GamePhase.ATTACK;
  const store=new Store({onStateChange(){}});
  store.state=state;
  const owner=players[actorSeat];
  const other=players[1-actorSeat];
  const originalDecks=players.map(p=>p.deck.cards.slice());
  const source=owner.active.cards[0];
  assert.equal(source.fullName,'Duskull VIV');
  const effect=new AttackEffect(owner,other,source.attacks[0]);
  store.reduceEffect(state,effect);
  return {store,state,owner,other,players,originalDecks,source};
}

/**
 * Resolve the genuine first option and subsequent exact OrderCardsPrompt.
 * The native UI legally reveals the selected top 4; other hidden zones stay
 * untouched by the staged test.
 * @param {object} f
 * @param {number} selectedDeck 0=opponent, 1=own (native source option).
 */
function resolve(f,selectedDeck){
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {GameMessage}=load('game/game-message');
  const {SelectPrompt}=load('game/store/prompts/select-prompt');
  const {OrderCardsPrompt}=load('game/store/prompts/order-cards-prompt');
  const pending=()=>f.state.prompts.find(p=>p.result===undefined);
  const option=pending();
  assert.ok(option instanceof SelectPrompt);
  assert.equal(option.playerId,f.owner.id);
  assert.equal(option.message,GameMessage.CHOOSE_OPTION);
  assert.equal(option.options.allowCancel,false);
  assert.deepEqual(option.values,[GameMessage.ORDER_OPPONENT_DECK,
    GameMessage.ORDER_YOUR_DECK]);
  f.store.dispatch(new ResolvePromptAction(option.id,selectedDeck));
  const order=pending();
  assert.ok(order instanceof OrderCardsPrompt);
  assert.equal(order.playerId,f.owner.id);
  assert.equal(order.message,GameMessage.CHOOSE_CARDS_ORDER);
  assert.equal(order.options.allowCancel,false);
  const target=selectedDeck===0?f.other:f.owner;
  const original=f.originalDecks[f.players.indexOf(target)];
  const n=Math.min(4,original.length);
  assert.deepEqual(order.cards.cards,original.slice(0,n));
  assert.equal(order.validate(null),false);
  assert.equal(order.validate(Array(n).fill(0)),n<=1);
  const reversed=Array.from({length:n},(_,i)=>n-1-i);
  assert.equal(order.validate(reversed),true);
  f.store.dispatch(new ResolvePromptAction(order.id,reversed));
  assert.deepEqual(target.deck.cards,
    [...original.slice(0,n).reverse(),...original.slice(n)],
    'Native Store must return identical physical cards in chosen order');
  const otherTarget=selectedDeck===0?f.owner:f.other;
  const otherOriginal=f.originalDecks[f.players.indexOf(otherTarget)];
  assert.deepEqual(otherTarget.deck.cards,otherOriginal,
    'Ordering one deck must leave the other physical deck unchanged');
  assert.equal(option.result,selectedDeck);
  assert.deepEqual(order.result,reversed);
  return {n,selectedDeck,actorSeat:f.players.indexOf(f.owner)};
}

for(const actorSeat of [0,1]){
  for(const selectedDeck of [0,1]){
    for(const cardsInDeck of [2,4,6]){
      test('pinned Future Sight seat '+actorSeat+
        ', deck option '+selectedDeck+', physical deck '+cardsInDeck,()=>{
        const f=fixture(actorSeat,cardsInDeck);
        assert.deepEqual(resolve(f,selectedDeck),{
          n:Math.min(cardsInDeck,4),selectedDeck,actorSeat});
      });
    }
  }
}

test('Future Sight printed owner reveal scope is only selected four-card pool',()=>{
  const f=fixture(0,6);
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const select=f.state.prompts.find(p=>p.result===undefined);
  f.store.dispatch(new ResolvePromptAction(select.id,0));
  const order=f.state.prompts.find(p=>p.result===undefined);
  assert.equal(order.cards.cards.length,4);
  assert.notEqual(order.cards,f.other.deck);
  assert.equal(f.other.deck.cards.length,2);
  assert.deepEqual(order.cards.cards,f.originalDecks[1].slice(0,4));
  assert.deepEqual(f.other.deck.cards,f.originalDecks[1].slice(4));
  assert.notEqual(order.cards,f.owner.hand);
  assert.notEqual(order.cards,f.other.hand);
  assert.notEqual(order.cards,f.owner.prizes);
  assert.notEqual(order.cards,f.other.prizes);
});
