'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent47-opponent-owned-ko-turn-tracker-v2';
const PINNED='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

function safeTurn(value){return Number.isSafeInteger(value)&&value>=0;}

/**
 * Track only genuine owner-side native KO receipts and the completion of
 * their containing turns. A known-empty snapshot is returned only after the
 * tracker observed the entire preceding turn. Starting mid-turn deliberately
 * leaves that turn uncovered.
 *
 * @param {number} startingTurn Store turn when the hook is installed.
 */
function createKnockoutTurnTracker(startingTurn){
  assert.ok(safeTurn(startingTurn),'Starting Store turn must be known');
  const coveredFromTurn=startingTurn+1;
  const eventsByTurn=new Map();
  const completedTurns=new Map();
  const uncertainTurns=new Set();
  let recordedEvents=0;

  // A numbered turn may be followed by ANOTHER turn from the same player.
  // Therefore 'the opponent's last turn' cannot be currentTurn - 1.
  // Require continuous, authenticated owner coverage through the present.
  function lastCompletedOpponentTurn(ownerId,opponentId,currentTurn){
    if(ownerId===undefined||opponentId===undefined||ownerId===opponentId||
       !safeTurn(currentTurn)||currentTurn<=1)return null;
    for(let t=currentTurn-1;t>=coveredFromTurn;t--){
      if(!completedTurns.has(t)||uncertainTurns.has(t))return null;
      const completedOwner=completedTurns.get(t);
      if(completedOwner!==ownerId&&completedOwner!==opponentId)return null;
      if(completedOwner===opponentId)return t;
    }
    return null;
  }
  function certifiedSnapshot(ownerId,opponentId,currentTurn){
    const turn=lastCompletedOpponentTurn(ownerId,opponentId,currentTurn);
    if(turn===null)return null;
    return Object.freeze({turn,
      events:Object.freeze((eventsByTurn.get(turn)??[])
        .filter(row=>row.victimPlayerId===ownerId&&
          row.attackerPlayerId===opponentId)
        .map(row=>Object.freeze({...row})))
    });
  }

  return Object.freeze({
    version:VERSION,
    coveredFromTurn,
    record(event){
      assert.ok(safeTurn(event?.turn)&&event.turn>=coveredFromTurn);
      assert.ok(event.victimPlayerId!==undefined&&
        event.attackerPlayerId!==undefined&&
        event.victimPlayerId!==event.attackerPlayerId);
      assert.ok(event.byAttack===true||event.byAttack===false||
        event.byAttack===null);
      const rows=eventsByTurn.get(event.turn)??[];
      rows.push(Object.freeze({
        turn:event.turn,
        victimPlayerId:event.victimPlayerId,
        attackerPlayerId:event.attackerPlayerId,
        byAttack:event.byAttack
      }));
      eventsByTurn.set(event.turn,rows);
      recordedEvents++;
    },
    markUncertain(turn){
      assert.ok(safeTurn(turn));
      if(turn>=coveredFromTurn)uncertainTurns.add(turn);
    },
    completeTurn(turn,ownerPlayerId){
      assert.ok(safeTurn(turn));
      assert.ok(ownerPlayerId!==undefined && ownerPlayerId!==null,
        'Completed turn must have an authenticated owner');
      if(turn<coveredFromTurn)return;
      const before=completedTurns.get(turn);
      if(before!==undefined && before!==ownerPlayerId){
        uncertainTurns.add(turn);
        return;
      }
      completedTurns.set(turn,ownerPlayerId);
    },
    lastCompletedOpponentTurn,
    snapshotWithTurn:certifiedSnapshot,
    snapshot(ownerPlayerId,opponentPlayerId,currentTurn){
      return certifiedSnapshot(ownerPlayerId,opponentPlayerId,currentTurn)?.events??null;
    },
    audit(){
      return Object.freeze({
        version:VERSION,coveredFromTurn,recordedEvents,
        completedTurns:Object.freeze([...completedTurns.keys()].sort((a,b)=>a-b)),
        completedTurnOwners:Object.freeze([...completedTurns.entries()]
          .sort((a,b)=>a[0]-b[0]).map(([turn,ownerPlayerId])=>
            Object.freeze({turn,ownerPlayerId}))),
        uncertainTurns:Object.freeze([...uncertainTurns].sort((a,b)=>a-b))
      });
    }
  });
}

