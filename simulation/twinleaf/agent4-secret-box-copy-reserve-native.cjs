'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const {withPaperSecretBoxMandatoryPayment}=
  require('./agent4-secret-box-paper-payment-hook.cjs');
const {ownerHandDiscardWithCopyReserves}=
  require('./planning/owner-hand-discard-reserve.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const BOX='Secret Box TWM';
const VIP='Battle VIP Pass FST';
const CARRIER='Rescue Carrier EVS';
const LILLIE="Lillie's Determination M1L";
const POWERGLASS='Powerglass SFA';

/**
 * Validate a representative copy-reserve frontier payment on a real native
 * Secret Box prompt. The adapter consumes the exact post-play prompt hand.
 * @param {0|1} seat Physical owner seat.
 * @param {'carrier'|'lillie'} candidate Nondominated payment representative.
 * @returns {object} Native validation, physical movement, frontier and guard.
 */
function executeCopyReservePayment(seat,candidate){
  const native=name=>require(path.join(OUTPUT,name));
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  f.state.turn=14;
  f.source.supporterTurn=0;

  const box=f.card(BOX);
  f.source.hand.cards.push(
    f.card(VIP),box,f.card(CARRIER),f.card(VIP),f.card(CARRIER),
    f.card(LILLIE),f.card(LILLIE),f.card(POWERGLASS),
    f.card('Forest Seal Stone SIT'),f.card('Mysterious Treasure FLI')
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
  assert.ok(!promptCards.some(card=>card.fullName===BOX),
    'The source Secret Box must already be outside the payment hand');

  // Agent16's current adapter accepts sourceIndex:null when the source has
  // already left the hand. Its returned indices now address promptCards
  // directly, without reconstructing the pre-play hand.
  const adapter=ownerHandDiscardWithCopyReserves({
    handPrintings:promptCards.map(card=>card.fullName),
    sourceIndex:null,
    cost:3,
    hardMinimumCopiesByPrinting:{[CARRIER]:1},
    softAdditionalCopiesByPrinting:{[LILLIE]:1},
    deadPrintings:[VIP],
    nextHandDiscardCost:2
  });

  const desired=candidate==='carrier'?
    {printings:[VIP,VIP,CARRIER],protectedSacrificed:0,ways:'6'}:
    {printings:[VIP,VIP,LILLIE],protectedSacrificed:1,ways:'10'};
  const group=adapter.frontier.structurallyUndominatedPaymentGroups.find(row=>
    row.representativePaymentPrintings.join('|')===desired.printings.join('|')&&
    row.vector.protectedSacrificed===desired.protectedSacrificed&&
    row.vector.nextUnprotectedPaymentWays===desired.ways);
  assert.ok(group,'Expected requested nondominated copy-reserve payment group');

  const selectedPromptIndices=group.representativePaymentIndices.slice();
  const selected=selectedPromptIndices.map(index=>promptCards[index]);
  const hardReservedCards=adapter.hardReservedIndices.map(index=>({
    promptIndex:index,physicalId:promptCards[index].id,
    printing:promptCards[index].fullName
  }));
  const softProtectedCards=adapter.softProtectedIndices.map(index=>({
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
      sourceIndex:adapter.sourceIndex,
      sourceCardPresentInHand:adapter.sourceCardPresentInHand,
      sourcePrinting:adapter.sourcePrinting,
      handLength:adapter.frontier.handLength,
      possibleFirstPaymentCount:adapter.frontier.possibleFirstPaymentCount,
      hardReservedIndices:adapter.hardReservedIndices,
      softProtectedIndices:adapter.softProtectedIndices,
      hardReservedCards,softProtectedCards,
      hardRequirementsSatisfied:adapter.hardRequirementsSatisfied,
      softPreferenceCapacityAvailable:adapter.softPreferenceCapacityAvailable,
      representativePaymentIndices:selectedPromptIndices,
      representativePaymentPrintings:group.representativePaymentPrintings,
      equivalentPhysicalPayments:group.equivalentPhysicalPayments,
      vector:group.vector
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
function probeSecretBoxCopyReservePayment(seat,candidate){
  assert.ok(seat===0||seat===1);
  assert.ok(candidate==='carrier'||candidate==='lillie');
  return withPaperSecretBoxMandatoryPayment(()=>
    executeCopyReservePayment(seat,candidate));
}

module.exports={probeSecretBoxCopyReservePayment};
