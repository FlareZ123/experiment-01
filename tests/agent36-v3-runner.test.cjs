'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {evidenceBundleSha256}=require('../simulation/evaluation/canonical-evidence-json.cjs');
const {
  validateArtifactRef,gitBlobSha,verifyPersistedPreDeal,collectPreDealPersistenceReceipt,
  collectDealGenerationReceipt,fetchWorkflowJobs,runCandidateOpponentPolicyRoles,
  combineAndPinV3RoleRuntime,initializeNativeCardPool,buildV3BundleFromArtifacts,
  revalidatePreDealPersistenceReceipt,revalidateDealGenerationReceipt,
  bindFixtureFormatToApplicationReceipt,buildFixtureRoleIdentities,
  resolveFixtureSeatAssignment,candidateOpponentRoleSeats,loadWorkerPolicyModule,
  assertTrustedActionSelection,validatePhysicalSeedDisclosureDecision,validateV3DiagnosticMode,runV3FixtureGame,normalizeV3FixtureRoleResult,
  V3_FIXTURE,V3_FIXTURE_TEST_PATHS,V3_FIXTURE_COMMON_BINDINGS,
  V3_FIXTURE_WORKER_COMMON_BINDINGS,V3_FIXTURE_WORKER_PROMPT_CHAIN,
  buildFixtureRoleEntryManifest,buildRoleWorkerBundle,preloadRoleHostModules,
  validatePublicSeedRegistration,validateNoGameWitnessReceipt,validateV3WorkerDecisionTrace,validateV3FullStateTraceJoins,validateV3FullStateTraceRecorderResult,
  buildNoGameWitnessFailureReceipt,buildV3RunnerFailureError,
  createV3WorkerExecutionAudit,createV3WorkerDecisionResolver,
  projectNativeFixtureFailureForReceipt,projectV3FixtureFailureForReceipt,
  projectV3RoleFailureForReceipt,projectV3WorkerAuditForFailure,isNoGameWitnessSetupPromptAudit,
  resolveNoGameWitnessSeedPrompt,classifyNoGameWitnessSeedProbeFailure,
  runV3NativeNoGameWitness,runV3CompiledSeatWitness,stripNoGameWitnessArtifactPath,policyEnvironmentAllowlist
}=require('../simulation/evaluation/2026-11/agent36-v3-runner.cjs');
const roleIdentity=require('../simulation/evaluation/2026-11/agent42-role-policy-identity.cjs');
const {cleanupPolicyBundle}=require('../simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs');
const {buildSetupPromptAudit,projectV3WorkerExecutionBoundaryToTrial}=require('../simulation/evaluation/2026-11/agent19-setup-prompt-audit.cjs');
const {
  preparePreDealPolicyRegistration,
  revalidatePreDealPolicyRegistration
}=require('../simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs');

test('host environment snapshot transport is never allowlisted into role workers',()=>{
  assert.deepEqual(policyEnvironmentAllowlist([
    'GITHUB_SHA','RUNNER_TEMP','AGENT36_POLICY_ENV_SNAPSHOT_JSON',
    'POLICY_A','POLICY_B','POLICY_A'
  ]),['POLICY_A','POLICY_B']);
});

const STEP='Generate physical deal';

function rootResolverFixture({
  actorObservation=null,actorObservationSha256=null,responsePatch={},dispatchError=null,
  publicEventReceipt=null
}={}) {
  const workerAudit=createV3WorkerExecutionAudit({candidateSeat:0,opponentSeat:1});
  const policyVersion='runner-root-audit-test-v1';
  const observation=actorObservation??Object.freeze({
    actorSeat:1,decisionKind:'owner-root',phase:'PLAYER_TURN',
    globalTurn:3,ownHand:['distinctive-root-actor-input']
  });
  const item={
    token:'root-action-0',kind:'attack',attackName:'Max Geist',
    publicMetadata:{damage:250,stadiumEffectLive:true}
  };
  const frontierBinding={schema:require('../simulation/evaluation/2026-11/agent49-policy-protocol.cjs').FRONTIER_SCHEMA,items:[item]};
  const policyAudit={
    schema:'agent6-policy-audit-v1',policyVersion,
    decisionKind:'owner-root',decisionType:'select-action',
    selectionRuleCode:'ROOT_SCORE_DESC',tieBreakCode:'FIRST_NATIVE_ORDER',
    selectedTokens:[item.token],
    evaluations:[{token:item.token,status:'scored',score:12,reasonCode:null}]
  };
  const response={
    requestId:'runner-root-audit-request',sequence:1,role:'opponent',seat:1,
    policyVersion,bundleSha256:'c'.repeat(64),
    decision:{kind:'select-action',token:item.token},
    policyAudit,policyDrawCount:0,
    ...responsePatch
  };
  const calls={worker:0,seenObservation:null,cloneValidation:0,liveStoreDispatch:0};
  const actionEnumerator={
    createKnownCapFreeActionEnumerator(){return {schema:'test-known-cap-free-enumerator-v1'};},
    assertKnownCapFreeAdapterAdmissionClear(){return {schema:'test-frontier-admission-v1',accepted:true};}
  };
  const actionFrontier={
    buildNativeActionFrontier(){
      return {
        actionFrontier:frontierBinding,
        actionByToken:new Map([[item.token,{kind:'native-action'}]]),
        diagnostics:{}
      };
    },
    dispatchSelectedNativeAction(args){
      calls.cloneValidation++;
      if(dispatchError)throw dispatchError;
      Object.assign(args.validationEvidence,{
        nativeValidationStoreMode:'cloned-store',
        fullOriginalStoreStateUnchanged:true,
        actorSeat:1
      });
      return {kind:'native-action'};
    }
  };
  const resolver=createV3WorkerDecisionResolver({
    sessionsBySeat:{
      1:{async decide(input){
        calls.worker++;
        calls.seenObservation=input.observation;
        return response;
      }}
    },
    candidateSeat:0,opponentSeat:1,
    native:{
      observe(){throw new Error('resolver must consume the exact driver-supplied actor observation');},
      ActionEnumerator:class ActionEnumerator {},
      Simulator:class Simulator {}
    },
    workerAudit,eventReceipt:()=>publicEventReceipt,
    actionEnumerator,actionFrontier
  });
  const request={
    kind:'native-fixture-decision',decisionKind:'owner-root',
    actorSeat:1,actionOrdinal:5,
    actorObservation:observation,
    actorObservationSha256:actorObservationSha256??evidenceBundleSha256(observation),
    state:{activePlayer:1},prompt:null,
    store:{state:{},dispatch(){calls.liveStoreDispatch++;}},
    withValidationRandom:fn=>fn()
  };
  return {
    resolver,request,workerAudit,calls,actorObservation:observation,
    item,frontierBinding,policyAudit,response
  };
}


test('V3 no-game seed probe resolves GO_FIRST affirmatively without invoking the neutral bot',()=>{
  class ConfirmPrompt {
    constructor(id,message){this.id=id;this.message=message;}
  }
  const actions=[];
  class ResolvePromptAction {
    constructor(promptId,value){
      this.promptId=promptId;
      this.value=value;
      actions.push({promptId,value});
    }
  }
  let legacyCalls=0;
  const action=resolveNoGameWitnessSeedPrompt({
    prompt:new ConfirmPrompt('go-first-prompt','GO_FIRST'),
    native:{ResolvePromptAction},
    legacyBot:{decodeNextAction(){legacyCalls++;return null;}}
  });
  assert.deepEqual(actions,[{promptId:'go-first-prompt',value:true}]);
  assert.equal(action.promptId,'go-first-prompt');
  assert.equal(action.value,true);
  assert.equal(legacyCalls,0);
});

test('V3 no-game seed probe acknowledges native mulligan history without reading concealed hands',()=>{
  class ShowMulliganPrompt {
    constructor(id,message,allowCancel=false,playerId=null){
      this.id=id;
      this.message=message;
      this.playerId=playerId;
      this.options={allowCancel};
      Object.defineProperty(this,'hands',{
        get(){throw new Error('concealed mulligan hands must not be read');}
      });
    }
  }
  const actions=[];
  class ResolvePromptAction {
    constructor(promptId,value){
      this.promptId=promptId;
      this.value=value;
      actions.push({promptId,value});
    }
  }
  const players=[{id:'physical-player-0'},{id:'physical-player-1'}];
  const cases=[
    {actorSeat:0,message:'SETUP_PLAYER_NO_BASIC'},
    {actorSeat:1,message:'SETUP_PLAYER_NO_BASIC'},
    {actorSeat:0,message:'SETUP_OPPONENT_NO_BASIC'},
    {actorSeat:1,message:'SETUP_OPPONENT_NO_BASIC'}
  ];
  for(const [index,item] of cases.entries()){
    const action=resolveNoGameWitnessSeedPrompt({
      prompt:new ShowMulliganPrompt('mulligan-'+index,item.message,false,players[item.actorSeat].id),
      native:{ResolvePromptAction},
      state:{phase:1,players},
      actorSeat:item.actorSeat
    },{candidateSeat:0,opponentSeat:1,attemptIndex:index});
    assert.equal(action.promptId,'mulligan-'+index);
    assert.equal(action.value,null);
  }
  assert.deepEqual(actions,cases.map((item,index)=>({
    promptId:'mulligan-'+index,value:null
  })));
});

test('V3 no-game seed probe rejects non-native or out-of-phase mulligan history prompts',()=>{
  class ShowMulliganPrompt {
    constructor(id,message,allowCancel,playerId){
      this.id=id;
      this.message=message;
      this.playerId=playerId;
      this.options={allowCancel};
    }
  }
  class OtherPrompt extends ShowMulliganPrompt {}
  class ResolvePromptAction {
    constructor(promptId,value){this.promptId=promptId;this.value=value;}
  }
  const players=[{id:'physical-player-0'},{id:'physical-player-1'}];
  const invalid=[
    {prompt:new ShowMulliganPrompt('wrong-phase','SETUP_OPPONENT_NO_BASIC',false,'physical-player-0'),phase:2,actorSeat:0,reason:'unsupportedOwnerPrompt'},
    {prompt:new ShowMulliganPrompt('cancelable','SETUP_OPPONENT_NO_BASIC',true,'physical-player-0'),phase:1,actorSeat:0,reason:'unsupportedOwnerPrompt'},
    {prompt:new ShowMulliganPrompt('missing-cancel-flag','SETUP_OPPONENT_NO_BASIC',undefined,'physical-player-0'),phase:1,actorSeat:0,reason:'unsupportedOwnerPrompt'},
    {prompt:new ShowMulliganPrompt('wrong-message','OTHER_SETUP_PROMPT',false,'physical-player-0'),phase:1,actorSeat:0,reason:'unsupportedOwnerPrompt'},
    {prompt:new OtherPrompt('wrong-class','SETUP_OPPONENT_NO_BASIC',false,'physical-player-0'),phase:1,actorSeat:0,reason:'unsupportedOwnerPrompt'},
    {prompt:new ShowMulliganPrompt('wrong-owner','SETUP_OPPONENT_NO_BASIC',false,'physical-player-1'),phase:1,actorSeat:0,reason:'mulliganPromptOwnerMismatch'},
    {prompt:new ShowMulliganPrompt('missing-owner','SETUP_OPPONENT_NO_BASIC',false,undefined),phase:1,actorSeat:0,reason:'mulliganPromptOwnerMismatch'}
  ];
  for(const item of invalid){
    assert.throws(()=>resolveNoGameWitnessSeedPrompt({
      prompt:item.prompt,native:{ResolvePromptAction},
      state:{phase:item.phase,players},actorSeat:item.actorSeat
    },{candidateSeat:0,opponentSeat:1,attemptIndex:0}),error=>
      error.code==='NO_GAME_WITNESS_SETUP_INCOMPATIBLE'&&
      error.seedProbeReason===item.reason);
  }
});

test('V3 no-game seed probe preserves bounded Active-slot diagnostics without card identities',()=>{
  class ChooseCardsPrompt {
    constructor(id,minimum,maximum,playerId){
      this.id=id;
      this.playerId=playerId;
      this.message='CHOOSE_STARTING_POKEMONS';
      this.options={min:minimum,max:maximum,allowCancel:false,isSecret:false};
      this.cards={cards:minimum===1?[{hiddenCardIdentity:'must-not-leak'}]:[]};
    }
  }
  class ResolvePromptAction {
    constructor(promptId,value){this.promptId=promptId;this.value=value;}
  }
  const cases=[
    {
      minimum:1,maximum:6,activeCards:[{hiddenCardIdentity:'active-secret'}],
      activePokemonPresent:true,activeSlotOccupied:true,
      mismatchBranch:'minimum-one-has-active'
    },
    {
      minimum:0,maximum:2,activeCards:[],
      activePokemonPresent:false,activeSlotOccupied:false,
      mismatchBranch:'minimum-zero-no-active'
    },
    {
      minimum:0,maximum:2,activeCards:[{hiddenCardIdentity:'active-secret'}],
      activePokemonPresent:false,activeSlotOccupied:true,
      mismatchBranch:'minimum-zero-no-active'
    }
  ];
  for(const [index,item] of cases.entries()){
    const state={
      phase:1,activePlayer:0,
      players:[
        {id:'physical-player-0',active:{cards:[]}},
        {id:'physical-player-1',active:{
          cards:item.activeCards,
          getPokemonCard(){return item.activePokemonPresent?{hiddenCardIdentity:'active-secret'}:null;}
        }}
      ]
    };
    const request={
      prompt:new ChooseCardsPrompt('starting-pokemon-'+index,item.minimum,item.maximum,'physical-player-1'),
      native:{ResolvePromptAction},state,actorSeat:1
    };
    let error;
    try{
      resolveNoGameWitnessSeedPrompt(request,{
        candidateSeat:0,opponentSeat:1,attemptIndex:index
      });
      assert.fail('expected the opponent Active-state mismatch guard to reject this prompt');
    }catch(failure){
      error=failure;
    }
    assert.equal(error?.code,'NO_GAME_WITNESS_SETUP_INCOMPATIBLE');
    assert.equal(error?.seedProbeReason,'opponentActiveStateMismatch');
    const classified=classifyNoGameWitnessSeedProbeFailure({
      error,observedActorSeat:null,targetActorSeat:1,seed:'diagnostic-only'
    });
    assert.equal(classified.kind,'retry');
    assert.equal(classified.setupReason,'opponentActiveStateMismatch');
    assert.deepEqual(classified.safePromptIdentity,{
      schema:'agent49-v3-safe-prompt-identity-v1',
      attemptIndex:index,
      promptClass:'ChooseCardsPrompt',
      message:'CHOOSE_STARTING_POKEMONS',
      phase:1,
      actorSeat:1,
      activePlayerSeat:0,
      min:item.minimum,
      max:item.maximum,
      allowCancel:false,
      opponentSeat:1,
      promptOwnerSeat:1,
      ownerSeatMatchesActor:true,
      activeCardsLength:item.activeCards.length,
      hasGetPokemonCard:true,
      activePokemonPresent:item.activePokemonPresent,
      activeSlotOccupied:item.activeSlotOccupied,
      mismatchBranch:item.mismatchBranch,
      instanceof:{coinFlipPrompt:false,shuffleDeckPrompt:false,waitPrompt:false}
    });
    assert.equal(JSON.stringify(classified.safePromptIdentity).includes('hiddenCardIdentity'),false);
  }
});


test('V3 no-game seed probe dispatches decoded starting-Pokémon cards',()=>{
  const startingCard={fullName:'Starting Pokémon'};
  const players=[
    {id:'physical-player-0',active:{cards:[]}},
    {id:'physical-player-1',active:{
      cards:[],getPokemonCard(){return null;}
    }}
  ];
  class ChooseCardsPrompt {
    constructor(id,playerId,minimum,maximum,cards){
      this.id=id;
      this.playerId=playerId;
      this.message='CHOOSE_STARTING_POKEMONS';
      this.options={min:minimum,max:maximum,allowCancel:false,isSecret:false,blocked:[]};
      this.cards={cards};
    }
    decode(indices){
      return indices.map(index=>this.cards.cards[index]);
    }
    validate(decoded){
      return Array.isArray(decoded)&&decoded.length>=this.options.min&&
        decoded.length<=this.options.max&&
        decoded.every(card=>this.cards.cards.includes(card));
    }
  }
  class ResolvePromptAction {
    constructor(promptId,result){this.promptId=promptId;this.result=result;}
  }
  const state={phase:1,activePlayer:0,players};
  const opponentPrompt=new ChooseCardsPrompt(
    'opponent-starting-pokemon','physical-player-1',1,1,[startingCard]
  );
  const opponentAction=resolveNoGameWitnessSeedPrompt({
    prompt:opponentPrompt,native:{ResolvePromptAction},state,actorSeat:1
  },{candidateSeat:0,opponentSeat:1,attemptIndex:0});
  assert.equal(opponentAction.promptId,'opponent-starting-pokemon');
  assert.deepEqual(opponentAction.result,[startingCard]);
  assert.strictEqual(opponentAction.result[0],startingCard);
  assert.notDeepEqual(opponentAction.result,[0]);

  const emptyPrompt=new ChooseCardsPrompt(
    'candidate-empty-bench','physical-player-0',0,0,[]
  );
  const emptyAction=resolveNoGameWitnessSeedPrompt({
    prompt:emptyPrompt,native:{ResolvePromptAction},state,actorSeat:0
  },{candidateSeat:0,opponentSeat:1,attemptIndex:1});
  assert.deepEqual(emptyAction.result,[]);
});

test('V3 no-game seed probe classifies wrong-seat stops and propagates cleanup failure',()=>{
  const stop=new Error('intentional seed-probe stop');
  stop.code='NO_GAME_WITNESS_SEED_PROBE_STOP';
  assert.deepEqual(classifyNoGameWitnessSeedProbeFailure({
    error:stop,observedActorSeat:0,targetActorSeat:0,seed:'registered-public-seed'
  }),{kind:'found',seed:'registered-public-seed'});
  assert.deepEqual(classifyNoGameWitnessSeedProbeFailure({
    error:stop,observedActorSeat:1,targetActorSeat:0,seed:'wrong-seat-seed'
  }),{kind:'retry',reason:'wrong-seat-root',observedActorSeat:1});
  assert.throws(()=>classifyNoGameWitnessSeedProbeFailure({
    error:stop,observedActorSeat:null,targetActorSeat:0,seed:'unobserved-seed'
  }),error=>error===stop);
  const cleanup=new Error('native cleanup failed');
  cleanup.code='NATIVE_FIXTURE_CLEANUP_FAILURE';
  assert.throws(()=>classifyNoGameWitnessSeedProbeFailure({
    error:cleanup,observedActorSeat:0,targetActorSeat:0,seed:'must-not-be-accepted'
  }),error=>error===cleanup);
});

test('V3 runner module loads and exports complete fixture and witness entrypoints',()=>{
  const runner=require('../simulation/evaluation/2026-11/agent36-v3-runner.cjs');
  for(const name of [
    'runV3FixtureGame','runV3FixtureGameBothSeats','runV3NativeNoGameWitness',
    'runV3CompiledSeatWitness','buildV3RunnerFailureError'
  ]) assert.equal(typeof runner[name],'function',name+' must be exported');
});

