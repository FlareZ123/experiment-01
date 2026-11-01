'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorNativeActionReceipt}=
  require('./agent34-actor-only-root-policy.cjs');
const {selectPlumeriaEnergy}=
  require('./agent4-plumeria-after-pass.cjs');

const VERSION='agent41-native-actor-tagged-flare-payment-prompt-v1';
const FLARE='Team Flare Grunt XY';

/**
 * Bridge only a genuinely chosen canonical owner-root Team Flare Grunt
 * PlayCardAction into the original Store's mandatory opponent Active Energy
 * selection prompt. The card itself has zero *additional* owner-hand payment.
 * The source of truth is the physical Energy card moving to the opponent's
 * discard pile, not a successful PlayCardAction callback.
 *
 * The wrapper is both-seat symmetric. No original opposing deck, hand,
 * face-down Prize or other hidden information is inspected.
 *
 * @template T
 * @param {()=>T} work Genuine original native Store continuation.
 * @param {object} [deps] Narrow pure-test dependency seam.
 * @returns {{result:T,audit:object}}
 */
function withNativeActorFlarePrompt(work,deps={}){
  assert.equal(typeof work,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const engine=p=>require(path.join(base,p));
  const Ai=deps.Ai??engine('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??engine('game/store/store').Store;
  const {PlayCardAction}=deps.cardActions??
    engine('game/store/actions/play-card-action');
  const ResolvePromptAction=deps.ResolvePromptAction??
    engine('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const GamePhase=deps.GamePhase??
    engine('game/store/state/state').GamePhase;
  const selector=deps.selectEnergy??selectPlumeriaEnergy;
  const getReceipt=deps.actorReceipt??actorNativeActionReceipt;
  const decodeDescriptor=Object.getOwnPropertyDescriptor(
    Ai.prototype,'decodeNextAction');
  const dispatchDescriptor=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof decodeDescriptor?.value,'function');
  assert.equal(typeof dispatchDescriptor?.value,'function');

  let liveStore=null,pendingFlare=null;
  const proposedPrompts=new WeakMap();
  const audit={version:VERSION,
    nativeRootAccepted:0,nativeRootRejected:0,
    nativeEnergyPromptsAccepted:0,physicallySettledActiveEnergy:0,
    nativeUnresolvedChains:0,
    bySeat:[{accepted:0,settled:0},{accepted:0,settled:0}],
    receipts:[],hiddenOpponentZonesRead:false,qualified:false};

  /** @param {object} chain A native accepted original Store Flare root. */
  function recordSettlement(chain,selected){
    const opposing=liveStore.state.players[1-chain.seat];
    const exact=selected??chain.attachedBefore.find(card=>
      opposing.discard.cards.includes(card)&&
      !opposing.active.energies.cards.includes(card));
    if(!exact||!chain.attachedBefore.includes(exact)||
       !opposing.discard.cards.includes(exact)||
       opposing.active.energies.cards.includes(exact))return false;
    audit.physicallySettledActiveEnergy++;
    audit.bySeat[chain.seat].settled++;
    if(audit.receipts.length<32)audit.receipts.push({
      kind:'native-flare-physical-energy-settlement',
      seat:chain.seat,turn:chain.turn,
      actionOrdinal:chain.policyDecisionOrdinal,
      printing:exact.fullName,
      ownerAdditionalHandPayment:0,
      nativePromptUsed:selected!==null
    });
    pendingFlare=null;
    return true;
  }

  function decode(state,...args){
    const original=decodeDescriptor.value.call(this,state,...args);
    if(state!==liveStore?.state||!pendingFlare||
       state.phase!==GamePhase.PLAYER_TURN||
       state.activePlayer!==pendingFlare.seat)return original;
    const active=state.prompts?.find(p=>p.result===undefined);
    if(active?.playerId!==state.players[pendingFlare.seat]?.id)
      return original;
    const energy=selector(state,pendingFlare.seat);
    if(!Array.isArray(energy)||energy.length!==1||
       active.validate(energy,state)!==true)return original;
    const selected=energy[0];
    if(!pendingFlare.attachedBefore.includes(selected))return original;
    const action=new ResolvePromptAction(active.id,energy);
    proposedPrompts.set(action,{
      chain:pendingFlare,selectedEnergy:selected,
      activePromptId:active.id
    });
    return action;
  }

  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&
       this!==liveStore){
      liveStore=this;pendingFlare=null;
    }
    if(this!==liveStore)
      return dispatchDescriptor.value.apply(this,[action,...args]);

    const prompt=proposedPrompts.get(action);
    const tag=action instanceof PlayCardAction?getReceipt(action):null;
    const seat=tag?.seat;
    const isFlare=tag?.kind==='play-team-flare-grunt-denial'&&
      tag?.printing===FLARE&&(seat===0||seat===1)&&
      this.state.activePlayer===seat&&
      this.state.phase===GamePhase.PLAYER_TURN&&
      Number.isSafeInteger(tag.handIndex)&&tag.handIndex>=0;
    let started=null;
    if(isFlare){
      const owner=this.state.players[seat];
      const physical=owner?.hand?.cards?.[tag.handIndex];
      if(physical?.fullName===FLARE)
        started={seat,turn:this.state.turn,physical,
          owner,policyDecisionOrdinal:tag.policyDecisionOrdinal,
          attachedBefore:[...this.state.players[1-seat].active.energies.cards]};
    }
    let out;
    try{out=dispatchDescriptor.value.apply(this,[action,...args]);}
    catch(error){
      if(started) {
        audit.nativeRootRejected++;
        if(audit.receipts.length<32)audit.receipts.push({
          kind:'native-flare-Store-rejection',seat:started.seat,
          turn:started.turn,error:String(error?.message??error)
        });
      }
      throw error;
    }
    if(started){
      assert.ok(!started.owner.hand.cards.includes(started.physical),
        'Native original Store must physically spend the chosen Team Flare');
      audit.nativeRootAccepted++;
      audit.bySeat[started.seat].accepted++;
      if(audit.receipts.length<32)audit.receipts.push({
        kind:'native-flare-Store-root-accepted',
        seat:started.seat,turn:started.turn,
        policyDecisionOrdinal:started.policyDecisionOrdinal,
        zeroAdditionalHandPayment:true
      });
      pendingFlare=started;
      recordSettlement(started,null);
    }else if(prompt){
      audit.nativeEnergyPromptsAccepted++;
      recordSettlement(prompt.chain,prompt.selectedEnergy);
    }
    return out;
  }

  Object.defineProperty(Ai.prototype,'decodeNextAction',
    {...decodeDescriptor,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...dispatchDescriptor,value:dispatch});
  let result;
  try{return {result:result=work(),audit:{
    ...audit,
    nativeUnresolvedChains:pendingFlare?1:0
  }};}
  finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',dispatchDescriptor);
    Object.defineProperty(Ai.prototype,'decodeNextAction',decodeDescriptor);
  }
}

module.exports={VERSION,FLARE,withNativeActorFlarePrompt};
