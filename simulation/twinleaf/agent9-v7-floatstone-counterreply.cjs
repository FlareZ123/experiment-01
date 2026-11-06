'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=
  require('./actor-observation-contract.cjs');

const VERSION='agent9-v7-own-hand-floatstone-guzma-counterreply-v4-early-stadium-counter';

/**
 * Owner-controlled visible answer to the exact rank6 turn5 Guzma canary:
 * active untooled Marshadow receives a genuinely held Float Stone, then
 * immediately retreats to the damaged Tapu Lele-GX which was gusted away.
 * This does not use any hidden cards from the opposing player's perspective.
 * @param {object} view Detached acting-owner root view.
 * @returns {object|null} Owner-visible real native action intent.
 */
function chooseRealOwnerFloatStoneCounter(view) {
  if(view?.decisionKind!=='owner-root'||
     view.globalTurn!==6||view.actorSeat!==1||
     view.ownPublic?.active?.printing!=='Marshadow UNB'||
     view.opponentPublic?.active?.printing!=='Iron Thorns ex TWM'||
     view.ownPublic?.publicTurnRestrictions?.attackLockTurnsRemaining>0)
    return null;
  const r=view.ownTurnResources??{};
  const active=view.ownPublic.active;
  const ownBench=view.ownPublic.bench??[];
  const benchIndex=ownBench.findIndex(p=>
    p?.printing==='Tapu Lele-GX GRI'&&p.damage>=140);
  if(benchIndex<0)return null;
  const tools=active.tools??[];
  if(tools.some(printing=>/^Float Stone [A-Z0-9]+$/.test(printing))){
    if(r.retreatedTurn===view.globalTurn||
       active.publicRestrictions?.cannotRetreat===true)
      return null;
    return {kind:'retreat-to-original-tapu-lele',
      benchIndex,activePrinting:active.printing,
      destinationPrinting:ownBench[benchIndex].printing};
  }
  if(tools.length>0||r.toolPlayLocked===true||
     view.ownPublic.publicTurnRestrictions?.toolPlayLocked===true)
    return null;
  const handIndex=view.ownHand.findIndex(printing=>
    /^Float Stone [A-Z0-9]+$/.test(printing));
  return handIndex<0?null:{
    kind:'attach-floatstone-to-stranded-marshadow',
    handIndex,printing:view.ownHand[handIndex],
    nextBenchIndex:benchIndex
  };
}

/**
 * Optional actor-owned Benched Marshadow Ability answer after the two
 * physically settled Float Stone and Retreat roots. It removes the
 * opponent's currently public Thunder Mountain Prism Star from play.
 * @param {object} view Detached owner-root snapshot.
 * @returns {object|null} Native-neutral Resetting Hole proposal.
 */
function chooseOwnerMarshadowResettingHole(view) {
  if(view?.decisionKind!=='owner-root'||
     view.globalTurn!==6||view.actorSeat!==1||
     view.ownPublic?.active?.printing!=='Tapu Lele-GX GRI'||
     view.opponentPublic?.active?.printing!=='Iron Thorns ex TWM'||
     view.ownTurnResources?.retreatedTurn!==6||
     !view.opponentPublic?.stadium?.includes('Thunder Mountain Prism Star LOT'))
    return null;
  const benchIndex=(view.ownPublic.bench??[]).findIndex(p=>
    p?.printing==='Marshadow UNB'&&
    p.tools?.includes('Float Stone BKT')&&
    p.abilities?.includes('Resetting Hole'));
  return benchIndex<0?null:{
    kind:'remove-thunder-with-benched-marshadow',
    benchIndex,printing:'Marshadow UNB'
  };
}

/**
 * A proactive original-deal counter needs neither source Guzma nor any Tool:
 * the opponent's already-Benched Marshadow can remove source Thunder
 * Mountain on its own earlier turn. This is a separate, default-off case.
 * @param {object} view Actual owner-root observation.
 * @returns {object|null}
 */
function chooseOwnerMarshadowEarlyResettingHole(view){
  if(view?.decisionKind!=='owner-root'||
     view.globalTurn!==4||view.actorSeat!==1||
     view.ownPublic?.active?.printing!=='Tapu Lele-GX GRI'||
     view.opponentPublic?.active?.printing!=='Iron Thorns ex TWM'||
     !view.opponentPublic?.stadium?.
       includes('Thunder Mountain Prism Star LOT'))return null;
  const benchIndex=(view.ownPublic.bench??[]).findIndex(p=>
    p?.printing==='Marshadow UNB'&&
    p.abilities?.includes('Resetting Hole'));
  return benchIndex<0?null:{
    kind:'remove-thunder-with-benched-marshadow',
    benchIndex,printing:'Marshadow UNB'
  };
}

