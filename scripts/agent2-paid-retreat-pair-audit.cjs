'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

function attackCounts(attacks){
  const counts={};
  for(const attack of attacks)counts[attack.attackName]=(counts[attack.attackName]??0)+1;
  return Object.fromEntries(Object.entries(counts).sort(([a],[b])=>a.localeCompare(b)));
}

/** Summarize real Store-root receipts without converting native endings into wins. */
function summarizeRow(row){
  const attacks=row.candidateAttackSettlement?.attacks??[];
  const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
  const roots=root?.nativeRootAcceptances??[];
  const retreats=roots.filter(event=>event.kind==='paid-retreat');
  const seat=row.candidateSeat;
  const prizes=attacks.filter(event=>event.settledPromptChain&&
    Array.isArray(event.prizesBefore)&&Array.isArray(event.prizesAfter)&&
    Number.isSafeInteger(seat)&&event.prizesAfter[seat]<event.prizesBefore[seat]);
  return {
    trialId:row.trial.id,
    status:row.status??null,error:row.error??null,
    sourceFingerprint:row.sourceDealFingerprint??null,
    actualStarter:row.actualStarterSeat??null,
    sourceTurnLineCompleted:row.sourceAudit?.completed===true,
    actualSourceFirst:row.sourceActuallyFirst===true,
    sourceAuditStatus:row.sourceAudit?.status??null,
    sourcePressureCompleted:row.sourceAudit?.completed===true,
    actorCoveragePresent:Boolean(row.actorOnlyDecisionCoverage),
    actorPaidRetreatEnabled:
      root?.paidRetreatRootOptIn??null,
    paidRetreatSelected:root?.typedIntentCounts?.['paid-retreat']??0,
    paidRetreatAccepted:retreats.filter(event=>event.accepted===true).length,
    paidRetreatPhysicalConfirmed:retreats.filter(event=>
      event.accepted===true&&event.nativePhysicalEffect==='confirmed-public-effect').length,
    rootActionCount:row.rootActionCount??null,
    rootLedgerSha256:row.rootActionLedgerSha256??null,
    candidateAttacksDeclared:attacks.length,
    candidateAttacksSettled:attacks.filter(event=>event.settledPromptChain).length,
    candidateAttackNames:attackCounts(attacks),
    candidatePrizeTransitions:prizes.map(event=>({
      turn:event.turnBefore,attack:event.attackName,
      before:event.prizesBefore,after:event.prizesAfter,
      genuineSourceReply:event.nextSourceSameEpochProven
    })),
    ending:{finished:row.finished??null,winner:row.winner??null,
      finalPrizes:row.finalPrizes??null,endReason:row.endReason??null},
    gameWinRateCertified:false
  };
}

/**
 * Locate the first actual Store action that differs, preserving matching roots
 * as evidence of a common replay prefix without conflating later stochastic
 * continuations with a parallel-world source response.
 * @param {object} baseline
 * @param {object} treatment
 * @returns {object|null}
 */
function firstNativeRootDifference(baseline,treatment){
  const left=baseline.rootActionLedger,right=treatment.rootActionLedger;
  if(!Array.isArray(left)||!Array.isArray(right))return null;
  let ordinal=0;
  while(ordinal<left.length&&ordinal<right.length&&
    JSON.stringify(left[ordinal])===JSON.stringify(right[ordinal]))ordinal++;
  if(ordinal===left.length&&ordinal===right.length)return null;
  const printable=root=>root?{
    seat:root.playerSlot,turnBefore:root.turnBefore,action:root.action,
    card:root.card??null,attack:root.attack??null
  }:null;
  return {ordinal,baseline:printable(left[ordinal]),
    treatment:printable(right[ordinal])};
}

/** Pair historical source-deal attempts under one engine and unchanged 60s. */
function comparePackets(control,treatment){
  assert.equal(control.attempted,4);
  assert.equal(treatment.attempted,4);
  assert.equal(control.competitiveQualifiedGames,0);
  assert.equal(treatment.competitiveQualifiedGames,0);
  assert.equal(control.enginePin,treatment.enginePin);
  assert.equal(control.sourceFirstRetrospective,treatment.sourceFirstRetrospective);
  assert.equal(control.rows.length,4);
  assert.equal(treatment.rows.length,4);
  const pairs=control.rows.map((left,index)=>{
    const right=treatment.rows[index];
    assert.deepEqual(left.trial,right.trial);
    if(left.actorOnlyDecisionCoverage){
      assert.equal(left.actorOnlyDecisionCoverage.detailedComponentAudits?.root?.paidRetreatRootOptIn,false);
    }
    if(right.actorOnlyDecisionCoverage){
      assert.equal(right.actorOnlyDecisionCoverage.detailedComponentAudits?.root?.paidRetreatRootOptIn,true);
    }
    const exactSourcePhysical=Boolean(left.sourceDealFingerprint&&
      right.sourceDealFingerprint&&
      left.sourceDealFingerprint===right.sourceDealFingerprint);
    const matchingStarter=Boolean(left.verifiedFirstTurn&&right.verifiedFirstTurn&&
      left.actualStarterSeat===right.actualStarterSeat);
    return {
      trialId:left.trial.id,exactSourcePhysical,matchingStarter,
      completeBothActorAudits:Boolean(left.actorOnlyDecisionCoverage&&
        right.actorOnlyDecisionCoverage),
      firstNativeRootDivergence:firstNativeRootDifference(left,right),
      control:summarizeRow(left),treatment:summarizeRow(right)
    };
  });
  return {
    schema:'agent2-paid-retreat-paired-store-artifact-audit-v1',
    comparison:'one-flag-actor-paid-retreat-control-vs-treatment',
    enginePin:control.enginePin,registeredAttempts:4,
    exposure:control.sourceFirstRetrospective===true?
      'outcome-selected-retrospective-source-first':'original-historical',
    fullyMatchedPhysicalPairs:pairs.filter(row=>
      row.exactSourcePhysical&&row.matchingStarter).length,
    pairs,
    observedCompetitiveQualifiedGames:0,
    globalFieldWinRateInferred:false
  };
}

if(require.main===module){
  const [baselinePath,treatmentPath]=process.argv.slice(2);
  assert.ok(baselinePath&&treatmentPath,'Specify two existing Store artifact JSON paths');
  const baseline=JSON.parse(fs.readFileSync(baselinePath,'utf8'));
  const treatment=JSON.parse(fs.readFileSync(treatmentPath,'utf8'));
  console.log('PAID_RETREAT_EXISTING_ARTIFACT_AUDIT '+JSON.stringify(
    comparePackets(baseline,treatment)));
}

module.exports={comparePackets,summarizeRow,firstNativeRootDifference};
