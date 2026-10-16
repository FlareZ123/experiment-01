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
function declaredCopycatApexContract(correctHistory = false, fairyZone = false, printedHpKo = false) {
  const manager = initializeCards();
  const mimikyu = manager.getCardByName('Mimikyu GRI');
  const regidrago = manager.getCardByName('Regidrago VSTAR SIT');
  const dialga = manager.getCardByName('Dialga-GX UPR');
  const clefairy = fairyZone ? manager.getCardByName("Lillie's Clefairy ex JTG") : null;
  const dratini = printedHpKo ? manager.getCardByName('Dratini OBF') : null;
  const psychic1 = manager.getCardByName('Psychic Energy SVE');
  const psychic2 = manager.getCardByName('Psychic Energy SVE');
  assert.ok(mimikyu && regidrago && dialga && psychic1 && psychic2);
  if (fairyZone) assert.ok(clefairy);
  if (printedHpKo) assert.ok(fairyZone && dratini);

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
      if (!printedHpKo) regidrago.hp = 400;
      const slot = new PokemonCardList();
      slot.cards.push(clefairy);
      a.bench.push(slot);
      if (printedHpKo) {
        const spareOpponent = new PokemonCardList();
        spareOpponent.cards.push(dratini);
        b.bench.push(spareOpponent);
      }
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

    if (!printedHpKo) assert.equal(b.active.damage, fairyZone ? 300 : 150);
    assert.equal(a.usedGX, true);
    assert.equal(a.usedTurnSkip, true);
    assert.equal(regidrago.attacks[0].copycatAttack, true);
    const beforeKoWaits = printedHpKo ? {
      damage: b.active.damage,
      regidragoInDiscard: b.discard.cards.includes(regidrago),
      remainingPrizeCards: a.prizes.filter(p => p.cards.length > 0).length,
      pendingPrompts: state.prompts.filter(p => p.result === undefined)
        .map(p => p.constructor.name)
    } : null;
    let koWaitPromptsResolved = 0;
    if (printedHpKo) {
      while (true) {
        const wait = state.prompts.find(p =>
          p.constructor.name === 'WaitPrompt' && p.result === undefined);
        if (!wait) break;
        store.dispatch(new ResolvePromptAction(wait.id, null));
        koWaitPromptsResolved++;
        assert.ok(koWaitPromptsResolved <= 10,
          'Unexpected repeated pending WaitPrompts on printed-HP KO');
      }
    }
    let koPrizePromptsResolved = 0;
    let koPromotionPromptsResolved = 0;
    let afterKoInitialWaits = null;
    if (printedHpKo) {
      afterKoInitialWaits = {
        regidragoInDiscard: b.discard.cards.includes(regidrago),
        remainingPrizeCards: a.prizes.filter(p => p.cards.length > 0).length,
        pendingPrompts: state.prompts.filter(p => p.result === undefined)
          .map(p => p.constructor.name)
      };
      assert.equal(afterKoInitialWaits.regidragoInDiscard, true);
      for (let i = 0; i < 12; i++) {
        const pending = state.prompts.find(p => p.result === undefined);
        if (!pending) break;
        if (pending.constructor.name === 'ChoosePrizePrompt') {
          assert.equal(pending.playerId, a.id);
          assert.equal(pending.options.count, 2);
          const chosen = a.prizes.filter(p => p.cards.length > 0)
            .slice(0, pending.options.count);
          assert.equal(chosen.length, 2);
          store.dispatch(new ResolvePromptAction(pending.id, chosen));
          koPrizePromptsResolved++;
        } else if (pending.constructor.name === 'ChoosePokemonPrompt') {
          assert.equal(pending.playerId, b.id);
          const replacement = b.bench.find(p => p.cards.length > 0);
          assert.ok(replacement?.cards.includes(dratini));
          store.dispatch(new ResolvePromptAction(pending.id, [replacement]));
          koPromotionPromptsResolved++;
        } else if (pending.constructor.name === 'WaitPrompt') {
          store.dispatch(new ResolvePromptAction(pending.id, null));
          koWaitPromptsResolved++;
        } else {
          assert.fail('Unrecognized pending KO prompt: ' + pending.constructor.name);
        }
      }
      assert.equal(b.discard.cards.includes(regidrago), true);
      assert.equal(a.prizes.filter(p => p.cards.length > 0).length, 4,
        'Printed two-Prize Regidrago VSTAR should award two Prizes');
      assert.equal(b.active.getPokemonCard(), dratini,
        'Opponent spare Basic should be promoted after the KO');
      assert.equal(koPrizePromptsResolved, 1);
      assert.equal(koPromotionPromptsResolved, 1);
    }
    const actualLastAttack = state.playerLastAttack[a.id]?.attack?.name;
    assert.equal(afterDeclaration, 'Copycat',
      'Printed attack identity must be recorded at declaration');
    assert.equal(actualLastAttack, correctHistory ? 'Copycat' : 'Timeless-GX',
      'Real prompt resolution must match the controlled history behavior');
    return {
      correctedHistory: correctHistory,
      fairyZone,
      syntheticDefenderHp: fairyZone && !printedHpKo ? 400 : 280,
      printedHpKo,
      koTelemetry: printedHpKo ? {
        printedRegidragoHp: regidrago.hp,
        beforeKoWaits,
        koWaitPromptsResolved,
        koPrizePromptsResolved,
        koPromotionPromptsResolved,
        afterKoInitialWaits,
        phaseAfterKoWaits: state.phase,
        turnAfterKoWaits: state.turn,
        regidragoInDiscard: b.discard.cards.includes(regidrago),
        remainingPrizeCards: a.prizes.filter(p => p.cards.length > 0).length,
        opponentActive: b.active.getPokemonCard()?.fullName ?? null,
        opponentBench: b.bench.map(p => p.getPokemonCard()?.fullName ?? null),
        pendingPrompts: state.prompts.filter(p => p.result === undefined)
          .map(p => p.constructor.name)
      } : null,
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
  const printedKo = process.argv.includes('--printed-ko') ?
    declaredCopycatApexContract(true, true, true) : null;
  process.stdout.write(JSON.stringify({baseline, corrected, fairyZone, printedKo}, null, 2) + '\n');
}

module.exports = {declaredCopycatApexContract};
