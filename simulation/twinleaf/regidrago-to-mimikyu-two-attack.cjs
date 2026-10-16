'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {installMimikyuNonGxCopycatHook} = require('./copycat-compat.cjs');
const {installDeclaredCopyHistoryHook} = require('./copycat-declared-history-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output, name));

/**
 * Reproduce *two actual declared attacks across a turn transition*:
 *
 * 1. Regidrago VSTAR declares Apex Dragon, choosing discard Dratini Tail Snap.
 * 2. Opposing Mimikyu GRI on the next turn declares Copycat, legally copying
 *    the immediately preceding non-GX Apex Dragon, then choosing its own
 *    discarded Dialga-GX Timeless-GX and using that copied GX effect.
 *
 * Three specific upstream gaps require two opt-in, reversible research hooks:
 * the copied Apex copy-tag gate, and both copied attacks' late history writes.
 * The start board is staged with energies and direct VSTAR, not legal setup.
 *
 * @returns {object} Full declared-action and prompt trace evidence.
 */
function regidragoToMimikyuTwoAttackContract() {
  const manager = initializeCards();
  const names = [
    'Mimikyu GRI', 'Regidrago VSTAR SIT', 'Dratini OBF', 'Dialga-GX UPR',
    'Psychic Energy SVE', 'Psychic Energy SVE',
    'Grass Energy SVE', 'Grass Energy SVE', 'Fire Energy SVE'
  ];
  const [mimikyu, regidrago, dratini, dialga, p1, p2, g1, g2, fire] =
    names.map(name => manager.getCardByName(name));
  assert.ok([mimikyu, regidrago, dratini, dialga, p1, p2, g1, g2, fire]
    .every(Boolean));
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {AttackAction} = engine('game/store/actions/game-actions');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const {clearCopyAttackSessionsForTests} =
    engine('game/store/prefabs/copy-attack-delegation');

  clearCopyAttackSessionsForTests();
  const restoreCopy = installMimikyuNonGxCopycatHook();
  const restoreHistory = installDeclaredCopyHistoryHook({
    mimikyu: true, regidrago: true
  });
  try {
    const store = new Store({onStateChange() {}});
    const state = store.state;
    const a = new Player();
    a.id = 101;
    a.name = 'mimikyu-counter';
    const b = new Player();
    b.id = 202;
    b.name = 'regidrago-turn';
    a.active.cards.push(mimikyu, p1, p2);
    a.discard.cards.push(dialga);
    b.active.cards.push(regidrago, g1, g2, fire);
    b.discard.cards.push(dratini);
    state.players = [a, b];
    for (const player of state.players) {
      player.prizes = Array.from({length: 6},
        () => CardList.fromList(['Grass Energy SVE']));
      player.deck = CardList.fromList(Array(12).fill('Grass Energy SVE'));
    }
    state.activePlayer = 1;
    state.phase = GamePhase.PLAYER_TURN;
    state.turn = 4;

    store.dispatch(new AttackAction(b.id, 'Apex Dragon'));
    const regidragoPrompt = state.prompts.find(p =>
      p.constructor.name === 'ChooseAttackPrompt' &&
      p.playerId === b.id && p.result === undefined);
    assert.ok(regidragoPrompt);
    assert.ok(regidragoPrompt.cards.includes(dratini));
    store.dispatch(new ResolvePromptAction(regidragoPrompt.id, dratini.attacks[0]));

    assert.equal(a.active.damage, 20, 'Apex copied Dratini Tail Snap');
    assert.equal(state.playerLastAttack[b.id]?.attack?.name, 'Apex Dragon',
      'Regidrago must retain printed Apex Dragon attack history');

    let resolvedWaits = 0;
    while (state.activePlayer !== 0 || state.phase !== GamePhase.PLAYER_TURN) {
      const wait = state.prompts.find(p =>
        p.constructor.name === 'WaitPrompt' && p.result === undefined);
      assert.ok(wait, 'Expected a real pending turn-transition WaitPrompt');
      store.dispatch(new ResolvePromptAction(wait.id, null));
      resolvedWaits += 1;
      assert.ok(resolvedWaits <= 8, 'Unexpected repeated turn waits');
    }

    store.dispatch(new AttackAction(a.id, 'Copycat'));
    assert.equal(state.playerLastAttack[a.id]?.attack?.name, 'Copycat');
    const mimikyuPrompt = state.prompts.find(p =>
      p.constructor.name === 'ChooseAttackPrompt' &&
      p.playerId === a.id && p.result === undefined);
    assert.ok(mimikyuPrompt,
      'Mimikyu must legally copy preceding printed Apex Dragon');
    assert.ok(mimikyuPrompt.cards.includes(dialga));
    store.dispatch(new ResolvePromptAction(mimikyuPrompt.id, dialga.attacks[2]));

    assert.equal(b.active.damage, 150, 'Copied Timeless-GX attack damage');
    assert.equal(a.usedGX, true, 'Copied GX allowance is consumed');
    assert.equal(a.usedTurnSkip, true, 'Copied Timeless-GX extra turn is armed');
    assert.equal(state.playerLastAttack[a.id]?.attack?.name, 'Copycat');

    return {
      regidrago: {
        declared: 'Apex Dragon',
        copied: 'Tail Snap',
        persistedAttack: state.playerLastAttack[b.id]?.attack?.name
      },
      turnAdvanceWaits: resolvedWaits,
      mimikyu: {
        declared: 'Copycat',
        borrowed: 'Apex Dragon',
        nested: 'Timeless-GX',
        persistedAttack: state.playerLastAttack[a.id]?.attack?.name
      },
      damageToMimikyu: a.active.damage,
      damageToRegidrago: b.active.damage,
      mimikyuUsedGX: a.usedGX,
      mimikyuExtraTurnArmed: a.usedTurnSkip,
      phaseAfterMimikyu: state.phase,
      scope: 'Two declared AttackActions and real turn transition, injected boards'
    };
  } finally {
    restoreHistory();
    restoreCopy();
    clearCopyAttackSessionsForTests();
  }
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(regidragoToMimikyuTwoAttackContract(), null, 2) + '\n');
}

module.exports = {regidragoToMimikyuTwoAttackContract};