function fixture(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent36-v3-runner-'));
  const ref='results/aichi-2026/registrations/v3-predeal.json';
  const preDeal={
    ready:true,status:'ready-before-deal',fixtureOnly:false,
    producerId:'bundle-producer',trialId:'trial-001',
    gameRegistration:{
      registeredAt:'2026-11-12T17:00:00.000Z',
      dealGeneratedAt:'2026-11-12T17:10:00.000Z'
    },
    policyPlanCore:{schema:'aichi-policy-plan-core-v1'},
    policyPlanSha256:'a'.repeat(64),
    policyAttestationBundle:{schema:'aichi-policy-attestation-bundle-v1'},
    policyAttestationBundleSha256:'b'.repeat(64),
    policyRegistration:{schema:'aichi-policy-registration-v1'},
    policyRegistrationSha256:'c'.repeat(64),
    preDealArtifactRef:ref,preDealArtifactSha256:'d'.repeat(64)
  };
  const filename=path.join(root,...ref.split('/'));
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const bytes=Buffer.from(JSON.stringify(preDeal,null,2)+'\n');
  fs.writeFileSync(filename,bytes);
  const blobSha=gitBlobSha(bytes);
  const run={
    id:12345,repository:{full_name:'owner/repo'},head_sha:'e'.repeat(40),
    run_started_at:'2026-11-12T17:05:00.000Z'
  };
  const step={
    name:STEP,status:'completed',conclusion:'success',
    started_at:'2026-11-12T17:11:00.000Z',
    completed_at:'2026-11-12T17:12:00.000Z'
  };
  const generationJob={
    id:67890,run_id:12345,head_sha:run.head_sha,
    status:'completed',conclusion:'success',steps:[step]
  };
  const trial={
    trialId:preDeal.trialId,researchRevisionSha:'f'.repeat(40),
    initialSourceDealFingerprint:'1'.repeat(64)
  };
  return {root,ref,preDeal,bytes,blobSha,run,step,generationJob,trial};
}
function response(data,{link=null,status=200,ok=true}={}){
  return {ok,status,headers:{get:name=>name.toLowerCase()==='link'?link:null},
    json:async()=>data,text:async()=>''};
}
function makeFetch(x,{wrongBlob=false,headSha=x.run.head_sha,jobPages=null}={}){
  return async (url,options)=>{
    assert.equal(options.headers.Authorization,'Bearer test-token');
    const u=new URL(url);
    if(u.pathname.endsWith('/actions/runs/12345/jobs')){
      if(jobPages){
        const page=u.searchParams.get('page')||'1';
        return jobPages[page];
      }
      return response({jobs:[x.generationJob]});
    }
    if(u.pathname.endsWith('/actions/runs/12345'))
      return response({...x.run,head_sha:headSha});
    if(u.pathname.endsWith('/contents/'+x.ref)){
      return response({
        type:'file',encoding:'base64',
        sha:wrongBlob?'0'.repeat(40):x.blobSha,
        content:x.bytes.toString('base64')
      });
    }
    throw Error('unexpected URL '+url);
  };
}
function prepareFactory(preDeal){
  return input=>{
    assert.equal(input.trialId,preDeal.trialId);
    return preDeal;
  };
}

test('complete V3 bundle runner forwards frozen artifacts and evidence to the production builder',()=>{
  const artifacts={
    preDeal:{trialId:'trial-001'},
    trial:{trialId:'trial-001'},
    policyApplicationReceipt:{trialId:'trial-001',receiptSha256:'a'.repeat(64)},
    preDealPersistenceReceipt:{trialId:'trial-001'},
    dealGenerationReceipt:{trialId:'trial-001'},
    evidence:{'original-printed-60':{ref:'review/printed-60.md',sha256:'b'.repeat(64)}},
    policyPanelReceipts:[{trialId:'panel-001'}],
    reviews:[{reviewerId:'reviewer-1'}],
  };
  let received;
  const expected={bundle:{trialId:'trial-001'},assessment:{admissionEligible:false}};
  const result=buildV3BundleFromArtifacts({
    ...artifacts,
    builder:input=>{received=input;return expected;}
  });
  assert.strictEqual(result,expected);
  assert.deepEqual(received,artifacts);

  let defaults;
  buildV3BundleFromArtifacts({
    ...artifacts,
    builder:input=>{defaults=input;return expected;}
  });
  assert.deepEqual(defaults.policyPanelReceipts,artifacts.policyPanelReceipts);
  assert.deepEqual(defaults.reviews,artifacts.reviews);
  assert.throws(()=>buildV3BundleFromArtifacts({
    ...artifacts,builder:null
  }),/must be callable/);
});

test('postgame runner can assemble the production bundle after verified generation metadata',()=>{
  const runnerSource=fs.readFileSync(require.resolve(
    '../simulation/evaluation/2026-11/agent36-v3-runner.cjs'),'utf8');
  assert.match(runnerSource,
    /if\(applicationReceiptRef \|\| evidenceRef \|\| reviewsRef \|\| policyPanelReceiptsRef\)/);
  assert.match(runnerSource,/bundleResult=buildV3BundleFromArtifacts\(/);
  assert.match(runnerSource,/const verifiedPersistenceReceipt=await revalidatePreDealPersistenceReceipt/);
  assert.match(runnerSource,/const verifiedGeneration=await revalidateDealGenerationReceipt/);
  assert.match(runnerSource,/complete-game-bundle\.json/);
  assert.match(runnerSource,/complete-game-assessment\.json/);
});

test('bundle assembly revalidates both persisted receipts against their original Actions runs',async()=>{
  const common={repositoryFullName:'owner/repo',token:'test-token'};
  const preDeal={trialId:'trial-001'};
  const repositoryRoot='/repo';
  const persistenceReceipt={
    schema:'aichi-predeal-persistence-receipt-v1',
    workflowRunId:123,
    workflowHeadSha:'a'.repeat(40),
  };
  let persistenceArgs;
  const persisted=await revalidatePreDealPersistenceReceipt({
    preDeal,persistenceReceipt,repositoryRoot,common,
    collector:async args=>{
      persistenceArgs=args;
      return {receipt:persistenceReceipt,run:{id:123},artifact:{blobSha:'b'.repeat(40)}};
    }
  });
  assert.deepEqual(persisted,persistenceReceipt);
  assert.equal(persistenceArgs.runId,123);
  assert.equal(persistenceArgs.expectedHeadSha,'a'.repeat(40));
  assert.equal(persistenceArgs.repositoryRoot,repositoryRoot);
  assert.strictEqual(persistenceArgs.prepare,revalidatePreDealPolicyRegistration,
    'postgame persistence revalidation must not rerun the pre-deal future-time gate');

  const trial={trialId:'trial-001'};
  const dealGenerationReceipt={
    schema:'aichi-deal-generation-receipt-v1',
    workflowRunId:123,
    workflowHeadSha:'a'.repeat(40),
  };
  let generationArgs;
  const generationResult={
    receipt:dealGenerationReceipt,
    trial:{...trial,dealGenerationStepStartedAt:'2026-11-13T02:00:00Z'},
  };
  const verified=await revalidateDealGenerationReceipt({
    preDeal,trial,persistenceReceipt,dealGenerationReceipt,common,
    collector:async args=>{generationArgs=args;return generationResult;}
  });
  assert.strictEqual(verified,generationResult);
  assert.equal(generationArgs.runId,123);
  assert.equal(generationArgs.expectedHeadSha,'a'.repeat(40));
  await assert.rejects(()=>revalidatePreDealPersistenceReceipt({
    preDeal,persistenceReceipt:{...persistenceReceipt,workflowHeadSha:'c'.repeat(40)},
    repositoryRoot,common,
    collector:async()=>({receipt:persistenceReceipt})
  }),/differs from live GitHub run\/artifact evidence/);
});

test('postgame pre-deal revalidation skips only the future wall-clock gate',()=>{
  const input={
    producerId:'bundle-producer',
    trialId:'trial-001',
    gameRegistration:{
      registeredAt:'2026-11-12T17:00:00.000Z',
      dealGeneratedAt:'2026-11-12T17:10:00.000Z'
    },
    preDealArtifactRef:'results/aichi-2026/registrations/v3-predeal.json',
    policyPlanCore:{schema:'aichi-policy-plan-core-v1'},
    policyAttestationBundle:{schema:'aichi-policy-attestation-bundle-v1'}
  };
  const strict=preparePreDealPolicyRegistration(input);
  const postgame=revalidatePreDealPolicyRegistration(input);
  assert.ok(strict.failures.includes(
    'predeal-registration-is-not-currently-before-physical-deal'));
  assert.equal(postgame.failures.includes(
    'predeal-registration-is-not-currently-before-physical-deal'),false);
  assert.ok(postgame.failures.includes(
    'game-level-preregistration-invalid-or-not-before-deal'),
  'postgame revalidation must retain structural chronology validation');
});

test('fixture application receipt binds unverified Expanded format contract into its digest',()=>{
  const application={
    receipt:{
      schema:'aichi-policy-application-receipt-v2',
      trialId:'fixture-001',
      actorOnlyExecutionBoundarySha256:'a'.repeat(64),
      receiptSha256:'b'.repeat(64),
    },
    policySha256BySeat:{0:'c'.repeat(64),1:'d'.repeat(64)},
  };
  const trial={
    candidateFormat:'Expanded',
    gameRuleset:'Expanded',
    opponentSourceEventFormat:'Japanese Extra',
    expandedLegalityAsOf:null,
    eventDate:null,
    formatReviewStatus:'unverified-fixture-only',
  };
  const bound=bindFixtureFormatToApplicationReceipt(application,trial);
  assert.equal(bound.receipt.candidateFormat,'Expanded');
  assert.equal(bound.receipt.gameRuleset,'Expanded');
  assert.equal(bound.receipt.opponentSourceEventFormat,'Japanese Extra');
  assert.equal(bound.receipt.expandedLegalityAsOf,null);
  assert.equal(bound.receipt.eventDate,null);
  assert.equal(bound.receipt.formatReviewStatus,'unverified-fixture-only');
  const {receiptSha256,...payload}=bound.receipt;
  assert.equal(receiptSha256,evidenceBundleSha256(payload));
  assert.notEqual(receiptSha256,application.receipt.receiptSha256);
  assert.equal(application.receipt.candidateFormat,undefined,
    "the extension must not mutate the helper's base receipt");
  assert.throws(()=>bindFixtureFormatToApplicationReceipt({
    receipt:{...application.receipt,gameRuleset:'Japanese Extra'}
  },trial),/differs from the frozen fixture contract/);
});

test('repository-relative artifact paths reject traversal and aliases',()=>{
  assert.equal(validateArtifactRef('results/aichi-2026/predeal.json'),
    'results/aichi-2026/predeal.json');
  for(const value of ['../secret.json','/tmp/predeal.json',
    'results/../private/x','results\\predeal.json','results//x'])
    assert.throws(()=>validateArtifactRef(value));
});

test('persisted pre-deal artifact must exactly match a fresh production preparation',()=>{
  const x=fixture();
  try{
    assert.equal(verifyPersistedPreDeal(x.preDeal,prepareFactory(x.preDeal)).trialId,
      'trial-001');
    assert.throws(()=>verifyPersistedPreDeal({
      ...x.preDeal,policyPlanSha256:'9'.repeat(64)
    },prepareFactory(x.preDeal)),/changed or omitted/);
    assert.throws(()=>verifyPersistedPreDeal({
      ...x.preDeal,fixtureOnly:true
    },prepareFactory(x.preDeal)),/fixture-only/);
  }finally{fs.rmSync(x.root,{recursive:true,force:true});}
});

test('pre-deal collector binds run server time, exact head and committed artifact blob',async()=>{
  const x=fixture();
  try{
    const result=await collectPreDealPersistenceReceipt({
      preDeal:x.preDeal,repositoryRoot:x.root,repositoryFullName:'owner/repo',
      runId:'12345',token:'test-token',expectedHeadSha:x.run.head_sha,
      apiBaseUrl:'https://api.test',fetchImpl:makeFetch(x),
      prepare:prepareFactory(x.preDeal)
    });
    assert.equal(result.receipt.workflowRunStartedAt,x.run.run_started_at);
    assert.equal(result.receipt.schema,'aichi-predeal-artifact-persistence-receipt-v1');
    assert.equal(result.receipt.blobSha,x.blobSha);
    assert.equal(result.receipt.artifactSha256,x.preDeal.preDealArtifactSha256);
  }finally{fs.rmSync(x.root,{recursive:true,force:true});}
});

test('pre-deal collector rejects checkout/head or GitHub blob mismatch',async()=>{
  const x=fixture();
  try{
    const args={
      preDeal:x.preDeal,repositoryRoot:x.root,repositoryFullName:'owner/repo',
      runId:'12345',token:'test-token',apiBaseUrl:'https://api.test',
      prepare:prepareFactory(x.preDeal)
    };
    await assert.rejects(()=>collectPreDealPersistenceReceipt({
      ...args,expectedHeadSha:'9'.repeat(40),fetchImpl:makeFetch(x)
    }),/differs from the checked-out/);
    await assert.rejects(()=>collectPreDealPersistenceReceipt({
      ...args,expectedHeadSha:x.run.head_sha,fetchImpl:makeFetch(x,{wrongBlob:true})
    }),/do not match the committed Git blob/);
  }finally{fs.rmSync(x.root,{recursive:true,force:true});}
});

test('postgame collector waits for the completed generation job and binds server step start',async()=>{
  const x=fixture();
  const persistenceReceipt={
    schema:'aichi-predeal-artifact-persistence-receipt-v1',
    trialId:x.preDeal.trialId,repositoryFullName:'owner/repo',
    artifactRef:x.ref,artifactSha256:x.preDeal.preDealArtifactSha256,
    serverTimestampSource:'github-actions-run-started-at',
    workflowRunId:'12345',workflowHeadSha:x.run.head_sha,
    commitSha:x.run.head_sha,blobSha:x.blobSha,
    workflowRunStartedAt:x.run.run_started_at
  };
  const otherJob={
    id:67889,run_id:12345,head_sha:x.run.head_sha,
    status:'completed',conclusion:'success',steps:[]
  };
  const page1=response({jobs:[otherJob]},{link:
    '<https://api.test/repos/owner/repo/actions/runs/12345/jobs?per_page=100&page=2>; rel="next"'});
  const page2=response({jobs:[x.generationJob]});
  try{
    const result=await collectDealGenerationReceipt({
      preDeal:x.preDeal,trial:x.trial,persistenceReceipt,
      repositoryFullName:'owner/repo',runId:'12345',token:'test-token',
      expectedHeadSha:x.run.head_sha,apiBaseUrl:'https://api.test',
      fetchImpl:makeFetch(x,{jobPages:{'1':page1,'2':page2}})
    });
    assert.equal(result.trial.dealGenerationStepStartedAt,x.step.started_at);
    assert.equal(result.receipt.jobId,'67890');
    assert.equal(result.receipt.schema,'aichi-physical-deal-generation-receipt-v1');
    assert.equal(result.jobs.length,2);
  }finally{fs.rmSync(x.root,{recursive:true,force:true});}
});

test('job metadata pagination rejects repeated page URLs',async()=>{
  let count=0;
  const fetchImpl=async()=>{
    count++;
    return response({jobs:[{id:1}]},{link:
      '<https://api.test/repeat>; rel="next"'});
  };
  await assert.rejects(()=>fetchWorkflowJobs({
    repositoryFullName:'owner/repo',runId:'12345',token:'test-token',
    apiBaseUrl:'https://api.test',fetchImpl
  }),/pagination loop/);
  assert.equal(count,2);
});

test('role composer receives shared dependencies and policy options bound to role identity',()=>{
  const commonDeps={
    observe:()=>{},promptActions:{ResolvePromptAction:function ResolvePromptAction(){}},
    cardPoolInitialization:{enginePin:'e'.repeat(40)}
  };
  const candidateIdentity={entryManifest:{enginePin:'e'.repeat(40)},policyDefinition:{policyOptions:{mode:'candidate'}}};
  const opponentIdentity={entryManifest:{enginePin:'e'.repeat(40)},policyDefinition:{policyOptions:{mode:'opponent'}}};
  const trial={candidateSeat:1,originalSourceSeat:0};
  let received;
  const composer=(run,options)=>{
    received=options;
    return {
      result:run(),candidateAudit:{policyOwnerSeat:1},
      opponentAudit:{policyOwnerSeat:0},roleSeatMap:{candidate:1,opponent:0}
    };
  };
  const result=runCandidateOpponentPolicyRoles(()=>42,{
    candidateSeat:1,opponentSeat:0,
    candidatePolicyOptions:{mode:'candidate'},
    opponentPolicyOptions:{mode:'opponent'},
    candidateIdentity,opponentIdentity,trial,commonDeps,composer
  });
  assert.equal(result.result,42);
  assert.equal(received.commonDeps,commonDeps);
  assert.deepEqual(result.roleSeatMap,{candidate:1,opponent:0});
  assert.throws(()=>runCandidateOpponentPolicyRoles(()=>42,{
    candidateSeat:0,opponentSeat:1,candidateIdentity,opponentIdentity,
    trial,commonDeps,composer
  }),/candidate role seat must be fixed/);
});

test('runtime pin wrapper requires exact host-loaded union and excludes worker policies',()=>{
  const candidatePolicyPath='candidate-policy.cjs';
  const opponentPolicyPath='opponent-policy.cjs';
  const candidate={manifest:{
    enginePin:'e'.repeat(40),entrypoint:V3_FIXTURE.hostRoleEntrypointPath,
    dataAssets:[{path:candidatePolicyPath,sha256:'a'.repeat(64)}]
  },expectedByPath:{'runner.cjs':'c'.repeat(64)}};
  const opponent={manifest:{
    enginePin:'e'.repeat(40),entrypoint:V3_FIXTURE.hostRoleEntrypointPath,
    dataAssets:[{path:opponentPolicyPath,sha256:'b'.repeat(64)}]
  },expectedByPath:{'runner.cjs':'c'.repeat(64)}};
  const combinedExpected={'runner.cjs':'c'.repeat(64)};
  const workerOnlyPaths=[candidatePolicyPath,opponentPolicyPath];
  const workerOnlyHashes={
    [candidatePolicyPath]:'a'.repeat(64),
    [opponentPolicyPath]:'b'.repeat(64)
  };
  const identityHelper={
    combineRolePolicyEntryManifests:()=>({
      expectedByPath:combinedExpected,unionSha256:'d'.repeat(64)
    }),
    assertLoadedResearchModulesCovered:(root,expected,cacheEntries)=>{
      assert.deepEqual(expected,{'runner.cjs':'c'.repeat(64)});
      return {files:[{path:'runner.cjs'}],sha256:'e'.repeat(64)};
    }
  };
  let called=false;
  const pin=(root,expected,run)=>{
    called=true;
    assert.deepEqual(expected,{'runner.cjs':'c'.repeat(64)});
    return {result:run(),audit:{guardRestored:true}};
  };
  const cardPoolInitialization={
    schema:'agent36-twinleaf-card-pool-initialization-v1',
    enginePin:'e'.repeat(40),startupPath:'vendor/twinleaf/ptcg-server/start.js',
    startupSha256:'f'.repeat(64),setNames:['BaseSet'],definedSetCount:1,cardCount:1
  };
  const result=combineAndPinV3RoleRuntime({
    repositoryRoot:'/tmp',candidateManifest:candidate,opponentManifest:opponent,
    cardPoolInitialization,run:()=>17,identityHelper,pin,workerOnlyPaths,workerOnlyHashes
  });
  assert.equal(called,true);
  assert.equal(result.result,17);
  assert.equal(result.runtimePinUnionSha256,'d'.repeat(64));
  assert.equal(result.loadedProcessClosureSha256,'e'.repeat(64));
  assert.equal(result.runtimePinEvidence.unionSha256,'d'.repeat(64));
  assert.equal(result.runtimePinEvidence.loadedProcessClosureSha256,'e'.repeat(64));
  assert.equal(result.runtimePinEvidence.cardPoolInitializationSha256,
    require('../simulation/evaluation/agent45-independent-competitive-admission.cjs').evidenceBundleSha256(cardPoolInitialization));
  const incomplete={
    ...identityHelper,
    assertLoadedResearchModulesCovered:()=>({files:[],sha256:'e'.repeat(64)})
  };
  assert.throws(()=>combineAndPinV3RoleRuntime({
    repositoryRoot:'/tmp',candidateManifest:candidate,opponentManifest:opponent,
    cardPoolInitialization,run:()=>17,identityHelper:incomplete,pin,workerOnlyPaths,workerOnlyHashes
  }),/every host runtime dependency must be preloaded/);
  assert.throws(()=>combineAndPinV3RoleRuntime({
    repositoryRoot:'/tmp',candidateManifest:candidate,
    opponentManifest:{...opponent,manifest:{...opponent.manifest,enginePin:'f'.repeat(40)}},
    cardPoolInitialization,run:()=>17,identityHelper,pin,workerOnlyPaths,workerOnlyHashes
  }),/opponent entry manifest engine pin differs/);
});

test('pre-deal receipt cannot bind a different in-memory registration to the committed artifact',async()=>{
  const x=fixture();
  try{
    const substituted={...x.preDeal,policyPlanSha256:'9'.repeat(64)};
    await assert.rejects(()=>collectPreDealPersistenceReceipt({
      preDeal:substituted,repositoryRoot:x.root,repositoryFullName:'owner/repo',
      runId:'12345',token:'test-token',expectedHeadSha:x.run.head_sha,
      apiBaseUrl:'https://api.test',fetchImpl:makeFetch(x),
      prepare:prepareFactory(substituted)
    }),/artifact object differs from the verified policy registration/);
  }finally{fs.rmSync(x.root,{recursive:true,force:true});}
});


test('V3 frozen role identities bind candidate Quick Ball root while leaving rank-1 options unchanged', () => {
  const sourceAuditLimitations = {
    dynamicRequireSites: [],
    computedEnvSites: [],
    unclassifiedEnvSites: [],
    missingRelativeImports: [],
    externalRequires: [],
  };
  const vendorDependencies = [];
  const vendorImports = [];
  const manifest = {
    schema: roleIdentity.ENTRY_MANIFEST_SCHEMA,
    complete: true,
    sourceAuditVersion: 'fixture-role-options-test-v1',
    sourceAuditLimitations,
    files: [{ path: 'simulation/evaluation/2026-11/agent36-v3-runner.cjs', sha256: 'a'.repeat(64) }],
    runtimeGuard: { required: true },
    commonRuntimeBindings: [
      { name: 'observe', exportName: 'actorObservation' },
      { name: 'promptActions', exportName: 'ResolvePromptAction' },
      { name: 'roleComposer', exportName: 'withCandidateOpponentPolicyRoles' },
      { name: 'moduleLoadGuard', exportName: 'withPinnedResearchModuleLoads' },
      { name: 'sourceClosureAudit', exportName: 'auditSourceClosure' },
      { name: 'roleIdentityHelper', exportName: 'buildRolePolicyIdentity' },
    ],
    vendorPrefix: 'vendor/twinleaf/',
    vendorDependencies,
    vendorDependenciesSha256: evidenceBundleSha256(vendorDependencies),
    vendorImports,
    vendorImportsSha256: evidenceBundleSha256(vendorImports),
    dependencyState: { mode: 'node-builtins-only' },
    orderedPromptChain: [{ name: 'fixture', path: 'simulation/twinleaf/fixture.cjs' }],
    sharedEnginePatches: [],
    observationContractSha256: 'b'.repeat(64),
    promptChainSha256: 'c'.repeat(64),
    sharedEnginePatchSha256: 'd'.repeat(64),
  };
  const identities = buildFixtureRoleIdentities({
    manifestResult: { manifest, entryManifestSha256: evidenceBundleSha256(manifest) },
    challengeSuiteSha256: 'e'.repeat(64),
    policyConstraintsSha256: 'f'.repeat(64),
    preparedRuntime: {
      runtimePinUnionSha256: '1'.repeat(64),
      loadedProcessClosureSha256: '2'.repeat(64),
      cardPoolInitializationSha256: '3'.repeat(64),
    },
  });

  assert.deepEqual(identities.candidateIdentity.policyDefinition.policyOptions, { quickBallRoot: true });
  assert.deepEqual(identities.opponentIdentity.policyDefinition.policyOptions, {},
    'the rank-1 opponent identity must not inherit the candidate-only Quick Ball root');
  assert.equal(identities.candidateIdentity.policyOptionsSha256,
    evidenceBundleSha256({ quickBallRoot: true }));
  assert.equal(identities.opponentIdentity.policyOptionsSha256, evidenceBundleSha256({}));
});

test('native card pool initialization reproduces the pinned start.js set order and receipt',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent36-card-pool-'));
  const filename=path.join(root,'vendor/twinleaf/ptcg-server/start.js');
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const startup="cardManager.defineSet(sets.BaseSet);\ncardManager.defineSet(sets.NextDestiny);\n";
  fs.writeFileSync(filename,startup);
  let instance;
  class CardManager{
    constructor(){this.cards=[];}
    static getInstance(){return instance??=(new CardManager());}
    getAllCards(){return this.cards;}
    defineSet(set){this.cards.push(...set);}
  }
  const old=process.env.AGENT36_TWINLEAF_COMMIT_SHA;
  process.env.AGENT36_TWINLEAF_COMMIT_SHA='a'.repeat(40);
  try{
    const args={CardManager,sets:{BaseSet:[{id:1}],NextDestiny:[{id:2}]},
      enginePin:'a'.repeat(40),repositoryRoot:root};
    const first=initializeNativeCardPool(args);
    assert.deepEqual(first.setNames,['BaseSet','NextDestiny']);
    assert.equal(first.cardCount,2);
    assert.equal(first.startupSha256,
      require('node:crypto').createHash('sha256').update(startup).digest('hex'));
    assert.strictEqual(initializeNativeCardPool(args),first);
    instance.cards.push({id:3});
    assert.throws(()=>initializeNativeCardPool(args),/contents changed after initialization receipt/);
  }finally{
    if(old===undefined)delete process.env.AGENT36_TWINLEAF_COMMIT_SHA;
    else process.env.AGENT36_TWINLEAF_COMMIT_SHA=old;
    fs.rmSync(root,{recursive:true,force:true});
  }
});


