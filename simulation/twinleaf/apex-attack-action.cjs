'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

const server = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(server, modulePath));

/** @returns {{ store: any, state: any, attacking: any, defending: any, dratini: any }} */
function preparedRegidrago() {
  const manager = initializeCards();
  const get = name => manager.getCardByName(name);
  const { Store } = load('game/store/store');
  const { Player } = load('game/store/state/player');
  const { CardList } = load('game/store/state/card-list');
  const { GamePhase } = load('game/store/state/state');
  const { Format } = load('game/store/card/card-types');

  const regidrago = get('Regidrago VSTAR SIT');
  const dratini = get('Dratini OBF');
  const target = get('Shadow Rider Calyrex V CRE');
  assert.ok(regidrago && dratini && target);
  const available = manager.getAllCards();
  const grassPrint = available.find(card => card.name === 'Grass Energy' && card.set === 'MEE');
  const firePrint = available.find(card => card.name === 'Fire Energy' && card.set === 'MEE');
  assert.ok(grassPrint && firePrint, 'Expected MEE basic Energy printings in engine');

  const store = new Store({ onStateChange() {} });
  const state = store.state;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;
  state.activePlayer = 0;
  state.gameSettings.format = Format.EXPANDED;
  const attacking = new Player();
  attacking.id = 101;
  attacking.name = 'Regidrago';
  const defending = new Player();
  defending.id = 202;
  defending.name = 'Target';
  state.players = [attacking, defending];
  attacking.active.cards.push(regidrago);
  attacking.discard.cards.push(dratini);
  defending.active.cards.push(target);
  for (const player of state.players) {
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new CardList();
      prize.cards.push(get('Dratini OBF'));
      return prize;
    });
    player.deck.cards.push(get('Dratini OBF'));
  }

  const attach = cardName => {
    const energy = get(cardName);
    attacking.active.cards.push(energy);
    attacking.active.energies.cards.push(energy);
    return energy;
  };
  attach(grassPrint.fullName);
  attach(grassPrint.fullName);
  return { store, state, attacking, defending, dratini, attachFire: () => attach(firePrint.fullName) };
}

/** AttackAction must reject missing Fire and copy with GGF, without copying Tail Snap cost. */
function testApexAction() {
  const { AttackAction } = load('game/store/actions/game-actions');
  const { ResolvePromptAction } = load('game/store/actions/resolve-prompt-action');
  const negative = preparedRegidrago();
  assert.throws(() => negative.store.dispatch(new AttackAction(101, 'Apex Dragon')),
    'Grass+Grass alone must not pay the Grass+Grass+Fire Apex Dragon cost');

  const positive = preparedRegidrago();
  positive.attachFire();
  positive.store.dispatch(new AttackAction(101, 'Apex Dragon'));
  const prompt = positive.state.prompts.find(p => p.result === undefined && p.constructor.name === 'ChooseAttackPrompt');
  assert.ok(prompt, 'Paid Apex Dragon must offer attack-copy selection');
  assert.ok(prompt.cards.includes(positive.dratini));
  positive.store.dispatch(new ResolvePromptAction(prompt.id, positive.dratini.attacks[0]));
  assert.equal(positive.defending.active.damage, 20);
  return {
    attack: 'AttackAction Apex Dragon, GGF exact payment',
    unpaidRejected: true,
    paidCopyDamage: positive.defending.active.damage,
    scope: 'Injected established Active and prize zones, full game setup and play decisions excluded'
  };
}
if (require.main === module) console.log(JSON.stringify(testApexAction(), null, 2));
module.exports = { testApexAction };
