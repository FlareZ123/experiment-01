'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {installMimikyuNonGxCopycatHook} = require('./copycat-compat.cjs');
const {installMimikyuDeclaredHistoryHook} = require('./copycat-declared-history-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output, name));

/**
 * Exercises a real AttackAction and its asynchronous ChooseAttackPrompt,
 * keeping six occupied Prizes so the engine does not launch sudden death.
 * Prior Apex Dragon use and Energy are staged; this is no legal-match proof.
 * @param {boolean} correctHistory Whether to install the opt-in history repair.
 * @param {boolean} fairyZone Stage Lillie's Clefairy Bench Ability and synthetic high HP for damage inspection.
 * @returns {object} Attack effects and identity telemetry.
 */
function declaredCopycatApexContract(correctHistory = false, fairyZone = false) {
  const manager = initializeCards();
  const mimikyu = manager.getCardByName('Mimikyu GRI');
  const regidrago = manager.getCardByName('Regidrago VSTAR SIT');
  const dialga = manager.getCardByName('Dialga-GX UPR');
  const clefairy = fairyZone ? manager.getCardByName("Lillie's Clefairy ex JTG") : null;
  const psychic1 = manager.getCardByName('Psychic Energy SVE');
  const psychic2 = manager.getCardByName('Psychic Energy SVE');
  assert.ok(mimikyu && regidrago && dialga && psychic1 && psychic2);
  if (fairyZone) assert.ok(clefairy);

  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {AttackAction} = engine('game/store/actions/game-actions');
  const {ResolvePromptAction} = engine('game/store/actions/resolve-prompt-action');
  const {clearCopyAttackSessionsForTests} =
    engine('game/store/prefabs/copy-attack-delegation');

  clearCopyAttackSessionsForTests();
  const restore = installMimikyuNonGxCopycatHook();
  const restoreHistory = correctHistory ? installMimikyuDeclaredHistoryHook() : () => {};
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
    if (fairyZone) {
      // Keep the Dragon alive after x2 damage to inspect damage counters
      // directly. Actual Regidrago VSTAR prints 280 HP, and would be KO'd.
      regidrago.hp = 400;
      const slot = new PokemonCardList();
      slot.cards.push(clefairy);
      a.bench.push(slot);
    }
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

    assert.equal(b.active.damage, fairyZone ? 300 : 150);
    assert.equal(a.usedGX, true);
    assert.equal(a.usedTurnSkip, true);
    assert.equal(regidrago.attacks[0].copycatAttack, true);
    const actualLastAttack = state.playerLastAttack[a.id]?.attack?.name;
    assert.equal(afterDeclaration, 'Copycat',
      'Printed attack identity must be recorded at declaration');
    assert.equal(actualLastAttack, correctHistory ? 'Copycat' : 'Timeless-GX',
      'Real prompt resolution must match the controlled history behavior');
    return {
      correctedHistory: correctHistory,
      fairyZone,
      syntheticDefenderHp: fairyZone ? 400 : 280,
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
    restoreHistory();
    restore();
    clearCopyAttackSessionsForTests();
  }
}

if (require.main === module) {
  const baseline = declaredCopycatApexContract(false);
  const corrected = declaredCopycatApexContract(true);
  const fairyZone = declaredCopycatApexContract(true, true);
  process.stdout.write(JSON.stringify({baseline, corrected, fairyZone}, null, 2) + '\n');
}

module.exports = {declaredCopycatApexContract};
