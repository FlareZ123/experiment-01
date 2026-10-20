'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/** @param {string} file @returns {any} */
const engine=file=>require(path.join(output,file));

/**
 * Observe a genuine rank6 source-first Initialization lock at three native
 * Store boundaries, without changing decisions, dispatches, or hidden cards.
 * A PowerEffect check is a necessary engine observation, not a paper-rules
 * certification or proof that Initialization was the only applicable lock.
 *
 * @param {object} store Actual pinned Store instance.
 * @param {object} state Current genuine Store state.
 * @param {0|1} sourceSeat Exact Iron Thorns source physical seat.
 * @param {0|1} candidateSeat Opposite physical seat.
 * @param {(store:object,state:object,player:object,pokemon:object)=>boolean} blocked Native PowerEffect predicate.
 * @param {(state:object)=>object} board Public-board projection.
 * @param {string} futureTag Pinned FUTURE tag.
 * @returns {object} Read-only observation of public state and native effect.
 */
function initializationSnapshot(
  store,state,sourceSeat,candidateSeat,blocked,board,futureTag
){
  const source=state.players[sourceSeat];
  const candidate=state.players[candidateSeat];
  const active=source.active.getPokemonCard();
  const options=[candidate.active,...candidate.bench].map(slot=>
    slot.getPokemonCard()).filter(Boolean);
  const eligible=options.filter(pokemon=>
    typeof pokemon.hasRuleBox==='function'&&pokemon.hasRuleBox()&&
    typeof pokemon.hasTag==='function'&&!pokemon.hasTag(futureTag)&&
    Array.isArray(pokemon.powers)&&pokemon.powers.length>0);
  const target=eligible[0]??null;
  const targetPower=target?.powers[0]??null;
  // Public printed Power names are known from the visible board. Inspect
  // every eligible Power because an exempt first Power can mask a blocked
  // later Power when a snapshot records only powers[0] from eligible[0].
  const nativePowerChecks=eligible.flatMap(pokemon=>pokemon.powers.map(power=>({
    printing:pokemon.fullName,powerName:power.name,
    blocked:Boolean(blocked(store,state,candidate,pokemon,power))
  })));
  return {
    globalTurn:state.turn,
    actingSeat:state.activePlayer,
    sourceActive:active?.fullName??null,
    sourceActiveIronThornsEx:active?.name==='Iron Thorns ex',
    eligibleRuleBoxPowerTargets:eligible.map(card=>({
      printing:card.fullName,
      powers:card.powers.map(power=>power.name)
    })),
    targetPrinting:target?.fullName??null,
    targetPowerName:targetPower?.name??null,
    targetNativeAbilityBlocked:targetPower?
      (nativePowerChecks[0]?.blocked??false):null,
    nativePowerChecks,
    anyNativePowerBlocked:nativePowerChecks.some(power=>power.blocked),
    publicBoard:board(state)
  };
}

/**
 * Reversible development-only read-only hook. It uses actual AddPlayer-started
 * Store objects, excluding cloned/simulated speculative Stores. Capturing
 * the state after a source turn-one root does not imply that root *caused*
 * Initialization: the passive effect existed already at setup.
 *
 * @template T
 * @param {()=>T} execute Synchronous authentic Store game.
 * @param {{sourceSeat?:0|1,candidateSeat?:0|1}} [options]
 * @param {{Store?:Function,GamePhase?:object,isAbilityBlocked?:Function,
 *   publicBoardSnapshot?:Function,futureTag?:string}} [deps] Pure test seam.
 * @returns {{result:T,audit:object}}
 */
function withLiveInitializationWindow(execute,{
  sourceSeat=0,candidateSeat=1
}={},deps={}){
  assert.equal(typeof execute,'function');
  assert.ok((sourceSeat===0||sourceSeat===1)&&candidateSeat===1-sourceSeat);
  const Store=deps.Store??engine('game/store/store').Store;
  const GamePhase=deps.GamePhase??engine('game/store/state/state').GamePhase;
  const blocked=deps.isAbilityBlocked??
    engine('game/store/prefabs/prefabs').IS_ABILITY_BLOCKED;
  const board=deps.publicBoardSnapshot??
    require('./public-board-telemetry.cjs').publicBoardSnapshot;
  const futureTag=deps.futureTag??
    engine('game/store/card/card-types').CardTag.FUTURE;
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const audit={
    schema:'agent39-sourcefirst-native-initialization-boundaries-v1',
    sourceSeat,candidateSeat,sourceTurn1:null,candidateTurn2:null,
    sourceReturnTurn3:null,
    genuineStoreOnly:true,
    passiveLockCausedByTurnOneRoot:false,
    paperRulesCertified:false,wholePolicyInformationSetSafe:false,
    competitiveGameQualified:false
  };
  let actual=null;
  function dispatch(action){
    if(actual===null&&action.constructor.name==='AddPlayerAction')actual=this;
    const result=original.value.call(this,action);
    if(this!==actual || this.state?.phase!==GamePhase.PLAYER_TURN ||
      this.state.prompts.some(prompt=>prompt.result===undefined))return result;
    const {turn,activePlayer}=this.state;
    const field=turn===1&&activePlayer===sourceSeat?'sourceTurn1':
      turn===2&&activePlayer===candidateSeat?'candidateTurn2':
      turn===3&&activePlayer===sourceSeat?'sourceReturnTurn3':null;
    if(field&&audit[field]===null){
      audit[field]={
        entryAfterAction:action.constructor.name,
        ...initializationSnapshot(this,this.state,sourceSeat,candidateSeat,
          blocked,board,futureTag)
      };
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:dispatch});
  try{
    return {result:execute(),audit};
  }finally{
    assert.equal(Store.prototype.dispatch,dispatch,
      'Initialization observer lost pinned Store dispatch ownership');
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

module.exports={initializationSnapshot,withLiveInitializationWindow};
