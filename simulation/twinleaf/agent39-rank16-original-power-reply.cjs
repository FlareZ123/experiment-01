'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent39-original-rank16-real-store-source-garbotoxin-reply-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Genuine Board-only snapshot. Evaluates native printed Powers from public
 * face-up Pokemon at a single originally reached opponent owner root.
 * It does not inspect either player's hidden zones or infer which lock caused
 * any native blocked result. 'Blocked' is the pinned engine's answer, not
 * independent paper-TCG verification or an evidence of tactical response.
 * @param {object} store The actual live native Store.
 * @param {object} state Native state at the opponent owner decision root.
 * @param {0|1} sourceSeat Original source physical seat.
 * @param {(store:object,state:object,owner:object,pokemon:object,power:object)=>boolean} isBlocked Native IS_ABILITY_BLOCKED.
 * @returns {object}
 */
function originalSourceGarbotoxinPowerSnapshot(store,state,sourceSeat,isBlocked){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.equal(state.players.length,2);
  assert.equal(typeof isBlocked,'function');
  const source=state.players[sourceSeat];
  const candidate=state.players[1-sourceSeat];
  const pokemonInPlay=[source.active,...source.bench];
  const equipped=slot=>{
    const card=slot?.getPokemonCard?.();
    return card?.name==='Garbodor'&&slot.tools.some(tool=>tool.name==='Float Stone'||
      tool.name==='Muscle Band'||tool.name==='Forest Seal Stone');
  };
  const equippedGarbodor=pokemonInPlay.filter(equipped).map(slot=>({
    pokemon:slot.getPokemonCard().fullName,
    tools:slot.tools.map(card=>card.fullName),
    position:slot===source.active?'active':'bench'
  }));
  const candidatePowers=[];
  for(const [position,slot] of [['active',candidate.active],
    ...candidate.bench.map((entry,i)=>['bench'+i,entry])]){
    const pokemon=slot?.getPokemonCard?.();
    if(!pokemon)continue;
    for(const power of pokemon.powers??[]){
      candidatePowers.push({
        position,pokemon:pokemon.fullName,powerName:power.name,
        nativeBlocked:Boolean(isBlocked(store,state,candidate,pokemon,power))
      });
    }
  }
  return {
    globalTurn:state.turn,
    nativeActivePlayerSeat:state.activePlayer,
    originalSourceSeat:sourceSeat,
    equippedGarbodor,
    originalSourceTooledGarbodorActive:equippedGarbodor.length>0,
    candidatePowers,
    candidateBlockedPowerCount:candidatePowers.filter(power=>power.nativeBlocked).length,
    candidatePrintedPowerCount:candidatePowers.length,
    stadiumsInPlay:state.players.flatMap((player,i)=>
      (player.stadium?.cards??[]).map(card=>({seat:i,printing:card.fullName}))),
    sourceHasActualEffectTarget:candidatePowers.length>0,
    nativeEnginePowerQuestionOnly:true,
    paperLegalityQualified:false,
    tacticalReplyQualified:false
  };
}

/**
 * A read-only Store.dispatch observer scoped exclusively to the first live
 * game Store created by the original headless runner. The observer watches
 * the actual first source owner turn and the immediately following first
 * opposing owner root. No decision is patched or substituted.
 * @template T
 * @param {Function} Store Pinned real Store constructor.
 * @param {0|1} sourceSeat Original source physical seat.
 * @param {()=>T} execute Synchronous native game.
 * @param {{GamePhase?:object,isBlocked?:Function}} [deps] Test dependency injection.
 * @returns {{result:T,audit:object}}
 */
function withOriginalSourcePowerReply(Store,sourceSeat,execute,deps={}){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.equal(typeof execute,'function');
  const GamePhase=deps.GamePhase??require(path.join(OUTPUT,
    'game/store/state/state')).GamePhase;
  const isBlocked=deps.isBlocked??require(path.join(OUTPUT,
    'game/store/prefabs/prefabs')).IS_ABILITY_BLOCKED;
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof prior?.value,'function');
  let liveStore=null,sourceFirstTurn=null,opposingPowerSnapshot=null;
  let observedLiveRootCount=0;
  function inspect(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&liveStore===null)
      liveStore=this;
    if(this===liveStore){
      const state=this.state;
      const ownerRoot=state.players?.length===2&&
        state.phase===GamePhase.PLAYER_TURN&&
        !state.prompts?.some(prompt=>prompt.result===undefined);
      if(ownerRoot){
        observedLiveRootCount++;
        if(sourceFirstTurn===null&&state.activePlayer===sourceSeat)
          sourceFirstTurn=state.turn;
        if(sourceFirstTurn!==null&&opposingPowerSnapshot===null&&
          state.activePlayer===1-sourceSeat&&
          state.turn===sourceFirstTurn+1){
          opposingPowerSnapshot=originalSourceGarbotoxinPowerSnapshot(
            this,state,sourceSeat,isBlocked);
          opposingPowerSnapshot.firstOpponentRootActionClass=
            action?.constructor?.name??null;
        }
      }
    }
    return prior.value.call(this,action,...args);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...prior,value:inspect});
  try{
    const result=execute();
    return {result,audit:{
      version:VERSION,sourceSeat,liveStoreIdentified:liveStore!==null,
      sourceFirstTurn,firstOpponentRootSeen:opposingPowerSnapshot!==null,
      opposingPowerSnapshot,observedLiveRootCount,
      observationalOnly:true,hiddenZonesRead:false,
      originalSourcePrinted60Changed:false,
      competitiveQualifiedGames:0
    }};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,inspect);
    Object.defineProperty(Store.prototype,'dispatch',prior);
  }
}
module.exports={VERSION,originalSourceGarbotoxinPowerSnapshot,
  withOriginalSourcePowerReply};
