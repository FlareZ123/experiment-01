'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

function canonicalJson(value, seen = new Set()) {
  if (value === null) return 'null';
  const type = typeof value;
  if (type === 'string' || type === 'boolean') return JSON.stringify(value);
  if (type === 'number') {
    assert.ok(Number.isFinite(value), 'Observation contains a non-finite number');
    return JSON.stringify(value);
  }
  if (type === 'undefined') return '"[undefined]"';
  if (type === 'function') return '"[function]"';
  assert.equal(type, 'object', 'Observation contains an unsupported value');
  assert.equal(seen.has(value), false, 'Observation contains a cycle');
  seen.add(value);
  let result;
  if (Array.isArray(value)) {
    result = '[' + value.map(item => canonicalJson(item, seen)).join(',') + ']';
  } else {
    const proto = Object.getPrototypeOf(value);
    assert.ok(proto === Object.prototype || proto === null,
      'Observation must contain only plain objects');
    const keys = Object.keys(value).sort();
    result = '{' + keys.map(key => JSON.stringify(key) + ':' +
      canonicalJson(value[key], seen)).join(',') + '}';
  }
  seen.delete(value);
  return result;
}

function observationSha256(observation) {
  return createHash('sha256').update(canonicalJson(observation)).digest('hex');
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
 * @param {(state:object,action:object,random:()=>number)=>object} config.applyAction
 * @param {(state:object,seat:0|1,random:()=>number)=>object} config.sampleDeterminization
 * @param {(state:object)=>boolean} config.isTerminal
 * @param {(state:object,seat:0|1)=>number} config.terminalValue
 * @param {(observation:object,seat:0|1)=>number} config.evaluateObservation
 * @param {(action:object,observation:object,seat:0|1)=>number} [config.actionPrior]
 * @param {number} [config.iterations=128]
 * @param {number} [config.maxPlies=16]
 * @param {number} [config.cPuct=1.4]
 * @param {number} [config.seed=1]
 * @param {(state:object)=>boolean} [config.isStable]
 */
function createInformationSetMcts(config) {
  const required = [
    'observe', 'activeSeat', 'enumerateActions', 'actionKey', 'applyAction',
    'sampleDeterminization', 'isTerminal', 'terminalValue', 'evaluateObservation'
  ];
  for (const name of required) assert.equal(typeof config[name], 'function',
    'Missing search dependency: ' + name);
  const iterations = config.iterations ?? 128;
  const maxPlies = config.maxPlies ?? 16;
  const cPuct = config.cPuct ?? 1.4;
  const seed = config.seed ?? 1;
  assert.ok(Number.isSafeInteger(iterations) && iterations > 0 && iterations <= 100000);
  assert.ok(Number.isSafeInteger(maxPlies) && maxPlies > 0 && maxPlies <= 512);
  assert.ok(Number.isFinite(cPuct) && cPuct > 0);
  assert.ok(Number.isSafeInteger(seed) && seed >= 0 && seed <= 0xffffffff);
  const isStable = config.isStable ?? (() => true);

  return Object.freeze({
    search(rootState, rootSeat) {
      assert.ok(rootSeat === 0 || rootSeat === 1);
      assert.equal(config.activeSeat(rootState), rootSeat,
        'Search root must belong to the acting physical seat');
      assert.equal(config.isTerminal(rootState), false,
        'Cannot search a terminal game');
      assert.equal(isStable(rootState), true,
        'Search root must have no unresolved prompts');

      const rootObservation = config.observe(rootState, rootSeat);
      const rootObservationHash = observationSha256(rootObservation);
      const rootActions = config.enumerateActions(rootState, rootSeat);
      const rootActionMap = buildActionMap(rootActions, config.actionKey);
      assert.ok(rootActionMap.size > 0, 'Search root has no legal actions');
      const rootKey = rootSeat + ':' + rootObservationHash;
      const rootNode = createNode(rootKey, rootSeat, rootActions,
        rootObservation, config.actionPrior, config.actionKey);
      const nodes = new Map([[rootKey, rootNode]]);
      let terminalRollouts = 0;
      let heuristicLeaves = 0;
      let maxObservedDepth = 0;

      for (let iteration = 0; iteration < iterations; iteration++) {
        const sampleRandom = seededRandom(mixSeed(seed, iteration, 0x51ed270b));
        const transitionRandom = seededRandom(mixSeed(seed, iteration, 0x2c1b3c6d));
        let state = config.sampleDeterminization(rootState, rootSeat, sampleRandom);
        assert.ok(state && typeof state === 'object' && state !== rootState,
          'Determinization must return a detached state');
        assert.equal(isStable(state), true,
          'Determinized root must have no unresolved prompts');
        assert.equal(config.activeSeat(state), rootSeat,
          'Determinization changed the acting seat');
        assert.equal(observationSha256(config.observe(state, rootSeat)),
          rootObservationHash,
          'Determinization changed the root player\'s legal observation');

        const path = [];
        let seat = rootSeat;
        let leafValue;
        let leafSeat;
        let finished = false;

        for (let ply = 0; ply < maxPlies; ply++) {
          maxObservedDepth = Math.max(maxObservedDepth, ply);
          if (config.isTerminal(state)) {
            leafValue = config.terminalValue(state, seat);
            leafSeat = seat;
            terminalRollouts += 1;
            finished = true;
            break;
          }
          assert.equal(isStable(state), true,
            'Transition adapter returned a state with unresolved prompts');
          const observation = config.observe(state, seat);
          const observationHash = observationSha256(observation);
          const nodeKey = seat + ':' + observationHash;
          let node = nodes.get(nodeKey);
          const actions = config.enumerateActions(state, seat);
          const actionMap = buildActionMap(actions, config.actionKey);
          if (!node) {
            if (actionMap.size === 0) {
              leafValue = config.evaluateObservation(observation, seat);
              leafSeat = seat;
              heuristicLeaves += 1;
              finished = true;
              break;
            }
            node = createNode(nodeKey, seat, actions, observation,
              config.actionPrior, config.actionKey);
            nodes.set(nodeKey, node);
            leafValue = config.evaluateObservation(observation, seat);
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
          const nextState = config.applyAction(state, selectedAction, transitionRandom);
          assert.ok(nextState && typeof nextState === 'object' && nextState !== state,
            'Action adapter must return a detached successor state');
          state = nextState;
          seat = config.activeSeat(state);
          assert.ok(seat === 0 || seat === 1,
            'Active-seat adapter returned an invalid physical seat');
        }

        if (!finished) {
          const observation = config.observe(state, seat);
          leafValue = config.evaluateObservation(observation, seat);
          leafSeat = seat;
          heuristicLeaves += 1;
        }
        assert.ok(Number.isFinite(leafValue) && leafValue >= -1 && leafValue <= 1,
          'Leaf value must be finite and normalized to [-1, 1]');
        backpropagate(path, leafValue, leafSeat);
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
          protocol: 'observation-keyed-determinization-puct-v1',
          rootSeat,
          rootObservationSha256: rootObservationHash,
          iterations,
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
  createInformationSetMcts
};
