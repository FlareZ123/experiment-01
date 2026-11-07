'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const BASE=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(BASE,name));

/**
 * Staged legal source-search whiff; engine decides real prompt validator.
 * This is a test of card and prompt semantics, not of how a player learned
 * hidden target locations in a natural game, nor an original deck match.
 * @param {0|1} seat
 * @param {boolean} hasFog
 */
function fixture(seat,hasFog){
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {State,GamePhase}=native('game/store/state/state');
  const {CardList}=native('game/store/state/card-list');
  const {GameSettings}=native('game/core/game-settings');
  const {Format}=native('game/store/card/card-types');
  const manager=initializeCards();
  let id=320000+1000*seat+100*Number(hasFog);
  /** @param {string} fullName @returns {object} */
  const card=fullName=>{
    const obj=manager.getCardByName(fullName);
    assert.ok(obj,'Native printing absent: '+fullName);
    obj.id=id++;
    return obj;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  owner.name='SearchWhiffOwner';
  opponent.name='Opponent';
  const box=card('Secret Box TWM');
  const vip1=card('Battle VIP Pass FST');
  const vip2=card('Battle VIP Pass FST');
  const carrier=card('Rescue Carrier EVS');
  owner.hand.cards.push(box,vip1,vip2,carrier);
  const active=card('Unown AOR');
  owner.active.cards.push(active);
  opponent.active.cards.push(card('Trubbish FST'));
  /** @type {object|null} */
  let fog=null;
  if(hasFog) {
    fog=card('Fog Crystal CRE');
    owner.deck.cards.push(fog);
  }
  for(const p of [owner,opponent]){
    for(let i=0;i<8;i++)p.deck.cards.push(card('Lightning Energy SVE'));
    for(let i=0;i<6;i++){
      const slot=new CardList();
      slot.cards.push(card('Lightning Energy SVE'));
      p.prizes.push(slot);
    }
  }
  const settings=new GameSettings();
  settings.format=Format.EXPANDED;
  const state=new State();
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=14;
  state.activePlayer=seat;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {seat,store,state,owner,opponent,box,vip1,vip2,carrier,fog};
}

/** @param {object} state */
function pending(state) {
  return state.prompts.find(p=>p.result===undefined)??null;
}

/**
 * Complete only naturally generated metadata prompts, with validator checks.
 * The ordered deck permutation is deterministic ONLY in this staged test.
 * In a natural match it must be a legitimate owning-seat shuffle responder.
 * @param {object} fixture
 */
function settleInformational(fixture) {
  const {ResolvePromptAction}=native(
    'game/store/actions/resolve-prompt-action');
  for(let i=0;i<24;i++) {
    const p=pending(fixture.state);
    if(!p)return;
    if(p.constructor.name==='ShowCardsPrompt'){
      assert.equal(p.playerId,fixture.opponent.id);
      fixture.store.dispatch(new ResolvePromptAction(p.id,true));
    }else if(p.constructor.name==='WaitPrompt'){
      fixture.store.dispatch(new ResolvePromptAction(p.id,null));
    }else if(p.constructor.name==='ShuffleDeckPrompt'){
      const order=fixture.owner.deck.cards.map((_,index)=>index);
      assert.equal(p.playerId,fixture.owner.id);
      assert.equal(p.validate(order,fixture.state),true);
      fixture.store.dispatch(new ResolvePromptAction(p.id,order));
    }else{
      assert.fail('Unsupported native staged search follow-up '+p.constructor.name);
    }
  }
  assert.fail('Native staged search exceeded bounded informational sequence');
}

/** @param {0|1} seat @param {boolean} hasFog */
function runWhiff(seat,hasFog) {
  const f=fixture(seat,hasFog);
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=native(
    'game/store/actions/resolve-prompt-action');
  const prizes=f.owner.prizes.reduce((n,p)=>n+p.cards.length,0);
  const initialDeck=f.owner.deck.cards.length;
  assert.equal(f.box.canPlay(f.store,f.state,f.owner),true);
  f.store.dispatch(new PlayCardAction(f.owner.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const payment=pending(f.state);
  assert.equal(payment?.constructor.name,'ChooseCardsPrompt');
  assert.equal(payment.playerId,f.owner.id);
  assert.equal(payment.message,'CHOOSE_CARD_TO_DISCARD');
  const pay=[f.vip1,f.vip2,f.carrier];
  assert.equal(payment.validate(pay,f.state),true);
  f.store.dispatch(new ResolvePromptAction(payment.id,pay));
  for(const paid of pay) {
    assert.equal(f.owner.discard.cards.includes(paid),true,
      'Physical mandatory three-card payment actually discarded');
  }
  const boxSearch=pending(f.state);
  assert.equal(boxSearch?.constructor.name,'ChooseCardsPrompt');
  assert.equal(boxSearch.playerId,f.owner.id);
  assert.equal(boxSearch.message,'CHOOSE_CARD_TO_HAND');
  assert.strictEqual(boxSearch.cards,f.owner.deck);
  let whiffedBox=false,whiffedFog=false;
  if(f.fog){
    assert.equal(boxSearch.validate([f.fog],f.state),true);
    f.store.dispatch(new ResolvePromptAction(boxSearch.id,[f.fog]));
    settleInformational(f);
    assert.equal(f.owner.hand.cards.includes(f.fog),true);
    assert.equal(f.owner.deck.cards.includes(f.fog),false);
    const index=f.owner.hand.cards.indexOf(f.fog);
    f.store.dispatch(new PlayCardAction(f.owner.id,index,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const fogSearch=pending(f.state);
    assert.equal(fogSearch?.constructor.name,'ChooseCardsPrompt');
    assert.equal(fogSearch.message,'CHOOSE_CARD_TO_HAND');
    assert.strictEqual(fogSearch.cards,f.owner.deck);
    assert.equal(fogSearch.options.min,0);
    assert.equal(fogSearch.options.max,0);
    assert.equal(fogSearch.validate([],f.state),true);
    f.store.dispatch(new ResolvePromptAction(fogSearch.id,[]));
    settleInformational(f);
    whiffedFog=true;
    assert.equal(f.owner.discard.cards.includes(f.fog),true);
  }else{
    assert.equal(boxSearch.options.min,0);
    assert.equal(boxSearch.options.max,0);
    assert.equal(boxSearch.validate([],f.state),true);
    f.store.dispatch(new ResolvePromptAction(boxSearch.id,[]));
    settleInformational(f);
    whiffedBox=true;
  }
  assert.equal(f.owner.discard.cards.includes(f.box),true);
  assert.equal(f.owner.supporter.cards.includes(f.box),false);
  assert.equal(f.owner.hand.cards.includes(f.box),false);
  assert.equal(f.owner.hand.cards.length,0);
  assert.equal(f.owner.prizes.reduce((n,p)=>n+p.cards.length,0),prizes);
  assert.equal(f.owner.deck.cards.length,initialDeck-Number(hasFog));
  console.log('AGENT21_SECRETBOX_NATIVE_DECK_WHiff',JSON.stringify({
    seat,boxSearchWhiff:whiffedBox,fogSearchWhiff:whiffedFog,
    physicalThreeCardPaymentConfirmed:true,
    boxPhysicallyDiscarded:true,fogPhysicallyDiscarded:!!f.fog,
    originalPrizeCountPreserved:true,
    competitiveQualifiedGames:0
  }));
}

for(const seat of [0,1]){
  test('Native Secret Box completely empty owner deck target search accepts zero, seat '+
    seat,()=>runWhiff(seat,false));
  test('Native Secret Box fetches Fog then Fog owner deck search accepts zero Basic, seat '+
    seat,()=>runWhiff(seat,true));
}
