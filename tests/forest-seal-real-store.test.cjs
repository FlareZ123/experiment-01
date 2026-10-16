'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');
const { installForestSealSearchHook } =
  require('../simulation/twinleaf/forest-seal-search-hook.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const engine = modulePath => require(path.join(output, modulePath));

/**
 * Run the pinned Store's complete prompt and dispatch paths, with a real V
 * bearing Forest Seal Stone. This is a midgame state/action test; initial
 * seven-card setup and competitive bot decisions are deliberately excluded.
 * @returns {object}
 */
function boardFixture() {
  const manager = initializeCards();
  const card = name => {
    const c = manager.getCardByName(name);
    assert.ok(c, 'Missing pinned printing: ' + name);
    return c;
  };
  const { Store } = engine('game/store/store');
  const { Player } = engine('game/store/state/player');
  const { State } = engine('game/store/state/state');
  const { PowerEffect } = engine('game/store/effects/game-effects');
  const stone = card('Forest Seal Stone SIT');
  const target = card('Shadow Rider Calyrex VMAX CRE');
  const other = card('Psychic Energy SVE');
  const player = new Player();
  player.id = 101;
  player.name = 'stone-player';
  player.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  player.active.tools.push(stone);
  player.deck.cards.push(target, other);
  const opponent = new Player();
  opponent.id = 202;
  opponent.name = 'opponent';
  opponent.active.cards.push(card('Dratini OBF'));
  const state = new State();
  state.players = [player, opponent];
  const store = new Store({ onStateChange() {} });
  store.state = state;
  const announce = () => store.reduceEffect(state,
    new PowerEffect(player, stone.powers[0], stone, player.active));
  return { store, state, player, target, announce };
}

test('real Store resolves a single Star Alchemy card and shuffles remaining deck', () => {
  const { ChooseCardsPrompt } = engine('game/store/prompts/choose-cards-prompt');
  const { ShuffleDeckPrompt } = engine('game/store/prompts/shuffle-prompt');
  const { ResolvePromptAction } = engine('game/store/actions/resolve-prompt-action');
  const restore = installForestSealSearchHook();
  try {
    const f = boardFixture();
    f.announce();
    const choose = f.state.prompts.find(p => p.result === undefined);
    assert.ok(choose instanceof ChooseCardsPrompt);
    assert.equal(choose.options.min, 1);
    assert.equal(choose.validate([]), false);
    assert.equal(choose.validate([f.target]), true);
    f.store.dispatch(new ResolvePromptAction(choose.id, [f.target]));
    assert.ok(f.player.hand.cards.includes(f.target));
    assert.equal(f.player.deck.cards.length, 1);
    const shuffle = f.state.prompts.find(p => p.result === undefined);
    assert.ok(shuffle instanceof ShuffleDeckPrompt);
    f.store.dispatch(new ResolvePromptAction(shuffle.id, [0]));
    assert.ok(f.state.prompts.every(p => p.result !== undefined));
    assert.equal(f.player.usedVSTAR, true);
  } finally {
    restore();
  }
});

test('real Store explicitly fails invalid empty VSTAR result rather than continuing', () => {
  const { ResolvePromptAction } = engine('game/store/actions/resolve-prompt-action');
  const { GameMessage } = engine('game/game-message');
  const restore = installForestSealSearchHook();
  try {
    const f = boardFixture();
    f.announce();
    const choose = f.state.prompts.find(p => p.result === undefined);
    assert.ok(choose);
    assert.throws(() => f.store.dispatch(new ResolvePromptAction(choose.id, [])),
      error => error.message === GameMessage.ILLEGAL_ACTION);
    assert.equal(f.player.hand.cards.length, 0);
    assert.equal(f.player.deck.cards.length, 2);
  } finally {
    restore();
  }
});
