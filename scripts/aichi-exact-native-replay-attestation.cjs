'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {readFileSync}=require('node:fs');
const path=require('node:path');

const VERSION='aichi-original-native-archive-replay-identity-v1';
const IDENTITY_KEYS=[
  'schema','registration','engine','sourceRank','opponentRank',
  'sourceDigest','opponentDigest','seedBase','repeats','seats',
  'cap','nativeAttempts','originalPhysicalPairs',
  'controlPolicy','treatmentPolicy'
];

/** @param {unknown} value */
const digest=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Read-only, fail-closed exact replay identity of two developmental native
 * source campaigns. New registration/reporting metadata may be added, but
 * no previously observed physical seed, action, native error, policy audit,
 * terminal or result disposition is silently changed.
 *
 * Call this for identical previously registered plans, card resolution,
 * engine pin and policies. Expected changes to gameplay invalidate replay
 * identity and require a distinct versioned experiment.
 *
 * @param {object} reference Historical full native JSON archive.
 * @param {object} replay After-refactor full native JSON archive.
 * @returns {object} Machine-readable verification of *exact native replay*,
 *   never an admission as a qualified or paper-legal competitive game.
 */
function attestExactNativeReplay(reference,replay){
  assert.ok(reference&&typeof reference==='object');
  assert.ok(replay&&typeof replay==='object');
  for(const key of IDENTITY_KEYS){
    assert.ok(Object.hasOwn(reference,key)&&Object.hasOwn(replay,key),
      'missing native replay identity field: '+key);
    assert.deepStrictEqual(replay[key],reference[key],
      'native replay changed registered field: '+key);
  }
  assert.ok(Array.isArray(reference.cases)&&Array.isArray(replay.cases));
  assert.equal(reference.cases.length,reference.originalPhysicalPairs);
  assert.equal(replay.cases.length,replay.originalPhysicalPairs);
  assert.deepStrictEqual(replay.summary,reference.summary,
    'native replay changed original source game/action summary');
  assert.deepStrictEqual(replay.cases,reference.cases,
    'native replay changed full real-store physical or accepted-action case');
  assert.equal(reference.summary.competitiveQualifiedGames,0,
    'native replay comparator is only for developmental zero-qualified source archives');
  assert.equal(replay.summary.competitiveQualifiedGames,0);
  return Object.freeze({
    schema:VERSION,
    engine:reference.engine,
    sourceRank:reference.sourceRank,
    opponentRank:reference.opponentRank,
    originalPhysicalPairs:reference.originalPhysicalPairs,
    nativeAttempts:reference.nativeAttempts,
    sourceNativeOrderedSha256:reference.sourceDigest,
    opponentNativeOrderedSha256:reference.opponentDigest,
    casesSha256:digest(reference.cases),
    summarySha256:digest(reference.summary),
    exactReplay:true,
    nativeGamesReplayed:reference.nativeAttempts,
    competitivelyQualifiedGames:0,
    paperEffectsVerified:false,
    realMatchClockVerified:false
  });
}

if(require.main===module){
  assert.equal(process.argv.length,4,
    'usage: node scripts/aichi-exact-native-replay-attestation.cjs original.json replay.json');
  const historical=JSON.parse(readFileSync(path.resolve(process.argv[2]),'utf8'));
  const after=JSON.parse(readFileSync(path.resolve(process.argv[3]),'utf8'));
  process.stdout.write('EXACT_NATIVE_REPLAY '+JSON.stringify(
    attestExactNativeReplay(historical,after))+'\n');
}

module.exports={VERSION,IDENTITY_KEYS,attestExactNativeReplay};
