'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {
  chooseSecretBoxRecoveryCapacityPayment,
  planSecretBoxRecoveryCapacityPayment
} = require('./agent16-secret-box-recovery-capacity.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseOwnerCarrierRecovery,CARRIER}=
  require('./agent16-rescue-carrier-actor-recovery.cjs');
const {
  chooseSecretBoxCategories,ROOT93_NEW_MOON_PREFERENCES
} = require('./agent36-secret-box-four-category-selector.cjs');

const VERSION='agent16-secret-box-capacity-owner-native-prompt-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Install a default-off, synchronous, reversible actor-only native prompt
 * handler. Its own deck is examined ONLY when a genuine Secret Box owner-deck
 * search prompt is active. Optional autoPlayRoot admits a real Secret Box play
 * from an already authenticated live actor hand when a payable three-card
 * cost exists; default root behavior delegates unchanged to prior policy.
 * All unsupported prompts delegate to the previously installed decoder.
 *
 * @template T
 * @param {()=>T} run Real native Store execution
 * @param {{engine?:(modulePath:string)=>object,stagedStore?:object,
 *   policy?:object,preferences?:Record<string,string[]>,
 *   targetValuesByPrinting?:Record<string,number>,
 *   preserveRecoveryValue?:boolean,autoPlayRoot?:boolean,
 *   autoPlayCarrier?:boolean,minCarrierTargets?:number,
 *   passToBoxRoot?:boolean}} [options]
 * @returns {{result:T,audit:object}}
 */
function withOwnerSecretBoxCapacityActorPrompt(run,options={}) {
  assert.equal(typeof run,'function');
  const engine=options.engine??(name=>require(path.join(OUTPUT,name)));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {Store}=engine('game/store/store');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {TrainerCard}=engine('game/store/card/trainer-card');
  const {TrainerType}=engine('game/store/card/card-types');
  const previousBot=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const previousDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof previousBot?.value,'function');
  assert.equal(typeof previousDispatch?.value,'function');

  const liveFromStaged=options.stagedStore??null;
  if(liveFromStaged!==null)
    assert.ok(liveFromStaged instanceof Store,
      'Explicit stagedStore must be a real native Store');
  let live=liveFromStaged;
  const planned=new WeakMap();
  const rootPlanned=new WeakSet();
  const carrierRootPlanned=new WeakSet();
  const awaiting=new Set();
  const audit={
    version:VERSION,
    stagedStoreInjected:liveFromStaged!==null,
    ownerPaymentPromptProposals:0,
    ownerCategoryPromptProposals:0,
    autoPlayRootOptIn:options.autoPlayRoot===true,
    autoPlayCarrierOptIn:options.autoPlayCarrier===true,
    passToBoxRootOptIn:options.passToBoxRoot===true,
    interceptedOwnerPasses:0,
    interceptedOwnerPassWithBox:0,
    passToBoxRootAffordable:0,
    passToBoxRootAccepted:0,
    ownerCarrierRootProposals:0,
    nativeOwnerCarrierRootAccepted:0,
    ownerCarrierPromptProposals:0,
    nativeCarrierRecoveryAccepted:0,
    nativeCarrierPhysicallySettled:0,
    ownerRootLiveDecodes:0,
    ownerRootBoxVisibleDecodes:0,
    ownerRootBoxItemLockedDecodes:0,
    ownerRootBoxNoAffordableTripleDecodes:0,
    ownerRootBoxAffordableDecodes:0,
    ownerBoxRootProposals:0,
    nativeOwnerBoxRootAccepted:0,
    nativeSourceBoxRootAttempts:0,
    nativeSourceBoxRootAccepted:0,
    nativeSourceBoxPaymentPromptsOpened:0,
    nativeSourceBoxPaymentsFromOtherPolicies:0,
    nativeSourceBoxSearchesFromOtherPolicies:0,
    nativePaymentAccepted:0,
    nativeCategoryAccepted:0,
    nativeRejected:0,
    rejectedPlans:0,
    nonLiveSpeculativeDelegations:0,
    unsupportedPromptDelegations:0,
    acceptedBySeat:{0:0,1:0},
    physicalReceiptCount:0,
    nativePaymentPhysicallySettled:0,
    nativeCategoryPhysicallySettled:0,
    outstandingPhysicalReceipts:0,
    qualifiedGames:0
  };

  function decode(state) {
    if(state!==live?.state){
      audit.nonLiveSpeculativeDelegations++;
      return previousBot.value.call(this,state);
    }
    const seat=state.players?.findIndex(p=>p.id===this.client?.id)??-1;
    const pending=state.prompts?.find(p=>p.result===undefined);
    if(seat>=0&&!pending&&state.activePlayer===seat){
      audit.ownerRootLiveDecodes++;
      const owner=state.players[seat];
      const index=owner.hand.cards.findIndex(c=>c.fullName==='Secret Box TWM');
      if(index>=0){
        audit.ownerRootBoxVisibleDecodes++;
        const view=actorObservation(state,seat);
        if(view.ownTurnResources.itemPlayLocked===true){
          audit.ownerRootBoxItemLockedDecodes++;
        }else{
          const plan=planSecretBoxRecoveryCapacityPayment(
            owner,state,options.policy,options);
          if(plan===null)audit.ownerRootBoxNoAffordableTripleDecodes++;
          else{
            audit.ownerRootBoxAffordableDecodes++;
            if(options.autoPlayRoot===true){
              const action=new PlayCardAction(owner.id,index,{
                player:PlayerType.ANY,slot:SlotType.BOARD,index:0
              });
              rootPlanned.add(action);
              audit.ownerBoxRootProposals++;
              return action;
            }
          }
        }
      }
      if(options.autoPlayCarrier===true){
        const carrierIndex=owner.hand.cards.findIndex(c=>
          c.fullName===CARRIER);
        const eligible=owner.discard.cards.filter(c=>
          Number.isFinite(c.hp)&&c.hp>0&&c.hp<=90);
        const minTargets=options.minCarrierTargets??2;
        if(carrierIndex>=0&&eligible.length>=minTargets){
          const view=actorObservation(state,seat);
          if(view.ownTurnResources.itemPlayLocked!==true){
            const action=new PlayCardAction(owner.id,carrierIndex,{
              player:PlayerType.ANY,slot:SlotType.BOARD,index:0
            });
            carrierRootPlanned.add(action);
            audit.ownerCarrierRootProposals++;
            return action;
          }
        }
      }
    }
    if(seat<0||!pending||pending.playerId!==this.client?.id||
      pending.constructor?.name!=='ChooseCardsPrompt'||
      !['Secret Box TWM',CARRIER].includes(pending.sourceCard?.fullName)){
      audit.unsupportedPromptDelegations++;
      return previousBot.value.call(this,state);
    }
    const owner=state.players[seat];
    let chosen=null,kind=null;
    if(pending.message==='CHOOSE_CARD_TO_DISCARD') {
      chosen=chooseSecretBoxRecoveryCapacityPayment(
        pending,owner,state,options.policy,options);
      kind='payment';
    }else if(pending.sourceCard?.fullName==='Secret Box TWM'&&
      pending.message==='CHOOSE_CARD_TO_HAND') {
      chosen=chooseSecretBoxCategories(pending,owner,state,
        {TrainerCard,TrainerType},
        options.preferences??ROOT93_NEW_MOON_PREFERENCES);
      kind='categories';
    }else if(pending.sourceCard?.fullName===CARRIER&&
      pending.message==='CHOOSE_CARD_TO_HAND'&&
      options.autoPlayCarrier===true){
      chosen=chooseOwnerCarrierRecovery(pending,owner,state,options);
      kind='carrier-recovery';
    }
    if(kind===null||(chosen===null)) {
      audit.rejectedPlans++;
      return previousBot.value.call(this,state);
    }
    const selected=kind==='payment'?chosen.cards:chosen;
    assert.ok(Array.isArray(selected));
    assert.equal(pending.validate(selected,state),true,
      'Native Secret Box actor proposal must validate against real Store');
    const action=new ResolvePromptAction(pending.id,selected);
    planned.set(action,{seat,kind,promptId:pending.id,
      selectedCards:[...selected]});
    if(kind==='payment')audit.ownerPaymentPromptProposals++;
    else if(kind==='carrier-recovery')audit.ownerCarrierPromptProposals++;
    else audit.ownerCategoryPromptProposals++;
    return action;
  }

  /** Check physical custody after every accepted Store dispatch, including
   * the later continuation prompts that can complete a Trainer search. */
  function inspectPendingPhysicalReceipts(store) {
    for(const record of [...awaiting]){
      const owner=store.state.players[record.seat];
      const settled=record.kind==='payment'?
        record.selectedCards.every(card=>
          !owner.hand.cards.includes(card)&&
          owner.discard.cards.includes(card)):
        record.kind==='carrier-recovery'?
        record.selectedCards.every(card=>
          !owner.discard.cards.includes(card)&&
          owner.hand.cards.includes(card)):
        record.selectedCards.every(card=>
          !owner.deck.cards.includes(card)&&
          owner.hand.cards.includes(card));
      if(!settled)continue;
      awaiting.delete(record);
      audit.physicalReceiptCount++;
      if(record.kind==='payment')audit.nativePaymentPhysicallySettled++;
      else if(record.kind==='carrier-recovery')
        audit.nativeCarrierPhysicallySettled++;
      else audit.nativeCategoryPhysicallySettled++;
    }
    audit.outstandingPhysicalReceipts=awaiting.size;
  }

  function dispatch(action,...rest) {
    if(action?.constructor?.name==='AddPlayerAction'&&
      liveFromStaged===null)live=this;
    const sameStore=this===live;
    // Canonical owner-root adapters can consume every root decode without
    // delegating to this wrapper. Intercept ONLY their terminal native Pass,
    // after all higher-priority native root actions had their opportunity.
    // Source owner/turn and affordability are rechecked on the live Store.
    if(sameStore&&options.passToBoxRoot===true&&
      action?.constructor?.name==='PassTurnAction'&&
      this.state.prompts?.every(p=>p.result!==undefined)){
      const seat=this.state.players.findIndex(p=>p.id===action.id);
      if(seat>=0&&this.state.activePlayer===seat){
        audit.interceptedOwnerPasses++;
        const owner=this.state.players[seat];
        const index=owner.hand.cards.findIndex(c=>
          c.fullName==='Secret Box TWM');
        if(index>=0){
          audit.interceptedOwnerPassWithBox++;
          const view=actorObservation(this.state,seat);
          if(view.ownTurnResources.itemPlayLocked!==true&&
            planSecretBoxRecoveryCapacityPayment(
              owner,this.state,options.policy,options)!==null){
            audit.passToBoxRootAffordable++;
            const replacement=new PlayCardAction(owner.id,index,{
              player:PlayerType.ANY,slot:SlotType.BOARD,index:0
            });
            rootPlanned.add(replacement);
            const accepted=dispatch.call(this,replacement,...rest);
            audit.passToBoxRootAccepted++;
            return accepted;
          }
        }
      }
    }
    const record=sameStore?planned.get(action):null;
    const intendedRoot=sameStore&&rootPlanned.has(action);
    const intendedCarrierRoot=sameStore&&carrierRootPlanned.has(action);
    const owner=sameStore&&action?.constructor?.name==='PlayCardAction'?
      this.state.players?.find(p=>p.id===action.id):null;
    const boxRoot=owner?.hand?.cards?.[action.handIndex]?.fullName===
      'Secret Box TWM';
    const carrierRoot=owner?.hand?.cards?.[action.handIndex]?.fullName===
      CARRIER;
    if(boxRoot)audit.nativeSourceBoxRootAttempts++;
    const prompt=sameStore&&action?.constructor?.name==='ResolvePromptAction'?
      this.state.prompts?.find(p=>p.id===action.id&&p.result===undefined):
      null;
    if(!record&&prompt?.sourceCard?.fullName==='Secret Box TWM'){
      if(prompt.message==='CHOOSE_CARD_TO_DISCARD')
        audit.nativeSourceBoxPaymentsFromOtherPolicies++;
      else if(prompt.message==='CHOOSE_CARD_TO_HAND')
        audit.nativeSourceBoxSearchesFromOtherPolicies++;
    }
    if(!record){
      const result=previousDispatch.value.call(this,action,...rest);
      if(sameStore){
        if(carrierRoot&&intendedCarrierRoot)
          audit.nativeOwnerCarrierRootAccepted++;
        if(boxRoot){
          audit.nativeSourceBoxRootAccepted++;
          if(intendedRoot)audit.nativeOwnerBoxRootAccepted++;
          if(this.state.prompts?.some(p=>p.result===undefined&&
            p.sourceCard?.fullName==='Secret Box TWM'&&
            p.message==='CHOOSE_CARD_TO_DISCARD'))
            audit.nativeSourceBoxPaymentPromptsOpened++;
        }
        inspectPendingPhysicalReceipts(this);
      }
      return result;
    }
    try{
      const result=previousDispatch.value.call(this,action,...rest);
      assert.ok(!this.state.prompts.some(p=>
        p.id===record.promptId&&p.result===undefined),
        'Accepted Secret Box prompt must settle in the native Store');
      if(record.kind==='payment')audit.nativePaymentAccepted++;
      else if(record.kind==='carrier-recovery')
        audit.nativeCarrierRecoveryAccepted++;
      else audit.nativeCategoryAccepted++;
      audit.acceptedBySeat[record.seat]++;
      awaiting.add(record);
      inspectPendingPhysicalReceipts(this);
      return result;
    }catch(error){
      audit.nativeRejected++;
      throw error;
    }
  }

  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...previousBot,value:decode
  });
  Object.defineProperty(Store.prototype,'dispatch',{
    ...previousDispatch,value:dispatch
  });
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
      previousBot);
    Object.defineProperty(Store.prototype,'dispatch',previousDispatch);
  }
}

module.exports={VERSION,withOwnerSecretBoxCapacityActorPrompt};
