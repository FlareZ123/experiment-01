'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');
const { withMegatonNoEffectRootGuard } =
  require('../simulation/twinleaf/agent1-megaton-no-effect-root-guard.cjs');
const { installMegatonBlowerHook } =
  require('../simulation/twinleaf/megaton-blower-hook.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const load = name => require(path.join(output, name));
const { State, GamePhase } = load('game/store/state/state');
const { Player } = load('game/store/state/player');
const { CardList } = load('game/store/state/card-list');
const { Store } = load('game/store/store');
const { Format } = load('game/store/card/card-types');
const { PlayCardAction, PlayerType, SlotType } =
  load('game/store/actions/play-card-action');
const { PassTurnAction, AttackAction } =
  load('game/store/actions/game-actions');
const { ResolvePromptAction } =
  load('game/store/actions/resolve-prompt-action');

/**
 * Honest staged board: a physically held original-field Megaton, genuine
 * Regidrago V with DDE+Grass, real Store Item/turn/attack dispatch. Unlike
 * source games, the board and hand are constructed, not naturally dealt.
 * @param {0|1} megatonSeat The physical player holding the source Item.
 * @param {boolean} spendMegaton Whether the owner plays it before passing.
 * @param {boolean} useToolCorrection Opt-in Tool-effect compatibility hook.
 * @returns {object} Actual pending-prompt and physical-zone action receipts.
 */
function runRegidragoDenial(megatonSeat, spendMegaton, useToolCorrection) {
  const manager = initializeCards();
  const card = printing => {
    const instance = manager.getCardByName(printing);
    assert.ok(instance, 'Missing pinned card ' + printing);
    return instance;
  };
  const state = new State();
  state.players = [new Player(), new Player()];
  const source = state.players[megatonSeat];
  const dragon = state.players[1 - megatonSeat];
  source.id = 101;
  dragon.id = 202;
  state.activePlayer = megatonSeat;
  state.turn = 4;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  source.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  dragon.active.cards.push(card('Regidrago V SIT'));
  const doubleDragon = card('Double Dragon Energy ROS');
  const basicGrass = card('Grass Energy SVE');
  dragon.active.cards.push(doubleDragon, basicGrass);
  dragon.active.energies.cards.push(doubleDragon, basicGrass);
  const megaton = card('Megaton Blower SSP');
  source.hand.cards.push(megaton);
  for (const p of state.players) {
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
    p.deck.cards.push(card('Psychic Energy SVE'));
    p.deck.cards.push(card('Psychic Energy SVE'));
  }
  const store = new Store({ onStateChange() {} });
  store.state = state;
  const restored = useToolCorrection ? installMegatonBlowerHook() : null;
  let megatonError = null;
  let passError = null;
  let attackError = null;
  let guardAudit = null;
  let transitionPrompts = 0;
  try {
    const execution = withMegatonNoEffectRootGuard(() => {
      if (spendMegaton) {
        try {
          store.dispatch(new PlayCardAction(source.id, 0, {
            player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
          }));
        } catch (error) {
          megatonError = String(error?.message ?? error);
        }
      }
      try {
        store.dispatch(new PassTurnAction(source.id));
        while (store.state.phase !== GamePhase.PLAYER_TURN ||
               store.state.activePlayer !== 1 - megatonSeat) {
          const pending = store.state.prompts.find(p => p.result === undefined);
          assert.equal(pending?.constructor.name, 'WaitPrompt',
            'Only owner-independent turn transition Waits expected');
          store.dispatch(new ResolvePromptAction(pending.id, null));
          transitionPrompts++;
          assert.ok(transitionPrompts <= 7, 'Turn must progress');
        }
      } catch (error) {
        passError = String(error?.message ?? error);
      }
      if (passError === null) {
        try {
          store.dispatch(new AttackAction(dragon.id, 'Dragon Laser'));
        } catch (error) {
          attackError = String(error?.message ?? error);
        }
      }
    });
    guardAudit = execution.audit;
  } finally {
    if (restored) restored();
  }

  const currentSource = store.state.players.find(p => p.id === source.id);
  const currentDragon = store.state.players.find(p => p.id === dragon.id);
  return {
    megatonSeat, spendMegaton, useToolCorrection,
    megatonError, passError, attackError,
    guardAudit, transitionPrompts,
    ownerDamage: currentSource.active.damage,
    dragonAttached: currentDragon.active.energies.cards.map(c => c.fullName).sort(),
    doubleDragonDiscarded: currentDragon.discard.cards.some(c =>
      c.fullName === 'Double Dragon Energy ROS'),
    megatonDiscarded: currentSource.discard.cards.some(c =>
      c.fullName === 'Megaton Blower SSP'),
    sourcePrizes: currentSource.prizes.length,
    dragonPrizes: currentDragon.prizes.length,
    finalPhase: store.state.phase,
    unresolvedPrompts: store.state.prompts.filter(p => p.result === undefined)
      .map(p => p.constructor?.name ?? 'unknown')
  };
}

test('source Megaton removes DDE and denies paid Regidrago Dragon Laser after turn pass', () => {
  for (const seat of [0, 1]) {
    const control = runRegidragoDenial(seat, false, true);
    const treated = runRegidragoDenial(seat, true, true);
    console.log('AGENT1_MEGATON_REGIDRAGO_ENERGY_DENIAL ' +
      JSON.stringify({ control, treated }));
    assert.equal(control.megatonError, null);
    assert.equal(treated.megatonError, null);
    assert.equal(control.passError, null);
    assert.equal(treated.passError, null);
    assert.equal(control.attackError, null);
    assert.equal(control.ownerDamage, 130);
    assert.deepEqual(control.dragonAttached,
      ['Double Dragon Energy ROS', 'Grass Energy SVE']);
    assert.equal(control.doubleDragonDiscarded, false);
    assert.equal(control.megatonDiscarded, false);
    assert.match(treated.attackError, /NOT_ENOUGH_ENERGY/);
    assert.equal(treated.ownerDamage, 0);
    assert.deepEqual(treated.dragonAttached, ['Grass Energy SVE']);
    assert.equal(treated.doubleDragonDiscarded, true);
    assert.equal(treated.megatonDiscarded, true);
    assert.equal(treated.guardAudit.rejectedProvenNoEffect, 0);
    assert.equal(treated.guardAudit.inspectedMegatonActions, 1);
    assert.deepEqual(control.unresolvedPrompts, []);
    assert.deepEqual(treated.unresolvedPrompts, []);
  }
});

module.exports = { runRegidragoDenial };
