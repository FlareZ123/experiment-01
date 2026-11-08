'use strict';

const assert=require('node:assert/strict');
const {run:runBaselineCanary}=require('./agent2-v8-common-first-owner-root-canary.cjs');

const SCHEMA='agent2-v8-rank13-rank3-treasure-root-optin-v1';

/**
 * Observe one default-off Treasure root treatment in an original 60-card
 * rank-13/rank-3 native match, retaining both physical seat orientations.
 * A first-turn PlayCardAction is an action-class witness only; printed card
 * identity must be independently joined from the native Store before it can
 * become a paper-accepted resource-chain claim.
 * @returns {object} Complete source registration, native receipts and gate.
 */
function run(){
  const selected=runBaselineCanary({mysteriousTreasureRoot:true});
  const candidate=selected.rows.find(row=>row.candidateSeat===1);
  const source=selected.rows.find(row=>row.candidateSeat===0);
  assert.ok(candidate&&source);
  const originalCandidateRootOrdinal=8;
  const initialCandidateRoots=
    candidate.nativeAbortEvidence?.initialAcceptedRootPrefix??[];
  const nextCandidateAction=initialCandidateRoots.find(root=>
    root.playerSlot===1&&root.actionOrdinal>=originalCandidateRootOrdinal);
  const acceptedFirstTurnOwnerPlayCard=initialCandidateRoots.some(root=>
    root.playerSlot===1&&root.turnBefore===1&&
    root.actionOrdinal>=originalCandidateRootOrdinal&&
    root.action==='PlayCardAction');
  const validSourceAdmission=selected.rows.every(row=>
    row.activeRunDevelopmentRegistrationValid===true);
  const rawDecoderStillQuarantined=selected.rows.every(row=>
    row.selectedV0?.rawDecoderExecuted===false);
  const registeredBothSeats=selected.rows.length===2&&
    candidate.sourceSeat===0&&source.sourceSeat===1;
  const gate={
    intendedPaymentTarget:'Mysterious Treasure FLI from original rank13 first owner root',
    originalCandidateRootOrdinal,
    nextCandidateAction:nextCandidateAction??null,
    acceptedFirstTurnOwnerPlayCard,
    validSourceAdmission,
    registeredBothSeats,
    rawDecoderStillQuarantined,
    paperConfirmedItemIdentity:false,
    firstOwnerActionClassGatePassed:
      acceptedFirstTurnOwnerPlayCard&&validSourceAdmission&&
      registeredBothSeats&&rawDecoderStillQuarantined
  };
  return {
    schema:SCHEMA,
    status:gate.firstOwnerActionClassGatePassed?
      'FIRST_TURN_OWNER_PLAYCARD_ACTION_CLASS_CAPTURED':
      'TREASURE_ROOT_INTENT_NOT_YET_NATIVE_ACCEPTED',
    treatment:'mysteriousTreasureRoot=true',
    comparatorRunId:42442029797,
    comparatorTreatment:'mysteriousTreasureRoot=false',
    sourceRank:3,candidateRank:13,
    fixedSeed:290134,actionCap:128,
    gate,selected,
    originalPrintedItemEffectNotYetCertified:true,
    completePaperGames:0,competitiveQualifiedGames:0,
    estimatedWinRate:null
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.gate.firstOwnerActionClassGatePassed)process.exitCode=1;
}
module.exports={SCHEMA,run};
