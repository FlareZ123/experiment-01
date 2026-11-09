'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {test}=require('node:test');
const {stagedPainfulSpoons}=
  require('../../simulation/twinleaf/agent4-rank31-alakazam-movesource-native.cjs');
const {withPaperSecretBoxMandatoryPayment}=
  require('../../simulation/twinleaf/agent4-secret-box-paper-payment-hook.cjs');
const {withPaperSecretBoxSearchCategory}=
  require('../../simulation/twinleaf/agent4-secret-box-paper-search-hook.cjs');
const {withOwnerSecretBoxCapacityActorPrompt}=
  require('../../simulation/twinleaf/agent16-secret-box-capacity-actor-prompt.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));
const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {ResolvePromptAction}=
  native('game/store/actions/resolve-prompt-action');
const BOX='Secret Box TWM';
const VIP='Battle VIP Pass FST';
const CARRIER='Rescue Carrier EVS';
const LILLIE="Lillie's Determination M1L";
const CATEGORIES=[
  'Fog Crystal CRE','Powerglass SFA','Ace Trainer AOR','Sky Field ROS'
];
const POLICY={maxTotalCost:100,defaultCost:20,spentVipCost:0,
  duplicateDiscount:0,spentSupporterDiscount:0,
  powerglassRecoveryPremium:0,recoveryTargetPremium:3,
  costs:{[VIP]:0,[CARRIER]:3,[LILLIE]:5}};

/** @param {0|1} seat @param {1|2|4} count @param {1|2} [carrierCopies=2] @param {boolean} [autoRoot=false] @param {boolean} [autoCarrier=false] */
function actorFixture(seat,count,carrierCopies=2,autoRoot=false,autoCarrier=false){
  const f=stagedPainfulSpoons(seat);
  f.state.turn=14;
  f.source.supporterTurn=0;
  const box=f.card(BOX);
  f.source.hand.cards.push(
    f.card(VIP),box,f.card(VIP),f.card(CARRIER),
    ...(carrierCopies===2?[f.card(CARRIER)]:[]),f.card(LILLIE));
  const targets=(count===1?['Unown AOR']:count===2?
    ['Unown AOR','Unown AOR']:
    ['Unown AOR','Unown AOR','Unown AOR','Duskull VIV'])
    .map(name=>f.card(name));
  f.source.discard.cards.push(...targets);
  const searchCards=CATEGORIES.map(name=>f.card(name));
  f.source.deck.cards.push(...searchCards);
  const policy=carrierCopies===1?
    {...POLICY,costs:{...POLICY.costs,[LILLIE]:7}}:POLICY;
  const bot=Object.create(SimpleTacticsAi.prototype);
  bot.client={id:f.source.id};

  const outer=withPaperSecretBoxMandatoryPayment(()=>
    withPaperSecretBoxSearchCategory(()=>
      withOwnerSecretBoxCapacityActorPrompt(()=>{
        const boxPlay=autoRoot?bot.decodeNextAction(f.state):
          new PlayCardAction(f.source.id,f.source.hand.cards.indexOf(box),{
            player:PlayerType.ANY,slot:SlotType.BOARD,index:0
          });
        assert.equal(boxPlay.constructor.name,'PlayCardAction');
        assert.equal(f.source.hand.cards[boxPlay.handIndex],box);
        f.store.dispatch(boxPlay);
        const paymentAction=bot.decodeNextAction(f.state);
        assert.equal(paymentAction.constructor.name,'ResolvePromptAction');
        assert.equal(paymentAction.result.length,3);
        const payment=paymentAction.result.slice();
        f.store.dispatch(paymentAction);
        const searchAction=bot.decodeNextAction(f.state);
        assert.equal(searchAction.constructor.name,'ResolvePromptAction');
        assert.equal(searchAction.result.length,4);
        const selection=searchAction.result.slice();
        f.store.dispatch(searchAction);

        const pending=()=>f.state.prompts.find(p=>p.result===undefined);
        for(let i=0;i<15&&pending();i++){
          const p=pending();
          const reply=p.constructor.name==='ShowCardsPrompt'?true:
            p.constructor.name==='ShuffleDeckPrompt'?
              Array.from({length:f.source.deck.cards.length},(_,j)=>j):
              p.constructor.name==='WaitPrompt'?null:undefined;
          assert.ok(reply!==undefined,
            'Unexpected category continuation '+p.constructor.name);
          f.store.dispatch(new ResolvePromptAction(p.id,reply));
        }
        assert.equal(pending(),undefined);
        let actualCarrierRecovered=0;
        if(carrierCopies===1&&count===2){
          const carrier=f.source.hand.cards.find(c=>c.fullName===CARRIER);
          assert.ok(carrier,'Two targets should preserve one physical Carrier');
          const carrierPlay=autoCarrier?bot.decodeNextAction(f.state):
            new PlayCardAction(f.source.id,
              f.source.hand.cards.indexOf(carrier),{
                player:PlayerType.ANY,slot:SlotType.BOARD,index:0
              });
          assert.equal(carrierPlay.constructor.name,'PlayCardAction');
          assert.equal(f.source.hand.cards[carrierPlay.handIndex],carrier);
          f.store.dispatch(carrierPlay);
          const take=pending();
          assert.equal(take?.sourceCard?.fullName,CARRIER);
          assert.equal(take.message,'CHOOSE_CARD_TO_HAND');
          assert.equal(take.validate(targets,f.state),true);
          const carrierReply=autoCarrier?bot.decodeNextAction(f.state):
            new ResolvePromptAction(take.id,targets);
          assert.equal(carrierReply.constructor.name,'ResolvePromptAction');
          assert.deepEqual(carrierReply.result,targets);
          f.store.dispatch(carrierReply);
          for(let i=0;i<15&&pending();i++){
            const p=pending();
            const reply=p.constructor.name==='ShowCardsPrompt'?true:
              p.constructor.name==='ShuffleDeckPrompt'?
                Array.from({length:f.source.deck.cards.length},(_,j)=>j):
                p.constructor.name==='WaitPrompt'?null:undefined;
            assert.ok(reply!==undefined,
              'Unexpected Carrier continuation '+p.constructor.name);
            f.store.dispatch(new ResolvePromptAction(p.id,reply));
          }
          assert.equal(pending(),undefined);
          actualCarrierRecovered=targets.filter(c=>
            f.source.hand.cards.includes(c)&&
            !f.source.discard.cards.includes(c)).length;
        }
        return {
          seat,count,carrierCopies,autoRoot,autoCarrier,actualCarrierRecovered,
          payment:payment.map(c=>c.fullName),
          selected:selection.map(c=>c.fullName),
          paid:payment.every(c=>f.source.discard.cards.includes(c)&&
            !f.source.hand.cards.includes(c)),
          fetched:selection.every(c=>f.source.hand.cards.includes(c)&&
            !f.source.deck.cards.includes(c)),
          qualifiedGame:false
        };
      },{stagedStore:f.store,policy,autoPlayRoot:autoRoot,
        autoPlayCarrier:autoCarrier})));
  return {
    result:outer.result.result.result,
    actorAudit:outer.result.result.audit,
    searchAudit:outer.result.audit,
    paymentAudit:outer.audit
  };
}

test('automatic actor owns real native Secret Box payment and four-category search after source play in both seats',()=>{
  for(const seat of [0,1]){
    for(const count of [1,4]){
      const {result,actorAudit,paymentAudit,searchAudit}=
        actorFixture(seat,count);
      console.log('AGENT16_ACTOR_SECRET_BOX_NATIVE',JSON.stringify({
        result,actorAudit,paymentAudit,searchAudit
      }));
      assert.deepEqual(result.payment,
        count===1?[VIP,VIP,CARRIER]:[VIP,VIP,LILLIE]);
      assert.deepEqual(result.selected,CATEGORIES);
      assert.equal(result.paid,true);
      assert.equal(result.fetched,true);
      assert.equal(actorAudit.ownerPaymentPromptProposals,1);
      assert.equal(actorAudit.ownerCategoryPromptProposals,1);
      assert.equal(actorAudit.nativePaymentAccepted,1);
      assert.equal(actorAudit.nativeCategoryAccepted,1);
      assert.equal(actorAudit.nativeRejected,0);
      assert.equal(actorAudit.physicalReceiptCount,2);
      assert.equal(actorAudit.nativePaymentPhysicallySettled,1);
      assert.equal(actorAudit.nativeCategoryPhysicallySettled,1);
      assert.equal(actorAudit.outstandingPhysicalReceipts,0);
      assert.equal(actorAudit.acceptedBySeat[seat],2);
      assert.equal(actorAudit.qualifiedGames,0);
      assert.equal(paymentAudit.inspectedPayments,1);
      assert.equal(paymentAudit.vetoedPayments,0);
      assert.equal(searchAudit.sourceSearchPrompts,1);
      assert.equal(searchAudit.acceptedSearches,1);
      assert.equal(searchAudit.vetoedSearches,0);
    }
  }
});

test('single held Carrier switches automatic paid decision at two target cards and realizes recovery in both seats',()=>{
  for(const seat of [0,1]){
    for(const count of [1,2]){
      const {result,actorAudit,paymentAudit,searchAudit}=
        actorFixture(seat,count,1);
      console.log('AGENT16_ACTOR_SINGLE_CARRIER_NATIVE',JSON.stringify({
        result,actorAudit,paymentAudit,searchAudit
      }));
      assert.equal(result.carrierCopies,1);
      assert.deepEqual(result.payment,
        count===1?[VIP,VIP,CARRIER]:[VIP,VIP,LILLIE]);
      assert.deepEqual(result.selected,CATEGORIES);
      assert.equal(result.actualCarrierRecovered,count===1?0:2);
      assert.equal(result.paid,true);
      assert.equal(result.fetched,true);
      assert.equal(actorAudit.nativePaymentAccepted,1);
      assert.equal(actorAudit.nativeCategoryAccepted,1);
      assert.equal(actorAudit.physicalReceiptCount,2);
      assert.equal(actorAudit.nativeRejected,0);
      assert.equal(actorAudit.outstandingPhysicalReceipts,0);
      assert.equal(actorAudit.acceptedBySeat[seat],2);
      assert.equal(paymentAudit.vetoedPayments,0);
      assert.equal(searchAudit.vetoedSearches,0);
      assert.equal(result.qualifiedGame,false);
    }
  }
});

test('native actor independently plays payable Secret Box root before both subsequent paper-guarded prompts in both seats',()=>{
  for(const seat of [0,1]){
    for(const count of [1,2]){
      const {result,actorAudit,paymentAudit,searchAudit}=
        actorFixture(seat,count,1,true);
      console.log('AGENT16_ACTOR_AUTOBOX_ROOT_NATIVE',JSON.stringify({
        result,actorAudit,paymentAudit,searchAudit
      }));
      assert.equal(result.autoRoot,true);
      assert.deepEqual(result.payment,
        count===1?[VIP,VIP,CARRIER]:[VIP,VIP,LILLIE]);
      assert.deepEqual(result.selected,CATEGORIES);
      assert.equal(result.actualCarrierRecovered,count===2?2:0);
      assert.equal(actorAudit.ownerBoxRootProposals,1);
      assert.equal(actorAudit.nativeOwnerBoxRootAccepted,1);
      assert.equal(actorAudit.nativeSourceBoxPaymentPromptsOpened,1);
      assert.equal(actorAudit.nativePaymentAccepted,1);
      assert.equal(actorAudit.nativeCategoryAccepted,1);
      assert.equal(actorAudit.physicalReceiptCount,2);
      assert.equal(actorAudit.outstandingPhysicalReceipts,0);
      assert.equal(actorAudit.nativeRejected,0);
      assert.equal(paymentAudit.vetoedRoots,0);
      assert.equal(paymentAudit.vetoedPayments,0);
      assert.equal(searchAudit.vetoedSearches,0);
      assert.equal(result.qualifiedGame,false);
    }
  }
});

test('native actor independently executes Box root, payment, four-category search, then Carrier root and recovery in both seats',()=>{
  for(const seat of [0,1]){
    const {result,actorAudit,paymentAudit,searchAudit}=
      actorFixture(seat,2,1,true,true);
    console.log('AGENT16_ACTOR_FULL_BOX_CARRIER_NATIVE',JSON.stringify({
      result,actorAudit,paymentAudit,searchAudit
    }));
    assert.equal(result.autoRoot,true);
    assert.equal(result.autoCarrier,true);
    assert.deepEqual(result.payment,[VIP,VIP,LILLIE]);
    assert.deepEqual(result.selected,CATEGORIES);
    assert.equal(result.actualCarrierRecovered,2);
    assert.equal(actorAudit.nativeOwnerBoxRootAccepted,1);
    assert.equal(actorAudit.nativeOwnerCarrierRootAccepted,1);
    assert.equal(actorAudit.ownerCarrierRootProposals,1);
    assert.equal(actorAudit.ownerCarrierPromptProposals,1);
    assert.equal(actorAudit.nativeCarrierRecoveryAccepted,1);
    assert.equal(actorAudit.nativeCarrierPhysicallySettled,1);
    assert.equal(actorAudit.physicalReceiptCount,3);
    assert.equal(actorAudit.outstandingPhysicalReceipts,0);
    assert.equal(actorAudit.nativeRejected,0);
    assert.equal(paymentAudit.vetoedPayments,0);
    assert.equal(searchAudit.vetoedSearches,0);
    assert.equal(result.qualifiedGame,false);
  }
});
