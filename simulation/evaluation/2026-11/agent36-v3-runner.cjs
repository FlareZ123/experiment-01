'use strict';

const assert=require('node:assert/strict');
const Module=require('node:module');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {canonicalJson,evidenceBundleSha256}=require('../agent45-independent-competitive-admission.cjs');
const actionsReceipts=require('./agent44-actions-metadata-receipts.cjs');
const {preparePreDealPolicyRegistration,revalidatePreDealPolicyRegistration,
  buildV3GameBundle}=require('./agent44-v3-game-bundle-builder.cjs');
const {withCandidateOpponentPolicyRoles,candidateOpponentRoleSeats}=require('../../twinleaf/agent44-role-scoped-policy-composition.cjs');
const {withOwnerQuickBallPromptContinuation}=require('../../twinleaf/2026-11/agent49-owner-quick-ball-prompt-continuation.cjs');
const roleIdentity=require('./agent42-role-policy-identity.cjs');
const {withPinnedResearchModuleLoads}=require('../agent36-runtime-module-pin.cjs');
const {auditSourceClosure}=require('../agent36-source-closure-audit.cjs');
const {runNativeFixtureGame,runNativeFixtureGameAsync,acquireNativeFixtureProcessLock,releaseNativeFixtureProcessLock}=require('./agent49-native-fixture-game.cjs');
const nativeActionFrontier=require('./agent36-native-action-frontier.cjs');
const nativePromptProjection=require('./agent36-prompt-projection.cjs');
const {installPromptProvenanceHook}=require('./agent36-prompt-provenance.cjs');
const workerProtocol=require('./agent49-policy-worker.cjs');
const workerLauncher=require('./agent36-docker-policy-worker.cjs');
const {createDockerPolicySession}=require('./agent36-async-docker-policy-session.cjs');
const {publicEventReceipt}=require('../../twinleaf/agent8-public-event-receipt.cjs');
const fixtureRuntimePin=require('./agent49-fixture-scoped-runtime-pin.cjs');

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
  const {ActionEnumerator}=require('../../../vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator');
  const {Simulator}=require('../../../vendor/twinleaf/ptcg-server/output/game/bots/simulator');
  const promptActions=require('../../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
  const {CardManager}=require('../../../vendor/twinleaf/ptcg-server/output/game/cards/card-manager');
  const sets=require('../../../vendor/twinleaf/ptcg-server/output/sets');
  const {GameSettings}=require('../../../vendor/twinleaf/ptcg-server/output/game/core/game-settings');
  const {AddPlayerAction}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/actions/add-player-action');
  const {ShuffleDeckPrompt}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/prompts/shuffle-prompt');
  const {CoinFlipPrompt}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/prompts/coin-flip-prompt');
  const {WaitPrompt}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/prompts/wait-prompt');
  const simpleBotDefinitions=require('../../../vendor/twinleaf/ptcg-server/output/simple-bot/simple-bot-definitions');
  const {BotFlipMode,BotShuffleMode}=require('../../../vendor/twinleaf/ptcg-server/output/game/bots/bot-arbiter');
  const {PokemonCard}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/card/pokemon-card');
  const {EnergyCard}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/card/energy-card');
  const {TrainerCard}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/card/trainer-card');
  const {Stage,EnergyType,CardType,TrainerType,SpecialCondition,Format}=
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
  const makeBotOptions = () => ({
    tactics: [...simpleBotDefinitions.allSimpleTactics],
    promptResolvers: [...simpleBotDefinitions.allPromptResolvers],
    scores: structuredClone(simpleBotDefinitions.defaultStateScores),
    arbiter: {
      flipMode: BotFlipMode.RANDOM,
      shuffleMode: BotShuffleMode.RANDOM,
    },
  });
  const botOptionsBySeat = [makeBotOptions(), makeBotOptions()];
  assert.notEqual(botOptionsBySeat[0], botOptionsBySeat[1]);
  assert.notEqual(botOptionsBySeat[0].arbiter, botOptionsBySeat[1].arbiter);
  return {SimpleTacticsAi,Store,GamePhase,cardActions,gameActions,
    ActionEnumerator,Simulator,PlayerType:cardActions.PlayerType,SlotType:cardActions.SlotType,
    getCatalog,getNativeTrainerCatalog,observe:actorObservation,promptActions,
    GameSettings,Format,AddPlayerAction,
    ResolvePromptAction:promptActions.ResolvePromptAction,
    ShuffleDeckPrompt,CoinFlipPrompt,WaitPrompt,botOptionsBySeat,CardManager,sets,
    cardPoolInitialization};
}

/**
 * Normalize the result returned through the V3 role composer and runtime pin.
 * A native-game exception is caught inside the composed callback, so its
 * {fixtureFailure, fixtureGamePartial} envelope is nested under roleResult.result.
 * A wrapper/runtime failure may instead return the envelope directly.
 */
