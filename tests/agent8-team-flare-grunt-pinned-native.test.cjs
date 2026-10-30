'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(base,name));

/**
 * Two-seat direct native Store fixture with the original rank-6 XY printing,
 * an opponent's public Active Energy and an unspent Supporter quota. This
 * tests one genuine printed card in isolation. It is not a game outcome.
 * @param {0|1} seat Real active seat.
 * @returns {object}
 */
function root(seat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  let id=85000;
  const card=printing=>{
    const instance=manager.getCardByName(printing);
    assert.ok(instance,'Missing pinned native printing: '+printing);
    instance.id=id++;
    return instance;
  };
  const store=new Store({onStateChange(){}});
  const owner=new Player(),opponent=new Player();
  owner.id=611;opponent.id=733;
  const state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  owner.active.cards.push(card('Bunnelby PRC'));
  opponent.active.cards.push(card('Bunnelby PRC'));
  const energy=card('Psychic Energy SVE');
  opponent.active.cards.push(energy);
  opponent.active.energies.cards.push(energy);
  const supporter=card('Team Flare Grunt XY');
  owner.hand.cards.push(supporter);
  for(const player of state.players){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,opponent,energy,supporter,seat};
}

test('pinned original Team Flare Grunt discards an opponent Active Energy in both seats',()=>{
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  for(const seat of [0,1]){
    const x=root(seat);
    assert.equal(x.supporter.canPlay(x.store,x.state,x.owner),true);
    const before=x.opponent.active.energies.cards.length;
    assert.equal(before,1);
    x.store.dispatch(new PlayCardAction(x.owner.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const pending=x.state.prompts.find(p=>p.result===undefined);
    if(pending){
      assert.equal(pending.constructor?.name,'ChooseCardsPrompt');
      assert.equal(pending.validate([x.energy]),true);
      x.store.dispatch(new ResolvePromptAction(pending.id,[x.energy]));
    }
    assert.equal(x.opponent.active.energies.cards.includes(x.energy),false);
    assert.ok(x.opponent.discard.cards.includes(x.energy));
    assert.equal(x.owner.hand.cards.includes(x.supporter),false);
    assert.equal(x.state.prompts.some(p=>p.result===undefined),false);
  }
});

test('pinned Team Flare Grunt target and Supporter quota are genuine native gates',()=>{
  for(const seat of [0,1]){
    const x=root(seat);
    x.owner.supporterTurn=1;
    assert.equal(x.supporter.canPlay(x.store,x.state,x.owner),false);
    x.owner.supporterTurn=0;
    assert.equal(x.supporter.canPlay(x.store,x.state,x.owner),true);
    x.opponent.active.energies.cards=[];
    x.opponent.active.cards=x.opponent.active.cards.filter(c=>c!==x.energy);
    assert.equal(x.supporter.canPlay(x.store,x.state,x.owner),false);
  }
});
