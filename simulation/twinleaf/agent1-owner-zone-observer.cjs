'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {printings,pokemonZone}=require('./source-zone-checkpoint.cjs');
const {publicPlayer,visiblePokemon}=require('./actor-observation-contract.cjs');

const VERSION='agent1-owner-only-zone-observer-v1';
const HANDIWORK_PRINTING="Team Rocket's Handiwork FCO";

/**
 * Capture the source owner's exact physical zones for retrospective analysis.
 * The opponent contributes public board, discard, and count information only.
 * This snapshot is diagnostic data and must never be supplied to a policy.
 *
 * @param {object} state Pinned Twinleaf Store state.
 * @param {0|1} seat Source owner's physical seat.
 * @param {number} [playerTurnPhase=2] Pinned GamePhase.PLAYER_TURN value.
 * @returns {object|null} Detached owner-only snapshot, or null outside an owner decision.
 */
function ownerZoneSnapshot(state,seat,playerTurnPhase=2){
  assert.ok((seat===0||seat===1)&&state?.players?.length===2);
  const owner=state.players[seat];
  const opponent=state.players[1-seat];
  const pending=(state.prompts??[]).find(prompt=>prompt?.result===undefined)??null;
  if(pending){
    if(pending.playerId!==owner.id)return null;
  }else if(state.activePlayer!==seat){
    return null;
  }
  if(state.phase!==playerTurnPhase)return null;

  const zones={
    deck:printings(owner.deck),
    hand:printings(owner.hand),
    discard:printings(owner.discard),
    lostzone:printings(owner.lostzone),
    stadium:printings(owner.stadium),
    supporter:printings(owner.supporter),
    prizes:owner.prizes.map(printings),
    active:pokemonZone(owner.active),
    activePublic:visiblePokemon(owner.active),
    bench:owner.bench.map(pokemonZone),
    benchPublic:owner.bench.map(visiblePokemon)
  };
  const handiworkLocations=[];
  for(const zone of ['deck','hand','discard','lostzone','stadium','supporter']){
    if(zones[zone].includes(HANDIWORK_PRINTING))handiworkLocations.push(zone);
  }
  if(zones.prizes.some(prize=>prize.includes(HANDIWORK_PRINTING))){
    handiworkLocations.push('prizes');
  }
  const bunnelbyActive=zones.activePublic?.printing==='Bunnelby PRC';
  const attachedEnergyCount=zones.active.energies.length;
  const attacksThisTurn=zones.active.attacksThisTurn??0;
  const hasRototiller=zones.activePublic?.attacks?.some(
    attack=>attack.name==='Rototiller')===true;
  const handiworkInDiscard=handiworkLocations.includes('discard');
  const structuralRototillerCandidate=handiworkInDiscard&&
    bunnelbyActive&&hasRototiller&&attachedEnergyCount>0&&
    attacksThisTurn<2;
  const pendingSource=pending?.cards===owner.discard?'own-discard':
    pending?.cards===owner.hand?'own-hand':
    pending?.cards===owner.deck?'own-deck':'other';
  const pendingPrompt=pending?{
    className:pending.constructor?.name??null,
    message:typeof pending.message==='string'?pending.message:null,
    source:pendingSource,
    options:pending.options?{
      min:Number.isInteger(pending.options.min)?pending.options.min:null,
      max:Number.isInteger(pending.options.max)?pending.options.max:null,
      allowCancel:typeof pending.options.allowCancel==='boolean'?
        pending.options.allowCancel:null
    }:null,
    offeredOwnDiscardPrintings:
      pendingSource==='own-discard'&&
      pending.constructor?.name==='ChooseCardsPrompt'?
        printings(owner.discard):null
  }:null;
  const lastAttack=state.playerLastAttack?.[owner.id]??null;
  return {
    schema:VERSION,
    observerOnly:true,
    notPolicyInput:true,
    ownerHiddenZonesRetrospectiveOnly:true,
    opponentHiddenZonesInspected:false,
    turn:state.turn,
    phase:state.phase,
    activePlayer:state.activePlayer,
    decisionKind:pending?'owner-prompt':'owner-root',
    pendingPrompt,
    owner:{
      id:owner.id,
      zones,
      handiworkLocations,
      bunnelbyActive,
      bunnelbyAttachedEnergyCount:attachedEnergyCount,
      bunnelbyAttacksThisTurn:attacksThisTurn,
      hasRototiller,
      structuralRototillerCandidate,
      usedGX:owner.usedGX===true,
      usedVSTAR:owner.usedVSTAR===true,
      energyPlayedTurn:owner.energyPlayedTurn,
      supporterTurn:owner.supporterTurn,
      retreatedTurn:owner.retreatedTurn,
      stadiumPlayedTurn:owner.stadiumPlayedTurn,
      stadiumUsedTurn:owner.stadiumUsedTurn,
      cannotPlayItemCards:owner.cannotPlayItemCards===true,
      cannotPlaySupporterCards:owner.cannotPlaySupporterCards===true,
      cannotPlayStadiumCards:owner.cannotPlayStadiumCards===true
    },
    opponentPublic:publicPlayer(opponent),
    previousOwnerAttack:lastAttack?{
      source:lastAttack.sourceCard?.fullName??null,
      attack:lastAttack.attack?.name??null
    }:null
  };
}

