'use strict';

const assert=require('node:assert/strict');
const {runReplay,replayPlan}=require(
  './agent25-rank19-source-alias-retrospective.cjs');
const {VERSION,withRank19NativePublicActiveReadOnly}=require(
  '../twinleaf/agent28-rank19-native-source-root-readonly.cjs');
const RUN_VERSION='agent28-rank19-physical-source-active-four-replayed-v1';

/**
 * Repeat only Agent25's already-observed, four frozen original-rank19
 * registered source games with an outer read-only Store dispatch observer.
 * The experiment cannot qualify prospective wins or establish a candidate
 * deck ranking. Preserve all previously observed errors and action caps.
 */
function run(){
  const plan=replayPlan();
  const observed=withRank19NativePublicActiveReadOnly(runReplay);
  assert.equal(plan.trials.length,4);
  assert.equal(observed.result.rows.length,4);
  assert.equal(observed.audit.length,4,
    'Exactly four original Store matches must have source identification');
  const rows=plan.trials.map((trial,index)=>{
    const match=observed.result.rows[index],census=observed.audit[index];
    const sourceSeat=trial.candidateSlot==='A'?1:0;
    assert.equal(census.gameIndex,index+1);
    assert.equal(census.sourceSeat,sourceSeat);
    assert.equal(census.sourcePhysicalRagingCounts[sourceSeat],2);
    assert.equal(census.sourcePhysicalRagingCounts[1-sourceSeat],0);
    assert.equal(match.trial?.id,trial.id,'Original game order must match registration');
    return {
      trialId:trial.id,seed:trial.seed,
      sourceRank:19,sourceSeat,candidateId:trial.candidateId,
      status:match.status??(match.finished?'untimed-engine-terminal':'incomplete'),
      finished:match.finished===true,
      firstDealSha256:match.sourceDealFingerprint??null,
      rootLedgerSha256:match.rootActionLedgerSha256??null,
      sourceOwners:census
    };
  });
  return {version:RUN_VERSION,observer:VERSION,
    registration:plan.originalPrefixedRegistration,
    originalSourceOriginalSixtyAuthenticated:true,
    retrospectiveReusedSourceSeeds:true,
    originalPolicyAltered:false,
    nativeRootActionsPreserved:true,
    candidate60Unchanged:true,
    sourceActiveRagingRootTotal:rows.reduce((n,row)=>
      n+row.sourceOwners.sourceRagingActiveRoots,0),
    sourceBellowingAttackTotal:rows.reduce((n,row)=>
      n+row.sourceOwners.bellowingDeclared,0),
    rows,
    competitivelyQualifiedGames:0,
    limitation:'Retrospective source Active/root opportunity audit, not a prospective full-field policy comparison, AttackAction cost proof or time-qualified game.'};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={RUN_VERSION,run};
