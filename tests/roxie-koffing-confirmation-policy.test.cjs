'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRoxie} =
  require('../simulation/twinleaf/agent43-roxie-koffing-confirmation.cjs');
const {withRoxieDiscardEffectType} =
  require('../simulation/twinleaf/roxie-discard-type-hook.cjs');
const {withRoxieKoffingConfirmation} =
  require('../simulation/twinleaf/roxie-koffing-confirmation-policy.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} relativePath @returns {any} */
const load = relativePath => require(path.join(output, relativePath));

test('one real Roxie/Koffing prompt is opted into, unrelated confirmations remain false', () => {
  const {Koffing} = load('sets/08-sun-and-moon/set-cosmic-eclipse/koffing');
  const {ConfirmPromptResolver} =
    load('simple-bot/prompt-resolver/confirm-prompt-resolver');
  const {ConfirmPrompt} = load('game/store/prompts/confirm-prompt');
  const {GameMessage} = load('game/game-message');
  const {PlayCardAction} = load('game/store/actions/play-card-action');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt} = load('game/store/prompts/choose-cards-prompt');

  const priorKoffingReduce = Koffing.prototype.reduceEffect;
  const priorConfirmResolve = ConfirmPromptResolver.prototype.resolvePrompt;
  const scenario = withRoxieDiscardEffectType(() =>
    withRoxieKoffingConfirmation(() => {
      const f = stagedRoxie();
      const generic = new ConfirmPromptResolver({});
      const unrelated = new ConfirmPrompt(f.own.id, GameMessage.WANT_TO_USE_ABILITY);
      unrelated.id = 100000;
      assert.equal(generic.resolvePrompt(f.state, f.own, unrelated).result, false);

      f.store.dispatch(new PlayCardAction(f.own.id, 0));
      const choose = f.state.prompts.find(p =>
        p instanceof ChooseCardsPrompt && p.result === undefined);
      assert.ok(choose, 'the real Roxie discard choice must be pending');
      f.store.dispatch(new ResolvePromptAction(choose.id, [f.koffing]));

      const active = f.state.prompts.find(p =>
        p instanceof ConfirmPrompt && p.result === undefined);
      assert.ok(active, 'the discarded Koffing must offer its Ability');
      assert.equal(generic.resolvePrompt(f.state, f.own, unrelated).result, false);
      const response = generic.resolvePrompt(f.state, f.own, active);
      assert.equal(response.result, true);
      f.store.dispatch(response);
      assert.equal(f.opp.active.damage, 10);
      assert.equal(f.opp.bench[0].damage, 10);
      return {activeId:active.id};
    })
  );
  assert.equal(scenario.marked.length, 1);
  assert.equal(scenario.accepted.length, 1);
  assert.equal(scenario.accepted[0].promptId, scenario.value.activeId);
  assert.equal(Koffing.prototype.reduceEffect, priorKoffingReduce);
  assert.equal(ConfirmPromptResolver.prototype.resolvePrompt, priorConfirmResolve);
});

test('scope is restored even when inner experiment throws', () => {
  const {Koffing} = load('sets/08-sun-and-moon/set-cosmic-eclipse/koffing');
  const {ConfirmPromptResolver} =
    load('simple-bot/prompt-resolver/confirm-prompt-resolver');
  const oldReduce = Koffing.prototype.reduceEffect;
  const oldResolve = ConfirmPromptResolver.prototype.resolvePrompt;
  assert.throws(() => withRoxieKoffingConfirmation(() => {
    throw new Error('synthetic abort');
  }), /synthetic abort/);
  assert.equal(Koffing.prototype.reduceEffect, oldReduce);
  assert.equal(ConfirmPromptResolver.prototype.resolvePrompt, oldResolve);
});
