'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {canonicalJson,evidenceBundleSha256}=require('../agent45-independent-competitive-admission.cjs');
const actionsReceipts=require('./agent44-actions-metadata-receipts.cjs');
const {preparePreDealPolicyRegistration}=require('./agent44-v3-game-bundle-builder.cjs');
const {withCandidateOpponentPolicyRoles}=require('../../twinleaf/agent44-role-scoped-policy-composition.cjs');
const roleIdentity=require('./agent42-role-policy-identity.cjs');
const {withPinnedResearchModuleLoads}=require('../agent36-runtime-module-pin.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const GIT_SHA=/^[0-9a-f]{40}$/;
const SHA256=/^[0-9a-f]{64}$/;
const RUN_ID=/^[1-9]\d*$/;
const PREDEAL_FIELDS=[
  'ready','status','fixtureOnly','producerId','trialId','gameRegistration',
  'policyPlanCore','policyPlanSha256','policyAttestationBundle',
  'policyAttestationBundleSha256','policyRegistration',
  'policyRegistrationSha256','preDealArtifactRef','preDealArtifactSha256'
];

function initializeNativeCardPool({CardManager,sets,enginePin,repositoryRoot=ROOT,readFile=fs.readFileSync}){
  assert.match(enginePin??'',GIT_SHA,
    'card-pool initialization requires the role manifest Twinleaf engine pin');
  assert.equal(process.env.AGENT36_TWINLEAF_COMMIT_SHA,enginePin,
    'checked-out Twinleaf submodule does not match the frozen role engine pin');
  const cardManager=CardManager.getInstance();
  const startupPath='vendor/twinleaf/ptcg-server/start.js';
  const startupFilename=path.join(repositoryRoot,...startupPath.split('/'));
  const startupBytes=readFile(startupFilename);
  const startupSha256=createHash('sha256').update(startupBytes).digest('hex');
  const setNames=[...startupBytes.toString('utf8').matchAll(
    /^\s*cardManager\.defineSet\(sets\.(\w+)\)\s*;?/gm
  )].map(match=>match[1]);
  assert.ok(setNames.length>0,
    'no card sets identified in the pinned Twinleaf startup file');
  assert.equal(new Set(setNames).size,setNames.length,
    'pinned Twinleaf startup repeats a card set definition');
  for(const name of setNames){
    assert.ok(Array.isArray(sets[name]),
      'pinned startup refers to an unavailable card set: '+name);
  }
  const prior=cardManager.__agent36CardPoolInitialization;
  if(prior){
    assert.equal(prior.enginePin,enginePin,
      'card-pool singleton was initialized under a different Twinleaf revision');
    assert.equal(prior.startupSha256,startupSha256,
      'pinned Twinleaf startup bytes changed after card-pool initialization');
    assert.equal(prior.cardCount,cardManager.getAllCards().length,
      'card-pool contents changed after initialization receipt');
    return prior;
  }
  assert.equal(cardManager.getAllCards().length,0,
    'card pool was populated before the V3 pinned initializer could attest it');
  assert.equal(typeof cardManager.defineSet,'function',
    'pinned CardManager does not expose defineSet');
  for(const name of setNames)cardManager.defineSet(sets[name]);
  const cardCount=cardManager.getAllCards().length;
  assert.ok(cardCount>0,'pinned startup defined no cards');
  const receipt={schema:'agent36-twinleaf-card-pool-initialization-v1',
    enginePin,startupPath,startupSha256,setNames,definedSetCount:setNames.length,
    cardCount};
  Object.defineProperty(cardManager,'__agent36CardPoolInitialization',{
    value:receipt,enumerable:false,writable:false,configurable:false
  });
  return receipt;
}

function loadNativeRoleDependencies({enginePin}={}){
  // Literal vendor imports are tied to the submodule gitlink, not research code.
  const {SimpleTacticsAi}=require('../../../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai');
  const {Store}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/store');
  const {GamePhase}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/state/state');
  const cardActions=require('../../../vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action');
  const gameActions=require('../../../vendor/twinleaf/ptcg-server/output/game/store/actions/game-actions');
  const promptActions=require('../../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
  const {CardManager}=require('../../../vendor/twinleaf/ptcg-server/output/game/cards/card-manager');
  const sets=require('../../../vendor/twinleaf/ptcg-server/output/sets');
  const {PokemonCard}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/card/pokemon-card');
  const {EnergyCard}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/card/energy-card');
  const {TrainerCard}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/card/trainer-card');
  const {Stage,EnergyType,CardType,TrainerType,SpecialCondition}=
    require('../../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types');
  const {PowerType}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/card/pokemon-types');
  const cardPoolInitialization=initializeNativeCardPool({CardManager,sets,enginePin});
  const {buildActorCardCatalog}=require('../../twinleaf/agent34-actor-only-root-policy.cjs');
  const {actorObservation}=require('../../twinleaf/actor-observation-contract.cjs');
  const {trainerPrintCatalog}=require('../../twinleaf/agent5-generic-owner-trainer-opportunity.cjs');
  let catalog=null,trainerCatalog=null;
  const getCatalog=()=>catalog??=(buildActorCardCatalog(CardManager.getInstance().getAllCards(),{
    PokemonCard,EnergyCard,TrainerCard,Stage,EnergyType,CardType,TrainerType,
    PowerType,SpecialCondition
  }));
  const getNativeTrainerCatalog=()=>trainerCatalog??=(trainerPrintCatalog(
    CardManager.getInstance().getAllCards(),{TrainerCard,TrainerType}));
  return {SimpleTacticsAi,Store,GamePhase,cardActions,gameActions,
    getCatalog,getNativeTrainerCatalog,observe:actorObservation,promptActions,
    cardPoolInitialization};
}

/** Compose frozen role policies around one synchronous native game. */
function runCandidateOpponentPolicyRoles(run,options={}){
  const {commonDeps:providedDeps,composer=withCandidateOpponentPolicyRoles,
    trial,candidateIdentity,opponentIdentity,...roleOptions}=options;
  assert.ok(candidateIdentity&&opponentIdentity,
    'both frozen role identities are required before a V3 game can start');
  assert.ok(trial,'registered trial seat mapping is required before a V3 game can start');
  const expectedEnginePin=candidateIdentity.entryManifest?.enginePin;
  assert.match(expectedEnginePin??'',GIT_SHA,
    'candidate role identity is missing its frozen Twinleaf engine pin');
  assert.equal(opponentIdentity.entryManifest?.enginePin,expectedEnginePin,
    'candidate and opponent roles must share the exact Twinleaf engine pin');
  const commonDeps=providedDeps??loadNativeRoleDependencies({enginePin:expectedEnginePin});
  assert.equal(commonDeps.cardPoolInitialization?.enginePin,expectedEnginePin,
    'native card pool was not initialized under the frozen Twinleaf revision');
  assert.equal(roleOptions.candidateSeat,trial.candidateSeat,
    'candidate role seat must be fixed by the registered trial before game start');
  assert.equal(roleOptions.opponentSeat,trial.originalSourceSeat,
    'opponent role seat must be fixed by the registered trial before game start');
  assert.equal(canonicalJson(roleOptions.candidatePolicyOptions??{}),
    canonicalJson(candidateIdentity.policyDefinition?.policyOptions),
    'candidate runtime options differ from the frozen role identity');
  assert.equal(canonicalJson(roleOptions.opponentPolicyOptions??{}),
    canonicalJson(opponentIdentity.policyDefinition?.policyOptions),
    'opponent runtime options differ from the frozen role identity');
  const result=composer(run,{...roleOptions,commonDeps});
  assert.deepEqual(result.roleSeatMap,
    {candidate:trial.candidateSeat,opponent:trial.originalSourceSeat},
    'physical role-to-seat mapping differs from the registered trial');
  assert.equal(result.candidateAudit.policyOwnerSeat,trial.candidateSeat);
  assert.equal(result.opponentAudit.policyOwnerSeat,trial.originalSourceSeat);
  return result;
}

function prepareV3RoleRuntimeEvidence({repositoryRoot=ROOT,candidateManifest,
  opponentManifest,cardPoolInitialization,identityHelper=roleIdentity,cacheEntries}){
  assert.equal(cardPoolInitialization?.schema,
    'agent36-twinleaf-card-pool-initialization-v1',
    'pinned native card-pool initialization receipt is required');
  assert.match(cardPoolInitialization.enginePin??'',GIT_SHA,
    'card-pool receipt must bind the Twinleaf engine pin');
  assert.ok(Array.isArray(cardPoolInitialization.setNames)&&
    cardPoolInitialization.setNames.length>0,
    'card-pool receipt must bind the ordered startup set list');
  assert.match(cardPoolInitialization.startupSha256??'',SHA256,
    'card-pool startup source hash is invalid');
  assert.equal(cardPoolInitialization.startupPath,'vendor/twinleaf/ptcg-server/start.js',
    'card-pool receipt must identify the pinned Twinleaf startup file');
  assert.equal(cardPoolInitialization.definedSetCount,cardPoolInitialization.setNames.length,
    'card-pool receipt set count differs from the ordered set list');
  assert.ok(Number.isInteger(cardPoolInitialization.cardCount)&&cardPoolInitialization.cardCount>0,
    'card-pool receipt must attest a nonempty card pool');
  assert.equal(candidateManifest?.manifest?.enginePin,cardPoolInitialization.enginePin,
    'candidate entry manifest engine pin differs from card-pool initialization');
  assert.equal(opponentManifest?.manifest?.enginePin,cardPoolInitialization.enginePin,
    'opponent entry manifest engine pin differs from card-pool initialization');
  const combined=identityHelper.combineRolePolicyEntryManifests(
    candidateManifest,opponentManifest);
  const loaded=identityHelper.assertLoadedResearchModulesCovered(
    repositoryRoot,combined.expectedByPath,cacheEntries);
  const expectedPaths=Object.keys(combined.expectedByPath).sort();
  const loadedPaths=loaded.files.map(file=>file.path).sort();
  assert.deepEqual(loadedPaths,expectedPaths,
    'every role-closure module must be preloaded before the runtime pin is installed');
  const cardPoolInitializationSha256=evidenceBundleSha256(cardPoolInitialization);
  const runtimePinEvidence={schema:'aichi-runtime-pin-evidence-v1',
    unionSha256:combined.unionSha256,
    loadedProcessClosureSha256:loaded.sha256,
    cardPoolInitializationSha256};
  return {expectedByPath:combined.expectedByPath,runtimePinEvidence,
    runtimePinUnionSha256:combined.unionSha256,
    loadedProcessClosureSha256:loaded.sha256,cardPoolInitializationSha256,
    loadedProcessClosure:loaded};
}

function runPinnedV3RoleRuntime({repositoryRoot=ROOT,preparedRuntime,run,
  pin=withPinnedResearchModuleLoads}){
  assert.ok(preparedRuntime?.expectedByPath&&preparedRuntime?.runtimePinEvidence,
    'prepared V3 runtime evidence is required before installing the module pin');
  assert.equal(typeof run,'function','pinned V3 game callback is required');
  const pinned=pin(repositoryRoot,preparedRuntime.expectedByPath,run);
  assert.equal(pinned.audit?.guardRestored,true,
    'Agent36 runtime module pin did not restore the original CommonJS loader');
  return {...preparedRuntime,result:pinned.result,audit:pinned.audit};
}

function combineAndPinV3RoleRuntime({repositoryRoot=ROOT,candidateManifest,
  opponentManifest,cardPoolInitialization,run,identityHelper=roleIdentity,
  pin=withPinnedResearchModuleLoads,cacheEntries}){
  const preparedRuntime=prepareV3RoleRuntimeEvidence({repositoryRoot,
    candidateManifest,opponentManifest,cardPoolInitialization,identityHelper,cacheEntries});
  return runPinnedV3RoleRuntime({repositoryRoot,preparedRuntime,run,pin});
}

function createV3PolicyApplicationReceipt(args){
  return roleIdentity.createPolicyApplicationReceipt(args);
}

function nonempty(value){return typeof value==='string'&&value.trim().length>0;}
function validateRepositoryName(value){
  assert.equal(typeof value,'string','repository full name is required');
  assert.match(value,/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,
    'repository must be owner/name');
  return value;
}
function validateArtifactRef(value){
  assert.ok(nonempty(value),'pre-deal artifact reference is required');
  assert.ok(!value.startsWith('/')&&!value.includes('\\')&&
    !value.includes(':')&&!value.includes('?')&&!value.includes('#'),
  'pre-deal artifact reference must be repository-relative');
  const parts=value.split('/');
  assert.ok(parts.every(x=>x.length>0&&x!=='.'&&x!=='..'),
    'pre-deal artifact reference contains an unsafe path segment');
  return value;
}
function gitBlobSha(bytes){
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}
function preDealProjection(value){
  return Object.fromEntries(PREDEAL_FIELDS.map(key=>[
    key,value?.[key]===undefined?null:value[key]
  ]));
}
function verifyPersistedPreDeal(persisted,prepare=preparePreDealPolicyRegistration){
  assert.ok(persisted&&typeof persisted==='object'&&!Array.isArray(persisted),
    'persisted pre-deal artifact must be an object');
  assert.equal(persisted.ready,true,
    'persisted pre-deal artifact is not marked ready');
  assert.equal(persisted.status,'ready-before-deal',
    'persisted pre-deal artifact was not prepared before the deal');
  assert.equal(persisted.fixtureOnly,false,
    'fixture-only pre-deal artifacts cannot enter the production runner');
  validateArtifactRef(persisted.preDealArtifactRef);
  assert.equal(typeof prepare,'function');
  const verified=prepare({
    producerId:persisted.producerId,
    trialId:persisted.trialId,
    gameRegistration:persisted.gameRegistration,
    preDealArtifactRef:persisted.preDealArtifactRef,
    policyPlanCore:persisted.policyPlanCore,
    policyAttestationBundle:persisted.policyAttestationBundle
  });
  assert.equal(verified?.ready,true,
    'production pre-deal policy gate blocked: '+
      (verified?.failures??['unknown-predeal-failure']).join(','));
  assert.equal(verified.fixtureOnly,false,
    'production pre-deal verifier returned fixture-only state');
  assert.equal(canonicalJson(preDealProjection(persisted)),
    canonicalJson(preDealProjection(verified)),
    'persisted pre-deal artifact changed or omitted a verified field');
  return verified;
}
function resolveInsideRoot(repositoryRoot,artifactRef){
  validateArtifactRef(artifactRef);
  const root=fs.realpathSync(repositoryRoot);
  const filename=path.resolve(root,...artifactRef.split('/'));
  const relative=path.relative(root,filename);
  assert.ok(relative&&relative!=='..'&&!relative.startsWith('..'+path.sep)&&
    !path.isAbsolute(relative),'pre-deal artifact escapes repository root');
  const stat=fs.lstatSync(filename);
  assert.ok(stat.isFile()&&!stat.isSymbolicLink(),
    'pre-deal artifact must be a regular tracked file, not a symlink');
  assert.equal(fs.realpathSync(filename),filename,
    'pre-deal artifact path resolves outside its repository location');
  return filename;
}
function apiUrl(apiBaseUrl,pathname){
  const base=new URL(apiBaseUrl);
  if(!base.pathname.endsWith('/'))base.pathname+='/';
  return new URL(pathname.replace(/^\//,''),base).toString();
}
function parseNextLink(value){
  if(typeof value!=='string'||!value)return null;
  for(const part of value.split(/,\s*(?=<)/)){
    const match=part.match(/<([^>]+)>;\s*rel="?next"?/);
    if(match)return match[1];
  }
  return null;
}
async function requestJson(url,{token,fetchImpl=globalThis.fetch}={}){
  assert.ok(nonempty(token),'GITHUB_TOKEN is required for Actions metadata');
  assert.equal(typeof fetchImpl,'function','fetch implementation is required');
  const response=await fetchImpl(url,{headers:{
    Accept:'application/vnd.github+json',
    Authorization:`Bearer ${token}`,
    'X-GitHub-Api-Version':'2022-11-28',
    'User-Agent':'experiment-01-agent36-v3-runner'
  }});
  if(!response?.ok){
    let detail='';
    try{detail=await response.text();}catch{}
    throw new Error(`GitHub API request failed (${response?.status??'no-status'}): ${detail.slice(0,500)}`);
  }
  assert.equal(typeof response.json,'function','GitHub API response has no JSON body');
  return {data:await response.json(),link:response.headers?.get?.('link')??null};
}
function validateRun(run,{repositoryFullName,runId,expectedHeadSha}){
  validateRepositoryName(repositoryFullName);
  assert.match(String(runId??''),RUN_ID,'workflow run ID must be positive numeric');
  assert.equal(String(run?.id??''),String(runId),'workflow API returned a different run ID');
  assert.equal(run?.repository?.full_name,repositoryFullName,
    'workflow run repository does not match the checked-out repository');
  assert.match(run?.head_sha??'',GIT_SHA,'workflow run head SHA is invalid');
  if(expectedHeadSha!==undefined){
    assert.match(expectedHeadSha??'',GIT_SHA,'checked-out workflow head SHA is invalid');
    assert.equal(run.head_sha,expectedHeadSha,
      'workflow run head SHA differs from the checked-out research revision');
  }
  assert.equal(typeof run.run_started_at,'string',
    'workflow run is missing server-reported run_started_at');
  assert.ok(Number.isFinite(Date.parse(run.run_started_at)),
    'workflow run_started_at is invalid');
  assert.match(run.run_started_at,/Z$|[+-]\d{2}:\d{2}$/,
    'workflow run_started_at must include an explicit UTC offset');
  return run;
}
async function fetchWorkflowRun({repositoryFullName,runId,token,
  expectedHeadSha,apiBaseUrl='https://api.github.com',fetchImpl=globalThis.fetch}){
  validateRepositoryName(repositoryFullName);
  const url=apiUrl(apiBaseUrl,
    `repos/${repositoryFullName}/actions/runs/${encodeURIComponent(String(runId))}`);
  const {data}=await requestJson(url,{token,fetchImpl});
  return validateRun(data,{repositoryFullName,runId,expectedHeadSha});
}
async function fetchWorkflowJobs({repositoryFullName,runId,token,
  apiBaseUrl='https://api.github.com',fetchImpl=globalThis.fetch}){
  validateRepositoryName(repositoryFullName);
  assert.match(String(runId??''),RUN_ID,'workflow run ID must be positive numeric');
  let next=apiUrl(apiBaseUrl,
    `repos/${repositoryFullName}/actions/runs/${encodeURIComponent(String(runId))}/jobs?per_page=100&page=1`);
  const seen=new Set(),jobs=[];
  while(next){
    assert.ok(!seen.has(next),'GitHub Actions jobs pagination loop detected');
    seen.add(next);
    const {data,link}=await requestJson(next,{token,fetchImpl});
    assert.ok(Array.isArray(data?.jobs),'GitHub Actions jobs response is missing jobs array');
    jobs.push(...data.jobs);
    next=parseNextLink(link);
  }
  assert.ok(jobs.length>0,'GitHub Actions jobs response contains no jobs');
  return jobs;
}
async function fetchCommittedArtifact({repositoryFullName,artifactRef,run,
  repositoryRoot,expectedPreDeal,token,apiBaseUrl='https://api.github.com',fetchImpl=globalThis.fetch}){
  validateRepositoryName(repositoryFullName);
  validateArtifactRef(artifactRef);
  const filename=resolveInsideRoot(repositoryRoot,artifactRef);
  const localBytes=fs.readFileSync(filename);
  const committedPreDeal=JSON.parse(localBytes.toString('utf8'));
  assert.equal(canonicalJson(preDealProjection(committedPreDeal)),
    canonicalJson(preDealProjection(expectedPreDeal)),
    'checked-out pre-deal artifact object differs from the verified policy registration');
  const localBlobSha=gitBlobSha(localBytes);
  const encodedPath=artifactRef.split('/').map(encodeURIComponent).join('/');
  const url=apiUrl(apiBaseUrl,
    `repos/${repositoryFullName}/contents/${encodedPath}?ref=${encodeURIComponent(run.head_sha)}`);
  const {data}=await requestJson(url,{token,fetchImpl});
  assert.equal(data?.type,'file','pre-deal artifact ref is not a repository file');
  assert.match(data?.sha??'',GIT_SHA,'GitHub content API returned an invalid blob SHA');
  assert.equal(data.sha,localBlobSha,
    'checked-out pre-deal artifact bytes do not match the committed Git blob');
  assert.equal(data.encoding,'base64','GitHub content API did not return base64 file bytes');
  const remoteBytes=Buffer.from(String(data.content??'').replace(/\s/g,''),'base64');
  assert.ok(remoteBytes.length>0,'GitHub content API returned no artifact bytes');
  assert.ok(remoteBytes.equals(localBytes),
    'checked-out pre-deal artifact differs from the committed GitHub blob');
  return {repositoryFullName,artifactRef,artifactSha256:null,
    commitSha:run.head_sha,blobSha:data.sha};
}
async function collectPreDealPersistenceReceipt({preDeal,repositoryRoot,
  repositoryFullName,runId,token,expectedHeadSha,apiBaseUrl,fetchImpl,
  prepare=preparePreDealPolicyRegistration,receiptAdapter=actionsReceipts}){
  const verified=verifyPersistedPreDeal(preDeal,prepare);
  const run=await fetchWorkflowRun({repositoryFullName,runId,token,
    expectedHeadSha,apiBaseUrl,fetchImpl});
  const artifact=await fetchCommittedArtifact({repositoryFullName,
    artifactRef:verified.preDealArtifactRef,run,repositoryRoot,
    expectedPreDeal:verified,token,apiBaseUrl,fetchImpl});
  artifact.artifactSha256=verified.preDealArtifactSha256;
  const receipt=receiptAdapter.createPreDealPersistenceReceipt({
    preDeal:verified,run,artifact
  });
  return {preDeal:verified,run,artifact,receipt};
}
async function collectDealGenerationReceipt({preDeal,trial,persistenceReceipt,
  repositoryFullName,runId,token,expectedHeadSha,apiBaseUrl,fetchImpl,
  receiptAdapter=actionsReceipts}){
  const run=await fetchWorkflowRun({repositoryFullName,runId,token,
    expectedHeadSha,apiBaseUrl,fetchImpl});
  const jobs=await fetchWorkflowJobs({repositoryFullName,runId,token,
    apiBaseUrl,fetchImpl});
  const matchingJobs=jobs.filter(job=>Array.isArray(job?.steps)&&
    job.steps.some(step=>step?.name===actionsReceipts.DEAL_GENERATION_STEP_NAME));
  assert.equal(matchingJobs.length,1,
    'completed workflow must contain exactly one physical-deal generation job');
  const matches=matchingJobs[0].steps.filter(step=>
    step?.name===actionsReceipts.DEAL_GENERATION_STEP_NAME);
  assert.equal(matches.length,1,
    'physical-deal generation job must contain exactly one dedicated generation step');
  const serverStepStartedAt=matches[0].started_at;
  const boundTrial={...trial,dealGenerationStepStartedAt:serverStepStartedAt};
  const receipt=receiptAdapter.createDealGenerationReceipt({
    preDeal,trial:boundTrial,run,jobs,persistenceReceipt
  });
  return {trial:boundTrial,run,jobs,receipt};
}
function readJsonFile(repositoryRoot,relativePath){
  const filename=resolveInsideRoot(repositoryRoot,relativePath);
  return JSON.parse(fs.readFileSync(filename,'utf8'));
}
function writeJsonAtomic(filename,value){
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const temp=filename+'.'+process.pid+'.tmp';
  fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
  fs.renameSync(temp,filename);
  return filename;
}
async function main(argv=process.argv.slice(2),env=process.env){
  const [command,...args]=argv;
  const repositoryRoot=ROOT;
  const common={
    repositoryFullName:env.GITHUB_REPOSITORY,
    runId:env.GITHUB_RUN_ID,
    token:env.GITHUB_TOKEN,
    expectedHeadSha:env.GITHUB_SHA,
    apiBaseUrl:env.GITHUB_API_URL||'https://api.github.com'
  };
  if(command==='predeal'){
    const artifactRef=validateArtifactRef(args[0]||env.AGENT36_V3_PREDEAL_ARTIFACT_REF);
    const preDeal=readJsonFile(repositoryRoot,artifactRef);
    const result=await collectPreDealPersistenceReceipt({
      ...common,preDeal,repositoryRoot
    });
    const output=path.join(repositoryRoot,'artifacts/agent36-v3/predeal-persistence-receipt.json');
    writeJsonAtomic(output,result.receipt);
    process.stdout.write(JSON.stringify({
      status:'PREDEAL_PERSISTENCE_VERIFIED',trialId:result.preDeal.trialId,
      workflowRunId:result.receipt.workflowRunId,
      workflowHeadSha:result.receipt.workflowHeadSha,
      artifactRef:result.receipt.artifactRef,
      artifactSha256:result.receipt.artifactSha256,
      blobSha:result.receipt.blobSha,output
    },null,2)+'\n');
    return result;
  }
  if(command==='postgame'){
    const [preDealRef,trialRef,persistenceReceiptRef]=args;
    const preDeal=readJsonFile(repositoryRoot,preDealRef);
    const trial=readJsonFile(repositoryRoot,trialRef);
    const persistenceReceipt=readJsonFile(repositoryRoot,persistenceReceiptRef);
    const result=await collectDealGenerationReceipt({
      ...common,preDeal,trial,persistenceReceipt
    });
    const dir=path.join(repositoryRoot,'artifacts/agent36-v3');
    writeJsonAtomic(path.join(dir,'trial-with-server-generation-time.json'),result.trial);
    writeJsonAtomic(path.join(dir,'deal-generation-receipt.json'),result.receipt);
    process.stdout.write(JSON.stringify({
      status:'DEAL_GENERATION_METADATA_VERIFIED',trialId:result.trial.trialId,
      jobId:result.receipt.jobId,stepStartedAt:result.receipt.stepStartedAt,
      output:dir
    },null,2)+'\n');
    return result;
  }
  throw new Error('Usage: node agent36-v3-runner.cjs predeal <committed-predeal-ref> | postgame <predeal-ref> <trial-ref> <persistence-receipt-ref>');
}

if(require.main===module){
  main().catch(error=>{
    process.stderr.write(String(error?.stack||error)+'\n');
    process.exitCode=1;
  });
}

module.exports={GIT_SHA,RUN_ID,PREDEAL_FIELDS,validateRepositoryName,
  validateArtifactRef,gitBlobSha,preDealProjection,verifyPersistedPreDeal,
  resolveInsideRoot,apiUrl,parseNextLink,requestJson,validateRun,
  fetchWorkflowRun,fetchWorkflowJobs,fetchCommittedArtifact,
  collectPreDealPersistenceReceipt,collectDealGenerationReceipt,
  initializeNativeCardPool,loadNativeRoleDependencies,runCandidateOpponentPolicyRoles,
  prepareV3RoleRuntimeEvidence,runPinnedV3RoleRuntime,
  combineAndPinV3RoleRuntime,createV3PolicyApplicationReceipt,
  readJsonFile,writeJsonAtomic,main};
