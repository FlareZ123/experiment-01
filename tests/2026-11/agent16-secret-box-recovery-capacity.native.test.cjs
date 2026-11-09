'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {test} = require('node:test');
const {stagedPainfulSpoons} =
  require('../../simulation/twinleaf/agent4-rank31-alakazam-movesource-native.cjs');
const {withPaperSecretBoxMandatoryPayment} =
  require('../../simulation/twinleaf/agent4-secret-box-paper-payment-hook.cjs');
const {
  planSecretBoxRecoveryCapacityPayment,
  chooseSecretBoxRecoveryCapacityPayment
} = require('../../simulation/twinleaf/agent16-secret-box-recovery-capacity.cjs');

const OUTPUT = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native = name => require(path.join(OUTPUT,name));
const {PlayCardAction, PlayerType, SlotType} =
  native('game/store/actions/play-card-action');
const {ResolvePromptAction} =
  native('game/store/actions/resolve-prompt-action');
const BOX = 'Secret Box TWM';
const VIP = 'Battle VIP Pass FST';
const CARRIER = 'Rescue Carrier EVS';
const LILLIE = "Lillie's Determination M1L";

const POLICY = {
  maxTotalCost:100, defaultCost:20, spentVipCost:0,
  duplicateDiscount:0, spentSupporterDiscount:0,
  powerglassRecoveryPremium:0, recoveryTargetPremium:3,
  costs:{[VIP]:0,[CARRIER]:3,[LILLIE]:5}
};

/** @param {0|1} seat @param {1|4} targetCount */
function stagedPayment(seat,targetCount) {
  const f = stagedPainfulSpoons(seat);
  f.state.turn = 14;
  f.source.supporterTurn = 0;
  const hand = [
    f.card(VIP), f.card(BOX), f.card(VIP), f.card(CARRIER),
    f.card(CARRIER), f.card(LILLIE)
  ];
  f.source.hand.cards.push(...hand);
  for (let i=0;i<targetCount;i++)
    f.source.discard.cards.push(f.card('Unown AOR'));
  const before = planSecretBoxRecoveryCapacityPayment(
    f.source,f.state,POLICY);
  assert.ok(before,'Pre-play recovery capacity gate must find payment');
  const rootIndex = f.source.hand.cards.indexOf(hand[1]);
  f.store.dispatch(new PlayCardAction(f.source.id,rootIndex,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const prompt = f.state.prompts.find(p=>p.result===undefined);
  assert.ok(prompt,'Native Secret Box must request a physical discard');
  assert.equal(prompt.sourceCard?.fullName,BOX);
  assert.equal(prompt.message,'CHOOSE_CARD_TO_DISCARD');
  assert.equal(prompt.options?.min,3);
  assert.equal(prompt.options?.max,3);
  const selected = chooseSecretBoxRecoveryCapacityPayment(
    prompt,f.source,f.state,POLICY);
  assert.ok(selected,'Native owner prompt must yield a paper-payable triple');
  assert.deepEqual(selected.cards.map(c=>c.fullName),
    before.cards.map(c=>c.fullName));
  assert.equal(prompt.validate(selected.cards,f.state),true);
  const priorHand = f.source.hand.cards.slice();
  f.store.dispatch(new ResolvePromptAction(prompt.id,selected.cards));
  const physicalSettlement = selected.cards.every(card=>
    priorHand.includes(card)&&
    !f.source.hand.cards.includes(card)&&
    f.source.discard.cards.includes(card));
  const nextSearch = f.state.prompts.find(p=>
    p.result===undefined && p.sourceCard?.fullName===BOX &&
    p.message==='CHOOSE_CARD_TO_HAND');
  return {
    seat,targetCount,
    selectedPrintings:selected.cards.map(c=>c.fullName),
    selectedIds:selected.cards.map(c=>c.id),
    rootAccepted:true,paymentSettled:prompt.result!==undefined,
    physicalSettlement,searchPending:!!nextSearch,
    recoveryValueLost:selected.recoveryValueLost,
    recoveryValueBefore:selected.recoveryValueBefore,
    recoveryValueAfter:selected.recoveryValueAfter,
    carrierCopiesBefore:selected.carrierCopiesBefore,
    carrierCopiesAfter:selected.carrierCopiesAfter,
    qualifiedGame:false
  };
}

test('one and four eligible recovery targets cause distinct paper-paid Secret Box decisions in both native seats',()=>{
  for (const seat of [0,1]) {
    for (const targetCount of [1,4]) {
      const {result,audit} = withPaperSecretBoxMandatoryPayment(()=>
        stagedPayment(seat,targetCount));
      console.log('AGENT16_RECOVERY_CAPACITY_NATIVE',JSON.stringify({
        result,audit
      }));
      assert.deepEqual(result.selectedPrintings,
        targetCount===1?[VIP,VIP,CARRIER]:[VIP,VIP,LILLIE]);
      assert.equal(new Set(result.selectedIds).size,3);
      assert.equal(result.paymentSettled,true);
      assert.equal(result.physicalSettlement,true);
      assert.equal(result.searchPending,true);
      assert.equal(result.recoveryValueLost,0);
      assert.equal(result.carrierCopiesBefore,2);
      assert.equal(result.carrierCopiesAfter,targetCount===1?1:2);
      assert.equal(result.qualifiedGame,false);
      assert.equal(audit.inspectedPayments,1);
      assert.equal(audit.vetoedPayments,0);
    }
  }
});
