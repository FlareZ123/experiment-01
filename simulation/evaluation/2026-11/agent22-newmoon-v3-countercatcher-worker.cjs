'use strict';
/**
 * Experimental candidate worker overlay: exact New Moon v3 fixed 60,
 * original Agent1 v3 policy plus (a) direct Item gust into final attack when
 * already behind and (b) selfKO-enabling Counter Catcher at tied Prizes. No replay/game authorization.
 *
 * Policy input is limited to production actor-observation-v4 and native
 * action/prompt choices. Does not inspect any hidden zone.
 */
const parent=require('./agent1-newmoon-v3-finisher-slice.cjs');
const {createSlice,visiblePrintedDuoDamage}=require('./agent22-newmoon-countercatcher-actor-sequence.cjs');
const {createDirectGustSlice}=require('./agent22-newmoon-direct-countercatcher-gust.cjs');
const POLICY_VERSION='agent22-newmoon-v3-countercatcher-terminal-research-v2';
const DECK_PATH=parent.DECK_PATH,DECK_SHA=parent.DECK_SHA;
function directTerminal(v,items){
 if(!v||!Array.isArray(items)||!v.opponentPublic?.active||
    !Number.isSafeInteger(v.ownPublic?.prizeCount))return null;
 const target=v.opponentPublic.active,need=v.ownPublic.prizeCount;
 // Exact visible printing carries its known Prize value: never infer an
 // unknown Pokémon's Prize value from its HP, rule box or name substring.
 const prize=target.printing?.includes('Regidrago VSTAR')?2:
   ['Mega Lopunny ex','Mega Kangaskhan ex','Mega Absol ex',
    'Mega Dragonite ex'].some(s=>target.printing?.includes(s))?3:null;
 const lastOpponentPokemon=Array.isArray(v.opponentPublic.bench)&&
   v.opponentPublic.bench.filter(Boolean).length===0;
 if(!(prize!==null&&prize>=need||lastOpponentPokemon))return null;
 const nativeAnnotated=parent.chooseCertifiedLethal(v,items);
 if(nativeAnnotated)return {
   ...nativeAnnotated,reason:'A22_NATIVE_ANNOTATED_DIRECT_TERMINAL'};
 const own=v.ownPublic,op=v.opponentPublic;
 const nominal=visiblePrintedDuoDamage(own,op,target);
 if(!Number.isFinite(nominal)||
    !Number.isSafeInteger(target.hp)||!Number.isSafeInteger(target.damage)||
    target.hp<=target.damage||nominal<target.hp-target.damage||
    own.publicTurnRestrictions?.gxUsed!==false)return null;
 const active=own.active;
 const a=items.find(x=>x.kind==='attack'&&
   x.attackName==='Miraculous Duo-GX'&&
   x.actorPrinting===active.printing&&
   x.publicMetadata?.attackCostPayable===true&&
   x.publicMetadata.attackSource?.sourceKind==='active-pokemon'&&
   x.publicMetadata.attackSource.sourceSlot==='ACTIVE'&&
   x.publicMetadata.attackSource.sourceCardFullName===active.printing);
 return a?{decision:{kind:'select-action',token:a.token},
   reason:'A22_PRINTED_DIRECT_BASE_DAMAGE_TERMINAL_PROJECTION'}:null;
}
function supportedDirectTerminal(v,items){
 return directTerminal(v,items)!==null;
}
function createPolicy({role,seat,policyVersion,config}){
 if(role!=='candidate'||![0,1].includes(seat)||
    policyVersion!==POLICY_VERSION||!config||typeof config!=='object'||
    Array.isArray(config)||Object.keys(config).length!==0)
   throw Error('A22_NEWMOON_V3_CC_PROFILE_MISMATCH');
 const base=parent.createPolicy({role,seat,policyVersion:parent.POLICY_VERSION,config:{}});
 const seq=createSlice({seat});
 const directGust=createDirectGustSlice({seat});
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
  const hadBlast=seq.peek()!==null,hadDirectGust=directGust.peek()!==null;
  if(!hadBlast&&!hadDirectGust){
   // Already-payable damage to the current Active is strictly better than
   // burning our singleton Item, and a direct Item gust is better than
   // sacrificing Dusknoir to enable the same gust.
   if(v?.decisionKind==='owner-root'){
    const immediate=directTerminal(v,items);
    if(immediate)return withAudit(request,immediate);
   }
   const direct=directGust.decide(request);
   if(direct)return withAudit(request,direct);
   const blast=seq.decide(request);
   if(blast)return withAudit(request,blast);
  }else{
   // A started sequence cannot silently switch to an unrelated branch.
   const chosen=hadDirectGust?
     directGust.decide(request):seq.decide(request);
   if(chosen)return withAudit(request,chosen);
   const reasonCode=v?.decisionKind==='owner-root'?
     'NO_SUPPORTED_ROOT_ACTION':'UNTRUSTED_PROMPT';
   return withAudit(request,{decision:{kind:'abstain',reasonCode},
    reason:hadDirectGust?'A22_DIRECT_GUST_SEQUENCE_ABORTED':
      'A22_COUNTERCATCHER_SEQUENCE_ABORTED'});
  }
  const out=base.decideWithAudit(request);
  return {...out,policyAudit:{...out.policyAudit,policyVersion:POLICY_VERSION}};
 }
 return {decide:r=>decideWithAudit(r).decision,decideWithAudit};
}
module.exports={POLICY_VERSION,DECK_PATH,DECK_SHA,createPolicy,
 supportedDirectTerminal,directTerminal};
