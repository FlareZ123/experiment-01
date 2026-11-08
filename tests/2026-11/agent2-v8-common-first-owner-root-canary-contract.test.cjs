'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  hasReleaseQualifiedFirstOwnerRoot
}=require('../../simulation/evaluation/agent2-v8-common-first-owner-root-canary.cjs');
const {CODE}=require('../../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

function validRow(candidateSeat){
  const slot=candidateSeat===0?'A':'B';
  return {
    trialId:[3,0,slot,'agent2-original-rank13-v8-common'].join(':'),
    candidateRank:13,
    sourceRank:3,
    candidateSeat,
    sourceSeat:1-candidateSeat,
    seed:290134,
    actionLimit:128,
    status:'quarantined-first-owner-root-captured',
    activeRunDevelopmentRegistrationValid:true,
    activeRunDevelopmentRegistration:{
      registeredTrialCount:1,
      registeredTrialGroupCount:1,
      registeredSourceRanks:[3],
      registeredCandidateIds:['agent2-original-rank13-v8-common'],
      registeredCandidateArmMode:'single-candidate-arm',
      allowAdditionalOriginalSourceRanks:true
    },
    firstUnsupportedOwnerRoot:{
      ownerView:{decisionKind:'owner-root'},
      ownerVisibleSha256:'a'.repeat(64),
      hiddenSourceIdentitiesIncluded:false
    },
    nativeAbortEvidence:{actionOrdinal:17,rootActionCount:17},
    actorAbortCounters:{
      attemptedUnsupportedPasses:1,
      originalNativeDecoderExecuted:false
    },
    selectedV0:{
      rawDecoderExecuted:false,
      fallbackCalls:1,
      thrownCode:CODE
    }
  };
}

test('accepts two complete physical-seat owner-root receipts',()=>{
  assert.equal(hasReleaseQualifiedFirstOwnerRoot([
    validRow(0),validRow(1)
  ]),true);
});

test('rejects a missing physical-seat receipt',()=>{
  assert.equal(hasReleaseQualifiedFirstOwnerRoot([validRow(0)]),false);
});

test('rejects a preflight abort without an active rank-3 manifest',()=>{
  const row=validRow(0);
  row.activeRunDevelopmentRegistration=null;
  row.activeRunDevelopmentRegistrationValid=false;
  row.status='unqualified-native-abort';
  assert.equal(hasReleaseQualifiedFirstOwnerRoot([
    row,validRow(1)
  ]),false);
});

test('rejects a manifest for the wrong source rank',()=>{
  const row=validRow(1);
  row.activeRunDevelopmentRegistration.registeredSourceRanks=[6];
  assert.equal(hasReleaseQualifiedFirstOwnerRoot([
    validRow(0),row
  ]),false);
});

test('rejects a non-quarantined owner root',()=>{
  const row=validRow(0);
  row.actorAbortCounters.originalNativeDecoderExecuted=true;
  assert.equal(hasReleaseQualifiedFirstOwnerRoot([
    row,validRow(1)
  ]),false);
});

test('rejects repeated candidate seat rather than both orientations',()=>{
  assert.equal(hasReleaseQualifiedFirstOwnerRoot([
    validRow(0),validRow(0)
  ]),false);
});
