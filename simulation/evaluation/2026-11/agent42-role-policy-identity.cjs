'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const {createHash} = require('node:crypto');
const {auditSourceClosure} = require('../agent36-source-closure-audit.cjs');
const {evidenceBundleSha256} = require('../agent45-independent-competitive-admission.cjs');

const ENTRY_MANIFEST_SCHEMA = 'aichi-policy-entry-manifest-v2';
const ROLE_IDENTITY_SCHEMA = 'aichi-role-policy-identity-v2';
const APPLICATION_RECEIPT_SCHEMA = 'aichi-policy-application-receipt-v2';
const SHA256 = /^[0-9a-f]{64}$/;
const GIT_SHA = /^[0-9a-f]{40}$/;
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/;
const NODE_VERSION = /^v?\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/;

const PHYSICAL_CONTEXT_KEYS = new Set([
  'seat','seatid','seatindex','physicalseat','physicalseatid','playerslot',
  'playerseat','playerseatid','playerseatindex','playerindex','playerid',
  'playernumber','playerposition','candidateplayer','opponentplayer',
  'sourceplayer','firstplayer','currentplayer','activeplayer','turnplayer',
  'candidateposition','opponentposition','side','sideindex','candidateside',
  'opponentside','ownerside','sourceseat','firstplayerseat','actualfirstplayerseat',
  'originalsourceseat','policyownerseat','ownerseat'
]);
const BUILTINS = new Set(Module.builtinModules.flatMap(name => [
  name, name.replace(/^node:/, ''), 'node:' + name.replace(/^node:/, '')
]));
const FORBIDDEN_EXTERNAL_BUILTINS = new Set([
  'child_process','node:child_process','worker_threads','node:worker_threads',
  'vm','node:vm','module','node:module'
]);
const TRUSTED_OPERATIONAL_ENV_READERS = new Set([
  'simulation/evaluation/2026-11/agent36-v3-runner.cjs'
]);
const TRUSTED_MODULE_API_FILES = new Set([
  'simulation/evaluation/agent36-runtime-module-pin.cjs',
  'simulation/evaluation/2026-11/agent42-role-policy-identity.cjs'
]);
const TRUSTED_FILE_READERS = new Set([
  'simulation/evaluation/agent36-source-closure-audit.cjs',
  'simulation/evaluation/agent36-runtime-module-pin.cjs',
  'simulation/evaluation/2026-11/agent42-role-policy-identity.cjs',
  'simulation/evaluation/2026-11/agent36-v3-runner.cjs'
]);
const REQUIRED_COMMON_BINDING_EXPORTS = {
  observe:'actorObservation',promptActions:'ResolvePromptAction',
  roleComposer:'withCandidateOpponentPolicyRoles',
  moduleLoadGuard:'withPinnedResearchModuleLoads',
  sourceClosureAudit:'auditSourceClosure',roleIdentityHelper:'buildRolePolicyIdentity'
};
const VENDOR_PREFIX = 'vendor/twinleaf/';

