'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { withPaleMoonDimensionValleyBonus } =
  require('../pale-moon-dimension-valley-bonus.cjs');

const OUTPUT = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(OUTPUT, name));
const VERSION = 'agent34-original-rank1-source-t18-raihan-palemoon-native-v3';

function pendingPrompt(store) {
  return store.state.prompts.find(p => p.result === undefined);
}

/**
 * @param {object} store Actual detached pinned Store, never original match.
 * @param {Function} ResolvePromptAction Compiled native action class.
 */
function settleWaits(store, ResolvePromptAction) {
  const resolved = [];
  for (let k = 0; k < 16; k++) {
    const p = pendingPrompt(store);
    if (p?.constructor.name !== 'WaitPrompt') break;
    store.dispatch(new ResolvePromptAction(p.id, null));
    resolved.push('WaitPrompt');
  }
  return resolved;
}

/** Produce a repeatable mixed order using only public run-scoped metadata. */
function boundedShufflePermutation(count, tag) {
  const order = Array.from({ length: count }, (_, i) => i);
  const seed = createHash('sha256').update(tag).digest();
  for (let k = count - 1; k > 0; k--) {
    const ix = (seed[(k * 7) % seed.length] +
      256 * seed[(k * 11 + 1) % seed.length]) % (k + 1);
    [order[k], order[ix]] = [order[ix], order[k]];
  }
  return order;
}

/**
 * Continue Agent11's cloned native source rank1 turn18 AFTER owner promotion.
 * Physical Raihan and Psychic cards must already be in the actor's actual
 * source-dealt zones. No card is introduced or removed by setup shortcuts.
 *
 * @param {{store:object,ownerId:number,opponentId:number,actorObservation:object}} context
 * @returns {object} Pinned Store action/payment evidence; no win-rate claim.
 */
