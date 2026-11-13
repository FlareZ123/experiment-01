'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent9-fog-crystal-owner-prompt-v3-source-bound';
const AOR_GATE_VERSION='agent8-effective-aor-item-veto-optin-v1';
const OUTPUT=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Pure owner-visible search selection: the offered exact printings are
 * revealed only within an authenticated owner-deck Choice prompt.
 * Legality has already been projected into each permitted field by caller.
 * @param {object} view Detached actor-owned prompt observation.
 * @param {{printing:string,permitted:boolean,basicPsychic:boolean,psychicEnergy:boolean}[]} offered
 * @returns {string|null} Exact printing to select; null selects [] legally.
 */
function chooseFogPrinting(view,offered) {
  assert.equal(view.decisionKind,'owner-prompt');
  assert.equal(view.pendingOwnerDeckSearch,true);
  assert.ok(Array.isArray(offered));
  const eligible=offered.filter(row=>row.permitted);
  const openBench=view.ownPublic.bench.some(slot=>slot===null);
  const preferred=eligible.find(row=>openBench&&row.basicPsychic) ??
    eligible.find(row=>row.psychicEnergy) ?? eligible[0];
  return preferred?.printing??null;
}

/**
 * Adds one owner-visible Fog Crystal Item and authentic searchable-deck
 * ChooseCardsPrompt channel per turn, to the existing complete bilateral
 * policy. All other actor roots delegate to the shared root policy and
 * unsupported prompts are explicitly retained as delegated decisions.
 * Actual native Store acceptance is observed on the action identity.
 *
 * @template T
 * @param {()=>T} run Synchronous canonical real Store execution.
 * @param {object} [deps] Pure-test substitution seam.
 */
