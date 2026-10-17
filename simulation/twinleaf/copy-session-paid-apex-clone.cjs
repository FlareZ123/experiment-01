'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {installStateScopedCopySessionLoader} =
  require('./copied-session-state-scope-hook.cjs');

const restoreLoader = installStateScopedCopySessionLoader();
try {
  const {preparedRegidrago} = require('./apex-attack-action.cjs');
  const {initializeCards} = require('./headless.cjs');
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const {AttackAction,PassTurnAction} = require(path.join(root,
    'game/store/actions/game-actions'));
  const {ResolvePromptAction} = require(path.join(root,
    'game/store/actions/resolve-prompt-action'));
  const board = preparedRegidrago();
  board.attachFire();
  const goodra = initializeCards().getCardByName('Hisuian Goodra VSTAR LOR');
  assert.ok(goodra);
  board.attacking.discard.cards.push(goodra);
  board.store.dispatch(new AttackAction(board.attacking.id,'Apex Dragon'));
  const prompt = board.state.prompts.find(p =>
    p.constructor.name === 'ChooseAttackPrompt' && p.result === undefined);
  assert.ok(prompt && prompt.cards.includes(goodra));
  board.store.dispatch(new ResolvePromptAction(prompt.id,goodra.attacks[0]));
  assert.equal(board.defending.active.damage,200);
  assert.equal(board.attacking.active.damageReductionNextTurn,80);
  let waits = 0;
  while (true) {
    const wait = board.state.prompts.find(p =>
      p.constructor.name === 'WaitPrompt' && p.result === undefined);
    if (!wait) break;
    board.store.dispatch(new ResolvePromptAction(wait.id,null));
    waits++;
    assert.ok(waits < 12,'Unexpected attack WaitPrompt chain');
  }
  console.log('PAID_APEX_GOODRA',JSON.stringify({
    copiedDamage:board.defending.active.damage,
    reduction:board.attacking.active.damageReductionNextTurn,
    waits,activePlayer:board.state.activePlayer,phase:board.state.phase,
    pending:board.state.prompts.filter(p => p.result === undefined)
      .map(p => p.constructor.name)
  },null,2));
} finally {
  restoreLoader();
}
