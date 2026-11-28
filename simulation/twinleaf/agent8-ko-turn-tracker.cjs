'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent8-store-ko-turn-tracker-v2-owner-turn-aware';
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
  const completedTurns=new Set();
  const completedTurnActorIds=new Map();
  const uncertainTurns=new Set();
  let recordedEvents=0;

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
    completeTurn(turn,actorPlayerId=null){
      assert.ok(safeTurn(turn));
      if(turn<coveredFromTurn)return;
      assert.ok(actorPlayerId===null||typeof actorPlayerId==='number'||
        typeof actorPlayerId==='string');
      if(completedTurnActorIds.has(turn))
        assert.equal(completedTurnActorIds.get(turn),actorPlayerId,
          'Completed turn ownership cannot change after receipt');
      completedTurns.add(turn);
      completedTurnActorIds.set(turn,actorPlayerId);
    },
    // The KO prerequisite is about the last *opponent-owned* turn. When
    // Timeless-GX or other effects award consecutive turns, that turn is not
    // necessarily currentTurn-1. Every intervening completed turn must be
    // authenticated, including turns with no KOs; missing history fails closed.
    snapshotLastOpponentTurn(ownerPlayerId,opponentPlayerId,currentTurn){
      if(ownerPlayerId===undefined||opponentPlayerId===undefined||
         ownerPlayerId===opponentPlayerId||
         !safeTurn(currentTurn)||currentTurn<=1)return null;
      for(let turn=currentTurn-1;turn>=coveredFromTurn;turn--){
        if(!completedTurns.has(turn)||uncertainTurns.has(turn)||
           !completedTurnActorIds.has(turn))return null;
        const actor=completedTurnActorIds.get(turn);
        if(actor===null||(actor!==ownerPlayerId&&actor!==opponentPlayerId))
          return null;
        if(actor===opponentPlayerId){
          return Object.freeze({
            turn,events:Object.freeze((eventsByTurn.get(turn)??[])
              .filter(row=>row.victimPlayerId===ownerPlayerId&&
                row.attackerPlayerId===opponentPlayerId)
              .map(row=>Object.freeze({...row})))
          });
        }
      }
      return null;
    },
    snapshot(ownerPlayerId,opponentPlayerId,currentTurn){
      if(ownerPlayerId===undefined||opponentPlayerId===undefined||
         !safeTurn(currentTurn)||currentTurn<=1)return null;
      const previousTurn=currentTurn-1;
      if(previousTurn<coveredFromTurn||
         !completedTurns.has(previousTurn)||
         uncertainTurns.has(previousTurn))return null;
      return Object.freeze((eventsByTurn.get(previousTurn)??[])
        .filter(row=>row.victimPlayerId===ownerPlayerId&&
          row.attackerPlayerId===opponentPlayerId)
        .map(row=>Object.freeze({...row})));
    },
    audit(){
      return Object.freeze({
        version:VERSION,coveredFromTurn,recordedEvents,
        completedTurns:Object.freeze([...completedTurns].sort((a,b)=>a-b)),
        completedActorKnownTurns:completedTurnActorIds.size-
          [...completedTurnActorIds.values()].filter(x=>x===null).length,
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
      if(safeTurn(turn)&&safeTurn(afterTurn)&&afterTurn>turn)
        tracker.completeTurn(turn,actor?.id??null);
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
