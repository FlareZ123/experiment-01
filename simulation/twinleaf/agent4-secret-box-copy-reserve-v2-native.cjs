'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const {withPaperSecretBoxMandatoryPayment}=
  require('./agent4-secret-box-paper-payment-hook.cjs');
const {ownerHandDiscardCopyReserveFrontier}=
  require('./planning/owner-hand-discard-copy-reserve-frontier.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const BOX='Secret Box TWM';
const VIP='Battle VIP Pass FST';
const CARRIER='Rescue Carrier EVS';
const LILLIE="Lillie's Determination M1L";
const POWERGLASS='Powerglass SFA';

/**
 * Validate a count-based copy-reserve frontier representative on a genuine
 * post-play Secret Box prompt. Returned payment indices address prompt.cards.
 * @param {0|1} seat Physical owner seat.
 * @param {'carrier'|'lillie'} candidate Nondominated payment representative.
 * @returns {object} Native validation, physical movement, count frontier, guard.
 */
function executeCopyReserveV2Payment(seat,candidate){
  const native=name=>require(path.join(OUTPUT,name));
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  f.state.turn=14;
  f.source.supporterTurn=0;

  const vipA=f.card(VIP);
  const box=f.card(BOX);
  const carrierA=f.card(CARRIER);
  const vipB=f.card(VIP);
  const carrierB=f.card(CARRIER);
  const lillieA=f.card(LILLIE);
  const lillieB=f.card(LILLIE);
  const powerglass=f.card(POWERGLASS);
  const forestSeal=f.card('Forest Seal Stone SIT');
  const treasure=f.card('Mysterious Treasure FLI');
  f.source.hand.cards.push(
    vipA,box,carrierA,vipB,carrierB,lillieA,lillieB,
    powerglass,forestSeal,treasure
  );

  const recoveryTarget=f.card('Unown AOR');
  const psychicA=f.card('Psychic Energy MEE');
  const psychicB=f.card('Psychic Energy MEE');
  f.source.discard.cards.push(recoveryTarget,psychicA,psychicB);

  const boxIndex=f.source.hand.cards.indexOf(box);
  let rootError=null;
  try{
    f.store.dispatch(new PlayCardAction(f.source.id,boxIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  }catch(error){
    rootError=String(error?.message??error);
  }

  const prompt=f.state.prompts.find(p=>p.result===undefined);
  assert.ok(prompt,'Expected genuine Secret Box payment prompt');
  const promptCards=prompt.cards.cards;
  assert.equal(promptCards.length,9);
  assert.ok(!promptCards.some(card=>card.fullName===BOX));

  const adapter=ownerHandDiscardCopyReserveFrontier({
    handPrintings:promptCards.map(card=>card.fullName),
    sourceIndex:null,
    cost:3,
    hardMinimumCopiesByPrinting:{[CARRIER]:1},
    softAdditionalCopiesByPrinting:{[LILLIE]:1},
    deadPrintings:[VIP],
    nextHandDiscardCost:2
  });

  const desired=candidate==='carrier'?
    {printings:[VIP,VIP,CARRIER],equivalent:1}:
    {printings:[VIP,VIP,LILLIE],equivalent:2};
  const group=adapter.structurallyUndominatedPaymentGroups.find(row=>
    row.representativePaymentPrintings.join('|')===desired.printings.join('|')&&
    row.vector.protectedSacrificed===0&&
    row.vector.nextUnprotectedPaymentWays==='6');
  assert.ok(group,'Expected count-based nondominated payment group');

  const selectedPromptIndices=group.representativePaymentIndices.slice();
  const selected=selectedPromptIndices.map(index=>promptCards[index]);
  const hardReservedCards=adapter.hardReservedIndices.map(index=>({
    promptIndex:index,physicalId:promptCards[index].id,
    printing:promptCards[index].fullName
  }));
  const nativeValidatorAccepted=prompt.validate(selected,f.state)===true;
  const beforeHand=f.source.hand.cards.slice();
  const beforeDiscard=f.source.discard.cards.slice();
  let paymentError=null;
  try{
    f.store.dispatch(new ResolvePromptAction(prompt.id,selected));
  }catch(error){
    paymentError=String(error?.message??error);
  }

  const remaining=f.source.hand.cards;
  const remainingSearch=f.state.prompts.find(p=>
    p.result===undefined&&p.sourceCard?.fullName===BOX&&
    p.message==='CHOOSE_CARD_TO_HAND');
  return {
    seat,candidate,turn:f.state.turn,rootError,
    prompt:{
      type:prompt.constructor.name,source:prompt.sourceCard?.fullName??null,
      ownerId:prompt.playerId,message:prompt.message,
      min:prompt.options?.min??null,max:prompt.options?.max??null,
      offeredCount:promptCards.length
    },
    adapter:{
      version:adapter.version,
      frontierIdentityScope:adapter.frontierIdentityScope,
      softReserveCopyInvariant:adapter.softReserveCopyInvariant,
      softReserveCountSemantics:adapter.softReserveCountSemantics,
      sourceIndex:adapter.sourceIndex,
      sourceCardPresentInHand:adapter.sourceCardPresentInHand,
      sourcePrinting:adapter.sourcePrinting,
      handLength:adapter.handLength,
      hardReservedIndices:adapter.hardReservedIndices,
      hardReservedCards,
      hardMinimumCopiesByPrinting:adapter.hardMinimumCopiesByPrinting,
      softAdditionalCopiesByPrinting:adapter.softAdditionalCopiesByPrinting,
      reserveRows:adapter.reserveRows,
      hardRequirementsSatisfied:adapter.hardRequirementsSatisfied,
      softPreferenceCapacityAvailable:adapter.softPreferenceCapacityAvailable,
      possibleFirstPaymentCount:adapter.possibleFirstPaymentCount,
      paymentScoreGroups:adapter.paymentScoreGroups,
      paymentScoreGroupPhysicalPayments:adapter.paymentScoreGroupPhysicalPayments,
      frontierPhysicalPaymentCount:adapter.frontierPhysicalPaymentCount,
      representativePaymentIndices:selectedPromptIndices,
      representativePaymentPrintings:group.representativePaymentPrintings,
      equivalentPhysicalPayments:group.equivalentPhysicalPayments,
      vector:group.vector,
      paperCardPlayabilityCertified:adapter.paperCardPlayabilityCertified,
      downstreamTargetAccessCertified:adapter.downstreamTargetAccessCertified,
      strategicOptimalityCertified:adapter.strategicOptimalityCertified
    },
    selectedCards:selected.map((card,index)=>({
      promptIndex:selectedPromptIndices[index],
      physicalId:card.id,printing:card.fullName
    })),
    selectedPrintings:selected.map(card=>card.fullName),
    selectedPhysicalIds:selected.map(card=>card.id),
    selectedPhysicalUniqueCount:new Set(selected).size,
    nativeValidatorAccepted,paymentError,
    paymentSettled:prompt.result!==undefined,
    physicalPaymentSettled:selected.every(card=>
      beforeHand.includes(card)&&
      !f.source.hand.cards.includes(card)&&
      f.source.discard.cards.includes(card)),
    discardedCarrierCopies:selected.filter(card=>card.fullName===CARRIER).length,
    discardedLillieCopies:selected.filter(card=>card.fullName===LILLIE).length,
    remainingVipCopies:remaining.filter(card=>card.fullName===VIP).length,
    remainingCarrierCopies:remaining.filter(card=>card.fullName===CARRIER).length,
    remainingLillieCopies:remaining.filter(card=>card.fullName===LILLIE).length,
    remainingPowerglass:remaining.some(card=>card.fullName===POWERGLASS),
    remainingForestSealStone:remaining.some(card=>
      card.fullName==='Forest Seal Stone SIT'),
    remainingMysteriousTreasure:remaining.some(card=>
      card.fullName==='Mysterious Treasure FLI'),
    recoveryTargetHp:recoveryTarget.hp,
    secretBoxSearchPending:!!remainingSearch,
    preexistingDiscardPreserved:beforeDiscard.every(card=>
      f.source.discard.cards.includes(card)),
    qualifiedGame:false
  };
}

/**
 * Run one candidate with the reversible Agent4 paper-payment guard.
 * @param {0|1} seat Physical owner seat.
 * @param {'carrier'|'lillie'} candidate Nondominated payment representative.
 * @returns {{result:object,audit:object}}
 */
function probeSecretBoxCopyReserveV2Payment(seat,candidate){
  assert.ok(seat===0||seat===1);
  assert.ok(candidate==='carrier'||candidate==='lillie');
  return withPaperSecretBoxMandatoryPayment(()=>
    executeCopyReserveV2Payment(seat,candidate));
}

module.exports={probeSecretBoxCopyReserveV2Payment};
