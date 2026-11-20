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
const roleIdentity=require('./agent42-role-policy-identity.cjs');
const {withPinnedResearchModuleLoads}=require('../agent36-runtime-module-pin.cjs');
const {auditSourceClosure}=require('../agent36-source-closure-audit.cjs');
const {runNativeFixtureGame,runNativeFixtureGameAsync,publicStateSnapshot,acquireNativeFixtureProcessLock,releaseNativeFixtureProcessLock}=require('./agent49-native-fixture-game.cjs');
const nativeActionFrontier=require('./agent36-native-action-frontier.cjs');
const knownCapFreeActionEnumerator=require('./agent3-known-cap-free-action-enumerator.cjs');
const nativePromptProjection=require('./agent36-prompt-projection.cjs');
const {installPromptProvenanceHook}=require('./agent36-prompt-provenance.cjs');
const workerProtocol=require('./agent49-policy-protocol.cjs');
const workerLauncher=require('./agent36-docker-policy-worker.cjs');
const {createDockerPolicySession}=require('./agent36-async-docker-policy-session.cjs');
const {publicEventReceipt}=require('../../twinleaf/agent8-public-event-receipt.cjs');
const fixtureRuntimePin=require('./agent49-fixture-scoped-runtime-pin.cjs');
const sanitizedDiagnostic=require('./agent2-v3-sanitized-diagnostic.cjs');
const {buildSetupPromptAudit,projectV3WorkerExecutionBoundaryToTrial}=require('./agent19-setup-prompt-audit.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const GIT_SHA=/^[0-9a-f]{40}$/;
const SHA256=/^[0-9a-f]{64}$/;
const RUN_ID=/^[1-9]\d*$/;
/** Host-only environment transport must never be allowlisted into role workers. */
function policyEnvironmentAllowlist(keys) {
  return [...new Set((keys || []).filter(key =>
    typeof key === 'string' && !key.startsWith('GITHUB_') &&
    !key.startsWith('RUNNER_') &&
    key !== 'AGENT36_POLICY_ENV_SNAPSHOT_JSON'
  ))].sort();
}

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
  const {State,GamePhase}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/state/state');
  const {Player}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/state/player');
  const {PokemonCardList}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/state/pokemon-card-list');
  const {CardList}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/state/card-list');
  const cardActions=require('../../../vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action');
  const gameActions=require('../../../vendor/twinleaf/ptcg-server/output/game/store/actions/game-actions');
  const {ActionEnumerator}=require('../../../vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator');
  const {Simulator}=require('../../../vendor/twinleaf/ptcg-server/output/game/bots/simulator');
  const promptActions=require('../../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
  const {CardManager}=require('../../../vendor/twinleaf/ptcg-server/output/game/cards/card-manager');
  const {deepClone}=require('../../../vendor/twinleaf/ptcg-server/output/utils/utils');
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
  const {GameError}=require('../../../vendor/twinleaf/ptcg-server/output/game/game-error');
  const {Stage,EnergyType,CardType,TrainerType,SpecialCondition,Format,SuperType}=
    require('../../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types');
  const {CheckPokemonTypeEffect}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/effects/check-effects');
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
  return {SimpleTacticsAi,Store,State,Player,PokemonCardList,CardList,GamePhase,cardActions,gameActions,
    ActionEnumerator,Simulator,PlayerType:cardActions.PlayerType,SlotType:cardActions.SlotType,
    PokemonCard,EnergyCard,TrainerCard,GameError,Stage,TrainerType,SpecialCondition,
    EnergyType,CardType,SuperType,CheckPokemonTypeEffect,
    getCatalog,getNativeTrainerCatalog,observe:actorObservation,promptActions,
    GameSettings,Format,AddPlayerAction,
    ResolvePromptAction:promptActions.ResolvePromptAction,
    ShuffleDeckPrompt,CoinFlipPrompt,WaitPrompt,botOptionsBySeat,CardManager,sets,
    deepClone,cardPoolInitialization};
}

/**
 * Normalize the result returned through the V3 role composer and runtime pin.
 * A native-game exception is caught inside the composed callback, so its
 * {fixtureFailure, fixtureGamePartial} envelope is nested under roleResult.result.
 * A wrapper/runtime failure may instead return the envelope directly.
 */
// Legacy composer-only projection. The current V3 worker path does not invoke
// the SimpleTacticsAi role composer, so this intentionally returns null there.
// V3 acceptance uses projectV3WorkerExecutionBoundaryToTrial instead.
function projectActorOnlyBoundaryToTrial(roleResult){
  return roleResult?.actorOnlyBoundary ?? null;
}

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

function projectNativeFixtureFailureForReceipt(failure,{includePrimary=true}={}) {
  if(!failure||typeof failure!=='object')return null;
  const summary={};
  for(const key of ['stage','code','actionOrdinal','actingSeat','phaseBefore',
    'turnBefore','pendingPromptType','actionName',
    'name','messageLength','stackSite']){
    const value=failure[key];
    if(value===undefined||value===null)continue;
    if(key==='stage'&&typeof value==='string'&&/^[a-z0-9-]{1,64}$/.test(value))summary[key]=value;
    else if(key==='code'&&typeof value==='string'&&/^[A-Z0-9_]{1,64}$/.test(value))summary[key]=value;
    else if(['actionOrdinal','turnBefore','messageLength'].includes(key)&&
      Number.isSafeInteger(value)&&value>=0)summary[key]=value;
    else if(key==='actingSeat'&&(value===0||value===1))summary[key]=value;
    else if(['phaseBefore','pendingPromptType','actionName'].includes(key)&&
      typeof value==='string'&&/^[A-Za-z0-9_.:-]{1,128}$/.test(value))summary[key]=value;
    else if(key==='name'&&typeof value==='string'&&/^[A-Za-z0-9_.-]{1,64}$/.test(value))summary[key]=value;
    else if(key==='stackSite'&&value&&typeof value==='object'&&
      typeof value.file==='string'&&
      /^(?:simulation|vendor\/twinleaf)\/[A-Za-z0-9_.\/-]{1,240}$/.test(value.file)&&
      !value.file.split('/').includes('..')&&
      Number.isSafeInteger(value.line)&&value.line>0&&
      Number.isSafeInteger(value.column)&&value.column>0)
      summary.stackSite={file:value.file,line:value.line,column:value.column};
  }
  if(includePrimary&&failure.primaryFailure){
    const primary=projectNativeFixtureFailureForReceipt(failure.primaryFailure,{includePrimary:false});
    if(primary)summary.primaryFailure=primary;
  }
  return Object.keys(summary).length?summary:null;
}

function projectV3FixtureFailureForReceipt(source,{
  stage='native-no-game-witness',fallbackCode='WORKER_FIXTURE_FAILURE',includeNested=true
}={}) {
  const failure=source?.fixtureFailure&&typeof source.fixtureFailure==='object'?
    source.fixtureFailure:source;
  const nativeFailure=projectNativeFixtureFailureForReceipt(
    failure?.nativeFixtureFailure??source?.nativeFixtureFailure
  );
  const result={
    name:typeof failure?.name==='string'&&/^[A-Za-z0-9_.-]{1,64}$/.test(failure.name)?
      failure.name:'Error',
    code:typeof (failure?.code??source?.code)==='string'&&
      /^[A-Z0-9_]{1,64}$/.test(failure?.code??source?.code)?
        (failure?.code??source?.code):fallbackCode,
    stage:typeof (failure?.stage??nativeFailure?.stage??stage)==='string'&&
      /^[a-z0-9-]{1,64}$/.test(failure?.stage??nativeFailure?.stage??stage)?
        (failure?.stage??nativeFailure?.stage??stage):stage
  };
  const messageLength=failure?.messageLength??nativeFailure?.messageLength;
  if(Number.isSafeInteger(messageLength)&&messageLength>=0)result.messageLength=messageLength;
  for(const key of ['expectedActorSeat','actualActorSeat']){
    const seat=failure?.[key]??source?.[key];
    if(seat===0||seat===1)result[key]=seat;
  }
  if(nativeFailure)result.nativeFixtureFailure=nativeFailure;
  if(includeNested&&failure?.primaryFailure){
    result.primaryFailure=projectV3FixtureFailureForReceipt(failure.primaryFailure,{
      stage:'primary-failure',fallbackCode:'NATIVE_FIXTURE_FAILURE',includeNested:false
    });
  }
  if(includeNested&&Array.isArray(failure?.cleanupFailures)){
    result.cleanupFailures=failure.cleanupFailures.slice(0,4).map(item=>
      projectV3FixtureFailureForReceipt(item,{
        stage:'cleanup',fallbackCode:'V3_RUNNER_CLEANUP_FAILURE',includeNested:false
      })
    );
  }
  return result;
}

function projectV3RoleFailureForReceipt(error) {
  return projectV3FixtureFailureForReceipt(error,{
    stage:'worker-execution',fallbackCode:'WORKER_FIXTURE_FAILURE'
  });
}

function projectV3WorkerAuditForFailure(audit) {
  if(!audit||typeof audit!=='object')return null;
  const count=value=>Number.isSafeInteger(value)&&value>=0?value:null;
  const bool=value=>typeof value==='boolean'?value:null;
  const safeText=value=>typeof value==='string'&&
    /^[A-Za-z0-9_.:+/-]{1,160}$/.test(value)?value:null;
  const hash=value=>typeof value==='string'&&/^[0-9a-f]{64}$/i.test(value)?value:null;
  const roleProjection=(row,roleName)=>{
    if(!row||typeof row!=='object')return null;
    const result={
      role:row.role===roleName?roleName:roleName,
      seat:row.seat===0||row.seat===1?row.seat:null,
      policyVersion:safeText(row.policyVersion),
      bundleSha256:hash(row.bundleSha256),
      policySha256:hash(row.policySha256),
      decisionCount:count(row.decisionCount),
      rootDecisionCount:count(row.rootDecisionCount),
      promptDecisionCount:count(row.promptDecisionCount),
      rootActionFrontierAdmissionCount:count(row.rootActionFrontierAdmissionCount),
      actionFrontierAdmissionFailureCount:count(row.actionFrontierAdmissionFailureCount),
      hostOnlyPromptCount:count(row.hostOnlyPromptCount),
      abstentionCount:count(row.abstentionCount),
      failureCount:count(row.failureCount),
      timeoutCount:count(row.timeoutCount),
      lastFailureCode:typeof row.lastFailureCode==='string'&&
        /^[A-Z0-9_]{1,64}$/.test(row.lastFailureCode)?row.lastFailureCode:null,
      lastAbstentionReasonCode:typeof row.lastAbstentionReasonCode==='string'&&
        row.lastAbstentionReasonCode.length>0?workerProtocol.PUBLIC_ABSTENTION_REASON_CODE:null,
      workerProcessClosed:bool(row.workerProcessClosed),
      containerRemoved:bool(row.containerRemoved),
      policyBundleRemoved:bool(row.policyBundleRemoved),
      containerIdSha256:hash(row.containerIdSha256),
      policyStreamProtocol:safeText(row.policyStreamProtocol),
      policyDrawCount:row.policyDrawCount===null?null:count(row.policyDrawCount),
      policyDrawCounts:Array.isArray(row.policyDrawCounts)?
        row.policyDrawCounts.slice(0,64).map(count).filter(value=>value!==null):[],
      policyDrawViolationCount:count(row.policyDrawViolationCount),
      policyRngReplayable:bool(row.policyRngReplayable)
    };
    return result;
  };
  return {
    schema:'agent49-v3-worker-execution-audit-failure-projection-v1',
    roles:{
      candidate:roleProjection(audit.roles?.candidate,'candidate'),
      opponent:roleProjection(audit.roles?.opponent,'opponent')
    },
    totalWorkerDecisions:count(audit.totalWorkerDecisions),
    totalHostOnlyPrompts:count(audit.totalHostOnlyPrompts),
    totalAbstentions:count(audit.totalAbstentions),
    totalFailures:count(audit.totalFailures),
    policyRngViolations:count(audit.policyRngViolations),
    replayableEvidence:bool(audit.replayableEvidence),
    cleanupVerified:bool(audit.cleanupVerified),
    cleanupFailureCount:count(audit.cleanupFailureCount),
    cleanupReceipts:Array.isArray(audit.cleanupReceipts)?
      audit.cleanupReceipts.slice(0,8).map(row=>({
        role:row?.role==='candidate'||row?.role==='opponent'?row.role:null,
        processClosed:row?.processClosed===true,
        containerRemoved:row?.containerRemoved===true
      })):[],
    physicalSeedDisclosedToWorker:bool(audit.physicalSeedDisclosedToWorker),
    policySeedDisclosedToWorker:bool(audit.policySeedDisclosedToWorker),
    nativeStateDisclosedToWorker:bool(audit.nativeStateDisclosedToWorker),
    opponentPrivateZonesDisclosedToWorker:bool(audit.opponentPrivateZonesDisclosedToWorker),
    workerInputScope:audit.workerInputScope===
      'actor-observation-v3+actor-prompt-projection+public-event-receipt-v3+typed-action-frontier-v1'?
        'actor-observation-v3+actor-prompt-projection+public-event-receipt-v3+typed-action-frontier-v1':null
  };
}

const NO_GAME_WITNESS_SEED_PROBE_REASON_KEYS=Object.freeze([
  'mulliganPromptShape', 'mulliganPromptOwnerMismatch', 'startingPokemonPromptShape', 'startingPokemonBounds',
  'startingPokemonInsufficientChoices', 'opponentActiveStateMismatch',
  'startingPokemonMinimumUnmet', 'unsupportedOwnerPrompt', 'otherSetupIncompatible'
]);

const NO_GAME_WITNESS_SAFE_PROMPT_CLASS_NAMES=Object.freeze([
  'ConfirmPrompt','SelectPrompt','ChooseCardsPrompt','CoinFlipPrompt',
  'ShuffleDeckPrompt','WaitPrompt','ShowMulliganPrompt'
]);
const NO_GAME_WITNESS_SAFE_PROMPT_MESSAGES=Object.freeze([
  'GO_FIRST','WANT_TO_DRAW_CARDS','CHOOSE_STARTING_POKEMONS',
  'SETUP_PLAYER_NO_BASIC','SETUP_OPPONENT_NO_BASIC'
]);
function projectNoGameWitnessSafePromptIdentity(identity) {
  if(!identity||typeof identity!=='object'||Array.isArray(identity))return null;
  const bounded=(value,maximum)=>Number.isSafeInteger(value)&&value>=0&&value<=maximum?value:null;
  const seat=value=>value===0||value===1?value:null;
  const attemptIndex=bounded(identity.attemptIndex,63);
  if(attemptIndex===null)return null;
  return {
    schema:'agent49-v3-safe-prompt-identity-v1',
    attemptIndex,
    promptClass:NO_GAME_WITNESS_SAFE_PROMPT_CLASS_NAMES.includes(identity.promptClass)?
      identity.promptClass:'OTHER',
    message:NO_GAME_WITNESS_SAFE_PROMPT_MESSAGES.includes(identity.message)?
      identity.message:'OTHER',
    phase:bounded(identity.phase,255),
    actorSeat:seat(identity.actorSeat),
    activePlayerSeat:seat(identity.activePlayerSeat),
    min:bounded(identity.min,60),
    max:bounded(identity.max,60),
    allowCancel:typeof identity.allowCancel==='boolean'?identity.allowCancel:null,
    ...(seat(identity.opponentSeat)!==null?{opponentSeat:seat(identity.opponentSeat)}:{}),
    ...(seat(identity.promptOwnerSeat)!==null?{promptOwnerSeat:seat(identity.promptOwnerSeat)}:{}),
    ...(typeof identity.ownerSeatMatchesActor==='boolean'?{ownerSeatMatchesActor:identity.ownerSeatMatchesActor}:{}),
    ...(Number.isSafeInteger(identity.activeCardsLength)&&identity.activeCardsLength>=0&&identity.activeCardsLength<=60
      ?{activeCardsLength:identity.activeCardsLength}:{}),
    ...(typeof identity.hasGetPokemonCard==='boolean'?{hasGetPokemonCard:identity.hasGetPokemonCard}:{}),
    ...(typeof identity.activePokemonPresent==='boolean'?{activePokemonPresent:identity.activePokemonPresent}:{}),
    ...(typeof identity.activeSlotOccupied==='boolean'?{activeSlotOccupied:identity.activeSlotOccupied}:{}),
    ...(['minimum-one-has-active','minimum-zero-no-active'].includes(identity.mismatchBranch)
      ?{mismatchBranch:identity.mismatchBranch}:{}),
    instanceof:{
      coinFlipPrompt:identity.instanceof?.coinFlipPrompt===true,
      shuffleDeckPrompt:identity.instanceof?.shuffleDeckPrompt===true,
      waitPrompt:identity.instanceof?.waitPrompt===true
    }
  };
}
function captureNoGameWitnessSafePromptIdentity(request,attemptIndex,extra={}) {
  const prompt=request.prompt;
  const isInstanceOf=name=>{
    const Constructor=request.native?.[name];
    try{return typeof Constructor==='function'&&prompt instanceof Constructor;}
    catch{return false;}
  };
  return projectNoGameWitnessSafePromptIdentity({
    attemptIndex,
    promptClass:prompt.constructor?.name,
    message:prompt.message,
    phase:request.state?.phase,
    actorSeat:request.actorSeat,
    activePlayerSeat:request.state?.activePlayer,
    min:prompt.options?.min,
    max:prompt.options?.max,
    allowCancel:prompt.options?.allowCancel,
    opponentSeat:extra.opponentSeat,
    promptOwnerSeat:extra.promptOwnerSeat,
    ownerSeatMatchesActor:extra.ownerSeatMatchesActor,
    activeCardsLength:extra.activeCardsLength,
    hasGetPokemonCard:extra.hasGetPokemonCard,
    activePokemonPresent:extra.activePokemonPresent,
    activeSlotOccupied:extra.activeSlotOccupied,
    mismatchBranch:extra.mismatchBranch,
    instanceof:{
      coinFlipPrompt:isInstanceOf('CoinFlipPrompt'),
      shuffleDeckPrompt:isInstanceOf('ShuffleDeckPrompt'),
      waitPrompt:isInstanceOf('WaitPrompt')
    }
  });
}

// Project only bounded retry categories and counts; never expose seeds, prompts, cards, or state.
function projectNoGameWitnessSeedProbeSummary(summary) {
  if(!summary||typeof summary!=='object'||Array.isArray(summary))return null;
  const count=value=>Number.isSafeInteger(value)&&value>=0?Math.min(64,value):0;
  const seat=value=>value===0||value===1?value:null;
  const candidateSeat=seat(summary.candidateSeat);
  const targetActorSeat=seat(summary.targetActorSeat);
  if(candidateSeat===null||targetActorSeat===null)return null;
  const source=summary.setupIncompatibleByReason&&typeof summary.setupIncompatibleByReason==='object'&&!Array.isArray(summary.setupIncompatibleByReason)?summary.setupIncompatibleByReason:{};
  const setupIncompatibleByReason=Object.fromEntries(NO_GAME_WITNESS_SEED_PROBE_REASON_KEYS.map(key=>[key,count(source[key])]));
  const wrong=summary.wrongSeatRootCounts&&typeof summary.wrongSeatRootCounts==='object'&&!Array.isArray(summary.wrongSeatRootCounts)?summary.wrongSeatRootCounts:{};
  const wrongSeatRootCounts={seat0:count(wrong.seat0),seat1:count(wrong.seat1),unknown:count(wrong.unknown)};
  const firstUnsupportedPrompt=projectNoGameWitnessSafePromptIdentity(summary.firstUnsupportedPrompt);
  const attempt4UnsupportedPrompt=projectNoGameWitnessSafePromptIdentity(summary.attempt4UnsupportedPrompt);
  return {
    schema:'agent49-v3-no-game-seed-probe-summary-v2',candidateSeat,targetActorSeat,
    attempts:count(summary.attempts),setupIncompatibleByReason,
    setupIncompatibleCount:Math.min(64,Object.values(setupIncompatibleByReason).reduce((sum,value)=>sum+value,0)),
    wrongSeatRootCounts,
    wrongSeatRootCount:Math.min(64,Object.values(wrongSeatRootCounts).reduce((sum,value)=>sum+value,0)),
    ...(firstUnsupportedPrompt?{firstUnsupportedPrompt}:{}),
    ...(attempt4UnsupportedPrompt?{attempt4UnsupportedPrompt}:{})
  };
}
function buildNoGameWitnessFailureReceipt({
  error,candidateSeat,opponentSeat,actorSeat,stage='native-no-game-witness',
  runnerRevision=null,enginePin=null,candidatePolicy=null,opponentPolicy=null,
  completedWitnesses=[]
}={}) {
  const fixtureFailure=projectV3FixtureFailureForReceipt(
    error?.fixtureFailure??error,{stage,fallbackCode:'NATIVE_NO_GAME_WITNESS_FAILURE'}
  );
  const completed=Array.isArray(completedWitnesses)?completedWitnesses.slice(0,4).map(witness=>({
    candidateSeat:witness.candidateSeat,
    opponentSeat:witness.opponentSeat,
    actorSeat:witness.actorSeat,
    status:'passed'
  })): [];
  const expectedActorSeat=fixtureFailure?.expectedActorSeat??actorSeat;
  const actualActorSeat=fixtureFailure?.actualActorSeat??null;
  const seedProbeSummary=projectNoGameWitnessSeedProbeSummary(error?.seedProbeSummary);
  const failed={
    candidateSeat,opponentSeat,actorSeat:expectedActorSeat,
    expectedActorSeat,actualActorSeat,status:'failed'
  };
  return {
    schema:'agent36-v3-native-no-game-witness-failure-v1',
    fixtureOnly:true,
    gameExecuted:false,
    admissionEligible:false,
    competitiveGameQualified:false,
    coverageComplete:false,
    expectedWitnessCount:4,
    completedWitnessCount:completed.length,
    completedWitnesses:completed,
    coverage:[...completed,failed],
    generatedAt:new Date().toISOString(),
    researchRevisionSha:runnerRevision,
    twinleafCommitSha:enginePin,
    candidatePrinted60Sha256:V3_FIXTURE.candidateDeckSha256,
    opponentPrinted60Sha256:V3_FIXTURE.opponentDeckSha256,
    candidatePolicySha256:candidatePolicy?.policySha256??null,
    opponentPolicySha256:opponentPolicy?.policySha256??null,
    candidatePolicyVersion:candidatePolicy?.POLICY_VERSION??null,
    opponentPolicyVersion:opponentPolicy?.POLICY_VERSION??null,
    candidateSeat,opponentSeat,expectedActorSeat,actualActorSeat,
    failureStage:fixtureFailure.stage,
    fixtureFailure,
    workerAudit:projectV3WorkerAuditForFailure(error?.workerAudit??error?.safeWorkerAudit),
    ...(seedProbeSummary?{seedProbeSummary}:{})
  };
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

function assertWorkerOnlyPolicyPathsAbsentFromHostClosure(expectedByPath,workerOnlyPaths=[]) {
  assert.ok(expectedByPath&&typeof expectedByPath==='object'&&!Array.isArray(expectedByPath),
    'role manifest expectedByPath must be an object');
  assert.ok(Array.isArray(workerOnlyPaths),'workerOnlyPaths must be an array');
  const workerOnly=[...new Set(workerOnlyPaths)].sort();
  assert.equal(workerOnly.length,2,
    'candidate and opponent policy sources must be separately pinned worker-only assets');
  for(const relative of workerOnly){
    assert.equal(typeof relative,'string');
    assert.equal(Object.hasOwn(expectedByPath,relative),false,
      'worker-only policy source must not appear in the host role source closure: '+relative);
  }
  return expectedByPath;
}

function preloadRoleHostModules({repositoryRoot=ROOT,expectedByPath,workerOnlyPaths=[],
  workerOnlyHashes={}}={}) {
  const root=fs.realpathSync(repositoryRoot);
  assert.ok(workerOnlyHashes&&typeof workerOnlyHashes==='object'&&!Array.isArray(workerOnlyHashes),
    'worker-only policy hashes must be supplied separately from host expectedByPath');
  const workerOnly=[...new Set(workerOnlyPaths)].sort();
  const workerOnlyHashKeys=Object.keys(workerOnlyHashes).sort();
  assert.deepEqual(workerOnlyHashKeys,workerOnly,
    'every worker-only policy path must have exactly one separately verified source hash');
  function resolveInsideRepository(relative,label){
    assert.equal(typeof relative,'string');
    const filename=path.resolve(root,relative);
    const relativeCheck=path.relative(root,filename);
    assert.ok(relativeCheck&&relativeCheck!=='.'&&relativeCheck!=='..'&&
      !relativeCheck.startsWith('..'+path.sep)&&!path.isAbsolute(relativeCheck),
      label+' path must remain inside the repository: '+relative);
    return filename;
  }
  for(const relative of workerOnly){
    assert.equal(Object.hasOwn(expectedByPath,relative),false,
      'worker-only policy source cannot be part of host expectedByPath: '+relative);
    assert.match(workerOnlyHashes[relative]??'',SHA256,
      'worker-only policy source hash is invalid: '+relative);
    const filename=resolveInsideRepository(relative,'worker-only policy');
    const bytes=fs.readFileSync(filename);
    const actualSha256=createHash('sha256').update(bytes).digest('hex');
    assert.equal(actualSha256,workerOnlyHashes[relative],
      'worker-only policy source changed before Docker bundle creation: '+relative);
    assert.equal(require.cache[filename],undefined,
      'worker-only policy entrypoint must not be evaluated in the host process before preload: '+relative);
  }
  const hostExpectedByPath=Object.fromEntries(Object.entries(expectedByPath).sort(([a],[b])=>a.localeCompare(b)));
  const loadedPaths=[];
  const workerOnlyByFilename=new Map(workerOnly.map(relative=>[
    resolveInsideRepository(relative,'worker-only policy'),relative
  ]));
  const blockedWorkerOnlyImports=[];
  const originalModuleLoad=Module._load;
  try{
    Module._load=function guardedHostPreload(request,parent,isMain){
      let resolved;
      try{resolved=Module._resolveFilename(request,parent,isMain);}
      catch{return originalModuleLoad.apply(this,arguments);}
      const workerOnlyPath=workerOnlyByFilename.get(resolved);
      if(workerOnlyPath){
        blockedWorkerOnlyImports.push(workerOnlyPath);
        const error=new Error('host dependency attempted to load worker-only policy source: '+workerOnlyPath);
        error.code='WORKER_ONLY_POLICY_HOST_IMPORT_BLOCKED';
        throw error;
      }
      return originalModuleLoad.apply(this,arguments);
    };
    for(const [relative,expectedSha256] of Object.entries(hostExpectedByPath)){
      const filename=resolveInsideRepository(relative,'host runtime');
      const bytes=fs.readFileSync(filename);
      const actualSha256=createHash('sha256').update(bytes).digest('hex');
      assert.equal(actualSha256,expectedSha256,'role source changed before host preload: '+relative);
      Module._load(filename,module,false);
      loadedPaths.push(relative);
    }
  }finally{
    Module._load=originalModuleLoad;
  }
  assert.deepEqual(blockedWorkerOnlyImports,[],
    'host source closure attempted to import worker-only policy code');
  // Recheck after all host dependencies have loaded: a transitive require of a
  // worker-only policy source is just as disqualifying as a direct preload.
  for(const relative of workerOnly){
    const filename=resolveInsideRepository(relative,'worker-only policy');
    assert.equal(require.cache[filename],undefined,
      'host dependency transitively evaluated a worker-only policy source: '+relative);
  }
  return {hostExpectedByPath,workerOnlyPaths:workerOnly,workerOnlyHashes:{...workerOnlyHashes},loadedPaths};
}

function prepareV3RoleRuntimeEvidence({repositoryRoot=ROOT,candidateManifest,
  opponentManifest,cardPoolInitialization,identityHelper=roleIdentity,cacheEntries,
  workerOnlyPaths=[],workerOnlyHashes={},hostExpectedByPath:providedHostExpectedByPath}){
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
  assert.equal(candidateManifest?.manifest?.entrypoint,V3_FIXTURE.hostRoleEntrypointPath,
    'candidate role manifest must identify the host-owned orchestration adapter');
  assert.equal(opponentManifest?.manifest?.entrypoint,V3_FIXTURE.hostRoleEntrypointPath,
    'opponent role manifest must identify the host-owned orchestration adapter');
  const combined=identityHelper.combineRolePolicyEntryManifests(candidateManifest,opponentManifest);
  const hostExpectedByPath=assertWorkerOnlyPolicyPathsAbsentFromHostClosure(
    combined.expectedByPath,workerOnlyPaths
  );
  assert.deepEqual(Object.keys(workerOnlyHashes).sort(),
    [...new Set(workerOnlyPaths)].sort(),
    'worker-only policy hash map must exactly match the two role policy data assets');
  if(providedHostExpectedByPath!==undefined)
    assert.deepEqual(providedHostExpectedByPath,hostExpectedByPath,
      'host preload map must equal the complete host role source closure');
  const manifestDataAssets=[
    ...(candidateManifest.manifest.dataAssets??[]),
    ...(opponentManifest.manifest.dataAssets??[])
  ];
  for(const relative of workerOnlyPaths){
    const assets=manifestDataAssets.filter(asset=>asset.path===relative);
    assert.equal(assets.length,1,
      'worker-only policy source must appear exactly once as a role-manifest data asset: '+relative);
    assert.match(workerOnlyHashes[relative]??'',SHA256,
      'worker-only policy source hash is invalid: '+relative);
    assert.equal(assets[0].sha256,workerOnlyHashes[relative],
      'role-manifest data-asset hash differs from the statically audited policy source: '+relative);
  }
  assert.equal(Object.hasOwn(hostExpectedByPath,V3_FIXTURE.workerPath),false,
    'Docker worker executable must not appear in host source closure');
  assert.equal(Object.hasOwn(hostExpectedByPath,V3_FIXTURE.dockerCanaryWorkerPath),false,
    'Docker canary executable must not appear in host source closure');
  const loaded=identityHelper.assertLoadedResearchModulesCovered(
    repositoryRoot,hostExpectedByPath,cacheEntries);
  const expectedPaths=Object.keys(hostExpectedByPath).sort();
  const loadedPaths=loaded.files.map(file=>file.path).sort();
  assert.deepEqual(loadedPaths,expectedPaths,
    'every host runtime dependency must be preloaded; worker-only policies must remain unevaluated');
  const cardPoolInitializationSha256=evidenceBundleSha256(cardPoolInitialization);
  const runtimePinEvidence={schema:'aichi-runtime-pin-evidence-v1',
    unionSha256:combined.unionSha256,
    loadedProcessClosureSha256:loaded.sha256,
    cardPoolInitializationSha256};
  return {expectedByPath:hostExpectedByPath,roleExpectedByPath:combined.expectedByPath,
    workerOnlyPolicyPaths:[...new Set(workerOnlyPaths)].sort(),
    workerOnlyPolicyHashes:{...workerOnlyHashes},runtimePinEvidence,
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
  pin=withPinnedResearchModuleLoads,cacheEntries,workerOnlyPaths,workerOnlyHashes,
  hostExpectedByPath}){
  const preparedRuntime=prepareV3RoleRuntimeEvidence({repositoryRoot,
    candidateManifest,opponentManifest,cardPoolInitialization,identityHelper,cacheEntries,
    workerOnlyPaths,workerOnlyHashes,hostExpectedByPath});
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
  policySeedBySeat: Object.freeze([0x243f6a88,0x85a308d3]),
  maxActions: null,
  trialId: 'agent36-v3-fixture-hood-rank1-worker-v1',
  candidateWorkerPolicyPath: 'simulation/evaluation/2026-11/agent46-candidate-policy.cjs',
  opponentWorkerPolicyPath: 'simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs',
  hostRoleEntrypointPath: 'simulation/twinleaf/agent44-role-scoped-policy-composition.cjs',
  workerPath: 'simulation/evaluation/2026-11/agent49-policy-worker.cjs',
  dockerCanaryWorkerPath: 'simulation/evaluation/2026-11/agent49-docker-canary-worker.cjs',
  protocolPath: 'simulation/evaluation/2026-11/agent49-policy-protocol.cjs',
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
  'tests/agent36-v3-runner.test.cjs',
  'tests/agent42-role-policy-identity.test.cjs',
  'tests/2026-11/agent49-native-fixture-game.test.cjs',
  'tests/2026-11/agent49-fixture-scoped-runtime-pin.test.cjs',
  'tests/2026-11/agent44-v3-game-bundle-builder.test.cjs',
  'tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs',
  'tests/2026-11/agent43-full-state-diagnostic.test.cjs',
  'tests/2026-11/agent45/full-state-trace.test.cjs',
  'tests/2026-11/agent36-v3-fixture-game.test.cjs',
  'tests/2026-11/agent46-candidate-policy.test.cjs',
  'tests/2026-11/agent36-native-action-frontier.test.cjs',
  'tests/2026-11/agent36-prompt-projection.test.cjs',
  'tests/2026-11/agent36-prompt-provenance.test.cjs',
  'tests/2026-11/agent49-policy-worker.test.cjs',
  'tests/2026-11/agent36-docker-policy-worker.test.cjs',
  'tests/2026-11/agent35-docker-policy-worker-launcher-contract.test.cjs',
  'tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs',
  'tests/2026-11/agent1-private-diagnostic-envelope.test.cjs',
  'tests/agent36-runtime-module-pin.test.cjs',
];

const V3_FIXTURE_COMMON_BINDINGS = [
  { name: 'observe', path: 'simulation/twinleaf/actor-observation-contract.cjs', exportName: 'actorObservation' },
  { name: 'promptActions', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action.js', exportName: 'ResolvePromptAction' },
  { name: 'roleComposer', path: 'simulation/twinleaf/agent44-role-scoped-policy-composition.cjs', exportName: 'withCandidateOpponentPolicyRoles' },
  { name: 'moduleLoadGuard', path: 'simulation/evaluation/agent36-runtime-module-pin.cjs', exportName: 'withPinnedResearchModuleLoads' },
  { name: 'sourceClosureAudit', path: 'simulation/evaluation/agent36-source-closure-audit.cjs', exportName: 'auditSourceClosure' },
  { name: 'roleIdentityHelper', path: 'simulation/evaluation/2026-11/agent42-role-policy-identity.cjs', exportName: 'buildRolePolicyIdentity' },
  { name: 'trainerCatalog', path: 'simulation/twinleaf/agent5-generic-owner-trainer-opportunity.cjs', exportName: 'trainerPrintCatalog' },
  { name: 'cardPoolStartup', path: 'vendor/twinleaf/ptcg-server/start.js' },
  { name: 'nativeStore', path: 'vendor/twinleaf/ptcg-server/output/game/store/store.js', exportName: 'Store' },
  { name: 'nativeGameSettings', path: 'vendor/twinleaf/ptcg-server/output/game/core/game-settings.js', exportName: 'GameSettings' },
  { name: 'nativeState', path: 'vendor/twinleaf/ptcg-server/output/game/store/state/state.js', exportName: 'State' },
  { name: 'nativeGamePhase', path: 'vendor/twinleaf/ptcg-server/output/game/store/state/state.js', exportName: 'GamePhase' },
  { name: 'nativePlayer', path: 'vendor/twinleaf/ptcg-server/output/game/store/state/player.js', exportName: 'Player' },
  { name: 'nativePokemonCardList', path: 'vendor/twinleaf/ptcg-server/output/game/store/state/pokemon-card-list.js', exportName: 'PokemonCardList' },
  { name: 'nativeCardList', path: 'vendor/twinleaf/ptcg-server/output/game/store/state/card-list.js', exportName: 'CardList' },
  { name: 'nativeAddPlayerAction', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/add-player-action.js', exportName: 'AddPlayerAction' },
  { name: 'nativeShuffleDeckPrompt', path: 'vendor/twinleaf/ptcg-server/output/game/store/prompts/shuffle-prompt.js', exportName: 'ShuffleDeckPrompt' },
  { name: 'nativeWaitPrompt', path: 'vendor/twinleaf/ptcg-server/output/game/store/prompts/wait-prompt.js', exportName: 'WaitPrompt' },
  { name: 'nativeCoinFlipPrompt', path: 'vendor/twinleaf/ptcg-server/output/game/store/prompts/coin-flip-prompt.js', exportName: 'CoinFlipPrompt' },
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
  { name: 'nativeSuperType', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/card-types.js', exportName: 'SuperType' },
  { name: 'nativeCheckPokemonTypeEffect', path: 'vendor/twinleaf/ptcg-server/output/game/store/effects/check-effects.js', exportName: 'CheckPokemonTypeEffect' },
  { name: 'nativeStage', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/card-types.js', exportName: 'Stage' },
  { name: 'nativeTrainerType', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/card-types.js', exportName: 'TrainerType' },
  { name: 'nativePokemonTypes', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/pokemon-types.js', exportName: 'PowerType' },
  { name: 'nativeSpecialCondition', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/card-types.js', exportName: 'SpecialCondition' },
];

const V3_FIXTURE_PROMPT_CHAIN = [
  { name: 'candidate-opponent-role-composition', path: 'simulation/twinleaf/agent44-role-scoped-policy-composition.cjs' },
  { name: 'actor-only-root-policy', path: V3_FIXTURE.entrypoint },
  { name: 'native-prompt-resolution', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action.js' },
];



const V3_FIXTURE_WORKER_COMMON_BINDINGS = [
  { name: 'observe', path: 'simulation/twinleaf/actor-observation-contract.cjs', exportName: 'actorObservation' },
  { name: 'roleComposer', path: 'simulation/twinleaf/agent44-role-scoped-policy-composition.cjs', exportName: 'withCandidateOpponentPolicyRoles' },
  { name: 'roleSeatMap', path: 'simulation/twinleaf/agent44-role-scoped-policy-composition.cjs', exportName: 'candidateOpponentRoleSeats' },
  { name: 'publicEventReceipt', path: 'simulation/twinleaf/agent8-public-event-receipt.cjs', exportName: 'publicEventReceipt' },
  { name: 'workerProtocol', path: 'simulation/evaluation/2026-11/agent49-policy-protocol.cjs', exportName: 'validateRequest' },
  { name: 'workerLauncher', path: 'simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs', exportName: 'createPolicyBundle' },
  { name: 'workerSession', path: 'simulation/evaluation/2026-11/agent36-async-docker-policy-session.cjs', exportName: 'createDockerPolicySession' },
  { name: 'nativeActionFrontier', path: 'simulation/evaluation/2026-11/agent36-native-action-frontier.cjs', exportName: 'buildNativeActionFrontier' },
  { name: 'knownCapFreeActionEnumerator', path: 'simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs', exportName: 'createKnownCapFreeActionEnumerator' },
  { name: 'promptProvenance', path: 'simulation/evaluation/2026-11/agent36-prompt-provenance.cjs', exportName: 'installPromptProvenanceHook' },
  { name: 'nativeActionEnumerator', path: 'vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator.js', exportName: 'ActionEnumerator' },
  { name: 'nativeSimulator', path: 'vendor/twinleaf/ptcg-server/output/game/bots/simulator.js', exportName: 'Simulator' },
  { name: 'nativePlayerType', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action.js', exportName: 'PlayerType' },
  { name: 'nativeSlotType', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action.js', exportName: 'SlotType' },
  { name: 'nativePromptProjection', path: 'simulation/evaluation/2026-11/agent36-prompt-projection.cjs', exportName: 'projectPrompt' },
  { name: 'setupPromptAudit', path: 'simulation/evaluation/2026-11/agent19-setup-prompt-audit.cjs', exportName: 'buildSetupPromptAudit' },
  { name: 'asyncFixtureGameDriver', path: 'simulation/evaluation/2026-11/agent49-native-fixture-game.cjs', exportName: 'runNativeFixtureGameAsync' },
  { name: 'promptActions', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action.js', exportName: 'ResolvePromptAction' },
  { name: 'moduleLoadGuard', path: 'simulation/evaluation/agent36-runtime-module-pin.cjs', exportName: 'withPinnedResearchModuleLoads' },
  { name: 'sourceClosureAudit', path: 'simulation/evaluation/agent36-source-closure-audit.cjs', exportName: 'auditSourceClosure' },
  { name: 'roleIdentityHelper', path: 'simulation/evaluation/2026-11/agent42-role-policy-identity.cjs', exportName: 'buildRolePolicyIdentity' },
  { name: 'trainerCatalog', path: 'simulation/twinleaf/agent5-generic-owner-trainer-opportunity.cjs', exportName: 'trainerPrintCatalog' },
  { name: 'cardPoolStartup', path: 'vendor/twinleaf/ptcg-server/start.js' },
  { name: 'nativeStore', path: 'vendor/twinleaf/ptcg-server/output/game/store/store.js', exportName: 'Store' },
  { name: 'nativeGameSettings', path: 'vendor/twinleaf/ptcg-server/output/game/core/game-settings.js', exportName: 'GameSettings' },
  { name: 'nativeState', path: 'vendor/twinleaf/ptcg-server/output/game/store/state/state.js', exportName: 'State' },
  { name: 'nativeGamePhase', path: 'vendor/twinleaf/ptcg-server/output/game/store/state/state.js', exportName: 'GamePhase' },
  { name: 'nativePlayer', path: 'vendor/twinleaf/ptcg-server/output/game/store/state/player.js', exportName: 'Player' },
  { name: 'nativePokemonCardList', path: 'vendor/twinleaf/ptcg-server/output/game/store/state/pokemon-card-list.js', exportName: 'PokemonCardList' },
  { name: 'nativeCardList', path: 'vendor/twinleaf/ptcg-server/output/game/store/state/card-list.js', exportName: 'CardList' },
  { name: 'nativeAddPlayerAction', path: 'vendor/twinleaf/ptcg-server/output/game/store/actions/add-player-action.js', exportName: 'AddPlayerAction' },
  { name: 'nativeShuffleDeckPrompt', path: 'vendor/twinleaf/ptcg-server/output/game/store/prompts/shuffle-prompt.js', exportName: 'ShuffleDeckPrompt' },
  { name: 'nativeWaitPrompt', path: 'vendor/twinleaf/ptcg-server/output/game/store/prompts/wait-prompt.js', exportName: 'WaitPrompt' },
  { name: 'nativeCoinFlipPrompt', path: 'vendor/twinleaf/ptcg-server/output/game/store/prompts/coin-flip-prompt.js', exportName: 'CoinFlipPrompt' },
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
  { name: 'nativeStage', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/card-types.js', exportName: 'Stage' },
  { name: 'nativeTrainerType', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/card-types.js', exportName: 'TrainerType' },
  { name: 'nativePokemonTypes', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/pokemon-types.js', exportName: 'PowerType' },
  { name: 'nativeSpecialCondition', path: 'vendor/twinleaf/ptcg-server/output/game/store/card/card-types.js', exportName: 'SpecialCondition' },
];

const V3_FIXTURE_WORKER_PROMPT_CHAIN = [
  { name: 'actor-observation-v3', path: 'simulation/twinleaf/actor-observation-contract.cjs' },
  { name: 'public-event-receipt-v3', path: 'simulation/twinleaf/agent8-public-event-receipt.cjs' },
  { name: 'host-native-action-frontier', path: 'simulation/evaluation/2026-11/agent36-native-action-frontier.cjs' },
  { name: 'active-effect-prompt-provenance', path: 'simulation/evaluation/2026-11/agent36-prompt-provenance.cjs' },
  { name: 'typed-owner-prompt-projection', path: 'simulation/evaluation/2026-11/agent36-prompt-projection.cjs' },
  { name: 'role-scoped-worker-protocol', path: 'simulation/evaluation/2026-11/agent49-policy-protocol.cjs' },
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
  entrypoint = V3_FIXTURE.hostRoleEntrypointPath,
  commonRuntimeBindings = V3_FIXTURE_COMMON_BINDINGS,
  orderedPromptChain = V3_FIXTURE_PROMPT_CHAIN,
  additionalDataAssetPaths = [],
} = {}) {
  assert.match(enginePin || '', /^[0-9a-f]{40}$/i, 'fixture engine pin must be a full Git SHA');
  assert.match(runnerRevision || '', /^[0-9a-f]{40}$/i, 'fixture runner revision must be a full Git SHA');
  assert.equal(entrypoint,V3_FIXTURE.hostRoleEntrypointPath,
    'V3 role manifest entrypoint must be the host-owned orchestration adapter');
  assert.notEqual(entrypoint,V3_FIXTURE.workerPath,
    'Docker worker executable is a data asset, never a host role-policy entrypoint');
  assert.notEqual(entrypoint,V3_FIXTURE.dockerCanaryWorkerPath,
    'Docker canary executable is a test data asset, never a host role-policy entrypoint');
  assert.equal(commonRuntimeBindings.some(binding=>binding.path===V3_FIXTURE.workerPath||
    binding.path===V3_FIXTURE.dockerCanaryWorkerPath),false,
    'Docker worker executables must not be host common-runtime bindings');
  assert.equal(orderedPromptChain.some(item=>item.path===V3_FIXTURE.workerPath||
    item.path===V3_FIXTURE.dockerCanaryWorkerPath),false,
    'Docker worker executables must not be host prompt-chain modules');
  commonRuntimeBindings = commonRuntimeBindings.map((binding) => ({ ...binding }));
  orderedPromptChain = orderedPromptChain.map((item) => ({ ...item }));
  const sharedEnginePatches = [{ name: V3_FIXTURE.hookId, path: V3_FIXTURE.hookPath }];
  const dataAssetPaths = [
    V3_FIXTURE.candidatePath,
    V3_FIXTURE.fieldPath,
    V3_FIXTURE.workerPath,
    V3_FIXTURE.dockerCanaryWorkerPath,
    V3_FIXTURE.officialRank1Path,
    V3_FIXTURE.originalAdmissionPath,
    'simulation/evaluation/2026-11/agent36-v3-runner.cjs',
    'simulation/evaluation/2026-11/agent49-native-fixture-game.cjs',
    'simulation/evaluation/2026-11/agent49-fixture-scoped-runtime-pin.cjs',
    'simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs',
    'simulation/twinleaf/2026-11/agent45/full-state-trace.cjs',
    'simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs',
    'simulation/evaluation/2026-11/agent1-private-diagnostic-envelope.cjs',
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
  const environmentAllowlist = policyEnvironmentAllowlist(sourceClosure.keys || []);
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

function validatePhysicalSeedDisclosureDecision(decision) {
  if(decision!=='public-reproducible') {
    const error=new Error('V3 fixture is blocked until the owner explicitly authorizes public physical-seed disclosure; private-host-only mode is not implemented');
    error.code='SEED_DISCLOSURE_NOT_AUTHORIZED';
    throw error;
  }
  return decision;
}

const PUBLIC_SEED_REGISTRATION_SCHEMA='agent36-v3-public-seed-registration-v1';
const PUBLIC_SEED_REGISTRATION_SCOPE='aichi-top32-rank1-diagnostic-both-seats';
const RETIRED_FIXTURE_SEED_SHA256='96ac4bf2fd4e969f114e56334b0ccf1818ed2069789649fb1efb832cd7510803';

function validatePublicSeedRegistration(registration,{
  enginePin,candidatePolicyVersion,opponentPolicyVersion,
  nowMs=Date.now()
}={}) {
  assert.ok(registration&&typeof registration==='object'&&!Array.isArray(registration),
    'public seed registration must be a JSON object');
  assert.equal(registration.schema,PUBLIC_SEED_REGISTRATION_SCHEMA,
    'public seed registration schema is not recognized');
  assert.equal(registration.fixtureOnly,true,
    'public seed registration must remain fixture-only');
  assert.equal(registration.scope,PUBLIC_SEED_REGISTRATION_SCOPE,
    'public seed registration must be scoped to the Aichi rank-1 two-seat diagnostic');
  assert.match(registration.registrationId??'',/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/,
    'public seed registration requires a stable unique registrationId');
  assert.match(registration.trialId??'',/^[A-Za-z0-9][A-Za-z0-9._-]{0,95}$/,
    'public seed registration requires a stable trialId');
  assert.ok(typeof registration.registeredBy==='string'&&registration.registeredBy.trim().length>0,
    'public seed registration requires an accountable registeredBy value');
  const registeredAt=Date.parse(registration.registeredAt);
  assert.ok(Number.isFinite(registeredAt)&&
    registeredAt>=Date.parse('2026-11-13T00:00:00.000Z')&&
    registeredAt<=nowMs+300000,
    'public seed registration must be fresh, dated, and not future-dated');
  assert.ok(typeof registration.seed==='string'&&registration.seed.trim().length>0&&
    registration.seed.length<=128,
    'public seed registration requires a non-empty public seed string of at most 128 characters');
  const seedSha256=createHash('sha256').update(registration.seed,'utf8').digest('hex');
  assert.notEqual(seedSha256,RETIRED_FIXTURE_SEED_SHA256,
    'retired diagnostic seed cannot be reused for a new fixture');
  assert.equal(registration.seedDisclosureDecision,'public-reproducible',
    'public seed registration must explicitly authorize public reproducibility');
  assert.equal(registration.twinleafCommitSha,enginePin,
    'public seed registration must bind the exact pinned Twinleaf revision');
  assert.equal(registration.candidatePrinted60Sha256,V3_FIXTURE.candidateDeckSha256,
    'public seed registration must bind the frozen candidate printed 60');
  assert.equal(registration.opponentPrinted60Sha256,V3_FIXTURE.opponentDeckSha256,
    'public seed registration must bind the frozen Aichi rank-1 printed 60');
  assert.equal(registration.candidatePolicyVersion,candidatePolicyVersion,
    'public seed registration must bind the frozen candidate worker policy version');
  assert.equal(registration.opponentPolicyVersion,opponentPolicyVersion,
    'public seed registration must bind the frozen opponent worker policy version');
  return registration;
}

function readPublicSeedRegistration({
  repositoryRoot=ROOT,artifactRef,enginePin,
  candidatePolicyVersion,opponentPolicyVersion
}={}) {
  const normalizedRef=validateArtifactRef(artifactRef);
  assert.equal(normalizedRef.startsWith('private/'),false,
    'public seed registration cannot be stored in private/');
  const filename=resolveInsideRoot(repositoryRoot,normalizedRef);
  const bytes=fs.readFileSync(filename);
  const registration=JSON.parse(bytes.toString('utf8'));
  validatePublicSeedRegistration(registration,{
    enginePin,candidatePolicyVersion,opponentPolicyVersion
  });
  return {
    artifactRef:normalizedRef,
    registration,
    registrationSha256:evidenceBundleSha256(registration),
    registrationGitBlobSha:gitBlobSha(bytes)
  };
}


const NO_GAME_WITNESS_RECEIPT_KEYS=Object.freeze([
  'schema','fixtureOnly','gameExecuted','liveActionsDispatched',
  'allStoreStatesUnchanged','allSelectedActionsValidated','allActorObservationsUsed',
  'allWorkersClosed','allWorkerPoliciesActorOnly','generatedAt','researchRevisionSha',
  'twinleafCommitSha','candidatePrinted60Sha256','opponentPrinted60Sha256',
  'candidatePolicySha256','opponentPolicySha256','candidatePolicyVersion',
  'opponentPolicyVersion','coverage','witnesses'
]);
const NO_GAME_WITNESS_ROW_KEYS=Object.freeze([
  'schema','fixtureOnly','gameExecuted','nativeStoreCreated','bothPlayersRegistered',
  'nativeActionFrontierUsed','nativeValidationStoreMode','hostStoppedBeforeLiveDispatch',
  'candidateSeat','opponentSeat','actorSeat','role','seed','seed32',
  'actualFirstPlayerSeat','actorObservationUsed','selectedActionValidated',
  'validationActionKind','actionFrontierItemCount','fullOriginalStoreStateUnchanged',
  'liveActionDispatched','acceptedRootActions','rootDecisionCount','workerDecisionCount',
  'policySha256','policyVersion','workerCleanupVerified','allWorkerSessionsClosed',
  'actorOnlyWorkerInput','nativeStateDisclosedToWorker',
  'opponentPrivateZonesDisclosedToWorker','physicalSeedDisclosedToWorker',
  'policySeedDisclosedToWorker','workerInputScope','workerFailureCount',
  'policyRngReplayable','candidatePolicySha256','opponentPolicySha256',
  'candidatePolicyVersion','opponentPolicyVersion','researchRevisionSha',
  'twinleafCommitSha','candidatePrinted60Sha256','opponentPrinted60Sha256',
  'promptProvenanceHookRestored','runtimePinGuardRestored'
]);
const NO_GAME_WITNESS_FORBIDDEN_FIELDS=new Set([
  'state','store','observation','actorInput','actorObservation','actorObservationPayload',
  'actionPayload','decisionTrace','workerDecisionTrace','rawWorkerTrace','rawDecisionTrace',
  'workerTrace','rootActionLedger','fullStateBefore','fullStateAfter','publicStateBefore',
  'publicStateAfter','promptResolverContext','promptContext','promptId','promptProjection',
  'promptPayload','pendingPrompt','availableOptions','selectedHandIndices','selectedPrintings',
  'validationReceipt','validationPayload','policyAudit','actionFrontier','selectedItems',
  'selectedTokens','nativeContext','nativeState','nativeStore','opponentPrivateZones',
  'privateZones','hiddenZones','hand','deck','prizes','discard','workerInput','workerRequest',
  'workerResponse','policySeed','policySeedBySeat','policySeedXors','policyRng','rng',
  'randomState','entropy','physicalSeed','physicalSeed32','seed','seed32',
  'promptIds','actionPayloads','validationReceipts','actorInputs','actorObservations',
  'rawActorInput','rawPrompt','rawAction','rawValidation','opponentHand','opponentDeck',
  'opponentPrizes','opponentDiscard','playerHand','playerDeck','playerPrizes',
  'playerDiscard','prizeCards','deckCards','handCards','policySeeds','policySeedMaterial',
  'policyRngState','policyRandomState','workerRng','workerRngState','rngSeed','randomSeed',
  'nativeContexts','nativeStores','storeState','gameState','hiddenState'
].map(key=>key.toLowerCase()));

function assertExactNoGameWitnessKeys(value,allowedKeys,label) {
  assert.ok(value&&typeof value==='object'&&!Array.isArray(value),
    label+' must be a JSON object');
  assert.deepEqual(Object.keys(value).sort(),[...allowedKeys].sort(),
    label+' contains unknown or missing fields');
}

function assertNoForbiddenNoGameWitnessFields(value,path='receipt') {
  if(Array.isArray(value)){
    value.forEach((entry,index)=>
      assertNoForbiddenNoGameWitnessFields(entry,path+'['+index+']'));
    return;
  }
  if(!value||typeof value!=='object')return;
  for(const [key,child] of Object.entries(value)){
    const atWitnessRow=/^receipt\.witnesses\[\d+\]$/.test(path);
    const authorizedPhysicalSeed=atWitnessRow&&(key==='seed'||key==='seed32');
    assert.ok(authorizedPhysicalSeed||!NO_GAME_WITNESS_FORBIDDEN_FIELDS.has(key.toLowerCase()),
      'no-game witness receipt contains forbidden field at '+path+'.'+key);
    assertNoForbiddenNoGameWitnessFields(child,path+'.'+key);
  }
}

function validateNoGameWitnessReceipt(receipt,expected={}) {
  assert.ok(receipt&&typeof receipt==='object'&&!Array.isArray(receipt),
    'native no-game witness receipt must be a JSON object');
  assertExactNoGameWitnessKeys(receipt,NO_GAME_WITNESS_RECEIPT_KEYS,'native no-game witness receipt');
  assertNoForbiddenNoGameWitnessFields(receipt);
  assert.equal(receipt.schema,'agent36-v3-native-no-game-witness-v1');
  assert.ok(typeof receipt.generatedAt==='string'&&Number.isFinite(Date.parse(receipt.generatedAt)),
    'native no-game witness receipt must include a valid generatedAt timestamp');
  assert.deepEqual(receipt.coverage,['0:0','0:1','1:0','1:1'],
    'native no-game witness receipt must declare the exact four role-seat coverage cells');
  assert.equal(receipt.fixtureOnly,true);
  assert.equal(receipt.gameExecuted,false);
  assert.equal(receipt.liveActionsDispatched,false);
  assert.equal(receipt.allStoreStatesUnchanged,true);
  assert.equal(receipt.allSelectedActionsValidated,true);
  assert.equal(receipt.allActorObservationsUsed,true);
  assert.equal(receipt.allWorkersClosed,true);
  assert.equal(receipt.allWorkerPoliciesActorOnly,true);
  assert.equal(receipt.researchRevisionSha,expected.researchRevisionSha,
    'no-game witness must bind the exact checked-out research SHA');
  assert.equal(receipt.twinleafCommitSha,expected.twinleafCommitSha,
    'no-game witness must bind the exact pinned Twinleaf SHA');
  assert.equal(receipt.candidatePrinted60Sha256,expected.candidatePrinted60Sha256);
  assert.equal(receipt.opponentPrinted60Sha256,expected.opponentPrinted60Sha256);
  assert.equal(receipt.candidatePolicySha256,expected.candidatePolicySha256);
  assert.equal(receipt.opponentPolicySha256,expected.opponentPolicySha256);
  assert.equal(receipt.candidatePolicyVersion,expected.candidatePolicyVersion);
  assert.equal(receipt.opponentPolicyVersion,expected.opponentPolicyVersion);
  assert.ok(Array.isArray(receipt.witnesses)&&receipt.witnesses.length===4,
    'no-game witness must cover both roles in both physical seat assignments');
  const seen=new Set();
  for(const [witnessIndex,witness] of receipt.witnesses.entries()){
    assertExactNoGameWitnessKeys(witness,NO_GAME_WITNESS_ROW_KEYS,'native no-game witness row '+witnessIndex);
    assert.equal(witness.schema,'agent36-v3-native-no-game-seat-witness-v1',
      'native no-game witness row must use the expected schema');
    assert.ok(typeof witness.seed==='string'&&witness.seed.trim().length>0,
      'no-game witness physical seed must be a non-empty string');
    assert.ok(Number.isSafeInteger(witness.seed32)&&witness.seed32>=0&&witness.seed32<=0xffffffff,
      'no-game witness seed32 must be an unsigned 32-bit integer');
    const derivedSeed32=createHash('sha256').update(witness.seed,'utf8').digest().readUInt32LE(0);
    assert.equal(witness.seed32,derivedSeed32,
      'no-game witness seed32 must equal SHA-256 first UInt32LE of its physical seed');
    assert.equal(witness.fixtureOnly,true);
    assert.equal(witness.gameExecuted,false);
    assert.equal(witness.liveActionDispatched,false);
    assert.equal(witness.fullOriginalStoreStateUnchanged,true);
    assert.equal(witness.selectedActionValidated,true);
    assert.equal(witness.actorObservationUsed,true);
    assert.equal(witness.workerCleanupVerified,true);
    assert.equal(witness.allWorkerSessionsClosed,true);
    assert.equal(witness.nativeStoreCreated,true);
    assert.equal(witness.bothPlayersRegistered,true);
    assert.equal(witness.nativeActionFrontierUsed,true);
    assert.equal(witness.nativeValidationStoreMode,'cloned-store');
    assert.equal(witness.hostStoppedBeforeLiveDispatch,true);
    assert.equal(witness.actorOnlyWorkerInput,true);
    assert.equal(witness.workerInputScope,
      'actor-observation-v3+actor-prompt-projection+public-event-receipt-v3+typed-action-frontier-v1');
    assert.equal(witness.nativeStateDisclosedToWorker,false);
    assert.equal(witness.opponentPrivateZonesDisclosedToWorker,false);
    assert.equal(witness.physicalSeedDisclosedToWorker,false);
    assert.equal(witness.policySeedDisclosedToWorker,false);
    assert.equal(witness.researchRevisionSha,expected.researchRevisionSha);
    assert.equal(witness.twinleafCommitSha,expected.twinleafCommitSha);
    assert.equal(witness.candidatePrinted60Sha256,expected.candidatePrinted60Sha256);
    assert.equal(witness.opponentPrinted60Sha256,expected.opponentPrinted60Sha256);
    assert.equal(witness.candidatePolicySha256,expected.candidatePolicySha256);
    assert.equal(witness.opponentPolicySha256,expected.opponentPolicySha256);
    assert.equal(witness.candidatePolicyVersion,expected.candidatePolicyVersion);
    assert.equal(witness.opponentPolicyVersion,expected.opponentPolicyVersion);
    assert.ok(witness.candidateSeat===0||witness.candidateSeat===1);
    assert.ok(witness.actorSeat===0||witness.actorSeat===1);
    const role=witness.actorSeat===witness.candidateSeat?'candidate':'opponent';
    assert.equal(witness.policyVersion,role==='candidate'?
      expected.candidatePolicyVersion:expected.opponentPolicyVersion);
    assert.equal(witness.acceptedRootActions,0);
    assert.equal(witness.workerFailureCount,0);
    assert.equal(witness.policyRngReplayable,true);
    assert.equal(witness.actualFirstPlayerSeat,witness.actorSeat);
    assert.equal(witness.rootDecisionCount,1);
    assert.ok(Number.isInteger(witness.actionFrontierItemCount)&&witness.actionFrontierItemCount>0);
    assert.equal(witness.opponentSeat,1-witness.candidateSeat);
    assert.equal(witness.role,role);
    assert.equal(witness.policySha256,role==='candidate'?
      expected.candidatePolicySha256:expected.opponentPolicySha256);
    const key=witness.candidateSeat+':'+witness.actorSeat;
    assert.equal(seen.has(key),false,'no-game witness repeats a role-seat assignment');
    seen.add(key);
  }
  assert.deepEqual([...seen].sort(),['0:0','0:1','1:0','1:1']);
  assert.equal(new Set(receipt.witnesses.map(witness=>witness.seed)).size,4,
    'each role-seat witness must use its own independently searched physical seed');
  return receipt;
}

function stripNoGameWitnessArtifactPath(witness) {
  assert.ok(witness&&typeof witness==='object'&&!Array.isArray(witness),
    'native no-game witness row must be an object');
  const {outputPath,...row}=witness;
  assert.ok(typeof outputPath==='string'&&outputPath.trim().length>0,
    'native no-game witness row must include its per-seat artifact outputPath');
  return row;
}

function verifyNoGameWitnessReceipt({
  receiptPath,env=process.env,repositoryRoot=ROOT
}={}) {
  assert.ok(typeof receiptPath==='string'&&receiptPath.trim().length>0,
    'fixture mode requires an exact-head native no-game witness receipt path');
  const normalizedRef=validateArtifactRef(receiptPath);
  const receipt=readJsonFile(repositoryRoot,normalizedRef);
  const candidatePolicy=loadWorkerPolicyModule(repositoryRoot,
    V3_FIXTURE.candidateWorkerPolicyPath,'candidate');
  const opponentPolicy=loadWorkerPolicyModule(repositoryRoot,
    V3_FIXTURE.opponentWorkerPolicyPath,'opponent');
  return validateNoGameWitnessReceipt(receipt,{
    researchRevisionSha:env.GITHUB_SHA,
    twinleafCommitSha:env.AGENT36_TWINLEAF_COMMIT_SHA,
    candidatePrinted60Sha256:V3_FIXTURE.candidateDeckSha256,
    opponentPrinted60Sha256:V3_FIXTURE.opponentDeckSha256,
    candidatePolicySha256:candidatePolicy.policySha256,
    opponentPolicySha256:opponentPolicy.policySha256,
    candidatePolicyVersion:candidatePolicy.POLICY_VERSION,
    opponentPolicyVersion:opponentPolicy.POLICY_VERSION
  });
}

function buildFixturePolicyConstraints({ patchDescriptor, botOptionsProfile, workerPolicyVersions = null, seedDisclosureDecision, seed, seedRegistration=null }) {
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
      seed,
      ...(seedRegistration?{
        seedRegistrationId:seedRegistration.registrationId,
        seedRegistrationSha256:evidenceBundleSha256(seedRegistration)
      }:{}),
      seedDisclosureDecision,
      seedDisclosure:'public-reproducible-owner-authorized',
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

function buildFixturePolicyPlan({ candidateIdentity, opponentIdentity, constraints, runtimePinEvidence, trialId = V3_FIXTURE.trialId, seedRegistration=null } = {}) {
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
  const seedRegistrationSha256=seedRegistration?evidenceBundleSha256(seedRegistration):null;
  const policyRegistration = {
    schema: 'aichi-policy-registration-v1',
    trialId,
    seed:constraints.randomizationProtocol.seed,
    ...(seedRegistration?{
      seedRegistrationId:seedRegistration.registrationId,
      seedRegistrationSha256
    }:{}),
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
    seed:constraints.randomizationProtocol.seed,
    ...(seedRegistration?{seedRegistration,seedRegistrationSha256}:{}),
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
  return { policyPlanCore, policyPlanSha256, policyRegistration, policyAttestationBundle, preDeal, seedRegistrationSha256 };
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
  const protocolFilename=path.resolve(repositoryRoot,V3_FIXTURE.protocolPath);
  const policyFilename=path.resolve(repositoryRoot,policyModulePath);
  for(const filename of [workerFilename,protocolFilename,policyFilename])
    assert.ok(filename.startsWith(repositoryRoot+path.sep));
  const workerSha256=createHash('sha256').update(fs.readFileSync(workerFilename)).digest('hex');
  const policySha256=createHash('sha256').update(fs.readFileSync(policyFilename)).digest('hex');
  const protocolSha256=createHash('sha256').update(fs.readFileSync(protocolFilename)).digest('hex');
  const bundle=workerLauncher.createPolicyBundle({
    sourceRoot:repositoryRoot,
    policyFiles:[
      {sourcePath:workerFilename,relativePath:'worker.cjs',sha256:workerSha256},
      {sourcePath:protocolFilename,relativePath:'agent49-policy-protocol.cjs',sha256:protocolSha256},
      {sourcePath:policyFilename,relativePath:'policy.cjs',sha256:policySha256},
    ],
  });
  return {bundle,workerSha256,policySha256,protocolSha256};
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
  seedDisclosureDecision=null,
}={}) {
  const role=(name,seat,policyVersion)=>({
    role:name,seat,policyVersion,bundleSha256:null,policySha256:null,
    decisionCount:0,rootDecisionCount:0,promptDecisionCount:0,
    rootActionFrontierAdmissionCount:0,rootActionFrontierAdmissionReceipts:[],
    actionFrontierAdmissionFailureCount:0,
    hostOnlyPromptCount:0,abstentionCount:0,failureCount:0,
    timeoutCount:0,lastFailureCode:null,lastAbstentionReasonCode:null,
    workerProcessClosed:false,containerRemoved:false,policyBundleRemoved:false,
    containerIdSha256:null,policyStreamProtocol:null,policyDrawCount:null,
    policyDrawCounts:[],policyDrawViolationCount:0,policyRngReplayable:true,
  });
  return {
    schema:'agent49-v3-worker-execution-audit-v1',
    workerProcessPerRole:true,
    physicalSeedDisclosureDecision:seedDisclosureDecision,
    physicalSeedDisclosedToWorker:false,
    policySeedDisclosedToWorker:false,
    nativeStateDisclosedToWorker:false,
    opponentPrivateZonesDisclosedToWorker:false,
    workerInputScope:'actor-observation-v3+actor-prompt-projection+public-event-receipt-v3+typed-action-frontier-v1',
    roles:{
      candidate:role('candidate',candidateSeat,candidatePolicyVersion),
      opponent:role('opponent',opponentSeat,opponentPolicyVersion),
    },
    totalWorkerDecisions:0,totalHostOnlyPrompts:0,totalAbstentions:0,totalFailures:0,
    policyRngViolations:0,replayableEvidence:true,
    actionFrontierAdapterSchema:knownCapFreeActionEnumerator.SCHEMA,
    actionFrontierAdapterEnginePin:V3_FIXTURE.engineCommit,
    cleanupVerified:false,cleanupFailureCount:0,cleanupReceipts:[],promptProvenanceHook:null,
  };
}




function validateV3FullStateTraceRecorderResult(result){
  return Boolean(result&&result.complete===true&&
    result.captureError===null&&
    result.publicBoardError===null&&
    result.humanSummaryError===null);
}

function validateV3FullStateTraceJoins({steps,rootActionLedger,decisionRows}={}){
  const stepRows=Array.isArray(steps)?steps:[];
  const ledgerRows=Array.isArray(rootActionLedger)?rootActionLedger:[];
  const decisionTraceRows=Array.isArray(decisionRows)?decisionRows:[];
  const ordinalJoinMatches=stepRows.length===ledgerRows.length&&
    stepRows.every((step,index)=>{
      const ledger=ledgerRows[index];
      return step.actionOrdinal===ledger?.actionOrdinal+1&&
        step.playerSlot===ledger?.playerSlot&&
        step.playerSlot===ledger?.actorSeat&&
        step.playerId===ledger?.playerId&&
        step.actionType===ledger?.action&&
        step.turnBefore===ledger?.turnBefore&&
        step.turnAfter===ledger?.turnAfter;
    });
  const decisionJoinMatches=decisionTraceRows.length===ledgerRows.length&&
    decisionTraceRows.every((row,index)=>{
      const ledger=ledgerRows[index];
      return row.actionOrdinal===ledger?.actionOrdinal&&
        row.actingSeat===ledger?.actorSeat&&
        row.actingPlayerId===ledger?.playerId&&
        row.decisionKind===ledger?.decisionKind&&
        row.actionName===ledger?.action&&
        SHA256.test(row.actionPayloadSha256??'')&&
        row.actionPayloadSha256===ledger?.actionPayloadSha256&&
        row.dispatchStatus==='succeeded'&&
        row.dispatchStatus===ledger?.dispatchStatus&&
        row.turnBefore===ledger?.turnBefore&&
        row.turnAfter===ledger?.turnAfter&&
        row.pendingPromptType===ledger?.pendingPrompt&&
        row.isRootDecision===ledger?.isRootDecision&&
        row.policyInputKind===ledger?.policyInputKind&&
        row.actorObservationSha256===ledger?.actorObservationSha256&&
        evidenceBundleSha256(row.promptResolution??null)===
          evidenceBundleSha256(ledger?.promptResolution??null)&&
        evidenceBundleSha256(row.selectedCardIdentity??null)===
          evidenceBundleSha256(ledger?.selectedCardIdentity??null)&&
        evidenceBundleSha256(row.targetProjection??null)===
          evidenceBundleSha256(ledger?.targetProjection??null)&&
        row.workerDecisionTraceSha256===ledger?.workerDecisionTraceSha256&&
        row.validationReceiptSha256===ledger?.validationReceiptSha256;
    });
  const publicStateJoinMatches=stepRows.length===decisionTraceRows.length&&
    stepRows.every((step,index)=>{
      const row=decisionTraceRows[index];
      return Array.isArray(step.publicBoard)&&
        Array.isArray(row?.publicStateAfter?.players)&&
        evidenceBundleSha256(step.publicBoard)===
          evidenceBundleSha256(row.publicStateAfter.players);
    });
  return {ordinalJoinMatches,decisionJoinMatches,publicStateJoinMatches};
}

function validateV3WorkerDecisionTrace(row){
  try{
    const trace=row?.workerDecisionTrace;
    const receipt=row?.validationReceipt;
    if(!trace||!receipt||trace.schema!=='agent6-worker-decision-trace-v1')return false;
    const actorInput=trace.actorInput;
    const publicReceipt=trace.publicEventReceipt??null;
    const promptBinding=trace.promptProjection??null;
    const frontierBinding=trace.actionFrontier??null;
    const selectedTokens=Array.isArray(trace.selectedTokens)?trace.selectedTokens:[];
    const selectedItems=Array.isArray(trace.selectedItems)?trace.selectedItems:[];
    const decision=trace.decision;
    const expectedTokens=decision?.kind==='select-action'||decision?.kind==='select-choice'?
      [decision.token]:
      decision?.kind==='select-choices'&&Array.isArray(decision.tokens)?
        decision.tokens.slice():[];
    const source=promptBinding?.choices??frontierBinding?.items??[];
    const inputBinding={
      observation:actorInput,
      publicEventReceipt:publicReceipt,
      promptProjection:promptBinding,
      actionFrontier:frontierBinding
    };
    const selectedItemsMatch=Array.isArray(source)&&
      selectedItems.length===expectedTokens.length&&
      selectedItems.every((item,index)=>{
        const expected=source.find(candidate=>candidate?.token===expectedTokens[index]);
        return Boolean(expected)&&item?.token===expectedTokens[index]&&
          evidenceBundleSha256(item)===evidenceBundleSha256(expected);
      });
    const policyAuditValid=Boolean(trace.policyAudit)&&
      workerProtocol.validatePolicyAudit(trace.policyAudit,{
        observation:actorInput,prompt:promptBinding,actionFrontier:frontierBinding
      },decision,trace.policyVersion)===trace.policyAudit;
    const componentDigestsValid=
      actorInput&&typeof actorInput==='object'&&
      SHA256.test(trace.actorInputSha256??'')&&
      trace.actorInputSha256===evidenceBundleSha256(actorInput)&&
      SHA256.test(trace.actorObservationSha256??'')&&
      trace.actorObservationSha256===row.actorObservationSha256&&
      trace.actorInputSha256===trace.actorObservationSha256&&
      (publicReceipt===null?
        trace.publicEventReceiptSha256===null:
        SHA256.test(trace.publicEventReceiptSha256??'')&&
          evidenceBundleSha256(publicReceipt)===trace.publicEventReceiptSha256)&&
      (promptBinding===null?
        trace.promptProjectionSha256===null:
        SHA256.test(trace.promptProjectionSha256??'')&&
          evidenceBundleSha256(promptBinding)===trace.promptProjectionSha256)&&
      (frontierBinding===null?
        trace.actionFrontierSha256===null:
        SHA256.test(trace.actionFrontierSha256??'')&&
          evidenceBundleSha256(frontierBinding)===trace.actionFrontierSha256)&&
      SHA256.test(trace.inputBindingSha256??'')&&
      evidenceBundleSha256(inputBinding)===trace.inputBindingSha256&&
      SHA256.test(trace.selectedItemsSha256??'')&&
      evidenceBundleSha256(selectedItems)===trace.selectedItemsSha256&&
      SHA256.test(trace.policyAuditSha256??'')&&
      evidenceBundleSha256(trace.policyAudit)===trace.policyAuditSha256&&
      SHA256.test(trace.validationReceiptSha256??'')&&
      evidenceBundleSha256(trace.validationReceipt)===trace.validationReceiptSha256;
    const receiptSemanticsValid=row.decisionKind==='owner-root'?
      receipt.schema==='agent6-cloned-store-root-validation-v1'&&
        receipt.selectedActionValidated===true&&
        receipt.actorSeat===row.actingSeat&&
        receipt.nativeActionFrontierUsed===true&&
        receipt.nativeValidationStoreMode==='cloned-store'&&
        receipt.fullOriginalStoreStateUnchanged===true&&
        receipt.selectedToken===expectedTokens[0]&&
        receipt.frontierSha256===trace.actionFrontierSha256&&
        selectedItems.length===1&&
        receipt.selectedItemSha256===evidenceBundleSha256(selectedItems[0]):
      row.decisionKind==='owner-prompt'?
        receipt.schema==='agent6-cloned-store-prompt-validation-v1'&&
        receipt.promptDecodeValidated===true&&
        receipt.actorSeat===row.actingSeat&&
        receipt.clonedPromptResolved===true&&
        receipt.nativeValidationStoreMode==='cloned-store'&&
        receipt.fullOriginalStoreStateUnchanged===true&&
        JSON.stringify(receipt.selectedTokens)===JSON.stringify(expectedTokens)&&
        receipt.selectedItemsSha256===trace.selectedItemsSha256&&
        receipt.promptProjectionSha256===trace.promptProjectionSha256&&
        receipt.actionFrontierSha256===trace.actionFrontierSha256:false;
    const promptIdentityValid=row.decisionKind==='owner-root'?
      row.pendingPromptId===null&&row.pendingPromptType===null&&promptBinding===null:
      row.decisionKind==='owner-prompt'?
        row.pendingPromptId!==null&&row.pendingPromptId!==undefined&&
        typeof row.pendingPromptType==='string'&&
        promptBinding?.promptType===row.pendingPromptType&&
        receipt.promptId===row.pendingPromptId:false;
    return promptIdentityValid&&trace.traceStatus==='validated'&&trace.failureCode===null&&
      Number.isSafeInteger(trace.sequence)&&trace.sequence>0&&
      typeof trace.requestId==='string'&&trace.requestId.length>0&&
      typeof trace.policyVersion==='string'&&trace.policyVersion.length>0&&
      SHA256.test(trace.bundleSha256??'')&&
      trace.actionOrdinal===row.actionOrdinal&&
      trace.seat===row.actingSeat&&
      trace.decisionKind===row.decisionKind&&
      trace.selectionStatus==='resolved'&&
      Array.isArray(trace.unmatchedSelectedTokens)&&trace.unmatchedSelectedTokens.length===0&&
      JSON.stringify(selectedTokens)===JSON.stringify(expectedTokens)&&
      selectedItemsMatch&&
      trace.policyAudit.decisionKind===row.decisionKind&&
      trace.policyAudit.decisionType===decision?.kind&&
      trace.policyAudit.policyVersion===trace.policyVersion&&
      JSON.stringify(trace.policyAudit.selectedTokens)===JSON.stringify(expectedTokens)&&
      policyAuditValid&&componentDigestsValid&&receiptSemanticsValid&&
      SHA256.test(row.workerDecisionTraceSha256??'')&&
      evidenceBundleSha256(trace)===row.workerDecisionTraceSha256&&
      SHA256.test(row.validationReceiptSha256??'')&&
      evidenceBundleSha256(receipt)===row.validationReceiptSha256&&
      evidenceBundleSha256(trace.validationReceipt)===row.validationReceiptSha256&&
      trace.validationReceiptSha256===row.validationReceiptSha256;
  }catch{return false;}
}

function createV3WorkerDecisionResolver({
  sessionsBySeat,candidateSeat=V3_FIXTURE.candidateSeat,
  opponentSeat=V3_FIXTURE.opponentSeat,native,workerAudit,
  expectedActorSeat=null,stopBeforeLiveDispatch=false,
  actionFrontier=nativeActionFrontier,
  actionEnumerator=knownCapFreeActionEnumerator,
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
  const digest=value=>evidenceBundleSha256(value);
  const assertActorOnlyJson=value=>{
    workerProtocol.assertBoundedJson(value);
    workerProtocol.assertNoForbiddenFields(value);
    return value;
  };
  const safeCode=error=>typeof error?.code==='string'&&/^[A-Z0-9_]{1,64}$/.test(error.code)?
    error.code:'WORKER_DECISION_FAILURE';
  const recordFailure=(roleAudit,error,session)=>{
    if(!roleAudit)return;
    const code=safeCode(error);
    if(code.startsWith('NATIVE_ACTION_FRONTIER_')||
        code.startsWith('NATIVE_ACTION_ENUMERATOR_ADAPTER_')){
      roleAudit.actionFrontierAdmissionFailureCount++;
    }
    if(code==='POLICY_ABSTAINED'){
      roleAudit.abstentionCount++;
      workerAudit.totalAbstentions++;
    }else{
      roleAudit.failureCount++;
      workerAudit.totalFailures++;
      if(code.includes('TIMEOUT'))roleAudit.timeoutCount++;
    }
    const stderr=String(error?.stderrTail??session?.stderr??session?.channel?.stderr??'');
    const drawMatch=/POLICY_RANDOM_DRAWS_UNREPLAYABLE policyDrawCount=(\d+)/.exec(stderr);
    if(drawMatch){
      roleAudit.policyDrawCount=Number(drawMatch[1]);
      roleAudit.policyDrawCounts.push(Number(drawMatch[1]));
      roleAudit.policyDrawViolationCount++;
      roleAudit.policyRngReplayable=false;
      workerAudit.policyRngViolations++;
      workerAudit.replayableEvidence=false;
    }else if(stderr.includes('POLICY_RANDOM_DRAWS_UNREPLAYABLE')){
      roleAudit.policyDrawCount=null;
      roleAudit.policyDrawViolationCount++;
      roleAudit.policyRngReplayable=false;
      workerAudit.policyRngViolations++;
      workerAudit.replayableEvidence=false;
    }
    roleAudit.lastFailureCode=code;
  };
  const selectedTokensOf=decision=>{
    if(!decision||typeof decision!=='object')return {tokens:[],status:'missing-decision'};
    if(decision.kind==='select-action'||decision.kind==='select-choice'){
      return typeof decision.token==='string'?
        {tokens:[decision.token],status:'valid'}:
        {tokens:[],status:'invalid-token'};
    }
    if(decision.kind==='select-choices'){
      if(!Array.isArray(decision.tokens)||!decision.tokens.every(token=>typeof token==='string'))
        return {tokens:[],status:'invalid-token-list'};
      return {tokens:decision.tokens.slice(),status:decision.tokens.length?'valid':'empty-selection'};
    }
    if(decision.kind==='abstain')return {tokens:[],status:'abstained'};
    return {tokens:[],status:'unsupported-decision-kind'};
  };
  const bindTraceInputs=(trace,receipt,promptBinding,frontierBinding)=>{
    const publicReceipt=receipt??null;
    const promptValue=promptBinding??null;
    const frontierValue=frontierBinding??null;
    if(publicReceipt!==null)assertActorOnlyJson(publicReceipt);
    if(promptValue!==null)assertActorOnlyJson(promptValue);
    if(frontierValue!==null)assertActorOnlyJson(frontierValue);
    trace.publicEventReceipt=publicReceipt;
    trace.publicEventReceiptSha256=publicReceipt===null?null:digest(publicReceipt);
    trace.promptProjection=promptValue;
    trace.promptProjectionSha256=promptValue===null?null:digest(promptValue);
    trace.actionFrontier=frontierValue;
    trace.actionFrontierSha256=frontierValue===null?null:digest(frontierValue);
    trace.inputBindingSha256=digest({
      observation:trace.actorInput,
      publicEventReceipt:publicReceipt,
      promptProjection:promptValue,
      actionFrontier:frontierValue
    });
  };
  const createRequestTrace=(request,role,actorSeat,observation)=>{
    assert.ok(observation&&typeof observation==='object'&&!Array.isArray(observation),
      'driver-supplied actor observation must be a JSON object');
    assertActorOnlyJson(observation);
    const actorInputSha256=digest(observation);
    const suppliedDigest=typeof request.actorObservationSha256==='string'?
      request.actorObservationSha256:null;
    const trace={
      schema:'agent6-worker-decision-trace-v1',
      traceStatus:'request-prepared',
      failureCode:null,
      requestId:null,sequence:null,role,seat:actorSeat,
      policyVersion:null,bundleSha256:null,
      actionOrdinal:Number.isSafeInteger(request.actionOrdinal)?request.actionOrdinal:null,
      decisionKind:request.decisionKind??observation.decisionKind??null,
      decision:null,
      actorInput:observation,
      actorInputSha256,
      actorObservationSha256:suppliedDigest,
      publicEventReceipt:null,publicEventReceiptSha256:null,
      promptProjection:null,promptProjectionSha256:null,
      actionFrontier:null,actionFrontierSha256:null,inputBindingSha256:null,
      selectedTokens:[],selectedItems:[],selectedItemsSha256:digest([]),
      unmatchedSelectedTokens:[],selectionStatus:'not-returned',
      policyAudit:null,policyAuditSha256:null,
      validationReceipt:null,validationReceiptSha256:null
    };
    bindTraceInputs(trace,null,null,emptyFrontier);
    return trace;
  };
  const enrichTrace=(trace,response,promptBinding,frontierBinding)=>{
    const decision=response?.decision??null;
    trace.requestId=typeof response?.requestId==='string'?response.requestId:null;
    trace.sequence=Number.isSafeInteger(response?.sequence)?response.sequence:null;
    trace.role=typeof response?.role==='string'?response.role:trace.role;
    trace.seat=Number.isSafeInteger(response?.seat)?response.seat:trace.seat;
    trace.policyVersion=typeof response?.policyVersion==='string'?response.policyVersion:null;
    trace.bundleSha256=typeof response?.bundleSha256==='string'?response.bundleSha256:null;
    if(decision!==null){
      try{assertActorOnlyJson(decision);trace.decision=decision;}catch{}
    }
    const tokenInfo=selectedTokensOf(decision);
    trace.selectedTokens=tokenInfo.tokens;
    const source=promptBinding?.choices??frontierBinding?.items??[];
    const selectedItems=[];
    const unmatched=[];
    for(const token of tokenInfo.tokens){
      const item=Array.isArray(source)?source.find(row=>row&&row.token===token):null;
      if(item)selectedItems.push(item);
      else unmatched.push(token);
    }
    trace.selectedItems=selectedItems;
    trace.unmatchedSelectedTokens=unmatched;
    trace.selectedItemsSha256=digest(selectedItems);
    trace.selectionStatus=tokenInfo.status==='valid'?
      (unmatched.length===0?'resolved':'unresolved-token'):
      tokenInfo.status;
    if(response?.policyAudit!==undefined&&response?.policyAudit!==null){
      try{
        assertActorOnlyJson(response.policyAudit);
        trace.policyAudit=response.policyAudit;
        trace.policyAuditSha256=digest(response.policyAudit);
      }catch{
        trace.policyAudit=null;
        trace.policyAuditSha256=null;
      }
    }
    bindTraceInputs(trace,trace.publicEventReceipt,promptBinding,frontierBinding);
    trace.traceStatus='response-received';
  };
  const setValidationReceipt=(trace,receipt)=>{
    assertActorOnlyJson(receipt);
    trace.validationReceipt=receipt;
    trace.validationReceiptSha256=digest(receipt);
    trace.traceStatus='validated';
    trace.failureCode=null;
  };
  const attachTrace=(error,trace)=>{
    if(!trace)return error;
    if(error&&typeof error==='object'&&error.workerDecisionTrace)return error;
    let target=error&&typeof error==='object'?error:
      new Error(String(error??'worker decision failed'));
    try{
      Object.defineProperty(target,'workerDecisionTrace',{
        value:trace,enumerable:true,configurable:true
      });
      return target;
    }catch{
      const wrapped=new Error(String(error?.message??error??'worker decision failed'));
      wrapped.name=error?.name??'Error';
      if(typeof error?.code==='string')wrapped.code=error.code;
      wrapped.cause=error;
      wrapped.workerDecisionTrace=trace;
      return wrapped;
    }
  };
  const requirePolicyAudit=(response,requestShape)=>{
    assert.ok(response?.policyAudit&&
      response.policyAudit.schema===workerProtocol.POLICY_AUDIT_SCHEMA,
      'registered candidate/opponent policy must return a validated per-decision policyAudit');
    workerProtocol.validatePolicyAudit(
      response.policyAudit,requestShape,response.decision,response.policyVersion
    );
    assert.equal(response.policyAudit.policyVersion,response.policyVersion);
    assert.equal(response.policyAudit.decisionKind,requestShape.observation.decisionKind);
  };
  return async request=>{
    assert.equal(request?.kind,'native-fixture-decision',
      'unexpected native fixture yield');
    const actorSeat=request.actorSeat;
    const role=roleForSeat(actorSeat);
    assert.ok(role,'decision actor is not assigned to either frozen policy role');
    if(stopBeforeLiveDispatch===true&&request.prompt===null&&actorSeat!==expectedActorSeat){
      const error=new Error('native no-game witness reached a different first-player seat than the requested role-seat pair');
      error.code='NO_GAME_WITNESS_WRONG_ACTOR';
      error.expectedActorSeat=expectedActorSeat;
      error.actualActorSeat=actorSeat;
      throw error;
    }
    const roleAudit=workerAudit.roles[role];
    const session=sessionsBySeat[actorSeat];
    let decisionTrace=null;
    try{
      assert.ok(session&&typeof session.decide==='function',
        'persistent role worker is unavailable for the acting seat');
      const observation=request.actorObservation;
      decisionTrace=createRequestTrace(request,role,actorSeat,observation);
      const actorDigest=request.actorObservationSha256;
      if(!Number.isSafeInteger(request.actionOrdinal)||request.actionOrdinal<0){
        const error=new Error('native worker request requires a zero-based action ordinal');
        error.code='WORKER_ACTION_ORDINAL_INVALID';
        throw error;
      }
      if(!SHA256.test(actorDigest??'')||decisionTrace.actorInputSha256!==actorDigest){
        const error=new Error('driver actor-observation digest does not match the exact worker input');
        error.code='ACTOR_OBSERVATION_DIGEST_MISMATCH';
        throw error;
      }
      assert.equal(observation.actorSeat,actorSeat,
        'driver actor observation belongs to a different physical seat');
      assert.equal(observation.decisionKind,request.decisionKind,
        'driver actor observation decision kind does not match the native request');
      assert.ok(request.decisionKind==='owner-root'||request.decisionKind==='owner-prompt',
        'native worker request has an unsupported decision kind');
      const receipt=request.state.activePlayer===actorSeat?
        eventReceipt(request.state,actorSeat,null,null):null;
      bindTraceInputs(decisionTrace,receipt,null,emptyFrontier);
      if(request.prompt){
        const activeProvenanceHook=provenanceContext?.current??provenanceHook;
        const projected=promptProjection.projectPrompt({
          prompt:request.prompt,state:request.state,actorSeat,native,store:request.store,
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
        const promptBinding=projected.promptProjection;
        bindTraceInputs(decisionTrace,receipt,promptBinding,emptyFrontier);
        const requestShape={
          observation,prompt:promptBinding,actionFrontier:emptyFrontier
        };
        const response=await session.decide({
          observation,prompt:promptBinding,
          publicEventReceipt:receipt,actionFrontier:emptyFrontier
        });
        roleAudit.decisionCount++;
        roleAudit.policyDrawCount=response.policyDrawCount;
        roleAudit.policyDrawCounts.push(response.policyDrawCount);
        roleAudit.promptDecisionCount++;
        workerAudit.totalWorkerDecisions++;
        enrichTrace(decisionTrace,response,promptBinding,emptyFrontier);
        assert.equal(response.role,role,'worker response role changed across its request');
        assert.equal(response.seat,actorSeat,'worker response physical seat changed across its request');
        requirePolicyAudit(response,requestShape);
        if(response.decision?.kind==='abstain'){
          roleAudit.lastAbstentionReasonCode=response.decision.reasonCode;
          const error=new Error('role worker abstained on an owner prompt');
          error.code='POLICY_ABSTAINED';
          throw error;
        }
        if(!['select-choice','select-choices'].includes(response.decision?.kind)){
          const error=new Error('worker returned an unsupported prompt decision kind');
          error.code='UNSUPPORTED_WORKER_PROMPT_DECISION';
          throw error;
        }
        const prepared=promptProjection.dispatchPromptChoice({
          store:request.store,prompt:request.prompt,state:request.state,actorSeat,
          projection:projected,decision:response.decision,native,dispatch:false,
          withValidationRandom:request.withValidationRandom
        });
        assert.ok(prepared.validationReceipt?.nativeValidationStoreMode==='cloned-store'&&
          prepared.validationReceipt?.fullOriginalStoreStateUnchanged===true&&
          prepared.validationReceipt?.clonedPromptResolved===true,
          'worker-selected prompt choice requires observed cloned-Store settlement');
        const validationReceipt={
          ...prepared.validationReceipt,
          selectedItemsSha256:decisionTrace.selectedItemsSha256,
          promptProjectionSha256:decisionTrace.promptProjectionSha256,
          actionFrontierSha256:decisionTrace.actionFrontierSha256
        };
        assert.deepEqual(validationReceipt.selectedTokens,decisionTrace.selectedTokens,
          'cloned prompt receipt must bind the exact worker-selected tokens');
        setValidationReceipt(decisionTrace,validationReceipt);
        return {
          __nativeFixtureDecisionResolution:true,
          action:prepared.action,
          validationReceipt,
          decisionTrace,
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
      if(typeof request.withValidationRandom!=='function'){
        const error=new Error('native action frontier requires an isolated deterministic validation RNG scope');
        error.code='VALIDATION_RANDOM_SCOPE_MISSING';
        throw error;
      }
      const {frontier,admission}=request.withValidationRandom(()=>{
        const enumerator=actionEnumerator.createKnownCapFreeActionEnumerator({
          native,enginePin:V3_FIXTURE.engineCommit
        });
        const frontier=actionFrontier.buildNativeActionFrontier({
          state:request.state,actorSeat,native,enumerator
        });
        bindTraceInputs(decisionTrace,receipt,null,frontier.actionFrontier);
        const admission=actionEnumerator.assertKnownCapFreeAdapterAdmissionClear({
          enumerator,enginePin:V3_FIXTURE.engineCommit,
          frontierDiagnostics:frontier.diagnostics
        });
        return {frontier,admission};
      });
      roleAudit.rootActionFrontierAdmissionCount++;
      roleAudit.rootActionFrontierAdmissionReceipts.push(admission);
      const requestShape={
        observation,prompt:null,actionFrontier:frontier.actionFrontier
      };
      const response=await session.decide({
        observation,prompt:null,publicEventReceipt:receipt,
        actionFrontier:frontier.actionFrontier
      });
      roleAudit.decisionCount++;
      roleAudit.policyDrawCount=response.policyDrawCount;
      roleAudit.policyDrawCounts.push(response.policyDrawCount);
      roleAudit.rootDecisionCount++;
      workerAudit.totalWorkerDecisions++;
      enrichTrace(decisionTrace,response,null,frontier.actionFrontier);
      assert.equal(response.role,role,'worker response role changed across its request');
      assert.equal(response.seat,actorSeat,'worker response physical seat changed across its request');
      requirePolicyAudit(response,requestShape);
      if(response.decision?.kind==='abstain'){
        const error=new Error('role worker abstained on an owner root decision');
        error.code='POLICY_ABSTAINED';
        throw error;
      }
      if(response.decision?.kind!=='select-action'){
        const error=new Error('worker returned a non-action decision for an owner root');
        error.code='UNSUPPORTED_WORKER_ROOT_DECISION';
        throw error;
      }
      let selectedItem;
      try{
        selectedItem=assertTrustedActionSelection(frontier,response.decision.token);
      }catch(error){
        if(!error.code)error.code='WORKER_SELECTED_TOKEN_UNTRUSTED';
        throw error;
      }
      const validationEvidence={};
      const action=actionFrontier.dispatchSelectedNativeAction({
        store:request.store,frontier,token:response.decision.token,
        state:request.state,actorSeat,native,
        withValidationRandom:request.withValidationRandom,dispatch:false,
        validationEvidence
      });
      const nativeActionFrontierUsed=frontier.actionFrontier.items.some(item=>
        item.token===response.decision.token)&&frontier.actionByToken.has(response.decision.token);
      assert.equal(nativeActionFrontierUsed,true,
        'selected worker action must be a member of the native action frontier');
      assert.equal(validationEvidence.nativeValidationStoreMode,'cloned-store',
        'selected worker action must be revalidated on a cloned native Store');
      assert.equal(validationEvidence.fullOriginalStoreStateUnchanged,true,
        'cloned action validation must preserve the full original Store state graph');
      const validationReceipt={
        schema:'agent6-cloned-store-root-validation-v1',
        ...validationEvidence,
        nativeActionFrontierUsed,
        selectedActionValidated:true,
        actorSeat,
        selectedToken:response.decision.token,
        selectedItemSha256:digest(selectedItem),
        frontierSha256:decisionTrace.actionFrontierSha256
      };
      setValidationReceipt(decisionTrace,validationReceipt);
      return {
        __nativeFixtureDecisionResolution:true,
        action,
        validationReceipt,
        decisionTrace,
        promptResolution:{
          kind:'worker-root',decisionKind:response.decision.kind,selectedCount:1
        }
      };
    }catch(error){
      if(decisionTrace){
        decisionTrace.traceStatus='failed';
        decisionTrace.failureCode=safeCode(error);
        error=attachTrace(error,decisionTrace);
      }
      recordFailure(roleAudit,error,session);
      throw error;
    }
  };
}
function buildV3RunnerFailureError({
  runnerFailure=null,nestedRoleFailure=null,runnerCleanupFailures=[],runnerStage='native-v3-runner',
  workerAudit=null
}={}) {
  const primaryRunnerFailure=runnerFailure?
    projectV3FixtureFailureForReceipt(runnerFailure,{
      stage:runnerStage,fallbackCode:'V3_RUNNER_FAILURE'
    }):nestedRoleFailure?
      projectV3FixtureFailureForReceipt(nestedRoleFailure,{
        stage:'worker-execution',fallbackCode:'WORKER_FIXTURE_FAILURE'
      }):null;
  const cleanupFailureSummaries=runnerCleanupFailures.map(({stage,error})=>
    projectV3FixtureFailureForReceipt(error,{
      stage,fallbackCode:'V3_RUNNER_CLEANUP_FAILURE'
    })
  );
  if(!runnerFailure&&!cleanupFailureSummaries.length)return null;
  let fixtureFailure=cleanupFailureSummaries[0]??primaryRunnerFailure??{
    name:'Error',code:'V3_RUNNER_FAILURE',stage:runnerStage,
    messageSha256:createHash('sha256').update('native V3 runner failure').digest('hex')
  };
  if(cleanupFailureSummaries.length) {
    fixtureFailure={
      ...fixtureFailure,
      code:'V3_RUNNER_CLEANUP_FAILURE',
      primaryFailure:primaryRunnerFailure??undefined,
      cleanupFailures:cleanupFailureSummaries
    };
  }
  const error=new Error('Native V3 fixture runner failed during '+fixtureFailure.stage+'.');
  error.code=fixtureFailure.code;
  error.fixtureFailure=fixtureFailure;
  error.workerAudit=projectV3WorkerAuditForFailure(workerAudit);
  return error;
}

function validateV3DiagnosticMode(diagnosticMode) {
  assert.ok(['encrypted-full','sanitized-only'].includes(diagnosticMode),
    'V3 fixture diagnostic mode must be encrypted-full or sanitized-only');
  return diagnosticMode;
}

async function runV3FixtureGame({
  env=process.env,outputDir=null,
  candidateSeat=V3_FIXTURE.candidateSeat,opponentSeat=1-candidateSeat,
  witnessOnly=false,expectedActorSeat=null,seed=null,seedRegistrationInput=null
}={}) {
  const seedDisclosureDecision=witnessOnly?'public-reproducible':
    validatePhysicalSeedDisclosureDecision(env.AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION);
  const diagnosticMode=validateV3DiagnosticMode(
    env.AGENT36_V3_DIAGNOSTIC_MODE??'sanitized-only');
  candidateOpponentRoleSeats({candidateSeat,opponentSeat});
  if(witnessOnly)assert.ok(expectedActorSeat===0||expectedActorSeat===1,
    'native no-game witness requires an expected physical actor seat');
  const repositoryRoot=ROOT;
  const enginePin=env.AGENT36_TWINLEAF_COMMIT_SHA;
  const runnerRevision=env.GITHUB_SHA;
  assert.equal(enginePin,V3_FIXTURE.engineCommit,'fixture must use the reviewed pinned Twinleaf commit');
  assert.match(runnerRevision||'',/^[0-9a-f]{40}$/i,'fixture requires the exact research revision');
  const candidatePolicy=loadWorkerPolicyModule(repositoryRoot,V3_FIXTURE.candidateWorkerPolicyPath,'candidate');
  const opponentPolicy=loadWorkerPolicyModule(repositoryRoot,V3_FIXTURE.opponentWorkerPolicyPath,'opponent');
  const registeredSeed=witnessOnly?null:(seedRegistrationInput??readPublicSeedRegistration({
    repositoryRoot,artifactRef:env.AGENT36_V3_PREDEAL_ARTIFACT_REF,enginePin,
    candidatePolicyVersion:candidatePolicy.POLICY_VERSION,
    opponentPolicyVersion:opponentPolicy.POLICY_VERSION
  }));
  const seedRegistration=registeredSeed?.registration??null;
  const fixtureSeed=witnessOnly?seed:seedRegistration?.seed;
  assert.ok(typeof fixtureSeed==='string'&&fixtureSeed.trim().length>0,
    'fixture execution requires a freshly registered public seed; no hard-coded seed fallback exists');
  const trialId=witnessOnly?
    V3_FIXTURE.trialId+'-no-game-witness-candidate-seat-'+candidateSeat+'-actor-seat-'+expectedActorSeat:
    seedRegistration.trialId+'-candidate-seat-'+candidateSeat;
  const runOutputDir=outputDir??path.join(ROOT,V3_FIXTURE.outputDir,
    witnessOnly?'no-game-witness/candidate-seat-'+candidateSeat+'-actor-seat-'+expectedActorSeat:
      'candidate-seat-'+candidateSeat);
  if(!witnessOnly)verifyNoGameWitnessReceipt({
    receiptPath:env.AGENT36_V3_NO_GAME_WITNESS_RECEIPT,env,repositoryRoot
  });

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
    seedDisclosureDecision,
    seed:fixtureSeed,
    seedRegistration,
  });
  const policyConstraintsSha256 = evidenceBundleSha256(constraints);
  const candidateManifestResult = buildFixtureRoleEntryManifest({
    repositoryRoot,enginePin,runnerRevision,
    entrypoint:V3_FIXTURE.hostRoleEntrypointPath,
    commonRuntimeBindings:V3_FIXTURE_WORKER_COMMON_BINDINGS,
    orderedPromptChain:V3_FIXTURE_WORKER_PROMPT_CHAIN,
    additionalDataAssetPaths:[V3_FIXTURE.candidateWorkerPolicyPath],
  });
  const opponentManifestResult = buildFixtureRoleEntryManifest({
    repositoryRoot,enginePin,runnerRevision,
    entrypoint:V3_FIXTURE.hostRoleEntrypointPath,
    commonRuntimeBindings:V3_FIXTURE_WORKER_COMMON_BINDINGS,
    orderedPromptChain:V3_FIXTURE_WORKER_PROMPT_CHAIN,
    additionalDataAssetPaths:[V3_FIXTURE.opponentWorkerPolicyPath],
  });
  const manifestResult=roleIdentity.combineRolePolicyEntryManifests(
    candidateManifestResult,opponentManifestResult
  );
  const challengeSuiteSha256 = fixtureChallengeSuiteSha256(candidateManifestResult.manifest);
  const combined = manifestResult;

  // Hash-check role policy entrypoints but never evaluate them in the host. Only the
  // Docker VM loads candidate/opponent policy source; ordinary host dependencies are
  // preloaded and pinned through the existing CommonJS guard.
  const workerOnlyPolicyPaths=[candidatePolicy.sourcePath,opponentPolicy.sourcePath];
  const workerOnlyPolicyHashes={
    [candidatePolicy.sourcePath]:candidatePolicy.policySha256,
    [opponentPolicy.sourcePath]:opponentPolicy.policySha256
  };
  const hostPreload=preloadRoleHostModules({
    repositoryRoot,expectedByPath:combined.expectedByPath,
    workerOnlyPaths:workerOnlyPolicyPaths,workerOnlyHashes:workerOnlyPolicyHashes
  });
  const cacheEntries = fixtureRuntimePin.fixtureRolePolicyCacheEntries(
    repositoryRoot,hostPreload.hostExpectedByPath
  );
  const preparedRuntime = prepareV3RoleRuntimeEvidence({
    repositoryRoot,
    candidateManifest: candidateManifestResult,
    opponentManifest: opponentManifestResult,
    cardPoolInitialization: native.cardPoolInitialization,
    identityHelper: roleIdentity,
    cacheEntries,
    workerOnlyPaths:workerOnlyPolicyPaths,
    workerOnlyHashes:workerOnlyPolicyHashes,
    hostExpectedByPath:hostPreload.hostExpectedByPath
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
    seedRegistration,
  });
  // The serializer is a hashed data asset, not part of either role-policy closure.
  // Capture its function reference before the fixture pin and pass only that callback
  // to the native helper; the pin may evict the module from require.cache.
  const diagnostic = require('../../twinleaf/2026-11/agent43-full-state-diagnostic.cjs');
  // Capture the host-only recorder module and function references before the
  // fixture-scoped role pin evicts non-role research modules from require.cache.
  // The recorder observes the live Store only in encrypted-full mode; it is
  // never added to either worker's common bindings or request protocol.
  const fullStateTraceModule=diagnosticMode==='encrypted-full'&&!witnessOnly?
    require('../../twinleaf/2026-11/agent45/full-state-trace.cjs'):null;
  const fullStateTraceRecorder=fullStateTraceModule?
    fullStateTraceModule.createFullStateTraceRecorder({
      label:trialId,
      seed:fixtureSeed,
      limits:{maxSteps:2048,maxDepth:64,maxNodes:50000}
      // Agent45's optional policyConfiguration is omitted: Twinleaf botOptions
      // are engine setup, not the candidate/opponent worker policy identities.
    }):null;
  let fullStateTraceLiveStore=null;
  let fullStateTraceInitialCaptured=false;
  let fullStateTraceFinalCaptured=false;

  const preGameTrial = {
    trialId: trialId,
    fixtureOnly: true,
    physicalSeedDisclosureDecision:seedDisclosureDecision,
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
    seed:fixtureSeed,
    seedRegistrationId:seedRegistration?.registrationId??null,
    seedRegistrationSha256:registeredSeed?.registrationSha256??null,
    seedRegistrationGitBlobSha:registeredSeed?.registrationGitBlobSha??null,
  };

  const processLockToken=acquireNativeFixtureProcessLock('agent36-v3-fixture-runner');
  let restoreHook=null;
  let pinned;
  let workerAuditForFailure=null;
  let runnerStage='runner-hook-install';
  let runnerFailure=null;
  const runnerCleanupFailures=[];
  try {
    restoreHook=hookModule.installUnderworldDoorPsychicRecipientHook();
    assert.equal(restoreHook.isInstalled,true,
      'Underworld compatibility hook must install before role wrappers');
    runnerStage='fixture-pin';
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
          seedDisclosureDecision,
        });
        workerAuditForFailure=workerAudit;
        const bundles=[];
        const sessions=[];
        const lifecycleFailure=(role,error)=>{
          const row=workerAudit.roles[role];
          const code=typeof error?.code==='string'&&/^[A-Z0-9_]{1,64}$/.test(error.code)?
            error.code:'WORKER_START_FAILURE';
          row.failureCount++;
          row.lastFailureCode=code;
          if(code.includes('TIMEOUT'))row.timeoutCount++;
          const stderr=String(error?.stderrTail??'');
          const drawMatch=/POLICY_RANDOM_DRAWS_UNREPLAYABLE policyDrawCount=(\d+)/.exec(stderr);
          if(drawMatch){
            row.policyDrawCount=Number(drawMatch[1]);
            row.policyDrawCounts.push(Number(drawMatch[1]));
            row.policyDrawViolationCount++;
            row.policyRngReplayable=false;
            workerAudit.policyRngViolations++;
            workerAudit.replayableEvidence=false;
          }else if(stderr.includes('POLICY_RANDOM_DRAWS_UNREPLAYABLE')){
            row.policyDrawCount=null;
            row.policyDrawViolationCount++;
            row.policyRngReplayable=false;
            workerAudit.policyRngViolations++;
            workerAudit.replayableEvidence=false;
          }
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
          assert.equal(candidateBundle.policySha256,candidatePolicy.policySha256,
            'candidate policy source changed after role-manifest static audit');
          assert.equal(opponentBundle.policySha256,opponentPolicy.policySha256,
            'opponent policy source changed after role-manifest static audit');
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
            seed:fixtureSeed,
            native,
            botOptionsBySeat:native.botOptionsBySeat,
            maxActions:V3_FIXTURE.maxActions,
            stopBeforeLiveDispatch:witnessOnly,
            expectedActorSeat:witnessOnly?expectedActorSeat:null,
            // No-game witnesses remain actor-only even if an owner key is
            // configured; full private snapshots are reserved for registered games.
            diagnosticSnapshot:diagnosticMode==='encrypted-full'&&!witnessOnly?
              diagnostic.snapshotFullGameState:undefined,
            requireFullStateDiagnostics:diagnosticMode==='encrypted-full'&&!witnessOnly,
            processLockToken,
            onStoreCreated(store){
              const hook=installPromptProvenanceHook(store);
              provenanceContext.current=hook;
              return hook;
            },
            onGameReady:fullStateTraceRecorder?({store,state})=>{
              assert.equal(fullStateTraceInitialCaptured,false,
                'Agent45 recorder initial Store snapshot must be captured exactly once');
              assert.strictEqual(state,store.state,
                'Agent45 recorder must receive the live Store state');
              fullStateTraceLiveStore=store;
              const publicBoard=publicStateSnapshot(state).players;
              fullStateTraceRecorder.captureInitial(state,publicBoard,
                fullStateTraceModule.summarizeNativeStateForText(state,publicBoard));
              fullStateTraceInitialCaptured=true;
            }:undefined,
            onAction:fullStateTraceRecorder?(record,{store,state,action,pendingPrompt})=>{
              assert.equal(fullStateTraceInitialCaptured,true,
                'Agent45 recorder must start after both players register');
              assert.strictEqual(store,fullStateTraceLiveStore,
                'Agent45 recorder must remain attached to the original live Store');
              assert.strictEqual(state,store.state,
                'Agent45 recorder must receive the exact post-dispatch Store state');
              assert.equal(record.dispatchStatus,'succeeded',
                'Agent45 recorder may capture only accepted live dispatches');
              assert.ok(Number.isSafeInteger(record.actionOrdinal)&&record.actionOrdinal>=0,
                'native dispatch ordinal must be a zero-based integer');
              const publicBoard=publicStateSnapshot(state).players;
              fullStateTraceRecorder.captureStep({
                state,action,
                actionOrdinal:record.actionOrdinal+1,
                playerSlot:record.actingSeat,
                playerId:record.actingPlayerId,
                actionType:record.actionName??record.actionType??null,
                turnBefore:record.turnBefore,
                turnAfter:state.turn,
                phaseBefore:record.phaseBefore,
                phaseAfter:state.phase,
                publicBoard,
                humanSummary:fullStateTraceModule.summarizeNativeStateForText(state,publicBoard),
                pendingPrompt
              });
              if(state.phase===native.GamePhase.FINISHED){
                assert.equal(fullStateTraceFinalCaptured,false,
                  'Agent45 recorder final Store snapshot must be captured exactly once');
                fullStateTraceRecorder.captureFinal(state);
                fullStateTraceFinalCaptured=true;
              }
            }:undefined,
          },createV3WorkerDecisionResolver({
            sessionsBySeat,
            candidateSeat:candidateSeat,
            opponentSeat:opponentSeat,
            native,
            workerAudit,
            provenanceContext,
            expectedActorSeat,
            stopBeforeLiveDispatch:witnessOnly,
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
          return {
            fixtureFailure:projectV3RoleFailureForReceipt(error),
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
  } catch(error) {
    runnerFailure=error;
  } finally {
    if(restoreHook) {
      try { restoreHook(); }
      catch(error) { runnerCleanupFailures.push({stage:'runner-hook-restore',error}); }
    }
    try { releaseNativeFixtureProcessLock(processLockToken); }
    catch(error) { runnerCleanupFailures.push({stage:'runner-lock-release',error}); }
  }
  if(restoreHook&&restoreHook.isRestored!==true) {
    runnerCleanupFailures.push({
      stage:'runner-hook-restore-verification',
      error:new Error('Underworld compatibility hook restoration was not verified')
    });
  }
  if(pinned&&pinned.audit?.guardRestored!==true) {
    runnerCleanupFailures.push({
      stage:'fixture-pin-restore-verification',
      error:new Error('fixture-scoped runtime guard restoration was not verified')
    });
  }
  const normalizedOuterResult=pinned?
    normalizeV3FixtureRoleResult(pinned.result):null;
  const nestedRoleFailure=normalizedOuterResult?.failureEnvelope?.fixtureFailure??null;
  const runnerFailureError=buildV3RunnerFailureError({
    runnerFailure,nestedRoleFailure,runnerCleanupFailures,runnerStage,
    workerAudit:workerAuditForFailure??normalizedOuterResult?.workerExecutionAudit
  });
  if(runnerFailureError)throw runnerFailureError;
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

  if(witnessOnly){
    if(failureEnvelope){
      const error=new Error('Native V3 no-game witness failed: '+(failureEnvelope.fixtureFailure?.code??'UNKNOWN'));
      error.code=failureEnvelope.fixtureFailure?.code??'NO_GAME_WITNESS_FAILED';
      error.fixtureFailure=projectV3FixtureFailureForReceipt(
        failureEnvelope.fixtureFailure,{stage:'worker-execution'}
      );
      error.workerAudit=projectV3WorkerAuditForFailure(workerExecutionAudit);
      throw error;
    }
    assert.equal(gameResult?.schema,'agent49-native-no-game-witness-v1');
    assert.equal(gameResult.gameExecuted,false);
    assert.equal(gameResult.nativeStoreCreated,true);
    assert.equal(gameResult.bothPlayersRegistered,true);
    assert.equal(gameResult.nativeActionFrontierUsed,true);
    assert.equal(gameResult.nativeValidationStoreMode,'cloned-store');
    assert.equal(gameResult.hostStoppedBeforeLiveDispatch,true);
    assert.equal(gameResult.actorSeat,expectedActorSeat);
    assert.equal(gameResult.actualFirstPlayerSeat,expectedActorSeat);
    assert.equal(gameResult.actorObservationUsed,true);
    assert.equal(gameResult.selectedActionValidated,true);
    assert.equal(gameResult.fullOriginalStoreStateUnchanged,true);
    assert.equal(gameResult.liveActionDispatched,false);
    assert.equal(gameResult.acceptedRootActions,0);
    assert.equal(gameResult.promptProvenanceHook?.installed,true);
    assert.equal(gameResult.promptProvenanceHook?.restored,true);
    assert.equal(pinned.audit?.guardRestored,true);
    assert.equal(workerExecutionAudit?.cleanupVerified,true);
    assert.equal(workerExecutionAudit?.totalFailures,0);
    assert.equal(workerExecutionAudit?.cleanupFailureCount,0);
    assert.equal(workerExecutionAudit?.replayableEvidence,true);
    const role=expectedActorSeat===candidateSeat?'candidate':'opponent';
    const roleAudit=workerExecutionAudit.roles[role];
    const otherRole=role==='candidate'?'opponent':'candidate';
    const otherAudit=workerExecutionAudit.roles[otherRole];
    assert.equal(roleAudit.seat,expectedActorSeat);
    assert.equal(roleAudit.rootDecisionCount,1);
    assert.equal(otherAudit.rootDecisionCount,0);
    assert.equal(roleAudit.actionFrontierAdmissionFailureCount,0);
    assert.equal(roleAudit.policyRngReplayable,true);
    const allWorkerSessionsClosed=Object.values(workerExecutionAudit.roles).every(row=>
      row.workerProcessClosed===true&&row.containerRemoved===true&&row.policyBundleRemoved===true);
    assert.equal(allWorkerSessionsClosed,true);
    assert.equal(workerExecutionAudit.workerProcessPerRole,true);
    assert.equal(workerExecutionAudit.physicalSeedDisclosedToWorker,false);
    assert.equal(workerExecutionAudit.policySeedDisclosedToWorker,false);
    assert.equal(workerExecutionAudit.nativeStateDisclosedToWorker,false);
    assert.equal(workerExecutionAudit.opponentPrivateZonesDisclosedToWorker,false);
    const actorOnlyWorkerInput=workerExecutionAudit.workerProcessPerRole===true&&
      workerExecutionAudit.physicalSeedDisclosedToWorker===false&&
      workerExecutionAudit.policySeedDisclosedToWorker===false&&
      workerExecutionAudit.nativeStateDisclosedToWorker===false&&
      workerExecutionAudit.opponentPrivateZonesDisclosedToWorker===false;
    assert.equal(actorOnlyWorkerInput,true);
    const witnessReceipt={
      schema:'agent36-v3-native-no-game-seat-witness-v1',
      fixtureOnly:true,
      gameExecuted:false,
      nativeStoreCreated:gameResult.nativeStoreCreated,
      bothPlayersRegistered:gameResult.bothPlayersRegistered,
      nativeActionFrontierUsed:gameResult.nativeActionFrontierUsed,
      nativeValidationStoreMode:gameResult.nativeValidationStoreMode,
      hostStoppedBeforeLiveDispatch:gameResult.hostStoppedBeforeLiveDispatch,
      candidateSeat,opponentSeat,actorSeat:expectedActorSeat,
      role,seed:fixtureSeed,seed32:gameResult.seed32,
      actualFirstPlayerSeat:gameResult.actualFirstPlayerSeat,
      actorObservationUsed:gameResult.actorObservationUsed,
      selectedActionValidated:gameResult.selectedActionValidated,
      validationActionKind:gameResult.validationActionKind,
      actionFrontierItemCount:gameResult.actionFrontierItemCount,
      fullOriginalStoreStateUnchanged:gameResult.fullOriginalStoreStateUnchanged,
      liveActionDispatched:gameResult.liveActionDispatched,
      acceptedRootActions:gameResult.acceptedRootActions,
      rootDecisionCount:roleAudit.rootDecisionCount,
      workerDecisionCount:roleAudit.decisionCount,
      policySha256:roleAudit.policySha256,
      policyVersion:roleAudit.policyVersion,
      workerCleanupVerified:workerExecutionAudit.cleanupVerified,
      allWorkerSessionsClosed,
      actorOnlyWorkerInput,
      nativeStateDisclosedToWorker:workerExecutionAudit.nativeStateDisclosedToWorker,
      opponentPrivateZonesDisclosedToWorker:workerExecutionAudit.opponentPrivateZonesDisclosedToWorker,
      physicalSeedDisclosedToWorker:workerExecutionAudit.physicalSeedDisclosedToWorker,
      policySeedDisclosedToWorker:workerExecutionAudit.policySeedDisclosedToWorker,
      workerInputScope:workerExecutionAudit.workerInputScope,
      workerFailureCount:workerExecutionAudit.totalFailures,
      policyRngReplayable:workerExecutionAudit.replayableEvidence,
      candidatePolicySha256:workerExecutionAudit.roles.candidate.policySha256,
      opponentPolicySha256:workerExecutionAudit.roles.opponent.policySha256,
      candidatePolicyVersion:candidatePolicy.POLICY_VERSION,
      opponentPolicyVersion:opponentPolicy.POLICY_VERSION,
      researchRevisionSha:runnerRevision,
      twinleafCommitSha:enginePin,
      candidatePrinted60Sha256:V3_FIXTURE.candidateDeckSha256,
      opponentPrinted60Sha256:V3_FIXTURE.opponentDeckSha256,
      promptProvenanceHookRestored:true,
      runtimePinGuardRestored:pinned.audit.guardRestored
    };
    fs.mkdirSync(runOutputDir,{recursive:true});
    const witnessPath=path.join(runOutputDir,'native-no-game-seat-witness.json');
    writeJsonAtomic(witnessPath,witnessReceipt);
    return {...witnessReceipt,outputPath:path.relative(repositoryRoot,witnessPath).split(path.sep).join('/')};
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
  const fullStateTraceResult=fullStateTraceRecorder?.result()??null;
  const fullStateTraceText=fullStateTraceRecorder?.text()??null;
  // V3-native setup owner prompts are already resolved by the worker decision
  // resolver. Summarize their native receipts only in the encrypted-full trace.
  const setupPromptAudit=fullStateTraceRecorder?buildSetupPromptAudit({
    candidateSeat,opponentSeat,
    decisionTrace:gameResult?.decisionTrace??[],
    rootActionLedger:gameResult?.rootActionLedger??[],
    workerExecutionAudit,
    fullStateTraceSteps:fullStateTraceResult?.steps??[]
  }):null;
  const setupPromptAuditAcceptance=fullStateTraceRecorder?{
    schema:'agent19-agent36-v3-native-setup-prompt-audit-acceptance-v1',
    complete:setupPromptAudit?.complete===true,
    accepted:setupPromptAudit?.accepted===true,
    setupPromptDecisionCount:setupPromptAudit?.setupPromptDecisions??0,
    startingBasicPromptCount:
      (setupPromptAudit?.roles?.candidate?.counts?.startingBasics??0)+
      (setupPromptAudit?.roles?.opponent?.counts?.startingBasics??0),
    goFirstPromptCount:
      (setupPromptAudit?.roles?.candidate?.counts?.goFirst??0)+
      (setupPromptAudit?.roles?.opponent?.counts?.goFirst??0),
    setupPromptAuditSha256:setupPromptAudit?
      evidenceBundleSha256(setupPromptAudit):null,
    failures:setupPromptAudit?.failures??['setup-prompt-audit-missing']
  }:null;
  const workerExecutionBoundary=fullStateTraceRecorder?
    projectV3WorkerExecutionBoundaryToTrial(workerExecutionAudit,{
      candidateSeat,opponentSeat,setupPromptAudit
    }):null;
  const workerExecutionBoundarySha256=workerExecutionBoundary?
    evidenceBundleSha256(workerExecutionBoundary):null;
  const fullStateTraceAcceptedActionCount=gameResult?.actions??
    gameResult?.acceptedActions??failureEnvelope?.fixtureGamePartial?.acceptedActions??null;
  const fullStateTraceStepCountMatches=Number.isSafeInteger(fullStateTraceAcceptedActionCount)&&
    fullStateTraceResult?.stepCount===fullStateTraceAcceptedActionCount;
  const fullStateTraceSteps=Array.isArray(fullStateTraceResult?.steps)?fullStateTraceResult.steps:[];
  const fullStateTraceStepArrayMatches=fullStateTraceSteps.length===fullStateTraceAcceptedActionCount;
  const fullStateTraceRootLedger=Array.isArray(gameResult?.rootActionLedger)?gameResult.rootActionLedger:[];
  const fullStateTraceDecisionRows=Array.isArray(gameResult?.decisionTrace)?gameResult.decisionTrace:[];
  const fullStateTraceAggregateHashMatches=
    evidenceBundleSha256(fullStateTraceDecisionRows)===gameResult?.decisionTraceSha256&&
    evidenceBundleSha256(fullStateTraceRootLedger)===gameResult?.rootActionLedgerSha256;
  const fullStateTraceJoins=validateV3FullStateTraceJoins({
    steps:fullStateTraceSteps,
    rootActionLedger:fullStateTraceRootLedger,
    decisionRows:fullStateTraceDecisionRows
  });
  const fullStateTraceOrdinalJoinMatches=fullStateTraceJoins.ordinalJoinMatches;
  const fullStateTraceDecisionJoinMatches=fullStateTraceJoins.decisionJoinMatches&&
    fullStateTraceJoins.publicStateJoinMatches;
  const fullStateTraceWorkerDecisionRows=fullStateTraceDecisionRows.filter(row=>
    row.decisionKind==='owner-root'||row.decisionKind==='owner-prompt');
  const fullStateTraceWorkerAuditComplete=fullStateTraceWorkerDecisionRows.length>0&&
    fullStateTraceWorkerDecisionRows.every(validateV3WorkerDecisionTrace);
  const fullStateTraceWorkerDecisionCountMatches=Number.isSafeInteger(workerExecutionAudit?.totalWorkerDecisions)&&
    fullStateTraceWorkerDecisionRows.length===workerExecutionAudit.totalWorkerDecisions;
  const fullStateTraceAcceptance=fullStateTraceRecorder?{
    schema:'agent19-agent45-v3-full-state-trace-acceptance-v2',
    initialCaptured:fullStateTraceInitialCaptured,
    finalCaptured:fullStateTraceFinalCaptured,
    complete:fullStateTraceResult?.complete===true,
    captureErrorClear:fullStateTraceResult?.captureError===null,
    publicBoardError:fullStateTraceResult?.publicBoardError??null,
    humanSummaryError:fullStateTraceResult?.humanSummaryError??null,
    publicBoardProjectionComplete:fullStateTraceResult?.publicBoardError===null,
    humanSummaryComplete:fullStateTraceResult?.humanSummaryError===null,
    textAvailable:typeof fullStateTraceText==='string'&&fullStateTraceText.length>0,
    stepCount:fullStateTraceResult?.stepCount??null,
    acceptedActionCount:fullStateTraceAcceptedActionCount,
    stepCountMatches:fullStateTraceStepCountMatches,
    stepArrayMatches:fullStateTraceStepArrayMatches,
    aggregateHashMatches:fullStateTraceAggregateHashMatches,
    rootLedgerCount:fullStateTraceRootLedger.length,
    ordinalJoinMatches:fullStateTraceOrdinalJoinMatches,
    decisionTraceJoinMatches:fullStateTraceDecisionJoinMatches,
    workerDecisionCount:fullStateTraceWorkerDecisionRows.length,
    workerDecisionAuditComplete:fullStateTraceWorkerAuditComplete,
    workerDecisionCountMatches:fullStateTraceWorkerDecisionCountMatches,
    naturalTerminal:gameResult?.finished===true&&gameResult?.endReason==='engine-game-end',
    accepted:fullStateTraceInitialCaptured&&fullStateTraceFinalCaptured&&
      validateV3FullStateTraceRecorderResult(fullStateTraceResult)&&
      fullStateTraceResult?.publicBoardError===null&&
      fullStateTraceResult?.humanSummaryError===null&&
      typeof fullStateTraceText==='string'&&fullStateTraceText.length>0&&
      fullStateTraceStepCountMatches&&fullStateTraceStepArrayMatches&&
      fullStateTraceAggregateHashMatches&&
      fullStateTraceOrdinalJoinMatches&&fullStateTraceDecisionJoinMatches&&
      fullStateTraceWorkerAuditComplete&&fullStateTraceWorkerDecisionCountMatches&&
      gameResult?.finished===true&&gameResult?.endReason==='engine-game-end'
  }:null;
  if(!failureEnvelope&&fullStateTraceRecorder&&!fullStateTraceAcceptance.accepted){
    failureEnvelope={
      fixtureFailure:{
        name:'FullStateTraceIncomplete',
        code:'FULL_STATE_TRACE_INCOMPLETE',
        stage:'full-state-trace-acceptance',
        messageSha256:createHash('sha256').update(JSON.stringify(fullStateTraceAcceptance)).digest('hex'),
        nativeFixtureFailure:null
      },
      fixtureGamePartial:gameResult?.finished===true?null:gameResult
    };
  }
  if(!failureEnvelope&&fullStateTraceRecorder&&!setupPromptAuditAcceptance.accepted){
    failureEnvelope={
      fixtureFailure:{
        name:'SetupPromptAuditIncomplete',
        code:'SETUP_PROMPT_AUDIT_INCOMPLETE',
        stage:'setup-prompt-audit',
        messageSha256:evidenceBundleSha256(setupPromptAuditAcceptance),
        nativeFixtureFailure:null
      },
      fixtureGamePartial:gameResult?.finished===true?null:gameResult
    };
  }
  if(!failureEnvelope&&fullStateTraceRecorder&&!workerExecutionBoundary?.valid){
    failureEnvelope={
      fixtureFailure:{
        name:'V3WorkerExecutionBoundaryIncomplete',
        code:'V3_WORKER_EXECUTION_BOUNDARY_INCOMPLETE',
        stage:'v3-worker-execution-boundary',
        messageSha256:evidenceBundleSha256(workerExecutionBoundary),
        nativeFixtureFailure:null
      },
      fixtureGamePartial:gameResult?.finished===true?null:gameResult
    };
  }
  const partial = failureEnvelope?.fixtureGamePartial ?? null;
  const gameCompleted = !failureEnvelope && gameResult?.finished === true && gameResult?.endReason === 'engine-game-end';

  const patchReceipt = createUnderworldRuntimePatchReceipt({ restoreHook, moduleSha256: hookModuleSha256 });
  const trial = {
    trialId: trialId,
    fixtureOnly: true,
    physicalSeedDisclosureDecision:seedDisclosureDecision,
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
    seed: fixtureSeed,
    seed32: gameResult?.seed32 ?? partial?.seed32 ?? null,
    seedRegistration:seedRegistration??null,
    seedRegistrationId:seedRegistration?.registrationId??null,
    seedRegistrationSha256:registeredSeed?.registrationSha256??null,
    seedRegistrationGitBlobSha:registeredSeed?.registrationGitBlobSha??null,
    seedRegistrationRef:registeredSeed?.artifactRef??null,
    actorOnlyExecutionBoundary: projectActorOnlyBoundaryToTrial(roleResult),
    actorOnlyExecutionBoundaryApplicable:false,
    workerExecutionBoundary,
    workerExecutionBoundarySha256,
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
  if (gameResult?.seed !== undefined) assert.equal(gameResult.seed, fixtureSeed, 'native game must preserve the registered public seed label');
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
    diagnosticMode,
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
    seedRegistration:seedRegistration??null,
    seedRegistrationSha256:registeredSeed?.registrationSha256??null,
    seedRegistrationGitBlobSha:registeredSeed?.registrationGitBlobSha??null,
    preDealFixtureEnvelope: {
      fixtureOnly: true,
      ready: true,
      policyPlanSha256: policyPlan.policyPlanSha256,
      policyRegistration: policyPlan.policyRegistration,
      policyAttestationBundle: policyPlan.policyAttestationBundle,
      seedRegistration:seedRegistration??null,
      seedRegistrationSha256:registeredSeed?.registrationSha256??null,
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
    actorOnlyExecutionBoundaryApplicable:trial.actorOnlyExecutionBoundaryApplicable,
    workerExecutionBoundary:trial.workerExecutionBoundary,
    workerExecutionBoundarySha256:trial.workerExecutionBoundarySha256,
    runtimePinEvidence,
    runtimePinAudit: pinned.audit,
    runtimePatchReceipts: [patchReceipt],
    nativeGame: gameResult,
    ...(fullStateTraceRecorder?{
      fullStateTrace:fullStateTraceResult,
      fullStateTraceAcceptance,
      setupPromptAudit,
      setupPromptAuditAcceptance
    }:{}),
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
      actorOnlyExecutionBoundaryApplicable:trial.actorOnlyExecutionBoundaryApplicable===true,
      actorOnlyExecutionBoundaryValid:trial.actorOnlyExecutionBoundaryApplicable===true?
        trial.actorOnlyExecutionBoundary?.valid===true:null,
      workerExecutionBoundaryValid:trial.workerExecutionBoundary?.valid===true,
      workerExecutionBoundarySha256:trial.workerExecutionBoundarySha256??null,
      workerDecisionCount:workerExecutionAudit?.totalWorkerDecisions??0,
      workerHostOnlyPromptCount:workerExecutionAudit?.totalHostOnlyPrompts??0,
      workerAbstentionCount:workerExecutionAudit?.totalAbstentions??0,
      workerFailureCount:workerExecutionAudit?.totalFailures??0,
      candidateWorkerDecisionCount:workerExecutionAudit?.roles?.candidate?.decisionCount??0,
      opponentWorkerDecisionCount:workerExecutionAudit?.roles?.opponent?.decisionCount??0,
      workerCleanupFailureCount:workerExecutionAudit?.cleanupFailureCount??0,
      setupPromptAuditAccepted:setupPromptAuditAcceptance?.accepted===true,
      setupPromptDecisionCount:setupPromptAudit?.setupPromptDecisions??0,
      setupPromptAuditSha256:setupPromptAuditAcceptance?.setupPromptAuditSha256??null,
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
    `actorOnlyExecutionBoundaryApplicable=false`,
    `actorOnlyExecutionBoundarySha256=${application?.receipt?.actorOnlyExecutionBoundarySha256 ?? 'unavailable'}`,
    `workerExecutionBoundaryValid=${trial.workerExecutionBoundary?.valid===true}`,
    `workerExecutionBoundarySha256=${trial.workerExecutionBoundarySha256??'unavailable'}`,
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
  ...(setupPromptAudit?[
    '',
    '=== ENCRYPTED ACTOR-OWNED SETUP PROMPT AUDIT ===',
    JSON.stringify({setupPromptAudit,setupPromptAuditAcceptance},null,2)
  ]:[]),
  ...(fullStateTraceText?[
    '',
    '=== AGENT45 HOST-ONLY OFFLINE FULL-STATE TRACE ===',
    fullStateTraceText
  ]:[]),
  ].join('\n');
  const sanitizedOnly=diagnosticMode==='sanitized-only';
  const persistedArtifact=sanitizedOnly?
    sanitizedDiagnostic.sanitizeFixtureArtifact(artifact):artifact;
  fs.mkdirSync(runOutputDir,{recursive:true});
  const outputPath = path.join(runOutputDir,sanitizedOnly?
    'fixture-game.sanitized.json':'fixture-game.json');
  writeJsonAtomic(outputPath,persistedArtifact);
  const persistedTraceText=sanitizedOnly?
    sanitizedDiagnostic.formatSanitizedTraceText(persistedArtifact):traceText;
  const traceTextPath = path.join(runOutputDir,sanitizedOnly?
    'fixture-game.sanitized.txt':'fixture-game.txt');
  fs.writeFileSync(traceTextPath,persistedTraceText,'utf8');
  process.stdout.write((failureEnvelope ? 'Native V3 fixture game failed; partial diagnostics preserved: ' : 'Native V3 fixture game completed: ') + outputPath + ' mode='+diagnosticMode+'\n');
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
    decisionTraceSha256: sanitizedOnly?
      persistedArtifact.game.actorDecisionsSha256:gameResult.decisionTraceSha256,
    roleApplicationReceiptSha256: sanitizedOnly?null:application?.receipt?.receiptSha256??null,
    diagnosticMode,
    fixtureOnly: true,
    competitiveGameQualified: false,
  };
}

function resolveNoGameWitnessSeedPrompt(request,{candidateSeat,opponentSeat,attemptIndex=null}={}) {
  assert.ok(request&&typeof request==='object',
    'no-game seed probe prompt request is required');
  const prompt=request.prompt;
  assert.ok(prompt&&typeof prompt==='object',
    'no-game seed probe owner prompt is required');
  assert.equal(typeof request.native?.ResolvePromptAction,'function',
    'native ResolvePromptAction is required for deterministic setup probe decisions');
  const name=prompt.constructor?.name??'';
  if(name==='ConfirmPrompt'&&prompt.message==='GO_FIRST'){
    return new request.native.ResolvePromptAction(prompt.id,true);
  }
  if(name==='ShowMulliganPrompt'&&
      (prompt.message==='SETUP_PLAYER_NO_BASIC'||prompt.message==='SETUP_OPPONENT_NO_BASIC')&&
      request.state?.phase===1&&prompt.options?.allowCancel===false){
    const ownerId=prompt.getPerspectivePlayerId?.()??prompt.playerId;
    const ownerSeat=Array.isArray(request.state?.players)
      ?request.state.players.findIndex(player=>player?.id===ownerId):-1;
    if((request.actorSeat!==0&&request.actorSeat!==1)||ownerSeat!==request.actorSeat){
      const error=new Error('seed probe encountered a mulligan history prompt not owned by the physical actor seat');
      error.code='NO_GAME_WITNESS_SETUP_INCOMPATIBLE';
      error.seedProbeReason='mulliganPromptOwnerMismatch';
      error.safePromptIdentity=captureNoGameWitnessSafePromptIdentity(
        request,attemptIndex,{promptOwnerSeat:ownerSeat,ownerSeatMatchesActor:false}
      );
      throw error;
    }
    // Mirror the native UI's null acknowledgement. Never read concealed prompt.hands.
    return new request.native.ResolvePromptAction(prompt.id,null);
  }
  if(name==='SelectPrompt'&&prompt.message==='WANT_TO_DRAW_CARDS'){
    const values=Array.isArray(prompt.values)?prompt.values:[];
    const allowCancel=prompt.options?.allowCancel===true;
    if(values.length===0||allowCancel||values.some((value,index)=>
      value!==`Draw ${values.length-1-index} card(s)`)){
      const error=new Error('seed probe encountered a mulligan prompt outside the frozen worker setup contract');
      error.code='NO_GAME_WITNESS_SETUP_INCOMPATIBLE';
      error.seedProbeReason='mulliganPromptShape';
      throw error;
    }
    return new request.native.ResolvePromptAction(prompt.id,0);
  }
  if(name==='ChooseCardsPrompt'&&prompt.message==='CHOOSE_STARTING_POKEMONS'){
    if(request.state?.phase!==1||prompt.options?.allowCancel===true||
        prompt.options?.isSecret===true){
      const error=new Error('seed probe encountered an incompatible starting-Pokémon prompt shape');
      error.code='NO_GAME_WITNESS_SETUP_INCOMPATIBLE';
      error.seedProbeReason='startingPokemonPromptShape';
      throw error;
    }
    const minimum=prompt.options?.min;
    const maximum=prompt.options?.max;
    if(!Number.isSafeInteger(minimum)||!Number.isSafeInteger(maximum)||
        (minimum!==0&&minimum!==1)||maximum<minimum){
      const error=new Error('seed probe encountered invalid starting-Pokémon selection bounds');
      error.code='NO_GAME_WITNESS_SETUP_INCOMPATIBLE';
      error.seedProbeReason='startingPokemonBounds';
      throw error;
    }
    const cards=Array.isArray(prompt.cards?.cards)?prompt.cards.cards:[];
    const blocked=new Set(Array.isArray(prompt.options?.blocked)?prompt.options.blocked:[]);
    const visibleIndices=cards.map((_,index)=>index).filter(index=>!blocked.has(index));
    if(visibleIndices.length<minimum){
      const error=new Error('seed probe found too few legal starting-Pokémon choices');
      error.code='NO_GAME_WITNESS_SETUP_INCOMPATIBLE';
      error.seedProbeReason='startingPokemonInsufficientChoices';
      throw error;
    }
    if(request.actorSeat===opponentSeat){
      const active=request.state.players?.[request.actorSeat]?.active;
      const hasGetPokemonCard=typeof active?.getPokemonCard==='function';
      const activePokemonPresent=hasGetPokemonCard?Boolean(active.getPokemonCard()):null;
      const activeCardsLength=Array.isArray(active?.cards)?active.cards.length:null;
      const activeSlotOccupied=activeCardsLength===null?null:activeCardsLength>0;
      const hasActive=hasGetPokemonCard?activePokemonPresent===true:activeSlotOccupied===true;
      if((minimum===1&&hasActive)||(minimum===0&&!hasActive)){
        const error=new Error('seed probe found a starting-Pokémon state outside the frozen opponent worker contract');
        error.code='NO_GAME_WITNESS_SETUP_INCOMPATIBLE';
        error.seedProbeReason='opponentActiveStateMismatch';
        const promptOwnerSeat=Array.isArray(request.state?.players)
          ?request.state.players.findIndex(player=>player?.id===prompt.playerId):-1;
        const mismatchBranch=minimum===1?'minimum-one-has-active':'minimum-zero-no-active';
        error.safePromptIdentity=captureNoGameWitnessSafePromptIdentity(
          request,attemptIndex,{
            opponentSeat,promptOwnerSeat,
            ownerSeatMatchesActor:promptOwnerSeat===request.actorSeat,
            activeCardsLength,hasGetPokemonCard,activePokemonPresent,
            activeSlotOccupied,mismatchBranch
          }
        );
        throw error;
      }
    }
    const selected=visibleIndices.slice(0,maximum);
    if(selected.length<minimum){
      const error=new Error('seed probe could not satisfy the starting-Pokémon minimum');
      error.code='NO_GAME_WITNESS_SETUP_INCOMPATIBLE';
      error.seedProbeReason='startingPokemonMinimumUnmet';
      throw error;
    }
    const validation=nativePromptProjection.validateRawPromptResult(
      prompt,selected,request.state
    );
    assert.equal(validation.valid,true,
      'seed-probe starting-Pokémon result failed native decode/validation');
    return new request.native.ResolvePromptAction(prompt.id,validation.decoded);
  }
  const error=new Error('seed probe encountered an owner prompt outside the frozen setup contract');
  error.code='NO_GAME_WITNESS_SETUP_INCOMPATIBLE';
  error.seedProbeReason='unsupportedOwnerPrompt';
  error.safePromptIdentity=captureNoGameWitnessSafePromptIdentity(request,attemptIndex);
  throw error;
}

function classifyNoGameWitnessSeedProbeFailure({
  error,observedActorSeat,targetActorSeat,seed
}={}) {
  if(error?.code==='NO_GAME_WITNESS_SETUP_INCOMPATIBLE'){
    const setupReason=NO_GAME_WITNESS_SEED_PROBE_REASON_KEYS.includes(error.seedProbeReason)
      ? error.seedProbeReason : 'otherSetupIncompatible';
    const safePromptIdentity=[
      'unsupportedOwnerPrompt','opponentActiveStateMismatch','mulliganPromptOwnerMismatch'
    ].includes(setupReason)?
      projectNoGameWitnessSafePromptIdentity(
        error?.safePromptIdentity??error?.cause?.safePromptIdentity
      ):null;
    return {
      kind:'retry',reason:'setup-incompatible',setupReason,
      ...(safePromptIdentity?{safePromptIdentity}:{})
    };
  }
  if(error?.code!=='NO_GAME_WITNESS_SEED_PROBE_STOP')throw error;
  if(observedActorSeat===targetActorSeat)return {kind:'found',seed};
  if(observedActorSeat!==null){
    return {kind:'retry',reason:'wrong-seat-root',observedActorSeat};
  }
  throw error;
}

async function findNoGameWitnessSeed({
  native,deckA,deckB,playerNames,candidateSeat,opponentSeat,targetActorSeat
}={}) {
  const setupIncompatibleByReason=Object.fromEntries(NO_GAME_WITNESS_SEED_PROBE_REASON_KEYS.map(key=>[key,0]));
  const wrongSeatRootCounts={seat0:0,seat1:0,unknown:0};
  let attempts=0;
  let firstUnsupportedPrompt=null;
  let attempt4UnsupportedPrompt=null;
  for(let attempt=0;attempt<64;attempt++){
    attempts++;
    const seed='agent49-v3-no-game-witness-'+candidateSeat+'-'+targetActorSeat+'-probe-'+attempt;
    let observedActorSeat=null;
    try{
      await runNativeFixtureGameAsync({
        native,deckA,deckB,playerNames,candidateSeat,
        originalSourceSeat:opponentSeat,seed,
        botOptionsBySeat:native.botOptionsBySeat,
        policySeedBySeat:[0x243f6a88,0x85a308d3],
        maxActions:null
      },request=>{
        if(request.decisionKind==='owner-root'){
          observedActorSeat=request.actorSeat;
          const error=new Error('seed probe intentionally stops before the first strategic root action');
          error.code='NO_GAME_WITNESS_SEED_PROBE_STOP';
          throw error;
        }
        if(request.decisionKind==='owner-prompt')
          return resolveNoGameWitnessSeedPrompt(request,{candidateSeat,opponentSeat,attemptIndex:attempt});
        throw new Error('seed probe encountered an unsupported native decision request');
      });
    }catch(error){
      const disposition=classifyNoGameWitnessSeedProbeFailure({
        error,observedActorSeat,targetActorSeat,seed
      });
      if(disposition.kind==='found')return disposition.seed;
      if(disposition.kind==='retry'){
        if(disposition.safePromptIdentity){
          if(firstUnsupportedPrompt===null)firstUnsupportedPrompt=disposition.safePromptIdentity;
          if(disposition.safePromptIdentity.attemptIndex===4)
            attempt4UnsupportedPrompt=disposition.safePromptIdentity;
        }
        if(disposition.reason==='setup-incompatible'){
          const key=NO_GAME_WITNESS_SEED_PROBE_REASON_KEYS.includes(disposition.setupReason)?disposition.setupReason:'otherSetupIncompatible';
          setupIncompatibleByReason[key]++;
        }else if(disposition.reason==='wrong-seat-root'){
          const key=disposition.observedActorSeat===0?'seat0':disposition.observedActorSeat===1?'seat1':'unknown';
          wrongSeatRootCounts[key]++;
        }
        continue;
      }
    }
  }
  const error=new Error('could not find a deterministic public setup seed for physical actor seat '+targetActorSeat);
  error.seedProbeSummary=projectNoGameWitnessSeedProbeSummary({
    candidateSeat,targetActorSeat,attempts,setupIncompatibleByReason,wrongSeatRootCounts,
    firstUnsupportedPrompt,attempt4UnsupportedPrompt
  });
  throw error;
}

async function runV3NativeNoGameWitness({
  env=process.env,
  outputPath=path.join(ROOT,'artifacts/agent36-v3-fixture/native-no-game-witness.json')
}={}) {
  const enginePin=env.AGENT36_TWINLEAF_COMMIT_SHA;
  const runnerRevision=env.GITHUB_SHA;
  assert.equal(enginePin,V3_FIXTURE.engineCommit,
    'native no-game witness must use the reviewed pinned Twinleaf commit');
  assert.match(runnerRevision??'',GIT_SHA,
    'native no-game witness requires the exact research revision');
  const candidateBytes=fs.readFileSync(path.join(ROOT,V3_FIXTURE.candidatePath));
  const fieldBytes=fs.readFileSync(path.join(ROOT,V3_FIXTURE.fieldPath));
  const admissionBytes=fs.readFileSync(path.join(ROOT,V3_FIXTURE.originalAdmissionPath));
  const candidateDeck=JSON.parse(candidateBytes.toString('utf8'));
  const field=JSON.parse(fieldBytes.toString('utf8'));
  const opponentDeck=field.decks.find(deck=>deck.rank===1);
  const admission=JSON.parse(admissionBytes.toString('utf8'));
  const rank1Admission=admission.rows.find(row=>row.rank===1);
  assert.equal(gitBlobSha(candidateBytes),V3_FIXTURE.candidateGitBlobSha);
  assert.equal(gitBlobSha(fieldBytes),V3_FIXTURE.fieldGitBlobSha);
  assert.equal(admission.sourceGitBlobSha,V3_FIXTURE.fieldGitBlobSha);
  assert.equal(rank1Admission?.rosterGitBlobSha,V3_FIXTURE.fieldGitBlobSha);
  assert.equal(rank1Admission?.competitivelyQualified,false);
  assert.equal(printed60Fingerprint(candidateDeck),V3_FIXTURE.candidateDeckSha256);
  assert.equal(printed60Fingerprint(opponentDeck),V3_FIXTURE.opponentDeckSha256);
  const candidatePolicy=loadWorkerPolicyModule(ROOT,V3_FIXTURE.candidateWorkerPolicyPath,'candidate');
  const opponentPolicy=loadWorkerPolicyModule(ROOT,V3_FIXTURE.opponentWorkerPolicyPath,'opponent');
  const native=loadNativeRoleDependencies({enginePin});
  const allCards=native.CardManager.getInstance().getAllCards();
  const candidateResolved=resolvePrintedDeck(candidateDeck,allCards,
    {label:'native no-game witness candidate deck'});
  const opponentResolved=resolvePrintedDeck(opponentDeck,allCards,
    {label:'native no-game witness Aichi rank-1 opponent deck'});
  assert.equal(candidateResolved.total,60);
  assert.equal(opponentResolved.total,60);
  assert.equal(typeof native.ActionEnumerator,'function');
  assert.equal(typeof native.Simulator,'function');
  const witnesses=[];
  for(const candidateSeat of [0,1]){
    const opponentSeat=1-candidateSeat;
    const assignment=resolveFixtureSeatAssignment({
      candidateSeat,opponentSeat,
      candidateDeck:candidateResolved.fullNames,
      opponentDeck:opponentResolved.fullNames
    });
    for(const actorSeat of [0,1]){
      let seed=null;
      try {
        seed=await findNoGameWitnessSeed({
          native,deckA:assignment.deckA,deckB:assignment.deckB,
          playerNames:assignment.playerNames,candidateSeat,opponentSeat,
          targetActorSeat:actorSeat
        });
        const witness=await runV3FixtureGame({
          env,candidateSeat,opponentSeat,seed,witnessOnly:true,
          expectedActorSeat:actorSeat,
          outputDir:path.join(ROOT,V3_FIXTURE.outputDir,'native-no-game-witness',
            'candidate-seat-'+candidateSeat+'-actor-seat-'+actorSeat)
        });
        witnesses.push(stripNoGameWitnessArtifactPath(witness));
      } catch(error) {
        const failureReceipt=buildNoGameWitnessFailureReceipt({
          error,candidateSeat,opponentSeat,actorSeat,
          stage:seed===null?'seed-probe':'native-no-game-witness',
          runnerRevision,enginePin,candidatePolicy,opponentPolicy,
          completedWitnesses:witnesses
        });
        const failurePath=path.join(ROOT,V3_FIXTURE.outputDir,'native-no-game-witness',
          'failure-candidate-seat-'+candidateSeat+'-actor-seat-'+actorSeat+'.json');
        writeJsonAtomic(failurePath,failureReceipt);
        process.stderr.write(JSON.stringify({
          status:'NATIVE_NO_GAME_WITNESS_FAILED',
          failureStage:failureReceipt.failureStage,
          completedWitnessCount:failureReceipt.completedWitnessCount,
          fixtureFailure:{
            code:failureReceipt.fixtureFailure?.code??null,
            stage:failureReceipt.fixtureFailure?.stage??null
          },
          seedProbeSummary:failureReceipt.seedProbeSummary??null
        },null,2)+'\n');
        const failureError=new Error(
          'Native V3 no-game witness failed; privacy-safe failure receipt preserved.'
        );
        failureError.code=failureReceipt.fixtureFailure.code;
        failureError.failureReceiptPath=path.relative(ROOT,failurePath).split(path.sep).join('/');
        throw failureError;
      }
    }
  }
  const receipt={
    schema:'agent36-v3-native-no-game-witness-v1',
    fixtureOnly:true,
    gameExecuted:false,
    liveActionsDispatched:witnesses.some(witness=>witness.liveActionDispatched===true),
    allStoreStatesUnchanged:witnesses.every(witness=>witness.fullOriginalStoreStateUnchanged===true),
    allSelectedActionsValidated:witnesses.every(witness=>witness.selectedActionValidated===true),
    allActorObservationsUsed:witnesses.every(witness=>witness.actorObservationUsed===true),
    allWorkersClosed:witnesses.every(witness=>witness.allWorkerSessionsClosed===true),
    allWorkerPoliciesActorOnly:witnesses.every(witness=>witness.actorOnlyWorkerInput===true),
    generatedAt:new Date().toISOString(),
    researchRevisionSha:runnerRevision,
    twinleafCommitSha:enginePin,
    candidatePrinted60Sha256:V3_FIXTURE.candidateDeckSha256,
    opponentPrinted60Sha256:V3_FIXTURE.opponentDeckSha256,
    candidatePolicySha256:candidatePolicy.policySha256,
    opponentPolicySha256:opponentPolicy.policySha256,
    candidatePolicyVersion:candidatePolicy.POLICY_VERSION,
    opponentPolicyVersion:opponentPolicy.POLICY_VERSION,
    coverage:['0:0','0:1','1:0','1:1'],
    witnesses
  };
  validateNoGameWitnessReceipt(receipt,{
    researchRevisionSha:runnerRevision,twinleafCommitSha:enginePin,
    candidatePrinted60Sha256:V3_FIXTURE.candidateDeckSha256,
    opponentPrinted60Sha256:V3_FIXTURE.opponentDeckSha256,
    candidatePolicySha256:candidatePolicy.policySha256,
    opponentPolicySha256:opponentPolicy.policySha256,
    candidatePolicyVersion:candidatePolicy.POLICY_VERSION,
    opponentPolicyVersion:opponentPolicy.POLICY_VERSION
  });
  writeJsonAtomic(outputPath,receipt);
  process.stdout.write(JSON.stringify({
    status:'NATIVE_NO_GAME_WITNESS_VERIFIED',
    researchRevisionSha:runnerRevision,twinleafCommitSha:enginePin,
    coverage:receipt.coverage,outputPath:path.relative(ROOT,outputPath).split(path.sep).join('/')
  },null,2)+'\n');
  return {...receipt,outputPath:path.relative(ROOT,outputPath).split(path.sep).join('/')};
}

function runV3CompiledSeatWitness({
  env=process.env,
  outputPath=path.join(ROOT,'artifacts/agent36-v3-fixture/compiled-seat-witness.json')
}={}) {
  const enginePin=env.AGENT36_TWINLEAF_COMMIT_SHA;
  const runnerRevision=env.GITHUB_SHA;
  assert.equal(enginePin,V3_FIXTURE.engineCommit,
    'compiled seat witness must use the reviewed pinned Twinleaf commit');
  assert.match(runnerRevision??'',GIT_SHA,
    'compiled seat witness requires the exact research revision');
  const candidateBytes=fs.readFileSync(path.join(ROOT,V3_FIXTURE.candidatePath));
  const fieldBytes=fs.readFileSync(path.join(ROOT,V3_FIXTURE.fieldPath));
  const admissionBytes=fs.readFileSync(path.join(ROOT,V3_FIXTURE.originalAdmissionPath));
  const candidateDeck=JSON.parse(candidateBytes.toString('utf8'));
  const field=JSON.parse(fieldBytes.toString('utf8'));
  const opponentDeck=field.decks.find(deck=>deck.rank===1);
  const admission=JSON.parse(admissionBytes.toString('utf8'));
  const rank1Admission=admission.rows.find(row=>row.rank===1);
  assert.equal(gitBlobSha(candidateBytes),V3_FIXTURE.candidateGitBlobSha,
    'compiled seat witness candidate source blob changed');
  assert.equal(gitBlobSha(fieldBytes),V3_FIXTURE.fieldGitBlobSha,
    'compiled seat witness Aichi field source blob changed');
  assert.equal(admission.sourceGitBlobSha,V3_FIXTURE.fieldGitBlobSha,
    'compiled seat witness admission ledger does not bind the frozen field');
  assert.equal(rank1Admission?.rosterGitBlobSha,V3_FIXTURE.fieldGitBlobSha,
    'compiled seat witness rank-1 admission does not bind the frozen field');
  assert.equal(rank1Admission?.competitivelyQualified,false,
    'compiled seat witness must preserve the unqualified admission status');
  assert.equal(printed60Fingerprint(candidateDeck),V3_FIXTURE.candidateDeckSha256,
    'compiled seat witness candidate printed-60 fingerprint changed');
  assert.equal(printed60Fingerprint(opponentDeck),V3_FIXTURE.opponentDeckSha256,
    'compiled seat witness opponent printed-60 fingerprint changed');
  const native=loadNativeRoleDependencies({enginePin});
  const allCards=native.CardManager.getInstance().getAllCards();
  const candidateResolved=resolvePrintedDeck(candidateDeck,allCards,
    {label:'compiled V3 candidate deck'});
  const opponentResolved=resolvePrintedDeck(opponentDeck,allCards,
    {label:'compiled V3 rank-1 opponent deck'});
  assert.equal(candidateResolved.total,60);
  assert.equal(opponentResolved.total,60);
  assert.equal(typeof native.ActionEnumerator,'function',
    'compiled Twinleaf ActionEnumerator is unavailable');
  assert.equal(typeof native.Simulator,'function',
    'compiled Twinleaf Simulator is unavailable');
  const seatWitnesses=[0,1].map(candidateSeat=>{
    const opponentSeat=1-candidateSeat;
    const assignment=resolveFixtureSeatAssignment({
      candidateSeat,opponentSeat,
      candidateDeck:candidateResolved.fullNames,
      opponentDeck:opponentResolved.fullNames
    });
    assert.deepEqual(assignment.roleSeatMap,{candidate:candidateSeat,opponent:opponentSeat});
    const expectedDeckA=candidateSeat===0?
      candidateResolved.fullNames:opponentResolved.fullNames;
    const expectedDeckB=candidateSeat===1?
      candidateResolved.fullNames:opponentResolved.fullNames;
    assert.deepEqual(assignment.deckA,expectedDeckA,
      'physical seat A does not receive the correct role deck');
    assert.deepEqual(assignment.deckB,expectedDeckB,
      'physical seat B does not receive the correct role deck');
    return {
      candidateSeat,opponentSeat,
      candidatePhysicalDeck:candidateSeat===0?'A':'B',
      opponentPhysicalDeck:opponentSeat===0?'A':'B',
      candidateCardCount:candidateResolved.total,
      opponentCardCount:opponentResolved.total,
      candidateEngineDeckSha256:evidenceBundleSha256(candidateResolved.fullNames),
      opponentEngineDeckSha256:evidenceBundleSha256(opponentResolved.fullNames)
    };
  });
  const witness={
    schema:'agent36-v3-compiled-seat-witness-v1',
    fixtureOnly:true,
    gameExecuted:false,
    twinleafCommitSha:enginePin,
    researchRevisionSha:runnerRevision,
    cardPoolInitializationSha256:evidenceBundleSha256(native.cardPoolInitialization),
    cardPoolCount:allCards.length,
    actionEnumeratorAvailable:true,
    simulatorAvailable:true,
    candidatePrinted60Sha256:V3_FIXTURE.candidateDeckSha256,
    opponentPrinted60Sha256:V3_FIXTURE.opponentDeckSha256,
    seatWitnesses
  };
  writeJsonAtomic(outputPath,witness);
  process.stdout.write(JSON.stringify(witness,null,2)+'\\n');
  return {...witness,outputPath:path.relative(ROOT,outputPath).split(path.sep).join('/')};
}

async function runV3FixtureGameBothSeats({env=process.env,outputDirRoot=path.join(ROOT,V3_FIXTURE.outputDir)}={}) {
  const results=[];
  const candidatePolicy=loadWorkerPolicyModule(ROOT,V3_FIXTURE.candidateWorkerPolicyPath,'candidate');
  const opponentPolicy=loadWorkerPolicyModule(ROOT,V3_FIXTURE.opponentWorkerPolicyPath,'opponent');
  const seedRegistration=readPublicSeedRegistration({
    repositoryRoot:ROOT,artifactRef:env.AGENT36_V3_PREDEAL_ARTIFACT_REF,
    enginePin:env.AGENT36_TWINLEAF_COMMIT_SHA,
    candidatePolicyVersion:candidatePolicy.POLICY_VERSION,
    opponentPolicyVersion:opponentPolicy.POLICY_VERSION
  });
  verifyNoGameWitnessReceipt({
    receiptPath:env.AGENT36_V3_NO_GAME_WITNESS_RECEIPT,env,repositoryRoot:ROOT
  });
  for(const candidateSeat of [0,1]) {
    try {
      results.push(await runV3FixtureGame({
        env,candidateSeat,opponentSeat:1-candidateSeat,
        seedRegistrationInput:seedRegistration,
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
  if(command==='native-no-game-witness'){
    return runV3NativeNoGameWitness({env});
  }
  if(command==='verify-no-game-witness'){
    const receiptPath=args[0]||env.AGENT36_V3_NO_GAME_WITNESS_RECEIPT;
    const receipt=verifyNoGameWitnessReceipt({receiptPath,env});
    process.stdout.write(JSON.stringify({status:'NO_GAME_WITNESS_VERIFIED',
      researchRevisionSha:receipt.researchRevisionSha,
      twinleafCommitSha:receipt.twinleafCommitSha,
      coverage:receipt.coverage
    },null,2)+'\n');
    return receipt;
  }
  if(command==='validate-seed-registration'){
    const candidatePolicy=loadWorkerPolicyModule(ROOT,V3_FIXTURE.candidateWorkerPolicyPath,'candidate');
    const opponentPolicy=loadWorkerPolicyModule(ROOT,V3_FIXTURE.opponentWorkerPolicyPath,'opponent');
    const registration=readPublicSeedRegistration({
      repositoryRoot:ROOT,
      artifactRef:args[0]||env.AGENT36_V3_PREDEAL_ARTIFACT_REF,
      enginePin:env.AGENT36_TWINLEAF_COMMIT_SHA,
      candidatePolicyVersion:candidatePolicy.POLICY_VERSION,
      opponentPolicyVersion:opponentPolicy.POLICY_VERSION
    });
    process.stdout.write(JSON.stringify({
      status:'PUBLIC_SEED_REGISTRATION_VALIDATED',
      registrationId:registration.registration.registrationId,
      trialId:registration.registration.trialId,
      seedSha256:createHash('sha256').update(registration.registration.seed,'utf8').digest('hex'),
      registrationSha256:registration.registrationSha256,
      registrationGitBlobSha:registration.registrationGitBlobSha,
      artifactRef:registration.artifactRef
    },null,2)+'\n');
    return registration;
  }
  if(command==='fixture-game'){
    const result=await runV3FixtureGameBothSeats({env});
    process.stdout.write(JSON.stringify(result,null,2)+'\n');
    return result;
  }
  if(command==='compiled-seat-witness'){
    return runV3CompiledSeatWitness({env});
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
  throw new Error('Usage: node agent36-v3-runner.cjs fixture-game | native-no-game-witness | verify-no-game-witness <receipt-ref> | validate-seed-registration <registration-ref> | compiled-seat-witness | predeal <committed-predeal-ref> | postgame <predeal-ref> <trial-ref> <persistence-receipt-ref> [application-receipt-ref evidence-map-ref [reviews-ref] [policy-panel-receipts-ref]] | build-bundle <predeal-ref> <trial-ref> <persistence-receipt-ref> <deal-receipt-ref> <application-receipt-ref> <evidence-map-ref> [reviews-ref] [policy-panel-receipts-ref]');
}

if(require.main===module){
  main().catch(error=>{
    process.stderr.write(String(error?.stack||error)+'\n');
    process.exitCode=1;
  });
}

module.exports={GIT_SHA,RUN_ID,PREDEAL_FIELDS,V3_FIXTURE,V3_FIXTURE_TEST_PATHS,policyEnvironmentAllowlist,
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
  projectActorOnlyBoundaryToTrial,
  revalidatePreDealPersistenceReceipt,
  revalidateDealGenerationReceipt,writeJsonAtomic,main,
  printed60Fingerprint,
  resolvePrintedDeck,resolveFixtureSeatAssignment,candidateOpponentRoleSeats,assertTrustedActionSelection,validatePhysicalSeedDisclosureDecision,validateV3DiagnosticMode,
  buildFixtureRoleEntryManifest,
  fixtureChallengeSuiteSha256,
  loadWorkerPolicyModule,buildRoleWorkerBundle,loadNativeRoleDependencies,V3_FIXTURE,
  assertWorkerOnlyPolicyPathsAbsentFromHostClosure,preloadRoleHostModules,
  createV3WorkerExecutionAudit,createV3WorkerDecisionResolver,validateV3WorkerDecisionTrace,validateV3FullStateTraceJoins,validateV3FullStateTraceRecorderResult,
  buildFixturePolicyConstraints,
  buildFixtureRoleIdentities,
  buildFixturePolicyPlan,
  createUnderworldRuntimePatchReceipt,
  normalizeV3FixtureRoleResult,
  runV3FixtureGame,runV3FixtureGameBothSeats,runV3CompiledSeatWitness,
  validatePublicSeedRegistration,readPublicSeedRegistration,
  validateNoGameWitnessReceipt,verifyNoGameWitnessReceipt,
  projectNativeFixtureFailureForReceipt,projectV3FixtureFailureForReceipt,
  projectV3RoleFailureForReceipt,projectV3WorkerAuditForFailure,buildNoGameWitnessFailureReceipt,buildV3RunnerFailureError,
  resolveNoGameWitnessSeedPrompt,classifyNoGameWitnessSeedProbeFailure,
  findNoGameWitnessSeed,stripNoGameWitnessArtifactPath,runV3NativeNoGameWitness
};
