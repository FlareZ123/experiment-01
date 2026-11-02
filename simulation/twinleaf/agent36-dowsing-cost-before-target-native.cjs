'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=require('./agent4-rank31-alakazam-movesource-native.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p @returns {any} */
const native=p=>require(path.join(output,p));
const PRINTING='Dowsing Machine PLS';

/**
 * Official Japan Pokémon Q&A for Dowsing Machine explicitly forbids
 * retrieving any card discarded by Dowsing itself or the Dowsing card.
 * This prepared pinned native Store probes the corresponding prohibition
 * with rank26's original Damage Pump as a payment Trainer.
 * @param {0|1} seat Physical native owner position.
 * @returns {object} Source-stamped prompt and physical custody receipts.
 */
function probePaidTrainerAsDowsingTarget(seat){
  assert.ok(seat===0||seat===1);
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  const paidTrainer=f.card('Damage Pump LOR');
  const paidEnergy=f.card('Lightning Energy MEE');
  const machine=f.card(PRINTING);
  const existingTarget=f.card('Battle VIP Pass FST');
  f.source.hand.cards.push(paidTrainer,paidEnergy,machine);
  f.source.discard.cards.push(existingTarget);
  f.store.dispatch(new PlayCardAction(f.source.id,2,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const pending=()=>f.state.prompts.find(p=>p.result===undefined);
  const payment=pending();
  assert.equal(payment?.message,'CHOOSE_CARD_TO_DISCARD');
  assert.equal(payment?.sourceCard?.fullName,PRINTING);
  const selected=[paidTrainer,paidEnergy];
  const nativePaymentValid=payment.validate(selected,f.state);
  f.store.dispatch(new ResolvePromptAction(payment.id,selected));
  const recovery=pending();
  assert.equal(recovery?.message,'CHOOSE_CARD_TO_HAND');
  const recoverySourceIsOwnerDiscard=recovery.cards===f.source.discard;
  const officialPaperForbidsRecoveringPaidTrainer=true;
  const nativeNewTrainerOffered=recovery.cards.cards.includes(paidTrainer);
  const nativeNewTrainerTargetValidator=
    recovery.validate([paidTrainer],f.state);
  const existingTargetOffered=recovery.cards.cards.includes(existingTarget);
  const preRecoveryPhysicalZones={
    paidTrainerInHand:f.source.hand.cards.includes(paidTrainer),
    paidTrainerInDiscard:f.source.discard.cards.includes(paidTrainer),
    paidEnergyInHand:f.source.hand.cards.includes(paidEnergy),
    paidEnergyInDiscard:f.source.discard.cards.includes(paidEnergy)
  };
  f.store.dispatch(new ResolvePromptAction(recovery.id,[existingTarget]));
  return {
    scope:'Prepared genuine pinned Store; no source-60 deal or game',
    originalSourceRank:26,seat,printing:PRINTING,
    paymentSourceStamp:payment.sourceCard?.fullName??null,
    nativePaymentValid,paymentPromptClosed:payment.result!==undefined,
    recoveryPromptFound:Boolean(recovery),
    recoverySourceIsOwnerDiscard,
    officialPaperForbidsRecoveringPaidTrainer,
    nativeNewTrainerOffered,nativeNewTrainerTargetValidator,
    existingTargetOffered,
    preRecoveryPhysicalZones,
    postRecoveryPhysicalZones:{
      paidTrainerInDiscard:f.source.discard.cards.includes(paidTrainer),
      paidEnergyInDiscard:f.source.discard.cards.includes(paidEnergy),
      existingTrainerRecovered:f.source.hand.cards.includes(existingTarget),
      submittedTrainerStillInHand:f.source.hand.cards.includes(paidTrainer)
    },
    competitivelyQualified:false
  };
}
if(require.main===module){
  for(const seat of [0,1])
    console.log('AGENT36_DOWSING_CUSTODY_ORDER '+
      JSON.stringify(probePaidTrainerAsDowsingTarget(seat)));
}
module.exports={PRINTING,probePaidTrainerAsDowsingTarget};
