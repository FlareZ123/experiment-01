'use strict';
const {initializeCards}=require('../twinleaf/headless.cjs');
const {
  registration,executeOne,writeRegisteredReport
}=require('../twinleaf/agent8-rank13-donor-paired-original-native.cjs');

const SCHEMA='agent8-original13-donor-evolution-retrospective-factorial-v1';
const ARMS=Object.freeze([
  {id:'no-donor-no-evolution',donor:false,evolution:false},
  {id:'donor-no-evolution',donor:true,evolution:false},
  {id:'no-donor-common-evolution',donor:false,evolution:true},
  {id:'donor-common-evolution',donor:true,evolution:true}
]);

/**
 * Four-arm retrospective diagnostic on the already published eight exact
 * original-source deals. Common natural evolution applies to both physical
 * seats; only the donor root is source-seat-scoped. Arm contrasts are causal
 * probes within known deals, not prospective or competitive win-rate data.
 * @returns {object}
 */
function main(){
  initializeCards();
  const {registered,byRank}=registration();
  const paperCorrection=process.env.AGENT8_RANK13_PAPER_CORRECTION==='true';
  const rows=registered.trialMatrix.map(trial=>{
    const arms={};
    for(const spec of ARMS){
      arms[spec.id]=executeOne(trial,byRank,spec.donor,
        spec.evolution,paperCorrection);
    }
    const outcomes=Object.values(arms);
    const allReturned=outcomes.every(row=>row.status==='native-returned');
    const sourceDeal=allReturned&&outcomes[0].sourceDealSha256!==null&&
      outcomes.every(row=>row.sourceDealSha256===outcomes[0].sourceDealSha256);
    const fullDeal=allReturned&&
      outcomes[0].fullPhysicalDealSha256!==null&&
      outcomes.every(row=>
        row.fullPhysicalDealSha256===outcomes[0].fullPhysicalDealSha256);
    const summaries={};
    for(const spec of ARMS){
      const arm=arms[spec.id];
      const ownerActions=(arm.publicAcceptedActions??[])
        .filter(action=>action.seat===trial.sourceSeat);
      summaries[spec.id]={
        status:arm.status,
        winner:arm.winner??null,
        endReason:arm.endReason??null,
        finalPrizes:arm.prizesRemaining??null,
        nativeActions:arm.nativeActionCount??null,
        donorNativeAccepted:arm.root?.donorNativeAccepted??0,
        nativeSourceEvolutionAcceptances:
          arm.sourceNativeEvolutionAcceptances??[],
        sourceOwnerEligibleVstarRootTurns:
          arm.sourceOwnerEligibleVstarRootTurns??[],
        sourceOwnerHeldVstarObservedTurns:[...new Set(
          (arm.sourceOwnerVstarObservations??[])
            .filter(row=>row.heldVstarCount>0).map(row=>row.turn))],
        sourceRegidragoVPlayRoots:ownerActions.filter(action=>
          action.action==='PlayCardAction'&&action.card==='Regidrago V').length,
        sourceVstarPlayRoots:ownerActions.filter(action=>
          action.action==='PlayCardAction'&&action.card==='Regidrago VSTAR').length,
        apexDragonDeclarations:(arm.sourceAttackDetails??[]).filter(action=>
          action.attack==='Apex Dragon').length,
        sourceAttackDetails:arm.sourceAttackDetails??[],
        sourceCopiedAttackSelections:arm.sourceCopiedAttackSelections??[],
        physicalCustody:arm.physicalCustody??null,
        paperCelestialAudit:arm.paperCelestialAudit??null,
        publicActionSha256:arm.gameDecisionTraceSha256??null,
        firstNativeAbort:arm.error??null
      };
    }
    return {
      trial,allNativeReturned:allReturned,
      sourceDealFingerprintsMatch:sourceDeal,
      fullPhysicalDealFingerprintsMatch:fullDeal,
      summaries,
      // Preserve every arm's full native decision, prompt and public receipts.
      arms,
      competitiveQualifiedGames:0
    };
  });
  const counts={
    sourceDeals:rows.length,
    nativeAttempts:rows.length*ARMS.length,
    allFourNativeReturned:rows.filter(r=>r.allNativeReturned).length,
    matchedSourceAndFullPhysical:rows.filter(r=>
      r.sourceDealFingerprintsMatch&&r.fullPhysicalDealFingerprintsMatch).length,
    nativeAborts:rows.reduce((n,row)=>n+ARMS.filter(spec=>
      row.arms[spec.id].status==='native-aborted').length,0),
    nativeSourceEvolutionByArm:Object.fromEntries(ARMS.map(spec=>
      [spec.id,rows.reduce((n,row)=>n+
        row.summaries[spec.id].nativeSourceEvolutionAcceptances.length,0)])),
    nativeDonorAcceptedByArm:Object.fromEntries(ARMS.map(spec=>
      [spec.id,rows.reduce((n,row)=>n+
        row.summaries[spec.id].donorNativeAccepted,0)]))
  };
  return {schema:SCHEMA,
    source:'exact-original-Aichi-2026-rank13-Regidrago',
    opponent:'exact-original-Aichi-2026-rank1-Shadow-Rider',
    inheritedRegistration:
      'results/aichi-2026/registrations/agent8-rank13-donor-native-paired-20261102.json',
    registrationPrecedesOriginalNativeRuns:true,
    factorialRegisteredBeforeExecution:false,
    experimentType:paperCorrection?
      'retrospective-paper-correct-four-arm-mechanics-diagnostic':
      'retrospective-four-arm-mechanics-diagnostic',
    paperCelestialCorrectionEnabled:paperCorrection,
    enginePin:registered.enginePin,
    exactPrintedOriginalSixties:true,
    bothSeatsShareCommonEvolutionSelectorWhenEnabled:true,
    donorRootSourceSeatOnly:true,
    trialArms:ARMS,counts,rows,competitiveQualifiedGames:0,
    caveat:'Existing observed seeds, naive or generic native bots, 160-action cap, no paper-clock fidelity, no competent source policy certification. Native outcomes are developmental, not competitive wins.'};
}

if(require.main===module){
  const result=main();
  if(process.env.AGENT8_RANK13_FACTORIAL_JSON)
    writeRegisteredReport(result,process.env.AGENT8_RANK13_FACTORIAL_JSON);
  console.log('AGENT8_RANK13_EVOLUTION_FACTORIAL_SUMMARY',
    JSON.stringify(result.counts));
  if(!process.env.AGENT8_RANK13_FACTORIAL_JSON)
    process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={SCHEMA,ARMS,main};
