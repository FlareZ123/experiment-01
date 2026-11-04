'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,validateMirroredRegistration,loadMirroredRegistration,
  runMirroredIssue25V6
}=require('../simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');
const {buildReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

test('preregistered eight arms cover each source rank in both seats, paired with each fixed 60',()=>{
  const original=loadMirroredRegistration(),frozen=JSON.stringify(original);
  const rows=validateMirroredRegistration(original);
  assert.equal(rows.length,8);
  assert.equal(original.trialCount,8);
  for(const rank of [6,11]){
    for(const sourceSeat of [0,1]){
      const subset=rows.filter(r=>r.rank===rank&&
        (r.candidateSlot==='A'?1:0)===sourceSeat);
      assert.equal(subset.length,2);
      assert.deepEqual(subset.map(r=>r.candidateId).sort(),[
        'champion-reference','new-moon-lockbreaker-v1'
      ]);
      assert.equal(subset[0].seed,subset[1].seed);
    }
  }
  assert.equal(new Set(rows.map(r=>r.id)).size,8);
  assert.equal(JSON.stringify(original),frozen,
    'registration verification must not edit the original manifest');
});

test('registration rejects changed pair seed and rank×source-seat collapse',()=>{
  const m=loadMirroredRegistration();
  const altered=JSON.parse(JSON.stringify(m));
  altered.trials[1].seed+=1;
  assert.throws(()=>validateMirroredRegistration(altered),
    /paired original source seed mismatch/);
  const duplicate=JSON.parse(JSON.stringify(m));
  duplicate.trials[7].id=duplicate.trials[6].id;
  assert.throws(()=>validateMirroredRegistration(duplicate));
  const badSeat=JSON.parse(JSON.stringify(m));
  badSeat.trials=badSeat.trials.filter(row=>row.candidateSlot==='A');
  assert.throws(()=>validateMirroredRegistration(badSeat));
});

test('mirrored eight actual native runner options and registered IDs are executable and fail-closed',()=>{
  const layers={};
  for(const name of SELECTED_OUTER_TO_INNER.slice(0,-1))
    layers[name]=next=>({result:next(),audit:{name}});
  let received=null;
  const executed=runMirroredIssue25V6({
    layers,
    attackLayer:next=>({result:next(),audit:{
      sourceStampedFutureSight:{ownerPromptSelections:0},
      sourceStampedNightWatch:{sourcePromptMarks:0},
      sourceStampedGetLost:{actualOwnerSelections:0}
    }}),
    runner:options=>{
      received=options;
      return {sourceIndependentCommonPolicyOptIn:true,
        rows:options.registeredTrials.map(trial=>({
          trial,status:'fake-native-development',
          sourceSeat:trial.candidateSlot==='A'?1:0,
          candidateSeat:trial.candidateSlot==='A'?0:1,
          finished:false,
          rootActionLedger:[]
        }))};
    }
  });
  assert.equal(received.actorOnlyComposition,true);
  assert.equal(received.nativeRootActionLimit,48);
  assert.equal(received.sourceIndependentCommonPolicy,true);
  assert.equal(received.registeredTrials.length,8);
  assert.equal(received.registeredFrameName,
    'agent1-issue25-mirrored-original-source-r6-r11-v1');
  assert.equal(executed.manifest.version,VERSION);
  assert.equal(executed.manifest.developmentTrialCount,8);
  assert.equal(executed.manifest.historicalOnly,false);
  assert.equal(executed.diagnostic.registered.length,8);
  assert.equal(executed.diagnostic.attemptedRows.length,8);
  assert.deepEqual(executed.diagnostic.designedSourceSeatCrossTab,
    {'6':[0,1],'11':[0,1]});
  assert.deepEqual(executed.diagnostic.observedSourceSeatCrossTab,
    {'6':[0,1],'11':[0,1]});
  assert.equal(executed.diagnostic.bothSourceSeatsObservedPerRank,true);
  assert.equal(executed.diagnostic.registeredAttemptReconciliation.exactUniqueMatch,true);
  assert.equal(executed.manifest.releaseQualified,false);
  assert.equal(executed.diagnostic.competitiveGamesQualified,0);
  assert.ok(executed.manifest.resolvedSourceAndPolicyHashes.every(x=>
    /^[0-9a-f]{64}$/.test(x.sha256)));
  const receipt=buildReceipt(executed,{
    policyEntryPoint:'simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs'
  });
  assert.equal(receipt.registration.expectedIds.length,8);
  assert.equal(receipt.developmentGate.exactRegisteredReturn,true);
  assert.equal(receipt.developmentGate.competitiveGameQualified,false);
});
