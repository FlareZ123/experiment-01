'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const inventory=require('./agent42-strict-switch-inventory-v1.json');

const VERSION='agent42-failclosed-bilateral-profile-preflight-v1';

/**
 * Hash the exact Git blob bytes of a checked-in source module. The
 * inventory's GitHub blob SHA is authoritative for this experimental
 * frozen configuration; no code change is implicitly accepted.
 * @param {Buffer} bytes
 * @returns {string}
 */
function gitBlobHash(bytes){
  assert.ok(Buffer.isBuffer(bytes));
  return createHash('sha1')
    .update(Buffer.from('blob '+bytes.length+'\0','utf8'))
    .update(bytes).digest('hex');
}

/** @param {string} source @returns {string[]} */
function rawProcessEnvKeys(source){
  return [...new Set([...source.matchAll(/process\.env\.([A-Za-z0-9_]+)/g)]
    .map(match=>match[1]))].sort();
}

/**
 * Reject changed executable or changed switch inventory. This makes a
 * future planned benchmark profile explicitly decide how to handle
 * each code change and new option before it can be used.
 * @param {string} repoRoot
 * @returns {{version:string,sourceCount:number,optionCount:number}}
 */
function assertInventoryUnchanged(repoRoot){
  assert.equal(typeof repoRoot,'string');
  const sourceKeys=[];
  for(const item of inventory.checkedSources){
    const p=path.resolve(repoRoot,item.path);
    const bytes=fs.readFileSync(p);
    assert.equal(gitBlobHash(bytes),item.gitBlobSha,
      'Source changed without a frozen-profile re-audit: '+item.path);
    sourceKeys.push(...rawProcessEnvKeys(bytes.toString('utf8')));
  }
  const distinct=[...new Set(sourceKeys)].sort();
  assert.deepEqual(distinct,inventory.keys,
    'Environment-option inventory changed without an explicit profile review');
  assert.equal(distinct.length,inventory.keyCount);
  return {version:VERSION,sourceCount:inventory.checkedSources.length,
    optionCount:distinct.length};
}

/**
 * An intentionally restrictive preflight for a *proposed* development
 * profile. Every identified switch besides the required physical
 * integrity guard must be unset. This is not a competitive policy
 * choice or a release certification. Agent41 can later choose a
 * reviewed positive option map by versioning the inventory.
 *
 * @param {NodeJS.ProcessEnv|Record<string,string|undefined>} env
 * @returns {{version:string,active:string[]}}
 */
function assertProposedEnvironment(env){
  assert.ok(env&&typeof env==='object');
  const active=[];
  for(const key of inventory.keys){
    const expected=inventory.proposedGateValues[key];
    const actual=Object.hasOwn(env,key)?env[key]:undefined;
    assert.equal(actual,expected,
      'Unreviewed option in candidate profile: '+key);
    if(expected!==undefined)active.push(key);
  }
  return {version:VERSION,active};
}

module.exports={VERSION,gitBlobHash,rawProcessEnvKeys,
  assertInventoryUnchanged,assertProposedEnvironment};
