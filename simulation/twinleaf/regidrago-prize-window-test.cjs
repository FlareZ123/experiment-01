'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { createRegidragoPrizeWindowResolver } = require('./regidrago-prize-window-resolver.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

function compareCopyAttackChoices() {
  const manager = initializeCards();
  const card = name => manager.getCardByName(name);
  const [regidrago, dragapult, goodra, mimikyu, budew] = [
    'Regidrago VSTAR SIT', 'Dragapult ex TWM',
    'Hisuian Goodra VSTAR LOR', 'Mimikyu PAL', 'Budew ASC'
  ].map(card);
  assert.ok([regidrago, dragapult, goodra, mimikyu, budew].every(Boolean));
  const { State, GamePhase } = load('game/store/state/state');
  const { Player } = load('game/store/state/player');
  const { PokemonCardList } = load('game/store/state/pokemon-card-list');
  const { ChooseAttackPrompt } = load('game/store/prompts/choose-attack-prompt');
  const { ChooseAttackPromptResolver } = load('simple-bot/prompt-resolver/choose-attack-prompt-resolver');
  const { defaultStateScores } = load('simple-bot/simple-bot-definitions');
  const { GameMessage } = load('game/game-message');

  const state = new State();
  state.phase = GamePhase.ATTACK;
  const attacker = new Player();
  attacker.id = 101;
  attacker.active.cards.push(regidrago);
  const defender = new Player();
  defender.id = 202;
  defender.active.cards.push(mimikyu);
  const bench = new PokemonCardList();
  bench.cards.push(budew);
  defender.bench.push(bench);
  state.players = [attacker, defender];

  const makePrompt = options =>
    new ChooseAttackPrompt(attacker.id, GameMessage.CHOOSE_ATTACK_TO_COPY, [dragapult, goodra], options);
  const original = new ChooseAttackPromptResolver({ scores: defaultStateScores });
  const Override = createRegidragoPrizeWindowResolver();
  const override = new Override({});
  const oldChoice = original.resolvePrompt(state, attacker, makePrompt());
  const newChoice = override.resolvePrompt(state, attacker, makePrompt());
  assert.equal(oldChoice.result.name, 'Rolling Iron');
  assert.equal(newChoice.result.name, 'Phantom Dive');
  assert.ok(budew.hp <= 60);

  defender.bench = [];
  assert.equal(override.resolvePrompt(state, attacker, makePrompt()), undefined);
  defender.bench = [bench];
  const blocked = makePrompt({ blocked: [{ index: 0, attack: 'Phantom Dive' }] });
  assert.equal(override.resolvePrompt(state, attacker, blocked), undefined);
  return {
    original: oldChoice.result.name,
    optIn: newChoice.result.name,
    benchTarget: budew.fullName,
    evidence: 'Deterministic prompt choice in isolated mock board; no game-win measurement'
  };
}
if (require.main === module) console.log(JSON.stringify(compareCopyAttackChoices(), null, 2));
module.exports = { compareCopyAttackChoices };
