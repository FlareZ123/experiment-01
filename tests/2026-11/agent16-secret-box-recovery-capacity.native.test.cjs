'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {test} = require('node:test');
const {stagedPainfulSpoons} =
  require('../../simulation/twinleaf/agent4-rank31-alakazam-movesource-native.cjs');
const {withPaperSecretBoxMandatoryPayment} =
  require('../../simulation/twinleaf/agent4-secret-box-paper-payment-hook.cjs');
const {withPaperSecretBoxSearchCategory} =
  require('../../simulation/twinleaf/agent4-secret-box-paper-search-hook.cjs');
const {chooseSecretBoxCategories,ROOT93_NEW_MOON_PREFERENCES} =
  require('../../simulation/twinleaf/agent36-secret-box-four-category-selector.cjs');
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
const {TrainerCard} = native('game/store/card/trainer-card');
const {TrainerType} = native('game/store/card/card-types');
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
  const categoryCards = ['Fog Crystal CRE','Powerglass SFA',
    'Ace Trainer AOR','Sky Field ROS'].map(name=>f.card(name));
  f.source.deck.cards.push(...categoryCards);
  // New Moon's fixed sixty has three Unown AOR and two Duskull VIV.
  // The four-target fixture therefore uses three Unown plus one Duskull,
  // avoiding a staged fourth Unown copy absent from the deck.
  const targetPrintings=targetCount===1?['Unown AOR']:
    ['Unown AOR','Unown AOR','Unown AOR','Duskull VIV'];
  const recoveryTargets=targetPrintings.map(printing=>f.card(printing));
  f.source.discard.cards.push(...recoveryTargets);
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
  assert.ok(nextSearch,'Secret Box owner four-category search must be pending');
  const categories=chooseSecretBoxCategories(nextSearch,f.source,f.state,
    {TrainerCard,TrainerType},ROOT93_NEW_MOON_PREFERENCES);
  assert.deepEqual(categories?.map(c=>c.fullName),[
    'Fog Crystal CRE','Powerglass SFA',
    'Ace Trainer AOR','Sky Field ROS'
  ]);
  assert.equal(nextSearch.validate(categories,f.state),true);
  f.store.dispatch(new ResolvePromptAction(nextSearch.id,categories));
  const pending=()=>f.state.prompts.find(p=>p.result===undefined);
  for(let i=0;i<15&&pending();i++){
    const p=pending();
    const reply=p.constructor.name==='ShowCardsPrompt'?true:
      p.constructor.name==='ShuffleDeckPrompt'?
        Array.from({length:f.source.deck.cards.length},(_,index)=>index):
        p.constructor.name==='WaitPrompt'?null:undefined;
    assert.ok(reply!==undefined,'Unexpected follow-through prompt '+p.constructor.name);
    f.store.dispatch(new ResolvePromptAction(p.id,reply));
  }
  assert.equal(pending(),undefined);
  const categoryPhysicalSettlement=categories.every(c=>
    f.source.hand.cards.includes(c)&&!f.source.deck.cards.includes(c));
  // Complete the follow-on Item line that motivated preserving Carriers.
  // Actual Rescue Carrier must return the selected, printed <=90HP Pokémon
  // from discard to hand through the real pinned Store, not a synthetic count.
  const recovered=[];
  for(let i=0;i<selected.carrierCopiesAfter;i++){
    const carrier=f.source.hand.cards.find(c=>c.fullName===CARRIER);
    assert.ok(carrier,'Planned Carrier must remain physically in hand');
    f.store.dispatch(new PlayCardAction(f.source.id,
      f.source.hand.cards.indexOf(carrier),{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
    const take=pending();
    assert.equal(take?.sourceCard?.fullName,CARRIER);
    assert.equal(take.message,'CHOOSE_CARD_TO_HAND');
    const selectedTargets=recoveryTargets.filter(c=>
      f.source.discard.cards.includes(c)).slice(0,2);
    assert.ok(selectedTargets.length>0);
    assert.equal(take.validate(selectedTargets,f.state),true);
    f.store.dispatch(new ResolvePromptAction(take.id,selectedTargets));
    recovered.push(...selectedTargets);
    for(let j=0;j<15&&pending();j++){
      const p=pending();
      const reply=p.constructor.name==='ShowCardsPrompt'?true:
        p.constructor.name==='ShuffleDeckPrompt'?
          Array.from({length:f.source.deck.cards.length},(_,index)=>index):
          p.constructor.name==='WaitPrompt'?null:undefined;
      assert.ok(reply!==undefined,
        'Unexpected Carrier continuation prompt '+p.constructor.name);
      f.store.dispatch(new ResolvePromptAction(p.id,reply));
    }
    assert.equal(pending(),undefined);
  }
  const recoveryPhysicallySettled=recoveryTargets.every(c=>
    recovered.includes(c)&&f.source.hand.cards.includes(c)&&
    !f.source.discard.cards.includes(c));
  return {
    seat,targetCount,
    selectedPrintings:selected.cards.map(c=>c.fullName),
    selectedIds:selected.cards.map(c=>c.id),
    rootAccepted:true,paymentSettled:prompt.result!==undefined,
    physicalSettlement,searchPending:!!nextSearch,
    categoriesFetched:categories.map(c=>c.fullName),
    categoryPhysicalSettlement,
    categoryCount:categories.length,
    recoveryTargets:targetPrintings,
    actualRecoveredCopies:recovered.length,
    recoveryPhysicallySettled,
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
      const outer = withPaperSecretBoxMandatoryPayment(()=>
        withPaperSecretBoxSearchCategory(()=>stagedPayment(seat,targetCount)));
      const {result,audit:searchAudit}=outer.result;
      const paymentAudit=outer.audit;
      console.log('AGENT16_RECOVERY_CAPACITY_NATIVE',JSON.stringify({
        result,paymentAudit,searchAudit
      }));
      assert.deepEqual(result.selectedPrintings,
        targetCount===1?[VIP,VIP,CARRIER]:[VIP,VIP,LILLIE]);
      assert.equal(new Set(result.selectedIds).size,3);
      assert.equal(result.paymentSettled,true);
      assert.equal(result.physicalSettlement,true);
      assert.equal(result.searchPending,true);
      assert.equal(result.categoryCount,4);
      assert.deepEqual(result.categoriesFetched,[
        'Fog Crystal CRE','Powerglass SFA','Ace Trainer AOR','Sky Field ROS'
      ]);
      assert.equal(result.categoryPhysicalSettlement,true);
      assert.equal(result.actualRecoveredCopies,targetCount);
      assert.equal(result.recoveryPhysicallySettled,true);
      assert.equal(result.recoveryTargets.filter(p=>p==='Unown AOR').length,
        targetCount===1?1:3);
      assert.equal(result.recoveryValueLost,0);
      assert.equal(result.carrierCopiesBefore,2);
      assert.equal(result.carrierCopiesAfter,targetCount===1?1:2);
      assert.equal(result.qualifiedGame,false);
      assert.equal(paymentAudit.inspectedPayments,1);
      assert.equal(paymentAudit.vetoedPayments,0);
      assert.equal(searchAudit.sourceSearchPrompts,1);
      assert.equal(searchAudit.acceptedSearches,1);
      assert.equal(searchAudit.vetoedSearches,0);
    }
  }
});
