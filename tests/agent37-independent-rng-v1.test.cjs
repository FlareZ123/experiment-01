'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const rng = require('../simulation/evaluation/agent37-independent-rng-v1.cjs');
const { deckPermutation, runMatch } = require('../simulation/twinleaf/headless.cjs');

function fixedMaterial() {
  return {
    schema: rng.SCHEMA,
    algorithm: rng.ALGORITHM,
    streams: Object.fromEntries(rng.STREAM_NAMES.map((name, i) =>
      [name, (i + 1).toString(16).padStart(64, '0')]))
  };
}

function baseRequest(overrides = {}) {
  return {
    deckA: Array(60).fill('synthetic-card'),
    deckB: Array(60).fill('synthetic-card'),
    seed: 17,
    rngProtocol: rng.PROTOCOL,
    isolatePolicyRandomness: true,
    rngMaterial: fixedMaterial(),
    rngMaterialCommitment: rng.randomMaterialCommitment(fixedMaterial()),
    ...overrides
  };
}

test('material is six unique independently keyed 256-bit streams with stable commitment', () => {
  const material = rng.createRandomMaterial();
  assert.deepEqual(Object.keys(material).sort(), ['algorithm', 'schema', 'streams']);
  assert.equal(material.schema, rng.SCHEMA);
  assert.equal(material.algorithm, rng.ALGORITHM);
  assert.deepEqual(Object.keys(material.streams).sort(), [...rng.STREAM_NAMES].sort());
  assert.equal(new Set(Object.values(material.streams)).size, 6);
  assert.ok(Object.values(material.streams).every(x => /^[0-9a-f]{64}$/.test(x)));
  assert.equal(rng.randomMaterialCommitment(material), rng.randomMaterialCommitment(material));
  assert.throws(() => rng.validateRandomMaterial({...material, extra: true}), /schema/);
  assert.throws(() => rng.validateRandomMaterial({...material, streams: {
    ...material.streams, coin: material.streams.engine
  }}), /unique/);
});

test('bounded integer mapping rejects the incomplete upper tail instead of modulo bias', () => {
  const values = [0xffffffff, 5];
  let calls = 0;
  const result = rng.boundedRandomInt(() => values[calls++], 3);
  assert.equal(result, 2);
  assert.equal(calls, 2);
  assert.equal(rng.boundedRandomInt(() => 0xffffffff, 0x100000000), 0xffffffff);
  assert.equal(rng.boundedRandomInt(() => 123, 1), 0);
  for (const bad of [0, -1, 1.5, 0x100000001, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => rng.boundedRandomInt(() => 0, bad), /bound/);
  }
  assert.throws(() => rng.boundedRandomInt(() => -1, 2), /unsigned 32-bit/);
});

test('HMAC counter streams replay exactly and distinct stream keys do not alias', () => {
  const material = fixedMaterial();
  const first = rng.createIndependentStreams(material);
  const second = rng.createIndependentStreams(material);
  for (const name of rng.STREAM_NAMES) {
    const a = Array.from({length:12}, () => first[name].nextUint32());
    const b = Array.from({length:12}, () => second[name].nextUint32());
    assert.deepEqual(a, b);
    assert.ok(a.every(x => Number.isInteger(x) && x >= 0 && x < 0x100000000));
  }
  const a = rng.createIndependentStreams(material);
  const seat0 = Array.from({length:8}, () => a.shuffleSeat0.nextUint32());
  const b = rng.createIndependentStreams(material);
  const seat1 = Array.from({length:8}, () => b.shuffleSeat1.nextUint32());
  assert.notDeepEqual(seat0, seat1);
  const float = rng.createRandomStream(material.streams.engine, 'engine');
  for (let i = 0; i < 100; i += 1) {
    const value = float();
    assert.ok(value >= 0 && value < 1);
  }
  assert.equal(typeof float.randomInt, 'function');
  const sameKey = material.streams.engine;
  const engineDomain = rng.createRandomStream(sameKey, 'engine');
  const coinDomain = rng.createRandomStream(sameKey, 'coin');
  assert.notDeepEqual(
    Array.from({length:8}, () => engineDomain.nextUint32()),
    Array.from({length:8}, () => coinDomain.nextUint32())
  );
  const bounded = rng.createRandomStream(sameKey, 'bounded-range');
  for (let i = 0; i < 1000; i += 1) {
    const value = bounded.randomInt(60);
    assert.ok(Number.isInteger(value) && value >= 0 && value < 60);
  }
});

test('Fisher-Yates uses unbiased bounded indices and returns a permutation', () => {
  const draws = [0, 1, 2, 1];
  const calls = [];
  const permutation = rng.fisherYatesPermutation(5, bound => {
    calls.push(bound);
    return draws.shift();
  });
  assert.deepEqual(calls, [5, 4, 3, 2]);
  assert.deepEqual([...permutation].sort((a,b) => a-b), [0,1,2,3,4]);
  assert.throws(() => rng.fisherYatesPermutation(3, () => 3), /out-of-range/);
  assert.throws(() => rng.fisherYatesPermutation(-1, () => 0), /length/);
  assert.throws(() => rng.fisherYatesPermutation(0x100000000, () => 0), /length/);
  assert.deepEqual(rng.fisherYatesPermutation(0, () => 0), []);
  assert.deepEqual(rng.fisherYatesPermutation(1, () => 0), [0]);
});

test('headless deck shuffle consumes exact bounded integers when the source provides them', () => {
  const draws = [0, 1, 2, 1];
  const bounds = [];
  const source = () => { throw new Error('float fallback must not be used'); };
  source.randomInt = bound => { bounds.push(bound); return draws.shift(); };
  const result = deckPermutation(5, source);
  assert.deepEqual(bounds, [5, 4, 3, 2]);
  assert.deepEqual([...result].sort((a,b) => a-b), [0,1,2,3,4]);
});

test('headless rejects malformed independent RNG material before loading the game engine', () => {
  const request = baseRequest({rngMaterial: {schema:'wrong'}});
  assert.throws(() => runMatch(request), /Invalid independent CSPRNG material schema/);
});

test('headless rejects mismatched material commitment before loading the game engine', () => {
  const request = baseRequest({rngMaterialCommitment: '0'.repeat(64)});
  assert.throws(() => runMatch(request), /commitment does not match/);
});

test('headless independent protocol requires policy isolation and excludes legacy shuffle flags', () => {
  assert.throws(() => runMatch(baseRequest({isolatePolicyRandomness:false})),
    /owns policy and physical-shuffle streams/);
  assert.throws(() => runMatch(baseRequest({isolatePhysicalShuffleRandomness:true})),
    /owns policy and physical-shuffle streams/);
});
