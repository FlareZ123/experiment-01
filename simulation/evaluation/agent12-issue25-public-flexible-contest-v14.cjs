'use strict';

const assert=require('node:assert/strict');
const {runBilateralPublicEnergyIssue25V13}=
  require('./agent12-issue25-bilateral-public-energy-v13.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent12-issue25-v14-public-flexible-attack-contest-development';
const ENTRY='simulation/evaluation/agent12-issue25-public-flexible-contest-v14.cjs';
const KEY='AGENT41_PUBLIC_FLEXIBLE_CONTEST_DEV';
const SOURCE_HASH_PATHS=[
  ENTRY,
  'simulation/evaluation/agent12-issue25-bilateral-public-energy-v13.cjs',
  'simulation/twinleaf/agent41-public-flexible-energy-contest.cjs',
  'simulation/twinleaf/agent17-public-context-special-energy.cjs',
  'simulation/twinleaf/actor-energy-payability.cjs',
  'tests/agent12-issue25-public-flexible-contest-v14.test.cjs',
  'tests/agent12-issue25-public-flexible-contest-v14.native.test.cjs',
  '.github/workflows/agent50-rank26-koko-dual-recipient-native.yml'
];

/**
 * Scope an already-implemented optional owner-public contest to this one
 * synchronous experiment; historical v13 is unchanged. This is necessary
 * because the existing actor-only root bridge exposes the selected option
 * through an environment variable rather than the bilateral runner profile.
 * Never leak the experimental flag to another match, including after errors.
 *
 * @template T
 * @param {()=>T} run
 * @param {{[key:string]:string|undefined}} [environment]
 * @returns {T}
 */
function withScopedPublicFlexibleContest(run,environment=process.env){
  assert.equal(typeof run,'function');
  const existing=Object.prototype.hasOwnProperty.call(environment,KEY);
  const previous=environment[KEY];
  environment[KEY]='true';
  try{return run();}
  finally{
    if(existing)environment[KEY]=previous;
    else delete environment[KEY];
  }
}

/**
 * Registered same-eight-arm v13 policy ablation, adding the existing
 * source-independent special-over-basic immediate-attack contest for BOTH
 * physical seats. It modifies neither original 60s nor natural source deals.
 * The reported opt-in does not, by itself, prove that a decision was reached,
 * paid, or tactically sound; inspect real native Store roots separately.
 *
 * @param {object} [deps] v13 pure-test runner/layer injection.
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runPublicFlexibleContestIssue25V14(deps={}){
  const executed=withScopedPublicFlexibleContest(()=>
    runBilateralPublicEnergyIssue25V13(deps));
  const rows=executed.rawDevelopment?.rows??[];
  const flags=rows.map(row=>{
    const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    return {
      id:row.trial?.id??row.id??null,
      sourceSeat:row.sourceSeat??row.nativeAbortProvenance?.sourceSeat??null,
      actorPublicSpecialSelected:root?.publicContextSpecialEnergyOptIn??null,
      actorFlexibleContestSelected:root?.publicFlexibleEnergyContestOptIn??null,
      nativeStatus:row.status??'returned-unqualified',
      finished:row.finished===true
    };
  });
  return {
    manifest:{
      ...executed.manifest,
      version:VERSION,
      policyEntryPoint:ENTRY,
      comparisonBaseline:'agent12-issue25-v13-public-special-no-flexible-contest',
      experimentalSelection:KEY,
      bothSeatOwnerPublicFlexibleContestSelected:true,
      sameEightFrozenV13RegisteredArms:true,
      candidateAndOriginalSixtiesUnchanged:true,
      developmentOnly:true,
      resolvedSourceAndPolicyHashes:[
        ...(executed.manifest.resolvedSourceAndPolicyHashes??[]),
        ...SOURCE_HASH_PATHS.map(hashRegisteredFile)
      ],
      releaseQualified:false,competitiveGamesQualified:0
    },
    diagnostic:{
      ...executed.diagnostic,
      schema:VERSION,
      perAttemptContestFlag:flags,
      actorContestSelectedRows:flags.filter(row=>
        row.actorFlexibleContestSelected===true).length,
      verdict:'FAIL-development-native-energy-contest-not-competitive-game',
      competitiveGamesQualified:0
    },
    rawDevelopment:executed.rawDevelopment
  };
}

module.exports={VERSION,ENTRY,KEY,SOURCE_HASH_PATHS,
  withScopedPublicFlexibleContest,runPublicFlexibleContestIssue25V14};
