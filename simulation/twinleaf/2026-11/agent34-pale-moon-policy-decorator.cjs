'use strict';
const assert=require('node:assert/strict');
const {rescuePaleMoonTerminalPass,choosePaleMoonEscapeGuzmaPrompt,choosePaleMoonVSSeekerPrompt}=
  require('./agent34-pale-moon-escape.cjs');
const protocol=require('../../evaluation/2026-11/agent49-policy-protocol.cjs');

/**
 * Opt-in policy-level adapter: preserve the fully configured candidate
 * policy and its normal move ordering, and intervene ONLY at a terminal
 * policy Pass or a source-authenticated Guzma one-target prompt that would
 * otherwise abstain/choose an empty result. No native Store state is read.
 * Not installed in a frozen V3 fixture; an owner must explicitly opt in.
 */
function improveDecision(request,decision){
  if(!request || !decision || typeof decision!=='object')return decision;
  const view=request.observation;
  if(view?.decisionKind==='owner-root'&&
      decision.kind==='select-action'&&
      Array.isArray(request.actionFrontier?.items)){
    const rescue=rescuePaleMoonTerminalPass(
      view,request.actionFrontier.items,decision.token);
    if(rescue)return {kind:'select-action',token:rescue.token};
  }
  if(view?.decisionKind==='owner-prompt'&&request.prompt){
    const rescue=choosePaleMoonEscapeGuzmaPrompt(view,request.prompt) ??
      choosePaleMoonVSSeekerPrompt(view,request.prompt);
    if(!rescue)return decision;
    if(Array.isArray(rescue.tokens)){
      if(decision.kind==='select-choices'&&decision.tokens.length===1&&
         decision.tokens[0]===rescue.tokens[0])return decision;
      if(decision.kind==='abstain'||decision.kind==='select-choices'){
        return {kind:'select-choices',tokens:rescue.tokens.slice()};
      }
      return decision;
    }
    if(decision.kind==='abstain') {
      return {kind:'select-choice',token:rescue.token};
    }
    if(decision.kind==='select-choice'&&decision.token!==rescue.token){
      const old=request.prompt.choices.find(choice=>choice.token===decision.token);
      if(old?.kind==='empty-selection'){
        return {kind:'select-choice',token:rescue.token};
      }
    }
  }
  return decision;
}

function updatedAudit(audit,request,oldDecision,newDecision){
  if(audit===null)return null;
  assert.ok(audit && Array.isArray(audit.evaluations));
  const tokensOf=decision=>decision.kind==='select-choices'?
    decision.tokens:decision.kind==='select-action'||decision.kind==='select-choice'?
      [decision.token]:[];
  const oldSelected=tokensOf(oldDecision);
  const newSelected=tokensOf(newDecision);
  const source=request.prompt?request.prompt.choices:request.actionFrontier.items;
  assert.ok(newSelected.length>0&&newSelected.every(token=>
    source.some(item=>item.token===token)),
    'Pale Moon rescue must select authentic offered tokens');
  const evaluations=audit.evaluations.map(row=>{
    if(newSelected.includes(row.token)) {
      return row.status==='scored'?{...row}:{
        ...row,status:'rule-selected',score:null,
        reasonCode:'PUBLIC_PALE_MOON_EMERGENCY_RESCUE'
      };
    }
    if(oldSelected.includes(row.token)&&row.status==='rule-selected') {
      return {...row,status:'not-evaluated',score:null,
        reasonCode:'REPLACED_TERMINAL_PASS_OR_EMPTY'};
    }
    return {...row};
  });
  const result={
    ...audit,decisionType:newDecision.kind,
    selectionRuleCode:'PUBLIC_PALE_MOON_TERMINAL_ESCAPE',
    tieBreakCode:'EXACT_NATIVE_RESCUE',
    selectedTokens:newSelected,
    evaluations
  };
  protocol.validatePolicyAudit(result,request,newDecision,audit.policyVersion);
  return result;
}

function withPaleMoonTerminalEscapePolicy(policy){
  assert.ok(policy && typeof policy.decide==='function');
  return {
    ...policy,
    decide(request){
      const base=policy.decide(request);
      return improveDecision(request,base);
    },
    decideWithAudit(request){
      const base=typeof policy.decideWithAudit==='function'?
        policy.decideWithAudit(request):{decision:policy.decide(request),policyAudit:null};
      assert.ok(base && base.decision);
      const decision=improveDecision(request,base.decision);
      const unchanged=decision===base.decision;
      return unchanged?base:{
        decision,
        policyAudit:updatedAudit(base.policyAudit,request,base.decision,decision)
      };
    }
  };
}

module.exports={improveDecision,updatedAudit,withPaleMoonTerminalEscapePolicy};
