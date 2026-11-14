'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {evidenceBundleSha256}=require('../simulation/evaluation/canonical-evidence-json.cjs');
const {
  validateArtifactRef,gitBlobSha,verifyPersistedPreDeal,collectPreDealPersistenceReceipt,
  collectDealGenerationReceipt,fetchWorkflowJobs,runCandidateOpponentPolicyRoles,
  combineAndPinV3RoleRuntime,initializeNativeCardPool,buildV3BundleFromArtifacts,
  revalidatePreDealPersistenceReceipt,revalidateDealGenerationReceipt,
  bindFixtureFormatToApplicationReceipt,buildFixtureRoleIdentities,
  resolveFixtureSeatAssignment,candidateOpponentRoleSeats,loadWorkerPolicyModule
}=require('../simulation/evaluation/2026-11/agent36-v3-runner.cjs');
const roleIdentity=require('../simulation/evaluation/2026-11/agent42-role-policy-identity.cjs');
const {
  preparePreDealPolicyRegistration,
  revalidatePreDealPolicyRegistration
}=require('../simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs');

const STEP='Generate physical deal';

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

test('runtime pin wrapper requires exact loaded union before executing',()=>{
  const candidate={manifest:{enginePin:'e'.repeat(40)},expectedByPath:{'runner.cjs':'a'.repeat(64)}};
  const opponent={manifest:{enginePin:'e'.repeat(40)},expectedByPath:{'policy.cjs':'b'.repeat(64)}};
  const identityHelper={
    combineRolePolicyEntryManifests:()=>({
      expectedByPath:{'runner.cjs':'a'.repeat(64),'policy.cjs':'b'.repeat(64)},
      unionSha256:'c'.repeat(64)
    }),
    assertLoadedResearchModulesCovered:()=>({
      files:[{path:'policy.cjs'},{path:'runner.cjs'}],sha256:'d'.repeat(64)
    })
  };
  let called=false;
  const pin=(root,expected,run)=>{
    called=true;
    return {result:run(),audit:{guardRestored:true}};
  };
  const cardPoolInitialization={
    schema:'agent36-twinleaf-card-pool-initialization-v1',
    enginePin:'e'.repeat(40),startupPath:'vendor/twinleaf/ptcg-server/start.js',
    startupSha256:'f'.repeat(64),setNames:['BaseSet'],definedSetCount:1,cardCount:1
  };
  const result=combineAndPinV3RoleRuntime({
    repositoryRoot:'/tmp',candidateManifest:candidate,opponentManifest:opponent,
    cardPoolInitialization,run:()=>17,identityHelper,pin
  });
  assert.equal(called,true);
  assert.equal(result.result,17);
  assert.equal(result.runtimePinUnionSha256,'c'.repeat(64));
  assert.equal(result.loadedProcessClosureSha256,'d'.repeat(64));
  assert.equal(result.runtimePinEvidence.unionSha256,'c'.repeat(64));
  assert.equal(result.runtimePinEvidence.loadedProcessClosureSha256,'d'.repeat(64));
  assert.equal(result.runtimePinEvidence.cardPoolInitializationSha256,
    require('../simulation/evaluation/agent45-independent-competitive-admission.cjs').evidenceBundleSha256(cardPoolInitialization));
  const incomplete={
    ...identityHelper,
    assertLoadedResearchModulesCovered:()=>({
      files:[{path:'runner.cjs'}],sha256:'d'.repeat(64)
    })
  };
  assert.throws(()=>combineAndPinV3RoleRuntime({
    repositoryRoot:'/tmp',candidateManifest:candidate,opponentManifest:opponent,
    cardPoolInitialization,run:()=>17,identityHelper:incomplete,pin
  }),/every role-closure module must be preloaded/);
  assert.throws(()=>combineAndPinV3RoleRuntime({
    repositoryRoot:'/tmp',candidateManifest:candidate,
    opponentManifest:{...opponent,manifest:{enginePin:'f'.repeat(40)}},
    cardPoolInitialization,run:()=>17,identityHelper,pin
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

test('V3 role manifest hashes policy source as a data asset and uses the trusted worker runtime entrypoint',()=>{
  const source=fs.readFileSync(require.resolve(
    '../simulation/evaluation/2026-11/agent36-v3-runner.cjs'),'utf8');
  assert.match(source,/entrypoint:V3_FIXTURE\.workerPath/);
  assert.match(source,/additionalDataAssetPaths:\[V3_FIXTURE\.candidateWorkerPolicyPath\]/);
  assert.match(source,/additionalDataAssetPaths:\[V3_FIXTURE\.opponentWorkerPolicyPath\]/);
  assert.doesNotMatch(source,/entrypoint:V3_FIXTURE\.candidateWorkerPolicyPath/);
  assert.doesNotMatch(source,/entrypoint:V3_FIXTURE\.opponentWorkerPolicyPath/);
  assert.match(source,/fixtureChallengeSuiteSha256\(candidateManifestResult\.manifest\)/);
  assert.doesNotMatch(source,/fixtureChallengeSuiteSha256\(manifestResult\.manifest\)/);
});
