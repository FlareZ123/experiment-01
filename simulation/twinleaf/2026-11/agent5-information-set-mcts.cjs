'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {performance} = require('node:perf_hooks');

function canonicalJson(value, seen = new Set()) {
  if (value === null) return 'null';
  const type = typeof value;
  if (type === 'string' || type === 'boolean') return JSON.stringify(value);
  if (type === 'number') {
    assert.ok(Number.isFinite(value), 'Observation contains a non-finite number');
    assert.ok(!Object.is(value, -0), 'Observation cannot contain negative zero');
    return JSON.stringify(value);
  }
  assert.equal(type, 'object',
    'Observation must contain only JSON-safe values (no undefined, functions, symbols or BigInt)');
  assert.equal(seen.has(value), false, 'Observation contains a cycle');
  seen.add(value);
  let result;
  if (Array.isArray(value)) {
    assert.equal(Object.getPrototypeOf(value), Array.prototype,
      'Observation arrays must use the standard Array prototype');
    const ownKeys = Reflect.ownKeys(value);
    assert.equal(ownKeys.length, value.length + 1,
      'Observation arrays must be dense and have no extra properties');
    const lengthDescriptor = Object.getOwnPropertyDescriptor(value, 'length');
    assert.ok(lengthDescriptor && Object.hasOwn(lengthDescriptor, 'value') &&
      lengthDescriptor.enumerable === false,
    'Observation array length must be a data property');
    const items = [];
    for (let index = 0; index < value.length; index++) {
      const key = String(index);
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      assert.ok(descriptor && descriptor.enumerable === true &&
        Object.hasOwn(descriptor, 'value'),
      'Observation arrays must contain dense enumerable data elements');
      items.push(canonicalJson(descriptor.value, seen));
    }
    for (const key of ownKeys) {
      if (key === 'length') continue;
      const numericIndex = typeof key === 'string' ? Number(key) : NaN;
      assert.ok(Number.isSafeInteger(numericIndex) && numericIndex >= 0 &&
        String(numericIndex) === key && numericIndex < value.length,
      'Observation arrays cannot contain symbol or non-index properties');
    }
    result = '[' + items.join(',') + ']';
  } else {
    assert.equal(Object.getPrototypeOf(value), Object.prototype,
      'Observation must contain only ordinary plain objects');
    const ownKeys = Reflect.ownKeys(value);
    assert.ok(ownKeys.every(key => typeof key === 'string'),
      'Observation objects cannot contain symbol keys');
    const keys = ownKeys.sort();
    const entries = [];
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      assert.ok(descriptor && descriptor.enumerable === true &&
        Object.hasOwn(descriptor, 'value'),
      'Observation object properties must be enumerable data properties');
      entries.push(JSON.stringify(key) + ':' + canonicalJson(descriptor.value, seen));
    }
    result = '{' + entries.join(',') + '}';
  }
  seen.delete(value);
  return result;
}

function observationSha256(observation) {
  return createHash('sha256').update(canonicalJson(observation)).digest('hex');
}

const PROMPT_EVENT_SCHEMA_ID = 'actor-safe-prompt-event-v2';
const PROMPT_RANDOM_PROTOCOL_ID = 'per-rollout-independent-prompt-policy-rng-v1';
const PROMPT_EVENT_KEYS = Object.freeze([
  'actorObservationDigest',
  'actorSeat',
  'nativeValidationSucceeded',
  'promptPolicyId',
  'promptProjectionDigest',
  'promptType',
  'selectedTokens',
  'stableSuccessorDigest',
  'transitionActorSeat'
]);
const PROMPT_DIGEST_RE = /^[a-f0-9]{64}$/i;
const VERSIONED_PROMPT_POLICY_ID_RE = /(?:^|-)v[0-9]+$/;

function hasPromptEventControlCharacters(value, rejectWhitespace = false) {
  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    const code = value.charCodeAt(index);
    if (code < 32 || code === 127 ||
      (rejectWhitespace && character.trim().length === 0)) return true;
  }
  return false;
}

function readPromptEventDataProperty(event, key, label) {
  const descriptor = Object.getOwnPropertyDescriptor(event, key);
  assert.ok(descriptor && descriptor.enumerable === true &&
    Object.hasOwn(descriptor, 'value'),
  label + ' must contain enumerable data properties only');
  return descriptor.value;
}