test('V3 candidate/opponent seat assignment swaps the same fixed decks without changing role identity',()=>{
  const candidate=['candidate-0','candidate-1'];
  const opponent=['opponent-0','opponent-1'];
  const seat0=resolveFixtureSeatAssignment({
    candidateSeat:0,opponentSeat:1,candidateDeck:candidate,opponentDeck:opponent
  });
  const seat1=resolveFixtureSeatAssignment({
    candidateSeat:1,opponentSeat:0,candidateDeck:candidate,opponentDeck:opponent
  });
  assert.deepEqual(seat0.roleSeatMap,{candidate:0,opponent:1});
  assert.deepEqual(seat1.roleSeatMap,{candidate:1,opponent:0});
  assert.strictEqual(seat0.deckA,candidate);
  assert.strictEqual(seat0.deckB,opponent);
  assert.strictEqual(seat1.deckA,opponent);
  assert.strictEqual(seat1.deckB,candidate);
  assert.deepEqual(seat0.playerNames,['candidate','opponent']);
  assert.deepEqual(seat1.playerNames,['opponent','candidate']);
  assert.deepEqual(candidateOpponentRoleSeats({candidateSeat:1,opponentSeat:0}),
    {candidate:1,opponent:0});
});

test('host validates worker policy as inert data and never executes its module body',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent49-inert-policy-'));
  try {
    fs.writeFileSync(path.join(root,'policy.cjs'),[
      "'use strict';",
      "const POLICY_VERSION='test-worker-policy-v1';",
      "globalThis.__agent49HostPolicyExecuted=true;",
      "module.exports={POLICY_VERSION,createPolicy(){return {decide(){return {kind:'abstain',reasonCode:'TEST'}}}}};"
    ].join('\n'));
    assert.throws(()=>loadWorkerPolicyModule(root,'policy.cjs','candidate'),
      /pure, deterministic/);
    assert.equal(globalThis.__agent49HostPolicyExecuted,undefined);
    fs.writeFileSync(path.join(root,'policy.cjs'),[
      "'use strict';",
      "const POLICY_VERSION='test-worker-policy-v1';",
      "module.exports={POLICY_VERSION,createPolicy(){return {decide(){return {kind:'abstain',reasonCode:'TEST'}}}}};"
    ].join('\n'));
    const descriptor=loadWorkerPolicyModule(root,'policy.cjs','candidate');
    assert.equal(descriptor.POLICY_VERSION,'test-worker-policy-v1');
    assert.match(descriptor.policySha256,/^[a-f0-9]{64}$/);
  } finally {
    fs.rmSync(root,{recursive:true,force:true});
    delete globalThis.__agent49HostPolicyExecuted;
  }
});

function makeWorkerManifestFixture(extraDataAssets=[]){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent49-worker-manifest-fixture-'));
  const commonRuntimeBindings=[
    {name:'observe',path:'simulation/twinleaf/fixture-observation.cjs',exportName:'actorObservation'},
    {name:'promptActions',path:'simulation/twinleaf/fixture-prompt-actions.cjs',exportName:'ResolvePromptAction'},
    {name:'roleComposer',path:'simulation/twinleaf/fixture-role-composer.cjs',exportName:'withCandidateOpponentPolicyRoles'},
    {name:'moduleLoadGuard',path:'simulation/evaluation/fixture-module-load-guard.cjs',exportName:'withPinnedResearchModuleLoads'},
    {name:'sourceClosureAudit',path:'simulation/evaluation/fixture-source-closure-audit.cjs',exportName:'auditSourceClosure'},
    {name:'roleIdentityHelper',path:'simulation/evaluation/fixture-role-identity.cjs',exportName:'buildRolePolicyIdentity'},
    {name:'workerProtocol',path:V3_FIXTURE.protocolPath,exportName:'validateRequest'},
    {name:'workerLauncher',path:'simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs',exportName:'createPolicyBundle'},
    {name:'workerSession',path:'simulation/evaluation/2026-11/agent36-async-docker-policy-session.cjs',exportName:'createDockerPolicySession'}
  ];
  const orderedPromptChain=[{
    name:'fixture-owner-prompt',
    path:'simulation/twinleaf/fixture-owner-prompt.cjs'
  }];
  const dataAssets=[
    V3_FIXTURE.candidatePath,V3_FIXTURE.fieldPath,V3_FIXTURE.workerPath,
    V3_FIXTURE.dockerCanaryWorkerPath,V3_FIXTURE.officialRank1Path,
    V3_FIXTURE.originalAdmissionPath,
    'simulation/evaluation/2026-11/agent1-private-diagnostic-envelope.cjs',
    'simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs',
    'simulation/evaluation/2026-11/agent36-v3-runner.cjs',
    'simulation/evaluation/2026-11/agent49-native-fixture-game.cjs',
    'simulation/evaluation/2026-11/agent49-fixture-scoped-runtime-pin.cjs',
    'simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs',
    'simulation/twinleaf/2026-11/agent45/full-state-trace.cjs',
    ...V3_FIXTURE_TEST_PATHS,...extraDataAssets
  ];
  const sourcePaths=[
    V3_FIXTURE.hostRoleEntrypointPath,V3_FIXTURE.hookPath,
    ...commonRuntimeBindings.map(binding=>binding.path),
    ...orderedPromptChain.map(item=>item.path)
  ];
  const paths=new Set([
    ...sourcePaths,...dataAssets,'vendor/twinleaf/ptcg-server/package-lock.json'
  ]);
  for(const relative of paths){
    const filename=path.join(root,relative);
    fs.mkdirSync(path.dirname(filename),{recursive:true});
    const content=relative.endsWith('package-lock.json')?
      JSON.stringify({name:'fixture-twinleaf-lock',lockfileVersion:3,packages:{}}):
      "'use strict';\nmodule.exports={};\n";
    fs.writeFileSync(filename,content);
  }
  return {root,commonRuntimeBindings,orderedPromptChain,
    dispose(){fs.rmSync(root,{recursive:true,force:true});}};
}


test('Agent45 full-state recorder stays outside host and worker role bindings',()=>{
  const recorderPath='simulation/twinleaf/2026-11/agent45/full-state-trace.cjs';
  assert.equal(V3_FIXTURE_COMMON_BINDINGS.some(binding=>binding.path===recorderPath),false);
  assert.equal(V3_FIXTURE_WORKER_COMMON_BINDINGS.some(binding=>binding.path===recorderPath),false);
  assert.ok(V3_FIXTURE_TEST_PATHS.includes('tests/2026-11/agent45/full-state-trace.test.cjs'));
});

