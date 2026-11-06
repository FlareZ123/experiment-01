'use strict';

const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/agent36-issue25-common-v6-96root-20261106.json');
const {
  runSelectedIssue25V0,hashRegisteredFile
}=require('./agent36-issue25-selected-v0.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {withStewardOwnerPromptFrontier}=
  require('./agent36-issue25-steward-selected-v4.cjs');
const {withStewardInnermostOwnerPrompts}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');

const VERSION='agent36-issue25-common-owner-root-v6-prospective-96';
const ROOT_LIMIT=96;
const REGISTRATION_PATH=
  'results/aichi-2026/registrations/agent36-issue25-common-v6-96root-20261106.json';
const ROOT_FLAG='AGENT1_THORNS_DIRECT_ROOT_DEV';
const HASH_PATHS=[
  'simulation/evaluation/agent36-issue25-common-v6.cjs',
  REGISTRATION_PATH,
  'tests/agent36-issue25-common-v6.test.cjs',
  'tests/agent36-issue25-common-v6.native.test.cjs',
  'simulation/twinleaf/agent34-actor-only-root-policy.cjs',
  'simulation/evaluation/agent36-issue25-steward-selected-v4.cjs',
  'simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs'
];

/**
 * Require exact pre-committed original-rank, source-seat and contender coverage.
 * Re-registration after seeing any native result is expressly excluded.
 * @returns {Array<{rank:number,repeat:number,candidateSlot:string,candidateId:string,seed:number,id:string}>}
 */
function registeredTrials(){
  assert.equal(registration.schema,
    'agent36-issue25-prospective-common-v6-96root-v1');
  assert.equal(registration.maxNativeRootActionsPerArm,ROOT_LIMIT);
  assert.equal(registration.pinnedTwinleaf,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.deepEqual(registration.sourceRankUniverse,[6,11]);
  assert.equal(registration.groups.length,4);
  assert.equal(registration.trials.length,8);
  const trials=registration.trials.map(row=>({...row}));
  const seen=new Set();
  const groups=new Map();
  const byRank=new Map([[6,new Set()],[11,new Set()]]);
  for(const t of trials){
    assert.ok(t.rank===6||t.rank===11);
    assert.ok(t.candidateSlot==='A'||t.candidateSlot==='B');
    assert.ok(t.candidateId==='champion-reference'||
      t.candidateId==='new-moon-lockbreaker-v1');
    assert.ok(Number.isSafeInteger(t.seed)&&t.seed>=0&&
      t.seed<=0xffffffff);
    assert.ok(Number.isSafeInteger(t.repeat)&&t.repeat>=200);
    assert.equal(t.id,
      [t.rank,t.repeat,t.candidateSlot,t.candidateId].join(':'));
    assert.ok(!seen.has(t.id),'Duplicate registered game');
    seen.add(t.id);
    const groupId=[t.rank,t.repeat,t.candidateSlot].join(':');
    const group=groups.get(groupId)??{seed:t.seed,ids:[]};
    assert.equal(group.seed,t.seed,'Paired seed mismatch');
    group.ids.push(t.candidateId);
    groups.set(groupId,group);
    byRank.get(t.rank).add(t.candidateSlot);
  }
  assert.equal(groups.size,4);
  for(const group of groups.values())
    assert.deepEqual(group.ids.sort(),
      ['champion-reference','new-moon-lockbreaker-v1']);
  for(const rank of [6,11])
    assert.deepEqual([...byRank.get(rank)].sort(),['A','B']);
  assert.deepEqual(registration.groups.map(g=>[
    g.rank,g.repeat,g.candidateSlot,g.seed
  ]),[...groups].map(([key,g])=>{
    const [rank,repeat,slot]=key.split(':');
    return [Number(rank),Number(repeat),slot,g.seed];
  }));
  return trials;
}

/**
 * Run exactly one synchronous selected bilateral batch with the owner-only
 * Iron Thorns ALS available to both physical seats. Restore inherited process
 * configuration after native play, including on exception.
 * @template T
 * @param {()=>T} run
 * @param {{env?:NodeJS.ProcessEnv}} [deps] Pure-test environment seam.
 * @returns {T}
 */
function withCommonOwnerThornsRoot(run,deps={}){
  assert.equal(typeof run,'function');
  const env=deps.env??process.env;
  const prior=env[ROOT_FLAG];
  env[ROOT_FLAG]='true';
  try{return run();}
  finally{
    if(prior===undefined)delete env[ROOT_FLAG];
    else env[ROOT_FLAG]=prior;
  }
}

/**
 * Execute one preregistered 8-arm, 96-root developmental successor.
 * The inherited v0 wrapper still passes 48 to its injected runner, but this
 * new version deliberately overrides that limit at the final native boundary.
 * Owner-only policy activation is global and source-rank/candidate-independent.
 * All failures and capped attempts remain in the result denominator.
 *
 * @param {{runner?:Function,attackLayer?:Function,
 *   layers?:Record<string,Function>,innerLayer?:Function,env?:NodeJS.ProcessEnv}}
 *   [deps] Test injection; production native execution uses defaults.
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runStewardCommonV6(deps={}){
  const trials=registeredTrials();
  const run=deps.runner??runDevelopment;
  const attackLayer=deps.attackLayer??withStewardOwnerPromptFrontier;
  const innerLayer=deps.innerLayer??withStewardInnermostOwnerPrompts;
  assert.equal(typeof run,'function');
  assert.equal(typeof attackLayer,'function');
  assert.equal(typeof innerLayer,'function');
  const execute=()=>withCommonOwnerThornsRoot(()=>
    runSelectedIssue25V0({
      runner:options=>run({
        ...options,
        sourceIndependentCommonPolicy:true,
        bilateralSpecialEnergyRoot:true,
        nativeAcceptedTargets:true,
        nativeRootActionLimit:ROOT_LIMIT,
        registeredTrials:trials.map(t=>({...t})),
        registeredFrameName:registration.schema
      }),
      layers:{...deps.layers,firstBlockedPromptEnvelope:attackLayer},
      registeredTrialIds:trials.map(t=>t.id)
    }),{env:deps.env});
  const wrapped=innerLayer(execute);
  assert.ok(wrapped&&typeof wrapped==='object');
  const selected=wrapped.result;
  assert.ok(selected&&typeof selected==='object');
  const rows=selected.rawDevelopment?.rows??[];
  const nativeAttempts=rows.map(row=>({
    id:row.trial?.id??row.id??null,
    status:row.status??(row.finished===true?
      'native-terminal-unqualified':'native-return-unqualified'),
    rootCount:row.rootActionLedger?.length??
      row.nativeRootActionCount??row.rootActionCount??null,
    sourceSeat:row.sourceSeat??
      row.nativeAbortProvenance?.sourceSeat??null,
    candidateSeat:row.candidateSeat??
      row.nativeAbortProvenance?.candidateSeat??null,
    sourcePhysicalDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    settledSourceAttacks:row.sourceAttackSettlement?.attacks?.length??null,
    paperQualified:false
  }));
  const manifest={
    ...selected.manifest,version:VERSION,
    policyEntryPoint:HASH_PATHS[0],
    originalSourceRegistration:REGISTRATION_PATH,
    profile:'prospective-original-r6-r11-eight-arm-both-seat-96-root-v6',
    nativeRootActionLimit:ROOT_LIMIT,
    delegatedV0InitialRootCapOverriddenAtActualNativeRunner:true,
    originalRegisteredTrialCount:trials.length,
    selectedSourceIndependentCommonPolicy:true,
    selectedBilateralSpecialEnergy:true,
    selectedNativeAcceptedTargets:true,
    selectedActorRootFeature:'thornsDirectLine-on-for-both-physical-seats',
    selectedOwnerPromptFrontier:'v4-attacks-plus-capture',
    selectedInnermostPromptContinuation:'v5-owner-prize-and-promotion',
    scorerOwnerHiddenNoninterferenceCertified:false,
    paperEffectCoverageComplete:false,
    official25MinuteClockImplemented:false,
    resolvedSourceAndPolicyHashes:[
      ...selected.manifest.resolvedSourceAndPolicyHashes,
      ...HASH_PATHS.map(hashRegisteredFile)
    ],
    releaseQualified:false,competitiveGamesQualified:0
  };
  const diagnostic={
    ...selected.diagnostic,
    schema:VERSION,
    preregistration:REGISTRATION_PATH,
    rootFeatureActorBothSeatsSelected:true,
    innerNativeOwnerPromptAudit:wrapped.audit??null,
    actualNativeAttempts:nativeAttempts,
    actualCompletedNativeTerminals:nativeAttempts.filter(row=>
      row.status==='native-terminal-unqualified').length,
    registeredReconciliation:
      selected.diagnostic.registeredAttemptReconciliation,
    verdict:'FAIL-prospective-development-only-paper-policy-and-clock-unverified',
    competitiveGamesQualified:0,estimatedWinRate:null
  };
  return {manifest,diagnostic,rawDevelopment:selected.rawDevelopment};
}

module.exports={VERSION,ROOT_LIMIT,ROOT_FLAG,REGISTRATION_PATH,
  registeredTrials,withCommonOwnerThornsRoot,runStewardCommonV6};
