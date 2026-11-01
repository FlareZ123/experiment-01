'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {probeNativeCanPlayGraphReadonly}=
  require('../simulation/twinleaf/agent16-native-canplay-graph-guard.cjs');

const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(root,name));

/**
 * Pinned real Store and printed original rank-6 denial Supporter, staged for
 * native purity only. This is outside the natural seven-card distribution.
 * @param {0|1} seat
 * @returns {object}
 */
function fixture(seat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const owner=new Player(),opponent=new Player();
  owner.id=661;opponent.id=662;
  const state=store.state;
  state.activePlayer=seat;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  let identity=76000;
  const card=printing=>{
    const instance=manager.getCardByName(printing);
    assert.ok(instance,'Missing native original printing: '+printing);
    instance.id=identity++;
    return instance;
  };
  owner.active.cards.push(card('Iron Thorns ex TWM'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const opponentEnergy=card('Psychic Energy MEE');
  opponent.active.cards.push(opponentEnergy);
  opponent.active.energies.cards.push(opponentEnergy);
  const denial=card('Team Flare Grunt XY');
  owner.hand.cards.push(denial);
  for(const player of state.players){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,opponent,denial,opponentEnergy};
}

for(const seat of [0,1]){
  test('real pinned native Team Flare canPlay preserves complete Store and State own data, seat '+seat,()=>{
    const x=fixture(seat);
    const originalState=x.store.state;
    assert.equal(x.denial.canPlay(x.store,x.state,x.owner),true);
    const positive=probeNativeCanPlayGraphReadonly(
      x.denial,x.store,x.state,x.owner);
    assert.equal(positive.nativePlayable,true);
    assert.equal(positive.nativeError,null);
    assert.equal(positive.graphReadonlyVerified,true);
    assert.equal(positive.stateReferenceIdentityVerified,true);
    assert.equal(x.store.state,originalState);
    assert.equal(x.owner.hand.cards.includes(x.denial),true);
    assert.equal(x.opponent.active.energies.cards.includes(x.opponentEnergy),true);

    x.owner.supporterTurn=1;
    const negative=probeNativeCanPlayGraphReadonly(
      x.denial,x.store,x.state,x.owner);
    assert.equal(negative.nativePlayable,false);
    assert.equal(negative.graphReadonlyVerified,true);
    assert.equal(negative.stateReferenceIdentityVerified,true);
    assert.equal(x.owner.supporterTurn,1);
  });
}
