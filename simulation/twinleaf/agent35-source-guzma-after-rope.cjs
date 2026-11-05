'use strict';

const assert=require('node:assert/strict');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {publicBoth}=require('./agent7-opponent-escape-rope-after-pass.cjs');

const VERSION='agent35-source-guzma-after-rope-real-store-v1';

/**
 * A source-owned intervention on one already observed original rank6 Pass.
 * Uses owner-visible hand, public boards and turn resource quota. Native
 * prompt decisions remain unmodified and may fail to restore the attacker.
 * @param {object} view Detached owner's actual root observation.
 * @param {object} registered Precommitted third-root target.
 * @returns {{index:number,benchIndex:number}|null}
 */
function eligibleOwnerGuzma(view,registered){
  if(view?.decisionKind!=='owner-root'||
     view.globalTurn!==registered.turn||
     !Array.isArray(view.ownHand)||
     !view.ownPublic?.active||
     !Array.isArray(view.ownPublic.bench)||
     !Array.isArray(view.opponentPublic?.bench)||
     view.ownTurnResources?.supporterPlayedTurn!==0||
     view.ownTurnResources?.supporterPlayLocked!==false||
     view.ownPublic.publicTurnRestrictions?.supporterPlayLocked===true)
    return null;
  const index=view.ownHand.indexOf(registered.card);
  if(index<0)return null;
  const own=view.ownPublic.bench;
  const ownIndex=own.findIndex(slot=>
    slot?.printing===registered.proposedTargets.ownBenchedPrinting &&
    registered.proposedTargets.requiredEnergyPrintings.every(name=>
      (slot.energies??[]).includes(name)));
  if(ownIndex<0||
     !view.opponentPublic.bench.some(slot=>
       slot?.printing===registered.proposedTargets.opponentBenchedPrinting))
    return null;
  return {index,benchIndex:ownIndex};
}

/**
 * Replace exactly one genuinely selected source Pass with a physical held
 * Guzma. It does not program opponent-choice prompts, assume legality, or
 * classify a native acceptance as tactical payoff. All post-root actions
 * are made by the existing native policy and Store.
 * @template T
 * @param {()=>T} play Genuine pinned headless replay.
 * @param {object} deps Store classes and immutable registration.
 * @returns {{result:T,audit:object}}
 */
function withSourceGuzmaAfterRope(play,deps){
  assert.equal(typeof play,'function');
  const {Store,SimpleTacticsAi,GamePhase,PlayCardAction,
    PlayerType,SlotType,registration}=deps;
  const third=registration.thirdRoot;
  const originalAi=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const originalStore=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof originalAi?.value,'function');
  assert.equal(typeof originalStore?.value,'function');

  let live=null;
  const proposed=new WeakMap();
  const audit={
    schema:VERSION,registeredTurn:third.turn,registeredSeat:third.ownerSeat,
    eligiblePassRoots:0,selected:0,accepted:0,rejected:0,
    selectedReceipt:null,settledActionTail:[],qualifiedGames:0
  };
  function ai(state,...args){
    const seat=state?.activePlayer;
    const player=state?.players?.[seat];
    if(!(live&&state===live.state&&
         state.phase===GamePhase.PLAYER_TURN&&
         seat===third.ownerSeat&&
         player?.id===this.client?.id&&
         !state.prompts.some(p=>p.result===undefined)))
      return originalAi.value.call(this,state,...args);

    const baseline=originalAi.value.call(this,state,...args);
    if(state.turn!==third.turn||
       baseline?.constructor?.name!==third.originalAction)
      return baseline;
    const view=actorObservation(state,seat);
    const eligible=eligibleOwnerGuzma(view,third);
    if(!eligible||audit.selected!==0)return baseline;
    audit.eligiblePassRoots++;
    const action=new PlayCardAction(player.id,eligible.index,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    const receipt={
      ownerSeat:seat,globalTurn:state.turn,card:third.card,
      handIndex:eligible.index,registeredBenchIndex:eligible.benchIndex,
      originalAction:baseline.constructor.name,
      proposedAction:action.constructor.name,
      before:publicBoth(state,seat),outcome:'awaiting-dispatch'
    };
    audit.selected++;
    audit.selectedReceipt=receipt;
    proposed.set(action,receipt);
    return action;
  }
  function dispatch(action,...args){
    const receipt=proposed.get(action);
    const tracked=live===this&&audit.selected>0;
    const before=tracked?publicBoth(this.state,third.ownerSeat):null;
    let output;
    try{output=originalStore.value.call(this,action,...args);}
    catch(err){
      if(receipt){receipt.outcome='native-rejected';audit.rejected++;}
      if(tracked&&audit.settledActionTail.length<110)
        audit.settledActionTail.push({
          kind:action?.constructor?.name??null,
          turnBefore:before?.turn??null,storeError:true
        });
      throw err;
    }
    if(!live&&action?.constructor?.name==='AddPlayerAction'&&
       this.state.players?.length===1&&
       this.state.players[0].id===101)live=this;
    if(receipt){
      receipt.outcome='native-accepted';
      receipt.after=publicBoth(this.state,third.ownerSeat);
      audit.accepted++;
    }
    if(tracked&&audit.settledActionTail.length<110)
      audit.settledActionTail.push({
        kind:action?.constructor?.name??null,
        beforeTurn:before.turn,afterTurn:this.state.turn,
        publicAfter:publicBoth(this.state,third.ownerSeat)
      });
    return output;
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...originalAi,value:ai
  });
  Object.defineProperty(Store.prototype,'dispatch',{
    ...originalStore,value:dispatch
  });
  try{return {result:play(),audit};}
  catch(error){error.agent35GuzmaAudit=audit;throw error;}
  finally{
    Object.defineProperty(Store.prototype,'dispatch',originalStore);
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',originalAi);
  }
}

module.exports={VERSION,eligibleOwnerGuzma,withSourceGuzmaAfterRope};
