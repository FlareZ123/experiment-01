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
  const acceptedNewOwnerPromptRoots=initialCandidateRoots.filter(root=>
    root.playerSlot===1&&root.actionOrdinal>=originalCandidateRootOrdinal&&
    root.action==='ResolvePromptAction'&&
    root.pendingPrompt==='ChooseCardsPrompt');
  const promptAudit=candidate.v8OuterAudits?.ownerTreasurePrompts??null;
  const prompts=promptAudit?.events??[];
  const printedPayment=prompts.find(x=>
    x.sourcePrinting==='Mysterious Treasure FLI'&&
    x.kind==='printed-one-card-payment'&&
    x.ownerHandPrompt===true&&x.nativeValidatorAccepted===true);
  const sourceStampedOwnerSearch=prompts.find(x=>
    x.sourcePrinting==='Mysterious Treasure FLI'&&
    (x.kind==='owner-deck-search'||x.kind==='owner-deck-search-empty')&&
    x.ownerDeckPrompt===true&&x.nativeValidatorAccepted===true);
  const acceptedOwnerPayment=Boolean(printedPayment&&
    acceptedNewOwnerPromptRoots.length>=1);
  const acceptedOwnerSearch=Boolean(sourceStampedOwnerSearch&&
    acceptedNewOwnerPromptRoots.length>=2);
  const validSourceAdmission=selected.rows.every(row=>
    row.activeRunDevelopmentRegistrationValid===true);
  const rawDecoderStillQuarantined=selected.rows.every(row=>
    row.selectedV0?.rawDecoderExecuted===false);
  const registeredBothSeats=selected.rows.length===2&&
    candidate.sourceSeat===0&&source.sourceSeat===1;
  const gate={
    intendedPaymentTarget:'Mysterious Treasure FLI from original rank13 first owner root',
    originalCandidateRootOrdinal,
    acceptedNewOwnerPromptRoots,
    printedPayment:printedPayment??null,
    sourceStampedOwnerSearch:sourceStampedOwnerSearch??null,
    acceptedOwnerPayment,
    acceptedOwnerSearch,
    validSourceAdmission,
    registeredBothSeats,
    rawDecoderStillQuarantined,
    nativePaymentZoneCertified:false,
    firstOwnerPromptChainPassed:
      acceptedOwnerPayment&&acceptedOwnerSearch&&validSourceAdmission&&
      registeredBothSeats&&rawDecoderStillQuarantined
  };
  return {
    schema:SCHEMA,
    status:gate.firstOwnerPromptChainPassed?
      'PRINTED_OWNER_TREASURE_PAYMENT_AND_SEARCH_PROMPTS_ACCEPTED':
      'TREASURE_OWNER_PROMPT_CHAIN_NOT_YET_SETTLED',
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
  if(!result.gate.firstOwnerPromptChainPassed)process.exitCode=1;
}
module.exports={SCHEMA,run};
