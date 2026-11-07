'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const {withPaperSecretBoxMandatoryPayment}=
  require('./agent4-secret-box-paper-payment-hook.cjs');
const {
  BOX,VIP,CARRIER,LILLIE,POWERGLASS,NEW_MOON_DCI_POLICY,
  chooseSecretBoxPaymentByDci,secretBoxDiscardCost
}=require('./agent21-secret-box-dci-payment.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Execute the Agent21 DCI payment selector against a genuine pinned Twinleaf
 * Secret Box payment prompt. The fixture is staged and is not a full game.
 * @param {0|1} seat Physical owner seat.
 * @returns {object} Native prompt, payment, physical movement and policy audit.
 */
function executeSecretBoxDciPayment(seat){
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
  f.source.hand.cards.push(vipA,box,carrierA,vipB,carrierB,
    lillieA,lillieB,powerglass,forestSeal,treasure);

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
  const plan=chooseSecretBoxPaymentByDci(prompt,f.source,f.state);
  assert.ok(plan,'Expected owner-visible DCI selector to return a legal payment');
  const nativeValidatorAccepted=prompt.validate(plan.cards,f.state)===true;
  const selected=plan.cards.slice();
  const selectedPromptIndices=selected.map(card=>prompt.cards.cards.indexOf(card));
  const beforeHand=f.source.hand.cards.slice();
  const beforeDiscard=f.source.discard.cards.slice();
  let paymentError=null;
  try{
    f.store.dispatch(new ResolvePromptAction(prompt.id,selected));
  }catch(error){
    paymentError=String(error?.message??error);
  }

  const remaining=f.source.hand.cards;
  const carrier=remaining.find(card=>card.fullName===CARRIER);
  const remainingSearch=f.state.prompts.find(p=>
    p.result===undefined&&p.sourceCard?.fullName===BOX&&
    p.message==='CHOOSE_CARD_TO_HAND');
  return {
    seat,turn:f.state.turn,rootError,
    prompt:{
      type:prompt.constructor.name,source:prompt.sourceCard?.fullName??null,
      ownerId:prompt.playerId,message:prompt.message,
      min:prompt.options?.min??null,max:prompt.options?.max??null,
      offeredCount:prompt.cards?.cards?.length??null
    },
    plan:{
      version:plan.version,totalCost:plan.totalCost,
      cardCosts:plan.cardCosts,
      selectedPrintings:selected.map(card=>card.fullName)
    },
    nativeValidatorAccepted,paymentError,
    selectedPromptIndices,
    selectedPhysicalIds:selected.map(card=>card.id),
    paymentSettled:prompt.result!==undefined,
    physicalPaymentSettled:selected.every(card=>
      beforeHand.includes(card)&&
      !f.source.hand.cards.includes(card)&&
      f.source.discard.cards.includes(card)),
    discardedVipCopies:selected.filter(card=>card.fullName===VIP).length,
    discardedLillieCopies:selected.filter(card=>card.fullName===LILLIE).length,
    discardedCarrierCopies:selected.filter(card=>card.fullName===CARRIER).length,
    remainingVipCopies:remaining.filter(card=>card.fullName===VIP).length,
    remainingLillieCopies:remaining.filter(card=>card.fullName===LILLIE).length,
    remainingCarrierCopies:remaining.filter(card=>card.fullName===CARRIER).length,
    remainingPowerglass:remaining.includes(powerglass),
    remainingForestSealStone:remaining.includes(forestSeal),
    remainingMysteriousTreasure:remaining.includes(treasure),
    recoveryTargetHp:recoveryTarget.hp,
    carrierDiscardCost:carrier?
      secretBoxDiscardCost(carrier,f.source,f.state,NEW_MOON_DCI_POLICY).cost:null,
    powerglassDiscardCost:secretBoxDiscardCost(
      powerglass,f.source,f.state,NEW_MOON_DCI_POLICY).cost,
    psychicDiscardCopies:f.source.discard.cards.filter(card=>
      card.fullName===psychicA.fullName).length,
    secretBoxSearchPending:!!remainingSearch,
    pendingPromptTypes:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    preexistingDiscardPreserved:beforeDiscard.every(card=>
      f.source.discard.cards.includes(card)),
    qualifiedGame:false
  };
}

/**
 * Run the staged native probe with the reversible Agent4 paper payment guard.
 * @param {0|1} seat Physical owner seat.
 * @returns {{result:object,audit:object}}
 */
function probeSecretBoxDciPayment(seat=0){
  assert.ok(seat===0||seat===1);
  return withPaperSecretBoxMandatoryPayment(()=>
    executeSecretBoxDciPayment(seat));
}

module.exports={probeSecretBoxDciPayment};
