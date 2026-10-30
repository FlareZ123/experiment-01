'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');

const VERSION='agent1-original-store-all-attempt-native-parity-v1';
const STRICT_FIELDS=Object.freeze([
  'sourceDealFingerprint','fullPhysicalDealFingerprint',
  'rootActionLedgerSha256','rootActionCount',
  'candidateDeckFingerprint','sourceDeckFingerprint',
  'verifiedFirstTurn','actualStarterSeat','sourceActuallyFirst',
  'actionCount','finished','winner','endReason','finalPrizes','status'
]);

/**
 * Prove that an added postdecision observer preserves every original attempt's
 * physical deal, accepted native Store actions, seat, printed 60 and outcome.
 *
 * Baseline intentionally may not contain the later owner observer at all.
 * The comparison rejects missing, duplicated, failed or modified game rows.
 * Hashes stand in for original deal privacy; this is an audit of an unchanged
 * original Store run, not a competitive game-quality certificate.
 *
 * @param {object} baseline Archived original preregistered scout JSON.
 * @param {object} observed Replayed scout JSON with new observer.
 * @returns {object} Reproducible count and declared comparison fields.
 */
function originalStoreParity(baseline,observed){
  const expected='agent41-preregistered-32-arm-canonical-scout-v1';
  assert.equal(baseline?.schema,expected);
  assert.equal(observed?.schema,expected);
  assert.equal(baseline.registrationBlob,observed.registrationBlob);
  assert.deepEqual(baseline.preregistration,observed.preregistration);
  assert.equal(baseline.summary?.attempts,32);
  assert.equal(observed.summary?.attempts,32);
  const a=baseline.developmentResult?.rows;
  const b=observed.developmentResult?.rows;
  assert.ok(Array.isArray(a)&&Array.isArray(b));
  assert.equal(a.length,32);
  assert.equal(b.length,32);
  const idOf=r=>{
    assert.equal(typeof r?.trial?.id,'string');
    return r.trial.id;
  };
  const oldById=new Map(a.map(row=>[idOf(row),row]));
  const newById=new Map(b.map(row=>[idOf(row),row]));
  assert.equal(oldById.size,32,'Baseline contains duplicate trial IDs');
  assert.equal(newById.size,32,'Replayed cohort contains duplicate trial IDs');
  assert.deepEqual([...oldById.keys()].sort(),[...newById.keys()].sort());
  for(const [id,oldRow] of oldById){
    const newRow=newById.get(id);
    assert.ok(newRow);
    assert.deepEqual(oldRow.trial,newRow.trial,
      `Registered source/seat/seed/candidate identity drift at ${id}`);
    for(const field of STRICT_FIELDS){
      assert.deepEqual(oldRow[field],newRow[field],
        `Native original Store parity lost in ${id}: ${field}`);
    }
    assert.equal(newRow.sourceFirstOwnedAffordances?.schema,
      'agent1-source-first-owned-affordances-v2',
      `Replayed first-owner-turn observer missing at ${id}`);
    assert.equal(newRow.qualifiesForCompetitiveInference,false);
  }
  for(const field of ['attempts','exceptions','censored','engineTerminals',
    'verifiedFirstPlayers','competitiveQualifiedGames']){
    assert.equal(baseline.summary[field],observed.summary[field],
      `All-attempt summary changed: ${field}`);
  }
  return {
    schema:VERSION,registrationBlob:baseline.registrationBlob,
    compared:oldById.size,
    declaredFields:STRICT_FIELDS,
    changedPhysicalDeals:0,changedNativeRootHashes:0,
    changedPrintedDeckFingerprints:0,changedOutcomes:0,
    competitiveQualifiedGames:0,
    caveat:'Observer-only accepted Store parity. No gameplay-policy or tournament clock qualification.'
  };
}

/** @param {string} file */
function readJsonBytes(file){
  const bytes=fs.readFileSync(file);
  return {
    sha256:createHash('sha256').update(bytes).digest('hex'),
    data:JSON.parse(bytes.toString('utf8'))
  };
}

if(require.main===module){
  assert.ok(process.argv[2]&&process.argv[3],
    'Usage: node agent1-preregistered-native-root-parity.cjs baseline.json observed.json');
  const baseline=readJsonBytes(process.argv[2]);
  const observed=readJsonBytes(process.argv[3]);
  process.stdout.write(JSON.stringify({
    ...originalStoreParity(baseline.data,observed.data),
    baselineJsonSha256:baseline.sha256,observedJsonSha256:observed.sha256
  },null,2)+'\n');
}

module.exports={VERSION,STRICT_FIELDS,originalStoreParity,readJsonBytes};
