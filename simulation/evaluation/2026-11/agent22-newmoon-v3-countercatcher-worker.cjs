'use strict';
/**
 * Experimental candidate worker overlay: exact New Moon v3 fixed 60,
 * original Agent1 v3 policy plus a separate, actor-source-bound post-selfKO
 * Counter Catcher terminal continuation. No replay/game authorization.
 *
 * Policy input is limited to production actor-observation-v4 and native
 * action/prompt choices. Does not inspect any hidden zone.
 */
const parent=require('./agent1-newmoon-v3-finisher-slice.cjs');
const {createSlice}=require('./agent22-newmoon-countercatcher-actor-sequence.cjs');
const POLICY_VERSION='agent22-newmoon-v3-postselfko-countercatcher-research-v1';
const DECK_PATH=parent.DECK_PATH,DECK_SHA=parent.DECK_SHA;
function supportedDirectTerminal(v,items){
 if(!v||!Array.isArray(items)||!v.opponentPublic?.active||
    !Number.isSafeInteger(v.ownPublic?.prizeCount))return false;
 const target=v.opponentPublic.active,need=v.ownPublic.prizeCount;
 // Only when the observable target's identity independently certifies its
 // exact Prize value; never infer unknown Rule Box values from HP alone.
 const prize=target.printing?.includes('Regidrago VSTAR')?2:
   target.printing?.includes('Mega Lopunny ex')||
   target.printing?.includes('Mega Kangaskhan ex')?3:null;
 const lastOpponentPokemon=Array.isArray(v.opponentPublic.bench)&&
   v.opponentPublic.bench.filter(Boolean).length===0;
 return (prize!==null&&prize>=need||lastOpponentPokemon)&&
   !!parent.chooseCertifiedLethal(v,items);
}
function createPolicy({role,seat,policyVersion,config}){
 if(role!=='candidate'||![0,1].includes(seat)||
    policyVersion!==POLICY_VERSION||!config||typeof config!=='object'||
    Array.isArray(config)||Object.keys(config).length!==0)
   throw Error('A22_NEWMOON_V3_CC_PROFILE_MISMATCH');
 const base=parent.createPolicy({role,seat,policyVersion:parent.POLICY_VERSION,config:{}});
 const seq=createSlice({seat});
 function withAudit(request,action){
  const decision=action.decision;
  const all=request?.prompt?.choices??request?.actionFrontier?.items??[];
  const selected=decision.token?[decision.token]:decision.tokens??[];
  return {decision,policyAudit:{
   schema:'agent6-policy-audit-v1',policyVersion:POLICY_VERSION,
   decisionKind:request?.observation?.decisionKind??'unknown',
   decisionType:decision.kind,selectionRuleCode:action.reason,
   tieBreakCode:'NONE',selectedTokens:selected,
   evaluations:all.map(i=>({
    token:i.token,status:selected.includes(i.token)?'rule-selected':'not-evaluated',
    score:null,reasonCode:selected.includes(i.token)?
      action.reason:'A22_COUNTERCATCHER_NONSELECTED'
   }))
  }};
 }
 function decideWithAudit(request){
  const v=request?.observation,items=request?.actionFrontier?.items;
  const hadSequence=seq.peek()!==null;
  if(!hadSequence&&v?.decisionKind==='owner-root'&&
     supportedDirectTerminal(v,items)){
    const direct=parent.chooseCertifiedLethal(v,items);
    if(direct)return withAudit(request,{
      ...direct,reason:'A22_DIRECT_NO_SELFKO_TERMINAL_PRIORITY'});
  }
  const action=seq.decide(request);
  if(action)return withAudit(request,action);
  if(hadSequence){
   // If any required native stage was rejected, abstain instead of
   // letting a different partial policy silently consume an action or prompt.
   const reasonCode=v?.decisionKind==='owner-root'?
     'NO_SUPPORTED_ROOT_ACTION':'UNTRUSTED_PROMPT';
   return withAudit(request,{decision:{kind:'abstain',reasonCode},
    reason:'A22_COUNTERCATCHER_SEQUENCE_ABORTED'});
  }
  const out=base.decideWithAudit(request);
  return {...out,policyAudit:{...out.policyAudit,policyVersion:POLICY_VERSION}};
 }
 return {decide:r=>decideWithAudit(r).decision,decideWithAudit};
}
module.exports={POLICY_VERSION,DECK_PATH,DECK_SHA,createPolicy,
 supportedDirectTerminal};
