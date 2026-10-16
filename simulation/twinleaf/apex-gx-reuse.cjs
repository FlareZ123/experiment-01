'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {preparedRegidrago} = require('./apex-attack-action.cjs');

const compiledRoot = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} name @returns {any} */
function load(name) {
  return require(path.join(compiledRoot, name));
}

/**
 * Prepare a paid Apex Dragon, with only the source-registered Dialga-GX
 * available as a discard-pile Dragon. This deliberately injects an
 * established board; it does not simulate search or an ordinary game start.
 *
 * @param {boolean} usedGX
 * @returns {{board: ReturnType<typeof preparedRegidrago>, dialga: any}}
 */
function prepare(usedGX) {
  const board = preparedRegidrago();
  board.attachFire();
  const dialga = initializeCards().getCardByName('Dialga-GX UPR');
  assert.ok(dialga);
  board.attacking.discard.cards = [dialga];
  board.attacking.usedGX = usedGX;
  return {board, dialga};
}

/** @param {any} state @returns {any} */
function nextAttackPrompt(state) {
  return state.prompts.find(p =>
    p.constructor.name === 'ChooseAttackPrompt' && p.result === undefined);
}

/**
 * Characterize the pinned engine's GX marker enforcement through an actual
 * paid Apex Dragon AttackAction and subsequent copied-attack prompt.
 */
function testCopiedGxReuse() {
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {clearCopyAttackSessionsForTests} =
    load('game/store/prefabs/copy-attack-delegation');

  clearCopyAttackSessionsForTests();
  const fresh = prepare(false);
  fresh.board.store.dispatch(new AttackAction(101, 'Apex Dragon'));
  const freshPrompt = nextAttackPrompt(fresh.board.state);
  assert.ok(freshPrompt, 'Paid Apex Dragon must offer discarded Dialga-GX attacks');
  fresh.board.store.dispatch(new ResolvePromptAction(
    freshPrompt.id, fresh.dialga.attacks[2]));
  assert.equal(fresh.board.defending.active.damage, 150);
  assert.equal(fresh.board.attacking.usedGX, true);
  assert.equal(fresh.board.attacking.usedTurnSkip, true);

  clearCopyAttackSessionsForTests();
  const spent = prepare(true);
  spent.board.store.dispatch(new AttackAction(101, 'Apex Dragon'));
  const firstPrompt = nextAttackPrompt(spent.board.state);
  assert.ok(firstPrompt);
  spent.board.store.dispatch(new ResolvePromptAction(
    firstPrompt.id, spent.dialga.attacks[2]));
  assert.equal(spent.board.defending.active.damage, 0,
    'Previously consumed GX attack must not deal copied Timeless-GX damage');
  assert.equal(spent.board.attacking.usedGX, true);
  assert.equal(Boolean(spent.board.attacking.usedTurnSkip), false,
    'An invalid GX reuse must not grant a bonus turn');

  const retryPrompt = nextAttackPrompt(spent.board.state);
  assert.ok(retryPrompt && retryPrompt.id !== firstPrompt.id,
    'After denied GX selection the copied-attack prompt should allow another attack');
  spent.board.store.dispatch(new ResolvePromptAction(
    retryPrompt.id, spent.dialga.attacks[1]));
  assert.equal(spent.board.defending.active.damage, 80,
    'The same Apex Dragon may choose an ordinary copied attack');
  assert.equal(spent.board.attacking.usedGX, true);
  assert.equal(Boolean(spent.board.attacking.usedTurnSkip), false);

  clearCopyAttackSessionsForTests();
  return {
    pinnedEngine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    freshGxDamage: fresh.board.defending.active.damage,
    spentGxAttemptDamage: 0,
    subsequentShredDamage: spent.board.defending.active.damage,
    gxMarkerConsumed: spent.board.attacking.usedGX,
    extraTurnAfterRejectedGx: Boolean(spent.board.attacking.usedTurnSkip),
    scope: 'Paid AttackAction on injected established boards, not matchup strength'
  };
}

if (require.main === module) {
  console.log('APEX_GX_REUSE', JSON.stringify(testCopiedGxReuse(), null, 2));
}

module.exports = {testCopiedGxReuse};
