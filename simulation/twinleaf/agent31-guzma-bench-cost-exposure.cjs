'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=
  require('./actor-observation-contract.cjs');
const {isGuzma}=
  require('./agent2-held-guzma-mobility-frontier.cjs');
const {paysWithBasics}=
  require('./agent7-actor-free-retreat-frontier.cjs');
const {ROOT_ACTIONS}=
  require('./agent2-native-owner-supporter-opportunity.cjs');

const VERSION='agent31-guzma-bench-basic-energy-cost-exposure-v1';

/**
 * Count printed Bench attack costs payable with attached Basic Energy cards.
 * Variable-damage and text-bearing attacks are intentionally included.
 * This tests Energy feasibility only. Status, one-use GX availability,
 * retreat, and the actual native AttackAction remain unverified.
 *
 * @param {object} view Deeply detached acting-owner public board/own hand.
 * @param {object} catalog Public printed energy-type catalog.
 * @returns {object} A conservative attack-cost exposure reading.
 */
function classifyBenchCostExposure(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,opponent=view.opponentPublic;
  const bench=own?.bench?.filter(Boolean)??[];
  const opponentBench=opponent?.bench?.filter(Boolean)??[];
  const paid=[];
  for(const slot of bench){
    for(const attack of slot.attacks??[]){
      if(!paysWithBasics(slot,attack,catalog))continue;
      paid.push({pokemon:slot.printing,
        name:attack.name,
        positiveBase:Number.isSafeInteger(attack.damage)&&
          attack.damage>0,
        textBearing:typeof attack.text==='string'&&
          attack.text.length>0,
        variableDamage:attack.damageCalculation!==undefined&&
          attack.damageCalculation!==null,
        gxAttack:attack.gxAttack===true});
    }
  }
  const held=Array.isArray(view.ownHand)&&
    view.ownHand.some(isGuzma);
  const resources=view.ownTurnResources;
  const supporterQuotaOpen=view.globalTurn>1&&
    resources?.supporterPlayedTurn===0&&
    resources?.supporterPlayLocked!==true&&
    own?.publicTurnRestrictions?.supporterPlayLocked!==true&&
    (own?.resolvingSupporter?.length??0)===0;
  return {
    gameTurn:view.globalTurn,actorSeat:view.actorSeat,
    heldGuzma:held,
    ownBenchCount:bench.length,
    opponentBenchCount:opponentBench.length,
    benchEnergyCardCount:bench.reduce((n,slot)=>
      n+(slot.energies?.length??0),0),
    benchPokemonWithEnergy:bench.filter(slot=>
      (slot.energies?.length??0)>0).length,
    basicEnergyFundedBenchAttacks:paid.length,
    basicEnergyFundedPositiveBaseAttacks:
      paid.filter(x=>x.positiveBase).length,
    basicEnergyFundedTextBearingAttacks:
      paid.filter(x=>x.textBearing).length,
    basicEnergyFundedVariableDamageAttacks:
      paid.filter(x=>x.variableDamage).length,
    fundedExamples:paid.slice(0,5),
    quotaOpen:supporterQuotaOpen,
    ownerOnly:true,
    hiddenOpponentZonesUnexamined:true
  };
}

/** @param {object[]} events Every held-Guzma owner turn, collapsed. */
function summarizePerGameSeat(events){
  const groups=new Map();
  for(const e of events){
    const key=e.gameId+':'+e.seat;
    let group=groups.get(key);
    if(!group){
      group={gameId:e.gameId,seat:e.seat,heldTurns:0,
        heldRoots:0,heldTurnsWithBenchEnergy:0,
        heldTurnsWithBasicFundedBenchAttack:0,
        heldTurnsWithPositiveBase:0,
        heldTurnsWithTargetAndFundedAttack:0,
        heldTurnsWithTargetQuotaAndFundedAttack:0,
        maxBenchEnergyCards:0,maxBasicFundedBenchAttacks:0};
      groups.set(key,group);
    }
    group.heldTurns++;
    group.heldRoots+=e.heldRoots;
    group.heldTurnsWithBenchEnergy+=Number(e.maxBenchEnergyCards>0);
    group.heldTurnsWithBasicFundedBenchAttack+=
      Number(e.maxFundedAttacks>0);
    group.heldTurnsWithPositiveBase+=Number(e.maxPositiveBase>0);
    group.heldTurnsWithTargetAndFundedAttack+=
      Number(e.anyFundedAndOpponentBench);
    group.heldTurnsWithTargetQuotaAndFundedAttack+=
      Number(e.anyFundedAndOpponentBenchAndQuota);
    group.maxBenchEnergyCards=Math.max(
      group.maxBenchEnergyCards,e.maxBenchEnergyCards);
    group.maxBasicFundedBenchAttacks=Math.max(
      group.maxBasicFundedBenchAttacks,e.maxFundedAttacks);
  }
  return [...groups.values()].sort((a,b)=>
    a.gameId-b.gameId||a.seat-b.seat);
}

/**
 * Observe true native Store dispatches without changing action arguments.
 * A game ID identifies the AddPlayerAction epoch and is useful only after
 * matching it to an exact registered runner trial, not to hidden deck state.
 *
 * @template T
 * @param {()=>T} execute Native match batch, synchronously executed.
 * @param {object} [deps] Test injection of Store, observer or public catalog.
 * @returns {{result:T,audit:object}}
 */