/**
 * Install a reversible, instance-scoped observer on the actual Store. The
 * native victim-side KO-entry append is used as proof that the pinned reducer
 * recognized an opponent-turn KO; the observer never changes native state.
 *
 * @param {object} store Actual pinned Twinleaf Store instance.
 * @param {object} [dependencies] Test injection seam for pinned classes.
 * @returns {{tracker:object,uninstall:()=>void}}
 */
function installStoreKnockoutTurnTracker(store,dependencies={}){
  assert.ok(store&&typeof store.reduceEffect==='function');
  const load=name=>require(path.join(BASE,name));
  const KnockOutEffect=dependencies.KnockOutEffect??
    load('game/store/effects/game-effects').KnockOutEffect;
  const EndTurnEffect=dependencies.EndTurnEffect??
    load('game/store/effects/game-phase-effects').EndTurnEffect;
  const GamePhase=dependencies.GamePhase??
    load('game/store/state/state').GamePhase;
  assert.equal(typeof KnockOutEffect,'function');
  assert.equal(typeof EndTurnEffect,'function');
  assert.ok(GamePhase&&GamePhase.PLAYER_TURN!==undefined&&
    GamePhase.ATTACK!==undefined);

  const startingTurn=store.state?.turn;
  assert.ok(safeTurn(startingTurn),'Store state must expose its current turn');
  const tracker=createKnockoutTurnTracker(startingTurn);
  const priorDescriptor=Object.getOwnPropertyDescriptor(store,'reduceEffect');
  assert.ok(!priorDescriptor||priorDescriptor.configurable!==false,
    'Store reduceEffect must be reversibly configurable');
  const original=store.reduceEffect;

  function trackedReduceEffect(state,effect,...args){
    if(this!==store)return original.apply(this,[state,effect,...args]);
    const turn=state?.turn;
    const isKo=effect instanceof KnockOutEffect;
    const victim=isKo?effect.player:null;
    const victimSeat=isKo?state.players.indexOf(victim):-1;
    const actor=state.players[state.activePlayer];
    const actorSeat=state.players.indexOf(actor);
    const opponentTurn=isKo&&safeTurn(turn)&&victimSeat>=0&&
      actorSeat===1-victimSeat&&
      (state.phase===GamePhase.PLAYER_TURN||
       state.phase===GamePhase.ATTACK);
    const targetPokemon=opponentTurn?
      effect.target?.getPokemonCard?.():null;
    const entries=victim?.pokemonKnockedOutLastTurnEntries;
    const beforeCount=Array.isArray(entries)?entries.length:null;
    const markerKnown=typeof victim?.marker?.hasMarker==='function'&&
      victim.DAMAGE_DEALT_MARKER!==undefined;
    const byAttack=!opponentTurn?false:
      state.phase!==GamePhase.ATTACK?false:
        markerKnown?victim.marker.hasMarker(victim.DAMAGE_DEALT_MARKER):null;

    const result=original.apply(this,[state,effect,...args]);

    if(opponentTurn&&targetPokemon!==undefined&&targetPokemon!==null&&
       turn>=tracker.coveredFromTurn){
      const afterEntries=victim.pokemonKnockedOutLastTurnEntries;
      if(effect.preventDefault===true){
        tracker.markUncertain(turn);
      }else if(beforeCount!==null&&Array.isArray(afterEntries)&&
         afterEntries.length>beforeCount){
        tracker.record({
          turn,victimPlayerId:victim.id,attackerPlayerId:actor.id,byAttack
        });
      }else{
        tracker.markUncertain(turn);
      }
    }

    if(effect instanceof EndTurnEffect){
      const afterTurn=safeTurn(result?.turn)?result.turn:state?.turn;
      if(safeTurn(turn)&&safeTurn(afterTurn)&&afterTurn>turn){
        // The effect's player must be the owner of the ending turn. Do not
        // certify a turn inferred from the post-transition activePlayer.
        const owner=effect.player;
        if(owner?.id===actor?.id)tracker.completeTurn(turn,owner.id);
        else tracker.markUncertain(turn);
      }
    }
    return result;
  }

  Object.defineProperty(store,'reduceEffect',{
    configurable:true,writable:true,value:trackedReduceEffect
  });
  let installed=true;
  function uninstall(){
    if(!installed)return;
    assert.strictEqual(store.reduceEffect,trackedReduceEffect,
      'Do not overwrite a Store hook installed after this tracker');
    if(priorDescriptor)Object.defineProperty(store,'reduceEffect',priorDescriptor);
    else delete store.reduceEffect;
    installed=false;
  }
  return {tracker,uninstall};
}

module.exports={
  VERSION,PINNED,createKnockoutTurnTracker,installStoreKnockoutTurnTracker
};
