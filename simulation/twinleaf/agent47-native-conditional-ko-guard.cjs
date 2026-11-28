'use strict';

/*
 * Research-owned, opt-in native conditional KO legality fence.
 *
 * Pinned Twinleaf lets Raihan / Teammates / Unfair Stamp markers survive when
 * their owner is skipped by an opponent's no-KO Timeless-GX extra turn. Native
 * canPlay() and reduceEffect() both trust these stale markers. A correct public
 * policy decision by itself cannot prevent arbitrary native dispatch from
 * exploiting this engine legality error.
 *
 * This guard is deliberately exact-source, Store-scoped, synchronous, and
 * reversible. It is NOT globally installed or approved for V3/qualified games.
 * Use with an independently installed, turn-owner-aware Store observer.
 */

const assert=require('node:assert/strict');
const path=require('node:path');
const PINNED='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

const PRINTS=Object.freeze([
  Object.freeze({key:'Raihan',print:'Raihan EVS',set:'EVS',
    number:'152',module:'sets/09-sword-and-shield/set-evolving-skies/raihan'}),
  Object.freeze({key:'Teammates',print:'Teammates PRC',set:'PRC',
    number:'141',module:'sets/07-x-and-y/set-primal-clash/teammates'}),
  Object.freeze({key:'UnfairStamp',print:'Unfair Stamp TWM',set:'TWM',
    number:'165',module:'sets/10-scarlet-and-violet/set-twilight-masquerade/unfair-stamp'})
]);

function authenticatedActor(state,player){
  if(!Number.isSafeInteger(state?.turn)||state.turn<2||
     !Array.isArray(state?.players)||state.players.length!==2||
     ![0,1].includes(state.activePlayer)||
     state.players[state.activePlayer]!==player)return null;
  const opponent=state.players[1-state.activePlayer];
  if(player?.id===undefined||opponent?.id===undefined||
     player.id===opponent.id)return null;
  return {ownerId:player.id,opponentId:opponent.id};
}

function certifiedKO(tracker,state,player){
  const pair=authenticatedActor(state,player);
  if(!pair)return {eligible:false,turn:null,reason:'ACTOR_BINDING'};
  const snapshot=tracker.snapshotWithTurn(
    pair.ownerId,pair.opponentId,state.turn);
  if(!snapshot||!Number.isSafeInteger(snapshot.turn)||
     snapshot.turn<0||snapshot.turn>=state.turn||
     !Array.isArray(snapshot.events))
    return {eligible:false,turn:null,reason:'UNCERTIFIED_TURN'};
  const hit=snapshot.events.some(row=>
    row?.turn===snapshot.turn&&
    row.victimPlayerId===pair.ownerId&&
    row.attackerPlayerId===pair.opponentId);
  return {eligible:hit,turn:snapshot.turn,
    reason:hit?'CERTIFIED_LAST_OPPONENT_TURN_KO':'CERTIFIED_LAST_TURN_EMPTY'};
}

function isExact(card,source){
  return card?.fullName===source.print&&card?.set===source.set&&
    String(card?.setNumber)===source.number;
}

/**
 * Synchronous, reversible guard; returns {result,audit}.
 *
 * @param {object} options
 * @param {object} options.store Actual pinned native Store instance.
 * @param {object} options.tracker Owner-turn-aware tracker from this branch.
 * @param {()=>any} options.execute Synchronous staged workload.
 * @param {object} [options.dependencies] Fake class injection for tests only.
 */
function withCertifiedLastOpponentTurnKO({
  store,tracker,execute,dependencies={}
}){
  assert.ok(store&&typeof store.reduceEffect==='function');
  assert.ok(tracker&&typeof tracker.snapshotWithTurn==='function');
  assert.equal(typeof execute,'function');
  const load=part=>require(path.join(BASE,part));
  const classes=PRINTS.map(source=>{
    const ctor=dependencies[source.key]??load(source.module)[source.key];
    assert.equal(typeof ctor,'function');
    return {source,ctor};
  });
  const TrainerEffect=dependencies.TrainerEffect??
    load('game/store/effects/play-card-effects').TrainerEffect;
  const GameError=dependencies.GameError??
    load('game/game-error').GameError;
  const GameMessage=dependencies.GameMessage??
    load('game/game-message').GameMessage;
  assert.equal(typeof TrainerEffect,'function');
  assert.equal(typeof GameError,'function');
  assert.ok(GameMessage?.CANNOT_PLAY_THIS_CARD!==undefined);
  const patches=[];
  const audit={version:'agent47-conditional-ko-native-guard-v1',PINNED,
    guardedPrints:PRINTS.map(p=>p.print),
    blocksCanPlay:0,blocksEffect:0,validContinuations:0,
    uncertainBlocks:0,restored:false,noVendorEdits:true,
    qualifiedCompetitiveGames:0};
  try{
    for(const {source,ctor} of classes){
      const proto=ctor.prototype;
      const oldCan=Object.getOwnPropertyDescriptor(proto,'canPlay');
      const oldReduce=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
      assert.equal(typeof oldCan?.value,'function');
      assert.equal(typeof oldReduce?.value,'function');
      assert.ok(oldCan.configurable!==false&&oldReduce.configurable!==false);
      const can=oldCan.value,reduce=oldReduce.value;
      function patchedCanPlay(s,state,player){
        if(s!==store||!isExact(this,source))
          return can.apply(this,arguments);
        const verified=certifiedKO(tracker,state,player);
        if(!verified.eligible){
          audit.blocksCanPlay++;
          if(verified.reason==='UNCERTIFIED_TURN')audit.uncertainBlocks++;
          return false;
        }
        audit.validContinuations++;
        return can.apply(this,arguments);
      }
      function patchedReduceEffect(s,state,effect){
        if(s!==store||!isExact(this,source)||
           !(effect instanceof TrainerEffect)||effect.trainerCard!==this)
          return reduce.apply(this,arguments);
        const verified=certifiedKO(tracker,state,effect.player);
        if(!verified.eligible){
          audit.blocksEffect++;
          if(verified.reason==='UNCERTIFIED_TURN')audit.uncertainBlocks++;
          throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
        }
        audit.validContinuations++;
        return reduce.apply(this,arguments);
      }
      Object.defineProperty(proto,'canPlay',{...oldCan,value:patchedCanPlay});
      Object.defineProperty(proto,'reduceEffect',{...oldReduce,
        value:patchedReduceEffect});
      patches.push({proto,oldCan,oldReduce,patchedCanPlay,patchedReduceEffect});
    }
    return {result:execute(),audit};
  }finally{
    for(const patch of patches.reverse()){
      assert.strictEqual(patch.proto.canPlay,patch.patchedCanPlay,
        'Do not overwrite another native canPlay hook during guarded trial');
      assert.strictEqual(patch.proto.reduceEffect,patch.patchedReduceEffect,
        'Do not overwrite another native reducer hook during guarded trial');
      Object.defineProperty(patch.proto,'canPlay',patch.oldCan);
      Object.defineProperty(patch.proto,'reduceEffect',patch.oldReduce);
    }
    audit.restored=patches.every(p=>
      p.proto.canPlay===p.oldCan.value&&
      p.proto.reduceEffect===p.oldReduce.value);
  }
}

module.exports={PINNED,PRINTS,authenticatedActor,certifiedKO,
  withCertifiedLastOpponentTurnKO};
