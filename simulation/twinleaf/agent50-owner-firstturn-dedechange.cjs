'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent50-source-owner-firstturn-dedechange-v1';
const OUTPUT=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * One opt-in actor-owned first-turn printed Dedechange intervention.
 *
 * Propose one genuine held Dedenne-GX UNB from the acting source's own hand
 * into its first empty Bench slot, affirm the resulting owner Ability prompt,
 * and verify actual physical transfer and Dedechange draw/discard settlement.
 * Subsequent decisions intentionally remain with the earlier decoder, which
 * must be guarded externally by the no-hidden-raw-State quarantine.
 *
 * No opponent hand, opponent deck, Prize identity or own deck order is read.
 *
 * @template T
 * @param {()=>T} run Synchronous native Store experiment.
 * @param {{sourceSeat:0|1,engine?:(relative:string)=>object}} config
 * @returns {{result:T,audit:object}}
 */
function withOwnerFirstTurnDedechange(run,config){
  assert.equal(typeof run,'function');
  assert.ok(config?.sourceSeat===0||config?.sourceSeat===1);
  const load=config.engine??(relative=>require(path.join(OUTPUT,relative)));
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {Store}=load('game/store/store');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    load('game/store/actions/resolve-prompt-action');
  const {ConfirmPrompt}=load('game/store/prompts/confirm-prompt');
  const {GameMessage}=load('game/game-message');
  const {GamePhase}=load('game/store/state/state');
  const {Stage}=load('game/store/card/card-types');
  const oldDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof oldDecode?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  assert.equal(oldDecode.configurable,true);
  assert.equal(oldDispatch.configurable,true);

  const sourceSeat=config.sourceSeat;
  const pending=new WeakMap();
  const audit={
    version:VERSION,sourceSeat,
    sourceTurnRootsSeen:0,
    proposedDedenneRoots:0,
    nativePlayedDedenne:0,
    rejectedDedenneRoots:0,
    confirmedDedechange:0,
    settledPhysicalDedechangeDraws:0,
    rejectedAbilityConfirmations:0,
    rootEvents:[],abilityEvents:[],
    originalNativeDecoderUsed:false,
    competitiveGamesQualified:0
  };
  let chosenPhysicalCard=null;
  let chosenBenchIndex=null;
  let selectedTurn=null;
  let rootOffered=false;

  function decode(state){
    const seat=state.players.findIndex(p=>p.id===this.client?.id);
    const owner=seat===sourceSeat?state.players[seat]:null;
    const prompt=owner?state.prompts.find(p=>
      p.playerId===owner.id&&p.result===undefined):null;

    if(owner&&chosenPhysicalCard&&prompt instanceof ConfirmPrompt&&
        prompt.message===GameMessage.WANT_TO_USE_ABILITY&&
        owner.bench[chosenBenchIndex]?.cards.includes(chosenPhysicalCard)&&
        audit.confirmedDedechange===0){
      const action=new ResolvePromptAction(prompt.id,true);
      pending.set(action,{kind:'confirm',seat,prompt,
        card:chosenPhysicalCard,benchIndex:chosenBenchIndex,
        turn:state.turn});
      return action;
    }

    const isRoot=owner&&state.phase===GamePhase.PLAYER_TURN&&
      state.activePlayer===seat&&state.turn>=1&&
      !state.prompts.some(p=>p.result===undefined);
    if(isRoot&&!rootOffered){
      audit.sourceTurnRootsSeen++;
      rootOffered=true;
      const ownHand=owner.hand.cards;
      const index=ownHand.findIndex(card=>
        card.fullName==='Dedenne GX UNB'&&
        card.stage===Stage.BASIC&&
        card.powers?.some(p=>p.name==='Dedechange'));
      const benchIndex=owner.bench.findIndex(slot=>
        slot.cards.length===0);
      if(index>=0&&benchIndex>=0){
        const card=ownHand[index];
        const action=new PlayCardAction(owner.id,index,{
          player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.BENCH,index:benchIndex
        });
        pending.set(action,{kind:'play',seat,card,benchIndex,
          turn:state.turn,handBefore:ownHand.length});
        audit.proposedDedenneRoots++;
        const opposingActive=state.players[1-seat].active.getPokemonCard();
        const sourceActive=owner.active.getPokemonCard();
        audit.rootEvents.push({seat,turn:state.turn,
          card:card.fullName,handIndex:index,
          benchIndex,availableDedenne:true,
          sourceActivePrinting:sourceActive?.fullName??null,
          opposingActivePrinting:opposingActive?.fullName??null,
          opposingActiveAbilities:opposingActive?.powers?.map(p=>p.name)??[],
          sourcePlayedStadiumPrintings:owner.stadium.cards.map(c=>c.fullName),
          opponentPlayedStadiumPrintings:state.players[1-seat].stadium.cards.map(c=>c.fullName),
          nativeAccepted:'unverified'});
        return action;
      }
      audit.rootEvents.push({seat,turn:state.turn,
        availableDedenne:index>=0,
        emptyBenchSlot:benchIndex>=0,
        nativeAccepted:false,
        reason:'no eligible held Dedenne and empty Bench'});
    }
    return oldDecode.value.call(this,state);
  }

  function dispatch(action,...args){
    const saved=pending.get(action);
    if(!saved)return oldDispatch.value.apply(this,[action,...args]);
    const before=this.state;
    const actor=before.players[saved.seat];
    const handBefore=saved.kind==='confirm'?
      [...actor.hand.cards]:null;
    const discardBefore=saved.kind==='confirm'?
      [...actor.discard.cards]:null;
    const lostBefore=saved.kind==='confirm'?
      [...actor.lostzone.cards]:null;
    const deckCountBefore=saved.kind==='confirm'?
      actor.deck.cards.length:null;
    let result;
    try{
      result=oldDispatch.value.apply(this,[action,...args]);
    }catch(error){
      if(saved.kind==='play')audit.rejectedDedenneRoots++;
      else audit.rejectedAbilityConfirmations++;
      throw error;
    }
    const after=this.state.players[saved.seat];
    if(saved.kind==='play'){
      const moved=after.bench[saved.benchIndex]?.cards
        .includes(saved.card)===true&&
        !after.hand.cards.includes(saved.card);
      if(moved){
        audit.nativePlayedDedenne++;
        chosenPhysicalCard=saved.card;
        chosenBenchIndex=saved.benchIndex;
        selectedTurn=saved.turn;
      }else{
        audit.rejectedDedenneRoots++;
      }
      const last=audit.rootEvents.at(-1);
      assert.ok(last);
      last.nativeAccepted=moved;
      last.postOwnerHandCount=after.hand.cards.length;
      last.physicallyInOwnBench=moved;
      last.printedAbilityPromptOffered=after===null?false:
        this.state.prompts.some(p=>p.playerId===after.id&&
          p.result===undefined&&
          p instanceof ConfirmPrompt&&
          p.message===GameMessage.WANT_TO_USE_ABILITY);
      return result;
    }

    const samePending=saved.prompt.result===true;
    const stillBenched=after.bench[saved.benchIndex]?.cards
      .includes(saved.card)===true;
    const discarded=handBefore.filter(card=>
      after.discard.cards.includes(card)&&
      !after.hand.cards.includes(card));
    const handSurvivors=handBefore.filter(card=>
      after.hand.cards.includes(card));
    const sentToLostZone=handBefore.filter(card=>
      after.lostzone.cards.includes(card)&&
      !after.hand.cards.includes(card));
    const drawn=deckCountBefore-after.deck.cards.length;
    const discardGain=after.discard.cards.length-discardBefore.length;
    const lostZoneGain=after.lostzone.cards.length-lostBefore.length;
    const event={seat:saved.seat,turn:saved.turn,
      card:saved.card.fullName,
      confirmPromptNativeResult:saved.prompt.result,
      promptSettled:samePending,
      physicallyStillInBench:stillBenched,
      ownerHandBefore:handBefore.map(c=>c.fullName),
      ownerHandAfter:after.hand.cards.map(c=>c.fullName),
      ownDiscardedOriginalHand:discarded.map(c=>c.fullName),
      ownOriginalHandSentToLostZone:sentToLostZone.map(c=>c.fullName),
      ownHandCardsPersisted:handSurvivors.map(c=>c.fullName),
      handBeforeCount:handBefore.length,
      handAfterCount:after.hand.cards.length,
      discardBeforeCount:discardBefore.length,
      discardAfterCount:after.discard.cards.length,
      ownDiscardGain:discardGain,
      lostZoneBeforeCount:lostBefore.length,
      lostZoneAfterCount:after.lostzone.cards.length,
      ownLostZoneGain:lostZoneGain,
      deckBeforeCount:deckCountBefore,
      deckAfterCount:after.deck.cards.length,
      ownerDeckCardsDrawn:drawn,
      originalPhysicalDedenneStillBenched:stillBenched,
      sourceTurnAtPlacement:selectedTurn,
      competitiveGamesQualified:0};
    audit.abilityEvents.push(event);
    const physicalSettled=samePending&&stillBenched&&
      handSurvivors.length===0&&
      discarded.length+sentToLostZone.length===handBefore.length&&
      discardGain===discarded.length&&
      lostZoneGain===sentToLostZone.length&&
      drawn>=0&&drawn<=6&&
      after.hand.cards.length===drawn;
    if(samePending)audit.confirmedDedechange++;
    if(physicalSettled)audit.settledPhysicalDedechangeDraws++;
    else audit.rejectedAbilityConfirmations++;
    return result;
  }

  Object.defineProperty(SimpleTacticsAi.prototype,
    'decodeNextAction',{...oldDecode,value:decode});
  Object.defineProperty(Store.prototype,
    'dispatch',{...oldDispatch,value:dispatch});
  try{
    return {result:run(),audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.agent50FirstTurnDedechangeAudit={
        ...audit,rootEvents:audit.rootEvents.map(x=>({...x})),
        abilityEvents:audit.abilityEvents.map(x=>({...x})),
        aborted:true
      };
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    assert.strictEqual(
      SimpleTacticsAi.prototype.decodeNextAction,decode);
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',oldDecode);
  }
}

module.exports={VERSION,withOwnerFirstTurnDedechange};
