'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {installMimikyuNonGxCopycatHook} = require('./copycat-compat.cjs');
const {installDeclaredCopyHistoryHook} = require('./copycat-declared-history-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName @returns {any} */
const load = moduleName => require(path.join(output, moduleName));

/**
 * Stage two real players and attack declarations, with a copied spent-GX
 * selection rejected and then cancelled immediately before the opponent's
 * Copycat turn. Only deck setup and starting board are injected.
 *
 * @param {boolean} fixDeclHistory
 * @returns {{priorAttackAfterCancel:string,priorAttackAfterTurn:string,copycatHasPrompt:boolean,damageToRegidrago:number,turnWaitPrompts:number}}
 */
function playRejectedGxThenCopycat(fixDeclHistory) {
  const manager = initializeCards();
  const get = name => manager.getCardByName(name);
  const names = [
    'Mimikyu GRI', 'Regidrago VSTAR SIT', 'Dialga-GX UPR',
    'Dratini OBF', 'Psychic Energy SVE', 'Psychic Energy SVE',
    'Grass Energy SVE', 'Grass Energy SVE', 'Fire Energy SVE'
  ];
  const [mimikyu, regidrago, dialga, dratini, psychic1, psychic2,
    grass1, grass2, fire] = names.map(get);
  assert.ok(names.every((name, i) => [
    mimikyu, regidrago, dialga, dratini, psychic1, psychic2,
    grass1, grass2, fire
  ][i]), 'Pinned source print unavailable');

  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {CardList} = load('game/store/state/card-list');
  const {GamePhase} = load('game/store/state/state');
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');
  const {clearCopyAttackSessionsForTests} =
    load('game/store/prefabs/copy-attack-delegation');

  clearCopyAttackSessionsForTests();
  const restoreMimikyu = installMimikyuNonGxCopycatHook();
  const restoreHistory = fixDeclHistory ?
    installDeclaredCopyHistoryHook({regidrago: true, mimikyu: false}) :
    () => {};

  try {
    const store = new Store({onStateChange() {}});
    const state = store.state;
    const a = new Player();
    a.id = 101;
    a.name = 'Mimikyu';
    const b = new Player();
    b.id = 202;
    b.name = 'Regidrago';
    a.active.cards.push(mimikyu, psychic1, psychic2);
    a.discard.cards.push(dratini);
    b.active.cards.push(regidrago, grass1, grass2, fire);
    b.discard.cards.push(dialga);
    b.usedGX = true;
    state.players = [a, b];

    for (const player of state.players) {
      player.prizes = Array.from({length: 6},
        () => CardList.fromList(['Grass Energy SVE']));
      player.deck = CardList.fromList(Array(12).fill('Grass Energy SVE'));
    }
    state.activePlayer = 1;
    state.phase = GamePhase.PLAYER_TURN;
    state.turn = 4;

    const pendingCopyFor = player => state.prompts.find(p =>
      p.result === undefined && p.constructor.name === 'ChooseAttackPrompt' &&
      p.playerId === player.id);

    store.dispatch(new AttackAction(b.id, 'Apex Dragon'));
    assert.equal(state.playerLastAttack[b.id].attack.name, 'Apex Dragon');
    const first = pendingCopyFor(b);
    assert.ok(first);
    store.dispatch(new ResolvePromptAction(first.id, dialga.attacks[2]));
    const retry = pendingCopyFor(b);
    assert.ok(retry && retry.id !== first.id);
    store.dispatch(new ResolvePromptAction(retry.id, null));
    const priorAttackAfterCancel = state.playerLastAttack[b.id]?.attack?.name;
    assert.equal(b.usedGX, true);
    assert.equal(Boolean(b.usedTurnSkip), false);
    assert.equal(a.active.damage, 0);

    let turnWaitPrompts = 0;
    while (state.activePlayer !== 0 || state.phase !== GamePhase.PLAYER_TURN) {
      const wait = state.prompts.find(p =>
        p.constructor.name === 'WaitPrompt' && p.result === undefined);
      assert.ok(wait, 'Actual Regidrago end-of-turn WaitPrompt expected');
      store.dispatch(new ResolvePromptAction(wait.id, null));
      turnWaitPrompts += 1;
      assert.ok(turnWaitPrompts <= 8);
    }

    const priorAttackAfterTurn = state.playerLastAttack[b.id]?.attack?.name;
    store.dispatch(new AttackAction(a.id, 'Copycat'));
    const prompt = pendingCopyFor(a);
    const copycatHasPrompt = Boolean(prompt);
    if (prompt) {
      assert.ok(prompt.cards.includes(dratini));
      store.dispatch(new ResolvePromptAction(prompt.id, dratini.attacks[0]));
    }
    return {
      priorAttackAfterCancel, priorAttackAfterTurn,
      copycatHasPrompt,
      damageToRegidrago: b.active.damage,
      turnWaitPrompts
    };
  } finally {
    restoreHistory();
    restoreMimikyu();
    clearCopyAttackSessionsForTests();
  }
}

function compareGxDeniedCounterline() {
  const unpatched = playRejectedGxThenCopycat(false);
  const restored = playRejectedGxThenCopycat(true);
  assert.equal(unpatched.priorAttackAfterTurn, 'Timeless-GX');
  assert.equal(unpatched.copycatHasPrompt, false);
  assert.equal(unpatched.damageToRegidrago, 0);
  assert.equal(restored.priorAttackAfterTurn, 'Apex Dragon');
  assert.equal(restored.copycatHasPrompt, true);
  assert.equal(restored.damageToRegidrago, 20);
  return {
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    unpatched, restored,
    scope: 'Two actual declared attacks across a turn transition, injected established boards and opt-in Mimikyu compatibility'
  };
}

if (require.main === module) {
  console.log('GX_DENIED_COPYCAT_COUNTERLINE',
    JSON.stringify(compareGxDeniedCounterline(), null, 2));
}

module.exports = {compareGxDeniedCounterline};
