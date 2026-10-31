'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent4-plumeria-native-owner-opportunity-v1';
const PRINTING = 'Plumeria BUS';
const MAX_EXAMPLES = 128;

/**
 * Read public attached physical Energy cards by occupied board location.
 * Never inspect opponent concealed cards, deck or Prize identities.
 * @param {object} player Native player.
 * @returns {object[]}
 */
function visibleEnergyTargets(player) {
  const slots = [{slot:'active',index:0,board:player.active},
    ...player.bench.map((board,index)=>({slot:'bench',index,board}))];
  return slots.filter(row=>row.board?.getPokemonCard?.())
    .map(({slot,index,board})=>({
      slot,index,printing:board.getPokemonCard().fullName,
      energies:board.energies.cards.map(card=>card.fullName)
    }));
}

/**
 * A physical-cost summary of two Supporters at the same *actual* owner root.
 * All names, hand indices, and target Energy counts belong to the acting
 * owner or to public board state. The genuine Store's \`canPlay\` is observed,
 * while the paper first-turn Supporter rule is screened separately.
 *
 * @param {object} store Native Store.
 * @param {object} state Native State.
 * @param {0|1} seat Actual owner.
 * @param {Array<{handIndex:number,nativeCanPlay:boolean}>} plumeria
 */
function plumeriaFlareCostContour(store,state,seat,plumeria){
  const owner=state.players[seat],opp=state.players[1-seat];
  const hand=owner.hand.cards;
  const flare=hand.flatMap((card,index)=>
    card?.fullName==='Team Flare Grunt XY'?[{card,index}]:[]);
  const chooseTwo=n=>n>=2?n*(n-1)/2:0;
  const availableAfterPlumeria=hand.length-1;
  const pairCount=plumeria.length*chooseTwo(availableAfterPlumeria);
  const pairsPreservingFlare=plumeria.length*
    chooseTwo(availableAfterPlumeria-flare.length);
  const paperScreen=state.turn!==1&&owner.supporterTurn===0;
  const flareOffers=flare.map(({card,index})=>{
    let nativeCanPlay=null,nativeError=null;
    try{nativeCanPlay=card.canPlay(store,state,owner)===true;}
    catch(error){nativeError=String(error?.message??error);}
    return {handIndex:index,nativeCanPlay,nativeError};
  });
  const targets=visibleEnergyTargets(opp);
  const activeEnergyTargets=targets.filter(t=>t.slot==='active')
    .reduce((n,t)=>n+t.energies.length,0);
  const benchEnergyTargets=targets.filter(t=>t.slot==='bench')
    .reduce((n,t)=>n+t.energies.length,0);
  return {
    plumeriaHeld:plumeria.length,flareHeld:flare.length,
    plumeriaHandIndices:plumeria.map(p=>p.handIndex),
    flareHandIndices:flareOffers.map(o=>o.handIndex),
    totalPhysicalPlumeriaPaymentPairs:pairCount,
    plumeriaPaymentPairsConsumingFlare:pairCount-pairsPreservingFlare,
    plumeriaPaymentPairsPreservingFlare:pairsPreservingFlare,
    publicActiveEnergyTargets:activeEnergyTargets,
    publicBenchEnergyTargets:benchEnergyTargets,
    nativePlayablePlumeria:plumeria.filter(p=>p.nativeCanPlay).length,
    nativePlayableFlare:flareOffers.filter(p=>p.nativeCanPlay).length,
    paperScreenedBothPlayable:paperScreen&&
      plumeria.some(p=>p.nativeCanPlay)&&
      flareOffers.some(p=>p.nativeCanPlay),
    flareOffers,nativeOutcomeUnverified:true
  };
}

/**
 * Native-pinned, printed Plumeria viability at a genuine owner root.
 * This identifies actual legal *mechanical* offers, not good discard choices.
 * @param {object} store Authenticated Store.
 * @param {object} state Authenticated State.
 * @param {0|1} seat Actual acting seat.
 * @returns {object}
 */
