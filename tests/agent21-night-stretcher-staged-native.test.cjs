'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const BASE=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(BASE,name));

/**
 * Native staged, exactly one physical card per printed slot.
 * No natural shuffled opening, strategic policy or completed Aichi game.
 * @param {0|1} seat
 * @param {'basic'|'pokemon'|'special-only'|'empty'} discardState
 */
function fixture(seat,discardState){
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {GameSettings}=native('game/core/game-settings');
  const {Format}=native('game/store/card/card-types');
  const manager=initializeCards();
  let id=921000+1000*seat;
  /** @param {string} fullName @returns {object} */
  const card=fullName=>{
    const found=manager.getCardByName(fullName);
    assert.ok(found,'Missing native card '+fullName);
    found.id=id++;
    return found;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=311;opponent.id=522;
  owner.name='NightStretcherOwner';
  opponent.name='Opponent';
  const night=card('Night Stretcher SFA');
  const unown=card('Unown AOR');
  owner.hand.cards.push(night);
  owner.active.cards.push(unown);
  opponent.active.cards.push(card('Trubbish FST'));
  /** @type {object|null} */
  let target=null;
  if(discardState==='basic'){
    target=card('Psychic Energy MEE');
    owner.discard.cards.push(target);
  }
  if(discardState==='pokemon'){
    target=card('Lunatone OBF');
    owner.discard.cards.push(target);
  }
  const special=card('Double Colorless Energy NXD');
  if(discardState!=='empty')owner.discard.cards.push(special);
  for(const player of [owner,opponent]){
    for(let i=0;i<16;i++)player.deck.cards.push(card('Psychic Energy MEE'));
    for(let i=0;i<6;i++){
      const slot=new CardList();
      slot.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(slot);
    }
  }
  const settings=new GameSettings();
  settings.format=Format.EXPANDED;
  const state=new State();
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.turn=14;
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {seat,store,state,owner,opponent,night,target,special,unown};
}

/** @param {object} state @returns {object|null} */
function pending(state){
  return state.prompts.find(p=>p.result===undefined)??null;
}

/** @param {object} f */
function finishNativeInformationPrompts(f){
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  for(let i=0;i<16;i++){
    const prompt=pending(f.state);
    if(!prompt)return;
    if(prompt.constructor.name==='ShowCardsPrompt'){
      assert.equal(prompt.playerId,f.opponent.id);
      f.store.dispatch(new ResolvePromptAction(prompt.id,true));
    }else if(prompt.constructor.name==='WaitPrompt'){
      f.store.dispatch(new ResolvePromptAction(prompt.id,null));
    }else{
      assert.fail('Unexpected Night Stretcher follow-up prompt: '+
        prompt.constructor.name);
    }
  }
  assert.fail('Night Stretcher did not close in 16 native prompt transitions');
}

/**
 * @param {0|1} seat
 * @param {'basic'|'pokemon'} type
 */
function playOne(seat,type){
  const f=fixture(seat,type);
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const beforePrize=f.owner.prizes.reduce((n,s)=>n+s.cards.length,0);
  assert.equal(f.night.canPlay(f.store,f.state,f.owner),true);
  f.store.dispatch(new PlayCardAction(f.owner.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const p=pending(f.state);
  assert.equal(p?.constructor.name,'ChooseCardsPrompt');
  assert.equal(p.playerId,f.owner.id);
  assert.strictEqual(p.cards,f.owner.discard);
  assert.equal(p.message,'CHOOSE_CARD_TO_HAND');
  assert.equal(p.options.max,1);
  assert.equal(p.options.min,0);
  assert.equal(p.validate([f.target],f.state),true);
  assert.equal(p.validate([f.special],f.state),false);
  f.store.dispatch(new ResolvePromptAction(p.id,[f.target]));
  finishNativeInformationPrompts(f);
  assert.equal(f.owner.hand.cards.filter(c=>c===f.target).length,1);
  assert.equal(f.owner.discard.cards.includes(f.target),false);
  assert.equal(f.owner.discard.cards.includes(f.special),true);
  assert.equal(f.owner.discard.cards.includes(f.night),true);
  assert.equal(f.owner.hand.cards.includes(f.night),false);
  assert.equal(f.owner.supporter.cards.includes(f.night),false);
  assert.equal(f.owner.prizes.reduce((n,s)=>n+s.cards.length,0),beforePrize);
  console.log('AGENT21_NIGHT_STRETCHER_NATIVE',JSON.stringify({
    seat,returnKind:type,returnedPhysicalId:f.target.id,
    itemPhysicallyDiscarded:true,specialUntouched:true,
    competitiveQualifiedGames:0
  }));
  return f;
}

for(const seat of [0,1]){
  for(const type of ['basic','pokemon']){
    test('pinned Night Stretcher SFA returns '+type+
      ' from original owner discard on seat '+seat,()=>{
      playOne(seat,type);
    });
  }
  test('returned exact Basic can be ordinarily attached, seat '+seat,()=>{
    const f=playOne(seat,'basic');
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const i=f.owner.hand.cards.indexOf(f.target);
    assert.ok(i>=0);
    f.store.dispatch(new PlayCardAction(f.owner.id,i,{
      player:PlayerType.ANY,slot:SlotType.ACTIVE,index:0
    }));
    assert.ok(f.owner.active.energies.cards.includes(f.target));
    assert.equal(f.owner.hand.cards.includes(f.target),false);
    assert.equal(f.owner.active.getPokemonCard(),f.unown);
  });
  test('no discard targets: printed Item is unplayable, seat '+seat,()=>{
    const f=fixture(seat,'empty');
    assert.equal(f.night.canPlay(f.store,f.state,f.owner),false);
  });
  test('special-only discard is incorrectly accepted by native canPlay, seat '+
    seat,()=>{
      const f=fixture(seat,'special-only');
      assert.equal(f.night.canPlay(f.store,f.state,f.owner),true,
        'Native canPlay treats any Energy as eligible');
      assert.equal(f.owner.discard.cards.length,1);
      assert.strictEqual(f.owner.discard.cards[0],f.special);
      console.log('AGENT21_NIGHT_STRETCHER_NATIVE_ELIGIBILITY_GAP',
        JSON.stringify({seat,canPlayInSpecialOnlyState:true,
          actualEligibleTargets:0,competitiveQualifiedGames:0}));
    });
}
