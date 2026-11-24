'use strict';

const { createHash, createHmac, randomBytes } = require('node:crypto');

const SCHEMA = 'aichi-independent-rng-material-v1';
const PROTOCOL = 'independent-csprng-streams-v1';
const ALGORITHM = 'hmac-sha256-counter-v1';
const UINT32_RANGE = 0x100000000;
const STREAM_NAMES = Object.freeze([
  'shuffleSeat0', 'shuffleSeat1', 'coin', 'engine', 'policySeat0', 'policySeat1'
]);
const MATERIAL_KEYS = Object.freeze(['schema', 'algorithm', 'streams']);

/** @param {unknown} material @returns {{schema:string,algorithm:string,streams:Record<string,string>}} */
function validateRandomMaterial(material) {
  if (!material || typeof material !== 'object' || Array.isArray(material) ||
      Object.keys(material).sort().join('|') !== [...MATERIAL_KEYS].sort().join('|') ||
      material.schema !== SCHEMA || material.algorithm !== ALGORITHM ||
      !material.streams || typeof material.streams !== 'object' ||
      Array.isArray(material.streams) ||
      Object.keys(material.streams).sort().join('|') !== [...STREAM_NAMES].sort().join('|')) {
    throw new Error('Invalid independent CSPRNG material schema.');
  }
  const streams = {};
  const seen = new Set();
  for (const name of STREAM_NAMES) {
    const seed = material.streams[name];
    if (typeof seed !== 'string' || !/^[0-9a-f]{64}$/.test(seed)) {
      throw new Error('Each RNG stream needs exactly 32 bytes of lowercase hex: ' + name);
    }
    if (seen.has(seed)) throw new Error('RNG stream seed material must be unique.');
    seen.add(seed);
    streams[name] = seed;
  }
  return { schema: SCHEMA, algorithm: ALGORITHM, streams };
}

/**
 * Draw six separate 256-bit keys from Node's OS-backed CSPRNG.
 * These are independent CSPRNG draws, not derivations from one 32-bit seed.
 * @returns {{schema:string,algorithm:string,streams:Record<string,string>}}
 */
function createRandomMaterial() {
  const streams = {};
  for (const name of STREAM_NAMES) streams[name] = randomBytes(32).toString('hex');
  return validateRandomMaterial({ schema: SCHEMA, algorithm: ALGORITHM, streams });
}

/** @param {unknown} material @returns {string} */
function randomMaterialCommitment(material) {
  const normalized = validateRandomMaterial(material);
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

/**
 * Uniformly map a uint32 source into [0, bound) by rejection sampling.
 * @param {()=>number} nextUint32
 * @param {number} bound Integer in [1, 2^32].
 * @returns {number}
 */
function boundedRandomInt(nextUint32, bound) {
  if (typeof nextUint32 !== 'function' || !Number.isSafeInteger(bound) ||
      bound < 1 || bound > UINT32_RANGE) {
    throw new Error('randomInt bound must be an integer from 1 through 2^32.');
  }
  const range = BigInt(UINT32_RANGE);
  const divisor = BigInt(bound);
  const limit = range - (range % divisor);
  for (;;) {
    const value = nextUint32();
    if (!Number.isInteger(value) || value < 0 || value >= UINT32_RANGE) {
      throw new Error('RNG source must return an unsigned 32-bit integer.');
    }
    const wideValue = BigInt(value);
    if (wideValue < limit) return Number(wideValue % divisor);
  }
}

/**
 * Deterministic HMAC-SHA256 counter stream keyed by one independently drawn
 * 256-bit seed. The resulting stream is computationally pseudorandom under
 * the HMAC/OS-CSPRNG assumptions; it is not a claim of literal independence.
 * @param {string} seedHex
 * @param {string} domain
 * @returns {(()=>number) & {randomInt:(bound:number)=>number,nextUint32:()=>number,domain:string}}
 */
function createRandomStream(seedHex, domain) {
  if (typeof seedHex !== 'string' || !/^[0-9a-f]{64}$/.test(seedHex) ||
      typeof domain !== 'string' || !/^[A-Za-z0-9:_-]{1,64}$/.test(domain)) {
    throw new Error('Invalid HMAC stream key or domain.');
  }
  const key = Buffer.from(seedHex, 'hex');
  const prefix = Buffer.from(SCHEMA + '\0' + domain + '\0', 'utf8');
  let counter = 0n;
  let block = Buffer.alloc(0);
  let offset = 0;

  function refill() {
    if (counter > 0xffffffffffffffffn) throw new Error('RNG counter exhausted.');
    const counterBytes = Buffer.alloc(8);
    counterBytes.writeBigUInt64BE(counter);
    counter += 1n;
    block = createHmac('sha256', key).update(prefix).update(counterBytes).digest();
    offset = 0;
  }

  function nextUint32() {
    if (offset + 4 > block.length) refill();
    const value = block.readUInt32BE(offset);
    offset += 4;
    return value;
  }

  function random() {
    return nextUint32() / UINT32_RANGE;
  }

  function randomInt(bound) {
    return boundedRandomInt(nextUint32, bound);
  }

  Object.defineProperties(random, {
    randomInt: { value: randomInt, enumerable: true },
    nextUint32: { value: nextUint32 },
    domain: { value: domain, enumerable: true },
    protocol: { value: PROTOCOL, enumerable: true }
  });
  return Object.freeze(random);
}

/** @param {unknown} material */
function createIndependentStreams(material) {
  const normalized = validateRandomMaterial(material);
  const streams = {};
  for (const name of STREAM_NAMES) {
    streams[name] = createRandomStream(normalized.streams[name], name);
  }
  return Object.freeze(streams);
}

/**
 * Uniform Fisher-Yates permutation using an exact bounded-integer source.
 * @param {number} length
 * @param {(bound:number)=>number} randomInt
 * @returns {number[]}
 */
function fisherYatesPermutation(length, randomInt) {
  if (!Number.isSafeInteger(length) || length < 0 || length > 0xffffffff ||
      typeof randomInt !== 'function') {
    throw new Error('Permutation needs an array length from 0 through 2^32 - 1 and randomInt.');
  }
  const order = Array.from({ length }, (_, index) => index);
  for (let i = length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    if (!Number.isInteger(j) || j < 0 || j > i) {
      throw new Error('randomInt returned an out-of-range Fisher-Yates index.');
    }
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }
  return order;
}

module.exports = {
  SCHEMA, PROTOCOL, ALGORITHM, STREAM_NAMES,
  validateRandomMaterial, createRandomMaterial, randomMaterialCommitment,
  boundedRandomInt, createRandomStream, createIndependentStreams,
  fisherYatesPermutation
};
