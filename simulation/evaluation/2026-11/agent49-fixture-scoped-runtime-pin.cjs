'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {withPinnedResearchModuleLoads} =
  require('../agent36-runtime-module-pin.cjs');

const EXTENSIONS = new Set(['.cjs','.js','.json']);
const SHA256 = /^[a-f0-9]{64}$/;
const SCOPE = 'fixture-role-policy-commonjs-closure-only';

function withinRoot(relative) {
  return Boolean(relative) && relative !== '..' &&
    !relative.startsWith('../') && !path.isAbsolute(relative);
}

function expectedRolePaths(repositoryRoot,expectedByPath) {
  assert.ok(expectedByPath && typeof expectedByPath === 'object' &&
    !Array.isArray(expectedByPath),'role pin map must be an object');
  const root=fs.realpathSync(repositoryRoot);
  const expected=new Map();
  for(const [name,hash] of Object.entries(expectedByPath)) {
    assert.equal(typeof name,'string');
    assert.equal(path.posix.normalize(name),name,
      'role pin paths must be canonical repository-relative paths');
    assert.ok(!name.startsWith('/') && !name.includes('\\') &&
      name.split('/').every(part=>part && part!=='.' && part!=='..'),
      'role pin path is not canonical: '+name);
    assert.ok(EXTENSIONS.has(path.extname(name)),
      'fixture role pin supports CommonJS/JSON only: '+name);
    assert.ok(!name.startsWith('vendor/') && !name.startsWith('node_modules/'),
      'vendor and package-manager modules are pinned separately: '+name);
    assert.match(hash,SHA256,'invalid role module SHA-256: '+name);
    expected.set(name,hash);
  }
  assert.ok(expected.size>0,'fixture role pin cannot be empty');
  return {root,expected};
}

function researchRelativePath(root,filename) {
  if(typeof filename!=='string') return null;
  const absolute=path.resolve(filename);
  const lexical=path.relative(root,absolute).split(path.sep).join('/');
  // Match the production pin: only lexically repository-owned research
  // modules participate. This also avoids touching stale external cache paths.
  if(!withinRoot(lexical) || lexical.startsWith('vendor/') ||
      lexical.startsWith('node_modules/') ||
      !EXTENSIONS.has(path.extname(lexical))) return null;
  const real=fs.realpathSync(absolute);
  const actual=path.relative(root,real).split(path.sep).join('/');
  assert.equal(actual,lexical,
    'fixture pin rejects symlinked research modules: '+lexical);
  return lexical;
}

/**
 * Return only already-loaded candidate/opponent role modules for the V3
 * fixture's pre-execution coverage check. The returned entries are suitable
 * for Agent42's assertLoadedResearchModulesCovered(cacheEntries) seam.
 *
 * This is deliberately not a full-process closure inventory.
 */
function fixtureRolePolicyCacheEntries(repositoryRoot,expectedByPath,
  cacheEntries=Object.keys(require.cache)) {
  const {root,expected}=expectedRolePaths(repositoryRoot,expectedByPath);
  assert.ok(Array.isArray(cacheEntries),'cacheEntries must be an array');
  const found=new Set();
  const selected=[];
  for(const entry of cacheEntries) {
    const filename=typeof entry==='string'?entry:entry?.filename;
    if(typeof filename!=='string') continue;
    const relative=researchRelativePath(root,filename);
    if(relative===null || !expected.has(relative)) continue;
    assert.ok(!found.has(relative),'duplicate loaded role module: '+relative);
    found.add(relative);
    selected.push(entry);
  }
  assert.deepEqual([...found].sort(),[...expected.keys()].sort(),
    'every frozen candidate/opponent role module must be preloaded before the fixture pin');
  return selected;
}

/**
 * Convert Agent36's prepared role-closure digests into the frozen V2
 * runtime-evidence shape required by Agent42/43. This helper is deliberately
 * fixture-only: full-process closure is always false and cannot be overridden.
 */
