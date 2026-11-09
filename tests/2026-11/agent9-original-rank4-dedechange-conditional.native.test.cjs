'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {planAichi}=require('../../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=require('../../simulation/twinleaf/headless.cjs');
const {withOwnerSetupConfirm}=
  require('../../simulation/twinleaf/agent4-owner-setup-confirm.cjs');
const {withGoFirstChoice}=
  require('../../simulation/twinleaf/agent6-go-first-choice.cjs');
const {withOwnerPublicAcknowledgements}=
  require('../../simulation/twinleaf/agent50-owner-public-acknowledgements.cjs');
const {withOwnerEntryPriorityOpening}=
  require('../../simulation/twinleaf/agent50-owner-entry-priority-single-basic.cjs');
const {withOwnerOpeningStoreReceipt}=
  require('../../simulation/twinleaf/agent50-owner-opening-store-receipt.cjs');
const {withOwnerFirstTurnDedechange}=
  require('../../simulation/twinleaf/agent50-owner-firstturn-dedechange.cjs');
const {withOwnerAbilityConfirmPolicy}=
  require('../../simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs');
const {withOwnerDedechangeReceipt}=
  require('../../simulation/twinleaf/agent9/owner-dedechange-confirm-receipt.cjs');
const {withNativeRawStateFallbackQuarantine}=
  require('../../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const REGISTRATION=
  'results/methodology/registrations/agent9-original-rank4-dedechange-conditional-confirm-aba-20261109.md';
const plan=planAichi(1,{
  allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
assert.equal(plan.engineRevision,PIN);
const source=plan.opponents.find(x=>x.rank===4);
const reference=plan.opponents.find(x=>x.rank===1);
assert.equal(source?.status,'ready');
assert.equal(reference?.status,'ready');
const FROZEN=[
  {seat:0,seed:20261123},
  {seat:1,seed:20261125},
  {seat:1,seed:20261129}
];
const digest=cards=>createHash('sha256')
  .update(JSON.stringify(cards)).digest('hex');

/**
 * Reuse all original Agent50 physical entry decisions; the only paired
 * intervention is the owner Dedechange confirmation answer.
 * @param {{seat:0|1,seed:number}} trial
 * @param {boolean} conditional
 * @returns {object}
 */
function attempt(trial,conditional){
  const {seat,seed}=trial;
  const data={registration:REGISTRATION,seat,seed,
    treatment:conditional?'owner-conservative-confirm':'forced-true-original',
    enginePin:PIN,source60Digest:digest(source.cards),
    reference60Digest:digest(reference.cards),
    qualifiedCompetitiveGames:0};
  let error=null;
  let sourceSetup=null,entry=null,forced=null,policy=null,receipt=null;

  const native=()=>runMatch({
    deckA:seat===0?source.cards:reference.cards,
    deckB:seat===1?source.cards:reference.cards,
    seed,maxActions:80,captureNativeAbortEvidence:true
  });
  const observed=()=>{
    const r=withOwnerDedechangeReceipt(native);
    receipt=r.audit;return r.result;
  };
  const ability=()=>{
    if(!conditional)return observed();
    const r=withOwnerAbilityConfirmPolicy(observed,{enableDedechange:true});
    policy=r.audit;return r.result;
  };
  const printedEntry=()=>{
    const r=withOwnerFirstTurnDedechange(ability,{sourceSeat:seat});
    forced=r.audit;return r.result;
  };
  const openingReceipt=()=>{
    const r=withOwnerOpeningStoreReceipt(printedEntry,{sourceSeat:seat});
    sourceSetup=r.audit;return r.result;
  };
  const root=()=>withOwnerSetupConfirm(()=>
    withGoFirstChoice(seat===0?[true,false]:[false,true],()=>
      withOwnerPublicAcknowledgements(()=>
        withOwnerEntryPriorityOpening(openingReceipt)
      )
    )
  );
  try{
    withNativeRawStateFallbackQuarantine(root,{maxRecords:8});
  }catch(e){
    error=e;
    sourceSetup??=e.ownerOpeningStoreReceiptAudit??null;
    forced??=e.agent50FirstTurnDedechangeAudit??null;
    policy??=e.ownerAbilityConfirmAudit??null;
    receipt??=e.agent9DedechangeReceipt??null;
  }
  data.firstSetup=sourceSetup?.events?.[0]??null;
  data.placement=forced?.rootEvents?.find(e=>e.availableDedenne)??null;
  data.firstOwnerConfirm=receipt?.events?.[0]??null;
  data.ownerConfirmDecision=policy?.confirmEvents?.[0]??null;
  data.errorCode=error?.code??null;
  data.errorMessage=error?String(error.message??error).slice(0,200):null;
  data.nativeAcceptedPhysicalDedenne=forced?.nativePlayedDedenne??0;
  data.ownerOnlyReceipt=receipt?.ownerOnly??null;
  data.nativeOwnerConfirmEvents=receipt?.events?.length??0;
  data.nativeDecisionCount=policy?.confirmSettled??0;
  return data;
}

test('same original-rank4 physical entry, forced draw versus owner resource conservation',()=>{
  const pairs=FROZEN.map(trial=>{
    const control=attempt(trial,false);
    const treatment=attempt(trial,true);
    return {seat:trial.seat,seed:trial.seed,control,treatment};
  });
  for(const pair of pairs){
    const {control,treatment}=pair;
    console.log('AGENT9_ORIGINAL_RANK4_DIAGNOSTIC',JSON.stringify({
      seat:pair.seat,seed:pair.seed,
      control:{error:control.errorCode,message:control.errorMessage,
        opening:control.firstSetup?.preOwnerHandSha256??null,
        played:control.nativeAcceptedPhysicalDedenne,
        receipt:control.firstOwnerConfirm??null},
      treatment:{error:treatment.errorCode,message:treatment.errorMessage,
        opening:treatment.firstSetup?.preOwnerHandSha256??null,
        played:treatment.nativeAcceptedPhysicalDedenne,
        placement:treatment.placement,
        receipts:treatment.nativeOwnerConfirmEvents,
        chosen:treatment.ownerConfirmDecision??null}
    }));
    assert.equal(control.source60Digest,treatment.source60Digest);
    assert.equal(control.reference60Digest,treatment.reference60Digest);
    assert.ok(control.firstSetup?.preOwnerHandSha256,
      'Control never reached actual source original starting-hand choice');
    assert.equal(control.firstSetup.preOwnerHandSha256,
      treatment.firstSetup?.preOwnerHandSha256,
      'Different original physical source opening cards in same deal');
    assert.equal(control.firstSetup.mandatoryInitialPlacementCompleted,true);
    assert.equal(treatment.firstSetup.mandatoryInitialPlacementCompleted,true);
    assert.equal(control.nativeAcceptedPhysicalDedenne,1);
    assert.equal(treatment.nativeAcceptedPhysicalDedenne,1);
    assert.equal(control.placement?.nativeAccepted,true);
    assert.equal(treatment.placement?.nativeAccepted,true);
    assert.equal(control.nativeOwnerConfirmEvents,1);
    assert.equal(treatment.nativeOwnerConfirmEvents,1);
    assert.equal(control.firstOwnerConfirm.promptNativeSettled,true);
    assert.equal(treatment.firstOwnerConfirm.promptNativeSettled,true);
    assert.equal(control.firstOwnerConfirm.answer,true);
    assert.equal(treatment.firstOwnerConfirm.answer,false);
    assert.equal(control.firstOwnerConfirm.nativePaymentConserved,true);
    assert.equal(treatment.firstOwnerConfirm.nativePaymentConserved,true);
    assert.equal(control.firstOwnerConfirm.deckDelta,6);
    assert.equal(treatment.firstOwnerConfirm.deckDelta,0);
    assert.equal(treatment.firstOwnerConfirm.originalRetainedPrintings.length,
      treatment.firstOwnerConfirm.originalHandCount);
    assert.equal(control.firstOwnerConfirm.originalRetainedPrintings.length,0);
    assert.equal(treatment.nativeDecisionCount,1);
    assert.ok(treatment.ownerConfirmDecision?.reason===
      'hand-discard-cost-unassessed'||
      treatment.ownerConfirmDecision?.reason==='protected-resource-in-hand');
    assert.equal(control.qualifiedCompetitiveGames,0);
    assert.equal(treatment.qualifiedCompetitiveGames,0);
    console.log('AGENT9_ORIGINAL_RANK4_DEDECHANGE_PAIR',JSON.stringify({
      seat:pair.seat,seed:pair.seed,
      originalSourceHandSha:control.firstSetup.preOwnerHandSha256,
      originalHandCost:control.firstOwnerConfirm.originalHandCount,
      forcedOwnerDiscard:control.firstOwnerConfirm.originalDiscardedPrintings,
      forcedOwnerLostZone:control.firstOwnerConfirm.originalLostZonePrintings,
      preservedHand:treatment.firstOwnerConfirm.originalRetainedPrintings,
      conditionalReason:treatment.ownerConfirmDecision?.reason,
      forcedDraw:control.firstOwnerConfirm.deckDelta,
      treatmentDraw:treatment.firstOwnerConfirm.deckDelta,
      competitorStatus:'zero-qualified-competitive-games'
    }));
  }
  assert.equal(pairs.length,3);
});

module.exports={FROZEN,attempt};