function sanitizePromptEvent(event, expectedTransitionActorSeat, ordinal) {
  assert.ok(event !== null && typeof event === 'object' && !Array.isArray(event),
    'Prompt event must be a plain data object');
  const prototype = Object.getPrototypeOf(event);
  assert.ok(prototype === Object.prototype || prototype === null,
    'Prompt event must be a plain data object');
  const ownKeys = Reflect.ownKeys(event);
  assert.ok(ownKeys.every(key => typeof key === 'string'),
    'Prompt event cannot contain symbol keys');
  assert.deepEqual(ownKeys.slice().sort(), PROMPT_EVENT_KEYS,
    'Prompt event must contain exactly the actor-safe allowlisted keys');

  const values = Object.create(null);
  for (const key of PROMPT_EVENT_KEYS) {
    values[key] = readPromptEventDataProperty(event, key, 'Prompt event');
  }
  assert.ok(expectedTransitionActorSeat === 0 || expectedTransitionActorSeat === 1,
    'Prompt event action context requires a physical transition actor seat');
  assert.equal(values.transitionActorSeat, expectedTransitionActorSeat,
    'Prompt event transitionActorSeat must match the bound transition actor');
  assert.ok(values.actorSeat === 0 || values.actorSeat === 1,
    'Prompt event actorSeat must be a physical prompt-owner seat');
  assert.ok(typeof values.promptType === 'string' &&
    values.promptType.trim().length > 0 && values.promptType.length <= 128 &&
    !hasPromptEventControlCharacters(values.promptType),
  'Prompt event promptType must be a short non-empty string');
  for (const key of [
    'actorObservationDigest',
    'promptProjectionDigest',
    'stableSuccessorDigest'
  ]) {
    assert.ok(typeof values[key] === 'string' && PROMPT_DIGEST_RE.test(values[key]),
      'Prompt event ' + key + ' must be a 64-character SHA-256 hex digest');
  }
  assert.ok(Array.isArray(values.selectedTokens),
    'Prompt event selectedTokens must be an array of opaque strings');
  assert.equal(Object.getPrototypeOf(values.selectedTokens), Array.prototype,
    'Prompt event selectedTokens must use the standard Array prototype');
  assert.ok(values.selectedTokens.length <= 16,
    'Prompt event selectedTokens cannot exceed 16 tokens');
  const tokenKeys = Reflect.ownKeys(values.selectedTokens);
  assert.equal(tokenKeys.length, values.selectedTokens.length + 1,
    'Prompt event selectedTokens must be dense and have no extra properties');
  const selectedTokens = [];
  for (let index = 0; index < values.selectedTokens.length; index++) {
    const token = readPromptEventDataProperty(
      values.selectedTokens, String(index), 'Prompt event selectedTokens');
    assert.ok(typeof token === 'string' && token.length > 0 && token.length <= 256 &&
      !hasPromptEventControlCharacters(token, true),
    'Prompt event selectedTokens must contain only non-empty opaque token strings');
    selectedTokens.push(token);
  }
  assert.equal(new Set(selectedTokens).size, selectedTokens.length,
    'Prompt event selectedTokens cannot contain duplicates');
  assert.ok(typeof values.promptPolicyId === 'string' &&
    values.promptPolicyId.length <= 128 &&
    VERSIONED_PROMPT_POLICY_ID_RE.test(values.promptPolicyId),
  'Prompt event promptPolicyId must be a versioned identifier');
  assert.equal(values.nativeValidationSucceeded, true,
    'Prompt event can be recorded only after successful native validation');

  return Object.freeze({
    ordinal,
    transitionActorSeat: values.transitionActorSeat,
    actorSeat: values.actorSeat,
    promptType: values.promptType,
    actorObservationDigest: values.actorObservationDigest,
    promptProjectionDigest: values.promptProjectionDigest,
    selectedTokens: Object.freeze(selectedTokens),
    promptPolicyId: values.promptPolicyId,
    nativeValidationSucceeded: true,
    stableSuccessorDigest: values.stableSuccessorDigest
  });
}

function createRolloutContext(iteration, promptRandom) {
  const promptEvents = [];
  let iterationOpen = true;
  return Object.freeze({
    forAction(transitionActorSeat) {
      assert.ok(iterationOpen, 'Rollout prompt-event collector is already closed');
      assert.ok(transitionActorSeat === 0 || transitionActorSeat === 1,
        'Rollout action context requires a physical transition actor seat');
      let actionOpen = true;
      const view = Object.freeze({
        iteration,
        transitionActorSeat,
        promptRandom() {
          assert.ok(iterationOpen && actionOpen,
            'Prompt RNG cannot be used outside its action transition');
          return promptRandom();
        },
        recordPromptEvent(event) {
          assert.ok(iterationOpen && actionOpen,
            'Prompt events can be recorded only during their action transition');
          const sanitized = sanitizePromptEvent(event, transitionActorSeat, promptEvents.length);
          promptEvents.push(sanitized);
          return sanitized;
        }
      });
      return Object.freeze({
        view,
        close() {
          actionOpen = false;
        }
      });
    },
    close() {
      assert.ok(iterationOpen, 'Rollout prompt-event collector was closed twice');
      iterationOpen = false;
      return Object.freeze(promptEvents.slice());
    }
  });
}

function deepFreezePolicySnapshot(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreezePolicySnapshot(child);
  return Object.freeze(value);
}

function frozenPolicyObservation(observation) {
  // Clone the canonical actor view before freezing it. Never freeze objects
  // that may still be shared with the live Twinleaf State.
  return deepFreezePolicySnapshot(JSON.parse(canonicalJson(observation)));
}

function seededRandom(seed) {
  let state = seed >>> 0;
  if (state === 0) state = 0x9e3779b9;
  return function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function mixSeed(seed, iteration, salt = 0) {
  let value = (seed ^ Math.imul(iteration + 1, 0x9e3779b9) ^ salt) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d) >>> 0;
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b) >>> 0;
  value ^= value >>> 16;
  return value >>> 0;
}