function createFixtureRuntimePinEvidence(preparedRuntime) {
  const source=preparedRuntime?.runtimePinEvidence;
  assert.equal(source?.schema,'aichi-runtime-pin-evidence-v1',
    'prepared V1 role-runtime evidence is required');
  const fields=['unionSha256','loadedProcessClosureSha256','cardPoolInitializationSha256'];
  for(const field of fields) {
    assert.match(source[field]??'',SHA256,'invalid fixture runtime digest: '+field);
    assert.equal(preparedRuntime[field==='unionSha256'?'runtimePinUnionSha256':
      field==='loadedProcessClosureSha256'?'loadedProcessClosureSha256':
      'cardPoolInitializationSha256'],source[field],
    'prepared runtime digest differs from its V1 evidence: '+field);
  }
  return {
    schema:'aichi-runtime-pin-evidence-v2',
    unionSha256:source.unionSha256,
    loadedProcessClosureSha256:source.loadedProcessClosureSha256,
    cardPoolInitializationSha256:source.cardPoolInitializationSha256,
    fullProcessClosureCovered:false
  };
}

/**
 * Apply the existing CommonJS module-load guard to the exact frozen
 * candidate/opponent role closure while temporarily excluding already-loaded
 * runner/orchestration modules from require.cache.
 *
 * The excluded modules remain live in memory for the synchronous callback,
 * but cannot be re-required while the guard is installed. Any newly requested
 * research-owned module outside the frozen role map is rejected by the
 * existing guard. All excluded cache entries are restored after the guard has
 * restored Module._load.
 *
 * This boundary is fixture-only. It explicitly does not attest the complete
 * research process closure and must never satisfy production admission.
 *
 * @param {string} repositoryRoot
 * @param {Record<string,string>} expectedByPath Frozen role-closure SHA map.
 * @param {()=>any|Promise<any>} execute Synchronous or awaited native-game callback.
 * @returns {{result:any,audit:object}|Promise<{result:any,audit:object}>}
 */
function withFixtureScopedRolePin(repositoryRoot,expectedByPath,execute) {
  assert.equal(typeof execute,'function','fixture game callback is required');
  const {root,expected}=expectedRolePaths(repositoryRoot,expectedByPath);
  const excluded=[];
  let callbackError=null;
  let asyncExecution=false;
  const restoreExcluded=()=>{
    let restoreError=null;
    for(const row of excluded) {
      const current=require.cache[row.filename];
      if(current && current!==row.module)
        restoreError ??= new Error(
          'fixture pin loaded a replacement for excluded orchestration module: '+row.relative);
      require.cache[row.filename]=row.module;
    }
    if(restoreError && !callbackError) throw restoreError;
  };
  const complete=pinned=>{
    assert.equal(pinned.audit?.guardRestored,true,
      'fixture role pin did not restore the original CommonJS loader');
    const audit={
      ...pinned.audit,
      fixtureOnly:true,
      scope:SCOPE,
      rolePolicyClosureCovered:true,
      fullProcessClosureCovered:false,
      excludedPreloadedResearchFiles:excluded.map(x=>x.relative).sort(),
      excludedPreloadedResearchFileCount:excluded.length,
      competitiveGameQualified:false
    };
    return {...pinned,audit};
  };
  try {
    for(const filename of Object.keys(require.cache).sort()) {
      const relative=researchRelativePath(root,filename);
      if(relative===null || expected.has(relative)) continue;
      const cached=require.cache[filename];
      if(!cached) continue;
      excluded.push({filename,relative,module:cached});
      delete require.cache[filename];
    }

    // Fail before the game if any role dependency was not already loaded.
    fixtureRolePolicyCacheEntries(root,expectedByPath,Object.keys(require.cache));
    const pinned=withPinnedResearchModuleLoads(root,Object.fromEntries(expected),execute);
    if(pinned&&typeof pinned.then==='function'){
      asyncExecution=true;
      return pinned.then(complete).catch(error=>{
        callbackError=error;
        throw error;
      }).finally(restoreExcluded);
    }
    return complete(pinned);
  } catch(error) {
    callbackError=error;
    throw error;
  } finally {
    if(!asyncExecution) restoreExcluded();
  }
}

module.exports={
  SCOPE,
  fixtureRolePolicyCacheEntries,
  createFixtureRuntimePinEvidence,
  withFixtureScopedRolePin
};