function hashBytes(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}
function nonempty(value) { return typeof value==='string'&&value.trim().length>0; }
function stableId(value, label) {
  assert.equal(typeof value, 'string', label + ' must be a string');
  assert.match(value, ID, label + ' is invalid');
  assert.equal(value.trim(), value, label + ' must not contain surrounding whitespace');
  return value;
}
function canonicalPath(value, label) {
  assert.equal(typeof value, 'string', label + ' must be a relative path');
  assert.ok(value.length > 0 && !value.startsWith('/') && !value.includes('\\'),
    label + ' must be repository-relative');
  assert.ok(value.split('/').every(part => part && part !== '.' && part !== '..'),
    label + ' must be canonical and may not traverse directories');
  return value;
}
function assertNoPhysicalContext(value, at = 'policyOptions') {
  if (Array.isArray(value)) {
    value.forEach((item,index)=>assertNoPhysicalContext(item,at+'['+index+']'));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key,child] of Object.entries(value)) {
      const normalized=key.toLowerCase().replace(/[^a-z0-9]/g,'');
      assert.ok(!PHYSICAL_CONTEXT_KEYS.has(normalized)&&!normalized.includes('seat')&&
        !normalized.includes('player'),
        at+' may not bind physical-game context key '+key);
      assertNoPhysicalContext(child,at+'.'+key);
    }
  }
}
function plainJson(value,label) {
  assert.ok(value!==null&&typeof value==='object'&&!Array.isArray(value)&&
    Object.getPrototypeOf(value)===Object.prototype,
    label+' must be a plain JSON object');
  evidenceBundleSha256(value);
  assertNoPhysicalContext(value,label);
  return value;
}
function assertInsideRoot(root,relative,label) {
  const real=fs.realpathSync(path.join(root,relative));
  const rel=path.relative(root,real);
  assert.ok(rel&&rel!=='..'&&!rel.startsWith('..'+path.sep)&&!path.isAbsolute(rel),
    label+' resolves outside the repository: '+relative);
  return real;
}
function assertNoUnsupportedRuntimeLoading(root,files) {
  const unsupported=[];
  for(const file of files){
    const source=fs.readFileSync(path.join(root,file.path),'utf8');
    const lines=source.split(/\r?\n/);
    const usesEsm=/\bimport\s*(?:\(|['"]|\*|\{|\w+\s+from\s*['"])/.test(source)||
      /\bexport\s+(?:default|const|let|var|function|class|\*|\{)/.test(source)||
      /\bexport\s+(?:\*|\{)[^;]*\sfrom\s*['"]/.test(source);
    const operationalEnvReads=[...source.matchAll(/\bprocess\s*\.\s*env\s*(?:\.\s*([A-Za-z_$][\w$]*)|\[\s*['"]([^'"]+)['"]\s*\])/g)]
      .map(match=>match[1]??match[2]).filter(key=>key.startsWith('GITHUB_')||key.startsWith('RUNNER_'));
    if(operationalEnvReads.length&&!TRUSTED_OPERATIONAL_ENV_READERS.has(file.path))
      unsupported.push({file:file.path,kind:'untrusted-operational-environment',keys:[...new Set(operationalEnvReads)].sort()});
    const usesModuleApi=/\brequire\s*\(\s*['"](?:node:)?module['"]\s*\)/.test(source)||
      /\bModule\b/.test(source)||/\bmodule\s*\.\s*constructor\b/.test(source)||
      /\bmodule\s*\[\s*['"]constructor['"]\s*\]/.test(source)||
      /\bcreateRequire\s*\(/.test(source);
    if(usesEsm&&!TRUSTED_MODULE_API_FILES.has(file.path))
      unsupported.push({file:file.path,kind:'esm'});
    if(usesModuleApi&&!TRUSTED_MODULE_API_FILES.has(file.path))
      unsupported.push({file:file.path,kind:'module-loader capture'});
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      const usesDynamicCode=/\bnew\s+Function\s*\(/.test(line)||
        /\bFunction\s*\(/.test(line)||/\beval\s*\(/.test(line)||
        /\bvm\s*\.\s*(?:runIn|compileFunction|Script)/.test(line)||
        /\b(?:Module|module)\s*\.\s*_compile\b/.test(line);
      const usesProcessOrWorker=/\brequire\s*\(\s*['"](?:node:)?(?:child_process|worker_threads|vm)(?:\/[^'"]*)?['"]\s*\)/.test(line);
      const usesFileReader=/\b(?:readFileSync|readFile|createReadStream|readSync|openSync)\s*\(/.test(line)||
        /\b(?:process\s*\.\s*dlopen|process\s*\.\s*binding|require\s*\.\s*extensions)\b/.test(line);
      const usesNetwork=/\bfetch\s*\(/.test(line)||
        /\b(?:http|https|net|tls)\s*\.\s*(?:request|get|connect)\s*\(/.test(line)||
        /\bnew\s+WebSocket\s*\(/.test(line);
      const usesUnseededRandom=/\bMath\s*\.\s*random\s*\(/.test(line)||
        /\b(?:randomBytes|randomUUID|randomInt|randomFill|randomFillSync|getRandomValues)\s*\(/.test(line);
      if(usesDynamicCode||usesProcessOrWorker||usesNetwork||usesUnseededRandom||
        (usesFileReader&&!TRUSTED_FILE_READERS.has(file.path)))
        unsupported.push({file:file.path,line:i+1,kind:usesDynamicCode?'dynamic-code':
          usesProcessOrWorker?'process-or-worker':usesNetwork?'network':
          usesUnseededRandom?'unseeded-random':'unreviewed-file-read'});
    }
  }
  assert.deepEqual(unsupported,[],
    'Role policy closure contains ESM, module-loader capture, dynamic code, process/worker or unreviewed file loading');
}

function environmentManifest(keys,allowlist,env) {
  const requested=[...new Set(allowlist)].sort();
  const observed=[...keys].filter(key=>!key.startsWith('GITHUB_')&&!key.startsWith('RUNNER_')).sort();
  assert.deepEqual(observed,requested,
    'environment allowlist must exactly equal the statically observed environment readers');
  const values=observed.map(key=>{
    assert.match(key,/^[A-Za-z_][A-Za-z0-9_]*$/,'invalid environment key');
    assert.ok(!/(TOKEN|SECRET|PASSWORD|PRIVATE|CREDENTIAL|API_KEY)/i.test(key),
      'secret-bearing environment keys are not permitted in policy code: '+key);
    const present=typeof env[key]==='string';
    return {key,present,valueSha256:present?hashBytes(Buffer.from(env[key],'utf8')):null};
  });
  return {schema:'aichi-policy-environment-manifest-v1',values,
    sha256:evidenceBundleSha256(values)};
}

/**
 * Build a content-addressed, seat-independent manifest for one role's actual
 * CommonJS entrypoint, shared observer/prompt runtime and shared engine patch.
 * The static source audit and runtime load guard are separate, mandatory
 * boundaries; neither is a general JavaScript sandbox.
 */
function createPolicyEntryManifest({repositoryRoot,entrypoint,commonRuntimeBindings,
  orderedPromptChain,sharedEnginePatches=[],dataAssetPaths=[],dependencyLockPaths=[],
  environmentAllowlist=[],enginePin,runnerRevision}) {
  const root=fs.realpathSync(repositoryRoot);
  const entry=canonicalPath(entrypoint,'entrypoint');
  assert.ok(!entry.startsWith(VENDOR_PREFIX),'role policy entrypoint must be research-owned');
  const runtimeEnvironment=Object.getOwnPropertyDescriptor(process,'env')?.value;
  assert.ok(runtimeEnvironment&&typeof runtimeEnvironment==='object',
    'actual Node process environment snapshot is unavailable');
  const nodeVersion=process.version,nodePlatform=process.platform,nodeArch=process.arch;
  assert.ok(Array.isArray(commonRuntimeBindings),'commonRuntimeBindings must be an array');
  const names=new Set();
  const bindings=commonRuntimeBindings.map(binding=>{
    assert.ok(binding&&typeof binding==='object'&&!Array.isArray(binding),
      'common runtime binding must be an object');
    const name=stableId(binding.name,'common runtime binding name');
    assert.ok(!names.has(name),'duplicate common runtime binding: '+name);
    names.add(name);
    const bindingPath=canonicalPath(binding.path,'common runtime binding path');
    assert.ok(!bindingPath.startsWith('vendor/')||bindingPath.startsWith(VENDOR_PREFIX),
      'only the pinned Twinleaf vendor subtree is accepted');
    const exportName=binding.exportName===undefined?null:stableId(binding.exportName,'common runtime export name');
    return {name,path:bindingPath,exportName};
  }).sort((a,b)=>a.name.localeCompare(b.name));
  for(const [name,exportName] of Object.entries(REQUIRED_COMMON_BINDING_EXPORTS)){
    const binding=bindings.find(item=>item.name===name);
    assert.ok(binding,'common runtime manifest must pin '+name);
    assert.equal(binding.exportName,exportName,
      'common runtime binding '+name+' must identify exact export '+exportName);
  }

  assert.ok(Array.isArray(orderedPromptChain)&&orderedPromptChain.length>0,
    'orderedPromptChain must preserve at least one prompt module in execution order');
  const promptChain=orderedPromptChain.map((item,index)=>{
    const result=typeof item==='string'?
      {name:'prompt-'+index,path:canonicalPath(item,'prompt-chain path')}:
      (assert.ok(item&&typeof item==='object'&&!Array.isArray(item),
        'prompt-chain entry must be a path or named path'),
       {name:stableId(item.name,'prompt-chain name'),path:canonicalPath(item.path,'prompt-chain path')});
    assert.ok(!result.path.startsWith('vendor/')||result.path.startsWith(VENDOR_PREFIX),
      'only the pinned Twinleaf vendor subtree is accepted');
    return result;
  });
  assert.equal(new Set(promptChain.map(x=>x.name)).size,promptChain.length,
    'prompt-chain names must be unique');

  assert.ok(Array.isArray(sharedEnginePatches),'sharedEnginePatches must be an array');
  const patches=sharedEnginePatches.map((item,index)=>{
    const result=typeof item==='string'?
      {name:'patch-'+index,path:canonicalPath(item,'engine patch path')}:
      (assert.ok(item&&typeof item==='object'&&!Array.isArray(item),
        'engine patch entry must be a path or named path'),
       {name:stableId(item.name,'engine patch name'),path:canonicalPath(item.path,'engine patch path')});
    assert.ok(!result.path.startsWith('vendor/')||result.path.startsWith(VENDOR_PREFIX),
      'only the pinned Twinleaf vendor subtree is accepted');
    return result;
  });
  assert.equal(new Set(patches.map(x=>x.name)).size,patches.length,
    'shared engine patch names must be unique');

  assert.match(enginePin??'',GIT_SHA,'enginePin must be a pinned Git commit');
  assert.match(runnerRevision??'',GIT_SHA,'runnerRevision must be a Git commit');
  assert.match(nodeVersion,NODE_VERSION,'runtime Node version is invalid');

  const allEntries=[entry,...bindings.map(x=>x.path),...promptChain.map(x=>x.path),
    ...patches.map(x=>x.path)];
  const researchEntries=allEntries.filter(file=>!file.startsWith(VENDOR_PREFIX));
  const directVendorPaths=allEntries.filter(file=>file.startsWith(VENDOR_PREFIX));
  const closure=auditSourceClosure(root,researchEntries,{vendorPrefixes:[VENDOR_PREFIX]});
  const limits=closure.limitations??{};
  const nonBuiltinExternal=(limits.externalRequires??[]).filter(item=>
    !BUILTINS.has(item.request)||FORBIDDEN_EXTERNAL_BUILTINS.has(item.request));
  const unresolved={
    dynamicRequireSites:limits.dynamicRequireSites??[],
    computedEnvSites:limits.computedEnvSites??[],
    unclassifiedEnvSites:limits.unclassifiedEnvSites??[],
    missingRelativeImports:limits.missingRelativeImports??[],
    externalRequires:nonBuiltinExternal
  };
  for(const [kind,rows] of Object.entries(unresolved))
    assert.deepEqual(rows,[],'Unresolved role policy closure: '+kind);
  assert.ok(Array.isArray(closure.files)&&closure.files.length>0,
    'role policy closure must contain research-owned source files');
  assertNoUnsupportedRuntimeLoading(root,closure.files);

  const verifiedFiles=closure.files.map(file=>{
    const filename=assertInsideRoot(root,file.path,'source file');
    const actual=hashBytes(fs.readFileSync(filename));
    assert.equal(actual,file.sha256,'source file changed during manifest construction: '+file.path);
    return {path:file.path,sha256:actual};
  }).sort((a,b)=>a.path.localeCompare(b.path));
  const closureSha256=hashBytes(Buffer.from(JSON.stringify(
    verifiedFiles.map(file=>[file.path,file.sha256])),'utf8'));
  assert.equal(closureSha256,closure.digest,
    'research source closure digest does not match the verified file list');
  const fileByPath=new Map(verifiedFiles.map(file=>[file.path,file.sha256]));

  const vendorMap=new Map();
  function addVendorDependency(vendorPath,detail={}) {
    assert.ok(vendorPath.startsWith(VENDOR_PREFIX),
      'vendor dependency is outside the pinned Twinleaf subtree: '+vendorPath);
    const filename=assertInsideRoot(root,vendorPath,'vendor dependency');
    const actual=hashBytes(fs.readFileSync(filename));
    if(detail.sha256)assert.equal(actual,detail.sha256,
      'vendor dependency changed during source audit: '+vendorPath);
    let item=vendorMap.get(vendorPath);
    if(!item)item={path:vendorPath,sha256:actual,imports:[],bindings:[],promptChainNames:[],patchNames:[]};
    assert.equal(item.sha256,actual,'vendor dependency hash disagreement: '+vendorPath);
    if(detail.importer)item.imports.push({importer:detail.importer,request:detail.request});
    if(detail.binding)item.bindings.push(detail.binding);
    if(detail.promptChainName)item.promptChainNames.push(detail.promptChainName);
    if(detail.patchName)item.patchNames.push(detail.patchName);
    vendorMap.set(vendorPath,item);
  }
  for(const edge of closure.vendorImports??[])
    addVendorDependency(edge.path,{sha256:edge.sha256,importer:edge.importer,request:edge.request});
  for(const binding of bindings)if(binding.path.startsWith(VENDOR_PREFIX))
    addVendorDependency(binding.path,{binding:{name:binding.name,exportName:binding.exportName}});
  for(const item of promptChain)if(item.path.startsWith(VENDOR_PREFIX))
    addVendorDependency(item.path,{promptChainName:item.name});
  for(const item of patches)if(item.path.startsWith(VENDOR_PREFIX))
    addVendorDependency(item.path,{patchName:item.name});
  for(const vendorPath of directVendorPaths)assert.ok(vendorMap.has(vendorPath),
    'direct vendor binding was not included in the vendor dependency manifest: '+vendorPath);
  const vendorDependencies=[...vendorMap.values()].sort((a,b)=>a.path.localeCompare(b.path));
  for(const item of vendorDependencies){
    item.imports.sort((a,b)=>(a.importer+'\0'+a.request).localeCompare(b.importer+'\0'+b.request));
    item.bindings.sort((a,b)=>a.name.localeCompare(b.name));
    item.promptChainNames.sort();item.patchNames.sort();
  }
  const vendorByPath=new Map(vendorDependencies.map(item=>[item.path,item]));
  const shaForPath=sourcePath=>{
    const sha=fileByPath.get(sourcePath)??vendorByPath.get(sourcePath)?.sha256;
    assert.match(sha??'',SHA256,'manifest path is absent from research/vendor closure: '+sourcePath);
    return sha;
  };
  const verifiedBindings=bindings.map(binding=>({...binding,sha256:shaForPath(binding.path),
    vendor:binding.path.startsWith(VENDOR_PREFIX)}));
  const observe=verifiedBindings.find(binding=>binding.name==='observe');
  assert.ok(observe&&!observe.vendor,'observation contract must be research-owned');
  const verifiedPromptChain=promptChain.map(item=>({...item,sha256:shaForPath(item.path),
    vendor:item.path.startsWith(VENDOR_PREFIX)}));
  const verifiedPatches=patches.map(item=>({...item,sha256:shaForPath(item.path),
    vendor:item.path.startsWith(VENDOR_PREFIX)}));
  const assets=[...new Set(dataAssetPaths.map(p=>canonicalPath(p,'data asset path')))]
    .sort().map(assetPath=>({path:assetPath,
      sha256:hashBytes(fs.readFileSync(assertInsideRoot(root,assetPath,'data asset')))}));
  const dependencyLocks=[...new Set(dependencyLockPaths.map(p=>canonicalPath(p,'dependency lock path')))]
    .sort().map(lockPath=>({path:lockPath,
      sha256:hashBytes(fs.readFileSync(assertInsideRoot(root,lockPath,'dependency lockfile')))}));
  const operationalEnvironmentReaders=Object.entries(closure.readers??{})
    .filter(([key])=>key.startsWith('GITHUB_')||key.startsWith('RUNNER_'))
    .map(([key,files])=>{
      const readers=[...files].sort();
      for(const file of readers)assert.ok(TRUSTED_OPERATIONAL_ENV_READERS.has(file),
        'GITHUB_/RUNNER_ environment read is forbidden outside trusted runner: '+file+' -> '+key);
      return {key,files:readers};
    }).sort((a,b)=>a.key.localeCompare(b.key));
  const policyEnvironmentKeys=(closure.keys??[]).filter(key=>
    !key.startsWith('GITHUB_')&&!key.startsWith('RUNNER_'));
  const env=environmentManifest(policyEnvironmentKeys,environmentAllowlist,runtimeEnvironment);
  const allowedBuiltinRequires=(limits.externalRequires??[]).filter(item=>
    BUILTINS.has(item.request)&&!FORBIDDEN_EXTERNAL_BUILTINS.has(item.request))
    .sort((a,b)=>(a.file+'\0'+a.request).localeCompare(b.file+'\0'+b.request));
  const vendorDependenciesSha256=evidenceBundleSha256(vendorDependencies);
  const manifest={
    schema:ENTRY_MANIFEST_SCHEMA,complete:true,entrypoint:entry,
    sourceAuditVersion:closure.version,sourceAuditLimitations:unresolved,
    allowedBuiltinRequires,
    closureMethod:'research-only literal CommonJS closure; vendor imports separately hashed and bound to enginePin',
    closureSha256,files:verifiedFiles,
    commonRuntimeBindings:verifiedBindings,
    observationContractSha256:evidenceBundleSha256({name:observe.name,path:observe.path,
      exportName:observe.exportName,sha256:observe.sha256}),
    orderedPromptChain:verifiedPromptChain,
    promptChainSha256:evidenceBundleSha256(verifiedPromptChain),
    sharedEnginePatches:verifiedPatches,
    sharedEnginePatchSha256:evidenceBundleSha256(verifiedPatches),
    dataAssets:assets,
    dependencyState:{schema:'aichi-policy-dependency-state-v1',mode:'node-builtins-only',
      lockfiles:dependencyLocks},
    vendorPrefix:VENDOR_PREFIX,vendorDependencies,vendorDependenciesSha256,
    vendorImports:closure.vendorImports??[],
    vendorImportsSha256:evidenceBundleSha256(closure.vendorImports??[]),
    trustedOperationalEnvironmentReaders:operationalEnvironmentReaders,
    environment:env,
    runtimeGuard:{schema:'agent36-pre-execution-commonjs-module-pin-v1',required:true},
    nodeVersion,nodePlatform,nodeArch,enginePin,runnerRevision
  };
  const expectedByPath=Object.fromEntries(verifiedFiles.map(file=>[file.path,file.sha256]));
  return {manifest,entryManifestSha256:evidenceBundleSha256(manifest),
    closureAudit:closure,expectedByPath};
}

/** Merge the exact file maps whose file lists were included in role manifests. */
function combineRolePolicyEntryManifests(...results) {
  assert.ok(results.length>=2,'candidate and opponent entry manifests are required');
  const combined={};
  for(const result of results){
    assert.ok(result?.manifest?.schema===ENTRY_MANIFEST_SCHEMA,
      'invalid role entry manifest');
    assert.equal(result.entryManifestSha256,evidenceBundleSha256(result.manifest),
      'role entry manifest digest mismatch');
    const expected=Object.fromEntries(result.manifest.files.map(file=>[file.path,file.sha256]));
    assert.deepEqual(result.expectedByPath,expected,
      'runtime pin allowlist must come from the exact manifest file list');
    for(const [file,sha] of Object.entries(expected)){
      assert.ok(!Object.hasOwn(combined,file)||combined[file]===sha,
        'role closures disagree on source bytes for '+file);
      combined[file]=sha;
    }
  }
  const expectedByPath=Object.fromEntries(Object.entries(combined).sort(([a],[b])=>a.localeCompare(b)));
  const unionSha256=evidenceBundleSha256(expectedByPath);
  return {expectedByPath,unionSha256,runtimePinUnionSha256:unionSha256};
}

/**
 * Verify that the combined role-manifest map covers every already-loaded
 * repo-owned CommonJS module before installing Agent36's pre-execution pin.
 * This catches missing runner/evaluator/receipt infrastructure up front.
 */
function assertLoadedResearchModulesCovered(repositoryRoot,expectedByPath,
  cacheEntries=Object.keys(require.cache)) {
  const root=fs.realpathSync(repositoryRoot);
  assert.ok(expectedByPath&&typeof expectedByPath==='object'&&!Array.isArray(expectedByPath),
    'runtime pin manifest must be a path-to-SHA object');
  for(const [name,sha] of Object.entries(expectedByPath)){
    canonicalPath(name,'runtime pin path');
    assert.match(sha??'',SHA256,'invalid runtime pin SHA-256: '+name);
    assert.ok(['.cjs','.js','.json'].includes(path.extname(name)),
      'runtime pin supports CommonJS/JSON only: '+name);
    assert.ok(!name.startsWith('vendor/')&&!name.startsWith('node_modules/'),
      'vendor and package-manager code are pinned separately: '+name);
  }
  const files=[];
  for(const entry of cacheEntries){
    const filename=typeof entry==='string'?entry:entry?.filename;
    if(typeof filename!=='string')continue;
    const absolute=path.resolve(filename);
    const relative=path.relative(root,absolute).split(path.sep).join('/');
    if(!relative||relative==='..'||relative.startsWith('../')||path.isAbsolute(relative)||
      relative.startsWith('vendor/')||relative.startsWith('node_modules/'))continue;
    if(['.mjs','.mts','.ts'].includes(path.extname(relative)))
      assert.fail('ESM/TypeScript runtime module is outside the CommonJS load pin: '+relative);
    if(!['.cjs','.js','.json'].includes(path.extname(relative)))continue;
    const real=fs.realpathSync(absolute);
    const realRelative=path.relative(root,real).split(path.sep).join('/');
    assert.equal(realRelative,relative,'loaded research module symlink/path escape: '+relative);
    const expected=expectedByPath[relative];
    assert.match(expected??'',SHA256,'loaded research module is absent from the combined role pin: '+relative);
    const actual=hashBytes(fs.readFileSync(real));
    assert.equal(actual,expected,'loaded research module differs from the combined role pin: '+relative);
    files.push({path:relative,sha256:actual});
  }
  files.sort((a,b)=>a.path.localeCompare(b.path));
  const loadedPaths=new Set(files.map(file=>file.path));
  const missing=Object.keys(expectedByPath).filter(name=>!loadedPaths.has(name)).sort();
  assert.deepEqual(missing,[],
    'every expected role/shared runtime module must be preloaded before pin installation');
  const loadedProcessClosureSha256=evidenceBundleSha256(files);
  return {schema:'aichi-loaded-process-runtime-closure-v1',files,
    loadedProcessClosureSha256,sha256:loadedProcessClosureSha256};
}

/** Create a role identity whose digest is independent of physical seat/rank. */
function buildRolePolicyIdentity({role,rank=null,producerId,deckSha256,
  policyVersion,entryManifest,entryManifestSha256,challengeSuiteSha256,
  policyOptions,policyConstraintsSha256,runtimePinUnionSha256,loadedProcessClosureSha256,
  cardPoolInitializationSha256}) {
  assert.ok(['candidate-policy','opponent-policy'].includes(role),'invalid policy role');
  if(role==='candidate-policy')assert.equal(rank,null,
    'candidate policy identity is field-wide and must not be rank-scoped');
  else assert.ok(Number.isInteger(rank)&&rank>=1&&rank<=32,
    'opponent policy identity requires a Top 32 rank');
  stableId(producerId,'policy producer ID');
  stableId(policyVersion,'policy version');
  for(const [label,value] of Object.entries({deckSha256,entryManifestSha256,challengeSuiteSha256,
    policyConstraintsSha256,runtimePinUnionSha256,loadedProcessClosureSha256,
    cardPoolInitializationSha256}))
    assert.match(value??'',SHA256,label+' must be a SHA-256 digest');
  assert.ok(entryManifest?.schema===ENTRY_MANIFEST_SCHEMA&&entryManifest.complete===true,
    'entry manifest schema or completeness invalid');
  assert.ok(nonempty(entryManifest.sourceAuditVersion),'entry manifest source audit version missing');
  assert.deepEqual(entryManifest.sourceAuditLimitations, {
    dynamicRequireSites:[],computedEnvSites:[],unclassifiedEnvSites:[],
    missingRelativeImports:[],externalRequires:[]
  },'entry manifest must have a complete, fail-closed CommonJS source audit');
  assert.equal(entryManifestSha256,evidenceBundleSha256(entryManifest),
    'entry manifest digest mismatch');
  assert.ok(Array.isArray(entryManifest.files)&&entryManifest.files.length>0,
    'entry manifest must contain the exact audited file list');
  assert.equal(entryManifest.runtimeGuard?.required,true,
    'entry manifest must require the Agent36 runtime CommonJS load pin');
  for(const [name,exportName] of Object.entries(REQUIRED_COMMON_BINDING_EXPORTS)){
    const binding=entryManifest.commonRuntimeBindings?.find(x=>x.name===name);
    assert.equal(binding?.exportName,exportName,
      'entry manifest must bind exact common runtime export '+name+'.'+exportName);
  }
  assert.equal(entryManifest.vendorPrefix,VENDOR_PREFIX,'entry manifest vendor boundary is invalid');
  assert.ok(Array.isArray(entryManifest.vendorDependencies),'vendor dependency list is missing');
  assert.equal(entryManifest.vendorDependenciesSha256,evidenceBundleSha256(entryManifest.vendorDependencies),
    'vendor dependency digest mismatch');
  assert.ok(Array.isArray(entryManifest.vendorImports),'vendor import edge list is missing');
  assert.equal(entryManifest.vendorImportsSha256,evidenceBundleSha256(entryManifest.vendorImports),
    'vendor import edge digest mismatch');
  assert.equal(entryManifest.dependencyState?.mode,'node-builtins-only',
    'policy dependency state must reject unpinned third-party packages');
  assert.ok(Array.isArray(entryManifest.orderedPromptChain)&&entryManifest.orderedPromptChain.length>0,
    'entry manifest must preserve an ordered prompt chain');
  assert.ok(Array.isArray(entryManifest.sharedEnginePatches),
    'entry manifest must preserve the shared engine patch set');
  plainJson(policyOptions,'policyOptions');
  const observationContractSha256=entryManifest.observationContractSha256;
  const promptChainSha256=entryManifest.promptChainSha256;
  const sharedEnginePatchSha256=entryManifest.sharedEnginePatchSha256;
  for(const [label,value] of Object.entries({observationContractSha256,promptChainSha256,sharedEnginePatchSha256}))
    assert.match(value??'',SHA256,label+' must be present in the entry manifest');

  const policyDefinition={
    schema:'aichi-role-policy-definition-v1',deckSha256,policyVersion,
    policyProducerId:producerId,entryManifestSha256,policyConstraintsSha256,
    runtimePinUnionSha256,loadedProcessClosureSha256,cardPoolInitializationSha256,
    observationContractSha256,
    promptChainSha256,sharedEnginePatchSha256,policyOptions
  };
  return {
    schema:ROLE_IDENTITY_SCHEMA,role,rank,policyProducerId:producerId,
    deckSha256,policySha256:evidenceBundleSha256(policyDefinition),
    entryManifestSha256,challengeSuiteSha256,policyVersion,
    observationContractSha256,promptChainSha256,sharedEnginePatchSha256,
    runtimePinUnionSha256,loadedProcessClosureSha256,cardPoolInitializationSha256,
    policyOptionsSha256:evidenceBundleSha256(policyOptions),policyDefinition,entryManifest
  };
}

function assertIdentityMatchesPlan(identity,planned,label) {
  for(const key of ['deckSha256','policySha256','entryManifestSha256',
    'challengeSuiteSha256','policyProducerId'])
    assert.equal(identity[key],planned[key],label+' '+key+' does not match the frozen policy plan');
}

/** Bind stable role identities to physical seats and emit the V3 application receipt. */
function createPolicyApplicationReceipt({preDeal,candidateIdentity,opponentIdentity,
  trial,timeoutStatus='within-budget'}) {
  assert.ok(preDeal&&preDeal.ready===true,'pre-deal policy registration must be ready');
  assert.ok(trial&&typeof trial==='object','postgame trial is required');
  assert.equal(candidateIdentity?.role,'candidate-policy');
  assert.equal(candidateIdentity?.rank,null,'candidate role identity must be field-wide');
  assert.equal(opponentIdentity?.role,'opponent-policy');
  assert.equal(trial.trialId,preDeal.trialId,'trial ID mismatch');
  const core=preDeal.policyPlanCore;
  assert.ok(core&&core.candidate&&core.opponentPolicyBundle&&
    Array.isArray(core.opponentPolicyBundle.ranks),'pre-deal policy plan is incomplete');
  assert.equal(preDeal.policyPlanSha256,evidenceBundleSha256(core),
    'frozen policy plan digest does not match its contents');
  const candidate=core.candidate;
  const runtimePinEvidence=core.runtimePinEvidence;
  assert.ok(runtimePinEvidence?.schema==='aichi-runtime-pin-evidence-v2',
    'frozen policy plan must contain runtime pin evidence');
  assert.match(runtimePinEvidence.unionSha256??'',SHA256,'runtime pin union digest is invalid');
  assert.match(runtimePinEvidence.loadedProcessClosureSha256??'',SHA256,
    'loaded process closure digest is invalid');
  assert.match(runtimePinEvidence.cardPoolInitializationSha256??'',SHA256,
    'card-pool initialization digest is invalid');
  const cardPoolReceipt=trial.cardPoolInitializationReceipt;
  assert.ok(cardPoolReceipt?.schema==='agent36-twinleaf-card-pool-initialization-v1',
    'trial must carry the exact native card-pool initialization receipt');
  assert.equal(cardPoolReceipt.enginePin,trial.vendorCommitSha,
    'card-pool initialization engine pin differs from the trial engine');
  assert.equal(cardPoolReceipt.startupPath,'vendor/twinleaf/ptcg-server/start.js',
    'card-pool startup source path is invalid');
  assert.match(cardPoolReceipt.startupSha256??'',SHA256,'card-pool startup SHA-256 is invalid');
  assert.ok(Array.isArray(cardPoolReceipt.setNames)&&cardPoolReceipt.setNames.length>0,
    'card-pool receipt must preserve ordered set names');
  assert.equal(new Set(cardPoolReceipt.setNames).size,cardPoolReceipt.setNames.length,
    'card-pool receipt contains duplicate set names');
  assert.equal(cardPoolReceipt.definedSetCount,cardPoolReceipt.setNames.length,
    'card-pool defined-set count differs from its set list');
  assert.ok(Number.isInteger(cardPoolReceipt.cardCount)&&cardPoolReceipt.cardCount>0,
    'card-pool receipt card count is invalid');
  const cardPoolInitializationSha256=evidenceBundleSha256(cardPoolReceipt);
  assert.equal(cardPoolInitializationSha256,runtimePinEvidence.cardPoolInitializationSha256,
    'card-pool initialization receipt digest differs from frozen runtime evidence');
  const opponent=core.opponentPolicyBundle.ranks.find(row=>row.rank===opponentIdentity.rank);
  assert.ok(opponent&&opponent.sourceStatus==='authenticated',
    'opponent rank must be authenticated in the frozen policy plan');
  assertIdentityMatchesPlan(candidateIdentity,candidate,'candidate policy');
  assertIdentityMatchesPlan(opponentIdentity,opponent,'opponent policy');
  const constraintsSha=evidenceBundleSha256(core.constraints);
  for(const [identity,label] of [[candidateIdentity,'candidate'],[opponentIdentity,'opponent']]){
    assert.equal(identity.policySha256,evidenceBundleSha256(identity.policyDefinition),
      label+' role policy identity digest does not match its definition');
    assert.equal(identity.policyDefinition.deckSha256,identity.deckSha256,
      label+' policy definition deck hash mismatch');
    assert.equal(identity.policyDefinition.entryManifestSha256,identity.entryManifestSha256,
      label+' policy definition entry manifest mismatch');
    assert.equal(identity.policyDefinition.policyConstraintsSha256,constraintsSha,
      label+' policy definition constraints differ from the frozen policy plan');
    assert.equal(identity.policyDefinition.policyVersion,identity.policyVersion,
      label+' policy version does not match its hashed definition');
    assert.equal(identity.policyDefinition.policyProducerId,identity.policyProducerId,
      label+' producer does not match its hashed definition');
    assert.equal(identity.policyDefinition.runtimePinUnionSha256,identity.runtimePinUnionSha256,
      label+' runtime pin union digest mismatch');
    assert.equal(identity.policyDefinition.loadedProcessClosureSha256,identity.loadedProcessClosureSha256,
      label+' loaded process closure digest mismatch');
    assert.equal(identity.policyDefinition.cardPoolInitializationSha256,identity.cardPoolInitializationSha256,
      label+' card-pool initialization digest mismatch');
    assert.equal(identity.policyDefinition.observationContractSha256,identity.observationContractSha256,
      label+' observation contract digest mismatch');
    assert.equal(identity.policyDefinition.promptChainSha256,identity.promptChainSha256,
      label+' prompt-chain digest mismatch');
    assert.equal(identity.policyDefinition.sharedEnginePatchSha256,identity.sharedEnginePatchSha256,
      label+' shared engine patch digest mismatch');
    assert.equal(identity.policyOptionsSha256,evidenceBundleSha256(identity.policyDefinition.policyOptions),
      label+' policy options digest mismatch');
    assert.equal(identity.entryManifestSha256,evidenceBundleSha256(identity.entryManifest),
      label+' entry manifest digest mismatch');
  }
  assert.equal(candidateIdentity.observationContractSha256,opponentIdentity.observationContractSha256,
    'candidate and opponent must use the same observation contract');
  assert.equal(candidateIdentity.promptChainSha256,opponentIdentity.promptChainSha256,
    'candidate and opponent must use the same ordered prompt chain');
  assert.equal(candidateIdentity.runtimePinUnionSha256,opponentIdentity.runtimePinUnionSha256,
    'candidate and opponent must use the same runtime pin union');
  assert.equal(candidateIdentity.loadedProcessClosureSha256,opponentIdentity.loadedProcessClosureSha256,
    'candidate and opponent must use the same loaded process closure');
  assert.equal(candidateIdentity.cardPoolInitializationSha256,opponentIdentity.cardPoolInitializationSha256,
    'candidate and opponent must use the same card-pool initialization');
  assert.equal(candidateIdentity.runtimePinUnionSha256,runtimePinEvidence.unionSha256,
    'role identities do not match the frozen runtime pin union');
  assert.equal(candidateIdentity.loadedProcessClosureSha256,runtimePinEvidence.loadedProcessClosureSha256,
    'role identities do not match the frozen loaded process closure');
  assert.equal(candidateIdentity.cardPoolInitializationSha256,runtimePinEvidence.cardPoolInitializationSha256,
    'role identities do not match the frozen card-pool initialization');
  for(const key of ['enginePin','runnerRevision','nodeVersion','nodePlatform','nodeArch'])
    assert.equal(candidateIdentity.entryManifest[key],opponentIdentity.entryManifest[key],
      'candidate and opponent entry manifests must share '+key);
  assert.equal(preDeal.policyRegistrationSha256,evidenceBundleSha256(preDeal.policyRegistration),
    'policy registration digest does not match its contents');
  assert.equal(preDeal.policyAttestationBundleSha256,evidenceBundleSha256(preDeal.policyAttestationBundle),
    'policy attestation bundle digest does not match its contents');
  assert.equal(preDeal.policyAttestationBundle.policyPlanSha256,preDeal.policyPlanSha256,
    'policy attestation bundle is not bound to the frozen policy plan');
  assert.equal(preDeal.policyRegistration.trialId,preDeal.trialId,
    'policy registration trial ID mismatch');
  assert.equal(preDeal.policyRegistration.policyPlanSha256,preDeal.policyPlanSha256,
    'policy registration is not bound to the frozen policy plan');

  const candidateSeat=trial.candidateSeat;
  const opponentSeat=trial.originalSourceSeat;
  const firstPlayerSeat=trial.actualFirstPlayerSeat;
  assert.ok([0,1].includes(candidateSeat)&&[0,1].includes(opponentSeat)&&
    candidateSeat!==opponentSeat&&[0,1].includes(firstPlayerSeat),
    'trial physical-seat mapping is invalid');
  assert.equal(trial.opponentRank,opponentIdentity.rank,'trial opponent rank mismatch');
  assert.equal(trial.candidatePrinted60Sha256,candidate.deckSha256,
    'candidate deck hash does not match the physical contender 60');
  assert.equal(trial.originalPrinted60Sha256,opponent.deckSha256,
    'opponent deck hash does not match the original printed 60');
  assert.match(trial.vendorCommitSha??'',GIT_SHA,'trial engine pin is invalid');
  assert.match(trial.researchRevisionSha??'',GIT_SHA,'trial runner revision is invalid');
  assert.equal(candidateIdentity.entryManifest.enginePin,trial.vendorCommitSha,
    'role entry manifests do not pin the trial Twinleaf revision');
  assert.equal(candidateIdentity.entryManifest.runnerRevision,trial.researchRevisionSha,
    'role entry manifests do not pin the trial runner revision');
  assert.match(trial.decisionTraceSha256??'',SHA256,'trial decision trace hash is invalid');
  assert.ok(['none','within-budget','not-exceeded'].includes(timeoutStatus),'timeoutStatus is invalid');
  assert.match(preDeal.policyRegistrationSha256??'',SHA256,'policy registration digest is invalid');
  assert.match(preDeal.policyAttestationBundleSha256??'',SHA256,'policy attestation bundle digest is invalid');

  const receipt={
    schema:APPLICATION_RECEIPT_SCHEMA,trialId:preDeal.trialId,
    policyPlanSha256:preDeal.policyPlanSha256,
    policyRegistrationSha256:preDeal.policyRegistrationSha256,
    policyAttestationBundleSha256:preDeal.policyAttestationBundleSha256,
    opponentPolicyBundleSha256:evidenceBundleSha256(core.opponentPolicyBundle),
    opponentRank:opponentIdentity.rank,
    candidateDeckSha256:candidateIdentity.deckSha256,
    candidatePolicySha256:candidateIdentity.policySha256,
    candidatePolicyProducerId:candidateIdentity.policyProducerId,
    candidateEntryManifestSha256:candidateIdentity.entryManifestSha256,
    candidateChallengeSuiteSha256:candidateIdentity.challengeSuiteSha256,
    opponentDeckSha256:opponentIdentity.deckSha256,
    opponentPolicySha256:opponentIdentity.policySha256,
    opponentPolicyProducerId:opponentIdentity.policyProducerId,
    opponentEntryManifestSha256:opponentIdentity.entryManifestSha256,
    opponentChallengeSuiteSha256:opponentIdentity.challengeSuiteSha256,
    candidateSeat,opponentSeat,firstPlayerSeat,
    policySha256BySeat:candidateSeat===0?
      [candidateIdentity.policySha256,opponentIdentity.policySha256]:
      [opponentIdentity.policySha256,candidateIdentity.policySha256],
    enginePin:trial.vendorCommitSha,runnerRevision:trial.researchRevisionSha,
    policyConstraintsSha256:constraintsSha,
    runtimePinUnionSha256:candidateIdentity.runtimePinUnionSha256,
    loadedProcessClosureSha256:candidateIdentity.loadedProcessClosureSha256,
    cardPoolInitializationSha256:candidateIdentity.cardPoolInitializationSha256,
    decisionTraceSha256:trial.decisionTraceSha256,timeoutStatus
  };
  return {
    receipt:{...receipt,receiptSha256:evidenceBundleSha256(receipt)},
    roleSeatMap:{candidate:candidateSeat,opponent:opponentSeat,firstPlayer:firstPlayerSeat},
    policySha256BySeat:receipt.policySha256BySeat
  };
}

module.exports={
  ENTRY_MANIFEST_SCHEMA,ROLE_IDENTITY_SCHEMA,APPLICATION_RECEIPT_SCHEMA,
  createPolicyEntryManifest,combineRolePolicyEntryManifests,
  assertLoadedResearchModulesCovered,buildRolePolicyIdentity,
  createPolicyApplicationReceipt
};