function opponentPolicySeed(seed, iteration, seat, observationHash) {
  const digest = createHash('sha256').update(JSON.stringify({
    protocol: 'mcts-opponent-policy-rng-v2',
    seed,
    iteration,
    seat,
    observationHash
  })).digest();
  return digest.readUInt32BE(0);
}

function actorRelativeDeterminizationSeed(seed, iteration, seat, observationHash) {
  const digest = createHash('sha256').update(JSON.stringify({
    protocol: 'mcts-actor-relative-determinization-rng-v1',
    seed,
    iteration,
    seat,
    observationHash
  })).digest();
  return digest.readUInt32BE(0);
}

function normalizePriors(actions, actionPrior, observation, seat) {
  const raw = actions.map(action => {
    const value = actionPrior ? actionPrior(action, observation, seat) : 1;
    assert.ok(Number.isFinite(value) && value >= 0,
      'Action prior must be a finite nonnegative number');
    return value;
  });
  const total = raw.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return raw.map(() => 1 / raw.length);
  return raw.map(value => value / total);
}

function buildActionMap(actions, actionKey) {
  assert.ok(Array.isArray(actions), 'Action enumerator must return an array');
  const map = new Map();
  for (const action of actions) {
    const key = actionKey(action);
    assert.ok(typeof key === 'string' && key.length > 0,
      'Action key must be a non-empty string');
    assert.equal(map.has(key), false, 'Action enumerator returned duplicate action keys');
    map.set(key, action);
  }
  return map;
}

function createNode(key, seat, actions, observation, actionPrior, actionKey) {
  assert.ok(actions.length > 0, 'Cannot expand a node with no actions');
  const priors = normalizePriors(actions, actionPrior, observation, seat);
  const stats = new Map();
  for (let i = 0; i < actions.length; i++) {
    stats.set(actionKey(actions[i]), {
      prior: priors[i], visits: 0, valueSum: 0
    });
  }
  return {key, seat, visits: 0, stats};
}

function selectPuctAction(node, cPuct = 1.4) {
  const root = Math.sqrt(node.visits + 1);
  let selected = null;
  let selectedScore = -Infinity;
  for (const [key, stat] of node.stats) {
    const q = stat.visits === 0 ? 0 : stat.valueSum / stat.visits;
    const u = cPuct * stat.prior * root / (1 + stat.visits);
    const score = q + u;
    if (score > selectedScore ||
        (score === selectedScore && (selected === null || key < selected))) {
      selected = key;
      selectedScore = score;
    }
  }
  assert.ok(selected !== null, 'PUCT node has no selectable action');
  return selected;
}

function backpropagate(path, leafValue, leafSeat) {
  let value = leafValue;
  let perspective = leafSeat;
  for (let i = path.length - 1; i >= 0; i--) {
    const step = path[i];
    if (step.seat !== perspective) {
      value = -value;
      perspective = step.seat;
    }
    const stat = step.node.stats.get(step.actionKey);
    assert.ok(stat, 'Backpropagation lost its selected action');
    stat.visits += 1;
    stat.valueSum += value;
    step.node.visits += 1;
  }
}

/**
 * Validate a general-sum terminal/leaf payoff vector. Each component is the
 * estimated probability that the corresponding physical seat wins. Terminal
 * outcomes are supplied separately as typed, versioned adjudications; leaf
 * estimates may be fractional but must sum to at most one.
 */
function validateWinProbabilityVector(values, label = 'Win-probability value') {
  assert.ok(Array.isArray(values) && values.length === 2,
    label + ' must be a two-seat array');
  const normalized = values.map((value, seat) => {
    assert.ok(Number.isFinite(value) && value >= 0 && value <= 1,
      label + ' for seat ' + seat + ' must be within [0, 1]');
    return value;
  });
  assert.ok(normalized[0] + normalized[1] <= 1 + 1e-9,
    label + ' seat win probabilities cannot sum to more than one');
  return normalized;
}

/**
 * Convert a typed terminal classification into realized per-seat win values.
 * A draw requires a versioned rule plus a concrete evidence reference; a bare
 * [0,0] vector can never attest that an unresolved/NONE state was adjudicated.
 */
function terminalOutcomeToWinProbabilityVector(outcome, label = 'Terminal outcome') {
  assert.ok(outcome !== null && typeof outcome === 'object' && !Array.isArray(outcome),
    label + ' must be a typed outcome object');
  const prototype = Object.getPrototypeOf(outcome);
  assert.ok(prototype === Object.prototype || prototype === null,
    label + ' must be a plain data object');
  if (outcome.kind === 'seat-win') {
    assert.ok(outcome.winnerSeat === 0 || outcome.winnerSeat === 1,
      label + ' winnerSeat must be 0 or 1');
    return outcome.winnerSeat === 0 ? [1, 0] : [0, 1];
  }
  if (outcome.kind === 'adjudicated-draw') {
    assert.ok(typeof outcome.ruleId === 'string' && /v\d+$/.test(outcome.ruleId),
      label + ' draw requires a versioned ruleId');
    assert.ok(typeof outcome.reason === 'string' && outcome.reason.trim().length > 0,
      label + ' draw requires a non-empty reason');
    assert.ok(typeof outcome.evidenceId === 'string' && outcome.evidenceId.trim().length > 0,
      label + ' draw requires a non-empty evidenceId');
    return [0, 0];
  }
  assert.fail(label + ' kind must be seat-win or adjudicated-draw; ' +
    'unresolved, invalid, aborted, NONE, and unknown outcomes are rejected');
}