function withActorFogCrystalPrompt(run,deps={}) {
  assert.equal(typeof run,'function');
  const engine=deps.engine??(name=>require(path.join(OUTPUT,name)));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {Store}=engine('game/store/store');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {SuperType,TrainerType,EnergyType,Stage,CardType}=
    engine('game/store/card/card-types');
  const {GameMessage}=engine('game/game-message');
  const originalBot=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  const nativeAorItemLock=deps.nativeAorItemLock===true;
  const originalValidity=nativeAorItemLock?
    Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,
      'isValidAction'):null;
  assert.equal(typeof originalBot?.value,'function');
  assert.equal(typeof originalDispatch?.value,'function');
  if(nativeAorItemLock)
    assert.equal(typeof originalValidity?.value,'function');
  const observe=deps.observe??actorObservation;
  const aorPreflight=nativeAorItemLock?
    require('./agent8-aor-vileplume-item-preflight.cjs')
      .nativeAorVileplumeItemPreflight:null;
  const actions=new WeakMap(),perOwner=new Map();
  const searchedPhysicalCards=new Map();
  let live=null;
  const audit={
    version:VERSION,
    fogItemRootProposals:0,fogItemRootNativeAccepted:0,
    fogPromptProposals:0,fogPromptNativeAccepted:0,
    postSearchPhysicalCardPlays:0,postSearchPhysicalEvents:[],
    rejectedNativeChoices:0,unsupportedPrompts:0,
    sourceCardBindingAccepted:0,sourceCardBindingFailures:0,
    sourceCardBindingEvents:[],
    nonLiveSpeculativeFallbacks:0,
    nativeAorItemLockOptIn:nativeAorItemLock,
    nativeAorItemGateVersion:nativeAorItemLock?AOR_GATE_VERSION:null,
    skippedAorFogRoots:0,skippedAorGenericItemTactics:0,
    aorGateChecks:0,aorGateNativeVetoes:0,
    aorGateEvents:[],
    events:[],competitiveGameQualified:false,
    note:'Only authentic Fog Crystal first search is actor-owned; other prompt types and all delegated root actions remain outside this policy.'
  };
  /**
   * The only authoritative positive native Vileplume signal used in this
   * opt-in policy is a detached PowerEffect check. The underlying actor
   * observation includes only the public, face-up AOR location.
   * @param {object} state Actual live state.
   * @param {0|1} seat Physical actor.
   * @param {object} view Current actor-only observation.
   * @returns {boolean}
   */
  function aorBlocksItem(state,seat,view){
    if(!nativeAorItemLock)return false;
    const result=aorPreflight(view,state);
    if(!result.applicable)return false;
    audit.aorGateChecks++;
    if(result.nativeItemLocked)audit.aorGateNativeVetoes++;
    if(audit.aorGateEvents.length<24)audit.aorGateEvents.push({
      turn:state.turn,seat,visibleAorCount:result.visibleAorCount,
      nativeItemLocked:result.nativeItemLocked
    });
    return result.nativeItemLocked;
  }

  /**
   * Suppress illegal generic Item proposals at their native tactic filter.
   * This preserves the original bot's ability to try subsequent tactics.
   * @param {object} state Live native root (clones delegate unchanged).
   * @param {object} action Original proposed card action.
   * @returns {boolean}
   */
  function validNativeItem(state,action){
    if(state===live?.state&&
       action?.type==='PLAY_CARD_ACTION'&&
       state.phase!==undefined&&
       !state.prompts.some(prompt=>prompt.result===undefined)){
      const seat=state.players.findIndex(p=>p.id===this.client?.id);
      if(seat>=0&&state.activePlayer===seat){
        const owner=state.players[seat];
        const card=owner.hand.cards[action.handIndex];
        if(card?.trainerType===TrainerType.ITEM){
          const view=observe(state,seat);
          if(aorBlocksItem(state,seat,view)){
            audit.skippedAorGenericItemTactics++;
            return false;
          }
        }
      }
    }
    return originalValidity.value.call(this,state,action);
  }

  /** @param {object} state */
  function decoded(state) {
    // A native tactic can score a hypothetical cloned State. Only the
    // Store's authenticated current State may earn actor-only decision credit.
    if(state!==live?.state){
      audit.nonLiveSpeculativeFallbacks++;
      return originalBot.value.call(this,state);
    }
    const seat=state.players?.findIndex(p=>p.id===this.client?.id)??-1;
    const active=state.prompts?.find(p=>p.result===undefined)??null;
    if(seat<0 || (active && active.playerId!==this.client?.id))
      return originalBot.value.call(this,state);
    const actor=state.players[seat];
    let history=perOwner.get(actor.id);
    if(!history||history.turn!==state.turn) {
      history={turn:state.turn,itemUsed:false,awaitingFog:false,
        fogSourceCard:null,fogSourceHandIndex:null,promptPendingId:null};
      perOwner.set(actor.id,history);
    }
    if(active) {
      const expectedFogPrompt=history.awaitingFog &&
        active.constructor.name==='ChooseCardsPrompt' &&
        active.playerId===actor.id && active.cards===actor.deck &&
        active.message===GameMessage.CHOOSE_CARD_TO_HAND;
      if(expectedFogPrompt && history.fogSourceCard &&
         active.sourceCard===history.fogSourceCard) {
        const view=observe(state,seat);
        assert.equal(view.pendingOwnerDeckSearch,true);
        const offered=active.cards.cards.map(card=>({
          printing:card.fullName,permitted:active.validate([card],state),
          basicPsychic:card.superType===SuperType.POKEMON &&
            card.stage===Stage.BASIC &&
            card.cardType?.includes(CardType.PSYCHIC),
          psychicEnergy:card.superType===SuperType.ENERGY &&
            card.energyType===EnergyType.BASIC &&
            card.name==='Psychic Energy'
        }));
        const chosen=(deps.choosePrinting??chooseFogPrinting)(view,offered);
        const selected=chosen===null?[]:[
          active.cards.cards.find((card,index)=>card.fullName===chosen &&
            offered[index].permitted)
        ];
        assert.ok(active.validate(selected,state),
          'Selected Fog Crystal target fails native Choice validation');
        const action=new ResolvePromptAction(active.id,selected);
        actions.set(action,{kind:'fog-search',seat,turn:state.turn,
          chosen:chosen??null,selectedCard:selected[0]??null,
          sourceCard:history.fogSourceCard,
          sourceHandIndex:history.fogSourceHandIndex,
          sourcePrinting:history.fogSourceCard.fullName});
        history.promptPendingId=active.id;
        audit.fogPromptProposals++;
        return action;
      }
      if(history.awaitingFog) {
        if(expectedFogPrompt&&active.sourceCard!==history.fogSourceCard)
          audit.sourceCardBindingFailures++;
        // Do not let a later unrelated owner prompt inherit this Fog Crystal
        // authorization. A mismatched source fails closed to the native bot.
        history.awaitingFog=false;
        history.fogSourceCard=null;
        history.fogSourceHandIndex=null;
        history.promptPendingId=null;
      }
      audit.unsupportedPrompts++;
      return originalBot.value.call(this,state);
    }
    if(state.activePlayer!==seat || history.itemUsed)
      return originalBot.value.call(this,state);
    const view=observe(state,seat);
    if(view.decisionKind!=='owner-root' ||
      view.ownTurnResources.itemPlayLocked===true)
      return originalBot.value.call(this,state);
    const handIndex=view.ownHand.findIndex(name=>
      name.startsWith('Fog Crystal '));
    if(handIndex<0)return originalBot.value.call(this,state);
    assert.equal(actor.hand.cards[handIndex].fullName,view.ownHand[handIndex]);
    assert.equal(actor.hand.cards[handIndex].trainerType,TrainerType.ITEM);
    if(aorBlocksItem(state,seat,view)){
      audit.skippedAorFogRoots++;
      return originalBot.value.call(this,state);
    }
    const action=new PlayCardAction(actor.id,handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    const sourceCard=actor.hand.cards[handIndex];
    history.itemUsed=true;
    history.awaitingFog=true;
    history.fogSourceCard=sourceCard;
    history.fogSourceHandIndex=handIndex;
    actions.set(action,{kind:'fog-item',seat,turn:state.turn,
      chosen:view.ownHand[handIndex],sourceCard,sourceHandIndex:handIndex,
      sourcePrinting:sourceCard.fullName});
    audit.fogItemRootProposals++;
    return action;
  }
  function dispatch(action,...rest) {
    if(action?.constructor?.name==='AddPlayerAction'&&this!==live) {
      live=this;
      searchedPhysicalCards.clear();
      // No previous Store's same-turn Fog usage can carry into a new game.
      perOwner.clear();
    }
    const choice=this===live?actions.get(action):null;
    // Evidence is checked against the same physical Card reference revealed
    // by the native owner-deck prompt. Equal printing names do not suffice.
    const player=this===live&&action?.constructor?.name==='PlayCardAction'?
      this.state?.players?.find(p=>p.id===action.id):null;
    const played=player?.hand?.cards?.[action.handIndex]??null;
    const queued=searchedPhysicalCards.get(player?.id)??[];
    const consumed=queued.find(entry=>entry.card===played)??null;
    if(!choice) {
      const result=originalDispatch.value.apply(this,[action,...rest]);
      if(consumed) {
        audit.postSearchPhysicalCardPlays++;
        audit.postSearchPhysicalEvents.push({
          sourceFogTurn:consumed.sourceTurn,
          actualPlayTurn:this.state.turn,seat:consumed.seat,
          printing:consumed.printing,action:action.constructor.name,
          destinationSlot:action.target?.slot??null,
          nativeStoreAccepted:true
        });
        queued.splice(queued.indexOf(consumed),1);
      }
      return result;
    }
    const {selectedCard,sourceCard,...logged}=choice;
    try {
      if(choice.kind==='fog-item'&&played!==sourceCard)
        throw new Error('Fog Crystal physical source Card changed before Store dispatch');
      if(choice.kind==='fog-search'){
        const owner=this.state?.players?.[choice.seat];
        const prompt=this.state?.prompts?.find(item=>item.id===action.id);
        if(!owner||!prompt||prompt.sourceCard!==sourceCard||
           prompt.playerId!==owner.id||prompt.cards!==owner.deck)
          throw new Error('Fog Crystal search prompt lost its exact physical source/owner/deck binding');
        if(selectedCard&&!prompt.cards.cards.includes(selectedCard))
          throw new Error('Fog Crystal target is no longer the exact offered Card object');
        if(!prompt.validate(action.result,this.state))
          throw new Error('Fog Crystal target fails native prompt validation at dispatch');
      }
      const result=originalDispatch.value.apply(this,[action,...rest]);
      if(choice.kind==='fog-item'){
        const history=perOwner.get(player.id);
        if(history){
          history.fogSourceCard=sourceCard;
          history.fogSourceHandIndex=choice.sourceHandIndex;
          history.awaitingFog=true;
        }
        audit.fogItemRootNativeAccepted++;
        audit.sourceCardBindingAccepted++;
        audit.sourceCardBindingEvents.push({kind:'fog-item',seat:choice.seat,
          turn:choice.turn,sourcePrinting:choice.sourcePrinting,
          sourceHandIndex:choice.sourceHandIndex,sourceCardBound:true});
      } else {
        audit.fogPromptNativeAccepted++;
        const owner=this.state.players[choice.seat];
        const history=perOwner.get(owner.id);
        if(history){
          history.awaitingFog=false;
          history.fogSourceCard=null;
          history.fogSourceHandIndex=null;
          history.promptPendingId=null;
        }
        if(selectedCard) {
          const id=this.state.players[choice.seat].id;
          const previous=searchedPhysicalCards.get(id)??[];
          previous.push({card:selectedCard,printing:choice.chosen,
            sourceTurn:choice.turn,seat:choice.seat});
          searchedPhysicalCards.set(id,previous);
        }
      }
      audit.events.push({...logged,nativeStoreAccepted:true});
      return result;
    }catch(err) {
      audit.rejectedNativeChoices++;
      if(choice.kind==='fog-item'){
        const history=perOwner.get(player?.id);
        if(history){
          history.itemUsed=false;history.awaitingFog=false;
          history.fogSourceCard=null;history.fogSourceHandIndex=null;
        }
      }else if(choice.kind==='fog-search'){
        const owner=this.state?.players?.[choice.seat];
        const history=owner?perOwner.get(owner.id):null;
        if(history){
          history.awaitingFog=false;history.fogSourceCard=null;
          history.fogSourceHandIndex=null;history.promptPendingId=null;
        }
      }
      audit.events.push({...logged,nativeStoreAccepted:false,
        error:String(err?.message??err)});
      throw err;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...originalBot,value:decoded});
  if(nativeAorItemLock)
    Object.defineProperty(SimpleTacticsAi.prototype,'isValidAction',{
      ...originalValidity,value:validNativeItem});
  Object.defineProperty(Store.prototype,'dispatch',{
    ...originalDispatch,value:dispatch});
  try{return {result:run(),audit};}
  finally {
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decoded);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    if(nativeAorItemLock){
      assert.strictEqual(SimpleTacticsAi.prototype.isValidAction,validNativeItem);
      Object.defineProperty(SimpleTacticsAi.prototype,'isValidAction',
        originalValidity);
    }
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',originalBot);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
  }
}
module.exports={VERSION,chooseFogPrinting,withActorFogCrystalPrompt};
