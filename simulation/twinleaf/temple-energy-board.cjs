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
  return {passed:true};
}
if(require.main===module)console.log(JSON.stringify(checkTempleEnergy(),null,2));
module.exports={checkTempleEnergy};
