'use strict';

const assert=require('node:assert/strict');

/**
 * Opt-in owner-visible Supporter proposal policy. The pinned tactic treats
 * player.supporterTurn as a global turn marker, while the Store reducer
 * increments it as a number of Supporters already resolved this owner turn.
 * This research-owned wrapper skips proposing ordinary additional Supporters
 * after a positive quota; it never reads opponent concealed zones.
 *
 * This is decision filtering, so a native pre-dispatch paper-rule veto must
 * still run independently to catch actions from other tactics or hooks.
 *
 * @template T
 * @param {Function} PlaySupporterTactic Actual pinned tactic class.
 * @param {()=>T} execute Synchronous original game.
 * @param {{allowAdditionalSupporter?:(context:object)=>boolean,
 *          onSuppressed?:(record:object)=>void}} [options]
 * @returns {{result:T,suppressedCalls:object[],version:string}}
 */
function withOwnerVisibleSupporterQuotaProposals(PlaySupporterTactic,execute,
  options={}) {
  assert.equal(typeof execute,'function');
  const original=Object.getOwnPropertyDescriptor(
    PlaySupporterTactic.prototype,'useTactic');
  assert.equal(typeof original?.value,'function');
  const allow=options.allowAdditionalSupporter??(()=>false);
  const onSuppressed=options.onSuppressed??(()=>{});
  assert.equal(typeof allow,'function');
  assert.equal(typeof onSuppressed,'function');
  const suppressedCalls=[];
  let suppressionCount=0;

  function constrained(state,owner) {
    const quota=owner.supporterTurn;
    if(Number.isInteger(quota)&&quota>0&&
      !allow({state,owner,quota})) {
      const entry={
        schema:'owner-visible-supporter-proposal-quota-v1',
        globalTurn:state.turn,
        actorId:owner.id,seat:state.players.indexOf(owner),
        priorSupporterCount:quota,
        ownerHeldSupporters:owner.hand.cards.filter(card=>
          card.trainerType===7).map(card=>card.fullName),
        suppressesOnlyThisTactic:true
      };
      suppressionCount++;
      if(suppressedCalls.length<64) suppressedCalls.push(entry);
      onSuppressed(entry);
      return undefined;
    }
    return original.value.call(this,state,owner);
  }

  Object.defineProperty(PlaySupporterTactic.prototype,'useTactic',{
    ...original,value:constrained
  });
  try{
    const result=execute();
    return {result,suppressedCalls,suppressionCount,
      version:'owner-visible-supporter-proposal-quota-v1'};
  } finally {
    assert.strictEqual(PlaySupporterTactic.prototype.useTactic,constrained);
    Object.defineProperty(PlaySupporterTactic.prototype,'useTactic',original);
  }
}
module.exports={withOwnerVisibleSupporterQuotaProposals};
