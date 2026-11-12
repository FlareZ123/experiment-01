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
  const lexicalInside=withinRoot(lexical);
  const real=fs.realpathSync(absolute);
  const actual=path.relative(root,real).split(path.sep).join('/');
  const realInside=withinRoot(actual);
  assert.equal(lexicalInside,realInside,
    'fixture pin found a module path crossing the repository boundary: '+filename);
  if(!lexicalInside) return null;
  assert.equal(actual,lexical,
    'fixture pin rejects symlinked research modules: '+lexical);
  if(lexical.startsWith('vendor/') || lexical.startsWith('node_modules/') ||
      !EXTENSIONS.has(path.extname(lexical))) return null;
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
 * @param {()=>any} execute Synchronous native-game callback.
 * @returns {{result:any,audit:object}}
 */
function withFixtureScopedRolePin(repositoryRoot,expectedByPath,execute) {
  assert.equal(typeof execute,'function','fixture game callback must be synchronous');
  const {root,expected}=expectedRolePaths(repositoryRoot,expectedByPath);
  const excluded=[];
  let callbackError=null;
  for(const filename of Object.keys(require.cache).sort()) {
    const relative=researchRelativePath(root,filename);
    if(relative===null || expected.has(relative)) continue;
    const cached=require.cache[filename];
    if(!cached) continue;
    excluded.push({filename,relative,module:cached});
    delete require.cache[filename];
  }

  try {
    // Fail before the game if any role dependency was not already loaded.
    fixtureRolePolicyCacheEntries(root,expectedByPath,Object.keys(require.cache));
    const pinned=withPinnedResearchModuleLoads(root,Object.fromEntries(expected),execute);
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
  } catch(error) {
    callbackError=error;
    throw error;
  } finally {
    let restoreError=null;
    for(const row of excluded) {
      const current=require.cache[row.filename];
      if(current && current!==row.module)
        restoreError ??= new Error(
          'fixture pin loaded a replacement for excluded orchestration module: '+row.relative);
      require.cache[row.filename]=row.module;
    }
    if(restoreError && !callbackError) throw restoreError;
  }
}

module.exports={
  SCOPE,
  fixtureRolePolicyCacheEntries,
  withFixtureScopedRolePin
};
