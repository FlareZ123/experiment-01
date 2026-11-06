'use strict';

const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json');
const {runSelectedIssue25V0,hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withStewardOwnerPromptFrontier}=
  require('./agent36-issue25-steward-selected-v4.cjs');
const {withStewardInnermostOwnerPrompts}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withCommonOwnerThornsRoot}=
  require('./agent36-issue25-common-v6.cjs');
const {withOwnerVoltAcrossNativeMatches}=
  require('./agent36-issue25-common-v7.cjs');

const VERSION='agent36-issue25-broader-four-rank-prospective-v8-128root';
const ROOT_LIMIT=128;
const REGISTRATION_PATH=
  'results/aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json';
const HASH_PATHS=[
  'simulation/evaluation/agent36-issue25-common-v8.cjs',
  REGISTRATION_PATH,
  'simulation/evaluation/agent36-issue25-common-v7.cjs',
  'simulation/twinleaf/agent4-allturn-owner-volt-attach-energy.cjs',
  'tests/agent36-issue25-common-v8.test.cjs',
  'tests/agent36-issue25-common-v8.native.test.cjs'
];

/** @returns {object[]} Exact frozen new-seed Aichi original source attempts. */
function trials(){
  assert.equal(registration.schema,
    'agent36-issue25-broader-prospective-common-v8-128root-v1');
  assert.equal(registration.maxNativeRootActionsPerArm,ROOT_LIMIT);
  assert.equal(registration.trials.length,8);
  assert.deepEqual(registration.sourceOriginalRanks,[6,11,1,3]);
  const expected=registration.groups.flatMap(group=>
    registration.contendingPrintedSixties.map(candidateId=>({
      ...group,candidateId,
      id:[group.rank,group.repeat,group.candidateSlot,candidateId].join(':')
    })));
  assert.deepEqual(registration.trials,expected);
  assert.equal(new Set(expected.map(t=>t.id)).size,8);
  for(const row of expected){
    assert.ok(row.candidateSlot==='A'||row.candidateSlot==='B');
    assert.ok(Number.isSafeInteger(row.seed)&&
      row.seed>=0&&row.seed<=0xffffffff);
  }
  return expected.map(row=>({...row}));
}

/**
 * Exactly one source-independent algorithm on both real physical seats.
 * The only change since v7 is fresh prospective game population and root128.
 * All source attacks and prompt replies go through native pinned Store.
 *
 * @param {{runner?:Function,layers?:object,attackLayer?:Function,
 *   ownerLayer?:Function,globalVoltLayer?:Function,
 *   voltLayer?:Function,headless?:object,env?:NodeJS.ProcessEnv}} [deps]
 */
function runStewardBroaderV8(deps={}){
  const originalTrials=trials();
  const runner=deps.runner??runDevelopment;
  const attack=deps.attackLayer??withStewardOwnerPromptFrontier;
  const owner=deps.ownerLayer??withStewardInnermostOwnerPrompts;
  const globalVolt=deps.globalVoltLayer??
    withOwnerVoltAcrossNativeMatches;
  assert.equal(typeof runner,'function');
  assert.equal(typeof attack,'function');
  assert.equal(typeof owner,'function');
  assert.equal(typeof globalVolt,'function');
  const execute=()=>withCommonOwnerThornsRoot(()=>
    runSelectedIssue25V0({
      runner:options=>runner({
        ...options,
        actorOnlyComposition:true,
        sourceIndependentCommonPolicy:true,
        bilateralSpecialEnergyRoot:true,
        nativeAcceptedTargets:true,
        nativeRootActionLimit:ROOT_LIMIT,
        registeredTrials:originalTrials.map(t=>({...t})),
        registeredFrameName:registration.schema,
        allowAdditionalOriginalSourceRanks:true
      }),
      layers:{...deps.layers,firstBlockedPromptEnvelope:attack},
      registeredTrialIds:originalTrials.map(t=>t.id)
    }),{env:deps.env});
  const voltWrapper=globalVolt(()=>owner(execute),{
    headless:deps.headless,voltLayer:deps.voltLayer
  });
  assert.ok(voltWrapper&&typeof voltWrapper==='object');
  assert.ok(voltWrapper.result&&typeof voltWrapper.result==='object');
  const selected=voltWrapper.result.result;
  const originalRows=selected.rawDevelopment?.rows??[];
  const nativeRows=originalRows.map(row=>({
    id:row.trial?.id??row.id??null,
    status:row.status??'returned-unqualified',
    acceptedNativeRootCount:row.rootActionLedger?.length??null,
    sourceSeat:row.sourceSeat??
      row.nativeAbortProvenance?.sourceSeat??null,
    candidateSeat:row.candidateSeat??
      row.nativeAbortProvenance?.candidateSeat??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    actualDeclaredSourceAttacks:row.sourceAttackSettlement?.attacks?.length??null,
    completedSettledSourceAttacks:
      row.sourceAttackSettlement?.attacks?.filter(a=>
        a.settledPromptChain===true).length??null,
    declaredPaperGameQualified:false
  }));
  const manifest={
    ...selected.manifest,
    version:VERSION,policyEntryPoint:HASH_PATHS[0],
    originalSourceRegistration:REGISTRATION_PATH,
    profile:'prospective-new-original-ranks6-11-1-3-both-candidate-60s-128root',
    recordedNativeRootLimitOverride:ROOT_LIMIT,
    nativeRootActionLimit:ROOT_LIMIT,
    originalRegisteredTrialCount:8,
    selectedSourceIndependentCommonPolicy:true,
    selectedBilateralSpecialEnergy:true,
    selectedNativeAcceptedTargets:true,
    commonOwnerThornsDirectRoot:true,
    commonVoltNativePromptBothSeats:true,
    commonOwnerPrizeAndPokemonPrompts:true,
    observedGitVendorPinExpected:registration.pinnedTwinleaf,
    fullPolicyOwnerHiddenInformationCertified:false,
    fullPaperCardInteractionCertified:false,
    fullFieldOriginalSixtiesAuthenticated:false,
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
    actualAttemptRows:nativeRows,
    nativeOwnerVoltMatchAudit:voltWrapper.audit,
    innerOwnerPrizePokemonMatchAudit:voltWrapper.result.audit??null,
    nativeRootLimitActuallyPassedToRunner:ROOT_LIMIT,
    verdict:'FAIL-prospective-broader-four-rank-development-only',
    competitiveGamesQualified:0,estimatedWinRate:null
  };
  return {manifest,diagnostic,rawDevelopment:selected.rawDevelopment};
}
module.exports={VERSION,ROOT_LIMIT,REGISTRATION_PATH,HASH_PATHS,trials,
  runStewardBroaderV8};
