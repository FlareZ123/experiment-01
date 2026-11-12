'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const {createHash} = require('node:crypto');
const {auditSourceClosure} = require('../agent36-source-closure-audit.cjs');
const {evidenceBundleSha256} = require('../agent45-independent-competitive-admission.cjs');

const ENTRY_MANIFEST_SCHEMA = 'aichi-policy-entry-manifest-v1';
const ROLE_IDENTITY_SCHEMA = 'aichi-role-policy-identity-v1';
const APPLICATION_RECEIPT_SCHEMA = 'aichi-policy-application-receipt-v1';
const SHA256 = /^[0-9a-f]{64}$/;
const GIT_SHA = /^[0-9a-f]{40}$/;
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/;
const NODE_VERSION = /^v?\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/;

const PHYSICAL_CONTEXT_KEYS = new Set([
  'seat','seatid','seatindex','physicalseat','physicalseatid','playerslot',
  'candidateseat','opponentseat','sourceseat','firstplayerseat',
  'actualfirstplayerseat','originalsourceseat','policyownerseat','ownerseat'
]);
const BUILTINS = new Set(Module.builtinModules.flatMap(name => [
  name, name.replace(/^node:/, ''), 'node:' + name.replace(/^node:/, '')
]));
const FORBIDDEN_EXTERNAL_BUILTINS = new Set([
  'child_process','node:child_process','worker_threads','node:worker_threads',
  'vm','node:vm'
]);
const TRUSTED_FILE_READERS = new Set([
  'simulation/evaluation/agent36-source-closure-audit.cjs',
  'simulation/evaluation/agent36-runtime-module-pin.cjs',
  'simulation/evaluation/2026-11/agent42-role-policy-identity.cjs'
]);
const REQUIRED_COMMON_BINDINGS = [
  'observe','promptActions','roleComposer','moduleLoadGuard',
  'sourceClosureAudit','roleIdentityHelper'
];

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
      assert.ok(!PHYSICAL_CONTEXT_KEYS.has(key.toLowerCase()),
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
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      const usesEsm=/^\s*import\s/.test(line)||/^\s*export\s+(?:default|const|let|var|function|class|\*|\{)/.test(line)||
        /\bimport\s*\(/.test(line)||/\bimport\.meta\b/.test(line);
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
      const kind=usesEsm?'esm':usesDynamicCode?'dynamic-code':usesProcessOrWorker?'process-or-worker':
        usesNetwork?'network':'unreviewed-file-read';
      if(usesEsm||usesDynamicCode||usesProcessOrWorker||usesNetwork||usesUnseededRandom||
        (usesFileReader&&!TRUSTED_FILE_READERS.has(file.path)))
        unsupported.push({file:file.path,line:i+1,kind:usesUnseededRandom?'unseeded-random':kind});
    }
  }
  assert.deepEqual(unsupported,[],
    'Role policy closure contains ESM, dynamic code, process/worker or unreviewed file loading');
}
function environmentManifest(keys,allowlist,env) {
  const requested=[...new Set(allowlist)].sort();
  const observed=[...keys].sort();
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
  orderedPromptChain,sharedEnginePatches=[],dataAssetPaths=[],environmentAllowlist=[],
  environment={},enginePin,runnerRevision,nodeVersion=process.version}) {
  const root=fs.realpathSync(repositoryRoot);
  const entry=canonicalPath(entrypoint,'entrypoint');
  assert.ok(Array.isArray(commonRuntimeBindings),'commonRuntimeBindings must be an array');
  const names=new Set();
  const bindings=commonRuntimeBindings.map(binding=>{
    assert.ok(binding&&typeof binding==='object'&&!Array.isArray(binding),
      'common runtime binding must be an object');
    const name=stableId(binding.name,'common runtime binding name');
    assert.ok(!names.has(name),'duplicate common runtime binding: '+name);
    names.add(name);
    return {name,path:canonicalPath(binding.path,'common runtime binding path')};
  }).sort((a,b)=>a.name.localeCompare(b.name));
  for(const name of REQUIRED_COMMON_BINDINGS)
    assert.ok(names.has(name),'common runtime manifest must pin '+name);

  assert.ok(Array.isArray(orderedPromptChain)&&orderedPromptChain.length>0,
    'orderedPromptChain must preserve at least one prompt module in execution order');
  const promptChain=orderedPromptChain.map((item,index)=>{
    if(typeof item==='string')return {name:'prompt-'+index,path:canonicalPath(item,'prompt-chain path')};
    assert.ok(item&&typeof item==='object'&&!Array.isArray(item),
      'prompt-chain entry must be a path or named path');
    return {name:stableId(item.name,'prompt-chain name'),path:canonicalPath(item.path,'prompt-chain path')};
  });
  assert.equal(new Set(promptChain.map(x=>x.name)).size,promptChain.length,
    'prompt-chain names must be unique');

  assert.ok(Array.isArray(sharedEnginePatches),'sharedEnginePatches must be an array');
  const patches=sharedEnginePatches.map((item,index)=>{
    if(typeof item==='string')return {name:'patch-'+index,path:canonicalPath(item,'engine patch path')};
    assert.ok(item&&typeof item==='object'&&!Array.isArray(item),
      'engine patch entry must be a path or named path');
    return {name:stableId(item.name,'engine patch name'),path:canonicalPath(item.path,'engine patch path')};
  });
  assert.equal(new Set(patches.map(x=>x.name)).size,patches.length,
    'shared engine patch names must be unique');

  assert.match(enginePin??'',GIT_SHA,'enginePin must be a pinned Git commit');
  assert.match(runnerRevision??'',GIT_SHA,'runnerRevision must be a Git commit');
  assert.match(nodeVersion??'',NODE_VERSION,'nodeVersion must be explicit and pinned');

  const entries=[entry,...bindings.map(x=>x.path),...promptChain.map(x=>x.path),
    ...patches.map(x=>x.path)];
  const closure=auditSourceClosure(root,entries);
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
    'role policy closure must contain source files');
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
    'source closure digest does not match the verified file list');
  const fileByPath=new Map(verifiedFiles.map(file=>[file.path,file.sha256]));
  const verifiedBindings=bindings.map(binding=>({...binding,sha256:fileByPath.get(binding.path)}));
  const observe=verifiedBindings.find(binding=>binding.name==='observe');
  const verifiedPromptChain=promptChain.map(item=>({...item,sha256:fileByPath.get(item.path)}));
  const verifiedPatches=patches.map(item=>({...item,sha256:fileByPath.get(item.path)}));
  const assets=[...new Set(dataAssetPaths.map(p=>canonicalPath(p,'data asset path')))]
    .sort().map(assetPath=>({path:assetPath,
      sha256:hashBytes(fs.readFileSync(assertInsideRoot(root,assetPath,'data asset')))}));
  const env=environmentManifest(closure.keys??[],environmentAllowlist,environment);
  const allowedBuiltinRequires=(limits.externalRequires??[]).filter(item=>
    BUILTINS.has(item.request)&&!FORBIDDEN_EXTERNAL_BUILTINS.has(item.request))
    .sort((a,b)=>(a.file+'\0'+a.request).localeCompare(b.file+'\0'+b.request));
  const manifest={
    schema:ENTRY_MANIFEST_SCHEMA,complete:true,
    entrypoint:entry,
    sourceAuditVersion:closure.version,
    sourceAuditLimitations:unresolved,
    allowedBuiltinRequires,
    closureMethod:'static-literal-commonjs-require-closure; exact runtime load pin required',
    closureSha256,files:verifiedFiles,
    commonRuntimeBindings:verifiedBindings,
    observationContractSha256:evidenceBundleSha256({name:observe.name,path:observe.path,sha256:observe.sha256}),
    orderedPromptChain:verifiedPromptChain,
    promptChainSha256:evidenceBundleSha256(verifiedPromptChain),
    sharedEnginePatches:verifiedPatches,
    sharedEnginePatchSha256:evidenceBundleSha256(verifiedPatches),
    dataAssets:assets,
    environment:env,
    runtimeGuard:{schema:'agent36-pre-execution-commonjs-module-pin-v1',required:true},
    nodeVersion,enginePin,runnerRevision
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
  return {expectedByPath,unionSha256:evidenceBundleSha256(expectedByPath)};
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
  return {schema:'aichi-loaded-process-runtime-closure-v1',files,
    sha256:evidenceBundleSha256(files)};
}

