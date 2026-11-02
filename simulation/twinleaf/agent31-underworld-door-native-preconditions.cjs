'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {ROOT_ACTIONS}=
  require('./agent2-native-owner-supporter-opportunity.cjs');

const VERSION='agent31-rank1-native-underworld-door-precondition-observer-v1';
const VMAX='Shadow Rider Calyrex VMAX CRE';
const MARKER='UNDERWORLD_DOOR_MARKER';

/**
 * Owner-only native precondition exposure for one Underworld Door action.
 * The actual player marker is a once-per-card public-use constraint.
 * This does not call any game reducer or any card's .canPlay().
 *
 * @param {object} state Real pinned Store state (read only).
 * @param {0|1} seat Acting owner seat.
 * @param {object} types Pinned CardType, EnergyType enums.
 * @returns {object} Structural option readiness, not attack legality.
 */
function structuralDoorPreconditions(state,seat,types){
  assert.ok(seat===0||seat===1);
  const owner=state.players[seat];
  const inPlay=[owner.active,...owner.bench]
    .map((slot,index)=>({slot,index,
      position:index===0?'active':'bench',
      pokemon:slot.getPokemonCard()}))
    .filter(({pokemon})=>pokemon!==null);
  const vmax=inPlay.filter(({pokemon})=>pokemon?.fullName===VMAX)
    .map(({pokemon,position,index})=>({
      printing:pokemon.fullName,position,index:index===0?0:index-1,
      alreadyUsed:owner.marker.hasMarker(MARKER,pokemon),
      printedAbility: pokemon.powers?.some(power=>
        power.name==='Underworld Door')===true
    }));
  const unspent=vmax.filter(x=>!x.alreadyUsed&&x.printedAbility);
  const basicPsychicInHand=owner.hand.cards.filter(card=>
    card.name==='Psychic Energy'&&
    card.energyType===types.EnergyType.BASIC&&
    card.provides?.includes(types.CardType.PSYCHIC)).length;
  const eligiblePsychicBench=owner.bench.reduce((rows,slot,index)=>{
    const pokemon=slot.getPokemonCard();
    return pokemon?.cardType?.includes(types.CardType.PSYCHIC)?
      [...rows,{index,printing:pokemon.fullName}]:rows;
  },[]);
  return {
    sourceInPlay:vmax.length,unspentVmax:unspent.length,
    basicPsychicInHand,
    printedPsychicBench:eligiblePsychicBench.length,
    sourcePrintings:vmax,
    possibleRecipients:eligiblePsychicBench,
    structuralOpportunity:unspent.length>0&&
      basicPsychicInHand>0&&eligiblePsychicBench.length>0,
    scope:'Only owner hand, owner board, native once-per-source used marker. No game reducer or lock query. Printed Psychic recipient typing can differ from live typing.'
  };
}

/**
 * Store-wrapper audit of accepted owner action roots, no action injection.
 * Includes zero-ability trajectories and native failures unchanged.
 *
 * @template T
 * @param {()=>T} execute Native batch on one fixed roster and registration.
 * @param {object} [deps] Real Store and enums (injectable for unit tests).
 * @returns {{result:T,audit:object}}
 */
