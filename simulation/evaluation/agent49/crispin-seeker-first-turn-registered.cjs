'use strict';

const {run:runCanary}=require('../agent2-v8-common-first-owner-root-canary.cjs');
const {withTreasurePhysicalZoneReceipt}=
  require('../../twinleaf/agent49/treasure-payment-zone-observer.cjs');

const VERSION='agent49-rank13-crispin-vs-seeker-source-first-turn-v1';
const CRISPIN='Crispin SCR',SEEKER='VS Seeker PHF';
const GRASS='Grass Energy MEE';

/**
 * From the first unresolved real owner root, collect public owner hand,
 * public discard, board Energy and accepted native root count. Real root
 * decisions and native physical zones precede the allowed quarantine.
 * @param {object} run Registered canary result with physical Treasure receipt.
 * @param {boolean} recovery First-turn exact Crispin recovery opt-in.
 * @returns {object[]} Both genuine source-seat perspectives.
 */
function summarize(run,recovery){
  const payments=run.audit.physicalReceipts;
  return run.result.rows.map(row=>{
    const view=row.firstUnsupportedOwnerRoot?.ownerView??null;
    const owner=view?.ownPublic??null;
    const v=(owner?.bench??[]).find(x=>
      x?.name==='Regidrago V'&&x.printing==='Regidrago V SIT');
    const actualPayment=payments.find(x=>
      x.seat===row.candidateSeat&&x.sourceZone==='owner-hand');
    const actualSearch=payments.find(x=>
      x.seat===row.candidateSeat&&x.sourceZone==='owner-deck');
    const hand=view?.ownHand??[];
    const discard=owner?.discard??[];
    return {
      recovery,trialId:row.trialId,
      candidateSeat:row.candidateSeat,
      sourceSeat:row.sourceSeat,seed:row.seed,
      candidateRank:row.candidateRank,sourceRank:row.sourceRank,
      registered:row.activeRunDevelopmentRegistrationValid,
      candidateDeckSha256:row.candidateDeckSha256,
      sourceDeckSha256:row.sourceDeckSha256,
      nativeStatus:row.status,
      nativeErrorMessage:row.selectedV0?.thrownMessage??null,
      nativeErrorText:row.nativeErrorText??null,
      nativeDirectErrorMessage:row.nativeDirectErrorMessage??null,
      nativeDirectErrorStack:row.nativeDirectErrorStack??null,
      nativeRunErrors:row.runDevelopmentOutputSummary?.errors??null,
      nativeFinalRoots:row.nativeAbortEvidence?.acceptedRootPrefix??[],
      nativeRootCount:row.nativeAbortEvidence?.rootActionCount??null,
      turn:view?.globalTurn??null,
      itemPaymentPhysicallyMoved:actualPayment?.zoneMoveVerified??false,
      originalPaymentPrinting:actualPayment?.selectedPrinting??null,
      searchedVstarPhysicallyMoved:actualSearch?.zoneMoveVerified??false,
      originalSearchPrinting:actualSearch?.selectedPrinting??null,
      crispinInHand:hand.includes(CRISPIN),
      crispinInDiscard:discard.includes(CRISPIN),
      seekerInHand:hand.includes(SEEKER),
      seekerInDiscard:discard.includes(SEEKER),
      activeGrass:(owner?.active?.energies??[]).includes(GRASS),
      regidragoBenchGrass:(v?.energies??[]).includes(GRASS),
      ownerHandPrintings:hand,
      ownerDiscardPrintings:discard,
      nativeAcceptedPrefix:row.nativeAbortEvidence?.initialAcceptedRootPrefix??[],
      opponentResponseProved:false,
      competitiveQualified:false
    };
  });
}

/**
 * Compare default-off first-turn Crispin recovery via VS Seeker with
 * untreated source-first-turn Treasure->Grass setup. The Energy destination
 * is kept on the same Regidrago Bench in both arms to isolate the Item
 * recovery decision. No native game is claimed as a win or loss.
 * @returns {object} Full prospective original-60 same-seed source attempts.
 */
function run(){
  const base={
    mysteriousTreasureRoot:true,treasurePaymentChoice:'crispin',
    firstRegidragoBenchGrass:true
  };
  const control=withTreasurePhysicalZoneReceipt(()=>runCanary({
    ...base,firstCrispinSeekerRecovery:false
  }));
  const treatment=withTreasurePhysicalZoneReceipt(()=>runCanary({
    ...base,firstCrispinSeekerRecovery:true
  }));
  const rows=[...summarize(control,false),...summarize(treatment,true)];
  const source=rows.filter(x=>x.candidateSeat===1);
  const registeredBothSeats=rows.length===4&&
    [false,true].every(recovery=>
      [0,1].every(seat=>rows.some(x=>x.recovery===recovery&&
        x.candidateSeat===seat)));
  const sourcePrintingsMatch=rows.every(x=>
    x.candidateDeckSha256===rows[0].candidateDeckSha256&&
    x.sourceDeckSha256===rows[0].sourceDeckSha256);
  const treasureBothArms=source.length===2&&source.every(x=>
    x.itemPaymentPhysicallyMoved&&x.searchedVstarPhysicallyMoved&&
    x.originalPaymentPrinting===CRISPIN&&
    x.originalSearchPrinting==='Regidrago VSTAR SIT');
  const nativeCrispinRecoveryContrast=treasureBothArms&&
    source[0].crispinInDiscard&&source[0].seekerInHand&&
    !source[0].crispinInHand&&
    source[1].crispinInHand&&source[1].seekerInDiscard&&
    !source[1].crispinInDiscard&&
    source.every(x=>x.regidragoBenchGrass&&!x.activeGrass);
  return {
    schema:VERSION,
    originalFieldRank13VsRank3:true,
    fixedSeed:290134,matchedPhysicalDealProven:false,
    rows,
    gates:{
      registeredBothSeats,sourcePrintingsMatch,treasureBothArms,
      nativeCrispinRecoveryContrast,
      stageCompleted:registeredBothSeats&&sourcePrintingsMatch&&
        nativeCrispinRecoveryContrast
    },
    completePaperGames:0,competitiveQualifiedGames:0,
    estimatedWinRate:null,
    limitation:'Physical owner-zone first-turn Item line, no opponent reply, no matchup win or board-strength estimate.'
  };
}

if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.gates.stageCompleted)process.exitCode=1;
}
module.exports={VERSION,summarize,run};
