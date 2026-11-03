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
  const settledSource=store.state.players[seat];
  return {seat,mode,observed,error,
    eggInDiscard:settledSource.discard.cards.some(c=>c.fullName===egg.fullName),
    eggInHand:settledSource.hand.cards.some(c=>c.fullName===egg.fullName),
    pendingPrompts:store.state.prompts.filter(p=>p.result===undefined)
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


/**
 * An actual owner-paid Cologne Item, followed by original discard Propagation.
 * Source and opponent stages are placed directly into a staged board.
 * @param {0|1} seat
 * @param {boolean} mukActive Whether enemy Muk itself is Active.
 */
function cologneContinuation(seat,mukActive){
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GameSettings}=native('game/core/game-settings');
  const {Format}=native('game/store/card/card-types');
  const {IS_ABILITY_BLOCKED}=native('game/store/prefabs/prefabs');
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const manager=initializeCards();
  let id=450000;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing native source printing: '+name);
    c.id=id++;
    return c;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=seat===0?101:202;
  opponent.id=seat===0?202:101;
  owner.active.cards.push(card('Meloetta ex SV11B'));
  const egg=card('Exeggcute PLF');
  const cologne=card('Canceling Cologne ASR');
  owner.discard.cards.push(egg);
  owner.hand.cards.push(cologne);
  const mukSlot=new PokemonCardList();
  mukSlot.cards.push(card('Alolan Grimer SUM'),card('Alolan Muk SUM'));
  mukSlot.pokemonPlayedTurn=1;
  if(mukActive) {
    opponent.active.cards.push(...mukSlot.cards);
    opponent.active.pokemonPlayedTurn=1;
  } else {
    opponent.active.cards.push(card('Regidrago V SIT'));
    opponent.bench.push(mukSlot);
  }
  for(const p of [owner,opponent]){
    for(let i=0;i<8;i++)p.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  const state=new State(),settings=new GameSettings();
  settings.format=Format.EXPANDED;
  state.gameSettings=settings;state.rules=settings.rules;
  state.turn=3;state.phase=GamePhase.PLAYER_TURN;state.activePlayer=seat;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  const store=new Store({onStateChange(){}});
  store.state=state;
  const firstBlocked=Boolean(IS_ABILITY_BLOCKED(store,state,owner,egg,egg.powers[0]));
  assert.equal(firstBlocked,true);
  const target={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  store.dispatch(new PlayCardAction(owner.id,0,target));
  const afterItem=store.state.players[seat];
  const opponentAfter=store.state.players[1-seat];
  assert.equal(afterItem.discard.cards.some(c=>c.fullName==='Canceling Cologne ASR'),true);
  assert.equal(afterItem.hand.cards.some(c=>c.fullName==='Canceling Cologne ASR'),false);
  const stillEgg=afterItem.discard.cards.find(c=>c.fullName==='Exeggcute PLF');
  assert.ok(stillEgg);
  const afterBlocked=Boolean(IS_ABILITY_BLOCKED(store,store.state,afterItem,stillEgg,stillEgg.powers[0]));
  let abilityError=null;
  try{
    store.dispatch(new UseAbilityAction(owner.id,'Propagation',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.DISCARD,
      index:afterItem.discard.cards.indexOf(stillEgg)
    }));
  }catch(error){abilityError=String(error.message);}
  const finalOwner=store.state.players[seat];
  return {seat,mukActive,firstBlocked,afterBlocked,abilityError,
    cologneInDiscard:finalOwner.discard.cards.some(c=>c.fullName==='Canceling Cologne ASR'),
    eggInHand:finalOwner.hand.cards.some(c=>c.fullName==='Exeggcute PLF'),
    eggInDiscard:finalOwner.discard.cards.some(c=>c.fullName==='Exeggcute PLF'),
    cologneMarker:opponentAfter.marker.hasMarker('CANCELING_COLOGNE_MARKER',cologne),
    pending:store.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)};
}
for(const seat of [0,1]){
  for(const mukActive of [true,false]){
    test('native printed Cologne versus '+(mukActive?'Active':'Benched')+' Muk seat '+seat,()=>{
      const row=cologneContinuation(seat,mukActive);
      console.log('AGENT43_MUK_COLOGNE_PROPAGATION',JSON.stringify(row));
      assert.equal(row.afterBlocked,!mukActive);
      assert.equal(row.eggInHand,mukActive);
      assert.equal(row.eggInDiscard,!mukActive);
      assert.equal(row.abilityError,mukActive?null:'UNKNOWN_POWER');
      assert.equal(row.cologneInDiscard,true);
      assert.equal(row.cologneMarker,true);
      assert.deepEqual(row.pending,[]);
    });
  }
}
