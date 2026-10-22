'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent5-rank6-source-owned-stranded-mobility-readonly-v1';

/**
 * Source-owner-only read-only decision observer. Stores no unlicensed hidden
 * opponent hand, deck, Prize identities or policy RNG. Never changes an
 * action proposed to the genuine Store.
 * @template T
 * @param {0|1} seat Source physical seat.
 * @param {()=>T} execute Actual game.
 * @param {object} [deps] Injectable test classes.
 * @returns {{result:T,audit:object}}
 */
function withSourceOwnerMobilityObservation(seat,execute,deps={}){
  assert.ok(seat===0||seat===1);
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const GamePhase=deps.GamePhase??
    require(path.join(base,'game/store/state/state')).GamePhase;
  const orig=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const dispatchOrig=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof orig?.value,'function');
  assert.equal(typeof dispatchOrig?.value,'function');
  let liveStore=null;
  const captured=new Set();
  const audit={version:VERSION,sourceSeat:seat,firstTurn:35,lastTurn:57,
    attemptedOwnerRoots:0,observedTurns:[],
    retainedOwnerHandOnly:true,changedActions:0,
    competitiveQualifiedGames:0};
  function decoded(state,...args){
    if(state===liveStore?.state&&
       state.activePlayer===seat&&
       state.players?.[seat]?.id===this.client?.id&&
       state.phase===GamePhase.PLAYER_TURN&&
       !state.prompts?.some(p=>p.result===undefined)&&
       state.turn>=35&&state.turn<=57){
      audit.attemptedOwnerRoots++;
      if(!captured.has(state.turn)){
        captured.add(state.turn);
        const view=actorObservation(state,seat);
        const own=view.ownPublic;
        const sourceBasic=own.bench.filter(Boolean).map((p,index)=>({
          index,printing:p.printing,energies:p.energies}));
        audit.observedTurns.push({
          turn:state.turn,
          sourceActive:own.active?.printing??null,
          activeEnergyPrintings:own.active?.energies??[],
          sourceBench:sourceBasic,
          sourceHeldGuzma:view.ownHand.filter(x=>
            /^Guzma [A-Z0-9]{2,6}(?: [0-9]+)?$/.test(x)),
          sourceHeldVsSeeker:view.ownHand.filter(x=>
            x.startsWith('VS Seeker ')),
          sourceDiscardGuzma:own.discard.filter(x=>
            /^Guzma [A-Z0-9]{2,6}(?: [0-9]+)?$/.test(x)),
          sourceSupporterPlayedTurn:view.ownTurnResources.supporterPlayedTurn,
          sourceSupporterLocked:view.ownTurnResources.supporterPlayLocked,
          opponentBenchCount:view.opponentPublic.bench.filter(Boolean).length
        });
      }
    }
    return orig.value.call(this,state,...args);
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!liveStore)liveStore=this;
    return dispatchOrig.value.apply(this,[action,...args]);
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...orig,value:decoded});
  Object.defineProperty(Store.prototype,'dispatch',
    {...dispatchOrig,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error){error.agent5MobilityObserverAudit=audit;throw error;}
  finally{
    Object.defineProperty(Store.prototype,'dispatch',dispatchOrig);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',orig);
  }
}

module.exports={VERSION,withSourceOwnerMobilityObservation};
