'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const out=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(out,name));
function checkTempleEnergy() {
  const cards=initializeCards();
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {GamePhase}=load('game/store/state/state');
  const {CardType}=load('game/store/card/card-types');
  const {CheckProvidedEnergyEffect}=load('game/store/effects/check-effects');
  const store=new Store({onStateChange(){}});
  const state=store.state,a=new Player(),b=new Player();
  a.id=101;b.id=202;state.players=[a,b];
  state.turn=2;state.phase=GamePhase.PLAYER_TURN;state.activePlayer=0;
  const card=name=>{
    const found=cards.getCardByName(name);
    assert.ok(found,name);
    return found;
  };
  const regidrago=card('Regidrago VSTAR SIT');
  const energy=card('Double Dragon Energy ROS');
  b.active.cards.push(regidrago,energy);
  const provided=()=>{
    const e=new CheckProvidedEnergyEffect(b,b.active);
    store.reduceEffect(state,e);
    return e.energyMap.filter(row=>row.card===energy).map(row=>row.provides);
  };
  const initial=provided();
  assert.equal(initial.length,1);
  assert.equal(initial[0].length,2);
  a.stadium.cards.push(card('Temple of Sinnoh ASR'));
  const locked=provided();
  assert.deepEqual(locked,[[CardType.COLORLESS]]);
  a.stadium.cards.length=0;
  assert.equal(provided()[0].length,2);
  return {passed:true,initial:initial[0],temple:locked[0]};
}
if(require.main===module)console.log(JSON.stringify(checkTempleEnergy(),null,2));
module.exports={checkTempleEnergy};
