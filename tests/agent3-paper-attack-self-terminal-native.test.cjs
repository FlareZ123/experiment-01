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

/**
 * Explicit native printed damage and real AttackAction. This is still a
 * pre-established state (not a seven-card start), with one attached Lightning
 * and 60 prior damage on a 70-HP Electrike. The attack deals 30 to the
 * defending Active and 10 to the attacker under its actual reducer.
 */
test('printed Electrike Thunder Jolt reaches genuine terminal attack KO boundary',()=>{
  const cards=initializeCards();
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {Format}=native('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.gameSettings.format=Format.EXPANDED;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.activePlayer=0;
  const attacking=new Player(),defending=new Player();
  attacking.id=101;attacking.name='printed-recoil';
  defending.id=202;defending.name='test-target';
  state.players=[attacking,defending];
  const electrike=cards.getCardByName('Electrike M1S');
  const lightning=cards.getAllCards().find(card=>
    card.name==='Lightning Energy'&&card.set==='MEE');
  assert.ok(electrike&&lightning,'Pinned printed Electrike and basic Lightning exist');
  assert.equal(electrike.hp,70);
  assert.equal(electrike.attacks[0].name,'Thunder Jolt');
  attacking.active.cards.push(electrike,lightning);
  attacking.active.energies.cards.push(lightning);
  attacking.active.damage=60;
  defending.active.cards.push(cards.getCardByName('Shadow Rider Calyrex V CRE'));
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(cards.getCardByName('Exeggcute PLF'));
      return prize;
    });
    player.deck.cards.push(cards.getCardByName('Exeggcute PLF'));
  }
  const hook=installTerminalAttackKoBeforeEndTurnHook({
    Store,EndTurnEffect,CheckHpEffect,GamePhase,checkState,rootStore:store
  });
  try{
    store.dispatch(new AttackAction(attacking.id,'Thunder Jolt'));
    for(let step=0;step<20 && state.phase!==GamePhase.FINISHED;step++){
      const pending=state.prompts.find(p=>p.result===undefined);
      assert.ok(pending,'Native attack stalled with no pending prompt');
      assert.equal(pending.constructor.name,'WaitPrompt',
        'Unexpected native prompt during printed Electrike terminal recoil');
      store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    assert.equal(defending.active.damage,30,'Printed attack damage must settle');
    assert.equal(state.phase,GamePhase.FINISHED);
    assert.equal(state.winner,GameWinner.PLAYER_2);
    assert.ok(attacking.discard.cards.includes(electrike),
      'Self-damaged Electrike must be discarded by native Knock Out');
    const events=hook.evidence().events;
    assert.equal(events.length,1,'A real printed attack should reach the hook once');
    assert.deepEqual(events[0].terminalKnockOutSeats,[0]);
    assert.equal(events[0].endedBeforeDelayedEffects,true);
    assert.equal(events[0].turn,4);
  }finally{hook.restore();}
});
