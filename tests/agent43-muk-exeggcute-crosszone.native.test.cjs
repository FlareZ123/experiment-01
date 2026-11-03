'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} x */
const native=x=>require(path.join(OUTPUT,x));

/**
 * Actual native Store / original printed rank26 Exeggcute in discard.
 * Staged zones make this a mechanical witness, never a natural deal or win.
 * @param {0|1} seat Original rank26 owner physical seat.
 * @param {'none'|'opponent-bench'|'owner-bench'|'opponent-discard'} mode
 */
function fixture(seat,mode) {
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GameSettings}=native('game/core/game-settings');
  const {CheckPokemonPowersEffect}=native('game/store/effects/check-effects');
  const {IS_ABILITY_BLOCKED}=native('game/store/prefabs/prefabs');
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const manager=initializeCards();
  let id=440000;
  /** @param {string} name */
  function card(name) {
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing registered native printing: '+name);
    c.id=id++;
    return c;
  }
  const source=new Player(),opponent=new Player();
  source.id=seat===0?101:202;
  opponent.id=seat===0?202:101;
  source.active.cards.push(card('Meloetta ex SV11B'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  const egg=card('Exeggcute PLF');
  source.discard.cards.push(egg);
  if(mode!=='none'){
    const holder=mode==='owner-bench'?source:opponent;
    const grimer=card('Alolan Grimer SUM');
    const muk=card('Alolan Muk SUM');
    if(mode==='opponent-discard') {
      holder.discard.cards.push(grimer,muk);
    } else {
      const slot=new PokemonCardList();
      slot.cards.push(grimer,muk);
      slot.pokemonPlayedTurn=1;
      holder.bench.push(slot);
    }
  }
  for(const p of [source,opponent]){
    for(let i=0;i<8;i++)p.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  const settings=new GameSettings(),state=new State();
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.turn=3;
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.players=seat===0?[source,opponent]:[opponent,source];
  const store=new Store({onStateChange(){}});
  store.state=state;
  const power=egg.powers.find(p=>p.name==='Propagation');
  assert.ok(power);
  const check=new CheckPokemonPowersEffect(source,egg);
  store.reduceEffect(state,check);
  const observed={
    blocked:Boolean(IS_ABILITY_BLOCKED(store,state,source,egg,power)),
    discoverable:check.powers.some(p=>p.name==='Propagation')
  };
  let error=null;
  try {
    store.dispatch(new UseAbilityAction(source.id,'Propagation',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.DISCARD,index:0
    }));
  }catch(e){error=String(e.message);}
  return {seat,mode,observed,error,
    eggInDiscard:source.discard.cards.includes(egg),
    eggInHand:source.hand.cards.includes(egg),
    pendingPrompts:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)};
}

for(const seat of [0,1]){
  for(const mode of ['none','opponent-bench','owner-bench','opponent-discard']){
    test('native Propagation across Muk '+mode+' on seat '+seat,()=>{
      const row=fixture(seat,mode);
      console.log('AGENT43_MUK_PROPAGATION',JSON.stringify(row));
      const blocked=mode==='opponent-bench'||mode==='owner-bench';
      assert.equal(row.observed.blocked,blocked,JSON.stringify(row));
      assert.equal(row.observed.discoverable,!blocked,JSON.stringify(row));
      assert.equal(row.eggInDiscard,blocked,JSON.stringify(row));
      assert.equal(row.eggInHand,!blocked,JSON.stringify(row));
      assert.deepEqual(row.pendingPrompts,[]);
    });
  }
}
