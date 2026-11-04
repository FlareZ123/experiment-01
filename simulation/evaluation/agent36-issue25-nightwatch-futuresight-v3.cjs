'use strict';

const assert=require('node:assert/strict');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');
const {withPrintedOwnerAttackFrontier,runFutureSightIssue25V2}=
  require('./agent36-issue25-printed-futuresight-v2.cjs');
const {withSourceStampedNightWatchOwner}=
  require('../twinleaf/agent36-source-stamped-nightwatch-owner.cjs');

const VERSION='agent36-issue25-source-stamped-nightwatch-futuresight-v3';
const PUBLIC_PRECOMMITTED_SEED=
  'issue25-agent36-v3-historical-nightwatch-independent-seed-20261104';
const EXTRA_HASH_PATHS=[
  'simulation/evaluation/agent36-issue25-nightwatch-futuresight-v3.cjs',
  'simulation/twinleaf/agent36-source-stamped-nightwatch-owner.cjs',
  'simulation/twinleaf/agent12-nightwatch-paper-random-chooser.cjs',
  'tests/agent36-issue25-nightwatch-futuresight-v3.native.test.cjs'
];

/**
 * Exactly one additional precommitted physical-random attack choice: source
 * stamped Night Watch, preserving the v2 exact Future Sight owner order and
 * read-only source printing observer. No Get Lost owner action is installed.
 * Keeps the same original historical four-arm 48-root registration as v0.
 *
 * @template T
 * @param {()=>T} next
 * @returns {{result:T,audit:object}}
 */
function withNightWatchAndFutureSightFrontier(next){
  assert.equal(typeof next,'function');
  let nightWatchAudit=null;
  const selected=withPrintedOwnerAttackFrontier(()=>{
    const nw=withSourceStampedNightWatchOwner(next,{
      committedSeed:PUBLIC_PRECOMMITTED_SEED
    });
    nightWatchAudit=nw.audit;
    return nw.result;
  });
  return {result:selected.result,audit:{
    ...selected.audit,sourceStampedNightWatch:nightWatchAudit
  }};
}

/**
 * This is a development-only opt-in composed profile, NOT a legal or
 * competitively qualified independent-player release.
 * @param {{runner?:Function,attackLayer?:Function,layers?:object}} [deps]
 */
function runNightWatchFutureSightIssue25V3(deps={}){
  const selected=runFutureSightIssue25V2({
    runner:deps.runner??runDevelopment,
    layers:deps.layers,
    attackLayer:deps.attackLayer??withNightWatchAndFutureSightFrontier
  });
  const report=selected.diagnostic.audit?.firstBlockedPromptEnvelope??null;
  const manifest={
    ...selected.manifest,
    version:VERSION,
    profile:'48-root-historical-exact-printed-two-attack-prompts-v3',
    policyEntryPoint:EXTRA_HASH_PATHS[0],
    selectedOuterToInner:[
      ...selected.manifest.selectedOuterToInner.slice(0,-1),
      'sourceStampedNightWatchOpaquePhysicalChoice',
      'canonicalActorCommonRunner'
    ],
    newNightWatchPromptSelected:true,
    nightWatchChoiceKind:'precommitted-uniform-physical-indices',
    nightWatchPublicCommittedSeed:PUBLIC_PRECOMMITTED_SEED,
    stillUnresolvedGetLostOwnerPrompt:true,
    resolvedSourceAndPolicyHashes:[
      ...selected.manifest.resolvedSourceAndPolicyHashes,
      ...EXTRA_HASH_PATHS.map(hashRegisteredFile)
    ],
    releaseQualified:false,competitiveGamesQualified:0
  };
  const diagnostic={
    ...selected.diagnostic,
    schema:VERSION,
    sourceStampedNightWatch:report?.sourceStampedNightWatch??null,
    verdict:'FAIL-development-GetLost-and-root-policy-open',
    competitiveGamesQualified:0
  };
  return {manifest,diagnostic,rawDevelopment:selected.rawDevelopment};
}
module.exports={VERSION,PUBLIC_PRECOMMITTED_SEED,
  withNightWatchAndFutureSightFrontier,
  runNightWatchFutureSightIssue25V3};
