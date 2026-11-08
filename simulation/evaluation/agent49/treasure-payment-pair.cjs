'use strict';
const {run:runCanary}=require('../agent2-v8-common-first-owner-root-canary.cjs');
const {withTreasurePhysicalZoneReceipt}=
  require('../../twinleaf/agent49/treasure-payment-zone-observer.cjs');

const VERSION='agent49-original-rank13-treasure-payment-registered-arms-v1';
const TREASURE='Mysterious Treasure FLI';
const EXPECTED=Object.freeze({crispin:'Crispin SCR',
  'muscle-band':'Muscle Band XY'});

/**
 * Summarize real original-source native Store receipts without treating
 * matching PRNG seeds as matching physical openings.
 * @param {object} source Full canary output.
 * @param {'crispin'|'muscle-band'} payment Registered branch.
 * @returns {object[]} Both retained physical-seat attempts.
 */
function summarize(source,payment,physicalAudit){
  return source.rows.map(row=>{
    const audit=row.v8OuterAudits?.ownerTreasurePrompts??{};
    const events=audit.events??[];
    const paid=events.find(x=>x.sourcePrinting===TREASURE&&
      x.kind==='printed-one-card-payment');
    const searched=events.find(x=>x.sourcePrinting===TREASURE&&
      (x.kind==='owner-deck-search'||x.kind==='owner-deck-search-empty'));
    const visible=audit.observedOwnerChoicePrompts??[];
    const chosen=paid?.physicalSelections?.[0]?.printing??null;
    const paymentReceipt=physicalAudit.physicalReceipts.find(x=>
      x.seat===row.candidateSeat&&x.sourceZone==='owner-hand');
    const searchReceipt=physicalAudit.physicalReceipts.find(x=>
      x.seat===row.candidateSeat&&x.sourceZone==='owner-deck');
    return {
      payment,candidateSeat:row.candidateSeat,
      sourceSeat:row.sourceSeat,trialId:row.trialId,seed:row.seed,
      candidateRank:row.candidateRank,sourceRank:row.sourceRank,
      registrationAccepted:row.activeRunDevelopmentRegistrationValid,
      candidateDeckSha256:row.candidateDeckSha256,
      sourceDeckSha256:row.sourceDeckSha256,
      nativeStatus:row.status,rawDecoderExecuted:row.selectedV0?.rawDecoderExecuted,
      nativeAbortCode:row.selectedV0?.thrownCode??null,
      acceptedRootCount:row.nativeAbortEvidence?.rootActionCount??null,
      firstRoots:row.nativeAbortEvidence?.initialAcceptedRootPrefix??[],
      observedTreasurePaymentPrompt:visible.some(x=>
        x.sourcePrinting===TREASURE&&x.isExactOwnerHandZone),
      actualPaymentPrinting:chosen,
      paymentMatchesRegisteredArm:chosen===EXPECTED[payment],
      paymentZoneReceipt:paymentReceipt??null,
      searchZoneReceipt:searchReceipt??null,
      physicalPaymentMoved:paymentReceipt?.zoneMoveVerified===true&&
        paymentReceipt.selectedPrinting===chosen,
      physicalSearchMoved:searchReceipt?.zoneMoveVerified===true&&
        searchReceipt.selectedPrinting===searched?.physicalSelections?.[0]?.printing,
      nativePaymentPromptValidated:paid?.nativeValidatorAccepted===true&&
        paid?.ownerHandPrompt===true,
      searchedPrinting:searched?.physicalSelections?.[0]?.printing??null,
      nativeSearchPromptValidated:searched?.nativeValidatorAccepted===true&&
        searched?.ownerDeckPrompt===true,
      searchWhiff:searched?.kind==='owner-deck-search-empty',
      promptEvents:events,
      diagnosticOnly:true
    };
  });
}

/**
 * Run two prospective, source-registered arms with the same two physical
 * seat orientations and exact original printed deck inventories. Preserve
 * all attempts even when the action fails or the owner gets a different hand.
 * @returns {object} Four native attempts and evidence boundaries.
 */
function run(){
  const crispin=withTreasurePhysicalZoneReceipt(()=>runCanary({
    mysteriousTreasureRoot:true,treasurePaymentChoice:'crispin'}));
  const muscleBand=withTreasurePhysicalZoneReceipt(()=>runCanary({
    mysteriousTreasureRoot:true,treasurePaymentChoice:'muscle-band'}));
  const attempts=[...summarize(crispin.result,'crispin',crispin.audit),
    ...summarize(muscleBand.result,'muscle-band',muscleBand.audit)];
  const seatOne=attempts.filter(x=>x.candidateSeat===1);
  const onePerArm=seatOne.length===2&&
    seatOne.some(x=>x.payment==='crispin')&&
    seatOne.some(x=>x.payment==='muscle-band');
  const fullRegistration=attempts.length===4&&
    attempts.every(x=>x.registrationAccepted===true);
  const nativeTreasurePaymentSearch=onePerArm&&
    seatOne.every(x=>x.paymentMatchesRegisteredArm&&
      x.nativePaymentPromptValidated&&x.nativeSearchPromptValidated);
  const nativePhysicalZoneMoves=onePerArm&&
    seatOne.every(x=>x.physicalPaymentMoved&&x.physicalSearchMoved);
  const seedsMatch=attempts.every(x=>x.seed===attempts[0].seed);
  const inventoriesMatch=attempts.every(x=>
    x.candidateDeckSha256===attempts[0].candidateDeckSha256&&
    x.sourceDeckSha256===attempts[0].sourceDeckSha256);
  return {
    schema:VERSION,
    benchmark:'original rank13 Regidrago against rank3 Snorlax',
    sourceFormat:'Japanese Extra; paper-print admission still provisional',
    testedChoiceArms:['crispin','muscle-band'],
    registeredAttempts:attempts.length,attempts,
    evidence:{
      bothPhysicalSeatsInBothArms:attempts.length===4&&
        ['crispin','muscle-band'].every(choice=>
          [0,1].every(seat=>attempts.some(x=>
            x.payment===choice&&x.candidateSeat===seat))),
      fullRegistration,seedsMatch,inventoriesMatch,
      identicalPhysicalDealVerified:false,
      nativeTreasurePaymentSearch,nativePhysicalZoneMoves,
      releaseGatePassed:fullRegistration&&nativeTreasurePaymentSearch&&
        nativePhysicalZoneMoves,
      originalDeckAndPrizesVisibleOnlyAsAllowed:true,
      completePaperGames:0,competitiveQualifiedGames:0,
      winRate:null
    },
    limitations:'A native owner-prompt and physical-zone action diagnostic, not a matched physical-deal A/B, complete paper game, win-rate comparison or optimal resource preference.'
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.evidence.releaseGatePassed)process.exitCode=1;
}
module.exports={VERSION,summarize,run};
