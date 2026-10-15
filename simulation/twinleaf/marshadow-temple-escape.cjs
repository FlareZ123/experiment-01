'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

/** Real engine effect test: Psychic Marshadow escapes opposing Wobbuffet plus Temple. */
function probe() {
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const load=p=>require(path.join(root,p));
  const {Store}=load('game/store/store');
  const {State,GamePhase}=load('game/store/state/state');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {PowerEffect}=load('game/store/effects/game-effects');
  const {CheckPokemonPowersEffect,CheckProvidedEnergyEffect}=load('game/store/effects/check-effects');
  const {CardType}=load('game/store/card/card-types');
  const manager=initializeCards();
  const get=name=>{const c=manager.getCardByName(name);assert.ok(c,name);return c;};
  const a=new Player(),b=new Player();a.id=101;b.id=202;
  const wob=get('Wobbuffet PHF'),temple=get('Temple of Sinnoh ASR');
  const marshadow=get('Marshadow UNB'),dde=get('Double Dragon Energy ROS');
  a.active.cards.push(wob);a.stadium.cards.push(temple);
  b.active.cards.push(get('Regidrago VSTAR SIT'),dde);
  const bench=new PokemonCardList();bench.cards.push(marshadow);b.bench.push(bench);
  const state=new State();state.players=[a,b];state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=1;state.turn=3;
  const store=new Store({onStateChange(){}});store.state=state;
  const powers=new CheckPokemonPowersEffect(b,marshadow);
  store.reduceEffect(state,powers);
  assert.ok(powers.powers.some(p=>p.name==='Resetting Hole'),'Psychic exemption must hold');
  const energy=()=>{const e=new CheckProvidedEnergyEffect(b,b.active);
    store.reduceEffect(state,e);return e.energyMap.filter(x=>x.card===dde).flatMap(x=>x.provides);};
  const before=energy();
  assert.deepEqual(before,[CardType.COLORLESS]);
  store.reduceEffect(state,new PowerEffect(b,marshadow.powers[0],marshadow,bench));
  assert.equal(a.stadium.cards.length,0);
  assert.ok(a.discard.cards.includes(temple));
  assert.ok(b.discard.cards.includes(marshadow));
  const after=energy();
  assert.deepEqual(after,[CardType.ANY,CardType.ANY]);
  return {passed:true,before,after,
    scope:'synthetic midgame effect test; no opening access or game outcomes'};
}
if(require.main===module)console.log(JSON.stringify(probe(),null,2));
module.exports={probe};
