'use strict';

const assert=require('node:assert/strict');
const nodePath=require('node:path');
const {actorObservation}=
  require('./actor-observation-contract.cjs');
const {paysWithBasics}=
  require('./agent7-actor-free-retreat-frontier.cjs');
const {beforeAcceptedTarget,afterAcceptedTarget}=
  require('./native-accepted-target-sidecar.cjs');
const {verifiedBasicRecipient}=
  require('../evaluation/agent6-rank1-rank3-energy-recipient-aba.cjs');

const VERSION='agent6-original-basic-attachment-native-effective-retreat-audit-v1';
const native=name=>require(nodePath.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));

/**
 * Only an observed original own-Basic attachment root is eligible. All
 * candidate alternative costs are nominal, including the potential retarget
 * to Active and the future retreat/attack. Never present a hypothetical
 * alternative as a Store-accepted or paper-legal action.
 *
 * @param {object} view Frozen detached owner-only game state before dispatch.
 * @param {object} catalog Native public card print and Energy type registry.
 * @param {number[]} fee Actual native CheckRetreatCostEffect result.
 * @param {object|null} receipt Post-Store original physical Basic attachment.
 * @returns {object} Owner-readable opportunity-stage receipt.
 */
function classifyBasicAttachmentRetreatReserve(view,catalog,fee,receipt){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active;
  const resources=view.ownTurnResources;
  const attached=active?.energies;
  const basicOnly=Array.isArray(attached)&&
    attached.every(printing=>catalog.basicEnergies.has(printing));
  const costKnown=Array.isArray(fee)&&fee.length>0&&
    fee.every(unit=>unit===catalog.colorlessEnergyType);
  const oneBasicShort=basicOnly&&costKnown&&
    fee.length===attached.length+1;
  const retreatWindow=Boolean(view.globalTurn>1&&resources&&
    Number.isSafeInteger(resources.retreatedTurn)&&
    resources.retreatedTurn!==view.globalTurn&&
    (own.publicTurnRestrictions?.attackLockTurnsRemaining??0)===0&&
    active?.publicRestrictions?.cannotRetreatNextTurn!==true&&
    active?.publicRestrictions?.cannotRetreatWhileActive!==true&&
    !active?.specialConditions?.some(s=>
      s===catalog.specialConditions?.ASLEEP||
      s===catalog.specialConditions?.PARALYZED));
  const usableBench=[];
  for(const [benchIndex,pokemon] of (own?.bench??[]).entries()){
    if(!pokemon||!Array.isArray(pokemon.energies)||
      pokemon.publicRestrictions?.cannotAttackNextTurn===true||
      pokemon.specialConditions?.some(s=>
        s===catalog.specialConditions?.ASLEEP||
        s===catalog.specialConditions?.PARALYZED))continue;
    for(const attack of pokemon.attacks??[]){
      if(attack.gxAttack===true||
         !Number.isSafeInteger(attack.damage)||attack.damage<=0||
         attack.damageCalculation!==null&&
           attack.damageCalculation!==undefined||
         pokemon.publicRestrictions?.blockedAttackNameNextTurn===
           attack.name||
         pokemon.publicRestrictions?.blockedAttackNameUntilLeavesActive===
           attack.name||
         pokemon.publicRestrictions?.cannotUseAttacksNextTurn?.includes(
           attack.name)||
         pokemon.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
           pokemon.publicRestrictions.onlyAllowedAttackNameNextTurn!==
             attack.name||
         !paysWithBasics(pokemon,attack,catalog))continue;
      usableBench.push({
        benchIndex,pokemonPrinting:pokemon.printing,
        attackName:attack.name,printedDamage:attack.damage
      });
    }
  }
  const actualBenchAttachment=Boolean(receipt&&
    receipt.actorSeat===view.actorSeat&&receipt.position==='bench');
  const stages={
    originalPhysicallyAttachedToBench:actualBenchAttachment,
    nativePositiveColorlessRetreatFee:costKnown,
    exactlyOneBasicShortBeforeAttachment:oneBasicShort,
    ownerCanRetreatThisTurn:retreatWindow,
    previouslyFundedPositiveBenchAttack:usableBench.length>0
  };
  const nominalReserveOpportunity=Object.values(stages).every(Boolean);
  const target=view.opponentPublic?.active;
  const remaining=Number.isSafeInteger(target?.hp)&&
    Number.isSafeInteger(target?.damage)&&
    target.hp>target.damage?target.hp-target.damage:null;
  return {
    version:VERSION,actorSeat:view.actorSeat,
    turn:view.globalTurn,
    ownerActivePrinting:active?.printing??null,
    printedRetreatCost:active?.printed?.retreatCost??null,
    actualNativeEffectiveRetreatCost:costKnown?[...fee]:null,
    activeAttachedBasicCount:basicOnly?attached.length:null,
    actualOriginalRecipient:receipt?{
      position:receipt.position,benchIndex:receipt.benchIndex,
      printing:receipt.ownerHandPrinting
    }:null,
    knownFundedBenchAttacks:usableBench,
    opponentRemainingHP:remaining,
    stages,nominalReserveOpportunity,
    paperAlternativeAttachmentCertified:false,
    nativeAlternativeRetreatOrAttackSettled:false
  };
}

