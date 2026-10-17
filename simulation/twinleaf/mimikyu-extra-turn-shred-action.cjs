'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {installMimikyuNonGxCopycatHook} = require('./copycat-compat.cjs');
const {installDeclaredCopyHistoryHook} = require('./copycat-declared-history-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine = name => require(path.join(output, name));

/**
 * A printed-card action fixture for a source-ranked turn-28 opportunity.
 * Source duel and prior Apex Dragon are staged; no played-game claim follows.
 * @param {number} initialDamage - Damage already on Regidrago VSTAR.
 * @returns {object} Bounded mechanical evidence.
 */
function copiedShredAfterSpentGX(initialDamage) {
  const manager = initializeCards();
  const names = ['Mimikyu GRI', 'Regidrago VSTAR SIT', 'Dialga-GX UPR',
    'Dratini OBF', 'Psychic Energy SVE', 'Psychic Energy SVE'];
  const [mimikyu, regidrago, dialga, dratini, psychicA, psychicB] =
    names.map(name => manager.getCardByName(name));
  assert.ok([mimikyu, regidrago, dialga, dratini, psychicA, psychicB].every(Boolean));
  const copycat = mimikyu.attacks.find(attack => attack.name === 'Copycat');
  const apex = regidrago.attacks.find(attack => attack.name === 'Apex Dragon');
  const shred = dialga.attacks.find(attack => attack.name === 'Shred');
  assert.ok(copycat && apex && shred);
  assert.equal(regidrago.hp, 280);
  assert.equal(Number(shred.damage), 80);

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
  const restoreCopy = installMimikyuNonGxCopycatHook();
  const restoreHistory = installDeclaredCopyHistoryHook({mimikyu:true, regidrago:true});
  try {
    const store = new Store({onStateChange() {}});
    const state = store.state;
    const candidate = new Player();
    candidate.id = 101;
    candidate.name = 'rank10-extra-turn-candidate';
    candidate.active.cards.push(mimikyu, psychicA, psychicB);
    candidate.discard.cards.push(dialga);
    candidate.usedGX = true;

    const opponent = new Player();
    opponent.id = 202;
    opponent.name = 'rank10-regidrago';
    opponent.active.cards.push(regidrago);
    opponent.active.damage = initialDamage;
    const spare = new PokemonCardList();
    spare.cards.push(dratini);
    opponent.bench.push(spare);

    state.players = [candidate, opponent];
    for (const player of state.players) {
      player.prizes = Array.from({length:6},
        () => CardList.fromList(['Psychic Energy SVE']));
      player.deck = CardList.fromList(Array(12).fill('Psychic Energy SVE'));
    }
    state.activePlayer = 0;
    state.phase = GamePhase.PLAYER_TURN;
    state.turn = 28;
    state.playerLastAttack[opponent.id] = {attack:apex, sourceCard:regidrago};

    store.dispatch(new AttackAction(candidate.id, 'Copycat'));
    const attackPrompt = state.prompts.find(p =>
      p.constructor.name === 'ChooseAttackPrompt' && p.result === undefined);
    assert.ok(attackPrompt, 'Apex Dragon nested choice is offered while GX is spent');
    assert.ok(attackPrompt.cards.includes(dialga),
      'Discarded Dragon Dialga-GX is offered by nested Apex Dragon');
    assert.equal(attackPrompt.validate(shred), true);
    store.dispatch(new ResolvePromptAction(attackPrompt.id, shred));

    const damageBeforeKoResolution = opponent.active.damage;
    assert.equal(damageBeforeKoResolution, initialDamage + 80);
    let prizePrompts = 0;
    let promotions = 0;
    let waitPrompts = 0;
    for (let i = 0; i < 15; i++) {
      const prompt = state.prompts.find(p => p.result === undefined);
      if (!prompt) break;
      if (prompt.constructor.name === 'ChoosePrizePrompt') {
        assert.equal(prompt.playerId, candidate.id);
        assert.equal(prompt.options.count, 2);
        const choices = candidate.prizes.filter(p => p.cards.length > 0).slice(0, 2);
        store.dispatch(new ResolvePromptAction(prompt.id, choices));
        prizePrompts++;
      } else if (prompt.constructor.name === 'ChoosePokemonPrompt') {
        assert.equal(prompt.playerId, opponent.id);
        store.dispatch(new ResolvePromptAction(prompt.id, [spare]));
        promotions++;
      } else if (prompt.constructor.name === 'WaitPrompt') {
        store.dispatch(new ResolvePromptAction(prompt.id, null));
        waitPrompts++;
      } else {
        assert.fail('Unexpected post-Copycat prompt: ' + prompt.constructor.name);
      }
    }
    const knockedOut = opponent.discard.cards.includes(regidrago);
    const prizesRemaining =
      candidate.prizes.filter(prize => prize.cards.length > 0).length;
    const expectedKo = initialDamage + 80 >= 280;
    assert.equal(knockedOut, expectedKo);
    assert.equal(prizesRemaining, expectedKo ? 4 : 6);
    assert.equal(prizePrompts, expectedKo ? 1 : 0);
    assert.equal(promotions, expectedKo ? 1 : 0);
    assert.equal(candidate.usedGX, true, 'Non-GX Shred must leave prior GX spent');
    assert.equal(candidate.usedTurnSkip, false,
      'Shred must not award an extra turn');
    assert.equal(state.playerLastAttack[candidate.id]?.attack?.name, 'Copycat');
    return {
      initialDamage, copiedChain:['Copycat','Apex Dragon','Shred'],
      declaredLastAttack:state.playerLastAttack[candidate.id]?.attack?.name,
      gxSpentBeforeAndAfter:true, damageBeforeKoResolution,
      knockedOut, prizesTaken:6 - prizesRemaining,
      waitPrompts, prizePrompts, promotions,
      scope:'Staged pinned Store attack+prompt chain; not an authentic source-deal continuation'
    };
  } finally {
    restoreHistory();
    restoreCopy();
    clearCopyAttackSessionsForTests();
  }
}

if (require.main === module) {
  const lethal = copiedShredAfterSpentGX(210);
  const nonlethal = copiedShredAfterSpentGX(190);
  assert.equal(lethal.knockedOut, true);
  assert.equal(nonlethal.knockedOut, false);
  process.stdout.write(JSON.stringify({lethal, nonlethal}, null, 2) + '\n');
}
module.exports = {copiedShredAfterSpentGX};
