'use strict';

const assert=require('node:assert/strict');
const {actorObservation,publicPlayer}=
  require('./actor-observation-contract.cjs');
const VERSION='agent7-authentic-opponent-escape-rope-after-pass-native-v1';

/** @param {object} state @param {0|1} ownerSeat */
function publicBoth(state,ownerSeat){
  const rows=state.players.map(player=>{
    const p=publicPlayer(player);
    const creature=pokemon=>pokemon?{
      printing:pokemon.printing,
      hp:pokemon.hp,
      damage:pokemon.damage,
      energies:pokemon.energies,
      tools:pokemon.tools
    }:null;
    return {
      active:creature(p.active),
      bench:p.bench.map(creature),
      stadium:p.stadium,
      discard:p.discard,
      lostZone:p.lostZone,
      prizes:p.prizeCount,
      handCount:p.handCount,
      deckCount:p.deckCount
    };
  });
  return {
    turn:state.turn,activePlayer:state.activePlayer,
    ownerSeat,players:rows
  };
}

/**
 * Real Store physical opponent Item counter, selected once at registered
 * source11 true native Pass after other wrapper's prior selected Stadium turn.
 * All eligibility comes from detached actor-own hand and both public boards.
 * Pinned native Pass may still use incompetent speculative tactics; that
 * baseline is unchanged between paired arms.
 *
 * @template T
 * @param {()=>T} play Genuine original seeded headless run.
 * @param {object} deps Pinned native types plus preregistered opponent source.
 * @returns {{result:T,audit:object}}
 */
function withOpponentRopeAfterPass(play,deps){
  assert.equal(typeof play,'function');
  const {Store,SimpleTacticsAi,GamePhase,PlayCardAction,
    PlayerType,SlotType,registration}=deps;
  const item=registration.opponentCounter;
  const proto=SimpleTacticsAi.prototype;
  const sp=Store.prototype;
  const priorAi=Object.getOwnPropertyDescriptor(proto,'decodeNextAction');
  const priorStore=Object.getOwnPropertyDescriptor(sp,'dispatch');
  assert.equal(typeof priorAi?.value,'function');
  assert.equal(typeof priorStore?.value,'function');
  const proposed=new WeakMap();
  let live=null;
  const audit={
    version:VERSION,sourceRegistration:registration.schema,
    expectedItemPrinting:item.heldItem,
    registeredTargetTurn:item.turn,
    authenticOpponentPassesAtTarget:0,
    itemEligibleAtTarget:0,
    selected:0,
    accepted:0,
    nativeRejects:0,
    candidateRoots:[],
    selectedReceipt:null,
    settledActionTail:[],
    competitiveQualifiedGames:0
  };
  function trackedAi(state,...args){
    const seat=state?.activePlayer;
    const player=state?.players?.[seat];
    const real=live&&state===live.state&&
      seat===item.seat&&
      player?.id===this.client?.id&&
      state.phase===GamePhase.PLAYER_TURN&&
      !state.prompts.some(p=>p.result===undefined);
    if(!real)return priorAi.value.call(this,state,...args);
    const view=actorObservation(state,seat);
    const original=priorAi.value.call(this,state,...args);
    if(view.globalTurn!==item.turn)return original;
    if(original?.constructor?.name!=='PassTurnAction')return original;
    audit.authenticOpponentPassesAtTarget++;
    const index=view.ownHand.indexOf(item.heldItem);
    const ownerBench=view.ownPublic.bench.filter(Boolean).length;
    const otherBench=view.opponentPublic.bench.filter(Boolean).length;
    const eligible=
      view.ownTurnResources.itemPlayLocked===false&&
      index>=0&&ownerBench>=item.requiredOwnBenchAtLeast&&
      otherBench>=item.requiredOpponentBenchAtLeast;
    const root={
      seat,turn:view.globalTurn,nativeAction:'PassTurnAction',
      availableHandIndex:index,
      ownBenchCount:ownerBench,opponentBenchCount:otherBench,
      itemPlayLocked:view.ownTurnResources.itemPlayLocked,
      eligible,selected:false
    };
    audit.candidateRoots.push(root);
    if(!eligible||audit.selected>0)return original;
    audit.itemEligibleAtTarget++;
    const action=new PlayCardAction(player.id,index,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    audit.selected++;
    root.selected=true;
    const receipt={
      seat,turn:view.globalTurn,handIndex:index,
      printing:item.heldItem,originalNative:'PassTurnAction',
      replacingAction:'PlayCardAction',
      before:publicBoth(state,seat),
      outcome:'not-dispatched'
    };
    audit.selectedReceipt=receipt;
    proposed.set(action,receipt);
    return action;
  }
  function trackedStore(action,...args){
    const receipt=proposed.get(action);
    const actionName=action?.constructor?.name??null;
    const real=live===this;
    const before=real&&audit.selected>0?
      publicBoth(this.state,item.seat):null;
    let output;
    try{
      output=priorStore.value.call(this,action,...args);
    }catch(error){
      if(receipt){
        receipt.outcome='native-rejected';
        receipt.error=String(error?.message??error);
        audit.nativeRejects++;
      }
      if(real&&before&&audit.settledActionTail.length<100){
        audit.settledActionTail.push({
          action:actionName,fromTurn:before.turn,
          error:String(error?.message??error)
        });
      }
      throw error;
    }
    if(!live&&actionName==='AddPlayerAction'&&
       this.state.players?.length===1&&
       this.state.players[0].id===101)live=this;
    if(receipt){
      receipt.outcome='native-accepted';
      receipt.after=publicBoth(this.state,item.seat);
      receipt.itemInOwnerDiscard=receipt.after.players[item.seat]
        .discard.includes(item.heldItem);
      audit.accepted++;
    }
    if(real&&before&&audit.settledActionTail.length<100){
      audit.settledActionTail.push({
        action:actionName,fromTurn:before.turn,
        toTurn:this.state.turn,
        public:publicBoth(this.state,item.seat)
      });
    }
    return output;
  }
  Object.defineProperty(proto,'decodeNextAction',{
    ...priorAi,value:trackedAi
  });
  Object.defineProperty(sp,'dispatch',{
    ...priorStore,value:trackedStore
  });
  try{
    return {result:play(),audit};
  }catch(error){
    error.agent7RopeAudit=audit;
    throw error;
  }finally{
    Object.defineProperty(sp,'dispatch',priorStore);
    Object.defineProperty(proto,'decodeNextAction',priorAi);
  }
}

module.exports={VERSION,publicBoth,withOpponentRopeAfterPass};