function plumeriaOwnerOpportunity(store,state,seat) {
  assert.ok(seat===0||seat===1);
  const owner=state.players[seat],opp=state.players[1-seat];
  const targetGeometry=visibleEnergyTargets(opp);
  const offered=[];
  for(let handIndex=0;handIndex<owner.hand.cards.length;handIndex++){
    const card=owner.hand.cards[handIndex];
    if(card?.fullName!==PRINTING)continue;
    let nativeCanPlay=null,nativeError=null;
    try{
      nativeCanPlay=card.canPlay(store,state,owner)===true;
    }catch(error){
      nativeError=String(error?.message??error);
    }
    offered.push({handIndex,printing:PRINTING,nativeCanPlay,nativeError});
  }
  return {
    seat,turn:state.turn,
    ownerHandCount:owner.hand.cards.length,
    ownerOtherCards:Math.max(0,owner.hand.cards.length-1),
    supporterQuotaOpen:owner.supporterTurn===0,
    paperFirstPlayerRestriction:state.turn===1,
    opponentEnergyTargets:targetGeometry.filter(row=>row.energies.length),
    heldCopies:offered.length,
    nativePlayableCopies:offered.filter(x=>x.nativeCanPlay===true).length,
    paperScreenedCopies:state.turn===1?0:
      offered.filter(x=>x.nativeCanPlay===true).length,
    offered,
    plumeriaFlareContest:plumeriaFlareCostContour(store,state,seat,offered),
    tacticalDiscardValueUnverified:true
  };
}

/**
 * Reversible read-only actor-root and Store receipt monitor.
 * Does not change any action, prompt, game state, or decision policy.
 * @template T
 * @param {()=>T} execute Synchronous native match.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,GamePhase?:object,
 *   sourceSeat?:0|1|null}} [deps] Optional real-component injection.
 * @returns {{result:T,audit:object}}
 */