test('V3 runner preloads the Agent45 recorder before the fixture pin and captures same-store actions',()=>{
  const source=fs.readFileSync(path.resolve(__dirname,
    '../simulation/evaluation/2026-11/agent36-v3-runner.cjs'),'utf8');
  const recorderRequire=source.indexOf(
    "require('../../twinleaf/2026-11/agent45/full-state-trace.cjs')");
  const fixturePin=source.indexOf('pinned = await runPinnedV3RoleRuntime',recorderRequire);
  assert.ok(recorderRequire>=0&&fixturePin>recorderRequire,
    'the host must capture recorder function references before the fixture role pin');
  assert.match(source,/diagnosticMode==='encrypted-full'&&!witnessOnly/,
    'the full-state recorder must be disabled for sanitized-only and no-game witness runs');
  assert.doesNotMatch(source,/assert\.ok\(witnessOnly\|\|diagnosticMode==='encrypted-full'/,
    'registered diagnostics may use the owner-authorized sanitized-only projection');
  assert.match(source,/validateV3DiagnosticMode\(\s*env\.AGENT36_V3_DIAGNOSTIC_MODE\?\?'sanitized-only'\)/);
  assert.match(source,/diagnosticSnapshot:diagnosticMode==='encrypted-full'&&!witnessOnly\?/,
    'no-game witnesses must not receive full private-state snapshots even when encrypted-full is configured');
  assert.match(source,/requireFullStateDiagnostics:diagnosticMode==='encrypted-full'&&!witnessOnly/);
  assert.match(source,/onGameReady:fullStateTraceRecorder\?/);
  assert.match(source,/onAction:fullStateTraceRecorder\?/);
  assert.match(source,/actionOrdinal:record\.actionOrdinal\+1/);
  assert.match(source,/fullStateTraceRecorder\.captureFinal\(state\)/);
  assert.match(source,/fullStateTraceResult\?\.publicBoardError===null/);
  assert.match(source,/fullStateTraceResult\?\.humanSummaryError===null/);
  assert.match(source,/fullStateTraceResult\?\.stepCount===fullStateTraceAcceptedActionCount/);
  assert.match(source,/fullStateTraceSteps\.length===fullStateTraceAcceptedActionCount/);
  assert.match(source,/evidenceBundleSha256\(fullStateTraceDecisionRows\)===gameResult\?\.decisionTraceSha256/);
  assert.match(source,/evidenceBundleSha256\(fullStateTraceRootLedger\)===gameResult\?\.rootActionLedgerSha256/);
  assert.match(source,/validateV3FullStateTraceJoins\(\{/,
    'the runner must use the shared full-state trace join validator');
  assert.match(source,/steps:fullStateTraceSteps/);
  assert.match(source,/rootActionLedger:fullStateTraceRootLedger/);
  assert.match(source,/decisionRows:fullStateTraceDecisionRows/);
  assert.match(source,/row\.actingSeat===ledger\?\.actorSeat/);
  assert.match(source,/row\.decisionKind===ledger\?\.decisionKind/);
  assert.match(source,/trace\.actorObservationSha256===row\.actorObservationSha256/);
  assert.match(source,/trace\.actorInputSha256===evidenceBundleSha256\(actorInput\)/);
  assert.match(source,/trace\.actorInputSha256===trace\.actorObservationSha256/);
  assert.match(source,/trace\.seat===row\.actingSeat/);
  assert.match(source,/receipt\.actorSeat===row\.actingSeat/);
  assert.match(source,/trace\.decisionKind===row\.decisionKind/);
  assert.match(source,/fullStateTraceDecisionJoinMatches/);
  assert.match(source,/fullStateTraceWorkerAuditComplete/);
  assert.match(source,/workerProtocol\.validatePolicyAudit\(trace\.policyAudit/);
  assert.match(source,/evidenceBundleSha256\(trace\.policyAudit\)===trace\.policyAuditSha256/);
  assert.match(source,/evidenceBundleSha256\(trace\)===row\.workerDecisionTraceSha256/);
  assert.match(source,/evidenceBundleSha256\(trace\.validationReceipt\)===row\.validationReceiptSha256/);
  assert.match(source,/evidenceBundleSha256\(receipt\)===row\.validationReceiptSha256/);
  assert.match(source,/receipt\.clonedPromptResolved===true/);
  assert.match(source,/receipt\.selectedActionValidated===true/);
  assert.match(source,/receipt\.fullOriginalStoreStateUnchanged===true/);
  assert.match(source,/fullStateTraceWorkerDecisionCountMatches/);
  assert.match(source,/agent19-agent45-v3-full-state-trace-acceptance-v2/);
  assert.match(source,/fullStateTraceAcceptance\.accepted/);
  assert.equal(source.includes('policyConfiguration:native.botOptionsBySeat'),false,
    'Twinleaf engine bot options must not be mislabeled as worker policy identity');
});


test('registered V3 diagnostics accept sanitized-only with the existing artifact allowlist',()=>{
  assert.equal(validateV3DiagnosticMode('sanitized-only'),'sanitized-only');
  assert.equal(validateV3DiagnosticMode('encrypted-full'),'encrypted-full');
  assert.throws(()=>validateV3DiagnosticMode('unsupported-mode'),
    /V3 fixture diagnostic mode must be encrypted-full or sanitized-only/);

  const source=fs.readFileSync(path.resolve(__dirname,
    '../simulation/evaluation/2026-11/agent36-v3-runner.cjs'),'utf8');
  assert.match(source,/validateV3DiagnosticMode\(\s*env\.AGENT36_V3_DIAGNOSTIC_MODE\?\?'sanitized-only'\)/,
    'registered fixture execution must use the tested mode validator');
  assert.match(source,/const fullStateTraceModule=diagnosticMode==='encrypted-full'&&!witnessOnly\?/,
    'the live Store recorder module remains opt-in to encrypted-full mode');
  assert.match(source,/const fullStateTraceRecorder=fullStateTraceModule\?/,
    'the live Store recorder is constructed only when its encrypted-full module is available');
  assert.match(source,/diagnosticSnapshot:diagnosticMode==='encrypted-full'&&!witnessOnly\?/,
    'sanitized-only execution must not capture full private-state snapshots');
  assert.match(source,/requireFullStateDiagnostics:diagnosticMode==='encrypted-full'&&!witnessOnly/,
    'full-state acceptance remains conditional on encrypted-full');
  assert.match(source,/const sanitizedOnly=diagnosticMode==='sanitized-only'/);
  assert.match(source,/sanitizeFixtureArtifact\(artifact\)/);
  assert.match(source,/fixture-game\.sanitized\.json/);
  assert.match(source,/fixture-game\.sanitized\.txt/);
  assert.ok(V3_FIXTURE_TEST_PATHS.includes(
    'tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs'),
    'the existing sanitizer allowlist/redaction tests must run in the V3 contract suite');
});


test('host and worker common binding arrays have unique names and path/export identities',()=>{
  for(const [label,bindings] of [
    ['host',V3_FIXTURE_COMMON_BINDINGS],
    ['worker',V3_FIXTURE_WORKER_COMMON_BINDINGS]
  ]){
    assert.equal(new Set(bindings.map(binding=>binding.name)).size,bindings.length,
      label+' common binding names must be unique');
    const identities=bindings.map(binding=>JSON.stringify([binding.path,binding.exportName??null]));
    assert.equal(new Set(identities).size,identities.length,
      label+' common binding path/export pairs must be unique');
  }
});

test('pure worker role manifest contract keeps policies and worker executables in data assets',()=>{
  const fixture=makeWorkerManifestFixture([
    V3_FIXTURE.candidateWorkerPolicyPath,V3_FIXTURE.opponentWorkerPolicyPath
  ]);
  try{
    const common={
      repositoryRoot:fixture.root,enginePin:'a'.repeat(40),runnerRevision:'b'.repeat(40),
      commonRuntimeBindings:fixture.commonRuntimeBindings,
      orderedPromptChain:fixture.orderedPromptChain
    };
    const candidate=buildFixtureRoleEntryManifest({
      ...common,entrypoint:V3_FIXTURE.hostRoleEntrypointPath,
      additionalDataAssetPaths:[V3_FIXTURE.candidateWorkerPolicyPath]
    });
    const opponent=buildFixtureRoleEntryManifest({
      ...common,entrypoint:V3_FIXTURE.hostRoleEntrypointPath,
      additionalDataAssetPaths:[V3_FIXTURE.opponentWorkerPolicyPath]
    });
    for(const [result,policyPath] of [
      [candidate,V3_FIXTURE.candidateWorkerPolicyPath],
      [opponent,V3_FIXTURE.opponentWorkerPolicyPath]
    ]){
      assert.equal(result.manifest.complete,true);
      assert.equal(result.manifest.entrypoint,V3_FIXTURE.hostRoleEntrypointPath);
      assert.ok(result.manifest.files.some(file=>file.path===V3_FIXTURE.hostRoleEntrypointPath));
      assert.equal(result.manifest.files.some(file=>file.path===policyPath),false,
        'role-specific policy source must not be host executable code');
      assert.ok(result.manifest.files.some(file=>file.path===V3_FIXTURE.protocolPath));
      assert.ok(result.manifest.files.some(file=>file.path==='simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs'));
      assert.ok(result.manifest.files.some(file=>file.path==='simulation/evaluation/2026-11/agent36-async-docker-policy-session.cjs'));
      assert.equal(result.manifest.files.some(file=>file.path===V3_FIXTURE.workerPath),false);
      assert.equal(result.manifest.files.some(file=>file.path===V3_FIXTURE.dockerCanaryWorkerPath),false);
      assert.ok(result.manifest.dataAssets.some(asset=>asset.path===policyPath));
      assert.ok(result.manifest.dataAssets.some(asset=>asset.path===V3_FIXTURE.workerPath));
      assert.ok(result.manifest.dataAssets.some(asset=>asset.path===V3_FIXTURE.dockerCanaryWorkerPath));
      assert.ok(result.manifest.dataAssets.some(asset=>
        asset.path==='simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs'));
      const fullStateRecorderPath='simulation/twinleaf/2026-11/agent45/full-state-trace.cjs';
      assert.ok(result.manifest.dataAssets.some(asset=>asset.path===fullStateRecorderPath),
        'host-only full-state recorder source must be revision-pinned as a data asset');
      assert.equal(result.manifest.files.some(file=>file.path===fullStateRecorderPath),false,
        'host-only full-state recorder must not become worker-executable code');
      assert.deepEqual(result.manifest.sourceAuditLimitations.missingRelativeImports,[]);
      assert.ok(Object.hasOwn(result.expectedByPath,V3_FIXTURE.protocolPath));
      assert.equal(Object.hasOwn(result.expectedByPath,policyPath),false);
      assert.equal(Object.hasOwn(result.expectedByPath,V3_FIXTURE.workerPath),false);
      assert.equal(Object.hasOwn(result.expectedByPath,V3_FIXTURE.dockerCanaryWorkerPath),false);
      assert.deepEqual(result.manifest.vendorDependencies,[],
        'contract-only fixture must not pretend compiled Twinleaf vendor bindings exist');
    }
  }finally{
    fixture.dispose();
  }
});

test('compiled Twinleaf worker role manifest binds native runtime sources when build output is available',{
  skip:!fs.existsSync(path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output/game/store/state/state.js'))
},()=>{
  const repositoryRoot=path.resolve(__dirname,'..');
  const result=buildFixtureRoleEntryManifest({
    repositoryRoot,enginePin:'a'.repeat(40),runnerRevision:'b'.repeat(40),
    commonRuntimeBindings:V3_FIXTURE_WORKER_COMMON_BINDINGS,
    orderedPromptChain:V3_FIXTURE_WORKER_PROMPT_CHAIN,
    entrypoint:V3_FIXTURE.hostRoleEntrypointPath,
    additionalDataAssetPaths:[V3_FIXTURE.candidateWorkerPolicyPath]
  });
  assert.equal(result.manifest.complete,true);
  const vendorPaths=[...new Set(V3_FIXTURE_WORKER_COMMON_BINDINGS
    .filter(binding=>binding.path.startsWith('vendor/twinleaf/'))
    .map(binding=>binding.path))];
  for(const vendorPath of vendorPaths){
    assert.ok(result.manifest.vendorDependencies.some(item=>item.path===vendorPath),
      'compiled vendor binding is absent from the manifest: '+vendorPath);
  }
});

test('role worker bundle packages protocol and policy and cleanup removes its root',()=>{
  const repositoryRoot=path.resolve(__dirname,'..');
  const built=buildRoleWorkerBundle({
    repositoryRoot,policyModulePath:V3_FIXTURE.candidateWorkerPolicyPath
  });
  const bundleRoot=built.bundle.root;
  try{
    assert.deepEqual(built.bundle.manifest.files.map(file=>file.path),[
      'agent49-policy-protocol.cjs','policy.cjs','worker.cjs'
    ]);
    assert.ok(built.bundle.manifest.files.every(file=>/^[a-f0-9]{64}$/.test(file.sha256)));
  }finally{
    cleanupPolicyBundle(built.bundle);
  }
  assert.equal(fs.existsSync(bundleRoot),false);
});

test('host policy preload hashes worker-only entrypoints without executing them',()=>{
  const repositoryRoot=path.resolve(__dirname,'..');
  const relativePath='simulation/evaluation/2026-11/.agent49-host-preload-probe-'+process.pid+'.cjs';
  const sourcePath=path.join(repositoryRoot,relativePath);
  const hostProbeRelativePath='simulation/evaluation/2026-11/.agent49-host-preload-transitive-'+process.pid+'.cjs';
  const hostProbePath=path.join(repositoryRoot,hostProbeRelativePath);
  const sentinelPath=path.join(os.tmpdir(),'agent49-host-preload-sentinel-'+process.pid+'.txt');
  const source=[
    "'use strict';",
    "const POLICY_VERSION='agent49-host-preload-probe-v1';",
    "module.constructor._load('node:fs').writeFileSync("+JSON.stringify(sentinelPath)+",'executed');",
    "async function createPolicy(){return {async decide(){return {kind:'abstain',reasonCode:'NOOP'};}};}",
    'module.exports={POLICY_VERSION,createPolicy};'
  ].join('\n');
  try{
    fs.writeFileSync(sourcePath,source);
    const loaded=loadWorkerPolicyModule(
      repositoryRoot,relativePath,'host-preload-probe'
    );
    const sha256=createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex');
    const protocolFilename=path.join(repositoryRoot,V3_FIXTURE.protocolPath);
    const protocolSha256=createHash('sha256').update(fs.readFileSync(protocolFilename)).digest('hex');
    assert.equal(loaded.policySha256,sha256);
    const preload=preloadRoleHostModules({
      repositoryRoot,
      expectedByPath:{[V3_FIXTURE.protocolPath]:protocolSha256},
      workerOnlyPaths:[relativePath],
      workerOnlyHashes:{[relativePath]:sha256}
    });
    assert.equal(loaded.POLICY_VERSION,'agent49-host-preload-probe-v1');
    assert.deepEqual(preload.hostExpectedByPath,{[V3_FIXTURE.protocolPath]:protocolSha256});
    assert.deepEqual(preload.loadedPaths,[V3_FIXTURE.protocolPath]);
    assert.deepEqual(preload.workerOnlyPaths,[relativePath]);
    assert.equal(fs.existsSync(sentinelPath),false,
      'static policy inspection and host preloading must not execute worker-only policy source');

    fs.writeFileSync(hostProbePath,
      "'use strict'; require('./"+path.basename(sourcePath)+"'); module.exports={};");
    const hostProbeSha256=createHash('sha256').update(fs.readFileSync(hostProbePath)).digest('hex');
    assert.throws(()=>preloadRoleHostModules({
      repositoryRoot,
      expectedByPath:{[V3_FIXTURE.protocolPath]:protocolSha256,[hostProbeRelativePath]:hostProbeSha256},
      workerOnlyPaths:[relativePath],
      workerOnlyHashes:{[relativePath]:sha256}
    }),error=>error?.code==='WORKER_ONLY_POLICY_HOST_IMPORT_BLOCKED');
    assert.equal(fs.existsSync(sentinelPath),false,
      'a transitive host require must be blocked before worker-only policy code executes');
    assert.equal(require.cache[sourcePath],undefined);
  }finally{
    fs.rmSync(sourcePath,{force:true});
    fs.rmSync(hostProbePath,{force:true});
    fs.rmSync(sentinelPath,{force:true});
  }
});



test('native Stadium actions fail closed without explicit liveness evidence',()=>{
  const unknown={actionFrontier:{items:[{token:'stadium-1',kind:'use-stadium'}]}};
  assert.throws(()=>assertTrustedActionSelection(unknown,'stadium-1'),
    error=>error?.code==='UNKNOWN_STADIUM_LIVENESS');
  const proven={actionFrontier:{items:[{
    token:'stadium-2',kind:'use-stadium',publicMetadata:{stadiumEffectLive:true}
  }]}};
  assert.strictEqual(assertTrustedActionSelection(proven,'stadium-2'),proven.actionFrontier.items[0]);
  assert.throws(()=>assertTrustedActionSelection(proven,'not-in-frontier'));
});



test('V3 fixture cannot run or publish the physical seed without explicit public authorization',async()=>{
  assert.throws(()=>validatePhysicalSeedDisclosureDecision(undefined),
    error=>error?.code==='SEED_DISCLOSURE_NOT_AUTHORIZED');
  assert.throws(()=>validatePhysicalSeedDisclosureDecision('not-authorized'),
    error=>error?.code==='SEED_DISCLOSURE_NOT_AUTHORIZED');
  assert.throws(()=>validatePhysicalSeedDisclosureDecision('private-host-only'),
    error=>error?.code==='SEED_DISCLOSURE_NOT_AUTHORIZED');
  assert.equal(validatePhysicalSeedDisclosureDecision('public-reproducible'),
    'public-reproducible');
  await assert.rejects(runV3FixtureGame({env:{}}),
    error=>error?.code==='SEED_DISCLOSURE_NOT_AUTHORIZED');
});

test('V3 fixture seed registration requires a fresh public seed bound to exact decks, policies, and Twinleaf',()=>{
  const registration={
    schema:'agent36-v3-public-seed-registration-v1',
    fixtureOnly:true,
    scope:'aichi-top32-rank1-diagnostic-both-seats',
    registrationId:'public-seed-registration-20261115-001',
    trialId:'aichi-rank1-diagnostic-20261115-001',
    registeredAt:'2026-11-14T12:00:00.000Z',
    registeredBy:'owner-approved-public-reproducibility',
    seed:'aichi-rank1-public-seed-20261115-001',
    seedDisclosureDecision:'public-reproducible',
    twinleafCommitSha:V3_FIXTURE.engineCommit,
    candidatePrinted60Sha256:V3_FIXTURE.candidateDeckSha256,
    opponentPrinted60Sha256:V3_FIXTURE.opponentDeckSha256,
    candidatePolicyVersion:'candidate-policy-v1',
    opponentPolicyVersion:'opponent-policy-v1'
  };
  assert.equal(validatePublicSeedRegistration(registration,{
    enginePin:V3_FIXTURE.engineCommit,
    candidatePolicyVersion:'candidate-policy-v1',
    opponentPolicyVersion:'opponent-policy-v1',
    nowMs:Date.parse('2026-11-15T00:00:00.000Z')
  }),registration);
  assert.throws(()=>validatePublicSeedRegistration({
    ...registration,seed:'agent36-v3-fixture-hood-rank1-20261112-01'
  },{
    enginePin:V3_FIXTURE.engineCommit,
    candidatePolicyVersion:'candidate-policy-v1',
    opponentPolicyVersion:'opponent-policy-v1',
    nowMs:Date.parse('2026-11-15T00:00:00.000Z')
  }),/retired diagnostic seed/);
  assert.throws(()=>validatePublicSeedRegistration({
    ...registration,registeredAt:'2026-11-12T23:59:59.000Z'
  },{
    enginePin:V3_FIXTURE.engineCommit,
    candidatePolicyVersion:'candidate-policy-v1',
    opponentPolicyVersion:'opponent-policy-v1',
    nowMs:Date.parse('2026-11-15T00:00:00.000Z')
  }),/must be fresh/);
});

test('V3 native no-game and compiled-seat witness runners are distinct top-level entry points',()=>{
  assert.equal(runV3NativeNoGameWitness.constructor.name,'AsyncFunction');
  assert.equal(typeof runV3CompiledSeatWitness,'function');
  assert.notEqual(runV3NativeNoGameWitness,runV3CompiledSeatWitness);
});

test('V3 fixture no-game witness receipt requires all four role-seat pairs and exact runtime bindings',()=>{
  const expected={
    researchRevisionSha:'a'.repeat(40),
    twinleafCommitSha:V3_FIXTURE.engineCommit,
    candidatePrinted60Sha256:V3_FIXTURE.candidateDeckSha256,
    opponentPrinted60Sha256:V3_FIXTURE.opponentDeckSha256,
    candidatePolicySha256:'b'.repeat(64),
    opponentPolicySha256:'c'.repeat(64),
    candidatePolicyVersion:'candidate-policy-v1',
    opponentPolicyVersion:'opponent-policy-v1'
  };
  const witnesses=[];
  for(const candidateSeat of [0,1]){
    for(const actorSeat of [0,1]){
      const role=actorSeat===candidateSeat?'candidate':'opponent';
      const seed='public-witness-seed-'+candidateSeat+'-'+actorSeat;
      witnesses.push({
        schema:'agent36-v3-native-no-game-seat-witness-v1',
        fixtureOnly:true,gameExecuted:false,candidateSeat,
        opponentSeat:1-candidateSeat,actorSeat,role,
        actualFirstPlayerSeat:actorSeat,seed,
        seed32:createHash('sha256').update(seed,'utf8').digest().readUInt32LE(0),
        actorObservationUsed:true,selectedActionValidated:true,
        nativeStoreCreated:true,bothPlayersRegistered:true,
        nativeActionFrontierUsed:true,nativeValidationStoreMode:'cloned-store',
        hostStoppedBeforeLiveDispatch:true,validationActionKind:'GO_FIRST',
        fullOriginalStoreStateUnchanged:true,liveActionDispatched:false,
        acceptedRootActions:0,rootDecisionCount:1,promptDecisionCount:0,workerDecisionCount:1,
        candidateRootDecisionCount:role==='candidate'?1:0,
        candidatePromptDecisionCount:0,
        candidateWorkerDecisionCount:role==='candidate'?1:0,
        opponentRootDecisionCount:role==='opponent'?1:0,
        opponentPromptDecisionCount:0,
        opponentWorkerDecisionCount:role==='opponent'?1:0,
        actionFrontierItemCount:2,
        workerCleanupVerified:true,allWorkerSessionsClosed:true,
        actorOnlyWorkerInput:true,nativeStateDisclosedToWorker:false,
        opponentPrivateZonesDisclosedToWorker:false,
        physicalSeedDisclosedToWorker:false,policySeedDisclosedToWorker:false,
        workerInputScope:'actor-observation-v3+actor-prompt-projection+public-event-receipt-v3+typed-action-frontier-v1',
        workerFailureCount:0,policyRngReplayable:true,
        promptProvenanceHookRestored:true,runtimePinGuardRestored:true,
        policySha256:role==='candidate'?expected.candidatePolicySha256:expected.opponentPolicySha256,
        policyVersion:role==='candidate'?expected.candidatePolicyVersion:expected.opponentPolicyVersion,
        candidatePolicySha256:expected.candidatePolicySha256,
        opponentPolicySha256:expected.opponentPolicySha256,
        candidatePolicyVersion:expected.candidatePolicyVersion,
        opponentPolicyVersion:expected.opponentPolicyVersion,
        researchRevisionSha:expected.researchRevisionSha,
        twinleafCommitSha:expected.twinleafCommitSha,
        candidatePrinted60Sha256:expected.candidatePrinted60Sha256,
        opponentPrinted60Sha256:expected.opponentPrinted60Sha256
      });
    }
  }
  const receipt={
    schema:'agent36-v3-native-no-game-witness-v1',fixtureOnly:true,
    gameExecuted:false,liveActionsDispatched:false,
    allStoreStatesUnchanged:true,allSelectedActionsValidated:true,
    allActorObservationsUsed:true,allWorkersClosed:true,
    allWorkerPoliciesActorOnly:true,
    generatedAt:'2026-11-20T12:00:00.000Z',
    researchRevisionSha:expected.researchRevisionSha,
    twinleafCommitSha:expected.twinleafCommitSha,
    candidatePrinted60Sha256:expected.candidatePrinted60Sha256,
    opponentPrinted60Sha256:expected.opponentPrinted60Sha256,
    candidatePolicySha256:expected.candidatePolicySha256,
    opponentPolicySha256:expected.opponentPolicySha256,
    candidatePolicyVersion:expected.candidatePolicyVersion,
    opponentPolicyVersion:expected.opponentPolicyVersion,
    coverage:['0:0','0:1','1:0','1:1'],witnesses
  };
  assert.equal(validateNoGameWitnessReceipt(receipt,expected),receipt);

  const wrongGlobalWorkerCount=JSON.parse(JSON.stringify(receipt));
  wrongGlobalWorkerCount.witnesses[0].workerDecisionCount=2;
  assert.throws(()=>validateNoGameWitnessReceipt(wrongGlobalWorkerCount,expected),
    /global worker decision count must equal candidate and opponent totals/);

  const wrongCandidateWorkerCount=JSON.parse(JSON.stringify(receipt));
  wrongCandidateWorkerCount.witnesses[0].candidateWorkerDecisionCount=2;
  assert.throws(()=>validateNoGameWitnessReceipt(wrongCandidateWorkerCount,expected),
    /candidate worker decision total must equal root plus prompt decisions/);

  const inactivePromptDecision=JSON.parse(JSON.stringify(receipt));
  inactivePromptDecision.witnesses[0].opponentPromptDecisionCount=1;
  inactivePromptDecision.witnesses[0].opponentWorkerDecisionCount=1;
  inactivePromptDecision.witnesses[0].workerDecisionCount=2;
  assert.throws(()=>validateNoGameWitnessReceipt(inactivePromptDecision,expected),
    /inactive role must have zero prompt decisions/);

  const inactiveRootDecision=JSON.parse(JSON.stringify(receipt));
  inactiveRootDecision.witnesses[0].opponentRootDecisionCount=1;
  inactiveRootDecision.witnesses[0].opponentWorkerDecisionCount=1;
  inactiveRootDecision.witnesses[0].workerDecisionCount=2;
  assert.throws(()=>validateNoGameWitnessReceipt(inactiveRootDecision,expected),
    /inactive role must have zero root decisions/);

  const witnessWithArtifactPath={
    ...receipt.witnesses[0],
    outputPath:'artifacts/agent36-v3-fixture/native-no-game-witness/candidate-seat-0-actor-seat-0/native-no-game-seat-witness.json'
  };
  const projectedWitness=stripNoGameWitnessArtifactPath(witnessWithArtifactPath);
  assert.deepEqual(projectedWitness,receipt.witnesses[0]);
  assert.equal(Object.hasOwn(projectedWitness,'outputPath'),false);
  const projectedReceipt={
    ...receipt,
    witnesses:receipt.witnesses.map((row,index)=>index===0?
      stripNoGameWitnessArtifactPath({...row,outputPath:'artifacts/witness.json'}):row)
  };
  assert.equal(validateNoGameWitnessReceipt(projectedReceipt,expected),projectedReceipt);

  const wrongRowSchema=JSON.parse(JSON.stringify(receipt));
  wrongRowSchema.witnesses[0].schema='agent36-v3-native-no-game-seat-witness-v2';
  assert.throws(()=>validateNoGameWitnessReceipt(wrongRowSchema,expected),
    /native no-game witness row must use the expected schema/);

  assert.throws(()=>validateNoGameWitnessReceipt({
    ...receipt,witnesses:receipt.witnesses.map((row,index)=>index===0?{...row,nativeActionFrontierUsed:false}:row)
  },expected));
  assert.throws(()=>validateNoGameWitnessReceipt({
    ...receipt,witnesses:receipt.witnesses.slice(1)
  },expected),/cover both roles in both physical seat assignments/);
  assert.throws(()=>validateNoGameWitnessReceipt({
    ...receipt,researchRevisionSha:'d'.repeat(40)
  },expected),/exact checked-out research SHA/);

  assert.throws(()=>validateNoGameWitnessReceipt({
    ...receipt,unexpectedPublicField:true
  },expected),/unknown or missing fields/);
  assert.throws(()=>validateNoGameWitnessReceipt({
    ...receipt,witnesses:receipt.witnesses.map((row,index)=>index===0?
      {...row,policySeedBySeat:[1,2]}:row)
  },expected),/forbidden field.*policySeedBySeat/);

  const nestedPrompt=JSON.parse(JSON.stringify(receipt));
  nestedPrompt.witnesses[0].seed={promptResolverContext:{promptId:'private-prompt'}};
  assert.throws(()=>validateNoGameWitnessReceipt(nestedPrompt,expected),
    /forbidden field.*promptResolverContext/);
  const nestedPolicySeed=JSON.parse(JSON.stringify(receipt));
  nestedPolicySeed.coverage=[{policySeedBySeat:[1,2]},'0:1','1:0','1:1'];
  assert.throws(()=>validateNoGameWitnessReceipt(nestedPolicySeed,expected),
    /forbidden field.*policySeedBySeat/);
  for(const forbiddenField of [
    'actorInput','promptId','actionPayload','validationReceipt',
    'opponentPrivateZones','policyRng','policySeed','nativeContext'
  ]){
    const nested=JSON.parse(JSON.stringify(receipt));
    nested.witnesses[0].seed={[forbiddenField]:'private'};
    assert.throws(()=>validateNoGameWitnessReceipt(nested,expected),
      new RegExp('forbidden field.*'+forbiddenField));
  }

  const wrongSeedType=JSON.parse(JSON.stringify(receipt));
  wrongSeedType.witnesses[0].seed=42;
  assert.throws(()=>validateNoGameWitnessReceipt(wrongSeedType,expected),
    /physical seed must be a non-empty string/);
  const wrongSeed32Type=JSON.parse(JSON.stringify(receipt));
  wrongSeed32Type.witnesses[0].seed32='not-a-number';
  assert.throws(()=>validateNoGameWitnessReceipt(wrongSeed32Type,expected),
    /seed32 must be an unsigned 32-bit integer/);
  const wrongSeed32=JSON.parse(JSON.stringify(receipt));
  wrongSeed32.witnesses[0].seed32=(wrongSeed32.witnesses[0].seed32+1)>>>0;
  assert.throws(()=>validateNoGameWitnessReceipt(wrongSeed32,expected),
    /seed32 must equal SHA-256 first UInt32LE/);
  const missingSeed32=JSON.parse(JSON.stringify(receipt));
  delete missingSeed32.witnesses[0].seed32;
  assert.throws(()=>validateNoGameWitnessReceipt(missingSeed32,expected),
    /unknown or missing fields/);
  const outOfRangeSeed32=JSON.parse(JSON.stringify(receipt));
  outOfRangeSeed32.witnesses[0].seed32=0x100000000;
  assert.throws(()=>validateNoGameWitnessReceipt(outOfRangeSeed32,expected),
    /seed32 must be an unsigned 32-bit integer/);
});

test('V3 prior-evidence gates require completed same-workflow runs strictly before the consumer',()=>{
  const workflowPath=path.join(__dirname,'../.github/workflows/agent36-bilateral-competence-v9.yml');
  const workflow=fs.readFileSync(workflowPath,'utf8');
  const gates=[
    {
      name:'contract-only prerequisite',
      start:'- name: Find exact-SHA prior successful contract-only gate',
      end:'- name: Download exact-SHA contract-only acceptance receipt'
    },
    {
      name:'native no-game prerequisite',
      start:'- name: Find exact-SHA prior successful native no-game witness run',
      end:'- name: Download exact-SHA prior V3 acceptance bundle'
    }
  ];
  for(const spec of gates){
    const start=workflow.indexOf(spec.start);
    assert.notEqual(start,-1,spec.name+' lookup step must exist');
    const end=workflow.indexOf(spec.end,start);
    assert.ok(end>start,spec.name+' lookup block must have a bounded end');
    const block=workflow.slice(start,end);
    assert.match(block,/async function main\(\)/);
    assert.match(block,/main\(\)\.catch\(error =>/);
    assert.match(block,/const expectedWorkflowId = 409927243;/);
    assert.match(block,/const currentRunId = Number\(process\.env\.GITHUB_RUN_ID\)/);
    assert.match(block,/actions\/runs\/' \+ currentRunId/);
    assert.match(block,/Date\.parse\(currentRun\.created_at\)/);
    assert.match(block,/Number\(currentRun\.workflow_id\) !== expectedWorkflowId/);
    assert.match(block,/Number\(run\.workflow_id\) === expectedWorkflowId/);
    assert.match(block,/Date\.parse\(run\.created_at\)/);
    assert.match(block,/Date\.parse\(run\.updated_at\)/);
    assert.match(block,/Number\.isFinite\(createdAt\)/);
    assert.match(block,/Number\.isFinite\(completedAt\)/);
    assert.match(block,/createdAt < currentRunCreatedAt/);
    assert.match(block,/completedAt >= createdAt/);
    assert.match(block,/completedAt < currentRunCreatedAt/);
  }
  assert.match(workflow,/- name: Deinitialize pinned Twinleaf before checkout post-job cleanup/);
  assert.ok(workflow.includes('git submodule deinit -f -- vendor/twinleaf'));
});

test('V3 worker-launching modes preflight and preserve a digest-pinned runtime receipt on each runner',()=>{
  const workflowPath=path.join(__dirname,'../.github/workflows/agent36-bilateral-competence-v9.yml');
  const workflow=fs.readFileSync(workflowPath,'utf8');
  const compile=workflow.indexOf('- name: Install and compile the pinned native server');
  const preflight=workflow.indexOf('- name: Preflight digest-pinned Docker policy-worker runtime for worker-launching modes');
  const compiled=workflow.indexOf('- name: Verify V3 compiled no-fixture worker, prompt, privacy, and fixture contracts');
  const native=workflow.indexOf('- name: Verify exact-head V3 native no-game witness for both roles and physical seats');
  const assemble=workflow.indexOf('- name: Assemble exact-SHA V3 acceptance bundle');
  const verify=workflow.indexOf('- name: Verify exact-head no-game witness receipt before fixture dispatch');
  const fixture=workflow.indexOf('- name: Execute paired V3 physical-seat fixture games');
  const preserve=workflow.indexOf('- name: Preserve per-run digest-pinned Docker policy-worker runtime receipt');

  for(const [name,index] of Object.entries({compile,preflight,compiled,native,assemble,verify,fixture,preserve}))
    assert.notEqual(index,-1,name+' workflow step must exist');
  assert.ok(compile<preflight&&preflight<compiled&&compiled<native&&native<assemble&&
    assemble<verify&&verify<fixture&&fixture<preserve,
  'worker runtime preflight and receipt preservation must bracket both worker-launching modes');

  const preflightBlock=workflow.slice(preflight,compiled);
  for(const text of [
    'id: worker_runtime_preflight',
    'inputs.agent36_v3_native_no_game_witness',
    'inputs.agent36_v3_fixture_game',
    'node simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs preflight',
    'artifacts/agent36-policy-sandbox/runtime.json'
  ]) assert.ok(preflightBlock.includes(text),'worker-mode preflight is missing '+text);

  const compiledBlock=workflow.slice(compiled,native);
  const nativeBlock=workflow.slice(native,assemble);
  assert.ok(compiledBlock.includes("steps.worker_runtime_preflight.outcome == 'success'"));
  assert.ok(nativeBlock.includes("steps.worker_runtime_preflight.outcome == 'success'"));

  const bundleBlock=workflow.slice(assemble,verify);
  assert.ok(bundleBlock.includes('docker-policy-runtime.json'));
  const verifyBlock=workflow.slice(verify,fixture);
  for(const text of [
    'verifyRuntimeReceipt',
    "directory + '/docker-policy-runtime.json'",
    "artifacts/agent36-policy-sandbox/runtime.json"
  ]) assert.ok(verifyBlock.includes(text),'fixture receipt verification is missing '+text);
  const fixtureBlock=workflow.slice(fixture,preserve);
  assert.ok(fixtureBlock.includes("steps.worker_runtime_preflight.outcome == 'success'"));

  const preserveBlock=workflow.slice(preserve);
  for(const text of ['always()','retention-days: 30','github.sha','github.run_id'])
    assert.ok(preserveBlock.includes(text),'runtime receipt preservation is missing '+text);
});

test('V3 wrong-actor no-game failure receipt preserves seats and redacts raw-preimage hashes',()=>{
  const error=new Error('wrong-actor private diagnostic text');
  error.code='NO_GAME_WITNESS_WRONG_ACTOR';
  error.expectedActorSeat=0;
  error.actualActorSeat=1;
  error.messageSha256='d'.repeat(64);
  error.assertionId='native-no-game-witness-postflight-actor-seat';
  error.actionPayloadSha256='e'.repeat(64);
  error.nativeFixtureFailure={
    stage:'policy-decode',code:'ERR_ASSERTION',actionOrdinal:11,actingSeat:0,
    actionPayloadSha256:'f'.repeat(64),messageSha256:'g'.repeat(64)
  };
  error.primaryFailure={
    stage:'primary-failure',code:'PRIMARY_NATIVE_FAILURE',messageSha256:'h'.repeat(64),
    nativeFixtureFailure:{actionPayloadSha256:'i'.repeat(64),messageSha256:'j'.repeat(64)}
  };
  error.cleanupFailures=[{
    stage:'cleanup',code:'RUNNER_HOOK_RESTORE_FAILURE',messageSha256:'k'.repeat(64),
    nativeFixtureFailure:{actionPayloadSha256:'l'.repeat(64),messageSha256:'m'.repeat(64)}
  }];
  error.workerAudit={
    nativeStateDisclosedToWorker:false,
    opponentPrivateZonesDisclosedToWorker:false,
    physicalSeedDisclosedToWorker:false,
    policySeedDisclosedToWorker:false,
    workerInputScope:'actor-observation-v3+actor-prompt-projection+public-event-receipt-v3+typed-action-frontier-v1'
  };
  const receipt=buildNoGameWitnessFailureReceipt({
    error,candidateSeat:0,opponentSeat:1,actorSeat:0,
    runnerRevision:'a'.repeat(40),enginePin:V3_FIXTURE.engineCommit,
    completedWitnesses:[{candidateSeat:0,opponentSeat:1,actorSeat:0}]
  });
  assert.equal(receipt.expectedActorSeat,0);
  assert.equal(receipt.actualActorSeat,1);
  assert.equal(receipt.fixtureFailure.expectedActorSeat,0);
  assert.equal(receipt.fixtureFailure.actualActorSeat,1);
  assert.equal(receipt.fixtureFailure.assertionId,'native-no-game-witness-postflight-actor-seat');
  assert.equal(receipt.workerAudit.nativeStateDisclosedToWorker,false);
  assert.equal(receipt.workerAudit.opponentPrivateZonesDisclosedToWorker,false);
  assert.equal(receipt.workerAudit.physicalSeedDisclosedToWorker,false);
  assert.equal(receipt.workerAudit.policySeedDisclosedToWorker,false);
  assert.equal(receipt.workerAudit.workerInputScope,
    'actor-observation-v3+actor-prompt-projection+public-event-receipt-v3+typed-action-frontier-v1');
  const failed=receipt.coverage.at(-1);
  assert.equal(failed.expectedActorSeat,0);
  assert.equal(failed.actualActorSeat,1);
  assert.equal(failed.actorSeat,0);
  const serialized=JSON.stringify(receipt);
  for(const secret of [
    'wrong-actor private diagnostic text',
    'a'.repeat(64),'d'.repeat(64),'e'.repeat(64),'f'.repeat(64),
    'g'.repeat(64),'h'.repeat(64),'i'.repeat(64),'j'.repeat(64),
    'k'.repeat(64),'l'.repeat(64),'m'.repeat(64),
    'messageSha256','actionPayloadSha256'
  ]) assert.equal(serialized.includes(secret),false,'public no-game failure receipt leaked '+secret);

  const unknownBoundaryReceipt=buildNoGameWitnessFailureReceipt({
    error:{code:'NO_GAME_WITNESS_WRONG_ACTOR',workerAudit:{
      nativeStateDisclosedToWorker:'false',
      opponentPrivateZonesDisclosedToWorker:0,
      workerInputScope:'noncanonical-worker-scope'
    }},
    candidateSeat:0,opponentSeat:1,actorSeat:0
  });
  assert.equal(unknownBoundaryReceipt.workerAudit.nativeStateDisclosedToWorker,null);
  assert.equal(unknownBoundaryReceipt.workerAudit.opponentPrivateZonesDisclosedToWorker,null);
  assert.equal(unknownBoundaryReceipt.workerAudit.workerInputScope,null);

  const invalidAssertionIdReceipt=buildNoGameWitnessFailureReceipt({
    error:{code:'NATIVE_NO_GAME_WITNESS_ASSERTION',assertionId:'private actor hand details'},
    candidateSeat:0,opponentSeat:1,actorSeat:0
  });
  assert.equal(invalidAssertionIdReceipt.fixtureFailure.assertionId,undefined,
    'public failure receipt must reject noncanonical assertion identifiers');
});

test('native failure projection preserves only a safe repository assertion site',()=>{
  const site={
    file:'simulation/evaluation/2026-11/agent36-native-action-frontier.cjs',
    line:499,column:7
  };
  const nativeFailure={
    stage:'policy-decode',code:'ERR_ASSERTION',actionOrdinal:11,
    actingSeat:1,turnBefore:1,name:'AssertionError',
    actionPayloadSha256:'c'.repeat(64),messageSha256:'a'.repeat(64),messageLength:79,
    stackSite:{...site,absolutePath:'/home/runner/work/experiment-01/experiment-01/private/secret.js'}
  };
  const projectedNative=projectNativeFixtureFailureForReceipt(nativeFailure);
  assert.deepEqual(projectedNative.stackSite,site);
  assert.equal(projectedNative.actionPayloadSha256,undefined);
  assert.equal(projectedNative.messageSha256,undefined);
  assert.equal(JSON.stringify(projectedNative).includes('a'.repeat(64)),false);
  assert.equal(JSON.stringify(projectedNative).includes('c'.repeat(64)),false);
  assert.equal(JSON.stringify(projectedNative).includes('/home/runner/'),false);
  assert.equal(JSON.stringify(projectedNative).includes('private/secret.js'),false);

  const projectedFixture=projectV3FixtureFailureForReceipt({
    message:'private raw error text',
    fixtureFailure:{
      stage:'policy-decode',code:'ERR_ASSERTION',name:'AssertionError',
      messageSha256:'b'.repeat(64),messageLength:79,
      nativeFixtureFailure:nativeFailure
    }
  });
  assert.deepEqual(projectedFixture.nativeFixtureFailure.stackSite,site);
  const projectedFixtureJson=JSON.stringify(projectedFixture);
  for(const secret of ['a'.repeat(64),'b'.repeat(64),'c'.repeat(64),
    'messageSha256','actionPayloadSha256','private raw error text'])
    assert.equal(projectedFixtureJson.includes(secret),false,'public fixture failure leaked '+secret);
  const rejected=projectNativeFixtureFailureForReceipt({
    ...nativeFailure,stackSite:{file:'private/secret.js',line:2,column:3}
  });
  assert.equal(rejected.stackSite,undefined);
});

test('V3 wrong-actor resolver failure survives callback projection and final witness receipt',async()=>{
  const workerAudit=createV3WorkerExecutionAudit({candidateSeat:0,opponentSeat:1});
  const resolver=createV3WorkerDecisionResolver({
    sessionsBySeat:{},
    candidateSeat:0,
    opponentSeat:1,
    native:{observe(){throw new Error('actor-seat guard must run before observation');}},
    workerAudit,
    expectedActorSeat:0,
    stopBeforeLiveDispatch:true
  });
  let resolverFailure=null;
  await assert.rejects(resolver({
    kind:'native-fixture-decision',
    actorSeat:1,
    prompt:null,
    state:{}
  }),error=>{
    resolverFailure=error;
    assert.equal(error.code,'NO_GAME_WITNESS_WRONG_ACTOR');
    assert.equal(error.expectedActorSeat,0);
    assert.equal(error.actualActorSeat,1);
    return true;
  });

  // This is the same safe projection used by runV3FixtureGame's native callback catch.
  const callbackFixtureFailure=projectV3RoleFailureForReceipt(resolverFailure);
  assert.equal(callbackFixtureFailure.expectedActorSeat,0);
  assert.equal(callbackFixtureFailure.actualActorSeat,1);
  workerAudit.roles.opponent.promptDecisionCount=1;
  workerAudit.roles.opponent.decisionCount=1;
  workerAudit.roles.opponent.setupPromptCounts={
    'ShowMulliganPrompt:SETUP_OPPONENT_NO_BASIC':1
  };
  workerAudit.totalWorkerDecisions=1;
  const receipt=buildNoGameWitnessFailureReceipt({
    error:{fixtureFailure:callbackFixtureFailure,workerAudit},
    candidateSeat:0,opponentSeat:1,actorSeat:0,
    runnerRevision:'a'.repeat(40),enginePin:V3_FIXTURE.engineCommit
  });
  assert.equal(receipt.fixtureFailure.code,'NO_GAME_WITNESS_WRONG_ACTOR');
  assert.equal(receipt.fixtureFailure.expectedActorSeat,0);
  assert.equal(receipt.fixtureFailure.actualActorSeat,1);
  assert.equal(receipt.expectedActorSeat,0);
  assert.equal(receipt.actualActorSeat,1);
  const failed=receipt.coverage.at(-1);
  assert.equal(failed.expectedActorSeat,0);
  assert.equal(failed.actualActorSeat,1);
  assert.equal(failed.actorSeat,0);
  assert.equal(JSON.stringify(receipt).includes('actor-seat guard must run before observation'),false);
});

test('no-game witness accepts only the frozen setup prompt types and projects their counts safely',()=>{
  const validAudit={
    promptDecisionCount:3,
    setupPromptCounts:{
      'ConfirmPrompt:GO_FIRST':1,
      'ShowMulliganPrompt:SETUP_OPPONENT_NO_BASIC':1,
      'ChooseCardsPrompt:CHOOSE_STARTING_POKEMONS':1
    }
  };
  assert.equal(isNoGameWitnessSetupPromptAudit(validAudit),true);
  assert.equal(isNoGameWitnessSetupPromptAudit({
    ...validAudit,promptDecisionCount:2
  }),false,'prompt type counts must sum to the worker prompt decision count');
  assert.equal(isNoGameWitnessSetupPromptAudit({
    promptDecisionCount:1,
    setupPromptCounts:{'AttachEnergyPrompt:ATTACH_ENERGY':1}
  }),false,'non-setup prompt types must not satisfy the no-game witness');

  const workerAudit=createV3WorkerExecutionAudit({candidateSeat:0,opponentSeat:1});
  workerAudit.roles.opponent.promptDecisionCount=3;
  workerAudit.roles.opponent.setupPromptCounts={
    'ConfirmPrompt:GO_FIRST':1,
    'ShowMulliganPrompt:SETUP_OPPONENT_NO_BASIC':1,
    'ChooseCardsPrompt:CHOOSE_STARTING_POKEMONS':1,
    'PrivateCardPrompt:private actor card':1
  };
  const projected=projectV3WorkerAuditForFailure(workerAudit);
  assert.deepEqual(projected.roles.opponent.setupPromptCounts,{
    'ConfirmPrompt:GO_FIRST':1,
    'ShowMulliganPrompt:SETUP_OPPONENT_NO_BASIC':1,
    'ChooseCardsPrompt:CHOOSE_STARTING_POKEMONS':1,
    other:1
  });
  assert.equal(JSON.stringify(projected).includes('private actor card'),false,
    'failure projection must not publish unknown prompt message text');
});

test('V3 no-game failure receipt coarsens worker prompt abstention reasons to a public generic code',async()=>{
  const workerAudit=createV3WorkerExecutionAudit({candidateSeat:0,opponentSeat:1});
  const actorObservation={actorSeat:1,decisionKind:'owner-prompt'};
  const actorObservationSha256=evidenceBundleSha256(actorObservation);
  const resolver=createV3WorkerDecisionResolver({
    sessionsBySeat:{
      1:{async decide(){
        const policyVersion='runner-test-policy-v1';
        return {
          requestId:'runner-test-request-1',sequence:1,role:'opponent',seat:1,
          policyVersion,bundleSha256:'a'.repeat(64),
          decision:{kind:'abstain',reasonCode:'INVALID_STARTING_POKEMON_PROMPT'},
          policyAudit:{
            schema:'agent6-policy-audit-v1',policyVersion,
            decisionKind:'owner-prompt',decisionType:'abstain',
            selectionRuleCode:'ABSTAIN_POLICY_DECISION',tieBreakCode:'NONE',
            selectedTokens:[],evaluations:[]
          },
          policyDrawCount:0
        };
      }}
    },
    candidateSeat:0,
    opponentSeat:1,
    native:{observe(){return {actorSeat:1,decisionKind:'owner-prompt'};}},
    workerAudit,
    eventReceipt:()=>null,
    promptProjection:{
      projectPrompt(){return {
        hostOnly:false,
        promptProjection:{promptType:'ChooseCardsPrompt',choices:[]}
      };}
    }
  });
  let resolverFailure=null;
  await assert.rejects(resolver({
    kind:'native-fixture-decision',
    decisionKind:'owner-prompt',actionOrdinal:1,
    actorObservation,actorObservationSha256,
    actorSeat:1,
    prompt:{},
    state:{activePlayer:1},
    store:{}
  }),error=>{
    resolverFailure=error;
    assert.equal(error.code,'POLICY_ABSTAINED');
    return true;
  });
  assert.equal(workerAudit.roles.opponent.lastAbstentionReasonCode,
    'INVALID_STARTING_POKEMON_PROMPT');
  assert.equal(resolverFailure.workerDecisionTrace.actorInputSha256,actorObservationSha256);
  assert.equal(resolverFailure.workerDecisionTrace.validationReceipt,null);
  assert.equal(resolverFailure.workerDecisionTrace.failureCode,'POLICY_ABSTAINED');
  workerAudit.roles.candidate.lastAbstentionReasonCode='PRIVATE_ACTOR_HAND_HAS_UNIQUE_CARD';
  const receipt=buildNoGameWitnessFailureReceipt({
    error:{code:resolverFailure.code,workerAudit},
    candidateSeat:0,opponentSeat:1,actorSeat:1,
    runnerRevision:'a'.repeat(40),enginePin:V3_FIXTURE.engineCommit
  });
  assert.equal(receipt.workerAudit.roles.opponent.lastAbstentionReasonCode,
    'POLICY_ABSTAINED');
  assert.equal(receipt.workerAudit.roles.candidate.lastAbstentionReasonCode,
    'POLICY_ABSTAINED');
  const publicReceipt=JSON.stringify(receipt);
  assert.equal(publicReceipt.includes('INVALID_STARTING_POKEMON_PROMPT'),false);
  assert.equal(publicReceipt.includes('PRIVATE_ACTOR_HAND_HAS_UNIQUE_CARD'),false);
});

test('V3 outer runner cleanup receipt preserves primary and cleanup summaries without raw failure state',()=>{
  const primary=new Error('primary private actor/prompt diagnostic');
  primary.code='PRIMARY_NATIVE_FAILURE';
  primary.actingPlayerId='private-player-id';
  primary.pendingPromptId='private-prompt-id';
  const cleanup=new Error('cleanup private path and process details');
  cleanup.code='RUNNER_HOOK_RESTORE_FAILURE';
  cleanup.actorSeat=1;
  const failure=buildV3RunnerFailureError({
    runnerFailure:primary,
    runnerStage:'native-game',
    runnerCleanupFailures:[{stage:'runner-hook-restore',error:cleanup}],
    workerAudit:{
      totalFailures:2,cleanupFailureCount:1,
      physicalSeed:'private-physical-seed',
      opponentPrivateZones:['private-card-id'],
      physicalSeedDisclosedToWorker:false,
      policySeedDisclosedToWorker:false,
      nativeStateDisclosedToWorker:false,
      opponentPrivateZonesDisclosedToWorker:false
    }
  });
  assert.equal(failure.code,'V3_RUNNER_CLEANUP_FAILURE');
  assert.equal(failure.fixtureFailure.primaryFailure.code,'PRIMARY_NATIVE_FAILURE');
  assert.equal(failure.fixtureFailure.primaryFailure.stage,'native-game');
  assert.equal(failure.fixtureFailure.cleanupFailures.length,1);
  assert.equal(failure.fixtureFailure.cleanupFailures[0].code,'RUNNER_HOOK_RESTORE_FAILURE');
  assert.equal(failure.fixtureFailure.cleanupFailures[0].stage,'runner-hook-restore');
  const serialized=JSON.stringify({
    fixtureFailure:failure.fixtureFailure,
    workerAudit:failure.workerAudit,
    message:failure.message
  });
  for(const secret of [
    'primary private actor/prompt diagnostic','cleanup private path and process details',
    'private-player-id','private-prompt-id','private-physical-seed','private-card-id'
  ]) assert.equal(serialized.includes(secret),false,'receipt leaked '+secret);
  const receipt=JSON.parse(serialized);
  const forbiddenKeys=new Set(['actingPlayerId','pendingPromptId','actorSeat','physicalSeed','opponentPrivateZones']);
  function containsForbiddenKey(value) {
    if(Array.isArray(value))return value.some(containsForbiddenKey);
    if(value&&typeof value==='object')return Object.entries(value).some(([key,child])=>
      forbiddenKeys.has(key)||containsForbiddenKey(child));
    return false;
  }
  assert.equal(containsForbiddenKey(receipt),false,'receipt contains a forbidden raw field key');
  assert.equal(failure.workerAudit.physicalSeedDisclosedToWorker,false);
  assert.equal(failure.workerAudit.policySeedDisclosedToWorker,false);
  assert.equal(failure.workerAudit.nativeStateDisclosedToWorker,false);
  assert.equal(failure.workerAudit.opponentPrivateZonesDisclosedToWorker,false);
  assert.match(failure.message,/Native V3 fixture runner failed during runner-hook-restore/);
});



function makeV3SetupPromptAuditFixture(){
  const {evidenceBundleSha256}=require('../simulation/evaluation/canonical-evidence-json.cjs');
  const specs=[
    {actionOrdinal:0,seat:0,role:'candidate',promptId:'setup-basic-0',
      promptType:'ChooseCardsPrompt',message:'CHOOSE_STARTING_POKEMONS',minimumCount:1},
    {actionOrdinal:1,seat:0,role:'candidate',promptId:'setup-first-0',
      promptType:'ConfirmPrompt',message:'GO_FIRST'},
    {actionOrdinal:2,seat:0,role:'candidate',promptId:'setup-draw-0',
      promptType:'SelectPrompt',message:'WANT_TO_DRAW_CARDS'},
    {actionOrdinal:3,seat:0,role:'candidate',promptId:'setup-extra-bench-0',
      promptType:'ChooseCardsPrompt',message:'CHOOSE_STARTING_POKEMONS',minimumCount:0},
    {actionOrdinal:4,seat:1,role:'opponent',promptId:'setup-basic-1',
      promptType:'ChooseCardsPrompt',message:'CHOOSE_STARTING_POKEMONS',minimumCount:1}
  ];
  const decisionTrace=[];
  const rootActionLedger=[];
  const fullStateTraceSteps=[];
  for(const spec of specs){
    const token='token-'+spec.actionOrdinal;
    const choice={token,label:'engine choice '+spec.actionOrdinal};
    const selectedTokens=[token];
    const selectedItems=[choice];
    const selectedItemsSha256=evidenceBundleSha256(selectedItems);
    const promptProjection={
      schema:'agent49-native-prompt-projection-v1',
      actingSeat:spec.seat,
      promptType:spec.promptType,
      description:spec.message,
      source:{sourceKind:'engine',sourcePrinting:null,effectName:spec.message},
      publicMetadata:{minimumCount:spec.minimumCount??null},
      choices:[choice]
    };
    const promptProjectionSha256=evidenceBundleSha256(promptProjection);
    const actionFrontier={schema:'agent6-native-action-frontier-v1',items:[]};
    const actionFrontierSha256=evidenceBundleSha256(actionFrontier);
    const validationReceipt={
      schema:'agent6-cloned-store-prompt-validation-v1',
      promptId:spec.promptId,
      actorSeat:spec.seat,
      promptDecodeValidated:true,
      clonedPromptResolved:true,
      nativeValidationStoreMode:'cloned-store',
      fullOriginalStoreStateUnchanged:true,
      selectedTokens,
      selectedItemsSha256,
      promptProjectionSha256,
      actionFrontierSha256
    };
    const validationReceiptSha256=evidenceBundleSha256(validationReceipt);
    const actorInput={schema:'agent6-actor-observation-v3',actorSeat:spec.seat,
      decisionKind:'owner-prompt',turn:0};
    const actorInputSha256=evidenceBundleSha256(actorInput);
    const workerDecisionTrace={
      schema:'agent6-worker-decision-trace-v1',
      traceStatus:'validated',
      failureCode:null,
      sequence:spec.actionOrdinal+1,
      requestId:'request-'+spec.actionOrdinal,
      policyVersion:spec.role+'-policy-v1',
      bundleSha256:'a'.repeat(64),
      actionOrdinal:spec.actionOrdinal,
      seat:spec.seat,
      role:spec.role,
      decisionKind:'owner-prompt',
      actorInput,
      actorInputSha256,
      actorObservationSha256:actorInputSha256,
      publicEventReceipt:null,
      publicEventReceiptSha256:null,
      promptProjection,
      promptProjectionSha256,
      actionFrontier,
      actionFrontierSha256,
      inputBindingSha256:evidenceBundleSha256({
        observation:actorInput,publicEventReceipt:null,promptProjection,actionFrontier
      }),
      selectedTokens,
      selectedItems,
      selectedItemsSha256,
      unmatchedSelectedTokens:[],
      selectionStatus:'resolved',
      decision:{kind:'select-choice',token},
      policyAudit:{decisionKind:'owner-prompt',decisionType:'select-choice',
        policyVersion:spec.role+'-policy-v1',selectedTokens},
      policyAuditSha256:'b'.repeat(64),
      validationReceipt,
      validationReceiptSha256
    };
    const workerDecisionTraceSha256=evidenceBundleSha256(workerDecisionTrace);
    const actionPayload={
      actionName:'ResolvePromptAction',
      fields:{promptId:spec.promptId,result:spec.message==='GO_FIRST'?false:[{token}]}
    };
    const actionPayloadSha256=evidenceBundleSha256(actionPayload);
    const promptResolverContext={
      promptId:spec.promptId,
      promptType:spec.promptType,
      playerId:'player-'+spec.seat,
      perspectivePlayerId:'player-'+spec.seat,
      actingSeat:spec.seat,
      resolver:'native-prompt-resolver',
      message:spec.message,
      availableOptions:{min:spec.minimumCount??null}
    };
    const promptResolution={
      kind:'worker-choice',decisionKind:'select-choice',selectedCount:1
    };
    const publicPlayers=[
      {id:'player-0',prizes:6,active:true},
      {id:'player-1',prizes:6,active:true}
    ];
    const row={
      actionOrdinal:spec.actionOrdinal,
      actingSeat:spec.seat,
      actingPlayerId:'player-'+spec.seat,
      phaseBefore:1,
      turnBefore:0,
      pendingPromptType:spec.promptType,
      pendingPromptId:spec.promptId,
      promptResolution,
      isRootDecision:false,
      policyInputKind:'native-owner-prompt',
      promptResolverContext,
      decisionKind:'owner-prompt',
      workerDecisionTrace,
      workerDecisionTraceSha256,
      validationReceipt,
      validationReceiptSha256,
      actionName:'ResolvePromptAction',
      actionPayload,
      actionPayloadSha256,
      dispatchStatus:'succeeded',
      publicStateAfter:{players:publicPlayers}
    };
    decisionTrace.push(row);
    rootActionLedger.push({
      actionOrdinal:spec.actionOrdinal,
      actorSeat:spec.seat,
      playerId:'player-'+spec.seat,
      turnBefore:0,
      action:'ResolvePromptAction',
      actionPayloadSha256,
      pendingPrompt:spec.promptType,
      isRootDecision:false,
      promptResolution,
      policyInputKind:'native-owner-prompt',
      decisionKind:'owner-prompt',
      workerDecisionTraceSha256,
      validationReceiptSha256,
      promptResolverContext,
      dispatchStatus:'succeeded'
    });
    const pendingPromptSnapshot={
      schema:'twinleaf-native-state-snapshot-v1',
      nodeCount:promptResolverContext.availableOptions.min===null?1:2,
      truncated:false,
      limits:{maxDepth:64,maxNodes:50000},
      snapshot:{
        $id:1,$type:spec.promptType,
        properties:{
          id:spec.promptId,
          playerId:'player-'+spec.seat,
          message:spec.message,
          ...(spec.minimumCount===undefined?{}:{
            options:{$id:2,$type:'Object',properties:{min:promptResolverContext.availableOptions.min}}
          })
        }
      }
    };
    fullStateTraceSteps.push({
      actionOrdinal:spec.actionOrdinal+1,
      publicBoard:publicPlayers,
      pendingPrompt:pendingPromptSnapshot
    });
  }
  const rootRows=[
    {actionOrdinal:5,seat:0},
    {actionOrdinal:6,seat:1}
  ];
  for(const spec of rootRows){
    decisionTrace.push({
      actionOrdinal:spec.actionOrdinal,
      actingSeat:spec.seat,
      actingPlayerId:'player-'+spec.seat,
      phaseBefore:2,
      turnBefore:1,
      decisionKind:'owner-root',
      isRootDecision:true
    });
    rootActionLedger.push({
      actionOrdinal:spec.actionOrdinal,
      actorSeat:spec.seat,
      playerId:'player-'+spec.seat,
      turnBefore:1,
      action:'AttackAction',
      actionPayloadSha256:'c'.repeat(64),
      pendingPrompt:null,
      isRootDecision:true,
      policyInputKind:'native-owner-root',
      decisionKind:'owner-root',
      workerDecisionTraceSha256:'d'.repeat(64),
      validationReceiptSha256:'e'.repeat(64),
      dispatchStatus:'succeeded'
    });
    fullStateTraceSteps.push({
      actionOrdinal:spec.actionOrdinal+1,
      publicBoard:[
        {id:'player-0',prizes:6,active:true},
        {id:'player-1',prizes:6,active:true}
      ],
      pendingPrompt:null
    });
  }
  const workerExecutionAudit={
    schema:'agent49-v3-worker-execution-audit-v1',
    workerProcessPerRole:true,
    physicalSeedDisclosedToWorker:false,
    policySeedDisclosedToWorker:false,
    nativeStateDisclosedToWorker:false,
    opponentPrivateZonesDisclosedToWorker:false,
    workerInputScope:'actor-observation-v3+actor-prompt-projection+public-event-receipt-v3+typed-action-frontier-v1',
    totalWorkerDecisions:7,totalHostOnlyPrompts:0,totalAbstentions:0,totalFailures:0,
    policyRngViolations:0,replayableEvidence:true,cleanupVerified:true,
    cleanupFailureCount:0,
    cleanupReceipts:[
      {role:'candidate',processClosed:true,containerRemoved:true},
      {role:'opponent',processClosed:true,containerRemoved:true}
    ],
    roles:{
      candidate:{
        role:'candidate',seat:0,policyVersion:'candidate-policy-v1',
        bundleSha256:'c'.repeat(64),policySha256:'d'.repeat(64),
        decisionCount:5,rootDecisionCount:1,promptDecisionCount:4,hostOnlyPromptCount:0,
        abstentionCount:0,failureCount:0,timeoutCount:0,
        workerProcessClosed:true,containerRemoved:true,policyBundleRemoved:true,
        policyRngReplayable:true,policyDrawViolationCount:0,actionFrontierAdmissionFailureCount:0
      },
      opponent:{
        role:'opponent',seat:1,policyVersion:'opponent-policy-v1',
        bundleSha256:'e'.repeat(64),policySha256:'f'.repeat(64),
        decisionCount:2,rootDecisionCount:1,promptDecisionCount:1,hostOnlyPromptCount:0,
        abstentionCount:0,failureCount:0,timeoutCount:0,
        workerProcessClosed:true,containerRemoved:true,policyBundleRemoved:true,
        policyRngReplayable:true,policyDrawViolationCount:0,actionFrontierAdmissionFailureCount:0
      }
    }
  };
  return {
    candidateSeat:0,opponentSeat:1,decisionTrace,rootActionLedger,
    workerExecutionAudit,fullStateTraceSteps
  };
}

test('Agent19 V3-native setup audit joins starting-Basic and GO_FIRST worker receipts to driver, ledger, and recorder',()=>{
  const fixture=makeV3SetupPromptAuditFixture();
  const audit=buildSetupPromptAudit(fixture);
  assert.equal(audit.schema,'agent19-agent36-v3-native-setup-prompt-audit-v1');
  assert.equal(audit.visibility,'encrypted-full-only');
  assert.equal(audit.complete,true,audit.failures.join(','));
  assert.equal(audit.accepted,true,audit.failures.join(','));
  assert.equal(audit.setupPromptDecisions,5);
  assert.deepEqual(audit.roles.candidate.counts,
    {startingBasics:1,optionalExtraBenchPlacements:1,goFirst:1,wantToDrawCards:1});
  assert.deepEqual(audit.roles.opponent.counts,
    {startingBasics:1,optionalExtraBenchPlacements:0,goFirst:0,wantToDrawCards:0});
  assert.deepEqual(audit.roles.candidate.setupPromptRows.map(row=>row.actionOrdinal),[0,1,2,3]);
  assert.deepEqual(audit.roles.opponent.setupPromptRows.map(row=>row.actionOrdinal),[4]);
  assert.equal(audit.roles.candidate.setupPromptRows[2].kind,'want-to-draw-cards');
  assert.equal(audit.roles.candidate.setupPromptRows[3].kind,'optional-extra-bench-placement');
  assert.equal(audit.roles.candidate.setupPromptRows[3].minimumCount,0);
  assert.equal(audit.roles.candidate.setupPromptRows[3].recorderPromptSnapshotVerified,true);
  assert.equal(audit.roles.candidate.counts.optionalExtraBenchPlacements,1);
  assert.ok([...audit.roles.candidate.setupPromptRows,...audit.roles.opponent.setupPromptRows]
    .every(row=>row.accepted&&row.ledgerJoinVerified&&row.recorderJoinVerified));
});

test('Agent19 V3-native setup audit fails closed on missing rows, digest/ledger tampering, or recorder mismatch',()=>{
  const missing=makeV3SetupPromptAuditFixture();
  missing.decisionTrace.splice(0,1);
  missing.rootActionLedger.splice(0,1);
  missing.fullStateTraceSteps.splice(0,1);
  const missingAudit=buildSetupPromptAudit(missing);
  assert.equal(missingAudit.accepted,false);
  assert.ok(missingAudit.failures.some(value=>value.includes('required-starting-basic-prompt-count-not-one')));

  const tampered=makeV3SetupPromptAuditFixture();
  tampered.decisionTrace[0].actionPayloadSha256='0'.repeat(64);
  const tamperedAudit=buildSetupPromptAudit(tampered);
  assert.equal(tamperedAudit.accepted,false);
  assert.ok(tamperedAudit.roles.candidate.failures.some(value=>value.includes('worker-or-action-payload-digest-invalid')));

  const recorderMismatch=makeV3SetupPromptAuditFixture();
  recorderMismatch.fullStateTraceSteps[0].publicBoard=[{id:'wrong-public-state'}];
  const recorderAudit=buildSetupPromptAudit(recorderMismatch);
  assert.equal(recorderAudit.accepted,false);
  assert.ok(recorderAudit.roles.candidate.failures.some(value=>value.includes('recorder-public-board-join-invalid')));

  const countMismatch=makeV3SetupPromptAuditFixture();
  countMismatch.workerExecutionAudit.roles.candidate.promptDecisionCount++;
  const countAudit=buildSetupPromptAudit(countMismatch);
  assert.equal(countAudit.accepted,false);
  assert.ok(countAudit.failures.some(value=>value.includes('promptDecisionCount-does-not-reconcile-to-native-trace')));

  const missingMinimum=makeV3SetupPromptAuditFixture();
  delete missingMinimum.decisionTrace[0].workerDecisionTrace.promptProjection.publicMetadata.minimumCount;
  const minimumAudit=buildSetupPromptAudit(missingMinimum);
  assert.equal(minimumAudit.accepted,false);
  assert.ok(minimumAudit.failures.some(value=>value.includes('starting-pokemon-minimum-count-invalid')));

  const duplicateMandatory=makeV3SetupPromptAuditFixture();
  duplicateMandatory.decisionTrace[3].workerDecisionTrace.promptProjection.publicMetadata.minimumCount=1;
  const duplicateAudit=buildSetupPromptAudit(duplicateMandatory);
  assert.equal(duplicateAudit.accepted,false);
  assert.ok(duplicateAudit.roles.candidate.failures.some(value=>
    value.includes('required-starting-basic-prompt-count-not-one')));

  const duplicateDrawChoice=makeV3SetupPromptAuditFixture();
  const drawChoiceRow=duplicateDrawChoice.decisionTrace.find(row=>
    row.promptResolverContext.message==='WANT_TO_DRAW_CARDS');
  duplicateDrawChoice.decisionTrace.push({
    ...drawChoiceRow,
    actionOrdinal:7,
    pendingPromptId:'setup-draw-duplicate'
  });
  const duplicateDrawAudit=buildSetupPromptAudit(duplicateDrawChoice);
  assert.ok(duplicateDrawAudit.failures.includes('want-to-draw-cards-prompt-count-exceeds-one'));

  const duplicateOptionalBench=makeV3SetupPromptAuditFixture();
  const benchRow=duplicateOptionalBench.decisionTrace.find(row=>
    row.promptResolverContext.message==='CHOOSE_STARTING_POKEMONS'&&
    row.workerDecisionTrace.promptProjection.publicMetadata.minimumCount===0);
  duplicateOptionalBench.decisionTrace.push({
    ...benchRow,
    actionOrdinal:8,
    pendingPromptId:'setup-extra-bench-duplicate'
  });
  const duplicateBenchAudit=buildSetupPromptAudit(duplicateOptionalBench);
  assert.ok(duplicateBenchAudit.failures.includes('optional-extra-bench-prompt-count-exceeds-one'));

  const benchWithoutDrawChoice=makeV3SetupPromptAuditFixture();
  benchWithoutDrawChoice.decisionTrace=benchWithoutDrawChoice.decisionTrace.filter(row=>
    row.promptResolverContext?.message!=='WANT_TO_DRAW_CARDS');
  benchWithoutDrawChoice.rootActionLedger=benchWithoutDrawChoice.rootActionLedger.filter(row=>
    row.actionOrdinal!==2);
  benchWithoutDrawChoice.fullStateTraceSteps=benchWithoutDrawChoice.fullStateTraceSteps.filter(step=>
    step.actionOrdinal!==3);
  benchWithoutDrawChoice.workerExecutionAudit.totalWorkerDecisions=6;
  benchWithoutDrawChoice.workerExecutionAudit.roles.candidate.decisionCount=4;
  benchWithoutDrawChoice.workerExecutionAudit.roles.candidate.promptDecisionCount=3;
  const benchWithoutDrawAudit=buildSetupPromptAudit(benchWithoutDrawChoice);
  assert.ok(benchWithoutDrawAudit.failures.includes('optional-extra-bench-requires-one-draw-choice'));

  const benchBeforeDraw=makeV3SetupPromptAuditFixture();
  const drawRow=benchBeforeDraw.decisionTrace.find(row=>
    row.promptResolverContext.message==='WANT_TO_DRAW_CARDS');
  const optionalBenchRow=benchBeforeDraw.decisionTrace.find(row=>
    row.promptResolverContext.message==='CHOOSE_STARTING_POKEMONS'&&
    row.workerDecisionTrace.promptProjection.publicMetadata.minimumCount===0);
  [drawRow.actionOrdinal,optionalBenchRow.actionOrdinal]=
    [optionalBenchRow.actionOrdinal,drawRow.actionOrdinal];
  const benchBeforeDrawAudit=buildSetupPromptAudit(benchBeforeDraw);
  assert.ok(benchBeforeDrawAudit.failures.includes('optional-extra-bench-must-follow-same-actor-draw-choice'));

  const duplicateGoFirst=makeV3SetupPromptAuditFixture();
  duplicateGoFirst.decisionTrace.push({...duplicateGoFirst.decisionTrace[1]});
  const duplicateGoFirstAudit=buildSetupPromptAudit(duplicateGoFirst);
  assert.equal(duplicateGoFirstAudit.accepted,false);
  assert.ok(duplicateGoFirstAudit.failures.includes('required-go-first-prompt-count-not-one'));

  const missingRecorderPrompt=makeV3SetupPromptAuditFixture();
  delete missingRecorderPrompt.fullStateTraceSteps[0].pendingPrompt;
  const missingRecorderPromptAudit=buildSetupPromptAudit(missingRecorderPrompt);
  assert.equal(missingRecorderPromptAudit.accepted,false);
  assert.ok(missingRecorderPromptAudit.roles.candidate.failures.some(value=>
    value.includes('recorder-prompt-snapshot-missing')));

  const recorderMinimumMismatch=makeV3SetupPromptAuditFixture();
  recorderMinimumMismatch.fullStateTraceSteps[0].pendingPrompt.snapshot.properties.options.properties.min=0;
  const recorderMinimumMismatchAudit=buildSetupPromptAudit(recorderMinimumMismatch);
  assert.equal(recorderMinimumMismatchAudit.accepted,false);
  assert.ok(recorderMinimumMismatchAudit.roles.candidate.failures.some(value=>
    value.includes('recorder-prompt-minimum-count-mismatch')));
});

test('V3 runner uses native setup receipts and keeps their projections behind the encrypted-full boundary',()=>{
  const source=fs.readFileSync(path.resolve(__dirname,
    '../simulation/evaluation/2026-11/agent36-v3-runner.cjs'),'utf8');
  const helper=fs.readFileSync(path.resolve(__dirname,
    '../simulation/evaluation/2026-11/agent19-setup-prompt-audit.cjs'),'utf8');
  const witnessStart=source.indexOf('const witnessReceipt={');
  const witnessEnd=source.indexOf('writeJsonAtomic(witnessPath,witnessReceipt)',witnessStart);
  const setupAuditStart=source.indexOf('const setupPromptAudit=fullStateTraceRecorder?');
  const setupAuditEnd=source.indexOf('const setupPromptAuditAcceptance=',setupAuditStart);
  assert.ok(witnessStart>=0&&witnessEnd>witnessStart&&setupAuditStart>witnessEnd,
    'no-game witness must return before setup receipts are projected');
  assert.doesNotMatch(source.slice(witnessStart,witnessEnd),/setupPromptAudit/);
  assert.match(source,/diagnosticMode==='encrypted-full'&&!witnessOnly/);
  assert.match(source,/setupPromptAuditAcceptance\.accepted/);
  assert.match(source,/SETUP_PROMPT_AUDIT_INCOMPLETE/);
  assert.match(source,/setupPromptAudit,\s*setupPromptAuditAcceptance/);
  assert.match(source,/=== ENCRYPTED ACTOR-OWNED SETUP PROMPT AUDIT ===/);
  assert.match(source,/projectV3WorkerExecutionBoundaryToTrial/);
  assert.match(source,/name: 'setupPromptAudit', path: 'simulation\/evaluation\/2026-11\/agent19-setup-prompt-audit\.cjs', exportName: 'buildSetupPromptAudit'/);
  assert.match(source,/V3_WORKER_EXECUTION_BOUNDARY_INCOMPLETE/);
  assert.match(source,/workerExecutionBoundaryValid/);
  assert.match(source,/actorOnlyExecutionBoundaryApplicable:false/);
  assert.match(source.slice(setupAuditStart,setupAuditEnd),/workerExecutionAudit/);
  assert.match(source.slice(setupAuditStart,setupAuditEnd),/fullStateTraceSteps/);
  assert.doesNotMatch(source.slice(setupAuditStart,setupAuditEnd),/candidateAudit|opponentAudit/);
  assert.doesNotMatch(helper,/candidateAudit|opponentAudit|runCandidateOpponentPolicyRoles/);
  assert.match(helper,/promptResolverContext/);
  assert.match(helper,/workerDecisionTrace/);
  assert.match(helper,/fullStateTraceSteps/);
});


test('V3 callback result normalizer feeds native setup receipts without legacy role-composer audits',()=>{
  const fixture=makeV3SetupPromptAuditFixture();
  const nativeGameResult={
    schema:'aichi-native-fixture-game-v1',
    finished:true,
    endReason:'engine-game-end',
    actions:fixture.decisionTrace.length,
    decisionTrace:fixture.decisionTrace,
    rootActionLedger:fixture.rootActionLedger
  };
  // This is the actual V3 runner callback contract: {result: gameResult, workerAudit}.
  const normalized=normalizeV3FixtureRoleResult({
    result:nativeGameResult,
    workerAudit:fixture.workerExecutionAudit
  });
  assert.equal(normalized.gameResult,nativeGameResult);
  assert.equal(normalized.workerExecutionAudit,fixture.workerExecutionAudit);
  assert.equal(normalized.roleResult.candidateAudit,undefined);
  assert.equal(normalized.roleResult.opponentAudit,undefined);
  const audit=buildSetupPromptAudit({
    candidateSeat:fixture.candidateSeat,
    opponentSeat:fixture.opponentSeat,
    decisionTrace:normalized.gameResult.decisionTrace,
    rootActionLedger:normalized.gameResult.rootActionLedger,
    workerExecutionAudit:normalized.workerExecutionAudit,
    fullStateTraceSteps:fixture.fullStateTraceSteps
  });
  assert.equal(audit.accepted,true,audit.failures.join(','));
  const boundary=projectV3WorkerExecutionBoundaryToTrial(
    normalized.workerExecutionAudit,{
      candidateSeat:fixture.candidateSeat,
      opponentSeat:fixture.opponentSeat,
      setupPromptAudit:audit
    }
  );
  assert.equal(boundary.valid,true,boundary.failures.join(','));
});


test('V3 worker execution boundary binds replayability, cleanup, disclosure limits, and setup audit',()=>{
  const {evidenceBundleSha256}=require('../simulation/evaluation/canonical-evidence-json.cjs');
  const fixture=makeV3SetupPromptAuditFixture();
  const setupPromptAudit=buildSetupPromptAudit(fixture);
  const boundary=projectV3WorkerExecutionBoundaryToTrial(fixture.workerExecutionAudit,{
    candidateSeat:fixture.candidateSeat,
    opponentSeat:fixture.opponentSeat,
    setupPromptAudit
  });
  assert.equal(boundary.schema,'agent19-agent49-v3-worker-execution-boundary-v1');
  assert.equal(boundary.valid,true,boundary.failures.join(','));
  assert.equal(boundary.workerExecutionAuditSha256,evidenceBundleSha256(fixture.workerExecutionAudit));
  assert.equal(boundary.setupPromptAuditSha256,evidenceBundleSha256(setupPromptAudit));
  assert.equal(boundary.roles.candidate.workerProcessClosed,true);
  assert.equal(boundary.roles.opponent.policyBundleRemoved,true);

  const disclosed=JSON.parse(JSON.stringify(fixture.workerExecutionAudit));
  disclosed.physicalSeedDisclosedToWorker=true;
  const invalid=projectV3WorkerExecutionBoundaryToTrial(disclosed,{
    candidateSeat:fixture.candidateSeat,
    opponentSeat:fixture.opponentSeat,
    setupPromptAudit
  });
  assert.equal(invalid.valid,false);
  assert.ok(invalid.failures.some(value=>value.includes('physicalSeedDisclosedToWorker-must-be-false')));

  const noCandidateRoot=JSON.parse(JSON.stringify(fixture.workerExecutionAudit));
  noCandidateRoot.roles.candidate.rootDecisionCount=0;
  noCandidateRoot.roles.candidate.decisionCount=4;
  noCandidateRoot.totalWorkerDecisions=6;
  const rootMissing=projectV3WorkerExecutionBoundaryToTrial(noCandidateRoot,{
    candidateSeat:fixture.candidateSeat,
    opponentSeat:fixture.opponentSeat,
    setupPromptAudit
  });
  assert.equal(rootMissing.valid,false);
  assert.ok(rootMissing.failures.some(value=>
    value.includes('candidate:worker-role-has-no-owner-root-decisions')));
});


test('V3 worker prompt resolver binds policyAudit, actor projection and cloned-Store receipt', async () => {
  const workerAudit=createV3WorkerExecutionAudit({candidateSeat:0,opponentSeat:1});
  const policyVersion='runner-prompt-audit-test-v1';
  const actorObservation={actorSeat:1,decisionKind:'owner-prompt',ownHand:['Fog Crystal FLI']};
  const actorObservationSha256=evidenceBundleSha256(actorObservation);
  let seenObservation=null;
  const choice={token:'prompt-choice-0',kind:'card',printing:'Fog Crystal FLI'};
  const policyAudit={
    schema:'agent6-policy-audit-v1',policyVersion,
    decisionKind:'owner-prompt',decisionType:'select-choice',
    selectionRuleCode:'PROMPT_SCORE_DESC',tieBreakCode:'SCORE_DESC_NATIVE_ORDER',
    selectedTokens:['prompt-choice-0'],
    evaluations:[{
      token:'prompt-choice-0',status:'scored',score:12,reasonCode:null
    }]
  };
  const resolver=createV3WorkerDecisionResolver({
    sessionsBySeat:{
      1:{async decide(input){
        seenObservation=input.observation;
        return {
          requestId:'runner-prompt-audit-request',sequence:7,
          role:'opponent',seat:1,policyVersion,bundleSha256:'b'.repeat(64),
          decision:{kind:'select-choice',token:'prompt-choice-0'},
          policyAudit,policyDrawCount:0
        };
      }}
    },
    candidateSeat:0,opponentSeat:1,
    native:{observe(){return {actorSeat:1,decisionKind:'owner-prompt',ownHand:['Fog Crystal FLI']};}},
    workerAudit,eventReceipt:()=>null,
    promptProjection:{
      projectPrompt(){return {
        hostOnly:false,
        promptProjection:{schema:'test-prompt-v1',promptType:'ChooseCardsPrompt',choices:[choice]}
      };},
      dispatchPromptChoice(args){
        assert.equal(typeof args.withValidationRandom,'function');
        return {
          action:{kind:'validated-prompt-action'},
          rawResult:0,
          validationReceipt:{
            schema:'agent6-cloned-store-prompt-validation-v1',
            actorSeat:1,promptId:'prompt-1',selectedTokens:['prompt-choice-0'],
            selectedCount:1,nativeValidationStoreMode:'cloned-store',
            promptDecodeValidated:true,clonedPromptResolved:true,
            fullOriginalStoreStateUnchanged:true
          }
        };
      }
    }
  });
  const result=await resolver({
    kind:'native-fixture-decision',decisionKind:'owner-prompt',actorSeat:1,
    actorObservation,actorObservationSha256,
    prompt:{id:'prompt-1'},state:{activePlayer:1},store:{},
    actionOrdinal:3,withValidationRandom:fn=>fn()
  });
  assert.equal(result.__nativeFixtureDecisionResolution,true);
  assert.deepEqual(result.action,{kind:'validated-prompt-action'});
  assert.equal(result.validationReceipt.nativeValidationStoreMode,'cloned-store');
  assert.equal(result.decisionTrace.actionOrdinal,3);
  assert.equal(result.decisionTrace.requestId,'runner-prompt-audit-request');
  assert.equal(result.decisionTrace.sequence,7);
  assert.equal(result.decisionTrace.role,'opponent');
  assert.equal(result.decisionTrace.seat,1);
  assert.deepEqual(result.decisionTrace.selectedTokens,['prompt-choice-0']);
  assert.deepEqual(result.decisionTrace.selectedItems,[choice]);
  assert.deepEqual(result.decisionTrace.policyAudit,policyAudit);
  assert.strictEqual(seenObservation,actorObservation);
  assert.equal(result.decisionTrace.actorInputSha256.length,64);
  assert.strictEqual(result.decisionTrace.actorInput,actorObservation);
  assert.equal(result.decisionTrace.actorObservationSha256,actorObservationSha256);
  assert.equal(result.decisionTrace.traceStatus,'validated');
  assert.equal(result.validationReceipt.selectedItemsSha256,result.decisionTrace.selectedItemsSha256);
  const promptTraceRow={
    actionOrdinal:3,actingSeat:1,decisionKind:'owner-prompt',
    pendingPromptId:'prompt-1',pendingPromptType:'ChooseCardsPrompt',
    actorObservationSha256,
    workerDecisionTrace:result.decisionTrace,
    workerDecisionTraceSha256:evidenceBundleSha256(result.decisionTrace),
    validationReceipt:result.validationReceipt,
    validationReceiptSha256:evidenceBundleSha256(result.validationReceipt)
  };
  assert.equal(validateV3WorkerDecisionTrace(promptTraceRow),true);
  const mutatedPromptTrace=JSON.parse(JSON.stringify(promptTraceRow));
  mutatedPromptTrace.workerDecisionTrace.promptProjection.choices[0].printing='mutated prompt choice';
  mutatedPromptTrace.workerDecisionTraceSha256=
    evidenceBundleSha256(mutatedPromptTrace.workerDecisionTrace);
  assert.equal(validateV3WorkerDecisionTrace(mutatedPromptTrace),false);
  const promptIdMismatch=JSON.parse(JSON.stringify(promptTraceRow));
  promptIdMismatch.workerDecisionTrace.validationReceipt.promptId='other-prompt';
  promptIdMismatch.workerDecisionTrace.validationReceiptSha256=
    evidenceBundleSha256(promptIdMismatch.workerDecisionTrace.validationReceipt);
  promptIdMismatch.validationReceipt=promptIdMismatch.workerDecisionTrace.validationReceipt;
  promptIdMismatch.validationReceiptSha256=
    promptIdMismatch.workerDecisionTrace.validationReceiptSha256;
  promptIdMismatch.workerDecisionTraceSha256=
    evidenceBundleSha256(promptIdMismatch.workerDecisionTrace);
  assert.equal(validateV3WorkerDecisionTrace(promptIdMismatch),false,
    'prompt receipt ID must match the exact pending prompt ID');
  const promptTypeMismatch=JSON.parse(JSON.stringify(promptTraceRow));
  const promptTypeTrace=promptTypeMismatch.workerDecisionTrace;
  promptTypeTrace.promptProjection.promptType='OtherPromptType';
  promptTypeTrace.promptProjectionSha256=
    evidenceBundleSha256(promptTypeTrace.promptProjection);
  promptTypeTrace.inputBindingSha256=evidenceBundleSha256({
    observation:promptTypeTrace.actorInput,
    publicEventReceipt:promptTypeTrace.publicEventReceipt,
    promptProjection:promptTypeTrace.promptProjection,
    actionFrontier:promptTypeTrace.actionFrontier
  });
  promptTypeTrace.validationReceipt.promptProjectionSha256=
    promptTypeTrace.promptProjectionSha256;
  promptTypeTrace.validationReceiptSha256=
    evidenceBundleSha256(promptTypeTrace.validationReceipt);
  promptTypeMismatch.validationReceipt=promptTypeTrace.validationReceipt;
  promptTypeMismatch.validationReceiptSha256=promptTypeTrace.validationReceiptSha256;
  promptTypeMismatch.workerDecisionTraceSha256=
    evidenceBundleSha256(promptTypeTrace);
  assert.equal(validateV3WorkerDecisionTrace(promptTypeMismatch),false,
    'prompt projection type must match the exact pending prompt type');



  assert.equal(result.decisionTrace.promptProjectionSha256.length,64);
  assert.equal(result.decisionTrace.policyAuditSha256.length,64);
  assert.equal(result.decisionTrace.validationReceiptSha256.length,64);
});


test('V3 root resolver consumes the exact driver actor input and binds all component digests',async()=>{
  const fixture=rootResolverFixture();
  const result=await fixture.resolver(fixture.request);
  const trace=result.decisionTrace;
  assert.strictEqual(fixture.calls.seenObservation,fixture.actorObservation);
  assert.strictEqual(trace.actorInput,fixture.actorObservation);
  assert.equal(trace.actorInputSha256,trace.actorObservationSha256);
  assert.equal(trace.actorInputSha256,evidenceBundleSha256(fixture.actorObservation));
  assert.equal(trace.publicEventReceiptSha256,null);
  assert.equal(trace.promptProjectionSha256,null);
  assert.equal(trace.actionFrontierSha256,evidenceBundleSha256(fixture.frontierBinding));
  assert.equal(trace.inputBindingSha256,evidenceBundleSha256({
    observation:fixture.actorObservation,
    publicEventReceipt:null,
    promptProjection:null,
    actionFrontier:fixture.frontierBinding
  }));
  assert.equal(trace.selectedItemsSha256,evidenceBundleSha256([fixture.item]));
  assert.equal(trace.policyAuditSha256,evidenceBundleSha256(fixture.policyAudit));
  assert.equal(result.validationReceipt.frontierSha256,trace.actionFrontierSha256);
  assert.equal(result.validationReceipt.selectedItemSha256,evidenceBundleSha256(fixture.item));
  assert.equal(trace.validationReceiptSha256,evidenceBundleSha256(result.validationReceipt));
  assert.equal(trace.traceStatus,'validated');
  assert.equal(fixture.calls.worker,1);
  assert.equal(fixture.calls.cloneValidation,1);
  assert.equal(fixture.calls.liveStoreDispatch,0);
});

test('V3 resolver rejects a mismatched driver actor-observation digest before worker invocation',async()=>{
  const fixture=rootResolverFixture({actorObservationSha256:'f'.repeat(64)});
  await assert.rejects(fixture.resolver(fixture.request),error=>{
    assert.equal(error.code,'ACTOR_OBSERVATION_DIGEST_MISMATCH');
    assert.strictEqual(error.workerDecisionTrace.actorInput,fixture.actorObservation);
    assert.equal(error.workerDecisionTrace.actorInputSha256,evidenceBundleSha256(fixture.actorObservation));
    assert.equal(error.workerDecisionTrace.actorObservationSha256,'f'.repeat(64));
    assert.equal(error.workerDecisionTrace.failureCode,'ACTOR_OBSERVATION_DIGEST_MISMATCH');
    assert.equal(error.workerDecisionTrace.validationReceipt,null);
    return true;
  });
  assert.equal(fixture.calls.worker,0);
  assert.equal(fixture.calls.cloneValidation,0);
  assert.equal(fixture.calls.liveStoreDispatch,0);
});

test('V3 resolver host-validates the complete policy audit before any cloned or live dispatch',async()=>{
  const template=rootResolverFixture();
  const row=template.policyAudit.evaluations[0];
  const cases=[
    {name:'incomplete',patch:{evaluations:[]}},
    {name:'duplicate',patch:{evaluations:[row,row]}},
    {name:'out-of-frontier',patch:{evaluations:[{...row,token:'foreign-action'}]}},
    {name:'non-finite',patch:{evaluations:[{...row,score:Number.POSITIVE_INFINITY}]}},
    {name:'selected-token-mismatch',patch:{selectedTokens:[]}}
  ];
  for(const item of cases){
    const fixture=rootResolverFixture({
      responsePatch:{policyAudit:{...template.policyAudit,...item.patch}}
    });
    await assert.rejects(fixture.resolver(fixture.request),error=>{
      assert.ok(error.workerDecisionTrace,item.name+' failure must retain its provisional trace');
      assert.equal(error.workerDecisionTrace.traceStatus,'failed');
      assert.equal(error.workerDecisionTrace.validationReceipt,null);
      assert.equal(error.workerDecisionTrace.failureCode,error.code);
      return true;
    },item.name);
    assert.equal(fixture.calls.cloneValidation,0,item.name+' reached cloned validation');
    assert.equal(fixture.calls.liveStoreDispatch,0,item.name+' reached live Store dispatch');
  }
});

test('V3 resolver retains unknown-token and unsupported-kind responses in provisional traces',async()=>{
  const template=rootResolverFixture();
  const unknown=rootResolverFixture({
    responsePatch:{
      decision:{kind:'select-action',token:'foreign-action'},
      policyAudit:{...template.policyAudit,selectedTokens:['foreign-action']}
    }
  });
  await assert.rejects(unknown.resolver(unknown.request),error=>{
    assert.ok(error.workerDecisionTrace);
    assert.deepEqual(error.workerDecisionTrace.selectedTokens,['foreign-action']);
    assert.deepEqual(error.workerDecisionTrace.unmatchedSelectedTokens,['foreign-action']);
    assert.equal(error.workerDecisionTrace.selectionStatus,'unresolved-token');
    assert.equal(error.workerDecisionTrace.validationReceipt,null);
    return true;
  });
  assert.equal(unknown.calls.cloneValidation,0);

  const unsupportedAudit={
    ...template.policyAudit,
    decisionType:'future-decision-kind',
    selectedTokens:[],
    evaluations:[{
      token:template.item.token,status:'not-evaluated',score:null,
      reasonCode:'NOT_EVALUATED_BY_TEST'
    }]
  };
  const unsupported=rootResolverFixture({
    responsePatch:{
      decision:{kind:'future-decision-kind'},
      policyAudit:unsupportedAudit
    }
  });
  await assert.rejects(unsupported.resolver(unsupported.request),error=>{
    assert.equal(error.code,'UNSUPPORTED_WORKER_ROOT_DECISION');
    assert.ok(error.workerDecisionTrace);
    assert.deepEqual(error.workerDecisionTrace.decision,{kind:'future-decision-kind'});
    assert.equal(error.workerDecisionTrace.selectionStatus,'unsupported-decision-kind');
    assert.equal(error.workerDecisionTrace.policyAuditSha256,evidenceBundleSha256(unsupportedAudit));
    assert.equal(error.workerDecisionTrace.validationReceipt,null);
    return true;
  });
  assert.equal(unsupported.calls.cloneValidation,0);
});

test('V3 cloned-root rejection attaches the response trace without touching the live Store',async()=>{
  const cloneFailure=Object.assign(new Error('cloned action validation rejected'),{
    code:'CLONED_ACTION_VALIDATION_REJECTED'
  });
  const fixture=rootResolverFixture({dispatchError:cloneFailure});
  await assert.rejects(fixture.resolver(fixture.request),error=>{
    assert.equal(error.code,'CLONED_ACTION_VALIDATION_REJECTED');
    assert.ok(error.workerDecisionTrace);
    assert.equal(error.workerDecisionTrace.traceStatus,'failed');
    assert.equal(error.workerDecisionTrace.failureCode,'CLONED_ACTION_VALIDATION_REJECTED');
    assert.deepEqual(error.workerDecisionTrace.selectedTokens,['root-action-0']);
    assert.deepEqual(error.workerDecisionTrace.selectedItems,[fixture.item]);
    assert.equal(error.workerDecisionTrace.policyAuditSha256,evidenceBundleSha256(fixture.policyAudit));
    assert.equal(error.workerDecisionTrace.validationReceipt,null);
    return true;
  });
  assert.equal(fixture.calls.cloneValidation,1);
  assert.equal(fixture.calls.liveStoreDispatch,0);
});

test('V3 prompt clone non-settlement preserves the worker trace and never fabricates a receipt',async()=>{
  const workerAudit=createV3WorkerExecutionAudit({candidateSeat:0,opponentSeat:1});
  const actorObservation={actorSeat:1,decisionKind:'owner-prompt',ownHand:['distinctive-prompt-input']};
  const actorObservationSha256=evidenceBundleSha256(actorObservation);
  const policyVersion='runner-prompt-clone-failure-v1';
  const choice={token:'prompt-choice-0',kind:'card',printing:'Fog Crystal FLI'};
  const policyAudit={
    schema:'agent6-policy-audit-v1',policyVersion,
    decisionKind:'owner-prompt',decisionType:'select-choice',
    selectionRuleCode:'PROMPT_SCORE_DESC',tieBreakCode:'SCORE_DESC_NATIVE_ORDER',
    selectedTokens:[choice.token],
    evaluations:[{token:choice.token,status:'scored',score:12,reasonCode:null}]
  };
  let liveStoreDispatches=0;
  const resolver=createV3WorkerDecisionResolver({
    sessionsBySeat:{
      1:{async decide(){return {
        requestId:'prompt-clone-failure-request',sequence:2,
        role:'opponent',seat:1,policyVersion,bundleSha256:'d'.repeat(64),
        decision:{kind:'select-choice',token:choice.token},policyAudit,policyDrawCount:0
      };}}
    },
    candidateSeat:0,opponentSeat:1,
    native:{observe(){throw new Error('must use driver observation');}},
    workerAudit,eventReceipt:()=>null,
    promptProjection:{
      projectPrompt(){return {
        hostOnly:false,
        promptProjection:{schema:'test-prompt-v1',promptType:'ChooseCardsPrompt',choices:[choice]}
      };},
      dispatchPromptChoice(){throw Object.assign(new Error('cloned prompt remained pending'),{
        code:'CLONED_PROMPT_NOT_RESOLVED'
      });}
    }
  });
  await assert.rejects(resolver({
    kind:'native-fixture-decision',decisionKind:'owner-prompt',actorSeat:1,
    actorObservation,actorObservationSha256,
    actionOrdinal:8,prompt:{id:'prompt-8'},state:{activePlayer:1},
    store:{dispatch(){liveStoreDispatches++;}},
    withValidationRandom:fn=>fn()
  }),error=>{
    assert.equal(error.code,'CLONED_PROMPT_NOT_RESOLVED');
    assert.ok(error.workerDecisionTrace);
    assert.equal(error.workerDecisionTrace.actionOrdinal,8);
    assert.equal(error.workerDecisionTrace.seat,1);
    assert.deepEqual(error.workerDecisionTrace.selectedTokens,[choice.token]);
    assert.deepEqual(error.workerDecisionTrace.selectedItems,[choice]);
    assert.equal(error.workerDecisionTrace.policyAuditSha256,evidenceBundleSha256(policyAudit));
    assert.equal(error.workerDecisionTrace.validationReceipt,null);
    assert.equal(error.workerDecisionTrace.failureCode,'CLONED_PROMPT_NOT_RESOLVED');
    return true;
  });
  assert.equal(liveStoreDispatches,0);
});


test('V3 prompt resolver rejects a mismatched driver actor-observation digest before worker invocation',async()=>{
  const workerAudit=createV3WorkerExecutionAudit({candidateSeat:0,opponentSeat:1});
  const actorObservation={actorSeat:1,decisionKind:'owner-prompt',ownHand:['distinctive-prompt-input']};
  let projectCalls=0,workerCalls=0,dispatchCalls=0;
  const resolver=createV3WorkerDecisionResolver({
    sessionsBySeat:{1:{async decide(){workerCalls++;throw new Error('worker must not be called');}}},
    candidateSeat:0,opponentSeat:1,
    native:{observe(){throw new Error('resolver must use driver observation');}},
    workerAudit,eventReceipt:()=>null,
    promptProjection:{
      projectPrompt(){projectCalls++;return {hostOnly:false,promptProjection:{choices:[]}};},
      dispatchPromptChoice(){dispatchCalls++;throw new Error('dispatch must not be called');}
    }
  });
  await assert.rejects(resolver({
    kind:'native-fixture-decision',decisionKind:'owner-prompt',actorSeat:1,
    actorObservation,actorObservationSha256:'e'.repeat(64),
    actionOrdinal:9,prompt:{id:'prompt-9'},state:{activePlayer:1},store:{}
  }),error=>{
    assert.equal(error.code,'ACTOR_OBSERVATION_DIGEST_MISMATCH');
    assert.strictEqual(error.workerDecisionTrace.actorInput,actorObservation);
    assert.equal(error.workerDecisionTrace.failureCode,'ACTOR_OBSERVATION_DIGEST_MISMATCH');
    assert.equal(error.workerDecisionTrace.validationReceipt,null);
    return true;
  });
  assert.equal(projectCalls,0);
  assert.equal(workerCalls,0);
  assert.equal(dispatchCalls,0);
});


test('V3 full trace acceptance recomputes component digests and rejects broken bindings',async()=>{
  const fixture=rootResolverFixture({
    publicEventReceipt:{schema:'test-public-event-receipt-v1',actorSeat:1,publicEventCount:2}
  });
  const result=await fixture.resolver(fixture.request);
  const trace=result.decisionTrace;
  const row={
    actionOrdinal:trace.actionOrdinal,
    actingSeat:trace.seat,
    decisionKind:trace.decisionKind,
    pendingPromptId:null,pendingPromptType:null,
    actorObservationSha256:trace.actorObservationSha256,
    workerDecisionTrace:trace,
    workerDecisionTraceSha256:evidenceBundleSha256(trace),
    validationReceipt:trace.validationReceipt,
    validationReceiptSha256:evidenceBundleSha256(trace.validationReceipt)
  };
  assert.equal(validateV3WorkerDecisionTrace(row),true);

  const mutations=[
    ['actor input',t=>{t.actorInput.ownHand[0]='mutated';}],
    ['actor input digest',t=>{t.actorInputSha256='0'.repeat(64);}],
    ['driver actor digest',t=>{t.actorObservationSha256='0'.repeat(64);}],
    ['public event receipt',t=>{t.publicEventReceipt.publicEventCount++;}],
    ['public receipt digest',t=>{t.publicEventReceiptSha256='0'.repeat(64);}],
    ['action frontier',t=>{t.actionFrontier.items[0].publicMetadata.damage++;}],
    ['frontier digest',t=>{t.actionFrontierSha256='0'.repeat(64);}],
    ['input binding digest',t=>{t.inputBindingSha256='0'.repeat(64);}],
    ['selected item',t=>{t.selectedItems[0].attackName='mutated';}],
    ['selected item digest',t=>{t.selectedItemsSha256='0'.repeat(64);}],
    ['policy audit',t=>{t.policyAudit.selectionRuleCode='MUTATED_RULE';}],
    ['policy audit digest',t=>{t.policyAuditSha256='0'.repeat(64);}],
    ['validation receipt',t=>{t.validationReceipt.selectedToken='foreign-action';}],
    ['validation receipt digest',t=>{t.validationReceiptSha256='0'.repeat(64);}],
    ['selected token association',t=>{
      t.selectedItems[0].token='foreign-action';
      t.selectedItemsSha256=evidenceBundleSha256(t.selectedItems);
    }],
    ['policy evaluation order',t=>{
      t.policyAudit.evaluations[0].token='foreign-action';
      t.policyAuditSha256=evidenceBundleSha256(t.policyAudit);
    }]
  ];
  for(const [name,mutate] of mutations){
    const candidate=JSON.parse(JSON.stringify(row));
    mutate(candidate.workerDecisionTrace);
    candidate.workerDecisionTraceSha256=evidenceBundleSha256(candidate.workerDecisionTrace);
    candidate.validationReceipt=candidate.workerDecisionTrace.validationReceipt;
    candidate.validationReceiptSha256=evidenceBundleSha256(candidate.validationReceipt);
    assert.equal(validateV3WorkerDecisionTrace(candidate),false,name);
  }

  const semanticMismatch=JSON.parse(JSON.stringify(row));
  semanticMismatch.workerDecisionTrace.validationReceipt.frontierSha256='0'.repeat(64);
  semanticMismatch.workerDecisionTrace.validationReceiptSha256=
    evidenceBundleSha256(semanticMismatch.workerDecisionTrace.validationReceipt);
  semanticMismatch.validationReceipt=semanticMismatch.workerDecisionTrace.validationReceipt;
  semanticMismatch.validationReceiptSha256=
    semanticMismatch.workerDecisionTrace.validationReceiptSha256;
  semanticMismatch.workerDecisionTraceSha256=
    evidenceBundleSha256(semanticMismatch.workerDecisionTrace);
  assert.equal(validateV3WorkerDecisionTrace(semanticMismatch),false,
    'a self-consistent receipt digest must still match the exact action frontier');
});


test('V3 full-state trace joins bind action payload, dispatch, turns and public state',()=>{
  const publicPlayers=[{playerId:'candidate-player',handCount:5}];
  const steps=[{
    actionOrdinal:1,playerSlot:0,playerId:'candidate-player',
    actionType:'AttackAction',turnBefore:3,turnAfter:3,publicBoard:publicPlayers
  }];
  const rootActionLedger=[{
    actionOrdinal:0,playerSlot:0,actorSeat:0,playerId:'candidate-player',
    action:'AttackAction',actionPayloadSha256:'c'.repeat(64),
    dispatchStatus:'succeeded',turnBefore:3,turnAfter:3,
    pendingPrompt:null,isRootDecision:true,policyInputKind:'actor-observation',
    actorObservationSha256:'d'.repeat(64),promptResolution:null,
    selectedCardIdentity:null,targetProjection:null,
    decisionKind:'owner-root',workerDecisionTraceSha256:'a'.repeat(64),
    validationReceiptSha256:'b'.repeat(64)
  }];
  const decisionRows=[{
    actionOrdinal:0,actingSeat:0,actingPlayerId:'candidate-player',
    actionName:'AttackAction',actionPayloadSha256:'c'.repeat(64),
    dispatchStatus:'succeeded',turnBefore:3,turnAfter:3,
    pendingPromptType:null,isRootDecision:true,policyInputKind:'actor-observation',
    actorObservationSha256:'d'.repeat(64),promptResolution:null,
    selectedCardIdentity:null,targetProjection:null,
    publicStateAfter:{players:publicPlayers},
    decisionKind:'owner-root',workerDecisionTraceSha256:'a'.repeat(64),
    validationReceiptSha256:'b'.repeat(64)
  }];
  assert.deepEqual(validateV3FullStateTraceJoins({steps,rootActionLedger,decisionRows}),{
    ordinalJoinMatches:true,decisionJoinMatches:true,publicStateJoinMatches:true
  });
  const stepMutations=[
    ['physical seat',step=>{step.playerSlot=1;}],
    ['player ID',step=>{step.playerId='other-player';}],
    ['action type',step=>{step.actionType='RetreatAction';}],
    ['turn before',step=>{step.turnBefore=4;}],
    ['turn after',step=>{step.turnAfter=4;}]
  ];
  for(const [name,mutate] of stepMutations){
    const candidate=JSON.parse(JSON.stringify(steps));
    mutate(candidate[0]);
    assert.equal(validateV3FullStateTraceJoins({
      steps:candidate,rootActionLedger,decisionRows
    }).ordinalJoinMatches,false,name);
  }
  const actorSeatMismatch=JSON.parse(JSON.stringify(rootActionLedger));
  actorSeatMismatch[0].actorSeat=1;
  assert.equal(validateV3FullStateTraceJoins({
    steps,rootActionLedger:actorSeatMismatch,decisionRows
  }).ordinalJoinMatches,false,'recorder player slot must match canonical ledger actorSeat');

  const decisionMutations=[
    ['physical seat',row=>{row.actingSeat=1;}],
    ['player ID',row=>{row.actingPlayerId='other-player';}],
    ['action ordinal',row=>{row.actionOrdinal=1;}],
    ['action name',row=>{row.actionName='RetreatAction';}],
    ['action payload digest',row=>{row.actionPayloadSha256='e'.repeat(64);}],
    ['dispatch status',row=>{row.dispatchStatus='not-dispatched';}],
    ['turn before',row=>{row.turnBefore=4;}],
    ['turn after',row=>{row.turnAfter=4;}],
    ['pending prompt type',row=>{row.pendingPromptType='ChooseCardsPrompt';}],
    ['root decision marker',row=>{row.isRootDecision=false;}],
    ['policy input kind',row=>{row.policyInputKind='legacy';}],
    ['actor observation digest',row=>{row.actorObservationSha256='e'.repeat(64);}],
    ['prompt resolution',row=>{row.promptResolution={kind:'worker-choice'};}],
    ['selected card identity',row=>{row.selectedCardIdentity={printing:'other'};}],
    ['target projection',row=>{row.targetProjection={target:'other'};}],
    ['worker trace digest',row=>{row.workerDecisionTraceSha256='c'.repeat(64);}],
    ['validation receipt digest',row=>{row.validationReceiptSha256='d'.repeat(64);}]
  ];
  for(const [name,mutate] of decisionMutations){
    const candidate=JSON.parse(JSON.stringify(decisionRows));
    mutate(candidate[0]);
    assert.equal(validateV3FullStateTraceJoins({
      steps,rootActionLedger,decisionRows:candidate
    }).decisionJoinMatches,false,name);
  }
  const publicStateMismatch=JSON.parse(JSON.stringify(decisionRows));
  publicStateMismatch[0].publicStateAfter.players[0].handCount=6;
  assert.equal(validateV3FullStateTraceJoins({
    steps,rootActionLedger,decisionRows:publicStateMismatch
  }).publicStateJoinMatches,false,'recorder publicBoard must equal decisionTrace publicStateAfter.players');
});


test('V3 full-state recorder acceptance requires capture, public-board and summary errors all null',()=>{
  const complete={
    complete:true,captureError:null,publicBoardError:null,humanSummaryError:null
  };
  assert.equal(validateV3FullStateTraceRecorderResult(complete),true);
  for(const field of ['captureError','publicBoardError','humanSummaryError']){
    const broken={...complete,[field]:{code:'RECORDER_CAPTURE_FAILED'}};
    assert.equal(validateV3FullStateTraceRecorderResult(broken),false,field);
  }
  assert.equal(validateV3FullStateTraceRecorderResult({
    complete:true,publicBoardError:null,humanSummaryError:null
  }),false,'missing captureError must fail closed');
  assert.equal(validateV3FullStateTraceRecorderResult({
    complete:false,captureError:null,publicBoardError:null,humanSummaryError:null
  }),false,'incomplete recorder must fail');
});
