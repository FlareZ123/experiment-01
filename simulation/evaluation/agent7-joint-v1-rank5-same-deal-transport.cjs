'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {inspectProfile}=require('./agent41-joint-source-r5-r11-v1.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent7-joint-v1-rank5-transport-20261103.json';
const JOINT='simulation/evaluation/agent41-joint-source-r5-r11-v1.json';
const OUTPUT=path.join(ROOT,'agent7-joint-v1-rank5-same-deal-transport.json');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

/** @param {object} row @returns {object} */
function summarize(row){
  const actions=row.rootActionLedger??[];
  const sources=actions.filter(a=>a.playerSlot===row.sourceSeat&&
    a.action!=='ResolvePromptAction');
  const attackers=sources.filter(a=>a.action==='AttackAction');
  const sourceBall=sources.filter(a=>a.action==='PlayCardAction'&&
    String(a.card??'').startsWith('Quick Ball'));
  const sourceDce=sources.filter(a=>a.action==='PlayCardAction'&&
    String(a.card??'').startsWith('Double Colorless Energy'));
  return {
    id:row.trial.id,rank:row.trial.rank,sourceSeat:row.sourceSeat,
    candidateSeat:row.candidateSeat,starterSeat:row.actualStarterSeat,
    sourcePhysicalDeal:row.sourceDealFingerprint,
    fullPhysicalDeal:row.fullPhysicalDealFingerprint,
    wholeOriginalActionLedgerSha256:row.rootActionLedgerSha256,
    endReason:row.endReason,finished:row.finished,
    winnerSeat:row.winner,prizes:row.finalPrizes,
    nativeActionCount:row.actionCount,
    nativeSourceAttackRoots:attackers.map(x=>({
      turn:x.turnBefore,ordinal:x.actionOrdinal,attack:x.attack??null
    })),
    sourceQuickBallRoots:sourceBall.map(x=>({
      turn:x.turnBefore,ordinal:x.actionOrdinal
    })),
    sourceDceRoots:sourceDce.map(x=>({
      turn:x.turnBefore,ordinal:x.actionOrdinal
    })),
    sourceOriginalFirstOwnedResources:row.sourceFirstOwnedAffordances,
    sourceQuickBallActualPayment:row.paperQuickBallPaymentAudit,
    sourceQuickBallOwnerPhysicalTransaction:row.nativeQuickBallOwnerTransactions,
    sourceAttackSettlement:row.sourceAttackSettlement,
    selectedNativeSourceCopyPromptReceipts:
      row.paperPromptPortfolioAudit??null,
    paperQualified:false,competitiveQualified:false
  };
}

