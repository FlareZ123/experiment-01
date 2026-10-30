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
 *          enforceFirstPlayerSupporter?:boolean,
 *          allowFirstPlayerSupporter?:(context:object)=>boolean,
 *          onViolation?:(violation:object)=>void,
 *          onLegalSupporter?:(event:object)=>void}} [options]
 * @returns {{result:T,legalSupporterRoots:object[]}}
 */
class PaperFirstTurnSupporterError extends Error {
  /** @param {object} violation Exact native pre-dispatch identity. */
  constructor(violation) {
    super('PAPER_FIRST_TURN_SUPPORTER_VIOLATION: first player proposed '+
      violation.card+' on global turn '+violation.turn);
    this.name='PaperFirstTurnSupporterError';
    this.violation=violation;
  }
}

/**
 * Optional first-player first-turn paper gate. When enabled, a printed
 * exception must be authenticated by allowFirstPlayerSupporter; no card
 * receives an inferred exception from a name substring or native canPlay.
 * This supplements the independent ordinary once-per-turn quota veto.
 */
function withPaperSupporterQuotaGuard(Store,supporterType,execute,options={}) {
  assert.equal(typeof execute,'function');
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof before?.value,'function');
  const allow=options.allowAdditionalSupporter??(()=>false);
  const allowFirst=options.allowFirstPlayerSupporter??(()=>false);
  const enforceFirst=options.enforceFirstPlayerSupporter===true;
  const onViolation=options.onViolation??(()=>{});
  const onLegalSupporter=options.onLegalSupporter??(()=>{});
  assert.equal(typeof allow,'function');
  assert.equal(typeof allowFirst,'function');
  assert.equal(typeof onViolation,'function');
  assert.equal(typeof onLegalSupporter,'function');
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
      // The first player's first turn is global turn 1 in the pinned Store.
      // The exception callback must authorize the exact printed card;
      // engine canPlay alone is insufficient to establish a paper exception.
      if(enforceFirst&&state.turn===1&&
          state.activePlayer===state.players.indexOf(owner)&&
          !allowFirst(context)) {
        const violation={...details,
          reason:'first-player-ordinary-supporter',
          proposedAction:'PlayCardAction',
          rejectedBeforeNativeDispatch:true};
        onViolation(violation);
        throw new PaperFirstTurnSupporterError(violation);
      }
      if(owner.supporterTurn>=1&&!allow(context)) {
        const violation={...details,proposedAction:'PlayCardAction',
          rejectedBeforeNativeDispatch:true};
        onViolation(violation);
        throw new PaperSupporterQuotaError(violation);
      }
      const result=before.value.apply(this,[action,...args]);
      const accepted={...details,returnedFromNativeDispatch:true};
      legalSupporterRoots.push(accepted);
      onLegalSupporter(accepted);
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

module.exports={PaperSupporterQuotaError,PaperFirstTurnSupporterError,
  withPaperSupporterQuotaGuard};
