'use strict';
const path = require('node:path');
const assert = require('node:assert/strict');
const {initializeCards}=require('./headless.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const get=part=>require(path.join(root,part));
function probe() {
  const cards=initializeCards();
  const {Store}=get('game/store/store');
  const {Player}=get('game/store/state/player');
  const {CardList}=get('game/store/state/card-list');
  const {GamePhase}=get('game/store/state/state');
  const {Format}=get('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=get('game/store/actions/play-card-action');
  const card=name=>{
    const found=cards.getCardByName(name);
    assert.ok(found,'Missing compiled printing '+name);
    return found;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const a=new Player(),b=new Player();
  a.id=101;a.name='Compressor';b.id=202;b.name='Other';
  state.players=[a,b];state.activePlayer=0;
  state.turn=3;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  for(const player of [a,b]){
    player.active.cards.push(card('Dratini OBF'));
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      return prize;
    });
    player.deck.cards.push(card('Psychic Energy MEE'));
  }
  a.deck.cards.push(card('Grass Energy MEE'));
  a.hand.cards.push(card('Battle Compressor PHF'));
  store.dispatch(new PlayCardAction(a.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const prompt=state.prompts.find(p=>p.constructor.name==='ChooseCardsPrompt');
  assert.ok(prompt,'Missing actual Battle Compressor selection prompt');
  return {
    min:prompt.options.min,max:prompt.options.max,
    acceptsZero:prompt.validate([]),
    acceptsOne:prompt.validate([a.deck.cards[0]]),
    inPlay:a.supporter.cards.some(c=>c.name==='Battle Compressor'),
    deckSize:a.deck.cards.length
  };
}
if(require.main===module)console.log(JSON.stringify(probe(),null,2));
module.exports={probe};