function withUnderworldDoorPreconditions(execute,deps={}){
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(output,'game/store/store')).Store;
  const types=deps.types??require(path.join(output,
    'game/store/card/card-types'));
  const phase=deps.playerTurnPhase??require(path.join(output,
    'game/store/state/state')).GamePhase.PLAYER_TURN;
  const original=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const gameIds=new WeakMap(),turns=new Map();
  let games=0,scanned=0,accepted=0,sourceRoots=0,
    opportunities=0,sourceVmaxRoots=0;
  const report=()=>{
    const values=[...turns.values()];
    const gamesByOrdinal=new Map();
    for(const item of values){
      const row=gamesByOrdinal.get(item.gameId)??{
        gameId:item.gameId,seatStats:[]
      };
      row.seatStats.push(item);
      gamesByOrdinal.set(item.gameId,row);
    }
    return {
      schema:VERSION,readOnly:true,ownerHandAndBoardOnly:true,
      games,scannedAcceptedActionCandidates:scanned,
      acceptedOwnerRoots:accepted,
      originalVmaxSourceRoots:sourceVmaxRoots,
      structurallyPossibleSourceRoots:opportunities,
      distinctOwnerTurns:values.length,
      sourceTurnsWithVmax:values.filter(x=>x.anyVMAX).length,
      sourceTurnsWithUnspentVMAX:values.filter(x=>x.anyUnspent).length,
      sourceTurnsWithPsychicHand:values.filter(x=>x.anyPsychicHand).length,
      sourceTurnsWithPrintedPsychicBench:
        values.filter(x=>x.anyPsychicBench).length,
      sourceTurnsWithFullStructuralOpportunity:
        values.filter(x=>x.anyStructural).length,
      gameSeatRows:values.sort((a,b)=>
        a.gameId-b.gameId||a.seat-b.seat||a.turn-b.turn),
      completeNativeAbilityLockLegalityVerified:false,
      actualNativeUnderworldDoorUseValidated:false,
      anyActionChanged:false,
      competitiveQualifiedGames:0
    };
  };
  function inspect(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&
      !gameIds.has(this))gameIds.set(this,++games);
    const gameId=gameIds.get(this);
    if(!gameId)return original.value.call(this,action,...args);
    const state=this.state;
    const kind=action?.constructor?.name;
    const seat=state.players?.findIndex(player=>
      player.id===(action?.id??action?.clientId));
    const eligible=ROOT_ACTIONS.has(kind)&&
      (seat===0||seat===1)&&
      state.activePlayer===seat&&state.phase===phase&&
      Number.isSafeInteger(state.turn)&&state.turn>=1&&
      state.prompts?.every(prompt=>prompt.result!==undefined)===true;
    const preTurn=state.turn;
    let observation=null;
    if(eligible){
      scanned++;
      observation=structuralDoorPreconditions(state,seat,types);
    }
    let result;
    try{result=original.value.call(this,action,...args);}
    catch(error){
      if(error&&typeof error==='object')
        error.agent31UnderworldDoorEvidence=report();
      throw error;
    }
    if(observation){
      accepted++;
      sourceVmaxRoots+=Number(observation.sourceInPlay>0);
      opportunities+=Number(observation.structuralOpportunity);
      const key=gameId+':'+seat+':'+preTurn;
      const prior=turns.get(key)??{
        gameId,seat,turn:preTurn,acceptedRoots:0,
        maxVmax:0,maxUnspent:0,maxPsychicHand:0,
        maxPrintedPsychicBench:0,
        anyVMAX:false,anyUnspent:false,
        anyPsychicHand:false,anyPsychicBench:false,
        anyStructural:false,
        firstOpportunity:null
      };
      prior.acceptedRoots++;
      prior.maxVmax=Math.max(prior.maxVmax,observation.sourceInPlay);
      prior.maxUnspent=Math.max(prior.maxUnspent,observation.unspentVmax);
      prior.maxPsychicHand=Math.max(
        prior.maxPsychicHand,observation.basicPsychicInHand);
      prior.maxPrintedPsychicBench=Math.max(
        prior.maxPrintedPsychicBench,observation.printedPsychicBench);
      prior.anyVMAX ||=observation.sourceInPlay>0;
      prior.anyUnspent ||=observation.unspentVmax>0;
      prior.anyPsychicHand ||=observation.basicPsychicInHand>0;
      prior.anyPsychicBench ||=observation.printedPsychicBench>0;
      prior.anyStructural ||=observation.structuralOpportunity;
      if(observation.structuralOpportunity&&!prior.firstOpportunity){
        prior.firstOpportunity={
          sourcePrintings:observation.sourcePrintings,
          recipients:observation.possibleRecipients,
          handPsychicEnergyCount:observation.basicPsychicInHand,
          nativeActionKind:kind
        };
      }
      turns.set(key,prior);
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...original,value:inspect
  });
  try{return {result:execute(),audit:report()};}
  catch(error){
    if(error&&typeof error==='object'&&
       !error.agent31UnderworldDoorEvidence)
      error.agent31UnderworldDoorEvidence=report();
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,inspect);
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}
module.exports={
  VERSION,structuralDoorPreconditions,
  withUnderworldDoorPreconditions
};
