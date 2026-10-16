'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {
  isCopycatApexTimelessSituation,
  withCopycatApexTimelessPolicy
} = require('../simulation/twinleaf/mimikyu-counter-policy.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/** @returns {object} Two-player public board and compiled classes. */
function fixture() {
  const manager = initializeCards();
  const names = ['Mimikyu GRI', 'Regidrago VSTAR SIT',
    'Dialga-GX UPR', 'Dratini OBF', 'Psychic Energy SVE'];
  const [mimikyu, regidrago, dialga, dratini, psychic] =
    names.map(name => manager.getCardByName(name));
  assert.ok([mimikyu, regidrago, dialga, dratini, psychic].every(Boolean));
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {GamePhase} = load('game/store/state/state');
  const state = new Store({onStateChange() {}}).state;
  const a = new Player();
  a.id = 101;
  a.active.cards.push(mimikyu, psychic);
  a.discard.cards.push(dialga);
  const b = new Player();
  b.id = 202;
  b.active.cards.push(regidrago);
  state.players = [a, b];
  state.activePlayer = 0;
  state.phase = GamePhase.PLAYER_TURN;
  state.playerLastAttack[b.id] = {
    attack: regidrago.attacks[0], sourceCard: regidrago
  };
  return {state, a, b, mimikyu, regidrago, dialga, dratini};
}

test('opt-in decorator is idempotent and preserves upstream indices', () => {
  const definitions = load('simple-bot/simple-bot-definitions');
  const original = {
    tactics: definitions.allSimpleTactics,
    promptResolvers: definitions.allPromptResolvers,
    scores: definitions.defaultStateScores,
    arbiter: {}
  };
  const modified = withCopycatApexTimelessPolicy(original);
  assert.notEqual(modified, original);
  assert.equal(withCopycatApexTimelessPolicy(modified), modified);
  assert.equal(original.tactics.some(t => t.name === 'CopycatApexTimelessTactic'), false);
  assert.equal(modified.tactics.filter(t => t.name === 'CopycatApexTimelessTactic').length, 1);
  assert.equal(modified.promptResolvers
    .filter(r => r.name === 'CopycatApexTimelessResolver').length, 1);
  assert.ok(modified.tactics.findIndex(t => t.name === 'CopycatApexTimelessTactic') <
    modified.tactics.findIndex(t => t.name === 'AttackTactic'));
  assert.ok(modified.promptResolvers
    .findIndex(r => r.name === 'CopycatApexTimelessResolver') <
    modified.promptResolvers.findIndex(r => r.name === 'ChooseAttackPromptResolver'));
});

test('tactic only announces the public, unspent Copycat counterline', () => {
  const f = fixture();
  const definitions = load('simple-bot/simple-bot-definitions');
  const options = withCopycatApexTimelessPolicy({
    tactics: definitions.allSimpleTactics,
    promptResolvers: definitions.allPromptResolvers,
    scores: definitions.defaultStateScores,
    arbiter: {}
  });
  const type = options.tactics.find(t => t.name === 'CopycatApexTimelessTactic');
  const tactic = new type(options);
  const {AttackAction} = load('game/store/actions/game-actions');
  assert.equal(isCopycatApexTimelessSituation(f.state, f.a), true);
  const action = tactic.useTactic(f.state, f.a);
  assert.ok(action instanceof AttackAction);
  assert.equal(action.name, 'Copycat');
  assert.equal(action.clientId, f.a.id);

  f.a.usedGX = true;
  assert.equal(tactic.useTactic(f.state, f.a), undefined);
  f.a.usedGX = false;
  f.a.discard.cards.length = 0;
  assert.equal(tactic.useTactic(f.state, f.a), undefined);
  f.a.discard.cards.push(f.dialga);
  f.state.playerLastAttack[f.b.id] = undefined;
  assert.equal(tactic.useTactic(f.state, f.a), undefined);
});

test('resolved Timeless-GX is an actual legal prompt result under source identity', () => {
  const f = fixture();
  const definitions = load('simple-bot/simple-bot-definitions');
  const options = withCopycatApexTimelessPolicy({
    tactics: definitions.allSimpleTactics,
    promptResolvers: definitions.allPromptResolvers,
    scores: definitions.defaultStateScores,
    arbiter: {}
  });
  const Resolver = options.promptResolvers
    .find(r => r.name === 'CopycatApexTimelessResolver');
  const resolver = new Resolver(options);
  const {ChooseAttackPrompt} = load('game/store/prompts/choose-attack-prompt');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {GameMessage} = load('game/game-message');
  const {GamePhase} = load('game/store/state/state');
  f.state.phase = GamePhase.ATTACK;
  const prompt = new ChooseAttackPrompt(f.a.id, GameMessage.CHOOSE_ATTACK,
    [f.dratini, f.dialga]);
  const action = resolver.resolvePrompt(f.state, f.a, prompt);
  assert.ok(action instanceof ResolvePromptAction);
  assert.equal(action.id, prompt.id);
  assert.equal(action.result, f.dialga.attacks[2]);
  assert.equal(prompt.validate(action.result), true);
  prompt.options.blocked = [{index: 1, attack: 'Timeless-GX'}];
  const fallback = resolver.resolvePrompt(f.state, f.a, prompt);
  assert.notEqual(fallback.result, f.dialga.attacks[2],
    'Must honor the source prompt blocked-attack list');
  assert.equal(prompt.validate(fallback.result), true);
});