function executeOriginalRank1RaihanPaleMoon(context) {
  const { store, ownerId, opponentId, actorObservation: view } = context;
  const receipt = {
    version: VERSION, sourceTurn: store.state.turn, sourceOwnerId: ownerId,
    status: 'unattempted', observedOwnerTurn: view.globalTurn,
    sourcePrintedHandOnly: true, originalSourceStoreUnchanged: true,
    noOpponentConcealedAccessForChoice: true,
    energyBefore: null, energyAfterRaihan: null, energyAfterManual: null,
    searchedOwnDeck: false, supporterNativeAccepted: false,
    attachPromptNativeResolved: false, manualEnergyNativeAccepted: false,
    results: [], errors: [], competitivePaperGames: 0
  };
  const { PlayCardAction, PlayerType, SlotType } =
    load('game/store/actions/play-card-action');
  const { ResolvePromptAction } = load('game/store/actions/resolve-prompt-action');
  const { AttackAction, RetreatAction, PassTurnAction } =
    load('game/store/actions/game-actions');
  const { Store } = load('game/store/store');
  const { Player } = load('game/store/state/player');
  const { withPendingEndTurnSwitchCleanup } =
    require('../pending-end-turn-switch-cleanup.cjs');
  const { deepClone } = load('utils/utils');
  const { StateUtils } = load('game/store/state-utils');
  const { CardType, SuperType, EnergyType } =
    load('game/store/card/card-types');
  const effects = load('game/store/effects/check-effects');
  const prefabs = load('game/store/prefabs/prefabs');
  const { DiscardCardsEffect } = load('game/store/effects/attack-effects');
  const card = load('sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx');

  const player = () => store.state.players.find(p => p.id === ownerId);
  const opponent = () => store.state.players.find(p => p.id === opponentId);
  const owner = player();
  assert.ok(owner && opponent(), 'Both original physical owners must exist');

  if(view?.decisionKind!=='owner-root' ||
     view.ownPublic?.active?.printing!=='Trevenant & Dusknoir-GX SMP' ||
     !Array.isArray(view.ownHand) ||
     view.globalTurn!==18 ||
     StateUtils.getStadiumCard(store.state)?.fullName!=='Dimension Valley PHF') {
    receipt.status='source-turn18-owner-visible-preconditions-missing';
    return receipt;
  }
  receipt.originalStateOwnerId = store.state.players[store.state.activePlayer]?.id;
  receipt.sourceHandRaihan = view.ownHand.includes('Raihan EVS');
  receipt.sourceHandPsychic = view.ownHand.includes('Psychic Energy MEE');
  if(!receipt.sourceHandRaihan || !receipt.sourceHandPsychic ||
      receipt.originalStateOwnerId !== ownerId) {
    receipt.status='source-hand-or-turn-invariant-failed';
    return receipt;
  }
  const raihan = owner.hand.cards.find(c=>c.fullName==='Raihan EVS');
  const discardedPsychic = owner.discard.cards.find(c=>
    c.fullName==='Psychic Energy MEE');
  if(!raihan || !discardedPsychic) {
    receipt.status='physical-raihan-or-discarded-energy-unavailable';
    return receipt;
  }
  receipt.supporterMarkerPresent=owner.marker.hasMarker('RAIHAN_MARKER',raihan);
  receipt.energyBefore=owner.active.energies.cards.map(c=>c.fullName);
  receipt.opposingEnergyBefore=opponent().active.energies.cards
    .map(c=>c.fullName);
  try {
    const handIndex=owner.hand.cards.indexOf(raihan);
    store.dispatch(new PlayCardAction(ownerId,handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    receipt.supporterNativeAccepted=true;
    receipt.waitAfterSupporter=settleWaits(store,ResolvePromptAction);
    const attach=pendingPrompt(store);
    receipt.attachPromptType=attach?.constructor.name??null;
    if(attach?.constructor.name!=='AttachEnergyPrompt' ||
       attach.playerId!==ownerId ||
       attach.cardList!==owner.discard) {
      receipt.status='native-raihan-energy-prompt-absent';
      return receipt;
    }
    const target={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
    const transfer={to:target,card:discardedPsychic};
    receipt.attachmentChoiceNativeValid=attach.validate([transfer],store.state);
    if(!receipt.attachmentChoiceNativeValid) {
      receipt.status='native-raihan-target-rejected';
      return receipt;
    }
    store.dispatch(new ResolvePromptAction(attach.id,[transfer]));
    receipt.attachPromptNativeResolved=true;
    receipt.energyAfterRaihan=owner.active.energies.cards.map(c=>c.fullName);
    receipt.waitAfterEnergy=settleWaits(store,ResolvePromptAction);

    const search=pendingPrompt(store);
    receipt.raihanSearchPromptType=search?.constructor.name??null;
    if(search?.constructor.name!=='ChooseCardsPrompt' ||
       search.playerId!==ownerId || search.cards!==owner.deck) {
      receipt.status='native-raihan-search-prompt-absent';
      return receipt;
    }
    // Owner may inspect their own deck after a search; no opponent hidden data.
    const selected=owner.deck.cards[0];
    if(!selected || search.validate([selected])!==true) {
      receipt.status='native-raihan-own-deck-choice-invalid';
      return receipt;
    }
    receipt.raihanOwnDeckSelected=selected.fullName;
    store.dispatch(new ResolvePromptAction(search.id,[selected]));
    receipt.searchedOwnDeck=true;
    receipt.waitAfterSearch=settleWaits(store,ResolvePromptAction);

    const shuffle=pendingPrompt(store);
    receipt.raihanShufflePromptType=shuffle?.constructor.name??null;
    if(shuffle?.constructor.name!=='ShuffleDeckPrompt' ||
       shuffle.playerId!==ownerId) {
      receipt.status='native-raihan-shuffle-prompt-absent';
      return receipt;
    }
    const perm=boundedShufflePermutation(owner.deck.cards.length,
      VERSION + ':' + ownerId);
    receipt.shuffleChoiceNativeValid=shuffle.validate(perm,store.state);
    assert.equal(receipt.shuffleChoiceNativeValid,true);
    store.dispatch(new ResolvePromptAction(shuffle.id,perm));
    receipt.waitAfterShuffle=settleWaits(store,ResolvePromptAction);
    if(pendingPrompt(store)) {
      receipt.status='raihan-unsettled-after-shuffle';
      receipt.unresolved=pendingPrompt(store).constructor.name;
      return receipt;
    }

    const handEnergy=owner.hand.cards.find(c=>c.fullName==='Psychic Energy MEE');
    if(!handEnergy || handEnergy===discardedPsychic) {
      receipt.status='second-source-physical-psychic-not-in-hand';
      return receipt;
    }
    receipt.manualEnergyIndex=owner.hand.cards.indexOf(handEnergy);
    store.dispatch(new PlayCardAction(ownerId,receipt.manualEnergyIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    receipt.manualEnergyNativeAccepted=true;
    receipt.waitAfterManual=settleWaits(store,ResolvePromptAction);
    receipt.energyAfterManual=owner.active.energies.cards.map(c=>c.fullName);
    if(receipt.energyAfterManual.length!==2 || pendingPrompt(store)) {
      receipt.status='two-psychic-source-funding-unverified';
      return receipt;
    }
  } catch(error) {
    receipt.status='native-raihan-funding-rejected';
    receipt.errors.push(String(error?.stack??error));
    return receipt;
  }

  // Both GX arms begin with the *same paid, physically sourced* native state.
  const paidState=store.state;
  const key=JSON.stringify({
    sourceTurn:paidState.turn,playerId:ownerId,
    ownHand:owner.hand.cards.map(c=>c.fullName),
    ownActive:owner.active.cards.map(c=>c.fullName),
    opponentActive:opponent().active.cards.map(c=>c.fullName)
  });
  receipt.paidPhysicalContextSha256=createHash('sha256').update(key).digest('hex');
  const types={
    CardClass:card.TrevenantDusknoirGX,
    StateUtils,CardType,
    CheckAttackCostEffect:effects.CheckAttackCostEffect,
    CheckProvidedEnergyEffect:effects.CheckProvidedEnergyEffect,
    DiscardCardsEffect,WAS_ATTACK_USED:prefabs.WAS_ATTACK_USED
  };

  for(const corrected of [false,true]) {
    const branch=new Store({onStateChange(){}});
    branch.state=deepClone(paidState);
    const src=branch.state.players.find(p=>p.id===ownerId);
    const opp=branch.state.players.find(p=>p.id===opponentId);
    const before=opp.active.energies.cards.slice();
    const outcome={corrected,initialOpposingEnergy:before.map(c=>c.fullName),
      ownerEnergyAtGx:src.active.energies.cards.map(c=>c.fullName),
      outcome:'not-attempted',existingGXSpent:src.usedGX,
      physicalPaidSource:receipt.paidPhysicalContextSha256};
    try{
      function attack(){
        branch.dispatch(new AttackAction(ownerId,'Pale Moon-GX'));
        return {settledWaits:settleWaits(branch,ResolvePromptAction)};
      }
      const audit=corrected
        ?withPaleMoonDimensionValleyBonus(types,attack)
        :{result:attack(),corrected:0,events:[]};
      outcome.nativeAccepted=true;
      outcome.correctedExtraEnergy=audit.corrected;
      outcome.events=audit.events;
      outcome.nativeWaits=audit.result.settledWaits;
      outcome.gxSpent=src.usedGX;
      outcome.delayedKOs=opp.pendingEndOfTurnEffects.map(e=>
        ({type:e.type,attack:e.attack?.name??null}));
      outcome.remainingOpposingEnergy=opp.active.energies.cards
        .map(c=>c.fullName);
      outcome.discardedPhysicalOpposingEnergy=before.filter(c=>
        opp.discard.cards.includes(c)).length;
      outcome.sameOpposingActive=opp.active.getPokemonCard()?.fullName;
      outcome.nextActorId=branch.state.players[branch.state.activePlayer]?.id??null;
      outcome.pendingPrompts=branch.state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name);
      // Source-dealt counterplay: Latias ex's Skyliner gives Basic Pokémon
      // zero retreat cost. The true opposing seat may choose one of its
      // already-public Bench slots to escape the queued GX Knock Out even
      // after the paper-correct three-Energy discard. Apply the pre-existing
      // switch effect cleanup only within this detached opponent reply.
      const candidateBenches=opp.bench
        .map((slot,index)=>({index,printing:slot.getPokemonCard()?.fullName??null}))
        .filter(option=>option.printing!==null);
      outcome.opposingVisibleBenches=candidateBenches;
      outcome.opponentRetreat={status:'not-attempted'};
      if(outcome.nextActorId===opponentId && candidateBenches.length>0){
        const chosen=candidateBenches[0];
        const formerActive=opp.active;
        const oldDefenderCard=formerActive.getPokemonCard();
        const beforePrizes=opp.prizes.reduce((n,slot)=>n+slot.cards.length,0);
        try{
          const escaped=withPendingEndTurnSwitchCleanup({Store,Player},()=>{
            branch.dispatch(new RetreatAction(opponentId,chosen.index));
            const retWaits=settleWaits(branch,ResolvePromptAction);
            const afterRetreatQueue=opp.pendingEndOfTurnEffects.length;
            const formerNowOnBench=opp.bench.some(slot=>
              slot.getPokemonCard()===oldDefenderCard);
            const current=opp.active.getPokemonCard()?.fullName??null;
            // Distinct opponent-owner decision branch, from the actual
            // post-retreat public board and the opponent's OWN hand only.
            // Choose any genuinely held Basic Energy for Girafarig's
            // single-Colorless Get Lost; never reveal opponent hand to the
            // source-side planner or graft a card into the physical deal.
            const ownReply=new Store({onStateChange(){}});
            ownReply.state=deepClone(branch.state);
            const replyOpp=ownReply.state.players.find(p=>p.id===opponentId);
            const replySource=ownReply.state.players.find(p=>p.id===ownerId);
            const ownHeldBasic=replyOpp.hand.cards.find(card=>
              card.superType===SuperType.ENERGY &&
              card.energyType===EnergyType.BASIC);
            const getLostReply={
              actorId:opponentId,actingOwnerOnlyHandRead:true,
              sourceDiscardIsPublic:true,
              ownBasicEnergyAvailable:Boolean(ownHeldBasic),
              status:ownHeldBasic?'not-yet-executed':'no-owned-basic-energy-in-hand'
            };
            if(ownHeldBasic){
              try{
                const index=replyOpp.hand.cards.indexOf(ownHeldBasic);
                const lostBefore=replySource.lostzone.cards.length;
                const discardBefore=replySource.discard.cards.length;
                ownReply.dispatch(new PlayCardAction(opponentId,index,{
                  player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
                }));
                getLostReply.attachNativeAccepted=true;
                getLostReply.attachWaits=settleWaits(ownReply,ResolvePromptAction);
                getLostReply.energyOnGirafarig=replyOpp.active.energies.cards.length;
                ownReply.dispatch(new AttackAction(opponentId,'Get Lost'));
                getLostReply.attackNativeAccepted=true;
                getLostReply.attackWaits=settleWaits(ownReply,ResolvePromptAction);
                const choice=pendingPrompt(ownReply);
                getLostReply.choicePromptType=choice?.constructor.name??null;
                const chosen=replySource.discard.cards.slice(0,2);
                if(choice?.constructor.name==='ChooseCardsPrompt' &&
                   choice.playerId===opponentId &&
                   choice.cards===replySource.discard &&
                   chosen.length===2 &&
                   choice.validate(chosen)===true){
                  const physicallySelected=chosen.slice();
                  ownReply.dispatch(new ResolvePromptAction(choice.id,chosen));
                  getLostReply.ownDecisionNativeResolved=true;
                  getLostReply.postChoiceWaits=settleWaits(ownReply,ResolvePromptAction);
                  getLostReply.sourceDiscardDelta=
                    replySource.discard.cards.length-discardBefore;
                  getLostReply.sourceLostZoneDelta=
                    replySource.lostzone.cards.length-lostBefore;
                  getLostReply.physicalTwoLost=physicallySelected.every(card=>
                    replySource.lostzone.cards.includes(card) &&
                    !replySource.discard.cards.includes(card));
                  getLostReply.status=
                    getLostReply.physicalTwoLost &&
                    getLostReply.sourceLostZoneDelta===2?
                      'owner-attached-energy-get-lost-two-physical-cards':
                      'owner-get-lost-physical-custody-unverified';
                }else{
                  getLostReply.status='own-get-lost-prompt-not-ready';
                }
              }catch(error){
                getLostReply.status='own-energy-or-get-lost-native-rejected';
                getLostReply.error=String(error?.stack??error);
              }
            }
            branch.dispatch(new PassTurnAction(opponentId));
            const passWaits=settleWaits(branch,ResolvePromptAction);
            return {
              retWaits,passWaits,afterRetreatQueue,formerNowOnBench,
              current,getLostReply,oldDefenderSurvived:opp.bench.some(slot=>
                slot.getPokemonCard()===oldDefenderCard),
              oldDefenderDiscarded:opp.discard.cards.includes(oldDefenderCard),
              afterOpposingPrizes:opp.prizes.reduce((n,slot)=>n+slot.cards.length,0),
              beforePrizes,
              queuedAfterTurn:opp.pendingEndOfTurnEffects.length,
              nextActorId:branch.state.players[branch.state.activePlayer]?.id??null
            };
          });
          outcome.opponentRetreat={
            status:'native-retreat-and-pass-settled',
            chosenFaceupBench:chosen,
            ...escaped.result,
            correctedDelayedEffects:escaped.removedFromSimulatedStores
          };
        }catch(error){
          outcome.opponentRetreat={
            status:'native-retreat-or-pass-rejected',
            chosenFaceupBench:chosen,error:String(error?.stack??error)
          };
        }
      }
      outcome.outcome='genuine-native-gx-settled';
    }catch(error){
      outcome.outcome='native-gx-rejected';
      outcome.error=String(error?.stack??error);
    }
    receipt.results.push(outcome);
  }
  receipt.status=receipt.results.every(r=>r.outcome==='genuine-native-gx-settled')
    ?'native-source-raihan-funded-two-arm-gx-settled'
    :'native-source-raihan-funded-gx-incomplete';
  return receipt;
}

const { withNumericShufflePromptValidation } =
  require('../agent33-shuffle-prompt-numeric-validation.cjs');

/**
 * Execute a single detached source continuation with the existing reversible
 * numeric shuffle validator. Pinned native rejects every legal deck shuffle
 * of >=11 cards via JavaScript's default lexicographic Array.sort().
 * @param {Parameters<typeof executeOriginalRank1RaihanPaleMoon>[0]} context
 */
function continueOriginalRank1RaihanPaleMoon(context) {
  const {result,audit}=withNumericShufflePromptValidation(
    ()=>executeOriginalRank1RaihanPaleMoon(context));
  return {...result,numericShuffleAudit:audit};
}

module.exports={VERSION,continueOriginalRank1RaihanPaleMoon};

