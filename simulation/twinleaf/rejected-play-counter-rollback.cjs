'use strict';

const assert=require('node:assert/strict');

/**
 * Narrow, opt-in research-side correction for pinned Store error paths.
 *
 * In the pinned engine the turn's manual Energy or Stadium counter can be
 * written before an AttachEnergyEffect/PlayStadiumEffect throws
 * BLOCKED_BY_EFFECT. Once the Store rejects a card play while keeping the
 * physical card in the actor's hand, that attempt should not spend a
 * resource for the turn.
 *
 * Only the two turn allowance counters are restored. This is explicitly
 * NOT a general transactional state rollback. The hook applies to all
 * Stores (root and speculative) for mechanical consistency and restores
 * its original prototype descriptor after its synchronous work completes.
 *
 * @template T
 * @param {Function} Store Actual pinned Store constructor.
 * @param {()=>T} work A synchronous prepared-state or game run.
 * @returns {{result:T,evidence:object}}
 */
function withRejectedPlayCounterRollback(Store,work){
  assert.equal(typeof Store,'function');
  assert.equal(typeof work,'function');
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const evidence={
    version:'RejectedTurnCounterRollback-paper-v1',
    rejectedHandPlaysSeen:0,
    energyTurnCountersRestored:0,
    stadiumTurnCountersRestored:0,
    noCounterMutation:0,
    scope:'BLOCKED_BY_EFFECT on held original PlayCardAction; counters only'
  };

  const wrapped=function(action,...rest){
    const state=this.state;
    const actor=state?.players?.[state.activePlayer];
    const candidate=action?.constructor?.name==='PlayCardAction' &&
      actor?.id===action.id && Number.isInteger(action.handIndex)
      ? actor.hand?.cards?.[action.handIndex] : null;
    if(!candidate)return original.value.call(this,action,...rest);
    const initialEnergy=actor.energyPlayedTurn;
    const initialStadium=actor.stadiumPlayedTurn;
    try{return original.value.call(this,action,...rest);}
    catch(error){
      if(error?.message==='BLOCKED_BY_EFFECT' &&
          actor.hand.cards.includes(candidate)){
        evidence.rejectedHandPlaysSeen++;
        let changed=false;
        if(actor.energyPlayedTurn!==initialEnergy){
          actor.energyPlayedTurn=initialEnergy;
          evidence.energyTurnCountersRestored++;
          changed=true;
        }
        if(actor.stadiumPlayedTurn!==initialStadium){
          actor.stadiumPlayedTurn=initialStadium;
          evidence.stadiumTurnCountersRestored++;
          changed=true;
        }
        if(!changed)evidence.noCounterMutation++;
      }
      throw error;
    }
  };

  Object.defineProperty(Store.prototype,'dispatch',{...original,value:wrapped});
  try{return {result:work(),evidence};}
  finally{
    assert.equal(Store.prototype.dispatch,wrapped);
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

module.exports={withRejectedPlayCounterRollback};
