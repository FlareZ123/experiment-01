'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {
  actorSelectPromptInput,
  withActorOnlySelectPrompt
} = require('../agent8-actor-only-select-prompt.cjs');

const VERSION = 'agent30-owner-mulligan-bonus-select-v1';

/**
 * Identify only the official optional setup draw choice presented by the
 * pinned native Store. Its offered options are public to the answering
 * player. Abstain on all other SelectPrompt types and malformed choices.
 *
 * @param {object} state Live native State.
 * @param {0|1} seat Acting physical seat.
 * @param {object} classes Pinned GameMessage/GamePhase enums.
 * @param {Function} [toInput] Detached owner input projector.
 * @returns {object|null} Existing detached owner prompt observation.
 */
function observeMulliganBonusSelect(state, seat, classes, toInput = actorSelectPromptInput) {
  const {GameMessage, GamePhase} = classes;
  const player = state?.players?.[seat];
  const prompt = state?.prompts?.find(item => item.result === undefined);
  if (state?.turn !== 0 ||
      state?.phase !== GamePhase.SETUP ||
      !player ||
      prompt?.playerId !== player.id ||
      prompt?.constructor?.name !== 'SelectPrompt' ||
      prompt?.message !== GameMessage.WANT_TO_DRAW_CARDS ||
      prompt?.options?.allowCancel !== false ||
      !Array.isArray(prompt?.values) ||
      prompt.values.length < 2) {
    return null;
  }

  const amounts = prompt.values.map(option => {
    const match = /^Draw (\d+) card\(s\)$/.exec(option);
    return match ? Number(match[1]) : NaN;
  });
  if (!amounts.every(Number.isSafeInteger) ||
      amounts[amounts.length - 1] !== 0 ||
      !amounts.every((amount, index) =>
        index === 0 || amount === amounts[index - 1] - 1)) {
    return null;
  }
  return toInput(state, seat);
}

/**
 * Reuse Agent8's tested true-Store SelectPrompt capture, typed index
 * validation and settlement audit. The only newly admitted choice is
 * draw the full optional mulligan allowance at setup, chosen as option 0.
 * The calling owner policy remains fail-closed for every other prompt.
 *
 * @template T
 * @param {()=>T} run Synchronous native experiment.
 * @param {object} [deps] Existing Agent8 adapter dependencies, for tests.
 * @returns {{result:T,audit:object}}
 */
function withOwnerMulliganBonusSelectV1(run, deps = {}) {
  assert.equal(typeof run, 'function');
  const output = path.resolve(__dirname,
    '../../../vendor/twinleaf/ptcg-server/output');
  const engine = deps.engine ?? (relative => require(path.join(output, relative)));
  const classes = deps.classes ?? {
    GameMessage: engine('game/game-message').GameMessage,
    GamePhase: engine('game/store/state/state').GamePhase
  };
  const observe = (state, seat) => observeMulliganBonusSelect(
    state, seat, classes, deps.actorInput ?? actorSelectPromptInput
  );
  const wrapped = withActorOnlySelectPrompt(run, {
    ...deps,
    observe
  });
  return {
    result: wrapped.result,
    audit: {
      ...wrapped.audit,
      version: VERSION,
      allowedMessage: 'WANT_TO_DRAW_CARDS',
      policy: 'select-full-optional-mulligan-bonus',
      genericSelectPromptsAdmitted: false,
      competitivelyQualifiedGames: 0
    }
  };
}

/**
 * Per-game adapter for a native runner that creates multiple independent
 * root Stores. Agent8's source Store guard must reset for every new game.
 * This helper wraps only each genuine headless.runMatch call, preserving
 * original request, root-Store callback and matched trial registration.
 *
 * @template T
 * @param {()=>T} execute Existing synchronous batch.
 * @param {object} [deps] headless/resolveOwner injection for tests.
 * @returns {{result:T,audit:object}}
 */
function withOwnerMulliganBonusInsideNativeMatchesV1(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const headless = deps.headless ?? require('../headless.cjs');
  const resolveOwner = deps.resolveOwner ?? withOwnerMulliganBonusSelectV1;
  const original = Object.getOwnPropertyDescriptor(headless, 'runMatch');
  assert.equal(typeof original?.value, 'function');
  assert.equal(original.configurable, true);
  assert.equal(typeof resolveOwner, 'function');

  const audit = {
    version: VERSION + '-per-native-match',
    matchCalls: 0,
    matchAudits: [],
    gameQualified: false
  };
  function runMatch(request, ...args) {
    const wrapped = resolveOwner(
      () => original.value.apply(this, [request, ...args]),
      deps.ownerDeps ?? {}
    );
    audit.matchCalls++;
    audit.matchAudits.push(wrapped.audit);
    return wrapped.result;
  }
  Object.defineProperty(headless, 'runMatch', {...original, value: runMatch});
  try {
    const result = execute();
    return {result, audit};
  } catch (error) {
    if (error && typeof error === 'object') {
      error.ownerMulliganBonusNativeMatchAudit = {...audit};
    }
    throw error;
  } finally {
    assert.strictEqual(headless.runMatch, runMatch);
    Object.defineProperty(headless, 'runMatch', original);
  }
}

module.exports = {
  VERSION,
  observeMulliganBonusSelect,
  withOwnerMulliganBonusSelectV1,
  withOwnerMulliganBonusInsideNativeMatchesV1
};