/** Create a role identity whose digest is independent of physical seat/rank. */
function buildRolePolicyIdentity({role,rank=null,producerId,deckSha256,
  policyVersion,entryManifest,entryManifestSha256,challengeSuiteSha256,
  policyOptions,policyConstraintsSha256}) {
  assert.ok(['candidate-policy','opponent-policy'].includes(role),'invalid policy role');
  if(role==='candidate-policy')assert.equal(rank,null,
    'candidate policy identity is field-wide and must not be rank-scoped');
  else assert.ok(Number.isInteger(rank)&&rank>=1&&rank<=32,
    'opponent policy identity requires a Top 32 rank');
  stableId(producerId,'policy producer ID');
  stableId(policyVersion,'policy version');
  for(const [label,value] of Object.entries({deckSha256,entryManifestSha256,challengeSuiteSha256,policyConstraintsSha256}))
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
  assert.ok(entryManifest.commonRuntimeBindings?.some(x=>x.name==='observe')&&
    entryManifest.commonRuntimeBindings?.some(x=>x.name==='promptActions'),
    'entry manifest must bind common observer and prompt-action adapters');
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
    entryManifestSha256,policyConstraintsSha256,observationContractSha256,
    promptChainSha256,sharedEnginePatchSha256,policyOptions
  };
  return {
    schema:ROLE_IDENTITY_SCHEMA,role,rank,policyProducerId:producerId,
    deckSha256,policySha256:evidenceBundleSha256(policyDefinition),
    entryManifestSha256,challengeSuiteSha256,policyVersion,
    observationContractSha256,promptChainSha256,sharedEnginePatchSha256,
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
  assert.equal(candidateIdentity.sharedEnginePatchSha256,opponentIdentity.sharedEnginePatchSha256,
    'candidate and opponent must use the same shared engine patch set');
  for(const key of ['enginePin','runnerRevision','nodeVersion'])
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
