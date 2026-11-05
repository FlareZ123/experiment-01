'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=
  require('./actor-observation-contract.cjs');

const VERSION='agent7-shadowmist-plumeria-t3-t4-owner-frontier-v1';

/**
 * Keep only the authenticated current actor's concealed hand and their
 * own public board, plus the opponent's *public* board. No state reaches a
 * chooser, and no opponent hand, deck order, or Prize identity is read.
 * @param {object} view Detached actor-only observation.
 * @returns {object}
 */
function compactRoot(view){
  assert.equal(view.decisionKind,'owner-root');
  const active=view.ownPublic.active;
  return {
    seat:view.actorSeat,turn:view.globalTurn,
    ownHand:[...view.ownHand],
    ownHandCount:view.ownHand.length,
    ownDeckCount:view.ownPublic.deckCount,
    ownActive:active?{
      printing:active.printing,energies:[...active.energies],
      attacks:active.attacks.map(a=>({
        name:a.name,cost:[...a.cost],text:a.text
      })),publicRestrictions:active.publicRestrictions
    }:null,
    ownBenchOccupied:view.ownPublic.bench.filter(Boolean).length,
    opponentActive:view.opponentPublic.active?{
      printing:view.opponentPublic.active.printing,
      energies:[...view.opponentPublic.active.energies]
    }:null,
    opponentBench:view.opponentPublic.bench.filter(Boolean).map(p=>({
      printing:p.printing,energies:[...p.energies]
    })),
    restrictions:{...view.ownPublic.publicTurnRestrictions},
    turnResources:{...view.ownTurnResources}
  };
}

/**
 * Reversible, strictly read-only native Store observation at source seat1
 * turn3 PlayCardAction and candidate seat0 turn4 PassTurnAction.
 * A game gets an ordinal only after the original AddPlayerAction settles,
 * using the same native Store/player identity convention as the established
 * Agent7 original source-owner Pass observer.
 *
 * @template T
 * @param {()=>T} execute Existing original-source native comparison.
 * @param {{Store?:Function,GamePhase?:object}} [deps] Test seams.
 * @returns {{result:T,audit:object}}
 */
function withPlumeriaTurnFrontier(execute,deps={}){
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(output,name));
  const Store=deps.Store??load('game/store/store').Store;
  const GamePhase=deps.GamePhase??load('game/store/state/state').GamePhase;
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const byStore=new WeakMap(),games=[];
  function dispatch(action,...rest){
    const state=this.state,game=byStore.get(this);
    const seat=state?.activePlayer;
    const kind=action?.constructor?.name;
    const relevant=game&&state?.phase===GamePhase.PLAYER_TURN&&
      state.players?.length===2&&
      !(state.prompts??[]).some(p=>p.result===undefined)&&
      ((seat===1&&state.turn===3&&kind==='PlayCardAction')||
        (seat===0&&state.turn===4&&kind==='PassTurnAction'));
    if(relevant){
      const view=actorObservation(state,seat);
      game.entries.push({
        action:kind,ownerSnapshot:compactRoot(view)
      });
    }
    const result=original.value.call(this,action,...rest);
    if(kind==='AddPlayerAction'&&
       this.state.players?.length===1&&
       this.state.players[0].id===101&&
       !byStore.has(this)){
      const entry={gameOrdinal:games.length,entries:[]};
      games.push(entry);
      byStore.set(this,entry);
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',
    {...original,value:dispatch});
  try{
    const result=execute();
    return {result,audit:{
      version:VERSION,physicalStores:games.length,games,
      modifiedGameplayActions:false,
      opponentHiddenIdentityRead:false,
      actorPrivateHandNeverPassedToOpponent:true,
      competitivelyQualifiedGames:0
    }};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

module.exports={VERSION,compactRoot,withPlumeriaTurnFrontier};
