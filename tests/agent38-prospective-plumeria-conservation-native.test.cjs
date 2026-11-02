'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {registeredPlan,compareProspectiveNative,REGISTRATION_BLOB}=
  require('../simulation/evaluation/agent38-prospective-plumeria-conservation-native.cjs');

test('precommitted registration Git blob and all eight seed groups are exact',()=>{
  const {plan,trials}=registeredPlan();
  assert.equal(REGISTRATION_BLOB,'6142a6bac7dcb3fc88eb135c38f60ed1d2083151');
  assert.equal(plan.nativeAttempts,32);
  assert.equal(trials.length,16);
  const seedGroups=new Set(trials.map(x=>x.seed));
  assert.equal(seedGroups.size,8);
  assert.deepEqual(new Set(trials.map(x=>x.candidateSlot)),new Set(['A','B']));
  assert.deepEqual(new Set(trials.map(x=>x.candidateId)),
    new Set(['champion-reference','new-moon-lockbreaker-v1']));
  assert.ok(trials.every(x=>x.rank===6));
});

/** @param {boolean} enabled */
function fakeNative(enabled){
  const {trials}=registeredPlan();
  return {enginePin:'native-engine',attempted:16,competitiveQualifiedGames:0,
    rows:trials.map(trial=>{
      const sourceSeat=trial.candidateSlot==='A'?1:0;
      return {
        trial,sourceSeat,sourceActuallyFirst:false,
        fullPhysicalDealFingerprint:'full-'+trial.id,
        sourceDealFingerprint:'source-'+trial.seed,
        rootActionLedgerSha256:enabled?'changed-'+trial.id:'original-'+trial.id,
        rootActionLedger:[],
        status:'censored',
        actorOnlyDecisionCoverage:{
          detailedComponentAudits:{
            root:{
              nativePlumeriaPaymentConservationOptIn:enabled,
              sameRootProposalChoice:{ownerRoots:12,changedRoots:0,
                changedSamples:[]}
            },
            ownerPlumeriaAfterPass:{
              acceptedPlumeria:enabled?0:1,
              settledEnergyDiscards:enabled?0:1,
              physicallyAcceptedOwnerPayments:[],
              acceptedPrompts:0,unresolvedChains:0,log:[]
            }
          }
        }
      };
    })};
}

test('all sixteen original paired deals can be compared without game claims',()=>{
  const trials=registeredPlan().trials;
  const x=compareProspectiveNative(fakeNative(false),fakeNative(true),trials);
  assert.equal(x.validation.passed,true);
  assert.equal(x.actualNativeAttempts,32);
  assert.equal(x.summary.matchedPhysicalPairs,16);
  assert.equal(x.summary.policyFlagsConfirmed,16);
  assert.equal(x.summary.baselineAcceptedPlumeria,16);
  assert.equal(x.summary.conservationAcceptedPlumeria,0);
  assert.equal(x.summary.competitiveQualifiedGames,0);
});

test('a mismatched full deal and actor seat fail closed',()=>{
  const trial=registeredPlan().trials[0];
  const on=fakeNative(true);
  on.rows[0].sourceSeat=1-on.rows[0].sourceSeat;
  on.rows[0].fullPhysicalDealFingerprint='changed-native-deal';
  const result=compareProspectiveNative(fakeNative(false),on,
    registeredPlan().trials);
  assert.equal(result.validation.passed,false);
  assert.ok(result.validation.failures.includes('physical-deal-mismatch:'+trial.id));
  assert.ok(result.validation.failures.includes('wrong-source-seat:'+trial.id));
});

test('a missing policy audit is not silently treated as enabled',()=>{
  const on=fakeNative(true);
  delete on.rows[0].actorOnlyDecisionCoverage;
  const result=compareProspectiveNative(fakeNative(false),on,
    registeredPlan().trials);
  assert.equal(result.validation.passed,false);
  assert.ok(result.validation.failures.some(x=>
    x.startsWith('unverified-actual-policy-flag:')));
});

test('a missing native arm cannot be promoted to a complete experiment',()=>{
  const on=fakeNative(true);
  on.rows.pop();
  const result=compareProspectiveNative(fakeNative(false),on,
    registeredPlan().trials);
  assert.equal(result.validation.passed,false);
  assert.ok(result.validation.failures.includes('missing-or-duplicate-trial-rows'));
});
