'use strict';
const assert=require('node:assert/strict');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runAgent1CommonRadiantV13}=
  require('./agent1-issue25-common-v13-radiant-decline.cjs');
const {registeredTrials}=
  require('./agent36-issue25-common-v6.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent1-issue25-native-horizon260-v14-no-policy-change';
const LIMIT=260;
const PRIOR_LIMIT=96;
const REGISTRATION=
  'results/aichi-2026/registrations/agent1-v13-v14-native-horizon260-20261106.md';
const HASH_PATHS=[
  REGISTRATION,
  'simulation/evaluation/agent1-issue25-common-v14-horizon260.cjs',
  'tests/agent1-issue25-common-v14-horizon260.test.cjs',
  'tests/agent1-issue25-common-v14-horizon260.native.test.cjs'
];

/**
 * Preserve every actual native decision and policy adapter from v13.
 * Override only the final accepted root horizon at the true development
 * runner after the inherited v6 registrar has passed its historical 96.
 *
 * @param {{runner?:Function,v13?:Function,ownerLayer?:Function}} [deps]
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runAgent1Horizon260V14(deps={}){
  const runner=deps.runner??runDevelopment;
  const v13=deps.v13??runAgent1CommonRadiantV13;
  assert.equal(typeof runner,'function');
  assert.equal(typeof v13,'function');
  const invoked=[];
  function extendedRunner(options){
    assert.equal(options?.nativeRootActionLimit,PRIOR_LIMIT,
      'v14 may only extend the exact v13 registered native horizon');
    const next={...options,nativeRootActionLimit:LIMIT};
    invoked.push({before:options.nativeRootActionLimit,
      after:next.nativeRootActionLimit,
      originalSourceRanks:[...new Set(
        (next.registeredTrials??[]).map(x=>x.rank))].sort(),
      registeredIds:(next.registeredTrials??[]).map(x=>x.id)});
    return runner(next);
  }
  const executed=v13({...deps,runner:extendedRunner});
  assert.equal(invoked.length,1,'Exactly one native batch required');
  assert.deepEqual(invoked[0].registeredIds.sort(),
    registeredTrials().map(x=>x.id).sort());
  const rows=executed.rawDevelopment?.rows??[];
  assert.equal(rows.length,8,'Censored and errored original trials remain');
  const publicRows=rows.map(row=>{
    const actions=row.rootActionLedger??
      row.nativeAbortEvidence?.rootActionLedger??null;
    assert.ok(Array.isArray(actions),
      'Native action history must be available for each original trial');
    assert.ok(actions.length<=LIMIT,
      'No original trial may exceed the new v14 root cap');
    return {
      id:row.trial?.id??row.id,
      status:row.status??null,
      sourceSeat:row.sourceSeat??row.nativeAbortProvenance?.sourceSeat??null,
      sourcePhysicalDealFingerprint:row.sourceDealFingerprint??null,
      fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
      publicNativeRootCount:actions.length,
      publicNativeRootActions:actions,
      genuineNativeFinished:row.finished===true,
      reportedNativeWinner:row.winner??null,
      sourceActualAttacks:row.sourceAttackSettlement?.attacks??null,
      nativeError:row.error??null
    };
  });
  return {
    manifest:{
      ...executed.manifest,
      version:VERSION,policyEntryPoint:HASH_PATHS[1],
      originalV13PolicyUnmodified:true,
      actualNativeHorizonOverride:LIMIT,
      inheritedManifestPreviouslyDeclaredRootHorizon:PRIOR_LIMIT,
      nativeRootActionLimit:LIMIT,
      registrationOfOneHorizonChange:REGISTRATION,
      completeSourceAndOpponentPolicyCertified:false,
      officialMatchClockCertified:false,
      finalFixed60Selected:false,releaseQualified:false,
      competitiveGamesQualified:0,
      resolvedSourceAndPolicyHashes:[
        ...executed.manifest.resolvedSourceAndPolicyHashes,
        ...HASH_PATHS.map(hashRegisteredFile)
      ]
    },
    diagnostic:{
      ...executed.diagnostic,
      schema:VERSION,
      extendedRunnerInvocation:invoked[0],
      actualNativeRootLimit:LIMIT,
      publicNativeRows:publicRows,
      nativeTerminalCount:publicRows.filter(x=>
        x.genuineNativeFinished===true).length,
      sourceRankIndependentActorPolicy:true,
      competitiveGamesQualified:0,
      estimatedWinRate:null,
      verdict:'UNQUALIFIED-v14-260root-horizon-only-development'
    },
    rawDevelopment:executed.rawDevelopment
  };
}
module.exports={VERSION,LIMIT,PRIOR_LIMIT,REGISTRATION,HASH_PATHS,
  runAgent1Horizon260V14};
