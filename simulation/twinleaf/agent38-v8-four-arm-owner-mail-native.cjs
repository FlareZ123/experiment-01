'use strict';
const assert=require('node:assert/strict');
const {eligibleMailHandIndex,MAIL}=
  require('./agent4-bilateral-mail-root-choice.cjs');
const {chooseOwnedTop4Mail}=
  require('./agent4-mail-owner-prompt-choice.cjs');
const VERSION='agent38-v8-owner-mail-four-arm-native-v1';

/**
 * Adapted from Agent4's tested eight-arm owner-Mail policy for any exact,
 * unique, nonempty registered trial frame. Frozen Agent4 code is preserved.
 * Both-seat owner-only Mail policy layered last at the native match boundary.
 * A root is replaced only if the incumbent canonical policy chooses Pass.
 * All real Store choices, physical identities, and prompt results are audited.
 * @template T
 * @param {()=>T} next
 * @param {object} deps
 * @returns {{result:T,audit:object}}
 */
function withBilateralOwnerMail(next,deps){
  assert.equal(typeof next,'function');
  const {headless,SimpleTacticsAi,Store,PlayCardAction,
    ResolvePromptAction,types,trialIds}=deps;
  const followMailNestBall=deps.followMailNestBall===true;
  const followArvenNestBall=deps.followArvenNestBall===true;
  const preferSinglePrizeNestBasic=deps.preferSinglePrizeNestBasic===true;
  assert.ok(!preferSinglePrizeNestBasic || followMailNestBall || followArvenNestBall,
    'prize-aware Nest Basic policy requires Nest follow-through');
  const followMailHandiwork=deps.followMailHandiwork===true;
  const followHeldHandiwork=deps.followHeldHandiwork===true;
  const followHeldRefillSupporter=deps.followHeldRefillSupporter===true;
  const followMailArven=deps.followMailArven===true;
  const followHeldArven=deps.followHeldArven===true;
  const followOwnerConfirm=deps.followOwnerConfirm===true;
  const confirmNativeDedenne=deps.confirmNativeDedenne===true;
  const followOwnerMotivate=deps.followOwnerMotivate===true;
  assert.ok(!confirmNativeDedenne||followOwnerConfirm,
    'Dedenne confirmation requires authenticated owner prompt handling');
  const board=deps.playCardEnums??{};
  const ids=new Set(trialIds);
  assert.equal(ids.size,trialIds.length, 'registered owner-Mail trial IDs must be unique');
  assert.ok(ids.size>0, 'at least one registered trial is required');
  const ai=SimpleTacticsAi.prototype,store=Store.prototype;
  const oldRun=headless.runMatch;
  const oldStore=Object.getOwnPropertyDescriptor(store,'dispatch');
  assert.equal(typeof oldRun,'function');
  assert.equal(typeof oldStore?.value,'function');
  let active=false,storeInstance=null,priorAi=null,pending=null,
    pendingNest=null,pendingHandiwork=null,pendingArven=null,
    pendingDedenneConfirm=null,trialId=null;
  const proposals=new WeakMap();
  const ownerPassMailActions=new WeakSet();
  const ownerMailHandiworkActions=new WeakSet();
  const ownerHeldHandiworkActions=new WeakSet();
  const ownerHeldRefillActions=new WeakSet();
  const ownerMailArvenActions=new WeakSet();
  const ownerArvenNestActions=new WeakSet();
  const physicallySelectedArvenNestItems=new WeakSet();
  const ownerHeldArvenActions=new WeakSet();
  const arvenSelections=new WeakMap();
  const ownerConfirmActions=new WeakMap();
  const ownerMotivateActions=new WeakMap();
  const physicallySelectedMailTrainers=new WeakSet();
  const nestPromptSelections=new WeakMap();
  const audit={schema:VERSION,trialIds:[...ids],attempts:0,
    lateDecoderInstallations:0,ownerRootPassesSeen:0,
    proposalCountsBySeat:[0,0],actualMailItemRootsBySeat:[0,0],
    nativeOwnerTop4PromptsBySeat:[0,0],
    nativeStoreResolvedBySeat:[0,0],
    physicalTrainerToHandBySeat:[0,0],
    physicalOtherTopCardsToDeckBySeat:[0,0],
    otherActionsDelegateToExistingPolicy:true,
    rejectedPromptActions:0,unsettledPromptActions:0,
    noPromptAfterMailBySeat:[0,0],
    revealedTrainers:[],actualMailEvents:[],
    selectedTrainerLaterPlayed:[],
    handiworkFromMailOffers:0,handiworkFromMailAccepted:0,
    handiworkFromMailNativeDeckChanges:[],handiworkFromMailRejected:0,
    handiworkFromHandOffers:0,handiworkFromHandAccepted:0,
    handiworkFromHandRejected:0,handiworkFromHandNativeDeckChanges:[],
    handiworkFromHandDeferredSettlements:[],
    heldRefillOffers:0,heldRefillAccepted:0,heldRefillRejected:0,
    heldRefillEvents:[],
    handiworkDeferredSettlements:[],handiworkDeferredUnresolved:0,
    arvenFromMailOffers:0,arvenFromMailAccepted:0,
    arvenFromMailRejected:0,arvenSearchRejected:0,
    arvenNoSearchPrompt:0,arvenSearchUnsettled:0,
    arvenPlayEvents:[],arvenSearchEvents:[],
    arvenFromHandOffers:0,arvenFromHandAccepted:0,
    arvenFromHandRejected:0,arvenFromHandSearchEvents:[],
    ownerConfirmOffers:0,ownerConfirmSettled:0,
    ownerConfirmRejected:0,ownerConfirmUnsettled:0,
    ownerConfirmEvents:[],
    nativeDedenneConfirmOffers:0,nativeDedenneTrueAccepted:0,
    nativeDedenneTrueEffectSettled:0,nativeDedenneTrueRejected:0,
    nativeDedenneTrueEvents:[],
    nativeMotivateOffers:0,nativeMotivateSettled:0,
    nativeMotivateRejected:0,nativeMotivateUnsettled:0,
    nativeMotivateEvents:[],nativeMotivateEncountered:[],
    nestFromMailOffers:0,nestFromMailActualPlays:0,
    nestFromMailBenchSettled:0,nestFromMailBenchEvents:[],
    nestFromArvenOffers:0,nestFromArvenAccepted:0,
    nestFromArvenRejected:0,nestFromArvenBenchSettled:0,
    nestFromArvenBenchEvents:[],
    nativeDecoderInvocations:0,
    opponentPrivateZonesRead:false,qualifiedGames:0};

  function observedMatch(request){
    const id=typeof request?.label==='string'?
      [...ids].find(x=>request.label.endsWith(x)):undefined;
    if(!id)return oldRun(request);
    assert.equal(active,false);
    trialId=id;active=true;storeInstance=null;pending=null;
    pendingNest=null;pendingHandiwork=null;pendingArven=null;
    pendingDedenneConfirm=null;
    audit.attempts++;
    const descriptor=Object.getOwnPropertyDescriptor(ai,'decodeNextAction');
    assert.equal(typeof descriptor?.value,'function');
    priorAi=descriptor;
    Object.defineProperty(ai,'decodeNextAction',{
      ...descriptor,value:observedDecode});
    audit.lateDecoderInstallations++;
    try{return oldRun(request);}
    finally{
      assert.strictEqual(ai.decodeNextAction,observedDecode);
      Object.defineProperty(ai,'decodeNextAction',descriptor);
      priorAi=null;active=false;storeInstance=null;pending=null;
      pendingNest=null;pendingHandiwork=null;pendingArven=null;
      pendingDedenneConfirm=null;trialId=null;
    }
  }

  function observedDecode(state,...args){
    audit.nativeDecoderInvocations++;
    const seat=state?.activePlayer;
    const owner=state?.players?.[seat];
    const prompt=state?.prompts?.find(p=>p.result===undefined);
    if(active&&followOwnerMotivate&&
       prompt?.constructor?.name==='AttachEnergyPrompt'){
      // Restricted to the actual acting owner's public board/discard, and
      // metadata of the actual active prompt. No hidden-zone reads.
      audit.nativeMotivateEncountered.push({
        trialId,seat,turn:state?.turn,activeSeat:state?.activePlayer,
        aiOwnsActingPlayer:owner?.id===this.client?.id,
        promptOwnerMatches:prompt.playerId===owner?.id,
        promptMessage:String(prompt.message),
        promptFromOwnDiscard:prompt.cardList===owner?.discard,
        activePrinting:owner?.active?.getPokemonCard?.()?.fullName??null,
        eligibleOwnDiscardCount:owner?.discard?.filter?.(prompt.filter)?.length??null,
        ownBench:owner?.bench?.map(slot=>
          slot.getPokemonCard?.()?.fullName??null),
        promptPlayerType:prompt.playerType,
        promptSlots:[...prompt.slots],
        requirements:{min:prompt.options?.min,max:prompt.options?.max,
          sameTarget:prompt.options?.sameTarget},
        enumBottom:board.PlayerType?.BOTTOM_PLAYER,
        enumBench:board.SlotType?.BENCH
      });
    }
    if(active&&(followMailNestBall||followArvenNestBall)&&
      state===storeInstance?.state&&pendingNest?.seat===seat&&owner?.id===this.client?.id&&
      prompt?.id===pendingNest.id&&
      prompt?.constructor?.name==='ChooseCardsPrompt'&&
      prompt.cards===owner.deck&&
      prompt.sourceCard?.fullName==='Nest Ball SVI'){
      const selected=preferSinglePrizeNestBasic?
        require('./agent38-mail-nest-prize-aware-basic-choice.cjs')
          .choosePrizeAwareNestBasic(prompt,owner,types,state):
        (()=>{const pokemon=(prompt.cards?.cards??[]).find(card=>
          card.superType===types.SuperType.POKEMON&&
          card.stage===types.Stage.BASIC&&
          prompt.validate([card],state)===true);
          return pokemon?[pokemon]:[];})();
      if(selected!==null&&prompt.validate(selected,state)===true){
        const action=new ResolvePromptAction(prompt.id,selected);
        nestPromptSelections.set(action,{trialId,seat,prompt,selected,
          ownerId:owner.id,fromArven:pendingNest.fromArven===true});
        return action;
      }
    }
    if(active&&(followMailArven||followHeldArven)&&
      state===storeInstance?.state&&pendingArven?.seat===seat&&owner?.id===this.client?.id&&
      prompt?.id===pendingArven.id&&prompt.cards===owner.deck){
      const {chooseArvenSearch}=
        require('./agent7/mail-arven-owner-choice.cjs');
      const chosen=chooseArvenSearch(prompt,owner,types,state);
      if(chosen!==null){
        const action=new ResolvePromptAction(prompt.id,chosen);
        arvenSelections.set(action,{trialId,seat,ownerId:owner.id,
          origin:pendingArven.origin,
          prompt,chosen,originalHand:owner.hand.cards.slice(),
          originalDeck:owner.deck.cards.slice()});
        return action;
      }
    }
    if(active&&state===storeInstance?.state&&
      pending?.seat===seat&&
      owner?.id===this.client?.id&&prompt?.id===pending.id){
      const selected=chooseOwnedTop4Mail(prompt,owner,types);
      if(selected!==null){
        const answer=new ResolvePromptAction(prompt.id,selected);
        proposals.set(answer,{
          prompt,seat,ownerId:owner.id,
          originalTop:prompt.cards.cards.slice(),
          originalHand:owner.hand.cards.slice(),
          chosen:selected
        });
        audit.nativeOwnerTop4PromptsBySeat[seat]++;
        return answer;
      }
    }
    // The genuinely attacking owner's Motivate prompt is allowed to use its
    // own public Basic-Energy discard and Bench only. No native raw-State
    // decision fallback or opponent's hidden zones are accessed.
    if(active&&followOwnerMotivate&&state===storeInstance?.state&&
       owner?.id===this.client?.id&&prompt){
      const {chooseOwnerMotivateEnergy}=
        require('./agent7/owner-motivate-energy-choice.cjs');
      const selection=chooseOwnerMotivateEnergy(state,prompt,seat,board);
      if(selection){
        const action=new ResolvePromptAction(prompt.id,selection.assignments);
        require('./prompt-integrity.cjs')
          .assertValidPromptAction(state,action);
        ownerMotivateActions.set(action,{trialId,seat,turn:state.turn,
          prompt,selection});
        audit.nativeMotivateOffers++;
        return action;
      }
    }
    // Mail-to-Arven is an opt-in fully actor-owned action. In selected-v8,
    // the otherwise unsupported native decoder is deliberately quarantined;
    // placing this before delegation permits a verified Supporter action to
    // execute without ever inspecting raw State in that fallback decoder.
    if(followMailArven&&!prompt&&(seat===0||seat===1)&&owner){
      const {actorObservation}=
        require('./actor-observation-contract.cjs');
      const {chooseMailSelectedArven}=
        require('./agent7/mail-arven-owner-choice.cjs');
      const indices=owner.hand.cards.flatMap((card,index)=>
        physicallySelectedMailTrainers.has(card)?[index]:[]);
      const intent=chooseMailSelectedArven(
        actorObservation(state,seat),indices);
      const card=intent?owner.hand.cards[intent.handIndex]:null;
      if(intent&&card?.fullName===intent.printing&&
         card?.canPlay?.(storeInstance,state,owner)===true){
        const action=new PlayCardAction(owner.id,intent.handIndex);
        ownerMailArvenActions.add(action);
        audit.arvenFromMailOffers++;
        return action;
      }
    }
    // Only a Nest Ball that arrived through an actually settled Arven
    // owner-deck prompt can qualify. The native Store still adjudicates the
    // Item and the later Basic search. No unopened-deck introspection.
    if(active&&followArvenNestBall&&!prompt&&
       state===storeInstance?.state&&(seat===0||seat===1)&&
       owner?.id===this.client?.id&&
       board.PlayerType!==undefined&&board.SlotType!==undefined&&
       owner.bench?.some(slot=>slot.cards.length===0)){
      const {actorObservation}=
        require('./actor-observation-contract.cjs');
      const view=actorObservation(state,seat);
      const idx=owner.hand.cards.findIndex((card,i)=>
        physicallySelectedArvenNestItems.has(card)&&
        view.ownHand[i]==='Nest Ball SVI'&&card.fullName==='Nest Ball SVI');
      const physical=owner.hand.cards[idx];
      if(view.decisionKind==='owner-root'&&
         view.ownTurnResources?.itemPlayLocked===false&&
         idx>=0&&physical?.canPlay?.(storeInstance,state,owner)===true){
        const action=new PlayCardAction(owner.id,idx,{
          player:board.PlayerType.ANY,slot:board.SlotType.BOARD,index:0
        });
        ownerArvenNestActions.add(action);
        audit.nestFromArvenOffers++;
        return action;
      }
    }
    // Default-off, owner-scoped optional Confirm closure from Agent32's
    // tested false answer. The real prompt itself defines the recipient;
    // native prompt validation and custody remain authoritative.
    if(active&&followOwnerConfirm&&state===storeInstance?.state&&
       owner?.id===this.client?.id&&
       prompt?.constructor?.name==='ConfirmPrompt'&&
       prompt.playerId===owner.id){
      const authenticatedDedenne=confirmNativeDedenne&&
        pendingDedenneConfirm?.prompt===prompt&&
        pendingDedenneConfirm?.seat===seat&&
        pendingDedenneConfirm?.ownerId===owner.id&&
        owner.bench.some(slot=>slot.cards.includes(
          pendingDedenneConfirm.physicalCard))&&
        prompt.message==='WANT_TO_USE_ABILITY';
      const action=new ResolvePromptAction(prompt.id,authenticatedDedenne);
      require('./prompt-integrity.cjs')
        .assertValidPromptAction(state,action);
      ownerConfirmActions.set(action,{trialId,seat,prompt,turn:state.turn,
        answer:authenticatedDedenne,
        deden:authenticatedDedenne?{
          physicalCard:pendingDedenneConfirm.physicalCard,
          oldHand:owner.hand.cards.slice(),
          deckBefore:owner.deck.cards.length
        }:null});
      if(authenticatedDedenne)audit.nativeDedenneConfirmOffers++;
      audit.ownerConfirmOffers++;
      return action;
    }
    const baseline=priorAi.value.call(this,state,...args);
    if(!active||state!==storeInstance?.state||
      baseline?.constructor?.name!=='PassTurnAction'||
      owner?.id!==this.client?.id)return baseline;
    audit.ownerRootPassesSeen++;
    if(followMailHandiwork&&!prompt&&
       (seat===0||seat===1)&&owner&&
       owner.id!==undefined&&state.activePlayer===seat){
      const {actorObservation}=
        require('./actor-observation-contract.cjs');
      const {chooseMailSelectedHandiwork}=
        require('./agent9-mail-selected-handiwork-follow.cjs');
      const handIndices=owner.hand.cards.flatMap((card,index)=>
        physicallySelectedMailTrainers.has(card)?[index]:[]);
      const intent=chooseMailSelectedHandiwork(
        actorObservation(state,seat),handIndices);
      const card=intent?owner.hand.cards[intent.handIndex]:null;
      if(intent&&card?.fullName===intent.printing&&
         card?.canPlay?.(storeInstance,state,owner)===true){
        const action=new PlayCardAction(owner.id,intent.handIndex);
        ownerMailHandiworkActions.add(action);
        audit.handiworkFromMailOffers++;
        return action;
      }
    }
    if(followHeldHandiwork&&!prompt&&
       (seat===0||seat===1)&&owner&&state.activePlayer===seat){
      const {actorObservation}=
        require('./actor-observation-contract.cjs');
      const {chooseOwnerHeldHandiwork}=
        require('./agent1-owner-held-handiwork-choice.cjs');
      const intent=chooseOwnerHeldHandiwork(actorObservation(state,seat));
      const card=intent?owner.hand.cards[intent.handIndex]:null;
      if(intent&&card?.fullName===intent.printing&&
         card?.canPlay?.(storeInstance,state,owner)===true){
        const action=new PlayCardAction(owner.id,intent.handIndex);
        ownerHeldHandiworkActions.add(action);
        audit.handiworkFromHandOffers++;
        return action;
      }
    }
    if(followHeldArven&&!prompt&&(seat===0||seat===1)&&owner&&
       state.activePlayer===seat){
      const {actorObservation}=
        require('./actor-observation-contract.cjs');
      const {chooseOwnerHeldArven}=
        require('./agent1-owner-held-arven-choice.cjs');
      const intent=chooseOwnerHeldArven(actorObservation(state,seat));
      const card=intent?owner.hand.cards[intent.handIndex]:null;
      if(intent&&card?.fullName===intent.printing&&
         card?.canPlay?.(storeInstance,state,owner)===true){
        const action=new PlayCardAction(owner.id,intent.handIndex);
        ownerHeldArvenActions.add(action);
        audit.arvenFromHandOffers++;
        return action;
      }
    }
    if(followMailNestBall&&board.PlayerType!==undefined&&
      board.SlotType!==undefined&&
      owner?.bench?.some(slot=>(slot.cards??[]).length===0)){
      const nestIndex=owner.hand.cards.findIndex(card=>
        physicallySelectedMailTrainers.has(card)&&
        card.fullName==='Nest Ball SVI');
      const nest=owner.hand.cards[nestIndex];
      if(nestIndex>=0&&nest?.canPlay?.(storeInstance,state,owner)===true){
        audit.nestFromMailOffers++;
        return new PlayCardAction(owner.id,nestIndex,{
          player:board.PlayerType.ANY,slot:board.SlotType.BOARD,index:0
        });
      }
    }
    const handIndex=eligibleMailHandIndex(state,seat,storeInstance);
    if(handIndex===null){
      if(followHeldRefillSupporter&&!prompt&&
         (seat===0||seat===1)&&owner&&state.activePlayer===seat){
        const {actorObservation}=
          require('./actor-observation-contract.cjs');
        const {chooseOwnerHeldRefillSupporter}=
          require('./agent1-owner-held-refill-supporter-choice.cjs');
        const intent=chooseOwnerHeldRefillSupporter(actorObservation(state,seat));
        const card=intent?owner.hand.cards[intent.handIndex]:null;
        if(intent&&card?.fullName===intent.printing&&
           card?.canPlay?.(storeInstance,state,owner)===true){
          const action=new PlayCardAction(owner.id,intent.handIndex);
          ownerHeldRefillActions.add(action);
          audit.heldRefillOffers++;
          return action;
        }
      }
      return baseline;
    }
    audit.proposalCountsBySeat[seat]++;
    const action=new PlayCardAction(owner.id,handIndex);
    ownerPassMailActions.add(action);
    return action;
  }

  function observedDispatch(action,...args){
    if(active&&action?.constructor?.name==='AddPlayerAction'&&
       storeInstance===null)storeInstance=this;
    if(!active||this!==storeInstance)
      return oldStore.value.call(this,action,...args);
    const state=this.state,seat=state.activePlayer;
    const owner=state.players?.[seat];
    const proposal=proposals.get(action);
    const pendingPromptBefore=state.prompts?.find(p=>p.result===undefined);
    const taggedHeldHandiwork=ownerHeldHandiworkActions.has(action);
    const taggedRefill=ownerHeldRefillActions.has(action);
    const beforeRefill=taggedRefill?{
      hand:owner.hand.cards.length,deck:owner.deck.cards.length,
      prizes:owner.prizes.reduce((n,slot)=>n+slot.cards.length,0),
      supporterUsed:owner.supporterTurn
    }:null;
    const taggedHandiwork=ownerMailHandiworkActions.has(action)||taggedHeldHandiwork;
    const taggedHeldArven=ownerHeldArvenActions.has(action);
    const taggedArven=ownerMailArvenActions.has(action)||taggedHeldArven;
    const taggedArvenNest=ownerArvenNestActions.has(action);
    const arvenProposal=arvenSelections.get(action);
    const ownerConfirmProposal=ownerConfirmActions.get(action);
    const motivateProposal=ownerMotivateActions.get(action);
    const opposingSeat=1-seat;
    const opposingBefore=taggedHandiwork?{
      deck:state.players[opposingSeat].deck.cards.length,
      discard:state.players[opposingSeat].discard.cards.length
    }:null;
    // Only cards selected by a genuinely settled owner's Mail prompt can
    // later qualify as search-to-play evidence. Identity persists in hand.
    const selectedMailCard=action?.constructor?.name==='PlayCardAction'?
      owner?.hand?.cards?.[action.handIndex]:null;
    const fromSettledMail=selectedMailCard&&
      physicallySelectedMailTrainers.has(selectedMailCard);
    const nestPromptProposal=nestPromptSelections.get(action);
    const physicalDedennePlay=selectedMailCard?.fullName==='Dedenne GX UNB'&&
      action.id===owner?.id;
    const mailPlay=owner&&
      action?.constructor?.name==='PlayCardAction'&&
      action.id===owner.id&&
      owner.hand.cards[action.handIndex]?.fullName===MAIL;
    let value;
    try{value=oldStore.value.call(this,action,...args);}
    catch(e){
      if(proposal)audit.rejectedPromptActions++;
      if(taggedHandiwork){
        if(taggedHeldHandiwork)audit.handiworkFromHandRejected++;
        else audit.handiworkFromMailRejected++;
      }
      if(taggedArven){
        if(taggedHeldArven)audit.arvenFromHandRejected++;
        else audit.arvenFromMailRejected++;
      }
      if(taggedRefill)audit.heldRefillRejected++;
      if(taggedArvenNest)audit.nestFromArvenRejected++;
      if(arvenProposal)audit.arvenSearchRejected++;
      if(motivateProposal)audit.nativeMotivateRejected++;
      if(ownerConfirmProposal){
        audit.ownerConfirmRejected++;
        if(ownerConfirmProposal.deden)audit.nativeDedenneTrueRejected++;
      }
      throw e;
    }
    if(motivateProposal){
      const after=this.state.players[motivateProposal.seat];
      const {selection,prompt:ownerPrompt}=motivateProposal;
      const recipient=after.bench[selection.recipientIndex];
      const settled=ownerPrompt.result===action.result;
      const physicallyAttached=selection.assignments.every(row=>
        recipient.energies.cards.includes(row.card)&&
        !after.discard.cards.includes(row.card));
      if(settled&&physicallyAttached)audit.nativeMotivateSettled++;
      else audit.nativeMotivateUnsettled++;
      audit.nativeMotivateEvents.push({trialId:motivateProposal.trialId,
        seat:motivateProposal.seat,turn:motivateProposal.turn,
        source:'Squawkabilly ex PAL Motivate',
        recipientPrinting:selection.recipientPrinting,
        recipientBenchIndex:selection.recipientIndex,
        attached:selection.assignments.map(row=>row.card.fullName),
        nativePromptSettled:settled,physicalEnergyDiscardToBench:physicallyAttached});
      assert.ok(settled&&physicallyAttached,
        'Own Motivate Energy prompt did not physically settle in Store');
    }
    if(taggedRefill){
      audit.heldRefillAccepted++;
      const afterOwner=this.state.players[seat];
      audit.heldRefillEvents.push({trialId,seat,turnBefore:state.turn,
        printing:selectedMailCard?.fullName??null,before:beforeRefill,
        after:{hand:afterOwner.hand.cards.length,
          deck:afterOwner.deck.cards.length,
          supporterUsed:afterOwner.supporterTurn},
        pendingPrompt:this.state.prompts?.find(p=>p.result===undefined)
          ?.constructor?.name??null});
      deps.onHeldRefillActionCommitted?.(action,{trialId,seat,turnBefore:state.turn});
    }
    if(ownerConfirmProposal){
      const settled=ownerConfirmProposal.prompt.result===
        ownerConfirmProposal.answer;
      if(settled)audit.ownerConfirmSettled++;
      else audit.ownerConfirmUnsettled++;
      audit.ownerConfirmEvents.push({trialId:ownerConfirmProposal.trialId,
        seat:ownerConfirmProposal.seat,turn:ownerConfirmProposal.turn,
        message:String(ownerConfirmProposal.prompt.message),
        decision:ownerConfirmProposal.answer,nativeSettled:settled});
      if(ownerConfirmProposal.deden){
        if(settled)audit.nativeDedenneTrueAccepted++;
        const after=this.state.players[ownerConfirmProposal.seat];
        const proof=ownerConfirmProposal.deden;
        const drawn=proof.deckBefore-after.deck.cards.length;
        const left=proof.oldHand.every(c=>!after.hand.cards.includes(c)&&
          (after.discard.cards.includes(c)||
           after.lostzone.cards.includes(c)));
        const physicallySettled=settled&&drawn>=0&&drawn<=6&&
          after.hand.cards.length===drawn&&left&&
          after.bench.some(slot=>slot.cards.includes(proof.physicalCard));
        if(physicallySettled)audit.nativeDedenneTrueEffectSettled++;
        audit.nativeDedenneTrueEvents.push({trialId:ownerConfirmProposal.trialId,
          seat:ownerConfirmProposal.seat,turn:ownerConfirmProposal.turn,
          printedCard:'Dedenne GX UNB',decision:true,
          nativePromptSettled:settled,drawnCards:drawn,
          originalHandPhysicallyDiscardedOrLost:left,
          ownDedenneStillBenched:after.bench.some(slot=>
            slot.cards.includes(proof.physicalCard)),
          physicalDedechangeSettled:physicallySettled});
        pendingDedenneConfirm=null;
        assert.ok(physicallySettled,
          'Native Dedechange true did not physically discard hand and refill');
      }
      assert.ok(settled,'Owner Confirm did not settle in native Store');
    }
    if(physicalDedennePlay&&confirmNativeDedenne){
      const after=this.state.players[seat];
      const p=this.state.prompts?.find(p=>
        p.result===undefined&&p.playerId===owner.id&&
        p.constructor?.name==='ConfirmPrompt'&&
        p.message==='WANT_TO_USE_ABILITY');
      if(p&&after.bench.some(slot=>slot.cards.includes(selectedMailCard)))
        pendingDedenneConfirm={prompt:p,physicalCard:selectedMailCard,
          ownerId:owner.id,seat,turn:state.turn};
    }
    if(taggedArven){
      if(taggedHeldArven){
        audit.arvenFromHandAccepted++;
        deps.onHeldArvenActionCommitted?.(action,{trialId,seat,turnBefore:state.turn});
      } else audit.arvenFromMailAccepted++;
      const p=this.state.prompts?.find(x=>x.result===undefined);
      const trueSearch=p?.constructor?.name==='ChooseCardsPrompt'&&
        p.cards===this.state.players[seat]?.deck&&p.playerId===owner.id;
      pendingArven=trueSearch?{id:p.id,seat,
        origin:taggedHeldArven?'held':'mail'}:null;
      if(!trueSearch)audit.arvenNoSearchPrompt++;
      audit.arvenPlayEvents.push({trialId,seat,turnBefore:state.turn,
        origin:taggedHeldArven?'held':'mail',
        printing:selectedMailCard?.fullName??null,
        supporterTurnAfter:this.state.players[seat]?.supporterTurn??null,
        pendingArvenPromptId:trueSearch?String(p.id):null});
    }
    if(arvenProposal){
      const playerAfter=this.state.players[arvenProposal.seat];
      const physical=arvenProposal.chosen.every(card=>
        arvenProposal.originalDeck.includes(card)&&
        !arvenProposal.originalHand.includes(card)&&
        playerAfter.hand.cards.includes(card)&&
        !playerAfter.deck.cards.includes(card));
      const settled=arvenProposal.prompt.result===action.result&&physical;
      if(!settled)audit.arvenSearchUnsettled++;
      if(settled&&followArvenNestBall){
        for(const card of arvenProposal.chosen)
          if(card.fullName==='Nest Ball SVI')
            physicallySelectedArvenNestItems.add(card);
      }
      const searchReceipt={trialId:arvenProposal.trialId,
        seat:arvenProposal.seat,turnBefore:state.turn,
        selected:arvenProposal.chosen.map(card=>card.fullName),
        physicalOwnerDeckToHand:settled,
        origin:arvenProposal.origin};
      audit.arvenSearchEvents.push(searchReceipt);
      if(arvenProposal.origin==='held')
        audit.arvenFromHandSearchEvents.push(searchReceipt);
      pendingArven=null;
    }
    if(taggedHandiwork){
      const afterOpponent=this.state.players[opposingSeat];
      if(taggedHeldHandiwork){
        audit.handiworkFromHandAccepted++;
        deps.onHeldHandiworkActionCommitted?.(action,{trialId,seat,turnBefore:state.turn});
      }
      else audit.handiworkFromMailAccepted++;
      const receipt={
        origin:taggedHeldHandiwork?'held':'mail',
        trialId,ownerSeat:seat,turnBefore:state.turn,
        before:opposingBefore,
        after:{deck:afterOpponent.deck.cards.length,
          discard:afterOpponent.discard.cards.length},
        physicalDeckCardsRemoved:
          opposingBefore.deck-afterOpponent.deck.cards.length,
        nativeStoreReturned:true,
        nativePromptAfterPlay:this.state.prompts?.find(p=>
          p.result===undefined)?.constructor?.name??null,
        waitPromptResolutions:0,
        deferredEffectResolved:false,
        deferredOpponentDeckCardsMoved:null,
        deferredOpponentDiscardCardsAdded:null
      };
      if(taggedHeldHandiwork)
        audit.handiworkFromHandNativeDeckChanges.push(receipt);
      else audit.handiworkFromMailNativeDeckChanges.push(receipt);
      pendingHandiwork=receipt;
    }
    // Handiwork uses a native two-coin sequence. The actual mill callback
    // happens after two owner WaitPrompt acknowledgements, not when the
    // Supporter PlayCardAction first returns. Observe public counts only.
    if(pendingHandiwork&&!taggedHandiwork){
      const watched=pendingHandiwork;
      const sameTurn=this.state.turn===watched.turnBefore;
      const acknowledged=action?.constructor?.name==='ResolvePromptAction'&&
        pendingPromptBefore?.constructor?.name==='WaitPrompt'&&
        String(action.id)===String(pendingPromptBefore.id)&&
        pendingPromptBefore.playerId===this.state.players[watched.ownerSeat].id;
      if(sameTurn&&acknowledged){
        watched.waitPromptResolutions++;
        if(watched.waitPromptResolutions===2){
          const opponentAfter=this.state.players[1-watched.ownerSeat];
          watched.deferredEffectResolved=true;
          watched.deferredOpponentDeckCardsMoved=
            watched.before.deck-opponentAfter.deck.cards.length;
          watched.deferredOpponentDiscardCardsAdded=
            opponentAfter.discard.cards.length-watched.before.discard;
          const settlement={
            trialId:watched.trialId,ownerSeat:watched.ownerSeat,
            turnBefore:watched.turnBefore,
            waitPromptResolutions:watched.waitPromptResolutions,
            deckCardsMoved:watched.deferredOpponentDeckCardsMoved,
            discardCardsAdded:watched.deferredOpponentDiscardCardsAdded
          };
          if(watched.origin==='held')
            audit.handiworkFromHandDeferredSettlements.push(settlement);
          else audit.handiworkDeferredSettlements.push(settlement);
          pendingHandiwork=null;
        }
      }else if(!sameTurn){
        audit.handiworkDeferredUnresolved++;
        pendingHandiwork=null;
      }
    }
    if(nestPromptProposal){
      const afterOwner=this.state.players[nestPromptProposal.seat];
      const chosen=nestPromptProposal.selected;
      const settled=nestPromptProposal.prompt.result===action.result;
      const moved=chosen.length===1&&
        afterOwner.bench.some(slot=>slot.cards.includes(chosen[0]))&&
        !afterOwner.deck.cards.includes(chosen[0]);
      if(settled&&moved){
        if(nestPromptProposal.fromArven){
          audit.nestFromArvenBenchSettled++;
          audit.nestFromArvenBenchEvents.push({
            trialId,seat:nestPromptProposal.seat,turnBefore:state.turn,
            selectedPokemonPrinting:chosen[0].fullName,
            physicalBasicMovedDeckToBench:true
          });
        }else audit.nestFromMailBenchSettled++;
        audit.nestFromMailBenchEvents.push({
          trialId,seat:nestPromptProposal.seat,turnBefore:state.turn,
          selectedPokemonPrinting:chosen[0].fullName
        });
      }
      pendingNest=null;
    }
    if(fromSettledMail){
      const played={trialId,seat,turnBefore:state.turn,
        printing:selectedMailCard.fullName};
      audit.selectedTrainerLaterPlayed.push(played);
      deps.onSelectedTrainerPlayed?.(action,played);
    }
    if(taggedArvenNest){
      audit.nestFromArvenAccepted++;
      const nestPrompt=this.state.prompts?.find(p=>
        p.result===undefined&&p.playerId===owner.id&&
        p.constructor.name==='ChooseCardsPrompt'&&
        p.cards===owner.deck&&p.sourceCard?.fullName==='Nest Ball SVI');
      pendingNest=nestPrompt?{id:nestPrompt.id,seat,fromArven:true}:null;
      assert.ok(nestPrompt,
        'Physically Arven-selected Nest Ball play returned no own-deck Basic prompt');
    }
    if(fromSettledMail&&followMailNestBall&&
      selectedMailCard.fullName==='Nest Ball SVI'){
      audit.nestFromMailActualPlays++;
      const nestPrompt=this.state.prompts?.find(p=>
        p.result===undefined&&p.playerId===owner.id&&
        p.constructor.name==='ChooseCardsPrompt'&&
        p.cards===owner.deck&&p.sourceCard?.fullName==='Nest Ball SVI');
      pendingNest=nestPrompt?{id:nestPrompt.id,seat}:null;
    }
    if(mailPlay){
      if(ownerPassMailActions.has(action))
        deps.onMailActionCommitted?.(action,{trialId,seat,turnBefore:state.turn});
      audit.actualMailItemRootsBySeat[seat]++;
      const p=this.state.prompts?.find(x=>x.result===undefined);
      if(audit.actualMailEvents.length<64) {
        audit.actualMailEvents.push({trialId,seat,turnBefore:state.turn,
          actionHandIndex:action.handIndex,printing:MAIL,
          pendingPromptId:p?.id==null?null:String(p.id)});
      }
      if(p?.playerId===owner.id&&
        p?.constructor?.name==='ChooseCardsPrompt'&&
        p.message==='CHOOSE_CARD_TO_HAND'&&
        p.cards!==owner.deck)
        pending={id:p.id,seat};
      else{
        pending=null;
        audit.noPromptAfterMailBySeat[seat]++;
      }
    }
    if(proposal){
      const after=this.state.players[proposal.seat];
      const chosen=proposal.chosen;
      const settled=proposal.prompt.result===action.result;
      const physical=chosen.every(card=>
        proposal.originalTop.includes(card)&&
        !proposal.originalHand.includes(card)&&
        after.hand.cards.includes(card)&&
        !proposal.prompt.cards.cards.includes(card));
      const others=proposal.originalTop.filter(card=>!chosen.includes(card));
      const replaced=others.every(card=>after.deck.cards.includes(card));
      if(settled&&physical&&replaced){
        for(const card of chosen)physicallySelectedMailTrainers.add(card);
        audit.nativeStoreResolvedBySeat[proposal.seat]++;
        audit.physicalTrainerToHandBySeat[proposal.seat]+=chosen.length;
        audit.physicalOtherTopCardsToDeckBySeat[proposal.seat]+=others.length;
        if(chosen.length)audit.revealedTrainers.push({
          trialId,seat:proposal.seat,
          printing:chosen[0].fullName
        });
      }else audit.unsettledPromptActions++;
      pending=null;
    }
    return value;
  }

  headless.runMatch=observedMatch;
  Object.defineProperty(store,'dispatch',{
    ...oldStore,value:observedDispatch});
  try{return {result:next(),audit};}
  finally{
    assert.strictEqual(store.dispatch,observedDispatch);
    Object.defineProperty(store,'dispatch',oldStore);
    headless.runMatch=oldRun;
  }
}
module.exports={VERSION,withBilateralOwnerMail};
