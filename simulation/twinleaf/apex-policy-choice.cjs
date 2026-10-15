'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(root, modulePath));

/**
 * Source-level policy behavior check, not a recommended strategic decision.
 * The pinned SimpleTacticsAi resolves copied attacks by displayed damage and
 * printed cost length; it does not score the rest of the copied attack text.
 */
function inspectApexPromptPolicy() {
  const manager = initializeCards();
  const dragapult = manager.getCardByName('Dragapult ex TWM');
  const goodra = manager.getCardByName('Hisuian Goodra VSTAR LOR');
  const kyurem = manager.getCardByName('Kyurem SFA');
  assert.ok(dragapult && goodra && kyurem, 'Expected Aichi Dragon payloads');
  const { State, GamePhase } = load('game/store/state/state');
  const { Player } = load('game/store/state/player');
  const { ChooseAttackPrompt } = load('game/store/prompts/choose-attack-prompt');
  const { ChooseAttackPromptResolver } = load('simple-bot/prompt-resolver/choose-attack-prompt-resolver');
  const { GameMessage } = load('game/game-message');
  const { defaultStateScores } = load('simple-bot/simple-bot-definitions');
  const state = new State();
  state.phase = GamePhase.ATTACK;
  const player = new Player();
  player.id = 101;
  state.players.push(player);
  const resolver = new ChooseAttackPromptResolver({ scores: defaultStateScores });

  /** @param {any[]} candidates */
  function choose(candidates) {
    const prompt = new ChooseAttackPrompt(player.id, GameMessage.CHOOSE_ATTACK_TO_COPY, candidates);
    const action = resolver.resolvePrompt(state, player, prompt);
    assert.equal(action?.constructor.name, 'ResolvePromptAction');
    assert.ok(action.result, 'An attack must be chosen');
    return action.result.name;
  }

  const base = choose([dragapult, goodra, kyurem]);
  const reversed = choose([kyurem, goodra, dragapult]);
  assert.equal(base, 'Rolling Iron', 'Expected tied 200-damage attacks resolved by longer printed Energy cost');
  assert.equal(reversed, 'Rolling Iron', 'Changing card order must not change this preference');
  assert.equal(dragapult.attacks.find(a => a.name === 'Phantom Dive').damage, 200);
  assert.equal(goodra.attacks.find(a => a.name === 'Rolling Iron').damage, 200);
  assert.equal(kyurem.attacks.find(a => a.name === 'Trifrost').damage, 0);
  return {
    selected: base,
    candidates: [
      'Hisuian Goodra VSTAR: Rolling Iron, printed 200, 3 Energy cost',
      'Dragapult ex: Phantom Dive, printed 200, 2 Energy cost plus six spread counters',
      'Kyurem: Trifrost, printed 0, up to 110 to three Pokémon'
    ],
    interpretation: 'Pinned generic resolver ranks printed damage, then cost length, without tactical evaluation',
    engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05'
  };
}

if (require.main === module) console.log(JSON.stringify(inspectApexPromptPolicy(), null, 2));
module.exports = { inspectApexPromptPolicy };
