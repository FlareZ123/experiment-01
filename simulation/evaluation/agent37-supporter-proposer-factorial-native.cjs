'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('../twinleaf/headless.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {nativeFirstDifference,digest}=
  require('./agent7-funded-stadium-symmetric-eightgroup-native.cjs');
const {withSeatScopedSupporterPurity}=require(
  '../twinleaf/agent37-seat-scoped-supporter-proposal-purity.cjs');
const REG=require('../../results/aichi-2026/registrations/' +
  'agent37-supporter-proposer-seat-factorial-v1-20261104.json');
const NATIVE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=relative=>require(path.join(NATIVE,relative));

/**
 * Exactly one preregistered group with five source-identical action policies.
 * The existing original/native player policy is otherwise untouched.
 * @param {object} group Frozen original source ranks, seat and seed.
 * @param {object} classes Actual pinned vendor constructor references.
 */
function runGroup(group,classes){
  const plan=planAichi(group.primaryRank,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const primary=plan.candidate.cards;
  const other=plan.opponents.find(x=>x.rank===group.otherRank)?.cards;
  assert.equal(primary?.length,60);
  assert.equal(other?.length,60);
  const deckA=group.primarySeat===0?primary:other;
  const deckB=group.primarySeat===0?other:primary;
  const request={deckA,deckB,seed:group.seed,
    maxActions:REG.maxActions,
    strictPromptValidation:REG.strictPromptValidation,
    isolatePolicyRandomness:REG.isolatePolicyRandomness,
    captureDecisionTrace:REG.captureDecisionTrace,
    captureInitialFullPhysicalDeal:REG.captureInitialFullPhysicalDeal,
    label:REG.schema+'-'+group.id
  };
  const arms=[];
  for(const arm of REG.fixedArms){
    try{
      const selected=arm.correctSeats.length?
        withSeatScopedSupporterPurity(()=>runMatch(request),
          {...classes,correctSeats:arm.correctSeats}):
        {result:runMatch(request),audit:null};
      const game=selected.result;
      arms.push({id:arm.id,seats:[...arm.correctSeats],
        execution:'completed',error:null,
        fingerprint:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
        fullDeal:game.initialFullPhysicalDealFingerprint,
        digest:digest(game),finished:game.finished,winner:game.winner,
        numberOfActions:game.actions,
        rootActionLedger:game.rootActionLedger,
        decisionTrace:game.decisionTrace,attackTrace:game.attackTrace,
        audit:selected.audit});
    }catch(error){
      arms.push({id:arm.id,seats:[...arm.correctSeats],
        execution:'error',error:String(error?.stack??error),
        audit:error?.agent37SeatFactorAudit??null});
    }
  }
  const byId=new Map(arms.map(row=>[row.id,row]));
  const control=byId.get('native-control');
  const repeat=byId.get('native-control-repeat');
  const sameDeal=arms.every(arm=>arm.fingerprint===group.openingSha256);
  const repeatExact=control?.execution==='completed'&&
    repeat?.execution==='completed'&&
    control.digest===repeat.digest;
  const divergence=Object.fromEntries(arms.filter(arm=>
    arm.id!=='native-control'&&arm.id!=='native-control-repeat')
    .map(arm=>[arm.id,nativeFirstDifference(control,arm)]));
  const corrected=arms.filter(arm=>arm.audit);
  return {
    group:group.id,ranks:[group.primaryRank,group.otherRank],
    primarySeat:group.primarySeat,seed:group.seed,
    expectedOpening:group.openingSha256,
    sameOriginalPhysicalDealAllArms:sameDeal,
    repeatControlExact:repeatExact,
    armStatus:arms.map(a=>({id:a.id,status:a.execution,
      finished:a.finished??null,winner:a.winner??null,
      actions:a.numberOfActions??null,
      interventions:a.audit?.quotaCorrections??0,
      realStoreAccepted:a.audit?.realStoreAccepted??0,
      realStoreRejected:a.audit?.realStoreRejected??0,
      error:a.error??null})),
    firstActualDifference:divergence,
    perSeatCorrectedReceipts:corrected.map(a=>({
      id:a.id,seats:a.seats,
      corrections:a.audit.quotaCorrections,
      attemptedRealStore:a.audit.realStoreAccepted+a.audit.realStoreRejected,
      receipts:a.audit.selected
    })),
    arms
  };
}

/** @returns {object} */
function run(){
  initializeCards();
  const {Store}=native('game/store/store');
  const {PlaySupporterTactic}=native(
    'simple-bot/simple-tactics/play-supporter-tactic');
  const {PlayCardAction}=native('game/store/actions/play-card-action');
  const {TrainerCard}=native('game/store/card/trainer-card');
  const {TrainerType}=native('game/store/card/card-types');
  const {GamePhase}=native('game/store/state/state');
  const classes={Store,PlaySupporterTactic,PlayCardAction,
    TrainerCard,TrainerType,GamePhase};
  const rows=REG.groups.map(group=>runGroup(group,classes));
  const everyArm=rows.flatMap(row=>row.arms);
  const allMatched=rows.every(row=>row.sameOriginalPhysicalDealAllArms);
  const allControlsMatch=rows.every(row=>row.repeatControlExact);
  const noErrors=everyArm.every(arm=>arm.execution==='completed');
  const interventionRows=everyArm.filter(arm=>arm.audit);
  const exactReceipts=interventionRows.flatMap(arm=>arm.audit.selected);
  return{
    schema:REG.schema,
    registration:REG,
    researchHead:process.env.GITHUB_SHA??null,
    vendorPin:REG.enginePin,
    sourcePhysicalGroups:rows.length,
    attemptedNativeGames:everyArm.length,
    allMatchedOriginalDeals:allMatched,
    allRepeatedControlsIdentical:allControlsMatch,
    noNativeErrors:noErrors,
    realAcceptedInterventionProposals:
      interventionRows.reduce((sum,arm)=>sum+arm.audit.realStoreAccepted,0),
    realRejectedInterventionProposals:
      interventionRows.reduce((sum,arm)=>sum+arm.audit.realStoreRejected,0),
    correctedTurnGroupDuplicates:exactReceipts.length-
      interventionRows.reduce((sum,arm)=>sum+
        new Set(arm.audit.selected.map(r=>r.seat+'|'+r.turn)).size,0),
    everyStoreAcceptedQuotaExactlyOne:exactReceipts.every(r=>
      r.dispatched==='real-Store-accepted'&&r.storeQuotaAfter===1),
    competitiveQualifiedGames:0,
    note:'Original Aichi sixties, same-deal 2x2 seat-factorial native policy. Attacks or Prizes are development outcomes, not paper competitive wins.',
    rows
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  process.stderr.write('AGENT37_SUPPORTER_2X2 '+JSON.stringify({
    groups:result.sourcePhysicalGroups,
    attempts:result.attemptedNativeGames,
    originalDeals:result.allMatchedOriginalDeals,
    repeatedControls:result.allRepeatedControlsIdentical,
    noNativeErrors:result.noNativeErrors,
    liveSupporterAccepts:result.realAcceptedInterventionProposals,
    liveSupporterRejects:result.realRejectedInterventionProposals,
    duplicateInterventionTurns:result.correctedTurnGroupDuplicates,
    eachActualSupporterQuotaOne:result.everyStoreAcceptedQuotaExactlyOne,
    perGroup:result.rows.map(x=>({group:x.group,
      parity:x.sameOriginalPhysicalDealAllArms,
      repeat:x.repeatControlExact,arms:x.armStatus,
      firstDifferences:Object.fromEntries(Object.entries(
        x.firstActualDifference).map(([k,v])=>[k,v?.firstTreatment??null]))
    }))
  })+'\n');
  if(!result.allMatchedOriginalDeals||
     !result.allRepeatedControlsIdentical||!result.noNativeErrors||
     result.correctedTurnGroupDuplicates>0||
     !result.everyStoreAcceptedQuotaExactlyOne)process.exitCode=1;
}
module.exports={run,runGroup};
