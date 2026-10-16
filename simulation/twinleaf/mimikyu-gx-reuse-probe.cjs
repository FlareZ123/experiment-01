'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {installMimikyuNonGxCopycatHook} = require('./copycat-compat.cjs');
const {installDeclaredCopyHistoryHook} = require('./copycat-declared-history-hook.cjs');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(root, name));

/**
 * Inspect the pinned GX reuse guard with a declared Mimikyu Copycat that
 * borrows Regidrago Apex Dragon and then attempts discarded Timeless-GX.
 * One scenario starts with the once-per-game GX allowance spent already.
 * This is diagnostic telemetry, not an assertion of expected rollback.
 *
 * @param {boolean} alreadyUsed
 * @returns {object}
 */
function inspectGxReuse(alreadyUsed) {
  const manager = initializeCards();
  const [mimikyu, regidrago, dialga, psychicA, psychicB] =
    ['Mimikyu GRI','Regidrago VSTAR SIT','Dialga-GX UPR',
      'Psychic Energy SVE','Psychic Energy SVE']
      .map(name => manager.getCardByName(name));
  assert.ok([mimikyu, regidrago, dialga, psychicA, psychicB].every(Boolean));

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
    a.name = 'mimikyu-gx-reuse';
    const b = new Player();
    b.id = 202;
    b.name = 'regidrago-target';
    a.active.cards.push(mimikyu, psychicA, psychicB);
    a.discard.cards.push(dialga);
    a.usedGX = alreadyUsed;
    b.active.cards.push(regidrago);
    state.players = [a, b];
    for (const player of state.players) {
      player.prizes = Array.from({length: 6},
        () => CardList.fromList(['Psychic Energy SVE']));
      player.deck = CardList.fromList(Array(10).fill('Psychic Energy SVE'));
    }
    state.activePlayer = 0;
    state.phase = GamePhase.PLAYER_TURN;
    state.turn = 4;
    state.playerLastAttack[b.id] = {
      attack: regidrago.attacks[0], sourceCard: regidrago
    };

    store.dispatch(new AttackAction(a.id, 'Copycat'));
    const prompt = state.prompts.find(p =>
      p.constructor.name === 'ChooseAttackPrompt' && p.result === undefined);
    assert.ok(prompt);
    let errorName = null;
    let errorMessage = null;
    try {
      store.dispatch(new ResolvePromptAction(prompt.id, dialga.attacks[2]));
    } catch (error) {
      errorName = error.constructor?.name || String(error);
      errorMessage = String(error.message);
    }

    return {
      alreadyUsed, errorName, errorMessage,
      damageAfterPrompt: b.active.damage,
      usedGX: a.usedGX,
      extraTurnArmed: a.usedTurnSkip === true,
      persistedAttack: state.playerLastAttack[a.id]?.attack?.name ?? null,
      phase: state.phase,
      prompts: state.prompts.map(p => p.constructor.name),
      scope: 'Staged actual AttackAction and asynchronous attack choice'
    };
  } finally {
    restoreHistory();
    restoreCopy();
    clearCopyAttackSessionsForTests();
  }
}

if (require.main === module) {
  process.stdout.write(JSON.stringify({
    unspent: inspectGxReuse(false),
    spent: inspectGxReuse(true)
  }, null, 2) + '\n');
}

module.exports = {inspectGxReuse};
