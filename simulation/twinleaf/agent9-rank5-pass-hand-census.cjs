'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent9-read-only-original-rank5-native-pass-held-supporter-census-v1';
const SUPPORTERS=new Set([
  'Guzma BUS','Karen XYP','Wally ROS','Marnie SSH',
  'Pokémon Ranger STS'
]);

/**
 * Capture only the original acting source's physically held Supporter cards
 * when the genuine native actor is about to pass. The actor has already
 * selected Pass; this read-only postgame audit cannot affect that decision.
 *
 * @param {object} state Actual native Store state.
 * @param {object} action Actual PassTurnAction.
 * @param {number} gameOrdinal One-based native Store setup order.
 * @param {number[]} sourceSeatByGame Ordinal-ordered source physical seats.
 * @param {object} phase Exact pinned GamePhase enum.
 * @returns {object|null} Owner-only research receipt or out-of-scope.
 */
function captureSourcePass(state,action,gameOrdinal,sourceSeatByGame,phase){
  if(action?.constructor?.name!=='PassTurnAction'||
      state?.phase!==phase.PLAYER_TURN||
      !Number.isSafeInteger(gameOrdinal)||gameOrdinal<1)return null;
  const seat=sourceSeatByGame[gameOrdinal-1];
  if(seat!==0&&seat!==1||state.activePlayer!==seat)return null;
  const owner=state.players?.[seat];
  if(!owner||owner.id!==action.clientId||
      state.prompts?.some(p=>p.result===undefined))return null;
  const hand=owner.hand?.cards;
  if(!Array.isArray(hand))return null;
  const held=hand.filter(card=>SUPPORTERS.has(card.fullName))
    .map(card=>card.fullName);
  return {
    nativeGameOrdinal:gameOrdinal,sourceSeat:seat,turn:state.turn,
    sourcePassActionActuallyChosen:true,
    sourceActive:owner.active?.getPokemonCard?.()?.fullName??null,
    sourceActiveEnergy:owner.active?.energies?.cards?.map(c=>c.fullName)??[],
    sourceActiveCannotAttackNextTurn:
      owner.active?.cannotAttackNextTurn??null,
    sourceActiveCannotAttackPending:
      owner.active?.cannotAttackNextTurnPending??null,
    sourceBench:owner.bench?.map(slot=>({
      pokemon:slot.getPokemonCard?.()?.fullName??null,
      energies:slot.energies?.cards?.map(c=>c.fullName)??[]
    }))??[],
    opponentActive:state.players[1-seat]?.active?.getPokemonCard?.()
      ?.fullName??null,
    ownedRetreatedTurn:owner.retreatedTurn??null,
    heldSupporterPrintings:held,
    hasHeldSupporter:held.length>0,
    hasHeldGuzma:held.includes('Guzma BUS'),
    ownerSupporterTurn:owner.supporterTurn??null,
    ownerSupporterZoneCount:owner.supporter?.cards?.length??null,
    observedNativeStore:true,competitiveGameQualified:false
  };
}

/**
 * Read-only current Store-dispatch owner hand audit. All original paper
 * source and candidate sixty-card decks, decisions and effects stay fixed.
 *
 * @template T
 * @param {()=>T} execute Synchronous native game runner.
 * @param {{Store?:Function,GamePhase?:object,sourceSeatByGame?:number[]}}
 *   [deps] Compiled native or isolated test injection.
 * @returns {{result:T,audit:object}}
 */
function withSourcePassHandCensus(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const GamePhase=deps.GamePhase??require(path.join(base,
    'game/store/state/state')).GamePhase;
  // Reproduce the registered four source deals in each of two modes.
  const sourceSeatByGame=deps.sourceSeatByGame??[1,1,0,0,1,1,0,0];
  assert.ok(Array.isArray(sourceSeatByGame)&&
    sourceSeatByGame.every(seat=>seat===0||seat===1));
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  const storeOrdinals=new WeakMap();
  let ordinal=0;
  const audit={version:VERSION,readOnly:true,
    sourceSeatByGame:[...sourceSeatByGame],
    actualNativeGamesStarted:0,sourceNativePassRoots:0,
    sourcePassesHoldingPrintedSupporter:0,sourcePassesHoldingGuzma:0,
    matchedToRegistration:true,records:[],
    recordsTruncated:0,competitiveQualifiedGames:0};
  function dispatch(action,...args){
    const name=action?.constructor?.name;
    if(name==='AddPlayerAction'&&!storeOrdinals.has(this)){
      ordinal++;storeOrdinals.set(this,ordinal);
      audit.actualNativeGamesStarted=ordinal;
    }
    const game=storeOrdinals.get(this);
    if(name==='PassTurnAction'&&game!==undefined){
      const receipt=captureSourcePass(this.state,action,game,
        sourceSeatByGame,GamePhase);
      if(receipt){
        audit.sourceNativePassRoots++;
        if(receipt.hasHeldSupporter)
          audit.sourcePassesHoldingPrintedSupporter++;
        if(receipt.hasHeldGuzma)audit.sourcePassesHoldingGuzma++;
        if(audit.records.length<512)audit.records.push(receipt);
        else audit.recordsTruncated++;
      }
    }
    return previous.value.apply(this,[action,...args]);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...previous,value:dispatch});
  try{
    const result=execute();
    audit.matchedToRegistration=
      audit.actualNativeGamesStarted===sourceSeatByGame.length;
    return {result,audit};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}
module.exports={VERSION,SUPPORTERS,captureSourcePass,
  withSourcePassHandCensus};