function withPlumeriaOwnerOpportunity(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??require(path.join(base,
    'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(path.join(base,
    'game/store/store')).Store;
  const GamePhase=deps.GamePhase??require(path.join(base,
    'game/store/state/state')).GamePhase;
  const sourceSeat=deps.sourceSeat??null;
  assert.ok(sourceSeat===null||sourceSeat===0||sourceSeat===1);
  const oldDecode=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldDecode?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  let liveStore=null,game=0,activeChain=null;
  const observedTurns=new Set(),proposals=new WeakMap(),passProposals=new WeakMap();
  const audit={
    version:VERSION,sourceSeat,passive:true,bothSeats:sourceSeat===null,
    nativeStores:0,actualOwnerRoots:0,firstOwnerTurns:0,
    firstTurnHeld:0,firstTurnNativePlayable:0,
    proposedPlumeria:0,acceptedPlumeria:0,rejectedPlumeria:0,
    acceptedPassWithPlayable:0,acceptedPassWithHeld:0,
    promptTransitions:0,settledEnergyDiscards:0,
    nativePositiveSamples:[],acceptedPassSamples:[],playedSamples:[],
    errorSamples:[],competitiveQualified:false,
    note:'Only authentic native canPlay and later physical outcomes are measured; affordability of discards is not tactical benefit.'
  };
  function decode(state){
    if(state!==liveStore?.state||state.phase!==GamePhase.PLAYER_TURN||
       state.prompts?.some(p=>p.result===undefined))
      return oldDecode.value.call(this,state);
    const seat=state.players?.findIndex(p=>p.id===this.client?.id)??-1;
    if((seat!==0&&seat!==1)||state.activePlayer!==seat||
        (sourceSeat!==null&&sourceSeat!==seat))
      return oldDecode.value.call(this,state);
    const info=plumeriaOwnerOpportunity(liveStore,state,seat);
    audit.actualOwnerRoots++;
    const key=game+':'+state.turn+':'+seat;
    if(!observedTurns.has(key)){
      observedTurns.add(key);audit.firstOwnerTurns++;
      if(info.heldCopies)audit.firstTurnHeld++;
      if(info.paperScreenedCopies)audit.firstTurnNativePlayable++;
    }
    const proposal=oldDecode.value.call(this,state);
    if(info.heldCopies&&audit.nativePositiveSamples.length<MAX_EXAMPLES)
      audit.nativePositiveSamples.push({...info,
        proposedAction:proposal?.constructor?.name??null});
    if(proposal?.constructor?.name==='PassTurnAction'){
      passProposals.set(proposal,{...info,seat,turn:state.turn});
    }else if(proposal?.constructor?.name==='PlayCardAction'){
      const card=state.players[seat].hand.cards[proposal.handIndex];
      if(card?.fullName===PRINTING){
        const witness={seat,turn:state.turn,printing:PRINTING,
          handIndex:proposal.handIndex,nativePlayable:
            info.offered.find(x=>x.handIndex===proposal.handIndex)?.nativeCanPlay??null,
          promptKinds:[],nativeAccepted:false,energyDiscardConfirmed:false,
          ownerDiscardsConfirmed:false,settled:false};
        proposals.set(proposal,witness);
        audit.proposedPlumeria++;
      }
    }
    return proposal;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;game++;audit.nativeStores++;activeChain=null;
    }
    const authentic=this===liveStore;
    const play=authentic?proposals.get(action):null;
    const pass=authentic?passProposals.get(action):null;
    const prompt=authentic&&activeChain&&
       action?.constructor?.name==='ResolvePromptAction'?
       this.state.prompts?.find(p=>p.id===action.id&&p.result===undefined):null;
    const beforeEnergy=authentic&&activeChain?
      visibleEnergyTargets(this.state.players[1-activeChain.seat])
        .reduce((n,x)=>n+x.energies.length,0):null;
    try{
      const result=oldDispatch.value.apply(this,[action,...args]);
      if(play){
        play.nativeAccepted=true;audit.acceptedPlumeria++;
        play.ownerDiscardBefore=this.state.players[play.seat].discard.cards.length;
        play.enemyEnergyBefore=visibleEnergyTargets(
          this.state.players[1-play.seat]).reduce(
          (n,x)=>n+x.energies.length,0);
        activeChain=play;
        if(audit.playedSamples.length<MAX_EXAMPLES)
          audit.playedSamples.push(play);
      }
      if(pass){
        if(pass.heldCopies)audit.acceptedPassWithHeld++;
        if(pass.paperScreenedCopies)audit.acceptedPassWithPlayable++;
        if(pass.paperScreenedCopies&&
           audit.acceptedPassSamples.length<MAX_EXAMPLES)
          audit.acceptedPassSamples.push(pass);
      }
      if(prompt&&activeChain&&prompt.playerId===
          this.state.players[activeChain.seat].id){
        activeChain.promptKinds.push({
          kind:prompt.constructor.name,message:prompt.message});
        audit.promptTransitions++;
        const owner=this.state.players[activeChain.seat];
        const afterEnergy=visibleEnergyTargets(
          this.state.players[1-activeChain.seat]).reduce(
          (n,x)=>n+x.energies.length,0);
        if(afterEnergy<beforeEnergy){
          activeChain.energyDiscardConfirmed=true;
          activeChain.ownerDiscardsConfirmed=
            owner.discard.cards.length>=activeChain.ownerDiscardBefore+2;
          activeChain.settled=activeChain.ownerDiscardsConfirmed&&
            activeChain.promptKinds.length>=3;
          if(activeChain.settled)audit.settledEnergyDiscards++;
          activeChain=null;
        }
      }
      return result;
    }catch(error){
      if(play){
        audit.rejectedPlumeria++;
        if(audit.errorSamples.length<MAX_EXAMPLES)
          audit.errorSamples.push({seat:play.seat,turn:play.turn,
            error:String(error?.message??error)});
      }
      throw error;
    }
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',
    {...oldDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...oldDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent4PlumeriaAudit=audit;
    throw error;
  }finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    Object.defineProperty(Ai.prototype,'decodeNextAction',oldDecode);
  }
}

module.exports={VERSION,PRINTING,visibleEnergyTargets,
  plumeriaFlareCostContour,plumeriaOwnerOpportunity,withPlumeriaOwnerOpportunity};
