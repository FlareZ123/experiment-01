'use strict';

const assert=require('node:assert/strict');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {ownerTrainerOpportunity,trainerPrintCatalog,VERSION:FRONTIER_VERSION}=
  require('./agent5-generic-owner-trainer-opportunity.cjs');

const {certifyFirstTurnBattleVip}=require('./agent5-owner-firstturn-basic-search-k0.cjs');
const VERSION='agent5-owner-turn-trainer-native-readonly-v2-k0-vip';

/**
 * Observe a shared, genuinely live owner root before the existing bot decides.
 * Record the full hand-held Trainer opportunity competition; compare it to
 * upstream's "legal-ish" enumerated roots and the one action actually chosen,
 * then bind the chosen action to its real Store dispatch outcome.
 *
 * No decision is changed. No private opposing hand, deck order, Prize
 * identity or search cards are requested. The passed native enumerator's
 * upstream implementation uses owner hand, board and public Stadium only.
 * CanPlay is deliberately not called; native enums are not paper legality.
 *
 * @template T
 * @param {()=>T} work Synchronous one-game execution.
 * @param {{Store:Function,SimpleTacticsAi:Function,GamePhase:object,
 *    ActionEnumerator:Function,TrainerCard:Function,TrainerType:object,
 *    allCards:object[],PlayCardAction:Function,
 *    seats?:(0|1)[],maxRoots?:number,
 *    ownerPaperNecessityOptIn?:boolean}} deps Actual pinned classes.
 * @returns {{result:T,audit:object}}
 */
