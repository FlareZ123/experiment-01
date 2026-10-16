'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output, name));

/**
 * Replay the pinned engine's *declared* Apex Dragon AttackAction,
 * resolving either non-GX Tail Snap or GX Timeless-GX from the discard.
 * This is a staged attack board; normal setup/evolution is bypassed.
 *
 * @param {'Tail Snap'|'Timeless-GX'} attackName
 * @returns {object} Declared and persisted attack identities.
 */
function declaredApexHistoryContract(attackName) {
  const manager = initializeCards();
  const regidrago = manager.getCardByName('Regidrago VSTAR SIT');
  const target = manager.getCardByName('Shadow Rider Calyrex V CRE');
  const payload = manager.getCardByName(
    attackName === 'Tail Snap' ? 'Dratini OBF' : 'Dialga-GX UPR'
  );
  const grass1 = manager.getCardByName('Grass Energy SVE');
  const grass2 = manager.getCardByName('Grass Energy SVE');
  const fire = manager.getCardByName('Fire Energy SVE');
  assert.ok(regidrago && target && payload && grass1 && grass2 && fire);
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
  try {
    const store = new Store({onStateChange() {}});
    const state = store.state;
    const a = new Player();
    a.id = 101;
    a.name = 'regidrago-declaration-fixture';
    const b = new Player();
    b.id = 202;
    b.name = 'shadow-rider-target';
    a.active.cards.push(regidrago, grass1, grass2, fire);
    a.discard.cards.push(payload);
    b.active.cards.push(target);
    state.players = [a, b];
    for (const player of state.players) {
      player.prizes = Array.from({length: 6},
        () => CardList.fromList(['Grass Energy SVE']));
      player.deck = CardList.fromList(Array(12).fill('Grass Energy SVE'));
    }
    state.activePlayer = 0;
    state.phase = GamePhase.PLAYER_TURN;
    state.turn = 4;

    store.dispatch(new AttackAction(a.id, 'Apex Dragon'));
    const declaredHistory = state.playerLastAttack[a.id]?.attack?.name;
    assert.equal(declaredHistory, 'Apex Dragon',
      'The printed attack must be recorded at declaration');
    const prompt = state.prompts.find(p =>
      p.constructor.name === 'ChooseAttackPrompt' && p.result === undefined);
    assert.ok(prompt, 'Declared Apex Dragon must select a discarded Dragon');
    assert.ok(prompt.cards.includes(payload));
    const chosen = payload.attacks.find(attack => attack.name === attackName);
    assert.ok(chosen);
    store.dispatch(new ResolvePromptAction(prompt.id, chosen));

    const persistedHistory = state.playerLastAttack[a.id]?.attack?.name;
    const expectedDamage = attackName === 'Tail Snap' ? 20 : 150;
    assert.equal(b.active.damage, expectedDamage);
    assert.equal(a.usedGX, attackName === 'Timeless-GX');
    assert.equal(a.usedTurnSkip === true, attackName === 'Timeless-GX');
    return {
      printedAttack: 'Apex Dragon', selectedPayloadAttack: attackName,
      declaredHistory, persistedHistory, damage: b.active.damage,
      usedGX: a.usedGX, bonusTurn: a.usedTurnSkip === true,
      scope: 'Staged actual AttackAction; 6 occupied prizes; no legal evolution'
    };
  } finally {
    clearCopyAttackSessionsForTests();
  }
}

if (require.main === module) {
  process.stdout.write(JSON.stringify({
    ordinary: declaredApexHistoryContract('Tail Snap'),
    gx: declaredApexHistoryContract('Timeless-GX')
  }, null, 2) + '\n');
}

module.exports = {declaredApexHistoryContract};