/**
 * Observe only the first live match Store. Snapshots remain in a local
 * diagnostic collection and are never passed to any decision policy.
 *
 * @template T
 * @param {Function} Store Pinned compiled Store constructor.
 * @param {0|1} seat Source owner's physical seat.
 * @param {()=>T} execute Synchronous native match workload.
 * @param {{playerTurnPhase?:number,maxSnapshots?:number}} [options]
 * @returns {{result:T,snapshots:object[],audit:object}}
 */
function withOwnerZoneAudit(Store,seat,execute,options={}){
  assert.ok(seat===0||seat===1);
  assert.equal(typeof execute,'function');
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  if(typeof descriptor?.value!=='function'){
    throw new TypeError('Expected compiled Store dispatch method');
  }
  const playerTurnPhase=options.playerTurnPhase??2;
  const maxSnapshots=options.maxSnapshots??5000;
  assert.ok(Number.isSafeInteger(maxSnapshots)&&maxSnapshots>0);
  let live=null,dispatches=0,truncated=false;
  const snapshots=[],seen=new Set();
  const patched=function observeOwnerZones(action,...args){
    if(!live&&action?.constructor?.name==='AddPlayerAction')live=this;
    if(this===live){
      const state=this.state;
      if(state?.players?.length===2){
        const snapshot=ownerZoneSnapshot(state,seat,playerTurnPhase);
        if(snapshot){
          const digest=createHash('sha256')
            .update(JSON.stringify(snapshot)).digest('hex');
          const key=state.turn+':'+snapshot.decisionKind+':'+digest;
          if(!seen.has(key)){
            seen.add(key);
            if(snapshots.length<maxSnapshots){
              snapshots.push({
                dispatchOrdinal:dispatches,
                actionClass:action?.constructor?.name??null,
                actionName:typeof action?.name==='string'?action.name:null,
                digest,
                snapshot
              });
            }else{
              truncated=true;
            }
          }
        }
      }
      dispatches++;
    }
    return descriptor.value.apply(this,[action,...args]);
  };
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:patched});
  try{
    const result=execute();
    const rows=snapshots.map(row=>row.snapshot);
    return {
      result,snapshots,
      audit:{
        version:VERSION,
        sourceSeat:seat,
        liveStoreFound:live!==null,
        liveStoreDispatches:dispatches,
        capturedOwnerDecisions:snapshots.length,
        ownerRootDecisions:rows.filter(row=>row.decisionKind==='owner-root').length,
        ownerPromptDecisions:rows.filter(row=>row.decisionKind==='owner-prompt').length,
        handiworkInHand:rows.filter(row=>
          row.owner.handiworkLocations.includes('hand')).length,
        handiworkInDiscard:rows.filter(row=>
          row.owner.handiworkLocations.includes('discard')).length,
        structuralRototillerCandidates:rows.filter(row=>
          row.owner.structuralRototillerCandidate).length,
        opponentHiddenZonesInspected:false,
        ownerHiddenZonesRetrospectiveOnly:true,
        notPolicyInput:true,
        truncated
      }
    };
  }finally{
    assert.strictEqual(Store.prototype.dispatch,patched);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

module.exports={VERSION,HANDIWORK_PRINTING,ownerZoneSnapshot,withOwnerZoneAudit};
