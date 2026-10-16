'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installMimikyuNonGxCopycatHook } = require('./copycat-compat.cjs');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
function engine(modulePath) {
  return require(path.join(root, modulePath));
}

/**
 * Isolated, pinned-engine test of the Aichi champion Mimikyu GRI 58 line.
 * Board state and previous declared attack are injected to avoid dependence
 * on any bot decision policy. This does not demonstrate legal setup, Energy
 * payment, competitive play or a matchup win rate.
 *
 * @param {boolean} hooked Apply research-only compatibility hook.
 * @returns {object} Minimal machine-readable effect-resolution evidence.
 */
function mimikyuApexContract(hooked) {
  const manager = initializeCards();
  const mimikyu = manager.getCardByName('Mimikyu GRI');
  const regidrago = manager.getCardByName('Regidrago VSTAR SIT');
  const dialga = manager.getCardByName('Dialga-GX UPR');
  const opponentDiscardDragon = manager.getCardByName('Dratini OBF');
  assert.ok(mimikyu && regidrago && dialga && opponentDiscardDragon,
    'Expected pinned Aichi-card definitions');
  assert.equal(mimikyu.attacks[1].name, 'Copycat');
  assert.equal(regidrago.attacks[0].name, 'Apex Dragon');
  assert.equal(dialga.attacks[2].name, 'Timeless-GX');
  assert.equal(regidrago.attacks[0].copycatAttack, true);
  assert.equal(dialga.attacks[2].gxAttack, true);

  const { Store } = engine('game/store/store');
  const { Player } = engine('game/store/state/player');
  const { CardList } = engine('game/store/state/card-list');
  const { GamePhase } = engine('game/store/state/state');
  const { AttackEffect } = engine('game/store/effects/game-effects');
  const { ResolvePromptAction } =
    engine('game/store/actions/resolve-prompt-action');
  const { clearCopyAttackSessionsForTests } =
    engine('game/store/prefabs/copy-attack-delegation');

  clearCopyAttackSessionsForTests();
  const restore = hooked ? installMimikyuNonGxCopycatHook() : () => {};
  try {
    const store = new Store({onStateChange() {}});
    const state = store.state;
    const a = new Player();
    a.id = 101;
    a.name = 'mimikyu-fixture';
    const b = new Player();
    b.id = 202;
    b.name = 'regidrago-fixture';
    state.players = [a, b];
    // A zero-Prize fixture triggers Twinleaf sudden death in checkState,
    // which resets usedGX after Timeless-GX has correctly marked it spent.
    // Keep both players in an ordinary unfinished game during prompt dispatch.
    for (const player of state.players) {
      player.prizes = Array.from({length: 6},
        () => CardList.fromList(['Dratini OBF']));
      player.deck = CardList.fromList(Array(10).fill('Dratini OBF'));
    }
    state.activePlayer = 0;
    state.phase = GamePhase.ATTACK;
    state.turn = 4;
    a.active.cards.push(mimikyu);
    a.discard.cards.push(dialga);
    b.active.cards.push(regidrago);
    b.discard.cards.push(opponentDiscardDragon);
    state.playerLastAttack[b.id] = {
      attack: regidrago.attacks[0],
      sourceCard: regidrago
    };

    const nestedCopyTrace = [];
    const originalDialgaReducer = dialga.reduceEffect;
    dialga.reduceEffect = function (delegatedStore, delegatedState, delegatedEffect) {
      nestedCopyTrace.push({
        stage: 'dialga-reducer-enter',
        attack: delegatedEffect.attack?.name,
        copiedCardName: this.name,
        visibleAttackNames: this.attacks.map(attack => attack.name)
      });
      const output = originalDialgaReducer.call(this, delegatedStore, delegatedState, delegatedEffect);
      nestedCopyTrace.push({
        stage: 'dialga-reducer-exit',
        usedGX: a.usedGX,
        extraTurn: a.usedTurnSkip
      });
      return output;
    };
    const copycat = new AttackEffect(a, b, mimikyu.attacks[1]);
    copycat.source = a.active;
    mimikyu.reduceEffect(store, state, copycat);
    const choice = state.prompts.find(
      prompt => prompt.constructor.name === 'ChooseAttackPrompt'
    );
    if (!hooked) {
      assert.equal(choice, undefined,
        'Pinned engine should expose the suspected silent-copy rejection');
      assert.equal(b.active.damage, 0);
      return {
        hooked: false, delegated: false, opponentDamage: b.active.damage,
        observed: 'Source-level copy metadata rejection reproduced'
      };
    }

    assert.ok(choice,
      'Mimikyu Copycat must offer attacks from own discarded Dragon');
    assert.ok(choice.cards.includes(dialga),
      'Dialga-GX from Mimikyu discard must be selectable');
    store.dispatch(new ResolvePromptAction(choice.id, dialga.attacks[2]));
    assert.equal(b.active.damage, 150,
      'Copied Timeless-GX must inflict 150 before Weakness/Resistance');
    process.stdout.write(JSON.stringify({
      phase: 'after Timeless-GX prompt resolution',
      damage: b.active.damage,
      usedGX: a.usedGX,
      usedTurnSkip: a.usedTurnSkip,
      nestedCopyTrace,
      copiedLastAttack: state.playerLastAttack?.[a.id]?.attack?.name,
      promptTypes: state.prompts.map(prompt => prompt.constructor.name)
    }) + '\\n');
    assert.equal(state.players[0], a, 'Fixture player identity must remain stable');
    assert.ok(!state.logs.some(log => log.message === 'LOG_SUDDEN_DEATH'),
      'Synthetic board must not enter sudden death');
    assert.equal(a.usedGX, true, 'Copied GX effect must consume GX marker');
    assert.equal(a.usedTurnSkip, true,
      'Copied Timeless-GX must grant the next turn');
    assert.equal(regidrago.attacks[0].copycatAttack, true,
      'Pinned last-attack metadata must be restored');
    return {
      hooked: true, delegated: true, opponentDamage: b.active.damage,
      usedGX: a.usedGX, extraTurnArmed: a.usedTurnSkip,
      selectedAttack: dialga.attacks[2].name,
      engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      scope: 'Injected reducer fixture only; no legal setup or bot decisions'
    };
  } finally {
    restore();
    clearCopyAttackSessionsForTests();
  }
}

if (require.main === module) {
  const baseline = mimikyuApexContract(false);
  const hooked = mimikyuApexContract(true);
  process.stdout.write(JSON.stringify({baseline, hooked}, null, 2) + '\n');
}

module.exports = { mimikyuApexContract };
