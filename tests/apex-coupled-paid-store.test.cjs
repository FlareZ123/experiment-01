'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {installApexPrizeWindowPolicy} = require('../simulation/twinleaf/apex-prize-headless-policy.cjs');
const {prizeWindowDamageMap} = require('../simulation/twinleaf/apex-spread-damage-resolver.cjs');
const {preparedRegidrago} = require('../simulation/twinleaf/apex-attack-action.cjs');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/** Construct a genuine paid-Apex Store prompt pair with printed Aichi-rank-15 cards. */
function setup() {
  const cards = initializeCards();
  const get = name => {
    const card = cards.getCardByName(name);
    assert.ok(card, 'Missing pinned printing: ' + name);
    return card;
  };
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const ready = preparedRegidrago();
  ready.attachFire();
  ready.defending.active.cards.length = 0;
  ready.defending.active.cards.push(
    get('Pidgey FLF'), get('Pidgeotto TEU'), get('Pidgeot ex OBF')
  );
  const budews = [];
  for (let i = 0; i < 2; i += 1) {
    const pokemon = get('Budew ASC');
    const slot = new PokemonCardList();
    slot.cards.push(pokemon);
    ready.defending.bench.push(slot);
    budews.push(pokemon);
  }
  ready.attacking.discard.cards.push(
    get('Dragapult ex TWM'), get('Hisuian Goodra VSTAR LOR')
  );
  return {...ready, budews};
}

/** Instantiate the actual bot while BOTH resolver constructors are installed. */
function botFor(player) {
  const definitions = load('simple-bot/simple-bot-definitions');
  const {SimpleTacticsAi} = load('simple-bot/simple-tactics-ai');
  return new SimpleTacticsAi({id:player.id}, {
    tactics:[],
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:definitions.defaultArbiterOptions
  }, null);
}

/** @param {object} ready Prepared Store and players. */
function pending(ready, name) {
  return ready.state.prompts.find(
    p => p.result === undefined && p.constructor.name === name
  );
}

/** Finish real KO animation and Prize selection prompts. */
function finishPrizePrompts(ready) {
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {ChoosePrizePromptResolver} = load('simple-bot/prompt-resolver/choose-prize-prompt-resolver');
  const {defaultStateScores} = load('simple-bot/simple-bot-definitions');
  const chooser = new ChoosePrizePromptResolver({scores:defaultStateScores});
  const trace = [];
  for (let step = 0; step < 12; step += 1) {
    const prompt = ready.state.prompts.find(p => p.result === undefined);
    if (!prompt) break;
    if (prompt.constructor.name === 'WaitPrompt') {
      ready.store.dispatch(new ResolvePromptAction(prompt.id, null));
    } else if (prompt.constructor.name === 'ChoosePrizePrompt') {
      const player = ready.state.players.find(p => p.id === prompt.playerId);
      ready.store.dispatch(chooser.resolvePrompt(ready.state, player, prompt));
    } else {
      break;
    }
    trace.push(prompt.constructor.name);
  }
  return trace;
}

test('coupled installed resolvers carry one paid Apex choice through two genuine Bench KOs', () => {
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ChooseAttackPromptResolver} = load('simple-bot/prompt-resolver/choose-attack-prompt-resolver');
  const {defaultStateScores, allPromptResolvers} = load('simple-bot/simple-bot-definitions');
  const original = allPromptResolvers.slice();
  const ready = setup();
  const restore = installApexPrizeWindowPolicy();
  try {
    const bot = botFor(ready.attacking);
    assert.ok(bot.resolvers.some(x => x.constructor.name === 'SpreadAwareCopyResolver'));
    assert.ok(bot.resolvers.some(x => x.constructor.name === 'PrizeWindowPutDamageResolver'));
    const prizesBefore = ready.attacking.getPrizeLeft();

    ready.store.dispatch(new AttackAction(ready.attacking.id, 'Apex Dragon'));
    const choose = pending(ready, 'ChooseAttackPrompt');
    assert.ok(choose, 'Apex must generate an actual copy-attack prompt');
    const generic = new ChooseAttackPromptResolver({scores:defaultStateScores})
      .resolvePrompt(ready.state, ready.attacking, choose);
    assert.equal(generic.result.name, 'Rolling Iron');
    const selected = bot.decodeNextAction(ready.state);
    assert.equal(selected.result.name, 'Phantom Dive');
    assert.equal(choose.validate(selected.result), true);
    ready.store.dispatch(selected);

    const damagePrompt = pending(ready, 'PutDamagePrompt');
    assert.ok(damagePrompt, 'Copied Phantom Dive must generate the real 60-damage prompt');
    assert.equal(damagePrompt.damage, 60);
    const allocation = bot.decodeNextAction(ready.state);
    assert.equal(damagePrompt.validate(allocation.result, ready.state), true);
    assert.deepEqual(allocation.result.map(row => row.damage), [30, 30]);
    assert.equal(allocation.result.reduce((total, row) => total + row.damage, 0), 60);
    ready.store.dispatch(allocation);
    const finished = finishPrizePrompts(ready);
    assert.ok(finished.includes('ChoosePrizePrompt'));
    assert.ok(ready.budews.every(card => ready.defending.discard.cards.includes(card)));
    assert.equal(prizesBefore - ready.attacking.getPrizeLeft(), 2);
  } finally {
    restore();
  }
  assert.deepEqual(allPromptResolvers, original, 'Do not leak experimental resolvers');
});

test('copy preference can succeed while an adversarial counter cap forces generic fallback', () => {
  const {AttackAction} = load('game/store/actions/game-actions');
  const {PutDamagePromptResolver} = load('simple-bot/prompt-resolver/put-damage-prompt-resolver');
  const {GamePhase} = load('game/store/state/state');
  const {PlayerType, SlotType} = load('game/store/actions/play-card-action');
  const {allPromptResolvers} = load('simple-bot/simple-bot-definitions');
  const original = allPromptResolvers.slice();
  const ready = setup();
  const restore = installApexPrizeWindowPolicy();
  const originalDelegate = PutDamagePromptResolver.prototype.resolvePrompt;
  try {
    const bot = botFor(ready.attacking);
    ready.store.dispatch(new AttackAction(ready.attacking.id, 'Apex Dragon'));
    const chosen = bot.decodeNextAction(ready.state);
    assert.equal(chosen.result.name, 'Phantom Dive');
    ready.store.dispatch(chosen);
    const damagePrompt = pending(ready, 'PutDamagePrompt');
    assert.ok(damagePrompt);

    // Synthetic impossibility, imposed AFTER a real Store prompt was created.
    // Two targets may receive only 20 each: all six counters cannot be placed.
    for (const row of damagePrompt.maxAllowedDamage) {
      row.damage = Math.min(row.damage, 20);
    }
    const codes = {
      attackPhase:GamePhase.ATTACK,
      opponentSide:PlayerType.TOP_PLAYER,
      benchSlot:SlotType.BENCH
    };
    assert.equal(prizeWindowDamageMap(ready.state, ready.attacking, damagePrompt, codes), null);
    const fallback = {sentinel:'generic resolver invoked'};
    let calls = 0;
    PutDamagePromptResolver.prototype.resolvePrompt = function genericFallback() {
      calls += 1;
      return fallback;
    };
    assert.strictEqual(bot.decodeNextAction(ready.state), fallback);
    assert.equal(calls, 1);
  } finally {
    PutDamagePromptResolver.prototype.resolvePrompt = originalDelegate;
    restore();
  }
  assert.deepEqual(allPromptResolvers, original);
});
