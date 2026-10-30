'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runDevelopment}=require('../evaluation/agent41-bilateral-v2-development.cjs');
const {plannedTrials}=require('../evaluation/agent41-prospective-canonical-scout.cjs');
const {withNativeLillieDrawSettlementAudit}=
  require('./agent24-native-lillie-settlement-audit.cjs');
const {auditPreAttackSupporterFollowThrough}=
  require('../evaluation/agent2-preattack-supporter-followthrough.cjs');
const {auditPreAttackFirstDivergence}=
  require('../evaluation/agent2-preattack-supporter-divergence.cjs');

const ROOT=path.resolve(__dirname,'../..');
const FRAME='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';

/**
 * Retrospective engine-mechanism comparison on frozen genuine original deals.
 * Does not yield a matchup estimate; records source and candidate failures.
 *
 * @returns {object} All sampled statuses and side-attributed actual intents.
 */
function main(){
  const registeredFrame=JSON.parse(fs.readFileSync(
    path.resolve(ROOT,FRAME),'utf8'));
  const trials=plannedTrials(registeredFrame).filter(x=>
    (x.rank===6&&x.repeat===2&&x.candidateSlot==='A')||
    x.rank===11);
  assert.equal(trials.length,18);
  const options={...registeredFrame.frozenRunOptions,
    registeredTrials:trials,registeredFrameName:FRAME};
  const envBefore=process.env.AGENT2_SHUFFLE_PREATTACK_DEV;
  delete process.env.AGENT2_SHUFFLE_PREATTACK_DEV;
  let original,treatment;
  try{
    original=runDevelopment(options);
    process.env.AGENT2_SHUFFLE_PREATTACK_DEV='true';
    treatment=withNativeLillieDrawSettlementAudit(()=>runDevelopment(options));
  }finally{
    if(envBefore===undefined)delete process.env.AGENT2_SHUFFLE_PREATTACK_DEV;
    else process.env.AGENT2_SHUFFLE_PREATTACK_DEV=envBefore;
  }
  assert.equal(original.rows.length,18);
  assert.equal(treatment.result.rows.length,18);
  const rows=original.rows.map((baseline,index)=>{
    const treated=treatment.result.rows[index];
    assert.equal(baseline.trial.id,treated.trial.id);
    assert.equal(baseline.sourceDealFingerprint,
      treated.sourceDealFingerprint,'Original source physical deal changed');
    assert.equal(baseline.candidateSeat,treated.candidateSeat);
    const root=treated.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    const key='play-conservative-shuffle-supporter';
    const selectedOwnerIntents=(root?.ownerRootIntents??[]).filter(x=>
      x?.intent?.kind===key||x?.kind===key).slice(0,16);
    return {trial:baseline.trial.id,candidateSeat:baseline.candidateSeat,
      physicalDeal:baseline.sourceDealFingerprint,
      originalStatus:baseline.status??'native-complete',
      treatmentStatus:treated.status??'native-complete',
      originalRootSha:baseline.rootActionLedgerSha256,
      treatmentRootSha:treated.rootActionLedgerSha256??null,
      originalActions:baseline.actionCount,
      treatmentActions:treated.actionCount??null,
      originalFinished:baseline.finished,
      treatmentFinished:treated.finished??null,
      originalWinner:baseline.winner,treatmentWinner:treated.winner??null,
      originalError:baseline.error??null,
      treatmentError:treated.error??null,
      typedIntentSelected:root?.typedIntentCounts?.[key]??null,
      nativeAccepted:root?.nativePhysicalConfirmedByIntent?.[key]??null,
      nativeUnconfirmed:root?.nativePhysicalUnconfirmedByIntent?.[key]??null,
      rootPolicyOptIn:root?.conservativeShuffleBeforeAttackOptIn??null,
      selectedOwnerIntents,
      nativePublicFollowThrough:
        auditPreAttackSupporterFollowThrough(treated,selectedOwnerIntents),
      nativeFirstDivergence:
        auditPreAttackFirstDivergence(baseline,treated,selectedOwnerIntents)};
  });
  const summary={attempts:18,baselineStatuses:rows.reduce((acc,r)=>{
    acc[r.originalStatus]=(acc[r.originalStatus]??0)+1;return acc;},{}),
    treatedStatuses:rows.reduce((acc,r)=>{
      acc[r.treatmentStatus]=(acc[r.treatmentStatus]??0)+1;return acc;},{}),
    chosenIntents:rows.reduce((sum,r)=>sum+(r.typedIntentSelected??0),0),
    physicallyConfirmed:rows.reduce((sum,r)=>sum+(r.nativeAccepted??0),0),
    physicallyUnconfirmed:rows.reduce((sum,r)=>sum+(r.nativeUnconfirmed??0),0),
    nativeLillieRoots:treatment.audit.supportRoots,
    nativeLilliePrintedDrawConfirmed:treatment.audit.printedDrawConfirmed,
    firstDivergenceWasSupporter:rows.reduce((sum,row)=>
      sum+(row.nativeFirstDivergence?.directDivergences??0),0),
    sameTurnAttacksAfterDraw:rows.reduce((sum,row)=>
      sum+(row.nativeFirstDivergence?.records??[]).reduce((acc,item)=>
        acc+(item.treatmentAttacksAfterSupporter?.length??0),0),0),
    verifiedNativeSupporterFollowThrough:rows.reduce((sum,row)=>
      sum+(row.nativePublicFollowThrough?.verifiedPlayedRootCount??0),0),
    observedNextOwnRootAfterSupporter:rows.reduce((sum,row)=>
      sum+(row.nativePublicFollowThrough?.records??[]).filter(x=>
        x.sameTurnContinuationObserved).length,0),
    observedOpponentNextTurnRootAfterSupporter:rows.reduce((sum,row)=>
      sum+(row.nativePublicFollowThrough?.records??[]).filter(x=>
        x.opponentNewTurnContinuationObserved).length,0),
    observedCandidateNextTurnAfterSource:rows.reduce((sum,row)=>
      sum+(row.nativePublicFollowThrough?.records??[]).filter(x=>
        x.nextOwnerTurnContinuationObserved).length,0),
    sourceDealsPreserved:18,
    qualifiedCompetitiveGames:0};
  const out={
    schema:'agent2-shuffle-pre-attack-historical-native-v1',
    sourceFrame:FRAME,exactPublishedSourceSixties:true,
    sourceDealsVerifiedAgainstUntouchedControls:true,
    rank6SourceFirstAndAllRank11StartStrata:true,
    observerOnlyNativeLillieDrawSettlement:treatment.audit,
    summary,rows,
    interpretation:'Retrospective native mechanics only. A preattack shuffle may forfeit a payable attack or other critical resource. No claim of superior strategy, paper-clock games, or win rate.'
  };
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
  return out;
}
if(require.main===module)main();
module.exports={main};