/**
 * Per-match reversible two-action native Store canary with a genuinely
 * owner-owned Tool and a separate zero-cost RetreatAction. All other
 * decisions remain the original native bot's. Keep this outside Guzma's
 * native prompt continuation to let the original exact owner act first.
 * @template T
 * @param {()=>T} execute Genuine native match.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,PlayCardAction?:Function,
 *   RetreatAction?:Function,PlayerType?:object,SlotType?:object,
 *   observe?:Function,choose?:Function,includeResettingHole?:boolean,
 *   includeEarlyResettingHole?:boolean,
 *   UseAbilityAction?:Function}} [deps] Test seams.
 * @returns {{result:T,audit:object}}
 */
function withFloatStoneOwnerCounterReply(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const native=name=>require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output',name));
  const Ai=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const cardActions=deps.PlayCardAction&&deps.PlayerType&&deps.SlotType?
    null:native('game/store/actions/play-card-action');
  const gameActions=deps.RetreatAction&&
    (!(deps.includeResettingHole||deps.includeEarlyResettingHole)||
      deps.UseAbilityAction)?null:
    native('game/store/actions/game-actions');
  const PlayCardAction=deps.PlayCardAction??cardActions.PlayCardAction;
  const RetreatAction=deps.RetreatAction??gameActions.RetreatAction;
  const UseAbilityAction=deps.UseAbilityAction??gameActions?.UseAbilityAction??null;
  const PlayerType=deps.PlayerType??cardActions.PlayerType;
  const SlotType=deps.SlotType??cardActions.SlotType;
  const observe=deps.observe??actorObservation;
  const choose=deps.choose??chooseRealOwnerFloatStoneCounter;
  const originalBot=Object.getOwnPropertyDescriptor(
    Ai.prototype,'decodeNextAction');
  const originalStore=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof originalBot?.value,'function');
  assert.equal(typeof originalStore?.value,'function');
  const intentsByAction=new WeakMap();
  let liveStore=null;
  let pendingHoleSettlement=null;
  const audit={
    version:VERSION,registeredRealStores:0,encounteredOwnerReplies:0,
    proposedNativeTools:0,acceptedNativeTools:0,
    proposedNativeRetreats:0,acceptedNativeRetreats:0,
    proposedResettingHole:0,acceptedResettingHole:0,
    settledResettingHole:0,
    nativeRejects:0,records:[],genericFloatStoneIntents:[],
    includeResettingHole:deps.includeResettingHole===true,
    includeEarlyResettingHole:deps.includeEarlyResettingHole===true,
    opponentCompetenceUnverified:true,
    paperLegalityUnverified:true,competitiveGamesQualified:0
  };
  function dispatch(action,...rest) {
    if(!liveStore&&action?.constructor?.name==='AddPlayerAction'){
      liveStore=this;
      audit.registeredRealStores++;
    }
    const rec=this===liveStore?intentsByAction.get(action):null;
    const settlingHole=this===liveStore&&pendingHoleSettlement&&
      action?.constructor?.name==='ResolvePromptAction'&&
      this.state?.prompts?.some(prompt=>
        prompt.result===undefined&&
        prompt.constructor.name==='WaitPrompt');
    try {
      const result=originalStore.value.apply(this,[action,...rest]);
      if(rec){
        rec.accepted=true;
        const state=this.state;
        const owner=state.players[rec.seat];
        const current=observe(state,rec.seat);
        rec.realActiveAfter=current.ownPublic.active?.printing??null;
        rec.realActiveToolsAfter=current.ownPublic.active?.tools??null;
        rec.realRetreatedTurnAfter=owner.retreatedTurn??null;
        if(rec.kind==='attach-floatstone-to-stranded-marshadow')
          audit.acceptedNativeTools++;
        if(rec.kind==='retreat-to-original-tapu-lele')
          audit.acceptedNativeRetreats++;
        if(rec.kind==='remove-thunder-with-benched-marshadow'){
          audit.acceptedResettingHole++;
          const prompt=state.prompts?.find(p=>p.result===undefined);
          rec.pendingAfterAcceptedAbility=prompt?.constructor.name??null;
          rec.settledAfterWaitPrompt=false;
          pendingHoleSettlement=rec;
        }
      }
      // Resetting Hole executes its effects only when native WaitPrompt is
      // acknowledged. Inspecting immediately after accepted UseAbilityAction
      // would falsely label the Stadium as still in play.
      if(settlingHole){
        const pending=pendingHoleSettlement;
        const source=this.state.players[0];
        const owner=this.state.players[1];
        pending.thunderStadiumAbsentAfter=!source.stadium.cards.some(card=>
          card.fullName==='Thunder Mountain Prism Star LOT');
        pending.thunderInSourceLostZoneAfter=source.lostzone.cards.some(card=>
          card.fullName==='Thunder Mountain Prism Star LOT');
        pending.marshadowBenchedAfter=owner.bench.some(slot=>
          slot.getPokemonCard?.()?.fullName==='Marshadow UNB');
        pending.marshadowInOwnerDiscardAfter=owner.discard.cards.some(card=>
          card.fullName==='Marshadow UNB');
        if(pending.thunderStadiumAbsentAfter&&
           pending.thunderInSourceLostZoneAfter&&
           pending.marshadowBenchedAfter===false&&
           pending.marshadowInOwnerDiscardAfter===true){
          pending.settledAfterWaitPrompt=true;
          pendingHoleSettlement=null;
          audit.settledResettingHole++;
        }
      }
      return result;
    }catch(error){
      if(rec){
        rec.rejected=String(error?.message??error);
        audit.nativeRejects++;
      }
      throw error;
    }
  }
  function decode(state,...rest) {
    const nativeAction=originalBot.value.apply(this,[state,...rest]);
    const seat=state?.activePlayer;
    const owner=state?.players?.[seat];
    if(state!==liveStore?.state||seat!==1||
       owner?.id!==this.client?.id||
       state?.prompts?.some(prompt=>prompt.result===undefined))
      return nativeAction;
    const view=observe(state,seat);
    const intent=(deps.includeEarlyResettingHole===true?
      chooseOwnerMarshadowEarlyResettingHole(view):null)??
      (deps.includeResettingHole===true?
        chooseOwnerMarshadowResettingHole(view):null)??choose(view);
    if(!intent)return nativeAction;
    audit.encounteredOwnerReplies++;
    // Audit whether the already-shared, non-case-specific owner-only Float
    // Stone helper detects this exact observed source, without influencing
    // any game action or disclosing non-owner concealed zones.
    const {Stage,SpecialCondition}=native('game/store/card/card-types');
    const generic=require('./agent1-owner-float-stone-mobility.cjs')
      .chooseOwnerFloatStoneMobility(view,{
        stages:Stage,specialConditions:SpecialCondition
      });
    audit.genericFloatStoneIntents.push({
      turn:view.globalTurn,seat,
      selectedCanaryIntent:intent.kind,
      sharedGenericIntent:generic?.kind??null,
      sharedGenericTargetPrinting:generic?.printing??null,
      samePhysicalHandIndex:
        intent.handIndex===undefined||generic?.handIndex===intent.handIndex,
      sameBenchDestination:
        (intent.benchIndex??intent.nextBenchIndex)===generic?.benchIndex
    });
    let action;
    if(intent.kind==='attach-floatstone-to-stranded-marshadow'){
      assert.equal(owner.hand.cards[intent.handIndex]?.fullName,
        intent.printing);
      action=new PlayCardAction(owner.id,intent.handIndex,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
      });
      audit.proposedNativeTools++;
    } else if(intent.kind==='retreat-to-original-tapu-lele'){
      action=new RetreatAction(owner.id,intent.benchIndex);
      audit.proposedNativeRetreats++;
    } else if(intent.kind==='remove-thunder-with-benched-marshadow'){
      assert.equal(typeof UseAbilityAction,'function');
      action=new UseAbilityAction(owner.id,'Resetting Hole',{
        player:PlayerType.BOTTOM_PLAYER,
        slot:SlotType.BENCH,index:intent.benchIndex
      });
      audit.proposedResettingHole++;
    } else {
      throw Error('Unexpected native opponent Float Stone intent');
    }
    const rec={seat,turn:state.turn,kind:intent.kind,
      originalBotAction:nativeAction.constructor.name,
      intendedDestination:intent.destinationPrinting??null,
      originalOpposingActive:view.opponentPublic.active.printing,
      ownActiveBefore:view.ownPublic.active.printing,
      ownerHandIndex:intent.handIndex??null,
      benchIndex:intent.benchIndex??intent.nextBenchIndex??null,
      accepted:false};
    intentsByAction.set(action,rec);
    audit.records.push(rec);
    return action;
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...originalStore,value:dispatch});
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...originalBot,value:decode});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent9FloatStoneNativeAudit={...audit,
        records:audit.records.map(r=>({...r}))};
    throw error;
  }
  finally {
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',originalBot);
    Object.defineProperty(Store.prototype,'dispatch',originalStore);
  }
}

module.exports={VERSION,chooseRealOwnerFloatStoneCounter,
  chooseOwnerMarshadowResettingHole,
  chooseOwnerMarshadowEarlyResettingHole,
  withFloatStoneOwnerCounterReply};