/**
 * Store-dispatch-only research witness. It observes the original owner
 * PlayCardAction, uses the native retreat-cost reducer read-only, then
 * verifies what Basic recipient was actually physically attached.
 * It never changes the chosen action or returns observations to the policy.
 *
 * @template T
 * @param {()=>T} execute Original unmodified native game.
 * @param {{Store?:Function,CheckRetreatCostEffect?:Function,
 *   catalog?:object,observe?:Function}} deps Pure-test seams.
 * @returns {{result:T,audit:object}} Original result and passive evidence.
 */
function withAcceptedBasicRetreatReserveWitness(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??native('game/store/store').Store;
  const CheckRetreatCostEffect=deps.CheckRetreatCostEffect??
    native('game/store/effects/check-effects').CheckRetreatCostEffect;
  const catalog=deps.catalog??
    require('./agent2-bilateral-multi-basic-retreat-bot.cjs')
      .nativePublicCatalog();
  const observe=deps.observe??actorObservation;
  const original=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const entries=[];
  let activeStore=null,dispatchOrdinal=0;
  function dispatch(action,...args){
    const type=action?.constructor?.name;
    if(!activeStore&&type==='AddPlayerAction')
      activeStore=this;
    if(this!==activeStore)
      return original.value.call(this,action,...args);
    dispatchOrdinal++;
    const state=this.state;
    let pending=null;
    if(type==='PlayCardAction'){
      const actorId=state.prompts?.find(p=>p.result===undefined)
        ?.playerId??action.clientId??action.id;
      const seat=state.players.findIndex(player=>player.id===actorId);
      if(seat===0||seat===1){
        const handCard=state.players[seat].hand.cards[action.handIndex];
        const printing=handCard?.fullName;
        if(catalog.basicEnergies.has(printing)){
          const view=observe(state,seat);
          const unchanged=JSON.stringify(view);
          const checker=new Store({onStateChange(){}});
          checker.state=state;
          const costEffect=new CheckRetreatCostEffect(
            state.players[seat]);
          checker.reduceEffect(state,costEffect);
          assert.equal(JSON.stringify(observe(state,seat)),unchanged,
            'retreat fee preflight mutated owner-observed state');
          assert.ok(Array.isArray(costEffect.cost));
          const before=beforeAcceptedTarget(
            state,action,seat,dispatchOrdinal,state.turn);
          pending={view,fee:[...costEffect.cost],before,printing};
        }
      }
    }
    const result=original.value.call(this,action,...args);
    if(pending){
      const event=afterAcceptedTarget(pending.before,this.state);
      const physical=verifiedBasicRecipient(event);
      entries.push({
        storeDispatchOrdinal:pending.before.actionOrdinal,
        originalOwnerPrinting:pending.printing,
        nativeOriginalStoreAccepted:event.storeAccepted,
        actualPhysicalBasicAttachment:physical!==null,
        sourceOwnerSeat:pending.view.actorSeat,
        stages:classifyBasicAttachmentRetreatReserve(
          pending.view,catalog,pending.fee,physical)
      });
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...original,value:dispatch
  });
  try{
    const result=execute();
    return {result,audit:{
      version:VERSION,
      nativeOriginalBasicPlayRoots:entries.length,
      physicalBasicAttachments:entries.filter(x=>
        x.actualPhysicalBasicAttachment).length,
      nominalReserveOpportunities:entries.filter(x=>
        x.stages.nominalReserveOpportunity).length,
      entries,
      neverIntervenedInPolicy:true,
      competitivelyQualifiedGames:0
    }};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

module.exports={VERSION,classifyBasicAttachmentRetreatReserve,
  withAcceptedBasicRetreatReserveWitness};
