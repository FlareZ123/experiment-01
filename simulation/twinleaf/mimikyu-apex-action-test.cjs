'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {installMimikyuNonGxCopycatHook} = require('./copycat-compat.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output, name));

/**
 * Exercises a real AttackAction and its asynchronous ChooseAttackPrompt,
 * keeping six occupied Prizes so the engine does not launch sudden death.
 * Prior Apex Dragon use and Energy are staged; this is no legal-match proof.
 * @returns {object} Attack effects and identity telemetry.
 */
function declaredCopycatApexContract() {
  const manager = initializeCards();
  const mimikyu = manager.getCardByName('Mimikyu GRI');
  const regidrago = manager.getCardByName('Regidrago VSTAR SIT');
  const dialga = manager.getCardByName('Dialga-GX UPR');
  const psychic1 = manager.getCardByName('Psychic Energy SVE');
  const psychic2 = manager.getCardByName('Psychic Energy SVE');
  assert.ok(mimikyu && regidrago && dialga && psychic1 && psychic2);

  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {AttackAction} = engine('game/store/actions/game-actions');
  const {ResolvePromptAction} = engine('game/store/actions/resolve-prompt-action');
  const {clearCopyAttackSessionsForTests} =
    engine('game/store/prefabs/copy-attack-delegation');

  clearCopyAttackSessionsForTests();
  const restore = installMimikyuNonGxCopycatHook();
  try {
    const store = new Store({onStateChange() {}});
    const state = store.state;
    const a = new Player();
    a.id = 101;
    a.name = 'declared-copycat-fixture';
    const b = new Player();
    b.id = 202;
    b.name = 'prior-apex-fixture';
    a.active.cards.push(mimikyu, psychic1, psychic2);
    a.discard.cards.push(dialga);
    b.active.cards.push(regidrago);
    state.players = [a, b];
    for (const player of state.players) {
      player.prizes = Array.from({length: 6},
        () => CardList.fromList(['Psychic Energy SVE']));
      player.deck = CardList.fromList(Array(12).fill('Psychic Energy SVE'));
    }
    state.activePlayer = 0;
    state.phase = GamePhase.PLAYER_TURN;
    state.turn = 4;
    state.playerLastAttack[b.id] = {
      attack: regidrago.attacks[0], sourceCard: regidrago
    };

    store.dispatch(new AttackAction(a.id, 'Copycat'));
    const selection = state.prompts.find(p =>
      p.constructor.name === 'ChooseAttackPrompt' && p.result === undefined);
    assert.ok(selection, 'Declared Copycat must reach Apex Dragon target choice');
    assert.ok(selection.cards.includes(dialga));
    const afterDeclaration = state.playerLastAttack[a.id]?.attack?.name;
    store.dispatch(new ResolvePromptAction(selection.id, dialga.attacks[2]));

    assert.equal(b.active.damage, 150);
    assert.equal(a.usedGX, true);
    assert.equal(a.usedTurnSkip, true);
    assert.equal(regidrago.attacks[0].copycatAttack, true);
    const actualLastAttack = state.playerLastAttack[a.id]?.attack?.name;
    return {
      declaredAttack: 'Copycat',
      lastAttackAfterDeclaration: afterDeclaration,
      lastAttackAfterChoice: actualLastAttack,
      damage: b.active.damage,
      usedGX: a.usedGX,
      bonusTurn: a.usedTurnSkip,
      promptTypes: state.prompts.map(p => p.constructor.name),
      scope: 'Staged real AttackAction with Energy; no full-game/legal-deck evidence'
    };
  } finally {
    restore();
    clearCopyAttackSessionsForTests();
  }
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(declaredCopycatApexContract(), null, 2) + '\n');
}

module.exports = {declaredCopycatApexContract};
