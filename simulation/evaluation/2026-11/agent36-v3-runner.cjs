'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {canonicalJson}=require('../agent45-independent-competitive-admission.cjs');
const actionsReceipts=require('./agent44-actions-metadata-receipts.cjs');
const {preparePreDealPolicyRegistration}=require('./agent44-v3-game-bundle-builder.cjs');
const {withCandidateOpponentPolicyRoles}=require('../../twinleaf/agent44-role-scoped-policy-composition.cjs');
const roleIdentity=require('./agent42-role-policy-identity.cjs');
const {withPinnedResearchModuleLoads}=require('../agent36-runtime-module-pin.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const GIT_SHA=/^[0-9a-f]{40}$/;
const RUN_ID=/^[1-9]\d*$/;
const PREDEAL_FIELDS=[
  'ready','status','fixtureOnly','producerId','trialId','gameRegistration',
  'policyPlanCore','policyPlanSha256','policyAttestationBundle',
  'policyAttestationBundleSha256','policyRegistration',
  'policyRegistrationSha256','preDealArtifactRef','preDealArtifactSha256'
];

function loadNativeRoleDependencies(){
  // Literal vendor imports are tied to the submodule gitlink, not research code.
  const {SimpleTacticsAi}=require('../../../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai');
  const {Store}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/store');
  const {GamePhase}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/state/state');
  const cardActions=require('../../../vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action');
  const gameActions=require('../../../vendor/twinleaf/ptcg-server/output/game/store/actions/game-actions');
  const promptActions=require('../../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
  const {CardManager}=require('../../../vendor/twinleaf/ptcg-server/output/game/cards/card-manager');
  const {PokemonCard}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/card/pokemon-card');
  const {EnergyCard}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/card/energy-card');
  const {TrainerCard}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/card/trainer-card');
  const {Stage,EnergyType,CardType,TrainerType,SpecialCondition}=
    require('../../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types');
  const {PowerType}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/card/pokemon-types');
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
    getCatalog,getNativeTrainerCatalog,observe:actorObservation,promptActions};
}

/** Compose frozen role policies around one synchronous native game. */
function runCandidateOpponentPolicyRoles(run,options={}){
  const {commonDeps:providedDeps,composer=withCandidateOpponentPolicyRoles,
    trial,candidateIdentity,opponentIdentity,...roleOptions}=options;
  const commonDeps=providedDeps??loadNativeRoleDependencies();
  if(trial){
    assert.equal(roleOptions.candidateSeat,trial.candidateSeat,
      'candidate role seat must be fixed by the registered trial before game start');
    assert.equal(roleOptions.opponentSeat,trial.originalSourceSeat,
      'opponent role seat must be fixed by the registered trial before game start');
  }
  if(candidateIdentity){
    assert.equal(canonicalJson(roleOptions.candidatePolicyOptions??{}),
      canonicalJson(candidateIdentity.policyDefinition?.policyOptions),
      'candidate runtime options differ from the frozen role identity');
  }
  if(opponentIdentity){
    assert.equal(canonicalJson(roleOptions.opponentPolicyOptions??{}),
      canonicalJson(opponentIdentity.policyDefinition?.policyOptions),
      'opponent runtime options differ from the frozen role identity');
  }
  const result=composer(run,{...roleOptions,commonDeps});
  if(trial){
    assert.deepEqual(result.roleSeatMap,
      {candidate:trial.candidateSeat,opponent:trial.originalSourceSeat},
      'physical role-to-seat mapping differs from the registered trial');
    assert.equal(result.candidateAudit.policyOwnerSeat,trial.candidateSeat);
    assert.equal(result.opponentAudit.policyOwnerSeat,trial.originalSourceSeat);
  }
  return result;
}

/**
 * The two role manifests define the only allowed research module union.
 * Every file in that union must already be loaded; the runtime pin then
 * rejects unregistered, changed, or post-freeze research-owned CommonJS code.
 */
function combineAndPinV3RoleRuntime({repositoryRoot=ROOT,candidateManifest,
  opponentManifest,run,identityHelper=roleIdentity,pin=withPinnedResearchModuleLoads,
  cacheEntries}){
  assert.equal(typeof run,'function','pinned V3 game callback is required');
  const combined=identityHelper.combineRolePolicyEntryManifests(
    candidateManifest,opponentManifest);
  const loaded=identityHelper.assertLoadedResearchModulesCovered(
    repositoryRoot,combined.expectedByPath,cacheEntries);
  const expectedPaths=Object.keys(combined.expectedByPath).sort();
  const loadedPaths=loaded.files.map(file=>file.path).sort();
  assert.deepEqual(loadedPaths,expectedPaths,
    'every role-closure module must be preloaded before the runtime pin is installed');
  const pinned=pin(repositoryRoot,combined.expectedByPath,run);
  assert.equal(pinned.audit?.guardRestored,true,
    'Agent36 runtime module pin did not restore the original CommonJS loader');
  return {...pinned,expectedByPath:combined.expectedByPath,
    runtimePinUnionSha256:combined.unionSha256,
    loadedProcessClosureSha256:loaded.sha256,
    loadedProcessClosure:loaded};
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
  loadNativeRoleDependencies,runCandidateOpponentPolicyRoles,
  combineAndPinV3RoleRuntime,createV3PolicyApplicationReceipt,
  readJsonFile,writeJsonAtomic,main};
