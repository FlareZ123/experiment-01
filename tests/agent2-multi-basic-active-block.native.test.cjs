'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require(
  '../simulation/twinleaf/actor-observation-contract.cjs');
const {nativePublicCatalog}=require(
  '../simulation/twinleaf/agent2-bilateral-multi-basic-retreat-bot.cjs');
const {chooseMultiBasicPaidRetreatInDeckRace,
  chooseMultiBasicPaidRetreatInDeckRaceGuarded}=require(
  '../simulation/twinleaf/agent2-actor-multi-basic-paid-retreat-frontier.cjs');

const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {object} Native pinned Twinleaf module. */
const native=name=>require(path.join(base,name));
const {Store}=native('game/store/store');
const {State,GamePhase}=native('game/store/state/state');
const {Player}=native('game/store/state/player');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {CardList}=native('game/store/state/card-list');
const {GameSettings}=native('game/core/game-settings');
const {Format}=native('game/store/card/card-types');
const {RetreatAction}=native('game/store/actions/game-actions');
const {CheckRetreatCostEffect}=native('game/store/effects/check-effects');

/**
 * Explicitly staged source-printed board, never an actual game/deal.
 * Original rank1 Dialga-GX with three Basic Psychic and funded Shadow Rider
 * against original rank3 Active Snorlax PGO Block. Both seats exercised.
 * @param {0|1} seat Acting owner physical seat.
 * @returns {object} Staged Store and physical source prints.
 */
function fixture(seat){
  const cards=initializeCards();
  let nextId=44000000+seat*100000;
  const card=printing=>{
    const c=cards.getCardByName(printing);
    assert.ok(c,'Native printing missing: '+printing);
    c.id=nextId++;
    return c;
  };
  const own=new Player(),opp=new Player();
  own.id=seat===0?101:202;
  opp.id=seat===0?202:101;
  const dialga=card('Dialga-GX UPR');
  own.active.cards.push(dialga);
  own.bench=Array.from({length:5},()=>new PokemonCardList());
  const shadow=card('Shadow Rider Calyrex V CRE');
  own.bench[0].cards.push(shadow);
  const snorlax=card('Snorlax PGO');
  opp.active.cards.push(snorlax);
  opp.bench=Array.from({length:5},()=>new PokemonCardList());
  const attach=(slot,n)=>{
    for(let i=0;i<n;i++){
      const energy=card('Psychic Energy MEE');
      slot.cards.push(energy);
      slot.energies.cards.push(energy);
    }
  };
  attach(own.active,3);
  attach(own.bench[0],2);
  for(const [player,count] of [[own,19],[opp,30]]){
    for(let i=0;i<count;i++)player.deck.cards.push(card('Psychic Energy MEE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
  }
  const settings=new GameSettings();
  settings.format=Format.EXPANDED;
  const state=new State();
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.turn=33;
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.players=seat===0?[own,opp]:[opp,own];
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {store,state,seat,own,opp,dialga,shadow,snorlax};
}

for(const seat of [0,1]){
  test('native Active Snorlax Block vetoes paper-paid-retreat seat '+seat,()=>{
    const f=fixture(seat);
    const view=actorObservation(f.state,seat);
    const catalog=nativePublicCatalog();
    assert.equal(view.opponentPublic.active.printing,'Snorlax PGO');
    assert.ok(view.opponentPublic.active.abilities.includes('Block'));
    const old=chooseMultiBasicPaidRetreatInDeckRace(view,catalog);
    const guarded=chooseMultiBasicPaidRetreatInDeckRaceGuarded(view,catalog);
    assert.equal(old?.kind,'paid-retreat');
    assert.equal(old?.benchIndex,0);
    assert.equal(guarded,null,
      'Guarded owner-only policy must not issue a RetreatAction under Block');
    const fee=new CheckRetreatCostEffect(f.own);
    f.store.reduceEffect(f.state,fee);
    assert.equal(fee.cost.length,3,
      'Printed fee remains exactly three, despite categorical Block');
    assert.throws(()=>f.store.dispatch(
      new RetreatAction(f.own.id,0)),/BLOCKED_BY_EFFECT/);
    assert.strictEqual(f.own.active.getPokemonCard(),f.dialga);
    assert.strictEqual(f.own.bench[0].getPokemonCard(),f.shadow);
    assert.equal(f.own.active.energies.cards.length,3);
    console.log('AGENT2_PAPER_BLOCK_NATIVE',JSON.stringify({
      seat,actorActive:'Dialga-GX UPR',
      opponentActive:'Snorlax PGO',
      oldNominalOffer:true,guardedNominalOffer:false,
      actualNativeStoreRetreatRejected:'BLOCKED_BY_EFFECT',
      printedFeeUnits:3,competitiveGamesQualified:0
    }));
  });
}
