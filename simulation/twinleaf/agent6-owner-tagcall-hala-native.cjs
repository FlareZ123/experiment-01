'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {actorSingleSearchInput,physicalBundleForPrintings}=
  require('./agent41-actor-owner-single-search.cjs');
const {
  VERSION:OFFER_VERSION,TAG_CALL,GUZMA_HALA,
  offerOwnerTagCallHala,chooseAuthenticatedTagCallHala
}=require('./agent6-owner-tagcall-hala-offer.cjs');

const VERSION='agent6-owner-tagcall-hala-both-seat-native-v1';
const digest=obj=>createHash('sha256')
  .update(JSON.stringify(obj)).digest('hex');

/**
 * A reversible original pinned Store action-execution layer for both
 * physical seats. It may replace a baseline first-owner-root choice with
 * genuine Tag Call when the pure K0 selector offers that narrow line.
 * Only the native Store knows the physical deck. An accepted Tag Call
 * opens a native owner-deck prompt; the K1 selector only sees its legally
 * revealed, canonically ordered offered card printings. Native prompt
 * validation translates the chosen printing back to physical objects.
 *
 * Forced selection is a development treatment, not a proved optimal
 * policy. The identity of the source/opponent and rank is never read
 * inside this wrapper; each seat gets its own known registered 60.
 *
 * @template T
 * @param {string[][]} ownRegisteredSixtiesBySeat Own known 60 for seats 0 and 1.
 * @param {()=>T} execute Synchronous pinned native match.
 * @param {object} [deps] Optional injected pinned interfaces for unit tests.
 * @returns {{result:T,audit:object}}
 */
