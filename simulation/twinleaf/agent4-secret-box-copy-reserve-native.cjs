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
 * Secret Box prompt. The frontier itself supplies no strategic weights.
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

  const prePlayHand=[
    f.card(VIP),f.card(BOX),f.card(CARRIER),f.card(VIP),f.card(CARRIER),
    f.card(LILLIE),f.card(LILLIE),f.card(POWERGLASS),
    f.card('Forest Seal Stone SIT'),f.card('Mysterious Treasure FLI')
  ];
  f.source.hand.cards.push(...prePlayHand);
  const recoveryTarget=f.card('Unown AOR');
  const psychicA=f.card('Psychic Energy MEE');
  const psychicB=f.card('Psychic Energy MEE');
  f.source.discard.cards.push(recoveryTarget,psychicA,psychicB);

  const boxIndex=prePlayHand.findIndex(card=>card.fullName===BOX);
  const adapter=ownerHandDiscardWithCopyReserves({
    handPrintings:prePlayHand.map(card=>card.fullName),
    sourceIndex:boxIndex,
    cost:3,
    hardMinimumCopiesByPrinting:{[CARRIER]:1},
    softAdditionalCopiesByPrinting:{[LILLIE]:1},
    deadPrintings:[VIP],
    nextHandDiscardCost:2
  });

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
  const expectedOffered=prePlayHand.filter((_,index)=>index!==boxIndex);
  assert.equal(prompt.cards.cards.length,expectedOffered.length);
  assert.ok(expectedOffered.every(card=>prompt.cards.cards.includes(card)),
    'Native payment prompt must expose the same physical hand objects');

  const desired=candidate==='carrier'?
    {printings:[VIP,VIP,CARRIER],protectedSacrificed:0,ways:'6'}:
    {printings:[VIP,VIP,LILLIE],protectedSacrificed:1,ways:'10'};
  const group=adapter.frontier.structurallyUndominatedPaymentGroups.find(row=>
    row.representativePaymentPrintings.join('|')===desired.printings.join('|')&&
    row.vector.protectedSacrificed===desired.protectedSacrificed&&
    row.vector.nextUnprotectedPaymentWays===desired.ways);
  assert.ok(group,'Expected requested nondominated copy-reserve payment group');

  const selected=group.representativePaymentIndices.map(index=>
    prePlayHand[index]);
  assert.ok(selected.every(card=>prompt.cards.cards.includes(card)));
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
      offeredCount:prompt.cards.cards.length
    },
    adapter:{
      version:adapter.version,
      hardReservedIndices:adapter.hardReservedIndices,
      softProtectedIndices:adapter.softProtectedIndices,
      hardRequirementsSatisfied:adapter.hardRequirementsSatisfied,
      softPreferenceCapacityAvailable:adapter.softPreferenceCapacityAvailable,
      representativePaymentIndices:group.representativePaymentIndices,
      representativePaymentPrintings:group.representativePaymentPrintings,
      equivalentPhysicalPayments:group.equivalentPhysicalPayments,
      vector:group.vector
    },
    selectedPrintings:selected.map(card=>card.fullName),
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
