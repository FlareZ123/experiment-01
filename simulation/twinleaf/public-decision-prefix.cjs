'use strict';

/**
 * Publicly visible meaning of one headless logged decision. Hidden hands,
 * Prize identities and private prompt selections are deliberately excluded.
 * @param {object} action Recorded meaningful decision.
 * @returns {object} Detached comparable record.
 */
function publicDecision(action) {
  return {
    turn:action.turnBefore,
    playerSlot:action.playerSlot,
    action:action.action,
    card:action.card??null,
    attack:action.attack??null,
    ability:action.ability??null
  };
}

/**
 * Locate the first mismatch in the FILTERED public decision projection.
 * Equality is never a proof of state, prompt, hidden-zone or RNG equality.
 * @param {object[]} source Original run's logged meaningful decisions.
 * @param {object[]} alternate Modified run's logged meaningful decisions.
 * @returns {object} First recorded public-action divergence witness.
 */
function publicDecisionDifference(source,alternate) {
  const a=source.map(publicDecision);
  const b=alternate.map(publicDecision);
  let shared=0;
  while(shared<Math.min(a.length,b.length) &&
    JSON.stringify(a[shared])===JSON.stringify(b[shared])) shared++;
  return {
    scope:'filtered public decision trace, not an authenticated full-Store prefix',
    sharedPublicDecisions:shared,
    sourceDecisionCount:a.length,
    alternateDecisionCount:b.length,
    firstDifferentIndex:shared===a.length&&shared===b.length?null:shared,
    source:a[shared]??null,alternate:b[shared]??null,
    sourceActionOrdinal:source[shared]?.actionOrdinal??null,
    alternateActionOrdinal:alternate[shared]?.actionOrdinal??null
  };
}
module.exports={publicDecision,publicDecisionDifference};