/**
 * Each decision node maximizes its own seat's win probability. This is
 * intentionally general-sum: draws/nonwins are zero for both players.
 */
function backpropagateWinProbabilities(path, values) {
  for (let i = path.length - 1; i >= 0; i--) {
    const step = path[i];
    const stat = step.node.stats.get(step.actionKey);
    assert.ok(stat, 'Backpropagation lost its selected action');
    stat.visits += 1;
    stat.valueSum += values[step.seat];
    step.node.visits += 1;
  }
}

/**
 * Observation-keyed, determinization-based PUCT search.
 *
 * This is an information-set search core, not a complete Pokémon policy. The
 * caller must provide an observation-safe action frontier, a sampler that
 * draws hidden worlds from the acting player's belief, a transition adapter
 * that resolves prompts, and an observation-only value function.
 *
 * @param {object} config
 * @param {(state:object,seat:0|1)=>object} config.observe
 * @param {(state:object)=>0|1} config.activeSeat
 * @param {(state:object,seat:0|1)=>object[]} config.enumerateActions
 * @param {(action:object)=>string} config.actionKey
 * @param {(state:object,action:object,transitionRandom:()=>number,searchContext:object,rolloutContext?:{iteration:number,transitionActorSeat:0|1,promptRandom:()=>number,recordPromptEvent:(event:object)=>object})=>object} config.applyAction Existing four-argument callbacks remain compatible.
 * @param {(state:object,seat:0|1,random:()=>number)=>object} [config.sampleDeterminization]
 * @param {(state:object)=>boolean} config.isTerminal
 * @param {'zero-sum'|'seat-win-probability'} [config.valueMode='zero-sum']
 * @param {(state:object,seat:0|1)=>number} [config.terminalValue] Legacy zero-sum terminal utility.
 * @param {(observation:object,seat:0|1)=>number} [config.evaluateObservation] Legacy zero-sum value.
 * @param {(state:object)=>({kind:'seat-win',winnerSeat:0|1}|{kind:'adjudicated-draw',ruleId:string,reason:string,evidenceId:string})} [config.terminalOutcome] Typed realized outcome; unresolved/invalid/aborted/NONE classes are rejected.
 * @param {string} [config.terminalOutcomeProtocolId] Required versioned ID for the caller's terminal adjudication mapping.
 * @param {(observation:object,seat:0|1)=>[number,number]} [config.evaluateObservationValues] Actor-view-only per-seat win probabilities; sum must not exceed one.
 * @param {(action:object,observation:object,seat:0|1)=>number} [config.actionPrior]
 * @param {number} [config.iterations=128]
 * @param {number} [config.maxPlies=16]
 * @param {number} [config.cPuct=1.4]
 * @param {number} [config.seed=1]
 * @param {number} [config.maxDecisionMs=Infinity]
 * @param {()=>number} [config.now=performance.now]
 * @param {(state:object)=>boolean} [config.isStable]
 * @param {(observation:object,actionKeys:ReadonlyArray<string>,seat:0|1,random:()=>number)=>string} [config.opponentActionPolicy]
 *   Must be pure/stateless across independent determinization rollouts. Any
 *   history-dependent memory must be represented in the actor-visible
 *   observation; the supplied RNG is the only stochastic source.
 * @param {(state:object,seat:0|1,random:()=>number,actorObservation:object,deadline:object)=>object} [config.redeterminize]
 *   If supplied, replaces root-only sampling and is called before every
 *   nonterminal decision/leaf. It must return a detached world sampled from
 *   the acting seat's verified belief, preserving that seat's complete
 *   perfect-recall observation (public history and own prior actions/observations)
 *   and K0/K1/PARTIAL knowledge ledger. The core verifies equality, not
 *   completeness of the adapter's observation. Its isolated RNG is keyed only by seed,
 *   iteration, seat and observation hash, never internal ply. This is trusted
 *   host-side adapter code; never expose its full-State input to policy code.
 * @param {string} [config.opponentPolicyId] Required when an opponent policy is supplied.
 */
