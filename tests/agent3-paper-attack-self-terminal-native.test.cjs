'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {installTerminalAttackKoBeforeEndTurnHook,VERSION}=
  require('../simulation/twinleaf/terminal-attack-ko-before-endturn-hook.cjs');

const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const native=moduleName=>require(path.join(root,moduleName));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {GamePhase,GameWinner}=native('game/store/state/state');
const {GameSettings}=native('game/core/game-settings');
const {EndTurnEffect}=native('game/store/effects/game-phase-effects');
const {CheckHpEffect}=native('game/store/effects/check-effects');
const {checkState}=native('game/store/effect-reducers/check-effect');

/**
 * Native staging only. Both players have an Active and six unlooked-at
 * Prizes, with no Bench. This isolates the fundamental paper termination
 * order after the attacker has already become lethally damaged.
 */
function prepare(){
  const cards=initializeCards();
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const settings=new GameSettings();
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.phase=GamePhase.ATTACK;
  state.turn=4;
  state.activePlayer=0;
  const attacker=new Player();
  attacker.id=101;
  attacker.name='native-attacker';
  const defender=new Player();
  defender.id=202;
  defender.name='native-defender';
  attacker.active.cards.push(cards.getCardByName('Meloetta ex SV11B'));
  defender.active.cards.push(cards.getCardByName('Shadow Rider Calyrex V CRE'));
  assert.ok(attacker.active.getPokemonCard());
  assert.ok(defender.active.getPokemonCard());
  attacker.active.damage=attacker.active.getPokemonCard().hp;
  for(const p of [attacker,defender]){
    p.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(cards.getCardByName('Exeggcute PLF'));
      return prize;
    });
  }
  state.players=[attacker,defender];
  return {store,state,attacker};
}

test('real pinned checkState resolves attacker-last self KO before EndTurn',()=>{
  const {store,state,attacker}=prepare();
  const hook=installTerminalAttackKoBeforeEndTurnHook({
    Store,EndTurnEffect,CheckHpEffect,GamePhase,checkState,rootStore:store
  });
  try{
    const settled=store.reduceEffect(state,new EndTurnEffect(attacker));
    assert.strictEqual(settled,state);
    assert.equal(store.hasPrompts(),false);
    assert.equal(state.phase,GamePhase.FINISHED);
    assert.equal(state.winner,GameWinner.PLAYER_2);
    assert.equal(hook.evidence().possible,1);
    assert.deepEqual(hook.evidence().events[0].terminalKnockOutSeats,[0]);
    assert.equal(hook.evidence().events[0].endedBeforeDelayedEffects,true);
    assert.equal(hook.evidence().schema,VERSION);
  }finally{hook.restore();}
});
