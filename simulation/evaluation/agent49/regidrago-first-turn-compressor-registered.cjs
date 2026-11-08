'use strict';

const {run:runCanary}=require('../agent2-v8-common-first-owner-root-canary.cjs');
const {withTreasurePhysicalZoneReceipt}=
  require('../../twinleaf/agent49/treasure-payment-zone-observer.cjs');

const VERSION='agent49-rank13-original-first-turn-compressor-donor-move-v1';
const ELIGIBLE=new Set([
  'Dragapult ex TWM','Noivern ex PAL','Salamence ex JTG',
  'Dialga-GX UPR','Kyurem SFA'
]);

/**
 * Summarize accepted original native owner-turn public discard and board.
 * @param {object} run Wrapped original native canary.
 * @param {boolean} compressor Native source Item owner-deck chooser opt-in.
 * @returns {object[]} Registered seat records, retaining failed attempts.
 */
function summarize(run,compressor){
  const phys=run.audit.physicalReceipts;
  return run.result.rows.map(row=>{
    const view=row.firstUnsupportedOwnerRoot?.ownerView??null;
    const own=view?.ownPublic??null;
    const bench=(own?.bench??[]).find(x=>
      x?.name==='Regidrago V'&&x.printing==='Regidrago V SIT');
    const payment=phys.find(x=>
      x.seat===row.candidateSeat&&x.sourceZone==='owner-hand');
    const searched=phys.find(x=>
      x.seat===row.candidateSeat&&x.sourceZone==='owner-deck');
    const discard=own?.discard??[];
    return {
      compressor,trialId:row.trialId,seed:row.seed,
      candidateSeat:row.candidateSeat,sourceSeat:row.sourceSeat,
      sourceRank:row.sourceRank,candidateRank:row.candidateRank,
      registered:row.activeRunDevelopmentRegistrationValid,
      sourceDeckSha256:row.sourceDeckSha256,
      candidateDeckSha256:row.candidateDeckSha256,
      nativeStatus:row.status,
      nativeErrorMessage:row.selectedV0?.thrownMessage??null,
      nativeErrorText:row.nativeErrorText??null,
      nativeDirectErrorMessage:row.nativeDirectErrorMessage??null,
      nativeDirectErrorStack:row.nativeDirectErrorStack??null,
      nativeRunErrors:row.runDevelopmentOutputSummary?.errors??null,
      firstNativeRootCount:row.nativeAbortEvidence?.rootActionCount??null,
      nativeLastActions:row.nativeAbortEvidence?.acceptedRootPrefix??[],
      firstUnresolvedTurn:view?.globalTurn??null,
      confirmedTreasurePayment:payment?.zoneMoveVerified===true,
      confirmedTreasureSearch:searched?.zoneMoveVerified===true,
      originalPaymentPrinting:payment?.selectedPrinting??null,
      originalSearchPrinting:searched?.selectedPrinting??null,
      dragonDiscard:discard.filter(x=>ELIGIBLE.has(x)),
      compressorInDiscard:discard.includes('Battle Compressor PHF'),
      realRegidragoBenchEnergy:bench?.energies??null,
      actualOwnerHandPrintings:view?.ownHand??null,
      actualOwnerDiscardPrintings:discard,
      completeGame:false,qualifiedMatch:false
    };
  });
}
/**
 * Four original-deck attempts, both seats, with the same Muscle Band
 * payment and Bench Grass rule. The only treatment is the source-owned
 * first-turn Battle Compressor with native owner-deck donor selection.
 * @returns {object} Full native contrast, including failure receipts.
 */
function run(){
  const common={
    mysteriousTreasureRoot:true,treasurePaymentChoice:'muscle-band',
    firstRegidragoBenchGrass:true
  };
  const a=withTreasurePhysicalZoneReceipt(()=>runCanary({
    ...common,earlyRegidragoCompressor:false
  }));
  const b=withTreasurePhysicalZoneReceipt(()=>runCanary({
    ...common,earlyRegidragoCompressor:true
  }));
  const rows=[...summarize(a,false),...summarize(b,true)];
  const effective=rows.filter(x=>x.candidateSeat===1);
  const registration=rows.length===4&&rows.every(x=>x.registered);
  const sourceDecksMatched=rows.every(x=>
    x.sourceDeckSha256===rows[0].sourceDeckSha256&&
    x.candidateDeckSha256===rows[0].candidateDeckSha256);
  const treasureRootBoth=effective.length===2&&effective.every(x=>
    x.confirmedTreasurePayment&&x.confirmedTreasureSearch&&
    x.originalPaymentPrinting==='Muscle Band XY'&&
    x.originalSearchPrinting==='Regidrago VSTAR SIT');
  const nativeCompressorDonorContrast=treasureRootBoth&&
    effective[0].dragonDiscard.length===0&&
    effective[1].dragonDiscard.length>=1&&
    effective[1].compressorInDiscard&&
    effective.every(x=>x.realRegidragoBenchEnergy?.includes('Grass Energy MEE'))&&
    effective[1].firstNativeRootCount>
      effective[0].firstNativeRootCount;
  return {
    schema:VERSION,
    benchmark:'Original rank13 Regidrago versus original rank3 Snorlax',
    fixedSeed:290134,
    matchedPhysicalDealIndependentlyVerified:false,
    rows,
    gates:{
      registration,sourceDecksMatched,treasureRootBoth,
      nativeCompressorDonorContrast,
      stageCompleted:registration&&sourceDecksMatched&&
        nativeCompressorDonorContrast
    },
    completePaperGames:0,competitiveQualifiedGames:0,
    estimatedWinRate:null,
    limitations:'Development-only first-turn native physical zones and selected root cap; no completed opposing reply or paper Expanded admission.'
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.gates.stageCompleted)process.exitCode=1;
}
module.exports={VERSION,summarize,run};
