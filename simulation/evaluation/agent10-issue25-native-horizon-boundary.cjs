'use strict';

const assert=require('node:assert/strict');

const VERSION='agent10-issue25-native-horizon-boundary-v1';

/**
 * Classify exactly what the last published accepted action establishes.
 * A bounded native action ledger is not a completed attack or paper game.
 * @param {object} attempt A saved actual selected-v3 receipt attempt.
 * @param {number} limit The actually selected native action count cap.
 * @returns {object}
 */
function nativeHorizonBoundary(attempt,limit){
  assert.ok(attempt&&typeof attempt==='object');
  assert.ok(Number.isSafeInteger(limit)&&limit>0);
  const actions=attempt.publicRootActions;
  const count=attempt.nativeRootActionCount;
  assert.ok(Number.isSafeInteger(count)&&count>=0&&count<=limit);
  const base={id:attempt.id??null,status:attempt.status??null,
    nativeAcceptedRoots:count,limit,finished:attempt.finished===true,
    completeRootHistoryAvailable:Array.isArray(actions)&&
      actions.length===count&&attempt.publicRootActionsTruncated!==true};
  if(!base.completeRootHistoryAvailable)
    return {...base,boundary:'UNRESOLVED_MISSING_ROOT_HISTORY',
      afterAcceptedRoot:null,initiatingRoot:null,turnTransitionObserved:null};
  if(attempt.status==='engine-error')
    return {...base,boundary:'NATIVE_ENGINE_ABORT',
      afterAcceptedRoot:actions.at(-1)??null,
      initiatingRoot:null,turnTransitionObserved:null};
  if(attempt.finished===true)
    return {...base,boundary:'NATIVE_TERMINAL_UNQUALIFIED',
      afterAcceptedRoot:actions.at(-1)??null,
      initiatingRoot:null,turnTransitionObserved:null};
  if(count<limit)
    return {...base,boundary:'NONTERMINAL_EARLY_RETURN',
      afterAcceptedRoot:actions.at(-1)??null,
      initiatingRoot:null,turnTransitionObserved:null};
  const last=actions.at(-1)??null;
  if(last===null)
    return {...base,boundary:'EMPTY_LEDGER_AT_HORIZON',
      afterAcceptedRoot:last,initiatingRoot:null,
      turnTransitionObserved:null};
  const ref=last.initiatingRootActionOrdinal;
  const initiatingRoot=Number.isSafeInteger(ref)?
    actions.find(row=>row.actionOrdinal===ref)??null:null;
  const turnTransitionObserved=
    Number.isSafeInteger(last.turnBefore)&&
    Number.isSafeInteger(last.turnAfter)?
    last.turnAfter>last.turnBefore:null;
  let boundary='CAPPED_AFTER_OTHER_ACTION';
  if(last.action==='ResolvePromptAction'&&
     initiatingRoot?.action==='AttackAction')
    boundary='CAPPED_INSIDE_ATTACK_PROMPT_CHAIN';
  else if(last.action==='PassTurnAction'&&
    turnTransitionObserved===false)
    boundary='CAPPED_AFTER_PASS_BEFORE_OBSERVED_TURN_TRANSITION';
  else if(last.action==='ResolvePromptAction'&&
    initiatingRoot?.action==='PassTurnAction'&&
    turnTransitionObserved===true)
    boundary='CAPPED_AT_POST_PASS_TURN_TRANSITION';
  else if(last.action==='ResolvePromptAction')
    boundary='CAPPED_AFTER_PROMPT_OR_WAIT';
  else if(last.action==='AttackAction')
    boundary='CAPPED_IMMEDIATELY_AFTER_ATTACK_ROOT';
  return {...base,boundary,afterAcceptedRoot:last,
    initiatingRoot,turnTransitionObserved};
}

/**
 * Summarize the budget consumed by native prompts, waits and game decisions.
 * These counts are not independently qualified strategic opportunities.
 * @param {object} receipt A full saved selected-v3 machine receipt.
 * @returns {object}
 */
function auditSelectedNativeHorizon(receipt){
  const attempts=receipt?.attempts;
  const limit=receipt?.selectedExecutingManifest?.nativeRootActionLimit;
  assert.ok(Array.isArray(attempts)&&attempts.length>0);
  assert.ok(Number.isSafeInteger(limit)&&limit>0);
  const rows=attempts.map(row=>{
    const boundary=nativeHorizonBoundary(row,limit);
    const actions=row.publicRootActions;
    if(!boundary.completeRootHistoryAvailable)
      return {...boundary,practicalActions:null,promptActions:null,
        waitPromptActions:null,passActions:null};
    const prompts=actions.filter(x=>x.action==='ResolvePromptAction');
    const passes=actions.filter(x=>x.action==='PassTurnAction');
    const practical=actions.filter(x=>x.action!=='ResolvePromptAction'&&
      x.action!=='PassTurnAction');
    return {...boundary,practicalActions:practical.length,
      promptActions:prompts.length,
      waitPromptActions:prompts.filter(x=>
        x.pendingPrompt==='WaitPrompt').length,
      passActions:passes.length,
      promptBudgetFraction:prompts.length+'/'+actions.length};
  });
  return {schema:VERSION,selectedNativeActionLimit:limit,
    rows,qualifiesForCompetitiveInference:false,competitiveGamesQualified:0};
}
module.exports={VERSION,nativeHorizonBoundary,auditSelectedNativeHorizon};
