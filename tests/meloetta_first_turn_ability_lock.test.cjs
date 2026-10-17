'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const engine = modulePath => require(path.join(output, modulePath));

const {Store} = engine('game/store/store');
const {Player} = engine('game/store/state/player');
const {CardList} = engine('game/store/state/card-list');
const {GamePhase,GameWinner} = engine('game/store/state/state');
const {GameSettings} = engine('game/core/game-settings');
const {GameMessage} = engine('game/game-message');
const {PlayCardAction,PlayerType,SlotType} =
  engine('game/store/actions/play-card-action');
const {AttackAction} = engine('game/store/actions/game-actions');
const {ResolvePromptAction} =
  engine('game/store/actions/resolve-prompt-action');

const active = {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
const board = {player:PlayerType.ANY,slot:SlotType.BOARD,index:0};

/** @param {string} defenderPrinting @returns {object} Prepared Store fixture. */
function setup(defenderPrinting) {
  const cards = initializeCards();
  let nextId = 22000;
  /** @param {string} printing @returns {object} */
  const card = printing => {
    const result = cards.getCardByName(printing);
    assert.ok(result,'Missing source printing '+printing);
    result.id = nextId++;
    return result;
  };
  const store = new Store({onStateChange() {}});
  const settings = new GameSettings();
  const state = store.state;
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 1;
  state.activePlayer = 0;
  assert.equal(state.rules.attackFirstTurn,false);

  const attacker = new Player();
  attacker.id = 101;
  attacker.name = 'Meloetta';
  attacker.active.cards.push(card('Meloetta ex SV11B'));
  attacker.active.energies.cards.push(card('Lightning Energy SVE'));
  const defender = new Player();
  defender.id = 202;
  defender.name = 'Lock defender';
  defender.active.cards.push(card(defenderPrinting));

  const prize = () => {
    const pile = new CardList();
    pile.cards.push(card('Psychic Energy SVE'));
    return pile;
  };
  attacker.prizes = Array.from({length:6},prize);
  // The original five self-KOs are a separately proved source-Store line.
  // Staging one Prize isolates the active lock and first-turn attack rule.
  defender.prizes = [prize()];
  state.players = [attacker,defender];
  const dce = card('Double Colorless Energy SUM');
  const crisis = card('Technical Machine: Crisis Punch PAF');
  const cologne = card('Canceling Cologne ASR');
  attacker.hand.cards.push(dce,crisis,cologne);
  return {store,state,attacker,defender,dce,crisis,cologne};
}

/** @param {object} f @param {object} sourceCard @param {object} destination */
function play(f,sourceCard,destination) {
  const index=f.attacker.hand.cards.indexOf(sourceCard);
  assert.notEqual(index,-1,'Card must be in hand before play');
  f.store.dispatch(new PlayCardAction(f.attacker.id,index,destination));
}

/** @param {object} f @returns {void} */
function resolveWaits(f) {
  for (let attempts=0;attempts<24;attempts++) {
    const prompt=f.state.prompts.find(p=>p.result===undefined);
    if (!prompt) return;
    assert.equal(prompt.constructor.name,'WaitPrompt');
    f.store.dispatch(new ResolvePromptAction(prompt.id,null));
  }
  assert.fail('Unexpectedly long postattack prompt sequence');
}

/**
 * A firstturn attack permitted by Live Debut should be stopped by a live
 * opposing lock and restored by a genuine played Canceling Cologne.
 * @param {string} printing Opposing printed Active.
 * @param {boolean} useCologne Whether to resolve source Item before attack.
 * @param {boolean} attackAllowed Expected source-mechanical result.
 */
function checkCase(printing,useCologne,attackAllowed) {
  const f=setup(printing);
  play(f,f.dce,active);
  play(f,f.crisis,active);
  if(useCologne) play(f,f.cologne,board);
  assert.equal(f.attacker.active.energies.cards.length,2);
  assert.equal(f.attacker.active.tools.includes(f.crisis),true);
  assert.equal(f.defender.getPrizeLeft(),1);
  const damageBefore=f.defender.active.damage;

  if(!attackAllowed) {
    assert.throws(
      ()=>f.store.dispatch(new AttackAction(f.attacker.id,'Crisis Punch')),
      error=>error?.message===GameMessage.CANNOT_ATTACK_ON_FIRST_TURN,
      'Active lock must remove the first-turn attack exception'
    );
    assert.equal(f.defender.active.damage,damageBefore);
    assert.equal(f.state.phase,GamePhase.PLAYER_TURN);
    return;
  }
  f.store.dispatch(new AttackAction(f.attacker.id,'Crisis Punch'));
  resolveWaits(f);
  assert.equal(f.state.phase,GamePhase.FINISHED);
  assert.equal(f.state.winner,GameWinner.PLAYER_1);
  assert.equal(f.defender.active.cards.length,0);
}

test('baseline Meloetta Live Debut permits first-turn Crisis Punch',()=>{
  checkCase('Shadow Rider Calyrex V CRE',false,true);
});
test('opposing Iron Thorns ex Initialization denies Live Debut',()=>{
  checkCase('Iron Thorns ex TWM',false,false);
});
test('source Canceling Cologne disables opposing Iron Thorns Initialization',()=>{
  checkCase('Iron Thorns ex TWM',true,true);
});
test('opposing Klefki Mischievous Lock denies Live Debut',()=>{
  checkCase('Klefki SVI',false,false);
});
test('source Canceling Cologne disables opposing Klefki Mischievous Lock',()=>{
  checkCase('Klefki SVI',true,true);
});
