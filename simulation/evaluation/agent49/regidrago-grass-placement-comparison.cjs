'use strict';

const {run:runCanary}=require('../agent2-v8-common-first-owner-root-canary.cjs');
const {withTreasurePhysicalZoneReceipt}=
  require('../../twinleaf/agent49/treasure-payment-zone-observer.cjs');

const VERSION='agent49-original-rank13-grass-placement-two-seat-contrast-v1';
const GRASS='Grass Energy MEE';
const TREASURE='Mysterious Treasure FLI';

/**
 * An actual source-rank13 owner-root board receipt after the Native Store
 * accepted the early-turn sequence. Never inspect hidden deck or Prize data.
 * @param {object} run Native registered canary and read-only physical observer.
 * @param {boolean} treatment Experimental destination selector.
 * @returns {object[]} Seat-complete outcome rows.
 */
function summarize(run,treatment){
  const receipts=run.audit.physicalReceipts;
  return run.result.rows.map(row=>{
    const root=row.firstUnsupportedOwnerRoot?.ownerView??null;
    const own=root?.ownPublic??null;
    const v=(own?.bench??[]).find(x=>
      x?.name==='Regidrago V'&&x.printing==='Regidrago V SIT');
    const payment=receipts.find(x=>
      x.seat===row.candidateSeat&&x.sourceZone==='owner-hand');
    const search=receipts.find(x=>
      x.seat===row.candidateSeat&&x.sourceZone==='owner-deck');
    return {
      treatment:'firstRegidragoBenchGrass='+treatment,
      candidateSeat:row.candidateSeat,sourceSeat:row.sourceSeat,
      trialId:row.trialId,
      seed:row.seed,
      candidateRank:row.candidateRank,sourceRank:row.sourceRank,
      originalCandidateSha256:row.candidateDeckSha256,
      originalSourceSha256:row.sourceDeckSha256,
      registered:row.activeRunDevelopmentRegistrationValid===true,
      nativeStatus:row.status,
      gameRootCount:row.nativeAbortEvidence?.rootActionCount??null,
      rootTurn:root?.globalTurn??null,
      actualActivePrinting:own?.active?.printing??null,
      actualActiveEnergyPrintings:own?.active?.energies??null,
      actualRegidragoEnergyPrintings:v?.energies??null,
      actualHeldCards:root?.ownHand??null,
      ownerTreasurePaymentMoved:payment?.zoneMoveVerified??false,
      ownerTreasureSearchMoved:search?.zoneMoveVerified??false,
      paymentPrinting:payment?.selectedPrinting??null,
      searchedPrinting:search?.selectedPrinting??null,
      nativeItemRootPresent:row.nativeAbortEvidence?.initialAcceptedRootPrefix
        ?.some(a=>a.actionOrdinal===7&&a.action==='PlayCardAction')??false,
      actualMovedGrassToRegidrago:
        (v?.energies??[]).includes(GRASS),
      actualMovedGrassToActive:
        (own?.active?.energies??[]).includes(GRASS),
      sourceOwnTurnAfterOpponentReplyCertified:false,
      qualifiedPaperGame:false
    };
  });
}

/**
 * Registered original 60s and both physical seat orientations, testing the
 * same printed Muscle Band payment with only the first-turn Energy-target
 * preference changed. This is developmental policy evidence only.
 * @returns {object} Complete control and intervention outcome.
 */
function run(){
  const control=withTreasurePhysicalZoneReceipt(()=>runCanary({
    mysteriousTreasureRoot:true,
    treasurePaymentChoice:'muscle-band',
    firstRegidragoBenchGrass:false
  }));
  const treatment=withTreasurePhysicalZoneReceipt(()=>runCanary({
    mysteriousTreasureRoot:true,
    treasurePaymentChoice:'muscle-band',
    firstRegidragoBenchGrass:true
  }));
  const rows=[...summarize(control,false),...summarize(treatment,true)];
  const owner=rows.filter(x=>x.candidateSeat===1);
  const fullRegistrations=rows.length===4&&rows.every(x=>x.registered);
  const sourceDecksMatch=rows.every(x=>
    x.originalCandidateSha256===rows[0].originalCandidateSha256&&
    x.originalSourceSha256===rows[0].originalSourceSha256);
  const ownerPhysicalPayments=owner.length===2&&owner.every(x=>
    x.ownerTreasurePaymentMoved&&x.ownerTreasureSearchMoved&&
    x.paymentPrinting==='Muscle Band XY'&&
    x.searchedPrinting==='Regidrago VSTAR SIT');
  const nativeGrassPlacementContrast=ownerPhysicalPayments&&
    owner[0].actualMovedGrassToActive&&
    !owner[0].actualMovedGrassToRegidrago&&
    owner[1].actualMovedGrassToRegidrago&&
    !owner[1].actualMovedGrassToActive&&
    owner[0].rootTurn===1&&owner[1].rootTurn===1;
  return {
    schema:VERSION,
    originalSourceRanks:{candidate:13,opponent:3},
    sharedPinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    fixedSeed:290134,
    fourRegisteredAttempts:rows.length,
    rows,
    gates:{
      fullRegistrations,sourceDecksMatch,ownerPhysicalPayments,
      nativeGrassPlacementContrast,
      matchedPhysicalDealIndependentlyVerified:false,
      stageCompleted:nativeGrassPlacementContrast&&
        fullRegistrations&&sourceDecksMatch
    },
    sourcePaperPrintAdmission:'provisional',
    completePaperGames:0,competitiveQualifiedGames:0,
    winRate:null,
    limitation:'Observed first-turn Zone and Bench Energy funding in a registered native developmental matchup, with no further source own-turn reply, Paper legality adjudication, or competitive outcome.'
  };
}

if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.gates.stageCompleted)process.exitCode=1;
}
module.exports={VERSION,summarize,run};
