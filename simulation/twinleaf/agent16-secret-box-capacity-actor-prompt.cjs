'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {
  chooseSecretBoxRecoveryCapacityPayment
} = require('./agent16-secret-box-recovery-capacity.cjs');
const {
  chooseSecretBoxCategories,ROOT93_NEW_MOON_PREFERENCES
} = require('./agent36-secret-box-four-category-selector.cjs');

const VERSION='agent16-secret-box-capacity-owner-native-prompt-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Install a default-off, synchronous, reversible actor-only native prompt
 * handler. Its own deck is examined ONLY when a genuine Secret Box owner-deck
 * search prompt is active. It does not change the root policy or play the Box.
 * Any unsupported prompt delegates to the previously installed decoder.
 *
 * @template T
 * @param {()=>T} run Real native Store execution
 * @param {{engine?:(modulePath:string)=>object,stagedStore?:object,
 *   policy?:object,preferences?:Record<string,string[]>,
 *   targetValuesByPrinting?:Record<string,number>,
 *   preserveRecoveryValue?:boolean}} [options]
 * @returns {{result:T,audit:object}}
 */
function withOwnerSecretBoxCapacityActorPrompt(run,options={}) {
  assert.equal(typeof run,'function');
  const engine=options.engine??(name=>require(path.join(OUTPUT,name)));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {Store}=engine('game/store/store');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
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
  const awaiting=new Set();
  const audit={
    version:VERSION,
    stagedStoreInjected:liveFromStaged!==null,
    ownerPaymentPromptProposals:0,
    ownerCategoryPromptProposals:0,
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
    if(seat<0||!pending||pending.playerId!==this.client?.id||
      pending.constructor?.name!=='ChooseCardsPrompt'||
      pending.sourceCard?.fullName!=='Secret Box TWM'){
      audit.unsupportedPromptDelegations++;
      return previousBot.value.call(this,state);
    }
    const owner=state.players[seat];
    let chosen=null,kind=null;
    if(pending.message==='CHOOSE_CARD_TO_DISCARD') {
      chosen=chooseSecretBoxRecoveryCapacityPayment(
        pending,owner,state,options.policy,options);
      kind='payment';
    }else if(pending.message==='CHOOSE_CARD_TO_HAND') {
      chosen=chooseSecretBoxCategories(pending,owner,state,
        {TrainerCard,TrainerType},
        options.preferences??ROOT93_NEW_MOON_PREFERENCES);
      kind='categories';
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
        record.selectedCards.every(card=>
          !owner.deck.cards.includes(card)&&
          owner.hand.cards.includes(card));
      if(!settled)continue;
      awaiting.delete(record);
      audit.physicalReceiptCount++;
      if(record.kind==='payment')audit.nativePaymentPhysicallySettled++;
      else audit.nativeCategoryPhysicallySettled++;
    }
    audit.outstandingPhysicalReceipts=awaiting.size;
  }

  function dispatch(action,...rest) {
    if(action?.constructor?.name==='AddPlayerAction'&&
      liveFromStaged===null)live=this;
    const sameStore=this===live;
    const record=sameStore?planned.get(action):null;
    const owner=sameStore&&action?.constructor?.name==='PlayCardAction'?
      this.state.players?.find(p=>p.id===action.id):null;
    const boxRoot=owner?.hand?.cards?.[action.handIndex]?.fullName===
      'Secret Box TWM';
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
        if(boxRoot){
          audit.nativeSourceBoxRootAccepted++;
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
