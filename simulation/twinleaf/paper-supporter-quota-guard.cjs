'use strict';

const assert=require('node:assert/strict');

class PaperSupporterQuotaError extends Error {
  /** @param {object} violation */
  constructor(violation) {
    super('PAPER_SUPPORTER_QUOTA_VIOLATION: owner attempted an ordinary second Supporter on global turn '+violation.turn);
    this.name='PaperSupporterQuotaError';
    this.violation=violation;
  }
}

/**
 * Reversible native-root paper legality guard. This checks real PlayCardAction
 * hand instances before dispatch, while preserving every legal original action.
 * The optional allowance must be evidence-backed for a printed exceptional
 * effect; default denies a second ordinary Supporter in the same owner turn.
 *
 * A denied root intentionally throws. Callers must record the attempted root
 * and revise their owner-visible policy instead of silently substituting a
 * favorable alternative action or counting the interrupted game as a loss.
 *
 * @template T
 * @param {Function} Store Actual pinned Store class.
 * @param {number|string} supporterType TrainerType.SUPPORTER enum value.
 * @param {()=>T} execute Synchronous original game.
 * @param {{allowAdditionalSupporter?:(context:object)=>boolean,
 *          onViolation?:(violation:object)=>void}} [options]
 * @returns {{result:T,legalSupporterRoots:object[]}}
 */
function withPaperSupporterQuotaGuard(Store,supporterType,execute,options={}) {
  assert.equal(typeof execute,'function');
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof before?.value,'function');
  const allow=options.allowAdditionalSupporter??(()=>false);
  const onViolation=options.onViolation??(()=>{});
  assert.equal(typeof allow,'function');
  assert.equal(typeof onViolation,'function');
  let root=null,ordinal=0;
  const legalSupporterRoots=[];

  function guarded(action,...args) {
    if(root===null&&action?.constructor?.name==='AddPlayerAction') root=this;
    const inRoot=this===root;
    if(inRoot) ordinal++;
    const state=this.state;
    const owner=inRoot&&action?.constructor?.name==='PlayCardAction'?
      state?.players?.find(player=>player.id===action.id):null;
    const card=owner?.hand?.cards?.[action.handIndex];
    if(card?.trainerType===supporterType) {
      const context={store:this,state,owner,card,action};
      const details={
        schema:'native-paper-supporter-pre-dispatch-v1',
        rootOrdinal:ordinal,turn:state.turn,
        seat:state.players.indexOf(owner),
        actorId:owner.id,card:card.fullName,
        quotaBefore:owner.supporterTurn,
        supporterZoneCountBefore:owner.supporter.cards.length,
        handCardPhysicallyPresent:owner.hand.cards.includes(card)
      };
      if(owner.supporterTurn>=1&&!allow(context)) {
        const violation={...details,proposedAction:'PlayCardAction',
          rejectedBeforeNativeDispatch:true};
        onViolation(violation);
        throw new PaperSupporterQuotaError(violation);
      }
      const result=before.value.apply(this,[action,...args]);
      legalSupporterRoots.push({...details,returnedFromNativeDispatch:true});
      return result;
    }
    return before.value.apply(this,[action,...args]);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...before,value:guarded});
  try{return {result:execute(),legalSupporterRoots};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,guarded);
    Object.defineProperty(Store.prototype,'dispatch',before);
  }
}

module.exports={PaperSupporterQuotaError,withPaperSupporterQuotaGuard};
