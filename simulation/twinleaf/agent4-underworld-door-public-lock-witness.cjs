'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent4-native-rejected-underworld-public-lock-v1';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=relative=>require(path.join(output,relative));

/** @param {object|null} slot @returns {object|null} */
function pokemon(slot){
  return typeof slot?.getPokemonCard==='function'?
    slot.getPokemonCard():null;
}

/**
 * Read only visible cards from the rejected action owner's field.
 * @param {object} state Authentic Store state.
 * @param {number} clientId Actual UseAbilityAction.clientId.
 * @returns {object}
 */
function publicAbilityContext(state,clientId){
  assert.ok(state&&Array.isArray(state.players));
  const seat=state.players.findIndex(player=>player.id===clientId);
  assert.ok(seat===0||seat===1,'Rejected Underworld owner ID not in live game');
  const owner=state.players[seat],opponent=state.players[1-seat];
  const sourceActive=pokemon(opponent.active);
  const slots=[
    {zone:'Active',index:null,slot:owner.active},
    ...owner.bench.map((slot,index)=>({zone:'Bench',index,slot}))
  ];
  const underworld=slots.flatMap(({zone,index,slot})=>{
    const card=pokemon(slot);
    const power=(card?.powers??[]).find(x=>x.name==='Underworld Door');
    return power?[{zone,index,printing:card.fullName??card.name,
      pokemon:card,power}]:[];
  });
  return {
    actingSeat:seat,
    opposingActive:sourceActive?.fullName??sourceActive?.name??null,
    opposingActiveIronThornsEx:sourceActive?.name==='Iron Thorns ex',
    opposingActivePowerNames:(sourceActive?.powers??[]).map(x=>x.name),
    opposingActiveTools:(Array.isArray(opponent.active?.tools)?
      opponent.active.tools:(opponent.active?.tools?.cards??[]))
      .map(card=>card.fullName??card.name),
    actingUnderworldSources:underworld.map(({zone,index,printing})=>({
      zone,index,printing,powerName:'Underworld Door'
    })),
    // Internal Card instances remain in a temporary local closure only.
    candidatePowerTargets:underworld
  };
}

/**
 * Genuine live Store dispatch witness. The Ability check is performed only
 * after the underlying Store has rejected the action, so it cannot affect
 * the contested game trajectory. It probes only public face-up Pokémon.
 *
 * @template T
 * @param {()=>T} work A native game experiment.
 * @param {{Store?:Function,isAbilityBlocked?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withRejectedUnderworldPublicLockWitness(work,deps={}){
  assert.equal(typeof work,'function');
  const Store=deps.Store??engine('game/store/store').Store;
  const blocked=deps.isAbilityBlocked??
    engine('game/store/prefabs/prefabs').IS_ABILITY_BLOCKED;
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  let currentGame=null,liveGames=0;
  const events=[];
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==currentGame){
      currentGame=this;
      liveGames++;
    }
    const matched=this===currentGame &&
      action?.constructor?.name==='UseAbilityAction'&&
      action?.name==='Underworld Door';
    const before=matched?
      publicAbilityContext(this.state,action.clientId):null;
    try{
      return previous.value.call(this,action,...args);
    }catch(error){
      if(matched&&String(error?.message??'').includes('UNKNOWN_POWER')){
        const targets=before.candidatePowerTargets;
        const checks=targets.map(({zone,index,printing,pokemon:card,power})=>{
          let isBlocked=null,probeErrorClass=null;
          try{
            isBlocked=Boolean(blocked(this,this.state,
              this.state.players[before.actingSeat],card,power));
          }catch(probeError){
            probeErrorClass=probeError?.constructor?.name??'Error';
          }
          return {zone,index,printing,powerName:power.name,
            nativePowerBlockedAfterRejection:isBlocked,probeErrorClass};
        });
        const {candidatePowerTargets,...publicBefore}=before;
        events.push({
          liveGameIndex:liveGames-1,
          actionName:action.name,actionType:'UseAbilityAction',
          nativeErrorClass:'UNKNOWN_POWER',
          globalTurn:this.state.turn,
          phase:this.state.phase,
          preDispatchPublicContext:publicBefore,
          postRejectionSpecificNativePowerChecks:checks,
          allPrintedUnderworldPowersBlocked:
            checks.length>0&&checks.every(x=>
              x.nativePowerBlockedAfterRejection===true),
          rejectedActionReplayedOrModified:false,
          boardStateOnlyBeforeAndProbeOnlyAfterReject:true
        });
      }
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...previous,value:dispatch});
  try{
    return {result:work(),audit:{schema:VERSION,
      liveGameCount:liveGames,
      exactRejectedUnderworldActions:events.length,events,
      readOpposingHiddenCards:false,
      readOwnDeckOrPrize:false,
      checkExecutedAfterNativeRejection:true,
      authoritativePaperRuleCauseProven:false,
      competitiveQualifiedGames:0}};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch,
      'Underworld diagnostic lost Store method ownership');
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}

module.exports={VERSION,publicAbilityContext,
  withRejectedUnderworldPublicLockWitness};
