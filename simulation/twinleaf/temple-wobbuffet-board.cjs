'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards}=require('./headless.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(root,name));


/** Check two named interactions using actual engine reducers. */
function inspectTempleWobbuffet() {
  const cards=initializeCards();
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {CheckPokemonPowersEffect,CheckProvidedEnergyEffect}=
    engine('game/store/effects/check-effects');
  const {CardType}=engine('game/store/card/card-types');
  const store=new Store({onStateChange() {}});
  const state=store.state;
  const a=new Player(),b=new Player();
  a.id=101;a.name='test-A';b.id=202;b.name='test-B';
  state.players=[a,b];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=2;
  state.activePlayer=0;
  const card=name=>{
    const result=cards.getCardByName(name);
    assert.ok(result,'Pinned card missing: '+name);
    return result;
  };
  const powers=(owner,pokemon)=>{
    const e=new CheckPokemonPowersEffect(owner,pokemon);
    store.reduceEffect(state,e);
    return e.powers.map(power=>power.name);
  };

  const vmax=card('Shadow Rider Calyrex VMAX CRE');
  const thorns=card('Iron Thorns ex TWM');
  const wob=card('Wobbuffet PHF');
  const shadowV=card('Shadow Rider Calyrex V CRE');
  a.active.cards.push(shadowV);
  const bench=new PokemonCardList();
  bench.cards.push(vmax);
  a.bench.push(bench);
  b.active.cards.push(thorns);

  const lockedPowers=powers(a,vmax);
  assert.ok(!lockedPowers.includes('Underworld Door'),
    'Active Iron Thorns should suppress Rule Box VMAX ability');
  a.active.cards.splice(0,1,wob);
  const wobbuffedThorns=powers(b,thorns);
  const restoredPowers=powers(a,vmax);
  assert.ok(!wobbuffedThorns.includes('Initialization'),
    'Active Wobbuffet should disable non-Psychic Iron Thorns ability');
  assert.ok(restoredPowers.includes('Underworld Door'),
    'Psychic VMAX ability should remain under Wobbuffet');
  return {passed:true};
}
if(require.main===module)console.log(JSON.stringify(inspectTempleWobbuffet(),null,2));
module.exports={inspectTempleWobbuffet};