function withNativeOwnerTrainerFrontier(work,deps){
  assert.equal(typeof work,'function');
  const {Store,SimpleTacticsAi,GamePhase,ActionEnumerator,
    TrainerCard,TrainerType,allCards,PlayCardAction,
    PokemonCard,Stage}=deps;
  const seats=deps.seats??[0,1],maxRoots=deps.maxRoots??72;
  assert.ok(seats.length>0&&seats.every(s=>s===0||s===1));
  assert.ok(Number.isInteger(maxRoots)&&maxRoots>0);
  const catalog=trainerPrintCatalog(allCards,{TrainerCard,TrainerType});
  const basics=PokemonCard&&Stage?new Set(allCards.filter(card=>
    card instanceof PokemonCard&&card.stage===Stage.BASIC)
    .map(card=>card.fullName)):null;
  if(deps.ownRegisteredSixties){
    assert.ok(Array.isArray(deps.ownRegisteredSixties)&&
      deps.ownRegisteredSixties.length===2&&
      deps.ownRegisteredSixties.every(deck=>deck.length===60));
    assert.ok(basics instanceof Set);
  }
  const protoStore=Store.prototype,protoAi=SimpleTacticsAi.prototype;
  const priorStore=Object.getOwnPropertyDescriptor(protoStore,'dispatch');
  const priorAi=Object.getOwnPropertyDescriptor(protoAi,'decodeNextAction');
  assert.equal(typeof priorStore?.value,'function');
  assert.equal(typeof priorAi?.value,'function');
  const nativeEnumerator=new ActionEnumerator();
  assert.equal(typeof nativeEnumerator.enumerate,'function');
  const roots=[],dispatchByAction=new WeakMap();
  assert.ok(deps.ownerDiscardRecoveryTargetOptIn!==true ||
    deps.ownerPaperNecessityOptIn===true,
    'Recovery target annotation requires the owner paper-necessity observer');
  const ownerTurnLedger=deps.ownerPaperNecessityOptIn===true?
    require('./agent4-owner-turn-ledger.cjs').createOwnerTurnLedger():null;
  const recoveryHelper=deps.ownerDiscardRecoveryTargetOptIn===true?
    require('./planning/owner-public-discard-target-necessary.cjs'):null;
  const recoveryPrints=recoveryHelper?
    recoveryHelper.withSourcePromoAliases(
      recoveryHelper.loadBundledPublicPrintMetadata(
        require('node:path').resolve(__dirname,'../../resources'))):null;
  let live=null,matched=0,exceptions=0,truncated=0;
  const observedBySeat=[0,0];

  function trackedDispatch(action,...args){
    const event=this===live?dispatchByAction.get(action):null;
    try{
      const result=priorStore.value.call(this,action,...args);
      if(!live&&action?.constructor?.name==='AddPlayerAction'&&
        this.state.players?.length===1&&this.state.players[0].id===101)
        live=this;
      if(event){
        event.dispatch='native-accepted';
        matched++;
      }
      return result;
    }catch(error){
      if(event){
        event.dispatch='native-rejected';
        event.error=String(error?.message||error).slice(0,240);
        exceptions++;
      }
      throw error;
    }
  }
  function trackedDecode(state,...args){
    const seat=state?.activePlayer,owner=state?.players?.[seat];
    const eligible=live&&state===live.state&&
      seats.includes(seat)&&owner?.id===this.client?.id&&
      state.phase===GamePhase.PLAYER_TURN&&
      !state.prompts.some(p=>p.result===undefined);
    if(!eligible)return priorAi.value.call(this,state,...args);
    if(roots.length>=maxRoots){
      truncated++;
      return priorAi.value.call(this,state,...args);
    }

    const view=actorObservation(state,seat);
    const offered=new Set();
    const native=nativeEnumerator.enumerate(state,owner,owner.id);
    for(const choice of native){
      if(choice instanceof PlayCardAction &&
        Number.isInteger(choice.handIndex)&&
        catalog.has(view.ownHand[choice.handIndex]))
        offered.add(choice.handIndex);
    }
    const frontier=ownerTrainerOpportunity(view,catalog,offered);
    const ownerTurnReceipt=ownerTurnLedger?ownerTurnLedger.observe(view):null;
    const publicPrizeScreen=deps.ownerPublicPrizeScreenOptIn===true?
      require('../evaluation/agent30-public-prize-trainer-necessary.cjs')
        .screenOwnerTrainerPrizePrerequisites(view,frontier.rows):null;
    const basePaperScreen=ownerTurnReceipt?
      require('./agent4-owner-paper-trainer-necessary-screen.cjs')
        .screenOwnerTrainerPaperNecessity(
          view,frontier.rows,ownerTurnReceipt):null;
    const paperScreen=recoveryPrints?
      require('./planning/owner-public-discard-target-necessary.cjs')
        .augmentPaperNecessityWithDiscardTargets(
          view,basePaperScreen,recoveryPrints):basePaperScreen;
    // In the opt-in audit, a second observed owner turn independently
    // invalidates the historical global-turn-only first-turn VIP certificate.
    const k0GuaranteedVip=deps.ownRegisteredSixties&&
      ownerTurnReceipt?.provenPastFirstOwnerTurn!==true?
      certifyFirstTurnBattleVip(view,deps.ownRegisteredSixties[seat],basics):null;
    const root={
      ordinal:roots.length,seat,turn:view.globalTurn,
      observedOwnerHandTrainerCopies:frontier.handTrainerCopies,
      unresolvedGenericOpportunities:frontier.unblockedGenericTrainerCopies,
      competingChannels:frontier.channels,
      trainers:frontier.rows,
      guaranteedK0FirstTurnVip:k0GuaranteedVip,
      nativeOfferedHandIndices:[...offered].sort((a,b)=>a-b),
      chosen:null,dispatch:'not-attempted',
      policyIsReadOnly:true,competitiveGameQualified:false
    };
    if(publicPrizeScreen)root.ownerPublicPrizeNecessity=publicPrizeScreen;
    if(paperScreen){
      root.ownerPaperNecessity=paperScreen;
      root.ownerTurnReceipt=ownerTurnReceipt;
    }
    // Development-only owner-hand payment overlay. The original native root
    // and all choices remain untouched. This witness is archived after play;
    // never disclose these owner-private hand counts to the other actor.
    if(deps.ownerHandPaymentContentionOptIn===true){
      root.ownerPaymentSummary=
        require('./agent27-owner-trainer-payment-observer.cjs')
          .summarizeOwnerHandPayment(view,frontier.rows);
    }
    if(deps.recordPublicStadiumSnapshot===true){
      root.ownerVisibleStadiumContext={
        ownerStadium:[...view.ownPublic.stadium],
        opponentStadium:[...view.opponentPublic.stadium],
        ownerStadiumPlayedTurn:view.ownTurnResources.stadiumPlayedTurn,
        ownerStadiumPlayLocked:view.ownTurnResources.stadiumPlayLocked,
        ownerDeckCount:view.ownPublic.deckCount
      };
    }
    roots.push(root);
    observedBySeat[seat]++;
    const action=priorAi.value.call(this,state,...args);
    if(action){
      const handIndex=action instanceof PlayCardAction?action.handIndex:null;
      const trainer=frontier.rows.find(row=>row.handIndex===handIndex)??null;
      root.chosen={
        action:action.constructor?.name??null,
        handIndex,trainer:trainer?{
          printing:trainer.printing,type:trainer.type,
          paperEligibility:trainer.paperEligibility,
          nativeEnumeratorOffered:trainer.nativeEnumeratorOffered
        }:null
      };
      dispatchByAction.set(action,root);
    }
    root.guaranteedK0VipPassed=k0GuaranteedVip!==null&&
      action?.constructor?.name==='PassTurnAction';
    return action;
  }
  Object.defineProperty(protoStore,'dispatch',{
    ...priorStore,value:trackedDispatch
  });
  Object.defineProperty(protoAi,'decodeNextAction',{
    ...priorAi,value:trackedDecode
  });
  try{
    const result=work();
    return {result,audit:{
      version:VERSION,frontierVersion:FRONTIER_VERSION,
      nativePrintedTrainerClasses:catalog.size,
      observedAuthenticStore:live!==null,
      attemptedRootObservations:roots.length,
      rootsOmittedDueToCap:truncated,
      chosenActionsNativeAccepted:matched,
      chosenActionsNativeRejected:exceptions,
      observedBySeat,
      ...(deps.ownerPublicPrizeScreenOptIn===true?{
        ownerPublicPrizeScreenOptIn:true,
        observedPublicPrizeConditionFailures:roots.reduce((sum,root)=>
          sum+(root.ownerPublicPrizeNecessity?.provenPrizeBlockedCopies??0),0),
        paperLegalTrainerMoveSetCertified:false
      }:{}),
      ...(ownerTurnLedger?{
        ownerPaperNecessityOptIn:true,
        observedOwnerTurnLedger:ownerTurnLedger.snapshot(),
        ownerPaperNecessaryFailures:roots.reduce((sum,root)=>
          sum+(root.ownerPaperNecessity?.provenNecessaryConditionFailures??0),0),
        ...(recoveryPrints?{
          ownerDiscardRecoveryTargetOptIn:true,
          registeredRecoveryCopyObservations:roots.reduce((sum,root)=>
            sum+(root.ownerPaperNecessity?.registeredHeldDiscardRecoveryCopies??0),0),
          newlyProvenRecoveryTargetFailures:roots.reduce((sum,root)=>
            sum+(root.ownerPaperNecessity?.newlyProvenPublicDiscardTargetFailures??0),0),
          paperPlayableRecoveryActionsCertified:false
        }:{}),
        ownerPaperUncertainTemporalDeclines:roots.reduce((sum,root)=>
          sum+(root.ownerPaperNecessity?.conservativeTemporalDeclines??0),0),
        paperLegalTrainerMoveSetCertified:false
      }:{}),
      nativeActionEnumeratorIsPaperLegal:false,
      cardSpecificPaymentOrEffectsProven:false,
      k0GuaranteedVipPassCount:roots.filter(root=>
        root.guaranteedK0VipPassed===true).length,
      competitiveGameQualified:false,
      roots
    }};
  }finally{
    Object.defineProperty(protoAi,'decodeNextAction',priorAi);
    Object.defineProperty(protoStore,'dispatch',priorStore);
  }
}

module.exports={VERSION,withNativeOwnerTrainerFrontier};