function withOwnerTagCallHala(ownRegisteredSixtiesBySeat,execute,deps={}){
  assert.equal(typeof execute,'function');
  assert.equal(ownRegisteredSixtiesBySeat?.length,2);
  assert.ok(ownRegisteredSixtiesBySeat.every(cards=>
    Array.isArray(cards)&&cards.length===60&&
    cards.every(x=>typeof x==='string')));
  const base=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const engine=name=>require(path.join(base,name));
  const {SimpleTacticsAi}=deps.SimpleTacticsAi??
    engine('simple-bot/simple-tactics-ai');
  const {Store}=deps.Store??engine('game/store/store');
  const {GamePhase}=deps.GamePhase??engine('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=
    deps.playActions??engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=deps.ResolvePromptAction?
    {ResolvePromptAction:deps.ResolvePromptAction}:
    engine('game/store/actions/resolve-prompt-action');
  const bot=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const dispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof bot?.value,'function');
  assert.equal(typeof dispatch?.value,'function');
  const counts=()=>({
    ownerRoots:0,heldTagRoots:0,eligibleRoots:0,selectedRoots:0,
    acceptedRoots:0,presentedOwnerDeckPrompts:0,
    selectedGHDeckPrompts:0,acceptedGHDeckPrompts:0,
    promptTargetAbsent:0,nativePromptFallbacks:0,
    missingAcceptedOwnerPrompt:0,storeRejectedRoots:0,
    storeRejectedPrompts:0,physicalGHHandGained:0
  });
  const audit={version:VERSION,offerVersion:OFFER_VERSION,
    ownerBySeat:{0:counts(),1:counts()},
    firstAcceptedNativePairBySeat:{0:null,1:null},
    firstUnavailableGHBySeat:{0:null,1:null},
    firstRootOfferedBySeat:{0:null,1:null},
    nativeErrors:[],nativeFallbacks:0,
    actorSource:'detached-owner-observation-with-registered-own-sixty',
    secondaryTagTeamPriority:[...(deps.secondaryTagTeamPriority??[])],
    nonOwnerNativeDelegations:0,nonLiveSpeculativeDelegations:0,
    nativeRootSelectionDoesNotEstablishDominance:true,
    competitiveQualifiedGames:0};
  const tagActions=new WeakMap(),promptActions=new WeakMap();
  const tokenByOwner=new Map();
  let liveStore=null;

  function decode(state){
    if(state!==liveStore?.state){
      audit.nonLiveSpeculativeDelegations++;
      return bot.value.call(this,state);
    }
    const seat=state.players?.findIndex(x=>x.id===this.client?.id)??-1;
    if(seat<0){
      audit.nonOwnerNativeDelegations++;
      return bot.value.call(this,state);
    }
    const owner=state.players[seat];
    const pending=state.prompts?.find(p=>p.result===undefined);
    const token=tokenByOwner.get(owner.id);
    if(pending&&token&&pending.id===token.ownerPromptId&&
      pending.playerId===owner.id){
      const offered=actorSingleSearchInput(state,seat);
      const chosen=offered?
        chooseAuthenticatedTagCallHala(offered,token,{
          secondaryTagTeamPriority:deps.secondaryTagTeamPriority??[]
        }):null;
      if(chosen!==null){
        const physical=chosen.printings?
          physicalBundleForPrintings(pending,chosen.printings):
          chosen.indices?.map(index=>{
            const row=offered.prompt.offered[index];
            assert.ok(row?.selectableAlone);
            return pending.cards.cards.find(card=>
              card.fullName===row.printing&&
              pending.validate([card],state));
          });
        assert.ok(Array.isArray(physical)&&
          physical.length>0&&physical.every(Boolean));
        assert.ok(pending.validate(physical,state),
          'Native Tag Call owner deck rejected selected G&H');
        assert.ok(physical.some(card=>card.fullName===GUZMA_HALA));
        const action=new ResolvePromptAction(pending.id,physical);
        promptActions.set(action,{seat,ownerId:owner.id,
          promptId:pending.id,
          firstRootTurn:token.globalTurn,
          rootViewDigest:token.viewDigest,
          selectedPrintings:physical.map(c=>c.fullName),
          preGHHand:owner.hand.cards
            .filter(c=>c.fullName===GUZMA_HALA).length});
        audit.ownerBySeat[seat].selectedGHDeckPrompts++;
        return action;
      }
      audit.ownerBySeat[seat].promptTargetAbsent++;
      if(audit.firstUnavailableGHBySeat[seat]===null)
        audit.firstUnavailableGHBySeat[seat]={
          seat,globalTurn:token.globalTurn,
          rootViewDigest:token.viewDigest,
          promptId:pending.id,
          publiclyKnownDeckCount:owner.deck.cards.length,
          ownerK1SearchTargetAbsent:true
        };
      tokenByOwner.delete(owner.id);
      audit.ownerBySeat[seat].nativePromptFallbacks++;
      return bot.value.call(this,state);
    }
    if(pending||state.activePlayer!==seat||
      state.phase!==GamePhase.PLAYER_TURN){
      audit.nonOwnerNativeDelegations++;
      return bot.value.call(this,state);
    }
    // Root decisions know only the detached owner view. The native Store
    // receives the physical card index after the pure plan is complete.
    const view=actorObservation(state,seat);
    const count=audit.ownerBySeat[seat];
    count.ownerRoots++;
    if(view.ownHand.includes(TAG_CALL))count.heldTagRoots++;
    const offer=offerOwnerTagCallHala(view,
      ownRegisteredSixtiesBySeat[seat]);
    if(!offer.eligible)return bot.value.call(this,state);
    count.eligibleRoots++;
    const ownerId=owner.id;
    const action=new PlayCardAction(ownerId,offer.action.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    const viewDigest=digest(view);
    tagActions.set(action,{seat,ownerId,
      handIndex:offer.action.handIndex,
      globalTurn:view.globalTurn,viewDigest,
      ownerVisibleTargetUncertain:offer.sourceVisibility,
      openingTargetProbability:offer.targetDeckPresence});
    if(audit.firstRootOfferedBySeat[seat]===null)
      audit.firstRootOfferedBySeat[seat]={
        seat,globalTurn:view.globalTurn,
        viewDigest,sourceVisibility:offer.sourceVisibility,
        targetProbability:offer.targetDeckPresence
      };
    count.selectedRoots++;
    return action;
  }

  function dispatchObserved(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!liveStore)
      liveStore=this;
    const root=this===liveStore?tagActions.get(action):undefined;
    const prompt=this===liveStore?promptActions.get(action):undefined;
    try{
      const result=dispatch.value.apply(this,[action,...args]);
      if(root){
        const count=audit.ownerBySeat[root.seat];
        count.acceptedRoots++;
        const owner=this.state.players[root.seat];
        const pending=this.state.prompts?.find(p=>
          p.result===undefined&&p.playerId===root.ownerId&&
          p.constructor?.name==='ChooseCardsPrompt'&&
          p.cards===owner.deck);
        if(pending){
          count.presentedOwnerDeckPrompts++;
          tokenByOwner.set(root.ownerId,Object.freeze({
            acceptedNativeTagCall:true,actorSeat:root.seat,
            originPrinting:TAG_CALL,ownerPromptId:pending.id,
            globalTurn:root.globalTurn,viewDigest:root.viewDigest}));
        }else count.missingAcceptedOwnerPrompt++;
      }
      if(prompt){
        const count=audit.ownerBySeat[prompt.seat];
        count.acceptedGHDeckPrompts++;
        const owner=this.state.players[prompt.seat];
        const afterGH=owner.hand.cards
          .filter(c=>c.fullName===GUZMA_HALA).length;
        if(afterGH>prompt.preGHHand)
          count.physicalGHHandGained++;
        if(audit.firstAcceptedNativePairBySeat[prompt.seat]===null)
          audit.firstAcceptedNativePairBySeat[prompt.seat]={
            seat:prompt.seat,globalTurn:prompt.firstRootTurn,
            rootViewDigest:prompt.rootViewDigest,
            ownerPromptId:prompt.promptId,
            selectedPrintings:prompt.selectedPrintings,
            nativePromptAccepted:true,
            immediatePhysicalGHHandGained:afterGH>prompt.preGHHand
          };
        tokenByOwner.delete(prompt.ownerId);
      }
      return result;
    }catch(error){
      if(root||prompt){
        const seat=(root??prompt).seat;
        if(root)audit.ownerBySeat[seat].storeRejectedRoots++;
        if(prompt)audit.ownerBySeat[seat].storeRejectedPrompts++;
        audit.nativeErrors.push({seat,
          stage:root?'tag-call-root':'gh-owner-deck-prompt',
          error:String(error?.message??error).slice(0,600)});
      }
      throw error;
    }
  }

  Object.defineProperty(Store.prototype,'dispatch',{
    ...dispatch,value:dispatchObserved});
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...bot,value:decode});
  try{
    return {result:execute(),audit};
  }catch(error){
    error.ownerTagCallHalaNativeAudit={...audit};
    throw error;
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatchObserved);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',bot);
    Object.defineProperty(Store.prototype,'dispatch',dispatch);
  }
}

module.exports={VERSION,withOwnerTagCallHala};