function createInformationSetMcts(config) {
  const required = [
    'observe', 'activeSeat', 'enumerateActions', 'actionKey', 'applyAction',
    'isTerminal'
  ];
  for (const name of required) assert.equal(typeof config[name], 'function',
    'Missing search dependency: ' + name);
  const valueMode = config.valueMode ?? 'zero-sum';
  assert.ok(valueMode === 'zero-sum' || valueMode === 'seat-win-probability',
    'valueMode must be zero-sum or seat-win-probability');
  if (valueMode === 'seat-win-probability') {
    assert.equal(typeof config.terminalOutcome, 'function',
      'seat-win-probability mode requires terminalOutcome(state)');
    assert.ok(typeof config.terminalOutcomeProtocolId === 'string' &&
      /v\d+$/.test(config.terminalOutcomeProtocolId),
    'seat-win-probability mode requires a versioned terminalOutcomeProtocolId');
    assert.equal(typeof config.evaluateObservationValues, 'function',
      'seat-win-probability mode requires evaluateObservationValues(observation, seat)');
  } else {
    assert.equal(typeof config.terminalValue, 'function',
      'zero-sum mode requires terminalValue(state, seat)');
    assert.equal(typeof config.evaluateObservation, 'function',
      'zero-sum mode requires evaluateObservation(observation, seat)');
  }
  const redeterminize = config.redeterminize ?? null;
  const sampleDeterminization = config.sampleDeterminization ?? null;
  if (redeterminize !== null) assert.equal(typeof redeterminize, 'function',
    'redeterminize must be a synchronous function');
  if (sampleDeterminization !== null) assert.equal(typeof sampleDeterminization, 'function',
    'sampleDeterminization must be a synchronous function');
  assert.ok(redeterminize !== null || sampleDeterminization !== null,
    'A root sampler or actor-relative re-determinizer is required');
  const iterations = config.iterations ?? 128;
  const maxPlies = config.maxPlies ?? 16;
  const cPuct = config.cPuct ?? 1.4;
  const seed = config.seed ?? 1;
  const maxDecisionMs = config.maxDecisionMs ?? Infinity;
  const now = config.now ?? (() => performance.now());
  assert.ok(Number.isSafeInteger(iterations) && iterations > 0 && iterations <= 100000);
  assert.ok(Number.isSafeInteger(maxPlies) && maxPlies > 0 && maxPlies <= 512);
  assert.ok(Number.isFinite(cPuct) && cPuct > 0);
  assert.ok(Number.isSafeInteger(seed) && seed >= 0 && seed <= 0xffffffff);
  assert.ok(maxDecisionMs === Infinity ||
    (Number.isFinite(maxDecisionMs) && maxDecisionMs > 0),
    'maxDecisionMs must be positive or Infinity');
  assert.equal(typeof now, 'function');
  const isStable = config.isStable ?? (() => true);
  const opponentActionPolicy = config.opponentActionPolicy ?? null;
  if (opponentActionPolicy !== null) {
    assert.equal(typeof opponentActionPolicy, 'function',
      'opponentActionPolicy must be a synchronous function');
    assert.ok(typeof config.opponentPolicyId === 'string' &&
      config.opponentPolicyId.length > 0,
      'opponentActionPolicy requires a stable opponentPolicyId');
  }

  return Object.freeze({
    search(rootState, rootSeat) {
      const startedAt = now();
      assert.ok(Number.isFinite(startedAt), 'Monotonic clock returned a non-finite value');
      const deadlineAt = startedAt + maxDecisionMs;
      const checkDeadline = stage => {
        const current = now();
        assert.ok(Number.isFinite(current), 'Monotonic clock returned a non-finite value');
        if (current - startedAt >= maxDecisionMs) {
          const error = new Error('MCTS decision-time budget exceeded at ' + stage);
          error.code = 'MCTS_BUDGET_EXCEEDED';
          error.stage = stage;
          throw error;
        }
      };
      const searchContext = Object.freeze({
        rootSeat,startedAt,deadlineAt,maxDecisionMs,seed,now,checkDeadline
      });
      const redeterminizationDeadline = Object.freeze({
        checkDeadline: stage => checkDeadline(stage)
      });
      const prepareActorState = (inputState, actorSeat, iteration, stage) => {
        assert.equal(isStable(inputState), true,
          'Actor-relative sampling requires a stable decision state');
        assert.equal(config.isTerminal(inputState), false,
          'Actor-relative sampling cannot begin from a terminal state');
        checkDeadline(stage + '-observation-start');
        const beforeObservation = config.observe(inputState, actorSeat, searchContext);
        checkDeadline(stage + '-observation-complete');
        const beforeHash = observationSha256(beforeObservation);
        if (redeterminize === null) {
          return {
            state: inputState,
            observation: beforeObservation,
            observationHash: beforeHash
          };
        }
        checkDeadline(stage + '-redeterminization-start');
        const actorRandom = seededRandom(
          actorRelativeDeterminizationSeed(seed, iteration, actorSeat, beforeHash)
        );
        const sampledState = redeterminize(
          inputState,
          actorSeat,
          actorRandom,
          frozenPolicyObservation(beforeObservation),
          redeterminizationDeadline
        );
        checkDeadline(stage + '-redeterminization-complete');
        assert.ok(sampledState && typeof sampledState === 'object' &&
          sampledState !== inputState,
          'Actor-relative determinization must return a detached state');
        assert.equal(isStable(sampledState), true,
          'Actor-relative determinization returned a state with unresolved prompts');
        assert.equal(config.isTerminal(sampledState), false,
          'Actor-relative determinization changed terminality');
        assert.equal(config.activeSeat(sampledState), actorSeat,
          'Actor-relative determinization changed the acting seat');
        const afterObservation = config.observe(sampledState, actorSeat, searchContext);
        checkDeadline(stage + '-redeterminized-observation');
        const afterHash = observationSha256(afterObservation);
        assert.equal(afterHash, beforeHash,
          'Actor-relative determinization changed the acting player\'s information set');
        actorRelativeDeterminizationCallsBySeat[actorSeat] += 1;
        actorObservationPreservationChecks += 1;
        return {
          state: sampledState,
          observation: afterObservation,
          observationHash: afterHash
        };
      };
      checkDeadline('root-validation');
      assert.ok(rootSeat === 0 || rootSeat === 1);
      assert.equal(config.activeSeat(rootState), rootSeat,
        'Search root must belong to the acting physical seat');
      assert.equal(config.isTerminal(rootState), false,
        'Cannot search a terminal game');
      assert.equal(isStable(rootState), true,
        'Search root must have no unresolved prompts');

      const rootObservation = config.observe(rootState, rootSeat, searchContext);
      checkDeadline('root-observation');
      const rootObservationHash = observationSha256(rootObservation);
      const rootActions = config.enumerateActions(rootState, rootSeat, searchContext);
      checkDeadline('root-frontier');
      const rootActionMap = buildActionMap(rootActions, config.actionKey);
      assert.ok(rootActionMap.size > 0, 'Search root has no legal actions');
      const rootKey = rootSeat + ':' + rootObservationHash;
      const rootNode = createNode(rootKey, rootSeat, rootActions,
        rootObservation, config.actionPrior, config.actionKey);
      checkDeadline('root-node-priors');
      const nodes = new Map([[rootKey, rootNode]]);
      let terminalRollouts = 0;
      let heuristicLeaves = 0;
      let maxObservedDepth = 0;
      let maxActionTransitions = 0;
      let completedIterations = 0;
      const seatActionTransitions = [0,0];
      const actorRelativeDeterminizationCallsBySeat = [0,0];
      let actorObservationPreservationChecks = 0;
      const rolloutPaths = [];
      const opponentFrontiers = new Map();
      let opponentPolicyCalls = 0;
      let opponentPolicyCacheHits = 0;

      for (let iteration = 0; iteration < iterations; iteration++) {
        checkDeadline('iteration-start');
        // A behavioral policy chooses once for each information set in this rollout.
        const opponentPolicyDecisions = new Map();
        const sampleRandom = seededRandom(mixSeed(seed, iteration, 0x51ed270b));
        const transitionRandom = seededRandom(mixSeed(seed, iteration, 0x2c1b3c6d));
        const promptRandom = seededRandom(mixSeed(seed, iteration, 0x3c6ef372));
        const rolloutContext = createRolloutContext(iteration, promptRandom);
        let state;
        if (redeterminize === null) {
          state = sampleDeterminization(rootState, rootSeat, sampleRandom, searchContext);
          checkDeadline('determinization');
          assert.ok(state && typeof state === 'object' && state !== rootState,
            'Determinization must return a detached state');
          assert.equal(isStable(state), true,
            'Determinized root must have no unresolved prompts');
          assert.equal(config.activeSeat(state), rootSeat,
            'Determinization changed the acting seat');
          assert.equal(observationSha256(
            config.observe(state, rootSeat, searchContext)),
            rootObservationHash,
            'Determinization changed the root player\'s legal observation');
          checkDeadline('determinized-root-observation');
        } else {
          // Each decision node, including the root, is sampled from the
          // acting seat's own information set immediately before selection.
          state = rootState;
        }

        const path = [];
        const actionPath = [];
        let seat = rootSeat;
        let leafValue;
        let leafSeat;
        let finished = false;

        for (let ply = 0; ply < maxPlies; ply++) {
          maxObservedDepth = Math.max(maxObservedDepth, ply);
          if (config.isTerminal(state)) {
            leafValue = valueMode === 'seat-win-probability' ?
              terminalOutcomeToWinProbabilityVector(config.terminalOutcome(state), 'Terminal outcome') :
              config.terminalValue(state, seat);
            checkDeadline('terminal-value');
            leafSeat = seat;
            terminalRollouts += 1;
            finished = true;
            break;
          }
          assert.equal(isStable(state), true,
            'Transition adapter returned a state with unresolved prompts');
          const prepared = prepareActorState(state, seat, iteration, 'node');
          state = prepared.state;
          const observation = prepared.observation;
          const observationHash = prepared.observationHash;
          if (ply === 0) assert.equal(observationHash, rootObservationHash,
            'Actor-relative root observation differs from the live root information set');
          const nodeKey = seat + ':' + observationHash;
          let node = nodes.get(nodeKey);
          const actions = config.enumerateActions(state, seat, searchContext);
          checkDeadline('node-frontier');
          const actionMap = buildActionMap(actions, config.actionKey);
          if (seat !== rootSeat && opponentActionPolicy !== null) {
            const actionKeys = Object.freeze([...actionMap.keys()].sort());
            const previousFrontier = opponentFrontiers.get(nodeKey);
            if (previousFrontier) {
              assert.deepEqual(previousFrontier, actionKeys,
                'Opponent legal action frontier depends on hidden state for an identical observation');
            } else {
              opponentFrontiers.set(nodeKey, actionKeys);
            }
            if (actionMap.size === 0) {
              leafValue = valueMode === 'seat-win-probability' ?
                validateWinProbabilityVector(
                  config.evaluateObservationValues(observation, seat),
                  'Observation value evaluation') :
                config.evaluateObservation(observation, seat);
              checkDeadline('opponent-no-action-evaluation');
              leafSeat = seat;
              heuristicLeaves += 1;
              finished = true;
              break;
            }
            let selectedKey;
            if (opponentPolicyDecisions.has(nodeKey)) {
              // Reuse the first behavioral draw if this information set is
              // revisited within the same determinization rollout.
              selectedKey = opponentPolicyDecisions.get(nodeKey);
              opponentPolicyCacheHits += 1;
            } else {
              // The policy RNG is keyed to the same actor information set used
              // by the node/frontier guard. Never include search-internal ply:
              // different hidden-world paths can reach this same observation
              // at different depths. It is isolated from transition randomness.
              const policyObservation = frozenPolicyObservation(observation);
              const policyRandom = seededRandom(
                opponentPolicySeed(seed, iteration, seat, observationHash)
              );
              selectedKey = opponentActionPolicy(
                policyObservation, actionKeys, seat, policyRandom
              );
              checkDeadline('opponent-policy');
              assert.ok(typeof selectedKey === 'string' && actionMap.has(selectedKey),
                'Opponent policy selected an action outside its observation-safe frontier');
              opponentPolicyDecisions.set(nodeKey, selectedKey);
              opponentPolicyCalls += 1;
            }
            checkDeadline('opponent-policy-decision');
            assert.ok(typeof selectedKey === 'string' && actionMap.has(selectedKey),
              'Opponent policy selected an action outside its observation-safe frontier');
            const selectedAction = actionMap.get(selectedKey);
            actionPath.push({seat,actionKey:selectedKey});
            seatActionTransitions[seat]++;
            checkDeadline('transition-start');
            const actionContext = rolloutContext.forAction(seat);
            let nextState;
            try {
              nextState = config.applyAction(
                state, selectedAction, transitionRandom, searchContext, actionContext.view);
            } finally {
              actionContext.close();
            }
            checkDeadline('transition-complete');
            assert.ok(nextState && typeof nextState === 'object' && nextState !== state,
              'Action adapter must return a detached successor state');
            state = nextState;
            maxActionTransitions = Math.max(maxActionTransitions, actionPath.length);
            seat = config.activeSeat(state);
            assert.ok(seat === 0 || seat === 1,
              'Active-seat adapter returned an invalid physical seat');
            continue;
          }
          if (!node) {
            if (actionMap.size === 0) {
              leafValue = valueMode === 'seat-win-probability' ?
                validateWinProbabilityVector(
                  config.evaluateObservationValues(observation, seat),
                  'Observation value evaluation') :
                config.evaluateObservation(observation, seat);
              checkDeadline('new-node-evaluation');
              leafSeat = seat;
              heuristicLeaves += 1;
              finished = true;
              break;
            }
            node = createNode(nodeKey, seat, actions, observation,
              config.actionPrior, config.actionKey);
            nodes.set(nodeKey, node);
            leafValue = valueMode === 'seat-win-probability' ?
                validateWinProbabilityVector(
                  config.evaluateObservationValues(observation, seat),
                  'Observation value evaluation') :
                config.evaluateObservation(observation, seat);
            checkDeadline('new-node-evaluation');
            leafSeat = seat;
            heuristicLeaves += 1;
            finished = true;
            break;
          }
          assert.equal(node.seat, seat);
          assert.deepEqual([...node.stats.keys()].sort(),
            [...actionMap.keys()].sort(),
            'Legal action frontier depends on hidden state for an identical observation');
          const selectedKey = selectPuctAction(node, cPuct);
          const selectedAction = actionMap.get(selectedKey);
          assert.ok(selectedAction, 'Selected action is absent from current state frontier');
          path.push({node, actionKey: selectedKey, seat});
          actionPath.push({seat,actionKey:selectedKey});
          seatActionTransitions[seat]++;
          checkDeadline('transition-start');
          const actionContext = rolloutContext.forAction(seat);
          let nextState;
          try {
            nextState = config.applyAction(
              state, selectedAction, transitionRandom, searchContext, actionContext.view);
          } finally {
            actionContext.close();
          }
          checkDeadline('transition-complete');
          assert.ok(nextState && typeof nextState === 'object' && nextState !== state,
            'Action adapter must return a detached successor state');
          state = nextState;
          maxActionTransitions = Math.max(maxActionTransitions, actionPath.length);
          seat = config.activeSeat(state);
          assert.ok(seat === 0 || seat === 1,
            'Active-seat adapter returned an invalid physical seat');
        }

        // The final permitted transition can itself end the game. The loop
        // checks terminality at each ply's start, so recognize this boundary
        // before falling through to a heuristic evaluation of a terminal state.
        if (!finished && config.isTerminal(state)) {
          leafValue = valueMode === 'seat-win-probability' ?
              terminalOutcomeToWinProbabilityVector(config.terminalOutcome(state), 'Terminal outcome') :
              config.terminalValue(state, seat);
          checkDeadline('terminal-value-after-final-ply');
          leafSeat = seat;
          terminalRollouts += 1;
          finished = true;
        }

        const promptEvents = rolloutContext.close();
        rolloutPaths.push(Object.freeze({
          iteration,
          actions: Object.freeze(actionPath.slice()),
          promptEvents
        }));
        if (!finished) {
          const prepared = prepareActorState(state, seat, iteration, 'leaf');
          state = prepared.state;
          const observation = prepared.observation;
          leafValue = valueMode === 'seat-win-probability' ?
                validateWinProbabilityVector(
                  config.evaluateObservationValues(observation, seat),
                  'Observation value evaluation') :
                config.evaluateObservation(observation, seat);
          checkDeadline('leaf-evaluation');
          leafSeat = seat;
          heuristicLeaves += 1;
        }
        if (valueMode === 'seat-win-probability') {
          backpropagateWinProbabilities(path, leafValue);
        } else {
          assert.ok(Number.isFinite(leafValue) && leafValue >= -1 && leafValue <= 1,
            'Leaf value must be finite and normalized to [-1, 1]');
          backpropagate(path, leafValue, leafSeat);
        }
        completedIterations += 1;
        checkDeadline('iteration-complete');
      }

      checkDeadline('search-complete');
      const elapsedMs = now() - startedAt;
      assert.ok(Number.isFinite(elapsedMs) && elapsedMs >= 0,
        'Monotonic clock returned an invalid elapsed duration');
      if(elapsedMs>=maxDecisionMs) {
        const error=new Error('MCTS decision-time budget exceeded during result finalization');
        error.code='MCTS_BUDGET_EXCEEDED';
        error.stage='result-finalization';
        throw error;
      }
      const rootStats = [...rootNode.stats.entries()].map(([key, stat]) => ({
        actionKey: key,
        visits: stat.visits,
        prior: stat.prior,
        meanValue: stat.visits === 0 ? 0 : stat.valueSum / stat.visits
      })).sort((a, b) => b.visits - a.visits ||
        b.meanValue - a.meanValue || b.prior - a.prior ||
        a.actionKey.localeCompare(b.actionKey));
      const selected = rootStats[0];
      assert.ok(selected && rootActionMap.has(selected.actionKey));
      return {
        action: rootActionMap.get(selected.actionKey),
        actionKey: selected.actionKey,
        audit: {
          valueMode,
          terminalOutcomeProtocolId: valueMode === 'seat-win-probability' ?
            config.terminalOutcomeProtocolId : null,
          promptEventSchemaId: PROMPT_EVENT_SCHEMA_ID,
          promptRandomProtocolId: PROMPT_RANDOM_PROTOCOL_ID,
          searchMode: typeof config.opponentActionPolicy === 'function' ?
            'root-best-response-fixed-opponent-policy' : 'two-sided-puct',
          objectiveProtocol: valueMode === 'seat-win-probability' ?
            'each-seat-maximizes-own-win-probability-adjudicated-draws-zero-v1' :
            'zero-sum-seat-relative-value-v1',
          protocol: redeterminize === null ?
            'observation-keyed-determinization-puct-v1' :
            'observation-keyed-actor-relative-redeterminization-puct-v1',
          determinizationMode: redeterminize === null ? 'root-only' : 'actor-relative',
          actorRelativeDeterminizationProtocol: redeterminize === null ? null :
            'observation-preserving-per-decision-v1',
          actorRelativeDeterminizationRngProtocol: redeterminize === null ? null :
            'seed-iteration-seat-observation-v1',
          actorRelativeDeterminizationCallsBySeat,
          actorRelativeDeterminizationCalls:
            actorRelativeDeterminizationCallsBySeat[0] +
            actorRelativeDeterminizationCallsBySeat[1],
          actorObservationPreservationChecks,
          opponentModel: redeterminize !== null ?
            (opponentActionPolicy === null ? 'actor-relative-puct' :
              'actor-relative-fixed-actor-observation-policy') :
            (opponentActionPolicy === null ?
              'root-determinization-puct' : 'fixed-actor-observation-policy'),
          opponentPolicyId: opponentActionPolicy === null ? null : config.opponentPolicyId,
          opponentPolicyRngProtocol: opponentActionPolicy === null ? null :
            'mcts-opponent-policy-rng-v2',
          opponentPolicyContextProtocol: opponentActionPolicy === null ? null :
            'no-context-v1',
          opponentPolicyInputProtocol: opponentActionPolicy === null ? null :
            'deep-frozen-json-snapshot-v1',
          opponentPolicyDecisionProtocol: opponentActionPolicy === null ? null :
            'one-action-per-information-set-per-iteration-v1',
          opponentPolicyPurityContract: opponentActionPolicy === null ? null :
            'stateless-actor-observation-only-v1',
          opponentPolicyCalls,
          opponentPolicyCacheHits,
          opponentInformationSetCount: opponentFrontiers.size,
          rootSeat,
          rootObservationSha256: rootObservationHash,
          iterations,
          completedIterations,
          maxDecisionMs: Number.isFinite(maxDecisionMs) ? maxDecisionMs : null,
          maxPlies,
          cPuct,
          elapsedMs: Number(elapsedMs.toFixed(3)),
          timeoutStatus: 'completed',
          seed,
          rootActionCount: rootActionMap.size,
          maxActionTransitions,
          seatActionTransitions,
          rolloutPaths,
          rootVisits: rootNode.visits,
          nodeCount: nodes.size,
          terminalRollouts,
          heuristicLeaves,
          maxObservedDepth,
          selectedActionKey: selected.actionKey,
          rootActions: rootStats
        }
      };
    }
  });
}

module.exports = {
  canonicalJson,
  observationSha256,
  seededRandom,
  validateWinProbabilityVector,
  terminalOutcomeToWinProbabilityVector,
  createInformationSetMcts
};
