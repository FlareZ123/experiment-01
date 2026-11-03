'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {registration,executeOne,writeRegisteredReport}=
  require('../twinleaf/agent8-rank13-donor-paired-original-native.cjs');

const REGISTRATION=path.resolve(__dirname,
  '../../results/aichi-2026/registrations/agent8-rank13-treasure-native-paired-retrospective-20261103.json');
const VERSION='agent8-rank13-native-selected-treasure-transport-v1';

function sourceSummary(arm,sourceSeat){
  const sourceActions=(arm.publicAcceptedActions??[])
    .filter(action=>action.seat===sourceSeat);
  const treasureActions=sourceActions.filter(action=>
    action.action==='PlayCardAction'&&action.card==='Mysterious Treasure');
  const rootAccess=arm.sourceOwnerPayloadAccessRoots??[];
  const sourceTreasureEligibleRoots=rootAccess.filter(row=>
    row.regidragoOnBoard&&row.handCounts?.mysteriousTreasure>0&&
    row.itemPlayLocked!==true);
  const native=arm.treasureNativeAudit??{};
  return {
    status:arm.status,winner:arm.winner??null,endReason:arm.endReason??null,
    nativeActions:arm.nativeActionCount??null,
    nativeSourceTreasurePlays:treasureActions.length,
    selectedSourceTreasureActions:treasureActions,
    ownerVisibleTreasurePotentialTurns:[...new Set(
      sourceTreasureEligibleRoots.map(row=>row.turn))],
    nativeTreasureChains:{
      allSeatsAccepted:native.observedAcceptedItemRoots??null,
      allSeatsPaidCosts:native.costPromptAccepted??null,
      allSeatsSearches:native.searchPromptAccepted??null,
      physicallyPaidCards:native.physicalCostDiscards??null,
      physicallyRetrievedTargets:native.physicalTargetRetrievals??null,
      completedPhysicalChains:native.completedPhysicalChains??null,
      rejectedReplies:native.failedOrRejectedReplies??null,
      receipts:native.receipts??[]
    },
    sourceApexDeclarations:(arm.sourceAttackDetails??[])
      .filter(a=>a.attack==='Apex Dragon').length,
    sourceNativeCopiedChoices:arm.sourceNativeCopiedAttackChoices??[],
    sourceDragonDiscardAtApex:(arm.sourceAttackDetails??[])
      .filter(a=>a.attack==='Apex Dragon')
      .map(a=>({turn:a.turn,
        publicDiscard:(arm.sourceOwnerDragonDiscardTimeline??[])
          .filter(d=>d.turn===a.turn)})),
    sourcePrizeChanges:(arm.sourceAttackDetails??[])
      .filter(a=>JSON.stringify(a.prizesBefore)!==
        JSON.stringify(a.prizesAfter)),
    settledPhysicalCustodyAnomalies:
      arm.physicalCustody?.abnormalSettledRoots??null,
    competitiveQualifiedGames:0
  };
}

function main(){
  initializeCards();
  const frozen=JSON.parse(fs.readFileSync(REGISTRATION,'utf8'));
  assert.equal(frozen.schema,
    'agent8-rank13-original-treasure-preselected-eight-deal-transport-v1');
  const {registered,byRank}=registration();
  assert.deepEqual(frozen.sourceSeedMatrix,registered.trialMatrix);
  assert.equal(frozen.upstreamTwinleaf,registered.enginePin);
  const rows=[];
  for(const trial of frozen.sourceSeedMatrix){
    const control=executeOne(trial,byRank,false,true,true,false);
    const treatment=executeOne(trial,byRank,false,true,true,true);
    const accepted=control.status==='native-returned'&&
      treatment.status==='native-returned';
    const exactlyPaired=accepted&&control.sourceDealSha256!==null&&
      control.sourceDealSha256===treatment.sourceDealSha256&&
      control.fullPhysicalDealSha256!==null&&
      control.fullPhysicalDealSha256===treatment.fullPhysicalDealSha256;
    const a=control.publicAcceptedActions??[];
    const b=treatment.publicAcceptedActions??[];
    const index=Array.from({length:Math.max(a.length,b.length)},(_,i)=>i)
      .find(i=>JSON.stringify(a[i]??null)!==JSON.stringify(b[i]??null));
    rows.push({trial,allNativeReturned:accepted,
      initialSourceAndFullDealMatched:exactlyPaired,
      firstAcceptedPublicActionDifference:index===undefined?null:{
        index,control:a[index]??null,treatment:b[index]??null},
      summaries:{
        control:sourceSummary(control,trial.sourceSeat),
        treatment:sourceSummary(treatment,trial.sourceSeat)
      },
      originalFullNativeArms:{control,treatment},
      qualifiedCompetitiveGames:0});
  }
  return {schema:VERSION,
    frozenRegistration:
      'results/aichi-2026/registrations/agent8-rank13-treasure-native-paired-retrospective-20261103.json',
    retainedOriginalSeedGroups:8,pinnedEngine:frozen.upstreamTwinleaf,
    identicalPhysicalSixties:true,
    experimentType:'post-observation matched native mechanics transport',
    policyDifference:'Agent49 Treasure root plus native two-prompt payment/search continuation',
    controls:'Paper Celestial Roar and bounded mandatory-energy fixes both arms; symmetric generic natural evolution, actor payment and search',
    attempts:rows.length*2,matchedPairs:rows.filter(r=>
      r.initialSourceAndFullDealMatched).length,
    returnedPairs:rows.filter(r=>r.allNativeReturned).length,
    allAborted:rows.filter(r=>!r.allNativeReturned).length,
    rows,qualifiedCompetitiveGames:0,
    caveat:'Previously observed physical seed groups, generic opponent, 160 native-action cap, untimed and incomplete game-policy fidelity. Native winners and copied attack declarations cannot establish competitive win rate.'};
}

if(require.main===module){
  const result=main();
  const filename=process.env.AGENT8_RANK13_TREASURE_REPORT;
  if(filename)writeRegisteredReport(result,filename);
  console.log('AGENT8_RANK13_TREASURE_NATIVE_SUMMARY',
    JSON.stringify({attempts:result.attempts,
      returnedPairs:result.returnedPairs,matchedPairs:result.matchedPairs,
      sourceTreasurePlays:result.rows.map(row=>({
        trial:row.trial,
        control:row.summaries.control.nativeSourceTreasurePlays,
        treatment:row.summaries.treatment.nativeSourceTreasurePlays,
        sourceCopyChoicesTreatment:
          row.summaries.treatment.sourceNativeCopiedChoices.length}))}));
  if(!filename)process.stdout.write(JSON.stringify(result,null,2)+'\n');
}

module.exports={VERSION,sourceSummary,main};