/** Execute the formerly selected joint-v1 rank5 physical deals in four arms. */
function run(){
  const pinned=inspectProfile();
  const regBytes=fs.readFileSync(path.join(ROOT,REG));
  const registration=JSON.parse(regBytes);
  const profileBytes=fs.readFileSync(path.join(ROOT,JOINT));
  const profile=JSON.parse(profileBytes);
  assert.equal(registration.schema,
    'agent7-joint-v1-original-rank5-same-deal-2x2-transport-v1');
  assert.equal(registration.precommittedBeforeAnyTransportNativeExecution,true);
  assert.equal(pinned.profileGitBlob,registration.jointSelectedProfileGitBlob);
  assert.equal(profile.pinnedVendor,registration.originalPinnedTwinleaf);
  assert.equal(registration.expectedNativeTotalMatches,16);
  const trials=registration.historicalJointV1RegisteredTrials;
  assert.equal(trials.length,4);
  assert.deepEqual(profile.registeredTrials.filter(t=>t.rank===5),
    trials,'Rank5 trials altered relative to originally selected joint-v1');
  const expectedArms=[
    [false,false],[true,false],[false,true],[true,true]];
  assert.deepEqual(registration.policyArms.map(a=>
    [a.actorOnlySingleSearch,a.actorHandDiscard]),expectedArms);
  assert.equal(profile.policyOptions.actorOnlySingleSearch,false);
  assert.equal(profile.policyOptions.actorHandDiscard,false);
  const output={
    schema:registration.schema,
    evidenceClass:'retrospective four-arm same-physical-deal rank5 joint-v1 source policy transport',
    sourceJointProfileGitBlob:pinned.profileGitBlob,
    sourceJointProfileSha256:hash(profileBytes),
    registration:REG,registrationSha256:hash(regBytes),
    pinnedTwinleaf:pinned.pinnedVendor,
    originalSelectedJointSourceRank5TrialIds:trials.map(t=>t.id),
    testedArms:[],complete:false,controlOriginalShaParity:false,
    pairwisePhysicalSourceDealStatus:'UNVERIFIED',
    qualifiedPaperGames:0,qualifiedCompetitiveGames:0,
    caveat:'Already observed joint-v1 original source physical deals; only a development transport. No exact match to older v3.1 physical seeds, no independent paper wins.'
  };
  const preserve=()=>writeAtomicLocked(OUTPUT,
    JSON.stringify(output,null,2)+'\n');
  const previous=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  assert.equal(previous,undefined);
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  try{
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    for(const arm of registration.policyArms){
      const begun={
        arm:arm.name,
        onlySingleSearch:arm.actorOnlySingleSearch,
        handDiscard:arm.actorHandDiscard,
        attemptedRegisteredGames:trials.length,
        completedNativeRows:0,trialSummaries:[],
        nativeErrors:[],
        fullSourceRows:[]
      };
      output.testedArms.push(begun);
      preserve();
      try{
        const response=runDevelopment({
          ...profile.policyOptions,
          actorOnlySingleSearch:arm.actorOnlySingleSearch,
          actorHandDiscard:arm.actorHandDiscard,
          registeredTrials:trials,
          registeredFrameName:profile.registeredFrameName
        });
        assert.deepEqual(response.rows.map(r=>r.trial.id),trials.map(t=>t.id),
          'Exact named trial coverage required');
        begun.completedNativeRows=response.rows.length;
        begun.trialSummaries=response.rows.map(summarize);
        begun.fullSourceRows=response.rows.map(r=>({
          trial:r.trial,
          sourceSeat:r.sourceSeat,
          rootActionLedger:r.rootActionLedger,
          physicalDealSnapshot:{
            sourceDealFingerprint:r.sourceDealFingerprint,
            fullPhysicalDealFingerprint:r.fullPhysicalDealFingerprint
          },
          sourceAttackSettlement:r.sourceAttackSettlement,
          nativeQuickBallOwnerTransactions:r.nativeQuickBallOwnerTransactions,
          paperQuickBallPaymentAudit:r.paperQuickBallPaymentAudit,
          sourceFirstOwnedAffordances:r.sourceFirstOwnedAffordances,
          candidateRepliesAfterSourceAttacks:
            r.candidateRepliesAfterSourceAttacks,
          actorDecisionTrace:r.actorDecisionTrace??null
        }));
      }catch(error){
        begun.nativeErrors.push(String(error?.stack??error));
      }
      preserve();
    }
  }finally{
    delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  }
  const control=output.testedArms[0];
  output.controlOriginalShaParity=control.trialSummaries.length===4&&
    control.trialSummaries.every(r=>r.wholeOriginalActionLedgerSha256===
      registration.originalHistoricalControlRootLedgers[r.id]);
  output.samePhysicalNamedTrialGroups=trials.map(t=>{
    const observations=output.testedArms.map(arm=>
      arm.trialSummaries.find(x=>x.id===t.id)??null);
    const present=observations.every(Boolean);
    return {
      id:t.id,
      present,physicalSourceEqual:present&&
        new Set(observations.map(x=>x.sourcePhysicalDeal)).size===1,
      fullPhysicalDealEqual:present&&
        new Set(observations.map(x=>x.fullPhysicalDeal)).size===1,
      sourceAttacksByArm:observations.map(x=>
        x?.nativeSourceAttackRoots?.length??null),
      nativeDispositionByArm:observations.map(x=>({
        ending:x?.endReason??null,winner:x?.winnerSeat??null,
        finalPrizes:x?.prizes??null
      }))
    };
  });
  output.pairwisePhysicalSourceDealStatus=
    output.samePhysicalNamedTrialGroups.every(g=>g.physicalSourceEqual&&
      g.fullPhysicalDealEqual)?'ALL_SAME_NAMED_TRIAL_EXACT':
      'MISSING_OR_MISMATCHED_INITIAL_PHYSICAL_DEALS';
  output.complete=output.testedArms.every(arm=>
    arm.completedNativeRows===4&&arm.nativeErrors.length===0);
  preserve();
  if(!output.controlOriginalShaParity||
     output.pairwisePhysicalSourceDealStatus!=='ALL_SAME_NAMED_TRIAL_EXACT'||
     !output.complete){
    throw new Error('Rank5 same-deal transport failed closed: '+JSON.stringify({
      parity:output.controlOriginalShaParity,
      pairing:output.pairwisePhysicalSourceDealStatus,
      complete:output.complete,
      errors:output.testedArms.map(x=>x.nativeErrors)
    }));
  }
  return output;
}

if(require.main===module){
  try{
    const x=run();
    console.log(JSON.stringify({
      schema:x.schema,
      baselineArchivedOriginalRootLedgerParity:x.controlOriginalShaParity,
      fullPhysicalPairStatus:x.pairwisePhysicalSourceDealStatus,
      allNativeAttemptsCompleted:x.complete,
      summary:x.samePhysicalNamedTrialGroups,
      paperQualified:0
    }));
  }catch(error){
    process.stderr.write(String(error?.stack??error)+'\n');
    process.exitCode=1;
  }
}
module.exports={run,summarize};
