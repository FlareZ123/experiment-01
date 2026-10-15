'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(root, name));

/**
 * Direct Apex Dragon -> Timeless-GX characterization, compared with Agent 7's
 * Mimikyu Copycat -> Apex Dragon -> Timeless-GX failing nested fixture.
 * Direct reducer call intentionally excludes real Energy and legal startup.
 */
function directApexGx() {
  const manager = initializeCards();
  const regidrago = manager.getCardByName('Regidrago VSTAR SIT');
  const dialga = manager.getCardByName('Dialga-GX UPR');
  const target = manager.getCardByName('Shadow Rider Calyrex V CRE');
  assert.ok(regidrago && dialga && target);
  const { Store } = load('game/store/store');
  const { Player } = load('game/store/state/player');
  const { GamePhase } = load('game/store/state/state');
  const { AttackEffect } = load('game/store/effects/game-effects');
  const { ResolvePromptAction } = load('game/store/actions/resolve-prompt-action');
  const { clearCopyAttackSessionsForTests } = load('game/store/prefabs/copy-attack-delegation');

  clearCopyAttackSessionsForTests();
  const delegatedEvents = [];
  const originalDialgaReducer = dialga.reduceEffect;
  dialga.reduceEffect = function (store, state, effect) {
    if (effect instanceof AttackEffect) {
      const entry = {
        name: effect.attack.name,
        attackIndex: this.attacks.indexOf(effect.attack),
        cardContext: this.fullName,
        beforeGX: effect.player.usedGX,
        sameOriginalPlayer: effect.player === player,
        sameStatePlayer: effect.player === state.players[0]
      };
      delegatedEvents.push(entry);
      const result = originalDialgaReducer.call(this, store, state, effect);
      entry.afterGX = effect.player.usedGX;
      entry.stateGXAfter = state.players[0].usedGX;
      entry.originalGXAfter = player.usedGX;
      return result;
    }
    const result = originalDialgaReducer.call(this, store, state, effect);

    return result;
  };
  const store = new Store({ onStateChange() {} });
  const state = store.state;
  const player = new Player();
  player.id = 101;
  const opponent = new Player();
  opponent.id = 202;
  state.players = [player, opponent];
  state.phase = GamePhase.ATTACK;
  state.turn = 4;
  state.activePlayer = 0;
  player.active.cards.push(regidrago);
  player.discard.cards.push(dialga);
  opponent.active.cards.push(target);
  regidrago.reduceEffect(store, state, new AttackEffect(player, opponent, regidrago.attacks[0]));
  const prompt = state.prompts.find(p => p.constructor.name === 'ChooseAttackPrompt');
  assert.ok(prompt);
  store.dispatch(new ResolvePromptAction(prompt.id, dialga.attacks[2]));
  const observed = {
    copiedDamage: opponent.active.damage,
    usedGX: player.usedGX,
    extraTurnArmed: Boolean(player.usedTurnSkip),
    printedAttack: regidrago.attacks[0].name,
    delegatedEvents,
    originalIsStatePlayer: player === state.players[0],
    originalIsStorePlayer: player === store.state.players[0],
    statePlayerGX: state.players[0].usedGX,
    storePlayerGX: store.state.players[0].usedGX
  };
  clearCopyAttackSessionsForTests();

  console.log('APEX_GX_DIAGNOSTIC', JSON.stringify(observed));
  assert.equal(observed.copiedDamage, 150, 'Copied Timeless-GX must deal 150');
  assert.equal(observed.usedGX, true, 'Copied Timeless-GX must consume GX attack marker');
  assert.equal(observed.extraTurnArmed, true, 'Copied Timeless-GX must arm extra turn');
  return observed;
}

if (require.main === module) console.log(JSON.stringify(directApexGx(), null, 2));
module.exports = { directApexGx };
