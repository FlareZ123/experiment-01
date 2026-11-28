'use strict';
/**
 * Research-only, one-root New Moon tactical arbiter for exact fixed v3-v9.
 * Evaluates only caller-exposed actor-certified same-fingerprint branches.
 *
 * Crucial ordering: a certified *game-winning* action outranks an ordinary
 * knockout, even when the latter avoids Dusknoir's self-KO. Among actual
 * terminal branches prefer the no-self-KO finish. Without an actual terminal,
 * retain no-self-KO / funded damage / development precedence.
 *
 * No action is executed. Native workers must reobserve legality, source,
 * pricing, prompts, KO resolution, opponent promotion and Prize state after
 * EVERY proposed continuation. Partial/unknown higher-ranked branch state
 * blocks lower-priority proposals rather than pretending absence.
 */
const {fairyZoneNoSelfKoPriority}=require('./new-moon-fairyzone-no-selfko-priority-gate.cjs');
const {analyzeDusknoirFinisher}=require('./new-moon-dusknoir-actor-finisher-gate.cjs');
const {terminalCursedBlast}=require('./new-moon-dusknoir-terminal-ability-gate.cjs');
const {counterCatcherAfterSelfKo}=require('./new-moon-countercatcher-after-selfko-finisher.cjs');
const {assessRondoAfterBlast,assessDragonRondoAfterBlast}=
 require('./new-moon-thorns-postblast-rondo-actor-gate.cjs');
const {eligibleRoot}=require('./new-moon-guzma-hala-actor-opportunity-gate.cjs');

const branches=Object.freeze([
 {key:'fairyZoneDirect',rank:0,fn:fairyZoneNoSelfKoPriority,
  offers:['priority-no-self-ko']},
 {key:'duskTerminalBlast',rank:1,fn:terminalCursedBlast,
  offers:['terminal-candidate']},
 {key:'duskCounterCatcher',rank:2,fn:counterCatcherAfterSelfKo,
  offers:['terminal-candidate']},
 {key:'duskExactAttack',rank:3,fn:analyzeDusknoirFinisher,
  offers:['candidate']},
 {key:'duskDragonRondo',rank:4,fn:assessDragonRondoAfterBlast,
  offers:['candidate']},
 {key:'duskThornsRondo',rank:5,fn:assessRondoAfterBlast,
  offers:['candidate']},
 {key:'guzmaHala',rank:6,fn:eligibleRoot,
  offers:['candidate']}
]);
function isTerminal(branch,result){
 return result.status==='terminal-candidate'||
  result.terminalAfterAttack===true||
  result.projected?.ownPrizesAfterAttack===0;
}
function compareNewMoonTurn(view){
 if(!view||typeof view!=='object'||
    typeof view.actorStateFingerprint!=='string'||
    !view.actorStateFingerprint.length||!view.branchContexts||
    typeof view.branchContexts!=='object'||
    Array.isArray(view.branchContexts))
   return {status:'unsupported',reason:'NO_COMMON_NATIVE_ACTOR_STATE_FINGERPRINT'};
 const outputs=[],unresolved=[],available=[];
 for(const branch of branches){
   const source=view.branchContexts[branch.key];
   if(source===undefined||source===null){
     outputs.push({branch:branch.key,status:'inapplicable',
       reason:'NOT_EXPOSED_AT_THIS_ROOT'});
     continue;
   }
   if(typeof source!=='object'||Array.isArray(source))
     return {status:'unsupported',reason:'NON_OBJECT_BRANCH_STATE',
       branch:branch.key};
   let result;
   try{result=branch.fn(source);}catch(e){
     return {status:'unsupported',reason:'BRANCH_GATE_THROW',
       branch:branch.key};
   }
   if(!result||typeof result.status!=='string')
     return {status:'unsupported',reason:'INVALID_BRANCH_GATE_OUTPUT',
       branch:branch.key};
   const terminal=branch.offers.includes(result.status)&&
     isTerminal(branch,result);
   outputs.push({branch:branch.key,status:result.status,
     reason:result.reason,terminal});
   if(result.status==='unsupported')
     unresolved.push({key:branch.key,rank:branch.rank});
   if(branch.offers.includes(result.status))
     available.push({branch,result,terminal});
 }
 if(!available.length){
   if(unresolved.length)
     return {status:'unsupported',reason:'BRANCHES_UNCERTIFIED',
       unresolved:unresolved.map(x=>x.key),evaluations:outputs};
   return {status:'none',reason:'NO_CERTIFIED_TACTICAL_BRANCH',
     evaluations:outputs};
 }
 // Win this game now when a terminal branch exists; otherwise preserve the
 // no-selfKO > selfKO+attack > setup order. All branches draw from one root.
 available.sort((a,b)=>Number(b.terminal)-Number(a.terminal)||
   a.branch.rank-b.branch.rank);
 const selected=available[0],branch=selected.branch,result=selected.result;
 const higherUnresolved=unresolved.find(x=>x.rank<branch.rank);
 if(higherUnresolved)
   return {status:'unsupported',reason:'HIGHER_PRIORITY_BRANCH_UNCERTIFIED',
     firstUnresolvedBranch:higherUnresolved.key,tentative:branch.key,
     evaluations:outputs};
 return {
   status:'candidate',branch:branch.key,
   firstAction:typeof result.firstAction==='string'?
     {type:result.firstAction,name:result.name,
      discardIntents:result.discardIntents||[]}:
     result.firstAction,
   continuation:result.conditionalContinuation||result.continuation||null,
   actorStateFingerprint:view.actorStateFingerprint,
   revalidateAfterEachAction:true,reason:result.reason,
   priority:branch.rank,gameTerminalProposed:selected.terminal,
   entry:result,evaluations:outputs,
   condition:'No native turn or opponent response was executed; root proposal only.'
 };
}
module.exports={compareNewMoonTurn,branches};