function normalizeV3FixtureRoleResult(returnedResult){
  const isObject=returnedResult!==null&&typeof returnedResult==='object';
  const roleResult=isObject&&Object.prototype.hasOwnProperty.call(returnedResult,'result')?
    returnedResult:null;
  const directFailureEnvelope=isObject&&returnedResult.fixtureFailure?
    returnedResult:null;
  const roleExecutionResult=roleResult?.result??null;
  const nestedFailureEnvelope=roleExecutionResult&&
    typeof roleExecutionResult==='object'&&roleExecutionResult.fixtureFailure?
      roleExecutionResult:null;
  const failureEnvelope=directFailureEnvelope??nestedFailureEnvelope;
  const gameResult=directFailureEnvelope?
    (directFailureEnvelope.fixtureGamePartial??null):
    nestedFailureEnvelope?
      (nestedFailureEnvelope.fixtureGamePartial??null):
      roleExecutionResult;
  return {roleResult,failureEnvelope,gameResult,
    workerExecutionAudit:roleResult?.workerAudit??directFailureEnvelope?.workerAudit??null};
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
  const complete=pinned=>{
    assert.equal(pinned.audit?.guardRestored,true,
      'Agent36 runtime module pin did not restore the original CommonJS loader');
    return {...preparedRuntime,result:pinned.result,audit:pinned.audit};
  };
  const pinned=pin(repositoryRoot,preparedRuntime.expectedByPath,run);
  return pinned&&typeof pinned.then==='function'?pinned.then(complete):complete(pinned);
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
function bindFixtureFormatToApplicationReceipt(application,trial) {
  if(!application)return null;
  assert.ok(application.receipt&&typeof application.receipt==='object',
    'fixture application receipt is required');
  const {receiptSha256:_previousReceiptSha256,...basePayload}=application.receipt;
  const formatFields={
    candidateFormat:trial.candidateFormat,
    gameRuleset:trial.gameRuleset,
    opponentSourceEventFormat:trial.opponentSourceEventFormat,
    expandedLegalityAsOf:trial.expandedLegalityAsOf,
    eventDate:trial.eventDate,
    formatReviewStatus:trial.formatReviewStatus
  };
  for(const [key,value] of Object.entries(formatFields)){
    if(basePayload[key]!==undefined)
      assert.deepEqual(basePayload[key],value,
        'application receipt '+key+' differs from the frozen fixture contract');
  }
  const receiptPayload={...basePayload,...formatFields};
  return {
    ...application,
    receipt:{
      ...receiptPayload,
      receiptSha256:evidenceBundleSha256(receiptPayload)
    }
  };
}
function buildV3BundleFromArtifacts({preDeal,trial,policyApplicationReceipt,
  preDealPersistenceReceipt,dealGenerationReceipt,evidence,
  policyPanelReceipts=[],reviews=[],builder=buildV3GameBundle}={}) {
  assert.equal(typeof builder,'function','V3 bundle builder must be callable');
  return builder({
    preDeal,trial,evidence,policyApplicationReceipt,
    preDealPersistenceReceipt,dealGenerationReceipt,policyPanelReceipts,reviews
  });
}
async function revalidatePreDealPersistenceReceipt({preDeal,persistenceReceipt,
  repositoryRoot,common,collector=collectPreDealPersistenceReceipt}={}) {
  assert.ok(persistenceReceipt&&typeof persistenceReceipt==='object',
    'pre-deal persistence receipt is required');
  const verified=await collector({
    ...common,preDeal,repositoryRoot,
    runId:persistenceReceipt.workflowRunId,
    expectedHeadSha:persistenceReceipt.workflowHeadSha,
    prepare:revalidatePreDealPolicyRegistration
  });
  assert.deepEqual(verified.receipt,persistenceReceipt,
    'pre-deal persistence receipt differs from live GitHub run/artifact evidence');
  return verified.receipt;
}
async function revalidateDealGenerationReceipt({preDeal,trial,persistenceReceipt,
  dealGenerationReceipt,common,collector=collectDealGenerationReceipt}={}) {
  assert.ok(dealGenerationReceipt&&typeof dealGenerationReceipt==='object',
    'deal-generation receipt is required');
  const verified=await collector({
    ...common,preDeal,trial,persistenceReceipt,
    runId:dealGenerationReceipt.workflowRunId,
    expectedHeadSha:dealGenerationReceipt.workflowHeadSha
  });
  assert.deepEqual(verified.receipt,dealGenerationReceipt,
    'deal-generation receipt differs from live GitHub run/job/step evidence');
  return verified;
}
function writeJsonAtomic(filename,value){
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const temp=filename+'.'+process.pid+'.tmp';
  fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
  fs.renameSync(temp,filename);
  return filename;
}

const V3_FIXTURE = Object.freeze({
  candidatePath: 'results/aichi-2026/candidate-hood-shadow-rider.json',
  fieldPath: 'results/aichi-2026/full-decklists.json',
  officialRank1Path: 'results/aichi-2026/official-rank1-deck-code.json',
  originalAdmissionPath: 'results/aichi-2026/original-printed60-admission-v1.json',
  candidateDeckSha256: '1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924',
  opponentDeckSha256: '159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090',
  candidateGitBlobSha: '24ace2d6feb9ce5d9056bcf271827cfe31b7357b',
  fieldGitBlobSha: 'ae773f6201d7aa69d31914dbfee66f3fba692200',
  engineCommit: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
  seed: 'agent36-v3-fixture-hood-rank1-20261112-01',
  policySeedBySeat: Object.freeze([0x243f6a88,0x85a308d3]),
  maxActions: 6000,
  trialId: 'agent36-v3-fixture-hood-rank1-worker-v1',
  candidateWorkerPolicyPath: 'simulation/evaluation/2026-11/agent46-candidate-policy.cjs',
  opponentWorkerPolicyPath: 'simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs',
  workerPath: 'simulation/evaluation/2026-11/agent49-policy-worker.cjs',
  candidateSeat: 0,
  opponentSeat: 1,
  policyVersion: 'agent34-actor-only-root-slice-v17-agent49-quick-ball-source-bound-v1',
  candidateProducerId: 'agent36-fixture-candidate-agent34-agent49-quick-ball-v1',
  opponentProducerId: 'agent36-fixture-rank1-opponent-agent34-baseline',
  entrypoint: 'simulation/twinleaf/agent34-actor-only-root-policy.cjs',
  hookPath: 'simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs',
  hookId: 'underworld-door-psychic-recipient-v1',
  hookTarget: 'ShadowRiderCalyrexVMAX.prototype.reduceEffect',
  outputDir: 'artifacts/agent36-v3-fixture',
});

const V3_FIXTURE_CANDIDATE_POLICY_OPTIONS = Object.freeze({ quickBallRoot: true });
const V3_FIXTURE_OPPONENT_POLICY_OPTIONS = Object.freeze({});

const V3_FIXTURE_TEST_PATHS = [
  'tests/agent34-actor-only-root-policy.test.cjs',
  'tests/2026-11/agent49-owner-quick-ball-prompt-continuation.test.cjs',
  'tests/agent36-v3-runner.test.cjs',
  'tests/agent42-role-policy-identity.test.cjs',
  'tests/2026-11/agent49-native-fixture-game.test.cjs',
  'tests/2026-11/agent49-fixture-scoped-runtime-pin.test.cjs',
  'tests/2026-11/agent44-v3-game-bundle-builder.test.cjs',
  'tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs',
  'tests/2026-11/agent43-full-state-diagnostic.test.cjs',
  'tests/2026-11/agent36-v3-fixture-game.test.cjs',
  'tests/2026-11/agent36-native-action-frontier.test.cjs',
  'tests/2026-11/agent36-prompt-projection.test.cjs',
  'tests/2026-11/agent36-prompt-provenance.test.cjs',
  'tests/2026-11/agent49-policy-worker.test.cjs',
  'tests/agent36-runtime-module-pin.test.cjs',
];

const V3_FIXTURE_COMMON_BINDINGS = [
  { name: 'observe', path: 'simulation/twinleaf/actor-observation-contract.cjs', exportName: 'actorObservation' },
  { name: 'promptActions', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action.js', exportName: 'ResolvePromptAction' },
  { name: 'roleComposer', path: 'simulation/twinleaf/agent44-role-scoped-policy-composition.cjs', exportName: 'withCandidateOpponentPolicyRoles' },
  { name: 'quickBallPromptContinuation', path: 'simulation/twinleaf/2026-11/agent49-owner-quick-ball-prompt-continuation.cjs', exportName: 'withOwnerQuickBallPromptContinuation' },
  { name: 'moduleLoadGuard', path: 'simulation/evaluation/agent36-runtime-module-pin.cjs', exportName: 'withPinnedResearchModuleLoads' },
  { name: 'sourceClosureAudit', path: 'simulation/evaluation/agent36-source-closure-audit.cjs', exportName: 'auditSourceClosure' },
  { name: 'roleIdentityHelper', path: 'simulation/evaluation/2026-11/agent42-role-policy-identity.cjs', exportName: 'buildRolePolicyIdentity' },
  { name: 'trainerCatalog', path: 'simulation/twinleaf/agent5-generic-owner-trainer-opportunity.cjs', exportName: 'trainerPrintCatalog' },
  { name: 'cardPoolStartup', path: 'vendor/twinleaf/ptcg-server/start.js' },
  { name: 'nativeStore', path: 'vendor/twinleaf/ptcg-server/output/game/store/store.js', exportName: 'Store' },
  { name: 'nativeGameSettings', path: 'vendor/twinleaf/ptcg-server/output/game/core/game-settings.js', exportName: 'GameSettings' },
  { name: 'nativeAddPlayerAction', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/add-player-action.js', exportName: 'AddPlayerAction' },
  { name: 'nativeShuffleDeckPrompt', path: 'vendor/twinleaf/ptcg-server/output/game/store/prompts/shuffle-prompt.js', exportName: 'ShuffleDeckPrompt' },
  { name: 'nativeWaitPrompt', path: 'vendor/twinleaf/ptcg-server/output/game/store/prompts/wait-prompt.js', exportName: 'WaitPrompt' },
  { name: 'nativeCoinFlipPrompt', path: 'vendor/twinleaf/ptcg-server/output/game/store/prompts/coin-flip-prompt.js', exportName: 'CoinFlipPrompt' },
  { name: 'nativeGamePhase', path: 'vendor/twinleaf/ptcg-server/output/game/store/state/state.js', exportName: 'GamePhase' },
  { name: 'nativeCardManager', path: 'vendor/twinleaf/ptcg-server/output/game/cards/card-manager.js', exportName: 'CardManager' },
  { name: 'nativeSets', path: 'vendor/twinleaf/ptcg-server/output/sets/index.js' },
  { name: 'nativeSimpleTacticsAi', path: 'vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai.js', exportName: 'SimpleTacticsAi' },
  { name: 'nativeSimpleBotDefinitions', path: 'vendor/twinleaf/ptcg-server/output/simple-bot/simple-bot-definitions.js' },
  { name: 'nativeBotArbiter', path: 'vendor/twinleaf/ptcg-server/output/game/bots/bot-arbiter.js' },
  { name: 'nativeCardActions', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action.js' },
  { name: 'nativeGameActions', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/game-actions.js' },
  { name: 'nativePokemonCard', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/pokemon-card.js', exportName: 'PokemonCard' },
  { name: 'nativeEnergyCard', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/energy-card.js', exportName: 'EnergyCard' },
  { name: 'nativeTrainerCard', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/trainer-card.js', exportName: 'TrainerCard' },
  { name: 'nativeCardTypes', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/card-types.js', exportName: 'Format' },
  { name: 'nativePokemonTypes', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/pokemon-types.js', exportName: 'PowerType' },
];

const V3_FIXTURE_PROMPT_CHAIN = [
  { name: 'candidate-opponent-role-composition', path: 'simulation/twinleaf/agent44-role-scoped-policy-composition.cjs' },
  { name: 'actor-only-root-policy', path: V3_FIXTURE.entrypoint },
  // Installed last inside the role-composer callback: the candidate-only
  // Quick Ball continuation resolves exact owner payment/search prompts.
  { name: 'owner-quick-ball-prompt-continuation', path: 'simulation/twinleaf/2026-11/agent49-owner-quick-ball-prompt-continuation.cjs' },
  { name: 'native-prompt-resolution', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action.js' },
];



const V3_FIXTURE_WORKER_COMMON_BINDINGS = [
  { name: 'observe', path: 'simulation/twinleaf/actor-observation-contract.cjs', exportName: 'actorObservation' },
  { name: 'roleComposer', path: 'simulation/twinleaf/agent44-role-scoped-policy-composition.cjs', exportName: 'withCandidateOpponentPolicyRoles' },
  { name: 'roleSeatMap', path: 'simulation/twinleaf/agent44-role-scoped-policy-composition.cjs', exportName: 'candidateOpponentRoleSeats' },
  { name: 'publicEventReceipt', path: 'simulation/twinleaf/agent8-public-event-receipt.cjs', exportName: 'publicEventReceipt' },
  { name: 'workerProtocol', path: 'simulation/evaluation/2026-11/agent49-policy-worker.cjs', exportName: 'validateRequest' },
  { name: 'workerLauncher', path: 'simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs', exportName: 'createPolicyBundle' },
  { name: 'workerSession', path: 'simulation/evaluation/2026-11/agent36-async-docker-policy-session.cjs', exportName: 'createDockerPolicySession' },
  { name: 'nativeActionFrontier', path: 'simulation/evaluation/2026-11/agent36-native-action-frontier.cjs', exportName: 'buildNativeActionFrontier' },
  { name: 'promptProvenance', path: 'simulation/evaluation/2026-11/agent36-prompt-provenance.cjs', exportName: 'installPromptProvenanceHook' },
  { name: 'nativeActionEnumerator', path: 'vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator.js', exportName: 'ActionEnumerator' },
  { name: 'nativeSimulator', path: 'vendor/twinleaf/ptcg-server/output/game/bots/simulator.js', exportName: 'Simulator' },
  { name: 'nativePlayerType', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action.js', exportName: 'PlayerType' },
  { name: 'nativeSlotType', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action.js', exportName: 'SlotType' },
  { name: 'nativePromptProjection', path: 'simulation/evaluation/2026-11/agent36-prompt-projection.cjs', exportName: 'projectPrompt' },
  { name: 'asyncFixtureGameDriver', path: 'simulation/evaluation/2026-11/agent49-native-fixture-game.cjs', exportName: 'runNativeFixtureGameAsync' },
  { name: 'promptActions', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action.js', exportName: 'ResolvePromptAction' },
  { name: 'moduleLoadGuard', path: 'simulation/evaluation/agent36-runtime-module-pin.cjs', exportName: 'withPinnedResearchModuleLoads' },
  { name: 'sourceClosureAudit', path: 'simulation/evaluation/agent36-source-closure-audit.cjs', exportName: 'auditSourceClosure' },
  { name: 'roleIdentityHelper', path: 'simulation/evaluation/2026-11/agent42-role-policy-identity.cjs', exportName: 'buildRolePolicyIdentity' },
  { name: 'trainerCatalog', path: 'simulation/twinleaf/agent5-generic-owner-trainer-opportunity.cjs', exportName: 'trainerPrintCatalog' },
  { name: 'cardPoolStartup', path: 'vendor/twinleaf/ptcg-server/start.js' },
  { name: 'nativeStore', path: 'vendor/twinleaf/ptcg-server/output/game/store/store.js', exportName: 'Store' },
  { name: 'nativeGameSettings', path: 'vendor/twinleaf/ptcg-server/output/game/core/game-settings.js', exportName: 'GameSettings' },
  { name: 'nativeAddPlayerAction', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/add-player-action.js', exportName: 'AddPlayerAction' },
  { name: 'nativeShuffleDeckPrompt', path: 'vendor/twinleaf/ptcg-server/output/game/store/prompts/shuffle-prompt.js', exportName: 'ShuffleDeckPrompt' },
  { name: 'nativeWaitPrompt', path: 'vendor/twinleaf/ptcg-server/output/game/store/prompts/wait-prompt.js', exportName: 'WaitPrompt' },
  { name: 'nativeCoinFlipPrompt', path: 'vendor/twinleaf/ptcg-server/output/game/store/prompts/coin-flip-prompt.js', exportName: 'CoinFlipPrompt' },
  { name: 'nativeGamePhase', path: 'vendor/twinleaf/ptcg-server/output/game/store/state/state.js', exportName: 'GamePhase' },
  { name: 'nativeCardManager', path: 'vendor/twinleaf/ptcg-server/output/game/cards/card-manager.js', exportName: 'CardManager' },
  { name: 'nativeSets', path: 'vendor/twinleaf/ptcg-server/output/sets/index.js' },
  { name: 'nativeSimpleTacticsAi', path: 'vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai.js', exportName: 'SimpleTacticsAi' },
  { name: 'nativeSimpleBotDefinitions', path: 'vendor/twinleaf/ptcg-server/output/simple-bot/simple-bot-definitions.js' },
  { name: 'nativeBotArbiter', path: 'vendor/twinleaf/ptcg-server/output/game/bots/bot-arbiter.js' },
  { name: 'nativeCardActions', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action.js' },
  { name: 'nativeGameActions', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/game-actions.js' },
  { name: 'nativePokemonCard', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/pokemon-card.js', exportName: 'PokemonCard' },
  { name: 'nativeEnergyCard', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/energy-card.js', exportName: 'EnergyCard' },
  { name: 'nativeTrainerCard', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/trainer-card.js', exportName: 'TrainerCard' },
  { name: 'nativeCardTypes', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/card-types.js', exportName: 'Format' },
  { name: 'nativePokemonTypes', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/pokemon-types.js', exportName: 'PowerType' },
];

const V3_FIXTURE_WORKER_PROMPT_CHAIN = [
  { name: 'actor-observation-v3', path: 'simulation/twinleaf/actor-observation-contract.cjs' },
  { name: 'public-event-receipt-v3', path: 'simulation/twinleaf/agent8-public-event-receipt.cjs' },
  { name: 'host-native-action-frontier', path: 'simulation/evaluation/2026-11/agent36-native-action-frontier.cjs' },
  { name: 'active-effect-prompt-provenance', path: 'simulation/evaluation/2026-11/agent36-prompt-provenance.cjs' },
  { name: 'typed-owner-prompt-projection', path: 'simulation/evaluation/2026-11/agent36-prompt-projection.cjs' },
  { name: 'role-scoped-worker-protocol', path: 'simulation/evaluation/2026-11/agent49-policy-worker.cjs' },
  { name: 'native-prompt-resolution', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action.js' },
];


function printed60Fingerprint(deck) {
  assert.ok(deck && Array.isArray(deck.cards), 'printed deck must contain cards');
  const rows = deck.cards.map((row) => [
    row.category,
    row.name,
    row.count,
    row.printing && row.printing.set !== undefined ? row.printing.set : null,
    row.printing && row.printing.number !== undefined ? row.printing.number : null,
    row.printing && row.printing.language !== undefined ? row.printing.language : null,
  ]);
  rows.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return createHash('sha256').update(JSON.stringify(rows), 'utf8').digest('hex');
}

function engineProxyPrintingForSourceRow(row) {
  const sourcePrinting = row.printing;
  // Preserve source identities when an exact printing is absent from the
  // engine. The reviewed corresponding printings are SFA/61 and SVE/5.
  if (row.name === 'Night Stretcher'
      && sourcePrinting.set === 'ASC'
      && String(sourcePrinting.number) === '196') {
    return { ...sourcePrinting, set: 'SFA', number: '61' };
  }
  if (row.name === 'Psychic Energy'
      && sourcePrinting.set === 'MEE'
      && String(sourcePrinting.number) === '13') {
    return { ...sourcePrinting, set: 'SVE', number: '5' };
  }
  return sourcePrinting;
}

function resolvePrintedDeck(deck, allCards, { label = 'deck', expectedSize = 60 } = {}) {
  assert.ok(deck && Array.isArray(deck.cards), label + ' must contain a cards array');
  const cards = Array.isArray(allCards) ? allCards : Array.from(allCards && allCards.values ? allCards.values() : []);
  const byPrinting = new Map();
  for (const card of cards) {
    const key = JSON.stringify([card.name, card.set, String(card.setNumber)]);
    const matches = byPrinting.get(key) || [];
    matches.push(card);
    byPrinting.set(key, matches);
  }
  const fullNames = [];
  const resolvedRows = [];
  const categoryCounts = {};
  for (const row of deck.cards) {
    assert.ok(row && typeof row.name === 'string' && Number.isInteger(row.count) && row.count > 0, label + ' contains an invalid card row');
    assert.ok(row.printing && row.printing.language === 'en', label + ' requires an explicit English source printing for ' + row.name);
    // Prefer the exact source printing whenever the pinned engine has it.
    // A proxy is only a fallback for a missing source print; ambiguous exact
    // registrations fail closed instead of silently selecting a proxy.
    const sourceKey = JSON.stringify([row.name, row.printing.set, String(row.printing.number)]);
    const sourceMatches = byPrinting.get(sourceKey) || [];
    assert.ok(sourceMatches.length <= 1, label + ' exact source printing must resolve at most once before proxy fallback: ' + row.name + ' ' + row.printing.set + ' ' + row.printing.number + ' (matches=' + sourceMatches.length + ')');
    const enginePrinting = sourceMatches.length === 1 ? row.printing : engineProxyPrintingForSourceRow(row);
    const key = JSON.stringify([row.name, enginePrinting.set, String(enginePrinting.number)]);
    const matches = sourceMatches.length === 1 ? sourceMatches : (byPrinting.get(key) || []);
    assert.equal(matches.length, 1, label + ' exact or approved engine-proxy printing must resolve once: ' + row.name + ' ' + enginePrinting.set + ' ' + enginePrinting.number + ' (source=' + row.printing.set + '/' + row.printing.number + ', matches=' + matches.length + ')');
    const nativeCard = matches[0];
    assert.ok(typeof nativeCard.fullName === 'string' && nativeCard.fullName.length > 0, label + ' resolved card is missing fullName');
    for (let i = 0; i < row.count; i += 1) fullNames.push(nativeCard.fullName);
    resolvedRows.push({
      category: row.category,
      name: row.name,
      count: row.count,
      printing: row.printing,
      enginePrinting,
      engineFullName: nativeCard.fullName,
    });
    categoryCounts[row.category] = (categoryCounts[row.category] || 0) + row.count;
  }
  assert.equal(fullNames.length, expectedSize, label + ' must resolve to exactly ' + expectedSize + ' cards');
  if (deck.category_counts) assert.deepEqual(categoryCounts, deck.category_counts, label + ' category counts must match the frozen source');
  return { fullNames, resolvedRows, categoryCounts, total: fullNames.length };
}

function fixtureBotOptionsProfile(options) {
  return {
    tactics: (options.tactics || []).map((item) => item && (item.name || item.constructor && item.constructor.name) || String(item)),
    promptResolvers: (options.promptResolvers || []).map((item) => item && (item.name || item.constructor && item.constructor.name) || String(item)),
    scores: structuredClone(options.scores),
    arbiter: {
      flipMode: options.arbiter && options.arbiter.flipMode !== undefined ? options.arbiter.flipMode : null,
      shuffleMode: options.arbiter && options.arbiter.shuffleMode !== undefined ? options.arbiter.shuffleMode : null,
    },
  };
}

function buildFixtureRoleEntryManifest({
  repositoryRoot = ROOT,
  enginePin,
  runnerRevision,
  entrypoint = V3_FIXTURE.entrypoint,
  commonRuntimeBindings = V3_FIXTURE_COMMON_BINDINGS,
  orderedPromptChain = V3_FIXTURE_PROMPT_CHAIN,
  additionalDataAssetPaths = [],
} = {}) {
  assert.match(enginePin || '', /^[0-9a-f]{40}$/i, 'fixture engine pin must be a full Git SHA');
  assert.match(runnerRevision || '', /^[0-9a-f]{40}$/i, 'fixture runner revision must be a full Git SHA');
  commonRuntimeBindings = commonRuntimeBindings.map((binding) => ({ ...binding }));
  orderedPromptChain = orderedPromptChain.map((item) => ({ ...item }));
  const sharedEnginePatches = [{ name: V3_FIXTURE.hookId, path: V3_FIXTURE.hookPath }];
  const dataAssetPaths = [
    V3_FIXTURE.candidatePath,
    V3_FIXTURE.fieldPath,
    V3_FIXTURE.workerPath,
    V3_FIXTURE.officialRank1Path,
    V3_FIXTURE.originalAdmissionPath,
    'simulation/evaluation/2026-11/agent36-v3-runner.cjs',
    'simulation/evaluation/2026-11/agent49-native-fixture-game.cjs',
    'simulation/evaluation/2026-11/agent49-fixture-scoped-runtime-pin.cjs',
    'simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs',
    ...V3_FIXTURE_TEST_PATHS,
    ...additionalDataAssetPaths,
  ];
  const dependencyLockPaths = ['vendor/twinleaf/ptcg-server/package-lock.json'];
  const researchEntries = [
    entrypoint,
    ...commonRuntimeBindings.map((binding) => binding.path),
    ...orderedPromptChain.map((item) => item.path),
    ...sharedEnginePatches.map((item) => item.path),
  ].filter((item) => !item.startsWith('vendor/twinleaf/'));
  const sourceClosure = auditSourceClosure(repositoryRoot, researchEntries, { vendorPrefixes: ['vendor/twinleaf/'] });
  const environmentAllowlist = [...new Set((sourceClosure.keys || []).filter((key) => !key.startsWith('GITHUB_') && !key.startsWith('RUNNER_')))].sort();
  const built = roleIdentity.createPolicyEntryManifest({
    repositoryRoot,
    entrypoint,
    commonRuntimeBindings,
    orderedPromptChain,
    sharedEnginePatches,
    dataAssetPaths,
    dependencyLockPaths,
    environmentAllowlist,
    enginePin,
    runnerRevision,
  });
  assert.equal(built.manifest.complete, true, 'fixture policy entry manifest must be complete');
  return { ...built, environmentAllowlist, sourceClosureSummary: sourceClosure };
}

function fixtureChallengeSuiteSha256(entryManifest) {
  const testAssets = (entryManifest.dataAssets || []).filter((asset) => asset.path.startsWith('tests/')).map((asset) => ({
    path: asset.path,
    sha256: asset.sha256,
  }));
  assert.ok(testAssets.length > 0, 'fixture challenge suite must bind test assets');
  return evidenceBundleSha256(testAssets);
}

function buildFixturePolicyConstraints({ patchDescriptor, botOptionsProfile, workerPolicyVersions = null }) {
  const workerProfile=workerPolicyVersions!==null;
  return {
    fixtureOnly: true,
    engineFormat: 'Expanded',
    benchmarkFormat: 'Japanese Extra',
    candidateFormat: 'Expanded',
    gameRuleset: 'Expanded',
    opponentSourceEventFormat: 'Japanese Extra',
    expandedLegalityAsOf: null,
    eventDate: null,
    formatReviewStatus: 'unverified-fixture-only',
    crossFormatCompatibilityEstablished: false,
    paperDeckLegalityEstablished: false,
    policyProfile: workerProfile ? 'Agent46 candidate and Agent6 rank-1 opponent in separate persistent actor-only Docker workers' : 'agent34 actor-only root policy plus Twinleaf SimpleTacticsAi baseline',
    candidateHoodOptionsApplied: false,
    candidateRecoveryAutonomyApplied: false,
    policyCompetenceIndependentlyReviewed: false,
    ...(workerProfile?{enginePlayerShellProfile:botOptionsProfile}:{botOptionsProfile}),
    observationSurface: workerProfile ? 'actor-observation-v3 plus public-event-receipt-v3, typed host action frontier and prompt projection; workers receive no native state or physical RNG' : 'actorObservation contract supplied to the existing role composer; whole-policy information safety not certified',
    decisionBudget: { maxActions: V3_FIXTURE.maxActions },
    randomizationProtocol: {
      algorithm: workerProfile ? 'xorshift32-physical-host-only-v1' : 'xorshift32-physical-and-seat-policy-streams-v1',
      seed: V3_FIXTURE.seed,
      seedDerivation: 'sha256-first-u32le for string seed; identity for uint32 seed',
      ...(workerProfile?{policySeedDisclosure:'none; workers receive no policy RNG seed'}:{policySeedXors:[0x6a09e667,0xbb67ae85]}),
    },
    paperFirstTurnRules: {
      firstTurnDrawCard: true,
      firstTurnUseSupporter: false,
      attackFirstTurn: false,
    },
    rolePolicyVersions: workerPolicyVersions,
    decisionBoundary: workerProfile ? 'every strategic root and owner prompt is delegated to the persistent role worker; host-only prompts and physical randomization stay in the host' : 'legacy synchronous role composition',
    sharedEngineCompatibilityPatches: [patchDescriptor],
  };
}

function buildFixtureRoleIdentities({
  manifestResult,
  candidateManifestResult = manifestResult,
  opponentManifestResult = manifestResult,
  challengeSuiteSha256,
  policyConstraintsSha256,
  preparedRuntime,
  candidatePolicyVersion = V3_FIXTURE.policyVersion,
  opponentPolicyVersion = V3_FIXTURE.policyVersion,
  candidateProducerId = V3_FIXTURE.candidateProducerId,
  opponentProducerId = V3_FIXTURE.opponentProducerId,
  candidatePolicyOptions = V3_FIXTURE_CANDIDATE_POLICY_OPTIONS,
  opponentPolicyOptions = V3_FIXTURE_OPPONENT_POLICY_OPTIONS,
  candidateDeckSha256 = V3_FIXTURE.candidateDeckSha256,
  opponentDeckSha256 = V3_FIXTURE.opponentDeckSha256,
} = {}) {
  const common = {
    challengeSuiteSha256,
    policyConstraintsSha256,
    runtimePinUnionSha256: preparedRuntime.runtimePinUnionSha256,
    loadedProcessClosureSha256: preparedRuntime.loadedProcessClosureSha256,
    cardPoolInitializationSha256: preparedRuntime.cardPoolInitializationSha256,
  };
  const candidateIdentity = roleIdentity.buildRolePolicyIdentity({
    ...common,
    entryManifest: candidateManifestResult.manifest,
    entryManifestSha256: candidateManifestResult.entryManifestSha256,
    policyVersion: candidatePolicyVersion,
    deckSha256: candidateDeckSha256,
    role: 'candidate-policy',
    rank: null,
    producerId: candidateProducerId,
    policyOptions: candidatePolicyOptions,
  });
  const opponentIdentity = roleIdentity.buildRolePolicyIdentity({
    ...common,
    entryManifest: opponentManifestResult.manifest,
    entryManifestSha256: opponentManifestResult.entryManifestSha256,
    policyVersion: opponentPolicyVersion,
    deckSha256: opponentDeckSha256,
    role: 'opponent-policy',
    rank: 1,
    producerId: opponentProducerId,
    policyOptions: opponentPolicyOptions,
  });
  return { candidateIdentity, opponentIdentity };
}

function buildFixturePolicyPlan({ candidateIdentity, opponentIdentity, constraints, runtimePinEvidence, trialId = V3_FIXTURE.trialId } = {}) {
  const candidate = {
    deckSha256: candidateIdentity.deckSha256,
    policySha256: candidateIdentity.policySha256,
    entryManifestSha256: candidateIdentity.entryManifestSha256,
    challengeSuiteSha256: candidateIdentity.challengeSuiteSha256,
    policyProducerId: candidateIdentity.policyProducerId,
    formatStatus: 'unverified',
    formatStatusEvidenceRef: null,
  };
  const opponent = {
    rank: 1,
    sourceStatus: 'authenticated',
    deckSha256: opponentIdentity.deckSha256,
    policySha256: opponentIdentity.policySha256,
    entryManifestSha256: opponentIdentity.entryManifestSha256,
    challengeSuiteSha256: opponentIdentity.challengeSuiteSha256,
    policyProducerId: opponentIdentity.policyProducerId,
    formatStatus: 'unverified',
    formatStatusEvidenceRef: null,
  };
  const policyPlanCore = {
    schema: 'aichi-policy-plan-core-v1',
    fixtureOnly: true,
    candidateFormat: constraints.candidateFormat,
    gameRuleset: constraints.gameRuleset,
    opponentSourceEventFormat: constraints.opponentSourceEventFormat,
    expandedLegalityAsOf: constraints.expandedLegalityAsOf,
    eventDate: constraints.eventDate,
    formatReviewStatus: constraints.formatReviewStatus,
    candidate,
    opponentPolicyBundle: { fixtureOnly: true, ranks: [opponent] },
    constraints,
    runtimePinEvidence,
  };
  const policyPlanSha256 = evidenceBundleSha256(policyPlanCore);
  const policyRegistration = {
    schema: 'aichi-policy-registration-v1',
    trialId,
    policyPlanSha256,
    fixtureOnly: true,
    candidateFormat: constraints.candidateFormat,
    gameRuleset: constraints.gameRuleset,
    opponentSourceEventFormat: constraints.opponentSourceEventFormat,
    expandedLegalityAsOf: constraints.expandedLegalityAsOf,
    eventDate: constraints.eventDate,
    formatReviewStatus: constraints.formatReviewStatus,
  };
  const policyAttestationBundle = {
    schema: 'aichi-policy-attestation-bundle-v1',
    trialId,
    policyPlanSha256,
    fixtureOnly: true,
    signatures: [],
    independentReviewers: [],
  };
  const preDeal = {
    ready: true,
    fixtureOnly: true,
    candidateFormat: constraints.candidateFormat,
    gameRuleset: constraints.gameRuleset,
    opponentSourceEventFormat: constraints.opponentSourceEventFormat,
    expandedLegalityAsOf: constraints.expandedLegalityAsOf,
    eventDate: constraints.eventDate,
    formatReviewStatus: constraints.formatReviewStatus,
    trialId,
    policyPlanCore,
    policyPlanSha256,
    policyRegistration,
    policyRegistrationSha256: evidenceBundleSha256(policyRegistration),
    policyAttestationBundle,
    policyAttestationBundleSha256: evidenceBundleSha256(policyAttestationBundle),
  };
  return { policyPlanCore, policyPlanSha256, policyRegistration, policyAttestationBundle, preDeal };
}

function sha256Function(fn) {
  assert.equal(typeof fn, 'function', 'runtime patch target must be a function');
  return createHash('sha256').update(Function.prototype.toString.call(fn), 'utf8').digest('hex');
}

function createUnderworldRuntimePatchReceipt({ restoreHook, moduleSha256 } = {}) {
  assert.ok(restoreHook && restoreHook.isRestored, 'Underworld hook must be restored in outer finally');
  return {
    schema: 'aichi-runtime-patch-installation-receipt-v1',
    patchId: V3_FIXTURE.hookId,
    modulePath: V3_FIXTURE.hookPath,
    moduleSha256,
    target: V3_FIXTURE.hookTarget,
    originalReducerFingerprint: sha256Function(restoreHook.originalReducer),
    installedReducerFingerprint: sha256Function(restoreHook.installedReducer),
    installCount: 1,
    installBoundary: 'outer-v3-runner-before-role-wrappers',
    restoreCount: 1,
    restoreBoundary: 'outer-finally',
    restoredOriginal: true,
    nestedInstallCount: 0,
    wrapperInstallCount: 0,
  };
}


function loadWorkerPolicyModule(repositoryRoot,relativePath,role) {
  const root=fs.realpathSync(repositoryRoot);
  const filename=path.resolve(root,relativePath);
  const relative=path.relative(root,filename);
  assert.ok(relative&&relative!=='..'&&!relative.startsWith('..'+path.sep)&&
    !path.isAbsolute(relative),
    'worker policy module must remain inside the repository');
  const stat=fs.lstatSync(filename);
  assert.ok(stat.isFile()&&!stat.isSymbolicLink(),
    role+' worker policy must be a regular non-symlink file');
  const source=fs.readFileSync(filename,'utf8');
  const versionMatch=source.match(/\bconst\s+POLICY_VERSION\s*=\s*(['"])([^'"]+)\1\s*;/);
  assert.ok(versionMatch,role+' worker policy must declare a static POLICY_VERSION');
  const policyVersion=versionMatch[2];
  assert.match(policyVersion,/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/,
    role+' worker policy must declare a stable POLICY_VERSION');
  assert.match(source,/module\.exports\s*=|exports\.POLICY_VERSION/,
    role+' worker policy must expose its version and factory to the worker');
  assert.doesNotMatch(source,/\b(?:require|import|process|globalThis|fetch|setTimeout|setInterval)\b|Math\.random/,
    role+' worker policy must remain pure, deterministic, and free of host/runtime APIs');
  const sourceClosure=auditSourceClosure(root,[relativePath],{vendorPrefixes:[]});
  assert.equal(sourceClosure.files.length,1,
    role+' worker policy must have no transitive source dependencies');
  assert.equal(sourceClosure.files[0].path,relativePath,
    role+' worker policy source closure must contain only its inert entry asset');
  assert.deepEqual(sourceClosure.limitations?.externalRequires??[],[],
    role+' worker policy must not import external runtime modules');
  assert.deepEqual(sourceClosure.keys??[],[],
    role+' worker policy must not read environment variables');
  return {
    POLICY_VERSION:policyVersion,
    sourcePath:relativePath,
    policySha256:createHash('sha256').update(source,'utf8').digest('hex'),
    sourceClosureSummary:sourceClosure
  };
}

function buildRoleWorkerBundle({repositoryRoot=ROOT,policyModulePath}={}) {
  const workerFilename=path.resolve(repositoryRoot,V3_FIXTURE.workerPath);
  const policyFilename=path.resolve(repositoryRoot,policyModulePath);
  assert.ok(workerFilename.startsWith(repositoryRoot+path.sep));
  assert.ok(policyFilename.startsWith(repositoryRoot+path.sep));
  const workerSha256=createHash('sha256').update(fs.readFileSync(workerFilename)).digest('hex');
  const policySha256=createHash('sha256').update(fs.readFileSync(policyFilename)).digest('hex');
  const bundle=workerLauncher.createPolicyBundle({
    sourceRoot:repositoryRoot,
    policyFiles:[
      {sourcePath:workerFilename,relativePath:'worker.cjs',sha256:workerSha256},
      {sourcePath:policyFilename,relativePath:'policy.cjs',sha256:policySha256},
    ],
  });
  return {bundle,workerSha256,policySha256};
}

function assertTrustedActionSelection(frontier,token) {
  const item=frontier?.actionFrontier?.items?.find(candidate=>candidate.token===token);
  assert.ok(item,'worker selected an action token outside the frozen native frontier');
  if(item.kind==='use-stadium'&&item.publicMetadata?.stadiumEffectLive!==true) {
    const error=new Error('Stadium action requires verified liveness metadata; the current engine frontier does not establish it');
    error.code='UNKNOWN_STADIUM_LIVENESS';
    throw error;
  }
  return item;
}

function resolveFixtureSeatAssignment({candidateSeat,opponentSeat,candidateDeck,opponentDeck}={}) {
  const roleSeatMap=candidateOpponentRoleSeats({candidateSeat,opponentSeat});
  assert.ok(Array.isArray(candidateDeck)&&Array.isArray(opponentDeck),
    'candidate and opponent decks must be arrays before assigning physical seats');
  return {
    roleSeatMap,
    deckA:roleSeatMap.candidate===0?candidateDeck:opponentDeck,
    deckB:roleSeatMap.candidate===1?candidateDeck:opponentDeck,
    playerNames:roleSeatMap.candidate===0?
      ['candidate','opponent']:['opponent','candidate']
  };
}

function createV3WorkerExecutionAudit({
  candidateSeat=V3_FIXTURE.candidateSeat,
  opponentSeat=V3_FIXTURE.opponentSeat,
  candidatePolicyVersion=null,
  opponentPolicyVersion=null,
}={}) {
  const role=(name,seat,policyVersion)=>({
    role:name,seat,policyVersion,bundleSha256:null,policySha256:null,
    decisionCount:0,rootDecisionCount:0,promptDecisionCount:0,
    hostOnlyPromptCount:0,abstentionCount:0,failureCount:0,
    timeoutCount:0,lastFailureCode:null,
    workerProcessClosed:false,containerRemoved:false,policyBundleRemoved:false,
    containerIdSha256:null,policyStreamProtocol:null,policyDrawCount:null,
  });
  return {
    schema:'agent49-v3-worker-execution-audit-v1',
    workerProcessPerRole:true,
    physicalSeedDisclosedToWorker:false,
    policySeedDisclosedToWorker:false,
    roles:{
      candidate:role('candidate',candidateSeat,candidatePolicyVersion),
      opponent:role('opponent',opponentSeat,opponentPolicyVersion),
    },
    totalWorkerDecisions:0,totalHostOnlyPrompts:0,totalAbstentions:0,totalFailures:0,
    cleanupVerified:false,cleanupFailureCount:0,cleanupReceipts:[],promptProvenanceHook:null,
  };
}

function createV3WorkerDecisionResolver({
  sessionsBySeat,candidateSeat=V3_FIXTURE.candidateSeat,
  opponentSeat=V3_FIXTURE.opponentSeat,native,workerAudit,
  actionFrontier=nativeActionFrontier,
  promptProjection=nativePromptProjection,
  eventReceipt=publicEventReceipt,
  provenanceHook=null,
  provenanceContext=null,
}={}) {
  assert.ok(sessionsBySeat&&typeof sessionsBySeat==='object');
  assert.ok(native&&typeof native.observe==='function');
  assert.ok(workerAudit&&workerAudit.roles);
  const roleSeatMap=candidateOpponentRoleSeats({candidateSeat,opponentSeat});
  const roleForSeat=seat=>seat===roleSeatMap.candidate?'candidate':
    seat===roleSeatMap.opponent?'opponent':null;
  const emptyFrontier={schema:workerProtocol.FRONTIER_SCHEMA,items:[]};
  const recordFailure=(roleAudit,error)=>{
    const code=typeof error?.code==='string'&&/^[A-Z0-9_]{1,64}$/.test(error.code)?
      error.code:'WORKER_DECISION_FAILURE';
    if(code==='POLICY_ABSTAINED'){
      roleAudit.abstentionCount++;
      workerAudit.totalAbstentions++;
    }else{
      roleAudit.failureCount++;
      workerAudit.totalFailures++;
      if(code.includes('TIMEOUT'))roleAudit.timeoutCount++;
    }
    if(String(session?.stderr??'').includes('POLICY_RANDOM_DRAWS_UNREPLAYABLE'))
      roleAudit.policyDrawCount=null;
    roleAudit.lastFailureCode=code;
  };
  return async request=>{
    assert.equal(request?.kind,'native-fixture-decision',
      'unexpected native fixture yield');
    const actorSeat=request.actorSeat;
    const role=roleForSeat(actorSeat);
    assert.ok(role,'decision actor is not assigned to either frozen policy role');
    const roleAudit=workerAudit.roles[role];
    const session=sessionsBySeat[actorSeat];
    assert.ok(session&&typeof session.decide==='function',
      'persistent role worker is unavailable for the acting seat');
    try{
      const observation=native.observe(request.state,actorSeat);
      const receipt=request.state.activePlayer===actorSeat?
        eventReceipt(request.state,actorSeat,null,null):null;
      if(request.prompt){
        const activeProvenanceHook=provenanceContext?.current??provenanceHook;
        const projected=promptProjection.projectPrompt({
          prompt:request.prompt,state:request.state,actorSeat,native,
          provenanceHook:activeProvenanceHook
        });
        if(projected.hostOnly){
          const resolved=promptProjection.resolveHostOnlyPrompt({
            prompt:request.prompt,state:request.state,store:request.store,native,
            physicalRandom:request.physicalRandom,provenanceHook:activeProvenanceHook,dispatch:false
          });
          roleAudit.hostOnlyPromptCount++;
          workerAudit.totalHostOnlyPrompts++;
          return {
            __nativeFixtureDecisionResolution:true,
            action:resolved.action,
            promptResolution:{
              kind:resolved.summary?.kind??'host-only',
              selectedCount:resolved.summary?.selectedCount??null
            }
          };
        }
        const response=await session.decide({
          observation,prompt:projected.promptProjection,
          publicEventReceipt:receipt,actionFrontier:emptyFrontier
        });
        roleAudit.decisionCount++;
        roleAudit.promptDecisionCount++;
        workerAudit.totalWorkerDecisions++;
        if(response.decision?.kind==='abstain'){
          const error=new Error('role worker abstained on an owner prompt');
          error.code='POLICY_ABSTAINED';
          throw error;
        }
        assert.ok(['select-choice','select-choices'].includes(response.decision?.kind),
          'worker returned an unsupported prompt decision kind');
        const prepared=promptProjection.dispatchPromptChoice({
          store:request.store,prompt:request.prompt,state:request.state,actorSeat,
          projection:projected,decision:response.decision,native,dispatch:false
        });
        return {
          __nativeFixtureDecisionResolution:true,
          action:prepared.action,
          promptResolution:{
            kind:'worker-choice',decisionKind:response.decision.kind,
            selectedCount:Array.isArray(prepared.rawResult)?prepared.rawResult.length:1
          }
        };
      }
      if(typeof native.ActionEnumerator!=='function'||
          typeof native.Simulator!=='function'){
        const error=new Error('pinned Twinleaf ActionEnumerator and Simulator must be wired into loadNativeRoleDependencies before worker root decisions');
        error.code='NATIVE_ACTION_FRONTIER_BINDINGS_MISSING';
        throw error;
      }
      const frontier=request.withPhysicalRandom?
        request.withPhysicalRandom(()=>actionFrontier.buildNativeActionFrontier({
          state:request.state,actorSeat,native
        })):
        actionFrontier.buildNativeActionFrontier({state:request.state,actorSeat,native});
      const response=await session.decide({
        observation,prompt:null,publicEventReceipt:receipt,
        actionFrontier:frontier.actionFrontier
      });
      roleAudit.decisionCount++;
      roleAudit.rootDecisionCount++;
      workerAudit.totalWorkerDecisions++;
      if(response.decision?.kind==='abstain'){
        const error=new Error('role worker abstained on an owner root decision');
        error.code='POLICY_ABSTAINED';
        throw error;
      }
      assert.equal(response.decision?.kind,'select-action',
        'worker returned a non-action decision for an owner root');
      assertTrustedActionSelection(frontier,response.decision.token);
      return actionFrontier.dispatchSelectedNativeAction({
        store:request.store,frontier,token:response.decision.token,
        state:request.state,actorSeat,native,dispatch:false
      });
    }catch(error){
      recordFailure(roleAudit,error);
      throw error;
    }
  };
}

async function runV3FixtureGame({
  env=process.env,outputDir=null,
  candidateSeat=V3_FIXTURE.candidateSeat,opponentSeat=1-candidateSeat
}={}) {
  candidateOpponentRoleSeats({candidateSeat,opponentSeat});
  const trialId=V3_FIXTURE.trialId+'-candidate-seat-'+candidateSeat;
  const runOutputDir=outputDir??path.join(ROOT,V3_FIXTURE.outputDir,'candidate-seat-'+candidateSeat);
  const repositoryRoot = ROOT;
  const enginePin = env.AGENT36_TWINLEAF_COMMIT_SHA;
  const runnerRevision = env.GITHUB_SHA;
  assert.equal(enginePin, V3_FIXTURE.engineCommit, 'fixture must use the reviewed pinned Twinleaf commit');
  assert.match(runnerRevision || '', /^[0-9a-f]{40}$/i, 'fixture requires the exact research revision');
  const candidatePolicy=loadWorkerPolicyModule(repositoryRoot,V3_FIXTURE.candidateWorkerPolicyPath,'candidate');
  const opponentPolicy=loadWorkerPolicyModule(repositoryRoot,V3_FIXTURE.opponentWorkerPolicyPath,'opponent');

  const candidateBytes = fs.readFileSync(path.join(repositoryRoot, V3_FIXTURE.candidatePath));
  const fieldBytes = fs.readFileSync(path.join(repositoryRoot, V3_FIXTURE.fieldPath));
  const officialRank1Bytes = fs.readFileSync(path.join(repositoryRoot, V3_FIXTURE.officialRank1Path));
  const admissionBytes = fs.readFileSync(path.join(repositoryRoot, V3_FIXTURE.originalAdmissionPath));
  const candidateDeck = JSON.parse(candidateBytes.toString('utf8'));
  const field = JSON.parse(fieldBytes.toString('utf8'));
  const opponentDeck = field.decks.find((deck) => deck.rank === 1);
  const admission = JSON.parse(admissionBytes.toString('utf8'));
  const rank1Admission = admission.rows.find((row) => row.rank === 1);
  assert.ok(opponentDeck && rank1Admission, 'authenticated rank-1 source deck and admission row must exist');
  assert.equal(admission.sourceGitBlobSha, V3_FIXTURE.fieldGitBlobSha, 'original admission ledger must bind the frozen full-field source blob');
  assert.equal(rank1Admission.rosterGitBlobSha, V3_FIXTURE.fieldGitBlobSha, 'rank-1 admission row must bind the frozen full-field source blob');
  assert.equal(rank1Admission.competitivelyQualified, false, 'rank-1 source must remain explicitly unqualified');
  assert.equal(gitBlobSha(candidateBytes), V3_FIXTURE.candidateGitBlobSha, 'candidate source blob changed');
  assert.equal(gitBlobSha(fieldBytes), V3_FIXTURE.fieldGitBlobSha, 'Aichi field source blob changed');
  assert.equal(printed60Fingerprint(candidateDeck), V3_FIXTURE.candidateDeckSha256, 'candidate printed-60 fingerprint changed');
  assert.equal(printed60Fingerprint(opponentDeck), rank1Admission.printed60Sha256, 'rank-1 printed-60 fingerprint disagrees with the admission ledger');
  assert.equal(rank1Admission.printed60Sha256, V3_FIXTURE.opponentDeckSha256, 'rank-1 printed-60 fingerprint changed');

  const native = loadNativeRoleDependencies({ enginePin });
  const allCards = native.CardManager.getInstance().getAllCards();
  const candidateResolved = resolvePrintedDeck(candidateDeck, allCards, { label: 'Hood Shadow Rider candidate' });
  const opponentResolved = resolvePrintedDeck(opponentDeck, allCards, { label: 'Aichi rank-1 Shadow Rider opponent' });
  const seatAssignment=resolveFixtureSeatAssignment({
    candidateSeat,opponentSeat,candidateDeck:candidateResolved.fullNames,
    opponentDeck:opponentResolved.fullNames
  });
  const botOptionsAuditBySeat = native.botOptionsBySeat.map((options, seat) => ({
    seat,
    profile: fixtureBotOptionsProfile(options),
    distinctObject: true,
  }));
  assert.notEqual(native.botOptionsBySeat[0], native.botOptionsBySeat[1], 'physical seats must not share a mutable bot-options object');
  assert.notEqual(native.botOptionsBySeat[0].arbiter, native.botOptionsBySeat[1].arbiter, 'physical seats must not share an arbiter object');
  assert.deepEqual(botOptionsAuditBySeat[0].profile, botOptionsAuditBySeat[1].profile, 'fixture baseline bot options must be role-neutral and seat-invariant');

  const hookModule = require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
  const hookBytes = fs.readFileSync(path.join(repositoryRoot, V3_FIXTURE.hookPath));
  const hookModuleSha256 = createHash('sha256').update(hookBytes).digest('hex');
  const patchDescriptor = {
    patchId: V3_FIXTURE.hookId,
    modulePath: V3_FIXTURE.hookPath,
    moduleSha256: hookModuleSha256,
    target: V3_FIXTURE.hookTarget,
  };
  const constraints = buildFixturePolicyConstraints({
    patchDescriptor,
    botOptionsProfile: botOptionsAuditBySeat[0].profile,
    workerPolicyVersions:{
      candidate:candidatePolicy.POLICY_VERSION,
      opponent:opponentPolicy.POLICY_VERSION
    },
  });
  const policyConstraintsSha256 = evidenceBundleSha256(constraints);
  const candidateManifestResult = buildFixtureRoleEntryManifest({
    repositoryRoot,enginePin,runnerRevision,
    entrypoint:V3_FIXTURE.workerPath,
    commonRuntimeBindings:V3_FIXTURE_WORKER_COMMON_BINDINGS,
    orderedPromptChain:V3_FIXTURE_WORKER_PROMPT_CHAIN,
    additionalDataAssetPaths:[V3_FIXTURE.candidateWorkerPolicyPath],
  });
  const opponentManifestResult = buildFixtureRoleEntryManifest({
    repositoryRoot,enginePin,runnerRevision,
    entrypoint:V3_FIXTURE.workerPath,
    commonRuntimeBindings:V3_FIXTURE_WORKER_COMMON_BINDINGS,
    orderedPromptChain:V3_FIXTURE_WORKER_PROMPT_CHAIN,
    additionalDataAssetPaths:[V3_FIXTURE.opponentWorkerPolicyPath],
  });
  const manifestResult=roleIdentity.combineRolePolicyEntryManifests(
    candidateManifestResult,opponentManifestResult
  );
  const challengeSuiteSha256 = fixtureChallengeSuiteSha256(candidateManifestResult.manifest);
  const combined = manifestResult;

  // Preload only the manifest-owned research closure. The fixture pin helper scopes the
  // cache for the native callback, while the V1 evidence builder remains unchanged.
  for (const [relative, expectedSha256] of Object.entries(combined.expectedByPath).sort((a, b) => a[0].localeCompare(b[0]))) {
    const filename = path.resolve(repositoryRoot, relative);
    const bytes = fs.readFileSync(filename);
    const actualSha256 = createHash('sha256').update(bytes).digest('hex');
    assert.equal(actualSha256, expectedSha256, 'role source changed before preload: ' + relative);
    Module._load(filename, module, false);
  }
  const cacheEntries = fixtureRuntimePin.fixtureRolePolicyCacheEntries(repositoryRoot, combined.expectedByPath);
  const preparedRuntime = prepareV3RoleRuntimeEvidence({
    repositoryRoot,
    candidateManifest: candidateManifestResult,
    opponentManifest: opponentManifestResult,
    cardPoolInitialization: native.cardPoolInitialization,
    identityHelper: roleIdentity,
    cacheEntries,
  });
  const runtimePinEvidence = fixtureRuntimePin.createFixtureRuntimePinEvidence(preparedRuntime);
  const identities = buildFixtureRoleIdentities({
    manifestResult,
    candidateManifestResult,
    opponentManifestResult,
    candidatePolicyVersion:candidatePolicy.POLICY_VERSION,
    opponentPolicyVersion:opponentPolicy.POLICY_VERSION,
    candidateProducerId:'agent46-candidate-worker-policy',
    opponentProducerId:'agent6-rank1-shadow-rider-opponent-worker',
    candidatePolicyOptions:{},
    opponentPolicyOptions:{},
    challengeSuiteSha256,
    policyConstraintsSha256,
    preparedRuntime,
  });
  const policyPlan = buildFixturePolicyPlan({
    candidateIdentity: identities.candidateIdentity,
    opponentIdentity: identities.opponentIdentity,
    constraints,
    runtimePinEvidence,
    trialId,
  });
  // The serializer is a hashed data asset, not part of either role-policy closure.
  // Capture its function reference before the fixture pin and pass only that callback
  // to the native helper; the pin may evict the module from require.cache.
  const diagnostic = require('../../twinleaf/2026-11/agent43-full-state-diagnostic.cjs');

  const preGameTrial = {
    trialId: trialId,
    fixtureOnly: true,
    candidateFormat: 'Expanded',
    gameRuleset: 'Expanded',
    opponentSourceEventFormat: 'Japanese Extra',
    expandedLegalityAsOf: null,
    eventDate: null,
    formatReviewStatus: 'unverified-fixture-only',
    candidateSeat: candidateSeat,
    originalSourceSeat: opponentSeat,
    vendorCommitSha: enginePin,
    researchRevisionSha: runnerRevision,
  };

  const processLockToken=acquireNativeFixtureProcessLock('agent36-v3-fixture-runner');
  let restoreHook=null;
  let pinned;
  try {
    restoreHook=hookModule.installUnderworldDoorPsychicRecipientHook();
    assert.equal(restoreHook.isInstalled,true,
      'Underworld compatibility hook must install before role wrappers');
    pinned = await runPinnedV3RoleRuntime({
      repositoryRoot,
      preparedRuntime,
      pin: fixtureRuntimePin.withFixtureScopedRolePin,
      run: async () => {
        const workerAudit=createV3WorkerExecutionAudit({
          candidateSeat:candidateSeat,
          opponentSeat:opponentSeat,
          candidatePolicyVersion:candidatePolicy.POLICY_VERSION,
          opponentPolicyVersion:opponentPolicy.POLICY_VERSION,
        });
        const bundles=[];
        const sessions=[];
        const lifecycleFailure=(role,error)=>{
          const row=workerAudit.roles[role];
          const code=typeof error?.code==='string'&&/^[A-Z0-9_]{1,64}$/.test(error.code)?
            error.code:'WORKER_START_FAILURE';
          row.failureCount++;
          row.lastFailureCode=code;
          if(code.includes('TIMEOUT'))row.timeoutCount++;
          workerAudit.totalFailures++;
        };
        try {
          const candidateBundle=buildRoleWorkerBundle({
            repositoryRoot,policyModulePath:V3_FIXTURE.candidateWorkerPolicyPath
          });
          bundles.push({role:'candidate',bundle:candidateBundle.bundle});
          const opponentBundle=buildRoleWorkerBundle({
            repositoryRoot,policyModulePath:V3_FIXTURE.opponentWorkerPolicyPath
          });
          bundles.push({role:'opponent',bundle:opponentBundle.bundle});
          workerAudit.roles.candidate.bundleSha256=candidateBundle.bundle.bundleSha256;
          workerAudit.roles.candidate.policySha256=candidateBundle.policySha256;
          workerAudit.roles.opponent.bundleSha256=opponentBundle.bundle.bundleSha256;
          workerAudit.roles.opponent.policySha256=opponentBundle.policySha256;
          let candidateSession;
          try {
            candidateSession=await createDockerPolicySession({
              bundle:candidateBundle.bundle,role:'candidate',
              seat:candidateSeat,
              policyVersion:candidatePolicy.POLICY_VERSION,
            });
            sessions.push(candidateSession);
            workerAudit.roles.candidate.policyStreamProtocol=candidateSession.ready?.policyStreamProtocol??null;
            workerAudit.roles.candidate.policyDrawCount=candidateSession.ready?.policyDrawCount??null;
          } catch(error) {
            lifecycleFailure('candidate',error);
            throw error;
          }
          let opponentSession;
          try {
            opponentSession=await createDockerPolicySession({
              bundle:opponentBundle.bundle,role:'opponent',
              seat:opponentSeat,
              policyVersion:opponentPolicy.POLICY_VERSION,
            });
            sessions.push(opponentSession);
            workerAudit.roles.opponent.policyStreamProtocol=opponentSession.ready?.policyStreamProtocol??null;
            workerAudit.roles.opponent.policyDrawCount=opponentSession.ready?.policyDrawCount??null;
          } catch(error) {
            lifecycleFailure('opponent',error);
            throw error;
          }
          const sessionsBySeat={
            [candidateSeat]:candidateSession,
            [opponentSeat]:opponentSession,
          };
          const provenanceContext={current:null};
          const gameResult=await runNativeFixtureGameAsync({
            deckA:seatAssignment.deckA,
            deckB:seatAssignment.deckB,
            playerNames:seatAssignment.playerNames,
            candidateSeat:candidateSeat,
            originalSourceSeat:opponentSeat,
            seed:V3_FIXTURE.seed,
            native,
            botOptionsBySeat:native.botOptionsBySeat,
            maxActions:V3_FIXTURE.maxActions,
            diagnosticSnapshot:diagnostic.snapshotFullGameState,
            requireFullStateDiagnostics:true,
            processLockToken,
            onStoreCreated(store){
              const hook=installPromptProvenanceHook(store);
              provenanceContext.current=hook;
              return hook;
            },
          },createV3WorkerDecisionResolver({
            sessionsBySeat,
            candidateSeat:candidateSeat,
            opponentSeat:opponentSeat,
            native,
            workerAudit,
            provenanceContext,
          }));
          workerAudit.promptProvenanceHook=gameResult.promptProvenanceHook??null;
          assert.equal(gameResult.promptProvenanceHook?.installed,true,
            'typed prompt provenance hook must be installed before first store dispatch');
          assert.equal(gameResult.promptProvenanceHook?.restored,true,
            'typed prompt provenance hook must restore after the native game');
          assert.equal(gameResult.promptProvenanceHook?.activeEffectDepth,0,
            'typed prompt provenance stack must be empty after the native game');
          workerAudit.completed=gameResult.finished===true&&
            gameResult.endReason==='engine-game-end';
          workerAudit.actionCount=gameResult.actions??gameResult.acceptedActions??0;
          return {result:gameResult,workerAudit};
        } catch(error) {
          const code=typeof error?.code==='string'&&/^[A-Z0-9_]{1,64}$/.test(error.code)?
            error.code:'WORKER_FIXTURE_FAILURE';
          return {
            fixtureFailure:{
              name:error?.name??'Error',
              code,
              messageSha256:createHash('sha256').update(String(error?.message??error)).digest('hex'),
              nativeFixtureFailure:error?.nativeFixtureFailure??null,
            },
            fixtureGamePartial:error?.fixtureGamePartial??null,
            workerAudit,
          };
        } finally {
          let cleanupVerified=sessions.length===2&&bundles.length===2;
          for(const session of sessions.reverse()){
            const role=session.role;
            const roleAudit=workerAudit.roles[role];
            try{
              const receipt=await session.close();
              assert.equal(receipt?.closed,true,'worker session did not close orderly');
              assert.equal(receipt?.processClosed,true,'worker process closure was not verified');
              assert.equal(receipt?.containerRemoved,true,'Docker daemon container removal was not verified');
              roleAudit.workerProcessClosed=true;
              roleAudit.containerRemoved=true;
              roleAudit.containerIdSha256=receipt.containerId?
                createHash('sha256').update(receipt.containerId).digest('hex'):null;
              workerAudit.cleanupReceipts.push({role,processClosed:true,containerRemoved:true});
            }catch(error){
              cleanupVerified=false;
              workerAudit.cleanupFailureCount++;
              workerAudit.totalFailures++;
              if(roleAudit){
                roleAudit.failureCount++;
                roleAudit.lastFailureCode='WORKER_CLEANUP_UNVERIFIED';
              }
              workerAudit.cleanupReceipts.push({role,processClosed:false,containerRemoved:false});
            }
          }
          for(const entry of bundles.reverse()){
            const roleAudit=workerAudit.roles[entry.role];
            try{
              const removed=workerLauncher.cleanupPolicyBundle(entry.bundle);
              assert.equal(removed,true,'policy bundle cleanup did not return a verified removal receipt');
              assert.equal(fs.existsSync(entry.bundle.root),false,'policy bundle directory still exists');
              if(roleAudit)roleAudit.policyBundleRemoved=true;
            }catch(error){
              cleanupVerified=false;
              workerAudit.cleanupFailureCount++;
              workerAudit.totalFailures++;
              if(roleAudit){
                roleAudit.failureCount++;
                roleAudit.lastFailureCode='POLICY_BUNDLE_CLEANUP_UNVERIFIED';
              }
            }
          }
          workerAudit.cleanupVerified=cleanupVerified&&workerAudit.cleanupFailureCount===0;
          workerAudit.completed=workerAudit.completed===true&&workerAudit.cleanupVerified===true;
        }
      },
    });
  } finally {
    try {
      if(restoreHook) restoreHook();
    } finally {
      releaseNativeFixtureProcessLock(processLockToken);
    }
  }
  assert.ok(restoreHook?.isRestored, 'Underworld compatibility hook must restore in outer finally');
  assert.ok(pinned && pinned.audit && pinned.audit.guardRestored === true, 'fixture-scoped runtime guard must restore');
  const normalizedResult = normalizeV3FixtureRoleResult(pinned.result);
  const { roleResult, gameResult, workerExecutionAudit } = normalizedResult;
  let failureEnvelope = normalizedResult.failureEnvelope;
  if(!failureEnvelope&&workerExecutionAudit?.cleanupVerified!==true) {
    failureEnvelope={
      fixtureFailure:{name:'WorkerCleanupUnverified',code:'WORKER_CLEANUP_UNVERIFIED',
        stage:'worker-cleanup',messageSha256:createHash('sha256').update(JSON.stringify({
          cleanupFailureCount:workerExecutionAudit?.cleanupFailureCount??null,
          cleanupReceipts:workerExecutionAudit?.cleanupReceipts??null
        })).digest('hex'),nativeFixtureFailure:null},
      fixtureGamePartial:gameResult
    };
  }
  if (!failureEnvelope && (!gameResult || gameResult.finished !== true || gameResult.endReason !== 'engine-game-end')) {
    const terminalState = {
      finished: gameResult?.finished ?? false,
      endReason: gameResult?.endReason ?? 'no-result',
      actions: gameResult?.actions ?? gameResult?.acceptedActions ?? 0,
    };
    failureEnvelope = {
      fixtureFailure: {
        name: 'NonTerminalFixtureGame',
        code: 'NON_TERMINAL',
        stage: 'terminal-check',
        messageSha256: createHash('sha256').update(JSON.stringify(terminalState)).digest('hex'),
        nativeFixtureFailure: null,
      },
      fixtureGamePartial: gameResult,
    };
  }
  const partial = failureEnvelope?.fixtureGamePartial ?? null;
  const gameCompleted = !failureEnvelope && gameResult?.finished === true && gameResult?.endReason === 'engine-game-end';

  const patchReceipt = createUnderworldRuntimePatchReceipt({ restoreHook, moduleSha256: hookModuleSha256 });
  const trial = {
    trialId: trialId,
    fixtureOnly: true,
    candidateFormat: 'Expanded',
    gameRuleset: 'Expanded',
    opponentSourceEventFormat: 'Japanese Extra',
    expandedLegalityAsOf: null,
    eventDate: null,
    formatReviewStatus: 'unverified-fixture-only',
    opponentRank: 1,
    candidateSeat: candidateSeat,
    originalSourceSeat: opponentSeat,
    actualFirstPlayerSeat: gameResult?.actualFirstPlayerSeat ?? null,
    candidatePrinted60Ref: V3_FIXTURE.candidatePath,
    originalPrinted60Ref: V3_FIXTURE.fieldPath + '#rank=1',
    candidatePrinted60Sha256: V3_FIXTURE.candidateDeckSha256,
    originalPrinted60Sha256: V3_FIXTURE.opponentDeckSha256,
    vendorCommitSha: enginePin,
    researchRevisionSha: runnerRevision,
    decisionTraceSha256: gameResult?.decisionTraceSha256 ?? partial?.decisionTraceSha256 ?? null,
    cardPoolInitializationReceipt: native.cardPoolInitialization,
    runtimePatchReceipts: [patchReceipt],
    seed: V3_FIXTURE.seed,
    seed32: gameResult?.seed32 ?? partial?.seed32 ?? null,
    actorOnlyExecutionBoundary: null,
    workerExecutionAuditSha256:workerExecutionAudit?evidenceBundleSha256(workerExecutionAudit):null,
    candidatePolicyVersion:candidatePolicy.POLICY_VERSION,
    opponentPolicyVersion:opponentPolicy.POLICY_VERSION,
  };
  for (const key of ['candidateFormat', 'gameRuleset', 'opponentSourceEventFormat',
    'expandedLegalityAsOf', 'eventDate', 'formatReviewStatus']) {
    assert.equal(trial[key], policyPlan.policyPlanCore[key],
      'trial ' + key + ' differs from the frozen policy-plan core');
    assert.equal(trial[key], policyPlan.policyRegistration[key],
      'trial ' + key + ' differs from the frozen policy registration');
    assert.equal(trial[key], policyPlan.preDeal[key],
      'trial ' + key + ' differs from the pre-deal fixture envelope');
  }
  if (gameResult?.seed !== undefined) assert.equal(gameResult.seed, V3_FIXTURE.seed, 'native game must preserve the frozen seed label');
  if (gameResult?.seedDerivation !== undefined) assert.equal(gameResult.seedDerivation, 'sha256-first-u32le', 'native game must use the declared stable string-seed mapping');
  assert.equal(trial.seed, policyPlan.policyPlanCore.constraints.randomizationProtocol.seed, 'trial seed must match the registered policy-plan seed');
  if (gameResult?.seed32 !== undefined) assert.equal(trial.seed32, gameResult.seed32, 'trial must record the actual uint32 stream seed');
  const applicationBase = gameCompleted && workerExecutionAudit?.totalWorkerDecisions>0 ? roleIdentity.createPolicyApplicationReceipt({
    preDeal: policyPlan.preDeal,
    candidateIdentity: identities.candidateIdentity,
    opponentIdentity: identities.opponentIdentity,
    trial,
    timeoutStatus: 'within-budget',
  }) : null;
  const application = bindFixtureFormatToApplicationReceipt(applicationBase,trial);
  const artifact = {
    fixtureOnly: true,
    competitiveGameQualified: false,
    admissionEligible: false,
    benchmark: 'Aichi Open League 2026 Top 32',
    benchmarkFormat: 'Japanese Extra',
    engineFormat: 'Expanded',
    candidateFormat: trial.candidateFormat,
    gameRuleset: trial.gameRuleset,
    opponentSourceEventFormat: trial.opponentSourceEventFormat,
    expandedLegalityAsOf: trial.expandedLegalityAsOf,
    eventDate: trial.eventDate,
    formatReviewStatus: trial.formatReviewStatus,
    candidate: {
      label: candidateDeck.label,
      sourcePath: V3_FIXTURE.candidatePath,
      sourceGitBlobSha: gitBlobSha(candidateBytes),
      printed60Sha256: V3_FIXTURE.candidateDeckSha256,
      resolvedCards: candidateResolved.resolvedRows,
      engineDeck: candidateResolved.fullNames,
    },
    opponent: {
      rank: 1,
      sourceStatus: 'authenticated',
      formatStatus: 'unverified',
      formatStatusEvidenceRef: null,
      player: opponentDeck.player,
      archetype: opponentDeck.archetype,
      sourcePath: V3_FIXTURE.fieldPath,
      officialSourcePath: V3_FIXTURE.officialRank1Path,
      sourceGitBlobSha: gitBlobSha(fieldBytes),
      officialSourceGitBlobSha: gitBlobSha(officialRank1Bytes),
      printed60Sha256: V3_FIXTURE.opponentDeckSha256,
      resolvedCards: opponentResolved.resolvedRows,
      engineDeck: opponentResolved.fullNames,
    },
    sourceAdmission: {
      originalAdmissionPath: V3_FIXTURE.originalAdmissionPath,
      originalAdmissionGitBlobSha: gitBlobSha(admissionBytes),
      rank1AdmissionRow: rank1Admission,
      legalChainQualified: false,
      note: 'The source ledger explicitly leaves original printed-60 legality and policy chains unqualified.',
    },
    engine: {
      twinleafCommitSha: enginePin,
      researchRevisionSha: runnerRevision,
      nodeVersion: process.version,
      format: 'EXPANDED',
      gameRuleset: trial.gameRuleset,
      rules: {
        firstTurnDrawCard: true,
        firstTurnUseSupporter: false,
        attackFirstTurn: false,
      },
      cardPoolInitializationReceipt: native.cardPoolInitialization,
    },
    policy: {
      candidateProfile: 'Agent46 frozen candidate policy in a persistent actor-only Docker worker; no in-process strategic fallback',
      opponentProfile: 'Agent6 rank-1 Shadow Rider opponent policy in a separate persistent actor-only Docker worker; no in-process strategic fallback',
      candidatePolicyOptions: {},
      opponentPolicyOptions: {},
      candidateHoodOptionsApplied: false,
      candidateRecoveryAutonomyApplied: false,
      deferredCompetitivePolicyWork: 'PR #38: candidate-specific Hood recovery and per-seat Hood options; not required for this baseline native fixture',
      fixtureRequiresPr38: false,
      policyCompetenceIndependentlyReviewed: false,
      identityScope: 'single seeded fixture trial; not a reusable field-wide policy identity',
      independentReviewers: [],
      botOptionsAuditBySeat,
      challengeSuiteSha256,
      challengeSuiteScope: 'mechanical source/runtime contract tests only; not policy competence evidence',
    },
    policyPlanCore: policyPlan.policyPlanCore,
    preDealFixtureEnvelope: {
      fixtureOnly: true,
      ready: true,
      policyPlanSha256: policyPlan.policyPlanSha256,
      policyRegistration: policyPlan.policyRegistration,
      policyAttestationBundle: policyPlan.policyAttestationBundle,
      attestationStatus: 'unsigned fixture-only envelope; no independent reviewers; not admission evidence',
    },
    candidatePolicyIdentity: identities.candidateIdentity,
    opponentPolicyIdentity: identities.opponentIdentity,
    roleApplicationReceipt: application?.receipt ?? null,
    roleSeatMap: application?.roleSeatMap ?? null,
    policySha256BySeat: application?.policySha256BySeat ?? null,
    workerExecutionAudit,
    workerExecutionAuditSha256:trial.workerExecutionAuditSha256,
    actorOnlyExecutionBoundary: trial.actorOnlyExecutionBoundary,
    runtimePinEvidence,
    runtimePinAudit: pinned.audit,
    runtimePatchReceipts: [patchReceipt],
    nativeGame: gameResult,
    fixtureGamePartial: partial,
    fixtureFailure: failureEnvelope?.fixtureFailure ?? null,
    trial,
    summary: {
      winner: gameResult?.winner ?? null,
      winnerSeat: gameResult?.winnerSeat ?? null,
      endReason: gameResult?.endReason ?? (failureEnvelope ? 'fixture-execution-failed' : null),
      actionCount: gameResult?.actions ?? gameResult?.acceptedActions ?? 0,
      attemptedActionCount: gameResult?.attemptedActions ?? partial?.attemptedActions ?? gameResult?.decisionTrace?.length ?? 0,
      acceptedActionCount: gameResult?.acceptedActions ?? gameResult?.actions ?? partial?.acceptedActions ?? 0,
      turns: gameResult?.turns ?? null,
      actionCountsBySeat: gameResult?.actionCountsBySeat ?? null,
      decisionTraceSha256: gameResult?.decisionTraceSha256 ?? partial?.decisionTraceSha256 ?? null,
      rootActionLedgerSha256: gameResult?.rootActionLedgerSha256 ?? partial?.rootActionLedgerSha256 ?? null,
      roleApplicationReceiptSha256: application?.receipt?.receiptSha256 ?? null,
      actorOnlyExecutionBoundarySha256: application?.receipt?.actorOnlyExecutionBoundarySha256 ?? null,
      actorOnlyExecutionBoundaryValid: trial.actorOnlyExecutionBoundary?.valid === true,
      workerDecisionCount:workerExecutionAudit?.totalWorkerDecisions??0,
      workerHostOnlyPromptCount:workerExecutionAudit?.totalHostOnlyPrompts??0,
      workerAbstentionCount:workerExecutionAudit?.totalAbstentions??0,
      workerFailureCount:workerExecutionAudit?.totalFailures??0,
      candidateWorkerDecisionCount:workerExecutionAudit?.roles?.candidate?.decisionCount??0,
      opponentWorkerDecisionCount:workerExecutionAudit?.roles?.opponent?.decisionCount??0,
      workerCleanupFailureCount:workerExecutionAudit?.cleanupFailureCount??0,
      candidateFormat: trial.candidateFormat,
      gameRuleset: trial.gameRuleset,
      opponentSourceEventFormat: trial.opponentSourceEventFormat,
      expandedLegalityAsOf: trial.expandedLegalityAsOf,
      eventDate: trial.eventDate,
      formatReviewStatus: trial.formatReviewStatus,
      runtimePinUnionSha256: preparedRuntime.runtimePinUnionSha256,
      loadedProcessClosureSha256: preparedRuntime.loadedProcessClosureSha256,
      fixtureOnly: true,
      winRateEstimate: null,
    },
  };
  const traceText = [
    `candidateFormat=${trial.candidateFormat}`,
    `gameRuleset=${trial.gameRuleset}`,
    `opponentSourceEventFormat=${trial.opponentSourceEventFormat}`,
    `expandedLegalityAsOf=${trial.expandedLegalityAsOf ?? 'unverified'}`,
    `eventDate=${trial.eventDate ?? 'not-applicable'}`,
    `formatReviewStatus=${trial.formatReviewStatus}`,
    `actorOnlyExecutionBoundaryValid=${trial.actorOnlyExecutionBoundary?.valid === true}`,
    `workerExecutionAuditSha256=${trial.workerExecutionAuditSha256 ?? 'unavailable'}`,
    diagnostic.formatFixtureGameTraceText({
    fixtureOnly: true,
    admissionEligible: false,
    competitiveGameQualified: false,
    trialId: trial.trialId,
    vendorCommitSha: enginePin,
    researchRevisionSha: runnerRevision,
    seed: trial.seed,
    candidateSeat: trial.candidateSeat,
    opponentSeat: trial.originalSourceSeat,
    candidateDeckSha256: V3_FIXTURE.candidateDeckSha256,
    opponentDeckSha256: V3_FIXTURE.opponentDeckSha256,
    candidateIdentity: identities.candidateIdentity,
    opponentIdentity: identities.opponentIdentity,
    policyConstraintsSha256,
    cardPoolSha256: native.cardPoolInitialization?.cardPoolSha256 ?? null,
    cardPoolInitializationReceiptSha256: evidenceBundleSha256(native.cardPoolInitialization),
    fieldSha256: gitBlobSha(fieldBytes),
    actualFirstPlayerSeat: gameResult?.actualFirstPlayerSeat ?? null,
    finished: gameResult?.finished === true,
    endReason: gameResult?.endReason ?? (failureEnvelope ? 'fixture-execution-failed' : null),
    actions: gameResult?.actions ?? gameResult?.acceptedActions ?? 0,
    attemptedActions: gameResult?.attemptedActions ?? partial?.attemptedActions ?? null,
    acceptedActions: gameResult?.acceptedActions ?? gameResult?.actions ?? partial?.acceptedActions ?? null,
    actionCountsBySeat: gameResult?.actionCountsBySeat ?? partial?.actionCountsBySeat ?? null,
    turns: gameResult?.turns ?? null,
    winnerSeat: gameResult?.winnerSeat ?? null,
    decisionTrace: gameResult?.decisionTrace ?? [],
    rootActionLedger: gameResult?.rootActionLedger ?? [],
    decisionTraceSha256: gameResult?.decisionTraceSha256 ?? partial?.decisionTraceSha256 ?? null,
    rootActionLedgerSha256: gameResult?.rootActionLedgerSha256 ?? partial?.rootActionLedgerSha256 ?? null,
    finalPublicState: gameResult?.finalPublicState ?? partial?.finalPublicState ?? null,
    finalPublicStateSha256: gameResult?.finalPublicStateSha256 ?? partial?.finalPublicStateSha256 ?? null,
    finalFullState: gameResult?.finalFullState ?? partial?.finalFullState ?? null,
    finalFullStateSha256: gameResult?.finalFullStateSha256 ?? partial?.finalFullStateSha256 ?? null,
    finalDiagnosticFailure: gameResult?.finalDiagnosticFailure ?? partial?.finalDiagnosticFailure ?? null,
    fixtureGamePartial: partial,
    failure: failureEnvelope?.fixtureFailure ?? null,
    workerExecutionAudit,
  }),
  ].join('\n');
  fs.mkdirSync(runOutputDir,{recursive:true});
  const outputPath = path.join(runOutputDir, 'fixture-game.json');
  writeJsonAtomic(outputPath, artifact);
  const traceTextPath = path.join(runOutputDir, 'fixture-game.txt');
  fs.writeFileSync(traceTextPath, traceText, 'utf8');
  process.stdout.write((failureEnvelope ? 'Native V3 fixture game failed; partial artifacts preserved: ' : 'Native V3 fixture game completed: ') + outputPath + '\n');
  if (failureEnvelope) {
    const error = new Error('Native V3 fixture game failed after preserving its partial JSON and text artifacts.');
    error.name = failureEnvelope.fixtureFailure?.name ?? 'NativeFixtureFailure';
    error.fixtureFailure = failureEnvelope.fixtureFailure;
    throw error;
  }
  return {
    artifactPath: path.relative(repositoryRoot, outputPath).split(path.sep).join('/'),
    traceTextPath: path.relative(repositoryRoot, traceTextPath).split(path.sep).join('/'),
    trialId: trial.trialId,
    winner: gameResult.winner,
    winnerSeat: gameResult.winnerSeat,
    endReason: gameResult.endReason,
    actionCount: gameResult.actions,
    decisionTraceSha256: gameResult.decisionTraceSha256,
    roleApplicationReceiptSha256: application?.receipt?.receiptSha256??null,
    fixtureOnly: true,
    competitiveGameQualified: false,
  };
}


async function runV3FixtureGameBothSeats({env=process.env,outputDirRoot=path.join(ROOT,V3_FIXTURE.outputDir)}={}) {
  const results=[];
  for(const candidateSeat of [0,1]) {
    try {
      results.push(await runV3FixtureGame({
        env,candidateSeat,opponentSeat:1-candidateSeat,
        outputDir:path.join(outputDirRoot,'candidate-seat-'+candidateSeat)
      }));
    } catch(error) {
      results.push({
        candidateSeat,opponentSeat:1-candidateSeat,failed:true,
        code:error?.fixtureFailure?.code??error?.code??'FIXTURE_FAILED',
        messageSha256:createHash('sha256').update(String(error?.message??error)).digest('hex')
      });
    }
  }
  const failures=results.filter(result=>result.failed);
  if(failures.length) {
    const error=new Error('One or both V3 physical-seat assignments failed; both attempts were preserved.');
    error.code='V3_SEAT_PAIR_FAILED';
    error.failures=failures;
    throw error;
  }
  return {schema:'agent36-v3-seat-swap-pair-v1',fixtureOnly:true,results};
}

async function main(argv=process.argv.slice(2),env=process.env){
  const [command,...args]=argv;
  if(command==='fixture-game'){
    const result=await runV3FixtureGameBothSeats({env});
    process.stdout.write(JSON.stringify(result,null,2)+'\n');
    return result;
  }
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
    const [preDealRef,trialRef,persistenceReceiptRef,applicationReceiptRef,
      evidenceRef,reviewsRef,policyPanelReceiptsRef]=args;
    const preDeal=readJsonFile(repositoryRoot,preDealRef);
    const trial=readJsonFile(repositoryRoot,trialRef);
    const persistenceReceipt=readJsonFile(repositoryRoot,persistenceReceiptRef);
    const verifiedPersistenceReceipt=await revalidatePreDealPersistenceReceipt({
      preDeal,persistenceReceipt,repositoryRoot,common
    });
    const result=await collectDealGenerationReceipt({
      ...common,preDeal,trial,persistenceReceipt:verifiedPersistenceReceipt
    });
    const dir=path.join(repositoryRoot,'artifacts/agent36-v3');
    writeJsonAtomic(path.join(dir,'trial-with-server-generation-time.json'),result.trial);
    writeJsonAtomic(path.join(dir,'deal-generation-receipt.json'),result.receipt);
    let bundleResult=null;
    if(applicationReceiptRef || evidenceRef || reviewsRef || policyPanelReceiptsRef){
      assert.ok(applicationReceiptRef && evidenceRef,
        'application-receipt and evidence-map refs must be supplied together');
      bundleResult=buildV3BundleFromArtifacts({
        preDeal,trial:result.trial,preDealPersistenceReceipt:persistenceReceipt,
        dealGenerationReceipt:result.receipt,
        policyApplicationReceipt:readJsonFile(repositoryRoot,applicationReceiptRef),
        evidence:readJsonFile(repositoryRoot,evidenceRef),
        reviews:reviewsRef?readJsonFile(repositoryRoot,reviewsRef):[],
        policyPanelReceipts:policyPanelReceiptsRef?
          readJsonFile(repositoryRoot,policyPanelReceiptsRef):[]
      });
      writeJsonAtomic(path.join(dir,'complete-game-bundle.json'),bundleResult.bundle);
      writeJsonAtomic(path.join(dir,'complete-game-assessment.json'),bundleResult.assessment);
    }
    process.stdout.write(JSON.stringify({
      status:bundleResult?
        (bundleResult.competitiveAdmission?'COMPETITIVE_BUNDLE_ADMITTED':
          'BUNDLE_BUILT_NOT_COMPETITIVELY_ADMITTED'):
        'DEAL_GENERATION_METADATA_VERIFIED',
      trialId:result.trial.trialId,
      jobId:result.receipt.jobId,stepStartedAt:result.receipt.stepStartedAt,
      admissionEligible:bundleResult?.admissionEligible??false,
      competitiveAdmission:bundleResult?.competitiveAdmission??false,
      output:dir
    },null,2)+'\n');
    return {...result,bundleResult};
  }
  if(command==='build-bundle'){
    const [preDealRef,trialRef,persistenceReceiptRef,dealGenerationReceiptRef,
      applicationReceiptRef,evidenceRef,reviewsRef,policyPanelReceiptsRef]=args;
    for(const [name,value] of Object.entries({
      preDealRef,trialRef,persistenceReceiptRef,dealGenerationReceiptRef,
      applicationReceiptRef,evidenceRef
    })) assert.ok(value,name+' is required for V3 bundle assembly');
    const preDeal=readJsonFile(repositoryRoot,preDealRef);
    const trial=readJsonFile(repositoryRoot,trialRef);
    const persistenceReceipt=readJsonFile(repositoryRoot,persistenceReceiptRef);
    const dealGenerationReceipt=readJsonFile(repositoryRoot,dealGenerationReceiptRef);
    const verifiedPersistenceReceipt=await revalidatePreDealPersistenceReceipt({
      preDeal,persistenceReceipt,repositoryRoot,common
    });
    const verifiedGeneration=await revalidateDealGenerationReceipt({
      preDeal,trial,persistenceReceipt:verifiedPersistenceReceipt,
      dealGenerationReceipt,common
    });
    const result=buildV3BundleFromArtifacts({
      preDeal,trial:verifiedGeneration.trial,
      preDealPersistenceReceipt:verifiedPersistenceReceipt,
      dealGenerationReceipt:verifiedGeneration.receipt,
      policyApplicationReceipt:readJsonFile(repositoryRoot,applicationReceiptRef),
      evidence:readJsonFile(repositoryRoot,evidenceRef),
      reviews:reviewsRef?readJsonFile(repositoryRoot,reviewsRef):[],
      policyPanelReceipts:policyPanelReceiptsRef?
        readJsonFile(repositoryRoot,policyPanelReceiptsRef):[]
    });
    const dir=path.join(repositoryRoot,'artifacts/agent36-v3');
    writeJsonAtomic(path.join(dir,'complete-game-bundle.json'),result.bundle);
    writeJsonAtomic(path.join(dir,'complete-game-assessment.json'),result.assessment);
    process.stdout.write(JSON.stringify({
      status:result.competitiveAdmission?'COMPETITIVE_BUNDLE_ADMITTED':
        'BUNDLE_BUILT_NOT_COMPETITIVELY_ADMITTED',
      trialId:result.bundle.trialId,
      admissionEligible:result.admissionEligible,
      competitiveAdmission:result.competitiveAdmission,
      output:dir
    },null,2)+'\n');
    return result;
  }
  throw new Error('Usage: node agent36-v3-runner.cjs fixture-game | predeal <committed-predeal-ref> | postgame <predeal-ref> <trial-ref> <persistence-receipt-ref> [application-receipt-ref evidence-map-ref [reviews-ref] [policy-panel-receipts-ref]] | build-bundle <predeal-ref> <trial-ref> <persistence-receipt-ref> <deal-receipt-ref> <application-receipt-ref> <evidence-map-ref> [reviews-ref] [policy-panel-receipts-ref]');
}

if(require.main===module){
  main().catch(error=>{
    process.stderr.write(String(error?.stack||error)+'\n');
    process.exitCode=1;
  });
}

module.exports={GIT_SHA,RUN_ID,PREDEAL_FIELDS,V3_FIXTURE,V3_FIXTURE_TEST_PATHS,
  V3_FIXTURE_COMMON_BINDINGS,V3_FIXTURE_PROMPT_CHAIN,
  V3_FIXTURE_WORKER_COMMON_BINDINGS,V3_FIXTURE_WORKER_PROMPT_CHAIN,
  V3_FIXTURE_CANDIDATE_POLICY_OPTIONS,V3_FIXTURE_OPPONENT_POLICY_OPTIONS,validateRepositoryName,
  validateArtifactRef,gitBlobSha,preDealProjection,verifyPersistedPreDeal,
  resolveInsideRoot,apiUrl,parseNextLink,requestJson,validateRun,
  fetchWorkflowRun,fetchWorkflowJobs,fetchCommittedArtifact,
  collectPreDealPersistenceReceipt,collectDealGenerationReceipt,
  initializeNativeCardPool,loadNativeRoleDependencies,runCandidateOpponentPolicyRoles,
  prepareV3RoleRuntimeEvidence,runPinnedV3RoleRuntime,
  combineAndPinV3RoleRuntime,createV3PolicyApplicationReceipt,
  readJsonFile,bindFixtureFormatToApplicationReceipt,buildV3BundleFromArtifacts,
  revalidatePreDealPersistenceReceipt,
  revalidateDealGenerationReceipt,writeJsonAtomic,main,
  printed60Fingerprint,
  resolvePrintedDeck,resolveFixtureSeatAssignment,candidateOpponentRoleSeats,assertTrustedActionSelection,
  buildFixtureRoleEntryManifest,
  fixtureChallengeSuiteSha256,
  loadWorkerPolicyModule,buildRoleWorkerBundle,
  createV3WorkerExecutionAudit,createV3WorkerDecisionResolver,
  buildFixturePolicyConstraints,
  buildFixtureRoleIdentities,
  buildFixturePolicyPlan,
  createUnderworldRuntimePatchReceipt,
  normalizeV3FixtureRoleResult,
  runV3FixtureGame,runV3FixtureGameBothSeats
};
