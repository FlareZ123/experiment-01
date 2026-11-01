'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const VERSION='agent41-native-runtime-research-module-attestation-v1';

/** @param {Buffer|string} data @returns {string} */
function sha256(data){
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Postgame only. Compare loaded research-owned CommonJS modules with the
 * preregistered lexical code closure. This exposes actually executed dynamic
 * imports, without claiming those are the only possible future import paths.
 * @param {string} repositoryRoot
 * @param {{files:Array<{path:string,sha256:string}>}} staticClosure
 * @param {string[]} [loadedFilenames] Raw require.cache filename keys.
 */
function attestLoadedResearchModules(repositoryRoot,staticClosure,
  loadedFilenames=Object.keys(require.cache)){
  assert.equal(typeof repositoryRoot,'string');
  assert.ok(Array.isArray(staticClosure?.files));
  assert.ok(Array.isArray(loadedFilenames));
  const root=path.resolve(repositoryRoot);
  const pinned=new Map(staticClosure.files.map(x=>[x.path,x.sha256]));
  const loaded=[];
  const unique=new Set();
  for(const filename of loadedFilenames){
    const absolute=path.resolve(filename);
    const relative=path.relative(root,absolute).split(path.sep).join('/');
    if(relative===''||relative==='..'||relative.startsWith('../')||
       relative.startsWith('vendor/')||
       relative.startsWith('node_modules/')||
       !/\.(cjs|js|json)$/.test(relative)||unique.has(relative))continue;
    unique.add(relative);
    const hash=sha256(fs.readFileSync(absolute));
    loaded.push({path:relative,sha256:hash,
      lexicalClosureStatus:!pinned.has(relative)?'runtime-only':
        pinned.get(relative)===hash?'matches-static-fingerprint':
          'changed-after-preflight'});
  }
  loaded.sort((a,b)=>a.path.localeCompare(b.path));
  const byStatus={};
  for(const row of loaded)
    byStatus[row.lexicalClosureStatus]=(byStatus[row.lexicalClosureStatus]??0)+1;
  return {
    version:VERSION,
    scope:'actually-loaded-research-owned-require-cache-after-native-run',
    researchModuleCount:loaded.length,
    byStatus,
    runtimeResearchModulesSha256:sha256(JSON.stringify(
      loaded.map(row=>[row.path,row.sha256]))),
    changedDuringRun:loaded.filter(row=>
      row.lexicalClosureStatus==='changed-after-preflight'),
    dynamicallyLoadedModules:loaded.filter(row=>
      row.lexicalClosureStatus==='runtime-only'),
    competitivelyQualified:false,
    caveat:'A require-cache attestation cannot see modules never executed, computed file reads, external runtime state or future inputs. Vendor pinned separately.'
  };
}

module.exports={VERSION,sha256,attestLoadedResearchModules};