function withGuzmaBenchCostObserver(execute,deps={}){
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(output,
    'game/store/store')).Store;
  const observe=deps.observe??actorObservation;
  const getCatalog=deps.getCatalog??(()=>require(
    './agent43-guzma-prompt-continuation.cjs').publicCatalog());
  const previous=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  const live=new WeakMap();
  const turns=new Map();
  let gameCount=0,rootDispatchCount=0,
    acceptedRoots=0,heldRoots=0,
    catalog=null;
  const summarize=()=>{
    const items=[...turns.values()];
    const perGameSeat=summarizePerGameSeat(items);
    return {
      schema:VERSION,readOnly:true,
      ownerOnly:true,
      gameCount,rootDispatchCount,acceptedRoots,heldRoots,
      uniqueHeldOwnerTurns:items.length,
      heldTurnsWithBenchEnergy:
        items.filter(e=>e.maxBenchEnergyCards>0).length,
      heldTurnsWithBasicFundedBenchAttack:
        items.filter(e=>e.maxFundedAttacks>0).length,
      heldTurnsWithPositiveBase:
        items.filter(e=>e.maxPositiveBase>0).length,
      heldTurnsWithTextBearingAttack:
        items.filter(e=>e.maxTextBearing>0).length,
      heldTurnsWithVariableDamageAttack:
        items.filter(e=>e.maxVariableDamage>0).length,
      heldTurnsWithTargetAndFundedAttack:
        items.filter(e=>e.anyFundedAndOpponentBench).length,
      heldTurnsWithTargetQuotaAndFundedAttack:
        items.filter(e=>e.anyFundedAndOpponentBenchAndQuota).length,
      perGameSeat,
      ownerTurnExamples:items.slice(0,80),
      ownerTurnExamplesTruncated:Math.max(0,items.length-80),
      competitiveQualifiedGames:0,
      caveat:'Basic-Energy printed-cost coverage is an optimistic attack-option screen; text, GX, locks, all damage effects, and legal attack settlement are unverified.'
    };
  };
  function intercepted(action,...args){
    const type=action?.constructor?.name;
    if(type==='AddPlayerAction'&&!live.has(this))
      live.set(this,++gameCount);
    const gameId=live.get(this);
    if(!gameId)return previous.value.call(this,action,...args);
    rootDispatchCount++;
    const state=this.state;
    const seat=state.players?.findIndex(p=>
      p.id===(action?.id??action?.clientId));
    const eligible=ROOT_ACTIONS.has(type)&&
      (seat===0||seat===1)&&state.activePlayer===seat&&
      state.prompts?.every(p=>p.result!==undefined)!==false&&
      Number.isSafeInteger(state.turn)&&state.turn>=1;
    let reading=null;
    if(eligible){
      const view=observe(state,seat);
      catalog??=getCatalog();
      reading=classifyBenchCostExposure(view,catalog);
    }
    let result;
    try{result=previous.value.call(this,action,...args);}
    catch(error){
      if(error&&typeof error==='object')
        error.agent31BenchCostEvidence=summarize();
      throw error;
    }
    if(reading){
      acceptedRoots++;
      if(reading.heldGuzma){
        heldRoots++;
        const key=gameId+':'+seat+':'+reading.gameTurn;
        const prior=turns.get(key)??{
          gameId,seat,turn:reading.gameTurn,heldRoots:0,
          maxOwnBench:0,maxOppBench:0,
          maxBenchEnergyCards:0,maxBenchPokemonWithEnergy:0,
          maxFundedAttacks:0,maxPositiveBase:0,
          maxTextBearing:0,maxVariableDamage:0,
          anyFundedAndOpponentBench:false,
          anyFundedAndOpponentBenchAndQuota:false,
          examples:[]
        };
        prior.heldRoots++;
        prior.maxOwnBench=Math.max(prior.maxOwnBench,
          reading.ownBenchCount);
        prior.maxOppBench=Math.max(prior.maxOppBench,
          reading.opponentBenchCount);
        prior.maxBenchEnergyCards=Math.max(
          prior.maxBenchEnergyCards,reading.benchEnergyCardCount);
        prior.maxBenchPokemonWithEnergy=Math.max(
          prior.maxBenchPokemonWithEnergy,reading.benchPokemonWithEnergy);
        prior.maxFundedAttacks=Math.max(prior.maxFundedAttacks,
          reading.basicEnergyFundedBenchAttacks);
        prior.maxPositiveBase=Math.max(prior.maxPositiveBase,
          reading.basicEnergyFundedPositiveBaseAttacks);
        prior.maxTextBearing=Math.max(prior.maxTextBearing,
          reading.basicEnergyFundedTextBearingAttacks);
        prior.maxVariableDamage=Math.max(prior.maxVariableDamage,
          reading.basicEnergyFundedVariableDamageAttacks);
        prior.anyFundedAndOpponentBench||=
          reading.basicEnergyFundedBenchAttacks>0&&
          reading.opponentBenchCount>0;
        prior.anyFundedAndOpponentBenchAndQuota||=
          reading.basicEnergyFundedBenchAttacks>0&&
          reading.opponentBenchCount>0&&reading.quotaOpen;
        if(prior.examples.length===0&&reading.fundedExamples.length>0)
          prior.examples=reading.fundedExamples;
        turns.set(key,prior);
      }
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...previous,value:intercepted
  });
  try{return {result:execute(),audit:summarize()};}
  catch(error){
    if(error&&typeof error==='object'&&
       !error.agent31BenchCostEvidence)
      error.agent31BenchCostEvidence=summarize();
    throw error;
  }
  finally{
    assert.strictEqual(Store.prototype.dispatch,intercepted);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}

module.exports={VERSION,classifyBenchCostExposure,summarizePerGameSeat,
  withGuzmaBenchCostObserver};
