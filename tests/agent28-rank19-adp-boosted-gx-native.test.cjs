'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const OUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(OUT,name));
const {Store}=load('game/store/store');
const {Player}=load('game/store/state/player');
const {CardList}=load('game/store/state/card-list');
const {PokemonCardList}=load('game/store/state/pokemon-card-list');
const {GamePhase}=load('game/store/state/state');
const {AttackAction}=load('game/store/actions/game-actions');
const {Format}=load('game/store/card/card-types');
let id=97000;

/** @param {0|1} seat @param {number} ddeCount */
function stage(seat,ddeCount){
  const manager=initializeCards();
  /** @param {string} name */
  const make=name=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Missing pinned printing: '+name);
    card.id=id++;return card;
  };
  const source=new Player();source.id=101;source.name='rank19-source';
  const opponent=new Player();opponent.id=202;opponent.name='opponent';
  const adp=make('Arceus & Dialga & Palkia GX CEC');
  source.active.cards.push(adp);
  const dde=[];
  for(let j=0;j<ddeCount;j++){
    const energy=make('Double Dragon Energy ROS');
    source.active.cards.push(energy);
    source.active.energies.cards.push(energy);
    dde.push(energy);
  }
  source.bench=Array.from({length:5},()=>new PokemonCardList());
  source.bench[0].cards.push(make('Raging Bolt ex TEF'));
  opponent.active.cards.push(make('Duskull PRE'));
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  opponent.bench[0].cards.push(make('Shadow Rider Calyrex V CRE'));
  for(const player of [source,opponent]){
    for(let j=0;j<6;j++){
      const prize=new CardList();prize.cards.push(make('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
    for(let j=0;j<8;j++)player.deck.cards.push(make('Psychic Energy SVE'));
  }
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.players=seat===0?[source,opponent]:[opponent,source];
  state.activePlayer=seat;state.turn=4;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,source,opponent,adp,dde,seat};
}

for(const seat of [0,1])for(const ddeCount of [1,2]){
  test('native source ADP GX both printed Energy-resource cases: seat '+seat+', DDE '+ddeCount,()=>{
    const x=stage(seat,ddeCount);
    const printed=x.adp.attacks.find(a=>a.name==='Altered Creation-GX');
    assert.ok(printed);
    assert.equal(printed.gxAttack===true,false,
      'Pinned source card omits GX metadata; native reducer must enforce quota');
    assert.equal(x.source.usedGX===true,false);
    x.store.dispatch(new AttackAction(x.source.id,'Altered Creation-GX'));
    assert.equal(x.source.usedGX,true,'native card must consume GX allowance');
    assert.equal(x.source.alteredCreationDamage,true,
      'native card must persist offensive +30 effect');
    assert.equal(x.source.usedAlteredCreation,true,
      'attached DDE must supply extra Water for boosted Prize effect');
    assert.equal(x.source.active.energies.cards.length,ddeCount);
    assert.equal(x.source.getPrizeLeft(),6);
    assert.equal(x.opponent.getPrizeLeft(),6);
    console.log('ADP_NATIVE_GX_SETTLED',JSON.stringify({seat,ddeCount,
      usedGX:x.source.usedGX,boostDamage:x.source.alteredCreationDamage,
      boostPrize:x.source.usedAlteredCreation,
      phase:x.store.state.phase,turn:x.store.state.turn,
      sourcePrizes:x.source.getPrizeLeft(),opponentPrizes:x.opponent.getPrizeLeft()}));
  });
}
